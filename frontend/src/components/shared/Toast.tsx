import { useEffect } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [message, onDismiss, duration])

  return (
    <div
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 300,
        background: '#1C1C21',
        border: '1px solid rgba(239,68,68,0.40)',
        borderRadius: 8,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.50)',
        color: '#F4F4F5', fontSize: 13,
        whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 48px)',
        animation: 'fade-in 0.15s ease',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, background: '#EF4444', flexShrink: 0 }} />
      {message}
    </div>
  )
}
