"use strict";

const { createCrudHandler } = require('../../crudHandler');

/**
 * DeleteComment - Deletes a comment from a ticket
 * Refactored to use the crudHandler factory for consistency and code reuse
 */
module.exports = createCrudHandler({
    operation: 'delete',
    entityName: 'Comment',
    endpoint: (input) => `/api/comments?ticket_id=${input.ticketId}&comment_id=${input.commentId}`,
    transformFn: (data) => data, // No transform needed for delete
    outputPort: 'result',
    buildOutput: (input) => ({
        deleted: true,
        commentId: input.commentId,
        ticketId: input.ticketId
    })
});
