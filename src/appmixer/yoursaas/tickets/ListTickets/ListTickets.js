"use strict";

const { createListHandler } = require('../../listHandler');
const { transformTicket } = require('../../commons');

/**
 * ListTickets - Fetches all tickets, optionally filtered by tags
 * Refactored to use the listHandler factory for consistency and code reuse
 */
module.exports = createListHandler({
    entityName: 'Tickets',
    endpoint: '/api/tickets',
    transformFn: transformTicket,
    outputPort: 'tickets',
    buildEndpoint: (input) => {
        const { tags } = input;
        return `/api/tickets${tags ? `?tags=${encodeURIComponent(tags)}` : ''}`;
    }
});
