<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import { ShoppingBag, Search, MessageCircle, X, Users } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const storeStore = useStoreStore();
const cartStore = useCartStore();

const showMobileSearch = ref(false);

// Lee el slug de la URL: route.params.slug puede ser string o string[]
const currentSlug = computed(() => {
  const param = route.params.slug;
  const fromRoute = Array.isArray(param) ? param[0] : param;
  return fromRoute || storeStore.store?.slug || 'ss-boutique';
});

function goToAbout() {
  router.push(`/tienda/${currentSlug.value}/nosotros`);
}

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
  <header class="glass-header transition-all duration-200" role="banner">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20 gap-4">

        <!-- Logo & Store Name -->
        <router-link
          :to="`/tienda/${currentSlug}`"
          class="flex items-center gap-3 group shrink-0"
          :aria-label="`Ir al inicio de ${storeStore.store?.name || 'tienda'}`"
        >
          <!-- Logo con imagen -->
          <div
            v-if="storeStore.store?.logo_url"
            class="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 ring-white/80 group-hover:ring-brand-400/60 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
          >
            <img
              :src="storeStore.store.logo_url"
              :alt="`Logo de ${storeStore.store.name}`"
              class="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <!-- Fallback inicial -->
          <div
            v-else
            class="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-black text-lg shadow-md ring-2 ring-white/80 group-hover:scale-105 transition-transform shrink-0"
          >
            {{ storeStore.store?.name?.charAt(0) || 'S' }}
          </div>

          <div class="flex flex-col leading-tight">
            <h1 class="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 tracking-tight">
              {{ storeStore.store?.name || '&nbsp;' }}
            </h1>
            <span v-if="storeStore.store?.city" class="text-[11px] text-slate-400 hidden sm:block font-medium">
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
              placeholder="Buscar productos..."
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

        <!-- Right Actions -->
        <div class="flex items-center gap-2 shrink-0">

          <!-- Mobile Search Toggle -->
          <button
            type="button"
            @click="showMobileSearch = !showMobileSearch"
            class="md:hidden p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Abrir buscador"
          >
            <Search class="w-5 h-5" />
          </button>

          <!-- Quiénes Somos — navegación imperativa, siempre funciona -->
          <button
            type="button"
            @click="goToAbout"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 border border-transparent hover:border-fuchsia-200/60 transition-all duration-200"
            aria-label="Conocer quiénes somos"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Quiénes Somos</span>
          </button>

          <!-- WhatsApp -->
          <button
            v-if="storeStore.store?.whatsapp_number"
            type="button"
            @click="openWhatsApp"
            class="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle class="w-4 h-4" />
            <span>Consultar</span>
          </button>

          <!-- Cart -->
          <button
            type="button"
            @click="cartStore.openCart"
            class="relative inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            aria-label="Ver carrito de compras"
          >
            <div class="relative">
              <ShoppingBag class="w-4 h-4" />
              <span
                v-if="cartStore.totals.itemCount > 0"
                class="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
              >
                {{ cartStore.totals.itemCount }}
              </span>
            </div>
            <span class="hidden sm:inline">Carrito</span>
          </button>
        </div>
      </div>

      <!-- Mobile Search Bar -->
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
