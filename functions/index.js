/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { scrapeLinkedIn } = require('./scrapers/linkedinScraper');

initializeApp();
const db = getFirestore();

// Scheduled function to scrape LinkedIn jobs every 6 hours
exports.scrapeJobs = onSchedule("0 */6 * * *", async (event) => {
    try {
        const jobs = await scrapeLinkedIn();
        
        // Batch write to Firestore
        const batch = db.batch();
        
        jobs.forEach(job => {
            const docRef = db.collection('internships').doc();
            batch.set(docRef, {
                ...job,
                paid: job.title.toLowerCase().includes('paid'),
                stipend: 0, // Default value as LinkedIn doesn't show stipend
                duration: 3, // Default value
            });
        });
        
        await batch.commit();
        console.log(`Successfully scraped and saved ${jobs.length} jobs`);
    } catch (error) {
        console.error('Error in scrapeJobs:', error);
    }
});

// Function to clean up expired internships
exports.cleanupExpiredJobs = onSchedule("0 0 * * *", async (event) => {
    try {
        const now = new Date();
        const expiredJobs = await db.collection('internships')
            .where('deadline', '<', now)
            .get();

        const batch = db.batch();
        expiredJobs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleaned up ${expiredJobs.size} expired internships`);
    } catch (error) {
        console.error('Error in cleanupExpiredJobs:', error);
    }
});
