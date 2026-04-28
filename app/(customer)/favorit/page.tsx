'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { getUser, getMeal, getMeals } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';

function formatPrice(price: number): string {
  if (!price) return 'Rp 0';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export default function FavoritPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawFavs, setRawFavs] = useState<string[] | null>(null);

  useEffect(() => {
    async function load() {
      if (!user?.uid) {
        setMeals([]);
        setLoading(false);
        return;
      }
      try {
        const u = await getUser(user.uid);
        const favs: string[] = (u && (u as any).favorites) || [];
        setRawFavs(favs);
        if (favs.length === 0) {
          setMeals([]);
          setLoading(false);
          return;
        }
        const allMealsCache = await getMeals({ activeOnly: false });
        const loaded = await Promise.all(favs.map(async (id) => {
          try {
            const m = await getMeal(id);
            if (m) return m;
            // fallback: try to fetch from allMealsCache
            const found = allMealsCache.find((x: any) => x.id === id);
            if (found) return found as MealData;
            // last resort: placeholder
            return {
              id,
              storeId: 'unknown',
              storeName: 'Toko Tidak Diketahui',
              title: `Menu ${id}`,
              description: '',
              originalPrice: 0,
              discountedPrice: 0,
              quantity: 0,
              quantityLeft: 0,
              category: 'restoran',
              pickupTimeStart: '00:00',
              pickupTimeEnd: '00:00',
              isActive: false,
              photoURL: '',
              createdAt: {} as any,
            } as MealData;
          } catch {
            return {
              id,
              storeId: 'unknown',
              storeName: 'Toko Tidak Diketahui',
              title: `Menu ${id}`,
              description: '',
              originalPrice: 0,
              discountedPrice: 0,
              quantity: 0,
              quantityLeft: 0,
              category: 'restoran',
              pickupTimeStart: '00:00',
              pickupTimeEnd: '00:00',
              isActive: false,
              photoURL: '',
              createdAt: {} as any,
            } as MealData;
          }
        }));
        setMeals(loaded.filter(Boolean) as MealData[]);
      } catch (err) {
        console.error(err);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.uid]);

  if (loading) return <div className="p-6">Memuat favorit...</div>;

  if (!user) return (
    <div className="p-6">Silakan masuk untuk melihat favorit Anda.</div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl font-bold mb-4">Favorit Saya</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <Link key={meal.id} href={`/makanan/${meal.id}`} className="rounded-2xl glass overflow-hidden group">
            <div className="relative h-40 bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
              {meal.photoURL ? (
                <img src={meal.photoURL} alt={meal.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">{meal.category ? (meal.category === 'restoran' ? '🍛' : meal.category === 'kafe' ? '☕' : '🍽️') : '🍽️'}</span>
              )}

              {meal.discountedPrice === 0 ? (
                <div className="absolute top-3 left-3 gradient-primary px-2.5 py-1 rounded-full text-xs font-bold text-white">GRATIS</div>
              ) : (
                <div className="absolute top-3 left-3 gradient-primary px-2.5 py-1 rounded-full text-xs font-bold text-white">-{Math.round(((meal.originalPrice || 0) - (meal.discountedPrice || 0)) / (meal.originalPrice || 1) * 100)}%</div>
              )}
            </div>

            <div className="p-4">
              <p className="text-xs text-muted mb-1">{meal.storeName}</p>
              <h3 className="text-sm font-bold mb-2 group-hover:text-primary transition-colors">{meal.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-primary">{formatPrice(meal.discountedPrice || meal.originalPrice || 0)}</span>
                {(meal.discountedPrice || 0) > 0 && (meal.originalPrice || 0) > (meal.discountedPrice || 0) && (
                  <span className="text-xs text-muted line-through">{formatPrice(meal.originalPrice || 0)}</span>
                )}
              </div>
              {((meal as any).ratingCount || 0) > 0 ? (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <div className="text-yellow-400">{Array.from({ length: 5 }).map((_, i) => i < Math.round((meal as any).rating || 0) ? '★' : '☆').join('')}</div>
                  <span className="ml-2">{(meal as any).rating} ({(meal as any).ratingCount || 0})</span>
                </div>
              ) : (
                <div className="text-xs text-muted mt-2">Belum dinilai</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
