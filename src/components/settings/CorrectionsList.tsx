import Link from "next/link";
import type { AiCorrection } from "@/lib/types";

interface CorrectionsListProps {
  corrections: AiCorrection[];
}

export function CorrectionsList({ corrections }: CorrectionsListProps) {
  if (corrections.length === 0) {
    return (
      <div className="card-app px-6 py-16 text-center">
        <p className="text-sm text-app-muted">No corrections logged yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Run an AI action on your document, edit the result, and Kleeg saves your fix
          automatically.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.06]"
        >
          Go to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((item) => (
        <article key={item.id} className="card-app p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded bg-white/10 px-2 py-0.5 font-medium uppercase tracking-wide text-zinc-300">
              {item.action.replace(/_/g, " ")}
            </span>
            {item.language ? <span>{item.language}</span> : null}
            <span>{new Date(item.created_at).toLocaleString()}</span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Original
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400 line-clamp-6 whitespace-pre-wrap">
                {item.source_text}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                AI output
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300 line-clamp-6 whitespace-pre-wrap">
                {item.ai_output}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                Your correction
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white line-clamp-6 whitespace-pre-wrap">
                {item.corrected_text}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
