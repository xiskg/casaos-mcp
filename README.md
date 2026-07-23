# 🏠 CasaOS MCP Server (Model Context Protocol)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP--SDK-v1.6.0-blue.svg)](https://github.com/modelcontextprotocol)

**English** | [Português](#-português)

A Model Context Protocol (MCP) Server that grants AI Coding Assistants (**Antigravity**, **Cursor**, **Claude Desktop**, **Windsurf**, etc.) native control over **CasaOS** home server instances.

It solves the common issue where containers created by AI assistants end up tagged as **"Legacy applications"** without dashboard icons, titles, or web UI integration.

---

## 🌟 Key Features (14 MCP Tools)

### 🚀 Native Lifecycle & App Management
1. `casaos_deploy_app`: Deploys new applications or Docker Compose stacks with full `x-casaos` metadata (icons, titles, web ports). Ensures apps never become legacy.
2. `casaos_convert_legacy_app`: Converts unmanaged legacy Docker containers into native CasaOS Compose Apps.
3. `casaos_list_apps`: Lists all installed native apps, compose stacks, and legacy containers.
4. `casaos_set_app_icon`: Updates dashboard icon (PNG/SVG) and title for any installed app.
5. `casaos_manage_app`: Starts, stops, or restarts any CasaOS app stack.

### 🔍 Real-Time Diagnostics & System Stats
6. `casaos_get_app_logs`: Fetches execution logs for debugging or retrieving initial setup passwords.
7. `casaos_get_system_stats`: Fetches real-time CPU, RAM, disk space, and uptime metrics.
8. `casaos_search_icon`: Searches for high-resolution vector/PNG icons using the Iconify API.

### ⚙️ Environment, Configuration & Safety
9. `casaos_read_app_config`: Reads the parsed `docker-compose.yml` configuration of any installed app.
10. `casaos_update_app_env`: Updates environment variables (passwords, ports, keys) and recreates the app cleanly.
11. `casaos_backup_app_data`: Creates a timestamped `.tar.gz` archive of `/DATA/AppData/<app_id>`.

### 📦 AppStores, Shell & Storage
12. `casaos_manage_appstore`: Adds, removes, or lists third-party AppStores (e.g. Big Bear AppStore).
13. `casaos_run_shell_command`: Runs maintenance Linux shell commands directly on the CasaOS host over SSH.
14. `casaos_list_storage`: Checks mounted storage drives under `/DATA`.

---

## ⚙️ Quick Setup

Add the configuration snippet to your AI assistant's `mcp_config.json` (or Cursor Settings / Claude Desktop Config):

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/path/to/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "<YOUR_CASAOS_IP>",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "root",
        "CASAOS_PASSWORD": "<YOUR_CASAOS_PASSWORD>"
      }
    }
  }
}
```

---

## 🇧🇷 Português

Servidor MCP (Model Context Protocol) que dá a assistentes de Inteligência Artificial (**Antigravity**, **Cursor**, **Claude Desktop**) controle nativo completo sobre o seu servidor **CasaOS**.

Resolve o problema clássico onde contêineres criados por IAs viravam **"Aplicativos legados"** sem ícone ou porta de acesso web no dashboard.

### Instalação Rápida

1. Clone este repositório:
```bash
git clone https://github.com/xiskg/casaos-mcp.git
cd casaos-mcp
npm install
npm run build
```

2. Adicione ao seu `mcp_config.json` apontando para o seu IP do CasaOS e senha de SSH:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/Users/<SEU_USUARIO>/git-projects/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_USER": "root",
        "CASAOS_PASSWORD": "sua_senha_ssh"
      }
    }
  }
}
```

---

## 📄 License

[MIT](LICENSE) © João de Almeida ([xiskg](https://github.com/xiskg))
