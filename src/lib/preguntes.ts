import type { Element, Tipus, Unitat } from '../data/types';
import { TIPUS_INFO } from '../data/types';
import { barreja, tria, triaN, triaPonderat } from './random';
import { elements, pes } from './store';

/* Generador de preguntes tipus test basades només en dades del mapa
   (nom, tipus, posició, altitud) i en relacions hidrogràfiques segures. */

export interface PreguntaTest {
  tipus: 'identifica' | 'quinTipus' | 'direccio' | 'altitud' | 'mar' | 'afluent' | 'unitat';
  enunciat: string;
  opcions: string[];
  correcta: number;
  /** Element principal de la pregunta (per al progrés i per mostrar-lo al mapa) */
  elementId: string;
  /** Elements implicats a les opcions (per mostrar-los al mapa en corregir) */
  implicats: string[];
  /** Mostra un marcador al mapa de l'element (pregunta «Quin és aquest element?») */
  marcaMapa: boolean;
  explicacio: string;
}

const UNITATS: Unitat[] = [
  'Pirineu axial',
  'Prepirineu',
  'Serralada Transversal',
  'Depressió Central',
  'Serralada Prelitoral',
  'Depressió Prelitoral',
  'Serralada Litoral',
];

function opcionsAmb(correcta: string, altres: string[]) {
  const opcions = barreja([correcta, ...altres]);
  return { opcions, correcta: opcions.indexOf(correcta) };
}

function article(t: Tipus) {
  return ['serra', 'plana', 'unitat'].includes(t) ? 'una' : 'un';
}

/** «Quin és aquest element?» amb un marcador al mapa. Distractors del mateix tipus. */
export function preguntaIdentifica(e: Element): PreguntaTest {
  const mateixTipus = elements().filter((x) => x.tipus === e.tipus && x.id !== e.id);
  const pool = mateixTipus.length >= 3 ? mateixTipus : elements().filter((x) => x.id !== e.id);
  const distr = triaN(pool, 3);
  const { opcions, correcta } = opcionsAmb(e.nom, distr.map((d) => d.nom));
  return {
    tipus: 'identifica',
    enunciat: `Quin nom correspon a l'element assenyalat al mapa? (${TIPUS_INFO[e.tipus].nom.toLowerCase()})`,
    opcions,
    correcta,
    elementId: e.id,
    implicats: [e.id],
    marcaMapa: true,
    explicacio: `És ${e.nom}.${e.pista ? ' ' + e.pista : ''}`,
  };
}

function preguntaQuinTipus(e: Element): PreguntaTest | null {
  if (e.tipus === 'territori') return null;
  const altres = elements().filter((x) => x.tipus !== e.tipus && x.tipus !== 'territori');
  // distractors de tipus diferents entre si quan sigui possible
  const perTipus = new Map<Tipus, Element[]>();
  for (const x of altres) perTipus.set(x.tipus, [...(perTipus.get(x.tipus) ?? []), x]);
  const tipusTriats = triaN([...perTipus.keys()], 3);
  const distr = tipusTriats.map((t) => tria(perTipus.get(t)!));
  const { opcions, correcta } = opcionsAmb(e.nom, distr.map((d) => d.nom));
  const info = TIPUS_INFO[e.tipus];
  return {
    tipus: 'quinTipus',
    enunciat: `Quin d'aquests noms correspon a ${article(e.tipus)} ${info.nom.toLowerCase()}?`,
    opcions,
    correcta,
    elementId: e.id,
    implicats: [e.id, ...distr.map((d) => d.id)],
    marcaMapa: false,
    explicacio: `${e.nom} és ${article(e.tipus)} ${info.nom.toLowerCase()}. Els altres: ${distr
      .map((d) => `${d.nom} (${TIPUS_INFO[d.tipus].nom.toLowerCase()})`)
      .join(', ')}.`,
  };
}

const DIRECCIONS = [
  { nom: 'més al nord', val: (e: Element) => -e.p[1] },
  { nom: 'més al sud', val: (e: Element) => e.p[1] },
  { nom: "més a l'est", val: (e: Element) => e.p[0] },
  { nom: "més a l'oest", val: (e: Element) => -e.p[0] },
];

function preguntaDireccio(e: Element): PreguntaTest | null {
  if (['unitat', 'territori'].includes(e.tipus)) return null;
  const dir = tria(DIRECCIONS);
  const mateix = barreja(elements().filter((x) => x.tipus === e.tipus && x.id !== e.id));
  // Cal una separació clara (>= 60 px ≈ 14 km) entre totes les opcions
  const triats: Element[] = [e];
  for (const x of mateix) {
    if (triats.length === 4) break;
    if (triats.every((t) => Math.abs(dir.val(t) - dir.val(x)) >= 60)) triats.push(x);
  }
  if (triats.length < 4) return null;
  const guanyador = [...triats].sort((a, b) => dir.val(b) - dir.val(a))[0];
  const opcions = barreja(triats.map((t) => t.nom));
  return {
    tipus: 'direccio',
    enunciat: `Quin d'aquests ${TIPUS_INFO[e.tipus].plural.toLowerCase()} es troba ${dir.nom}?`,
    opcions,
    correcta: opcions.indexOf(guanyador.nom),
    elementId: guanyador.id,
    implicats: triats.map((t) => t.id),
    marcaMapa: false,
    explicacio: `${guanyador.nom} és el que està ${dir.nom}. Mira'ls tots al mapa.`,
  };
}

function preguntaAltitud(): PreguntaTest | null {
  const cims = barreja(elements().filter((x) => x.tipus === 'cim' && x.alt));
  const triats: Element[] = [];
  for (const c of cims) {
    if (triats.length === 4) break;
    if (triats.every((t) => Math.abs(t.alt! - c.alt!) >= 40)) triats.push(c);
  }
  if (triats.length < 4) return null;
  const mesAlt = Math.random() < 0.7;
  const ordenats = [...triats].sort((a, b) => (mesAlt ? b.alt! - a.alt! : a.alt! - b.alt!));
  const opcions = barreja(triats.map((t) => t.nom));
  return {
    tipus: 'altitud',
    enunciat: `Quin d'aquests cims és ${mesAlt ? 'el més alt' : 'el més baix'}?`,
    opcions,
    correcta: opcions.indexOf(ordenats[0].nom),
    elementId: ordenats[0].id,
    implicats: triats.map((t) => t.id),
    marcaMapa: false,
    explicacio: [...triats]
      .sort((a, b) => b.alt! - a.alt!)
      .map((t) => `${t.nom}: ${t.alt!.toLocaleString('ca-ES')} m`)
      .join(' · '),
  };
}

function preguntaMar(): PreguntaTest | null {
  const marins = elements().filter((x) => x.tipus === 'riu' && x.mar === 'Mediterrani');
  const afluents = elements().filter((x) => x.tipus === 'riu' && x.afluentDe);
  if (Math.random() < 0.2) {
    const garona = elements().find((x) => x.mar === 'Atlàntic');
    if (garona) {
      const distr = triaN(marins, 3);
      const { opcions, correcta } = opcionsAmb(garona.nom, distr.map((d) => d.nom));
      return {
        tipus: 'mar',
        enunciat: "Quin d'aquests rius desemboca a l'oceà Atlàntic?",
        opcions,
        correcta,
        elementId: garona.id,
        implicats: [garona.id, ...distr.map((d) => d.id)],
        marcaMapa: false,
        explicacio: `${garona.nom}: neix a la Vall d'Aran i travessa França fins a l'Atlàntic. Els altres van al Mediterrani.`,
      };
    }
  }
  const e = tria(marins);
  const distr = triaN(afluents, 3);
  const { opcions, correcta } = opcionsAmb(e.nom, distr.map((d) => d.nom));
  return {
    tipus: 'mar',
    enunciat: "Quin d'aquests rius desemboca directament al mar Mediterrani?",
    opcions,
    correcta,
    elementId: e.id,
    implicats: [e.id, ...distr.map((d) => d.id)],
    marcaMapa: false,
    explicacio: `${e.nom} desemboca al Mediterrani. Els altres són afluents: ${distr
      .map((d) => `${d.nom} → ${d.afluentDe}`)
      .join(', ')}.`,
  };
}

function preguntaAfluent(e?: Element): PreguntaTest | null {
  const afl = elements().filter((x) => x.tipus === 'riu' && x.afluentDe);
  const r = e && e.afluentDe ? e : tria(afl);
  const principals = [
    ...new Set([
      ...afl.map((x) => x.afluentDe!),
      ...elements()
        .filter((x) => x.tipus === 'riu' && x.mar)
        .map((x) => x.nom),
    ]),
  ].filter((n) => n !== r.afluentDe && n !== r.nom);
  const { opcions, correcta } = opcionsAmb(r.afluentDe!, triaN(principals, 3));
  return {
    tipus: 'afluent',
    enunciat: `${r.nom.charAt(0).toUpperCase() + r.nom.slice(1)} és afluent de...`,
    opcions,
    correcta,
    elementId: r.id,
    implicats: [r.id],
    marcaMapa: false,
    explicacio: `${r.nom} desemboca a ${r.afluentDe}.${r.pista ? ' ' + r.pista : ''}`,
  };
}

function preguntaUnitat(e?: Element): PreguntaTest | null {
  const amb = elements().filter((x) => x.unitat && x.tipus !== 'unitat');
  const x = e && e.unitat ? e : tria(amb);
  const { opcions, correcta } = opcionsAmb(x.unitat!, triaN(UNITATS.filter((u) => u !== x.unitat), 3));
  return {
    tipus: 'unitat',
    enunciat: `A quina gran unitat de relleu pertany ${x.nom}?`,
    opcions,
    correcta,
    elementId: x.id,
    implicats: [x.id],
    marcaMapa: false,
    explicacio: `${x.nom} pertany a la gran unitat: ${x.unitat}.`,
  };
}

/** Genera una pregunta de test variada a partir d'un conjunt d'elements candidats */
export function generaPregunta(candidats: Element[]): PreguntaTest {
  const e = triaPonderat(candidats, (x) => pes(x.id));
  const tipusPermesos = new Set(candidats.map((c) => c.tipus));
  const opcionsGen: (() => PreguntaTest | null)[] = [
    () => preguntaIdentifica(e),
    () => preguntaIdentifica(e),
    () => preguntaIdentifica(e),
    () => preguntaQuinTipus(e),
    () => preguntaDireccio(e),
    () => (e.unitat ? preguntaUnitat(e) : null),
  ];
  if (tipusPermesos.has('cim')) opcionsGen.push(() => (e.tipus === 'cim' ? preguntaAltitud() : null), preguntaAltitud);
  if (tipusPermesos.has('riu')) {
    opcionsGen.push(preguntaMar, () => preguntaAfluent(e.tipus === 'riu' ? e : undefined));
  }
  if ([...tipusPermesos].some((t) => ['cim', 'serra', 'plana'].includes(t))) {
    opcionsGen.push(() => preguntaUnitat(e.unitat ? e : undefined));
  }
  for (let i = 0; i < 10; i++) {
    const p = tria(opcionsGen)();
    if (p) return p;
  }
  return preguntaIdentifica(e);
}
