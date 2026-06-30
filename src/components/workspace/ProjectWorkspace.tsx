import { DocumentEditor } from "@/components/workspace/DocumentEditor";
import { ProjectChat } from "@/components/workspace/ProjectChat";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
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
    <div className="workspace-shell flex min-h-screen flex-col lg:flex-row">
      <WorkspaceSidebar
        projectName={project.name}
        projectDescription={project.description}
      />

      <div className="flex min-h-0 flex-1 flex-col bg-surface lg:flex-row">
        <div className="min-h-[520px] flex-1 p-4 lg:min-h-screen lg:p-5">
          <DocumentEditor projectId={project.id} document={document} />
        </div>

        <div className="w-full border-t border-border bg-surface p-4 lg:min-h-screen lg:w-[380px] lg:shrink-0 lg:border-l lg:border-t-0 lg:p-5">
          <ProjectChat
            projectId={project.id}
            initialMessages={messages}
            projectContext={projectContext}
          />
        </div>
      </div>
    </div>
  );
}
