'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Clock, MapPin, Star, ArrowRight, Flame, Tag } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getMeals } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';

const categories = [
  { label: 'Semua', emoji: '🍽️', value: 'all' },
  { label: 'Restoran', emoji: '🍛', value: 'restoran' },
  { label: 'Kafe', emoji: '☕', value: 'kafe' },
  { label: 'Bakery', emoji: '🥐', value: 'bakery' },
  { label: 'Catering', emoji: '🍱', value: 'catering' },
];

// Fallback mock meals when Firestore is empty
const mockMeals: MealData[] = [
  { id: 'm1', storeId: 's1', storeName: 'Sakura Sushi Bar', title: 'Mystery Box Sushi', description: 'Paket sushi pilihan chef', originalPrice: 85000, discountedPrice: 35000, quantity: 10, quantityLeft: 3, category: 'restoran', pickupTimeStart: '19:00', pickupTimeEnd: '21:00', isActive: true, photoURL: '', createdAt: {} as any },
  { id: 'm2', storeId: 's2', storeName: 'Boulangerie Paris', title: 'Paket Roti & Pastry', description: 'Assorted roti dan pastry hari ini', originalPrice: 60000, discountedPrice: 20000, quantity: 15, quantityLeft: 5, category: 'bakery', pickupTimeStart: '17:00', pickupTimeEnd: '19:00', isActive: true, photoURL: '', createdAt: {} as any },
  { id: 'm3', storeId: 's3', storeName: 'Dapur Bu Haji', title: 'Nasi Box Spesial', description: 'Nasi box lengkap dengan lauk pauk', originalPrice: 35000, discountedPrice: 15000, quantity: 20, quantityLeft: 8, category: 'restoran', pickupTimeStart: '13:00', pickupTimeEnd: '15:00', isActive: true, photoURL: '', createdAt: {} as any },
  { id: 'm4', storeId: 's4', storeName: 'Green Vibes Café', title: 'Smoothie Bowl Mix', description: 'Smoothie bowl dengan topping buah segar', originalPrice: 45000, discountedPrice: 0, quantity: 5, quantityLeft: 2, category: 'kafe', pickupTimeStart: '15:00', pickupTimeEnd: '17:00', isActive: true, photoURL: '', createdAt: {} as any },
  { id: 'm5', storeId: 's5', storeName: 'Pizzeria Roma', title: 'Pizza Margherita', description: 'Pizza klasik dengan mozarella dan basil', originalPrice: 75000, discountedPrice: 25000, quantity: 8, quantityLeft: 4, category: 'restoran', pickupTimeStart: '20:00', pickupTimeEnd: '22:00', isActive: true, photoURL: '', createdAt: {} as any },
  { id: 'm6', storeId: 's6', storeName: 'Sweet Corner', title: 'Kue Ulang Tahun', description: 'Kue dekorasi cantik untuk dinikmati', originalPrice: 120000, discountedPrice: 40000, quantity: 3, quantityLeft: 1, category: 'bakery', pickupTimeStart: '16:00', pickupTimeEnd: '18:00', isActive: true, photoURL: '', createdAt: {} as any },
];

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
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchMeals() {
      try {
        const data = await getMeals({ activeOnly: true });
        setMeals(data.length > 0 ? data : mockMeals);
      } catch {
        setMeals(mockMeals);
      }
    }
    fetchMeals();
  }, []);

  const filteredMeals = meals.filter((meal) => {
    const matchCategory = activeCategory === 'all' || meal.category === activeCategory;
    const matchSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari makanan atau restoran..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.value
                ? 'gradient-primary text-white shadow-lg shadow-primary/25'
                : 'glass text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeals.map((meal) => (
            <Link
              key={meal.id}
              href={`/makanan/${meal.id}`}
              className="rounded-2xl glass card-hover overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                <span className="text-5xl group-hover:scale-125 transition-transform duration-500">
                  {emojiMap[meal.category] || '🍽️'}
                </span>

                {/* Discount badge */}
                <div className="absolute top-3 left-3 gradient-primary px-2.5 py-1 rounded-full text-xs font-bold text-white">
                  {meal.discountedPrice === 0 ? 'GRATIS' : `-${getDiscount(meal.originalPrice, meal.discountedPrice)}%`}
                </div>

                {meal.quantityLeft <= 3 && (
                  <div className="absolute top-3 right-3 bg-danger px-2.5 py-1 rounded-full text-xs font-bold text-white">
                    Sisa {meal.quantityLeft}!
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-muted mb-1">{meal.storeName}</p>
                <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors">
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
              </div>
            </Link>
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🍽️</span>
            <p className="text-muted">Tidak ada makanan ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
