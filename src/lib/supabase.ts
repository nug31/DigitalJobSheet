import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a real client only when credentials are available
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Demo stub - works without Supabase configured
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (_event: unknown, _cb: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'DEMO_MODE' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
    }),
  } as unknown as ReturnType<typeof createClient>;

  console.warn('⚠️ Supabase belum dikonfigurasi. Berjalan dalam MODE DEMO.');
}

export { supabase };
export const IS_DEMO_MODE = !supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('https://');
