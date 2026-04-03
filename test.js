fetch('http://192.168.88.4:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'what is p/e ratio' }] })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(console.error);
