import type { Store } from '../types/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { DEMO_STORE } from './demoData';

const LOCAL_STORE_KEY = 'vendpro_stores';

// Local storage helper
function getStoredStores(): Store[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) {
      const initial = [DEMO_STORE];
      localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEMO_STORE];
  }
}

function saveStoredStores(stores: Store[]): void {
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(stores));
  } catch (e) {
    console.error('Failed saving stores to localStorage:', e);
  }
}

export const storeService = {
  /**
   * Retrieves a public or active store by its unique URL slug
   */
  async getStoreBySlug(slug: string): Promise<Store | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Error fetching store by slug:', error);
        return null; // Return null instead of throwing so caller can use fallback
      }
      return data as Store;
    }

    // Demo Mode fallback (only when Supabase is NOT configured)
    const stores = getStoredStores();
    const found = stores.find((s) => s.slug === slug && s.is_active);
    return found || null;
  },

  /**
   * Retrieves a store by its UUID
   */
  async getStoreById(id: string): Promise<Store | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching store by id:', error);
        return null;
      }
      return data as Store;
    }

    const stores = getStoredStores();
    return stores.find((s) => s.id === id) || null;
  },

  /**
   * Retrieves all stores owned by an authenticated user
   */
  async getMyStores(ownerId: string): Promise<Store[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stores:', error);
        // Auth/session error — try fetching the default store by slug as recovery
        try {
          const fallback = await this.getStoreBySlug('ss-boutique');
          if (fallback) return [fallback];
        } catch {
          // ignore secondary error
        }
        return [];
      }
      return data as Store[];
    }

    const stores = getStoredStores();
    return stores.filter((s) => s.owner_id === ownerId || s.owner_id === '00000000-0000-0000-0000-000000000001');
  },

  /**
   * Checks whether a slug is available for a new store
   */
  async checkSlugAvailability(slug: string, currentStoreId?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('stores').select('id').eq('slug', slug);
      if (currentStoreId) {
        query = query.neq('id', currentStoreId);
      }
      const { data } = await query;
      return !data || data.length === 0;
    }

    const stores = getStoredStores();
    return !stores.some((s) => s.slug === slug && s.id !== currentStoreId);
  },

  /**
   * Creates a new store
   */
  async createStore(storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    const storeId = (storeData as any).id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined);
    const payload: any = { ...storeData };
    if (storeId) {
      payload.id = storeId;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error creating store:', error);
        throw new Error('No se pudo crear la tienda. Verifica el nombre y la URL.');
      }
      return data as Store;
    }

    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const stores = getStoredStores();
    stores.push(newStore);
    saveStoredStores(stores);
    return newStore;
  },

  /**
   * Updates store settings, branding, colors, or contact details
   */
  async updateStore(id: string, updates: Partial<Store>): Promise<Store> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating store:', error);
        throw new Error('No se pudieron guardar los cambios en la tienda.');
      }
      return data as Store;
    }

    const stores = getStoredStores();
    const index = stores.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Tienda no encontrada');

    stores[index] = {
      ...stores[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStoredStores(stores);
    return stores[index];
  },

  /**
   * Super Admin: Get all stores in platform
   */
  async getAllStores(): Promise<Store[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error('Error cargando tiendas del sistema');
      return data as Store[];
    }

    return getStoredStores();
  },
};
