import { useEffect, useRef, useState } from 'react'
import { Flame, ShieldCheck, ShoppingCart, Store, ArrowLeft, Loader2 } from 'lucide-react'
import { DEMO_CONSUMER, DEMO_SELLER } from '../data.js'

const ROLES = [
  {
    key: 'consumer',
    title: 'Gas Consumer',
    subtitle: 'Track your cylinder & reorder in seconds',
    icon: ShoppingCart,
    profile: DEMO_CONSUMER,
    tagline: '12.5kg tank · 15% remaining · Aguda, Surulere',
  },
  {
    key: 'seller',
    title: 'Licensed Seller',
    subtitle: 'Manage routes, escrow & payouts',
    icon: Store,
    profile: DEMO_SELLER,
    tagline: '4-bike fleet · ₦340,000 pending escrow',
  },
]

const CORRECT_OTP = '1234'

export default function Login({ onLogin }) {
  const [activeRole, setActiveRole] = useState('consumer')
  const [stage, setStage] = useState('select') // 'select' | 'otp'
  const [otp, setOtp] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const inputsRef = useRef([])

  const role = ROLES.find((r) => r.key === activeRole)

  useEffect(() => {
    if (stage === 'otp') {
      setOtp(['', '', '', ''])
      setError('')
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    }
  }, [stage])

  function handleQuickLink() {
    setStage('otp')
  }

  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError('')
    if (digit && index < 3) inputsRef.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handleVerify() {
    const code = otp.join('')
    if (code.length < 4) {
      setError('Enter all 4 digits.')
      return
    }
    setVerifying(true)
    setTimeout(() => {
      if (code === CORRECT_OTP) {
        onLogin(role.key)
      } else {
        setError('Incorrect code. Try 1234 for this demo.')
        setVerifying(false)
      }
    }, 700)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-emerald/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-brand-orange/15 p-2.5">
              <Flame className="text-brand-orange" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gas-Link</h1>
          </div>
          <p className="text-slate-400 text-sm text-center">
            Hyper-local cooking gas, delivered from licensed sellers in Surulere, Lagos
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          {stage === 'select' && (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/60 p-1.5 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setActiveRole(r.key)}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      activeRole === r.key
                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <r.icon size={16} />
                    {r.key === 'consumer' ? 'Consumer' : 'Seller'}
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Demo Account Quick-Link
              </p>

              <button
                onClick={handleQuickLink}
                className="w-full text-left rounded-2xl border border-slate-800 bg-slate-950/40 hover:border-brand-orange/50 hover:bg-slate-950/70 transition-all p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-orange to-orange-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {role.profile.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{role.profile.name}</p>
                    <p className="text-xs text-slate-400 truncate">{role.profile.email}</p>
                  </div>
                  <ArrowLeft className="rotate-180 text-slate-600 group-hover:text-brand-orange transition-colors shrink-0" size={18} />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <p className="text-xs text-slate-500">{role.tagline}</p>
                </div>
              </button>

              <p className="text-center text-xs text-slate-600 mt-5">
                Tap the profile above to simulate a secure login for investors &amp; demos
              </p>
            </div>
          )}

          {stage === 'otp' && (
            <div className="p-6 sm:p-8">
              <button
                onClick={() => setStage('select')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="rounded-full bg-brand-orange/15 p-3 mb-3">
                  <ShieldCheck className="text-brand-orange" size={26} />
                </div>
                <h2 className="text-lg font-bold text-white">Verify it&apos;s you</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Enter the 4-digit code sent to<br />
                  <span className="text-slate-200 font-medium">{role.profile.email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-14 w-12 text-center text-xl font-bold rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30 outline-none transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-center text-sm text-red-400 mb-4">{error}</p>}
              <p className="text-center text-xs text-slate-600 mb-6">
                Demo hint: the code is <span className="font-mono text-slate-400">1234</span>
              </p>

              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-orange-600 disabled:opacity-70 text-white font-semibold py-3 transition-colors shadow-lg shadow-brand-orange/20"
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  'Verify & Log In'
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Gas-Link MVP Demo · Pilot Sector: Surulere, Lagos
        </p>
      </div>
    </div>
  )
}
