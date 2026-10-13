import type { Metadata } from "next";
import LegalPage, { LegalSection } from "@/components/layout/LegalPage";
import Link from "@/components/ui/Link";
import { COMPANY_CONFIG } from "@/config/company";
import { PRIVACY_POLICY_UPDATED } from "@/config/privacy";

export const metadata: Metadata = {
  title: `Cookie Policy | ${COMPANY_CONFIG.name}`,
  description: `Quali cookie e strumenti simili usa il sito di ${COMPANY_CONFIG.name}.`,
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" updated={`Ultimo aggiornamento: ${PRIVACY_POLICY_UPDATED}`}>
      <p className="mb-10 text-[15px] leading-relaxed text-slate-600 sm:text-base">
        I cookie sono piccoli file di testo che un sito salva sul tuo dispositivo. Questa pagina spiega cosa usa il
        sito di {COMPANY_CONFIG.name}. Per il trattamento dei dati personali in generale vedi l'{" "}
        <Link href="/privacy" className="font-medium text-[#008e97] underline">
          informativa sulla privacy
        </Link>
        .
      </p>

      <LegalSection title="Cosa usiamo noi">
        <p>
          Il sito <strong>non usa cookie di profilazione, di marketing o di analisi</strong> e non misura le visite con
          strumenti di terze parti. Usiamo soltanto strumenti tecnici, che non richiedono il tuo consenso:
        </p>
        <ul>
          <li>
            <strong>Memoria della sessione del browser</strong> (<code>sessionStorage</code>): ricorda, solo fino alla
            chiusura della scheda, di aver già mostrato l'animazione iniziale e il suggerimento di contatto, per non
            riproporli a ogni pagina. Non contiene dati personali e non viene mai inviata ai nostri server.
          </li>
          <li>
            <strong>Cookie di accesso all'area riservata</strong>: servono solo allo staff per entrare nel pannello di
            gestione. Non vengono impostati a chi visita il sito.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Contenuti di terze parti">
        <p>
          La pagina iniziale incorpora una mappa di <strong>Google Maps</strong>. Caricandola, Google riceve il tuo
          indirizzo IP e può impostare propri cookie, anche non tecnici, sotto la propria responsabilità. Trovi i
          dettagli nell'
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="font-medium text-[#008e97] underline">
            informativa sui cookie di Google
          </a>
          .
        </p>
        <p>
          Alcune immagini del sito possono essere servite da <strong>Unsplash</strong>: in quel caso il tuo browser
          richiede l'immagine ai suoi server, che ricevono il tuo indirizzo IP. Non risulta che queste richieste
          impostino cookie di profilazione.
        </p>
        <p>
          Se non vuoi che Google imposti cookie, puoi bloccarli dalle impostazioni del browser (vedi sotto).
        </p>
      </LegalSection>

      <LegalSection title="Come gestire i cookie dal browser">
        <p>
          Puoi cancellare o bloccare i cookie dalle impostazioni del tuo browser (Chrome, Firefox, Safari, Edge). Bloccare
          i cookie di terze parti può impedire alla mappa di funzionare correttamente.
        </p>
      </LegalSection>

      <LegalSection title="Contatti">
        <p>
          Per domande su questa pagina scrivi a{" "}
          <a href={`mailto:${COMPANY_CONFIG.contacts.email}`} className="font-medium text-[#008e97] underline">
            {COMPANY_CONFIG.contacts.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
