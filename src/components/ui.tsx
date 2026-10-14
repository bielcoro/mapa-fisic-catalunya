import { useEffect, useState, type ReactNode } from 'react';
import { ORDRE_TIPUS, TIPUS_INFO, type Element, type Tipus } from '../data/types';
import type { EstatParaula } from '../lib/text';
import { setFiltre, useElements, useEstat } from '../lib/store';

/** Selector de tipus d'element (comú a tots els modes de pràctica) */
export function FiltreTipus({ compacte }: { compacte?: boolean }) {
  const { filtre } = useEstat();
  const els = useElements();
  const compte = (t: Tipus) => els.filter((e) => e.tipus === t).length;
  const toggle = (t: Tipus) => setFiltre(filtre.includes(t) ? filtre.filter((x) => x !== t) : [...filtre, t]);
  return (
    <div className={`filtre ${compacte ? 'compacte' : ''}`} role="group" aria-label="Tipus d'elements">
      <button type="button" className={`xip ${filtre.length === 0 ? 'actiu' : ''}`} onClick={() => setFiltre([])}>
        Tots ({els.length})
      </button>
      {ORDRE_TIPUS.map((t) => (
        <button
          type="button"
          key={t}
          className={`xip ${filtre.includes(t) ? 'actiu' : ''}`}
          style={{ ['--xip' as string]: TIPUS_INFO[t].color }}
          onClick={() => toggle(t)}
        >
          <span aria-hidden>{TIPUS_INFO[t].icona}</span> {TIPUS_INFO[t].plural} ({compte(t)})
        </button>
      ))}
    </div>
  );
}

/** Disposició estàndard d'un mode: mapa a l'esquerra, panell a la dreta (apilat al mòbil) */
export function ModeLayout({ mapa, panell, titol, subtitol }: { mapa: ReactNode; panell: ReactNode; titol: string; subtitol?: string }) {
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>{titol}</h2>
        {subtitol && <p className="subtitol">{subtitol}</p>}
      </div>
      <div className="mode-cos">
        <div className="mode-mapa">{mapa}</div>
        <div className="mode-panell">{panell}</div>
      </div>
    </div>
  );
}

/** Toast de punts / feedback animat */
export function Feedback({ estat, text, punts, clau }: { estat: 'ok' | 'ko' | 'avis'; text: ReactNode; punts?: number; clau: string | number }) {
  return (
    <div key={clau} className={`feedback feedback-${estat}`} role="status" aria-live="polite">
      <span className="feedback-icona" aria-hidden>
        {estat === 'ok' ? '✓' : estat === 'ko' ? '✗' : '!'}
      </span>
      <div className="feedback-text">{text}</div>
      {!!punts && <span className="feedback-punts">+{punts}</span>}
    </div>
  );
}

/** Botons d'opcions (tipus test), amb dreceres de teclat 1–4 */
export function Opcions({
  opcions,
  correcta,
  triada,
  onTria,
  amagaCorreccio,
}: {
  opcions: string[];
  correcta: number;
  triada: number | null;
  onTria: (i: number) => void;
  amagaCorreccio?: boolean;
}) {
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      if (triada !== null) return;
      const tag = (ev.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const n = Number(ev.key);
      if (n >= 1 && n <= opcions.length) onTria(n - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [triada, opcions.length, onTria]);
  return (
    <div className="opcions">
      {opcions.map((o, i) => {
        let cls = 'opcio';
        if (triada !== null) {
          if (amagaCorreccio) cls += i === triada ? ' triada' : '';
          else if (i === correcta) cls += ' correcta';
          else if (i === triada) cls += ' incorrecta';
          else cls += ' apagada';
        }
        return (
          <button type="button" key={o + i} className={cls} disabled={triada !== null} onClick={() => onTria(i)}>
            <span className="opcio-num">{i + 1}</span>
            <span>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

const ETIQUETA_PARAULA: Record<EstatParaula, string> = {
  ok: 'correcta',
  accent: 'falta l\'accent',
  gairebe: 'mal escrita',
  falta: 'no hi és',
  sobra: 'sobra',
  opcional: 'article (opcional)',
};

/** Mostra el diagnòstic paraula per paraula */
export function DiagnosticParaules({ paraules }: { paraules: { text: string; estat: EstatParaula }[] }) {
  return (
    <div className="paraules">
      {paraules.map((p, i) => (
        <span key={i} className={`paraula paraula-${p.estat}`} title={ETIQUETA_PARAULA[p.estat]}>
          {p.text}
          <small>{ETIQUETA_PARAULA[p.estat]}</small>
        </span>
      ))}
    </div>
  );
}

export function TipusBadge({ e }: { e: Element }) {
  const info = TIPUS_INFO[e.tipus];
  return (
    <span className="badge" style={{ ['--xip' as string]: info.color }}>
      {info.icona} {info.nom}
    </span>
  );
}

export function BarraProgres({ valor, max, etiqueta }: { valor: number; max: number; etiqueta?: string }) {
  const pct = max ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
      <div className="barra-ple" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Missatge quan el filtre deixa massa pocs elements */
export function SensElements() {
  return <div className="buit">No hi ha prou elements amb aquest filtre. Tria més tipus d'elements.</div>;
}

export function useTecla(tecla: string, fn: () => void, actiu = true) {
  useEffect(() => {
    if (!actiu) return;
    const h = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName;
      // si el focus és en un control, el control ja gestiona Enter/Espai
      if ((tecla === 'Enter' || tecla === ' ') && ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(tag)) return;
      if ((ev.target as HTMLElement)?.getAttribute?.('role') === 'button' && (tecla === 'Enter' || tecla === ' ')) return;
      if (ev.key === tecla) {
        ev.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [tecla, fn, actiu]);
}

export function useAnimacio(): [string, (c: 'ok' | 'ko') => void] {
  const [cls, setCls] = useState('');
  const dispara = (c: 'ok' | 'ko') => {
    setCls('');
    requestAnimationFrame(() => setCls(c === 'ok' ? 'anim-ok' : 'anim-ko'));
  };
  return [cls, dispara];
}
