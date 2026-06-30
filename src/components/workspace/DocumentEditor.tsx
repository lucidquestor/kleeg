"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { ACTION_GROUPS, type ActionId } from "@/lib/editor-actions";
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
  const [title, setTitle] = useState(document.title);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState<ActionId | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  });

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
          return true;
        }
      } catch {
        // Non-blocking — document save still succeeded.
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
      const response = await fetch(`/api/projects/${projectId}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getJSON(),
          plainText,
        }),
      });

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
  }, [editor, logCorrectionIfNeeded, projectId, title]);

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

    const text = editor.getText().trim();
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

      editor.commands.setContent(aiTextToHtml(data.content));
      const dir = detectTextDirection(data.content);
      editor.view.dom.setAttribute("dir", dir);
      await saveDocument();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setRewriting(null);
    }
  }

  return (
    <div className="workspace-panel h-full">
      <div className="border-b border-border bg-gradient-to-r from-brand-50/50 to-white px-5 py-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-base font-semibold text-ink outline-none"
          placeholder="Document title"
        />
        <div className="mt-4 space-y-3">
          {ACTION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
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
        <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
          {saving ? <span className="text-brand-600">Saving…</span> : null}
          {status ? <span className="font-medium text-brand-700">{status}</span> : null}
          {error ? <span className="text-red-600">{error}</span> : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
