"use strict";

const { createListHandler } = require('../../listHandler');
const { transformCustomer } = require('../../commons');

/**
 * ListCustomers - Fetches all customers
 * Refactored to use the listHandler factory for consistency and code reuse
 */
module.exports = createListHandler({
    entityName: 'Customers',
    endpoint: '/api/customers',
    transformFn: transformCustomer,
    outputPort: 'customers'
});
