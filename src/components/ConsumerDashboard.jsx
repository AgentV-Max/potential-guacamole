import { Calendar, Flame, RefreshCw, SlidersHorizontal, Zap } from 'lucide-react'
import Header from './Header.jsx'
import CylinderGauge from './CylinderGauge.jsx'
import { COOKING_FREQUENCIES } from '../data.js'
import { daysRemaining, depletionDate, formatDate, gaugeStatus } from '../utils.js'

export default function ConsumerDashboard({
  profile,
  cylinderSize,
  burners,
  cookingFrequency,
  remainingPercent,
  lastTopUpAt,
  daysElapsed,
  now,
  onOpenWizard,
  onSimulateDay,
  onOpenCheckout,
  onLogout,
}) {
  const status = gaugeStatus(remainingPercent)
  const days = daysRemaining(lastTopUpAt, cylinderSize, burners, cookingFrequency, now)
  const depletion = depletionDate(lastTopUpAt, cylinderSize, burners, cookingFrequency)
  const cookingLabel = COOKING_FREQUENCIES.find((f) => f.value === cookingFrequency)?.label

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        title={profile.name}
        subtitle={profile.address}
        avatarInitials={profile.avatarInitials}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {profile.name.split(' ')[0]}</h1>
          <p className="text-slate-400 text-sm mt-1">{profile.address}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Gauge card */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 self-start">
              Cylinder Status
            </p>
            <CylinderGauge percent={remainingPercent} tone={status.tone} label={status.label} />

            <p className="text-xs text-slate-500 mt-4 text-center">
              Day <span className="font-semibold text-slate-300">{Math.floor(daysElapsed)}</span> since your last
              top-up on {formatDate(lastTopUpAt)}
            </p>

            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-center">
                <p className="text-xs text-slate-500">Days Remaining</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {isFinite(days) ? Math.max(0, Math.round(days)) : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                  <Calendar size={11} /> Depletes
                </p>
                <p className="text-sm font-bold text-white mt-1">{formatDate(depletion)}</p>
              </div>
            </div>

            <button
              onClick={onSimulateDay}
              className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-brand-orange/60 bg-slate-950/40 hover:bg-slate-950/70 text-slate-200 font-semibold py-3 transition-colors"
            >
              <Zap size={16} className="text-brand-amber" />
              Simulate Cooking Day
            </button>

            <button
              onClick={onOpenCheckout}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3 transition-colors shadow-lg shadow-brand-orange/20"
            >
              <RefreshCw size={16} />
              Reorder Gas Now
            </button>
          </div>

          {/* Controls */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tracker Configuration
                </p>
                <button
                  onClick={onOpenWizard}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-orange-400 transition-colors"
                >
                  <SlidersHorizontal size={13} />
                  Recalibrate
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ConfigTile label="Cylinder Size" value={`${cylinderSize}kg`} />
                <ConfigTile
                  label="Active Burners"
                  value={
                    <span className="flex items-center gap-1">
                      <Flame size={14} className="text-brand-orange" fill="currentColor" />
                      {burners}
                    </span>
                  }
                />
                <ConfigTile label="Cooking" value={cookingLabel} small />
              </div>

              <p className="text-xs text-slate-600 mt-4">
                These three parameters set your daily burn rate. Recalibrate any time via the guided setup —
                each step is walked through in sequence.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                How the tracker works
              </p>
              <ul className="text-sm text-slate-400 space-y-2 leading-relaxed">
                <li>• Burners, cooking frequency &amp; cylinder size — set in sequence — fix your daily burn rate</li>
                <li>• A live daily countdown, anchored to your last top-up date, drives the gauge</li>
                <li>• Turns <span className="text-brand-amber font-medium">amber</span> below 40% and <span className="text-red-400 font-medium">red</span> below 15%</li>
                <li>• Crossing 15% automatically fires a reorder trigger to your notifications</li>
                <li>• &ldquo;Simulate Cooking Day&rdquo; ages the countdown by a day instantly for demo purposes</li>
                <li>• Reordering restarts the countdown from today and dispatches a licensed seller</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ConfigTile({ label, value, small }) {
  return (
    <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-center">
      <p className="text-xs text-slate-500 truncate">{label}</p>
      <p className={`font-bold text-white mt-1 truncate ${small ? 'text-sm' : 'text-lg'}`}>{value}</p>
    </div>
  )
}
