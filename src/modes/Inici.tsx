import { useState } from 'react';
import { BarraProgres, TipusBadge } from '../components/ui';
import { ORDRE_TIPUS, TIPUS_INFO } from '../data/types';
import { esApres, mesDificils, reiniciaProgres, useElements, useEstat } from '../lib/store';
import { MODES, formatTemps } from './modes';

export function Inici({ anar, segonsSessio }: { anar: (m: string) => void; segonsSessio: number }) {
  const estat = useEstat();
  const els = useElements();
  const total = els.length;
  const apresos = els.filter((e) => esApres(e.id, estat)).length;
  const vistos = els.filter((e) => estat.prog[e.id]).length;
  const pct = total ? Math.round((apresos / total) * 100) : 0;
  const dificils = mesDificils(estat, 6);
  const ultim = MODES.find((m) => m.id === estat.ultimMode);

  const [confirmaReinici, setConfirmaReinici] = useState(false);

  return (
    <div className="inici">
      <section className="hero">
        <div>
          <h1>Mapa físic de Catalunya</h1>
          <p>Aprèn tots els noms del mapa de l'examen jugant: localitza, situa, escriu i repassa fins que els sàpigues sense ajuda.</p>
          <div className="fila-botons">
            {ultim && ultim.id !== 'inici' ? (
              <button type="button" className="boto primari gran" onClick={() => anar(ultim.id)}>
                ▶ Continua: {ultim.nom}
              </button>
            ) : (
              <button type="button" className="boto primari gran" onClick={() => anar('targetes')}>
                ▶ Comença amb les targetes
              </button>
            )}
            <button type="button" className="boto gran" onClick={() => anar('examen')}>
              🎓 Repte d'examen
            </button>
          </div>
        </div>
        <div className="anell" style={{ ['--pct' as string]: pct }} aria-label={`${pct}% après`}>
          <div>
            <strong>{pct}%</strong>
            <span>après</span>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{total}</span>
          <span className="stat-txt">noms per aprendre</span>
        </div>
        <div className="stat ok">
          <span className="stat-num">{apresos}</span>
          <span className="stat-txt">ja els domines</span>
        </div>
        <div className="stat">
          <span className="stat-num">{total - apresos}</span>
          <span className="stat-txt">pendents ({vistos - apresos > 0 ? `${vistos - apresos} en curs` : 'cap en curs'})</span>
        </div>
        <div className="stat">
          <span className="stat-num">{estat.millorExamen?.toLocaleString('ca-ES') ?? '–'}</span>
          <span className="stat-txt">millor nota d'examen</span>
        </div>
        <div className="stat">
          <span className="stat-num">{estat.punts}</span>
          <span className="stat-txt">punts · millor ratxa {estat.millorRatxa}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{formatTemps(segonsSessio)}</span>
          <span className="stat-txt">temps d'aquesta sessió · total {formatTemps(estat.tempsTotal)}</span>
        </div>
      </section>

      <section className="graella-modes">
        {MODES.filter((m) => m.joc).map((m) => (
          <button type="button" key={m.id} className="carta-mode" onClick={() => anar(m.id)}>
            <span className="carta-icona">{m.icona}</span>
            <strong>{m.nom}</strong>
            <span>{m.desc}</span>
          </button>
        ))}
      </section>

      <div className="dues-col">
        <section className="caixa">
          <h3>Progrés per tipus</h3>
          {ORDRE_TIPUS.map((t) => {
            const g = els.filter((e) => e.tipus === t);
            const a = g.filter((e) => esApres(e.id, estat)).length;
            return (
              <div key={t} className="progres-tipus">
                <span>
                  {TIPUS_INFO[t].icona} {TIPUS_INFO[t].plural}
                </span>
                <BarraProgres valor={a} max={g.length} etiqueta={TIPUS_INFO[t].plural} />
                <small>
                  {a}/{g.length}
                </small>
              </div>
            );
          })}
        </section>
        <section className="caixa">
          <h3>Els que et costen més</h3>
          {dificils.length ? (
            <>
              <ul className="llista-dificils compacta">
                {dificils.map(({ e, p }) => (
                  <li key={e.id}>
                    <span className="fallada-nom">{e.nom}</span>
                    <TipusBadge e={e} />
                    <span className="errors">✗ {p.ko}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="boto primari" onClick={() => anar('repas')}>
                🔁 Repassa'ls ara
              </button>
            </>
          ) : (
            <p className="ajuda">Quan fallis algun nom, apareixerà aquí i sortirà més sovint als jocs.</p>
          )}
        </section>
      </div>

      <section className="caixa peu-inici">
        <p className="ajuda">
          El progrés es guarda automàticament en aquest navegador (sense comptes). Un nom es considera après quan l'encertes diverses vegades seguides.
        </p>
        <div className="fila-botons">
          <button type="button" className="boto petit" onClick={() => anar('llista')}>
            📋 Llista de noms i dubtes
          </button>
          {confirmaReinici ? (
            <>
              <span className="ajuda">Segur? S'esborraran el progrés, els punts i els exàmens (les correccions d'ubicació es mantenen).</span>
              <button
                type="button"
                className="boto petit perill"
                onClick={() => {
                  reiniciaProgres();
                  setConfirmaReinici(false);
                }}
              >
                Sí, esborra-ho
              </button>
              <button type="button" className="boto petit" onClick={() => setConfirmaReinici(false)}>
                Cancel·la
              </button>
            </>
          ) : (
            <button type="button" className="boto petit perill" onClick={() => setConfirmaReinici(true)}>
              🗑️ Reinicia el progrés
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
