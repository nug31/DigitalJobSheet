-- Jobsheet bawaan (JOB-001, JOB-002, JOB-003) + ilustrasi langkah kerja
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > Run.
-- Aman dijalankan ulang: data dengan kode yang sama akan diperbarui.

INSERT INTO public.jobsheets (
  id, code, title, subject, target_class, description,
  learning_objectives, safety_points, materials, steps, measurements,
  duration, difficulty, status, created_by
) VALUES (
  '7c1d0a3e-5b2f-4e8a-9d61-00000a000001', 'JOB-001', 'Pemeriksaan & Penggantian Kampas Rem Cakram', 'Pemeliharaan Sasis dan Pemindah Tenaga Kendaraan Ringan', 'Kelas XI', 'Melakukan pemeriksaan ketebalan kampas rem, kondisi permukaan piringan rotor, dan pengecekan kebocoran minyak rem sesuai SOP Bengkel Resmi.',
  $$[
  "Siswa dapat mengidentifikasi komponen utama sistem rem cakram hidrolis",
  "Siswa dapat mengukur ketebalan kampas rem dan piringan rotor menggunakan jangka sorong/micrometer",
  "Siswa dapat menyimpulkan kelayakan sistem pengereman sesuai standar buku manual"
]$$::jsonb,
  $$[
  "Wajib menggunakan Wearpack lengkap dan Safety Shoes",
  "Pasang wheel chock (ganjal roda) sebelum mendongkrak kendaraan",
  "Pasang Jack Stand pada titik tumpu chassis yang tepat dan kokoh",
  "Gunakan masker saat membersihkan debu asbes kampas rem dengan brake cleaner (dilarang disemprot angin kompresor langsung)"
]$$::jsonb,
  $$[
  {
    "id": "m-1",
    "name": "Dongkrak Buaya 3 Ton",
    "quantity": "1 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-2",
    "name": "Jack Stand 3 Ton",
    "quantity": "2 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-3",
    "name": "Kunci Roda 21mm / Impact Wrench",
    "quantity": "1 Set",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-4",
    "name": "Kunci Ring Pas 12mm & 14mm",
    "quantity": "1 Set",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-5",
    "name": "Vernier Caliper (Jangka Sorong 0.05mm)",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-6",
    "name": "Micrometer Luar 25-50mm",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-7",
    "name": "Brake Cleaner Aerosol",
    "quantity": "1 Kaleng",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-8",
    "name": "Kain Lap Majun Bersih",
    "quantity": "2 Lembar",
    "category": "Bahan",
    "condition": "Baik"
  }
]$$::jsonb,
  $$[
  {
    "id": "step-1",
    "step_number": 1,
    "title": "Persiapan & Pengangkatan Kendaraan (Lifting)",
    "instruction": "Parkir kendaraan di lantai datar, pasang ganjal roda belakang. Kendurkan mur roda depan sedikit saat roda masih menapak. Dongkrak kendaraan pada front crossmember dan pasang jack stand di pinch weld samping.",
    "image_url": "/jobsheets/job-001/step-1.svg",
    "estimated_minutes": 15
  },
  {
    "id": "step-2",
    "step_number": 2,
    "title": "Pelepasan Roda dan Kaliper Rem",
    "instruction": "Buka penuh mur roda dan lepaskan roda. Lepaskan baut pin kaliper bagian bawah (baut 14mm), angkat badan kaliper ke atas dan gantungkan dengan kawat agar selang fleksibel tidak tertarik.",
    "image_url": "/jobsheets/job-001/step-2.svg",
    "estimated_minutes": 15
  },
  {
    "id": "step-3",
    "step_number": 3,
    "title": "Pengukuran Ketebalan Kampas (Brake Pad) & Rotor",
    "instruction": "Lepaskan pad rem dari bracket kaliper. Ukur ketebalan kampas rem (tanpa pelat backing) di 3 titik menggunakan vernier caliper. Ukur juga ketebalan piringan rotor menggunakan micrometer luar pada jarak 10mm dari bibir luar.",
    "image_url": "/jobsheets/job-001/step-3.svg",
    "estimated_minutes": 25
  },
  {
    "id": "step-4",
    "step_number": 4,
    "title": "Pembersihan & Perakitan Kembali",
    "instruction": "Semprotkan brake cleaner pada bracket dan piringan. Pasang shim anti-squeak dan kampas rem baru/lama yang masih layak. Oleskan brake grease tipis pada sliding pin kaliper. Kencangkan baut kaliper sesuai torsi spesifikasi.",
    "image_url": "/jobsheets/job-001/step-4.svg",
    "estimated_minutes": 20
  },
  {
    "id": "step-5",
    "step_number": 5,
    "title": "Pemasangan Roda & Tes Tekanan Pedal Rem",
    "instruction": "Pasang kembali roda dan kencangkan mur secara menyilang. Turunkan kendaraan dari jack stand. Kencangkan baut roda dengan kunci momen (105 Nm). Tekan pedal rem beberapa kali hingga terasa keras sebelum tes jalan.",
    "image_url": "/jobsheets/job-001/step-5.svg",
    "estimated_minutes": 15
  }
]$$::jsonb,
  $$[
  {
    "id": "meas-1",
    "parameter": "Ketebalan Kampas Rem Sisi Luar (Outer Pad)",
    "standard": "Standar: 10.0 mm | Batas Minimal: 2.0 mm",
    "unit": "mm",
    "input_type": "number",
    "min_val": 2,
    "max_val": 12
  },
  {
    "id": "meas-2",
    "parameter": "Ketebalan Kampas Rem Sisi Dalam (Inner Pad)",
    "standard": "Standar: 10.0 mm | Batas Minimal: 2.0 mm",
    "unit": "mm",
    "input_type": "number",
    "min_val": 2,
    "max_val": 12
  },
  {
    "id": "meas-3",
    "parameter": "Ketebalan Piringan Rotor Cakram",
    "standard": "Standar: 22.0 mm | Batas Minimal: 20.0 mm",
    "unit": "mm",
    "input_type": "number",
    "min_val": 20,
    "max_val": 24
  },
  {
    "id": "meas-4",
    "parameter": "Kondisi Selang Fleksibel & Kaliper Rem",
    "standard": "Tidak retak, tidak menggelembung, bebas rembesan fluida",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Sangat Baik (Kering & Lentur)",
      "Cukup (Tidak ada kebocoran)",
      "Retak Halus / Perlu Pantau",
      "Bocor / Wajib Ganti Segera"
    ]
  }
]$$::jsonb,
  90, 'Menengah', 'active', 'Bpk. Andi Santoso, S.Pd'
)
ON CONFLICT (code) DO UPDATE SET
  steps = EXCLUDED.steps,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  measurements = EXCLUDED.measurements;

INSERT INTO public.jobsheets (
  id, code, title, subject, target_class, description,
  learning_objectives, safety_points, materials, steps, measurements,
  duration, difficulty, status, created_by
) VALUES (
  '7c1d0a3e-5b2f-4e8a-9d61-00000a000002', 'JOB-002', 'Pengukuran Presisi dengan Jangka Sorong & Micrometer', 'Pekerjaan Dasar Teknik Otomotif (PDTO)', 'Kelas X', 'Praktik penggunaan alat ukur presisi vernier caliper ketelitian 0.05mm dan micrometer luar ketelitian 0.01mm pada komponen poros engkol dan katup mesin.',
  $$[
  "Siswa mampu melakukan kalibrasi titik nol (zero point) pada micrometer dan vernier caliper",
  "Siswa mampu membaca skala utama dan skala nonius secara akurat tanpa kesalahan paralaks",
  "Siswa mampu merawat dan menyimpan alat ukur presisi sesuai SOP bengkel"
]$$::jsonb,
  $$[
  "Jangan meletakkan alat ukur menumpuk dengan alat potong / benda keras lainnya",
  "Bersihkan benda kerja dari gram / oli sebelum diukur",
  "Gunakan sarung tangan katun bersih saat memegang alat ukur mikrometer presisi"
]$$::jsonb,
  $$[
  {
    "id": "m-201",
    "name": "Jangka Sorong 0.05 mm (0-150 mm)",
    "quantity": "1 Unit",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-202",
    "name": "Micrometer Luar 0-25 mm (0.01 mm)",
    "quantity": "1 Unit",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-203",
    "name": "Benda Uji Poros / Pin Piston",
    "quantity": "1 Set",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-204",
    "name": "Blok Ukur / Kalibrator 25mm",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  }
]$$::jsonb,
  $$[
  {
    "id": "step-201",
    "step_number": 1,
    "title": "Pembersihan & Pengecekan Titik Nol (Zero Point)",
    "instruction": "Bersihkan anvil dan spindle micrometer dengan kertas bersih. Putar rachet stopper perlahan hingga berbunyi klik 2-3 kali. Pastikan garis 0 pada thimble sejajar dengan garis index sleeve.",
    "image_url": "/jobsheets/job-002/step-1.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-202",
    "step_number": 2,
    "title": "Pengukuran Diameter Luar Pin Piston",
    "instruction": "Posisikan pin piston di antara anvil dan spindle. Putar thimble mendekati benda kerja, lalu gunakan ratchet stopper hingga berbunyi klik 2-3 kali. Kunci lock lever dan baca nilai pengukuran.",
    "image_url": "/jobsheets/job-002/step-2.svg",
    "estimated_minutes": 25
  },
  {
    "id": "step-203",
    "step_number": 3,
    "title": "Pengukuran Kedalaman & Diameter Dalam Bushing",
    "instruction": "Gunakan depth probe jangka sorong untuk mengukur kedalaman alur, dan gunakan rahang ukur dalam (inside jaws) untuk mengukur diameter lubang bushing.",
    "image_url": "/jobsheets/job-002/step-3.svg",
    "estimated_minutes": 25
  }
]$$::jsonb,
  $$[
  {
    "id": "meas-201",
    "parameter": "Diameter Luar Pin Piston (Posisi X)",
    "standard": "Standar: 19.980 - 20.000 mm",
    "unit": "mm",
    "input_type": "number",
    "min_val": 19.95,
    "max_val": 20.05
  },
  {
    "id": "meas-202",
    "parameter": "Diameter Luar Pin Piston (Posisi Y)",
    "standard": "Standar: 19.980 - 20.000 mm (Ovalitas max 0.005 mm)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 19.95,
    "max_val": 20.05
  },
  {
    "id": "meas-203",
    "parameter": "Diameter Dalam Bushing Connecting Rod",
    "standard": "Standar: 20.010 - 20.025 mm",
    "unit": "mm",
    "input_type": "number",
    "min_val": 20,
    "max_val": 20.05
  }
]$$::jsonb,
  60, 'Dasar', 'active', 'Bpk. Andi Santoso, S.Pd'
)
ON CONFLICT (code) DO UPDATE SET
  steps = EXCLUDED.steps,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  measurements = EXCLUDED.measurements;

INSERT INTO public.jobsheets (
  id, code, title, subject, target_class, description,
  learning_objectives, safety_points, materials, steps, measurements,
  duration, difficulty, status, created_by
) VALUES (
  '7c1d0a3e-5b2f-4e8a-9d61-00000a000003', 'JOB-003', 'Perakitan & Troubleshooting Rangkaian Lampu Kepala', 'Pemeliharaan Kelistrikan Kendaraan Ringan (PKKR)', 'Kelas XI', 'Praktik merangkai wiring diagram lampu kepala pengendali negatif/positif dengan relay 4-kaki, fuse, dan switch kombinasi.',
  $$[
  "Siswa dapat membaca gambar skema wiring kelistrikan bodi otomotif",
  "Siswa dapat merangkai sirkuit lampu kepala dekat/jauh dengan aman",
  "Siswa dapat menggunakan multimeter digital untuk mengukur drop tegangan dan kontinuitas"
]$$::jsonb,
  $$[
  "Pastikan saklar utama OFF saat memasang kabel jumper",
  "Pasang sekering (fuse 15A) di dekat kutub positif baterai sebelum menghubungkan ke beban",
  "Hindari short circuit (hubung singkat) antara terminal 30/87 dengan massa bodi"
]$$::jsonb,
  $$[
  {
    "id": "m-301",
    "name": "Stand Simulator Kelistrikan Bodi Mobil",
    "quantity": "1 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-302",
    "name": "Aki / Baterai 12V 45Ah",
    "quantity": "1 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-303",
    "name": "Kabel Jumper Banana Plug",
    "quantity": "1 Set (20 Pcs)",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-304",
    "name": "Multimeter Digital Sanwa",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-305",
    "name": "Relay 4-Pin 12V 30A",
    "quantity": "2 Unit",
    "category": "Alat",
    "condition": "Baik"
  }
]$$::jsonb,
  $$[
  {
    "id": "step-301",
    "step_number": 1,
    "title": "Pengecekan Tegangan Sumber Baterai",
    "instruction": "Ukur tegangan tanpa beban baterai menggunakan multimeter selector DCV 20V. Pastikan tegangan di atas 12.4 Volt.",
    "image_url": "/jobsheets/job-003/step-1.svg",
    "estimated_minutes": 15
  },
  {
    "id": "step-302",
    "step_number": 2,
    "title": "Pemasangan Sirkuit Daya & Sirkuit Kontrol Relay",
    "instruction": "Hubungkan terminal 30 relay ke B+ melalui Fuse. Hubungkan terminal 87 ke filamen lampu kepala. Hubungkan terminal 85 ke saklar kombinasi dan 86 ke massa ground.",
    "image_url": "/jobsheets/job-003/step-2.svg",
    "estimated_minutes": 45
  },
  {
    "id": "step-303",
    "step_number": 3,
    "title": "Uji Fungsi Lampu Dekat, Jauh, dan Pass Beam",
    "instruction": "Nyalakan saklar posisi headlamp low beam, uji perpindahan ke high beam, dan operasikan saklar dim (flash). Amati terangnya cahaya kedua bohlam.",
    "image_url": "/jobsheets/job-003/step-3.svg",
    "estimated_minutes": 30
  }
]$$::jsonb,
  $$[
  {
    "id": "meas-301",
    "parameter": "Tegangan Sumber Aki (Baterai)",
    "standard": "Standar: 12.4V - 12.8V",
    "unit": "Volt",
    "input_type": "number",
    "min_val": 12,
    "max_val": 13
  },
  {
    "id": "meas-302",
    "parameter": "Tegangan Kerja di Terminal Lampu Kepala",
    "standard": "Drop Tegangan Maksimal 0.5V (Min 11.9V)",
    "unit": "Volt",
    "input_type": "number",
    "min_val": 11.5,
    "max_val": 13
  },
  {
    "id": "meas-303",
    "parameter": "Kondisi Nyala Lampu Low & High Beam",
    "standard": "Terang merata kedua sisi, fokus baik",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Sempurna (Kedua Lampu Terang Normal)",
      "Lampu Kanan Redup (Cek Massa)",
      "Lampu Kiri Redup (Cek Massa)",
      "Tidak Menyala"
    ]
  }
]$$::jsonb,
  90, 'Mahir', 'active', 'Bpk. Andi Santoso, S.Pd'
)
ON CONFLICT (code) DO UPDATE SET
  steps = EXCLUDED.steps,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  materials = EXCLUDED.materials,
  measurements = EXCLUDED.measurements;
