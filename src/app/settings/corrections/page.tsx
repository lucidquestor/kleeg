import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CorrectionsList } from "@/components/settings/CorrectionsList";
import { createClient } from "@/lib/supabase/server";
import type { AiCorrection } from "@/lib/types";

export const metadata = {
  title: "Corrections",
};

export default async function CorrectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: corrections } = user
    ? await supabase
        .from("ai_corrections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/settings"
          className="text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          ← Settings
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-400">
          Training data
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Your corrections</h1>
        <p className="mt-2 max-w-xl text-app-muted">
          Edits you made after AI rewrites — used to improve Kleeg&apos;s language quality
          over time.
        </p>

        <div className="mt-8">
          <CorrectionsList corrections={(corrections ?? []) as AiCorrection[]} />
        </div>
      </main>
    </AppShell>
  );
}
