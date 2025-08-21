#!/bin/bash
# Script to set up persistent credential storage
# This ensures authentication and credentials persist across container recreations
# Project-specific data (Vibe-Kanban, Claude-Flow) stays in the project directory

set -e

# shellcheck disable=SC2174  # We want to set both mode and ownership

USERNAME=${USERNAME:-developer}
USER_ID=${USER_ID:-1000}
GROUP_ID=${GROUP_ID:-1000}

# Create credentials directory structure in workspace
CREDS_DIR="/workspace/credentials"

# Create all directories at once
mkdir -p \
    "${CREDS_DIR}/ssh" \
    "${CREDS_DIR}/git" \
    "${CREDS_DIR}/gh" \
    "${CREDS_DIR}/claude" \
    "${CREDS_DIR}/claude-config"

chown -R ${USER_ID}:${GROUP_ID} "${CREDS_DIR}"
chmod 700 "${CREDS_DIR}"

# ========================================
# CREDENTIALS - Persist across all projects
# ========================================

# Set up symlinks for SSH directory
if [ ! -L /home/${USERNAME}/.ssh ] || [ ! -e /home/${USERNAME}/.ssh ]; then
    rm -rf /home/${USERNAME}/.ssh
    ln -sf "${CREDS_DIR}/ssh" /home/${USERNAME}/.ssh
    echo "✅ SSH keys will be stored in workspace"
fi

# Set up Git configuration symlink
if [ ! -L /home/${USERNAME}/.gitconfig ]; then
    if [ -f /home/${USERNAME}/.gitconfig ]; then
        mv /home/${USERNAME}/.gitconfig "${CREDS_DIR}/git/gitconfig" 2>/dev/null || echo "Note: Could not move existing .gitconfig"
    fi
    ln -sf "${CREDS_DIR}/git/gitconfig" /home/${USERNAME}/.gitconfig
    echo "✅ Git config will be stored in workspace"
fi

# Set up GitHub CLI configuration symlink
if [ ! -L /home/${USERNAME}/.config/gh ]; then
    mkdir -p /home/${USERNAME}/.config
    if [ -d /home/${USERNAME}/.config/gh ]; then
        mv /home/${USERNAME}/.config/gh/* "${CREDS_DIR}/gh/" 2>/dev/null || echo "Note: Could not move existing gh config"
        rm -rf /home/${USERNAME}/.config/gh
    fi
    ln -sf "${CREDS_DIR}/gh" /home/${USERNAME}/.config/gh
    echo "✅ GitHub CLI config will be stored in workspace"
fi

# Set up Claude Code configuration symlink
if [ ! -L /home/${USERNAME}/.config/claude-code ]; then
    mkdir -p /home/${USERNAME}/.config
    chown ${USER_ID}:${GROUP_ID} /home/${USERNAME}/.config
    if [ -d /home/${USERNAME}/.config/claude-code ]; then
        mv /home/${USERNAME}/.config/claude-code/* "${CREDS_DIR}/claude/" 2>/dev/null || echo "Note: Could not move existing claude-code config"
        rm -rf /home/${USERNAME}/.config/claude-code
    fi
    ln -sf "${CREDS_DIR}/claude" /home/${USERNAME}/.config/claude-code
    chown -h ${USER_ID}:${GROUP_ID} /home/${USERNAME}/.config/claude-code
    echo "✅ Claude Code config will be stored in workspace"
fi

# Set up .claude directory symlink (for CLAUDE_CONFIG_DIR)
if [ ! -L /home/${USERNAME}/.claude ]; then
    if [ -d /home/${USERNAME}/.claude ]; then
        mv /home/${USERNAME}/.claude/* "${CREDS_DIR}/claude-config/" 2>/dev/null || echo "Note: Could not move existing .claude config"
        rm -rf /home/${USERNAME}/.claude
    fi
    ln -sf "${CREDS_DIR}/claude-config" /home/${USERNAME}/.claude
    echo "✅ Claude config directory will be stored in workspace"
fi

# Set up claude.json symlink (CRITICAL for persistent auth)
if [ ! -L /home/${USERNAME}/.claude.json ]; then
    # Create claude.json if it doesn't exist
    if [ ! -f "${CREDS_DIR}/claude.json" ]; then
        echo "{}" > "${CREDS_DIR}/claude.json"
        chown ${USER_ID}:${GROUP_ID} "${CREDS_DIR}/claude.json"
    fi
    
    # Move existing claude.json if present
    if [ -f /home/${USERNAME}/.claude.json ]; then
        mv /home/${USERNAME}/.claude.json "${CREDS_DIR}/claude.json" 2>/dev/null || echo "Note: Could not move existing claude.json"
    fi
    
    # Create symlink
    ln -sf "${CREDS_DIR}/claude.json" /home/${USERNAME}/.claude.json
    chown -h ${USER_ID}:${GROUP_ID} /home/${USERNAME}/.claude.json
    echo "✅ Claude.json will be stored in workspace"
fi


# Ensure proper permissions on all credential directories at once
find "${CREDS_DIR}" -type d -exec chmod 700 {} \;

echo "✅ Persistent credential storage setup complete!"
echo ""
echo "📁 Credentials stored in: /workspace/credentials/"
echo "   • SSH keys: ~/.ssh → ${CREDS_DIR}/ssh"
echo "   • Git config: ~/.gitconfig → ${CREDS_DIR}/git"
echo "   • GitHub CLI: ~/.config/gh → ${CREDS_DIR}/gh"
echo "   • Claude Code: ~/.config/claude-code → ${CREDS_DIR}/claude"
echo "   • Claude Config: ~/.claude → ${CREDS_DIR}/claude-config"
echo "   • Claude Auth: ~/.claude.json → ${CREDS_DIR}/claude.json"