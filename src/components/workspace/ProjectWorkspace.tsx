import Link from "next/link";
import { DocumentEditor } from "@/components/workspace/DocumentEditor";
import { ProjectChat } from "@/components/workspace/ProjectChat";
import type { ChatMessage, Project, ProjectDocument } from "@/lib/types";

interface ProjectWorkspaceProps {
  project: Project;
  document: ProjectDocument;
  messages: ChatMessage[];
}

export function ProjectWorkspace({
  project,
  document,
  messages,
}: ProjectWorkspaceProps) {
  const projectContext = [
    project.name,
    project.description,
    document.plain_text ? `Document:\n${document.plain_text}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              ← All projects
            </Link>
            <h1 className="mt-1 text-xl font-semibold text-ink">{project.name}</h1>
            {project.description ? (
              <p className="mt-1 max-w-2xl text-sm text-ink-muted">{project.description}</p>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:h-[calc(100vh-88px)] lg:grid-cols-2 lg:py-6">
        <div className="min-h-[480px] lg:min-h-0">
          <DocumentEditor projectId={project.id} document={document} />
        </div>
        <div className="min-h-[480px] lg:min-h-0">
          <ProjectChat
            projectId={project.id}
            initialMessages={messages}
            projectContext={projectContext}
          />
        </div>
      </main>
    </div>
  );
}
