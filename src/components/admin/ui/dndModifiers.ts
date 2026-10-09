import type { Modifier } from "@dnd-kit/core";

/** Il trascinamento resta sull'asse verticale (le righe si spostano solo su e giù). */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });
