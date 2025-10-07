import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let mcpClient: Client | null = null;

export async function getMcpClient(): Promise<Client> {
  if (mcpClient) {
    return mcpClient;
  }

  console.log("🔧 Initializing Context7 MCP client...");

  // Get Context7 endpoint from environment variables
  const mcpUrl = process.env.CONTEXT7_MCP_URL || "https://mcp.context7.com/mcp";

  if (!mcpUrl) {
    throw new Error("CONTEXT7_MCP_URL not found in environment variables");
  }

  console.log(`🔗 Connecting to Context7 at: ${mcpUrl}`);

  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));

  const client = new Client(
    {
      name: "doc-for-dummies-agent",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Add timeout to prevent hanging
    const connectionPromise = client.connect(transport);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("✅ Context7 MCP client connected");

    // List available tools for debugging
    const tools = await client.listTools();
    console.log("📋 Available MCP tools:", JSON.stringify(tools.tools, null, 2));

    mcpClient = client;
    return client;
  } catch (error) {
    console.error("💥 Failed to connect to Context7 MCP:", error);
    // Clear the failed client
    mcpClient = null;
    throw new Error(`Context7 MCP connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { mcpClient };
