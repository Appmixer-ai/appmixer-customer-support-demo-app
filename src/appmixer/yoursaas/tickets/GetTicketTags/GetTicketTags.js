"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: `/api/tickets/tags?ticket_id=${encodeURIComponent(ticketId)}`
            });

            const tags = response.data;

            await context.sendArray([{
                ticketId: ticketId,
                tags: tags,
                count: tags.length
            }], 'tags');

        } catch (error) {
            await context.log({ message: 'Error fetching ticket tags', error: error.message });
            throw error;
        }
    }
};