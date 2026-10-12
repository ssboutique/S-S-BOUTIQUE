<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { whatsappService } from '@/services/whatsappService';
import { MessageCircle, Check, ShieldCheck, Sparkles, Send } from 'lucide-vue-next';

const adminStore    = useAdminStore();
const whatsappNumber = ref('');

watch(() => adminStore.currentStore?.whatsapp_number, v => { if (v) whatsappNumber.value = v; }, { immediate: true });

const sanitizedNumber = computed(() => whatsappService.sanitizePhoneNumber(whatsappNumber.value));

async function handleSave() {
  if (!whatsappNumber.value.trim()) return;
  await adminStore.updateStore({ whatsapp_number: sanitizedNumber.value });
}

function testWhatsAppLink() {
  const url = `https://wa.me/${sanitizedNumber.value}?text=Hola!%20Mensaje%20de%20prueba%20desde%20mi%20tienda%20digital.`;
  window.open(url, '_blank');
}
</script>

<template>
  <div class="space-y-6 animate-fade-in max-w-3xl">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="ad-page-title">Canal WhatsApp</h1>
        <p class="ad-page-subtitle">Configura el número al cual llegarán todos los pedidos del carrito</p>
      </div>
      <button type="button" @click="handleSave" :disabled="adminStore.isSaving" class="ad-btn-primary self-start sm:self-auto">
        <Check class="w-4 h-4" aria-hidden="true" />
        {{ adminStore.isSaving ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>

    <!-- Phone card -->
    <div class="ad-card space-y-5">
      <div class="ad-card-header" style="display:flex;align-items:center;gap:12px">
        <div class="ad-icon-badge" style="background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.2)">
          <MessageCircle class="w-5 h-5" style="color:#34d399" aria-hidden="true" />
        </div>
        <div>
          <p class="ad-section-title">Número Receptor de Pedidos</p>
          <p style="font-size:12px;color:var(--ad-text-3);margin:2px 0 0">Ingresa el número con código de país, sin espacios ni +</p>
        </div>
      </div>

      <div style="max-width:420px;display:flex;flex-direction:column;gap:6px">
        <label class="ad-label" for="wa-number">Número de WhatsApp comercial <span style="color:#f87171">*</span></label>
        <input
          id="wa-number"
          v-model="whatsappNumber"
          type="tel"
          placeholder="573001234567"
          class="ad-input"
          style="font-size:16px;font-weight:800;letter-spacing:1px"
        />
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ad-text-3)">
          <ShieldCheck class="w-3.5 h-3.5" style="color:#34d399;flex-shrink:0" aria-hidden="true" />
          Detectado: <strong style="font-family:monospace;color:var(--ad-text-2)">+{{ sanitizedNumber }}</strong>
        </div>
      </div>

      <div style="padding-top:16px;border-top:1px solid var(--ad-border)">
        <button type="button" @click="testWhatsAppLink" class="ad-btn-ghost">
          <Send class="w-3.5 h-3.5" aria-hidden="true" />
          Probar enlace de WhatsApp
        </button>
      </div>
    </div>

    <!-- Preview card -->
    <div class="ad-card space-y-4">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <Sparkles class="w-4 h-4" style="color:#ee2a7b" aria-hidden="true" />
        <p class="ad-section-title">Vista previa del mensaje que recibirás</p>
      </div>
      <p style="font-size:12px;color:var(--ad-text-3);margin:0">
        Así se estructura automáticamente cada pedido cuando un cliente lo confirma desde tu catálogo:
      </p>

      <div style="background:var(--ad-surface-2);border:1px solid var(--ad-border);border-radius:16px;padding:20px;font-family:monospace;font-size:12px;line-height:1.7;color:var(--ad-text);white-space:pre-wrap;overflow-x:auto">SOLICITUD DE PEDIDO
{{ adminStore.currentStore?.name?.toUpperCase() || 'S&S BOUTIQUE' }}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. *Camisa Lino Italiano Oversize*
   Cantidad: 2
   Detalles: Talla: M | Color: Blanco Crudo
   Precio: $ 180.000
   Subtotal: $ 360.000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Total a Pagar:* $ 360.000

DATOS DE ENTREGA:
• Nombre: Juan Pérez
• Contacto: 300 123 4567
• Dirección: Calle 82 # 12-45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Pedido generado desde la tienda oficial_</div>
    </div>
  </div>
</template>
