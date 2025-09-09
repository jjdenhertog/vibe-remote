#!/usr/bin/env python3
"""
Supervisord event listener for monitoring vibe-taskpicker
Handles process state changes and sends notifications
"""

import sys
import os
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/supervisor/vibe-taskpicker-monitor.log'),
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger('vibe-taskpicker-monitor')

def write_stdout(s):
    """Write to stdout for supervisord communication"""
    sys.stdout.write(s)
    sys.stdout.flush()

def write_stderr(s):
    """Write to stderr for logging"""
    sys.stderr.write(s)
    sys.stderr.flush()

def parse_event_data(data):
    """Parse supervisord event data"""
    event_dict = {}
    for line in data.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            event_dict[key] = value
    return event_dict

def handle_process_state_fatal(event_data):
    """Handle fatal process state"""
    logger.error(f"FATAL: Process entered fatal state - {event_data}")
    # Could send email notification here if configured
    write_notification("FATAL", event_data)

def handle_process_state_exited(event_data):
    """Handle process exit"""
    expected_exit = event_data.get('expected', '0')
    if expected_exit != '1':
        logger.warning(f"Process exited unexpectedly - {event_data}")
        write_notification("UNEXPECTED_EXIT", event_data)
    else:
        logger.info(f"Process exited normally - {event_data}")

def handle_process_state_stopped(event_data):
    """Handle process stop"""
    logger.info(f"Process stopped - {event_data}")

def write_notification(event_type, event_data):
    """Write notification to file for external processing"""
    notification_file = '/var/log/supervisor/vibe-taskpicker-notifications.json'
    notification = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'event_data': event_data
    }
    
    try:
        # Append to notifications file
        with open(notification_file, 'a') as f:
            f.write(json.dumps(notification) + '\n')
    except Exception as e:
        logger.error(f"Failed to write notification: {e}")

def main():
    """Main event listener loop"""
    logger.info("Starting vibe-taskpicker monitor")
    
    while True:
        # Read header line from supervisord
        write_stdout('READY\n')
        line = sys.stdin.readline()
        
        # Parse header
        headers = dict([x.split(':') for x in line.split()])
        
        # Read event data
        data_length = int(headers.get('len', 0))
        event_data = sys.stdin.read(data_length)
        
        # Parse event data
        event_dict = parse_event_data(event_data)
        event_name = headers.get('eventname', '')
        
        logger.info(f"Received event: {event_name}")
        
        # Handle different event types
        if event_name == 'PROCESS_STATE_FATAL':
            handle_process_state_fatal(event_dict)
        elif event_name == 'PROCESS_STATE_EXITED':
            handle_process_state_exited(event_dict)
        elif event_name == 'PROCESS_STATE_STOPPED':
            handle_process_state_stopped(event_dict)
        else:
            logger.debug(f"Unhandled event: {event_name}")
        
        # Acknowledge event
        write_stdout('RESULT 2\nOK')

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.error(f"Monitor crashed: {e}", exc_info=True)
        sys.exit(1)