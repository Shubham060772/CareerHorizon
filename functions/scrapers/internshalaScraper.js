import puppeteer from 'puppeteer';

export const scrapeInternshala = async () => {
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

        // Go to Internshala internships page (India, latest, work from home + in-office)
        await page.goto('https://internshala.com/internships/internship-in-india', {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });

        // Wait for main internship list container
        await page.waitForSelector('#internship_list_container', { timeout: 30000 });
        // Scroll to load more internships (simulate user)
        for (let i = 0; i < 8; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
        }

        // Wait for at least one card
        await page.waitForSelector('.container-fluid.individual_internship', { timeout: 20000 });
        // Debug: count cards
        const cardCount = await page.evaluate(() => document.querySelectorAll('.container-fluid.individual_internship').length);
        console.log('DEBUG: .container-fluid.individual_internship count:', cardCount);

        const internships = await page.evaluate(() => {
            const BASE_URL = 'https://internshala.com';
            const cards = document.querySelectorAll('.container-fluid.individual_internship');
            return Array.from(cards).map(card => {
                // Title
                const titleElement = card.querySelector('.job-internship-name a.job-title-href');
                // Company
                const companyElement = card.querySelector('.company-name');
                // Location
                const locationElement = card.querySelector('.row-1-item.locations a');
                // Stipend
                const stipendElement = card.querySelector('.stipend');
                // Duration
                let duration = 0;
                const durationDivs = card.querySelectorAll('.row-1-item');
                durationDivs.forEach(div => {
                    if (div.innerText && div.innerText.match(/\d+ Month/)) {
                        const match = div.innerText.match(/(\d+) Month/);
                        if (match) duration = parseInt(match[1]);
                    }
                });
                // Apply link
                let applyLink = '';
                if (titleElement && titleElement.getAttribute('href')) {
                    applyLink = BASE_URL + titleElement.getAttribute('href');
                } else if (card.getAttribute('data-href')) {
                    applyLink = BASE_URL + card.getAttribute('data-href');
                }
                // Stipend
                let stipend = 0;
                if (stipendElement) {
                    const match = stipendElement.textContent.replace(/,/g, '').match(/₹\s*(\d+)/);
                    if (match) stipend = parseInt(match[1]);
                }
                // Deadline (not present in card, set null)
                let deadline = null;
                // Remote
                let remote = false;
                if (locationElement && locationElement.textContent.toLowerCase().includes('home')) remote = true;
                // Title text
                const title = titleElement ? titleElement.textContent.trim() : '';
                // Company text
                const company = companyElement ? companyElement.textContent.trim() : '';
                // Location text
                const location = locationElement ? locationElement.textContent.trim() : '';
                return {
                    title,
                    company,
                    location,
                    applyLink,
                    source: 'Internshala',
                    deadline,
                    remote,
                    paid: stipend > 0,
                    stipend: stipend || 8000,
                    duration: duration || 3,
                    timestamp: new Date().toISOString(),
                };
            });
        });

        // Filter out invalid entries and ads, and only keep strictly software/CSE/UI/UX/graphic design fields
        const relevantKeywords = [
            'software', 'developer', 'engineer', 'engineering', 'web', 'app', 'frontend', 'backend',
            'full stack', 'cse', 'computer science', 'ai', 'artificial intelligence',
            'machine learning', 'ml', 'deep learning', 'python', 'java', 'react', 'node', 'cloud',
            'devops', 'android', 'ios', 'mobile', 'programming', 'coding', 'sde', 'development',
            'ui', 'ux', 'ui/ux', 'user interface', 'user experience', 'graphic design', 'graphic designer', 'designer', 'visual design', 'product design'
        ];
        function containsWholeWord(text, word) {
            return new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(text);
        }
        const validInternships = internships.filter(job => {
            if (!job.title || !job.company || !job.applyLink) return false;
            const lowerTitle = job.title.toLowerCase();
            const lowerCompany = job.company.toLowerCase();
            const lowerLocation = job.location ? job.location.toLowerCase() : '';
            // Exclude business development and sales roles
            if (
                lowerTitle.includes('business development') ||
                lowerTitle.includes('sales') ||
                lowerCompany.includes('business development') ||
                lowerCompany.includes('sales')
            ) return false;
            if (lowerTitle.includes('training') || lowerTitle.includes('offer') || lowerCompany.includes('training') || lowerCompany.includes('offer')) return false;
            // Only keep if title or company or location contains a relevant keyword as a whole word
            return relevantKeywords.some(keyword =>
                containsWholeWord(lowerTitle, keyword) ||
                containsWholeWord(lowerCompany, keyword) ||
                containsWholeWord(lowerLocation, keyword)
            );
        });

        // DEBUG: Log first 3 parsed internships
        console.log('DEBUG: First 3 parsed internships:', validInternships.slice(0, 3));

        // DEBUG: If still no internships, save HTML for inspection
        if (validInternships.length === 0) {
            const html = await page.content();
            const fs = await import('fs');
            fs.writeFileSync('internshala_debug.html', html);
            console.log('Saved Internshala HTML to internshala_debug.html for inspection.');
        }

        return validInternships;
    } catch (error) {
        console.error('Error scraping Internshala:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

export default scrapeInternshala;
