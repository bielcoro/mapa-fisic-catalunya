import { TipusBadge } from '../components/ui';
import { ELEMENTS } from '../data/elements';
import { ORDRE_TIPUS, TIPUS_INFO } from '../data/types';
import { esApres, useEstat } from '../lib/store';

/** Llista completa de noms per tipus + llista de dubtes de lectura per revisar. */
export function Llista({ anar }: { anar: (m: string) => void }) {
  const estat = useEstat();
  const dubtes = ELEMENTS.filter((e) => e.dubte);
  const imprimeix = () => window.print();
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>📋 Tots els noms del mapa</h2>
        <p className="subtitol">
          {ELEMENTS.length} noms extrets de la imatge del mapa físic, classificats per tipus. Aquesta és la llista que has de saber.
        </p>
        <div className="fila-botons">
          <button type="button" className="boto petit" onClick={imprimeix}>
            🖨️ Imprimeix la llista
          </button>
          <button type="button" className="boto petit" onClick={() => anar('editor')}>
            🛠️ Corregeix ubicacions
          </button>
        </div>
      </div>

      <section className="caixa dubtes" id="dubtes">
        <h3>⚠️ Dubtes de lectura per revisar ({dubtes.length})</h3>
        <p className="ajuda">
          Aquests noms o xifres no es llegeixen amb total claredat a la foto. Comprova'ls al llibre o al mapa original. Si cal canviar-ne alguna
          ubicació, fes-ho a l'editor.
        </p>
        <ul>
          {dubtes.map((e) => (
            <li key={e.id}>
              <strong>{e.nom}</strong> <TipusBadge e={e} /> — {e.dubte}
            </li>
          ))}
        </ul>
        <p className="ajuda">
          A més, les ubicacions de serres, planes, rius i grans unitats es basen en la posició de l'etiqueta al mapa (els rius i les unitats que
          apareixen en diversos llocs tenen diversos punts vàlids). Els cims es basen en el triangle ▲ del mapa.
        </p>
      </section>

      <div className="graella-llista">
        {ORDRE_TIPUS.map((t) => {
          const grup = ELEMENTS.filter((e) => e.tipus === t);
          return (
            <section key={t} className="caixa">
              <h3 style={{ color: TIPUS_INFO[t].color }}>
                {TIPUS_INFO[t].icona} {TIPUS_INFO[t].plural} <span className="compte">{grup.length}</span>
              </h3>
              <ul className="llista-noms">
                {grup.map((e) => (
                  <li key={e.id} className={esApres(e.id, estat) ? 'apres' : ''}>
                    <span>{e.nom}</span>
                    {e.alMapa && <small className="al-mapa">({e.alMapa})</small>}
                    {e.alt && <small>{e.alt.toLocaleString('ca-ES')} m</small>}
                    {e.dubte && <small title={e.dubte}>⚠️</small>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
