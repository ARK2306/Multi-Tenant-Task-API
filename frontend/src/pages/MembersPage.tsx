import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Send, Filter, Search, X, MoreHorizontal, Building2 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Avatar } from '@/components/shared/Avatar'
import { RoleBadge } from '@/components/shared/Badges'
import { Spinner } from '@/components/shared/Spinner'
import { getMembers } from '@/api/members'
import { inviteMember } from '@/api/auth'
import { formatDate } from '@/lib/utils'
import type { User, UserRole } from '@/types'

export function MembersPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    staleTime: 60_000,
  })

  const { mutate: sendInvite, isPending: inviting } = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => inviteMember(email, role),
    onSuccess: (_d, vars) => {
      setShowInvite(false)
      setToast(`Invite sent to ${vars.email}`)
      setTimeout(() => setToast(null), 3000)
    },
  })

  const filtered = members.filter(
    (m) =>
      (m.name ?? m.email).toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Topbar crumbs={[{ label: 'Nexus', icon: Building2 }, { label: 'Members' }]} />

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ font: '600 22px/1.15 inherit', letterSpacing: '-0.018em', margin: 0 }}>Members</h1>
            <p style={{ color: '#9C9CA4', fontSize: 13, margin: '4px 0 0 0' }}>
              {members.length} people in your organization
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnSecondary}>
              <Send size={12} /> Pending invites
            </button>
            <button onClick={() => setShowInvite(true)} style={btnPrimary}>
              <Plus size={13} strokeWidth={2.2} /> Invite member
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
          {['Members', 'Invitations', 'Roles & permissions'].map((t, i) => (
            <button
              key={t}
              style={{
                height: 32, borderRadius: 0, padding: '0 11px',
                border: 'none', borderBottom: `2px solid ${i === 0 ? '#F4F4F5' : 'transparent'}`,
                marginBottom: -1,
                background: 'transparent',
                color: i === 0 ? '#F4F4F5' : '#9C9CA4',
                fontWeight: i === 0 ? 600 : 500,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B6B73' }} />
            <input
              style={{ ...inputStyle, paddingLeft: 30, height: 30, fontSize: 12.5 }}
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }} />
          <button style={btnGhost}><Filter size={12} /> Filter by role</button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <Spinner size={22} />
          </div>
        ) : (
          <div style={{
            background: '#0F0F11',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '24px 1.7fr 110px 120px 90px 32px',
              gap: 12, padding: '9px 16px',
              background: '#16161A',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11, color: '#9C9CA4', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span />
              <span>Member</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Status</span>
              <span />
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '32px 16px', color: '#6B6B73', fontSize: 13, textAlign: 'center' }}>
                {search ? 'No members match your search.' : 'No members yet.'}
              </div>
            ) : (
              filtered.map((m) => <MemberRow key={m.id} member={m} />)
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: '#0F0F11', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 8, padding: '9px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12.5,
            boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 99,
              background: '#3B82F6', color: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>✓</span>
            {toast}
            <button onClick={() => setToast(null)} style={{ ...colIconBtn, marginLeft: 4 }}>
              <X size={11} />
            </button>
          </div>
        )}
      </div>

      {showInvite && (
        <InviteModal
          inviting={inviting}
          onClose={() => setShowInvite(false)}
          onSubmit={(email, role) => sendInvite({ email, role })}
        />
      )}
    </div>
  )
}

function MemberRow({ member }: { member: User }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="nx-hover"
      style={{
        display: 'grid', gridTemplateColumns: '24px 1.7fr 110px 120px 90px 32px',
        gap: 12, padding: '11px 16px', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background .12s',
      }}
    >
      <input type="checkbox" style={{ accentColor: '#3B82F6', cursor: 'pointer' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Avatar name={member.name ?? member.email} size={28} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {member.name ?? member.email.split('@')[0]}
          </div>
          <div style={{ fontSize: 11.5, color: '#6B6B73', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {member.email}
          </div>
        </div>
      </div>

      <RoleBadge role={member.role} />

      <span style={{ fontSize: 12, color: '#9C9CA4' }}>
        {(member.joinedAt ?? member.createdAt) ? formatDate((member.joinedAt ?? member.createdAt)!, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
      </span>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#D4D4D8' }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: '#10B981' }} />
        Active
      </span>

      <div style={{ position: 'relative' }}>
        <button style={colIconBtn} onClick={() => setOpen((o) => !o)}>
          <MoreHorizontal size={13} />
        </button>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
            <div style={{
              position: 'absolute', right: 0, top: 26, zIndex: 11,
              background: '#1C1C21', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 7, padding: 4, minWidth: 160,
              boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            }}>
              {['View profile', 'Change role', 'Resend invite'].map((t) => (
                <div
                  key={t}
                  className="nx-hover"
                  style={{ fontSize: 12.5, padding: '6px 10px', borderRadius: 5, cursor: 'pointer', color: '#D4D4D8' }}
                  onClick={() => setOpen(false)}
                >
                  {t}
                </div>
              ))}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 2px' }} />
              <div
                className="nx-hover"
                style={{ fontSize: 12.5, padding: '6px 10px', borderRadius: 5, cursor: 'pointer', color: '#EF4444' }}
                onClick={() => setOpen(false)}
              >
                Remove from org
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InviteModal({
  inviting, onClose, onSubmit,
}: {
  inviting: boolean
  onClose: () => void
  onSubmit: (email: string, role: string) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('MEMBER')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    onSubmit(email.trim(), role)
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
          borderRadius: 12, padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ font: '600 16px/1.2 inherit', margin: 0 }}>Invite member</h3>
          <button type="button" onClick={onClose} style={{ ...colIconBtn, color: '#9C9CA4' }}><X size={14} /></button>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#D4D4D8' }}>Email address</span>
          <input
            autoFocus
            type="email"
            style={inputStyle}
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#D4D4D8' }}>Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
          <button type="submit" disabled={inviting || !email.trim()} style={btnPrimary}>
            {inviting ? <Spinner size={12} /> : <><Send size={12} /> Send invite</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────

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

const colIconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 24, height: 24,
  background: 'transparent', color: '#9C9CA4',
  border: 'none', borderRadius: 5,
  cursor: 'pointer', fontFamily: 'inherit',
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 34, padding: '0 11px',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 7, fontSize: 13.5,
  fontFamily: 'inherit', outline: 'none',
}
