# Implementation Plan — S&S Boutique Improvements

> Build command: `npm run build` (Vite)
> Type-check command: `npm run type-check` (vue-tsc)
> No test framework present — verify with build + type-check after each item.

---

## Priority Order

1. Security fix (auth bypass removal) — highest risk, must go first
2. Tailwind contrast fix — cosmetic but affects every dark-mode screen
3. Bug cleanup — LiveOrderToast timer leak
4. Social proof — remove fake counts / fake toasts
5. Stock validation — cart correctness
6. Double init — StorefrontView lifecycle bug
7. Accessibility — img alt + lazy
8. .env.example — documentation

---

- [ ] 1. **SECURITY — Remove hardcoded credentials and bypass paths** (`src/services/authService.ts` + `src/views/auth/LoginView.vue`)

  **authService.ts — what to delete / change:**

  a) Delete the `ADMIN_CREDENTIALS` constant (lines 10-13).

  b) Delete the `validateLocalCredentials` function (lines 18-26).

  c) In `signIn()`, the current `if (error)` block falls through to `return this._localSignIn(email, password)` for ALL errors, including wrong-password (401). Replace the entire `if (error)` block inside `signIn()` with:
  ```ts
  if (error) {
    console.warn('[Auth] Supabase signIn error:', error.message);
    return { profile: null, error };
  }
  ```
  Remove the separate 500-check and the unconditional `_localSignIn` call that follows it. The `catch` block (genuine network failure) should only call `_localSignIn` when `import.meta.env.VITE_DEMO_MODE === 'true'`; otherwise return the caught error:
  ```ts
  } catch (err: any) {
    console.error('[Auth] Unexpected signIn error:', err);
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return this._localSignIn(email, password);
    }
    return { profile: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
  ```

  d) In `getCurrentProfile()`, remove the final auto-login fallback block (the last 3 lines inside the `if (isSupabaseConfigured && supabase)` branch):
  ```ts
  // REMOVE these 3 lines:
  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(DEMO_PROFILE));
  return DEMO_PROFILE;
  ```
  Replace them with simply:
  ```ts
  return null;
  ```
  Also update the Demo Mode branch at the bottom of `getCurrentProfile()` — replace the final `return DEMO_PROFILE` fallback with `return null` so unauthenticated users are not auto-logged-in even in demo mode.

  **LoginView.vue — what to delete:**

  Remove the entire "Quick Fill" `<div>` block (the div containing `Credenciales de Administrador`, the email hint text, and the `Completar` button). It spans from:
  ```html
  <!-- Quick Fill for Store Admin -->
  <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
  ```
  …to its closing `</div>`. Nothing else in the template changes.

  Also remove unused imports in LoginView.vue's `<script setup>`: `ShieldCheck` is still used (submit button icon), so keep it. No other imports need changing.

  **Files:** `src/services/authService.ts`, `src/views/auth/LoginView.vue`

  **Verify:** `npm run type-check` passes with no new errors. Manually confirm: navigating to `/admin` with no valid Supabase session redirects to `/login` instead of auto-logging in.

---

- [ ] 2. **TAILWIND — Restore native slate-900 and slate-950 values** (`tailwind.config.js`)

  In the `theme.extend.colors.slate` object, **keep** `slate-850: '#0a0a0a'` (custom shade used by DashboardView.vue's `dark:bg-slate-850`). **Delete** the two overrides:
  ```js
  // REMOVE:
  900: '#050505',
  950: '#000000',
  ```

  After the change the slate block should be:
  ```js
  slate: {
    850: '#0a0a0a',
  }
  ```

  Tailwind's native `slate-900` (#0f172a) and `slate-950` (#020617) will be restored automatically.

  **Files:** `tailwind.config.js`

  **Verify:** `npm run build` succeeds. Confirm in the built output (or `npm run dev`) that dark backgrounds are deep blue-grey, not pure black.

---

- [ ] 3. **BUG FIX — LiveOrderToast timer leak** (`src/components/store/LiveOrderToast.vue`)

  **Current problems:**
  - `onMounted` returns a cleanup function — Vue ignores it, so `initialTimeout` and `timer` are never cleared from that path.
  - `initialTimeout` is declared inside `onMounted` so the outer `onUnmounted` cannot reach it.
  - `onUnmounted` only clears `timer` and the event listener (missing `initialTimeout`).

  **Changes:**

  a) Declare `let initialTimeout: ReturnType<typeof setTimeout> | null = null;` at module scope alongside `let timer`.

  b) Rewrite `onMounted` — remove the `return () => { ... }` cleanup block entirely:
  ```ts
  onMounted(() => {
    window.addEventListener('store-whatsapp-order', onUserWhatsAppOrder);
    initialTimeout = setTimeout(() => {
      triggerRandomNotification();
    }, 4000);
    timer = setInterval(() => {
      triggerRandomNotification();
    }, 22000);
  });
  ```

  c) Rewrite `onUnmounted` to clear all three:
  ```ts
  onUnmounted(() => {
    if (initialTimeout) clearTimeout(initialTimeout);
    if (timer) clearInterval(timer);
    window.removeEventListener('store-whatsapp-order', onUserWhatsAppOrder);
  });
  ```

  **Note:** Item 4 (social proof) will subsequently remove the `initialTimeout` and `setInterval` calls from `onMounted`. Do item 3 first to fix the structural bug, then item 4 removes the fake-trigger logic.

  **Files:** `src/components/store/LiveOrderToast.vue`

  **Verify:** `npm run type-check` passes.

---

- [ ] 4. **SOCIAL PROOF — Remove fake visitor counts and fake toast triggers** (`src/components/store/LiveVisitorsBadge.vue`, `src/components/store/LiveOrderToast.vue`)

  **LiveVisitorsBadge.vue:**

  a) Remove the `activeVisitors` ref, `todayOrders` ref, `visitorInterval` variable, and `updateVisitorsCount` function from `<script setup>`.

  b) In `onMounted`, remove `visitorInterval = setInterval(updateVisitorsCount, 7000)` and the `todayOrders` seed line. Keep only:
  ```ts
  window.addEventListener('store-whatsapp-order', onStoreOrder);
  ```

  c) In `onUnmounted`, remove `if (visitorInterval) clearInterval(visitorInterval)`. Keep the event listener removal.

  d) In `<template>`, replace the "Live Visitors Counter" block (the left column with the pulsing dot and `{{ activeVisitors }} clientes explorando...`) with a static "Tienda activa" indicator:
  ```html
  <!-- Tienda activa indicator -->
  <div class="flex items-center gap-2.5">
    <span class="relative flex h-2.5 w-2.5">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
    </span>
    <div class="flex items-center gap-1.5 text-slate-300">
      <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
      <span class="font-semibold text-sm text-white">Tienda activa</span>
    </div>
  </div>
  ```
  Keep the `ShieldCheck` icon import (already imported). Remove `Eye`, `ShoppingBag`, and `Flame` imports if they are no longer used after this change.

  e) Remove the "Today's WhatsApp Orders" block (`{{ todayOrders }} pedidos VIP atendidos hoy`). Keep the "Trust Assurance" block unchanged.

  **LiveOrderToast.vue (after item 3 is done):**

  a) Remove the `sampleNames`, `sampleCities`, `sampleProducts` arrays and `getRandomItem` helper.

  b) Remove the `triggerRandomNotification` function entirely.

  c) In `onMounted`, remove the `initialTimeout` assignment and the `timer = setInterval(...)` assignment. `onMounted` should now only register the event listener:
  ```ts
  onMounted(() => {
    window.addEventListener('store-whatsapp-order', onUserWhatsAppOrder);
  });
  ```

  d) In `onUnmounted`, remove the `clearTimeout(initialTimeout)` and `clearInterval(timer)` calls (the vars no longer exist). Keep only:
  ```ts
  onUnmounted(() => {
    window.removeEventListener('store-whatsapp-order', onUserWhatsAppOrder);
  });
  ```

  e) Remove the `timer` and `initialTimeout` module-level variable declarations added in item 3 (they are no longer needed).

  f) The template is unchanged — it still shows `currentToast` when `isVisible` is true, driven entirely by real `store-whatsapp-order` events.

  **Files:** `src/components/store/LiveVisitorsBadge.vue`, `src/components/store/LiveOrderToast.vue`

  **Verify:** `npm run type-check` passes. In the browser, the badge shows the static "Tienda activa" indicator and the order toast no longer appears automatically; it only fires when a real WhatsApp order event is dispatched.

---

- [ ] 5. **STOCK VALIDATION — Enforce product.stock in modal and cart** (`src/components/store/ProductModal.vue`, `src/stores/cart.ts`)

  **ProductModal.vue:**

  Find the `+` quantity button (the one with `@click="quantity++"`). Replace it with a stock-aware version:
  ```html
  <!-- BEFORE: -->
  <button
    type="button"
    @click="quantity++"
    class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
    aria-label="Aumentar cantidad"
  >
    <Plus class="w-4 h-4" />
  </button>

  <!-- AFTER: -->
  <button
    type="button"
    @click="(!product.stock || quantity < product.stock) ? quantity++ : null"
    :disabled="!!(product.stock && quantity >= product.stock)"
    class="w-6 h-6 flex items-center justify-center transition-colors"
    :class="(product.stock && quantity >= product.stock)
      ? 'text-slate-300 cursor-not-allowed opacity-40'
      : 'text-slate-600 hover:text-slate-900'"
    aria-label="Aumentar cantidad"
  >
    <Plus class="w-4 h-4" />
  </button>
  ```

  **cart.ts — `addItem` function:**

  Replace the `if (existingIndex > -1)` branch:
  ```ts
  // BEFORE:
  if (existingIndex > -1) {
    items.value[existingIndex].quantity += quantity;
  } else {

  // AFTER:
  if (existingIndex > -1) {
    const maxQty = product.stock || Infinity;
    items.value[existingIndex].quantity = Math.min(
      items.value[existingIndex].quantity + quantity,
      maxQty
    );
  } else {
  ```

  And for the new-item push, replace:
  ```ts
  // BEFORE:
  items.value.push({
    ...
    quantity,
    ...
  });

  // AFTER:
  items.value.push({
    ...
    quantity: Math.min(quantity, product.stock || quantity),
    ...
  });
  ```

  **Files:** `src/components/store/ProductModal.vue`, `src/stores/cart.ts`

  **Verify:** `npm run type-check` passes. In the browser: open a product with `stock: 2`, confirm the `+` button is disabled after reaching 2, and adding to cart twice then trying again does not exceed 2.

---

- [ ] 6. **DOUBLE INIT — Fix StorefrontView lifecycle** (`src/views/store/StorefrontView.vue`)

  **Current state:**
  - `onMounted(() => { initStorefront(); })` — triggers on first mount.
  - `watch(() => route.params.slug, () => { initStorefront(); })` — triggers on slug changes but NOT on first mount (no `immediate: true`).
  - Together they call `initStorefront()` twice on initial load.

  **Changes:**

  a) Remove the entire `onMounted` block:
  ```ts
  // REMOVE:
  onMounted(() => {
    initStorefront();
  });
  ```

  b) Add `{ immediate: true }` to the watch so it fires on first mount as well as on slug changes:
  ```ts
  // BEFORE:
  watch(
    () => route.params.slug,
    () => {
      initStorefront();
    }
  );

  // AFTER:
  watch(
    () => route.params.slug,
    () => {
      initStorefront();
    },
    { immediate: true }
  );
  ```

  c) Remove `onMounted` from the Vue import (it is no longer used):
  ```ts
  // BEFORE:
  import { ref, onMounted, watch } from 'vue';

  // AFTER:
  import { ref, watch } from 'vue';
  ```

  **Files:** `src/views/store/StorefrontView.vue`

  **Verify:** `npm run type-check` passes. In the browser, navigating directly to `/tienda/ss-boutique` loads the store once (single network request to `loadStoreBySlug`). Navigating between different store slugs also triggers a fresh load.

---

- [ ] 7. **ACCESSIBILITY — Add `alt` and `loading="lazy"` to product images** (`src/views/admin/ProductsView.vue`, `src/views/admin/DashboardView.vue`)

  **ProductsView.vue** — find the `<img>` tag inside the product table row (the 12×12 thumbnail):
  ```html
  <!-- BEFORE: -->
  <img
    :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
    class="w-full h-full object-cover"
  />

  <!-- AFTER: -->
  <img
    :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
    :alt="prod.name"
    loading="lazy"
    class="w-full h-full object-cover"
  />
  ```

  **DashboardView.vue** — same fix for the 10×10 thumbnail in the recent products table:
  ```html
  <!-- BEFORE: -->
  <img
    :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
    class="w-full h-full object-cover"
  />

  <!-- AFTER: -->
  <img
    :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
    :alt="prod.name"
    loading="lazy"
    class="w-full h-full object-cover"
  />
  ```

  **Files:** `src/views/admin/ProductsView.vue`, `src/views/admin/DashboardView.vue`

  **Verify:** `npm run build` succeeds (no template errors). In DevTools Accessibility tree, product images have non-empty alt text.

---

- [ ] 8. **ENV EXAMPLE — Document VITE_DEMO_MODE** (`.env.example`)

  Append the following line to `.env.example` under the existing entries. Do NOT add admin credentials:
  ```
  # Demo / offline fallback mode (set to true only for local development without Supabase)
  VITE_DEMO_MODE=false
  ```

  **Files:** `.env.example`

  **Verify:** File is readable and contains `VITE_DEMO_MODE=false`. `npm run build` unaffected.

---

## Dependency order summary

Items 1–2 are independent of each other and of items 3–8.
Item 4 depends on item 3 (item 3 restructures the timer variables that item 4 then removes).
Items 5, 6, 7, 8 are all independent of each other and of items 1–4.
All items leave the codebase buildable when completed individually.
