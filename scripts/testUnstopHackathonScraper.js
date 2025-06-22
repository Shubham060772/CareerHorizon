import scrapeUnstopHackathons from '../functions/scrapers/unstopHackathonScraper.js';

(async () => {
    try {
        const hackathons = await scrapeUnstopHackathons();
        console.log('Found', hackathons.length, 'hackathons.');
        if (hackathons.length > 0) {
            console.log('Sample:', hackathons[0]);
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
})();
