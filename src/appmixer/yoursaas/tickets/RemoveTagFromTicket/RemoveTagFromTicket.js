"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId, tagId } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'DELETE',
                endpoint: `/api/tickets/tags?ticket_id=${encodeURIComponent(ticketId)}&tag_id=${encodeURIComponent(tagId)}`
            });

            const result = response.data;

            await context.sendArray([{
                ticketId: result.ticketId,
                removedTag: result.removedTag,
                remainingTags: result.remainingTags,
                success: true
            }], 'result');

        } catch (error) {
            await context.log({ message: 'Error removing tag from ticket', error: error.message });
            throw error;
        }
    }
};