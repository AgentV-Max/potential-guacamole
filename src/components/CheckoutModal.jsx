import { useState } from 'react'
import { CheckCircle2, Lock, Loader2, X, Tag } from 'lucide-react'
import { PRICE_PER_KG, DELIVERY_FEE, PLATFORM_FEE } from '../data.js'
import { formatNaira } from '../utils.js'

export default function CheckoutModal({ open, onClose, cylinderSize, discounted, onAuthorize }) {
  const [status, setStatus] = useState('review') // 'review' | 'processing' | 'success'

  if (!open) return null

  const baseGasCost = Math.round(cylinderSize * PRICE_PER_KG)
  const deliveryFee = discounted ? DELIVERY_FEE - 200 : DELIVERY_FEE
  const platformFee = PLATFORM_FEE
  const total = baseGasCost + deliveryFee + platformFee

  function handleAuthorize() {
    setStatus('processing')
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        onAuthorize({ baseGasCost, deliveryFee, platformFee, total, cylinderSize })
        setStatus('review')
      }, 1100)
    }, 1400)
  }

  function handleClose() {
    if (status === 'processing') return
    setStatus('review')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {status !== 'success' && (
          <div className="flex items-center justify-between px-6 pt-6">
            <h3 className="text-lg font-bold text-white">Escrow Checkout</h3>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-200 transition-colors"
              aria-label="Close checkout"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {status === 'review' && (
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-5">
              {cylinderSize}kg cylinder refill · Aguda, Surulere · Priced at {formatNaira(PRICE_PER_KG)}/kg
            </p>

            {discounted && (
              <div className="flex items-center gap-2 rounded-xl bg-brand-orange/10 border border-brand-orange/30 px-3 py-2 mb-4 text-xs text-orange-300">
                <Tag size={14} /> Street Smart-Match discount applied: −₦200 delivery fee
              </div>
            )}

            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 divide-y divide-slate-800/80 mb-5">
              <Row label={`Base Gas Cost (${cylinderSize}kg)`} value={formatNaira(baseGasCost)} />
              <Row label="Surulere Delivery Fee" value={formatNaira(deliveryFee)} />
              <Row label="Gas-Link Platform Fee" value={formatNaira(platformFee)} />
              <Row label="Total" value={formatNaira(total)} bold />
            </div>

            <button
              onClick={handleAuthorize}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3.5 transition-colors shadow-lg shadow-brand-orange/20"
            >
              <Lock size={16} />
              Authorize Escrow Payment via Paystack/Flutterwave
            </button>
            <p className="text-center text-xs text-slate-600 mt-3">
              Funds are held in escrow until your delivery is confirmed
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
            <p className="text-white font-semibold">Processing sandbox payment...</p>
            <p className="text-sm text-slate-500 mt-1">Securing {formatNaira(total)} in escrow</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="text-brand-emerald mb-4" size={48} />
            <p className="text-white font-bold text-lg">Escrow Secured!</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Your order has been pushed to the seller&apos;s delivery route. Cylinder marked refilled.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className={`text-sm ${bold ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? 'text-white font-bold' : 'text-slate-200'}`}>{value}</span>
    </div>
  )
}
