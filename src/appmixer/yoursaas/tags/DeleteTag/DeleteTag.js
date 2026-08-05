"use strict";

const { createCrudHandler } = require('../../crudHandler');

/**
 * DeleteTag - Deletes a tag
 * Refactored to use the crudHandler factory for consistency and code reuse
 */
module.exports = createCrudHandler({
    operation: 'delete',
    entityName: 'Tag',
    endpoint: (input) => `/api/tags?id=${encodeURIComponent(input.tagId)}`,
    transformFn: (data) => data, // No transform needed for delete
    outputPort: 'result',
    buildOutput: (input) => ({
        tagId: input.tagId,
        deleted: true,
        deletedAt: new Date().toISOString()
    })
});
