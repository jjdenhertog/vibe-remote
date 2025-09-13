#!/bin/bash
set -e

# shellcheck disable=SC2086  # Intentional word splitting for some variables

echo "🚀 Vibe Remote Development Environment Starting..."
echo "=============================================="

# Default values
USERNAME=${USERNAME:-developer}
USER_ID=${USER_ID:-1000}
GROUP_ID=${GROUP_ID:-1000}

# Export Vibe Kanban URL for the web interface (only if provided)
if [ -n "${VIBE_KANBAN_URL}" ]; then
    echo "✅ VIBE_KANBAN_URL configured: ${VIBE_KANBAN_URL}"
    export VIBE_KANBAN_URL="${VIBE_KANBAN_URL}"
    # Make it available globally for SSH sessions and other processes
    echo "export VIBE_KANBAN_URL=\"${VIBE_KANBAN_URL}\"" >> /etc/environment
    echo "VIBE_KANBAN_URL=\"${VIBE_KANBAN_URL}\"" >> /etc/environment
fi

# Update user ID and group ID if they differ from build args
CURRENT_UID=$(id -u ${USERNAME} 2>/dev/null || echo "")
CURRENT_GID=$(id -g ${USERNAME} 2>/dev/null || echo "")

if [ "${CURRENT_UID}" != "${USER_ID}" ] || [ "${CURRENT_GID}" != "${GROUP_ID}" ]; then
    echo "🔧 Updating user ${USERNAME} to UID:GID ${USER_ID}:${GROUP_ID}..."
    
    # Update group ID
    if [ "${CURRENT_GID}" != "${GROUP_ID}" ]; then
        groupmod -g ${GROUP_ID} ${USERNAME} 2>/dev/null || echo "Warning: Could not update group ID"
    fi
    
    # Update user ID
    if [ "${CURRENT_UID}" != "${USER_ID}" ]; then
        usermod -u ${USER_ID} ${USERNAME} 2>/dev/null || echo "Warning: Could not update user ID"
    fi
    
    # Fix ownership of home directory
    chown -R ${USER_ID}:${GROUP_ID} /home/${USERNAME}
fi

# Set up authentication
if [ -n "$SSH_PASSWORD" ]; then
    echo "${USERNAME}:$SSH_PASSWORD" | chpasswd
    echo "✅ SSH password configured"
elif [ -n "$DEVELOPER_PASSWORD" ]; then
    echo "${USERNAME}:$DEVELOPER_PASSWORD" | chpasswd
    echo "✅ Developer password configured"
else
    echo "${USERNAME}:changeme" | chpasswd
    echo "⚠️  Using default password 'changeme'"
fi

# Set up SSH public key if provided
if [ -n "${PUBLIC_KEY}" ]; then
    echo "🔑 Setting up SSH public key authentication..."
    mkdir -p /home/${USERNAME}/.ssh
    echo "${PUBLIC_KEY}" > /home/${USERNAME}/.ssh/authorized_keys
    chown -R ${USER_ID}:${GROUP_ID} /home/${USERNAME}/.ssh
    chmod 700 /home/${USERNAME}/.ssh
    chmod 600 /home/${USERNAME}/.ssh/authorized_keys
    echo "✅ SSH public key configured"
fi

# Configure git safe directory for workspace and project
su - developer -c "git config --global --add safe.directory /workspace"
su - developer -c "git config --global --add safe.directory /workspace/project"
su - developer -c "git config --global --add safe.directory '*'"

# Auto-configure Git username and email if environment variables are provided
if [ -n "$GIT_USERNAME" ]; then
    echo "🔧 Configuring Git username..."
    su - developer -c "git config --global user.name \"$GIT_USERNAME\""
    echo "✅ Git username configured: $GIT_USERNAME"
fi

if [ -n "$GIT_USEREMAIL" ]; then
    echo "🔧 Configuring Git email..."
    su - developer -c "git config --global user.email \"$GIT_USEREMAIL\""
    echo "✅ Git email configured: $GIT_USEREMAIL"
fi

# Auto-configure GitHub CLI authentication if token is provided
if [ -n "$GITHUB_TOKEN" ] || [ -n "$GH_TOKEN" ]; then
    echo "🔧 Configuring GitHub CLI authentication..."
    
    # Use GH_TOKEN if GITHUB_TOKEN is not set
    if [ -z "$GH_TOKEN" ] && [ -n "$GITHUB_TOKEN" ]; then
        export GH_TOKEN="$GITHUB_TOKEN"
    fi
    
    # Make it available globally for SSH sessions and other processes
    echo "export GH_TOKEN=\"${GH_TOKEN}\"" >> /etc/environment
    
    # Also make it available for the developer user
    echo "export GH_TOKEN=\"${GH_TOKEN}\"" >> /home/${USERNAME}/.bashrc
    
    # Disable interactive prompts for non-interactive use
    echo "export GH_PROMPT_DISABLED=1" >> /etc/environment
    echo "export GH_PROMPT_DISABLED=1" >> /home/${USERNAME}/.bashrc
    
    # Verify the token works by checking auth status
    if su - ${USERNAME} -c "GH_TOKEN=\"${GH_TOKEN}\" gh auth status" &>/dev/null; then
        echo "✅ GitHub CLI authentication configured and verified with token"
    else
        echo "⚠️  GitHub CLI token configured but verification failed. Token may be invalid or expired."
    fi
fi

# Set up persistent credential storage (must be done early)
echo "🔐 Setting up persistent credential storage..."
/scripts/setup-storage-credentials.sh

echo "🔧 Setting up persistent data storage..."
/scripts/setup-storage-data.sh

# Ensure workspace directories exist and have correct permissions
for dir in /workspace /workspace/credentials /workspace/project /workspace/data; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
    fi
    chown ${USER_ID}:${GROUP_ID} "$dir"
done

# Ensure npm global path is set for the developer user persistently
if ! grep -q "/.npm-global/bin" /home/developer/.bashrc 2>/dev/null; then
    echo 'export PATH="/home/developer/.npm-global/bin:$PATH"' >> /home/developer/.bashrc
fi
export PATH=/home/developer/.npm-global/bin:$PATH

# Create welcome message for SSH login
cat > /etc/motd << 'EOF'

🚀 Vibe Remote Development Environment

Quick Start:
  1. claude login         # Authenticate (one-time, persists!)
  2. gh auth login        # GitHub authentication (or use GITHUB_TOKEN/GH_TOKEN env var)
  3. git config --global user.name "Your Name"  # Or set GIT_USERNAME env var
  4. git config --global user.email "your@email.com"  # Or set GIT_USEREMAIL env var
  5. cd /workspace/project && gh repo clone user/repo .
  6. cd /workspace/project && init-project  # Initialize AI tools

EOF

# Run verification check
if [ -f "/scripts/setup-verify.sh" ]; then
    /scripts/setup-verify.sh || echo "Warning: Verification script reported issues"
fi

echo "✅ Workstation Ready!"

exec "$@"