# Gardermoen — flightnummer-sjekk (`gardermoen.js`)

Verktøy i Verktøykassen som lister **Gardermoen-turer** og flagger hvilke som har et **flightnummer** og hvilke som mangler det.

## Formål

Taxisentralen trenger flightnummeret for å kunne følge med på **flyforsinkelser** og hente pasienten til riktig tid. Verktøyet gir operatøren rask oversikt:

- **✈ Med flightnummer** — flightnr + avreise-flyplass + ETA + direkte **Avinor-lenke** (ankomststatus på Oslo lufthavn). Disse er klare for taxisentralen.
- **⚠ Mangler flightnummer** — turen har ikke et flightnr i «Melding til transportøren». Lenke til **admin** (`searchStatus?nr=<reisenr>`) så operatøren kan sjekke/finne info og legge det inn.

## Slik lastes det

Egen launcher i Verktøykasse-menyen, definert i **`verktoykasse_tilgang.php`** på serveren:

```php
$verktoy[] = ['id'=>'gardermoen', 'navn'=>'🛫 Gardermoen (fly)', 'fil'=>'gardermoen.js', 'farge'=>'#0369a1'];
```

Klikk på launcheren injiserer `<script src=skript.php?fil=gardermoen.js>` i den åpne NISSY-fanen (samme origin → kan fetche dispatch + admin). Skriptet bygger sitt eget flytende panel (`#grm-panel`) i siden.

**Tilgang i dag:** dev/superadmin (under «Utvikling»-seksjonen i tilgang-konfigen).
**Mål på sikt:** gate på **FLY/KOMPETANSE**-kompetansen fra VEILEDNING-matrisen (se TODO).

## Datakilde og metode

Bruker samme metode som **Overvåker Live** (`overvaaker_live.js` / modulen `v7/modules/ovr_fly.js`).

1. **Hent turer** — `hentTurer()`
   - `GET /planlegging/ajax-dispatch?did=all&action=openres&rid=-1&rfilter=14047&t=<ts>`
   - Parser XML → `response[id="paagaaendeOppdrag"]` → tabell. Header-rad er `tr.tbh`; turrader er `tbody tr[name]`.
   - Per rad: `resId = tr[name]`, `reqId` fra `showReq(this, <id>)`, samt navn/start fra kolonnene.

2. **Hent melding** — `hentMelding(reqId, resId)`
   - `GET /administrasjon/admin/ajax_reqdetails?id=<reqId>&db=1&tripid=<resId>&full=true`
   - Regex ut **«Melding til transportøren»** + **Løyve/Tur nr** (→ reisenr/turId).

3. **Fly-deteksjon** — `byggFlyInfo(melding)` (portet fra `ovr_fly.js`)
   - `FLY_REGEX` finner `XX1234`-mønster; `IKKE_FLY` filtrerer falske positiver (kl, ca, nr …).
   - `FRA_REGEX` + `IATA_MAP` finner avreise-flyplass (by → IATA-kode).
   - ETA-regexer finner ankomsttid (kl/lander/ankommer HH:MM).
   - Bygger Avinor ankomst-URL: `avinor.no/flyplass/oslo/flytider/...-osl-<dato>&statusScope=arrival`.
   - Returnerer `{flightnr, fraIata, eta, avinorUrl}` eller `null`.

## Tegnsett (viktig)

NISSY leverer **ISO-8859-1**, ikke UTF-8. All henting går via `hentISO(url)` som gjør `arrayBuffer()` + `TextDecoder('iso-8859-1')`. Bruker man `res.text()` (UTF-8-default) blir det `�` på æøå i navn/meldinger. Samme mønster som Overvåker Live.

## Flynr uten selskapskode

Operatører skriver ofte bare tallet: «**Ankomst 4014** kl 1020». `byggFlyInfo` fanger 3–4 siffer etter et fly-kontekstord (`ankomst/ank/fly/flight/rute/lander/ankommer/kommer med`) og **antar selskap fra antall siffer: 4 siffer = SK (SAS), 3 = DY (Norwegian)**. Markeres «(antatt)» i panelet. Som sikkerhetsnett matcher `vurderLanding` Avinor på **tall-endelse + turdato** (uansett selskap) hvis det antatte rutenummeret ikke finnes, og viser **origin** fra Avinor (f.eks. `SVG` = Sola) som bekreftelse på at det er rett fly. Unngår å forveksle med klokkeslett («kl 1020») og mobilnr (8 siffer).

## Datofilter — i morgen og framover

Verktøyet er for **forhåndssjekk av framtidige** Gardermoen-turer, ikke dagens. Dispatch-tavla (`openres`/`paagaaendeOppdrag`) returnerer turer med dato i start-cellen (`DD.MM HH:MM` for andre dager, `HH:MM` for i dag). `parseStart()` tolker dette til full `Date`, og `hentTurer()` beholder kun turer med `taxiDate >= i morgen`. Buffer-sjekken bruker turens faktiske dato (matcher Avinor-flyet på samme dato). **Felle:** «21.05 10:40» — dato 21.05 må ikke tolkes som klokkeslett 21:05 (rettet i 0.4).

## RFILTER

`RFILTER = '14047'` = NISSY-filteret for Gardermoen-turer (på `pastrans-sorost.mq.nhn.no`). Endres øverst i `gardermoen.js` hvis filteret bytter id.

## Avinor-integrasjon (buffer-sjekk)

For fly-turer hentes faktisk/estimert landingstid fra Avinor og sammenlignes med taxitid.

**Regel:** flyet må lande **minst `BUFFER_MIN` (20) minutter før taxitid**. `buffer = taxitid − landing`. Er buffer < 20 min → ⚠ **«FOR LITE TID»** (taxien er bestilt for tett opp mot landing). Eks: taxi 08:20 krever landing ≤ 08:00.

**Proxy `avinor.php`** (på `/skript/`) — nødvendig fordi Avinor-API-et mangler CORS og ber om caching + User-Agent:
- Henter server-side `https://asrv.avinor.no/XmlFeed/v1.0?TimeFrom=2&TimeTo=168&airport=OSL&direction=A` (`TimeFrom` = timer TILBAKE, positivt; negativt → HTTP 400). **168t = 7 dager fram** — Avinor har rutetider ~6–7 dager fram, og turene kan være flere dager unna. Feeden er ~400–450 KB (cachet).
- **Match KUN på samme dato** som turen (`vurderLanding`). Faller ALDRI tilbake til en forekomst på feil dato — det ga «7220 min»-bug (samme rutenr+tid, men 5 dager feil). Finnes ikke turdatoen i feeden → «Avinor mangler rutetid for turdatoen ennå».
- Returnerer **array per flight_id** (`flights:{ "SK4014":[{schedule,code,time,origin},…] }`) — samme rutenr kan finnes på flere datoer; klienten velger forekomsten på turens dato.
- Cacher 60 s i `sys_get_temp_dir()`, setter User-Agent, faller tilbake til gammel cache ved feil.
- Returnerer JSON `{ok, lastUpdate, flights:{ FLIGHT_ID: {schedule, origin, code, time} }}` med `Access-Control-Allow-Origin: *`.
- **Status-koder:** `A`=landet (time=faktisk), `E`=estimert (time=ny tid), `C`=innstilt, ``=i rute. Tider i UTC.

I `gardermoen.js`: `hentAvinor()` henter mappen én gang; `vurderLanding(tur, flights)` setter `tur.avinor = {funnet, cancelled, landet, landingDate, taxiDate, buffer, forLite}`. Fly-turer med for lite tid / innstilt sorteres øverst og uthevet rødt.

## Sentrale funksjoner

| Funksjon | Ansvar |
|----------|--------|
| `hentTurer()` | Henter + parser dispatch-filteret → liste `{resId, reqId, navn, start}` |
| `hentMelding(reqId, resId)` | Henter admin-detaljer → `{melding, turId}` |
| `byggFlyInfo(melding)` | Fly-deteksjon → `{flightnr, fraIata, eta, avinorUrl}` eller `null` |
| `hentAvinor()` | Henter `avinor.php` → map `flightId → {schedule,code,time,origin}` |
| `vurderLanding(t, flights)` | Landing vs taxitid → `t.avinor` m/ buffer + `forLite`-flagg |
| `kjor()` | Orkestrerer: turer → admin → fly-deteksjon → Avinor → render |
| `panel()` / `render()` | Bygger panelet og de to seksjonene |

## Deploy

```bash
sshpass -p '<pwd>' ssh czvnsicn5_ssh@ssh.czvnsicn5.service.one \
  "cat > ~/webroots/by-route/thomaswestby.no_/skript/gardermoen.js" < gardermoen.js
```

Filen ligger i `/skript/` (samme katalog som overvaaker_live.js m.fl.), serveres via `skript.php?fil=gardermoen.js`.

## Kjente forbehold / TODO

- [ ] **Ikke testet mot live NISSY** — dispatch-/admin-parsing kan trenge justering. Verifiser at turer dukker opp og at flightnr/ETA tolkes riktig.
- [ ] Bekreft at **rfilter=14047** er riktig Gardermoen-filter.
- [ ] **Tilgang:** flytt launcher fra dev/superadmin til **FLY/KOMPETANSE**-kompetansen (matrise i `kontor_tilgang.php` / `admin/ansatte_dp.php`). Kolonnenavn for FLY må finnes (ikke `er_fly`).
- [ ] Vurder samkjøring (rad med flere `reqId`) — i dag brukes kun første reqId per rad.
- [ ] Evt. auto-oppdatering / antall-teller i Verktøykasse-pillen.

## UI

Flytende panel `#grm-panel`. **Flyttbart** — dra i headeren; posisjon huskes i `localStorage` (`grm_pos`) og klampes innenfor viewport. To seksjoner: ✈ med flightnummer / ⚠ mangler flightnummer.

## Versjonering

**Bump `VERSJON` ved hver endring.** Versjonen vises i panel-headeren (`v0.x`), så man kan verifisere at re-klikk faktisk kjører ny kode. Viktig fordi re-injeksjon i en åpen side ellers kan kjøre gammel kode (jf. den fjernede guard-bugen i 0.2). Lastingen er cache-bustet (`&_=Date.now()`), men det garanterer bare frisk FIL — bump bekrefter at panelet du ser er den nye koden.

## Versjon

- v0.1 (2026-05-20) — første utkast. Flagger fly vs ikke-fly; Avinor-lenke + admin-lenke; flyttbart panel.
- v0.2 (2026-05-20) — ISO-8859-1-dekoding (fiks æøå i navn/melding); fjernet IIFE-guard så re-klikk kjører fersk kode.
- v0.3 (2026-05-20) — Avinor-integrasjon: `avinor.php`-proxy + buffer-sjekk (landing vs taxitid ≥20 min), ⚠ «for lite tid»-flagg, problemturer øverst.
- v0.4 (2026-05-20) — kun i morgen+ (datofilter); `parseStart()` tolker DD.MM HH:MM riktig (fiks 21.05→21:05-bug); Avinor-proxy returnerer array per flight_id + vindu 48t fram; landing matches på turens dato; etiketter Landet/Est./Rutetid.
- v0.5 (2026-05-20) — fang rene flynr («Ankomst 4014») via fly-kontekstord + antatt selskap (4 siffer=SK, 3=DY), «(antatt)»-merke; Avinor-fallback på tall-endelse; vis origin (f.eks. SVG=Sola).
- v0.6 (2026-05-20) — fiks «7220 min»-bug: krev SAMME dato-match (ingen feil-dato-fallback); Avinor-vindu utvidet til 7 dager så framtidige turdatoer dekkes; «mangler rutetid for datoen»-tilstand.
- v0.7 (2026-05-20) — postnr → antatt flyplass (sone-mapping 4xxx=SVG,5xxx=BGO,6xxx=AES/MOL,7xxx=TRD,8xxx=BOO,9xxx=TOS) med GUL «verifiser»-merking når flightnr mangler. Henter pasientens hjem-postnr fra admin (Pasient-seksjonen). Svakt hint — kun veiledende.

## TODO videre (v0.8+)

- **RFLY-kobling (sterkere enn postnr):** koble Gardermoen-taxi uten flightnr til pasientens RFLY-rekvisisjon (samme navn+dato, begge i `rfilter=14047`-lista). RFLY gir pålitelig **avreiseflyplass** (f.eks. BGO). Med taxitid → match Avinor BGO→OSL-ankomst som lander før taxi → vis kandidatfly (gul, verifiser). Krever å parse flere dispatch-kolonner: navn, reisemåte (RFLY/TAX), fra-sted, til-sted. **RFLY-tider er plassholdere — bruk kun rute+dato derfra.**
- Vurder å vise Avinor-kandidater (origin+dato, før taxitid) i gul-tilstanden.
