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

export function dailyBurnPercent(cylinderSize, burners) {
  const dailyKg = DAILY_KG_PER_BURNER * burners
  return (dailyKg / cylinderSize) * 100
}

export function daysRemaining(remainingPercent, cylinderSize, burners) {
  const burnRate = dailyBurnPercent(cylinderSize, burners)
  if (burnRate <= 0) return Infinity
  return remainingPercent / burnRate
}

export function depletionDate(remainingPercent, cylinderSize, burners) {
  const days = daysRemaining(remainingPercent, cylinderSize, burners)
  if (!isFinite(days)) return null
  const d = new Date()
  d.setDate(d.getDate() + Math.round(days))
  return d
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
