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
            const lastTicketStates = state.ticketStates || {};
            const newTicketStates = {};

            for (const ticket of tickets) {
                const ticketId = ticket.id;
                const currentStatus = ticket.status;
                const lastStatus = lastTicketStates[ticketId];

                newTicketStates[ticketId] = currentStatus;

                if (lastStatus && lastStatus !== currentStatus) {
                    await context.sendArray([{
                        ...transformTicket(ticket),
                        previousStatus: lastStatus,
                        currentStatus: currentStatus
                    }], 'ticket');
                }
            }

            await context.saveState({ ticketStates: newTicketStates });

        } catch (error) {
            await context.log({ message: 'Error checking ticket status changes', error: error.message });
            throw error;
        }
    }
};