import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card block p-6 transition hover:border-brand-300 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-ink">{project.name}</h3>
      {project.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{project.description}</p>
      ) : (
        <p className="mt-2 text-sm text-ink-muted/70">No description yet.</p>
      )}
      <p className="mt-4 text-xs text-ink-muted">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </p>
    </Link>
  );
}
