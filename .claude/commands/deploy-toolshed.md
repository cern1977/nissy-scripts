# /deploy-toolshed — Bump + deploy + git-push for Verktøyhylle

Hele deploy-rutinen i én kommando. Repoet `~/Developer/nissy-scripts/` er kanonisk arbeidsplass — master-fila `toolshed.js` (og senere `toolshed_dev.js`) redigeres direkte her, og git tar vare på historikken.

> ⚠️ **Verktøyhylle-regel:** Verktøyhylle har (foreløpig) bare prod-fila — dev-løypa er reservert i skillen, men `toolshed_dev.js` er ikke etablert ennå. Inntil videre går alle deploys rett til prod, og endringen treffer alle brukere umiddelbart. Bekreft alltid med Thomas først.

## Når brukes

Hver gang en kode-endring i `toolshed.js` (evt. `toolshed_dev.js` når dev-løypa er på plass) er ferdig og skal pushes til server + commits til git.

## Filer og stier (må matche nøyaktig)

- **Master prod:** `~/Developer/nissy-scripts/toolshed.js`
- **Master dev:** `~/Developer/nissy-scripts/toolshed_dev.js` *(ikke opprettet ennå)*
- **Server SSH:** `czvnsicn5_ssh@ssh.czvnsicn5.service.one` passord `Hercules2026`
- **Server prod-fil:** `~/webroots/by-route/thomaswestby.no_/skript/toolshed.js`
- **Server dev-fil:** `~/webroots/by-route/thomaswestby.no_/skript/toolshed_dev.js` *(ikke opprettet ennå)*
- **GitHub-repo:** `cern1977/nissy-scripts` (origin, branch `main`)
- **Dagslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/YYYY-MM-DD.md`
- **Endringslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/ENDRINGSLOGG.md`

## Obligatoriske steg (ikke hopp over noen)

### Steg 1 — Bekreft endring med Thomas

Spør Thomas:
- **«Hva har du endret?»** (én setning til commit-melding + dagslogg)
- Hvis `dev` i args → STOPP og varsle: dev-fila er ikke etablert ennå (se «Fremtidig: dev-løype» nederst)
- Ellers → prod-deploy bekreftes (alle brukere får endringen umiddelbart — vær eksplisitt om det)

Ikke fortsett uten svar.

### Steg 2 — Finn gjeldende versjon

Les `var VERSJON`-linjen nær toppen av `~/Developer/nissy-scripts/toolshed.js`:
```
var VERSJON = '1.N';
```

Parse N. Neste versjon = N+1. Hopp aldri mer enn ett hakk.

(NB: `toolshed.json` på serveren kan også ha et `versjon`-felt som overstyrer JS-konstanten i UI-et. Hvis det settes der, hold fila i sync — ellers er JS-konstanten kilden.)

### Steg 3 — Bump versjon i master-fil

Endre `'1.N'` → `'1.(N+1)'` i `~/Developer/nissy-scripts/toolshed.js`.

### Steg 4 — Push til server (prod)

```bash
sshpass -p 'Hercules2026' ssh -o StrictHostKeyChecking=no \
  czvnsicn5_ssh@ssh.czvnsicn5.service.one \
  "cat > ~/webroots/by-route/thomaswestby.no_/skript/toolshed.js" \
  < ~/Developer/nissy-scripts/toolshed.js
```

**Verifiser** med curl + grep (cache-bust):
```bash
curl -s "https://thomaswestby.no/skript/toolshed.js?cb=$(date +%s)" | head -25 | grep "var VERSJON"
```

Skal vise nøyaktig den versjonen du pushet.

### Steg 5 — Commit + push til GitHub

```bash
cd ~/Developer/nissy-scripts/
git add toolshed.js
git commit -m "Verktøyhylle v1.N: <kort beskrivelse fra steg 1>"
git push origin main
```

Hvis push feiler: vis feilmelding rått, ikke retry blindt.

### Steg 6 — Oppdater dagslogg

Fil: `docs/YYYY-MM-DD.md` (dagens dato).

Hvis fila finnes: legg til en linje under «Verktøyhylle»-seksjonen med versjon + endring.

Hvis fila mangler: opprett med mal fra `/rapport`-skillen.

Linje-format:
```
- **v1.N** — [kort beskrivelse fra steg 1]
```

### Steg 7 — Oppdater endringslogg

Legg til øverst i `docs/ENDRINGSLOGG.md`:
```
## Verktøyhylle v1.N (YYYY-MM-DD)

- [beskrivelse fra steg 1]
```

(Inntil dev-løypa er på plass logges hver deploy i endringsloggen, siden det er en prod-deploy.)

### Steg 8 — Rapporter til Thomas

Én kort oppsummering:
```
✅ v1.N deployet (prod)
- Repo: commit + push til cern1977/nissy-scripts (main)
- Server: toolshed.js (v1.N bekreftet via curl)
- Dagslogg: docs/YYYY-MM-DD.md oppdatert
- Endringslogg oppdatert
```

## Feilhåndtering

- **Hvis SSH feiler:** Vis feilmeldingen rått, ikke retry blindt
- **Hvis curl-verifisering viser feil versjon:** Varsel Thomas om cache-problem på server (Varnish kan ta inntil 2 min — bruk cache-bust-parameter `?cb=$(date +%s)`)
- **Hvis git push feiler (ikke fast-forward o.l.):** STOPP, vis status, spør Thomas
- **Hvis Thomas ikke svarer på «hva endret du?»:** STOPP, ikke anta noe
- **Hvis `dev` brukes som argument:** STOPP — dev-løypa er ikke etablert ennå

## Hva skillen eksplisitt FORBYR

- Batch-bump av flere versjoner («1.1 → 1.4 på én gang») — én og én
- Push til server uten å committe til git
- Push uten dagslogg-oppføring
- `--no-verify` eller `git push --force` uten Thomas' eksplisitte bestilling
- Hoppe over GitHub-push selv om server-push lykkes
- Bruke `dev`-argumentet før `toolshed_dev.js` finnes på master + server

## Argumenter

- `/deploy-toolshed` (ingen args) — prod-bump + push prod til server + commit/push til git *(eneste fungerende modus inntil dev-løypa er på plass)*
- `/deploy-toolshed prod` — eksplisitt prod-deploy (samme som default inntil dev-løypa finnes; senere blir dette prod-promotering fra dev)
- `/deploy-toolshed dev` — *(reservert)* dev-bump + push dev til server. Krever at `toolshed_dev.js` er etablert
- `/deploy-toolshed dry` — vis hva som VILLE skjedd uten å pushe (til debug)

## Fremtidig: dev-løype

Når Verktøyhylle skal få egen dev-fil:

1. Kopier `toolshed.js` → `toolshed_dev.js` i repoet
2. Bytt `var VERSJON = '1.N';` til `'1.N-dev'` i dev-fila
3. Endre eventuelle interne referanser (loader-URL, `__westby_toolshed_init`-flagg etc.) så dev og prod ikke kolliderer hvis begge lastes
4. Etabler dev-fila på serveren første gang manuelt
5. Endre denne skillen til samme mønster som `/deploy-live`:
   - Default `/deploy-toolshed` = dev-bump + push dev
   - `/deploy-toolshed prod` = transformer dev til prod (`-dev` strippes), push begge, eksplisitt bekreftelse fra Thomas
