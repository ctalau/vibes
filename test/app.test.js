const test = require('node:test');
const assert = require('node:assert/strict');
const search = require('../search');
const fetchPage = require('../fetch');
const mcp = require('../netlify/functions/mcp.js');

test('search returns results', () => {
  const res = search('help');
  assert.ok(Array.isArray(res));
  assert.ok(res.length > 0);
  assert.ok(res[0].id);
});

test('fetchPage returns html', async () => {
  const page = await fetchPage('index.html');
  assert.ok(page.text.includes('<html'));
});

test('mcp exports handler', () => {
  assert.equal(typeof mcp.handler, 'function');
});
