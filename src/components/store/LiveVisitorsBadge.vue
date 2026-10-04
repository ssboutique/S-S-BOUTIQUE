<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Eye, ShoppingBag, ShieldCheck, Flame, Sparkles } from 'lucide-vue-next';

// Dynamic fluctuating visitors count
const activeVisitors = ref<number>(14);
const todayOrders = ref<number>(18);
let visitorInterval: any = null;

function updateVisitorsCount() {
  // Realistically fluctuate by +1, -1, or +2
  const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
  let next = activeVisitors.value + delta;
  if (next < 9) next = 9;
  if (next > 28) next = 28;
  activeVisitors.value = next;
}

// When a real user clicks WhatsApp order
function onStoreOrder() {
  todayOrders.value += 1;
}

onMounted(() => {
  // Base random seed for today's orders
  const baseOrders = 12 + Math.floor((new Date().getHours() / 24) * 15);
  todayOrders.value = baseOrders;

  window.addEventListener('store-whatsapp-order', onStoreOrder);
  visitorInterval = setInterval(updateVisitorsCount, 7000);
});

onUnmounted(() => {
  if (visitorInterval) clearInterval(visitorInterval);
  window.removeEventListener('store-whatsapp-order', onStoreOrder);
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-amber-500/20 shadow-md backdrop-blur-md text-xs">
      
      <!-- Live Visitors Counter -->
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div class="flex items-center gap-1.5 text-slate-300">
          <Eye class="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong class="text-white font-extrabold text-emerald-300 text-sm">{{ activeVisitors }}</strong> clientes explorando la boutique ahora
          </span>
        </div>
      </div>

      <!-- Today's WhatsApp Orders -->
      <div class="flex items-center gap-2 text-slate-300">
        <Flame class="w-4 h-4 text-amber-400 animate-bounce" />
        <span>
          <strong class="text-amber-300 font-extrabold text-sm">{{ todayOrders }}</strong> pedidos VIP atendidos hoy
        </span>
      </div>

      <!-- Trust Assurance -->
      <div class="hidden md:flex items-center gap-2 text-slate-400">
        <ShieldCheck class="w-4 h-4 text-amber-400" />
        <span class="text-slate-300 font-medium">Compras protegidas con garantía de autenticidad</span>
      </div>

    </div>
  </div>
</template>
