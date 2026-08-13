# g-travel oppslag — flightnummer-redning for Gardermoen

> **Status (2026-06-04):** reverse-engineering FERDIG og verifisert live. Agent bygd (`gtravel_agent.js` v0.1, deployet). **På pause** — hentes frem når behovet for flightnr-redning viser seg reelt/hyppig. Ambisjonsnivå valgt: **lett assist** (ikke full relé-automatikk).

## 1. Rolle og fallback (les dette først)

g-travel er **bare én metode for å finne flightNUMMERET**. Den er ikke fasit på noe annet.

| Datapunkt | Kilde (fasit) | g-travel sin rolle |
|---|---|---|
| **Landingstid (oppdatert/faktisk)** | **Avinor** — alltid | Ingen. (g-travels tid er kun *planlagt*, backup hvis Avinor mangler turen.) |
| **Flightnummer** | NISSY-meldingen (hvis operatør skrev det) | **Redning** når nummeret mangler i meldingen |

### Fallback-kjede for flightnummer (prioritert)
1. **NISSY-meldingen** — hvis flightnr står der, bruk det. Primær.
2. **g-travel på Løyve-ref** — referansen (`G8CQKG`) finnes i NISSY admin (detalj-panel «Transportør/ressurs» → «Løyve/Tur nr»). `gtravel.oppslag('G8CQKG')` → flightnr.
3. **g-travel på personnummer (manuelt)** — søk pasienten i g-travel/NISSY admin, finn fly-turen blant alle rekvisisjoner, hent ref. Når Løyve-feltet er tomt.
4. **Ingen treff** = turen er trolig **ikke booket** → avvik «må bookes», ikke et oppslagsproblem.

Når flightnr er funnet (uansett kilde) → **Avinor** for landingstid.

## 2. Reverse-engineert API (verifisert live)

- **Portal-origin:** `gto.softinventor.com` (IKKE g-travel.no). Agent/bookmarklet må kjøre her.
- **API:** `gtravel-api.softinventor.com/api/v1/`. companyId=3481, OrganizationId=8.
- **CORS:** API svarer `Access-Control-Allow-Origin: *` → uten `credentials:'include'` kan det kalles fra hvilket som helst origin, bare man har Bearer-token.

### Auth (løst)
- **Token-kilde:** `GET gto.softinventor.com/login/refresh_token` (cookie-autentisert, same-origin). Returnerer ferskt **opakt Bearer-token** som ren tekst i body (~2731 tegn, IKKE JWT). Sliding session ~20 min.
- gto-cookiene er satt uten `Domain` (path=/ kun) → sendes ikke til api-subdomenet, derfor må cookie-sesjon veksles til Bearer via refresh_token.
- Token ligger IKKE i localStorage/sessionStorage (in-memory). Sniffing av fetch/XHR funker ikke (SPA fanget dem ved oppstart) — men trengs ikke, refresh_token løser det.

### Endepunkter
```
GET /login/refresh_token                                  → Bearer-token (body, ren tekst)
GET /BookingLists?bookingType=1&order=1&page=0&pageSize=20&pnr=<REF>    → [0].BookingId
GET /Bookings?pageSize=1&page=0&showCancelled=true&showPassed=true&showOnHoldLTDPassed=true&bookingId=<ID>
```
- `pnr=<REF>` søker på Bestillingsreferanse (= NISSY Løyve, f.eks. G8CQKG). `&onlyBookingCounts=true` gir kun telling.
- Liste uten pnr: ~3620 aktive bestillinger (paginert — ikke bla alt).

### Flightdata-modell (parser)
`Bookings`-respons er array; `[0].Elements[i].Flight` har **parallelle arrays per leg**:
```
FlightNumbers : ["SK281","SK4196"]
Departures    : ["2026-06-04T18:20:00","2026-06-04T20:10:00"]   (ISO m/ dato+tid)
Arrivals      : ["2026-06-04T19:15:00","2026-06-04T21:10:00"]
Destinations  : ["OSL-BGO","BGO-TRD"]                            ("FRA-TIL")
```
- **Gardermoen-landing:** leg der `Destinations[i]` slutter på `-OSL` → `Arrivals[i]`=landingstid, `FlightNumbers[i]`=flightnr.
- Avreise fra OSL: `Destinations[i]` starter `OSL-`.
- (`strFlightnumbers/strDepartures/strDestinations` er null — bruk array-ene.)
- **Datoen mangler ikke** — den ligger i de fulle ISO-tidsstemplene. Gir gratis kryss-sjekk mot NISSY-turens dato.

## 3. Identifikatorer / nøkler

| Nøkkel | Hvor | Format | Søkbar i g-travel? |
|---|---|---|---|
| **Bestillingsreferanse** | NISSY admin «Løyve/Tur nr» (detalj-panel); g-travel | 6 tegn, f.eks. `G8CQKG`, `H1WHDB` | **Ja** — `pnr=` (vår agent) |
| Booking nr | NISSY admin liste «Løyvenr» = `Gtravel3-70499894`; også «Booking nr» | 8 siffer (70499894) | Ukjent — matcher ikke bookingId/RequisitionNumber |
| Rekvisisjonsnummer | g-travel søkeskjema; NISSY admin | 12 siffer (264015261791) | Ja (søkeskjema) — param-navn IKKE fanget. NB: ≠ NISSY reqId (~8 siffer) |
| bookingId | g-travel internt | ~7 siffer (2035457) | Ja — `bookingId=` (detalj) |
| Personnummer | alltid kjent ved tur-sjekk | — | Ukjent om API godtar direkte; UI-søk finner alle pasientens turer |

**NB DOM:** I admin-LISTA vises `Gtravel3-70499894` (booking nr), ikke `G8CQKG`. Referansen `G8CQKG` så vi bare i detalj-panelet. Uavklart om den kan plukkes fra admin uten å åpne hver tur (probe ikke fullført).

## 4. Agenten (`gtravel_agent.js`)

- I repo + deployet til `thomaswestby.no/skript/gtravel_agent.js`.
- Kjører på gto-fanen. Eksponerer:
  - `gtravel.oppslag(ref)` → `{ref, funnet, bookingId, legg[{flightNr,fra,til,avgang,landing}], landerOSL, reiserFraOSL, oslLanding}`
  - `gtravel.oppslagFlere([refs])` → batch
  - `gtravel.token()` → ferskt token (cache 12 min, auto-retry ved 401)
- **Last inn** (script-injeksjon, ingen CORS):
  ```js
  var s=document.createElement('script');s.src='https://thomaswestby.no/skript/gtravel_agent.js?v='+Date.now();document.body.appendChild(s);
  ```
- **Verifisert:** H1WHDB → SK281 OSL-BGO + SK4196 BGO-TRD, korrekte ISO-tider, OSL-skille riktig.

### Konsoll-quirks på gto (viktig ved videre arbeid)
- `console.log` vises ofte IKKE — les returverdi / `window.__o` direkte.
- `copy()` virker kun på ytterste konsoll-nivå, ikke i `.then()`.
- `Date.now()` ser overstyrt ut (gir dato-streng) — uvesentlig.
- Aldri lim inn en fetch-monkey-patch to ganger uten reload → uendelig rekursjon.

## 5. Hvis vi gjenopptar — gjenstår

- [ ] Test en referanse som LANDER OSL → bekreft `oslLanding` fylles ut.
- [ ] Avklar om `G8CQKG` kan plukkes fra admin-siden uten å åpne hver tur (fullfør DOM-probe).
- [ ] (Lett assist) pakk `oppslag` i en knapp/prompt på gto-fanen: lim inn Løyve-ref → flightnr.
- [ ] (Kun ved hyppig behov) full automatikk: NISSY admin-scrape → relé (`gtravel_relay.php`) → agent → Gardermoen-verktøyet. Krever cross-origin server-relé (samme mønster som attest/tlf-oppslag).
- [ ] Fange param-navn for rekvisisjonsnummer-søk + bekrefte personnummer-søk i API.

## 6. Sikkerhet / scope
Read-only oppslag av EGNE, innloggede bestillinger. Ingen booking/skriving. Ingen lagring av token/cookies. Manuell innlogging i gto-fanen; ingen passord-replay server-side.
