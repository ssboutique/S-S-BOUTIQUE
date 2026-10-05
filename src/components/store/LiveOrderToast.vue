<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ShoppingBag, MessageCircle, X, CheckCircle, Sparkles } from 'lucide-vue-next';

interface SocialEvent {
  id: string;
  name: string;
  city: string;
  product: string;
  timeAgo: string;
}

const currentToast = ref<SocialEvent | null>(null);
const isVisible = ref(false);

// Global custom event listener when an actual user clicks WhatsApp order
function onUserWhatsAppOrder(e: any) {
  const detail = e.detail;
  if (detail) {
    currentToast.value = {
      id: Math.random().toString(),
      name: detail.customerName || 'Un cliente VIP',
      city: detail.city || 'Colombia',
      product: detail.productName || 'Colección Exclusiva',
      timeAgo: '¡Justo ahora!'
    };
    isVisible.value = true;
    setTimeout(() => {
      isVisible.value = false;
    }, 6000);
  }
}

onMounted(() => {
  window.addEventListener('store-whatsapp-order', onUserWhatsAppOrder);
});

onUnmounted(() => {
  window.removeEventListener('store-whatsapp-order', onUserWhatsAppOrder);
});
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-400 transition"
    enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:-translate-x-4"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible && currentToast"
      class="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 max-w-[340px] bg-slate-900/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3.5 shadow-2xl text-white flex items-start gap-3 select-none"
      role="status"
    >
      <!-- Icon with pulse -->
      <div class="relative shrink-0 mt-0.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
          <MessageCircle class="w-4 h-4" />
        </div>
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <Sparkles class="w-3 h-3 text-amber-400" />
            Nuevo Pedido por WhatsApp
          </span>
          <span class="text-[10px] text-slate-400">{{ currentToast.timeAgo }}</span>
        </div>

        <p class="text-xs text-slate-200 mt-0.5 font-medium leading-snug truncate">
          <strong class="text-white">{{ currentToast.name }}</strong> en <span class="text-slate-300">{{ currentToast.city }}</span>
        </p>

        <p class="text-[11px] text-slate-400 truncate mt-0.5">
          Consultó: <span class="text-amber-200 font-semibold">{{ currentToast.product }}</span>
        </p>
      </div>

      <!-- Close button -->
      <button
        type="button"
        @click="isVisible = false"
        class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </Transition>
</template>
