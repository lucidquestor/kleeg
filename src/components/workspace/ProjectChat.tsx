"use client";

import { useEffect, useRef, useState } from "react";
import { ChatComposer, InsertMenu } from "@/components/workspace/ChatComposer";
import { ProjectContextPanel } from "@/components/workspace/ProjectContextPanel";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { ChatMessage, ModelMode } from "@/lib/types";
import { MODEL_MODE_LABELS, MODEL_MODE_SHORT_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ProjectChatProps {
  projectId: string;
  initialMessages: ChatMessage[];
  projectContext?: string;
  contextText?: string;
  onContextSaved?: (text: string) => void;
}

interface UiMessage {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

export function ProjectChat({
  projectId,
  initialMessages,
  projectContext = "",
  contextText = "",
  onContextSaved,
}: ProjectChatProps) {
  const { insertText } = useWorkspace();
  const [messages, setMessages] = useState<UiMessage[]>(
    initialMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        model: m.model ?? undefined,
      })),
  );
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ModelMode>("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: UiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          mode,
          projectContext,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Chat request failed.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.content, model: data.model },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace-panel flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5 lg:px-5">
        <h2 className="text-sm font-medium text-zinc-200">Assistant</h2>
        <CustomSelect
          value={mode}
          onChange={setMode}
          ariaLabel="AI model mode"
          options={(
            Object.entries(MODEL_MODE_LABELS) as [ModelMode, string][]
          ).map(([value, label]) => ({
            value,
            label,
            shortLabel: MODEL_MODE_SHORT_LABELS[value],
            description:
              value === "auto"
                ? "Recommended default"
                : value === "fast"
                  ? "Quick responses"
                  : value === "best"
                    ? "Deep thinking"
                    : "Polished prose",
          }))}
        />
      </div>

      <ProjectContextPanel
        projectId={projectId}
        initialContext={contextText}
        onSaved={onContextSaved}
      />

      <div className="scroll-subtle flex-1 space-y-3 overflow-y-auto px-4 py-3 lg:px-5">
        {messages.length === 0 && !loading ? (
          <p className="py-12 text-center text-xs text-zinc-600">
            Ask anything about this project.
          </p>
        ) : null}

        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`}>
            <div
              className={cn(
                message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant",
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "assistant" ? (
              <InsertMenu onInsert={(mode) => insertText(message.content, mode)} />
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="chat-bubble-assistant animate-pulse text-xs text-zinc-500">
            Thinking…
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3 lg:px-5">
        {error ? (
          <p className="mb-2 text-[11px] text-red-400">{error}</p>
        ) : null}
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={() => void handleSubmit()}
          loading={loading}
        />
      </div>
    </div>
  );
}
