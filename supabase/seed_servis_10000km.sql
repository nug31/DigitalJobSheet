-- Contoh Jobsheet: Servis Berkala Mesin 10.000 km
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > Run.
-- Aman dijalankan ulang: data dengan id yang sama akan diperbarui.

INSERT INTO public.jobsheets (
  id, code, title, subject, target_class, description,
  learning_objectives, safety_points, materials, steps, measurements,
  duration, difficulty, status, created_by
) VALUES (
  '7c1d0a3e-5b2f-4e8a-9d61-10000a000001',
  'JOB-PMKR-10K',
  'Servis Berkala Mesin 10.000 km',
  'Pemeliharaan Mesin Kendaraan Ringan (PMKR)',
  'Kelas XI',
  'Melakukan servis berkala mesin bensin pada interval 10.000 km: penggantian oli dan filter oli, pemeriksaan saringan udara, busi, drive belt, sistem pendingin, baterai, kebocoran, dan putaran idle sesuai buku pedoman servis kendaraan.',
  $$[
  "Siswa dapat menjelaskan item pemeriksaan servis berkala mesin 10.000 km sesuai buku pedoman pemilik",
  "Siswa dapat mengganti oli mesin dan filter oli dengan prosedur dan torsi yang benar",
  "Siswa dapat memeriksa dan mengukur kondisi busi, saringan udara, tali penggerak (drive belt), sistem pendingin, dan baterai",
  "Siswa dapat memverifikasi putaran idle mesin menggunakan tachometer/scan tool",
  "Siswa dapat mengisi lembar laporan servis dan menyimpulkan kondisi mesin kendaraan"
]$$::jsonb,
  $$[
  "Wajib memakai wearpack, safety shoes, dan sarung tangan nitril saat menangani oli bekas",
  "Pasang ganjal roda, rem tangan aktif, transmisi posisi P/netral sebelum bekerja",
  "Pekerjaan sistem pendingin hanya saat mesin dingin - DILARANG membuka tutup radiator saat mesin panas",
  "Gunakan fender cover dan seat cover untuk melindungi bodi kendaraan",
  "Saat mesin hidup di dalam bengkel, pasang selang pembuangan gas buang (exhaust extraction)",
  "Jauhkan tangan, rambut, dan kain lap dari kipas radiator dan drive belt yang berputar",
  "Tampung oli bekas di wadah khusus dan buang sesuai aturan limbah B3"
]$$::jsonb,
  $$[
  {
    "id": "m-10k-1",
    "name": "Wearpack, Safety Shoes & Sarung Tangan Nitril",
    "quantity": "1 Set/siswa",
    "category": "Alat Keselamatan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-2",
    "name": "Fender Cover & Seat Cover",
    "quantity": "1 Set",
    "category": "Alat Keselamatan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-3",
    "name": "Ganjal Roda (Wheel Chock)",
    "quantity": "2 Pcs",
    "category": "Alat Keselamatan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-4",
    "name": "Car Lift / Dongkrak Buaya + Jack Stand",
    "quantity": "1 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-5",
    "name": "Kunci Ring Pas Set & Kunci Sok Set",
    "quantity": "1 Set",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-6",
    "name": "Kunci Filter Oli (Oil Filter Wrench)",
    "quantity": "1 Pcs",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-7",
    "name": "Kunci Busi 16mm / 14mm",
    "quantity": "1 Pcs",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-8",
    "name": "Kunci Momen (Torque Wrench)",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-10k-9",
    "name": "Feeler Gauge / Plug Gap Gauge",
    "quantity": "1 Set",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-10k-10",
    "name": "Multimeter Digital / Battery Tester",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-10k-11",
    "name": "Tachometer / Scan Tool OBD-II",
    "quantity": "1 Unit",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-10k-12",
    "name": "Belt Tension Gauge / Penggaris Baja",
    "quantity": "1 Pcs",
    "category": "Alat Ukur",
    "condition": "Baik"
  },
  {
    "id": "m-10k-13",
    "name": "Wadah Penampung Oli Bekas & Corong",
    "quantity": "1 Set",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-14",
    "name": "Air Gun (Kompresor) untuk Membersihkan Saringan Udara",
    "quantity": "1 Unit",
    "category": "Alat",
    "condition": "Baik"
  },
  {
    "id": "m-10k-15",
    "name": "Oli Mesin sesuai Spesifikasi Manual (mis. SAE 0W-20 / 10W-30)",
    "quantity": "3,5 - 4 Liter",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-16",
    "name": "Filter Oli Baru + Gasket Baut Tap Oli Baru",
    "quantity": "1 Set",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-17",
    "name": "Air Radiator (Coolant) Siap Pakai",
    "quantity": "1 Botol",
    "category": "Bahan",
    "condition": "Baik"
  },
  {
    "id": "m-10k-18",
    "name": "Kain Majun Bersih",
    "quantity": "3 Lembar",
    "category": "Bahan",
    "condition": "Baik"
  }
]$$::jsonb,
  $$[
  {
    "id": "step-10k-1",
    "step_number": 1,
    "title": "Persiapan Kendaraan & Pemeriksaan Awal",
    "instruction": "Posisikan kendaraan di area kerja datar, pasang ganjal roda, fender cover, dan seat cover. Catat nomor polisi, angka odometer (sekitar 10.000 km), dan keluhan pelanggan. Hidupkan mesin 2-3 menit untuk menghangatkan oli, lalu matikan.",
    "image_url": "/jobsheets/servis-10k/step-1.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-10k-2",
    "step_number": 2,
    "title": "Pemeriksaan Kondisi & Level Oli Mesin Lama",
    "instruction": "Tunggu sekitar 3 menit setelah mesin mati. Cabut dipstick, lap, masukkan kembali, lalu cabut dan baca level oli (harus di antara tanda L dan F). Amati warna dan kekentalan oli; catat jika ada serpihan logam atau warna seperti susu (indikasi coolant masuk ke oli).",
    "image_url": "/jobsheets/servis-10k/step-2.svg",
    "estimated_minutes": 5
  },
  {
    "id": "step-10k-3",
    "step_number": 3,
    "title": "Penggantian Oli Mesin & Filter Oli",
    "instruction": "Buka tutup pengisian oli. Angkat kendaraan, letakkan wadah penampung, buka baut tap oli dan tunggu oli bekas habis menetes. Pasang baut tap dengan gasket BARU dan kencangkan sesuai torsi buku manual. Lepas filter oli dengan kunci filter, olesi seal filter baru dengan oli, pasang dengan tangan sampai seal menyentuh dudukan lalu tambah 3/4 putaran. Turunkan kendaraan dan isi oli baru sesuai kapasitas di buku manual.",
    "image_url": "/jobsheets/servis-10k/step-3.svg",
    "estimated_minutes": 30
  },
  {
    "id": "step-10k-4",
    "step_number": 4,
    "title": "Pemeriksaan & Pembersihan Saringan Udara",
    "instruction": "Buka rumah saringan udara dan keluarkan elemennya. Periksa kotoran, sobek, atau basah oli. Bersihkan dengan semprotan angin bertekanan rendah dari sisi DALAM ke LUAR. Ganti bila rusak atau sangat kotor. Pasang kembali dan pastikan klem terkunci rapat.",
    "image_url": "/jobsheets/servis-10k/step-4.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-10k-5",
    "step_number": 5,
    "title": "Pemeriksaan & Pengukuran Celah Busi",
    "instruction": "Saat mesin dingin, lepas koil/kabel busi berurutan agar tidak tertukar. Buka busi dengan kunci busi. Periksa warna elektroda (normal: cokelat keabu-abuan). Ukur celah elektroda dengan plug gap gauge dan bandingkan dengan spesifikasi buku manual. Busi Iridium/Platinum cukup diperiksa - jangan disetel atau disikat. Pasang kembali dengan tangan, lalu kencangkan sesuai torsi buku manual.",
    "image_url": "/jobsheets/servis-10k/step-5.svg",
    "estimated_minutes": 20
  },
  {
    "id": "step-10k-6",
    "step_number": 6,
    "title": "Pemeriksaan Tali Penggerak (Drive Belt)",
    "instruction": "Periksa drive belt dari retak, terkelupas, mengkilap, atau aus pada alurnya. Tekan bagian tengah belt di antara dua puli terjauh dengan gaya sekitar 10 kgf dan ukur defleksinya (atau gunakan belt tension gauge). Bandingkan dengan spesifikasi. Pada belt dengan auto tensioner, pastikan tanda indikator masih di dalam batas.",
    "image_url": "/jobsheets/servis-10k/step-6.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-10k-7",
    "step_number": 7,
    "title": "Pemeriksaan Sistem Pendingin",
    "instruction": "Pastikan mesin DINGIN. Periksa level coolant di tangki cadangan (di antara FULL dan LOW), tambahkan coolant sejenis bila kurang. Periksa selang radiator atas/bawah dari retak, menggembung, atau rembes, serta kekencangan klemnya. Periksa sirip radiator dari kotoran yang menghambat aliran udara.",
    "image_url": "/jobsheets/servis-10k/step-7.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-10k-8",
    "step_number": 8,
    "title": "Pemeriksaan Baterai/Aki",
    "instruction": "Periksa terminal dari korosi dan kekencangan klem. Ukur tegangan baterai saat mesin mati dengan multimeter (DCV 20V). Hidupkan mesin dan ukur tegangan pengisian pada 2.000 rpm. Untuk aki basah, periksa level elektrolit di antara UPPER dan LOWER.",
    "image_url": "/jobsheets/servis-10k/step-8.svg",
    "estimated_minutes": 10
  },
  {
    "id": "step-10k-9",
    "step_number": 9,
    "title": "Pemeriksaan Kebocoran & Putaran Idle",
    "instruction": "Hidupkan mesin hingga suhu kerja (kipas radiator berputar). Periksa kebocoran oli di sekitar baut tap, filter oli, dan gasket tutup kepala silinder, serta kebocoran coolant. Ukur putaran idle dengan tachometer/scan tool (lampu, AC, dan beban listrik OFF). Matikan mesin, tunggu 3 menit, periksa ulang level oli dan tambahkan bila perlu.",
    "image_url": "/jobsheets/servis-10k/step-9.svg",
    "estimated_minutes": 15
  },
  {
    "id": "step-10k-10",
    "step_number": 10,
    "title": "Reset Indikator Servis & Pengisian Laporan",
    "instruction": "Reset indikator servis/oil maintenance di panel instrumen sesuai prosedur buku manual. Pasang stiker jadwal servis berikutnya (20.000 km / 6 bulan). Lepas fender cover dan seat cover, bersihkan area kerja, rapikan alat, lalu isi seluruh hasil pengukuran pada lembar ini.",
    "image_url": "/jobsheets/servis-10k/step-10.svg",
    "estimated_minutes": 10
  }
]$$::jsonb,
  $$[
  {
    "id": "meas-10k-1",
    "parameter": "Level Oli Mesin Sebelum Servis",
    "standard": "Di antara tanda L dan F pada dipstick",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Normal (di antara L-F)",
      "Kurang (di bawah L)",
      "Berlebih (di atas F)"
    ]
  },
  {
    "id": "meas-10k-2",
    "parameter": "Kondisi Oli Mesin Lama",
    "standard": "Cokelat gelap, tidak bercampur air/serpihan logam",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Normal (cokelat gelap, kekentalan wajar)",
      "Hitam pekat / sangat kental",
      "Seperti susu (indikasi coolant masuk)",
      "Ada serpihan logam"
    ]
  },
  {
    "id": "meas-10k-3",
    "parameter": "Volume Oli Baru yang Diisikan",
    "standard": "Sesuai kapasitas buku manual (umumnya 3,5 - 4,2 L dengan filter)",
    "unit": "Liter",
    "input_type": "number",
    "min_val": 3.0,
    "max_val": 4.5
  },
  {
    "id": "meas-10k-4",
    "parameter": "Kondisi Saringan Udara",
    "standard": "Bersih / cukup bersih, tidak sobek",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Bersih (dipakai kembali)",
      "Kotor - dibersihkan",
      "Sangat kotor / sobek - wajib ganti"
    ]
  },
  {
    "id": "meas-10k-5",
    "parameter": "Celah Busi Silinder 1",
    "standard": "Standar 1,0 - 1,1 mm (cek buku manual)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 0.9,
    "max_val": 1.2
  },
  {
    "id": "meas-10k-6",
    "parameter": "Celah Busi Silinder 2",
    "standard": "Standar 1,0 - 1,1 mm (cek buku manual)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 0.9,
    "max_val": 1.2
  },
  {
    "id": "meas-10k-7",
    "parameter": "Celah Busi Silinder 3",
    "standard": "Standar 1,0 - 1,1 mm (cek buku manual)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 0.9,
    "max_val": 1.2
  },
  {
    "id": "meas-10k-8",
    "parameter": "Celah Busi Silinder 4",
    "standard": "Standar 1,0 - 1,1 mm (cek buku manual)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 0.9,
    "max_val": 1.2
  },
  {
    "id": "meas-10k-9",
    "parameter": "Defleksi Drive Belt (tekanan 10 kgf)",
    "standard": "Umumnya 7 - 10 mm (cek buku manual)",
    "unit": "mm",
    "input_type": "number",
    "min_val": 5,
    "max_val": 12
  },
  {
    "id": "meas-10k-10",
    "parameter": "Level & Kondisi Coolant",
    "standard": "Di antara FULL dan LOW, warna jernih",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Normal",
      "Kurang - sudah ditambahkan",
      "Kotor / berkarat - perlu dikuras",
      "Ada kebocoran"
    ]
  },
  {
    "id": "meas-10k-11",
    "parameter": "Tegangan Baterai (Mesin Mati)",
    "standard": "12,4 - 12,8 V",
    "unit": "Volt",
    "input_type": "number",
    "min_val": 12.2,
    "max_val": 13.0
  },
  {
    "id": "meas-10k-12",
    "parameter": "Tegangan Pengisian (Mesin 2.000 rpm)",
    "standard": "13,8 - 14,8 V",
    "unit": "Volt",
    "input_type": "number",
    "min_val": 13.5,
    "max_val": 15.0
  },
  {
    "id": "meas-10k-13",
    "parameter": "Putaran Idle Mesin (Suhu Kerja, Beban OFF)",
    "standard": "650 - 750 rpm (cek buku manual)",
    "unit": "rpm",
    "input_type": "number",
    "min_val": 600,
    "max_val": 850
  },
  {
    "id": "meas-10k-14",
    "parameter": "Pemeriksaan Kebocoran Oli & Coolant",
    "standard": "Tidak ada rembesan/tetesan",
    "unit": "-",
    "input_type": "select",
    "options": [
      "Tidak ada kebocoran",
      "Rembes ringan - perlu dipantau",
      "Bocor - wajib perbaikan"
    ]
  },
  {
    "id": "meas-10k-15",
    "parameter": "Kesimpulan Kondisi Mesin & Rekomendasi",
    "standard": "Ringkas hasil servis dan rekomendasi perbaikan",
    "unit": "-",
    "input_type": "text"
  }
]$$::jsonb,
  150,
  'Menengah',
  'active',
  'Joko Setyo Nugroho, S.T'
)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  target_class = EXCLUDED.target_class,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  safety_points = EXCLUDED.safety_points,
  materials = EXCLUDED.materials,
  steps = EXCLUDED.steps,
  measurements = EXCLUDED.measurements,
  duration = EXCLUDED.duration,
  difficulty = EXCLUDED.difficulty,
  status = EXCLUDED.status;
