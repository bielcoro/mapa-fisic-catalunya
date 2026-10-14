import { MarcadorSessio } from '../components/Marcador';
import { PreguntaEscriu } from '../components/Preguntes';
import { FiltreTipus, SensElements } from '../components/ui';
import { usePractica } from './usePractica';

/** D. Escriu el nom correcte. */
export function Escriu() {
  const { candidats, actual, num, stats, seguent, resposta } = usePractica();
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>✍️ Escriu el nom correcte</h2>
        <p className="subtitol">
          S'accepten respostes sense accents, en majúscules o minúscules i sense l'article (el, la, l'...). Et marcarem les paraules mal escrites.
        </p>
        <FiltreTipus compacte />
      </div>
      {!actual || candidats.length < 1 ? (
        <SensElements />
      ) : (
        <PreguntaEscriu
          key={num}
          e={actual}
          capcalera={<MarcadorSessio encerts={stats.encerts} total={stats.total} />}
          onResposta={(ok) => resposta(ok)}
          onSeguent={seguent}
        />
      )}
    </div>
  );
}
