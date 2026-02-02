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

## Development

See [docs/plans/](docs/plans/) for design documents and implementation plans.

## License

MIT
