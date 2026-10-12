<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '@/types/database';
import { useCartStore } from '@/stores/cart';
import { formatCurrency, calculateDiscountPercentage } from '@/utils/currency';
import { Plus, Sparkles } from 'lucide-vue-next';

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

const discount = computed(() =>
  calculateDiscountPercentage(props.product.price, props.product.original_price)
);

const hasVariants = computed(() =>
  props.product.variants && props.product.variants.length > 0
);

function handleAddToCart(event: Event) {
  event.stopPropagation();
  if (hasVariants.value) {
    emit('select', props.product);
  } else {
    cartStore.addItem(props.product, 1);
  }
}
</script>

<template>
  <article
    @click="emit('select', product)"
    class="pc-root group"
    :aria-label="`Ver ${product.name}`"
  >
    <!-- ── Image ── -->
    <div class="pc-img-wrap">
      <img
        :src="primaryImage"
        :alt="product.name"
        loading="lazy"
        class="pc-img group-hover:scale-105"
      />

      <!-- Gradient veil at bottom for text readability -->
      <div class="pc-veil" aria-hidden="true"></div>

      <!-- Discount badge -->
      <span v-if="discount > 0" class="pc-badge pc-badge-discount">
        -{{ discount }}%
      </span>

      <!-- Featured badge -->
      <span v-if="product.is_featured" class="pc-badge pc-badge-featured">
        <Sparkles class="w-3 h-3 shrink-0" />
        Destacado
      </span>

      <!-- Out of stock overlay -->
      <div v-if="!product.is_available" class="pc-sold-out" aria-live="polite">
        Agotado
      </div>
    </div>

    <!-- ── Info ── -->
    <div class="pc-body">
      <!-- Name + description -->
      <div class="pc-text">
        <h3 class="pc-name">{{ product.name }}</h3>
        <p v-if="product.description" class="pc-desc">{{ product.description }}</p>
      </div>

      <!-- Price row -->
      <div class="pc-footer">
        <div class="pc-prices">
          <span class="pc-price">{{ formatCurrency(product.price, currency) }}</span>
          <span
            v-if="product.original_price && product.original_price > product.price"
            class="pc-original"
          >
            {{ formatCurrency(product.original_price, currency) }}
          </span>
        </div>

        <button
          type="button"
          @click="handleAddToCart"
          :disabled="!product.is_available"
          class="pc-btn"
          :class="product.is_available ? 'pc-btn-active' : 'pc-btn-disabled'"
          :aria-label="`Agregar ${product.name} al carrito`"
        >
          <Plus class="w-4 h-4 shrink-0" />
          <span class="hidden sm:inline">{{ hasVariants ? 'Elegir' : 'Agregar' }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ── Card root ─────────────────────────────────────── */
.pc-root {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 2px 12px -2px rgba(0,0,0,.06);
  overflow: hidden;
  cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  will-change: transform;
}
.pc-root:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -6px rgba(0,0,0,.12);
  border-color: rgba(203, 213, 225, 0.9);
}
.pc-root:active {
  transform: translateY(-2px);
}

/* ── Image wrapper ──────────────────────────────────── */
.pc-img-wrap {
  position: relative;
  width: 100%;
  /* 4:5 portrait — shows more of the garment without cropping */
  aspect-ratio: 4 / 5;
  background: #f1f5f9;
  overflow: hidden;
  flex-shrink: 0;
}

.pc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top; /* keeps face/top visible */
  display: block;
  transition: transform .5s ease-out;
}

/* Subtle gradient so bottom badges are readable */
.pc-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.18) 0%, transparent 45%);
  pointer-events: none;
}

/* ── Badges ─────────────────────────────────────────── */
.pc-badge {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 99px;
  white-space: nowrap;
  pointer-events: none;
  backdrop-filter: blur(6px);
}
.pc-badge-discount {
  top: 10px;
  left: 10px;
  background: #ef4444;
  color: #fff;
  box-shadow: 0 2px 8px rgba(239,68,68,.35);
}
.pc-badge-featured {
  top: 10px;
  right: 10px;
  background: rgba(245,158,11,.88);
  color: #fff;
  box-shadow: 0 2px 8px rgba(245,158,11,.35);
}

/* ── Sold out ───────────────────────────────────────── */
.pc-sold-out {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(2px);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

/* ── Body ───────────────────────────────────────────── */
.pc-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 14px 14px 12px;
  gap: 10px;
}

/* ── Text block ─────────────────────────────────────── */
.pc-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.pc-name {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  /* Allow 2 lines — no hard cut on 1 line */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color .2s;
}
.pc-root:hover .pc-name {
  color: #16a34a; /* brand-600 */
}

.pc-desc {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* ── Footer row ─────────────────────────────────────── */
.pc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.pc-prices {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.pc-price {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  line-height: 1.2;
}

.pc-original {
  font-size: 11px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Add button ─────────────────────────────────────── */
.pc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  transition: background .2s, transform .15s;
  flex-shrink: 0;
  white-space: nowrap;
  border: none;
  cursor: pointer;
}
.pc-btn:active { transform: scale(.94); }

.pc-btn-active {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 2px 10px rgba(34,197,94,.3);
}
.pc-btn-active:hover { background: #16a34a; }

.pc-btn-disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>
