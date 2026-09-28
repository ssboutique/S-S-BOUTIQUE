import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, UserRole } from '../types/database';
import { DEMO_PROFILE } from './demoData';

const LOCAL_AUTH_KEY = 'vendpro_auth_user';

export const authService = {
  /**
   * Register a new user
   */
  async signUp(email: string, password: string, fullName: string, role: UserRole = 'store_owner'): Promise<{ profile: Profile | null; error: Error | null }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) return { profile: null, error };

      const profile: Profile = {
        id: data.user?.id || '',
        email,
        full_name: fullName,
        avatar_url: null,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { profile, error: null };
    }

    // Demo Mode: Mock account creation
    const mockUser: Profile = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
    return { profile: mockUser, error: null };
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ profile: Profile | null; error: Error | null }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { profile: null, error };

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { profile: (profileData as Profile) || null, error: null };
    }

    // Demo Mode: Accept demo credentials or any email
    const stored = localStorage.getItem(LOCAL_AUTH_KEY);
    const mockProfile = stored ? JSON.parse(stored) : { ...DEMO_PROFILE, email };
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockProfile));

    return { profile: mockProfile, error: null };
  },

  /**
   * Log out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
  },

  /**
   * Get currently authenticated user profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      return profile as Profile;
    }

    // Demo Mode
    const raw = localStorage.getItem(LOCAL_AUTH_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return DEMO_PROFILE;
      }
    }
    // Default to DEMO_PROFILE in demo mode so owner panel is immediately accessible
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(DEMO_PROFILE));
    return DEMO_PROFILE;
  },
};
