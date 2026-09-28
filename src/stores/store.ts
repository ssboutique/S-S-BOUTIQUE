import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Category, Product, Store } from '../types/database';
import { storeService } from '../services/storeService';
import { productService } from '../services/productService';

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
      if (!fetchedStore) {
        error.value = 'Esta tienda no está disponible o no existe.';
        store.value = null;
        return false;
      }

      store.value = fetchedStore;

      // Load categories and products concurrently
      const [cats, prods] = await Promise.all([
        productService.getCategories(fetchedStore.id),
        productService.getProducts(fetchedStore.id, undefined, true),
      ]);

      categories.value = cats.filter((c) => c.is_active);
      products.value = prods;
      return true;
    } catch (err: any) {
      console.error('Error loading store:', err);
      error.value = err.message || 'Error al cargar la tienda';
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
