const http = require('http');

const postData = JSON.stringify({
  messages: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }]
});

const options = {
  hostname: '192.168.88.4',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk.toString(); });
  res.on('end', () => { 
    require('fs').writeFileSync('api_response.txt', `Status: ${res.statusCode}\nHeaders: ${JSON.stringify(res.headers)}\n\n${data}`);
    console.log('Done. Status:', res.statusCode, 'Data length:', data.length);
  });
});

req.on('error', (e) => { console.error('Error:', e); });
req.write(postData);
req.end();
