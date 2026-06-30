"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not create project.");
      setLoading(false);
      return;
    }

    setOpen(false);
    setName("");
    setDescription("");
    router.push(`/projects/${data.id}`);
    router.refresh();
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
            className="card-app w-full max-w-md p-6 shadow-2xl shadow-black/50"
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
                  className="input-app min-h-24 resize-y"
                  placeholder="What is this project about?"
                />
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
