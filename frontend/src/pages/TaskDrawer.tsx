import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Paperclip, Send, Sparkles, Edit2, ChevronDown, Trash2, UserCircle } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { PriorityBadge, StatusBadge } from '@/components/shared/Badges'
import { Spinner } from '@/components/shared/Spinner'
import { Toast } from '@/components/shared/Toast'
import { updateTask, updateTaskStatus, deleteTask, addComment, getComments } from '@/api/tasks'
import { getMembers } from '@/api/members'
import { formatDate, dueColor } from '@/lib/utils'
import type { Task, Comment, TaskStatus, TaskPriority, User } from '@/types'

const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
const PRIORITY_OPTIONS: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

interface TaskDrawerProps {
  task: Task
  projectId: string
  onClose: () => void
  onUpdate: (patch: Partial<Task>) => void
  onDelete: () => void
}

type Patch = {
  title?: string
  description?: string
  priority?: TaskPriority
  assigneeId?: string | null
}

export function TaskDrawer({ task, projectId, onClose, onUpdate, onDelete }: TaskDrawerProps) {
  const qc = useQueryClient()
  const [title, setTitle] = useState(task.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [description, setDescription] = useState(task.description ?? '')
  const [editingDesc, setEditingDesc] = useState(false)
  const [draft, setDraft] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setEditingTitle(false)
    setEditingDesc(false)
    setShowDeleteModal(false)
  }, [task.id])

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => getComments(task.id),
    staleTime: 0,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    staleTime: 60_000,
  })

  const buildPayload = (patch: Patch) => ({
    title: patch.title ?? task.title,
    description: patch.description !== undefined ? patch.description : task.description,
    priority: patch.priority ?? task.priority,
    assigneeId: 'assigneeId' in patch ? patch.assigneeId ?? undefined : task.assigneeId,
    dueDate: task.dueDate,
  })

  const { mutate: saveTask } = useMutation({
    mutationFn: (patch: Patch) => updateTask(task.id, buildPayload(patch)),
    onSuccess: (updated) => {
      onUpdate(updated)
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const { mutate: patchStatus } = useMutation({
    mutationFn: (status: TaskStatus) => updateTaskStatus(task.id, status),
    onSuccess: (updated) => {
      onUpdate(updated)
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: (err: unknown) => {
      const msg =
        (err as any)?.response?.data?.message ?? 'Invalid status transition'
      setToast(msg)
    },
  })

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      onDelete()
    },
  })

  const { mutate: postComment, isPending: postingComment } = useMutation({
    mutationFn: (content: string) => addComment(task.id, content),
    onSuccess: () => {
      setDraft('')
      qc.invalidateQueries({ queryKey: ['comments', task.id] })
    },
  })

  const commitTitle = () => {
    setEditingTitle(false)
    if (title.trim() !== task.title) saveTask({ title: title.trim() })
  }

  const commitDesc = () => {
    setEditingDesc(false)
    if (description !== (task.description ?? '')) saveTask({ description })
  }

  const submitComment = () => {
    if (!draft.trim()) return
    postComment(draft.trim())
  }

  const currentAssignee = members.find((m) => m.id === task.assigneeId)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '92vw',
          background: '#0F0F11',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.40)',
          display: 'flex', flexDirection: 'column',
          zIndex: 51,
          animation: 'drawer-in 0.22s cubic-bezier(0.2,0.7,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 11, color: '#6B6B73', fontFamily: 'Geist Mono, monospace' }}>
            {task.key ?? task.id.slice(0, 8).toUpperCase()}
          </span>
          <div style={{ flex: 1 }} />
          <button style={iconBtn} title="Copy link"><Paperclip size={13} /></button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.06)' }} />
          <button style={iconBtn} onClick={onClose}><X size={13} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 0' }}>
          {/* Title */}
          {editingTitle ? (
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitTitle() }
                if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false) }
              }}
              rows={2}
              style={{
                width: '100%', resize: 'none', border: 'none', outline: 'none',
                padding: 0, background: 'transparent',
                font: '600 18px/1.3 Geist, inherit', letterSpacing: '-0.015em', color: '#F4F4F5',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              style={{
                font: '600 18px/1.3 inherit', letterSpacing: '-0.015em', color: '#F4F4F5',
                margin: 0, padding: '2px 6px', marginLeft: -6, borderRadius: 5, cursor: 'text',
                transition: 'background .12s',
                display: 'flex', alignItems: 'flex-start', gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              {title}
              <Edit2 size={11} color="#48484F" style={{ marginTop: 4, flexShrink: 0 }} />
            </h2>
          )}

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', columnGap: 12, rowGap: 8, marginTop: 18, fontSize: 12.5 }}>
            <MetaLabel>Status</MetaLabel>
            <MetaSelect
              value={task.status}
              options={STATUS_OPTIONS}
              renderOption={(s) => <StatusBadge status={s as TaskStatus} />}
              onChange={(v) => { onUpdate({ status: v as TaskStatus }); patchStatus(v as TaskStatus) }}
            />

            <MetaLabel>Priority</MetaLabel>
            <MetaSelect
              value={task.priority}
              options={PRIORITY_OPTIONS}
              renderOption={(p) => <PriorityBadge priority={p as TaskPriority} />}
              onChange={(v) => { onUpdate({ priority: v as TaskPriority }); saveTask({ priority: v as TaskPriority }) }}
            />

            <MetaLabel>Assignee</MetaLabel>
            <AssigneeSelect
              members={members}
              value={task.assigneeId ?? null}
              current={currentAssignee}
              onChange={(id) => { onUpdate({ assigneeId: id ?? undefined }); saveTask({ assigneeId: id }) }}
            />

            <MetaLabel>Reporter</MetaLabel>
            <div style={metaPillStyle}>
              {task.reporter
                ? <><Avatar name={task.reporter.name ?? task.reporter.email} size={20} /><span>{task.reporter.name ?? task.reporter.email?.split('@')[0]}</span></>
                : <span style={{ color: '#6B6B73' }}>—</span>
              }
            </div>

            <MetaLabel>Due date</MetaLabel>
            <div style={metaPillStyle}>
              <Calendar size={13} color={dueColor(task.dueDate)} />
              <span style={{ color: dueColor(task.dueDate) }}>
                {task.dueDate ? formatDate(task.dueDate, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 11, color: '#9C9CA4', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              Description
            </div>
            {editingDesc ? (
              <textarea
                autoFocus
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={commitDesc}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingDesc(false) }}
                style={{
                  width: '100%', minHeight: 110, padding: '9px 11px',
                  background: '#16161A', color: '#F4F4F5',
                  border: '1px solid rgba(59,130,246,0.50)',
                  borderRadius: 7, fontSize: 13, lineHeight: 1.55,
                  fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                }}
              />
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                style={{
                  fontSize: 13, color: description ? '#D4D4D8' : '#6B6B73',
                  lineHeight: 1.55, padding: '8px 10px', marginLeft: -10, borderRadius: 6,
                  cursor: 'text', transition: 'background .12s', whiteSpace: 'pre-wrap',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                {description || 'Add a description…'}
              </div>
            )}
          </div>

          {/* Delete task button */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 30, padding: '0 12px',
                background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 6, fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background .12s, border-color .12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.14)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.40)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
              }}
            >
              <Trash2 size={12} />
              Delete Task
            </button>
          </div>

          {/* Comments */}
          <div style={{ marginTop: 22, paddingBottom: 18 }}>
            <div style={{ fontSize: 11, color: '#9C9CA4', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 12 }}>
              Activity
            </div>
            {loadingComments ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <Spinner size={14} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} />
                ))}
                {comments.length === 0 && (
                  <div style={{ fontSize: 12.5, color: '#6B6B73' }}>No comments yet.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0F0F11' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, background: '#16161A', transition: 'border-color .12s' }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && draft.trim()) submitComment()
              }}
              placeholder="Leave a comment…"
              style={{
                width: '100%', resize: 'none', border: 'none', outline: 'none',
                padding: '9px 11px', minHeight: 38, background: 'transparent',
                color: '#F4F4F5', lineHeight: 1.5, fontFamily: 'inherit', fontSize: 13.5,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button style={iconBtn}><Paperclip size={12} /></button>
              <button style={iconBtn}><Sparkles size={12} /></button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 10.5, color: '#6B6B73', display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 4px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, background: '#1C1C21', fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#9C9CA4' }}>⌘</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 4px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, background: '#1C1C21', fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#9C9CA4' }}>↵</span>
              </span>
              <button
                onClick={submitComment}
                disabled={!draft.trim() || postingComment}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  height: 24, padding: '0 9px',
                  background: draft.trim() ? '#3B82F6' : '#16161A',
                  color: draft.trim() ? 'white' : '#6B6B73',
                  border: draft.trim() ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 5, fontSize: 11.5, fontWeight: 500,
                  cursor: draft.trim() ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                }}
              >
                {postingComment ? <Spinner size={10} /> : <Send size={11} />}
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false) }}
        >
          <div
            style={{
              width: 380, background: '#0F0F11',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12, padding: 24,
              boxShadow: '0 24px 60px rgba(0,0,0,0.60)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trash2 size={15} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Delete task?</div>
                <div style={{ fontSize: 13, color: '#9C9CA4', lineHeight: 1.5 }}>
                  Are you sure you want to delete this task? This cannot be undone.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => doDelete()}
                disabled={deleting}
                style={deleteBtn}
              >
                {deleting ? <Spinner size={12} /> : <><Trash2 size={12} /> Delete task</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 422 toast */}
      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </>
  )
}

function AssigneeSelect({ members, value, current, onChange }: {
  members: User[]
  value: string | null
  current?: User
  onChange: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  const label = current
    ? (current.name ?? current.email.split('@')[0])
    : 'Unassigned'

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{ ...metaPillStyle, cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
      >
        {current
          ? <><Avatar name={current.name ?? current.email} size={18} /><span style={{ fontSize: 12.5 }}>{label}</span></>
          : <><UserCircle size={16} color="#6B6B73" /><span style={{ fontSize: 12.5, color: '#6B6B73' }}>Unassigned</span></>
        }
        <ChevronDown size={10} color="#6B6B73" />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 61, marginTop: 4,
            background: '#1C1C21', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 7, padding: 4,
            boxShadow: '0 6px 16px rgba(0,0,0,0.40)',
            minWidth: 200, maxHeight: 220, overflowY: 'auto',
          }}>
            <div
              onClick={() => { onChange(null); setOpen(false) }}
              style={dropdownRow}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              <UserCircle size={16} color="#6B6B73" />
              <span style={{ fontSize: 12.5, color: '#9C9CA4' }}>None</span>
            </div>
            {members.map((m) => (
              <div
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false) }}
                style={{
                  ...dropdownRow,
                  background: m.id === value ? 'rgba(59,130,246,0.10)' : '',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = m.id === value ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = m.id === value ? 'rgba(59,130,246,0.10)' : ''}
              >
                <Avatar name={m.name ?? m.email} size={18} />
                <span style={{ fontSize: 12.5 }}>{m.email}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#6B6B73', fontSize: 12, lineHeight: '26px' }}>{children}</div>
}

function MetaSelect({ value, options, renderOption, onChange }: {
  value: string
  options: string[]
  renderOption: (v: string) => React.ReactNode
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        style={{ ...metaPillStyle, cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
      >
        {renderOption(value)}
        <ChevronDown size={10} color="#6B6B73" />
      </div>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 61, marginTop: 4,
            background: '#1C1C21', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 7, padding: 4,
            boxShadow: '0 6px 16px rgba(0,0,0,0.40)',
            minWidth: 140,
          }}>
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                style={{
                  padding: '6px 8px', borderRadius: 5,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'background .1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = ''}
              >
                {renderOption(opt)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const authorName = comment.author?.name ?? comment.author?.email?.split('@')[0] ?? 'Unknown'
  const timeLabel = comment.createdAt
    ? new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'just now'

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Avatar name={authorName} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{authorName}</span>
          <span style={{ fontSize: 11, color: '#6B6B73' }}>{timeLabel}</span>
        </div>
        <div style={{ fontSize: 13, color: '#D4D4D8', lineHeight: 1.5 }}>{comment.content}</div>
      </div>
    </div>
  )
}

const metaPillStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '2px 8px 2px 6px', borderRadius: 6,
  cursor: 'default', transition: 'background .12s',
  height: 26, whiteSpace: 'nowrap',
}

const dropdownRow: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 5,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
  transition: 'background .1s',
}

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 26, height: 26,
  background: 'transparent', color: '#9C9CA4',
  border: 'none', borderRadius: 5,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background .12s, color .12s',
}

const cancelBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 30, padding: '0 12px',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}

const deleteBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 30, padding: '0 12px',
  background: '#EF4444', color: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 6, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
}
