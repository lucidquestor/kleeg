"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface AppTopBarProps {
  userEmail: string;
}

function getInitials(email: string) {
  const name = email.split("@")[0] ?? "U";
  return name.slice(0, 2).toUpperCase();
}

export function AppTopBar({ userEmail }: AppTopBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-end gap-3">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-2 py-1.5 shadow-sm transition hover:border-brand-200 hover:bg-brand-50/50"
            aria-label="Account menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
              {getInitials(userEmail)}
            </span>
            <span className="hidden max-w-[140px] truncate text-xs text-ink-muted sm:block">
              {userEmail}
            </span>
            <ActionIcon
              name="chevron"
              className={cn("hidden text-ink-muted sm:block", open && "rotate-180")}
            />
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg shadow-black/10">
              <div className="border-b border-border px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Account
                </p>
                <p className="mt-0.5 truncate text-xs text-ink">{userEmail}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink transition hover:bg-brand-50"
              >
                <ActionIcon name="settings" className="text-ink-muted" />
                Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink transition hover:bg-brand-50"
              >
                <ActionIcon name="logout" className="text-ink-muted" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
