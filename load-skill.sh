#!/bin/bash

# Skill Loader with Automatic Tracking
# Usage: ./load-skill.sh <skill-name>

SKILL_NAME="$1"
REPO_DIR="$(pwd)"

if [ -z "$SKILL_NAME" ]; then
    echo "Usage: $0 <skill-name>"
    echo "Example: $0 yusufkaraaslan/Skill_Seekers"
    exit 1
fi

echo "Loading skill: $SKILL_NAME"

# Track skill loading
"$REPO_DIR/track-skill.sh" "$SKILL_NAME" "loading"

# Try to load the skill (simulated - adapt to actual skill loading command)
echo "Attempting to load skill: $SKELL_NAME"

# For demo purposes, we'll simulate success/failure randomly
if [ $((RANDOM % 2)) -eq 1 ]; then
    echo "✅ Skill loaded successfully: $SKILL_NAME"
    "$REPO_DIR/track-skill.sh" "$SKILL_NAME" "load-success"
    
    # Track session start
    "$REPO_DIR/track-skill.sh" "$SKILL_NAME" "session-started"
    
    echo "🔧 Skill '$SKILL_NAME' is now active. Use './track-skill.sh \"$SKILL_NAME\" \"action\"' to track usage."
    
else
    echo "❌ Failed to load skill: $SKILL_NAME"
    "$REPO_DIR/track-skill.sh" "$SKILL_NAME" "load-failed"
    exit 1
fi