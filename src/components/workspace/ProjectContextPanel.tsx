"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface ProjectContextPanelProps {
  projectId: string;
  initialContext: string;
  onSaved?: (contextText: string) => void;
  open: boolean;
}

export function ProjectContextPanel({
  projectId,
  initialContext,
  onSaved,
  open,
}: ProjectContextPanelProps) {
  const [contextText, setContextText] = useState(initialContext);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContextText(initialContext);
  }, [initialContext]);

  const saveContext = useCallback(async () => {
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/context`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save context.");
      onSaved?.(contextText);
      setStatus("Saved");
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [contextText, onSaved, projectId]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
      setStatus("Only .txt files supported.");
      return;
    }

    const text = await file.text();
    setContextText((current) =>
      current.trim() ? `${current.trim()}\n\n--- ${file.name} ---\n${text}` : text,
    );
    event.target.value = "";
  }

  if (!open) return null;

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 lg:px-5">
      <p className="text-[11px] text-zinc-500">
        Background notes for the assistant — not part of your document.
      </p>
      <textarea
        value={contextText}
        onChange={(e) => setContextText(e.target.value)}
        className="input-app mt-2 min-h-24 resize-y text-xs"
        placeholder="Client background, goals, source material…"
        dir="auto"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void saveContext()} className="btn-primary py-1.5 text-xs">
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.06]"
        >
          Upload .txt
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => void handleFileUpload(e)}
        />
        {status ? <span className="text-xs text-zinc-500">{status}</span> : null}
      </div>
    </div>
  );
}

interface ContextToggleProps {
  active: boolean;
  hasContent: boolean;
  onClick: () => void;
}

export function ContextToggle({ active, hasContent, onClick }: ContextToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition",
        active
          ? "border-brand-400/30 bg-brand-500/10 text-brand-200"
          : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300",
      )}
    >
      <ActionIcon name="context" className="h-3 w-3" />
      Context
      {hasContent ? <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> : null}
    </button>
  );
}
