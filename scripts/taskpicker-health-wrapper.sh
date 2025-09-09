#!/bin/bash

# Health check wrapper for vibe-taskpicker
# This script monitors the taskpicker and provides health checks

# Configuration
PROJECT_ROOT="${PROJECT_ROOT:-/workspace/project}"
TASKPICKER_CMD="node $PROJECT_ROOT/packages/vibe-kanban-taskpicker/dist/index.js"
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-60}
MAX_CONSECUTIVE_FAILURES=${MAX_CONSECUTIVE_FAILURES:-3}
LOG_FILE="/var/log/supervisor/vibe-taskpicker-health.log"
PID_FILE="/var/run/vibe-taskpicker.pid"

# Counters
consecutive_failures=0
total_runs=0
successful_runs=0

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Health check function
check_health() {
    # Check if Vibe API is accessible
    if curl -s -f -o /dev/null "http://localhost:3001/health" 2>/dev/null; then
        return 0
    else
        log "WARNING: Vibe API health check failed"
        return 1
    fi
}

# Cleanup function
cleanup() {
    log "Shutting down taskpicker health wrapper..."
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Write PID file
echo $$ > "$PID_FILE"

log "Starting vibe-taskpicker health wrapper"
log "Configuration:"
log "  - Check interval: ${TASK_CHECK_INTERVAL:-300} seconds"
log "  - Health check interval: $HEALTH_CHECK_INTERVAL seconds"
log "  - Max consecutive failures: $MAX_CONSECUTIVE_FAILURES"

# Main loop
while true; do
    # Perform health check
    if check_health; then
        log "Health check passed"
        consecutive_failures=0
        
        # Run the taskpicker
        log "Executing taskpicker (run #$((total_runs + 1)))"
        start_time=$(date +%s)
        
        if $TASKPICKER_CMD; then
            end_time=$(date +%s)
            duration=$((end_time - start_time))
            successful_runs=$((successful_runs + 1))
            log "Taskpicker completed successfully (duration: ${duration}s)"
            
            # Reset failure counter on success
            consecutive_failures=0
        else
            exit_code=$?
            log "ERROR: Taskpicker failed with exit code $exit_code"
            consecutive_failures=$((consecutive_failures + 1))
            
            if [ $consecutive_failures -ge $MAX_CONSECUTIVE_FAILURES ]; then
                log "CRITICAL: Maximum consecutive failures reached ($MAX_CONSECUTIVE_FAILURES)"
                
                # Send notification if email is configured
                if [ -n "$FAILURE_NOTIFICATION_EMAIL" ]; then
                    echo "Vibe taskpicker has failed $MAX_CONSECUTIVE_FAILURES times consecutively" | \
                        mail -s "Vibe Taskpicker Critical Failure" "$FAILURE_NOTIFICATION_EMAIL" 2>/dev/null || true
                fi
                
                # Exit to trigger supervisord restart
                exit 1
            fi
        fi
        
        total_runs=$((total_runs + 1))
        
        # Log statistics
        if [ $((total_runs % 10)) -eq 0 ]; then
            success_rate=$((successful_runs * 100 / total_runs))
            log "Statistics: Total runs: $total_runs, Successful: $successful_runs, Success rate: ${success_rate}%"
        fi
        
    else
        log "Health check failed, skipping taskpicker execution"
        consecutive_failures=$((consecutive_failures + 1))
        
        if [ $consecutive_failures -ge $MAX_CONSECUTIVE_FAILURES ]; then
            log "CRITICAL: Health checks failed $MAX_CONSECUTIVE_FAILURES times"
            exit 1
        fi
    fi
    
    # Wait for the next interval
    log "Waiting ${TASK_CHECK_INTERVAL:-300} seconds until next run..."
    sleep ${TASK_CHECK_INTERVAL:-300}
done