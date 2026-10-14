import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { MAP_H, MAP_W, type Punt } from '../data/types';

/*
 * Mapa interactiu basat en la imatge original.
 * - La imatge es dibuixa dins d'un <svg> amb viewBox en píxels de la imatge (1200×1600),
 *   de manera que totes les coordenades són relatives a la imatge i funcionen a qualsevol mida.
 * - Zoom amb roda, botons o pessic; desplaçament arrossegant.
 * - Capa «net»: versió del mapa sense etiquetes (generada amb scripts/generar_mapa_sense_etiquetes.py).
 */

export type Capa = 'etiquetes' | 'net';

interface VB {
  x: number;
  y: number;
  w: number;
  h: number;
}

const VB_INICIAL: VB = { x: 0, y: 160, w: MAP_W, h: 1240 };
const MIN_W = 110;
const MAX_W = 1500;

const BASE = import.meta.env.BASE_URL;
export const SRC_CAPA: Record<Capa, string> = {
  etiquetes: `${BASE}mapa.jpg`,
  net: `${BASE}mapa-sense-etiquetes.jpg`,
};

interface Props {
  capa?: Capa;
  /** Permet a l'usuari mostrar/amagar les etiquetes */
  permetCanviCapa?: boolean;
  onClic?: (p: Punt) => void;
  /** Capes superposades. Rep k = píxels d'imatge per píxel de pantalla (per mantenir mides constants). */
  children?: (k: number) => ReactNode;
  /** Si el punt queda fora de la vista, s'hi centra */
  enfoca?: Punt | null;
  /** Amplada de la vista (px d'imatge) quan s'enfoca. Si no s'indica, es manté el zoom. */
  zoomEnfoc?: number;
  className?: string;
  ajuda?: string;
}

export function MapView({ capa = 'etiquetes', permetCanviCapa, onClic, children, enfoca, zoomEnfoc, className, ajuda }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vb, setVbState] = useState<VB>(VB_INICIAL);
  const vbRef = useRef(vb);
  const [mida, setMida] = useState({ w: 600, h: 700 });
  const [capaUsuari, setCapaUsuari] = useState<Capa | null>(null);
  const capaActiva = permetCanviCapa && capaUsuari ? capaUsuari : capa;

  const esInicial = useRef(true);

  const setVb = useCallback((v: VB, usuari = true) => {
    if (usuari) esInicial.current = false;
    const w = Math.min(MAX_W, Math.max(MIN_W, v.w));
    const h = (v.h / v.w) * w;
    const x = Math.min(MAP_W - w * 0.3, Math.max(-w * 0.7, v.x));
    const y = Math.min(MAP_H - h * 0.3, Math.max(-h * 0.7, v.y));
    const nou = { x, y, w, h };
    vbRef.current = nou;
    setVbState(nou);
  }, []);

  // Mida del contenidor
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      setMida({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Vista inicial: tot Catalunya visible, amb la proporció del contenidor */
  const reinicia = useCallback(() => {
    const aspect = mida.h / mida.w;
    const w = Math.min(MAX_W, Math.max(VB_INICIAL.w, VB_INICIAL.h / aspect));
    const h = w * aspect;
    esInicial.current = true;
    setVb({ x: MAP_W / 2 - w / 2, y: VB_INICIAL.y + VB_INICIAL.h / 2 - h / 2, w, h }, false);
  }, [mida, setVb]);

  useEffect(() => {
    if (esInicial.current) {
      reinicia();
      return;
    }
    // es manté el zoom i el centre; s'adapta l'alçada a la nova proporció
    const v = vbRef.current;
    const cy = v.y + v.h / 2;
    const h = v.w * (mida.h / mida.w);
    setVb({ x: v.x, y: cy - h / 2, w: v.w, h }, false);
  }, [mida, reinicia, setVb]);

  // Precàrrega de les dues capes
  useEffect(() => {
    for (const src of Object.values(SRC_CAPA)) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  const k = Math.max(vb.w / mida.w, vb.h / mida.h);

  const aCoords = useCallback((clientX: number, clientY: number): Punt => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const r = pt.matrixTransform(m.inverse());
    return [r.x, r.y];
  }, []);

  const zoomA = useCallback(
    (factor: number, centre?: Punt) => {
      const v = vbRef.current;
      const c = centre ?? [v.x + v.w / 2, v.y + v.h / 2];
      const w = Math.min(MAX_W, Math.max(MIN_W, v.w * factor));
      const f = w / v.w;
      setVb({ x: c[0] - (c[0] - v.x) * f, y: c[1] - (c[1] - v.y) * f, w, h: v.h * f });
    },
    [setVb],
  );


  // Roda del ratolí (listener no passiu per poder fer preventDefault)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const factor = Math.pow(1.0018, ev.deltaY * (ev.deltaMode === 1 ? 30 : 1));
      zoomA(factor, aCoords(ev.clientX, ev.clientY));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomA, aCoords]);

  // Enfocament automàtic
  const enfocaKey = enfoca ? `${enfoca[0]},${enfoca[1]}` : '';
  useEffect(() => {
    if (!enfoca) return;
    const v = vbRef.current;
    const marge = 0.12;
    const dins =
      enfoca[0] > v.x + v.w * marge &&
      enfoca[0] < v.x + v.w * (1 - marge) &&
      enfoca[1] > v.y + v.h * marge &&
      enfoca[1] < v.y + v.h * (1 - marge);
    if (dins && !zoomEnfoc) return;
    const w = zoomEnfoc ?? v.w;
    const h = (v.h / v.w) * w;
    setVb({ x: enfoca[0] - w / 2, y: enfoca[1] - h / 2, w, h });
  }, [enfocaKey, zoomEnfoc]);

  // Arrossegar i pessic
  const punters = useRef(new Map<number, { x: number; y: number }>());
  const inici = useRef<{ x: number; y: number; mogut: boolean; multi: boolean } | null>(null);
  const pessic = useRef<{ d: number } | null>(null);

  const onPointerDown = (ev: React.PointerEvent) => {
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    punters.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punters.current.size === 1) {
      inici.current = { x: ev.clientX, y: ev.clientY, mogut: false, multi: false };
    } else if (punters.current.size === 2) {
      const [a, b] = [...punters.current.values()];
      pessic.current = { d: Math.hypot(a.x - b.x, a.y - b.y) };
      if (inici.current) inici.current.multi = true;
    }
  };

  const onPointerMove = (ev: React.PointerEvent) => {
    const prev = punters.current.get(ev.pointerId);
    if (!prev) return;
    const cur = { x: ev.clientX, y: ev.clientY };
    punters.current.set(ev.pointerId, cur);
    if (punters.current.size === 2 && pessic.current) {
      const [a, b] = [...punters.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0 && pessic.current.d > 0) {
        zoomA(pessic.current.d / d, aCoords((a.x + b.x) / 2, (a.y + b.y) / 2));
        pessic.current.d = d;
      }
      return;
    }
    if (inici.current && Math.hypot(cur.x - inici.current.x, cur.y - inici.current.y) > 6) inici.current.mogut = true;
    if (inici.current?.mogut) {
      const v = vbRef.current;
      const kk = Math.max(v.w / mida.w, v.h / mida.h);
      setVb({ ...v, x: v.x - (cur.x - prev.x) * kk, y: v.y - (cur.y - prev.y) * kk });
    }
  };

  const onPointerUp = (ev: React.PointerEvent) => {
    const eraUnic = punters.current.size === 1;
    punters.current.delete(ev.pointerId);
    if (punters.current.size < 2) pessic.current = null;
    if (eraUnic && inici.current && !inici.current.mogut && !inici.current.multi && onClic) {
      onClic(aCoords(ev.clientX, ev.clientY));
    }
    if (punters.current.size === 0) inici.current = null;
  };

  return (
    <div className={`mapa ${className ?? ''}`} ref={wrapRef}>
      <svg
        ref={svgRef}
        className={`mapa-svg ${onClic ? 'clicable' : ''}`}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Mapa físic de Catalunya"
      >
        <rect x={-2000} y={-2000} width={5200} height={5600} className="mapa-fons" />
        <image href={SRC_CAPA[capaActiva]} x={0} y={0} width={MAP_W} height={MAP_H} />
        {children?.(k)}
      </svg>
      <div className="mapa-controls">
        <button type="button" onClick={() => zoomA(1 / 1.5)} aria-label="Amplia" title="Amplia">
          +
        </button>
        <button type="button" onClick={() => zoomA(1.5)} aria-label="Redueix" title="Redueix">
          −
        </button>
        <button type="button" onClick={reinicia} aria-label="Vista inicial" title="Vista inicial">
          ⟲
        </button>
      </div>
      {permetCanviCapa && (
        <button
          type="button"
          className="mapa-capa"
          onClick={() => setCapaUsuari(capaActiva === 'etiquetes' ? 'net' : 'etiquetes')}
        >
          {capaActiva === 'etiquetes' ? '🙈 Amaga els noms' : '👀 Mostra els noms'}
        </button>
      )}
      {ajuda && <div className="mapa-ajuda">{ajuda}</div>}
    </div>
  );
}
