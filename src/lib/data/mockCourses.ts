import { Course } from "@/lib/types/database";

export const MOCK_COURSES: Course[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Corso RSPP Datore di Lavoro (Rischio Basso, Medio, Alto)",
    slug: "rspp-datore-di-lavoro",
    category: "Datori di Lavoro & Dirigenti",
    short_description: "Percorso normato per assumere direttamente l’incarico di Responsabile del Servizio di Prevenzione e Protezione nella propria azienda.",
    content: `Il corso consente al Datore di Lavoro di svolgere direttamente i compiti propri del Servizio di Prevenzione e Protezione (RSPP), conformemente all'art. 34 del D.Lgs. 81/08 e all'Accordo Stato-Regioni del 21/12/2011.

### Obiettivi del Corso
Fornire ai datori di lavoro le competenze necessarie per organizzare, gestire e supervisionare il sistema di prevenzione aziendale in totale conformità con le norme vigenti, identificando i rischi, predisponendo le misure di prevenzione e redigendo il Documento di Valutazione dei Rischi (DVR).

### Articolazione del Programma
1. **Modulo 1 - Normativo e Giuridico (4 ore)**: Il sistema legislativo in materia di sicurezza dei lavoratori; la responsabilità civile e penale; gli organi di vigilanza e controllo.
2. **Modulo 2 - Gestionale (4 ore)**: I modelli di organizzazione e gestione della sicurezza (SGSL); la consultazione del RLS; la gestione della documentazione di sicurezza.
3. **Modulo 3 - Tecnico (4 ore)**: Individuazione e valutazione dei rischi specifici; ambienti di lavoro, rischio elettrico, rischio chimico, movimentazione manuale dei carichi.
4. **Modulo 4 - Relazionale (4 ore)**: La formazione, informazione e addestramento dei lavoratori; la comunicazione efficace nei processi di sicurezza.

### Verifica Finale
Test scritto a risposta multipla e colloquio di verifica dell'apprendimento.`,
    duration_hours: 16,
    mode: "Aula / Videoconferenza sincrona",
    validity_years: 5,
    normative_ref: "Art. 34 D.Lgs. 81/08 - Accordo Stato-Regioni 21/12/2011",
    target_audience: "Datori di Lavoro che intendono assumere direttamente il ruolo di RSPP.",
    certification_issued: "Attestato di abilitazione RSPP Datore di Lavoro con verifica finale.",
    is_featured: true,
    is_open_for_enrollment: true,
    seats_available: 4,
    image_url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 14 Ottobre 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    title: "Rappresentante dei Lavoratori per la Sicurezza (RLS)",
    slug: "rappresentante-lavoratori-sicurezza-rls",
    category: "Rappresentanti & Figure Chiave",
    short_description: "Formazione obbligatoria iniziale di 32 ore per il rappresentante eletto dai lavoratori per la salute e sicurezza sul lavoro.",
    content: `Il corso per RLS (32 ore) fornisce le competenze necessarie per comprendere i principi giuridici della sicurezza sul lavoro, identificare i fattori di rischio nei luoghi di lavoro e collaborare attivamente alla valutazione dei rischi.

### Programma Formativo
- Quadro normativo europeo e nazionale sulla sicurezza sul lavoro.
- Le figure della prevenzione aziendale e i rispettivi obblighi.
- Metodologia di individuazione e valutazione dei fattori di rischio.
- Tecniche di comunicazione aziendale e gestione dei rapporti coi lavoratori.
- Nozioni sulle malattie professionali e infortuni sul lavoro.`,
    duration_hours: 32,
    mode: "Aula / Videoconferenza",
    validity_years: 1,
    normative_ref: "Art. 37 comma 10-11 D.Lgs. 81/08",
    target_audience: "Lavoratori eletti o designati a svolgere il ruolo di RLS.",
    certification_issued: "Attestato ufficiale RLS valido su tutto il territorio nazionale.",
    is_featured: false,
    is_open_for_enrollment: false,
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 20 Ottobre 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    title: "Addetto Antincendio e Gestione Emergenze (Livello 1, 2 e 3)",
    slug: "addetto-antincendio-emergenze",
    category: "Emergenze & Antincendio",
    short_description: "Corso teorico-pratico per gli addetti alla prevenzione incendi, lotta antincendio e gestione delle emergenze aziendali.",
    content: `In conformità al D.M. 02/09/2021 (che sostituisce il D.M. 10/03/1998), il corso prepara gli addetti all'adozione delle misure preventive, all'uso corretto degli estintori portatili, idranti e DPI antincendio, nonché alle procedure di evacuazione rapida.

### Sezioni del Corso
- **Teoria**: Principi della combustione e prodotti dell'incendio; sostanze estinguenti; triangolo del fuoco; misure di protezione passiva e attiva.
- **Pratica**: Presa visione e prova di spegnimento con estintori a polvere e a CO2 su vasca a fuoco vivo; stendimento e raccordo di manichette antincendio.`,
    duration_hours: 8,
    mode: "Teoria + Esercitazione Pratica Fuoco Vivo",
    validity_years: 5,
    normative_ref: "D.M. 02/09/2021 - D.Lgs. 81/08 art. 43 e 46",
    target_audience: "Lavoratori incaricati dell'attuazione delle misure di prevenzione incendi ed evacuazione.",
    certification_issued: "Attestato di idoneità tecnica antincendio con prova pratica documentata.",
    is_featured: true,
    is_open_for_enrollment: true,
    seats_available: 6,
    image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
    period: "In partenza: Ogni Martedì",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    title: "Addetto al Primo Soccorso Aziendale (Gruppo A, B, C)",
    slug: "primo-soccorso-aziendale",
    category: "Primo Soccorso",
    short_description: "Addestramento pratico e nozioni mediche di base per la gestione tempestiva delle emergenze sanitarie nei luoghi di lavoro.",
    content: `Corso strutturato ai sensi del D.M. 388/2003 e del D.Lgs. 81/08 art. 45. Include tecniche di BLS (Basic Life Support), gestione del trauma, arresto cardiocircolatorio, emorragie, ustioni e utilizzo del defibrillatore DAE.

### Moduli Didattici
- **Modulo A**: Allertamento del sistema di soccorso (112/118), riconoscimento dell'emergenza sanitaria.
- **Modulo B**: Accertamento delle condizioni psicofisiche del lavoratore infortunato, nozioni elementari di anatomia e fisiologia.
- **Modulo C**: Esercitazioni pratiche su manichino didattico (massaggio cardiaco, respirazione artificiale, manovra di Heimlich per disostruzione vie aeree).`,
    duration_hours: 12,
    mode: "Aula e prove pratiche su manichino",
    validity_years: 3,
    normative_ref: "D.M. 388/03 e D.Lgs. 81/08 art. 45",
    target_audience: "Lavoratori designati al ruolo di addetto al primo soccorso aziendale.",
    certification_issued: "Certificazione di Addetto al Primo Soccorso Aziendale con prova pratica.",
    is_featured: true,
    is_open_for_enrollment: true,
    seats_available: 3,
    image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 27 Ottobre 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
    title: "Formazione Lavoratori - Generale e Specifica (Rischio Basso/Medio/Alto)",
    slug: "formazione-lavoratori-generale-specifica",
    category: "Lavoratori & Preposti",
    short_description: "Il corso fondamentale e obbligatorio per tutti i dipendenti e neo-assunti in conformità all’art. 37 del D.Lgs. 81/08.",
    content: `Comprende 4 ore di formazione generale obbligatoria per tutti i settori (concetti di pericolo, rischio, danno, prevenzione, diritti e doveri) più 4, 8 o 12 ore di formazione specifica relative alle mansioni aziendali (rischio videoterminali, movimentazione manuale dei carichi, sostanze chimiche, DPI, microclima).`,
    duration_hours: 8,
    mode: "E-learning (Generale) + Aula/Videoconferenza (Specifica)",
    validity_years: 5,
    normative_ref: "Art. 37 D.Lgs. 81/08 - Accordo Stato-Regioni 21/12/2011",
    target_audience: "Tutti i lavoratori assunti in aziende private o enti pubblici.",
    certification_issued: "Attestato di frequenza e profitto con tracciamento orario certificato.",
    is_featured: false,
    is_open_for_enrollment: false,
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    period: "Edizioni settimanali / Sempre Attivo",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    title: "Corso per Preposto alla Sicurezza",
    slug: "corso-preposto-sicurezza",
    category: "Lavoratori & Preposti",
    short_description: "Modulo integrativo per le figure che sovrintendono all'attività lavorativa e garantiscono l'attuazione delle direttive.",
    content: `Aggiornato alle modifiche introdotte dalla Legge 215/2021 che ha rafforzato il ruolo del preposto. Il corso approfondisce le funzioni di controllo operativo, le facoltà di interruzione dell'attività in caso di pericolo grave e immediato, e il quadro delle sanzioni.`,
    duration_hours: 8,
    mode: "Aula / Videoconferenza interattiva",
    validity_years: 2,
    normative_ref: "Art. 37 c. 7 D.Lgs. 81/08 e Legge 215/2021",
    target_audience: "Capi squadra, responsabili di reparto, capi cantiere e preposti.",
    certification_issued: "Attestato di abilitazione Preposto alla Sicurezza.",
    is_featured: false,
    is_open_for_enrollment: false,
    image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 05 Novembre 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b815-9dad-11d1-80b4-00c04fd430c8",
    title: "Abilitazione Conduzione Carrelli Elevatori (Patentino Muletto)",
    slug: "patentino-carrelli-elevatori-muletto",
    category: "Attrezzature & Macchine",
    short_description: "Abilitazione teorico-pratica per carrellisti semoventi con conducente a bordo ai sensi dell'Accordo Stato-Regioni 22/02/2012.",
    content: `Il corso fornisce l'abilitazione (patentino) all'uso di carrelli elevatori semoventi industriali con conducente a bordo. Prevede un modulo giuridico, un modulo tecnico approfondito sulle forze in gioco e sulla stabilità del carrello, e una prova pratica su percorso guidato con carichi e scaffalature reali.`,
    duration_hours: 12,
    mode: "Teoria + Prova Pratica su campo attrezzato",
    validity_years: 5,
    normative_ref: "Accordo Stato-Regioni 22/02/2012 - Art. 73 D.Lgs. 81/08",
    target_audience: "Operatori di magazzino, logistica e produzione addetti alla conduzione di carrelli.",
    certification_issued: "Patentino carrelli elevatori industriali valido su tutto il territorio UE.",
    is_featured: true,
    is_open_for_enrollment: true,
    seats_available: 5,
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 10 Novembre 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "6ba7b816-9dad-11d1-80b4-00c04fd430c8",
    title: "Corso Lavori in Quota e DPI di 3° Categoria",
    slug: "lavori-in-quota-dpi-terza-categoria",
    category: "Sicurezza Speciale & Cantieri",
    short_description: "Addestramento pratico all'uso corretto di imbracature, sistemi anticaduta, cordini e connettori per lavori oltre i 2 metri.",
    content: `Il corso assolve all'obbligo di addestramento pratico per DPI di terza categoria salvavita ai sensi dell'art. 77 del D.Lgs. 81/08. Tratta le tipologie di caduta, tirante d'aria, fattore di caduta, verifica dell'integrità dei DPI prima dell'uso e prove pratiche di posizionamento ed evacuazione.`,
    duration_hours: 8,
    mode: "Teoria + Addestramento Pratico su struttura",
    validity_years: 5,
    normative_ref: "Art. 77 e Art. 115 D.Lgs. 81/08",
    target_audience: "Operatori edili, lattonieri, manutentori, impiantisti e montatori.",
    certification_issued: "Attestato con addestramento certificato DPI di 3° Categoria.",
    is_featured: false,
    is_open_for_enrollment: false,
    image_url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80",
    period: "Prossima sessione: 18 Novembre 2026",
    created_at: new Date().toISOString(),
  },
];
