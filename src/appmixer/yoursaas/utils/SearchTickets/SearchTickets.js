"use strict";

const { makeAuthenticatedRequest, transformTicket } = require('../../commons');

module.exports = {

    async receive(context) {
        const { query, status, priority, assignee } = context.messages.in.content;

        try {
            // Build query parameters
            const searchParams = new URLSearchParams();
            if (query) searchParams.append('search', query);
            if (status) searchParams.append('status', status);
            if (priority) searchParams.append('priority', priority);
            if (assignee) searchParams.append('assignee', assignee);

            const endpoint = `/api/tickets${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint
            });

            const tickets = response.data;

            await context.sendArray([{
                tickets: tickets.map(ticket => transformTicket(ticket)),
                count: tickets.length,
                query: query || '',
                filters: { status, priority, assignee }
            }], 'results');

        } catch (error) {
            await context.log({ message: 'Error searching tickets', error: error.message });
            throw error;
        }
    }
};