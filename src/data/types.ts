/** Mida de la imatge base (public/mapa.jpg), en píxels. Totes les coordenades hi fan referència. */
export const MAP_W = 1200;
export const MAP_H = 1600;

/** Escala gràfica del mapa: el segment 0–25 km fa ~106 px a la imatge original. */
export const PX_PER_KM = 106 / 25;

export type Tipus =
  | 'cim'
  | 'serra'
  | 'unitat'
  | 'plana'
  | 'riu'
  | 'canal'
  | 'estany'
  | 'costa'
  | 'territori';

export type Unitat =
  | 'Pirineu axial'
  | 'Prepirineu'
  | 'Serralada Transversal'
  | 'Depressió Central'
  | 'Serralada Prelitoral'
  | 'Depressió Prelitoral'
  | 'Serralada Litoral';

export type Punt = [number, number];

export interface Element {
  id: string;
  /** Nom exactament com s'ha d'estudiar (forma completa) */
  nom: string;
  /** Com apareix escrit al mapa, si és diferent (abreviatures, etc.) */
  alMapa?: string;
  /** Altres formes acceptades a les respostes escrites */
  alies?: string[];
  tipus: Tipus;
  /** Punt principal, en píxels de la imatge (x, y) */
  p: Punt;
  /** Altres punts vàlids (rius o unitats que apareixen en més d'un lloc del mapa) */
  extra?: Punt[];
  /** Radi d'acceptació (px de la imatge). Si no n'hi ha, s'usa el del tipus. */
  r?: number;
  /** Altitud en metres, tal com surt al mapa */
  alt?: number;
  /**
   * Precisió de la ubicació:
   *  - 'exacta': hi ha un triangle ▲ al mapa (cims) o un accident costaner clar.
   *  - 'etiqueta': es pren el lloc on hi ha escrit el nom (serres, rius, planes...).
   */
  precisio: 'exacta' | 'etiqueta';
  /** Pista per recordar-lo */
  pista?: string;
  /** Dubte de lectura o de ubicació que l'usuari hauria de revisar */
  dubte?: string;
  /** Riu del qual és afluent (només quan és segur) */
  afluentDe?: string;
  /** Desembocadura directa al mar (només quan és segur) */
  mar?: 'Mediterrani' | 'Atlàntic';
  /** Gran unitat de relleu (només quan és segur) */
  unitat?: Unitat;
}

export const TIPUS_INFO: Record<Tipus, { nom: string; plural: string; icona: string; radi: number; color: string }> = {
  cim: { nom: 'Cim', plural: 'Cims', icona: '▲', radi: 26, color: '#b4541a' },
  serra: { nom: 'Serra o massís', plural: 'Serres i massissos', icona: '⛰', radi: 48, color: '#8a5a2b' },
  unitat: { nom: 'Gran unitat de relleu', plural: 'Grans unitats de relleu', icona: '🗺', radi: 110, color: '#6b4fa0' },
  plana: { nom: 'Plana, conca o depressió', plural: 'Planes, conques i valls', icona: '◼', radi: 50, color: '#5d8a2e' },
  riu: { nom: 'Riu o riera', plural: 'Rius i rieres', icona: '〰', radi: 36, color: '#1f6fb2' },
  canal: { nom: 'Canal', plural: 'Canals', icona: '═', radi: 40, color: '#2b8c9e' },
  estany: { nom: 'Estany', plural: 'Estanys', icona: '◉', radi: 30, color: '#2e86c1' },
  costa: { nom: 'Element de la costa', plural: 'Costa: caps, puntes, golfs i deltes', icona: '⚓', radi: 30, color: '#0e7c86' },
  territori: { nom: 'Territori o mar veí', plural: 'Territoris i mar', icona: '🧭', radi: 140, color: '#5f6b7a' },
};

export const ORDRE_TIPUS: Tipus[] = ['unitat', 'cim', 'serra', 'plana', 'riu', 'canal', 'estany', 'costa', 'territori'];
