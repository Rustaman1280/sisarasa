'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Clock, Star, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getMeals, getStore, getUser, updateUser } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';

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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 17) return 'Selamat Siang';
  if (hour < 20) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function BerandaPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Semua Kota');
  const [favorites, setFavorites] = useState<string[]>([]);

  const timeWindows = [
    { key: 'rekomendasi', label: 'Rekomendasi' },
    { key: 'pagi', label: 'Pagi (06-11)' },
    { key: 'siang', label: 'Siang (12-17)' },
    { key: 'malam', label: 'Malam (18-24)' },
  ] as const;

  

  function parseHour(t: string) {
    const [h] = t.split(':');
    const n = parseInt(h, 10);
    return Number.isNaN(n) ? 0 : n;
  }

  function groupByStore(list: MealData[]) {
    const map = new Map<string, { storeId: string; storeName: string; photoURL?: string; meals: MealData[] }>();
    list.forEach((m) => {
      const cur = map.get(m.storeId);
      if (cur) {
        cur.meals.push(m);
        if (!cur.photoURL && m.photoURL) cur.photoURL = m.photoURL;
      } else {
        map.set(m.storeId, { storeId: m.storeId, storeName: m.storeName, photoURL: m.photoURL, meals: [m] });
      }
    });
    return Array.from(map.values());
  }

  function pickRecommended(stores: ReturnType<typeof groupByStore>) {
    if (stores.length === 0) return null;
    const sorted = [...stores].sort((a, b) => b.meals.length - a.meals.length);
    return sorted[0];
  }

  function storesForWindow(stores: ReturnType<typeof groupByStore>, key: 'rekomendasi' | 'pagi' | 'siang' | 'malam') {
    if (key === 'rekomendasi') return stores;
    return stores.filter((s) => s.meals.some((m) => {
      const h = parseHour(m.pickupTimeStart);
      if (key === 'pagi') return h >= 6 && h <= 11;
      if (key === 'siang') return h >= 12 && h <= 17;
      return h >= 18 && h <= 24;
    }));
  }

  // Ratings are handled on the meal detail page. Beranda shows read-only averages.

  useEffect(() => {
    async function fetchMeals() {
      try {
        const data = await getMeals({ activeOnly: true });
        let list = data;
        // If meal has no photoURL or storeCity, try to load from store
        const filled = await Promise.all(list.map(async (m) => {
          let updated = { ...m };
          if (!updated.photoURL || !updated.storeCity) {
            try {
              const s = await getStore(m.storeId);
              if (s) {
                if (!updated.photoURL && s.photoURL) updated.photoURL = s.photoURL;
                if (!updated.storeCity && s.city) updated.storeCity = s.city;
              }
            } catch {}
          }
          return updated;
        }));
        setMeals(filled);
      } catch {
        setMeals([]);
      }
    }
    fetchMeals();

      async function loadUserFavorites() {
        if (!user?.uid) return;
        try {
          const u = await getUser(user.uid);
          if (u && Array.isArray((u as any).favorites)) {
            setFavorites((u as any).favorites as string[]);
          }
        } catch {}
      }
      loadUserFavorites();
  }, []);

  const availableCities = ['Semua Kota', ...Array.from(new Set(meals.map(m => m.storeCity).filter(Boolean)))];

  const filteredMeals = meals.filter((meal) => {
    const matchSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = selectedCity === 'Semua Kota' || meal.storeCity === selectedCity;
    return matchSearch && matchCity;
  });

  const promos = [...filteredMeals].sort((a, b) => getDiscount(a.originalPrice, a.discountedPrice) - getDiscount(b.originalPrice, b.discountedPrice)).slice(0, 8);

  const stores = groupByStore(filteredMeals);
  const recommended = pickRecommended(stores);
  const others = stores.filter((s) => !recommended || s.storeId !== recommended.storeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, <span className="gradient-text-primary">{user?.displayName?.split(' ')[0] || 'Foodie'}</span>! 👋
        </h1>
        <p className="text-sm text-muted mt-1">
          Temukan makanan berkualitas dengan harga terjangkau hari ini
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari makanan atau restoran..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors cursor-pointer appearance-none"
          >
            {availableCities.map(city => (
              <option key={city as string} value={city as string}>{city as string}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Promo Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Promo Terbaik
          </h2>
          <Link href="/jelajahi" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {promos.map((meal) => (
            <Link key={meal.id} href={`/makanan/${meal.id}`} className="min-w-[260px] rounded-2xl glass overflow-hidden flex-shrink-0">
              <div className="h-40 relative bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                {meal.photoURL ? (
                  <img src={meal.photoURL} alt={meal.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">
                    {emojiMap[meal.category] || '🍽️'}
                  </span>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    aria-label="favorite"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!user?.uid) return alert('Silakan masuk untuk menandai favorit.');
                      const isFav = favorites.includes(meal.id);
                      const next = isFav ? favorites.filter((id) => id !== meal.id) : [...favorites, meal.id];
                      try {
                        await updateUser(user.uid, { favorites: next } as any);
                        setFavorites(next);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill={favorites.includes(meal.id) ? 'red' : 'none'} stroke={favorites.includes(meal.id) ? 'red' : 'currentColor'} strokeWidth="1.5" className="opacity-90">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>

                <div className="absolute top-3 left-3 gradient-primary px-2.5 py-1 rounded-full text-xs font-bold text-white">
                  {meal.discountedPrice === 0 ? 'GRATIS' : `-${getDiscount(meal.originalPrice, meal.discountedPrice)}%`}
                </div>

                {meal.quantityLeft <= 3 && (
                  <div className="absolute top-3 right-12 bg-danger px-2.5 py-1 rounded-full text-xs font-bold text-white">
                    Sisa {meal.quantityLeft}!
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs text-muted mb-1">{meal.storeName}</p>
                <h3 className="text-sm font-bold mb-2">
                  {meal.title}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-bold text-primary">
                    {formatPrice(meal.discountedPrice)}
                  </span>
                  {meal.discountedPrice > 0 && (
                    <span className="text-xs text-muted line-through">
                      {formatPrice(meal.originalPrice)}
                    </span>
                  )}
                </div>

                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.pickupTimeStart}-{meal.pickupTimeEnd}
                    </span>
                  </div>

                  {((meal as any).ratingCount || 0) > 0 ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => i < Math.round((meal as any).rating || 0) ? '★' : '☆').join('')}
                      </div>
                      <span className="text-xs text-muted ml-2">{(meal as any).rating} ({(meal as any).ratingCount || 0})</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted mt-2">Belum dinilai</div>
                  )}
              </div>
            </Link>
          ))}
        </div>

        {promos.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="text-muted">Tidak ada promo ditemukan.</p>
          </div>
        )}
      </div>

      {/* Recommended & time-window sections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Rekomendasi & Sesuai Waktu
          </h2>
        </div>

        {recommended && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Direkomendasikan untuk Anda</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              <Link href={`/makanan/${recommended.meals[0].id}`} className="min-w-[260px] rounded-2xl glass overflow-hidden flex-shrink-0">
                <div className="h-40 relative bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                  {recommended.photoURL ? (
                    <img src={recommended.photoURL} alt={recommended.storeName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-muted">{recommended.storeName}</div>
                  <div className="font-bold">{recommended.meals[0].title}</div>
                  <div className="text-sm text-primary mt-2">{formatPrice(recommended.meals[0].discountedPrice)}</div>
                  {(((recommended.meals[0] as any).ratingCount || 0) > 0) ? (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => i < Math.round(((recommended.meals[0] as any).rating || 0)) ? '★' : '☆').join('')}
                      </div>
                      <span className="text-xs text-muted ml-2">{(recommended.meals[0] as any).rating} ({(recommended.meals[0] as any).ratingCount || 0})</span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted mt-2">Belum dinilai</div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Render each time window as its own stacked section */}
              {timeWindows.filter(w => w.key !== 'rekomendasi').map((w) => (
          <div key={w.key} className="mb-6">
            <h4 className="text-sm font-semibold mb-3">{w.label}</h4>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {storesForWindow(others, w.key as 'pagi' | 'siang' | 'malam').map((s) => (
                <Link key={s.storeId} href={`/makanan/${s.meals[0].id}`} className="min-w-[220px] rounded-2xl glass overflow-hidden flex-shrink-0">
                  <div className="h-36 relative bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                    {s.photoURL ? <img src={s.photoURL} alt={s.storeName} className="w-full h-full object-cover" /> : <div className="text-3xl">🍽️</div>}
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted">{s.storeName}</div>
                    <div className="font-bold text-sm">{s.meals[0].title}</div>
                    <div className="text-sm text-primary mt-1">{formatPrice(s.meals[0].discountedPrice)}</div>
                    {(((s.meals[0] as any).ratingCount || 0) > 0) ? (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="text-yellow-400 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => i < Math.round(((s.meals[0] as any).rating || 0)) ? '★' : '☆').join('')}
                        </div>
                        <span className="text-xs text-muted ml-2">{(s.meals[0] as any).rating} ({(s.meals[0] as any).ratingCount || 0})</span>
                      </div>
                    ) : (
                      <div className="text-xs text-muted mt-2">Belum dinilai</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
