const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createScript() {
  let distance = 0;
  let status = 200;
  const rows = [];
  const context = {
    console: { error() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'configured' }) },
    UrlFetchApp: {
      fetch: () => ({
        getResponseCode: () => status,
        getContentText: () => JSON.stringify({ routes: [{ distanceMeters: distance }] })
      })
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheetByName: () => ({ appendRow: row => rows.push(row) }) })
    },
    ContentService: {
      MimeType: { JSON: 'json', JAVASCRIPT: 'javascript' },
      createTextOutput: text => ({ text, setMimeType() { return this; } })
    }
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8'), context);
  return {
    context, rows,
    setDistance: value => { distance = value; },
    setStatus: value => { status = value; }
  };
}

test('delivery fees use exact driving-distance boundaries', () => {
  const script = createScript();
  for (const [meters, fee] of [[0, 15], [5000, 15], [5001, 25], [10000, 25], [10001, 35], [15000, 35], [15001, null]]) {
    script.setDistance(meters);
    const quote = script.context.calculateDelivery('1 Example Street');
    assert.equal(quote.available, fee !== null);
    if (fee !== null) assert.equal(quote.fee, fee);
  }
});

test('delivery lookup reports invalid addresses and route service errors', () => {
  const script = createScript();
  assert.equal(script.context.calculateDelivery(' ').available, false);
  script.setStatus(500);
  assert.equal(script.context.calculateDelivery('1 Example Street').available, false);
  script.setStatus(200);
  script.setDistance(-1);
  assert.equal(script.context.calculateDelivery('1 Example Street').available, false);
  const response = script.context.doGet({ parameter: { action: 'calculateDelivery', address: 'test', callback: 'alert(1)' } });
  assert.match(response.text, /Invalid callback/);
});

test('delivery address and distance are saved in their existing sheet columns', () => {
  const script = createScript();
  script.context.saveOrder({ pickup: 'delivery', address: '1 Example Street', deliveryDistance: '5 km', deliveryFee: 15 });
  assert.equal(script.rows[0][7], '5 km');
  assert.equal(script.rows[0][8], 15);
  assert.equal(script.rows[0][10], '1 Example Street');
});
