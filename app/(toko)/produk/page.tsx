'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner, getMealsByStore, deleteMeal, updateMeal } from '@/app/lib/firestore';
import { MealData } from '@/app/lib/types';

function formatPrice(p: number) { return `Rp ${p.toLocaleString('id-ID')}`; }

export default function ProdukPage() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchMeals() {
      if (!user) return;
      try {
        const store = await getStoreByOwner(user.uid);
        if (store) {
          const data = await getMealsByStore(store.id);
          setMeals(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeals();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    await deleteMeal(id);
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateMeal(id, { isActive: !current });
    setMeals(meals.map(m => m.id === id ? { ...m, isActive: !current } : m));
  };

  const filtered = meals.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-surface rounded w-1/4 mb-6"></div><div className="h-64 bg-surface rounded"></div></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Kelola Produk</h1>
        <Link href="/produk/baru" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari nama produk..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted uppercase bg-surface-light/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Produk</th>
                <th className="px-4 py-3">Harga Diskon</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted">Belum ada produk.</td>
                </tr>
              ) : filtered.map(meal => (
                <tr key={meal.id} className="border-b border-black/5 last:border-0 hover:bg-surface-light/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{meal.title}</div>
                    <div className="text-[10px] text-muted">{meal.pickupTimeStart} - {meal.pickupTimeEnd}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">{formatPrice(meal.discountedPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={meal.quantityLeft === 0 ? 'text-danger font-bold' : ''}>
                      {meal.quantityLeft} / {meal.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => handleToggleActive(meal.id, meal.isActive)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${meal.isActive ? 'bg-success/20 text-success' : 'bg-surface-light text-muted'}`}
                    >
                      {meal.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/produk/${meal.id}/edit`} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-blue-400">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(meal.id)} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-danger">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
