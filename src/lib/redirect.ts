import type { Role } from '../types';

// Set by ProtectedRoute when a logged-out user opens a deep link (e.g. scanning a jobsheet QR)
const REDIRECT_KEY = 'mitra_redirect_after_login';

export const saveRedirectAfterLogin = (path: string): void => {
  if (path && path !== '/' && path !== '/login') {
    sessionStorage.setItem(REDIRECT_KEY, path);
  }
};

const dashboardFor = (role: Role): string => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/student/dashboard';
};

// Map a requested path to one the role can open. A jobsheet QR points at the student page;
// teachers are sent to that jobsheet in the editor instead of their dashboard.
export const pathForRole = (role: Role, path: string): string => {
  const jobsheetMatch = path.match(/^\/student\/jobsheet\/([^/?#]+)/);
  if (jobsheetMatch && role === 'teacher') return `/teacher/jobsheets/edit/${jobsheetMatch[1]}`;
  if (path.startsWith('/student') && role !== 'student') return dashboardFor(role);
  if (path.startsWith('/teacher') && role !== 'teacher') return dashboardFor(role);
  if (path.startsWith('/admin') && role !== 'admin') return dashboardFor(role);
  return path;
};

// Where to go right after login: the saved deep link if any (consumed once), otherwise the dashboard
export const takePostLoginPath = (role: Role): string => {
  const saved = sessionStorage.getItem(REDIRECT_KEY);
  if (saved) {
    sessionStorage.removeItem(REDIRECT_KEY);
    return pathForRole(role, saved);
  }
  return dashboardFor(role);
};
