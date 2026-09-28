<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { Copy, Check, ExternalLink, MessageCircle, Globe, ShieldCheck, ArrowUpRight } from 'lucide-vue-next';

const adminStore = useAdminStore();
const copied = ref(false);

const publicUrl = computed(() => adminStore.publicStoreUrl);
const hasCustomDomain = computed(() => adminStore.hasCustomDomain);
const customDomainName = computed(() => adminStore.cleanCustomDomain);

async function copyToClipboard() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(publicUrl.value);
    } else {
      const input = document.createElement('input');
      input.value = publicUrl.value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    copied.value = true;
    adminStore.setFeedback('success', '¡Enlace de la tienda copiado al portapapeles!');
    setTimeout(() => {
      copied.value = false;
    }, 3000);
  } catch (err) {
    console.error('Failed to copy URL:', err);
  }
}

function shareViaWhatsApp() {
  const storeName = adminStore.currentStore?.name || 'S&S BOUTIQUE';
  const text = `¡Hola! Te invito a conocer nuestra tienda oficial *${storeName}*. Mira nuestras colecciones exclusivas y haz tu pedido en línea aquí: ${publicUrl.value}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
</script>

<template>
  <div class="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-3xl p-5 sm:p-6 text-white border border-slate-800 shadow-xl space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <div
            v-if="hasCustomDomain"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <ShieldCheck class="w-3 h-3 text-emerald-400" />
            <span>Dominio Propio Activo</span>
          </div>
          <div
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider"
          >
            <Globe class="w-3 h-3 text-brand-400" />
            <span>Enlace Oficial de la Tienda</span>
          </div>
        </div>

        <h3 class="text-base sm:text-lg font-extrabold text-white">
          Comparte tu tienda con tus clientes
        </h3>
        <p class="text-xs text-slate-400 max-w-xl">
          Este es el enlace exclusivo para que tus clientes naveguen tu catálogo, vean precios y realicen pedidos por WhatsApp.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          @click="shareViaWhatsApp"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
          title="Compartir enlace con tus clientes por WhatsApp"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Enviar a Clientes (WhatsApp)</span>
        </button>
      </div>
    </div>

    <!-- URL Bar & Action Copy -->
    <div class="flex items-center bg-slate-950/90 rounded-2xl p-1.5 border border-slate-800">
      <div class="px-3.5 py-2 text-xs font-mono text-slate-200 truncate select-all flex-1 flex items-center gap-2">
        <span class="text-emerald-400 font-semibold select-none">🌐</span>
        <span class="truncate">{{ publicUrl }}</span>
      </div>

      <button
        type="button"
        @click="copyToClipboard"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
        :class="
          copied
            ? 'bg-emerald-600 text-white shadow-glow'
            : 'bg-white hover:bg-slate-100 text-slate-950 shadow-sm'
        "
        aria-label="Copiar enlace de la tienda"
      >
        <Check v-if="copied" class="w-4 h-4" />
        <Copy v-else class="w-4 h-4" />
        <span>{{ copied ? '¡Enlace Copiado!' : 'Copiar Enlace' }}</span>
      </button>
    </div>

    <!-- Domain Settings Shortcut / Notice -->
    <div class="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
      <div v-if="hasCustomDomain" class="flex items-center gap-1.5 text-emerald-400 font-medium">
        <span>Los clientes ingresan directamente mediante:</span>
        <strong class="font-mono text-white">{{ customDomainName }}</strong>
      </div>
      <div v-else class="flex items-center gap-1.5">
        <span>¿Compraste tu propio dominio (ej: mitienda.com)?</span>
        <router-link
          to="/admin/store-info#domain"
          class="text-brand-400 hover:text-brand-300 font-bold hover:underline inline-flex items-center gap-0.5"
        >
          <span>Vincular Dominio Propio</span>
          <ArrowUpRight class="w-3 h-3" />
        </router-link>
      </div>

      <router-link
        v-if="hasCustomDomain"
        to="/admin/store-info#domain"
        class="text-slate-400 hover:text-white font-medium hover:underline text-[11px]"
      >
        Cambiar dominio
      </router-link>
    </div>
  </div>
</template>
