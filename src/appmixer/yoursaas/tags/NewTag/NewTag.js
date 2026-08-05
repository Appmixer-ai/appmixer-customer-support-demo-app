"use strict";

const { createTrigger } = require('../../triggerBase');
const { transformTag } = require('../../commons');

/**
 * NewTag trigger - Emits new tags as they are created
 * Refactored to use the triggerBase factory for consistency and code reuse
 */
module.exports = createTrigger({
    entityName: 'Tag',
    endpoint: '/api/tags',
    transformFn: transformTag,
    outputPort: 'tag'
});
