import Link from "next/link";
import { KleegMark } from "@/components/ui/icons";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <KleegMark />
            <span className="text-lg font-semibold text-ink">Kleeg</span>
          </Link>
          <nav className="hidden text-sm text-ink-muted sm:block">
            <Link href="/dashboard" className="transition hover:text-brand-700">
              Projects
            </Link>
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
