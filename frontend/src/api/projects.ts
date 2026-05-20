import { api } from './client'
import type { Project } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const res = await api.get<{ content: Project[] }>('/api/projects')
  return res.data.content
}

export async function createProject(data: {
  name: string
  description: string
}): Promise<Project> {
  const res = await api.post<Project>('/api/projects', data)
  return res.data
}

export async function updateProject(
  id: string,
  data: Partial<{ name: string; description: string; status: string }>
): Promise<Project> {
  const res = await api.put<Project>(`/api/projects/${id}`, data)
  return res.data
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/api/projects/${id}`)
}
