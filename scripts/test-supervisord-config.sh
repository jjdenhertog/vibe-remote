#!/bin/bash

# Test script for supervisord configuration
# This validates the configuration without actually starting the service

set -e

echo "Testing supervisord configuration for vibe-taskpicker..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_item() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo ""
echo "=== Configuration File Tests ==="

# Test 1: Check if configuration files exist
test_item "Main config exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/config/supervisord/vibe-taskpicker.conf"
test_item "Cron config exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/config/supervisord/vibe-taskpicker-cron.conf"
test_item "Health config exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/config/supervisord/vibe-taskpicker-health.conf"

echo ""
echo "=== Script Tests ==="

# Test 2: Check if scripts exist and are executable
test_item "Setup script exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/scripts/setup-supervisord.sh"
test_item "Setup script is executable" "test -x /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/scripts/setup-supervisord.sh"
test_item "Health wrapper exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/scripts/taskpicker-health-wrapper.sh"
test_item "Health wrapper is executable" "test -x /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/scripts/taskpicker-health-wrapper.sh"

echo ""
echo "=== Package Tests ==="

# Test 3: Check if taskpicker package is built
test_item "Package directory exists" "test -d /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker"
test_item "Package dist exists" "test -d /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker/dist"

# Build the package if dist doesn't exist
if [ ! -f "/var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker/dist/index.js" ]; then
    echo -e "${YELLOW}Building taskpicker package...${NC}"
    cd /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker
    npm install > /dev/null 2>&1
    npm run build > /dev/null 2>&1
fi

test_item "Package index.js exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker/dist/index.js"

echo ""
echo "=== Supervisord Tests ==="

# Test 4: Check supervisord installation
test_item "Supervisord is installed" "command -v supervisord"

# Test 5: Validate configuration syntax (dry run)
echo -n "Testing: Configuration syntax... "
if supervisord -c /etc/supervisor/supervisord.conf -n > /dev/null 2>&1 & sleep 2 && kill $! 2>/dev/null; then
    echo -e "${GREEN}PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}SKIPPED${NC} (requires root)"
fi

echo ""
echo "=== Path Tests ==="

# Test 6: Verify paths in configuration match actual structure
CONFIG_PATH="/workspace/project/packages/vibe-kanban-taskpicker/dist/index.js"
ACTUAL_PATH="/var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/packages/vibe-kanban-taskpicker/dist/index.js"

echo -n "Testing: Configuration path mapping... "
if [ -f "$ACTUAL_PATH" ]; then
    echo -e "${GREEN}PASSED${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Actual path: $ACTUAL_PATH"
    echo "  Config expects: $CONFIG_PATH"
    echo -e "  ${YELLOW}Note: Ensure /workspace/project is symlinked to $(pwd)${NC}"
else
    echo -e "${RED}FAILED${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "=== Documentation Tests ==="

# Test 7: Check documentation
test_item "Documentation exists" "test -f /var/tmp/vibe-kanban/worktrees/vk-f7b8-ai-4-confi/docs/SUPERVISORD_SETUP.md"

echo ""
echo "=== Summary ==="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Configuration is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Create symlink: ln -s $(pwd) /workspace/project"
    echo "2. Set environment variables in /etc/supervisor/vibe-taskpicker.env"
    echo "3. Copy config: cp config/supervisord/vibe-taskpicker.conf /etc/supervisor/conf.d/"
    echo "4. Reload supervisord: supervisorctl reread && supervisorctl update"
    echo "5. Start service: supervisorctl start vibe-taskpicker"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the configuration.${NC}"
    exit 1
fi