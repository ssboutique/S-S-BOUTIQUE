<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Lock, Mail, ArrowRight, Shield, ShieldCheck } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('admin@ssboutique.com');
const password = ref('admin123');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/admin');
  } else {
    errorMessage.value = authStore.error || 'Credenciales incorrectas';
  }
}

async function quickAdminLogin() {
  email.value = 'admin@ssboutique.com';
  password.value = 'admin123';
  await handleLogin();
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans relative overflow-hidden">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
      <router-link to="/" class="inline-flex items-center gap-3 mb-6 group">
        <div class="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:border-slate-500 transition-colors">
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
        Ingresa tus credenciales para administrar el catálogo y pedidos
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
      <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Correo del Administrador
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-700 transition-all font-mono"
                placeholder="admin@ssboutique.com"
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
                class="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-700 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-sm transition-all active:scale-98"
          >
            <span>{{ authStore.isLoading ? 'Verificando...' : 'Iniciar Sesión como Administrador' }}</span>
            <ArrowRight class="w-4 h-4" />
          </button>
        </form>

        <!-- Quick Demo Button -->
        <div class="pt-4 border-t border-slate-800">
          <button
            type="button"
            @click="quickAdminLogin"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <Shield class="w-4 h-4 text-slate-300" />
            <span>Acceso Directo como Administrador</span>
          </button>
        </div>

        <div class="text-center text-xs text-slate-400">
          ¿Deseas ver la tienda como cliente?
          <router-link to="/tienda/ss-boutique" class="text-white font-bold hover:underline ml-1">
            Ver Tienda Pública
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
