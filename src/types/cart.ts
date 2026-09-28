import type { Product, ProductVariant } from './database';

export interface SelectedVariant {
  type: string;
  value: string;
  priceModifier: number;
}

export interface CartItem {
  id: string; // Unique key: `${product.id}-${sorted_variant_keys}`
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  selectedVariants: Record<string, string>;
  product: Product;
}

export interface CheckoutCustomerData {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface CartTotals {
  subtotal: number;
  totalDiscount: number;
  total: number;
  itemCount: number;
}
