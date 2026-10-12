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

const router     = useRouter();
const route      = useRoute();
const adminStore = useAdminStore();
const authStore  = useAuthStore();
const { isDark, toggleTheme } = useTheme();

/* ── New order notifications ───────────────────────── */
interface OrderNotif {
  customerName: string;
  city: string;
  productName: string;
  total: number;
  itemCount: number;
  timestamp: number;
}

const orderNotif     = ref<OrderNotif | null>(null);
const showOrderNotif = ref(false);
let notifTimer: any  = null;

function displayNotif(data: OrderNotif) {
  orderNotif.value     = data;
  showOrderNotif.value = true;
  if (notifTimer) clearTimeout(notifTimer);
  notifTimer = setTimeout(() => { showOrderNotif.value = false; }, 8000);
  if (adminStore.currentStore?.id) {
    adminStore.refreshStoreItems(adminStore.currentStore.id);
  }
}

function onStorageEvent(e: StorageEvent) {
  if (e.key === 'vendpro_new_order_notify' && e.newValue) {
    try { displayNotif(JSON.parse(e.newValue)); } catch { /* ignore */ }
  }
}

function onSameTabOrder(e: Event) {
  const detail = (e as CustomEvent).detail;
  if (detail) displayNotif(detail as OrderNotif);
}

onMounted(() => {
  window.addEventListener('storage', onStorageEvent);
  window.addEventListener('store-whatsapp-order', onSameTabOrder);
  const pending = localStorage.getItem('vendpro_new_order_notify');
  if (pending) {
    try {
      const data: OrderNotif = JSON.parse(pending);
      if (Date.now() - data.timestamp < 30_000) displayNotif(data);
      localStorage.removeItem('vendpro_new_order_notify');
    } catch { /* ignore */ }
  }
});

onUnmounted(() => {
  window.removeEventListener('storage', onStorageEvent);
  window.removeEventListener('store-whatsapp-order', onSameTabOrder);
  if (notifTimer) clearTimeout(notifTimer);
});
/* ─────────────────────────────────────────────────── */

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

const fullPublicUrl = computed(() => adminStore.publicStoreUrl);

const currentSectionName = computed(() => {
  switch (route.name) {
    case 'admin-dashboard':  return 'Resumen General';
    case 'admin-products':   return 'Productos & Catálogo';
    case 'admin-categories': return 'Categorías';
    case 'admin-orders':     return 'Pedidos WhatsApp';
    case 'admin-appearance': return 'Apariencia';
    case 'admin-store-info': return 'Datos del Negocio';
    case 'admin-whatsapp':   return 'Canal WhatsApp';
    case 'admin-brands':     return 'Marcas & Cintas';
    case 'admin-about':      return 'Quiénes Somos';
    default:                 return 'Panel de Control';
  }
});
</script>

<template>
  <!-- ── Top Navbar ── -->
  <header class="nb-root" role="banner">
    <!-- IG accent line -->
    <div class="nb-accent" aria-hidden="true"></div>

    <div class="nb-inner">
      <!-- Left: hamburger + breadcrumb -->
      <div class="nb-left">
        <button
          type="button"
          @click="$emit('toggleSidebar')"
          class="nb-menu-btn lg:hidden"
          aria-label="Abrir menú lateral"
        >
          <Menu class="w-5 h-5" />
        </button>

        <div class="nb-breadcrumb">
          <span class="nb-section">{{ currentSectionName }}</span>
          <div class="nb-status">
            <span
              v-if="adminStore.currentStore?.is_active"
              class="nb-badge nb-badge-active"
            >
              <span class="nb-badge-dot" aria-hidden="true"></span>
              Activa
            </span>
            <span v-else class="nb-badge nb-badge-paused">
              <span class="nb-badge-dot nb-dot-paused" aria-hidden="true"></span>
              En pausa
            </span>
            <span class="nb-store-name hidden sm:inline">
              {{ adminStore.currentStore?.name || 'S&S BOUTIQUE' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: actions -->
      <div class="nb-actions">
        <!-- Theme toggle -->
        <button
          type="button"
          @click="toggleTheme"
          class="nb-icon-btn"
          :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
          :title="isDark ? 'Modo claro' : 'Modo oscuro'"
        >
          <Sun  v-if="isDark" class="w-4 h-4 text-amber-400" />
          <Moon v-else        class="w-4 h-4" />
        </button>

        <!-- View store -->
        <a
          :href="fullPublicUrl"
          target="_blank"
          rel="noopener"
          class="nb-view-btn"
          title="Ver tienda pública"
        >
          <Eye class="w-3.5 h-3.5" aria-hidden="true" />
          <span class="hidden sm:inline">Ver Tienda</span>
          <ExternalLink class="w-3 h-3 opacity-60" aria-hidden="true" />
        </a>

        <!-- Logout -->
        <button
          type="button"
          @click="handleLogout"
          class="nb-logout-btn"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>

  <!-- ── Order notification toast ── -->
  <Transition
    enter-active-class="transition duration-350 ease-out"
    enter-from-class="opacity-0 translate-y-3 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-250 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-y-2 scale-95"
  >
    <div
      v-if="showOrderNotif && orderNotif"
      class="nb-toast"
      role="alert"
      aria-live="assertive"
    >
      <!-- Accent bar -->
      <div class="nb-toast-bar" aria-hidden="true"></div>

      <div class="nb-toast-body">
        <!-- Icon -->
        <div class="nb-toast-icon-wrap" aria-hidden="true">
          <ShoppingBag class="w-5 h-5 text-emerald-500" />
          <span class="nb-toast-ping"></span>
          <span class="nb-toast-dot"></span>
        </div>

        <!-- Text -->
        <div class="nb-toast-text">
          <div class="nb-toast-header">
            <span class="nb-toast-label">Nuevo pedido — WhatsApp</span>
            <button
              type="button"
              @click="showOrderNotif = false"
              class="nb-toast-close"
              aria-label="Cerrar"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
          <p class="nb-toast-name">{{ orderNotif.customerName }}</p>
          <p class="nb-toast-meta">
            {{ orderNotif.itemCount }} producto{{ orderNotif.itemCount !== 1 ? 's' : '' }}
            &nbsp;·&nbsp;
            <span class="truncate">{{ orderNotif.productName }}</span>
          </p>
          <router-link
            to="/admin/orders"
            @click="showOrderNotif = false"
            class="nb-toast-cta"
          >
            Ver pedido
          </router-link>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Navbar root ─────────────────────────────────── */
.nb-root {
  position: sticky;
  top: 0;
  z-index: 30;
  background: #0f0a1e;
  border-bottom: 1px solid rgba(255,255,255,.06);
  flex-shrink: 0;
}

/* IG gradient accent line */
.nb-accent {
  height: 2px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4, #405de6);
}

.nb-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
}
@media (min-width: 640px) {
  .nb-inner { height: 72px; padding: 0 24px; }
}

/* ── Left ────────────────────────────────────────── */
.nb-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.nb-menu-btn {
  padding: 7px;
  color: rgba(255,255,255,.45);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 10px;
  cursor: pointer;
  transition: background .18s, color .18s;
  flex-shrink: 0;
}
.nb-menu-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

.nb-breadcrumb {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.nb-section {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (min-width: 640px) { .nb-section { font-size: 15px; } }

.nb-status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nb-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .3px;
}
.nb-badge-active {
  background: rgba(52,211,153,.1);
  border: 1px solid rgba(52,211,153,.2);
  color: rgba(52,211,153,.85);
}
.nb-badge-paused {
  background: rgba(251,191,36,.1);
  border: 1px solid rgba(251,191,36,.2);
  color: rgba(251,191,36,.85);
}
.nb-badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #34d399;
  animation: nbPing 2s ease-in-out infinite;
}
.nb-dot-paused { background: #fbbf24; animation: none; }
@keyframes nbPing {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(1.3); }
}

.nb-store-name {
  font-size: 11px;
  color: rgba(255,255,255,.28);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Actions ─────────────────────────────────────── */
.nb-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
@media (min-width: 640px) { .nb-actions { gap: 8px; } }

.nb-icon-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.07);
  color: rgba(255,255,255,.45);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .18s, color .18s;
}
.nb-icon-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

.nb-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #833ab4 0%, #ee2a7b 100%);
  border: none;
  text-decoration: none;
  box-shadow: 0 3px 12px rgba(238,42,123,.28);
  transition: opacity .2s, transform .15s, box-shadow .2s;
}
.nb-view-btn:hover {
  opacity: .9;
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(238,42,123,.4);
}
.nb-view-btn:active { transform: scale(.96); }

.nb-logout-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
  color: rgba(255,255,255,.35);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background .18s, color .18s, border-color .18s;
}
.nb-logout-btn:hover {
  background: rgba(239,68,68,.1);
  border-color: rgba(239,68,68,.25);
  color: #f87171;
}

/* ── Order toast ─────────────────────────────────── */
.nb-toast {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 80;
  width: 300px;
  background: #0f0a1e;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 50px rgba(0,0,0,.6), 0 0 0 1px rgba(52,211,153,.12);
}
@media (min-width: 640px) { .nb-toast { width: 320px; right: 24px; } }

.nb-toast-bar {
  height: 2px;
  background: linear-gradient(90deg, #34d399, #059669);
}
.nb-toast-body {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 14px;
}
.nb-toast-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 38px; height: 38px;
  border-radius: 12px;
  background: rgba(52,211,153,.1);
  border: 1px solid rgba(52,211,153,.2);
  display: flex; align-items: center; justify-content: center;
}
.nb-toast-ping {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(52,211,153,.3);
  animation: toastPing 1.5s ease-out infinite;
}
@keyframes toastPing {
  0%   { transform: scale(.9); opacity: .6; }
  100% { transform: scale(1.5); opacity: 0; }
}
.nb-toast-dot {
  position: absolute;
  top: -2px; right: -2px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #34d399;
  border: 2px solid #0f0a1e;
}
.nb-toast-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.nb-toast-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}
.nb-toast-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: #34d399;
}
.nb-toast-close {
  color: rgba(255,255,255,.3);
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px;
  border-radius: 5px;
  flex-shrink: 0;
  transition: color .2s;
}
.nb-toast-close:hover { color: rgba(255,255,255,.7); }
.nb-toast-name {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nb-toast-meta {
  font-size: 11px;
  color: rgba(255,255,255,.35);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}
.nb-toast-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #059669, #34d399);
  text-decoration: none;
  transition: opacity .2s;
  box-shadow: 0 2px 10px rgba(52,211,153,.25);
}
.nb-toast-cta:hover { opacity: .88; }
</style>
