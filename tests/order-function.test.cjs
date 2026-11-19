const { test } = require('node:test');
const assert = require('node:assert/strict');

test('order function confirms only orders acknowledged by Apps Script', async t => {
  const { handler } = await import('../netlify/functions/order.js');
  const originalUrl = process.env.SHEETS_URL;
  process.env.SHEETS_URL = 'https://example.test/exec';
  t.after(() => {
    if (originalUrl === undefined) delete process.env.SHEETS_URL;
    else process.env.SHEETS_URL = originalUrl;
  });
  let upstream = { ok: true, json: async () => ({ success: true }) };
  const mockFetch = t.mock.method(globalThis, 'fetch', async () => upstream);
  const event = { httpMethod: 'POST', body: '{"name":"Test"}' };
  assert.equal((await handler(event)).statusCode, 200);
  assert.equal(mockFetch.mock.calls[0].arguments[1].body, event.body);
  upstream = { ok: true, json: async () => ({ success: false }) };
  assert.equal((await handler(event)).statusCode, 502);
  upstream = { ok: false, status: 500 };
  assert.equal((await handler(event)).statusCode, 502);
  assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 405);
  delete process.env.SHEETS_URL;
  assert.equal((await handler(event)).statusCode, 500);
});
