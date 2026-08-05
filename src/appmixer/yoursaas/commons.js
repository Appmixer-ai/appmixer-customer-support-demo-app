"use strict";

/**
 * Common utilities for YourSaaS Appmixer components
 */

/**
 * Creates standardized headers for API requests
 * @param {Object} auth - Authentication object from context
 * @param {string} auth.apiKey - API key
 * @param {string} [auth.userId] - Optional user ID
 * @returns {Object} Headers object
 */
function createHeaders(auth) {
    const { apiKey, userId } = auth;

    const headers = {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
    };

    if (userId) {
        headers['X-User-Id'] = userId;
    }

    return headers;
}

/**
 * Makes an authenticated API request with standardized error handling
 * @param {Object} context - Appmixer context
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method
 * @param {string} options.endpoint - API endpoint (relative to baseUrl)
 * @param {Object} [options.data] - Request data
 * @param {number[]} [options.expectedStatus] - Expected status codes
 * @returns {Promise<Object>} Response data
 */
async function makeAuthenticatedRequest(context, options) {
    const { apiKey, baseUrl } = context.auth;
    const { method, endpoint, data, expectedStatus = [200, 201] } = options;

    try {
        const headers = createHeaders(context.auth);
        const url = `${baseUrl}${endpoint}`;

        const response = await context.httpRequest({
            method,
            url,
            headers,
            data
        });

        if (!expectedStatus.includes(response.status)) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return response.data;
    } catch (error) {
        await context.log({ message: `Error making ${method} request to ${options.endpoint}`, error: error.message });
        throw error;
    }
}

/**
 * Processes tags input - converts string to array if needed
 * @param {string|Array} tags - Tags as string (comma-separated) or array
 * @returns {Array} Array of trimmed tag strings
 */
function processTags(tags) {
    if (!tags) return [];

    if (Array.isArray(tags)) {
        return tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
    }

    if (typeof tags === 'string') {
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    return [];
}

/**
 * Transforms customer data to standardized format
 * @param {Object} customer - Raw customer data from API
 * @returns {Object} Standardized customer object
 */
function transformCustomer(customer) {
    return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
    };
}

/**
 * Transforms ticket data to standardized format
 * @param {Object} ticket - Raw ticket data from API
 * @returns {Object} Standardized ticket object
 */
function transformTicket(ticket) {
    return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        customer: ticket.customer,
        assignee: ticket.assignee,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        tags: ticket.tags
    };
}

/**
 * Transforms comment data to standardized format
 * @param {Object} comment - Raw comment data from API
 * @returns {Object} Standardized comment object
 */
function transformComment(comment) {
    return {
        id: comment.id,
        ticketId: comment.ticketId,
        authorId: comment.authorId,
        authorName: comment.authorName,
        content: comment.content,
        isInternal: comment.isInternal,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    };
}

/**
 * Transforms tag data to standardized format
 * @param {Object} tag - Raw tag data from API
 * @returns {Object} Standardized tag object
 */
function transformTag(tag) {
    return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description,
        usageCount: tag.usageCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt
    };
}

module.exports = {
    createHeaders,
    makeAuthenticatedRequest,
    processTags,
    transformCustomer,
    transformTicket,
    transformComment,
    transformTag
};