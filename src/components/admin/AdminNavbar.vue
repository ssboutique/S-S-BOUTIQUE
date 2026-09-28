<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import { Menu, ExternalLink, LogOut, Eye, Copy, Check } from 'lucide-vue-next';

defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();
const copied = ref(false);

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

const fullPublicUrl = computed(() => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const slug = adminStore.currentStore?.slug || 'ss-boutique';
    return `${origin}/tienda/${slug}`;
  }
  return `/tienda/${adminStore.currentStore?.slug || 'ss-boutique'}`;
});

async function copyStoreLink() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullPublicUrl.value);
    } else {
      const input = document.createElement('input');
      input.value = fullPublicUrl.value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Error copying link:', err);
  }
}

const currentSectionName = computed(() => {
  switch (route.name) {
    case 'admin-dashboard':
      return 'Resumen General';
    case 'admin-products':
      return 'Productos & Catálogo';
    case 'admin-categories':
      return 'Categorías';
    case 'admin-orders':
      return 'Historial de Pedidos WhatsApp';
    case 'admin-appearance':
      return 'Apariencia de la Tienda';
    case 'admin-store-info':
      return 'Información Comercial';
    case 'admin-whatsapp':
      return 'Canal de WhatsApp';
    default:
      return 'Panel de Administración';
  }
});
</script>

<template>
  <header class="h-16 sm:h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0">
    <div class="flex items-center gap-3">
      <!-- Mobile Sidebar Toggle -->
      <button
        type="button"
        @click="$emit('toggleSidebar')"
        class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden"
        aria-label="Abrir navegación lateral"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-sm font-bold text-slate-900">
            {{ currentSectionName }}
          </span>
          <span
            v-if="adminStore.currentStore?.is_active"
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Tienda Activa</span>
          </span>
          <span
            v-else
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>En Pausa</span>
          </span>
        </div>
        <p class="text-[11px] text-slate-500 hidden sm:block">
          {{ adminStore.currentStore?.name || 'S&S BOUTIQUE' }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- One-click Copy Store URL -->
      <button
        type="button"
        @click="copyStoreLink"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95"
        :class="
          copied
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
        "
        title="Copiar el enlace público para compartirlo"
      >
        <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
        <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
        <span class="hidden md:inline">{{ copied ? '¡Copiado!' : 'Copiar Enlace' }}</span>
      </button>

      <!-- View Public Store -->
      <a
        :href="fullPublicUrl"
        target="_blank"
        class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
        title="Abrir tienda pública en nueva pestaña"
      >
        <Eye class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Ver Tienda</span>
        <ExternalLink class="w-3 h-3 text-slate-400" />
      </a>

      <!-- Logout -->
      <button
        type="button"
        @click="handleLogout"
        class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
