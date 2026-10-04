<script setup lang="ts">
import { useStoreStore } from '@/stores/store';
import { Clock, MapPin, ShieldCheck, Sparkles, MessageCircle } from 'lucide-vue-next';

const storeStore = useStoreStore();

function openWhatsApp() {
  if (storeStore.store?.whatsapp_number) {
    const cleanPhone = storeStore.store.whatsapp_number.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=Hola!%20Quiero%20conocer%20m%C3%A1s%20sobre%20su%20cat%C3%A1logo.`, '_blank');
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
    <section class="relative overflow-hidden bg-slate-900 text-white rounded-3xl shadow-xl">
    <!-- Background Banner / Overlay -->
    <div v-if="storeStore.store?.banner_url" class="absolute inset-0">
      <img
        :src="storeStore.store.banner_url"
        :alt="`Banner de ${storeStore.store?.name}`"
        class="w-full h-full object-cover object-center opacity-30"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
    </div>
    <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950">
      <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative max-w-4xl px-6 py-8 sm:py-14 sm:px-12 flex flex-col items-start gap-4">
      <!-- Tag / Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Tienda Oficial Verificada</span>
      </div>

      <!-- Store Name & Description -->
      <h2 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
        {{ storeStore.store?.name }}
      </h2>

      <p class="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl font-normal leading-relaxed">
        {{ storeStore.store?.description || 'Explora nuestro catálogo exclusivo. Haz tu pedido fácil y rápido con atención directa por WhatsApp.' }}
      </p>

      <!-- Store Info Pills -->
      <div class="flex flex-wrap items-center gap-3 pt-2 text-xs sm:text-sm text-slate-300">
        <div v-if="storeStore.store?.city || storeStore.store?.address" class="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <MapPin class="w-4 h-4 text-brand-400" />
          <span>{{ storeStore.store.city || storeStore.store.address }}</span>
        </div>

        <div v-if="storeStore.store?.business_hours" class="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <Clock class="w-4 h-4 text-brand-400" />
          <span>{{ storeStore.store.business_hours }}</span>
        </div>

        <div class="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-medium">
          <ShieldCheck class="w-4 h-4" />
          <span>Atención Directa</span>
        </div>
      </div>

      <!-- Quick CTA -->
      <div class="pt-2">
        <button
          type="button"
          @click="openWhatsApp"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-all shadow-glow active:scale-95"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Hablar por WhatsApp</span>
        </button>
      </div>
    </div>
    </section>
  </div>
</template>
