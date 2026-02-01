# Simple Skills List

Maintain a shared list of available skills across all your laptops. No tracking, just a simple skills directory.

## Quick Start

```bash
# Clone and setup
git clone <this-repo> my-agent-configuration
cd my-agent-configuration

# Install jq (required)
brew install jq  # macOS
sudo apt-get install jq  # Ubuntu

# Add your first skill
./track-skill.sh add brainstorming

# List all skills
./track-skill.sh list
```

## Files

- `track-skill.sh` - Add/remove/list/search skills
- `sync-skills.sh` - Sync list between laptops  
- `skills-config.json` - Simple skills list
- `SETUP.md` - Detailed setup instructions

## Usage Example

```bash
# Add a skill you discovered
./track-skill.sh add yusufkaraaslan/Skill_Seekers

# Search for skills
./track-skill.sh search skill

# Sync with other laptops
./sync-skills.sh
```

See [SETUP.md](SETUP.md) for complete setup and usage instructions.

## Privacy First

- ❌ No laptop tracking
- ❌ No usage statistics  
- ✅ Simple shared skills list
- ✅ Works across all your devices
