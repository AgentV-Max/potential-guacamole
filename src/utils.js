import { KG_PER_BURNER_PER_SESSION } from './data.js'

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

// Daily burn rate depends on both how many burners run AND how many times a
// day the household cooks — both collected by the guided setup wizard.
export function dailyBurnPercent(cylinderSize, burners, cookingFrequency) {
  const dailyKg = KG_PER_BURNER_PER_SESSION * burners * cookingFrequency
  return (dailyKg / cylinderSize) * 100
}

// Total days a full cylinder lasts at the current burn rate.
export function totalDaysToDepletion(cylinderSize, burners, cookingFrequency) {
  const burnRate = dailyBurnPercent(cylinderSize, burners, cookingFrequency)
  if (burnRate <= 0) return Infinity
  return 100 / burnRate
}

export function daysSinceTopUp(lastTopUpAt, now = new Date()) {
  return Math.max(0, (now.getTime() - lastTopUpAt.getTime()) / MS_PER_DAY)
}

// The gauge is a pure function of "how long ago did we last top up" — this
// is the single source of truth the countdown, the reorder trigger, and the
// depletion date all read from, rather than an independently mutated field.
export function remainingPercentFromTopUp(lastTopUpAt, cylinderSize, burners, cookingFrequency, now = new Date()) {
  const elapsed = daysSinceTopUp(lastTopUpAt, now)
  const burnRate = dailyBurnPercent(cylinderSize, burners, cookingFrequency)
  return Math.max(0, Math.min(100, 100 - elapsed * burnRate))
}

export function daysRemaining(lastTopUpAt, cylinderSize, burners, cookingFrequency, now = new Date()) {
  const total = totalDaysToDepletion(cylinderSize, burners, cookingFrequency)
  if (!isFinite(total)) return Infinity
  return Math.max(0, total - daysSinceTopUp(lastTopUpAt, now))
}

export function depletionDate(lastTopUpAt, cylinderSize, burners, cookingFrequency) {
  const total = totalDaysToDepletion(cylinderSize, burners, cookingFrequency)
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
