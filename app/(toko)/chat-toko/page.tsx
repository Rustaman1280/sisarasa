'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoreByOwner } from '@/app/lib/firestore';
import { ChatData, StoreData } from '@/app/lib/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function ChatTokoListPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<StoreData | null>(null);

  useEffect(() => {
    if (!user) return;
    
    getStoreByOwner(user.uid).then(store => {
      setStoreInfo(store);
      if (!store) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'chats'),
        where('storeId', '==', store.id)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatData));
        data.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return timeB - timeA;
        });
        setChats(data);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pesan Masuk</h1>
        <p className="text-sm text-muted mt-1">Balas pesan dari pelanggan Anda dengan cepat</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-black/5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">Belum ada obrolan</h2>
          <p className="text-sm text-muted">Pesan dari pelanggan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat-toko/${chat.id}`}
              className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-surface-hover transition-colors border border-black/5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">
                  {chat.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold truncate pr-4">{chat.customerName}</h3>
                  {chat.updatedAt && (
                    <span className="text-xs text-muted shrink-0">
                      {chat.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted truncate">{chat.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
