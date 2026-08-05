"use strict";

const { makeAuthenticatedRequest, transformTicket } = require('../../commons');

module.exports = {

    /**
     * Called when the flow starts. Initialize state to prevent processing historical tagged tickets.
     * @param {Context} context
     */
    async start(context) {
        const state = await context.loadState() || {};

        // If this is the very first time the component runs, set lastCheckTime to now
        // This prevents processing all historical tagged tickets
        if (!state.initialized) {
            await context.saveState({
                initialized: true,
                lastCheckTime: Date.now()
            });
            await context.log({ message: 'TicketTagged: Initialized with current timestamp. Will only process newly tagged tickets from now on.' });
        }
    },

    /**
     * Polls for recently tagged tickets and emits them through the output port.
     * @param {Context} context
     */
    async tick(context) {
        try {
            // Get all tickets from the API
            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: '/api/tickets'
            });

            const tickets = response.data;

            // Check for recently tagged tickets since last run
            const state = await context.loadState() || {};
            const lastCheckTime = state.lastCheckTime || 0;
            const currentTime = Date.now();

            const recentlyTaggedTickets = tickets.filter(ticket => {
                const ticketTime = new Date(ticket.updatedAt).getTime();
                return ticket.tags && ticket.tags.length > 0 && ticketTime > lastCheckTime;
            });

            await context.log({ message: `Found ${recentlyTaggedTickets.length} recently tagged ticket(s) since ${new Date(lastCheckTime).toISOString()}` });

            // Save current time for next check
            await context.saveState({ ...state, lastCheckTime: currentTime });

            // Send each recently tagged ticket to output port
            for (const ticket of recentlyTaggedTickets) {
                await context.sendArray([transformTicket(ticket)], 'ticket');
            }

        } catch (error) {
            await context.log({ message: 'Error fetching recently tagged tickets', error: error.message });
            throw error;
        }
    }
};