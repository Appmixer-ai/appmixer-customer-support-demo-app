"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

module.exports = {

    async receive(context) {
        const { limit } = context.messages.in.content;

        try {
            const endpoint = `/api/tickets?action=popular-tags${limit ? `&limit=${limit}` : ''}`;

            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint
            });

            const popularTags = response.data;

            await context.sendArray([{
                popularTags: popularTags.map(tag => ({
                    name: tag.name,
                    count: tag.count
                })),
                total: popularTags.length
            }], 'tags');

        } catch (error) {
            await context.log({ message: 'Error fetching popular tags', error: error.message });
            throw error;
        }
    }
};