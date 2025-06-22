import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import scrapeLinkedIn from '../functions/scrapers/linkedinScraper.mjs';

dotenv.config();

// Initialize Firebase with your config
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
const db = getFirestore(app);

// Authenticate with Firebase
const authenticate = async () => {
    if (!process.env.FIREBASE_ADMIN_EMAIL || !process.env.FIREBASE_ADMIN_PASSWORD) {
        throw new Error('Firebase admin credentials not found in environment variables');
    }
    
    try {
        await signInWithEmailAndPassword(
            auth,
            process.env.FIREBASE_ADMIN_EMAIL,
            process.env.FIREBASE_ADMIN_PASSWORD
        );
        console.log('🔐 Authenticated with Firebase');
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        throw error;
    }
};

const cleanupExpiredInternships = async () => {
    try {
        // Delete internships older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const q = query(
            collection(db, "internships"),
            where("timestamp", "<=", thirtyDaysAgo.toISOString())
        );

        const querySnapshot = await getDocs(q);
        const deletedCount = querySnapshot.size;

        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`🧹 Cleaned up ${deletedCount} expired internships`);
    } catch (error) {
        console.error('Error cleaning up expired internships:', error);
        throw error;
    }
};

const updateInternships = async () => {
    try {
        // Authenticate first
        await authenticate();
        console.log('🚀 Starting LinkedIn scraping process...');
        console.log('⏳ This might take a minute or two...');
        const jobs = await scrapeLinkedIn();
        console.log(`✅ Found ${jobs.length} internships`);
        
        if (jobs.length > 0) {
            console.log('\nSample internship details:');
            console.log(JSON.stringify(jobs[0], null, 2));

            // Add new internships to Firebase
            for (const job of jobs) {
                // Check if internship already exists
                const q = query(
                    collection(db, "internships"), 
                    where("title", "==", job.title),
                    where("company", "==", job.company)
                );
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    await addDoc(collection(db, "internships"), job);
                    console.log(`📝 Added new internship: ${job.title} at ${job.company}`);
                }
            }
        }

        // Clean up expired internships
        await cleanupExpiredInternships();
        
        console.log('✨ Internship update completed successfully!');
    } catch (error) {
        console.error('❌ Error updating internships:', error);
        throw error;
    }
};

// Run the update with test mode option
const testMode = process.argv.includes('--test');

if (testMode) {
    // Just test scraping
    scrapeLinkedIn().then(jobs => {
        console.log('\n🎯 Test Results:');
        console.log(`Total internships found: ${jobs.length}`);
        console.log('\nFirst 3 internships:');
        jobs.slice(0, 3).forEach((job, index) => {
            console.log(`\n${index + 1}. ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Stipend: ₹${job.stipend.toLocaleString('en-IN')}`);
            console.log(`   Remote: ${job.remote ? 'Yes' : 'No'}`);
        });
        process.exit(0); // Ensure process exits after test
    }).catch(error => {
        console.error('❌ Error during test:', error);
        process.exit(1);
    });
} else {
    // Actually update Firebase
    updateInternships().then(() => {
        process.exit(0); // Ensure process exits after update
    }).catch(error => {
        console.error('❌ Error during update:', error);
        process.exit(1);
    });
}
