import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './Sidebar'
import { getProjects } from '@/api/projects'

export function AppShell() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 60_000,
  })

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      <Sidebar projects={projects} />
      <main style={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  )
}
