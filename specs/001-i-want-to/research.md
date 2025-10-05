# Research: Documentation for Dummies Agent

**Date**: 2025-10-03
**Phase**: 0 - Outline & Research
**Related**: [plan.md](./plan.md), [spec.md](./spec.md)

## Research Questions

### 1. Context7 MCP Integration with AI SDK 5

**Question**: How to integrate Context7 MCP server with AI SDK 5 tools for documentation retrieval?

**Decision**: Create an AI SDK tool that wraps the Context7 MCP client.

**Rationale**:
- AI SDK 5 provides a `tool()` function that accepts async `execute` functions
- MCP servers expose tools/resources that can be called programmatically
- The MCP SDK (`@modelcontextprotocol/sdk`) provides client libraries to connect and invoke MCP servers
- Wrapping MCP calls in an AI SDK tool allows the language model to decide when to retrieve documentation

**Implementation Approach**:
1. Create MCP client in `/lib/mcp-client.ts` using `@modelcontextprotocol/sdk`
2. Configure transport (HTTP or stdio, avoiding deprecated SSE)
3. Create AI SDK tool in `/components/agent/tools/retrieve-documentation.ts`
4. Tool's `execute` function calls MCP client to retrieve documentation
5. Return documentation text for model to synthesize into response

**Alternatives Considered**:
- Direct MCP integration without AI SDK tool layer → Rejected: Bypasses AI SDK patterns, violates constitution principle II
- Pre-fetching all documentation → Rejected: Inefficient, not scalable, defeats purpose of MCP
- Using RAG/vector search → Rejected: Context7 already provides optimized retrieval

**References**:
- AI SDK Tools: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- MCP SDK: https://github.com/anthropics/modelcontextprotocol-sdk-typescript
- Context7 MCP: https://github.com/upstash/context7

---

### 2. HTTP vs stdio Transport for Context7 MCP

**Question**: Should we use HTTP or stdio transport for Context7 MCP connection (SSE is deprecated)?

**Decision**: Use HTTP transport as the primary method.

**Rationale**:
- HTTP transport is more straightforward for web applications
- Easier to configure and debug (standard HTTP requests/responses)
- Works well with Next.js API routes and serverless environments
- stdio transport requires process spawning, adds complexity for web deployments
- SSE transport is explicitly deprecated and will be removed

**Implementation Approach**:
1. Configure MCP client with HTTP transport pointing to Context7 server URL
2. Handle connection errors gracefully (server unavailable, timeouts)
3. Implement retry logic for transient failures
4. Log connection status for debugging

**Alternatives Considered**:
- stdio transport → Rejected for MVP: More complex to set up, harder to debug, less suitable for web deployments
- SSE transport → Rejected: Deprecated, will be removed in future releases
- WebSocket transport → Deferred: Not in current MCP spec, may be future option

**Configuration Example**:
```typescript
// HTTP transport configuration
const client = new Client({
  name: "doc-for-dummies",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(new HttpTransport({
  url: process.env.CONTEXT7_MCP_URL || "http://localhost:3001"
}));
```

---

### 3. AI SDK 5 Multi-Step Tool Execution

**Question**: How to configure multi-step tool calling for documentation retrieval and synthesis?

**Decision**: Use `streamText()` with `stepCountIs()` to allow multiple tool calls if needed.

**Rationale**:
- User questions may require multiple documentation lookups (e.g., comparing concepts)
- AI SDK 5 replaced deprecated `maxSteps` with `stopWhen: stepCountIs(N)`
- Limiting steps prevents infinite loops while allowing necessary multi-step reasoning
- 5-10 steps should be sufficient for documentation retrieval + synthesis

**Implementation Approach**:
```typescript
const result = streamText({
  model: openai("gpt-5"),
  system: docForDummiesPrompt,
  messages: modelMessages,
  tools: { retrieveDocumentation },
  toolChoice: 'auto', // Let model decide when to use tools
  stopWhen: stepCountIs(10), // Allow up to 10 steps for complex queries
});
```

**Alternatives Considered**:
- Single-step only (`stepCountIs(1)`) → Rejected: Too limiting for complex questions
- Unlimited steps → Rejected: Risk of infinite loops, token wastage
- `toolChoice: 'required'` → Rejected: Some questions may not need documentation (follow-ups about previous explanations)

**References**:
- AI SDK Cookbook: https://ai-sdk.dev/cookbook/node/manual-agent-loop
- stepCountIs API: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

---

### 4. Session-Only State Management with useChat

**Question**: How does useChat handle session-only state, and what are browser memory limits?

**Decision**: Rely on useChat's default in-memory state management without persistence.

**Rationale**:
- `useChat` hook manages messages array in React state by default
- No persistence configuration → state cleared on page refresh/reload
- Browser memory can handle hundreds of messages (typical conversation ~10-50 messages)
- Session-only aligns with spec requirement (FR-011)

**Implementation Approach**:
1. Use `useChat` without `id` prop (no session persistence)
2. Rely on default behavior: state clears on unmount/reload
3. No localStorage, sessionStorage, or database integration needed
4. Display message count in UI if approaching browser limits (>100 messages)

**Browser Memory Considerations**:
- Modern browsers handle ~100MB of JS heap memory comfortably
- Each message ~1-5KB (including metadata) → ~10K-50K messages theoretical limit
- Practical limit: ~500-1000 messages before UI performance degrades
- MVP scope: Single sessions unlikely to exceed 100 messages

**Alternatives Considered**:
- localStorage persistence → Rejected: Violates FR-011 requirement
- Automatic message pruning → Deferred: Not needed for MVP scope
- Warning at message limit → Deferred: Can add if testing reveals issues

**References**:
- useChat documentation: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat

---

### 5. Error Handling When Context7 Documentation Unavailable

**Question**: How should the system handle cases when Context7 MCP doesn't have requested documentation?

**Decision**: Implement three-tier error handling: tool-level detection, model-level synthesis, UI-level display.

**Rationale**:
- Context7 MCP may return empty results for unknown topics
- MCP connection may fail (server down, network issues)
- User experience requires clear messaging per FR-010

**Implementation Approach**:

**Tier 1 - Tool Level** (`retrieve-documentation.ts`):
```typescript
execute: async ({ query }) => {
  console.log(`🔍 Retrieving documentation for: "${query}"`);
  try {
    const result = await mcpClient.callTool("retrieve", { query });
    if (!result || result.content.length === 0) {
      console.log(`⚠️ No documentation found for: "${query}"`);
      return {
        documentation: null,
        available: false,
        message: "No documentation available for this topic."
      };
    }
    console.log(`✅ Documentation retrieved successfully`);
    return {
      documentation: result.content,
      available: true
    };
  } catch (error) {
    console.error(`💥 Context7 MCP error:`, error);
    return {
      documentation: null,
      available: false,
      message: "Unable to retrieve documentation (service unavailable)."
    };
  }
}
```

**Tier 2 - Model Level** (system prompt):
Instruct model to check `available` field and inform user gracefully when false.

**Tier 3 - UI Level** (Tool component):
Display tool execution status with clear messaging for failed retrievals.

**Alternatives Considered**:
- Fallback to general knowledge → Rejected: May provide inaccurate info, violates FR-010
- Retry logic → Included for transient failures, not for "not found" results
- Silent failure → Rejected: Poor UX, violates FR-010

---

## Summary

**Key Decisions**:
1. ✅ Wrap Context7 MCP in AI SDK tool for seamless integration
2. ✅ Use HTTP transport for Context7 MCP (not SSE)
3. ✅ Configure `stopWhen: stepCountIs(10)` for multi-step tool calls
4. ✅ Rely on useChat default in-memory state (no persistence)
5. ✅ Implement three-tier error handling for unavailable documentation

**Technical Stack Confirmed**:
- Next.js 15 + TypeScript 5
- AI SDK 5 with OpenAI GPT-5
- Context7 MCP via HTTP transport
- shadcn/ui + AI Elements
- Session-only state (useChat default behavior)

**No Outstanding NEEDS CLARIFICATION** - All research complete, ready for Phase 1 design.
