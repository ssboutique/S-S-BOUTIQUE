<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { formatCurrency } from '@/utils/currency';
import {
  ShoppingBag,
  MessageCircle,
  MapPin,
  User,
  Trash2,
  AlertTriangle,
  X,
  Phone,
  CheckSquare,
  Square,
  History,
  RotateCcw,
  Clock,
} from 'lucide-vue-next';

const adminStore = useAdminStore();

// ── Tabs ────────────────────────────────────────────
type Tab = 'active' | 'history';
const activeTab = ref<Tab>('active');

// ── Archived orders (soft-delete via localStorage) ──
const ARCHIVE_KEY = 'vendpro_archived_orders';

interface ArchivedOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  notes?: string | null;
  total: number;
  items?: any[];
  archived_at: string; // ISO string
}

const archivedOrders = ref<ArchivedOrder[]>([]);

function loadArchived() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    archivedOrders.value = raw ? JSON.parse(raw) : [];
  } catch {
    archivedOrders.value = [];
  }
}

function saveArchived() {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archivedOrders.value));
}

onMounted(loadArchived);

// ── Selection ────────────────────────────────────────
const selected = ref<Set<string>>(new Set());

function toggleSelect(id: string) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

function toggleSelectAll() {
  const list = activeTab.value === 'active' ? adminStore.orders : archivedOrders.value;
  if (selected.value.size === list.length) {
    selected.value = new Set();
  } else {
    selected.value = new Set(list.map((o) => o.id));
  }
}

const allSelected = computed(() => {
  const list = activeTab.value === 'active' ? adminStore.orders : archivedOrders.value;
  return list.length > 0 && selected.value.size === list.length;
});

const someSelected = computed(() => selected.value.size > 0);

// ── Delete / Archive ─────────────────────────────────
const showConfirm = ref(false);
const isDeleting = ref(false);

function requestDelete() {
  if (!someSelected.value) return;
  showConfirm.value = true;
}

async function executeDelete() {
  isDeleting.value = true;
  if (activeTab.value === 'active') {
    // Archive the selected orders before removing
    const toArchive = adminStore.orders
      .filter((o) => selected.value.has(o.id))
      .map((o) => ({
        id: o.id,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        customer_address: o.customer_address,
        notes: o.notes,
        total: o.total,
        items: o.items,
        archived_at: new Date().toISOString(),
      }));
    archivedOrders.value = [...toArchive, ...archivedOrders.value];
    saveArchived();

    for (const id of selected.value) {
      await adminStore.deleteOrder(id);
    }
  } else {
    // Permanent delete from archive
    archivedOrders.value = archivedOrders.value.filter((o) => !selected.value.has(o.id));
    saveArchived();
  }
  selected.value = new Set();
  showConfirm.value = false;
  isDeleting.value = false;
}

function restoreSelected() {
  // Restore archived orders back to active (just remove from archive — admin store reloads from DB/localStorage)
  archivedOrders.value = archivedOrders.value.filter((o) => !selected.value.has(o.id));
  saveArchived();
  selected.value = new Set();
  // Refresh orders list
  if (adminStore.currentStore?.id) {
    adminStore.refreshStoreItems(adminStore.currentStore.id);
  }
}

// Switch tab clears selection
function switchTab(t: Tab) {
  activeTab.value = t;
  selected.value = new Set();
}

// Format archived date
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- ── Page Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pedidos por WhatsApp
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Selecciona pedidos con el checkbox para archivarlos o eliminarlos
        </p>
      </div>

      <div class="flex items-center gap-2">
        <div class="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-2">
          <MessageCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{{ adminStore.orders.length }} activos · {{ archivedOrders.length }} en historial</span>
        </div>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
      <button
        type="button"
        @click="switchTab('active')"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="activeTab === 'active'
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
      >
        <ShoppingBag class="w-4 h-4" />
        Activos
        <span
          v-if="adminStore.orders.length"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="activeTab === 'active' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
        >{{ adminStore.orders.length }}</span>
      </button>
      <button
        type="button"
        @click="switchTab('history')"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        :class="activeTab === 'history'
          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
      >
        <History class="w-4 h-4" />
        Historial
        <span
          v-if="archivedOrders.length"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="activeTab === 'history' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
        >{{ archivedOrders.length }}</span>
      </button>
    </div>

    <!-- ── Bulk action bar (shows when items selected) ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="someSelected"
        class="flex items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 rounded-2xl shadow-card"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="selected = new Set()"
            class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Deseleccionar todos"
          >
            <X class="w-4 h-4" />
          </button>
          <span class="text-sm font-bold text-slate-900 dark:text-white">
            {{ selected.size }} seleccionado{{ selected.size !== 1 ? 's' : '' }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Restore (only in history tab) -->
          <button
            v-if="activeTab === 'history'"
            type="button"
            @click="restoreSelected"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold transition-colors border border-brand-200/60 dark:border-brand-500/20"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Restaurar
          </button>

          <!-- Delete / Archive -->
          <button
            type="button"
            @click="requestDelete"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Trash2 class="w-3.5 h-3.5" />
            {{ activeTab === 'active' ? 'Archivar' : 'Eliminar definitivamente' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── ACTIVE ORDERS ── -->
    <template v-if="activeTab === 'active'">
      <!-- Empty -->
      <div
        v-if="adminStore.orders.length === 0"
        class="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-slate-800 dark:text-white text-base">Sin pedidos activos</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          Cuando un cliente confirme un pedido desde la tienda, aparecerá aquí.
        </p>
      </div>

      <!-- Select-all row -->
      <div v-else class="flex items-center gap-3 px-1">
        <button
          type="button"
          @click="toggleSelectAll"
          class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <CheckSquare v-if="allSelected" class="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <Square v-else class="w-4 h-4" />
          {{ allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div
          v-for="order in adminStore.orders"
          :key="order.id"
          class="bg-white dark:bg-slate-900 rounded-3xl border shadow-soft overflow-hidden flex flex-col transition-all cursor-pointer"
          :class="selected.has(order.id)
            ? 'border-brand-400 dark:border-brand-500 ring-2 ring-brand-400/30'
            : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
          @click="toggleSelect(order.id)"
        >
          <!-- Card header with checkbox -->
          <div class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <!-- Checkbox -->
              <div class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
                :class="selected.has(order.id) ? 'bg-brand-600 border-brand-600' : 'border-2 border-slate-300 dark:border-slate-600'"
              >
                <svg v-if="selected.has(order.id)" viewBox="0 0 12 10" class="w-3 h-3" fill="none">
                  <path d="M1 5L4.5 9L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                #{{ order.id.slice(0, 8).toUpperCase() }}
              </span>
            </div>
            <span class="text-[11px] bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
              Enviado
            </span>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 flex-1 space-y-3">
            <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <User class="w-4 h-4 text-brand-500 shrink-0" />
                <span class="truncate">{{ order.customer_name }}</span>
              </div>
              <div class="flex items-center gap-2" @click.stop>
                <Phone class="w-4 h-4 text-slate-400 shrink-0" />
                <a :href="`https://wa.me/${order.customer_phone.replace(/\D/g,'')}`" target="_blank" rel="noopener" class="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                  {{ order.customer_phone }}
                </a>
              </div>
              <div v-if="order.customer_address" class="flex items-center gap-2">
                <MapPin class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="truncate">{{ order.customer_address }}</span>
              </div>
              <p v-if="order.notes" class="italic text-slate-500 dark:text-slate-400 pl-6">"{{ order.notes }}"</p>
            </div>

            <div v-if="order.items?.length" class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1 text-xs">
              <div v-for="(item, idx) in order.items" :key="idx" class="flex items-center justify-between gap-2 text-slate-700 dark:text-slate-300">
                <span class="truncate"><strong class="text-slate-900 dark:text-white">{{ item.quantity }}×</strong> {{ item.product_name }}</span>
                <span class="font-semibold text-slate-900 dark:text-white shrink-0">{{ formatCurrency(item.subtotal, adminStore.currentStore?.currency) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
            <span class="text-lg font-black text-slate-900 dark:text-white">{{ formatCurrency(order.total, adminStore.currentStore?.currency) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── HISTORY TAB ── -->
    <template v-else>
      <!-- Empty -->
      <div
        v-if="archivedOrders.length === 0"
        class="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <History class="w-8 h-8" />
        </div>
        <h3 class="font-bold text-slate-800 dark:text-white text-base">Historial vacío</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          Los pedidos que archives desde la pestaña "Activos" aparecerán aquí.
        </p>
      </div>

      <!-- Select-all row -->
      <div v-else class="flex items-center gap-3 px-1">
        <button
          type="button"
          @click="toggleSelectAll"
          class="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <CheckSquare v-if="allSelected" class="w-4 h-4 text-rose-600" />
          <Square v-else class="w-4 h-4" />
          {{ allSelected ? 'Deseleccionar todos' : 'Seleccionar todos' }}
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div
          v-for="order in archivedOrders"
          :key="order.id"
          class="bg-white dark:bg-slate-900 rounded-3xl border shadow-soft overflow-hidden flex flex-col transition-all cursor-pointer opacity-75 hover:opacity-100"
          :class="selected.has(order.id)
            ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-400/30 opacity-100'
            : 'border-slate-200/70 dark:border-slate-800'"
          @click="toggleSelect(order.id)"
        >
          <div class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <div class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
                :class="selected.has(order.id) ? 'bg-rose-600 border-rose-600' : 'border-2 border-slate-300 dark:border-slate-600'"
              >
                <svg v-if="selected.has(order.id)" viewBox="0 0 12 10" class="w-3 h-3" fill="none">
                  <path d="M1 5L4.5 9L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                #{{ order.id.slice(0, 8).toUpperCase() }}
              </span>
            </div>
            <span class="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
              Archivado
            </span>
          </div>

          <div class="px-5 py-4 flex-1 space-y-2">
            <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <User class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="truncate">{{ order.customer_name }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs" @click.stop>
              <Phone class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a :href="`https://wa.me/${order.customer_phone.replace(/\D/g,'')}`" target="_blank" rel="noopener" class="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline">
                {{ order.customer_phone }}
              </a>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock class="w-3.5 h-3.5 shrink-0" />
              <span>Archivado el {{ formatDate(order.archived_at) }}</span>
            </div>
          </div>

          <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
            <span class="text-base font-black text-slate-500 dark:text-slate-400">{{ formatCurrency(order.total, adminStore.currentStore?.currency) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Confirmation dialog ── -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="showConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        @click.self="showConfirm = false"
      >
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
          <div v-if="showConfirm" class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-800 w-full max-w-sm p-6 space-y-4">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-slate-900 dark:text-white text-base">
                  {{ activeTab === 'active' ? 'Archivar pedidos' : 'Eliminar definitivamente' }}
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  <template v-if="activeTab === 'active'">
                    Se archivarán <strong>{{ selected.size }}</strong> pedido{{ selected.size !== 1 ? 's' : '' }}. Podrás restaurarlos desde la pestaña Historial.
                  </template>
                  <template v-else>
                    Se eliminarán permanentemente <strong>{{ selected.size }}</strong> pedido{{ selected.size !== 1 ? 's' : '' }}. Esta acción no se puede deshacer.
                  </template>
                </p>
              </div>
              <button type="button" @click="showConfirm = false" class="p-1 text-slate-400 hover:text-slate-700 rounded-lg shrink-0"><X class="w-4 h-4" /></button>
            </div>
            <div class="flex items-center justify-end gap-3">
              <button type="button" @click="showConfirm = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button type="button" :disabled="isDeleting" @click="executeDelete" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center gap-2">
                <Trash2 class="w-4 h-4" />
                {{ isDeleting ? 'Procesando...' : activeTab === 'active' ? 'Archivar' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>
