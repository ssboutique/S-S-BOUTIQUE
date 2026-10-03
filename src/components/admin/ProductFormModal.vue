<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import type { Product } from '@/types/database';
import { useAdminStore } from '@/stores/admin';
import { storageService } from '@/services/storageService';
import { slugify } from '@/utils/slug';
import { calculateDiscountPercentage } from '@/utils/currency';
import {
  X,
  Package,
  Upload,
  Trash2,
  Plus,
  Star,
  Layers,
  Image as ImageIcon
} from 'lucide-vue-next';

const props = defineProps<{
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const adminStore = useAdminStore();

const isUploadingImage = ref(false);

const form = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  price: 0,
  original_price: null as number | null,
  sku: '',
  stock: null as number | null,
  category_id: '' as string,
  is_available: true,
  is_featured: false,
});

const imageUrls = ref<string[]>([]);
const variants = ref<Array<{ variant_type: string; variant_value: string; price_modifier: number }>>([]);

// Temporary input for new variant
const newVariant = reactive({
  type: 'Talla',
  value: '',
  price_modifier: 0,
});

watch(
  () => props.product,
  (prod) => {
    if (prod) {
      form.id = prod.id;
      form.name = prod.name;
      form.slug = prod.slug;
      form.description = prod.description || '';
      form.price = Number(prod.price);
      form.original_price = prod.original_price ? Number(prod.original_price) : null;
      form.sku = prod.sku || '';
      form.stock = prod.stock !== null && prod.stock !== undefined ? Number(prod.stock) : null;
      form.category_id = prod.category_id || '';
      form.is_available = prod.is_available;
      form.is_featured = prod.is_featured;

      imageUrls.value = prod.images ? prod.images.map((i) => i.image_url) : [];
      variants.value = prod.variants
        ? prod.variants.map((v) => ({
            variant_type: v.variant_type,
            variant_value: v.variant_value,
            price_modifier: Number(v.price_modifier || 0),
          }))
        : [];
    } else {
      form.id = '';
      form.name = '';
      form.slug = '';
      form.description = '';
      form.price = 0;
      form.original_price = null;
      form.sku = '';
      form.stock = null;
      form.category_id = adminStore.categories[0]?.id || '';
      form.is_available = true;
      form.is_featured = false;
      imageUrls.value = [];
      variants.value = [];
    }
  },
  { immediate: true }
);

const calculatedDiscount = computed(() => {
  return calculateDiscountPercentage(form.price, form.original_price);
});

function handleNameChange() {
  if (!form.id) {
    const baseSlug = slugify(form.name);
    if (!baseSlug) {
      form.slug = '';
      return;
    }
    // Check if baseSlug is already in use by another product in this store
    const existing = adminStore.products.filter((p) => p.id !== form.id);
    let candidate = baseSlug;
    let counter = 1;
    while (existing.some((p) => p.slug === candidate)) {
      counter++;
      candidate = `${baseSlug}-${counter}`;
    }
    form.slug = candidate;
  }
}

async function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  isUploadingImage.value = true;
  try {
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      const url = await storageService.uploadStoreAsset(file, 'products');
      imageUrls.value.push(url);
    }
  } catch (err: any) {
    adminStore.setFeedback('error', err.message || 'Error al procesar la imagen');
  } finally {
    isUploadingImage.value = false;
    input.value = '';
  }
}

function removeImage(index: number) {
  imageUrls.value.splice(index, 1);
}

function setPrimaryImage(index: number) {
  if (index === 0) return;
  const target = imageUrls.value.splice(index, 1)[0];
  imageUrls.value.unshift(target);
}

function addVariant() {
  if (!newVariant.value.trim()) return;
  variants.value.push({
    variant_type: newVariant.type.trim(),
    variant_value: newVariant.value.trim(),
    price_modifier: Number(newVariant.price_modifier || 0),
  });
  newVariant.value = '';
  newVariant.price_modifier = 0;
}

function removeVariant(index: number) {
  variants.value.splice(index, 1);
}

async function handleSubmit() {
  if (!form.name.trim() || form.price < 0) return;

  const rawSlug = form.slug.trim() || slugify(form.name) || `prod-${Date.now()}`;
  const cleanSlug = slugify(rawSlug) || `prod-${Date.now()}`;

  const success = await adminStore.saveProduct(
    {
      id: form.id || undefined,
      name: form.name.trim(),
      slug: cleanSlug,
      description: form.description.trim() || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      sku: form.sku.trim() || null,
      stock: form.stock !== null && form.stock !== undefined ? Number(form.stock) : null,
      category_id: form.category_id || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
    },
    imageUrls.value,
    variants.value
  );

  if (success) {
    emit('close');
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Package class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-lg text-slate-900 leading-tight">
              {{ form.id ? 'Editar Producto' : 'Crear Nuevo Producto' }}
            </h3>
            <p class="text-xs text-slate-500">
              Configura los detalles, fotos, precios y opciones de tu artículo
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-6 flex-1">
        <!-- Basic Info Section -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Información Básica
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del producto <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.name"
                @input="handleNameChange"
                type="text"
                required
                placeholder="Ej: Camiseta Básica Algodón"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                v-model="form.category_id"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none bg-white"
              >
                <option value="">Sin Categoría</option>
                <option v-for="cat in adminStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              Descripción del producto
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Detalla materiales, características, medidas o recomendaciones de uso..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                URL amigable (enlace único)
              </label>
              <div class="flex items-center">
                <span class="px-3 py-2.5 bg-slate-100 text-xs text-slate-500 rounded-l-xl border border-r-0 border-slate-200 font-mono">
                  /
                </span>
                <input
                  v-model="form.slug"
                  type="text"
                  required
                  placeholder="nombre-del-producto"
                  class="w-full px-3 py-2.5 rounded-r-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-mono text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Código del producto / SKU (opcional)
              </label>
              <input
                v-model="form.sku"
                type="text"
                placeholder="Ej: REF-001"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Precios & Inventario
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Precio de Venta <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  v-model.number="form.price"
                  type="number"
                  min="0"
                  required
                  class="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-bold text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Precio Anterior (para oferta)
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  v-model.number="form.original_price"
                  type="number"
                  min="0"
                  placeholder="Opcional"
                  class="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
                />
              </div>
              <span v-if="calculatedDiscount > 0" class="text-[11px] font-bold text-rose-500 block mt-1">
                Descuento automático: {{ calculatedDiscount }}% OFF
              </span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                Stock / Unidades disponibles
              </label>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                placeholder="Ilimitado si está vacío"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Images Section -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Imágenes del Producto ({{ imageUrls.length }})
            </h4>
            <span class="text-[11px] text-slate-400">
              La primera foto es la portada principal
            </span>
          </div>

          <!-- Upload Dropzone -->
          <div class="flex flex-wrap items-center gap-3">
            <div
              v-for="(url, idx) in imageUrls"
              :key="idx"
              class="relative w-24 h-24 rounded-2xl overflow-hidden border-2 bg-slate-100 group shadow-sm"
              :class="idx === 0 ? 'border-brand-500' : 'border-slate-200'"
            >
              <img :src="url" class="w-full h-full object-cover" />

              <div
                v-if="idx === 0"
                class="absolute bottom-0 inset-x-0 bg-brand-500 text-white text-[9px] font-bold text-center py-0.5"
              >
                Portada
              </div>

              <!-- Actions on hover -->
              <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  v-if="idx > 0"
                  type="button"
                  @click="setPrimaryImage(idx)"
                  class="p-1 rounded-md bg-white text-slate-800 hover:text-brand-600"
                  title="Establecer como portada"
                >
                  <Star class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click="removeImage(idx)"
                  class="p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
                  title="Eliminar foto"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Upload Button -->
            <label
              class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 flex flex-col items-center justify-center cursor-pointer transition-all text-slate-400 hover:text-brand-600"
            >
              <Upload v-if="!isUploadingImage" class="w-5 h-5 mb-1" />
              <div v-else class="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-[10px] font-bold text-center px-1">
                {{ isUploadingImage ? 'Subiendo...' : '+ Subir foto' }}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileUpload"
                :disabled="isUploadingImage"
              />
            </label>
          </div>
        </div>

        <!-- Optional Variants Section -->
        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Variantes Opcionales (Tallas, Colores, Capacidad, etc.)
            </h4>
            <span class="text-[11px] text-slate-400">
              Opcional si el producto tiene opciones
            </span>
          </div>

          <!-- Existing Variants Chips -->
          <div v-if="variants.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(v, idx) in variants"
              :key="idx"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <span class="font-bold text-brand-700">{{ v.variant_type }}:</span>
              <span>{{ v.variant_value }}</span>
              <span v-if="v.price_modifier > 0" class="text-emerald-600 font-semibold">
                (+${{ v.price_modifier }})
              </span>
              <button
                type="button"
                @click="removeVariant(idx)"
                class="text-slate-400 hover:text-rose-500 ml-1"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Add Variant Inputs -->
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              v-model="newVariant.type"
              class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none"
            >
              <option value="Talla">Talla</option>
              <option value="Color">Color</option>
              <option value="Capacidad">Capacidad</option>
              <option value="Material">Material</option>
              <option value="Sabor">Sabor</option>
              <option value="Opción">Opción personalizada</option>
            </select>

            <input
              v-model="newVariant.value"
              type="text"
              placeholder="Ej: M, L, XL / Negro, Azul / 128GB"
              class="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none"
              @keydown.enter.prevent="addVariant"
            />

            <button
              type="button"
              @click="addVariant"
              class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              + Agregar Variante
            </button>
          </div>
        </div>

        <!-- Visibility & Featured Toggles -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div class="text-xs font-bold text-slate-900">Disponible para la venta</div>
              <div class="text-[11px] text-slate-500">Muestra u oculta este producto inmediatamente en tu tienda pública</div>
            </div>
            <input
              v-model="form.is_available"
              type="checkbox"
              class="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
          </div>

          <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div class="text-xs font-bold text-slate-900">Destacar en la tienda</div>
              <div class="text-[11px] text-slate-500">Muestra una etiqueta dorada de destacado sobre la tarjeta del producto</div>
            </div>
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
            />
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="adminStore.isSaving"
            class="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-glow transition-all active:scale-95"
          >
            {{ adminStore.isSaving ? 'Guardando...' : 'Guardar Producto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
