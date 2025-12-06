import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  setDoc,
  onSnapshot,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  price: string;
  originalPrice?: string;
  discountPercent?: number;
  image: string;
  category: string;
  inStock: boolean;
  unit?: string;
  description?: string;
}

export interface FirestoreOrder {
  id: string;
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: string;
  items: OrderItem[];
  address: ShippingAddress;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  nameAr: string;
  nameEn: string;
  price: string;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  area: string;
  block: string;
  street: string;
  building?: string;
  floor?: string;
  notes?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export const productsCollection = collection(db, "products");
export const ordersCollection = collection(db, "orders");
export const cartsCollection = collection(db, "carts");
export const usersCollection = collection(db, "users");

export async function getProducts(): Promise<FirestoreProduct[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
}

export async function getProductById(id: string): Promise<FirestoreProduct | null> {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreProduct;
  }
  return null;
}

export async function getProductsByCategory(category: string): Promise<FirestoreProduct[]> {
  const q = query(productsCollection, where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProduct));
}

export async function createOrder(orderData: Omit<FirestoreOrder, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(ordersCollection, {
    ...orderData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function getOrders(): Promise<FirestoreOrder[]> {
  const q = query(ordersCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreOrder));
}

export async function getOrderById(id: string): Promise<FirestoreOrder | null> {
  const docRef = doc(db, "orders", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreOrder;
  }
  return null;
}

export async function updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<void> {
  const docRef = doc(db, "orders", id);
  const updateData: any = { status };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  await updateDoc(docRef, updateData);
}

export async function getCart(sessionId: string): Promise<CartItem[]> {
  const docRef = doc(db, "carts", sessionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().items || [];
  }
  return [];
}

export async function updateCart(sessionId: string, items: CartItem[]): Promise<void> {
  const docRef = doc(db, "carts", sessionId);
  await setDoc(docRef, { items, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function clearCart(sessionId: string): Promise<void> {
  const docRef = doc(db, "carts", sessionId);
  await setDoc(docRef, { items: [], updatedAt: new Date().toISOString() });
}

export function subscribeToPaymentStatus(
  paymentId: string, 
  callback: (status: string) => void
): () => void {
  const docRef = doc(db, "payments", paymentId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.status);
    }
  });
}

export async function createPayment(paymentData: {
  orderId: string;
  amount: string;
  cardInfo?: any;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "payments"), {
    ...paymentData,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updatePaymentStatus(paymentId: string, status: string): Promise<void> {
  const docRef = doc(db, "payments", paymentId);
  await updateDoc(docRef, { status });
}

export async function updateProduct(id: string, data: Partial<FirestoreProduct>): Promise<void> {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, data);
}

export async function seedProducts(products: Omit<FirestoreProduct, "id">[]): Promise<void> {
  for (const product of products) {
    await addDoc(productsCollection, product);
  }
}
