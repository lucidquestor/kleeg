"use client";

import { useEffect, useRef, useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { ChatMessage, ModelMode } from "@/lib/types";
import { MODEL_MODE_LABELS, MODEL_MODE_SHORT_LABELS } from "@/lib/types";
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
  const [insertStatus, setInsertStatus] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleInsert(content: string, insertMode: "cursor" | "append" | "replace-selection") {
    const ok = insertText(content, insertMode);
    if (ok) {
      setInsertStatus(
        insertMode === "replace-selection"
          ? "Replaced selection"
          : insertMode === "append"
            ? "Appended to document"
            : "Inserted at cursor",
      );
      setTimeout(() => setInsertStatus(null), 2000);
    } else {
      setError("Could not insert — editor not ready.");
    }
  }

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
    <div className="workspace-panel flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 lg:px-5">
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

      <div className="scroll-subtle flex-1 space-y-3 overflow-y-auto px-4 py-4 lg:px-5">
        {messages.length === 0 ? (
          <div className="px-2 py-16 text-center">
            <p className="text-sm font-medium text-zinc-300">Ask Kleeg anything</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
              Plan, draft, translate, or summarize work for this project.
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`}>
            <div
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
            {message.role === "assistant" ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleInsert(message.content, "cursor")}
                  className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  Insert at cursor
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert(message.content, "append")}
                  className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  Append to doc
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert(message.content, "replace-selection")}
                  className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
                >
                  Replace selection
                </button>
              </div>
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

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-white/10 px-4 py-4 lg:px-5">
        {error ? (
          <p className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        ) : null}
        {insertStatus ? (
          <p className="mb-3 text-xs font-medium text-brand-300">{insertStatus}</p>
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
