import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import dotenv from 'dotenv';
import scrapeLinkedIn from '../functions/scrapers/linkedinScraper.js';
import scrapeInternshala from '../functions/scrapers/internshalaScraper.js';
import fetch from 'node-fetch';

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
const db = getFirestore(app);

const isValidUrl = (url) => {
    try {
        if (!url || typeof url !== 'string') return false;
        // Only allow www.linkedin.com links
        // if (!url.includes('linkedin.com')) return false;
        // Try to construct a URL object
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

const cleanupExpiredInternships = async () => {
    try {
        const now = new Date().toISOString();
        const allSnapshot = await getDocs(collection(db, "internships"));
        let expired = [];
        allSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.deadline && data.deadline < now) {
                expired.push({ id: docSnap.id, ...data });
            }
        });
        console.log(`Found ${expired.length} expired internships (by deadline < now):`);
        expired.forEach(job => console.log(job.title, job.deadline));
        // Delete them
        const deletePromises = expired.map(job => deleteDoc(doc(db, "internships", job.id)));
        await Promise.all(deletePromises);
        console.log(`🧹 Cleaned up ${expired.length} expired internships`);
    } catch (error) {
        console.error('Error cleaning up expired internships:', error);
        throw error;
    }
};

const updateInternships = async () => {
    try {
        // --- Scrape both LinkedIn and Internshala ---
        console.log('🚀 Starting LinkedIn scraping process...');
        console.log('⏳ This might take a minute or two...');
        const linkedinJobs = await scrapeLinkedIn();
        console.log(`✅ Found ${linkedinJobs.length} LinkedIn internships`);

        console.log('🚀 Starting Internshala scraping process...');
        const internshalaJobs = await scrapeInternshala();
        console.log(`✅ Found ${internshalaJobs.length} Internshala internships`);

        // Merge and deduplicate jobs (by title+company)
        const allJobs = [...linkedinJobs, ...internshalaJobs];
        const uniqueJobs = [];
        const seen = new Set();
        for (const job of allJobs) {
            const key = `${job.title}|${job.company}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueJobs.push(job);
            }
        }
        console.log(`🔎 Total unique internships: ${uniqueJobs.length}`);

        if (uniqueJobs.length > 0) {
            console.log('\nSample internship details:');
            console.log(JSON.stringify(uniqueJobs[0], null, 2));

            // Add new internships to Firebase
            for (const job of uniqueJobs) {
                // Always use www.linkedin.com in applyLink
                if (job.applyLink && job.applyLink.includes('in.linkedin.com')) {
                    job.applyLink = job.applyLink.replace('in.linkedin.com', 'www.linkedin.com');
                }
                // Less strict validation
                if (!isValidUrl(job.applyLink)) {
                    console.log(`❌ Skipping invalid apply link: ${job.applyLink} for ${job.title} at ${job.company}`);
                    continue;
                }
                // Check if internship already exists
                const q = query(
                    collection(db, "internships"), 
                    where("title", "==", job.title),
                    where("company", "==", job.company)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    console.log(`⚠️ Skipping duplicate: ${job.title} at ${job.company}`);
                    continue;
                }
                await addDoc(collection(db, "internships"), job);
                console.log(`📝 Added new internship: ${job.title} at ${job.company}`);
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
    Promise.all([
        scrapeLinkedIn(),
        scrapeInternshala()
    ]).then(([linkedinJobs, internshalaJobs]) => {
        const allJobs = [...linkedinJobs, ...internshalaJobs];
        const uniqueJobs = [];
        const seen = new Set();
        for (const job of allJobs) {
            const key = `${job.title}|${job.company}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueJobs.push(job);
            }
        }
        console.log('\n🎯 Test Results:');
        console.log(`Total internships found: ${uniqueJobs.length}`);
        console.log('\nFirst 3 internships:');
        uniqueJobs.slice(0, 3).forEach((job, index) => {
            console.log(`\n${index + 1}. ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Stipend: ₹${job.stipend.toLocaleString('en-IN')}`);
            console.log(`   Remote: ${job.remote ? 'Yes' : 'No'}`);
            console.log(`   Source: ${job.source}`);
        });
    }).catch(error => {
        console.error('❌ Error during test:', error);
        process.exit(1);
    });
} else {
    // Actually update Firebase
    updateInternships().catch(error => {
        console.error('❌ Error during update:', error);
        process.exit(1);
    });
}
