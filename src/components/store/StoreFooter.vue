<script setup lang="ts">
import { computed } from 'vue';
import { useStoreStore } from '@/stores/store';
import { MessageCircle, MapPin, Clock, Instagram, Facebook, Share2 } from 'lucide-vue-next';

const storeStore = useStoreStore();

const developerCredit = computed(() => {
  return import.meta.env.VITE_DEVELOPER_CREDIT || 'Desarrollado por Edisson Pinza';
});

function openWhatsApp() {
  if (storeStore.store?.whatsapp_number) {
    const cleanPhone = storeStore.store.whatsapp_number.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=Hola!%20Tengo%20una%20pregunta%20sobre%20su%20tienda.`, '_blank');
  }
}
</script>

<template>
  <footer class="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800" role="contentinfo">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand Info -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div
              v-if="storeStore.store?.logo_url"
              class="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-700"
            >
              <img :src="storeStore.store.logo_url" :alt="storeStore.store.name" class="w-full h-full object-cover rounded-lg" />
            </div>
            <h3 class="text-white font-bold text-lg">
              {{ storeStore.store?.name }}
            </h3>
          </div>
          <p class="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            {{ storeStore.store?.description || 'Tienda virtual con catálogo interactivo y pedidos rápidos por WhatsApp.' }}
          </p>
        </div>

        <!-- Contact & Location -->
        <div class="space-y-3 text-xs sm:text-sm">
          <h4 class="text-white font-semibold uppercase tracking-wider text-xs">Información</h4>
          <ul class="space-y-2 text-slate-400">
            <li>
              <router-link
                :to="`/tienda/${storeStore.store?.slug || 'ss-boutique'}/nosotros`"
                class="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                <span>Conoce nuestra historia (Quiénes Somos) &rarr;</span>
              </router-link>
            </li>
            <li v-if="storeStore.store?.address" class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-brand-400 shrink-0" />
              <span>{{ storeStore.store.address }}<span v-if="storeStore.store?.city">, {{ storeStore.store.city }}</span></span>
            </li>
            <li v-if="storeStore.store?.business_hours" class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-brand-400 shrink-0" />
              <span>{{ storeStore.store.business_hours }}</span>
            </li>
            <li v-if="storeStore.store?.whatsapp_number" class="flex items-center gap-2">
              <MessageCircle class="w-4 h-4 text-brand-400 shrink-0" />
              <span>WhatsApp: +{{ storeStore.store.whatsapp_number }}</span>
            </li>
          </ul>
        </div>

        <!-- Quick Order & Social -->
        <div class="space-y-3">
          <h4 class="text-white font-semibold uppercase tracking-wider text-xs">Atención & Redes</h4>
          <p class="text-xs text-slate-400">
            ¿Tienes dudas o necesitas atención personalizada? Escríbenos directamente:
          </p>
          <div class="flex items-center gap-3 pt-1">
            <button
              type="button"
              @click="openWhatsApp"
              class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <MessageCircle class="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </button>
          </div>

          <!-- Social Icons -->
          <div class="flex items-center gap-3 pt-2 text-slate-400">
            <a
              v-if="storeStore.store?.instagram_url"
              :href="storeStore.store.instagram_url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Instagram de la tienda"
            >
              <Instagram class="w-4 h-4" />
            </a>
            <a
              v-if="storeStore.store?.facebook_url"
              :href="storeStore.store.facebook_url"
              target="_blank"
              rel="noopener noreferrer"
              class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Facebook de la tienda"
            >
              <Facebook class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar & Developer Credits (Discreet Owner Access) -->
      <div class="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          © {{ new Date().getFullYear() }} {{ storeStore.store?.name }}. Todos los derechos reservados.
        </div>
        <div class="flex items-center gap-3 font-medium text-slate-400">
          <span>{{ developerCredit }}</span>
          <!-- Discreet Admin Lock icon for store owner -->
          <router-link
            to="/admin"
            class="text-slate-600 hover:text-slate-400 transition-colors p-1"
            title="Gestión interna"
            aria-label="Gestión interna"
          >
            🔒
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>
