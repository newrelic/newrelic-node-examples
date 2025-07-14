const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["server.js"]
    });

    const client = new Client(
        {
            name: "example-client",
            version: "1.0.0"
        }
    );

    await client.connect(transport);

    // Call a tool
    try {
        const result = await client.callTool({
            name: "fetch-weather",
            arguments: {
                city: "New York"
            }
        });

        console.log(result);
    } catch (error) {
        console.error("Error calling tool:", error);
    } finally {
        await client.close();
    }
}

main()