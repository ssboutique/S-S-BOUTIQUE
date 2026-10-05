# Diagnóstico Completo del Proyecto — VendPro / S&S BOUTIQUE

**Fecha:** 2025  
**Alcance:** e:\Pagina-Esma  
**Stack:** Vue 3 + TypeScript + Tailwind CSS + Pinia + Supabase + Vite + PWA

---

## Resumen Ejecutivo

El proyecto es una tienda online completa con panel de administración tipo SaaS, bien estructurada y con UX cuidada. La mayor fortaleza es su sistema de doble modo (Supabase real / demo con localStorage), que permite operar sin backend. Sin embargo, la aplicación contiene **vulnerabilidades de seguridad críticas** (credenciales hardcodeadas en código fuente, auto-login sin autenticación real), código duplicado significativo entre vistas admin, ausencia total de tests, indicadores de "prueba social" completamente falsos/simulados que representan un riesgo legal de engaño al consumidor, y el PWA usa imágenes de Unsplash externas como iconos. El código TypeScript es generalmente limpio pero hay uso excesivo de `any`, manejo de errores inconsistente, y varias funcionalidades visualmente completas pero sin backend real (pedidos no se actualizan de estado, órdenes no tienen acciones). Con las mejoras correctas, el proyecto tiene bases sólidas para producción.

**Puntuación general: 6.5/10**

---

## 🔴 Bugs y Vulnerabilidades Críticas

### 1. Credenciales de admin hardcodeadas en código fuente público
**Archivo:** `src/services/authService.ts` (líneas 12–16)

```typescript
const ADMIN_CREDENTIALS = {
  email: 'admin@ssboutique.com',
  password: 'admin123',
};
```

El email y contraseña están en código fuente JavaScript que se entrega al navegador. Cualquier usuario puede ver las credenciales con DevTools. Adicionalmente, la LoginView.vue tiene un botón "Completar" que autocompleta esas credenciales ante el usuario:

```typescript
@click="email = 'admin@ssboutique.com'; password = 'admin123'"
```

**Impacto:** Acceso al panel de administración por cualquier persona que visite la página. Crítico en producción.

---

### 2. Auto-login sin autenticación real como mecanismo por defecto
**Archivo:** `src/services/authService.ts` — método `getCurrentProfile()` (líneas ~160–180)

Cuando no hay sesión activa de Supabase y no hay sesión local guardada, el sistema devuelve automáticamente `DEMO_PROFILE` y lo guarda en localStorage, efectivamente autenticando a cualquier visitante como administrador:

```typescript
// No Supabase session and no local session – auto-login as admin owner
localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(DEMO_PROFILE));
return DEMO_PROFILE;
```

**Impacto:** En modo demo (sin Supabase configurado), cualquier visitante que navegue a `/admin` queda "autenticado" automáticamente. Si el store Supabase falla temporalmente, un usuario no autenticado podría acceder al panel.

---

### 3. Router guard con condición lógica invertida (bug de UX)
**Archivo:** `src/router/index.ts` (líneas ~120–130)

```typescript
if (authStore.isLoading) {
  await authStore.initAuth();
}
```

La guardia solo llama `initAuth()` si `isLoading` es `true`. El estado inicial de `isLoading` en el store de auth es `true` (línea 11 de `stores/auth.ts`), por lo que en el primer acceso sí funciona. Sin embargo, si el store ya está inicializado y `isLoading` vuelve a ser `false`, una recarga de sesión expirada no relanzará `initAuth()`. Además, no se espera a que la inicialización termine antes de evaluar `isAuthenticated`, creando una condición de carrera.

---

### 4. "Prueba social" completamente fabricada (riesgo legal)
**Archivos:** `src/components/store/LiveVisitorsBadge.vue`, `src/components/store/LiveOrderToast.vue`

El contador de visitantes activos fluctúa aleatoriamente entre 9 y 28. Los pedidos del día se calculan con `12 + Math.floor((new Date().getHours() / 24) * 15)`. Las notificaciones toast de "Valentina en Bogotá compró X" son 100% inventadas con listas de nombres y productos ficticios.

```typescript
const sampleNames = ['Valentina', 'Camila', 'Sofía', ...];
const sampleProducts = ['Vestido Gala Seda Italiana', ...];
```

**Impacto:** En muchas jurisdicciones (incluyendo Colombia con la Ley 1480), generar indicadores de demanda falsos para influir en la decisión de compra es publicidad engañosa. Es un riesgo legal serio para el dueño del negocio.

---

### 5. PWA con iconos externos de Unsplash (fallará en producción)
**Archivo:** `vite.config.ts`

```typescript
icons: [
  { src: 'https://images.unsplash.com/photo-1542291026...?w=192', sizes: '192x192', type: 'image/png' },
]
```

Unsplash no sirve imágenes como `image/png` y los navegadores no los aceptarán como iconos PWA válidos. Además, el MIME type declarado (`image/png`) no coincide con lo que devuelve Unsplash. La app no será instalable como PWA correctamente.

---

### 6. Datos de imagen base64 en localStorage (cuota excedida)
**Archivo:** `src/services/storageService.ts` — fallback demo mode

En modo demo, las imágenes subidas se convierten a Base64 y se guardan en localStorage como parte de los productos. Una imagen de producto de 1MB comprimida a WebP puede ser ~200–400KB en Base64. Con varios productos y múltiples imágenes, localStorage (límite ~5-10MB) se llena rápidamente causando errores silenciosos en el catch `{}`.

---

## 🟠 Mejoras de Alta Prioridad (Impacto alto, esfuerzo medio)

### 7. Duplicación masiva de código de subida de imágenes (logo + banner)
**Archivos afectados:** `AppearanceView.vue`, `StoreInfoView.vue`

Ambas vistas implementan de forma idéntica las funciones `handleLogoUpload` y `handleBannerUpload`, los estados `isUploadingLogo`, `isUploadingBanner`, y los watchers sobre `adminStore.currentStore`. Esto significa que cambiar la lógica de upload requiere editar dos archivos. Debería extraerse a un composable `useStoreAssets()` o componente `ImageUploader.vue`.

---

### 8. Sin paginación ni virtualización en listas de productos
**Archivos:** `src/views/admin/ProductsView.vue`, `src/stores/store.ts`

Todos los productos se cargan y renderizan en el DOM de una sola vez. Con catálogos grandes (100+ productos), esto causará:
- Tiempos de carga lentos
- Layouts que congestan el hilo principal
- Consultas Supabase sin `limit`/`offset`

El store solo hace `getProducts(storeId, undefined, true)` sin ningún control de paginación.

---

### 9. Ausencia total de tests (0% cobertura)
No hay ningún archivo `.spec.ts`, `.test.ts` ni configuración de testing (Vitest, Jest, etc.). Para un proyecto que maneja pedidos y datos de clientes, esto es un riesgo alto. Los servicios con lógica dual (Supabase / localStorage), las utilidades de formateo de moneda y WhatsApp, y las guards del router son candidatos inmediatos para unit tests.

---

### 10. Stock no se valida en el carrito ni en el checkout
**Archivos:** `src/stores/cart.ts`, `src/components/cart/CheckoutModal.vue`, `src/components/store/ProductModal.vue`

El modal de producto permite `quantity++` sin límite (`@click="quantity++"`), sin verificar el campo `product.stock`. La función `addItem` no valida stock. Es posible solicitar 100 unidades de un producto con `stock: 5`. El stock no se decrementa en ningún lugar tras una orden.

---

### 11. Órdenes solo tienen estado `whatsapp_sent` — sin flujo de gestión real
**Archivo:** `src/views/admin/OrdersView.vue`, `src/types/database.ts`

El tipo `Order.status` tiene 4 valores (`whatsapp_sent`, `confirmed`, `completed`, `cancelled`), pero la vista de órdenes solo muestra "WhatsApp Enviado" en todas. No hay botones para confirmar, completar o cancelar órdenes. El panel de administración muestra la métrica "Pedidos Generados" pero sin acciones sobre ellos hace el módulo prácticamente inútil para la operación real del negocio.

---

### 12. Tailwind config sobreescribe colores base de slate incorrectamente
**Archivo:** `tailwind.config.js`

```javascript
slate: {
  850: '#0a0a0a',
  900: '#050505',   // Tailwind nativo: #0f172a
  950: '#000000',   // Tailwind nativo: #020617
}
```

Se sobreescriben los colores estándar de Tailwind `slate-900` y `slate-950` con negro puro, mientras que el proyecto usa `dark:bg-slate-900` extensivamente. Esto hace que el modo oscuro tenga fondos completamente negros en lugar del slate oscuro esperado, y puede causar inconsistencias visuales difíciles de depurar ya que clases como `text-slate-900` en modo light también se ven afectadas.

---

## 🟡 Mejoras de Media Prioridad

### 13. `any` excesivo en TypeScript
En varios archivos se usa `err: any`, `(error as any).status`, `(data as any)`, y funciones con parámetros sin tipo. Ejemplos:
- `authService.ts`: `(error as any).status`
- `admin.ts`: múltiples bloques `catch (e: any)`
- `productService.ts`: `(productData as any).id`

Con `"strict": true` en tsconfig, estos deberían tipificarse correctamente.

---

### 14. Ausencia de variables de entorno documentadas
No hay archivo `.env.example` ni documentación de qué variables se necesitan. El proyecto funciona en modo demo cuando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` no están presentes, pero un nuevo developer o un despliegue en CI/CD no sabe qué configurar.

---

### 15. Imágenes de Unsplash en datos demo sin fallback local
**Archivo:** `src/services/demoData.ts`

Todas las imágenes de productos demo son URLs externas de Unsplash. Si Unsplash no está disponible (CDN caído, bloqueado, sin conexión), la demo se verá rota. Se recomiendan placeholders SVG locales o imágenes en `/public/demo/`.

---

### 16. `document.title` y `meta[name="description"]` manipulados manualmente
**Archivo:** `src/views/store/StorefrontView.vue`

```typescript
document.title = `${storeStore.store.name} - Tienda Oficial`;
```

No hay manejo centralizado de SEO (sin `vue-meta` o `@vueuse/head`). En modo SPA puro no hay SSR, por lo que los crawlers de motores de búsqueda no ven el título dinámico. Para un e-commerce, el SEO es crítico.

---

### 17. Guardia de SuperAdmin sin verificación en el backend
**Archivo:** `src/router/index.ts`

```typescript
if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
  next('/admin');
  return;
}
```

La verificación de `isSuperAdmin` es solo client-side, basada en `profile.role`. En modo demo, si alguien edita localStorage para poner `"role": "super_admin"`, accede a la vista de Super Admin sin restricción server-side.

---

### 18. `watch` del router no llama a `initStorefront` con `{ immediate: true }`
**Archivo:** `src/views/store/StorefrontView.vue`

El watcher sobre `route.params.slug` y el `onMounted` hacen la misma llamada a `initStorefront()`. Esto significa que en la primera carga se ejecuta dos veces (onMounted + watch que se dispara en el mount). Debería usarse solo el watcher con `{ immediate: true }`, o eliminar el onMounted.

---

### 19. `CartTotals.total` es igual a `subtotal` (descuento no se aplica al total)
**Archivo:** `src/stores/cart.ts`

```typescript
return {
  subtotal,
  totalDiscount,
  total: subtotal,  // total === subtotal, el descuento no se resta
  itemCount,
};
```

El campo `totalDiscount` se calcula correctamente pero nunca se descuenta del `total`. El checkout siempre cobra el precio con descuento por producto (ya que `item.price` es el precio final), pero la estructura de `CartTotals` es confusa y `totalDiscount` mostrado en el resumen podría llevar a cálculos incorrectos si se expande la lógica.

---

### 20. Múltiples componentes con cleanup de event listeners redundante
**Archivos:** `LiveOrderToast.vue`, `CheckoutModal.vue`, `ProductModal.vue`

Todos añaden `window.addEventListener('keydown', ...)` y los limpian en `onUnmounted`. Sin embargo, `LiveOrderToast.vue` intenta hacer cleanup en el retorno de `onMounted` (patrón React) en lugar de en `onUnmounted`, lo que en Vue no funciona correctamente:

```typescript
onMounted(() => {
  // ...
  return () => {  // ← Este return es ignorado por Vue
    clearTimeout(initialTimeout);
    clearInterval(timer);
    window.removeEventListener(...);
  };
});
```

El `clearTimeout` del timeout inicial y el `clearInterval` nunca se ejecutan en `LiveOrderToast`.

---

## ⚡ Quick Wins (Cambios pequeños con buen impacto)

### QW1. Eliminar el botón "Completar" con credenciales en LoginView
**Archivo:** `src/views/auth/LoginView.vue`  
Eliminar el bloque del botón que autocompleta `admin@ssboutique.com` / `admin123`. Es el cambio de 5 líneas con mayor impacto en seguridad visual.

### QW2. Mover `ADMIN_CREDENTIALS` a variables de entorno
**Archivos:** `src/services/authService.ts`  
Reemplazar las credenciales hardcodeadas por:
```typescript
const ADMIN_CREDENTIALS = {
  email: import.meta.env.VITE_ADMIN_EMAIL || '',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};
```
Sin las env vars, el fallback local simplemente no funciona.

### QW3. Corregir el bug de cleanup en `LiveOrderToast.vue`
**Archivo:** `src/components/store/LiveOrderToast.vue`  
Mover el `clearTimeout` y `clearInterval` al hook `onUnmounted`:
```typescript
onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener('store-whatsapp-order', onUserWhatsAppOrder);
});
```

### QW4. Agregar `loading="lazy"` a imágenes en tablas del admin
**Archivos:** `DashboardView.vue`, `ProductsView.vue`  
Las `<img>` en las tablas no tienen `loading="lazy"`. Con catálogos grandes, cargarán todas las miniaturas de inmediato.

### QW5. Agregar `alt` text a imágenes de producto en tablas del admin
**Archivo:** `DashboardView.vue`, `ProductsView.vue`  
```html
<img :src="..." class="..." />  <!-- Sin alt -->
```
Agregar `:alt="prod.name"` para accesibilidad y SEO.

### QW6. Crear archivo `.env.example`
Documentar:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_ADMIN_EMAIL=
VITE_ADMIN_PASSWORD=
```

### QW7. Arreglar los iconos PWA con archivos locales
**Archivo:** `vite.config.ts`  
Reemplazar las URLs de Unsplash con iconos locales en `/public/icons/icon-192.png` y `icon-512.png`.

### QW8. Corregir la doble inicialización en StorefrontView
**Archivo:** `src/views/store/StorefrontView.vue`  
Reemplazar el `onMounted` + `watch` separados por un único watcher con `{ immediate: true }`:
```typescript
watch(() => route.params.slug, () => { initStorefront(); }, { immediate: true });
```

### QW9. Corregir el override de colores slate en Tailwind config
**Archivo:** `tailwind.config.js`  
Agregar el prefijo `850` como nuevo tono pero no sobreescribir `900` y `950`:
```javascript
slate: {
  850: '#0f172a',  // Nuevo tono intermedio, sin sobreescribir 900/950
}
```

### QW10. Limitar `quantity++` con el stock disponible en ProductModal
**Archivo:** `src/components/store/ProductModal.vue`  
```html
@click="if (product.stock === null || quantity < product.stock) quantity++"
```

---

## Análisis de Rendimiento

| Área | Estado | Detalle |
|---|---|---|
| Code splitting | ✅ Bueno | Todas las rutas usan `import()` dinámico |
| Lazy loading imágenes (storefront) | ✅ Bueno | `loading="lazy"` en ProductCard |
| Lazy loading imágenes (admin) | ❌ Falta | Sin `loading="lazy"` en tablas |
| Paginación de productos | ❌ Falta | Todo se carga de una vez |
| Compresión de imágenes en upload | ✅ Bueno | storageService comprime a WebP |
| Cache de datos | ⚠️ Parcial | Solo localStorage, sin cache de tiempo |
| Bundle size | ✅ Aceptable | Pocas dependencias, sin librerías pesadas |
| Animaciones CSS | ✅ Bueno | Solo Tailwind, sin librerías de animación |
| Concurrencia de carga | ✅ Bueno | `Promise.all` para cats + products |

---

## Análisis de Accesibilidad

| Elemento | Estado | Detalle |
|---|---|---|
| ARIA en modales | ✅ Bueno | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Labels en formularios | ✅ Bueno | `for`/`id` en campos de checkout |
| `aria-label` en botones de icono | ✅ Parcial | Mayoría los tiene, tablas de admin no |
| Alt text en imágenes | ⚠️ Parcial | Falta en tablas del admin |
| Contraste de colores | ⚠️ Revisar | Texto `text-[10px]` y `text-[11px]` frecuentes |
| Focus management en modales | ⚠️ Parcial | No hay trap de foco al abrir modales |
| Navegación por teclado | ⚠️ Parcial | Escape funciona, Tab no está controlado en modales |
| Roles semánticos | ✅ Bueno | `<header>`, `<main>`, `<article>`, `<section>` |

---

## Calidad de Código TypeScript

| Criterio | Puntuación | Observación |
|---|---|---|
| Tipado de stores (Pinia) | 8/10 | Bien tipado con genéricos de ref |
| Tipado de servicios | 6/10 | `any` en catches y casts frecuentes |
| Tipado de componentes | 8/10 | `defineProps<{}>` y `defineEmits<{}>` bien usados |
| Interfaces de dominio | 9/10 | `database.ts` muy completo y bien organizado |
| Manejo de errores | 5/10 | Inconsistente: algunos re-lanzan, otros tragan silenciosamente |
| Composables | 7/10 | `useTheme` bien hecho, podría haber más |
| Cobertura de null checks | 7/10 | Optional chaining usado, pero hay lugares sin guard |

---

## Funcionalidades Incompletas

| Feature | Estado | Descripción |
|---|---|---|
| Gestión de estado de órdenes | 🔶 Parcial | Sin acciones para confirmar/cancelar órdenes |
| Notificaciones en tiempo real | ❌ Simulado | Los toasts de actividad son completamente falsos |
| Dominio personalizado | 🔶 UI Only | La UI muestra cómo configurar el DNS pero no hay proxy/verificación real |
| Multi-tienda | 🔶 Parcial | El código soporta múltiples tiendas pero la UI solo muestra una |
| Búsqueda avanzada | ❌ Falta | Solo búsqueda por nombre, sin filtros de precio/stock/variantes |
| Reportes y analytics | ❌ Falta | Panel tiene métricas básicas pero sin gráficas históricas |
| Recuperación de contraseña | ❌ Falta | No hay flujo de "Olvidé mi contraseña" |
| Inventario por variante | 🔶 Parcial | `ProductVariant.stock` existe en el tipo pero no se usa en UI |

---

## Estado General del Proyecto: 6.5/10

**Justificación detallada:**

**Puntos fuertes (+):**
- Arquitectura bien organizada: separación clara entre stores, services, views, components
- Sistema de doble modo (Supabase/demo) elegante y bien implementado
- UX del storefront pulida y visualmente atractiva
- Componentes bien encapsulados con props/emits tipados
- Sistema de cart con persistencia en localStorage funcional
- Servicio de WhatsApp con formato de mensaje bien diseñado
- Compresión de imágenes antes de upload (WebP)
- PWA configurado (aunque con bugs en los iconos)
- Dark mode implementado correctamente

**Puntos débiles (-):**
- Credenciales hardcodeadas en código fuente: **inaceptable en producción**
- Auto-login sin autenticación real como comportamiento por defecto
- Indicadores de demanda 100% falsos (riesgo legal)
- 0% cobertura de tests
- Código duplicado en vistas admin
- Stock no validado en el proceso de compra
- Módulo de órdenes sin acciones reales
- Iconos PWA inválidos
- Colores Tailwind sobreescritos incorrectamente

---

## Recomendaciones de Próximos Pasos (Prioridad)

**Inmediato (antes de ir a producción):**
1. Eliminar credenciales hardcodeadas y el botón "Completar" en LoginView
2. Eliminar el auto-login como fallback por defecto
3. Reemplazar la "prueba social" falsa por datos reales o eliminarla
4. Arreglar los iconos PWA con archivos locales
5. Corregir el override de `slate-900`/`slate-950` en Tailwind config

**Corto plazo (Sprint 1-2):**
6. Agregar validación de stock en carrito y ProductModal
7. Implementar acciones reales en la vista de órdenes (confirmar, cancelar)
8. Extraer duplicación de código de upload a composable/componente compartido
9. Crear `.env.example` y documentar configuración
10. Implementar paginación básica en listado de productos admin

**Mediano plazo:**
11. Agregar Vitest y escribir tests para servicios y stores críticos
12. Implementar gestión de focus en modales para accesibilidad
13. Agregar `vue-head` o `@vueuse/head` para SEO dinámico
14. Reemplazar imágenes Unsplash en demoData con placeholders locales SVG
15. Completar el flujo de inventario por variante
