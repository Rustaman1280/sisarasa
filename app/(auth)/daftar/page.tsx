'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Store, ShoppingBag, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { createUser, createStore, getUser } from '@/app/lib/firestore';
import { UserRole, StoreCategory } from '@/app/lib/types';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGoogleRedirect = searchParams.get('google') === 'true';

  const [step, setStep] = useState<'role' | 'form' | 'otp'>(isGoogleRedirect ? 'role' : 'role');
  const [role, setRole] = useState<UserRole | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Store fields
  const [storeName, setStoreName] = useState('');
  // categories removed from registration; default to 'lainnya'
  const [storeCategory, setStoreCategory] = useState<StoreCategory>('lainnya');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeDescription, setStoreDescription] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, signInWithGoogle, user } = useAuth();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 'form' && !isGoogleRedirect) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setStep('otp');
      alert(`[SIMULASI] Kode OTP telah dikirim ke ${email}.\nKode Anda: ${code}`);
      return;
    }

    if (step === 'otp' && !isGoogleRedirect) {
      if (otpCode !== generatedOtp && otpCode !== '123456') {
        setError('Kode OTP salah atau kedaluwarsa.');
        return;
      }
    }

    setLoading(true);

    try {
      let uid: string;

      if (isGoogleRedirect && user) {
        // Google user already logged in, just create Firestore doc
        uid = user.uid;
        await createUser(
          uid,
          user.email || '',
          user.displayName || displayName,
          role!,
          user.photoURL || ''
        );
      } else {
        // Email/password signup
        const newUser = await signUp(email, password, displayName);
        uid = newUser.uid;
        await createUser(uid, email, displayName, role!);
      }

      // If store role, create store doc
      if (role === 'store') {
        await createStore({
          ownerId: uid,
          name: storeName,
          description: storeDescription || `${storeName} - Mitra SisaRasa`,
          address: storeAddress,
          category: storeCategory,
        });
      }

      // Redirect based on role
      if (role === 'store') {
        router.push('/dashboard');
      } else {
        router.push('/beranda');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan. Silakan masuk atau gunakan email lain.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Gunakan minimal 6 karakter.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const existingUser = await getUser(googleUser.uid);
      if (existingUser) {
        // Already registered
        if (existingUser.role === 'store') {
          router.push('/dashboard');
        } else {
          router.push('/beranda');
        }
        return;
      }
      // New user — create doc
      await createUser(
        googleUser.uid,
        googleUser.email || '',
        googleUser.displayName || '',
        role!,
        googleUser.photoURL || ''
      );
      if (role === 'store') {
        await createStore({
          ownerId: googleUser.uid,
          name: storeName || googleUser.displayName || 'Toko Saya',
          description: storeDescription || 'Mitra SisaRasa',
          address: storeAddress || 'Belum diatur',
          category: storeCategory,
        });
        router.push('/dashboard');
      } else {
        router.push('/beranda');
      }
    } catch (err: any) {
      setError('Gagal mendaftar dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Role Selection
  if (step === 'role') {
    return (
      <>
        <h2 className="text-2xl font-bold text-center mb-2">Daftar Sekarang</h2>
        <p className="text-sm text-muted text-center mb-8">
          Pilih peran yang sesuai denganmu
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('customer')}
            className="w-full p-5 rounded-xl glass hover:bg-surface-hover transition-all group text-left flex items-start gap-4 border border-transparent hover:border-primary/30"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Saya Pembeli</h3>
              <p className="text-sm text-muted">
                Cari makanan surplus berkualitas dengan harga terjangkau
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('store')}
            className="w-full p-5 rounded-xl glass hover:bg-surface-hover transition-all group text-left flex items-start gap-4 border border-transparent hover:border-secondary/30"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Store className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Saya Pemilik Toko</h3>
              <p className="text-sm text-muted">
                Jual makanan surplus dari restoran, kafe, atau bakery saya
              </p>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Sudah punya akun?{' '}
          <Link href="/masuk" className="text-primary font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </>
    );
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <>
        <button
          onClick={() => setStep('form')}
          className="text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          ← Kembali
        </button>

        <h2 className="text-2xl font-bold mb-1">Verifikasi Email</h2>
        <p className="text-sm text-muted mb-6">
          Masukkan 6 digit kode OTP yang telah dikirim ke <strong>{email}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-center tracking-widest text-lg font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors"
              />
            </div>
            <p className="text-xs text-muted text-center mt-3">
              Untuk keperluan demo, gunakan OTP: <strong>{generatedOtp}</strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</> : 'Verifikasi & Daftar'}
          </button>
        </form>
      </>
    );
  }

  // Step 3: Registration Form
  return (
    <>
      <button
        onClick={() => setStep('role')}
        className="text-sm text-muted hover:text-foreground transition-colors mb-4"
      >
        ← Kembali
      </button>

      <h2 className="text-2xl font-bold mb-1">
        {role === 'customer' ? 'Daftar sebagai Pembeli' : 'Daftar sebagai Mitra'}
      </h2>
      <p className="text-sm text-muted mb-6">Lengkapi data di bawah ini</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        {!isGoogleRedirect && (
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama lengkap"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
              />
            </div>
          </div>
        )}

        {/* Email */}
        {!isGoogleRedirect && (
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
        )}

        {/* Password */}
        {!isGoogleRedirect && (
          <div>
            <label className="text-sm font-medium text-muted mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
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
        )}

        {/* Store-specific fields */}
        {role === 'store' && (
          <>
            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Nama Toko</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Nama restoran / kafe / bakery"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* Kategori dihapus untuk menyederhanakan alur pendaftaran */}

            <div>
              <label className="text-sm font-medium text-muted mb-1.5 block">Alamat</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted" />
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Alamat lengkap toko"
                  required
                  rows={2}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors placeholder:text-muted/50 resize-none"
                />
              </div>
            </div>
          </>
        )}

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
            'Daftar'
          )}
        </button>
      </form>

      {/* Google */}
      {!isGoogleRedirect && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-black/5" />
            <span className="text-xs text-muted">atau</span>
            <div className="flex-1 h-px bg-black/5" />
          </div>
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3 rounded-xl glass hover:bg-surface-hover transition-colors font-medium text-sm flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Daftar dengan Google
          </button>
        </>
      )}

      <p className="text-center text-sm text-muted mt-6">
        Sudah punya akun?{' '}
        <Link href="/masuk" className="text-primary font-semibold hover:underline">
          Masuk
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
