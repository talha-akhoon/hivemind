"use client";
import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserDropdownMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
      >
        <span className="hidden sm:block text-gray-900 font-medium">{user?.email || 'User'}</span>
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <a
            href="/my-datasets"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            My Datasets
          </a>
          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-md"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
