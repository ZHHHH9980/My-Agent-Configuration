'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  skills: number
  tools: number
  running: number
  packages: number
}

interface Skill {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  source: string
  lastUsed: string
  usageCount: number
}

interface Tool {
  id: string
  name: string
  version: string
  description: string
  path: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  homepage: string
  repository: string | Record<string, string>
  bugs: string | Record<string, string>
  url?: string
  status: string
  health: string
  lastStarted?: string | null
  uptime: number
}

interface SystemStatus {
  name: string
  status: string
  value: string
}

interface RecentActivity {
  id: number
  action: string
  target: string
  time: string
  status: string
}

interface DashboardData {
  stats: DashboardStats
  status: { status: string }
  recentActivities: RecentActivity[]
  systemStatus: SystemStatus[]
}

interface SkillsResponse {
  version: string
  lastUpdated: string
  count: number
  skills: Skill[]
}

interface ToolsResponse {
  count: number
  tools: Tool[]
}

const API_BASE_URL = 'http://localhost:3001'

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`)
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

async function fetchSkills(): Promise<SkillsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/skills`)
  if (!response.ok) {
    throw new Error('Failed to fetch skills')
  }
  return response.json()
}

async function fetchTools(): Promise<ToolsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tools`)
  if (!response.ok) {
    throw new Error('Failed to fetch tools')
  }
  return response.json()
}

export default function HomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null)
  const [toolsData, setToolsData] = useState<ToolsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    skills: false,
    tools: false,
    systemStatus: false,
    recentActivities: false
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [dashboard, skills, tools] = await Promise.all([
          fetchDashboardData(),
          fetchSkills(),
          fetchTools()
        ])
        setDashboardData(dashboard)
        setSkillsData(skills)
        setToolsData(tools)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading DevTools Dashboard...</h1>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">Make sure the API server is running on http://localhost:3001</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">DevTools Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Graphical management dashboard for My-Agent-Configuration skills and tools
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <span>API: http://localhost:3001</span>
            <span className="ml-4">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {dashboardData && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{dashboardData.stats.skills}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Total skills available</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Tools</h3>
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">{dashboardData.stats.tools}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Installed tools</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Running</h3>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-bold">{dashboardData.stats.running}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Active tools</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Packages</h3>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">{dashboardData.stats.packages}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Total packages</p>
              </div>
            </div>
          </div>
        )}

        {skillsData && skillsData.skills.length > 0 && (
          <div className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('skills')}
            >
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Skills</h2>
                <span className="ml-3 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {skillsData.count}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">
                  {expandedSections.skills ? 'Click to collapse' : 'Click to expand'}
                </span>
                <svg 
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedSections.skills && (
              <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {skillsData.skills.map((skill) => (
                        <tr key={skill.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{skill.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{skill.source}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600">{skill.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {skill.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              skill.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {skill.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(skill.lastUsed).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${Math.min(skill.usageCount, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{skill.usageCount}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total skills:</span> {skillsData.count} • 
                    <span className="ml-4 font-medium">Enabled:</span> {skillsData.skills.filter(s => s.enabled).length} • 
                    <span className="ml-4 font-medium">Last updated:</span> {skillsData.lastUpdated ? new Date(skillsData.lastUpdated).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {toolsData && toolsData.tools.length > 0 && (
          <div className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('tools')}
            >
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Tools</h2>
                <span className="ml-3 px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  {toolsData.count}
                </span>
                <span className="ml-2 px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                  {toolsData.tools.filter(t => t.status === 'running').length} running
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">
                  {expandedSections.tools ? 'Click to collapse' : 'Click to expand'}
                </span>
                <svg 
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedSections.tools ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedSections.tools && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toolsData.tools.map((tool) => (
                    <div key={tool.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">v{tool.version}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tool.status === 'running' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{tool.description}</p>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>
                          <span className="font-medium">Path:</span> {tool.path.split('/').slice(-3).join('/')}
                        </div>
                        <div>
                          <span className="font-medium">Health:</span> {tool.health}
                        </div>
                        <div>
                          <span className="font-medium">Uptime:</span> {Math.floor(tool.uptime / 3600)}h {Math.floor((tool.uptime % 3600) / 60)}m
                        </div>
                        {tool.url && (
                          <div>
                            <span className="font-medium">URL:</span>{' '}
                            <a 
                              href={tool.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {tool.url.replace('https://', '').replace('http://', '').split('/')[0]}
                            </a>
                          </div>
                        )}
                        {tool.dependencies && Object.keys(tool.dependencies).length > 0 && (
                          <div>
                            <span className="font-medium">Dependencies:</span>{' '}
                            <span className="text-gray-500">
                              {Object.keys(tool.dependencies).length} packages
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Started: {tool.lastStarted ? new Date(tool.lastStarted).toLocaleDateString() : 'Never'}</span>
                          <span>ID: {tool.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total tools:</span> {toolsData.count} • 
                    <span className="ml-4 font-medium">Running:</span> {toolsData.tools.filter(t => t.status === 'running').length} • 
                    <span className="ml-4 font-medium">Stopped:</span> {toolsData.tools.filter(t => t.status === 'stopped').length}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {dashboardData && dashboardData.systemStatus.length > 0 && (
          <div className="mb-8">
            <div 
              className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('systemStatus')}
            >
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-gray-900">System Status</h2>
                <span className="ml-3 px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                  {dashboardData.systemStatus.length} components
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">
                  {expandedSections.systemStatus ? 'Click to collapse' : 'Click to expand'}
                </span>
                <svg 
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedSections.systemStatus ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedSections.systemStatus && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardData.systemStatus.map((status, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">{status.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.status === 'healthy' 
                            ? 'bg-green-100 text-green-800'
                            : status.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{status.value}</p>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Last checked: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Overall status:</span>{' '}
                    <span className={`font-medium ${
                      dashboardData.status.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dashboardData.status.status.toUpperCase()}
                    </span> • 
                    <span className="ml-4 font-medium">Healthy:</span> {dashboardData.systemStatus.filter(s => s.status === 'healthy').length} • 
                    <span className="ml-4 font-medium">Warnings:</span> {dashboardData.systemStatus.filter(s => s.status === 'warning').length}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {dashboardData && dashboardData.recentActivities.length > 0 && (
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('recentActivities')}
            >
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Recent Activities</h2>
                <span className="ml-3 px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                  {dashboardData.recentActivities.length} activities
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">
                  {expandedSections.recentActivities ? 'Click to collapse' : 'Click to expand'}
                </span>
                <svg 
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${expandedSections.recentActivities ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedSections.recentActivities && (
              <div className="mt-4">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center py-4 px-6 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                      <div className={`w-3 h-3 rounded-full mr-4 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-600 mt-1">{activity.target}</div>
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Activity summary:</span>{' '}
                    <span className="text-green-600">
                      {dashboardData.recentActivities.filter(a => a.status === 'success').length} successful
                    </span> • 
                    <span className="ml-4 text-yellow-600">
                      {dashboardData.recentActivities.filter(a => a.status === 'warning').length} warnings
                    </span> • 
                    <span className="ml-4 text-red-600">
                      {dashboardData.recentActivities.filter(a => a.status === 'error').length} errors
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>DevTools Dashboard v1.0.0 • My-Agent-Configuration</p>
          <p className="text-sm mt-2">
            API Server: http://localhost:3001 • Data fetched from local system
          </p>
        </div>
      </footer>
    </div>
  )
}