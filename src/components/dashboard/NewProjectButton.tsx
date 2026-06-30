"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { PROJECT_TEMPLATES } from "@/lib/project-templates";
import { cn } from "@/lib/cn";

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("blank");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeModal() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          templateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create project.");
      }

      setOpen(false);
      setName("");
      setDescription("");
      setTemplateId("blank");
      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <ActionIcon name="plus" className="h-4 w-4" />
        New project
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="card-app max-h-[90vh] w-full max-w-md overflow-y-auto p-6 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">New project</h2>
                <p className="mt-1 text-sm text-app-muted">
                  Create a workspace for chat, documents, and AI actions.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <ActionIcon name="close" className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1.5 block text-sm font-medium text-zinc-200"
                >
                  Name
                </label>
                <input
                  id="project-name"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-app"
                  placeholder="Client proposal, website build, newsletter…"
                />
              </div>
              <div>
                <label
                  htmlFor="project-description"
                  className="mb-1.5 block text-sm font-medium text-zinc-200"
                >
                  Description (optional)
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-app min-h-20 resize-y"
                  placeholder="What is this project about?"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-zinc-200">Template</p>
                <div className="space-y-2">
                  {PROJECT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setTemplateId(template.id)}
                      className={cn(
                        "w-full rounded-md border px-3 py-2.5 text-left transition",
                        templateId === template.id
                          ? "border-brand-400/40 bg-brand-500/10"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20",
                      )}
                    >
                      <span className="block text-sm font-medium text-zinc-200">
                        {template.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {template.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Creating…" : "Create project"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={closeModal}
                  className="rounded-md border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
