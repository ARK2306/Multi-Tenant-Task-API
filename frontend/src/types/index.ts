export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED'
export type UserRole     = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface User {
  id: string
  name?: string
  email: string
  role: UserRole
  joinedAt?: string
  createdAt?: string
}

export interface Project {
  id: string
  key?: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  members?: User[]
  taskCount?: number
}

export interface LastComment {
  content: string
  authorEmail: string
  createdAt: string
}

export interface Task {
  id: string
  key?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assigneeEmail?: string
  assignee?: User
  reporterId?: string
  reporter?: User
  dueDate?: string
  projectId: string
  createdAt: string
  comments?: Comment[]
  lastComment?: LastComment
}

export interface Comment {
  id: string
  content: string
  authorId?: string
  author?: User
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  organizationName?: string
}

export interface LoginResponse {
  token: string
  id: string
  email: string
  role: UserRole
  organizationName: string
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  openTasks: number
  completedThisWeek: number
  byStatus: { status: TaskStatus; count: number }[]
}
