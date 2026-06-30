"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import type { InsertMode } from "@/components/workspace/WorkspaceContext";
import { cn } from "@/lib/cn";

interface InsertMenuProps {
  onInsert: (mode: InsertMode) => void;
}

export function InsertMenu({ onInsert }: InsertMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] font-medium text-zinc-500 transition hover:text-zinc-300"
      >
        Insert into doc ▾
      </button>

      {open ? (
        <div className="absolute left-0 z-10 mt-0.5 w-40 rounded-md border border-white/10 bg-[#1c1c22] py-1 shadow-lg shadow-black/40">
          {[
            { label: "At cursor", mode: "cursor" as InsertMode },
            { label: "Append to end", mode: "append" as InsertMode },
            { label: "Replace selection", mode: "replace-selection" as InsertMode },
          ].map((item) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => {
                onInsert(item.mode);
                setOpen(false);
              }}
              className="flex w-full px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:bg-white/[0.06]"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ChatComposer({ value, onChange, onSubmit, loading }: ChatComposerProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !loading) onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="max-h-28 min-h-[22px] flex-1 resize-none bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
        placeholder="Message Kleeg…"
        dir="auto"
      />
      <button
        type="button"
        disabled={loading || !value.trim()}
        onClick={onSubmit}
        aria-label="Send"
        className={cn(
          "mb-0.5 rounded-md p-1.5 transition disabled:opacity-40",
          value.trim()
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "text-zinc-600",
        )}
      >
        <ActionIcon name="send" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
