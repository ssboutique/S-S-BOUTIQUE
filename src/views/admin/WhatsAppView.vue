<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { whatsappService } from '@/services/whatsappService';
import { MessageCircle, Check, ShieldCheck, Sparkles, Send, FileText, RotateCcw } from 'lucide-vue-next';

const adminStore = useAdminStore();

// ── Phone number ─────────────────────────────────────────────────────────────
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

// ── Template editor ───────────────────────────────────────────────────────────
const DEFAULT_TEMPLATE = `🛍️ NUEVO PEDIDO — {{TIENDA}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---ITEMS---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Total a Pagar:* {{TOTAL}}

👤 DATOS DE ENTREGA:
• Nombre: {{NOMBRE}}
• Contacto: {{TELEFONO}}
• Dirección: {{DIRECCION}}

📝 OBSERVACIONES:
{{NOTAS}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Pedido recibido desde la tienda oficial de {{TIENDA}}_`;

const messageTemplate = ref<string>(
  adminStore.currentStore?.theme_settings?.whatsapp_order_template?.trim()
    ? adminStore.currentStore.theme_settings.whatsapp_order_template
    : DEFAULT_TEMPLATE
);

// Re-sync if store loads after mount
watch(
  () => adminStore.currentStore?.theme_settings?.whatsapp_order_template,
  (val) => {
    if (val && val.trim()) {
      messageTemplate.value = val;
    }
  }
);

const templateTextareaRef = ref<HTMLTextAreaElement | null>(null);

const TEMPLATE_VARS = [
  '{{TIENDA}}', '{{NOMBRE}}', '{{TELEFONO}}', '{{DIRECCION}}',
  '{{TOTAL}}', '{{SUBTOTAL}}', '{{NOTAS}}', '{{FECHA}}'
];

function insertVariable(variable: string) {
  const textarea = templateTextareaRef.value;
  if (!textarea) {
    messageTemplate.value += variable;
    return;
  }
  const start = textarea.selectionStart ?? messageTemplate.value.length;
  const end = textarea.selectionEnd ?? start;
  const before = messageTemplate.value.slice(0, start);
  const after = messageTemplate.value.slice(end);
  messageTemplate.value = before + variable + after;

  nextTick(() => {
    textarea.focus();
    const cursor = start + variable.length;
    textarea.setSelectionRange(cursor, cursor);
  });
}

// ── Live preview ──────────────────────────────────────────────────────────────
const SAMPLE_ITEMS = `1. *Producto Ejemplo*
   Cantidad: 2
   Precio: $75,000
   Subtotal: $150,000`;

function getNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const previewText = computed(() => {
  const SEPARATOR = '---ITEMS---';
  const storeName = adminStore.currentStore?.name || 'S&S BOUTIQUE';
  let tpl = messageTemplate.value;

  tpl = tpl
    .replace(/\{\{TIENDA\}\}/g, storeName)
    .replace(/\{\{NOMBRE\}\}/g, 'Juan Pérez')
    .replace(/\{\{TELEFONO\}\}/g, '300 123 4567')
    .replace(/\{\{DIRECCION\}\}/g, 'Calle 123 #45-67, Bogotá')
    .replace(/\{\{TOTAL\}\}/g, '$150,000')
    .replace(/\{\{SUBTOTAL\}\}/g, '$150,000')
    .replace(/\{\{NOTAS\}\}/g, 'Por favor entregar en la tarde')
    .replace(/\{\{FECHA\}\}/g, getNow());

  if (tpl.includes(SEPARATOR)) {
    const parts = tpl.split(SEPARATOR);
    return `${parts[0]}\n${SAMPLE_ITEMS}\n${parts[1]}`;
  }
  return `${tpl}\n\n${SAMPLE_ITEMS}`;
});

// ── Template save / restore ───────────────────────────────────────────────────
const templateSaveStatus = ref<'idle' | 'saving' | 'saved' | 'restored'>('idle');

async function saveTemplate() {
  templateSaveStatus.value = 'saving';
  const currentThemeSettings = { ...(adminStore.currentStore?.theme_settings ?? {}) };
  await adminStore.updateStore({
    theme_settings: { ...currentThemeSettings, whatsapp_order_template: messageTemplate.value },
  });
  templateSaveStatus.value = 'saved';
  setTimeout(() => { templateSaveStatus.value = 'idle'; }, 2500);
}

async function restoreDefaultTemplate() {
  messageTemplate.value = DEFAULT_TEMPLATE;
  const currentThemeSettings = { ...(adminStore.currentStore?.theme_settings ?? {}) };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { whatsapp_order_template: _removed, ...rest } = currentThemeSettings as Record<string, unknown>;
  templateSaveStatus.value = 'saving';
  await adminStore.updateStore({ theme_settings: rest as typeof currentThemeSettings });
  templateSaveStatus.value = 'restored';
  setTimeout(() => { templateSaveStatus.value = 'idle'; }, 2500);
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
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95 self-start sm:self-auto"
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

    <!-- ── Template Editor ─────────────────────────────────────────────────── -->
    <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-soft space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
          <FileText class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Plantilla del Mensaje de Pedido</h3>
          <p class="text-xs text-slate-500">
            Personaliza el mensaje que reciben tus clientes al confirmar un pedido por WhatsApp.
            Usa <code class="bg-slate-100 px-1 rounded text-fuchsia-700 font-mono">---ITEMS---</code>
            para indicar dónde se insertan los productos.
          </p>
        </div>
      </div>

      <!-- Variable chips -->
      <div class="space-y-2">
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Variables disponibles — haz clic para insertar</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="v in TEMPLATE_VARS"
            :key="v"
            type="button"
            @click="insertVariable(v)"
            class="px-2.5 py-1 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 font-mono text-[11px] font-bold border border-fuchsia-200/60 hover:border-fuchsia-300 transition-all active:scale-95 cursor-pointer select-none"
          >
            {{ v }}
          </button>
          <!-- special separator chip -->
          <button
            type="button"
            @click="insertVariable('---ITEMS---')"
            class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200/60 hover:border-emerald-300 transition-all active:scale-95 cursor-pointer select-none"
          >
            ---ITEMS---
          </button>
        </div>
      </div>

      <!-- Textarea -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Editor de plantilla
        </label>
        <textarea
          ref="templateTextareaRef"
          v-model="messageTemplate"
          rows="16"
          spellcheck="false"
          class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y min-h-[16rem] shadow-inner"
          placeholder="Escribe aquí tu plantilla de mensaje…"
        ></textarea>
      </div>

      <!-- Live preview -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-emerald-600" />
          <p class="text-xs font-bold text-slate-700 uppercase tracking-wider">Vista previa del mensaje</p>
        </div>
        <div class="bg-[#e5ddd5] p-4 rounded-2xl border border-slate-200/70 shadow-inner">
          <!-- WhatsApp-style bubble -->
          <div
            class="bg-white rounded-2xl rounded-tl-sm px-4 py-3 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap break-words shadow max-w-full border-l-4 border-emerald-400"
          >{{ previewText }}</div>
        </div>
      </div>

      <!-- Save / Restore actions -->
      <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <button
          type="button"
          @click="saveTemplate"
          :disabled="templateSaveStatus === 'saving'"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-glow transition-all active:scale-95 disabled:opacity-60"
        >
          <Check class="w-4 h-4" />
          <span>{{ templateSaveStatus === 'saving' ? 'Guardando...' : 'Guardar Plantilla' }}</span>
        </button>

        <button
          type="button"
          @click="restoreDefaultTemplate"
          :disabled="templateSaveStatus === 'saving'"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all active:scale-95 border border-slate-200/80 disabled:opacity-60"
        >
          <RotateCcw class="w-4 h-4" />
          <span>Restaurar por Defecto</span>
        </button>

        <!-- Inline feedback -->
        <transition name="fade">
          <span
            v-if="templateSaveStatus === 'saved'"
            class="text-xs font-bold text-emerald-600 flex items-center gap-1"
          >
            <Check class="w-3.5 h-3.5" /> Plantilla guardada correctamente
          </span>
          <span
            v-else-if="templateSaveStatus === 'restored'"
            class="text-xs font-bold text-fuchsia-600 flex items-center gap-1"
          >
            <RotateCcw class="w-3.5 h-3.5" /> Plantilla restaurada al diseño por defecto
          </span>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
