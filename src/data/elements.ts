import type { Element, Punt, Tipus } from './types';

/*
 * BASE DE DADES DELS ELEMENTS DEL MAPA FÍSIC
 * ------------------------------------------
 * Tots els noms s'han llegit de la imatge original (public/mapa.jpg).
 * Les coordenades són píxels d'aquesta imatge (1200 × 1600):
 *   - cims: posició del triangle ▲ del mapa (precisió «exacta»);
 *   - serres, planes, rius...: posició on hi ha escrit el nom (precisió «etiqueta»).
 * Qualsevol ubicació es pot corregir des de l'apartat «Editor d'ubicacions» de la web.
 */

type Opc = Partial<Omit<Element, 'id' | 'nom' | 'tipus' | 'p'>>;

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function el(tipus: Tipus, nom: string, x: number, y: number, o: Opc = {}): Element {
  return {
    id: `${tipus}-${slug(nom)}`,
    nom,
    tipus,
    p: [x, y] as Punt,
    precisio: tipus === 'cim' ? 'exacta' : 'etiqueta',
    ...o,
  };
}
const cim = (nom: string, alt: number, x: number, y: number, o: Opc = {}) => el('cim', nom, x, y, { alt, ...o });

/* ------------------------------------------------------------------ */
/* GRANS UNITATS DE RELLEU                                             */
/* ------------------------------------------------------------------ */
const unitats: Element[] = [
  el('unitat', 'Pirineu', 470, 430, {
    extra: [[300, 405], [420, 425], [560, 440], [700, 455]],
    r: 120,
    pista: 'Les grans lletres P-I-R-I-N-E-U travessen tot el nord del mapa, de la Ribagorça fins al Ter.',
  }),
  el('unitat', 'Pirineu axial', 310, 320, {
    extra: [[430, 330], [700, 425]],
    r: 90,
    pista: 'La part més alta i central del Pirineu, on hi ha els cims de més de 3.000 m (Pica d\'Estats, Comaloforno...).',
  }),
  el('unitat', 'Prepirineu', 480, 505, {
    extra: [[350, 505], [620, 505], [270, 630]],
    r: 110,
    pista: 'Serres paral·leles al sud del Pirineu axial: Boumort, Cadí, Port del Comte, Montsec...',
  }),
  el('unitat', 'Serralada Transversal', 785, 560, {
    r: 70,
    pista: 'Serralada perpendicular a les altres, a la Garrotxa i Osona (Puigsacalm, Finestres, Sta. Magdalena).',
  }),
  el('unitat', 'Depressió Central', 340, 850, {
    extra: [[200, 915], [480, 790], [300, 800]],
    r: 120,
    pista: 'Gran zona baixa i plana de l\'interior, entre el Prepirineu i la Serralada Prelitoral (Urgell, Bages, Òdena...).',
  }),
  el('unitat', 'Serralada Prelitoral', 400, 960, {
    extra: [[250, 1060], [520, 880], [330, 1000]],
    r: 100,
    pista: 'Serralada interior paral·lela a la costa: Montseny, Montserrat, Sant Llorenç del Munt, Prades, Ports...',
  }),
  el('unitat', 'Depressió Prelitoral', 655, 865, {
    extra: [[600, 900], [720, 830]],
    r: 70,
    pista: 'Fossa entre la Serralada Prelitoral i la Litoral (Vallès, Penedès).',
  }),
  el('unitat', 'Serralada Litoral', 700, 905, {
    extra: [[785, 855], [570, 975], [640, 940]],
    r: 80,
    pista: 'La serralada més propera al mar: Garraf, Collserola, Corredor, Montnegre.',
  }),
];

/* ------------------------------------------------------------------ */
/* CIMS (amb l'altitud que indica el mapa)                             */
/* ------------------------------------------------------------------ */
const cims: Element[] = [
  cim('Pic de Bacanere', 2193, 170, 221, { pista: 'Extrem nord-oest de la Vall d\'Aran, a la frontera amb França.' }),
  cim('Tuc de Maubèrme', 2880, 260, 245, { unitat: 'Pirineu axial', pista: 'Al nord de la Vall d\'Aran, a la frontera francesa.' }),
  cim('Montlude', 2518, 204, 255, {
    unitat: 'Pirineu axial',
    pista: 'Dins la Vall d\'Aran, al costat del nom «Vall d\'Aran».',
    alies: ['Tuc de Montlude'],
    dubte: 'El text és petit i borrós a la foto: es llegeix «Montlude» (2.518 m). Comprova l\'ortografia al llibre.',
  }),
  cim('Mont-roig', 2864, 349, 284, { unitat: 'Pirineu axial', alies: ['Montroig', 'Mont roig'], pista: 'Al Pallars Sobirà, a la frontera amb França, entre l\'Aran i la Pica d\'Estats.' }),
  cim('Pic de Sotllo', 3084, 423, 301, { unitat: 'Pirineu axial', pista: 'Veí de la Pica d\'Estats, just a l\'oest.' }),
  cim("Pica d'Estats", 3143, 432, 307, {
    unitat: 'Pirineu axial',
    alies: ['Pica Estats'],
    pista: 'El cim més alt de Catalunya (3.143 m), al Pallars Sobirà, a la frontera amb França.',
  }),
  cim('Pic Pomero', 2709, 171, 315, { pista: 'A l\'oest de la Vall d\'Aran, a tocar del límit amb Aragó.' }),
  cim('Tuc de Molières', 3010, 176, 331, { unitat: 'Pirineu axial', alies: ['Tuc de Molieres'], pista: 'Tresmil al límit amb Aragó, just al sud del Pic Pomero.' }),
  cim('Besiberri Nord', 3015, 230, 339, { unitat: 'Pirineu axial', pista: 'Tresmil de l\'Alta Ribagorça, al nord de Comaloforno.' }),
  cim('Comaloforno', 3033, 221, 353, { unitat: 'Pirineu axial', alies: ['Comalofornó'], pista: 'Tresmil de l\'Alta Ribagorça, al massís dels Besiberris.' }),
  cim('Bony Blanc', 2753, 262, 396, {
    pista: 'Al sud de Comaloforno, a l\'Alta Ribagorça.',
    dubte: 'L\'altitud es llegeix malament a la foto (2.753 o 2.763). Revisa-la al llibre.',
  }),
  cim('Pic de Peguera', 2942, 296, 367, { unitat: 'Pirineu axial', pista: 'Al Parc Nacional d\'Aigüestortes, al sud de l\'Estany de Sant Maurici.' }),
  cim('Montsent', 2881, 299, 394, { alies: ['Montsent de Pallars'], pista: 'Just al sud del Pic de Peguera, al Pallars.' }),
  cim('Monteixo', 2905, 422, 337, { unitat: 'Pirineu axial', pista: 'Al Pallars Sobirà, al sud de la Pica d\'Estats, a prop d\'Andorra.' }),
  cim('Pic de Salòria', 2789, 433, 379, { alies: ['Pic de Saloria'], pista: 'Al sud del Monteixo, a tocar de la frontera amb Andorra.' }),
  cim("l'Orri", 2440, 372, 432, {
    alies: ["Tossal de l'Orri", 'Orri'],
    pista: 'Entre la Noguera Pallaresa i el Segre, al Pallars Sobirà.',
    dubte: 'A la foto es llegeix «l\'Om» o «l\'Orri» (2.440 m). Molt probablement és el Tossal de l\'Orri: comprova-ho al llibre.',
  }),
  cim('Cap de Boumort', 2077, 346, 519, { unitat: 'Prepirineu', pista: 'Punt més alt de la Serra del Boumort.' }),
  cim('Sant Alís', 1676, 220, 619, { unitat: 'Prepirineu', alies: ['Sant Alis'], pista: 'Cim de la Serra del Montsec, a la part oest.' }),
  cim('Tossal de les Torretes', 1677, 287, 626, { unitat: 'Prepirineu', pista: 'El punt més alt del Montsec (1.677 m), a la part central.' }),
  cim('Tossa Plana de Lles', 2898, 530, 395, {
    pista: 'Al sud d\'Andorra, a la Cerdanya.',
    dubte: 'L\'altitud que es llegeix a la foto és 2.898, però és difícil de llegir (2.896?). Revisa-la al llibre.',
  }),
  cim('Pic de Monturull', 2761, 493, 414, { alies: ['Monturull'], pista: 'Al sud-est d\'Andorra, damunt de la vall del Segre.' }),
  cim('Puig Pedròs', 2914, 571, 395, { alies: ['Puig Pedros'], pista: 'A la Cerdanya, a la frontera amb França.' }),
  cim('Puigmal', 2910, 696, 427, { unitat: 'Pirineu axial', pista: 'Gran cim entre la Cerdanya i el Ripollès, a la frontera.' }),
  cim('Puig de Bastiments', 2874, 732, 410, { unitat: 'Pirineu axial', pista: 'Al Ripollès, a la frontera, a l\'est del Puigmal.' }),
  cim('Costabona', 2465, 773, 404, { pista: 'A l\'extrem est de la serra del mateix nom (Serra de Costabona), al Ripollès.' }),
  cim('Puig Neulós', 1256, 1001, 354, { alies: ['Puig Neulos'], pista: 'El punt més alt de la Serra de l\'Albera, a l\'Alt Empordà.' }),
  cim('Pedraforca', 2497, 549, 508, { unitat: 'Prepirineu', pista: 'Muntanya emblemàtica de dues puntes, al sud de la Serra del Cadí (Berguedà).' }),
  cim("la Tossa d'Alp", 2431, 611, 466, { alies: ["Tossa d'Alp"], pista: 'A l\'est de la Serra del Cadí, entre la Cerdanya i el Berguedà.' }),
  cim('Tossa Pelada', 2378, 492, 553, { unitat: 'Prepirineu', pista: 'A la Serra del Port del Comte.' }),
  cim('la Guàrdia', 1448, 534, 577, { alies: ['Guardia'], pista: 'Al nord de la Serra de Busa (Solsonès-Berguedà).' }),
  cim('Puigsacalm', 1515, 799, 549, { unitat: 'Serralada Transversal', pista: 'El cim més alt de la Serralada Transversal (Garrotxa).' }),
  cim('Sant Miquel', 1204, 852, 633, { pista: 'Cim del Massís de les Guilleries.' }),
  cim('Matagalls', 1697, 806, 705, { unitat: 'Serralada Prelitoral', pista: 'Cim del Montseny, al nord del Turó de l\'Home.' }),
  cim("Turó de l'Home", 1706, 826, 717, { unitat: 'Serralada Prelitoral', alies: ["Turo de l'Home"], pista: 'El punt més alt del Montseny (1.706 m).' }),
  cim('Puig Rodó', 1056, 715, 691, { alies: ['Puig Rodo'], pista: 'Al sud-oest de la Plana de Vic.' }),
  cim('la Mola', 1104, 674, 785, { unitat: 'Serralada Prelitoral', pista: 'Cim de Sant Llorenç del Munt (Vallès Occidental).' }),
  cim('Sant Jeroni', 1236, 605, 816, {
    alMapa: 'St. Jeroni',
    unitat: 'Serralada Prelitoral',
    alies: ['St Jeroni'],
    pista: 'El punt més alt de Montserrat (1.236 m).',
  }),
  cim('Tossal de la Baltasana', 1203, 332, 959, { unitat: 'Serralada Prelitoral', pista: 'El punt més alt de les Muntanyes de Prades.' }),
  cim('Mola de la Mussara', 1055, 338, 989, { pista: 'A l\'extrem sud de les Muntanyes de Prades, damunt del Camp de Tarragona.' }),
  cim('Montalt', 749, 249, 1099, { pista: 'Al sud de la Cubeta de Móra, a prop de la costa.' }),
  cim('Cardó', 938, 176, 1146, { alies: ['Cardo'], pista: 'A la Serra de Cardó - el Boix, al Baix Ebre.' }),
  cim("l'Espina", 1181, 94, 1175, { pista: 'Als Ports de Beseit, al nord del Caro.' }),
  cim('Caro', 1442, 104, 1209, { unitat: 'Serralada Prelitoral', alies: ['Mont Caro', 'el Caro'], pista: 'El punt més alt dels Ports de Beseit (1.442 m).' }),
  cim('Torreta de Montsià', 764, 167, 1296, { pista: 'El punt més alt de la Serra del Montsià.' }),
  cim('la Morella', 595, 655, 949, { unitat: 'Serralada Litoral', pista: 'El punt més alt del Massís del Garraf.' }),
  cim('el Peni', 606, 1123, 446, { alies: ['Peni'], pista: 'Punt més alt de la Serra de Rodes, a prop del Cap de Creus.' }),
  cim('Montgrí', 309, 1081, 555, { alies: ['Montgri'], pista: 'Massís calcari al costat del Ter, a prop de Torroella de Montgrí.' }),
  cim("Puig d'Arques", 535, 1021, 634, { pista: 'El punt més alt del Massís de les Gavarres.' }),
  cim('Puig de les Cadiretes', 518, 1017, 711, { pista: 'Cim del Massís de les Cadiretes, a l\'Ardenya, prop de la costa de la Selva.' }),
];

/* ------------------------------------------------------------------ */
/* SERRES I MASSISSOS                                                  */
/* ------------------------------------------------------------------ */
const serres: Element[] = [
  el('serra', 'Massís de Beret', 290, 282, { alies: ['Beret', 'Pla de Beret'], pista: 'Entre la Vall d\'Aran i el Pallars, on neixen la Garona i la Noguera Pallaresa.' }),
  el('serra', 'Serra de Sant Gervàs', 240, 442, { unitat: 'Prepirineu', alies: ['Sant Gervas'], pista: 'Entre l\'Alta Ribagorça i el Pallars Jussà, a l\'oest del Flamicell.' }),
  el('serra', 'Serra del Boumort', 350, 527, { unitat: 'Prepirineu', pista: 'Serra prepirinenca al nord-est de la Conca de Tremp. El seu cim és el Cap de Boumort.' }),
  el('serra', 'Serra del Montsec', 267, 635, { unitat: 'Prepirineu', pista: 'Llarga serra del Prepirineu que la Noguera Ribagorçana i la Pallaresa tallen en congostos.' }),
  el('serra', 'Serra de Montclús', 212, 657, { unitat: 'Prepirineu', alies: ['Montclus'], pista: 'Petita serra al sud-oest del Montsec, a tocar de la Noguera Ribagorçana.' }),
  el('serra', 'Serra de Sant Mamet', 302, 661, { unitat: 'Prepirineu', pista: 'Al sud del Montsec, a la Noguera.' }),
  el('serra', 'Serra del Cadí', 525, 482, { unitat: 'Prepirineu', alies: ['Cadi'], pista: 'Gran muralla calcària al sud de la Cerdanya; al seu sud hi ha el Pedraforca.' }),
  el('serra', 'Serra del Port del Comte', 480, 545, { unitat: 'Prepirineu', pista: 'Al nord del Solsonès; el seu cim és la Tossa Pelada.' }),
  el('serra', 'Rasos de Peguera', 590, 535, { unitat: 'Prepirineu', pista: 'Altiplà al nord-oest de Berga.' }),
  el('serra', 'Serra de Catllaràs', 642, 537, { unitat: 'Prepirineu', alies: ['Serra de Catllaras'], pista: 'Al Berguedà, entre el Llobregat i el Ripollès.' }),
  el('serra', 'Serra de Busa', 552, 602, { unitat: 'Prepirineu', pista: 'Al Solsonès, al sud de la Guàrdia.' }),
  el('serra', "Serra d'Oliana", 452, 605, { unitat: 'Prepirineu', pista: 'A l\'Alt Urgell, a l\'est del Segre.' }),
  el('serra', 'Serra del Pubill', 419, 657, { pista: 'A l\'est del Segre, al nord del Llobregós.' }),
  el('serra', 'Serra de Pinós', 505, 704, { alt: 930, pista: 'Al Solsonès, prop del centre geogràfic de Catalunya. Al mapa hi ha la cota 930.' }),
  el('serra', 'Serra de Castelltallat', 542, 730, { pista: 'Al Bages, a l\'oest del Cardener.' }),
  el('serra', 'Serra de Rubió', 550, 775, { pista: 'Al nord-oest de Montserrat, entre l\'Anoia i el Bages.' }),
  el('serra', 'Serra de Montserrat', 590, 822, {
    unitat: 'Serralada Prelitoral',
    alies: ['Montserrat'],
    pista: 'Muntanya de roques de conglomerat al costat del Llobregat. Cim: Sant Jeroni.',
  }),
  el('serra', 'Sant Llorenç del Munt', 690, 772, {
    alMapa: 'St. Llorenç del Munt',
    unitat: 'Serralada Prelitoral',
    alies: ['St Llorenç del Munt', 'Sant Llorenc del Munt'],
    pista: 'Massís entre el Bages i el Vallès. Cim: la Mola.',
  }),
  el('serra', 'Serra de Queralt', 495, 857, { pista: 'Entre l\'Anoia i la Conca de Barberà.' }),
  el('serra', 'Serra del Tallat', 385, 877, { pista: 'Entre l\'Urgell i la Conca de Barberà.' }),
  el('serra', 'Serra de la Llena', 257, 947, { pista: 'Al Priorat - les Garrigues, al nord del Montsant.' }),
  el('serra', 'Muntanyes de Prades', 355, 960, {
    alMapa: 'Munts. de Prades',
    unitat: 'Serralada Prelitoral',
    alies: ['Munts de Prades', 'Prades'],
    pista: 'Massís de la Serralada Prelitoral al nord del Camp de Tarragona. Cim: Tossal de la Baltasana.',
  }),
  el('serra', 'Serra del Montsant', 280, 982, { unitat: 'Serralada Prelitoral', pista: 'Gran cinglera al Priorat.' }),
  el('serra', 'Serra de Picarda', 112, 992, { pista: 'Al costat de l\'Ebre, a la Ribera d\'Ebre.' }),
  el('serra', 'Serra del Boix', 197, 1150, { alies: ['Serra de Cardó'], pista: 'Al Baix Ebre, amb el cim de Cardó.' }),
  el('serra', 'Ports de Beseit', 82, 1210, {
    unitat: 'Serralada Prelitoral',
    alies: ['Els Ports', 'Ports'],
    pista: 'Massís de l\'extrem sud, on es troben Catalunya, Aragó i el País Valencià. Cim: el Caro.',
  }),
  el('serra', 'Serra de Godall', 145, 1285, { alMapa: 'S. de Godall', alies: ['S de Godall'], pista: 'Al Montsià, a l\'oest de la Serra del Montsià.' }),
  el('serra', 'Serra del Montsià', 160, 1302, { alMapa: 'S. de Montsià', alies: ['Serra de Montsià', 'S de Montsia', 'Montsià'], pista: 'Al sud del delta de l\'Ebre. Cim: Torreta de Montsià.' }),
  el('serra', 'Massís del Garraf', 635, 970, { unitat: 'Serralada Litoral', alies: ['Garraf'], pista: 'Massís calcari de la Serralada Litoral, entre el Llobregat i el Penedès. Cim: la Morella.' }),
  el('serra', "Muntanyes de l'Ordal", 625, 907, { alies: ["Serra de l'Ordal", 'Ordal'], pista: 'Al nord del Garraf, a l\'oest del Llobregat.' }),
  el('serra', 'Serra de Collserola', 717, 892, { unitat: 'Serralada Litoral', alies: ['Collserola'], pista: 'Serra de la Serralada Litoral just darrere de Barcelona, entre el Llobregat i el Besòs.' }),
  el('serra', 'el Montseny', 810, 720, {
    unitat: 'Serralada Prelitoral',
    alies: ['Montseny', 'Massís del Montseny'],
    pista: 'El massís més alt de la Serralada Prelitoral. Cims: Turó de l\'Home i Matagalls.',
  }),
  el('serra', 'Massís del Montnegre', 889, 765, { unitat: 'Serralada Litoral', alies: ['Montnegre'], pista: 'Serralada Litoral, al Maresme, prop de la Tordera.' }),
  el('serra', 'Serra del Corredor', 862, 790, { unitat: 'Serralada Litoral', alies: ['Corredor'], pista: 'Serralada Litoral, al Maresme, al sud-oest del Montnegre.' }),
  el('serra', 'Massís de les Guilleries', 877, 655, { alies: ['Guilleries', 'les Guilleries'], pista: 'Entre Osona i la Selva, a l\'est de la Plana de Vic. Cim: Sant Miquel.' }),
  el('serra', 'Serra de Finestres', 902, 562, { unitat: 'Serralada Transversal', pista: 'Serra de la Serralada Transversal, entre la Garrotxa i el Gironès.' }),
  el('serra', 'Serra de Santa Magdalena', 780, 520, {
    alMapa: 'Serra de Sta. Magdalena',
    unitat: 'Serralada Transversal',
    alies: ['Serra de Sta Magdalena', 'Santa Magdalena'],
    pista: 'Serra de la Serralada Transversal, al nord del Puigsacalm.',
  }),
  el('serra', 'Serra Cavallera', 770, 477, { pista: 'Al Ripollès, a la dreta (est) de l\'etiqueta del Ter al mapa.' }),
  el('serra', 'Serra de Mogrony', 702, 472, { alMapa: 'S. de Mogrony', alies: ['S de Mogrony', 'Mogrony'], pista: 'Al Ripollès, entre el Freser i el Llobregat.' }),
  el('serra', 'Serra de Costabona', 760, 420, { alMapa: 'S. de Costabona', alies: ['S de Costabona'], pista: 'Al Ripollès, a la frontera. Cim: Costabona.' }),
  el('serra', "Serra de l'Albera", 992, 381, { alMapa: "S. de l'Albera", alies: ["S de l'Albera", 'Albera', "l'Albera"], pista: 'Serra de l\'extrem oriental del Pirineu, a la frontera de l\'Alt Empordà. Cim: Puig Neulós.' }),
  el('serra', 'Serra de Rodes', 1075, 425, { alies: ['Rodes'], pista: 'Darrere del Cap de Creus. Cim: el Peni.' }),
  el('serra', 'Serra dels Àngels', 995, 602, { alies: ['Serra dels Angels', 'Àngels'], pista: 'Al Gironès, al nord-oest de les Gavarres.' }),
  el('serra', 'Massís de les Gavarres', 1045, 657, { alies: ['Gavarres', 'les Gavarres'], pista: 'Al Baix Empordà, entre Girona i la costa. Cim: Puig d\'Arques.' }),
];

/* ------------------------------------------------------------------ */
/* PLANES, CONQUES I VALLS                                             */
/* ------------------------------------------------------------------ */
const planes: Element[] = [
  el('plana', "Vall d'Aran", 245, 272, { alies: ['Aran', 'la Vall d\'Aran'], pista: 'L\'única vall catalana de la vessant atlàntica: la recorre la Garona.' }),
  el('plana', 'Conca de Tremp', 307, 550, { unitat: 'Prepirineu', alies: ['Tremp'], pista: 'Conca prepirinenca entre el Boumort i el Montsec, al Pallars Jussà.' }),
  el('plana', "Plana d'Urgell", 310, 797, { unitat: 'Depressió Central', alies: ['Urgell'], pista: 'Plana de regadiu de la Depressió Central, regada pel Canal d\'Urgell.' }),
  el('plana', 'Plana de Vic', 760, 645, { unitat: 'Depressió Central', alies: ['Vic'], pista: 'Plana d\'Osona, a l\'extrem nord-est de la Depressió Central.' }),
  el('plana', 'Pla de Bages', 610, 747, { unitat: 'Depressió Central', alies: ['Bages'], pista: 'Plana on s\'ajunten el Cardener i el Llobregat (Manresa).' }),
  el('plana', "Conca d'Òdena", 525, 820, { unitat: 'Depressió Central', alies: ["Conca d'Odena", 'Òdena'], pista: 'Plana de l\'Anoia (Igualada).' }),
  el('plana', 'Conca de Barberà', 422, 917, { unitat: 'Depressió Central', alies: ['Barberà'], pista: 'Conca de la Depressió Central, al nord de les Muntanyes de Prades.' }),
  el('plana', 'Camp de Tarragona', 372, 1032, { unitat: 'Depressió Prelitoral', alies: ['Camp'], pista: 'Plana costanera entre la Serralada Prelitoral i el mar, regada pel Francolí.' }),
  el('plana', 'Terra Alta', 122, 1065, { pista: 'Altiplà a l\'oest de l\'Ebre, a tocar d\'Aragó.' }),
  el('plana', 'Cubeta de Móra', 195, 1072, { alies: ['Cubeta de Mora', 'Móra'], pista: 'Depressió travessada per l\'Ebre, a la Ribera d\'Ebre.' }),
  el('plana', "Plana de l'Empordà", 1035, 470, { alMapa: "PLANA DE L'EMPORDA", alies: ["Plana de l'Emporda", 'Empordà'], pista: 'Gran plana al nord-est, regada per la Muga i el Fluvià, oberta al Golf de Roses.' }),
  el('plana', "Plana d'Ancosa", 497, 917, { alies: ['Ancosa'], pista: 'Altiplà entre l\'Anoia, l\'Alt Penedès i l\'Alt Camp.' }),
];

/* ------------------------------------------------------------------ */
/* RIUS I RIERES                                                       */
/* ------------------------------------------------------------------ */
const rius: Element[] = [
  el('riu', 'la Garona', 200, 272, { alies: ['Garona'], mar: 'Atlàntic', pista: 'L\'únic riu català que va a l\'oceà Atlàntic: neix a la Vall d\'Aran i passa per França.' }),
  el('riu', 'la Noguera Ribagorçana', 200, 550, {
    extra: [[180, 725], [205, 640]],
    alies: ['Noguera Ribagorçana', 'Noguera Ribagorcana'],
    afluentDe: 'el Segre',
    pista: 'Fa de frontera amb Aragó a l\'oest i desemboca al Segre.',
  }),
  el('riu', 'el Flamicell', 289, 445, { alies: ['Flamicell'], afluentDe: 'la Noguera Pallaresa', pista: 'Riu de la Vall Fosca, que s\'uneix a la Noguera Pallaresa a la Conca de Tremp.' }),
  el('riu', 'la Noguera Pallaresa', 337, 460, { alies: ['Noguera Pallaresa'], afluentDe: 'el Segre', pista: 'Neix al Pla de Beret i travessa el Pallars de nord a sud fins al Segre.' }),
  el('riu', 'la Valira', 452, 432, { alies: ['Valira', 'Gran Valira'], afluentDe: 'el Segre', pista: 'Riu que baixa d\'Andorra i s\'uneix al Segre a la Seu d\'Urgell.' }),
  el('riu', 'el Segre', 432, 472, {
    extra: [[382, 647], [137, 850], [400, 560]],
    alies: ['Segre'],
    afluentDe: "l'Ebre",
    pista: 'El gran afluent català de l\'Ebre: neix a la Cerdanya (França) i passa per la Seu d\'Urgell i Lleida.',
  }),
  el('riu', 'el Rialb', 367, 600, { alies: ['Rialb', 'Riu Rialb'], afluentDe: 'el Segre', pista: 'Afluent del Segre, a la Noguera.' }),
  el('riu', 'el Llobregós', 415, 700, { alies: ['Llobregos'], afluentDe: 'el Segre', pista: 'Afluent del Segre que travessa la Segarra i la Noguera.' }),
  el('riu', 'Riu de Farfanya', 212, 720, { alies: ['Farfanya'], afluentDe: 'el Segre', pista: 'Riu de la Noguera que desemboca al Segre.' }),
  el('riu', "Riu d'Ondara", 300, 767, { alies: ['Ondara'], pista: 'Riu de la Segarra i l\'Urgell (Tàrrega).' }),
  el('riu', 'Riu Corb', 257, 785, { extra: [[380, 852]], alies: ['Corb'], afluentDe: 'el Segre', pista: 'Riu de l\'Urgell i el Pla d\'Urgell, afluent del Segre.' }),
  el('riu', 'Riu de Set', 195, 880, { alies: ['Set'], afluentDe: 'el Segre', pista: 'Riu de les Garrigues, afluent del Segre.' }),
  el('riu', 'Cinca', 72, 865, { alies: ['el Cinca', 'Riu Cinca'], afluentDe: 'el Segre', pista: 'Riu d\'Aragó que s\'uneix al Segre just abans de l\'Ebre.' }),
  el('riu', "l'Ebre", 92, 952, {
    extra: [[180, 1180], [150, 1060]],
    alies: ['Ebre', 'Riu Ebre'],
    mar: 'Mediterrani',
    pista: 'El riu més cabalós de la península; arriba de l\'Aragó i forma el Delta de l\'Ebre.',
  }),
  el('riu', 'Riu de Montsant', 272, 960, { alies: ['Montsant'], afluentDe: 'Riu de Siurana', pista: 'Riu del Priorat que s\'uneix al Siurana.' }),
  el('riu', 'Riu de la Torre', 190, 1015, { alies: ['Torre'], pista: 'Riu de la Ribera d\'Ebre, al nord de la Cubeta de Móra.' }),
  el('riu', 'Riu de Siurana', 227, 1037, { alies: ['Siurana'], afluentDe: "l'Ebre", pista: 'Riu del Priorat, afluent de l\'Ebre.' }),
  el('riu', 'Riera de Maspujols', 337, 1047, { alies: ['Maspujols'], pista: 'Riera del Baix Camp (Camp de Tarragona).' }),
  el('riu', 'el Francolí', 415, 1025, { alies: ['Francoli'], mar: 'Mediterrani', pista: 'Riu de la Conca de Barberà i el Camp de Tarragona; desemboca a Tarragona.' }),
  el('riu', 'el Gaià', 457, 967, { alies: ['Gaia'], mar: 'Mediterrani', pista: 'Riu entre el Francolí i el Foix; desemboca a prop de Tarragona (Altafulla).' }),
  el('riu', 'el Foix', 545, 967, { alies: ['Foix'], mar: 'Mediterrani', pista: 'Riu del Penedès; desemboca a Cubelles.' }),
  el('riu', "Riu d'Algars", 32, 1095, { alies: ['Algars'], pista: 'Fa de límit amb Aragó a la Terra Alta.' }),
  el('riu', 'Riu Canaleta', 90, 1135, { alies: ['Canaleta'], pista: 'Riu que baixa dels Ports cap a l\'Ebre, al Baix Ebre - Terra Alta.' }),
  el('riu', 'Riu de la Sénia', 75, 1305, { alies: ['Sénia', 'la Sénia', 'Riu de la Senia'], mar: 'Mediterrani', pista: 'Fa de límit entre Catalunya i el País Valencià.' }),
  el('riu', 'Riu de la Llosa', 551, 430, {
    alies: ['la Llosa', 'Llosa'],
    pista: 'Riu de la Cerdanya, entre la Tossa Plana de Lles i el Puig Pedròs.',
    dubte: 'El nom és vertical i petit a la foto: es llegeix «Riu de la Llosa». Comprova-ho al llibre.',
  }),
  el('riu', 'Riu Negre', 540, 650, { alies: ['Negre'], afluentDe: 'el Cardener', pista: 'Afluent del Cardener, al Solsonès.' }),
  el('riu', 'el Cardener', 580, 700, { alies: ['Cardener'], afluentDe: 'el Llobregat', pista: 'Principal afluent del Llobregat: passa per Cardona i Manresa.' }),
  el('riu', 'el Llobregat', 615, 665, {
    extra: [[682, 920], [640, 800]],
    alies: ['Llobregat'],
    mar: 'Mediterrani',
    pista: 'Neix a Castellar de n\'Hug, passa per Montserrat i forma el Delta del Llobregat.',
  }),
  el('riu', 'la Gavarresa', 652, 690, { alies: ['Gavarresa'], afluentDe: 'el Llobregat', pista: 'Afluent del Llobregat pel Lluçanès i el Bages.' }),
  el('riu', 'Riera de Merlès', 665, 615, { alies: ['Merlès', 'Merles'], afluentDe: 'el Llobregat', pista: 'Riera del Lluçanès, afluent del Llobregat.' }),
  el('riu', 'Riera de Tenes', 740, 755, { alies: ['Tenes'], afluentDe: 'el Besòs', pista: 'Riera del Vallès, afluent del Besòs.' }),
  el('riu', 'el Congost', 775, 765, { alies: ['Congost'], afluentDe: 'el Besòs', pista: 'Riu que baixa de la Plana de Vic cap al Vallès i forma el Besòs.' }),
  el('riu', 'el Mogent', 770, 817, { alies: ['Mogent'], afluentDe: 'el Besòs', pista: 'Riu del Vallès Oriental que forma el Besòs.' }),
  el('riu', 'el Besòs', 742, 860, { alies: ['Besos'], mar: 'Mediterrani', pista: 'Desemboca al nord de Barcelona, a Sant Adrià de Besòs.' }),
  el('riu', 'el Freser', 715, 447, { alies: ['Freser'], afluentDe: 'el Ter', pista: 'Riu del Ripollès que s\'uneix al Ter a Ripoll.' }),
  el('riu', 'el Ter', 740, 502, {
    extra: [[1062, 562], [900, 610]],
    alies: ['Ter'],
    mar: 'Mediterrani',
    pista: 'Neix al Ripollès, passa per Ripoll, Girona i desemboca a l\'Estartit.',
  }),
  el('riu', 'la Muga', 995, 432, { alies: ['Muga'], mar: 'Mediterrani', pista: 'Riu de l\'Alt Empordà que desemboca al Golf de Roses.' }),
  el('riu', 'el Manol', 955, 480, { alies: ['Manol'], afluentDe: 'la Muga', pista: 'Afluent de la Muga, a l\'Alt Empordà.' }),
  el('riu', 'el Fluvià', 1015, 505, { alies: ['Fluvia'], mar: 'Mediterrani', pista: 'Riu de la Garrotxa i l\'Empordà que desemboca al Golf de Roses.' }),
  el('riu', 'el Daró', 1075, 595, { alies: ['Daro'], pista: 'Riu del Baix Empordà, entre el Ter i les Gavarres.' }),
  el('riu', "l'Onyar", 935, 662, { alies: ['Onyar'], afluentDe: 'el Ter', pista: 'Riu que travessa Girona i s\'uneix al Ter.' }),
  el('riu', 'la Tordera', 925, 735, { alies: ['Tordera'], mar: 'Mediterrani', pista: 'Neix al Montseny i desemboca entre Blanes i Malgrat.' }),
];

/* ------------------------------------------------------------------ */
/* CANALS I ESTANYS                                                    */
/* ------------------------------------------------------------------ */
const aigues: Element[] = [
  el('canal', "Canal d'Urgell", 222, 860, { pista: 'Canal de reg que porta aigua del Segre a la Plana d\'Urgell.' }),
  el('canal', "Canal d'Aragó i Catalunya", 105, 812, { extra: [[90, 870], [125, 780]], alies: ["Canal d'Arago i Catalunya"], pista: 'Canal de reg a l\'extrem oest, al llarg del límit amb Aragó.' }),
  el('estany', 'Estany de Sant Maurici', 365, 340, { alies: ['Sant Maurici'], pista: 'Estany del Parc Nacional d\'Aigüestortes, al Pallars Sobirà.' }),
  el('estany', 'Estany de Banyoles', 945, 545, { alies: ['Banyoles', 'Llac de Banyoles'], pista: 'El llac natural més gran de Catalunya, al Pla de l\'Estany.' }),
];

/* ------------------------------------------------------------------ */
/* COSTA                                                               */
/* ------------------------------------------------------------------ */
const costa: Element[] = [
  el('costa', 'Cap de Creus', 1135, 428, { precisio: 'exacta', pista: 'El punt més oriental de Catalunya i de la península Ibèrica.' }),
  el('costa', 'Cap de Norfeu', 1122, 460, { precisio: 'exacta', pista: 'Al nord del Golf de Roses, al sud del Cap de Creus.' }),
  el('costa', 'Golf de Roses', 1095, 500, { r: 38, pista: 'Gran badia de l\'Empordà, on desemboquen la Muga i el Fluvià.' }),
  el('costa', "Cap d'Oltrera", 1108, 557, {
    precisio: 'exacta',
    pista: 'Just a l\'est del Montgrí, al sud del Golf de Roses.',
    dubte: 'Al mapa es llegeix «Cap d\'Oltrera». Comprova l\'ortografia al llibre.',
  }),
  el('costa', 'Cap de Begur', 1122, 612, { precisio: 'exacta', pista: 'Cap del Baix Empordà, a l\'est de les Gavarres.' }),
  el('costa', 'Punta del Molí', 1085, 678, { precisio: 'exacta', alies: ['Punta del Moli'], pista: 'Al sud del Cap de Begur, a la Costa Brava.' }),
  el('costa', 'Punta de la Tordera', 972, 757, { pista: 'A la desembocadura de la Tordera (Blanes - Malgrat).' }),
  el('costa', 'Punta Ferrosa', 628, 985, { precisio: 'exacta', pista: 'A la costa del Garraf.' }),
  el('costa', 'Delta del Llobregat', 725, 950, { pista: 'Delta al sud de Barcelona, on hi ha l\'aeroport del Prat.' }),
  el('costa', 'Cap de Salou', 388, 1080, { precisio: 'exacta', pista: 'Al sud del Camp de Tarragona.' }),
  el('costa', 'Punta de Cala Bea', 302, 1118, { precisio: 'exacta', pista: 'Al Baix Ebre, entre el Cap de Salou i el delta.' }),
  el('costa', 'Punta del Fangar', 240, 1222, { precisio: 'exacta', pista: 'La fletxa de sorra del nord del Delta de l\'Ebre.' }),
  el('costa', "Delta de l'Ebre", 232, 1257, { r: 40, pista: 'Gran delta format per l\'Ebre en arribar al mar.' }),
  el('costa', 'Cap de Tortosa', 285, 1255, { precisio: 'exacta', pista: 'L\'extrem més oriental del Delta de l\'Ebre.' }),
  el('costa', 'Punta del Galatxo', 200, 1318, {
    alies: ['Punta del Galacho'],
    pista: 'Al sud del Delta de l\'Ebre.',
    dubte: 'La posició és aproximada: al mapa l\'etiqueta queda al costat de l\'hemidelta sud. Comprova on assenyala el llibre.',
  }),
];

/* ------------------------------------------------------------------ */
/* TERRITORIS VEÏNS I MAR                                              */
/* ------------------------------------------------------------------ */
const territoris: Element[] = [
  el('territori', 'França', 600, 180, { alies: ['Franca'], pista: 'Al nord, a l\'altra banda del Pirineu.' }),
  el('territori', 'Andorra', 500, 347, { pista: 'Petit país al nord, entre el Pallars i la Cerdanya.' }),
  el('territori', 'Aragó', 100, 530, { alies: ['Arago'], pista: 'A l\'oest de Catalunya.' }),
  el('territori', 'Comunitat Valenciana', 82, 1365, { alies: ['País Valencià'], pista: 'Al sud, a l\'altra banda del riu de la Sénia.' }),
  el('territori', 'Mar Mediterrània', 745, 1275, { r: 220, alies: ['Mediterrani', 'Mar Mediterrani', 'Mediterrània'], pista: 'Banya tota la costa de Catalunya, a l\'est i al sud.' }),
];

export const ELEMENTS: Element[] = [...unitats, ...cims, ...serres, ...planes, ...rius, ...aigues, ...costa, ...territoris];

export const PER_ID: Record<string, Element> = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));
