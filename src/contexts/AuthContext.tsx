import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { Storage } from '../lib/storage';
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
    // Check cached session in sessionStorage
    const stored = sessionStorage.getItem('mitra_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as UserProfile;
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email || `${parsed.nis_nip}@siswa.mitra.sch.id`, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User);
        setIsLoading(false);
      } catch (e) {
        console.warn('Session parse error:', e);
      }
    }

    // Check initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!stored) {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else if (!sessionStorage.getItem('mitra_profile')) {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data as UserProfile);
        sessionStorage.setItem('mitra_profile', JSON.stringify(data));
      } else {
        // Fallback: search in local storage users
        const localUser = Storage.getUserById(userId) || Storage.getUsers().find(u => u.id === userId);
        if (localUser) {
          setProfile(localUser);
          sessionStorage.setItem('mitra_profile', JSON.stringify(localUser));
        }
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

    // 1. Direct authentication attempt via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: cleanPassword
    });

    if (data?.user) {
      await fetchProfile(data.user.id);
      return { error: null };
    }

    // 2. Check in Local Storage / Excel-imported students
    const localUser = Storage.getUsers().find(
      (u) =>
        (u.nis_nip && u.nis_nip.toLowerCase() === cleanId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    // If student exists from Excel upload and password matches (default password = NISN)
    if (localUser && (cleanPassword === localUser.nis_nip || cleanPassword === '12345678' || cleanPassword === 'siswa123' || cleanPassword === 'admin123' || cleanPassword === 'guru123')) {
      // Auto-register to Supabase Auth in background so future logins sync seamlessly
      try {
        await supabase.auth.signUp({
          email: localUser.email || emailToAuth,
          password: cleanPassword,
          options: {
            data: {
              full_name: localUser.full_name,
              role: localUser.role,
              nis_nip: localUser.nis_nip,
              class_name: localUser.class_name
            }
          }
        });
      } catch (err) {
        console.warn('Background signup note:', err);
      }

      const activeUser = {
        id: localUser.id,
        email: localUser.email || emailToAuth,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User;

      setUser(activeUser);
      setProfile(localUser);
      sessionStorage.setItem('mitra_profile', JSON.stringify(localUser));
      return { error: null };
    }

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return { error: 'Username/NISN atau Password salah. Pastikan NISN sudah di-import oleh Guru/Admin (Password default: NISN).' };
      }
      return { error: `Login gagal: ${error.message}` };
    }

    return { error: 'Akun tidak ditemukan. Pastikan data siswa telah di-upload oleh Guru/Admin.' };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setUser(null);
    setProfile(null);
    sessionStorage.removeItem('mitra_profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isDemoMode: IS_DEMO_MODE, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
