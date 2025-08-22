# Firewall Setup with Squid Proxy for Vibe 🤮 Remote

## Overview

This guide explains how to set up a Squid proxy firewall to enhance security for your Vibe 🤮 Remote workstation. The proxy creates a whitelist-based network filter that only allows connections to approved domains, adding an extra layer of security when running Claude Code with `--dangerously-skip-permissions`.

## Architecture

The setup consists of:
1. A Squid proxy container that filters all outbound traffic
2. A custom Docker network that routes traffic through the proxy
3. Your Vibe 🤮 Remote container configured to use the proxy

## Step 1: Deploy the Squid Proxy

### Create the Squid Proxy Container

```yaml
version: '3'
services:
  proxy:
    image: ubuntu/squid
    container_name: squid-proxy
    volumes:
      - ./whitelist.txt:/etc/squid/conf.d/whitelist.txt:ro
      - ./custom.conf:/etc/squid/conf.d/custom.conf:ro
    networks:
      - squid-proxy-network
    restart: unless-stopped

networks:
  squid-proxy-network:
    name: squid-proxy-network
    driver: bridge
```

### Create the Whitelist

Create `whitelist.txt` with approved domains:

```
.anthropic.com
.statsig.com
.sentry.io
.brave.com
api.search.brave.com
.github.com
.githubusercontent.com
.npmjs.org
registry.npmjs.org
.nodejs.org
.typescriptlang.org
.nextjs.org
.vercel.com
.react.dev
developer.mozilla.org
```

### Configure Squid

Create `custom.conf`:

```
# Define and apply whitelist
acl allowed_domains dstdomain "/etc/squid/conf.d/whitelist.txt"
http_access allow allowed_domains
http_access deny all

# Configure the proxy port
http_port 3128

# Optional: Disable caching for development
cache deny all
```
## Step 2: Configure Vibe 🤮 Remote with Proxy

### Full Configuration Example

Here's a complete `docker-compose.yml` for Vibe 🤮 Remote with proxy support:

```yaml
version: '3'

services:
  ai-dev:
    image: jjdenhertog/viberemote:latest
    container_name: vibe-remote-proxied
    
    environment:
      - DEVELOPER_PASSWORD=changeme
      - GIT_USERNAME=Your Name
      - GIT_USEREMAIL=your@email.com

      # PROXY SETTINGS
      - HTTP_PROXY=http://squid-proxy:3128
      - HTTPS_PROXY=http://squid-proxy:3128
      - http_proxy=http://squid-proxy:3128
      - https_proxy=http://squid-proxy:3128
      - NO_PROXY=localhost,127.0.0.1
      - no_proxy=localhost,127.0.0.1
      
    ports:
      - "9090:9090"     # SSH
      - "9091:9091"     # Vibe-Kanban
      - "9092:3000"     # Dev environment
      
    volumes:
      - vibe-credentials:/workspace/credentials
      - vibe-data:/workspace/data
      - vibe-project:/workspace/project
    
    networks:
      - squid-proxy-network
      
volumes:
  vibe-credentials:
  vibe-data:
  vibe-project:

networks:
  squid-proxy-network:
    external: true
    name: squid-proxy-network
```

### Key Configuration Points

1. **Proxy Environment Variables**: All HTTP/HTTPS traffic will be routed through the Squid proxy
2. **Network Configuration**: The container joins the `squid-proxy-network` to communicate with the proxy
3. **NO_PROXY**: Localhost traffic bypasses the proxy for internal communications

## Step 3: Testing the Firewall

After deploying both containers, test the firewall configuration:

```bash
# Test whitelisted domain (should work)
docker exec vibe-remote-proxied curl -I https://api.github.com

# Test non-whitelisted domain (should fail)
docker exec vibe-remote-proxied curl -I https://google.com
```

Expected results:
- Whitelisted domains return HTTP status codes (200, 301, etc.)
- Non-whitelisted domains return connection errors or 403 Forbidden

## Managing the Whitelist

### Adding New Domains

1. Edit `/volume1/docker/secure-network/whitelist.txt`
2. Add new domains (use `.domain.com` to include all subdomains)

### Common Domains to Whitelist

Depending on your development needs, you might want to add:

- **Package Registries**: `.rubygems.org`, `.packagist.org`, `.crates.io`
- **Version Control**: `.gitlab.com`, `.bitbucket.org`
- **CDNs**: `.cloudflare.com`, `.fastly.net`
- **Cloud Providers**: `.amazonaws.com`, `.googleapis.com`, `.azurewebsites.net`
- **Development Tools**: `.sentry.io`, `.datadog.com`, `.newrelic.com`

## Security Benefits

This firewall setup provides:

1. **Outbound Traffic Control**: Only approved domains can be accessed
2. **Defense in Depth**: Additional security layer beyond container isolation
3. **Audit Trail**: Squid logs all connection attempts for monitoring
4. **Flexibility**: Easy to update whitelist without rebuilding containers
5. **Network Isolation**: Containers can only communicate through controlled channels

