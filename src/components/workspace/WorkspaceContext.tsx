"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ActionId } from "@/lib/editor-actions";

export type InsertMode = "cursor" | "append" | "replace-selection";

interface EditorBridge {
  insertText: (text: string, mode: InsertMode) => void;
  getPlainText: () => string;
}

export interface EditorChrome {
  rewriting: ActionId | null;
  hasSelection: boolean;
  statusLine: string | null;
  isError: boolean;
  runAction: (id: ActionId) => void;
  handleCopy: () => void;
  handleDownloadTxt: () => void;
  handleDownloadDocx: () => void;
}

interface WorkspaceContextValue {
  registerEditor: (bridge: EditorBridge | null) => void;
  insertText: (text: string, mode: InsertMode) => boolean;
  editorChrome: EditorChrome | null;
  setEditorChrome: (chrome: EditorChrome | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [editorBridge, setEditorBridge] = useState<EditorBridge | null>(null);
  const [editorChrome, setEditorChrome] = useState<EditorChrome | null>(null);

  const registerEditor = useCallback((bridge: EditorBridge | null) => {
    setEditorBridge(bridge);
  }, []);

  const insertText = useCallback(
    (text: string, mode: InsertMode) => {
      if (!editorBridge) return false;
      editorBridge.insertText(text, mode);
      return true;
    },
    [editorBridge],
  );

  const value = useMemo(
    () => ({
      registerEditor,
      insertText,
      editorChrome,
      setEditorChrome,
    }),
    [editorChrome, insertText, registerEditor],
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
