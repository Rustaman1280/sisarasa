'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Fitur', href: '#fitur' },
  { label: 'Dampak', href: '#dampak' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-lg shadow-black/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src="/logo.png" 
              alt="SisaRasa Logo" 
              width={80} 
              height={40} 
              className="w-[80px] h-[40px] object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <span className="text-xl font-bold gradient-text-primary">
                SisaRasa
              </span>
              <p className="text-[10px] text-muted -mt-1 hidden sm:block">
                Selamatkan Makanan
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/masuk"
              className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-full gradient-primary hover:opacity-90 transition-opacity btn-shine"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-light/50 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-black/5">
                <Link
                  href="/masuk"
                  className="px-4 py-3 text-sm text-center text-muted hover:text-foreground rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="px-4 py-3 text-sm text-center font-semibold text-white rounded-full gradient-primary"
                >
                  Daftar Gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
