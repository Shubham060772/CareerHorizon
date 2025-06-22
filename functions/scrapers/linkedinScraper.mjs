import puppeteer from 'puppeteer';
// We don't need chrome-aws-lambda for local development
// import chromium from 'chrome-aws-lambda';

export const scrapeLinkedIn = async () => {    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
        timeout: 60000,
    });

    try {
        const page = await browser.newPage();
        // Set user agent and additional headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });
        
        // Navigate to LinkedIn jobs with specific filters for internships
        await page.goto('https://www.linkedin.com/jobs/search?keywords=internship&location=India&f_WT=2&f_JT=I&sortBy=DD', {
            waitUntil: 'networkidle0',
            timeout: 60000,
        });
        
        // Wait for the job listings to load
        await page.waitForSelector('.jobs-search__results-list', { timeout: 30000 });        // Scroll to load more jobs
        await autoScroll(page);

        const jobs = await page.evaluate(() => {
            const listings = document.querySelectorAll('.jobs-search__results-list li');
            return Array.from(listings).map(job => {
                const titleElement = job.querySelector('.base-search-card__title');
                const companyElement = job.querySelector('.base-search-card__subtitle');
                const locationElement = job.querySelector('.job-search-card__location');
                const linkElement = job.querySelector('.base-card__full-link');
                const postedDateElement = job.querySelector('time');
                const salaryElement = job.querySelector('.job-search-card__salary-info');

                // Calculate deadline (30 days from posted date)
                const postedDate = postedDateElement ? new Date(postedDateElement.dateTime) : new Date();
                const deadline = new Date(postedDate);
                deadline.setDate(deadline.getDate() + 30);

                // Extract salary/stipend information
                let stipend = 0;
                if (salaryElement) {
                    const salaryText = salaryElement.textContent.trim();
                    const matches = salaryText.match(/₹([\d,]+)/);
                    if (matches) {
                        stipend = parseInt(matches[1].replace(/,/g, ''));
                    }
                }

                // Robust defaults for all fields
                return {
                    title: titleElement ? titleElement.textContent.trim() : '',
                    company: companyElement ? companyElement.textContent.trim() : '',
                    location: locationElement ? locationElement.textContent.trim() : '',
                    applyLink: linkElement ? linkElement.href : '',
                    source: 'LinkedIn',
                    deadline: deadline.toISOString(),
                    remote: locationElement ? locationElement.textContent.toLowerCase().includes('remote') : false,
                    paid: true, // Always boolean
                    stipend: typeof stipend === 'number' && !isNaN(stipend) ? stipend : 15000, // Always number
                    duration: 3, // Always number
                    timestamp: new Date().toISOString(),
                };            });
        });

        // Filter out invalid entries
        return jobs.filter(job => 
            job.title && 
            job.company && 
            job.applyLink && 
            job.title.toLowerCase().includes('intern') &&
            typeof job.paid === 'boolean' &&
            typeof job.remote === 'boolean' &&
            typeof job.stipend === 'number' &&
            typeof job.duration === 'number'
        );
    } catch (error) {
        console.error('Error scraping LinkedIn:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

// Helper function to auto-scroll the page
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

export default scrapeLinkedIn;
