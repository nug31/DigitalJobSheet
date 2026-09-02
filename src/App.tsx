import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentJobsheetList } from './pages/StudentJobsheetList';
import { StudentJobsheetDetail } from './pages/StudentJobsheetDetail';
import { StudentCompetencies } from './pages/StudentCompetencies';
import { TeacherLayout } from './layouts/TeacherLayout';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { TeacherJobsheetList } from './pages/TeacherJobsheetList';
import { TeacherJobsheetCreate } from './pages/TeacherJobsheetCreate';
import { TeacherAssessment } from './pages/TeacherAssessment';
import { TeacherStudents } from './pages/TeacherStudents';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

// Root Redirect based on user authentication and role
const RootRedirect: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return <Navigate to="/login" replace />;
  if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (profile.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="jobsheets" element={<StudentJobsheetList />} />
              <Route path="jobsheet/:id" element={<StudentJobsheetDetail />} />
              <Route path="competencies" element={<StudentCompetencies />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherDashboard />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/jobsheets"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherJobsheetList />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/jobsheets/create"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherJobsheetCreate />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/jobsheets/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherJobsheetCreate />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assessment"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherAssessment />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherStudents />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
