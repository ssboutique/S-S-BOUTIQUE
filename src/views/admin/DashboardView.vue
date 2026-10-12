<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { formatCurrency } from '@/utils/currency';
import ProductFormModal from '@/components/admin/ProductFormModal.vue';
import ShareStoreBanner from '@/components/admin/ShareStoreBanner.vue';
import type { Product } from '@/types/database';
import {
  Package,
  Layers,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Palette,
  Eye,
  MessageCircle,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-vue-next';

const adminStore = useAdminStore();

const showProductModal = ref(false);
const selectedProduct = ref<Product | null>(null);

function openCreateProduct() {
  selectedProduct.value = null;
  showProductModal.value = true;
}

const storeUrl = computed(() => adminStore.publicStoreUrl);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Header & Quick Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Panel de Control
        </h1>
        <p class="text-sm text-white/28 mt-1">
          Gestiona los productos, pedidos y la presencia digital de tu negocio
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="openCreateProduct"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95"
        >
          <Plus class="w-4 h-4" />
          <span>+ Agregar Producto</span>
        </button>
      </div>
    </div>

    <!-- Public Store Link Sharing Card -->
    <ShareStoreBanner />

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- Active Products -->
      <div class="bg-white/5 border border-white/8 p-5 rounded-3xl flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white/28 uppercase tracking-wider">Productos Activos</span>
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Package class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-2xl sm:text-3xl font-black text-white">{{ adminStore.metrics.activeProducts }}</div>
          <div class="text-xs text-white/38 mt-1">Visibles para tus clientes</div>
        </div>
      </div>

      <!-- Out of stock / inactive -->
      <div class="bg-white/5 border border-white/8 p-5 rounded-3xl flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white/28 uppercase tracking-wider">Agotados / Ocultos</span>
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-2xl sm:text-3xl font-black text-white">{{ adminStore.metrics.outOfStockProducts }}</div>
          <div class="text-xs text-white/38 mt-1">Requieren atención o reposición</div>
        </div>
      </div>

      <!-- Categories -->
      <div class="bg-white/5 border border-white/8 p-5 rounded-3xl flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white/28 uppercase tracking-wider">Categorías</span>
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-2xl sm:text-3xl font-black text-white">{{ adminStore.metrics.totalCategories }}</div>
          <div class="text-xs text-white/38 mt-1">Organización del catálogo</div>
        </div>
      </div>

      <!-- Orders -->
      <div class="bg-white/5 border border-white/8 p-5 rounded-3xl flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white/28 uppercase tracking-wider">Pedidos Generados</span>
          <div class="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
            <ShoppingBag class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <div class="text-2xl sm:text-3xl font-black text-white">{{ adminStore.metrics.totalOrders }}</div>
          <div class="text-xs text-white/38 mt-1">Derivados a tu WhatsApp</div>
        </div>
      </div>
    </div>

    <!-- Quick Access Hub -->
    <div class="bg-white/5 border border-white/8 rounded-3xl p-6 sm:p-8">
      <h2 class="text-lg font-bold text-white mb-2">Accesos Rápidos</h2>
      <p class="text-xs sm:text-sm text-white/28 mb-6">Configura tu negocio con un par de clics</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          to="/admin/appearance"
          class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/8 hover:border-fuchsia-500/30 transition-all"
        >
          <div class="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0">
            <Palette class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-white">Editar Apariencia</div>
            <div class="text-[11px] text-white/38">Logo, banner y colores</div>
          </div>
        </router-link>

        <router-link
          to="/admin/whatsapp"
          class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/8 hover:border-emerald-500/30 transition-all"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-white">Configurar WhatsApp</div>
            <div class="text-[11px] text-white/38">Número receptor de pedidos</div>
          </div>
        </router-link>

        <router-link
          to="/admin/categories"
          class="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/8 hover:border-indigo-500/30 transition-all"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-white">Gestionar Categorías</div>
            <div class="text-[11px] text-white/38">Crear y ordenar secciones</div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Products Table Section -->
    <div class="bg-white/5 border border-white/8 rounded-3xl overflow-hidden">
      <div class="p-6 border-b border-white/8 flex items-center justify-between">
        <h2 class="font-extrabold text-base sm:text-lg text-white">
          Tus Productos Recientes
        </h2>
        <router-link
          to="/admin/products"
          class="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
        >
          Ver todos los productos →
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] font-bold text-white/38 uppercase tracking-wider border-b border-white/8">
              <th class="py-3 px-6">Producto</th>
              <th class="py-3 px-6">Precio</th>
              <th class="py-3 px-6">Categoría</th>
              <th class="py-3 px-6">Estado</th>
              <th class="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-sm">
            <tr
              v-for="prod in adminStore.products.slice(0, 5)"
              :key="prod.id"
              class="hover:bg-white/5 transition-colors"
            >
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden bg-white/8 shrink-0 border border-white/10">
                    <img
                      :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
                      :alt="prod.name"
                      loading="lazy"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-white">{{ prod.name }}</div>
                    <div class="text-[11px] text-white/38">SKU: {{ prod.sku || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-6 font-semibold text-slate-200">
                {{ formatCurrency(prod.price, adminStore.currentStore?.currency) }}
              </td>
              <td class="py-3.5 px-6 text-white/38 text-xs">
                {{ adminStore.categories.find(c => c.id === prod.category_id)?.name || 'General' }}
              </td>
              <td class="py-3.5 px-6">
                <button
                  type="button"
                  @click="adminStore.toggleProductAvailability(prod)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  :class="prod.is_available ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-white/8 border border-white/12 text-white/38'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="prod.is_available ? 'bg-emerald-400' : 'bg-white/40'"></span>
                  <span>{{ prod.is_available ? 'Visible' : 'Oculto' }}</span>
                </button>
              </td>
              <td class="py-3.5 px-6 text-right">
                <button
                  type="button"
                  @click="selectedProduct = prod; showProductModal = true"
                  class="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 px-2 py-1 rounded-lg hover:bg-fuchsia-500/10 transition-colors"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <ProductFormModal
      v-if="showProductModal"
      :product="selectedProduct"
      @close="showProductModal = false; selectedProduct = null"
    />
  </div>
</template>
