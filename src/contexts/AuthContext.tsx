import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { DEMO_ACCOUNTS } from '../lib/demoAccounts';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isDemoMode: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Demo user stub type
const makeDemoUser = (id: string, email: string): User =>
  ({ id, email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      // Check if there's a demo session in sessionStorage
      const stored = sessionStorage.getItem('demo_profile');
      if (stored) {
        const storedProfile = JSON.parse(stored) as UserProfile;
        setProfile(storedProfile);
        setUser(makeDemoUser(storedProfile.id, (storedProfile.nis_nip || 'demo') + '@mitra.sch.id'));
      }
      setIsLoading(false);
      return;
    }

    // Real Supabase mode
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) console.error('Error fetching profile:', error);
      if (data) setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (IS_DEMO_MODE) {
      const account = DEMO_ACCOUNTS.find(
        (a) => a.email === email && a.password === password
      );
      if (!account) {
        return { error: 'Email atau password salah. Gunakan akun demo yang tersedia.' };
      }
      setUser(makeDemoUser(account.profile.id, account.email));
      setProfile(account.profile as UserProfile);
      sessionStorage.setItem('demo_profile', JSON.stringify(account.profile));
      return { error: null };
    }

    // Real Supabase mode
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await fetchProfile(data.user.id);
      return { error: null };
    }
    return { error: 'Login gagal, silakan coba lagi.' };
  };

  const signOut = async () => {
    if (IS_DEMO_MODE) {
      sessionStorage.removeItem('demo_profile');
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isDemoMode: IS_DEMO_MODE, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
