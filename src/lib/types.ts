export type Seller = {
  id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  area: string;
  city: string;
  state: string;
  address: string;
  price_5kg: number | null;
  price_12_5kg: number | null;
  price_25kg: number | null;
  delivery: 0 | 1;
  accessories: 0 | 1;
  rating: number;
  rating_count: number;
  access_code: string;
  verified: 0 | 1;
  bank_code: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  paystack_recipient_code: string | null;
  created_at: string;
};

/** Seller fields safe to show to buyers browsing the marketplace. */
export type PublicSeller = Omit<
  Seller,
  | "access_code"
  | "bank_code"
  | "bank_account_number"
  | "bank_account_name"
  | "paystack_recipient_code"
>;

export type PaymentStatus = "unpaid" | "paid_held" | "released" | "refunded" | "disputed";
export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export type Order = {
  id: string;
  seller_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  buyer_token: string;
  delivery_address: string;
  area: string;
  cylinder_size: string;
  order_type: string;
  quantity: number;
  unit_price: number;
  amount: number;
  commission_amount: number;
  payout_amount: number;
  notes: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: "mock" | "paystack" | null;
  payment_reference: string | null;
  paid_at: string | null;
  buyer_confirmed_at: string | null;
  released_at: string | null;
  payout_error: string | null;
  dispute_reason: string | null;
  created_at: string;
};

/** Order view returned to sellers: never exposes the buyer's access token. */
export type SellerOrderView = Omit<Order, "buyer_token">;

/** Order view returned to buyers: never exposes internal commission math. */
export type BuyerOrderView = Omit<Order, "buyer_token" | "commission_amount" | "payout_amount">;

export const SURULERE_AREAS = [
  "Aguda",
  "Ogunlana Drive",
  "Bode Thomas",
  "Adeniran Ogunsanya",
  "Ojuelegba",
  "Coker",
  "Lawanson",
  "Itire",
  "Masha",
  "Other (Surulere)",
] as const;

export const CYLINDER_SIZES = ["3kg", "5kg", "6kg", "12.5kg", "25kg", "50kg"] as const;

/** Cylinder sizes sellers can price and buyers can pay for through escrow. */
export const PRICED_CYLINDER_SIZES = ["5kg", "12.5kg", "25kg"] as const;
export type PricedCylinderSize = (typeof PRICED_CYLINDER_SIZES)[number];

export const PRICE_FIELD_BY_SIZE: Record<PricedCylinderSize, keyof Seller> = {
  "5kg": "price_5kg",
  "12.5kg": "price_12_5kg",
  "25kg": "price_25kg",
};

/** Platform commission taken from the order amount before seller payout. */
export const PLATFORM_COMMISSION_RATE = 0.05;

export function stripAccessCode(seller: Seller): PublicSeller {
  const {
    id,
    business_name,
    owner_name,
    phone,
    whatsapp,
    area,
    city,
    state,
    address,
    price_5kg,
    price_12_5kg,
    price_25kg,
    delivery,
    accessories,
    rating,
    rating_count,
    verified,
    created_at,
  } = seller;
  return {
    id,
    business_name,
    owner_name,
    phone,
    whatsapp,
    area,
    city,
    state,
    address,
    price_5kg,
    price_12_5kg,
    price_25kg,
    delivery,
    accessories,
    rating,
    rating_count,
    verified,
    created_at,
  };
}

export function toSellerOrderView(order: Order): SellerOrderView {
  return {
    id: order.id,
    seller_id: order.seller_id,
    buyer_name: order.buyer_name,
    buyer_phone: order.buyer_phone,
    buyer_email: order.buyer_email,
    delivery_address: order.delivery_address,
    area: order.area,
    cylinder_size: order.cylinder_size,
    order_type: order.order_type,
    quantity: order.quantity,
    unit_price: order.unit_price,
    amount: order.amount,
    commission_amount: order.commission_amount,
    payout_amount: order.payout_amount,
    notes: order.notes,
    status: order.status,
    payment_status: order.payment_status,
    payment_provider: order.payment_provider,
    payment_reference: order.payment_reference,
    paid_at: order.paid_at,
    buyer_confirmed_at: order.buyer_confirmed_at,
    released_at: order.released_at,
    payout_error: order.payout_error,
    dispute_reason: order.dispute_reason,
    created_at: order.created_at,
  };
}

export function toBuyerOrderView(order: Order): BuyerOrderView {
  return {
    id: order.id,
    seller_id: order.seller_id,
    buyer_name: order.buyer_name,
    buyer_phone: order.buyer_phone,
    buyer_email: order.buyer_email,
    delivery_address: order.delivery_address,
    area: order.area,
    cylinder_size: order.cylinder_size,
    order_type: order.order_type,
    quantity: order.quantity,
    unit_price: order.unit_price,
    amount: order.amount,
    notes: order.notes,
    status: order.status,
    payment_status: order.payment_status,
    payment_provider: order.payment_provider,
    payment_reference: order.payment_reference,
    paid_at: order.paid_at,
    buyer_confirmed_at: order.buyer_confirmed_at,
    released_at: order.released_at,
    payout_error: order.payout_error,
    dispute_reason: order.dispute_reason,
    created_at: order.created_at,
  };
}
