import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BookOpen, Award, Home, User } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/student/jobsheets', icon: BookOpen, label: 'Katalog Jobsheet' },
    { to: '/student/competencies', icon: Award, label: 'Skill Passport' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
                <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-black text-slate-900 leading-none block">
                    MITRA <span className="text-blue-600">Job Sheet</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                    Siswa Praktik Bengkel
                  </span>
                </div>
              </div>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1 pl-6 border-l border-slate-200">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{profile?.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{profile?.class_name || 'XI TKR 1'}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                  {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold transition-colors ml-2"
                title="Keluar Akun"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center z-50 px-2 py-2 safe-area-pb shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-500 hover:text-rose-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] mt-1">Keluar</span>
        </button>
      </nav>
    </div>
  );
};
