'use strict';
const { makeAuthenticatedRequest } = require('./commons');

/**
 * Factory function to create CRUD operation components with consistent behavior
 * Eliminates duplicated code across Create/Get/Update/Delete components
 *
 * @param {Object} config - Configuration object
 * @param {string} config.operation - CRUD operation: 'create', 'get', 'update', 'delete'
 * @param {string} config.entityName - Name of the entity (e.g., 'Ticket', 'Customer')
 * @param {string|Function} config.endpoint - Static endpoint or function to build endpoint from input
 * @param {string} [config.method] - HTTP method (default: inferred from operation)
 * @param {Function} config.transformFn - Function to transform entity data
 * @param {string} [config.outputPort] - Name of the output port (default: entity name lowercased)
 * @param {number[]} [config.expectedStatus] - Expected HTTP status codes
 * @param {Function} [config.buildData] - Optional function to build request data from input
 * @param {Function} [config.buildOutput] - Optional function to build custom output
 * @returns {Object} CRUD component with receive method
 *
 * @example
 * // Create Ticket
 * module.exports = createCrudHandler({
 *   operation: 'create',
 *   entityName: 'Ticket',
 *   endpoint: '/api/tickets',
 *   transformFn: transformTicket
 * });
 *
 * @example
 * // Get Ticket by ID
 * module.exports = createCrudHandler({
 *   operation: 'get',
 *   entityName: 'Ticket',
 *   endpoint: (input) => `/api/tickets?id=${input.ticketId}`,
 *   transformFn: transformTicket
 * });
 */
function createCrudHandler(config) {
    const {
        operation,
        entityName,
        endpoint,
        transformFn,
        outputPort = entityName.toLowerCase(),
        buildData = null,
        buildOutput = null
    } = config;

    // Infer HTTP method from operation if not specified
    const methodMap = {
        create: 'POST',
        get: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
    };

    const method = config.method || methodMap[operation] || 'GET';

    // Infer expected status codes
    const defaultExpectedStatus = {
        create: [201],
        get: [200],
        update: [200],
        delete: [204]
    };

    const expectedStatus = config.expectedStatus || defaultExpectedStatus[operation] || [200];

    return {
        /**
         * Perform CRUD operation
         */
        async receive(context) {
            const input = context.messages.in.content;

            try {
                // Build endpoint if it's a function, otherwise use static endpoint
                const apiEndpoint = typeof endpoint === 'function'
                    ? endpoint(input)
                    : endpoint;

                // Build request data if needed (for POST/PATCH)
                const requestData = buildData
                    ? buildData(input)
                    : (method === 'POST' || method === 'PATCH') ? input : null;

                // Make API request
                const response = await makeAuthenticatedRequest(context, {
                    method,
                    endpoint: apiEndpoint,
                    data: requestData,
                    expectedStatus
                });

                // For DELETE operations, build custom output if no response data
                if (method === 'DELETE') {
                    const output = buildOutput
                        ? buildOutput(input, response)
                        : {
                            [`${entityName.toLowerCase()}Id`]: input[`${entityName.toLowerCase()}Id`] || input.id,
                            deleted: true,
                            deletedAt: new Date().toISOString()
                        };

                    await context.sendArray([output], outputPort);
                } else {
                    // Transform and send response data
                    const transformedData = transformFn(response.data);

                    const output = buildOutput
                        ? buildOutput(transformedData, response)
                        : transformedData;

                    await context.sendArray([output], outputPort);
                }

            } catch (error) {
                await context.log({ message: `${entityName}: Error during ${operation} operation`, error: error.message });
                throw error;
            }
        }
    };
}

module.exports = { createCrudHandler };
