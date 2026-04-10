import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAfGUY4o4Q82aUL0_Q_i_V3F3LrFo_ili4",
  authDomain: "jessica-61abf.firebaseapp.com",
  projectId: "jessica-61abf",
  storageBucket: "jessica-61abf.firebasestorage.app",
  messagingSenderId: "768498636608",
  appId: "1:768498636608:web:857cc073ba02c6d7b00ca5",
  measurementId: "G-2TQBLT25TG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
