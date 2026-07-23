import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CasaOSClient, CasaOSConfig } from './casaos-client.js';

const config: CasaOSConfig = {
  host: process.env.CASAOS_HOST || '127.0.0.1',
  port: parseInt(process.env.CASAOS_SSH_PORT || '22', 10),
  username: process.env.CASAOS_USER || 'root',
  password: process.env.CASAOS_PASSWORD || '',
  privateKey: process.env.CASAOS_PRIVATE_KEY,
};

const casaos = new CasaOSClient(config);

const server = new Server(
  {
    name: 'casaos-mcp-server',
    version: '3.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'casaos_list_apps',
        description: 'List all installed CasaOS native apps, registered compose projects, and legacy Docker containers.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'casaos_deploy_app',
        description: 'Deploy a new application or Docker Compose stack natively into CasaOS with full x-casaos metadata (icons, title, web UI port). Ensures app never becomes legacy.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'Unique app ID (slug), e.g., my-app' },
            title: { type: 'string', description: 'Human readable app title, e.g., My Awesome App' },
            icon: { type: 'string', description: 'URL of the icon PNG/SVG' },
            webPort: { type: 'number', description: 'Primary web access port (e.g. 8080)' },
            category: { type: 'string', description: 'App category (e.g., Utilities, Media, Developer)' },
            composeYaml: { type: 'string', description: 'Valid Docker Compose YAML definition' },
          },
          required: ['appId', 'title', 'icon', 'composeYaml'],
        },
      },
      {
        name: 'casaos_convert_legacy_app',
        description: 'Convert a legacy Docker container into a native CasaOS Compose App with icon, title, and web UI integration.',
        inputSchema: {
          type: 'object',
          properties: {
            containerName: { type: 'string', description: 'Name of the legacy running container (e.g., n8n)' },
            title: { type: 'string', description: 'Optional human readable title' },
            icon: { type: 'string', description: 'Optional icon URL' },
          },
          required: ['containerName'],
        },
      },
      {
        name: 'casaos_set_app_icon',
        description: 'Update the dashboard icon and title of any installed CasaOS app.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID or folder name in /var/lib/casaos/apps/' },
            iconUrl: { type: 'string', description: 'Icon image URL (PNG/SVG)' },
            title: { type: 'string', description: 'Optional updated title' },
          },
          required: ['appId', 'iconUrl'],
        },
      },
      {
        name: 'casaos_manage_app',
        description: 'Start, stop, or restart an installed CasaOS app.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID (e.g., n8n, postgresql, leiturapp)' },
            action: { type: 'string', enum: ['start', 'stop', 'restart'], description: 'Action to perform' },
          },
          required: ['appId', 'action'],
        },
      },
      {
        name: 'casaos_search_icon',
        description: 'Search for high-resolution vector/PNG icons for an application name using Iconify API.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term (e.g., gitea, postgres, wordpress)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'casaos_get_app_logs',
        description: 'Fetch execution logs of a CasaOS application for debugging or retrieving initial setup passwords.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID or container name' },
            lines: { type: 'number', description: 'Number of log lines to retrieve (default: 50)' },
          },
          required: ['appId'],
        },
      },
      {
        name: 'casaos_get_system_stats',
        description: 'Fetch real-time CPU, RAM, disk space, and uptime metrics of the CasaOS server.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'casaos_read_app_config',
        description: 'Read the parsed docker-compose.yml configuration of an installed CasaOS app.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID (e.g., n8n, leiturapp)' },
          },
          required: ['appId'],
        },
      },
      {
        name: 'casaos_update_app_env',
        description: 'Update specific environment variables for an installed CasaOS app and recreate the container cleanly.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID (e.g., postgresql, n8n)' },
            envUpdates: {
              type: 'object',
              description: 'Key-value map of environment variables to update (e.g. {"POSTGRES_PASSWORD": "secret"})',
            },
          },
          required: ['appId', 'envUpdates'],
        },
      },
      {
        name: 'casaos_backup_app_data',
        description: 'Create a timestamped tar.gz backup of an application data directory under /DATA/AppData/<appId>.',
        inputSchema: {
          type: 'object',
          properties: {
            appId: { type: 'string', description: 'App ID (e.g., n8n, postgresql, leiturapp)' },
          },
          required: ['appId'],
        },
      },
      {
        name: 'casaos_manage_appstore',
        description: 'List, add, or remove third-party AppStores (e.g. Big Bear AppStore) in CasaOS.',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['add', 'remove', 'list'], description: 'Action to perform' },
            url: { type: 'string', description: 'AppStore URL (required for add/remove)' },
          },
          required: ['action'],
        },
      },
      {
        name: 'casaos_run_shell_command',
        description: 'Run low-level maintenance Linux shell commands directly on the CasaOS host over SSH.',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'Shell command string to execute (e.g., docker system prune -f)' },
          },
          required: ['command'],
        },
      },
      {
        name: 'casaos_list_storage',
        description: 'List mounted storage drives and disk space allocation under /DATA.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'casaos_list_apps') {
      const result = await casaos.listApps();
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }

    if (name === 'casaos_deploy_app') {
      const { appId, title, icon, webPort, category, composeYaml } = args as any;
      const res = await casaos.deployCasaOSApp({ appId, title, icon, webPort, category, composeYaml });
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_convert_legacy_app') {
      const { containerName, title, icon } = args as any;
      const res = await casaos.convertLegacyApp(containerName, icon, title);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_set_app_icon') {
      const { appId, iconUrl, title } = args as any;
      const res = await casaos.setAppIcon(appId, iconUrl, title);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_manage_app') {
      const { appId, action } = args as any;
      const res = await casaos.manageApp(appId, action);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_search_icon') {
      const { query } = args as any;
      const res = await casaos.searchIcons(query);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }

    if (name === 'casaos_get_app_logs') {
      const { appId, lines } = args as any;
      const res = await casaos.getAppLogs(appId, lines);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_get_system_stats') {
      const res = await casaos.getSystemStats();
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }

    if (name === 'casaos_read_app_config') {
      const { appId } = args as any;
      const res = await casaos.readAppConfig(appId);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }

    if (name === 'casaos_update_app_env') {
      const { appId, envUpdates } = args as any;
      const res = await casaos.updateAppEnv(appId, envUpdates);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_backup_app_data') {
      const { appId } = args as any;
      const res = await casaos.backupAppData(appId);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_manage_appstore') {
      const { action, url } = args as any;
      const res = await casaos.manageAppStore(action, url);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_run_shell_command') {
      const { command } = args as any;
      const res = await casaos.runShellCommand(command);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'casaos_list_storage') {
      const res = await casaos.listStorage();
      return { content: [{ type: 'text', text: res }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CasaOS MCP Server v3.0.0 running on stdio');
}

main().catch((err) => {
  console.error('Fatal error in main:', err);
  process.exit(1);
});
