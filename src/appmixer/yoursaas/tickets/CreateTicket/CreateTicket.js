"use strict";

const { makeAuthenticatedRequest, transformTicket, processTags } = require('../../commons');

module.exports = {

    async receive(context) {
        const { title, description, priority, customer_name, customer_email, tags } = context.messages.in.content;

        try {
            const ticketData = {
                title,
                description,
                priority: priority || 'medium',
                customer_name,
                customer_email
            };

            const response = await makeAuthenticatedRequest(context, {
                method: 'POST',
                endpoint: '/api/tickets',
                data: ticketData,
                expectedStatus: [201]
            });

            let ticket = response.data;

            // Add tags if provided
            const processedTags = processTags(tags);
            if (processedTags.length > 0) {
                const tagResponse = await makeAuthenticatedRequest(context, {
                    method: 'POST',
                    endpoint: '/api/tickets/tags',
                    data: {
                        ticket_id: ticket.id,
                        tags: processedTags
                    }
                });

                if (tagResponse.data && tagResponse.data.tags) {
                    ticket.tags = tagResponse.data.tags;
                }
            }

            const transformedTicket = transformTicket(ticket);

            await context.sendArray([transformedTicket], 'ticket');

        } catch (error) {
            await context.log({ message: 'Error creating ticket', error: error.message });
            throw error;
        }
    }
};