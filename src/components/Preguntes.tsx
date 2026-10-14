import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Element, Punt } from '../data/types';
import { avaluaClic, type AvaluacioClic } from '../lib/geo';
import type { PreguntaTest } from '../lib/preguntes';
import { elementPerId } from '../lib/store';
import { comprovaEscrit, type ResultatEscrit } from '../lib/text';
import { ClicUsuari, Diana, Etiqueta, Zona } from './Marcadors';
import { MapView } from './MapView';
import { DiagnosticParaules, Feedback, Opcions, TipusBadge, useAnimacio, useTecla } from './ui';

/*
 * Components de pregunta reutilitzables pels modes de pràctica, el repàs i l'examen.
 * En mode examen no es mostra cap correcció: només es recull la resposta.
 */

export interface PropsPregunta {
  examen?: boolean;
  capcalera?: ReactNode;
  /** Retorna els punts guanyats (per mostrar-los) */
  onResposta: (correcte: boolean, resposta: string) => number | void;
  onSeguent: () => void;
}

function BotoSeguent({ onClick, text = 'Següent →' }: { onClick: () => void; text?: string }) {
  useTecla('Enter', onClick);
  return (
    <button type="button" className="boto primari gran" onClick={onClick}>
      {text} <kbd>Enter</kbd>
    </button>
  );
}

function amagaNom(text: string, nom: string) {
  const net = nom.replace(/^(el|la|l'|els|les)\s*/i, '');
  const esc = net.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(esc, 'gi'), '▢▢▢');
}

/* ------------------------------------------------------------------ */
/* B. ON ÉS? — clicar la ubicació                                       */
/* ------------------------------------------------------------------ */
export function PreguntaClic({ e, examen, capcalera, onResposta, onSeguent }: PropsPregunta & { e: Element }) {
  const [clic, setClic] = useState<Punt | null>(null);
  const [aval, setAval] = useState<AvaluacioClic | null>(null);
  const [punts, setPunts] = useState(0);
  const [intents, setIntents] = useState(0);
  const [anim, dispara] = useAnimacio();

  const onClic = (p: Punt) => {
    if (aval) return;
    setClic(p);
    if (examen) return;
    const a = avaluaClic(e, p);
    setAval(a);
    dispara(a.correcte ? 'ok' : 'ko');
    // només puntua el primer intent
    const g = intents === 0 ? onResposta(a.correcte, `${Math.round(p[0])},${Math.round(p[1])}`) : 0;
    setPunts(g || 0);
  };

  const reintenta = () => {
    setClic(null);
    setAval(null);
    setIntents((n) => n + 1);
  };

  const confirmaExamen = () => {
    if (!clic) return;
    onResposta(avaluaClic(e, clic).correcte, `${Math.round(clic[0])},${Math.round(clic[1])}`);
    onSeguent();
  };

  const mostraSolucio = !!aval && !examen;

  return (
    <div className="mode-cos">
      <div className={`mode-mapa ${anim}`}>
        <MapView
          capa={mostraSolucio ? 'etiquetes' : 'net'}
          onClic={onClic}
          enfoca={mostraSolucio ? aval!.punt : null}
          ajuda={!clic ? 'Fes clic on creus que és. Pots ampliar el mapa.' : undefined}
        >
          {(k) => (
            <>
              {mostraSolucio && <Zona e={e} k={k} estat={aval!.correcte ? 'ok' : 'ko'} />}
              {clic && <ClicUsuari clic={clic} cap={mostraSolucio ? aval!.punt : undefined} k={k} correcte={mostraSolucio ? aval!.correcte : undefined} />}
              {mostraSolucio && <Etiqueta p={aval!.punt} text={e.nom} k={k} />}
            </>
          )}
        </MapView>
      </div>
      <div className="mode-panell">
        {capcalera}
        <div className="targeta-pregunta">
          <p className="enunciat-petit">On és...</p>
          <p className="nom-gran">{e.nom}</p>
          <TipusBadge e={e} />
        </div>
        {examen ? (
          <button type="button" className="boto primari gran" disabled={!clic} onClick={confirmaExamen}>
            {clic ? 'Confirma i continua →' : 'Fes clic al mapa'}
          </button>
        ) : aval ? (
          <>
            <Feedback
              clau={`${e.id}-${intents}`}
              estat={aval.correcte ? 'ok' : 'ko'}
              punts={punts}
              text={
                <>
                  <strong>{aval.correcte ? 'Correcte!' : 'No és aquí.'}</strong> {aval.direccio}
                  {e.pista && <p className="pista">💡 {e.pista}</p>}
                </>
              }
            />
            <div className="fila-botons">
              {!aval.correcte && (
                <button type="button" className="boto" onClick={reintenta}>
                  ↺ Torna-ho a provar
                </button>
              )}
              <BotoSeguent onClick={onSeguent} />
            </div>
          </>
        ) : (
          <p className="ajuda">Fes clic damunt del mapa (sense noms). Es donarà per bo si cliques prou a prop.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D. ESCRIU EL NOM                                                     */
/* ------------------------------------------------------------------ */
export function PreguntaEscriu({ e, examen, capcalera, onResposta, onSeguent }: PropsPregunta & { e: Element }) {
  const [text, setText] = useState('');
  const [res, setRes] = useState<ResultatEscrit | null>(null);
  const [punts, setPunts] = useState(0);
  const [pista, setPista] = useState(false);
  const [lletra, setLletra] = useState(false);
  const [anim, dispara] = useAnimacio();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, []);

  const comprova = () => {
    if (res) return;
    if (examen) {
      onResposta(comprovaEscrit(text, e).correcte, text);
      onSeguent();
      return;
    }
    if (!text.trim()) return;
    const r = comprovaEscrit(text, e);
    setRes(r);
    dispara(r.correcte ? 'ok' : 'ko');
    setPunts((onResposta(r.correcte, text) as number) || 0);
  };

  const passa = () => {
    const r = comprovaEscrit('', e);
    setRes(r);
    dispara('ko');
    onResposta(false, '');
  };

  const primeraLletra = e.nom.replace(/^(el |la |l'|els |les )/i, '').charAt(0).toUpperCase();
  const mostraSolucio = !!res && !examen;

  return (
    <div className="mode-cos">
      <div className={`mode-mapa ${anim}`}>
        <MapView capa={mostraSolucio ? 'etiquetes' : 'net'} enfoca={e.p}>
          {(k) => (
            <>
              <Diana p={e.p} k={k} />
              {mostraSolucio && <Zona e={e} k={k} estat={res!.correcte ? 'ok' : 'ko'} />}
            </>
          )}
        </MapView>
      </div>
      <div className="mode-panell">
        {capcalera}
        <div className="targeta-pregunta">
          <p className="enunciat-petit">Com es diu l'element assenyalat?</p>
          <TipusBadge e={e} />
          {!examen && e.alt && <p className="dada">Altitud: {e.alt.toLocaleString('ca-ES')} m</p>}
          {!examen && pista && e.pista && <p className="pista">💡 {amagaNom(e.pista, e.nom)}</p>}
          {!examen && lletra && (
            <p className="pista">
              🔤 Comença per <strong>{primeraLletra}</strong> i té {e.nom.split(/\s+/).length} paraula(es).
            </p>
          )}
        </div>
        <form
          className="form-escriu"
          onSubmit={(ev) => {
            ev.preventDefault();
            comprova();
          }}
        >
          <input
            ref={input}
            type="text"
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            placeholder="Escriu el nom..."
            disabled={!!res}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Nom de l'element"
          />
          {!res && (
            <button type="submit" className="boto primari">
              {examen ? 'Següent →' : 'Comprova'}
            </button>
          )}
        </form>
        {!examen && !res && (
          <div className="fila-botons">
            {e.pista && !pista && (
              <button type="button" className="boto petit" onClick={() => setPista(true)}>
                💡 Pista
              </button>
            )}
            {!lletra && (
              <button type="button" className="boto petit" onClick={() => setLletra(true)}>
                🔤 Primera lletra
              </button>
            )}
            <button type="button" className="boto petit" onClick={passa}>
              Passa ⏭
            </button>
          </div>
        )}
        {res && !examen && (
          <>
            <Feedback
              clau={e.id}
              estat={res.correcte ? (res.avis ? 'avis' : 'ok') : 'ko'}
              punts={punts}
              text={
                <>
                  <strong>{res.correcte ? res.avis ?? 'Correcte!' : text.trim() ? 'No és correcte.' : 'Resposta:'}</strong>{' '}
                  {!res.correcte && (
                    <>
                      És <strong>{e.nom}</strong>.
                    </>
                  )}
                  {e.alMapa && <p className="pista">Al mapa surt escrit «{e.alMapa}».</p>}
                </>
              }
            />
            {text.trim() && !(res.correcte && !res.avis) && (
              <div>
                <p className="ajuda">Comparació paraula per paraula amb el nom correcte:</p>
                <DiagnosticParaules paraules={res.paraules} />
              </div>
            )}
            <BotoSeguent onClick={onSeguent} />
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C / A. PREGUNTA D'OPCIONS                                            */
/* ------------------------------------------------------------------ */
export function PreguntaOpcions({ p, examen, capcalera, onResposta, onSeguent }: PropsPregunta & { p: PreguntaTest }) {
  const [triada, setTriada] = useState<number | null>(null);
  const [punts, setPunts] = useState(0);
  const [anim, dispara] = useAnimacio();
  const e = elementPerId(p.elementId)!;
  const implicats = p.implicats.map((id) => elementPerId(id)!).filter(Boolean);

  const tria = useCallback(
    (i: number) => {
      if (triada !== null) return;
      setTriada(i);
      const ok = i === p.correcta;
      if (examen) {
        onResposta(ok, p.opcions[i]);
        setTimeout(onSeguent, 250);
        return;
      }
      dispara(ok ? 'ok' : 'ko');
      setPunts((onResposta(ok, p.opcions[i]) as number) || 0);
    },
    [triada, p, examen],
  );

  const mostraSolucio = triada !== null && !examen;
  const ensenyaMapa = p.marcaMapa || mostraSolucio;

  return (
    <div className="mode-cos">
      <div className={`mode-mapa ${anim}`}>
        <MapView capa={mostraSolucio ? 'etiquetes' : 'net'} enfoca={p.marcaMapa ? e.p : null}>
          {(k) =>
            ensenyaMapa && (
              <>
                {p.marcaMapa && <Diana p={e.p} k={k} />}
                {mostraSolucio &&
                  implicats.map((x) => (
                    <g key={x.id}>
                      <Zona e={x} k={k} estat={x.id === e.id ? 'ok' : 'info'} />
                      <Etiqueta p={x.p} text={x.alt && p.tipus === 'altitud' ? `${x.nom} (${x.alt} m)` : x.nom} k={k} petita={x.id !== e.id} />
                    </g>
                  ))}
              </>
            )
          }
        </MapView>
      </div>
      <div className="mode-panell">
        {capcalera}
        <div className="targeta-pregunta">
          <p className="enunciat">{p.enunciat}</p>
        </div>
        <Opcions opcions={p.opcions} correcta={p.correcta} triada={triada} onTria={tria} amagaCorreccio={examen} />
        {mostraSolucio && (
          <>
            <Feedback
              clau={p.enunciat + p.elementId}
              estat={triada === p.correcta ? 'ok' : 'ko'}
              punts={punts}
              text={
                <>
                  <strong>{triada === p.correcta ? 'Correcte!' : `Era: ${p.opcions[p.correcta]}`}</strong>
                  <p className="pista">{p.explicacio}</p>
                </>
              }
            />
            <BotoSeguent onClick={onSeguent} />
          </>
        )}
      </div>
    </div>
  );
}
