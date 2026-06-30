"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  type DefaultLang,
  type UserPreferences,
  type YiddishScript,
} from "@/lib/preferences";

const LANGUAGES: { id: DefaultLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "yi", label: "Yiddish" },
  { id: "he", label: "Hebrew" },
];

interface SettingsFormProps {
  email: string;
}

export function SettingsForm({ email }: SettingsFormProps) {
  const [defaultLang, setDefaultLang] = useState<DefaultLang>(DEFAULT_PREFERENCES.defaultLang);
  const [yiddishScript, setYiddishScript] = useState<YiddishScript>(
    DEFAULT_PREFERENCES.yiddishScript,
  );
  const [noNekudos, setNoNekudos] = useState(DEFAULT_PREFERENCES.noNekudos);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/user/preferences");
        if (!response.ok) return;
        const data = await response.json();
        const prefs = normalizePreferences(data.preferences as Partial<UserPreferences>);
        setDefaultLang(prefs.defaultLang);
        setYiddishScript(prefs.yiddishScript);
        setNoNekudos(prefs.noNekudos);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultLang, yiddishScript, noNekudos }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save preferences.");

      localStorage.setItem(
        "kleeg-preferences",
        JSON.stringify({ defaultLang, yiddishScript, noNekudos }),
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="mt-8 space-y-6">
      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <p className="mt-1 text-sm text-app-muted">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-zinc-200">{email}</p>
      </section>

      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Language defaults</h2>
        <p className="mt-1 text-sm text-app-muted">
          Applied to AI chat and rewrite actions (translate, tone, email).
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading preferences…</p>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">
                Default language
              </label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value as DefaultLang)}
                className="input-app"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-app-panel">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">
                Yiddish spelling
              </label>
              <select
                value={yiddishScript}
                onChange={(e) => setYiddishScript(e.target.value as YiddishScript)}
                className="input-app"
              >
                <option value="hebrew" className="bg-app-panel">
                  Hebrew letters
                </option>
                <option value="latin" className="bg-app-panel">
                  Latin letters
                </option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={noNekudos}
                onChange={(e) => setNoNekudos(e.target.checked)}
                className="rounded"
              />
              No nekudos / vowel points (recommended)
            </label>
          </div>
        )}
      </section>

      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Your corrections</h2>
        <p className="mt-2 text-sm text-app-muted">
          When you edit AI output after a rewrite, Kleeg saves your fixes to improve future
          models.
        </p>
        <Link
          href="/settings/corrections"
          className="mt-4 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.06]"
        >
          View corrections
        </Link>
      </section>

      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Subscription</h2>
        <p className="mt-2 text-sm text-app-muted">
          Kleeg is free during early access. Paid plans with usage limits and team features
          are planned.
        </p>
        <div className="mt-4 inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
          Early access — free
        </div>
      </section>

      <button type="submit" disabled={saving || loading} className="btn-primary">
        {saving ? "Saving…" : "Save preferences"}
      </button>
      {saved ? (
        <p className="text-sm font-medium text-brand-300">Preferences saved.</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
