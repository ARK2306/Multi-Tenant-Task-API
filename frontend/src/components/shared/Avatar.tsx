import { avatarGradient, initials } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

export function Avatar({ name, size = 22, className }: AvatarProps) {
  const fs = Math.max(9, Math.round(size * 0.42))
  return (
    <span
      title={name}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: fs,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: 'white',
        flexShrink: 0,
        border: '1.5px solid #0F0F11',
        background: avatarGradient(name),
        userSelect: 'none',
      }}
    >
      {initials(name)}
    </span>
  )
}

interface AvatarStackProps {
  names: string[]
  max?: number
  size?: number
}

export function AvatarStack({ names, max = 3, size = 22 }: AvatarStackProps) {
  const visible = names.slice(0, max)
  const overflow = names.length - visible.length
  return (
    <div style={{ display: 'flex' }}>
      {visible.map((n, i) => (
        <span key={n} style={{ marginLeft: i === 0 ? 0 : -7, zIndex: visible.length - i }}>
          <Avatar name={n} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            borderRadius: '50%',
            marginLeft: -7,
            background: '#1C1C21',
            color: '#D4D4D8',
            fontSize: 10,
            fontWeight: 600,
            border: '1.5px solid #0F0F11',
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
