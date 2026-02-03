export const API_BASE_URL = 'http://localhost:3001'

export interface DashboardStats {
  skills: number
  tools: number
  running: number
  packages: number
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
  source: string
  lastUsed: string
  usageCount: number
}

export interface Tool {
  id: string
  name: string
  version: string
  description: string
  path: string
  scripts: Record<string, string>
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  homepage?: string
  repository?: string | { url: string }
  bugs?: string | { url: string }
  url: string
  status: string
  health: string
  lastStarted: string
  uptime: number
}

export interface SystemStatus {
  name: string
  status: string
  value: string
}

export interface RecentActivity {
  id: number
  action: string
  target: string
  time: string
  status: string
}

export interface DashboardData {
  stats: DashboardStats
  status: { status: string }
  recentActivities: RecentActivity[]
  systemStatus: SystemStatus[]
}

export interface SkillsResponse {
  version: string
  lastUpdated: string
  count: number
  skills: Skill[]
}

export interface ToolsResponse {
  count: number
  tools: Tool[]
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`)
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  return response.json()
}

export async function fetchSkills(): Promise<SkillsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/skills`)
  if (!response.ok) {
    throw new Error('Failed to fetch skills')
  }
  return response.json()
}

export async function fetchTools(): Promise<ToolsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/tools`)
  if (!response.ok) {
    throw new Error('Failed to fetch tools')
  }
  return response.json()
}

export async function fetchSystemStatus() {
  const response = await fetch(`${API_BASE_URL}/api/status`)
  if (!response.ok) {
    throw new Error('Failed to fetch system status')
  }
  return response.json()
}