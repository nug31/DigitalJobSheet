export const DEMO_JOBSHEETS = [
  {
    id: 'job-001',
    code: 'JOB-001',
    title: 'Pemeriksaan Sistem Rem',
    subject: 'Pemeliharaan Sasis dan Pemindah Tenaga Kendaraan Ringan',
    class_id: 'class-1',
    description: 'Melakukan pemeriksaan ketebalan kampas rem, kondisi piringan, dan kebocoran minyak rem sesuai SOP.',
    learning_objectives: [
      'Siswa dapat mengidentifikasi komponen sistem rem cakram',
      'Siswa dapat mengukur ketebalan kampas rem menggunakan jangka sorong',
      'Siswa dapat mengevaluasi kelayakan sistem pengereman'
    ],
    duration: 120, // minutes
    difficulty: 'Menengah',
    status: 'active',
  },
  {
    id: 'job-002',
    code: 'JOB-002',
    title: 'Pengukuran dengan Jangka Sorong',
    subject: 'Pekerjaan Dasar Teknik Otomotif',
    class_id: 'class-1',
    description: 'Melakukan pengukuran diameter dalam, luar, dan kedalaman menggunakan vernier caliper ketelitian 0.05 mm.',
    learning_objectives: [
      'Siswa dapat menggunakan jangka sorong dengan benar',
      'Siswa dapat membaca skala utama dan nonius',
      'Siswa dapat merawat alat ukur'
    ],
    duration: 90,
    difficulty: 'Dasar',
    status: 'active',
  }
];

export const DEMO_MATERIALS = [
  { jobsheet_id: 'job-001', name: 'Dongkrak', quantity: 1, category: 'Alat', condition: 'Baik' },
  { jobsheet_id: 'job-001', name: 'Jack stand', quantity: 2, category: 'Alat', condition: 'Baik' },
  { jobsheet_id: 'job-001', name: 'Kunci roda', quantity: 1, category: 'Alat', condition: 'Baik' },
  { jobsheet_id: 'job-001', name: 'Jangka sorong 0.05mm', quantity: 1, category: 'Alat Ukur', condition: 'Baik' },
  { jobsheet_id: 'job-001', name: 'Micrometer luar', quantity: 1, category: 'Alat Ukur', condition: 'Baik' },
  { jobsheet_id: 'job-001', name: 'Majun/Kain lap', quantity: 2, category: 'Bahan', condition: 'Baik' },
];

export const DEMO_STEPS = [
  {
    id: 'step-1',
    jobsheet_id: 'job-001',
    step_number: 1,
    title: 'Persiapan Kendaraan',
    instruction: 'Posisikan kendaraan di area datar, pasang ganjal roda, lalu angkat kendaraan menggunakan dongkrak dan amankan dengan jack stand.',
    image_url: 'https://images.unsplash.com/photo-1503375317424-645001ff9587?auto=format&fit=crop&q=80&w=800',
    estimated_minutes: 15,
  },
  {
    id: 'step-2',
    jobsheet_id: 'job-001',
    step_number: 2,
    title: 'Pelepasan Roda',
    instruction: 'Lepaskan mur roda dengan pola menyilang, lalu lepaskan roda dari hub kendaraan.',
    image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
    estimated_minutes: 10,
  },
  {
    id: 'step-3',
    jobsheet_id: 'job-001',
    step_number: 3,
    title: 'Pengukuran Ketebalan Kampas',
    instruction: 'Gunakan jangka sorong untuk mengukur ketebalan kampas rem. Catat hasilnya di form hasil praktik.',
    image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
    estimated_minutes: 20,
  }
];

export const DEMO_MEASUREMENTS = [
  {
    id: 'meas-1',
    jobsheet_id: 'job-001',
    parameter: 'Ketebalan Kampas Rem (Pad)',
    standard: 'Min 2.0 mm',
    unit: 'mm',
    input_type: 'number'
  },
  {
    id: 'meas-2',
    jobsheet_id: 'job-001',
    parameter: 'Ketebalan Piringan (Rotor)',
    standard: 'Min 20.0 mm',
    unit: 'mm',
    input_type: 'number'
  },
  {
    id: 'meas-3',
    jobsheet_id: 'job-001',
    parameter: 'Kondisi Slang Rem',
    standard: 'Tidak retak / bocor',
    unit: '-',
    input_type: 'select',
    options: ['Baik (Tidak retak/bocor)', 'Retak', 'Bocor']
  }
];
