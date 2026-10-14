import { MarcadorSessio } from '../components/Marcador';
import { PreguntaClic } from '../components/Preguntes';
import { FiltreTipus, SensElements } from '../components/ui';
import { usePractica } from './usePractica';

/** B. On és aquest element? Cal clicar-ne la ubicació al mapa. */
export function OnEs() {
  const { candidats, actual, num, stats, seguent, resposta } = usePractica();
  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🎯 On és aquest element?</h2>
        <p className="subtitol">Fes clic al mapa on creus que és. Et direm si t'has desviat al nord, al sud, a l'est o a l'oest.</p>
        <FiltreTipus compacte />
      </div>
      {!actual || candidats.length < 1 ? (
        <SensElements />
      ) : (
        <PreguntaClic
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
