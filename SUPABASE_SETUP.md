# Panduan Setup Supabase & Akun Siswa (NISN)

Aplikasi **Mitra Digital Job Sheet** telah terhubung dengan Supabase project Anda:
- **URL**: `https://mhollmhchmvvhsymhbom.supabase.co`

---

## 📜 1. Script SQL Schema Database

Salin dan jalankan script SQL berikut pada **Supabase Dashboard > SQL Editor > New Query > Run**:

```sql
-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  nis_nip TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  class_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 2. Create JOBSHEETS Table
CREATE TABLE IF NOT EXISTS public.jobsheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  target_class TEXT NOT NULL,
  description TEXT,
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  safety_points JSONB DEFAULT '[]'::jsonb,
  materials JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  measurements JSONB DEFAULT '[]'::jsonb,
  duration INTEGER DEFAULT 90,
  difficulty TEXT DEFAULT 'Menengah',
  status TEXT DEFAULT 'active',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Jobsheets
ALTER TABLE public.jobsheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobsheets are viewable by all authenticated users"
  ON public.jobsheets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and Admins can manage jobsheets"
  ON public.jobsheets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 3. Create SUBMISSIONS Table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jobsheet_id UUID REFERENCES public.jobsheets(id) ON DELETE CASCADE,
  jobsheet_code TEXT NOT NULL,
  jobsheet_title TEXT NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_nis TEXT,
  class_name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finish_time TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  safety_checks JSONB DEFAULT '{}'::jsonb,
  material_checks JSONB DEFAULT '{}'::jsonb,
  step_data JSONB DEFAULT '{}'::jsonb,
  measurements_data JSONB DEFAULT '{}'::jsonb,
  student_notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded', 'revision_needed')),
  submitted_at TIMESTAMPTZ,
  score_k3 INTEGER,
  score_steps INTEGER,
  score_measurements INTEGER,
  total_score INTEGER,
  competency_status TEXT CHECK (competency_status IN ('Kompeten', 'Belum Kompeten')),
  teacher_feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view and manage their own submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers and Admins can view and grade all submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 4. Create CLASSES Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  homeroom_teacher TEXT NOT NULL,
  total_students INTEGER DEFAULT 36,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes are viewable by all authenticated users" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. Create SUBJECTS Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects are viewable by all authenticated users" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
```

---

## 👥 2. Membuat Akun Siswa dengan NISN di Supabase Auth

Untuk membuat akun Siswa di Supabase Auth secara otomatis dengan **Username/Email = `<NISN>@siswa.mitra.sch.id`** dan **Password = `<NISN>`**:

Jalankan script SQL berikut di **Supabase Dashboard > SQL Editor**:

```sql
-- Aktifkan pgcrypto untuk hashing password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fungsi Helper untuk membuat User & Profile otomatis
CREATE OR REPLACE FUNCTION create_student_account(
  p_nisn TEXT,
  p_full_name TEXT,
  p_class_name TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_email TEXT := p_nisn || '@siswa.mitra.sch.id';
BEGIN
  -- Insert into auth.users jika belum ada
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(p_nisn, gen_salt('bf')), -- Password diset sama dengan NISN
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', p_full_name, 'role', 'student', 'nisn', p_nisn, 'class_name', p_class_name),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      nis_nip,
      role,
      class_name
    ) VALUES (
      v_user_id,
      p_full_name,
      v_email,
      p_nisn,
      'student',
      p_class_name
    ) ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fungsi Helper untuk membuat User Guru / Admin
CREATE OR REPLACE FUNCTION create_staff_account(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_nip TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', p_email,
      crypt(p_password, gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', p_full_name, 'role', p_role, 'nis_nip', p_nip),
      NOW(), NOW(), 'authenticated', 'authenticated'
    );

    INSERT INTO public.profiles (id, full_name, email, nis_nip, role)
    VALUES (v_user_id, p_full_name, p_email, p_nip, p_role)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─── EKSEKUSI PEMBUATAN AKUN UTAMA ───
-- 1. Akun Admin
SELECT create_staff_account('admin@mitra.sch.id', 'admin123', 'Bpk. Hendra Wijaya, M.Kom', 'admin', '19800101001');

-- 2. Akun Guru Produktif TKR
SELECT create_staff_account('guru@mitra.sch.id', 'guru123', 'Bpk. Andi Santoso, S.Pd', 'teacher', '19850315002');
SELECT create_staff_account('guru.tkr@mitra.sch.id', 'guru123', 'Bpk. Andi Santoso, S.Pd', 'teacher', '19850315002');

-- 3. Akun Siswa (Ahnaf Abdul Jabbar & Demo Siswa)
SELECT create_student_account('0106090576', 'AHNAF ABDUL JABBAR', 'X TKR 2');
SELECT create_student_account('0071234567', 'Muhammad Rizky Pratama', 'XI TKR 1');
SELECT create_student_account('0071234568', 'Ahmad Fauzi Setiawan', 'XI TKR 1');
SELECT create_student_account('0071234569', 'Bagas Aditya Nugraha', 'XI TKR 1');
SELECT create_student_account('0071234570', 'Dwi Putra Prasetyo', 'X TKR 1');
```

---

## 🔑 3. Daftar Akun Siap Pakai:

| Peran | Username / NISN / Email | Password | Nama Pengguna | Kelas |
| :--- | :--- | :--- | :--- | :--- |
| **Siswa (Utama)** | `0106090576` | `0106090576` | AHNAF ABDUL JABBAR | **X TKR 2** |
| **Siswa Demo 1** | `0071234567` | `0071234567` | Muhammad Rizky Pratama | XI TKR 1 |
| **Siswa Demo 2** | `0071234568` | `0071234568` | Ahmad Fauzi Setiawan | XI TKR 1 |
| **Guru Produktif TKR** | `guru@mitra.sch.id` | `guru123` | Bpk. Andi Santoso, S.Pd | - |
| **Admin Sistem** | `admin@mitra.sch.id` | `admin123` | Bpk. Hendra Wijaya, M.Kom | - |
