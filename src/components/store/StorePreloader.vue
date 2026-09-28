<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, Zap, ShieldCheck } from 'lucide-vue-next';

const props = defineProps<{
  isLoaded: boolean;
  storeName?: string;
  logoUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'finished'): void;
}>();

const progress = ref(8);
const currentStepText = ref('Iniciando experiencia boutique...');
const isHidden = ref(false);
const isClosing = ref(false);

let progressInterval: any = null;

const stepMessages = [
  { min: 0, max: 25, text: 'Iniciando experiencia boutique exclusiva...' },
  { min: 25, max: 55, text: 'Sincronizando catálogo de moda y tendencias...' },
  { min: 55, max: 85, text: 'Cargando calzado, prendas y accesorios...' },
  { min: 85, max: 99, text: 'Optimizando atención directa y pedidos...' },
  { min: 99, max: 100, text: '¡Todo listo! Bienvenido a tu tienda...' },
];

function updateStepMessage(val: number) {
  const step = stepMessages.find(s => val >= s.min && val <= s.max);
  if (step) {
    currentStepText.value = step.text;
  }
}

function startSimulatedProgress() {
  progressInterval = setInterval(() => {
    if (!props.isLoaded) {
      if (progress.value < 88) {
        // Smooth progressive increment
        const increment = Math.max(1, Math.floor((90 - progress.value) / 7));
        progress.value = Math.min(88, progress.value + increment);
        updateStepMessage(progress.value);
      }
    } else {
      // Store has loaded, rush to 100%
      if (progress.value < 100) {
        progress.value = Math.min(100, progress.value + 12);
        updateStepMessage(progress.value);
      } else {
        clearInterval(progressInterval);
        currentStepText.value = '¡Experiencia lista!';
        
        // Wait brief moment for the user to appreciate 100% then animate out
        setTimeout(() => {
          isClosing.value = true;
          setTimeout(() => {
            isHidden.value = true;
            emit('finished');
          }, 600); // match transition duration
        }, 400);
      }
    }
  }, 70);
}

watch(
  () => props.isLoaded,
  (loaded) => {
    if (loaded && progress.value < 90) {
      progress.value = 90;
      updateStepMessage(90);
    }
  }
);

onMounted(() => {
  startSimulatedProgress();
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});
</script>

<template>
  <div
    v-if="!isHidden"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white select-none transition-all duration-700 ease-out"
    :class="[
      isClosing ? 'opacity-0 scale-105 pointer-events-none blur-sm' : 'opacity-100 scale-100'
    ]"
    role="status"
    aria-live="polite"
    aria-label="Cargando tienda virtual"
  >
    <!-- Background Ambient Glow & Cyber Grid -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Glow Orbs -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl animate-pulse-subtle"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse-subtle" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]"></div>

      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>

    <!-- Main Central 3D Floating Stage -->
    <div class="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
      
      <!-- 3D Orbit & Floating Fashion Models Area -->
      <div class="relative w-64 h-64 flex items-center justify-center mb-6">
        
        <!-- Outer Hologram Spinner Rings -->
        <div class="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-[spin_12s_linear_infinite]"></div>
        <div class="absolute inset-4 rounded-full border border-fuchsia-500/20 animate-[spin_8s_linear_infinite_reverse]"></div>
        <div class="absolute inset-8 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-fuchsia-400 border-l-transparent animate-[spin_3s_linear_infinite]"></div>

        <!-- Center Core (Logo or Store Monogram) -->
        <div class="relative z-20 w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-emerald-500 via-teal-500 to-fuchsia-500 shadow-[0_0_40px_rgba(16,185,129,0.35)] animate-bounce-gentle">
          <div class="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10 backdrop-blur-md">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              :alt="storeName || 'Logo Tienda'"
              class="w-full h-full object-cover p-1"
            />
            <div v-else class="flex flex-col items-center justify-center">
              <span class="text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-fuchsia-400 bg-clip-text text-transparent">
                {{ storeName ? storeName.slice(0, 2).toUpperCase() : 'S&S' }}
              </span>
            </div>
          </div>
          <!-- Live pulse ping -->
          <span class="absolute -top-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
          </span>
        </div>

        <!-- ==========================================
             3D FLOATING FASHION ICONS IN ORBIT
             ========================================== -->

        <!-- 1. SNEAKER / ZAPATO 3D BADGE (Top Right) -->
        <div class="absolute -top-1 -right-2 z-30 p-2.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-emerald-500/40 shadow-[0_10px_25px_rgba(16,185,129,0.3)] backdrop-blur-md animate-float-1">
          <!-- 3D Sneaker SVG -->
          <svg class="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 32C4 32 10 32 15 28C20 24 24 16 31 16C36 16 41 19 43 23L44 32C44 34.2 42.2 36 40 36H8C5.8 36 4 34.2 4 32Z" fill="url(#shoe-grad-1)" stroke="#34d399" stroke-width="1.5"/>
            <path d="M12 28L18 20L25 22" stroke="#f472b6" stroke-width="2" stroke-linecap="round"/>
            <path d="M4 36H44V38C44 40 42 41 40 41H8C6 41 4 40 4 38V36Z" fill="#10b981"/>
            <circle cx="34" cy="24" r="2" fill="#ffffff"/>
            <defs>
              <linearGradient id="shoe-grad-1" x1="4" y1="16" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1e293b"/>
                <stop offset="1" stop-color="#0f172a"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- 2. ROPE / HOODIE / MODA 3D BADGE (Bottom Left) -->
        <div class="absolute -bottom-2 -left-3 z-30 p-2.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-fuchsia-500/40 shadow-[0_10px_25px_rgba(217,70,239,0.3)] backdrop-blur-md animate-float-2">
          <!-- 3D Luxury Hoodie / Jacket SVG -->
          <svg class="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 6L24 12L32 6L42 14L37 25L32 23V42H16V23L11 25L6 14L16 6Z" fill="url(#hoodie-grad)" stroke="#e879f9" stroke-width="1.5"/>
            <path d="M24 12V34M20 18L24 22L28 18" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="hoodie-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop stop-color="#3b0764"/>
                <stop offset="1" stop-color="#0f172a"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- 3. WATCH / ACCESORIO 3D BADGE (Top Left) -->
        <div class="absolute top-2 -left-4 z-30 p-2.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-cyan-500/40 shadow-[0_10px_25px_rgba(6,182,212,0.3)] backdrop-blur-md animate-float-3">
          <!-- 3D Smart Watch / Chrono SVG -->
          <svg class="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="4" width="12" height="40" rx="3" fill="#334155"/>
            <circle cx="24" cy="24" r="14" fill="#0f172a" stroke="#22d3ee" stroke-width="2"/>
            <circle cx="24" cy="24" r="10" stroke="#0ea5e9" stroke-dasharray="2 2"/>
            <path d="M24 18V24L28 26" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- 4. LUXURY HANDBAG / DIAMOND BADGE (Bottom Right) -->
        <div class="absolute -bottom-1 -right-4 z-30 p-2.5 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-amber-500/40 shadow-[0_10px_25px_rgba(245,158,11,0.3)] backdrop-blur-md animate-float-4">
          <!-- 3D Luxury Handbag SVG -->
          <svg class="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16C18 12.7 20.7 10 24 10C27.3 10 30 12.7 30 16" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
            <path d="M10 16H38L42 40H6L10 16Z" fill="url(#bag-grad)" stroke="#f59e0b" stroke-width="1.5"/>
            <circle cx="24" cy="24" r="3" fill="#fbbf24"/>
            <defs>
              <linearGradient id="bag-grad" x1="6" y1="16" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop stop-color="#451a03"/>
                <stop offset="1" stop-color="#18181b"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>

      <!-- Store Name & Brand Title -->
      <div class="space-y-1 mb-6">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Experiencia Oficial</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {{ storeName || 'S&S BOUTIQUE' }}
        </h1>
      </div>

      <!-- Technological Progress Bar & Percentage -->
      <div class="w-full space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
        
        <!-- Percentage Counter & Dynamic Status -->
        <div class="flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-slate-300 truncate max-w-[220px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="truncate font-sans font-medium text-[13px] text-slate-200">{{ currentStepText }}</span>
          </div>
          <span class="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-fuchsia-400">
            {{ Math.floor(progress) }}%
          </span>
        </div>

        <!-- The Progress Track -->
        <div class="relative h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <!-- Animated Progress Fill with Gradient -->
          <div
            class="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-fuchsia-500 rounded-full transition-all duration-150 ease-out relative shadow-[0_0_15px_rgba(16,185,129,0.7)]"
            :style="{ width: `${progress}%` }"
          >
            <!-- Laser Light Sweep Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-laser-sweep"></div>
          </div>
        </div>

        <!-- Tech Badges Footer -->
        <div class="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
          <span class="flex items-center gap-1 text-emerald-400">
            <Zap class="w-3.5 h-3.5" />
            Catálogo 100% Interactivo
          </span>
          <span class="flex items-center gap-1 text-slate-400">
            <ShieldCheck class="w-3.5 h-3.5 text-cyan-400" />
            Conexión Segura
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes float1 {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-8px) rotate(4deg) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-10px) rotate(-6deg) scale(1.08); }
}
@keyframes float3 {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-7px) rotate(5deg) scale(1.04); }
}
@keyframes float4 {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-9px) rotate(-4deg) scale(1.06); }
}
@keyframes bounceGentle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes laserSweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-float-1 {
  animation: float1 4s ease-in-out infinite;
}
.animate-float-2 {
  animation: float2 4.5s ease-in-out infinite 0.5s;
}
.animate-float-3 {
  animation: float3 3.8s ease-in-out infinite 1s;
}
.animate-float-4 {
  animation: float4 4.2s ease-in-out infinite 1.5s;
}
.animate-bounce-gentle {
  animation: bounceGentle 3s ease-in-out infinite;
}
.animate-laser-sweep {
  animation: laserSweep 1.8s ease-in-out infinite;
}
</style>
