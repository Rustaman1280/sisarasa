'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Star, Minus, Plus, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getMeal, createOrder } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';
import { use } from 'react';

const emojiMap: Record<string, string> = { restoran: '🍛', kafe: '☕', bakery: '🥐', catering: '🍱' };

function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

// Mock meal for fallback
const getMockMeal = (id: string): MealData => ({
  id,
  storeId: 's1',
  storeName: 'Sakura Sushi Bar',
  title: 'Mystery Box Sushi',
  description: 'Paket surprise berisi 8-12 potong sushi pilihan chef. Termasuk salmon, tuna, dan ebi. Dibuat segar hari ini dengan bahan-bahan premium. Cocok untuk makan malam bersama keluarga.',
  originalPrice: 85000,
  discountedPrice: 35000,
  quantity: 10,
  quantityLeft: 3,
  category: 'restoran',
  pickupTimeStart: '19:00',
  pickupTimeEnd: '21:00',
  isActive: true,
  photoURL: '',
  createdAt: {} as any,
});

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [meal, setMeal] = useState<MealData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    async function fetchMeal() {
      try {
        const data = await getMeal(id);
        setMeal(data || getMockMeal(id));
      } catch {
        setMeal(getMockMeal(id));
      } finally {
        setLoading(false);
      }
    }
    fetchMeal();
  }, [id]);

  const handleOrder = async () => {
    if (!user || !meal) return;
    setOrdering(true);
    try {
      await createOrder({
        mealId: meal.id,
        mealTitle: meal.title,
        mealPhotoURL: meal.photoURL,
        storeId: meal.storeId,
        storeName: meal.storeName,
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        quantity,
        totalPrice: meal.discountedPrice * quantity,
        status: 'pending',
      });
      setOrdered(true);
    } catch (err) {
      console.error('Order failed:', err);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Makanan tidak ditemukan</p>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-scaleIn">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h2>
        <p className="text-muted mb-2">{meal.title} x{quantity}</p>
        <p className="text-sm text-muted mb-8">
          Ambil pesananmu di <strong>{meal.storeName}</strong> pukul {meal.pickupTimeStart} - {meal.pickupTimeEnd}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => router.push('/pesanan')} className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold">
            Lihat Pesanan
          </button>
          <button onClick={() => router.push('/beranda')} className="px-6 py-3 rounded-xl glass text-muted font-medium hover:text-foreground">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const discount = meal.discountedPrice === 0 ? 100 : Math.round(((meal.originalPrice - meal.discountedPrice) / meal.originalPrice) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Image */}
      <div className="relative h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden mb-6">
        <span className="text-8xl">{emojiMap[meal.category] || '🍽️'}</span>
        <div className="absolute top-4 left-4 gradient-primary px-3 py-1 rounded-full text-sm font-bold text-white">
          {discount === 100 ? 'GRATIS' : `-${discount}%`}
        </div>
        {meal.quantityLeft <= 3 && (
          <div className="absolute top-4 right-4 bg-danger px-3 py-1 rounded-full text-sm font-bold text-white">
            Sisa {meal.quantityLeft}!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mb-6">
        <p className="text-sm text-muted mb-1">{meal.storeName}</p>
        <h1 className="text-2xl font-bold mb-2">{meal.title}</h1>
        <p className="text-sm text-muted leading-relaxed">{meal.description}</p>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-extrabold text-primary">{formatPrice(meal.discountedPrice)}</span>
        {meal.discountedPrice > 0 && (
          <span className="text-lg text-muted line-through">{formatPrice(meal.originalPrice)}</span>
        )}
      </div>

      {/* Details */}
      <div className="glass rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-muted">Waktu Pengambilan:</span>
          <span className="font-medium">{meal.pickupTimeStart} - {meal.pickupTimeEnd}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-secondary" />
          <span className="text-muted">Lokasi:</span>
          <span className="font-medium">{meal.storeName}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Star className="w-4 h-4 text-accent fill-accent" />
          <span className="text-muted">Tersisa:</span>
          <span className="font-medium">{meal.quantityLeft} porsi</span>
        </div>
      </div>

      {/* Quantity & Order */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Jumlah</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(meal.quantityLeft, quantity + 1))}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 pt-3 border-t border-black/5">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-bold text-primary">
            {formatPrice(meal.discountedPrice * quantity)}
          </span>
        </div>

        <button
          onClick={handleOrder}
          disabled={ordering || meal.quantityLeft === 0}
          className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {ordering ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
          ) : meal.quantityLeft === 0 ? (
            'Habis'
          ) : (
            'Pesan Sekarang'
          )}
        </button>
      </div>
    </div>
  );
}
