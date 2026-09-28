<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useStoreStore } from '@/stores/store';
import { whatsappService } from '@/services/whatsappService';
import { productService } from '@/services/productService';
import { formatCurrency } from '@/utils/currency';
import confetti from 'canvas-confetti';
import { X, MessageCircle, ShieldCheck, CheckCircle2 } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const cartStore = useCartStore();
const storeStore = useStoreStore();

const form = reactive({
  name: '',
  phone: '',
  address: '',
  notes: '',
});

const isSubmitting = ref(false);
const orderCompleted = ref(false);
const formErrors = reactive<Record<string, string>>({});

function validateForm(): boolean {
  formErrors.name = '';
  formErrors.phone = '';

  let isValid = true;
  if (!form.name.trim()) {
    formErrors.name = 'Por favor ingresa tu nombre completo';
    isValid = false;
  }
  if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) {
    formErrors.phone = 'Por favor ingresa un número de teléfono válido';
    isValid = false;
  }

  return isValid;
}

async function handleConfirmOrder() {
  if (!validateForm()) return;
  if (!storeStore.store) return;

  isSubmitting.value = true;

  try {
    const payload = {
      store: storeStore.store,
      items: cartStore.items,
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      },
      subtotal: cartStore.totals.subtotal,
      total: cartStore.totals.total,
    };

    // 1. Audit order in Supabase / Local storage
    const orderItems = cartStore.items.map((it) => ({
      product_id: it.productId,
      product_name: it.name,
      quantity: it.quantity,
      unit_price: it.price,
      selected_variants: it.selectedVariants,
      subtotal: it.price * it.quantity,
    }));

    await productService.recordOrder(
      {
        store_id: storeStore.store.id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        subtotal: cartStore.totals.subtotal,
        total: cartStore.totals.total,
        status: 'whatsapp_sent',
      },
      orderItems
    );

    // 2. Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored if canvas blocked
    }

    orderCompleted.value = true;

    // 3. Open WhatsApp after short delay so user sees confirmation
    setTimeout(() => {
      whatsappService.sendOrderViaWhatsApp(payload);
      cartStore.clearCart();
    }, 700);
  } catch (error) {
    console.error('Error submitting order:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !orderCompleted.value) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby="checkout-title"
    @click.self="emit('close')"
  >
    <div class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <MessageCircle class="w-5 h-5" />
          </div>
          <div>
            <h2 id="checkout-title" class="font-extrabold text-lg text-slate-900 leading-tight">
              Finalizar Pedido
            </h2>
            <p class="text-xs text-slate-500">
              Confirmación directa y segura vía WhatsApp
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Cerrar ventana de checkout"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Success Screen -->
      <div v-if="orderCompleted" class="p-8 text-center space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-10 h-10 animate-bounce" />
        </div>
        <h3 class="text-xl font-bold text-slate-900">¡Pedido Enviado a WhatsApp!</h3>
        <p class="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Tu mensaje fue generado con éxito. Continúa la conversación con la tienda en WhatsApp para coordinar el pago y la entrega.
        </p>
        <button
          type="button"
          @click="emit('close')"
          class="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm transition-all hover:bg-slate-800"
        >
          Entendido
        </button>
      </div>

      <!-- Form & Order Summary -->
      <form v-else @submit.prevent="handleConfirmOrder" class="p-6 space-y-5">
        <!-- Customer Inputs -->
        <div class="space-y-3.5">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Tus Datos de Contacto
          </h3>

          <div>
            <label for="customer-name" class="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo <span class="text-rose-500">*</span>
            </label>
            <input
              id="customer-name"
              v-model="form.name"
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              class="w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all"
              :class="formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'"
            />
            <span v-if="formErrors.name" class="text-xs text-rose-500 mt-1 block">{{ formErrors.name }}</span>
          </div>

          <div>
            <label for="customer-phone" class="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono o WhatsApp <span class="text-rose-500">*</span>
            </label>
            <input
              id="customer-phone"
              v-model="form.phone"
              type="tel"
              required
              placeholder="Ej: 300 123 4567"
              class="w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all"
              :class="formErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'"
            />
            <span v-if="formErrors.phone" class="text-xs text-rose-500 mt-1 block">{{ formErrors.phone }}</span>
          </div>

          <div>
            <label for="customer-address" class="block text-xs font-semibold text-slate-700 mb-1">
              Dirección o Barrio (Opcional para envíos)
            </label>
            <input
              id="customer-address"
              v-model="form.address"
              type="text"
              placeholder="Ej: Calle 45 # 12-34, Apto 201"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none transition-all"
            />
          </div>

          <div>
            <label for="customer-notes" class="block text-xs font-semibold text-slate-700 mb-1">
              Notas u Observaciones (Opcional)
            </label>
            <textarea
              id="customer-notes"
              v-model="form.notes"
              rows="2"
              placeholder="Ej: Entregar en horario de la tarde..."
              class="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm text-slate-900 outline-none transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Order Summary Box -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200/60">
            <span>Resumen del Pedido</span>
            <span>{{ cartStore.totals.itemCount }} productos</span>
          </div>

          <div class="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-600 py-1">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="py-1.5 flex items-center justify-between gap-2"
            >
              <div class="truncate">
                <span class="font-bold text-slate-900">{{ item.quantity }}x</span>
                {{ item.name }}
                <span v-if="Object.keys(item.selectedVariants).length > 0" class="text-slate-400">
                  ({{ Object.values(item.selectedVariants).join(', ') }})
                </span>
              </div>
              <span class="font-semibold text-slate-800 shrink-0">
                {{ formatCurrency(item.price * item.quantity, storeStore.store?.currency) }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200/60">
            <span>Total a Pagar:</span>
            <span class="text-base text-brand-600">
              {{ formatCurrency(cartStore.totals.total, storeStore.store?.currency) }}
            </span>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-glow active:scale-98"
          >
            <MessageCircle class="w-5 h-5" />
            <span>{{ isSubmitting ? 'Generando Pedido...' : 'Confirmar Pedido por WhatsApp' }}</span>
          </button>
          <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-2.5">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
            <span>No requieres registrarte ni ingresar tarjetas de crédito</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
