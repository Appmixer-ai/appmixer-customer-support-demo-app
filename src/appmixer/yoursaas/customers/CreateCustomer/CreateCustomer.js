"use strict";

const { createCrudHandler } = require('../../crudHandler');
const { transformCustomer } = require('../../commons');

/**
 * CreateCustomer - Creates a new customer
 * Refactored to use the crudHandler factory for consistency and code reuse
 */
module.exports = createCrudHandler({
    operation: 'create',
    entityName: 'Customer',
    endpoint: '/api/customers',
    transformFn: transformCustomer,
    outputPort: 'customer',
    buildData: (input) => ({
        name: input.name,
        email: input.email,
        avatar: input.avatar
    })
});
