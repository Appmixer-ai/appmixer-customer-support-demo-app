"use strict";

const { makeAuthenticatedRequest, transformComment } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId, content, isInternal } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'POST',
                endpoint: `/api/comments?ticket_id=${ticketId}`,
                data: {
                    content,
                    is_internal: isInternal || false
                },
                expectedStatus: [201]
            });

            const comment = transformComment(response.data);

            await context.sendArray([comment], 'comment');

        } catch (error) {
            await context.log({ message: 'Error adding comment', error: error.message });
            throw error;
        }
    }
};