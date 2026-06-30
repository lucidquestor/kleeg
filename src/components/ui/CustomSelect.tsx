"use client";

import { useEffect, useRef, useState } from "react";
import { ActionIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  variant?: "light" | "dark";
}

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  className,
  ariaLabel = "Select option",
  variant = "dark",
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];
  const isDark = variant === "dark";

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex min-w-[148px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium shadow-sm transition",
          isDark
            ? "border-white/10 bg-white/5 text-zinc-200 hover:border-brand-400/40 hover:bg-brand-500/10"
            : "border-border bg-white text-ink hover:border-brand-300 hover:bg-brand-50/40",
        )}
      >
        <span className="truncate">{selected.label}</span>
        <ActionIcon
          name="chevron"
          className={cn(isDark ? "text-zinc-400" : "text-ink-muted", "transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          className={cn(
            "absolute right-0 z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border py-1 shadow-lg shadow-black/30",
            isDark ? "border-white/10 bg-[#1f1f25]" : "border-border bg-white shadow-black/10",
          )}
          role="listbox"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col px-3 py-2 text-left transition",
                  isDark
                    ? cn(
                        "hover:bg-white/10",
                        option.value === value && "bg-brand-500/15 text-brand-200",
                      )
                    : cn(
                        "hover:bg-brand-50",
                        option.value === value && "bg-brand-50 text-brand-800",
                      ),
                )}
              >
                <span className="text-xs font-medium">{option.label}</span>
                {option.description ? (
                  <span className={cn("text-[10px]", isDark ? "text-zinc-500" : "text-ink-muted")}>
                    {option.description}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
