export type UserRole = 'super_admin' | 'store_owner' | 'customer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StoreBrandItem {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
}

export interface StoreAboutSettings {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  story?: string;
  mission?: string;
  photos?: string[];
  founded_year?: string;
}

export interface StoreThemeSettings {
  primary_color: string;
  secondary_color: string;
  card_style: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-none';
  header_style: 'modern' | 'minimal' | 'banner';
  font_family: string;
  custom_domain?: string | null;
  about?: StoreAboutSettings;
  brands?: StoreBrandItem[];
  brand_marquee_direction?: 'left' | 'right';
  brand_marquee_speed?: 'slow' | 'normal' | 'fast';
  ticker_text?: string;
  show_live_social_proof?: boolean;
  whatsapp_order_template?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  currency: string;
  is_active: boolean;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  business_hours: string | null;
  theme_settings: StoreThemeSettings;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string; // e.g., 'Talla', 'Color', 'Capacidad'
  variant_value: string; // e.g., 'M', 'Negro', '128GB'
  price_modifier: number;
  stock: number | null;
  is_available: boolean;
  order_index: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  sku: string | null;
  stock: number | null;
  is_available: boolean;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Joins / Populated fields
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_variants: Record<string, string>;
  subtotal: number;
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  status: 'whatsapp_sent' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}
