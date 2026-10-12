<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Category } from '@/types/database';
import { useAdminStore } from '@/stores/admin';
import { slugify } from '@/utils/slug';
import { X, Layers } from 'lucide-vue-next';

const props = defineProps<{ category: Category | null }>();
const emit  = defineEmits<{ (e: 'close'): void }>();

const adminStore = useAdminStore();

const form = reactive({ id: '', name: '', slug: '', description: '', is_active: true });

watch(() => props.category, (cat) => {
  if (cat) { form.id = cat.id; form.name = cat.name; form.slug = cat.slug; form.description = cat.description || ''; form.is_active = cat.is_active; }
  else     { form.id = ''; form.name = ''; form.slug = ''; form.description = ''; form.is_active = true; }
}, { immediate: true });

function handleNameChange() { if (!form.id) form.slug = slugify(form.name); }

async function handleSubmit() {
  if (!form.name.trim()) return;
  const ok = await adminStore.saveCategory({ id: form.id || undefined, name: form.name.trim(), slug: form.slug.trim() || slugify(form.name), description: form.description.trim() || null, is_active: form.is_active });
  if (ok) emit('close');
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    role="dialog" aria-modal="true" @click.self="emit('close')"
  >
    <div class="modal-box relative w-full max-w-md">
      <!-- Header -->
      <div class="modal-header">
        <div class="flex items-center gap-2.5">
          <div class="modal-icon-badge">
            <Layers class="w-4 h-4" style="color:#c084fc" aria-hidden="true" />
          </div>
          <h3 class="modal-title">{{ form.id ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
        </div>
        <button type="button" @click="emit('close')" class="modal-close-btn" aria-label="Cerrar">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="modal-body space-y-4">

        <div>
          <label class="ad-label" for="cat-name">Nombre <span style="color:#f87171">*</span></label>
          <input id="cat-name" v-model="form.name" @input="handleNameChange" type="text" required
            placeholder="Ej: Ropa, Calzado, Accesorios..." class="ad-input" />
        </div>

        <div>
          <label class="ad-label" for="cat-desc">Descripción corta (opcional)</label>
          <input id="cat-desc" v-model="form.description" type="text"
            placeholder="Breve descripción..." class="ad-input" />
        </div>

        <div style="display:flex;align-items:center;gap:10px;padding-top:4px">
          <input id="cat-active" v-model="form.is_active" type="checkbox"
            style="width:16px;height:16px;accent-color:#c084fc;cursor:pointer" />
          <label for="cat-active" style="font-size:12px;font-weight:600;color:var(--ad-text-2);cursor:pointer">
            Visible en la tienda
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="ad-btn-ghost">Cancelar</button>
          <button type="submit" :disabled="adminStore.isSaving" class="ad-btn-primary">
            {{ adminStore.isSaving ? 'Guardando...' : 'Guardar Categoría' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  background: linear-gradient(160deg, #130923 0%, #1a0a30 100%);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(131,58,180,.2);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.modal-icon-badge {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(131,58,180,.15);
  border: 1px solid rgba(131,58,180,.2);
  display: flex; align-items: center; justify-content: center;
}
.modal-title {
  font-size: 15px; font-weight: 800;
  color: rgba(255,255,255,.9);
}
.modal-close-btn {
  padding: 6px; border-radius: 9px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  color: rgba(255,255,255,.35);
  cursor: pointer; transition: background .18s, color .18s;
}
.modal-close-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
.modal-body { padding: 22px; }
.modal-footer {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.07);
  margin-top: 6px;
}
</style>
