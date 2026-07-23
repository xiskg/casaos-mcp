# 🏠 CasaOS MCP Server (Model Context Protocol)

> **The Ultimate & Complete Guide to Integrating Your CasaOS Home Server with AI Coding Assistants (Antigravity, Cursor, Claude, Windsurf)**  
> *Never suffer from AI containers turning into "Legacy Applications" or broken 3D box icons again!*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP--SDK-v1.6.0-blue.svg)](https://github.com/modelcontextprotocol)

---

## 📖 Table of Contents
1. [What is this project and what problem does it solve?](#-what-is-this-project-and-what-problem-does-it-solve)
2. [Security Best Practices & Non-Root Setup](#-security-best-practices--non-root-setup)
3. [Prerequisites (What you need to have installed)](#-prerequisites-what-you-need-to-have-installed)
4. [Step-by-Step: How to Clone & Build (From Scratch)](#-step-by-step-how-to-clone--build-from-scratch)
5. [How to Configure in Your Favorite AI Assistant](#-how-to-configure-in-your-favorite-ai-assistant)
   - [In Antigravity (Gemini CLI / AGY)](#1-in-antigravity-gemini-cli--agy)
   - [In Cursor IDE](#2-in-cursor-ide)
   - [In Claude Desktop](#3-in-claude-desktop)
   - [In Windsurf](#4-in-windsurf)
6. [Explanatory Table of All 14 Native Tools](#-explanatory-table-of-all-14-native-tools)
7. [Troubleshooting & F.A.Q.](#-troubleshooting--faq)
8. [License](#-license)

---

## 🔒 Security Best Practices & Non-Root Setup

> [!TIP]
> **Don't want to give root SSH access to an AI?**  
> We strongly agree with the principle of least privilege! You do **NOT** need to use the `root` account. Follow the quick guide below to create a dedicated, unprivileged Linux user for your AI assistant.

### 🛡️ How to Create a Dedicated Non-Root User (`casaos-mcp`)

Run these commands **once** on your CasaOS server via terminal:

```bash
# 1. Create a dedicated unprivileged user named 'casaos-mcp'
sudo useradd -m -s /bin/bash casaos-mcp

# 2. Set a password for the new user
sudo passwd casaos-mcp

# 3. Add the user to the docker group (allows container management without root)
sudo usermod -aG docker casaos-mcp

# 4. Grant access to CasaOS app configuration directory
sudo chown -R :docker /var/lib/casaos/apps
sudo chmod -R 775 /var/lib/casaos/apps
```

Now, in your `mcp_config.json`, simply set:
```json
"CASAOS_USER": "casaos-mcp",
"CASAOS_PASSWORD": "your_casaos_mcp_password"
```
*(This isolates your underlying Linux operating system so the AI assistant can only manage Docker containers and CasaOS app configurations!)*

---

## ❓ What is this project and what problem does it solve?

If you run **CasaOS** on your home server and use AI coding assistants to help you deploy or manage Docker services, you've likely encountered this frustrating issue:

👉 **The Problem:** When an AI assistant runs standard terminal commands like `docker run` or `docker compose up`, CasaOS does not recognize the deployment as a native application. It banishes the container to the bottom of the dashboard under **"Legacy application (to be rebuilt)"**, displaying a generic 3D box icon with no web UI shortcut link.

🚀 **The Solution:** The **CasaOS MCP Server** acts as a real-time bridge between your AI assistant and your CasaOS host. Instead of the AI executing raw, unmanaged Docker commands, it gains **14 specialized native tools** to inject `x-casaos` metadata, configure vector icons, set web UI ports, and keep everything **100% native, clean, and beautiful** on your dashboard.

---

## 🛠️ Prerequisites (What you need to have installed)

Before getting started, make sure your local machine (where your AI assistant runs) and your CasaOS server meet the following requirements:

### 1. On your local machine (Mac / Windows / Linux where Cursor/Claude runs):
* **Node.js (version 18 or higher):**  
  To check if Node.js is installed, open your terminal and run:
  ```bash
  node -v
  ```
  *(If it outputs something like `v20.x.x` or `v18.x.x`, you are ready! If command not found, download and install it from [nodejs.org](https://nodejs.org/))*

* **Git:**  
  To check if Git is installed:
  ```bash
  git --version
  ```

### 2. On your CasaOS Server:
* **Active SSH Access:**  
  You need to know your CasaOS server **IP Address** (e.g., `192.168.1.100`), your **SSH Username** (`root` or dedicated `casaos-mcp` user), and your **SSH Password** or **SSH Private Key**.

---

## 🏗️ Step-by-Step: How to Clone & Build (From Scratch)

Run these 4 simple commands in your local machine terminal:

### Step 1: Clone the repository
```bash
git clone https://github.com/xiskg/casaos-mcp.git
```

### Step 2: Navigate into the project folder
```bash
cd casaos-mcp
```

### Step 3: Install dependencies
```bash
npm install
```
*(This downloads all required libraries for the MCP server)*

### Step 4: Compile TypeScript to JavaScript
```bash
npm run build
```
*(This builds the compiled JavaScript file inside `dist/index.js` ready to run!)*

---

## ⚙️ How to Configure in Your Favorite AI Assistant

Now you will point your AI assistant to the compiled `dist/index.js` file and provide your CasaOS SSH credentials.

> [!IMPORTANT]
> **Pay attention to environment variables!**  
> Replace the example values (`192.168.1.100` and `your_ssh_password_here`) with your **actual** CasaOS server details.

---

### 1. In Antigravity (Gemini CLI / AGY)

Add or open your MCP configuration file at `~/.gemini/antigravity-cli/mcp_config.json` (or workspace `mcp_config.json`):

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "casaos-mcp",
        "CASAOS_PASSWORD": "your_ssh_password_here"
      }
    }
  }
}
```

---

### 2. In Cursor IDE

1. Open **Cursor**.
2. Go to `Settings` -> `Features` -> `MCP Servers`.
3. Click **"+ Add New MCP Server"**.
4. Fill in the fields:
   - **Name:** `casaos`
   - **Type:** `command`
   - **Command:** `node /ABSOLUTE/PATH/TO/casaos-mcp/dist/index.js`
5. Add environment variables under `ENV`:
   ```env
   CASAOS_HOST=192.168.1.100
   CASAOS_USER=casaos-mcp
   CASAOS_PASSWORD=your_ssh_password_here
   ```

---

### 3. In Claude Desktop

Open your `claude_desktop_config.json` file (located in `~/Library/Application Support/Claude/` on macOS or `%APPDATA%\Claude\` on Windows) and add:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "casaos-mcp",
        "CASAOS_PASSWORD": "your_ssh_password_here"
      }
    }
  }
}
```

---

### 4. In Windsurf

Edit your `~/.codeium/windsurf/mcp_config.json` file:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "casaos-mcp",
        "CASAOS_PASSWORD": "your_ssh_password_here"
      }
    }
  }
}
```

---

## 📊 Explanatory Table of All 14 Native Tools

Once connected, your AI assistant automatically unlocks the following **14 tools**:

| MCP Tool Name | What it does | Practical AI Usage Example |
| :--- | :--- | :--- |
| `casaos_list_apps` | Lists all native apps, compose stacks, and legacy containers. | *"Checking what services are currently installed on your CasaOS..."* |
| `casaos_deploy_app` | Deploys a new app/compose stack natively with title, icon, & web port. | *"Deploying Gitea natively with the official icon and web UI link!"* |
| `casaos_convert_legacy_app` | Converts an unmanaged legacy container into a native CasaOS App. | *"Converting your legacy n8n container into a native CasaOS app stack."* |
| `casaos_set_app_icon` | Updates dashboard icon (SVG/PNG) and title for any installed app. | *"Setting a high-resolution vector icon for your app."* |
| `casaos_manage_app` | Starts (`start`), stops (`stop`), or restarts (`restart`) app stacks. | *"Restarting the PostgreSQL container..."* |
| `casaos_get_app_logs` | Fetches real-time logs to debug issues or find initial setup passwords. | *"Searching container logs for the initial admin password..."* |
| `casaos_get_system_stats` | Fetches CPU %, RAM %, Disk space usage, and server Uptime. | *"Your server is currently using 15% CPU and 4GB RAM."* |
| `casaos_search_icon` | Searches high-resolution vector SVG icons via the Iconify API. | *"Searching for the official WordPress vector logo..."* |
| `casaos_read_app_config` | Reads the parsed `docker-compose.yml` configuration of an app. | *"Inspecting configured ports and volumes for the app..."* |
| `casaos_update_app_env` | Safely updates environment variables (passwords, ports) and recreates container. | *"Updating your POSTGRES_PASSWORD environment variable..."* |
| `casaos_backup_app_data` | Creates a timestamped `.tar.gz` archive of `/DATA/AppData/<app_id>`. | *"Creating a safety backup of your app data before updating..."* |
| `casaos_manage_appstore` | Adds, removes, or lists third-party AppStores (Big Bear, etc.). | *"Adding the Big Bear Community AppStore repository..."* |
| `casaos_run_shell_command` | Runs maintenance Linux shell commands directly on the host over SSH. | *"Pruning unused Docker images (`docker system prune`)."* |
| `casaos_list_storage` | Checks mounted storage drives under `/DATA`. | *"Checking free disk space on your primary storage drive..."* |

---

## ❓ Troubleshooting & F.A.Q.

### 1. My app icon still displays as a blue/grey 3D box on CasaOS!
> **Cause:** The image URL provided by the AI is returning an HTTP 404 error or broken image link.  
> **Solution:** Ask your AI assistant:  
> *"Please use `casaos_set_app_icon` with a valid Iconify SVG URL, e.g. `https://api.iconify.design/mdi/docker.svg`"*

### 2. The AI returns a "Permission Denied" SSH error.
> **Cause:** The SSH credentials in `CASAOS_USER` or `CASAOS_PASSWORD` are incorrect, or the user lacks permissions to manage Docker/systemctl.  
> **Solution:** Ensure your dedicated user (e.g. `casaos-mcp`) belongs to the `docker` group (`sudo usermod -aG docker casaos-mcp`).

### 3. The AI says command `node` was not found.
> **Cause:** The AI client process cannot resolve Node.js in your system PATH.  
> **Solution:** In your `mcp_config.json`, replace `"command": "node"` with the absolute binary path, e.g. `"command": "/usr/local/bin/node"` or `"command": "/opt/homebrew/bin/node"`. (Run `which node` in your terminal to find your exact Node path).

---

## 📄 License

Distributed under the **MIT** Open-Source License.  
Created by **João de Almeida ([xiskg](https://github.com/xiskg))** to empower the global CasaOS & AI community! 🚀
