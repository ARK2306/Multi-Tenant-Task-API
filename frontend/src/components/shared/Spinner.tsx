export function Spinner({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'nx-spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.4" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
