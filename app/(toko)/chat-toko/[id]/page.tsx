'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { MessageData, ChatData, StoreData } from '@/app/lib/types';
import { getStoreByOwner } from '@/app/lib/firestore';

export default function TokoChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatData | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreData | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Parse IDs from the chat ID (format: customerId_storeId)
  const [customerId, storeId] = id.split('_');

  useEffect(() => {
    if (!user) return;

    // Verify this store belongs to the user
    getStoreByOwner(user.uid).then(store => {
      if (!store || store.id !== storeId) {
        router.push('/chat-toko');
        return;
      }
      setStoreInfo(store);
    });

    // Load Chat Info
    getDoc(doc(db, 'chats', id)).then(snap => {
      if (snap.exists()) {
        setChatInfo(snap.data() as ChatData);
      }
    });

    // Listen to messages
    const q = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MessageData));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [id, user, storeId, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !storeInfo) return;

    const text = newMessage.trim();
    setNewMessage('');

    const now = Timestamp.now();

    const custName = chatInfo?.customerName || 'Pelanggan';

    // Update chat doc
    await setDoc(doc(db, 'chats', id), {
      id,
      customerId,
      customerName: custName,
      storeId,
      storeName: storeInfo.name,
      storePhotoURL: storeInfo.photoURL || '',
      lastMessage: text,
      updatedAt: now,
    }, { merge: true });

    // Add message
    await addDoc(collection(db, 'chats', id, 'messages'), {
      chatId: id,
      senderId: user.uid,
      text,
      createdAt: now,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-3xl mx-auto w-full bg-surface border border-black/5 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-black/5 shrink-0">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {(chatInfo?.customerName || 'P').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold">{chatInfo?.customerName || 'Memuat...'}</h2>
            <p className="text-[10px] text-muted">Pelanggan</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted mt-10">
            Belum ada pesan.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-secondary text-white rounded-br-none' 
                      : 'bg-surface border border-black/5 rounded-bl-none text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t border-black/5 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Balas pesan..."
            className="flex-1 px-4 py-3 rounded-full bg-background border border-black/5 text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/25 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full gradient-secondary text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
