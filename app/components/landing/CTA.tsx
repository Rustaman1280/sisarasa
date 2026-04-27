import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

export default function CTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptLTE4IDB2Nmgtdlszh2g2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            <div className="relative z-10 py-16 px-8 sm:py-20 sm:px-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 mb-6">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-medium">Bergabung Sekarang</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 text-balance">
                Mulai Selamatkan Makanan<br />Hari Ini Juga
              </h2>

              <p className="text-lg text-black/70 max-w-xl mx-auto mb-10">
                Setiap porsi yang kamu selamatkan adalah langkah kecil untuk dunia yang lebih baik. Daftar gratis dan mulai berkontribusi.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/daftar"
                  className="group flex items-center gap-2 px-8 py-4 text-base font-bold text-primary bg-white rounded-full hover:bg-gray-100 transition-colors shadow-xl"
                >
                  Daftar Sebagai Pembeli
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/daftar"
                  className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full border-2 border-white/30 hover:bg-black/5 transition-colors"
                >
                  Daftar Sebagai Mitra
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
