import { tool } from "ai";
import { z } from "zod";
import { getMcpClient } from "@/lib/mcp-client";
import type { MCPToolResult } from "@/types/mcp";

/**
 * AI SDK tool that retrieves technical documentation from Context7 MCP server
 *
 * This tool is used by the Documentation for Dummies agent to fetch
 * technical documentation that will be simplified for beginners.
 */
export const retrieveDocumentation = tool({
  description:
    "Retrieve technical documentation from Context7 MCP server to answer user questions about technical libraries, frameworks, or tools. Pass the full library/tool name as it appears in the user's question.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The full name of the library, framework, tool, or technology to search for (e.g., 'Supabase CLI', 'Next.js', 'React hooks', 'TypeScript'). Include all relevant terms from the user's question."
      ),
  }),
  execute: async ({ query }): Promise<MCPToolResult> => {
    console.log(`🔍 Retrieving documentation for: "${query}"`);

    try {
      const client = await getMcpClient();

      // Step 1: Resolve library ID using the full query
      console.log(`📖 Resolving library ID for: "${query}"`);
      const resolvePromise = client.callTool({
        name: "resolve-library-id",
        arguments: {
          libraryName: query,
        },
      });

      const resolveTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Library resolution timeout after 15s')), 15000)
      );

      const resolveResult = await Promise.race([resolvePromise, resolveTimeout]);

      // Extract library ID from result
      const resolveContent = resolveResult?.content as
        | Array<{ type: string; text?: string }>
        | undefined;

      if (!resolveContent || resolveContent.length === 0 || !resolveContent[0]?.text) {
        console.log(`⚠️ Could not resolve library ID for: "${query}"`);
        return {
          documentation: null,
          available: false,
          message: `Library "${query}" not found in Context7 database.`,
        };
      }

      const responseText = resolveContent[0].text.trim();
      console.log(`📝 Raw resolve response (first 300 chars): ${responseText.substring(0, 300)}`);

      // Extract the actual library ID from the formatted response
      // Context7 returns: "- Context7-compatible library ID: /org/project"
      const libraryIdMatch = responseText.match(/Context7-compatible library ID:\s*(\/[\w\-\/]+)/i);

      if (!libraryIdMatch || !libraryIdMatch[1]) {
        console.log(`⚠️ Could not extract library ID from response for: "${query}"`);
        console.log(`Response text: ${responseText.substring(0, 500)}`);
        return {
          documentation: null,
          available: false,
          message: `Unable to resolve library ID for "${query}". The library may not be in the Context7 database.`,
        };
      }

      const libraryId = libraryIdMatch[1];
      console.log(`✅ Extracted library ID: ${libraryId}`);

      // Step 2: Get library documentation
      console.log(`📚 Fetching documentation for library ID: ${libraryId}`);
      const docsPromise = client.callTool({
        name: "get-library-docs",
        arguments: {
          context7CompatibleLibraryID: libraryId,
          tokens: 5000,
        },
      });

      const docsTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Documentation fetch timeout after 15s')), 15000)
      );

      const result = await Promise.race([docsPromise, docsTimeout]);

      // Type-safe content access
      const content = result?.content as
        | Array<{ type: string; text?: string }>
        | undefined;

      // Check if we got content back
      if (!content || content.length === 0 || !content[0]?.text) {
        console.log(`⚠️ No documentation found for: "${query}"`);
        return {
          documentation: null,
          available: false,
          message: "No documentation available for this topic.",
        };
      }

      // Extract text content from the MCP response
      const documentation = content[0].text;

      if (!documentation) {
        console.log(`⚠️ No text content in documentation for: "${query}"`);
        return {
          documentation: null,
          available: false,
          message: "Documentation format not supported.",
        };
      }

      // Check if the response is actually an error message from Context7
      const errorPatterns = [
        "does not exist",
        "Documentation not found",
        "not finalized for this library",
        "invalid Context7-compatible library ID",
        "Please try with a different library",
      ];

      const isErrorMessage = errorPatterns.some((pattern) =>
        documentation.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isErrorMessage) {
        console.log(`⚠️ Context7 returned error message for: "${query}"`);
        console.log(`Error text: ${documentation.substring(0, 200)}`);
        return {
          documentation: null,
          available: false,
          message: `Documentation for "${query}" is not available in the Context7 database.`,
        };
      }

      console.log(`✅ Documentation retrieved successfully (${documentation.length} characters)`);
      return {
        documentation,
        available: true,
      };
    } catch (error) {
      console.error(`💥 Context7 MCP error:`, error);
      return {
        documentation: null,
        available: false,
        message: "Unable to retrieve documentation (service unavailable).",
      };
    }
  },
});
