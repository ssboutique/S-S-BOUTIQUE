<script setup lang="ts">
import { useStoreStore } from '@/stores/store';
import { Layers } from 'lucide-vue-next';

const storeStore = useStoreStore();
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <!-- "Todos" Button -->
      <button
        type="button"
        @click="storeStore.setSelectedCategory(null)"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 border"
        :class="
          storeStore.selectedCategoryId === null
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80 shadow-soft'
        "
        aria-label="Ver todos los productos"
      >
        <Layers class="w-4 h-4" />
        <span>Todos</span>
        <span
          class="text-[11px] px-1.5 py-0.5 rounded-full"
          :class="storeStore.selectedCategoryId === null ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'"
        >
          {{ storeStore.products.filter(p => p.is_available).length }}
        </span>
      </button>

      <!-- Category Pills -->
      <button
        v-for="cat in storeStore.categories"
        :key="cat.id"
        type="button"
        @click="storeStore.setSelectedCategory(cat.id)"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 border"
        :class="
          storeStore.selectedCategoryId === cat.id
            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80 shadow-soft'
        "
      >
        <span>{{ cat.name }}</span>
        <span
          class="text-[11px] px-1.5 py-0.5 rounded-full"
          :class="storeStore.selectedCategoryId === cat.id ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'"
        >
          {{ storeStore.products.filter(p => p.category_id === cat.id && p.is_available).length }}
        </span>
      </button>
    </div>
  </div>
</template>
