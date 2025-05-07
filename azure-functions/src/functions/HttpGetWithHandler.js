const { app } = require('@azure/functions');

// HTTP Trigger`.get` with a handler as the second argument to the `.get` method instead of an `HTTPOptions` object.
app.get('HttpGetWithHandler', async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}! This GET endpoint has no options defined, but was supplied with a handler instead.` };
    }
);
