"use strict";

module.exports = {

    async receive(context) {
        const { errorMessage } = context.messages.in.content;

        const message = errorMessage || 'Flow execution cancelled for testing';

        await context.log({ message: 'RaiseCancelError: Throwing cancel error', error: message });

        throw new context.CancelError(message);
    }
};
