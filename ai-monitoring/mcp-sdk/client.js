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

        console.log("--- Requesting weather forecast ---");
        const forecastResult = await run(agent, "What is the weather like in San Francisco? (latitude 37.7749, longitude -122.4194)");
        console.log("Agent forecast response:", forecastResult.finalOutput);

        console.log("\n--- Requesting weather safety tips ---");
        const tipsResult = await run(agent, "Can you give me some general weather safety tips?");
        console.log("Agent tips response:", tipsResult.finalOutput);

        console.log("\n--- Requesting a specific prompt ---");
        // This is more advanced and depends on how the agent's model uses prompts.
        // You might need to phrase the instruction to encourage prompt usage.
        const promptResult = await run(agent, "I need a template to summarize a weather forecast. Can you provide it?");
        console.log("Agent prompt response:", promptResult.finalOutput);

        txn.end();
        newrelic.shutdown({ collectPendingData: true }, () => {
            process.exit(0);
        });
    })
}

main();