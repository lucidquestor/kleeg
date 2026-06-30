import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card card-hover group block p-6"
    >
      <div className="mb-3 h-1 w-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition group-hover:w-12" />
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
