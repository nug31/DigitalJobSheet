import repairFunctionSQL from '../../supabase/fix_student_accounts.sql?raw';

// NISN is always 10 digits. Excel stores it as a number and drops leading zeros
// (0111722356 -> 111722356), so restore them for any purely numeric value.
export const normalizeNisn = (value: unknown): string => {
  const raw = String(value ?? '').trim().replace(/\s+/g, '');
  if (/^\d+$/.test(raw) && raw.length < 10) return raw.padStart(10, '0');
  return raw;
};

export const studentEmail = (nisn: string): string => `${nisn}@siswa.mitra.sch.id`;

const sqlText = (v: string): string => `'${v.replace(/'/g, "''")}'`;

// SQL for the Supabase SQL Editor that creates or repairs student logins (password = NISN).
// The function definition (step 1 of the file) is prepended so one paste is enough.
export const buildStudentAccountSQL = (
  students: { nisn: string; fullName: string; className: string }[]
): string => {
  if (students.length === 0) return '-- Tidak ada data siswa yang valid.';
  const setup = repairFunctionSQL.split('-- LANGKAH 2')[0].trim();
  const queries = students
    .map((st) => `SELECT upsert_student_account(${sqlText(normalizeNisn(st.nisn))}, ${sqlText(st.fullName)}, ${sqlText(st.className)});`)
    .join('\n');
  return `${setup}\n\n\n-- AKUN SISWA (password = NISN, aman dijalankan ulang)\n${queries}`;
};
