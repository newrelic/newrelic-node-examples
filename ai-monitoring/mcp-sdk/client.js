const { MCPServerStdio, Agent, run } = require("@openai/agents");

async function main() {
    const mcpServer = new MCPServerStdio({
        name: "weather",
        fullCommand: "npm run server"
    })
    await mcpServer.connect();
    const agent = new Agent({
        name: "WeatherAgent",
        instructions: "You are a weather information agent. Answer questions about the weather.",
        mcpServers: [mcpServer],
    });

    const result = await run(agent, "What is the weather like in San Francisco?");

    console.log("Agent response:", result.finalOutput);
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});