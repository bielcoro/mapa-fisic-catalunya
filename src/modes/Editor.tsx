import { useMemo, useState } from 'react';
import { Etiqueta, PuntElement, Zona } from '../components/Marcadors';
import { MapView } from '../components/MapView';
import { TipusBadge } from '../components/ui';
import { PER_ID } from '../data/elements';
import { ORDRE_TIPUS, PX_PER_KM, TIPUS_INFO, type Punt } from '../data/types';
import { radi } from '../lib/geo';
import { importaUbicacions, setUbicacio, useElements, useEstat } from '../lib/store';
import { clau } from '../lib/text';

/**
 * Editor d'ubicacions: permet corregir o marcar manualment on és cada element.
 * Les correccions es guarden al navegador i es poden exportar/importar en JSON.
 */
export function Editor() {
  const estat = useEstat();
  const els = useElements();
  const [sel, setSel] = useState<string>(els[0].id);
  const [accio, setAccio] = useState<'principal' | 'extra'>('principal');
  const [cerca, setCerca] = useState('');
  const [importText, setImportText] = useState('');
  const [missatge, setMissatge] = useState('');

  const e = els.find((x) => x.id === sel)!;
  const original = PER_ID[sel];
  const modificat = !!estat.ubicacions[sel];

  const trobats = useMemo(() => {
    const q = clau(cerca);
    return q ? els.filter((x) => clau(x.nom).includes(q)) : els;
  }, [cerca, els]);

  const arrodoneix = (p: Punt): Punt => [Math.round(p[0]), Math.round(p[1])];

  const onClic = (p: Punt) => {
    const pt = arrodoneix(p);
    const actual = estat.ubicacions[sel] ?? { p: e.p, extra: e.extra, r: e.r };
    if (accio === 'principal') setUbicacio(sel, { ...actual, p: pt });
    else setUbicacio(sel, { ...actual, extra: [...(actual.extra ?? e.extra ?? []), pt] });
  };

  const json = JSON.stringify(estat.ubicacions, null, 2);

  const exporta = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ubicacions-mapa-catalunya.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setMissatge('Copiat al porta-retalls ✔');
    } catch {
      setMissatge('No s\'ha pogut copiar. Fes servir «Descarrega».');
    }
  };

  const importa = () => {
    try {
      const n = importaUbicacions(importText);
      setMissatge(`${n} ubicacions importades ✔`);
      setImportText('');
    } catch {
      setMissatge('El text no és un JSON vàlid.');
    }
  };

  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🛠️ Editor d'ubicacions</h2>
        <p className="subtitol">
          Si algun element no està ben situat, tria'l i fes clic al mapa on hauria de ser. Els canvis s'apliquen a tots els jocs i es guarden en
          aquest navegador.
        </p>
      </div>
      <div className="mode-cos">
        <div className="mode-mapa">
          <MapView capa="etiquetes" onClic={onClic} enfoca={e.p} ajuda={accio === 'principal' ? 'Clic = nou punt principal' : 'Clic = afegeix un punt vàlid'}>
            {(k) => (
              <>
                {els
                  .filter((x) => x.id !== sel)
                  .map((x) => (
                    <PuntElement key={x.id} e={x} k={k} />
                  ))}
                <Zona e={e} k={k} estat="ok" />
                {modificat && (
                  <circle cx={original.p[0]} cy={original.p[1]} r={6 * k} fill="none" stroke="var(--ko)" strokeWidth={2 * k} strokeDasharray={`${3 * k}`} />
                )}
                <Etiqueta p={e.p} text={e.nom} k={k} />
              </>
            )}
          </MapView>
        </div>
        <div className="mode-panell">
          <div className="fitxa">
            <TipusBadge e={e} />
            <h3 className="nom-gran">{e.nom}</h3>
            <p className="dada petita">
              Punt principal: ({e.p[0]}, {e.p[1]}) {modificat && <em>· modificat (el cercle vermell és l'original)</em>}
            </p>
            {e.extra?.length ? <p className="dada petita">Punts vàlids addicionals: {e.extra.length}</p> : null}
            <div className="segmentat">
              <button type="button" className={accio === 'principal' ? 'actiu' : ''} onClick={() => setAccio('principal')}>
                Mou el punt principal
              </button>
              <button type="button" className={accio === 'extra' ? 'actiu' : ''} onClick={() => setAccio('extra')}>
                Afegeix punt vàlid
              </button>
            </div>
            <label className="rang">
              Marge acceptat: {radi(e)} px ≈ {Math.round(radi(e) / PX_PER_KM)} km
              <input
                type="range"
                min={10}
                max={200}
                value={radi(e)}
                onChange={(ev) => setUbicacio(sel, { ...(estat.ubicacions[sel] ?? { p: e.p, extra: e.extra }), r: Number(ev.target.value) })}
              />
            </label>
            <div className="fila-botons">
              {e.extra?.length ? (
                <button type="button" className="boto petit" onClick={() => setUbicacio(sel, { ...(estat.ubicacions[sel] ?? { p: e.p }), extra: [] })}>
                  Treu els punts addicionals
                </button>
              ) : null}
              {modificat && (
                <button type="button" className="boto petit" onClick={() => setUbicacio(sel, null)}>
                  ↺ Restaura l'original
                </button>
              )}
            </div>
          </div>

          <input type="search" className="cerca" placeholder="🔍 Cerca un element..." value={cerca} onChange={(ev) => setCerca(ev.target.value)} />
          <select className="selector" size={8} value={sel} onChange={(ev) => setSel(ev.target.value)} aria-label="Element a editar">
            {ORDRE_TIPUS.map((t) => {
              const grup = trobats.filter((x) => x.tipus === t);
              return grup.length ? (
                <optgroup key={t} label={TIPUS_INFO[t].plural}>
                  {grup.map((x) => (
                    <option key={x.id} value={x.id}>
                      {estat.ubicacions[x.id] ? '✎ ' : ''}
                      {x.nom}
                    </option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>

          <details className="caixa">
            <summary>Exporta / importa correccions ({Object.keys(estat.ubicacions).length})</summary>
            <p className="ajuda">Desa les correccions en un fitxer per fer-ne còpia o passar-les a un altre navegador.</p>
            <div className="fila-botons">
              <button type="button" className="boto petit" onClick={exporta} disabled={!Object.keys(estat.ubicacions).length}>
                ⬇️ Descarrega JSON
              </button>
              <button type="button" className="boto petit" onClick={copia} disabled={!Object.keys(estat.ubicacions).length}>
                📋 Copia
              </button>
            </div>
            <textarea value={importText} onChange={(ev) => setImportText(ev.target.value)} placeholder="Enganxa aquí un JSON exportat..." rows={4} />
            <button type="button" className="boto petit" onClick={importa} disabled={!importText.trim()}>
              ⬆️ Importa
            </button>
            {missatge && <p className="ajuda">{missatge}</p>}
          </details>
        </div>
      </div>
    </div>
  );
}
