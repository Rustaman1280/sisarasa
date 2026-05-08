'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Search, ClipboardList, User, MessageCircle, Heart } from 'lucide-react';
import ProfileMenu from './components/ProfileMenu';
import { useAuth } from '@/app/lib/auth-context';

const bottomNavItems = [
  { label: 'Beranda', href: '/beranda', icon: Home },
  { label: 'Jelajahi', href: '/jelajahi', icon: Search },
  { label: 'Favorit', href: '/favorit', icon: Heart },
  { label: 'Pesanan', href: '/pesanan', icon: ClipboardList },
  { label: 'Profil', href: '/profil', icon: User },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/masuk');
    }
    if (!loading && userData?.role === 'store') {
      router.push('/dashboard');
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Running Notification Ticker */}
      <div className="bg-primary text-white text-xs py-1.5 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap">
          🚀 Promo Spesial Hari Ini! Dapatkan diskon hingga 50% untuk makanan pilihan. Hemat uang, selamatkan bumi! 🌍 | ✨ Jangan lupa ambil pesanan tepat waktu di toko terdekatmu!
        </div>
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/beranda" className="flex items-center gap-2 group">
            <Image 
              src="/logo.png" 
              alt="SisaRasa Logo" 
              width={100} 
              height={50} 
              className="w-[120px] h-[60px] object-contain group-hover:scale-105 transition-transform" 
            />
          </Link>

          {/* Desktop nav: show same items as mobile bottom nav */}
          <nav className="hidden md:flex items-center gap-2 ml-6">
            {bottomNavItems
              .filter((item) => item.href !== '/profil')
              .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 relative">
            <Link href="/chat" className="p-2 rounded-lg glass hover:bg-surface-hover transition-colors relative block">
              <MessageCircle className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Link>

            {/* Profile dropdown trigger */}
            <ProfileMenu user={user} logout={logout} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
