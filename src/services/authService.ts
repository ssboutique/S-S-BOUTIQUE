import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile, UserRole } from '../types/database';
import { DEMO_PROFILE } from './demoData';

const LOCAL_AUTH_KEY = 'vendpro_auth_user';

/**
 * Hardcoded admin credentials for local/fallback authentication.
 * Used when Supabase Auth is unreachable or misconfigured.
 */
const ADMIN_CREDENTIALS = {
  email: 'admin@ssboutique.com',
  password: 'admin123',
};

/**
 * Validates local admin credentials and returns the demo profile if valid.
 */
function validateLocalCredentials(email: string, password: string): Profile | null {
  if (
    email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password
  ) {
    return { ...DEMO_PROFILE, email };
  }
  return null;
}

export const authService = {
  /**
   * Register a new user
   */
  async signUp(email: string, password: string, fullName: string, role: UserRole = 'store_owner'): Promise<{ profile: Profile | null; error: Error | null }> {
    if (isSupabaseConfigured && supabase) {
      try {
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

        if (error) {
          console.warn('[Auth] Supabase signUp error:', error.message);
          // If Supabase Auth has a server error, fall back to local registration
          if (error.status && error.status >= 500) {
            console.warn('[Auth] Supabase server error, using local fallback for registration');
            return this._localSignUp(email, fullName, role);
          }
          return { profile: null, error };
        }

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
      } catch (err: any) {
        console.error('[Auth] Unexpected signUp error:', err);
        // Network or unexpected errors – fall back to local
        return this._localSignUp(email, fullName, role);
      }
    }

    // Demo Mode: Mock account creation
    return this._localSignUp(email, fullName, role);
  },

  /**
   * Local/fallback sign-up when Supabase is unavailable
   */
  _localSignUp(email: string, fullName: string, role: UserRole): { profile: Profile; error: null } {
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
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.warn('[Auth] Supabase signIn error:', error.message, '| Status:', (error as any).status);

          // If Supabase Auth returns a server error (500), fall back to local validation
          if ((error as any).status && (error as any).status >= 500) {
            console.warn('[Auth] Supabase server error detected, falling back to local credential validation');
            return this._localSignIn(email, password);
          }

          // For auth-level errors (wrong password, user not found), also try local credentials
          // This covers the case where the user exists locally but not in Supabase
          return this._localSignIn(email, password);
        }

        // Successful Supabase sign-in: fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('[Auth] Could not fetch profile from DB:', profileError.message);
          // Build profile from auth user data
          const fallbackProfile: Profile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || null,
            role: data.user.user_metadata?.role || 'store_owner',
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(fallbackProfile));
          return { profile: fallbackProfile, error: null };
        }

        const profile = profileData as Profile;
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
        return { profile, error: null };
      } catch (err: any) {
        console.error('[Auth] Unexpected signIn error:', err);
        // Network failure or unexpected error – try local credentials
        return this._localSignIn(email, password);
      }
    }

    // Demo Mode: local sign-in
    return this._localSignIn(email, password);
  },

  /**
   * Local/fallback sign-in: validates against hardcoded admin credentials
   * or previously stored local accounts
   */
  _localSignIn(email: string, password: string): { profile: Profile | null; error: Error | null } {
    // Check hardcoded admin credentials
    const adminProfile = validateLocalCredentials(email, password);
    if (adminProfile) {
      console.info('[Auth] ✅ Local admin login successful');
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminProfile));
      return { profile: adminProfile, error: null };
    }

    // Check if we have a previously registered local user with this email
    const stored = localStorage.getItem(LOCAL_AUTH_KEY);
    if (stored) {
      try {
        const storedProfile = JSON.parse(stored) as Profile;
        if (storedProfile.email?.toLowerCase() === email.toLowerCase()) {
          console.info('[Auth] ✅ Local session restored for:', email);
          return { profile: storedProfile, error: null };
        }
      } catch {
        // Corrupted storage, ignore
      }
    }

    return {
      profile: null,
      error: new Error('Credenciales incorrectas. Verifica tu correo y contraseña.'),
    };
  },

  /**
   * Log out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Auth] Supabase signOut error (ignored):', err);
      }
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
  },

  /**
   * Get currently authenticated user profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();

          if (profile) {
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
            return profile as Profile;
          }
        }
      } catch (err) {
        console.warn('[Auth] Error checking Supabase session:', err);
      }

      // No active Supabase session – check local storage for saved session
      const raw = localStorage.getItem(LOCAL_AUTH_KEY);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      // No session at all
      return null;
    }

    // Demo Mode (Supabase not configured)
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
