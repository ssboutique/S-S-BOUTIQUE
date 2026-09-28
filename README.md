# S&S BOUTIQUE — Plataforma Multi-Tienda Digital SaaS

Plataforma web moderna, rápida y escalable para tiendas digitales con pedidos automatizados por WhatsApp, arquitectura multi-inquilino y panel de administración responsive.

Desarrollado con:
- **Frontend:** Vue 3 + TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS (diseño limpio y minimalista sin emojis)
- **Backend & Base de Datos:** Supabase (PostgreSQL + Row Level Security)
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage (`store-assets`)
- **PWA:** vite-plugin-pwa
- **Despliegue:** Preparado para Vercel (`vercel.json`)

---

## Características Principales

1. **Catálogo Exclusivo:**
   - Alta moda, calzado de autor, marroquinería y perfumería.
   - Variantes dinámicas (Tallas, Colores, Capacidad, etc.).
   - Cálculo automático de descuentos (% OFF).
   - Selector interactivo de imágenes y galería.

2. **Carrito Persistente & Checkout sin Registro:**
   - Guarda los artículos localmente por tienda (`vendpro_cart_ss-boutique`).
   - Sin pasarelas de pago ni formularios engorrosos.
   - Generación de mensaje limpio y estructurado para WhatsApp.

3. **Panel Administrativo (Móvil a PC):**
   - Barra de navegación inferior nativa en smartphones.
   - Barra lateral colapsable en tablets y computadores.
   - CRUD completo de productos y categorías.
   - Editor visual de apariencia (logo, portada, paleta de colores).
   - Generador y botón de 1-clic para copiar y compartir el enlace público de la tienda.
   - Auditoría de pedidos recibidos por WhatsApp.

4. **Seguridad Multi-Tenant:**
   - Políticas RLS (Row Level Security) en PostgreSQL para aislamiento total entre tiendas.
   - Variables de entorno protegidas mediante `.gitignore`.

---

## Instalación y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## Configuración de Supabase (Opcional)

La plataforma funciona inmediatamente en modo de demostración local reactivo sin configuración previa. Para conectar tu propio proyecto de Supabase:

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia tus claves en un archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```
3. En el **SQL Editor** de Supabase, ejecuta los scripts:
   - `supabase/schema.sql` (Crea las tablas, funciones y políticas de seguridad RLS).
   - `supabase/seed.sql` (Opcional: inyecta los datos iniciales de S&S BOUTIQUE).

---

## Despliegue en Vercel

El repositorio incluye `vercel.json` con la configuración de rewrites para Single Page Applications (SPA).

1. Sube tu código a GitHub o GitLab.
2. Importa el repositorio en Vercel.
3. Configura el Framework Preset como **Vite**.
4. ¡Listo para producción!

---

Desarrollado por Edisson Pinza
