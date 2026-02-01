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

# Run the launcher
./run.sh
```

## Tools

### News Aggregator
Fetch and display trending news and blogs from multiple sources.

### Skills Tracking
Track and sync your OpenCode skills across multiple laptops.

```bash
./run.sh skills add <skill-name>
./run.sh skills sync
```

See [skills/SETUP.md](skills/SETUP.md) for details.

## Development

See [docs/plans/](docs/plans/) for design documents and implementation plans.

## License

MIT
