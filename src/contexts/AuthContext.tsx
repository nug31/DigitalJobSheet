import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial Supabase session
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

      if (error) {
        console.error('Error fetching profile from Supabase:', error);
      }
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string): Promise<{ error: string | null }> => {
    const cleanId = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      return { error: 'Silakan isi Username/NISN dan Password.' };
    }

    // Convert NISN to email format if numbers only or without @
    let emailToAuth = cleanId;
    if (!cleanId.includes('@')) {
      emailToAuth = `${cleanId}@siswa.mitra.sch.id`;
    }

    // Direct authentications against Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: cleanPassword
    });

    if (error) {
      // User friendly translation of standard Supabase errors
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return { error: 'Username/NISN atau Password salah. Silakan periksa kembali.' };
      }
      return { error: `Login gagal: ${error.message}` };
    }

    if (data.user) {
      await fetchProfile(data.user.id);
      return { error: null };
    }

    return { error: 'Login gagal, pengguna tidak ditemukan.' };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setUser(null);
    setProfile(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isDemoMode: IS_DEMO_MODE, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
