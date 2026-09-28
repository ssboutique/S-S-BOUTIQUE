<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { slugify } from '@/utils/slug';
import ShareStoreBanner from '@/components/admin/ShareStoreBanner.vue';
import { Store, Check, MapPin, Clock, Globe, DollarSign, ShieldCheck, HelpCircle, ExternalLink, Link2, Copy } from 'lucide-vue-next';

const adminStore = useAdminStore();
const showDnsGuide = ref(false);
const copiedDns = ref<string | null>(null);

const form = reactive({
  name: '',
  slug: '',
  custom_domain: '',
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
      form.custom_domain = store.custom_domain || store.theme_settings?.custom_domain || '';
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

// Clean live preview of the customer link
const previewCustomerUrl = computed(() => {
  const cleanDomain = form.custom_domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
  if (cleanDomain) {
    return `https://${cleanDomain}`;
  }
  const slug = form.slug.trim() || 'mi-tienda';
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/tienda/${slug}`;
  }
  return `https://ssboutique.com/tienda/${slug}`;
});

async function copyDnsValue(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text);
    copiedDns.value = key;
    setTimeout(() => {
      copiedDns.value = null;
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

async function handleSave() {
  const cleanDomain = form.custom_domain.trim()
    ? form.custom_domain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
    : null;

  await adminStore.updateStore({
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    custom_domain: cleanDomain,
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
    theme_settings: {
      ...(adminStore.currentStore?.theme_settings || {
        primary_color: '#0f172a',
        secondary_color: '#1e293b',
        card_style: 'rounded-2xl',
        header_style: 'modern',
        font_family: 'Plus Jakarta Sans',
      }),
      custom_domain: cleanDomain,
    },
  });
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Datos de la Tienda
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Información general, dominio web, ubicación, horarios y redes sociales
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="adminStore.isSaving"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto disabled:opacity-50"
      >
        <Check class="w-4 h-4" />
        <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar Información' }}</span>
      </button>
    </div>

    <!-- Public Store Link Banner -->
    <ShareStoreBanner />

    <!-- Custom Domain Configuration Card -->
    <div id="domain" class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5 transition-colors">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Globe class="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Dominio Propio &amp; Dirección Web
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el enlace con el que tus clientes acceden a tu tienda
            </p>
          </div>
        </div>

        <span
          v-if="form.custom_domain.trim()"
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold self-start sm:self-auto"
        >
          <ShieldCheck class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Dominio Personalizado Configurado</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium self-start sm:self-auto"
        >
          <Link2 class="w-3.5 h-3.5 text-slate-400" />
          <span>Usando Subruta Estándar</span>
        </span>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tu Dominio Web Comprado (Opcional)
          </label>
          <div class="relative">
            <div class="flex items-center">
              <span class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 select-none">
                https://
              </span>
              <input
                v-model="form.custom_domain"
                type="text"
                placeholder="mitienda.com o www.mitienda.com"
                class="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm font-mono text-slate-900 dark:text-white outline-none placeholder-slate-400"
              />
            </div>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Si compraste un dominio en GoDaddy, Namecheap, DonDominio, Hostinger, etc. (ej: <code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">ssboutique.com</code>), escríbelo aquí y guarda los cambios.
          </p>
        </div>

        <!-- Live Preview of Link for Customers -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Enlace final que verán y recibirán tus clientes:</span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Vista previa en vivo</span>
          </div>
          <div class="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span class="text-xs font-mono text-brand-600 dark:text-brand-400 font-bold truncate select-all">
              {{ previewCustomerUrl }}
            </span>
            <a
              :href="previewCustomerUrl"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <span>Probar</span>
              <ExternalLink class="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        <!-- Step-by-Step DNS Guide Toggle -->
        <div class="pt-2">
          <button
            type="button"
            @click="showDnsGuide = !showDnsGuide"
            class="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold inline-flex items-center gap-1.5 hover:underline"
          >
            <HelpCircle class="w-4 h-4 text-brand-500" />
            <span>{{ showDnsGuide ? 'Ocultar guía de configuración DNS' : '¿Cómo conectar tu dominio propio? Ver guía paso a paso' }}</span>
          </button>

          <!-- DNS Guide Details -->
          <div
            v-if="showDnsGuide"
            class="mt-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300 space-y-3 animate-fade-in"
          >
            <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📋 Instrucciones para apuntar los DNS de tu proveedor:</span>
            </div>

            <ol class="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 pl-1">
              <li>
                Inicia sesión en la plataforma donde compraste tu dominio (GoDaddy, Hostinger, Namecheap, etc.) y ve a la sección <strong>"Gestión de DNS"</strong> o <strong>"Zona DNS"</strong>.
              </li>
              <li>
                Agrega o edita el siguiente registro <strong>CNAME</strong>:
                <div class="mt-1.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 font-mono text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div><strong class="text-slate-500 dark:text-slate-400 block text-[10px]">TIPO:</strong> CNAME</div>
                  <div><strong class="text-slate-500 dark:text-slate-400 block text-[10px]">NOMBRE / HOST:</strong> www</div>
                  <div class="flex items-center justify-between">
                    <div>
                      <strong class="text-slate-500 dark:text-slate-400 block text-[10px]">DESTINO / VALOR:</strong>
                      <span class="text-slate-900 dark:text-slate-200">cname.vercel-dns.com</span>
                    </div>
                    <button
                      type="button"
                      @click="copyDnsValue('cname.vercel-dns.com', 'cname')"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1"
                      title="Copiar valor"
                    >
                      <Check v-if="copiedDns === 'cname'" class="w-3.5 h-3.5 text-emerald-600" />
                      <Copy v-else class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
              <li>
                Para el dominio raíz (sin www), agrega un registro <strong>A</strong>:
                <div class="mt-1.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900/60 font-mono text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div><strong class="text-slate-500 dark:text-slate-400 block text-[10px]">TIPO:</strong> A</div>
                  <div><strong class="text-slate-500 dark:text-slate-400 block text-[10px]">NOMBRE / HOST:</strong> @</div>
                  <div class="flex items-center justify-between">
                    <div>
                      <strong class="text-slate-500 dark:text-slate-400 block text-[10px]">DESTINO / VALOR:</strong>
                      <span class="text-slate-900 dark:text-slate-200">76.76.21.21</span>
                    </div>
                    <button
                      type="button"
                      @click="copyDnsValue('76.76.21.21', 'a')"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 p-1"
                      title="Copiar IP"
                    >
                      <Check v-if="copiedDns === 'a'" class="w-3.5 h-3.5 text-emerald-600" />
                      <Copy v-else class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </li>
              <li>
                Escribe tu dominio arriba en el campo <strong>"Tu Dominio Web Comprado"</strong> y presiona <strong>"Guardar Información"</strong>.
              </li>
            </ol>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-blue-200/60 dark:border-blue-900/40">
              * Nota: La propagación de DNS en internet puede tardar entre 5 minutos y unas horas dependiendo de tu registrador.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- General Info Card -->
    <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5 transition-colors">
      <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Store class="w-5 h-5 text-brand-500" />
        <span>Información del Negocio</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nombre del Negocio / Marca <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            @input="handleNameChange"
            type="text"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            URL de tu tienda (Slug) <span class="text-rose-500">*</span>
          </label>
          <div class="flex items-center">
            <span class="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 font-mono">
              /tienda/
            </span>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full px-3 py-2.5 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-mono text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Descripción o Lema Comercial
        </label>
        <textarea
          v-model="form.description"
          rows="2"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none resize-none"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Moneda de la tienda
          </label>
          <select
            v-model="form.currency"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none bg-white dark:bg-slate-800"
          >
            <option value="COP">COP - Peso Colombiano ($ 50.000)</option>
            <option value="USD">USD - Dólar Estadounidense ($50.00)</option>
            <option value="EUR">EUR - Euro (€50,00)</option>
            <option value="MXN">MXN - Peso Mexicano ($50.00)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Teléfono Fijo / Secundario (Opcional)
          </label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="+57 601 234 5678"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Location & Schedule -->
    <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5 transition-colors">
      <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <MapPin class="w-5 h-5 text-brand-500" />
        <span>Ubicación y Horarios</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Dirección del local o punto físico
          </label>
          <input
            v-model="form.address"
            type="text"
            placeholder="Calle 72 # 10-34"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Ciudad / País
          </label>
          <input
            v-model="form.city"
            type="text"
            placeholder="Bogotá, Colombia"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Horarios de Atención
        </label>
        <input
          v-model="form.business_hours"
          type="text"
          placeholder="Lunes a Sábado: 9:00 AM - 7:00 PM"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 dark:text-white outline-none"
        />
      </div>
    </div>

    <!-- Social Links -->
    <div class="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft space-y-5 transition-colors">
      <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Globe class="w-5 h-5 text-brand-500" />
        <span>Redes Sociales</span>
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instagram URL</label>
          <input
            v-model="form.instagram_url"
            type="url"
            placeholder="https://instagram.com/tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facebook URL</label>
          <input
            v-model="form.facebook_url"
            type="url"
            placeholder="https://facebook.com/tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">TikTok URL</label>
          <input
            v-model="form.tiktok_url"
            type="url"
            placeholder="https://tiktok.com/@tu-tienda"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>
