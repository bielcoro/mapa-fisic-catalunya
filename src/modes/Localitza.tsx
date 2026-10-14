import { useMemo, useState } from 'react';
import { MarcadorSessio } from '../components/Marcador';
import { PreguntaEscriu, PreguntaOpcions } from '../components/Preguntes';
import { FiltreTipus, SensElements } from '../components/ui';
import { preguntaIdentifica } from '../lib/preguntes';
import { usePractica } from './usePractica';

/** A. Localitza el nom: el mapa assenyala un element i cal dir quin és. */
export function Localitza() {
  const { candidats, actual, num, stats, seguent, resposta } = usePractica();
  const [forma, setForma] = useState<'opcions' | 'escriure'>('opcions');
  const pregunta = useMemo(() => (actual ? preguntaIdentifica(actual) : null), [actual, num]);

  const capcalera = (
    <>
      <MarcadorSessio encerts={stats.encerts} total={stats.total} />
      <div className="segmentat" role="tablist">
        <button type="button" className={forma === 'opcions' ? 'actiu' : ''} onClick={() => setForma('opcions')}>
          Tria entre opcions
        </button>
        <button type="button" className={forma === 'escriure' ? 'actiu' : ''} onClick={() => setForma('escriure')}>
          Escriu el nom
        </button>
      </div>
    </>
  );

  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>📍 Localitza el nom al mapa</h2>
        <p className="subtitol">El mapa assenyala un element (sense noms). Digues quin és. Si falles, tornarà a sortir més endavant.</p>
        <FiltreTipus compacte />
      </div>
      {candidats.length < 4 || !actual || !pregunta ? (
        <SensElements />
      ) : forma === 'opcions' ? (
        <PreguntaOpcions key={`o${num}`} p={pregunta} capcalera={capcalera} onResposta={(ok) => resposta(ok)} onSeguent={seguent} />
      ) : (
        <PreguntaEscriu key={`e${num}`} e={actual} capcalera={capcalera} onResposta={(ok) => resposta(ok)} onSeguent={seguent} />
      )}
    </div>
  );
}
