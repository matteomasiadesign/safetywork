-- ==============================================================================
-- SAFETY WORK S.R.L.S. - DATABASE SCHEMA FOR SUPABASE
-- Consulenza, Formazione e Progettazione per la Sicurezza e Igiene sul Lavoro
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration
DROP TABLE IF EXISTS public.contact_inquiries CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- ==============================================================================
-- 3. COURSES TABLE
-- ==============================================================================
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    short_description TEXT NOT NULL,
    content TEXT NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 8,
    mode VARCHAR(100) NOT NULL DEFAULT 'Aula / Videoconferenza',
    validity_years INTEGER NOT NULL DEFAULT 5,
    normative_ref VARCHAR(255) NOT NULL DEFAULT 'D.Lgs. 81/08 e s.m.i.',
    target_audience TEXT,
    certification_issued VARCHAR(255) DEFAULT 'Attestato valido ai sensi di legge su territorio nazionale',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on slug and category for fast lookups
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_featured ON public.courses(is_featured);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can read all courses
CREATE POLICY "Public courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

-- RLS Policy: Only authenticated users with admin role or admin claim can insert/update/delete
CREATE POLICY "Admin users can insert courses" 
ON public.courses 
FOR INSERT 
TO authenticated 
WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@safetyworks.it'
);

CREATE POLICY "Admin users can update courses" 
ON public.courses 
FOR UPDATE 
TO authenticated 
USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@safetyworks.it'
);

CREATE POLICY "Admin users can delete courses" 
ON public.courses 
FOR DELETE 
TO authenticated 
USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@safetyworks.it'
);

-- ==============================================================================
-- 4. CONTACT INQUIRIES TABLE
-- ==============================================================================
CREATE TABLE public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    service_type VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on contact_inquiries
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Public (anon & authenticated) can insert contact requests
CREATE POLICY "Anyone can submit a contact inquiry" 
ON public.contact_inquiries 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read contact inquiries
CREATE POLICY "Only admins can view contact inquiries" 
ON public.contact_inquiries 
FOR SELECT 
TO authenticated 
USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@safetyworks.it'
);

-- ==============================================================================
-- 5. INITIAL SEED DATA (Conforme D.Lgs. 81/08 & Accordi Stato-Regioni)
-- ==============================================================================

INSERT INTO public.courses (title, slug, category, short_description, content, duration_hours, mode, validity_years, normative_ref, target_audience, certification_issued, is_featured)
VALUES 
(
    'Corso RSPP Datore di Lavoro (Rischio Basso, Medio, Alto)',
    'rspp-datore-di-lavoro',
    'Datori di Lavoro & Dirigenti',
    'Percorso normato per assumere direttamente l’incarico di Responsabile del Servizio di Prevenzione e Protezione nella propria azienda.',
    'Il corso consente al Datore di Lavoro di svolgere direttamente i compiti propri del Servizio di Prevenzione e Protezione (RSPP), conformemente all''art. 34 del D.Lgs. 81/08 e all''Accordo Stato-Regioni del 21/12/2011. Il programma è articolato in 4 moduli: Normativo-giuridico, Gestionale dei processi di sicurezza, Tecnico per la valutazione dei rischi specifici, Relazionale e comunicazione della sicurezza.',
    16,
    'Aula / Videoconferenza sincrona',
    5,
    'Art. 34 D.Lgs. 81/08 - Accordo Stato-Regioni 21/12/2011',
    'Datori di Lavoro che intendono assumere direttamente il ruolo di RSPP aziendale.',
    'Attestato di abilitazione RSPP Datore di Lavoro con verifica finale dell''apprendimento.',
    true
),
(
    'Rappresentante dei Lavoratori per la Sicurezza (RLS)',
    'rappresentante-lavoratori-sicurezza-rls',
    'Rappresentanti & Figure Chiave',
    'Formazione obbligatoria iniziale di 32 ore per il rappresentante eletto dai lavoratori per la salute e sicurezza sul lavoro.',
    'Il corso per RLS (32 ore) fornisce le competenze necessarie per comprendere i principi giuridici della sicurezza sul lavoro, identificare i fattori di rischio nei luoghi di lavoro, collaborare attivamente alla valutazione dei rischi e gestire la comunicazione e consultazione coi lavoratori.',
    32,
    'Aula / Videoconferenza',
    1,
    'Art. 37 comma 10-11 D.Lgs. 81/08',
    'Lavoratori eletti o designati per svolgere il ruolo di RLS in aziende di qualsiasi settore merceologico.',
    'Attestato ufficiale RLS valido su tutto il territorio nazionale.',
    true
),
(
    'Addetto Antincendio e Gestione Emergenze (Livello 1, 2 e 3)',
    'addetto-antincendio-emergenze',
    'Emergenze & Antincendio',
    'Corso teorico-pratico per gli addetti alla prevenzione incendi, lotta antincendio e gestione delle emergenze aziendali.',
    'Conformemente al D.M. 02/09/2021 (che ha ridefinito la formazione antincendio), il corso prepara gli addetti all''adozione delle misure preventive, all''uso corretto degli estintori portatili, idranti e DPI antincendio, nonché alle procedure di evacuazione rapida ed efficace del personale.',
    8,
    'Teoria + Esercitazione Pratica con Fuoco Vivo',
    5,
    'D.M. 02/09/2021 - D.Lgs. 81/08 art. 43 e 46',
    'Lavoratori incaricati dell''attuazione delle misure di prevenzione incendi ed evacuazione.',
    'Attestato di idoneità tecnica antincendio con prova pratica documentata.',
    true
),
(
    'Addetto al Primo Soccorso Aziendale (Gruppo A, B, C)',
    'primo-soccorso-aziendale',
    'Primo Soccorso',
    'Addestramento pratico e nozioni mediche di base per la gestione tempestiva delle emergenze sanitarie nei luoghi di lavoro.',
    'Corso strutturato ai sensi del D.M. 388/2003 e del D.Lgs. 81/08 art. 45. Include tecniche di BLS (Basic Life Support), gestione del trauma, arresto cardiocircolatorio, emorragie, ustioni, intossicazioni e addestramento all''utilizzo del defibrillatore DAE su manichino interattivo.',
    12,
    'Aula e prove pratiche su manichino didattico',
    3,
    'D.M. 388/03 e D.Lgs. 81/08 art. 45',
    'Lavoratori designati al ruolo di addetto al primo soccorso aziendale.',
    'Certificazione di Addetto al Primo Soccorso Aziendale con prova pratica.',
    true
),
(
    'Formazione Lavoratori - Generale e Specifica (Rischio Basso/Medio/Alto)',
    'formazione-lavoratori-generale-specifica',
    'Lavoratori & Preposti',
    'Il corso fondamentale e obbligatorio per tutti i dipendenti e neo-assunti in conformità all’art. 37 del D.Lgs. 81/08.',
    'Comprende 4 ore di formazione generale (concetti di rischio, danno, prevenzione, diritti e doveri dei soggetti aziendali) più 4, 8 o 12 ore di formazione specifica relative alle mansioni aziendali (rischio videoterminali, movimentazione carichi, sostanze chimiche, DPI, rumore e microclima).',
    8,
    'E-learning per modulo generale + Aula/Videoconferenza per modulo specifico',
    5,
    'Art. 37 D.Lgs. 81/08 - Accordo Stato-Regioni 21/12/2011',
    'Tutti i lavoratori assunti in aziende private o enti pubblici.',
    'Attestato di frequenza e profitto con tracciamento certificato.',
    false
),
(
    'Corso per Preposto alla Sicurezza',
    'corso-preposto-sicurezza',
    'Lavoratori & Preposti',
    'Modulo integrativo per le figure che sovrintendono all''attività lavorativa e garantiscono l''attuazione delle direttive.',
    'Aggiornato alle ultime modifiche della Legge 215/2021. Approfondisce il ruolo di garante della sicurezza del preposto, le modalità operative di vigilanza e interruzione delle lavorazioni pericolose, e le responsabilità civili e penali correlate al ruolo.',
    8,
    'Aula / Videoconferenza interattiva',
    2,
    'Art. 37 c. 7 D.Lgs. 81/08 e Legge 215/2021',
    'Capi squadra, responsabili di reparto, capi cantiere e preposti.',
    'Attestato di abilitazione Preposto alla Sicurezza.',
    false
),
(
    'Abilitazione Conduzione Carrelli Elevatori (Muletto)',
    'patentino-carrelli-elevatori-muletto',
    'Attrezzature & Macchine',
    'Abilitazione teorico-pratica per carrellisti semoventi con conducente a bordo (comunemente noto come Patentino Muletto).',
    'Conforme all''Accordo Stato-Regioni del 22/02/2012 sulle attrezzature di lavoro che richiedono specifica abilitazione. Prevede modulo giuridico, modulo tecnico (stabilità del mezzo, portata residua, centri di gravità) e prova pratica su circuito di guida reale con carico.',
    12,
    'Teoria + Prova Pratica su campo attrezzato',
    5,
    'Accordo Stato-Regioni 22/02/2012 - Art. 73 D.Lgs. 81/08',
    'Operatori addetti alla movimentazione merci e stoccaggio magazzino.',
    'Patentino per carrelli elevatori semoventi industriali (valido 5 anni).',
    true
),
(
    'Corso Lavori in Quota e DPI di 3° Categoria',
    'lavori-in-quota-dpi-terza-categoria',
    'Sicurezza Speciale & Cantieri',
    'Addestramento pratico all''uso corretto delle imbracature, sistemi anticaduta, cordini e connettori per lavori oltre i 2 metri.',
    'Il corso risponde all''obbligo di addestramento pratico imposto dall''art. 77 comma 5 del D.Lgs. 81/08 per i dispositivi di protezione individuale di 3ª categoria. Vengono affrontati i concetti di tirante d''aria, fattore di caduta, ancoraggi EN 795 e simulazione di recupero dell''infortunato sospeso.',
    8,
    'Teoria + Addestramento Pratico su torre/struttura addestrativa',
    5,
    'Art. 77 e Art. 115 D.Lgs. 81/08',
    'Operai edili, manutentori, montatori di ponteggi e impiantisti.',
    'Attestato con addestramento certificato DPI di 3° categoria.',
    false
);

