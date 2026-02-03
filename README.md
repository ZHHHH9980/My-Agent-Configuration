# My Agent Configuration

A monorepo for managing skills and building useful tools.

## Structure

- `skills/` - Skills tracking system (manage your OpenCode skills across laptops)
- `tools/` - Useful tools and applications
- `run.sh` - Unified launcher for all tools and skills

## Quick Start

```bash
# Install dependencies
brew install jq

# Elegant launch options:
yarn start          # Interactive menu (Recommended)
npm start           # Interactive menu
npm run menu        # Interactive menu

# Direct commands:
npm run news        # Start news aggregator
npm run skills:list # List all skills
npm run skills:add  # Add a new skill
npm run skills:sync # Sync skills between laptops
```

## Tools

### News Aggregator
Fetch and display trending news and blogs from multiple sources.

### Skills Tracking
Track and sync your OpenCode skills across multiple laptops.

```bash
npm run skills:add <skill-name>
npm run skills:sync
```

See [skills/SETUP.md](skills/SETUP.md) for details.

 ## Automated Development with Ralphy

My-Agent-Configuration uses [Ralphy](https://github.com/michaelshimeles/ralphy) for automated AI-driven development workflows.

### Quick Start with Ralphy

```bash
# Install Ralphy globally
npm install -g ralphy-cli

# Or use the included script
chmod +x tools/ralphy/ralphy.sh

# Initialize project configuration
ralphy --init

# Run your first task
ralphy "Fix lint errors in dashboard"
```

### Using the Ralphy Runner Script

For convenience, use the included wrapper script:

```bash
# Make it executable
chmod +x ralphy-run.sh

# Common workflows
./ralphy-run.sh init                     # Initialize configuration
./ralphy-run.sh single "Fix TypeScript error"  # Single task
./ralphy-run.sh new-prd                  # Create new PRD from template
./ralphy-run.sh prd NEW-FEATURE.md       # Run PRD file
./ralphy-run.sh parallel LARGE-PRD.md    # Run in parallel mode
```

### Key Files

- `.ralphy/config.yaml` - Ralphy project configuration
- `PRD-TEMPLATE.md` - Template for creating development tasks
- `EXAMPLE-PRD.md` - Example task list
- `RALPHY-GUIDE.md` - Comprehensive usage guide
- `ralphy-run.sh` - Convenience wrapper script

### Development Workflow

1. **Create PRD**: Copy `PRD-TEMPLATE.md` and fill in your tasks
2. **Run with Ralphy**: `ralphy --prd YOUR-PRD.md`
3. **Monitor Progress**: Ralphy updates checkboxes as tasks complete
4. **Review & Commit**: Review changes and commit with meaningful messages

See [RALPHY-GUIDE.md](RALPHY-GUIDE.md) for complete documentation.

## Development

See [docs/plans/](docs/plans/) for design documents and implementation plans.

## License

MIT
