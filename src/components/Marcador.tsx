import { useEstat } from '../lib/store';

/** Capçalera amb el marcador de la sessió dins d'un mode */
export function MarcadorSessio({ encerts, total, extra }: { encerts: number; total: number; extra?: string }) {
  const { ratxa } = useEstat();
  return (
    <div className="marcador-sessio">
      <span title="Encerts en aquesta sessió">
        ✅ {encerts}/{total}
      </span>
      <span title="Ratxa de respostes correctes" className={ratxa >= 3 ? 'foc' : ''}>
        🔥 {ratxa}
      </span>
      {extra && <span>{extra}</span>}
    </div>
  );
}
