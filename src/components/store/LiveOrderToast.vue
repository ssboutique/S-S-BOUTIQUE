<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { X } from 'lucide-vue-next';

// ── Types ────────────────────────────────────────────
interface ToastData {
  id: string;
  name: string;
  city: string;
  product: string;
  timeAgo: string;
}

// ── State ────────────────────────────────────────────
const currentToast = ref<ToastData | null>(null);
const isVisible    = ref(false);

// ── Helpers ──────────────────────────────────────────
const ORDERS_KEY = 'vendpro_recent_orders_public';
const MAX_STORED = 20;

interface StoredOrder {
  name: string;
  city: string;
  product: string;
  ts: number;
}

function loadStoredOrders(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveOrder(order: StoredOrder) {
  try {
    const list = loadStoredOrders();
    list.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
  } catch { /* ignore */ }
}

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)  return 'Hace unos segundos';
  if (diff < 120) return 'Hace 1 minuto';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 7200) return 'Hace 1 hora';
  return `Hace ${Math.floor(diff / 3600)} horas`;
}

// ── Show toast ───────────────────────────────────────
let hideTimer: any = null;

function showToast(order: StoredOrder) {
  currentToast.value = {
    id:      String(order.ts),
    name:    order.name,
    city:    order.city,
    product: order.product,
    timeAgo: relativeTime(order.ts),
  };
  isVisible.value = true;
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { isVisible.value = false; }, 6500);
}

// ── Receive real-time order from same tab ─────────────
function onRealOrder(e: Event) {
  const d = (e as CustomEvent).detail;
  if (!d) return;

  const order: StoredOrder = {
    name:    d.customerName  || 'Un cliente',
    city:    d.city          || 'Colombia',
    product: d.productName   || 'Producto exclusivo',
    ts:      Date.now(),
  };

  saveOrder(order);
  showToast(order);
}

// ── Periodic display of recent orders ────────────────
// Cycles through stored orders so other visitors see social proof
let cycleTimer: any = null;
let cycleIndex = 0;

function startCycle() {
  // Wait 8s before first show, then every 18s pick a stored order
  cycleTimer = setTimeout(function tick() {
    const orders = loadStoredOrders();
    if (orders.length > 0 && !isVisible.value) {
      const order = orders[cycleIndex % orders.length];
      showToast(order);
      cycleIndex++;
    }
    cycleTimer = setTimeout(tick, 18_000);
  }, 8_000);
}

function stopCycle() {
  if (cycleTimer) { clearTimeout(cycleTimer); cycleTimer = null; }
  if (hideTimer)  { clearTimeout(hideTimer);  hideTimer  = null; }
}

onMounted(() => {
  window.addEventListener('store-whatsapp-order', onRealOrder);
  startCycle();
});

onUnmounted(() => {
  window.removeEventListener('store-whatsapp-order', onRealOrder);
  stopCycle();
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-400 ease-out"
    enter-from-class="translate-y-3 opacity-0 sm:translate-y-0 sm:-translate-x-3"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="isVisible && currentToast"
      class="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-[70] w-[300px] sm:w-[330px] select-none"
      role="status"
      aria-live="polite"
    >
      <!-- Card -->
      <div class="relative overflow-hidden rounded-2xl bg-[#100820]/95 backdrop-blur-md border border-white/10 shadow-2xl">
        <!-- Top accent bar -->
        <div class="h-[2px] w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#405de6]"></div>

        <div class="p-3.5 flex items-start gap-3">
          <!-- WA icon column -->
          <div class="relative shrink-0 mt-0.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#25d366]/20 to-[#128c7e]/20 border border-[#25d366]/25 flex items-center justify-center">
              <!-- WhatsApp SVG -->
              <svg viewBox="0 0 20 20" class="w-5 h-5" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="#25D366"/>
                <path d="M14.5 5.5A6.5 6.5 0 0 0 3.5 10a6.4 6.4 0 0 0 .87 3.24L3.5 16.5l3.33-.87A6.5 6.5 0 1 0 14.5 5.5Zm-4.5 10a5.4 5.4 0 0 1-2.76-.76l-.2-.12-2.06.52.54-2-.12-.2A5.38 5.38 0 1 1 10 15.5Zm2.98-4.06c-.16-.08-.96-.47-1.11-.52s-.26-.08-.37.08-.42.52-.51.63-.19.12-.35.04a4.45 4.45 0 0 1-2.22-1.94c-.17-.29.17-.27.48-.9a.3.3 0 0 0-.01-.29c-.04-.08-.37-.89-.5-1.21s-.27-.27-.37-.28h-.31a.6.6 0 0 0-.44.21A1.83 1.83 0 0 0 7.2 8.63a3.18 3.18 0 0 0 .66 1.68 7.28 7.28 0 0 0 2.79 2.46c1.04.35 1.04.24 1.23.22a1.66 1.66 0 0 0 1.1-.78 1.37 1.37 0 0 0 .1-.78c-.04-.06-.15-.1-.32-.17Z" fill="#fff"/>
              </svg>
            </div>
            <!-- Live dot -->
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-60"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-[#25d366] border-2 border-[#100820]"></span>
            </span>
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
              <span class="text-[10px] font-bold text-[#ee2a7b] uppercase tracking-widest">
                Pedido reciente
              </span>
              <span class="text-[10px] text-white/30 shrink-0">{{ currentToast.timeAgo }}</span>
            </div>

            <p class="text-xs text-white/85 font-semibold leading-snug truncate">
              <span class="text-white font-bold">{{ currentToast.name }}</span>
              <span class="text-white/50 font-normal"> · {{ currentToast.city }}</span>
            </p>

            <p class="text-[11px] text-white/45 truncate mt-0.5">
              Pidió:
              <span class="text-[#f9ce34]/80 font-semibold">{{ currentToast.product }}</span>
            </p>
          </div>

          <!-- Close -->
          <button
            type="button"
            @click="isVisible = false"
            class="shrink-0 p-1 text-white/25 hover:text-white/70 rounded-lg hover:bg-white/8 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
