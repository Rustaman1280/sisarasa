import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

export default function Hero() {
  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary blob animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary blob animate-floatSlow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted">
              Inovasi Digital untuk Masa Depan Berkelanjutan
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fadeInUp text-balance">
            Selamatkan Makanan,{' '}
            <span className="gradient-text-primary">Hemat Uangmu</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 animate-fadeInUp delay-200 text-balance">
            Temukan makanan berkualitas dari restoran & kafe terdekat dengan{' '}
            <span className="text-accent font-semibold">diskon hingga 70%</span>
            . Kurangi food waste, hemat pengeluaran.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeInUp delay-300">
            <Link
              href="/daftar"
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full gradient-primary hover:opacity-90 transition-all btn-shine shadow-lg shadow-primary/25"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#cara-kerja"
              className="flex items-center gap-2 px-8 py-4 text-base font-medium text-muted hover:text-foreground rounded-full glass hover:bg-surface-hover transition-all"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 animate-fadeInUp delay-500">
            {[
              { value: 15000, suffix: '+', label: 'Porsi Diselamatkan' },
              { value: 500, suffix: '+', label: 'Mitra Bergabung' },
              { value: 8000, suffix: '+', label: 'Pengguna Aktif' },
              { value: 12, suffix: ' Ton', label: 'CO₂ Dikurangi' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
