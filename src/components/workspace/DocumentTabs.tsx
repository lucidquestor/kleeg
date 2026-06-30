"use client";

import { useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { ProjectDocument } from "@/lib/types";

interface DocumentTabsProps {
  documents: ProjectDocument[];
  activeDocumentId: string;
  onSelect: (documentId: string) => void;
  onCreate: () => void;
  onDelete: (documentId: string) => void;
  creating?: boolean;
  deletingId?: string | null;
}

export function DocumentTabs({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  onDelete,
  creating,
  deletingId,
}: DocumentTabsProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const canDelete = documents.length > 1;

  function displayTitle(title: string) {
    return title === "Main document" ? "Untitled" : title || "Untitled";
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-5 py-2 lg:px-8">
      {documents.map((doc) => {
        const active = doc.id === activeDocumentId;
        const confirming = confirmDeleteId === doc.id;

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
                <span className="text-[10px] text-zinc-400">Delete?</span>
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
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
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
                    aria-label={`Delete ${displayTitle(doc.title)}`}
                    className={cn(
                      "mr-1 rounded p-1 text-zinc-600 transition hover:bg-red-500/15 hover:text-red-400",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <ActionIcon name="trash" className="h-3 w-3" />
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
        {creating ? "Adding…" : "New doc"}
      </button>
    </div>
  );
}
