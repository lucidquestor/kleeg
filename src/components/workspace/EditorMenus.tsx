"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { ACTION_GROUPS, type ActionId } from "@/lib/editor-actions";
import { cn } from "@/lib/cn";

interface EditorActionsMenuProps {
  rewriting: ActionId | null;
  hasSelection: boolean;
  onAction: (actionId: ActionId) => void;
}

export function EditorActionsMenu({
  rewriting,
  hasSelection,
  onAction,
}: EditorActionsMenuProps) {
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={Boolean(rewriting)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition",
          open || rewriting
            ? "border-brand-400/40 bg-brand-500/10 text-brand-200"
            : "border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]",
        )}
      >
        <ActionIcon name="sparkles" />
        {rewriting ? "Working…" : "Rewrite"}
        {hasSelection ? (
          <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] text-zinc-400">Sel</span>
        ) : null}
        <ActionIcon name="chevron" className={cn("transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border border-white/10 bg-[#1c1c22] py-1 shadow-lg shadow-black/40">
          {ACTION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-0.5 pt-2 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                {group.label}
              </p>
              {group.actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    onAction(action.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-white/[0.06]",
                    rewriting === action.id ? "text-brand-200" : "text-zinc-300",
                  )}
                >
                  <ActionIcon name={action.icon} />
                  {action.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface EditorExportMenuProps {
  onCopy: () => void;
  onDownloadTxt: () => void;
  onDownloadDocx: () => void;
}

export function EditorExportMenu({
  onCopy,
  onDownloadTxt,
  onDownloadDocx,
}: EditorExportMenuProps) {
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Export"
        className="rounded-md border border-white/10 p-1.5 text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-200"
      >
        <ActionIcon name="download" className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-36 rounded-md border border-white/10 bg-[#1c1c22] py-1 shadow-lg shadow-black/40">
          {[
            { label: "Copy text", action: onCopy },
            { label: "Download .txt", action: onDownloadTxt },
            { label: "Download .docx", action: onDownloadDocx },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.action();
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
