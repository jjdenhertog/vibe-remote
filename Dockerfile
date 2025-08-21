FROM ubuntu:22.04

LABEL maintainer="Vibe Remote Contributors"
LABEL version="7.0.0"
LABEL description="Remote AI development environment with Vibe-Kanban task management and Claude AI integration"

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_VERSION=20 \
    CLAUDE_CODE_ENABLE_TELEMETRY=0 \
    HOME=/home/developer

# Install base packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git vim nano htop jq ca-certificates gnupg lsb-release \
    build-essential python3 python3-pip python3-venv \
    openssh-server net-tools iputils-ping tree \
    supervisor tmux screen libatomic1 sudo \
    sqlite3 libsqlite3-dev unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (for Docker-in-Docker support)
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN mkdir -p -m 755 /etc/apt/keyrings \
    && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install gh -y \
    && rm -rf /var/lib/apt/lists/*

# Create developer user with UID 1000
RUN useradd -m -s /bin/bash -u 1000 developer \
    && usermod -aG sudo developer \
    && echo "developer ALL=(ALL) ALL" >> /etc/sudoers.d/developer \
    && chmod 0440 /etc/sudoers.d/developer \
    && groupadd -f docker \
    && usermod -aG docker developer

# Configure npm to use user-writable directory for global packages
RUN mkdir -p /home/developer/.npm-global /home/developer/.npm \
    && chown -R developer:developer /home/developer/.npm-global /home/developer/.npm /home/developer \
    && su - developer -c "npm config set prefix '/home/developer/.npm-global'" \
    && echo 'export PATH=/home/developer/.npm-global/bin:$PATH' >> /home/developer/.bashrc

# Install vibe-kanban as developer user in their npm-global directory
USER developer
RUN npm install -g \
    @anthropic-ai/claude-code@latest
USER root

# Configure SSH
RUN mkdir /var/run/sshd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && echo "AllowUsers developer" >> /etc/ssh/sshd_config

# Create directories
RUN mkdir -p /workspace/credentials /workspace/project /workspace/data \
    /scripts /var/log/supervisor \
    /home/developer/.config \
    && chown -R developer:developer /workspace /home/developer

# Copy configuration files
COPY --chown=root:root supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --chown=root:root scripts/ /scripts/
COPY --chown=root:root docker-entrypoint.sh /docker-entrypoint.sh

# Make scripts executable and create symlinks for user commands
RUN chmod +x /docker-entrypoint.sh /scripts/*.sh && \
    ln -s /scripts/init-project.sh /usr/local/bin/init-project && \
    ln -s /scripts/claude-flow-wrapper.sh /usr/local/bin/claude-flow-wrapper && \
    ln -s /scripts/setup-verify.sh /usr/local/bin/setup-verify && \
    ln -s /scripts/setup-storage-credentials.sh /usr/local/bin/setup-storage-credentials && \
    ln -s /scripts/setup-storage-data.sh /usr/local/bin/setup-storage-data

# Expose ports - designed to be remapped with PORT_PREFIX
# SSH (9090), Vibe-Kanban (9091), Development servers (3000-3010)
EXPOSE 9090 9091 3000-3010

WORKDIR /workspace

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]