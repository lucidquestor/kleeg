import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  type UserPreferences,
} from "@/lib/preferences";

interface PreferenceRow {
  default_lang: string;
  yiddish_script: string;
  no_nekudos: boolean;
}

function rowToPreferences(row: PreferenceRow): UserPreferences {
  return normalizePreferences({
    defaultLang: row.default_lang as UserPreferences["defaultLang"],
    yiddishScript: row.yiddish_script as UserPreferences["yiddishScript"],
    noNekudos: row.no_nekudos,
  });
}

export async function getUserPreferences(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("default_lang, yiddish_script, no_nekudos")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_PREFERENCES;
  return rowToPreferences(data as PreferenceRow);
}

export async function upsertUserPreferences(
  supabase: SupabaseClient,
  userId: string,
  preferences: UserPreferences,
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        default_lang: preferences.defaultLang,
        yiddish_script: preferences.yiddishScript,
        no_nekudos: preferences.noNekudos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("default_lang, yiddish_script, no_nekudos")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save preferences.");
  }

  return rowToPreferences(data as PreferenceRow);
}
