// This is a one-time script to create the admin user
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_API_KEY,
    authDomain: process.env.VITE_AUTH_DOMAIN,
    projectId: process.env.VITE_PROJECT_ID,
    storageBucket: process.env.VITE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const createAdminUser = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            process.env.FIREBASE_ADMIN_EMAIL,
            process.env.FIREBASE_ADMIN_PASSWORD
        );
        console.log('✅ Admin user created successfully:', userCredential.user.uid);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin user:', error);
        }
    }
};

createAdminUser().then(() => process.exit(0));
