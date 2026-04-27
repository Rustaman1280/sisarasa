import { Search, CreditCard, ShoppingBag } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Temukan',
    description: 'Cari makanan surplus dari restoran, kafe, dan bakery di sekitarmu dengan harga hemat.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: CreditCard,
    number: '02',
    title: 'Pesan',
    description: 'Pilih paket makanan favorit dan pesan langsung melalui aplikasi. Bayar dengan mudah.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
  {
    icon: ShoppingBag,
    number: '03',
    title: 'Ambil',
    description: 'Ambil pesananmu di toko pada waktu yang ditentukan. Nikmati makanan lezat!',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
];

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Cara Kerja
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Semudah <span className="gradient-text-primary">3 Langkah</span>
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Mulai selamatkan makanan dan hemat uang dalam hitungan menit.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 150}>
              <div
                className={`relative p-8 rounded-2xl glass card-hover border ${step.border} group`}
              >
                {/* Step number */}
                <span className={`text-6xl font-extrabold ${step.color} opacity-10 absolute top-4 right-6`}>
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${step.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.description}</p>

                {/* Connector line on desktop */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
