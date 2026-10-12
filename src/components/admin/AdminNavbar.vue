<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';
import { Menu, ExternalLink, LogOut, Eye, Sun, Moon, ShoppingBag, X } from 'lucide-vue-next';

defineEmits<{
  (e: 'toggleSidebar'): void;
}>();

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

// ── New order notification ──────────────────────────
interface OrderNotif {
  customerName: string;
  city: string;
  productName: string;
  total: number;
  itemCount: number;
  timestamp: number;
}

const orderNotif = ref<OrderNotif | null>(null);
const showOrderNotif = ref(false);
let notifTimer: any = null;

function displayNotif(data: OrderNotif) {
  orderNotif.value = data;
  showOrderNotif.value = true;
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => {
    showOrderNotif.value = false;
  }, 8000);
  // Reload orders list so admin sees the new entry immediately
  if (adminStore.currentStore?.id) {
    adminStore.refreshStoreItems(adminStore.currentStore.id);
  }
}

function onStorageEvent(e: StorageEvent) {
  if (e.key === 'vendpro_new_order_notify' && e.newValue) {
    try {
      const data: OrderNotif = JSON.parse(e.newValue);
      displayNotif(data);
    } catch { /* ignore parse errors */ }
  }
}

// Also catch same-tab dispatches (e.g. admin opens storefront in same tab)
function onSameTabOrder(e: Event) {
  const detail = (e as CustomEvent).detail;
  if (detail) displayNotif(detail as OrderNotif);
}

onMounted(() => {
  window.addEventListener('storage', onStorageEvent);
  window.addEventListener('store-whatsapp-order', onSameTabOrder);

  // Show any pending notification that arrived while admin was loading
  const pending = localStorage.getItem('vendpro_new_order_notify');
  if (pending) {
    try {
      const data: OrderNotif = JSON.parse(pending);
      // Only show if it arrived in the last 30 seconds
      if (Date.now() - data.timestamp < 30_000) {
        displayNotif(data);
      }
      localStorage.removeItem('vendpro_new_order_notify');
    } catch { /* ignore */ }
  }
});

onUnmounted(() => {
  window.removeEventListener('storage', onStorageEvent);
  window.removeEventListener('store-whatsapp-order', onSameTabOrder);
  if (notifTimer) clearTimeout(notifTimer);
});
// ───────────────────────────────────────────────────

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
        class="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-fuchsia-600 dark:via-pink-600 dark:to-purple-600 dark:hover:from-fuchsia-500 dark:hover:via-pink-500 dark:hover:to-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
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

  <!-- ── New order notification toast ── -->
  <Transition
    enter-active-class="transition duration-400 ease-out"
    enter-from-class="opacity-0 translate-y-2 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-2 scale-95"
  >
    <div
      v-if="showOrderNotif && orderNotif"
      class="fixed bottom-6 right-6 z-[80] w-[320px] bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      <!-- Green accent top bar -->
      <div class="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"></div>

      <div class="p-4 flex items-start gap-3">
        <!-- Icon -->
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <ShoppingBag class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <!-- Pulsing dot -->
          <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Nuevo Pedido vía WhatsApp
            </p>
            <button
              type="button"
              @click="showOrderNotif = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md shrink-0"
              aria-label="Cerrar notificación"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
            {{ orderNotif.customerName }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ orderNotif.itemCount }} producto{{ orderNotif.itemCount !== 1 ? 's' : '' }}
            &nbsp;·&nbsp;
            {{ orderNotif.productName }}
          </p>

          <!-- CTA -->
          <router-link
            to="/admin/orders"
            @click="showOrderNotif = false"
            class="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Ver pedido
          </router-link>
        </div>
      </div>
    </div>
  </Transition>
</template>
