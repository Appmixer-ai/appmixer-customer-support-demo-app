"use strict";

const { makeAuthenticatedRequest, transformTag } = require('../../commons');

module.exports = {

    async receive(context) {
        const { tagId, name, color, description } = context.messages.in.content;

        try {
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (color !== undefined) updateData.color = color;
            if (description !== undefined) updateData.description = description;

            const response = await makeAuthenticatedRequest(context, {
                method: 'PATCH',
                endpoint: `/api/tags?id=${encodeURIComponent(tagId)}`,
                data: updateData
            });

            const tag = transformTag(response.data);

            await context.sendArray([tag], 'tag');

        } catch (error) {
            await context.log({ message: 'Error updating tag', error: error.message });
            throw error;
        }
    }
};