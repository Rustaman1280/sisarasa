'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, Clock, Package, XCircle } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner, getOrdersByStore, updateOrderStatus } from '@/app/lib/firestore';
import { OrderData, OrderStatus } from '@/app/lib/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Menunggu', color: 'text-warning', bg: 'bg-warning/10' },
  confirmed: { label: 'Diproses', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ready: { label: 'Siap Diambil', color: 'text-secondary', bg: 'bg-secondary/10' },
  completed: { label: 'Selesai', color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: 'Dibatalkan', color: 'text-danger', bg: 'bg-danger/10' },
};

export default function PesananMasukPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const store = await getStoreByOwner(user.uid);
        if (store) {
          const data = await getOrdersByStore(store.id);
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
      alert('Gagal update status pesanan');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pesanan Masuk</h1>
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-muted">Belum ada pesanan masuk.</div>
        ) : orders.map(order => {
          const config = statusConfig[order.status];
          return (
            <div key={order.id} className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{order.customerName}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted">{order.quantity}x {order.mealTitle}</p>
                <p className="text-xs text-muted mt-2">Total: Rp {order.totalPrice.toLocaleString('id-ID')}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-black/5 md:border-0 pt-3 md:pt-0">
                {updating === order.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted" />
                ) : (
                  <>
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-colors">
                          Konfirmasi
                        </button>
                        <button onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="px-4 py-2 rounded-lg bg-danger/20 text-danger text-xs font-bold hover:bg-danger/30 transition-colors">
                          Tolak
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'ready')} className="px-4 py-2 rounded-lg bg-secondary/20 text-secondary text-xs font-bold hover:bg-secondary/30 transition-colors">
                        Tandai Siap
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => handleStatusUpdate(order.id, 'completed')} className="px-4 py-2 rounded-lg bg-success/20 text-success text-xs font-bold hover:bg-success/30 transition-colors">
                        Selesaikan Pesanan
                      </button>
                    )}
                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <span className="text-xs text-muted">Selesai</span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
