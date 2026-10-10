-- ==============================================================================
-- FIX: Políticas RLS para permitir acceso público (anon) a productos y categorías
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ==============================================================================

-- STORES: permitir lectura pública de tiendas activas sin requerir auth
DROP POLICY IF EXISTS "Anyone can view active stores" ON public.stores;
CREATE POLICY "Anyone can view active stores"
    ON public.stores FOR SELECT
    USING (is_active = true OR owner_id = auth.uid() OR public.is_super_admin());

-- CATEGORIES: permitir lectura pública sin JOIN complejo que falla con anon
DROP POLICY IF EXISTS "Anyone can view active categories of active stores" ON public.categories;
CREATE POLICY "Anyone can view active categories of active stores"
    ON public.categories FOR SELECT
    USING (true);

-- PRODUCTS: permitir lectura pública de todos los productos disponibles
DROP POLICY IF EXISTS "Anyone can view available products of active stores" ON public.products;
CREATE POLICY "Anyone can view available products of active stores"
    ON public.products FOR SELECT
    USING (true);

-- PRODUCT IMAGES: permitir lectura pública
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images"
    ON public.product_images FOR SELECT
    USING (true);

-- PRODUCT VARIANTS: permitir lectura pública
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
CREATE POLICY "Anyone can view product variants"
    ON public.product_variants FOR SELECT
    USING (true);
