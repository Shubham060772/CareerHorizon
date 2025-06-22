import puppeteer from 'puppeteer';

export const scrapeUnstopHackathons = async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ],
        timeout: 60000,
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/'
        });

        // Go to Unstop hackathons page
        await page.goto('https://unstop.com/hackathons', {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });

        // Scroll to load more hackathons (simulate user)
        for (let i = 0; i < 8; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
        }

        // Wait for hackathon cards (new selector)
        let found = false;
        try {
            await page.waitForSelector('.mock-card', { timeout: 20000 });
            found = true;
        } catch (e) {
            // Not found after scrolling
            found = false;
        }
        if (!found) {
            const html = await page.content();
            const fs = await import('fs');
            fs.writeFileSync('unstop_hackathons_debug.html', html);
            console.log('Saved Unstop HTML to unstop_hackathons_debug.html for inspection.');
            return [];
        }

        // Extract hackathon data using new card structure
        const hackathons = await page.evaluate(() => {
            const BASE_URL = 'https://unstop.com';
            const cards = document.querySelectorAll('.mock-card');
            return Array.from(cards).map(card => {
                // Title
                const titleElement = card.querySelector('.event-title, .event-name, .heading-4');
                // Organizer
                let orgElement = card.querySelector('.org-name, .organization-name, .org-title');
                if (!orgElement) {
                    // Try fallback
                    const orgFallback = card.querySelector('.d-flex.align-items-center.gap-2 span');
                    if (orgFallback) orgElement = orgFallback;
                }
                // Dates
                let dateElement = card.querySelector('.date, .event-date, .MuiBox-root span');
                // Location (if any)
                let locationElement = card.querySelector('.location, .event-location, .MuiBox-root .d-flex.align-items-center.gap-2 span');
                // Link
                let linkElement = card.querySelector('a');
                // Tags/fields (if any)
                let tagElements = card.querySelectorAll('.MuiBox-root .MuiChip-label, .tag, .badge');
                const tags = Array.from(tagElements).map(tag => tag.textContent.trim());

                // Compose hackathon object
                return {
                    title: titleElement ? titleElement.textContent.trim() : '',
                    organizer: orgElement ? orgElement.textContent.trim() : '',
                    dates: dateElement ? dateElement.textContent.trim() : '',
                    location: locationElement ? locationElement.textContent.trim() : '',
                    applyLink: linkElement ? (linkElement.href.startsWith('http') ? linkElement.href : BASE_URL + linkElement.getAttribute('href')) : '',
                    tags,
                    source: 'Unstop',
                    timestamp: new Date().toISOString(),
                };
            });
        });

        // Filter out invalid entries
        const validHackathons = hackathons.filter(h => h.title && h.applyLink);
        if (validHackathons.length === 0) {
            const html = await page.content();
            const fs = await import('fs');
            fs.writeFileSync('unstop_hackathons_debug.html', html);
            console.log('Saved Unstop HTML to unstop_hackathons_debug.html for inspection.');
        }
        // DEBUG: Log first 3 hackathons
        console.log('DEBUG: First 3 parsed hackathons:', validHackathons.slice(0, 3));
        return validHackathons;
    } catch (error) {
        console.error('Error scraping Unstop hackathons:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

export default scrapeUnstopHackathons;
