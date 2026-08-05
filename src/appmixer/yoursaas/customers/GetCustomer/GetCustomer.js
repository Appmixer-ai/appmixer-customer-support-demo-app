"use strict";

const { createCrudHandler } = require('../../crudHandler');
const { transformCustomer } = require('../../commons');

/**
 * GetCustomer - Fetches a single customer by ID or email
 * Refactored to use the crudHandler factory for consistency and code reuse
 * Priority: customerId takes priority over email if both are provided
 */
module.exports = createCrudHandler({
    operation: 'get',
    entityName: 'Customer',
    endpoint: (input) => {
        // Priority: customerId first, then email
        if (input.customerId) {
            return `/api/customers?id=${encodeURIComponent(input.customerId)}`;
        } else if (input.email) {
            return `/api/customers?email=${encodeURIComponent(input.email)}`;
        } else {
            throw new Error('Either customerId or email must be provided');
        }
    },
    transformFn: transformCustomer,
    outputPort: 'customer'
});
