<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ShieldCheck } from 'lucide-vue-next';

// When a real user clicks WhatsApp order
function onStoreOrder() {}

onMounted(() => {
  window.addEventListener('store-whatsapp-order', onStoreOrder);
});

onUnmounted(() => {
  window.removeEventListener('store-whatsapp-order', onStoreOrder);
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-amber-500/20 shadow-md backdrop-blur-md text-xs">
      
      <!-- Tienda activa indicator -->
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div class="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
          <span class="font-semibold text-sm text-white">Tienda activa</span>
        </div>
      </div>

      <!-- Trust Assurance -->
      <div class="hidden md:flex items-center gap-2 text-slate-400">
        <ShieldCheck class="w-4 h-4 text-amber-400" />
        <span class="text-slate-300 font-medium">Compras protegidas con garantía de autenticidad</span>
      </div>

    </div>
  </div>
</template>
