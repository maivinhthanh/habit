export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function calculateStreak(lastCheckedAt: string | null, currentStreak: number): number {
  if (!lastCheckedAt) return 1
  const last = lastCheckedAt.slice(0, 10)
  const t = today()
  const y = yesterday()
  if (last === t) return currentStreak
  if (last === y) return currentStreak + 1
  return 1
}

export function isCheckedToday(lastCheckedAt: string | null): boolean {
  if (!lastCheckedAt) return false
  return lastCheckedAt.slice(0, 10) === today()
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function formatPoints(points: number): string {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`
  return String(points)
}

export function streakBonus(streak: number): number {
  if (streak >= 100) return 500
  if (streak >= 30) return 200
  if (streak >= 14) return 100
  if (streak >= 7) return 50
  return 0
}

export function isMilestone(streak: number): boolean {
  return [7, 14, 30, 100].includes(streak)
}
