<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { useAuthStore } from '@/stores/auth';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Palette,
  Store,
  MessageCircle,
  Sparkles,
  Crown,
  ExternalLink,
  Shield,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-vue-next';

const props = defineProps<{
  mobileOpen: boolean;
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggleCollapse'): void;
}>();

const route      = useRoute();
const adminStore = useAdminStore();
const authStore  = useAuthStore();

const navSections = [
  {
    title: 'Catálogo & Ventas',
    items: [
      { name: 'Resumen',         path: '/admin',            icon: LayoutDashboard, exact: true },
      { name: 'Productos',       path: '/admin/products',   icon: Package },
      { name: 'Categorías',      path: '/admin/categories', icon: Layers },
      { name: 'Pedidos',         path: '/admin/orders',     icon: ShoppingBag },
    ]
  },
  {
    title: 'Configuración',
    items: [
      { name: 'Marcas & Cintas', path: '/admin/brands',      icon: Crown },
      { name: 'Quiénes Somos',   path: '/admin/about',       icon: Sparkles },
      { name: 'Apariencia',      path: '/admin/appearance',  icon: Palette },
      { name: 'Datos del Negocio', path: '/admin/store-info', icon: Store },
      { name: 'Canal WhatsApp',  path: '/admin/whatsapp',    icon: MessageCircle },
    ]
  }
];

function isItemActive(path: string, exact = false) {
  if (exact) return route.path === path;
  return route.path.startsWith(path);
}

const storeUrl = computed(() => adminStore.publicStoreUrl);
</script>

<template>
  <div>
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        @click="emit('close')"
        class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="sb-root"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed   ? 'lg:w-[72px]'  : 'w-72 lg:w-60'
      ]"
      role="navigation"
      aria-label="Panel de administración"
    >
      <!-- Decorative accent line top -->
      <div class="sb-accent" aria-hidden="true"></div>

      <div class="flex flex-col flex-1 min-h-0 overflow-y-auto sb-scroll">

        <!-- Brand header -->
        <div class="sb-brand-row">
          <router-link to="/admin" class="sb-brand-link" aria-label="Ir al inicio del panel">
            <!-- Logo ring -->
            <div class="sb-logo-ring" aria-hidden="true">
              <svg viewBox="0 0 40 40" class="sb-logo-svg">
                <defs>
                  <linearGradient id="sbGr" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%"   stop-color="#f9ce34"/>
                    <stop offset="50%"  stop-color="#ee2a7b"/>
                    <stop offset="100%" stop-color="#405de6"/>
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="17" fill="none" stroke="url(#sbGr)" stroke-width="2.5"/>
              </svg>
              <span class="sb-logo-text">S&amp;S</span>
            </div>

            <div v-if="!collapsed" class="sb-brand-text">
              <span class="sb-brand-name">S&amp;S BOUTIQUE</span>
              <span class="sb-brand-sub">Panel Comercial</span>
            </div>
          </router-link>

          <!-- Mobile close -->
          <button
            type="button"
            @click="emit('close')"
            class="sb-close lg:hidden"
            aria-label="Cerrar menú"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Store snapshot -->
        <div v-if="!collapsed" class="sb-snapshot">
          <div class="sb-snapshot-inner">
            <div class="sb-store-row">
              <div class="sb-store-avatar">
                <img
                  v-if="adminStore.currentStore?.logo_url"
                  :src="adminStore.currentStore.logo_url"
                  :alt="adminStore.currentStore.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="sb-store-initial">
                  {{ adminStore.currentStore?.name?.charAt(0) || 'S' }}
                </span>
              </div>
              <div class="sb-store-info">
                <span class="sb-store-name">{{ adminStore.currentStore?.name || 'S&S BOUTIQUE' }}</span>
                <span class="sb-store-slug">
                  <span v-if="adminStore.hasCustomDomain" class="sb-store-domain">
                    {{ adminStore.cleanCustomDomain }}
                  </span>
                  <span v-else>/tienda/{{ adminStore.currentStore?.slug || 'ss-boutique' }}</span>
                </span>
              </div>
            </div>

            <a
              :href="storeUrl"
              target="_blank"
              rel="noopener"
              class="sb-view-store"
            >
              <span>Ver tienda en vivo</span>
              <ExternalLink class="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </div>

        <!-- Nav -->
        <nav class="sb-nav">
          <div v-for="(section, sIdx) in navSections" :key="sIdx" class="sb-section">
            <span v-if="!collapsed" class="sb-section-title">{{ section.title }}</span>

            <router-link
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              @click="emit('close')"
              class="sb-item"
              :class="isItemActive(item.path, item.exact) ? 'sb-item-active' : 'sb-item-idle'"
              :title="collapsed ? item.name : undefined"
              :aria-current="isItemActive(item.path, item.exact) ? 'page' : undefined"
            >
              <!-- Active indicator bar -->
              <span
                v-if="isItemActive(item.path, item.exact)"
                class="sb-item-bar"
                aria-hidden="true"
              ></span>

              <component
                :is="item.icon"
                class="sb-item-icon"
                :class="isItemActive(item.path, item.exact) ? 'sb-icon-active' : 'sb-icon-idle'"
                aria-hidden="true"
              />
              <span v-if="!collapsed" class="sb-item-label">{{ item.name }}</span>
            </router-link>
          </div>

          <!-- Super admin -->
          <div v-if="authStore.isSuperAdmin" class="sb-section sb-section-super">
            <router-link
              to="/superadmin"
              @click="emit('close')"
              class="sb-item sb-item-super"
              :title="collapsed ? 'Super Admin' : undefined"
            >
              <Shield class="sb-item-icon sb-icon-super" aria-hidden="true" />
              <span v-if="!collapsed" class="sb-item-label">Super Admin</span>
            </router-link>
          </div>
        </nav>
      </div>

      <!-- Footer: profile + collapse -->
      <div class="sb-footer">
        <div v-if="!collapsed" class="sb-profile">
          <div class="sb-profile-avatar">
            {{ authStore.profile?.full_name?.charAt(0)?.toUpperCase() || 'A' }}
          </div>
          <div class="sb-profile-text">
            <span class="sb-profile-name">{{ authStore.profile?.full_name || 'Administrador' }}</span>
            <span class="sb-profile-email">{{ authStore.profile?.email || '' }}</span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('toggleCollapse')"
          class="sb-collapse-btn hidden lg:flex"
          :class="{ 'mx-auto': collapsed }"
          :aria-label="collapsed ? 'Expandir panel' : 'Colapsar panel'"
        >
          <ChevronRight v-if="collapsed" class="w-4 h-4" />
          <ChevronLeft  v-else            class="w-4 h-4" />
        </button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* ── Sidebar root ────────────────────────────────── */
.sb-root {
  position: fixed;
  inset-y: 0;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #0f0a1e 0%, #160529 50%, #0f0a1e 100%);
  border-right: 1px solid rgba(255,255,255,.06);
  transition: width .3s ease, transform .3s ease;
}
@media (min-width: 1024px) {
  .sb-root { position: static; }
}

/* Accent gradient line at top */
.sb-accent {
  height: 2px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4, #405de6);
  flex-shrink: 0;
}

/* Scrollbar hidden */
.sb-scroll { scrollbar-width: none; }
.sb-scroll::-webkit-scrollbar { display: none; }

/* ── Brand row ───────────────────────────────────── */
.sb-brand-row {
  height: 72px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
}
.sb-brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  overflow: hidden;
}

/* Logo ring */
.sb-logo-ring {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
.sb-logo-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: sbSpin 14s linear infinite;
}
@keyframes sbSpin { to { transform: rotate(360deg); } }
.sb-logo-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .04em;
  background: linear-gradient(135deg, #f9ce34, #ee2a7b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sb-brand-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sb-brand-name {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -.2px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-brand-sub {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,.28);
}

.sb-close {
  padding: 6px;
  color: rgba(255,255,255,.4);
  border-radius: 10px;
  background: none;
  border: none;
  cursor: pointer;
  transition: color .2s, background .2s;
}
.sb-close:hover { color: #fff; background: rgba(255,255,255,.07); }

/* ── Snapshot card ───────────────────────────────── */
.sb-snapshot {
  padding: 10px 12px 8px;
}
.sb-snapshot-inner {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 16px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sb-store-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sb-store-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sb-store-initial {
  font-size: 11px;
  font-weight: 900;
  color: rgba(255,255,255,.6);
}
.sb-store-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sb-store-name {
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-store-slug {
  font-size: 9px;
  color: rgba(255,255,255,.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
}
.sb-store-domain { color: rgba(52,211,153,.65); font-weight: 700; }

.sb-view-store {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 10px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,.5);
  text-decoration: none;
  transition: background .2s, color .2s, border-color .2s;
}
.sb-view-store:hover {
  background: rgba(238,42,123,.12);
  border-color: rgba(238,42,123,.3);
  color: rgba(255,255,255,.85);
}

/* ── Navigation ──────────────────────────────────── */
.sb-nav {
  padding: 8px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}
.sb-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sb-section-title {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: rgba(255,255,255,.22);
  padding: 0 10px 6px;
  display: block;
}

/* Item */
.sb-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background .18s, color .18s;
  overflow: hidden;
}
.sb-item-idle {
  color: rgba(255,255,255,.38);
}
.sb-item-idle:hover {
  background: rgba(255,255,255,.05);
  color: rgba(255,255,255,.75);
}
.sb-item-active {
  background: rgba(255,255,255,.07);
  color: #fff;
}

/* Left accent bar on active */
.sb-item-bar {
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #ee2a7b, #833ab4);
}

/* Icons */
.sb-item-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  transition: color .18s;
}
.sb-icon-idle  { color: rgba(255,255,255,.3); }
.sb-item-idle:hover .sb-icon-idle { color: rgba(255,255,255,.65); }
.sb-icon-active { color: #ee2a7b; }

.sb-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Super admin */
.sb-section-super {
  padding-top: 10px;
  border-top: 1px solid rgba(255,255,255,.05);
}
.sb-item-super { color: rgba(245,158,11,.65); }
.sb-item-super:hover { background: rgba(245,158,11,.08); color: #fbbf24; }
.sb-icon-super { color: rgba(245,158,11,.65); }

/* ── Footer ──────────────────────────────────────── */
.sb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-top: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
  background: rgba(0,0,0,.15);
}
.sb-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}
.sb-profile-avatar {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, #833ab4, #ee2a7b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}
.sb-profile-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sb-profile-name {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sb-profile-email {
  font-size: 9px;
  color: rgba(255,255,255,.28);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sb-collapse-btn {
  padding: 6px;
  color: rgba(255,255,255,.3);
  border-radius: 10px;
  background: none;
  border: none;
  cursor: pointer;
  transition: color .2s, background .2s;
  flex-shrink: 0;
}
.sb-collapse-btn:hover { color: #fff; background: rgba(255,255,255,.07); }
</style>
