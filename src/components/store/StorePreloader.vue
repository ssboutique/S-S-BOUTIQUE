<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Sparkles, ShieldCheck, ShoppingBag, Crown, Gem } from 'lucide-vue-next';

const props = defineProps<{
  isLoaded: boolean;
  storeName?: string;
  logoUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'finished'): void;
}>();

const progress = ref(12);
const currentStepText = ref('Conectando con el atelier exclusivo...');
const isHidden = ref(false);
const isClosing = ref(false);

let progressInterval: any = null;
let watchdogTimeout: any = null;

const stepMessages = [
  { min: 0, max: 25, text: 'Iniciando experiencia de alta moda...' },
  { min: 25, max: 55, text: 'Sincronizando colecciones de autor...' },
  { min: 55, max: 80, text: 'Preparando calzado y marroquinería...' },
  { min: 80, max: 99, text: 'Alistando atención VIP...' },
  { min: 99, max: 100, text: '¡Bienvenido a S&S BOUTIQUE!' },
];

function updateStepMessage(val: number) {
  const step = stepMessages.find((s) => val >= s.min && val <= s.max);
  if (step) {
    currentStepText.value = step.text;
  }
}

function finishPreloader() {
  if (isHidden.value) return;
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
  progress.value = 100;
  currentStepText.value = '¡Bienvenido!';

  setTimeout(() => {
    isClosing.value = true;
    setTimeout(() => {
      isHidden.value = true;
      emit('finished');
    }, 450);
  }, 250);
}

function startSimulatedProgress() {
  // Safety watchdog: ensure preloader never hangs more than 1.8 seconds
  watchdogTimeout = setTimeout(() => {
    finishPreloader();
  }, 1800);

  progressInterval = setInterval(() => {
    if (!props.isLoaded) {
      if (progress.value < 85) {
        progress.value = Math.min(85, progress.value + 8);
        updateStepMessage(progress.value);
      }
    } else {
      if (progress.value < 100) {
        progress.value = Math.min(100, progress.value + 20);
        updateStepMessage(progress.value);
      } else {
        finishPreloader();
      }
    }
  }, 40);
}

watch(
  () => props.isLoaded,
  (loaded) => {
    if (loaded) {
      progress.value = Math.max(progress.value, 90);
      updateStepMessage(90);
    }
  }
);

onMounted(() => {
  startSimulatedProgress();
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
  if (watchdogTimeout) clearTimeout(watchdogTimeout);
});
</script>

<template>
  <div
    v-if="!isHidden"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white select-none transition-all duration-700 ease-out"
    :class="[
      isClosing ? 'opacity-0 scale-105 pointer-events-none blur-md' : 'opacity-100 scale-100'
    ]"
    role="status"
    aria-live="polite"
    aria-label="Cargando boutique de lujo"
  >
    <!-- Haute Couture Silk Ambient Glow Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Golden and Rose Warm Lights -->
      <div class="absolute -top-20 -left-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] animate-pulse-gentle"></div>
      <div class="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[140px] animate-pulse-gentle" style="animation-delay: 1.5s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[160px]"></div>

      <!-- Luxury Radial Grid -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.06)_0%,transparent_70%)]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]"></div>
    </div>

    <!-- Main Central Stage -->
    <div class="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
      
      <!-- Luxury Monogram & Spinning Halo Crown -->
      <div class="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mb-6">
        
        <!-- Rotating Gold Halos -->
        <div class="absolute inset-0 rounded-full border border-amber-500/20 border-dashed animate-[spin_16s_linear_infinite]"></div>
        <div class="absolute inset-3 rounded-full border border-fuchsia-500/20 animate-[spin_10s_linear_infinite_reverse]"></div>
        <div class="absolute inset-6 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-fuchsia-400 border-l-transparent animate-[spin_4s_linear_infinite]"></div>

        <!-- Floating Jewels and Accents in Orbit -->
        <div class="absolute top-0 right-3 z-30 p-2 rounded-xl bg-slate-900/90 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.3)] backdrop-blur-md animate-float-slow">
          <Crown class="w-5 h-5 text-amber-400" />
        </div>
        <div class="absolute bottom-2 left-2 z-30 p-2 rounded-xl bg-slate-900/90 border border-fuchsia-400/40 shadow-[0_0_20px_rgba(232,121,249,0.3)] backdrop-blur-md animate-float-reverse">
          <Gem class="w-5 h-5 text-fuchsia-400" />
        </div>
        <div class="absolute top-6 left-0 z-30 p-1.5 rounded-lg bg-slate-900/80 border border-amber-300/30 text-amber-300 animate-pulse-gentle">
          <Sparkles class="w-4 h-4" />
        </div>

        <!-- Central Medallion Core with Logo or Monogram -->
        <div class="relative z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-subtle-glow">
          <div class="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center overflow-hidden border border-white/10 backdrop-blur-xl">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              :alt="storeName || 'Boutique'"
              class="w-full h-full object-cover p-2"
            />
            <div v-else class="flex flex-col items-center justify-center p-2">
              <span class="text-3xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                {{ storeName ? storeName.slice(0, 3).toUpperCase() : 'S&S' }}
              </span>
              <span class="text-[9px] uppercase tracking-[0.25em] font-semibold text-amber-400/80 mt-0.5">
                BOUTIQUE
              </span>
            </div>
          </div>

          <!-- Pulsing Status Dot -->
          <span class="absolute -top-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-slate-950"></span>
          </span>
        </div>
      </div>

      <!-- Boutique Name & Brand Banner -->
      <div class="space-y-1.5 mb-7">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-fuchsia-500/15 to-purple-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles class="w-3.5 h-3.5 text-amber-400" />
          <span>Haute Couture & Diseño Exclusivo</span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          {{ storeName || 'S&S BOUTIQUE' }}
        </h1>
        <p class="text-xs text-slate-400 max-w-xs mx-auto font-normal">
          Colecciones de autor, calzado y accesorios de lujo
        </p>
      </div>

      <!-- Luxury Progress Bar Container -->
      <div class="w-full bg-slate-900/80 p-5 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-3.5">
        
        <!-- Live Step Status & Percentage -->
        <div class="flex items-center justify-between text-xs font-medium">
          <div class="flex items-center gap-2 text-slate-300 truncate max-w-[220px]">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
            <span class="truncate font-sans font-semibold text-[12px] text-slate-200">
              {{ currentStepText }}
            </span>
          </div>
          <span class="text-base font-black tracking-tight bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent shrink-0">
            {{ Math.floor(progress) }}%
          </span>
        </div>

        <!-- Sleek Gold & Fuchsia Progress Bar -->
        <div class="relative h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            class="h-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-purple-500 rounded-full transition-all duration-150 ease-out relative shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            :style="{ width: `${progress}%` }"
          >
            <!-- Gold Shimmer Sweeping Beam -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer"></div>
          </div>
        </div>

        <!-- Trust & Security Badges -->
        <div class="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-medium">
          <span class="flex items-center gap-1.5 text-amber-300">
            <ShoppingBag class="w-3.5 h-3.5" />
            Catálogo Oficial
          </span>
          <span class="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
            Atención Directa WhatsApp
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-7px) rotate(6deg); }
}

@keyframes floatReverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(7px) rotate(-6deg); }
}

@keyframes pulseGentle {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.04); }
}

@keyframes subtleGlow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 35px rgba(245, 158, 11, 0.3); }
  50% { transform: scale(1.02); box-shadow: 0 0 55px rgba(217, 70, 239, 0.4); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-float-slow {
  animation: floatSlow 4s ease-in-out infinite;
}

.animate-float-reverse {
  animation: floatReverse 4.5s ease-in-out infinite 0.5s;
}

.animate-pulse-gentle {
  animation: pulseGentle 4s ease-in-out infinite;
}

.animate-subtle-glow {
  animation: subtleGlow 3s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 1.6s ease-in-out infinite;
}
</style>
