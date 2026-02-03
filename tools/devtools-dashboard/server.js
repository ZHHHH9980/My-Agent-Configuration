const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs').promises
const path = require('path')
const net = require('net')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// 工具函数：读取 JSON 文件
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return null
  }
}

// 工具函数：检查端口是否开放
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    
    const onError = () => {
      socket.destroy()
      resolve(false)
    }
    
    socket.setTimeout(1000)
    socket.on('timeout', onError)
    socket.on('error', onError)
    socket.on('connect', () => {
      socket.end()
      resolve(true)
    })
    
    socket.connect(port, host)
  })
}

// 工具函数：获取工具运行状态
async function getToolStatus(tool) {
  // 根据工具ID确定要检查的端口
  let portToCheck = null
  let host = 'localhost'
  
  if (tool.id === 'news-aggregator') {
    portToCheck = 3000
  } else if (tool.id === 'devtools-dashboard') {
    portToCheck = 3001
  } else if (tool.id === 'ralphy') {
    // ralphy可能没有HTTP服务端口
    return 'stopped'
  }
  
  if (portToCheck) {
    const isRunning = await checkPort(host, portToCheck)
    return isRunning ? 'running' : 'stopped'
  }
  
  // 如果没有配置端口，检查是否有运行脚本
  if (tool.scripts && Object.keys(tool.scripts).length > 0) {
    // 这里可以添加更复杂的进程检查逻辑
    return 'stopped'
  }
  
  return 'stopped'
}

// 工具函数：扫描工具目录
async function scanToolsDirectory(toolsDir) {
  try {
    const items = await fs.readdir(toolsDir, { withFileTypes: true })
    const tools = []
    
    for (const item of items) {
      if (item.isDirectory()) {
        const toolPath = path.join(toolsDir, item.name)
        
        // 尝试在多个位置查找 package.json
        let packageJsonPath = path.join(toolPath, 'package.json')
        let packageJson = await readJsonFile(packageJsonPath)
        
        // 如果在根目录没找到，尝试在 cli 子目录中查找（针对ralphy）
        if (!packageJson && item.name === 'ralphy') {
          packageJsonPath = path.join(toolPath, 'cli', 'package.json')
          packageJson = await readJsonFile(packageJsonPath)
        }
        
        if (packageJson) {
          // 从 package.json 提取 URL
          let url = ''
          if (packageJson.homepage) {
            url = packageJson.homepage
          } else if (packageJson.repository && typeof packageJson.repository === 'object' && packageJson.repository.url) {
            url = packageJson.repository.url
          } else if (typeof packageJson.repository === 'string') {
            url = packageJson.repository
          }
          
          tools.push({
            id: item.name,
            name: packageJson.name || item.name,
            version: packageJson.version || '1.0.0',
            description: packageJson.description || `Tool: ${item.name}`,
            path: toolPath,
            scripts: packageJson.scripts || {},
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            homepage: packageJson.homepage || '',
            repository: packageJson.repository || '',
            bugs: packageJson.bugs || '',
            url: url
          })
        } else {
          // 如果没有 package.json，添加基本信息
          tools.push({
            id: item.name,
            name: item.name,
            version: '1.0.0',
            description: `Tool: ${item.name}`,
            path: toolPath,
            scripts: {},
            dependencies: {},
            devDependencies: {},
            homepage: '',
            repository: '',
            bugs: '',
            url: ''
          })
        }
      }
    }
    
    return tools
  } catch (error) {
    console.error('Error scanning tools directory:', error.message)
    return []
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    // API 路由
    if (pathname.startsWith('/api/')) {
      try {
        // 1. 获取系统状态
        if (pathname === '/api/status') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            services: {
              skills: 'running',
              tools: 'running',
              api: 'running',
              dashboard: 'running'
            }
          }))
          return
        }

        // 2. 获取所有技能
        if (pathname === '/api/skills') {
          try {
            const skillsConfigPath = path.join(__dirname, '..', 'skills', 'skills-config.json')
            const skillsData = await readJsonFile(skillsConfigPath)
            
            if (skillsData && skillsData.skills) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                version: '2.0.0',
                lastUpdated: new Date().toISOString(),
                count: skillsData.skills.length,
                skills: skillsData.skills.map(skill => ({
                  ...skill,
                  lastUsed: skill.lastUsed || new Date().toISOString(),
                  usageCount: skill.usageCount || 0
                }))
              }))
            } else {
              // 返回模拟数据
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                version: '2.0.0',
                lastUpdated: new Date().toISOString(),
                count: 2,
                skills: [
                  {
                    id: 'skill-1',
                    name: 'brainstorming',
                    description: '思维风暴技能，用于创意构思和问题解决',
                    category: 'development',
                    enabled: true,
                    source: 'superpowers',
                    lastUsed: new Date().toISOString(),
                    usageCount: 0
                  },
                  {
                    id: 'skill-2',
                    name: 'yusufkaraaslan/Skill_Seekers',
                    description: '技能搜索工具，帮助发现新技能',
                    category: 'discovery',
                    enabled: true,
                    source: 'superpowers',
                    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    usageCount: 29
                  }
                ]
              }))
            }
          } catch (error) {
            console.error('Error fetching skills:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to fetch skills' }))
          }
          return
        }

        // 3. 获取所有工具
        if (pathname === '/api/tools') {
          try {
            const toolsDir = path.join(__dirname, '..', '..', 'tools')
            const tools = await scanToolsDirectory(toolsDir)
            
            // 添加状态信息
            const toolsWithStatus = await Promise.all(tools.map(async (tool) => {
              // 检查是否有URL
              let url = tool.url
              if (!url && tool.path.includes('news-aggregator')) {
                url = 'http://localhost:3000' // 假设 news-aggregator 运行在 3000
              }
              
              // 获取实际运行状态
              const status = await getToolStatus(tool)
              const isRunning = status === 'running'
              
              return {
                ...tool,
                url: url,
                status: status,
                health: isRunning ? 'healthy' : 'stopped',
                lastStarted: isRunning ? new Date(Date.now() - 3600000).toISOString() : null, // 如果停止则返回null
                uptime: isRunning ? 3600 : 0 // 假设运行1小时
              }
            }))
            
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              count: toolsWithStatus.length,
              tools: toolsWithStatus
            }))
          } catch (error) {
            console.error('Error fetching tools:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to fetch tools' }))
          }
          return
        }

        // 4. 获取仪表盘数据（聚合）
        if (pathname === '/api/dashboard') {
          try {
            // 模拟数据
            const skillsCount = 2
            const toolsCount = 1
            const runningTools = 1
            
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              stats: {
                skills: skillsCount,
                tools: toolsCount,
                running: runningTools,
                packages: 24 // 模拟数据
              },
              status: { status: 'healthy' },
              recentActivities: [
                { id: 1, action: 'Skill enabled', target: 'brainstorming', time: '2 hours ago', status: 'success' },
                { id: 2, action: 'Tool started', target: 'news-aggregator', time: '1 day ago', status: 'success' },
                { id: 3, action: 'Skill disabled', target: 'debugging', time: '2 days ago', status: 'warning' },
                { id: 4, action: 'Package updated', target: 'ralphy-cli', time: '3 days ago', status: 'success' }
              ],
              systemStatus: [
                { name: 'Skills System', status: 'healthy', value: 'Healthy' },
                { name: 'Tools Manager', status: 'healthy', value: 'Running' },
                { name: 'Package Updates', status: 'warning', value: '3 available' },
                { name: 'API Server', status: 'healthy', value: 'Online' }
              ]
            }))
          } catch (error) {
            console.error('Error fetching dashboard data:', error)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to fetch dashboard data' }))
          }
          return
        }

        // 其他 API 路由
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'API endpoint not found' }))
        
      } catch (error) {
        console.error('API error:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
      return
    }

    // 其他请求交给 Next.js 处理
    handle(req, res, parsedUrl)
  })

  const PORT = process.env.PORT || 3001
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
    console.log(`> API endpoints available at http://localhost:${PORT}/api/*`)
    console.log(`> Dashboard available at http://localhost:${PORT}`)
  })
})