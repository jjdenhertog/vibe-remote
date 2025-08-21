#!/bin/bash
# Verify that the workstation is properly configured
# Returns 0 if everything is set up, 1 if setup is needed

ISSUES_FOUND=0
WARNINGS=""
ERRORS=""

# Check if we're in first-time setup mode (no credentials directory)
if [ ! -d "/workspace/credentials" ]; then
    # First boot - this is expected
    exit 0
fi

echo "🔍 Verifying workstation setup..."

# Check Claude authentication
# Claude stores auth in claude.json at the root of credentials
if [ ! -f "/workspace/credentials/claude.json" ] || [ ! -s "/workspace/credentials/claude.json" ]; then
    WARNINGS="${WARNINGS}⚠️  Claude Code not authenticated - run: claude\n"
    ISSUES_FOUND=1
fi

# Check GitHub CLI authentication
if [ ! -f "/workspace/credentials/gh/hosts.yml" ]; then
    WARNINGS="${WARNINGS}⚠️  GitHub CLI not authenticated - run: gh auth login\n"
    ISSUES_FOUND=1
fi

# Check Git configuration
if [ ! -f "/workspace/credentials/git/gitconfig" ] || \
   ! grep -q "user.name" /workspace/credentials/git/gitconfig 2>/dev/null; then
    if [ -z "$GIT_USERNAME" ]; then
        WARNINGS="${WARNINGS}⚠️  Git user not configured - run: git config --global user.name \"Your Name\" or set GIT_USERNAME env var\n"
        ISSUES_FOUND=1
    fi
fi

if [ ! -f "/workspace/credentials/git/gitconfig" ] || \
   ! grep -q "user.email" /workspace/credentials/git/gitconfig 2>/dev/null; then
    if [ -z "$GIT_USEREMAIL" ]; then
        WARNINGS="${WARNINGS}⚠️  Git email not configured - run: git config --global user.email \"your@email.com\" or set GIT_USEREMAIL env var\n"
        ISSUES_FOUND=1
    fi
fi

# Check if workspace has a project
if [ ! -d "/workspace/project/.git" ] && [ ! -d "/workspace/project" ]; then
    WARNINGS="${WARNINGS}ℹ️  No project cloned yet - run: cd /workspace && gh repo clone user/repo project\n"
fi

# Output results
if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo "✅ Workstation fully configured and ready!"
elif [ "$ISSUES_FOUND" -eq 1 ]; then
    echo ""
    echo "📋 Setup Checklist:"
    echo -e "$WARNINGS"
elif [ "$ISSUES_FOUND" -eq 2 ]; then
    echo ""
    echo "⚠️  Issues detected:"
    echo -e "$ERRORS"
    echo -e "$WARNINGS"
fi

exit $ISSUES_FOUND