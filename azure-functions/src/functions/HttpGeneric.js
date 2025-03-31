const { app, output, trigger } = require('@azure/functions');

// HTTP Trigger example using `generic` to respond to an HTTP Get
app.generic('HttpGeneric', {
    trigger: trigger.generic({
        type: 'httpTrigger',
        methods: ['GET']
    }),
    return: output.generic({
        type: 'http'
    }),
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        return { body: `You have made a GET request, handled with a generic` };
    }
});