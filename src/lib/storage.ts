import type { Jobsheet, Submission, UserProfile, ClassItem, SubjectItem } from '../types';

// Default initial seed data with high-quality, matched automotive instruction images
const DEFAULT_JOBSHEETS: Jobsheet[] = [
  {
    id: 'job-001',
    code: 'JOB-001',
    title: 'Pemeriksaan & Penggantian Kampas Rem Cakram',
    subject: 'Pemeliharaan Sasis dan Pemindah Tenaga Kendaraan Ringan',
    target_class: 'XI TKR 1',
    description: 'Melakukan pemeriksaan ketebalan kampas rem, kondisi permukaan piringan rotor, dan pengecekan kebocoran minyak rem sesuai SOP Bengkel Resmi.',
    learning_objectives: [
      'Siswa dapat mengidentifikasi komponen utama sistem rem cakram hidrolis',
      'Siswa dapat mengukur ketebalan kampas rem dan piringan rotor menggunakan jangka sorong/micrometer',
      'Siswa dapat menyimpulkan kelayakan sistem pengereman sesuai standar buku manual'
    ],
    safety_points: [
      'Wajib menggunakan Wearpack lengkap dan Safety Shoes',
      'Pasang wheel chock (ganjal roda) sebelum mendongkrak kendaraan',
      'Pasang Jack Stand pada titik tumpu chassis yang tepat dan kokoh',
      'Gunakan masker saat membersihkan debu asbes kampas rem dengan brake cleaner (dilarang disemprot angin kompresor langsung)'
    ],
    duration: 90,
    difficulty: 'Menengah',
    status: 'active',
    created_at: '2025-01-15T08:00:00.000Z',
    created_by: 'Bpk. Andi Santoso, S.Pd',
    materials: [
      { id: 'm-1', name: 'Dongkrak Buaya 3 Ton', quantity: '1 Unit', category: 'Alat', condition: 'Baik' },
      { id: 'm-2', name: 'Jack Stand 3 Ton', quantity: '2 Unit', category: 'Alat', condition: 'Baik' },
      { id: 'm-3', name: 'Kunci Roda 21mm / Impact Wrench', quantity: '1 Set', category: 'Alat', condition: 'Baik' },
      { id: 'm-4', name: 'Kunci Ring Pas 12mm & 14mm', quantity: '1 Set', category: 'Alat', condition: 'Baik' },
      { id: 'm-5', name: 'Vernier Caliper (Jangka Sorong 0.05mm)', quantity: '1 Pcs', category: 'Alat Ukur', condition: 'Baik' },
      { id: 'm-6', name: 'Micrometer Luar 25-50mm', quantity: '1 Pcs', category: 'Alat Ukur', condition: 'Baik' },
      { id: 'm-7', name: 'Brake Cleaner Aerosol', quantity: '1 Kaleng', category: 'Bahan', condition: 'Baik' },
      { id: 'm-8', name: 'Kain Lap Majun Bersih', quantity: '2 Lembar', category: 'Bahan', condition: 'Baik' }
    ],
    steps: [
      {
        id: 'step-1',
        step_number: 1,
        title: 'Persiapan & Pengangkatan Kendaraan (Lifting)',
        instruction: 'Parkir kendaraan di lantai datar, pasang ganjal roda belakang. Kendurkan mur roda depan sedikit saat roda masih menapak. Dongkrak kendaraan pada front crossmember dan pasang jack stand di pinch weld samping.',
        image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      },
      {
        id: 'step-2',
        step_number: 2,
        title: 'Pelepasan Roda dan Kaliper Rem',
        instruction: 'Buka penuh mur roda dan lepaskan roda. Lepaskan baut pin kaliper bagian bawah (baut 14mm), angkat badan kaliper ke atas dan gantungkan dengan kawat agar selang fleksibel tidak tertarik.',
        image_url: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      },
      {
        id: 'step-3',
        step_number: 3,
        title: 'Pengukuran Ketebalan Kampas (Brake Pad) & Rotor',
        instruction: 'Lepaskan pad rem dari bracket kaliper. Ukur ketebalan kampas rem (tanpa pelat backing) di 3 titik menggunakan vernier caliper. Ukur juga ketebalan piringan rotor menggunakan micrometer luar pada jarak 10mm dari bibir luar.',
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 25
      },
      {
        id: 'step-4',
        step_number: 4,
        title: 'Pembersihan & Perakitan Kembali',
        instruction: 'Semprotkan brake cleaner pada bracket dan piringan. Pasang shim anti-squeak dan kampas rem baru/lama yang masih layak. Oleskan brake grease tipis pada sliding pin kaliper. Kencangkan baut kaliper sesuai torsi spesifikasi.',
        image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 20
      },
      {
        id: 'step-5',
        step_number: 5,
        title: 'Pemasangan Roda & Tes Tekanan Pedal Rem',
        instruction: 'Pasang kembali roda dan kencangkan mur secara menyilang. Turunkan kendaraan dari jack stand. Kencangkan baut roda dengan kunci momen (105 Nm). Tekan pedal rem beberapa kali hingga terasa keras sebelum tes jalan.',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      }
    ],
    measurements: [
      {
        id: 'meas-1',
        parameter: 'Ketebalan Kampas Rem Sisi Luar (Outer Pad)',
        standard: 'Standar: 10.0 mm | Batas Minimal: 2.0 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 2.0,
        max_val: 12.0
      },
      {
        id: 'meas-2',
        parameter: 'Ketebalan Kampas Rem Sisi Dalam (Inner Pad)',
        standard: 'Standar: 10.0 mm | Batas Minimal: 2.0 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 2.0,
        max_val: 12.0
      },
      {
        id: 'meas-3',
        parameter: 'Ketebalan Piringan Rotor Cakram',
        standard: 'Standar: 22.0 mm | Batas Minimal: 20.0 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 20.0,
        max_val: 24.0
      },
      {
        id: 'meas-4',
        parameter: 'Kondisi Selang Fleksibel & Kaliper Rem',
        standard: 'Tidak retak, tidak menggelembung, bebas rembesan fluida',
        unit: '-',
        input_type: 'select',
        options: ['Sangat Baik (Kering & Lentur)', 'Cukup (Tidak ada kebocoran)', 'Retak Halus / Perlu Pantau', 'Bocor / Wajib Ganti Segera']
      }
    ]
  },
  {
    id: 'job-002',
    code: 'JOB-002',
    title: 'Pengukuran Presisi dengan Jangka Sorong & Micrometer',
    subject: 'Pekerjaan Dasar Teknik Otomotif (PDTO)',
    target_class: 'X TKR 1',
    description: 'Praktik penggunaan alat ukur presisi vernier caliper ketelitian 0.05mm dan micrometer luar ketelitian 0.01mm pada komponen poros engkol dan katup mesin.',
    learning_objectives: [
      'Siswa mampu melakukan kalibrasi titik nol (zero point) pada micrometer dan vernier caliper',
      'Siswa mampu membaca skala utama dan skala nonius secara akurat tanpa kesalahan paralaks',
      'Siswa mampu merawat dan menyimpan alat ukur presisi sesuai SOP bengkel'
    ],
    safety_points: [
      'Jangan meletakkan alat ukur menumpuk dengan alat potong / benda keras lainnya',
      'Bersihkan benda kerja dari gram / oli sebelum diukur',
      'Gunakan sarung tangan katun bersih saat memegang alat ukur mikrometer presisi'
    ],
    duration: 60,
    difficulty: 'Dasar',
    status: 'active',
    created_at: '2025-01-20T09:00:00.000Z',
    created_by: 'Bpk. Andi Santoso, S.Pd',
    materials: [
      { id: 'm-201', name: 'Jangka Sorong 0.05 mm (0-150 mm)', quantity: '1 Unit', category: 'Alat Ukur', condition: 'Baik' },
      { id: 'm-202', name: 'Micrometer Luar 0-25 mm (0.01 mm)', quantity: '1 Unit', category: 'Alat Ukur', condition: 'Baik' },
      { id: 'm-203', name: 'Benda Uji Poros / Pin Piston', quantity: '1 Set', category: 'Bahan', condition: 'Baik' },
      { id: 'm-204', name: 'Blok Ukur / Kalibrator 25mm', quantity: '1 Pcs', category: 'Alat Ukur', condition: 'Baik' }
    ],
    steps: [
      {
        id: 'step-201',
        step_number: 1,
        title: 'Pembersihan & Pengecekan Titik Nol (Zero Point)',
        instruction: 'Bersihkan anvil dan spindle micrometer dengan kertas bersih. Putar rachet stopper perlahan hingga berbunyi klik 2-3 kali. Pastikan garis 0 pada thimble sejajar dengan garis index sleeve.',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 10
      },
      {
        id: 'step-202',
        step_number: 2,
        title: 'Pengukuran Diameter Luar Pin Piston',
        instruction: 'Posisikan pin piston di antara anvil dan spindle. Putar thimble mendekati benda kerja, lalu gunakan ratchet stopper hingga berbunyi klik 2-3 kali. Kunci lock lever dan baca nilai pengukuran.',
        image_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 25
      },
      {
        id: 'step-203',
        step_number: 3,
        title: 'Pengukuran Kedalaman & Diameter Dalam Bushing',
        instruction: 'Gunakan depth probe jangka sorong untuk mengukur kedalaman alur, dan gunakan rahang ukur dalam (inside jaws) untuk mengukur diameter lubang bushing.',
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 25
      }
    ],
    measurements: [
      {
        id: 'meas-201',
        parameter: 'Diameter Luar Pin Piston (Posisi X)',
        standard: 'Standar: 19.980 - 20.000 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 19.95,
        max_val: 20.05
      },
      {
        id: 'meas-202',
        parameter: 'Diameter Luar Pin Piston (Posisi Y)',
        standard: 'Standar: 19.980 - 20.000 mm (Ovalitas max 0.005 mm)',
        unit: 'mm',
        input_type: 'number',
        min_val: 19.95,
        max_val: 20.05
      },
      {
        id: 'meas-203',
        parameter: 'Diameter Dalam Bushing Connecting Rod',
        standard: 'Standar: 20.010 - 20.025 mm',
        unit: 'mm',
        input_type: 'number',
        min_val: 20.00,
        max_val: 20.05
      }
    ]
  },
  {
    id: 'job-003',
    code: 'JOB-003',
    title: 'Perakitan & Troubleshooting Rangkaian Lampu Kepala',
    subject: 'Pemeliharaan Kelistrikan Kendaraan Ringan (PKKR)',
    target_class: 'XI TKR 1',
    description: 'Praktik merangkai wiring diagram lampu kepala pengendali negatif/positif dengan relay 4-kaki, fuse, dan switch kombinasi.',
    learning_objectives: [
      'Siswa dapat membaca gambar skema wiring kelistrikan bodi otomotif',
      'Siswa dapat merangkai sirkuit lampu kepala dekat/jauh dengan aman',
      'Siswa dapat menggunakan multimeter digital untuk mengukur drop tegangan dan kontinuitas'
    ],
    safety_points: [
      'Pastikan saklar utama OFF saat memasang kabel jumper',
      'Pasang sekering (fuse 15A) di dekat kutub positif baterai sebelum menghubungkan ke beban',
      'Hindari short circuit (hubung singkat) antara terminal 30/87 dengan massa bodi'
    ],
    duration: 90,
    difficulty: 'Mahir',
    status: 'active',
    created_at: '2025-02-01T10:00:00.000Z',
    created_by: 'Bpk. Andi Santoso, S.Pd',
    materials: [
      { id: 'm-301', name: 'Stand Simulator Kelistrikan Bodi Mobil', quantity: '1 Unit', category: 'Alat', condition: 'Baik' },
      { id: 'm-302', name: 'Aki / Baterai 12V 45Ah', quantity: '1 Unit', category: 'Alat', condition: 'Baik' },
      { id: 'm-303', name: 'Kabel Jumper Banana Plug', quantity: '1 Set (20 Pcs)', category: 'Bahan', condition: 'Baik' },
      { id: 'm-304', name: 'Multimeter Digital Sanwa', quantity: '1 Pcs', category: 'Alat Ukur', condition: 'Baik' },
      { id: 'm-305', name: 'Relay 4-Pin 12V 30A', quantity: '2 Unit', category: 'Alat', condition: 'Baik' }
    ],
    steps: [
      {
        id: 'step-301',
        step_number: 1,
        title: 'Pengecekan Tegangan Sumber Baterai',
        instruction: 'Ukur tegangan tanpa beban baterai menggunakan multimeter selector DCV 20V. Pastikan tegangan di atas 12.4 Volt.',
        image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 15
      },
      {
        id: 'step-302',
        step_number: 2,
        title: 'Pemasangan Sirkuit Daya & Sirkuit Kontrol Relay',
        instruction: 'Hubungkan terminal 30 relay ke B+ melalui Fuse. Hubungkan terminal 87 ke filamen lampu kepala. Hubungkan terminal 85 ke saklar kombinasi dan 86 ke massa ground.',
        image_url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 45
      },
      {
        id: 'step-303',
        step_number: 3,
        title: 'Uji Fungsi Lampu Dekat, Jauh, dan Pass Beam',
        instruction: 'Nyalakan saklar posisi headlamp low beam, uji perpindahan ke high beam, dan operasikan saklar dim (flash). Amati terangnya cahaya kedua bohlam.',
        image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
        estimated_minutes: 30
      }
    ],
    measurements: [
      {
        id: 'meas-301',
        parameter: 'Tegangan Sumber Aki (Baterai)',
        standard: 'Standar: 12.4V - 12.8V',
        unit: 'Volt',
        input_type: 'number',
        min_val: 12.0,
        max_val: 13.0
      },
      {
        id: 'meas-302',
        parameter: 'Tegangan Kerja di Terminal Lampu Kepala',
        standard: 'Drop Tegangan Maksimal 0.5V (Min 11.9V)',
        unit: 'Volt',
        input_type: 'number',
        min_val: 11.5,
        max_val: 13.0
      },
      {
        id: 'meas-303',
        parameter: 'Kondisi Nyala Lampu Low & High Beam',
        standard: 'Terang merata kedua sisi, fokus baik',
        unit: '-',
        input_type: 'select',
        options: ['Sempurna (Kedua Lampu Terang Normal)', 'Lampu Kanan Redup (Cek Massa)', 'Lampu Kiri Redup (Cek Massa)', 'Tidak Menyala']
      }
    ]
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-001',
    jobsheet_id: 'job-002',
    jobsheet_code: 'JOB-002',
    jobsheet_title: 'Pengukuran Presisi dengan Jangka Sorong & Micrometer',
    student_id: 'demo-student-001',
    student_name: 'Muhammad Rizky Pratama',
    student_nis: '2024001',
    class_name: 'XI TKR 1',
    start_time: '2025-02-10T08:30:00.000Z',
    finish_time: '2025-02-10T09:25:00.000Z',
    duration_seconds: 3300,
    safety_checks: {
      '0': true,
      '1': true,
      '2': true
    },
    material_checks: {
      'm-201': true,
      'm-202': true,
      'm-203': true,
      'm-204': true
    },
    step_data: {
      'step-201': { completed: true, notes: 'Kalibrasi nol telah dicek akurat.' },
      'step-202': { completed: true, notes: 'Pengukuran mikrometer 3 kali pengulangan.' },
      'step-203': { completed: true, notes: 'Selesai.' }
    },
    measurements_data: {
      'meas-201': '19.985',
      'meas-202': '19.988',
      'meas-203': '20.015'
    },
    student_notes: 'Praktik berjalan lancar, hasil ukur presisi dan masuk dalam toleransi buku manual.',
    status: 'graded',
    submitted_at: '2025-02-10T09:26:00.000Z',
    score_k3: 95,
    score_steps: 90,
    score_measurements: 95,
    total_score: 93,
    competency_status: 'Kompeten',
    teacher_feedback: 'Luar biasa! Pembacaan micrometer sangat teliti dan pemahaman SOP sangat baik.',
    graded_at: '2025-02-10T11:00:00.000Z',
    graded_by: 'Bpk. Andi Santoso, S.Pd'
  },
  {
    id: 'sub-002',
    jobsheet_id: 'job-001',
    jobsheet_code: 'JOB-001',
    jobsheet_title: 'Pemeriksaan & Penggantian Kampas Rem Cakram',
    student_id: 'demo-student-001',
    student_name: 'Muhammad Rizky Pratama',
    student_nis: '2024001',
    class_name: 'XI TKR 1',
    start_time: '2025-02-15T10:00:00.000Z',
    finish_time: '2025-02-15T11:18:00.000Z',
    duration_seconds: 4680,
    safety_checks: {
      '0': true,
      '1': true,
      '2': true,
      '3': true
    },
    material_checks: {
      'm-1': true,
      'm-2': true,
      'm-3': true,
      'm-4': true,
      'm-5': true,
      'm-6': true,
      'm-7': true,
      'm-8': true
    },
    step_data: {
      'step-1': { completed: true },
      'step-2': { completed: true },
      'step-3': { completed: true },
      'step-4': { completed: true },
      'step-5': { completed: true }
    },
    measurements_data: {
      'meas-1': '5.2',
      'meas-2': '5.0',
      'meas-3': '21.4',
      'meas-4': 'Sangat Baik (Kering & Lentur)'
    },
    student_notes: 'Kampas rem masih tebal (5.0mm) di atas batas limit 2.0mm. Rotor masih 21.4mm. Hanya dilakukan pembersihan dan pelumasan pin.',
    status: 'submitted',
    submitted_at: '2025-02-15T11:19:00.000Z'
  },
  {
    id: 'sub-003',
    jobsheet_id: 'job-003',
    jobsheet_code: 'JOB-003',
    jobsheet_title: 'Perakitan & Troubleshooting Rangkaian Lampu Kepala',
    student_id: 'student-002',
    student_name: 'Ahmad Fauzi Setiawan',
    student_nis: '2024002',
    class_name: 'XI TKR 1',
    start_time: '2025-02-18T08:00:00.000Z',
    finish_time: '2025-02-18T09:20:00.000Z',
    duration_seconds: 4800,
    safety_checks: { '0': true, '1': true, '2': true },
    material_checks: { 'm-301': true, 'm-302': true, 'm-303': true, 'm-304': true, 'm-305': true },
    step_data: {
      'step-301': { completed: true },
      'step-302': { completed: true },
      'step-303': { completed: true }
    },
    measurements_data: {
      'meas-301': '12.6',
      'meas-302': '12.1',
      'meas-303': 'Sempurna (Kedua Lampu Terang Normal)'
    },
    student_notes: 'Rangkaian relay lampu dekat dan jauh bekerja normal. Drop tegangan hanya 0.5V.',
    status: 'graded',
    submitted_at: '2025-02-18T09:21:00.000Z',
    score_k3: 90,
    score_steps: 95,
    score_measurements: 95,
    total_score: 94,
    competency_status: 'Kompeten',
    teacher_feedback: 'Pemasangan rapi dan pemahaman terminal relay 30, 87, 85, 86 sangat baik.',
    graded_at: '2025-02-18T10:30:00.000Z',
    graded_by: 'Bpk. Andi Santoso, S.Pd'
  }
];

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'demo-admin-001',
    role: 'admin',
    full_name: 'LNorris',
    nis_nip: '19800101001',
    email: 'admin@mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'demo-teacher-001',
    role: 'teacher',
    full_name: 'Joko Setyo Nugroho, S.T',
    nis_nip: '19850315002',
    email: 'guru@mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'student-ahnaf-001',
    role: 'student',
    full_name: 'AHNAF ABDUL JABBAR',
    nis_nip: '0106090576',
    class_name: 'X TKR 2',
    email: '0106090576@siswa.mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'demo-student-001',
    role: 'student',
    full_name: 'Muhammad Rizky Pratama',
    nis_nip: '0071234567',
    class_name: 'XI TKR 1',
    email: '0071234567@siswa.mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'student-002',
    role: 'student',
    full_name: 'Ahmad Fauzi Setiawan',
    nis_nip: '0071234568',
    class_name: 'XI TKR 1',
    email: '0071234568@siswa.mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'student-003',
    role: 'student',
    full_name: 'Bagas Aditya Nugraha',
    nis_nip: '0071234569',
    class_name: 'XI TKR 1',
    email: '0071234569@siswa.mitra.sch.id',
    avatar_url: null
  },
  {
    id: 'student-004',
    role: 'student',
    full_name: 'Dwi Putra Prasetyo',
    nis_nip: '0071234570',
    class_name: 'X TKR 1',
    email: '0071234570@siswa.mitra.sch.id',
    avatar_url: null
  }
];

const DEFAULT_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'X TKR 1',
    department: 'Teknik Kendaraan Ringan Otomotif',
    academic_year: '2024/2025',
    homeroom_teacher: 'Bpk. Bambang Sutrisno, S.T',
    total_students: 36
  },
  {
    id: 'cls-1b',
    name: 'X TKR 2',
    department: 'Teknik Kendaraan Ringan Otomotif',
    academic_year: '2024/2025',
    homeroom_teacher: 'Bpk. Andi Santoso, S.Pd',
    total_students: 36
  },
  {
    id: 'cls-2',
    name: 'XI TKR 1',
    department: 'Teknik Kendaraan Ringan Otomotif',
    academic_year: '2024/2025',
    homeroom_teacher: 'Bpk. Andi Santoso, S.Pd',
    total_students: 36
  },
  {
    id: 'cls-3',
    name: 'XI TKR 2',
    department: 'Teknik Kendaraan Ringan Otomotif',
    academic_year: '2024/2025',
    homeroom_teacher: 'Ibu Ratna Dewi, S.Pd',
    total_students: 34
  },
  {
    id: 'cls-4',
    name: 'XII TKR 1',
    department: 'Teknik Kendaraan Ringan Otomotif',
    academic_year: '2024/2025',
    homeroom_teacher: 'Bpk. Joko Purnomo, M.T',
    total_students: 32
  }
];

const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 'subj-1',
    code: 'PSPTKR',
    name: 'Pemeliharaan Sasis & Pemindah Tenaga (PSPTKR)',
    description: 'Kompetensi sistem rem, transmisi, kopling, dan suspensi kendaraan ringan.',
    grade_level: 'Kelas XI & XII'
  },
  {
    id: 'subj-2',
    code: 'PDTO',
    name: 'Pekerjaan Dasar Teknik Otomotif (PDTO)',
    description: 'Kompetensi penggunaan alat ukur presisi vernier caliper dan micrometer.',
    grade_level: 'Kelas X'
  },
  {
    id: 'subj-3',
    code: 'PKKR',
    name: 'Pemeliharaan Kelistrikan Kendaraan Ringan (PKKR)',
    description: 'Rangkaian sistem penerangan, relay, wiper, dan motor starter.',
    grade_level: 'Kelas XI'
  },
  {
    id: 'subj-4',
    code: 'PMKR',
    name: 'Pemeliharaan Mesin Kendaraan Ringan (PMKR)',
    description: 'Tune up, mekanisme katup, sistem pelumasan, dan pendinginan mesin.',
    grade_level: 'Kelas XI & XII'
  }
];

const STORAGE_KEYS = {
  JOBSHEETS: 'mitra_jobsheets_v5',
  SUBMISSIONS: 'mitra_submissions_v5',
  USERS: 'mitra_users_v5',
  CLASSES: 'mitra_classes_v5',
  SUBJECTS: 'mitra_subjects_v5'
};

// Listeners for reactive updates
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

const notifyListeners = () => {
  listeners.forEach((cb) => cb());
  window.dispatchEvent(new CustomEvent('mitra-storage-update'));
};

export const subscribeStorage = (callback: StorageListener) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

// Safe JSON storage get & set
const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key ${key}:`, err);
    return defaultValue;
  }
};

const setStoredData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Error saving localStorage key ${key}:`, err);
  }
};

// Storage API
export const Storage = {
  // JOBSHEETS
  getJobsheets(): Jobsheet[] {
    return getStoredData<Jobsheet[]>(STORAGE_KEYS.JOBSHEETS, DEFAULT_JOBSHEETS);
  },

  getJobsheetById(id: string): Jobsheet | undefined {
    const list = this.getJobsheets();
    return list.find((j) => j.id === id || j.code.toLowerCase() === id.toLowerCase());
  },

  saveJobsheet(jobsheet: Jobsheet): void {
    const list = this.getJobsheets();
    const index = list.findIndex((j) => j.id === jobsheet.id);
    if (index >= 0) {
      list[index] = jobsheet;
    } else {
      list.unshift(jobsheet);
    }
    setStoredData(STORAGE_KEYS.JOBSHEETS, list);
  },

  deleteJobsheet(id: string): void {
    const list = this.getJobsheets().filter((j) => j.id !== id);
    setStoredData(STORAGE_KEYS.JOBSHEETS, list);
  },

  // SUBMISSIONS
  getSubmissions(): Submission[] {
    return getStoredData<Submission[]>(STORAGE_KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS);
  },

  getStudentSubmissions(studentId: string): Submission[] {
    return this.getSubmissions().filter((s) => s.student_id === studentId);
  },

  getStudentSubmissionForJobsheet(studentId: string, jobsheetId: string): Submission | undefined {
    return this.getSubmissions().find((s) => s.student_id === studentId && s.jobsheet_id === jobsheetId);
  },

  saveSubmission(submission: Submission): void {
    const list = this.getSubmissions();
    const index = list.findIndex((s) => s.id === submission.id);
    if (index >= 0) {
      list[index] = submission;
    } else {
      list.unshift(submission);
    }
    setStoredData(STORAGE_KEYS.SUBMISSIONS, list);
  },

  // USERS
  getUsers(): UserProfile[] {
    return getStoredData<UserProfile[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  saveUser(user: UserProfile): void {
    const list = this.getUsers();
    const index = list.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    setStoredData(STORAGE_KEYS.USERS, list);
  },

  deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    setStoredData(STORAGE_KEYS.USERS, list);
  },

  // CLASSES
  getClasses(): ClassItem[] {
    return getStoredData<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
  },

  saveClass(c: ClassItem): void {
    const list = this.getClasses();
    const index = list.findIndex((item) => item.id === c.id);
    if (index >= 0) {
      list[index] = c;
    } else {
      list.push(c);
    }
    setStoredData(STORAGE_KEYS.CLASSES, list);
  },

  deleteClass(id: string): void {
    const list = this.getClasses().filter((c) => c.id !== id);
    setStoredData(STORAGE_KEYS.CLASSES, list);
  },

  // SUBJECTS
  getSubjects(): SubjectItem[] {
    return getStoredData<SubjectItem[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  },

  // BACKUP & RESTORE
  exportBackupJSON(): string {
    const data = {
      jobsheets: this.getJobsheets(),
      submissions: this.getSubmissions(),
      users: this.getUsers(),
      classes: this.getClasses(),
      subjects: this.getSubjects(),
      exported_at: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.jobsheets && Array.isArray(data.jobsheets)) {
        setStoredData(STORAGE_KEYS.JOBSHEETS, data.jobsheets);
      }
      if (data.submissions && Array.isArray(data.submissions)) {
        setStoredData(STORAGE_KEYS.SUBMISSIONS, data.submissions);
      }
      if (data.users && Array.isArray(data.users)) {
        setStoredData(STORAGE_KEYS.USERS, data.users);
      }
      if (data.classes && Array.isArray(data.classes)) {
        setStoredData(STORAGE_KEYS.CLASSES, data.classes);
      }
      return true;
    } catch (err) {
      console.error('Failed to import backup JSON:', err);
      return false;
    }
  },

  resetToDefault(): void {
    setStoredData(STORAGE_KEYS.JOBSHEETS, DEFAULT_JOBSHEETS);
    setStoredData(STORAGE_KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS);
    setStoredData(STORAGE_KEYS.USERS, DEFAULT_USERS);
    setStoredData(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
    setStoredData(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  }
};
