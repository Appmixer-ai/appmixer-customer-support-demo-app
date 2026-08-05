"use strict";

const { makeAuthenticatedRequest, transformTag } = require('../../commons');

module.exports = {

    async receive(context) {
        const { name, color, description } = context.messages.in.content;

        try {
            const response = await makeAuthenticatedRequest(context, {
                method: 'POST',
                endpoint: '/api/tags',
                data: { name, color, description },
                expectedStatus: [201]
            });

            const tag = transformTag(response.data);

            await context.sendArray([tag], 'tag');

        } catch (error) {
            await context.log({ message: 'Error creating tag', error: error.message });
            throw error;
        }
    }
};