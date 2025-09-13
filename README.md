# Vibe 🤮 Remote 🚀

[![Docker Pulls](https://img.shields.io/docker/pulls/jjdenhertog/viberemote)](https://hub.docker.com/r/jjdenhertog/viberemote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Remote AI development environment with [Vibe-Kanban](https://www.vibekanban.com/) and [Claude-Flow](https://claude-flow.com/) integration. Enhanced with extra AI context and automations for fully autonomous development workflows.

## ✨ What's Included

- **AI Context Configuration** - Web interface for project goals and coding standards  
- **[Vibe-Kanban](https://www.vibekanban.com/)** - Visual task management with AI agents
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropic's official CLI
- **Automated Workflows** - Review tasks before finishing, creating PRs, automatically merging PRs, and automatic task picking
- **GitHub CLI** - Repository management

## 🤖 Vibe-Kanban Agents

Three AI agents built on Claude are accessible within Vibe-Kanban:

- **VIBE** - Standard Claude with extra context and selected automations
- **VIBE_FLOW** - Uses [Claude-Flow](https://claude-flow.com/) for structured task execution  
- **VIBE_PLAN** - Uses [Vibe-Kanban MCP](https://www.vibekanban.com/docs/mcp) to break down goals into tasks for automatic task selection

## 💡 Working with AI Tools

### Vibe-Kanban
- Access the UI at port `9091` or the configured port
- Create tasks and assign them to VIBE, VIBE_FLOW, or VIBE_PLAN agents
- See [documentation](https://www.vibekanban.com/docs) for advanced features

### Web Configuration Interface
- Visit `http://localhost:9092` to configure AI context and automations
- Set up project goals, coding standards, and development preferences  
- Configure automated workflows: code review, PR creation, auto-merging, and task picking
- Enable autonomous development mode with intelligent task selection
- All settings persist across container restarts

## 🚀 Quick Start

### Setup Configuration (Recommended for GitHub Token)

For secure token management, use the provided example files:

1. **Copy example files:**
   ```bash
   cp .env.example .env
   cp docker-compose.example.yml docker-compose.yml
   ```

2. **Edit `.env` file:** Add your GitHub token and customize settings
   ```bash
   nano .env  # or use your preferred editor
   ```

3. **Start the container:**
   ```bash
   docker-compose up -d
   ```

### Deploy with Docker Compose or Portainer

Choose one of the configurations below. These can be used as:
- **Docker Compose**: Save as `docker-compose.yml` and run `docker-compose up -d`
- **Portainer Stack**: Copy and paste into Portainer's stack editor

#### Option 1: Full Featured Configuration

```yaml
version: '3.8'

services:
  ai-workstation:
    image: jjdenhertog/viberemote:latest
    container_name: vibe-remote-workstation
    
    environment:
      # CHANGE THIS: Set your SSH/VS Code password
      - SSH_PASSWORD=changeme
      - DEVELOPER_PASSWORD=changeme
      
      # Project name (used for display)
      - PROJECT_NAME=vibe-remote-workstation
      
      # Optional: Add your SSH public key for key-based auth
      # - PUBLIC_KEY=ssh-rsa AAAAB3...
      
      # Optional: Auto-configure Git (saves manual setup)
      # - GIT_USERNAME=Your Name
      # - GIT_USEREMAIL=your@email.com
      
      # GitHub Personal Access Token (fine-grained recommended)
      - GITHUB_TOKEN=ghp_your_token_here
      
      # Optional: Match your host user/group ID for file permissions
      # - USER_ID=1000
      # - GROUP_ID=1000
      
      # Optional: Set timezone
      - TZ=UTC
      
      # Optional: Vibe Kanban URL for web interface iframe
      # Defaults to http://localhost:9091
      - NEXT_PUBLIC_VIBE_KANBAN_URL=http://localhost:9091
      
    ports:
      # CHANGE THESE: Use unique ports for each project
      - "9090:9090"       # SSH
      - "9091:9091"       # Vibe-Kanban
      - "9092:8080"       # Vibe 🤮 Remote 🚀 Web App
      
    volumes:
      # Persistent storage split into three volumes
      - vibe-credentials:/workspace/credentials
      - vibe-project:/workspace/project
      - vibe-data:/workspace/data
      
      # Optional: Docker socket for Docker-in-Docker
      # Uncomment if you need Docker access from within container
      # - /var/run/docker.sock:/var/run/docker.sock:ro
      
    restart: unless-stopped

volumes:
  vibe-credentials:
    driver: local
  vibe-project:
    driver: local
  vibe-data:
    driver: local
```

#### Option 2: Minimal Configuration

```yaml
version: '3'

services:
  ai-dev:
    image: jjdenhertog/viberemote:latest
    container_name: vibe-remote-minimal
    
    environment:
      - DEVELOPER_PASSWORD=changeme
      - GITHUB_TOKEN=ghp_your_token_here
      - NEXT_PUBLIC_VIBE_KANBAN_URL=http://localhost:9091
    
    ports:
      - "9090:9090"     # SSH
      - "9091:9091"     # Vibe-Kanban
      - "9092:8080"     # Vibe 🤮 Remote 🚀 Web App
    
    volumes:
      - credentials:/workspace/credentials
      - project:/workspace/project
      - data:/workspace/data

volumes:
  credentials:
  project:
  data:
```

### Access Your Environment

- SSH: `ssh developer@localhost -p 9090`
- Vibe-Kanban: `http://localhost:9091`  
- Vibe 🤮 Remote 🚀 Web App: `http://localhost:9092`

### First Time Setup

```bash
# 1. SSH into container
ssh developer@localhost -p 9090

# 2. Authenticate everything (one-time - persists!)
claude login              # Claude Code auth

# GitHub CLI authentication - choose one:
# Option A: Manual authentication (interactive)
gh auth login

# Option B: Automatic with token (recommended)
# Add GITHUB_TOKEN to your docker-compose.yml environment
# No manual authentication needed - token is configured automatically!

# 3. Configure Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 4. Clone your project into /workspace/project
cd /workspace/project
git clone git@github.com:user/repo.git .
# or
gh repo clone user/repo .
```

## 🔒 Enhanced Security with Firewall

The workstation runs Claude Code with enhanced AI capabilities in a containerized environment. For additional security, you can implement a firewall using a Squid proxy.

This setup creates a whitelist-based network filter that only allows connections to approved domains, preventing potential unwanted network access. See [FIREWALL.md](FIREWALL.md) for detailed setup instructions.

## 🔑 GitHub Authentication

You have two options for GitHub CLI authentication:

### Option 1: Automatic Token Authentication (Recommended)

Add a GitHub Personal Access Token to your docker-compose.yml:

1. Create a fine-grained personal access token at: https://github.com/settings/tokens?type=beta
2. Required scopes: `repo`, `read:org`
3. Add to your docker-compose.yml environment:
   ```yaml
   environment:
     - GITHUB_TOKEN=ghp_your_token_here
   ```
4. The token will be automatically configured when the container starts
5. No manual `gh auth login` needed!

### Option 2: Manual Authentication

SSH into the container and run:
```bash
gh auth login
```

Follow the interactive prompts to authenticate with your GitHub account.

## 🖥️ VS Code / Cursor Remote Development

1. Install the "Remote - SSH" extension
2. Connect: Cmd/Ctrl + Shift + P → "Remote-SSH: Connect to Host"
3. First time only, choose `+ Add new SSH Host`:

```ssh
Host vibe-remote
    HostName localhost  # or your server IP
    Port 9090          # SSH port
    User developer
    # Use password authentication (optional)
    PasswordAuthentication yes
    PubkeyAuthentication no
    PreferredAuthentications password

    # Don't ask for passwords for 10 minutes (optional)
    ControlMaster auto
    ControlPath ~/.ssh/control-%r@%h:%p
    ControlPersist 10m
```

## 📝 Running Multiple Projects

To run multiple projects, adjust the ports and container names in your docker-compose.yml:

| Service | Project 1 | Project 2 | Project 3 |
|---------|-----------|-----------|-----------|
| SSH | 9090 | 8090 | 7090 |
| Vibe-Kanban | 9091 | 8091 | 7091 |
| Vibe-Remote Web App | 9092 | 8092 | 7092 |

Also update:
- Container name: `vibe-remote-project1`, `vibe-remote-project2`, etc.
- Volume names: `project1-credentials`, `project2-credentials`, etc.
- SSH config Host names for each project

## 💾 Persistent Storage

**Workspace Structure (3 Separate Volumes):**
```
/workspace/
├── credentials/       # Volume 1: Authentication & configs
│   ├── claude/       # Claude Code auth
│   ├── ssh/          # SSH keys
│   ├── git/          # Git config
│   ├── gh/           # GitHub CLI tokens
│   └── npm/          # NPM config
├── project/          # Volume 2: Your project files
└── data/             # Volume 3: Workspace data
    ├── .vibe-kanban/ # Task management data
    └── preferences/  # AI context and automation settings
```

## 📚 Tool Documentation

- **Vibe-Kanban**: [Getting Started](https://www.vibekanban.com/docs)
- **Claude Code**: [Setup Guide](https://docs.anthropic.com/en/docs/claude-code/setup)
- **Security Setup**: [FIREWALL.md](FIREWALL.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
