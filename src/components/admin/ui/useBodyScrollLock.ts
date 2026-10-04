import { useEffect } from "react";

// Più pannelli possono essere aperti insieme (es. conferma sopra un modulo): il blocco si toglie solo quando si chiude l'ultimo.
let locks = 0;
let saved: { html: string; body: string; paddingRight: string } | null = null;

/** Blocca lo scroll della pagina sotto un pannello aperto, senza far "saltare" il layout per la scrollbar. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (locks === 0) {
      const { documentElement: html, body } = document;
      saved = { html: html.style.overflow, body: body.style.overflow, paddingRight: body.style.paddingRight };
      const scrollbar = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0 && saved) {
        const { documentElement: html, body } = document;
        html.style.overflow = saved.html;
        body.style.overflow = saved.body;
        body.style.paddingRight = saved.paddingRight;
        saved = null;
      }
    };
  }, [active]);
}
