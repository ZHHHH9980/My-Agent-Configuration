# Simple Skills List - Track Available Skills

A simple system to maintain a shared list of available skills across all your laptops without tracking usage.

## Quick Setup

1. **Clone this repository:**
   ```bash
   git clone <your-repo-url> my-agent-configuration && cd my-agent-configuration
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
   skills/track-skill.sh add brainstorming
   skills/track-skill.sh list
   ```

## Usage

### Manage Skills List
```bash
# Add a skill to your list
skills/track-skill.sh add brainstorming
skills/track-skill.sh add yusufkaraaslan/Skill_Seekers

# Remove a skill
skills/track-skill.sh remove old-skill

# List all available skills
skills/track-skill.sh list

# Search for skills
skills/track-skill.sh search skill
```

### Sync Between Laptops
```bash
# Full sync (backup, pull, push)
skills/sync-skills.sh

# Just pull latest changes
skills/sync-skills.sh pull

# Just push your changes
skills/sync-skills.sh push

# Show current status
skills/sync-skills.sh status

# Backup current list
skills/sync-skills.sh backup
```

## Files

- `skills/skills-config.json`: Simple skills list storage
- `skills/track-skill.sh`: Add/remove/list/search skills
- `skills/sync-skills.sh`: Sync between laptops
- `skills/backups/`: Automatic backups

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
skills/track-skill.sh add <skill-name>
skills/sync-skills.sh push

# When you need to find a skill
skills/track-skill.sh search <pattern>
```

## Privacy Focus

- ❌ No tracking of which laptop uses which skills
- ❌ No usage statistics or timestamps
- ✅ Just a simple shared skills list
- ✅ All laptops see the same skills list