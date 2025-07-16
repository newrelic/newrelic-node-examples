const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const newrelic = require('newrelic');

async function main() {
    // Set up client
    const transport = new StdioClientTransport({
        command: "npm",
        args: ["run", "server"]
    });
    const client = new Client({ name: "example-client", version: "1.0.0" });
    await client.connect(transport);

    // Call a tool
    newrelic.startBackgroundTransaction('callTool', async () => {
        const txn = newrelic.getTransaction();
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
            txn.end();
        }
    })

    // Read a resource
    // newrelic.startBackgroundTransaction('readResource', async () => {
    //     const txn = newrelic.getTransaction();
    //     try {
    //         const message = "Hello"
    //         const resource = await client.readResource({
    //             uri: `echo://${message}`
    //         });

    //         console.log(resource);
    //     } catch (error) {
    //         console.error("Error reading resource:", error);
    //     } finally {
    //         await client.close();
    //         txn.end();
    //     }
    // })

    // Get a prompt
    // newrelic.startBackgroundTransaction('getPrompt', async () => {
    //     const txn = newrelic.getTransaction();
    //     try {
    //         const prompt = await client.getPrompt({
    //             name: "echo",
    //             arguments: {
    //                 message: "Some user message"
    //             }
    //         })

    //         console.log(prompt);
    //     } catch (error) {
    //         console.error("Error reading prompt:", error);
    //     } finally {
    //         await client.close();
    //         txn.end();
    //     }
    // })
}

main()