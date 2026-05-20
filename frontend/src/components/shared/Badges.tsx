import type { TaskStatus, TaskPriority, UserRole, ProjectStatus } from '@/types'

const PRIORITY_MAP: Record<TaskPriority, { label: string; color: string }> = {
  LOW:      { label: 'Low',      color: '#10B981' },
  MEDIUM:   { label: 'Medium',   color: '#3B82F6' },
  HIGH:     { label: 'High',     color: '#F59E0B' },
  CRITICAL: { label: 'Critical', color: '#EF4444' },
}

const STATUS_MAP: Record<TaskStatus, { label: string; color: string }> = {
  TODO:        { label: 'Todo',        color: '#6B6B73' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6' },
  IN_REVIEW:   { label: 'In Review',   color: '#A855F7' },
  DONE:        { label: 'Done',        color: '#10B981' },
}

function Badge({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 7px',
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      }}
    >
      {children}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const v = PRIORITY_MAP[priority]
  return (
    <Badge color={v.color}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: v.color }} />
      {v.label}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const v = STATUS_MAP[status]
  return <Badge color={v.color}>{v.label}</Badge>
}

export function RoleBadge({ role }: { role: UserRole }) {
  const color =
    role === 'OWNER' ? '#A855F7' : role === 'ADMIN' ? '#3B82F6' : '#71717A'
  return (
    <Badge color={color}>
      <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>{role}</span>
    </Badge>
  )
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  if (status === 'ACTIVE') {
    return (
      <Badge color="#10B981">
        <span style={{ width: 6, height: 6, borderRadius: 99, background: '#10B981' }} />
        Active
      </Badge>
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        color: '#9C9CA4',
        background: '#16161A',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      Archived
    </span>
  )
}

export { STATUS_MAP, PRIORITY_MAP }
