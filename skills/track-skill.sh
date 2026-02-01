#!/bin/bash

# Simple Skills Tracker
# Maintains a list of available skills for all laptops

SKILLS_CONFIG="$(dirname "$0")/skills-config.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Add skill to the list
add_skill() {
    local skill_name="$1"
    
    if command -v jq >/dev/null 2>&1; then
        # Add skill if not already in list
        jq --arg skill "$skill_name" \
           --arg timestamp "$TIMESTAMP" \
           'if .skills | index($skill) then . 
            else .skills += [$skill] | .lastUpdated = $timestamp 
            end' \
           "$SKILLS_CONFIG" > "$SKILLS_CONFIG.tmp" && mv "$SKILLS_CONFIG.tmp" "$SKILLS_CONFIG"
        
        # Check if skill was added
        if jq -e '.skills | index($skill)' "$SKILLS_CONFIG" >/dev/null 2>&1; then
            echo "✅ Added to skills list: $skill_name"
        else
            echo "ℹ️  Skill already in list: $skill_name"
        fi
    else
        echo "❌ jq is required. Please install jq."
        exit 1
    fi
}

# Remove skill from the list
remove_skill() {
    local skill_name="$1"
    
    if command -v jq >/dev/null 2>&1; then
        jq --arg skill "$skill_name" \
           --arg timestamp "$TIMESTAMP" \
           '.skills -= [$skill] | .lastUpdated = $timestamp' \
           "$SKILLS_CONFIG" > "$SKILLS_CONFIG.tmp" && mv "$SKILLS_CONFIG.tmp" "$SKILLS_CONFIG"
        
        echo "🗑️  Removed from skills list: $skill_name"
    else
        echo "❌ jq is required. Please install jq."
        exit 1
    fi
}

# List all skills
list_skills() {
    if command -v jq >/dev/null 2>&1; then
        local count=$(jq -r '.skills | length' "$SKILLS_CONFIG")
        echo "📋 Available Skills ($count total):"
        echo "========================"
        
        if [ "$count" -eq 0 ]; then
            echo "No skills added yet."
        else
            jq -r '.skills[]' "$SKILLS_CONFIG" | nl
        fi
    else
        echo "❌ jq is required. Please install jq."
        exit 1
    fi
}

# Search for skills
search_skills() {
    local pattern="$1"
    
    if command -v jq >/dev/null 2>&1; then
        echo "🔍 Skills matching '$pattern':"
        echo "============================="
        jq -r '.skills[]' "$SKILLS_CONFIG" | grep -i "$pattern" || echo "No matching skills found."
    else
        echo "❌ jq is required. Please install jq."
        exit 1
    fi
}

# Usage
case "${1:-help}" in
    "add")
        if [ -n "$2" ]; then
            add_skill "$2"
        else
            echo "Usage: $0 add <skill-name>"
            exit 1
        fi
        ;;
    "remove")
        if [ -n "$2" ]; then
            remove_skill "$2"
        else
            echo "Usage: $0 remove <skill-name>"
            exit 1
        fi
        ;;
    "list"|"ls")
        list_skills
        ;;
    "search")
        if [ -n "$2" ]; then
            search_skills "$2"
        else
            echo "Usage: $0 search <pattern>"
            exit 1
        fi
        ;;
    "help"|*)
        echo "Skills List Manager"
        echo "=================="
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  add <skill-name>    Add skill to list"
        echo "  remove <skill-name> Remove skill from list"
        echo "  list               List all skills"
        echo "  search <pattern>   Search skills"
        echo "  help               Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 add brainstorming"
        echo "  $0 add yusufkaraaslan/Skill_Seekers"
        echo "  $0 list"
        echo "  $0 search skill"
        ;;
esac