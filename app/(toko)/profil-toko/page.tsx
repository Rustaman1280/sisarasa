'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner, updateStore } from '@/app/lib/firestore';
import { StoreData } from '@/app/lib/types';
import { Loader2 } from 'lucide-react';

interface Province { code: string; name: string; }
interface Regency { code: string; name: string; }

export default function ProfilTokoPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [city, setCity] = useState('');
  
  // Wilayah State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');

  useEffect(() => {
    if (user) {
      getStoreByOwner(user.uid).then(data => {
        if (data) {
          setStore(data);
          setName(data.name);
          setDesc(data.description);
          setAddress(data.address);
          if (data.mapsLink) setMapsLink(data.mapsLink);
          if (data.city) setCity(data.city);
        }
        setLoading(false);
      });
    }
    
    // Fetch Provinces
    fetch('/api/wilayah/provinces.json')
      .then(res => res.json())
      .then(data => setProvinces(data.data || []))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`/api/wilayah/regencies/${selectedProvince}.json`)
        .then(res => res.json())
        .then(data => {
          setRegencies(data.data || []);
          if (data.data && data.data.length > 0) {
            setCity(data.data[0].name);
          }
        })
        .catch(console.error);
    } else {
      setRegencies([]);
    }
  }, [selectedProvince]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await updateStore(store.id, { name, description: desc, address, mapsLink, city });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Provinsi</label>
              <select value={selectedProvince} onChange={e=>setSelectedProvince(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50">
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Kota/Kabupaten</label>
              <select required value={city} onChange={e=>setCity(e.target.value)} disabled={!selectedProvince} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50">
                {regencies.length === 0 ? <option value={city}>{city || '-- Pilih Kota --'}</option> : null}
                {regencies.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Alamat Lengkap</label>
            <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Link Google Maps</label>
            <input type="url" value={mapsLink} onChange={e=>setMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50" />
            <p className="text-xs text-muted mt-1">Tambahkan tautan (link) Google Maps dari lokasi toko Anda.</p>
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
