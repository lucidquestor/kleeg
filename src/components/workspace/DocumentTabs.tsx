"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { ProjectDocument } from "@/lib/types";

interface DocumentTabsProps {
  documents: ProjectDocument[];
  activeDocumentId: string;
  onSelect: (documentId: string) => void;
  onCreate: () => void;
  onDelete: (documentId: string) => void;
  onRename: (documentId: string, title: string) => void;
  creating?: boolean;
  deletingId?: string | null;
  embedded?: boolean;
}

export function DocumentTabs({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  creating,
  deletingId,
  embedded = false,
}: DocumentTabsProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const canDelete = documents.length > 1;

  useEffect(() => {
    if (editingId) editRef.current?.select();
  }, [editingId]);

  function displayTitle(title: string) {
    return title === "Main document" ? "Untitled" : title || "Untitled";
  }

  function startRename(doc: ProjectDocument) {
    setEditingId(doc.id);
    setEditTitle(displayTitle(doc.title));
  }

  function commitRename(documentId: string) {
    const trimmed = editTitle.trim() || "Untitled";
    onRename(documentId, trimmed);
    setEditingId(null);
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto",
        !embedded && "workspace-bar border-b border-white/[0.06] px-5 lg:px-8",
      )}
    >
      {documents.map((doc) => {
        const active = doc.id === activeDocumentId;
        const confirming = confirmDeleteId === doc.id;
        const editing = editingId === doc.id;

        return (
          <div
            key={doc.id}
            className={cn(
              "group flex shrink-0 items-center rounded-md transition",
              active ? "bg-white/10" : "hover:bg-white/[0.06]",
            )}
          >
            {confirming ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <span className="text-[10px] text-zinc-400">Remove?</span>
                <button
                  type="button"
                  disabled={deletingId === doc.id}
                  onClick={() => {
                    onDelete(doc.id);
                    setConfirmDeleteId(null);
                  }}
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-400 hover:bg-red-500/15"
                >
                  {deletingId === doc.id ? "…" : "Yes"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300"
                >
                  No
                </button>
              </div>
            ) : editing ? (
              <input
                ref={editRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => commitRename(doc.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(doc.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-28 bg-transparent px-2.5 py-1.5 text-xs font-medium text-white outline-none"
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  onDoubleClick={() => startRename(doc)}
                  title="Double-click to rename"
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium transition",
                    active ? "text-white" : "text-zinc-500 group-hover:text-zinc-200",
                  )}
                >
                  {displayTitle(doc.title)}
                </button>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(doc.id)}
                    aria-label={`Close ${displayTitle(doc.title)}`}
                    className={cn(
                      "mr-1 flex h-4 w-4 items-center justify-center rounded-full text-zinc-600 transition hover:bg-white/10 hover:text-zinc-300",
                      active ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70",
                    )}
                  >
                    <ActionIcon name="close" className="h-2.5 w-2.5" strokeWidth={2} />
                  </button>
                ) : null}
              </>
            )}
          </div>
        );
      })}
      <button
        type="button"
        disabled={creating}
        onClick={onCreate}
        className="ml-1 flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-50"
      >
        <ActionIcon name="plus" className="h-3 w-3" />
        {creating ? "…" : "New doc"}
      </button>
    </div>
  );
}
