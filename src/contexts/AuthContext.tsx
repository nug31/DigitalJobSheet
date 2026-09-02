import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { DEMO_ACCOUNTS } from '../lib/demoAccounts';
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

// Demo user stub type
const makeDemoUser = (id: string, email: string): User =>
  ({ id, email, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' } as User);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a cached session in sessionStorage
    const stored = sessionStorage.getItem('demo_profile');
    if (stored) {
      try {
        const storedProfile = JSON.parse(stored) as UserProfile;
        setProfile(storedProfile);
        setUser(makeDemoUser(storedProfile.id, storedProfile.email || `${storedProfile.nis_nip || 'user'}@mitra.sch.id`));
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn('Error reading stored profile:', e);
      }
    }

    if (IS_DEMO_MODE) {
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
      if (data) {
        setProfile(data as UserProfile);
        sessionStorage.setItem('demo_profile', JSON.stringify(data));
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

    // 1. Check in DEMO / Local Storage Users First
    // Match by NISN / NIP or Email
    const localUser = Storage.getUsers().find(
      (u) =>
        (u.nis_nip && u.nis_nip.toLowerCase() === cleanId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase()) ||
        (cleanId.includes('@') && u.email?.toLowerCase() === cleanId.toLowerCase())
    );

    const demoAcc = DEMO_ACCOUNTS.find(
      (a) =>
        (a.profile.nis_nip && a.profile.nis_nip.toLowerCase() === cleanId.toLowerCase()) ||
        a.email.toLowerCase() === cleanId.toLowerCase()
    );

    // If matches NISN / NIS and password is either NISN or standard demo password
    if (
      (demoAcc && (demoAcc.password === cleanPassword || demoAcc.profile.nis_nip === cleanPassword || cleanPassword === 'siswa123' || cleanPassword === 'admin123' || cleanPassword === 'guru123')) ||
      (localUser && (localUser.nis_nip === cleanPassword || cleanPassword === 'siswa123' || cleanPassword === '12345678' || cleanPassword === 'admin123' || cleanPassword === 'guru123'))
    ) {
      const selectedProfile = demoAcc?.profile || localUser!;
      setUser(makeDemoUser(selectedProfile.id, selectedProfile.email || `${selectedProfile.nis_nip}@siswa.mitra.sch.id`));
      setProfile(selectedProfile as UserProfile);
      sessionStorage.setItem('demo_profile', JSON.stringify(selectedProfile));
      return { error: null };
    }

    if (IS_DEMO_MODE) {
      return { error: 'NISN atau password tidak sesuai. Pastikan memasukkan NISN yang terdaftar (Password default: NISN).' };
    }

    // 2. Real Supabase mode
    let emailToAuth = cleanId;
    if (!cleanId.includes('@')) {
      emailToAuth = `${cleanId}@siswa.mitra.sch.id`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: emailToAuth, password: cleanPassword });
    if (error) {
      // If student enters NISN, give clear guidance
      return { error: `Login gagal: ${error.message}. Masukkan NISN terdaftar dan password.` };
    }
    if (data.user) {
      await fetchProfile(data.user.id);
      return { error: null };
    }
    return { error: 'Login gagal, silakan coba lagi.' };
  };

  const signOut = async () => {
    sessionStorage.removeItem('demo_profile');
    setUser(null);
    setProfile(null);
    if (!IS_DEMO_MODE) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isDemoMode: IS_DEMO_MODE, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
