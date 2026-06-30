"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface SidebarProfileMenuProps {
  userEmail: string;
}

function getInitials(email: string) {
  const name = email.split("@")[0] ?? "U";
  return name.slice(0, 2).toUpperCase();
}

export function SidebarProfileMenu({ userEmail }: SidebarProfileMenuProps) {
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
    <div ref={menuRef} className="relative border-t border-white/10 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition",
          open ? "bg-white/10" : "hover:bg-white/5",
        )}
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-semibold text-white">
          {getInitials(userEmail)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-white">
            {userEmail.split("@")[0]}
          </span>
          <span className="block truncate text-[10px] text-sidebar-muted">
            {userEmail}
          </span>
        </span>
        <ActionIcon
          name="chevron"
          className={cn("shrink-0 text-sidebar-muted transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl border border-white/10 bg-[#1f1f23] py-1 shadow-xl shadow-black/40">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/10"
          >
            <ActionIcon name="settings" className="text-sidebar-muted" />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/10"
          >
            <ActionIcon name="logout" className="text-sidebar-muted" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
