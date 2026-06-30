"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface ProjectContextPanelProps {
  projectId: string;
  initialContext: string;
  onSaved?: (contextText: string) => void;
}

export function ProjectContextPanel({
  projectId,
  initialContext,
  onSaved,
}: ProjectContextPanelProps) {
  const [open, setOpen] = useState(false);
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
      setStatus("Context saved");
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
      setStatus("Only .txt files are supported for now.");
      return;
    }

    const text = await file.text();
    setContextText((current) =>
      current.trim() ? `${current.trim()}\n\n--- ${file.name} ---\n${text}` : text,
    );
    event.target.value = "";
  }

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-left lg:px-5"
      >
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <ActionIcon name="context" className="h-3 w-3" />
          Context
          {contextText.trim() ? (
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          ) : null}
        </span>
        <ActionIcon
          name="chevron"
          className={cn("h-3.5 w-3.5 text-zinc-500 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="space-y-3 px-4 pb-3 lg:px-5">
          <p className="text-xs text-zinc-500">
            Background notes for the assistant — not part of your document.
          </p>
          <textarea
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            className="input-app min-h-28 resize-y text-xs"
            placeholder="Client background, goals, source material…"
            dir="auto"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void saveContext()} className="btn-primary py-2 text-xs">
              {saving ? "Saving…" : "Save context"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/[0.06]"
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
      ) : null}
    </div>
  );
}
