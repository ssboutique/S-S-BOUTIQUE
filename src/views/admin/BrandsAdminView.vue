<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storageService } from '@/services/storageService';
import type { StoreBrandItem } from '@/types/database';
import {
  Crown,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Gauge,
  Upload,
  Check,
  Image as ImageIcon,
  Save,
  HelpCircle,
  ExternalLink
} from 'lucide-vue-next';

const adminStore = useAdminStore();

const brandsList = ref<StoreBrandItem[]>([]);
const newBrandName = ref('');
const newBrandTagline = ref('');
const newBrandLogoUrl = ref('');
const isUploadingBrandLogo = ref(false);

const direction = ref<'left' | 'right'>('left');
const speed = ref<'slow' | 'normal' | 'fast'>('normal');
const tickerText = ref('ALTA COSTURA & PIEZAS EXCLUSIVAS • ENVÍOS NACIONALES 100% ASEGURADOS • CALIDAD SUPERIOR GARANTIZADA • ATENCIÓN VIP DIRECTA POR WHATSAPP');

const presetBrands = [
  { name: 'GUCCI', tagline: 'Firenze 1921' },
  { name: 'PRADA', tagline: 'Milano Dal 1913' },
  { name: 'CHANEL', tagline: 'Paris Haute Couture' },
  { name: 'DIOR', tagline: 'Avenue Montaigne' },
  { name: 'LOUIS VUITTON', tagline: 'Maison Fondée 1854' },
  { name: 'SAINT LAURENT', tagline: 'Paris Rive Gauche' },
  { name: 'VERSACE', tagline: 'Milano Luxury' },
  { name: 'BALENCIAGA', tagline: 'Couture House' },
  { name: 'HERMÈS', tagline: 'Paris Sellier' },
  { name: 'FENDI', tagline: 'Roma 1925' },
  { name: 'ZARA', tagline: 'Woman Collection' },
  { name: 'CAROLINA HERRERA', tagline: 'New York' },
  { name: 'DOLCE & GABBANA', tagline: 'Italia' },
  { name: 'BURBERRY', tagline: 'London' }
];

watch(
  () => adminStore.currentStore,
  (store) => {
    if (store) {
      const theme = store.theme_settings || ({} as any);
      direction.value = theme.brand_marquee_direction || 'left';
      speed.value = theme.brand_marquee_speed || 'normal';
      tickerText.value = theme.ticker_text || 'ALTA COSTURA & PIEZAS EXCLUSIVAS • ENVÍOS NACIONALES 100% ASEGURADOS • CALIDAD SUPERIOR GARANTIZADA • ATENCIÓN VIP DIRECTA POR WHATSAPP';

      if (theme.brands && theme.brands.length > 0) {
        brandsList.value = JSON.parse(JSON.stringify(theme.brands));
      } else {
        brandsList.value = presetBrands.slice(0, 6).map((b, idx) => ({
          id: (idx + 1).toString(),
          name: b.name,
          description: b.tagline
        }));
      }
    }
  },
  { immediate: true }
);

function addBrand() {
  if (!newBrandName.value.trim()) return;
  brandsList.value.push({
    id: crypto.randomUUID(),
    name: newBrandName.value.trim().toUpperCase(),
    description: newBrandTagline.value.trim() || 'Diseño Exclusivo',
    logo_url: newBrandLogoUrl.value.trim() || undefined
  });
  newBrandName.value = '';
  newBrandTagline.value = '';
  newBrandLogoUrl.value = '';
}

function addPresetBrand(preset: { name: string; tagline: string }) {
  if (brandsList.value.some(b => b.name.toUpperCase() === preset.name.toUpperCase())) return;
  brandsList.value.push({
    id: crypto.randomUUID(),
    name: preset.name,
    description: preset.tagline
  });
}

function removeBrand(id: string) {
  brandsList.value = brandsList.value.filter(b => b.id !== id);
}

async function handleBrandLogoUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  isUploadingBrandLogo.value = true;
  try {
    const url = await storageService.uploadStoreAsset(input.files[0], 'logos');
    newBrandLogoUrl.value = url;
  } catch (err: any) {
    adminStore.setFeedback('error', 'Error al subir el logo de la marca');
  } finally {
    isUploadingBrandLogo.value = false;
  }
}

async function handleSave() {
  const currentTheme = adminStore.currentStore?.theme_settings || ({} as any);
  await adminStore.updateStore({
    theme_settings: {
      ...currentTheme,
      brands: brandsList.value,
      brand_marquee_direction: direction.value,
      brand_marquee_speed: speed.value,
      ticker_text: tickerText.value
    }
  });
}

const animationDurationClass = computed(() => {
  if (speed.value === 'slow') return '35s';
  if (speed.value === 'fast') return '14s';
  return '22s';
});
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-5xl pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Crown class="w-6 h-6 text-amber-500" />
          <span>Cinta de Marcas & Movimiento</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Configura las marcas que comercializas, personaliza el movimiento de la cinta hacia la izquierda o derecha y su velocidad.
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="adminStore.isSaving"
        class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all shrink-0"
      >
        <Save class="w-4 h-4 text-emerald-400" />
        <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </button>
    </div>

    <!-- Live Preview Box -->
    <div class="bg-slate-950 p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4 text-white relative overflow-hidden">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          Vista Previa en Vivo de tu Cinta
        </span>
        <span class="text-[11px] text-slate-400">
          Dirección: <strong class="text-white">{{ direction === 'left' ? 'Hacia la Izquierda ⬅️' : 'Hacia la Derecha ➡️' }}</strong>
        </span>
      </div>

      <!-- Moving Ribbon Preview -->
      <div class="relative overflow-hidden py-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div class="marquee-preview-wrapper group">
          <div
            class="marquee-preview-track"
            :class="direction === 'right' ? 'animate-track-right' : 'animate-track-left'"
            :style="{ animationDuration: animationDurationClass }"
          >
            <div
              v-for="b in brandsList"
              :key="`preview-1-${b.id}`"
              class="inline-flex flex-col items-center justify-center px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-800 min-w-[140px] shrink-0"
            >
              <img v-if="b.logo_url" :src="b.logo_url" class="h-6 max-w-[100px] object-contain mb-1" />
              <span v-else class="font-extrabold text-xs tracking-widest text-slate-200 uppercase font-serif">
                {{ b.name }}
              </span>
              <span class="text-[9px] text-slate-500 uppercase">{{ b.description || 'Colección' }}</span>
            </div>
          </div>

          <!-- Loop duplicate for seamless continuous ribbon -->
          <div
            class="marquee-preview-track"
            :class="direction === 'right' ? 'animate-track-right' : 'animate-track-left'"
            :style="{ animationDuration: animationDurationClass }"
            aria-hidden="true"
          >
            <div
              v-for="b in brandsList"
              :key="`preview-2-${b.id}`"
              class="inline-flex flex-col items-center justify-center px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-800 min-w-[140px] shrink-0"
            >
              <img v-if="b.logo_url" :src="b.logo_url" class="h-6 max-w-[100px] object-contain mb-1" />
              <span v-else class="font-extrabold text-xs tracking-widest text-slate-200 uppercase font-serif">
                {{ b.name }}
              </span>
              <span class="text-[9px] text-slate-500 uppercase">{{ b.description || 'Colección' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Motion & Direction Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Direction Card -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ArrowRight class="w-4 h-4 text-brand-600" />
          <span>Dirección del Desplazamiento</span>
        </h3>
        <p class="text-xs text-slate-500">
          Elige hacia qué lado deseas que se mueva la cinta de marcas en la página.
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="direction = 'left'"
            class="p-3.5 border rounded-2xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5"
            :class="direction === 'left' ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            <ArrowLeft class="w-5 h-5 text-brand-600" />
            <span>Hacia la Izquierda</span>
          </button>

          <button
            type="button"
            @click="direction = 'right'"
            class="p-3.5 border rounded-2xl text-center text-xs font-bold transition-all flex flex-col items-center gap-1.5"
            :class="direction === 'right' ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            <ArrowRight class="w-5 h-5 text-brand-600" />
            <span>Hacia la Derecha</span>
          </button>
        </div>
      </div>

      <!-- Speed Card -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Gauge class="w-4 h-4 text-amber-500" />
          <span>Velocidad de la Cinta</span>
        </h3>
        <p class="text-xs text-slate-500">
          Ajusta la suavidad y el ritmo del movimiento continuo.
        </p>
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            @click="speed = 'slow'"
            class="p-3 border rounded-2xl text-center text-xs font-bold transition-all"
            :class="speed === 'slow' ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            Suave / Lenta
          </button>
          <button
            type="button"
            @click="speed = 'normal'"
            class="p-3 border rounded-2xl text-center text-xs font-bold transition-all"
            :class="speed === 'normal' ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            Normal (Ideal)
          </button>
          <button
            type="button"
            @click="speed = 'fast'"
            class="p-3 border rounded-2xl text-center text-xs font-bold transition-all"
            :class="speed === 'fast' ? 'border-amber-500 bg-amber-50/50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            Dinámica
          </button>
        </div>
      </div>
    </div>

    <!-- Brands Management Card -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Crown class="w-5 h-5 text-amber-500" />
            <span>Marcas Trabajadas en tu Boutique</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Agrega las marcas que vendes en tu local o tienda virtual.
          </p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          {{ brandsList.length }} Marcas
        </span>
      </div>

      <!-- Quick Preset Chips -->
      <div class="space-y-2">
        <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Agregar con 1 Clic marcas reconocidas:
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in presetBrands"
            :key="preset.name"
            type="button"
            @click="addPresetBrand(preset)"
            class="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-xs font-bold text-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus class="w-3 h-3 text-amber-600" />
            <span>{{ preset.name }}</span>
          </button>
        </div>
      </div>

      <!-- Custom Brand Form -->
      <div class="pt-4 border-t border-slate-100 space-y-3">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          O Escribe una marca personalizada:
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div class="sm:col-span-5">
            <input
              v-model="newBrandName"
              type="text"
              placeholder="Nombre de la marca (ej: GUCCI, ARMANI, ZARA)"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 font-bold"
              @keyup.enter="addBrand"
            />
          </div>
          <div class="sm:col-span-4">
            <input
              v-model="newBrandTagline"
              type="text"
              placeholder="Subtítulo (ej: Alta Costura, Colección 2026)"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              @keyup.enter="addBrand"
            />
          </div>
          <div class="sm:col-span-3 flex items-center gap-2">
            <label class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
              <Upload class="w-3.5 h-3.5" />
              <span>{{ isUploadingBrandLogo ? '...' : 'Logo' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="handleBrandLogoUpload" :disabled="isUploadingBrandLogo" />
            </label>

            <button
              type="button"
              @click="addBrand"
              :disabled="!newBrandName.trim()"
              class="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus class="w-4 h-4" />
              <span>Añadir</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Current Brands Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        <div
          v-for="brand in brandsList"
          :key="brand.id"
          class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all group"
        >
          <div class="flex items-center gap-3 min-w-0 pr-2">
            <div v-if="brand.logo_url" class="w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center">
              <img :src="brand.logo_url" :alt="brand.name" class="max-h-full max-w-full object-contain" />
            </div>
            <div class="truncate">
              <span class="block text-xs font-extrabold text-slate-900 tracking-wider uppercase font-serif truncate">
                {{ brand.name }}
              </span>
              <span class="block text-[10px] text-slate-500 truncate">
                {{ brand.description || 'Diseño Exclusivo' }}
              </span>
            </div>
          </div>
          <button
            type="button"
            @click="removeBrand(brand.id)"
            class="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            aria-label="Eliminar marca"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Ticker Benefits Ribbon Configuration -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-amber-500" />
        <span>Cinta Superior de Beneficios y Anuncios</span>
      </h3>
      <p class="text-xs text-slate-500">
        Esta cinta infinita aparece en la parte superior de la página principal para comunicar envíos, promociones y garantías.
      </p>
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Texto de la cinta (Separar frases con •)
        </label>
        <input
          v-model="tickerText"
          type="text"
          class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
          placeholder="Ej: ENVÍOS GRATIS • ATENCIÓN VIP • ALTA COSTURA • PAGOS CONTRA ENTREGA"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-preview-wrapper {
  position: relative;
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: 1rem;
  width: 100%;
}

.marquee-preview-track {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 100%;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.animate-track-left {
  animation-name: preview-scroll-left;
}

.animate-track-right {
  animation-name: preview-scroll-right;
}

@keyframes preview-scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - 1rem));
  }
}

@keyframes preview-scroll-right {
  from {
    transform: translateX(calc(-100% - 1rem));
  }
  to {
    transform: translateX(0);
  }
}
</style>
