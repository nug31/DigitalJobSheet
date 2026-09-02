import React, { useState, useEffect } from 'react';
import { Storage, subscribeStorage } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Submission, Jobsheet } from '../types';
import {
  Search,
  Clock,
  CheckCircle2,
  Wrench,
  Award,
  Save,
  X,
  CheckSquare
} from 'lucide-react';

export const TeacherAssessment: React.FC = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [submissions, setSubmissions] = useState(Storage.getSubmissions());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded'>('all');
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  // Scoring form state inside grading modal
  const [scoreK3, setScoreK3] = useState<number>(90);
  const [scoreSteps, setScoreSteps] = useState<number>(85);
  const [scoreMeasurements, setScoreMeasurements] = useState<number>(90);
  const [competencyStatus, setCompetencyStatus] = useState<'Kompeten' | 'Belum Kompeten'>('Kompeten');
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setSubmissions(Storage.getSubmissions());
    };
    return subscribeStorage(update);
  }, []);

  const openGradingModal = (sub: Submission) => {
    setGradingSubmission(sub);
    setScoreK3(sub.score_k3 ?? 90);
    setScoreSteps(sub.score_steps ?? 85);
    setScoreMeasurements(sub.score_measurements ?? 90);
    setCompetencyStatus(sub.competency_status ?? 'Kompeten');
    setFeedback(sub.teacher_feedback ?? 'Pengerjaan sesuai SOP dan data hasil pengukuran akurat.');
  };

  const calculatedTotalScore = Math.round(scoreK3 * 0.2 + scoreSteps * 0.4 + scoreMeasurements * 0.4);

  // Auto set competency based on total score
  useEffect(() => {
    if (calculatedTotalScore >= 75) {
      setCompetencyStatus('Kompeten');
    } else {
      setCompetencyStatus('Belum Kompeten');
    }
  }, [calculatedTotalScore]);

  const handleSaveGrade = () => {
    if (!gradingSubmission) return;

    const updated: Submission = {
      ...gradingSubmission,
      score_k3: scoreK3,
      score_steps: scoreSteps,
      score_measurements: scoreMeasurements,
      total_score: calculatedTotalScore,
      competency_status: competencyStatus,
      teacher_feedback: feedback,
      status: 'graded',
      graded_at: new Date().toISOString(),
      graded_by: profile?.full_name || 'Bpk. Andi Santoso, S.Pd'
    };

    Storage.saveSubmission(updated);
    setGradingSubmission(null);
    toast.success('Penilaian Berhasil Disimpan', `Nilai ${calculatedTotalScore} telah dikirim ke ${updated.student_name}`);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_nis.toLowerCase().includes(search.toLowerCase()) ||
      s.jobsheet_code.toLowerCase().includes(search.toLowerCase()) ||
      s.jobsheet_title.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const jobsheetInfo: Jobsheet | undefined = gradingSubmission
    ? Storage.getJobsheetById(gradingSubmission.jobsheet_id)
    : undefined;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Penilaian Praktik Siswa</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Evaluasi kepatuhan K3, pelaksanaan SOP kerja, dan akurasi data hasil ukur presisi siswa.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NIS, atau jobsheet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: 'Semua Submission' },
            { id: 'submitted', label: 'Menunggu Nilai' },
            { id: 'graded', label: 'Sudah Dinilai' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Siswa & NIS</th>
                <th className="px-6 py-4">Jobsheet Praktik</th>
                <th className="px-6 py-4">Waktu & Durasi</th>
                <th className="px-6 py-4">Status & Nilai</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {sub.student_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{sub.student_name}</p>
                        <p className="text-[11px] text-slate-400">NIS: {sub.student_nis} &bull; {sub.class_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600 text-xs block">{sub.jobsheet_code}</span>
                    <span className="text-slate-800 font-medium text-xs truncate max-w-[200px] block">{sub.jobsheet_title}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    <div>{Math.round(sub.duration_seconds / 60)} Menit</div>
                    <div className="text-[10px] text-slate-400">{new Date(sub.start_time).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4">
                    {sub.status === 'graded' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {sub.total_score} ({sub.competency_status})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Menunggu Nilai
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openGradingModal(sub)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        sub.status === 'graded'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                      }`}
                    >
                      {sub.status === 'graded' ? 'Edit Nilai' : 'Beri Nilai'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">Tidak ada data submission yang cocok.</p>
          </div>
        )}
      </div>

      {/* Comprehensive Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-blue-600 block">
                  {gradingSubmission.jobsheet_code} &bull; {gradingSubmission.class_name}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Evaluasi Praktik: {gradingSubmission.student_name} ({gradingSubmission.student_nis})
                </h3>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Submission Overview Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Durasi Praktik</p>
                  <p className="text-sm font-bold text-slate-800">{Math.round(gradingSubmission.duration_seconds / 60)} Menit</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">K3 Checklist</p>
                  <p className="text-sm font-bold text-emerald-600">
                    {Object.values(gradingSubmission.safety_checks || {}).filter(Boolean).length} Poin Terpenuhi
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Alat & Bahan</p>
                  <p className="text-sm font-bold text-blue-600">
                    {Object.values(gradingSubmission.material_checks || {}).filter(Boolean).length} Item Disiapkan
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Langkah Selesai</p>
                  <p className="text-sm font-bold text-slate-800">
                    {Object.values(gradingSubmission.step_data || {}).filter((x) => x.completed).length} Langkah
                  </p>
                </div>
              </div>

              {/* Measurements input comparison */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" /> Data Hasil Ukur Siswa
                </h4>
                <div className="space-y-2">
                  {jobsheetInfo?.measurements.map((m) => {
                    const enteredVal = gradingSubmission.measurements_data?.[m.id] || '-';
                    return (
                      <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{m.parameter}</p>
                          <p className="text-[11px] text-slate-500">Standar Spesifikasi: {m.standard}</p>
                        </div>
                        <span className="font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-sm">
                          {enteredVal} {m.unit !== '-' ? m.unit : ''}
                        </span>
                      </div>
                    );
                  })}
                  {(!jobsheetInfo?.measurements || jobsheetInfo.measurements.length === 0) && (
                    <p className="text-slate-400 italic text-xs">Tidak ada form parameter hasil ukur.</p>
                  )}
                </div>
              </div>

              {/* Student Notes */}
              {gradingSubmission.student_notes && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan dari Siswa:</span>
                  <p className="text-slate-700 italic text-xs">"{gradingSubmission.student_notes}"</p>
                </div>
              )}

              {/* Scoring Form Rubric */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" /> Rubrik Penilaian Instruktur
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skor K3 & Sikap Kerja (20%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreK3}
                      onChange={(e) => setScoreK3(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skor Langkah SOP (40%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreSteps}
                      onChange={(e) => setScoreSteps(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skor Hasil Ukur (40%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreMeasurements}
                      onChange={(e) => setScoreMeasurements(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center"
                    />
                  </div>
                </div>

                {/* Total Score Display & Status */}
                <div className="bg-white p-4 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Nilai Akhir Terhitung:</span>
                    <p className="text-3xl font-black text-blue-600">{calculatedTotalScore} / 100</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCompetencyStatus('Kompeten')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                        competencyStatus === 'Kompeten'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Kompeten
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompetencyStatus('Belum Kompeten')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                        competencyStatus === 'Belum Kompeten'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Belum Kompeten
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan & Masukan Evaluasi Guru
                  </label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tuliskan masukan atau evaluasi untuk siswa ini..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setGradingSubmission(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGrade}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Simpan & Kirim Nilai ke Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
