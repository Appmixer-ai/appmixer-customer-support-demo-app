"use strict";

const { makeAuthenticatedRequest, transformComment } = require('../../commons');

module.exports = {

    /**
     * Called when the flow starts. Initialize state to prevent processing historical comments.
     * @param {Context} context
     */
    async start(context) {
        const state = await context.loadState() || {};

        // If this is the very first time the component runs, set lastCheckTime to now
        // This prevents processing all historical comments
        if (!state.initialized) {
            await context.saveState({
                initialized: true,
                lastCheckTime: Date.now()
            });
            await context.log({ message: 'NewComment: Initialized with current timestamp. Will only process new comments from now on.' });
        }
    },

    /**
     * Polls for new comments and emits them through the output port.
     * @param {Context} context
     */
    async tick(context) {
        try {
            // Get all tickets first to get comments for each
            const ticketsResponse = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint: '/api/tickets'
            });

            const tickets = ticketsResponse.data;
            const allComments = [];

            // Get comments for each ticket
            for (const ticket of tickets) {
                try {
                    const commentsResponse = await makeAuthenticatedRequest(context, {
                        method: 'GET',
                        endpoint: `/api/comments?ticket_id=${ticket.id}`
                    });

                    if (commentsResponse.data) {
                        const comments = commentsResponse.data.map(comment => ({
                            ...transformComment(comment),
                            ticket: {
                                id: ticket.id,
                                title: ticket.title,
                                status: ticket.status
                            }
                        }));
                        allComments.push(...comments);
                    }
                } catch (error) {
                    // Continue if comments for a specific ticket can't be fetched
                    await context.log({ message: `Error fetching comments for ticket ${ticket.id}`, error: error.message });
                }
            }

            // Check for new comments since last run
            const state = await context.loadState() || {};
            const lastCheckTime = state.lastCheckTime || 0;
            const currentTime = Date.now();

            const newComments = allComments.filter(comment => {
                const commentTime = new Date(comment.createdAt).getTime();
                return commentTime > lastCheckTime;
            });

            await context.log({ message: `Found ${newComments.length} new comment(s) since ${new Date(lastCheckTime).toISOString()}` });

            // Save current time for next check
            await context.saveState({ ...state, lastCheckTime: currentTime });

            // Send each new comment to output port
            for (const comment of newComments) {
                await context.sendArray([comment], 'comment');
            }

        } catch (error) {
            await context.log({ message: 'Error fetching new comments', error: error.message });
            throw error;
        }
    }
};