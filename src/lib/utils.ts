import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function parseDuration(durationString: string): number {
  const [hours, minutes] = durationString.split(':').map(Number)
  return hours * 60 + minutes
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
  return new Date(d.setDate(diff))
}

export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return weekEnd
}

export function getTimeSlots(): Array<{ hour: number; minute: number; label: string }> {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date()
      time.setHours(hour, minute, 0, 0)
      slots.push({
        hour,
        minute,
        label: time.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      })
    }
  }
  return slots
}

export function getRecordTypeColor(type: 'sleep' | 'food' | 'medication'): string {
  switch (type) {
    case 'sleep':
      return '#565DFF'
    case 'food':
      return '#F3411A'
    case 'medication':
      return '#0A9D3C'
    default:
      return '#6B7280'
  }
}

export function getRecordTypeLabel(type: 'sleep' | 'food' | 'medication'): string {
  switch (type) {
    case 'sleep':
      return 'Sleep'
    case 'food':
      return 'Food'
    case 'medication':
      return 'Medicine'
    default:
      return 'Unknown'
  }
}
