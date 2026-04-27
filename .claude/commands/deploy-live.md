# /deploy-live — Bump + deploy + git-push for Overvåker Live

Hele deploy-rutinen i én kommando. Repoet `~/Developer/nissy-scripts/` er kanonisk arbeidsplass — master-filene `overvaaker_live_dev.js` og `overvaaker_live.js` redigeres direkte her, og git tar vare på historikken.

## Når brukes

Hver gang en kode-endring i `overvaaker_live_dev.js` (evt. `overvaaker_live.js` ved prod-promo) er ferdig og skal pushes til server + commits til git.

## Filer og stier (må matche nøyaktig)

- **Master dev:** `~/Developer/nissy-scripts/overvaker-live/overvaaker_live_dev.js`
- **Master prod:** `~/Developer/nissy-scripts/overvaker-live/overvaaker_live.js`
- **Server SSH:** `czvnsicn5_ssh@ssh.czvnsicn5.service.one` passord `Hercules2026`
- **Server dev-fil:** `~/webroots/by-route/thomaswestby.no_/skript/overvaaker_live_dev.js` (dobbel-a)
- **Server prod-fil:** `~/webroots/by-route/thomaswestby.no_/skript/overvaaker_live.js` (dobbel-a)
- **GitHub-repo:** `cern1977/nissy-scripts` (origin, branch `main`)
- **Dagslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/YYYY-MM-DD.md`
- **Endringslogg:** `/Users/thomaswestby/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/ENDRINGSLOGG.md`

## Obligatoriske steg (ikke hopp over noen)

### Steg 1 — Bekreft endring med Thomas

Spør Thomas:
- **«Hva har du endret?»** (én setning til commit-melding + dagslogg)
- Hvis ingen argumenter → dev-bump bekreftes
- Hvis `prod` i args → bekreft prod-promotering OG sjekk at Thomas eksplisitt har sagt «vi er klare for prod» (ref. `feedback_always_bump.md`)

Ikke fortsett uten svar.

### Steg 2 — Finn gjeldende versjon

Les linje 19 fra `~/Developer/nissy-scripts/overvaker-live/overvaaker_live_dev.js`:
```
const VERSJON_FULL = '6.2.N-dev';
```

Parse N. Neste dev-versjon = N+1. Hopp aldri mer enn ett hakk.

### Steg 3 — Bump versjon i master-fil

**Dev-bump:** endre `'6.2.N-dev'` → `'6.2.(N+1)-dev'` i `~/Developer/nissy-scripts/overvaker-live/overvaaker_live_dev.js`.

**Prod-promotering:** transformer dev-fila til prod ved å:
- Lese `overvaaker_live_dev.js`
- `'6.2.N-dev'` → `'6.2.N'` (strip -dev)
- `_skriptUrl`-referanse til `overvaaker_live_dev.js` → `overvaaker_live.js`
- Skrive resultat til `overvaaker_live.js`

```bash
cd ~/Developer/nissy-scripts/overvaker-live/
sed -e "s/'6.2.N-dev'/'6.2.N'/" -e "s|overvaaker_live_dev.js|overvaaker_live.js|g" \
  overvaaker_live_dev.js > overvaaker_live.js
```

(Bytt N med faktisk tall.)

### Steg 4 — Push til server

**Dev:**
```bash
sshpass -p 'Hercules2026' ssh -o StrictHostKeyChecking=no \
  czvnsicn5_ssh@ssh.czvnsicn5.service.one \
  "cat > ~/webroots/by-route/thomaswestby.no_/skript/overvaaker_live_dev.js" \
  < ~/Developer/nissy-scripts/overvaker-live/overvaaker_live_dev.js
```

**Prod (i tillegg ved promotering):**
```bash
sshpass -p 'Hercules2026' ssh -o StrictHostKeyChecking=no \
  czvnsicn5_ssh@ssh.czvnsicn5.service.one \
  "cat > ~/webroots/by-route/thomaswestby.no_/skript/overvaaker_live.js" \
  < ~/Developer/nissy-scripts/overvaker-live/overvaaker_live.js
```

**Verifiser** med curl + grep (cache-bust):
```bash
curl -s "https://thomaswestby.no/skript/overvaaker_live_dev.js?cb=$(date +%s)" | head -25 | grep VERSJON_FULL
```

Skal vise nøyaktig den versjonen du pushet.

### Steg 5 — Commit + push til GitHub

```bash
cd ~/Developer/nissy-scripts/
git add overvaker-live/overvaaker_live_dev.js
# Hvis prod-promo, også:
git add overvaker-live/overvaaker_live.js
git commit -m "Live v6.2.N(-dev): <kort beskrivelse fra steg 1>"
git push origin main
```

Hvis push feiler: vis feilmelding rått, ikke retry blindt.

### Steg 6 — Oppdater dagslogg

Fil: `docs/YYYY-MM-DD.md` (dagens dato).

Hvis fila finnes: legg til en linje under «Overvåker Live»-seksjonen med versjon + endring.

Hvis fila mangler: opprett med mal fra `/rapport`-skillen.

Linje-format:
```
- **v6.2.N-dev** — [kort beskrivelse fra steg 1]
```

### Steg 7 — Oppdater endringslogg (kun ved prod)

Kun ved prod-promotering, legg til øverst i `docs/ENDRINGSLOGG.md`:
```
## Overvåker Live v6.2.N (YYYY-MM-DD)

- [beskrivelse fra steg 1]
```

Dev-bumps havner ikke i endringsloggen — bare dagsloggen.

### Steg 8 — Rapporter til Thomas

Én kort oppsummering:
```
✅ v6.2.N-dev deployet
- Repo: commit + push til cern1977/nissy-scripts (main)
- Server: overvaaker_live_dev.js (6.2.N-dev bekreftet via curl)
- Dagslogg: docs/YYYY-MM-DD.md oppdatert
```

## Feilhåndtering

- **Hvis SSH feiler:** Vis feilmeldingen rått, ikke retry blindt
- **Hvis curl-verifisering viser feil versjon:** Varsel Thomas om cache-problem på server (Varnish kan ta inntil 2 min — bruk cache-bust-parameter `?cb=$(date +%s)`)
- **Hvis git push feiler (ikke fast-forward o.l.):** STOPP, vis status, spør Thomas
- **Hvis Thomas ikke svarer på «hva endret du?»:** STOPP, ikke anta noe

## Hva skillen eksplisitt FORBYR

- Batch-bump av flere versjoner («6.2.10 → 6.2.13 på én gang») — én og én
- Push til server uten å committe til git
- Push uten dagslogg-oppføring
- Prod-promotering uten eksplisitt «deploy prod»-bekreftelse fra Thomas
- `--no-verify` eller `git push --force` uten Thomas' eksplisitte bestilling
- Hoppe over GitHub-push selv om server-push lykkes

## Argumenter

- `/deploy-live` (ingen args) — dev-bump + push dev til server + commit/push til git
- `/deploy-live prod` — prod-promotering (krever eksplisitt bekreftelse), bumper også dev videre til neste -dev
- `/deploy-live dry` — vis hva som VILLE skjedd uten å pushe (til debug)
