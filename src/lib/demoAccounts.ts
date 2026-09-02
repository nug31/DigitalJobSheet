// Demo accounts for use when Supabase is not configured
export const DEMO_ACCOUNTS = [
  {
    email: 'admin@mitra.sch.id',
    password: 'admin123',
    profile: {
      id: 'demo-admin-001',
      role: 'admin' as const,
      full_name: 'Admin Sistem',
      nis_nip: '19800101001',
      avatar_url: null,
    },
  },
  {
    email: 'guru@mitra.sch.id',
    password: 'guru123',
    profile: {
      id: 'demo-teacher-001',
      role: 'teacher' as const,
      full_name: 'Bpk. Andi Santoso, S.Pd',
      nis_nip: '19850315002',
      avatar_url: null,
    },
  },
  {
    email: 'siswa@mitra.sch.id',
    password: 'siswa123',
    profile: {
      id: 'demo-student-001',
      role: 'student' as const,
      full_name: 'Muhammad Rizky Pratama',
      nis_nip: '2024001',
      avatar_url: null,
    },
  },
];

export type DemoRole = 'admin' | 'teacher' | 'student';
