<script setup lang="ts">
import { ref } from 'vue';
import { useAdminStore } from '@/stores/admin';
import CategoryFormModal from '@/components/admin/CategoryFormModal.vue';
import type { Category } from '@/types/database';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-vue-next';

const adminStore = useAdminStore();

const showModal = ref(false);
const editingCategory = ref<Category | null>(null);

function openCreate() {
  editingCategory.value = null;
  showModal.value = true;
}

function openEdit(cat: Category) {
  editingCategory.value = cat;
  showModal.value = true;
}

async function handleDelete(cat: Category) {
  if (confirm(`¿Estás seguro de eliminar la categoría "${cat.name}"? Los productos no se eliminarán, solo perderán su categoría.`)) {
    await adminStore.deleteCategory(cat.id);
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Categorías de Productos
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Organiza tus productos para que tus clientes encuentren rápidamente lo que buscan
        </p>
      </div>

      <button
        type="button"
        @click="openCreate"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>+ Nueva Categoría</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="cat in adminStore.categories"
        :key="cat.id"
        class="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-soft flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
      >
        <div>
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers class="w-5 h-5" />
            </div>
            <span
              class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              :class="cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
            >
              {{ cat.is_active ? 'Activa' : 'Oculta' }}
            </span>
          </div>

          <h3 class="font-bold text-slate-900 text-base mt-3">
            {{ cat.name }}
          </h3>
          <p v-if="cat.description" class="text-xs text-slate-500 mt-1 line-clamp-2">
            {{ cat.description }}
          </p>

          <div class="text-xs text-slate-400 font-mono mt-2">
            /{{ cat.slug }}
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600">
            {{ adminStore.products.filter(p => p.category_id === cat.id).length }} productos
          </span>

          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="openEdit(cat)"
              class="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              title="Editar categoría"
            >
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="handleDelete(cat)"
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Eliminar categoría"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <CategoryFormModal
      v-if="showModal"
      :category="editingCategory"
      @close="showModal = false; editingCategory = null"
    />
  </div>
</template>
