const newrelic = require('newrelic');
const { MCPServerStdio, Agent, run } = require("@openai/agents");

async function main() {
    newrelic.startBackgroundTransaction('mcp-client', async () => {
        const txn = newrelic.getTransaction();
        const mcpServer = new MCPServerStdio({
            name: "weather",
            stdio: 'inherit',
            fullCommand: "npm run server:debug"
        })
        await mcpServer.connect();
        const agent = new Agent({
            name: "WeatherAgent",
            instructions: "You are a weather information agent. Answer questions about the weather.",
            mcpServers: [mcpServer],
        });

        const result = await run(agent, "What is the weather like in San Francisco?");

        console.log("Agent response:", result.finalOutput);
        txn.end();
        newrelic.shutdown({collectPendingData: true}, () => {
            process.exit(0);
        });
    })
}

main();