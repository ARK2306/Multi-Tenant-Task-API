import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Building2 } from 'lucide-react'
import { NexusLogo } from '@/components/shared/NexusLogo'
import { Spinner } from '@/components/shared/Spinner'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, { id: data.id, email: data.email, role: data.role, organizationName: data.organizationName })
      navigate('/dashboard')
    },
    onError: () => setError('Invalid email or password. Please try again.'),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Enter your email and password to continue.'); return }
    mutate()
  }

  return (
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', overflow: 'hidden',
        background: '#0A0A0B',
        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Left: marketing */}
      <div
        style={{
          flex: '1 1 0', minWidth: 0,
          padding: '40px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'radial-gradient(900px 500px at 80% -10%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(700px 400px at 0% 110%, rgba(168,85,247,0.06), transparent 60%), #0F0F11',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <NexusLogo size={26} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: '#F4F4F5' }}>Nexus</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              alignSelf: 'flex-start',
              padding: '4px 9px', borderRadius: 99,
              background: 'rgba(59,130,246,0.14)', color: '#3B82F6',
              border: '1px solid rgba(59,130,246,0.32)',
              fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={11} />
            v2.4 · Multi-tenant workspaces
          </div>

          <h1
            style={{
              font: '600 38px/1.05 Geist, inherit',
              letterSpacing: '-0.025em', color: '#F4F4F5',
              margin: 0, maxWidth: 460,
            }}
          >
            Where your team's work<br />
            <span style={{ color: '#9C9CA4' }}>actually gets done.</span>
          </h1>

          <p style={{ color: '#9C9CA4', maxWidth: 420, fontSize: 14, margin: 0, lineHeight: 1.55 }}>
            Plan sprints, triage in a shared inbox, ship from a kanban that doesn't fight you.
            One workspace per org — quiet, fast, and yours.
          </p>

          {/* Floating preview cards */}
          <div style={{ position: 'relative', marginTop: 18, height: 160, width: 420, maxWidth: '100%' }}>
            {[
              { title: 'Onboarding flow — 3-step wizard', priority: 'HIGH',     due: 'May 28', top: 0,  left: 0,   rotate: -2.4, z: 1 },
              { title: 'Home screen layout: card vs list', priority: 'HIGH',    due: 'May 25', top: 64, left: 80,  rotate: 1.8,  z: 2, highlight: true },
              { title: 'Icon set v2 — outlined variants', priority: 'MEDIUM',   due: 'May 24', top: 10, left: 190, rotate: -1.2, z: 1 },
            ].map((c, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: c.top, left: c.left,
                  width: 200, padding: 10,
                  background: '#0F0F11',
                  border: c.highlight ? '1px solid rgba(59,130,246,0.32)' : '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 10,
                  boxShadow: c.highlight
                    ? '0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,130,246,0.2)'
                    : '0 8px 22px rgba(0,0,0,0.30)',
                  transform: `rotate(${c.rotate}deg)`,
                  zIndex: c.z,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#6B6B73', fontFamily: 'Geist Mono, monospace' }}>MOB-{10 + i}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    height: 18, padding: '0 6px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                    color: c.priority === 'HIGH' ? '#F59E0B' : '#3B82F6',
                    background: c.priority === 'HIGH' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                    border: c.priority === 'HIGH' ? '1px solid rgba(245,158,11,0.28)' : '1px solid rgba(59,130,246,0.28)',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: 'currentColor' }} />
                    {c.priority === 'HIGH' ? 'High' : 'Medium'}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.4, color: '#F4F4F5', marginBottom: 8,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                  {c.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }} />
                  <span style={{ fontSize: 10, color: '#6B6B73' }}>{c.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6B6B73', fontSize: 11.5, flexWrap: 'wrap' }}>
          <span>SOC 2 Type II</span><span>·</span>
          <span>EU data residency</span><span>·</span>
          <span>SSO + SCIM</span>
        </div>
      </div>

      {/* Right: auth form */}
      <div
        style={{
          width: 480, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 32, background: '#0A0A0B',
        }}
      >
        <form
          onSubmit={submit}
          style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          <div>
            <h2 style={{ font: '600 22px/1.2 inherit', letterSpacing: '-0.018em', margin: '0 0 6px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#9C9CA4', fontSize: 13, margin: 0 }}>
              Sign in to your workspace.
            </p>
          </div>

          {/* SSO buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <button type="button" style={ssoBtn}>
              <GoogleMark /> Continue with Google
            </button>
            <button type="button" style={ssoBtn}>
              <Building2 size={14} /> Continue with SSO
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6B6B73', fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <FormField label="Email">
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#6B6B73' }} />
              <input
                type="email"
                placeholder="you@acme.co"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32 }}
              />
            </div>
          </FormField>

          <FormField label="Password" right={<a style={{ color: '#9C9CA4', fontSize: 11.5, cursor: 'pointer' }}>Forgot?</a>}>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#6B6B73' }} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32, paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 0, color: '#6B6B73', cursor: 'pointer', padding: 4,
                }}
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </FormField>

          {error && (
            <div style={{
              padding: '7px 10px', borderRadius: 6, fontSize: 12.5,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.30)',
              color: '#EF4444',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={isPending} style={primaryBtn}>
            {isPending ? <Spinner /> : <><span>Sign in</span><ArrowRight size={13} /></>}
          </button>

          <div style={{ fontSize: 12.5, color: '#9C9CA4', textAlign: 'center' }}>
            New here?{' '}
            <a
              onClick={() => navigate('/register')}
              style={{ color: '#3B82F6', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
            >
              Register your organization
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#D4D4D8', fontWeight: 500 }}>
        {label}
        {right}
      </div>
      {children}
    </label>
  )
}

function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.2v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.2A10 10 0 0 0 2 12c0 1.6.4 3.1 1.2 4.6z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8 2 4.5 4.3 3.2 7.4l3.2 2.6C7.2 7.6 9.4 5.9 12 5.9z" fill="#EA4335" />
    </svg>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, padding: '0 11px',
  background: '#0F0F11', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 7, fontSize: 13.5,
  fontFamily: 'inherit', letterSpacing: '-0.005em',
  outline: 'none', transition: 'border-color .12s, box-shadow .12s',
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  height: 38, padding: '0 16px', width: '100%',
  background: '#3B82F6', color: 'white',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: 7, fontSize: 13.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: '0 1px 0 rgba(255,255,255,0.16) inset, 0 1px 2px rgba(0,0,0,0.25)',
  transition: 'filter .12s',
}

const ssoBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  height: 38, width: '100%',
  background: '#16161A', color: '#F4F4F5',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 7, fontSize: 13.5, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background .12s, border-color .12s',
}
