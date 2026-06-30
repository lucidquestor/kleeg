"use client";

import { useEffect, useRef, useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { ChatMessage, ModelMode } from "@/lib/types";
import { MODEL_MODE_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ProjectChatProps {
  projectId: string;
  initialMessages: ChatMessage[];
  projectContext?: string;
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
}: ProjectChatProps) {
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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
    <div className="workspace-panel h-full lg:max-h-[calc(100vh-2.5rem)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-app-panel-hover px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Assistant</h2>
          <p className="text-xs text-zinc-500">Knows your project context</p>
        </div>
        <CustomSelect
          value={mode}
          onChange={setMode}
          ariaLabel="AI model mode"
          options={(
            Object.entries(MODEL_MODE_LABELS) as [ModelMode, string][]
          ).map(([value, label]) => ({
            value,
            label,
            description:
              value === "auto"
                ? "Balanced default"
                : value === "fast"
                  ? "Quick responses"
                  : value === "best"
                    ? "Deep thinking"
                    : "Polished prose",
          }))}
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-400/30 bg-brand-500/10 px-4 py-10 text-center">
            <p className="text-sm font-medium text-brand-200">Ask Kleeg anything</p>
            <p className="mt-1 text-xs text-zinc-500">
              Plan, draft, translate, or summarize work for this project.
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant",
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.model ? (
              <p className="mt-2 text-[10px] uppercase tracking-wide opacity-60">
                {message.model}
              </p>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="chat-bubble-assistant animate-pulse text-zinc-500">
            Kleeg is thinking…
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 bg-app-panel p-4">
        {error ? (
          <p className="mb-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        ) : null}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            className="input-app min-h-[52px] flex-1 resize-none"
            placeholder="Ask Kleeg anything about this project…"
            dir="auto"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
