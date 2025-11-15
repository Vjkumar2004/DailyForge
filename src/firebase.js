import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDpNxfdgTxrgEC4vxvcza0Vbkfhb116unw',
  authDomain: 'dailyforge-889a0.firebaseapp.com',
  projectId: 'dailyforge-889a0',
  storageBucket: 'dailyforge-889a0.firebasestorage.app',
  messagingSenderId: '158402771076',
  appId: '1:158402771076:web:c431bc63a4cac9e7cc2ad1',
  measurementId: 'G-9Q6RB1SP8B',
};

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);

export { app, analytics, auth };
