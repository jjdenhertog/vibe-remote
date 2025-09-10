# Build stage
FROM ubuntu:22.04 AS builder

LABEL maintainer="Vibe Remote Contributors"
LABEL version="7.0.0"
LABEL description="Remote AI development environment with Vibe-Kanban task management and Claude AI integration"

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_VERSION=20 \
    NODE_ENV=production

# Install build dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git ca-certificates gnupg \
    build-essential python3 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Copy monorepo files and build
WORKDIR /build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY config/ ./config/
COPY tsconfig.json eslint.config.mjs ./

# Install dependencies and build
RUN pnpm install --frozen-lockfile && \
    pnpm run build && \
    cd apps/web && \
    pnpm run build

# ===== PRODUCTION STAGE =====
FROM ubuntu:22.04 AS production

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=UTC \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_VERSION=20 \
    CLAUDE_CODE_ENABLE_TELEMETRY=0 \
    HOME=/home/developer \
    NODE_ENV=production

# Install production runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget git vim nano htop jq ca-certificates gnupg lsb-release \
    openssh-server net-tools iputils-ping tree \
    supervisor tmux screen libatomic1 sudo \
    sqlite3 libsqlite3-dev unzip expect \
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

# Install global packages as developer user
USER developer
RUN npm install -g \
    @anthropic-ai/claude-code@latest \
    pnpm@10.15.0 \
    typescript@^5.0.0
USER root

# Configure SSH
RUN mkdir /var/run/sshd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && echo "AllowUsers developer" >> /etc/ssh/sshd_config

# Create directories
RUN mkdir -p /workspace/credentials /workspace/project /workspace/data /workspace/vibe-web \
    /scripts /var/log/supervisor \
    /home/developer/.config \
    && chown -R developer:developer /workspace /home/developer

# Copy built artifacts from build stage - now we only need the bundled executables
COPY --from=builder /build/packages/claude-wrapper/dist/claude-wrapper.mjs /scripts/claude-wrapper.mjs
COPY --from=builder /build/packages/claude-wrapper/templates/ /scripts/claude-wrapper-dist/templates/

COPY --from=builder /build/packages/vibe-kanban-cleanup/dist/vibe-kanban-cleanup.mjs /scripts/vibe-kanban-cleanup.mjs
COPY --from=builder /build/packages/vibe-kanban-cleanup/dist/start-task-command.mjs /scripts/start-task-command.mjs

COPY --from=builder /build/packages/vibe-kanban-taskpicker/dist/vibe-kanban-taskpicker.mjs /scripts/vibe-kanban-taskpicker.mjs
COPY --from=builder /build/packages/vibe-kanban-taskpicker/templates/ /scripts/vibe-kanban-taskpicker-dist/templates/
# Copy Next.js standalone app (root includes the full monorepo structure)  
COPY --from=builder /build/apps/web/.next/standalone/ /workspace/vibe-web/
# Copy static files relative to server.js location
COPY --from=builder /build/apps/web/.next/static/ /workspace/vibe-web/apps/web/.next/static/
# Copy public files relative to server.js location  
COPY --from=builder /build/apps/web/public/ /workspace/vibe-web/apps/web/public/

# Copy configuration files
COPY --chown=root:root supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --chown=root:root scripts/ /scripts/
COPY --chown=root:root docker-entrypoint.sh /docker-entrypoint.sh

# Make scripts executable and create symlinks for user commands
RUN chmod +x /docker-entrypoint.sh /scripts/*.sh /scripts/*.mjs && \
    ln -s /scripts/init-project.sh /usr/local/bin/init-project && \
    ln -s /scripts/claude-wrapper.mjs /usr/local/bin/claude-wrapper && \
    ln -s /scripts/vibe-kanban-cleanup.mjs /usr/local/bin/vibe-kanban-cleanup && \
    ln -s /scripts/start-task-command.mjs /usr/local/bin/vibe-start-task && \
    ln -s /scripts/vibe-kanban-taskpicker.mjs /usr/local/bin/vibe-kanban-taskpicker && \
    ln -s /scripts/setup-verify.sh /usr/local/bin/setup-verify && \
    ln -s /scripts/setup-storage-credentials.sh /usr/local/bin/setup-storage-credentials && \
    ln -s /scripts/setup-storage-data.sh /usr/local/bin/setup-storage-data && \
    chown -R developer:developer /workspace/project /workspace/vibe-web

# Expose ports - designed to be remapped with PORT_PREFIX
# SSH (9090), Vibe-Kanban (9091), Vibe-Remote-Web (8080), Development servers (3000-3010)
EXPOSE 9090 9091 8080 3000-3010

WORKDIR /workspace

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]