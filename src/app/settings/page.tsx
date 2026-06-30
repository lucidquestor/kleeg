import { AppShell } from "@/components/layout/AppShell";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-app-muted">
          Language defaults, account, and billing — more coming soon.
        </p>

        <SettingsForm email={user?.email ?? ""} />
      </main>
    </AppShell>
  );
}
