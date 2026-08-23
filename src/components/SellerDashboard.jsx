import { Bike, CheckCircle2, Clock, MapPin, PiggyBank, Wallet } from 'lucide-react'
import Header from './Header.jsx'
import { formatNaira, formatNairaPrecise } from '../utils.js'

export default function SellerDashboard({
  profile,
  escrowBalance,
  clearedBalance,
  manifest,
  ledger,
  onMarkDelivered,
  onLogout,
}) {
  const pendingOrders = manifest.filter((o) => o.status === 'escrow')

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        title={profile.name}
        subtitle={`${profile.bikes}-bike dispatch fleet · Surulere`}
        avatarInitials={profile.avatarInitials}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{profile.name} Terminal</h1>
          <p className="text-slate-400 text-sm mt-1">Licensed seller · {profile.contact}</p>
        </div>

        {/* Wallet metrics */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <MetricCard
            icon={Wallet}
            tone="amber"
            label="Funds in Escrow"
            value={formatNaira(escrowBalance)}
            hint="Pending delivery validation"
          />
          <MetricCard
            icon={PiggyBank}
            tone="emerald"
            label="Cleared Balance"
            value={formatNaira(clearedBalance)}
            hint="Available for withdrawal"
          />
          <MetricCard
            icon={Bike}
            tone="orange"
            label="Active Fleet"
            value={`${profile.bikes} Bikes`}
            hint="Dispatched on Aguda–Bode Thomas loop"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Route manifest */}
          <div className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Optimized Route Manifest
              </p>
              <span className="text-xs text-slate-500">{pendingOrders.length} active</span>
            </div>
            <h2 className="text-white font-bold mb-4">Aguda – Bode Thomas Cluster Loop</h2>

            {pendingOrders.length === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">
                No pending drops. New escrow orders will appear here automatically.
              </p>
            )}

            <div className="space-y-3">
              {pendingOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="shrink-0 h-9 w-9 rounded-full bg-brand-orange/15 text-brand-orange font-bold text-sm flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          Drop {index + 1} · {order.consumerName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {order.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{order.cylinderSize}kg cylinder</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> ~{order.etaMinutes} min
                          </span>
                          <span className="text-slate-600">{order.bike}</span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-white tabular-nums">
                      {formatNaira(order.total)}
                    </span>
                  </div>
                  <button
                    onClick={() => onMarkDelivered(order.id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/30 text-brand-emerald text-xs font-semibold py-2.5 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Confirm Delivery &amp; Release Escrow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Revenue Split Ledger
            </p>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {ledger.length === 0 && (
                <p className="text-sm text-slate-500 py-8 text-center">No completed deliveries yet.</p>
              )}
              {ledger.map((txn) => (
                <div key={txn.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{txn.consumerName}</span>
                    <span className="text-xs text-slate-500">{txn.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Order total ({txn.cylinderSize}kg)</span>
                    <span className="text-slate-300 tabular-nums">{formatNaira(txn.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-brand-emerald">Vendor payout (95%)</span>
                    <span className="text-brand-emerald font-semibold tabular-nums">
                      {formatNairaPrecise(txn.vendorPayout)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gas-Link fee (5%)</span>
                    <span className="text-slate-500 tabular-nums">{formatNairaPrecise(txn.platformCut)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const TONE_CLASSES = {
  amber: 'text-brand-amber bg-brand-amber/10',
  emerald: 'text-brand-emerald bg-brand-emerald/10',
  orange: 'text-brand-orange bg-brand-orange/10',
}

function MetricCard({ icon: Icon, tone, label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <div className={`inline-flex rounded-xl p-2.5 mb-3 ${TONE_CLASSES[tone]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5 tabular-nums">{value}</p>
      <p className="text-xs text-slate-600 mt-1">{hint}</p>
    </div>
  )
}
