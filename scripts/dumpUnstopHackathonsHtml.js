// This script will dump the HTML of the Unstop hackathons page for selector debugging
import puppeteer from 'puppeteer';

(async () => {
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
        await page.goto('https://unstop.com/hackathons', {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });
        // Wait a bit for JS to load
        await new Promise(res => setTimeout(res, 5000));
        const html = await page.content();
        const fs = await import('fs');
        fs.writeFileSync('unstop_hackathons_debug.html', html);
        console.log('Saved Unstop HTML to unstop_hackathons_debug.html for inspection.');
    } finally {
        await browser.close();
    }
})();
