import Link from 'next/link';
import Image from 'next/image';
import { Camera as Instagram, X as Twitter, Mail, Heart } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'Dampak', href: '#dampak' },
    { label: 'Daftar', href: '/daftar' },
  ],
  Perusahaan: [
    { label: 'Tentang Kami', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Karir', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Bantuan: [
    { label: 'FAQ', href: '#' },
    { label: 'Kontak', href: '#' },
    { label: 'Syarat & Ketentuan', href: '#' },
    { label: 'Kebijakan Privasi', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Image 
                src="/logo.png" 
                alt="SisaRasa Logo" 
                width={80} 
                height={60} 
                className="w-[80px] h-[60px] object-contain group-hover:scale-105 transition-transform" 
              />
              <span className="text-xl font-bold gradient-text-primary">
                SisaRasa
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Platform inovatif untuk mengurangi food waste di Indonesia.
              Selamatkan makanan, hemat uang, jaga bumi.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            © 2026 SisaRasa. All rights reserved.
          </p>
          <p className="text-sm text-muted flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> untuk Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
