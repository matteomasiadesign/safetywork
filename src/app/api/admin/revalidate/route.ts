import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { CATALOG_CACHE_TAG } from "@/lib/supabase/public";

/**
 * Chiamata dall'admin dopo ogni modifica: svuota la cache del sito pubblico
 * così corsi e servizi aggiornati compaiono subito (e non entro 60 secondi).
 * Solo per utenti presenti in admin_users.
 */
export async function POST() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true });
}
