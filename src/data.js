// Static demo data & pricing constants for the Gas-Link MVP.
// All state is in-memory — no backend, no API keys required.

export const PRICE_PER_KG = 1250 // ₦/kg — mid-range Lagos LPG retail price
export const DELIVERY_FEE = 1500 // ₦ — flat Surulere localized delivery fee
export const PLATFORM_FEE = 500 // ₦ — flat Gas-Link service fee
export const PLATFORM_CUT = 0.05 // 5% of vendor payout goes to Gas-Link

export const CYLINDER_SIZES = [5, 12.5, 25, 50]

export const DAILY_KG_PER_BURNER = 0.22 // approx. kg burned per active burner per day

export const DEMO_CONSUMER = {
  role: 'consumer',
  email: 'oluwaseun@surulere.com',
  name: 'Oluwaseun Adebayo',
  address: 'No. 14 Bode Thomas Close, Aguda, Surulere',
  avatarInitials: 'OA',
  cylinderSize: 12.5,
  burners: 2,
  remainingPercent: 15,
}

export const DEMO_SELLER = {
  role: 'seller',
  email: 'surulere_gashub@plants.ng',
  name: 'Surulere GasHub',
  contact: 'Alhaji Musa Balogun',
  avatarInitials: 'SG',
  bikes: 4,
  escrowBalance: 340000,
  clearedBalance: 128500,
}

// Pre-loaded 4-bike Aguda–Bode Thomas delivery cluster
export const INITIAL_MANIFEST = [
  {
    id: 'ORD-1001',
    consumerName: 'Chidinma Okafor',
    address: '22 Ojuelegba Rd, Bode Thomas, Surulere',
    cylinderSize: 12.5,
    total: 17625,
    baseGasCost: 15625,
    deliveryFee: 1500,
    platformFee: 500,
    status: 'escrow',
    etaMinutes: 12,
    bike: 'Bike 02',
  },
  {
    id: 'ORD-1002',
    consumerName: 'Tunde Bakare',
    address: '5 Adelabu St, Aguda, Surulere',
    cylinderSize: 5,
    total: 8250,
    baseGasCost: 6250,
    deliveryFee: 1500,
    platformFee: 500,
    status: 'escrow',
    etaMinutes: 21,
    bike: 'Bike 02',
  },
]

export const INITIAL_LEDGER = [
  {
    id: 'TXN-8841',
    consumerName: 'Amaka Eze',
    date: '2026-08-21',
    total: 33750,
    vendorPayout: 32062.5,
    platformCut: 1687.5,
    cylinderSize: 25,
  },
  {
    id: 'TXN-8830',
    consumerName: 'Ibrahim Yusuf',
    date: '2026-08-19',
    total: 17625,
    vendorPayout: 16743.75,
    platformCut: 881.25,
    cylinderSize: 12.5,
  },
]
