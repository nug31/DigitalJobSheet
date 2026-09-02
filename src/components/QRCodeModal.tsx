import React from 'react';
import { X, Download, Printer, Copy, Check } from 'lucide-react';
import type { Jobsheet } from '../types';

interface QRCodeModalProps {
  jobsheet: Jobsheet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ jobsheet, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !jobsheet) return null;

  // We encode a URL or direct jobsheet code
  const qrData = `${window.location.origin}/student/jobsheet/${jobsheet.id}`;
  // High quality QR Code image generated via quickchart / qrserver api with clean SVG/PNG styling
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak QR Code - ${jobsheet.code}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
              color: #1e293b;
            }
            .card {
              display: inline-block;
              border: 3px dashed #0284c7;
              border-radius: 16px;
              padding: 30px;
              max-width: 400px;
              background: #f8fafc;
            }
            .header-tag {
              background: #0284c7;
              color: white;
              padding: 6px 14px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              display: inline-block;
              margin-bottom: 12px;
            }
            h1 { font-size: 20px; margin: 8px 0; color: #0f172a; }
            p { font-size: 13px; color: #64748b; margin: 4px 0 16px; }
            img { border-radius: 12px; border: 1px solid #cbd5e1; }
            .footer-info {
              margin-top: 16px;
              font-size: 12px;
              font-weight: 600;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header-tag">SMK MITRA INDUSTRI &middot; JOB SHEET</div>
            <h1>${jobsheet.title}</h1>
            <p>Kode: <strong>${jobsheet.code}</strong> &bull; ${jobsheet.subject}</p>
            <img src="${qrImageUrl}" alt="QR Code" width="240" height="240" />
            <div class="footer-info">
              <div>Scan QR menggunakan Kamera Siswa / Menu Scan</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">One QR &bull; One Job Sheet &bull; One Skill Passport</div>
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `QR_${jobsheet.code}.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {jobsheet.code}
            </span>
            <h3 className="font-bold text-slate-800 text-base">QR Code Praktik</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <h4 className="font-bold text-slate-900 text-lg mb-1">{jobsheet.title}</h4>
          <p className="text-xs text-slate-500 mb-6">{jobsheet.subject}</p>

          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 shadow-inner mb-6 relative group">
            <img
              src={qrImageUrl}
              alt={`QR Code ${jobsheet.code}`}
              className="w-56 h-56 rounded-xl object-contain mx-auto"
            />
            <div className="absolute inset-x-0 bottom-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-slate-900/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                Scan via Smartphone
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-6 leading-relaxed w-full">
            Tempelkan QR Code ini pada workstation, meja kerja bengkel, atau bagikan langsung kepada seluruh siswa praktikan.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" /> Cetak Label
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
