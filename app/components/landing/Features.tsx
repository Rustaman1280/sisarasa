import { MapPin, Clock, Gift, Trophy, BarChart3, Users } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const features = [
  {
    icon: MapPin,
    title: 'Berbasis Lokasi',
    description: 'Temukan makanan surplus terdekat dari lokasimu dengan peta interaktif.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Clock,
    title: 'Update Real-time',
    description: 'Dapatkan notifikasi saat ada makanan baru di sekitarmu. Jangan sampai kehabisan!',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Gift,
    title: 'Program Donasi',
    description: 'Donasikan makanan surplus ke komunitas yang membutuhkan secara langsung.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Trophy,
    title: 'Gamifikasi',
    description: 'Kumpulkan poin dan badge setiap kali menyelamatkan makanan. Jadilah Food Hero!',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: BarChart3,
    title: 'Impact Tracker',
    description: 'Pantau kontribusimu dalam mengurangi food waste dan emisi CO₂ secara real-time.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Users,
    title: 'Komunitas',
    description: 'Bergabung dengan komunitas food saver dan berbagi tips mengurangi pemborosan.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
];

export default function Features() {
  return (
    <section id="fitur" className="py-24 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-secondary uppercase tracking-wider">
              Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Lebih dari Sekadar{' '}
              <span className="gradient-text-secondary">Marketplace</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              SisaRasa dilengkapi berbagai fitur inovatif untuk pengalaman terbaik.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <div className="p-6 rounded-2xl glass card-hover group h-full">
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
