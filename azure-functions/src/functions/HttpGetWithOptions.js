const { app } = require('@azure/functions');

// The built-in `get` method using an `HTTPOptions` argument containing the handler
app.get('HttpGet', {
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}! This response is from a .get endpoint with HTTP options` };
    }
});
