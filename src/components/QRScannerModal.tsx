import React, { useState } from 'react';
import { X, QrCode, Search, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Storage } from '../lib/storage';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const jobsheets = Storage.getJobsheets();

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Masukkan kode jobsheet atau judul');
      return;
    }

    const found = jobsheets.find(
      (j) => j.code.toUpperCase() === trimmed || j.id.toLowerCase() === trimmed.toLowerCase() || j.title.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (found) {
      onClose();
      navigate(`/student/jobsheet/${found.id}`);
    } else {
      setError(`Jobsheet dengan kata kunci "${trimmed}" tidak ditemukan.`);
    }
  };

  const handleSimulateScan = (jobId: string) => {
    setIsScanning(true);
    setError(null);
    setTimeout(() => {
      setIsScanning(false);
      onClose();
      navigate(`/student/jobsheet/${jobId}`);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Scan QR / Cari Jobsheet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Simulation Body */}
        <div className="p-6">
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center text-white mb-6 border-2 border-slate-800 shadow-inner">
            {/* Camera Viewfinder graphics */}
            <div className="absolute inset-8 border-2 border-dashed border-blue-400/70 rounded-xl pointer-events-none flex items-center justify-center">
              {isScanning && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-[0_0_15px_#22d3ee]" />
              )}
            </div>

            {isScanning ? (
              <div className="flex flex-col items-center gap-2 z-10">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-bold text-cyan-200 tracking-wide uppercase">Membaca QR Code...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 z-10 px-4 text-center">
                <QrCode className="w-10 h-10 text-slate-400" />
                <p className="text-xs text-slate-300 font-medium">Arahkan kamera ke QR Code Jobsheet di meja bengkel</p>
              </div>
            )}
          </div>

          {/* Quick Select Buttons */}
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Simulasi Scan Cepat:</p>
            <div className="space-y-1.5">
              {jobsheets.slice(0, 3).map((j) => (
                <button
                  key={j.id}
                  onClick={() => handleSimulateScan(j.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl text-left text-xs transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-blue-600 block">{j.code}</span>
                    <span className="text-slate-700 font-medium truncate block">{j.title}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs font-semibold uppercase">atau ketik kode</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleSearch} className="mt-3">
            {error && <p className="text-xs text-rose-600 font-medium mb-2 bg-rose-50 p-2 rounded-lg">{error}</p>}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Misal: JOB-001"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0"
              >
                Buka
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
