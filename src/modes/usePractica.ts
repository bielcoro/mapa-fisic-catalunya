import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Element } from '../data/types';
import { useCua } from '../lib/cua';
import { registra, useElements, useEstat } from '../lib/store';

/** Lògica comuna dels modes de pràctica: candidats segons el filtre, cua i marcador. */
export function usePractica(candidatsFixos?: Element[]) {
  const { filtre } = useEstat();
  const els = useElements();
  const candidats = useMemo(
    () => candidatsFixos ?? (filtre.length ? els.filter((e) => filtre.includes(e.tipus)) : els),
    [candidatsFixos, els, filtre],
  );
  const cua = useCua();
  const [actual, setActual] = useState<Element | null>(null);
  const [num, setNum] = useState(0);
  const [stats, setStats] = useState({ encerts: 0, total: 0 });

  const seguent = useCallback(() => {
    setActual(cua.seguent(candidats));
    setNum((n) => n + 1);
  }, [candidats]);

  const clauCandidats = candidats.map((c) => c.id).join('|');
  useEffect(() => {
    seguent();
  }, [clauCandidats]);

  const resposta = useCallback(
    (correcte: boolean, id?: string) => {
      const eid = id ?? actual?.id;
      if (!eid) return 0;
      setStats((s) => ({ encerts: s.encerts + (correcte ? 1 : 0), total: s.total + 1 }));
      if (!correcte) cua.reprograma(eid);
      return registra(eid, correcte);
    },
    [actual],
  );

  return { candidats, actual, num, stats, seguent, resposta };
}
