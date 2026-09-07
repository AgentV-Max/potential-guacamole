import { Calendar, Flame, Minus, Plus, RefreshCw, Zap } from 'lucide-react'
import Header from './Header.jsx'
import CylinderGauge from './CylinderGauge.jsx'
import { CYLINDER_SIZES } from '../data.js'
import { daysRemaining, depletionDate, formatDate, gaugeStatus } from '../utils.js'

export default function ConsumerDashboard({
  profile,
  cylinderSize,
  burners,
  remainingPercent,
  lastTopUpAt,
  daysElapsed,
  now,
  onChangeSize,
  onChangeBurners,
  onSimulateDay,
  onOpenCheckout,
  onLogout,
}) {
  const status = gaugeStatus(remainingPercent)
  const days = daysRemaining(lastTopUpAt, cylinderSize, burners, now)
  const depletion = depletionDate(lastTopUpAt, cylinderSize, burners)

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
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Cylinder Size
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CYLINDER_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => onChangeSize(size)}
                    className={`rounded-xl py-3 text-sm font-bold transition-all border ${
                      cylinderSize === size
                        ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20'
                        : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {size}kg
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Active Daily Burners
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onChangeBurners(Math.max(1, burners - 1))}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors"
                  aria-label="Decrease burners"
                >
                  <Minus size={18} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Flame
                      key={i}
                      size={26}
                      className={i < burners ? 'text-brand-orange' : 'text-slate-800'}
                      fill={i < burners ? 'currentColor' : 'none'}
                    />
                  ))}
                  <span className="ml-2 text-xl font-bold text-white tabular-nums">{burners}</span>
                </div>
                <button
                  onClick={() => onChangeBurners(Math.min(4, burners + 1))}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-600 transition-colors"
                  aria-label="Increase burners"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                How the tracker works
              </p>
              <ul className="text-sm text-slate-400 space-y-2 leading-relaxed">
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
