import { NextResponse } from "next/server";
import { normalizePreferences } from "@/lib/preferences";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "@/lib/user-preferences-server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const preferences = await getUserPreferences(supabase, user.id);
  return NextResponse.json({ preferences });
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const current = await getUserPreferences(supabase, user.id);
    const preferences = normalizePreferences({
      ...current,
      ...body,
    });

    const saved = await upsertUserPreferences(supabase, user.id, preferences);
    return NextResponse.json({ preferences: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
