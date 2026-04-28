"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { updateUser } from '@/app/lib/firestore';
import { uploadImage, generateImagePath } from '@/app/lib/storage';

export default function PengaturanPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setPreview(user?.photoURL || userData?.photoURL || null);
  }, [user, userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      let photoURL = user.photoURL || '';
      if (file) {
        const path = generateImagePath('profiles', file.name);
        photoURL = await uploadImage(file, path);
      }
      await updateProfile(auth.currentUser!, { displayName, photoURL });
      await updateUser(user.uid, { displayName, photoURL });
      router.push('/profil');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link href="/profil" className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Nama Tampilan</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Foto Profil (opsional)</label>
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
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-black/5">
            <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
