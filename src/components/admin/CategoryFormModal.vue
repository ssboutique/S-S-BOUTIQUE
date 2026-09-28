<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Category } from '@/types/database';
import { useAdminStore } from '@/stores/admin';
import { slugify } from '@/utils/slug';
import { X, Layers } from 'lucide-vue-next';

const props = defineProps<{
  category: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const adminStore = useAdminStore();

const form = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  is_active: true,
});

watch(
  () => props.category,
  (cat) => {
    if (cat) {
      form.id = cat.id;
      form.name = cat.name;
      form.slug = cat.slug;
      form.description = cat.description || '';
      form.is_active = cat.is_active;
    } else {
      form.id = '';
      form.name = '';
      form.slug = '';
      form.description = '';
      form.is_active = true;
    }
  },
  { immediate: true }
);

function handleNameChange() {
  if (!form.id) {
    form.slug = slugify(form.name);
  }
}

async function handleSubmit() {
  if (!form.name.trim()) return;

  const success = await adminStore.saveCategory({
    id: form.id || undefined,
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || null,
    is_active: form.is_active,
  });

  if (success) {
    emit('close');
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Layers class="w-4 h-4" />
          </div>
          <h3 class="font-bold text-base text-slate-900">
            {{ form.id ? 'Editar Categoría' : 'Nueva Categoría' }}
          </h3>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Nombre de la categoría <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            @input="handleNameChange"
            type="text"
            required
            placeholder="Ej: Ropa, Calzado, Tecnología..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Descripción corta (opcional)
          </label>
          <input
            v-model="form.description"
            type="text"
            placeholder="Breve detalle de la categoría..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <input
            id="cat-active"
            v-model="form.is_active"
            type="checkbox"
            class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
          />
          <label for="cat-active" class="text-xs font-medium text-slate-700">
            Categoría visible en la tienda
          </label>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="adminStore.isSaving"
            class="px-5 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            {{ adminStore.isSaving ? 'Guardando...' : 'Guardar Categoría' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
