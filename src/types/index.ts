export type Role = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  role: Role;
  full_name: string;
  nis_nip: string | null;
  avatar_url: string | null;
  class_name?: string;
  email?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number | string;
  category: 'Alat' | 'Bahan' | 'Alat Ukur' | 'Alat Keselamatan';
  condition: 'Baik' | 'Cukup' | 'Perlu Perhatian';
}

export interface StepItem {
  id: string;
  step_number: number;
  title: string;
  instruction: string;
  image_url?: string;
  estimated_minutes: number;
}

export interface MeasurementItem {
  id: string;
  parameter: string;
  standard: string;
  unit: string;
  input_type: 'number' | 'select' | 'text';
  min_val?: number;
  max_val?: number;
  options?: string[];
}

export interface Jobsheet {
  id: string;
  code: string;
  title: string;
  subject: string;
  class_id?: string;
  target_class: string;
  description: string;
  learning_objectives: string[];
  safety_points: string[];
  duration: number; // in minutes
  difficulty: 'Dasar' | 'Menengah' | 'Mahir';
  status: 'active' | 'draft' | 'archived';
  materials: MaterialItem[];
  steps: StepItem[];
  measurements: MeasurementItem[];
  created_at: string;
  created_by?: string;
}

export interface StepSubmissionData {
  completed: boolean;
  photo_url?: string;
  notes?: string;
}

export interface Submission {
  id: string;
  jobsheet_id: string;
  jobsheet_code: string;
  jobsheet_title: string;
  student_id: string;
  student_name: string;
  student_nis: string;
  class_name: string;
  start_time: string;
  finish_time?: string;
  duration_seconds: number;
  safety_checks: Record<string, boolean>;
  material_checks: Record<string, boolean>;
  step_data: Record<string, StepSubmissionData>;
  measurements_data: Record<string, string>;
  student_notes?: string;
  status: 'draft' | 'submitted' | 'graded' | 'revision_needed';
  submitted_at?: string;
  // Assessment
  score_k3?: number;
  score_steps?: number;
  score_measurements?: number;
  total_score?: number;
  competency_status?: 'Kompeten' | 'Belum Kompeten';
  teacher_feedback?: string;
  graded_at?: string;
  graded_by?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  department: string;
  academic_year: string;
  homeroom_teacher: string;
  total_students: number;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  description: string;
  grade_level: string;
}
