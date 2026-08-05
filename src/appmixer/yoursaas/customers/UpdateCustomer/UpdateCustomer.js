"use strict";

const { createCrudHandler } = require('../../crudHandler');
const { transformCustomer } = require('../../commons');

/**
 * UpdateCustomer - Updates an existing customer
 * Refactored to use the crudHandler factory for consistency and code reuse
 */
module.exports = createCrudHandler({
    operation: 'update',
    entityName: 'Customer',
    endpoint: (input) => `/api/customers?id=${input.customerId}`,
    transformFn: transformCustomer,
    outputPort: 'customer',
    buildData: (input) => {
        const { customerId, ...updates } = input;
        return updates;
    }
});
