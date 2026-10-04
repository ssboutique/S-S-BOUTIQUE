<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storageService } from '@/services/storageService';
import type { StoreBrandItem } from '@/types/database';
import { Palette, Upload, Check, Image as ImageIcon, Sparkles, Plus, Trash2, Crown, Star } from 'lucide-vue-next';

const adminStore = useAdminStore();

const isUploadingLogo = ref(false);
const isUploadingBanner = ref(false);

const brandsList = ref<StoreBrandItem[]>([]);
const newBrandName = ref('');
const newBrandTagline = ref('');

const form = reactive({
  name: '',
  description: '',
  logo_url: '',
  banner_url: '',
  primary_color: '#16a34a',
  secondary_color: '#0f172a',
  card_style: 'rounded-2xl',
  header_style: 'modern',
  ticker_text: 'ALTA COSTURA & PIEZAS EXCLUSIVAS • ENVÍOS NACIONALES 100% ASEGURADOS • CALIDAD SUPERIOR GARANTIZADA • ATENCIÓN VIP DIRECTA POR WHATSAPP',
  show_live_social_proof: true
});

const colorPresets = [
  { name: 'Esmeralda Pro', color: '#16a34a' },
  { name: 'Azul Real', color: '#2563eb' },
  { name: 'Índigo Elegante', color: '#4f46e5' },
  { name: 'Púrpura Moderno', color: '#9333ea' },
  { name: 'Rosa Vibrante', color: '#e11d48' },
  { name: 'Ámbar Cálido', color: '#d97706' },
  { name: 'Negro Minimal', color: '#0f172a' },
];

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
  { name: 'CAROLINA HERRERA', tagline: 'New York' }
];

watch(
  () => adminStore.currentStore,
  (store) => {
    if (store) {
      form.name = store.name;
      form.description = store.description || '';
      form.logo_url = store.logo_url || '';
      form.banner_url = store.banner_url || '';
      form.primary_color = store.theme_settings?.primary_color || '#16a34a';
      form.secondary_color = store.theme_settings?.secondary_color || '#0f172a';
      form.card_style = store.theme_settings?.card_style || 'rounded-2xl';
      form.header_style = store.theme_settings?.header_style || 'modern';
      form.ticker_text = store.theme_settings?.ticker_text || 'ALTA COSTURA & PIEZAS EXCLUSIVAS • ENVÍOS NACIONALES 100% ASEGURADOS • CALIDAD SUPERIOR GARANTIZADA • ATENCIÓN VIP DIRECTA POR WHATSAPP';
      form.show_live_social_proof = store.theme_settings?.show_live_social_proof !== false;
      
      if (store.theme_settings?.brands && store.theme_settings.brands.length > 0) {
        brandsList.value = JSON.parse(JSON.stringify(store.theme_settings.brands));
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
    description: newBrandTagline.value.trim() || 'Diseño Exclusivo'
  });
  newBrandName.value = '';
  newBrandTagline.value = '';
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

async function handleLogoUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  isUploadingLogo.value = true;
  try {
    const url = await storageService.uploadStoreAsset(input.files[0], 'logos');
    form.logo_url = url;
  } catch (err: any) {
    adminStore.setFeedback('error', 'Error al subir el logo');
  } finally {
    isUploadingLogo.value = false;
  }
}

async function handleBannerUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;
  isUploadingBanner.value = true;
  try {
    const url = await storageService.uploadStoreAsset(input.files[0], 'banners');
    form.banner_url = url;
  } catch (err: any) {
    adminStore.setFeedback('error', 'Error al subir la imagen de portada');
  } finally {
    isUploadingBanner.value = false;
  }
}

async function handleSave() {
  const existingSettings = adminStore.currentStore?.theme_settings || ({} as any);
  await adminStore.updateStore({
    name: form.name,
    description: form.description,
    logo_url: form.logo_url || null,
    banner_url: form.banner_url || null,
    theme_settings: {
      ...existingSettings,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      card_style: form.card_style as any,
      header_style: form.header_style as any,
      font_family: 'Plus Jakarta Sans',
      ticker_text: form.ticker_text,
      brands: brandsList.value,
      show_live_social_proof: form.show_live_social_proof
    },
  });
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Apariencia de mi Tienda
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Personaliza la identidad visual, logo, portada y colores de tu catálogo
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="adminStore.isSaving"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
      >
        <Check class="w-4 h-4" />
        <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
      </button>
    </div>

    <!-- Identity & Branding Card -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-brand-500" />
        <span>Identidad Visual & Logo</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Logo Uploader -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Logo de tu tienda
          </label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner flex items-center justify-center">
              <img v-if="form.logo_url" :src="form.logo_url" class="w-full h-full object-cover" />
              <ImageIcon v-else class="w-8 h-8 text-slate-400" />
            </div>

            <label class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors">
              <span>{{ isUploadingLogo ? 'Cargando...' : 'Subir nuevo logo' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" :disabled="isUploadingLogo" />
            </label>
          </div>
        </div>

        <!-- Banner Uploader -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Imagen de Portada (Banner)
          </label>
          <div class="flex items-center gap-4">
            <div class="w-28 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner flex items-center justify-center">
              <img v-if="form.banner_url" :src="form.banner_url" class="w-full h-full object-cover" />
              <ImageIcon v-else class="w-8 h-8 text-slate-400" />
            </div>

            <label class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors">
              <span>{{ isUploadingBanner ? 'Cargando...' : 'Subir portada' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="handleBannerUpload" :disabled="isUploadingBanner" />
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Colors & Styling -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Palette class="w-5 h-5 text-brand-500" />
        <span>Paleta de Color Principal</span>
      </h3>

      <div class="space-y-3">
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="preset in colorPresets"
            :key="preset.color"
            type="button"
            @click="form.primary_color = preset.color"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all"
            :class="form.primary_color === preset.color ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'"
          >
            <span class="w-4 h-4 rounded-full shadow-inner" :style="{ backgroundColor: preset.color }"></span>
            <span>{{ preset.name }}</span>
          </button>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <label class="text-xs text-slate-600 font-medium">O elige un color personalizado:</label>
          <input
            v-model="form.primary_color"
            type="color"
            class="w-10 h-10 p-0.5 rounded-xl border border-slate-200 cursor-pointer"
          />
          <span class="font-mono text-xs text-slate-500">{{ form.primary_color }}</span>
        </div>
      </div>

      <!-- Card Styles -->
      <div class="pt-4 border-t border-slate-100 space-y-3">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Estilo de Tarjetas de Producto
        </label>
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            @click="form.card_style = 'rounded-xl'"
            class="p-4 border rounded-xl text-center text-xs font-bold transition-all"
            :class="form.card_style === 'rounded-xl' ? 'border-brand-500 bg-brand-50/30 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-600'"
          >
            Clásico Suave
          </button>
          <button
            type="button"
            @click="form.card_style = 'rounded-2xl'"
            class="p-4 border rounded-2xl text-center text-xs font-bold transition-all"
            :class="form.card_style === 'rounded-2xl' ? 'border-brand-500 bg-brand-50/30 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-600'"
          >
            Moderno Curvo (Recomendado)
          </button>
          <button
            type="button"
            @click="form.card_style = 'rounded-3xl'"
            class="p-4 border rounded-3xl text-center text-xs font-bold transition-all"
            :class="form.card_style === 'rounded-3xl' ? 'border-brand-500 bg-brand-50/30 text-brand-700 shadow-sm' : 'border-slate-200 text-slate-600'"
          >
            Ultra Redondeado
          </button>
        </div>
      </div>
    </div>

    <!-- Ribbon Ticker & Live Social Proof -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-amber-500" />
          <span>Cinta de Anuncios & Actividad en Vivo</span>
        </h3>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
          Alta Conversión
        </span>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Texto de la Cinta Animada (Separar beneficios con •)
          </label>
          <input
            v-model="form.ticker_text"
            type="text"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 font-medium"
            placeholder="Ej: ENVÍOS GRATIS • ATENCIÓN VIP • ALTA COSTURA • PAGOS CONTRA ENTREGA"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            Aparece en la parte superior como una cinta infinita de lujo destacando los beneficios de tu tienda.
          </p>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="block text-xs font-bold text-slate-800">Contador de Visitas & Notificaciones de WhatsApp</span>
            <span class="text-[11px] text-slate-500">Muestra clientes activos en tiempo real y alerta de pedidos VIP para dar máxima confianza</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.show_live_social_proof" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Brands Worked With Slider (Marcas Trabajadas) -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Crown class="w-5 h-5 text-amber-500" />
          <span>Marcas & Diseñadores Destacados (Slider de Marcas)</span>
        </h3>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
          {{ brandsList.length }} marcas activas
        </span>
      </div>

      <p class="text-xs text-slate-500">
        Personaliza las marcas o firmas que comercializas. Se mostrarán en una cinta infinita elegante en la tienda para dar respaldo y confianza a tus clientes.
      </p>

      <!-- Preset Luxury Brands Quick Add -->
      <div class="space-y-2">
        <label class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Agregar rápidamente marcas de lujo reconocidas:
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in presetBrands"
            :key="preset.name"
            type="button"
            @click="addPresetBrand(preset)"
            class="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-xs font-bold text-slate-700 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus class="w-3 h-3 text-amber-600" />
            <span>{{ preset.name }}</span>
          </button>
        </div>
      </div>

      <!-- Custom Brand Add Form -->
      <div class="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div class="sm:col-span-6">
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
            placeholder="Lema o subtítulo (ej: Alta Costura)"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
            @keyup.enter="addBrand"
          />
        </div>
        <div class="sm:col-span-2">
          <button
            type="button"
            @click="addBrand"
            :disabled="!newBrandName.trim()"
            class="w-full h-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus class="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- Current Brands List -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        <div
          v-for="brand in brandsList"
          :key="brand.id"
          class="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all"
        >
          <div class="min-w-0 pr-2">
            <span class="block text-xs font-extrabold text-slate-900 tracking-wider uppercase font-serif truncate">
              {{ brand.name }}
            </span>
            <span class="block text-[10px] text-slate-500 truncate">
              {{ brand.description || 'Diseño Exclusivo' }}
            </span>
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
  </div>
</template>
