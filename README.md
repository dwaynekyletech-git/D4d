# TypeScript Next.js AI SDK 5 Starter

A powerful TypeScript Next.js 15 starter template for AI-powered applications with MCP tools integration, streaming responses, and modern AI components.

## Features

- **AI SDK 5 Integration** - OpenAI GPT-5 with streaming text responses
- **MCP Tools Support** - Model Context Protocol tools for extensible agent capabilities
- **AI Elements** - Pre-built Vercel AI Elements (Conversation, Message, Tool, Reasoning, Sources)
- **Multi-Agent Architecture** - Multiple specialized agents with custom system prompts
- **Streaming Responses** - Real-time streaming with `useChat` hook and `streamText()`
- **Tool Call Visualization** - Rich UI for displaying tool execution and results
- **shadcn/ui Design System** - New York style with neutral base color
- **Tailwind CSS v4** - Modern utility-first styling
- **TypeScript** - Fully typed with strict mode

## Tech Stack

- **Framework**: Next.js 15 with App Router & Turbopack
- **AI**: AI SDK 5 with OpenAI GPT-5
- **UI**: shadcn/ui + AI Elements + Tailwind CSS v4
- **Package Manager**: pnpm (strict requirement)
- **Type Safety**: TypeScript with strict mode

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to interact with the AI assistant

## Available Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production app with Turbopack
- `pnpm start` - Start production server
- `pnpm tsc --noEmit` - Check TypeScript types

## Project Structure

```
app/
├── api/
│   ├── agent-with-mcp-tools/    # MCP-enabled agent endpoint
│   └── doc-for-dummies-agent/   # Documentation retrieval agent
├── agent-with-mcp-tools/        # MCP agent chat UI
├── doc-for-dummies/             # Doc agent chat UI
└── page.tsx                     # Home page

components/
├── agent/                       # Agent configuration
│   ├── tools/                   # AI SDK tools
│   └── *-prompt.ts              # System prompts
├── ai-elements/                 # Vercel AI Elements
├── chat/                        # Chat UI components
└── ui/                          # shadcn/ui components

lib/
└── utils.ts                     # Utility functions (cn, etc.)
```

## Architecture

### AI Agents

The project includes multiple specialized agents:

- **MCP Agent** (`/agent-with-mcp-tools`) - Agent with access to MCP tools
- **Doc For Dummies** (`/doc-for-dummies`) - Documentation retrieval and explanation agent

Each agent has:
- Custom system prompt in `components/agent/`
- Dedicated API route with `streamText()`
- Specialized tool configurations
- Optimized for specific use cases

### Streaming Architecture

```text
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   ChatAssistant │         │   API Route          │         │  OpenAI API │
│   (useChat)     │         │   (streamText)       │         │  (GPT-5)    │
└─────────────────┘         └──────────────────────┘         └─────────────┘
         │                            │                              │
         │ 1. sendMessage({text})     │                              │
         │──────────────────────────>│                              │
         │                            │ 2. streamText({model, ...})  │
         │                            │────────────────────────────>│
         │                            │                              │
         │                            │ 3. Stream chunks + tools     │
         │                            │<────────────────────────────│
         │ 4. Stream UI updates       │                              │
         │<───────────────────────────│                              │
         │                            │                              │
```

### Tool Integration

Tools are defined using AI SDK's `tool()` function with:
- **Description**: Helps model choose the right tool
- **Input Schema**: Zod schema with parameter descriptions
- **Execute Function**: Async implementation with error handling

Tools automatically:
- Stream results to the UI
- Display execution state
- Handle errors gracefully
- Support multi-step execution

### Message Format

Messages use AI SDK's parts-based structure:
```typescript
{
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{
    type: 'text' | 'tool' | 'source-url' | ...;
    text?: string;
    toolName?: string;
    input?: any;
    result?: any;
  }>;
}
```

**Critical**: Always use `sendMessage({ text: "message" })` format - string format does NOT work.

## Adding Components

- **shadcn/ui**: `pnpm dlx shadcn@latest add [component-name]`
- **AI Elements**: `pnpm dlx ai-elements@latest` (adds all components)

## Key Documentation

- [AI SDK 5](https://ai-sdk.dev/) - Core AI integration
- [AI SDK Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) - Tool implementation
- [useChat Hook](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) - Frontend streaming
- [AI Elements](https://ai-sdk.dev/elements/overview) - Pre-built AI components
- [Next.js 15](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library

## Development Guidelines

1. **Always use pnpm** - No npm or yarn
2. **Run type checks** - Execute `pnpm tsc --noEmit` after code changes
3. **Follow existing patterns** - Study `/components/agent/` before creating new agents/tools
4. **Read AI SDK docs** - Always check documentation before implementing AI features
5. **Use proper message format** - `sendMessage({ text })` only, never plain strings
