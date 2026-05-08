'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Package, ClipboardList, Store as StoreIcon, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner } from '@/app/lib/firestore';
import { StoreData } from '@/app/lib/types';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Produk', href: '/produk', icon: Package },
  { label: 'Pesanan Masuk', href: '/pesanan-masuk', icon: ClipboardList },
  { label: 'Pesan', href: '/chat-toko', icon: MessageCircle },
  { label: 'Profil Toko', href: '/profil-toko', icon: StoreIcon },
];

export default function TokoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [store, setStore] = useState<StoreData | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/masuk');
    }
    if (!loading && userData?.role === 'customer') {
      router.push('/beranda');
    }
    if (user && userData?.role === 'store') {
      getStoreByOwner(user.uid).then(setStore).catch(console.error);
    }
  }, [user, userData, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || userData?.role !== 'store') return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-strong border-r border-black/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8 group">
            <Image 
              src="/logo.png" 
              alt="SisaRasa Logo" 
              width={80} 
              height={40} 
              className="w-[80px] h-[40px] object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-bold gradient-text-primary">SisaRasa</span>
          </Link>

          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'gradient-primary text-white shadow-lg shadow-primary/25'
                      : 'text-muted hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-black/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full gradient-secondary flex items-center justify-center text-white font-bold">
              {store?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <p className="text-sm font-bold truncate w-32">{store?.name || 'Toko'}</p>
              <p className="text-[10px] text-muted">Mitra SisaRasa</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden glass-strong h-16 flex items-center justify-between px-4 border-b border-black/5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image 
              src="/logo.png" 
              alt="SisaRasa Logo" 
              width={80} 
              height={40} 
              className="w-[80px] h-[40px] object-contain group-hover:scale-105 transition-transform" 
            />
          </Link>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-muted hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
