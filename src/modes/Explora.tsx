import { useMemo, useState } from 'react';
import { Etiqueta, PuntElement, Zona } from '../components/Marcadors';
import { MapView } from '../components/MapView';
import { FiltreTipus, TipusBadge } from '../components/ui';
import { ORDRE_TIPUS, PX_PER_KM, TIPUS_INFO, type Punt } from '../data/types';
import { mesProper } from '../lib/geo';
import { esApres, useElements, useEstat } from '../lib/store';
import { clau } from '../lib/text';

/** Mapa d'estudi: tots els elements amb el seu punt; clic per veure'n la informació. */
export function Explora() {
  const estat = useEstat();
  const els = useElements();
  const [sel, setSel] = useState<string | null>(null);
  const [cerca, setCerca] = useState('');
  const [noms, setNoms] = useState(false);

  const visibles = useMemo(
    () => (estat.filtre.length ? els.filter((e) => estat.filtre.includes(e.tipus)) : els),
    [els, estat.filtre],
  );
  const trobats = useMemo(() => {
    const q = clau(cerca);
    return q ? visibles.filter((e) => clau(e.nom).includes(q) || (e.alies ?? []).some((a) => clau(a).includes(q))) : visibles;
  }, [cerca, visibles]);

  const e = sel ? els.find((x) => x.id === sel) ?? null : null;

  const onClic = (p: Punt) => {
    let millor: { id: string; d: number } | null = null;
    for (const x of visibles) {
      const { d } = mesProper(x, p);
      if (!millor || d < millor.d) millor = { id: x.id, d };
    }
    if (millor && millor.d < 45) setSel(millor.id);
  };

  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🗺️ Explora el mapa</h2>
        <p className="subtitol">Mapa original amb tots els elements que has de saber. Toca un punt o cerca un nom per veure'n la informació.</p>
        <FiltreTipus compacte />
      </div>
      <div className="mode-cos">
        <div className="mode-mapa">
          <MapView capa="etiquetes" permetCanviCapa onClic={onClic} enfoca={e?.p ?? null}>
            {(k) => (
              <>
                {visibles.map((x) => (
                  <PuntElement key={x.id} e={x} k={k} actiu={x.id === sel} apres={esApres(x.id, estat)} />
                ))}
                {noms && visibles.map((x) => x.id !== sel && <Etiqueta key={'n' + x.id} p={x.p} text={x.nom} k={k} petita />)}
                {e && <Zona e={e} k={k} estat="info" />}
                {e && <Etiqueta p={e.p} text={e.nom} k={k} />}
              </>
            )}
          </MapView>
        </div>
        <div className="mode-panell">
          {e ? (
            <div className="fitxa">
              <button type="button" className="tanca" onClick={() => setSel(null)} aria-label="Tanca">
                ×
              </button>
              <TipusBadge e={e} />
              <h3 className="nom-gran">{e.nom}</h3>
              {e.alMapa && <p className="dada">Al mapa: «{e.alMapa}»</p>}
              {e.alt && <p className="dada">Altitud: {e.alt.toLocaleString('ca-ES')} m</p>}
              {e.unitat && <p className="dada">Unitat de relleu: {e.unitat}</p>}
              {e.afluentDe && <p className="dada">Afluent de: {e.afluentDe}</p>}
              {e.mar && <p className="dada">Desemboca a: {e.mar === 'Atlàntic' ? "l'oceà Atlàntic" : 'la mar Mediterrània'}</p>}
              {e.pista && <p className="pista">💡 {e.pista}</p>}
              <p className="dada petita">
                Ubicació: {e.precisio === 'exacta' ? 'punt exacte del mapa (▲ o cap)' : 'on hi ha escrit el nom al mapa'} · marge acceptat ≈{' '}
                {Math.round((e.r ?? TIPUS_INFO[e.tipus].radi) / PX_PER_KM)} km
              </p>
              {e.dubte && <p className="avis-dubte">⚠️ {e.dubte}</p>}
              <p className="dada petita">{esApres(e.id, estat) ? '✅ Ja el domines' : '⏳ Encara no el domines'}</p>
            </div>
          ) : (
            <p className="ajuda">Toca un punt del mapa. Els punts verds són els que ja domines.</p>
          )}
          <label className="check">
            <input type="checkbox" checked={noms} onChange={(ev) => setNoms(ev.target.checked)} /> Mostra tots els noms damunt dels punts
          </label>
          <input
            type="search"
            className="cerca"
            placeholder="🔍 Cerca un nom..."
            value={cerca}
            onChange={(ev) => setCerca(ev.target.value)}
            aria-label="Cerca un element"
          />
          <div className="llista-explora">
            {ORDRE_TIPUS.map((t) => {
              const grup = trobats.filter((x) => x.tipus === t);
              if (!grup.length) return null;
              return (
                <details key={t} open={!!cerca || estat.filtre.includes(t)}>
                  <summary>
                    {TIPUS_INFO[t].icona} {TIPUS_INFO[t].plural} <span className="compte">{grup.length}</span>
                  </summary>
                  <ul>
                    {grup.map((x) => (
                      <li key={x.id}>
                        <button type="button" className={x.id === sel ? 'actiu' : ''} onClick={() => setSel(x.id)}>
                          {esApres(x.id, estat) ? '✅' : '·'} {x.nom}
                          {x.alt ? <small> {x.alt.toLocaleString('ca-ES')} m</small> : null}
                          {x.dubte ? <small title={x.dubte}> ⚠️</small> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
