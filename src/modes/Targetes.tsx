import { useEffect, useMemo, useState } from 'react';
import { Diana, Etiqueta, Zona } from '../components/Marcadors';
import { MapView } from '../components/MapView';
import { FiltreTipus, SensElements, TipusBadge, useTecla } from '../components/ui';
import type { Element } from '../data/types';
import { barreja } from '../lib/random';
import { esApres, marcaTargeta, pes, useElements, useEstat } from '../lib/store';

/** E. Targetes de memorització: davant i darrere, «Me'l sé» / «He de repassar-lo». */
export function Targetes() {
  const estat = useEstat();
  const els = useElements();
  const [sentit, setSentit] = useState<'ubicacio' | 'nom'>('ubicacio');
  const [nomesPendents, setNomesPendents] = useState(false);
  const [girada, setGirada] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sessio, setSessio] = useState({ se: 0, repassar: 0 });

  // Baralla: es prioritzen els elements que costen més. Es refà quan canvia el filtre.
  const clauFiltre = estat.filtre.join('|') + nomesPendents;
  const baralla = useMemo<Element[]>(() => {
    let c = estat.filtre.length ? els.filter((e) => estat.filtre.includes(e.tipus)) : els;
    if (nomesPendents) c = c.filter((e) => !esApres(e.id, estat));
    return barreja(c).sort((a, b) => pes(b.id) - pes(a.id) + (Math.random() - 0.5) * 2);
  }, [clauFiltre]);

  useEffect(() => {
    setIdx(0);
    setGirada(false);
  }, [clauFiltre]);

  const e = baralla.length ? baralla[idx % baralla.length] : null;
  const prog = e ? estat.prog[e.id] : undefined;

  const respon = (se: boolean) => {
    if (!e) return;
    marcaTargeta(e.id, se);
    setSessio((s) => (se ? { ...s, se: s.se + 1 } : { ...s, repassar: s.repassar + 1 }));
    setGirada(false);
    setIdx((i) => i + 1);
  };

  useTecla(' ', () => setGirada((g) => !g), !!e);
  useTecla('ArrowRight', () => girada && respon(true), !!e);
  useTecla('ArrowLeft', () => girada && respon(false), !!e);

  const mostraUbicacio = sentit === 'ubicacio' || girada;

  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🃏 Targetes de memorització</h2>
        <p className="subtitol">Mira la targeta, intenta recordar-la i gira-la. Després marca si te la saps.</p>
        <FiltreTipus compacte />
      </div>
      {!e ? (
        <SensElements />
      ) : (
        <div className="mode-cos">
          <div className="mode-mapa">
            <MapView capa={girada ? 'etiquetes' : 'net'} permetCanviCapa={girada} enfoca={mostraUbicacio ? e.p : null}>
              {(k) =>
                mostraUbicacio && (
                  <>
                    {girada ? <Zona e={e} k={k} estat="info" /> : <Diana p={e.p} k={k} />}
                    {girada && <Etiqueta p={e.p} text={e.nom} k={k} />}
                  </>
                )
              }
            </MapView>
          </div>
          <div className="mode-panell">
            <div className="marcador-sessio">
              <span>
                Targeta {(idx % baralla.length) + 1}/{baralla.length}
              </span>
              <span>✅ {sessio.se}</span>
              <span>🔁 {sessio.repassar}</span>
            </div>
            <div className="segmentat">
              <button type="button" className={sentit === 'ubicacio' ? 'actiu' : ''} onClick={() => setSentit('ubicacio')}>
                Ubicació → nom
              </button>
              <button type="button" className={sentit === 'nom' ? 'actiu' : ''} onClick={() => setSentit('nom')}>
                Nom → ubicació
              </button>
            </div>
            <label className="check">
              <input type="checkbox" checked={nomesPendents} onChange={(ev) => setNomesPendents(ev.target.checked)} /> Només els que encara no domino
            </label>

            <div
              role="button"
              tabIndex={0}
              className={`flashcard ${girada ? 'girada' : ''}`}
              onClick={() => setGirada((g) => !g)}
              onKeyDown={(ev) => {
                if (ev.key === ' ' || ev.key === 'Enter') {
                  ev.preventDefault();
                  setGirada((g) => !g);
                }
              }}
              aria-label="Gira la targeta"
            >
              <div className="flashcard-inner">
                <div className="flashcard-cara davant">
                  <TipusBadge e={e} />
                  {sentit === 'nom' ? (
                    <p className="nom-gran">{e.nom}</p>
                  ) : (
                    <p className="enunciat">Quin element és el que assenyala el mapa?</p>
                  )}
                  <span className="gira">Toca per girar (o prem espai)</span>
                </div>
                <div className="flashcard-cara darrere">
                  <TipusBadge e={e} />
                  <p className="nom-gran">{e.nom}</p>
                  {e.alMapa && <p className="dada">Al mapa: «{e.alMapa}»</p>}
                  {e.alt && <p className="dada">Altitud: {e.alt.toLocaleString('ca-ES')} m</p>}
                  {e.unitat && <p className="dada">Unitat de relleu: {e.unitat}</p>}
                  {e.afluentDe && <p className="dada">Afluent de: {e.afluentDe}</p>}
                  {e.mar && <p className="dada">Desemboca al: {e.mar === 'Atlàntic' ? 'oceà Atlàntic' : 'mar Mediterrani'}</p>}
                  {e.pista && <p className="pista">💡 {e.pista}</p>}
                </div>
              </div>
            </div>

            {girada ? (
              <div className="fila-botons dos">
                <button type="button" className="boto repassar gran" onClick={() => respon(false)}>
                  🔁 He de repassar-lo <kbd>←</kbd>
                </button>
                <button type="button" className="boto se gran" onClick={() => respon(true)}>
                  ✅ Me'l sé <kbd>→</kbd>
                </button>
              </div>
            ) : (
              <button type="button" className="boto primari gran" onClick={() => setGirada(true)}>
                Gira la targeta <kbd>Espai</kbd>
              </button>
            )}
            {prog?.targeta && (
              <p className="ajuda">
                L'última vegada el vas marcar com a «{prog.targeta === 'se' ? "me'l sé" : 'he de repassar-lo'}».
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
