'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getUser } from '@/app/lib/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signInWithGoogle, logout } = useAuth();
  const router = useRouter();

  const redirectByRole = async (uid: string) => {
    const userData = await getUser(uid);
    if (userData?.role === 'store') {
      router.push('/dashboard');
    } else {
      router.push('/beranda');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signIn(email, password);

      if (!user.emailVerified) {
        await logout();
        setError('Email belum diverifikasi. Silakan cek kotak masuk/spam Anda.');
        setLoading(false);
        return;
      }

      await redirectByRole(user.uid);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Akun tidak ditemukan.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const userData = await getUser(user.uid);
      if (!userData) {
        // New Google user, redirect to register to pick role
        router.push('/daftar?google=true');
      } else {
        await redirectByRole(user.uid);
      }
    } catch (err: any) {
      setError('Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-2">Selamat Datang Kembali</h2>
      <p className="text-sm text-muted text-center mb-8">
        Masuk ke akun SisaRasa-mu
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-sm font-medium text-muted mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-muted mb-1.5 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-black/5" />
        <span className="text-xs text-muted">atau</span>
        <div className="flex-1 h-px bg-black/5" />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full py-3 rounded-xl glass hover:bg-surface-hover transition-colors font-medium text-sm flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Masuk dengan Google
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-muted mt-6">
        Belum punya akun?{' '}
        <Link href="/daftar" className="text-primary font-semibold hover:underline">
          Daftar Gratis
        </Link>
      </p>
    </>
  );
}
