<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@/types/database';
import { useCartStore } from '@/stores/cart';
import { formatCurrency, calculateDiscountPercentage } from '@/utils/currency';
import { Plus, Check, Sparkles } from 'lucide-vue-next';

const props = defineProps<{
  product: Product;
  currency?: string;
}>();

const emit = defineEmits<{
  (e: 'select', product: Product): void;
}>();

const cartStore = useCartStore();

const primaryImage = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    const primary = props.product.images.find((img) => img.is_primary);
    return primary ? primary.image_url : props.product.images[0].image_url;
  }
  return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop';
});

const discount = computed(() => {
  return calculateDiscountPercentage(props.product.price, props.product.original_price);
});

const hasVariants = computed(() => {
  return props.product.variants && props.product.variants.length > 0;
});

function handleAddToCart(event: Event) {
  event.stopPropagation();
  if (hasVariants.value) {
    // If product requires selecting variant (like size or color), open modal for user to choose
    emit('select', props.product);
  } else {
    cartStore.addItem(props.product, 1);
  }
}
</script>

<template>
  <article
    @click="emit('select', product)"
    class="group relative bg-white rounded-2xl border border-slate-200/70 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
  >
    <!-- Image & Badges Container -->
    <div class="relative w-full aspect-square bg-slate-100 overflow-hidden">
      <img
        :src="primaryImage"
        :alt="product.name"
        loading="lazy"
        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      <!-- Discount Badge -->
      <div
        v-if="discount > 0"
        class="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-tight"
      >
        -{{ discount }}%
      </div>

      <!-- Featured Badge -->
      <div
        v-if="product.is_featured"
        class="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider"
      >
        <Sparkles class="w-3 h-3" />
        <span>Destacado</span>
      </div>

      <!-- Out of Stock Overlay -->
      <div
        v-if="!product.is_available"
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider"
      >
        Agotado
      </div>
    </div>

    <!-- Product Info -->
    <div class="p-4 flex-1 flex flex-col justify-between gap-3">
      <div>
        <h3 class="font-bold text-sm sm:text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-snug">
          {{ product.name }}
        </h3>
        <p
          v-if="product.description"
          class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed"
        >
          {{ product.description }}
        </p>
      </div>

      <!-- Pricing & Add to Cart -->
      <div class="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
        <div class="flex flex-col">
          <div class="flex items-baseline gap-1.5">
            <span class="text-base sm:text-lg font-extrabold text-slate-900">
              {{ formatCurrency(product.price, currency) }}
            </span>
          </div>
          <span
            v-if="product.original_price && product.original_price > product.price"
            class="text-xs text-slate-400 line-through font-medium"
          >
            {{ formatCurrency(product.original_price, currency) }}
          </span>
        </div>

        <button
          type="button"
          @click="handleAddToCart"
          :disabled="!product.is_available"
          class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
          :class="
            product.is_available
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          "
          :aria-label="`Agregar ${product.name} al carrito`"
        >
          <Plus class="w-4 h-4" />
          <span class="hidden sm:inline">{{ hasVariants ? 'Elegir' : 'Agregar' }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
