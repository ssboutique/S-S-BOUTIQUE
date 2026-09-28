<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { Share2, Copy, Check, ExternalLink, MessageCircle, Globe } from 'lucide-vue-next';

const adminStore = useAdminStore();
const copied = ref(false);

const fullPublicUrl = computed(() => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const slug = adminStore.currentStore?.slug || 'ss-boutique';
    return `${origin}/tienda/${slug}`;
  }
  return `http://localhost:5173/tienda/${adminStore.currentStore?.slug || 'ss-boutique'}`;
});

async function copyToClipboard() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullPublicUrl.value);
    } else {
      // Fallback
      const input = document.createElement('input');
      input.value = fullPublicUrl.value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 3000);
  } catch (err) {
    console.error('Failed to copy URL:', err);
  }
}

function shareViaWhatsApp() {
  const storeName = adminStore.currentStore?.name || 'S&S BOUTIQUE';
  const text = `¡Hola! Te invito a conocer el catálogo digital oficial de ${storeName}. Mira nuestros productos y haz tu pedido directamente: ${fullPublicUrl.value}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
</script>

<template>
  <div class="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-slate-800 shadow-xl space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <Globe class="w-3.5 h-3.5 text-slate-300" />
          <span>Enlace Público de tu Tienda</span>
        </div>
        <h3 class="text-base sm:text-lg font-bold text-white">
          Comparte tu catálogo con tus clientes
        </h3>
        <p class="text-xs text-slate-400 max-w-xl">
          Copia y pega este enlace en tu biografía de Instagram, estados de WhatsApp, Facebook o envíaselo directamente a tus clientes.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <button
          type="button"
          @click="shareViaWhatsApp"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Enviar por WhatsApp</span>
        </button>

        <a
          :href="fullPublicUrl"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition-all shadow-sm"
        >
          <span>Abrir Tienda</span>
          <ExternalLink class="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </div>

    <!-- URL Bar & One-Click Copy -->
    <div class="flex items-center bg-slate-950/80 rounded-2xl p-1.5 border border-slate-800/80">
      <div class="px-3 py-2 text-xs font-mono text-slate-300 truncate select-all flex-1">
        {{ fullPublicUrl }}
      </div>

      <button
        type="button"
        @click="copyToClipboard"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
        :class="
          copied
            ? 'bg-emerald-600 text-white shadow-glow'
            : 'bg-white hover:bg-slate-100 text-slate-900 shadow-sm'
        "
        aria-label="Copiar enlace de la tienda"
      >
        <Check v-if="copied" class="w-4 h-4" />
        <Copy v-else class="w-4 h-4" />
        <span>{{ copied ? '¡Enlace Copiado!' : 'Copiar Enlace' }}</span>
      </button>
    </div>
  </div>
</template>
