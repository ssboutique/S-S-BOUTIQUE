import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Category, Order, Product, Store } from '../types/database';
import { storeService } from '../services/storeService';
import { productService } from '../services/productService';
import { useAuthStore } from './auth';

export const useAdminStore = defineStore('admin', () => {
  const currentStore = ref<Store | null>(null);
  const myStores = ref<Store[]>([]);
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const orders = ref<Order[]>([]);
  const isLoading = ref<boolean>(false);
  const isSaving = ref<boolean>(false);
  const feedbackMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null);

  const authStore = useAuthStore();

  // Metrics
  const metrics = computed(() => {
    const totalProducts = products.value.length;
    const activeProducts = products.value.filter((p) => p.is_available).length;
    const outOfStockProducts = products.value.filter((p) => p.stock === 0 || !p.is_available).length;
    const totalCategories = categories.value.length;
    const totalOrders = orders.value.length;

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalCategories,
      totalOrders,
    };
  });

  function setFeedback(type: 'success' | 'error', text: string) {
    feedbackMessage.value = { type, text };
    setTimeout(() => {
      if (feedbackMessage.value?.text === text) {
        feedbackMessage.value = null;
      }
    }, 4000);
  }

  async function loadAdminData() {
    isLoading.value = true;
    try {
      const ownerId = authStore.profile?.id || '00000000-0000-0000-0000-000000000001';
      const stores = await storeService.getMyStores(ownerId);
      myStores.value = stores;

      if (stores.length > 0) {
        currentStore.value = stores[0];
        await refreshStoreItems(stores[0].id);
      }
    } catch (e: any) {
      console.error('Error loading admin data:', e);
      setFeedback('error', 'Error al cargar los datos del panel');
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshStoreItems(storeId: string) {
    const [cats, prods, ords] = await Promise.all([
      productService.getCategories(storeId),
      productService.getProducts(storeId),
      productService.getOrders(storeId),
    ]);
    categories.value = cats;
    products.value = prods;
    orders.value = ords;
  }

  async function updateStore(updates: Partial<Store>) {
    if (!currentStore.value) return;
    isSaving.value = true;
    try {
      const updated = await storeService.updateStore(currentStore.value.id, updates);
      currentStore.value = updated;
      setFeedback('success', '¡Información de la tienda guardada correctamente!');
      return true;
    } catch (err: any) {
      setFeedback('error', err.message || 'Error al actualizar la tienda');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function saveCategory(categoryData: Partial<Category>) {
    if (!currentStore.value) return;
    isSaving.value = true;
    try {
      if (categoryData.id) {
        const updated = await productService.updateCategory(categoryData.id, categoryData);
        const idx = categories.value.findIndex((c) => c.id === updated.id);
        if (idx !== -1) categories.value[idx] = updated;
        setFeedback('success', 'Categoría actualizada exitosamente');
      } else {
        const created = await productService.createCategory({
          ...categoryData,
          store_id: currentStore.value.id,
          name: categoryData.name || 'Nueva Categoría',
          slug: categoryData.slug || 'nueva-categoria',
          order_index: categories.value.length + 1,
          is_active: categoryData.is_active ?? true,
          description: categoryData.description || null,
        });
        categories.value.push(created);
        setFeedback('success', '¡Agregaste una nueva categoría!');
      }
      return true;
    } catch (e: any) {
      setFeedback('error', e.message || 'Error al guardar la categoría');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteCategory(id: string) {
    isSaving.value = true;
    try {
      await productService.deleteCategory(id);
      categories.value = categories.value.filter((c) => c.id !== id);
      setFeedback('success', 'Categoría eliminada');
      return true;
    } catch (e: any) {
      setFeedback('error', e.message || 'Error al eliminar categoría');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function saveProduct(
    productData: Partial<Product>,
    imageUrls: string[],
    variantsList: Array<{ variant_type: string; variant_value: string; price_modifier?: number }>
  ) {
    if (!currentStore.value) return;
    isSaving.value = true;
    try {
      if (productData.id) {
        const updated = await productService.updateProduct(
          productData.id,
          productData,
          imageUrls,
          variantsList
        );
        const idx = products.value.findIndex((p) => p.id === updated.id);
        if (idx !== -1) products.value[idx] = updated;
        setFeedback('success', 'Producto actualizado correctamente');
      } else {
        const created = await productService.createProduct(
          {
            ...productData,
            store_id: currentStore.value.id,
            name: productData.name || 'Nuevo Producto',
            slug: productData.slug || 'nuevo-producto',
            price: Number(productData.price) || 0,
            original_price: productData.original_price ? Number(productData.original_price) : null,
            sku: productData.sku || null,
            stock: productData.stock !== undefined && productData.stock !== null ? Number(productData.stock) : null,
            is_available: productData.is_available ?? true,
            is_featured: productData.is_featured ?? false,
            order_index: products.value.length + 1,
            category_id: productData.category_id || null,
            description: productData.description || null,
          },
          imageUrls,
          variantsList
        );
        products.value.unshift(created);
        setFeedback('success', '¡Producto creado exitosamente!');
      }
      return true;
    } catch (e: any) {
      setFeedback('error', e.message || 'Error al guardar el producto');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function toggleProductAvailability(product: Product) {
    const nextState = !product.is_available;
    try {
      await productService.updateProduct(product.id, { is_available: nextState });
      product.is_available = nextState;
      setFeedback(
        'success',
        nextState ? 'El producto ahora está visible en tu tienda' : 'El producto ahora está oculto de tu tienda'
      );
    } catch (e: any) {
      setFeedback('error', 'No se pudo cambiar la visibilidad del producto');
    }
  }

  async function deleteProduct(id: string) {
    isSaving.value = true;
    try {
      await productService.deleteProduct(id);
      products.value = products.value.filter((p) => p.id !== id);
      setFeedback('success', 'Producto eliminado');
      return true;
    } catch (e: any) {
      setFeedback('error', e.message || 'Error al eliminar producto');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    currentStore,
    myStores,
    products,
    categories,
    orders,
    metrics,
    isLoading,
    isSaving,
    feedbackMessage,
    setFeedback,
    loadAdminData,
    refreshStoreItems,
    updateStore,
    saveCategory,
    deleteCategory,
    saveProduct,
    toggleProductAvailability,
    deleteProduct,
  };
});
