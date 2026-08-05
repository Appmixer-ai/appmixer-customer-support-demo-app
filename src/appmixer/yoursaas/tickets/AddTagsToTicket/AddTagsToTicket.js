"use strict";

const { makeAuthenticatedRequest, processTags } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId, tags } = context.messages.in.content;

        try {
            const tagArray = processTags(tags);

            const response = await makeAuthenticatedRequest(context, {
                method: 'POST',
                endpoint: '/api/tickets/tags',
                data: {
                    ticket_id: ticketId,
                    tags: tagArray
                }
            });

            const result = response.data;

            await context.sendArray([{
                ticketId: result.ticketId,
                tags: result.tags,
                addedTags: result.addedTags,
                success: true
            }], 'result');

        } catch (error) {
            await context.log({ message: 'Error adding tags to ticket', error: error.message });
            throw error;
        }
    }
};