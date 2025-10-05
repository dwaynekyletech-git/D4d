<!--
Sync Impact Report:
Version Change: Initial → 1.0.0
Modified Principles: None (initial creation)
Added Sections: All core principles established
Removed Sections: None
Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Requirements align with TypeScript/Next.js focus
  ✅ tasks-template.md - Task categorization supports AI SDK patterns
Follow-up TODOs: None
-->

# D4D AI Template Constitution

## Core Principles

### I. TypeScript Type Safety (NON-NEGOTIABLE)

All code MUST be written in TypeScript with strict type checking enabled. Run `pnpm tsc --noEmit` after every code modification to verify zero type errors before considering any task complete. This is non-negotiable for MVP development - type errors caught at compile time prevent runtime failures and accelerate iteration.

**Rationale**: TypeScript's compile-time checking provides immediate feedback and prevents entire classes of bugs, critical for rapid MVP development without comprehensive test coverage.

### II. AI SDK Official Patterns Only

All AI integration MUST follow official Vercel AI SDK v5 patterns as documented at ai-sdk.dev. Never deviate from documented APIs:
- Use `streamText()` for streaming responses with `stopWhen` and `stepCountIs()`
- Use `useChat()` hook with `sendMessage({ text: "..." })` format - NEVER pass plain strings
- Access message content via `message.parts` array structure - NEVER via `.content`
- Read official docs before implementing any AI functionality

**Rationale**: AI SDK patterns are battle-tested and optimized. Custom implementations introduce bugs and maintenance burden. The template's value is in demonstrating correct SDK usage.

### III. Edit-First, Create-Never (Unless Necessary)

ALWAYS prefer editing existing files over creating new ones. Only create new files when absolutely required for new functionality (new components, new API routes, new tools). NEVER proactively create documentation files, README updates, or organizational-only files.

**Rationale**: Template bloat reduces clarity. Users fork this template to modify it, not to navigate extensive documentation. Every file must serve immediate functional purpose.

### IV. Agent Pattern Consistency

When creating agents or tools, MUST follow established patterns in `/components/agent/` and `/components/agent/tools/`. Study existing implementations before creating new ones. All tools MUST:
- Use `tool()` function from `ai` package
- Define Zod schemas with `.describe()` for all parameters
- Implement error handling in `execute` function
- Include console logging for debugging (`🔧`, `✅`, `💥` prefixes)
- Keep return types simple to avoid TypeScript deep instantiation errors

**Rationale**: Pattern consistency makes the template learnable. Developers should understand the system by reading 2-3 example files, not extensive documentation.

### V. Component Reuse Over Reinvention

Use established component libraries exclusively:
- shadcn/ui for standard UI components (New York style, neutral theme)
- Vercel AI Elements for AI-specific components (Conversation, Message, Tool, Reasoning)
- Never create custom components that duplicate these libraries

**Rationale**: These libraries are maintained, accessible, and familiar to Next.js developers. Custom components increase maintenance burden for MVP template users.

### VI. pnpm Only, No Exceptions

All dependency operations MUST use pnpm. Never use npm or yarn, even in documentation examples or scripts.

**Rationale**: Lock file and workspace compatibility. Mixed package managers cause dependency conflicts that waste development time.

## Development Workflow

### Code Quality Gates

Before marking any task complete:
1. Run `pnpm tsc --noEmit` - MUST show zero errors
2. Verify dev server starts without errors (`pnpm dev`)
3. Manually test changed functionality in browser

**Testing Policy for MVP**: No automated tests required. This is a template for rapid prototyping, not production deployment. Manual verification is sufficient.

### Documentation Updates

Update `CLAUDE.md` ONLY when:
- Adding new directories or architectural patterns
- Introducing new AI SDK usage patterns not yet documented
- Adding critical rules that prevent common mistakes

Never create separate documentation files. All guidance lives in `CLAUDE.md` or inline code comments.

### Dependency Management

Before adding any new dependency, verify:
- It's actively maintained (updated within last 6 months)
- It's compatible with Next.js 15 and React 19
- It doesn't duplicate functionality from existing dependencies
- It's essential for template functionality, not just convenience

## Implementation Standards

### API Routes

All API routes MUST:
- Validate incoming messages/requests
- Use `convertToModelMessages()` for UIMessage → ModelMessage conversion
- Return responses via `toTextStreamResponse()` or `toUIMessageStreamResponse()`
- Include error handling with graceful fallbacks
- Log tool executions for debugging

### Chat Components

All chat interfaces MUST:
- Use `useChat` hook from `@ai-sdk/react`
- Handle loading states via `status` property
- Display tool calls using AI Elements components
- Never access `message.content` directly - use `message.parts`
- Pass only UIMessage-compatible objects to `sendMessage()`

### File Organization

Maintain strict directory structure:
- `/app` - Next.js pages and API routes only
- `/components/chat` - Chat interface components
- `/components/agent` - System prompts and configuration
- `/components/agent/tools` - AI SDK tool definitions
- `/components/ui` - shadcn/ui components only
- `/components/ai-elements` - Vercel AI Elements only
- `/lib` - Shared utilities (minimal)
- `/types` - TypeScript type definitions

Never create additional top-level directories without documenting in `CLAUDE.md`.

## Governance

### Constitution Authority

This constitution supersedes all other development practices. When CLAUDE.md conflicts with constitution principles, constitution takes precedence.

### Amendment Process

Constitution changes require:
1. Clear rationale for the change
2. Version increment following semantic versioning:
   - MAJOR: Principle removal or backward-incompatible governance changes
   - MINOR: New principle added or material expansion
   - PATCH: Clarifications, wording fixes, non-semantic refinements
3. Update to `LAST_AMENDED_DATE`
4. Sync check of all `.specify/templates/*.md` files
5. Update to `CLAUDE.md` if principles affect documented patterns

### Compliance Review

Every feature implementation MUST verify:
- TypeScript compiles without errors
- AI SDK patterns follow official documentation
- No unnecessary files created
- Existing patterns followed for agents/tools
- pnpm used exclusively

Violations MUST be justified in plan.md Complexity Tracking section or rejected.

**Version**: 1.0.0 | **Ratified**: 2025-10-03 | **Last Amended**: 2025-10-03
