"use client";

import {
  EditorActionsMenu,
  EditorExportMenu,
} from "@/components/workspace/EditorMenus";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { DocumentTabs } from "@/components/workspace/DocumentTabs";
import type { ProjectDocument } from "@/lib/types";

interface WorkspaceTopBarProps {
  documents: ProjectDocument[];
  activeDocumentId: string;
  onSelect: (documentId: string) => void;
  onCreate: () => void;
  onDelete: (documentId: string) => void;
  onRename: (documentId: string, title: string) => void;
  creating?: boolean;
  deletingId?: string | null;
}

export function WorkspaceTopBar({
  documents,
  activeDocumentId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  creating,
  deletingId,
}: WorkspaceTopBarProps) {
  const { editorChrome } = useWorkspace();

  return (
    <div className="workspace-bar shrink-0 justify-between gap-3 px-5 lg:px-8">
      <DocumentTabs
        documents={documents}
        activeDocumentId={activeDocumentId}
        onSelect={onSelect}
        onCreate={onCreate}
        onDelete={onDelete}
        onRename={onRename}
        creating={creating}
        deletingId={deletingId}
        embedded
      />
      {editorChrome ? (
        <div className="flex shrink-0 items-center gap-2">
          {editorChrome.statusLine ? (
            <span
              className={`hidden max-w-[140px] truncate text-[11px] sm:inline ${
                editorChrome.isError ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {editorChrome.statusLine}
            </span>
          ) : null}
          <EditorActionsMenu
            rewriting={editorChrome.rewriting}
            hasSelection={editorChrome.hasSelection}
            onAction={editorChrome.runAction}
          />
          <EditorExportMenu
            onCopy={editorChrome.handleCopy}
            onDownloadTxt={editorChrome.handleDownloadTxt}
            onDownloadDocx={editorChrome.handleDownloadDocx}
          />
        </div>
      ) : null}
    </div>
  );
}
