import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { docForDummiesPrompt } from "@/components/agent/doc-for-dummies-prompt";
import { retrieveDocumentation } from "@/components/agent/tools";

/**
 * Documentation for Dummies Agent API Route
 *
 * This endpoint accepts user messages and returns streaming AI responses
 * with simplified technical explanations. Uses Context7 MCP for documentation retrieval.
 */
export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert UI messages to model messages
    const modelMessages = convertToModelMessages(messages);

    // Stream AI response with documentation retrieval tool
    const result = streamText({
      model: openai("gpt-4o"),
      system: docForDummiesPrompt,
      messages: modelMessages,
      tools: {
        retrieveDocumentation,
      },
      toolChoice: "auto", // Let model decide when to use tools
      stopWhen: stepCountIs(5), // Allow up to 5 steps (tool calls + responses)
    });

    // Return streaming response with tool support
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("💥 API route error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
