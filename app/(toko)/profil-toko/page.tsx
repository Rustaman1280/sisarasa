'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner, updateStore } from '@/app/lib/firestore';
import { StoreData } from '@/app/lib/types';
import { Loader2 } from 'lucide-react';

export default function ProfilTokoPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      getStoreByOwner(user.uid).then(data => {
        if (data) {
          setStore(data);
          setName(data.name);
          setDesc(data.description);
          setAddress(data.address);
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await updateStore(store.id, { name, description: desc, address });
      alert('Profil toko berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profil Toko</h1>
      <div className="glass rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Nama Toko</label>
            <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Deskripsi Singkat</label>
            <textarea required value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Alamat Lengkap</label>
            <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          
          <div className="pt-4 border-t border-black/5 flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
