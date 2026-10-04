<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Product } from '@/types/database';
import { useStoreStore } from '@/stores/store';
import { useCartStore } from '@/stores/cart';
import { formatCurrency, calculateDiscountPercentage } from '@/utils/currency';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Flame,
  ArrowRight,
  Eye,
  Check
} from 'lucide-vue-next';

const props = defineProps<{
  currency?: string;
}>();

const emit = defineEmits<{
  (e: 'select', product: Product): void;
}>();

const storeStore = useStoreStore();
const cartStore = useCartStore();

const currentIndex = ref(0);
const isHovered = ref(false);
const addedToCartId = ref<string | null>(null);

let autoPlayTimer: any = null;

// Filter products for the 3D Promo Slider:
// Prioritizes: 1. is_featured = true, 2. Has discount (original_price > price)
const promoProducts = computed<Product[]>(() => {
  const available = storeStore.products.filter((p) => p.is_available);
  const featuredOrDiscounted = available.filter(
    (p) => p.is_featured || (p.original_price && p.original_price > p.price)
  );

  if (featuredOrDiscounted.length >= 2) {
    return featuredOrDiscounted;
  }

  // Fallback: If few products are marked, include top available products up to 6
  return available.slice(0, 6);
});

const totalSlides = computed(() => promoProducts.value.length);

function nextSlide() {
  if (totalSlides.value <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value;
}

function prevSlide() {
  if (totalSlides.value <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value;
}

function goToSlide(index: number) {
  currentIndex.value = index;
}

function startAutoplay() {
  stopAutoplay();
  if (totalSlides.value > 1) {
    autoPlayTimer = setInterval(() => {
      if (!isHovered.value) {
        nextSlide();
      }
    }, 4500);
  }
}

function stopAutoplay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
}

// Touch swipe gestures for mobile 3D feel
const touchStartX = ref(0);
const touchEndX = ref(0);

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0].clientX;
}

function handleTouchEnd() {
  const diff = touchStartX.value - touchEndX.value;
  if (Math.abs(diff) > 45) {
    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
}

function getSlideStyle(index: number) {
  if (totalSlides.value === 0) return {};

  const total = totalSlides.value;
  let offset = (index - currentIndex.value + total) % total;

  // Convert offset to center relative (-1, 0, 1, etc.)
  if (offset > total / 2) {
    offset -= total;
  }

  // Active Center Card
  if (offset === 0) {
    return {
      transform: 'translate3d(0, 0, 0) scale(1) rotateY(0deg)',
      zIndex: 30,
      opacity: 1,
      visibility: 'visible' as const,
      filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.25))',
    };
  }

  // Card immediately to the Left
  if (offset === -1 || (total === 2 && offset === 1 && currentIndex.value === 1)) {
    return {
      transform: 'translate3d(-62%, 0, -120px) scale(0.86) rotateY(24deg)',
      zIndex: 20,
      opacity: 0.68,
      visibility: 'visible' as const,
      filter: 'blur(0.5px) brightness(0.85)',
      cursor: 'pointer',
    };
  }

  // Card immediately to the Right
  if (offset === 1) {
    return {
      transform: 'translate3d(62%, 0, -120px) scale(0.86) rotateY(-24deg)',
      zIndex: 20,
      opacity: 0.68,
      visibility: 'visible' as const,
      filter: 'blur(0.5px) brightness(0.85)',
      cursor: 'pointer',
    };
  }

  // Outer Left
  if (offset === -2) {
    return {
      transform: 'translate3d(-105%, 0, -220px) scale(0.72) rotateY(38deg)',
      zIndex: 10,
      opacity: 0.25,
      visibility: 'visible' as const,
    };
  }

  // Outer Right
  if (offset === 2) {
    return {
      transform: 'translate3d(105%, 0, -220px) scale(0.72) rotateY(-38deg)',
      zIndex: 10,
      opacity: 0.25,
      visibility: 'visible' as const,
    };
  }

  // Hidden in the background
  return {
    transform: 'translate3d(0, 0, -350px) scale(0.5)',
    zIndex: 1,
    opacity: 0,
    visibility: 'hidden' as const,
    pointerEvents: 'none' as const,
  };
}

function handleQuickAddToCart(product: Product, e: Event) {
  e.stopPropagation();
  cartStore.addItem(product, 1);
  addedToCartId.value = product.id;
  setTimeout(() => {
    if (addedToCartId.value === product.id) {
      addedToCartId.value = null;
    }
  }, 1800);
}

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <section
    v-if="promoProducts.length > 0"
    class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden"
    aria-label="Promociones y Ofertas 3D"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Section Header with High Fashion Aesthetic -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-purple-500/10 border border-fuchsia-200/60 text-fuchsia-700 text-xs font-black uppercase tracking-wider mb-2">
          <Flame class="w-3.5 h-3.5 text-fuchsia-600 animate-pulse" />
          <span>Colección & Ofertas Destacadas</span>
        </div>
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Promociones Exclusivas 3D
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Descubre las piezas más exclusivas, lanzamientos y descuentos de pasarela seleccionados para ti.
        </p>
      </div>

      <!-- Navigation Arrows for desktop -->
      <div v-if="totalSlides > 1" class="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          type="button"
          @click="prevSlide"
          class="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm active:scale-90"
          aria-label="Promoción anterior"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          type="button"
          @click="nextSlide"
          class="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm active:scale-90"
          aria-label="Siguiente promoción"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 3D Stage Container -->
    <div
      class="relative w-full h-[470px] sm:h-[490px] flex items-center justify-center perspective-[1200px] select-none"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div class="w-96 h-96 bg-gradient-to-tr from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <!-- 3D Slides Track -->
      <div class="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] h-full flex items-center justify-center transform-style-3d">
        <div
          v-for="(product, idx) in promoProducts"
          :key="product.id"
          class="absolute inset-0 transition-all duration-700 ease-out will-change-transform transform-style-3d"
          :style="getSlideStyle(idx)"
          @click="idx !== currentIndex ? goToSlide(idx) : emit('select', product)"
        >
          <!-- Luxury Product Card -->
          <div
            class="relative w-full h-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/50 text-white shadow-2xl flex flex-col group cursor-pointer"
          >
            <!-- Product Image with Luxury Framing -->
            <div class="relative w-full h-[270px] sm:h-[290px] bg-slate-950 overflow-hidden shrink-0">
              <img
                :src="product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop'"
                :alt="product.name"
                class="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              <!-- Badges Container -->
              <div class="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
                <!-- Discount Badge -->
                <span
                  v-if="product.original_price && product.original_price > product.price"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-black tracking-wider shadow-lg"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  {{ calculateDiscountPercentage(product.price, product.original_price) }}% OFF
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black tracking-wider shadow-lg"
                >
                  <Sparkles class="w-3.5 h-3.5" />
                  DESTACADO
                </span>

                <!-- Category Pill -->
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-200">
                  {{ storeStore.categories.find(c => c.id === product.category_id)?.name || 'Colección Exclusiva' }}
                </span>
              </div>
            </div>

            <!-- Product Details Section -->
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
              <div>
                <h3 class="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1 group-hover:text-fuchsia-300 transition-colors">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-slate-400 line-clamp-2 mt-1 font-normal leading-relaxed">
                  {{ product.description || 'Prenda de alta confección con acabados premium y diseño contemporáneo.' }}
                </p>
              </div>

              <!-- Price & Quick CTA -->
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <div class="text-lg sm:text-xl font-black text-white tracking-tight leading-none">
                    {{ formatCurrency(product.price, currency) }}
                  </div>
                  <div
                    v-if="product.original_price && product.original_price > product.price"
                    class="text-xs text-slate-400 line-through mt-0.5"
                  >
                    {{ formatCurrency(product.original_price, currency) }}
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click.stop="handleQuickAddToCart(product, $event)"
                    class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-90 border border-slate-700"
                    :title="addedToCartId === product.id ? '¡Añadido!' : 'Añadir al carrito'"
                  >
                    <Check v-if="addedToCartId === product.id" class="w-4 h-4 text-emerald-400" />
                    <ShoppingBag v-else class="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    @click.stop="emit('select', product)"
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-glow transition-all active:scale-95 shrink-0"
                  >
                    <span>Ver</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Navigation Dots / Pagination -->
    <div v-if="totalSlides > 1" class="flex items-center justify-center gap-2 mt-4">
      <button
        v-for="(_, index) in promoProducts"
        :key="index"
        type="button"
        @click="goToSlide(index)"
        class="h-2 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'w-8 bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-glow' : 'w-2 bg-slate-200 hover:bg-slate-300'"
        :aria-label="`Ir a la diapositiva ${index + 1}`"
      />
    </div>
  </section>
</template>

<style scoped>
.perspective-\[1200px\] {
  perspective: 1200px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
