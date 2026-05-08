import { Timestamp } from 'firebase/firestore';

export type UserRole = 'customer' | 'store';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Timestamp;
  stats: {
    totalOrders: number;
    totalSaved: number;
    co2Reduced: number;
  };
}

export interface StoreData {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  mapsLink?: string;
  city?: string;
  category: 'restoran' | 'kafe' | 'bakery' | 'catering' | 'lainnya';
  photoURL?: string;
  rating: number;
  totalSaved: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface MealData {
  id: string;
  storeId: string;
  storeName: string;
  storeCity?: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  quantityLeft: number;
  photoURL?: string;
  category: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface OrderData {
  id: string;
  mealId: string;
  mealTitle: string;
  mealPhotoURL?: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
}

export type StoreCategory = StoreData['category'];
export type OrderStatus = OrderData['status'];

export interface ChatData {
  id: string; // `${customerId}_${storeId}`
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  storePhotoURL?: string;
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface MessageData {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
