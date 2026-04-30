'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Clock, Star, SlidersHorizontal, X } from 'lucide-react';
import { getMeals, getStore } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';

const emojiMap: Record<string, string> = { restoran: '🍛', kafe: '☕', bakery: '🥐', catering: '🍱' };

function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

function getDiscount(original: number, discounted: number): number {
  if (discounted === 0) return 100;
  return Math.round(((original - discounted) / original) * 100);
}

// categoryOptions removed — simplified flow without categories
const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Harga Terendah', value: 'price-low' },
  { label: 'Diskon Terbesar', value: 'discount' },
];

export default function JelajahiPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua Kota');
  // category filter removed
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchMeals() {
      try {
        const data = await getMeals({ activeOnly: true });
        const filled = await Promise.all(data.map(async (m) => {
          let updated = { ...m };
          if (!updated.storeCity || !updated.photoURL) {
            try {
              const s = await getStore(m.storeId);
              if (s) {
                if (!updated.photoURL && s.photoURL) updated.photoURL = s.photoURL;
                if (!updated.storeCity && s.city) updated.storeCity = s.city;
              }
            } catch {}
          }
          if (!updated.storeCity) {
            const dummyCities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang'];
            updated.storeCity = dummyCities[updated.storeName.length % dummyCities.length];
          }
          return updated;
        }));
        setMeals(filled);
      } catch {
        setMeals([]);
      }
    }
    fetchMeals();
  }, []);

  const availableCities = ['Semua Kota', ...Array.from(new Set(meals.map(m => m.storeCity).filter(Boolean)))];

  let filtered = meals
    .filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((m) => selectedCity === 'Semua Kota' || m.storeCity === selectedCity);

  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.discountedPrice - b.discountedPrice);
  } else if (sortBy === 'discount') {
    filtered = [...filtered].sort(
      (a, b) => getDiscount(b.originalPrice, b.discountedPrice) - getDiscount(a.originalPrice, a.discountedPrice)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Jelajahi Makanan</h1>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari makanan atau restoran..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-xl transition-colors ${showFilters ? 'gradient-primary text-white' : 'glass text-muted hover:text-foreground'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass rounded-xl p-4 mb-6 animate-fadeIn space-y-4">
          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Filter Kota</label>
            <div className="flex flex-wrap gap-2">
              {availableCities.map((city) => (
                <button
                  key={city as string}
                  onClick={() => setSelectedCity(city as string)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCity === city ? 'gradient-primary text-white' : 'bg-surface text-muted hover:text-foreground'
                  }`}
                >
                  {city as string}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-2 block">Urutkan</label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === opt.value ? 'gradient-primary text-white' : 'bg-surface text-muted hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <p className="text-sm text-muted mb-4">{filtered.length} makanan ditemukan</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((meal) => (
          <Link key={meal.id} href={`/makanan/${meal.id}`} className="rounded-2xl glass card-hover overflow-hidden group">
            <div className="relative h-36 bg-gradient-to-br from-surface-light to-surface flex items-center justify-center">
              <span className="text-4xl group-hover:scale-125 transition-transform duration-500">
                {emojiMap[meal.category] || '🍽️'}
              </span>
              <div className="absolute top-2 left-2 gradient-primary px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                {meal.discountedPrice === 0 ? 'GRATIS' : `-${getDiscount(meal.originalPrice, meal.discountedPrice)}%`}
              </div>
              {meal.quantityLeft <= 3 && (
                <div className="absolute top-2 right-2 bg-danger px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                  Sisa {meal.quantityLeft}
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] text-muted">{meal.storeName}</p>
              <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{meal.title}</h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-primary">{formatPrice(meal.discountedPrice)}</span>
                {meal.discountedPrice > 0 && (
                  <span className="text-[10px] text-muted line-through">{formatPrice(meal.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted">
                <Clock className="w-3 h-3" />
                {meal.pickupTimeStart}-{meal.pickupTimeEnd}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">🔍</span>
          <p className="text-muted">Tidak ada makanan ditemukan</p>
        </div>
      )}
    </div>
  );
}
