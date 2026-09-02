import React, { useState, useEffect } from 'react';
import { Storage, subscribeStorage } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { Plus, Search, Edit, Trash2, Eye, QrCode, Copy, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeModal } from '../components/QRCodeModal';
import { ConfirmModal } from '../components/ConfirmModal';
import type { Jobsheet } from '../types';

export const TeacherJobsheetList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobsheets, setJobsheets] = useState(Storage.getJobsheets());
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Modals
  const [selectedQRJobsheet, setSelectedQRJobsheet] = useState<Jobsheet | null>(null);
  const [previewJobsheet, setPreviewJobsheet] = useState<Jobsheet | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setJobsheets(Storage.getJobsheets());
    };
    return subscribeStorage(update);
  }, []);

  const classes = Array.from(new Set(jobsheets.map((j) => j.target_class)));

  const filteredJobsheets = jobsheets.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.code.toLowerCase().includes(search.toLowerCase()) ||
      j.subject.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'all' || j.target_class === classFilter;
    return matchesSearch && matchesClass;
  });

  const handleDelete = () => {
    if (!deleteId) return;
    Storage.deleteJobsheet(deleteId);
    setDeleteId(null);
    toast.success('Jobsheet Dihapus', 'Jobsheet telah dihapus dari sistem.');
  };

  const handleDuplicate = (job: Jobsheet) => {
    const newCode = `JOB-${Math.floor(100 + Math.random() * 900)}`;
    const duplicated: Jobsheet = {
      ...job,
      id: `job-${Date.now()}`,
      code: newCode,
      title: `${job.title} (Salinan)`,
      created_at: new Date().toISOString()
    };
    Storage.saveJobsheet(duplicated);
    toast.success('Jobsheet Diduplikasi', `Berhasil membuat salinan dengan kode ${newCode}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manajemen Jobsheet Praktik</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Buat modul langkah kerja, kelola parameter form hasil ukur, dan bagikan QR code.
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/jobsheets/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Buat Jobsheet Baru
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode, judul, atau mapel..."
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
            <option value="all">Semua Kelas Target</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Judul Jobsheet & Spesifikasi</th>
                <th className="px-6 py-4">Mata Pelajaran</th>
                <th className="px-6 py-4">Kelas Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobsheets.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-black text-blue-600">{job.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ± {job.duration} Menit &bull; Level {job.difficulty} &bull; {job.steps?.length || 0} Langkah &bull; {job.measurements?.length || 0} Parameter Ukur
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[220px] font-medium">
                    {job.subject}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {job.target_class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewJobsheet(job)}
                        className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                        title="Lihat Pratinjau"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedQRJobsheet(job)}
                        className="p-2 text-slate-500 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-colors"
                        title="Generate & Cetak QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(job)}
                        className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
                        title="Duplikat Jobsheet"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/teacher/jobsheets/edit/${job.id}`)}
                        className="p-2 text-slate-500 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-colors"
                        title="Edit Jobsheet"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(job.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Hapus Jobsheet"
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

        {filteredJobsheets.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">Tidak ada jobsheet yang sesuai.</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        jobsheet={selectedQRJobsheet}
        isOpen={!!selectedQRJobsheet}
        onClose={() => setSelectedQRJobsheet(null)}
      />

      {/* Preview Modal */}
      {previewJobsheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-blue-600 block">{previewJobsheet.code}</span>
                <h3 className="font-bold text-slate-900 text-base">{previewJobsheet.title}</h3>
              </div>
              <button
                onClick={() => setPreviewJobsheet(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Deskripsi:</h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">{previewJobsheet.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Langkah Kerja ({previewJobsheet.steps.length}):</h4>
                <div className="space-y-2">
                  {previewJobsheet.steps.map((s, idx) => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{s.title}</p>
                        <p className="text-slate-600 mt-0.5 text-xs">{s.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Parameter Pengukuran ({previewJobsheet.measurements.length}):</h4>
                <div className="space-y-2">
                  {previewJobsheet.measurements.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{m.parameter}</span>
                      <span className="text-slate-500 font-semibold">{m.standard} ({m.unit})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewJobsheet(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-700"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Hapus Jobsheet Praktik?"
        message="Jobsheet ini akan dihapus permanen dari sistem dan tidak dapat dikerjakan siswa lagi."
        confirmText="Ya, Hapus Jobsheet"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
