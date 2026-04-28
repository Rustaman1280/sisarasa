'use client';

import { useAuth } from '@/app/lib/auth-context';
import { LogOut, Utensils, Leaf, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const stats = userData?.stats || { totalOrders: 0, totalSaved: 0, co2Reduced: 0 };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>

      {/* Avatar & Name */}
      <div className="glass rounded-2xl p-6 text-center mb-6">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white">
          {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
        <p className="text-sm text-muted">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Food Saver 🌱</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Utensils, value: stats.totalOrders, label: 'Pesanan' },
          { icon: Leaf, value: stats.totalSaved, label: 'Diselamatkan' },
          { icon: BarChart3, value: `${stats.co2Reduced.toFixed(1)}kg`, label: 'CO₂' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[10px] text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full py-3 rounded-xl glass hover:bg-danger/10 text-danger font-medium flex items-center justify-center gap-2 transition-colors md:hidden">
        <LogOut className="w-5 h-5" /> Keluar
      </button>
    </div>
  );
}
