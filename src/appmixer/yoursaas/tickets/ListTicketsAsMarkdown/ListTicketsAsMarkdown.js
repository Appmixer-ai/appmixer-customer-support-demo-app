"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

/**
 * ListTicketsAsMarkdown - Fetches all tickets with comments formatted as Markdown
 * Designed for LLM consumption with clear structure and delimiters
 */
module.exports = {
    async receive(context) {
        try {
            const input = context.messages.in.content;

            // Build endpoint with filters
            let endpoint = '/api/tickets';
            const params = [];

            if (input.tags) {
                params.push(`tags=${encodeURIComponent(input.tags)}`);
            }
            if (input.status) {
                params.push(`status=${encodeURIComponent(input.status)}`);
            }
            if (input.priority) {
                params.push(`priority=${encodeURIComponent(input.priority)}`);
            }

            if (params.length > 0) {
                endpoint += '?' + params.join('&');
            }

            // Fetch all tickets
            const ticketsResponse = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: endpoint
            });

            const tickets = ticketsResponse.data;
            const markdownParts = [];

            // Process each ticket
            for (const ticket of tickets) {
                const ticketMarkdown = await this.formatTicketAsMarkdown(context, ticket);
                markdownParts.push(ticketMarkdown);
            }

            // Join all tickets with clear delimiter
            const fullMarkdown = markdownParts.join('\n\n---END_OF_TICKET---\n\n');

            // Output the markdown
            await context.sendArray([{
                markdown: fullMarkdown,
                ticketCount: tickets.length
            }], 'markdown');

        } catch (error) {
            await context.log({ message: 'ListTicketsAsMarkdown: Error fetching tickets', error: error.message });
            throw error;
        }
    },

    /**
     * Formats a single ticket with all its comments as Markdown
     * @param {Object} context - Appmixer context
     * @param {Object} ticket - Ticket data
     * @returns {Promise<string>} Formatted markdown string
     */
    async formatTicketAsMarkdown(context, ticket) {
        const parts = [];

        // Header section
        parts.push(`# Ticket #${ticket.id}: ${ticket.title}`);
        parts.push('');
        parts.push('## Ticket Information');
        parts.push(`- **ID**: ${ticket.id}`);
        parts.push(`- **Title**: ${ticket.title}`);
        parts.push(`- **Priority**: ${ticket.priority || 'N/A'}`);
        parts.push(`- **Status**: ${ticket.status || 'N/A'}`);

        // Customer information
        if (ticket.customer) {
            if (typeof ticket.customer === 'object') {
                parts.push(`- **Customer**: ${ticket.customer.name || 'N/A'} (${ticket.customer.email || 'N/A'})`);
            } else {
                parts.push(`- **Customer**: ${ticket.customer}`);
            }
        } else {
            parts.push('- **Customer**: N/A');
        }

        // Assignee information
        if (ticket.assignee) {
            if (typeof ticket.assignee === 'object') {
                parts.push(`- **Assignee**: ${ticket.assignee.name || 'N/A'}`);
            } else {
                parts.push(`- **Assignee**: ${ticket.assignee}`);
            }
        } else {
            parts.push('- **Assignee**: Unassigned');
        }

        // Tags
        if (ticket.tags && ticket.tags.length > 0) {
            parts.push(`- **Tags**: ${ticket.tags.join(', ')}`);
        } else {
            parts.push('- **Tags**: None');
        }

        // Timestamps
        parts.push(`- **Created At**: ${ticket.createdAt || 'N/A'}`);
        parts.push(`- **Updated At**: ${ticket.updatedAt || 'N/A'}`);
        parts.push('');

        // Description section
        parts.push('## Description');
        parts.push('');
        parts.push(ticket.description || 'No description provided.');
        parts.push('');

        // Fetch and format comments
        try {
            const commentsResponse = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: `/api/comments?ticket_id=${ticket.id}`
            });

            const comments = commentsResponse.data;

            if (comments && comments.length > 0) {
                parts.push('## Comments and Notes');
                parts.push('');

                // Sort comments by creation date (oldest first)
                const sortedComments = comments.sort((a, b) => {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

                for (const comment of sortedComments) {
                    const commentType = comment.isInternal ? '[INTERNAL NOTE]' : '[PUBLIC COMMENT]';
                    parts.push(`### ${commentType} ${comment.authorName || 'Unknown'} - ${comment.createdAt || 'N/A'}`);
                    parts.push('');
                    parts.push(comment.content || 'No content');
                    parts.push('');
                }
            } else {
                parts.push('## Comments and Notes');
                parts.push('');
                parts.push('No comments or notes available.');
                parts.push('');
            }
        } catch (error) {
            await context.log({ message: `Warning: Could not fetch comments for ticket ${ticket.id}`, error: error.message });
            parts.push('## Comments and Notes');
            parts.push('');
            parts.push('Error fetching comments.');
            parts.push('');
        }

        return parts.join('\n');
    }
};
