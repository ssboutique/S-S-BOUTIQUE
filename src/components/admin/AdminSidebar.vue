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

const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();

const navSections = [
  {
    title: 'Catálogo & Ventas',
    items: [
      { name: 'Resumen', path: '/admin', icon: LayoutDashboard, exact: true },
      { name: 'Productos', path: '/admin/products', icon: Package },
      { name: 'Categorías', path: '/admin/categories', icon: Layers },
      { name: 'Pedidos WhatsApp', path: '/admin/orders', icon: ShoppingBag },
    ]
  },
  {
    title: 'Configuración Tienda',
    items: [
      { name: 'Cintas & Marcas', path: '/admin/brands', icon: Crown },
      { name: 'Quiénes Somos & Fotos', path: '/admin/about', icon: Sparkles },
      { name: 'Apariencia & Diseño', path: '/admin/appearance', icon: Palette },
      { name: 'Datos del Negocio', path: '/admin/store-info', icon: Store },
      { name: 'Canal WhatsApp', path: '/admin/whatsapp', icon: MessageCircle },
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
    <!-- Mobile Backdrop with blur -->
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
        class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 lg:hidden"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sidebar Element -->
    <aside
      class="fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out lg:static shrink-0"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        collapsed ? 'lg:w-20' : 'w-72 lg:w-64'
      ]"
      role="navigation"
      aria-label="Panel principal de administración"
    >
      <div class="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <!-- Brand Header -->
        <div class="h-20 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <router-link to="/admin" class="flex items-center gap-3 group overflow-hidden">
            <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0 group-hover:border-slate-500 transition-colors shadow-sm">
              S&amp;S
            </div>
            <div v-if="!collapsed" class="truncate">
              <span class="font-extrabold text-white text-sm tracking-tight block">S&amp;S BOUTIQUE</span>
              <span class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Panel Comercial</span>
            </div>
          </router-link>

          <!-- Mobile Close Button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 lg:hidden"
            aria-label="Cerrar barra lateral"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Store Snapshot Card -->
        <div class="p-3" v-if="!collapsed">
          <div class="p-3 bg-slate-850 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div class="flex items-center gap-2.5">
              <div
                v-if="adminStore.currentStore?.logo_url"
                class="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-700"
              >
                <img :src="adminStore.currentStore.logo_url" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center shrink-0">
                S&amp;S
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-white truncate">
                  {{ adminStore.currentStore?.name || 'S&S BOUTIQUE' }}
                </div>
                <div class="text-[10px] text-slate-400 truncate font-mono flex items-center gap-1">
                  <span v-if="adminStore.hasCustomDomain" class="text-emerald-400 font-bold">🌐 {{ adminStore.cleanCustomDomain }}</span>
                  <span v-else>/tienda/{{ adminStore.currentStore?.slug || 'ss-boutique' }}</span>
                </div>
              </div>
            </div>

            <!-- View Store Link -->
            <a
              :href="storeUrl"
              target="_blank"
              class="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-white hover:text-white rounded-xl text-[11px] font-semibold transition-all border border-slate-700/60"
            >
              <span>Ver Tienda en Vivo</span>
              <ExternalLink class="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        <!-- Navigation Sections -->
        <nav class="px-3 py-3 space-y-5 flex-1">
          <div v-for="(section, sIdx) in navSections" :key="sIdx" class="space-y-1">
            <div
              v-if="!collapsed"
              class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              {{ section.title }}
            </div>

            <router-link
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              @click="emit('close')"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group"
              :class="
                isItemActive(item.path, item.exact)
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              "
              :title="collapsed ? item.name : undefined"
            >
              <component
                :is="item.icon"
                class="w-4 h-4 shrink-0 transition-colors"
                :class="isItemActive(item.path, item.exact) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'"
              />
              <span v-if="!collapsed" class="truncate">{{ item.name }}</span>
            </router-link>
          </div>

          <!-- Super Admin Section if allowed -->
          <div v-if="authStore.isSuperAdmin" class="pt-2 border-t border-slate-800/80">
            <router-link
              to="/superadmin"
              @click="emit('close')"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-400 hover:bg-amber-500/10 transition-all"
              :title="collapsed ? 'Super Admin' : undefined"
            >
              <Shield class="w-4 h-4 shrink-0" />
              <span v-if="!collapsed">Super Admin</span>
            </router-link>
          </div>
        </nav>
      </div>

      <!-- Bottom Profile & Collapse Toggle -->
      <div class="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5 truncate" v-if="!collapsed">
          <div class="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
            {{ authStore.profile?.full_name?.charAt(0) || 'G' }}
          </div>
          <div class="truncate">
            <div class="text-xs font-bold text-white truncate">
              {{ authStore.profile?.full_name || 'Gerencia S&S' }}
            </div>
            <div class="text-[10px] text-slate-400 truncate">
              {{ authStore.profile?.email || 'admin@ssboutique.com' }}
            </div>
          </div>
        </div>

        <!-- Desktop Collapse Button -->
        <button
          type="button"
          @click="emit('toggleCollapse')"
          class="hidden lg:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          :class="{ 'mx-auto': collapsed }"
          :aria-label="collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'"
          :title="collapsed ? 'Expandir panel' : 'Colapsar panel'"
        >
          <ChevronRight v-if="collapsed" class="w-4 h-4" />
          <ChevronLeft v-else class="w-4 h-4" />
        </button>
      </div>
    </aside>
  </div>
</template>
