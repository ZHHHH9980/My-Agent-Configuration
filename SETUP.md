# Simple Skills List - Track Available Skills

A simple system to maintain a shared list of available skills across all your laptops without tracking usage.

## Quick Setup

1. **Clone this repository:**
   ```bash
   git clone <your-repo-url> my-agent-configuration
   cd my-agent-configuration
   ```

2. **Install dependencies:**
   ```bash
   # macOS
   brew install jq
   
   # Ubuntu/Debian
   sudo apt-get install jq
   ```

3. **Test the system:**
   ```bash
   ./track-skill.sh add brainstorming
   ./track-skill.sh list
   ```

## Usage

### Manage Skills List
```bash
# Add a skill to your list
./track-skill.sh add brainstorming
./track-skill.sh add yusufkaraaslan/Skill_Seekers

# Remove a skill
./track-skill.sh remove old-skill

# List all available skills
./track-skill.sh list

# Search for skills
./track-skill.sh search skill
```

### Sync Between Laptops
```bash
# Full sync (backup, pull, push)
./sync-skills.sh

# Just pull latest changes
./sync-skills.sh pull

# Just push your changes
./sync-skills.sh push

# Show current status
./sync-skills.sh status

# Backup current list
./sync-skills.sh backup
```

## Files

- `skills-config.json`: Simple skills list storage
- `track-skill.sh`: Add/remove/list/search skills
- `sync-skills.sh`: Sync between laptops
- `backups/`: Automatic backups

## Data Structure

```json
{
  "version": "2.0.0",
  "skills": [
    "brainstorming",
    "yusufkaraaslan/Skill_Seekers"
  ],
  "lastUpdated": "2026-02-01T04:45:00Z"
}
```

## Integration with OpenCode

When you discover a new skill, add it to your shared list:

```bash
# After discovering a useful skill
./track-skill.sh add <skill-name>
./sync-skills.sh push

# When you need to find a skill
./track-skill.sh search <pattern>
```

## Privacy Focus

- ❌ No tracking of which laptop uses which skills
- ❌ No usage statistics or timestamps
- ✅ Just a simple shared skills list
- ✅ All laptops see the same skills list