<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storageService } from '@/services/storageService';
import { Palette, Upload, Check, Image as ImageIcon, Sparkles } from 'lucide-vue-next';

const adminStore = useAdminStore();

const isUploadingLogo = ref(false);
const isUploadingBanner = ref(false);

const form = reactive({
  name: '',
  description: '',
  logo_url: '',
  banner_url: '',
  primary_color: '#16a34a',
  secondary_color: '#0f172a',
  card_style: 'rounded-2xl',
  header_style: 'modern',
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
    }
  },
  { immediate: true }
);

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
  await adminStore.updateStore({
    name: form.name,
    description: form.description,
    logo_url: form.logo_url || null,
    banner_url: form.banner_url || null,
    theme_settings: {
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      card_style: form.card_style as any,
      header_style: form.header_style as any,
      font_family: 'Plus Jakarta Sans',
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
  </div>
</template>
