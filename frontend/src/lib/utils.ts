import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string | undefined | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return 'No date'
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDue(iso: string | undefined | null) {
  if (!iso) return 'No date'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function dueColor(iso: string | undefined | null): string {
  if (!iso) return '#6B6B73'
  const days = (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (days < 0)  return '#EF4444'
  if (days <= 3) return '#F59E0B'
  return '#9C9CA4'
}

export function avatarGradient(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  const hue = Math.abs(h) % 360
  return `linear-gradient(135deg, hsl(${hue} 60% 55%), hsl(${(hue + 40) % 360} 60% 45%))`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function projectColor(key: string): [string, string] {
  const palette: Record<string, [string, string]> = {
    NEX: ['#3B82F6', '#1D4ED8'],
    MOB: ['#A855F7', '#7C3AED'],
    BIL: ['#10B981', '#047857'],
    BR:  ['#F59E0B', '#B45309'],
  }
  return palette[key] ?? ['#3B82F6', '#1E40AF']
}
