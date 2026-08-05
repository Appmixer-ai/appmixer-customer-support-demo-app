const test = require('node:test');
const assert = require('node:assert');
const { helperFn } = require('../src/maskEmail');

test('masks a normal email local part', () => {
    assert.strictEqual(helperFn('john.doe@acme.com'), 'j****e@acme.com');
});

test('masks a short local part', () => {
    assert.strictEqual(helperFn('ab@x.com'), 'a*@x.com');
});

test('a non-string passes through unchanged', () => {
    assert.strictEqual(helperFn(42), 42);
    assert.strictEqual(helperFn(null), null);
});

test('a string without "@" passes through unchanged', () => {
    assert.strictEqual(helperFn('nope'), 'nope');
});
