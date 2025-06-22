import puppeteer from 'puppeteer';
// We don't need chrome-aws-lambda for local development
// import chromium from 'chrome-aws-lambda';

export const scrapeLinkedIn = async () => {
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

        // Go to LinkedIn jobs page
        await page.goto('https://www.linkedin.com/jobs/search?keywords=internship&location=India&f_WT=2&f_JT=I&sortBy=DD', {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });

        // Scroll to load more jobs
        for (let i = 0; i < 10; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            // Use setTimeout instead of page.waitForTimeout
            await new Promise(res => setTimeout(res, 2000 + Math.random() * 2000));
        }

        await page.waitForSelector('.jobs-search__results-list', { timeout: 30000 });

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

                return {
                    title: titleElement ? titleElement.textContent.trim() : '',
                    company: companyElement ? companyElement.textContent.trim() : '',
                    location: locationElement ? locationElement.textContent.trim() : '',
                    applyLink: linkElement ? linkElement.href : '',
                    source: 'LinkedIn',
                    deadline: deadline.toISOString(),
                    remote: locationElement ? locationElement.textContent.toLowerCase().includes('remote') : false,
                    paid: true, // Assuming LinkedIn internships are paid by default
                    stipend: stipend || 15000, // Default stipend if not specified
                    duration: 3, // Default duration
                    timestamp: new Date().toISOString(),
                };
            });
        });

        // Filter out invalid entries
        return jobs.filter(job => 
            job.title && 
            job.company && 
            job.applyLink && 
            job.title.toLowerCase().includes('intern')
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

export default scrapeLinkedIn;
