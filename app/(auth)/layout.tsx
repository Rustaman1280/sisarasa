import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary blob animate-float" />
      <div className="absolute bottom-10 -right-10 w-96 h-96 bg-secondary blob animate-floatSlow" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <Image 
            src="/logo.png" 
            alt="SisaRasa Logo" 
            width={120} 
            height={90} 
            className="w-[120px] h-[90px] object-contain group-hover:scale-105 transition-transform" 
          />
          <div>
            <span className="text-2xl font-bold gradient-text-primary">SisaRasa</span>
            <p className="text-xs text-muted -mt-0.5">Selamatkan Makanan</p>
          </div>
        </Link>

        {/* Card */}
        <div className="rounded-2xl glass-strong p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
