'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const testimonials = [
  {
    name: 'Sarah Putri',
    role: 'Mahasiswa',
    avatar: '👩‍🎓',
    quote:
      'SisaRasa membantu saya menghemat pengeluaran makan hingga 50% per bulan! Makanannya tetap enak dan berkualitas. Bonus-nya, saya ikut mengurangi food waste.',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: 'Pemilik Restoran Nusantara',
    avatar: '👨‍🍳',
    quote:
      'Sejak bergabung dengan SisaRasa, kami berhasil mengurangi makanan terbuang hingga 60%. Sekarang makanan surplus kami bisa dinikmati orang lain dengan harga terjangkau.',
    rating: 5,
  },
  {
    name: 'Anita Rahayu',
    role: 'Ibu Rumah Tangga',
    avatar: '👩',
    quote:
      'Saya sering dapat roti dan kue dari bakery favorit dengan setengah harga. Anak-anak senang, dompet juga aman. Terima kasih SisaRasa!',
    rating: 5,
  },
  {
    name: 'Rizky Maulana',
    role: 'Pemilik Kafe Kopi',
    avatar: '☕',
    quote:
      'Platform yang luar biasa! Makanan yang sebelumnya harus dibuang sekarang bisa dijual. Revenue tetap masuk dan food waste berkurang drastis.',
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Testimoni
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
              Apa Kata <span className="gradient-text-primary">Mereka</span>?
            </h2>
          </div>
        </ScrollReveal>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 100}>
              <div className="p-6 rounded-2xl glass card-hover h-full flex flex-col">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-muted leading-relaxed flex-1 mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                  <span className="text-2xl">{item.avatar}</span>
                  <div>
                    <h4 className="text-sm font-semibold">{item.name}</h4>
                    <p className="text-xs text-muted">{item.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-accent fill-accent"
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <ScrollReveal>
            <div className="p-6 rounded-2xl glass">
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-sm text-muted leading-relaxed mb-6">
                &ldquo;{testimonials[activeIndex].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-black/5">
                <span className="text-2xl">{testimonials[activeIndex].avatar}</span>
                <div>
                  <h4 className="text-sm font-semibold">
                    {testimonials[activeIndex].name}
                  </h4>
                  <p className="text-xs text-muted">
                    {testimonials[activeIndex].role}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: testimonials[activeIndex].rating }).map(
                  (_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
                  )
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="p-2 rounded-full glass hover:bg-surface-hover transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeIndex
                        ? 'w-6 bg-primary'
                        : 'bg-white/20'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 rounded-full glass hover:bg-surface-hover transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
