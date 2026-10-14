import { useSyncExternalStore } from 'react';
import { ELEMENTS } from '../data/elements';
import type { Element, Punt, Tipus } from '../data/types';

/* Persistència a localStorage: tot es guarda al navegador, sense comptes ni servidor. */

const CLAU = 'mapa-fisic-cat:v1';

export interface ProgElem {
  ok: number;
  ko: number;
  /** Nivell de domini 0–5. A partir de 3 es considera «après». */
  nivell: number;
  ultim: number;
  targeta?: 'se' | 'repassar';
}

export interface ResultatExamen {
  data: number;
  nota: number;
  encerts: number;
  total: number;
}

export interface Ubicacio {
  p: Punt;
  extra?: Punt[];
  r?: number;
}

export interface Estat {
  prog: Record<string, ProgElem>;
  punts: number;
  ratxa: number;
  millorRatxa: number;
  examens: ResultatExamen[];
  millorExamen: number | null;
  ultimesFallades: string[];
  tempsTotal: number;
  ultimMode: string | null;
  tema: 'clar' | 'fosc';
  filtre: Tipus[];
  ubicacions: Record<string, Ubicacio>;
}

export const NIVELL_APRES = 3;

function inicial(): Estat {
  const fosc = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return {
    prog: {},
    punts: 0,
    ratxa: 0,
    millorRatxa: 0,
    examens: [],
    millorExamen: null,
    ultimesFallades: [],
    tempsTotal: 0,
    ultimMode: null,
    tema: fosc ? 'fosc' : 'clar',
    filtre: [],
    ubicacions: {},
  };
}

function carrega(): Estat {
  try {
    const raw = localStorage.getItem(CLAU);
    if (raw) return { ...inicial(), ...JSON.parse(raw) };
  } catch {
    /* sense localStorage: es treballa en memòria */
  }
  return inicial();
}

let estat: Estat = carrega();
const subs = new Set<() => void>();

function desa() {
  try {
    localStorage.setItem(CLAU, JSON.stringify(estat));
  } catch {
    /* ignora */
  }
}

export function getEstat() {
  return estat;
}

export function actualitza(fn: (e: Estat) => Estat) {
  estat = fn(estat);
  elementsCache = null;
  desa();
  subs.forEach((s) => s());
}

export function useEstat(): Estat {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => estat,
  );
}

/* ---------- Elements amb les correccions d'ubicació de l'usuari ---------- */

let elementsCache: Element[] | null = null;
export function elements(): Element[] {
  if (!elementsCache) {
    elementsCache = ELEMENTS.map((e) => {
      const u = estat.ubicacions[e.id];
      return u ? { ...e, p: u.p, extra: u.extra ?? e.extra, r: u.r ?? e.r } : e;
    });
  }
  return elementsCache;
}

export function useElements(): Element[] {
  useEstat();
  return elements();
}

export function elementPerId(id: string): Element | undefined {
  return elements().find((e) => e.id === id);
}

export function filtrats(filtre: Tipus[]): Element[] {
  const tots = elements();
  return filtre.length ? tots.filter((e) => filtre.includes(e.tipus)) : tots;
}

/* ---------- Registre de respostes ---------- */

function progDe(id: string): ProgElem {
  return estat.prog[id] ?? { ok: 0, ko: 0, nivell: 0, ultim: 0 };
}

/** Registra una resposta i retorna els punts guanyats. */
export function registra(id: string, correcte: boolean, opts: { puntua?: boolean } = {}): number {
  const puntua = opts.puntua ?? true;
  const p = progDe(id);
  let guany = 0;
  actualitza((e) => {
    const nou: ProgElem = correcte
      ? { ...p, ok: p.ok + 1, nivell: Math.min(5, p.nivell + 1), ultim: Date.now() }
      : { ...p, ko: p.ko + 1, nivell: Math.max(0, p.nivell - 2), ultim: Date.now() };
    const ratxa = correcte ? e.ratxa + 1 : 0;
    guany = puntua && correcte ? 10 + Math.min(e.ratxa, 10) : 0;
    return {
      ...e,
      prog: { ...e.prog, [id]: nou },
      ratxa: puntua ? ratxa : e.ratxa,
      millorRatxa: puntua ? Math.max(e.millorRatxa, ratxa) : e.millorRatxa,
      punts: e.punts + guany,
    };
  });
  return guany;
}

export function marcaTargeta(id: string, se: boolean) {
  const p = progDe(id);
  actualitza((e) => ({
    ...e,
    prog: {
      ...e.prog,
      [id]: se
        ? { ...p, targeta: 'se', nivell: Math.min(5, p.nivell + 1), ultim: Date.now() }
        : { ...p, targeta: 'repassar', ko: p.ko + 1, nivell: Math.max(0, p.nivell - 1), ultim: Date.now() },
    },
  }));
}

export function registraExamen(r: ResultatExamen, fallades: string[]) {
  actualitza((e) => ({
    ...e,
    examens: [...e.examens, r].slice(-30),
    millorExamen: e.millorExamen === null ? r.nota : Math.max(e.millorExamen, r.nota),
    ultimesFallades: fallades,
  }));
}

export function sumaTemps(segons: number) {
  actualitza((e) => ({ ...e, tempsTotal: e.tempsTotal + segons }));
}

export function setUltimMode(mode: string) {
  if (estat.ultimMode !== mode) actualitza((e) => ({ ...e, ultimMode: mode }));
}

export function setTema(tema: 'clar' | 'fosc') {
  actualitza((e) => ({ ...e, tema }));
}

export function setFiltre(filtre: Tipus[]) {
  actualitza((e) => ({ ...e, filtre }));
}

export function reiniciaProgres() {
  actualitza((e) => ({
    ...inicial(),
    tema: e.tema,
    ubicacions: e.ubicacions, // les correccions del mapa no es perden
  }));
}

/* ---------- Ubicacions (editor) ---------- */

export function setUbicacio(id: string, u: Ubicacio | null) {
  actualitza((e) => {
    const ub = { ...e.ubicacions };
    if (u) ub[id] = u;
    else delete ub[id];
    return { ...e, ubicacions: ub };
  });
}

export function importaUbicacions(json: string): number {
  const dades = JSON.parse(json) as Record<string, Ubicacio>;
  const valides = Object.entries(dades).filter(
    ([id, u]) => ELEMENTS.some((e) => e.id === id) && Array.isArray(u?.p) && u.p.length === 2,
  );
  actualitza((e) => ({ ...e, ubicacions: { ...e.ubicacions, ...Object.fromEntries(valides) } }));
  return valides.length;
}

/* ---------- Estadístiques ---------- */

export function esApres(id: string, s: Estat = estat) {
  return (s.prog[id]?.nivell ?? 0) >= NIVELL_APRES;
}

/** Puntuació de dificultat: com més alta, més li costa a l'usuari */
export function dificultat(p: ProgElem | undefined): number {
  if (!p) return 0;
  return p.ko * 2 - p.ok * 0.7 + (5 - p.nivell) * 0.3;
}

export function mesDificils(s: Estat, n = 8): { e: Element; p: ProgElem }[] {
  return elements()
    .filter((e) => (s.prog[e.id]?.ko ?? 0) > 0)
    .map((e) => ({ e, p: s.prog[e.id] }))
    .sort((a, b) => dificultat(b.p) - dificultat(a.p))
    .slice(0, n);
}

/** Pes per triar elements: prioritza els no apresos i els que es fallen. */
export function pes(id: string, s: Estat = estat): number {
  const p = s.prog[id];
  if (!p) return 3;
  return Math.max(0.25, 1 + (5 - p.nivell) * 0.9 + p.ko * 1.5 - p.ok * 0.25);
}
