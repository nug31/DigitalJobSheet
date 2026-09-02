import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Storage, subscribeStorage } from '../lib/storage';
import {
  BookOpen,
  BarChart3,
  FileText,
  Users,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';

export const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(
    Storage.getSubmissions().filter((s) => s.status === 'submitted').length
  );

  useEffect(() => {
    const update = () => {
      setPendingCount(Storage.getSubmissions().filter((s) => s.status === 'submitted').length);
    };
    return subscribeStorage(update);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: '/teacher/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/teacher/jobsheets', icon: FileText, label: 'Manajemen Jobsheet' },
    { to: '/teacher/assessment', icon: CheckSquare, label: 'Penilaian Siswa', badge: pendingCount > 0 ? pendingCount : undefined },
    { to: '/teacher/students', icon: Users, label: 'Data & Rekap Siswa' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0 sticky top-0 h-screen z-30`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-200 justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/teacher/dashboard')}>
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="font-black text-slate-900 text-sm leading-none block">
                  MITRA <span className="text-blue-600">Job Sheet</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                  Portal Guru
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action in Sidebar */}
        {sidebarOpen && (
          <div className="p-3">
            <button
              onClick={() => navigate('/teacher/jobsheets/create')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Buat Jobsheet Baru
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0">
                {profile?.full_name?.charAt(0) || 'G'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{profile?.full_name}</p>
                <p className="text-[10px] text-slate-400 font-medium">Guru Produktif</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                {profile?.full_name?.charAt(0) || 'G'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
};
