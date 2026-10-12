<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Lock, Mail, ArrowRight } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const email    = ref('');
const password = ref('');
const errorMessage = ref('');
const showPass = ref(false);
const justLoggedIn = ref(false);

async function handleLogin() {
  errorMessage.value = '';
  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Por favor ingresa tu correo y contraseña.';
    return;
  }
  const success = await authStore.login(email.value.trim(), password.value);
  if (success) {
    justLoggedIn.value = true;
    setTimeout(() => router.push('/admin'), 1400);
  } else {
    errorMessage.value = authStore.error || 'Credenciales incorrectas. Verifica tus datos.';
  }
}
</script>

<template>
  <div class="lv-root" role="main">

    <!-- ── Background ── -->
    <div class="lv-bg" aria-hidden="true">
      <div class="lv-blob lv-blob-1"></div>
      <div class="lv-blob lv-blob-2"></div>
      <div class="lv-blob lv-blob-3"></div>
      <div class="lv-grid"></div>
      <div class="lv-vignette"></div>
    </div>

    <!-- ── Welcome overlay (post-login) ── -->
    <Transition name="welcome">
      <div v-if="justLoggedIn" class="lv-welcome" role="status" aria-live="assertive">
        <div class="lv-welcome-inner">
          <div class="lv-welcome-ring">
            <svg viewBox="0 0 80 80" class="lv-welcome-svg" aria-hidden="true">
              <defs>
                <linearGradient id="wgr" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#f9ce34"/>
                  <stop offset="50%"  stop-color="#ee2a7b"/>
                  <stop offset="100%" stop-color="#405de6"/>
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r="34" fill="none" stroke="url(#wgr)" stroke-width="3"
                stroke-dasharray="213" stroke-dashoffset="213" class="lv-welcome-arc"/>
              <!-- Checkmark -->
              <path d="M24 40 L35 51 L56 29" stroke="white" stroke-width="3.5"
                stroke-linecap="round" stroke-linejoin="round" fill="none"
                stroke-dasharray="50" stroke-dashoffset="50" class="lv-check"/>
            </svg>
          </div>
          <p class="lv-welcome-text">¡Bienvenido de vuelta!</p>
          <p class="lv-welcome-sub">Entrando al panel de control...</p>
        </div>
      </div>
    </Transition>

    <!-- ── Card ── -->
    <div class="lv-card-wrap">

      <!-- Brand header -->
      <div class="lv-brand">
        <router-link to="/" class="lv-logo-link" aria-label="Ir al inicio">
          <div class="lv-logo-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100" class="lv-logo-svg">
              <defs>
                <linearGradient id="lgr" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#f9ce34"/>
                  <stop offset="35%"  stop-color="#ee2a7b"/>
                  <stop offset="70%"  stop-color="#833ab4"/>
                  <stop offset="100%" stop-color="#405de6"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#lgr)" stroke-width="4"/>
            </svg>
            <div class="lv-logo-inner">
              <span class="lv-logo-text">S&amp;S</span>
            </div>
          </div>
        </router-link>

        <div class="lv-brand-text">
          <span class="lv-brand-name">S&amp;S BOUTIQUE</span>
          <span class="lv-brand-sub">Alta Moda · Calzado · Accesorios</span>
        </div>
      </div>

      <!-- Card body -->
      <div class="lv-card">

        <!-- Headline -->
        <div class="lv-headline">
          <h1 class="lv-title">Bienvenido</h1>
          <p class="lv-subtitle">Accede al panel de gestión de tu tienda</p>
        </div>

        <!-- Error -->
        <div v-if="errorMessage" class="lv-error" role="alert">
          <span class="lv-error-dot" aria-hidden="true"></span>
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="lv-form" novalidate>

          <!-- Email -->
          <div class="lv-field">
            <label for="lv-email" class="lv-label">Correo electrónico</label>
            <div class="lv-input-wrap">
              <Mail class="lv-input-icon" aria-hidden="true" />
              <input
                id="lv-email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@correo.com"
                class="lv-input"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="lv-field">
            <label for="lv-pass" class="lv-label">Contraseña</label>
            <div class="lv-input-wrap">
              <Lock class="lv-input-icon" aria-hidden="true" />
              <input
                id="lv-pass"
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="lv-input lv-input-pass"
              />
              <button
                type="button"
                @click="showPass = !showPass"
                class="lv-eye"
                :aria-label="showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <!-- Eye open -->
                <svg v-if="!showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye off -->
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="lv-submit"
          >
            <span v-if="authStore.isLoading" class="lv-spinner" aria-hidden="true"></span>
            <span>{{ authStore.isLoading ? 'Verificando...' : 'Ingresar al Panel' }}</span>
            <ArrowRight v-if="!authStore.isLoading" class="lv-submit-icon" aria-hidden="true" />
          </button>
        </form>

        <!-- Footer link -->
        <div class="lv-footer">
          <span>¿Quieres ver el catálogo?</span>
          <router-link to="/tienda/ss-boutique" class="lv-footer-link">
            Ver Tienda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ─────────────────────────────────────────── */
.lv-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
}

/* ── Background ─────────────────────────────────── */
.lv-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #0d0118 0%, #1a0435 35%, #2a0850 65%, #0d0118 100%);
  z-index: 0;
}
.lv-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.lv-blob-1 {
  width: 500px; height: 500px;
  top: -120px; left: -80px;
  background: radial-gradient(circle, rgba(131,58,180,.5) 0%, transparent 70%);
  animation: blobDrift 16s ease-in-out infinite alternate;
}
.lv-blob-2 {
  width: 480px; height: 480px;
  bottom: -100px; right: -80px;
  background: radial-gradient(circle, rgba(238,42,123,.45) 0%, transparent 70%);
  animation: blobDrift 20s ease-in-out infinite alternate-reverse;
}
.lv-blob-3 {
  width: 360px; height: 360px;
  top: 40%; left: 50%; transform: translate(-50%,-50%);
  background: radial-gradient(circle, rgba(64,93,230,.35) 0%, transparent 70%);
  animation: blobDrift 13s ease-in-out infinite alternate;
}
@keyframes blobDrift {
  0%   { transform: translate(0,0); }
  100% { transform: translate(25px,18px); }
}
.lv-blob-3 { animation-name: blobDrift3; }
@keyframes blobDrift3 {
  0%   { transform: translate(-50%,-50%) scale(1); }
  100% { transform: translate(calc(-50% + 20px), calc(-50% + 15px)) scale(1.06); }
}
.lv-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
  background-size: 52px 52px;
}
.lv-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.65) 100%);
}

/* ── Card wrap ───────────────────────────────────── */
.lv-card-wrap {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: cardIn .6s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Brand section ───────────────────────────────── */
.lv-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.lv-logo-link { display: block; }
.lv-logo-ring {
  position: relative;
  width: 72px; height: 72px;
}
.lv-logo-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  animation: rotateSlow 12s linear infinite;
}
@keyframes rotateSlow {
  to { transform: rotate(360deg); }
}
.lv-logo-inner {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: linear-gradient(145deg, #16052e, #2a0850);
  border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 12px rgba(0,0,0,.5);
}
.lv-logo-text {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: .04em;
  background: linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lv-brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lv-brand-name {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -.3px;
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lv-brand-sub {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,.3);
}

/* ── Card ────────────────────────────────────────── */
.lv-card {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 28px;
  padding: 32px 28px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 0 0 1px rgba(131,58,180,.15),
    0 24px 60px rgba(0,0,0,.5);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ── Headline ────────────────────────────────────── */
.lv-headline { text-align: center; }
.lv-title {
  font-size: clamp(22px, 5vw, 28px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -.4px;
  margin: 0 0 4px;
}
.lv-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,.38);
  font-weight: 500;
  margin: 0;
  letter-spacing: .3px;
}

/* ── Error ───────────────────────────────────────── */
.lv-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(239,68,68,.1);
  border: 1px solid rgba(239,68,68,.25);
  color: #fca5a5;
  font-size: 12px;
  font-weight: 600;
}
.lv-error-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

/* ── Form ────────────────────────────────────────── */
.lv-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lv-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lv-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255,255,255,.45);
}
.lv-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.lv-input-icon {
  position: absolute;
  left: 14px;
  width: 15px; height: 15px;
  color: rgba(255,255,255,.3);
  pointer-events: none;
  flex-shrink: 0;
}
.lv-input {
  width: 100%;
  padding: 11px 14px 11px 42px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  transition: border-color .2s, background .2s, box-shadow .2s;
  font-family: inherit;
}
.lv-input::placeholder { color: rgba(255,255,255,.2); }
.lv-input:focus {
  border-color: rgba(238,42,123,.55);
  background: rgba(255,255,255,.09);
  box-shadow: 0 0 0 3px rgba(238,42,123,.12);
}
.lv-input-pass { padding-right: 42px; }

.lv-eye {
  position: absolute;
  right: 12px;
  width: 18px; height: 18px;
  color: rgba(255,255,255,.3);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
  transition: color .2s;
}
.lv-eye:hover { color: rgba(255,255,255,.7); }
.lv-eye svg { width: 100%; height: 100%; }

/* ── Submit button ───────────────────────────────── */
.lv-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #833ab4 0%, #ee2a7b 50%, #f9ce34 100%);
  border: none;
  cursor: pointer;
  transition: opacity .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 20px rgba(238,42,123,.35);
  position: relative;
  overflow: hidden;
  margin-top: 4px;
  font-family: inherit;
}
.lv-submit::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6d28d9 0%, #c13584 50%, #f59e0b 100%);
  opacity: 0;
  transition: opacity .25s;
  border-radius: inherit;
}
.lv-submit:hover::after { opacity: 1; }
.lv-submit:hover { box-shadow: 0 6px 28px rgba(238,42,123,.5); transform: translateY(-1px); }
.lv-submit:active { transform: scale(.97); }
.lv-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.lv-submit span, .lv-submit-icon { position: relative; z-index: 1; }
.lv-submit-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* Spinner */
.lv-spinner {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
  position: relative; z-index: 1;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Footer ──────────────────────────────────────── */
.lv-footer {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,.28);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.lv-footer-link {
  color: rgba(255,255,255,.65);
  font-weight: 700;
  text-decoration: none;
  transition: color .2s;
}
.lv-footer-link:hover { color: #ee2a7b; }

/* ── Welcome overlay ──────────────────────────────── */
.lv-welcome {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13,1,24,.92);
  backdrop-filter: blur(16px);
}
.lv-welcome-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  animation: welcomeIn .45s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes welcomeIn {
  from { opacity: 0; transform: scale(.8); }
  to   { opacity: 1; transform: scale(1); }
}
.lv-welcome-ring {
  width: 80px; height: 80px;
}
.lv-welcome-svg {
  width: 100%; height: 100%;
}
.lv-welcome-arc {
  transform-origin: 40px 40px;
  transform: rotate(-90deg);
  animation: arcDraw .9s cubic-bezier(.4,0,.2,1) .1s forwards;
}
@keyframes arcDraw { to { stroke-dashoffset: 0; } }
.lv-check {
  animation: checkDraw .4s ease-out .85s forwards;
}
@keyframes checkDraw { to { stroke-dashoffset: 0; } }
.lv-welcome-text {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  margin: 0;
  background: linear-gradient(90deg, #f9ce34, #ee2a7b, #833ab4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lv-welcome-sub {
  font-size: 12px;
  color: rgba(255,255,255,.4);
  font-weight: 500;
  margin: 0;
  letter-spacing: 1px;
}

/* Transition */
.welcome-enter-active { transition: opacity .3s ease; }
.welcome-leave-active { transition: opacity .4s ease; }
.welcome-enter-from, .welcome-leave-to { opacity: 0; }
</style>
