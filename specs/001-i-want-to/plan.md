# Implementation Plan: Documentation for Dummies Agent

**Branch**: `001-i-want-to` | **Date**: 2025-10-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/spec.md`

## Summary

Build a conversational AI agent that simplifies complex technical documentation for beginners. Users ask questions in plain language and receive beginner-friendly explanations with real-world examples and code samples. The agent retrieves documentation via Context7 MCP, maintains session-only conversation history, and handles any technical domain (programming, databases, DevOps, etc.). Technical approach: Next.js 15 frontend with AI SDK 5 for streaming responses, shadcn/ui + AI Elements for UI, TypeScript for type safety, and Context7 MCP for documentation retrieval.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15
**Primary Dependencies**:
- Next.js 15 (React framework with App Router)
- AI SDK 5 (@ai-sdk/openai, @ai-sdk/react, ai)
- AI Elements (Vercel pre-built AI components)
- shadcn/ui (component library, New York style)
- Tailwind CSS v4 (styling)
- Context7 MCP via @modelcontextprotocol/sdk (documentation retrieval)
- Zod 4.x (schema validation)

**Storage**: Session-only (browser memory, no persistence)
**Testing**: Manual verification only (MVP, no automated tests per constitution)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single web application (Next.js unified structure)
**Performance Goals**:
- Streaming response start < 500ms
- Documentation retrieval via MCP < 2s
- Interactive UI response < 100ms

**Constraints**:
- Session-only conversation history (cleared on tab close)
- Context7 MCP availability determines documentation access
- HTTP/stdio transport only (no SSE, deprecated)
- Must follow AI SDK v5 official patterns strictly

**Scale/Scope**:
- Single-user MVP template
- Unlimited conversation turns per session
- Supports any technical documentation domain available in Context7

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. TypeScript Type Safety (NON-NEGOTIABLE)
✅ **PASS** - All code will be TypeScript with strict checking. `pnpm tsc --noEmit` required before task completion.

### II. AI SDK Official Patterns Only
✅ **PASS** - Using AI SDK 5 with:
- `streamText()` for streaming responses
- `useChat()` hook with `sendMessage({ text: "..." })` format
- `message.parts` array access (never `.content`)
- Official tool patterns for Context7 MCP integration

### III. Edit-First, Create-Never (Unless Necessary)
✅ **PASS** - Will modify existing template files where possible:
- Edit existing API route structure
- Modify existing chat component
- Create new files only for: Documentation agent prompt, Context7 MCP tool

### IV. Agent Pattern Consistency
✅ **PASS** - Will follow `/components/agent/` patterns:
- New system prompt in `/components/agent/doc-for-dummies-prompt.ts`
- Context7 tool in `/components/agent/tools/retrieve-documentation.ts`
- Zod schemas with `.describe()`
- Error handling and logging with emoji prefixes

### V. Component Reuse Over Reinvention
✅ **PASS** - Using existing libraries:
- shadcn/ui for UI components (already configured)
- AI Elements for Conversation, Message, PromptInput, Tool components
- No custom components that duplicate these

### VI. pnpm Only, No Exceptions
✅ **PASS** - All dependency operations use pnpm exclusively.

**Initial Constitution Check**: ✅ PASS (no violations)

## Project Structure

### Documentation (this feature)
```
specs/001-i-want-to/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chat-api.yaml    # Chat API contract
└── tasks.md             # Phase 2 output (created by /tasks command)
```

### Source Code (repository root)
```
app/
├── page.tsx                                    # Homepage (modify to link to agent)
└── api/
    └── doc-for-dummies-agent/
        └── route.ts                            # New API route for agent

components/
├── chat/
│   └── chat-assistant.tsx                      # Existing (may need modifications)
├── agent/
│   ├── doc-for-dummies-prompt.ts              # New system prompt
│   └── tools/
│       ├── index.ts                            # Update exports
│       └── retrieve-documentation.ts           # New Context7 MCP tool
├── ai-elements/                                # Existing AI Elements
└── ui/                                         # Existing shadcn/ui components

lib/
└── mcp-client.ts                               # New MCP client for Context7

types/
└── mcp.ts                                      # New MCP-related types
```

**Structure Decision**: Single Next.js web application using existing template structure. The codebase already has `/app`, `/components`, `/lib`, and `/types` directories. We'll extend with new agent-specific files following constitutional patterns.

## Phase 0: Outline & Research

No NEEDS CLARIFICATION markers remain in spec (all resolved in clarifications session). Research focuses on integration patterns and best practices.

### Research Tasks

1. **Context7 MCP Integration Pattern**
   - Research: How to integrate Context7 MCP server with AI SDK 5 tools
   - Research: HTTP vs stdio transport configuration (SSE deprecated)
   - Research: Error handling when documentation unavailable

2. **AI SDK 5 Tool Calling Patterns**
   - Research: Multi-step tool execution with `stepCountIs()`
   - Research: Tool choice strategies for documentation retrieval
   - Research: Streaming tool results to UI

3. **Session-Only State Management**
   - Research: useChat hook session management
   - Research: Browser memory limits for conversation history
   - Research: Clear state patterns on session end

**Output**: research.md (will be generated in next step)

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### Entities (for data-model.md)

1. **Message**
   - Fields: id, role (user/assistant), parts[] (text, tool calls, results), timestamp
   - Lifecycle: Created → Streamed → Complete
   - Storage: Session-only (browser memory via useChat)

2. **Tool Call**
   - Fields: toolName, input (query), result (documentation)
   - Lifecycle: Initiated → Executing → Completed/Failed
   - Integration: Context7 MCP server

3. **Session**
   - Fields: messages[], startTime
   - Lifecycle: Created (on load) → Active → Destroyed (on tab close)
   - Storage: Browser memory only

### API Contracts (for /contracts/)

#### POST /api/doc-for-dummies-agent

**Request**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What does API mean?"
    }
  ]
}
```

**Response**: Streaming text with tool calls
```
Tool calls visible in stream:
- tool: retrieve-documentation
- input: { "query": "API definition" }
- result: { "documentation": "..." }

Assistant response streams with beginner-friendly explanation
```

### Quickstart Validation (for quickstart.md)

**Manual Testing Scenario**:
1. Open browser to homepage
2. Click link to Documentation for Dummies agent
3. Ask: "What does API mean?"
4. Verify: Response includes beginner-friendly explanation with examples
5. Ask follow-up: "Can you give me a simpler example?"
6. Verify: Agent provides more simplified explanation
7. Refresh page
8. Verify: Conversation history is cleared (session-only)

### Agent File Update

Per constitution and template: Run `.specify/scripts/bash/update-agent-context.sh claude` to update CLAUDE.md with new agent patterns and Context7 MCP integration details.

**Output**: data-model.md, /contracts/chat-api.yaml, quickstart.md, updated CLAUDE.md

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Setup Tasks**:
   - Verify pnpm dependencies (AI SDK 5, MCP SDK, etc.)
   - Configure Context7 MCP connection (HTTP/stdio, not SSE)

2. **Agent System Prompt**:
   - Create `/components/agent/doc-for-dummies-prompt.ts`
   - System instructions: beginner-friendly tone, step-by-step explanations, always attempt simplification

3. **Context7 MCP Tool**:
   - Create `/components/agent/tools/retrieve-documentation.ts`
   - Zod schema for query input
   - MCP client integration with error handling
   - Export from `/components/agent/tools/index.ts`

4. **API Route**:
   - Create `/app/api/doc-for-dummies-agent/route.ts`
   - Load system prompt
   - Configure `streamText()` with tools
   - Return `toUIMessageStreamResponse()`

5. **UI Integration**:
   - Modify homepage to link to new agent
   - Configure ChatAssistant with `/api/doc-for-dummies-agent`
   - Ensure Tool component displays Context7 retrievals

6. **Verification**:
   - Run `pnpm tsc --noEmit` (zero errors)
   - Run `pnpm dev` (starts without errors)
   - Manual test all acceptance scenarios from quickstart.md

**Ordering Strategy**:
- Setup → System Prompt → Tool → API Route → UI → Verification
- Constitution requires TypeScript check after each file creation
- Manual testing before marking complete

**Estimated Output**: 12-15 numbered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (execute quickstart.md, verify TypeScript compilation, manual browser testing)

## Complexity Tracking

*No constitutional violations - section intentionally left empty*

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [x] Phase 2: Task planning complete (approach described)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - no violations)

---
*Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`*
