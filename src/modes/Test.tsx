import { useMemo } from 'react';
import { MarcadorSessio } from '../components/Marcador';
import { PreguntaOpcions } from '../components/Preguntes';
import { FiltreTipus, SensElements } from '../components/ui';
import { generaPregunta } from '../lib/preguntes';
import { usePractica } from './usePractica';

/** C. Preguntes tipus test amb quatre respostes. */
export function Test() {
  const { candidats, actual, num, stats, seguent, resposta } = usePractica();
  const pregunta = useMemo(() => (candidats.length >= 4 && actual ? generaPregunta(candidats) : null), [num]);
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>❓ Preguntes tipus test</h2>
        <p className="subtitol">Quatre opcions, una de correcta. Pots respondre amb les tecles 1–4.</p>
        <FiltreTipus compacte />
      </div>
      {!pregunta ? (
        <SensElements />
      ) : (
        <PreguntaOpcions
          key={num}
          p={pregunta}
          capcalera={<MarcadorSessio encerts={stats.encerts} total={stats.total} />}
          onResposta={(ok) => resposta(ok, pregunta.elementId)}
          onSeguent={seguent}
        />
      )}
    </div>
  );
}
