import { Bell } from 'lucide-react'

interface Crumb {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ElementType<any>
  onClick?: () => void
}

interface TopbarProps {
  crumbs?: Crumb[]
  rightSlot?: React.ReactNode
  children?: React.ReactNode
}

export function Topbar({ crumbs = [], rightSlot, children }: TopbarProps) {
  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: '#0A0A0B',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {crumbs.map((c, i) => {
          const Icon = c.icon
          return (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && (
                <span style={{ color: '#48484F', fontSize: 11, padding: '0 2px' }}>/</span>
              )}
              <span
                onClick={c.onClick}
                style={{
                  fontSize: 13,
                  fontWeight: i === crumbs.length - 1 ? 500 : 400,
                  color: i === crumbs.length - 1 ? '#F4F4F5' : '#9C9CA4',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  whiteSpace: 'nowrap',
                  cursor: c.onClick ? 'pointer' : 'default',
                }}
              >
                {Icon && <Icon size={13} color="currentColor" />}
                {c.label}
              </span>
            </span>
          )
        })}
        {children}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {rightSlot}
        <button
          style={{
            width: 28, height: 28,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none',
            color: '#9C9CA4', cursor: 'pointer',
            borderRadius: 6,
            transition: 'background .12s, color .12s',
          }}
          className="nx-hover"
        >
          <Bell size={14} />
        </button>
      </div>
    </header>
  )
}
