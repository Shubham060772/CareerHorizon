import scrapeInternshala from '../functions/scrapers/internshalaScraper.js';

(async () => {
    try {
        console.log('Testing Internshala scraper...');
        const jobs = await scrapeInternshala();
        console.log(`Found ${jobs.length} internships.`);
        if (jobs.length > 0) {
            console.log('Sample internship:', jobs[0]);
        }
    } catch (error) {
        console.error('Error during Internshala scraping test:', error);
    }
})();
