<script setup lang="ts">
import { computed } from 'vue';
import { useStoreStore } from '@/stores/store';
import { Sparkles, ShieldCheck, Truck, Clock, Award, Star } from 'lucide-vue-next';

const storeStore = useStoreStore();

const tickerText = computed(() => {
  return storeStore.store?.theme_settings?.ticker_text;
});

const defaultItems = [
  { icon: Sparkles, text: 'ALTA COSTURA & PIEZAS EXCLUSIVAS' },
  { icon: Truck, text: 'ENVÍOS NACIONALES 100% ASEGURADOS' },
  { icon: Award, text: 'CALIDAD SUPERIOR GARANTIZADA' },
  { icon: Clock, text: 'ATENCIÓN VIP DIRECTA POR WHATSAPP' },
  { icon: ShieldCheck, text: 'COMPRAS 100% SEGURAS & PROTEGIDAS' },
  { icon: Star, text: 'COLECCIÓN EXCLUSIVA 2026' }
];

const items = computed(() => {
  if (tickerText.value) {
    const split = tickerText.value.split('•').map(t => t.trim()).filter(Boolean);
    if (split.length > 0) {
      return split.map((t, idx) => ({
        icon: idx % 2 === 0 ? Sparkles : Star,
        text: t.toUpperCase()
      }));
    }
  }
  return defaultItems;
});
</script>

<template>
  <div class="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-amber-500/20 py-2.5 shadow-sm select-none z-20">
    <!-- Golden Accent glow -->
    <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-amber-500/5 pointer-events-none"></div>

    <div class="flex whitespace-nowrap overflow-hidden group">
      <!-- Track 1 -->
      <div class="inline-flex items-center gap-8 animate-marquee shrink-0 group-hover:[animation-play-state:paused]">
        <div
          v-for="(item, i) in items"
          :key="`track1-${i}`"
          class="inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest text-slate-300 uppercase"
        >
          <component :is="item.icon" class="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-slate-200 font-extrabold tracking-wider">
            {{ item.text }}
          </span>
          <span class="text-amber-500/50 text-xs font-black">✦</span>
        </div>
      </div>

      <!-- Track 2 (Infinite duplicate) -->
      <div class="inline-flex items-center gap-8 animate-marquee shrink-0 group-hover:[animation-play-state:paused]" aria-hidden="true">
        <div
          v-for="(item, i) in items"
          :key="`track2-${i}`"
          class="inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest text-slate-300 uppercase"
        >
          <component :is="item.icon" class="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-slate-200 font-extrabold tracking-wider">
            {{ item.text }}
          </span>
          <span class="text-amber-500/50 text-xs font-black">✦</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  display: inline-flex;
  animation: marquee 25s linear infinite;
  min-width: 100%;
}
</style>
