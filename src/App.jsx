import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Login from './components/Login.jsx'
import ConsumerDashboard from './components/ConsumerDashboard.jsx'
import SellerDashboard from './components/SellerDashboard.jsx'
import CheckoutModal from './components/CheckoutModal.jsx'
import ToastOverlay from './components/ToastOverlay.jsx'
import {
  DEMO_CONSUMER,
  DEMO_SELLER,
  INITIAL_LEDGER,
  INITIAL_MANIFEST,
  PLATFORM_CUT,
} from './data.js'
import { daysSinceTopUp, remainingPercentFromTopUp } from './utils.js'

let toastId = 0
let orderId = 1003
let txnId = 8842

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const CLOCK_TICK_MS = 60 * 1000 // how often the live day-count re-checks itself

const initialConsumerState = {
  cylinderSize: DEMO_CONSUMER.cylinderSize,
  burners: DEMO_CONSUMER.burners,
  lastTopUpAt: DEMO_CONSUMER.lastTopUpAt,
}

const initialSellerState = {
  escrowBalance: DEMO_SELLER.escrowBalance,
  clearedBalance: DEMO_SELLER.clearedBalance,
  manifest: INITIAL_MANIFEST,
  ledger: INITIAL_LEDGER,
}

export default function App() {
  const [session, setSession] = useState(null) // null | 'consumer' | 'seller'
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [discountActive, setDiscountActive] = useState(false)
  const [toasts, setToasts] = useState([])

  const [consumer, setConsumer] = useState(initialConsumerState)
  const [seller, setSeller] = useState(initialSellerState)
  const [now, setNow] = useState(() => new Date())

  const lowVolumeFired = useRef(false)
  const smartMatchTimer = useRef(null)

  // The gauge is a daily countdown anchored to lastTopUpAt, not a value we
  // mutate directly — re-ticking "now" lets it keep counting down live for
  // as long as the tab stays open, exactly as it would across real days.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS)
    return () => clearInterval(id)
  }, [])

  const daysElapsed = useMemo(
    () => daysSinceTopUp(consumer.lastTopUpAt, now),
    [consumer.lastTopUpAt, now],
  )

  const remainingPercent = useMemo(
    () => remainingPercentFromTopUp(consumer.lastTopUpAt, consumer.cylinderSize, consumer.burners, now),
    [consumer.lastTopUpAt, consumer.cylinderSize, consumer.burners, now],
  )

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, ...toast }])
      setTimeout(() => dismissToast(id), 9000)
    },
    [dismissToast],
  )

  function handleToastAction(toast) {
    if (toast.type === 'low-volume') {
      setCheckoutOpen(true)
    } else if (toast.type === 'smart-match') {
      setDiscountActive(true)
      setCheckoutOpen(true)
    }
    dismissToast(toast.id)
  }

  function handleLogin(role) {
    setSession(role)
  }

  function handleLogout() {
    // Consumer & seller domain state (cylinder level, manifest, ledger, wallet)
    // intentionally persists across logout so the cross-role demo flow holds:
    // an order placed as the consumer is still visible in the seller's
    // manifest after switching accounts.
    setSession(null)
    setCheckoutOpen(false)
    setDiscountActive(false)
    clearTimeout(smartMatchTimer.current)
  }

  // Reset the low-volume flag whenever the tank climbs back to a healthy level
  useEffect(() => {
    if (remainingPercent >= 40) lowVolumeFired.current = false
  }, [remainingPercent])

  // Trigger the Low Volume toast the moment the day-count-driven gauge crosses below 15%
  useEffect(() => {
    if (session === 'consumer' && remainingPercent < 15 && !lowVolumeFired.current) {
      lowVolumeFired.current = true
      pushToast({
        type: 'low-volume',
        title: 'Low Volume Alert',
        message: `Day ${Math.floor(daysElapsed)} since your last top-up — your ${consumer.cylinderSize}kg cylinder is down to ${Math.max(0, Math.round(remainingPercent))}%. Reorder now before you run out.`,
        actionLabel: 'Reorder Now',
      })
    }
  }, [remainingPercent, daysElapsed, session, consumer.cylinderSize, pushToast])

  // Simulate a Street Smart-Match ping shortly after the consumer logs in
  useEffect(() => {
    if (session === 'consumer') {
      smartMatchTimer.current = setTimeout(() => {
        pushToast({
          type: 'smart-match',
          title: 'Street Smart-Match',
          message:
            'A partner dispatch rider is already passing Bode Thomas Close. Bundle your order now for ₦200 off delivery.',
          actionLabel: 'Bundle Now',
        })
      }, 6000)
      return () => clearTimeout(smartMatchTimer.current)
    }
  }, [session, pushToast])

  // Ages the top-up date back by a day so the countdown ticks forward one
  // day's worth of burn — the same derivation a real day passing would drive.
  function handleSimulateDay() {
    setConsumer((prev) => ({
      ...prev,
      lastTopUpAt: new Date(prev.lastTopUpAt.getTime() - ONE_DAY_MS),
    }))
    setNow(new Date())
  }

  function handleAuthorizePayment({ total }) {
    setConsumer((prev) => ({ ...prev, lastTopUpAt: new Date() }))
    setCheckoutOpen(false)
    setDiscountActive(false)

    const newOrder = {
      id: `ORD-${orderId++}`,
      consumerName: DEMO_CONSUMER.name,
      address: DEMO_CONSUMER.address,
      cylinderSize: consumer.cylinderSize,
      total,
      status: 'escrow',
      etaMinutes: 15,
      bike: 'Bike 01',
    }

    setSeller((prev) => ({
      ...prev,
      escrowBalance: prev.escrowBalance + total,
      manifest: [newOrder, ...prev.manifest],
    }))

    pushToast({
      type: 'success',
      title: 'Order Confirmed',
      message: `${formatSize(consumer.cylinderSize)} refill authorized and pushed to the seller's delivery route.`,
    })
  }

  function handleMarkDelivered(id) {
    setSeller((prev) => {
      const order = prev.manifest.find((o) => o.id === id)
      if (!order) return prev
      const vendorPayout = order.total * (1 - PLATFORM_CUT)
      const platformCut = order.total * PLATFORM_CUT
      const txn = {
        id: `TXN-${txnId++}`,
        consumerName: order.consumerName,
        date: new Date().toISOString().slice(0, 10),
        total: order.total,
        vendorPayout,
        platformCut,
        cylinderSize: order.cylinderSize,
      }
      return {
        ...prev,
        escrowBalance: Math.max(0, prev.escrowBalance - order.total),
        clearedBalance: prev.clearedBalance + vendorPayout,
        manifest: prev.manifest.filter((o) => o.id !== id),
        ledger: [txn, ...prev.ledger],
      }
    })
  }

  if (!session) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <>
      {session === 'consumer' && (
        <ConsumerDashboard
          profile={DEMO_CONSUMER}
          cylinderSize={consumer.cylinderSize}
          burners={consumer.burners}
          remainingPercent={remainingPercent}
          lastTopUpAt={consumer.lastTopUpAt}
          daysElapsed={daysElapsed}
          now={now}
          onChangeSize={(size) => setConsumer((prev) => ({ ...prev, cylinderSize: size }))}
          onChangeBurners={(burners) => setConsumer((prev) => ({ ...prev, burners }))}
          onSimulateDay={handleSimulateDay}
          onOpenCheckout={() => setCheckoutOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {session === 'seller' && (
        <SellerDashboard
          profile={DEMO_SELLER}
          escrowBalance={seller.escrowBalance}
          clearedBalance={seller.clearedBalance}
          manifest={seller.manifest}
          ledger={seller.ledger}
          onMarkDelivered={handleMarkDelivered}
          onLogout={handleLogout}
        />
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          setDiscountActive(false)
        }}
        cylinderSize={consumer.cylinderSize}
        discounted={discountActive}
        onAuthorize={handleAuthorizePayment}
      />

      <ToastOverlay toasts={toasts} onDismiss={dismissToast} onAction={handleToastAction} />
    </>
  )
}

function formatSize(size) {
  return `${size}kg`
}
