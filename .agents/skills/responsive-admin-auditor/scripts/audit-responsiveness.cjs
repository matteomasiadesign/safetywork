/**
 * audit-responsiveness.cjs
 * Script di diagnostica automatizzata per rilevare potenziali problemi di responsività mobile,
 * sovraffollamento visivo e violazioni di touch target nel pannello Admin e nei componenti correlati.
 */

const fs = require('fs');
const path = require('path');

const ADMIN_PATHS = [
  path.join(__dirname, '..', '..', '..', '..', 'src', 'components', 'admin'),
  path.join(__dirname, '..', '..', '..', '..', 'src', 'app', 'admin'),
];

console.log('\n🔍 ================================================================');
console.log('   SAFETY WORKS - RESPONSIVE ADMIN AUDITOR');
console.log('   Scansione anti-sovraffollamento & ergonomia mobile');
console.log('================================================================\n');

function scanDir(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDir(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = ADMIN_PATHS.flatMap(scanDir);
console.log(`📁 File admin rilevati per l'analisi: ${files.length}\n`);

let totalIssues = 0;
const reports = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(path.join(__dirname, '..', '..', '..', '..'), filePath).replace(/\\/g, '/');
  const fileIssues = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // 1. Truncate senza min-w-0
    if (line.includes('truncate') && !line.includes('min-w-0') && !line.includes('w-')) {
      // Controlla se la riga precedente o corrente ha flex
      const prevLine = idx > 0 ? lines[idx - 1] : '';
      if ((line.includes('flex') || prevLine.includes('flex')) && !line.includes('min-w-0') && !prevLine.includes('min-w-0')) {
        fileIssues.push({
          line: lineNum,
          type: 'TRUNCATE_NO_MIN_W',
          severity: 'AVVISO',
          desc: 'Uso di `truncate` in flex container senza `min-w-0`. Può causare overflow orizzontale su schermi stretti.',
          snippet: line.trim(),
        });
      }
    }

    // 2. Griglia a molte colonne senza fallback mobile
    const gridMatch = line.match(/grid-cols-([4-9]|1[0-2])\b/);
    if (gridMatch && !line.includes('sm:grid-cols') && !line.includes('md:grid-cols') && !line.includes('lg:grid-cols')) {
      fileIssues.push({
        line: lineNum,
        type: 'RIGID_MULTI_COLUMN_GRID',
        severity: 'CRITICA',
        desc: `Griglia a ${gridMatch[1]} colonne senza fallback mobile (manca grid-cols-1 o grid-cols-2 per schermi piccoli).`,
        snippet: line.trim(),
      });
    }

    // 3. Sovraffollamento bottoni (gruppo di > 4 bottoni senza classi responsive)
    const buttonCount = (line.match(/<button|<Link|<a\b/g) || []).length;
    if (buttonCount >= 4 && !line.includes('hidden sm:') && !line.includes('flex-col') && !line.includes('flex-wrap')) {
      fileIssues.push({
        line: lineNum,
        type: 'BUTTON_OVERCROWDING',
        severity: 'ELEVATA',
        desc: 'Possibile sovraffollamento di pulsanti orizzontali sulla stessa riga (>3 bottoni). Rischio tap accidentali su mobile.',
        snippet: line.trim(),
      });
    }

    // 4. Touch target ristretto (< 36px o p-0.5 / p-1 su bottoni d'azione)
    if (
      line.includes('<button') &&
      (line.includes('p-1 ') || line.includes('p-0.5') || line.includes('w-6 h-6') || line.includes('w-7 h-7')) &&
      !line.includes('sm:p-') &&
      !line.includes('min-h-[44px]')
    ) {
      fileIssues.push({
        line: lineNum,
        type: 'TINY_TOUCH_TARGET',
        severity: 'MODERATA',
        desc: 'Touch target inferiore a 40px (troppo piccolo per le dita su touchscreen). Richiede min-h-[40px] o padding responsive.',
        snippet: line.trim(),
      });
    }

    // 5. Larghezze fisse in pixel > 300px senza responsive max-w
    const fixedWidthMatch = line.match(/(?:w|min-w)-\[(\d+)px\]/);
    if (fixedWidthMatch && parseInt(fixedWidthMatch[1], 10) > 300 && !line.includes('max-w-') && !line.includes('sm:')) {
      fileIssues.push({
        line: lineNum,
        type: 'LARGE_FIXED_WIDTH',
        severity: 'CRITICA',
        desc: `Larghezza fissa di ${fixedWidthMatch[1]}px senza limite max-w su mobile. Rompe schermi piccoli (360-390px).`,
        snippet: line.trim(),
      });
    }

    // 6. Tabelle HTML senza contenitore overflow-x-auto
    if (line.includes('<table') && !content.includes('overflow-x-auto')) {
      fileIssues.push({
        line: lineNum,
        type: 'TABLE_WITHOUT_OVERFLOW',
        severity: 'CRITICA',
        desc: 'Tabella HTML senza contenitore scorrevole orizzontale (overflow-x-auto). Causa troncamento irreversibile.',
        snippet: line.trim(),
      });
    }
  });

  if (fileIssues.length > 0) {
    reports.push({ file: relPath, issues: fileIssues });
    totalIssues += fileIssues.length;
  }
});

// Stampa dei risultati
if (reports.length === 0) {
  console.log('✅ Nessuna violazione o collo di bottiglia evidente rilevato! Il codice admin rispetta le euristiche base.');
} else {
  console.log(`⚠️  Rilevate ${totalIssues} potenziali aree di miglioramento mobile su ${reports.length} file:\n`);
  reports.forEach((rep) => {
    console.log(`\n📄 [${rep.file}] (${rep.issues.length} punti di attenzione):`);
    rep.issues.forEach((iss) => {
      const badge =
        iss.severity === 'CRITICA'
          ? '🔴 CRITICA'
          : iss.severity === 'ELEVATA'
          ? '🟠 ELEVATA'
          : iss.severity === 'MODERATA'
          ? '🟡 MODERATA'
          : 'ℹ️  AVVISO';
      console.log(`  - L.${iss.line} [${badge}] ${iss.desc}`);
      if (iss.snippet.length > 80) {
        console.log(`    Snippet: ${iss.snippet.substring(0, 80)}...`);
      } else {
        console.log(`    Snippet: ${iss.snippet}`);
      }
    });
  });
}

console.log('\n================================================================');
console.log('💡 RACCOMANDAZIONI PRIORITARIE PER IL REFACTORING MOBILE:');
console.log('1. AgendaManager: Trasformare le celle della vista Mese in dot-indicators su schermi < 640px.');
console.log('2. InquiriesManager: Raggruppare i 5 bottoni di contatto/azione in un menu contestuale rapido.');
console.log('3. CoursesManager: Comprimere la barra filtri a 4 pills in un dropdown o drawer filtri a comparsa.');
console.log('4. Modali / Drawer: Aggiungere bottoni di chiusura e salvataggio sticky per schermi ridotti.');
console.log('================================================================\n');
