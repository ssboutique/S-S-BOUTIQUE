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
  { id: '10', name: 'FENDI', tagline: 'Roma 1925' },
  { id: '11', name: 'ZARA', tagline: 'Woman Collection' },
  { id: '12', name: 'CAROLINA HERRERA', tagline: 'New York' }
];

const baseBrands = computed(() => {
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

// Repeat brands if list is short to ensure continuous infinite loop
const brands = computed(() => {
  const list = baseBrands.value;
  if (list.length < 6) {
    return [...list, ...list, ...list];
  }
  return list;
});

const direction = computed(() => {
  return storeStore.store?.theme_settings?.brand_marquee_direction || 'left';
});

const speedClass = computed(() => {
  const speed = storeStore.store?.theme_settings?.brand_marquee_speed || 'normal';
  if (speed === 'slow') return '35s';
  if (speed === 'fast') return '15s';
  return '22s';
});
</script>

<template>
  <section class="py-8 sm:py-12 bg-slate-900/80 border-y border-slate-800/90 relative overflow-hidden backdrop-blur-md select-none" aria-label="Marcas y Diseñadores Exclusivos">
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

    <!-- Infinite Ribbon Tape Track Container -->
    <div class="marquee-wrapper group">
      <!-- Gradient Fade Edges -->
      <div class="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
      <div class="absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

      <!-- Single track with content duplicated inside for seamless loop -->
      <div
        class="marquee-track group-hover:[animation-play-state:paused]"
        :class="direction === 'right' ? 'animate-track-right' : 'animate-track-left'"
        :style="{ animationDuration: speedClass }"
      >
        <!-- Original set -->
        <div
          v-for="(brand, i) in brands"
          :key="`a-${brand.id}-${i}`"
          class="marquee-item"
        >
          <div v-if="brand.logo_url" class="h-8 flex items-center justify-center">
            <img :src="brand.logo_url" :alt="brand.name" class="max-h-7 max-w-[110px] object-contain opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <template v-else>
            <span class="brand-name">{{ brand.name }}</span>
            <span class="brand-tagline">{{ brand.tagline }}</span>
          </template>
        </div>

        <!-- Exact duplicate for seamless infinite loop -->
        <div
          v-for="(brand, i) in brands"
          :key="`b-${brand.id}-${i}`"
          class="marquee-item"
          aria-hidden="true"
        >
          <div v-if="brand.logo_url" class="h-8 flex items-center justify-center">
            <img :src="brand.logo_url" :alt="brand.name" class="max-h-7 max-w-[110px] object-contain opacity-70 hover:opacity-100 transition-opacity" />
          </div>
          <template v-else>
            <span class="brand-name">{{ brand.name }}</span>
            <span class="brand-tagline">{{ brand.tagline }}</span>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marquee-wrapper {
  position: relative;
  overflow: hidden;
  width: 100%;
}

/* Single track — content is duplicated inside so we only need to shift -50% */
.marquee-track {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  width: max-content;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.animate-track-left {
  animation-name: marquee-left;
}

.animate-track-right {
  animation-name: marquee-right;
}

@keyframes marquee-left {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes marquee-right {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

/* Each brand item — clean, no cards */
.marquee-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 0.15rem;
  padding: 0 1rem;
}

.brand-name {
  font-family: serif;
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #cbd5e1; /* slate-300 */
  transition: color 0.25s;
  white-space: nowrap;
}

.marquee-item:hover .brand-name {
  color: #fcd34d; /* amber-300 */
}

.brand-tagline {
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #475569; /* slate-600 */
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.25s;
}

.marquee-item:hover .brand-tagline {
  color: #94a3b8; /* slate-400 */
}

/* Separator dot between items */
.marquee-item::after {
  content: '·';
  position: absolute;
  right: -1.35rem;
  color: #1e293b; /* slate-800 */
  font-size: 1.2rem;
  line-height: 1;
}

.marquee-item {
  position: relative;
}
</style>
