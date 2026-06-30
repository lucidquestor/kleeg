"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentEditor } from "@/components/workspace/DocumentEditor";
import { ProjectChat } from "@/components/workspace/ProjectChat";
import type { ChatMessage, Project, ProjectDocument } from "@/lib/types";
import { cn } from "@/lib/cn";

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 640;
const DEFAULT_CHAT_WIDTH = 380;
const STORAGE_KEY = "kleeg-chat-panel-width";

interface ProjectWorkspaceProps {
  project: Project;
  projectDocument: ProjectDocument;
  messages: ChatMessage[];
}

export function ProjectWorkspace({
  project,
  projectDocument,
  messages,
}: ProjectWorkspaceProps) {
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_CHAT_WIDTH);

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

  const projectContext = [
    project.name,
    project.description,
    projectDocument.plain_text ? `Document:\n${projectDocument.plain_text}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Editor — scrolls inside panel only */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <DocumentEditor projectId={project.id} document={projectDocument} />
      </div>

      {/* Mobile stack divider */}
      <div className="border-t border-white/10 lg:hidden" />

      {/* Resize handle — desktop only */}
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

      {/* Assistant — fixed width, scrolls inside panel only */}
      <div
        style={{ width: chatWidth }}
        className="flex min-h-[420px] shrink-0 flex-col overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-l lg:border-t-0"
      >
        <ProjectChat
          projectId={project.id}
          initialMessages={messages}
          projectContext={projectContext}
        />
      </div>
    </div>
  );
}
