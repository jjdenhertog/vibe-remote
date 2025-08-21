#!/bin/bash
# Initialize AI tools for the current project
# Run this after cloning your repository

set -e

echo "🚀 Modifying gitignore..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: Not in a git repository. Please clone your project first."
    echo "   Example: cd /workspace && gh repo clone user/repo project"
    echo "   Then: cd project && init-project"
    exit 1
fi

# Update .gitignore with AI tool directories
echo "📝 Updating .gitignore with AI tool directories..."

# Function to add entry to .gitignore if not already present
add_to_gitignore() {
    local entry="$1"
    if ! grep -qx "$entry" .gitignore 2>/dev/null; then
        echo "$entry" >> .gitignore
    fi
}

# Add header comment if not present
if ! grep -q "# Vibe Remote files and initiated folders" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Vibe Remote files and initiated folders" >> .gitignore
fi

# Add each entry
add_to_gitignore ".claude-flow-initialized"
add_to_gitignore ".roomodes"
add_to_gitignore "CLAUDE.md"
add_to_gitignore ".claude-flow"
add_to_gitignore ".claude"
add_to_gitignore "memory"
add_to_gitignore ".roo"
add_to_gitignore ".pnpm-store"