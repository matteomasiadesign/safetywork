# Safety Work S.r.l.s. - Corporate Website & Educational Platform

Sito web aziendale moderno, ad alte prestazioni e conforme per **Safety Work S.r.l.s.**, società specializzata in consulenza, formazione accreditata e progettazione per la sicurezza e igiene nei luoghi di lavoro (D.Lgs. 81/08 e s.m.i.).

---

## 🚀 Stack Tecnologico

- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/) con Hot Module Replacement (HMR) istantaneo
- **Libreria UI**: [React 18](https://react.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/) con supporto ancore e schede corsi dinamiche
- **Linguaggio**: TypeScript
- **Stilizzazione**: [Tailwind CSS](https://tailwindcss.com/) con palette aziendale personalizzata e linee tecniche/geometriche
- **Iconografia**: [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL con Row Level Security)
- **Deploy**: Build statica ottimizzata (`dist/`) pronta per Vercel, Netlify, Cloudflare Pages, GitHub Pages o hosting tradizionale (Apache, Nginx, FTP).

---

## 🎨 Palette Colori Brand

Configurata all'interno di `tailwind.config.ts` e `src/app/globals.css`:
- **Neutro Principale / Sfondo**: Bianco (`#ffffff`) e Grigi Tecnici (`#f8fafc`, `#f1f5f9`, `#0f172a`)
- **Ciano Intenso** (Colore Primario / Brand): `#008e97`
- **Arancione** (Accento / Corsi / Call to Action): `#f58220`
- **Rosso Intenso** (Avvisi / Elementi Critici Sicurezza): `#df0000`

---

## 📁 Struttura del Progetto

```
├── index.html                     # Entry point HTML principale di Vite
├── vite.config.ts                 # Configurazione di Vite (plugin React, alias @)
├── vercel.json                    # Configurazione per deploy istantaneo su Vercel (dist)
├── public/
│   └── _redirects                 # Regole SPA per Netlify e Cloudflare Pages
├── src/
│   ├── main.tsx                   # Punto di mount React
│   ├── App.tsx                    # Configurazione React Router e ScrollToAnchor
│   ├── pages/
│   │   ├── HomePage.tsx           # Homepage a sezioni
│   │   └── CourseDetailPage.tsx   # Scheda dinamica del corso (/corsi/:slug)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Header con menu responsive e modale
│   │   │   └── Footer.tsx         # Footer societario con dati fiscali
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx    # Sezione Hero con CTA
│   │   │   ├── CoursesSection.tsx # Griglia corsi con ricerca e filtri
│   │   │   ├── AboutSection.tsx   # Chi Siamo con statistiche
│   │   │   ├── ServicesSection.tsx# 4 pilastri tecnici
│   │   │   └── ContactSection.tsx # Form di contatto e richiesta preventivo
│   │   ├── ui/
│   │   │   ├── Link.tsx           # Componente link universale
│   │   │   ├── CourseCard.tsx     # Card tecnica corso
│   │   │   ├── ServiceCard.tsx    # Card servizi
│   │   │   └── GeometricBadge.tsx # Badge grafici
│   │   └── auth/
│   │       └── AuthModal.tsx      # Finestra modale accesso/registrazione
│   ├── lib/
│   │   ├── data/
│   │   │   └── mockCourses.ts     # Catalogo corsi D.Lgs. 81/08
│   │   └── types/
│   │       └── database.ts        # Modelli di dati TypeScript
│   └── app/
│       └── globals.css            # Classi Tailwind e grafiche geometriche
```

---

## ⚡ Comandi di Sviluppo e Build

### 1. Installazione dipendenze
```bash
npm install
```

### 2. Avvio in Sviluppo con Vite
```bash
npm run dev
```
Apri [http://localhost:5173](http://localhost:5173) nel browser.

### 3. Compilazione per la Produzione (Deploy)
```bash
npm run build
```
Genera la cartella `dist/` ottimizzata e pronta per il caricamento.

### 4. Anteprima Locale della Build
```bash
npm run preview
```

---

## 🌐 Istruzioni per il Deploy

### Opzione 1: Vercel
1. Collega il repository a Vercel.
2. Il file `vercel.json` già presente imposta automaticamente la cartella `dist` e la gestione delle rotte SPA.
3. Clicca su **Deploy**.

### Opzione 2: Netlify
1. Collega il repository su Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Il file `public/_redirects` è già incluso per gestire il routing SPA.

### Opzione 3: Hosting Tradizionale (FTP, cPanel, Apache, Nginx)
1. Esegui `npm run build`.
2. Carica l'intero contenuto della cartella `dist/` nella cartella pubblica del tuo server (es. `public_html` o `www`).
