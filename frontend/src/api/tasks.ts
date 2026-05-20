import { api } from './client'
import type { Task, Comment, TaskStatus, TaskPriority } from '@/types'

export async function getTasks(projectId: string): Promise<Task[]> {
  const res = await api.get<{ content: Task[] }>(`/api/projects/${projectId}/tasks`)
  return res.data.content
}

export async function createTask(
  projectId: string,
  data: {
    title: string
    description?: string
    priority?: TaskPriority
    assigneeId?: string
    dueDate?: string
    status?: TaskStatus
  }
): Promise<Task> {
  const res = await api.post<Task>(`/api/projects/${projectId}/tasks`, data)
  return res.data
}

export async function updateTask(
  id: string,
  data: {
    title: string
    description?: string
    priority: TaskPriority
    assigneeId?: string
    dueDate?: string
  }
): Promise<Task> {
  const res = await api.put<Task>(`/api/tasks/${id}`, data)
  return res.data
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await api.patch<Task>(`/api/tasks/${id}/status`, { status })
  return res.data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`)
}

export async function getComments(taskId: string): Promise<Comment[]> {
  const res = await api.get<Comment[]>(`/api/tasks/${taskId}/comments`)
  return res.data
}

export async function addComment(taskId: string, content: string): Promise<Comment> {
  const res = await api.post<Comment>(`/api/tasks/${taskId}/comments`, { content })
  return res.data
}

export async function updateComment(id: string, content: string): Promise<Comment> {
  const res = await api.put<Comment>(`/api/comments/${id}`, { content })
  return res.data
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/api/comments/${id}`)
}
