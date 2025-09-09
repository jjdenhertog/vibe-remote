# Supervisord Configuration for Vibe-Kanban-Taskpicker

This document describes the supervisord setup for automatically running the vibe-kanban-taskpicker service at regular intervals.

## Overview

The vibe-kanban-taskpicker is configured to run under supervisord, which provides:
- Automatic startup when the container starts
- Automatic restart on failures
- Comprehensive logging
- Health monitoring
- Resource management

## Configuration Files

### 1. Main Configuration: `/config/supervisord/vibe-taskpicker.conf`
- Standard supervisord configuration
- Runs the taskpicker continuously with 5-minute intervals
- Automatic restart on failure
- Comprehensive logging with rotation

### 2. Cron-style Configuration: `/config/supervisord/vibe-taskpicker-cron.conf`
- Alternative configuration using a bash loop
- Runs taskpicker every 5 minutes
- Better for scheduled execution patterns

### 3. Health-monitored Configuration: `/config/supervisord/vibe-taskpicker-health.conf`
- Enhanced configuration with health checks
- Monitors Vibe API availability
- Tracks success/failure rates
- Sends notifications on critical failures

## Installation

### Quick Setup

Run the automated setup script:

```bash
/workspace/project/scripts/setup-supervisord.sh
```

This script will:
1. Create necessary log directories
2. Install supervisord if not present
3. Build the taskpicker package
4. Install configuration files
5. Create environment variable file
6. Set up control scripts

### Manual Setup

1. **Build the taskpicker:**
```bash
cd /workspace/project/packages/vibe-kanban-taskpicker
npm install
npm run build
```

2. **Copy configuration:**
```bash
cp /workspace/project/config/supervisord/vibe-taskpicker.conf /etc/supervisor/conf.d/
```

3. **Configure environment variables:**
Create `/etc/supervisor/vibe-taskpicker.env`:
```env
ANTHROPIC_API_KEY=your-api-key-here
CLAUDE_API_KEY=your-claude-key-here
VIBE_PROJECT_ID=your-project-id
```

4. **Reload supervisord:**
```bash
supervisorctl reread
supervisorctl update
```

## Environment Variables

The service uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `CLAUDE_COMMAND` | Claude CLI command | `claude` |
| `VIBE_API_URL` | Vibe API endpoint | `http://localhost:3001` |
| `TASK_CHECK_INTERVAL` | Interval between task checks (seconds) | `300` |
| `LOG_LEVEL` | Logging level | `info` |
| `ANTHROPIC_API_KEY` | Anthropic API key | Required |
| `CLAUDE_API_KEY` | Claude API key | Required |
| `VIBE_PROJECT_ID` | Vibe project ID | Required |

## Management Commands

Use the `vibe-taskpicker-ctl` command for service management:

```bash
# Start the service
vibe-taskpicker-ctl start

# Stop the service
vibe-taskpicker-ctl stop

# Restart the service
vibe-taskpicker-ctl restart

# Check service status
vibe-taskpicker-ctl status

# View live logs
vibe-taskpicker-ctl logs

# View error logs
vibe-taskpicker-ctl errors

# Test the configuration
vibe-taskpicker-ctl test
```

## Logging

Logs are stored in `/var/log/supervisor/`:

- `vibe-taskpicker.out.log` - Standard output
- `vibe-taskpicker.err.log` - Error output
- `vibe-taskpicker-health.log` - Health check logs (if using health config)

Log rotation is configured with:
- Maximum file size: 10MB (20MB for health config)
- Backup count: 5 (10 for health config)

## Monitoring

### Basic Monitoring
```bash
# Check if service is running
supervisorctl status vibe-taskpicker

# View recent logs
tail -n 100 /var/log/supervisor/vibe-taskpicker.out.log

# Monitor in real-time
tail -f /var/log/supervisor/vibe-taskpicker.out.log
```

### Advanced Monitoring (Health Configuration)

The health configuration provides:
- Automatic health checks before each run
- Success/failure rate tracking
- Critical failure detection
- Email notifications (if configured)

## Troubleshooting

### Service Won't Start

1. Check configuration syntax:
```bash
supervisord -c /etc/supervisor/supervisord.conf -n
```

2. Verify paths exist:
```bash
ls -la /workspace/project/packages/vibe-kanban-taskpicker/dist/index.js
```

3. Check API keys are set:
```bash
cat /etc/supervisor/vibe-taskpicker.env
```

### Service Keeps Restarting

1. Check error logs:
```bash
tail -n 50 /var/log/supervisor/vibe-taskpicker.err.log
```

2. Test manually:
```bash
cd /workspace/project
node packages/vibe-kanban-taskpicker/dist/index.js
```

3. Verify Vibe API is running:
```bash
curl http://localhost:3001/health
```

### No Tasks Being Processed

1. Verify project ID is correct
2. Check Claude API credentials
3. Review task selection criteria in logs
4. Ensure tasks exist in the specified project

## Security Considerations

1. **API Keys**: Store in environment file with restricted permissions (600)
2. **User Permissions**: Run as non-root user when possible
3. **Log Access**: Restrict log directory permissions
4. **Network Access**: Ensure Vibe API is only accessible locally

## Performance Tuning

### Adjust Check Interval
Modify `TASK_CHECK_INTERVAL` to change execution frequency:
- `60` - Every minute (high frequency)
- `300` - Every 5 minutes (default)
- `900` - Every 15 minutes (low frequency)

### Resource Limits
Add to configuration for resource management:
```ini
[program:vibe-taskpicker]
# ... existing config ...
# Resource limits
priority=999
numprocs=1
```

### Startup Order
Set `priority` to control startup order relative to other services:
- Lower numbers start first
- Default is 999 (starts last)

## Integration with Docker

For Docker deployments, add to your Dockerfile:

```dockerfile
# Install supervisord
RUN apt-get update && apt-get install -y supervisor

# Copy configurations
COPY config/supervisord/*.conf /etc/supervisor/conf.d/

# Create log directory
RUN mkdir -p /var/log/supervisor

# Start supervisord
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
```

Or add to docker-compose.yml:

```yaml
services:
  vibe-workstation:
    # ... other config ...
    volumes:
      - ./config/supervisord:/etc/supervisor/conf.d
      - supervisor-logs:/var/log/supervisor
    command: supervisord -n -c /etc/supervisor/supervisord.conf

volumes:
  supervisor-logs:
```

## Best Practices

1. **Always test configuration** before deployment
2. **Monitor logs regularly** for early problem detection
3. **Set up alerts** for critical failures
4. **Rotate logs** to prevent disk space issues
5. **Document API key rotation** procedures
6. **Use health checks** for production environments
7. **Implement graceful shutdown** handling

## Support

For issues or questions:
1. Check logs in `/var/log/supervisor/`
2. Run manual test: `vibe-taskpicker-ctl test`
3. Review this documentation
4. Check supervisord documentation: http://supervisord.org/