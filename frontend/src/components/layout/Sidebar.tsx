import { useNavigate, useLocation } from 'react-router-dom'
import {
  Inbox, FolderOpen, CheckSquare, Users, Settings, Plus, Search, LogOut, ChevronDown, MoreHorizontal,
} from 'lucide-react'
import { NexusLogo } from '@/components/shared/NexusLogo'
import { Avatar } from '@/components/shared/Avatar'
import { useAuthStore } from '@/store/auth'
import type { Project } from '@/types'

const NAV = [
  { id: 'dashboard', label: 'Inbox',    path: '/dashboard', icon: Inbox,       count: 3 },
  { id: 'projects',  label: 'Projects', path: '/projects',  icon: FolderOpen },
  { id: 'members',   label: 'Members',  path: '/members',   icon: Users },
  { id: 'settings',  label: 'Settings', path: '/settings',  icon: Settings },
]

interface SidebarProps {
  projects?: Project[]
}

export function Sidebar({ projects = [] }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, clearAuth } = useAuthStore()

  const active = pathname.startsWith('/projects') ? 'projects'
    : pathname.startsWith('/members') ? 'members'
    : pathname.startsWith('/settings') ? 'settings'
    : 'dashboard'

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        height: '100%',
        background: '#0F0F11',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Org header */}
      <div style={{ padding: '10px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
            transition: 'background .12s',
          }}
          className="nx-hover"
        >
          <NexusLogo size={22} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', color: '#F4F4F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.organizationName ?? 'My Organization'}
            </div>
            <div style={{ fontSize: 10.5, color: '#6B6B73', marginTop: 1, whiteSpace: 'nowrap' }}>
              Pro · workspace
            </div>
          </div>
          <ChevronDown size={12} color="#6B6B73" />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 10px 4px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 8px', height: 28,
            background: '#16161A', borderRadius: 6,
            color: '#6B6B73', fontSize: 12.5,
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
        >
          <Search size={13} />
          <span style={{ flex: 1 }}>Search</span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 18, height: 18, padding: '0 4px',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4,
              background: '#1C1C21', color: '#9C9CA4',
              fontFamily: 'Geist Mono, monospace', fontSize: 10,
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '6px 8px', flex: 1, overflow: 'auto' }}>
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 6,
                color: isActive ? '#F4F4F5' : '#D4D4D8',
                background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                cursor: 'pointer',
                fontSize: 13, fontWeight: 450,
                transition: 'background .12s, color .12s',
              }}
              className={isActive ? '' : 'nx-hover'}
            >
              <Icon size={15} color={isActive ? '#F4F4F5' : '#9C9CA4'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ fontSize: 11, color: '#6B6B73' }}>{item.count}</span>
              )}
            </div>
          )
        })}

        {/* Projects sub-section */}
        {projects.filter((p) => p.status === 'ACTIVE').length > 0 && (
          <>
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 10px 6px 10px',
                fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#6B6B73',
              }}
            >
              <span>Projects</span>
              <Plus size={12} color="#6B6B73" style={{ cursor: 'pointer' }} />
            </div>
            {projects
              .filter((p) => p.status === 'ACTIVE')
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="nx-hover"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13, color: '#D4D4D8',
                    transition: 'background .12s',
                  }}
                >
                  <span
                    style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: 'rgba(59,130,246,0.2)',
                      border: '1px solid rgba(59,130,246,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8.5, fontWeight: 700, color: '#F4F4F5',
                      fontFamily: 'Geist Mono, monospace',
                    }}
                  >
                    {(p.key ?? p.name)[0]}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                </div>
              ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 6, borderRadius: 7,
          }}
        >
          {user && <Avatar name={user.email} size={22} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: '#F4F4F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email?.split('@')[0] ?? ''}
            </div>
            <div style={{ fontSize: 10.5, color: '#6B6B73', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email ?? ''}
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); navigate('/login') }}
            title="Sign out"
            style={{
              background: 'transparent', border: 'none',
              color: '#6B6B73', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              padding: 4, borderRadius: 4,
              transition: 'color .12s',
            }}
          >
            <LogOut size={14} />
          </button>
          <MoreHorizontal size={14} color="#6B6B73" style={{ cursor: 'pointer' }} />
        </div>
      </div>
    </aside>
  )
}
