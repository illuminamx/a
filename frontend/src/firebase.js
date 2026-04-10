import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAfGUY4o4Q82aUL0_Q_i_V3F3LrFo_ili4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "jessica-61abf.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "jessica-61abf",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "jessica-61abf.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "768498636608",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:768498636608:web:857cc073ba02c6d7b00ca5",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-2TQBLT25TG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
