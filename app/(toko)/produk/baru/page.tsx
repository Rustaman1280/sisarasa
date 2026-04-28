'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { createMeal, getStoreByOwner } from '@/app/lib/firestore';
import { uploadImage, generateImagePath } from '@/app/lib/storage';
import { StoreData } from '@/app/lib/types';

export default function ProdukBaruPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pickupStart, setPickupStart] = useState('17:00');
  const [pickupEnd, setPickupEnd] = useState('19:00');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getStoreByOwner(user.uid).then(setStore);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!store) {
      setError('Tidak menemukan data toko. Pastikan Anda sudah membuat profil toko.');
      return;
    }

    setLoading(true);
    try {
      const q = parseInt(quantity, 10);
      if (Number.isNaN(q) || q <= 0) throw new Error('Jumlah porsi tidak valid');
      const orig = parseInt(originalPrice, 10);
      const disc = parseInt(discountedPrice, 10);
      if (Number.isNaN(orig) || orig < 0) throw new Error('Harga asli tidak valid');
      if (Number.isNaN(disc) || disc < 0) throw new Error('Harga diskon tidak valid');

      let photoURL = '';
      if (file) {
        try {
          const path = generateImagePath('meals', file.name);
          photoURL = await uploadImage(file, path);
        } catch (uErr) {
          console.error('Upload gagal', uErr);
          throw new Error('Gagal mengunggah foto produk');
        }
      }

      await createMeal({
        storeId: store.id,
        storeName: store.name,
        title,
        description: desc,
        originalPrice: orig,
        discountedPrice: disc,
        quantity: q,
        quantityLeft: q,
        category: store.category, // inherit from store
        pickupTimeStart: pickupStart,
        pickupTimeEnd: pickupEnd,
        isActive: true,
        photoURL,
      });
      router.push('/produk');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal menyimpan produk');
      alert(err?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/produk" className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <h1 className="text-2xl font-bold mb-6">Tambah Produk Baru</h1>

      <div className="glass rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Nama Makanan</label>
            <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" placeholder="Misal: Paket Roti Sisa Hari Ini" />
          </div>

          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Deskripsi</label>
            <textarea required value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none" placeholder="Deskripsikan isi paket makanan..." />
          </div>

          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Foto Produk (opsional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-black/5 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pilih Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f) setPreview(URL.createObjectURL(f));
                }} />
              </label>
              {preview && (
                <div className="w-20 h-20 rounded overflow-hidden bg-surface">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted mt-1">Opsional: tambahkan foto produk untuk ditampilkan ke pelanggan.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Harga Asli (Rp)</label>
              <input type="number" required min="0" value={originalPrice} onChange={e=>setOriginalPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" placeholder="50000" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Harga Diskon (Rp)</label>
              <input type="number" required min="0" value={discountedPrice} onChange={e=>setDiscountedPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" placeholder="20000" />
              <p className="text-[10px] text-muted mt-1">Isi 0 jika gratis</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Jumlah Porsi</label>
              <input type="number" required min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" placeholder="5" />
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
            <Link href="/produk" className="px-6 py-3 rounded-xl glass text-sm font-medium hover:bg-surface transition-colors">
              Batal
            </Link>
            <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan Produk
            </button>
          </div>
          {error && <p className="text-sm text-danger mt-2">{error}</p>}

        </form>
      </div>
    </div>
  );
}
