import { cn } from "@/lib/cn";

const paths: Record<string, string> = {
  sparkles:
    "M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3zM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15z",
  briefcase:
    "M4 8a2 2 0 012-2h2v1h8V6h2a2 2 0 012 2v2H4V8zm-1 4h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z",
  compress: "M8 9V7h8v2M8 15v2h8v-2",
  globe:
    "M12 2a10 10 0 100 20 10 10 0 000-20zm7.9 9H15.1a16.5 16.5 0 000-2h4.8a8 8 0 010 2zM12 18a14 14 0 010-4h4.9a8 8 0 01-3.5 3.5A14 14 0 0112 18z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  mail: "M4 6h16v12H4V6zm2 2l6 4 6-4",
};

export function ActionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const d = paths[name] ?? paths.sparkles;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function KleegMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-brand-600 text-sm font-bold text-white shadow-sm",
        className,
      )}
    >
      K
    </div>
  );
}
