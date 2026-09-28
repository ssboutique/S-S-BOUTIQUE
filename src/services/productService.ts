import type { Category, Product, ProductImage, ProductVariant, Order, OrderItem } from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from './demoData';

const LOCAL_CATS_KEY = 'vendpro_categories';
const LOCAL_PRODS_KEY = 'vendpro_products';
const LOCAL_ORDERS_KEY = 'vendpro_orders';

// Category local storage helpers
function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(DEMO_CATEGORIES));
      return DEMO_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_CATEGORIES;
  }
}

function saveStoredCategories(cats: Category[]): void {
  try {
    localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error('Error saving categories to localStorage:', e);
  }
}

// Product local storage helpers
function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PRODS_KEY, JSON.stringify(DEMO_PRODUCTS));
      return DEMO_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_PRODUCTS;
  }
}

function saveStoredProducts(prods: Product[]): void {
  try {
    localStorage.setItem(LOCAL_PRODS_KEY, JSON.stringify(prods));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
}

// Orders local storage helpers
function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
}

export const productService = {
  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(storeId: string): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data as Category[];
    }

    const cats = getStoredCategories();
    return cats.filter((c) => c.store_id === storeId).sort((a, b) => a.order_index - b.order_index);
  },

  async createCategory(cat: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .insert([cat])
        .select()
        .single();

      if (error) throw new Error('No se pudo crear la categoría.');
      return data as Category;
    }

    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const cats = getStoredCategories();
    cats.push(newCat);
    saveStoredCategories(cats);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error('No se pudo actualizar la categoría.');
      return data as Category;
    }

    const cats = getStoredCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Categoría no encontrada');
    cats[idx] = { ...cats[idx], ...updates, updated_at: new Date().toISOString() };
    saveStoredCategories(cats);
    return cats[idx];
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar la categoría.');
      return;
    }

    const cats = getStoredCategories().filter((c) => c.id !== id);
    saveStoredCategories(cats);
  },

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(storeId: string, categoryId?: string, onlyAvailable = false): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('store_id', storeId)
        .order('order_index', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (onlyAvailable) {
        query = query.eq('is_available', true);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return [];
      }
      return data as Product[];
    }

    let prods = getStoredProducts().filter((p) => p.store_id === storeId);
    if (categoryId) {
      prods = prods.filter((p) => p.category_id === categoryId);
    }
    if (onlyAvailable) {
      prods = prods.filter((p) => p.is_available);
    }
    return prods.sort((a, b) => a.order_index - b.order_index);
  },

  async getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('store_id', storeId)
        .eq('slug', slug)
        .single();

      if (error) return null;
      return data as Product;
    }

    const prods = getStoredProducts();
    return prods.find((p) => p.store_id === storeId && p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq('id', id)
        .single();

      if (error) return null;
      return data as Product;
    }

    const prods = getStoredProducts();
    return prods.find((p) => p.id === id) || null;
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
    imageUrls: string[] = [],
    variantsList: Array<{ variant_type: string; variant_value: string; price_modifier?: number }> = []
  ): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data: newProd, error: prodErr } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (prodErr || !newProd) throw new Error('No se pudo crear el producto.');

      // Insert images
      if (imageUrls.length > 0) {
        const imageRows = imageUrls.map((url, idx) => ({
          product_id: newProd.id,
          image_url: url,
          is_primary: idx === 0,
          order_index: idx + 1,
        }));
        await supabase.from('product_images').insert(imageRows);
      }

      // Insert variants
      if (variantsList.length > 0) {
        const variantRows = variantsList.map((v, idx) => ({
          product_id: newProd.id,
          variant_type: v.variant_type,
          variant_value: v.variant_value,
          price_modifier: v.price_modifier || 0,
          is_available: true,
          order_index: idx + 1,
        }));
        await supabase.from('product_variants').insert(variantRows);
      }

      return (await this.getProductById(newProd.id)) as Product;
    }

    const newId = `prod-${Date.now()}`;
    const newImages: ProductImage[] = imageUrls.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      product_id: newId,
      image_url: url,
      is_primary: idx === 0,
      order_index: idx + 1,
      created_at: new Date().toISOString(),
    }));

    const newVariants: ProductVariant[] = variantsList.map((v, idx) => ({
      id: `var-${Date.now()}-${idx}`,
      product_id: newId,
      variant_type: v.variant_type,
      variant_value: v.variant_value,
      price_modifier: v.price_modifier || 0,
      stock: null,
      is_available: true,
      order_index: idx + 1,
      created_at: new Date().toISOString(),
    }));

    const created: Product = {
      ...productData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: newImages,
      variants: newVariants,
    };

    const prods = getStoredProducts();
    prods.unshift(created);
    saveStoredProducts(prods);
    return created;
  },

  async updateProduct(
    id: string,
    updates: Partial<Product>,
    imageUrls?: string[],
    variantsList?: Array<{ variant_type: string; variant_value: string; price_modifier?: number }>
  ): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw new Error('No se pudo actualizar el producto.');

      if (imageUrls !== undefined) {
        await supabase.from('product_images').delete().eq('product_id', id);
        if (imageUrls.length > 0) {
          const imageRows = imageUrls.map((url, idx) => ({
            product_id: id,
            image_url: url,
            is_primary: idx === 0,
            order_index: idx + 1,
          }));
          await supabase.from('product_images').insert(imageRows);
        }
      }

      if (variantsList !== undefined) {
        await supabase.from('product_variants').delete().eq('product_id', id);
        if (variantsList.length > 0) {
          const variantRows = variantsList.map((v, idx) => ({
            product_id: id,
            variant_type: v.variant_type,
            variant_value: v.variant_value,
            price_modifier: v.price_modifier || 0,
            is_available: true,
            order_index: idx + 1,
          }));
          await supabase.from('product_variants').insert(variantRows);
        }
      }

      return (await this.getProductById(id)) as Product;
    }

    const prods = getStoredProducts();
    const idx = prods.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Producto no encontrado');

    let updatedImages = prods[idx].images;
    if (imageUrls !== undefined) {
      updatedImages = imageUrls.map((url, i) => ({
        id: `img-${Date.now()}-${i}`,
        product_id: id,
        image_url: url,
        is_primary: i === 0,
        order_index: i + 1,
        created_at: new Date().toISOString(),
      }));
    }

    let updatedVariants = prods[idx].variants;
    if (variantsList !== undefined) {
      updatedVariants = variantsList.map((v, i) => ({
        id: `var-${Date.now()}-${i}`,
        product_id: id,
        variant_type: v.variant_type,
        variant_value: v.variant_value,
        price_modifier: v.price_modifier || 0,
        stock: null,
        is_available: true,
        order_index: i + 1,
        created_at: new Date().toISOString(),
      }));
    }

    prods[idx] = {
      ...prods[idx],
      ...updates,
      images: updatedImages,
      variants: updatedVariants,
      updated_at: new Date().toISOString(),
    };
    saveStoredProducts(prods);
    return prods[idx];
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar el producto.');
      return;
    }

    const prods = getStoredProducts().filter((p) => p.id !== id);
    saveStoredProducts(prods);
  },

  // ==========================================
  // ORDERS AUDIT
  // ==========================================
  async recordOrder(orderData: Omit<Order, 'id' | 'created_at'>, items: OrderItem[]): Promise<Order> {
    if (isSupabaseConfigured && supabase) {
      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (!error && newOrder) {
        const itemRows = items.map((it) => ({
          order_id: newOrder.id,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          selected_variants: it.selected_variants,
          subtotal: it.subtotal,
        }));
        await supabase.from('order_items').insert(itemRows);
        return newOrder as Order;
      }
    }

    const localOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      created_at: new Date().toISOString(),
      items,
    };
    const orders = getStoredOrders();
    orders.unshift(localOrder);
    saveStoredOrders(orders);
    return localOrder;
  },

  async getOrders(storeId: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as Order[];
    }

    const orders = getStoredOrders();
    return orders.filter((o) => o.store_id === storeId);
  },
};
