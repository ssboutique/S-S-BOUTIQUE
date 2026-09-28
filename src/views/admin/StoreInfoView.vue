<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { slugify } from '@/utils/slug';
import ShareStoreBanner from '@/components/admin/ShareStoreBanner.vue';
import { Store, Check, MapPin, Clock, Globe, DollarSign } from 'lucide-vue-next';

const adminStore = useAdminStore();

const form = reactive({
  name: '',
  slug: '',
  description: '',
  phone: '',
  address: '',
  city: '',
  currency: 'COP',
  business_hours: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  is_active: true,
});

watch(
  () => adminStore.currentStore,
  (store) => {
    if (store) {
      form.name = store.name;
      form.slug = store.slug;
      form.description = store.description || '';
      form.phone = store.phone || '';
      form.address = store.address || '';
      form.city = store.city || '';
      form.currency = store.currency || 'COP';
      form.business_hours = store.business_hours || '';
      form.instagram_url = store.instagram_url || '';
      form.facebook_url = store.facebook_url || '';
      form.tiktok_url = store.tiktok_url || '';
      form.is_active = store.is_active;
    }
  },
  { immediate: true }
);

function handleNameChange() {
  if (!form.slug) {
    form.slug = slugify(form.name);
  }
}

async function handleSave() {
  await adminStore.updateStore({
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || null,
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
    city: form.city.trim() || null,
    currency: form.currency,
    business_hours: form.business_hours.trim() || null,
    instagram_url: form.instagram_url.trim() || null,
    facebook_url: form.facebook_url.trim() || null,
    tiktok_url: form.tiktok_url.trim() || null,
    is_active: form.is_active,
  });
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Datos de la Tienda
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Información general, ubicación, horarios y presencia en redes
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="adminStore.isSaving"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
      >
        <Check class="w-4 h-4" />
        <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar Información' }}</span>
      </button>
    </div>

    <!-- Public Store Link Banner -->
    <ShareStoreBanner />

    <!-- General Info Card -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-5">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Store class="w-5 h-5 text-brand-500" />
        <span>Información del Negocio</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Nombre del Negocio / Marca <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            @input="handleNameChange"
            type="text"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            URL de tu tienda (Slug) <span class="text-rose-500">*</span>
          </label>
          <div class="flex items-center">
            <span class="px-3 py-2.5 bg-slate-100 text-xs text-slate-500 rounded-l-xl border border-r-0 border-slate-200 font-mono">
              /tienda/
            </span>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full px-3 py-2.5 rounded-r-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-mono text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">
          Descripción o Lema Comercial
        </label>
        <textarea
          v-model="form.description"
          rows="2"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none resize-none"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Moneda de la tienda
          </label>
          <select
            v-model="form.currency"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none bg-white"
          >
            <option value="COP">COP - Peso Colombiano ($ 50.000)</option>
            <option value="USD">USD - Dólar Estadounidense ($50.00)</option>
            <option value="EUR">EUR - Euro (€50,00)</option>
            <option value="MXN">MXN - Peso Mexicano ($50.00)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Teléfono Fijo / Secundario (Opcional)
          </label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="+57 601 234 5678"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Location & Schedule -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-5">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <MapPin class="w-5 h-5 text-brand-500" />
        <span>Ubicación y Horarios</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Dirección del local o punto físico
          </label>
          <input
            v-model="form.address"
            type="text"
            placeholder="Calle 72 # 10-34"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Ciudad / País
          </label>
          <input
            v-model="form.city"
            type="text"
            placeholder="Bogotá, Colombia"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">
          Horarios de Atención
        </label>
        <input
          v-model="form.business_hours"
          type="text"
          placeholder="Lunes a Sábado: 9:00 AM - 7:00 PM"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none"
        />
      </div>
    </div>

    <!-- Social Links -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-5">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Globe class="w-5 h-5 text-brand-500" />
        <span>Redes Sociales</span>
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
          <input
            v-model="form.instagram_url"
            type="url"
            placeholder="https://instagram.com/tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Facebook URL</label>
          <input
            v-model="form.facebook_url"
            type="url"
            placeholder="https://facebook.com/tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">TikTok URL</label>
          <input
            v-model="form.tiktok_url"
            type="url"
            placeholder="https://tiktok.com/@tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
