"use strict";

const { makeAuthenticatedRequest, transformTicket } = require('../../commons');

module.exports = {

    async receive(context) {
        const { customerId } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: `/api/tickets?customer_id=${customerId}`
            });

            const tickets = response.data;

            await context.sendArray([{
                tickets: tickets.map(ticket => transformTicket(ticket)),
                count: tickets.length,
                customerId
            }], 'tickets');

        } catch (error) {
            await context.log({ message: 'Error fetching customer tickets', error: error.message });
            throw error;
        }
    }
};