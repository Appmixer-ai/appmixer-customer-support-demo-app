"use strict";

const { createTrigger } = require('../../triggerBase');
const { transformCustomer } = require('../../commons');

/**
 * NewCustomer trigger - Emits new customers as they are created
 * Refactored to use the triggerBase factory for consistency and code reuse
 *
 * Note: Customers use 'created_at' field instead of 'createdAt'
 */
module.exports = createTrigger({
    entityName: 'Customer',
    endpoint: '/api/customers',
    transformFn: transformCustomer,
    outputPort: 'customer',
    filterFn: (customers, lastCheckTime) => {
        return customers.filter(customer => {
            const customerTime = new Date(customer.created_at).getTime();
            return customerTime > lastCheckTime;
        });
    }
});
