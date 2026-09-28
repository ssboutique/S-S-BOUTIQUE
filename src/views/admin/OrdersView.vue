<script setup lang="ts">
import { useAdminStore } from '@/stores/admin';
import { formatCurrency } from '@/utils/currency';
import { ShoppingBag, MessageCircle, Clock, MapPin, User } from 'lucide-vue-next';

const adminStore = useAdminStore();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Pedidos Recibidos por WhatsApp
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Historial de compras enviadas a tu WhatsApp desde el carrito de la tienda
        </p>
      </div>

      <div class="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-xl text-xs font-bold flex items-center gap-2">
        <MessageCircle class="w-4 h-4 text-emerald-600" />
        <span>{{ adminStore.orders.length }} Pedidos Registrados</span>
      </div>
    </div>

    <!-- Orders List / Empty -->
    <div v-if="adminStore.orders.length === 0" class="bg-white p-12 rounded-3xl border border-slate-200/70 shadow-soft text-center">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <ShoppingBag class="w-8 h-8" />
      </div>
      <h3 class="font-bold text-slate-800 text-base">Aún no hay pedidos registrados</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
        Cada vez que un cliente complete el carrito y confirme su pedido hacia WhatsApp, quedará auditado aquí con sus datos de contacto.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <div
        v-for="order in adminStore.orders"
        :key="order.id"
        class="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-soft flex flex-col justify-between gap-4"
      >
        <div>
          <!-- Header: Order ID & Date -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <span class="text-xs font-bold text-slate-400 font-mono">
              #{{ order.id.slice(0, 8) }}
            </span>
            <span class="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
              WhatsApp Enviado
            </span>
          </div>

          <!-- Customer details -->
          <div class="space-y-1.5 py-3 text-xs text-slate-600">
            <div class="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <User class="w-4 h-4 text-brand-600" />
              <span>{{ order.customer_name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MessageCircle class="w-4 h-4 text-slate-400" />
              <a :href="`https://wa.me/${order.customer_phone}`" target="_blank" class="hover:underline text-emerald-700 font-semibold">
                {{ order.customer_phone }}
              </a>
            </div>
            <div v-if="order.customer_address" class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-slate-400" />
              <span>{{ order.customer_address }}</span>
            </div>
            <div v-if="order.notes" class="text-slate-500 italic pt-1">
              "{{ order.notes }}"
            </div>
          </div>

          <!-- Item list breakdown -->
          <div v-if="order.items && order.items.length > 0" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <div
              v-for="(item, idx) in order.items"
              :key="idx"
              class="flex items-center justify-between text-slate-700"
            >
              <span class="truncate">
                <strong class="text-slate-900">{{ item.quantity }}x</strong> {{ item.product_name }}
              </span>
              <span class="font-semibold text-slate-900 shrink-0">
                {{ formatCurrency(item.subtotal, adminStore.currentStore?.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Total footer -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total del Pedido:</span>
          <span class="text-lg font-black text-slate-900">
            {{ formatCurrency(order.total, adminStore.currentStore?.currency) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
