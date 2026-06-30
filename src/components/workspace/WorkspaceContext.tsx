"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";

export type InsertMode = "cursor" | "append" | "replace-selection";

interface EditorBridge {
  insertText: (text: string, mode: InsertMode) => void;
  getPlainText: () => string;
}

interface WorkspaceContextValue {
  registerEditor: (bridge: EditorBridge | null) => void;
  insertText: (text: string, mode: InsertMode) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const editorRef = useRef<EditorBridge | null>(null);

  const registerEditor = useCallback((bridge: EditorBridge | null) => {
    editorRef.current = bridge;
  }, []);

  const insertText = useCallback((text: string, mode: InsertMode) => {
    if (!editorRef.current) return false;
    editorRef.current.insertText(text, mode);
    return true;
  }, []);

  const value = useMemo(
    () => ({ registerEditor, insertText }),
    [insertText, registerEditor],
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
