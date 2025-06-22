import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
const db = getFirestore(app);

const deleteAllInterns = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'internships'));
        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'internships', docSnap.id)));
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${snapshot.size} internships from Firestore.`);
    } catch (error) {
        console.error('❌ Error deleting internships:', error);
        process.exit(1);
    }
};

deleteAllInterns().then(() => process.exit(0));
