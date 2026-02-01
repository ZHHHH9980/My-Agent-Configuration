#!/bin/bash

# Simple Skills Sync Script
# Syncs skills list between laptops via git

REPO_DIR="$(pwd)"
CONFIG_FILE="$REPO_DIR/skills-config.json"
BACKUP_DIR="$REPO_DIR/backups"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup current config before sync
backup_config() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    cp "$CONFIG_FILE" "$BACKUP_DIR/skills-config-backup-$timestamp.json"
    echo "💾 Config backed up to $BACKUP_DIR/skills-config-backup-$timestamp.json"
}

# Pull latest changes from remote
pull_changes() {
    cd "$REPO_DIR"
    echo "📥 Pulling latest changes..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Pull completed"
    else
        echo "⚠️  Pull failed or no changes"
    fi
}

# Push local changes to remote
push_changes() {
    cd "$REPO_DIR"
    echo "📤 Pushing changes..."
    git add "$CONFIG_FILE"
    if git diff --cached --quiet; then
        echo "ℹ️  No changes to push"
        return
    fi
    git commit -m "Update skills list - $(date +'%Y-%m-%d %H:%M')"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Push completed"
    else
        echo "❌ Push failed"
    fi
}

# Show current status
show_status() {
    echo "📊 Current Skills List Status:"
    if command -v jq >/dev/null 2>&1; then
        local count=$(jq -r '.skills | length' "$CONFIG_FILE")
        echo "   - Total skills: $count"
        if [ "$count" -gt 0 ]; then
            echo "   - Last updated: $(jq -r '.lastUpdated // "Never" "$CONFIG_FILE")"
        fi
    else
        echo "   - Install jq to see details"
    fi
}

# Main sync process
sync_skills() {
    echo "🔄 Starting skills sync..."
    backup_config
    pull_changes
    push_changes
    show_status
    echo "✅ Skills sync completed"
}

case "${1:-sync}" in
    "pull")
        backup_config
        pull_changes
        ;;
    "push")
        push_changes
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_config
        ;;
    "sync"|*)
        sync_skills
        ;;
esac