<script setup lang="ts">
import { ref } from 'vue';
import { useAdminStore } from '@/stores/admin';
import CategoryFormModal from '@/components/admin/CategoryFormModal.vue';
import type { Category } from '@/types/database';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-vue-next';

const adminStore = useAdminStore();
const showModal       = ref(false);
const editingCategory = ref<Category | null>(null);

function openCreate() { editingCategory.value = null; showModal.value = true; }
function openEdit(cat: Category) { editingCategory.value = cat; showModal.value = true; }

async function handleDelete(cat: Category) {
  if (confirm(`¿Eliminar la categoría "${cat.name}"? Los productos no se eliminarán.`))
    await adminStore.deleteCategory(cat.id);
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="ad-page-title">Categorías</h1>
        <p class="ad-page-subtitle">Organiza tus productos para que tus clientes encuentren rápidamente lo que buscan</p>
      </div>
      <button type="button" @click="openCreate" class="ad-btn-primary self-start sm:self-auto">
        <Plus class="w-4 h-4" aria-hidden="true" />
        Nueva Categoría
      </button>
    </div>

    <!-- Empty -->
    <div v-if="adminStore.categories.length === 0" class="ad-card">
      <div class="ad-empty">
        <div class="ad-empty-icon"><Layers class="w-6 h-6" aria-hidden="true" /></div>
        <p class="ad-empty-title">Sin categorías</p>
        <p class="ad-empty-sub">Crea tu primera categoría para organizar tu catálogo.</p>
        <button type="button" @click="openCreate" class="ad-btn-primary" style="margin-top:8px">
          <Plus class="w-4 h-4" aria-hidden="true" /> Crear Categoría
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in adminStore.categories"
        :key="cat.id"
        class="ad-card"
        style="display:flex;flex-direction:column;justify-content:space-between;gap:16px;transition:border-color .2s"
        :style="{ borderColor: cat.is_active ? 'rgba(131,58,180,.25)' : 'var(--ad-border)' }"
      >
        <!-- Top row -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div class="ad-icon-badge" style="background:rgba(131,58,180,.12);border:1px solid rgba(131,58,180,.2)">
              <Layers class="w-4 h-4" style="color:#c084fc" aria-hidden="true" />
            </div>
            <span :class="cat.is_active ? 'ad-badge-active' : 'ad-badge-inactive'">
              <span class="ad-badge-dot" :style="{ background: cat.is_active ? '#34d399' : 'rgba(255,255,255,.18)' }"></span>
              {{ cat.is_active ? 'Activa' : 'Oculta' }}
            </span>
          </div>

          <h3 style="font-size:15px;font-weight:800;color:var(--ad-text);margin:0 0 4px">{{ cat.name }}</h3>
          <p v-if="cat.description" style="font-size:12px;color:var(--ad-text-3);margin:0 0 6px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            {{ cat.description }}
          </p>
          <div style="font-size:10px;font-family:monospace;color:var(--ad-text-3)">/{{ cat.slug }}</div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--ad-border)">
          <span style="font-size:12px;font-weight:700;color:var(--ad-text-3)">
            {{ adminStore.products.filter(p => p.category_id === cat.id).length }} productos
          </span>
          <div style="display:flex;gap:6px">
            <button type="button" @click="openEdit(cat)" class="ad-btn-edit" title="Editar">
              <Edit2 class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button type="button" @click="handleDelete(cat)" class="ad-btn-danger" title="Eliminar">
              <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <CategoryFormModal
      v-if="showModal"
      :category="editingCategory"
      @close="showModal = false; editingCategory = null"
    />
  </div>
</template>
