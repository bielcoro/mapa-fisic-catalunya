import type { Element, Punt } from '../data/types';
import { TIPUS_INFO } from '../data/types';
import { punts, radi } from '../lib/geo';

/* Elements gràfics que es dibuixen damunt del mapa (coordenades en px d'imatge).
   k = px d'imatge per px de pantalla, per mantenir mides constants en fer zoom. */

/** Diana que assenyala l'element preguntat */
export function Diana({ p, k, color = 'var(--diana)' }: { p: Punt; k: number; color?: string }) {
  const r = 11 * k;
  return (
    <g className="diana" pointerEvents="none">
      <circle cx={p[0]} cy={p[1]} r={r * 2.2} fill="none" stroke={color} strokeWidth={2.5 * k} className="diana-pols" />
      <circle cx={p[0]} cy={p[1]} r={r} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={3 * k} />
      <circle cx={p[0]} cy={p[1]} r={3 * k} fill={color} />
    </g>
  );
}

/** Zona on s'accepta la resposta (per als modes de clic) */
export function Zona({ e, k, estat }: { e: Element; k: number; estat: 'ok' | 'ko' | 'info' }) {
  const color = estat === 'ok' ? 'var(--ok)' : estat === 'ko' ? 'var(--ko)' : TIPUS_INFO[e.tipus].color;
  return (
    <g pointerEvents="none" className="zona-aparicio">
      {punts(e).map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={radi(e)} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={2 * k} strokeDasharray={`${6 * k} ${4 * k}`} />
          <circle cx={p[0]} cy={p[1]} r={4.5 * k} fill={color} stroke="#fff" strokeWidth={1.5 * k} />
        </g>
      ))}
    </g>
  );
}

/** Clic de l'usuari, amb una línia fins a la solució */
export function ClicUsuari({ clic, cap, k, correcte }: { clic: Punt; cap?: Punt; k: number; correcte?: boolean }) {
  const color = correcte === undefined ? 'var(--accent)' : correcte ? 'var(--ok)' : 'var(--ko)';
  return (
    <g pointerEvents="none">
      {cap && (
        <line x1={clic[0]} y1={clic[1]} x2={cap[0]} y2={cap[1]} stroke={color} strokeWidth={2.5 * k} strokeDasharray={`${5 * k} ${4 * k}`} />
      )}
      <g transform={`translate(${clic[0]} ${clic[1]})`}>
        <line x1={-8 * k} y1={-8 * k} x2={8 * k} y2={8 * k} stroke="#fff" strokeWidth={5 * k} strokeLinecap="round" />
        <line x1={-8 * k} y1={8 * k} x2={8 * k} y2={-8 * k} stroke="#fff" strokeWidth={5 * k} strokeLinecap="round" />
        <line x1={-8 * k} y1={-8 * k} x2={8 * k} y2={8 * k} stroke={color} strokeWidth={3 * k} strokeLinecap="round" />
        <line x1={-8 * k} y1={8 * k} x2={8 * k} y2={-8 * k} stroke={color} strokeWidth={3 * k} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Etiqueta de text llegible damunt del mapa */
export function Etiqueta({ p, text, k, color = 'var(--text)', petita }: { p: Punt; text: string; k: number; color?: string; petita?: boolean }) {
  const fs = (petita ? 11 : 13) * k;
  return (
    <text
      x={p[0]}
      y={p[1] - 12 * k}
      fontSize={fs}
      textAnchor="middle"
      className="etiqueta-mapa"
      fill={color}
      strokeWidth={3.5 * k}
      pointerEvents="none"
    >
      {text}
    </text>
  );
}

/** Punt petit per a un element (mode explora / editor). Els clics els gestiona el mapa. */
export function PuntElement({ e, k, actiu, apres }: { e: Element; k: number; actiu?: boolean; apres?: boolean }) {
  const color = TIPUS_INFO[e.tipus].color;
  return (
    <g className="punt-element" pointerEvents="none">
      {punts(e).map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={(actiu ? 8 : 5.5) * k}
          fill={apres ? 'var(--ok)' : color}
          stroke={actiu ? 'var(--diana)' : '#fff'}
          strokeWidth={(actiu ? 3 : 1.5) * k}
          opacity={i === 0 ? 1 : 0.7}
        />
      ))}
    </g>
  );
}
