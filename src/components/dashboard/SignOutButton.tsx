"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export function SignOutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={cn(
        variant === "sidebar"
          ? "w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
          : "btn-secondary",
      )}
    >
      Sign out
    </button>
  );
}
