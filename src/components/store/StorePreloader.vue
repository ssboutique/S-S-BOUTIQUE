<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  isLoaded: boolean;
  storeName?: string;
  logoUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'finished'): void;
}>();

const progress = ref(0);
const isHidden = ref(false);
const isClosing = ref(false);
const phase = ref<'enter' | 'idle' | 'exit'>('enter');

let progressInterval: any = null;
let watchdogTimeout: any = null;

// 18 bubbles with deterministic variation
const bubbles = Array.from({ length: 18 }, (_, i) => {
  const sizes   = [14, 22, 10, 32, 18, 8, 26, 12, 38, 16, 20, 9, 28, 24, 11, 34, 15, 19];
  const lefts   = [4, 11, 19, 27, 35, 43, 51, 59, 67, 73, 80, 87, 92, 6, 23, 46, 63, 78];
  const delays  = [0, 0.7, 1.4, 0.3, 2.1, 1.8, 0.5, 2.8, 1.1, 3.2, 0.9, 2.4, 1.6, 3.8, 0.2, 2.6, 1.3, 3.5];
  const durs    = [7, 9, 6, 11, 8, 7.5, 10, 6.5, 12, 8.5, 9.5, 7, 11.5, 8, 6.8, 10.5, 9, 7.8];
  return { id: i, size: sizes[i], left: lefts[i], delay: delays[i], dur: durs[i] };
});

function finishPreloader() {
  if (isHidden.value) return;
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
  progress.value = 100;
  phase.value = 'exit';
  setTimeout(() => {
    isHidden.value = true;
    emit('finished');
  }, 800);
}

function startProgress() {
  if (props.isLoaded) { finishPreloader(); return; }
  phase.value = 'idle';
  watchdogTimeout = setTimeout(finishPreloader, 6000);
  progressInterval = setInterval(() => {
    if (!props.isLoaded) {
      if (progress.value < 82) progress.value = Math.min(82, progress.value + 7);
    } else {
      finishPreloader();
    }
  }, 55);
}

watch(() => props.isLoaded, (v) => { if (v) finishPreloader(); }, { immediate: true });
onMounted(() => { if (props.isLoaded) finishPreloader(); else startProgress(); });
onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
});
</script>

<template>
  <div
    v-if="!isHidden"
    class="pl-root"
    :class="{ 'pl-exit': phase === 'exit' }"
    role="status"
    aria-live="polite"
    aria-label="Cargando tienda"
  >
    <!-- ═══ BACKGROUND ═══ -->
    <div class="pl-bg" aria-hidden="true">
      <!-- Deep base -->
      <div class="pl-bg-base"></div>
      <!-- IG colour blobs -->
      <div class="pl-blob pl-blob-1"></div>
      <div class="pl-blob pl-blob-2"></div>
      <div class="pl-blob pl-blob-3"></div>
      <div class="pl-blob pl-blob-4"></div>
      <!-- Fine grid overlay -->
      <div class="pl-grid"></div>
      <!-- Vignette -->
      <div class="pl-vignette"></div>
    </div>

    <!-- ═══ BUBBLES ═══ -->
    <div class="pl-bubbles" aria-hidden="true">
      <div
        v-for="b in bubbles"
        :key="b.id"
        class="pl-bubble"
        :style="{
          width:  b.size + 'px',
          height: b.size + 'px',
          left:   b.left + '%',
          animationDelay:    b.delay + 's',
          animationDuration: b.dur   + 's',
        }"
      ></div>
    </div>

    <!-- ═══ CENTRE STAGE ═══ -->
    <div class="pl-stage">

      <!-- ── Logo ring ── -->
      <div class="pl-ring-host" aria-hidden="true">
        <!-- Outer spinning dashed ring -->
        <div class="pl-ring-outer"></div>
        <!-- IG arc SVG -->
        <svg class="pl-ring-svg" viewBox="0 0 140 140" fill="none">
          <defs>
            <linearGradient id="ig1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#f9ce34"/>
              <stop offset="30%"  stop-color="#ee2a7b"/>
              <stop offset="65%"  stop-color="#833ab4"/>
              <stop offset="100%" stop-color="#405de6"/>
            </linearGradient>
          </defs>
          <circle
            cx="70" cy="70" r="62"
            stroke="url(#ig1)"
            stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray="390"
            stroke-dashoffset="390"
            class="pl-arc"
          />
        </svg>
        <!-- Logo / monogram -->
        <div class="pl-logo-inner">
          <img v-if="logoUrl" :src="logoUrl" :alt="storeName || 'Tienda'" class="pl-logo-img" />
          <span v-else class="pl-monogram">
            {{ storeName ? storeName.slice(0, 2).toUpperCase() : 'SS' }}
          </span>
        </div>
        <!-- Live dot -->
        <span class="pl-live-dot" aria-hidden="true">
          <span class="pl-live-ping"></span>
        </span>
      </div>

      <!-- ── Store name ── -->
      <h1 class="pl-name">{{ storeName || 'S&S BOUTIQUE' }}</h1>
      <p class="pl-tagline">Alta Moda &nbsp;·&nbsp; Calzado &nbsp;·&nbsp; Accesorios de Lujo</p>

      <!-- ── Shopping scene ── -->
      <div class="pl-scene" aria-label="Dos compradores realizando un pedido">

        <!-- Person A -->
        <div class="pl-person pl-person-a">
          <!-- Body SVG -->
          <svg viewBox="0 0 56 90" class="pl-person-svg" aria-hidden="true">
            <!-- head -->
            <ellipse cx="28" cy="16" rx="12" ry="13" fill="#F4C2A0"/>
            <!-- hair -->
            <path d="M16 14 Q17 4 28 3 Q39 4 40 14 Q36 8 28 8 Q20 8 16 14Z" fill="#4A2C10"/>
            <!-- neck -->
            <rect x="24" y="27" width="8" height="6" rx="2" fill="#F4C2A0"/>
            <!-- dress torso -->
            <path d="M14 33 Q16 29 28 29 Q40 29 42 33 L44 58 Q42 62 28 62 Q14 62 12 58Z" fill="url(#dressA)"/>
            <!-- collar accent -->
            <path d="M22 33 L28 40 L34 33" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
            <!-- left arm -->
            <path d="M14 35 Q6 42 7 54" stroke="#F4C2A0" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- right arm holding bag -->
            <path d="M42 35 Q50 42 49 54" stroke="#F4C2A0" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- legs -->
            <path d="M22 62 L20 88" stroke="#2D1B5E" stroke-width="6" stroke-linecap="round" fill="none"/>
            <path d="M34 62 L36 88" stroke="#2D1B5E" stroke-width="6" stroke-linecap="round" fill="none"/>
            <!-- shoes -->
            <ellipse cx="19" cy="88" rx="6" ry="3" fill="#1a0533"/>
            <ellipse cx="37" cy="88" rx="6" ry="3" fill="#1a0533"/>
            <defs>
              <linearGradient id="dressA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ee2a7b"/>
                <stop offset="100%" stop-color="#833ab4"/>
              </linearGradient>
            </defs>
          </svg>
          <!-- Shopping bag -->
          <div class="pl-bag pl-bag-a">
            <svg viewBox="0 0 38 44" fill="none" aria-hidden="true">
              <rect x="2" y="12" width="34" height="30" rx="5" fill="url(#bagGradA)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <path d="M12 12 Q12 5 19 5 Q26 5 26 12" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" fill="none"/>
              <path d="M10 22 Q19 28 28 22" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linecap="round" fill="none"/>
              <defs>
                <linearGradient id="bagGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f9ce34"/>
                  <stop offset="100%" stop-color="#ee2a7b"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="pl-person-label">Compradora</span>
        </div>

        <!-- Phone + WA notification -->
        <div class="pl-phone-col">
          <div class="pl-phone">
            <!-- Screen -->
            <div class="pl-screen">
              <div class="pl-chat-row pl-chat-in">
                <div class="pl-chat-bubble pl-chat-a">
                  <svg viewBox="0 0 10 10" width="8" height="8" fill="none" aria-hidden="true">
                    <path d="M1 9 L3 7 H9 V1 H1 Z" fill="#ee2a7b" rx="1"/>
                  </svg>
                  <span>Hola, quiero este</span>
                </div>
              </div>
              <div class="pl-chat-row pl-chat-out">
                <div class="pl-chat-bubble pl-chat-b">
                  <span>Pedido recibido</span>
                  <svg viewBox="0 0 16 10" width="12" height="8" fill="none" aria-hidden="true">
                    <path d="M1 5 L5 9 L15 1" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 5 L10 9" stroke="#25D366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <!-- WA bottom bar -->
            <div class="pl-phone-bottom">
              <!-- WhatsApp SVG logo hand-drawn -->
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <circle cx="10" cy="10" r="9.5" fill="#25D366"/>
                <path d="M14.5 5.5A6.5 6.5 0 0 0 3.5 10a6.4 6.4 0 0 0 .87 3.24L3.5 16.5l3.33-.87A6.5 6.5 0 1 0 14.5 5.5Zm-4.5 10a5.4 5.4 0 0 1-2.76-.76l-.2-.12-2.06.52.54-2-.12-.2A5.38 5.38 0 1 1 10 15.5Zm2.98-4.06c-.16-.08-.96-.47-1.11-.52s-.26-.08-.37.08-.42.52-.51.63-.19.12-.35.04a4.45 4.45 0 0 1-2.22-1.94c-.17-.29.17-.27.48-.9a.3.3 0 0 0-.01-.29c-.04-.08-.37-.89-.5-1.21s-.27-.27-.37-.28h-.31a.6.6 0 0 0-.44.21A1.83 1.83 0 0 0 7.2 8.63a3.18 3.18 0 0 0 .66 1.68 7.28 7.28 0 0 0 2.79 2.46c1.04.35 1.04.24 1.23.22a1.66 1.66 0 0 0 1.1-.78 1.37 1.37 0 0 0 .1-.78c-.04-.06-.15-.1-.32-.17Z" fill="#fff"/>
              </svg>
              <span>WhatsApp</span>
            </div>
          </div>
          <!-- Notification toast -->
          <div class="pl-toast">
            <div class="pl-toast-dot"></div>
            <span>Notificación enviada</span>
          </div>
        </div>

        <!-- Person B -->
        <div class="pl-person pl-person-b">
          <svg viewBox="0 0 56 90" class="pl-person-svg" aria-hidden="true">
            <!-- head -->
            <ellipse cx="28" cy="16" rx="12" ry="13" fill="#D4A574"/>
            <!-- hair -->
            <path d="M16 16 Q17 5 28 4 Q39 5 40 16 Q38 10 28 10 Q18 10 16 16Z" fill="#1a0a00"/>
            <!-- neck -->
            <rect x="24" y="27" width="8" height="6" rx="2" fill="#D4A574"/>
            <!-- shirt -->
            <path d="M14 33 Q16 29 28 29 Q40 29 42 33 L44 58 Q42 62 28 62 Q14 62 12 58Z" fill="url(#shirtB)"/>
            <!-- collar -->
            <path d="M22 33 L26 38 L28 34 L30 38 L34 33" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <!-- arms -->
            <path d="M14 35 Q6 42 8 54" stroke="#D4A574" stroke-width="7" stroke-linecap="round" fill="none"/>
            <path d="M42 35 Q50 42 48 54" stroke="#D4A574" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- trousers -->
            <path d="M22 62 L21 88" stroke="#1e293b" stroke-width="7" stroke-linecap="round" fill="none"/>
            <path d="M34 62 L35 88" stroke="#1e293b" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- shoes -->
            <ellipse cx="20" cy="88" rx="6" ry="3" fill="#0f172a"/>
            <ellipse cx="36" cy="88" rx="6" ry="3" fill="#0f172a"/>
            <defs>
              <linearGradient id="shirtB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#405de6"/>
                <stop offset="100%" stop-color="#5851d8"/>
              </linearGradient>
            </defs>
          </svg>
          <!-- Shopping bag left side -->
          <div class="pl-bag pl-bag-b">
            <svg viewBox="0 0 38 44" fill="none" aria-hidden="true">
              <rect x="2" y="12" width="34" height="30" rx="5" fill="url(#bagGradB)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <path d="M12 12 Q12 5 19 5 Q26 5 26 12" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round" fill="none"/>
              <path d="M10 22 Q19 28 28 22" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-linecap="round" fill="none"/>
              <defs>
                <linearGradient id="bagGradB" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#833ab4"/>
                  <stop offset="100%" stop-color="#405de6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="pl-person-label">Comprador</span>
        </div>

      </div><!-- /scene -->

      <!-- ── Progress ── -->
      <div class="pl-progress-wrap">
        <div class="pl-progress-track">
          <div class="pl-progress-fill" :style="{ width: progress + '%' }">
            <div class="pl-progress-beam"></div>
          </div>
        </div>
        <span class="pl-progress-num">{{ Math.floor(progress) }}<span class="pl-progress-unit">%</span></span>
      </div>

      <p class="pl-status-text">Preparando tu experiencia de compra</p>

    </div><!-- /stage -->
  </div>
</template>

<style scoped>
/* ─── ROOT ──────────────────────────────────────── */
.pl-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity .8s cubic-bezier(.4,0,.2,1),
              transform .8s cubic-bezier(.4,0,.2,1),
              filter .8s cubic-bezier(.4,0,.2,1);
}
.pl-exit {
  opacity: 0;
  transform: scale(1.04);
  filter: blur(12px);
  pointer-events: none;
}

/* ─── BACKGROUND ─────────────────────────────────── */
.pl-bg { position: absolute; inset: 0; z-index: 0; }

.pl-bg-base {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #0d0118 0%, #1a0435 35%, #2a0850 65%, #0d0118 100%);
}

.pl-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform, opacity;
}
.pl-blob-1 {
  width: 480px; height: 480px;
  top: -120px; left: -100px;
  background: radial-gradient(circle, rgba(131,58,180,.55) 0%, transparent 70%);
  animation: blobDrift 14s ease-in-out infinite alternate;
}
.pl-blob-2 {
  width: 520px; height: 520px;
  bottom: -140px; right: -100px;
  background: radial-gradient(circle, rgba(238,42,123,.5) 0%, transparent 70%);
  animation: blobDrift 18s ease-in-out infinite alternate-reverse;
}
.pl-blob-3 {
  width: 360px; height: 360px;
  top: 30%; left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(64,93,230,.4) 0%, transparent 70%);
  animation: blobDrift 12s ease-in-out infinite alternate;
}
.pl-blob-4 {
  width: 300px; height: 300px;
  bottom: 10%; left: 10%;
  background: radial-gradient(circle, rgba(249,206,52,.3) 0%, transparent 70%);
  animation: blobDrift 16s ease-in-out infinite alternate-reverse;
}
@keyframes blobDrift {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(30px, 20px) scale(1.08); }
}

.pl-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 48px 48px;
}

.pl-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.6) 100%);
}

/* ─── BUBBLES ────────────────────────────────────── */
.pl-bubbles {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
}
.pl-bubble {
  position: absolute;
  bottom: -60px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(249,206,52,.22) 0%,
    rgba(238,42,123,.28) 40%,
    rgba(131,58,180,.22) 70%,
    rgba(64,93,230,.18) 100%
  );
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(3px);
  animation: bubbleRise linear infinite;
  will-change: transform, opacity;
}
@keyframes bubbleRise {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: .55; }
  50%  { transform: translateY(-50vh) translateX(12px) scale(.92); }
  100% { transform: translateY(-108vh) translateX(-8px) scale(.78); opacity: 0; }
}

/* ─── STAGE ──────────────────────────────────────── */
.pl-stage {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
  padding: 0 24px;
  animation: stageIn .7s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes stageIn {
  from { opacity: 0; transform: translateY(24px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ─── LOGO RING ──────────────────────────────────── */
.pl-ring-host {
  position: relative;
  width: 118px; height: 118px;
  margin-bottom: 20px;
}
.pl-ring-outer {
  position: absolute; inset: -8px;
  border-radius: 50%;
  border: 1px dashed rgba(255,255,255,.12);
  animation: spin 20s linear infinite;
}
.pl-ring-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}
.pl-arc {
  transform-origin: 70px 70px;
  transform: rotate(-90deg);
  animation: arcFill 1.8s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes arcFill {
  to { stroke-dashoffset: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.pl-logo-inner {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: linear-gradient(145deg, #16052e, #2a0850);
  border: 1.5px solid rgba(255,255,255,.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 2px 16px rgba(0,0,0,.5);
}
.pl-logo-img {
  width: 100%; height: 100%;
  object-fit: cover;
  padding: 8px;
  border-radius: 50%;
}
.pl-monogram {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pl-live-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 12px; height: 12px;
  display: flex; align-items: center; justify-content: center;
}
.pl-live-dot::after {
  content: '';
  display: block;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #25d366;
  border: 2px solid #0d0118;
  position: relative; z-index: 1;
}
.pl-live-ping {
  position: absolute; inset: 0;
  border-radius: 50%;
  background: #25d366;
  opacity: .5;
  animation: livePing 1.6s ease-out infinite;
}
@keyframes livePing {
  0%   { transform: scale(1); opacity: .5; }
  100% { transform: scale(2.4); opacity: 0; }
}

/* ─── STORE NAME ─────────────────────────────────── */
.pl-name {
  font-size: clamp(22px, 5vw, 30px);
  font-weight: 900;
  letter-spacing: -0.5px;
  line-height: 1;
  margin: 0 0 6px;
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 45%, #833ab4 80%, #405de6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}
.pl-tagline {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.38);
  margin: 0 0 26px;
  text-align: center;
}

/* ─── SCENE ──────────────────────────────────────── */
.pl-scene {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
  margin-bottom: 24px;
  width: 100%;
}

/* ── Persons ── */
.pl-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  flex-shrink: 0;
}
.pl-person-a { animation: bobA 2.6s ease-in-out infinite; }
.pl-person-b { animation: bobB 3s ease-in-out infinite .5s; }
@keyframes bobA {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes bobB {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
}

.pl-person-svg {
  width: 64px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,.45));
}

.pl-bag {
  position: absolute;
  width: 30px;
}
.pl-bag-a {
  right: -18px;
  bottom: 24px;
  animation: bagSwingA 2.6s ease-in-out infinite;
}
.pl-bag-b {
  left: -18px;
  bottom: 24px;
  animation: bagSwingB 3s ease-in-out infinite .5s;
}
@keyframes bagSwingA {
  0%,100% { transform: rotate(-4deg); }
  50%      { transform: rotate(4deg); }
}
@keyframes bagSwingB {
  0%,100% { transform: rotate(4deg); }
  50%      { transform: rotate(-4deg); }
}

.pl-person-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,.3);
  margin-top: 4px;
}

/* ── Phone column ── */
.pl-phone-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pl-phone {
  width: 58px;
  height: 100px;
  background: linear-gradient(160deg, #18103a, #0d0720);
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,.13);
  box-shadow:
    0 0 0 1px rgba(131,58,180,.3),
    0 12px 40px rgba(0,0,0,.6),
    inset 0 1px 0 rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.pl-screen {
  flex: 1;
  background: #0a0618;
  margin: 4px 4px 2px;
  border-radius: 8px 8px 4px 4px;
  padding: 4px 3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.pl-chat-row { display: flex; }
.pl-chat-in  { justify-content: flex-start; }
.pl-chat-out { justify-content: flex-end; }

.pl-chat-bubble {
  font-size: 6.5px;
  font-weight: 600;
  color: #fff;
  padding: 3px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  max-width: 44px;
  line-height: 1.3;
}
.pl-chat-a {
  background: rgba(131,58,180,.7);
  border-radius: 0 6px 6px 6px;
  animation: chatSlideIn .5s cubic-bezier(.34,1.56,.64,1) .8s both;
}
.pl-chat-b {
  background: rgba(37,211,102,.25);
  border: 1px solid rgba(37,211,102,.4);
  border-radius: 6px 0 6px 6px;
  animation: chatSlideIn .5s cubic-bezier(.34,1.56,.64,1) 1.6s both;
}
@keyframes chatSlideIn {
  from { opacity: 0; transform: scale(.6) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.pl-phone-bottom {
  height: 22px;
  background: linear-gradient(135deg, rgba(37,211,102,.15), rgba(37,211,102,.08));
  border-top: 1px solid rgba(37,211,102,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 7px;
  font-weight: 700;
  color: rgba(37,211,102,.85);
  letter-spacing: .8px;
  text-transform: uppercase;
}

/* ── Toast notification ── */
.pl-toast {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10,6,24,.85);
  border: 1px solid rgba(37,211,102,.3);
  border-radius: 10px;
  padding: 5px 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,.4), 0 0 0 1px rgba(37,211,102,.1);
  backdrop-filter: blur(12px);
  animation: toastIn .5s cubic-bezier(.34,1.56,.64,1) 2.2s both;
  white-space: nowrap;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(10px) scale(.85); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.pl-toast-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #25d366;
  box-shadow: 0 0 6px rgba(37,211,102,.7);
  animation: dotPulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes dotPulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: .5; transform: scale(1.3); }
}
.pl-toast span {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255,255,255,.75);
  letter-spacing: .6px;
  text-transform: uppercase;
}

/* ─── PROGRESS ───────────────────────────────────── */
.pl-progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 340px;
  margin-bottom: 10px;
}
.pl-progress-track {
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,.08);
  border-radius: 99px;
  overflow: hidden;
}
.pl-progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 35%, #833ab4 70%, #405de6 100%);
  transition: width .12s ease-out;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 8px rgba(238,42,123,.6);
}
.pl-progress-beam {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
  animation: beam 1.6s ease-in-out infinite;
}
@keyframes beam {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
.pl-progress-num {
  font-size: 13px;
  font-weight: 800;
  color: rgba(255,255,255,.55);
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.pl-progress-unit {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255,255,255,.3);
}

.pl-status-text {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,.22);
  text-align: center;
  margin: 0;
}
</style>
