<script setup lang="ts">
import { useAdminStore } from '@/stores/admin';
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next';

const adminStore = useAdminStore();
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="adminStore.feedbackMessage"
      class="fixed bottom-5 right-5 z-50 max-w-md rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-center gap-3"
      :class="
        adminStore.feedbackMessage.type === 'success'
          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
          : 'bg-rose-950/90 border-rose-500/30 text-rose-100'
      "
      role="alert"
      aria-live="polite"
    >
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        :class="
          adminStore.feedbackMessage.type === 'success'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/20 text-rose-400'
        "
      >
        <CheckCircle2 v-if="adminStore.feedbackMessage.type === 'success'" class="w-5 h-5" />
        <AlertCircle v-else class="w-5 h-5" />
      </div>

      <div class="flex-1 text-sm font-medium leading-tight">
        {{ adminStore.feedbackMessage.text }}
      </div>

      <button
        type="button"
        @click="adminStore.feedbackMessage = null"
        class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        aria-label="Cerrar notificación"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>
