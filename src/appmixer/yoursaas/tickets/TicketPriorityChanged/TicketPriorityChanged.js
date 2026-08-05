"use strict";

const { makeAuthenticatedRequest, transformTicket } = require('../../commons');

module.exports = {

    async tick(context) {
        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: '/api/tickets'
            });

            const tickets = response.data;
            const state = await context.loadState() || {};
            const lastTicketPriorities = state.ticketPriorities || {};
            const newTicketPriorities = {};

            for (const ticket of tickets) {
                const ticketId = ticket.id;
                const currentPriority = ticket.priority;
                const lastPriority = lastTicketPriorities[ticketId];

                newTicketPriorities[ticketId] = currentPriority;

                if (lastPriority && lastPriority !== currentPriority) {
                    await context.sendArray([{
                        ...transformTicket(ticket),
                        previousPriority: lastPriority,
                        currentPriority: currentPriority
                    }], 'ticket');
                }
            }

            await context.saveState({ ticketPriorities: newTicketPriorities });

        } catch (error) {
            await context.log({ message: 'Error checking ticket priority changes', error: error.message });
            throw error;
        }
    }
};