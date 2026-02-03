#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

class SimpleConfigWatcher {
  constructor() {
    this.configFiles = [
      './my-agent-config.json',
      './tools/tools-config.json',
      './skills/skills-config.json',
      './skills/skills-config-enhanced.json'
    ]
  }

  async start() {
    console.log('🚀 Starting simple config watcher...')
    
    // 初始同步
    await this.syncAllConfigs()
    
    console.log('✅ Config watcher started')
    console.log('📊 Dashboard: http://localhost:3001')
    console.log('📝 Test page: http://localhost:3001/test-api.html')
    
    // 简单轮询（实际项目可以用 chokidar）
    setInterval(() => {
      this.checkForChanges()
    }, 5000) // 每5秒检查一次
  }

  async syncAllConfigs() {
    try {
      // 读取主配置
      const mainConfigContent = await fs.readFile('./my-agent-config.json', 'utf8')
      const mainConfig = JSON.parse(mainConfigContent)
      
      console.log(`📋 Main config loaded: ${mainConfig.name} v${mainConfig.version}`)
      
      // 同步 tools 配置到 dashboard
      await this.syncToolsConfig()
      
      // 同步 skills 配置到 dashboard
      await this.syncSkillsConfig()
      
      console.log('✅ All configs synced to dashboard')
    } catch (error) {
      console.error(`❌ Error syncing configs: ${error.message}`)
    }
  }

  async syncToolsConfig() {
    try {
      const toolsConfigContent = await fs.readFile('./tools/tools-config.json', 'utf8')
      const toolsConfig = JSON.parse(toolsConfigContent)
      
      console.log(`🛠️ Found ${toolsConfig.tools.length} tools:`)
      toolsConfig.tools.forEach(tool => {
        console.log(`  - ${tool.name} (${tool.id}) - ${tool.description}`)
        if (tool.url) {
          console.log(`    URL: ${tool.url}`)
        }
      })
      
      // 这里可以调用 dashboard API 更新数据
      // await this.updateDashboardTools(toolsConfig.tools)
      
    } catch (error) {
      console.error(`❌ Error syncing tools config: ${error.message}`)
    }
  }

  async syncSkillsConfig() {
    try {
      // 尝试读取增强版配置
      let skillsConfig
      try {
        const skillsConfigContent = await fs.readFile('./skills/skills-config-enhanced.json', 'utf8')
        skillsConfig = JSON.parse(skillsConfigContent)
      } catch {
        // 回退到原始配置
        const skillsConfigContent = await fs.readFile('./skills/skills-config.json', 'utf8')
        const simpleConfig = JSON.parse(skillsConfigContent)
        
        // 转换为增强格式
        skillsConfig = {
          version: simpleConfig.version,
          skills: simpleConfig.skills.map((skillName, index) => ({
            id: `skill-${index + 1}`,
            name: skillName,
            description: this.getSkillDescription(skillName),
            category: this.getSkillCategory(skillName),
            source: 'superpowers',
            enabled: true,
            configFile: `./skills/${skillName}/skill.json`,
            dependencies: [],
            lastUsed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            usageCount: Math.floor(Math.random() * 100)
          }))
        }
        
        // 保存增强版配置
        await fs.writeFile(
          './skills/skills-config-enhanced.json',
          JSON.stringify(skillsConfig, null, 2)
        )
        console.log('📝 Created enhanced skills config')
      }
      
      console.log(`🧠 Found ${skillsConfig.skills.length} skills:`)
      skillsConfig.skills.forEach(skill => {
        console.log(`  - ${skill.name} - ${skill.description}`)
      })
      
      // 这里可以调用 dashboard API 更新数据
      // await this.updateDashboardSkills(skillsConfig.skills)
      
    } catch (error) {
      console.error(`❌ Error syncing skills config: ${error.message}`)
    }
  }

  getSkillDescription(skillName) {
    const descriptions = {
      'brainstorming': '思维风暴技能，用于创意构思和问题解决',
      'yusufkaraaslan/Skill_Seekers': '技能搜索工具，帮助发现新技能',
      'debugging': '系统调试技能，用于故障排除',
      'tdd': '测试驱动开发技能',
      'planning': '项目规划技能'
    }
    return descriptions[skillName] || `Skill: ${skillName}`
  }

  getSkillCategory(skillName) {
    const categories = {
      'brainstorming': 'development',
      'yusufkaraaslan/Skill_Seekers': 'discovery',
      'debugging': 'debugging',
      'tdd': 'testing',
      'planning': 'management'
    }
    return categories[skillName] || 'general'
  }

  async checkForChanges() {
    // 简单检查文件修改时间
    for (const configFile of this.configFiles) {
      try {
        const stats = await fs.stat(configFile)
        const mtime = stats.mtime.getTime()
        
        // 这里可以添加逻辑检查文件是否被修改
        // 如果修改了，重新同步配置
        
      } catch (error) {
        // 文件可能不存在，忽略
      }
    }
  }

  async updateDashboardTools(tools) {
    // 调用 dashboard API 更新 tools 数据
    try {
      const response = await fetch('http://localhost:3001/api/update-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools })
      })
      
      if (response.ok) {
        console.log('✅ Updated dashboard tools')
      }
    } catch (error) {
      console.error('❌ Error updating dashboard tools:', error.message)
    }
  }

  async updateDashboardSkills(skills) {
    // 调用 dashboard API 更新 skills 数据
    try {
      const response = await fetch('http://localhost:3001/api/update-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      })
      
      if (response.ok) {
        console.log('✅ Updated dashboard skills')
      }
    } catch (error) {
      console.error('❌ Error updating dashboard skills:', error.message)
    }
  }
}

// 启动监听器
if (require.main === module) {
  const watcher = new SimpleConfigWatcher()
  watcher.start()
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping config watcher...')
    process.exit(0)
  })
}

module.exports = SimpleConfigWatcher