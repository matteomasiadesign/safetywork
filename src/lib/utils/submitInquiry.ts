/**
 * Invio di una richiesta (contatto o iscrizione a un corso) dal sito.
 * Restituisce "ok" SOLO se il server conferma esplicitamente di aver salvato la richiesta:
 * qualsiasi altro esito (errore, risposta strana, rete assente, attesa troppo lunga) è un errore
 * con un messaggio che dice chiaramente che la richiesta NON è arrivata.
 */
export type SubmitResult = { ok: true; message?: string } | { ok: false; error: string };

const TIMEOUT_MS = 20_000;

const NOT_SENT = "Non è stato possibile inviare la richiesta: NON è arrivata al nostro ufficio. Riprova tra poco o chiamaci direttamente.";

export async function submitInquiry(payload: Record<string, unknown>): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string; error?: string } | null;

    if (res.ok && data?.success === true) return { ok: true, message: data.message };
    return { ok: false, error: typeof data?.error === "string" && data.error ? data.error : NOT_SENT };
  } catch {
    return {
      ok: false,
      error: controller.signal.aborted
        ? "Il servizio non ha risposto in tempo: la richiesta NON è stata inviata. Riprova o chiamaci direttamente."
        : "Connessione non riuscita: la richiesta NON è stata inviata. Riprova o chiamaci direttamente.",
    };
  } finally {
    clearTimeout(timer);
  }
}
