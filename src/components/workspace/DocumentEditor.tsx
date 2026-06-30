"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import {
  type InsertMode,
  useWorkspace,
} from "@/components/workspace/WorkspaceContext";
import { ACTION_GROUPS, type ActionId } from "@/lib/editor-actions";
import {
  copyTextToClipboard,
  downloadDocxFile,
  downloadTextFile,
  sanitizeFilename,
} from "@/lib/export-document";
import { aiTextToHtml } from "@/lib/format";
import { detectTextDirection, guessLanguageFromAction } from "@/lib/language";
import type { ProjectDocument } from "@/lib/types";
import { cn } from "@/lib/cn";

interface PendingCorrection {
  action: ActionId;
  sourceText: string;
  aiOutput: string;
}

interface DocumentEditorProps {
  projectId: string;
  document: ProjectDocument;
}

export function DocumentEditor({ projectId, document }: DocumentEditorProps) {
  const { registerEditor } = useWorkspace();
  const [title, setTitle] = useState(document.title);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState<ActionId | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const pendingCorrection = useRef<PendingCorrection | null>(null);
  const loggedCorrectionKeys = useRef<Set<string>>(new Set());

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing, or paste text for Kleeg to rewrite…",
      }),
    ],
    content: document.content,
    editorProps: {
      attributes: {
        class: "ProseMirror",
        dir: "auto",
      },
    },
    onUpdate({ editor: ed }) {
      const dir = detectTextDirection(ed.getText());
      ed.view.dom.setAttribute("dir", dir);
    },
    onSelectionUpdate({ editor: ed }) {
      const { from, to } = ed.state.selection;
      setHasSelection(from !== to);
    },
  });

  useEffect(() => {
    setTitle(document.title);
  }, [document.id, document.title]);

  const logCorrectionIfNeeded = useCallback(
    async (plainText: string) => {
      const pending = pendingCorrection.current;
      if (!pending) return;

      const corrected = plainText.trim();
      const aiOutput = pending.aiOutput.trim();

      if (!corrected || corrected === aiOutput) return;

      const key = `${pending.action}:${aiOutput.slice(0, 80)}:${corrected.slice(0, 80)}`;
      if (loggedCorrectionKeys.current.has(key)) return;

      try {
        const response = await fetch("/api/corrections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            documentId: document.id,
            action: pending.action,
            sourceText: pending.sourceText,
            aiOutput: pending.aiOutput,
            correctedText: corrected,
            language: guessLanguageFromAction(pending.action),
          }),
        });

        if (response.ok) {
          loggedCorrectionKeys.current.add(key);
          pendingCorrection.current = null;
          setStatus("Saved · correction logged for training");
          setTimeout(() => setStatus(null), 3000);
        }
      } catch {
        // Non-blocking
      }
    },
    [document.id, projectId],
  );

  const saveDocument = useCallback(async () => {
    if (!editor) return;

    const plainText = editor.getText();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${document.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: editor.getJSON(),
            plainText,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save document.");
      }

      await logCorrectionIfNeeded(plainText);

      if (pendingCorrection.current) {
        setStatus("Saved");
        setTimeout(() => setStatus(null), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save document.");
    } finally {
      setSaving(false);
    }
  }, [document.id, editor, logCorrectionIfNeeded, projectId, title]);

  const insertText = useCallback(
    (text: string, mode: InsertMode) => {
      if (!editor) return;

      const html = aiTextToHtml(text);
      const dir = detectTextDirection(text);

      if (mode === "replace-selection" && !editor.state.selection.empty) {
        editor.chain().focus().deleteSelection().insertContent(html).run();
      } else if (mode === "append") {
        const end = editor.state.doc.content.size;
        editor.chain().focus().insertContentAt(end, html).run();
      } else {
        editor.chain().focus().insertContent(html).run();
      }

      editor.view.dom.setAttribute("dir", dir);
      void saveDocument();
      setStatus("Inserted from assistant");
      setTimeout(() => setStatus(null), 2000);
    },
    [editor, saveDocument],
  );

  useEffect(() => {
    if (!editor) return;

    registerEditor({
      insertText,
      getPlainText: () => editor.getText(),
    });

    return () => registerEditor(null);
  }, [editor, insertText, registerEditor]);

  useEffect(() => {
    if (!editor) return;

    const dir = detectTextDirection(editor.getText());
    editor.view.dom.setAttribute("dir", dir);

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleSave = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        void saveDocument();
      }, 1500);
    };

    editor.on("update", scheduleSave);
    return () => {
      editor.off("update", scheduleSave);
      if (timeout) clearTimeout(timeout);
    };
  }, [editor, saveDocument]);

  async function runAction(actionId: ActionId) {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "\n").trim();
    const text = selectedText || editor.getText().trim();
    const selectionActive = Boolean(selectedText);

    if (!text) {
      setError("Add some text before running an AI action.");
      return;
    }

    setRewriting(actionId);
    setError(null);

    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: actionId,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Rewrite failed.");
      }

      pendingCorrection.current = {
        action: actionId,
        sourceText: text,
        aiOutput: data.content,
      };

      const html = aiTextToHtml(data.content);
      if (selectionActive) {
        editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, html).run();
      } else {
        editor.commands.setContent(html);
      }

      const dir = detectTextDirection(data.content);
      editor.view.dom.setAttribute("dir", dir);
      await saveDocument();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setRewriting(null);
    }
  }

  async function handleCopy() {
    if (!editor) return;
    try {
      await copyTextToClipboard(editor.getText());
      setStatus("Copied to clipboard");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function handleDownloadTxt() {
    if (!editor) return;
    downloadTextFile(editor.getText(), `${sanitizeFilename(title)}.txt`);
  }

  async function handleDownloadDocx() {
    if (!editor) return;
    try {
      await downloadDocxFile(editor.getText(), sanitizeFilename(title));
    } catch {
      setError("Could not export document.");
    }
  }

  return (
    <div className="workspace-panel flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 px-5 py-4 lg:px-8">
        <div className="flex items-start gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void saveDocument()}
            className="min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-zinc-500"
            placeholder="Document title"
          />
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="action-chip py-1"
              title="Copy all text"
            >
              <ActionIcon name="copy" />
              Copy
            </button>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="action-chip py-1"
              title="Download as .txt"
            >
              <ActionIcon name="download" />
              .txt
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadDocx()}
              className="action-chip py-1"
              title="Download as .docx"
            >
              <ActionIcon name="download" />
              .docx
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {ACTION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={Boolean(rewriting)}
                    onClick={() => runAction(action.id)}
                    className={cn(
                      "action-chip",
                      rewriting === action.id && "action-chip-active",
                    )}
                  >
                    <ActionIcon name={action.icon} />
                    {rewriting === action.id ? "Working…" : action.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          {hasSelection ? (
            <span className="text-brand-300">Actions apply to selected text</span>
          ) : (
            <span>Tip: highlight text to rewrite only that part</span>
          )}
          {saving ? <span className="text-brand-400">Saving…</span> : null}
          {status ? <span className="font-medium text-brand-300">{status}</span> : null}
          {error ? <span className="text-red-400">{error}</span> : null}
        </div>
      </div>

      <div className="scroll-subtle flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
