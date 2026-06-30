"use client";

import { useState } from "react";

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "yi", label: "Yiddish" },
  { id: "he", label: "Hebrew" },
] as const;

interface SettingsFormProps {
  email: string;
}

export function SettingsForm({ email }: SettingsFormProps) {
  const [defaultLang, setDefaultLang] = useState("yi");
  const [yiddishScript, setYiddishScript] = useState("hebrew");
  const [saved, setSaved] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    localStorage.setItem(
      "kleeg-preferences",
      JSON.stringify({ defaultLang, yiddishScript }),
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="mt-8 space-y-6">
      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <p className="mt-1 text-sm text-app-muted">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-zinc-200">{email}</p>
      </section>

      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Language defaults</h2>
        <p className="mt-1 text-sm text-app-muted">
          Used for Translate actions and assistant replies (coming soon).
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-200">
              Default translate language
            </label>
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
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
              onChange={(e) => setYiddishScript(e.target.value)}
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
            <input type="checkbox" defaultChecked disabled className="rounded" />
            No nekudos / vowel points (recommended)
          </label>
        </div>
      </section>

      <section className="card-app p-6">
        <h2 className="text-lg font-semibold text-white">Subscription</h2>
        <p className="mt-2 text-sm text-app-muted">
          Kleeg is free during early access. Paid plans with usage limits and team
          features are planned — Stripe integration coming in a future update.
        </p>
        <div className="mt-4 inline-flex rounded-full bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-300">
          Early access — free
        </div>
      </section>

      <button type="submit" className="btn-primary">
        Save preferences
      </button>
      {saved ? (
        <p className="text-sm font-medium text-brand-300">Preferences saved locally.</p>
      ) : null}
    </form>
  );
}
