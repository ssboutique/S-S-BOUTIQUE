<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin';
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import AdminNavbar from '@/components/admin/AdminNavbar.vue';
import AdminMobileBottomNav from '@/components/admin/AdminMobileBottomNav.vue';
import ToastNotification from '@/components/ui/ToastNotification.vue';

const adminStore = useAdminStore();
const mobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

onMounted(() => {
  adminStore.loadAdminData();
});
</script>

<template>
  <div class="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
    <!-- Responsive Collapsible Sidebar -->
    <AdminSidebar
      :mobile-open="mobileSidebarOpen"
      :collapsed="isSidebarCollapsed"
      @close="mobileSidebarOpen = false"
      @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
    />

    <!-- Main Workspace -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      <AdminNavbar
        @toggle-sidebar="mobileSidebarOpen = true"
      />

      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
        <router-view />
      </main>

      <!-- Mobile App Bottom Navigation Bar -->
      <AdminMobileBottomNav
        @open-drawer="mobileSidebarOpen = true"
      />
    </div>

    <!-- Centralized Feedback Toast -->
    <ToastNotification />
  </div>
</template>
