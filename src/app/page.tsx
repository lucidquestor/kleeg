import Link from "next/link";
import { KleegLogo } from "@/components/ui/icons";
import { siteConfig } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      <header className="border-b border-border/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <KleegLogo />
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
            AI Workspace
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {siteConfig.description} Write, translate, chat, and get real work done — with
            AI that learns from your corrections over time.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3">
              Start free
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3">
              Open workspace
            </Link>
          </div>
        </section>

        <section className="border-t border-border/60 bg-white/80">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-3 sm:px-6">
            {[
              {
                title: "Project workspace",
                body: "Documents, chat, and context in one focused environment.",
                accent: "from-brand-500 to-brand-700",
              },
              {
                title: "Smart language tools",
                body: "Translate and rewrite in English, Hebrew, and Yiddish — without nekudos unless you want them.",
                accent: "from-accent-500 to-accent-600",
              },
              {
                title: "Learns from you",
                body: "Every correction you make helps build better Kleeg models over time.",
                accent: "from-brand-600 to-brand-800",
              },
            ].map((item) => (
              <article key={item.title} className="card card-hover p-6">
                <div
                  className={`mb-4 h-1 w-10 rounded-full bg-gradient-to-r ${item.accent}`}
                />
                <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
