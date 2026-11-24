import React from 'react';

// Brand mark: a job sheet with a green "done" check on the app's blue tile
export const AppLogo: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg viewBox="0 0 72 72" className={`${className} shrink-0`} role="img" aria-label="Logo Mitra Job Sheet">
    <rect width="72" height="72" rx="16" fill="#2563EB" />
    <path d="M20 12h24l10 10v38a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2z" fill="#fff" />
    <path d="M44 12v10h10" fill="#BFDBFE" />
    <rect x="24" y="28" width="16" height="3" rx="1.5" fill="#93C5FD" />
    <rect x="24" y="35" width="22" height="3" rx="1.5" fill="#93C5FD" />
    <circle cx="44" cy="50" r="9" fill="#16A34A" />
    <path d="M40 50l3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
