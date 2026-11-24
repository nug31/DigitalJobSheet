import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Storage, subscribeStorage, startCloudSync } from '../lib/storage';
import type { Jobsheet, Submission } from '../types';
import {
  BookOpen,
  Maximize2,
  Minimize2,
  X,
  Activity,
  Send,
  Award,
  Gauge,
  Trophy,
  Clock,
  QrCode,
  Wrench,
  PartyPopper
} from 'lucide-react';

const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return 'baru saja';
  if (sec < 3600) return `${Math.floor(sec / 60)} menit lalu`;
  return `${Math.floor(sec / 3600)} jam lalu`;
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface Celebration {
  id: string;
  name: string;
  jobsheet: string;
  score?: number;
}

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

  // Celebrate every newly submitted or graded jobsheet (skip what was already there on open)
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
        jobsheet: `${fresh.jobsheet_code} · ${fresh.jobsheet_title}`,
        score: fresh.status === 'graded' ? fresh.total_score : undefined
      });
    }
  }, [submissions]);

  useEffect(() => {
    if (!celebration) return;
    const t = window.setTimeout(() => setCelebration(null), 6000);
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
      if (s.start_time) events.push({ key: `${s.id}-s`, at: s.start_time, text: `${s.student_name} mulai ${s.jobsheet_code}`, tone: 'start' });
      if (s.submitted_at) events.push({ key: `${s.id}-u`, at: s.submitted_at, text: `${s.student_name} mengumpulkan ${s.jobsheet_code}`, tone: 'submit' });
      if (s.graded_at) events.push({ key: `${s.id}-g`, at: s.graded_at, text: `${s.student_name} dinilai ${s.total_score} · ${s.competency_status}`, tone: 'grade' });
    });
    const order = { grade: 2, submit: 1, start: 0 };
    return events.sort((a, b) => b.at.localeCompare(a.at) || order[b.tone] - order[a.tone]).slice(0, 7);
  }, [submissions]);

  const activeJobsheets = jobsheets.filter((j) => j.status === 'active');
  const qrTarget = qrJobsheetId ? `${window.location.origin}/student/jobsheet/${qrJobsheetId}` : `${window.location.origin}/login`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=${encodeURIComponent(qrTarget)}`;

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be blocked (e.g. iOS Safari); the page still works without it
    }
  };

  const stats = [
    { label: 'Sedang Praktik', value: working.length, icon: Activity, tone: 'text-cyan-300', ring: 'from-cyan-500/20' },
    { label: 'Dikumpulkan Hari Ini', value: submittedToday.length, icon: Send, tone: 'text-violet-300', ring: 'from-violet-500/20' },
    { label: 'Kompeten Hari Ini', value: kompetenToday.length, icon: Award, tone: 'text-emerald-300', ring: 'from-emerald-500/20' },
    { label: 'Rata-rata Nilai', value: avgToday || '-', icon: Gauge, tone: 'text-amber-300', ring: 'from-amber-500/20' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <style>{`
        @keyframes pameran-pop { 0% { transform: scale(.6); opacity: 0 } 60% { transform: scale(1.05); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes pameran-fall { 0% { transform: translateY(-10vh) rotate(0deg) } 100% { transform: translateY(110vh) rotate(720deg) } }
      `}</style>

      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-4 border-b border-white/10 bg-slate-900/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/40">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-lg sm:text-2xl leading-none truncate">
              MITRA <span className="text-blue-400">Digital Job Sheet</span>
            </p>
            <p className="text-[11px] sm:text-sm text-slate-400 font-semibold mt-1 truncate">
              One QR · One Job Sheet · One Skill Passport
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-black tracking-widest">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> LIVE
          </span>
          <span className="font-mono font-black text-lg sm:text-3xl tabular-nums">
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button onClick={toggleFullscreen} className="p-2 rounded-xl bg-white/10 hover:bg-white/20" title="Layar penuh">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button onClick={() => navigate('/teacher/dashboard')} className="p-2 rounded-xl bg-white/10 hover:bg-white/20" title="Keluar Mode Pameran">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
        {/* Left: stats + live work */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-3xl p-4 sm:p-6 bg-gradient-to-br ${s.ring} to-slate-900 border border-white/10`}>
                <s.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${s.tone}`} />
                <p className={`text-4xl sm:text-6xl font-black mt-2 sm:mt-3 tabular-nums ${s.tone}`}>{s.value}</p>
                <p className="text-xs sm:text-sm text-slate-300 font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <section className="rounded-3xl bg-slate-900 border border-white/10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-lg sm:text-2xl flex items-center gap-2">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" /> Sedang Mengerjakan
              </h2>
              <span className="text-xs sm:text-sm text-slate-400 font-semibold">Diperbarui otomatis</span>
            </div>

            {working.length === 0 ? (
              <div className="py-12 sm:py-16 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="font-bold text-base sm:text-lg text-slate-300">Belum ada yang praktik saat ini</p>
                <p className="text-sm mt-1">Scan QR di samping untuk mencoba jobsheet digital</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {working.slice(0, 8).map((s) => {
                  const job = jobsheetFor(s);
                  const totalSteps = job?.steps?.length || 0;
                  const doneSteps = Object.values(s.step_data || {}).filter((d) => d?.completed).length;
                  const k3Total = job?.safety_points?.length || 0;
                  const k3Done = Object.values(s.safety_checks || {}).filter(Boolean).length;
                  const measDone = Object.values(s.measurements_data || {}).filter((v) => String(v).trim()).length;
                  const pct = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;
                  return (
                    <div key={s.id} className="rounded-2xl bg-slate-800/70 border border-white/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-lg shrink-0">
                            {s.student_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-base sm:text-lg leading-tight truncate">{s.student_name}</p>
                            <p className="text-xs text-slate-400 font-semibold truncate">{s.class_name}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded-lg shrink-0">
                          <Clock className="w-3.5 h-3.5" /> {formatDuration(s.duration_seconds || 0)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-3 truncate">
                        <span className="font-black text-blue-300">{s.jobsheet_code}</span> {s.jobsheet_title}
                      </p>
                      <div className="mt-3 h-3 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mt-2">
                        <span>Langkah {doneSteps}/{totalSteps}</span>
                        <span>K3 {k3Done}/{k3Total}</span>
                        <span>Ukur {measDone}/{job?.measurements?.length || 0}</span>
                        <span className="text-emerald-300">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: QR, leaderboard, feed */}
        <div className="space-y-4 sm:space-y-6">
          <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 sm:p-6 text-center shadow-xl shadow-blue-900/40">
            <p className="font-black text-xl sm:text-2xl">Coba Sekarang!</p>
            <p className="text-blue-100 text-sm mt-1">Scan QR dengan kamera HP</p>
            <div className="bg-white rounded-2xl p-3 mt-4 inline-block">
              <img src={qrImage} alt="QR code untuk mencoba" className="w-44 h-44 sm:w-56 sm:h-56" />
            </div>
            <select
              value={qrJobsheetId}
              onChange={(e) => setQrJobsheetId(e.target.value)}
              className="mt-4 w-full bg-white/15 border border-white/25 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none"
            >
              <option value="" className="text-slate-900">Halaman login</option>
              {activeJobsheets.map((j) => (
                <option key={j.id} value={j.id} className="text-slate-900">
                  {j.code} · {j.title}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-3xl bg-slate-900 border border-white/10 p-4 sm:p-6">
            <h2 className="font-black text-lg sm:text-xl flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-300" /> Papan Peringkat
            </h2>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada nilai. Jadilah yang pertama!</p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map((l, i) => (
                  <li key={l.name + i} className="flex items-center gap-3 rounded-xl bg-slate-800/70 px-3 py-2.5">
                    <span
                      className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                        i === 0 ? 'bg-amber-400 text-slate-900' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-orange-400 text-slate-900' : 'bg-slate-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate">{l.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{l.cls} · {l.count} jobsheet</p>
                    </div>
                    <span className="font-black text-lg text-amber-300 tabular-nums">{l.avg}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-3xl bg-slate-900 border border-white/10 p-4 sm:p-6">
            <h2 className="font-black text-lg sm:text-xl flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-rose-300" /> Aktivitas Terbaru
            </h2>
            {feed.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Menunggu aktivitas pertama…</p>
            ) : (
              <ul className="space-y-2.5">
                {feed.map((e) => (
                  <li key={e.key} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                        e.tone === 'grade' ? 'bg-emerald-400' : e.tone === 'submit' ? 'bg-violet-400' : 'bg-cyan-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 leading-snug">{e.text}</p>
                      <p className="text-[11px] text-slate-500">{timeAgo(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Celebration overlay for each new submission / grade */}
      {celebration && (
        <div key={celebration.id} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 h-3 w-2 rounded-sm"
              style={{
                left: `${(i * 37) % 100}%`,
                background: ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6'][i % 5],
                animation: `pameran-fall ${2.5 + (i % 5) * 0.4}s linear ${(i % 10) * 0.15}s forwards`
              }}
            />
          ))}
          <div
            className="relative rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 px-8 sm:px-14 py-8 sm:py-10 text-center shadow-2xl max-w-2xl"
            style={{ animation: 'pameran-pop .6s ease-out' }}
          >
            <PartyPopper className="w-14 h-14 sm:w-16 sm:h-16 mx-auto" />
            <p className="text-3xl sm:text-5xl font-black mt-3 leading-tight">{celebration.name}</p>
            <p className="text-lg sm:text-2xl font-bold mt-2 text-emerald-50">
              {celebration.score !== undefined ? `Mendapat nilai ${celebration.score}!` : 'Berhasil mengumpulkan jobsheet!'}
            </p>
            <p className="text-sm sm:text-base mt-2 text-emerald-100">{celebration.jobsheet}</p>
          </div>
        </div>
      )}
    </div>
  );
};
