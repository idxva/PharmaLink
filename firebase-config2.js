import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig2 = {
  apiKey: process.env.FIREBASE2_API_KEY,
  authDomain: process.env.FIREBASE2_AUTH_DOMAIN,
  projectId: process.env.FIREBASE2_PROJECT_ID,
  storageBucket: process.env.FIREBASE2_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE2_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE2_APP_ID
};

// IMPORTANT: give this app instance a unique name ("secondary")
// so it doesn't collide with your existing Firebase app
const secondaryApp = initializeApp(firebaseConfig2, "secondary");
const db2 = getFirestore(secondaryApp);

export { db2 };
