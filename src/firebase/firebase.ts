import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyB_GJQBNgsjgDPQvVkiSzkyf0nWiWFvCP4',
  authDomain: 'app-ciruesbelt.firebaseapp.com',
  databaseURL: 'https://app-ciruesbelt-default-rtdb.firebaseio.com',
  projectId: 'app-ciruesbelt',
  storageBucket: 'app-ciruesbelt.firebasestorage.app',
  messagingSenderId: '1028583394125',
  appId: '1:1028583394125:android:67c86a65194eefa012c504',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const firestore = getFirestore(app);
const realtimeDatabase = getDatabase(app);

export { app, auth, firestore, realtimeDatabase };