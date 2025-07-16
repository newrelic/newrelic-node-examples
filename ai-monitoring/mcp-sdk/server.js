const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const z = require('zod');
const OpenAI = require('openai');
const OPENAI_MODEL = "gpt-4";
const { OPENAI_API_KEY: apiKey } = process.env
const openai = new OpenAI({
    apiKey
})

// Create MCP server for stdio transport
const server = new McpServer(
    {
        name: "example-server",
        version: "1.0.0"
    }
);

// Async tool that mocks a weather API
server.registerTool(
    "fetch-weather",
    {
        title: "Weather Fetcher",
        description: "Get weather data for a city",
        inputSchema: { city: z.string() }
    },
    async ({ city }) => {
        try {
            const completion = await openai.chat.completions.create({
                model: OPENAI_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a weather service. Provide current weather information for the requested city. Format your response with temperature in both Celsius and Fahrenheit, conditions, humidity, wind, and pressure. If you don't have real-time data, provide realistic weather information for the location and season."
                    },
                    {
                        role: "user",
                        content: `What's the current weather in ${city}?`
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            });

            const weatherResponse = completion.choices[0].message.content;

            return {
                content: [{ type: "text", text: weatherResponse }]
            };
        }
        catch (error) {
            console.error("Error fetching weather:", error);
        }
    }
);

// Register a resource that echoes back messages
server.registerResource(
    "echo",
    new ResourceTemplate("echo://{message}", { list: undefined }),
    {
        title: "Echo Resource",
        description: "Echoes back messages as resources"
    },
    async (uri, { message }) => ({
        contents: [{
            uri: uri.href,
            text: `Resource echo: ${message}`
        }]
    })
);

server.registerPrompt(
    "echo",
    {
        title: "Echo Prompt",
        description: "Creates a prompt to process a message",
        argsSchema: { message: z.string() }
    },
    ({ message }) => ({
        messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please process this message: ${message}`
            }
        }]
    })
);


// Start the server with stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main();