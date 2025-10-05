# Tasks: Documentation for Dummies Agent

**Input**: Design documents from `/Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/chat-api.yaml, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single Next.js app**: Repository root at `/Users/dwaynejoseph/Projects/D4D`
- Code in: `/app`, `/components`, `/lib`, `/types`
- Per constitution: Edit existing files where possible, create only when necessary

---

## Phase 3.1: Setup & Dependencies

- [ ] **T001** [P] Verify MCP SDK dependency in package.json (`@modelcontextprotocol/sdk` version 1.18.2+)
- [ ] **T002** [P] Add Context7 MCP URL to .env.local (`CONTEXT7_MCP_URL` environment variable)
- [ ] **T003** Run `pnpm tsc --noEmit` to verify TypeScript baseline (must show zero errors)

**Notes**: T001-T002 can run in parallel (different files). T003 validates baseline before any code changes.

---

## Phase 3.2: Core Infrastructure (MCP Client & Types)

- [ ] **T004** Create MCP client in /Users/dwaynejoseph/Projects/D4D/lib/mcp-client.ts
  - Import `Client` and `HttpTransport` from `@modelcontextprotocol/sdk`
  - Configure HTTP transport using `CONTEXT7_MCP_URL` from env
  - Export singleton `mcpClient` instance
  - Add connection logging with emoji prefixes (`🔧`, `✅`, `💥`)
  - Implement error handling for connection failures
  - Reference: research.md section 2 (HTTP transport pattern)

- [ ] **T005** Create MCP types in /Users/dwaynejoseph/Projects/D4D/types/mcp.ts
  - Define `DocumentationSource` interface per data-model.md
  - Define `MCPToolResult` interface with `available`, `documentation`, `message` fields
  - Export all types for use in tools

- [ ] **T006** Run `pnpm tsc --noEmit` to verify T004-T005 have zero TypeScript errors

**Notes**: T004-T005 are sequential (T005 may import from T004). T006 validates types before proceeding.

---

## Phase 3.3: Agent System Prompt

- [ ] **T007** Create system prompt in /Users/dwaynejoseph/Projects/D4D/components/agent/doc-for-dummies-prompt.ts
  - Export `docForDummiesPrompt` as string constant
  - Include instructions for:
    * Beginner-friendly tone (FR-002, FR-008)
    * Step-by-step explanations (FR-004)
    * Real-world examples and analogies (FR-003)
    * Code examples when relevant (FR-013)
    * Always attempt simplification (FR-014)
    * Check tool result `available` field, inform user if false (FR-010)
  - Reference: spec.md functional requirements FR-001 through FR-014
  - Reference: research.md section 5 (error handling approach)

- [ ] **T008** Run `pnpm tsc --noEmit` to verify T007 has zero TypeScript errors

**Notes**: System prompt is independent of other code, can be created early.

---

## Phase 3.4: Context7 MCP Tool (AI SDK Integration)

- [ ] **T009** Create retrieve-documentation tool in /Users/dwaynejoseph/Projects/D4D/components/agent/tools/retrieve-documentation.ts
  - Import `tool` from `ai` package
  - Import `z` from `zod`
  - Import `mcpClient` from `/lib/mcp-client`
  - Import `MCPToolResult` from `/types/mcp`
  - Define tool with:
    * `description`: "Retrieve technical documentation from Context7 MCP server to answer user questions"
    * `inputSchema`: `z.object({ query: z.string().describe('Search query for technical documentation') })`
    * `execute`: async function that:
      - Logs query with `🔍` prefix
      - Calls `mcpClient.callTool("retrieve", { query })`
      - Handles empty results (available: false)
      - Handles errors (available: false, message: "service unavailable")
      - Logs success with `✅` or failure with `⚠️`/`💥` prefixes
      - Returns `MCPToolResult` object
  - Reference: research.md section 1 (MCP integration pattern)
  - Reference: research.md section 5 (three-tier error handling)
  - Reference: data-model.md section on ToolCall entity

- [ ] **T010** Update tool exports in /Users/dwaynejoseph/Projects/D4D/components/agent/tools/index.ts
  - Add export: `export { retrieveDocumentation } from './retrieve-documentation';`
  - Maintain alphabetical ordering if other exports exist

- [ ] **T011** Run `pnpm tsc --noEmit` to verify T009-T010 have zero TypeScript errors

**Notes**: T009 depends on T004 (MCP client) and T005 (types). T010 updates exports file.

---

## Phase 3.5: API Route Implementation

- [ ] **T012** Create API route directory /Users/dwaynejoseph/Projects/D4D/app/api/doc-for-dummies-agent/
  - Use `mkdir -p` command via terminal

- [ ] **T013** Create API route in /Users/dwaynejoseph/Projects/D4D/app/api/doc-for-dummies-agent/route.ts
  - Import required dependencies:
    * `{ openai }` from `@ai-sdk/openai`
    * `{ streamText, convertToModelMessages, stopWhen, stepCountIs }` from `ai`
    * `{ docForDummiesPrompt }` from `/components/agent/doc-for-dummies-prompt`
    * `{ retrieveDocumentation }` from `/components/agent/tools`
  - Export async `POST` function that:
    * Validates request contains `messages` array
    * Converts UIMessages to ModelMessages via `convertToModelMessages()`
    * Calls `streamText()` with:
      - `model: openai("gpt-5")`
      - `system: docForDummiesPrompt`
      - `messages: modelMessages`
      - `tools: { retrieveDocumentation }`
      - `toolChoice: 'auto'`
      - `stopWhen: stepCountIs(10)`
    * Returns `result.toUIMessageStreamResponse()`
    * Includes try-catch error handling with 500 response on errors
  - Reference: research.md section 3 (multi-step tool execution)
  - Reference: plan.md Phase 1 API contract
  - Reference: CLAUDE.md AI SDK patterns section

- [ ] **T014** Run `pnpm tsc --noEmit` to verify T012-T013 have zero TypeScript errors

**Notes**: T013 depends on T007 (system prompt) and T009 (tool). Critical file - test carefully.

---

## Phase 3.6: UI Integration (Homepage & Chat Component)

- [ ] **T015** Modify homepage in /Users/dwaynejoseph/Projects/D4D/app/page.tsx
  - Read existing file first to understand structure
  - Add link to Documentation for Dummies agent
  - Link should navigate to `/doc-for-dummies` or render ChatAssistant inline
  - Maintain existing homepage styling patterns
  - Reference: plan.md Project Structure section

- [ ] **T016** Create or modify chat page/component for agent
  - **IF** using dedicated page: Create /Users/dwaynejoseph/Projects/D4D/app/doc-for-dummies/page.tsx
  - **OR IF** modifying homepage: Update /Users/dwaynejoseph/Projects/D4D/app/page.tsx to include ChatAssistant
  - Import `ChatAssistant` from `/components/chat/chat-assistant`
  - Configure `<ChatAssistant api="/api/doc-for-dummies-agent" />`
  - Ensure AI Elements Tool component displays Context7 retrievals
  - Reference: CLAUDE.md Chat Component patterns
  - Reference: data-model.md State Management section

- [ ] **T017** Run `pnpm tsc --noEmit` to verify T015-T016 have zero TypeScript errors

**Notes**: T015-T016 modify/create UI files. Review existing ChatAssistant component before modifying.

---

## Phase 3.7: Verification & Testing

- [ ] **T018** Run full TypeScript compilation check
  - Execute: `pnpm tsc --noEmit`
  - Expected: Zero errors
  - If errors: Fix before proceeding to T019

- [ ] **T019** Start development server and verify no runtime errors
  - Execute: `pnpm dev`
  - Expected: Server starts on http://localhost:3000 without errors
  - Check console for:
    * ✅ Context7 MCP client connected
    * No React warnings or errors
    * No module resolution errors
  - If errors: Fix before proceeding to T020

- [ ] **T020** Manual test Scenario 1 from quickstart.md (Simple Technical Question)
  - Navigate to homepage
  - Click Documentation for Dummies Agent link
  - Ask: "What does API mean?"
  - Verify:
    * Console shows `🔍 Retrieving documentation for: "API..."`
    * Console shows `✅ Documentation retrieved successfully`
    * Response is beginner-friendly with examples
    * Code example included (if relevant)
  - Reference: /Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/quickstart.md Scenario 1

- [ ] **T021** Manual test Scenario 2 from quickstart.md (Follow-Up Question)
  - Continue from T020 (do not refresh)
  - Ask: "Can you give me a simpler example?"
  - Verify:
    * Agent understands context
    * No new MCP call unless necessary
    * Response is simpler than first attempt
  - Reference: /Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/quickstart.md Scenario 2

- [ ] **T022** Manual test Scenario 5 from quickstart.md (Documentation Unavailable)
  - Ask about non-existent topic: "What is XylofloxDB?"
  - Verify:
    * Console shows `⚠️ No documentation found for: "XylofloxDB"`
    * Agent clearly informs user documentation is unavailable
    * No hallucinated details
  - Reference: /Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/quickstart.md Scenario 5

- [ ] **T023** Manual test Scenario 7 from quickstart.md (Session-Only History)
  - Complete a question-answer exchange
  - Verify conversation history shows messages
  - Refresh browser page (F5)
  - Verify:
    * Conversation history is cleared
    * Chat interface shows empty state
    * No errors in console
  - Reference: /Users/dwaynejoseph/Projects/D4D/specs/001-i-want-to/quickstart.md Scenario 7

- [ ] **T024** Run final TypeScript compilation check
  - Execute: `pnpm tsc --noEmit`
  - Expected: Zero errors
  - This confirms all code changes maintain type safety

---

## Dependencies

**Setup Phase**:
- T001, T002 can run in parallel (different files)
- T003 validates baseline

**Core Infrastructure**:
- T004 → T005 (types may use MCP client imports)
- T006 validates T004-T005

**System Prompt**:
- T007 is independent
- T008 validates T007

**Tool Creation**:
- T009 requires T004 (MCP client) and T005 (types)
- T010 exports T009
- T011 validates T009-T010

**API Route**:
- T013 requires T007 (prompt) and T009 (tool)
- T014 validates T012-T013

**UI Integration**:
- T015-T016 can modify different pages (but coordinate if same file)
- T017 validates T015-T016

**Verification**:
- T018-T024 are sequential (each builds on previous validation)

---

## Parallel Execution Examples

### Setup & Types (Can run together)
```bash
# Terminal 1: Add MCP dependency
pnpm add @modelcontextprotocol/sdk@latest

# Terminal 2: Edit .env.local
echo "CONTEXT7_MCP_URL=http://localhost:3001" >> .env.local
```

### Independent File Creation (After dependencies ready)
```bash
# Can create these files in parallel (different locations):
# - /lib/mcp-client.ts (T004)
# - /types/mcp.ts (T005)
# - /components/agent/doc-for-dummies-prompt.ts (T007)

# Then verify all together:
pnpm tsc --noEmit
```

---

## Notes

- **Constitutional Compliance**:
  * Run `pnpm tsc --noEmit` after T003, T006, T008, T011, T014, T017, T018, T024
  * Follow AI SDK v5 official patterns (no deprecated APIs)
  * Edit existing files where possible (homepage, tool index)
  * Use pnpm exclusively for all package operations

- **Testing**:
  * No automated tests (MVP per constitution)
  * Manual testing via quickstart.md scenarios (T020-T023)
  * Validate all 8 scenarios in quickstart.md before declaring complete

- **Critical Files**:
  * /lib/mcp-client.ts - MCP connection must succeed
  * /components/agent/tools/retrieve-documentation.ts - Core tool functionality
  * /app/api/doc-for-dummies-agent/route.ts - API contract implementation

- **Error Handling**:
  * Three-tier approach per research.md:
    1. Tool level: Detect and return `available: false`
    2. Model level: System prompt instructs handling
    3. UI level: Tool component displays status

- **Performance Targets** (from plan.md):
  * Streaming response start: < 500ms
  * Documentation retrieval: < 2s
  * UI interaction: < 100ms lag

---

## Validation Checklist

Before marking feature complete, verify:

- [ ] All 24 tasks completed
- [ ] `pnpm tsc --noEmit` shows zero errors (T024)
- [ ] `pnpm dev` starts without errors (T019)
- [ ] All quickstart.md scenarios pass (T020-T023 + remaining 5)
- [ ] Constitution compliance verified:
  * [x] TypeScript Type Safety (NON-NEGOTIABLE)
  * [x] AI SDK Official Patterns Only
  * [x] Edit-First, Create-Never
  * [x] Agent Pattern Consistency
  * [x] Component Reuse Over Reinvention
  * [x] pnpm Only, No Exceptions

---

**Total Tasks**: 24 (3 setup + 3 infrastructure + 2 prompt + 3 tool + 3 API + 3 UI + 7 verification)

**Estimated Time**: 3-4 hours for experienced developer familiar with Next.js and AI SDK

**Next Phase**: After all tasks complete, proceed to Phase 5 validation (execute full quickstart.md test suite)
