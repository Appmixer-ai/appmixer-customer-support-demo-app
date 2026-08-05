"use strict";

const { makeAuthenticatedRequest, transformTicket, processTags } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId, tags, ...updates } = context.messages.in.content;

        try {
            // Process tags if provided
            if (tags) {
                updates.tags = processTags(tags);
            }

            const response = await makeAuthenticatedRequest(context, {
                method: 'PATCH',
                endpoint: `/api/tickets?id=${ticketId}`,
                data: updates
            });

            const ticket = transformTicket(response.data);

            await context.sendArray([ticket], 'ticket');

        } catch (error) {
            await context.log({ message: 'Error updating ticket', error: error.message });
            throw error;
        }
    }
};