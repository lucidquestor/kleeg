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
}

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  className,
  ariaLabel = "Select option",
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

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
        className="flex min-w-[148px] items-center justify-between gap-2 rounded-xl border border-border bg-white px-3 py-2 text-left text-xs font-medium text-ink shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40"
      >
        <span className="truncate">{selected.label}</span>
        <ActionIcon
          name="chevron"
          className={cn("text-ink-muted transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          className="absolute right-0 z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg shadow-black/10"
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
                  "flex w-full flex-col px-3 py-2 text-left transition hover:bg-brand-50",
                  option.value === value && "bg-brand-50 text-brand-800",
                )}
              >
                <span className="text-xs font-medium">{option.label}</span>
                {option.description ? (
                  <span className="text-[10px] text-ink-muted">{option.description}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
