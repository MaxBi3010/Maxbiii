const cheerio = require('cheerio');

async function fetchPinterestData(url) {
    try {
        const fullUrl = url.startsWith('https://pin.it') 
            ? await expandShortUrl(url)
            : url;
        const pinId = fullUrl.match(/\/pin\/(\d+)/)?.[1];
        
        if (!pinId) {
            throw new Error('Invalid Pinterest URL');
        }

        const headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"15.0.0"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
            'upgrade-insecure-requests': '1'
        };

        const response = await fetch(fullUrl, {
            headers,
            method: 'GET'
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const imageUrl = $('link[as="image"][fetchpriority="high"]').attr('href');

        if (!imageUrl) {
            throw new Error('Image URL not found');
        }
        return {
            pinId,
            imageUrl,
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function expandShortUrl(shortUrl) {
    try {
        const response = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
        return response.url;
    } catch (error) {
        console.error('Error expanding URL:', error);
        throw error;
    }
}

module.exports = fetchPinterestData;