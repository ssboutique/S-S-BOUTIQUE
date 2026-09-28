-- ==============================================================================
-- VendPro Multi-Tenant SaaS Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & HELPERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'store_owner' CHECK (role IN ('super_admin', 'store_owner', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for profile updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'store_owner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. STORES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    whatsapp_number TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    currency TEXT NOT NULL DEFAULT 'COP',
    is_active BOOLEAN NOT NULL DEFAULT true,
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,
    business_hours TEXT,
    theme_settings JSONB NOT NULL DEFAULT '{
        "primary_color": "#16a34a",
        "secondary_color": "#0f172a",
        "card_style": "rounded-2xl",
        "header_style": "modern",
        "font_family": "Plus Jakarta Sans"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_store ON public.categories(store_id);

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(12, 2) CHECK (original_price IS NULL OR original_price >= 0),
    sku TEXT,
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 8. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_type TEXT NOT NULL, -- e.g. Talla, Color, Capacidad
    variant_value TEXT NOT NULL, -- e.g. S, M, L / Negro, Blanco / 128GB
    price_modifier NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- 9. ORDERS TABLE (Audit log for WhatsApp Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    notes TEXT,
    subtotal NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'whatsapp_sent' CHECK (status IN ('whatsapp_sent', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);

-- 10. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    selected_variants JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper function to check if the current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are readable by self and super admins"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- STORES POLICIES
-- Anyone can view active stores (Public Storefront)
CREATE POLICY "Anyone can view active stores"
    ON public.stores FOR SELECT
    USING (is_active = true OR owner_id = auth.uid() OR public.is_super_admin());

-- Store owners can insert their store
CREATE POLICY "Authenticated users can create a store"
    ON public.stores FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Store owners can update their own store
CREATE POLICY "Store owners can update their own store"
    ON public.stores FOR UPDATE
    USING (auth.uid() = owner_id OR public.is_super_admin());

-- Store owners can delete their own store
CREATE POLICY "Store owners can delete their store"
    ON public.stores FOR DELETE
    USING (auth.uid() = owner_id OR public.is_super_admin());

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view active categories of active stores"
    ON public.categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = categories.store_id
            AND (stores.is_active = true OR stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Store owners can manage categories"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = categories.store_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view available products of active stores"
    ON public.products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = products.store_id
            AND (stores.is_active = true OR stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Store owners can manage products"
    ON public.products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = products.store_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Anyone can view product images"
    ON public.product_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_images.product_id
            AND (stores.is_active = true OR stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Store owners can manage product images"
    ON public.product_images FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_images.product_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

-- PRODUCT VARIANTS POLICIES
CREATE POLICY "Anyone can view product variants"
    ON public.product_variants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_variants.product_id
            AND (stores.is_active = true OR stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Store owners can manage product variants"
    ON public.product_variants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.stores ON stores.id = products.store_id
            WHERE products.id = product_variants.product_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

-- ORDERS & ORDER ITEMS POLICIES
-- Customers can insert new orders anonymously or authenticated
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Store owners can view orders for their stores"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = orders.store_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Store owners can update order status"
    ON public.orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stores
            WHERE stores.id = orders.store_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

CREATE POLICY "Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Store owners can view order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            JOIN public.stores ON stores.id = orders.store_id
            WHERE orders.id = order_items.order_id
            AND (stores.owner_id = auth.uid() OR public.is_super_admin())
        )
    );

-- ==============================================================================
-- 12. STORAGE BUCKET CONFIGURATION (Run in Supabase Dashboard SQL)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view public store assets
CREATE POLICY "Store assets are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'store-assets');

-- Storage RLS: Authenticated users can upload to store-assets
CREATE POLICY "Authenticated users can upload store assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');

-- Storage RLS: Users can update and delete their uploaded store assets
CREATE POLICY "Users can manage their own uploads"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'store-assets' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'store-assets' AND auth.uid() = owner);
