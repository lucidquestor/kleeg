import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-ink">Not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          This project does not exist or you do not have access to it.
        </p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">
          Back to projects
        </Link>
      </div>
    </div>
  );
}
