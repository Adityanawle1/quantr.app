const http = require('http');

const postData = JSON.stringify({
  messages: [{ role: 'user', parts: [{ type: 'text', text: 'what is p/e ratio' }] }]
});

const options = {
  hostname: '192.168.88.4',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers));
  let data = '';
  res.on('data', (chunk) => { data += chunk; console.log('CHUNK:', chunk.toString().substring(0, 500)); });
  res.on('end', () => { console.log('END. Total data length:', data.length); });
  res.on('error', (e) => { console.error('Response error:', e); });
});

req.on('error', (e) => { console.error('Request error:', e); });
req.write(postData);
req.end();
