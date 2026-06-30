"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  variant?: "sidebar" | "card";
  className?: string;
}

export function DeleteProjectButton({
  projectId,
  projectName,
  variant = "sidebar",
  className,
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete project.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const ok = window.confirm(
            `Delete "${projectName}"? This cannot be undone.`,
          );
          if (ok) await handleDelete();
        }}
        className={cn(
          "rounded-lg p-1.5 text-ink-muted opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600",
          className,
        )}
        aria-label={`Delete ${projectName}`}
      >
        <ActionIcon name="trash" className="h-4 w-4" />
      </button>
    );
  }

  if (confirming) {
    return (
      <div
        className={cn(
          "rounded-xl border border-red-500/30 bg-red-500/10 p-3",
          className,
        )}
      >
        <p className="text-xs leading-relaxed text-red-100">
          Delete <strong className="text-white">{projectName}</strong>? This cannot be
          undone.
        </p>
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200",
        className,
      )}
    >
      <ActionIcon name="trash" className="h-3.5 w-3.5" />
      Delete project
    </button>
  );
}
