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
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Account</h2>
        <p className="mt-1 text-sm text-ink-muted">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-ink">{email}</p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Language defaults</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Used for Translate actions and assistant replies (coming soon).
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Default translate language
            </label>
            <select
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
              className="input-field"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Yiddish spelling
            </label>
            <select
              value={yiddishScript}
              onChange={(e) => setYiddishScript(e.target.value)}
              className="input-field"
            >
              <option value="hebrew">Hebrew letters</option>
              <option value="latin">Latin letters</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" defaultChecked disabled className="rounded" />
            No nekudos / vowel points (recommended)
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Subscription</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Kleeg is free during early access. Paid plans with usage limits and team
          features are planned — Stripe integration coming in a future update.
        </p>
        <div className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Early access — free
        </div>
      </section>

      <button type="submit" className="btn-primary">
        Save preferences
      </button>
      {saved ? (
        <p className="text-sm font-medium text-brand-700">Preferences saved locally.</p>
      ) : null}
    </form>
  );
}
