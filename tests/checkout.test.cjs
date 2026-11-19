const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createCheckout(fetch) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, {
        value: '', textContent: '', innerHTML: '', style: {},
        classList: {
          add: name => classes.add(name),
          remove: name => classes.delete(name),
          contains: name => classes.has(name)
        },
        focus() {}
      });
    }
    return elements.get(id);
  }
  const alerts = [];
  const document = {
    getElementById: id => id === 'taglineText' ? null : element(id),
    querySelectorAll: () => [],
    body: element('body'),
    documentElement: { scrollTop: 0, style: {} }
  };
  const window = { innerWidth: 1024, matchMedia: () => ({ matches: false }) };
  const context = {
    document, window, fetch, alert: message => alerts.push(message),
    IntersectionObserver: class { observe() {} unobserve() {} },
    requestAnimationFrame: callback => callback()
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8'), context);
  return { window, element, alerts };
}

test('submitted order clears cart, checkout items and menu quantities', async () => {
  let resolveOrder;
  const app = createCheckout(() => new Promise(resolve => { resolveOrder = resolve; }));
  app.window.addToCart(3);
  app.window.addFlavourToCart(1, 'Vanilla');
  app.window.renderCheckoutItems();
  app.element('checkoutName').value = 'Test customer';
  app.window.placeOrder();

  assert.equal(app.element('cartCount').textContent, 2);
  assert.match(app.element('menuGrid').innerHTML, /Added \(1\)/);
  resolveOrder({ ok: true, json: async () => ({ success: true }) });
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(app.element('cartCount').textContent, 0);
  assert.equal(app.element('cartTotal').textContent, 0);
  assert.equal(app.element('cartBubble').classList.contains('visible'), false);
  assert.equal(app.element('checkoutItems').innerHTML, '');
  assert.doesNotMatch(app.element('menuGrid').innerHTML, /Added \(/);
  assert.match(app.element('confirmationContent').innerHTML, /Game Fuel \(Vanilla\)/);

  app.window.addToCart(3);
  assert.equal(app.element('cartCount').textContent, 1);
  assert.equal(app.element('cartTotal').textContent, 40);
});

test('failed submission keeps the cart and menu quantities', async () => {
  const app = createCheckout(() => Promise.reject(new Error('Network error')));
  app.window.addToCart(3);
  app.element('checkoutName').value = 'Test customer';
  app.window.placeOrder();
  await new Promise(resolve => setImmediate(resolve));

  assert.equal(app.element('cartCount').textContent, 1);
  assert.equal(app.element('cartTotal').textContent, 40);
  assert.match(app.element('menuGrid').innerHTML, /Added \(1\)/);
  assert.equal(app.alerts.length, 1);
  assert.equal(app.element('placeOrderBtn').disabled, false);
});

test('delivery requires an area and submits its fee and address', async () => {
  let submitted;
  const app = createCheckout((url, options) => {
    submitted = { url, body: JSON.parse(options.body) };
    return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
  });
  app.window.addToCart(3);
  app.element('checkoutName').value = 'Test customer';
  app.window.selectPickup('delivery');
  app.element('checkoutAddress').value = '1 Example Street';
  app.window.placeOrder();
  assert.equal(submitted, undefined);
  assert.match(app.element('deliveryResult').textContent, /Select your delivery area/);
  app.element('deliveryZone').value = 'mid';
  app.window.updateDeliveryZone();
  app.window.placeOrder();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(submitted.url, '/.netlify/functions/order');
  assert.equal(submitted.body.deliveryDistance, 'Local area');
  assert.equal(submitted.body.deliveryFee, 25);
  assert.equal(submitted.body.total, 65);
  assert.equal(submitted.body.address, '1 Example Street');
});

test('unconfirmed order keeps the cart', async () => {
  const app = createCheckout(() => Promise.resolve({ ok: true, json: async () => ({ success: false }) }));
  app.window.addToCart(3);
  app.element('checkoutName').value = 'Test customer';
  app.window.placeOrder();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.element('cartCount').textContent, 1);
  assert.match(app.alerts[0], /could not confirm/i);
});
