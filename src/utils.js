import { DAILY_KG_PER_BURNER } from './data.js'

export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNairaPrecise(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount)
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function dailyBurnPercent(cylinderSize, burners) {
  const dailyKg = DAILY_KG_PER_BURNER * burners
  return (dailyKg / cylinderSize) * 100
}

// Total days a full cylinder lasts at the current size/burner burn rate.
export function totalDaysToDepletion(cylinderSize, burners) {
  const burnRate = dailyBurnPercent(cylinderSize, burners)
  if (burnRate <= 0) return Infinity
  return 100 / burnRate
}

export function daysSinceTopUp(lastTopUpAt, now = new Date()) {
  return Math.max(0, (now.getTime() - lastTopUpAt.getTime()) / MS_PER_DAY)
}

// The gauge is a pure function of "how long ago did we last top up" — this
// is the single source of truth the countdown, the reorder trigger, and the
// depletion date all read from, rather than an independently mutated field.
export function remainingPercentFromTopUp(lastTopUpAt, cylinderSize, burners, now = new Date()) {
  const elapsed = daysSinceTopUp(lastTopUpAt, now)
  const burnRate = dailyBurnPercent(cylinderSize, burners)
  return Math.max(0, Math.min(100, 100 - elapsed * burnRate))
}

export function daysRemaining(lastTopUpAt, cylinderSize, burners, now = new Date()) {
  const total = totalDaysToDepletion(cylinderSize, burners)
  if (!isFinite(total)) return Infinity
  return Math.max(0, total - daysSinceTopUp(lastTopUpAt, now))
}

export function depletionDate(lastTopUpAt, cylinderSize, burners) {
  const total = totalDaysToDepletion(cylinderSize, burners)
  if (!isFinite(total)) return null
  return new Date(lastTopUpAt.getTime() + total * MS_PER_DAY)
}

export function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function gaugeStatus(percent) {
  if (percent <= 0) return { label: 'Exhausted', tone: 'red' }
  if (percent < 15) return { label: 'Critical', tone: 'red' }
  if (percent < 40) return { label: 'Low Volume', tone: 'amber' }
  return { label: 'Healthy', tone: 'emerald' }
}

export const TONE_HEX = {
  red: '#EF4444',
  amber: '#F59E0B',
  emerald: '#10B981',
}
