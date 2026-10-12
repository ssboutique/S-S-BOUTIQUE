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
  Image as ImageIcon,
  Tag,
  Percent,
  Sparkles,
  Flame
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

const basePrice = ref<number>(0);
const discountPercent = ref<number>(0);

const imageUrls = ref<string[]>([]);
const variants = ref<Array<{ variant_type: string; variant_value: string; price_modifier: number }>>([]);

// Temporary input for new variant
const newVariant = reactive({
  type: 'Talla',
  value: '',
  price_modifier: 0,
});

function applyDiscountPercent(percent: number) {
  discountPercent.value = Math.max(0, Math.min(99, percent));
  if (discountPercent.value > 0) {
    if (basePrice.value <= 0 && form.price > 0) {
      basePrice.value = form.price;
    }
    const currentBase = basePrice.value > 0 ? basePrice.value : form.price;
    form.original_price = currentBase;
    form.price = Math.round(currentBase * (1 - discountPercent.value / 100));
  } else {
    form.original_price = null;
    if (basePrice.value > 0) {
      form.price = basePrice.value;
    }
  }
}

function handleBasePriceChange() {
  if (discountPercent.value > 0 && basePrice.value > 0) {
    form.original_price = basePrice.value;
    form.price = Math.round(basePrice.value * (1 - discountPercent.value / 100));
  } else {
    form.price = basePrice.value;
    form.original_price = null;
  }
}

function handleFinalPriceChange() {
  if (basePrice.value > 0 && form.price < basePrice.value) {
    form.original_price = basePrice.value;
    discountPercent.value = Math.round(((basePrice.value - form.price) / basePrice.value) * 100);
  } else {
    basePrice.value = form.price;
    discountPercent.value = 0;
    form.original_price = null;
  }
}

watch(
  () => props.product,
  (prod) => {
    if (prod) {
      form.id = prod.id;
      form.name = prod.name;
      form.slug = prod.slug;
      form.description = prod.description || '';
      form.price = Number(prod.price || 0);
      form.original_price = prod.original_price ? Number(prod.original_price) : null;
      form.sku = prod.sku || '';
      form.stock = prod.stock !== null && prod.stock !== undefined ? Number(prod.stock) : null;
      form.category_id = prod.category_id || '';
      form.is_available = prod.is_available;
      form.is_featured = prod.is_featured;

      if (form.original_price && form.original_price > form.price) {
        basePrice.value = form.original_price;
        discountPercent.value = Math.round(((form.original_price - form.price) / form.original_price) * 100);
      } else {
        basePrice.value = form.price;
        discountPercent.value = 0;
      }

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
      basePrice.value = 0;
      discountPercent.value = 0;
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

const discountSavings = computed(() => {
  if (form.original_price && form.original_price > form.price) {
    return form.original_price - form.price;
  }
  return 0;
});

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
    <div class="relative w-full max-w-3xl max-h-[92vh] flex flex-col" style="background:linear-gradient(160deg,#130923 0%,#1a0a30 100%);border:1px solid var(--ad-border);border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.7)">
      <!-- Modal Header -->
      <div style="padding:18px 22px;border-bottom:1px solid var(--ad-divider);display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div class="flex items-center gap-2.5">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(238,42,123,.12);border:1px solid rgba(238,42,123,.2);display:flex;align-items:center;justify-content:center">
            <Package class="w-5 h-5" />
          </div>
          <div>
            <h3 style="font-size:16px;font-weight:800;color:var(--ad-text)">
              {{ form.id ? 'Editar Producto' : 'Crear Nuevo Producto' }}
            </h3>
            <p style="font-size:11px;color:var(--ad-text-3)">
              Configura los detalles, fotos, precios y opciones de tu artículo
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="modal-close-btn-prod"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-6 flex-1">
        <!-- Basic Info Section -->
        <div class="space-y-4">
          <h4 class="modal-section-title">
            Información Básica
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="ad-label">
                Nombre del producto <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.name"
                @input="handleNameChange"
                type="text"
                required
                placeholder="Ej: Camiseta Básica Algodón"
                class="ad-input"
              />
            </div>

            <div>
              <label class="ad-label">
                Categoría
              </label>
              <select
                v-model="form.category_id"
                class="ad-input"
              >
                <option value="">Sin Categoría</option>
                <option v-for="cat in adminStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="ad-label">
              Descripción del producto
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Detalla materiales, características, medidas o recomendaciones de uso..."
              class="ad-input"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="ad-label">
                URL amigable (enlace único)
              </label>
              <div class="flex items-center">
                <span class="modal-slug-prefix">
                  /
                </span>
                <input
                  v-model="form.slug"
                  type="text"
                  required
                  placeholder="nombre-del-producto"
                  class="ad-input" style="border-radius:0 12px 12px 0"
                />
              </div>
            </div>

            <div>
              <label class="ad-label">
                Código del producto / SKU (opcional)
              </label>
              <input
                v-model="form.sku"
                type="text"
                placeholder="Ej: REF-001"
                class="ad-input"
              />
            </div>
          </div>
        </div>

        <!-- Pricing & Discount Section -->
        <div class="space-y-4 pt-4 modal-section">
          <div class="flex items-center justify-between">
            <h4 class="modal-section-title" style="display:flex;align-items:center;gap:6px">
              <Tag class="w-3.5 h-3.5 text-fuchsia-600" />
              Precios, Descuentos & Inventario
            </h4>
            <span v-if="discountPercent > 0" class="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Sparkles class="w-3 h-3" />
              Oferta del {{ discountPercent }}% OFF activa
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Base Price -->
            <div>
              <label class="ad-label">
                Precio Normal / Base <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  v-model.number="basePrice"
                  @input="handleBasePriceChange"
                  type="number"
                  min="0"
                  required
                  placeholder="Ej: 85000"
                  class="ad-input"
                />
              </div>
              <p class="modal-help">Precio habitual del artículo</p>
            </div>

            <!-- Discount percentage selector -->
            <div>
              <label class="ad-label">
                Descuento personalizado (%)
              </label>
              <div class="relative">
                <input
                  v-model.number="discountPercent"
                  @input="applyDiscountPercent(discountPercent)"
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  class="ad-input"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p class="modal-help">Ingresa el % o usa los botones rápidos</p>
            </div>

            <!-- Final Sale Price -->
            <div>
              <label class="ad-label">
                Precio Final de Venta <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-600">$</span>
                <input
                  v-model.number="form.price"
                  @input="handleFinalPriceChange"
                  type="number"
                  min="0"
                  required
                  class="ad-input"
                />
              </div>
              <p class="modal-help" style="color:rgba(238,42,123,.65)">Valor a cobrar al cliente</p>
            </div>
          </div>

          <!-- Quick Discount Presets Buttons -->
          <div>
            <label class="modal-presets-label">
              Aplicar Descuento Rápido:
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                @click="applyDiscountPercent(0)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                :class="discountPercent === 0 ? 'bg-slate-900 text-slate-900 dark:text-slate-900 dark:text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
              >
                Sin Descuento (0%)
              </button>
              <button
                v-for="p in [10, 15, 20, 25, 30, 40, 50]"
                :key="p"
                type="button"
                @click="applyDiscountPercent(p)"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                :class="discountPercent === p ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-slate-900 dark:text-slate-900 dark:text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
              >
                {{ p }}% OFF
              </button>
            </div>
          </div>

          <!-- Interactive Discount Summary Card -->
          <div
            v-if="discountPercent > 0 && form.original_price"
            class="modal-discount-card"
          >
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-fuchsia-600 text-slate-900 dark:text-slate-900 dark:text-white flex items-center justify-center font-black text-xs shrink-0">
                %
              </div>
              <div>
                <p style="font-size:12px;font-weight:800;color:var(--ad-text)">
                  Descuento del {{ discountPercent }}% aplicado
                </p>
                <p style="font-size:11px;color:var(--ad-text-3)">
                  El cliente verá <span class="line-through text-slate-400 font-semibold">${{ form.original_price.toLocaleString('es-CO') }}</span> y pagará <strong style="color:#ee2a7b">${{ form.price.toLocaleString('es-CO') }}</strong>
                </p>
              </div>
            </div>
            <div class="text-right sm:self-center shrink-0">
              <span style="font-size:11px;font-weight:900;color:#34d399;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);padding:3px 10px;border-radius:8px">
                Ahorro: ${{ discountSavings.toLocaleString('es-CO') }}
              </span>
            </div>
          </div>

          <!-- Stock Input -->
          <div class="pt-2">
            <label class="ad-label">
              Stock / Unidades disponibles
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              placeholder="Ilimitado si se deja vacío"
              class="ad-input sm:w-1/3"
            />
          </div>
        </div>

        <!-- Images Section -->
        <div class="space-y-4 pt-4 modal-section">
          <div class="flex items-center justify-between">
            <h4 class="modal-section-title">
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
              style="position:relative;width:96px;height:96px;border-radius:16px;overflow:hidden;background:var(--ad-surface);flex-shrink:0"
              :class="idx === 0 ? 'border-brand-500' : 'border-slate-200'"
            >
              <img :src="url" class="w-full h-full object-cover" />

              <div
                v-if="idx === 0"
                class="absolute bottom-0 inset-x-0 bg-brand-500 text-slate-900 dark:text-slate-900 dark:text-white text-[9px] font-bold text-center py-0.5"
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
                  class="p-1 rounded-md bg-rose-500 text-slate-900 dark:text-slate-900 dark:text-white hover:bg-rose-600"
                  title="Eliminar foto"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Upload Button -->
            <label
              class="modal-upload-btn"
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
        <div class="space-y-4 pt-4 modal-section">
          <div class="flex items-center justify-between">
            <h4 class="modal-section-title">
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
              class="modal-variant-chip"
            >
              <span style="font-weight:800;color:#c084fc">{{ v.variant_type }}:</span>
              <span>{{ v.variant_value }}</span>
              <span v-if="v.price_modifier > 0" style="color:#34d399;font-weight:600">
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
          <div class="modal-variant-row">
            <select
              v-model="newVariant.type"
              class="ad-input" style="width:auto;min-width:110px;padding:7px 11px;font-size:12px"
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
              class="ad-input" style="padding:7px 11px;font-size:12px"
              @keydown.enter.prevent="addVariant"
            />

            <button
              type="button"
              @click="addVariant"
              class="ad-btn-primary" style="padding:7px 14px;font-size:11px;flex-shrink:0"
            >
              + Agregar Variante
            </button>
          </div>
        </div>

        <!-- Visibility & 3D Slider Promotions Toggle -->
        <div class="space-y-3 pt-4 modal-section">
          <div class="modal-toggle-row">
            <div>
              <div style="font-size:12px;font-weight:800;color:var(--ad-text)">Disponible para la venta</div>
              <div style="font-size:10px;color:var(--ad-text-3)">Muestra u oculta este producto inmediatamente en tu tienda pública</div>
            </div>
            <input
              v-model="form.is_available"
              type="checkbox"
              class="w-5 h-5 text-fuchsia-600 rounded border-slate-300 focus:ring-fuchsia-500 cursor-pointer"
            />
          </div>

          <!-- Promotions Slider Selector Card -->
          <div
            class="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer"
            :class="form.is_featured ? 'bg-fuchsia-500/8 border-fuchsia-500/25' : 'bg-slate-50 dark:bg-slate-50 dark:bg-white/4 border-slate-200 dark:border-slate-200 dark:border-white/7 hover:bg-slate-100 dark:bg-slate-100 dark:bg-white/6'"
            @click="form.is_featured = !form.is_featured"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                :class="form.is_featured ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 text-slate-900 dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-100 dark:bg-white/8 text-slate-400 dark:text-slate-900 dark:text-slate-400 dark:text-slate-900 dark:text-white/28'"
              >
                <Flame class="w-5 h-5" />
              </div>
              <div>
                <div style="font-size:12px;font-weight:900;color:var(--ad-text);display:flex;align-items:center;gap:6px">
                  <span>Exhibir en el Slider Principal de Promociones</span>
                  <span v-if="form.is_featured" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-fuchsia-600 text-slate-900 dark:text-slate-900 dark:text-white">
                    DESTACADO EN SLIDER
                  </span>
                </div>
                <div style="font-size:10px;color:var(--ad-text-3)">
                  Aparecerá en la pasarela destacada superior de la tienda para máxima atracción visual
                </div>
              </div>
            </div>
            <input
              v-model="form.is_featured"
              type="checkbox"
              @click.stop
              class="w-5 h-5 text-fuchsia-600 rounded border-slate-300 focus:ring-fuchsia-500 cursor-pointer"
            />
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer-sticky">
          <button
            type="button"
            @click="emit('close')"
            class="ad-btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="adminStore.isSaving"
            class="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-slate-900 dark:text-slate-900 dark:text-white rounded-xl text-xs font-bold shadow-glow transition-all active:scale-95"
          >
            {{ adminStore.isSaving ? 'Guardando...' : 'Guardar Producto' }}
          </button>
        </div>
      </form>
    </div>
  </div>

<style scoped>
.modal-close-btn-prod {
  padding:7px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  color:rgba(255,255,255,.32);cursor:pointer;transition:background .18s,color .18s;
}
.modal-close-btn-prod:hover { background:rgba(255,255,255,.1);color:#fff; }
.modal-section { border-top:1px solid rgba(255,255,255,.07); }
.modal-section-title { font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.3); }
.modal-slug-prefix { padding:9px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-right:none;border-radius:12px 0 0 12px;font-size:11px;font-family:monospace;color:rgba(255,255,255,.28);display:flex;align-items:center; }
.modal-help { font-size:10px;color:rgba(255,255,255,.25);margin-top:3px; }
.modal-presets-label { display:block;font-size:9px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:6px; }
.modal-discount-card { padding:14px 16px;border-radius:16px;background:rgba(238,42,123,.07);border:1px solid rgba(238,42,123,.18);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px; }
.modal-upload-btn { width:96px;height:96px;border-radius:16px;border:2px dashed rgba(255,255,255,.14);background:rgba(255,255,255,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.22);transition:border-color .2s,background .2s; }
.modal-upload-btn:hover { border-color:rgba(238,42,123,.45);background:rgba(238,42,123,.05); }
.modal-variant-chip { display:inline-flex;align-items:center;gap:8px;padding:5px 10px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);font-size:11px;color:rgba(255,255,255,.65); }
.modal-variant-row { padding:12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);display:flex;flex-wrap:wrap;align-items:center;gap:8px; }
.modal-toggle-row { display:flex;align-items:center;justify-content:space-between;padding:14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07); }
.modal-footer-sticky { padding:16px 22px;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:flex-end;gap:10px;background:linear-gradient(0deg,#1a0a30,#130923);position:sticky;bottom:0; }
</style>
</template>
