"use client";

import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { ProjectDocument } from "@/lib/types";

interface DocumentTabsProps {
  documents: ProjectDocument[];
  activeDocumentId: string;
  onSelect: (documentId: string) => void;
  onCreate: () => void;
  creating?: boolean;
}

export function DocumentTabs({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  creating,
}: DocumentTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-5 py-2 lg:px-8">
      {documents.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => onSelect(doc.id)}
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
            doc.id === activeDocumentId
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200",
          )}
        >
          {doc.title || "Untitled"}
        </button>
      ))}
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
