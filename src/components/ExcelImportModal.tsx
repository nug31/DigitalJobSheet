import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '../contexts/ToastContext';
import { Storage } from '../lib/storage';
import type { UserProfile } from '../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Users
} from 'lucide-react';

interface ParsedStudent {
  nisn: string;
  fullName: string;
  className: string;
  email: string;
  valid: boolean;
  errorMsg?: string;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [parsedList, setParsedList] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'sql'>('preview');

  if (!isOpen) return null;

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NISN: '0071234567',
        'Nama Lengkap': 'Muhammad Rizky Pratama',
        Kelas: 'XI TKR 1',
        Email: '0071234567@siswa.mitra.sch.id'
      },
      {
        NISN: '0071234568',
        'Nama Lengkap': 'Ahmad Fauzi Setiawan',
        Kelas: 'XI TKR 1',
        Email: '0071234568@siswa.mitra.sch.id'
      },
      {
        NISN: '0071234569',
        'Nama Lengkap': 'Bagas Aditya Nugraha',
        Kelas: 'XI TKR 1',
        Email: '0071234569@siswa.mitra.sch.id'
      },
      {
        NISN: '0071234570',
        'Nama Lengkap': 'Dwi Putra Prasetyo',
        Kelas: 'X TKR 1',
        Email: '0071234570@siswa.mitra.sch.id'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    // Auto width
    worksheet['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 35 }];

    XLSX.writeFile(workbook, 'Template_Import_Siswa_NISN.xlsx');
    toast.success('Template Diunduh', 'File Template_Import_Siswa_NISN.xlsx siap diisi.');
  };

  // Handle File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          toast.error('File Kosong', 'Tidak ada baris data siswa yang ditemukan pada file Excel.');
          return;
        }

        const parsed: ParsedStudent[] = rawJson.map((row) => {
          // Normalize column headers
          const nisn = String(
            row['NISN'] || row['nisn'] || row['NIS'] || row['nis'] || row['Nomor Induk'] || row['no_induk'] || ''
          ).trim();

          const fullName = String(
            row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['nama_lengkap'] || row['Nama Siswa'] || ''
          ).trim();

          const className = String(
            row['Kelas'] || row['kelas'] || row['Rombel'] || row['rombel'] || 'XI TKR 1'
          ).trim();

          const email = String(
            row['Email'] || row['email'] || (nisn ? `${nisn}@siswa.mitra.sch.id` : '')
          ).trim();

          let valid = true;
          let errorMsg = '';

          if (!nisn) {
            valid = false;
            errorMsg = 'NISN kosong';
          } else if (!fullName) {
            valid = false;
            errorMsg = 'Nama kosong';
          }

          return {
            nisn,
            fullName,
            className,
            email,
            valid,
            errorMsg
          };
        });

        setParsedList(parsed);
        const validCount = parsed.filter((p) => p.valid).length;
        toast.success('File Berhasil Dibaca', `Ditemukan ${validCount} data siswa valid dari ${parsed.length} baris.`);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('Gagal Membaca File', 'Format file Excel tidak valid atau rusak.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Save to App Database (Storage / Local)
  const handleSaveToDatabase = () => {
    const validStudents = parsedList.filter((p) => p.valid);
    if (validStudents.length === 0) {
      toast.error('Tidak Ada Data Valid', 'Periksa kembali file Excel Anda.');
      return;
    }

    let addedCount = 0;
    validStudents.forEach((st) => {
      const newProfile: UserProfile = {
        id: `student-${st.nisn}-${Date.now()}`,
        full_name: st.fullName,
        email: st.email || `${st.nisn}@siswa.mitra.sch.id`,
        nis_nip: st.nisn,
        role: 'student',
        class_name: st.className,
        avatar_url: null
      };

      Storage.saveUser(newProfile);
      addedCount++;
    });

    toast.success('Import Berhasil!', `${addedCount} akun siswa berhasil ditambahkan ke database sistem.`);
    if (onSuccess) onSuccess();
    onClose();
  };

  // Generate Supabase SQL Insert
  const generateSupabaseSQL = () => {
    const validStudents = parsedList.filter((p) => p.valid);
    if (validStudents.length === 0) return '-- Tidak ada data siswa yang valid.';

    const queries = validStudents
      .map(
        (st) =>
          `SELECT create_student_account('${st.nisn}', '${st.fullName.replace(/'/g, "''")}', '${st.className.replace(/'/g, "''")}');`
      )
      .join('\n');

    return `-- Eksekusi pembuatan akun siswa batch di Supabase SQL Editor:\n-- Password default diset otomatis sama dengan NISN\n\n${queries}`;
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(generateSupabaseSQL());
    setCopiedSQL(true);
    toast.success('SQL Berhasil Disalin', 'Buka Supabase SQL Editor lalu Paste & Run.');
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  const validCount = parsedList.filter((p) => p.valid).length;
  const invalidCount = parsedList.filter((p) => !p.valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Import Data Siswa via Excel (.xlsx / .csv)</h3>
              <p className="text-xs text-slate-500">Username dan password siswa akan otomatis diset menggunakan NISN</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Download Template & Upload Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  1. Format File Excel
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gunakan format template standar dengan kolom: <strong>NISN</strong>, <strong>Nama Lengkap</strong>, dan <strong>Kelas</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-4 flex items-center justify-center gap-2 bg-white hover:bg-emerald-100 text-emerald-800 font-bold px-4 py-2.5 rounded-xl border border-emerald-300 text-xs transition-colors shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Download Template Excel (.xlsx)
              </button>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">
                  2. Upload File Excel Siswa
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {fileName ? (
                    <span className="font-bold text-blue-900 truncate block">File: {fileName}</span>
                  ) : (
                    'Pilih file .xlsx, .xls, atau .csv dari komputer Anda.'
                  )}
                </p>
              </div>
              <label className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Pilih File Excel / CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Step 2: Parsed Preview or SQL Code */}
          {parsedList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Pratinjau Data:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {invalidCount} Tidak Valid
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveView('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeView === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Tabel Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('sql')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeView === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    SQL Supabase
                  </button>
                </div>
              </div>

              {activeView === 'preview' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">NISN (Username/PW)</th>
                        <th className="px-4 py-2.5">Nama Lengkap</th>
                        <th className="px-4 py-2.5">Kelas</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedList.map((st, idx) => (
                        <tr key={idx} className={st.valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="px-4 py-2.5 font-bold font-mono text-blue-700">{st.nisn || '-'}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{st.fullName || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600">{st.className}</td>
                          <td className="px-4 py-2.5">
                            {st.valid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Siap Import
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> {st.errorMsg}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-900 text-white px-4 py-2 rounded-t-xl text-xs">
                    <span className="font-mono text-slate-300">Supabase SQL Batch Insert</span>
                    <button
                      type="button"
                      onClick={handleCopySQL}
                      className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      {copiedSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSQL ? 'Tersalin!' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-xl overflow-x-auto max-h-56 leading-relaxed">
                    {generateSupabaseSQL()}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            {parsedList.length > 0 ? (
              <span>
                Total <strong>{validCount}</strong> siswa valid siap di-import.
              </span>
            ) : (
              'Unggah file Excel untuk memproses data siswa.'
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
            >
              Batal
            </button>

            {parsedList.length > 0 && (
              <button
                type="button"
                onClick={handleSaveToDatabase}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Simpan {validCount} Siswa ke Database</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
