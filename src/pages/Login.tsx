import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to appropriate role dashboard
  React.useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') navigate('/admin/dashboard');
      else if (profile.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  }, [profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(identifier, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/25 mb-4">
          <BookOpen className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Mitra Digital Job Sheet
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
          One QR &bull; One Job Sheet &bull; One Skill Passport
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NISN Siswa / Email Guru & Admin
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="Masukkan NISN atau Email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="Masukkan Password (Default Siswa: NISN)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Masuk...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium mt-6">
          SMK Mitra Industri &copy; 2025
        </p>
      </div>
    </div>
  );
};
