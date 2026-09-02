// Demo accounts with NISN support
export const DEMO_ACCOUNTS = [
  {
    email: 'admin@mitra.sch.id',
    password: 'admin123',
    profile: {
      id: 'demo-admin-001',
      role: 'admin' as const,
      full_name: 'Bpk. Hendra Wijaya, M.Kom',
      nis_nip: '19800101001',
      email: 'admin@mitra.sch.id',
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
      email: 'guru@mitra.sch.id',
      avatar_url: null,
    },
  },
  {
    email: '0071234567@siswa.mitra.sch.id',
    password: '0071234567',
    profile: {
      id: 'demo-student-001',
      role: 'student' as const,
      full_name: 'Muhammad Rizky Pratama',
      nis_nip: '0071234567',
      class_name: 'XI TKR 1',
      email: '0071234567@siswa.mitra.sch.id',
      avatar_url: null,
    },
  },
  {
    email: '0071234568@siswa.mitra.sch.id',
    password: '0071234568',
    profile: {
      id: 'student-002',
      role: 'student' as const,
      full_name: 'Ahmad Fauzi Setiawan',
      nis_nip: '0071234568',
      class_name: 'XI TKR 1',
      email: '0071234568@siswa.mitra.sch.id',
      avatar_url: null,
    },
  },
  {
    email: '0071234569@siswa.mitra.sch.id',
    password: '0071234569',
    profile: {
      id: 'student-003',
      role: 'student' as const,
      full_name: 'Bagas Aditya Nugraha',
      nis_nip: '0071234569',
      class_name: 'XI TKR 1',
      email: '0071234569@siswa.mitra.sch.id',
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
      nis_nip: '0071234567',
      class_name: 'XI TKR 1',
      email: 'siswa@mitra.sch.id',
      avatar_url: null,
    },
  },
];

export type DemoRole = 'admin' | 'teacher' | 'student';
