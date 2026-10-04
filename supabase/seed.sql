-- ==============================================================================
-- S&S BOUTIQUE Seed Data Script
-- Haute Couture, Luxury Footwear & Designer Leather Goods
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
    v_owner_id UUID;
    v_store_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_cat_moda UUID := 'b0000000-0000-0000-0000-000000000001';
    v_cat_calzado UUID := 'b0000000-0000-0000-0000-000000000002';
    v_cat_bolsos UUID := 'b0000000-0000-0000-0000-000000000003';
    v_cat_perfumeria UUID := 'b0000000-0000-0000-0000-000000000004';
    
    v_prod_camisa UUID := 'c0000000-0000-0000-0000-000000000001';
    v_prod_zapatos UUID := 'c0000000-0000-0000-0000-000000000002';
    v_prod_bolso UUID := 'c0000000-0000-0000-0000-000000000003';
    v_prod_perfume UUID := 'c0000000-0000-0000-0000-000000000004';
    v_prod_reloj UUID := 'c0000000-0000-0000-0000-000000000005';
BEGIN
    -- 2. Find existing user in auth.users or create official Admin user
    SELECT id INTO v_owner_id FROM auth.users WHERE email = 'admin@ssboutique.com' LIMIT 1;

    IF v_owner_id IS NULL THEN
        -- If no admin user exists, check if any authenticated user exists in auth.users
        SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
    END IF;

    -- If auth.users is completely empty, insert official Administrator into auth.users first
    IF v_owner_id IS NULL THEN
        v_owner_id := 'd0000000-0000-0000-0000-000000000001'::uuid;

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_owner_id,
            'authenticated',
            'authenticated',
            'admin@ssboutique.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Administrador","role":"store_owner"}'::jsonb,
            NOW(),
            NOW()
        );

        -- Also insert identity record so Supabase Auth email login works immediately
        BEGIN
            INSERT INTO auth.identities (
                id,
                user_id,
                identity_data,
                provider,
                provider_id,
                last_sign_in_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                v_owner_id,
                format('{"sub":"%s","email":"%s"}', v_owner_id::text, 'admin@ssboutique.com')::jsonb,
                'email',
                v_owner_id::text,
                NOW(),
                NOW(),
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- In case auth.identities structure differs in specific Supabase versions
            NULL;
        END;
    END IF;

    -- Ensure profile exists in public.profiles linked to auth.users(id)
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (v_owner_id, 'admin@ssboutique.com', 'Administrador', 'store_owner')
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'Administrador',
        role = 'store_owner';

    -- 3. Create or Update S&S BOUTIQUE
    INSERT INTO public.stores (
        id, owner_id, name, slug, description, logo_url, banner_url,
        whatsapp_number, phone, address, city, currency, is_active,
        instagram_url, business_hours, theme_settings
    ) VALUES (
        v_store_id,
        v_owner_id,
        'S&S BOUTIQUE',
        'ss-boutique',
        'Colecciones exclusivas de alta moda, calzado de autor y accesorios de diseño. Calidad superior, cortes impecables y atención personalizada.',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        '573001234567',
        '+57 300 123 4567',
        'Calle 82 # 12-45, El Retiro',
        'Bogotá, Colombia',
        'COP',
        true,
        'https://instagram.com/ssboutique',
        'Lunes a Sábado: 10:00 AM - 7:00 PM',
        '{
            "primary_color": "#0f172a",
            "secondary_color": "#1e293b",
            "card_style": "rounded-2xl",
            "header_style": "modern",
            "font_family": "Plus Jakarta Sans",
            "about": {
                "title": "Nuestra Esencia & Legado",
                "subtitle": "Alta costura, calzado de autor y accesorios de diseño exclusivos.",
                "story": "En S&S BOUTIQUE creemos que el verdadero lujo radica en la distinción, los acabados impecables y la autenticidad. Nacimos con la visión de acercar piezas exclusivas, materiales de la más alta calidad y un servicio totalmente personalizado.",
                "founded_year": "2024",
                "tagline": "Donde la exclusividad y el buen gusto se convierten en tu sello personal.",
                "gallery_photos": [
                    { "id": "1", "url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&h=700&fit=crop", "caption": "Showroom Principal" },
                    { "id": "2", "url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&h=700&fit=crop", "caption": "Colección Alta Costura" },
                    { "id": "3", "url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1000&h=700&fit=crop", "caption": "Calzado de Autor" },
                    { "id": "4", "url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&h=700&fit=crop", "caption": "Bolsos & Marroquinería" }
                ],
                "pillars": [
                    { "title": "Exclusividad & Calidad", "description": "Seleccionamos minuciosamente cada prenda y calzado con materiales premium y confección de alto nivel." },
                    { "title": "Atención VIP Personalizada", "description": "Asesoría de imagen individual y soporte continuo vía WhatsApp para cada uno de tus pedidos." },
                    { "title": "Garantía & Envíos Seguros", "description": "Empaque de lujo y envíos asegurados a todo el país con número de guía en tiempo real." }
                ]
            }
        }'::jsonb
    ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        owner_id = EXCLUDED.owner_id;

    -- 4. Categories
    INSERT INTO public.categories (id, store_id, name, slug, description, order_index) VALUES
    (v_cat_moda, v_store_id, 'Alta Moda & Vestuario', 'alta-moda-y-vestuario', 'Prendas confeccionadas con textiles nobles y patrones contemporáneos', 1),
    (v_cat_calzado, v_store_id, 'Calzado de Autor', 'calzado-de-autor', 'Zapatos y sneakers artesanales en 100% cuero genuino', 2),
    (v_cat_bolsos, v_store_id, 'Marroquinería & Bolsos', 'marroquineria-y-bolsos', 'Bolsos, carteras y accesorios de cuero con acabados premium', 3),
    (v_cat_perfumeria, v_store_id, 'Perfumería & Relojería', 'perfumeria-y-relojeria', 'Fragancias nicho y piezas de precisión', 4)
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- 5. Products
    INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, original_price, sku, stock, is_available, is_featured, order_index)
    VALUES (v_prod_camisa, v_store_id, v_cat_moda, 'Camisa Lino Italiano Oversize', 'camisa-lino-italiano-oversize', 'Confeccionada en 100% lino de origen europeo de textura fluida y transpirable. Botones en nácar legítimo y corte contemporáneo relajado.', 180000, 240000, 'SS-LIN-01', 25, true, true, 1)
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, original_price, sku, stock, is_available, is_featured, order_index)
    VALUES (v_prod_zapatos, v_store_id, v_cat_calzado, 'Sneakers Minimalistas en Cuero Nobuk', 'sneakers-cuero-nobuk', 'Calzado elaborado a mano en cuero de textura nobuk aterciopelada, plantilla ergonómica viscoelástica y suela cosida de alta durabilidad.', 320000, 390000, 'SS-ZAP-02', 14, true, true, 2)
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, original_price, sku, stock, is_available, is_featured, order_index)
    VALUES (v_prod_bolso, v_store_id, v_cat_bolsos, 'Bolso Tote Estructurado en Cuero Graneado', 'bolso-tote-cuero-graneado', 'Diseño sobrio y espacioso elaborado en cuero vacuno con forro en gamuza natural. Herrajes metálicos pulidos en tono oro mate y compartimento acolchado.', 450000, 520000, 'SS-BOL-03', 10, true, true, 3)
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, original_price, sku, stock, is_available, is_featured, order_index)
    VALUES (v_prod_perfume, v_store_id, v_cat_perfumeria, 'Perfume Signature Extrait 100ml', 'perfume-signature-extrait', 'Concentración extrait de parfum con fijación superior a 14 horas. Notas maestras de cardamomo guatemalteco, madera de agar y ámbar negro.', 260000, 310000, 'SS-PER-04', 18, true, false, 4)
    ON CONFLICT (store_id, slug) DO NOTHING;

    INSERT INTO public.products (id, store_id, category_id, name, slug, description, price, original_price, sku, stock, is_available, is_featured, order_index)
    VALUES (v_prod_reloj, v_store_id, v_cat_perfumeria, 'Reloj Cronógrafo Acero Cepillado', 'reloj-cronografo-acero-cepillado', 'Caja de 41mm en acero quirúrgico 316L, cristal de zafiro antirreflejos, bisel cerámico y correa en piel genuina de curtición vegetal.', 580000, 690000, 'SS-REL-05', 8, true, false, 5)
    ON CONFLICT (store_id, slug) DO NOTHING;

    -- 6. Images
    INSERT INTO public.product_images (product_id, image_url, is_primary, order_index) VALUES
    (v_prod_camisa, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop', true, 1),
    (v_prod_camisa, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop', false, 2),
    (v_prod_zapatos, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop', true, 1),
    (v_prod_zapatos, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop', false, 2),
    (v_prod_bolso, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop', true, 1),
    (v_prod_perfume, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop', true, 1),
    (v_prod_reloj, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop', true, 1)
    ON CONFLICT DO NOTHING;

    -- 7. Variants
    INSERT INTO public.product_variants (product_id, variant_type, variant_value, price_modifier, stock, is_available, order_index) VALUES
    (v_prod_camisa, 'Talla', 'S', 0, 8, true, 1),
    (v_prod_camisa, 'Talla', 'M', 0, 12, true, 2),
    (v_prod_camisa, 'Talla', 'L', 0, 5, true, 3),
    (v_prod_camisa, 'Color', 'Blanco Crudo', 0, 15, true, 4),
    (v_prod_camisa, 'Color', 'Arena Silvestre', 0, 10, true, 5),
    (v_prod_zapatos, 'Talla (EU)', '39', 0, 3, true, 1),
    (v_prod_zapatos, 'Talla (EU)', '40', 0, 4, true, 2),
    (v_prod_zapatos, 'Talla (EU)', '41', 0, 4, true, 3),
    (v_prod_zapatos, 'Talla (EU)', '42', 0, 3, true, 4),
    (v_prod_bolso, 'Color', 'Negro Ébano', 0, 5, true, 1),
    (v_prod_bolso, 'Color', 'Cognac Noble', 0, 5, true, 2),
    (v_prod_reloj, 'Dial', 'Negro Onyx', 0, 4, true, 1),
    (v_prod_reloj, 'Dial', 'Blanco Plata', 0, 4, true, 2)
    ON CONFLICT DO NOTHING;

END $$;
