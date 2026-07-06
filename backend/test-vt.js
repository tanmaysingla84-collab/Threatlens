const axios = require('axios');

const apiKey = 'c58c3b34773b7424d46ebe663cc9a5d0176a78b69dae87bb2257067c363e45be';

async function test() {
  // Test URL lookup
  console.log('\n=== VirusTotal URL test ===');
  try {
    const urlId = Buffer.from('https://example.com').toString('base64').replace(/=/g, '');
    const r = await axios.get(`https://www.virustotalproxy.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      timeout: 10000
    });
    console.log('STATUS:', r.status);
    console.log('DATA:', JSON.stringify(r.data?.data?.attributes?.last_analysis_stats));
  } catch(e) {
    console.error('URL ERR:', e.response?.status, JSON.stringify(e.response?.data));
  }

  // Test with real VT endpoint
  console.log('\n=== VirusTotal URL real endpoint ===');
  try {
    const urlId = Buffer.from('https://example.com').toString('base64').replace(/=/g, '');
    const r = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
      timeout: 10000
    });
    console.log('STATUS:', r.status);
    console.log('DATA:', JSON.stringify(r.data?.data?.attributes?.last_analysis_stats));
  } catch(e) {
    console.error('URL ERR:', e.response?.status, JSON.stringify(e.response?.data));
  }
}

test();
