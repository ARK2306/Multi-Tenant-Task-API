import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import {
  Plus, MoreHorizontal, Filter, Users, Calendar, Tag, ChevronDown, X,
  Building2,
} from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Avatar, AvatarStack } from '@/components/shared/Avatar'
import { PriorityBadge } from '@/components/shared/Badges'
import { Spinner } from '@/components/shared/Spinner'
import { Toast } from '@/components/shared/Toast'
import { TaskDrawer } from './TaskDrawer'
import { getProjects } from '@/api/projects'
import { getTasks, createTask, updateTaskStatus } from '@/api/tasks'
import { getMembers } from '@/api/members'
import { formatDue, dueColor } from '@/lib/utils'
import type { Task, TaskStatus, TaskPriority, User } from '@/types'

const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  TODO:        { label: 'Todo',        color: '#6B6B73' },
  IN_PROGRESS: { label: 'In Progress', color: '#3B82F6' },
  IN_REVIEW:   { label: 'In Review',   color: '#A855F7' },
  DONE:        { label: 'Done',        color: '#10B981' },
}

export function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [newTaskCol, setNewTaskCol] = useState<TaskStatus | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: getProjects, staleTime: 60_000 })
  const project = projects.find((p) => p.id === projectId)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasks(projectId!),
    enabled: !!projectId,
    staleTime: 30_000,
  })

  const { mutate: patchStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData<Task[]>(['tasks', projectId])
      qc.setQueryData<Task[]>(['tasks', projectId], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, status } : t))
      )
      return { prev }
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
      const msg = err?.response?.data?.message ?? 'Invalid status transition'
      setToast(msg)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })

  const { mutate: addTask, isPending: addingTask } = useMutation({
    mutationFn: ({ title, status, assigneeId }: { title: string; status: TaskStatus; assigneeId?: string }) =>
      createTask(projectId!, { title, status, assigneeId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      setNewTaskCol(null)
    },
  })

  const columns = useMemo(() => {
    const m: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [] }
    tasks.forEach((t) => m[t.status]?.push(t))
    return m
  }, [tasks])

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null

  const onDragEnd = (result: DropResult) => {
    const { draggableId, source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return
    patchStatus({ id: draggableId, status: destination.droppableId as TaskStatus })
  }

  const handleUpdateTask = (patch: Partial<Task>) => {
    qc.setQueryData<Task[]>(['tasks', projectId], (old = []) =>
      old.map((t) => (t.id === openTaskId ? { ...t, ...patch } : t))
    )
  }

  const memberNames = (project?.members ?? []).map((m) => m.name ?? m.email)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Topbar
        crumbs={[
          { label: 'Nexus', icon: Building2 },
          { label: 'Projects', onClick: () => navigate('/projects') },
          { label: project?.name ?? '…' },
        ]}
        rightSlot={
          <>
            <button style={btnGhost}><Filter size={12} /> Filter</button>
            {memberNames.length > 0 && <AvatarStack names={memberNames} max={4} size={22} />}
            <button style={btnPrimary}>
              <Plus size={11} strokeWidth={2.4} /> New task
            </button>
          </>
        }
      >
        <span style={{ fontSize: 11, color: '#6B6B73', marginLeft: 4 }}>·</span>
        <span style={{ fontSize: 12.5, color: '#9C9CA4', marginLeft: 4 }}>Board</span>
      </Topbar>

      {/* Sub-toolbar */}
      <div style={{
        height: 38, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0A0A0B', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Board', 'List', 'Timeline', 'Calendar'].map((v, i) => (
            <button
              key={v}
              style={{
                ...btnGhost,
                height: 26,
                background: i === 0 ? '#16161A' : 'transparent',
                color: i === 0 ? '#F4F4F5' : '#9C9CA4',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)', margin: '0 4px' }} />
        <button style={btnGhost}><Tag size={12} /> Priority</button>
        <button style={btnGhost}><Users size={12} /> Assignee</button>
        <button style={btnGhost}><Calendar size={12} /> Due</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: '#6B6B73', whiteSpace: 'nowrap' }}>
          Group by: <span style={{ color: '#D4D4D8' }}>Status</span>
        </span>
      </div>

      {/* Board */}
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={22} />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', background: '#0A0A0B' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))', gap: 14, minHeight: '100%' }}>
              {STATUS_ORDER.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={columns[status]}
                  onOpenTask={setOpenTaskId}
                  onNewTask={() => setNewTaskCol(status)}
                />
              ))}
            </div>
          </div>
        </DragDropContext>
      )}

      {/* Task drawer */}
      {openTaskId && openTask && (
        <TaskDrawer
          task={openTask}
          projectId={projectId!}
          onClose={() => setOpenTaskId(null)}
          onUpdate={handleUpdateTask}
          onDelete={() => setOpenTaskId(null)}
        />
      )}

      {/* New task inline form */}
      {newTaskCol && (
        <NewTaskModal
          status={newTaskCol}
          adding={addingTask}
          onClose={() => setNewTaskCol(null)}
          onSubmit={(title, assigneeId) => addTask({ title, status: newTaskCol, assigneeId })}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

function KanbanColumn({
  status, tasks, onOpenTask, onNewTask,
}: {
  status: TaskStatus
  tasks: Task[]
  onOpenTask: (id: string) => void
  onNewTask: () => void
}) {
  const meta = STATUS_META[status]

  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            display: 'flex', flexDirection: 'column',
            background: snapshot.isDraggingOver ? '#16161A' : 'transparent',
            border: snapshot.isDraggingOver
              ? '1px dashed rgba(59,130,246,0.32)'
              : '1px solid transparent',
            borderRadius: 10,
            transition: 'background .12s, border-color .12s',
            minHeight: 200,
          }}
        >
          {/* Column header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            position: 'sticky', top: 0, zIndex: 1,
            background: snapshot.isDraggingOver ? '#16161A' : '#0A0A0B',
            borderRadius: '10px 10px 0 0',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: meta.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
              {meta.label}
            </span>
            <span style={{
              fontSize: 11, color: '#9C9CA4',
              padding: '1px 6px', background: '#16161A', borderRadius: 99,
              fontVariantNumeric: 'tabular-nums', fontWeight: 500, flexShrink: 0,
            }}>
              {tasks.length}
            </span>
            <div style={{ flex: 1 }} />
            <button style={colBtn} onClick={onNewTask} title="New task">
              <Plus size={12} strokeWidth={2.2} />
            </button>
            <button style={colBtn}><MoreHorizontal size={12} /></button>
          </div>

          {/* Task list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '2px 8px 8px', flex: 1 }}>
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                    onClick={() => onOpenTask(task.id)}
                  >
                    <TaskCard task={task} isDragging={snapshot.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Add task ghost */}
            <button
              onClick={onNewTask}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px', borderRadius: 6,
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.06)',
                color: '#6B6B73', fontSize: 12, fontFamily: 'inherit',
                cursor: 'pointer', justifyContent: 'flex-start',
                transition: 'border-color .12s, color .12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.color = '#D4D4D8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = '#6B6B73'
              }}
            >
              <Plus size={11} strokeWidth={2.2} /> Add task
            </button>
          </div>
        </div>
      )}
    </Droppable>
  )
}

function TaskCard({ task, isDragging }: { task: Task; isDragging: boolean }) {
  return (
    <div
      style={{
        padding: 12,
        background: isDragging ? '#16161A' : '#0F0F11',
        border: `1px solid ${isDragging ? 'rgba(59,130,246,0.40)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        opacity: isDragging ? 0.85 : 1,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.40)' : 'none',
        transform: isDragging ? 'rotate(1deg)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'border-color .12s, background .12s',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
          e.currentTarget.style.background = '#16161A'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.background = '#0F0F11'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10.5, color: '#6B6B73', fontFamily: 'Geist Mono, monospace', flex: 1 }}>
          {task.key ?? task.id.slice(0, 6).toUpperCase()}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 450, lineHeight: 1.4, color: '#F4F4F5' }}>
        {task.title}
      </div>
      {task.lastComment && (
        <div style={{
          fontSize: 11.5, color: '#6B6B73', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          padding: '5px 8px',
          background: '#16161A', borderRadius: 5,
          borderLeft: '2px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{ color: '#9C9CA4', marginRight: 4, fontWeight: 500 }}>
            {task.lastComment.authorEmail.split('@')[0]}:
          </span>
          {task.lastComment.content}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        {task.dueDate && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: dueColor(task.dueDate),
            padding: '1px 6px 1px 5px', borderRadius: 4,
            background: '#16161A', border: '1px solid rgba(255,255,255,0.06)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <Calendar size={10} strokeWidth={1.8} /> {formatDue(task.dueDate)}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {task.assigneeEmail && <Avatar name={task.assigneeEmail.split('@')[0]} size={20} />}
      </div>
    </div>
  )
}

function NewTaskModal({
  status, adding, onClose, onSubmit,
}: {
  status: TaskStatus
  adding: boolean
  onClose: () => void
  onSubmit: (title: string, assigneeId?: string) => void
}) {
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')

  const { data: members = [] } = useQuery({ queryKey: ['members'], queryFn: getMembers, staleTime: 60_000 })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title.trim(), assigneeId || undefined)
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
          width: 400, background: '#0F0F11',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 12, padding: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ font: '600 15px/1.2 inherit', margin: 0 }}>
            New task · <span style={{ color: STATUS_META[status].color }}>{STATUS_META[status].label}</span>
          </h3>
          <button type="button" onClick={onClose} style={{ ...colBtn, color: '#9C9CA4' }}><X size={13} /></button>
        </div>

        <input
          autoFocus
          style={{
            width: '100%', height: 34, padding: '0 11px',
            background: '#16161A', color: '#F4F4F5',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 7, fontSize: 13.5,
            fontFamily: 'inherit', outline: 'none',
          }}
          placeholder="Task title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          style={{
            width: '100%', height: 34, padding: '0 11px',
            background: '#16161A', color: assigneeId ? '#F4F4F5' : '#6B6B73',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 7, fontSize: 13,
            fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">No assignee</option>
          {members.map((m: User) => (
            <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          <button type="submit" disabled={adding || !title.trim()} style={btnPrimary}>
            {adding ? <Spinner size={12} /> : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 10px',
  background: '#3B82F6', color: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 5, fontSize: 12, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 10px',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 5, fontSize: 12, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 26, padding: '0 9px',
  background: 'transparent', color: '#9C9CA4',
  border: 'none', borderRadius: 5,
  fontSize: 12, fontWeight: 450, cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background .12s, color .12s',
}

const colBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 24, height: 24,
  background: 'transparent', color: '#9C9CA4',
  border: 'none', borderRadius: 5,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background .12s, color .12s',
}
