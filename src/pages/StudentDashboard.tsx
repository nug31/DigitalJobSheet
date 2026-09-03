import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, CheckCircle, Clock, AlertCircle, QrCode, Search, Sparkles, ArrowRight, Award } from 'lucide-react';
import { Storage, subscribeStorage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { QRScannerModal } from '../components/QRScannerModal';
import type { Jobsheet } from '../types';

export const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobsheets, setJobsheets] = useState<Jobsheet[]>(Storage.getJobsheets());
  const [submissions, setSubmissions] = useState(profile ? Storage.getStudentSubmissions(profile.id) : []);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchSupabaseJobsheets = async () => {
      try {
        const { data } = await (supabase.from('jobsheets') as any).select('*');
        if (data && data.length > 0) {
          data.forEach((j: Jobsheet) => Storage.saveJobsheet(j));
          setJobsheets(Storage.getJobsheets());
        }
      } catch (err) {
        console.warn('Supabase jobsheets sync note:', err);
      }
    };

    fetchSupabaseJobsheets();

    const update = () => {
      setJobsheets(Storage.getJobsheets());
      if (profile) {
        setSubmissions(Storage.getStudentSubmissions(profile.id));
      }
    };
    return subscribeStorage(update);
  }, [profile]);

  // Statistics calculation
  const totalActive = jobsheets.filter((j) => j.status === 'active').length;
  const completedSubmissions = submissions.filter((s) => s.status === 'graded' && s.competency_status === 'Kompeten');
  const pendingSubmissions = submissions.filter((s) => s.status === 'submitted');
  const revisionSubmissions = submissions.filter((s) => s.status === 'revision_needed' || (s.status === 'graded' && s.competency_status === 'Belum Kompeten'));

  // Filter jobsheets
  const filteredJobsheets = jobsheets.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const sub = submissions.find((s) => s.jobsheet_id === j.id);
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return sub?.status === 'graded' && sub.competency_status === 'Kompeten';
    if (filterStatus === 'pending') return sub?.status === 'submitted';
    if (filterStatus === 'not_started') return !sub;
    if (filterStatus === 'in_progress') return sub?.status === 'draft';
    return true;
  });

  // Recent graded feedback banner
  const recentGraded = submissions.find((s) => s.status === 'graded' && s.teacher_feedback);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Siswa &bull; {profile?.class_name || 'XI TKR 1'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat datang, {profile?.full_name}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Akses jobsheet praktik bengkel secara digital, rekam hasil ukur presisi, dan pantau catatan skill kompetensi Anda.
          </p>
        </div>

        <div className="flex gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-md text-sm transition-all active:scale-95"
          >
            <QrCode className="w-5 h-5" />
            Scan QR Meja Kerja
          </button>
        </div>
      </div>

      {/* Teacher Feedback Alert Banner if any */}
      {recentGraded && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 animate-in slide-in-from-top-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                Nilai Baru Masuk: {recentGraded.total_score}/100
              </span>
              <span className="text-xs text-slate-500 font-medium">{recentGraded.jobsheet_code}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">{recentGraded.jobsheet_title}</p>
            <p className="text-xs text-slate-600 mt-1 italic">
              "{recentGraded.teacher_feedback}" &mdash; <span className="font-semibold text-slate-700">{recentGraded.graded_by}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(`/student/jobsheet/${recentGraded.jobsheet_id}`)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            Lihat Nilai
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jobsheet Aktif</span>
            <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalActive}</p>
          <span className="text-[11px] text-slate-400 mt-1">Tersedia di kurikulum</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lulus / Kompeten</span>
            <div className="h-9 w-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{completedSubmissions.length}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1">Sudah dinilai guru</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Nilai</span>
            <div className="h-9 w-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{pendingSubmissions.length}</p>
          <span className="text-[11px] text-amber-600/80 font-medium mt-1">Dalam antrean koreksi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perlu Perbaikan</span>
            <div className="h-9 w-9 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-600">{revisionSubmissions.length}</p>
          <span className="text-[11px] text-rose-500/80 font-medium mt-1">Butuh evaluasi ulang</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, judul, atau mapel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {[
            { id: 'all', label: 'Semua Jobsheet' },
            { id: 'not_started', label: 'Belum Dikerjakan' },
            { id: 'pending', label: 'Menunggu Nilai' },
            { id: 'completed', label: 'Kompeten' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobsheet Grid Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Daftar Jobsheet Praktik</h2>
          <span className="text-xs text-slate-500 font-medium">Menampilkan {filteredJobsheets.length} jobsheet</span>
        </div>

        {filteredJobsheets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">Tidak ada jobsheet yang sesuai.</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobsheets.map((jobsheet) => {
              const sub = submissions.find((s) => s.jobsheet_id === jobsheet.id);

              let statusBadge = (
                <span className="bg-slate-700/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  Belum Dikerjakan
                </span>
              );
              let progressPercent = 0;
              let ctaText = 'Mulai Kerjakan';
              let ctaColor = 'bg-blue-600 hover:bg-blue-700 text-white';

              if (sub) {
                if (sub.status === 'graded') {
                  statusBadge = (
                    <span className="bg-emerald-600 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Nilai: {sub.total_score} ({sub.competency_status})
                    </span>
                  );
                  progressPercent = 100;
                  ctaText = 'Lihat Hasil & Rincian';
                  ctaColor = 'bg-emerald-600 hover:bg-emerald-700 text-white';
                } else if (sub.status === 'submitted') {
                  statusBadge = (
                    <span className="bg-amber-500 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Menunggu Penilaian
                    </span>
                  );
                  progressPercent = 100;
                  ctaText = 'Lihat Submission';
                  ctaColor = 'bg-amber-500 hover:bg-amber-600 text-white';
                } else {
                  // draft in progress
                  const completedStepsCount = Object.values(sub.step_data || {}).filter((x) => x.completed).length;
                  progressPercent = jobsheet.steps.length > 0 ? Math.round((completedStepsCount / jobsheet.steps.length) * 100) : 50;
                  statusBadge = (
                    <span className="bg-blue-500 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      Sedang Praktik ({progressPercent}%)
                    </span>
                  );
                  ctaText = 'Lanjutkan Praktik';
                  ctaColor = 'bg-blue-600 hover:bg-blue-700 text-white';
                }
              }

              return (
                <div
                  key={jobsheet.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 overflow-hidden flex flex-col group"
                >
                  <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                    <img
                      src={jobsheet.steps[0]?.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'}
                      alt={jobsheet.title}
                      className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-black px-2.5 py-1 rounded-lg">
                      {jobsheet.code}
                    </div>
                    <div className="absolute top-3 right-3">{statusBadge}</div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/90 text-xs font-semibold">
                      <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">± {jobsheet.duration} Menit</span>
                      <span className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">Level {jobsheet.difficulty}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                        {jobsheet.subject}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {jobsheet.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                        {jobsheet.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>Progress Praktik</span>
                        <span className="text-slate-800">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <button
                        onClick={() => navigate(`/student/jobsheet/${jobsheet.id}`)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${ctaColor}`}
                      >
                        {ctaText} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />
    </div>
  );
};
