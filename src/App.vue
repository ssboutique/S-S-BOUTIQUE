<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { initTheme } from '@/composables/useTheme';

const authStore = useAuthStore();

onMounted(async () => {
  initTheme();
  await authStore.initAuth();
});
</script>

<template>
  <router-view />
</template>
