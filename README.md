# Vibe 🤮 Remote 🚀

[![Docker Pulls](https://img.shields.io/docker/pulls/jjdenhertog/viberemote)](https://hub.docker.com/r/jjdenhertog/viberemote)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Remote AI development environment with Vibe-Kanban task management and Claude AI integration. 

## ✨ What's Included

- **[Claude-Flow](https://github.com/ruvnet/claude-flow)** - AI orchestration with hive-mind capabilities
- **[Vibe-Kanban](https://www.vibekanban.com/)** - Visual task management
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropic's official CLI
- **GitHub CLI** - Repository management
- **Persistent Storage** - All auth/configs survive container recreations

## 🚀 Quick Start

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
      
      # Optional: Match your host user/group ID for file permissions
      # - USER_ID=1000
      # - GROUP_ID=1000
      
      # Optional: Set timezone
      - TZ=UTC
      
    ports:
      # CHANGE THESE: Use unique ports for each project
      - "9090:9090"       # SSH
      - "9091:9091"       # Vibe-Kanban
      - "9092:3000"       # Example dev server
      
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
      - GIT_USERNAME=Your Name
      - GIT_USEREMAIL=your@email.com
    
    ports:
      - "9090:9090"     # SSH
      - "9091:9091"     # Vibe-Kanban
      - "9092:3000"     # Example Dev server
    
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
- Dev server: `http://localhost:9092`

### First Time Setup

```bash
# 1. SSH into container
ssh developer@localhost -p 9090

# 2. Authenticate everything (one-time - persists!)
claude login              # Claude Code auth
gh auth login            # GitHub CLI auth

# 3. Configure Git
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 4. Clone your project into /workspace/project
cd /workspace/projectt
git clone git@github.com:user/repo.git .
# or
gh repo clone user/repo .

# 5. Initiate project
init-project
```

## 💡 Working with AI Tools

### Vibe-Kanban
- Access the UI at port `9091` or the configured port.
- Create tasks and let AI agents work on them
- See [documentation](https://www.vibekanban.com/docs) for advanced features

### Setting up Vibe-Kanban with Claude-Flow

To integrate Claude-Flow with Vibe-Kanban for enhanced AI orchestration:

#### 1. Add Agent Profiles
In Vibe-Kanban settings, add the following JSON to the agent profiles:

```json
{
  "label": "claude-flow",
  "CLAUDE_CODE": {
    "command": {
      "base": "claude-flow-wrapper",
      "params": [
        "swarm",
        "--verbose",
        "--output-format=stream-json",
        "--claude"
      ]
    },
    "append_prompt": null,
    "plan": false
  },
  "mcp_config_path": null,
  "variants": [
    {
      "label": "hive",
      "CLAUDE_CODE": {
        "command": {
          "base": "claude-flow-wrapper",
          "params": [
            "hive",
            "-p",
            "--verbose",
            "--output-format=stream-json",
            "--claude"
          ]
        },
        "append_prompt": null,
        "plan": false
      },
      "mcp_config_path": null
    }
  ]
}
```

#### 2. Configure Project Setup Script
In Vibe-Kanban project settings, add the following under `setup script` to initialize Claude-Flow for each created worktree:

```bash
#!/bin/bash
npx -y claude-flow@alpha init --force
```

#### Important Notes:
- The `init-project` command automatically updates `.gitignore` to exclude Claude-Flow files from your repository
- Claude Code interactions are not visible in the Vibe-Kanban UI interface

## 🔒 Enhanced Security with Firewall

The Vibe 🤮 coding approach runs Claude Code with `--dangerously-skip-permissions` for maximum flexibility. While running in a separate Docker container provides good isolation, you can add an extra layer of security by implementing a firewall using a Squid proxy.

This setup creates a whitelist-based network filter that only allows connections to approved domains, preventing potential unwanted network access. See [FIREWALL.md](FIREWALL.md) for detailed setup instructions on implementing a Squid proxy firewall for your Vibe 🤮 Remote workstation.

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
| Dev Server | 9092 | 8092 | 7092 |

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
    └── .vibe-kanban/ # Task management data
```

**Benefits:**
- **Separate volumes** for credentials, projects, and data
- **Easy backup** - backup only what you need
- **Better security** - credentials isolated from project files
- **Flexible management** - each volume can be managed independently

## 📚 Tool Documentation

- **Claude-Flow**: [Configuration](https://github.com/ruvnet/claude-flow/wiki), [Hive-Mind Setup](https://github.com/ruvnet/claude-flow/wiki/Hive-Mind)
- **Vibe-Kanban**: [Getting Started](https://www.vibekanban.com/docs)
- **Claude Code**: [Setup Guide](https://docs.anthropic.com/en/docs/claude-code/setup)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.