import React, { useState, useEffect } from 'react';
import { Storage, subscribeStorage } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { Search, QrCode, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRScannerModal } from '../components/QRScannerModal';

export const StudentJobsheetList: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [jobsheets, setJobsheets] = useState(Storage.getJobsheets());
  const [submissions, setSubmissions] = useState(profile ? Storage.getStudentSubmissions(profile.id) : []);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      setJobsheets(Storage.getJobsheets());
      if (profile) setSubmissions(Storage.getStudentSubmissions(profile.id));
    };
    return subscribeStorage(update);
  }, [profile]);

  const subjects = Array.from(new Set(jobsheets.map((j) => j.subject)));

  const filtered = jobsheets.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase()) ||
      j.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || j.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Katalog Digital Job Sheet</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Jelajahi seluruh modul praktik bengkel otomotif yang tersedia
          </p>
        </div>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 active:scale-95 shrink-0"
        >
          <QrCode className="w-4 h-4" /> Scan QR Meja Kerja
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau judul jobsheet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Mata Pelajaran</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((jobsheet) => {
          const sub = submissions.find((s) => s.jobsheet_id === jobsheet.id);
          return (
            <div
              key={jobsheet.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 bg-slate-900 relative overflow-hidden">
                  <img
                    src={jobsheet.steps[0]?.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'}
                    alt={jobsheet.title}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black text-slate-900 shadow-sm">
                    {jobsheet.code}
                  </div>
                  <div className="absolute top-3 right-3">
                    {sub?.status === 'graded' ? (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Nilai: {sub.total_score}
                      </span>
                    ) : sub?.status === 'submitted' ? (
                      <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Menunggu Nilai
                      </span>
                    ) : (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {jobsheet.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-bold text-blue-600 block uppercase tracking-wide mb-1">
                    {jobsheet.subject}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
                    {jobsheet.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {jobsheet.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-4 pt-3 border-t border-slate-100">
                    <span>± {jobsheet.duration} Menit</span>
                    <span>&bull;</span>
                    <span>{jobsheet.steps.length} Langkah Kerja</span>
                    <span>&bull;</span>
                    <span>{jobsheet.measurements.length} Pengukuran</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(`/student/jobsheet/${jobsheet.id}`)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  {sub?.status === 'graded' ? 'Lihat Hasil Nilai' : sub?.status === 'submitted' ? 'Lihat Submission' : 'Buka & Kerjakan'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};
