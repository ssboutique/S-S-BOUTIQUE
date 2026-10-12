<script setup lang="ts">
import { ref } from 'vue';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import { ShoppingBag, Search, X } from 'lucide-vue-next';

const storeStore = useStoreStore();
const cartStore = useCartStore();

const showMobileSearch = ref(false);

function handleSearchInput(e: Event) {
  const target = e.target as HTMLInputElement;
  storeStore.setSearchQuery(target.value);
}

function clearSearch() {
  storeStore.setSearchQuery('');
  showMobileSearch.value = false;
}

function openWhatsApp() {
  if (storeStore.store?.whatsapp_number) {
    const cleanPhone = storeStore.store.whatsapp_number.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=Hola!%20Tengo%20una%20consulta%20sobre%20sus%20productos.`, '_blank');
  }
}
</script>

<template>
  <header
    class="glass-header transition-all duration-200"
    role="banner"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20 gap-4">
        <!-- Logo & Store Name -->
        <router-link
          :to="`/tienda/${storeStore.store?.slug}`"
          class="flex items-center gap-3 group shrink-0"
          :aria-label="`Ir al inicio de ${storeStore.store?.name || 'tienda'}`"
        >
          <div
            v-if="storeStore.store?.logo_url"
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform"
          >
            <img
              :src="storeStore.store.logo_url"
              :alt="`Logo de ${storeStore.store.name}`"
              class="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div
            v-else
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm"
          >
            {{ storeStore.store?.name?.charAt(0) || 'T' }}
          </div>

          <div class="flex flex-col">
            <h1 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-snug">
              {{ storeStore.store?.name }}
            </h1>
            <span v-if="storeStore.store?.city" class="text-xs text-slate-500 hidden sm:block">
              {{ storeStore.store.city }}
            </span>
          </div>
        </router-link>

        <!-- Desktop Search Bar -->
        <div class="hidden md:flex flex-1 max-w-md mx-4">
          <div class="relative w-full">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              :value="storeStore.searchQuery"
              @input="handleSearchInput"
              placeholder="Buscar productos por nombre o descripción..."
              class="w-full pl-10 pr-9 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 rounded-full border border-slate-200/60 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
              aria-label="Buscar productos"
            />
            <button
              v-if="storeStore.searchQuery"
              @click="clearSearch"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              aria-label="Limpiar búsqueda"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right Actions: WhatsApp & Cart -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Mobile Search Toggle -->
          <button
            type="button"
            @click="showMobileSearch = !showMobileSearch"
            class="md:hidden p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Abrir buscador"
          >
            <Search class="w-5 h-5" />
          </button>

          <!-- Quiénes Somos link -->
          <router-link
            :to="`/tienda/${storeStore.store?.slug}/nosotros`"
            class="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-fuchsia-300/60 text-fuchsia-700 bg-gradient-to-r from-fuchsia-50 to-purple-50 hover:from-fuchsia-100 hover:to-purple-100 hover:border-fuchsia-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          >
            Quiénes Somos
          </router-link>

          <!-- WhatsApp Direct Contact Button -->
          <button
            v-if="storeStore.store?.whatsapp_number"
            type="button"
            @click="openWhatsApp"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-full transition-all shadow-md active:scale-95 wa-btn-glow"
            aria-label="Contactar por WhatsApp"
          >
            <!-- WhatsApp icon SVG -->
            <svg viewBox="0 0 20 20" class="w-4 h-4 shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)"/>
              <path d="M14.5 5.5A6.5 6.5 0 0 0 3.5 10a6.4 6.4 0 0 0 .87 3.24L3.5 16.5l3.33-.87A6.5 6.5 0 1 0 14.5 5.5Zm-4.5 10a5.4 5.4 0 0 1-2.76-.76l-.2-.12-2.06.52.54-2-.12-.2A5.38 5.38 0 1 1 10 15.5Zm2.98-4.06c-.16-.08-.96-.47-1.11-.52s-.26-.08-.37.08-.42.52-.51.63-.19.12-.35.04a4.45 4.45 0 0 1-2.22-1.94c-.17-.29.17-.27.48-.9a.3.3 0 0 0-.01-.29c-.04-.08-.37-.89-.5-1.21s-.27-.27-.37-.28h-.31a.6.6 0 0 0-.44.21A1.83 1.83 0 0 0 7.2 8.63a3.18 3.18 0 0 0 .66 1.68 7.28 7.28 0 0 0 2.79 2.46c1.04.35 1.04.24 1.23.22a1.66 1.66 0 0 0 1.1-.78 1.37 1.37 0 0 0 .1-.78c-.04-.06-.15-.1-.32-.17Z" fill="white"/>
            </svg>
            <span>Consultar</span>
          </button>

          <!-- Cart Button -->
          <button
            type="button"
            @click="cartStore.openCart"
            class="relative flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95 cart-btn"
            aria-label="Ver carrito de compras"
          >
            <div class="relative">
              <ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5" />
              <span
                v-if="cartStore.totals.itemCount > 0"
                class="absolute -top-2 -right-2 bg-fuchsia-500 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce"
              >
                {{ cartStore.totals.itemCount }}
              </span>
            </div>
            <span class="hidden sm:inline">Carrito</span>
          </button>
        </div>
      </div>

      <!-- Mobile Search Bar Expandable -->
      <div v-if="showMobileSearch" class="md:hidden pb-3 pt-1">
        <div class="relative w-full">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            :value="storeStore.searchQuery"
            @input="handleSearchInput"
            placeholder="Buscar productos..."
            class="w-full pl-9 pr-9 py-2 bg-slate-100 text-sm text-slate-900 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500"
            autofocus
            aria-label="Buscar productos en móvil"
          />
          <button
            v-if="storeStore.searchQuery"
            @click="clearSearch"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ── WhatsApp Consultar button ─────────────────────── */
.wa-btn-glow {
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  position: relative;
  overflow: hidden;
}
.wa-btn-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #25d366 0%, #075e54 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  border-radius: inherit;
}
.wa-btn-glow:hover::before { opacity: 1; }

/* Shimmer sweep animation */
.wa-btn-glow::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -75%;
  width: 50%;
  height: 200%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.35) 50%,
    transparent 60%
  );
  animation: waSweep 2.8s ease-in-out infinite;
  pointer-events: none;
}
@keyframes waSweep {
  0%   { left: -75%; opacity: 0; }
  15%  { opacity: 1; }
  50%  { left: 125%; opacity: 1; }
  51%  { opacity: 0; }
  100% { left: 125%; opacity: 0; }
}

/* ── Cart button ───────────────────────────────────── */
.cart-btn {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  color: #fff;
}
.cart-btn:hover {
  background: linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #6d28d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(109,40,217,0.35);
}
</style>
