const newrelic = require('newrelic');
const { app } = require('@azure/functions');
const { Writable, Transform } = require('stream');
const { createReadStream, createWriteStream } = require('fs');

// Enable streaming
app.setup({ enableHttpStream: true });

// HTTP trigger with streaming support
app.http('HttpStreaming', {
    methods: ['POST', 'GET'],
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
        if (request.method === 'POST') {
            const writeStream = createWriteStream('helloWorld.txt');
            await request.body.pipeTo(Writable.toWeb(writeStream));
            return { body: 'Done!' };
        }
    }
});