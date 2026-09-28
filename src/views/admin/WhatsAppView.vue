<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { whatsappService } from '@/services/whatsappService';
import { MessageCircle, Check, ShieldCheck, Sparkles, Send } from 'lucide-vue-next';

const adminStore = useAdminStore();

const whatsappNumber = ref('');

watch(
  () => adminStore.currentStore?.whatsapp_number,
  (val) => {
    if (val) whatsappNumber.value = val;
  },
  { immediate: true }
);

const sanitizedNumber = computed(() => {
  return whatsappService.sanitizePhoneNumber(whatsappNumber.value);
});

async function handleSave() {
  if (!whatsappNumber.value.trim()) return;
  await adminStore.updateStore({
    whatsapp_number: sanitizedNumber.value,
  });
}

function testWhatsAppLink() {
  const url = `https://wa.me/${sanitizedNumber.value}?text=Hola!%20Mensaje%20de%20prueba%20desde%20mi%20tienda%20digital.`;
  window.open(url, '_blank');
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-4xl">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Configuración de WhatsApp
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Configura el número al cual llegarán todos los pedidos del carrito
        </p>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="adminStore.isSaving"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
      >
        <Check class="w-4 h-4" />
        <span>{{ adminStore.isSaving ? 'Guardando...' : 'Guardar WhatsApp' }}</span>
      </button>
    </div>

    <!-- Phone Configuration Card -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <MessageCircle class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Número Receptor de Pedidos</h3>
          <p class="text-xs text-slate-500">Ingresa el número con el código de país (sin el signo + ni espacios)</p>
        </div>
      </div>

      <div class="max-w-md space-y-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Número de WhatsApp Comercial <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model="whatsappNumber"
            type="tel"
            placeholder="Ej: 573001234567"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-base font-bold text-slate-900 outline-none"
          />
        </div>
        <div class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
          <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Formato internacional limpio detectado: <strong class="text-slate-800 font-mono">+{{ sanitizedNumber }}</strong></span>
        </div>
      </div>

      <!-- Test Button -->
      <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
        <button
          type="button"
          @click="testWhatsAppLink"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200/60"
        >
          <Send class="w-3.5 h-3.5 text-emerald-600" />
          <span>Probar mi enlace de WhatsApp</span>
        </button>
      </div>
    </div>

    <!-- Live Template Message Preview -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-4">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-brand-500" />
        <span>Vista Previa del Mensaje que recibirás</span>
      </h3>
      <p class="text-xs text-slate-500">
        Así se estructura automáticamente cada pedido cuando un cliente lo confirma desde tu catálogo:
      </p>

      <div class="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs leading-relaxed max-w-lg shadow-inner border border-slate-800 whitespace-pre-wrap">
SOLICITUD DE PEDIDO
{{ adminStore.currentStore?.name?.toUpperCase() || 'S&S BOUTIQUE' }}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. *Camisa Lino Italiano Oversize*
   Cantidad: 2
   Detalles: Talla: M | Color: Blanco Crudo
   Precio: $ 180.000
   Subtotal: $ 360.000

2. *Sneakers Minimalistas en Cuero Nobuk*
   Cantidad: 1
   Detalles: Talla (EU): 41
   Precio: $ 320.000
   Subtotal: $ 320.000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Subtotal:* $ 680.000
*Total a Pagar:* $ 680.000

DATOS DE ENTREGA:
• Nombre: Juan Pérez
• Contacto: 300 123 4567
• Dirección: Calle 82 # 12-45

OBSERVACIONES:
Entregar preferiblemente en la tarde.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Pedido generado desde la tienda oficial_</div>
    </div>
  </div>
</template>
