import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Check } from 'lucide-react'
import { NexusLogo } from '@/components/shared/NexusLogo'
import { Spinner } from '@/components/shared/Spinner'
import { register } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

function pwScore(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[0-9]/.test(p) && /[a-z]/i.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const slug = (orgName || 'your-org')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const score = pwScore(password)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => register({ organizationName: orgName, email, password }),
    onSuccess: (data) => {
      setStep(2)
      setTimeout(() => {
        setAuth(data.token, { id: data.id, email: data.email, role: data.role, organizationName: data.organizationName })
        navigate('/dashboard')
      }, 1400)
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate()
  }

  return (
    <div
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'auto', padding: '32px 16px',
        background: 'radial-gradient(900px 500px at 80% -10%, rgba(59,130,246,0.10), transparent 60%), #0A0A0B',
      }}
    >
      <div style={{ width: 440, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }}>
          <NexusLogo size={26} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: '#F4F4F5' }}>Nexus</span>
        </div>

        {step === 1 && (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h2 style={{ font: '600 24px/1.2 inherit', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
                Create your workspace
              </h2>
              <p style={{ color: '#9C9CA4', fontSize: 13, margin: 0 }}>
                One workspace per organization. Invite teammates after signing up.
              </p>
            </div>

            <FormField
              label="Organization name"
              hint={orgName ? (
                <>Will be available at <span style={{ fontFamily: 'Geist Mono, monospace', color: '#D4D4D8' }}>{slug}.nexus.app</span></>
              ) : undefined}
            >
              <input
                style={inputStyle}
                placeholder="Acme Inc"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Work email">
              <input
                type="email"
                style={inputStyle}
                placeholder="you@acme.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormField>

            <FormField label="Password" hint="At least 10 characters with a number and a symbol.">
              <input
                type="password"
                style={inputStyle}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                    {[0, 1, 2, 3].map((i) => {
                      const filled = i < score
                      const barColor = score <= 1 ? '#EF4444' : score === 2 ? '#F59E0B' : score === 3 ? '#3B82F6' : '#10B981'
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1, height: 3, borderRadius: 99,
                            background: filled ? barColor : '#1C1C21',
                            transition: 'background .2s',
                          }}
                        />
                      )
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: '#6B6B73', minWidth: 50, textAlign: 'right' }}>
                    {['weak', 'fair', 'good', 'strong'][Math.max(0, score - 1)] ?? 'weak'}
                  </span>
                </div>
              )}
            </FormField>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#9C9CA4', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: '#3B82F6' }} />
              <span>
                I agree to the{' '}
                <a style={{ color: '#D4D4D8' }}>Terms of Service</a> and{' '}
                <a style={{ color: '#D4D4D8' }}>Privacy Policy</a>.
              </span>
            </label>

            {error && (
              <div style={{
                padding: '7px 10px', borderRadius: 6, fontSize: 12.5,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.30)',
                color: '#EF4444',
              }}>
                Registration failed. Please check your details and try again.
              </div>
            )}

            <button type="submit" disabled={isPending} style={primaryBtn}>
              {isPending ? <Spinner /> : <><span>Create workspace</span><ArrowRight size={13} /></>}
            </button>

            <div style={{ fontSize: 12.5, color: '#9C9CA4', textAlign: 'center' }}>
              Already have an account?{' '}
              <a
                onClick={() => navigate('/login')}
                style={{ color: '#3B82F6', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
              >
                Sign in
              </a>
            </div>
          </form>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 99,
              background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#3B82F6',
            }}>
              <Check size={28} strokeWidth={2.4} />
            </div>
            <h2 style={{ font: '600 22px/1.2 inherit', margin: 0 }}>
              Provisioning {orgName || 'your workspace'}…
            </h2>
            <p style={{ color: '#9C9CA4', fontSize: 13, margin: 0, maxWidth: 320 }}>
              Setting up your tenant. You'll be redirected in a moment.
            </p>
            <Spinner size={16} />
          </div>
        )}
      </div>
    </div>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, color: '#D4D4D8', fontWeight: 500 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: '#6B6B73' }}>{hint}</div>}
    </label>
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
}
