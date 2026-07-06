const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function test() {
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-upload.txt');
  fs.writeFileSync(testFilePath, 'This is a test file for ThreatLens file scanning.');

  const form = new FormData();
  form.append('file', fs.createReadStream(testFilePath), {
    filename: 'test-upload.txt',
    contentType: 'text/plain'
  });

  try {
    const resp = await axios.post('http://localhost:5000/api/analyze/file', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    console.log('\n=== RESPONSE STATUS:', resp.status, '===');
    console.log('=== RESPONSE SIZE:', JSON.stringify(resp.data).length, 'bytes ===');
    console.log('SUCCESS:', resp.data.success);
    const data = resp.data.data;
    if (!data) {
      console.log('NO DATA IN RESPONSE:', JSON.stringify(resp.data));
      return;
    }
    console.log('SHA256:', data.sha256);
    console.log('TYPE:', data.type);
    console.log('THREAT SCORE:', data.threatScore, '/', data.threatBand);
    console.log('\nSOURCES:');
    data.sources?.forEach(s => {
      console.log(`  [${s.source}] success=${s.success} | error: ${s.error || 'none'}`);
      if (s.normalized) console.log(`    normalized keys: ${Object.keys(s.normalized).join(', ')}`);
    });
  } catch(e) {
    console.error('\nHTTP ERROR:', e.response?.status);
    console.error('BODY:', JSON.stringify(e.response?.data || e.message));
  } finally {
    fs.unlinkSync(testFilePath);
  }
}

test();
