<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import AdminNavbar from '@/components/admin/AdminNavbar.vue';
import AdminMobileBottomNav from '@/components/admin/AdminMobileBottomNav.vue';
import ToastNotification from '@/components/ui/ToastNotification.vue';
import '@/assets/admin-theme.css';

const adminStore = useAdminStore();
const mobileSidebarOpen   = ref(false);
const isSidebarCollapsed  = ref(false);
const panelReady          = ref(false);

onMounted(async () => {
  await adminStore.loadAdminData();
  // Small delay so the preloader completes its animation gracefully
  setTimeout(() => { panelReady.value = true; }, 380);
});
</script>

<template>
  <div class="admin-layout min-h-screen flex text-slate-900 dark:text-slate-100 font-sans antialiased overflow-x-hidden" style="color: var(--ad-text)">

    <!-- ── Admin Panel Preloader ── -->
    <Transition name="al-fade">
      <div v-if="!panelReady" class="al-loader" role="status" aria-label="Cargando panel de administración">
        <!-- BG -->
        <div class="al-loader-bg" aria-hidden="true">
          <div class="al-loader-blob al-blob-l"></div>
          <div class="al-loader-blob al-blob-r"></div>
          <div class="al-loader-grid"></div>
        </div>

        <div class="al-loader-content">
          <!-- Logo ring -->
          <div class="al-ring-host" aria-hidden="true">
            <svg viewBox="0 0 100 100" class="al-ring-svg">
              <defs>
                <linearGradient id="alGr" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%"   stop-color="#f9ce34"/>
                  <stop offset="40%"  stop-color="#ee2a7b"/>
                  <stop offset="80%"  stop-color="#833ab4"/>
                  <stop offset="100%" stop-color="#405de6"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="none"
                stroke="url(#alGr)" stroke-width="4"
                stroke-dasharray="276" stroke-dashoffset="276"
                class="al-arc"/>
            </svg>
            <div class="al-ring-inner">
              <span class="al-ring-text">S&amp;S</span>
            </div>
          </div>

          <p class="al-loader-title">S&amp;S BOUTIQUE</p>
          <p class="al-loader-sub">Cargando panel de control</p>

          <!-- Three dots -->
          <div class="al-dots" aria-hidden="true">
            <span class="al-dot" style="animation-delay:0s"></span>
            <span class="al-dot" style="animation-delay:.18s"></span>
            <span class="al-dot" style="animation-delay:.36s"></span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Actual layout (always mounted, hidden until ready) ── -->
    <template v-if="panelReady">
      <!-- Responsive Collapsible Sidebar -->
      <AdminSidebar
        :mobile-open="mobileSidebarOpen"
        :collapsed="isSidebarCollapsed"
        @close="mobileSidebarOpen = false"
        @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
      />

      <!-- Main Workspace -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminNavbar @toggle-sidebar="mobileSidebarOpen = true" />

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <router-view />
        </main>

        <AdminMobileBottomNav @open-drawer="mobileSidebarOpen = true" />
      </div>
    </template>

    <!-- Centralized Feedback Toast -->
    <ToastNotification />
  </div>
</template>

<style scoped>
/* ── Preloader ───────────────────────────────────── */
.al-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.al-loader-bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #0d0118 0%, #1a0435 40%, #2a0850 70%, #0d0118 100%);
}
.al-loader-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  animation: alBlob 12s ease-in-out infinite alternate;
}
.al-blob-l {
  width: 420px; height: 420px;
  top: -100px; left: -80px;
  background: radial-gradient(circle, rgba(131,58,180,.5) 0%, transparent 70%);
}
.al-blob-r {
  width: 400px; height: 400px;
  bottom: -80px; right: -60px;
  background: radial-gradient(circle, rgba(238,42,123,.45) 0%, transparent 70%);
  animation-direction: alternate-reverse;
}
@keyframes alBlob {
  0%   { transform: translate(0,0); }
  100% { transform: translate(20px,15px); }
}
.al-loader-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: 52px 52px;
}

.al-loader-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: alIn .55s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes alIn {
  from { opacity: 0; transform: translateY(20px) scale(.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Ring */
.al-ring-host {
  position: relative;
  width: 82px; height: 82px;
  margin-bottom: 4px;
}
.al-ring-svg {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  animation: alSpin 1.8s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes alSpin {
  0%   { transform: rotate(-90deg); }
  100% { transform: rotate(270deg); }
}
.al-arc {
  transform-origin: 50px 50px;
  transform: rotate(-90deg);
  animation: alArc 1.6s cubic-bezier(.4,0,.2,1) .1s forwards;
}
@keyframes alArc { to { stroke-dashoffset: 0; } }

.al-ring-inner {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: linear-gradient(145deg, #16052e, #2a0850);
  border: 1.5px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 2px 12px rgba(0,0,0,.5);
}
.al-ring-text {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: .04em;
  background: linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.al-loader-title {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -.2px;
  background: linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #833ab4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
}
.al-loader-sub {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.28);
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
}

/* Dots */
.al-dots {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.al-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ee2a7b, #833ab4);
  animation: alDotPulse 1s ease-in-out infinite;
}
@keyframes alDotPulse {
  0%,100% { opacity: .3; transform: scale(.8); }
  50%      { opacity: 1;  transform: scale(1.2); }
}

/* Fade transition */
.al-fade-leave-active { transition: opacity .4s ease, transform .4s ease; }
.al-fade-leave-to     { opacity: 0; transform: scale(1.03); }
.al-fade-enter-active { transition: opacity .3s ease; }
.al-fade-enter-from   { opacity: 0; }
</style>
