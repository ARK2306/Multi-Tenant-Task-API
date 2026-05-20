import { api } from './client'
import type { LoginResponse } from '@/types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
  return res.data
}

export async function register(data: {
  organizationName: string
  email: string
  password: string
}): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/register', data)
  return res.data
}

export async function inviteMember(email: string, role: string): Promise<void> {
  await api.post('/api/auth/invite', { email, role })
}
