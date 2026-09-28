import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Profile } from '../types/database';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null);
  const isLoading = ref<boolean>(true);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!profile.value);
  const isSuperAdmin = computed(() => profile.value?.role === 'super_admin');
  const isStoreOwner = computed(() => profile.value?.role === 'store_owner' || isSuperAdmin.value);

  async function initAuth() {
    isLoading.value = true;
    error.value = null;
    try {
      profile.value = await authService.getCurrentProfile();
    } catch (err: any) {
      console.error('Failed to initialize auth:', err);
      error.value = err.message || 'Error al verificar sesión';
    } finally {
      isLoading.value = false;
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await authService.signIn(email, password);
      if (res.error) throw res.error;
      profile.value = res.profile;
      return true;
    } catch (err: any) {
      error.value = err.message || 'Credenciales incorrectas';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string, fullName: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await authService.signUp(email, password, fullName);
      if (res.error) throw res.error;
      profile.value = res.profile;
      return true;
    } catch (err: any) {
      error.value = err.message || 'Error al crear la cuenta';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    await authService.signOut();
    profile.value = null;
  }

  return {
    profile,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    isStoreOwner,
    initAuth,
    login,
    register,
    logout,
  };
});
