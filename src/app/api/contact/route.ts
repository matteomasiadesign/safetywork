import { NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = "contatto",
      client_type = "privato",
      name,
      email,
      company,
      phone,
      service_type,
      course_title,
      course_slug,
      participants_count,
      preferred_mode,
      message,
      first_name,
      last_name,
      fiscal_code,
      vat_number,
      ateco_code,
      sdi_code,
      pec,
      address,
      city,
      postal_code,
    } = body;

    // Validazione campi obbligatori minimi
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome ed Email sono campi obbligatori." },
        { status: 400 }
      );
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Indirizzo email non valido." },
        { status: 400 }
      );
    }

    // Salvataggio nel database Supabase se configurato
    if (isSupabaseConfigured) {
      try {
        const supabase = createClientServer();
        const { error } = await supabase.from("contact_inquiries").insert({
          type,
          client_type,
          name,
          email,
          company: company || null,
          phone: phone || null,
          service_type: service_type || (course_title ? `Corso: ${course_title}` : "Consulenza"),
          course_title: course_title || null,
          course_slug: course_slug || null,
          participants_count: Number(participants_count) || 1,
          preferred_mode: preferred_mode || null,
          message: message || `Richiesta inoltrata da ${name}`,
          first_name: first_name || null,
          last_name: last_name || null,
          fiscal_code: fiscal_code || null,
          vat_number: vat_number || null,
          ateco_code: ateco_code || null,
          sdi_code: sdi_code || null,
          pec: pec || null,
          address: address || null,
          city: city || null,
          postal_code: postal_code || null,
          status: "nuovo",
        } as any);

        if (error) {
          console.error("Errore salvataggio Supabase inquiries:", error);
        }
      } catch (dbErr) {
        console.error("Eccezione durante inserimento Supabase inquiries:", dbErr);
      }
    } else {
      console.log("Richiesta ricevuta (modalità sviluppo locale):", {
        type,
        client_type,
        name,
        email,
        phone,
        company,
        course_title,
        message,
        receivedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          type === "corso"
            ? "Richiesta di iscrizione registrata con successo! Il nostro ufficio formazione ti ricontatterà entro 24 ore."
            : "Grazie per averci contattato! Un nostro tecnico della sicurezza ti ricontatterà entro 24 ore lavorative.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Errore interno API contact:", err);
    return NextResponse.json(
      { error: "Si è verificato un errore interno durante l'elaborazione della richiesta." },
      { status: 500 }
    );
  }
}
