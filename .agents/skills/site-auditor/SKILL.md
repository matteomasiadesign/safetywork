---
name: site-auditor
description: Analizza la struttura del sito web Safety Works (React, Vite, Next.js, Supabase, Tailwind CSS) per identificare incongruenze architetturali, problemi di performance, SEO, sicurezza e manutenibilità, fornendo raccomandazioni prioritarie.
---

# Site Auditor - Safety Works

Questa skill guida l'agente nell'esecuzione di un audit completo della struttura e del codice del sito web Safety Works.

## Ambito di Analisi

1. **Architettura e Coerenza Framework**:
   - Riconoscere la convivenza di file Vite (`index.html`, `src/main.tsx`, `src/App.tsx`, `vite.config.ts`) e Next.js (`src/app/`, `next.config.mjs`).
   - Verificare dipendenze, routing (`react-router-dom` vs Next App Router) e script di build.

2. **Gestione Stato e Dati**:
   - `src/context/DataContext.tsx`: persistenza su `localStorage` vs sincronizzazione con Supabase.
   - Integrità schemi `supabase_schema.sql` e tipi `src/lib/types/database.ts`.

3. **Sicurezza e Controllo Accessi**:
   - Protezione delle rotte Admin (`/admin`, `src/pages/AdminPage.tsx`, `src/components/admin/`).
   - Verifica di chiavi API esposte, Row Level Security (RLS) su Supabase.

4. **SEO, Accessibilità e Performance**:
   - Metadati, Open Graph, semantica HTML, caricamento font (`Plus Jakarta Sans`, `Inter`), immagini e bundle size.
   - Script di supporto e file di pulizia (`fix.cjs`, `remove-ai-badges.cjs`, ecc.).

## Output Atteso

Un report strutturato contenente:
- **Panoramica dello stato attuale**
- **Criticità Architetturali & Tecniche** (Priorità Alta)
- **Miglioramenti UX, SEO & Performance** (Priorità Media)
- **Piano di azione passo-passo consigliato**

