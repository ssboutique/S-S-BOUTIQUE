<script setup lang="ts">
import type { CartItem } from '@/types/cart';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/utils/currency';
import { Plus, Minus, Trash2 } from 'lucide-vue-next';

defineProps<{
  item: CartItem;
  currency?: string;
}>();

const cartStore = useCartStore();
</script>

<template>
  <div class="flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0 group">
    <!-- Item Image -->
    <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
      <img
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-full object-cover object-center"
      />
    </div>

    <!-- Info & Variants -->
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-sm text-slate-900 truncate">
        {{ item.name }}
      </h4>

      <!-- Selected Variants Badges -->
      <div v-if="Object.keys(item.selectedVariants).length > 0" class="flex flex-wrap gap-1 mt-1">
        <span
          v-for="(val, key) in item.selectedVariants"
          :key="key"
          class="inline-block text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
        >
          {{ key }}: {{ val }}
        </span>
      </div>

      <!-- Price -->
      <div class="text-xs font-semibold text-slate-900 mt-1">
        {{ formatCurrency(item.price, currency) }}
      </div>
    </div>

    <!-- Stepper & Delete -->
    <div class="flex flex-col items-end gap-2 shrink-0">
      <button
        type="button"
        @click="cartStore.removeItem(item.id)"
        class="text-slate-400 hover:text-rose-500 transition-colors p-1"
        :aria-label="`Eliminar ${item.name} del carrito`"
      >
        <Trash2 class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
        <button
          type="button"
          @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
          class="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900"
          aria-label="Restar una unidad"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>
        <span class="text-xs font-bold text-slate-900 w-4 text-center">{{ item.quantity }}</span>
        <button
          type="button"
          @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
          class="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-900"
          aria-label="Sumar una unidad"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
