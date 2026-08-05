'use strict';
const { makeAuthenticatedRequest } = require('./commons');

/**
 * Factory function to create list/fetch components with consistent behavior
 * Eliminates duplicated code across ListTickets, ListCustomers, ListTags, etc.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.entityName - Name of the entity (e.g., 'Tickets', 'Customers')
 * @param {string} config.endpoint - API endpoint to fetch entities
 * @param {Function} config.transformFn - Function to transform entity data
 * @param {string} [config.outputPort='result'] - Name of the output port
 * @param {Function} [config.buildEndpoint] - Optional function to build endpoint from input (params, filters)
 * @param {Function} [config.addMetadata] - Optional function to add metadata to output
 * @returns {Object} List component with receive method
 *
 * @example
 * const { transformTicket } = require('../../commons');
 * module.exports = createListHandler({
 *   entityName: 'Tickets',
 *   endpoint: '/api/tickets',
 *   transformFn: transformTicket
 * });
 */
function createListHandler(config) {
    const {
        entityName,
        endpoint,
        transformFn,
        outputPort = 'result',
        buildEndpoint = null,
        addMetadata = null
    } = config;

    return {
        /**
         * Fetch and return list of entities
         */
        async receive(context) {
            try {
                // Build endpoint if custom function provided, otherwise use static endpoint
                const apiEndpoint = buildEndpoint
                    ? buildEndpoint(context.messages.in.content)
                    : endpoint;

                // Fetch data from API
                const response = await makeAuthenticatedRequest(context, {
                    method: 'GET',
                    endpoint: apiEndpoint
                });

                const items = response.data;

                // Transform items
                const transformedItems = items.map(item => transformFn(item));

                // Build output object
                const output = {
                    items: transformedItems,
                    count: transformedItems.length
                };

                // Add custom metadata if function provided
                if (addMetadata) {
                    Object.assign(output, addMetadata(items, context));
                }

                await context.sendArray([output], outputPort);

            } catch (error) {
                await context.log({ message: `${entityName}: Error fetching items`, error: error.message });
                throw error;
            }
        }
    };
}

module.exports = { createListHandler };
