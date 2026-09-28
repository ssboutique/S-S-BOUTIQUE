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
  { name: 'Inicio', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Productos', path: '/admin/products', icon: Package },
  { name: 'Categorías', path: '/admin/categories', icon: Layers },
  { name: 'WhatsApp', path: '/admin/whatsapp', icon: MessageCircle },
];

function isTabActive(tab: typeof primaryTabs[0]) {
  if (tab.exact) return route.path === tab.path;
  return route.path.startsWith(tab.path);
}
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
    aria-label="Navegación móvil"
  >
    <router-link
      v-for="tab in primaryTabs"
      :key="tab.path"
      :to="tab.path"
      class="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all"
      :class="isTabActive(tab) ? 'text-white' : 'text-slate-400 hover:text-slate-200'"
    >
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
        :class="isTabActive(tab) ? 'bg-slate-800 text-brand-400' : ''"
      >
        <component :is="tab.icon" class="w-4 h-4" />
      </div>
      <span class="text-[10px] font-semibold mt-0.5">{{ tab.name }}</span>
    </router-link>

    <!-- More / Drawer Toggle -->
    <button
      type="button"
      @click="$emit('openDrawer')"
      class="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
      aria-label="Ver todas las opciones del panel"
    >
      <div class="w-8 h-8 rounded-xl flex items-center justify-center">
        <Menu class="w-4 h-4" />
      </div>
      <span class="text-[10px] font-semibold mt-0.5">Menú</span>
    </button>
  </nav>
</template>
