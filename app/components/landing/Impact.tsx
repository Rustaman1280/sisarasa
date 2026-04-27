import { Utensils, Leaf, TrendingDown, Heart } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import AnimatedCounter from '../ui/AnimatedCounter';

const stats = [
  {
    icon: Utensils,
    value: 15000,
    suffix: '+',
    label: 'Porsi Makanan Diselamatkan',
    description: 'Makanan berkualitas yang tidak terbuang sia-sia',
    color: 'text-primary',
    bg: 'from-primary/20 to-primary/5',
  },
  {
    icon: Heart,
    value: 500,
    suffix: '+',
    label: 'Mitra Bergabung',
    description: 'Restoran, kafe, dan bakery di seluruh Indonesia',
    color: 'text-secondary',
    bg: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: TrendingDown,
    value: 12,
    suffix: ' Ton',
    label: 'CO₂ Berhasil Dikurangi',
    description: 'Kontribusi nyata untuk lingkungan yang lebih baik',
    color: 'text-accent',
    bg: 'from-accent/20 to-accent/5',
  },
  {
    icon: Leaf,
    value: 8000,
    suffix: '+',
    label: 'Pengguna Aktif',
    description: 'Komunitas food saver yang terus bertumbuh',
    color: 'text-emerald-400',
    bg: 'from-emerald-400/20 to-emerald-400/5',
  },
];

export default function Impact() {
  return (
    <section id="dampak" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              Dampak Nyata
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Bersama Kita{' '}
              <span className="gradient-text-primary">Membuat Perbedaan</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Setiap porsi yang diselamatkan adalah langkah kecil menuju planet yang lebih baik.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 100}>
              <div className="relative p-6 rounded-2xl glass card-hover text-center overflow-hidden group">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>

                  <div className={`text-3xl font-extrabold mb-2 ${stat.color}`}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>

                  <h3 className="text-sm font-semibold mb-1">{stat.label}</h3>
                  <p className="text-xs text-muted">{stat.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
