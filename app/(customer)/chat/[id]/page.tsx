'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { MessageData, ChatData, StoreData } from '@/app/lib/types';

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
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
    
    // Security check
    if (user.uid !== customerId) {
      router.push('/chat');
      return;
    }

    // Load Chat Info
    getDoc(doc(db, 'chats', id)).then(snap => {
      if (snap.exists()) {
        setChatInfo(snap.data() as ChatData);
      }
    });

    // Load Store Info (in case we need to start a new chat)
    getDoc(doc(db, 'stores', storeId)).then(snap => {
      if (snap.exists()) {
        setStoreInfo({ id: snap.id, ...snap.data() } as StoreData);
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
  }, [id, user, customerId, storeId, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();
    setNewMessage('');

    const now = Timestamp.now();

    // Prepare info
    const custName = user.displayName || 'Pelanggan';
    const stName = storeInfo?.name || chatInfo?.storeName || 'Toko';
    const stPhoto = storeInfo?.photoURL || chatInfo?.storePhotoURL || '';

    // Update or create chat doc
    await setDoc(doc(db, 'chats', id), {
      id,
      customerId,
      customerName: custName,
      storeId,
      storeName: stName,
      storePhotoURL: stPhoto,
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
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] max-w-2xl mx-auto w-full bg-background relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 glass-strong border-b border-black/5 shrink-0 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden shrink-0">
            {chatInfo?.storePhotoURL || storeInfo?.photoURL ? (
              <img src={chatInfo?.storePhotoURL || storeInfo?.photoURL} alt="Store" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-primary">
                {(chatInfo?.storeName || storeInfo?.name || 'T').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-bold">{chatInfo?.storeName || storeInfo?.name || 'Memuat...'}</h2>
            <p className="text-[10px] text-muted">Penjual</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted mt-10">
            Belum ada pesan. Mulai sapa penjual!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-primary text-white rounded-br-none' 
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
      <div className="p-4 glass-strong border-t border-black/5 shrink-0 sticky bottom-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-3 rounded-full bg-surface border border-black/5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-5 h-5 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
