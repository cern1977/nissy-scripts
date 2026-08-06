# nissy-scripts — Claude-kontekst

NISSY-bookmarklets for OUS / Pasientreiser. Hver bookmarklet er en JS-fil som lastes inn i nettleseren via `eval(fetch(...))`. Filer i dette repoet deployes automatisk til `https://thomaswestby.no/skript/` via GitHub Actions ved merge til `main`.

## Skriptene

| Skript | Repo-fil | Server-fil | Versjon-konst | Deploy-skill |
|---|---|---|---|---|
| **Bestiller** | `bestiller/bestiller.js` (+`_dev.js`) | `/skript/bestiller.js` | `const VERSION = '5.X'` | `/deploy-bestiller` |
| **Overvåker Avvik** | `overvaker-avvik/overvaaker_avvik.js` (+`_dev.js`) | `/skript/overvaaker_avvik.js` | `const VERSION = '38.4.X'` | `/deploy-avvik` |
| **Overvåker Live** | `overvaker-live/overvaaker_live.js` (+`_dev.js`) | `/skript/overvaaker_live.js` | `const VERSJON_FULL = '6.X.X'` | `/deploy-live` |
| **Verktøyhylle** | `toolshed.js` | `/skript/toolshed.js` | `var VERSJON = '1.X'` | `/deploy-toolshed` |
| **Samkjører** | `samkjorer.js` | `/skript/samkjorer.js` | `const VERSION = '4.X.X'` | *(ikke automatisert)* |
| **Verktøykasse** | `verktoykasse.js` | `/skript/verktoykasse.js` | `const VERSJON = '1.X'` | *(ikke automatisert)* |

## Konvensjoner

- **Dev/prod-split**: Skriptene som er ofte i bruk (avvik, live, bestiller) har egne `_dev.js`-filer i en undermappe. De som er sjeldnere brukt (toolshed, samkjorer, verktoykasse) har kun prod på rotnivå.
- **Bump-regel**: Alltid bump versjon ved endring. Én og én — aldri batch-bump (5.6 → 5.9 i ett steg er forbudt).
- **Header-changelog**: Toppen av hver fil har en kommentar-blokk med en linje per versjon. Legg til ny linje ved bump.
- **Auto-deploy**: GitHub Actions trigges på push til `main` når en relevant fil endres. Workflow SCP-er til server + verifiserer via curl. Sjekk `https://github.com/cern1977/nissy-scripts/actions`.
- **Cache-bust**: Server bruker Varnish (opptil 2 min cache). Bruk `?cb=$(date +%s)` ved manuell verifisering.

## Bestiller — sesjonslogg (fra v5.6-dev)

`bestiller_dev.js` POSTer JSON til `https://thomaswestby.no/OUS/sesjoner.php` (PHP i `cern1977/OUS-backend`-repo) ved:
- `sesjon_start` (når panelet initialiseres)
- `bestilling` (hver gang en ressurs dispatch-es)
- `sesjon_stopp` (lukk-knapp)
- `sesjon_unload` (`beforeunload` via `sendBeacon`)

Felter som sendes: `session_id` (persistent UUID i localStorage), `bruker`, `versjon`, `timestamp`, `hendelse`, `bestilt_total`, evt. `rid`/`filter`.

Prod-fila (`bestiller.js`) sender **ikke** logg ennå — kun dev. Promo til prod krever Thomas-bekreftelse.

## Branch-policy

- `main` = prod (auto-deployes)
- Claude-sesjoner får tildelt en `claude/<beskrivelse>`-branch per oppgave
- Endringer går via PR — branchen slettes etter merge
- Ingen separat `dev`-branch (dev/prod-skille håndteres via filnavn, ikke branches)

## Eksterne deps

- **Server SSH**: `czvnsicn5_ssh@ssh.czvnsicn5.service.one` (passord lagret som GitHub-secret `SERVER_SSH_PASSWORD`)
- **Backend**: `cern1977/OUS-backend` (PHP-endepunkter, inkl. `sesjoner.php`)
- **Avtalesky**: `cern1977/Avtalesky` (separat prosjekt)
