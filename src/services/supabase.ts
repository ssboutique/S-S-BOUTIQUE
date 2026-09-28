import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validates whether genuine Supabase credentials have been injected
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20
);

// Instantiate Supabase client or null placeholder
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '%c[VendPro]%c Modo demostración activo: Supabase aún no está conectado. Los datos se sincronizan con almacenamiento local para una experiencia inmediata.',
    'background: #16a34a; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
    'color: inherit;'
  );
}
