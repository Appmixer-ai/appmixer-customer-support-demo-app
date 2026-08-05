'use strict';
const { makeAuthenticatedRequest } = require('./commons');

/**
 * Factory function to create trigger components with consistent behavior
 * Eliminates duplicated code across NewTicket, NewCustomer, NewComment, NewTag, etc.
 *
 * @param {Object} config - Configuration object
 * @param {string} config.entityName - Name of the entity (e.g., 'Ticket', 'Customer')
 * @param {string} config.endpoint - API endpoint to fetch entities
 * @param {Function} config.transformFn - Function to transform entity data
 * @param {string} config.outputPort - Name of the output port (default: entity name lowercased)
 * @param {Function} [config.filterFn] - Optional custom filter function (default: timestamp-based)
 * @returns {Object} Trigger component with start and tick methods
 *
 * @example
 * const { transformTicket } = require('../../commons');
 * module.exports = createTrigger({
 *   entityName: 'Ticket',
 *   endpoint: '/api/tickets',
 *   transformFn: transformTicket
 * });
 */
function createTrigger(config) {
    const {
        entityName,
        endpoint,
        transformFn,
        outputPort = entityName.toLowerCase(),
        filterFn = null
    } = config;

    return {
        /**
         * Initialize trigger state on component start
         * Prevents processing historical data on first run
         */
        async start(context) {
            const state = await context.loadState() || {};
            if (!state.initialized) {
                await context.saveState({
                    initialized: true,
                    lastCheckTime: Date.now()
                });
                await context.log({ message: `${entityName}: Initialized with current timestamp. Will only process new items from now on.` });
            }
        },

        /**
         * Periodic tick to check for new entities
         * Filters by timestamp and sends only new items
         */
        async tick(context) {
            try {
                // Fetch all entities
                const response = await makeAuthenticatedRequest(context, {
                    method: 'GET',
                    endpoint: endpoint
                });

                const items = response.data;
                const state = await context.loadState() || {};
                const lastCheckTime = state.lastCheckTime || 0;
                const currentTime = Date.now();

                // Filter new items
                let newItems;
                if (filterFn) {
                    // Use custom filter function if provided
                    newItems = filterFn(items, lastCheckTime);
                } else {
                    // Default: filter by createdAt timestamp
                    newItems = items.filter(item => {
                        const itemTime = new Date(item.createdAt).getTime();
                        return itemTime > lastCheckTime;
                    });
                }

                await context.log({ message: `${entityName}: Found ${newItems.length} new item(s) since ${new Date(lastCheckTime).toISOString()}` });

                // Save updated state
                await context.saveState({
                    ...state,
                    lastCheckTime: currentTime
                });

                // Send each new item to output port
                for (const item of newItems) {
                    const transformedItem = transformFn(item);
                    await context.sendArray([transformedItem], outputPort);
                }
            } catch (error) {
                await context.log({ message: `${entityName}: Error fetching new items`, error: error.message });
                throw error;
            }
        }
    };
}

module.exports = { createTrigger };
