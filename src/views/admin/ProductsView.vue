<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { formatCurrency } from '@/utils/currency';
import ProductFormModal from '@/components/admin/ProductFormModal.vue';
import type { Product } from '@/types/database';
import { Package, Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles } from 'lucide-vue-next';

const adminStore = useAdminStore();

const searchQuery        = ref('');
const selectedCategoryId = ref('');
const showModal          = ref(false);
const editingProduct     = ref<Product | null>(null);

const filteredProducts = computed(() => {
  let list = adminStore.products;
  if (selectedCategoryId.value)
    list = list.filter(p => p.category_id === selectedCategoryId.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    );
  }
  return list;
});

function openCreate() { editingProduct.value = null; showModal.value = true; }
function openEdit(p: Product) { editingProduct.value = p; showModal.value = true; }

async function handleDelete(p: Product) {
  if (confirm(`¿Eliminar "${p.name}"?`)) await adminStore.deleteProduct(p.id);
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="ad-page-title">Gestión de Productos</h1>
        <p class="ad-page-subtitle">Crea, edita y organiza los artículos disponibles en tu tienda</p>
      </div>
      <button type="button" @click="openCreate" class="ad-btn-primary self-start sm:self-auto">
        <Plus class="w-4 h-4" aria-hidden="true" />
        Nuevo Producto
      </button>
    </div>

    <!-- Toolbar -->
    <div class="ad-card" style="padding:14px 16px">
      <div class="ad-toolbar">
        <div class="ad-search-wrap">
          <Search class="ad-search-icon" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por nombre o código..."
            class="ad-search"
            aria-label="Buscar productos"
          />
        </div>
        <select v-model="selectedCategoryId" class="ad-select" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          <option v-for="cat in adminStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table card -->
    <div class="ad-card" style="padding:0;overflow:hidden">

      <!-- Empty state -->
      <div v-if="filteredProducts.length === 0" class="ad-empty">
        <div class="ad-empty-icon"><Package class="w-6 h-6" aria-hidden="true" /></div>
        <p class="ad-empty-title">Sin productos</p>
        <p class="ad-empty-sub">Comienza agregando tu primer producto para que tus clientes puedan pedirlo por WhatsApp.</p>
        <button type="button" @click="openCreate" class="ad-btn-primary" style="margin-top:8px">
          <Plus class="w-4 h-4" aria-hidden="true" /> Crear Producto
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="ad-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Variantes</th>
              <th>Estado</th>
              <th style="text-align:right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prod in filteredProducts" :key="prod.id">

              <!-- Name + image -->
              <td>
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:44px;height:44px;border-radius:12px;overflow:hidden;background:var(--ad-surface-2);border:1px solid var(--ad-border);flex-shrink:0">
                    <img
                      :src="prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&fit=crop'"
                      :alt="prod.name"
                      loading="lazy"
                      style="width:100%;height:100%;object-fit:cover"
                    />
                  </div>
                  <div>
                    <div style="font-weight:800;color:var(--ad-text);display:flex;align-items:center;gap:5px">
                      {{ prod.name }}
                      <Sparkles v-if="prod.is_featured" class="w-3.5 h-3.5" style="color:#f9ce34" aria-hidden="true" />
                    </div>
                    <div style="font-size:10px;font-family:monospace;color:var(--ad-text-3)">/{{ prod.slug }}</div>
                  </div>
                </div>
              </td>

              <!-- Price -->
              <td>
                <div style="font-weight:800;color:var(--ad-text);display:flex;align-items:center;gap:6px">
                  {{ formatCurrency(prod.price, adminStore.currentStore?.currency) }}
                  <span
                    v-if="prod.original_price && prod.original_price > prod.price"
                    style="font-size:9px;font-weight:900;color:#f87171;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);padding:1px 6px;border-radius:6px"
                  >
                    -{{ Math.round(((prod.original_price - prod.price) / prod.original_price) * 100) }}%
                  </span>
                </div>
                <div v-if="prod.original_price && prod.original_price > prod.price" style="font-size:11px;color:var(--ad-text-3);text-decoration:line-through">
                  {{ formatCurrency(prod.original_price, adminStore.currentStore?.currency) }}
                </div>
              </td>

              <!-- Category -->
              <td style="font-size:12px;color:var(--ad-text-3)">
                {{ adminStore.categories.find(c => c.id === prod.category_id)?.name || 'General' }}
              </td>

              <!-- Variants -->
              <td>
                <span
                  v-if="prod.variants?.length"
                  style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:var(--ad-surface-2);border:1px solid var(--ad-border);color:var(--ad-text-2)"
                >
                  {{ prod.variants.length }} opciones
                </span>
                <span v-else style="font-size:11px;color:var(--ad-text-3)">Sin variantes</span>
              </td>

              <!-- Status toggle -->
              <td>
                <button
                  type="button"
                  @click="adminStore.toggleProductAvailability(prod)"
                  :class="prod.is_available ? 'ad-badge-active' : 'ad-badge-inactive'"
                  style="cursor:pointer;border:none;background:transparent;padding:0"
                >
                  <span class="ad-badge-dot" :style="{ background: prod.is_available ? '#34d399' : 'rgba(255,255,255,.2)' }"></span>
                  <component :is="prod.is_available ? Eye : EyeOff" class="w-3 h-3" aria-hidden="true" />
                  {{ prod.is_available ? 'Visible' : 'Oculto' }}
                </button>
              </td>

              <!-- Actions -->
              <td style="text-align:right">
                <div style="display:flex;align-items:center;justify-content:flex-end;gap:6px">
                  <button type="button" @click="openEdit(prod)" class="ad-btn-edit" :title="`Editar ${prod.name}`">
                    <Edit2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" @click="handleDelete(prod)" class="ad-btn-danger" :title="`Eliminar ${prod.name}`">
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ProductFormModal
      v-if="showModal"
      :product="editingProduct"
      @close="showModal = false; editingProduct = null"
    />
  </div>
</template>
