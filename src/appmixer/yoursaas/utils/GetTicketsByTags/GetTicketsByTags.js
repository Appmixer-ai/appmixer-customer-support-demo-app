"use strict";

const { makeAuthenticatedRequest, transformTicket, processTags } = require('../../commons');

module.exports = {

    async receive(context) {
        const { tags, matchMode } = context.messages.in.content;

        try {
            const tagArray = processTags(tags);

            if (tagArray.length === 0) {
                throw new Error('At least one tag must be provided');
            }

            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: `/api/tickets?tags=${encodeURIComponent(tagArray.join(','))}`
            });

            let tickets = response.data;

            // Apply additional filtering for "all" match mode
            if (matchMode === 'all') {
                tickets = tickets.filter(ticket => {
                    if (!Array.isArray(ticket.tags)) return false;
                    return tagArray.every(tag => ticket.tags.includes(tag));
                });
            }

            // Group tickets by tags for analysis
            const tagGroups = {};
            tagArray.forEach(tag => {
                tagGroups[tag] = tickets.filter(ticket =>
                    Array.isArray(ticket.tags) && ticket.tags.includes(tag)
                );
            });

            await context.sendArray([{
                tickets: tickets.map(ticket => transformTicket(ticket)),
                totalCount: tickets.length,
                searchTags: tagArray,
                matchMode: matchMode || 'any',
                tagGroups: Object.keys(tagGroups).map(tag => ({
                    tag,
                    count: tagGroups[tag].length,
                    tickets: tagGroups[tag].map(t => t.id)
                }))
            }], 'results');

        } catch (error) {
            await context.log({ message: 'Error fetching tickets by tags', error: error.message });
            throw error;
        }
    }
};