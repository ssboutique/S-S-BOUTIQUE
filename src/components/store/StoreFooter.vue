<script setup lang="ts">
import { computed } from 'vue';
import { useStoreStore } from '@/stores/store';
import { MessageCircle, MapPin, Clock, Instagram, Facebook } from 'lucide-vue-next';

const storeStore = useStoreStore();

const developerCredit = computed(() =>
  import.meta.env.VITE_DEVELOPER_CREDIT || 'Desarrollado por Edisson Pinza'
);

function openWhatsApp() {
  if (storeStore.store?.whatsapp_number) {
    const cleanPhone = storeStore.store.whatsapp_number.replace(/\D/g, '');
    const phone = cleanPhone.length === 10 && cleanPhone.startsWith('3') ? `57${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phone}?text=Hola!%20Tengo%20una%20pregunta%20sobre%20su%20tienda.`, '_blank');
  }
}
</script>

<template>
  <footer class="sf-root" role="contentinfo">

    <!-- IG accent line -->
    <div class="sf-accent" aria-hidden="true"></div>

    <!-- Background blobs -->
    <div class="sf-bg" aria-hidden="true">
      <div class="sf-blob sf-blob-l"></div>
      <div class="sf-blob sf-blob-r"></div>
    </div>

    <div class="sf-inner">

      <!-- ── Top grid ── -->
      <div class="sf-grid">

        <!-- Brand column -->
        <div class="sf-col">
          <div class="sf-brand">
            <div v-if="storeStore.store?.logo_url" class="sf-logo-wrap">
              <img
                :src="storeStore.store.logo_url"
                :alt="storeStore.store?.name"
                class="sf-logo-img"
              />
            </div>
            <div v-else class="sf-logo-placeholder">
              {{ storeStore.store?.name?.charAt(0) || 'S' }}
            </div>
            <span class="sf-brand-name">{{ storeStore.store?.name }}</span>
          </div>

          <p class="sf-desc">
            {{ storeStore.store?.description || 'Tienda virtual con catálogo interactivo y pedidos rápidos por WhatsApp.' }}
          </p>

          <!-- Social icons -->
          <div class="sf-social">
            <a
              v-if="storeStore.store?.instagram_url"
              :href="storeStore.store.instagram_url"
              target="_blank"
              rel="noopener noreferrer"
              class="sf-social-btn"
              aria-label="Instagram de la tienda"
            >
              <!-- Instagram SVG -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4.5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              v-if="storeStore.store?.facebook_url"
              :href="storeStore.store.facebook_url"
              target="_blank"
              rel="noopener noreferrer"
              class="sf-social-btn"
              aria-label="Facebook de la tienda"
            >
              <Facebook class="w-4 h-4" />
            </a>
          </div>
        </div>

        <!-- Info column -->
        <div class="sf-col">
          <h4 class="sf-col-title">Información</h4>
          <ul class="sf-list">
            <li>
              <router-link
                :to="`/tienda/${storeStore.store?.slug || 'ss-boutique'}/nosotros`"
                class="sf-link sf-link-accent"
              >
                Quiénes Somos &rarr;
              </router-link>
            </li>
            <li v-if="storeStore.store?.address" class="sf-info-row">
              <MapPin class="sf-info-icon" aria-hidden="true" />
              <span>{{ storeStore.store.address }}<span v-if="storeStore.store?.city">, {{ storeStore.store.city }}</span></span>
            </li>
            <li v-if="storeStore.store?.business_hours" class="sf-info-row">
              <Clock class="sf-info-icon" aria-hidden="true" />
              <span>{{ storeStore.store.business_hours }}</span>
            </li>
            <li v-if="storeStore.store?.whatsapp_number" class="sf-info-row">
              <MessageCircle class="sf-info-icon" aria-hidden="true" />
              <span>+{{ storeStore.store.whatsapp_number }}</span>
            </li>
          </ul>
        </div>

        <!-- Contact column -->
        <div class="sf-col">
          <h4 class="sf-col-title">Atención Directa</h4>
          <p class="sf-contact-desc">
            ¿Dudas o necesitas asesoría personalizada? Escríbenos ahora mismo.
          </p>
          <button
            type="button"
            @click="openWhatsApp"
            class="sf-wa-btn"
            aria-label="Contactar por WhatsApp"
          >
            <!-- WhatsApp SVG -->
            <svg viewBox="0 0 20 20" class="w-4 h-4 shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.2)"/>
              <path d="M14.5 5.5A6.5 6.5 0 0 0 3.5 10a6.4 6.4 0 0 0 .87 3.24L3.5 16.5l3.33-.87A6.5 6.5 0 1 0 14.5 5.5Zm-4.5 10a5.4 5.4 0 0 1-2.76-.76l-.2-.12-2.06.52.54-2-.12-.2A5.38 5.38 0 1 1 10 15.5Zm2.98-4.06c-.16-.08-.96-.47-1.11-.52s-.26-.08-.37.08-.42.52-.51.63-.19.12-.35.04a4.45 4.45 0 0 1-2.22-1.94c-.17-.29.17-.27.48-.9a.3.3 0 0 0-.01-.29c-.04-.08-.37-.89-.5-1.21s-.27-.27-.37-.28h-.31a.6.6 0 0 0-.44.21A1.83 1.83 0 0 0 7.2 8.63a3.18 3.18 0 0 0 .66 1.68 7.28 7.28 0 0 0 2.79 2.46c1.04.35 1.04.24 1.23.22a1.66 1.66 0 0 0 1.1-.78 1.37 1.37 0 0 0 .1-.78c-.04-.06-.15-.1-.32-.17Z" fill="white"/>
            </svg>
            <span>Escribir por WhatsApp</span>
          </button>
        </div>

      </div>

      <!-- ── Bottom bar ── -->
      <div class="sf-bottom">
        <span class="sf-copy">
          © {{ new Date().getFullYear() }} {{ storeStore.store?.name }}. Todos los derechos reservados.
        </span>
        <router-link to="/admin" class="sf-dev">
          {{ developerCredit }}
        </router-link>
      </div>

    </div>
  </footer>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────── */
.sf-root {
  position: relative;
  margin-top: 64px;
  overflow: hidden;
  background: linear-gradient(160deg, #100820 0%, #18062e 50%, #0d0118 100%);
  border-top: 1px solid rgba(255,255,255,.06);
}

/* IG accent line */
.sf-accent {
  height: 2px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4, #405de6);
}

/* Ambient blobs */
.sf-bg { position: absolute; inset: 0; pointer-events: none; }
.sf-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: .3;
}
.sf-blob-l {
  width: 400px; height: 400px;
  top: -80px; left: -80px;
  background: radial-gradient(circle, #833ab4 0%, transparent 70%);
}
.sf-blob-r {
  width: 380px; height: 380px;
  bottom: -60px; right: -60px;
  background: radial-gradient(circle, #ee2a7b 0%, transparent 70%);
}

/* ── Inner container ──────────────────────────────── */
.sf-inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 20px 28px;
}
@media (min-width: 640px)  { .sf-inner { padding: 56px 32px 32px; } }
@media (min-width: 1024px) { .sf-inner { padding: 64px 48px 36px; } }

/* ── Grid ─────────────────────────────────────────── */
.sf-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
  margin-bottom: 48px;
}
@media (min-width: 768px)  { .sf-grid { grid-template-columns: 1.4fr 1fr 1fr; gap: 40px; } }

/* ── Column ───────────────────────────────────────── */
.sf-col { display: flex; flex-direction: column; gap: 14px; }

/* ── Brand ────────────────────────────────────────── */
.sf-brand { display: flex; align-items: center; gap: 12px; }
.sf-logo-wrap {
  width: 40px; height: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  flex-shrink: 0;
}
.sf-logo-img { width: 100%; height: 100%; object-fit: cover; }
.sf-logo-placeholder {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #833ab4, #ee2a7b);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 900; color: #fff;
  flex-shrink: 0;
}
.sf-brand-name {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -.2px;
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sf-desc {
  font-size: 13px;
  color: rgba(255,255,255,.38);
  line-height: 1.65;
  margin: 0;
  max-width: 340px;
}

/* ── Social ───────────────────────────────────────── */
.sf-social { display: flex; gap: 8px; }
.sf-social-btn {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.45);
  display: flex; align-items: center; justify-content: center;
  text-decoration: none;
  transition: background .2s, color .2s, border-color .2s;
}
.sf-social-btn:hover {
  background: rgba(238,42,123,.15);
  border-color: rgba(238,42,123,.3);
  color: #ee2a7b;
}

/* ── Column title ─────────────────────────────────── */
.sf-col-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,.28);
  margin: 0;
}

/* ── List ─────────────────────────────────────────── */
.sf-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }

.sf-link {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,.5);
  text-decoration: none;
  transition: color .2s;
}
.sf-link:hover { color: rgba(255,255,255,.85); }
.sf-link-accent {
  background: linear-gradient(90deg, #ee2a7b, #833ab4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}
.sf-link-accent:hover { opacity: .8; }

.sf-info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: rgba(255,255,255,.42);
  line-height: 1.5;
}
.sf-info-icon {
  width: 14px; height: 14px;
  color: rgba(238,42,123,.7);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Contact column ───────────────────────────────── */
.sf-contact-desc {
  font-size: 13px;
  color: rgba(255,255,255,.38);
  line-height: 1.6;
  margin: 0;
}

.sf-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  border: none;
  cursor: pointer;
  transition: opacity .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 3px 14px rgba(37,211,102,.25);
  width: fit-content;
  position: relative;
  overflow: hidden;
  font-family: inherit;
}
.sf-wa-btn::after {
  content: '';
  position: absolute;
  top: -50%; left: -75%;
  width: 50%; height: 200%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.28) 50%, transparent 60%);
  animation: waSweep 3s ease-in-out infinite;
  pointer-events: none;
}
@keyframes waSweep {
  0%   { left: -75%; opacity: 0; }
  15%  { opacity: 1; }
  50%  { left: 125%; opacity: 1; }
  51%  { opacity: 0; }
  100% { left: 125%; opacity: 0; }
}
.sf-wa-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 5px 20px rgba(37,211,102,.35); }
.sf-wa-btn:active { transform: scale(.97); }

/* ── Bottom bar ───────────────────────────────────── */
.sf-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,.06);
  text-align: center;
}
@media (min-width: 640px) {
  .sf-bottom {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

.sf-copy {
  font-size: 12px;
  color: rgba(255,255,255,.22);
}
.sf-dev {
  font-size: 12px;
  color: rgba(255,255,255,.18);
  text-decoration: none;
  transition: color .2s;
  font-weight: 500;
}
.sf-dev:hover { color: rgba(255,255,255,.45); }
</style>
