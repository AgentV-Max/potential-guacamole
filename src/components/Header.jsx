import { Flame, LogOut } from 'lucide-react'

export default function Header({ title, subtitle, avatarInitials, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-lg bg-brand-orange/15 p-2 shrink-0">
            <Flame className="text-brand-orange" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold leading-tight truncate">Gas-Link</p>
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-orange to-orange-700 flex items-center justify-center text-white font-bold text-xs">
              {avatarInitials}
            </div>
            <span className="text-sm text-slate-300 font-medium">{title}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-2 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
