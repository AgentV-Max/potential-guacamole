import { AlertTriangle, Bike, X, Zap } from 'lucide-react'

const ICONS = {
  'low-volume': AlertTriangle,
  'smart-match': Bike,
  success: Zap,
}

const TONE_CLASSES = {
  'low-volume': 'border-brand-amber/40 bg-amber-950/60',
  'smart-match': 'border-brand-orange/40 bg-orange-950/60',
  success: 'border-emerald-500/40 bg-emerald-950/60',
}

const ICON_TONE = {
  'low-volume': 'text-brand-amber',
  'smart-match': 'text-brand-orange',
  success: 'text-brand-emerald',
}

export default function ToastOverlay({ toasts, onDismiss, onAction }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Zap
        return (
          <div
            key={toast.id}
            className={`animate-slide-in rounded-2xl border backdrop-blur-xl shadow-2xl p-4 ${TONE_CLASSES[toast.type] || 'border-slate-700 bg-slate-900/80'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`shrink-0 rounded-full bg-slate-950/60 p-2 ${ICON_TONE[toast.type] || 'text-slate-300'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-50">{toast.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                {toast.actionLabel && (
                  <button
                    onClick={() => onAction(toast)}
                    className="mt-2.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-brand-orange text-white hover:bg-orange-600 transition-colors"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
