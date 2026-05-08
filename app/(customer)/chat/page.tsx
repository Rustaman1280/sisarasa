'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getChatsByCustomer } from '@/app/lib/firestore';
import { ChatData } from '@/app/lib/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export default function ChatListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Use onSnapshot for real-time updates of the chat list
    const q = query(
      collection(db, 'chats'),
      where('customerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatData));
      // Sort by updatedAt desc
      data.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Pesan</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-2">Belum ada obrolan</h2>
          <p className="text-sm text-muted">Mulai tanyakan sesuatu ke penjual saat melihat makanan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-surface-hover transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden shrink-0">
                {chat.storePhotoURL ? (
                  <img src={chat.storePhotoURL} alt={chat.storeName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary">{chat.storeName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold truncate pr-4">{chat.storeName}</h3>
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
