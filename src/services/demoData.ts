import type { Category, Product, Store, Profile } from '../types/database';

export const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@ssboutique.com',
  full_name: 'Administrador',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
  role: 'store_owner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEMO_STORE: Store = {
  id: 'a0000000-0000-0000-0000-000000000001',
  owner_id: DEMO_PROFILE.id,
  name: 'S&S BOUTIQUE',
  slug: 'ss-boutique',
  description: 'Colecciones exclusivas de alta moda, calzado de autor y accesorios de diseño. Calidad superior, cortes impecables y atención personalizada.',
  logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
  banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
  whatsapp_number: '573001234567',
  phone: '+57 300 123 4567',
  address: 'Calle 82 # 12-45, El Retiro',
  city: 'Bogotá, Colombia',
  currency: 'COP',
  is_active: true,
  instagram_url: 'https://instagram.com/ssboutique',
  facebook_url: 'https://facebook.com/ssboutique',
  tiktok_url: 'https://tiktok.com/@ssboutique',
  business_hours: 'Lunes a Sábado: 10:00 AM - 7:00 PM',
  theme_settings: {
    primary_color: '#0f172a',
    secondary_color: '#1e293b',
    card_style: 'rounded-2xl',
    header_style: 'modern',
    font_family: 'Plus Jakarta Sans'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    store_id: DEMO_STORE.id,
    name: 'Alta Moda & Vestuario',
    slug: 'alta-moda-y-vestuario',
    description: 'Prendas confeccionadas con textiles nobles y patrones contemporáneos',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    store_id: DEMO_STORE.id,
    name: 'Calzado de Autor',
    slug: 'calzado-de-autor',
    description: 'Zapatos y sneakers artesanales en 100% cuero genuino',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    store_id: DEMO_STORE.id,
    name: 'Marroquinería & Bolsos',
    slug: 'marroquineria-y-bolsos',
    description: 'Bolsos, carteras y accesorios de cuero con acabados premium',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    store_id: DEMO_STORE.id,
    name: 'Perfumería & Relojería',
    slug: 'perfumeria-y-relojeria',
    description: 'Fragancias nicho y piezas de precisión',
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    store_id: DEMO_STORE.id,
    category_id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Camisa Lino Italiano Oversize',
    slug: 'camisa-lino-italiano-oversize',
    description: 'Confeccionada en 100% lino de origen europeo de textura fluida y transpirable. Botones en nácar legítimo y corte contemporáneo relajado.',
    price: 180000,
    original_price: 240000,
    sku: 'SS-LIN-01',
    stock: 25,
    is_available: true,
    is_featured: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-1',
        product_id: 'c0000000-0000-0000-0000-000000000001',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop',
        is_primary: true,
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'img-2',
        product_id: 'c0000000-0000-0000-0000-000000000001',
        image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop',
        is_primary: false,
        order_index: 2,
        created_at: new Date().toISOString()
      }
    ],
    variants: [
      { id: 'v-1', product_id: 'c0000000-0000-0000-0000-000000000001', variant_type: 'Talla', variant_value: 'S', price_modifier: 0, stock: 8, is_available: true, order_index: 1, created_at: new Date().toISOString() },
      { id: 'v-2', product_id: 'c0000000-0000-0000-0000-000000000001', variant_type: 'Talla', variant_value: 'M', price_modifier: 0, stock: 12, is_available: true, order_index: 2, created_at: new Date().toISOString() },
      { id: 'v-3', product_id: 'c0000000-0000-0000-0000-000000000001', variant_type: 'Talla', variant_value: 'L', price_modifier: 0, stock: 5, is_available: true, order_index: 3, created_at: new Date().toISOString() },
      { id: 'v-4', product_id: 'c0000000-0000-0000-0000-000000000001', variant_type: 'Color', variant_value: 'Blanco Crudo', price_modifier: 0, stock: 15, is_available: true, order_index: 4, created_at: new Date().toISOString() },
      { id: 'v-5', product_id: 'c0000000-0000-0000-0000-000000000001', variant_type: 'Color', variant_value: 'Arena Silvestre', price_modifier: 0, stock: 10, is_available: true, order_index: 5, created_at: new Date().toISOString() },
    ]
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    store_id: DEMO_STORE.id,
    category_id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Sneakers Minimalistas en Cuero Nobuk',
    slug: 'sneakers-cuero-nobuk',
    description: 'Calzado elaborado a mano en cuero de textura nobuk aterciopelada, plantilla ergonómica viscoelástica y suela cosida de alta durabilidad.',
    price: 320000,
    original_price: 390000,
    sku: 'SS-ZAP-02',
    stock: 14,
    is_available: true,
    is_featured: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-3',
        product_id: 'c0000000-0000-0000-0000-000000000002',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
        is_primary: true,
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'img-4',
        product_id: 'c0000000-0000-0000-0000-000000000002',
        image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop',
        is_primary: false,
        order_index: 2,
        created_at: new Date().toISOString()
      }
    ],
    variants: [
      { id: 'v-6', product_id: 'c0000000-0000-0000-0000-000000000002', variant_type: 'Talla (EU)', variant_value: '39', price_modifier: 0, stock: 3, is_available: true, order_index: 1, created_at: new Date().toISOString() },
      { id: 'v-7', product_id: 'c0000000-0000-0000-0000-000000000002', variant_type: 'Talla (EU)', variant_value: '40', price_modifier: 0, stock: 4, is_available: true, order_index: 2, created_at: new Date().toISOString() },
      { id: 'v-8', product_id: 'c0000000-0000-0000-0000-000000000002', variant_type: 'Talla (EU)', variant_value: '41', price_modifier: 0, stock: 4, is_available: true, order_index: 3, created_at: new Date().toISOString() },
      { id: 'v-9', product_id: 'c0000000-0000-0000-0000-000000000002', variant_type: 'Talla (EU)', variant_value: '42', price_modifier: 0, stock: 3, is_available: true, order_index: 4, created_at: new Date().toISOString() },
    ]
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    store_id: DEMO_STORE.id,
    category_id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Bolso Tote Estructurado en Cuero Graneado',
    slug: 'bolso-tote-cuero-graneado',
    description: 'Diseño sobrio y espacioso elaborado en cuero vacuno con forro en gamuza natural. Herrajes metálicos pulidos en tono oro mate y compartimento acolchado.',
    price: 450000,
    original_price: 520000,
    sku: 'SS-BOL-03',
    stock: 10,
    is_available: true,
    is_featured: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-5',
        product_id: 'c0000000-0000-0000-0000-000000000003',
        image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop',
        is_primary: true,
        order_index: 1,
        created_at: new Date().toISOString()
      }
    ],
    variants: [
      { id: 'v-10', product_id: 'c0000000-0000-0000-0000-000000000003', variant_type: 'Color', variant_value: 'Negro Ébano', price_modifier: 0, stock: 5, is_available: true, order_index: 1, created_at: new Date().toISOString() },
      { id: 'v-11', product_id: 'c0000000-0000-0000-0000-000000000003', variant_type: 'Color', variant_value: 'Cognac Noble', price_modifier: 0, stock: 5, is_available: true, order_index: 2, created_at: new Date().toISOString() },
    ]
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    store_id: DEMO_STORE.id,
    category_id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Perfume Signature Extrait 100ml',
    slug: 'perfume-signature-extrait',
    description: 'Concentración extrait de parfum con fijación superior a 14 horas. Notas maestras de cardamomo guatemalteco, madera de agar y ámbar negro.',
    price: 260000,
    original_price: 310000,
    sku: 'SS-PER-04',
    stock: 18,
    is_available: true,
    is_featured: false,
    order_index: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-6',
        product_id: 'c0000000-0000-0000-0000-000000000004',
        image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop',
        is_primary: true,
        order_index: 1,
        created_at: new Date().toISOString()
      }
    ],
    variants: []
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    store_id: DEMO_STORE.id,
    category_id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Reloj Cronógrafo Acero Cepillado',
    slug: 'reloj-cronografo-acero-cepillado',
    description: 'Caja de 41mm en acero quirúrgico 316L, cristal de zafiro antirreflejos, bisel cerámico y correa en piel genuina de curtición vegetal.',
    price: 580000,
    original_price: 690000,
    sku: 'SS-REL-05',
    stock: 8,
    is_available: true,
    is_featured: false,
    order_index: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        id: 'img-7',
        product_id: 'c0000000-0000-0000-0000-000000000005',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
        is_primary: true,
        order_index: 1,
        created_at: new Date().toISOString()
      }
    ],
    variants: [
      { id: 'v-12', product_id: 'c0000000-0000-0000-0000-000000000005', variant_type: 'Dial', variant_value: 'Negro Onyx', price_modifier: 0, stock: 4, is_available: true, order_index: 1, created_at: new Date().toISOString() },
      { id: 'v-13', product_id: 'c0000000-0000-0000-0000-000000000005', variant_type: 'Dial', variant_value: 'Blanco Plata', price_modifier: 0, stock: 4, is_available: true, order_index: 2, created_at: new Date().toISOString() },
    ]
  }
];
