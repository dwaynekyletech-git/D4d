import ChatAssistant from "@/components/chat/chat-assistant";

export default function DocForDummiesPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">Documentation for Dummies Agent</h1>
        <p className="text-sm text-muted-foreground">
          Ask me anything about technical topics and I'll explain it in simple terms
        </p>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatAssistant api="/api/doc-for-dummies-agent" />
      </main>
    </div>
  );
}
