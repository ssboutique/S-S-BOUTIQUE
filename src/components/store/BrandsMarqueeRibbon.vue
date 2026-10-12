<script setup lang="ts">
import { computed } from 'vue';
import { useStoreStore } from '@/stores/store';

const storeStore = useStoreStore();

const defaultBrands = [
  { id: '1',  name: 'GUCCI',           tagline: 'Firenze 1921' },
  { id: '2',  name: 'PRADA',           tagline: 'Milano 1913' },
  { id: '3',  name: 'CHANEL',          tagline: 'Paris Haute Couture' },
  { id: '4',  name: 'DIOR',            tagline: 'Avenue Montaigne' },
  { id: '5',  name: 'LOUIS VUITTON',   tagline: 'Maison 1854' },
  { id: '6',  name: 'SAINT LAURENT',   tagline: 'Rive Gauche' },
  { id: '7',  name: 'BALENCIAGA',      tagline: 'Couture House' },
  { id: '8',  name: 'VERSACE',         tagline: 'Milano Luxury' },
  { id: '9',  name: 'HERMÈS',          tagline: 'Paris Sellier' },
  { id: '10', name: 'FENDI',           tagline: 'Roma 1925' },
  { id: '11', name: 'CAROLINA HERRERA',tagline: 'New York' },
  { id: '12', name: 'ZARA',            tagline: 'Woman Collection' },
];

const baseBrands = computed(() => {
  const custom = storeStore.store?.theme_settings?.brands;
  if (custom && custom.length > 0) {
    return custom.map(b => ({
      id:       b.id,
      name:     b.name.toUpperCase(),
      tagline:  b.description || 'Diseño Exclusivo',
      logo_url: b.logo_url,
    }));
  }
  return defaultBrands;
});

const brands = computed(() => {
  const list = baseBrands.value;
  return list.length < 6 ? [...list, ...list, ...list] : list;
});

const duration = computed(() => {
  const speed = storeStore.store?.theme_settings?.brand_marquee_speed || 'normal';
  return speed === 'slow' ? '38s' : speed === 'fast' ? '14s' : '24s';
});

const direction = computed(() =>
  storeStore.store?.theme_settings?.brand_marquee_direction || 'left'
);
</script>

<template>
  <div
    class="bmr-root"
    role="region"
    aria-label="Marcas y diseñadores destacados"
  >
    <!-- Glass strip background -->
    <div class="bmr-bg" aria-hidden="true">
      <div class="bmr-bg-glow bmr-bg-glow-l"></div>
      <div class="bmr-bg-glow bmr-bg-glow-r"></div>
    </div>

    <!-- Left / right fade masks -->
    <div class="bmr-mask bmr-mask-l" aria-hidden="true"></div>
    <div class="bmr-mask bmr-mask-r" aria-hidden="true"></div>

    <!-- Marquee track -->
    <div class="bmr-viewport group" aria-hidden="false">
      <div
        class="bmr-track"
        :class="direction === 'right' ? 'bmr-dir-right' : 'bmr-dir-left'"
        :style="{ animationDuration: duration }"
        role="list"
      >
        <!-- Set A -->
        <div
          v-for="(b, i) in brands"
          :key="`a-${b.id}-${i}`"
          class="bmr-item"
          role="listitem"
        >
          <!-- Logo image -->
          <img
            v-if="b.logo_url"
            :src="b.logo_url"
            :alt="b.name"
            class="bmr-logo"
          />
          <!-- Text mark -->
          <template v-else>
            <span class="bmr-name">{{ b.name }}</span>
            <span class="bmr-tagline">{{ b.tagline }}</span>
          </template>
          <!-- Divider diamond -->
          <span class="bmr-divider" aria-hidden="true"></span>
        </div>

        <!-- Set B — seamless duplicate -->
        <div
          v-for="(b, i) in brands"
          :key="`b-${b.id}-${i}`"
          class="bmr-item"
          aria-hidden="true"
        >
          <img v-if="b.logo_url" :src="b.logo_url" :alt="b.name" class="bmr-logo" />
          <template v-else>
            <span class="bmr-name">{{ b.name }}</span>
            <span class="bmr-tagline">{{ b.tagline }}</span>
          </template>
          <span class="bmr-divider" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────── */
.bmr-root {
  position: relative;
  overflow: hidden;
  /* matches page gradient but darker + glass */
  background: rgba(20, 4, 48, 0.72);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 10px 0;
  z-index: 30;
}

/* ── Background glows ────────────────────────────── */
.bmr-bg { position: absolute; inset: 0; pointer-events: none; }

.bmr-bg-glow {
  position: absolute;
  width: 300px;
  height: 200%;
  top: -50%;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .35;
}
.bmr-bg-glow-l {
  left: -80px;
  background: radial-gradient(circle, #833ab4 0%, transparent 70%);
}
.bmr-bg-glow-r {
  right: -80px;
  background: radial-gradient(circle, #ee2a7b 0%, transparent 70%);
}

/* ── Edge fade masks ─────────────────────────────── */
.bmr-mask {
  position: absolute;
  top: 0; bottom: 0;
  width: 80px;
  z-index: 10;
  pointer-events: none;
}
.bmr-mask-l {
  left: 0;
  background: linear-gradient(to right, rgba(20,4,48,.95) 0%, transparent 100%);
}
.bmr-mask-r {
  right: 0;
  background: linear-gradient(to left, rgba(20,4,48,.95) 0%, transparent 100%);
}

/* ── Viewport & track ────────────────────────────── */
.bmr-viewport {
  overflow: hidden;
  width: 100%;
}

.bmr-track {
  display: flex;
  align-items: center;
  gap: 0;
  width: max-content;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
.group:hover .bmr-track {
  animation-play-state: paused;
}

.bmr-dir-left  { animation-name: bmrLeft;  }
.bmr-dir-right { animation-name: bmrRight; }

@keyframes bmrLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes bmrRight {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}

/* ── Item ────────────────────────────────────────── */
.bmr-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  position: relative;
  flex-shrink: 0;
  cursor: default;
}

/* ── Logo image ──────────────────────────────────── */
.bmr-logo {
  max-height: 22px;
  max-width: 100px;
  object-fit: contain;
  opacity: .55;
  filter: brightness(0) invert(1);
  transition: opacity .25s, filter .25s;
}
.bmr-item:hover .bmr-logo {
  opacity: .9;
  filter: none;
}

/* ── Text mark ───────────────────────────────────── */
.bmr-name {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .22em;
  text-transform: uppercase;
  white-space: nowrap;
  /* Gradient text matching IG palette but soft */
  background: linear-gradient(90deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.75) 50%, rgba(255,255,255,.55) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: filter .25s;
}
.bmr-tagline {
  font-size: 8px;
  font-weight: 500;
  letter-spacing: .18em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(255,255,255,.22);
  transition: color .25s;
}

.bmr-item:hover .bmr-name {
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: none;
}
.bmr-item:hover .bmr-tagline {
  color: rgba(255,255,255,.45);
}

/* ── Divider diamond ─────────────────────────────── */
.bmr-divider {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 0.5px;
  transform: rotate(45deg);
  background: linear-gradient(135deg, rgba(249,206,52,.5), rgba(238,42,123,.5));
  flex-shrink: 0;
}
</style>
