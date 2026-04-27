'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getOrdersByCustomer } from '@/app/lib/firestore';
import { OrderData, OrderStatus } from '@/app/lib/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Menunggu', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  confirmed: { label: 'Dikonfirmasi', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Package },
  ready: { label: 'Siap Diambil', color: 'text-secondary', bg: 'bg-secondary/10', icon: Package },
  completed: { label: 'Selesai', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'text-danger', bg: 'bg-danger/10', icon: XCircle },
};

function formatPrice(p: number) { return p === 0 ? 'Gratis' : `Rp ${p.toLocaleString('id-ID')}`; }
function formatDate(ts: any) { if (!ts?.toDate) return 'Baru saja'; return ts.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

export default function PesananPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'done'>('active');

  useEffect(() => {
    if (!user) return;
    getOrdersByCustomer(user.uid).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const active = orders.filter(o => ['pending','confirmed','ready'].includes(o.status));
  const done = orders.filter(o => ['completed','cancelled'].includes(o.status));
  const list = tab === 'active' ? active : done;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>
      <div className="flex gap-1 p-1 rounded-xl glass mb-6">
        {(['active','done'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'gradient-primary text-white' : 'text-muted'}`}>
            {t === 'active' ? `Aktif (${active.length})` : `Riwayat (${done.length})`}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16"><span className="text-5xl block mb-3">📦</span><p className="text-muted">Belum ada pesanan</p></div>
      ) : (
        <div className="space-y-3">
          {list.map(order => {
            const c = statusConfig[order.status]; const I = c.icon;
            return (
              <div key={order.id} className="glass rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-bold text-sm">{order.mealTitle}</h3><p className="text-xs text-muted">{order.storeName}</p></div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg}`}><I className={`w-3.5 h-3.5 ${c.color}`} /><span className={`text-xs font-medium ${c.color}`}>{c.label}</span></div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{order.quantity}x • {formatPrice(order.totalPrice)}</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
