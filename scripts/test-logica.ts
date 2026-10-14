/* Proves de la lògica (sense navegador): node + esbuild. Executa: npm test */
import { ELEMENTS } from '../src/data/elements';
import { MAP_H, MAP_W } from '../src/data/types';
import { avaluaClic } from '../src/lib/geo';
import { generaPregunta } from '../src/lib/preguntes';
import { clau, comprovaEscrit, diagnosticaParaules } from '../src/lib/text';

let errors = 0;
let proves = 0;
function ok(cond: unknown, msg: string) {
  proves++;
  if (!cond) {
    errors++;
    console.error('✗', msg);
  }
}
const E = (nom: string) => {
  const e = ELEMENTS.find((x) => x.nom === nom);
  if (!e) throw new Error('No trobat: ' + nom);
  return e;
};

// --- Dades ---
const ids = new Set(ELEMENTS.map((e) => e.id));
ok(ids.size === ELEMENTS.length, 'ids únics');
const noms = new Set(ELEMENTS.map((e) => e.nom.toLowerCase()));
ok(noms.size === ELEMENTS.length, 'noms únics');
for (const e of ELEMENTS) {
  for (const p of [e.p, ...(e.extra ?? [])]) {
    ok(p[0] >= 0 && p[0] <= MAP_W && p[1] >= 0 && p[1] <= MAP_H, `coordenades dins del mapa: ${e.nom}`);
  }
  if (e.tipus === 'cim') ok(typeof e.alt === 'number', `cim amb altitud: ${e.nom}`);
  if (e.afluentDe) ok(ELEMENTS.some((x) => x.nom === e.afluentDe), `afluent apunta a un riu del mapa: ${e.nom} → ${e.afluentDe}`);
}

const vistes = new Map<string, string>();
for (const e of ELEMENTS) {
  for (const f of new Set([e.nom, e.alMapa, ...(e.alies ?? [])].filter(Boolean).map((x) => clau(x!)))) {
    ok(!vistes.has(f) || vistes.get(f) === e.id, `forma acceptada compartida: «${f}» (${vistes.get(f)} i ${e.id})`);
    vistes.set(f, e.id);
  }
}

// --- Correcció de respostes escrites ---
const casos: [string, string, boolean][] = [
  ["Pica d'Estats", "pica d'estats", true],
  ["Pica d'Estats", 'PICA D ESTATS', true],
  ["Pica d'Estats", 'pica destats', true],
  ['la Noguera Pallaresa', 'Noguera Pallaresa', true],
  ['la Noguera Pallaresa', 'noguera ribagorçana', false],
  ['Sant Jeroni', 'St. Jeroni', true],
  ['Serra de Santa Magdalena', 'Serra de Sta. Magdalena', true],
  ['el Montseny', 'montseny', true],
  ['Puigmal', 'Puigsacalm', false],
  ['Serra del Cadí', 'serra del cadi', true],
  ["Turó de l'Home", "turo de l'home", true],
  ['Muntanyes de Prades', 'Munts. de Prades', true],
  ["Serra de l'Albera", "S. de l'Albera", true],
  ['Mont-roig', 'mont roig', true],
  ['Serra del Montsec', 'Serra del Montsant', false],
  ['Cinca', 'Cinc', false],
  ['Puig Pedròs', 'puig pedros', true],
  ["l'Ebre", 'ebre', true],
  ['Riu Corb', 'riu corp', true],
  ['Montsent', 'Montseny', false],
  ['Serra de Pinós', 'Serra de Pinos', true],
];
for (const [nom, resp, esperat] of casos) {
  const r = comprovaEscrit(resp, E(nom));
  ok(r.correcte === esperat, `«${resp}» per a «${nom}» hauria de ser ${esperat ? 'correcte' : 'incorrecte'}`);
}
ok(comprovaEscrit('riu corp', E('Riu Corb')).avis, 'errada petita: correcte amb avís');
ok(comprovaEscrit('serra del cadi', E('Serra del Cadí')).avis, 'avisa dels accents');
ok(!comprovaEscrit('Serra del Cadí', E('Serra del Cadí')).avis, 'sense avís si està perfecte');
const d = diagnosticaParaules('Serra del Montsant', 'Serra del Montsec');
ok(d[0].estat === 'ok' && d[1].estat === 'ok' && d[2].estat !== 'ok', 'diagnòstic marca la paraula errònia');

// --- Clics al mapa ---
const pica = E("Pica d'Estats");
ok(avaluaClic(pica, pica.p).correcte, 'clic exacte és correcte');
const nord = avaluaClic(pica, [pica.p[0], pica.p[1] + 150]);
ok(!nord.correcte && nord.direccio.includes('al sud'), 'clic massa al sud detectat: ' + nord.direccio);
const oest = avaluaClic(pica, [pica.p[0] - 150, pica.p[1]]);
ok(oest.direccio.includes("a l'oest"), "clic massa a l'oest detectat");
const segre = E('el Segre');
ok(avaluaClic(segre, segre.extra![1]).correcte, 'riu acceptat en un punt secundari');

// --- Preguntes tipus test ---
for (let i = 0; i < 2000; i++) {
  const p = generaPregunta(ELEMENTS);
  ok(p.opcions.length === 4, `4 opcions (${p.tipus})`);
  ok(new Set(p.opcions).size === 4, `opcions diferents (${p.tipus}: ${p.opcions.join(', ')})`);
  ok(p.correcta >= 0 && p.correcta < 4, 'índex correcte vàlid');
  if (p.tipus === 'altitud') {
    const alts = p.opcions.map((o) => E(o).alt!);
    const c = alts[p.correcta];
    ok(c === Math.max(...alts) || c === Math.min(...alts), 'altitud correcta');
  }
  if (p.tipus === 'mar') {
    ok(E(p.opcions[p.correcta]).mar, 'el riu correcte desemboca al mar');
  }
}

console.log(`${proves - errors}/${proves} proves superades`);
if (errors) process.exit(1);
