"use strict";

const { createTrigger } = require('../../triggerBase');
const { transformTicket } = require('../../commons');

/**
 * NewTicket trigger - Emits new tickets as they are created
 * Refactored to use the triggerBase factory for consistency and code reuse
 */
module.exports = createTrigger({
    entityName: 'Ticket',
    endpoint: '/api/tickets',
    transformFn: transformTicket,
    outputPort: 'ticket'
});
