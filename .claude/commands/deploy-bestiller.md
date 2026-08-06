# /deploy-bestiller — Bump + commit + push for Bestiller

Hele deploy-rutinen i én kommando. Repoet `~/Developer/nissy-scripts/` er kanonisk arbeidsplass — master-filene `bestiller/bestiller_dev.js` og `bestiller/bestiller.js` redigeres direkte her.

GitHub Actions tar selve SSH-pushen til server automatisk når endringen merges til `main`, så slash-commanden trenger kun å håndtere versjon-bump + git.

> ⚠️ **Bestiller-regel:** Push kun dev-fil som standard. Prod-promotering krever eksplisitt «deploy prod»-bekreftelse fra Thomas — kolleger bruker prod-fila og den må være stabil.

## Når brukes

Hver gang en kode-endring i `bestiller/bestiller_dev.js` (evt. `bestiller/bestiller.js` ved prod-promo) er ferdig og skal pushes til server + commits til git.

## Filer og stier (må matche nøyaktig)

- **Master dev:** `~/Developer/nissy-scripts/bestiller/bestiller_dev.js`
- **Master prod:** `~/Developer/nissy-scripts/bestiller/bestiller.js`
- **Server dev-fil:** `https://thomaswestby.no/skript/bestiller_dev.js` (auto-deployed via GitHub Actions)
- **Server prod-fil:** `https://thomaswestby.no/skript/bestiller.js` (auto-deployed via GitHub Actions)
- **GitHub Actions workflow:** `.github/workflows/deploy-bestiller.yml`
- **GitHub-repo:** `cern1977/nissy-scripts` (origin, branch `main`)
- **Sesjonslogg-endepunkt (kun dev):** `https://thomaswestby.no/OUS/sesjoner.php` (PHP i `cern1977/OUS-backend`)

## Obligatoriske steg (ikke hopp over noen)

### Steg 1 — Bekreft endring med Thomas

Spør Thomas:
- **«Hva har du endret?»** (én setning til commit-melding)
- Hvis ingen argumenter → dev-bump bekreftes
- Hvis `prod` i args → bekreft prod-promotering OG sjekk at Thomas eksplisitt har sagt «vi er klare for prod»

Ikke fortsett uten svar.

### Steg 2 — Finn gjeldende versjon

Les `const VERSION`-linjen nær toppen av `~/Developer/nissy-scripts/bestiller/bestiller_dev.js`:
```
const VERSION = '5.N-dev';
```

Parse N. Neste dev-versjon = N+1. Hopp aldri mer enn ett hakk.

### Steg 3 — Bump versjon i master-fil

**Dev-bump:** endre `'5.N-dev'` → `'5.(N+1)-dev'` i `bestiller/bestiller_dev.js`. Husk også å oppdatere header-kommentaren med en linje for den nye versjonen.

**Prod-promotering:** transformer dev-fila til prod ved å:
- Lese `bestiller/bestiller_dev.js`
- `'5.N-dev'` → `'5.N'` (strip -dev)
- Skrive resultat til `bestiller/bestiller.js`

```bash
cd ~/Developer/nissy-scripts/bestiller/
sed "s/'5.N-dev'/'5.N'/" bestiller_dev.js > bestiller.js
```

(Bytt N med faktisk tall.)

### Steg 4 — Commit + push til GitHub

```bash
cd ~/Developer/nissy-scripts/
git add bestiller/bestiller_dev.js
# Hvis prod-promo, også:
git add bestiller/bestiller.js
git commit -m "Bestiller v5.N(-dev): <kort beskrivelse fra steg 1>"
git push origin main
```

Hvis push feiler: vis feilmelding rått, ikke retry blindt.

### Steg 5 — Verifiser auto-deploy

GitHub Actions trigges automatisk på push til main. Følg loggen på:
```
https://github.com/cern1977/nissy-scripts/actions
```

Workflow-en SCP-er fila til server og verifiserer via curl. Forventet status: ✅ grønn etter ca. 30–60 sek.

Hvis grønn → ferdig.
Hvis rød → sjekk loggen (vanligvis Varnish-cache eller SSH-secret), varsle Thomas.

### Steg 6 — Rapporter til Thomas

Én kort oppsummering:
```
✅ Bestiller v5.N-dev pushet
- Repo: commit + push til cern1977/nissy-scripts (main)
- Server: deploy-bestiller workflow trigget — sjekk Actions-fanen for grønn status
```

## Feilhåndtering

- **Hvis git push feiler (ikke fast-forward o.l.):** STOPP, vis status, spør Thomas
- **Hvis GitHub Actions feiler:** vis lenke til workflow-loggen, varsle Thomas. Ikke retry blindt
- **Hvis Thomas ikke svarer på «hva endret du?»:** STOPP, ikke anta noe
- **Cache-problem på server:** Varnish kan ta opptil 2 min — bruk `?cb=$(date +%s)` for å verifisere manuelt

## Hva skillen eksplisitt FORBYR

- Batch-bump av flere versjoner («5.6 → 5.9 på én gang») — én og én
- Push til server manuelt via SSH (workflow tar dette)
- Prod-promotering uten eksplisitt «deploy prod»-bekreftelse fra Thomas
- `--no-verify` eller `git push --force` uten Thomas' eksplisitte bestilling

## Argumenter

- `/deploy-bestiller` (ingen args) — dev-bump + commit/push til git (auto-deploy via Actions)
- `/deploy-bestiller prod` — prod-promotering (krever eksplisitt bekreftelse), bumper også dev videre til neste -dev
- `/deploy-bestiller dry` — vis hva som VILLE skjedd uten å pushe (til debug)
