import { useMemo, useState } from 'react';
import { MarcadorSessio } from '../components/Marcador';
import { PreguntaClic, PreguntaEscriu, PreguntaOpcions } from '../components/Preguntes';
import { TipusBadge } from '../components/ui';
import { preguntaIdentifica } from '../lib/preguntes';
import { tria } from '../lib/random';
import { dificultat, mesDificils, useEstat } from '../lib/store';
import { usePractica } from './usePractica';

/** G. Repàs d'errors: només els elements fallats, amb prioritat als que es fallen més. */
export function Repas() {
  const estat = useEstat();
  // la llista es fixa en entrar al mode perquè no canviï a mitja sessió
  const [llista] = useState(() => mesDificils(estat, 999).map((x) => x.e));
  const [comencat, setComencat] = useState(false);

  if (!llista.length) {
    return (
      <div className="mode">
        <div className="mode-cap">
          <h2>🔁 Repàs d'errors</h2>
        </div>
        <div className="buit gran">
          <p>🎉 Encara no tens cap error guardat.</p>
          <p>Practica amb els altres modes: els noms que fallis apareixeran aquí i també sortiran més sovint a la resta de jocs.</p>
        </div>
      </div>
    );
  }

  if (!comencat) {
    return (
      <div className="mode">
        <div className="mode-cap">
          <h2>🔁 Repàs d'errors</h2>
          <p className="subtitol">
            Aquests són els noms que més et costen (ordenats de més a menys difícil). El repàs barreja preguntes de localitzar, situar i escriure.
          </p>
        </div>
        <div className="caixa">
          <button type="button" className="boto primari gran" onClick={() => setComencat(true)}>
            Comença el repàs ({llista.length} noms)
          </button>
          <ul className="llista-dificils">
            {llista.map((e) => {
              const p = estat.prog[e.id];
              return (
                <li key={e.id}>
                  <span className="fallada-nom">{e.nom}</span>
                  <TipusBadge e={e} />
                  <span className="errors">
                    ✗ {p?.ko ?? 0} · ✓ {p?.ok ?? 0}
                  </span>
                  <span className="dificultat" style={{ width: `${Math.min(100, dificultat(p) * 10)}%` }} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  return <SessioRepas llista={llista} />;
}

function SessioRepas({ llista }: { llista: ReturnType<typeof mesDificils>[number]['e'][] }) {
  const { actual, num, stats, seguent, resposta } = usePractica(llista);
  const forma = useMemo(() => tria(['clic', 'escriu', 'opcions'] as const), [num]);
  const pregunta = useMemo(() => (actual && llista.length >= 1 ? preguntaIdentifica(actual) : null), [actual, num, llista.length]);
  if (!actual) return null;
  const capcalera = <MarcadorSessio encerts={stats.encerts} total={stats.total} extra={`${llista.length} noms per repassar`} />;
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🔁 Repàs d'errors</h2>
      </div>
      {forma === 'clic' && <PreguntaClic key={num} e={actual} capcalera={capcalera} onResposta={(ok) => resposta(ok)} onSeguent={seguent} />}
      {forma === 'escriu' && <PreguntaEscriu key={num} e={actual} capcalera={capcalera} onResposta={(ok) => resposta(ok)} onSeguent={seguent} />}
      {forma === 'opcions' && pregunta && (
        <PreguntaOpcions key={num} p={pregunta} capcalera={capcalera} onResposta={(ok) => resposta(ok)} onSeguent={seguent} />
      )}
    </div>
  );
}
