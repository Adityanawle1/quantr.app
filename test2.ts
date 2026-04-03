import { POST } from './app/api/chat/route.ts';

const req = new Request('http://localhost/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
});

POST(req)
  .then(res => res.text())
  .then(text => console.log('Response:', text))
  .catch(err => console.error('Caught Error:', err));
