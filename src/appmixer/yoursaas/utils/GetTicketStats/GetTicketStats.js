"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

module.exports = {

    async receive(context) {
        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: '/api/tickets?action=stats'
            });

            const stats = response.data;

            await context.sendArray([{
                totalTickets: stats.totalTickets,
                newTickets: stats.newTickets,
                inProgressTickets: stats.inProgressTickets,
                resolvedTickets: stats.resolvedTickets,
                avgResponseTime: stats.avgResponseTime,
                customerSatisfaction: stats.customerSatisfaction
            }], 'stats');

        } catch (error) {
            await context.log({ message: 'Error fetching ticket stats', error: error.message });
            throw error;
        }
    }
};