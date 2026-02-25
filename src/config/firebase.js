import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ IMPORTANT: Replace these values with your Firebase config
// Get from: Firebase Console → Project Settings → firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyReplaceMeWithYourKey",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
