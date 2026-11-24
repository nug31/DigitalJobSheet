// Class names come from Excel exports typed by different admins ("XI Elind 1", "Xl Ototronik",
// "X ELIND 1 03"), so normalize them before showing and group them per program for dropdowns.

const PROGRAMS: { code: string; label: string }[] = [
  { code: 'TKR', label: 'Teknik Kendaraan Ringan' },
  { code: 'TSM', label: 'Teknik Sepeda Motor' },
  { code: 'OTOTRONIK', label: 'Teknik Ototronik' },
  { code: 'MESIN', label: 'Teknik Mesin' },
  { code: 'MEKATRONIKA', label: 'Teknik Mekatronika' },
  { code: 'ELIND', label: 'Teknik Elektronika Industri' },
  { code: 'LISTRIK', label: 'Teknik Instalasi Tenaga Listrik' },
  { code: 'TKI', label: 'Teknik Kimia Industri' },
  { code: 'AK', label: 'Akuntansi' },
  { code: 'HOTEL', label: 'Perhotelan' },
  { code: 'ANIMASI', label: 'Animasi' },
];

const LEVELS = ['X', 'XI', 'XII'];

/** "Xl Ototronik (Pati)" -> "XI OTOTRONIK (Pati)" — the school tag in brackets keeps its casing. */
export function canonicalClass(raw: string): string {
  const trimmed = (raw || '').trim().replace(/\s+/g, ' ');
  const m = trimmed.match(/^(.*?)(\s*\(.*\))?$/);
  const base = (m?.[1] || trimmed).toUpperCase().replace(/^XL\b/, 'XI');
  return `${base}${m?.[2] ? ' ' + m[2].trim() : ''}`;
}

interface ParsedClass {
  level: number;
  program: string;
  number: number;
  school: string;
}

function parseClass(name: string): ParsedClass {
  const c = canonicalClass(name);
  const school = c.match(/\(([^)]+)\)$/)?.[1] || '';
  const parts = c.replace(/\s*\(.*\)$/, '').split(' ');
  const level = LEVELS.indexOf(parts[0]);
  const program = parts[1] || '';
  const nums = parts.slice(2).map((p) => parseInt(p, 10)).filter((n) => !Number.isNaN(n));
  // "X TKR 1 03": 03 is a separate group of the same class number, sort it right after "X TKR 1"
  const number = (nums[0] || 0) * 100 + (nums[1] || 0);
  return { level: level < 0 ? 9 : level, program, number, school };
}

function groupLabel(p: ParsedClass): string {
  const prog = PROGRAMS.find((x) => x.code === p.program)?.label || 'Lainnya';
  return p.school ? `${prog} — ${p.school}` : prog;
}

function groupRank(p: ParsedClass): number {
  const i = PROGRAMS.findIndex((x) => x.code === p.program);
  // Main campus first, then the other schools; unknown programs last
  return (p.school ? 100 : 0) + (i < 0 ? 99 : i);
}

/** Unique classes sorted X → XI → XII and grouped per program (and school), ready for <optgroup>. */
export function groupClasses(names: string[]): { label: string; classes: string[] }[] {
  const unique = Array.from(new Set(names.filter((n) => n && n.trim())));
  const groups = new Map<string, { label: string; rank: number; items: { name: string; p: ParsedClass }[] }>();
  for (const name of unique) {
    const p = parseClass(name);
    const label = groupLabel(p);
    const g = groups.get(label) || { label, rank: groupRank(p), items: [] };
    g.items.push({ name, p });
    groups.set(label, g);
  }
  return Array.from(groups.values())
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
    .map((g) => ({
      label: g.label,
      classes: g.items
        .sort((a, b) => a.p.level - b.p.level || a.p.number - b.p.number || a.name.localeCompare(b.name))
        .map((i) => i.name),
    }));
}
