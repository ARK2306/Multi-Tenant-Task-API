/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Nexus dark palette */
        'nx-bg-0':  '#0A0A0B',
        'nx-bg-1':  '#0F0F11',
        'nx-bg-2':  '#16161A',
        'nx-bg-3':  '#1C1C21',
        'nx-fg-0':  '#F4F4F5',
        'nx-fg-1':  '#D4D4D8',
        'nx-fg-2':  '#9C9CA4',
        'nx-fg-3':  '#6B6B73',
        'nx-fg-4':  '#48484F',
        'nx-accent':       '#3B82F6',
        'nx-prio-low':     '#10B981',
        'nx-prio-med':     '#3B82F6',
        'nx-prio-high':    '#F59E0B',
        'nx-prio-crit':    '#EF4444',
        'nx-role-owner':   '#A855F7',
        'nx-role-admin':   '#3B82F6',
        'nx-role-member':  '#71717A',
        'nx-status-todo':  '#6B6B73',
        'nx-status-prog':  '#3B82F6',
        'nx-status-rev':   '#A855F7',
        'nx-status-done':  '#10B981',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.06)',
        strong: 'rgba(255,255,255,0.10)',
      },
      keyframes: {
        'fade-in':   { from: { transform: 'translateY(4px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
        'drawer-in': { from: { transform: 'translateX(24px)' }, to: { transform: 'none' } },
        'nx-spin':   { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in':   'fade-in 0.2s ease-out',
        'drawer-in': 'drawer-in 0.22s cubic-bezier(0.2,0.7,0.3,1)',
        'nx-spin':   'nx-spin 1s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
