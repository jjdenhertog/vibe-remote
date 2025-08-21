#!/bin/bash
# claude-flow-wrapper
# Check if stdin has data
if [[ -t 0 ]]; then
    PROMPT=""
else
    STDIN_INPUT=$(timeout 1 cat)
    if [[ -n "$STDIN_INPUT" ]]; then
        PROMPT="$STDIN_INPUT"
    fi
fi

# Extract MODE (first argument if it exists)
MODE="${1:-swarm}"
shift

# Parse remaining arguments for flags
FLAGS=""
while [[ $# -gt 0 ]]; do
    FLAGS="$FLAGS $1"
    shift
done

# Trim spaces
FLAGS="${FLAGS# }"

# If we found a prompt from stdin, use it
if [[ -n "$PROMPT" ]]; then
    # Always use a temporary file to avoid E2BIG errors
    PROMPT_FILE=$(mktemp /tmp/claude-flow-prompt.XXXXXX)
    echo "$PROMPT" > "$PROMPT_FILE"
    # Pass a prompt telling claude-flow to read from the file
    npx -y claude-flow@alpha $MODE "Read your objective here: $PROMPT_FILE" $FLAGS
    rm -f "$PROMPT_FILE"
fi