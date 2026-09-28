<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeService } from '@/services/storeService';
import type { Store } from '@/types/database';
import { Shield, Store as StoreIcon, Search, CheckCircle, XCircle, ExternalLink, ArrowLeft } from 'lucide-vue-next';

const stores = ref<Store[]>([]);
const searchQuery = ref('');
const isLoading = ref(true);

async function loadStores() {
  isLoading.value = true;
  try {
    stores.value = await storeService.getAllStores();
  } catch (e) {
    console.error('Failed to load stores for super admin:', e);
  } finally {
    isLoading.value = false;
  }
}

const filteredStores = computed(() => {
  if (!searchQuery.value.trim()) return stores.value;
  const q = searchQuery.value.toLowerCase().trim();
  return stores.value.filter(
    (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
  );
});

async function toggleStoreActive(store: Store) {
  const next = !store.is_active;
  await storeService.updateStore(store.id, { is_active: next });
  store.is_active = next;
}

onMounted(() => {
  loadStores();
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-10 font-sans">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div class="flex items-center gap-3">
          <router-link
            to="/admin"
            class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Volver al panel"
          >
            <ArrowLeft class="w-5 h-5" />
          </router-link>
          <div>
            <div class="flex items-center gap-2">
              <Shield class="w-6 h-6 text-amber-400" />
              <h1 class="text-2xl font-black tracking-tight text-white">
                Super Admin VendPro
              </h1>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Gestión global de todas las tiendas de la plataforma
            </p>
          </div>
        </div>

        <div class="relative w-full sm:w-72">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar tienda por nombre o slug..."
            class="w-full pl-9 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-slate-850 p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase">Tiendas Registradas</span>
          <div class="text-3xl font-black text-white mt-2">{{ stores.length }}</div>
        </div>
        <div class="bg-slate-850 p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase">Tiendas Activas</span>
          <div class="text-3xl font-black text-emerald-400 mt-2">
            {{ stores.filter(s => s.is_active).length }}
          </div>
        </div>
        <div class="bg-slate-850 p-5 rounded-2xl border border-slate-800">
          <span class="text-xs font-bold text-slate-400 uppercase">Planes Preparados</span>
          <div class="text-sm font-bold text-amber-400 mt-3 flex items-center gap-2">
            <span>FREE</span> • <span>PRO</span> • <span>PREMIUM</span>
          </div>
        </div>
      </div>

      <!-- Stores Table -->
      <div class="bg-slate-850 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 class="font-bold text-base text-white">Directorio de Tiendas</h2>
          <span class="text-xs text-slate-400">{{ filteredStores.length }} tiendas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th class="py-3 px-6">Tienda</th>
                <th class="py-3 px-6">WhatsApp</th>
                <th class="py-3 px-6">Moneda</th>
                <th class="py-3 px-6">Estado</th>
                <th class="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-xs">
              <tr v-for="s in filteredStores" :key="s.id" class="hover:bg-slate-800/50">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                      <img v-if="s.logo_url" :src="s.logo_url" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center font-bold text-white bg-slate-700">
                        {{ s.name.charAt(0) }}
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-white text-sm">{{ s.name }}</div>
                      <div class="text-slate-400 font-mono">/tienda/{{ s.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300 font-mono">
                  +{{ s.whatsapp_number }}
                </td>
                <td class="py-4 px-6 text-slate-400 font-bold">
                  {{ s.currency }}
                </td>
                <td class="py-4 px-6">
                  <button
                    type="button"
                    @click="toggleStoreActive(s)"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
                    :class="s.is_active ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'"
                  >
                    <component :is="s.is_active ? CheckCircle : XCircle" class="w-3.5 h-3.5" />
                    <span>{{ s.is_active ? 'Activa' : 'Suspendida' }}</span>
                  </button>
                </td>
                <td class="py-4 px-6 text-right">
                  <a
                    :href="`/tienda/${s.slug}`"
                    target="_blank"
                    class="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>Visitar</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
