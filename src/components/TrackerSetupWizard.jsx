import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Check, Flame, Minus, Plus, X, Zap } from 'lucide-react'
import CylinderSizeSlider from './CylinderSizeSlider.jsx'
import { COOKING_FREQUENCIES } from '../data.js'
import { dailyBurnPercent, formatDate, totalDaysToDepletion } from '../utils.js'

const STEP_COUNT = 3 // burners -> cooking frequency -> cylinder size, then review

export default function TrackerSetupWizard({ open, initialValues, onCancel, onActivate }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState(initialValues)

  // Re-seed the draft and restart at step 1 every time the wizard is opened,
  // so re-calibrating always walks through the full guided sequence again.
  useEffect(() => {
    if (open) {
      setDraft(initialValues)
      setStep(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const onReview = step === STEP_COUNT
  const burnRate = dailyBurnPercent(draft.cylinderSize, draft.burners, draft.cookingFrequency)
  const totalDays = totalDaysToDepletion(draft.cylinderSize, draft.burners, draft.cookingFrequency)
  const nextRefillEstimate = isFinite(totalDays)
    ? new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000)
    : null

  function goNext() {
    setStep((s) => Math.min(STEP_COUNT, s + 1))
  }
  function goBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            {step > 0 && !onReview && (
              <button
                onClick={goBack}
                className="text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="text-lg font-bold text-white">
              {onReview ? 'Review & Activate' : 'Set Up Your Tracker'}
            </h3>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-200 transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex gap-1.5 px-6 mt-4">
          {Array.from({ length: STEP_COUNT + 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-brand-orange' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="p-6">
          {step === 0 && (
            <StepBurners
              value={draft.burners}
              onChange={(burners) => setDraft((d) => ({ ...d, burners }))}
            />
          )}

          {step === 1 && (
            <StepCookingFrequency
              value={draft.cookingFrequency}
              onChange={(cookingFrequency) => setDraft((d) => ({ ...d, cookingFrequency }))}
            />
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Step 3 of {STEP_COUNT}
              </p>
              <h4 className="text-white font-semibold mb-4">Confirm your cylinder size</h4>
              <CylinderSizeSlider
                value={draft.cylinderSize}
                onChange={(cylinderSize) => setDraft((d) => ({ ...d, cylinderSize }))}
              />
            </div>
          )}

          {onReview && (
            <div>
              <h4 className="text-white font-semibold mb-4">Your daily gas utilization tracker</h4>
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 divide-y divide-slate-800/80 mb-4">
                <ReviewRow label="Cylinder Size" value={`${draft.cylinderSize}kg`} />
                <ReviewRow label="Active Burners" value={`${draft.burners}`} />
                <ReviewRow
                  label="Cooking Frequency"
                  value={COOKING_FREQUENCIES.find((f) => f.value === draft.cookingFrequency)?.label}
                />
                <ReviewRow label="Estimated Daily Usage" value={`${burnRate.toFixed(1)}% / day`} />
                <ReviewRow
                  label="Estimated Tank Life"
                  value={isFinite(totalDays) ? `${Math.round(totalDays)} days` : '—'}
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-brand-orange/10 border border-brand-orange/30 px-3 py-2.5 mb-5 text-xs text-orange-300">
                <Calendar size={14} className="shrink-0 mt-0.5" />
                <span>
                  Activating restarts your countdown from today. Based on these settings, we&apos;ll trigger your
                  next reorder alert around{' '}
                  <span className="font-semibold">{nextRefillEstimate ? formatDate(nextRefillEstimate) : '—'}</span>.
                </span>
              </div>

              <button
                onClick={() => onActivate(draft)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3.5 transition-colors shadow-lg shadow-brand-orange/20"
              >
                <Check size={16} />
                Activate Daily Tracker
              </button>
            </div>
          )}

          {!onReview && (
            <button
              onClick={goNext}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3.5 transition-colors shadow-lg shadow-brand-orange/20"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBurners({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Step 1 of {STEP_COUNT}</p>
      <h4 className="text-white font-semibold mb-1">How many burners do you run at once?</h4>
      <p className="text-sm text-slate-500 mb-5">This is the biggest driver of how fast your cylinder empties.</p>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors"
          aria-label="Decrease burners"
        >
          <Minus size={18} />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Flame
              key={i}
              size={28}
              className={i < value ? 'text-brand-orange' : 'text-slate-800'}
              fill={i < value ? 'currentColor' : 'none'}
            />
          ))}
          <span className="ml-2 text-2xl font-bold text-white tabular-nums">{value}</span>
        </div>
        <button
          onClick={() => onChange(Math.min(4, value + 1))}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors"
          aria-label="Increase burners"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

function StepCookingFrequency({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Step 2 of {STEP_COUNT}</p>
      <h4 className="text-white font-semibold mb-1">How many times a day do you cook?</h4>
      <p className="text-sm text-slate-500 mb-5">
        Cooking more often burns through gas faster, even with the same burners.
      </p>

      <div className="space-y-2.5">
        {COOKING_FREQUENCIES.map((freq) => (
          <button
            key={freq.value}
            onClick={() => onChange(freq.value)}
            className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-all flex items-center gap-3 ${
              value === freq.value
                ? 'bg-brand-orange/10 border-brand-orange text-white'
                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div
              className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
                value === freq.value ? 'bg-brand-orange text-white' : 'bg-slate-900 text-slate-500'
              }`}
            >
              <Zap size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{freq.label}</p>
              <p className="text-xs text-slate-500">{freq.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-white tabular-nums">{value}</span>
    </div>
  )
}
