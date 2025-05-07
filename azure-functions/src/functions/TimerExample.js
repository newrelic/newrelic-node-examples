const newrelic = require('newrelic');
const { app } = require('@azure/functions');

app.timer('TimerExample', {
    schedule: '0 */5 * * * *',
    handler: (myTimer, context) => {
        context.log('Timer function processed request.');
    }
});
