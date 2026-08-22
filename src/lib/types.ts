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
  created_at: string;
};

export type PublicSeller = Omit<Seller, "access_code">;

export type Order = {
  id: string;
  seller_id: string;
  buyer_name: string;
  buyer_phone: string;
  delivery_address: string;
  area: string;
  cylinder_size: string;
  order_type: string;
  quantity: number;
  notes: string | null;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
};

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
