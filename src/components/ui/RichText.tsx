import React from "react";

interface RichTextProps {
  text: string;
  /** Classi applicate alle parti [[evidenziate]]; con più classi si alternano in ordine. */
  highlight?: string | string[];
}

/**
 * Mostra un testo modificabile dal cliente con due soli marcatori:
 * **grassetto** e [[parola evidenziata]]. Nessun HTML: il contenuto non può rompere la pagina.
 */
export default function RichText({ text, highlight }: RichTextProps) {
  const classes = Array.isArray(highlight) ? highlight : highlight ? [highlight] : [];
  let highlightIndex = 0;

  const parts = text.split(/(\*\*[^*]+?\*\*|\[\[[^\]]+?\]\])/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("[[") && part.endsWith("]]") && part.length > 4) {
          const className = classes.length ? classes[highlightIndex++ % classes.length] : undefined;
          return (
            <span key={i} className={className}>
              {part.slice(2, -2)}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
