import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { CartItem, CartTotals } from '../types/cart';
import type { Product } from '../types/database';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const currentStoreSlug = ref<string>('');
  const isOpen = ref<boolean>(false);

  // Helper to generate unique key based on productId and selected variant values
  function generateCartItemId(productId: string, variants: Record<string, string>): string {
    const sortedVariantStr = Object.keys(variants)
      .sort()
      .map((k) => `${k}:${variants[k]}`)
      .join('|');
    return `${productId}-${sortedVariantStr}`;
  }

  // Load from localStorage for specific store
  function setStoreContext(slug: string) {
    if (currentStoreSlug.value === slug) return;
    currentStoreSlug.value = slug;
    try {
      const stored = localStorage.getItem(`vendpro_cart_${slug}`);
      if (stored) {
        items.value = JSON.parse(stored);
      } else {
        items.value = [];
      }
    } catch {
      items.value = [];
    }
  }

  // Persist whenever items or store slug change
  watch(
    [items, currentStoreSlug],
    () => {
      if (!currentStoreSlug.value) return;
      try {
        localStorage.setItem(`vendpro_cart_${currentStoreSlug.value}`, JSON.stringify(items.value));
      } catch (e) {
        console.error('Failed saving cart to localStorage:', e);
      }
    },
    { deep: true }
  );

  // Computed Totals
  const totals = computed<CartTotals>(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let itemCount = 0;

    for (const item of items.value) {
      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;
      itemCount += item.quantity;

      if (item.product.original_price && item.product.original_price > item.price) {
        totalDiscount += (item.product.original_price - item.price) * item.quantity;
      }
    }

    return {
      subtotal,
      totalDiscount,
      total: subtotal,
      itemCount,
    };
  });

  function openCart() {
    isOpen.value = true;
  }

  function closeCart() {
    isOpen.value = false;
  }

  function toggleCart() {
    isOpen.value = !isOpen.value;
  }

  /**
   * Add a product with optional variants to the cart
   */
  function addItem(
    product: Product,
    quantity = 1,
    selectedVariants: Record<string, string> = {},
    priceModifier = 0
  ) {
    const finalPrice = Number(product.price) + Number(priceModifier);
    const cartItemId = generateCartItemId(product.id, selectedVariants);

    const existingIndex = items.value.findIndex((item) => item.id === cartItemId);
    const primaryImg = product.images?.find((img) => img.is_primary)?.image_url
      || product.images?.[0]?.image_url
      || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop';

    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity;
    } else {
      items.value.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: finalPrice,
        imageUrl: primaryImg,
        quantity,
        selectedVariants,
        product,
      });
    }

    // Auto open cart drawer for immediate user feedback
    isOpen.value = true;
  }

  function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    const target = items.value.find((i) => i.id === itemId);
    if (target) {
      target.quantity = newQuantity;
    }
  }

  function removeItem(itemId: string) {
    items.value = items.value.filter((i) => i.id !== itemId);
  }

  function clearCart() {
    items.value = [];
    if (currentStoreSlug.value) {
      localStorage.removeItem(`vendpro_cart_${currentStoreSlug.value}`);
    }
  }

  return {
    items,
    isOpen,
    currentStoreSlug,
    totals,
    setStoreContext,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
});
