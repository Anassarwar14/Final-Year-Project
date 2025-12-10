const fetch = require('node-fetch');

async function testAlphaVantage() {
    try {
        const response = await fetch('https://www.alphavantage.co/query?function=NEWS_SENTIMENT&sort=LATEST&limit=10&apikey=YK4910DTUF3YHZCG');
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Feed count:', data.feed?.length || 0);
        
        if (data.feed && data.feed.length > 0) {
            console.log('First article:', data.feed[0].title);
            console.log('SUCCESS: API is working!');
        } else {
            console.log('ERROR: No feed data');
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

testAlphaVantage();
