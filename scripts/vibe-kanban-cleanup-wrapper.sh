#!/bin/bash
# Temporary wrapper to use the correctly built cleanup script
# This avoids the axios dependency issue in the /scripts version

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Use the built version from packages instead of /scripts
exec node "$PROJECT_ROOT/packages/vibe-kanban-cleanup/dist/vibe-kanban-cleanup.js" "$@"