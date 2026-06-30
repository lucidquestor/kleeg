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
    <div className="flex min-h-full flex-col lg:min-h-screen lg:flex-row">
      <div className="min-h-[520px] flex-1 p-4 lg:min-h-0 lg:p-5">
        <DocumentEditor projectId={project.id} document={document} />
      </div>

      <div className="w-full border-t border-white/10 p-4 lg:w-[380px] lg:shrink-0 lg:border-l lg:p-5">
        <ProjectChat
          projectId={project.id}
          initialMessages={messages}
          projectContext={projectContext}
        />
      </div>
    </div>
  );
}
