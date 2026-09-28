<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';
import { Menu, ExternalLink, LogOut, Eye, Sun, Moon } from 'lucide-vue-next';

defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

const fullPublicUrl = computed(() => adminStore.publicStoreUrl);

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
  <header class="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between z-30 sticky top-0 transition-colors">
    <div class="flex items-center gap-3">
      <!-- Mobile Sidebar Toggle -->
      <button
        type="button"
        @click="$emit('toggleSidebar')"
        class="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        aria-label="Abrir navegación lateral"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ currentSectionName }}
          </span>
          <span
            v-if="adminStore.currentStore?.is_active"
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Tienda Activa</span>
          </span>
          <span
            v-else
            class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>En Pausa</span>
          </span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
          {{ adminStore.currentStore?.name || 'S&S BOUTIQUE' }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Functional Dark Mode Toggle -->
      <button
        type="button"
        @click="toggleTheme"
        class="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-amber-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
      >
        <Sun v-if="isDark" class="w-5 h-5 text-amber-400 transition-transform rotate-0 scale-100" />
        <Moon v-else class="w-5 h-5 text-slate-600 transition-transform rotate-0 scale-100" />
      </button>

      <!-- View Public Store (Single clean global action) -->
      <a
        :href="fullPublicUrl"
        target="_blank"
        class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
        title="Abrir tienda pública en nueva pestaña"
      >
        <Eye class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Ver Tienda</span>
        <ExternalLink class="w-3 h-3 opacity-70" />
      </a>

      <!-- Logout -->
      <button
        type="button"
        @click="handleLogout"
        class="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
