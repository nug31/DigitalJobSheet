import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, AlertCircle, Loader2, Sparkles, User, GraduationCap, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
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

  const handleQuickLogin = async (demoId: string, demoPassword: string) => {
    setIdentifier(demoId);
    setPassword(demoPassword);
    setLoading(true);
    setError(null);
    const { error: signInError } = await signIn(demoId, demoPassword);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 mb-3">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Mitra Digital Job Sheet
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          One QR &bull; One Job Sheet &bull; One Skill Record
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Quick 1-Tap Demo Logins */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Masuk Cepat 1-Klik:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('0106090576', '0106090576')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-blue-100 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-all active:scale-95 group text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-blue-900">Siswa (Ahnaf)</span>
              <span className="text-[10px] text-blue-600 font-bold">0106090576</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('guru@mitra.sch.id', 'guru123')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 transition-all active:scale-95 group text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-indigo-900">Guru</span>
              <span className="text-[10px] text-indigo-600 font-semibold">guru123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@mitra.sch.id', 'admin123')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-100 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 transition-all active:scale-95 group text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-purple-900">Admin</span>
              <span className="text-[10px] text-purple-600 font-semibold">admin123</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-bold">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                NISN / Username Siswa / Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Masukkan NISN (Contoh: 0071234567)"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase">
                  Password (Default: NISN)
                </label>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Bantuan login
                </span>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Masukkan Password / NISN Anda"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
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

        <p className="text-center text-xs text-slate-400 font-medium pt-2">
          SMK Mitra Industri &copy; 2025
        </p>
      </div>
    </div>
  );
};
