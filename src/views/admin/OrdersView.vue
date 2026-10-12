<script setup lang="ts">
import { ref } from 'vue';
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
} from 'lucide-vue-next';

const adminStore = useAdminStore();

// ── Delete confirmation dialog ──────────────────────
const pendingDeleteId = ref<string | null>(null);
const isDeleting = ref(false);

function confirmDelete(orderId: string) {
  pendingDeleteId.value = orderId;
}

function cancelDelete() {
  pendingDeleteId.value = null;
}

async function executeDelete() {
  if (!pendingDeleteId.value) return;
  isDeleting.value = true;
  await adminStore.deleteOrder(pendingDeleteId.value);
  isDeleting.value = false;
  pendingDeleteId.value = null;
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pedidos Recibidos por WhatsApp
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historial de compras enviadas a tu WhatsApp desde el carrito de la tienda
        </p>
      </div>

      <div class="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-2">
        <MessageCircle class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>{{ adminStore.orders.length }} Pedidos Registrados</span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="adminStore.orders.length === 0"
      class="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft text-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
        <ShoppingBag class="w-8 h-8" />
      </div>
      <h3 class="font-bold text-slate-800 dark:text-white text-base">Aún no hay pedidos registrados</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
        Cada vez que un cliente complete el carrito y confirme su pedido hacia WhatsApp, quedará auditado aquí con sus datos de contacto.
      </p>
    </div>

    <!-- Orders grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div
        v-for="order in adminStore.orders"
        :key="order.id"
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-soft overflow-hidden flex flex-col"
      >
        <!-- Card header -->
        <div class="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
              #{{ order.id.slice(0, 8).toUpperCase() }}
            </span>
            <span class="text-[11px] bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
              WhatsApp Enviado
            </span>
          </div>
          <!-- Delete button -->
          <button
            type="button"
            @click="confirmDelete(order.id)"
            class="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            :title="`Eliminar pedido #${order.id.slice(0, 8)}`"
            aria-label="Eliminar pedido"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Card body -->
        <div class="px-5 py-4 flex-1 space-y-3">

          <!-- Customer info -->
          <div class="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div class="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <User class="w-4 h-4 text-brand-500 shrink-0" />
              <span class="truncate">{{ order.customer_name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-slate-400 shrink-0" />
              <a
                :href="`https://wa.me/${order.customer_phone.replace(/\D/g,'')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
              >
                {{ order.customer_phone }}
              </a>
            </div>
            <div v-if="order.customer_address" class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-slate-400 shrink-0" />
              <span class="truncate">{{ order.customer_address }}</span>
            </div>
            <div v-if="order.notes" class="text-slate-500 dark:text-slate-400 italic pt-0.5 pl-6">
              "{{ order.notes }}"
            </div>
          </div>

          <!-- Items list -->
          <div
            v-if="order.items && order.items.length > 0"
            class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1 text-xs"
          >
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="flex items-center justify-between text-slate-700 dark:text-slate-300 gap-2"
            >
              <span class="truncate">
                <strong class="text-slate-900 dark:text-white">{{ item.quantity }}×</strong>
                {{ item.product_name }}
              </span>
              <span class="font-semibold text-slate-900 dark:text-white shrink-0">
                {{ formatCurrency(item.subtotal, adminStore.currentStore?.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card footer: total -->
        <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total del Pedido</span>
          <span class="text-lg font-black text-slate-900 dark:text-white">
            {{ formatCurrency(order.total, adminStore.currentStore?.currency) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Confirm delete dialog ── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="pendingDeleteId"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        @click.self="cancelDelete"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="pendingDeleteId"
            class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-800 w-full max-w-sm p-6 space-y-4"
          >
            <!-- Icon + title -->
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-dialog-title" class="font-bold text-slate-900 dark:text-white text-base">
                  Eliminar pedido
                </h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Esta acción no se puede deshacer. El pedido será eliminado permanentemente del historial.
                </p>
              </div>
              <button
                type="button"
                @click="cancelDelete"
                class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg ml-auto shrink-0"
                aria-label="Cancelar"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="cancelDelete"
                class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                :disabled="isDeleting"
                @click="executeDelete"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-sm font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 class="w-4 h-4" />
                <span>{{ isDeleting ? 'Eliminando...' : 'Sí, eliminar' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>
