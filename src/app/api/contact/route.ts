import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { TablesInsert } from "@/lib/types/supabase";

/** Versione dell'informativa privacy accettata dall'utente (da aggiornare se il testo cambia). */
const PRIVACY_POLICY_VERSION = "1";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = Record<string, unknown>;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return fail("Richiesta non valida.");
  }

  // Campo trappola per i bot: gli utenti reali non lo compilano.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ success: true });
  }

  if (body.privacyAccepted !== true) {
    return fail("È necessario accettare l'informativa sulla privacy per inviare la richiesta.");
  }

  const kind = body.kind === "corso" ? "corso" : "contatto";
  const email = text(body.email, 254);
  const phone = text(body.phone, 40);

  if (!email || !EMAIL_REGEX.test(email)) return fail("Inserisci un indirizzo email valido.");
  if (!phone) return fail("Inserisci un recapito telefonico.");

  const row: TablesInsert<"inquiries"> = {
    kind,
    name: "",
    email,
    phone,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
    status: "nuovo",
  };

  const supabase = createPublicClient({ cached: false });

  if (kind === "corso") {
    const courseSlug = text(body.courseSlug, 200);
    if (!courseSlug) return fail("Corso non specificato.");

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, slug, is_open_for_enrollment")
      .eq("slug", courseSlug)
      .maybeSingle();

    if (courseError) {
      console.error("Errore lettura corso:", courseError.message);
      return fail("Servizio momentaneamente non disponibile. Riprova o chiamaci.", 503);
    }
    if (!course) return fail("Il corso richiesto non è disponibile.", 404);
    if (!course.is_open_for_enrollment) return fail("Le iscrizioni a questo corso sono chiuse.", 409);

    const clientType = body.clientType === "azienda" ? "azienda" : "privato";
    row.course_id = course.id;
    row.course_title = course.title;
    row.course_slug = course.slug;
    row.client_type = clientType;
    row.preferred_mode = text(body.preferredMode, 100);
    row.message = text(body.notes, 5000) ?? text(body.message, 5000) ?? `Iscrizione al corso ${course.title}`;
    row.address = text(body.address, 200);
    row.city = text(body.city, 100);
    row.postal_code = text(body.postalCode, 10);

    if (clientType === "privato") {
      const firstName = text(body.firstName, 100);
      const lastName = text(body.lastName, 100);
      const fiscalCode = text(body.fiscalCode, 20)?.toUpperCase();
      if (!firstName || !lastName) return fail("Inserisci nome e cognome del corsista.");
      if (!fiscalCode) return fail("Inserisci il codice fiscale del corsista.");

      row.name = `${firstName} ${lastName}`;
      row.first_name = firstName;
      row.last_name = lastName;
      row.fiscal_code = fiscalCode;
      row.birth_place = text(body.birthPlace, 100);

      const birthDate = text(body.birthDate, 10);
      if (birthDate) {
        const parsed = new Date(`${birthDate}T00:00:00Z`);
        const isValid =
          /^\d{4}-\d{2}-\d{2}$/.test(birthDate) &&
          !Number.isNaN(parsed.getTime()) &&
          parsed.toISOString().startsWith(birthDate) &&
          parsed.getTime() <= Date.now();
        if (!isValid) return fail("La data di nascita non è valida.");
        row.birth_date = birthDate;
      }
      row.participants_count = 1;
    } else {
      const companyName = text(body.companyName, 200);
      const vatNumber = text(body.vatNumber, 20)?.toUpperCase();
      const participants = Number(body.participantsCount);
      if (!companyName) return fail("Inserisci la ragione sociale.");
      if (!vatNumber) return fail("Inserisci la partita IVA.");
      if (!Number.isInteger(participants) || participants < 1 || participants > 100) {
        return fail("Il numero di partecipanti deve essere tra 1 e 100.");
      }

      row.name = companyName;
      row.company = companyName;
      row.vat_number = vatNumber;
      row.ateco_code = text(body.atecoCode, 20);
      row.sdi_code = text(body.sdiCode, 7)?.toUpperCase();
      row.pec = text(body.pec, 254);
      row.participants_count = participants;
    }
  } else {
    const name = text(body.name, 200);
    const message = text(body.message, 5000);
    if (!name) return fail("Inserisci il tuo nome e cognome.");
    if (!message) return fail("Descrivi brevemente la tua richiesta.");

    row.name = name;
    row.company = text(body.company, 200);
    row.service_type = text(body.serviceType, 200) ?? "Richiesta generale";
    row.message = message;
  }

  const { error } = await supabase.from("inquiries").insert(row);

  if (error) {
    console.error("Errore salvataggio richiesta:", error.message);
    return fail(
      "Non è stato possibile registrare la richiesta. Riprova tra poco o chiamaci direttamente.",
      ["23514", "22007", "22P02"].includes(error.code) ? 400 : 500
    );
  }

  return NextResponse.json({
    success: true,
    message:
      kind === "corso"
        ? "Richiesta di iscrizione registrata. Il nostro ufficio formazione ti ricontatterà entro 24 ore."
        : "Grazie per averci contattato! Un nostro tecnico ti ricontatterà entro 24 ore lavorative.",
  });
}
