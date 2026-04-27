'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getMeal, updateMeal } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';
import { use } from 'react';

export default function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pickupStart, setPickupStart] = useState('');
  const [pickupEnd, setPickupEnd] = useState('');

  useEffect(() => {
    async function fetchMeal() {
      try {
        const meal = await getMeal(id);
        if (meal) {
          setTitle(meal.title);
          setDesc(meal.description);
          setOriginalPrice(meal.originalPrice.toString());
          setDiscountedPrice(meal.discountedPrice.toString());
          setQuantity(meal.quantity.toString());
          setPickupStart(meal.pickupTimeStart);
          setPickupEnd(meal.pickupTimeEnd);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeal();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMeal(id, {
        title,
        description: desc,
        originalPrice: parseInt(originalPrice, 10),
        discountedPrice: parseInt(discountedPrice, 10),
        quantity: parseInt(quantity, 10),
        pickupTimeStart: pickupStart,
        pickupTimeEnd: pickupEnd,
      });
      router.push('/produk');
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate produk');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/produk" className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Produk</h1>
      <div className="glass rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Nama Makanan</label>
            <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Deskripsi</label>
            <textarea required value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Harga Asli (Rp)</label>
              <input type="number" required min="0" value={originalPrice} onChange={e=>setOriginalPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Harga Diskon (Rp)</label>
              <input type="number" required min="0" value={discountedPrice} onChange={e=>setDiscountedPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Total Porsi Awal</label>
              <input type="number" required min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Waktu Mulai</label>
              <input type="time" required value={pickupStart} onChange={e=>setPickupStart(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Waktu Selesai</label>
              <input type="time" required value={pickupEnd} onChange={e=>setPickupEnd(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-black/5">
            <Link href="/produk" className="px-6 py-3 rounded-xl glass text-sm font-medium hover:bg-surface transition-colors">Batal</Link>
            <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
