"use strict";

const { makeAuthenticatedRequest } = require('../../commons');

module.exports = {

    async receive(context) {
        const { period, limit, action } = context.messages.in.content;

        try {
            const params = new URLSearchParams();

            if (action) params.append('action', action);
            if (period) params.append('period', period);
            if (limit) params.append('limit', limit);

            const endpoint = `/api/tags/stats${params.toString() ? '?' + params.toString() : ''}`;

            const response = await makeAuthenticatedRequest(context, {
                method: 'GET',
                endpoint
            });

            const stats = response.data;

            if (action === 'trends') {
                await context.sendArray([{
                    period: stats.period,
                    dateRange: stats.dateRange,
                    trends: stats.trends,
                    summary: stats.summary
                }], 'trends');
            } else {
                await context.sendArray([{
                    overview: stats.overview,
                    distribution: stats.distribution,
                    mostUsed: stats.mostUsed,
                    leastUsed: stats.leastUsed,
                    byStatus: stats.byStatus,
                    byPriority: stats.byPriority
                }], 'stats');
            }

        } catch (error) {
            await context.log({ message: 'Error fetching tag stats', error: error.message });
            throw error;
        }
    }
};