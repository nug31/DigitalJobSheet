import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Storage, subscribeStorage } from '../lib/storage';
import {
  FileText,
  Users,
  CheckSquare,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeModal } from '../components/QRCodeModal';
import type { Jobsheet } from '../types';

export const TeacherDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobsheets, setJobsheets] = useState(Storage.getJobsheets());
  const [submissions, setSubmissions] = useState(Storage.getSubmissions());
  const [selectedQRJobsheet, setSelectedQRJobsheet] = useState<Jobsheet | null>(null);

  useEffect(() => {
    const update = () => {
      setJobsheets(Storage.getJobsheets());
      setSubmissions(Storage.getSubmissions());
    };
    return subscribeStorage(update);
  }, []);

  const totalStudents = Storage.getUsers().filter((u) => u.role === 'student').length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const competentSubmissions = submissions.filter((s) => s.status === 'graded' && s.competency_status === 'Kompeten');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-slate-800">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Portal Instruktur / Guru Produktif
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat datang, {profile?.full_name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Kelola lembar kerja digital, verifikasi data hasil ukur siswa, cetak QR code meja praktik, dan pantau standar kompetensi keahlian.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10 shrink-0">
          <button
            onClick={() => navigate('/teacher/jobsheets/create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Buat Jobsheet Baru
          </button>
          <button
            onClick={() => navigate('/teacher/assessment')}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-md text-xs sm:text-sm transition-all active:scale-95"
          >
            <CheckSquare className="w-4 h-4" /> Antrean Nilai ({pendingSubmissions.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Jobsheet</span>
            <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{jobsheets.length}</p>
          <span className="text-[11px] text-slate-400 mt-1">Aktif di kurikulum</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
            <div className="h-9 w-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600">{totalStudents}</p>
          <span className="text-[11px] text-indigo-600/80 font-medium mt-1">Siswa Terdaftar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Nilai</span>
            <div className="h-9 w-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingSubmissions.length}</p>
          <span className="text-[11px] text-amber-600/80 font-medium mt-1">Perlu diverifikasi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lulus Kompeten</span>
            <div className="h-9 w-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{competentSubmissions.length}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1">Submission Selesai</span>
        </div>
      </div>

      {/* Grid: Pending Submissions & Jobsheets Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Assessment Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">Antrean Penilaian Praktik Siswa</h2>
              <p className="text-xs text-slate-500">Submission terbaru yang menunggu evaluasi dan nilai dari Anda</p>
            </div>
            <button
              onClick={() => navigate('/teacher/assessment')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua ({submissions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
              <CheckSquare className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700">Semua submission telah dinilai!</p>
              <p className="text-[11px] text-slate-400">Tidak ada antrean penilaian yang tertunda saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center shrink-0">
                      {sub.student_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{sub.student_name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">&bull; NIS: {sub.student_nis}</span>
                      </div>
                      <p className="text-xs font-bold text-blue-600 mt-0.5">{sub.jobsheet_code} - {sub.jobsheet_title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Durasi: <strong>{Math.round(sub.duration_seconds / 60)} menit</strong> &bull; Masuk: {new Date(sub.submitted_at || sub.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/teacher/assessment')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Beri Nilai <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Jobsheets QR List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900">QR Code Jobsheet</h2>
            <button
              onClick={() => navigate('/teacher/jobsheets')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Kelola
            </button>
          </div>

          <div className="space-y-3">
            {jobsheets.slice(0, 4).map((j) => (
              <div
                key={j.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-xs font-black text-blue-600 block">{j.code}</span>
                  <p className="text-xs font-bold text-slate-800 truncate">{j.title}</p>
                  <span className="text-[10px] text-slate-400 truncate block">{j.subject}</span>
                </div>
                <button
                  onClick={() => setSelectedQRJobsheet(j)}
                  className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl border border-slate-200 transition-colors shrink-0"
                  title="Lihat QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        jobsheet={selectedQRJobsheet}
        isOpen={!!selectedQRJobsheet}
        onClose={() => setSelectedQRJobsheet(null)}
      />
    </div>
  );
};
