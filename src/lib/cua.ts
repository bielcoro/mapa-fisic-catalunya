import { useRef } from 'react';
import type { Element } from '../data/types';
import { triaPonderat } from './random';
import { pes } from './store';

/**
 * Cua de pràctica: tria elements prioritzant els que costen més,
 * evita repeticions immediates i torna a preguntar els fallats
 * al cap d'unes quantes preguntes.
 */
export function useCua() {
  const recents = useRef<string[]>([]);
  const pendents = useRef<{ id: string; despres: number }[]>([]);
  const comptador = useRef(0);

  function seguent(candidats: Element[]): Element | null {
    if (!candidats.length) return null;
    comptador.current++;
    const ids = new Set(candidats.map((c) => c.id));
    const due = pendents.current.find((p) => p.despres <= comptador.current && ids.has(p.id));
    let e: Element;
    if (due) {
      pendents.current = pendents.current.filter((p) => p !== due);
      e = candidats.find((c) => c.id === due.id)!;
    } else {
      const evita = new Set(recents.current.slice(-Math.min(6, Math.floor(candidats.length / 2))));
      const pool = candidats.filter((c) => !evita.has(c.id));
      e = triaPonderat(pool.length ? pool : candidats, (x) => pes(x.id));
    }
    recents.current = [...recents.current, e.id].slice(-10);
    return e;
  }

  /** Torna a preguntar aquest element més endavant (3–5 preguntes després) */
  function reprograma(id: string) {
    if (pendents.current.some((p) => p.id === id)) return;
    pendents.current.push({ id, despres: comptador.current + 3 + Math.floor(Math.random() * 3) });
  }

  return { seguent, reprograma };
}
