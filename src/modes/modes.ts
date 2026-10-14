export interface InfoMode {
  id: string;
  nom: string;
  curt: string;
  icona: string;
  desc: string;
  /** Apareix a la graella de jocs de l'inici */
  joc?: boolean;
}

export const MODES: InfoMode[] = [
  { id: 'inici', nom: 'Inici', curt: 'Inici', icona: '🏠', desc: 'Panell de progrés' },
  { id: 'explora', nom: 'Explora el mapa', curt: 'Explora', icona: '🗺️', desc: 'Estudia el mapa amb tots els punts i fitxes.', joc: true },
  { id: 'targetes', nom: 'Targetes', curt: 'Targetes', icona: '🃏', desc: 'Memoritza amb targetes: me\'l sé / he de repassar-lo.', joc: true },
  { id: 'localitza', nom: 'Localitza el nom', curt: 'Localitza', icona: '📍', desc: 'El mapa assenyala un lloc: digues quin és.', joc: true },
  { id: 'ones', nom: 'On és?', curt: 'On és?', icona: '🎯', desc: 'Et donem el nom: fes clic on és al mapa.', joc: true },
  { id: 'test', nom: 'Preguntes tipus test', curt: 'Test', icona: '❓', desc: 'Quatre opcions: cims, rius, direccions, altituds...', joc: true },
  { id: 'escriu', nom: 'Escriu el nom', curt: 'Escriu', icona: '✍️', desc: 'Escriu el nom correcte, amb correcció paraula per paraula.', joc: true },
  { id: 'examen', nom: "Repte d'examen", curt: 'Examen', icona: '🎓', desc: 'Simulació d\'examen sense pistes. Nota sobre 10.', joc: true },
  { id: 'repas', nom: "Repàs d'errors", curt: 'Repàs', icona: '🔁', desc: 'Practica només els noms que més et costen.', joc: true },
  { id: 'llista', nom: 'Llista de noms', curt: 'Llista', icona: '📋', desc: 'Tots els noms per tipus i dubtes de lectura.' },
  { id: 'editor', nom: "Editor d'ubicacions", curt: 'Editor', icona: '🛠️', desc: 'Corregeix on és cada element.' },
];

export function formatTemps(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(ss).padStart(2, '0')}`;
}
