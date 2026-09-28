<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { storeService } from '@/services/storeService';
import { slugify } from '@/utils/slug';
import { Lock, Mail, User, Store, MessageCircle, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  storeName: '',
  slug: '',
  whatsappNumber: '',
});

const isSubmitting = ref(false);
const errorMessage = ref('');

function handleStoreNameChange() {
  form.slug = slugify(form.storeName);
}

async function handleRegister() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    // 1. Sign up user
    const regSuccess = await authStore.register(form.email, form.password, form.fullName);
    if (!regSuccess) {
      errorMessage.value = authStore.error || 'Error al crear la cuenta';
      return;
    }

    const ownerId = authStore.profile?.id || '00000000-0000-0000-0000-000000000001';

    // 2. Create store
    await storeService.createStore({
      owner_id: ownerId,
      name: form.storeName.trim(),
      slug: form.slug.trim() || slugify(form.storeName),
      whatsapp_number: form.whatsappNumber.replace(/\D/g, ''),
      description: `Bienvenido a la tienda oficial de ${form.storeName}.`,
      logo_url: null,
      banner_url: null,
      phone: null,
      address: null,
      city: null,
      currency: 'COP',
      is_active: true,
      instagram_url: null,
      facebook_url: null,
      tiktok_url: null,
      business_hours: 'Lunes a Sábado: 8:00 AM - 6:00 PM',
      theme_settings: {
        primary_color: '#16a34a',
        secondary_color: '#0f172a',
        card_style: 'rounded-2xl',
        header_style: 'modern',
        font_family: 'Plus Jakarta Sans',
      },
    });

    router.push('/admin');
  } catch (err: any) {
    errorMessage.value = err.message || 'Error al configurar tu tienda';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans relative overflow-hidden">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-lg text-center relative z-10">
      <router-link to="/" class="inline-flex items-center gap-2.5 mb-6 group">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-extrabold text-lg shadow-glow">
          V
        </div>
        <span class="text-2xl font-black text-white tracking-tight">VendPro</span>
      </router-link>

      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Crea tu Tienda Digital en 1 Minuto
      </h1>
      <p class="text-sm text-slate-400 mt-2">
        Vende tus productos directamente por WhatsApp sin comisiones abusivas
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
      <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div v-if="errorMessage" class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Tu Nombre
              </label>
              <div class="relative">
                <User class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  class="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Ej: Carlos Gómez"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div class="relative">
                <Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="carlos@negocio.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800">
            <h3 class="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">
              Datos de tu Tienda Digital
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre de tu Negocio / Marca
                </label>
                <div class="relative">
                  <Store class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="form.storeName"
                    @input="handleStoreNameChange"
                    type="text"
                    required
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Ej: Calzado & Moda Urbana"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  WhatsApp Receptor de Pedidos
                </label>
                <div class="relative">
                  <MessageCircle class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="form.whatsappNumber"
                    type="tel"
                    required
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Ej: 573001234567"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enlace único de tu tienda
                </label>
                <div class="flex items-center">
                  <span class="px-3 py-2.5 bg-slate-800 text-xs text-slate-400 rounded-l-xl border border-r-0 border-slate-700 font-mono">
                    vendpro.app/
                  </span>
                  <input
                    v-model="form.slug"
                    type="text"
                    required
                    class="w-full px-3 py-2.5 bg-slate-800/80 rounded-r-xl border border-slate-700 text-xs font-mono text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-glow transition-all active:scale-98"
          >
            <span>{{ isSubmitting ? 'Creando tu tienda...' : 'Lanzar mi Tienda Digital' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <div class="text-center text-xs text-slate-400">
          ¿Ya tienes cuenta registrada?
          <router-link to="/login" class="text-brand-400 font-bold hover:underline ml-1">
            Iniciar sesión
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
