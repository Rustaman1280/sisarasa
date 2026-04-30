'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin, Star, Tag } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';
import { getMeals } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';
import Link from 'next/link';

const emojiMap: Record<string, string> = {
  restoran: '🍛',
  kafe: '☕',
  bakery: '🥐',
  catering: '🍱',
};

function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

function getDiscount(original: number, discounted: number): number {
  if (discounted === 0) return 100;
  return Math.round(((original - discounted) / original) * 100);
}

export default function FeaturedMeals() {
  const [meals, setMeals] = useState<MealData[]>([]);

  useEffect(() => {
    async function fetchMeals() {
      try {
        const data = await getMeals({ activeOnly: true });
        // Sort by biggest discount and take top 6
        const sorted = [...data].sort((a, b) => getDiscount(b.originalPrice, b.discountedPrice) - getDiscount(a.originalPrice, a.discountedPrice)).slice(0, 6);
        setMeals(sorted);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    }
    fetchMeals();
  }, []);

  if (meals.length === 0) {
    return null;
  }

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Tersedia Sekarang
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Makanan <span className="gradient-text-primary">Terbaik</span> Hari Ini
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Temukan makanan berkualitas dari mitra terpercaya di sekitarmu.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal, index) => {
            const discount = getDiscount(meal.originalPrice, meal.discountedPrice);
            let badge = '';
            let badgeColor = '';

            if (meal.discountedPrice === 0) {
              badge = 'Gratis!';
              badgeColor = 'bg-secondary';
            } else if (meal.quantityLeft <= 3) {
              badge = 'Hampir Habis!';
              badgeColor = 'bg-danger';
            } else {
              badge = `Diskon ${discount}%`;
              badgeColor = 'bg-primary';
            }

            return (
              <ScrollReveal key={meal.id} delay={index * 100}>
                <Link href={`/makanan/${meal.id}`} className="block rounded-2xl glass card-hover overflow-hidden group cursor-pointer">
                  {/* Image placeholder with emoji or real image */}
                  <div className="relative h-48 bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                    {meal.photoURL ? (
                      <img src={meal.photoURL} alt={meal.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
                        {emojiMap[meal.category] || '🍽️'}
                      </span>
                    )}

                    {/* Badge */}
                    <div className={`absolute top-3 left-3 ${badgeColor} px-3 py-1 rounded-full text-xs font-bold text-white`}>
                      {badge}
                    </div>

                    {/* Quantity */}
                    <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full text-xs text-muted font-medium bg-white/90">
                      Sisa {meal.quantityLeft}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-muted uppercase">
                        {meal.category}
                      </span>
                      {((meal as any).ratingCount || 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-accent">
                          <Star className="w-3 h-3 fill-accent" />
                          {(meal as any).rating}
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
                      {meal.title}
                    </h3>
                    <p className="text-sm text-muted mb-3">{meal.storeName}</p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(meal.discountedPrice)}
                      </span>
                      {meal.discountedPrice > 0 && (
                        <span className="text-sm text-muted line-through">
                          {formatPrice(meal.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {meal.pickupTimeStart} - {meal.pickupTimeEnd}
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
