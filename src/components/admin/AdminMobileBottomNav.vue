<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  Package,
  Layers,
  MessageCircle,
  Menu
} from 'lucide-vue-next';

defineEmits<{
  (e: 'openDrawer'): void;
}>();

const route = useRoute();

const primaryTabs = [
  { name: 'Inicio',      path: '/admin',            icon: LayoutDashboard, exact: true },
  { name: 'Productos',   path: '/admin/products',   icon: Package },
  { name: 'Categorías',  path: '/admin/categories', icon: Layers },
  { name: 'WhatsApp',    path: '/admin/whatsapp',   icon: MessageCircle },
];

function isTabActive(tab: typeof primaryTabs[0]) {
  if (tab.exact) return route.path === tab.path;
  return route.path.startsWith(tab.path);
}
</script>

<template>
  <nav
    class="mbn-root lg:hidden"
    aria-label="Navegación principal móvil"
  >
    <!-- IG accent line at top -->
    <div class="mbn-accent" aria-hidden="true"></div>

    <div class="mbn-inner">
      <router-link
        v-for="tab in primaryTabs"
        :key="tab.path"
        :to="tab.path"
        class="mbn-tab"
        :class="isTabActive(tab) ? 'mbn-tab-active' : 'mbn-tab-idle'"
        :aria-current="isTabActive(tab) ? 'page' : undefined"
      >
        <div class="mbn-icon-wrap" :class="isTabActive(tab) ? 'mbn-icon-active' : ''">
          <component :is="tab.icon" class="w-[18px] h-[18px]" aria-hidden="true" />
          <!-- Active indicator dot -->
          <span v-if="isTabActive(tab)" class="mbn-dot" aria-hidden="true"></span>
        </div>
        <span class="mbn-label">{{ tab.name }}</span>
      </router-link>

      <!-- More / drawer -->
      <button
        type="button"
        @click="$emit('openDrawer')"
        class="mbn-tab mbn-tab-idle"
        aria-label="Ver todas las opciones"
      >
        <div class="mbn-icon-wrap">
          <Menu class="w-[18px] h-[18px]" aria-hidden="true" />
        </div>
        <span class="mbn-label">Más</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.mbn-root {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  z-index: 40;
  background: var(--ad-surface);
  border-top: 1px solid var(--ad-border);
  box-shadow: 0 -8px 30px rgba(0,0,0,.4);
  /* Safe area for notched phones */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mbn-accent {
  height: 2px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4, #405de6);
}

.mbn-inner {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 6px 8px 8px;
  gap: 4px;
}

/* ── Tab ─────────────────────────────────────────── */
.mbn-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  border-radius: 14px;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .18s;
  min-width: 56px;
}
.mbn-tab-idle  { color: var(--ad-text-3); }
.mbn-tab-active { color: var(--ad-text); }
.mbn-tab-idle:hover { background: rgba(255,255,255,.05); color: var(--ad-text-2); }

/* Icon wrapper */
.mbn-icon-wrap {
  position: relative;
  width: 34px; height: 34px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .18s;
}
.mbn-icon-active {
  background: linear-gradient(135deg, rgba(131,58,180,.35), rgba(238,42,123,.25));
  border: 1px solid rgba(238,42,123,.2);
}

/* Active dot indicator */
.mbn-dot {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ee2a7b, #833ab4);
}

.mbn-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
