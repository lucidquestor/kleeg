"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="workspace-panel h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Assistant</h2>
          <p className="text-xs text-ink-muted">Chat with your project context</p>
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ModelMode)}
          className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs text-ink"
        >
          {Object.entries(MODEL_MODE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-ink-muted">
            Ask Kleeg to plan, draft, translate, or summarize work for this project.
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              message.role === "user"
                ? "ml-auto bg-brand-600 text-white"
                : "bg-surface text-ink",
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.model ? (
              <p className="mt-2 text-[10px] uppercase tracking-wide opacity-70">
                {message.model}
              </p>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="max-w-[92%] rounded-2xl bg-surface px-4 py-3 text-sm text-ink-muted">
            Kleeg is thinking…
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        {error ? (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            className="input-field min-h-[52px] flex-1 resize-none"
            placeholder="Ask Kleeg anything about this project…"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
