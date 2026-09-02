import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Storage, subscribeStorage } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import type { UserProfile, ClassItem, SubjectItem } from '../types';
import {
  BookOpen,
  Users,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Layers,
  X,
  ShieldAlert
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'settings'>('overview');

  // Storage data
  const [users, setUsers] = useState<UserProfile[]>(Storage.getUsers());
  const [classes, setClasses] = useState<ClassItem[]>(Storage.getClasses());
  const [subjects, setSubjects] = useState<SubjectItem[]>(Storage.getSubjects());
  const [jobsheets, setJobsheets] = useState(Storage.getJobsheets());
  const [submissions, setSubmissions] = useState(Storage.getSubmissions());

  // User CRUD Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormNisNip, setUserFormNisNip] = useState('');
  const [userFormRole, setUserFormRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [userFormClass, setUserFormClass] = useState('XI TKR 1');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // Class & Subject CRUD
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState('');
  const [classTeacherInput, setClassTeacherInput] = useState('');
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  // Reset Modal
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setUsers(Storage.getUsers());
      setClasses(Storage.getClasses());
      setSubjects(Storage.getSubjects());
      setJobsheets(Storage.getJobsheets());
      setSubmissions(Storage.getSubmissions());
    };
    return subscribeStorage(update);
  }, []);

  // Open User Modal
  const openAddUser = () => {
    setEditingUser(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormNisNip('');
    setUserFormRole('student');
    setUserFormClass('XI TKR 1');
    setUserModalOpen(true);
  };

  const openEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setUserFormName(u.full_name);
    setUserFormEmail(u.email || '');
    setUserFormNisNip(u.nis_nip || '');
    setUserFormRole(u.role);
    setUserFormClass(u.class_name || 'XI TKR 1');
    setUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!userFormName.trim()) {
      toast.error('Gagal Menyimpan', 'Nama lengkap pengguna wajib diisi.');
      return;
    }

    const newUser: UserProfile = {
      id: editingUser?.id || `user-${Date.now()}`,
      full_name: userFormName.trim(),
      email: userFormEmail.trim() || `${userFormNisNip || 'user'}@mitra.sch.id`,
      nis_nip: userFormNisNip.trim() || null,
      role: userFormRole,
      class_name: userFormRole === 'student' ? userFormClass : undefined,
      avatar_url: null
    };

    Storage.saveUser(newUser);
    setUserModalOpen(false);
    toast.success('Pengguna Disimpan', `Akun ${newUser.full_name} (${newUser.role}) berhasil disimpan.`);
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;
    Storage.deleteUser(deleteUserId);
    setDeleteUserId(null);
    toast.success('Pengguna Dihapus', 'Akun telah dihapus dari sistem.');
  };

  const handleSaveClass = () => {
    if (!classNameInput.trim()) return;
    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      name: classNameInput.trim(),
      department: 'Teknik Kendaraan Ringan Otomotif',
      academic_year: '2024/2025',
      homeroom_teacher: classTeacherInput.trim() || 'Guru Produktif',
      total_students: 36
    };
    Storage.saveClass(newClass);
    setClassModalOpen(false);
    setClassNameInput('');
    setClassTeacherInput('');
    toast.success('Kelas Ditambahkan', `Kelas ${newClass.name} siap digunakan.`);
  };

  const handleDeleteClass = () => {
    if (!deleteClassId) return;
    Storage.deleteClass(deleteClassId);
    setDeleteClassId(null);
    toast.success('Kelas Dihapus', 'Data kelas telah dihapus.');
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const jsonStr = Storage.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mitra_JobSheet_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup Berhasil Diekspor', 'File JSON backup telah disimpan ke komputer.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = Storage.importBackupJSON(content);
      if (success) {
        toast.success('Database Berhasil Dipulihkan!', 'Seluruh data telah dimuat dari file backup.');
      } else {
        toast.error('Gagal Memulihkan', 'Format file JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    Storage.resetToDefault();
    setResetConfirmOpen(false);
    toast.success('Reset Sukses', 'Seluruh data telah dikembalikan ke kondisi demo awal.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-0 h-screen z-30">
        <div className="h-16 flex items-center px-5 border-b border-slate-200 gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm block leading-tight">
              MITRA <span className="text-blue-600">Admin</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Control Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'overview', icon: BarChart3, label: 'Dashboard Overview' },
            { id: 'users', icon: Users, label: 'Manajemen Pengguna' },
            { id: 'classes', icon: Layers, label: 'Kelas & Mapel' },
            { id: 'settings', icon: Settings, label: 'Backup & Pengaturan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 sm:p-8 max-w-6xl w-full mx-auto">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Panel Administrator</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Selamat datang, {profile?.full_name}. Pantau integritas sistem dan aktivitas jobsheet.
              </p>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Pengguna', value: users.length, icon: Users, color: 'text-blue-600 bg-blue-100' },
                { label: 'Total Kelas', value: classes.length, icon: Layers, color: 'text-indigo-600 bg-indigo-100' },
                { label: 'Total Jobsheet', value: jobsheets.length, icon: FileText, color: 'text-purple-600 bg-purple-100' },
                { label: 'Total Submission', value: submissions.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <span className="text-[11px] text-slate-400 mt-1">Status database aktif</span>
                </div>
              ))}
            </div>

            {/* Recent Submissions list */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
              <h2 className="text-base font-black text-slate-900">Aktivitas Submission Terbaru</h2>
              <div className="space-y-3">
                {submissions.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.student_name} ({s.class_name})</p>
                      <p className="text-[11px] text-blue-600 font-semibold">{s.jobsheet_code} - {s.jobsheet_title}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      s.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status === 'graded' ? `Nilai: ${s.total_score}` : 'Menunggu Nilai'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Manajemen Pengguna</h1>
                <p className="text-slate-500 text-sm mt-0.5">Kelola akun Siswa, Guru, dan Admin.</p>
              </div>
              <button
                onClick={openAddUser}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Tambah Pengguna
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Nama & Email</th>
                      <th className="px-6 py-4">NIS / NIP</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Kelas</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold">{u.nis_nip || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'teacher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{u.class_name || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditUser(u)}
                              className="p-2 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                              title="Edit Pengguna"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteUserId(u.id)}
                              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Classes & Subjects */}
        {activeTab === 'classes' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Classes Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Daftar Kelas Bengkel TKR</h2>
                  <p className="text-slate-500 text-xs">Kelola rombongan belajar dan wali kelas</p>
                </div>
                <button
                  onClick={() => setClassModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {classes.map((c) => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-lg font-black text-blue-600">{c.name}</span>
                        <button
                          onClick={() => setDeleteClassId(c.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{c.department}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-2">Wali: {c.homeroom_teacher}</p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 mt-4 block">
                      Kapasitas: {c.total_students} Siswa
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-xl font-black text-slate-900">Mata Pelajaran Kejuruan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((s) => (
                  <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-black text-purple-600 uppercase">{s.code} &bull; {s.grade_level}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Backup & Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl animate-in fade-in">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Backup & Pemulihan Database</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Kelola keamanan data jobsheet, submission siswa, dan pengaturan reset.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              {/* Export Backup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Export Full Backup JSON</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unduh seluruh data jobsheet, pengguna, dan submission ke file JSON lokal.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
                >
                  <Download className="w-4 h-4" /> Download Backup
                </button>
              </div>

              {/* Import Backup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Import / Restore Backup JSON</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pulihkan seluruh data sistem dari file backup JSON sebelumnya.
                  </p>
                </div>
                <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File JSON</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>

              {/* Danger Zone: Reset Default Data */}
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Reset ke Data Awal (Factory Reset)
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Mengembalikan seluruh database jobsheet, nilai, dan submission ke data default bawaan.
                  </p>
                </div>
                <button
                  onClick={() => setResetConfirmOpen(true)}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Data Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User CRUD Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setUserModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIS / NIP</label>
                <input
                  type="text"
                  value={userFormNisNip}
                  onChange={(e) => setUserFormNisNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Nomor Induk"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  placeholder="email@mitra.sch.id"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role Akun</label>
                  <select
                    value={userFormRole}
                    onChange={(e) => setUserFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="student">Siswa</option>
                    <option value="teacher">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {userFormRole === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={userFormClass}
                      onChange={(e) => setUserFormClass(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {classes.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setUserModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUser}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Tambah Kelas Baru</h3>
              <button onClick={() => setClassModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas (Contoh: XII TKR 2)</label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="XII TKR 2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas / Guru Pengampu</label>
                <input
                  type="text"
                  value={classTeacherInput}
                  onChange={(e) => setClassTeacherInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Nama Guru"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setClassModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleSaveClass}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Simpan Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        title="Hapus Pengguna?"
        message="Akun pengguna ini akan dihapus dari sistem."
        confirmText="Hapus Pengguna"
        confirmVariant="danger"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUserId(null)}
      />

      {/* Delete Class Confirmation */}
      <ConfirmModal
        isOpen={!!deleteClassId}
        title="Hapus Data Kelas?"
        message="Data kelas ini akan dihapus."
        confirmText="Hapus Kelas"
        confirmVariant="danger"
        onConfirm={handleDeleteClass}
        onCancel={() => setDeleteClassId(null)}
      />

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Reset Seluruh Data Sistem?"
        message="Seluruh jobsheet, nilai praktik siswa, dan modifikasi data akan dikembalikan ke kondisi awal (demo data bawaan)."
        confirmText="Ya, Reset Semua Data"
        confirmVariant="danger"
        onConfirm={handleResetData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
};
