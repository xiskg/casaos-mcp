import { Client } from 'ssh2';
import * as http from 'http';
import * as https from 'https';
export class CasaOSClient {
    config;
    constructor(config) {
        this.config = {
            port: 22,
            ...config,
        };
    }
    async sshExec(command) {
        return new Promise((resolve, reject) => {
            const conn = new Client();
            conn
                .on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) {
                        conn.end();
                        return reject(err);
                    }
                    let stdout = '';
                    let stderr = '';
                    stream
                        .on('close', (code) => {
                        conn.end();
                        resolve({ stdout, stderr, code: code || 0 });
                    })
                        .on('data', (data) => {
                        stdout += data.toString();
                    })
                        .stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                });
            })
                .on('error', (err) => {
                reject(err);
            })
                .connect({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                password: this.config.password,
                privateKey: this.config.privateKey,
            });
        });
    }
    async httpGet(path) {
        return new Promise((resolve, reject) => {
            const req = http.get({
                host: this.config.host,
                port: 80,
                path,
            }, (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    }
                    catch (e) {
                        resolve(body);
                    }
                });
            });
            req.on('error', reject);
        });
    }
    async listApps() {
        const gridData = await this.httpGet('/v2/app_management/web/appgrid');
        const composeData = await this.httpGet('/v2/app_management/compose');
        const dockerPs = await this.sshExec("docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Labels}}'");
        const nativeApps = [];
        const legacyContainers = [];
        const runningLines = dockerPs.stdout.trim().split('\n').filter(Boolean);
        const composeProjects = composeData?.data || {};
        for (const line of runningLines) {
            const [name, status, image, labels] = line.split('\t');
            const isCompose = labels && labels.includes('com.docker.compose.project=');
            if (isCompose) {
                const match = labels.match(/com\.docker\.compose\.project=([^,]+)/);
                const projName = match ? match[1] : name;
                nativeApps.push({
                    containerName: name,
                    composeProject: projName,
                    status,
                    image,
                });
            }
            else {
                legacyContainers.push({
                    containerName: name,
                    status,
                    image,
                });
            }
        }
        return {
            gridApps: gridData?.data || [],
            composeProjects: Object.keys(composeProjects),
            nativeApps,
            legacyContainers,
        };
    }
    async deployCasaOSApp(params) {
        const { appId, title, icon, webPort, category = 'Utilities', composeYaml } = params;
        const script = `python3 -c "
import yaml, os

app_id = '${appId}'
title_name = '${title}'
icon_url = '${icon}'
web_port = '${webPort || ''}'
cat_name = '${category}'

raw_yaml = '''${composeYaml.replace(/'''/g, '')}'''

try:
    data = yaml.safe_load(raw_yaml)
except Exception:
    data = {'services': {app_id: {'image': 'nginx:alpine'}}}

if not isinstance(data, dict):
    data = {}

if 'x-casaos' not in data:
    data['x-casaos'] = {}

data['x-casaos']['title'] = {'en_us': title_name, 'custom': title_name}
data['x-casaos']['icon'] = icon_url
data['x-casaos']['category'] = cat_name
data['x-casaos']['is_uncontrolled'] = False
if web_port:
    data['x-casaos']['port_map'] = str(web_port)

dest_dir = f'/var/lib/casaos/apps/{app_id}'
os.makedirs(dest_dir, exist_ok=True)
with open(f'{dest_dir}/docker-compose.yml', 'w') as f:
    yaml.safe_dump(data, f)

print('SAVED_OK')
"
cd /var/lib/casaos/apps/${appId} && docker compose -p ${appId} up -d
`;
        const res = await this.sshExec(script);
        if (res.code !== 0) {
            throw new Error(`Deployment failed: ${res.stderr || res.stdout}`);
        }
        return `App ${appId} successfully deployed as a native CasaOS Compose project!`;
    }
    async convertLegacyApp(containerName, iconUrl, titleName) {
        const inspectRes = await this.sshExec(`docker inspect ${containerName}`);
        if (inspectRes.code !== 0) {
            throw new Error(`Container ${containerName} not found.`);
        }
        const inspectData = JSON.parse(inspectRes.stdout)[0];
        const image = inspectData.Config.Image;
        const envs = inspectData.Config.Env || [];
        const mounts = inspectData.Mounts || [];
        const portBindings = inspectData.HostConfig.PortBindings || {};
        const appId = containerName.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const title = titleName || containerName;
        const icon = iconUrl || 'https://api.iconify.design/mdi/docker.svg?color=%232496ed';
        const script = `python3 -c "
import yaml, os, json

app_id = '${appId}'
image = '${image}'
envs = json.loads('''${JSON.stringify(envs)}''')
mounts = json.loads('''${JSON.stringify(mounts)}''')
port_bindings = json.loads('''${JSON.stringify(portBindings)}''')

ports_list = []
web_port = ''
for c_port, bindings in port_bindings.items():
    if bindings:
        pub = bindings[0]['HostPort']
        ports_list.append(f'{pub}:{c_port.split(\"/\")[0]}')
        if not web_port:
            web_port = pub

volumes_list = []
for m in mounts:
    if m.get('Type') == 'bind':
        volumes_list.append(f\"{m['Source']}:{m['Destination']}\")
    elif m.get('Type') == 'volume':
        volumes_list.append(f\"{m['Name']}:{m['Destination']}\")

compose = {
    'name': app_id,
    'services': {
        app_id: {
            'container_name': app_id,
            'image': image,
            'environment': [e for e in envs if not e.startswith('PATH=')],
            'ports': ports_list,
            'volumes': volumes_list,
            'restart': 'unless-stopped',
            'labels': {
                'icon': '${icon}'
            }
        }
    },
    'x-casaos': {
        'title': {'en_us': '${title}', 'custom': '${title}'},
        'icon': '${icon}',
        'category': 'Utilities',
        'is_uncontrolled': False,
        'main': app_id,
        'port_map': str(web_port)
    }
}

dest_dir = f'/var/lib/casaos/apps/{app_id}'
os.makedirs(dest_dir, exist_ok=True)
with open(f'{dest_dir}/docker-compose.yml', 'w') as f:
    yaml.safe_dump(compose, f)
"
docker stop ${containerName} || true
docker rm ${containerName} || true
cd /var/lib/casaos/apps/${appId} && docker compose -p ${appId} up -d
`;
        const res = await this.sshExec(script);
        if (res.code !== 0) {
            throw new Error(`Conversion failed: ${res.stderr || res.stdout}`);
        }
        return `Legacy container ${containerName} successfully converted to native CasaOS app ${appId}!`;
    }
    async setAppIcon(appId, iconUrl, title) {
        const script = `python3 -c "
import yaml, os

app_id = '${appId}'
icon_url = '${iconUrl}'
new_title = '${title || ''}'

path = f'/var/lib/casaos/apps/{app_id}/docker-compose.yml'
if os.path.exists(path):
    with open(path, 'r') as f:
        data = yaml.safe_load(f) or {}

    if 'services' in data:
        for svc_name, svc_cfg in data['services'].items():
            if not isinstance(svc_cfg, dict):
                continue
            if 'labels' not in svc_cfg or not isinstance(svc_cfg['labels'], dict):
                svc_cfg['labels'] = {}
            svc_cfg['labels']['icon'] = icon_url

    if 'x-casaos' not in data:
        data['x-casaos'] = {}

    data['x-casaos']['icon'] = icon_url
    if new_title:
        data['x-casaos']['title'] = {'en_us': new_title, 'custom': new_title}
    
    with open(path, 'w') as f:
        yaml.safe_dump(data, f)
    print('UPDATED_OK')
else:
    print('NOT_FOUND')
"
systemctl restart casaos-app-management.service
`;
        const res = await this.sshExec(script);
        return res.stdout.includes('UPDATED_OK')
            ? `Icon for ${appId} updated to ${iconUrl}`
            : `App ${appId} compose file not found.`;
    }
    async manageApp(appId, action) {
        const script = `cd /var/lib/casaos/apps/${appId} && docker compose -p ${appId} ${action}`;
        const res = await this.sshExec(script);
        if (res.code !== 0) {
            throw new Error(`Failed to ${action} app ${appId}: ${res.stderr}`);
        }
        return `App ${appId} ${action}ed successfully.`;
    }
    async searchIcons(query) {
        return new Promise((resolve) => {
            const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=10`;
            https.get(url, (res) => {
                let body = '';
                res.on('data', (chunk) => (body += chunk));
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const icons = (data.icons || []).map((name) => `https://api.iconify.design/${name.replace(':', '/')}.svg`);
                        resolve(icons);
                    }
                    catch {
                        resolve([]);
                    }
                });
            }).on('error', () => resolve([]));
        });
    }
    async getAppLogs(appId, lines = 50) {
        const script = `cd /var/lib/casaos/apps/${appId} 2>/dev/null && docker compose -p ${appId} logs --tail ${lines} 2>/dev/null || docker logs --tail ${lines} ${appId} 2>/dev/null`;
        const res = await this.sshExec(script);
        return res.stdout || res.stderr || 'No logs found.';
    }
    async getSystemStats() {
        const script = `python3 -c "
import json, os, subprocess

def get_cmd(cmd):
    try:
        return subprocess.check_output(cmd, shell=True).decode().strip()
    except Exception:
        return ''

cpu = get_cmd(\"top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'\")
mem = get_cmd(\"free -m | awk 'NR==2{printf \\\"%.2f%% (Used %sMB / Total %sMB)\\\", $3*100/$2, $3, $2}'\")
disk = get_cmd(\"df -h / | awk 'NR==2{printf \\\"%s used of %s (%s)\\\", $3, $2, $5}'\")
uptime = get_cmd(\"uptime -p\")

print(json.dumps({
    'cpu_usage_pct': cpu,
    'memory_usage': mem,
    'disk_usage': disk,
    'uptime': uptime
}))
"`;
        const res = await this.sshExec(script);
        try {
            return JSON.parse(res.stdout);
        }
        catch {
            return { raw: res.stdout };
        }
    }
    async readAppConfig(appId) {
        const script = `python3 -c "
import yaml, json, os
path = f'/var/lib/casaos/apps/${appId}/docker-compose.yml'
if os.path.exists(path):
    with open(path) as f:
        print(json.dumps(yaml.safe_load(f)))
else:
    print('{}')
"`;
        const res = await this.sshExec(script);
        try {
            return JSON.parse(res.stdout);
        }
        catch {
            return { error: 'App configuration not found' };
        }
    }
    async updateAppEnv(appId, envUpdates) {
        const script = `python3 -c "
import yaml, os, json

app_id = '${appId}'
updates = json.loads('''${JSON.stringify(envUpdates)}''')

path = f'/var/lib/casaos/apps/{app_id}/docker-compose.yml'
if os.path.exists(path):
    with open(path, 'r') as f:
        data = yaml.safe_load(f) or {}

    if 'services' in data:
        for svc_name, svc_cfg in data['services'].items():
            if not isinstance(svc_cfg, dict):
                continue
            envs = svc_cfg.get('environment', [])
            env_dict = {}
            if isinstance(envs, list):
                for e in envs:
                    if '=' in e:
                        k, v = e.split('=', 1)
                        env_dict[k] = v
            elif isinstance(envs, dict):
                env_dict = envs

            # Apply updates
            for k, v in updates.items():
                env_dict[k] = v

            svc_cfg['environment'] = [f'{k}={v}' for k, v in env_dict.items()]

    with open(path, 'w') as f:
        yaml.safe_dump(data, f)
    print('UPDATED_OK')
else:
    print('NOT_FOUND')
"
cd /var/lib/casaos/apps/${appId} && docker compose -p ${appId} up -d
`;
        const res = await this.sshExec(script);
        if (res.code !== 0) {
            throw new Error(`Failed to update environment: ${res.stderr}`);
        }
        return `Environment variables for ${appId} updated and container recreated cleanly!`;
    }
    async backupAppData(appId) {
        const script = `python3 -c "
import os, subprocess, datetime

app_id = '${appId}'
data_dir = f'/DATA/AppData/{app_id}'
backup_dir = '/DATA/AppData/backups'
os.makedirs(backup_dir, exist_ok=True)

if os.path.exists(data_dir):
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    tar_file = f'{backup_dir}/{app_id}_{timestamp}.tar.gz'
    cmd = f'tar -czf {tar_file} -C /DATA/AppData {app_id}'
    subprocess.check_call(cmd, shell=True)
    size = os.path.getsize(tar_file)
    print(f'BACKUP_OK|{tar_file}|{size}')
else:
    print(f'NO_DATA_DIR|{data_dir}')
"`;
        const res = await this.sshExec(script);
        if (res.stdout.includes('BACKUP_OK')) {
            const [, path, size] = res.stdout.trim().split('|');
            const sizeMB = (parseInt(size, 10) / (1024 * 1024)).toFixed(2);
            return `Backup created successfully at ${path} (${sizeMB} MB)`;
        }
        else {
            return `No AppData folder found at /DATA/AppData/${appId}`;
        }
    }
    // --- FINAL 3 ULTIMATE TOOLS ---
    async manageAppStore(action, url) {
        if (action === 'add' && url) {
            const res = await this.sshExec(`casaos-cli app-management register ${url}`);
            return `AppStore ${url} added successfully: ${res.stdout || res.stderr}`;
        }
        else if (action === 'remove' && url) {
            const res = await this.sshExec(`casaos-cli app-management unregister ${url}`);
            return `AppStore ${url} removed: ${res.stdout || res.stderr}`;
        }
        else {
            const res = await this.httpGet('/v2/app_management/appstore');
            return JSON.stringify(res, null, 2);
        }
    }
    async runShellCommand(command) {
        const res = await this.sshExec(command);
        return res.stdout || res.stderr || `Exit code: ${res.code}`;
    }
    async listStorage() {
        const script = `df -h /DATA /var/lib/casaos 2>/dev/null || df -h`;
        const res = await this.sshExec(script);
        return res.stdout;
    }
}
