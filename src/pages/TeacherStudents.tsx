import React, { useState, useEffect } from 'react';
import { Storage, subscribeStorage } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import type { UserProfile, Submission } from '../types';
import {
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const toast = useToast();
  const [users, setUsers] = useState(Storage.getUsers().filter((u) => u.role === 'student'));
  const [submissions, setSubmissions] = useState(Storage.getSubmissions());
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  useEffect(() => {
    const update = () => {
      setUsers(Storage.getUsers().filter((u) => u.role === 'student'));
      setSubmissions(Storage.getSubmissions());
    };
    return subscribeStorage(update);
  }, []);

  const classes = Array.from(new Set(users.map((u) => u.class_name || 'XI TKR 1')));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (u.nis_nip && u.nis_nip.includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = classFilter === 'all' || (u.class_name || 'XI TKR 1') === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleExportCSV = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Email', 'Total Praktik Selesai', 'Rata-Rata Nilai', 'Status Kompetensi'];
    const rows = filteredUsers.map((u) => {
      const studentSubs = submissions.filter((s) => s.student_id === u.id && s.status === 'graded');
      const avgScore =
        studentSubs.length > 0
          ? Math.round(studentSubs.reduce((a, b) => a + (b.total_score || 0), 0) / studentSubs.length)
          : 0;
      const compStatus = avgScore >= 75 ? 'Kompeten' : 'Belum Teruji';
      return [
        u.nis_nip || '',
        `"${u.full_name}"`,
        u.class_name || 'XI TKR 1',
        u.email || '',
        studentSubs.length,
        avgScore,
        compStatus
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Siswa_${classFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rekap CSV Berhasil Diunduh', 'File rekap nilai siswa telah disimpan.');
  };

  const studentSubmissions: Submission[] = selectedStudent
    ? submissions.filter((s) => s.student_id === selectedStudent.id)
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Data & Rekap Nilai Siswa</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Pantau portofolio pekerjaan siswa, riwayat jam bengkel, dan capaian standar kompetensi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Rekap Nilai (CSV)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Nama Lengkap Siswa</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-center">Jobsheet Selesai</th>
                <th className="px-6 py-4 text-center">Rata-Rata Nilai</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const subs = submissions.filter((s) => s.student_id === u.id);
                const graded = subs.filter((s) => s.status === 'graded');
                const avg =
                  graded.length > 0
                    ? Math.round(graded.reduce((a, b) => a + (b.total_score || 0), 0) / graded.length)
                    : 0;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-500">{u.nis_nip}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{u.full_name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {u.class_name || 'XI TKR 1'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                        {graded.length} Jobsheet
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {avg > 0 ? (
                        <span className="font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                          {avg}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {avg >= 75 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Kompeten
                        </span>
                      ) : subs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" /> Sedang Proses
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                          Belum Mulai
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(u)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors"
                      >
                        Portofolio <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Portfolio Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-slate-500">NIS: {selectedStudent.nis_nip} &bull; {selectedStudent.class_name || 'XI TKR 1'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Riwayat Jobsheet Siswa ({studentSubmissions.length}):</h4>
              {studentSubmissions.length === 0 ? (
                <p className="text-slate-400 text-xs italic">Siswa belum mengumpulkan jobsheet.</p>
              ) : (
                <div className="space-y-3">
                  {studentSubmissions.map((s) => (
                    <div key={s.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-black text-blue-600 block">{s.jobsheet_code}</span>
                          <p className="font-bold text-slate-800 text-sm">{s.jobsheet_title}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status === 'graded' ? `Nilai: ${s.total_score}` : 'Menunggu Nilai'}
                        </span>
                      </div>
                      {s.teacher_feedback && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                          Feedback Guru: "{s.teacher_feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
