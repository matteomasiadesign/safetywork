# Safety Works S.r.l.s. - Sito web e piattaforma corsi

Sito aziendale con catalogo corsi e pannello di amministrazione per **Safety Works S.r.l.s.**, società di consulenza, formazione accreditata e progettazione per la sicurezza nei luoghi di lavoro (D.Lgs. 81/08 e s.m.i.).

Il cliente gestisce da solo corsi, date, servizi, richieste ricevute, agenda e testi del sito dall'area `/admin`, senza toccare il codice.

---

## Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) con React 18 e TypeScript
- **Stile**: [Tailwind CSS](https://tailwindcss.com/) con palette aziendale; icone [Lucide](https://lucide.dev/)
- **Font**: Bricolage Grotesque (titoli), Plus Jakarta Sans e Inter (testi)
- **Database, accessi e immagini**: [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security, Auth, Storage)
- **Pubblicazione**: [Vercel](https://vercel.com/)

## Palette

- Ciano `#008e97` (colore di marca)
- Arancione `#f58220` (corsi e call to action)
- Rosso `#df0000` (avvisi e sicurezza)
- Slate `#0f172a` e grigi tecnici (testi e sfondi)

---

## Struttura

```
├── src/
│   ├── app/                  # Pagine e API (App Router)
│   │   ├── page.tsx          # Home
│   │   ├── chi-siamo/        # Pagina Chi siamo
│   │   ├── corsi/            # Catalogo e scheda corso (/corsi/[slug])
│   │   ├── admin/            # Pannello di amministrazione e login
│   │   └── api/              # /api/contact (invio richieste), /api/admin/revalidate
│   ├── components/
│   │   ├── admin/            # Gestione corsi, servizi, categorie, richieste, agenda, contenuti
│   │   ├── courses/          # Catalogo e modulo di iscrizione
│   │   ├── layout/           # Navbar e footer
│   │   ├── sections/         # Sezioni della home (hero, corsi, servizi, mappa, contatti)
│   │   └── ui/               # Componenti condivisi (card, preloader, widget di contatto...)
│   ├── config/company.ts     # Dati societari
│   ├── lib/                  # Accesso ai dati, client Supabase, utilità (ICS, immagini, slug)
│   └── middleware.ts         # Protezione delle rotte /admin
├── supabase/migrations/      # Schema del database, in ordine cronologico
└── .env.local.example        # Variabili d'ambiente da configurare
```

## Database

Le migrazioni in `supabase/migrations` creano: `admin_users`, `categories`, `courses`, `course_editions`, `services`, `inquiries`, `agenda_events`, `site_content` e il bucket `site-images` (max 150 kB, solo WebP/JPEG). Tutte le tabelle hanno Row Level Security: il pubblico legge solo i contenuti pubblicati e può solo inviare richieste; ogni scrittura è riservata agli amministratori.

---

## Configurazione

1. Crea un progetto Supabase e applica **in ordine** tutte le migrazioni di `supabase/migrations` (SQL Editor oppure Supabase CLI).
2. Copia `.env.local.example` in `.env.local` e imposta `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Project Settings → API). Le stesse variabili vanno impostate su Vercel.
3. In Supabase → Authentication crea l'utente amministratore, poi aggiungi il suo `id` alla tabella `admin_users`. Senza questa riga l'accesso a `/admin` viene negato.

Non inserire mai la chiave `service_role` in una variabile con prefisso `NEXT_PUBLIC_`.

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build di produzione
npm run start    # avvia la build di produzione
```

## Deploy su Vercel

1. Collega il repository a Vercel: il framework Next.js viene riconosciuto da `vercel.json`.
2. Imposta le variabili d'ambiente (vedi sopra).
3. Applica le migrazioni sul database **prima** di ogni deploy che ne introduce di nuove: la build legge le tabelle e fallisce se mancano.

Le pagine pubbliche sono rigenerate ogni 60 secondi e subito a ogni salvataggio dal pannello admin.
