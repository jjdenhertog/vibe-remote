#!/bin/bash
# Script to set up persistent data storage
# This ensures workspace data persists across container recreations
# Project-specific data (Vibe-Kanban, Claude-Flow) stays in the project directory

set -e

# shellcheck disable=SC2174  # We want to set both mode and ownership

USERNAME=${USERNAME:-developer}
USER_ID=${USER_ID:-1000}
GROUP_ID=${GROUP_ID:-1000}

# Create data directory structure in workspace
DATA_DIR="/workspace/data"

# Create all directories at once
mkdir -p \
    "${DATA_DIR}/bashhistory" \
    "${DATA_DIR}/npm" \
    "${DATA_DIR}/vibe-kanban"

chown -R ${USER_ID}:${GROUP_ID} "${DATA_DIR}"
chmod 700 "${DATA_DIR}"


# Set up bash history symlink
echo "Storing workspace data in ${DATA_DIR}:"

if [ ! -L /home/${USERNAME}/.bash_history ]; then
    if [ -f /home/${USERNAME}/.bash_history ]; then
        mv /home/${USERNAME}/.bash_history "${DATA_DIR}/bashhistory/bash_history" 2>/dev/null || echo "Note: Could not move existing bash history"
    fi
    touch "${DATA_DIR}/bashhistory/bash_history"
    ln -sf "${DATA_DIR}/bashhistory/bash_history" /home/${USERNAME}/.bash_history
    echo "✅ Bash history"
fi

# Set up NPM configuration symlink
if [ ! -L /home/${USERNAME}/.npmrc ]; then
    if [ -f /home/${USERNAME}/.npmrc ]; then
        mv /home/${USERNAME}/.npmrc "${DATA_DIR}/npm/npmrc" 2>/dev/null || echo "Note: Could not move existing npmrc"
    fi
    touch "${DATA_DIR}/npm/npmrc"
    ln -sf "${DATA_DIR}/npm/npmrc" /home/${USERNAME}/.npmrc
    echo "✅ NPM config"
fi

# Set up Vibe-Kanban data symlink
mkdir -p /home/${USERNAME}/.local/share
if [ ! -L /home/${USERNAME}/.local/share/vibe-kanban ]; then
    if [ -d /home/${USERNAME}/.local/share/vibe-kanban ]; then
        mv /home/${USERNAME}/.local/share/vibe-kanban "${DATA_DIR}/vibe-kanban" 2>/dev/null || echo "Note: Could not move existing vibe-kanban data"
    fi
    ln -sf "${DATA_DIR}/vibe-kanban" /home/${USERNAME}/.local/share/vibe-kanban
    echo "✅ Vibe-Kanban"
fi


# Ensure proper permissions on all data directories at once
find "${DATA_DIR}" -type d -exec chmod 700 {} \;

echo "✅ Persistent data storage setup complete!"
echo "📁 Data stored in: /workspace/data/"
echo "   • Bash history: ~/.bash_history → ${DATA_DIR}/bashhistory"
echo "   • NPM config: ~/.npmrc → ${DATA_DIR}/npm"
echo "   • Vibe-Kanban: ~/.local/share/vibe-kanban → ${DATA_DIR}/vibe-kanban"
echo ""