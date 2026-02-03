const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1280, height: 3000 });
        console.log('Navigating...');
        await page.goto('https://www.canalplus.com/bf/programme-tv/', { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log('Waiting...');
        await new Promise(r => setTimeout(r, 5000));

        const data = await page.evaluate(() => {
            const results = [];
            // Find all images
            const imgs = document.querySelectorAll('img');
            imgs.forEach(img => {
                if (!img.alt) return;
                
                // Find parent that contains at least one program link
                let parent = img.parentElement;
                while(parent && parent.tagName !== 'BODY') {
                    const links = Array.from(parent.querySelectorAll('a')).filter(a => /^\d{2}:\d{2}/.test(a.innerText));
                    if (links.length > 0) {
                        // Avoid duplicates if we already found this channel
                        if (results.some(r => r.channel === img.alt)) break;
                        
                        results.push({
                            channel: img.alt,
                            programs: links.map(c => {
                                const lines = c.innerText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
                                return { time: lines[0], title: lines[1] };
                            })
                        });
                        break;
                    }
                    parent = parent.parentElement;
                }
            });
            return results;
        });

        console.log(`Found ${data.length} channels`);
        data.forEach(d => {
            console.log(`Channel: ${d.channel} (${d.programs.length} programs)`);
            if (d.programs.length > 0) {
                console.log(`  P1: ${d.programs[0].time} - ${d.programs[0].title}`);
            }
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
