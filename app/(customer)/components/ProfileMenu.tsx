"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

export default function ProfileMenu({ user, logout }: { user: any; logout: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/masuk');
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
        <UserIcon className="w-5 h-5 text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-md z-50 py-2">
          <Link href="/profil" className="block px-4 py-2 text-sm hover:bg-surface-hover">Profil Saya</Link>
          <Link href="/profil/pengaturan" className="block px-4 py-2 text-sm hover:bg-surface-hover flex items-center gap-2">
            <Settings className="w-4 h-4" /> Pengaturan
          </Link>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover flex items-center gap-2 text-danger">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}
