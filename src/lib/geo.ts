import { PX_PER_KM, TIPUS_INFO, type Element, type Punt } from '../data/types';

export function punts(e: Element): Punt[] {
  return [e.p, ...(e.extra ?? [])];
}

export function radi(e: Element): number {
  return e.r ?? TIPUS_INFO[e.tipus].radi;
}

export function dist(a: Punt, b: Punt) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Punt de l'element més proper al clic */
export function mesProper(e: Element, clic: Punt): { punt: Punt; d: number } {
  let millor = { punt: e.p, d: Infinity };
  for (const p of punts(e)) {
    const d = dist(p, clic);
    if (d < millor.d) millor = { punt: p, d };
  }
  return millor;
}

export interface AvaluacioClic {
  correcte: boolean;
  km: number;
  punt: Punt;
  /** Text que explica cap a on s'ha desviat el clic */
  direccio: string;
}

export function avaluaClic(e: Element, clic: Punt): AvaluacioClic {
  const { punt, d } = mesProper(e, clic);
  const correcte = d <= radi(e);
  const km = Math.round(d / PX_PER_KM);
  const dx = clic[0] - punt[0];
  const dy = clic[1] - punt[1];
  const parts: string[] = [];
  const llindar = Math.max(12, radi(e) * 0.35);
  if (dy < -llindar) parts.push('al nord');
  if (dy > llindar) parts.push('al sud');
  if (dx > llindar) parts.push("a l'est");
  if (dx < -llindar) parts.push("a l'oest");
  const direccio = correcte
    ? km <= 1
      ? 'Just al lloc!'
      : `Molt bé! A uns ${km} km del punt de referència.`
    : `Has clicat massa ${parts.join(' i ') || 'lluny'} (a uns ${km} km).`;
  return { correcte, km, punt, direccio };
}
