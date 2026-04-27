'use client';

import { useEffect, useState } from 'react';
import { Package, ClipboardList, HandCoins, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner, getMealsByStore, getOrdersByStore } from '@/app/lib/firestore';
import { StoreData, MealData, OrderData } from '@/app/lib/types';
import AnimatedCounter from '@/app/components/ui/AnimatedCounter';

function formatPrice(p: number) { return `Rp ${p.toLocaleString('id-ID')}`; }
function formatDate(ts: any) { if (!ts?.toDate) return 'Baru saja'; return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); }

export default function DashboardPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const storeData = await getStoreByOwner(user.uid);
        if (storeData) {
          setStore(storeData);
          const [m, o] = await Promise.all([
            getMealsByStore(storeData.id),
            getOrdersByStore(storeData.id)
          ]);
          setMeals(m);
          setOrders(o);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-surface rounded"></div></div></div>;

  const activeMealsCount = meals.filter(m => m.isActive && m.quantityLeft > 0).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalPrice, 0);
  const totalSaved = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.quantity, 0);

  const stats = [
    { label: 'Makanan Aktif', value: activeMealsCount, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pesanan Baru', value: pendingOrdersCount, icon: ClipboardList, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Porsi Diselamatkan', value: totalSaved, icon: HandCoins, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pendapatan', value: totalRevenue, format: true, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted">Selamat datang di panel kelola {store?.name}</p>
        </div>
        <Link href="/produk/baru" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity w-fit">
          <Plus className="w-4 h-4" /> Tambah Makanan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-xl p-5 card-hover">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">
              {stat.format ? (
                `Rp ${stat.value.toLocaleString('id-ID')}`
              ) : (
                <AnimatedCounter end={stat.value} />
              )}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Pesanan Terbaru</h2>
          <Link href="/pesanan-masuk" className="text-sm text-primary flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-black/5 rounded-xl">
            <p className="text-muted text-sm">Belum ada pesanan masuk.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted uppercase bg-surface-light/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Pembeli</th>
                  <th className="px-4 py-3">Makanan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 rounded-r-lg">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{o.customerName}</td>
                    <td className="px-4 py-3">{o.quantity}x {o.mealTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        o.status === 'pending' ? 'bg-warning/20 text-warning' :
                        o.status === 'completed' ? 'bg-success/20 text-success' :
                        'bg-surface-light text-muted'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">{formatPrice(o.totalPrice)}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
