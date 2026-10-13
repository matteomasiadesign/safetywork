import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/layout/LegalPage";
import Link from "@/components/ui/Link";
import { COMPANY_CONFIG } from "@/config/company";
import { INQUIRY_RETENTION_MONTHS, PRIVACY_POLICY_UPDATED } from "@/config/privacy";

export const metadata: Metadata = {
  title: `Informativa sulla privacy | ${COMPANY_CONFIG.name}`,
  description: `Come ${COMPANY_CONFIG.name} tratta i dati personali raccolti tramite il sito, ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR).`,
};

export default function PrivacyPage() {
  const { email, pec, phone } = COMPANY_CONFIG.contacts;
  const { fullAddress } = COMPANY_CONFIG.headquarters;

  return (
    <LegalPage title="Informativa sulla privacy" updated={`Ultimo aggiornamento: ${PRIVACY_POLICY_UPDATED}`}>
      <p className="mb-10 text-[15px] leading-relaxed text-slate-600 sm:text-base">
        Questa informativa spiega come vengono trattati i dati personali di chi visita il sito o ci scrive tramite i suoi
        moduli, ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 (di seguito "GDPR").
      </p>

      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento è <strong>{COMPANY_CONFIG.name}</strong>, con sede in {fullAddress}, P.IVA e C.F.{" "}
          {COMPANY_CONFIG.piva}.
        </p>
        <p>
          Per qualsiasi richiesta sul trattamento dei dati puoi scriverci a{" "}
          <a href={`mailto:${email}`}>{email}</a> o via PEC a <a href={`mailto:${pec}`}>{pec}</a>, oppure chiamare il{" "}
          {phone}.
        </p>
      </LegalSection>

      <LegalSection title="2. Quali dati trattiamo e per quali finalità">
        <p>Il sito non richiede registrazione e non usa strumenti di analisi o profilazione. Trattiamo dati personali solo quando li invii tu.</p>
        <ul>
          <li>
            <strong>Richiesta di contatto o preventivo</strong> (modulo "Contatti"): nome e cognome, email, telefono,
            eventuale azienda e il contenuto del messaggio. Li usiamo per risponderti e, se lo richiedi, formulare
            un'offerta.
          </li>
          <li>
            <strong>Richiesta di iscrizione a un corso</strong> (modulo nella pagina del corso): per i privati nome,
            cognome, codice fiscale, data e luogo di nascita, indirizzo, email e telefono; per le aziende ragione
            sociale, partita IVA, codice ATECO, codice SDI, PEC, numero di partecipanti e recapiti. Servono a gestire
            l'iscrizione, organizzare il corso e predisporre fatturazione e attestati.
          </li>
          <li>
            <strong>Dati di navigazione</strong>: come ogni sito web, i server che ci ospitano registrano
            automaticamente dati tecnici (indirizzo IP, data e ora, pagina richiesta, tipo di browser) necessari al
            funzionamento e alla sicurezza del servizio.
          </li>
        </ul>
        <p>
          Il conferimento dei dati dei moduli è facoltativo, ma i campi contrassegnati come obbligatori sono necessari
          per poter gestire la richiesta.
        </p>
      </LegalSection>

      <LegalSection title="3. Base giuridica">
        <ul>
          <li>
            Richieste di contatto e preventivo: esecuzione di misure precontrattuali adottate su tua richiesta (art. 6,
            par. 1, lett. b GDPR).
          </li>
          <li>
            Iscrizioni ai corsi: esecuzione del contratto di formazione (art. 6, par. 1, lett. b) e adempimento degli
            obblighi di legge, anche fiscali e di certificazione della formazione (art. 6, par. 1, lett. c).
          </li>
          <li>
            Dati di navigazione e sicurezza del sito: legittimo interesse del titolare a garantire il funzionamento e la
            sicurezza del servizio (art. 6, par. 1, lett. f).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. A chi comunichiamo i dati">
        <p>I dati non vengono diffusi né venduti. Sono trattati dal nostro personale autorizzato e da fornitori che agiscono come responsabili del trattamento:</p>
        <ul>
          <li>
            <strong>Supabase</strong>, che ospita il database in cui vengono salvate le richieste ricevute dal sito.
          </li>
          <li>
            <strong>Vercel</strong>, che ospita il sito e ne registra i dati tecnici di accesso.
          </li>
          <li>
            <strong>Google</strong> e <strong>Unsplash</strong>, per la mappa della sede e alcune immagini: vedi il punto
            successivo.
          </li>
        </ul>
        <p>
          Possiamo inoltre comunicare i dati a enti e soggetti ai quali siamo tenuti per legge (ad esempio per
          l'accreditamento dei corsi o per la fatturazione), a consulenti e a docenti incaricati del corso.
        </p>
        <p>
          Se un fornitore tratta dati fuori dallo Spazio Economico Europeo, il trasferimento avviene sulla base di una
          decisione di adeguatezza della Commissione europea o delle clausole contrattuali standard.
        </p>
      </LegalSection>

      <LegalSection title="5. Mappa di Google e immagini di terzi">
        <p>
          La pagina iniziale mostra la mappa della nostra sede tramite Google Maps. Quando la pagina viene caricata, il
          tuo browser si collega ai server di Google, che ricevono il tuo indirizzo IP e possono impostare propri
          cookie, secondo la{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            informativa di Google
          </a>
          . Noi non riceviamo questi dati e non li utilizziamo. Il sito non richiede né usa la tua posizione.
        </p>
        <p>
          Analogamente, alcune immagini del sito possono essere servite da Unsplash, che in quel caso riceve il tuo
          indirizzo IP per consegnarti il file.
        </p>
      </LegalSection>

      <LegalSection title="6. Per quanto tempo conserviamo i dati">
        <ul>
          <li>
            Le richieste ricevute dal sito vengono cancellate dopo <strong>{INQUIRY_RETENTION_MONTHS} mesi</strong> dalla
            ricezione.
          </li>
          <li>
            Se la richiesta porta a un contratto, i dati necessari agli obblighi fiscali e contabili sono conservati
            nei nostri archivi per i termini previsti dalla legge (di norma 10 anni).
          </li>
          <li>I dati tecnici di accesso sono conservati dai fornitori di hosting per il tempo strettamente necessario alla sicurezza del servizio.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. I tuoi diritti">
        <p>Puoi in qualsiasi momento esercitare i diritti previsti dagli artt. 15-22 del GDPR:</p>
        <ul>
          <li>accedere ai tuoi dati e ottenerne una copia;</li>
          <li>chiederne la rettifica o la cancellazione;</li>
          <li>chiedere la limitazione del trattamento o opporti ad esso;</li>
          <li>ricevere i dati in un formato strutturato (portabilità);</li>
          <li>revocare il consenso, dove il trattamento si basa su di esso, senza pregiudicare i trattamenti già effettuati.</li>
        </ul>
        <p>
          Per esercitarli scrivi a <a href={`mailto:${email}`}>{email}</a>. Se ritieni che il trattamento violi la
          normativa, puoi proporre reclamo al{" "}
          <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
            Garante per la protezione dei dati personali
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Cookie">
        <p>
          Il sito non usa cookie di profilazione né strumenti di analisi. I dettagli sono nella{" "}
          <Link href="/cookie">Cookie Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="9. Decisioni automatizzate">
        <p>I tuoi dati non sono soggetti a processi decisionali automatizzati né a profilazione.</p>
      </LegalSection>
    </LegalPage>
  );
}
