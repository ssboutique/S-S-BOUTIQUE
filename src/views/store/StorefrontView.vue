<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types/database';

import StoreHeader from '@/components/store/StoreHeader.vue';
import StoreHero from '@/components/store/StoreHero.vue';
import CategoryFilter from '@/components/store/CategoryFilter.vue';
import ProductCard from '@/components/store/ProductCard.vue';
import ProductModal from '@/components/store/ProductModal.vue';
import StoreFooter from '@/components/store/StoreFooter.vue';
import CartDrawer from '@/components/cart/CartDrawer.vue';
import CheckoutModal from '@/components/cart/CheckoutModal.vue';
import SkeletonCard from '@/components/ui/SkeletonCard.vue';
import StorePreloader from '@/components/store/StorePreloader.vue';
import { PackageOpen, AlertCircle, ShoppingBag } from 'lucide-vue-next';

const props = defineProps<{
  slug?: string;
}>();

const route = useRoute();
const storeStore = useStoreStore();
const cartStore = useCartStore();

const selectedProduct = ref<Product | null>(null);
const isCheckoutOpen = ref<boolean>(false);
const showPreloader = ref<boolean>(true);

async function initStorefront() {
  const targetSlug = props.slug || (route.params.slug as string) || 'ss-boutique';
  cartStore.setStoreContext(targetSlug);
  const success = await storeStore.loadStoreBySlug(targetSlug);

  // Update dynamic page title and meta description for SEO
  if (success && storeStore.store) {
    document.title = `${storeStore.store.name} - Tienda Oficial`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && storeStore.store.description) {
      metaDesc.setAttribute('content', storeStore.store.description);
    }
  }
}

watch(
  () => route.params.slug,
  () => {
    initStorefront();
  }
);

onMounted(() => {
  initStorefront();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
    <!-- 3D Futuristic Boutique Preloader -->
    <StorePreloader
      v-if="showPreloader"
      :is-loaded="!storeStore.isLoading"
      :store-name="storeStore.store?.name"
      :logo-url="storeStore.store?.logo_url"
      @finished="showPreloader = false"
    />

    <!-- Header -->
    <StoreHeader />

    <!-- Error State -->
    <main v-if="storeStore.error" class="flex-1 max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
        <AlertCircle class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Tienda no encontrada</h2>
      <p class="text-sm text-slate-500 mt-2 max-w-sm">
        {{ storeStore.error }}
      </p>
      <router-link
        to="/"
        class="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
      >
        Volver al Inicio
      </router-link>
    </main>

    <!-- Storefront Main Content -->
    <main v-else class="flex-1">
      <!-- Store Hero -->
      <StoreHero />

      <!-- Categories Filter Bar -->
      <CategoryFilter v-if="storeStore.categories.length > 0" />

      <!-- Products Grid Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Catálogo de productos">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">
              <span v-if="storeStore.searchQuery">Resultados de "{{ storeStore.searchQuery }}"</span>
              <span v-else-if="storeStore.selectedCategoryId">
                {{ storeStore.categories.find(c => c.id === storeStore.selectedCategoryId)?.name }}
              </span>
              <span v-else>Todos los Productos</span>
            </h2>
            <span class="text-xs bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {{ storeStore.filteredProducts.length }}
            </span>
          </div>
        </div>

        <!-- Skeleton Loading State -->
        <div
          v-if="storeStore.isLoading"
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          <SkeletonCard v-for="i in 8" :key="i" />
        </div>

        <!-- Empty Products State -->
        <div
          v-else-if="storeStore.filteredProducts.length === 0"
          class="py-16 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-soft"
        >
          <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <PackageOpen class="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 class="text-base font-bold text-slate-800">No hay productos disponibles todavía</h3>
          <p class="text-xs text-slate-500 max-w-sm mt-1">
            <span v-if="storeStore.searchQuery">No encontramos productos que coincidan con tu búsqueda. Prueba con otros términos.</span>
            <span v-else>Pronto agregaremos nuevos artículos a esta categoría.</span>
          </p>
          <button
            v-if="storeStore.searchQuery || storeStore.selectedCategoryId"
            type="button"
            @click="storeStore.setSearchQuery(''); storeStore.setSelectedCategory(null)"
            class="mt-5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Ver todos los productos
          </button>
        </div>

        <!-- Products Grid -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          <ProductCard
            v-for="prod in storeStore.filteredProducts"
            :key="prod.id"
            :product="prod"
            :currency="storeStore.store?.currency"
            @select="selectedProduct = prod"
          />
        </div>
      </section>
    </main>

    <!-- Footer -->
    <StoreFooter />

    <!-- Modals & Drawers -->
    <ProductModal
      :product="selectedProduct"
      :currency="storeStore.store?.currency"
      @close="selectedProduct = null"
    />

    <CartDrawer @checkout="isCheckoutOpen = true" />

    <CheckoutModal
      v-if="isCheckoutOpen"
      @close="isCheckoutOpen = false"
    />
  </div>
</template>
