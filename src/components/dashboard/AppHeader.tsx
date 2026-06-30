import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export function AppHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-ink">
            Kleeg
          </Link>
          <nav className="hidden text-sm text-ink-muted sm:block">
            <Link href="/dashboard" className="hover:text-ink">
              Projects
            </Link>
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
