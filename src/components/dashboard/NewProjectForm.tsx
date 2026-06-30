"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-app p-6">
      <h2 className="text-lg font-semibold text-white">New project</h2>
      <p className="mt-1 text-sm text-app-muted">
        Create a workspace for chat, documents, and AI actions.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="project-name" className="mb-1.5 block text-sm font-medium text-zinc-200">
            Name
          </label>
          <input
            id="project-name"
            required
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
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        ) : null}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
