/**
 * yoursaas_maskEmail
 *
 * Masks the local part of an email address for privacy when displaying
 * customer contacts in logs, notifications or escalation messages.
 *   john.doe@acme.com  ->  j****e@acme.com
 *   ab@x.com           ->  a*@x.com
 *
 * Self-contained (see formatTicketDate.js header): uses only `value`.
 * Returns the input unchanged if it is not a string or has no '@'.
 */
module.exports = {
    key: 'yoursaas_maskEmail',
    label: 'Mask Email',
    category: ['support'],
    description: 'Masks the local part of an email address for privacy, e.g. john.doe@acme.com -> j****e@acme.com. Returns the input unchanged if it is not a valid email string.',
    arguments: [],
    returns: { type: 'string' },
    helperFn: function (value) {
        if (typeof value !== 'string') {
            return value;
        }
        var at = value.indexOf('@');
        if (at < 1) {
            return value;
        }
        var local = value.slice(0, at);
        var domain = value.slice(at);
        if (local.length <= 2) {
            return local.charAt(0) + '*' + domain;
        }
        return local.charAt(0) + '****' + local.charAt(local.length - 1) + domain;
    }
};
