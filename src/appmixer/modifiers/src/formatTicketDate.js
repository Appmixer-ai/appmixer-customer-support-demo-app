/**
 * yoursaas_formatTicketDate
 *
 * Formats a ticket date/timestamp using a moment.js format string.
 * Used in flows to render created/updated timestamps in a human-friendly way.
 *
 * IMPORTANT (see modifiers/README.md §"Constraints"): `helperFn` is serialized
 * via fn.toString() and runs isolated in the Appmixer engine. It must be
 * self-contained — it may only use `value`, its own `arguments` and the
 * provided `helpers` (here `helpers.moment`). No closures, no require().
 */
module.exports = {
    key: 'yoursaas_formatTicketDate',
    label: 'Format Ticket Date',
    category: ['support'],
    description: 'Formats a ticket date/timestamp using the given moment.js format (e.g. DD.MM.YYYY HH:mm). Returns the input unchanged if it is empty or not a valid date.',
    arguments: [
        { name: 'format', type: 'string', isHash: true }
    ],
    returns: { type: 'string' },
    helperFn: function (value, { hash: { format }, helpers }) {
        if (value === null || value === undefined || value === '') {
            return value;
        }
        var m = helpers && helpers.moment ? helpers.moment(value) : null;
        if (!m || !m.isValid()) {
            return value;
        }
        return m.format(format || 'YYYY-MM-DD HH:mm');
    }
};
