# DevTools Dashboard Integration Guide

This document explains how DevTools Dashboard integrates with the existing My-Agent-Configuration system.

## Architecture Overview

```
My-Agent-Configuration/
├── skills/                    # Skills tracking system
│   ├── skills-config.json    # Skills list (read by dashboard)
│   └── *.sh                  # Skill management scripts
├── tools/                    # Tools directory
│   ├── news-aggregator/      # Existing tool
│   └── devtools-dashboard/   # This dashboard
└── launch.js                # Main launcher (updated)
```

## Data Flow

### 1. Skills Integration
```
Dashboard → Read skills-config.json → Display skills list
     ↓           ↓           ↓
User action → Update config → Sync changes
```

### 2. Tools Integration
```
Dashboard → Scan tools/ directory → List tools
     ↓           ↓           ↓
User action → Execute tool → Monitor status
```

### 3. Launch Integration
```
Main launcher → Dashboard option → Open dashboard
     ↓           ↓           ↓
User selects → Execute script → Browser opens
```

## Integration Points

### 1. Skills Configuration
The dashboard reads from `../skills/skills-config.json`:

```json
{
  "version": "2.0.0",
  "skills": [
    "brainstorming",
    "yusufkaraaslan/Skill_Seekers"
  ],
  "lastUpdated": "2026-02-01T04:46:38Z"
}
```

**Future Enhancement**: Extend schema to include:
- Skill descriptions
- Categories (development, debugging, testing)
- Enable/disable status
- Usage statistics

### 2. Tools Discovery
The dashboard scans the `../tools/` directory:
- Looks for `package.json` files
- Extracts tool metadata (name, version, description)
- Checks for start/stop scripts

### 3. Launch Integration
The main `launch.js` has been updated to include:
```javascript
{ name: '📊 DevTools Dashboard', command: 'open tools/devtools-dashboard/public/index.html', ... }
```

## API Design (Future)

### REST API Endpoints
```typescript
// Skills API
GET    /api/skills           # List all skills
GET    /api/skills/:id       # Get skill details
POST   /api/skills           # Add new skill
PUT    /api/skills/:id       # Update skill
DELETE /api/skills/:id       # Remove skill

// Tools API
GET    /api/tools            # List all tools
GET    /api/tools/:id        # Get tool details
POST   /api/tools/:id/start  # Start tool
POST   /api/tools/:id/stop   # Stop tool
GET    /api/tools/:id/status # Check tool status

// System API
GET    /api/status           # System health
GET    /api/stats            # Usage statistics
POST   /api/refresh          # Refresh data
```

### WebSocket Events (Real-time)
```typescript
// Tool status updates
{
  event: 'tool_status',
  data: {
    toolId: 'news-aggregator',
    status: 'running',
    pid: 12345,
    startedAt: '2026-02-03T12:00:00Z'
  }
}

// Skill updates
{
  event: 'skill_updated',
  data: {
    skillId: 'brainstorming',
    enabled: true,
    updatedAt: '2026-02-03T12:00:00Z'
  }
}
```

## Configuration

### Environment Variables
```bash
# Dashboard configuration
SKILLS_CONFIG_PATH="../skills/skills-config.json"
TOOLS_DIR_PATH="../tools/"
API_PORT=3000
NODE_ENV="development"

# Integration settings
ENABLE_SKILLS_SYNC=true
ENABLE_TOOL_CONTROL=true
AUTO_REFRESH_INTERVAL=30000  # 30 seconds
```

### Dashboard Settings
Create `config.json` in dashboard directory:
```json
{
  "integrations": {
    "skills": {
      "enabled": true,
      "configPath": "../skills/skills-config.json",
      "autoRefresh": true
    },
    "tools": {
      "enabled": true,
      "toolsDir": "../tools/",
      "autoDiscover": true
    }
  },
  "ui": {
    "theme": "system",
    "sidebarCollapsed": false,
    "defaultView": "dashboard"
  }
}
```

## Security Considerations

### 1. File Access
- Dashboard runs with user permissions
- Only reads/writes to project directories
- No system-level access required

### 2. Tool Execution
- Tools run in their own processes
- Dashboard only starts/stops processes
- No privilege escalation

### 3. Data Privacy
- Skills data stays local
- No external API calls (unless configured)
- Optional analytics (opt-in)

## Deployment Scenarios

### 1. Local Development
```bash
# Static version (no dependencies)
open tools/devtools-dashboard/public/index.html

# Next.js version (full features)
cd tools/devtools-dashboard
npm install
npm run dev
```

### 2. Production Deployment
```bash
# Build static version
cp -r tools/devtools-dashboard/public/ /var/www/dashboard/

# Or build Next.js version
cd tools/devtools-dashboard
npm install
npm run build
npm start
```

### 3. Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY tools/devtools-dashboard/ .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing Integration

### 1. Skills Integration Test
```bash
# Verify skills config is readable
cat ../skills/skills-config.json | jq .

# Test dashboard can read skills
curl http://localhost:3000/api/skills
```

### 2. Tools Integration Test
```bash
# Verify tools directory exists
ls -la ../tools/

# Test tool discovery
curl http://localhost:3000/api/tools
```

### 3. Launch Integration Test
```bash
# Test from main launcher
node launch.js
# Select option 1 (DevTools Dashboard)
```

## Troubleshooting

### Common Issues

1. **Skills config not found**
   ```
   Error: Cannot read skills-config.json
   Solution: Check path: ../skills/skills-config.json
   ```

2. **Tools directory empty**
   ```
   Error: No tools found
   Solution: Ensure tools exist in ../tools/
   ```

3. **Dashboard won't open**
   ```
   Error: Cannot open browser
   Solution: Manually open public/index.html
   ```

4. **Next.js dependencies missing**
   ```
   Error: Module not found
   Solution: Run npm install in tools/devtools-dashboard/
   ```

### Logging
Enable debug logging:
```bash
DEBUG=devtools-dashboard* npm run dev
```

Check logs:
```bash
# Next.js logs
tail -f tools/devtools-dashboard/.next/logs/*

# Application logs
tail -f /var/log/devtools-dashboard.log
```

## Future Enhancements

### Phase 1: Basic Integration ✓
- [x] Static HTML dashboard
- [x] Read skills from config
- [x] List tools from directory
- [x] Integrate with main launcher

### Phase 2: Dynamic Features
- [ ] Real-time skill management
- [ ] Tool execution controls
- [ ] API server for data
- [ ] WebSocket for updates

### Phase 3: Advanced Features
- [ ] Skill marketplace
- [ ] Tool installation wizard
- [ ] Usage analytics
- [ ] Plugin system

### Phase 4: Enterprise Features
- [ ] Multi-user support
- [ ] Role-based access
- [ ] Audit logging
- [ ] Backup/restore

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Support

- **Issues**: GitHub Issues
- **Documentation**: This guide
- **Community**: Project discussions
- **Email**: Not configured (local project)