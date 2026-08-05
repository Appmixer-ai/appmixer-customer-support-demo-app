const test = require('node:test');
const assert = require('node:assert');
const moment = require('moment');
const { helperFn } = require('../src/formatTicketDate');

const helpers = { moment };

test('formats an ISO date with the given format', () => {
    const out = helperFn('2026-05-27', { hash: { format: 'DD.MM.YYYY' }, helpers });
    assert.strictEqual(out, '27.05.2026');
});

test('falls back to a default format when none is given', () => {
    const out = helperFn('2026-05-27T10:30:00Z', { hash: {}, helpers });
    assert.strictEqual(out, moment('2026-05-27T10:30:00Z').format('YYYY-MM-DD HH:mm'));
});

test('null / empty pass through unchanged', () => {
    assert.strictEqual(helperFn(null, { hash: { format: 'DD.MM.YYYY' }, helpers }), null);
    assert.strictEqual(helperFn('', { hash: { format: 'DD.MM.YYYY' }, helpers }), '');
});

test('an invalid date passes through unchanged', () => {
    assert.strictEqual(helperFn('not-a-date', { hash: { format: 'DD.MM.YYYY' }, helpers }), 'not-a-date');
});
