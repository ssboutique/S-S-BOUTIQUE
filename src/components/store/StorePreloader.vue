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
const notifVisible = ref(false);
const notifText = ref('¡Pedido enviado por WhatsApp! 🛍️');

let progressInterval: any = null;
let watchdogTimeout: any = null;
let notifTimeout: any = null;

// Bubble pool
const bubbles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: 18 + Math.random() * 44,
  left: Math.random() * 96,
  delay: Math.random() * 5,
  duration: 5 + Math.random() * 6,
  opacity: 0.18 + Math.random() * 0.32,
}));

function finishPreloader() {
  if (isHidden.value) return;
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
  if (notifTimeout) clearTimeout(notifTimeout);
  progress.value = 100;
  isClosing.value = true;
  setTimeout(() => {
    isHidden.value = true;
    emit('finished');
  }, 650);
}

function startSimulatedProgress() {
  if (props.isLoaded) { finishPreloader(); return; }

  watchdogTimeout = setTimeout(() => { finishPreloader(); }, 5000);

  progressInterval = setInterval(() => {
    if (!props.isLoaded) {
      if (progress.value < 85) {
        progress.value = Math.min(85, progress.value + 8);
      }
    } else {
      finishPreloader();
    }
  }, 60);

  // Show WhatsApp notification bubble after 1.2s
  notifTimeout = setTimeout(() => {
    notifVisible.value = true;
  }, 1200);
}

watch(() => props.isLoaded, (loaded) => {
  if (loaded) finishPreloader();
}, { immediate: true });

onMounted(() => {
  if (props.isLoaded) {
    finishPreloader();
  } else {
    startSimulatedProgress();
  }
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
  if (notifTimeout) clearTimeout(notifTimeout);
});
</script>

<template>
  <div
    v-if="!isHidden"
    class="preloader-root"
    :class="{ closing: isClosing }"
    role="status"
    aria-live="polite"
    aria-label="Cargando tienda"
  >
    <!-- IG gradient background -->
    <div class="ig-bg"></div>

    <!-- Floating bubbles -->
    <div class="bubbles-layer" aria-hidden="true">
      <div
        v-for="b in bubbles"
        :key="b.id"
        class="bubble"
        :style="{
          width: b.size + 'px',
          height: b.size + 'px',
          left: b.left + '%',
          animationDelay: b.delay + 's',
          animationDuration: b.duration + 's',
          opacity: b.opacity,
        }"
      ></div>
    </div>

    <!-- WhatsApp notification pop -->
    <transition name="notif">
      <div v-if="notifVisible" class="wa-notif" aria-live="assertive">
        <!-- WhatsApp icon -->
        <svg viewBox="0 0 32 32" class="wa-icon" aria-hidden="true">
          <circle cx="16" cy="16" r="16" fill="#25D366"/>
          <path d="M23.5 8.5A10.38 10.38 0 0 0 16 5.5a10.45 10.45 0 0 0-9.08 15.6L5.5 26.5l5.56-1.4A10.44 10.44 0 0 0 16 26.5a10.46 10.46 0 0 0 7.5-17.9ZM16 24.7a8.66 8.66 0 0 1-4.42-1.21l-.32-.19-3.3.83.87-3.19-.2-.33A8.68 8.68 0 1 1 16 24.7Zm4.77-6.5c-.26-.13-1.54-.76-1.78-.84s-.41-.13-.59.13-.67.84-.82 1-.3.2-.57.07a7.12 7.12 0 0 1-3.55-3.1c-.27-.46.27-.43.77-1.43a.49.49 0 0 0-.02-.46c-.07-.13-.59-1.42-.81-1.94s-.43-.44-.59-.45h-.5a.96.96 0 0 0-.7.33 2.93 2.93 0 0 0-.91 2.18 5.09 5.09 0 0 0 1.06 2.69 11.65 11.65 0 0 0 4.47 3.94c1.66.57 1.66.38 1.96.36a2.66 2.66 0 0 0 1.77-1.25 2.19 2.19 0 0 0 .15-1.25c-.06-.1-.24-.16-.5-.28Z" fill="#fff"/>
        </svg>
        <span>{{ notifText }}</span>
      </div>
    </transition>

    <!-- Center content -->
    <div class="center-stage">

      <!-- Instagram-style logo ring -->
      <div class="ig-ring-wrap" aria-hidden="true">
        <svg viewBox="0 0 200 200" class="ig-ring-svg">
          <defs>
            <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#f9ce34"/>
              <stop offset="25%" stop-color="#ee2a7b"/>
              <stop offset="50%" stop-color="#6228d7"/>
              <stop offset="75%" stop-color="#833ab4"/>
              <stop offset="100%" stop-color="#405de6"/>
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="none" stroke="url(#igGrad)" stroke-width="8" stroke-dasharray="565" stroke-dashoffset="565" class="ig-ring-arc"/>
        </svg>

        <!-- Logo / monogram inside ring -->
        <div class="ig-logo-inner">
          <img v-if="logoUrl" :src="logoUrl" :alt="storeName || 'Tienda'" class="ig-logo-img" />
          <span v-else class="ig-monogram">
            {{ storeName ? storeName.slice(0, 2).toUpperCase() : 'SS' }}
          </span>
        </div>
      </div>

      <!-- Store name -->
      <h1 class="store-title">{{ storeName || 'S&S BOUTIQUE' }}</h1>
      <p class="store-sub">Alta moda · Calzado · Accesorios</p>

      <!-- Shopping scene: 2 characters -->
      <div class="scene" aria-label="Dos compradores enviando pedido por WhatsApp">

        <!-- Character A: woman with bag -->
        <div class="char char-a">
          <div class="char-body char-body-a">
            <!-- head -->
            <div class="char-head head-a"></div>
            <!-- torso -->
            <div class="char-torso torso-a"></div>
            <!-- bag -->
            <div class="char-bag bag-a">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          </div>
          <span class="char-label">Compradora</span>
        </div>

        <!-- Phone in center with WhatsApp -->
        <div class="phone-wrap">
          <div class="phone">
            <div class="phone-screen">
              <!-- WA chat bubble animation -->
              <div class="chat-bubble cb1">🛍️ ¡Hola!</div>
              <div class="chat-bubble cb2">¡Tu pedido va! ✓✓</div>
            </div>
            <!-- WhatsApp dot -->
            <div class="wa-dot">
              <svg viewBox="0 0 32 32" style="width:100%;height:100%;">
                <circle cx="16" cy="16" r="16" fill="#25D366"/>
                <path d="M23.5 8.5A10.38 10.38 0 0 0 16 5.5a10.45 10.45 0 0 0-9.08 15.6L5.5 26.5l5.56-1.4A10.44 10.44 0 0 0 16 26.5a10.46 10.46 0 0 0 7.5-17.9ZM16 24.7a8.66 8.66 0 0 1-4.42-1.21l-.32-.19-3.3.83.87-3.19-.2-.33A8.68 8.68 0 1 1 16 24.7Zm4.77-6.5c-.26-.13-1.54-.76-1.78-.84s-.41-.13-.59.13-.67.84-.82 1-.3.2-.57.07a7.12 7.12 0 0 1-3.55-3.1c-.27-.46.27-.43.77-1.43a.49.49 0 0 0-.02-.46c-.07-.13-.59-1.42-.81-1.94s-.43-.44-.59-.45h-.5a.96.96 0 0 0-.7.33 2.93 2.93 0 0 0-.91 2.18 5.09 5.09 0 0 0 1.06 2.69 11.65 11.65 0 0 0 4.47 3.94c1.66.57 1.66.38 1.96.36a2.66 2.66 0 0 0 1.77-1.25 2.19 2.19 0 0 0 .15-1.25c-.06-.1-.24-.16-.5-.28Z" fill="#fff"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Character B: man with bag -->
        <div class="char char-b">
          <div class="char-body char-body-b">
            <div class="char-head head-b"></div>
            <div class="char-torso torso-b"></div>
            <div class="char-bag bag-b">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          </div>
          <span class="char-label">Comprador</span>
        </div>

      </div>

      <!-- Progress bar -->
      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progress + '%' }">
            <div class="progress-shimmer"></div>
          </div>
        </div>
        <span class="progress-pct">{{ Math.floor(progress) }}%</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────── */
.preloader-root {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.65s ease, transform 0.65s ease, filter 0.65s ease;
}
.preloader-root.closing {
  opacity: 0;
  transform: scale(1.06);
  filter: blur(8px);
  pointer-events: none;
}

/* ── Instagram Gradient BG ─────────────── */
.ig-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 70% 10%, #405de6 0%, transparent 55%),
              radial-gradient(ellipse at 30% 90%, #f9ce34 0%, transparent 55%),
              radial-gradient(ellipse at 10% 30%, #833ab4 0%, transparent 45%),
              radial-gradient(ellipse at 90% 70%, #ee2a7b 0%, transparent 45%),
              linear-gradient(160deg, #1a0533 0%, #2d0b5e 30%, #5c1060 60%, #1a0533 100%);
  z-index: 0;
}

/* ── Bubbles ───────────────────────────── */
.bubbles-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.bubble {
  position: absolute;
  bottom: -80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(238,42,123,0.55) 0%, rgba(131,58,180,0.45) 40%, rgba(249,206,52,0.4) 100%);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(2px);
  animation: bubbleRise linear infinite;
}
@keyframes bubbleRise {
  0%   { transform: translateY(0) scale(1);   opacity: var(--op, 0.25); }
  80%  { opacity: var(--op, 0.25); }
  100% { transform: translateY(-110vh) scale(0.7); opacity: 0; }
}

/* ── Center Stage ──────────────────────── */
.center-stage {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
  text-align: center;
}

/* ── Instagram Ring ────────────────────── */
.ig-ring-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.ig-ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: spinRing 2.4s ease-out forwards;
}
.ig-ring-arc {
  transform-origin: 100px 100px;
  animation: arcDraw 2.2s ease-out forwards;
}
@keyframes arcDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes spinRing {
  0%   { transform: rotate(-90deg); }
  100% { transform: rotate(270deg); }
}
.ig-logo-inner {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a0533, #2d0b5e);
  border: 2px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.ig-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 6px;
  border-radius: 50%;
}
.ig-monogram {
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #f9ce34, #ee2a7b, #833ab4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

/* ── Store title ───────────────────────── */
.store-title {
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin: 0 0 4px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #c13584, #833ab4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.store-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 0 0 18px;
}

/* ── Scene ─────────────────────────────── */
.scene {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
  width: 100%;
}

/* Characters */
.char {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.char-a { animation: charBobA 2.2s ease-in-out infinite; }
.char-b { animation: charBobB 2.4s ease-in-out infinite 0.4s; }
@keyframes charBobA {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes charBobB {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

.char-body { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.char-head {
  width: 26px; height: 26px; border-radius: 50%;
}
.head-a { background: linear-gradient(135deg, #fbbf7c, #f59e50); box-shadow: 0 0 12px rgba(249,206,52,0.4); }
.head-b { background: linear-gradient(135deg, #c7a47a, #a87d50); box-shadow: 0 0 12px rgba(131,58,180,0.3); }

.char-torso {
  width: 32px; height: 34px; border-radius: 8px 8px 4px 4px;
}
.torso-a { background: linear-gradient(160deg, #ee2a7b, #c13584); box-shadow: 0 4px 14px rgba(238,42,123,0.4); }
.torso-b { background: linear-gradient(160deg, #405de6, #5851d8); box-shadow: 0 4px 14px rgba(64,93,230,0.4); }

.char-bag {
  width: 24px; height: 24px;
  position: absolute;
  bottom: -6px;
}
.bag-a {
  right: -22px;
  color: #f9ce34;
  filter: drop-shadow(0 2px 6px rgba(249,206,52,0.6));
}
.bag-b {
  left: -22px;
  color: #f9ce34;
  filter: drop-shadow(0 2px 6px rgba(249,206,52,0.6));
}
.char-bag svg { width: 100%; height: 100%; }

.char-label {
  font-size: 9px;
  color: rgba(255,255,255,0.45);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

/* Phone */
.phone-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.phone {
  width: 52px;
  height: 88px;
  background: linear-gradient(160deg, #1a1a2e, #16213e);
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}
.phone-screen {
  position: absolute;
  inset: 4px;
  background: #0d1117;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 3px;
  overflow: hidden;
}
.chat-bubble {
  font-size: 7px;
  color: #fff;
  border-radius: 6px;
  padding: 3px 5px;
  line-height: 1.2;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cb1 {
  background: rgba(238,42,123,0.75);
  align-self: flex-start;
  animation: chatPop 1.2s ease-out 0.6s both;
}
.cb2 {
  background: rgba(37,211,102,0.8);
  align-self: flex-end;
  animation: chatPop 1.2s ease-out 1.4s both;
}
@keyframes chatPop {
  0%   { opacity: 0; transform: scale(0.5) translateY(6px); }
  60%  { transform: scale(1.08) translateY(-1px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.wa-dot {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  animation: waPulse 1.8s ease-in-out infinite;
}
@keyframes waPulse {
  0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
  50%      { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(37,211,102,0); }
}

/* ── WhatsApp Notification Bubble ──────── */
.wa-notif {
  position: absolute;
  top: 28px;
  right: 20px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 10, 20, 0.88);
  border: 1px solid rgba(37,211,102,0.4);
  border-radius: 16px;
  padding: 8px 14px 8px 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(37,211,102,0.15);
  backdrop-filter: blur(12px);
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  max-width: 240px;
}
.wa-icon { width: 28px; height: 28px; flex-shrink: 0; }

.notif-enter-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.notif-leave-active { transition: all 0.3s ease-in; }
.notif-enter-from   { opacity: 0; transform: translateX(40px) scale(0.8); }
.notif-leave-to     { opacity: 0; transform: translateX(40px) scale(0.8); }

/* ── Progress ───────────────────────────── */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 320px;
}
.progress-track {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.1);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4, #405de6);
  transition: width 0.15s ease-out;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(238,42,123,0.6);
}
.progress-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
  animation: shimmerSlide 1.4s ease-in-out infinite;
}
@keyframes shimmerSlide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.progress-pct {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255,255,255,0.7);
  min-width: 34px;
  text-align: right;
}
</style>
