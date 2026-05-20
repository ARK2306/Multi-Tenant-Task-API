import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Calendar, Filter, TrendingUp, Building2, Plus } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Avatar } from '@/components/shared/Avatar'
import { PriorityBadge, STATUS_MAP } from '@/components/shared/Badges'
import { Spinner } from '@/components/shared/Spinner'
import { getProjects } from '@/api/projects'
import { getTasks } from '@/api/tasks'
import { useAuthStore } from '@/store/auth'
import { formatDue, formatDate } from '@/lib/utils'
import type { Task, Project, TaskStatus } from '@/types'

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: '#6B6B73', IN_PROGRESS: '#3B82F6', IN_REVIEW: '#A855F7', DONE: '#10B981',
}

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 60_000,
  })

  // Fetch tasks for all active projects and aggregate
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE')
  const allTaskQueries = useQuery({
    queryKey: ['all-tasks', activeProjects.map((p) => p.id).join(',')],
    queryFn: async () => {
      const results = await Promise.all(activeProjects.map((p) => getTasks(p.id)))
      return results.flat()
    },
    enabled: activeProjects.length > 0,
    staleTime: 30_000,
  })

  const allTasks: Task[] = allTaskQueries.data ?? []

  const byStatus: { status: TaskStatus; count: number; label: string }[] = [
    { status: 'TODO',        count: allTasks.filter((t) => t.status === 'TODO').length,        label: 'TODO' },
    { status: 'IN_PROGRESS', count: allTasks.filter((t) => t.status === 'IN_PROGRESS').length, label: 'IN PROG' },
    { status: 'IN_REVIEW',   count: allTasks.filter((t) => t.status === 'IN_REVIEW').length,   label: 'REVIEW' },
    { status: 'DONE',        count: allTasks.filter((t) => t.status === 'DONE').length,        label: 'DONE' },
  ]

  const openTasks    = allTasks.filter((t) => t.status !== 'DONE').length
  const doneTasks    = allTasks.filter((t) => t.status === 'DONE').length

  const stats = [
    { label: 'Open tasks',       value: openTasks,             delta: `${allTasks.length} total`,   trend: 'flat' as const },
    { label: 'Active projects',  value: activeProjects.length, delta: `${projects.length} total`,   trend: 'flat' as const },
    { label: 'Completed',        value: doneTasks,             delta: allTasks.length > 0 ? `${Math.round(doneTasks / allTasks.length * 100)}% of total` : '0% of total', trend: 'flat' as const, highlight: true },
    { label: 'Projects',         value: projects.length,       delta: `${projects.filter(p=>p.status==='ARCHIVED').length} archived`, trend: 'flat' as const },
  ]

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const isLoading = loadingProjects || allTaskQueries.isLoading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar
        crumbs={[{ label: 'Nexus', icon: Building2 }, { label: 'Inbox' }]}
        rightSlot={
          <button
            onClick={() => navigate('/projects')}
            style={btnPrimary}
          >
            <Plus size={12} strokeWidth={2.2} /> New task
          </button>
        }
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6B6B73', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 style={{ font: '600 26px/1.15 inherit', letterSpacing: '-0.02em', margin: 0 }}>
              {greeting}, {user?.email?.split('@')[0] ?? 'there'}
            </h1>
            <p style={{ color: '#9C9CA4', fontSize: 13.5, margin: '6px 0 0 0' }}>
              Here's what's happening across your projects.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnGhost}><Calendar size={12} /> Last 30 days</button>
            <button style={btnGhost}><Filter size={12} /> Filter</button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spinner size={22} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 22 }}>
              {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Chart + activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, alignItems: 'stretch', marginBottom: 14 }}>
              {/* Bar chart */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Tasks by status</div>
                    <div style={{ fontSize: 11.5, color: '#6B6B73', marginTop: 2 }}>All projects · current</div>
                  </div>
                  <TrendingUp size={14} color="#3B82F6" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byStatus} barCategoryGap="30%">
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#6B6B73', fontSize: 10.5, fontFamily: 'Geist, sans-serif' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6B6B73', fontSize: 10.5, fontFamily: 'Geist Mono, monospace' }}
                      axisLine={false} tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 5 }}
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div style={{
                            background: '#1C1C21', border: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: 7, padding: '6px 10px', fontSize: 12,
                          }}>
                            <span style={{ color: '#D4D4D8', fontWeight: 600 }}>{payload[0].value}</span>
                            <span style={{ color: '#6B6B73', marginLeft: 4 }}>{payload[0].payload.label}</span>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={56}>
                      {byStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Activity */}
              <div style={{ ...card, gap: 10, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Recent projects</div>
                {projects.filter((p) => p.status === 'ACTIVE').slice(0, 5).map((p) => (
                  <DashboardProjectRow key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
                ))}
                {projects.length === 0 && (
                  <div style={{ color: '#6B6B73', fontSize: 12.5, textAlign: 'center', padding: '24px 0' }}>
                    No projects yet.{' '}
                    <span
                      style={{ color: '#3B82F6', cursor: 'pointer' }}
                      onClick={() => navigate('/projects')}
                    >
                      Create one →
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <SectionHeader title="All tasks" subtitle={`${allTasks.length} tasks across projects`} />
                {allTasks.slice(0, 6).map((t) => (
                  <DashboardTaskRow key={t.id} task={t} />
                ))}
                {allTasks.length === 0 && (
                  <div style={{ color: '#6B6B73', fontSize: 12.5, padding: '24px 16px' }}>
                    No tasks yet. Open a project to start adding tasks.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, delta, trend, highlight }: {
  label: string; value: number | string; delta: string; trend: 'up' | 'down' | 'flat'; highlight?: boolean
}) {
  return (
    <div
      style={{
        ...card,
        ...(highlight ? {
          background: 'linear-gradient(140deg, rgba(59,130,246,0.14), transparent 60%), #0F0F11',
          borderColor: 'rgba(59,130,246,0.32)',
        } : {}),
      }}
    >
      <div style={{ fontSize: 11.5, color: '#9C9CA4', marginBottom: 6, whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ font: '600 28px/1 inherit', letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
      <div style={{
        fontSize: 11.5, marginTop: 2,
        color: trend === 'up' ? '#10B981' : trend === 'down' ? '#3B82F6' : '#6B6B73',
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}>
        {delta}
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: '#6B6B73', marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

function DashboardTaskRow({ task }: { task: Task }) {
  const s = STATUS_MAP[task.status]
  return (
    <div
      className="nx-hover"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer', transition: 'background .12s',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: s.color, flexShrink: 0 }} />
      <span style={{ fontSize: 10.5, color: '#6B6B73', minWidth: 54, fontFamily: 'Geist Mono, monospace', whiteSpace: 'nowrap' }}>
        {task.key ?? task.id.slice(0, 6)}
      </span>
      <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.title}
      </span>
      <PriorityBadge priority={task.priority} />
      {task.dueDate && (
        <span style={{ fontSize: 11, color: '#6B6B73', minWidth: 50, textAlign: 'right', whiteSpace: 'nowrap' }}>
          {formatDue(task.dueDate)}
        </span>
      )}
      {task.assignee && <Avatar name={task.assignee.name ?? task.assignee.email} size={20} />}
    </div>
  )
}

function DashboardProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div
      className="nx-hover"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 4px', borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: 'rgba(59,130,246,0.18)',
          border: '1px solid rgba(59,130,246,0.40)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Geist Mono, monospace', fontSize: 10.5, fontWeight: 600,
          color: '#F4F4F5',
        }}
      >
        {(project.key ?? project.name)[0]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.name}
        </div>
        <div style={{ fontSize: 11.5, color: '#6B6B73', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatDate(project.createdAt, { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: '#0F0F11',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: 16,
}

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 10px',
  background: 'transparent', color: '#D4D4D8',
  border: 'none', borderRadius: 6,
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background .12s',
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 10px',
  background: '#3B82F6', color: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 5, fontSize: 12, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}
