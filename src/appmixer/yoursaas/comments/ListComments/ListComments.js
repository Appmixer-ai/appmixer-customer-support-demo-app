"use strict";

const { createListHandler } = require('../../listHandler');
const { transformComment } = require('../../commons');

/**
 * ListComments - Fetches all comments for a specific ticket
 * Refactored to use the listHandler factory for consistency and code reuse
 */
module.exports = createListHandler({
    entityName: 'Comments',
    endpoint: '/api/comments',
    transformFn: transformComment,
    outputPort: 'comments',
    buildEndpoint: (input) => {
        const { ticketId } = input;
        return `/api/comments?ticket_id=${ticketId}`;
    },
    addMetadata: (items, context) => ({
        ticketId: context.messages.in.content.ticketId
    })
});
