#!/bin/bash

# Setup script for vibe-taskpicker supervisord configuration
# This script installs and configures supervisord to run the taskpicker service

set -e

echo "Setting up supervisord for vibe-taskpicker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root (needed for Docker)
if [ "$EUID" -ne 0 ]; then 
   echo -e "${YELLOW}Warning: Not running as root. Some operations may require sudo.${NC}"
fi

# Create log directories
echo "Creating log directories..."
mkdir -p /var/log/supervisor
chmod 755 /var/log/supervisor

# Check if supervisord is installed
if ! command -v supervisord &> /dev/null; then
    echo -e "${YELLOW}supervisord not found. Installing...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update && apt-get install -y supervisor
    elif command -v yum &> /dev/null; then
        yum install -y supervisor
    elif command -v apk &> /dev/null; then
        apk add --no-cache supervisor
    else
        echo -e "${RED}Cannot install supervisord. Please install it manually.${NC}"
        exit 1
    fi
fi

# Determine project root
PROJECT_ROOT="${PROJECT_ROOT:-/workspace/project}"
if [ ! -d "$PROJECT_ROOT" ]; then
    # Use current working directory if /workspace/project doesn't exist
    PROJECT_ROOT="$(pwd)"
    echo -e "${YELLOW}Using current directory as PROJECT_ROOT: $PROJECT_ROOT${NC}"
fi

# Build the taskpicker package
echo "Building vibe-kanban-taskpicker..."
cd "$PROJECT_ROOT/packages/vibe-kanban-taskpicker"
if [ -f "package.json" ]; then
    npm install
    npm run build
    echo -e "${GREEN}Build completed successfully${NC}"
else
    echo -e "${RED}package.json not found in taskpicker directory${NC}"
    exit 1
fi

# Copy supervisord configuration
echo "Installing supervisord configuration..."
SUPERVISOR_CONF_DIR="/etc/supervisor/conf.d"
if [ ! -d "$SUPERVISOR_CONF_DIR" ]; then
    SUPERVISOR_CONF_DIR="/etc/supervisord.d"
    if [ ! -d "$SUPERVISOR_CONF_DIR" ]; then
        mkdir -p "$SUPERVISOR_CONF_DIR"
    fi
fi

# Copy the main configuration
cp "$PROJECT_ROOT/config/supervisord/vibe-taskpicker.conf" "$SUPERVISOR_CONF_DIR/"
echo -e "${GREEN}Configuration installed to $SUPERVISOR_CONF_DIR/${NC}"

# Create environment file for sensitive variables
ENV_FILE="/etc/supervisor/vibe-taskpicker.env"
cat > "$ENV_FILE" << EOF
# Environment variables for vibe-taskpicker
# Edit this file to add your API keys and configuration

# Project root directory
PROJECT_ROOT=$PROJECT_ROOT

# Claude/Anthropic API Key (required)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here

# Vibe Project Configuration
VIBE_PROJECT_ID=default-project-id

# Optional: Override default settings
# VIBE_API_URL=http://localhost:3001
# TASK_CHECK_INTERVAL=300
# LOG_LEVEL=info
# ADMIN_EMAIL=admin@example.com
EOF

chmod 600 "$ENV_FILE"
echo -e "${YELLOW}Created environment file at $ENV_FILE${NC}"
echo -e "${YELLOW}Please edit this file and add your API keys${NC}"

# Create a helper script for managing the service
cat > /usr/local/bin/vibe-taskpicker-ctl << 'EOF'
#!/bin/bash

# Control script for vibe-taskpicker service

case "$1" in
    start)
        supervisorctl start vibe-taskpicker
        ;;
    stop)
        supervisorctl stop vibe-taskpicker
        ;;
    restart)
        supervisorctl restart vibe-taskpicker
        ;;
    status)
        supervisorctl status vibe-taskpicker
        ;;
    logs)
        tail -f /var/log/supervisor/vibe-taskpicker.out.log
        ;;
    errors)
        tail -f /var/log/supervisor/vibe-taskpicker.err.log
        ;;
    test)
        echo "Testing taskpicker configuration..."
        PROJECT_ROOT="${PROJECT_ROOT:-/workspace/project}"
        cd "$PROJECT_ROOT"
        node packages/vibe-kanban-taskpicker/dist/index.js
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|errors|test}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/vibe-taskpicker-ctl
echo -e "${GREEN}Created control script: vibe-taskpicker-ctl${NC}"

# Reload supervisord configuration
echo "Reloading supervisord configuration..."
if command -v supervisorctl &> /dev/null; then
    supervisorctl reread
    supervisorctl update
    echo -e "${GREEN}Supervisord configuration reloaded${NC}"
else
    echo -e "${YELLOW}Please reload supervisord manually${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Edit /etc/supervisor/vibe-taskpicker.env and add your API keys"
echo "2. Start the service: vibe-taskpicker-ctl start"
echo "3. Check status: vibe-taskpicker-ctl status"
echo "4. View logs: vibe-taskpicker-ctl logs"
echo "5. View errors: vibe-taskpicker-ctl errors"
echo ""
echo "The taskpicker will run every 5 minutes and process tasks automatically."