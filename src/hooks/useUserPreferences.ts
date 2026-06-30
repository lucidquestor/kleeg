"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  type UserPreferences,
} from "@/lib/preferences";

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/user/preferences");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.preferences) {
          setPreferences(normalizePreferences(data.preferences));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { preferences, loaded };
}
