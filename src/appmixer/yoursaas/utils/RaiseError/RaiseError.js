"use strict";

module.exports = {

    async receive(context) {
        const { errorMessage } = context.messages.in.content;

        const message = errorMessage || 'Simulated error for testing';

        await context.log({ message: 'RaiseError: Throwing error', error: message });

        throw new Error(message);
    }
};
