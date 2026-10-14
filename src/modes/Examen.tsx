import { useMemo, useRef, useState } from 'react';
import { Etiqueta, Zona } from '../components/Marcadors';
import { MapView } from '../components/MapView';
import { PreguntaClic, PreguntaEscriu, PreguntaOpcions } from '../components/Preguntes';
import { BarraProgres, FiltreTipus, TipusBadge } from '../components/ui';
import { ORDRE_TIPUS, type Element, type Tipus } from '../data/types';
import { generaPregunta, preguntaIdentifica, type PreguntaTest } from '../lib/preguntes';
import { barreja } from '../lib/random';
import { elementPerId, getEstat, registra, registraExamen, useElements, useEstat } from '../lib/store';

type Forma = 'escriu' | 'clic' | 'test';

interface PregExamen {
  forma: Forma;
  elementId: string;
  test?: PreguntaTest;
}

interface RespExamen {
  correcte: boolean;
  resposta: string;
  elementId: string;
}

const NOM_FORMA: Record<Forma, string> = {
  escriu: 'Escriu el nom',
  clic: 'Situa al mapa',
  test: 'Tipus test',
};

/** Tria n elements variats: es van alternant els tipus perquè surtin de tots. */
function triaVariats(els: Element[], n: number): Element[] {
  const grups = new Map<Tipus, Element[]>();
  for (const t of ORDRE_TIPUS) {
    const g = barreja(els.filter((e) => e.tipus === t));
    if (g.length) grups.set(t, g);
  }
  const res: Element[] = [];
  let tipus = barreja([...grups.keys()]);
  while (res.length < n && grups.size) {
    for (const t of tipus) {
      const g = grups.get(t);
      if (!g?.length) {
        grups.delete(t);
        continue;
      }
      // els tipus amb més elements surten més sovint
      const vegades = Math.max(1, Math.round(g.length / 12));
      for (let i = 0; i < vegades && g.length && res.length < n; i++) res.push(g.pop()!);
      if (res.length >= n) break;
    }
    tipus = barreja([...grups.keys()]);
  }
  return barreja(res);
}

function construeix(els: Element[], formes: Forma[]): PregExamen[] {
  const fs = barreja(formes);
  return els.map((e, i) => {
    const forma = fs[i % fs.length];
    if (forma === 'test') {
      const t = Math.random() < 0.6 ? preguntaIdentifica(e) : generaPregunta([e]);
      return { forma, elementId: t.elementId, test: t };
    }
    return { forma, elementId: e.id };
  });
}

export function Examen() {
  const estat = useEstat();
  const els = useElements();
  const [fase, setFase] = useState<'config' | 'fent' | 'resultat'>('config');
  const [num, setNum] = useState(20);
  const [formes, setFormes] = useState<Forma[]>(['escriu', 'clic', 'test']);
  const [preguntes, setPreguntes] = useState<PregExamen[]>([]);
  const [respostes, setRespostes] = useState<RespExamen[]>([]);
  const respostesRef = useRef<RespExamen[]>([]);
  const [idx, setIdx] = useState(0);
  const [inici, setInici] = useState(0);
  const [durada, setDurada] = useState(0);
  const [vista, setVista] = useState<string | null>(null);
  const [confirmaAbandona, setConfirmaAbandona] = useState(false);

  const candidats = estat.filtre.length ? els.filter((e) => estat.filtre.includes(e.tipus)) : els;

  const comenca = (llista: Element[], fsel: Forma[] = formes) => {
    setPreguntes(construeix(llista, fsel.length ? fsel : ['escriu', 'clic', 'test']));
    setRespostes([]);
    respostesRef.current = [];
    setIdx(0);
    setInici(Date.now());
    setVista(null);
    setConfirmaAbandona(false);
    setFase('fent');
  };

  const acaba = (resp: RespExamen[]) => {
    const encerts = resp.filter((r) => r.correcte).length;
    const nota = Math.round((encerts / resp.length) * 100) / 10;
    // el progrés s'actualitza al final, sense punts de joc
    resp.forEach((r) => registra(r.elementId, r.correcte, { puntua: false }));
    registraExamen(
      { data: Date.now(), nota, encerts, total: resp.length },
      resp.filter((r) => !r.correcte).map((r) => r.elementId),
    );
    setDurada(Math.round((Date.now() - inici) / 1000));
    setFase('resultat');
  };

  if (fase === 'config') {
    const fallades = estat.ultimesFallades.map(elementPerId).filter(Boolean) as Element[];
    return (
      <div className="mode">
        <div className="mode-cap">
          <h2>🎓 Repte d'examen</h2>
          <p className="subtitol">Preguntes aleatòries de tots els tipus. Sense pistes i sense correccions fins al final. Nota sobre 10.</p>
        </div>
        <div className="config-examen">
          <section className="caixa">
            <h3>Nombre de preguntes</h3>
            <div className="segmentat">
              {[10, 20, 30, 40].map((n) => (
                <button type="button" key={n} className={num === n ? 'actiu' : ''} onClick={() => setNum(n)}>
                  {n}
                </button>
              ))}
            </div>
            <h3>Tipus de preguntes</h3>
            <div className="filtre">
              {(Object.keys(NOM_FORMA) as Forma[]).map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`xip ${formes.includes(f) ? 'actiu' : ''}`}
                  onClick={() => setFormes(formes.includes(f) ? formes.filter((x) => x !== f) : [...formes, f])}
                >
                  {NOM_FORMA[f]}
                </button>
              ))}
            </div>
            <h3>Elements que entren a l'examen</h3>
            <FiltreTipus />
            <button
              type="button"
              className="boto primari gran"
              disabled={!candidats.length || !formes.length}
              onClick={() => comenca(triaVariats(candidats, Math.min(num, candidats.length)))}
            >
              Comença l'examen ({Math.min(num, candidats.length)} preguntes)
            </button>
            {fallades.length > 0 && (
              <button type="button" className="boto gran" onClick={() => comenca(barreja(fallades))}>
                🔁 Repeteix les {fallades.length} que vas fallar a l'últim examen
              </button>
            )}
          </section>
          <section className="caixa">
            <h3>Historial</h3>
            {estat.millorExamen !== null && (
              <p className="nota-millor">
                Millor nota: <strong>{estat.millorExamen.toLocaleString('ca-ES')}</strong>
              </p>
            )}
            {estat.examens.length === 0 ? (
              <p className="ajuda">Encara no has fet cap examen.</p>
            ) : (
              <ul className="historial">
                {[...estat.examens]
                  .reverse()
                  .slice(0, 8)
                  .map((r) => (
                    <li key={r.data}>
                      <span>{new Date(r.data).toLocaleString('ca-ES', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span className={`nota ${r.nota >= 5 ? 'aprovat' : 'suspes'}`}>{r.nota.toLocaleString('ca-ES')}</span>
                      <span>
                        {r.encerts}/{r.total}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (fase === 'fent') {
    const p = preguntes[idx];
    const e = elementPerId(p.elementId)!;
    const onResposta = (correcte: boolean, resposta: string) => {
      respostesRef.current = [...respostesRef.current, { correcte, resposta, elementId: p.elementId }];
      setRespostes(respostesRef.current);
    };
    const onSeguent = () => {
      if (respostesRef.current.length >= preguntes.length) acaba(respostesRef.current);
      else setIdx(respostesRef.current.length);
    };
    const capcalera = (
      <div className="examen-cap">
        <div className="marcador-sessio">
          <span>
            Pregunta {idx + 1}/{preguntes.length}
          </span>
          <span>{NOM_FORMA[p.forma]}</span>
          {confirmaAbandona ? (
            <span className="confirma-abandona">
              No es guardarà el resultat.
              <button type="button" className="boto petit perill" onClick={() => setFase('config')}>
                Abandona
              </button>
              <button type="button" className="boto petit" onClick={() => setConfirmaAbandona(false)}>
                Continua
              </button>
            </span>
          ) : (
            <button type="button" className="boto petit" onClick={() => setConfirmaAbandona(true)}>
              Abandona
            </button>
          )}
        </div>
        <BarraProgres valor={idx} max={preguntes.length} etiqueta="Progrés de l'examen" />
      </div>
    );
    return (
      <div className="mode">
        <div className="mode-cap">
          <h2>🎓 Examen en curs</h2>
        </div>
        {p.forma === 'escriu' && <PreguntaEscriu key={idx} e={e} examen capcalera={capcalera} onResposta={onResposta} onSeguent={onSeguent} />}
        {p.forma === 'clic' && <PreguntaClic key={idx} e={e} examen capcalera={capcalera} onResposta={onResposta} onSeguent={onSeguent} />}
        {p.forma === 'test' && p.test && <PreguntaOpcions key={idx} p={p.test} examen capcalera={capcalera} onResposta={onResposta} onSeguent={onSeguent} />}
      </div>
    );
  }

  return (
    <Resultat
      preguntes={preguntes}
      respostes={respostes}
      durada={durada}
      vista={vista}
      setVista={setVista}
      onRepeteix={() => {
        const malament = respostes.map((r, i) => ({ r, p: preguntes[i] })).filter((x) => !x.r.correcte);
        const fs = [...new Set(malament.map((x) => x.p.forma))];
        comenca(malament.map((x) => elementPerId(x.p.elementId)!), fs);
      }}
      onNou={() => setFase('config')}
    />
  );
}

function Resultat({
  preguntes,
  respostes,
  durada,
  vista,
  setVista,
  onRepeteix,
  onNou,
}: {
  preguntes: PregExamen[];
  respostes: RespExamen[];
  durada: number;
  vista: string | null;
  setVista: (id: string | null) => void;
  onRepeteix: () => void;
  onNou: () => void;
}) {
  const encerts = respostes.filter((r) => r.correcte).length;
  const total = respostes.length || 1;
  const nota = Math.round((encerts / total) * 100) / 10;
  const malament = useMemo(
    () => respostes.map((r, i) => ({ r, p: preguntes[i] })).filter((x) => !x.r.correcte),
    [respostes, preguntes],
  );
  const eVista = vista ? elementPerId(vista) : null;
  const millor = getEstat().millorExamen;
  const missatge =
    nota >= 9 ? 'Excel·lent! Estàs a punt per a l\'examen. 🏆' : nota >= 7 ? 'Molt bé! Repassa els que has fallat. 💪' : nota >= 5 ? 'Aprovat! Però encara hi ha feina. 📚' : 'Cal repassar més. Tu pots! 🌱';

  return (
    <div className="mode">
      <div className="mode-cap">
        <h2>🎓 Resultat de l'examen</h2>
      </div>
      <div className="mode-cos">
        <div className="mode-mapa">
          <MapView capa="etiquetes" enfoca={eVista?.p ?? null}>
            {(k) => (
              <>
                {malament.map(({ p }) => {
                  const e = elementPerId(p.elementId)!;
                  return (
                    <g key={p.elementId + p.forma}>
                      <Zona e={e} k={k} estat={e.id === vista ? 'ok' : 'ko'} />
                      {e.id === vista && <Etiqueta p={e.p} text={e.nom} k={k} />}
                    </g>
                  );
                })}
              </>
            )}
          </MapView>
        </div>
        <div className="mode-panell">
          <div className={`nota-final ${nota >= 5 ? 'aprovat' : 'suspes'} anim-ok`}>
            <span className="nota-num">{nota.toLocaleString('ca-ES')}</span>
            <span className="nota-de">/ 10</span>
          </div>
          <p className="missatge-nota">{missatge}</p>
          <div className="stats-mini">
            <div>
              <strong>{Math.round((encerts / total) * 100)}%</strong>
              <span>encerts</span>
            </div>
            <div>
              <strong>
                {encerts}/{respostes.length}
              </strong>
              <span>correctes</span>
            </div>
            <div>
              <strong>
                {Math.floor(durada / 60)}:{String(durada % 60).padStart(2, '0')}
              </strong>
              <span>temps</span>
            </div>
            <div>
              <strong>{millor?.toLocaleString('ca-ES') ?? '–'}</strong>
              <span>millor nota</span>
            </div>
          </div>
          {malament.length > 0 ? (
            <>
              <h3>Noms que has fallat ({malament.length})</h3>
              <p className="ajuda">Toca'n un per veure'l al mapa.</p>
              <ul className="llista-fallades">
                {malament.map(({ r, p }, i) => {
                  const e = elementPerId(p.elementId)!;
                  return (
                    <li key={i}>
                      <button type="button" className={vista === e.id ? 'actiu' : ''} onClick={() => setVista(e.id)}>
                        <span className="fallada-nom">{e.nom}</span>
                        <TipusBadge e={e} />
                        <span className="fallada-detall">
                          {NOM_FORMA[p.forma]}
                          {p.forma !== 'clic' && (
                            <>
                              {' · '}la teva resposta: <em>{r.resposta || '(en blanc)'}</em>
                            </>
                          )}
                          {p.forma === 'test' && p.test && <> · correcta: {p.test.opcions[p.test.correcta]}</>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="boto primari gran" onClick={onRepeteix}>
                🔁 Repeteix només les incorrectes
              </button>
            </>
          ) : (
            <p className="perfecte">🎉 Cap error! Perfecte.</p>
          )}
          <button type="button" className="boto gran" onClick={onNou}>
            Nou examen
          </button>
        </div>
      </div>
    </div>
  );
}
