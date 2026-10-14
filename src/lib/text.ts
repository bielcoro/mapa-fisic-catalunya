import { ELEMENTS } from '../data/elements';
import type { Element } from '../data/types';

/** Treu accents i diacrítics */
export function senseAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const ARTICLES = new Set(['el', 'la', 'l', 'els', 'les']);

const ABREVIATURES: [RegExp, string][] = [
  [/\bsta\b\.?/g, 'santa'],
  [/\bst\b\.?/g, 'sant'],
  [/\bmunts\b\.?/g, 'muntanyes'],
  [/^s\b\.?/g, 'serra'],
];

/** Normalitza: minúscules, sense accents, sense puntuació, abreviatures desplegades. */
export function normalitza(s: string): string {
  let t = s.toLowerCase().trim();
  t = t.replace(/l·l|l\.l/g, 'll');
  t = senseAccents(t);
  t = t.replace(/[’'`´]/g, ' ');
  t = t.replace(/-/g, ' ');
  for (const [re, rep] of ABREVIATURES) t = t.replace(re, rep);
  t = t.replace(/[^a-z0-9 ]/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}

/** Clau de comparació: normalitzat i sense articles inicials (el, la, l', els, les) */
export function clau(s: string): string {
  const w = normalitza(s).split(' ');
  while (w.length > 1 && ARTICLES.has(w[0])) w.shift();
  return w.join(' ');
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

export type EstatParaula = 'ok' | 'accent' | 'gairebe' | 'falta' | 'sobra' | 'opcional';

export interface ResultatEscrit {
  correcte: boolean;
  /** Correcte però amb alguna lletra malament o sense accents */
  avis?: string;
  /** Diagnòstic paraula per paraula sobre el nom correcte */
  paraules: { text: string; estat: EstatParaula }[];
}

function formesAcceptades(e: Element): string[] {
  return [e.nom, ...(e.alMapa ? [e.alMapa] : []), ...(e.alies ?? [])];
}

/** Compara la resposta escrita amb el nom d'un element. */
export function comprovaEscrit(resposta: string, e: Element): ResultatEscrit {
  const r = clau(resposta);
  const formes = formesAcceptades(e).map(clau);
  const paraules = diagnosticaParaules(resposta, e.nom);

  if (!r) return { correcte: false, paraules };

  if (formes.includes(r)) {
    // Correcte. Mirem si hi falten accents respecte del nom oficial.
    const resp = resposta.toLowerCase().replace(/[’`´]/g, "'");
    const paraulesAmbAccent = e.nom
      .toLowerCase()
      .replace(/[’]/g, "'")
      .split(/[\s']+/)
      .filter((w) => /[àèéíïòóúüç·]/.test(w));
    const avis = r === clau(e.nom) && paraulesAmbAccent.some((w) => !resp.includes(w))
      ? `Correcte! Fixa't en els accents: «${e.nom}»`
      : undefined;
    return { correcte: true, avis, paraules };
  }

  // Si la resposta és exactament el nom d'un altre element, és incorrecta (no és una errada d'ortografia)
  if (ELEMENTS.some((x) => x.id !== e.id && formesAcceptades(x).some((f) => clau(f) === r))) {
    return { correcte: false, paraules };
  }
  const millor = Math.min(...formes.map((f) => levenshtein(r, f)));
  const llarg = clau(e.nom).length;
  const tolerancia = llarg >= 14 ? 2 : llarg >= 7 ? 1 : 0;
  if (millor <= tolerancia) {
    return { correcte: true, avis: `Gairebé perfecte! Revisa l'ortografia: «${e.nom}»`, paraules };
  }
  return { correcte: false, paraules };
}

/** Marca cada paraula del nom correcte com a encertada, mal escrita o absent. */
export function diagnosticaParaules(resposta: string, nomCorrecte: string): { text: string; estat: EstatParaula }[] {
  const usuari = normalitza(resposta).split(' ').filter(Boolean);
  const usats = new Set<number>();
  // Separem el nom correcte en paraules, mantenint l'apòstrof amb la paraula anterior (l', d')
  const trossos = nomCorrecte.replace(/([’'])/g, '$1 ').split(/\s+/).filter(Boolean);
  const res: { text: string; estat: EstatParaula }[] = [];
  for (const t of trossos) {
    const n = normalitza(t);
    if (!n) continue;
    const idx = usuari.findIndex((u, i) => !usats.has(i) && u === n);
    if (idx >= 0) {
      usats.add(idx);
      const exacte = resposta.toLowerCase().includes(t.toLowerCase().replace(/[’']/g, "'"));
      const teAccent = /[àèéíïòóúüç]/i.test(t);
      res.push({ text: t, estat: teAccent && !exacte ? 'accent' : 'ok' });
      continue;
    }
    if (ARTICLES.has(n)) {
      res.push({ text: t, estat: 'opcional' });
      continue;
    }
    const prop = usuari.findIndex((u, i) => !usats.has(i) && levenshtein(u, n) <= (n.length <= 3 ? 0 : Math.max(1, Math.floor(n.length / 4))));
    if (prop >= 0) {
      usats.add(prop);
      res.push({ text: t, estat: 'gairebe' });
    } else {
      res.push({ text: t, estat: 'falta' });
    }
  }
  usuari.forEach((u, i) => {
    if (!usats.has(i)) res.push({ text: u, estat: 'sobra' });
  });
  return res;
}
