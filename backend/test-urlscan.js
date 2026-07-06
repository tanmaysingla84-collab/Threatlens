const axios = require('axios');

const apiKey = '019f17d1-4947-759a-8283-4cba75854a86';
const authHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'API-Key': apiKey };
const anonHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

async function test() {
  console.log('=== Test 1: Submit with API key ===');
  try {
    const r = await axios.post('https://urlscan.io/api/v1/scan/', { url: 'https://example.com', visibility: 'public' }, { headers: authHeaders, timeout: 10000 });
    console.log('SUCCESS with key:', r.status, r.data?.uuid);
  } catch(e) {
    console.error('FAIL with key:', e.response?.status, JSON.stringify(e.response?.data));
  }

  console.log('\n=== Test 2: Submit anonymously ===');
  try {
    const r = await axios.post('https://urlscan.io/api/v1/scan/', { url: 'https://example.com', visibility: 'public' }, { headers: anonHeaders, timeout: 10000 });
    console.log('SUCCESS anon:', r.status, r.data?.uuid);
  } catch(e) {
    console.error('FAIL anon:', e.response?.status, JSON.stringify(e.response?.data));
  }
}

test();
