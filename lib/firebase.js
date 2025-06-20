// lib/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// (Optional) import analytics only if running in browser
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyAiRNNcAhilVQnrzbbzQhR7gb6vnmlql4k",
    authDomain: "ride-share-d4197.firebaseapp.com",
    projectId: "ride-share-d4197",
    storageBucket: "ride-share-d4197.appspot.com", // fixed `.app` typo
    messagingSenderId: "622217063590",
    appId: "1:622217063590:web:19da64ff7d261f91669867",
    measurementId: "G-TLGV3XEPH9"
};

// Initialize Firebase (prevent re-init in Next.js dev mode)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
export { auth, db };
