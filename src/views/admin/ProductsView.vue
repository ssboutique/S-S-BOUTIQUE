<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { formatCurrency } from '@/utils/currency';
import ProductFormModal from '@/components/admin/ProductFormModal.vue';
import type { Product } from '@/types/database';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Layers
} from 'lucide-vue-next';

const adminStore = useAdminStore();

const searchQuery = ref('');
const selectedCategoryId = ref('');
const showModal = ref(false);
const editingProduct = ref<Product | null>(null);

const filteredProducts = computed(() => {
  let list = adminStore.products;
  if (selectedCategoryId.value) {
    list = list.filter((p) => p.category_id === selectedCategoryId.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }
  return list;
});

function openCreate() {
  editingProduct.value = null;
  showModal.value = true;
}

function openEdit(prod: Product) {
  editingProduct.value = prod;
  showModal.value = true;
}

async function handleDelete(prod: Product) {
  if (confirm(`¿Estás seguro de que deseas eliminar el producto "${prod.name}"?`)) {
    await adminStore.deleteProduct(prod.id);
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Productos
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Crea, edita y organiza los artículos disponibles en tu tienda
        </p>
      </div>

      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>+ Nuevo Producto</span>
      </button>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-soft flex flex-col sm:flex-row items-center gap-3">
      <div class="relative w-full sm:flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar por nombre o código..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div class="w-full sm:w-60">
        <select
          v-model="selectedCategoryId"
          class="w-full px-3 py-2 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-sm text-slate-800 outline-none"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in adminStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-3xl border border-slate-200/70 shadow-soft overflow-hidden">
      <div v-if="filteredProducts.length === 0" class="p-12 text-center">
        <Package class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 class="text-base font-bold text-slate-800">No se encontraron productos</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Comienza agregando tu primer producto para que tus clientes puedan comprarlo desde WhatsApp.
        </p>
        <button
          type="button"
          @click="openCreate"
          class="mt-4 px-4 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          + Crear Producto
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th class="py-3 px-6">Producto</th>
              <th class="py-3 px-6">Precio</th>
              <th class="py-3 px-6">Categoría</th>
              <th class="py-3 px-6">Variantes</th>
              <th class="py-3 px-6">Estado</th>
              <th class="py-3 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr
              v-for="prod in filteredProducts"
              :key="prod.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="py-3.5 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                    <img
                      :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
                      :alt="prod.name"
                      loading="lazy"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{{ prod.name }}</span>
                      <Sparkles v-if="prod.is_featured" class="w-3.5 h-3.5 text-amber-500" title="Destacado" />
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono">
                      /{{ prod.slug }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-6">
                <div class="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{{ formatCurrency(prod.price, adminStore.currentStore?.currency) }}</span>
                  <span
                    v-if="prod.original_price && prod.original_price > prod.price"
                    class="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md"
                  >
                    -{{ Math.round(((prod.original_price - prod.price) / prod.original_price) * 100) }}%
                  </span>
                </div>
                <div v-if="prod.original_price && prod.original_price > prod.price" class="text-xs text-slate-400 line-through">
                  {{ formatCurrency(prod.original_price, adminStore.currentStore?.currency) }}
                </div>
              </td>
              <td class="py-3.5 px-6 text-xs text-slate-600">
                {{ adminStore.categories.find(c => c.id === prod.category_id)?.name || 'General' }}
              </td>
              <td class="py-3.5 px-6 text-xs text-slate-600">
                <span v-if="prod.variants && prod.variants.length > 0" class="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                  {{ prod.variants.length }} opciones
                </span>
                <span v-else class="text-slate-400">Sin variantes</span>
              </td>
              <td class="py-3.5 px-6">
                <button
                  type="button"
                  @click="adminStore.toggleProductAvailability(prod)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  :class="prod.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                >
                  <component :is="prod.is_available ? Eye : EyeOff" class="w-3.5 h-3.5" />
                  <span>{{ prod.is_available ? 'Visible' : 'Oculto' }}</span>
                </button>
              </td>
              <td class="py-3.5 px-6 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openEdit(prod)"
                    class="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Editar producto"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="handleDelete(prod)"
                    class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Form Modal -->
    <ProductFormModal
      v-if="showModal"
      :product="editingProduct"
      @close="showModal = false; editingProduct = null"
    />
  </div>
</template>
