<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Product } from '@/types/database';
import { useCartStore } from '@/stores/cart';
import { formatCurrency, calculateDiscountPercentage } from '@/utils/currency';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-vue-next';

const props = defineProps<{
  product: Product | null;
  currency?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const cartStore = useCartStore();

const activeImageIndex = ref(0);
const quantity = ref(1);
const selectedVariants = ref<Record<string, string>>({});
const addedFeedback = ref(false);

// Reset state when product changes
watch(
  () => props.product,
  (newProduct) => {
    activeImageIndex.value = 0;
    quantity.value = 1;
    selectedVariants.value = {};
    addedFeedback.value = false;

    if (newProduct?.variants && newProduct.variants.length > 0) {
      // Group variants by type and default to first value of each
      const types = Array.from(new Set(newProduct.variants.map((v) => v.variant_type)));
      types.forEach((type) => {
        const first = newProduct.variants?.find((v) => v.variant_type === type);
        if (first) {
          selectedVariants.value[type] = first.variant_value;
        }
      });
    }
  },
  { immediate: true }
);

const images = computed(() => {
  if (props.product?.images && props.product.images.length > 0) {
    return props.product.images.map((img) => img.image_url);
  }
  return ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop'];
});

const currentImage = computed(() => {
  return images.value[activeImageIndex.value] || images.value[0];
});

// Group variants by type for rendering selector groups
const variantGroups = computed(() => {
  if (!props.product?.variants) return {};
  const groups: Record<string, string[]> = {};
  props.product.variants.forEach((v) => {
    if (!groups[v.variant_type]) groups[v.variant_type] = [];
    if (!groups[v.variant_type].includes(v.variant_value)) {
      groups[v.variant_type].push(v.variant_value);
    }
  });
  return groups;
});

const priceModifier = computed(() => {
  // Check if any selected variant carries a price modifier
  let mod = 0;
  if (props.product?.variants) {
    Object.entries(selectedVariants.value).forEach(([type, val]) => {
      const match = props.product?.variants?.find(
        (v) => v.variant_type === type && v.variant_value === val
      );
      if (match) mod += Number(match.price_modifier || 0);
    });
  }
  return mod;
});

const unitPrice = computed(() => {
  return Number(props.product?.price || 0) + priceModifier.value;
});

const totalPrice = computed(() => {
  return unitPrice.value * quantity.value;
});

const discount = computed(() => {
  return calculateDiscountPercentage(props.product?.price || 0, props.product?.original_price);
});

function handleAddToCart() {
  if (!props.product) return;
  cartStore.addItem(props.product, quantity.value, selectedVariants.value, priceModifier.value);
  addedFeedback.value = true;
  setTimeout(() => {
    emit('close');
  }, 400);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div
    v-if="product"
    class="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    :aria-label="product.name"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh] animate-slide-up"
    >
      <!-- Close Button -->
      <button
        type="button"
        @click="emit('close')"
        class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 shadow-md flex items-center justify-center transition-all"
        aria-label="Cerrar modal de producto"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Left: Gallery -->
      <div class="w-full md:w-1/2 bg-slate-50 p-4 sm:p-6 flex flex-col justify-between">
        <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
          <img
            :src="currentImage"
            :alt="product.name"
            class="w-full h-full object-cover object-center transition-all duration-300"
          />
          <div
            v-if="discount > 0"
            class="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
          >
            -{{ discount }}%
          </div>
        </div>

        <!-- Thumbnails -->
        <div v-if="images.length > 1" class="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1">
          <button
            v-for="(img, idx) in images"
            :key="idx"
            type="button"
            @click="activeImageIndex = idx"
            class="w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0"
            :class="activeImageIndex === idx ? 'border-brand-500 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'"
          >
            <img :src="img" :alt="`Foto ${idx + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Right: Details & Configurator -->
      <div class="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
        <div class="space-y-4">
          <div>
            <span v-if="product.category?.name" class="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              {{ product.category.name }}
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-1">
              {{ product.name }}
            </h2>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-2xl font-black text-slate-900">
                {{ formatCurrency(unitPrice, currency) }}
              </span>
              <span
                v-if="product.original_price && product.original_price > unitPrice"
                class="text-sm text-slate-400 line-through"
              >
                {{ formatCurrency(product.original_price, currency) }}
              </span>
            </div>
          </div>

          <p v-if="product.description" class="text-sm text-slate-600 leading-relaxed">
            {{ product.description }}
          </p>

          <!-- Variant Selectors -->
          <div v-if="Object.keys(variantGroups).length > 0" class="space-y-3 pt-2 border-t border-slate-100">
            <div v-for="(options, type) in variantGroups" :key="type" class="space-y-1.5">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {{ type }}: <span class="text-brand-600 normal-case font-medium">{{ selectedVariants[type] }}</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in options"
                  :key="opt"
                  type="button"
                  @click="selectedVariants[type] = opt"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  :class="
                    selectedVariants[type] === opt
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  "
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Cantidad</span>
            <div class="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <button
                type="button"
                @click="quantity > 1 ? quantity-- : null"
                class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus class="w-4 h-4" />
              </button>
              <span class="font-bold text-sm w-6 text-center text-slate-900">{{ quantity }}</span>
              <button
                type="button"
                @click="quantity++"
                class="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Add to Cart CTA -->
        <div class="pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            @click="handleAddToCart"
            class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-glow active:scale-98"
          >
            <Check v-if="addedFeedback" class="w-5 h-5 animate-bounce" />
            <ShoppingBag v-else class="w-5 h-5" />
            <span>{{ addedFeedback ? '¡Agregado al Carrito!' : `Agregar por ${formatCurrency(totalPrice, currency)}` }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
