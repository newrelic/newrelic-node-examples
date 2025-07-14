const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const z = require('zod');

// Create MCP server for stdio transport
const server = new McpServer(
    {
        name: "example-server",
        version: "1.0.0"
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

// Async tool with external API call
server.registerTool(
  "fetch-weather",
  {
    title: "Weather Fetcher",
    description: "Get weather data for a city",
    inputSchema: { city: z.string() }
  },
  async ({ city }) => {
    const response = `Weather in ${city}:
Temperature: 22°C (72°F)
Conditions: Partly cloudy
Humidity: 65%
Wind: 10 km/h NW
Pressure: 1013 hPa`;
    return {
      content: [{ type: "text", text: response }]
    };
  }
);

// Start the server with stdio transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);