---
name: responsive-admin-auditor
description: Agente specializzato nella verifica e ottimizzazione della responsività mobile del sito Safety Works, con focus primario sulla sezione Admin (/admin, Agenda, Corsi, Richieste, Servizi). Garantisce de-cluttering visivo, rispetto dei touch target ergonomici (>=44px), riordino logico mobile-first e trasformazione reattiva di tabelle, calendari, filtri e modali.
---

# Responsive Admin Auditor & Mobile UX Optimizer

Questa skill guida l'agente e gli sviluppatori nell'audit approfondito, diagnosi e refactoring della responsività mobile dell'intero portale **Safety Works**, con focus specialistico sulla **sezione Amministrazione (`/admin`)**.

---

## 1. Obiettivi e Missione

L'obiettivo primario è trasformare il pannello amministrativo da una complessa dashboard desktop-centrica a un'interfaccia **ergonomica, fluida e ad alta leggibilità su dispositivi mobili** (smartphone da 360px a 430px e tablet).

L'agente si concentra su:
1. **Eliminazione del sovraffollamento (De-cluttering)**: eliminare cumuli di bottoni minuscoli, troppi badge ravvicinati e stringhe testuali compresse o troncate male.
2. **Riordino logico Mobile-First**: stabilire una gerarchia visiva verticale impeccabile (prima lo stato e il dato chiave, poi l'azione primaria, infine i dettagli secondari espandibili).
3. **Ergonomia del tocco (Touch Ergonomics)**: garantire touch target minimi di **44x44px**, distanze di sicurezza anti-tap accidentali e controlli raggiungibili nella "Thumb Zone" (zona del pollice).
4. **Adattamento dei componenti critici**:
   - Calendario/Agenda: passare da griglie dense illeggibili a viste a dot indicatori + lista giornaliera.
   - Tabelle: trasformazione reattiva automatica in card compatte.
   - Barre filtri/ricerca: collasso in menu/drawer filtri compatti per non consumare il viewport.
   - Modali & Form: passare da popup ristretti a bottom-sheet o layout a schermo intero con azioni sticky.

---

## 2. Regole Euristiche Anti-Sovraffollamento (De-Cluttering)

### Regola A: Touch Target & Spaziatura (Fitts's Law)
- Tutti gli elementi cliccabili (pulsanti, toggle, icone, link) devono avere un'area cliccabile minima di **44x44px** su mobile (`min-h-[44px] min-w-[44px]` o padding adeguato `p-2.5 sm:p-2`).
- Distanza minima tra controlli interattivi adiacenti: almeno **8px** (`gap-2` o `gap-2.5`) per prevenire tocchi accidentali, in particolare per azioni distruttive come eliminazioni o archiviazioni.

### Regola B: Action Overflow Pattern (Massimo 2-3 azioni visibili)
- Su viewport mobile (`< 640px`), non affiancare mai più di **2 o 3 bottoni** per card o riga.
- **Pattern standard**:
  1. *Azione Primaria*: bottone prominente o con etichetta (es. "Rispondi", "Pianifica", "Modifica").
  2. *Azione Rapida 1-Click*: icona ad alto contrasto (es. WhatsApp verde o Telefono blu).
  3. *Menu Altre Azioni (`...` / Kebab)*: raccoglie azioni secondarie o distruttive (Duplica, Archivia, Elimina, Note).

### Regola C: Riordino Logico Verticale (Gerarchia dell'Informazione)
Su schermi stretti, gli elementi orizzontali desktop devono riposizionarsi verticalmente secondo una sequenza logica standard:
```
┌───────────────────────────────────────────────┐
│ 1. Header Card: Stato (Badge) + Titolo/Nome   │
├───────────────────────────────────────────────┤
│ 2. Dati Chiave: Data/Ora, Sede, Pax, Azienda  │
├───────────────────────────────────────────────┤
│ 3. Barra Azioni: CTA principale + Contatti    │
├───────────────────────────────────────────────┤
│ 4. Dettagli Espandibili: Accordion [Mostra +] │
└───────────────────────────────────────────────┘
```

### Regola D: Sfoltimento delle Barre Strumenti e Filtri
- Se una barra strumenti contiene più di 3 filtri, un campo di ricerca e selettori di vista (es. Agenda o Catalogo Corsi), su mobile **non deve occupare 4 o 5 righe impilate**.
- Soluzione richiesta:
  - Riga 1: Ricerca rapida full-width + Bottone "Filtri (badge)".
  - Il bottone apre un drawer o pannello comprimibile a fisarmonica con tutti i filtri secondari (stato, categoria, tipologia, reset).
  - Selettori di periodo (Mese / Anno) compattati con controlli a scorrimento orizzontale o dropdown unificato.

### Regola E: Calendario & Agenda su Mobile
- **Problema comune**: la vista mese con griglia a 7 colonne su schermi da 360-390px produce celle da ~45px. Inserire 3 box di testo orario+titolo rende l'interfaccia caotica e illeggibile.
- **Soluzione adottata**:
  - Mostrare la cella del giorno con il numero e da 1 a 3 **puntini (dot) colorati** corrispondenti alla tipologia dell'evento (es. verde per corso, arancione per sopralluogo, rosso per scadenza).
  - Al tocco di un giorno, mostrare immediatamente l'elenco chiaro e ordinato degli impegni della giornata in un pannello inferiore dedicato o drawer (Mobile Daily Schedule).
  - In alternativa, consentire un cambio rapido alla vista "Elenco" (List) o "Giorno" (Day) automatica su mobile.

### Regola F: Gestione Testo e Troncamenti Puliti
- Ogni contenitore `flex` che ospita testo con `truncate` deve avere obbligatoriamente la classe **`min-w-0`** sull'elemento genitore e sul nodo del testo. Senza `min-w-0`, il flex container si allarga all'infinito causando overflow orizzontale dell'intera pagina.
- Usare `line-clamp-1` o `line-clamp-2` per descrizioni di corsi o note cliente, lasciando l'espansione a un tocco esplicito.

### Regola G: Tabelle Responsive
- Evitare tabelle HTML pure con 7-10 colonne su schermi mobile senza contenitore scorrevole.
- Preferire layout a card per mobile (`block md:table`) o abilitare scroll orizzontale controllato con ombra indicatrice (`overflow-x-auto rounded-xl border`).

### Regola H: Modali e Drawer
- I modali non devono mai avere larghezza fissa o margini che ne tagliano il contenuto.
- Su mobile: `w-full max-h-[95vh] sm:max-h-[90vh] rounded-b-none sm:rounded-3xl` (stile Bottom Sheet) con barre d'azione sticky in basso (`sticky bottom-0 bg-white p-4 border-t`).

---

## 3. Script di Diagnostica Automatizzata

Un apposito script Node.js analizza i file del progetto identificando pattern a rischio di rottura o sovraffollamento mobile:

```bash
node .agents/skills/responsive-admin-auditor/scripts/audit-responsiveness.cjs
```

Lo script verifica:
- Presenza di `truncate` senza `min-w-0`
- Contenitori con oltre 3 bottoni affiancati senza classi responsive (`sm:` o `md:`)
- Griglie rigide a 5-7 colonne senza alternativa mobile
- Elementi con larghezza fissa in pixel (`w-[...px]` o `min-w-[...px]` > 320px)
- Tabelle sprovviste di wrapper `overflow-x-auto` o card responsive
- Form a più colonne senza fallback `grid-cols-1` su schermi piccoli

---

## 4. Checklist di Verifica Mobile (Audit Protocol)

Quando si testa una sezione o componente dell'Admin:

1. [ ] **Viewport 375px (iPhone standard)**: Non compare alcuna barra di scorrimento orizzontale indesiderata alla base della finestra.
2. [ ] **Touch Targets**: Nessun tasto o icona ha altezza inferiore a 40-44px.
3. [ ] **Densità Tasti**: Nessun gruppo con più di 3 pulsanti compatti uno accanto all'altro senza menu dropdown o wrapping ordinato.
4. [ ] **Leggibilità Testi**: Nessun titolo o testo normativo si sovrappone o viene tagliato a metà in modo incomprensibile.
5. [ ] **Header e Sidebar**: La sidebar si apre agevolmente come drawer a scorrimento e si chiude al tocco dell'overlay o del tasto di chiusura.
6. [ ] **Modali**: I modali si aprono correttamente a pieno schermo o bottom-sheet, con pulsanti di conferma "Salva" e "Annulla" sempre raggiungibili senza dover scorrere all'infinito.
7. [ ] **Form**: Tutti i campi input, textarea e select sono a larghezza intera (100%) e presentano etichette visibili sopra il campo.
8. [ ] **Performance**: Nessun ricalcolo o scatto (jank) durante il toggle di filtri o l'apertura di drawer su mobile.

---

## 5. Esempi di Refactoring Guidati

### Esempio 1: Barra Azioni Card (Da Affollata a Ordinata)

**Prima (Affollata, 6 icone compresse):**
```tsx
{/* ❌ 6 bottoni affiancati su 360px producono wrap caotico */}
<div className="flex items-center gap-1.5">
  <button title="WhatsApp"><MessageCircle /></button>
  <button title="Chiama"><Phone /></button>
  <button title="Mail"><Mail /></button>
  <button title="Agenda"><CalendarPlus /></button>
  <button title="Elimina"><Trash2 /></button>
  <button title="Dettagli"><ChevronDown /></button>
</div>
```

**Dopo (Mobile-First de-cluttered con Kebab Menu):**
```tsx
{/* ✅ Azione principale + Contatto veloce + Menu Altre Azioni */}
<div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
  <div className="flex items-center gap-2">
    {whatsappLink && (
      <a href={whatsappLink} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
        <MessageCircle className="w-5 h-5" />
      </a>
    )}
    {inq.phone && (
      <a href={`tel:${inq.phone}`} className="p-2.5 rounded-xl bg-cyan-50 text-[#008e97] min-h-[44px] min-w-[44px] flex items-center justify-center">
        <Phone className="w-5 h-5" />
      </a>
    )}
  </div>

  <div className="flex items-center gap-2">
    {/* Dropdown Menu "Altre azioni" su mobile, esteso su desktop */}
    <MobileActionMenu inq={inq} onSchedule={onSchedule} onDelete={onDelete} />
    <button onClick={toggleExpand} className="p-2.5 rounded-xl bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  </div>
</div>
```

### Esempio 2: Calendario Mese (Da celle affollate a Indicatori Dot)

```tsx
{/* Mobile: Cella compatta con pallini colorati */}
<div className="sm:hidden flex flex-wrap justify-center gap-0.5 mt-1">
  {dayEvents.slice(0, 3).map((evt) => (
    <span key={evt.id} className={`w-1.5 h-1.5 rounded-full ${getDotColor(evt.type)}`} />
  ))}
  {dayEvents.length > 3 && <span className="text-[8px] font-bold text-slate-400">+</span>}
</div>

{/* Desktop: Vista testuale classica con orario e titolo */}
<div className="hidden sm:block space-y-1 my-1">
  {dayEvents.slice(0, 3).map((evt) => (
    <div key={evt.id} className="text-[11px] truncate px-1.5 py-0.5 rounded border ...">
      {evt.startTime} {evt.title}
    </div>
  ))}
</div>
```

