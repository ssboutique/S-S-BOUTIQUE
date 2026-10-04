<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { storageService } from '@/services/storageService';
import {
  Crown,
  Check,
  Camera,
  Trash2,
  Upload,
  ExternalLink,
  Sparkles,
  Eye,
  Info,
  ShieldCheck
} from 'lucide-vue-next';

const adminStore = useAdminStore();

const isUploadingPhotos = ref(false);

const form = reactive({
  enabled: true,
  title: '',
  subtitle: '',
  story: '',
  photos: [] as string[],
});

watch(
  () => adminStore.currentStore,
  (store) => {
    if (store) {
      const ab = store.theme_settings?.about;
      form.enabled = ab?.enabled ?? true;
      form.title = ab?.title || '';
      form.subtitle = ab?.subtitle || '';
      form.story = ab?.story || '';
      form.photos = ab?.photos ? [...ab.photos] : [];
    }
  },
  { immediate: true }
);

const publicAboutUrl = computed(() => {
  const slug = adminStore.currentStore?.slug || 'ss-boutique';
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/tienda/${slug}/nosotros`;
  }
  return `/tienda/${slug}/nosotros`;
});

async function handlePhotoUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  isUploadingPhotos.value = true;
  try {
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const url = await storageService.uploadStoreAsset(file, 'about');
      form.photos.push(url);
    }
    adminStore.setFeedback('success', '¡Fotos agregadas a la galería!');
  } catch (err: any) {
    adminStore.setFeedback('error', 'Error al subir fotos para la galería');
  } finally {
    isUploadingPhotos.value = false;
    input.value = '';
  }
}

function removePhoto(index: number) {
  form.photos.splice(index, 1);
}

async function handleSave() {
  if (!adminStore.currentStore) return;

  await adminStore.updateStore({
    theme_settings: {
      ...(adminStore.currentStore.theme_settings || {
        primary_color: '#0f172a',
        secondary_color: '#1e293b',
        card_style: 'rounded-2xl',
        header_style: 'modern',
        font_family: 'Plus Jakarta Sans',
      }),
      about: {
        enabled: form.enabled,
        title: form.title.trim() || undefined,
        subtitle: form.subtitle.trim() || undefined,
        story: form.story.trim() || undefined,
        photos: form.photos,
      },
    },
  });
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Página Quiénes Somos
          </h1>
          <span class="px-2.5 py-0.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/40 border border-fuchsia-200 text-fuchsia-700 dark:text-fuchsia-400 text-xs font-bold">
            Página Dedicada
          </span>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Edita la historia de tu marca, a qué se dedican y gestiona la galería fotográfica de tu tienda
        </p>
      </div>

      <div class="flex items-center gap-3">
        <a
          :href="publicAboutUrl"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition-all"
        >
          <span>Ver Página</span>
          <ExternalLink class="w-3.5 h-3.5 text-slate-400" />
        </a>

        <button
          type="button"
          @click="handleSave"
          :disabled="adminStore.isSaving"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 disabled:opacity-50"
        >
          <Check class="w-4 h-4" />
          <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
        </button>
      </div>
    </div>

    <!-- Live URL preview card -->
    <div class="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-50/70 via-purple-50/50 to-pink-50/70 border border-fuchsia-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-fuchsia-600 text-white flex items-center justify-center font-bold shrink-0">
          <Crown class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-900">Enlace directo de la página Quiénes Somos:</div>
          <div class="text-xs font-mono font-bold text-fuchsia-700 select-all truncate">
            {{ publicAboutUrl }}
          </div>
        </div>
      </div>
      <a
        :href="publicAboutUrl"
        target="_blank"
        class="inline-flex items-center gap-1 text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 bg-white px-3 py-1.5 rounded-xl border border-fuchsia-200 shadow-sm shrink-0"
      >
        <span>Abrir en nueva pestaña</span>
        <ExternalLink class="w-3 h-3" />
      </a>
    </div>

    <!-- Main Configuration Form -->
    <form @submit.prevent="handleSave" class="space-y-6">
      
      <!-- Card: Story & Brand Details -->
      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
            <span>Información de la Marca & Historia</span>
          </h3>

          <label class="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Página activa:</span>
            <input
              v-model="form.enabled"
              type="checkbox"
              class="w-5 h-5 text-fuchsia-600 rounded border-slate-300 focus:ring-fuchsia-500 cursor-pointer"
            />
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título Principal
            </label>
            <input
              v-model="form.title"
              type="text"
              placeholder="Ej: Quiénes Somos | Nuestra Esencia & Atelier"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lema o Subtítulo
            </label>
            <input
              v-model="form.subtitle"
              type="text"
              placeholder="Ej: Alta confección, calzado de autor y asesoría personalizada"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Historia, Propósito & A qué se dedican
          </label>
          <textarea
            v-model="form.story"
            rows="6"
            placeholder="Cuenta la trayectoria de tu marca, el cuidado en la confección de cada prenda, materiales nobles utilizados, el valor del calzado artesanal y la experiencia que reciben tus clientes..."
            class="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      <!-- Card: Photo Gallery Slider Upload -->
      <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera class="w-5 h-5 text-amber-500" />
              <span>Galería de Fotos del Local, Taller & Equipo ({{ form.photos.length }})</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Estas fotos se exhiben en el slider automático de la página Quiénes Somos
            </p>
          </div>

          <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0">
            <Upload class="w-4 h-4" />
            <span>{{ isUploadingPhotos ? 'Subiendo fotos...' : '+ Subir Fotos' }}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handlePhotoUpload"
              class="hidden"
              :disabled="isUploadingPhotos"
            />
          </label>
        </div>

        <!-- Photos Grid -->
        <div v-if="form.photos.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="(photoUrl, idx) in form.photos"
            :key="idx"
            class="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-sm bg-slate-100 dark:bg-slate-800"
          >
            <img :src="photoUrl" class="w-full h-full object-cover" />
            
            <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                @click="removePhoto(idx)"
                class="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-transform active:scale-90"
                title="Eliminar foto"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <span class="absolute top-2 left-2 bg-slate-950/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm">
              Foto {{ idx + 1 }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-850"
        >
          <Camera class="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Aún no has subido fotografías de tu tienda</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Sube fotos de tu vitrina, el taller de confección, telas exclusivas o el equipo de trabajo para transmitir confianza a tus clientes.
          </p>
        </div>
      </div>

    </form>
  </div>
</template>
