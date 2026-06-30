import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export function KleegLogo({
  className,
  markClassName,
  showWordmark = true,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <KleegMark className={markClassName} />
      {showWordmark ? (
        <span className={cn("text-lg font-semibold tracking-tight", wordmarkClassName)}>
          Kleeg
        </span>
      ) : null}
    </div>
  );
}

export function KleegMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill="url(#kleeg-mark-bg)" />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="700"
      >
        K
      </text>
      <circle cx="31" cy="10" r="3.5" fill="#FBBF24" />
      <defs>
        <linearGradient id="kleeg-mark-bg" x1="8" y1="4" x2="34" y2="36">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function KleegLogoSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="40" height="40" rx="11" fill="url(#kleeg-logo-bg)" />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
      >
        K
      </text>
      <circle cx="31" cy="10" r="3.5" fill="#FBBF24" />
      <text
        x="48"
        y="27"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="22"
        fontWeight="600"
      >
        Kleeg
      </text>
      <defs>
        <linearGradient id="kleeg-logo-bg" x1="8" y1="4" x2="34" y2="36">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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
  trash: "M4 7h16M9 7V5h6v2M8 7l1 14h6l1-14",
  chevron: "M6 9l6 6 6-6",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  settings: "M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
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
