-- =====================================================================
-- PERBAIKAN AKUN LOGIN SISWA
-- Jalankan di Supabase Dashboard > SQL Editor > New Query > Run.
-- Aman dijalankan berulang kali.
-- =====================================================================

-- LANGKAH 1 — Buat fungsi perbaikan (cukup sekali)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.upsert_student_account(
  p_nisn TEXT,
  p_full_name TEXT,
  p_class_name TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  -- NISN selalu 10 digit; kembalikan angka 0 di depan yang hilang karena Excel
  v_nisn TEXT := CASE WHEN p_nisn ~ '^\d+$' THEN lpad(p_nisn, 10, '0') ELSE trim(p_nisn) END;
  v_email TEXT;
  v_user_id UUID;
  v_status TEXT;
BEGIN
  v_email := v_nisn || '@siswa.mitra.sch.id';
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(v_email);

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      v_email, crypt(v_nisn, gen_salt('bf')), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name, 'role', 'student', 'nis_nip', v_nisn, 'class_name', p_class_name),
      NOW(), NOW(), '', '', '', ''
    );
    v_status := 'DIBUAT';
  ELSE
    -- Akun sudah ada: reset password = NISN, konfirmasi email, rapikan kolom token yang NULL
    UPDATE auth.users SET
      encrypted_password = crypt(v_nisn, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', p_full_name, 'role', 'student', 'nis_nip', v_nisn, 'class_name', p_class_name),
      updated_at = NOW()
    WHERE id = v_user_id;
    v_status := 'DIPERBAIKI';
  END IF;

  -- Identitas login email (dibutuhkan Supabase Auth versi baru)
  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    v_user_id::text, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT (provider_id, provider) DO NOTHING;

  -- Profil siswa di aplikasi
  INSERT INTO public.profiles (id, full_name, email, nis_nip, role, class_name)
  VALUES (v_user_id, p_full_name, v_email, v_nisn, 'student', p_class_name)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    nis_nip = EXCLUDED.nis_nip,
    role = 'student',
    class_name = EXCLUDED.class_name,
    updated_at = NOW();

  RETURN v_status || ': ' || p_full_name || ' (' || v_nisn || ')';
END;
$$;

-- Hanya bisa dijalankan dari SQL Editor, bukan dari aplikasi/browser
REVOKE ALL ON FUNCTION public.upsert_student_account(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;


-- LANGKAH 2 — Cek siswa yang sudah punya akun login
-- (siswa yang tidak muncul di sini belum bisa login)
SELECT p.full_name, p.nis_nip, p.class_name, u.email_confirmed_at IS NOT NULL AS email_terkonfirmasi, u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'student'
ORDER BY p.class_name, p.full_name;


-- LANGKAH 3 — Buat / perbaiki akun siswa
-- Ganti NISN dan kelas sesuai data asli, lalu jalankan.
-- Cara cepat: Data Siswa > Import Excel > pilih file > tombol "Copy SQL",
-- lalu tempel hasilnya di sini (semua siswa kelas itu ikut diperbaiki, aman).
--
-- SELECT upsert_student_account('NISN_10_DIGIT', 'MUHAMMAD RAGI SAPUTRA', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'RAFIQ FAIDAL NUR AKBAR', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'REZKY ADITYA PRATAMA', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'RAIHAN ALIFU', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'SETIAWAN NUGROHO', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'ZUHDI ASKA PUTRA', 'X TKR 2');
-- SELECT upsert_student_account('NISN_10_DIGIT', 'RAHMAT HIDAYAT', 'X TKR 2');
