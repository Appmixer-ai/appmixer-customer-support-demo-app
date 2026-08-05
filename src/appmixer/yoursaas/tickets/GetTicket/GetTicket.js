"use strict";

const { createCrudHandler } = require('../../crudHandler');
const { transformTicket } = require('../../commons');

/**
 * GetTicket - Fetches a single ticket by ID
 * Refactored to use the crudHandler factory for consistency and code reuse
 */
module.exports = createCrudHandler({
    operation: 'get',
    entityName: 'Ticket',
    endpoint: (input) => `/api/tickets?id=${input.ticketId}`,
    transformFn: transformTicket,
    outputPort: 'ticket'
});
