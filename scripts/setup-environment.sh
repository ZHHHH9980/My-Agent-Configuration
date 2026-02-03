#!/bin/bash

echo "🚀 Setting up My-Agent-Configuration environment..."
echo "=================================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# 创建必要的目录
echo "📁 Creating directory structure..."
mkdir -p tools skills packages scripts logs

# 检查 dashboard 服务器依赖
echo "📦 Checking dashboard dependencies..."
if [ -d "tools/devtools-dashboard/server" ]; then
    cd tools/devtools-dashboard/server
    if [ ! -d "node_modules" ]; then
        echo "   Installing dashboard server dependencies..."
        npm install express cors
    else
        echo "   Dashboard dependencies already installed"
    fi
    cd ../../..
else
    echo "   Dashboard directory not found"
fi

# 检查 news-aggregator 依赖
echo "📦 Checking news-aggregator dependencies..."
if [ -d "tools/news-aggregator" ]; then
    cd tools/news-aggregator
    if [ ! -d "node_modules" ]; then
        echo "   Installing news-aggregator dependencies..."
        # 这里可以添加实际的安装命令
        echo "   Note: Add your installation command for news-aggregator"
    else
        echo "   News-aggregator dependencies already installed"
    fi
    cd ../..
else
    echo "   News-aggregator directory not found"
fi

# 创建日志目录
echo "📝 Setting up logs..."
mkdir -p logs
touch logs/dashboard.log
touch logs/watcher.log

# 创建启动脚本
echo "📜 Creating startup scripts..."
cat > start-dashboard.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting DevTools Dashboard..."
cd tools/devtools-dashboard/server
node server.js >> ../../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > ../../logs/dashboard.pid
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"
echo "🌐 Access at: http://localhost:3001"
EOF

cat > start-watcher.sh << 'EOF'
#!/bin/bash
echo "👂 Starting config watcher..."
node scripts/simple-watcher.js >> logs/watcher.log 2>&1 &
WATCHER_PID=$!
echo $WATCHER_PID > logs/watcher.pid
echo "✅ Watcher started (PID: $WATCHER_PID)"
EOF

cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting My-Agent-Configuration..."
./start-dashboard.sh
sleep 2
./start-watcher.sh
echo ""
echo "✅ All services started!"
echo "📊 Dashboard: http://localhost:3001"
echo "📝 Test page: http://localhost:3001/test-api.html"
echo ""
echo "To stop all services: ./stop-all.sh"
EOF

cat > stop-all.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping all services..."
if [ -f "logs/dashboard.pid" ]; then
    DASHBOARD_PID=$(cat logs/dashboard.pid)
    kill $DASHBOARD_PID 2>/dev/null && echo "✅ Stopped dashboard (PID: $DASHBOARD_PID)" || echo "❌ Dashboard not running"
    rm -f logs/dashboard.pid
fi

if [ -f "logs/watcher.pid" ]; then
    WATCHER_PID=$(cat logs/watcher.pid)
    kill $WATCHER_PID 2>/dev/null && echo "✅ Stopped watcher (PID: $WATCHER_PID)" || echo "❌ Watcher not running"
    rm -f logs/watcher.pid
fi

echo "✅ All services stopped"
EOF

# 设置执行权限
chmod +x start-dashboard.sh start-watcher.sh start-all.sh stop-all.sh

# 创建 README
echo "📖 Creating README..."
cat > QUICK-START.md << 'EOF'
# My-Agent-Configuration Quick Start

## 🚀 Getting Started

### 1. Start all services:
```bash
./start-all.sh
```

### 2. Access the dashboard:
- **Dashboard**: http://localhost:3001
- **Test Page**: http://localhost:3001/test-api.html

### 3. Stop all services:
```bash
./stop-all.sh
```

## 📁 Project Structure

```
My-Agent-Configuration/
├── my-agent-config.json          # Main configuration
├── tools/tools-config.json       # Tools configuration
├── skills/skills-config.json     # Skills configuration
├── scripts/                      # Utility scripts
├── logs/                         # Log files
└── tools/devtools-dashboard/     # Dashboard application
```

## 🔧 Configuration Files

### Tools Configuration
Edit `tools/tools-config.json` to add/remove tools.

### Skills Configuration  
Edit `skills/skills-config.json` to manage skills.

## 📊 Dashboard Features

1. **System Overview**: View stats for skills, tools, packages
2. **Tools Management**: See all installed tools with URLs
3. **Skills Management**: View and manage all skills
4. **System Status**: Monitor health of all components
5. **Recent Activities**: Track system changes

## 🐛 Troubleshooting

### Dashboard not starting?
```bash
cd tools/devtools-dashboard/server
node server.js
```

### Check logs:
```bash
tail -f logs/dashboard.log
tail -f logs/watcher.log
```

## 📞 Support

Check the main README.md for more details.
EOF

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 Quick start commands:"
echo "   ./start-all.sh     - Start all services"
echo "   ./stop-all.sh      - Stop all services"
echo ""
echo "📖 Documentation:"
echo "   See QUICK-START.md for detailed instructions"
echo ""
echo "🌐 Once started, access:"
echo "   Dashboard: http://localhost:3001"
echo "   Test page: http://localhost:3001/test-api.html"
echo ""