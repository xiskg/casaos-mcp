# 🏠 CasaOS MCP Server (Model Context Protocol)

> **O Guia Definitivo e Completo para integrar seu CasaOS com IAs (Antigravity, Cursor, Claude, Windsurf)**  
> *nunca mais sofra com contêineres virando "Aplicativos Legados" ou ícones quebrados de caixas cinzas/azuis!*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP--SDK-v1.6.0-blue.svg)](https://github.com/modelcontextprotocol)

---

## 📖 Índice / Table of Contents
1. [O que é este projeto e qual problema ele resolve?](#-o-que-é-este-projeto-e-qual-problema-ele-resolve)
2. [Pré-requisitos (O que você precisa ter instalado)](#-pré-requisitos-o-que-você-precisa-ter-instalado)
3. [Passo a Passo: Como Baixar e Compilar (Do Zero)](#-passo-a-passo-como-baixar-e-compilar-do-zero)
4. [Como Configurar na sua IA favorita](#-como-configurar-na-sua-ia-favorita)
   - [No Antigravity (Gemini CLI / AGY)](#1-no-antigravity-gemini-cli--agy)
   - [No Cursor IDE](#2-no-cursor-ide)
   - [No Claude Desktop](#3-no-claude-desktop)
   - [No Windsurf](#4-no-windsurf)
5. [Tabela Explicativa das 14 Ferramentas Nativas](#-tabela-explicativa-das-14-ferramentas-nativas)
6. [Solução de Problemas (Troubleshooting / F.A.Q)](#-solução-de-problemas-troubleshooting--faq)
7. [Licença](#-licença)

---

## ❓ O que é este projeto e qual problema ele resolve?

Se você usa o **CasaOS** no seu servidor doméstico e gosta de usar assistentes de Inteligência Artificial para te ajudar a criar ou atualizar seus serviços Docker, já deve ter reparado neste padrão irritante:

👉 **O Problema:** Quando a IA roda comandos normais como `docker run` ou `docker compose up`, o CasaOS não reconhece o aplicativo como nativo. Ele joga o contêiner no rodapé da página sob a seção **"Aplicativo legado (a ser reconstruído)"**, colocando um ícone sem graça de uma caixa 3D genérica e sem link para abrir a interface web do app.

🚀 **A Solução:** O **CasaOS MCP Server** é uma ponte de comunicação em tempo real entre a sua IA e o seu CasaOS. Em vez de a IA rodar comandos brutos de Docker no escuro, ela ganha **14 ferramentas especializadas** para injetar as tags `x-casaos`, configurar os ícones vetorizados, ajustar portas e manter tudo **100% nativo e bonito** no seu painel.

---

## 🛠️ Pré-requisitos (O que você precisa ter instalado)

Antes de começar, certifique-se de que a sua máquina local (onde a IA roda, ex: seu Mac ou PC) e o seu Servidor CasaOS atendem aos requisitos:

### 1. Na sua máquina local (onde está o Cursor, Claude ou Antigravity):
* **Node.js (versão 18 ou superior):**  
  Para testar se você tem o Node instalado, abra o seu terminal e digite:
  ```bash
  node -v
  ```
  *(Se aparecer algo como `v20.x.x` ou `v18.x.x`, você está pronto! Se der comando não encontrado, baixe e instale no site oficial: [nodejs.org](https://nodejs.org/))*

* **Git:**  
  Para testar se tem o Git:
  ```bash
  git --version
  ```

### 2. No seu servidor CasaOS:
* **Acesso SSH ativo:**  
  O CasaOS é baseado em Linux (Ubuntu, Debian, CasaOS OS). Você precisa saber o **IP do Servidor** (ex: `192.168.1.100`), o **Usuário SSH** (geralmente `root` ou seu usuário administrador) e a **Senha do SSH**.

---

## 🏗️ Passo a Passo: Como Baixar e Compilar (Do Zero)

Siga estes 4 comandos simples no terminal do seu computador local:

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/xiskg/casaos-mcp.git
```

### Passo 2: Entrar na pasta do projeto
```bash
cd casaos-mcp
```

### Passo 3: Instalar as dependências
```bash
npm install
```
*(Isso vai baixar todas as bibliotecas necessárias para o MCP funcionar)*

### Passo 4: Compilar o código TypeScript para JavaScript
```bash
npm run build
```
*(Este comando gera a pasta `dist/` com o arquivo `dist/index.js` compilado e pronto para rodar!)*

---

## ⚙️ Como Configurar na sua IA favorita

Agora você vai indicar para a sua IA onde está o arquivo `dist/index.js` que acabou de compilar e quais são as credenciais do seu CasaOS.

> [!IMPORTANT]
> **Atenção nas variáveis de ambiente!**  
> Substitua os valores de exemplo (`192.168.1.100` e `sua_senha_aqui`) pelas informações **reais** do seu servidor CasaOS.

---

### 1. No Antigravity (Gemini CLI / AGY)

Abra ou crie o seu arquivo de configuração MCP local em `~/.gemini/antigravity-cli/mcp_config.json` ou `mcp_config.json` da sua workspace:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/PARA/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "root",
        "CASAOS_PASSWORD": "sua_senha_ssh_aqui"
      }
    }
  }
}
```

---

### 2. No Cursor IDE

1. Abra o **Cursor**.
2. Vá em `Settings` (Configurações) -> `Features` -> `MCP Servers`.
3. Clique em **"+ Add New MCP Server"**.
4. Preencha os campos:
   - **Name:** `casaos`
   - **Type:** `command`
   - **Command:** `node /CAMINHO/ABSOLUTO/PARA/casaos-mcp/dist/index.js`
5. Adicione as variáveis de ambiente em `ENV`:
   ```env
   CASAOS_HOST=192.168.1.100
   CASAOS_USER=root
   CASAOS_PASSWORD=sua_senha_ssh_aqui
   ```

---

### 3. No Claude Desktop

No seu computador, abra o arquivo `claude_desktop_config.json` (localizado em `~/Library/Application Support/Claude/` no macOS ou `%APPDATA%\Claude\` no Windows) e adicione:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/PARA/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_SSH_PORT": "22",
        "CASAOS_USER": "root",
        "CASAOS_PASSWORD": "sua_senha_ssh_aqui"
      }
    }
  }
}
```

---

### 4. No Windsurf

No Windsurf, edite o seu arquivo `~/.codeium/windsurf/mcp_config.json` da mesma forma:

```json
{
  "mcpServers": {
    "casaos": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/PARA/casaos-mcp/dist/index.js"],
      "env": {
        "CASAOS_HOST": "192.168.1.100",
        "CASAOS_USER": "root",
        "CASAOS_PASSWORD": "sua_senha_ssh_aqui"
      }
    }
  }
}
```

---

## 📊 Tabela Explicativa das 14 Ferramentas Nativas

Assim que o MCP Server estiver conectado, a sua IA aprenderá automaticamente as seguintes **14 habilidades**:

| Ferramenta MCP | O que ela faz? (Explicação simples) | Exemplo de uso pela IA |
| :--- | :--- | :--- |
| `casaos_list_apps` | Lista todos os apps instalados, composes e contêineres legados. | *"Deixa eu ver o que você já tem instalado no CasaOS..."* |
| `casaos_deploy_app` | Cria e sobe um novo app com ícone, título e porta web nativos. | *"Vou subir o Gitea nativamente com a logo oficial!"* |
| `casaos_convert_legacy_app` | Pega um app "legado" e transforma em App Nativo do CasaOS. | *"Vou converter o seu n8n legado para o painel principal."* |
| `casaos_set_app_icon` | Atualiza o ícone (SVG/PNG) e título de qualquer app do painel. | *"Vou colocar um ícone vetorizado bonito no seu aplicativo."* |
| `casaos_manage_app` | Inicia (`start`), para (`stop`) ou reinicia (`restart`) apps. | *"Reiniciando o contêiner do PostgreSQL..."* |
| `casaos_get_app_logs` | Lê os logs em tempo real do app para debugar ou achar senhas. | *"Procurando a senha inicial gerada no log do app..."* |
| `casaos_get_system_stats` | Mostra uso de CPU %, RAM %, Espaço em Disco e Uptime. | *"Seu servidor está usando 15% de CPU e 4GB de RAM."* |
| `casaos_search_icon` | Pesquisa ícones vetorizados em SVG na API do Iconify. | *"Buscando o ícone oficial do WordPress..."* |
| `casaos_read_app_config` | Lê o arquivo `docker-compose.yml` completo de um app. | *"Inspeccionando as portas e volumes configurados..."* |
| `casaos_update_app_env` | Altera senhas/variáveis de ambiente no Compose com segurança. | *"Atualizando a variável POSTGRES_PASSWORD para você."* |
| `casaos_backup_app_data` | Cria um arquivo `.tar.gz` de backup da pasta do app em `/DATA/AppData`. | *"Gerando backup dos dados antes de atualizar..."* |
| `casaos_manage_appstore` | Gerencia e adiciona Lojas de Apps de terceiros (Big Bear, etc). | *"Adicionando a loja comunitária do Big Bear..."* |
| `casaos_run_shell_command` | Executa comandos Linux SSH no servidor para manutenções avançadas. | *"Limpando imagens antigas do Docker (`docker prune`)..."* |
| `casaos_list_storage` | Exibe os HDs e partições montados no diretório `/DATA`. | *"Verificando o espaço livre no seu HD principal..."* |

---

## ❓ Solução de Problemas (Troubleshooting / F.A.Q)

### 1. Meu ícone continua aparecendo como caixa 3D azul/cinza no CasaOS!
> **Causa:** O link da imagem que a IA colocou está quebrado ou retornando erro HTTP 404.  
> **Solução:** Diga para a sua IA:  
> *"IA, use o `casaos_set_app_icon` com um ícone SVG válido do Iconify, ex: `https://api.iconify.design/mdi/docker.svg`"*

### 2. A IA dá erro de "Permission Denied" no SSH
> **Causa:** As credenciais em `CASAOS_USER` ou `CASAOS_PASSWORD` estão incorretas ou o usuário SSH não tem permissão para rodar comandos Docker/systemctl.  
> **Solução:** Use o usuário `root` ou garanta que o seu usuário Linux pertence ao grupo `docker` e `sudo`.

### 3. A IA diz que não encontrou o comando `node`
> **Causa:** O assistente de IA não encontrou o caminho do `node` no PATH do sistema.  
> **Solução:** No seu `mcp_config.json`, em vez de apenas `"command": "node"`, coloque o caminho absoluto do Node.js, como `"command": "/usr/local/bin/node"` ou `"command": "/opt/homebrew/bin/node"`. (Descubra onde seu node está digitando `which node` no terminal).

---

## 📄 Licença

Este projeto é disponibilizado sob a licença open-source **MIT**.  
Desenvolvido por **João de Almeida ([xiskg](https://github.com/xiskg))** para ajudar toda a comunidade do CasaOS! 🚀
