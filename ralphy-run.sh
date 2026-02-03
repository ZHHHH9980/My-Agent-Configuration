#!/bin/bash

# Ralphy Runner for My-Agent-Configuration
# Simplifies common ralphy workflows for this project

set -e

RALPHY_CMD="ralphy"
if ! command -v ralphy &> /dev/null; then
    if [ -f "tools/ralphy/ralphy.sh" ]; then
        RALPHY_CMD="./tools/ralphy/ralphy.sh"
        echo "Using local ralphy.sh script"
    else
        echo "Error: ralphy not found. Install with: npm install -g ralphy-cli"
        echo "Or ensure tools/ralphy/ralphy.sh exists"
        exit 1
    fi
fi

show_help() {
    cat << EOF
Ralphy Runner for My-Agent-Configuration

Usage: $0 [command] [options]

Commands:
  init                    Initialize ralphy configuration
  config                  Show project configuration
  single "task"           Run single task
  prd FILE.md            Run PRD file
  new-prd                 Create new PRD from template
  example                 Run example PRD
  quick-fix               Quick fix mode (skip tests)
  parallel FILE.md       Run PRD in parallel mode
  feature FILE.md        Run feature development (branch per task)
  dashboard              Run dashboard-specific commands
  tools                  Run tool management commands
  help                   Show this help

Examples:
  $0 init
  $0 single "Fix lint errors"
  $0 prd NEW-FEATURE.md
  $0 new-prd
  $0 parallel LARGE-PRD.md
  $0 feature NEW-TOOL.md --create-pr

Options:
  --opencode             Use OpenCode engine
  --claude              Use Claude Code engine (default)
  --cursor              Use Cursor engine
  --fast                Skip tests and lint
  --verbose             Verbose output
EOF
}

case "$1" in
    init)
        echo "Initializing ralphy configuration..."
        $RALPHY_CMD --init
        ;;
        
    config)
        echo "Project configuration:"
        $RALPHY_CMD --config
        ;;
        
    single)
        if [ -z "$2" ]; then
            echo "Error: Task description required"
            echo "Usage: $0 single \"task description\""
            exit 1
        fi
        shift
        echo "Running single task: $*"
        $RALPHY_CMD "$@"
        ;;
        
    prd)
        if [ -z "$2" ]; then
            echo "Error: PRD file required"
            echo "Usage: $0 prd FILE.md"
            exit 1
        fi
        PRD_FILE="$2"
        shift 2
        if [ ! -f "$PRD_FILE" ]; then
            echo "Error: PRD file not found: $PRD_FILE"
            exit 1
        fi
        echo "Running PRD: $PRD_FILE"
        $RALPHY_CMD --prd "$PRD_FILE" "$@"
        ;;
        
    new-prd)
        if [ -z "$2" ]; then
            echo "Creating new PRD from template..."
            cp PRD-TEMPLATE.md "PRD-$(date +%Y%m%d-%H%M%S).md"
            echo "Created: PRD-$(date +%Y%m%d-%H%M%S).md"
        else
            cp PRD-TEMPLATE.md "$2"
            echo "Created: $2"
        fi
        ;;
        
    example)
        echo "Running example PRD..."
        $RALPHY_CMD --prd EXAMPLE-PRD.md "${@:2}"
        ;;
        
    quick-fix)
        if [ -z "$2" ]; then
            echo "Error: Task description required"
            echo "Usage: $0 quick-fix \"task description\""
            exit 1
        fi
        shift
        echo "Running quick fix: $*"
        $RALPHY_CMD "$@" --fast
        ;;
        
    parallel)
        if [ -z "$2" ]; then
            echo "Error: PRD file required"
            echo "Usage: $0 parallel FILE.md"
            exit 1
        fi
        PRD_FILE="$2"
        shift 2
        if [ ! -f "$PRD_FILE" ]; then
            echo "Error: PRD file not found: $PRD_FILE"
            exit 1
        fi
        echo "Running PRD in parallel: $PRD_FILE"
        $RALPHY_CMD --prd "$PRD_FILE" --parallel --sandbox "$@"
        ;;
        
    feature)
        if [ -z "$2" ]; then
            echo "Error: PRD file required"
            echo "Usage: $0 feature FILE.md"
            exit 1
        fi
        PRD_FILE="$2"
        shift 2
        if [ ! -f "$PRD_FILE" ]; then
            echo "Error: PRD file not found: $PRD_FILE"
            exit 1
        fi
        echo "Running feature development: $PRD_FILE"
        $RALPHY_CMD --prd "$PRD_FILE" --branch-per-task --base-branch master "$@"
        ;;
        
    dashboard)
        shift
        case "$1" in
            lint)
                cd tools/devtools-dashboard && npm run lint
                ;;
            type-check)
                cd tools/devtools-dashboard && npm run type-check
                ;;
            build)
                cd tools/devtools-dashboard && npm run build
                ;;
            test)
                cd tools/devtools-dashboard && npm run test
                ;;
            dev)
                cd tools/devtools-dashboard && npm run dev
                ;;
            *)
                echo "Dashboard commands:"
                echo "  lint        Run ESLint"
                echo "  type-check  Run TypeScript check"
                echo "  build       Build dashboard"
                echo "  test        Run tests"
                echo "  dev         Start development server"
                ;;
        esac
        ;;
        
    tools)
        shift
        case "$1" in
            start)
                npm start
                ;;
            news)
                npm run news
                ;;
            skills)
                npm run skills:list
                ;;
            *)
                echo "Tool commands:"
                echo "  start       Launch tool menu"
                echo "  news        Start news aggregator"
                echo "  skills      List all skills"
                ;;
        esac
        ;;
        
    help|--help|-h)
        show_help
        ;;
        
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac