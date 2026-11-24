import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Storage, subscribeStorage, startCloudSync } from '../lib/storage';
import type { Jobsheet, Submission } from '../types';
import { BookOpen, Maximize2, Minimize2, X } from 'lucide-react';

const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const clockTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface Celebration {
  id: string;
  name: string;
  className: string;
  jobsheet: string;
  score?: number;
}

// Flat broadcast / timing-board look: one accent (workshop yellow), hairlines, monospace figures
const ACCENT = '#F5B400';
const mono = 'font-mono tabular-nums';
const panel = 'bg-[#141518] border border-[#26282D] rounded-md';
const label = 'text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8F98]';

// Full-screen live monitor for the projector during the exhibition
export const ExhibitionMode: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>(() => Storage.getSubmissions());
  const [jobsheets, setJobsheets] = useState<Jobsheet[]>(() => Storage.getJobsheets());
  const [now, setNow] = useState(() => new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrJobsheetId, setQrJobsheetId] = useState('');
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const announcedRef = useRef<Set<string> | null>(null);

  // Poll faster than the normal portal so the projector feels live
  useEffect(() => {
    const update = () => {
      setSubmissions(Storage.getSubmissions());
      setJobsheets(Storage.getJobsheets());
    };
    const unsubscribe = subscribeStorage(update);
    const stopSync = startCloudSync(5000);
    return () => {
      unsubscribe();
      stopSync();
    };
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  // Announce every newly submitted or graded jobsheet (skip what was already there on open)
  useEffect(() => {
    const finished = submissions.filter((s) => s.status === 'submitted' || s.status === 'graded');
    const keys = finished.map((s) => `${s.id}:${s.status}`);
    if (announcedRef.current === null) {
      announcedRef.current = new Set(keys);
      return;
    }
    const fresh = finished.find((s) => !announcedRef.current!.has(`${s.id}:${s.status}`));
    keys.forEach((k) => announcedRef.current!.add(k));
    if (fresh) {
      setCelebration({
        id: `${fresh.id}:${fresh.status}`,
        name: fresh.student_name,
        className: fresh.class_name,
        jobsheet: `${fresh.jobsheet_code} · ${fresh.jobsheet_title}`,
        score: fresh.status === 'graded' ? fresh.total_score : undefined
      });
    }
  }, [submissions]);

  useEffect(() => {
    if (!celebration) return;
    const t = window.setTimeout(() => setCelebration(null), 7000);
    return () => window.clearTimeout(t);
  }, [celebration]);

  const jobsheetFor = (sub: Submission) =>
    jobsheets.find((j) => j.id === sub.jobsheet_id) || jobsheets.find((j) => j.code === sub.jobsheet_code);

  const today = useMemo(() => submissions.filter((s) => isToday(s.start_time) || isToday(s.submitted_at)), [submissions]);
  const working = today
    .filter((s) => s.status === 'draft')
    .sort((a, b) => (b.start_time || '').localeCompare(a.start_time || ''));
  const submittedToday = today.filter((s) => s.status === 'submitted' || s.status === 'graded');
  const gradedToday = submittedToday.filter((s) => s.status === 'graded');
  const kompetenToday = gradedToday.filter((s) => s.competency_status === 'Kompeten');
  const avgToday = gradedToday.length
    ? Math.round(gradedToday.reduce((a, b) => a + (b.total_score || 0), 0) / gradedToday.length)
    : 0;

  // All-time leaderboard: average graded score per student
  const leaderboard = useMemo(() => {
    const map = new Map<string, { name: string; cls: string; total: number; count: number }>();
    submissions
      .filter((s) => s.status === 'graded' && typeof s.total_score === 'number')
      .forEach((s) => {
        const cur = map.get(s.student_id) || { name: s.student_name, cls: s.class_name, total: 0, count: 0 };
        cur.total += s.total_score || 0;
        cur.count += 1;
        map.set(s.student_id, cur);
      });
    return Array.from(map.values())
      .map((v) => ({ ...v, avg: Math.round(v.total / v.count) }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 5);
  }, [submissions]);

  const feed = useMemo(() => {
    const events: { key: string; at: string; text: string; tone: 'start' | 'submit' | 'grade' }[] = [];
    submissions.forEach((s) => {
      if (s.start_time) events.push({ key: `${s.id}-s`, at: s.start_time, text: `${s.student_name} (${s.class_name}) mulai ${s.jobsheet_code}`, tone: 'start' });
      if (s.submitted_at) events.push({ key: `${s.id}-u`, at: s.submitted_at, text: `${s.student_name} mengumpulkan ${s.jobsheet_code}`, tone: 'submit' });
      if (s.graded_at) events.push({ key: `${s.id}-g`, at: s.graded_at, text: `${s.student_name} — nilai ${s.total_score}, ${s.competency_status}`, tone: 'grade' });
    });
    const order = { grade: 2, submit: 1, start: 0 };
    return events.sort((a, b) => b.at.localeCompare(a.at) || order[b.tone] - order[a.tone]).slice(0, 12);
  }, [submissions]);

  const activeJobsheets = jobsheets.filter((j) => j.status === 'active');
  const qrTarget = qrJobsheetId ? `${window.location.origin}/student/jobsheet/${qrJobsheetId}` : `${window.location.origin}/login`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=4&data=${encodeURIComponent(qrTarget)}`;
  const qrJob = activeJobsheets.find((j) => j.id === qrJobsheetId);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be blocked (e.g. iOS Safari); the page still works without it
    }
  };

  const stats = [
    { label: 'Sedang praktik', value: working.length, note: 'siswa di bengkel' },
    { label: 'Dikumpulkan', value: submittedToday.length, note: 'jobsheet hari ini' },
    { label: 'Kompeten', value: kompetenToday.length, note: 'lulus hari ini' },
    { label: 'Rata-rata nilai', value: avgToday || '—', note: 'dari yang dinilai' }
  ];

  const tickerText = feed.length
    ? feed.map((e) => `${clockTime(e.at)}  ${e.text}`).join('      •      ')
    : 'Menunggu aktivitas pertama — scan QR di layar untuk mencoba jobsheet digital';

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#E8E9EB] overflow-x-hidden pb-14">
      <style>{`
        @keyframes pameran-ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes pameran-slide { from { transform: translateX(-24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes pameran-blink { 50% { opacity: .25 } }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 h-16 sm:h-20 border-b border-[#26282D]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-md flex items-center justify-center shrink-0" style={{ background: ACCENT }}>
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-base sm:text-xl tracking-tight leading-none truncate">MITRA Digital Job Sheet</p>
            <p className={`${label} mt-1.5 truncate`}>Monitor Praktik Bengkel</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <span className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#FF4D4D]">
            <span className="h-2 w-2 rounded-full bg-[#FF4D4D]" style={{ animation: 'pameran-blink 1.6s steps(1) infinite' }} />
            LIVE
          </span>
          <div className="text-right">
            <p className={`${mono} font-bold text-xl sm:text-3xl leading-none`}>
              {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className={`hidden sm:block ${label} mt-1.5`}>
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleFullscreen} className="p-2 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/5" title="Layar penuh">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={() => navigate('/teacher/dashboard')} className="p-2 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/5" title="Keluar Mode Pameran">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px] gap-4 sm:gap-6 p-4 sm:p-6 2xl:p-8">
        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Stats strip */}
          <div className={`${panel} grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#26282D]`}>
            {stats.map((s, i) => (
              <div key={s.label} className="p-4 sm:p-6">
                <p className={label}>{s.label}</p>
                <p className={`${mono} font-bold text-5xl sm:text-7xl leading-none mt-3`} style={i === 0 && working.length ? { color: ACCENT } : undefined}>
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm text-[#8A8F98] mt-2">{s.note}</p>
              </div>
            ))}
          </div>

          {/* Live work board */}
          <section className={panel}>
            <div className="flex items-baseline justify-between px-4 sm:px-6 py-4 border-b border-[#26282D]">
              <h2 className="font-extrabold text-lg sm:text-2xl tracking-tight">Sedang Mengerjakan</h2>
              <p className={label}>{working.length} aktif · diperbarui otomatis</p>
            </div>

            {working.length === 0 ? (
              <div className="px-6 py-14 sm:py-20 text-center">
                <p className="text-base sm:text-xl font-semibold">Belum ada siswa yang praktik.</p>
                <p className="text-sm sm:text-base text-[#8A8F98] mt-2">Scan QR di layar untuk mencoba jobsheet digital.</p>
              </div>
            ) : (
              <div>
                <div className={`hidden md:grid grid-cols-[2.2rem_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1.6fr)_4.5rem] gap-4 px-6 py-2.5 border-b border-[#26282D] ${label}`}>
                  <span>#</span>
                  <span>Siswa</span>
                  <span>Jobsheet</span>
                  <span>Progres langkah</span>
                  <span className="text-right">Waktu</span>
                </div>
                {working.slice(0, 8).map((s, idx) => {
                  const job = jobsheetFor(s);
                  const totalSteps = job?.steps?.length || 0;
                  const stepsDone = (job?.steps || []).map((st) => Boolean(s.step_data?.[st.id]?.completed));
                  const doneCount = stepsDone.filter(Boolean).length;
                  const k3Total = job?.safety_points?.length || 0;
                  const k3Done = Object.values(s.safety_checks || {}).filter(Boolean).length;
                  const measTotal = job?.measurements?.length || 0;
                  const measDone = Object.values(s.measurements_data || {}).filter((v) => String(v).trim()).length;
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-[2.2rem_minmax(0,1fr)_4.5rem] md:grid-cols-[2.2rem_minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1.6fr)_4.5rem] gap-x-4 gap-y-2 items-center px-4 sm:px-6 py-4 border-b border-[#26282D] last:border-b-0"
                    >
                      <span className={`${mono} text-[#8A8F98] font-bold`}>{String(idx + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-base sm:text-lg leading-tight truncate">{s.student_name}</p>
                        <p className="text-xs sm:text-sm text-[#8A8F98] truncate">{s.class_name}</p>
                      </div>
                      <div className="min-w-0 hidden md:block">
                        <p className={`${mono} text-sm font-bold`} style={{ color: ACCENT }}>{s.jobsheet_code}</p>
                        <p className="text-xs sm:text-sm text-[#B8BCC4] truncate">{s.jobsheet_title}</p>
                      </div>
                      <div className="col-span-3 md:col-span-1 row-start-2 md:row-start-auto min-w-0">
                        <div className="flex gap-1">
                          {(totalSteps ? stepsDone : [false]).map((done, i) => (
                            <span
                              key={i}
                              className="h-2.5 flex-1 rounded-[2px] transition-colors duration-500"
                              style={{ background: done ? ACCENT : '#2A2C31' }}
                            />
                          ))}
                        </div>
                        <p className={`${mono} text-[11px] sm:text-xs text-[#8A8F98] mt-1.5`}>
                          LANGKAH {doneCount}/{totalSteps} · K3 {k3Done}/{k3Total} · UKUR {measDone}/{measTotal}
                        </p>
                      </div>
                      <span className={`${mono} text-right text-base sm:text-xl font-bold col-start-3 row-start-1 md:col-start-auto md:row-start-auto`}>
                        {formatDuration(s.duration_seconds || 0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-4 sm:space-y-6">
          <section className={`${panel} p-5`}>
            <p className={label}>Coba sekarang</p>
            <p className="font-extrabold text-xl sm:text-2xl tracking-tight mt-1">Scan dengan kamera HP</p>
            <div className="bg-white rounded-md p-3 mt-4 flex justify-center">
              <img src={qrImage} alt="QR code untuk mencoba" className="w-48 h-48 2xl:w-64 2xl:h-64" />
            </div>
            <p className="text-sm text-[#B8BCC4] mt-3 truncate">
              {qrJob ? `${qrJob.code} · ${qrJob.title}` : 'Masuk dengan NISN, password = NISN'}
            </p>
            <select
              value={qrJobsheetId}
              onChange={(e) => setQrJobsheetId(e.target.value)}
              className="mt-3 w-full bg-[#0B0C0E] border border-[#26282D] rounded-md px-3 py-2 text-sm text-[#E8E9EB] focus:outline-none focus:border-[#F5B400]"
            >
              <option value="">Arahkan QR ke: halaman login</option>
              {activeJobsheets.map((j) => (
                <option key={j.id} value={j.id}>
                  Arahkan QR ke: {j.code} · {j.title}
                </option>
              ))}
            </select>
          </section>

          <section className={panel}>
            <div className="flex items-baseline justify-between px-5 sm:px-6 py-4 border-b border-[#26282D]">
              <h2 className="font-extrabold text-lg sm:text-xl tracking-tight">Peringkat</h2>
              <p className={label}>Rata-rata nilai</p>
            </div>
            {leaderboard.length === 0 ? (
              <p className="px-6 py-8 text-sm text-[#8A8F98] text-center">Belum ada nilai.</p>
            ) : (
              <ol>
                {leaderboard.map((l, i) => (
                  <li
                    key={l.name + i}
                    className="flex items-center gap-4 px-5 sm:px-6 py-3 border-b border-[#26282D] last:border-b-0"
                    style={i === 0 ? { boxShadow: `inset 3px 0 0 ${ACCENT}` } : undefined}
                  >
                    <span className={`${mono} w-6 font-bold ${i === 0 ? '' : 'text-[#8A8F98]'}`} style={i === 0 ? { color: ACCENT } : undefined}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{l.name}</p>
                      <p className="text-xs text-[#8A8F98] truncate">{l.cls} · {l.count} jobsheet</p>
                    </div>
                    <span className={`${mono} font-bold text-lg sm:text-xl`}>{l.avg}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>

      {/* News ticker */}
      <div className="fixed bottom-0 inset-x-0 h-12 sm:h-14 flex items-stretch border-t border-[#26282D] bg-[#0F1012] z-40">
        <div className="flex items-center px-4 sm:px-6 shrink-0 text-black font-extrabold text-xs sm:text-sm tracking-[0.16em]" style={{ background: ACCENT }}>
          TERKINI
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-sm sm:text-base text-[#D5D7DB]"
            style={{ animation: `pameran-ticker ${Math.max(30, feed.length * 9)}s linear infinite` }}
          >
            <span className="px-8">{tickerText}</span>
            <span className="px-8" aria-hidden="true">{tickerText}</span>
          </div>
        </div>
      </div>

      {/* Lower-third announcement for each new submission / grade */}
      {celebration && (
        <div
          key={celebration.id}
          className="fixed left-4 right-4 sm:left-8 sm:right-auto bottom-20 sm:bottom-24 z-50 flex items-stretch shadow-2xl shadow-black/60 sm:max-w-[760px]"
          style={{ animation: 'pameran-slide .45s ease-out' }}
        >
          <div className="flex flex-col justify-center px-4 sm:px-6 text-black shrink-0" style={{ background: ACCENT }}>
            <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.16em]">
              {celebration.score !== undefined ? 'NILAI' : 'SELESAI'}
            </p>
            <p className={`${mono} font-bold text-3xl sm:text-5xl leading-none mt-1`}>
              {celebration.score !== undefined ? celebration.score : '✓'}
            </p>
          </div>
          <div className="bg-[#F4F4F5] text-[#0B0C0E] px-5 sm:px-7 py-3 sm:py-4 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.16em] text-[#55595F]">
              {celebration.score !== undefined ? 'BARU SAJA DINILAI' : 'BARU SAJA MENGUMPULKAN'}
            </p>
            <p className="font-extrabold text-xl sm:text-3xl tracking-tight leading-tight truncate">{celebration.name}</p>
            <p className="text-xs sm:text-sm text-[#3A3D42] truncate">
              {celebration.className} · {celebration.jobsheet}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
