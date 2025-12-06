import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getFirestore, type Firestore } from "firebase/firestore";

// Check if Firebase is configured (must have actual values, not empty strings)
const isFirebaseConfigured = true;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let database: Database | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: "AIzaSyBEMutxISSdHbL4OotcoKMh1Zv603jWzgw",
    authDomain: "mynewbb-73847.firebaseapp.com",
    databaseURL: "https://mynewbb-73847-default-rtdb.firebaseio.com",
    projectId: "mynewbb-73847",
    storageBucket: "mynewbb-73847.firebasestorage.app",
    messagingSenderId: "1017329682260",
    appId: "1:1017329682260:web:7c8e6a9ece4e91399ceac1",
    measurementId: "G-E5XV1B9R32",
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  database = getDatabase(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn(
    "Firebase is not configured. Authentication features will be disabled.",
  );
}

export { auth, db, database, googleProvider, isFirebaseConfigured };
export default app;
