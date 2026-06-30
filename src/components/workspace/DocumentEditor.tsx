"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import type { ProjectDocument } from "@/lib/types";
import { aiTextToHtml } from "@/lib/format";

const ACTIONS = [
  { id: "improve", label: "Improve writing" },
  { id: "professional", label: "More professional" },
  { id: "shorten", label: "Shorten" },
  { id: "translate_en", label: "Translate → English" },
  { id: "translate_he", label: "Translate → Hebrew" },
  { id: "translate_yi", label: "Translate → Yiddish" },
  { id: "summarize", label: "Summarize" },
  { id: "email", label: "Turn into email" },
] as const;

interface DocumentEditorProps {
  projectId: string;
  document: ProjectDocument;
}

export function DocumentEditor({ projectId, document }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      },
    },
  });

  const saveDocument = useCallback(async () => {
    if (!editor) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: editor.getJSON(),
          plainText: editor.getText(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save document.");
      }

      setStatus("Saved");
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save document.");
    } finally {
      setSaving(false);
    }
  }, [editor, projectId, title]);

  useEffect(() => {
    if (!editor) return;

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

  async function runAction(actionId: string) {
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
          mode: "writing",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Rewrite failed.");
      }

      editor.commands.setContent(aiTextToHtml(data.content));
      await saveDocument();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setRewriting(null);
    }
  }

  return (
    <div className="workspace-panel h-full">
      <div className="border-b border-border px-4 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none"
          placeholder="Document title"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={Boolean(rewriting)}
              onClick={() => runAction(action.id)}
              className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink transition hover:border-brand-300 disabled:opacity-60"
            >
              {rewriting === action.id ? "Working…" : action.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
          {saving ? <span>Saving…</span> : null}
          {status ? <span className="text-brand-700">{status}</span> : null}
          {error ? <span className="text-red-600">{error}</span> : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
