<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useStoreStore } from '@/stores/store';
import { formatCurrency } from '@/utils/currency';
import CartItemRow from './CartItemRow.vue';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'checkout'): void;
}>();

const cartStore = useCartStore();
const storeStore = useStoreStore();

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && cartStore.isOpen) {
    cartStore.closeCart();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function proceedToCheckout() {
  cartStore.closeCart();
  emit('checkout');
}
</script>

<template>
  <div>
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cartStore.isOpen"
        @click="cartStore.closeCart"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50"
        aria-hidden="true"
      />
    </Transition>

    <!-- Slide-over Drawer -->
    <Transition
      enter-active-class="transform transition ease-in-out duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transform transition ease-in-out duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="cartStore.isOpen"
        class="fixed inset-y-0 right-0 max-w-full flex z-50 w-full sm:w-[420px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div class="w-full bg-white shadow-2xl flex flex-col justify-between">
          <!-- Drawer Header -->
          <div class="p-5 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <ShoppingBag class="w-5 h-5 text-brand-600" />
              <h2 id="cart-title" class="font-extrabold text-base sm:text-lg text-slate-900">
                Tu Carrito ({{ cartStore.totals.itemCount }})
              </h2>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="cartStore.items.length > 0"
                type="button"
                @click="cartStore.clearCart"
                class="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded-md transition-colors"
                title="Vaciar carrito"
              >
                Vaciar
              </button>

              <button
                type="button"
                @click="cartStore.closeCart"
                class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Drawer Body: Items or Empty State -->
          <div class="flex-1 overflow-y-auto px-5 divide-y divide-slate-100">
            <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-center py-12">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag class="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 class="font-bold text-slate-800 text-base">Tu carrito está vacío</h3>
              <p class="text-xs text-slate-500 max-w-xs mt-1">
                Explora el catálogo y agrega tus productos favoritos para hacer tu pedido por WhatsApp.
              </p>
              <button
                type="button"
                @click="cartStore.closeCart"
                class="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Explorar Productos
              </button>
            </div>

            <div v-else>
              <CartItemRow
                v-for="item in cartStore.items"
                :key="item.id"
                :item="item"
                :currency="storeStore.store?.currency"
              />
            </div>
          </div>

          <!-- Drawer Footer -->
          <div v-if="cartStore.items.length > 0" class="p-5 bg-slate-50 border-t border-slate-100 space-y-4">
            <div class="space-y-1.5 text-xs sm:text-sm">
              <div class="flex items-center justify-between text-slate-500">
                <span>Subtotal ({{ cartStore.totals.itemCount }} artículos):</span>
                <span class="font-semibold text-slate-700">{{ formatCurrency(cartStore.totals.subtotal, storeStore.store?.currency) }}</span>
              </div>
              <div class="flex items-center justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200/60">
                <span>Total Estimado:</span>
                <span class="text-lg text-brand-600">{{ formatCurrency(cartStore.totals.total, storeStore.store?.currency) }}</span>
              </div>
            </div>

            <button
              type="button"
              @click="proceedToCheckout"
              class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-glow active:scale-98"
            >
              <span>Continuar con el Pedido</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
