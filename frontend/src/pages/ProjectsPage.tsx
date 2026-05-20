import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Filter, Grid3x3, List, Calendar, X, Sparkles, Trash2 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { AvatarStack } from '@/components/shared/Avatar'
import { ProjectStatusBadge } from '@/components/shared/Badges'
import { Spinner } from '@/components/shared/Spinner'
import { getProjects, createProject, deleteProject } from '@/api/projects'
import { formatDate, projectColor } from '@/lib/utils'
import type { Project } from '@/types'

type Filter = 'all' | 'active' | 'archived'
type View = 'grid' | 'list'

export function ProjectsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<View>('grid')
  const [showNew, setShowNew] = useState(false)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 30_000,
  })

  const filtered = projects.filter((p) =>
    filter === 'all' ? true : filter === 'active' ? p.status === 'ACTIVE' : p.status === 'ARCHIVED'
  )

  const { mutate: createProj, isPending: creating } = useMutation({
    mutationFn: (data: { name: string; description: string }) => createProject(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setShowNew(false) },
  })

  const { mutate: deleteProj } = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar crumbs={[{ label: 'Nexus' }, { label: 'Projects' }]} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ font: '600 22px/1.15 inherit', letterSpacing: '-0.018em', margin: 0 }}>Projects</h1>
            <p style={{ color: '#9C9CA4', fontSize: 13, margin: '4px 0 0 0' }}>
              {filtered.length} of {projects.length} projects
            </p>
          </div>
          <button onClick={() => setShowNew(true)} style={btnPrimary}>
            <Plus size={13} strokeWidth={2.2} /> New project
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {/* Filter tabs */}
          <div style={{ display: 'inline-flex', padding: 2, background: '#16161A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
            {(['all', 'active', 'archived'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  height: 24, padding: '0 10px',
                  background: filter === f ? '#0F0F11' : 'transparent',
                  color: filter === f ? '#F4F4F5' : '#9C9CA4',
                  border: 'none', borderRadius: 4,
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: filter === f ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                  transition: 'background .12s, color .12s',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <button style={btnGhost}><Filter size={12} /> Filter</button>
          {/* View toggle */}
          <div style={{ display: 'inline-flex', padding: 2, background: '#16161A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
            <button
              onClick={() => setView('grid')}
              style={{ ...iconBtn, background: view === 'grid' ? '#0F0F11' : 'transparent', border: 'none' }}
            >
              <Grid3x3 size={13} />
            </button>
            <button
              onClick={() => setView('list')}
              style={{ ...iconBtn, background: view === 'list' ? '#0F0F11' : 'transparent', border: 'none' }}
            >
              <List size={13} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spinner size={22} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyProjects onNew={() => setShowNew(true)} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
            gap: 12,
          }}>
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                view={view}
                onClick={() => navigate(`/projects/${p.id}`)}
                onDelete={() => deleteProj(p.id)}
              />
            ))}
            {view === 'grid' && filter !== 'archived' && (
              <NewProjectPlaceholder onClick={() => setShowNew(true)} />
            )}
          </div>
        )}
      </div>

      {showNew && (
        <NewProjectModal
          creating={creating}
          onClose={() => setShowNew(false)}
          onSubmit={(data) => createProj(data)}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, view, onClick, onDelete }: { project: Project; view: View; onClick: () => void; onDelete: () => void }) {
  const memberNames = (project.members ?? []).map((m) => m.name ?? m.email)
  const [c1, c2] = projectColor(project.key ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
    }
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmDelete(false)
  }

  if (view === 'list') {
    return (
      <div
        className="nx-hover"
        onClick={onClick}
        style={{ ...cardStyle, padding: 14, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
      >
        <ProjectGlyph keyText={project.key ?? project.name[0]} c1={c1} c2={c2} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{project.name}</span>
            <ProjectStatusBadge status={project.status} />
          </div>
          <div style={{ fontSize: 12, color: '#9C9CA4' }}>{project.description}</div>
        </div>
        <span style={{ fontSize: 12, color: '#9C9CA4', whiteSpace: 'nowrap' }}>
          {formatDate(project.createdAt, { month: 'short', day: 'numeric' })}
        </span>
        {memberNames.length > 0 && <AvatarStack names={memberNames} max={3} size={22} />}
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: 11.5, color: '#EF4444', whiteSpace: 'nowrap' }}>Delete?</span>
            <button style={{ ...deleteConfirmBtn }} onClick={handleDelete}>Yes</button>
            <button style={{ ...iconBtn }} onClick={cancelDelete}><X size={11} /></button>
          </div>
        ) : (
          <button
            style={{ ...iconBtn, flexShrink: 0 }}
            onClick={handleDelete}
            title="Delete project"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="nx-hover"
      onClick={onClick}
      style={{ ...cardStyle, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 196 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ProjectGlyph keyText={project.key ?? project.name[0]} c1={c1} c2={c2} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ProjectStatusBadge status={project.status} />
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: 11, color: '#EF4444' }}>Delete?</span>
              <button style={deleteConfirmBtn} onClick={handleDelete}>Yes</button>
              <button style={iconBtn} onClick={cancelDelete}><X size={11} /></button>
            </div>
          ) : (
            <button
              style={{ ...iconBtn, opacity: 0.6 }}
              onClick={handleDelete}
              title="Delete project"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 4 }}>{project.name}</div>
        <p style={{
          fontSize: 12.5, color: '#9C9CA4', margin: 0, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
        }}>
          {project.description}
        </p>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#6B6B73', whiteSpace: 'nowrap' }}>
            {project.taskCount ?? 0} tasks
          </span>
          <span style={{ fontSize: 11, color: '#6B6B73', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Calendar size={10} />
            {formatDate(project.createdAt, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div style={{ height: 3, background: '#1C1C21', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            width: project.status === 'ARCHIVED' ? '100%' : '45%',
            height: '100%',
            background: project.status === 'ARCHIVED' ? '#6B6B73' : '#3B82F6',
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {memberNames.length > 0
          ? <AvatarStack names={memberNames} max={4} size={22} />
          : <span />
        }
        <span style={{ fontSize: 11, color: '#6B6B73', fontFamily: 'Geist Mono, monospace' }}>
          {project.key}
        </span>
      </div>
    </div>
  )
}

function ProjectGlyph({ keyText, c1, c2 }: { keyText: string; c1: string; c2: string }) {
  return (
    <span
      style={{
        width: 36, height: 36, borderRadius: 8,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Geist Mono, monospace', fontSize: 12, fontWeight: 700,
        color: 'white', letterSpacing: '0.04em',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}
    >
      {keyText.slice(0, 3)}
    </span>
  )
}

function NewProjectPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16, minHeight: 196,
        border: '1px dashed rgba(255,255,255,0.10)', borderRadius: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, color: '#9C9CA4', cursor: 'pointer',
        transition: 'border-color .15s, background .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.32)'
        e.currentTarget.style.background = 'rgba(59,130,246,0.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <Plus size={18} strokeWidth={1.8} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>New project</span>
      <span style={{ fontSize: 11.5, color: '#6B6B73' }}>or import from Linear, Jira</span>
    </div>
  )
}

function EmptyProjects({ onNew }: { onNew: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 16, textAlign: 'center' }}>
      {/* Illustration */}
      <div style={{ position: 'relative', width: 140, height: 100 }}>
        {[{ rot: -8, left: 0, top: 10 }, { rot: 4, left: 40, top: 4 }, { rot: -1, left: 80, top: 16 }].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: c.left, top: c.top,
            width: 60, height: 72, borderRadius: 8,
            background: '#16161A', border: '1px solid rgba(255,255,255,0.10)',
            transform: `rotate(${c.rot}deg)`,
            opacity: 0.4 + i * 0.3,
          }} />
        ))}
        <Sparkles size={22} color="#3B82F6" style={{ position: 'absolute', right: 2, top: -4 }} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No projects yet</div>
        <div style={{ fontSize: 13, color: '#9C9CA4', maxWidth: 320 }}>
          Create your first project to start managing tasks with your team.
        </div>
      </div>
      <button onClick={onNew} style={btnSecondary}>
        <Plus size={13} /> Start a project
      </button>
    </div>
  )
}

function NewProjectModal({
  creating, onClose, onSubmit,
}: {
  creating: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string }) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 420, background: '#0F0F11',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 12, padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ font: '600 16px/1.2 inherit', margin: 0 }}>New project</h3>
          <button type="button" onClick={onClose} style={{ ...iconBtn, background: 'transparent', border: 'none', color: '#9C9CA4' }}>
            <X size={14} />
          </button>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#D4D4D8' }}>Project name</span>
          <input
            autoFocus
            style={inputStyle}
            placeholder="e.g. Mobile Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#D4D4D8' }}>Description</span>
          <textarea
            style={{ ...inputStyle, height: 'auto', padding: '9px 11px', minHeight: 72, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          <button type="submit" disabled={creating || !name.trim()} style={btnPrimary}>
            {creating ? <Spinner size={12} /> : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#0F0F11',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  transition: 'border-color .14s, background .14s',
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 28, padding: '0 11px',
  background: '#3B82F6', color: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 6, fontSize: 12.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 28, padding: '0 11px',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6, fontSize: 12.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 10px',
  background: 'transparent', color: '#D4D4D8',
  border: 'none', borderRadius: 6,
  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 26, height: 26,
  background: '#16161A', color: '#9C9CA4',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 5, cursor: 'pointer',
  transition: 'background .12s',
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 34, padding: '0 11px',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 7, fontSize: 13.5,
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .12s',
}

const deleteConfirmBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  height: 22, padding: '0 8px',
  background: 'rgba(239,68,68,0.14)', color: '#EF4444',
  border: '1px solid rgba(239,68,68,0.30)',
  borderRadius: 4, fontSize: 11.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}
