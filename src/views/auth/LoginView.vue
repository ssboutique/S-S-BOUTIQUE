<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// Credentials start empty for privacy and security
const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Por favor ingresa tu correo y contraseña.';
    return;
  }

  const success = await authStore.login(email.value.trim(), password.value);
  if (success) {
    router.push('/admin');
  } else {
    errorMessage.value = authStore.error || 'Credenciales incorrectas. Verifica tus datos.';
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans relative overflow-hidden">
    <!-- Subtle Background Glow -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
      <router-link to="/" class="inline-flex items-center gap-3 mb-6 group">
        <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:border-slate-500 transition-colors">
          S&amp;S
        </div>
        <div class="text-left">
          <span class="text-xl font-black text-white tracking-tight block">S&amp;S BOUTIQUE</span>
          <span class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Panel de Control</span>
        </div>
      </router-link>

      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
        Acceso al Administrador
      </h1>
      <p class="text-xs sm:text-sm text-slate-400 mt-2">
        Ingresa con tus credenciales de propietario para gestionar tu tienda
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
      <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-start gap-2"
        >
          <span class="mt-0.5">•</span>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-700 transition-all font-sans"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-700 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-sm transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ShieldCheck v-if="!authStore.isLoading" class="w-4 h-4 text-slate-950" />
            <span>{{ authStore.isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión' }}</span>
            <ArrowRight v-if="!authStore.isLoading" class="w-4 h-4" />
          </button>
        </form>

        <!-- Quick Fill for Store Admin -->
        <div class="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <div class="text-slate-300 font-semibold">Credenciales de Administrador</div>
            <div class="text-slate-400 text-[11px]">admin@ssboutique.com</div>
          </div>
          <button
            type="button"
            @click="email = 'admin@ssboutique.com'; password = 'admin123'"
            class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Completar
          </button>
        </div>

        <div class="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          ¿Deseas visitar el catálogo como cliente?
          <router-link to="/tienda/ss-boutique" class="text-white font-bold hover:underline ml-1">
            Ver Tienda Pública
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
