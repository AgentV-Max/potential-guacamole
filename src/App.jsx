import { useCallback, useEffect, useRef, useState } from 'react'
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
import { dailyBurnPercent } from './utils.js'

let toastId = 0
let orderId = 1003
let txnId = 8842

const initialConsumerState = {
  cylinderSize: DEMO_CONSUMER.cylinderSize,
  burners: DEMO_CONSUMER.burners,
  remainingPercent: DEMO_CONSUMER.remainingPercent,
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

  const lowVolumeFired = useRef(false)
  const smartMatchTimer = useRef(null)

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
    if (consumer.remainingPercent >= 40) lowVolumeFired.current = false
  }, [consumer.remainingPercent])

  // Trigger the Low Volume toast the moment the gauge crosses below 15%
  useEffect(() => {
    if (session === 'consumer' && consumer.remainingPercent < 15 && !lowVolumeFired.current) {
      lowVolumeFired.current = true
      pushToast({
        type: 'low-volume',
        title: 'Low Volume Alert',
        message: `Your ${consumer.cylinderSize}kg cylinder is down to ${Math.max(0, Math.round(consumer.remainingPercent))}%. Reorder now before you run out.`,
        actionLabel: 'Reorder Now',
      })
    }
  }, [consumer.remainingPercent, session, consumer.cylinderSize, pushToast])

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

  function handleSimulateDay() {
    setConsumer((prev) => {
      const burn = dailyBurnPercent(prev.cylinderSize, prev.burners)
      const next = Math.max(0, prev.remainingPercent - burn)
      return { ...prev, remainingPercent: next }
    })
  }

  function handleAuthorizePayment({ total }) {
    setConsumer((prev) => ({ ...prev, remainingPercent: 100 }))
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
          remainingPercent={consumer.remainingPercent}
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
