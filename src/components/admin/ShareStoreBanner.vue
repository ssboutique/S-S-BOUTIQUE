<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { Copy, Check, ExternalLink, MessageCircle, Globe, ShieldCheck, ArrowUpRight } from 'lucide-vue-next';

const adminStore = useAdminStore();
const copied = ref(false);

const publicUrl       = computed(() => adminStore.publicStoreUrl);
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
    setTimeout(() => { copied.value = false; }, 3000);
  } catch (err) {
    console.error('Failed to copy URL:', err);
  }
}

function shareViaWhatsApp() {
  const storeName = adminStore.currentStore?.name || 'S&S BOUTIQUE';
  const text = `¡Hola! Te invito a conocer nuestra tienda oficial *${storeName}*. Mira nuestras colecciones exclusivas y haz tu pedido en línea aquí: ${publicUrl.value}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
</script>

<template>
  <div class="ssb-root">
    <!-- Header row -->
    <div class="ssb-header">
      <div class="ssb-info">
        <!-- Badge -->
        <span v-if="hasCustomDomain" class="ssb-badge ssb-badge-domain">
          <ShieldCheck class="w-3 h-3" aria-hidden="true" />
          Dominio Propio Activo
        </span>
        <span v-else class="ssb-badge ssb-badge-default">
          <Globe class="w-3 h-3" aria-hidden="true" />
          Enlace Oficial de la Tienda
        </span>

        <h3 class="ssb-title">Comparte tu tienda con tus clientes</h3>
        <p class="ssb-desc">
          Este es el enlace exclusivo para que tus clientes naveguen tu catálogo, vean precios y realicen pedidos por WhatsApp.
        </p>
      </div>

      <button
        type="button"
        @click="shareViaWhatsApp"
        class="ssb-wa-btn"
        title="Compartir por WhatsApp"
      >
        <MessageCircle class="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Enviar a Clientes</span>
      </button>
    </div>

    <!-- URL bar -->
    <div class="ssb-url-bar">
      <div class="ssb-url-text">
        <span class="ssb-url-dot" aria-hidden="true"></span>
        <span class="ssb-url-value">{{ publicUrl }}</span>
      </div>
      <button
        type="button"
        @click="copyToClipboard"
        class="ssb-copy-btn"
        :class="{ 'ssb-copy-copied': copied }"
        aria-label="Copiar enlace de la tienda"
      >
        <Check v-if="copied" class="w-4 h-4" aria-hidden="true" />
        <Copy v-else class="w-4 h-4" aria-hidden="true" />
        <span>{{ copied ? '¡Copiado!' : 'Copiar' }}</span>
      </button>
    </div>

    <!-- Footer row -->
    <div class="ssb-footer">
      <div v-if="hasCustomDomain" class="ssb-domain-info">
        <span>Los clientes ingresan mediante:</span>
        <strong class="ssb-domain-name">{{ customDomainName }}</strong>
      </div>
      <div v-else class="ssb-domain-info">
        <span>¿Tienes un dominio propio?</span>
        <router-link to="/admin/store-info#domain" class="ssb-domain-link">
          Vincular dominio
          <ArrowUpRight class="w-3 h-3" aria-hidden="true" />
        </router-link>
      </div>

      <router-link
        v-if="hasCustomDomain"
        to="/admin/store-info#domain"
        class="ssb-change-link"
      >
        Cambiar dominio
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ── */
.ssb-root {
  background: var(--ad-surface);
  border: 1px solid var(--ad-border);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 640px) { .ssb-root { padding: 24px; } }

/* ── Header ── */
.ssb-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 768px) {
  .ssb-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
}

.ssb-info { display: flex; flex-direction: column; gap: 6px; }

/* Badges */
.ssb-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .4px;
  text-transform: uppercase;
  width: fit-content;
}
.ssb-badge-domain {
  background: rgba(16,185,129,.1);
  border: 1px solid rgba(16,185,129,.22);
  color: #059669;
}
html.dark .ssb-badge-domain { color: #34d399; background: rgba(52,211,153,.1); border-color: rgba(52,211,153,.2); }
.ssb-badge-default {
  background: var(--ad-surface-2);
  border: 1px solid var(--ad-border);
  color: var(--ad-text-3);
}

.ssb-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--ad-text);
  margin: 0;
  line-height: 1.3;
}
.ssb-desc {
  font-size: 12px;
  color: var(--ad-text-3);
  margin: 0;
  max-width: 460px;
  line-height: 1.55;
}

/* WA button */
.ssb-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #25d366, #128c7e);
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity .2s, transform .15s;
  box-shadow: 0 2px 12px rgba(37,211,102,.25);
  font-family: inherit;
  align-self: flex-start;
}
.ssb-wa-btn:hover { opacity: .9; transform: translateY(-1px); }
.ssb-wa-btn:active { transform: scale(.97); }

/* ── URL bar ── */
.ssb-url-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ad-surface-2);
  border: 1px solid var(--ad-border);
  border-radius: 14px;
  padding: 4px 4px 4px 14px;
}

.ssb-url-text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.ssb-url-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #25d366, #128c7e);
  flex-shrink: 0;
}
.ssb-url-value {
  font-size: 12px;
  font-family: monospace;
  font-weight: 600;
  color: var(--ad-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: all;
}

.ssb-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background .18s, color .18s;
  font-family: inherit;
  background: var(--ad-surface-3);
  color: var(--ad-text-2);
  border: 1px solid var(--ad-border);
}
.ssb-copy-btn:hover { background: var(--ad-surface); color: var(--ad-text); }
.ssb-copy-copied {
  background: rgba(16,185,129,.12) !important;
  border-color: rgba(16,185,129,.25) !important;
  color: #059669 !important;
}
html.dark .ssb-copy-copied { color: #34d399 !important; }

/* ── Footer ── */
.ssb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--ad-divider);
  flex-wrap: wrap;
}

.ssb-domain-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ad-text-3);
  flex-wrap: wrap;
}
.ssb-domain-name {
  font-family: monospace;
  font-weight: 700;
  color: var(--ad-text-2);
}
.ssb-domain-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
  font-size: 11px;
  color: #833ab4;
  text-decoration: none;
  transition: color .2s;
}
html.dark .ssb-domain-link { color: #c084fc; }
.ssb-domain-link:hover { text-decoration: underline; }
.ssb-change-link {
  font-size: 11px;
  font-weight: 600;
  color: var(--ad-text-3);
  text-decoration: none;
  transition: color .2s;
}
.ssb-change-link:hover { color: var(--ad-text-2); }
</style>
