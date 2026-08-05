"use strict";

const { makeAuthenticatedRequest, transformComment } = require('../../commons');

module.exports = {

    async receive(context) {
        const { ticketId, commentId, content, isInternal } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'PATCH',
                endpoint: `/api/comments?ticket_id=${ticketId}&comment_id=${commentId}`,
                data: {
                    content,
                    is_internal: isInternal
                }
            });

            const comment = transformComment(response.data);

            await context.sendArray([comment], 'comment');

        } catch (error) {
            await context.log({ message: 'Error updating comment', error: error.message });
            throw error;
        }
    }
};