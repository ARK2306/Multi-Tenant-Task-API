import { api } from './client'
import type { User } from '@/types'

export async function getMembers(): Promise<User[]> {
  const res = await api.get<User[]>('/api/users')
  return res.data
}
