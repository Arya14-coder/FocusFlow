import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAj4QoIFoYD-DqS0cXkhhrgwXrYU3F6R-A",
  authDomain: "focusflow-16b5a.firebaseapp.com",
  projectId: "focusflow-16b5a",
  storageBucket: "focusflow-16b5a.firebasestorage.app",
  messagingSenderId: "93432495037",
  appId: "1:93432495037:web:aa23a73607f74d645170d4",
  measurementId: "G-ME0MSV8P01"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
