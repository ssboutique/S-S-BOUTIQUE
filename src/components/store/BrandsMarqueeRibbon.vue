<script setup lang="ts">
import { computed } from 'vue';
import { useStoreStore } from '@/stores/store';
import { Crown, Sparkles, ShieldCheck } from 'lucide-vue-next';

const storeStore = useStoreStore();

// Default luxury brands if not customized by admin
const defaultBrands = [
  { id: '1', name: 'GUCCI', tagline: 'Firenze 1921' },
  { id: '2', name: 'PRADA', tagline: 'Milano Dal 1913' },
  { id: '3', name: 'CHANEL', tagline: 'Paris Haute Couture' },
  { id: '4', name: 'DIOR', tagline: 'Avenue Montaigne' },
  { id: '5', name: 'LOUIS VUITTON', tagline: 'Maison Fondée 1854' },
  { id: '6', name: 'SAINT LAURENT', tagline: 'Paris Rive Gauche' },
  { id: '7', name: 'BALENCIAGA', tagline: 'Couture House' },
  { id: '8', name: 'VERSACE', tagline: 'Milano Luxury' },
  { id: '9', name: 'HERMÈS', tagline: 'Paris Sellier' },
  { id: '10', name: 'FENDI', tagline: 'Roma 1925' }
];

const brands = computed(() => {
  const custom = storeStore.store?.theme_settings?.brands;
  if (custom && custom.length > 0) {
    return custom.map(b => ({
      id: b.id,
      name: b.name.toUpperCase(),
      tagline: b.description || 'Diseño Exclusivo',
      logo_url: b.logo_url
    }));
  }
  return defaultBrands;
});
const direction = computed(() => {
  return storeStore.store?.theme_settings?.brand_marquee_direction || 'left';
});

const speedClass = computed(() => {
  const speed = storeStore.store?.theme_settings?.brand_marquee_speed || 'normal';
  if (speed === 'slow') return '38s';
  if (speed === 'fast') return '16s';
  return '25s';
});
</script>

<template>
  <section class="py-8 sm:py-12 bg-slate-900/60 border-y border-slate-800/80 relative overflow-hidden backdrop-blur-sm select-none" aria-label="Marcas y Diseñadores Exclusivos">
    <!-- Ambient backdrops -->
    <div class="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-2">
        <Crown class="w-3.5 h-3.5 text-amber-400" />
        <span>Garantía de Autenticidad & Excelencia</span>
      </div>
      <h3 class="text-sm sm:text-base font-extrabold text-white tracking-wider uppercase font-serif">
        Marcas & Diseñadores Destacados
      </h3>
      <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
        Trabajamos con las mejores firmas y colecciones exclusivas para garantizarte la máxima calidad.
      </p>
    </div>

    <!-- Endless Brand Tape Ribbon with Direction Support -->
    <div class="relative overflow-hidden group">
      <!-- Gradient Fade Edges -->
      <div class="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

      <div class="flex whitespace-nowrap overflow-hidden">
        <!-- Loop 1 -->
        <div
          class="inline-flex items-center gap-4 sm:gap-6 shrink-0 group-hover:[animation-play-state:paused]"
          :class="direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left'"
          :style="{ animationDuration: speedClass }"
        >
          <div
            v-for="brand in brands"
            :key="`b1-${brand.id}`"
            class="inline-flex flex-col items-center justify-center px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 shadow-sm min-w-[150px] sm:min-w-[190px] group/card cursor-default"
          >
            <div v-if="brand.logo_url" class="h-8 mb-1 flex items-center justify-center">
              <img :src="brand.logo_url" :alt="brand.name" class="max-h-7 max-w-[120px] object-contain filter brightness-90 group-hover/card:brightness-110 transition-all" />
            </div>
            <span
              v-else
              class="font-black text-sm sm:text-base tracking-[0.25em] text-slate-200 group-hover/card:text-amber-300 transition-colors uppercase font-serif"
            >
              {{ brand.name }}
            </span>
            <span class="text-[10px] text-slate-500 group-hover/card:text-slate-400 tracking-wider font-medium uppercase mt-0.5">
              {{ brand.tagline }}
            </span>
          </div>
        </div>

        <!-- Loop 2 (Infinite duplicate) -->
        <div
          class="inline-flex items-center gap-4 sm:gap-6 shrink-0 group-hover:[animation-play-state:paused]"
          :class="direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left'"
          :style="{ animationDuration: speedClass }"
          aria-hidden="true"
        >
          <div
            v-for="brand in brands"
            :key="`b2-${brand.id}`"
            class="inline-flex flex-col items-center justify-center px-6 sm:px-8 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 shadow-sm min-w-[150px] sm:min-w-[190px] group/card cursor-default"
          >
            <div v-if="brand.logo_url" class="h-8 mb-1 flex items-center justify-center">
              <img :src="brand.logo_url" :alt="brand.name" class="max-h-7 max-w-[120px] object-contain filter brightness-90 group-hover/card:brightness-110 transition-all" />
            </div>
            <span
              v-else
              class="font-black text-sm sm:text-base tracking-[0.25em] text-slate-200 group-hover/card:text-amber-300 transition-colors uppercase font-serif"
            >
              {{ brand.name }}
            </span>
            <span class="text-[10px] text-slate-500 group-hover/card:text-slate-400 tracking-wider font-medium uppercase mt-0.5">
              {{ brand.tagline }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

.animate-marquee-left {
  display: inline-flex;
  animation: marquee-left linear infinite;
  min-width: 100%;
}

.animate-marquee-right {
  display: inline-flex;
  animation: marquee-right linear infinite;
  min-width: 100%;
}
</style>
