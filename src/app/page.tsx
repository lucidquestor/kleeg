import Link from "next/link";
import { siteConfig } from "@/lib/types";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
            Kleeg
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            AI Workspace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {siteConfig.description} Chat with your project, edit documents, translate,
            and route between AI models — all in one place.
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

        <section className="border-t border-border bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-3 sm:px-6">
            {[
              {
                title: "Project workspace",
                body: "Upload context, chat with your files, and keep everything in one project.",
              },
              {
                title: "Document editor",
                body: "Rewrite, translate, professionalize, and summarize with one click.",
              },
              {
                title: "Model routing",
                body: "Auto, fast, best reasoning, or best writing — Kleeg picks the right model.",
              },
            ].map((item) => (
              <article key={item.title} className="card p-6">
                <h2 className="text-lg font-semibold text-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
