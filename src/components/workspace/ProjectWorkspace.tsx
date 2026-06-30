"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentEditor } from "@/components/workspace/DocumentEditor";
import { DocumentTabs } from "@/components/workspace/DocumentTabs";
import { ProjectChat } from "@/components/workspace/ProjectChat";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import type { ChatMessage, Project, ProjectDocument } from "@/lib/types";
import { cn } from "@/lib/cn";

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 640;
const DEFAULT_CHAT_WIDTH = 380;
const STORAGE_KEY = "kleeg-chat-panel-width";

interface ProjectWorkspaceProps {
  project: Project;
  initialDocuments: ProjectDocument[];
  initialContextText: string;
  messages: ChatMessage[];
}

export function ProjectWorkspace({
  project,
  initialDocuments,
  initialContextText,
  messages,
}: ProjectWorkspaceProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [activeDocumentId, setActiveDocumentId] = useState(
    initialDocuments[0]?.id ?? "",
  );
  const [contextText, setContextText] = useState(initialContextText);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_CHAT_WIDTH);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) ?? documents[0];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = Number.parseInt(saved, 10);
      if (!Number.isNaN(parsed)) {
        setChatWidth(Math.min(MAX_CHAT_WIDTH, Math.max(MIN_CHAT_WIDTH, parsed)));
      }
    }
  }, []);

  const onResizeMove = useCallback((event: MouseEvent) => {
    const delta = startX.current - event.clientX;
    const next = Math.min(
      MAX_CHAT_WIDTH,
      Math.max(MIN_CHAT_WIDTH, startWidth.current + delta),
    );
    setChatWidth(next);
  }, []);

  const onResizeEnd = useCallback(() => {
    setIsResizing(false);
    setChatWidth((width) => {
      localStorage.setItem(STORAGE_KEY, String(width));
      return width;
    });
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeEnd);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onResizeMove);
      window.removeEventListener("mouseup", onResizeEnd);
    };
  }, [isResizing, onResizeEnd, onResizeMove]);

  function startResize(event: React.MouseEvent) {
    event.preventDefault();
    startX.current = event.clientX;
    startWidth.current = chatWidth;
    setIsResizing(true);
  }

  async function handleDeleteDocument(documentId: string) {
    setDeletingDocId(documentId);
    try {
      const response = await fetch(
        `/api/projects/${project.id}/documents/${documentId}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete document.");

      setDocuments((current) => {
        const next = current.filter((d) => d.id !== documentId);
        if (activeDocumentId === documentId && next[0]) {
          setActiveDocumentId(next[0].id);
        }
        return next;
      });
    } catch {
      // user can retry
    } finally {
      setDeletingDocId(null);
    }
  }

  function handleDocumentTitleChange(documentId: string, title: string) {
    setDocuments((current) =>
      current.map((d) => (d.id === documentId ? { ...d, title } : d)),
    );
  }

  async function handleRenameDocument(documentId: string, title: string) {
    handleDocumentTitleChange(documentId, title);
    try {
      await fetch(`/api/projects/${project.id}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {
      // title still updated locally
    }
  }

  async function handleCreateDocument() {
    setCreatingDoc(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not create document.");
      setDocuments((current) => [...current, data.document]);
      setActiveDocumentId(data.document.id);
    } catch {
      // silent — user can retry
    } finally {
      setCreatingDoc(false);
    }
  }

  const projectContext = [
    project.name,
    project.description,
    contextText.trim() ? `Background context:\n${contextText.trim()}` : "",
    activeDocument?.plain_text ? `Document:\n${activeDocument.plain_text}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  if (!activeDocument) {
    return null;
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DocumentTabs
            documents={documents}
            activeDocumentId={activeDocument.id}
            onSelect={setActiveDocumentId}
            onCreate={() => void handleCreateDocument()}
            onDelete={(id) => void handleDeleteDocument(id)}
            onRename={(id, title) => void handleRenameDocument(id, title)}
            creating={creatingDoc}
            deletingId={deletingDocId}
          />
          <div className="min-h-0 flex-1 overflow-hidden">
            <DocumentEditor
              key={activeDocument.id}
              projectId={project.id}
              document={activeDocument}
            />
          </div>
        </div>

        <div className="border-t border-white/10 lg:hidden" />

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant panel"
          onMouseDown={startResize}
          className={cn(
            "group relative hidden w-3 shrink-0 cursor-col-resize items-center justify-center lg:flex",
            isResizing && "bg-brand-500/10",
          )}
        >
          <div
            className={cn(
              "flex h-12 w-1 flex-col items-center justify-center gap-0.5 rounded-full transition",
              isResizing ? "bg-brand-400" : "bg-white/15 group-hover:bg-brand-400/70",
            )}
          >
            <span className="h-1 w-1 rounded-full bg-white/80" />
            <span className="h-1 w-1 rounded-full bg-white/80" />
            <span className="h-1 w-1 rounded-full bg-white/80" />
          </div>
        </div>

        <div
          style={{ width: chatWidth }}
          className="flex min-h-[420px] shrink-0 flex-col overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0"
        >
          <ProjectChat
            projectId={project.id}
            initialMessages={messages}
            projectContext={projectContext}
            contextText={contextText}
            onContextSaved={setContextText}
          />
        </div>
      </div>
    </WorkspaceProvider>
  );
}
