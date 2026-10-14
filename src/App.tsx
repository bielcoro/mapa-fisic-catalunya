import { useCallback, useEffect, useRef, useState } from 'react';
import { BarraProgres } from './components/ui';
import { esApres, setTema, setUltimMode, sumaTemps, useElements, useEstat } from './lib/store';
import { Editor } from './modes/Editor';
import { Escriu } from './modes/Escriu';
import { Examen } from './modes/Examen';
import { Explora } from './modes/Explora';
import { Inici } from './modes/Inici';
import { Llista } from './modes/Llista';
import { Localitza } from './modes/Localitza';
import { MODES, formatTemps } from './modes/modes';
import { OnEs } from './modes/OnEs';
import { Repas } from './modes/Repas';
import { Targetes } from './modes/Targetes';
import { Test } from './modes/Test';

function modeDelHash() {
  const h = window.location.hash.replace('#', '');
  return MODES.some((m) => m.id === h) ? h : 'inici';
}

export default function App() {
  const estat = useEstat();
  const els = useElements();
  const [mode, setMode] = useState(modeDelHash);
  const [segons, setSegons] = useState(0);
  const pendent = useRef(0);

  // Navegació amb #hash (el botó enrere del navegador funciona)
  useEffect(() => {
    const h = () => setMode(modeDelHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const anar = useCallback((m: string) => {
    window.location.hash = m;
    setMode(m);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (mode !== 'inici' && mode !== 'llista' && mode !== 'editor') setUltimMode(mode);
  }, [mode]);

  // Temps d'estudi: es compta mentre la pestanya és visible
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setSegons((s) => s + 1);
      pendent.current++;
      if (pendent.current >= 15) {
        sumaTemps(pendent.current);
        pendent.current = 0;
      }
    }, 1000);
    const desa = () => {
      if (pendent.current) sumaTemps(pendent.current);
      pendent.current = 0;
    };
    window.addEventListener('pagehide', desa);
    return () => {
      clearInterval(t);
      window.removeEventListener('pagehide', desa);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = estat.tema === 'fosc' ? 'dark' : 'light';
  }, [estat.tema]);

  const apresos = els.filter((e) => esApres(e.id, estat)).length;

  let contingut;
  switch (mode) {
    case 'explora':
      contingut = <Explora />;
      break;
    case 'localitza':
      contingut = <Localitza />;
      break;
    case 'ones':
      contingut = <OnEs />;
      break;
    case 'test':
      contingut = <Test />;
      break;
    case 'escriu':
      contingut = <Escriu />;
      break;
    case 'targetes':
      contingut = <Targetes />;
      break;
    case 'examen':
      contingut = <Examen />;
      break;
    case 'repas':
      contingut = <Repas />;
      break;
    case 'llista':
      contingut = <Llista anar={anar} />;
      break;
    case 'editor':
      contingut = <Editor />;
      break;
    default:
      contingut = <Inici anar={anar} segonsSessio={segons} />;
  }

  return (
    <div className="app">
      <header className="capcalera">
        <button type="button" className="logo" onClick={() => anar('inici')}>
          <span className="logo-icona" aria-hidden>
            ⛰️
          </span>
          <span className="logo-text">
            Mapa físic <b>de Catalunya</b>
          </span>
        </button>
        <div className="capcalera-stats">
          <span className="chip" title="Punts">
            ⭐ {estat.punts}
          </span>
          <span className={`chip ${estat.ratxa >= 3 ? 'foc' : ''}`} title="Ratxa de respostes correctes">
            🔥 {estat.ratxa}
          </span>
          <span className="chip amaga-mobil" title="Temps d'estudi d'aquesta sessió">
            ⏱ {formatTemps(segons)}
          </span>
          <span className="chip progres-chip" title="Noms apresos">
            <span>
              {apresos}/{els.length}
            </span>
            <BarraProgres valor={apresos} max={els.length} etiqueta="Noms apresos" />
          </span>
          <button
            type="button"
            className="chip boto-tema"
            onClick={() => setTema(estat.tema === 'fosc' ? 'clar' : 'fosc')}
            aria-label={estat.tema === 'fosc' ? 'Activa el mode clar' : 'Activa el mode fosc'}
            title="Mode fosc"
          >
            {estat.tema === 'fosc' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <nav className="navegacio" aria-label="Modes">
        {MODES.map((m) => (
          <button type="button" key={m.id} className={mode === m.id ? 'actiu' : ''} onClick={() => anar(m.id)} aria-current={mode === m.id ? 'page' : undefined}>
            <span aria-hidden>{m.icona}</span> {m.curt}
          </button>
        ))}
      </nav>
      <main className="contingut">{contingut}</main>
    </div>
  );
}
