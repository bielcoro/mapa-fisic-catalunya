# Mapa físic de Catalunya · Estudia jugant

Web interactiva per estudiar **tots els noms del mapa físic de Catalunya** (Geografia, 2n de batxillerat).
Funciona al navegador, sense comptes ni servidor: el progrés es guarda amb `localStorage`.

## Com iniciar-la

Cal tenir instal·lat [Node.js](https://nodejs.org) (versió 18 o superior).

```bash
npm install      # només la primera vegada
npm run dev      # obre http://localhost:5173
```

Altres ordres:

```bash
npm run build    # genera la versió final a dist/ (es pot obrir amb qualsevol servidor estàtic)
npm run preview  # serveix la versió de dist/
npm test         # proves de la lògica (correcció de respostes, dades, preguntes)
```

## Què hi ha

| Mode | Què fas |
| --- | --- |
| 🗺️ **Explora** | Mapa original amb un punt per a cada element, fitxa d'informació i cercador. |
| 🃏 **Targetes** | Ubicació → nom o nom → ubicació. Marques «Me'l sé» o «He de repassar-lo». |
| 📍 **Localitza el nom** (A) | El mapa (sense noms) assenyala un lloc i tries o escrius el nom. Els fallats tornen a sortir. |
| 🎯 **On és?** (B) | Et donem el nom i fas clic al mapa. Et diu si t'has desviat al nord, sud, est o oest i a quants km. |
| ❓ **Test** (C) | Quatre opcions: identificar elements, quin és un cim, quin és més al nord, quin cim és més alt, quin riu desemboca al Mediterrani, de quin riu és afluent, a quina unitat de relleu pertany... |
| ✍️ **Escriu el nom** (D) | Escrius el nom; s'accepten respostes sense accents, majúscules/minúscules i sense article. Marca paraula per paraula què està malament. |
| 🎓 **Repte d'examen** (F) | Preguntes barrejades sense pistes ni correcció fins al final. Nota sobre 10, percentatge, llista de fallades i opció de repetir només les incorrectes. |
| 🔁 **Repàs d'errors** (G) | Només els noms que més falles, ordenats per dificultat. Els errors també es prioritzen a la resta de modes. |
| 📋 **Llista** | Tots els noms per tipus (imprimible) i la llista de **dubtes de lectura**. |
| 🛠️ **Editor** | Per corregir manualment la ubicació de qualsevol element (exportable/importable en JSON). |

El panell d'inici mostra el total de noms, els que ja domines, els pendents, el percentatge de progrés, la millor nota d'examen, els elements que et costen més i el temps d'estudi. També permet continuar on ho havies deixat i reiniciar el progrés.

## Com s'ha fet el mapa

- **Mapa base**: la imatge original (`public/mapa.jpg`), girada a vertical. Totes les coordenades són píxels d'aquesta imatge (1200 × 1600) dins d'un `<svg>` amb `viewBox`, per això els punts queden ben situats a qualsevol mida de pantalla, amb zoom i desplaçament.
- **Mapa sense noms** (`public/mapa-sense-etiquetes.jpg`): generat amb `scripts/generar_mapa_sense_etiquetes.py`, que esborra el text i en conserva el relleu. S'usa en els exercicis perquè els noms no donin la resposta.
- **Dades**: `src/data/elements.ts` conté els 179 noms llegits del mapa, classificats per tipus (grans unitats de relleu, cims, serres i massissos, planes i conques, rius i rieres, canals, estanys, elements de costa, territoris veïns i mar), amb altitud, pista i, quan és segur, el riu del qual és afluent o la unitat de relleu.
- **Precisió**: els cims es situen al triangle ▲ del mapa; serres, rius, planes i unitats, a la posició de la seva etiqueta (amb un marge d'acceptació més gran i, per als rius i unitats que surten en diversos llocs, diversos punts vàlids).
- **Dubtes**: els noms o xifres que no es llegeixen amb claredat a la foto estan marcats amb ⚠️ i llistats a l'apartat *Llista*.

## Estructura

```
src/
  data/        elements del mapa i tipus
  lib/         lògica: correcció de text, geometria dels clics, generador de preguntes, progrés (localStorage)
  components/  mapa interactiu, marcadors i preguntes reutilitzables
  modes/       cada mode de joc
scripts/       proves i generació del mapa sense noms
```

Tecnologia: React + TypeScript + Vite, sense cap altra dependència.
