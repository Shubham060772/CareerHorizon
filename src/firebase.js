import { initializeApp } from "firebase/app";
import { getAuth ,GoogleAuthProvider  } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use Vite environment variables correctly
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Correct function name: initializeApp
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
const provider= new GoogleAuthProvider();
export { app, auth , provider };
