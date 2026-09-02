import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Storage, subscribeStorage } from '../lib/storage';
import { Award, CheckCircle2, Printer, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentCompetencies: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState(profile ? Storage.getStudentSubmissions(profile.id) : []);

  useEffect(() => {
    const update = () => {
      if (profile) setSubmissions(Storage.getStudentSubmissions(profile.id));
    };
    return subscribeStorage(update);
  }, [profile]);

  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const totalScore = gradedSubmissions.reduce((acc, curr) => acc + (curr.total_score || 0), 0);
  const averageScore = gradedSubmissions.length > 0 ? Math.round(totalScore / gradedSubmissions.length) : 0;
  const totalPracticeSeconds = submissions.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
  const totalHours = (totalPracticeSeconds / 3600).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-500/30">
            <Award className="w-3.5 h-3.5" /> Transkrip Resmi Skill Passport
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile?.full_name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            NISN: <strong>{profile?.nis_nip}</strong> &bull; Kelas: <strong>{profile?.class_name}</strong>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs sm:text-sm active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4" /> Cetak Transkrip Nilai
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata Nilai</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{averageScore}</p>
          <span className="text-[11px] text-slate-500 font-medium">Skala 100</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Praktik Lulus</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {gradedSubmissions.filter((s) => s.competency_status === 'Kompeten').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">Kompeten</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jam Bengkel</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{totalHours} <span className="text-sm font-semibold">Jam</span></p>
          <span className="text-[11px] text-slate-500 font-medium">Log waktu praktik</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Kelayakan</p>
          <p className="text-lg font-black text-emerald-600 mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-5 h-5" /> SIAP MAGANG
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Praktik Industri</span>
        </div>
      </div>

      {/* Record History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-base">Riwayat Pengerjaan & Verifikasi Guru</h2>
          <span className="text-xs text-slate-500 font-semibold">{submissions.length} Aktivitas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Kode & Jobsheet</th>
                <th className="px-6 py-3.5">Durasi Pengerjaan</th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600 block text-xs">{sub.jobsheet_code}</span>
                    <span className="font-bold text-slate-900 text-sm">{sub.jobsheet_title}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {Math.round(sub.duration_seconds / 60)} Menit
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(sub.start_time).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sub.total_score ? (
                      <span className="font-black text-slate-900 text-base bg-slate-100 px-3 py-1 rounded-lg">
                        {sub.total_score}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-semibold">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === 'graded' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {sub.competency_status}
                      </span>
                    ) : sub.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Menunggu Penilaian
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        Draf
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/student/jobsheet/${sub.jobsheet_id}`)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Buka <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
