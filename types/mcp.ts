/**
 * MCP-related type definitions for the Documentation for Dummies agent
 */

/**
 * Result returned by the retrieve-documentation tool
 */
export interface MCPToolResult {
  documentation: string | null;
  available: boolean;
  message?: string;
}

/**
 * Documentation source retrieved from Context7 MCP
 */
export interface DocumentationSource {
  query: string;
  content: string | null;
  available: boolean;
  retrievedAt: Date;
  errorMessage?: string;
}
