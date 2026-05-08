'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Star, Minus, Plus, Loader2, CheckCircle, X, Store, MessageCircle, Navigation } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getMeal, getStore, createOrder } from '@/app/lib/firestore';
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
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [storeMapsLink, setStoreMapsLink] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchMeal() {
      try {
        const data = await getMeal(id);
        let currentMeal = data || getMockMeal(id);
        
        // Fetch store data for photo URL and address
        try {
          const s = await getStore(currentMeal.storeId);
          if (s) {
            if (!currentMeal.photoURL && s.photoURL) {
              currentMeal.photoURL = s.photoURL;
            }
            setStoreAddress(s.address || '');
            if (s.mapsLink) setStoreMapsLink(s.mapsLink);
          }
        } catch {}
        
        setMeal(currentMeal);
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
        notes: notes.trim(),
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
        <h2 className="text-2xl font-bold mb-2">Booking Berhasil!</h2>
        <p className="text-muted mb-2">{meal.title} x{quantity}</p>
        <p className="text-sm text-muted mb-8">
          Pesananmu telah di-booking. Silakan datang ke <strong>{meal.storeName}</strong> pada pukul {meal.pickupTimeStart} - {meal.pickupTimeEnd} dan lakukan pembayaran di tempat.
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
        {meal.photoURL ? (
          <img src={meal.photoURL} alt={meal.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-8xl">{emojiMap[meal.category] || '🍽️'}</span>
        )}
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
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-muted">{meal.storeName}</p>
          {user && (
            <button 
              onClick={() => router.push(`/chat/${user.uid}_${meal.storeId}`)}
              className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat Penjual
            </button>
          )}
        </div>
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
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-muted">Lokasi:</span>
            <span className="font-medium">{storeAddress || 'Lokasi tidak tersedia'}</span>
          </div>
          {storeMapsLink && (
            <a 
              href={storeMapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md hover:bg-secondary/20 transition-colors shrink-0"
            >
              <Navigation className="w-3 h-3" /> Buka Maps
            </a>
          )}
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
          onClick={() => setShowCheckout(true)}
          disabled={ordering || meal.quantityLeft === 0}
          className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {meal.quantityLeft === 0 ? 'Habis' : 'Booking Sekarang'}
        </button>
      </div>
      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass bg-surface/95 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-scaleIn">
            <button onClick={() => setShowCheckout(false)} className="absolute top-5 right-5 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-4">Konfirmasi Booking</h3>
            
            <div className="bg-surface-light rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted">{meal.title} x{quantity}</span>
                <span className="text-sm font-bold text-primary">{formatPrice(meal.discountedPrice * quantity)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/5">
                <span className="text-sm font-medium">Total Tagihan</span>
                <span className="text-lg font-extrabold text-primary">{formatPrice(meal.discountedPrice * quantity)}</span>
              </div>
            </div>

            <h4 className="text-sm font-medium mb-2">Catatan Pesanan <span className="text-muted font-normal">(Opsional)</span></h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tolong jangan pakai sambal, ambil sekitar jam 7 malam ya..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none mb-6"
            />

            <h4 className="text-sm font-medium mb-3">Metode Pembayaran</h4>
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-primary bg-primary/5 text-primary">
                <Store className="w-6 h-6" />
                <div className="flex flex-col">
                  <span className="font-bold">Bayar di Tempat</span>
                  <span className="text-xs opacity-80">Bayar saat mengambil pesanan di toko</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={ordering}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {ordering ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : 'Konfirmasi Booking'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
