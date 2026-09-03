import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Storage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Jobsheet, MaterialItem, StepItem, MeasurementItem } from '../types';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Shield,
  Wrench,
  Layers,
  Upload
} from 'lucide-react';

export const TeacherJobsheetCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const toast = useToast();

  const isEditing = Boolean(id);
  const existingJob = isEditing ? Storage.getJobsheetById(id || '') : undefined;

  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'steps' | 'measurements'>('info');

  // Form State
  const [code, setCode] = useState(existingJob?.code || `JOB-${Math.floor(100 + Math.random() * 900)}`);
  const [title, setTitle] = useState(existingJob?.title || '');
  const [subject, setSubject] = useState(existingJob?.subject || 'Pemeliharaan Sasis dan Pemindah Tenaga Kendaraan Ringan');
  const [targetClass, setTargetClass] = useState(existingJob?.target_class || 'Kelas X');
  const [duration, setDuration] = useState(existingJob?.duration || 90);
  const [difficulty, setDifficulty] = useState<'Dasar' | 'Menengah' | 'Mahir'>(existingJob?.difficulty || 'Menengah');
  const [description, setDescription] = useState(existingJob?.description || '');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    existingJob?.learning_objectives || [
      'Siswa mampu menerapkan prosedur keselamatan kerja bengkel sesuai SOP',
      'Siswa mampu menggunakan alat ukur presisi dengan benar'
    ]
  );
  const [safetyPoints, setSafetyPoints] = useState<string[]>(
    existingJob?.safety_points || [
      'Wajib menggunakan Wearpack dan Safety Shoes',
      'Pastikan area kerja bersih dan bebas ceceran oli'
    ]
  );

  // Materials State
  const [materials, setMaterials] = useState<MaterialItem[]>(
    existingJob?.materials || [
      { id: 'm-1', name: 'Kunci Ring Pas Set', quantity: '1 Set', category: 'Alat', condition: 'Baik' },
      { id: 'm-2', name: 'Vernier Caliper 0.05mm', quantity: '1 Pcs', category: 'Alat Ukur', condition: 'Baik' }
    ]
  );

  // Steps State
  const [steps, setSteps] = useState<StepItem[]>(
    existingJob?.steps || [
      {
        id: 'step-1',
        step_number: 1,
        title: 'Persiapan Alat & Benda Kerja',
        instruction: 'Siapkan peralatan kerja, bersihkan benda kerja dari kotoran sebelum proses pengerjaan dimulai.',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      }
    ]
  );

  // Measurements State
  const [measurements, setMeasurements] = useState<MeasurementItem[]>(
    existingJob?.measurements || [
      {
        id: 'meas-1',
        parameter: 'Hasil Pengukuran Komponen',
        standard: 'Min 2.0 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 2.0,
        max_val: 10.0
      }
    ]
  );

  // Objective Helpers
  const addObjective = () => setLearningObjectives([...learningObjectives, '']);
  const updateObjective = (index: number, val: string) => {
    const arr = [...learningObjectives];
    arr[index] = val;
    setLearningObjectives(arr);
  };
  const removeObjective = (index: number) => setLearningObjectives(learningObjectives.filter((_, i) => i !== index));

  // Safety Point Helpers
  const addSafetyPoint = () => setSafetyPoints([...safetyPoints, '']);
  const updateSafetyPoint = (index: number, val: string) => {
    const arr = [...safetyPoints];
    arr[index] = val;
    setSafetyPoints(arr);
  };
  const removeSafetyPoint = (index: number) => setSafetyPoints(safetyPoints.filter((_, i) => i !== index));

  // Material Helpers
  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: `m-${Date.now()}`, name: '', quantity: '1 Unit', category: 'Alat', condition: 'Baik' }
    ]);
  };
  const updateMaterial = (index: number, field: keyof MaterialItem, val: any) => {
    const arr = [...materials];
    arr[index] = { ...arr[index], [field]: val };
    setMaterials(arr);
  };
  const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));

  // Step Helpers
  const addStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}`,
        step_number: nextNum,
        title: `Langkah Kerja ${nextNum}`,
        instruction: '',
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      }
    ]);
  };
  const updateStep = (index: number, field: keyof StepItem, val: any) => {
    const arr = [...steps];
    arr[index] = { ...arr[index], [field]: val };
    setSteps(arr);
  };
  const removeStep = (index: number) => {
    const arr = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 }));
    setSteps(arr);
  };

  // Measurement Helpers
  const addMeasurement = () => {
    setMeasurements([
      ...measurements,
      {
        id: `meas-${Date.now()}`,
        parameter: '',
        standard: 'Standar spesifikasi',
        unit: 'mm',
        input_type: 'number'
      }
    ]);
  };
  const updateMeasurement = (index: number, field: keyof MeasurementItem, val: any) => {
    const arr = [...measurements];
    arr[index] = { ...arr[index], [field]: val };
    setMeasurements(arr);
  };
  const removeMeasurement = (index: number) => setMeasurements(measurements.filter((_, i) => i !== index));

  // Save handler
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Gagal Menyimpan', 'Judul jobsheet wajib diisi.');
      setActiveTab('info');
      return;
    }

    const savedJob: Jobsheet = {
      id: existingJob?.id || `job-${Date.now()}`,
      code: code.trim(),
      title: title.trim(),
      subject: subject.trim(),
      target_class: targetClass,
      duration: Number(duration) || 90,
      difficulty,
      status: 'active',
      description: description.trim(),
      learning_objectives: learningObjectives.filter((o) => o.trim() !== ''),
      safety_points: safetyPoints.filter((s) => s.trim() !== ''),
      materials: materials.filter((m) => m.name.trim() !== ''),
      steps: steps.filter((s) => s.title.trim() !== ''),
      measurements: measurements.filter((m) => m.parameter.trim() !== ''),
      created_at: existingJob?.created_at || new Date().toISOString(),
      created_by: existingJob?.created_by || profile?.full_name || 'Guru Pengampu'
    };

    // 1. Save to localStorage for instant local reactivity
    Storage.saveJobsheet(savedJob);

    // 2. Sync to Supabase so students on any device can see updated photos
    try {
      await (supabase.from('jobsheets') as any).upsert({
        id: savedJob.id,
        code: savedJob.code,
        title: savedJob.title,
        subject: savedJob.subject,
        target_class: savedJob.target_class,
        duration: savedJob.duration,
        difficulty: savedJob.difficulty,
        status: savedJob.status,
        description: savedJob.description,
        learning_objectives: savedJob.learning_objectives,
        safety_points: savedJob.safety_points,
        materials: savedJob.materials,
        steps: savedJob.steps,
        measurements: savedJob.measurements,
        created_at: savedJob.created_at,
        created_by: savedJob.created_by
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Supabase jobsheet sync note:', err);
    }

    toast.success(
      isEditing ? 'Jobsheet Diperbarui' : 'Jobsheet Berhasil Dibuat!',
      `Jobsheet ${savedJob.code} siap dikerjakan siswa.`
    );
    navigate('/teacher/jobsheets');
  };

  // Image compressor & 200KB validator helper
  const processAndCompressImage = (file: File, callback: (base64: string) => void) => {
    const MAX_BYTES = 200 * 1024; // 200 KB

    const reader = new FileReader();
    reader.onload = (evt) => {
      const rawResult = evt.target?.result as string;
      if (!rawResult) return;

      if (file.size <= MAX_BYTES && !file.type.includes('bmp')) {
        callback(rawResult);
        toast.success('Foto Berhasil Dipilih', `Ukuran: ${(file.size / 1024).toFixed(1)} KB (di bawah 200 KB).`);
        return;
      }

      // Auto compress using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          callback(rawResult);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length * 0.75 > MAX_BYTES && quality > 0.25) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const finalSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
        if (dataUrl.length * 0.75 > MAX_BYTES) {
          toast.error(
            'Ukuran Foto Terlalu Besar',
            `Ukuran foto (${finalSizeKb} KB) melebihi batas 200 KB. Silakan pilih foto dengan resolusi lebih kecil.`
          );
          return;
        }

        callback(dataUrl);
        toast.success('Foto Dioptimalkan', `Ukuran foto disesuaikan menjadi ${finalSizeKb} KB (Maks 200 KB).`);
      };

      img.onerror = () => {
        toast.error('Format Tidak Didukung', 'Gagal memproses file gambar.');
      };

      img.src = rawResult;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teacher/jobsheets')}
            className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditing ? 'Edit Modul Jobsheet' : 'Buat Jobsheet Baru'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Desain langkah SOP, daftar alat & bahan, K3, dan form hasil ukur digital.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" /> Simpan Jobsheet
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar bg-white rounded-t-2xl px-4 pt-2 shadow-sm">
        {[
          { id: 'info', label: '1. Informasi Dasar', icon: BookOpen },
          { id: 'materials', label: '2. Alat, Bahan & K3', icon: Shield },
          { id: 'steps', label: '3. Langkah Kerja', icon: Layers },
          { id: 'measurements', label: '4. Form Parameter Ukur', icon: Wrench }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Kode Jobsheet
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="JOB-001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Target Kelas
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Kelas X">Kelas X</option>
                  <option value="Kelas XI">Kelas XI</option>
                  <option value="Kelas XII">Kelas XII</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Judul Jobsheet
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Misal: Pemeriksaan & Penggantian Kampas Rem Cakram"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama Mata Pelajaran Kejuruan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Estimasi Waktu (Menit)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Tingkat Kesulitan
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Dasar">Dasar</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Mahir">Mahir</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Deskripsi Pekerjaan
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsikan ruang lingkup praktik dan standar SOP yang digunakan..."
                />
              </div>
            </div>

            {/* Learning Objectives Builder */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-800 uppercase">
                  Tujuan Pembelajaran ({learningObjectives.length})
                </label>
                <button
                  type="button"
                  onClick={addObjective}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Tujuan
                </button>
              </div>

              <div className="space-y-2">
                {learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateObjective(idx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Masukkan capaian tujuan pembelajaran..."
                    />
                    <button
                      type="button"
                      onClick={() => removeObjective(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Lanjut: Alat, Bahan & K3
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Materials & Safety */}
        {activeTab === 'materials' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Materials List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-600" /> Daftar Alat & Bahan Praktik ({materials.length})
                </h3>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                {materials.map((m, idx) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                      placeholder="Nama Alat/Bahan (Contoh: Jangka Sorong)"
                      className="sm:col-span-5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <select
                      value={m.category}
                      onChange={(e) => updateMaterial(idx, 'category', e.target.value)}
                      className="sm:col-span-3 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Alat">Alat</option>
                      <option value="Bahan">Bahan</option>
                      <option value="Alat Ukur">Alat Ukur</option>
                      <option value="Alat Keselamatan">Alat Keselamatan</option>
                    </select>
                    <input
                      type="text"
                      value={m.quantity}
                      onChange={(e) => updateMaterial(idx, 'quantity', e.target.value)}
                      placeholder="Qty (1 Unit)"
                      className="sm:col-span-3 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterial(idx)}
                      className="sm:col-span-1 p-1.5 text-slate-400 hover:text-rose-600 flex justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Points */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600" /> Poin Aturan Keselamatan & K3 ({safetyPoints.length})
                </h3>
                <button
                  type="button"
                  onClick={addSafetyPoint}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Poin K3
                </button>
              </div>

              <div className="space-y-2">
                {safetyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updateSafetyPoint(idx, e.target.value)}
                      placeholder="Aturan K3 yang wajib dipatuhi siswa..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSafetyPoint(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-bold"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Lanjut: Langkah Kerja
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Step by Step SOP Builder */}
        {activeTab === 'steps' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Builder Langkah Kerja Praktik ({steps.length})
              </h3>
              <button
                type="button"
                onClick={addStep}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Langkah Baru
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 mr-4">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        placeholder="Judul Langkah Kerja"
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={step.estimated_minutes}
                        onChange={(e) => updateStep(idx, 'estimated_minutes', Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-center"
                        title="Estimasi Menit"
                      />
                      <span className="text-xs text-slate-500 font-medium">Min</span>
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                        Instruksi & SOP Langkah
                      </label>
                      <textarea
                        rows={2}
                        value={step.instruction}
                        onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
                        placeholder="Jelaskan tahapan pengerjaan secara detail dan aman..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase">
                        Gambar / Foto Ilustrasi SOP Langkah
                      </label>
                      
                      <div className="space-y-2">
                        {/* URL Input */}
                        <input
                          type="text"
                          value={step.image_url || ''}
                          onChange={(e) => updateStep(idx, 'image_url', e.target.value)}
                          placeholder="Tempel tautan gambar langsung (https://...jpg/png) atau upload file..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />

                        {/* File Upload Button & Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 cursor-pointer transition-colors active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih Foto dari Komputer/HP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                processAndCompressImage(file, (base64) => {
                                  updateStep(idx, 'image_url', base64);
                                });
                              }}
                            />
                          </label>

                          <span className="text-[11px] text-slate-500 font-medium">
                            (Maks 200 KB &bull; JPG/PNG)
                          </span>

                          {step.image_url && (
                            <button
                              type="button"
                              onClick={() => updateStep(idx, 'image_url', '')}
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors ml-auto"
                            >
                              Hapus Foto
                            </button>
                          )}
                        </div>

                        {/* Live Image Preview Thumbnail */}
                        {step.image_url && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 max-h-40 bg-slate-900 relative">
                            <img
                              src={step.image_url}
                              alt="Preview SOP"
                              className="w-full h-36 object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                              Preview Tampilan Siswa
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('materials')}
                className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-bold"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('measurements')}
                className="bg-blue-600 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Lanjut: Form Parameter Ukur
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Measurements Builder */}
        {activeTab === 'measurements' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-600" /> Form Parameter Hasil Pengukuran Presisi ({measurements.length})
              </h3>
              <button
                type="button"
                onClick={addMeasurement}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Parameter Ukur
              </button>
            </div>

            <div className="space-y-4">
              {measurements.map((m, idx) => (
                <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">Parameter #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMeasurement(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Nama Komponen / Parameter
                      </label>
                      <input
                        type="text"
                        value={m.parameter}
                        onChange={(e) => updateMeasurement(idx, 'parameter', e.target.value)}
                        placeholder="Misal: Ketebalan Kampas Rem Luar"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Standar Spesifikasi Buku Manual
                      </label>
                      <input
                        type="text"
                        value={m.standard}
                        onChange={(e) => updateMeasurement(idx, 'standard', e.target.value)}
                        placeholder="Misal: Min 2.0 mm"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Satuan Unit
                      </label>
                      <input
                        type="text"
                        value={m.unit}
                        onChange={(e) => updateMeasurement(idx, 'unit', e.target.value)}
                        placeholder="mm / Volt / -"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-bold"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Simpan Seluruh Jobsheet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
