<script setup lang="ts">
import { ref } from 'vue';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import { ShoppingBag, Search, MessageCircle, X } from 'lucide-vue-next';

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

          <!-- WhatsApp Direct Contact Button -->
          <button
            v-if="storeStore.store?.whatsapp_number"
            type="button"
            @click="openWhatsApp"
            class="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-all shadow-sm"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle class="w-4 h-4 text-emerald-600" />
            <span>Consultar</span>
          </button>

          <!-- Cart Button -->
          <button
            type="button"
            @click="cartStore.openCart"
            class="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95"
            aria-label="Ver carrito de compras"
          >
            <div class="relative">
              <ShoppingBag class="w-5 h-5" />
              <span
                v-if="cartStore.totals.itemCount > 0"
                class="absolute -top-2 -right-2 bg-brand-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm"
              >
                {{ cartStore.totals.itemCount }}
              </span>
            </div>
            <span class="hidden sm:inline font-semibold">Carrito</span>
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
