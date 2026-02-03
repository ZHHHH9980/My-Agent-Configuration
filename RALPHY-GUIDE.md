# Ralphy Automation Guide for My-Agent-Configuration

## Overview

Ralphy is an autonomous AI coding loop tool that automates development workflows for the My-Agent-Configuration system. This guide explains how to set up and use Ralphy to streamline development tasks.

## Quick Start

### 1. Install Ralphy

**Option A: npm (recommended)**
```bash
npm install -g ralphy-cli
```

**Option B: Use included script**
```bash
chmod +x tools/ralphy/ralphy.sh
# Use ./tools/ralphy/ralphy.sh instead of ralphy in commands below
```

### 2. Initialize Project Configuration
```bash
# This will auto-detect project settings
ralphy --init
```

### 3. Test Configuration
```bash
# View your project configuration
ralphy --config
```

### 4. Run Your First Task
```bash
# Simple task
ralphy "Fix lint errors in dashboard"

# Or use a PRD file
ralphy --prd NEW-PRD.md
```

## Project Configuration

Ralphy configuration is stored in `.ralphy/config.yaml` and includes:

- **Project details**: Name, language, frameworks
- **Commands**: Standard commands for lint, test, build
- **Rules**: Development rules to follow
- **Boundaries**: Files not to modify
- **Workflow**: Standard task procedures

## Creating Development Tasks

### Using PRD Templates

1. **Copy the template**:
   ```bash
   cp PRD-TEMPLATE.md MY-FEATURE-PRD.md
   ```

2. **Fill in the details**:
   - Edit `MY-FEATURE-PRD.md` with your specific tasks
   - Use clear, actionable task descriptions
   - Include testing and validation steps

3. **Run with Ralphy**:
   ```bash
   ralphy --prd MY-FEATURE-PRD.md
   ```

### Single Task Mode
For quick fixes or small tasks:
```bash
ralphy "Add new tool configuration for XYZ"
ralphy "Fix responsive layout issue on mobile"
ralphy "Update documentation for new skill"
```

## Common Workflows

### 1. Adding a New Tool

**PRD Structure**:
```markdown
## Tasks
- [ ] Add tool directory under `tools/`
- [ ] Create tool configuration in `tools/tools-config.json`
- [ ] Update `my-agent-config.json` with tool reference
- [ ] Implement status check method
- [ ] Test tool integration in dashboard
- [ ] Update documentation
```

**Command**:
```bash
ralphy --prd NEW-TOOL-PRD.md --parallel
```

### 2. Enhancing Dashboard Features

**PRD Structure**:
```markdown
## Tasks
- [ ] Analyze existing dashboard code
- [ ] Implement new UI component
- [ ] Update API endpoints if needed
- [ ] Test on desktop and mobile
- [ ] Run lint and type-check
- [ ] Update component documentation
```

**Command**:
```bash
ralphy --prd DASHBOARD-ENHANCEMENT-PRD.md
```

### 3. Bug Fixes

**PRD Structure**:
```markdown
## Tasks
- [ ] Reproduce the bug
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add test to prevent regression
- [ ] Verify fix works
- [ ] Document the fix
```

**Command**:
```bash
ralphy --prd BUG-FIX-PRD.md --fast  # Skip tests for quick iteration
```

## Advanced Features

### Parallel Execution
Run independent tasks in parallel:
```bash
ralphy --prd LARGE-PRD.md --parallel --max-parallel 3
```

### Branch Management
Create feature branches for each task:
```bash
ralphy --prd FEATURE-PRD.md --branch-per-task --create-pr
```

### Sandbox Mode (Faster)
Use symlinks instead of full worktrees:
```bash
ralphy --prd PRD.md --parallel --sandbox
```

### Engine Selection
Use different AI engines:
```bash
ralphy --prd PRD.md --opencode        # OpenCode engine
ralphy --prd PRD.md --claude          # Claude Code (default)
ralphy --prd PRD.md --cursor          # Cursor
ralphy --prd PRD.md --model sonnet    # Claude with Sonnet model
```

## Project-Specific Commands

Ralphy is configured with these key commands:

```bash
# Dashboard development
ralphy "cd tools/devtools-dashboard && npm run lint"
ralphy "cd tools/devtools-dashboard && npm run type-check"
ralphy "cd tools/devtools-dashboard && npm run build"

# Tool management
ralphy "npm start"                    # Launch tool menu
ralphy "npm run skills:list"         # List all skills

# Testing
ralphy "cd tools/devtools-dashboard && npm run test"
ralphy "cd tools/devtools-dashboard && npm run test:coverage"
```

## Best Practices

### 1. Task Granularity
- Break large features into smaller, actionable tasks
- Each task should be completable in 15-30 minutes
- Include verification steps

### 2. Configuration Updates
- Always update relevant config files (`my-agent-config.json`, `tools/tools-config.json`)
- Maintain backward compatibility
- Document configuration changes

### 3. Quality Assurance
- Run lint and type-check before committing
- Test dashboard functionality manually
- Verify on both desktop and mobile

### 4. Documentation
- Update README files when adding features
- Document new configuration options
- Include usage examples

## Troubleshooting

### Ralphy Commands Fail
```bash
# Check configuration
ralphy --config

# Run in verbose mode
ralphy --prd PRD.md -v

# Try different engine
ralphy --prd PRD.md --opencode
```

### Build/Lint Errors
```bash
# Check dashboard specifically
cd tools/devtools-dashboard && npm run lint
cd tools/devtools-dashboard && npm run type-check

# Fix common issues
ralphy "Fix TypeScript errors in dashboard"
ralphy "Fix ESLint warnings"
```

### Tool Integration Issues
```bash
# Test tool status manually
cd tools/devtools-dashboard && npm run dev
# Open http://localhost:3001

# Check API endpoints
curl http://localhost:3001/api/tools
curl http://localhost:3001/api/status
```

## Example Commands

```bash
# Quick fixes
ralphy "Fix broken link in README"
ralphy "Update package.json version"
ralphy "Add missing TypeScript types"

# Feature development
ralphy --prd ADD-NEW-SKILL-PRD.md --parallel
ralphy --prd ENHANCE-UI-PRD.md --branch-per-task

# Maintenance
ralphy "Update all dependencies"
ralphy "Run full test suite and fix failures"
```

## Resources

- [Ralphy GitHub](https://github.com/michaelshimeles/ralphy)
- [Example PRD](EXAMPLE-PRD.md)
- [PRD Template](PRD-TEMPLATE.md)
- [Configuration Schema](config-schema.md)
- [My-Agent-Configuration Docs](../docs/)