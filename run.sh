#!/bin/bash

# Main launcher for all tools and skills
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
    echo "My Agent Configuration Launcher"
    echo "================================"
    echo ""
    echo "Available tools:"
    echo "  news-aggregator  - Fetch and display trending news"
    echo ""
    echo "Skills management:"
    echo "  skills add <name>   - Add skill to list"
    echo "  skills remove <name> - Remove skill from list"
    echo "  skills list         - List all skills"
    echo "  skills sync         - Sync skills between laptops"
    echo ""
    echo "Usage: ./run.sh <tool-name> [command]"
    echo "   or: ./run.sh skills <command> [args]"
}

case "${1:-help}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "news-aggregator")
        echo "🚀 Launching news aggregator..."
        cd "$REPO_DIR/tools/news-aggregator"
        # Implementation to be added
        echo "News aggregator not yet implemented"
        ;;
    "skills")
        cd "$REPO_DIR/skills"
        ./track-skill.sh "${@:2}"
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac