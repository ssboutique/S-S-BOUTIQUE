import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Category, Product, Store } from '../types/database';
import { storeService } from '../services/storeService';
import { productService } from '../services/productService';
import { DEMO_STORE, DEMO_CATEGORIES, DEMO_PRODUCTS } from '../services/demoData';
import { isSupabaseConfigured } from '../services/supabase';

export const useStoreStore = defineStore('storefront', () => {
  const store = ref<Store | null>(null);
  const categories = ref<Category[]>([]);
  const products = ref<Product[]>([]);
  const selectedCategoryId = ref<string | null>(null);
  const searchQuery = ref<string>('');
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Filtered products based on search term and category
  const filteredProducts = computed(() => {
    let list = products.value.filter((p) => p.is_available);

    if (selectedCategoryId.value) {
      list = list.filter((p) => p.category_id === selectedCategoryId.value);
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return list;
  });

  const featuredProducts = computed(() => {
    return products.value.filter((p) => p.is_available && p.is_featured);
  });

  async function loadStoreBySlug(slug: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const fetchedStore = await storeService.getStoreBySlug(slug);

      // Si Supabase está configurado y no encontró la tienda → error real
      if (!fetchedStore && isSupabaseConfigured) {
        error.value = 'No se encontró la tienda en la base de datos.';
        return false;
      }

      // Modo demo sin Supabase → usar datos demo
      store.value = fetchedStore ?? { ...DEMO_STORE, slug };

      // Cargar categorías y productos directamente de Supabase
      const [cats, prods] = await Promise.all([
        productService.getCategories(store.value.id),
        productService.getProducts(store.value.id, undefined, true),
      ]);

      categories.value = cats.filter((c) => c.is_active);
      products.value = prods;
      return true;
    } catch (err: any) {
      console.error('[Store] Error loading store:', err);
      // Solo usar demo si Supabase NO está configurado
      if (!isSupabaseConfigured) {
        store.value = DEMO_STORE;
        categories.value = DEMO_CATEGORIES;
        products.value = DEMO_PRODUCTS;
        return true;
      }
      error.value = 'Error al cargar la tienda. Por favor recarga la página.';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function setSelectedCategory(categoryId: string | null) {
    selectedCategoryId.value = categoryId;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  return {
    store,
    categories,
    products,
    selectedCategoryId,
    searchQuery,
    isLoading,
    error,
    filteredProducts,
    featuredProducts,
    loadStoreBySlug,
    setSelectedCategory,
    setSearchQuery,
  };
});
