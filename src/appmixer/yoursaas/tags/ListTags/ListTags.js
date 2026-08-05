"use strict";

const { createListHandler } = require('../../listHandler');
const { transformTag } = require('../../commons');

/**
 * ListTags - Fetches all tags, optionally filtered by popularity
 * Refactored to use the listHandler factory for consistency and code reuse
 */
module.exports = createListHandler({
    entityName: 'Tags',
    endpoint: '/api/tags',
    transformFn: (tag) => ({
        ...transformTag(tag),
        id: tag.id || tag.name  // Fallback for id field
    }),
    outputPort: 'tags',
    buildEndpoint: (input) => {
        const { popular, limit } = input;
        const params = new URLSearchParams();
        if (popular) params.append('popular', 'true');
        if (limit) params.append('limit', limit);
        return `/api/tags${params.toString() ? '?' + params.toString() : ''}`;
    }
});
