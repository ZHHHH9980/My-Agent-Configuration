#!/bin/bash

# DevTools Dashboard Launcher
# Options:
#   --static    Open static HTML version (default)
#   --dev       Start Next.js development server
#   --build     Build Next.js for production
#   --help      Show this help message

set -e

cd "$(dirname "$0")"

show_help() {
  cat << EOF
DevTools Dashboard Launcher

Usage: ./start.sh [OPTION]

Options:
  --static    Open static HTML version (default)
  --dev       Start Next.js development server
  --build     Build Next.js for production
  --install   Install dependencies
  --clean     Clean build artifacts
  --help      Show this help message

Examples:
  ./start.sh                 # Open static dashboard
  ./start.sh --dev          # Start development server
  ./start.sh --build        # Build for production
EOF
}

case "$1" in
  --static)
    echo "Opening static HTML dashboard..."
    if command -v open &> /dev/null; then
      open public/index.html
    elif command -v xdg-open &> /dev/null; then
      xdg-open public/index.html
    else
      echo "Please open public/index.html in your browser"
    fi
    ;;
    
  --dev)
    echo "Starting Next.js development server..."
    if [ ! -d "node_modules" ]; then
      echo "Installing dependencies..."
      npm install
    fi
    npm run dev
    ;;
    
  --build)
    echo "Building Next.js for production..."
    if [ ! -d "node_modules" ]; then
      echo "Installing dependencies..."
      npm install
    fi
    npm run build
    echo "Build complete! Run 'npm start' to start production server"
    ;;
    
  --install)
    echo "Installing dependencies..."
    npm install
    ;;
    
  --clean)
    echo "Cleaning build artifacts..."
    rm -rf .next node_modules package-lock.json
    ;;
    
  --help|"")
    show_help
    ;;
    
  *)
    echo "Unknown option: $1"
    show_help
    exit 1
    ;;
esac