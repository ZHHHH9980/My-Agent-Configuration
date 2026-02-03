# My-Agent-Configuration 统一配置系统

## 概述
为所有 tools、skills 和 packages 创建统一的配置管理系统，确保：
1. 每个组件都有标准的配置格式
2. 配置变化能被自动监听和同步
3. 新用户克隆仓库后能自动配置环境

## 配置文件结构

### 1. 主配置文件 (`my-agent-config.json`)
```json
{
  "version": "1.0.0",
  "name": "My-Agent-Configuration",
  "description": "统一配置管理系统",
  "components": {
    "tools": "./tools/tools-config.json",
    "skills": "./skills/skills-config.json",
    "packages": "./packages/packages-config.json"
  },
  "hooks": {
    "postClone": "./scripts/setup-environment.sh",
    "postUpdate": "./scripts/update-components.sh"
  }
}
```

### 2. Tools 配置文件 (`tools/tools-config.json`)
```json
{
  "version": "1.0.0",
  "tools": [
    {
      "id": "news-aggregator",
      "name": "News Aggregator",
      "version": "1.0.0",
      "description": "Fetch and display trending news and blogs",
      "type": "node",
      "entryPoint": "./src/index.js",
      "port": 3000,
      "url": "http://localhost:3000",
      "dependencies": ["express", "axios", "cheerio"],
      "installCommand": "npm install",
      "startCommand": "npm start",
      "healthCheck": "/health",
      "repository": "https://github.com/your-org/news-aggregator",
      "configFile": "./tools/news-aggregator/package.json"
    },
    {
      "id": "devtools-dashboard",
      "name": "DevTools Dashboard",
      "version": "1.0.0",
      "description": "Graphical management dashboard for skills and tools",
      "type": "node",
      "entryPoint": "./server/server.js",
      "port": 3001,
      "url": "http://localhost:3001",
      "dependencies": ["express", "cors"],
      "installCommand": "npm install",
      "startCommand": "node server.js",
      "healthCheck": "/api/status",
      "configFile": "./tools/devtools-dashboard/server/package.json"
    }
  ]
}
```

### 3. Skills 配置文件 (`skills/skills-config.json`)
```json
{
  "version": "2.0.0",
  "skills": [
    {
      "id": "brainstorming",
      "name": "Brainstorming",
      "description": "思维风暴技能，用于创意构思和问题解决",
      "category": "development",
      "source": "superpowers",
      "enabled": true,
      "configFile": "./skills/brainstorming/skill.json",
      "dependencies": [],
      "lastUsed": "2026-01-15T00:00:00Z",
      "usageCount": 42
    },
    {
      "id": "skill-seekers",
      "name": "Skill Seekers",
      "description": "技能搜索工具，帮助发现新技能",
      "category": "discovery",
      "source": "yusufkaraaslan/Skill_Seekers",
      "enabled": true,
      "configFile": "./skills/skill-seekers/skill.json",
      "dependencies": [],
      "lastUsed": "2026-01-29T00:00:00Z",
      "usageCount": 18
    }
  ]
}
```

### 4. Packages 配置文件 (`packages/packages-config.json`)
```json
{
  "version": "1.0.0",
  "packages": [
    {
      "name": "express",
      "version": "^4.18.2",
      "description": "Fast, unopinionated, minimalist web framework for Node.js",
      "category": "web-framework",
      "required": true,
      "installed": true
    },
    {
      "name": "cors",
      "version": "^2.8.5",
      "description": "Node.js CORS middleware",
      "category": "middleware",
      "required": true,
      "installed": true
    },
    {
      "name": "axios",
      "version": "^1.6.0",
      "description": "Promise based HTTP client for the browser and node.js",
      "category": "http-client",
      "required": false,
      "installed": true
    }
  ]
}
```

## 文件监听钩子

### 1. 配置监听脚本 (`scripts/watch-configs.js`)
```javascript
const chokidar = require('chokidar')
const fs = require('fs').promises
const path = require('path')

class ConfigWatcher {
  constructor() {
    this.watchers = new Map()
    this.configFiles = [
      './tools/tools-config.json',
      './skills/skills-config.json',
      './packages/packages-config.json',
      './my-agent-config.json'
    ]
  }

  async start() {
    console.log('🚀 Starting config watcher...')
    
    for (const configFile of this.configFiles) {
      await this.watchFile(configFile)
    }
    
    // 监听 tools 目录变化
    this.watchDirectory('./tools', this.handleToolChange.bind(this))
    
    // 监听 skills 目录变化
    this.watchDirectory('./skills', this.handleSkillChange.bind(this))
    
    console.log('✅ Config watcher started successfully')
  }

  async watchFile(filePath) {
    const watcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true
    })

    watcher
      .on('change', async (path) => {
        console.log(`📝 Config file changed: ${path}`)
        await this.handleConfigChange(path)
      })
      .on('add', (path) => {
        console.log(`➕ Config file added: ${path}`)
      })
      .on('unlink', (path) => {
        console.log(`➖ Config file removed: ${path}`)
      })

    this.watchers.set(filePath, watcher)
  }

  watchDirectory(dirPath, handler) {
    const watcher = chokidar.watch(dirPath, {
      persistent: true,
      ignoreInitial: true,
      depth: 2
    })

    watcher
      .on('add', (path) => handler('add', path))
      .on('change', (path) => handler('change', path))
      .on('unlink', (path) => handler('remove', path))

    this.watchers.set(dirPath, watcher)
  }

  async handleConfigChange(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const config = JSON.parse(content)
      
      // 根据文件类型执行不同的操作
      if (filePath.includes('tools-config')) {
        await this.updateToolsDashboard(config)
      } else if (filePath.includes('skills-config')) {
        await this.updateSkillsDashboard(config)
      } else if (filePath.includes('packages-config')) {
        await this.updatePackagesDashboard(config)
      }
      
      console.log(`✅ Updated dashboard for: ${filePath}`)
    } catch (error) {
      console.error(`❌ Error handling config change: ${error.message}`)
    }
  }

  async handleToolChange(event, filePath) {
    console.log(`🛠️ Tool ${event}: ${filePath}`)
    
    if (filePath.endsWith('package.json')) {
      await this.syncToolConfig(filePath)
    }
  }

  async handleSkillChange(event, filePath) {
    console.log(`🧠 Skill ${event}: ${filePath}`)
    
    if (filePath.endsWith('.json') && !filePath.includes('skills-config')) {
      await this.syncSkillConfig(filePath)
    }
  }

  async syncToolConfig(packageJsonPath) {
    try {
      const content = await fs.readFile(packageJsonPath, 'utf8')
      const packageJson = JSON.parse(content)
      const toolDir = path.dirname(packageJsonPath)
      const toolName = path.basename(toolDir)
      
      // 更新 tools-config.json
      const toolsConfigPath = './tools/tools-config.json'
      const toolsConfigContent = await fs.readFile(toolsConfigPath, 'utf8')
      const toolsConfig = JSON.parse(toolsConfigContent)
      
      const existingToolIndex = toolsConfig.tools.findIndex(t => t.id === toolName)
      
      const toolConfig = {
        id: toolName,
        name: packageJson.name || toolName,
        version: packageJson.version || '1.0.0',
        description: packageJson.description || `Tool: ${toolName}`,
        type: 'node',
        entryPoint: packageJson.main || './index.js',
        port: this.detectPort(packageJson),
        url: this.generateUrl(toolName, packageJson),
        dependencies: Object.keys(packageJson.dependencies || {}),
        installCommand: 'npm install',
        startCommand: packageJson.scripts?.start || 'node index.js',
        healthCheck: '/health',
        repository: packageJson.repository || '',
        configFile: packageJsonPath
      }
      
      if (existingToolIndex >= 0) {
        toolsConfig.tools[existingToolIndex] = toolConfig
      } else {
        toolsConfig.tools.push(toolConfig)
      }
      
      await fs.writeFile(toolsConfigPath, JSON.stringify(toolsConfig, null, 2))
      console.log(`✅ Synced tool config for: ${toolName}`)
    } catch (error) {
      console.error(`❌ Error syncing tool config: ${error.message}`)
    }
  }

  detectPort(packageJson) {
    // 从 scripts 中检测端口
    const startScript = packageJson.scripts?.start || ''
    const portMatch = startScript.match(/--port\s+(\d+)/) || startScript.match(/:(\d+)/)
    return portMatch ? parseInt(portMatch[1]) : 3000
  }

  generateUrl(toolName, packageJson) {
    if (packageJson.homepage) return packageJson.homepage
    
    const port = this.detectPort(packageJson)
    return `http://localhost:${port}`
  }

  async syncSkillConfig(skillJsonPath) {
    // 类似 tool 的同步逻辑
    console.log(`Syncing skill config: ${skillJsonPath}`)
  }

  async updateToolsDashboard(config) {
    // 通知 dashboard 更新 tools 数据
    console.log('Updating tools dashboard with new config')
  }

  async updateSkillsDashboard(config) {
    // 通知 dashboard 更新 skills 数据
    console.log('Updating skills dashboard with new config')
  }

  async updatePackagesDashboard(config) {
    // 通知 dashboard 更新 packages 数据
    console.log('Updating packages dashboard with new config')
  }

  stop() {
    for (const [path, watcher] of this.watchers) {
      watcher.close()
    }
    console.log('🛑 Config watcher stopped')
  }
}

// 启动监听器
if (require.main === module) {
  const watcher = new ConfigWatcher()
  watcher.start()
  
  // 优雅关闭
  process.on('SIGINT', () => {
    watcher.stop()
    process.exit(0)
  })
}

module.exports = ConfigWatcher
```

### 2. 环境设置脚本 (`scripts/setup-environment.sh`)
```bash
#!/bin/bash

echo "🚀 Setting up My-Agent-Configuration environment..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# 创建必要的目录
mkdir -p tools skills packages scripts

# 安装全局依赖
echo "📦 Installing global dependencies..."
npm install -g chokidar

# 安装项目依赖
echo "📦 Installing project dependencies..."
cd tools/devtools-dashboard/server && npm install
cd ../..

# 启动配置监听器
echo "👂 Starting config watcher..."
node scripts/watch-configs.js &

# 启动 dashboard
echo "📊 Starting DevTools Dashboard..."
cd tools/devtools-dashboard/server && node server.js &

echo "✅ Environment setup complete!"
echo "🌐 Dashboard: http://localhost:3001"
echo "📝 Test page: http://localhost:3001/test-api.html"
```

## 实施步骤

1. **创建配置文件**：
   ```bash
   # 创建主配置
   touch my-agent-config.json
   
   # 创建组件配置
   mkdir -p tools skills packages scripts
   touch tools/tools-config.json
   touch skills/skills-config.json
   touch packages/packages-config.json
   ```

2. **安装依赖**：
   ```bash
   npm install chokidar
   ```

3. **设置钩子**：
   ```bash
   # 添加到 package.json scripts
   "scripts": {
     "watch": "node scripts/watch-configs.js",
     "setup": "./scripts/setup-environment.sh",
     "dashboard": "cd tools/devtools-dashboard/server && node server.js"
   }
   ```

4. **更新 .gitignore**：
   ```gitignore
   # 忽略生成的配置
   generated-configs/
   
   # 忽略 node_modules
   node_modules/
   **/node_modules/
   ```

5. **添加文档**：
   - README.md 说明配置系统
   - CONTRIBUTING.md 说明如何添加新组件

## 优势

1. **一致性**：所有组件使用相同的配置格式
2. **可发现性**：通过 dashboard 查看所有组件状态
3. **可维护性**：配置变化自动同步
4. **可移植性**：新用户一键设置环境
5. **可扩展性**：轻松添加新组件类型

## 下一步

1. 实现配置监听器
2. 更新 dashboard 使用新配置格式
3. 创建环境设置脚本
4. 添加 Git 钩子自动同步配置