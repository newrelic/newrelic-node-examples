const { app } = require('@azure/functions');
const { Transform } = require('stream');
const { createReadStream } = require('fs');

// Enable streaming
app.setup({ enableHttpStream: true });

// HTTP trigger with streaming support
app.http('HttpStreaming', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        if (request.method === 'GET') {
            const delayStream = new Transform({
                transform(chunk, encoding, callback) {
                    setTimeout(() => callback(null, chunk), 1000); 
                }
            });

            const body = createReadStream('helloWorld.txt').pipe(delayStream);
            return { body };
        }
    }
});