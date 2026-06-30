import Link from "next/link";
import { KleegMark } from "@/components/ui/icons";

interface WorkspaceSidebarProps {
  projectName: string;
  projectDescription?: string | null;
}

export function WorkspaceSidebar({
  projectName,
  projectDescription,
}: WorkspaceSidebarProps) {
  return (
    <aside className="workspace-sidebar">
      <div className="border-b border-white/10 p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <KleegMark />
          <div>
            <p className="text-sm font-semibold text-white">Kleeg</p>
            <p className="text-[11px] text-sidebar-muted">Workspace</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 p-4">
        <Link
          href="/dashboard"
          className="text-xs font-medium text-sidebar-muted transition hover:text-white"
        >
          ← All projects
        </Link>
        <h1 className="mt-4 text-lg font-semibold leading-snug text-white">
          {projectName}
        </h1>
        {projectDescription ? (
          <p className="mt-2 text-xs leading-relaxed text-sidebar-muted">
            {projectDescription}
          </p>
        ) : null}

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
            Training
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
            When you edit AI output, Kleeg saves your corrections to improve future
            models.
          </p>
        </div>
      </div>
    </aside>
  );
}
