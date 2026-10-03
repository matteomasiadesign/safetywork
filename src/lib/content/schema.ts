import { COMPANY_CONFIG } from "@/config/company";

/**
 * Contenuti del sito modificabili da /admin → "Contenuti del sito".
 *
 * CONTENT_DEFAULTS è l'unico posto in cui vive il testo originale. Il database (tabella
 * site_content) conserva solo ciò che il cliente ha cambiato: se una chiave non c'è, il sito usa
 * il valore qui sotto. Per rendere modificabile un nuovo testo: aggiungi la chiave qui, il campo
 * in CONTENT_SECTIONS e usa il valore nel componente.
 *
 * Marcatori ammessi nei testi (vedi RichText):
 *   **grassetto**   [[parola evidenziata]]
 */
export const CONTENT_DEFAULTS = {
  // ---------------------------------------------------------------- home: hero
  "home.hero.image": "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "home.hero.badge": "Conformità Integrata D.Lgs. 81/08 & Certificazioni di Legge",
  "home.hero.title": "Consulenza e Formazione per la [[Sicurezza nei Luoghi di Lavoro]]",
  "home.hero.subtitle":
    "Supportiamo aziende, associazioni e professionisti nella gestione completa degli adempimenti normativi. La nostra missione è promuovere una cultura della sicurezza a 360°, trasformando l'obbligo normativo in valore organizzativo.",
  "home.hero.chip1": "Valutazioni Fonometriche",
  "home.hero.chip2": "Formazione Completa",
  "home.hero.chip3": "Coordinamento Cantieri",
  "home.hero.cta_primary": "Richiedi una Consulenza",
  "home.hero.cta_secondary": "Esplora i Corsi",
  "home.hero.stat1_value": "15+",
  "home.hero.stat1_label": "Anni di Esperienza",
  "home.hero.stat2_value": "1200+",
  "home.hero.stat2_label": "Aziende Tutelate",
  "home.hero.stat3_value": "25000+",
  "home.hero.stat3_label": "Lavoratori Formati",
  "home.hero.stat4_value": "99,4%",
  "home.hero.stat4_label": "Clienti Soddisfatti",

  // ------------------------------------------------------------ home: corsi
  "home.courses.badge": "Scopri i corsi disponibili",
  "home.courses.title": "Corsi in Programma",
  "home.courses.subtitle":
    "Corsi disponibili tramite Safety Works. Seleziona una scheda per consultare programma, modalità, date e sedi e inviare la tua richiesta di iscrizione.",

  // ------------------------------------------------------------ home: chi siamo
  "home.about.image": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=2000&auto=format&fit=crop&q=80",
  "home.about.badge": "Chi Siamo",
  "home.about.title": "Il Tuo Partner Strategico per la [[Sicurezza nei Luoghi di Lavoro]]",
  "home.about.text1":
    "Siamo un team di professionisti che affianca imprese, associazioni e professionisti su tutto il territorio nazionale con un obiettivo chiaro: **organizzare e trasformare gli obblighi normativi in un vantaggio competitivo** per il tuo progetto.",
  "home.about.text2":
    "Dalla consulenza in cantiere alla formazione accreditata, mettiamo in campo le nostre competenze per garantirti una tutela a 360 gradi.",
  "home.about.stat1_value": "15+",
  "home.about.stat1_label": "Anni di Esperienza sul Campo",
  "home.about.stat2_value": "25k+",
  "home.about.stat2_label": "Lavoratori Formati e Certificati",
  "home.about.button": "Scopri di più",

  // ------------------------------------------------------------ home: servizi
  "home.services.badge": "Soluzioni Tecniche • D.Lgs. 81/08",
  "home.services.title": "Servizi di Sicurezza",
  "home.services.subtitle":
    "Interventi specialistici per azzerare i rischi sanzionatori e garantire continuità e sicurezza operativa ad ogni settore d'impresa.",
  "home.services.button": "Richiedi Check-Up Tecnico",
  "home.services.alert_tag": "FAST TRACK",
  "home.services.alert_title": "Hai ricevuto una prescrizione o un verbale da ASL / ITL / Vigili del Fuoco?",
  "home.services.alert_text":
    "I nostri tecnici interverranno con sopralluogo urgente per visionare e regolarizzare la posizione aziendale entro i termini perentori.",
  "home.services.alert_button": "Intervento Ispettivo Urgente",

  // ------------------------------------------------------------ home: contatti e mappa
  "home.contact.title": "Parla con il nostro team",
  "home.contact.subtitle":
    "I nostri tecnici e docenti sono a tua disposizione per chiarimenti normativi sul D.Lgs. 81/08, piani formativi aziendali o preventivi personalizzati.",
  "home.map.badge": "Vieni a Trovarci",
  "home.map.title": "La Nostra Sede Operativa",

  // ------------------------------------------------------------ pagina chi siamo
  "about.hero.image": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2000&auto=format&fit=crop&q=80",
  "about.hero.badge": "Chi Siamo",
  "about.hero.title": "Dai cantieri alla [[consulenza tecnica]].",
  "about.hero.subtitle": "In Safety Works uniamo l'esperienza sul campo a una formazione specialistica.",

  "about.approach.image": "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&auto=format&fit=crop&q=80",
  "about.approach.title": "Sicurezza sul lavoro, formazione e gestione della sicurezza negli eventi.",
  "about.approach.text1":
    "Safety Works S.r.l.s. nasce per affiancare aziende, datori di lavoro, RSPP, professionisti e organizzatori di eventi nella gestione della sicurezza, offrendo competenza tecnica, esperienza e soluzioni costruite sulle esigenze specifiche di ogni realtà.",
  "about.approach.text2":
    "Crediamo che la tutela della salute e della sicurezza non debba essere vissuta come un semplice adempimento burocratico, ma come un **valore concreto, etico ed economico**. Investire nella prevenzione significa proteggere le persone, ridurre i rischi e costruire organizzazioni più solide, efficienti e affidabili.",
  "about.approach.text3":
    "Operiamo nel rispetto del **D.Lgs. 81/2008** e della normativa vigente, accompagnando i nostri clienti nella gestione della sicurezza sul lavoro attraverso consulenza tecnica, sopralluoghi, valutazione e gestione dei rischi, formazione e supporto agli adempimenti previsti dalla normativa.",
  "about.approach.text4":
    "La nostra esperienza si estende anche al mondo degli **eventi, delle manifestazioni e degli spettacoli**, dove affianchiamo organizzatori e committenti nella progettazione e nella gestione della sicurezza. Dalla predisposizione dei piani di sicurezza alla gestione operativa delle attività di **Safety & Security**, fino alla fornitura di **addetti antincendio e personale qualificato**, sviluppiamo soluzioni coordinate in funzione delle caratteristiche di ogni evento.",
  "about.approach.text5":
    "Il nostro team multidisciplinare, composto da **ingegneri, tecnici della prevenzione e docenti formatori qualificati**, unisce competenza, visione tecnica e presenza sul campo per garantire un supporto completo, dalla progettazione alla gestione operativa.",
  "about.approach.text6":
    "Per noi la sicurezza non è soltanto conformità normativa. È **prevenzione, organizzazione, responsabilità e valore**.",
  "about.approach.closing": "Safety Works. La sicurezza, dalla progettazione alla gestione.",

  "about.pillars.title": "I Nostri Pilastri Operativi",
  "about.pillars.subtitle": "Copertura normativa a 360 gradi per la piena conformità di ogni ambiente di lavoro.",

  "about.pillar1.code": "CONSULENZA // GESTIONE",
  "about.pillar1.title": "Consulenza e Gestione",
  "about.pillar1.subtitle": "Gestione Documentale & Incarichi",
  "about.pillar1.text":
    "Supportiamo le imprese nella gestione completa della sicurezza, dalla redazione del DVR (Documento di Valutazione dei Rischi) alla gestione documentale quotidiana e all'assunzione diretta di incarichi come Responsabile del Servizio di Prevenzione e Protezione (RSPP).",
  "about.pillar1.tag": "D.Lgs. 81/08",
  "about.pillar1.image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",

  "about.pillar2.code": "FORMAZIONE // TRAINING",
  "about.pillar2.title": "Formazione Accreditata",
  "about.pillar2.subtitle": "Corsi per ogni figura aziendale",
  "about.pillar2.text":
    "Progettiamo ed eroghiamo corsi di formazione obbligatori e specifici per lavoratori, dirigenti, preposti, RSPP, addetti antincendio, addetti al primo soccorso e abilitazione per attrezzature di lavoro.",
  "about.pillar2.tag": "D.Lgs 81/08",
  "about.pillar2.image": "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",

  "about.pillar3.code": "CANTIERI // OPERATIVITÀ",
  "about.pillar3.title": "Gestione Cantieri",
  "about.pillar3.subtitle": "Incarichi CSE e HSE",
  "about.pillar3.text":
    "Gestiamo la sicurezza all'interno dei cantieri temporanei e mobili offrendo supporto tecnico operativo attraverso incarichi diretti come Coordinatore della Sicurezza in fase di Esecuzione (CSE) e Health, Safety & Environment Manager (HSE).",
  "about.pillar3.tag": "Titolo IV D.Lgs 81/08",
  "about.pillar3.image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",

  "about.pillar4.code": "CONTROLLO // AUDIT",
  "about.pillar4.title": "Controllo e Verifiche",
  "about.pillar4.subtitle": "Audit e Assistenza Ispettiva",
  "about.pillar4.text":
    "Monitoriamo costantemente gli adempimenti, pianifichiamo le scadenze e supportiamo attivamente l'azienda durante le verifiche ispettive da parte degli organi di vigilanza (ASL, ITL, VVF) e negli audit interni.",
  "about.pillar4.tag": "Compliance & Metodologia",
  "about.pillar4.image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",

  // ------------------------------------------------------------ recapiti
  "company.phone": COMPANY_CONFIG.contacts.phone,
  "company.email": COMPANY_CONFIG.contacts.email,
  "company.address": COMPANY_CONFIG.headquarters.fullAddress,
  "company.hours": "Lunedì - Venerdì: 08:30 - 18:30",
} as const satisfies Record<string, string>;

export type ContentKey = keyof typeof CONTENT_DEFAULTS;
export type SiteContent = Record<ContentKey, string>;

export type ContentFieldType = "text" | "textarea" | "image";

export interface ContentField {
  key: ContentKey;
  label: string;
  type: ContentFieldType;
  hint?: string;
  /** Con true il campo può essere svuotato (il testo sparisce dal sito); altrimenti vuoto = testo originale. */
  allowEmpty?: boolean;
  /** Titoletto che apre un gruppo di campi nella stessa sezione. */
  groupLabel?: string;
}

export interface ContentSection {
  id: string;
  /** Pagina del sito a cui appartiene (per il menu laterale dell'editor). */
  page: string;
  title: string;
  description: string;
  /** Dove si vede la sezione sul sito. */
  previewHref: string;
  fields: ContentField[];
}

const HIGHLIGHT_HINT = "Racchiudi tra doppie parentesi quadre le parole da evidenziare: [[così]].";
const BOLD_HINT = "Usa **doppi asterischi** per il grassetto.";
const COUNTER_HINT = "Numero con simbolo finale, es. 15+ oppure 99,4%.";

const f = (
  key: ContentKey,
  label: string,
  type: ContentFieldType = "text",
  extra: Partial<ContentField> = {}
): ContentField => ({ key, label, type, ...extra });

const pillarFields = (n: 1 | 2 | 3 | 4): ContentField[] => {
  const k = (name: string) => `about.pillar${n}.${name}` as ContentKey;
  return [
    f(k("title"), "Titolo", "text", { groupLabel: `Pilastro ${n}` }),
    f(k("subtitle"), "Sottotitolo (etichetta bianca)"),
    f(k("text"), "Descrizione", "textarea"),
    f(k("tag"), "Riferimento in basso (es. D.Lgs. 81/08)"),
    f(k("code"), "Etichetta tecnica (es. CONSULENZA // GESTIONE)"),
    f(k("image"), "Immagine di sfondo", "image"),
  ];
};

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    id: "home-hero",
    page: "Home page",
    title: "Hero (apertura)",
    description: "La prima schermata del sito: titolo, sottotitolo, pulsanti, numeri e immagine di sfondo.",
    previewHref: "/",
    fields: [
      f("home.hero.image", "Immagine di sfondo", "image"),
      f("home.hero.badge", "Etichetta in alto"),
      f("home.hero.title", "Titolo principale", "textarea", { hint: HIGHLIGHT_HINT }),
      f("home.hero.subtitle", "Sottotitolo", "textarea"),
      f("home.hero.chip1", "Punto di forza 1", "text", { groupLabel: "Tre punti di forza" }),
      f("home.hero.chip2", "Punto di forza 2"),
      f("home.hero.chip3", "Punto di forza 3"),
      f("home.hero.cta_primary", "Pulsante principale (rosso)", "text", { groupLabel: "Pulsanti" }),
      f("home.hero.cta_secondary", "Pulsante secondario"),
      f("home.hero.stat1_value", "Numero 1", "text", { groupLabel: "Numeri in evidenza", hint: COUNTER_HINT }),
      f("home.hero.stat1_label", "Descrizione numero 1"),
      f("home.hero.stat2_value", "Numero 2", "text", { hint: COUNTER_HINT }),
      f("home.hero.stat2_label", "Descrizione numero 2"),
      f("home.hero.stat3_value", "Numero 3", "text", { hint: COUNTER_HINT }),
      f("home.hero.stat3_label", "Descrizione numero 3"),
      f("home.hero.stat4_value", "Numero 4", "text", { hint: COUNTER_HINT }),
      f("home.hero.stat4_label", "Descrizione numero 4"),
    ],
  },
  {
    id: "home-courses",
    page: "Home page",
    title: "Corsi del momento",
    description: "Intestazione della sezione con i corsi aperti alle iscrizioni (le schede dei corsi si gestiscono in “Gestione Corsi”).",
    previewHref: "/#corsi-del-momento",
    fields: [
      f("home.courses.badge", "Etichetta"),
      f("home.courses.title", "Titolo"),
      f("home.courses.subtitle", "Descrizione", "textarea"),
    ],
  },
  {
    id: "home-about",
    page: "Home page",
    title: "Chi siamo (anteprima)",
    description: "Il blocco scuro con la presentazione dell'azienda e i due numeri.",
    previewHref: "/#chi-siamo",
    fields: [
      f("home.about.image", "Immagine di sfondo", "image"),
      f("home.about.badge", "Etichetta"),
      f("home.about.title", "Titolo", "textarea", { hint: HIGHLIGHT_HINT }),
      f("home.about.text1", "Primo paragrafo", "textarea", { hint: BOLD_HINT }),
      f("home.about.text2", "Secondo paragrafo (con barra laterale)", "textarea", { allowEmpty: true }),
      f("home.about.stat1_value", "Numero 1", "text", { groupLabel: "Numeri", hint: COUNTER_HINT }),
      f("home.about.stat1_label", "Descrizione numero 1"),
      f("home.about.stat2_value", "Numero 2", "text", { hint: COUNTER_HINT }),
      f("home.about.stat2_label", "Descrizione numero 2"),
      f("home.about.button", "Testo del pulsante"),
    ],
  },
  {
    id: "home-services",
    page: "Home page",
    title: "Servizi",
    description: "Intestazione della sezione e riquadro “Fast Track” (le schede dei servizi si gestiscono in “Gestione Servizi”).",
    previewHref: "/#servizi",
    fields: [
      f("home.services.badge", "Etichetta"),
      f("home.services.title", "Titolo"),
      f("home.services.subtitle", "Descrizione", "textarea"),
      f("home.services.button", "Pulsante in alto a destra"),
      f("home.services.alert_tag", "Etichetta", "text", { groupLabel: "Riquadro urgenze" }),
      f("home.services.alert_title", "Titolo", "textarea"),
      f("home.services.alert_text", "Testo", "textarea"),
      f("home.services.alert_button", "Pulsante (chiama il numero aziendale)"),
    ],
  },
  {
    id: "home-contact",
    page: "Home page",
    title: "Contatti e mappa",
    description: "Titoli della sezione contatti e della mappa. Telefono, email e indirizzo si cambiano in “Recapiti aziendali”.",
    previewHref: "/#contatti",
    fields: [
      f("home.contact.title", "Titolo contatti"),
      f("home.contact.subtitle", "Introduzione contatti", "textarea"),
      f("home.map.badge", "Etichetta mappa", "text", { groupLabel: "Mappa" }),
      f("home.map.title", "Titolo mappa"),
    ],
  },
  {
    id: "about-hero",
    page: "Pagina Chi siamo",
    title: "Apertura pagina",
    description: "Titolo, sottotitolo e immagine in cima alla pagina Chi siamo.",
    previewHref: "/chi-siamo",
    fields: [
      f("about.hero.image", "Immagine di sfondo", "image"),
      f("about.hero.badge", "Etichetta in alto"),
      f("about.hero.title", "Titolo", "textarea", { hint: HIGHLIGHT_HINT }),
      f("about.hero.subtitle", "Sottotitolo", "textarea"),
    ],
  },
  {
    id: "about-approach",
    page: "Pagina Chi siamo",
    title: "Il nostro approccio",
    description: "Il blocco con i paragrafi di presentazione, la frase finale e la foto a destra.",
    previewHref: "/chi-siamo",
    fields: [
      f("about.approach.title", "Titolo", "textarea", { hint: HIGHLIGHT_HINT }),
      f("about.approach.text1", "Paragrafo 1", "textarea", { hint: BOLD_HINT }),
      f("about.approach.text2", "Paragrafo 2", "textarea", { hint: BOLD_HINT, allowEmpty: true }),
      f("about.approach.text3", "Paragrafo 3", "textarea", { hint: BOLD_HINT, allowEmpty: true }),
      f("about.approach.text4", "Paragrafo 4", "textarea", { hint: BOLD_HINT, allowEmpty: true }),
      f("about.approach.text5", "Paragrafo 5", "textarea", { hint: BOLD_HINT, allowEmpty: true }),
      f("about.approach.text6", "Paragrafo 6", "textarea", { hint: BOLD_HINT, allowEmpty: true }),
      f("about.approach.closing", "Frase finale in evidenza", "text", { allowEmpty: true }),
      f("about.approach.image", "Fotografia", "image"),
    ],
  },
  {
    id: "about-pillars",
    page: "Pagina Chi siamo",
    title: "Pilastri operativi",
    description: "Titolo della sezione e le quattro schede con immagine.",
    previewHref: "/chi-siamo",
    fields: [
      f("about.pillars.title", "Titolo della sezione"),
      f("about.pillars.subtitle", "Descrizione", "textarea"),
      ...pillarFields(1),
      ...pillarFields(2),
      ...pillarFields(3),
      ...pillarFields(4),
    ],
  },
  {
    id: "company",
    page: "Dati aziendali",
    title: "Recapiti aziendali",
    description: "Telefono, email, indirizzo e orari: compaiono in barra superiore, contatti, mappa, footer e pulsante flottante.",
    previewHref: "/#contatti",
    fields: [
      f("company.phone", "Telefono", "text", { hint: "Come lo vedono i clienti, es. +39 350 597 3817. Il link di chiamata si crea da solo." }),
      f("company.email", "Email"),
      f("company.address", "Indirizzo sede", "text", { hint: "Anche la mappa si sposta su questo indirizzo." }),
      f("company.hours", "Orari segreteria"),
    ],
  },
];

export const ALL_CONTENT_KEYS = Object.keys(CONTENT_DEFAULTS) as ContentKey[];

export function isContentKey(key: string): key is ContentKey {
  return Object.prototype.hasOwnProperty.call(CONTENT_DEFAULTS, key);
}

/** Sottoinsieme dei contenuti le cui chiavi iniziano con uno dei prefissi dati. */
export type ContentSlice<P extends string> = Pick<SiteContent, Extract<ContentKey, `${P}${string}`>>;

/**
 * Da usare quando i contenuti passano a un componente client: il server li serializza nella pagina,
 * quindi conviene inviare solo le chiavi che servono davvero.
 */
export function pickContent<P extends string>(content: SiteContent, ...prefixes: P[]): ContentSlice<P> {
  const slice: Partial<SiteContent> = {};
  for (const key of ALL_CONTENT_KEYS) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) slice[key] = content[key];
  }
  return slice as ContentSlice<P>;
}

export const defaultContent = (): SiteContent => ({ ...CONTENT_DEFAULTS });

/** Unisce i valori salvati nel database ai predefiniti. Le chiavi sconosciute vengono ignorate. */
export function mergeContent(rows: { key: string; value: string }[]): SiteContent {
  const content = defaultContent();
  for (const row of rows) {
    if (isContentKey(row.key)) content[row.key] = row.value;
  }
  return content;
}
