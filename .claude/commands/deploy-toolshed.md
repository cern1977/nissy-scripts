# /deploy-toolshed — Bump + deploy + git-push for Verktøyhylle

Hele deploy-rutinen i én kommando. Repoet `~/Developer/nissy-scripts/` er kanonisk arbeidsplass — master-fila `toolshed.js` redigeres direkte her, og git tar vare på historikken.

> ℹ️ **Verktøyhylle-regel:** Bare én fil (`toolshed.js`), ingen dev/prod-split. Hver deploy går rett ut til alle brukere — bekreft endringen med Thomas først.

## Når brukes

Hver gang en kode-endring i `toolshed.js` er ferdig og skal pushes til server + commits til git.

## Filer og stier (må matche nøyaktig)

- **Master:** `~/Developer/nissy-scripts/toolshed.js`
- **Server SSH:** `czvnsicn5_ssh@ssh.czvnsicn5.service.one` passord `Hercules2026`
- **Server-fil:** `~/webroots/by-route/thomaswestby.no_/skript/toolshed.js`
- **GitHub-repo:** `cern1977/nissy-scripts` (origin, branch `main`)
- **Dagslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/YYYY-MM-DD.md`
- **Endringslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/ENDRINGSLOGG.md`

## Obligatoriske steg (ikke hopp over noen)

### Steg 1 — Bekreft endring med Thomas

Spør Thomas:
- **«Hva har du endret?»** (én setning til commit-melding + dagslogg)

Ikke fortsett uten svar.

### Steg 2 — Finn gjeldende versjon

Les linjen nær toppen av `~/Developer/nissy-scripts/toolshed.js`:
```
var VERSJON = '1.N';
```

Parse N. Neste versjon = N+1. Hopp aldri mer enn ett hakk.

(NB: `toolshed.json` på serveren kan også ha et `versjon`-felt som overstyrer dette i UI-et. Hvis det settes der, hold fila i sync — ellers er JS-konstanten kilden.)

### Steg 3 — Bump versjon i master-fil

Endre `'1.N'` → `'1.(N+1)'` i `~/Developer/nissy-scripts/toolshed.js`.

### Steg 4 — Push til server

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

(Verktøyhylle har ikke dev/prod-split, så hver deploy logges også i endringsloggen.)

### Steg 8 — Rapporter til Thomas

Én kort oppsummering:
```
✅ v1.N deployet
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

## Hva skillen eksplisitt FORBYR

- Batch-bump av flere versjoner («1.1 → 1.4 på én gang») — én og én
- Push til server uten å committe til git
- Push uten dagslogg-oppføring
- `--no-verify` eller `git push --force` uten Thomas' eksplisitte bestilling
- Hoppe over GitHub-push selv om server-push lykkes

## Argumenter

- `/deploy-toolshed` (ingen args) — bump + push til server + commit/push til git
- `/deploy-toolshed dry` — vis hva som VILLE skjedd uten å pushe (til debug)
