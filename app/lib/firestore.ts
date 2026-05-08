import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserData, StoreData, MealData, OrderData, UserRole, OrderStatus } from './types';

// ==================== USERS ====================

export async function createUser(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
  photoURL?: string
): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    role,
    photoURL: photoURL || '',
    createdAt: Timestamp.now(),
    stats: {
      totalOrders: 0,
      totalSaved: 0,
      co2Reduced: 0,
    },
  });
}

export async function getUser(uid: string): Promise<UserData | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserData;
  }
  return null;
}

export async function updateUser(uid: string, data: Partial<UserData>): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ==================== STORES ====================

export async function createStore(data: Omit<StoreData, 'id' | 'createdAt' | 'rating' | 'totalSaved' | 'isActive'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'stores'), {
    ...data,
    rating: 4.5,
    totalSaved: 0,
    isActive: true,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getStore(storeId: string): Promise<StoreData | null> {
  const storeDoc = await getDoc(doc(db, 'stores', storeId));
  if (storeDoc.exists()) {
    return { id: storeDoc.id, ...storeDoc.data() } as StoreData;
  }
  return null;
}

export async function getStoreByOwner(ownerId: string): Promise<StoreData | null> {
  const q = query(collection(db, 'stores'), where('ownerId', '==', ownerId), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as StoreData;
  }
  return null;
}

export async function updateStore(storeId: string, data: Partial<StoreData>): Promise<void> {
  await setDoc(doc(db, 'stores', storeId), data, { merge: true });
}

// ==================== MEALS ====================

export async function createMeal(data: Omit<MealData, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'meals'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getMeal(mealId: string): Promise<MealData | null> {
  const mealDoc = await getDoc(doc(db, 'meals', mealId));
  if (mealDoc.exists()) {
    return { id: mealDoc.id, ...mealDoc.data() } as MealData;
  }
  return null;
}

export async function getMeals(filters?: {
  storeId?: string;
  category?: string;
  activeOnly?: boolean;
  maxResults?: number;
}): Promise<MealData[]> {
  let q = query(collection(db, 'meals'), orderBy('createdAt', 'desc'));

  if (filters?.storeId) {
    q = query(collection(db, 'meals'), where('storeId', '==', filters.storeId), orderBy('createdAt', 'desc'));
  }

  if (filters?.activeOnly) {
    q = query(collection(db, 'meals'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
  }

  if (filters?.maxResults) {
    q = query(q, limit(filters.maxResults));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as MealData[];
}

export async function getMealsByStore(storeId: string): Promise<MealData[]> {
  const q = query(
    collection(db, 'meals'),
    where('storeId', '==', storeId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as MealData[];
}

export async function updateMeal(mealId: string, data: Partial<MealData>): Promise<void> {
  await setDoc(doc(db, 'meals', mealId), data, { merge: true });
}

export async function deleteMeal(mealId: string): Promise<void> {
  await deleteDoc(doc(db, 'meals', mealId));
}

// ==================== ORDERS ====================

export async function createOrder(data: Omit<OrderData, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: Timestamp.now(),
  });

  // Update meal quantity
  const mealRef = doc(db, 'meals', data.mealId);
  await setDoc(mealRef, {
    quantityLeft: increment(-data.quantity),
  }, { merge: true });

  // Update user stats
  const userRef = doc(db, 'users', data.customerId);
  await setDoc(userRef, {
    stats: {
      totalOrders: increment(1),
      totalSaved: increment(data.quantity),
      co2Reduced: increment(data.quantity * 0.8),
    }
  }, { merge: true });

  return docRef.id;
}

export async function getOrdersByCustomer(customerId: string): Promise<OrderData[]> {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as OrderData[];
  
  return orders.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function getOrdersByStore(storeId: string): Promise<OrderData[]> {
  const q = query(
    collection(db, 'orders'),
    where('storeId', '==', storeId)
  );
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as OrderData[];
  
  return orders.sort((a, b) => {
    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status });
}

// ==================== CHATS ====================

export async function getChatsByCustomer(customerId: string): Promise<import('./types').ChatData[]> {
  const q = query(
    collection(db, 'chats'),
    where('customerId', '==', customerId)
  );
  const snapshot = await getDocs(q);
  const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as import('./types').ChatData));
  return chats.sort((a, b) => {
    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function getChatsByStore(storeId: string): Promise<import('./types').ChatData[]> {
  const q = query(
    collection(db, 'chats'),
    where('storeId', '==', storeId)
  );
  const snapshot = await getDocs(q);
  const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as import('./types').ChatData));
  return chats.sort((a, b) => {
    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
    return timeB - timeA;
  });
}

export async function sendMessage(
  customerId: string,
  customerName: string,
  storeId: string,
  storeName: string,
  senderId: string,
  text: string,
  storePhotoURL?: string
): Promise<void> {
  const chatId = `${customerId}_${storeId}`;
  const now = Timestamp.now();
  
  // Update or create chat document
  await setDoc(doc(db, 'chats', chatId), {
    id: chatId,
    customerId,
    customerName,
    storeId,
    storeName,
    storePhotoURL: storePhotoURL || '',
    lastMessage: text,
    updatedAt: now,
  }, { merge: true });

  // Add message to subcollection
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    chatId,
    senderId,
    text,
    createdAt: now,
  });
}
