# Panduan Setup Supabase & SQL Schema

Aplikasi **Mitra Digital Job Sheet** telah terhubung dengan Supabase project Anda:
- **URL**: `https://mhollmhchmvvhsymhbom.supabase.co`

---

## 📜 Script SQL Schema Database

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

## ⚙️ Pengaturan Auth di Supabase Dashboard:
1. Masuk ke **Authentication > Providers > Email**.
2. Matikan toggle **"Confirm email"** agar pendaftaran/pembuatan akun dapat langsung aktif tanpa menunggu verifikasi email.
