import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Storage } from '../lib/storage';
import type { Jobsheet, Submission, StepSubmissionData } from '../types';
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Printer,
  Save,
  Send,
  Check,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const StudentJobsheetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const toast = useToast();

  const jobsheet: Jobsheet = Storage.getJobsheetById(id || '') || Storage.getJobsheets()[0];
  const existingSubmission: Submission | undefined = profile ? Storage.getStudentSubmissionForJobsheet(profile.id, jobsheet.id) : undefined;

  const [activeTab, setActiveTab] = useState<'info' | 'k3' | 'steps'>('info');

  // Interactive Form States
  const [safetyChecks, setSafetyChecks] = useState<Record<string, boolean>>({});
  const [materialChecks, setMaterialChecks] = useState<Record<string, boolean>>({});
  const [stepData, setStepData] = useState<Record<string, StepSubmissionData>>({});
  const [measurementsData, setMeasurementsData] = useState<Record<string, string>>({});
  const [studentNotes, setStudentNotes] = useState<string>('');

  // Image fallback tracking
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Stopwatch States
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Initialize state from existing submission if any
  useEffect(() => {
    if (existingSubmission) {
      setSafetyChecks(existingSubmission.safety_checks || {});
      setMaterialChecks(existingSubmission.material_checks || {});
      setStepData(existingSubmission.step_data || {});
      setMeasurementsData(existingSubmission.measurements_data || {});
      setStudentNotes(existingSubmission.student_notes || '');
      setElapsedSeconds(existingSubmission.duration_seconds || 0);

      if (existingSubmission.status === 'graded' || existingSubmission.status === 'submitted') {
        setActiveTab('steps');
      }
    }
  }, [existingSubmission?.id]);

  // Stopwatch ticker
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isReadOnly = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'graded';

  const toggleSafetyCheck = (index: number) => {
    if (isReadOnly) return;
    setSafetyChecks((prev) => ({
      ...prev,
      [index.toString()]: !prev[index.toString()]
    }));
  };

  const toggleMaterialCheck = (materialId: string) => {
    if (isReadOnly) return;
    setMaterialChecks((prev) => ({
      ...prev,
      [materialId]: !prev[materialId]
    }));
  };

  const toggleStepCompleted = (stepId: string) => {
    if (isReadOnly) return;
    setStepData((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        completed: !prev[stepId]?.completed
      }
    }));
  };

  const handleSaveDraft = () => {
    if (!profile) return;
    const submissionId = existingSubmission ? existingSubmission.id : `sub-${Date.now()}`;
    const newSubmission: Submission = {
      id: submissionId,
      jobsheet_id: jobsheet.id,
      jobsheet_code: jobsheet.code,
      jobsheet_title: jobsheet.title,
      student_id: profile.id,
      student_name: profile.full_name,
      student_nis: profile.nis_nip || '2024001',
      class_name: profile.class_name || 'XI TKR 1',
      start_time: existingSubmission?.start_time || new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      safety_checks: safetyChecks,
      material_checks: materialChecks,
      step_data: stepData,
      measurements_data: measurementsData,
      student_notes: studentNotes,
      status: 'draft'
    };
    Storage.saveSubmission(newSubmission);
    toast.success('Draf Disimpan', 'Progres praktik Anda tersimpan dengan aman.');
  };

  const handleSubmit = () => {
    if (!profile) return;
    setTimerRunning(false);
    const submissionId = existingSubmission ? existingSubmission.id : `sub-${Date.now()}`;
    const newSubmission: Submission = {
      id: submissionId,
      jobsheet_id: jobsheet.id,
      jobsheet_code: jobsheet.code,
      jobsheet_title: jobsheet.title,
      student_id: profile.id,
      student_name: profile.full_name,
      student_nis: profile.nis_nip || '2024001',
      class_name: profile.class_name || 'XI TKR 1',
      start_time: existingSubmission?.start_time || new Date().toISOString(),
      finish_time: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      safety_checks: safetyChecks,
      material_checks: materialChecks,
      step_data: stepData,
      measurements_data: measurementsData,
      student_notes: studentNotes,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    };
    Storage.saveSubmission(newSubmission);
    setIsSubmitModalOpen(false);
    toast.success('Pekerjaan Berhasil Dikumpulkan!', 'Tugas Anda telah diserahkan ke guru.');
  };

  // Completed steps count
  const completedStepsCount = Object.values(stepData).filter((s) => s.completed).length;
  const progressPercent = jobsheet.steps.length > 0 ? Math.round((completedStepsCount / jobsheet.steps.length) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-28">
      {/* Header Info Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-xs">
                  {jobsheet.code}
                </span>
                {existingSubmission?.status === 'graded' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Nilai: {existingSubmission.total_score}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {jobsheet.title}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{jobsheet.subject}</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Cetak Jobsheet"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Live Stopwatch & Progress Header */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Stopwatch */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Timer Praktik Siswa
                </span>
                <span className="font-mono text-xl font-black tracking-wider text-cyan-300">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                    timerRunning
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? 'Jeda' : 'Mulai Timer'}</span>
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setElapsedSeconds(0);
                  }}
                  className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step Progress Bar */}
          <div className="w-full sm:w-64 pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-4">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Progres Pengerjaan</span>
              <span className="text-white font-bold">{completedStepsCount} / {jobsheet.steps.length} Selesai</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Graded Result Card (If already evaluated by teacher) */}
      {existingSubmission?.status === 'graded' && (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {existingSubmission.total_score}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Hasil Evaluasi Praktik</h3>
                <p className="text-xs text-slate-600">
                  Dinilai oleh <strong>{existingSubmission.graded_by}</strong>
                </p>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
              {existingSubmission.competency_status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">K3 & Sikap</p>
              <p className="text-base sm:text-lg font-black text-slate-800">{existingSubmission.score_k3 || 0}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Langkah SOP</p>
              <p className="text-base sm:text-lg font-black text-slate-800">{existingSubmission.score_steps || 0}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hasil Ukur</p>
              <p className="text-base sm:text-lg font-black text-slate-800">{existingSubmission.score_measurements || 0}</p>
            </div>
          </div>

          {existingSubmission.teacher_feedback && (
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 block mb-0.5">Catatan Masukan Guru:</span>
              <p className="text-slate-700 italic">"{existingSubmission.teacher_feedback}"</p>
            </div>
          )}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="grid grid-cols-3 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 gap-1">
        {[
          { id: 'info', label: '1. Tujuan & SOP', icon: BookOpen },
          { id: 'k3', label: '2. Alat & K3', icon: Shield },
          { id: 'steps', label: '3. Praktik & Ukur', icon: Wrench }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Info */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Deskripsi Pekerjaan
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {jobsheet.description}
            </div>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Capaian Tujuan Praktik
            </h2>
            <div className="space-y-2">
              {jobsheet.learning_objectives.map((obj, i) => (
                <div key={i} className="flex gap-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('k3')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
            >
              Lanjut ke Persiapan Alat & K3 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: K3 and Tools Checklist */}
      {activeTab === 'k3' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-7 space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" /> Checklist Alat & Bahan Praktik
              </h2>
              <span className="text-[11px] text-slate-400 font-semibold">Ketuk untuk centang</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {jobsheet.materials.map((m) => {
                const isChecked = !!materialChecks[m.id];
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMaterialCheck(m.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.category} &bull; {m.condition}</p>
                      </div>
                    </div>
                    <span className="bg-white text-slate-700 font-bold px-2 py-0.5 rounded-md text-xs border border-slate-200 shrink-0 ml-2">
                      {m.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-500" /> Aturan Keselamatan & APD (K3)
            </h2>
            <div className="space-y-2.5">
              {jobsheet.safety_points.map((point, i) => {
                const isChecked = !!safetyChecks[i.toString()];
                return (
                  <div
                    key={i}
                    onClick={() => toggleSafetyCheck(i)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-xs'
                        : 'bg-rose-50/40 border-rose-200 text-slate-800 hover:border-rose-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-emerald-600 text-white' : 'border-2 border-rose-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-snug">{point}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-between gap-3">
            <button
              onClick={() => setActiveTab('info')}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-4 py-2 font-bold text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button
              onClick={() => setActiveTab('steps')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
            >
              Mulai Langkah Praktik <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Steps & Measurements */}
      {activeTab === 'steps' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Steps */}
          <div className="space-y-4">
            {jobsheet.steps.map((step) => {
              const currentStepData = stepData[step.id] || { completed: false };
              const isCompleted = currentStepData.completed;
              const isImgFailed = failedImages[step.id];

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${
                    isCompleted ? 'border-emerald-300' : 'border-slate-200'
                  }`}
                >
                  <div
                    className={`p-4 border-b flex items-center justify-between ${
                      isCompleted ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          isCompleted ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                        }`}
                      >
                        {step.step_number}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{step.title}</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      ± {step.estimated_minutes} Min
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* SOP Illustration / Diagram */}
                    {step.image_url && !isImgFailed ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative group">
                        <img
                          src={step.image_url}
                          alt={step.title}
                          loading="lazy"
                          onError={() => setFailedImages((prev) => ({ ...prev, [step.id]: true }))}
                          className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                          <ImageIcon className="w-3 h-3 text-blue-400" />
                          <span>Panduan SOP Visual</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-900">SOP Tahap #{step.step_number}: {step.title}</p>
                          <p className="text-[11px] text-blue-700">Lakukan pengerjaan sesuai instruksi detail di bawah ini.</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
                      {step.instruction}
                    </p>

                    {/* Action Buttons for this Step */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(step.id)}
                        disabled={isReadOnly}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-md border-2 border-slate-400" />}
                        {isCompleted ? 'Langkah Selesai' : 'Tandai Selesai'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Measurements Form */}
          {jobsheet.measurements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Form Hasil Pengukuran Presisi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan nilai angka hasil ukur dengan jangka sorong / micrometer
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {jobsheet.measurements.map((m) => {
                  const val = measurementsData[m.id] || '';
                  const hasValue = val.trim().length > 0;
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        hasValue ? 'bg-blue-50/40 border-blue-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="mb-2">
                        <label className="block text-xs font-bold text-slate-800 leading-snug">
                          {m.parameter}
                        </label>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          {m.standard}
                        </p>
                      </div>

                      <div className="mt-2">
                        {m.input_type === 'select' ? (
                          <select
                            value={val}
                            disabled={isReadOnly}
                            onChange={(e) => setMeasurementsData((prev) => ({ ...prev, [m.id]: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Pilih Hasil Pemeriksaan --</option>
                            {m.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={val}
                              disabled={isReadOnly}
                              onChange={(e) => setMeasurementsData((prev) => ({ ...prev, [m.id]: e.target.value }))}
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-600 px-3 py-2.5 bg-slate-200 rounded-xl">
                              {m.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5 uppercase">
              Catatan & Kesimpulan Praktik Siswa
            </label>
            <textarea
              rows={3}
              value={studentNotes}
              disabled={isReadOnly}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="Tuliskan temuan kondisi komponen atau kendala saat pengerjaan..."
              className="w-full p-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Floating Bottom Sticky Action Bar (For effortless mobile/desktop submission) */}
      {!isReadOnly ? (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-40 shadow-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Simpan Draf</span>
              <span className="sm:hidden">Draf</span>
            </button>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex-2 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 sm:px-8 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kumpulkan Pekerjaan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Jobsheet telah diserahkan</span>
            </div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={isSubmitModalOpen}
        title="Kumpulkan Jobsheet Praktik?"
        message="Pastikan Anda telah mengisi seluruh checklist K3 dan mengisi form hasil pengukuran sebelum menyerahkan tugas ke guru."
        confirmText="Ya, Kumpulkan Sekarang"
        cancelText="Periksa Kembali"
        confirmVariant="success"
        onConfirm={handleSubmit}
        onCancel={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
};
