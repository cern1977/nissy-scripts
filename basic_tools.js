// === BASIC TOOLS v1.134-dev ===
// v1.134-dev: console.log-formatering i sammenlignHentesteder. «%.0f»/«%.1f» finnes ikke i
//             Chrome — den støtter bare %d %s %i %f %o %O %c, uten presisjon, så prosenten ble
//             skrevet rått («(%.1f %) -32.129…»). Formateres nå med toFixed() i strengen selv.

// === BASIC TOOLS v1.133-dev ===
// v1.133-dev: NISSYS EGEN KILOMETER (Thomas fant den 21.08). Planleggerens «Beregn enkeltreise»
//             (buttonManualTrip) poster til /planlegging/manualtrip og svarer med «Forventet
//             distanse: 3.461 km» + kjøretid + pris per transportør — for et VILKÅRLIG adressepar,
//             uten turid og uten resId. Det er motoren oppgjøret bygger på, så i Avvik kan den
//             ikke bestrides med «men Google sier noe annet». Ny nissyEnkelttur(fra, til) →
//             {km, minutter}; sammenlignHentesteder viser nå både minutter og km.
//             ⚠️ Serverens EGET skjema (action=manualTrip, fromStreet/toStreet…) gir 404 — bare den
//             lokalt genererte varianten virker (action=manualtrip, fra_gate/til_gate,
//             ButtonAndListSystemImpl.js:383). Svaret er ISO-8859-1 og må dekodes.

// === BASIC TOOLS v1.126-dev ===
// v1.126-dev: ENDRE TID — deltaet i trip.comment ankres i den opprinnelige tiden:
//             «-39 Opprinnelig tid 09:04». Før akkumulerte vi, og «denne endringen» ble regnet mot
//             tiden lest fra RADEN da popupen ble åpnet. NISSY re-rendrer aggressivt, så ved andre
//             endring viste raden fortsatt den opprinnelige tiden og deltaet ble telt to ganger:
//             09:04→08:30 ga «-34», så 08:25 ga −34 + −39 = «-73» (operatørsak 13.08), der riktig
//             svar er −39. Nå står ankeret i kommentaren selv og regnes ABSOLUTT — den stale raden
//             kan ikke lyve lenger. Gammelt format uten anker regnes tilbake fra deltaet som står
//             der, operatørens egen tekst bevares, og delta over midnatt tar korteste vei.

// === BASIC TOOLS v1.125-dev ===
// v1.125-dev: TOOLTIP-PRESISERING (Thomas): «reisetid 1 t 0 min» var egentlig VENTETIDEN (maks(reisetid,
//             60 min-gulvet)) — reisetid og ventetid er forskjellige ting. Nå vises begge når gulvet
//             slår inn: «reisetid 23 min → ventetid 1 t 0 min»; lange turer (reisetid ≥ 60) viser kun
//             reisetid (ventetid = reisetid); ukjent: «reisetid ukjent → ventetid 1 t 0 min».
// === BASIC TOOLS v1.124-dev ===
// v1.124-dev: UTSENDELSES-TOOLTIP — NISSYs native mouseover-title på <tr> viser bare rekvisisjons-
//             nummeret («meningsløst» — Thomas). Når 🔔-varselet er PÅ overskrives den med
//             utsendelses-info: «Send ut innen HH:MM (reisetid …, hentetid …)». Settes i samme
//             utvOppdater-løkke som blinken (gratis — fristen er alt beregnet), re-påføres etter
//             NISSY-re-render av samme MutationObserver. Varsel AV → native tooltip urørt.
// === BASIC TOOLS v1.123-dev ===
// v1.123-dev: UTSENDELSESVARSEL — institusjonsnavn ga 60-min-gulvet (HUSDAL-raden 03.07: Oslo→Drevsjø
//             3t38 blinket fra 14:05 i stedet for 16:43). Visningsnavn («Kirurgisk, gastro- og urologisk
//             avdeling», «Engerdal Sykehjem») kan verken struktureres for NISSY-kallet eller geokodes.
//             Nå: kan ikke radteksten struktureres → hent EKTE adresser fra admin-plakaten
//             (api.hentRekvisisjon/ajax_reqdetails via radens reqId — samme kilde som Vis kart+) →
//             beregnReisetidNissy → cache i localStorage (24 t). ruter.php-fallback bruker også
//             admin-adressene når vi har dem.
// === BASIC TOOLS v1.122-dev ===
// v1.122-dev: UTSENDELSESVARSEL — «F5-flommen» endelig forklart (Thomas' konsollsjekk 03.07): origin-
//             kvoten (5 MB) var FULL av Område-assistentens rutegeometrier → vkt_utv_rtcache fikk aldri
//             satt seg (setItem feilet stille). Fikset i Område-assistent v0.9.93 (kvote-vern). Her:
//             (1) skrivefeil logges nå ALLTID i konsollen (aldri stille igjen), (2) TTL 7 døgn → 24 t
//             (Thomas: «trenger ikke cache mer enn 24 t»).
// === BASIC TOOLS v1.121-dev ===
// v1.121-dev: UTSENDELSESVARSEL — «mange ruter.php-kall ved hver F5» (Thomas 03.07): feilede oppslag
//             ble ikke persistert og re-fetches ved hver innlasting. Nå caches også null-svar i
//             localStorage med kort TTL (30 min). + dev-logging av hvert faktiske oppslag (kilde+par)
//             så cache-misser er synlige i konsollen.
// === BASIC TOOLS v1.120-dev ===
// v1.120-dev: UTSENDELSESVARSEL reisetid-cache persisteres i localStorage (vkt_utv_rtcache, TTL 7 døgn,
//             maks 600 par) — F5/re-innlasting slår ikke lenger opp alle parene på nytt. Feilede
//             oppslag (null) holdes kun i minnet (kan være forbigående nettverksglipp).
// === BASIC TOOLS v1.119-dev ===
// v1.119-dev: UTSENDELSESVARSEL bruker NISSYs egen tidberegner (beregnReisetidNissy) som primærkilde
//             for reisetid — samme tall NISSY la til grunn da hentetiden ble satt. Ventetiden inkluderer
//             regiontillegget (hentetid + reisetid + tillegg = oppmøte → frist = oppmøte − 25 min).
//             ruter.php beholdes som fallback når adressen ikke lar seg strukturere (institusjon uten
//             gateadresse) eller NISSY-kallet feiler.
// v1.127-dev: UTSENDELSESVARSEL regnet med NISSYs `tidstilleggRegionalt` (Thomas 21.08: «Treff
//             fra 20 min. Det er margin for å rekke time. Den skal vi ikke legge på»). Tillegget er
//             margin for at pasienten skal rekke timen — ikke transporttid — så både frist og
//             ventetid lå 20 min for romslig, og tooltipen sa «reisetid 1 t 35 min» der
//             rekvisisjonsboksen sa 1 t 15 min. Nå brukes KUN j.reisetid.
//             NB: nissyDelta() (annen adresse) beholder reisetid+tillegg — der REPRODUSERER vi
//             NISSYs hentetid, og da hører tillegget med. Samme tall, to ulike formål.
// === BASIC TOOLS v1.98-dev ===
// v1.98-dev: UTSENDELSESVARSEL — checkbox «🔔 Utsendelsesvarsel» i footeren. Blinker ventende V-rader
//            amber når «send ut»-frist passert: nå ≥ hentetid + maks(reisetid,60min) − 25min. reisetid
//            beregnes per tur via ruter.php (cachet). Portet fra Område-assistent. Av som standard.
// === BASIC TOOLS v1.97-dev ===
// v1.97-dev: FIX «dobbel-adresse» i Enkeltur-panelet. Brukte kjernens rekkefølge (kan kollapse til ett
//            punkt) → viste samme adresse på begge linjer. Nå: turens FAKTISKE admin fra/til (fasit).
//            Admin-data + adresse-skrivingen var ALLTID korrekt — kun visningen var feil.
// === BASIC TOOLS v1.96-dev ===
// v1.96-dev: Vis kart+ geokoder nå institusjonsadresser. renskAdr (portet fra Avvik) stripper
//            institusjonsnavn/etasje/inngang før geokod.php + ruter.php → «Ahus-Lørenskog/…/Sykehusveien 25»
//            blir «Sykehusveien 25 1474». Fikser «dobbel-Søsterveien»-visningen + presis km for institusjoner.
// === BASIC TOOLS v1.95-dev ===
// v1.95-dev: «Annen adresse» regel-innstramming. Retning avgjør ende: TUR→henteadresse, RETUR→returadresse
//            (henteTid>=oppmøte=retur; behandlingsstedet kan ALDRI endres). Skrive-knapp vises KUN når
//            alternativet er kortere/lik — lengre reise tilbys ikke (pasienten har ikke krav).
// === BASIC TOOLS v1.94-dev ===
// v1.94-dev: «Annen adresse» STEG 2 — kan nå SKRIVE den nye adressen til rekvisisjonen i NISSY
//            (altRequisition-flyt portet fra gardermoen.js: edit-skjema → validateAddress for UTM →
//            POST altRequisition). KUN ventende turer (V-rad); pågående (P) sperret pga transportør-bytte.
//            Bekreftelsesdialog + validateAddress obligatorisk. window.__basicTools.byttAdresse (popup→opener).
// === BASIC TOOLS v1.93-dev ===
// v1.93-dev: «📍 Annen adresse»-knapp i Enkeltur (Vis kart+). Geonorge-autocomplete (geokod_sok.php),
//            sjekker om alternativ adresse er KORTERE enn opprinnelig (km mot fast endepunkt via
//            ruter.php), tegner lilla rute+stjerne på kartet. Beslutningsstøtte (ingen skriving til NISSY).
// === BASIC TOOLS v1.92-dev ===
// v1.92-dev: FIX popup-frysing under geokoding. geokod.php bruker opptil ~10s på adresser Geonorge
//            ikke finner; geo() manglet timeout + geocodeAlle gikk SEKVENSIELT → summert frysing
//            («Geocoder 2/2…» hang). Nå: AbortController 7s i geo() + PARALLELL geokoding (Promise.all)
//            → verste fall ~7s totalt, status ryddes, grupperingen fortsetter. (geokod.php-curl 8→5s.)
// === BASIC TOOLS v1.91-dev ===
// v1.91-dev: BASEMAP-VELGER nede til venstre i popupen — operatøren bytter selv mellom Kartverket grå,
//            Mørkt (CartoDB), Lyst (CartoDB) og Satellitt (Esri World Imagery). Alle gratis u/nøkkel.
//            settBasis()/byggBaseVelg() + BASISKART-config; basislag legges nederst (z-index 0).
// === BASIC TOOLS v1.90-dev ===
// v1.90-dev: KARTET → LEAFLET + KARTVERKET-FLISER (GRATIS), Google Maps helt ute av samkjørings-popupen.
//            Begrunnelse (målt mot 1645 ekte adresser + 1090 ruter): med Geonorge-posisjon er pin-
//            nøyaktighet identisk OSM/Kartverket vs Google; Geonorge treffer 93,5% presist. Geokoding
//            byttet fra google.maps.Geocoder → geokod.php (Geonorge). Markører/ruter via Leaflet-skall
//            (mkMarker/mkLinje/mkBounds). Leg-tider via fritt haversine-estimat (Google DistanceMatrix
//            var død med stengt billing). Samme stack som Område-assistent. GMAPS_KEY nå ubrukt.
// v1.89-dev: versjon vist bak BETA-badge i popup; varighet vises som «t/min» (fmtMin).
// === BASIC TOOLS v1.88-dev ===
// v1.88-dev: ROLLET TILBAKE Google-distansene (v1.87). Samkjørings-km regnes nå via ruter.php
//            (Geonorge+ORS = GRATIS); Google brukes KUN til selve kart-bildet (minst-mulig-Google,
//            + Google-billing var uansett lukket → distFn feilet stille). googleDist beholdt ubrukt.
// === BASIC TOOLS v1.87-dev ===
// v1.87-dev: PRESISE km/min via Google. Samkjørings-tallene (direkte + samkjørt per pasient) regnes
//            nå med Google DistanceMatrix (googleDist → kjerne v0.7 opts.distFn) i stedet for ruter.php
//            — matcher det operatørene ser i Google Maps. Avgjørende fordi tallet brukes til å NEKTE
//            en pasient en lengre adresse. Geometri (grønn linje) fortsatt ruter.php (kun visuell).
// === BASIC TOOLS v1.86-dev ===
// v1.86-dev: SAMKJØRING-bug «alt hentes / begge skal fra Ahus». En V-rad har ofte 2 showReq-reqId
//            (pasientens tur + PARET retur), og P-tripSearch kan returnere begge retninger. Flerbens-
//            ekspansjon tok begge → kjernen fikk en lukket Ahus↔hjem-løkke → alle stopp ble «hentes».
//            Fiks: V-rad = ÉN tur (primær-ben/resId, ingen flerbens); P-tripSearch filtreres til
//            benene radens showReq faktisk viser (kollapset rad = alle ben).
// === BASIC TOOLS v1.85-dev ===
// v1.85-dev: PÅGÅENDE-samkjøring hentes nå som Overvåker Live: ÉTT tripSearch på resId
//            (api.hentTurDetaljer → searchStatus submit_action=tripSearch&tripNr=<resId>) gir ALLE
//            ben med admin-adresser i ett kall — også på KOLLAPSET rad. Dropper openPopp/auto-åpne
//            + per-ben-løkka for P. V-rader uendret (rad-data + per-reqId-beriking). Mye mer robust.
// === BASIC TOOLS v1.84-dev ===
// v1.84-dev: openPopp AVMERKER raden ved åpning → markeringen forsvant og lesingen ble tom (måtte
//            merke på nytt). Nå fanges markerte rad-ids FØR åpning, lesingen skjer via de ids-ene
//            (ikke blå-filter), og den blå markeringen gjenopprettes etter ekspandering.
// === BASIC TOOLS v1.83-dev ===
// v1.83-dev: AUTO-ÅPNE kollapset samkjøring. En samkjørings-rad vises kollapset (bare ben 1 + «3»
//            + pil openPopp) — de andre benene er ikke i DOM. aapneSamkjoring() kaller nå NISSYs
//            openPopp(resId) på markerte kollapsede rader og venter til benene er lastet før lesing.
//            Sammen med v1.82 (flerbens-ekspansjon) gir det hele samkjøringen på kartet.
// === BASIC TOOLS v1.82-dev ===
// v1.82-dev: FLERBENS-RAD ekspanderes. En P-rad kan inneholde flere ben — tur+retur for samme
//            pasient, ELLER flere pasienter i én samkjørt bil (hver med egen showReq-reqId +
//            searchStatus-rekvnr). Før leste vi bare første ben → «Enkeltur». Nå: ett tur-objekt
//            per ben, hvert beriket via SIN reqId (delt resId ville kollapset benene til samme
//            adresse), pasientnavn fra admin per ben. Hele tur/retur + samkjøring tegnes.
// === BASIC TOOLS v1.81-dev ===
// v1.81-dev: ÉN markert tur tegnes nå òg på kartet (krever kjerne v0.6 som takler N=1). Tidligere
//            gatet alt på ≥2 → enkelt-tur ga blankt kart. Nå: rutet hent→lever-linje + «🚗 Enkeltur»-
//            panel (km/min, fra/til). N≥2 uendret.
// === BASIC TOOLS v1.80-dev ===
// v1.80-dev: PÅGÅENDE-bug i kartsjekk fikset. Admin-adresseoppslaget brukte kun (resId, resId)
//            som treffer VENTENDE (V), men P-rader ga «rekvisisjon uten adresser» → kjernen nektet.
//            Nå prøves flere (id, tripid)-kombos: (resId,resId)→(reqId,resId)→(reqId,reqId), første
//            med ekte fra+til vinner. V uendret, P får nå adresser.
// === BASIC TOOLS v1.79-dev ===
// v1.78/1.79-dev: KART-AVKAPRING. NISSYs «Vis kart» (#buttonShowMap) er ikke lenger kapret/farget —
//            den er helt native igjen (kart-problemer). Samkjørings-popupen åpnes nå fra en EGEN
//            knapp «🗺️ Vis kart+» (oransj) i footer-raden ved siden av Logg. aapneSamkjoring()
//            uendret (åpner for alle markerte turer). Høyreklikk-menyens «Sjekk samkjøring» beholdt.
// === BASIC TOOLS v1.77-dev ===
// v1.77-dev: samkjørings-popup — lista flyter som luftig overlay over kartet (halvtransparent + blur,
//            innholds-høyde, avrundet) i stedet for solid svart full-høyde-kolonne. Kartet fyller hele.
// v1.76-dev: oppsummering viser nå BASELINE (direkte) + omkjøring PER pasient + total gevinst (kjerne v0.5) —
//            avslører den dårlige passasjeren. Prod (1.75) urørt; kjerne-endring er bakoverkompatibel.
// v1.75-dev: fjernet grønt «Kan samkjøres» helt (til algoritmene er gjennomprøvde) — kun røde blokker + SV vises.
// v1.74-dev: grønt «✓ Kan samkjøres» droppes når omkjøringen er rød (≥40 %) — ikke gi falskt klarsignal
//            mot en dårlig samkjøring; den røde oppsummeringen taler for seg. (1.73 = prod-promotering.)
// === BASIC TOOLS v1.72-dev ===
// v1.72-dev: «Vis i kart»-gaten utvidet til 1-3 turer (3-pasient testet OK) → vår oransje popup; 4+ → native.
// === BASIC TOOLS v1.71-dev ===
// v1.71-dev: samkjørings-analysen åpnet for N turer (≥2) — kjerne v0.4 takler 2+ pasienter. Panel +
//            kart-tegning gjelder nå alle N. «Vis i kart»-knappen gates fortsatt til 1-2 (test 3+ via
//            høyreklikk «Sjekk samkjøring» til N er gjennomtestet, så utvider vi knappen).
// === BASIC TOOLS v1.70-dev ===
// v1.70-dev: «Vis i kart»-kapringen gates til 1-2 markerte turer (vår oransje samkjørings-popup);
//            3+ turer slipper gjennom til NISSYs native kart. Kjernen er 2-pasient (N-støtte droppet).
// === BASIC TOOLS v1.69-dev ===
// v1.69-dev: NISSYs «Vis i kart» (#buttonShowMap) kapret (dev) → åpner vår samkjørings-popup i stedet
//            for NISSYs eget kart. Capture-fase klikk på document hindrer inline-onclick; knappen
//            farges ORANSJ (setProperty important slår gjennom .bigbutton). Re-påføres hvert 3. sek.
// === BASIC TOOLS v1.68-dev ===
// v1.68-dev: 60-MIN-REGELEN som blokkerende dom — hentetids-justering > grensa = rød «kan ikke
//            samkjøres» (slått sammen med kapasitet i én banner m/ alle grunner). Grensa skalerer for
//            LANGTRANSPORT: maks = max(60, reisetid). Per-stopp justerings-hint blir rødt når over grensa.
//            FORMEL Å BEKREFTE med Thomas (reisetid = direkte reisetid for lengst-kjørende pasient).
// === BASIC TOOLS v1.67-dev ===
// v1.67-dev: omkjøringen flyttet UT av stopp-raden til eget «Oppsummering»-felt på slutten av panelet
//            (folding-i-rad ble utydelig). Viser pasienten som leveres sist + omvei (min/km/%) fargekodet.
// === BASIC TOOLS v1.66-dev ===
// v1.66-dev: kapasitets-FEIL = stor rød «⛔ KAN IKKE SAMKJØRES»-banner (alenetransport ble oversett).
//            Fjernet «+N min omvei» i toppen — forvirret mot omkjøringen i lista (to ulike mål, nesten
//            samme navn). Nå én omvei-verdi: pasientens omkjøring på leveringsstoppet.
// === BASIC TOOLS v1.65-dev ===
// v1.65-dev: samkjørings-panelet samlet til ÉN liste (slått sammen Pasienter + Kjørerekkefølge):
//            stoppene 1/2/3 med 🟢 Hentes / 🔴 Leveres, felles hentetid m/ retnings-regel (retur=seneste/
//            kun forsinkelse, tur=tidligste/kun fremskyndelse), «▶ Start kl» øverst, justerings-hint ved
//            ulike hentetider, og omkjøring foldet inn på siste pasients leveringsstopp (fargekodet %).
//            TODO: peke NISSYs «Vis i kart» (#buttonShowMap) hit etterhvert.
// === BASIC TOOLS v1.64-dev ===
// v1.64-dev: admin-adresser via ajax_reqdetails(id=resId, db=1, tripid=resId) — BEKREFTET gir ekte
//            gateadresser for ventende (V-rader: showReq=resId; rad-navn=resId; redit?id=resId — samme
//            tall). Bruker resId i begge felt. Overvåker-flyt, ingen Reisenr-kolonne.
// v1.63-dev: (mellomledd) leste reqId fra showReq — viste seg å være resId på V-rader; forenklet i 1.64.
// === BASIC TOOLS v1.61-dev ===
// v1.61-dev: konsistent visning i par-modus — gamle gruppe-lista (A/B/C-merking, manglet leveringer)
//            skjules; pasient-kort (retning/Hent/Opp/fra→til) ligger nå i analyse-panelet, og ALT
//            refererer til kartets 1/2/3. «hjem» omdøpt til «leveres» i kjørerekkefølgen.
// === BASIC TOOLS v1.60-dev ===
// v1.60-dev: ADMIN SOM ADRESSEGRUNNLAG (Thomas' krav) — tabellens Fra/Til er visningsnavn, ikke
//            adresser. Berikingen merker hver tur med adrKilde (admin/tabell) + adrFeil; kjerne-
//            analysen kjører KUN når begge turene har admin-adresser, ellers vises forklaring
//            (mangler Reisenr-kolonne / admin ikke innlogget / rekvisisjon uten adresser).
// === BASIC TOOLS v1.59-dev ===
// v1.59-dev: kjerne-analysen mater inn Googles geokoordinater (fraLL/tilLL i kjerne v0.3) — Geonorge
//            bommet på institusjonsadresser (felles-stoppet havnet sør for Ahus). Venter på Google-
//            geocoderen i stedet for å låse analysen til dårlig fallback.
// === BASIC TOOLS v1.58-dev ===
// v1.58-dev: cache-buster på kjerne-lastingen i samkjørings-popupen (?v=Date.now()) så ny kjerne-
//            versjon alltid hentes ferskt. Kjerne v0.2 slår sammen felles hentested på adressenøkkel.
// === BASIC TOOLS v1.57-dev ===
// v1.57-dev: i par-modus tegnes luftlinjene ALDRI (tegnAlle hopper over gruppe-visningen når kjernen
//            er aktiv) — før blinket de først og ble så erstattet. tegnKjerneRute zoomer nå selv til
//            ruta (fitBounds fra kjernens bounds).
// === BASIC TOOLS v1.56-dev ===
// v1.56-dev: kjerne-ruta ERSTATTER gammel gruppe-visning — tegnKjerneRute rydder bort luftlinjer
//            (blå/røde) og F/T-markører før den grønne ruta + nummererte stopp tegnes. Kun aktiv i
//            par-caset (2 markerte turer); ved 3+ turer vises gruppe-visningen som før.
// === BASIC TOOLS v1.55-dev ===
// v1.55-dev: race-fiks — kjerne-analysen ble ferdig FØR Google Maps init (opener trigger byggListe
//            tidlig) → map=undefined → grønn rute ble stille hoppet over. Tegning skilt fra analyse:
//            resultatet lagres (kjerneResultat) og tegnKjerneRute() kalles fra BÅDE analysen og
//            initMap — den som kommer sist med både kart og resultat tegner. Panel virket hele tiden.
// === BASIC TOOLS v1.54-dev ===
// v1.54-dev: «Sjekk samkjøring» bruker DELT KJERNE (samkjoring_kjerne.js) når nøyaktig 2 turer er
//            markert: kapasitetssjekk (full samkjorer-modell), omkjøring for siste pasient (min/km/%),
//            optimal kjørerekkefølge i panel + rutet grønn trasé m/ nummererte stopp på kartet.
//            Kjernen lastes i popup-head; eksisterende gruppering/visning urørt (additivt).
// v1.52-dev: signatur med bindestrek-navn (Gunn-Heidi G) — grådig regex traff navnets egen bindestrek.
// v1.51-dev: Endre tid leser/skriver melding i ISO-8859-1 (fiks: ÆØÅ ble ødelagt ved 2. endring).
// v1.50-dev: Tilordningsstøtte åpnet for alle (superadmin-sperren fjernet).
// v1.49-dev: Bekreft-modal for Tilordningsstøtte plasseres til venstre (over Ventende oppdrag).
// v1.48-dev: "🌐 Tilordningsstøtte alle (N)" — nytt menyvalg som tar ALLE V-rader i tabellen.
// v1.47-dev: Tilordningsstøtte filtrerer bort forslag uten transportør/avtale (typisk time-type).
// v1.46-dev: Tilordningsstøtte fix — håndlaget ids-format (matcher NISSYs eksakte JSON med mellomrom)
//            + console.log av request/response for debugging.
// v1.45-dev: "Tilordningsstøtte" — marker V-rader, høyreklikk → batches NISSYs assignVoppsAssist
//            i grupper på 5, auto-tildeler via assresassist. Gated til superadmin under uttesting.
// v1.44-dev: BETA-badge på "Sjekk samkjøring" (høyreklikk-meny + kart-popup tittel).
// v1.43-dev: "Trekk tilbake alle" → custom modal med rød advarsel istedenfor window.confirm
//            (tydeligere at man er i ferd med å gjøre en stor batch-operasjon).
// v1.42-dev: avvik-signatur uten punktum etter initialen ("Thomas W" istedenfor "Thomas W.")
// v1.41-dev: dekorerer NISSYs "Registrering avvik til ressurs"-dialog —
//            readonly tid-input over textarea (live PC-tid, settes på Lagre),
//            readonly navn-input under (Thomas W-format fra hentSignatur).
//            Lagre-knapp wrappes så textarea blir "{HH:MM} - {tekst}, {Navn}".
// v1.17-dev: "Sjekk samkjøring" — marker turer (V- eller P-), høyreklikk → kart med pasienter, tider, ruter
// v1.18-dev: ikke filtrer turer uten Fra/Til (kolonner kan være skjult); fall back på live admin-API
// v1.19-dev: V-rader har Fra+Til i én celle (br-separert) + sett TURER via window-prop, ikke inline JSON
// v1.20-dev: BR-detection før header-lookup — V-rad kan ha "Fra"-header som peker på kombinert celle
// v1.21-dev: samkjøring-algoritme — geocode + grupper på fra-nærhet, vis info i popup
// v1.22-dev: blå-font fallback for henteTid + A/B/C-sekvens på kartet for samkjøring-grupper
// v1.23-dev: detekter retur/ut via tid (Hent≥Opp = retur), vis kun riktig forslag-retning
// v1.24-dev: cluster også på TIL-nærhet (felles destinasjon — ut-tur-samkjøring)
// v1.25-dev: fix grupperings-bug + Tur/Retur-merke per tur så bruker ser at skriptet forstår retning
// v1.26-dev: rute-rekkefølge for felles-til = sorter pickups på avstand fra drop (fjernest først)
// v1.27-dev: delta vises på selve tur-kortet (Hent: 10:11 → 10:12 (+1)), ikke i egen forslag-boks
// v1.28-dev: +5 min per stopp ved felles-til + tydeligere farge på endrede kort
// v1.29-dev: tur: anker siste pickup på hans Hent, bakover med −5/stopp (aldri plusse)
// v1.1: tid-input auto-formaterer "1300" → "13:00" når 4 sifre er skrevet
// v1.2: trip.comment-delta er nå TOTAL forskyvning fra opprinnelig tid, ikke akkumulert liste
// v1.3: høyreklikk på P-rader (pågående) → "Trekk tilbake" (batch, kun fremtidig dato).
//       Bruker NISSYs egen window.removePaagaaendeOppdrag(resId, reqId) som transport.
// v1.4: 400ms delay mellom hver trekk-tilbake — NISSY rate-limiter ved batch (max 3 ble prosessert)
// v1.5: 800ms delay (400 var fortsatt for fort på batch >5) + progress-toast under kjøring
// v1.6: vent til P-rad faktisk forsvinner fra DOM før neste kall (adaptivt vs fast delay)
// v1.7: kombinerer DOM-polling med minimum 2 sek mellom kall — DOM alene ga 5/10
// v1.8: dynamisk kø — re-detekter markerte P-rader fra DOM mellom hvert kall
// v1.9: klikk X-img direkte i DOM (mimicker manuell flyt) + "Trekk tilbake alle uten ERS/RB/A/TK"
// v1.10: finn X-img via onclick-attribute (img[src=...] feilet 13/13 i v1.9 — ukjent variasjon)
// v1.11: søk X-img globalt i document via onclick-attribute (rad-lookup feilet etter re-render)
// v1.12: ventTilBorte 5s → 10s + delay 500ms → 1000ms (7/13 i v1.11 — noen rakk ikke fjernes)
// v1.13: "Trekk tilbake alle" auto-retryer — re-scan + ny runde til ingen progress
// v1.14: auto-bekreft varslingsboks (window.confirm + custom dialog) under batch-trekk-tilbake +
//        finn Behov-kolonne via thead i stedet for hardkodet tds[5] (kolonner kan være skjult/fjernet)
// v1.15: søk th-tekst globalt i tabellen (NISSY har ikke ekte <thead>-wrapper, bruker tr.tbh).
//        Ingen caching siden bruker kan legge til/fjerne kolonner dynamisk under bruk.
// v1.16: auto-retry også på markerte-flyten (samme som "alle" hadde fra v1.13)
// Inline-handlinger på NISSY-rader (høyreklikk-meny, endre hentetid, etc).
// Lastes inn av verktoykasse.js som host. Forventer at verktoykasse har satt:
//   window.__vkt_brukernavn  — NISSY-brukernavn (f.eks. 'thwe')
// Dev-versjon: basic_tools_dev.js (samme API, brukt for testing).
(function() {
    // v1.118-dev: km-dommen måles mot FOLKEREGISTRERT adresse (Thomas 03.07: «Folkeregistrert er
    //             fasiten») — pasienten kan fritt reise kortere enn kravet sitt; forrige hentested
    //             er irrelevant (kan alt være endret). pasient_adresse fra admin-plakaten (fantes
    //             i vkt) propageres som t.pasientAdresse; popupen viser «Krav (folkereg.): X km |
    //             Alternativ: Y km» + nåværende til info. Mangler adressen → gammel dom m/ varsel.
    // v1.117-dev: ÉN knapp i stedet for to (Thomas 03.07): «Bytt hentested + hentetid → HH:MM i
    //             NISSY» gjør adressebytte OG tidsjustering i samme klikk (leser #aaNyTid-feltet
    //             live; tomt/ugyldig/uendret felt → kun adressebytte). Confirm viser begge. Ved
    //             delvis suksess (adresse ok, tid feilet) → oransje ⚠-status + forklaring.
    //             + REGIONTILLEGG i deltaet (Thomas: «plusser ikke NISSY på 20 min?»): hentetid =
    //             oppmøte − (reisetid + tidstilleggRegionalt); tillegget er adresseavhengig og
    //             medregnes nå (nissyDelta) — vises i boksen når det endres over regiongrense.
    // v1.116-dev: endreTidPaaResId VERIFISERES (samme falsk-suksess-felle som altRequisition/v1.107):
    //             HTTP 200 fra /confirm ≠ lagret — nå plukkes feiltekst fra responsen og skjemaet
    //             re-hentes for å sjekke at departureTime faktisk ble ny tid (Thomas 03.07: «Tiden
    //             ble ikke endret» tross grønn knapp). + dev-logging (window.__bt_confirmRespons).
    // v1.115-dev: tidsfeltet vises kun på VENTENDE turer — pågående kan ikke endres herfra,
    //             så der vises bare forslaget som tekst (Thomas 03.07).
    // v1.114-dev: hentetid-forslaget er nå REDIGERBART (Thomas: «tekstfelt så vi kan overstyre
    //             hvis pasienten vil ha bedre tid») — #aaNyTid-input forhåndsutfylt med forslaget;
    //             🕐-knappen leser feltet live (ugyldig format → tilbake til forslag).
    // v1.113-dev: beregnReisetid-500-GÅTEN LØST (Thomas' DevTools-diff + replay-tester) — TRE feil
    //             lag på lag: (1) Content-Type må være application/x-www-form-urlencoded (rå JSON-
    //             kropp, Prototype-stil) — application/json ga generisk 500; (2) transportType må
    //             være 'TAX' — tom streng ga enum-500; (3) planleggerens Array.prototype.toJSON
    //             dobbel-encoder [] → "[]" i JSON.stringify → Jackson-feil (fjernes midlertidig
    //             under serialisering). Aldri noe wizard-sesjonskrav. Verifisert {reisetid:13}.
    // v1.112-dev: DIREKTE beregnReisetid-kall uten edit-skjema (Thomas: payloaden er ren adresse —
    //             ingen turid/rekvnr). Fallback når edit-veien feiler (pågående turer nekter trolig
    //             edit): adresser fra popupens admin-fasit + behandlingstidspunkt fra admin-plakatens
    //             oppmøtetid m/ dato (nytt t.oppmoteRaw). Tester samtidig om wizard-sesjonskravet
    //             fra 02.07-500-en var reelt.
    // v1.111-dev: FIX «Retning fremdeles ukjent» på P-rader — P-grenen i byggTurer (tripSearch/
    //             hentRekvisisjon-per-ben) bygde turen selv og droppet retning/tider; adminFasit()
    //             (felles helper) kjøres nå i begge grenene, og fallback-løkka sender retning/
    //             klar_fra/oppmote_tid videre.
    // v1.110-dev: retning + tider fra ADMIN-PLAKATEN (fasit): beriktTur propagerer rek.retning
    //             («Til / Fra behandling»), rek.klar_fra («Pasient klar fra» → henteTid) og
    //             rek.oppmote_tid fra ajax_reqdetails (vkt v2.131) — «Retning ukjent» borte når
    //             admin svarer, og P-rader uten tidskolonner får tider. Admin-retningen trumfer
    //             tids-heuristikken. + reisetid-forhåndsboksen vises nå også for PÅGÅENDE turer
    //             (info-lesing; selve adresseskrivingen er fortsatt sperret).
    // v1.109-dev: tidsberegning FERDIGSTILT: (1) ruter-estimat som fallback når NISSYs beregnReisetid
    //             ikke svarer (kjøresekunder fra km-dommens ruter.php-svar, merket «estimat»), så
    //             hentetid-forslaget alltid vises; (2) dev-diagnostikk på hvert bail-punkt i
    //             forhandsberegnReisetid (03.07-testen feilet sporløst).
    // v1.108-dev: reisetid-forslaget kommer nå FØR bytte-knappen (Thomas: operatøren må avklare ny
    //             hentetid med pasienten før byttet). Ny forhandsberegnReisetid (read-only GET av
    //             edit-skjemaet + 2× beregnReisetid) vises rett etter km-dommen; resultatet gjenbrukes
    //             i byttAdresse + 🕐-knappen. FIX 500: beregnReisetid krever wizard-tilstand i
    //             server-sesjonen — kalles nå FØR altRequisition-POST (etter lagring er den borte).
    //             + dev-logging av beregnReisetid-feilkropp.
    // v1.107-dev: adressebytte VERIFISERES nå (gardermoen-mønsteret) — HTTP 200 fra altRequisition
    //             betyr ikke lagret; ved valideringsfeil ekkoes skjemaet tilbake og popupen viste
    //             falsk grønn ✓. Nå: feiltekst plukkes fra responsen + edit-skjemaet hentes på nytt
    //             og adressen sammenlignes før suksess meldes. + FIX beregnReisetid brukte feil
    //             feltnavn (treatmentDate → treatmentDatePart) så hentetid-forslaget aldri kom.
    // v1.106-dev: FIX «Kunne ikke beregne alternativ rute» — ruter.php kan time ut på kald cache
    //             (server-side geokoding+ruting); km() prøver nå 2 ganger (retry treffer varm cache)
    //             + «Prøv igjen»-lenke i feilmeldingen i stedet for blindvei.
    // v1.105-dev: HENTETID-FORSLAG via NISSYs egen tidberegner (rekvisisjon/ajax/beregnReisetid, funnet
    //             av Thomas i DevTools). Ved bytte av HENTESTED beregnes reisetid for orig + ny adresse
    //             (delta-tilnærming bevarer turens slakk); popupen viser «NISSY-reisetid X → Y min» +
    //             foreslått ny hentetid og 🕐-knapp som justerer via endre tid-flyten (endreTidPaaResId,
    //             nå eksponert som __basicTools.endreTid). Ved bytte av leveringssted: info om at
    //             hentetiden ikke påvirkes.
    // v1.104-dev: utsendelsesvarsel skjulte NISSYs blå radmarkering (blink-bakgrunn m/ !important).
    //             Blinken pauses nå på markerte rader og gjenopptas ved avmarkering — klikk-synk
    //             (utvSynk) gjør det umiddelbart, uten å vente på 20s-ticken.
    // v1.103-dev: «Annen adresse»: LENGRE reise kan nå godkjennes med OBLIGATORISK begrunnelse (sperren
    //             «endring tilbys ikke» fjernet). Kommentarfelt i panelet (valgfritt ved kortere/lik).
    //             ALL adresseendring logger nå auto-notat i trip.comment («Endret hentested … (+X km)»
    //             + evt. begrunnelse + signatur, gardermoen-merge). + dev-diagnostikk for NISSYs
    //             innebygde tidberegner: __basicTools.diagTidberegner(resId) + logging av tidsfelter
    //             i altRequisition-responsen (grunnlag for auto-justering av hentetid, steg 4).
    // v1.102-dev: utsendelsesvarsel gjenoppretter blinkingen RETT etter NISSY re-render (MutationObserver,
    //             debouncet 600ms) i stedet for å vente på 20s-intervallet. Reisetid er cachet → billig.
    // v1.101-dev: FIX utsendelsesvarsel ignorerte DATO — lesTurDataFraRad strippet dato («25.06 07:09»
    //             → «07:09»), så turer en ANNEN dag ble evaluert som i dag → falsk blink. Beholder nå
    //             tidRaw m/ dato-prefiks; utvOppdater hopper over turer med dato ≠ i dag.
    // v1.92-dev: fix popup-frysing under geokoding — geo()-timeout + parallell geocodeAlle.
    const VERSJON = '1.227';  // HVEM BA OM TIDSENDRINGEN (Thomas 28.08). Kommentaren sa HVA som skjedde («-28 Opprinnelig tid 14:30»), men ikke på hvems initiativ — og det er spørsmålet som kommer når noen leser turen i ettertid. Nå: «-28 Opprinnelig tid 14:30. Av Thomas W for PRK», med rullgardin (Pasient/Behandler/PRK/Rekvirent/Transportør) og signatur fra samme kilde som avvik-dialogen. ⚠️ KOMMENTAREN ER EN KONTRAKT — deltaet leses tilbake fra den, og ankeret matchet ikke med punktum etter klokkeslettet: treffet ville falt, koden gått i gammelt-format-grenen, og neste endring skrevet «Opprinnelig tid» to ganger. Parseren tåler nå [.,]. ⚠️ Vår egen signatur ERSTATTES ved ny endring, ikke stables — endrer to operatører samme tur skal siste stå. Kun mønsteret vi selv skriver fjernes; annen tekst i kommentaren er noen andres  // «Innstillinger» og «Vis kart+» får samme låste boks som verktøykassens footer-knapper (2.211-dev). De tre sto med hver sin høyde fordi to av dem manglet line-height og lot emojien bestemme linjeboksen — og de bygges i hver sin fil, så ingen så dem ved siden av hverandre i koden. De står ved siden av hverandre på skjermen  // tipsteksten i Innstillinger pekte på «🧰 Verktøy» etter at knappen ble 🔧 (verktoykasse 2.210-dev). En hjelpetekst som beskriver et ikon som ikke finnes, sender folk på leting  // MØRKT TEMA HOLDES I DEV (Thomas 27.08: «ser ikke bra ut, den forblir i Dev»). Bryteren bygges kun når ER_DEV, og temaet gjenopprettes ikke ved oppstart i prod. Det siste er ikke pynt: nøkkelen vkt_mork_tema ligger i samme localStorage på samme origin, så uten den vakten ville alle som har prøvd temaet i dev fått det med seg inn i prod ved neste bookmarklet-trykk. Koden blir stående — den er ferdig, det er utseendet som ikke er det  // ÉN MODAL FOR HELE HENDELSEN (Thomas 27.08: «kan vi slå sammen prosessen? Hva skulle vi kalt den?» → «Bomtur / avbestilling»). Før: meny → statusvalg → bekreftelsesdialog → panel. Fire steg for én hendelse, der de tre første bare ledet frem til det fjerde. Nå åpner menyvalget panelet direkte, og er turen ikke satt til «Ikke møtt» ennå, står knappen som gjør det øverst — resten (kode, Teams, årsak, avvik) fyller seg inn i SAMME vindu når registreringen er gjort. Ingen confirm() på toppen: panelet navngir pasienten, viser statusen NISSY står med, og knappen sier hva den gjør — å åpne panelet skriver ingenting. «Ikke møtt» i statusmenyen ruter hit i stedet for å gjøre en halv registrering operatøren tror er hel  // RTP/RTB ERSTATTER «T.» I AVVIK (leders svar 27.08: «det ønskes to bokser — RTP ringt til pasient, RTB ringt til behandler»). To avhukinger i stedet for én KMP-boks, skrevet rett etter «tid - » der Lives regex leter, og de samme boksene i bomtur-panelets avviksfelt: to felter som skriver i SAMME logg må skrive samme form. ⚠️ RTP ER IKKE KMP — Lives markører betyr «kontakt MED pasient», altså at noen fikk svar, mens «ringt til» bare sier at forsøket ble gjort. Å oversette RTP→KMP for å blidgjøre Live ville registrert kontakt som kanskje aldri skjedde, og Live bruker KMP-tidspunktet til SMS-timing. Markørene skrives derfor slik seksjonen har bestemt dem, og Live må læres opp — til det skjer teller RTP/RTB ikke i sist-kontakt  // ÅRSAKEN MANGLET PÅ RESSURSKORTET (Thomas 27.08: «står ikke T1 der?») — kortet viste «kode 0910 · meldt 10:40» uten årsak. Jeg leste årsaken ut av TEKSTEN i ajax_reqdetails, basert på at detaljvisningen skriver «Bomtur: T1 - Forsinkelse (id 0910)» — men det er ikke nødvendigvis samme side, og markupen kan variere. Nå spørres NISSYs EGEN dialog (showdidnotshow) når teksten ikke gir noe: der står det lagrede valget merket selected, samme kilde som nedtrekkslistene i panelet. Tekstveien beholdes som gratis førstevalg, og dev-konsollen dumper nå hva som faktisk står rundt hver «Bomtur» i svaret når den bommer  // LENKE TIL TILTAKSBOKA fra Årsak-seksjonen (Thomas 27.08): kort #25812 «Bomturkategorier» i Bliksund GRID. Hva kodene faktisk betyr står ikke i NISSY — nedtrekkslisten gir bare «T1 Forsinkelse», mens tiltakskortet sier at det betyr 16 min TIL / 46 min FRA behandling. Og flere koder er merket «Ikke i bruk» (P5, P7, PRK 9–11) uten at NISSY røper det. Fasiten hører derfor hjemme ved siden av valget, ikke i et regelverk noen skal huske å slå opp  // __basicTools.bomturDetaljer(rekvnr) — slår opp kode + lagret årsak fra rekvisisjonsNUMMERET alene, slik fremmestatus kan si mer enn «meldt» på ressurskortet. Årsaken står i samme ajax_reqdetails-svar når den først er lagret: «Bomtur: T1 - Forsinkelse (id 0910)». Merk kolonet — «Bomturnummer:» har ingen, så de to mønstrene kolliderer ikke  // ÅRSAK OG AVVIK INN I SAMME PANEL (Thomas 27.08: «kan vi ha dropdown fra bomturkoder og avviksfelt der, så alt er i én UX?»). Operatøren står med telefonen i den ene hånden; å sendes gjennom NISSYs bomtur-dialog for årsaken og DERETTER inn i avvik-dialogen for forklaringen er to kontekstbytter for én hendelse. Nedtrekkslistene FYLLES FRA NISSY (action=showdidnotshow), aldri fra en liste vi skriver selv — vi kjenner P1–P8 og T1–T9, men ikke PRK/Rekvirent, og en hardkodet liste er uansett feil dagen NISSY endrer en kode. Lagring er nøyaktig doSetDidNotShow sitt kall, med tilbakelesing: viser NISSY ikke valget som selected, sier panelet fra i stedet for en grønn hake man ikke kan stole på. Vi forhåndsvelger fortsatt INGENTING. Avviket bruker setResourceDeviation (i drift i Live/Avvik) og formatet «HH:MM - tekst, Signatur» slik Live kan lese linjen. ⚠️ rid er PLANLEGGERENS resId, ikke admins 81-serie — og før skriving kontrolleres det at ressurskortet faktisk nevner turens Reisenr: et avvik i feil tur står hos en pasient som ikke har noe med saken å gjøre  // «📋 Avbestilling til Teams…» som EGET menyvalg (Thomas 27.08: «hvor kommer avbestilling opp så operatøren bare kan kopiere?»). Meldingen dukket før bare opp i sekundet etter en statusendring — men normalsituasjonen er en tur som ALLEREDE står som «Ikke møtt»: koden finnes, den skal bare videre til sentralen, og eneste vei dit var å sette statusen på nytt. Nå hentes koden for raden og samme panel åpnes. Mangler koden, sier vi hva som mangler («opprettes når statusen settes til Ikke møtt») i stedet for «fant ingenting» — ellers leter operatøren i NISSY etter noe som ikke finnes ennå. Ved samkjøring spørres det hvem avbestillingen gjelder: de andre skal fortsatt kjøres  // BOMTURKODEN ER FIRESIFRET OG NULLEN FORAN ER EKTE (Thomas 27.08: «alt før 10:00 må vi legge på en null — jeg kommer til å få tilbakemelding på det»). Koden stammer fra bomturens Opprettet-klokkeslett (09:10 → 0910) og tastes av sjåføren på taksameteret, men NISSY lagrer feltet som et TALL og spiser den ledende nullen: «Bomturnummer: 910». Ga vi den videre rått, tastet sjåføren tre siffer på en firesifret kode. Padres nå overalt — panelet, toasten og Teams-meldingen — og krysspeiles mot Opprettet i SAMME boks (svaret har flere Opprettet-felter). Er de uenige, varsler panelet i stedet for at vi velger: da har antakelsen om klokkeslettet brutt sammen, og hvilket tall sjåføren skal få er ikke vår avgjørelse  // AVBESTILLING TIL TEAMS (Thomas 27.08, mal ordrett fra ham): bomtur-panelet bygger nå meldingen til sentralen — Avbestilling / TurID / Bomturkode — med kopi-knapp, og viser den i klartekst FØR den kopieres, siden blind innliming i en Teams-tråd er ubehagelig. Bomturkoden padres til fire siffer (0910). Pasientlinjen skrives KUN ved samkjøring: der rommer én tur flere pasienter og de andre skal fortsatt kjøres, mens TurID alene identifiserer en enkelttur entydig — navnet ville da bare vært pasientopplysninger på avveie. Uten TurID tilbys ingen mal: et skjema med tomt felt limes inn som det står  // BOMTUR-KOMMENTAREN FORSVINNER: doSetDidNotShow() er nå kartlagt, og den sender KUN cat og cause til ajax-dispatch?action=setdidnotshow — linjen med «text=» er kommentert ut i NISSYs egen kode. Fritekstfeltet står igjen i dialogen og tar imot skriving, så en operatør som forklarer bomturen der mister forklaringen uten å få vite det. Panelet sier nå fra, og peker til avviket. Samme funksjon: closeDidNotShow() ligger utenfor kategori-testen, så dialogen lukkes pent selv når ingenting ble lagret  // «Registrer årsak…» i bomtur-panelet åpner NISSYs EGEN dialog via doShowDidNotShow('', reqId, '') — statusteksten i raden er den lenken, og den kjører i planleggerens kontekst med gyldig sesjon. Dermed faller admin-vinduet, DWR-replikeringen og CSRF-vakten bort (DWR-CSRF er PÅ i /administrasjon/, AV i /rekvisisjon/). Kategori og årsak fylles bevisst IKKE ut av oss: valget er en faglig vurdering som blir stående i statistikken  // BOMTURNUMMER TIL OPERATØREN (Thomas 27.08: «den skal vi gi ut til sjåføren, sendes til sentralen på Teams»). Nummeret tildeles ved statusendringen — verifisert: det sto der med ulagret årsak — så det kan leses opp umiddelbart. Kilden er ajax_reqdetails, IKKE searchStatus?id=: den siden viser bare søkeresultatet, og bomtur-boksen lastes først når raden KLIKKES. Vises i et vedvarende panel med kopier-knapp, ikke en toast som forsvinner mens du har telefonen i den andre hånden  // NATIV MENY PÅ AVSLUTTEDE TURER (Thomas 27.08): en tur satt til «Ikke møtt» mister X-ikonet — den kan ikke trekkes tilbake — og handleren returnerte da UTEN preventDefault. Menyen forsvant altså på nøyaktig de radene der statusvalget er mest aktuelt. Nå vises HELE menyen med trekk-tilbake grået ut og begrunnet («turen er avsluttet», ikke «kun fremtidig dato», som ville sendt operatøren på jakt etter en datofeil). reqId hentes fra toggleManualStatusRequisition/showReq når X-ikonet er borte  // NATIV MENY PÅ AVSLUTTEDE TURER (Thomas 27.08): en tur satt til «Ikke møtt» mister X-ikonet — den kan ikke trekkes tilbake — og handleren returnerte da UTEN preventDefault. Menyen forsvant altså på nøyaktig de radene der statusvalget er mest aktuelt. Nå åpnes statusmenyen direkte, og reqId hentes fra toggleManualStatusRequisition/showReq når X-ikonet er borte  // «Ikke mÃ¸tt» i toasten: searchStatus svarer UTF-8, mens jeg hardkodet ISO-8859-1 fordi ajax-dispatch og manualtrip er det. Tegnsettet leses nå fra Content-Type, med UTF-8-forsøk og latin-1-fallback først når dekodingen gir erstatningstegn. Kjeden virket: POST-en satte statusen og tilbakelesingen fant riktig rad — det var kun visningen som var feil  // tilbakelesingen sa «NISSY svarer: ukjent» — jeg gjentok nøyaktig den feilen verktøykassen gjorde i 2.187: naken GET searchStatus?nr=, som er dokumentert BLINDVEI (tomt skall). Søket er POST reqSearch + requisitionNumber. Svaret er dessuten ISO-8859-1, så «Ikke møtt» ville blitt feiltolket selv med riktig søk. Plukker nå raden som bærer VÅR reqId, siden én rekvisisjon kan gi flere treff  // reqId var LEST FRA FEIL ARGUMENT: X-ikonet er removePaagaaendeOppdrag('<reqId>','<resId>') — omvendt av navnene i lesPaagaaendeArgs — så statusen ville blitt satt på et oppdragsnummer. Fanget før første ekte POST fordi radoppslaget feilet på samme forveksling  // menytittelen leste cells[1], som i pågående er LØYVET (A9189), ikke pasienten. Leser nå PNAVN-kolonnen via headeren, og tåler begge linjeformene NISSY bruker ved samkjøring (<div> per passasjer ELLER <br>) — ellers falt navnene ut nettopp på radene der det betyr mest  // statusmenyen fant ikke raden igjen (P-81662441): id-en på P-raden er ikke nødvendigvis tallet removePaagaaendeOppdrag kaller resId — samme avvik mellom id og name som fremmestatus gikk i. Holder nå på ELEMENTET fra høyreklikket; oppslaget er nødutgang. + menyen navngir pasienten øverst i stedet for «1 tur valgt» (Thomas: «den viser ikke hvem jeg har trykket på») — det eneste operatøren trenger bekreftet før hun trykker, er at hun traff riktig linje  // MANUELL STATUSENDRING fra kontekstmenyen (Thomas 27.08) — verktøykassens FØRSTE skriving inn i drift. Status settes per REKVISISJON, ikke per tur, så menyen navngir pasienten øverst og krever et valg når bilen er samkjørt; ingen batch-variant finnes med vilje. Statusene er NISSYs egne fra manualStatus-skjemaet (26 Startet, 27 Framme, 28 Ikke møtt, 29 Avvist av pasient) — merk at «Avbestilt» IKKE finnes der, så bomtur har en vei og avbestilling har det ikke. Statusen leses tilbake fra searchStatus etterpå: forskjellen på «vi sendte» og «det ble gjort» er hele poenget når transportøren ser resultatet  // varseltrekanten fjernet fra avvikslinjene: den sto på hver eneste linje i en liste som utelukkende er avvik, og bar dermed ingen informasjon. Merknader beholder 📝 — de er unntaket. Merk unntaket, ikke regelen  // LESBARHET i avvik-historikken (Thomas 26.08): 11 px #4b4b3f på krem var dempet som en fotnote, men dette er det operatøren skal lese FØRST — ofte med telefonen i den andre hånden. Hvit bunn, #1c1917 (~15:1), 12,5 px, skillelinje mellom poster, markørene på gul bakgrunn  // AVVIK-DIALOGEN BLE IKKE ALLTID DEKORERT: observeren lette etter tittelteksten i en TILFØYD node, og traff ikke når NISSY bare viser en eksisterende dialog igjen. Nå polles #resourceDeviationText (stabil id fra dumpen 26.08) hvert 0,5 s som sikkerhetsnett; observeren beholdes fordi den treffer raskere  // TIDLIGERE AVVIK I DIALOGEN (Thomas 26.08). Dialogen bærer resId selv (#resourceDeviationId), så vi henter Lives lettvekts-ressurskort (action=showres) og viser Merknad/Avvik over skrivefeltet. Operatøren vet i dag ikke om noen andre allerede har ringt pasienten uten å lukke dialogen og lete. Markørene KMP/KMB/EPT/IFS/IST utheves  // KMP-AVHUKING i avvik-dialogen (Thomas 26.08). «T.» foran navnet betyr «snakket med pasient» for et menneske, men Overvåker Live kan ikke lese den — Live krever markøren rett etter «tid - » (EPT|IFS|KMP|KMB|IST). Avhukingen skriver KMP på Lives form, så kontakten telles i sist-kontakt-logikken i stedet for å være usynlig  // HSL i stedet for hvitblanding: å blande mot hvitt AVMETTER, så #0000FF og #330066 endte som to bleke pasteller — dårlig å lese og nesten umulig å skille. Nå beholdes kulørtonen, metningen låses til minst 65 %, og kun lysheten heves (mål 5:1)  // <font>-fargene ble aldri vurdert: bakgrunnen ble målt på <td class="d">, som er GJENNOMSIKTIG — alpha=0 ga null og hele sjekken ble hoppet over. Nå klatrer vi opp til noe som faktisk er malt  // VENTENDE bruker <font color="#0000FF"> i cellene, ikke inline stil på raden — gammel HTML, samme problem. Behandles likt: behold kulør, løft lyshet. style.color slår color-attributtet, og å nullstille stilen gir NISSY attributtet tilbake urørt  // STATUSFARGE PÅ MØRK BUNN: #0000CE var uleselig etter at stripingen ble mørk. Å frede fargen holdt ikke, å overskrive den ville slettet signalet — tredje vei er å BEHOLDE KULØREN og løfte lysheten til 4,5:1 (WCAG AA). Blå forblir blå. Originalen lagres, så «tema av» gir NISSY fargen tilbake uendret  // radstripingen mørknet (tr.even/tr.odd) — trygt fordi stripingen ligger i stilarket mens statusfargene settes inline. Tekstfargen settes PÅ RADEN, aldri på cellen: inline color på <tr> slår vår regel og beholder statusblåfargen, mens en regel på td.d ville vunnet over den arvede inline-fargen og stille slettet merkingen  // KONTRASTVAKTEN FREDER INLINE TEKSTFARGE: NISSY skriver status rett på raden (line-through + color:red + color:#0000CE). Jeg antok tidligere at tekstfarge var pynt i NISSY — feil. Vakten hoppet allerede over disse radene, men ved flaks (de har ikke egen bakgrunn), ikke ved design. Nå er det en regel  // div.box (panelflaten bak tabellene, ~5 Mpx hvitt) mørknet. Den slapp unna kartleggingen fordi NISSY skriver «background: white» med NØKKELORD — fargeregexen fanget bare hex og rgb(). Radene er urørt som før  // skjold-menyen og Innstillinger-panelet lukker nå hverandre — begge er fixed og like brede, og åpne samtidig la de seg oppå hverandre  // KONTRASTVAKT (Thomas 25.08: «liker Dark Theme, men ikke hvit tekst»). NISSYs eget mørke tema setter hvit tekst globalt, men statusfargene ligger INLINE og er lyse — hvit på lysegrønn er uleselig. Vakten regner relativ luminans og bytter TEKSTFARGE når kontrasten er under 3,5:1. Bakgrunnen røres aldri; statusfargen er data. Alltid på uten bryter: den kan per konstruksjon bare forbedre, og gjør ingenting i Standard theme  // «Vis skjold»-bryter i Innstillinger, default PÅ (Thomas 25.08). kpPaa skiller nå «ikke valgt» fra «valgt av» — uten det ville en oppgradering skjult skjoldet for alle. Menyen nås uansett fra «🧰 Verktøy» i footeren (verktoykasse 2.197-dev)  // MØRKT TEMA (Thomas 25.08) — overstyrer NISSYs egne selektorer, så vi arver spesifisiteten og vinner på rekkefølge; ingen !important. TURFARGENE ER GARANTERT URØRT av mekanikken: dispatch.css inneholder ingen statusfarger, de settes inline i HTML-en. De fem som så ut som statusfarger var død kode (IE-scrollbar + utkommentert). Radstriping og popup-bakgrunner står også med vilje — mørk ramme, lyst arbeidsområde. Av som standard  // TEMAET LOT SEG IKKE BYTTE (Thomas 25.08): en native <select> tegner nedtrekkslisten UTENFOR dokumentet, så klikket på et valg ble lest som «utenfor panelet» og lukkeren rev panelet vekk før change fyrte. Byttet til knapper — applyTheme laster uansett siden på nytt, så en nedtrekksliste ga ingen gevinst. + lukkeren respekterer nå fokus i panelet  // ⚙️-knappen heter nå «Innstillinger» og har fått verktøykassens oransje — footeren er bare våre egne knapper igjen, og da skal de se ut som én familie  // PROFIL i kontrollpanelet (Thomas 25.08): navn, rolle, kjørekontor og e-post fra window.__vkt_tilgang — verktoykasse_tilgang.php sender nå epost/brukernavn, feltene ble hentet i SQL-en men aldri sendt videre. Avatar-plassen er laget: initialer med deterministisk farge, generert LOKALT, og t.bilde brukes hvis det en dag finnes — slik at slottet er klart uten at noen må lage 60 karikaturer først. Panelet 250 → 320 px, seksjonsdelt  // + tema-velger og «Dynamiske plakater» inn i panelet (Thomas 25.08). Begge speiles mot NISSYs egne elementer: checkboxen KLIKKES så storeDynamic() fyrer, temaet får et change-event så applyTheme(this) kjører med deres eget element. ⚠️ #dynamic_poster er også ankeret vårt i footeren — derfor skjules cellen, den fjernes ikke  // NISSYs ping-felt UT AV FOOTEREN (Thomas 25.08): #logger er en logBox på 745 px og spiser mesteparten av bredden. Cellene SKJULES — nodene blir liggende så NISSYs egen kode virker som før — og kontrollpanelet speiler dem: knapp som klikker deres egen #buttonPing, og en boks som viser #logger. Vi flytter ikke noder; NISSY re-rendrer footeren og ville bygget dem opp igjen  // FREMMESTATUS SPLITTET UT til fremmestatus_dev.js (Thomas 25.08: «ligger ikke mange av skriptene i egne filer for å holde størrelsen nede?»). 468 linjer ut, ingen delt tilstand. Konkret gevinst: Fremmestatus er ferdig og verifisert, men kunne ikke til prod uten å dra 54 versjoner annet dev-arbeid med seg — nøyaktig koblingen splittingen av basic_tools selv skulle fjerne  // NØDBREMSEN FJERNET (Thomas 25.08). En udokumentert localStorage-nøkkel er ingen brems — ingen vet om den. Den ekte finnes allerede: verktøykassen lastes fra serveren ved hvert bookmarklet-trykk, så et problem løses med én push og neste innlasting. Fremmestatus er nå helt tilstandsløs: ingen bryter, ingen localStorage, ingen opprydding  // localStorage-cachen FJERNET (Thomas 25.08: «trenger vi localstorage lenger med dette oppslaget?»). Begge grunnene falt bort med tabellknappen. Og den hadde en latent feil: «endelige» svar levde 12 timer, men ved samkjøring kommer én 1709 PER rekvisisjon til ulik tid — første passasjers fremme-tid frøs svaret for de neste. Nå: minne-cache, 60 s, én TTL for alle svar, ingen kvotehåndtering, ingen utkasting, ingen frmEndelig  // Fremmestatus er PÅ som standard og har ingen bryter lenger (Thomas 25.08: «så soft på systemet at den ikke trenger å være valgbar»). Den koster null før et ressurskort åpnes og skriver ikke i noe andre skript leser — det var tabellknappens problem, ikke popupens. Nøkkelen vkt_fremmestatus='av' beholdt som udokumentert nødbrems  // RADEN KAN MANGLE reqId HELT (tur 72127538): ferskeste blokk hadde ingen AddRequisition — turen kom dit via AssignToNextCA etter at en transportør avviste, og rekvisisjonsnumrene lå bare i den gamle blokka under en ANNEN tur. Popupen oversetter nå turid → reqIds med searchStatus/tripSearch (samme flyt som verktoykasse hentTurDetaljer), kun når raden kom tom. Gjør samtidig popupen uavhengig av planleggertabellen  // reqId-uthentingen var for smal: «showReq(this,» finnes bare hvis plakat-ikonets kolonne er synlig, og kolonneoppsettet varierer per operatør (tur 72127538: rad funnet, reqIds=∅). Godtar nå et hvilket som helst førsteargument, anførselstegn og reqid= i lenker — og sier fra i dev-konsollen med ferdig dump-kommando når raden likevel er tom  // __basicTools.frmDiag(resId, reqIds, turid) — som frmSuti, men tømmer cachen først. Parseren er verifisert mot ekte dump (tur 72110740: på vei 12:46, fremme 12:57, 12 av 14 tidsrader for turen), så gjenstående feil ligger i HENTINGEN — og et 90 s gammelt «nei» skjulte hvilke oppslag som faktisk kjøres  // TUR-SJEKKEN OVER-AVVISTE (tur 72110740 ga «logg ikke funnet»): <hr>-kuttet OG krav om riktig TurNr i samme svar er for strengt — ligger turen i en blokk lenger ned, forkastet vi alt. Kjenner vi turid leser vi nå HELE seksjonen og filtrerer på TurNr (skarpere enn kuttet); uten turid kuttes som før. Avviser kun når svaret ikke inneholder turen i det hele tatt. Dev-loggen viser nå tidsrader, treff for turen, loggens første TurNr, sendt og påvei  // TABELLKNAPPEN FJERNET (Thomas 25.08). Fremmestatus lever nå kun i ressurs-popupen. Borte: 20 s-skanning av 350+ rader, innerHTML-lesing, _frmSkriver-vakten mot childList-løkke, celle-0-kampen med Lives SPOT-badge og — viktigst — forurensningen av en celle andre skript leser som STATUS. Popupen gir det samme for samme antall klikk. Knappekoden ligger i v1.174-dev  // SLUTT Å GJETTE PÅ LØYVEFORMAT (Thomas 25.08: «det kommer an på hvem som la inn navnet på sentralen — mange fallgruver der»). Løyvet leses nå POSISJONELT fra 5. kolonne (Løyvenr), og det eneste vi kjenner igjen er NISSYs EGEN avtaleområde-nøkkel «5.05.V.OUS.1-72126324», som utelukkes. Popupens løyve tas likeledes som ren tekst — tokenet før «(Bekreftet)»  // Popupen sender nå Reisenr som korrekthetssjekk — den eneste sikre identiteten kortet har. Cache-nøkkelen utvidet til resId|turid: med tur-sjekk gir samme resId et annet svar enn uten, og popupen spør med mens tabellknappen spør uten  // FEIL TUR I LOGGEN: 72126324 viste «Sendt 24.08 08:19» — det var NewResource for tur 72099399, en SLETTET ressurs på samme rekvisisjon. <hr>-kuttet hjelper ikke når vi har spurt opp feil ressurs, for da ER den gamle blokka ferskest i svaret. TurNr leses nå per rad, og turid brukes som korrekthetssjekk: feil tur = feiltreff, stigen går videre. Løyve-mønster utvidet til A9118 (én bokstav, ingen bindestrek)  // SAMKJØRING: KUN ÉN reqId LÅSER OPP SUTI-LOGGEN — dokumentert i omraade_assistent v0.9.25-dev («samme bil/resId, men bare ÉN reqId ga 5 grupper»). Vi prøvde bare radens FØRSTE, så turer med flere passasjerer traff bare ved flaks. Nå prøves ALLE radens reqIds i kombo [reqId, resId] til én gir grupper — både i popupen og i tabellknappen  // rid FRA showRes ER IKKE resId: raden har et NAME-attributt som kan avvike fra id-en, og NISSY kaller showRes med name (overvaaker_live.js:5677). Derfor slo getElementById('P-'+rid) bom, reqId ble tom, og kun kombo [resId,resId] ble kjørt. Vi leter nå på BÅDE P-<rid> og tr[name=rid], og lar RADEN definere resId. Tooltipen sier fra når reqId mangler  // POPUPEN MANGLET reqId → bare 1 av 3 komboer ble prøvd. ajax_reqdetails sin «id» er en REKVISISJONS-id, ikke resId (verktoykasse.js:1253), så den ekte kombinasjonen [reqId, resId] ble aldri kjørt fra popupen — derav «seksjon=false rader=0». reqId hentes nå fra pågående-raden P-<resId> (showReq(this,…)). Dev logger også når svaret er for kort  // RESSURS-ID: showRes-wrapperen tilbake ØVERST — det kallet er nettopp det som fylte popupen vi dekorerer, også ved onmouseover. Løyve-oppslaget er svakere enn det ser ut: samme bil kan ha FLERE rader i pågående (én per tur), og «første treff» tar da feil tur. Tooltipen oppgir nå både id, KILDE og advarsel ved delt løyve; dev logger alle tre kandidatene  // POPUPENS EGEN STRUKTUR (Thomas dumpet markupen): ytre tabell har ÉN kolonne — overskrift i td.reqvtitle, innhold i td.reqv_value med en NØSTET tabell av td.travel-par. Første forsøk la en to-cellers rad rett i den ytre tabellen. Nå speiles «Ressurs info» nøyaktig. resId leses nå fra popupens EGET innhold (løyve → P-rad) FØR showRes-wrapperen: NISSY kaller showRes også fra onmouseover, så siste museberøring kunne ellers avgjort hvilken bil vi slo opp. «Ingen SUTI-logg» viser nå resId i tooltipen, så feil oppslag kan skilles fra taus bil  // FREMMESTATUS OGSÅ I RESSURS-POPUPEN (Thomas 25.08): egen seksjon «📍 Fremmestatus (SUTI)» rett under «Ressurs info», med sendt-tid, bil på vei (3003) og én linje per hentested (1709). Popupen er allerede om BILEN — og SUTI-loggen er per bil — så alle tidene hører hjemme der uten filtrering, og det finnes ingen linjeraster å komme i takt med. Radene KLONES fra NISSYs egne, så stilen arves. resId fanges ved å wrappe showRes()  // ÉN KNAPP OVER TO LINJER ved samkjøring (Thomas 25.08): tidene stables med \n i stedet for « / », så knappen dekker begge passasjerlinjene i stedet for å bli en bred rekke på linje 1. Ingen per-passasjer-elementer, ingen row-image-wrapper — white-space:pre gjør jobben  // TILBAKE til én knapp per rad: per-passasjer-knapper kom aldri i takt med NISSYs linjer i celle 0 (ledende &nbsp;, egne linjehøyder, deler plass med Lives S-badge). Én knapp viser alle tidene, tooltipen kobler tid → rekvisisjon  // HØYDE: knappen var 17 px mot NISSYs ~12 px linjeinnhold, så samkjørte rader gled ut av takt. Låst til 12 px (box-sizing:border-box), wrapper-diven likeså  // Knappene lå én linje for lavt ved samkjøring: celle 0 starter med en «&nbsp;»-tekstnode fra NISSY, og den er INLINE — så første div havnet på linjen under. Divene settes nå først, whitespace flyttes bakerst  // Tooltip bygges på passasjernavnet alene (nummereringen ble droppet da knappene fikk egen linje — den etterlot «Passasjer  — NAVN» med dobbelt mellomrom)  // SAMKJØRING løst med NISSYs EGEN linjestruktur: knappen pakkes i <div class="even/odd row-image">, samme som NISSY bruker i alle andre celler. Da står den automatisk på passasjerens linje — ingen display:block, ingen brutt radhøyde, ingen nummerering nødvendig  // display:block brøt radhøyden — knappene står nå side ved side. Ved samkjøring nummereres de (📍1 📍2) og tooltipen navngir passasjeren, så koblingen er tydelig uten å røre layouten  // SAMKJØRING: én knapp PER PASSASJER, stablet som linjene i cellene til høyre. Hver knapp filtrerer på sin egen rekvisisjon så tidene ikke blandes. Idempotensen sjekker nå ANTALL knapper, ikke bare om det finnes en  // SAMKJØRING: 1709 er per HENTESTED (én per rekvisisjon, ulik tid per passasjer), mens 3003 er per BIL. Tooltipen kobler nå hver fremme-tid til sin rekvisisjon; knappen viser alle tidene  // Viser «📤 sendt HH:MM» når turen verken har 3003 eller 1709 (Thomas 25.08): mange turer får aldri respons fra bil, og da er tidspunktet turen ble sendt til transportør det operatøren trenger — hvor lenge har den ligget?  // CACHEN SERVERTE GAMLE SVAR: minne-cachen hadde ingen TTL og levde hele økten, så en tur slått opp FØR bilen meldte 3003 ble hengende som «nei». Nå gjelder samme utløp i minnet som i localStorage — kun funnet fremme-tid regnes som endelig  // Farget BAKGRUNN med hvit skrift i stedet for farget tekst — mye lettere å se i en tett tabell. Blå = på vei, grønn = fremme, rød = bomtur, grå = ingen melding. Uspurt knapp holdes nøytral  // Viser TIDEN, ikke løyvet: løyvet står allerede i Ressurs-kolonnen ved siden av, tidspunktet er det nye. Løyvet beholdes i tooltipen (kan være ferskere enn tabellen rett etter bilbytte)  // Viser LØYVET til bilen som er på vei. 3003-raden bærer FORRIGE bils løyve; den nye står på UpdateResource-raden rett under (Thomas, tur 72116259: TE-60 i 3003-raden, RO-3215 i linjen under). Mønstre kopiert fra Live  // «på vei» gikk tapt når turen hadde 3003 men ingen 1709/1701: frmHentSuti lagret kun ved grupper, så paaVeiTid falt på gulvet i den negative grenen. Verifisert mot tur 72116259 (tre 3003, tre bilbytter). TTL: kun fremme-tid regnes som endelig svar  // 3003 = bil tildelt/PÅ VEI (Thomas). Vises nå som «🚗 på vei» med tidspunkt når turen har 3003 men ingen 1709 — langt mer nyttig enn blankt «nei». Nullstillingen ved ny bil er uendret og korrekt pga. tidssortering  // Skiller «ingen SUTI-logg i det hele tatt» fra «logg finnes, men ingen 1709/1701 ennå» — meldingen sa før det samme i begge tilfeller. Cache-nøkkel bumpet til v2 (lagrer nå seksjon+radantall)  // TO FEIL: (1) FRM_IKKE_AKTUELL lå etter oppstartskallet → «Cannot access before initialization», samme TDZ-felle som i Avvik i dag. (2) cachen kunne inneholde noe som ikke er array → «.some is not a function» i hver runde. Begge deklareres/valideres nå  // YTELSE: leste rad.innerHTML for ALLE 350+ rader hver runde (DOM-serialisering) og rakk bare ~4 knapper før NISSY re-rendret. Billige sjekker (status + finnes badge) først; innerHTML leses kun for rader som faktisk skal få knapp, og gjenbrukes til rekvnr  // Fremme-tiden overlevde ikke NISSYs re-render: cachen fantes, men den nye knappen startet blank. Visningen er skilt ut i frmVisResultat og gjenbrukes når knappen bygges på nytt  // KNAPPEN REAGERTE IKKE: NISSY fanger rad-klikk i CAPTURE-fasen (selectRow) og stoppet eventet før det nådde knappens onclick. Byttet til delegert lytter i capture — vi kommer først  // Presisert: <hr> = bytte av TRANSPORTØR (ferskeste over streken); bilbytte innen samme selskap gir ingen <hr>, der er 3003 eneste markør  // FLERE 1709: siste tidspunkt vinner (rader sorteres stigende), og 3003 «ny bil tildelt» nullstiller forrige bils fremme-tid — ellers ville en avvist bils 1709 blitt vist som om den nye bilen sto fremme  // SAMKJØRING: SUTI-loggen er felles for BILEN og kan inneholde andre turers rekvisisjoner. Fremme-tiden kobles nå mot radens eget rekvisisjonsnr; uten kobling sier tooltipen fra at tiden kan gjelde en annen tur  // SUTI-KODEMØNSTER FRA LIVE: />\\s*1709\\b/ i stedet for omraade_assistent sitt <nobr>1709</nobr>. Sistnevnte ga null treff mot ekte HTML — «Suti kode»-seksjonen fantes, men kodene er ikke <nobr>-innpakket. Live er fasit; den har kjørt i drift lenge  // «Fremme?»-knappen flyttet til FØRSTE celle — Status-kolonnen er nr. 11 av 13 og krevde horisontal scrolling. Status leses fortsatt fra Status-kolonnen; celle 0 er tom, så ingen data forurenses
    const GMAPS_KEY = 'AIzaSyApih8RVgu4Wa4x2bEWga5eDqwTgVFRagQ';
    const ER_DEV = /\bbasic_tools_dev\b/.test((document.currentScript && document.currentScript.src) || '');
    const NAVN = ER_DEV ? 'BASIC TOOLS DEV' : 'BASIC TOOLS';

    if (window.__basicTools) {
        console.log(`[${NAVN}] allerede lastet — hopper over`);
        return;
    }
    window.__basicTools = { versjon: VERSJON, dev: ER_DEV,
        bomturDetaljer: (nr) => bomturDetaljer(nr) };

    // Host-agnostisk: bruk operatørens faktiske NISSY-origin (pastrans / nissy6 / …) → unngår CORS-blokk.
    const NISSY_ORIGIN = (typeof location !== 'undefined' && /\.nhn\.no$/i.test(location.hostname || '')) ? location.origin : 'https://pastrans-sorost.mq.nhn.no';
    const REK_BASE = NISSY_ORIGIN + '/rekvisisjon';
    const NISSY_BLAA = 'rgb(148, 169, 220)';

    function trygtFjern(el) {
        if (el && el.parentNode) {
            try { el.parentNode.removeChild(el); } catch (_) {}
        }
    }

    function tidTilMin(t) {
        const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/);
        return m ? +m[1] * 60 + +m[2] : null;
    }

    // Motsatt vei. Brukes til å regne ankeret tilbake fra et gammelt delta i trip.comment.
    // Modulo døgnet, så en tur som flyttes over midnatt ikke gir «-1:30».
    function minTilTid(min) {
        const m = ((Math.round(min) % 1440) + 1440) % 1440;
        return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    }

    function lesAlleVRader() {
        const ids = [];
        document.querySelectorAll('tr[id^="V-"]').forEach(r => {
            const id = r.id.replace(/^V-/, '');
            if (/^\d+$/.test(id)) ids.push(id);
        });
        return ids;
    }

    function lesMarkerteResIds() {
        const ids = [];
        document.querySelectorAll('tr[id^="V-"]').forEach(r => {
            if (r.style.backgroundColor === NISSY_BLAA) {
                const id = r.id.replace(/^V-/, '');
                if (/^\d+$/.test(id)) ids.push(id);
            }
        });
        return ids;
    }

    function lesHentetidFraRad(resId) {
        const rad = document.getElementById('V-' + resId);
        if (!rad) return null;
        const blaa = rad.querySelector('font[color="#0000FF"]');
        if (!blaa) return null;
        const m = blaa.textContent.match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : null;
    }

    function lesPasientnavnFraRad(resId) {
        const rad = document.getElementById('V-' + resId);
        if (!rad) return null;
        const tds = rad.querySelectorAll('td');
        if (tds.length < 2) return null;
        const tekst = tds[1].textContent.trim();
        return tekst || null;
    }

    // Finn første gyldige DD.MM (eller DD-MM) i radens textContent.
    // Validerer at dag 1–31 og måned 1–12 så vi ikke matcher feil tall.
    function lesAvgangsdatoFraRad(rad) {
        if (!rad) return null;
        const tekst = rad.textContent || '';
        const idag = new Date();
        const idagMidn = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate());
        // Negativ lookahead (?!\d) — rejecter "3.51" der "3.5" ellers ville matchet
        const treff = tekst.matchAll(/(\d{1,2})[.\-](\d{1,2})(?!\d)/g);
        for (const m of treff) {
            const dag = +m[1], mnd = +m[2];
            if (dag < 1 || dag > 31 || mnd < 1 || mnd > 12) continue;
            const d = new Date(idag.getFullYear(), mnd - 1, dag);
            // Hvis dato er tidligere enn i dag, anta neste år
            if (d < idagMidn) d.setFullYear(idag.getFullYear() + 1);
            return d;
        }
        return null;
    }

    function erIDagEllerTidligere(dato) {
        if (!dato) return true;  // ukjent dato → vær konservativ, behandle som "i dag"
        const idag = new Date();
        const idagMidn = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate());
        return dato.getTime() <= idagMidn.getTime();
    }

    // Finn X-img i P-rad via onclick-attribute (mer robust enn å matche src="remove.gif"
    // siden filnavnet kan variere på tvers av NISSY-versjoner).
    function finnXImg(rad) {
        if (!rad) return null;
        const imgs = rad.querySelectorAll('img');
        for (const img of imgs) {
            const oc = img.getAttribute('onclick') || '';
            if (oc.startsWith('removePaagaaendeOppdrag')) return img;
        }
        return null;
    }

    // Finn X-img for et spesifikt (resId, reqId) globalt i hele dokumentet
    // — robust mot at rader blir re-renderet mellom snapshot og prosessering.
    function finnXImgGlobalt(resId, reqId) {
        const alle = document.querySelectorAll('img[onclick^="removePaagaaendeOppdrag"]');
        const target = `'${resId}','${reqId}'`;
        for (const img of alle) {
            const oc = img.getAttribute('onclick') || '';
            if (oc.includes(target)) return img;
        }
        return null;
    }

    // Auto-bekrefter NISSY varslingsbokser. Returnerer et "stopp"-callback.
    // - Overstyrer window.confirm til å returnere true (native confirm)
    // - Setter opp MutationObserver som klikker "Ja"/"OK" i custom dialoger
    function aktiverAutoBekreft() {
        const origConfirm = window.confirm;
        window.confirm = () => true;

        // Custom NISSY-dialoger fra messagebox.min.js eller liknende —
        // søk etter knapper med tekst "Ja", "OK", "Bekreft"
        const observer = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    // Sjekk noden selv og dens etterkommere
                    const knapper = [n, ...(n.querySelectorAll ? n.querySelectorAll('button, input[type="button"], a') : [])];
                    for (const k of knapper) {
                        const tekst = (k.textContent || k.value || '').trim().toLowerCase();
                        if (tekst === 'ja' || tekst === 'ok') {
                            // Sjekk at det er synlig (ikke en skjult skabelon)
                            const r = k.getBoundingClientRect && k.getBoundingClientRect();
                            if (r && (r.width || r.height)) {
                                setTimeout(() => k.click(), 50);
                                return;
                            }
                        }
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.confirm = origConfirm;
            observer.disconnect();
        };
    }

    // Plukk ut (resId, reqId) fra remove-knappens onclick i en P-rad
    // Format: onclick="removePaagaaendeOppdrag('80400090','66961981')"
    function lesPaagaaendeArgs(rad) {
        const x = finnXImg(rad);
        const onclick = x?.getAttribute('onclick') || '';
        const m = onclick.match(/removePaagaaendeOppdrag\('(\d+)','(\d+)'\)/);
        return m ? { resId: m[1], reqId: m[2] } : null;
    }

    // ⚠️ STATUS SETTES PER REKVISISJON, IKKE PER TUR (Thomas 27.08). En samkjørt bil har ÉN
    //    P-rad, men NISSY fører status for hver pasient for seg — manualStatus-skjemaet tar
    //    reqId, ikke resId. Menyen må derfor vite HVEM den handler om før den viser et eneste
    //    statusvalg; ellers ville et klikk på en firemannsbil vært et lykketreff.
    //
    //    Tre kilder i samme rad, alle i NISSYs egen rekkefølge:
    //      reqId   — removePaagaaendeOppdrag('<resId>','<reqId>') på X-ikonene
    //      rekvnr  — searchStatus?nr=<12 siffer> i radens lenker (skjemaet krever feltet «nr»)
    //      navn    — én <div> per passasjer i PNAVN-kolonnen
    //
    //    Vi parer PÅ POSISJON, men kun når antallene stemmer — samme beviskrav som
    //    fremmestatus. Å vise feil pasientnavn over en statusendring er verre enn å vise et
    //    rekvisisjonsnummer, for navnet er det eneste operatøren faktisk leser før hun trykker.
    function lesPassasjererFraRad(pRad) {
        if (!pRad) return [];
        const rh = pRad.innerHTML || '';
        // ⚠️ REKKEFØLGEN ER OMVENDT AV DET NAVNENE SIER. Radens X-ikon er
        //    removePaagaaendeOppdrag('81709806','68062381') mens raden selv er id="P-68062381"
        //    — altså er FØRSTE argument rekvisisjonen og ANDRE er oppdraget. Radens egne
        //    søsken bekrefter det: toggleManualStatusRequisition(this,81709806) og
        //    showReq(this,81709806,…) bruker samme første tall. lesPaagaaendeArgs kaller m[1]
        //    for resId — det er feil vei, men ufarlig der, fordi den bare brukes til å finne
        //    IGJEN det samme X-ikonet. Her er det ikke ufarlig: manualStatus tar reqId, og
        //    med m[2] ville vi satt status på et oppdragsnummer.
        let reqIds = [...rh.matchAll(/removePaagaaendeOppdrag\('(\d+)','(\d+)'\)/g)].map(m => m[1]);
        // ⚠️ X-IKONET FORSVINNER NÅR TUREN ER AVSLUTTET (27.08: rad satt til «Ikke møtt» hadde
        //    ingen removePaagaaendeOppdrag igjen — en avsluttet tur kan ikke trekkes tilbake).
        //    Da sto vi uten reqId på nøyaktig de radene der statusvalget er mest aktuelt.
        //    Raden bærer det samme tallet to andre steder: toggleManualStatusRequisition og
        //    showReq. Begge er per rekvisisjon, altså like mange som passasjerer.
        if (!reqIds.length) {
            reqIds = [...new Set([
                ...[...rh.matchAll(/toggleManualStatusRequisition\s*\(\s*[^,]+,\s*['"]?(\d+)/gi)].map(m => m[1]),
                ...[...rh.matchAll(/showReq\s*\(\s*[^,]+,\s*['"]?(\d+)\s*,/gi)].map(m => m[1]),
            ])];
        }
        if (!reqIds.length) return [];
        const rekvnr = [...rh.matchAll(/searchStatus\?nr=(\d{12})/g)].map(m => m[1]);
        // NISSYs headerrad er tr.tbh INNE i tbody, ikke et ekte <thead> (NISSY-Planlegging §3).
        // Finner vi den ikke, leter vi etter en hvilken som helst rad som bærer kolonnenavnet.
        let navn = [];
        try {
            const tab = pRad.closest('table');
            let hdr = tab && tab.querySelector('tr.tbh');
            if (!hdr && tab) hdr = [...tab.rows].find(r => /\bPNAVN\b|PASIENTNAVN/i.test(r.textContent || ''));
            if (hdr) {
                const kol = [...hdr.cells].map(c => (c.textContent || '').trim().toUpperCase());
                const iNavn = kol.findIndex(t => t.indexOf('PNAVN') >= 0 || t.indexOf('PASIENTNAVN') >= 0 || t === 'NAVN');
                const celle = iNavn >= 0 ? pRad.cells[iNavn] : null;
                if (celle) {
                    // ⚠️ TO LINJEFORMER I SAMME TABELL. Enkeltrader har ren tekst i cellen
                    //    («PARAMASIVAM, ARULNAMPI»), samkjørte deler passasjerene — noen steder
                    //    med <div> per linje, andre steder bare med <br>. Kjenner vi bare div-er,
                    //    faller navnene ut på nettopp de radene der de trengs mest, og menyen
                    //    degraderer til «rekv NNN» for en firemannsbil.
                    const d = celle.querySelectorAll('div');
                    if (d.length) {
                        navn = [...d].map(x => (x.textContent || '').trim());
                    } else if (/<br/i.test(celle.innerHTML || '')) {
                        const tmp = document.createElement('div');
                        navn = (celle.innerHTML || '').split(/<br\s*\/?>/i).map(bit => {
                            tmp.innerHTML = bit;
                            return (tmp.textContent || '').trim();
                        }).filter(Boolean);
                    } else {
                        navn = [(celle.textContent || '').trim()];
                    }
                }
            }
        } catch (_) {}
        const parNavn = navn.length === reqIds.length;
        const parRekv = rekvnr.length === reqIds.length;
        if (ER_DEV && (!parNavn || !parRekv)) {
            console.log(`[${NAVN}] statusmeny: ${reqIds.length} reqId, ${rekvnr.length} rekvnr, `
                + `${navn.length} navn — parer kun det som stemmer i antall`);
        }
        return reqIds.map((reqId, i) => ({
            reqId,
            rekvnr: parRekv ? rekvnr[i] : '',
            navn: parNavn ? navn[i] : '',
        }));
    }

    // Finn kolonne-index for "Behov" ved å søke gjennom alle th i tabellen
    // (NISSYs header-rad bruker tr.tbh, ikke ekte <thead>-wrapper).
    // Ingen caching — bruker kan endre kolonner dynamisk under bruk.
    // Generisk: finn kolonne-index der th-teksten matcher (case-insensitive, exact eller startsWith)
    function finnKolonneIdx(rad, kolonneNavn) {
        const tabell = rad?.closest('table');
        if (!tabell) return -1;
        const ønsket = kolonneNavn.trim().toLowerCase();
        const allTh = tabell.querySelectorAll('th');
        for (const th of allTh) {
            const tekst = (th.textContent || '').trim().toLowerCase();
            if (tekst === ønsket || tekst.startsWith(ønsket)) {
                const cells = th.parentElement?.children;
                if (cells) {
                    for (let i = 0; i < cells.length; i++) {
                        if (cells[i] === th) return i;
                    }
                }
                return -1;
            }
        }
        return -1;
    }

    function lesKolonneFraRad(rad, kolonneNavn) {
        const idx = finnKolonneIdx(rad, kolonneNavn);
        if (idx < 0) return '';
        const tds = rad.querySelectorAll(':scope > td');
        if (idx >= tds.length) return '';
        return tds[idx].textContent.trim();
    }

    // Plukk Fra/Til. To formater i NISSY:
    //  • V-rader: kombinert i én TD med <br>-separator (selv om "Fra"-header eksisterer som peker på den TD-en)
    //  • P-rader: separate "Fra" og "Til"-kolonner
    // Strategi: BR-detection FØRST (cellen vinner over header-navn), fall back til header-lookup.
    function lesFraTilFraRad(rad) {
        const tds = rad.querySelectorAll(':scope > td');
        for (const td of tds) {
            const html = td.innerHTML || '';
            if (!/<br/i.test(html)) continue;
            const deler = html.split(/<br\s*\/?>/i).map(del => {
                const tmp = document.createElement('div');
                tmp.innerHTML = del;
                return tmp.textContent.trim();
            }).filter(Boolean);
            // Krev at begge delene ser ut som adresse (har komma + postnr-lignende 4-sifret tall)
            if (deler.length >= 2 && /\d{4}/.test(deler[0]) && /\d{4}/.test(deler[1])) {
                return { fra: deler[0], til: deler[1] };
            }
        }
        // Ingen BR-celle med 2 adresser → prøv separate Fra/Til kolonner (P-rader)
        const fra = lesKolonneFraRad(rad, 'fra');
        const til = lesKolonneFraRad(rad, 'til');
        return { fra, til };
    }

    // Plukk ut tur-data for kart-visning (Pnavn, Start/tid, Fra, Til, Opp tid)
    function lesTurDataFraRad(rad) {
        if (!rad) return null;
        const id = rad.id || '';
        const erV = id.startsWith('V-');
        const erP = id.startsWith('P-');
        if (!erV && !erP) return null;
        const resId = id.replace(/^[VP]-/, '');
        // Hent tider — prøv kolonne-lookup først, fall tilbake til blå/lilla font (V-rad-mønster)
        let henteTid = lesKolonneFraRad(rad, 'start') || lesKolonneFraRad(rad, 'reise tid') || lesKolonneFraRad(rad, 'rtid');
        let oppTid = lesKolonneFraRad(rad, 'opp tid') || lesKolonneFraRad(rad, 'opptid') || lesKolonneFraRad(rad, 'oppmtid');
        if (!henteTid) {
            const blaa = rad.querySelector('font[color="#0000FF"]');
            if (blaa) henteTid = blaa.textContent.trim();
        }
        if (!oppTid) {
            const lilla = rad.querySelector('font[color="#330066"]');
            if (lilla) oppTid = lilla.textContent.trim();
        }
        // Trekk ut bare HH:MM hvis det er prefiks med dato
        const klokkeMatch = (s) => { const m = String(s||'').match(/(\d{1,2}:\d{2})/); return m ? m[1] : s; };
        const henteTidRaw = henteTid;  // behold rå verdi (kan ha dato-prefiks «DD.MM HH:MM» når turen ikke er i dag)
        henteTid = klokkeMatch(henteTid);
        oppTid = klokkeMatch(oppTid);
        const ft = lesFraTilFraRad(rad);
        // Plukk Reisenr (turid) — bruker for å hente full adresse via rekvisisjons-plakaten
        const turid = lesKolonneFraRad(rad, 'reisenr') || lesKolonneFraRad(rad, 'reise nr') || lesKolonneFraRad(rad, 'turnr');
        // reqId fra radens «showReq(this,<reqId>…»-handler (poster-ikonet, onmouseover) — samme
        // kilde overvåkerne/samkjorer bruker. resId = rad-navn/-id. Med (reqId, db=1, tripid=resId)
        // henter vi adressene via ajax_reqdetails UANSETT kolonneoppsett (ingen Reisenr nødvendig).
        const reqIdM = (rad.innerHTML || '').match(/showReq\(this,\s*(\d+)/);
        const reqId = reqIdM ? reqIdM[1] : null;
        const rekvnrM = (rad.innerHTML || '').match(/searchStatus\?nr=(\d+)/);
        const rekvnr = rekvnrM ? rekvnrM[1] : null;
        return {
            type: erV ? 'V' : 'P',
            resId,
            reqId: reqId,
            turid: turid || null,
            rekvnr: rekvnr,
            navn: lesKolonneFraRad(rad, 'pnavn') || resId,
            tid: henteTid || '',
            tidRaw: henteTidRaw || '',   // rå hentetid m/ evt. dato-prefiks (for dato-sjekk i utsendelsesvarsel)
            henteTid: henteTid || '',
            oppTid: oppTid || '',
            fra: ft.fra,
            til: ft.til,
            behov: lesKolonneFraRad(rad, 'behov')
        };
    }

    function finnBehovKolonneIdx(rad) {
        const tabell = rad?.closest('table');
        if (!tabell) return -1;
        const allTh = tabell.querySelectorAll('th');
        for (const th of allTh) {
            const tekst = (th.textContent || '').trim().toLowerCase();
            if (tekst === 'behov') {
                const cells = th.parentElement?.children;
                if (cells) {
                    for (let i = 0; i < cells.length; i++) {
                        if (cells[i] === th) return i;
                    }
                }
                break;
            }
        }
        return -1;
    }

    function lesBehovFraRad(rad) {
        if (!rad) return '';
        const idx = finnBehovKolonneIdx(rad);
        if (idx < 0) return '';
        const tds = rad.querySelectorAll(':scope > td');
        if (idx >= tds.length) return '';
        return tds[idx].textContent.trim().toUpperCase();
    }

    // True hvis raden har "spesielt" Behov som vi IKKE skal trekke tilbake automatisk
    const SPESIELLE_BEHOV = ['ERS', 'RB', 'A', 'TK'];
    function harSpesieltBehov(rad) {
        const idx = finnBehovKolonneIdx(rad);
        if (idx < 0) return true;  // hvis vi ikke kan lese kolonnen, vær konservativ — IKKE trekk tilbake
        const behov = lesBehovFraRad(rad);
        if (!behov) return false;
        const koder = behov.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
        return koder.some(k => SPESIELLE_BEHOV.includes(k));
    }

    let _rekUserid = null;
    async function hentRekUserid() {
        if (_rekUserid) return _rekUserid;
        const navn = window.__vkt_brukernavn;
        if (navn) { _rekUserid = navn; return _rekUserid; }
        return null;
    }

    async function dwrEncryptResId(resId) {
        const body = [
            'callCount=1',
            'windowName=',
            'c0-scriptName=Requisition',
            'c0-methodName=encrypt',
            'c0-id=0',
            `c0-param0=string:${resId}`,
            'batchId=1',
            'instanceId=0',
            'page=/rekvisisjon/',
            'httpSessionId=',
            'scriptSessionId='
        ].join('\n');
        const res = await fetch(`${REK_BASE}/dwr/call/plaincall/Requisition.encrypt.dwr`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body,
            credentials: 'include'
        });
        const text = await res.text();
        const m = text.match(/handleCallback\([^,]+,[^,]+,"([^"]+)"\)/);
        if (!m) throw new Error('encrypt-respons uforståelig: ' + text.slice(0, 200));
        return m[1];
    }

    // NISSY er ISO-8859-1. Skjema-felter må prosent-kodes som Latin-1-bytes
    // (ikke UTF-8 via URLSearchParams), ellers blir ÆØÅ ødelagt ved re-lesing.
    function latin1Form(s) {
        let out = '';
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            if (/[A-Za-z0-9*\-._]/.test(c)) { out += c; continue; }
            if (c === ' ') { out += '+'; continue; }
            const cp = s.charCodeAt(i);
            if (cp <= 0xFF) out += '%' + cp.toString(16).toUpperCase().padStart(2, '0');
            else out += encodeURIComponent(c); // utenfor Latin-1 (sjeldent)
        }
        return out;
    }

    async function endreTidPaaResId(resId, nyTid, gammelTid, notat) {
        const userid = await hentRekUserid();
        if (!userid) return { ok: false, feil: 'fant ikke userid' };
        const token = await dwrEncryptResId(resId);
        const confirmUrl = `${REK_BASE}/requisition/confirm?loggedin=true&id_enc=${token}&userid=${userid}&ns=true`;
        const buf = await fetch(confirmUrl, { credentials: 'include' }).then(r => r.arrayBuffer());
        const html = new TextDecoder('iso-8859-1').decode(buf);
        const form = new DOMParser().parseFromString(html, 'text/html').querySelector('form');
        if (!form) return { ok: false, feil: 'skjema ikke funnet' };
        const fd = new FormData(form);
        fd.set('departureTime', nyTid);
        fd.set('trip.startDateManuallySet', 'true');

        // Auto-logg total tids-forskyvning i trip.comment, ANKRET i opprinnelig tid:
        //   «-34 Opprinnelig tid 09:04»
        //
        // v1.126: før akkumulerte vi (eksisterende delta + denne endringen), og «denne
        // endringen» ble regnet mot tiden lest fra RADEN da popupen ble åpnet. NISSY
        // re-rendrer aggressivt, og ved andre endring på samme tur viste raden fortsatt
        // den opprinnelige tiden — så deltaet ble telt to ganger. Operatørsak 13.08:
        // 09:04 → 08:30 ga «-34», så 08:25 ga −34 + (08:25 − 09:04 = −39) = «-73»,
        // der riktig svar er −39.
        //
        // Nå står den opprinnelige tiden i kommentaren selv. Andre endring leser ankeret
        // derfra og regner ABSOLUTT — da spiller det ingen rolle om raden er utdatert.
        // Mangler ankeret (tom kommentar, eller noen har redigert den bort), faller vi
        // tilbake til tiden fra raden og setter ankeret for neste gang.
        const nMin = tidTilMin(nyTid);
        if (nMin !== null) {
            const eksisterende = (fd.get('trip.comment') || '').trim();
            // «-34 Opprinnelig tid 09:04 resten av meldingen»
            // ⚠️ PUNKTUMET ER NYTT OG MÅ TÅLES. Formatet er «-28 Opprinnelig tid 14:30. Av Thomas W
            //    på vegne av PRK» (Thomas 28.08). Uten [.,]? her ville treffet falt, koden gått i
            //    gammelt-format-grenen, og neste endring skrevet «Opprinnelig tid» to ganger.
            //    Kommentaren er en KONTRAKT — deltaet leses tilbake herfra.
            const mAnker = eksisterende.match(/^([+-]\d+)\s+Opprinnelig tid (\d{1,2}:\d{2})[.,]?(?:\s+(.*))?$/);
            // Eldre format uten anker: «-34 resten»
            const mGammel = mAnker ? null : eksisterende.match(/^([+-]\d+)(?:\s+(.*))?$/);

            let origTid, resten;
            if (mAnker) {
                origTid = mAnker[2];
                resten  = mAnker[3] || '';
            } else if (mGammel) {
                // Gammelt format: regn ankeret tilbake fra deltaet som står der.
                const gm = tidTilMin(gammelTid);
                origTid = gm !== null ? minTilTid(gm - parseInt(mGammel[1], 10)) : gammelTid;
                resten  = mGammel[2] || '';
            } else {
                origTid = gammelTid;
                resten  = eksisterende;
            }

            const oMin = tidTilMin(origTid);
            if (oMin !== null) {
                // Over midnatt: 00:10 → 23:50 er 20 minutter tidligere, ikke 1420 senere.
                // Ingen legitim endring her er over 12 timer, så korteste vei er alltid rett.
                let total = nMin - oMin;
                if (total >  720) total -= 1440;
                if (total < -720) total += 1440;
                // ⚠️ ERSTATT VÅR EGEN SIGNATUR, IKKE STABLE DEM. Endrer to operatører samme tur,
                //    skal siste stå — ikke «Av Kari N … Av Thomas W …». Vi fjerner kun MØNSTERET
                //    vi selv skriver; alt annet i kommentaren er noen andres og røres ikke.
                const restUtenSign = String(resten || '')
                    .replace(/\s*(?:^|\.)\s*Av\s+[^.]{1,60}?(?:\s+(?:for|på vegne av)\s+[^.]{1,40}?)?\.?\s*$/i, '')
                    .trim();
                const hoved = total !== 0
                    ? ((total > 0 ? '+' : '') + total) + ' Opprinnelig tid ' + origTid : '';
                const biter = [];
                if (hoved) biter.push(hoved);
                if (restUtenSign) biter.push(restUtenSign);
                let ut = biter.join(' ');
                if (notat) ut = (ut ? ut.replace(/\.?$/, '.') + ' ' : '') + notat;
                fd.set('trip.comment', ut.slice(0, 255));
            }
        }

        const body = [...fd].map(([k, v]) => latin1Form(k) + '=' + latin1Form(String(v))).join('&');
        const res = await fetch(confirmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1' },
            body,
            credentials: 'include'
        });
        if (!res.ok) return { ok: false, status: res.status, feil: 'HTTP ' + res.status };
        // v1.116: HTTP 200 fra /confirm betyr IKKE lagret (samme felle som altRequisition, v1.107) —
        // ved valideringsfeil ekkoes skjemaet tilbake. Plukk feiltekst + VERIFISER ved å hente
        // skjemaet på nytt og sjekke at departureTime faktisk ble ny tid.
        const rhtml = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer());
        const rdoc = new DOMParser().parseFromString(rhtml, 'text/html');
        let feilTekst = '';
        const feilEls = rdoc.querySelectorAll('.errorText, .error, .errors li, ul.error li, font[color="red"], span[style*="red"], [class*="rror"]');
        for (let i = 0; i < feilEls.length; i++) {
            const ft = (feilEls[i].textContent || '').replace(/\s+/g, ' ').trim();
            if (ft && feilTekst.indexOf(ft) === -1) feilTekst += (feilTekst ? ' | ' : '') + ft;
        }
        if (ER_DEV) {
            try {
                window.__bt_confirmRespons = rhtml;
                console.log('[' + NAVN + '] endreTid /confirm-respons — title: «' + (rdoc.title || '') + '», feiltekst: «' + feilTekst + '» (rå HTML i window.__bt_confirmRespons)');
            } catch (_) {}
        }
        let lagret = false;
        try {
            const token2 = await dwrEncryptResId(resId);
            const buf2 = await fetch(`${REK_BASE}/requisition/confirm?loggedin=true&id_enc=${token2}&userid=${userid}&ns=true`, { credentials: 'include' }).then(r => r.arrayBuffer());
            const doc2 = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf2), 'text/html');
            const el2 = doc2.querySelector('[name="departureTime"]');
            const v2 = ((el2 && (el2.getAttribute('value') || el2.value)) || '').trim();
            if (ER_DEV) console.log('[' + NAVN + '] endreTid-verifisering: departureTime i skjemaet = «' + v2 + '» (ville ha «' + nyTid + '»)');
            lagret = v2 === nyTid;
        } catch (_) { /* behandles som ikke lagret */ }
        if (!lagret) return { ok: false, status: res.status, feil: 'NISSY lagret IKKE ny tid' + (feilTekst ? ' — NISSY sier: ' + feilTekst.slice(0, 300) : ' (ingen feiltekst funnet — sjekk konsollen i planleggeren)') };
        return { ok: true, status: res.status };
    }

    // Bytt hent-/leveringssted-adressen i en VENTENDE rekvisisjon via altRequisition-editoren (samme
    // bevisste flyt som gardermoen.js). ende='fra'(hentested)|'til'(leveringssted). adr=Geonorge-treff
    // m/ strukturerte deler. KUN ventende — kalleren gater på det (adresse-endring kan bytte transportør).
    // Henter UTM-posisjon for BEGGE ender via NISSYs validateAddress før lagring — ellers nullstilles
    // posisjon og helseforetak avledes feil (korrupsjon). Avbryter trygt hvis validering feiler.
    // v1.103: ekstra = {kommentar, kmOrig, kmAlt, origAdr} (valgfritt) → auto-notat + begrunnelse
    // skrives ALLTID i trip.comment (Thomas' krav: all adresseendring skal logges på rekvisisjonen).
    async function byttRekvisisjonAdresse(resId, ende, adr, ekstra) {
        try {
            const userid = await hentRekUserid();
            if (!userid) return { ok: false, feil: 'fant ikke userid' };
            const enc = await dwrEncryptResId(resId);
            const editUrl = `${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc)}&userid=${encodeURIComponent(userid)}&ns=true`;
            const buf = await fetch(editUrl, { credentials: 'include' }).then(r => r.arrayBuffer());
            const doc = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf), 'text/html');
            if (doc.querySelector('[name="j_username"], input[type="password"]')) return { ok: false, feil: 'utlogget i rekvisisjon-modulen' };
            const form = doc.querySelector('#mainForm') || doc.querySelector('form[name="mainForm"]');
            if (!form) return { ok: false, feil: 'fant ikke altRequisition-skjema (uventet side)' };
            const fd = new FormData(form);
            const pfx = (ende === 'fra') ? 'trip.fromAddress' : 'trip.toAddress';
            // v1.105: ta vare på OPPRINNELIG adresse på enden som byttes (til beregnReisetid-delta)
            // FØR feltene muteres under.
            const nissyAdr = p => ({ gatenavn: fd.get(p+'.streetName') || '', husnummer: fd.get(p+'.houseNr') || '', husbokstav: fd.get(p+'.houseSubNr') || '', postnummer: fd.get(p+'.postCode') || '', poststed: fd.get(p+'.city') || '' });
            const origAdrObj = nissyAdr(pfx);
            // Sett den nye adressen (strukturert) på valgt ende. Cadastral/property tømmes → validateAddress fyller.
            fd.set(pfx + '.streetName', adr.gatenavn || adr.adresse || '');
            fd.set(pfx + '.houseNr', adr.husnr || '');
            fd.set(pfx + '.houseSubNr', adr.husbokstav || '');
            fd.set(pfx + '.apartmentNr', '');
            fd.set(pfx + '.postCode', adr.postnr || '');
            fd.set(pfx + '.city', adr.poststed || '');
            fd.set(pfx + '.cadastralUnitNumber', '');
            fd.set(pfx + '.propertyUnitNumber', '');
            const lesAdr = p => ({ streetName: fd.get(p+'.streetName')||'', houseNr: fd.get(p+'.houseNr')||'', houseSubNr: fd.get(p+'.houseSubNr')||'', apartmentNr: fd.get(p+'.apartmentNr')||'', postCode: fd.get(p+'.postCode')||'', city: fd.get(p+'.city')||'', cadastralUnitNumber: fd.get(p+'.cadastralUnitNumber')||'', propertyUnitNumber: fd.get(p+'.propertyUnitNumber')||'' });
            const validerAdr = async a => {
                try {
                    const r = await fetch(`${REK_BASE}/ajax/validateAddress`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' }, body: new URLSearchParams(a).toString(), credentials: 'include' });
                    const j = await r.json();
                    return (j && String(j.valid) === 'true' && j.address) ? j.address : null;
                } catch (_) { return null; }
            };
            const fromA = await validerAdr(lesAdr('trip.fromAddress'));
            const toA = await validerAdr(lesAdr('trip.toAddress'));
            if (!fromA || !toA || !(parseFloat(fromA.utmCoordinateX) > 0) || !(parseFloat(toA.utmCoordinateX) > 0)) {
                return { ok: false, feil: 'NISSY validerte ikke adressen (ingen gyldig posisjon) — avbrutt, INGENTING lagret' };
            }
            const settUtm = (p, a) => { fd.set(p+'.utmCoordinate.x', a.utmCoordinateX); fd.set(p+'.utmCoordinate.y', a.utmCoordinateY); fd.set(p+'.utmCoordinate.z', a.utmCoordinateZ); fd.set(p+'.utmCoordinate.zone', a.utmCoordinateZone); };
            settUtm('trip.fromAddress', fromA);
            settUtm('trip.toAddress', toA);
            // v1.108: hentetid-forslag ved bytte av HENTESTED — NISSYs egen tidberegner
            // (ajax/beregnReisetid, Thomas fant endepunktet 2026-07-02) for opprinnelig og ny
            // henteadresse mot samme behandlingssted. Delta = ny − orig reisetid → hentetiden bør
            // flyttes −delta for å rekke oppmøtet. Delta (ikke absolutt) bevarer turens eksisterende
            // slakk/manuelle justeringer. MÅ kjøres HER — FØR altRequisition-POSTen: endepunktet
            // leser wizard-tilstand fra server-sesjonen, og etter lagring er den borte → 500
            // (Thomas' test 02.07: to 500-ere når kallet lå etter POSTen). Best effort.
            // Popupen forhåndsberegner normalt (forhandsberegnReisetid) og sender resultatet i
            // ekstra.reisetid — da hopper vi over rekalkuleringen her.
            let reisetid = (ekstra && ekstra.reisetid) || null;
            if (ende === 'fra' && !reisetid) {
                try {
                    // NB: skjemaet bruker treatmentDatePart/treatmentTimePart (gardermoen-fasit),
                    // ikke treatmentDate — v1.105 traff aldri pga. feil feltnavn.
                    let behDato = fd.get('treatmentDatePart') || fd.get('treatmentDate') || '';
                    const behTid = fd.get('treatmentTimePart') || fd.get('treatmentTime') || '';
                    const dm = String(behDato).match(/^(\d{2}\.\d{2})\.(?:20)?(\d{2})$/);
                    if (dm) behDato = dm[1] + '.' + dm[2];  // beregnReisetid vil ha dd.MM.yy
                    if (behDato && behTid) {
                        const tilAdrObj = nissyAdr('trip.toAddress');
                        const [rO, rN] = await Promise.all([
                            beregnReisetidNissy(origAdrObj, tilAdrObj, behDato, behTid),
                            beregnReisetidNissy(nissyAdr(pfx), tilAdrObj, behDato, behTid)
                        ]);
                        if (rO && rN) reisetid = nissyDelta(rO, rN);
                    } else if (ER_DEV) {
                        console.log('[' + NAVN + '] beregnReisetid hoppet over — fant ikke behandlingsdato/-tid i skjemaet (treatmentDatePart/treatmentTimePart)');
                    }
                } catch (_) { /* best effort */ }
            }
            // v1.103: logg endringen i trip.comment — auto-notat + evt. operatørens begrunnelse
            // + signatur. Merge à la gardermoen.js: dedup våre egne gamle «Endret …»-notater,
            // behold resten, ' | '-separator, 255-grense. Best effort — stopper aldri adressebyttet.
            try {
                const e = ekstra || {};
                const endeTekst = (ende === 'fra') ? 'hentested' : 'leveringssted';
                const nyAdr = (adr.adresse || adr.gatenavn || '') + (adr.postnr ? ', ' + adr.postnr + ' ' + (adr.poststed || '') : '');
                let kmDel = '';
                if (e.kmOrig != null && e.kmAlt != null) {
                    const d = Math.round((e.kmAlt - e.kmOrig) * 10) / 10;
                    kmDel = ' (' + (d > 0 ? '+' : '') + d + ' km)';
                }
                const deler = ['Endret ' + endeTekst + (e.origAdr ? ' fra ' + e.origAdr : '') + ' til ' + nyAdr + kmDel];
                if (e.kommentar && String(e.kommentar).trim()) deler.push(String(e.kommentar).trim());
                const sig = hentAvvikSignatur();
                if (sig) deler.push(sig);
                const notat = deler.join('. ');
                const eks = (fd.get('trip.comment') || '').trim()
                    .replace(/Endret (?:hentested|leveringssted)[^|]*/gi, '')
                    .replace(/(^\s*\|\s*)|(\s*\|\s*$)/g, '').trim();
                fd.set('trip.comment', (eks ? eks + ' | ' + notat : notat).slice(0, 255));
            } catch (_) { /* kommentar er best effort */ }
            fd.set('submit_action', '');
            fd.set('submitflag', 'true');
            const body = [...fd].map(([k, v]) => latin1Form(k) + '=' + latin1Form(String(v))).join('&');
            const res = await fetch(`${REK_BASE}/requisition/altRequisition?clear=false`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1' }, body, credentials: 'include' });
            if (!res.ok) return { ok: false, feil: 'lagring feilet: HTTP ' + res.status };
            // v1.107: HTTP 200 fra altRequisition betyr bare «wizard-side returnert» — IKKE lagret.
            // Ved valideringsfeil ekkoes skjemaet tilbake med feiltekst og INGENTING er endret
            // (Thomas' test 02.07: grønn ✓ i popupen, men adressen sto urørt i NISSY). Vi leser
            // derfor responsen, plukker ut feiltekst, og VERIFISERER lagringen ved å hente
            // edit-skjemaet på nytt og sammenligne (gardermoen-mønsteret) før vi melder suksess.
            const rhtml = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer());
            const rdoc = new DOMParser().parseFromString(rhtml, 'text/html');
            let feilTekst = '';
            const feilEls = rdoc.querySelectorAll('.errorText, .error, .errors li, ul.error li, font[color="red"], span[style*="red"], [class*="rror"]');
            for (let i = 0; i < feilEls.length; i++) {
                const ft = (feilEls[i].textContent || '').replace(/\s+/g, ' ').trim();
                if (ft && feilTekst.indexOf(ft) === -1) feilTekst += (feilTekst ? ' | ' : '') + ft;
            }
            if (ER_DEV) {
                try {
                    window.__bt_altRespons = rhtml;  // rå respons for inspeksjon i konsollen
                    const postet = [];
                    for (const [k, v] of fd) { if (/time|travel|date/i.test(k)) postet.push(k + '=' + v); }
                    const svar = [];
                    const alle = rdoc.querySelectorAll('input, select');
                    for (let i = 0; i < alle.length; i++) {
                        const el = alle[i];
                        if (/time|travel|date/i.test(el.name || '')) svar.push(el.name + '=' + el.value);
                    }
                    console.log('[' + NAVN + '] altRequisition-respons — title: «' + (rdoc.title || '') + '», feiltekst: «' + feilTekst + '» (rå HTML i window.__bt_altRespons)');
                    console.log('[' + NAVN + '] altRequisition-diagnostikk — POSTet tidsfelter:', postet);
                    console.log('[' + NAVN + '] altRequisition-diagnostikk — responsens tidsfelter:', svar);
                } catch (_) { /* kun diagnostikk */ }
            }
            // Verifiser: hent skjemaet på nytt og sjekk at den nye adressen faktisk står der.
            let lagret = false;
            try {
                const enc2 = await dwrEncryptResId(resId);
                const buf2 = await fetch(`${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc2)}&userid=${encodeURIComponent(userid)}&ns=true`, { credentials: 'include' }).then(r => r.arrayBuffer());
                const doc2 = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf2), 'text/html');
                const les2 = n => { const el = doc2.querySelector('[name="' + pfx + '.' + n + '"]'); return ((el && (el.getAttribute('value') || el.value)) || '').trim().toLowerCase(); };
                lagret = les2('streetName') === String(fd.get(pfx + '.streetName') || '').trim().toLowerCase()
                      && les2('postCode') === String(fd.get(pfx + '.postCode') || '').trim().toLowerCase();
            } catch (_) { /* behandles som ikke lagret */ }
            if (!lagret) return { ok: false, feil: 'NISSY lagret IKKE adressen' + (feilTekst ? ' — NISSY sier: ' + feilTekst.slice(0, 300) : ' (ingen feiltekst funnet i responsen — sjekk konsollen i planleggeren)') };
            return { ok: true, validert: (ende === 'fra' ? fromA : toA), reisetid };
        } catch (e) { return { ok: false, feil: e.message }; }
    }
    // v1.108: FORHÅNDSberegn reisetid-endringen FØR adressen skrives — operatøren skal kunne
    // avklare ny hentetid med pasienten før byttet gjøres (Thomas 02.07). Read-only: GET av
    // edit-skjemaet (etablerer wizard-sesjonen beregnReisetid trenger) + to beregnReisetid-kall.
    // Kun relevant for hentested (ende='fra') — leveringsbytte påvirker ikke hentetiden.
    async function forhandsberegnReisetid(resId, ende, adr, tur) {
        // v1.109: diagnostikk på hvert bail-punkt (dev) — 03.07-testen ga «Fikk ikke NISSY-reisetid»
        // uten spor av HVOR den stoppet.
        const dbg = m => { if (ER_DEV) console.log('[' + NAVN + '] forhandsReisetid: ' + m); };
        const nyAdrObj = { gatenavn: adr.gatenavn || adr.adresse || '', husnummer: adr.husnr || '', husbokstav: adr.husbokstav || '', postnummer: adr.postnr || '', poststed: adr.poststed || '' };
        // v1.112: DIREKTE-kall uten edit-skjema (Thomas 03.07: «beregn tid kan vel gis adresse
        // uansett?») — payloaden er ren adresse+tid, ingen turid/rekvnr. Adresser fra popupen
        // (admin-fasit) + behandlingstidspunkt fra admin-plakatens oppmøtetid («04.07.2026 08:45»).
        // Brukes som fallback når edit-skjema-veien feiler (pågående turer nekter edit).
        const parseAdrStr = s => {
            const m = String(s || '').match(/^(.*?)\s+(\d+)\s*([A-Za-zÆØÅæøå]?)\s*,\s*(\d{4})\s+(.+)$/);
            return m ? { gatenavn: m[1].trim(), husnummer: m[2], husbokstav: (m[3] || '').toUpperCase(), postnummer: m[4], poststed: m[5].trim() } : null;
        };
        const direkte = async () => {
            if (!tur || !tur.oppmoteRaw) { dbg('direkte: mangler oppmøtetid m/ dato (tur.oppmoteRaw)'); return null; }
            const tm = String(tur.oppmoteRaw).match(/(\d{2})\.(\d{2})\.(?:20)?(\d{2})\s+(\d{1,2}:\d{2})/);
            if (!tm) { dbg('direkte: klarte ikke parse oppmøtetid «' + tur.oppmoteRaw + '»'); return null; }
            const behDato = tm[1] + '.' + tm[2] + '.' + tm[3], behTid = tm[4];
            const fraObj = parseAdrStr(tur.fra), tilObj = parseAdrStr(tur.til);
            if (!fraObj || !tilObj) { dbg('direkte: klarte ikke parse adresse (fra=«' + (tur.fra || '') + '», til=«' + (tur.til || '') + '»)'); return null; }
            dbg('direkte: kaller beregnReisetid (behDato=' + behDato + ', behTid=' + behTid + ', fra=' + JSON.stringify(fraObj) + ', ny=' + JSON.stringify(nyAdrObj) + ', til=' + JSON.stringify(tilObj) + ')');
            const [rO, rN] = await Promise.all([
                beregnReisetidNissy(fraObj, tilObj, behDato, behTid),
                beregnReisetidNissy(nyAdrObj, tilObj, behDato, behTid)
            ]);
            dbg('direkte-svar: orig=' + (rO ? rO.reisetid : 'null') + ', ny=' + (rN ? rN.reisetid : 'null'));
            return (rO && rN) ? nissyDelta(rO, rN) : null;
        };
        try {
            if (ende !== 'fra') return null;
            const userid = await hentRekUserid();
            if (!userid) { dbg('ingen userid (window.__vkt_brukernavn mangler)'); return direkte(); }
            const enc = await dwrEncryptResId(resId);
            const editUrl = `${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc)}&userid=${encodeURIComponent(userid)}&ns=true`;
            const buf = await fetch(editUrl, { credentials: 'include' }).then(r => r.arrayBuffer());
            const doc = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf), 'text/html');
            const form = doc.querySelector('#mainForm') || doc.querySelector('form[name="mainForm"]');
            if (!form) { dbg('fant ikke edit-skjema (title: «' + (doc.title || '') + '») → prøver direkte-kall'); return direkte(); }
            const fd = new FormData(form);
            const nissyAdr = p => ({ gatenavn: fd.get(p+'.streetName') || '', husnummer: fd.get(p+'.houseNr') || '', husbokstav: fd.get(p+'.houseSubNr') || '', postnummer: fd.get(p+'.postCode') || '', poststed: fd.get(p+'.city') || '' });
            let behDato = fd.get('treatmentDatePart') || fd.get('treatmentDate') || '';
            const behTid = fd.get('treatmentTimePart') || fd.get('treatmentTime') || '';
            const dm = String(behDato).match(/^(\d{2}\.\d{2})\.(?:20)?(\d{2})$/);
            if (dm) behDato = dm[1] + '.' + dm[2];  // beregnReisetid vil ha dd.MM.yy
            if (!behDato || !behTid) { dbg('mangler behandlingsdato/-tid (datoPart=«' + (fd.get('treatmentDatePart') || '') + '», tidPart=«' + (fd.get('treatmentTimePart') || '') + '») → prøver direkte-kall'); return direkte(); }
            const tilAdrObj = nissyAdr('trip.toAddress');
            dbg('kaller beregnReisetid (behDato=' + behDato + ', behTid=' + behTid + ', fra=' + JSON.stringify(nissyAdr('trip.fromAddress')) + ', ny=' + JSON.stringify(nyAdrObj) + ', til=' + JSON.stringify(tilAdrObj) + ')');
            const [rO, rN] = await Promise.all([
                beregnReisetidNissy(nissyAdr('trip.fromAddress'), tilAdrObj, behDato, behTid),
                beregnReisetidNissy(nyAdrObj, tilAdrObj, behDato, behTid)
            ]);
            dbg('svar: orig=' + (rO ? rO.reisetid : 'null') + ', ny=' + (rN ? rN.reisetid : 'null'));
            if (rO && rN) return nissyDelta(rO, rN);
            dbg('beregnReisetid via edit-skjema ga null → prøver direkte-kall');
            return direkte();
        } catch (e) { dbg('exception: ' + e.message + ' → prøver direkte-kall'); return direkte(); }
    }

    window.__basicTools.kpLukk = () => kpLukk();   // verktoykasse lukker panelet før den åpner skjold-menyen
    window.__basicTools.byttAdresse = byttRekvisisjonAdresse;      // popupen kaller dette via window.opener
    window.__basicTools.endreTid = endreTidPaaResId;               // popupen: «🕐 Juster hentetid» etter adressebytte
    window.__basicTools.forhandsReisetid = forhandsberegnReisetid; // popupen: reisetid-forslag FØR adressebytte

    // v1.117: REGIONTILLEGGET medregnes (Thomas: «plusser ikke NISSY på 20 minutter?») — NISSY
    // setter hentetid = oppmøte − (reisetid + tidstilleggRegionalt), og tillegget AVHENGER av
    // adressen. Delta regnes derfor på reisetid+tillegg: kansellerer i samme region, slår inn
    // ved bytte over regiongrense. (Spesielle behov-tillegget er adresseuavhengig → kansellerer
    // alltid i deltaet, så tom valgteSpesielleBehov er fortsatt trygt.)
    function nissyDelta(rO, rN) {
        const eff = r => r.reisetid + (r.tidstilleggRegionalt || 0);
        return { orig: rO.reisetid, ny: rN.reisetid, delta: eff(rN) - eff(rO),
                 tilleggOrig: rO.tidstilleggRegionalt || 0, tilleggNy: rN.tidstilleggRegionalt || 0 };
    }

    // v1.105: NISSYs egen tidberegner — POST JSON til ajax/beregnReisetid (samme som rekvisisjons-
    // wizarden bruker). Svar: {reisetid: <min>, tidstilleggRegionalt, tidstilleggSpesielleBehov, …}.
    // Vi sender tomme spesielle behov — delta-bruken kansellerer uansett tilleggene.
    // v1.113 (500-GÅTEN LØST, Thomas' replay-test 03.07): endepunktet KREVER (1) Content-Type
    // application/x-www-form-urlencoded (Prototype.js-stil — kroppen er fortsatt rå JSON!) og
    // (2) transportType 'TAX' (tom streng → enum-parse-500). application/json ga generisk 500
    // («custom-ajax/T-…») fra ALLE faner — det var aldri noe wizard-sesjonskrav.
    async function beregnReisetidNissy(fraAdr, tilAdr, behDato, behTid) {
        try {
            // (3) Prototype-fella: planleggerens Array.prototype.toJSON dobbel-encoder arrays i
            // JSON.stringify ([] → "[]" som STRENG → Jackson-deserialiseringsfeil server-side).
            // Fjern midlertidig under serialisering og legg tilbake etterpå.
            const protoToJSON = Array.prototype.toJSON;
            let body;
            try {
                if (protoToJSON) delete Array.prototype.toJSON;
                body = JSON.stringify({ behandlingsdato: behDato, behandlingstid: behTid, valgteSpesielleBehov: [], fraAdresse: fraAdr, tilAdresse: tilAdr, transportType: 'TAX' });
            } finally {
                if (protoToJSON) Array.prototype.toJSON = protoToJSON;
            }
            const r = await fetch(`${REK_BASE}/ajax/beregnReisetid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                body,
                credentials: 'include'
            });
            if (!r.ok) {
                if (ER_DEV) { try { console.log('[' + NAVN + '] beregnReisetid HTTP ' + r.status + ': ' + (await r.text()).slice(0, 400)); } catch (_) {} }
                return null;
            }
            const j = await r.json();
            // Feil kan komme som HTTP 200 med {errorMessage: …} (f.eks. deserialiseringsfeil).
            if (ER_DEV && j && j.errorMessage) console.log('[' + NAVN + '] beregnReisetid errorMessage: ' + String(j.errorMessage).slice(0, 300));
            return (j && typeof j.reisetid === 'number') ? j : null;
        } catch (_) { return null; }
    }

    // Deler «Fagerliveien 3F, 2010 Strømmen» → strukturerte felter. Både beregnReisetid og
    // manualtrip krever gatenavn/husnummer/husbokstav/postnummer hver for seg.
    function delAdr(a) {
        const m = String(a || '').match(/^(.*?),?\s*(\d{4})\s+(.+)$/);
        const gate = m ? m[1].trim() : String(a || '').trim();
        const g2 = gate.match(/^(.*?)\s+(\d+)\s*([A-Za-zÆØÅæøå])?$/);
        return { gatenavn: g2 ? g2[1].trim() : gate, husnummer: g2 ? g2[2] : '',
                 husbokstav: (g2 && g2[3]) ? g2[3].toUpperCase() : '',
                 postnummer: m ? m[2] : '', poststed: m ? m[3].trim() : '' };
    }

    // v1.133-dev: NISSYS EGEN KILOMETER for et vilkårlig adressepar.
    // Planleggerens «Beregn enkeltreise» poster hit. Ingen turid, ingen resId — den regner på
    // løse adresser, og svarer med distanse (3 desimaler), kjøretid og pris per transportør.
    // ⚠️ To skjemavarianter finnes. Serverens ajax-leverte (action=manualTrip, fromStreet…) gir
    //    404 — det er død kode. Bruk den lokalt genererte: action=manualtrip + fra_gate/til_gate.
    // ⚠️ Svaret er ISO-8859-1. Uten TextDecoder blir «kjøretid» til mojibake og regexen bommer.
    //   __basicTools.nissyEnkelttur('Hogstveien 27, 1479 Kurland', 'Sykehusveien 19, 1474 Lørenskog')
    //   → {km: 3.461, minutter: 4}
    async function nissyEnkelttur(fraAdr, tilAdr) {
        const f = (typeof fraAdr === 'string') ? delAdr(fraAdr) : (fraAdr || {});
        const t = (typeof tilAdr === 'string') ? delAdr(tilAdr) : (tilAdr || {});
        try {
            const body = new URLSearchParams({
                fra_gate: f.gatenavn || '', fra_husnr: f.husnummer || '',
                fra_husnr_sub: f.husbokstav || '', fra_postnr: f.postnummer || '',
                til_gate: t.gatenavn || '', til_husnr: t.husnummer || '',
                til_husnr_sub: t.husbokstav || '', til_postnr: t.postnummer || ''
            }).toString();
            const r = await fetch(NISSY_ORIGIN + '/planlegging/manualtrip', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (!r.ok) {
                if (ER_DEV) console.log('[' + NAVN + '] manualtrip HTTP ' + r.status);
                return null;
            }
            const html = new TextDecoder('iso-8859-1').decode(await r.arrayBuffer());
            const mKm  = html.match(/Forventet distanse:[\s\S]*?transcostcont[^>]*>\s*([\d.,]+)\s*km/i);
            const mMin = html.match(/Forventet kj[^<]*tid:[\s\S]*?transcostcont[^>]*>\s*(\d+)\s*min/i);
            if (!mKm) {
                if (ER_DEV) console.log('[' + NAVN + '] manualtrip uten distanse: ' + html.slice(0, 300));
                return null;
            }
            return { km: parseFloat(mKm[1].replace(',', '.')),
                     minutter: mMin ? parseInt(mMin[1], 10) : null };
        } catch (_) { return null; }
    }

    // v1.132-dev (Thomas 21.08): SAMMENLIGN TO HENTEADRESSER med NISSYs egen motor.
    // Avvik trenger ikke kilometer — den trenger å vite om BESTILT hentested gir lengre
    // tur enn FOLKEREGISTRERT. To beregnReisetid-kall svarer på det direkte:
    //   · samme motor som satte hentetiden, så ingen ekstern kilde å bestride
    //   · systematiske skjevheter kansellerer (samme beregning begge veier)
    //   · ingen geokodingsbom — NISSY tar strukturert adresse, ikke en streng
    // Tillegget (tidstilleggRegionalt) tas MED her: det er adresseavhengig, så det er en
    // reell forskjell mellom to hentesteder — i motsetning til utsendelsesvarselet, der
    // det bare er margin for å rekke timen.
    //   __basicTools.sammenlignHentesteder('Fagerliveien 3F, 2010 Strømmen',
    //                                       'Ullernchausséen 70, 0379 Oslo',
    //                                       'Ullernchausséen 70, 0379 Oslo')
    async function sammenlignHentesteder(folkeregAdr, bestiltAdr, behandlingsAdr) {
        const del = delAdr;
        const dn = new Date(), p2 = n => String(n).padStart(2, '0');
        const dato = p2(dn.getDate()) + '.' + p2(dn.getMonth() + 1) + '.' + String(dn.getFullYear()).slice(-2);
        const tid  = p2(dn.getHours()) + ':' + p2(dn.getMinutes());
        const til  = del(behandlingsAdr);
        // v1.133-dev: hent BÅDE minutter (beregnReisetid) og kilometer (manualtrip). Km er det
        // regelverket er formulert i; minuttene er kontrollen på at km-svaret er rimelig.
        const [f, b, kf, kb] = await Promise.all([
            beregnReisetidNissy(del(folkeregAdr), til, dato, tid),
            beregnReisetidNissy(del(bestiltAdr),  til, dato, tid),
            nissyEnkelttur(del(folkeregAdr), til),
            nissyEnkelttur(del(bestiltAdr),  til)
        ]);
        if (!f || !b) { console.warn('[NISSY-DIFF] mangler tidssvar — logget inn i rekvisisjonsmodulen?'); return null; }
        const eff = r => r.reisetid + (r.tidstilleggRegionalt || 0);
        const delta = eff(b) - eff(f);
        const dKm = (kf && kb) ? Math.round((kb.km - kf.km) * 1000) / 1000 : null;
        console.log('[NISSY-DIFF] mot %s', behandlingsAdr);
        console.table([
            { hentested: 'folkeregistrert', adresse: folkeregAdr, reisetid: f.reisetid, tillegg: f.tidstilleggRegionalt || 0, sum: eff(f), km: kf ? kf.km : '–' },
            { hentested: 'bestilt',         adresse: bestiltAdr,  reisetid: b.reisetid, tillegg: b.tidstilleggRegionalt || 0, sum: eff(b), km: kb ? kb.km : '–' }
        ]);
        const fortegn = v => (v > 0 ? '+' : '');
        const pctMin = eff(f) ? 100 * delta / eff(f) : 0;
        console.log('[NISSY-DIFF] ' + (delta > 0 ? 'BESTILT ER LENGRE' : (delta < 0 ? 'bestilt er kortere' : 'likt'))
            + ': ' + fortegn(delta) + delta + ' min (' + fortegn(pctMin) + pctMin.toFixed(0) + ' %)');
        if (dKm === null) console.log('[NISSY-DIFF] km: manualtrip svarte ikke (kjører du fra planleggeren?)');
        else {
            const pctKm = kf.km ? 100 * dKm / kf.km : 0;
            console.log('[NISSY-DIFF] km: ' + fortegn(dKm) + dKm.toFixed(3) + ' km ('
                + fortegn(pctKm) + pctKm.toFixed(1) + ' %)');
        }
        return { folkereg: eff(f), bestilt: eff(b), delta, pct: eff(f) ? 100 * delta / eff(f) : 0,
                 kmFolkereg: kf ? kf.km : null, kmBestilt: kb ? kb.km : null, deltaKm: dKm,
                 pctKm: (dKm !== null && kf.km) ? 100 * dKm / kf.km : null };
    }

    // v1.131-dev DIAGNOSTIKK: finn hvor NISSY henter «Forventet distanse: 96.25 km».
    // beregnReisetid gir KUN tid (reisetid, tidstilleggRegionalt) — ingen km (Thomas 21.08).
    // Distansen vises i rekvisisjons-popupen «(korteste vei)», så kallet ligger et annet sted.
    // Kjør fra planleggeren:  __basicTools.finnDistanseKall()
    function finnDistanseKall() {
        const funn = { inlineTreff: [], urler: new Set(), globaleFunksjoner: [], dwr: [] };
        // 1) NISSYs inline-JS: let etter «distan»/«korteste» og fang omkringliggende kode
        const skript = [...document.querySelectorAll('script')].map(s => s.textContent || '').join('\n');
        const re = /[\s\S]{0,90}(distanse|distance|korteste|shortestPath|avstand)[\s\S]{0,110}/gi;
        let m, n = 0;
        while ((m = re.exec(skript)) !== null && n++ < 12) funn.inlineTreff.push(m[0].replace(/\s+/g, ' ').trim());
        // 2) URL-er som nevner distanse
        let u; const reU = /["'`]([^"'`]{4,120}(?:distan|korteste|avstand)[^"'`]{0,80})["'`]/gi;
        while ((u = reU.exec(skript)) !== null) funn.urler.add(u[1]);
        // 3) Globale funksjoner med relevante navn
        for (const k in window) {
            try { if (typeof window[k] === 'function' && /distan|korteste|avstand|rute/i.test(k)) funn.globaleFunksjoner.push(k); }
            catch (_) {}
        }
        // 4) DWR-interfacer (NISSY bruker DWR til mye)
        try { for (const k in window) if (window[k] && typeof window[k] === 'object' && window[k]._path) funn.dwr.push(k); } catch (_) {}
        console.log('[DISTANSE] inline-treff (%d):', funn.inlineTreff.length);
        funn.inlineTreff.forEach(t => console.log('   ', t.slice(0, 190)));
        console.log('[DISTANSE] URL-kandidater:', [...funn.urler]);
        console.log('[DISTANSE] globale funksjoner:', funn.globaleFunksjoner);
        console.log('[DISTANSE] DWR-objekter:', funn.dwr);
        console.log('[DISTANSE] TIPS: åpne «Forventet distanse»-popupen med Network-fanen åpen — kallet vises der.');
        return funn;
    }

    // v1.129-dev DIAGNOSTIKK (Thomas 21.08): dumper HELE svaret fra NISSYs beregnReisetid.
    // NISSY viser «Forventet distanse: 96.25 km» i rekvisisjonsboksen, så den HAR en egen
    // kilometerberegning — og det er den som faktisk ligger til grunn når avvik vurderes.
    // Vi leser bare j.reisetid i dag og kaster resten; dette viser hva som ellers er der.
    // Kjør fra planleggeren:
    //   __basicTools.visReisetidSvar('Vevelstadåsen 21, 1405 Langhus', 'Sykehusveien 25, 1474 Lørenskog')
    async function visReisetidSvar(fraAdr, tilAdr) {
        // NISSY tar IKKE en adressestreng — Jackson avviste «adresse» med
        // «5 known properties: poststed, husnummer, postnummer, gatenavn, husbokstav»
        // (Thomas' kjøring 21.08). Gatenavn, husnummer og husbokstav må splittes.
        const del = (a) => {
            const m = String(a || '').match(/^(.*?),?\s*(\d{4})\s+(.+)$/);
            const gate = m ? m[1].trim() : String(a || '').trim();
            const g2 = gate.match(/^(.*?)\s+(\d+)\s*([A-Za-zÆØÅæøå])?$/);
            return {
                gatenavn:   g2 ? g2[1].trim() : gate,
                husnummer:  g2 ? g2[2] : '',
                husbokstav: (g2 && g2[3]) ? g2[3].toUpperCase() : '',
                postnummer: m ? m[2] : '',
                poststed:   m ? m[3].trim() : ''
            };
        };
        const dn = new Date(), p2 = n => String(n).padStart(2, '0');
        const dato = p2(dn.getDate()) + '.' + p2(dn.getMonth() + 1) + '.' + String(dn.getFullYear()).slice(-2);
        const tid  = p2(dn.getHours()) + ':' + p2(dn.getMinutes());
        const j = await beregnReisetidNissy(del(fraAdr), del(tilAdr), dato, tid);
        if (!j) { console.warn('[NISSY] beregnReisetid ga ingenting — er du logget inn i rekvisisjonsmodulen?'); return null; }
        console.log('[NISSY] HELE svaret for «%s» → «%s»:', fraAdr, tilAdr);
        console.table(Object.entries(j).map(([k, v]) => ({ felt: k, verdi: typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : v })));
        const kmFelt = Object.entries(j).filter(([k]) => /km|dist|lengde|meter/i.test(k));
        console.log(kmFelt.length ? '[NISSY] DISTANSE-FELT: ' + JSON.stringify(Object.fromEntries(kmFelt))
                                  : '[NISSY] ingen distanse i dette svaret — km kommer trolig fra et annet kall');
        return j;
    }

    // v1.103-dev DIAGNOSTIKK (steg 3): kartlegg NISSYs innebygde tidberegner. Kjøres manuelt fra
    // konsollen i planleggeren: __basicTools.diagTidberegner('<resId fra en ventende V-rad>').
    // (1) enumererer DWR-interfaces + metoder (samme mekanisme som Requisition.encrypt),
    // (2) lister tidsfeltene i edit-skjemaet + funksjons-/ajax-hint i wizard-ens inline-JS.
    // Read-only — POSTer ingenting. Kun dev.
    async function diagTidberegner(resId) {
        const ut = { dwrInterfaces: {}, tidsfelter: null, jsHint: null, ajaxHint: null };
        try {
            const idx = await fetch(`${REK_BASE}/dwr/index.html`, { credentials: 'include' }).then(r => r.text());
            const navnSet = new Set();
            let m; const reIdx = /(?:test|interface)\/([A-Za-z0-9_$]+)/g;
            while ((m = reIdx.exec(idx)) !== null) navnSet.add(m[1].replace(/\.js$/, ''));
            for (const n of navnSet) {
                try {
                    const js = await fetch(`${REK_BASE}/dwr/interface/${n}.js`, { credentials: 'include' }).then(r => r.text());
                    const metoder = [];
                    let mm; const reMet = /^\s*[A-Za-z0-9_$]+\.([A-Za-z0-9_$]+)\s*=\s*function/gm;
                    while ((mm = reMet.exec(js)) !== null) metoder.push(mm[1]);
                    ut.dwrInterfaces[n] = metoder;
                } catch (e2) { ut.dwrInterfaces[n] = 'feil: ' + e2.message; }
            }
        } catch (e) { ut.dwrInterfaces = 'index utilgjengelig: ' + e.message; }
        if (resId) {
            try {
                const userid = await hentRekUserid();
                const enc = await dwrEncryptResId(resId);
                const buf = await fetch(`${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc)}&userid=${encodeURIComponent(userid)}&ns=true`, { credentials: 'include' }).then(r => r.arrayBuffer());
                const html = new TextDecoder('iso-8859-1').decode(buf);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const felter = [];
                const alle = doc.querySelectorAll('input, select');
                for (let i = 0; i < alle.length; i++) {
                    const el = alle[i];
                    if (/time|travel|date/i.test(el.name || '')) felter.push({ name: el.name, type: el.type || el.tagName, value: el.value });
                }
                ut.tidsfelter = felter;
                const jsHint = []; let jm; const reJs = /function\s+([A-Za-z0-9_$]*(?:[Tt]ime|[Tt]ravel|[Bb]eregn|[Cc]alc)[A-Za-z0-9_$]*)\s*\(/g;
                while ((jm = reJs.exec(html)) !== null) jsHint.push(jm[1]);
                ut.jsHint = jsHint;
                const ajaxSet = new Set(); let am; const reAjax = /ajax\/([A-Za-z0-9_$]+)/g;
                while ((am = reAjax.exec(html)) !== null) ajaxSet.add(am[1]);
                ut.ajaxHint = Array.from(ajaxSet);
            } catch (e) { ut.tidsfelter = 'feil: ' + e.message; }
        }
        console.log('[' + NAVN + '] tidberegner-diagnostikk:', ut);
        return ut;
    }
    if (ER_DEV) window.__basicTools.diagTidberegner = diagTidberegner;
    if (ER_DEV) window.__basicTools.visReisetidSvar = visReisetidSvar;
    if (ER_DEV) window.__basicTools.finnDistanseKall = finnDistanseKall;
    window.__basicTools.nissyEnkelttur = nissyEnkelttur;   // NISSYs egen km for vilkårlig adressepar
    if (ER_DEV) window.__basicTools.sammenlignHentesteder = sammenlignHentesteder;

    function bekreftTilordningAlle(antall) {
        return new Promise(resolve => {
            const id = 'vkt-bekreft-tilordn';
            trygtFjern(document.getElementById(id));
            const backdrop = document.createElement('div');
            backdrop.id = id;
            backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2147483647;display:flex;align-items:center;justify-content:flex-start;padding-left:40px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
            const box = document.createElement('div');
            box.style.cssText = 'background:#1e293b;border:1px solid #fbbf24;border-radius:10px;padding:20px 22px;min-width:340px;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,0.7);color:#e2e8f0;';
            const chunks = Math.ceil(antall / 5);
            box.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <span style="font-size:24px;">🎯</span>
                    <span style="font-size:16px;font-weight:600;color:#fbbf24;">Bekreft tilordning</span>
                    <span style="background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;margin-left:auto;">BETA</span>
                </div>
                <div style="font-size:13px;line-height:1.5;margin-bottom:18px;">
                    Du er i ferd med å kjøre NISSYs Tilordningsstøtte mot <strong style="color:#fbbf24;">${antall}</strong> markerte turer
                    (i ${chunks} batch${chunks > 1 ? 'er' : ''} à 5).<br><br>
                    NISSYs forslag vil bli <strong>auto-tildelt</strong>. Turer uten forslag hoppes over.<br><br>
                    Ønsker du å fortsette?
                </div>
                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button id="${id}-avbryt" style="padding:8px 16px;border-radius:6px;border:1px solid #475569;background:#334155;color:#e2e8f0;font-size:13px;cursor:pointer;">Avbryt</button>
                    <button id="${id}-ok" style="padding:8px 16px;border-radius:6px;border:1px solid #d97706;background:#d97706;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Auto-tildel alle</button>
                </div>`;
            backdrop.appendChild(box);
            document.body.appendChild(backdrop);
            function lukk(svar) {
                document.removeEventListener('keydown', escHandler);
                trygtFjern(backdrop);
                resolve(svar);
            }
            function escHandler(e) { if (e.key === 'Escape') lukk(false); }
            document.addEventListener('keydown', escHandler);
            backdrop.addEventListener('click', e => { if (e.target === backdrop) lukk(false); });
            document.getElementById(`${id}-avbryt`).onclick = () => lukk(false);
            document.getElementById(`${id}-ok`).onclick = () => lukk(true);
        });
    }

    async function tilordnAlle(resIds) {
        const CHUNK = 5;  // NISSY-grense
        const ASSIST_URL = NISSY_ORIGIN + '/planlegging/ajax-dispatch/assignVoppsAssist';
        const TILDEL_BASE = NISSY_ORIGIN + '/planlegging/ajax-dispatch';

        trygtFjern(document.getElementById('vkt-tilordn-progress'));
        const t = document.createElement('div');
        t.id = 'vkt-tilordn-progress';
        t.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;color:#e2e8f0;border:1px solid #fbbf24;border-radius:8px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:240px;';
        document.body.appendChild(t);

        let tildelt = 0;
        let utenForslag = 0;
        let feilet = 0;
        const totalChunks = Math.ceil(resIds.length / CHUNK);

        try {
            for (let i = 0; i < resIds.length; i += CHUNK) {
                const chunk = resIds.slice(i, i + CHUNK);
                const chunkNr = Math.floor(i / CHUNK) + 1;
                t.textContent = `Henter forslag (${chunkNr}/${totalChunks})…`;

                const fd = new URLSearchParams();
                chunk.forEach(id => fd.append('sourceList[]', id));
                let data;
                try {
                    const r1 = await fetch(ASSIST_URL, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                        body: fd.toString()
                    });
                    if (!r1.ok) throw new Error('HTTP ' + r1.status);
                    data = await r1.json();
                    console.log(`[${NAVN}] assignVoppsAssist chunk ${chunkNr} svar:`, data);
                } catch (e) {
                    console.warn(`[${NAVN}] assignVoppsAssist feilet for chunk ${chunkNr}:`, e);
                    feilet += chunk.length;
                    continue;
                }

                // Filtrer bort entries uten faktisk transportør/avtale (typisk time-type-turer
                // som NISSY tar med i responsen men ikke kan tilordne).
                const raaForslag = Array.isArray(data && data.ids) ? data.ids : [];
                const forslag = raaForslag.filter(f =>
                    f && f.requisitionId && f.transporterId && f.agreementId
                    && String(f.transporterId).trim() !== '' && String(f.agreementId).trim() !== ''
                );
                if (raaForslag.length !== forslag.length) {
                    console.log(`[${NAVN}] filtrert bort ${raaForslag.length - forslag.length} forslag uten transportør/avtale`);
                }
                utenForslag += chunk.length - forslag.length;
                if (forslag.length === 0) {
                    await new Promise(r => setTimeout(r, 300));
                    continue;
                }

                t.textContent = `Tildeler ${forslag.length} (${chunkNr}/${totalChunks})…`;
                // Håndlag ids-string for å matche NISSYs eksakte format (med mellomrom etter : og ,)
                const itemsStr = forslag.map(f =>
                    `{\\"requisitionId\\": \\"${f.requisitionId}\\", \\"transporterId\\": \\"${f.transporterId}\\", \\"agreementId\\": \\"${f.agreementId}\\"}`
                ).join(', ');
                const idsParam = `"[${itemsStr}]"`;
                const url = `${TILDEL_BASE}?did=all&action=assresassist&ids=${encodeURIComponent(idsParam)}`;
                console.log(`[${NAVN}] assresassist URL:`, url);
                try {
                    const r2 = await fetch(url, { credentials: 'include' });
                    const tekst = await r2.text();
                    console.log(`[${NAVN}] assresassist svar (${r2.status}):`, tekst.slice(0, 400));
                    if (r2.ok && tekst && !tekst.includes('"error"') && !tekst.toLowerCase().includes('feil')) {
                        tildelt += forslag.length;
                    } else {
                        console.warn(`[${NAVN}] assresassist svar tyder på feil`);
                        feilet += forslag.length;
                    }
                } catch (e) {
                    console.warn(`[${NAVN}] assresassist feilet:`, e);
                    feilet += forslag.length;
                }

                await new Promise(r => setTimeout(r, 500));
            }
        } finally {
            const deler = [`${tildelt} tildelt`];
            if (utenForslag) deler.push(`${utenForslag} uten forslag`);
            if (feilet) deler.push(`${feilet} feilet`);
            t.textContent = 'Ferdig: ' + deler.join(', ');
            t.style.color = feilet ? '#ef4444' : (tildelt > 0 ? '#10b981' : '#fbbf24');
            setTimeout(() => trygtFjern(t), 5000);
        }
    }

    function visKontekstmeny(resIds, x, y) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
        const meny = document.createElement('div');
        meny.id = 'vkt-ctx-meny';
        meny.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
            'padding:4px', 'min-width:220px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const tittel = document.createElement('div');
        tittel.textContent = `${resIds.length} tur${resIds.length > 1 ? 'er' : ''} valgt`;
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #334155;margin-bottom:4px;';
        if (ER_DEV) {
            const devTag = document.createElement('span');
            devTag.textContent = ' DEV';
            devTag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
            tittel.appendChild(devTag);
        }
        meny.appendChild(tittel);

        const valg = [
            { tekst: '⏰ Endre hentetid…', handler: () => visEndreTidModal(resIds, x, y) },
            { tekst: '🗺️ Sjekk samkjøring…', beta: true, handler: () => aapneSamkjoring() },
        ];
        // Tilordningsstøtte: kjører NISSYs assignVoppsAssist i batches på 5
        valg.push({
            tekst: `🎯 Tilordningsstøtte (${resIds.length})…`,
            beta: true,
            handler: async () => {
                if (!await bekreftTilordningAlle(resIds.length)) return;
                await tilordnAlle(resIds);
            }
        });
        const alleVRader = lesAlleVRader();
        if (alleVRader.length > resIds.length) {
            valg.push({
                tekst: `🌐 Tilordningsstøtte alle (${alleVRader.length})…`,
                beta: true,
                separator: true,
                handler: async () => {
                    if (!await bekreftTilordningAlle(alleVRader.length)) return;
                    await tilordnAlle(alleVRader);
                }
            });
        }
        valg.forEach(v => {
            if (v.separator) {
                const sep = document.createElement('div');
                sep.style.cssText = 'border-top:1px solid #334155;margin:4px 0;';
                meny.appendChild(sep);
            }
            const a = document.createElement('div');
            a.textContent = v.tekst;
            if (v.beta) {
                const badge = document.createElement('span');
                badge.textContent = 'BETA';
                badge.style.cssText = 'background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px;letter-spacing:0.5px;vertical-align:middle;';
                a.appendChild(badge);
            }
            a.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = () => { trygtFjern(meny); v.handler(); };
            meny.appendChild(a);
        });

        document.body.appendChild(meny);

        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';

        setTimeout(() => {
            const lukk = (e) => {
                if (!meny.contains(e.target)) {
                    trygtFjern(meny);
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    function visEndreTidModal(resIds, x = 100, y = 100) {
        trygtFjern(document.getElementById('vkt-modal'));

        const turer = resIds.map(id => ({
            resId: id,
            navn: lesPasientnavnFraRad(id) || id,
            tidNaa: lesHentetidFraRad(id) || 'tt:mm'
        }));
        const antall = `${turer.length} tur${turer.length > 1 ? 'er' : ''}`;
        const devTagHTML = ER_DEV ? ' <span style="color:#fbbf24;font-weight:700;letter-spacing:0.5px;">DEV</span>' : '';

        const pop = document.createElement('div');
        pop.id = 'vkt-modal';
        pop.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'color:#e2e8f0', 'border:1px solid #334155',
            'border-radius:8px', 'padding:8px', 'width:280px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const radHTML = turer.map((t, i) => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <div title="${t.navn}" style="flex:1;min-width:0;font-size:12px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.navn}</div>
                <input data-idx="${i}" type="text" placeholder="${t.tidNaa}" maxlength="5" autocomplete="off"
                    style="width:64px;padding:5px 7px;background:#0f172a;border:1px solid #334155;border-radius:5px;color:#fff;font-size:13px;font-family:monospace;box-sizing:border-box;text-align:center;">
            </div>
        `).join('');

        // ⚠️ HVEM BA OM ENDRINGEN er det kommentaren ikke sa noe om (Thomas 28.08). Deltaet
        //    forteller HVA som skjedde, men ikke på hvems initiativ — og det er det spørsmålet
        //    som kommer når noen leser turen i ettertid.
        const signatur = hentAvvikSignatur();
        pop.innerHTML = `
            <div style="font-size:11px;color:#94a3b8;padding:0 2px 6px;border-bottom:1px solid #334155;margin-bottom:8px;">Endre hentetid · ${antall}${devTagHTML}</div>
            ${radHTML}
            <div style="display:flex;align-items:center;gap:6px;margin-top:8px;
                        border-top:1px solid #334155;padding-top:8px;">
                <span style="font-size:11px;color:#94a3b8;white-space:nowrap;">For</span>
                <select id="vkt-vegne" style="flex:1;min-width:0;padding:4px 6px;background:#0f172a;
                        border:1px solid #334155;border-radius:5px;color:#e2e8f0;font-size:12px;">
                    <option value="">— ikke oppgitt —</option>
                    <option value="Pasient">Pasient</option>
                    <option value="Behandler">Behandler</option>
                    <option value="PRK">PRK</option>
                    <option value="Rekvirent">Rekvirent</option>
                    <option value="Transportør">Transportør</option>
                </select>
            </div>
            <div style="font-size:10px;color:#64748b;margin-top:4px;">Skrives i NISSY-kommentaren
                sammen med ditt navn${signatur ? ' (' + statusEsc(signatur) + ')' : ''}.</div>
            <div style="display:flex;justify-content:flex-end;margin-top:6px;">
                <button id="vkt-ok" style="padding:6px 14px;background:#3b82f6;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">OK</button>
            </div>
            <div id="vkt-progress" style="margin-top:6px;font-size:11px;color:#94a3b8;display:none;"></div>
        `;
        document.body.appendChild(pop);

        const r = pop.getBoundingClientRect();
        if (r.right > window.innerWidth) pop.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) pop.style.top = (window.innerHeight - r.height - 8) + 'px';

        const vegneEl = pop.querySelector('#vkt-vegne');
        const notatTekst = () => {
            const v = vegneEl ? vegneEl.value : '';
            if (!signatur && !v) return '';
            // «for» framfor «på vegne av»: kortere, og kommentarfeltet har 255 tegns tak
            // som allerede deles med deltaet og andres tekst (Thomas 28.08).
            return 'Av ' + (signatur || 'ukjent') + (v ? ' for ' + v : '');
        };

        const inputs = pop.querySelectorAll('input[data-idx]');
        const progressEl = pop.querySelector('#vkt-progress');
        const okBtn = pop.querySelector('#vkt-ok');
        inputs[0]?.focus();

        const lukk = () => {
            trygtFjern(pop);
            document.removeEventListener('click', utenforKlikk, true);
        };
        const utenforKlikk = (e) => { if (!pop.contains(e.target)) lukk(); };
        setTimeout(() => document.addEventListener('click', utenforKlikk, true), 0);

        function parseTid(raa) {
            const t = raa.trim();
            // Aksepter "tt:mm", "ttmm" (1300), eller "tmm" (830 → 8:30)
            let hh, mm;
            let m = t.match(/^(\d{1,2}):(\d{2})$/);
            if (m) { hh = +m[1]; mm = +m[2]; }
            else if (m = t.match(/^(\d{2})(\d{2})$/)) { hh = +m[1]; mm = +m[2]; }
            else if (m = t.match(/^(\d{1})(\d{2})$/)) { hh = +m[1]; mm = +m[2]; }
            else return null;
            if (hh > 23 || mm > 59) return null;
            return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
        }

        okBtn.onclick = async () => {
            const oppgaver = [];
            let valideringFeil = false;
            inputs.forEach(inp => {
                inp.style.borderColor = '#334155';
                const raa = inp.value.trim();
                if (!raa) return;
                const norm = parseTid(raa);
                if (!norm) { inp.style.borderColor = '#ef4444'; valideringFeil = true; return; }
                const idx = +inp.dataset.idx;
                oppgaver.push({ resId: turer[idx].resId, tid: norm, gammelTid: turer[idx].tidNaa });
            });
            if (valideringFeil) return;
            if (!oppgaver.length) {
                progressEl.style.display = 'block';
                progressEl.style.color = '#94a3b8';
                progressEl.textContent = 'Ingen tider angitt — fyll inn de du vil endre';
                return;
            }
            okBtn.disabled = true;
            inputs.forEach(i => i.disabled = true);
            progressEl.style.display = 'block';
            progressEl.style.color = '#94a3b8';
            let ok = 0, fail = 0;
            for (let i = 0; i < oppgaver.length; i++) {
                const o = oppgaver[i];
                progressEl.textContent = `${i + 1}/${oppgaver.length} — endrer ${o.resId}…`;
                try {
                    const r = await endreTidPaaResId(o.resId, o.tid, o.gammelTid, notatTekst());
                    if (r.ok) ok++; else { fail++; console.warn(`[${NAVN}] feil for`, o.resId, r); }
                } catch (e) {
                    console.warn(`[${NAVN}] endreTid kastet for`, o.resId, e);
                    fail++;
                }
            }
            progressEl.textContent = `${ok} endret${fail ? ', ' + fail + ' feilet' : ''}`;
            progressEl.style.color = fail ? '#fbbf24' : '#10b981';
            setTimeout(lukk, fail ? 2500 : 1200);
        };

        inputs.forEach(inp => {
            inp.onkeydown = (e) => {
                if (e.key === 'Enter') okBtn.click();
                if (e.key === 'Escape') lukk();
            };
            // Auto-formatering: når 4 sifre er skrevet uten kolon, sett inn ":" mellom siffer 2 og 3
            inp.oninput = () => {
                const v = inp.value;
                if (/^\d{4}$/.test(v)) {
                    inp.value = v.slice(0, 2) + ':' + v.slice(2);
                }
            };
        });
    }

    function lesPasientnavnFraRadGeneric(rad) {
        if (!rad) return null;
        const tds = rad.querySelectorAll('td');
        if (tds.length < 2) return null;
        return tds[1].textContent.trim() || null;
    }

    // Samler alle blå-markerte P-rader → liste av {resId, reqId, navn, dato}
    function lesMarkertePaagaaende() {
        const liste = [];
        document.querySelectorAll('tr[id^="P-"]').forEach(r => {
            if (r.style.backgroundColor !== NISSY_BLAA) return;
            const args = lesPaagaaendeArgs(r);
            if (!args) return;
            liste.push({
                resId: args.resId,
                reqId: args.reqId,
                navn: lesPasientnavnFraRadGeneric(r) || args.resId,
                dato: lesAvgangsdatoFraRad(r)
            });
        });
        return liste;
    }

    function bekreftTilbaketrekkingAlle(antall) {
        return new Promise(resolve => {
            const id = 'vkt-bekreft-alle';
            trygtFjern(document.getElementById(id));
            const backdrop = document.createElement('div');
            backdrop.id = id;
            backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
            const box = document.createElement('div');
            box.style.cssText = 'background:#1e293b;border:1px solid #ef4444;border-radius:10px;padding:20px 22px;min-width:340px;max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.7);color:#e2e8f0;';
            box.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                    <span style="font-size:24px;">⚠️</span>
                    <span style="font-size:16px;font-weight:600;color:#fca5a5;">Bekreft tilbaketrekking</span>
                </div>
                <div style="font-size:13px;line-height:1.5;margin-bottom:18px;">
                    Du er i ferd med å trekke tilbake <strong style="color:#fbbf24;">alle ${antall}</strong> fremtidige pågående-turer
                    <span style="color:#94a3b8;">(uten ERS/RB/A/TK)</span>.<br><br>
                    Ønsker du å fortsette?
                </div>
                <div style="display:flex;justify-content:flex-end;gap:8px;">
                    <button id="${id}-avbryt" style="padding:8px 16px;border-radius:6px;border:1px solid #475569;background:#334155;color:#e2e8f0;font-size:13px;cursor:pointer;">Avbryt</button>
                    <button id="${id}-ok" style="padding:8px 16px;border-radius:6px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Trekk tilbake alle</button>
                </div>`;
            backdrop.appendChild(box);
            document.body.appendChild(backdrop);
            function lukk(svar) {
                document.removeEventListener('keydown', escHandler);
                trygtFjern(backdrop);
                resolve(svar);
            }
            function escHandler(e) { if (e.key === 'Escape') lukk(false); }
            document.addEventListener('keydown', escHandler);
            backdrop.addEventListener('click', e => { if (e.target === backdrop) lukk(false); });
            document.getElementById(`${id}-avbryt`).onclick = () => lukk(false);
            document.getElementById(`${id}-ok`).onclick = () => lukk(true);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MANUELL STATUSENDRING (Thomas 27.08)
    //
    // ⚠️ DETTE ER DEN FØRSTE SKRIVINGEN VÅR INN I DRIFT. Alt annet verktøykassen gjør mot
    //    admin er lesning. Her ENDRER vi turens status: transportøren ser det, og NISSY fører
    //    det i hendelsesloggen med operatørens brukernavn. Derfor, uten unntak:
    //      · én pasient om gangen — aldri en knapp som treffer flere
    //      · bekreftelse med navn i klartekst, ikke bare et rekvisisjonsnummer
    //      · vi LESER STATUSEN TILBAKE etterpå i stedet for å anta at POST-en tok
    //
    //    Statusene er NISSYs egne, hentet ordrett fra <select name="status"> i skjemaet.
    //    Merk hva som IKKE finnes: «Avbestilt». Bomtur har en vei her (Ikke møtt);
    //    avbestilling har det ikke, og må løses et annet sted.
    const MANUELL_STATUSER = [
        { verdi: '26', tekst: 'Startet' },
        { verdi: '27', tekst: 'Framme' },
        { verdi: '28', tekst: 'Ikke møtt', hint: '→ Bomtur / avbestilling' },
        { verdi: '29', tekst: 'Avvist av pasient' },
    ];

    function statusEsc(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    // Skjemaet på /administrasjon/admin/manualStatus?id=<reqId> har method="POST" og INGEN
    // action — da poster nettleseren tilbake til samme URL, query inkludert. Vi speiler det
    // nøyaktig: samme URL, de to skjulte feltene, status, og submit-knappens navn (den har
    // ingen value, så tom streng er det nettleseren selv sender).
    async function settManuellStatus(reqId, rekvnr, statusVerdi) {
        const url = NISSY_ORIGIN + '/administrasjon/admin/manualStatus?id=' + encodeURIComponent(reqId);
        const body = 'id=' + encodeURIComponent(reqId)
            + '&nr=' + encodeURIComponent(rekvnr)
            + '&status=' + encodeURIComponent(statusVerdi)
            + '&submit=';
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body, credentials: 'same-origin',
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.text();
    }

    // Leser statusen NISSY faktisk står med NÅ — samme side «Avbryt» i skjemaet går tilbake
    // til, der statuskolonnen er <td class="$list">. Dette er forskjellen på «vi sendte» og
    // «det ble gjort»; uten den ville vi meldt suksess på et kall vi ikke vet utfallet av.
    // ⚠️ TO FELLER PÅ RAD, BEGGE DOKUMENTERT FRA FØR (27.08, «NISSY svarer: ukjent»):
    //    1. `GET searchStatus?nr=<rekvnr>` er BLINDVEI — tomt skall uten treff. Det står i
    //       NISSY-Planlegging §4 og i reference_nissy_searchstatus_sok, og jeg gjentok nøyaktig
    //       den feilen verktøykassen gjorde i 2.187: en naken GET uten submit_action. Søket MÅ
    //       være POST med `reqSearch` + `requisitionNumber` (ikke `requisitionNr`).
    //    2. Svaret er ISO-8859-1. Med r.text() blir «Ikke møtt» til «Ikke mÃ¸tt», og
    //       sammenligningen mot statusteksten ville feilet selv når endringen gikk bra.
    //
    //    Flere treff kan komme tilbake (retur, flere ben på samme rekvisisjon), så vi plukker
    //    raden som bærer VÅR reqId i stedet for den første i lista.
    // ⚠️ TEGNSETTET VARIERER MELLOM NISSY-ENDEPUNKTENE. `ajax-dispatch` og `manualtrip` er
    //    ISO-8859-1, men `searchStatus` svarer UTF-8 — å anta latin-1 for alle ga «Ikke mÃ¸tt»
    //    i toasten (27.08). Vi gjetter ikke lenger: bruk charset fra Content-Type når den finnes,
    //    ellers prøv UTF-8 og fall tilbake til latin-1 først når dekodingen faktisk produserer
    //    erstatningstegn. Latin-1-bytes er ugyldig UTF-8, så den prøven er pålitelig.
    function dekodNissySvar(buf, ctype) {
        const m = /charset=([\w-]+)/i.exec(ctype || '');
        if (m) {
            try { return new TextDecoder(m[1]).decode(buf); } catch (_) {}
        }
        const utf = new TextDecoder('utf-8').decode(buf);
        if (utf.indexOf('\uFFFD') === -1) return utf;
        return new TextDecoder('iso-8859-1').decode(buf);
    }

    async function lesStatusForRekv(rekvnr, reqId) {
        if (!rekvnr) return null;
        try {
            const body = 'submit_action=reqSearch&requisitionNumber=' + encodeURIComponent(rekvnr)
                + '&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1';
            const r = await fetch(NISSY_ORIGIN + '/administrasjon/admin/searchStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body, credentials: 'same-origin',
            });
            if (!r.ok) return null;
            const h = dekodNissySvar(await r.arrayBuffer(), r.headers.get('content-type'));
            const rader = h.split(/<tr\b/i);
            let kilde = null;
            if (reqId) {
                kilde = rader.find(x => new RegExp('getRequisitionDetails\\(\\s*' + reqId + '\\b').test(x));
            }
            const m = (kilde || h).match(/<td[^>]*class="\$list"[^>]*>\s*([^<]+?)\s*<\/td>/i);
            // Samme treffrad bærer NISSYs egne id-er: getRequisitionDetails(reqId, db, resId, turId).
            // De trengs for å hente bomturnummeret, og de er de eneste vi VET admin godtar — våre
            // egne fra planleggerraden ligger i et annet nummerrom (P-raden hadde resId 68…, mens
            // admin oppgir 81… for samme rekvisisjon).
            const idm = (kilde || h).match(/getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+))?/);
            const ut = {
                status: m ? m[1].trim() : null,
                reqId: idm ? idm[1] : null, db: idm ? idm[2] : null,
                resId: idm ? idm[3] : null, turId: idm ? idm[4] : null,
            };
            if (ER_DEV) console.log(`[${NAVN}] statuskontroll: ${h.length} tegn, `
                + (kilde ? 'fant raden for reqId ' + reqId : 'fant ikke raden — leser første $list')
                + ' → ' + (ut.status || '∅') + ' | ids: ' + [ut.reqId, ut.db, ut.resId, ut.turId].join('/'));
            return ut;
        } catch (e) {
            if (ER_DEV) console.log(`[${NAVN}] statuskontroll feilet:`, e);
            return null;
        }
    }

    // ⚠️ BOMTURNUMMERET SKAL UT TIL SJÅFØREN (Thomas 27.08) — det sendes til sentralen på Teams,
    //    så det er et RESULTAT av handlingen, ikke en detalj. Det tildeles ved statusendringen
    //    (verifisert: nummeret sto der med tom kommentar og ulagret årsak), altså kan operatøren
    //    lese det opp med én gang.
    //
    //    Kilden er `ajax_reqdetails` — samme endepunkt vi allerede bruker til SUTI. `searchStatus?id=`
    //    duger IKKE: den siden viser bare søkeresultatet, og detaljene (inkl. bomtur-boksen) lastes
    //    først når operatøren KLIKKER raden. Vi ville altså hentet en side uten nummeret i.
    // ⚠️ KODEN ER FIRESIFRET, OG NULLEN FORAN ER EKTE (Thomas 27.08). Sjåføren taster fire siffer
    //    på taksameteret, og koden stammer fra bomturens «Opprettet»-klokkeslett: 09:10 → 0910.
    //    NISSY viser feltet som et TALL og spiser den ledende nullen — «Bomturnummer: 910». Sender
    //    vi det videre rått, taster sjåføren tre siffer på en firesifret kode.
    //    Derfor: padres til fire, og krysspeiles mot «Opprettet» i samme boks. Er de uenige, sier
    //    panelet fra i stedet for at vi stille velger — da har antakelsen om klokkeslettet brutt
    //    sammen, og det er ikke vår avgjørelse hvilket tall sjåføren skal få.
    function bomturKodeFire(raa) {
        const d = String(raa || '').replace(/\D/g, '');
        return d.length < 4 ? d.padStart(4, '0') : d;
    }
    async function hentBomturnummer(ids) {
        if (!ids || !ids.reqId || !ids.resId) return null;
        try {
            const url = NISSY_ORIGIN + '/administrasjon/admin/ajax_reqdetails?id=' + encodeURIComponent(ids.reqId)
                + '&db=' + encodeURIComponent(ids.db || '1')
                + '&tripid=' + encodeURIComponent(ids.resId) + '&full=true';
            const r = await fetch(url, { credentials: 'same-origin' });
            if (!r.ok) return null;
            const h = dekodNissySvar(await r.arrayBuffer(), r.headers.get('content-type'));
            const m = h.match(/Bomturnummer:\s*(\d+)/i);
            if (!m) {
                if (ER_DEV) console.log(`[${NAVN}] bomturnummer: ${h.length} tegn → ∅`);
                return null;
            }
            const kode = bomturKodeFire(m[1]);

            // «Opprettet» finnes flere steder i svaret (rekvisisjonen har sin egen). Vi leser kun
            // den som står i samme boks som bomturnummeret, ellers krysspeiler vi mot feil tid.
            let opprettet = null;
            const vindu = h.slice(Math.max(0, m.index - 800), m.index + 1600);
            const o = vindu.match(/Opprettet:(?:\s|<[^>]*>|&nbsp;)*(\d{2})\.(\d{2})\.(\d{4})(?:\s|<[^>]*>|&nbsp;)+(\d{2}):(\d{2})/i);
            if (o) opprettet = o[4] + o[5];

            // ÅRSAKEN STÅR I SAMME SVAR når den først er lagret: «Bomtur: T1 - Forsinkelse (id 0910)»
            // (Thomas 27.08). Merk kolonet: «Bomturnummer:» har ingen, så mønstrene kolliderer ikke.
            let aarsak = null, aarsakKode = null;
            const am = h.match(/Bomtur:(?:\s|<[^>]*>|&nbsp;)*([^<]{2,80})/i);
            if (am) {
                aarsak = am[1].replace(/&nbsp;/g, ' ').replace(/\s*\(id\s*\d+\s*\)\s*$/i, '').trim();
                const km = aarsak.match(/^([A-ZÆØÅ]{1,4}\d{1,2})\b\s*-?\s*(.*)$/);
                if (km) { aarsakKode = km[1]; aarsak = km[2].trim() ? km[1] + ' ' + km[2].trim() : km[1]; }
                if (!aarsak) aarsak = null;
            }

            if (ER_DEV && !aarsak) {
                // Årsaken fant vi ikke i teksten. Da skal konsollen vise hva som FAKTISK står
                // rundt hver «Bomtur» i svaret, ikke bare at vi kom tomhendt tilbake.
                const treff = [];
                const bre = /Bomtur/gi;
                let bm;
                while ((bm = bre.exec(h)) !== null && treff.length < 6) {
                    treff.push(h.slice(bm.index, bm.index + 120).replace(/\s+/g, ' '));
                }
                console.log(`[${NAVN}] bomtur-årsak ikke funnet i teksten. «Bomtur»-treff:`, treff);
            }

            const avvik = !!(opprettet && opprettet !== kode);
            if (ER_DEV) {
                console.log(`[${NAVN}] bomturnummer: ${h.length} tegn → rå «${m[1]}» → kode ${kode}`
                    + ` | opprettet ${opprettet || '∅'}${avvik ? ' ⚠ AVVIK' : ''}`);
            }
            return { kode: kode, raa: m[1], opprettet: opprettet, avvik: avvik,
                     aarsak: aarsak, aarsakKode: aarsakKode };
        } catch (e) {
            if (ER_DEV) console.log(`[${NAVN}] bomturnummer feilet:`, e);
            return null;
        }
    }

    // Slår opp en bomtur fra RekvisisjonsNUMMERET alene. Fremmestatus har bare det — SUTI 1703
    // bærer rekvnr, ikke id-er — og kunne før bare si «meldt». Her hentes koden og den lagrede
    // årsaken, så ressurskortet forteller HVA slags bomtur det var.
    // Eksponeres på __basicTools som en MYK avhengighet: fremmestatus fungerer uten den.
    async function bomturDetaljer(rekvnr) {
        if (!rekvnr) return null;
        const ids = await lesStatusForRekv(rekvnr, null);
        if (!ids) return null;
        const b = await hentBomturnummer(ids);
        if (!b || !b.kode) return null;

        // ⚠️ IKKE STOL PÅ AT ÅRSAKEN STÅR I TEKSTEN. «Bomtur: T1 - Forsinkelse (id 0910)» så vi i
        //    detaljvisningen, men ajax_reqdetails er ikke nødvendigvis samme side — og markupen
        //    kan variere. NISSYs egen dialog svarer derimot alltid med det LAGREDE valget merket
        //    selected, og det er samme kilde nedtrekkslistene i panelet bruker.
        let aarsak = b.aarsak, aarsakKode = b.aarsakKode;
        if (!aarsak && ids.reqId) {
            try {
                const v = await hentBomturValg(ids.reqId, '');
                const kat = v.kategorier.find(o => o.valgt && o.verdi);
                if (kat) {
                    const v2 = await hentBomturValg(ids.reqId, kat.verdi);
                    const c = v2.aarsaker.find(o => o.valgt && o.verdi);
                    if (c) { aarsak = c.tekst || c.verdi; aarsakKode = c.verdi; }
                }
                if (ER_DEV) console.log(`[${NAVN}] bomtur-årsak fra dialogen: `
                    + (kat ? kat.verdi : '∅') + ' → ' + (aarsak || '∅'));
            } catch (e) {
                if (ER_DEV) console.log(`[${NAVN}] bomtur-årsak via dialog feilet:`, e);
            }
        }
        return { kode: b.kode, aarsak: aarsak, aarsakKode: aarsakKode, status: ids.status };
    }

    // Tiltaksboka «#25812 Bomturkategorier» (Bliksund GRID) — fasiten på hva kategoriene betyr.
    const TILTAKSKORT_BOMTUR = 'https://zone1.bliksundhub.com/65113/grid/v2/procedure_manual/221/cards/5534';

    // ── BOMTUR-ÅRSAK OG AVVIK I SAMME PANEL ───────────────────────────────────────────────
    // Thomas 27.08: «kan vi ha dropdown fra bomturkoder og avviksfelt der, så alt er i én UX?»
    // Operatøren står med telefonen i den ene hånden. Å sende henne gjennom NISSYs bomtur-dialog
    // for årsaken og DERETTER inn i avvik-dialogen for forklaringen, er to kontekstbytter for det
    // som er én hendelse.
    //
    // ⚠️ VALGENE HENTES FRA NISSY, ALDRI FRA EN LISTE VI SKRIVER SELV. Vi kjenner P1–P8 og T1–T9,
    //    men ikke PRK/Rekvirent — og en hardkodet liste er uansett feil dagen NISSY endrer en kode.
    //    Vi leser deres eget skjema og sender deres egne verdier tilbake.
    function parseNissySelect(html, id) {
        const m = html.match(new RegExp('<select[^>]*\\bid=["\']?' + id + '["\']?[^>]*>([\\s\\S]*?)</select>', 'i'));
        if (!m) return null;
        const ut = [];
        const dek = document.createElement('div');
        const re = /<option([^>]*)>([\s\S]*?)<\/option>/gi;
        let o;
        while ((o = re.exec(m[1])) !== null) {
            const attr = o[1] || '';
            const vm = attr.match(/value\s*=\s*["']?([^"'>\s]*)["']?/i);
            dek.innerHTML = o[2].replace(/<[^>]*>/g, '');
            ut.push({
                verdi: vm ? vm[1] : '',
                tekst: (dek.textContent || '').trim(),
                valgt: /\bselected\b/i.test(attr),
            });
        }
        return ut;
    }

    // catname='' gir kategorilisten; catname='Pasient' fyller i tillegg årsakslisten.
    async function hentBomturValg(reqId, catname) {
        const url = NISSY_ORIGIN + '/planlegging/ajax-dispatch?update=false&action=showdidnotshow'
            + '&rid=' + encodeURIComponent(reqId) + '&catname=' + encodeURIComponent(catname || '');
        const r = await fetch(url, { credentials: 'same-origin' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const h = dekodNissySvar(await r.arrayBuffer(), r.headers.get('content-type'));
        return {
            kategorier: parseNissySelect(h, 'reqCommentCategory') || [],
            aarsaker: parseNissySelect(h, 'reqCommentCause') || [],
        };
    }

    // Nøyaktig det doSetDidNotShow() sender. Fritekst finnes ikke i kallet — NISSY har kommentert
    // ut «text=» i sin egen kode — og derfor er avviket eneste sted forklaringen overlever.
    async function lagreBomturAarsak(reqId, cat, cause) {
        const url = NISSY_ORIGIN + '/planlegging/ajax-dispatch?update=false&action=setdidnotshow'
            + '&rid=' + encodeURIComponent(reqId)
            + '&cat=' + encodeURIComponent(cat)
            + '&cause=' + encodeURIComponent(cause || '');
        const r = await fetch(url, { credentials: 'same-origin' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        // Les tilbake. Forskjellen på «vi sendte» og «det ble lagret» er hele poenget når
        // valget blir stående i statistikken.
        try {
            const v = await hentBomturValg(reqId, cat);
            const truffet = v.aarsaker.find(a => a.verdi === cause && a.valgt);
            return { ok: true, bekreftet: !!truffet };
        } catch (_) { return { ok: true, bekreftet: false }; }
    }

    // ── Avvik ──────────────────────────────────────────────────────────────────────────────
    // Endepunktet er det Overvåker Live og Avvik har brukt i drift lenge (setResourceDeviation).
    // ⚠️ rid ER PLANLEGGERENS resId, IKKE admins. De to lever i hvert sitt nummerrom (68- vs
    //    81-serien), og admin-id-en her ville skrevet avviket på feil sted — eller ingen steder.
    function lesPlanleggerResId(pRad) {
        if (!pRad) return null;
        // NISSY kaller showRes med radens NAME, som kan avvike fra id-en (overvaaker_live.js).
        const nm = pRad.getAttribute && pRad.getAttribute('name');
        if (nm && /^\d+$/.test(nm)) return nm;
        const m = String(pRad.id || '').match(/^P-(\d+)$/);
        return m ? m[1] : null;
    }

    // Korrekthetssjekk før vi skriver: ressurskortet for denne resId-en skal inneholde turens
    // eget Reisenr. Samme bevis fremmestatus bruker — og her betyr det forskjellen på et avvik
    // i riktig tur og et avvik hos en ukjent pasient.
    async function bekreftResIdMotTur(resId, turId) {
        if (!resId || !turId) return null;
        try {
            const r = await fetch(NISSY_ORIGIN + '/planlegging/ajax-dispatch?update=false&action=showres&rid='
                + encodeURIComponent(resId), { credentials: 'same-origin' });
            if (!r.ok) return null;
            const h = dekodNissySvar(await r.arrayBuffer(), r.headers.get('content-type'));
            return h.indexOf(String(turId)) !== -1;
        } catch (_) { return null; }
    }

    async function skrivAvvikNissy(resId, tekst) {
        // NISSY forventer ISO-8859-1 på æøå — samme kode som overvaaker_avvik bruker i drift.
        const encodeISO = (x) => encodeURIComponent(x)
            .replace(/%C3%A6/g, '%E6').replace(/%C3%B8/g, '%F8').replace(/%C3%A5/g, '%E5')
            .replace(/%C3%86/g, '%C6').replace(/%C3%98/g, '%D8').replace(/%C3%85/g, '%C5');
        const url = NISSY_ORIGIN + '/planlegging/ajax-dispatch?update=false&action=setResourceDeviation'
            + '&rid=' + encodeURIComponent(resId) + '&deviation=' + encodeISO(tekst);
        const r = await fetch(url, { credentials: 'same-origin' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return true;
    }

    // Utklippstavlen kan være sperret (fokus, tillatelser), og da skal operatøren ikke stå igjen
    // med ingenting. Samme stige som Kopier-knappen på nummeret; skilt ut fordi to knapper bruker den.
    async function kopierTekst(tekst) {
        try { await navigator.clipboard.writeText(tekst); return true; } catch (_) {}
        try {
            const ta = document.createElement('textarea');
            ta.value = tekst; ta.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(ta); ta.select();
            const ok = document.execCommand('copy');
            trygtFjern(ta);
            return ok;
        } catch (_) { return false; }
    }

    // AVBESTILLING TIL SENTRALEN PÅ TEAMS (Thomas 27.08 — malen er hans, ordrett).
    // Bomturkoden er det sjåføren fakturerer på, så meldingen er selve overleveringen:
    //   Avbestilling / TurID / Bomturkode  — og ved samkjøring også HVEM, siden én tur da
    //   rommer flere pasienter og de andre fortsatt skal kjøres.
    // ⚠️ Pasientlinjen skrives KUN ved samkjøring. På en enkelttur identifiserer TurID turen
    //    entydig, og da har navnet ingen funksjon i en Teams-tråd — det ville bare vært
    //    pasientopplysninger på avveie.
    function teamsInitialer(navn) {
        // NISSY skriver «Etternavn, Fornavn». Rekkefølgen beholdes som den står — å snu den
        // ville vært vår oppfinnelse, og navnet står uansett i klartekst rett bak.
        return String(navn || '').split(/[,\s]+/).filter(Boolean)
            .map(d => d.charAt(0).toUpperCase() + '.').join(' ');
    }
    function teamsAvbestillingTekst(o) {
        const kode = String(o.nummer || '').replace(/\D/g, '');
        const linjer = [
            'Avbestilling',
            'TurID: ' + o.turId,
            'Bomturkode: ' + (kode.length < 4 ? kode.padStart(4, '0') : kode),
        ];
        if (o.samkjort && o.navn) linjer.push('Pasient: ' + teamsInitialer(o.navn) + ' (' + o.navn + ')');
        return linjer.join('\n');
    }

    // Vedvarende panel — IKKE en toast. Nummeret skal leses opp i telefon eller limes i Teams,
    // og da kan det ikke forsvinne etter seks sekunder. Lukkes bare av operatøren selv.
    function visBomturPanel(hvem, nummer, status, reqId, ctx) {
        trygtFjern(document.getElementById('vkt-bomtur-panel'));
        const p = document.createElement('div');
        p.id = 'vkt-bomtur-panel';
        p.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;'
            + 'color:#e2e8f0;border:1px solid #334155;border-radius:10px;padding:14px 16px;'
            + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;'
            + 'box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:260px;max-width:400px;';
        // Panelet har to tilstander i SAMME vindu (Thomas 27.08: «kan vi slå sammen prosessen?»).
        // Før: meny → statusvalg → bekreftelsesdialog → panel. Fire steg for én hendelse, der de
        // tre første bare ledet frem til det fjerde. Nå åpnes panelet med én gang, og er turen
        // ikke registrert ennå, står knappen som gjør det øverst.
        const registrert = !!nummer;

        const tittel = document.createElement('div');
        tittel.innerHTML = registrert
            ? '<span style="color:#10b981;font-weight:600;">✓ ' + statusEsc(status || 'Ikke møtt') + '</span>'
              + ' <span style="color:#94a3b8;">· ' + statusEsc(hvem) + '</span>'
            : '<span style="color:#e2e8f0;font-weight:600;">Bomtur / avbestilling</span>'
              + ' <span style="color:#94a3b8;">· ' + statusEsc(hvem) + '</span>'
              + (status ? '<br><span style="font-size:11px;color:#64748b;">NISSY står med «'
                          + statusEsc(status) + '»</span>' : '');
        tittel.style.cssText = 'margin-bottom:10px;line-height:1.4;';
        p.appendChild(tittel);

        if (registrert) {
            const rad = document.createElement('div');
            rad.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;';
            const nr = document.createElement('div');
            nr.textContent = nummer;
            nr.style.cssText = 'font-size:26px;font-weight:700;letter-spacing:1px;color:#fbbf24;'
                + 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;';
            const kopi = document.createElement('button');
            kopi.textContent = 'Kopier';
            kopi.style.cssText = 'padding:6px 12px;border-radius:6px;border:1px solid #fbbf24;background:transparent;'
                + 'color:#fbbf24;font-size:12px;font-weight:600;cursor:pointer;';
            kopi.onclick = async () => {
                const ok = await kopierTekst(nummer);
                kopi.textContent = ok ? 'Kopiert ✓' : 'Merk og kopier';
                kopi.style.color = ok ? '#10b981' : '#fbbf24';
                kopi.style.borderColor = ok ? '#10b981' : '#fbbf24';
            };
            const merk = document.createElement('div');
            merk.textContent = 'Bomturkode — 4 siffer';
            merk.style.cssText = 'font-size:10px;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;';
            const venstre = document.createElement('div');
            venstre.appendChild(merk); venstre.appendChild(nr);
            rad.appendChild(venstre); rad.appendChild(kopi);
            p.appendChild(rad);

            if (ctx && ctx.bomtur && ctx.bomtur.avvik) {
                const adv = document.createElement('div');
                adv.textContent = '⚠ NISSY oppgir ' + ctx.bomtur.raa + ', men bomturen ble opprettet '
                    + ctx.bomtur.opprettet.slice(0, 2) + ':' + ctx.bomtur.opprettet.slice(2)
                    + '. Kontroller koden i NISSY før du gir den ut.';
                adv.style.cssText = 'font-size:11px;color:#fbbf24;background:#422006;border:1px solid #a16207;'
                    + 'border-radius:6px;padding:6px 8px;margin-bottom:10px;line-height:1.4;';
                p.appendChild(adv);
            }

            // Meldingen vises i klartekst FØR den kopieres. Å lime blindt inn i en Teams-tråd til
            // sentralen er ubehagelig — og pasientlinjen er nettopp det operatøren bør se at hun sender.
            if (ctx && ctx.turId) {
                const tekst = teamsAvbestillingTekst({
                    turId: ctx.turId, nummer: nummer, navn: ctx.navn, samkjort: ctx.samkjort
                });
                const boks = document.createElement('pre');
                boks.textContent = tekst;
                boks.style.cssText = 'margin:0 0 6px;padding:8px 10px;background:#0f172a;border:1px solid #334155;'
                    + 'border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;'
                    + 'font-size:11px;line-height:1.5;color:#cbd5e1;white-space:pre-wrap;';
                p.appendChild(boks);

                const tk = document.createElement('button');
                tk.textContent = '📋 Kopier avbestilling til Teams';
                tk.style.cssText = 'width:100%;padding:8px 12px;border-radius:6px;border:1px solid #0ea5e9;'
                    + 'background:#0ea5e9;color:#082f49;font-size:12px;font-weight:600;cursor:pointer;';
                tk.onclick = async () => {
                    const ok = await kopierTekst(tekst);
                    tk.textContent = ok ? 'Kopiert ✓ — lim inn i Teams' : 'Merk teksten over og kopier';
                    tk.style.background = ok ? '#10b981' : '#0ea5e9';
                    tk.style.borderColor = ok ? '#10b981' : '#0ea5e9';
                };
                p.appendChild(tk);
            } else if (ctx) {
                // Uten TurID er meldingen ubrukelig for sentralen, og en mal med tomt felt er verre
                // enn ingen mal — da limes den inn som den står.
                const mangler = document.createElement('div');
                mangler.textContent = 'Fant ikke TurID — Teams-meldingen må skrives manuelt.';
                mangler.style.cssText = 'font-size:11px;color:#94a3b8;margin-bottom:6px;';
                p.appendChild(mangler);
            }
        } else {
            // ⚠️ INGEN confirm() PÅ TOPPEN. Panelet navngir pasienten, viser statusen NISSY står
            //    med, og knappen sier nøyaktig hva den gjør — å legge en nettleserdialog oppå det
            //    ville vært den fjerde bekreftelsen på samme handling. Å åpne panelet skriver
            //    ingenting; det er knappen som er handlingen, og den krever et eget klikk.
            const reg = document.createElement('button');
            reg.textContent = 'Sett «Ikke møtt» — henter bomturkode';
            reg.style.cssText = 'width:100%;padding:10px 12px;border-radius:6px;border:1px solid #fbbf24;'
                + 'background:#fbbf24;color:#451a03;font-size:13px;font-weight:700;cursor:pointer;';
            reg.disabled = !(ctx && typeof ctx.paaRegistrer === 'function');
            reg.onclick = () => { reg.disabled = true; reg.textContent = 'Registrerer…'; ctx.paaRegistrer(reg); };
            p.appendChild(reg);

            const regNote = document.createElement('div');
            regNote.textContent = 'Skrives inn i NISSY med ditt brukernavn og er synlig for transportøren.';
            regNote.style.cssText = 'font-size:11px;color:#94a3b8;margin:6px 0 2px;line-height:1.4;';
            p.appendChild(regNote);
        }

        // ── ÅRSAK: NISSYs egne valg, i vårt panel ──────────────────────────────────────────
        // ⚠️ VI FORHÅNDSVELGER FORTSATT INGENTING. Å flytte nedtrekkslistene hit sparer to
        //    kontekstbytter, men valget er og blir en faglig vurdering — er det pasientens
        //    forhold eller transportørens? — og det blir stående i statistikken. Listene fylles
        //    fra NISSYs eget skjema, og vi sender deres egne verdier tilbake urørt.
        // ⚠️ En native <select> tegner listen UTENFOR dokumentet. Det knakk tema-velgeren i
        //    Innstillinger, som hadde en «klikk utenfor»-lukker. Dette panelet har ingen — det
        //    lukkes bare av Lukk — så nedtrekkslistene er trygge her. Får panelet en lukker
        //    senere, må den frede select-klikk.
        const selStil = 'width:100%;padding:6px 8px;margin-bottom:6px;border-radius:6px;'
            + 'border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-size:12px;';
        if (reqId && registrert) {
            const aBoks = document.createElement('div');
            aBoks.style.cssText = 'border-top:1px solid #334155;margin-top:10px;padding-top:10px;';
            const aH = document.createElement('div');
            aH.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;'
                + 'gap:8px;margin-bottom:6px;';
            const aHT = document.createElement('span');
            aHT.textContent = 'Årsak';
            aHT.style.cssText = 'font-size:10px;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;';
            aH.appendChild(aHT);
            // ⚠️ HVA KODENE BETYR STÅR IKKE I NISSY (Thomas 27.08). Tiltaksbokas kort
            //    «#25812 Bomturkategorier» definerer hver eneste kategori — og flere av dem er
            //    merket «Ikke i bruk», noe nedtrekkslisten ikke røper. Uten fasiten er valget en
            //    gjetning, og gjetningen blir stående i statistikken. Lenken hører derfor hjemme
            //    NØYAKTIG her, ved siden av valget, ikke i et regelverk noen skal huske å slå opp.
            const aHL = document.createElement('a');
            aHL.textContent = '📖 Bomturkategorier';
            aHL.href = TILTAKSKORT_BOMTUR;
            aHL.target = '_blank';
            aHL.rel = 'noopener noreferrer';
            aHL.title = 'Tiltaksboka #25812 — Bomturkategorier (Bliksund GRID).\n'
                + 'Definerer hver kategori for Rekvirent, Transportør, Pasient og PRK.\n'
                + 'Merk at flere koder står som «Ikke i bruk».';
            aHL.style.cssText = 'font-size:11px;color:#0ea5e9;text-decoration:none;white-space:nowrap;';
            aH.appendChild(aHL);
            aBoks.appendChild(aH);

            const katSel = document.createElement('select');
            const aarSel = document.createElement('select');
            katSel.style.cssText = selStil; aarSel.style.cssText = selStil;
            katSel.disabled = true; aarSel.disabled = true;
            katSel.innerHTML = '<option>Henter fra NISSY…</option>';
            aarSel.innerHTML = '<option>—</option>';
            aBoks.appendChild(katSel); aBoks.appendChild(aarSel);

            const aStatus = document.createElement('div');
            aStatus.style.cssText = 'font-size:11px;color:#94a3b8;min-height:15px;line-height:1.4;';
            const aLagre = document.createElement('button');
            aLagre.textContent = 'Lagre årsak';
            aLagre.disabled = true;
            aLagre.style.cssText = 'width:100%;padding:8px 12px;border-radius:6px;border:1px solid #334155;'
                + 'background:#334155;color:#e2e8f0;font-size:12px;font-weight:600;cursor:pointer;';
            aBoks.appendChild(aLagre); aBoks.appendChild(aStatus);

            const fyll = (sel, liste, tomtekst) => {
                sel.innerHTML = '';
                const t = document.createElement('option');
                t.value = ''; t.textContent = tomtekst;
                sel.appendChild(t);
                liste.filter(o => o.verdi !== '').forEach(o => {
                    const el = document.createElement('option');
                    el.value = o.verdi; el.textContent = o.tekst || o.verdi;
                    if (o.valgt) el.selected = true;
                    sel.appendChild(el);
                });
            };
            const oppdaterKnapp = () => { aLagre.disabled = !(katSel.value && aarSel.value); };

            katSel.onchange = async () => {
                aarSel.disabled = true; aarSel.innerHTML = '<option>Henter…</option>';
                oppdaterKnapp();
                if (!katSel.value) { aarSel.innerHTML = '<option>—</option>'; return; }
                try {
                    const v = await hentBomturValg(reqId, katSel.value);
                    fyll(aarSel, v.aarsaker, '— velg årsak —');
                    aarSel.disabled = false;
                } catch (e) {
                    aarSel.innerHTML = '<option>Feilet</option>';
                    aStatus.textContent = 'Klarte ikke hente årsakene: ' + ((e && e.message) || e);
                    aStatus.style.color = '#dc2626';
                }
                oppdaterKnapp();
            };
            aarSel.onchange = oppdaterKnapp;

            aLagre.onclick = async () => {
                const kt = katSel.options[katSel.selectedIndex]?.textContent || katSel.value;
                const at = aarSel.options[aarSel.selectedIndex]?.textContent || aarSel.value;
                aLagre.disabled = true;
                aStatus.style.color = '#94a3b8';
                aStatus.textContent = 'Lagrer…';
                try {
                    const r = await lagreBomturAarsak(reqId, katSel.value, aarSel.value);
                    if (r.bekreftet) {
                        aStatus.style.color = '#10b981';
                        aStatus.textContent = '✓ Lagret: ' + kt + ' · ' + at;
                    } else {
                        // Sendt, men NISSY viste den ikke tilbake som valgt. Da sier vi det, i
                        // stedet for en grønn hake operatøren ikke kan stole på.
                        aStatus.style.color = '#fbbf24';
                        aStatus.textContent = '⚠ Sendt, men NISSY bekreftet ikke valget — kontroller i bomtur-dialogen.';
                    }
                } catch (e) {
                    aStatus.style.color = '#dc2626';
                    aStatus.textContent = '✗ Lagring feilet: ' + ((e && e.message) || e);
                    aLagre.disabled = false;
                }
            };

            hentBomturValg(reqId, '').then(v => {
                if (!v.kategorier.length) throw new Error('tom kategoriliste');
                fyll(katSel, v.kategorier, '— velg kategori —');
                katSel.disabled = false;
                // Er kategorien allerede satt, henter vi årsakene med én gang — da ser
                // operatøren hva som STÅR der, ikke et blankt skjema over et lagret valg.
                if (katSel.value) katSel.onchange();
            }).catch(e => {
                katSel.innerHTML = '<option>Kunne ikke hente</option>';
                aStatus.style.color = '#fbbf24';
                aStatus.textContent = 'Fikk ikke NISSYs valg (' + ((e && e.message) || e) + ').';
                aStatus.appendChild(document.createElement('br'));
                const lenke = document.createElement('a');
                lenke.textContent = 'Åpne NISSYs bomtur-dialog i stedet';
                lenke.href = 'javascript:void(0)';
                lenke.style.cssText = 'color:#0ea5e9;';
                lenke.onclick = () => {
                    try { window.doShowDidNotShow('', String(reqId), ''); } catch (_) {
                        alert('Fant ikke NISSYs bomtur-dialog. Klikk «Ikke møtt» i statuskolonnen i stedet.');
                    }
                };
                aStatus.appendChild(lenke);
            });
            p.appendChild(aBoks);
        }

        // ── AVVIK: forklaringen som NISSYs bomtur-dialog kaster ────────────────────────────
        // Fritekstfeltet i bomtur-dialogen sendes aldri (se under), så avviket er eneste sted
        // forklaringen overlever. Formatet er det samme avvik-dialogen vår skriver — «HH:MM -
        // tekst, Signatur» — ellers kan ikke Overvåker Live lese linjen.
        const avvikResId = lesPlanleggerResId(ctx && ctx.rad);
        if (avvikResId) {
            const vBoks = document.createElement('div');
            vBoks.style.cssText = 'border-top:1px solid #334155;margin-top:10px;padding-top:10px;';
            const vH = document.createElement('div');
            vH.textContent = 'Avvik';
            vH.style.cssText = 'font-size:10px;color:#94a3b8;letter-spacing:0.5px;'
                + 'text-transform:uppercase;margin-bottom:6px;';
            vBoks.appendChild(vH);

            const ta = document.createElement('textarea');
            ta.rows = 2;
            ta.placeholder = 'Hva skjedde? (valgfritt)';
            ta.style.cssText = selStil + 'resize:vertical;font-family:inherit;';
            vBoks.appendChild(ta);

            // Samme markører som avvik-dialogen (RTP/RTB, leders svar 27.08). To felter som
            // skriver i SAMME logg må skrive den samme formen — ellers blir loggen to konvensjoner.
            const vBokser = [];
            const vRad = document.createElement('div');
            vRad.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;margin-bottom:6px;';
            [{ kode: 'RTP', tekst: 'RTP ringt til pasient' },
             { kode: 'RTB', tekst: 'RTB ringt til behandler' }].forEach(o => {
                const lab = document.createElement('label');
                lab.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:11px;'
                    + 'color:#cbd5e1;cursor:pointer;';
                lab.title = 'Betyr at du RINGTE — ikke at du fikk svar.';
                const b = document.createElement('input');
                b.type = 'checkbox'; b.dataset.vktKode = o.kode; b.style.cssText = 'margin:0;';
                b.onchange = () => tegnForh();
                lab.appendChild(b); lab.appendChild(document.createTextNode(o.tekst));
                vRad.appendChild(lab); vBokser.push(b);
            });
            vBoks.appendChild(vRad);

            const sign = hentAvvikSignatur();
            const fmt = () => {
                const t = (ta.value || '').trim();
                const m = vBokser.filter(b => b.checked).map(b => b.dataset.vktKode)
                    .filter(k => !new RegExp('^' + k + '\\b', 'i').test(t));
                return naaTid() + ' - ' + (m.length ? m.join(' ') + ' ' : '') + t + (sign ? ', ' + sign : '');
            };
            const forh = document.createElement('div');
            forh.style.cssText = 'font-size:11px;color:#64748b;margin-bottom:6px;line-height:1.4;'
                + 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-word;';
            const tegnForh = () => { forh.textContent = (ta.value || '').trim() ? fmt() : ''; };
            ta.oninput = () => { tegnForh(); vLagre.disabled = !(ta.value || '').trim(); };
            vBoks.appendChild(forh);

            const vStatus = document.createElement('div');
            vStatus.style.cssText = 'font-size:11px;color:#94a3b8;min-height:15px;line-height:1.4;';
            const vLagre = document.createElement('button');
            vLagre.textContent = 'Skriv avvik';
            vLagre.disabled = true;
            vLagre.style.cssText = 'width:100%;padding:8px 12px;border-radius:6px;border:1px solid #334155;'
                + 'background:#334155;color:#e2e8f0;font-size:12px;font-weight:600;cursor:pointer;';
            vLagre.onclick = async () => {
                const tekst = (ta.value || '').trim();
                if (!tekst) return;
                vLagre.disabled = true;
                vStatus.style.color = '#94a3b8';
                vStatus.textContent = 'Kontrollerer tur…';
                try {
                    // ⚠️ Skriv ALDRI et avvik uten å vite at resId-en hører til denne turen.
                    //    Et avvik i feil tur står hos en pasient som ikke har noe med saken å gjøre.
                    const ok = await bekreftResIdMotTur(avvikResId, ctx && ctx.turId);
                    // null = ingen bevis (mangler TurID, eller kortet svarte ikke). Da skriver vi,
                    // men sier at det ikke ble kryssjekket — ikke en hake operatøren ikke kan stole på.
                    if (ok === false) {
                        if (!confirm('Klarte ikke bekrefte at avviket havner på riktig tur.\n\n'
                            + 'Ressurskortet for ' + avvikResId + ' nevner ikke TurID '
                            + ((ctx && ctx.turId) || '?') + '.\n\n'
                            + 'Skrive likevel?')) {
                            vStatus.textContent = 'Avbrutt.';
                            vLagre.disabled = false;
                            return;
                        }
                    }
                    vStatus.textContent = 'Skriver…';
                    const linje = fmt();
                    await skrivAvvikNissy(avvikResId, linje);
                    vStatus.style.color = '#10b981';
                    vStatus.textContent = ok === true
                        ? '✓ Skrevet i NISSY'
                        : '✓ Skrevet i NISSY (turen ble ikke kryssjekket)';
                    ta.value = ''; tegnForh();
                    console.log(`[${NAVN}] avvik skrevet (rid ${avvikResId}): ${linje}`);
                } catch (e) {
                    vStatus.style.color = '#dc2626';
                    vStatus.textContent = '✗ Avvik feilet: ' + ((e && e.message) || e);
                    vLagre.disabled = false;
                }
            };
            vBoks.appendChild(vLagre); vBoks.appendChild(vStatus);
            p.appendChild(vBoks);
        }

        // ⚠️ FRITEKSTFELTET I NISSYS BOMTUR-DIALOG LAGRES IKKE. doSetDidNotShow() leser
        //    #reqCommentText, men linjen som sendte «text=» er KOMMENTERT UT i NISSYs egen kode
        //    — bare cat og cause følger med i ajax-dispatch?action=setdidnotshow. Feltet tar imot
        //    skriving og ser ut som alle andre felter, så uten denne beskjeden skriver operatøren
        //    en forklaring som forsvinner i det hun trykker lagre. Derfor avviksfeltet over.
        const note = document.createElement('div');
        note.innerHTML = (!registrert
            ? 'Turen er ikke satt til «Ikke møtt» ennå — bomturkoden finnes derfor ikke.'
            : reqId
                ? 'Bomturen er ikke ferdig registrert før årsaken er lagret.'
                : 'Kategori og årsak må fortsatt registreres i NISSY.')
            + '<br><span style="color:#94a3b8;">Kommentarfeltet i NISSYs egen bomtur-dialog '
            + 'lagres ikke — bruk avviksfeltet over.</span>';
        note.style.cssText = 'font-size:11px;color:#fbbf24;border-top:1px solid #334155;'
            + 'padding-top:8px;margin-top:10px;line-height:1.4;';
        p.appendChild(note);

        const lukk = document.createElement('div');
        lukk.textContent = 'Lukk';
        lukk.style.cssText = 'margin-top:10px;text-align:right;font-size:11px;color:#94a3b8;cursor:pointer;';
        lukk.onclick = () => trygtFjern(p);
        p.appendChild(lukk);

        document.body.appendChild(p);
    }

    function statusToast(tekst, farge, levetid) {
        trygtFjern(document.getElementById('vkt-status-toast'));
        const t = document.createElement('div');
        t.id = 'vkt-status-toast';
        t.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;'
            + 'color:' + (farge || '#e2e8f0') + ';border:1px solid #334155;border-radius:8px;padding:10px 14px;'
            + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;'
            + 'box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:220px;max-width:400px;';
        t.textContent = tekst;
        document.body.appendChild(t);
        if (levetid) setTimeout(() => trygtFjern(t), levetid);
        return t;
    }

    async function utforStatusendring(p, s, antallIRad, pRad) {
        const hvem = p.navn || ('rekvisisjon ' + (p.rekvnr || p.reqId));
        // Skjemaet sender BÅDE id og nr. Mangler rekvisisjonsnummeret, vet vi ikke om NISSY
        // godtar POST-en eller stille gjør noe annet enn vi tror — da stopper vi heller her.
        if (!p.rekvnr) {
            alert('Fant ikke rekvisisjonsnummeret i raden.\n\n'
                + 'Skjemaet krever feltet «nr», så endringen stoppes her. '
                + 'Bruk blyant-ikonet i admin på denne rekvisisjonen i stedet.');
            return;
        }
        if (!confirm('Sette status «' + s.tekst + '» på:\n\n'
            + hvem + '\nrekv ' + p.rekvnr + '\n\n'
            + 'Dette skrives inn i NISSY med ditt brukernavn og er synlig for transportøren.')) return;

        const t = statusToast('Setter «' + s.tekst + '» på ' + hvem + '…', '#e2e8f0', 0);
        try {
            await settManuellStatus(p.reqId, p.rekvnr, s.verdi);
            const svar = await lesStatusForRekv(p.rekvnr, p.reqId);
            const naa = svar && svar.status;
            // Bomtur (28) gir et nummer som skal videre til sjåfør/sentral. Hentes kun her —
            // de andre statusene har ikke noe slikt, og et ekstra kall uten grunn er unødig last.
            if (s.verdi === '28' && svar) {
                const b = await hentBomturnummer(svar);
                if (b && b.kode) {
                    visBomturPanel(hvem, b.kode, naa || s.tekst, p.reqId,
                        { turId: svar.turId, navn: p.navn, samkjort: (antallIRad || 1) > 1,
                          bomtur: b, rad: pRad });
                    t.textContent = '✓ ' + hvem + ': ' + (naa || s.tekst) + ' · bomtur ' + b.kode;
                    t.style.color = '#10b981';
                    console.log(`[${NAVN}] manuell status: reqId=${p.reqId} rekv=${p.rekvnr} `
                        + `→ ${s.tekst} (${s.verdi}); bomturkode ${b.kode}`
                        + ` (rå ${b.raa}, opprettet ${b.opprettet || '∅'})`);
                    setTimeout(() => trygtFjern(t), 6000);
                    return;
                }
            }
            if (naa && naa.toLowerCase() === s.tekst.toLowerCase()) {
                t.textContent = '✓ ' + hvem + ': ' + naa;
                t.style.color = '#10b981';
            } else if (naa) {
                // POST-en gikk gjennom, men NISSY står med noe annet. Det kan være en lovlig
                // overgang vi ikke kjenner, eller en avvist endring — uansett skal operatøren
                // se hva systemet FAKTISK sier, ikke vår antakelse.
                t.textContent = '⚠ ' + hvem + ': NISSY står nå med «' + naa + '»';
                t.style.color = '#fbbf24';
            } else {
                t.textContent = '⚠ Sendt, men klarte ikke lese statusen tilbake — kontroller i admin';
                t.style.color = '#fbbf24';
            }
            console.log(`[${NAVN}] manuell status: reqId=${p.reqId} rekv=${p.rekvnr} `
                + `→ ${s.tekst} (${s.verdi}); NISSY svarer: ${naa || 'ukjent'}`);
        } catch (e) {
            t.textContent = '✗ Statusendring feilet: ' + ((e && e.message) || e);
            t.style.color = '#dc2626';
            console.warn(`[${NAVN}] manuell status feilet for reqId=${p.reqId}:`, e);
        }
        setTimeout(() => trygtFjern(t), 6000);
    }

    // Statusmenyen. To nivåer, der det første hoppes over når raden bare har én passasjer:
    //   1) HVEM — kun ved samkjøring, der én rad rommer flere rekvisisjoner
    //   2) HVA  — de fire statusene NISSY selv tilbyr
    // Toppen sier alltid hvem endringen gjelder (Thomas 27.08). Det er den ene opplysningen
    // som skiller en riktig statusendring fra en som rammer feil pasient i samme bil.
    function visStatusMeny(pRad, x, y) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
        const pass = lesPassasjererFraRad(pRad);
        if (!pass.length) {
            alert('Fant ingen rekvisisjon i denne raden — er det en pågående tur?');
            return;
        }

        const lagMeny = (tittelHTML) => {
            const meny = document.createElement('div');
            meny.id = 'vkt-ctx-meny';
            meny.style.cssText = [
                'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
                'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
                'padding:4px', 'min-width:260px', 'max-width:360px',
                'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
            ].join(';');
            const tittel = document.createElement('div');
            tittel.innerHTML = tittelHTML;
            tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;'
                + 'border-bottom:1px solid #334155;margin-bottom:4px;line-height:1.5;';
            if (ER_DEV) {
                const devTag = document.createElement('span');
                devTag.textContent = ' DEV';
                devTag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
                tittel.appendChild(devTag);
            }
            meny.appendChild(tittel);
            return meny;
        };
        const leggPunkt = (meny, html, handler) => {
            const a = document.createElement('div');
            a.innerHTML = html;
            a.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = handler;
            meny.appendChild(a);
        };
        const plasser = (meny) => {
            document.body.appendChild(meny);
            const r = meny.getBoundingClientRect();
            if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
            if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';
            setTimeout(() => {
                const lukk = (ev) => {
                    if (!meny.contains(ev.target)) {
                        trygtFjern(meny);
                        document.removeEventListener('click', lukk, true);
                        document.removeEventListener('contextmenu', lukk, true);
                    }
                };
                document.addEventListener('click', lukk, true);
                document.addEventListener('contextmenu', lukk, true);
            }, 0);
        };
        const merkelapp = (p) => statusEsc(p.navn || ('rekv ' + (p.rekvnr || p.reqId)));

        const velgStatus = (p) => {
            trygtFjern(document.getElementById('vkt-ctx-meny'));
            const meny = lagMeny('Endre status — <span style="color:#e2e8f0;font-weight:600;">'
                + merkelapp(p) + '</span>'
                + (p.rekvnr ? '<br><span style="color:#64748b;">rekv ' + statusEsc(p.rekvnr) + '</span>' : ''));
            MANUELL_STATUSER.forEach(s => {
                const hint = s.hint
                    ? ' <span style="font-size:10px;color:#94a3b8;">(' + statusEsc(s.hint) + ')</span>' : '';
                leggPunkt(meny, statusEsc(s.tekst) + hint, () => {
                    trygtFjern(meny);
                    // «Ikke møtt» er ikke bare en status — den utløser bomturkode, Teams-melding,
                    // årsak og avvik. Den ene veien dit er modalen; ellers ville muskelminnet
                    // ført operatøren inn i en halv registrering hun trodde var hel.
                    if (s.verdi === '28') { aapneBomturModal(pRad, x, y); return; }
                    utforStatusendring(p, s, pass.length, pRad);
                });
            });
            plasser(meny);
        };

        if (pass.length === 1) { velgStatus(pass[0]); return; }

        const meny = lagMeny(pass.length + ' rekvisisjoner i denne turen — <span style="color:#e2e8f0;">velg pasient</span>');
        pass.forEach(p => leggPunkt(meny, merkelapp(p), () => velgStatus(p)));
        plasser(meny);
    }

    // AVBESTILLING SOM EGET MENYVALG (Thomas 27.08: «hvor kommer avbestilling opp så operatøren
    // bare kan kopiere?»). Teams-meldingen dukket før BARE opp i sekundet etter en statusendring —
    // men den vanlige situasjonen er en tur som allerede STÅR som «Ikke møtt»: koden finnes, den
    // skal bare videre til sentralen. Da var eneste vei å sette statusen på nytt.
    // Her hentes koden for en rad som allerede har bomtur, og samme panel åpnes.
    async function aapneBomturModal(pRad, x, y) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
        const pass = lesPassasjererFraRad(pRad);
        if (!pass.length) {
            alert('Fant ingen rekvisisjon i denne raden — er det en pågående tur?');
            return;
        }

        // Ett vindu for hele hendelsen: status → kode → Teams → årsak → avvik.
        // Panelet tegnes på nytt med samme funksjon når registreringen er gjort, så operatøren
        // ser resultatet der hun allerede ser — ingen ny dialog, ingen ny plassering.
        const tegn = (pp, svar, b) => {
            const hvem = pp.navn || ('rekvisisjon ' + (pp.rekvnr || pp.reqId));
            visBomturPanel(hvem, b && b.kode, svar && svar.status, pp.reqId, {
                turId: svar && svar.turId, navn: pp.navn, samkjort: pass.length > 1,
                bomtur: b, rad: pRad,
                paaRegistrer: async (knapp) => {
                    // Skjemaet krever feltet «nr». Uten det vet vi ikke om NISSY godtar POST-en
                    // eller stille gjør noe annet enn vi tror — da stopper vi heller her.
                    if (!pp.rekvnr) {
                        alert('Fant ikke rekvisisjonsnummeret i raden.\n\n'
                            + 'Skjemaet krever feltet «nr», så statusendringen stoppes her. '
                            + 'Bruk blyant-ikonet i admin på denne rekvisisjonen i stedet.');
                        knapp.disabled = false;
                        knapp.textContent = 'Sett «Ikke møtt» — henter bomturkode';
                        return;
                    }
                    try {
                        await settManuellStatus(pp.reqId, pp.rekvnr, '28');
                        const svar2 = await lesStatusForRekv(pp.rekvnr, pp.reqId);
                        const b2 = svar2 ? await hentBomturnummer(svar2) : null;
                        console.log(`[${NAVN}] bomtur registrert: reqId=${pp.reqId} rekv=${pp.rekvnr}`
                            + ` → ${(svar2 && svar2.status) || 'ukjent'}`
                            + `, kode ${(b2 && b2.kode) || '∅'}`);
                        if (!b2 || !b2.kode) {
                            // Forskjellen på «vi sendte» og «det ble gjort» er hele poenget når
                            // transportøren ser resultatet. Vi later ikke som om det gikk bra.
                            knapp.disabled = false;
                            knapp.textContent = 'Sett «Ikke møtt» — henter bomturkode';
                            alert('Statusen ble sendt, men NISSY ga ingen bomturkode tilbake'
                                + (svar2 && svar2.status ? ' (står nå med «' + svar2.status + '»)' : '')
                                + '.\n\nKontroller rekvisisjonen i NISSY.');
                            return;
                        }
                        tegn(pp, svar2, b2);
                    } catch (e) {
                        knapp.disabled = false;
                        knapp.textContent = 'Sett «Ikke møtt» — henter bomturkode';
                        alert('Statusendringen feilet: ' + ((e && e.message) || e));
                    }
                },
            });
        };

        const kjor = async (p) => {
            const hvem = p.navn || ('rekvisisjon ' + (p.rekvnr || p.reqId));
            if (!p.rekvnr) {
                alert('Fant ikke rekvisisjonsnummeret i raden, så bomturen kan ikke slås opp.\n\n'
                    + 'Åpne rekvisisjonen i admin i stedet.');
                return;
            }
            const t = statusToast('Slår opp ' + hvem + '…', '#e2e8f0', 0);
            try {
                const svar = await lesStatusForRekv(p.rekvnr, p.reqId);
                const b = svar ? await hentBomturnummer(svar) : null;
                trygtFjern(t);
                tegn(p, svar, b);
            } catch (e) {
                t.textContent = '✗ Klarte ikke slå opp turen: ' + ((e && e.message) || e);
                t.style.color = '#dc2626';
                setTimeout(() => trygtFjern(t), 6000);
            }
        };

        if (pass.length === 1) { kjor(pass[0]); return; }

        // Ved samkjøring gjelder avbestillingen ÉN pasient — de andre skal fortsatt kjøres.
        const meny = document.createElement('div');
        meny.id = 'vkt-ctx-meny';
        meny.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
            'padding:4px', 'min-width:260px', 'max-width:360px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');
        const tittel = document.createElement('div');
        tittel.innerHTML = 'Bomtur / avbestilling — <span style="color:#e2e8f0;">hvem gjelder det?</span>';
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;'
            + 'border-bottom:1px solid #334155;margin-bottom:4px;line-height:1.5;';
        meny.appendChild(tittel);
        pass.forEach(pp => {
            const a = document.createElement('div');
            a.textContent = pp.navn || ('rekv ' + (pp.rekvnr || pp.reqId));
            a.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = () => { trygtFjern(meny); kjor(pp); };
            meny.appendChild(a);
        });
        document.body.appendChild(meny);
        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';
        setTimeout(() => {
            const lukk = (ev) => {
                if (!meny.contains(ev.target)) {
                    trygtFjern(meny);
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    function visTrekkTilbakeMeny(turer, x, y, radRef) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
        // Splitt etter om dato er fremtidig
        const fremtidige = turer.filter(t => !erIDagEllerTidligere(t.dato));
        const idagEllerFør = turer.filter(t => erIDagEllerTidligere(t.dato));

        const meny = document.createElement('div');
        meny.id = 'vkt-ctx-meny';
        meny.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
            'padding:4px', 'min-width:260px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const tittel = document.createElement('div');
        // ⚠️ MENYEN SKAL SI HVEM (Thomas 27.08). «1 tur valgt» er sant, men ubrukelig: operatøren
        //    har akkurat høyreklikket i en tett tabell med 300 rader, og det eneste hun trenger
        //    bekreftet før hun trykker noe, er at hun traff riktig linje. Navnet står i raden vi
        //    allerede har lest — det kostet ingenting å ikke vise det, og alt å utelate.
        // ⚠️ IKKE turer[0].navn HER. Den kommer fra lesPasientnavnFraRadGeneric, som tar
        //    cells[1] — og i pågående er cells[1] LØYVET (A9189), ikke pasienten. Menyen ville
        //    sagt «A9189» der operatøren forventer et navn. Vi leser derfor PNAVN-kolonnen via
        //    headeren, samme vei som statusmenyen, og viser alle passasjerene ved samkjøring.
        const tittelNavn = (radRef && radRef.isConnected)
            ? lesPassasjererFraRad(radRef).map(x => x.navn).filter(Boolean)
            : [];
        if (tittelNavn.length) {
            tittel.innerHTML = '<span style="color:#e2e8f0;font-weight:600;">'
                + tittelNavn.map(statusEsc).join(' · ') + '</span>';
        } else if (turer.length === 1 && turer[0].navn) {
            tittel.innerHTML = '<span style="color:#e2e8f0;font-weight:600;">' + statusEsc(turer[0].navn) + '</span>';
        } else {
            tittel.textContent = `${turer.length} tur${turer.length > 1 ? 'er' : ''} valgt`;
        }
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #334155;margin-bottom:4px;line-height:1.5;';
        if (ER_DEV) {
            const devTag = document.createElement('span');
            devTag.textContent = ' DEV';
            devTag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
            tittel.appendChild(devTag);
        }
        meny.appendChild(tittel);

        const a = document.createElement('div');
        a.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;' +
            (fremtidige.length ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (fremtidige.length) {
            const teller = fremtidige.length;
            const skipText = idagEllerFør.length
                ? ` <span style="font-size:10px;color:#fbbf24;">(${idagEllerFør.length} i dag/tidligere hoppes over)</span>`
                : '';
            a.innerHTML = `🔙 Trekk tilbake ${teller} tur${teller > 1 ? 'er' : ''}${skipText}`;
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = async () => {
                trygtFjern(meny);
                const navnliste = fremtidige.slice(0, 5).map(t => t.navn).join(', ') +
                    (fremtidige.length > 5 ? ` … (+${fremtidige.length - 5} til)` : '');
                if (!confirm(`Trekke tilbake ${teller} tur${teller > 1 ? 'er' : ''} fra pågående?\n\n${navnliste}`)) return;
                if (typeof window.removePaagaaendeOppdrag !== 'function') {
                    alert('Fant ikke removePaagaaendeOppdrag — er du på Planlegger-siden?');
                    return;
                }

                // Progress-toast nede til høyre
                trygtFjern(document.getElementById('vkt-tt-progress'));
                const toast = document.createElement('div');
                toast.id = 'vkt-tt-progress';
                toast.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:200px;';
                document.body.appendChild(toast);

                async function ventTilBorte(resId, maks = 10000) {
                    const start = Date.now();
                    while (Date.now() - start < maks) {
                        if (!document.getElementById('P-' + resId)) return true;
                        await new Promise(r => setTimeout(r, 100));
                    }
                    return false;
                }

                // Klikk X-img i DOM i stedet for å kalle funksjonen direkte —
                // matcher manuell flyt (som alltid funker) og trigger evt. event listeners.
                const stoppAutoBekreft = aktiverAutoBekreft();
                const totaltStart = fremtidige.length;
                let totaltOk = 0;
                let runde = 0;
                // Spor hvilke turer som gjenstår — kun de som fortsatt har X-knapp i DOM
                let gjenstaaende = fremtidige.slice();
                try {
                    while (gjenstaaende.length > 0) {
                        runde++;
                        let progressDenneRunde = 0;
                        const denne = gjenstaaende.filter(t => finnXImgGlobalt(t.resId, t.reqId));
                        if (denne.length === 0) break;
                        for (let i = 0; i < denne.length; i++) {
                            const t = denne[i];
                            toast.textContent = `Runde ${runde}: ${i + 1}/${denne.length} (${totaltOk}/${totaltStart} totalt) — ${t.navn}`;
                            const xImg = finnXImgGlobalt(t.resId, t.reqId);
                            if (!xImg) continue;
                            try {
                                xImg.click();
                                const borte = await ventTilBorte(t.resId);
                                if (borte) { totaltOk++; progressDenneRunde++; }
                            } catch (e) {
                                console.warn(`[${NAVN}] klikk feilet for ${t.resId}`, e);
                            }
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        // Re-evaluer hva som gjenstår: alt som fortsatt har X-knapp
                        gjenstaaende = gjenstaaende.filter(t => finnXImgGlobalt(t.resId, t.reqId));
                        if (progressDenneRunde === 0) {
                            console.warn(`[${NAVN}] runde ${runde} ga 0 progress, gir opp med ${gjenstaaende.length} igjen`);
                            break;
                        }
                        console.log(`[${NAVN}] runde ${runde} ferdig: ${progressDenneRunde} prosessert, ${totaltOk}/${totaltStart} totalt`);
                        if (gjenstaaende.length > 0) await new Promise(r => setTimeout(r, 1500));
                    }
                } finally {
                    stoppAutoBekreft();
                }
                const fail = totaltStart - totaltOk;
                const ok = totaltOk;
                toast.textContent = `Ferdig: ${ok} trukket tilbake${fail ? ', ' + fail + ' feilet' : ''}`;
                toast.style.color = fail ? '#fbbf24' : '#10b981';
                console.log(`[${NAVN}] trekk tilbake: ${ok} ok, ${fail} feilet`);
                setTimeout(() => trygtFjern(toast), fail ? 4000 : 2000);
            };
        } else {
            // To ulike grunner til at punktet er dødt, og de betyr ikke det samme for
            // operatøren: enten er turen avsluttet (ingen X-knapp igjen), eller så er den
            // i dag//tidligere. Å si «kun fremtidig dato» om en avsluttet tur er direkte
            // villedende — da leter hun etter en datofeil som ikke finnes.
            a.innerHTML = turer.length === 0
                ? '🔙 Trekk tilbake <span style="font-size:10px;font-style:italic;">(turen er avsluttet)</span>'
                : '🔙 Trekk tilbake <span style="font-size:10px;font-style:italic;">(kun fremtidig dato)</span>';
        }
        meny.appendChild(a);

        // Ekstra valg: trekk tilbake ALLE pågående uten ERS/RB/A/TK (uavhengig av markering)
        // Tellingen gjøres på åpningstidspunkt — viser hvor mange som er i kandidat-listen
        const alle = Array.from(document.querySelectorAll('tr[id^="P-"]')).filter(r => {
            const args = lesPaagaaendeArgs(r);
            if (!args) return false;
            if (erIDagEllerTidligere(lesAvgangsdatoFraRad(r))) return false;
            if (harSpesieltBehov(r)) return false;
            return true;
        });
        const alleSep = document.createElement('div');
        alleSep.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(alleSep);

        const alleA = document.createElement('div');
        alleA.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;' +
            (alle.length ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (alle.length) {
            alleA.innerHTML = `🌐 Trekk tilbake alle ${alle.length} <span style="font-size:10px;color:#94a3b8;">(uten ERS/RB/A/TK)</span>`;
            alleA.onmouseover = () => alleA.style.background = '#334155';
            alleA.onmouseout = () => alleA.style.background = '';
            alleA.onclick = async () => {
                trygtFjern(meny);
                if (!await bekreftTilbaketrekkingAlle(alle.length)) return;
                trygtFjern(document.getElementById('vkt-tt-progress'));
                const t2 = document.createElement('div');
                t2.id = 'vkt-tt-progress';
                t2.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:200px;';
                document.body.appendChild(t2);

                async function ventTilBorte2(resId, maks = 10000) {
                    const start = Date.now();
                    while (Date.now() - start < maks) {
                        if (!document.getElementById('P-' + resId)) return true;
                        await new Promise(r => setTimeout(r, 100));
                    }
                    return false;
                }

                // Re-skanner kandidater fra DOM mellom hver "runde" og prøver igjen til
                // det ikke skjer mer progress. Håndterer NISSYs queue-fenomen ved store batches.
                function finnAlleKandidater() {
                    return Array.from(document.querySelectorAll('tr[id^="P-"]')).filter(r => {
                        if (!lesPaagaaendeArgs(r)) return false;
                        if (erIDagEllerTidligere(lesAvgangsdatoFraRad(r))) return false;
                        if (harSpesieltBehov(r)) return false;
                        return true;
                    });
                }

                const stoppAutoBekreft2 = aktiverAutoBekreft();
                const totaltStart = alle.length;
                let totaltOk = 0;
                let runde = 0;
                try {
                    while (true) {
                        runde++;
                        const kandidater = finnAlleKandidater();
                        if (kandidater.length === 0) break;
                        let progressDenneRunde = 0;
                        const oppgaver = kandidater.map(r => ({
                            args: lesPaagaaendeArgs(r),
                            navn: lesPasientnavnFraRadGeneric(r)
                        })).filter(o => o.args);
                        for (let i = 0; i < oppgaver.length; i++) {
                            const o = oppgaver[i];
                            t2.textContent = `Runde ${runde}: ${i + 1}/${oppgaver.length} (${totaltOk}/${totaltStart} totalt) — ${o.navn || o.args.resId}`;
                            const xImg = finnXImgGlobalt(o.args.resId, o.args.reqId);
                            if (!xImg) continue;
                            try {
                                xImg.click();
                                const borte = await ventTilBorte2(o.args.resId);
                                if (borte) { totaltOk++; progressDenneRunde++; }
                            } catch (e) {
                                console.warn(`[${NAVN}] klikk feilet for ${o.args.resId}`, e);
                            }
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        if (progressDenneRunde === 0) {
                            console.warn(`[${NAVN}] runde ${runde} ga 0 progress, gir opp med ${kandidater.length} igjen`);
                            break;
                        }
                        console.log(`[${NAVN}] runde ${runde} ferdig: ${progressDenneRunde} prosessert, ${totaltOk} totalt`);
                        await new Promise(r => setTimeout(r, 1500));
                    }
                } finally {
                    stoppAutoBekreft2();
                }
                const igjen = finnAlleKandidater().length;
                t2.textContent = `Ferdig: ${totaltOk} trukket tilbake${igjen ? `, ${igjen} igjen (NISSY queue)` : ''}`;
                t2.style.color = igjen ? '#fbbf24' : '#10b981';
                setTimeout(() => trygtFjern(t2), igjen ? 5000 : 2500);
            };
        } else {
            alleA.innerHTML = '🌐 Trekk tilbake alle <span style="font-size:10px;font-style:italic;">(ingen kandidater)</span>';
        }
        meny.appendChild(alleA);

        // Samkjøring-valg (V- + P-markerte)
        const samkjorSep = document.createElement('div');
        samkjorSep.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(samkjorSep);
        const samkjorA = document.createElement('div');
        samkjorA.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;font-size:13px;';
        samkjorA.textContent = '🗺️ Sjekk samkjøring…';
        const samkjorBeta = document.createElement('span');
        samkjorBeta.textContent = 'BETA';
        samkjorBeta.style.cssText = 'background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px;letter-spacing:0.5px;vertical-align:middle;';
        samkjorA.appendChild(samkjorBeta);
        samkjorA.onmouseover = () => samkjorA.style.background = '#334155';
        samkjorA.onmouseout = () => samkjorA.style.background = '';
        samkjorA.onclick = () => { trygtFjern(meny); aapneSamkjoring(); };
        meny.appendChild(samkjorA);

        // Manuell statusendring. Bevisst UTEN batch-variant: status settes per rekvisisjon, og
        // en «endre alle»-knapp her ville vært den ene funksjonen i verktøykassen som kan gjøre
        // stor skade raskt. Er flere turer markert, sier punktet det i stedet for å gjette hvem.
        const statusSep = document.createElement('div');
        statusSep.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(statusSep);
        const statusA = document.createElement('div');
        // ⚠️ RADEN SLÅS IKKE OPP PÅ NYTT. Første forsøk gjorde getElementById('P-' + resId) og
        //    fikk null (Thomas 27.08, P-81662441): id-en på raden er ikke nødvendigvis det samme
        //    tallet som removePaagaaendeOppdrag kaller resId — samme felle som fremmestatus gikk
        //    i da showRes ga et NAME som avvek fra id-en. Vi holder på ELEMENTET fra høyreklikket
        //    i stedet, og har oppslaget bare som nødutgang hvis NISSY har rendret raden på nytt.
        const finnRad = () => {
            if (radRef && radRef.isConnected) return radRef;
            const t = turer[0] || {};
            let r = document.getElementById('P-' + t.resId);
            if (!r && t.resId && t.reqId) {
                const x = finnXImgGlobalt(t.resId, t.reqId);
                r = x && x.closest('tr');
            }
            if (!r && t.resId) { try { r = document.querySelector('tr[name="' + t.resId + '"]'); } catch (_) {} }
            return r;
        };
        const énTur = turer.length === 1 || !!(radRef && radRef.isConnected);
        statusA.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;'
            + (énTur ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (énTur) {
            statusA.innerHTML = '✏️ Endre status…';
            const betaS = document.createElement('span');
            betaS.textContent = 'BETA';
            betaS.style.cssText = 'background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;'
                + 'padding:1px 5px;border-radius:3px;margin-left:6px;letter-spacing:0.5px;vertical-align:middle;';
            statusA.appendChild(betaS);
            statusA.onmouseover = () => statusA.style.background = '#334155';
            statusA.onmouseout = () => statusA.style.background = '';
            statusA.onclick = () => {
                trygtFjern(meny);
                const pRad = finnRad();
                if (!pRad) { alert('Mistet raden — NISSY kan ha rendret tabellen på nytt. Høyreklikk en gang til.'); return; }
                visStatusMeny(pRad, x, y);
            };
        } else {
            statusA.innerHTML = '✏️ Endre status <span style="font-size:10px;font-style:italic;">(kun én tur om gangen)</span>';
        }
        meny.appendChild(statusA);

        const avbA = document.createElement('div');
        avbA.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;'
            + (énTur ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (énTur) {
            avbA.innerHTML = '🚫 Bomtur / avbestilling…';
            const betaA = document.createElement('span');
            betaA.textContent = 'BETA';
            betaA.style.cssText = 'background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;'
                + 'padding:1px 5px;border-radius:3px;margin-left:6px;letter-spacing:0.5px;vertical-align:middle;';
            avbA.appendChild(betaA);
            avbA.onmouseover = () => avbA.style.background = '#334155';
            avbA.onmouseout = () => avbA.style.background = '';
            avbA.onclick = () => {
                trygtFjern(meny);
                const pRad = finnRad();
                if (!pRad) { alert('Mistet raden — NISSY kan ha rendret tabellen på nytt. Høyreklikk en gang til.'); return; }
                aapneBomturModal(pRad, x, y);
            };
        } else {
            avbA.innerHTML = '🚫 Bomtur / avbestilling <span style="font-size:10px;font-style:italic;">(kun én tur om gangen)</span>';
        }
        meny.appendChild(avbA);

        document.body.appendChild(meny);
        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';

        setTimeout(() => {
            const lukk = (ev) => {
                if (!meny.contains(ev.target)) {
                    trygtFjern(meny);
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    // Samkjøring: samle alle markerte V- og P-rader, åpne popup med Google Maps
    // som viser fra/til-pins og pasientnavn + tider, så bruker kan visuelt vurdere
    // om turene passer å samkjøres.
    // Hvilke V/P-rader er markert (blå) NÅ. Fanges FØR ekspandering, fordi NISSYs openPopp
    // AVMERKER raden når den åpnes — da ville et blå-filter i lesAlleMarkerte miste den.
    function markerteIds() {
        const ids = [];
        document.querySelectorAll('tr[id^="V-"], tr[id^="P-"]').forEach(r => {
            if (r.style.backgroundColor === NISSY_BLAA) ids.push(r.id);
        });
        return ids;
    }

    // Kollapsede samkjørings-rader (popp) viser bare ben 1 + en «åpne»-pil (openPopp('<resId>')).
    // De øvrige benene er IKKE i DOM før raden ekspanderes. Auto-åpne de markerte kollapsede radene
    // via NISSYs openPopp(resId), vent til benene (showReq) er lastet, og GJENOPPRETT så den blå
    // markeringen (openPopp avmerker raden) så operatørens utvalg ikke forsvinner.
    async function ekspanderMarkerte(ids) {
        if (!ids || !ids.length) return;
        const apne = [];
        ids.forEach(id => {
            if (!/^P-/.test(id)) return;
            const r = document.getElementById(id);
            const m = r && r.innerHTML.match(/openPopp\('(\d+)'\)/);
            if (m) apne.push({ id: id, resId: m[1] });
        });
        if (apne.length) {
            apne.forEach(a => { if (typeof window.openPopp === 'function') { try { window.openPopp(a.resId); } catch (_) {} } });
            const tellBen = id => { const r = document.getElementById(id); return r ? (r.innerHTML.match(/showReq\(this,\s*\d+/g) || []).length : 0; };
            let forrige = -1;
            for (let i = 0; i < 24; i++) {  // maks ~2,9 s — DWR-lasting av benene
                await new Promise(res => setTimeout(res, 120));
                const sum = apne.reduce((s, a) => s + tellBen(a.id), 0);
                if (sum >= apne.length && sum === forrige) break;  // ≥1 ben per rad og tallet stabilt
                forrige = sum;
            }
            console.log(`[${NAVN}] auto-åpnet ${apne.length} kollapset(e) samkjørings-rad(er)`);
        }
        // Gjenopprett blå markering på de fangede radene (openPopp nullstilte den).
        ids.forEach(id => { const r = document.getElementById(id); if (r) r.style.backgroundColor = NISSY_BLAA; });
    }

    // Les tur-data fra de markerte radene via FANGEDE ids (ikke blå-filter — se ekspanderMarkerte).
    function lesAlleMarkerte(ids) {
        if (!ids) ids = markerteIds();
        const turer = [];
        ids.forEach(id => {
            const r = document.getElementById(id);
            if (!r) return;
            const data = lesTurDataFraRad(r);
            if (!data) return;
            // En rad kan ha FLERE ben: tur+retur for samme pasient, eller flere pasienter i én
            // samkjørt bil. Hvert ben har sin egen showReq-reqId + searchStatus-rekvnr. Ekspander
            // til ett tur-objekt per ben → hele tur/retur (og ekte samkjøringer) tegnes på kartet.
            const reqIds = [...new Set([...(r.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g))].map(m => m[1]))];
            const rekvnrAlle = [...(r.innerHTML.matchAll(/searchStatus\?nr=(\d+)/g))].map(m => m[1]);
            if (reqIds.length <= 1) { turer.push(data); return; }
            reqIds.forEach((rq, i) => {
                turer.push(Object.assign({}, data, {
                    reqId: rq,
                    rekvnr: rekvnrAlle[i] || null,
                    flerbens: true,
                    navn: (data.navn || '') + ' · ben ' + (i + 1)
                }));
            });
        });
        console.log(`[${NAVN}] markerte turer:`, turer);
        return turer;
    }

    async function aapneSamkjoring() {
        const ids = markerteIds();
        if (ids.length === 0) {
            alert('Ingen markerte turer (klikk rader så de blir blå først).');
            return;
        }
        const popup = window.open('', 'vkt-samkjoring-' + Date.now(), 'width=1100,height=750,resizable=yes,scrollbars=yes');
        if (!popup) {
            alert('Popup blokkert — tillat popups for denne siden.');
            return;
        }
        const html = byggSamkjorHTML();
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        const api = window.__verktoykasseDev || window.__verktoykasse;
        const turer = await byggTurer(ids, api);
        // Sett data via window-property — unngår injection-issues og escaping av <
        popup.TURER_DATA = turer;
        // Hvis Maps allerede har lastet (raskt), trigger byggListe direkte
        if (popup.byggListe) try { popup.byggListe(); } catch (_) {}
    }

    // Bygg tur-objekter fra de markerte radene + berik med admin-adresser.
    // PÅGÅENDE (P): ÉTT tripSearch på resId (api.hentTurDetaljer → searchStatus
    //   submit_action=tripSearch&tripNr=<resId>) gir ALLE ben med admin-adresser i ett kall — også
    //   når raden er KOLLAPSET (ingen openPopp/DOM-lesing av ben). Speiler Overvåker Live.
    // VENTENDE (V): rad-data + admin-beriking via reqId/resId (tabellens Fra/Til er behandlingssted-navn,
    //   ikke adresser). Flerbens-V (sjelden) ekspanderes via showReq i raden.
    async function byggTurer(ids, api) {
        const turer = [];
        for (const id of ids) {
            const r = document.getElementById(id);
            const base = r ? lesTurDataFraRad(r) : null;
            const resId = id.replace(/^[VP]-/, '');
            // Benene raden FAKTISK viser (showReq).
            const radReqIds = r ? [...new Set([...(r.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g))].map(m => m[1]))] : [];
            if (id.startsWith('P-') && api && api.hentTurDetaljer) {
                let rekv = [];
                try { const res = await api.hentTurDetaljer(resId); rekv = (res && res.rekvisisjoner) || []; } catch (_) {}
                // tripSearch på resId kan returnere FLERE ben enn raden viser (f.eks. både tur OG retur
                // på oppdraget) → filtrer til benene radens showReq viser. Kollapset rad har ingen
                // showReq → behold alle ben (de ER samkjøringen).
                if (radReqIds.length) {
                    const filt = rekv.filter(rk => radReqIds.includes(String(rk.reqId)));
                    if (filt.length) rekv = filt;
                }
                // tripSearch filtrerer ofte bort PÅGÅENDE (allerede tildelte) turer → tom. Da henter vi
                // hver pasient i samkjøringen direkte via radens showReq-reqId-er (hentRekvisisjon, tripid=resId).
                if (!rekv.length && radReqIds.length && api.hentRekvisisjon) {
                    for (const rq of radReqIds) {
                        try {
                            const rek = await api.hentRekvisisjon(rq, 1, resId, '');
                            if (rek && rek.fra_adresse && rek.til_adresse) {
                                rekv.push({ reqId: rq, pasient_navn: rek.pasient_navn, fra_adresse: rek.fra_adresse, til_adresse: rek.til_adresse,
                                    retning: rek.retning, klar_fra: rek.klar_fra, oppmote_tid: rek.oppmote_tid, pasient_adresse: rek.pasient_adresse });
                            }
                        } catch (_) {}
                    }
                }
                if (rekv.length) {
                    rekv.forEach(rk => {
                        const harAdr = rk.fra_adresse && rk.til_adresse;
                        const tur = Object.assign({}, base || {}, {
                            type: 'P', resId: resId, reqId: rk.reqId || null, ventende: false,
                            navn: rk.pasient_navn || (base && base.navn) || resId,
                            fra: harAdr ? rk.fra_adresse : ((base && base.fra) || ''),
                            til: harAdr ? rk.til_adresse : ((base && base.til) || ''),
                            adrKilde: harAdr ? 'admin' : 'tabell',
                            adrFeil: harAdr ? null : 'rekvisisjon uten adresser (er admin innlogget?)'
                        });
                        adminFasit(tur, rk);   // v1.111: retning + tider fulgte ikke med P-grenen
                        turer.push(tur);
                    });
                    continue;  // ben hentet via tripSearch — ferdig med denne raden
                }
                // tripSearch ga ingenting → fall tilbake til rad-basert under
            }
            if (!base) continue;
            // V-rad = ventende (trygt å endre adresse); P-rad = pågående (skriving sperret — kan bytte transportør).
            base.resId = base.resId || resId;
            base.ventende = id.startsWith('V-');
            // VENTENDE (eller P-fallback): ÉN tur via radens primær-ben (resId). Vi flerbens-ekspanderer
            // IKKE V-rader — en V-rad sin andre showReq-reqId er pasientens PARET retur (samme pasient),
            // ikke en egen samkjørings-passasjer. Å ta begge ga falsk «alt hentes»-løkke i kjernen.
            await beriktTur(base, api);
            turer.push(base);
        }
        console.log(`[${NAVN}] turer til samkjøring:`, turer);
        return turer;
    }

    // v1.110/1.111: admin-plakaten er FASIT for retning + tider — radkolonnene varierer og P-rader
    // kan mangle tid helt («Retning ukjent» / tom hentetid i popupen). Kalles fra BEGGE turbygger-
    // grenene (P-grenen i byggTurer + beriktTur).
    function adminFasit(t, rek) {
        if (!rek) return;
        if (rek.retning) t.retning = rek.retning;   // «Til behandling» / «Fra behandling»
        // v1.118: pasientens registrerte adresse = KRAVGRUNNLAGET for «Annen adresse»-dommen
        // (pasienten kan fritt reise kortere enn folkeregistrert — forrige hentested er irrelevant).
        if (rek.pasient_adresse) t.pasientAdresse = rek.pasient_adresse;
        const kl = s => { const m = String(s || '').match(/(\d{1,2}:\d{2})/); return m ? m[1] : ''; };
        if (!t.henteTid && rek.klar_fra) { t.henteTid = kl(rek.klar_fra); t.tid = t.tid || t.henteTid; }
        if (!t.oppTid && rek.oppmote_tid) t.oppTid = kl(rek.oppmote_tid);
        // v1.112: rå oppmøtetidspunkt MED dato («04.07.2026 08:45») — gir beregnReisetid
        // behandlingsdato/-tid uten å måtte åpne edit-skjemaet (viktig for pågående turer).
        if (rek.oppmote_tid) t.oppmoteRaw = rek.oppmote_tid;
    }

    // Berik én tur med admin-adresser via ajax_reqdetails. Flerbens deler resId → bruk benets reqId.
    async function beriktTur(t, api) {
        if (!t.adrKilde) t.adrKilde = 'tabell';
        if (!api || !api.hentRekvisisjon) { t.adrFeil = 'verktøykasse-API utilgjengelig'; return; }
        if (!t.resId && !t.reqId) { t.adrFeil = 'fant ikke resurs-id i raden'; return; }
        const kombos = [];
        if (t.flerbens) {
            if (t.reqId) kombos.push([t.reqId, t.reqId]);
            if (t.reqId && t.resId) kombos.push([t.reqId, t.resId]);
        } else {
            if (t.resId) kombos.push([t.resId, t.resId]);
            if (t.reqId && t.resId) kombos.push([t.reqId, t.resId]);
            if (t.reqId) kombos.push([t.reqId, t.reqId]);
        }
        for (const [id, tripid] of kombos) {
            try {
                const rek = await api.hentRekvisisjon(id, 1, tripid, '');
                if (rek && rek.fra_adresse && rek.til_adresse) {
                    t.fra = rek.fra_adresse; t.til = rek.til_adresse; t.adrKilde = 'admin';
                    if (rek.pasient_navn) t.navn = rek.pasient_navn;
                    adminFasit(t, rek);
                    return;
                }
            } catch (_) {}
        }
        t.adrFeil = 'rekvisisjon uten adresser (er admin innlogget?)';
    }

    function byggSamkjorHTML() {
        return '<!doctype html><html lang="no"><head><meta charset="utf-8"><title>Sjekk samkjøring (Beta)</title>'
            // Delt samkjørings-kjerne (samkjoring_kjerne.js) — én motor for kapasitet/rekkefølge/
            // omkjøring på tvers av verktøyene. Lastes i popup-konteksten (window.__samkjoringKjerne).
            + '<script src="https://thomaswestby.no/skript/samkjoring_kjerne.js?v=' + Date.now() + '"></script>'
            // Leaflet + Kartverket-fliser (GRATIS, samme stack som Område-assistent) — erstatter Google Maps.
            + '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">'
            + '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
            + '<style>'
            + '*{box-sizing:border-box;margin:0;padding:0;}'
            + 'body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;height:100vh;background:#0f172a;color:#e2e8f0;overflow:hidden;}'
            // Kartet fyller hele popupen; lista flyter som et luftig overlay øverst til venstre
            // (innholds-høyde, halvtransparent + blur, avrundet) — ingen tung svart kolonne.
            + '#kart{position:absolute;inset:0;z-index:1;background:#e5e7eb;}'
            + '#liste{position:absolute;top:12px;left:12px;width:360px;max-height:calc(100vh - 24px);overflow-y:auto;background:rgba(15,23,42,0.92);backdrop-filter:blur(6px);border:1px solid #334155;border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,0.5);z-index:5;}'
            + '.gruppe{padding:10px 14px;border-bottom:1px solid #334155;}'
            + '.gruppe.kandidat{background:#0c2a4a;border-left:3px solid #3b82f6;}'
            + '.gruppe-header{font-size:11px;font-weight:700;color:#bfdbfe;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;display:flex;align-items:center;gap:6px;}'
            + '.gruppe-header .farge-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}'
            + '.tur{padding:6px 0;cursor:pointer;font-size:12px;border-top:1px solid rgba(255,255,255,0.05);}'
            + '.tur:first-child{border-top:none;}'
            + '.tur:hover{background:rgba(255,255,255,0.04);}'
            + '.tur.changed{background:rgba(251,191,36,0.08);border-left:3px solid #fbbf24;padding-left:8px;margin-left:-11px;}'
            + '.tur .ny-tid{font-weight:700;color:#fbbf24;}'
            + '.tur.changed-down .ny-tid{color:#3b82f6;}'
            + '.tur.changed-down{border-left-color:#3b82f6;background:rgba(59,130,246,0.08);}'
            + '.tur.aktiv .navn{color:#fbbf24;}'
            + '.tur .navn{font-weight:600;margin-bottom:2px;font-size:13px;}'
            + '.tur .meta{font-size:11px;color:#94a3b8;line-height:1.4;}'
            + '.tag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:0.3px;margin-right:4px;}'
            + '.tag-V{background:#10b981;color:#022c22;}'
            + '.tag-P{background:#f59e0b;color:#451a03;}'
            + '.tag-tur{background:#3b82f6;color:#fff;}'
            + '.tag-retur{background:#a855f7;color:#fff;}'
            + '.tag-ukjent{background:#475569;color:#cbd5e1;}'
            + '.tider-rad{display:flex;gap:8px;font-size:11px;color:#cbd5e1;margin-top:2px;}'
            + '.tider-rad b{color:#fff;}'
            + '.forslag{margin-top:8px;padding:8px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:5px;font-size:11px;}'
            + '.forslag .tittel{font-weight:700;color:#bfdbfe;margin-bottom:4px;font-size:10px;letter-spacing:0.5px;text-transform:uppercase;}'
            + '.forslag .opt{display:flex;justify-content:space-between;padding:2px 0;}'
            + '.forslag .delta-pos{color:#10b981;font-weight:600;}'
            + '.forslag .delta-neg{color:#fbbf24;font-weight:600;}'
            + '.forslag .delta-null{color:#64748b;}'
            + 'h2{padding:12px 14px;font-size:13px;border-bottom:1px solid #334155;background:#0f172a;display:flex;align-items:center;gap:8px;}'
            + '.beta-badge{background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;}'
            + '#status{padding:8px 14px;font-size:11px;color:#94a3b8;font-style:italic;}'
            // Basemap-velger (nede til venstre) — operatøren bytter bakgrunnskart selv.
            + '#basevelg{position:absolute;bottom:12px;left:12px;z-index:5;display:flex;gap:4px;background:rgba(15,23,42,0.9);backdrop-filter:blur(6px);border:1px solid #334155;border-radius:8px;padding:4px;box-shadow:0 6px 20px rgba(0,0,0,0.4);}'
            + '#basevelg button{border:none;background:transparent;color:#94a3b8;font-size:11px;font-weight:600;padding:5px 9px;border-radius:5px;cursor:pointer;font-family:inherit;}'
            + '#basevelg button:hover{background:rgba(255,255,255,0.06);color:#e2e8f0;}'
            + '#basevelg button.aktiv{background:#3b82f6;color:#fff;}'
            + '</style></head><body>'
            + '<div id="liste"><h2>Markerte turer <span class="beta-badge">BETA</span> <span style="font-size:10px;color:#64748b;font-weight:400;letter-spacing:0;">v' + VERSJON + '</span></h2><div id="status">Geocoder adresser…</div><div id="kjerneAnalyse"></div><div id="liste-inner"></div></div>'
            + '<div id="kart"></div>'
            + '<div id="basevelg"></div>'
            + '<script>'
            + 'const FARGER = ["#3b82f6","#ef4444","#10b981","#f59e0b","#a855f7","#ec4899","#06b6d4","#84cc16","#f97316","#6366f1"];'
            + 'const NAERHET_KM = 1.5;'  // turer innen 1,5 km grupperes (samme nabolag)
            + 'const FELLES_KM = 0.1;'   // innen 100 m = faktisk samme adresse (FELLES); ellers SEKVENSIELL
            // Gratis bakgrunnskart (ingen API-nøkkel): Kartverket grå, CartoDB mørkt/lyst, Esri satellitt.
            + 'const BASISKART = {'
            + '  "grå":       {navn:"Kartverket", url:"https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png", maxZoom:18, sub:null},'
            + '  "mørkt":     {navn:"Mørkt",      url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", maxZoom:19, sub:"abcd"},'
            + '  "lyst":      {navn:"Lyst",       url:"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", maxZoom:19, sub:"abcd"},'
            + '  "satellitt": {navn:"Satellitt",  url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxZoom:19, sub:null}'
            + '};'
            + 'let map, markører = [], polylinjer = [], geoKlar = false;'
            + 'let basisLag = null, kartBasis = "grå";'
            + 'let GRUPPER = [];'
            + 'function esc(s){const d=document.createElement("div");d.textContent=s||"";return d.innerHTML;}'
            + 'function parseHHMM(s){const m=String(s||"").match(/(\\d{1,2}):(\\d{2})/);return m?+m[1]*60+ +m[2]:null;}'
            + 'function fmtDelta(n){if(n===0)return "±0";return (n>0?"+":"")+n+" min";}'
            // Minutter → «t/min» når ≥ 60 (187 min → «3 t 7 min», 120 → «2 t», 45 → «45 min»).
            + 'function fmtMin(m){m=Math.round(+m||0);if(m<60)return m+" min";var t=Math.floor(m/60),r=m%60;return t+" t"+(r?" "+r+" min":"");}'
            + 'function deltaKlasse(n){if(n===0)return "delta-null";return n>0?"delta-pos":"delta-neg";}'
            + 'function haversineKm(a,b){const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;const c=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(c));}'
            // ── Leaflet-skall (erstatter google.maps.Marker/Polyline/LatLngBounds) ──
            + 'function fjernLag(arr){ arr.forEach(function(l){ try{ map.removeLayer(l); }catch(_){}}); arr.length=0; }'
            + 'function mkBounds(){ var a=[]; return { extend:function(p){ if(p) a.push(p); }, isEmpty:function(){return a.length===0;}, arr:a }; }'
            + 'function mkMarker(pos, o){ o=o||{}; var s=o.scale||12, d=s*2, fs=Math.round(s*0.95);'
            + '  var html="<div style=\\"position:relative;width:"+d+"px;height:"+d+"px;\\">"'
            + '    +"<div style=\\"position:absolute;inset:0;border-radius:50%;background:"+(o.farge||"#3b82f6")+";opacity:"+(o.fyll!=null?o.fyll:1)+";border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);\\"></div>"'
            + '    +"<div style=\\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:"+fs+"px;\\">"+(o.text||"")+"</div></div>";'
            + '  var ic=L.divIcon({className:"",iconSize:[d,d],iconAnchor:[s,s],html:html});'
            + '  var m=L.marker(pos,{icon:ic,title:o.title||""}); m.addTo(map); return m; }'
            + 'function mkLinje(path, o){ o=o||{}; var pl=L.polyline(path,{color:o.color,opacity:o.opacity,weight:o.weight}); pl.addTo(map); return pl; }'
            // Bakgrunnskart-bytte: fjern gammelt flislag, legg nytt nederst (markører/ruter ligger over).
            + 'function settBasis(key){'
            + '  const b = BASISKART[key]; if(!b || !map) return;'
            + '  if(basisLag){ try{ map.removeLayer(basisLag); }catch(_){} }'
            + '  const opts = {maxZoom:b.maxZoom}; if(b.sub) opts.subdomains = b.sub;'
            + '  basisLag = L.tileLayer(b.url, opts).addTo(map);'
            + '  basisLag.setZIndex(0);'
            + '  kartBasis = key;'
            + '  const v = document.getElementById("basevelg");'
            + '  if(v) v.querySelectorAll("button").forEach(btn => btn.classList.toggle("aktiv", btn.dataset.k === key));'
            + '}'
            + 'function byggBaseVelg(){'
            + '  const v = document.getElementById("basevelg"); if(!v) return;'
            + '  v.innerHTML = Object.keys(BASISKART).map(k => "<button data-k=\\"" + k + "\\"" + (k===kartBasis?" class=\\"aktiv\\"":"") + ">" + BASISKART[k].navn + "</button>").join("");'
            + '  v.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => settBasis(btn.dataset.k)));'
            + '}'
            // Geokoding via Geonorge (geokod.php = GRATIS), erstatter Google Geocoder. Returnerer {lat,lng}.
            // geokod.php kan bruke opptil ~10s på en adresse Geonorge ikke finner (2 forsøk). Uten
            // timeout fryser popupen («Geocoder …» henger). AbortController 7s → null, vi går videre.
            // Strip institusjonsnavn/etasje/inngang-prefiks (à la Avvik renskAdr) → ren gate + postnr, så
            // «Ahus-Lørenskog/Akuttmottak/Inngang 2, Sykehusveien 25, 1474 Lørenskog» geokodes som «Sykehusveien 25 1474».
            + 'function renskAdr(adr){'
            + '  var s = String(adr||"").replace(/<br\\s*\\/?>/gi, ",").replace(/<[^>]+>/g, " ");'
            + '  var deler = s.split(",").map(function(d){return d.trim();}).filter(function(d){return d && !/^(kommune|kommentar)\\s*:/i.test(d);});'
            + '  var pnrIdx = -1, i; for (i=0;i<deler.length;i++){ if (/\\b\\d{4}\\b/.test(deler[i])){ pnrIdx=i; break; } }'
            + '  if (pnrIdx > 0) {'
            + '    var gIdx = -1, j; for (j=pnrIdx-1;j>=0;j--){ if (/^(\\d+\\.?\\s*etg|etasje|inngang|bygg|avd|hus|plan)\\b/i.test(deler[j])) continue; gIdx=j; break; }'
            + '    var gate = gIdx>=0 ? deler[gIdx].split("/")[0].trim() : "";'
            + '    return ((gate ? gate+" " : "") + deler[pnrIdx]).replace(/\\bH\\d{3,4}\\b/gi,"").replace(/\\s+/g," ").trim();'
            + '  }'
            + '  return deler.join(" ");'
            + '}'
            + 'async function geo(adresse){'
            + '  const ctrl = new AbortController();'
            + '  const timer = setTimeout(() => ctrl.abort(), 7000);'
            + '  try {'
            + '    const r = await fetch("https://thomaswestby.no/skript/geokod.php?adr=" + encodeURIComponent(renskAdr(adresse)), {signal: ctrl.signal});'
            + '    const j = await r.json();'
            + '    if (j && j.ok && isFinite(j.lat) && isFinite(j.lon)) return {lat:+j.lat, lng:+j.lon};'
            + '  } catch(_) {} finally { clearTimeout(timer); }'
            + '  return null;'
            + '}'
            // Geocode alle PARALLELT (ikke sekvensielt) — ellers summeres trege bom-adresser opp til
            // ti-talls sekunders frysing. Med parallell + 7s-timeout er verste fall ~7s totalt.
            + 'async function geocodeAlle(){'
            + '  const TURER = window.TURER_DATA || [];'
            + '  const status = document.getElementById("status");'
            + '  const oppgaver = [];'
            + '  TURER.forEach(t => {'
            + '    if (t.fra) oppgaver.push(geo(t.fra).then(g => { t.fraGeo = g; }));'
            + '    if (t.til) oppgaver.push(geo(t.til).then(g => { t.tilGeo = g; }));'
            + '  });'
            + '  if (status) status.textContent = "Geocoder " + oppgaver.length + " adresser…";'
            + '  await Promise.all(oppgaver);'
            + '  if (status) status.style.display = "none";'
            + '}'
            // Cluster turer: prøv felles fra-adresse først, så felles til-adresse for resten.
            // Resultat: grupper merket med felles="fra" | "til" | false (singleton)
            + 'function lagGrupper(){'
            + '  const TURER = window.TURER_DATA || [];'
            + '  const grupper = [];'
            // Steg 1: cluster på fra-nærhet (kun proximity, ikke felles-flagg som settes etterpå)
            + '  TURER.forEach(t => {'
            + '    if (!t.fraGeo) { grupper.push({turer: [t], felles: false}); return; }'
            + '    const eks = grupper.find(g => g.turer[0].fraGeo && haversineKm(g.turer[0].fraGeo, t.fraGeo) < NAERHET_KM);'
            + '    if (eks) eks.turer.push(t);'
            + '    else grupper.push({turer: [t], felles: false});'
            + '  });'
            // Re-merk: hvis ≥2 turer i samme gruppe, det var felles-fra.
            // Men sjekk også om alle hentinger er FAKTISK samme adresse (innen FELLES_KM)
            // eller bare NÆRT — i sistnevnte tilfelle er det sekvensiell pickup, ikke felles.
            + '  grupper.forEach(g => {'
            + '    if (g.turer.length > 1) {'
            + '      g.felles = "fra";'
            + '      const ref = g.turer[0].fraGeo;'
            + '      g.eksaktMatch = ref && g.turer.every(t => t.fraGeo && haversineKm(ref, t.fraGeo) < FELLES_KM);'
            + '    }'
            + '  });'
            // Steg 2: for singletons, cluster på til-nærhet
            + '  const singletons = grupper.filter(g => g.felles === false);'
            + '  if (singletons.length > 1) {'
            + '    const tilGrupper = [];'
            + '    singletons.forEach(g => {'
            + '      const t = g.turer[0];'
            + '      if (!t.tilGeo) { tilGrupper.push(g); return; }'
            + '      const eks = tilGrupper.find(tg => tg.turer[0].tilGeo && haversineKm(tg.turer[0].tilGeo, t.tilGeo) < NAERHET_KM);'
            + '      if (eks) eks.turer.push(t);'
            + '      else tilGrupper.push({turer: [t], felles: false});'
            + '    });'
            + '    tilGrupper.forEach(tg => {'
            + '      if (tg.turer.length > 1) {'
            + '        tg.felles = "til";'
            + '        const ref = tg.turer[0].tilGeo;'
            + '        tg.eksaktMatch = ref && tg.turer.every(t => t.tilGeo && haversineKm(ref, t.tilGeo) < FELLES_KM);'
            + '      }'
            + '    });'
            // Sett sammen: behold fra-grupper, erstatt singletons med til-grupperingen
            + '    const resultat = grupper.filter(g => g.felles === "fra").concat(tilGrupper);'
            + '    return resultat;'
            + '  }'
            + '  return grupper;'
            + '}'
            + 'function byggListe(){'
            + '  const TURER = window.TURER_DATA || [];'
            + '  const el = document.getElementById("liste-inner");'
            + '  if (!Array.isArray(TURER) || TURER.length === 0) { el.innerHTML = "<div style=\\"padding:14px;color:#94a3b8;font-size:12px;\\">Venter på data…</div>"; return; }'
            + '  GRUPPER = lagGrupper();'
            + '  let html = "";'
            + '  GRUPPER.forEach((g, gi) => {'
            + '    const farge = FARGER[gi % FARGER.length];'
            + '    const klasse = g.felles ? "gruppe kandidat" : "gruppe";'
            + '    let overskrift;'
            + '    if (g.felles === "fra") overskrift = (g.eksaktMatch ? "🔄 FELLES HENTING (" : "🔀 SEKVENSIELL HENTING (") + g.turer.length + ")";'
            + '    else if (g.felles === "til") overskrift = (g.eksaktMatch ? "🎯 FELLES DESTINASJON (" : "🔀 SEKVENSIELL DESTINASJON (") + g.turer.length + ")";'
            + '    else overskrift = "ENKELTUR";'
            + '    html += "<div class=\\"" + klasse + "\\">"'
            + '      + "<div class=\\"gruppe-header\\"><span class=\\"farge-dot\\" style=\\"background:" + farge + "\\"></span>" + overskrift + "</div>";'
            // Beregn felles-tid kun for grupper med EKSAKT match — ellers er det
            // sekvensiell pickup/drop og operatør må vurdere tider manuelt.
            + '    let fellesTid = null, direksjon = "blandet";'
            + '    if (g.felles && g.eksaktMatch) {'
            + '      const tider = g.turer.map(t => parseHHMM(t.henteTid)).filter(t => t !== null);'
            + '      if (tider.length >= 2) {'
            + '        const direksjoner = g.turer.map(t => {'
            + '          const h = parseHHMM(t.henteTid), o = parseHHMM(t.oppTid);'
            + '          if (h === null || o === null) return "ukjent";'
            + '          return h >= o ? "retur" : "tur";'
            + '        });'
            + '        const alleRetur = direksjoner.every(d => d === "retur");'
            + '        const alleTur = direksjoner.every(d => d === "tur");'
            + '        if (alleRetur) { fellesTid = Math.max(...tider); direksjon = "retur"; }'
            + '        else if (alleTur) { fellesTid = Math.min(...tider); direksjon = "tur"; }'
            + '      }'
            + '    }'
            + '    const fmtTid = m => String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");'
            // Sorter turer
            + '    let sorterte = g.turer;'
            // scheduledTimes[i] = foreslått tid for sorterte[i]. Beregnes etter sortering.
            + '    let scheduledTimes = null;'
            + '    if (g.felles && !g.eksaktMatch) {'
            // Sekvensiell: rute basert på GEOGRAFI, ikke hentetid. Sjåfør samler opp i
            // kjøreretningen mot drop-området, så pickup fjernest fra drop-sentroid først.
            // Hvis vi henter nærmest drop først, må sjåfør kjøre tilbake = slalåm.
            + '      const dropPunkter = g.turer.filter(t => t.tilGeo).map(t => t.tilGeo);'
            + '      const dropC = dropPunkter.length > 0 ? {lat: dropPunkter.reduce((s,p)=>s+p.lat,0)/dropPunkter.length, lng: dropPunkter.reduce((s,p)=>s+p.lng,0)/dropPunkter.length} : null;'
            + '      sorterte = g.turer.slice().sort((a,b) => {'
            + '        if (!dropC || !a.fraGeo || !b.fraGeo) return 0;'
            + '        return haversineKm(b.fraGeo, dropC) - haversineKm(a.fraGeo, dropC);'  // fjernest først
            + '      });'
            // Retning-avhengig tids-justering:
            //  • Retur: anker = første pickup i rute (fjernest fra drop, ofte tidligst klar);
            //    etterfølgende pickups forsinkes til >= prev+5
            //  • Tur: anker = siste pickup i rute (nærmest drop, må være på orig pga oppmøtetid);
            //    tidligere pickups fremskyndes til <= next-5
            + '      const dirs = g.turer.map(t => { const h=parseHHMM(t.henteTid),o=parseHHMM(t.oppTid); return (h===null||o===null)?"ukjent":(h>=o?"retur":"tur"); });'
            + '      const alleRetur = dirs.every(d => d === "retur");'
            + '      const alleTur = dirs.every(d => d === "tur");'
            + '      const tider = sorterte.map(t => parseHHMM(t.henteTid));'
            // Bruk faktiske Google-reisetider (g.pickupLeg) hvis tilgjengelig; ellers haversine-estimat
            + '      const fallbackTid = (a, b) => (!a || !b) ? 5 : Math.ceil(haversineKm(a,b) * 2) + 3;'
            + '      const legTid = (i) => (g.pickupLeg && g.pickupLeg[i-1] !== undefined) ? g.pickupLeg[i-1] : fallbackTid(sorterte[i-1].fraGeo, sorterte[i].fraGeo);'
            + '      if (alleRetur && tider[0] !== null) {'
            + '        scheduledTimes = new Array(sorterte.length);'
            + '        scheduledTimes[0] = tider[0];'
            + '        for (let i = 1; i < sorterte.length; i++) {'
            + '          const foresl = scheduledTimes[i-1] + legTid(i);'
            + '          scheduledTimes[i] = (tider[i] === null) ? foresl : Math.max(tider[i], foresl);'
            + '        }'
            + '      } else if (alleTur && tider.length > 0) {'
            + '        scheduledTimes = new Array(sorterte.length);'
            + '        const sistI = sorterte.length - 1;'
            + '        scheduledTimes[sistI] = tider[sistI];'
            + '        for (let i = sistI - 1; i >= 0; i--) {'
            + '          const foresl = scheduledTimes[i+1] - legTid(i+1);'
            + '          scheduledTimes[i] = (tider[i] === null) ? foresl : Math.min(tider[i], foresl);'
            + '        }'
            + '      }'
            + '    } else if (g.felles === "fra" && g.turer[0].fraGeo) {'
            + '      const fraPos = g.turer[0].fraGeo;'
            + '      sorterte = g.turer.slice().sort((a,b) => (a.tilGeo && b.tilGeo) ? (haversineKm(fraPos, a.tilGeo) - haversineKm(fraPos, b.tilGeo)) : 0);'
            + '    } else if (g.felles === "til") {'
            // Sorter pickups fjernest-fra-drop først så ruten ikke slalåmer
            + '      const dropPos = g.turer[0].tilGeo;'
            + '      sorterte = g.turer.slice().sort((a,b) => {'
            + '        if (!dropPos || !a.fraGeo || !b.fraGeo) return 0;'
            + '        return haversineKm(b.fraGeo, dropPos) - haversineKm(a.fraGeo, dropPos);'
            + '      });'
            + '    }'
            // Beregn scheduledTimes for felles-til (tur: anker bakerst, jobb bakover med -5/stopp)
            // og felles-fra (retur: alle ved samme fellesTid)
            + '    if (g.felles === "til" && fellesTid !== null) {'
            + '      scheduledTimes = new Array(sorterte.length);'
            + '      const sistI = sorterte.length - 1;'
            + '      const sistHent = parseHHMM(sorterte[sistI].henteTid);'
            + '      if (sistHent !== null) {'
            + '        scheduledTimes[sistI] = sistHent;'
            + '        for (let p = sistI - 1; p >= 0; p--) {'
            + '          const desired = scheduledTimes[p+1] - 5;'
            + '          const maxAllowed = parseHHMM(sorterte[p].henteTid);'
            + '          scheduledTimes[p] = (maxAllowed !== null) ? Math.min(desired, maxAllowed) : desired;'
            + '        }'
            + '      }'
            + '    } else if (g.felles === "fra" && fellesTid !== null) {'
            + '      scheduledTimes = new Array(sorterte.length).fill(fellesTid);'
            + '    }'
            // Validering: hvis spread mellom pickup-tider er for stor, er samkjøring
            // ikke realistisk. Sekvensielle bruker faktiske henteTid; felles bruker
            // scheduledTimes (justert tid) — begge skal valideres.
            + '    const MAKS_GAP_MIN = 60;'  // maks 60 min vi kan flytte en pasient — over det blir det ikke samkjøring
            + '    let gapAdvarsel = null;'
            + '    let gapKilde = scheduledTimes;'
            + '    if (!gapKilde && g.felles && !g.eksaktMatch) {'
            + '      gapKilde = sorterte.map(t => parseHHMM(t.henteTid)).filter(x => x !== null);'
            + '    }'
            + '    if (gapKilde && gapKilde.length > 1) {'
            + '      const gyldige = gapKilde.filter(x => x !== undefined && x !== null);'
            + '      if (gyldige.length > 1) {'
            + '        const spread = Math.max(...gyldige) - Math.min(...gyldige);'
            + '        if (spread > MAKS_GAP_MIN) {'
            + '          const t = Math.floor(spread/60), m = spread%60;'
            + '          const spredningTekst = (t > 0 ? t + "t " : "") + m + " min";'
            + '          gapAdvarsel = "⚠ Kan ikke samkjøres — " + spredningTekst + " mellom turene (maks " + MAKS_GAP_MIN + " min)";'
            + '        }'
            + '      }'
            + '    }'
            // Rendering-modus: sekvensiell viser kjørerute som 4 stopp (A-D pickup+drop),
            // mens felles henting/destinasjon viser per-tur (med felles tids-forslag).
            + '    if (g.felles && !g.eksaktMatch) {'
            + '      const lagPrefix = (b) => "<span style=\\"display:inline-block;width:18px;height:18px;background:"+farge+";color:#fff;border-radius:50%;font-size:11px;font-weight:700;text-align:center;line-height:18px;margin-right:6px;\\">"+b+"</span>";'
            // Drops sorteres etter avstand til siste pickup — nærmest først, naturlig fortsettelse av ruten
            + '      const sistPickup = sorterte.length > 0 ? sorterte[sorterte.length-1].fraGeo : null;'
            + '      const dropSortert = sorterte.slice().sort((a,b) => {'
            + '        if (!sistPickup || !a.tilGeo || !b.tilGeo) return 0;'
            + '        return haversineKm(a.tilGeo, sistPickup) - haversineKm(b.tilGeo, sistPickup);'
            + '      });'
            // Beregn ankomst-tider for drops: start fra siste pickup, kumulativ reisetid mellom hver
            + '      const reisetidEstimat = (a, b) => (!a || !b) ? 5 : Math.ceil(haversineKm(a,b) * 2) + 3;'
            + '      let dropAnk = null;'
            + '      if (scheduledTimes && sorterte.length > 0) {'
            + '        const sistPickupTid = scheduledTimes[sorterte.length - 1];'
            + '        if (sistPickupTid !== null && sistPickupTid !== undefined) {'
            + '          dropAnk = new Array(dropSortert.length);'
            + '          let kum = sistPickupTid;'
            + '          let prevPos = sistPickup;'
            + '          dropSortert.forEach((t, di) => {'
            + '            const dT = reisetidEstimat(prevPos, t.tilGeo);'
            + '            kum += dT;'
            + '            dropAnk[di] = kum;'
            + '            prevPos = t.tilGeo;'
            + '          });'
            + '        }'
            + '      }'
            + '      sorterte.forEach((t, ti) => {'
            + '        const idx = TURER.indexOf(t);'
            + '        const bokstav = String.fromCharCode(65 + ti);'
            + '        let tidVis = "kl <b>" + esc(t.henteTid) + "</b>";'
            + '        if (scheduledTimes && scheduledTimes[ti] !== null && scheduledTimes[ti] !== undefined) {'
            + '          const orig = parseHHMM(t.henteTid);'
            + '          const ny = scheduledTimes[ti];'
            + '          if (orig !== null && ny !== orig) {'
            + '            const delta = ny - orig;'
            + '            const dKlasse = delta > 0 ? "delta-pos" : "delta-neg";'
            + '            tidVis += " → <span class=\\"ny-tid\\">" + fmtTid(ny) + "</span> <span class=\\"" + dKlasse + "\\">(" + (delta>0?"+":"") + delta + " min)</span>";'
            + '          }'
            + '        }'
            + '        html += "<div class=\\"tur\\" id=\\"tur-"+idx+"\\" onclick=\\"visTur(" + idx + ")\\">"'
            + '          + "<div class=\\"navn\\">" + lagPrefix(bokstav) + "<span class=\\"tag tag-pickup\\" style=\\"background:#10b981\\">Pickup</span> " + esc(t.navn) + "</div>"'
            + '          + "<div class=\\"tider-rad\\">" + tidVis + "</div>"'
            + '          + "<div class=\\"meta\\">" + esc(t.fra) + "</div>"'
            + '          + "</div>";'
            + '      });'
            + '      dropSortert.forEach((t, ti) => {'
            + '        const idx = TURER.indexOf(t);'
            + '        const bokstav = String.fromCharCode(65 + sorterte.length + ti);'
            + '        let tidVis = "kl <b>" + esc(t.oppTid || "?") + "</b>";'
            + '        if (dropAnk && dropAnk[ti] !== null && dropAnk[ti] !== undefined) {'
            + '          tidVis = "ank <b>" + fmtTid(dropAnk[ti]) + "</b>";'
            + '          const orig = parseHHMM(t.oppTid);'
            + '          if (orig !== null && dropAnk[ti] !== orig) {'
            + '            const delta = dropAnk[ti] - orig;'
            + '            const dKlasse = delta > 0 ? "delta-pos" : "delta-neg";'
            + '            tidVis += " <span style=\\"color:#94a3b8;\\">(orig " + esc(t.oppTid) + ", " + (delta>0?"+":"") + delta + " min)</span>";'
            + '          }'
            + '        }'
            + '        html += "<div class=\\"tur\\" id=\\"drop-"+idx+"\\" onclick=\\"visTur(" + idx + ")\\">"'
            + '          + "<div class=\\"navn\\">" + lagPrefix(bokstav) + "<span class=\\"tag tag-drop\\" style=\\"background:#7c3aed\\">Drop</span> " + esc(t.navn) + "</div>"'
            + '          + "<div class=\\"tider-rad\\">" + tidVis + "</div>"'
            + '          + "<div class=\\"meta\\">" + esc(t.til) + "</div>"'
            + '          + "</div>";'
            + '      });'
            + '    } else {'
            + '      sorterte.forEach((t, ti) => {'
            + '        const idx = TURER.indexOf(t);'
            // Felles-fra: A er pickup (ikke en tur), så turer er B,C,D...
            // Felles-til: turer er pickups A,B,C..., siste er drop (ikke en tur)
            + '        let bokstav = "";'
            + '        if (g.felles === "fra") bokstav = String.fromCharCode(66 + ti);'
            + '        else if (g.felles === "til") bokstav = String.fromCharCode(65 + ti);'
            + '        const prefix = g.felles ? "<span style=\\"display:inline-block;width:18px;height:18px;background:"+farge+";color:#fff;border-radius:50%;font-size:11px;font-weight:700;text-align:center;line-height:18px;margin-right:6px;\\">"+bokstav+"</span>" : "";'
            + '        const hH = parseHHMM(t.henteTid), hO = parseHHMM(t.oppTid);'
            + '        const retning = (hH === null || hO === null) ? "ukjent" : (hH >= hO ? "retur" : "tur");'
            + '        const retLabel = retning === "ukjent" ? "?" : (retning === "retur" ? "Retur" : "Tur");'
            + '        const retTag = "<span class=\\"tag tag-" + retning + "\\" title=\\"" + (retning==="retur"?"Hent ≥ Opp = retur (kan kun forsinke)":"Hent < Opp = tur (kan kun fremskynde)") + "\\">" + retLabel + "</span>";'
            + '        const tH = parseHHMM(t.henteTid);'
            + '        let foreslaattTid = null, delta = null, klasseEndret = "";'
            + '        if (scheduledTimes && tH !== null) {'
            + '          foreslaattTid = scheduledTimes[ti];'
            + '          delta = foreslaattTid - tH;'
            + '          if (delta > 0) klasseEndret = " changed";'
            + '          else if (delta < 0) klasseEndret = " changed changed-down";'
            + '        }'
            + '        let deltaTekst = "";'
            + '        if (foreslaattTid !== null && tH !== null) {'
            + '          if (delta === 0) deltaTekst = " <span class=\\"delta-null\\">(±0)</span>";'
            + '          else { const dKlasse = delta > 0 ? "delta-pos" : "delta-neg"; deltaTekst = " → <span class=\\"ny-tid\\">" + fmtTid(foreslaattTid) + "</span> <span class=\\"" + dKlasse + "\\">(" + (delta>0?"+":"") + delta + " min)</span>"; }'
            + '        }'
            + '        html += "<div class=\\"tur" + klasseEndret + "\\" id=\\"tur-"+idx+"\\" onclick=\\"visTur(" + idx + ")\\">"'
            + '          + "<div class=\\"navn\\">" + prefix + "<span class=\\"tag tag-"+t.type+"\\">"+t.type+"</span>" + retTag + " " + esc(t.navn) + (t.behov ? " <span style=\\"color:#94a3b8;font-weight:400;font-size:11px;\\">· " + esc(t.behov) + "</span>" : "") + "</div>"'
            + '          + "<div class=\\"tider-rad\\"><span><b>Hent:</b> " + esc(t.henteTid) + deltaTekst + "</span>" + (t.oppTid ? "<span><b>Opp:</b> " + esc(t.oppTid) + "</span>" : "") + "</div>"'
            + '          + "<div class=\\"meta\\">" + esc(t.fra) + " → " + esc(t.til) + "</div>"'
            + '          + "</div>";'
            + '      });'
            + '    }'
            // Liten oppsummering: detaljerte deltaer er på selve kortene
            + '    if (gapAdvarsel) {'
            + '      html += "<div style=\\"margin-top:6px;padding:6px 10px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);border-radius:4px;font-size:11px;color:#fca5a5;font-weight:600;\\">" + gapAdvarsel + "</div>";'
            + '    } else if (g.felles && !g.eksaktMatch) {'
            + '      html += "<div style=\\"margin-top:6px;padding:5px 10px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:4px;font-size:10px;color:#c4b5fd;\\">Ulike adresser i samme strøk — operatør vurderer rute og tidsendring manuelt</div>";'
            + '    } else if (g.felles && fellesTid !== null) {'
            + '      let label;'
            + '      if (g.felles === "fra") label = "Felles henting kl <b style=\\"color:#bfdbfe;\\">" + fmtTid(fellesTid) + "</b> — Retur, kun forsinkelse OK";'
            + '      else label = "Sekvensiell pickup, −5 min per stopp — Tur, kun fremskyndelse OK";'
            + '      html += "<div style=\\"margin-top:6px;padding:5px 10px;background:rgba(59,130,246,0.08);border-radius:4px;font-size:10px;color:#94a3b8;\\">" + label + "</div>";'
            + '    } else if (g.felles && fellesTid === null) {'
            + '      html += "<div style=\\"margin-top:6px;padding:5px 10px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:4px;font-size:10px;color:#fbbf24;\\">⚠ Blandet retning — kan ikke foreslå felles tid</div>";'
            + '    }'
            + '    html += "</div>";'
            + '  });'
            + '  el.innerHTML = html;'
            + '  analyserMedKjerne();'  // par-analyse fra delt kjerne (no-op hvis ikke 2 turer / alt kjørt)
            + '}'
            // Samkjørings-analyse fra DELT KJERNE (samkjoring_kjerne.js): kjøres når nøyaktig 2 turer
            // er markert. Viser kapasitet + omkjøring for siste pasient + kjørerekkefølge i panelet,
            // og tegner rutet trasé (grønn) med nummererte stopp på Google-kartet.
            + 'let kjerneKjort = false, kjerneResultat = null, kjerneTegnet = false;'
            // Tegning er SKILT fra analysen: analysen kan bli ferdig FØR Google Maps har init
            // (opener trigger byggListe tidlig) — da lagres resultatet og tegnes når kartet finnes.
            + 'function tegnKjerneRute(){'
            + '  if (kjerneTegnet || !kjerneResultat || !map || !window.L) return;'
            + '  kjerneTegnet = true;'
            + '  const r = kjerneResultat;'
            // Rydd bort gammel gruppe-visning (luftlinjer + F/T-markører) — kjerne-ruta erstatter den.
            // tegnKjerneRute kjører alltid ETTER tegnAlle (initMap-rekkefølge / async analyse), så
            // dette fjerner alt gammelt uansett hvem som vant kappløpet.
            + '  fjernLag(polylinjer);'
            + '  fjernLag(markører);'
            + '  (r.ruteSegmenter || []).forEach(seg => {'
            + '    const path = seg.geometri.map(p => [p[0], p[1]]);'
            + '    polylinjer.push(mkLinje(path, {color: "#0b1220", opacity: 0.5, weight: 8}));'
            + '    polylinjer.push(mkLinje(path, {color: "#22c55e", opacity: seg.fallback ? 0.5 : 1, weight: 4}));'
            + '  });'
            + '  (r.rekkefolge || []).forEach(st => {'
            + '    markører.push(mkMarker({lat: st.ll[0], lng: st.ll[1]}, {text: String(st.nr), farge: st.delt ? "#a855f7" : "#22c55e", fyll: 1, scale: 13}));'
            + '  });'
            // Zoom til ruta (gammel tegnAlle-fitBounds kjører ikke i par-modus)
            + '  if (r.bounds && r.bounds.length) {'
            + '    map.fitBounds(r.bounds.map(p => [p[0], p[1]]), {padding: [30, 30]});'
            + '  }'
            + '}'
            + 'async function analyserMedKjerne(){'
            + '  const TURER = window.TURER_DATA || [];'
            + '  const K = window.__samkjoringKjerne;'
            + '  const el = document.getElementById("kjerneAnalyse");'
            + '  if (!el || !K || TURER.length < 1 || kjerneKjort) return;'
            // ADMIN-KRAV: analysen kjører kun når BEGGE turene har adresser fra rekvisisjonen
            // (adrKilde=admin). Tabellens visningsnavn er ikke adressegrunnlag.
            + '  const utenAdmin = TURER.filter(t => t.adrKilde !== "admin");'
            + '  if (utenAdmin.length) {'
            + '    kjerneKjort = true;'
            + '    el.innerHTML = "<div style=\\"padding:10px 14px;border-bottom:1px solid #334155;background:rgba(251,191,36,0.08);\\">"'
            + '      + "<div style=\\"font-size:11px;font-weight:700;color:#fbbf24;\\">⚠ Samkjørings-analyse krever adresser fra admin</div>"'
            + '      + utenAdmin.map(t => "<div style=\\"font-size:11px;color:#cbd5e1;margin-top:3px;\\">" + esc(t.navn) + ": " + esc(t.adrFeil || "ukjent årsak") + "</div>").join("")'
            + '      + "<div style=\\"font-size:10px;color:#94a3b8;margin-top:5px;\\">Tips: sjekk at admin-modulen er innlogget (grønn prikk i verktøykassen). Adressene hentes fra rekvisisjonen.</div>"'
            + '      + "</div>";'
            + '    return;'
            + '  }'
            // Bruk Googles geokoding (treffer institusjonsnavn som «Ahus-Lørenskog/Ortopedisk …»
            // langt bedre enn Geonorge). Mangler geo og geocoderen ikke er klar ennå → vent;
            // initMap kaller analyserMedKjerne igjen etter geocodeAlle.
            + '  const harGeo = TURER.every(t => t.fraGeo && t.tilGeo);'
            + '  const geocoderKlar = geoKlar;'
            + '  if (!harGeo && !geocoderKlar) return;'
            + '  kjerneKjort = true;'
            + '  el.innerHTML = "<div style=\\"padding:8px 14px;font-size:11px;color:#94a3b8;font-style:italic;\\">Analyserer samkjøring…</div>";'
            + '  try {'
            + '    if (!harGeo) { for (const t of TURER) { if (t.fra && !t.fraGeo) t.fraGeo = await geo(t.fra); if (t.til && !t.tilGeo) t.tilGeo = await geo(t.til); } }'
            // KM via ruter.php (Geonorge+ORS = GRATIS). Google brukes kun til selve kart-bildet, ikke
            // til distanser (minst-mulig-Google-policy). Re-aktiver Google-presise km (krever billing)
            // ved å legge tilbake andre-argumentet { distFn: googleDist }. googleDist beholdes ubrukt.
            + '    const r = await K.analyserSamkjoring(TURER.map(t => ({pnavn: t.navn, fra: t.fra, til: t.til, behov: t.behov || "", fraLL: t.fraGeo ? [t.fraGeo.lat, t.fraGeo.lng] : undefined, tilLL: t.tilGeo ? [t.tilGeo.lat, t.tilGeo.lng] : undefined})));'
            + '    if (!r || r.feil) { el.innerHTML = ""; kjerneKjort = false; return; }'
            // ENKELTUR (N=1): ingen samkjøring å vurdere — vis bare ruta hent→lever + km/min, og tegn den.
            + '    if (TURER.length === 1) {'
            + '      const o0 = (r.omkjoringPerPasient || [])[0] || {};'
            + '      const kmTxt = (o0.direkteKm != null) ? (o0.direkteKm + " km · " + fmtMin(o0.direkteMin)) : "";'
            + '      const rf = r.rekkefolge || [];'
            // Bruk turens FAKTISKE admin-adresser (TURER[0].fra/til). Kjernens rekkefølge kan kollapse til
            // ett punkt for enkelttur → viste samme adresse på begge linjer. Admin-data er fasit.
            + '      const t0 = TURER[0] || {};'
            + '      const fraAdr = t0.fra || (rf[0] ? (rf[0].adr || "") : "");'
            + '      const tilAdr = t0.til || (rf.length ? (rf[rf.length-1].adr || "") : "");'
            + '      el.innerHTML = "<div style=\\"padding:10px 14px;border-bottom:1px solid #334155;background:#0c2a4a;\\">"'
            + '        + "<div style=\\"font-size:11px;font-weight:700;color:#bfdbfe;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:5px;\\">🚗 Enkeltur</div>"'
            + '        + (kmTxt ? "<div style=\\"font-size:14px;font-weight:700;color:#22c55e;\\">" + kmTxt + "</div>" : "")'
            + '        + "<div style=\\"font-size:11.5px;color:#cbd5e1;margin-top:5px;\\">🟢 " + esc(fraAdr) + "</div>"'
            + '        + "<div style=\\"font-size:11.5px;color:#cbd5e1;margin-top:2px;\\">🔴 " + esc(tilAdr) + "</div>"'
            + '        + "<button id=\\"annenAdrBtn\\" style=\\"margin-top:10px;width:100%;padding:7px;background:#7c3aed;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;\\">📍 Annen adresse</button>"'
            + '        + "<div id=\\"annenAdrBox\\"></div>"'
            + '        + "</div>";'
            + '      const _ab = document.getElementById("annenAdrBtn");'
            + '      if (_ab) _ab.onclick = () => annenAdresseUI((window.TURER_DATA || [])[0] || {}, fraAdr, tilAdr);'
            + '      const gl1 = document.getElementById("liste-inner"); if (gl1) gl1.style.display = "none";'
            + '      kjerneResultat = r; tegnKjerneRute(); return;'
            + '    }'
            + '    const kap = r.kapasitet || {};'
            + '    const hhmm = m => (m==null)?"?":(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));'
            + '    const MAKS_JUST_GULV = 60;'  // grunngrense for tids-justering (min)
            // Langtransport: en pasient kan flyttes mer, ~tilsvarende reisetiden. Grensa skalerer
            // derfor med turens lengde (direkte reisetid for den lengst-kjørende pasienten).
            + '    const reisetid = (r.omkjoringSiste && r.omkjoringSiste.direkteMin) || 0;'
            + '    const maksJustMin = Math.max(MAKS_JUST_GULV, reisetid);'
            + '    let maxSpread = 0;'          // største nødvendige hentetids-justering (min) — settes i lista'
            // ÉN liste: kjørerekkefølgen med tider. Pickup viser felles hentetid (retnings-regel:
            // retur=seneste/kun forsinkelse, tur=tidligste/kun fremskyndelse). Levering viser pasient.
            // Starttid = første stopps hentetid. Justerings-hint når hentetidene må samkjøres.
            + '    let startMin = null, startRegel = "";'
            + '    let rekkeHtml = "";'
            + '    (r.rekkefolge || []).forEach(st => {'
            + '      const hentes = st.deler.filter(d => d.rolle === "hentes");'
            + '      let tidHtml = "", justering = "", justFarge = "#fbbf24";'
            + '      if (hentes.length) {'
            + '        const tider = hentes.map(d => parseHHMM(TURER[d.tur] ? TURER[d.tur].henteTid : null)).filter(t => t!==null);'
            + '        const retn = hentes.map(d => { const t=TURER[d.tur]||{}; const h=parseHHMM(t.henteTid),o=parseHHMM(t.oppTid); return (h==null||o==null)?"?":(h>=o?"retur":"tur"); });'
            + '        const alleRetur = retn.length && retn.every(x=>x==="retur"), alleTur = retn.length && retn.every(x=>x==="tur");'
            + '        let felles = null, regel = "";'
            + '        if (tider.length) {'
            + '          if (alleRetur) { felles = Math.max.apply(null,tider); regel = "kun forsinkelse OK"; }'
            + '          else if (alleTur) { felles = Math.min.apply(null,tider); regel = "kun fremskyndelse OK"; }'
            + '          else { felles = Math.min.apply(null,tider); regel = "blandet retning"; }'
            + '          tidHtml = "<span style=\\"color:#22c55e;font-weight:700;\\">kl " + hhmm(felles) + "</span>";'
            + '          const spread = tider.length>1 ? (Math.max.apply(null,tider)-Math.min.apply(null,tider)) : 0;'
            + '          if (spread > maxSpread) maxSpread = spread;'
            + '          if (spread > 0) {'
            + '            const forStor = spread > maksJustMin;'
            + '            justFarge = forStor ? "#fca5a5" : "#fbbf24";'
            + '            justering = (forStor?"⛔ ":"⚠ ") + "ulike hentetider (" + tider.map(hhmm).join(", ") + ") — juster " + spread + " min til kl " + hhmm(felles) + (forStor?" — OVER grensa (" + maksJustMin + " min)!":(regel?" ("+regel+")":""));'
            + '          }'
            + '          if (startMin===null) { startMin = felles; startRegel = regel; }'
            + '        }'
            + '      }'
            + '      const ikon = hentes.length ? "🟢" : "🔴";'
            + '      const rolleTxt = hentes.length ? "Hentes" : "Leveres";'
            + '      const navn = st.deler.map(d => esc(d.pnavn)).filter((v,i,a)=>a.indexOf(v)===i).join(", ");'
            + '      const farge = st.delt ? "#a855f7" : (hentes.length ? "#22c55e" : "#64748b");'
            + '      rekkeHtml += "<div style=\\"display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-top:1px solid #1e293b;\\">"'
            + '        + "<span style=\\"display:inline-block;width:22px;height:22px;background:" + farge + ";color:#fff;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;flex-shrink:0;\\">" + st.nr + "</span>"'
            + '        + "<div style=\\"flex:1;font-size:12px;\\"><div>" + ikon + " <span style=\\"color:#94a3b8;\\">" + rolleTxt + ":</span> <b>" + navn + "</b>" + (tidHtml?" &nbsp;"+tidHtml:"") + "</div>"'
            + '        + "<div style=\\"color:#64748b;font-size:10.5px;margin-top:1px;\\">" + esc(st.adr || "") + "</div>"'
            + '        + (justering ? "<div style=\\"color:" + justFarge + ";font-size:10.5px;margin-top:2px;\\">" + justering + "</div>" : "")'
            + '        + "</div></div>";'
            + '    });'
            // Samlet dom: kapasitet + tids-justering (60-min-regel, skalert for langtransport).
            // FEIL i én av dem = stor rød «kan ikke samkjøres»-banner med alle grunner.
            + '    const blokkGrunner = [];'
            + '    if (!kap.ok) blokkGrunner.push(esc(kap.grunn || "Kapasitet feiler"));'
            + '    if (maxSpread > maksJustMin) blokkGrunner.push("Krever justering på " + maxSpread + " min — maks " + maksJustMin + " min er lov" + (reisetid>MAKS_JUST_GULV?" (skalert for langtransport)":""));'
            // INGEN grønn «Kan samkjøres» — til alle algoritmene er gjennomprøvde gir et grønt «ja»
            // falskt klarsignal. Vis kun røde harde blokker + SV-advarsel; operatøren vurderer selv.
            + '    const kapHtml = blokkGrunner.length'
            + '      ? "<div style=\\"margin-bottom:8px;padding:9px 11px;background:#7f1d1d;border:2px solid #ef4444;border-radius:7px;\\"><div style=\\"font-size:14px;font-weight:800;color:#fff;letter-spacing:0.3px;\\">⛔ KAN IKKE SAMKJØRES</div><div style=\\"font-size:12px;color:#fecaca;margin-top:3px;font-weight:600;\\">" + blokkGrunner.map(g => "• " + g).join("<br>") + "</div></div>"'
            + '      : (kap.svVarsel ? "<div style=\\"font-size:12px;margin-bottom:6px;color:#fbbf24;font-weight:700;\\">⚠ SV — sjekk bagasje</div>" : "");'
            // Oppsummering: BASELINE (direkte enkelt-tur) + omkjøring PER pasient + total gevinst.
            // Avslører den dårlige passasjeren (høy omkjøring) og om samkjøringen lønner seg totalt.
            + '    let omkSummary = "";'
            + '    const pp = r.omkjoringPerPasient || [];'
            + '    if (pp.length) {'
            + '      const rader = pp.map(o => {'
            + '        const pf = o.pct >= 40 ? "#ef4444" : (o.pct >= 20 ? "#fbbf24" : "#10b981");'
            + '        return "<div style=\\"display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:4px 0;border-top:1px solid #1e293b;\\">"'
            + '          + "<div style=\\"font-size:11px;\\"><b>" + esc(o.navn) + "</b><div style=\\"color:#64748b;font-size:10px;margin-top:1px;\\">direkte " + o.direkteKm + " km / " + fmtMin(o.direkteMin) + " → " + o.samkjortKm + " km / " + fmtMin(o.samkjortMin) + "</div></div>"'
            + '          + "<div style=\\"color:" + pf + ";font-weight:700;font-size:12px;white-space:nowrap;\\">+" + o.min + " min<br>+" + o.pct + " %</div></div>";'
            + '      }).join("");'
            + '      let gevHtml = "";'
            + '      if (r.gevinst) {'
            + '        const g = r.gevinst, gf = g.sparKm >= 0 ? "#10b981" : "#ef4444";'
            + '        gevHtml = "<div style=\\"margin-top:5px;padding-top:5px;border-top:1px solid #334155;font-size:11px;\\">"'
            + '          + "<span style=\\"color:#94a3b8;\\">Gevinst:</span> " + pp.length + " enkeltturer <b>" + g.sumDirekteKm + " km / " + fmtMin(g.sumDirekteMin) + "</b> → samkjørt <b>" + g.samkjortKm + " km / " + fmtMin(g.samkjortMin) + "</b> "'
            + '          + "<span style=\\"color:" + gf + ";font-weight:700;\\">(" + (g.sparKm>=0?"spar ":"+") + Math.abs(g.sparKm) + " km, " + (g.sparMin>=0?"spar ":"+") + Math.abs(g.sparMin) + " min)</span></div>";'
            + '      }'
            + '      omkSummary = "<div style=\\"margin-top:10px;padding:8px 10px;background:rgba(255,255,255,0.04);border-radius:6px;\\">"'
            + '        + "<div style=\\"font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;\\">Omvei per pasient (direkte → i samkjøring)</div>"'
            + '        + rader + gevHtml + "</div>";'
            + '    }'
            + '    el.innerHTML = "<div style=\\"padding:10px 14px;border-bottom:1px solid #334155;background:#0c2a4a;\\">"'
            + '      + "<div style=\\"font-size:11px;font-weight:700;color:#bfdbfe;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;\\">🔗 Samkjøring</div>"'
            + '      + kapHtml'
            + '      + (startMin!==null ? "<div style=\\"font-size:13px;font-weight:700;margin-bottom:2px;\\">▶ Start kl " + hhmm(startMin) + (startRegel?" <span style=\\"font-size:10px;font-weight:400;color:#94a3b8;\\">("+startRegel+")</span>":"") + "</div>" : "")'
            + '      + rekkeHtml + omkSummary + "</div>";'
            // Skjul gamle gruppe-lista i par-modus — den brukte egen A/B/C-merking som ikke
            // matcher kartets 1/2/3, og all info er nå i analyse-panelet.
            + '    const gl = document.getElementById("liste-inner");'
            + '    if (gl) gl.style.display = "none";'
            // Lagre resultatet og tegn (tegnKjerneRute er no-op til kartet finnes; initMap kaller den også)
            + '    kjerneResultat = r;'
            + '    tegnKjerneRute();'
            + '  } catch(e) { el.innerHTML = ""; kjerneKjort = false; console.warn("kjerne-analyse feilet:", e); }'
            + '}'
            + 'async function tegnAlle(){'
            // Par-modus m/ kjerne: IKKE tegn gammel gruppe-visning (luftlinjer) i det hele tatt —
            // kjerne-ruta er eneste visning. Unngår «luftlinje blinker først, så erstattes».
            + '  if ((window.TURER_DATA || []).length >= 1 && window.__samkjoringKjerne) { tegnKjerneRute(); return; }'
            + '  const bounds = mkBounds();'
            + '  GRUPPER.forEach((g, gi) => {'
            + '    const farge = FARGER[gi % FARGER.length];'
            + '    if (g.felles === "fra" && g.eksaktMatch) {'
            // Felles henting (eksakt samme adresse): A = pickup, B/C/D... = drop-offs i rekkefølge
            + '      const fraPos = g.turer[0].fraGeo;'
            + '      if (fraPos) {'
            + '        const navnliste = g.turer.map(t => t.navn).join(", ");'
            + '        markører.push(mkMarker(fraPos, {text: "A", title: "A — Felles pickup: " + g.turer[0].fra + " | " + navnliste, farge: farge, fyll: 1, scale: 14}));'
            + '        bounds.extend(fraPos);'
            + '      }'
            + '      const drops = g.turer.filter(t => t.tilGeo).slice().sort((a,b) => fraPos ? (haversineKm(fraPos, a.tilGeo) - haversineKm(fraPos, b.tilGeo)) : 0);'
            + '      const ruteSekvens = fraPos ? [fraPos] : [];'
            + '      drops.forEach((t, di) => {'
            + '        const bokstav = String.fromCharCode(66 + di);'
            + '        markører.push(mkMarker(t.tilGeo, {text: bokstav, title: bokstav + " — Drop: " + t.navn + " (" + t.til + ")", farge: farge, fyll: 0.7, scale: 12}));'
            + '        bounds.extend(t.tilGeo);'
            + '        ruteSekvens.push(t.tilGeo);'
            + '      });'
            + '      if (ruteSekvens.length >= 2) {'
            + '        polylinjer.push(mkLinje(ruteSekvens, {color: farge, opacity: 0.8, weight: 4}));'
            + '      }'
            + '    } else if (g.felles === "til" && g.eksaktMatch) {'
            // Felles destinasjon (eksakt samme adresse): A/B/C = pickups, siste bokstav = felles drop
            + '      const dropPos2 = g.turer[0].tilGeo;'
            + '      const pickups = g.turer.filter(t => t.fraGeo).slice().sort((a,b) => {'
            + '        if (!dropPos2) return 0;'
            + '        return haversineKm(b.fraGeo, dropPos2) - haversineKm(a.fraGeo, dropPos2);'
            + '      });'
            + '      const ruteSekvens = [];'
            + '      pickups.forEach((t, pi) => {'
            + '        const bokstav = String.fromCharCode(65 + pi);'
            + '        markører.push(mkMarker(t.fraGeo, {text: bokstav, title: bokstav + " — Pickup: " + t.navn + " kl " + t.henteTid + " (" + t.fra + ")", farge: farge, fyll: 1, scale: 13}));'
            + '        bounds.extend(t.fraGeo);'
            + '        ruteSekvens.push(t.fraGeo);'
            + '      });'
            + '      const tilPos = g.turer[0].tilGeo;'
            + '      if (tilPos) {'
            + '        const dropBokstav = String.fromCharCode(65 + pickups.length);'
            + '        const navnliste = g.turer.map(t => t.navn).join(", ");'
            + '        markører.push(mkMarker(tilPos, {text: dropBokstav, title: dropBokstav + " — Felles destinasjon: " + g.turer[0].til + " | " + navnliste, farge: farge, fyll: 0.7, scale: 14}));'
            + '        bounds.extend(tilPos);'
            + '        ruteSekvens.push(tilPos);'
            + '      }'
            + '      if (ruteSekvens.length >= 2) {'
            + '        polylinjer.push(mkLinje(ruteSekvens, {color: farge, opacity: 0.8, weight: 4}));'
            + '      }'
            + '    } else if (g.felles && !g.eksaktMatch) {'
            // Sekvensiell: rute = pickups (fjernest fra drop-sentroid først) → drops
            // (nærmest siste pickup først). Det unngår slalåm-rute.
            + '      const dropPunkter = g.turer.filter(t => t.tilGeo).map(t => t.tilGeo);'
            + '      const dropC = dropPunkter.length > 0 ? {lat: dropPunkter.reduce((s,p)=>s+p.lat,0)/dropPunkter.length, lng: dropPunkter.reduce((s,p)=>s+p.lng,0)/dropPunkter.length} : null;'
            + '      const pickupSortert = g.turer.slice().sort((a,b) => {'
            + '        if (!dropC || !a.fraGeo || !b.fraGeo) return 0;'
            + '        return haversineKm(b.fraGeo, dropC) - haversineKm(a.fraGeo, dropC);'
            + '      });'
            + '      const ruteSekvens = [];'
            + '      pickupSortert.forEach((t, ti) => {'
            + '        if (t.fraGeo) {'
            + '          const bokstav = String.fromCharCode(65 + ti);'
            + '          markører.push(mkMarker(t.fraGeo, {text: bokstav, title: bokstav + " — Pickup: " + t.navn + " kl " + t.henteTid + " (" + t.fra + ")", farge: farge, fyll: 1, scale: 13}));'
            + '          bounds.extend(t.fraGeo);'
            + '          ruteSekvens.push(t.fraGeo);'
            + '        }'
            + '      });'
            // Drop-rekkefølge: nærmest siste pickup først (fortsetter ruten naturlig)
            + '      const sistPickup = pickupSortert.length > 0 ? pickupSortert[pickupSortert.length-1].fraGeo : null;'
            + '      const dropSortert = g.turer.slice().sort((a,b) => {'
            + '        if (!sistPickup || !a.tilGeo || !b.tilGeo) return 0;'
            + '        return haversineKm(a.tilGeo, sistPickup) - haversineKm(b.tilGeo, sistPickup);'
            + '      });'
            + '      dropSortert.forEach((t, ti) => {'
            + '        if (t.tilGeo) {'
            + '          const bokstav = String.fromCharCode(65 + pickupSortert.length + ti);'
            + '          markører.push(mkMarker(t.tilGeo, {text: bokstav, title: bokstav + " — Drop: " + t.navn + " (" + t.til + ")", farge: farge, fyll: 0.7, scale: 12}));'
            + '          bounds.extend(t.tilGeo);'
            + '          ruteSekvens.push(t.tilGeo);'
            + '        }'
            + '      });'
            + '      if (ruteSekvens.length >= 2) {'
            + '        polylinjer.push(mkLinje(ruteSekvens, {color: farge, opacity: 0.8, weight: 4}));'
            + '      }'
            + '    } else {'
            // Singletons: F + T som før
            + '      const t = g.turer[0];'
            + '      if (t.fraGeo) {'
            + '        markører.push(mkMarker(t.fraGeo, {text: "F", title: t.navn + " — Fra: " + t.fra + " kl " + t.henteTid, farge: farge, fyll: 1, scale: 12}));'
            + '        bounds.extend(t.fraGeo);'
            + '      }'
            + '      if (t.tilGeo) {'
            + '        markører.push(mkMarker(t.tilGeo, {text: "T", title: t.navn + " — Til: " + t.til, farge: farge, fyll: 0.5, scale: 12}));'
            + '        bounds.extend(t.tilGeo);'
            + '      }'
            + '      if (t.fraGeo && t.tilGeo) {'
            + '        polylinjer.push(mkLinje([t.fraGeo, t.tilGeo], {color: farge, opacity: 0.6, weight: 3}));'
            + '      }'
            + '    }'
            + '  });'
            + '  if (!bounds.isEmpty()) map.fitBounds(bounds.arr, {padding: [30, 30]});'
            + '}'
            + 'function visTur(i){'
            + '  document.querySelectorAll(".tur").forEach(el => el.classList.remove("aktiv"));'
            + '  const el = document.getElementById("tur-"+i);'
            + '  if (el) el.classList.add("aktiv");'
            + '  const t = (window.TURER_DATA || [])[i];'
            + '  if (t && t.fraGeo) map.panTo(t.fraGeo);'
            + '}'
            // Leg-tid mellom to stopp — fritt haversine-estimat (Google DistanceMatrix er borte med
            // stengt billing). Veifaktor 1.4 ≈ kjørevei, ~45 km/t i by + 2 min stopp-margin.
            + 'async function googleReisetid(origin, destination){'
            + '  if (!origin || !destination) return 5;'
            + '  return Math.ceil(haversineKm(origin, destination) * 1.4 / 45 * 60) + 2;'
            + '}'
            // Hent reisetider for alle sekvensielle grupper. Lagrer leg-tider på g.legTider
            // (pickupLeg[i] = tid fra pickup[i] til pickup[i+1]; dropLeg[j] = tid fra siste pickup
            // eller drop[j-1] til drop[j]).
            + 'async function hentRuteTider(){'
            + '  const TURER = window.TURER_DATA || [];'
            + '  for (const g of GRUPPER) {'
            + '    if (!(g.felles && !g.eksaktMatch)) continue;'
            // Pickup-rekkefølge: fjernest fra drop-sentroid først (samme som byggListe/tegnAlle)
            + '    const dropPunkter = g.turer.filter(t => t.tilGeo).map(t => t.tilGeo);'
            + '    const dropC = dropPunkter.length > 0 ? {lat: dropPunkter.reduce((s,p)=>s+p.lat,0)/dropPunkter.length, lng: dropPunkter.reduce((s,p)=>s+p.lng,0)/dropPunkter.length} : null;'
            + '    const pickupSortert = g.turer.slice().sort((a,b) => {'
            + '      if (!dropC || !a.fraGeo || !b.fraGeo) return 0;'
            + '      return haversineKm(b.fraGeo, dropC) - haversineKm(a.fraGeo, dropC);'
            + '    });'
            + '    const sistPickup = pickupSortert.length > 0 ? pickupSortert[pickupSortert.length-1].fraGeo : null;'
            + '    const dropSortert = g.turer.slice().sort((a,b) => {'
            + '      if (!sistPickup || !a.tilGeo || !b.tilGeo) return 0;'
            + '      return haversineKm(a.tilGeo, sistPickup) - haversineKm(b.tilGeo, sistPickup);'
            + '    });'
            // Pickup-legs (mellom konsekutive pickups)
            + '    const pickupLeg = [];'
            + '    for (let i = 1; i < pickupSortert.length; i++) {'
            + '      pickupLeg.push(await googleReisetid(pickupSortert[i-1].fraGeo, pickupSortert[i].fraGeo));'
            + '    }'
            // Drop-legs (siste pickup → første drop, så drop → drop)
            + '    const dropLeg = [];'
            + '    if (sistPickup && dropSortert.length > 0 && dropSortert[0].tilGeo) {'
            + '      dropLeg.push(await googleReisetid(sistPickup, dropSortert[0].tilGeo));'
            + '      for (let i = 1; i < dropSortert.length; i++) {'
            + '        dropLeg.push(await googleReisetid(dropSortert[i-1].tilGeo, dropSortert[i].tilGeo));'
            + '      }'
            + '    }'
            + '    g.pickupLeg = pickupLeg;'
            + '    g.dropLeg = dropLeg;'
            + '  }'
            + '}'
            + 'async function initMap(){'
            + '  map = L.map("kart", {zoomControl: false, attributionControl: false}).setView([59.92, 10.75], 11);'
            + '  L.control.zoom({position: "topright"}).addTo(map);'
            + '  byggBaseVelg();'
            + '  settBasis(kartBasis);'
            + '  geoKlar = true;'
            // TURER_DATA settes av opener ETTER async byggTurer — vent på den (Google kjørte initMap via
            // async callback som rakk å vente; vår synkrone Leaflet-init må polle selv).
            + '  let _n = 0; while ((!window.TURER_DATA || !window.TURER_DATA.length) && _n < 300) { await new Promise(r => setTimeout(r, 50)); _n++; }'
            + '  try { map.invalidateSize(); } catch(_) {}'  // popup-container kan måles til 0x0 ved init
            + '  await geocodeAlle();'
            + '  GRUPPER = lagGrupper();'
            + '  await hentRuteTider();'
            + '  byggListe();'
            + '  tegnAlle();'
            + '  analyserMedKjerne();'  // delt kjerne: par-analyse (no-op hvis ikke 2 turer)
            + '  tegnKjerneRute();'     // tegn rute hvis analysen ble ferdig FØR kartet (race-fiks)
            + '}'
            // ── ANNEN ADRESSE (enkelttur): Geonorge-autocomplete + km-sammenligning + tegning ──
            // Pasienten vil til en annen adresse enn hjemme. Sjekk om alternativet er KORTERE enn
            // opprinnelig (målt til det faste endepunktet = behandlingsstedet). Beslutningsstøtte.
            + 'function annenAdresseUI(t, fraAdr, tilAdr){'
            + '  const box = document.getElementById("annenAdrBox"); if (!box) return;'
            + '  if (box.dataset.open === "1"){ box.innerHTML=""; box.dataset.open=""; return; }'
            + '  box.dataset.open="1";'
            // Retning avgjør hvilken ende som kan byttes: TUR → henteadresse (fra), RETUR → returadresse (til).
            // Behandlingsstedet er alltid det faste endepunktet og kan ikke endres. (henteTid >= oppmøte = retur.)
            + '  const _h = parseHHMM(t.henteTid), _o = parseHHMM(t.oppTid);'
            + '  let retur = (_h!=null && _o!=null) ? (_h >= _o) : null;'
            // v1.110: admin-plakatens «Til / Fra behandling» er FASIT og trumfer tids-heuristikken —
            // P-rader kan mangle tidskolonner helt, og heuristikken kan bomme på tette tider.
            + '  if (t.retning) { if (/fra\\s+behandling/i.test(t.retning)) retur = true; else if (/til\\s+behandling/i.test(t.retning)) retur = false; }'
            + '  let bytt = (retur === false) ? "fra" : "til";'
            + '  const retLabel = (retur === false) ? "🟢 Tur til behandling — endrer henteadresse" : (retur === true ? "🔴 Retur fra behandling — endrer returadresse" : "⚠ Retning ukjent — velg hvilken ende");'
            + '  box.innerHTML = "<div id=\\"aaRetning\\" style=\\"margin-top:8px;padding:6px 9px;border-radius:5px;background:rgba(124,58,237,0.12);border:1px solid #7c3aed;font-size:11px;color:#c4b5fd;\\">"+retLabel+"</div>"'
            + '    + "<input id=\\"aaInput\\" placeholder=\\"Skriv adresse…\\" autocomplete=\\"off\\" style=\\"margin-top:6px;width:100%;padding:7px 9px;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:6px;font-size:12px;\\">"'
            + '    + "<div id=\\"aaForslag\\" style=\\"background:#0f172a;border:1px solid #334155;border-top:none;max-height:160px;overflow-y:auto;border-radius:0 0 6px 6px;\\"></div>"'
            + '    + "<div id=\\"aaResultat\\" style=\\"margin-top:8px;\\"></div>";'
            + '  if (retur === null) {'   // retning ukjent → la operatøren velge ende manuelt (fallback)
            + '    const rl = document.getElementById("aaRetning");'
            + '    rl.insertAdjacentHTML("beforeend", "<div style=\\"margin-top:5px;display:flex;gap:6px;\\"><button data-bytt=\\"fra\\" class=\\"aa-tg\\" style=\\"flex:1;padding:4px;border-radius:4px;border:1px solid #334155;background:#1e293b;color:#cbd5e1;cursor:pointer;\\">Hentested 🟢</button><button data-bytt=\\"til\\" class=\\"aa-tg\\" style=\\"flex:1;padding:4px;border-radius:4px;border:1px solid #334155;background:#7c3aed;color:#fff;cursor:pointer;\\">Leveringssted 🔴</button></div>");'
            + '    rl.querySelectorAll(".aa-tg").forEach(b => b.onclick = () => { bytt = b.dataset.bytt; rl.querySelectorAll(".aa-tg").forEach(x => { const on = x.dataset.bytt===bytt; x.style.background = on?"#7c3aed":"#1e293b"; x.style.color = on?"#fff":"#cbd5e1"; }); });'
            + '  }'
            + '  const inp = document.getElementById("aaInput"), fEl = document.getElementById("aaForslag"); let timer=null;'
            + '  inp.addEventListener("input", () => { clearTimeout(timer); const q = inp.value.trim(); if (q.length<3){ fEl.innerHTML=""; return; }'
            + '    timer = setTimeout(async () => { try {'
            + '      const d = await fetch("https://thomaswestby.no/skript/geokod_sok.php?q="+encodeURIComponent(q)).then(r=>r.json());'
            + '      fEl.innerHTML = (d.treff||[]).map((tr,i) => "<div class=\\"aa-f\\" data-i=\\""+i+"\\" style=\\"padding:6px 9px;cursor:pointer;font-size:12px;color:#cbd5e1;border-top:1px solid #1e293b;\\">"+esc(tr.adresse)+" <span style=\\"color:#64748b;\\">"+esc(tr.postnr+" "+tr.poststed)+"</span></div>").join("");'
            + '      fEl.querySelectorAll(".aa-f").forEach(el => el.onclick = () => { const tr = d.treff[+el.dataset.i]; inp.value = tr.adresse+", "+tr.postnr+" "+tr.poststed; fEl.innerHTML=""; beregnAlt(t, bytt, tr); });'
            + '    } catch(_){} }, 250); });'
            + '}'
            + 'async function beregnAlt(t, bytt, alt){'
            + '  const resEl = document.getElementById("aaResultat"); if (!resEl) return;'
            + '  resEl.innerHTML = "<div style=\\"font-size:11px;color:#94a3b8;font-style:italic;\\">Beregner…</div>";'
            + '  const fast = (bytt === "til") ? t.fra : t.til;'   // endepunktet som BEHOLDES (behandlingssted)
            + '  const orig = (bytt === "til") ? t.til : t.fra;'   // opprinnelig adresse som byttes ut
            + '  const altAdr = alt.adresse+", "+alt.postnr+" "+alt.poststed;'
            // v1.106: ruter.php kan time ut på KALD cache (Geonorge-geokoding + ruting server-side) →
            // json() kaster → null. Andre forsøk treffer varm cache og lykkes — derfor auto-retry,
            // og «Prøv igjen»-knapp i stedet for blindvei hvis begge forsøk feiler.
            + '  const km = async (a,b) => { for (let fs=0; fs<2; fs++){ try { const j = await fetch("https://thomaswestby.no/skript/ruter.php?fra="+encodeURIComponent(renskAdr(a))+"&til="+encodeURIComponent(renskAdr(b))).then(r=>r.json()); if (j&&j.ok) return j; } catch(_){} if (!fs) await new Promise(r=>setTimeout(r,800)); } return null; };'
            // v1.118: KRAVET måles mot FOLKEREGISTRERT adresse (Thomas 03.07) — pasienten kan fritt
            // reise kortere enn kravet sitt; forrige hentested er irrelevant for dommen (kan jo
            // allerede være endret). rOrig hentes fortsatt (reisetid-estimat-fallback + info).
            + '  const pAdr = (t.pasientAdresse || "").trim();'
            + '  const sammePA = pAdr && renskAdr(pAdr).toLowerCase() === renskAdr(orig).toLowerCase();'
            + '  const [rOrig, rAlt, rFolkeRaw] = await Promise.all([km(fast, orig), km(fast, altAdr), (pAdr && !sammePA) ? km(fast, pAdr) : Promise.resolve(null)]);'
            + '  if (!rAlt){ resEl.innerHTML = "<div style=\\"color:#ef4444;font-size:11px;\\">Kunne ikke beregne alternativ rute (treg ruteserver?). <a href=\\"#\\" id=\\"aaRetry\\" style=\\"color:#93c5fd;\\">Prøv igjen</a></div>"; const rb=document.getElementById("aaRetry"); if(rb) rb.onclick = (ev)=>{ ev.preventDefault(); beregnAlt(t, bytt, alt); }; return; }'
            + '  const kmOrig = rOrig ? rOrig.km : (t.direkteKm!=null?t.direkteKm:null);'
            + '  const kmAlt = rAlt.km;'
            + '  const rFolke = sammePA ? rOrig : rFolkeRaw;'
            + '  const kmFolke = (pAdr && rFolke) ? rFolke.km : null;'
            + '  const basis = (kmFolke!=null) ? kmFolke : kmOrig;'
            + '  const diff = (basis!=null) ? Math.round((kmAlt-basis)*10)/10 : null;'
            + '  const kortere = (basis==null) || (kmAlt <= basis);'
            + '  const domTekst = kortere'
            + '    ? "✓ Kortere/lik " + (kmFolke!=null ? "folkeregistrert" : "nåværende") + " — kan godkjennes"'
            + '    : "⚠ Lengre enn " + (kmFolke!=null ? "folkeregistrert" : "nåværende") + (diff!=null?" (+"+diff+" km)":"") + " — pasienten har ikke krav; krever begrunnelse";'
            + '  const kmLinje = (kmFolke!=null)'
            + '    ? "Krav (folkereg.): <b>"+kmFolke+" km</b> &nbsp;|&nbsp; Alternativ: <b>"+kmAlt+" km</b>" + (kmOrig!=null && !sammePA ? "<div style=\\"font-size:11px;color:#94a3b8;margin-top:2px;\\">Nåværende " + (bytt==="til"?"leveringssted":"hentested") + ": "+kmOrig+" km · folkereg.: "+esc(pAdr)+"</div>" : "")'
            + '    : "Opprinnelig: <b>"+(kmOrig!=null?kmOrig+" km":"?")+"</b> &nbsp;|&nbsp; Alternativ: <b>"+kmAlt+" km</b><div style=\\"font-size:11px;color:#f59e0b;margin-top:2px;\\">Folkeregistrert adresse ukjent — dommen er målt mot nåværende adresse.</div>";'
            + '  resEl.innerHTML = "<div style=\\"padding:8px 10px;border-radius:6px;background:"+(kortere?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")+";border:1px solid "+(kortere?"#22c55e":"#ef4444")+";\\">"'
            + '    + "<div style=\\"font-size:12px;color:#e2e8f0;\\">"+kmLinje+"</div>"'
            + '    + "<div style=\\"font-size:13px;font-weight:700;margin-top:4px;color:"+(kortere?"#22c55e":"#ef4444")+";\\">"+domTekst+"</div></div>";'
            // Skrive-knapp for VENTENDE turer. v1.103: lengre reise blokkeres ikke lenger, men krever
            // OBLIGATORISK begrunnelse (kortere/lik: valgfri kommentar). Auto-notat + kommentar skrives
            // alltid i trip.comment. Pågående → fortsatt sperret (kan bytte transportør).
            + '  const bt = window.opener && window.opener.__basicTools;'
            // v1.108: FORHÅNDSVIS reisetid/ny hentetid FØR bytte-knappen trykkes — operatøren skal
            // avklare ny hentetid med pasienten før adressen skrives (Thomas 02.07). Resultatet
            // (forRt) gjenbrukes: sendes med i byttAdresse-kallet + driver 🕐-knappen etterpå.
            + '  const fmtMin = mm => { mm = ((mm % 1440) + 1440) % 1440; return String(Math.floor(mm/60)).padStart(2,"0") + ":" + String(mm%60).padStart(2,"0"); };'
            + '  let forRt = null, forVist = false, oppdaterWbHook = null;'
            // v1.110: også PÅGÅENDE turer får reisetid-info (ren lesing) — selve adresseskrivingen
            // er fortsatt sperret av ventende-gaten lenger ned.
            + '  if (t.resId && bt && bt.forhandsReisetid && bytt === "fra") {'
            + '    const rtEl = document.createElement("div");'
            + '    rtEl.style.cssText = "margin-top:8px;padding:8px 10px;border-radius:6px;background:rgba(59,130,246,0.12);border:1px solid #3b82f6;font-size:12px;color:#bfdbfe;";'
            + '    rtEl.textContent = "🕐 Beregner NISSY-reisetid…";'
            + '    resEl.appendChild(rtEl);'
            // v1.109: fallback til ruter-estimat når NISSY-beregneren ikke svarer — vi har allerede
            // kjøresekunder for begge rutene (rOrig/rAlt fra km-dommen), så forslaget kan alltid gis.
            + '    bt.forhandsReisetid(t.resId, bytt, alt, t).then(rt => {'
            + '      let kilde = "NISSY-reisetid";'
            + '      if (!rt && rOrig && rAlt && rOrig.sek != null && rAlt.sek != null) {'
            + '        const mO = Math.round(rOrig.sek/60), mN = Math.round(rAlt.sek/60);'
            + '        rt = { orig: mO, ny: mN, delta: mN - mO, estimat: true };'
            + '        kilde = "Reisetid (ruter-estimat — NISSY-beregneren svarte ikke)";'
            + '      }'
            + '      forRt = rt;'
            + '      const hM = parseHHMM(t.henteTid);'
            + '      if (!rt) { rtEl.textContent = "🕐 Fikk ikke reisetid — hentetiden må vurderes manuelt."; rtEl.style.opacity = "0.65"; return; }'
            + '      forVist = true;'
            + '      if (rt.delta === 0 || hM === null) { rtEl.textContent = "🕐 " + kilde + ": " + rt.orig + " → " + rt.ny + " min" + (rt.delta === 0 ? " — hentetiden kan beholdes." : "."); return; }'
            + '      const nyT = fmtMin(hM - rt.delta);'
            // v1.117: gjør det synlig når regiontillegget endres over regiongrense — ellers ser
            // delta «feil» ut i forhold til reisetid-tallene.
            + '      const tilleggTxt = (rt.tilleggOrig != null && rt.tilleggNy != null && rt.tilleggOrig !== rt.tilleggNy) ? ", inkl. regiontillegg " + rt.tilleggOrig + " → " + rt.tilleggNy + " min" : "";'
            // v1.114: redigerbart tidsfelt — forslaget er utgangspunkt, operatøren kan overstyre
            // etter avtale med pasienten (f.eks. rundere tid / bedre margin). 🕐-knappen leser feltet.
            // v1.115: KUN på ventende — pågående kan ikke endres herfra, så der vises bare forslaget.
            + '      if (t.ventende) {'
            + '        rtEl.innerHTML = "🕐 " + kilde + ": " + rt.orig + " → " + rt.ny + " min (" + (rt.delta>0?"+":"") + rt.delta + " min" + tilleggTxt + ").<br>Ny hentetid: <input id=\\"aaNyTid\\" value=\\"" + nyT + "\\" maxlength=\\"5\\" style=\\"width:52px;text-align:center;padding:2px 4px;background:#0f172a;color:#f8fafc;border:1px solid #3b82f6;border-radius:4px;font-size:12px;font-weight:700;\\"> <span style=\\"opacity:0.8;\\">(forslag " + nyT + ", var " + t.henteTid + ")</span> — <b>avklar med pasienten før du bytter</b>.";'
            // v1.117: ÉN knapp gjør begge deler — tidsfeltet kobles til bytte-knappen (label + lagring).
            + '        const aaI0 = document.getElementById("aaNyTid");'
            + '        if (aaI0 && oppdaterWbHook) aaI0.addEventListener("input", oppdaterWbHook);'
            + '        if (oppdaterWbHook) oppdaterWbHook();'
            + '      } else {'
            + '        rtEl.innerHTML = "🕐 " + kilde + ": " + rt.orig + " → " + rt.ny + " min (" + (rt.delta>0?"+":"") + rt.delta + " min" + tilleggTxt + "). Foreslått ny hentetid: <b>" + nyT + "</b> (var " + t.henteTid + ").";'
            + '      }'
            + '    }).catch(() => {});'
            + '  }'
            + '  if (t.ventende && t.resId && bt && bt.byttAdresse) {'
            + '    const ta = document.createElement("textarea");'
            + '    ta.id = "aaKommentar"; ta.rows = 2;'
            + '    ta.placeholder = kortere ? "Kommentar (valgfritt — logges på rekvisisjonen)" : "Begrunnelse — kreves ved lengre reise (hvem godkjente / hvorfor)";'
            + '    ta.style.cssText = "margin-top:8px;width:100%;box-sizing:border-box;padding:7px 9px;background:#0f172a;color:#f8fafc;border:1px solid "+(kortere?"#334155":"#ef4444")+";border-radius:6px;font-size:12px;resize:vertical;";'
            + '    resEl.appendChild(ta);'
            // v1.117: ÉN knapp for hele operasjonen (Thomas 03.07) — adressen byttes og hentetiden
            // settes (fra #aaNyTid-feltet) i samme klikk. Tidsfeltet er redigerbart før klikket;
            // tomt/ugyldig/uendret felt → kun adressebytte.
            + '    const lesTid = () => { if (bytt !== "fra") return null; const i = document.getElementById("aaNyTid"); let v = i ? i.value.trim() : ""; if (/^\\d{1,2}:\\d{2}$/.test(v) && parseHHMM(v) !== null) { if (v.length === 4) v = "0" + v; return v === t.henteTid ? null : v; } return null; };'
            + '    const wb = document.createElement("button");'
            + '    wb.style.cssText = "margin-top:6px;width:100%;padding:8px;background:#dc2626;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;";'
            + '    const oppdaterKnapp = () => { if (wb.dataset.laast) return; const klar = kortere || !!ta.value.trim(); wb.disabled = !klar; wb.style.opacity = klar ? "1" : "0.45"; wb.style.cursor = klar ? "pointer" : "not-allowed"; wb.title = klar ? "" : "Skriv begrunnelse først — lengre reise krever godkjenning"; const vT = lesTid(); wb.textContent = "✏️ Bytt " + (bytt==="til"?"leveringssted":"hentested") + (vT ? " + hentetid → " + vT : "") + " i NISSY"; };'
            + '    ta.addEventListener("input", oppdaterKnapp); oppdaterKnapp(); oppdaterWbHook = oppdaterKnapp;'
            + '    wb.onclick = async () => {'
            + '      if (!kortere && !ta.value.trim()) { ta.focus(); return; }'
            + '      const vTid = lesTid();'
            + '      if (!window.confirm("Dette SKRIVER til rekvisisjonen i NISSY:\\n\\nNy adresse (" + (bytt==="til"?"leveringssted":"hentested") + "): " + altAdr + (vTid ? "\\nNy hentetid: " + t.henteTid + " → " + vTid : "") + "\\n\\nKommentar logges på rekvisisjonen. Fortsette?")) return;'
            + '      wb.dataset.laast = "1"; wb.disabled = true; wb.textContent = "Lagrer adresse…";'
            + '      try {'
            + '        const r = await bt.byttAdresse(t.resId, bytt, alt, { kommentar: ta.value.trim(), kmOrig: kmOrig, kmAlt: kmAlt, origAdr: orig, reisetid: forRt });'
            + '        if (!(r && r.ok)) { delete wb.dataset.laast; wb.disabled = false; oppdaterKnapp(); alert("Kunne ikke bytte adresse: " + ((r&&r.feil)||"ukjent feil")); return; }'
            + '        ta.disabled = true; const iT = document.getElementById("aaNyTid"); if (iT) iT.disabled = true;'
            + '        if (vTid && bt.endreTid) {'
            + '          wb.textContent = "✓ Adresse lagret — setter hentetid " + vTid + "…";'
            + '          const rr = await bt.endreTid(t.resId, vTid, t.henteTid);'
            + '          if (rr && rr.ok) { wb.textContent = "✓ Adresse + hentetid " + vTid + " lagret — verifiser i tabellen"; wb.style.background = "#16a34a"; }'
            + '          else { wb.textContent = "⚠ Adresse lagret — hentetid FEILET"; wb.style.background = "#d97706"; alert("Adressen ble byttet, men hentetiden ble IKKE endret: " + ((rr && rr.feil) || "ukjent feil")); }'
            + '        } else {'
            + '          wb.textContent = "✓ Adresse byttet i NISSY — verifiser i tabellen"; wb.style.background = "#16a34a";'
            + '          if (bytt === "til") { const d2 = document.createElement("div"); d2.style.cssText = "margin-top:6px;font-size:11px;color:#94a3b8;"; d2.textContent = "Hentetiden (ved behandlingssted) påvirkes ikke av byttet."; resEl.appendChild(d2); }'
            + '        }'
            + '      } catch(e) { delete wb.dataset.laast; wb.disabled = false; oppdaterKnapp(); alert("Feil: " + e.message); }'
            + '    };'
            + '    resEl.appendChild(wb);'
            + '  } else if (!t.ventende) {'
            + '    const note = document.createElement("div");'
            + '    note.style.cssText = "margin-top:8px;padding:7px 10px;background:rgba(251,191,36,0.1);border:1px solid #f59e0b;border-radius:6px;font-size:11px;color:#fbbf24;";'
            + '    note.textContent = "⚠ Pågående tur — adressen kan ikke endres her (kan bytte transportør). Trekk tilbake til ventende først.";'
            + '    resEl.appendChild(note);'
            + '  }'
            + '  try { if (rAlt.geometri && rAlt.geometri.length) {'
            + '    if (window._altLag) window._altLag.forEach(l=>{try{map.removeLayer(l)}catch(_){}});'
            + '    window._altLag = [];'
            + '    window._altLag.push(mkLinje(rAlt.geometri.map(p=>[p[0],p[1]]), {color:"#7c3aed", opacity:0.9, weight:5}));'
            + '    window._altLag.push(mkMarker({lat:+alt.lat, lng:+alt.lon}, {text:"★", title:"Alternativ: "+altAdr, farge:"#7c3aed", fyll:1, scale:13}));'
            + '    map.fitBounds(rAlt.geometri.map(p=>[p[0],p[1]]), {padding:[40,40]});'
            + '  } } catch(_){}'
            + '}'
            // Leaflet lastes synkront i <head>, så window.L finnes når denne inline-koden kjører.
            + 'if (window.L) { initMap(); } else { window.addEventListener("load", initMap); }'
            + '</script></body></html>';
    }

    function kontekstmenyHandler(e) {
        const rad = e.target.closest && e.target.closest('tr[id^="V-"], tr[id^="P-"]');
        if (!rad) return;

        if (rad.id.startsWith('V-')) {
            const erMarkert = rad.style.backgroundColor === NISSY_BLAA;
            const markerte = lesMarkerteResIds();
            let resIds;
            if (erMarkert && markerte.length > 0) {
                resIds = markerte;
            } else {
                const id = rad.id.replace(/^V-/, '');
                if (!/^\d+$/.test(id)) return;
                resIds = [id];
            }
            e.preventDefault();
            visKontekstmeny(resIds, e.clientX, e.clientY);
        } else if (rad.id.startsWith('P-')) {
            const erMarkert = rad.style.backgroundColor === NISSY_BLAA;
            const markerte = lesMarkertePaagaaende();
            let turer;
            if (erMarkert && markerte.length > 0) {
                turer = markerte;
            } else {
                    const args = lesPaagaaendeArgs(rad);
                // ⚠️ IKKE `return` HER. Uten X-ikon (avsluttet tur) falt vi ut UTEN
                //    preventDefault, og operatøren fikk nettleserens egen meny — verst på de
                //    radene der statusendring er det eneste man vil gjøre. Vi hopper i stedet
                //    rett til statusmenyen; trekk-tilbake er uansett ikke mulig på slike rader.
                //    Vi viser HELE menyen med trekk-tilbake grået ut (Thomas 27.08), i stedet
                //    for å hoppe rett til statusvalget. Menyen ser da lik ut hver gang, og det
                //    som ikke er mulig sier selv hvorfor — bedre enn at et punkt skifter plass.
                if (!args) {
                    e.preventDefault();
                    visTrekkTilbakeMeny([], e.clientX, e.clientY, rad);
                    return;
                }
                turer = [{
                    resId: args.resId,
                    reqId: args.reqId,
                    navn: lesPasientnavnFraRadGeneric(rad) || args.resId,
                    dato: lesAvgangsdatoFraRad(rad)
                }];
            }
            e.preventDefault();
            visTrekkTilbakeMeny(turer, e.clientX, e.clientY, rad);
        }
    }

    document.addEventListener('contextmenu', kontekstmenyHandler, true);

    // ═══════════════════════════════════════════════════════════════════════
    //    FOOTER-FORANKRING (felles) — v1.135-dev
    // ═══════════════════════════════════════════════════════════════════════
    // Mønsteret var duplisert 4 steder (2 her, 2 i verktoykasse). Tre hadde parent-walken;
    // sikreSamkjoringKnapp manglet den og antok at #dynamic_poster SELV er en <td>. Er den
    // det ikke, appendes vår <td> inn i et ikke-<tr> og knappen forsvinner stille.
    // Kopiene i verktoykasse_dev.js røres IKKE — annen IIFE, kan ikke dele denne.
    function vktFooterAnker() {
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        return (celle && celle.parentNode) ? celle : null;
    }
    function vktFooterTd(id, stil) {
        if (document.getElementById(id)) return null;          // allerede påført
        const anker = vktFooterAnker();
        if (!anker) return null;                                // footer ikke klar — intervallet prøver igjen
        const td = document.createElement('td');
        td.id = id;
        td.style.cssText = stil || 'padding:0 8px;white-space:nowrap;vertical-align:middle;';
        anker.parentNode.appendChild(td);
        return td;
    }


    // ===== UTSENDELSESVARSEL =====
    // Blinker ventende V-rader amber når «send ut»-fristen er passert (samme formel som Område-assistent):
    //   haster når  nå ≥ hentetid(Reisetid-kolonnen) + max(reisetid, 60 min) − 25 min (responstid).
    // reisetid = turens varighet fra→til. v1.119: NISSYs egen beregner (beregnReisetidNissy, inkl.
    // regiontillegg) er primærkilde, ruter.php fallback. Cachet per fra|til. Av/på via checkbox i footeren.
    const UTV_VARSEL_MIN = 25, UTV_VENTETID_MIN = 60, UTV_LS = 'vkt_utsendelsevarsel';
    // v1.120: reisetid-cachen persisteres i localStorage så F5 ikke re-slår opp alle parene.
    // TTL 24 t (v1.122, Thomas). v1.121: FEILEDE oppslag (null)
    // persisteres OGSÅ, men med kort TTL (30 min) — uten dette ble alle ugekodbare institusjons-
    // adresser re-fetchet ved hver F5 («veldig mange ruter.php-kall»-funnet 03.07).
    // v1.127: NY NØKKEL. De cachede verdiene fra før inkluderte tidstilleggRegionalt, og
    // med 24 t levetid ville de servert gamle tall lenge etter at beregningen ble rettet —
    // fiksen ville sett ut til å virke tilfeldig. Ny nøkkel forkaster dem umiddelbart.
    const UTV_RT_LS = 'vkt_utv_rtcache2', UTV_RT_TTL = 24 * 3600 * 1000, UTV_RT_TTL_FEIL = 30 * 60 * 1000, UTV_RT_MAKS = 600;
    try { localStorage.removeItem('vkt_utv_rtcache'); } catch (_) {}
    const _utvReisetid = {};  // "fra|til" → minutter (minne-cache; speiles til localStorage)
    try {
        const c = JSON.parse(localStorage.getItem(UTV_RT_LS) || '{}');
        const naa = Date.now();
        for (const k in c) {
            if (!c[k] || !('m' in c[k])) continue;
            if (naa - c[k].t < (typeof c[k].m === 'number' ? UTV_RT_TTL : UTV_RT_TTL_FEIL)) _utvReisetid[k] = c[k].m;
        }
    } catch (_) {}
    function utvLagreCache(key, m) {
        _utvReisetid[key] = m;
        try {
            const c = JSON.parse(localStorage.getItem(UTV_RT_LS) || '{}');
            c[key] = { m: m, t: Date.now() };
            const nokler = Object.keys(c);
            if (nokler.length > UTV_RT_MAKS) {  // eldste ut — begrens localStorage-fotavtrykket
                nokler.sort((a, b) => (c[a].t || 0) - (c[b].t || 0));
                for (let i = 0; i < nokler.length - UTV_RT_MAKS; i++) delete c[nokler[i]];
            }
            localStorage.setItem(UTV_RT_LS, JSON.stringify(c));
        } catch (e) {
            // v1.122: ALDRI stille igjen — full kvote var usynlig i dagevis (03.07-funnet).
            try { console.warn('[' + NAVN + '] utv-cache: localStorage-skriving FEILET (' + (e && e.name) + ') — full kvote? Reisetider re-fetches ved neste F5.'); } catch (_) {}
        }
    }
    function utvRenskAdr(adr) {
        var s = String(adr || '').replace(/<br\s*\/?>/gi, ',').replace(/<[^>]+>/g, ' ');
        var deler = s.split(',').map(function (d) { return d.trim(); }).filter(function (d) { return d && !/^(kommune|kommentar)\s*:/i.test(d); });
        var pnrIdx = -1, i; for (i = 0; i < deler.length; i++) { if (/\b\d{4}\b/.test(deler[i])) { pnrIdx = i; break; } }
        if (pnrIdx > 0) { var gIdx = -1, j; for (j = pnrIdx - 1; j >= 0; j--) { if (/^(\d+\.?\s*etg|etasje|inngang|bygg|avd|hus|plan)\b/i.test(deler[j])) continue; gIdx = j; break; } var gate = gIdx >= 0 ? deler[gIdx].split('/')[0].trim() : ''; return ((gate ? gate + ' ' : '') + deler[pnrIdx]).replace(/\bH\d{3,4}\b/gi, '').replace(/\s+/g, ' ').trim(); }
        return deler.join(' ');
    }
    // v1.119: strukturer rensket radadresse for beregnReisetidNissy. utvRenskAdr gir «gate nr postnr
    // sted» (uten komma) — regexen er derfor raus på komma. Uten husnr (institusjonsnavn) → null →
    // ruter.php-fallback.
    function utvParseAdr(adr) {
        const m = utvRenskAdr(adr).match(/^(.*?)\s+(\d+)\s*([A-Za-zÆØÅæøå]?)\s*,?\s*(\d{4})\s+(.+)$/);
        return m ? { gatenavn: m[1].trim(), husnummer: m[2], husbokstav: (m[3] || '').toUpperCase(), postnummer: m[4], poststed: m[5].trim() } : null;
    }
    async function utvReisetidMin(t) {
        const fra = t.fra, til = t.til;
        const key = fra + '|' + til;
        if (_utvReisetid[key] !== undefined) return _utvReisetid[key];
        // v1.119: NISSYs egen beregner FØRST — fasiten, samme tall NISSY brukte da hentetiden ble
        // satt. reisetid + regiontillegg ≈ oppmøte − hentetid → fristen blir nøyaktig oppmøte − 25.
        // Cachet per fra|til (localStorage 24 t; behandlingstidspunktet påvirker ikke reisetiden nevneverdig).
        let fraObj = utvParseAdr(fra), tilObj = utvParseAdr(til);
        let ruterFra = fra, ruterTil = til;
        // v1.123: visningsnavn (institusjon uten gate/husnr) kan ikke struktureres → hent de EKTE
        // adressene fra admin-plakaten via radens reqId/resId (samme kombo-rekkefølge som beriktTur).
        // Én ekstra admin-hent per rad — men svaret caches 24 t, så det er en engangskostnad.
        // (HUSDAL-caset: «Kirurgisk, gastro- og urologisk avdeling → Engerdal Sykehjem» ga 60-min-
        // gulvet og blink 2,5 t for tidlig; admin-adressene gir NISSYs ekte 3t38.)
        if ((!fraObj || !tilObj) && (t.reqId || t.resId)) {
            const api = window.__verktoykasseDev || window.__verktoykasse;
            if (api && api.hentRekvisisjon) {
                const kombos = [];
                if (t.resId) kombos.push([t.resId, t.resId]);
                if (t.reqId && t.resId) kombos.push([t.reqId, t.resId]);
                if (t.reqId) kombos.push([t.reqId, t.reqId]);
                for (let i = 0; i < kombos.length; i++) {
                    try {
                        const rek = await api.hentRekvisisjon(kombos[i][0], 1, kombos[i][1], '');
                        if (rek && rek.fra_adresse && rek.til_adresse) {
                            fraObj = fraObj || utvParseAdr(rek.fra_adresse);
                            tilObj = tilObj || utvParseAdr(rek.til_adresse);
                            ruterFra = rek.fra_adresse; ruterTil = rek.til_adresse;  // bedre geokoding i fallback òg
                            break;
                        }
                    } catch (_) {}
                }
            }
        }
        if (ER_DEV) console.log('[' + NAVN + '] utv cache-miss → ' + (fraObj && tilObj ? 'NISSY' : 'ruter.php') + ': «' + key + '»');
        if (fraObj && tilObj) {
            const dn = new Date();
            const p2 = n => String(n).padStart(2, '0');
            const behDato = p2(dn.getDate()) + '.' + p2(dn.getMonth() + 1) + '.' + String(dn.getFullYear()).slice(-2);
            const j = await beregnReisetidNissy(fraObj, tilObj, behDato, p2(dn.getHours()) + ':' + p2(dn.getMinutes()));
            // v1.127 (Thomas 21.08): KUN j.reisetid. `tidstilleggRegionalt` er NISSYs
            // margin for at pasienten skal rekke timen sin — ikke transporttid. Den hørte
            // aldri hjemme i utsendelsesfristen eller ventetiden, og gjorde begge 20 min
            // for romslige: tooltipen sa «reisetid 1 t 35 min» der kjøretiden var 1 t 15.
            if (j) { utvLagreCache(key, j.reisetid); return _utvReisetid[key]; }
        }
        try {
            const j = await fetch('https://thomaswestby.no/skript/ruter.php?fra=' + encodeURIComponent(utvRenskAdr(ruterFra)) + '&til=' + encodeURIComponent(utvRenskAdr(ruterTil))).then(r => r.json());
            utvLagreCache(key, (j && j.ok && j.sek) ? Math.round(j.sek / 60) : null);
        } catch (_) { _utvReisetid[key] = null; }
        return _utvReisetid[key];
    }
    function utvSikreStil() {
        if (document.getElementById('vkt-haster-stil')) return;
        const st = document.createElement('style');
        st.id = 'vkt-haster-stil';
        st.textContent = '@keyframes vktHasterPuls{0%,100%{background-color:rgba(251,191,36,.12)}50%{background-color:rgba(251,191,36,.5)}}tr.vkt-haster,tr.vkt-haster>td{animation:vktHasterPuls 1.3s ease-in-out infinite!important}';
        document.head.appendChild(st);
    }
    function utvPaa() { return kpPaa(UTV_LS); }
    // v1.124: formatering til utsendelses-tooltipen
    function utvFmtKl(mm) { return String(Math.floor(mm / 60) % 24).padStart(2, '0') + ':' + String(mm % 60).padStart(2, '0'); }
    function utvFmtVarighet(mm) { return mm >= 60 ? Math.floor(mm / 60) + ' t ' + (mm % 60) + ' min' : mm + ' min'; }
    // v1.135: full opprydding når varselet skrus av — klasse, memoisering OG tooltip.
    function utvRydd() {
        try {
            document.querySelectorAll('tr.vkt-haster').forEach(r => r.classList.remove('vkt-haster'));
            document.querySelectorAll('tr[data-vkt-org-title]').forEach(r => {
                if (r.dataset.vktOrgTitle) r.title = r.dataset.vktOrgTitle; else r.removeAttribute('title');
                delete r.dataset.vktOrgTitle;
            });
        } catch (_) {}
        _utvAktive = {};
    }

    let _utvKjorer = false;
    async function utvOppdater() {
        if (_utvKjorer) return; _utvKjorer = true;
        try {
            const rader = [...document.querySelectorAll('tr[id^="V-"]')];
            if (!utvPaa()) { utvRydd(); return; }
            utvSikreStil();
            const dn = new Date(); const naa = dn.getHours() * 60 + dn.getMinutes();
            const aktive = {};
            for (const rad of rader) {
                const t = lesTurDataFraRad(rad);
                const T = t && t.tid ? tidTilMin(t.tid) : null;
                if (T == null) continue;
                // DATO-SJEKK: NISSY viser dato-prefiks («DD.MM HH:MM») kun når turen IKKE er i dag.
                // «Send ut»-varselet gjelder kun dagens turer — hopp over alle med en annen dato.
                const datoM = String(t.tidRaw || '').match(/(\d{1,2})\.(\d{1,2})/);
                if (datoM && (+datoM[1] !== dn.getDate() || +datoM[2] !== dn.getMonth() + 1)) continue;
                const diff = T - naa;
                if (diff > 30 || diff < -360) continue;  // kun imminente/nylig passerte → begrenser ruter-kall
                let rt = UTV_VENTETID_MIN, rtKjent = false;
                // v1.123: sender hele tur-objektet — utvReisetidMin trenger reqId/resId for
                // admin-adresse-oppslaget når fra/til er visningsnavn.
                if (t.fra && t.til) { const m = await utvReisetidMin(t); if (m != null) { rt = m; rtKjent = true; } }
                const ventetid = Math.max(rt, UTV_VENTETID_MIN);
                const frist = T + ventetid;
                // v1.124: erstatt NISSYs rekvnr-tooltip med utsendelses-info (kun når varselet er på —
                // vi er bak utvPaa()-sjekken her). Re-render nullstiller title; denne løkka setter den igjen.
                const sendUt = frist - UTV_VARSEL_MIN;
                // v1.125: reisetid ≠ ventetid — vis begge når 60-min-gulvet hever ventetiden.
                // v1.135: ta vare på NISSYs egen tooltip FØR vi overskriver. Uten dette fantes
                // ingen vei tilbake til rekvnr-tooltipen uten F5 — akseptabelt da toggling var
                // sjelden, men kontrollpanelet gjør toggling trivielt.
                if (rad.dataset.vktOrgTitle === undefined) rad.dataset.vktOrgTitle = rad.getAttribute('title') || '';
                rad.title = '🔔 Send ut innen ' + utvFmtKl(sendUt)
                    + (naa >= sendUt ? ' — FRIST PASSERT' : '')
                    + ' (' + (!rtKjent ? 'reisetid ukjent → ventetid ' + utvFmtVarighet(ventetid)
                            : rt < ventetid ? 'reisetid ' + utvFmtVarighet(rt) + ' → ventetid ' + utvFmtVarighet(ventetid)
                            : 'reisetid ' + utvFmtVarighet(rt))
                    + ', hentetid ' + t.tid + ')';
                if (naa >= frist - UTV_VARSEL_MIN) {
                    aktive[rad.id] = true;
                    // v1.104: blink-bakgrunnen (!important) skjulte NISSYs blå markering — pauser
                    // blinken på markerte rader så operatørens utvalg alltid er synlig.
                    rad.classList.toggle('vkt-haster', rad.style.backgroundColor !== NISSY_BLAA);
                }
            }
            rader.forEach(rad => { if (!aktive[rad.id]) rad.classList.remove('vkt-haster'); });
            _utvAktive = aktive;
        } catch (_) {} finally { _utvKjorer = false; }
    }
    // v1.104: rask synk ved klikk — markering/avmarkering skal pause/gjenoppta blinken UMIDDELBART,
    // ikke ved neste 20s-tick. _utvAktive = siste beregnede haster-sett fra utvOppdater; her toggles
    // kun klassen (ingen ruter-kall). 150ms delay lar NISSYs egen klikk-handler sette fargen først.
    let _utvAktive = {};
    function utvSynk() {
        if (!utvPaa()) return;
        const rader = document.querySelectorAll('tr[id^="V-"]');
        for (let i = 0; i < rader.length; i++) {
            const rad = rader[i];
            if (!_utvAktive[rad.id]) continue;
            rad.classList.toggle('vkt-haster', rad.style.backgroundColor !== NISSY_BLAA);
        }
    }
    document.addEventListener('click', () => setTimeout(utvSynk, 150), true);
    // ═══════════════════════════════════════════════════════════════════════
    //    KONTROLLPANEL (v1.135-dev, Thomas 24.08)
    // ═══════════════════════════════════════════════════════════════════════
    // Én ⚙️-knapp i footeren åpner et panel med av/på-brytere. Erstatter den løse
    // utsendelsesvarsel-checkboxen — footeren var full (Vis kart+, Logg, driftsmelding).
    //
    // Tilstanden bor i localStorage, ALDRI i DOM-en, så flyttingen av checkboxen endrer
    // ingenting for operatører som allerede har varselet på. ⚠️ UTV_LS-strengen må stå urørt:
    // «ryddes» den til et penere navn, blir alle som har varselet PÅ stille slått AV.
    //
    // Panelet er EFEMERT — opprettes ved klikk, fjernes ved lukk (som visKontekstmeny).
    // Bare knappen må overleve NISSYs re-render.
    // AV som standard — men en bryter kan be om det motsatte. «Vis skjold» må være PÅ for
    // alle som ikke har valgt noe, ellers ville en oppgradering skjult verktøykassens ansikt.
    function kpPaa(ls, standardPaa) {
        const v = localStorage.getItem(ls);
        if (v === null) return !!standardPaa;
        return v === '1';
    }

    function kpBrytere() { return [
        { ls: 'vkt_vis_skjold', ikon: '🛡️', tekst: 'Vis skjold', standardPaa: true,
          tip: 'Skjoldet som flyter over NISSY. Skrur du det av, når du fortsatt menyen fra «🔧 Verktøy» i footeren',
          paa: () => { if (window.__vkt_meny) window.__vkt_meny.skjoldVis(true); },
          av:  () => { if (window.__vkt_meny) window.__vkt_meny.skjoldVis(false); } },
        // ⚠️ MØRKT TEMA ER DEV-BARE (Thomas 27.08: «ser ikke bra ut, den forblir i Dev»).
        //    Bryteren skjules i prod, og temaet gjenopprettes ikke der — se oppstarten. Nøkkelen
        //    er den samme, så en som har slått det på i dev beholder valget sitt der.
        ...(ER_DEV ? [{ ls: TEMA_LS, ikon: '🌙', tekst: 'Mørkt tema', beta: true,
          tip: 'Demper NISSYs ramme og tabellhoder. Turfargene og radene røres IKKE — de ligger inline i HTML-en, ikke i stilarket',
          paa: () => temaBruk(), av: () => temaAv() }] : []),
        { ls: UTV_LS, ikon: '🔔', tekst: 'Utsendelsesvarsel', beta: true,
          tip: 'Blink ventende-rader når «send ut»-fristen er passert (hentetid + maks(reisetid, 60 min) − 25 min)',
          paa: () => utvOppdater(), av: () => utvRydd() },
    ]; }

    // ── NISSYs PING-FELT UT AV FOOTEREN (Thomas 25.08) ─────────────────────────────────
    // Footerraden har fire NISSY-celler: #logger (en logBox på 745 px), #buttonPing, tema-velgeren
    // og «Dynamiske plakater». Loggboksen alene spiser mesteparten av bredden, og ping skriver
    // til den. Begge flyttes til kontrollpanelet.
    //
    // ⚠️ VI FLYTTER IKKE NODENE. NISSY re-rendrer footeren, og da bygges de opp igjen på plassen
    //    sin — vi ville måttet flytte dem tilbake hvert tredje sekund og slåss med NISSY om DOM-en.
    //    I stedet SKJULES cellene (elementene blir liggende, så NISSYs egen kode virker som før),
    //    og panelet speiler dem: en knapp som kaller ping(), og en boks som viser #logger sitt
    //    innhold. Ingenting går i stykker om NISSY endrer seg — da dukker feltene bare opp igjen.
    function kpSkjulPing() {
        try {
            // ⚠️ #dynamic_poster er også ANKERET vårt (vktFooterAnker). Å SKJULE cellen er trygt —
            //    noden blir liggende, og nye <td>-er føyes fortsatt inn etter den i raden. Hadde vi
            //    fjernet den, ville alle våre egne footer-knapper mistet festet sitt.
            ['logger', 'buttonPing', 'dynamic_poster'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                let td = el;
                while (td && td.tagName !== 'TD') td = td.parentNode;
                if (td && td.style.display !== 'none') {
                    td.dataset.vktSkjult = '1';
                    td.style.display = 'none';
                }
            });
            // Tema-velgeren har ingen id — den finnes via select[name=themeid].
            const tema = document.querySelector('select[name="themeid"]');
            if (tema) {
                let td = tema;
                while (td && td.tagName !== 'TD') td = td.parentNode;
                if (td && td.style.display !== 'none') { td.dataset.vktSkjult = '1'; td.style.display = 'none'; }
            }
        } catch (_) {}
    }

    // ══ MØRKT TEMA ════════════════════════════════════════════════════════════════════
    // NISSYs egne temaer er server-side (applyTheme → form.submit → dispatch.jsp?themeid=…),
    // så vi kan ikke legge til et. Men hele stilarket er 14,6 kB og 36 fargeregler, og vi kan
    // overstyre dem med SAMME selektorer — da arver vi NISSYs spesifisitet og vinner på
    // rekkefølge alene. Ingen !important, ingen gjetting på hvilke elementer som finnes.
    //
    // ⚠️ TURFARGENE RØRES IKKE — og det er garantert av mekanikken, ikke av forsiktighet
    //    (Thomas 25.08: «de er som de er av en grunn»). Kartleggingen viste at dispatch.css
    //    ikke inneholder én eneste statusfarge: de settes inline i HTML-en av JSP/JS. De fem
    //    fargene som så ut som statusfarger (#cdd7b5, #dfe5cf, #c3d1ac, #255F81, #00dd00) er
    //    død kode — IE-scrollbar-egenskaper og en utkommentert bakgrunn.
    //    Eneste betydningsbærende farge i filen er span.warning #ff0000. Den står urørt.
    //
    // ⚠️ VI DEMPER RAMMEN, IKKE INNHOLDET. tr.even/div.odd (radstriping) og reqDocView/
    //    transCostView (popup-bakgrunn) beholder sine lyse farger med vilje:
    //      · radene bærer inline statusfarger — en mørk stripe under en lys inline-farge blir rot
    //      · popupene er der vi selv skriver (Fremmestatus), og alt det er testet mot krem
    //    Resultatet er en mørk ramme rundt et lyst arbeidsområde, og turfargene blir det
    //    eneste lyse i bildet — altså TYDELIGERE enn før, ikke svakere.
    const TEMA_LS = 'vkt_mork_tema';
    const TEMA_ID = 'vkt-mork-tema';
    const TEMA_CSS = [
        // Sidebakgrunn og rammer
        'body { background:#0b1220; }',
        'div.topframe, td.topframe, td.topframe_small, td.topframelogo, td.status,',
        'table.headerframeinfo, div.eff_filter, div.refreshmeter { background-color:#0f172a; color:#e2e8f0; }',
        'div.headerframeleft, div.headerframecenter, div.headerframeright { background-color:#1e293b; }',
        'div.centerleftframe, div.centerrightframe, div.centercenterframe,',
        'div.centercenterframe2, div.bottomframe { background-color:#0f172a; }',
        // Bokser og paneler
        // ⚠️ div.box er den STORE hvite flaten — #pagaendeoppdragpanel og #ressurserpanel,
        //    til sammen ~5 Mpx (Thomas 25.08). Den slapp unna kartleggingen fordi NISSY skriver
        //    «background: white» med NØKKELORD, mens fargeregexen vår bare fanget hex og rgb().
        //    Lærdom: en fargeaudit som ikke ser etter navngitte farger, har hull.
        //    Ren ramme — panelene bak tabellene, ikke radene i dem.
        'div.box, div.ubox { border-color:#334155; background-color:#0f172a; }',
        'div.boxt { border-color:#334155; background-color:#1e293b; color:#e2e8f0; }',
        'div.panel { border-color:#334155; }',
        'div.title { background-color:#334155; color:#f1f5f9; }',
        '.resizer { background-color:#334155; }',
        // Tabellhoder — teksten må lysne sammen med bakgrunnen
        'tr.tableHeader, tr.tbh, td.datatitle, td.dt, th.dt { background-color:#334155; color:#f1f5f9; border-color:#475569; }',
        'a.datatitle, a.dt { color:#e2e8f0; }',
        'tr.tbh a, tr.tableHeader a { color:#e2e8f0; }',
        // ── Radstriping (Thomas 25.08: «vi kan overstyre den lyseblå og den hvite») ─────
        // Trygt av samme grunn som resten: stripingen ligger i STILARKET (tr.even #CFECF5,
        // div.odd #e3e3e3), mens statusfargene settes INLINE. Et stilark-overstyr kan derfor
        // ikke nå dem — inline vinner alltid.
        //
        // ⚠️ TEKSTFARGEN SETTES PÅ RADEN, ALDRI PÅ CELLEN. Det er avgjørende: NISSY skriver
        //    status som inline color på <tr>. Inline på samme element slår vår regel, så en
        //    rad med `style="color:#0000CE"` beholder blåfargen sin. Hadde vi i stedet satt
        //    farge på `td.d`, ville VÅR regel vunnet over den ARVEDE inline-fargen — cellen er
        //    et annet element — og vi ville stille slettet statusmerkingen på hver eneste rad.
        'tr.even { background-color:#152033; color:#cbd5e1; }',
        'tr.odd, div.odd { background-color:#0f172a; color:#cbd5e1; }',
        // Loggboksen (ligger i panelet vårt nå, men NISSY skriver fortsatt i den)
        '.logBox { background-color:#0f172a; border-color:#334155; color:#94a3b8; }',
    ].join('\n');

    // ⚠️ GATEN LIGGER HER, IKKE BARE PÅ OPPSTARTEN. temaRadFarger() kjører hvert 3. sekund
    //    uavhengig av om temaet er brukt, og leser denne. Sto nøkkelen igjen fra dev, ville
    //    prod lysnet radenes tekstfarger mot HVIT bakgrunn — verre enn temaet vi holdt tilbake.
    //    Med gaten her svarer alle konsumentene «av», og opprydningsgrenen gir NISSY fargene
    //    tilbake uendret.
    function temaPaa() { return ER_DEV && localStorage.getItem(TEMA_LS) === '1'; }

    // ══ KONTRASTVAKT ═══════════════════════════════════════════════════════════════════
    // ⚠️ NISSYs EGET «Dark theme» setter hvit tekst globalt — men statusfargene på radene er
    //    lyse og ligger INLINE i HTML-en, utenfor stilarkets rekkevidde. Resultatet er hvit
    //    tekst på lysegrønn: nesten uleselig (Thomas 25.08).
    //
    // Vakten er ALLTID på, uten bryter, fordi den per konstruksjon bare kan forbedre: den rører
    // et element KUN når kontrasten allerede er under 3,5:1. I «Standard theme» gjør den
    // ingenting overhodet. Og den er tema-agnostisk — den vet ikke hvilket tema som er valgt,
    // bare hva som faktisk er malt på skjermen.
    //
    // ⚠️ Den endrer TEKSTFARGE, aldri bakgrunn. Statusfargen er data (Thomas: «de er som de er
    //    av en grunn») og står urørt; vi gjør den bare lesbar.
    function temaLum(rgb) {
        const m = String(rgb || '').match(/\d+(\.\d+)?/g);
        if (!m || m.length < 3) return null;
        if (m.length >= 4 && parseFloat(m[3]) === 0) return null;      // gjennomsiktig → arvet, hopp over
        const k = m.slice(0, 3).map(v => {
            v = parseFloat(v) / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
    }
    function temaKontrast(a, b) {
        const h = Math.max(a, b) + 0.05, l = Math.min(a, b) + 0.05;
        return h / l;
    }

    // ══ STATUSFARGE PÅ MØRK BAKGRUNN ══════════════════════════════════════════════════
    // ⚠️ Da vi mørknet radstripingen ble NISSYs inline statusfarger uleselige — #0000CE er mørk
    //    blå på mørk bunn (Thomas 25.08). Å frede fargen holdt altså ikke; å overskrive den ville
    //    slettet et signal.
    //    Tredje vei: BEHOLD FARGEN, LØFT LYSHETEN. Blå forblir blå, rød forblir rød — men lys nok
    //    til å leses. Vi blander mot hvitt til kontrasten er minst 4,5:1, som er WCAG AA for
    //    brødtekst. Kulørtonen overlever; bare lysheten endres.
    //    Originalen tas vare på, så «Mørkt tema av» gir NISSY fargen tilbake uendret.
    function temaLumRgb(k) {
        const v = k.map(x => {
            x = x / 255;
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
    }
    function temaRgbTall(str) {
        const m = String(str || '').match(/\d+(\.\d+)?/g);
        return (m && m.length >= 3) ? m.slice(0, 3).map(Number) : null;
    }
    // ⚠️ Cellene i NISSY er GJENNOMSIKTIGE — <td class="d"> har ingen egen bakgrunn, den kommer
    //    fra <tr>. Å måle mot forelderen ga derfor alpha=0, temaLum returnerte null, og hele
    //    vurderingen ble hoppet over (Thomas 25.08: <font>-fargene sto fortsatt uleselige).
    //    Vi klatrer til vi finner noe som faktisk er malt.
    function temaBakLum(el) {
        let n = el;
        for (let i = 0; n && i < 12; i++, n = n.parentElement) {
            const l = temaLum(getComputedStyle(n).backgroundColor);
            if (l !== null) return l;
        }
        return temaLum(getComputedStyle(document.body).backgroundColor);
    }

    // ⚠️ IKKE BLAND MOT HVITT (Thomas 25.08: «blå og lilla er vanskelig»). Hvitblanding
    //    AVMETTER: #0000FF og #330066 endte som to bleke pasteller — dårlig å lese, og nesten
    //    umulig å skille fra hverandre. To ulike statuser så like ut.
    //    Vi jobber i HSL i stedet: BEHOLD kulørtonen, HOLD metningen oppe, og hev kun lysheten.
    //    #0000FF blir en klar periwinkle, #330066 en klar fiolett — fortsatt tydelig forskjellige.
    function temaTilHsl(k) {
        const r = k[0] / 255, g = k[1] / 255, b = k[2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        const l = (mx + mn) / 2;
        let h = 0, sa = 0;
        if (d) {
            sa = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
            h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
            h *= 60;
        }
        return [h, sa, l];
    }
    function temaFraHsl(h, sa, l) {
        if (!sa) { const v = Math.round(l * 255); return [v, v, v]; }
        const q = l < 0.5 ? l * (1 + sa) : l + sa - l * sa, p = 2 * l - q;
        const f = (t) => {
            t = (t + 1) % 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const hh = h / 360;
        return [f(hh + 1/3), f(hh), f(hh - 1/3)].map(v => Math.round(v * 255));
    }
    function temaLesbar(farge, lumBak) {
        const k = temaRgbTall(farge);
        if (!k) return null;
        const hsl = temaTilHsl(k);
        // Mørke NISSY-farger er ofte fullmettede (#0000FF), men noen er dempet (#330066 → 100 %,
        // #006B00 → 100 %). Vi låser metningen til minst 65 % så kulørtonen bærer på mørk bunn.
        const sa = Math.max(hsl[1], 0.65);
        for (let l = Math.max(hsl[2], 0.45); l <= 0.9; l += 0.04) {
            const m = temaFraHsl(hsl[0], sa, l);
            if (temaKontrast(lumBak, temaLumRgb(m)) >= 5) return 'rgb(' + m.join(', ') + ')';
        }
        return '#f1f5f9';
    }

    // ⚠️ TO MEKANISMER, SAMME PROBLEM. Pågående skriver status som inline stil på <tr>;
    //    ventende bruker <font color="#0000FF"> inne i cellene — gammel HTML, ikke CSS
    //    (Thomas 25.08). Begge bærer mening, begge blir uleselige på mørk bunn, og begge
    //    behandles likt: behold kulør, løft lyshet.
    //    For <font> setter vi style.color, som slår color-ATTRIBUTTET. Å nullstille stilen gir
    //    NISSY attributtet tilbake helt urørt — vi har aldri skrevet i deres HTML.
    function temaFontFarger(paa) {
        const fonter = document.querySelectorAll('font[color]');
        if (fonter.length > 2000) return;
        fonter.forEach(f => {
            if (!paa) {
                if (f.dataset.vktSatt) { f.style.color = ''; delete f.dataset.vktSatt; }
                return;
            }
            const org = f.getAttribute('color');
            if (!org) return;
            // Allerede rettet for samme attributtverdi?
            if (f.dataset.vktSatt === org) return;
            const lb = temaBakLum(f.parentNode || f);
            if (lb === null) return;
            f.style.color = '';                       // mål ATTRIBUTTETS farge, ikke vår forrige
            const lt = temaLum(getComputedStyle(f).color);
            if (lt === null || temaKontrast(lb, lt) >= 4.5) return;
            const ny = temaLesbar(getComputedStyle(f).color, lb);
            if (!ny) return;
            f.style.color = ny;
            f.dataset.vktSatt = org;
        });
    }

    // Radenes inline tekstfarge, lysnet mens mørkt tema er på. Kjøres i samme takt som resten.
    function temaRadFarger() {
        try {
            const paa = temaPaa();
            temaFontFarger(paa);
            const rader = document.querySelectorAll('tr[style*="color"]');
            if (rader.length > 1200) return;
            rader.forEach(tr => {
                const satt = tr.dataset.vktSatt;
                if (!paa) {
                    // Tilbake til NISSYs egen farge — uendret.
                    if (tr.dataset.vktOrgFarge) {
                        tr.style.color = tr.dataset.vktOrgFarge;
                        delete tr.dataset.vktOrgFarge; delete tr.dataset.vktSatt;
                    }
                    return;
                }
                // Har NISSY re-rendret raden, står det en fersk originalfarge der nå.
                const naa = tr.style.color;
                if (!naa) return;
                if (satt && naa === satt) return;                  // vår egen verdi, allerede rettet
                const org = naa;
                const lb = temaBakLum(tr);
                if (lb === null) return;
                const lt = temaLum(org);
                if (lt === null || temaKontrast(lb, lt) >= 4.5) return;
                const ny = temaLesbar(org, lb);
                if (!ny) return;
                tr.dataset.vktOrgFarge = org;
                tr.style.color = ny;
                tr.dataset.vktSatt = tr.style.color;               // som nettleseren normaliserer den
            });
        } catch (_) {}
    }

    let _kvAdvart = false;
    function temaKontrastPass() {
        try {
            // Bare elementer som SELV bærer en bakgrunn — det er der inline-fargene sitter.
            // Alt annet arver, og da er NISSYs egen tekstfarge allerede riktig.
            const kand = document.querySelectorAll('[bgcolor], [style*="background"]');
            if (kand.length > 1200) {           // vern mot en uventet stor DOM
                if (ER_DEV && !_kvAdvart) { _kvAdvart = true; console.warn('[' + NAVN + '] kontrastvakt: ' + kand.length + ' kandidater — hopper over'); }
                return;
            }
            let rettet = 0;
            kand.forEach(el => {
                // ⚠️ EN INLINE TEKSTFARGE ER ET BEVISST VALG — LA DEN VÆRE (Thomas 25.08).
                //    NISSY skriver status rett på raden: `style="text-decoration:line-through;
                //    color:red;color:#0000CE"`. Gjennomstreking og farge ER data, like mye som
                //    bakgrunnen. Jeg antok tidligere at tekstfarge var ren pynt i NISSY — det var
                //    feil, og vakten skal ikke kunne overskrive et slikt signal uansett hva
                //    kontrastregnestykket sier.
                if (el.style && el.style.color && !el.dataset.vktKv) return;
                const rad = el.closest ? el.closest('tr') : null;
                if (rad && rad !== el && rad.style && rad.style.color) return;
                const st = getComputedStyle(el);
                const bg = st.backgroundColor;
                // Idempotens: har vi rettet dette elementet for SAMME bakgrunn, la det være.
                if (el.dataset.vktKv === bg) return;
                const lb = temaLum(bg);
                if (lb === null) return;
                const lt = temaLum(st.color);
                if (lt === null) return;
                if (temaKontrast(lb, lt) >= 3.5) {
                    // God nok kontrast. Har vi rettet den før, men NISSY har byttet bakgrunn til
                    // noe som nå fungerer, gir vi fargen tilbake til NISSY.
                    if (el.dataset.vktKv !== undefined) { el.style.color = ''; delete el.dataset.vktKv; }
                    return;
                }
                // Mørk tekst på lys bakgrunn, lys tekst på mørk. Ikke rent hvitt/svart —
                // #f1f5f9 og #111827 er mykere å lese på en flate man stirrer på i åtte timer.
                el.style.color = lb > 0.45 ? '#111827' : '#f1f5f9';
                el.dataset.vktKv = bg;
                rettet++;
            });
            if (ER_DEV && rettet) console.log('[' + NAVN + '] kontrastvakt: rettet ' + rettet + ' element(er)');
        } catch (_) {}
    }

    function temaBruk() {
        if (document.getElementById(TEMA_ID)) return;      // idempotent
        const st = document.createElement('style');
        st.id = TEMA_ID;
        st.textContent = TEMA_CSS;
        // SIST i <head> → samme spesifisitet som NISSYs regler, men vinner på rekkefølge.
        document.head.appendChild(st);
    }

    function temaAv() {
        const st = document.getElementById(TEMA_ID);
        if (st && st.parentNode) st.parentNode.removeChild(st);
        temaRadFarger();          // gir NISSY statusfargene tilbake uendret
    }

    function kpLukk() {
        const p = document.getElementById('vkt-kp-panel');
        if (!p) return;
        if (p._vktLoggTmr) clearInterval(p._vktLoggTmr);   // ellers tikker speilingen videre etter lukking
        if (p.parentNode) p.parentNode.removeChild(p);
    }

    // ── PROFIL I PANELET (Thomas 25.08) ────────────────────────────────────────────────
    // Verktøykassen henter allerede brukeren fra backend og legger den på window.__vkt_tilgang
    // (verktoykasse_dev.js:4963). Vi eier ikke dataene her — vi viser dem.
    //
    // AVATAR: karikaturen kommer senere. Plassen lages nå med et initial-merke som genereres
    // LOKALT — deterministisk farge fra navnet, ingen forespørsel, ingen fil å vedlikeholde.
    // Finnes `bilde` i tilgangssvaret en dag, brukes den i stedet. Slik er slottet klart uten at
    // noen må lage 60 karikaturer før panelet kan tas i bruk.
    function kpInitialer(navn) {
        const d = String(navn || '').split(',').map(x => x.trim()).filter(Boolean);
        // NISSY skriver «Etternavn, Fornavn» — fornavn først i initialene.
        const deler = d.length >= 2 ? [d[1], d[0]] : String(navn || '').split(/\s+/);
        return deler.filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('') || '?';
    }
    function kpFarge(navn) {
        let h = 0;
        for (let i = 0; i < String(navn || '').length; i++) h = (h * 31 + navn.charCodeAt(i)) >>> 0;
        return 'hsl(' + (h % 360) + ' 55% 42%)';        // samme navn → samme farge, alltid
    }

    function kpProfil() {
        const t = window.__vkt_tilgang || {};
        const boks = document.createElement('div');
        boks.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px 10px;'
            + 'border-bottom:1px solid #334155;margin-bottom:6px;';

        const av = document.createElement('div');
        av.style.cssText = 'width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;'
            + 'align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;'
            + 'letter-spacing:0.5px;overflow:hidden;border:2px solid #475569;';
        if (t.bilde) {
            const img = document.createElement('img');
            img.src = t.bilde;
            img.alt = '';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            av.appendChild(img);
        } else {
            av.style.background = kpFarge(t.navn);
            av.textContent = kpInitialer(t.navn);
        }
        boks.appendChild(av);

        const kol = document.createElement('div');
        kol.style.cssText = 'min-width:0;flex:1;';

        const rad1 = document.createElement('div');
        rad1.style.cssText = 'display:flex;align-items:center;gap:6px;';
        const navn = document.createElement('span');
        // «Etternavn, Fornavn» → «Fornavn Etternavn». Panelet skal lese som en presentasjon,
        // ikke som et registeroppslag.
        const d = String(t.navn || '').split(',').map(x => x.trim());
        navn.textContent = d.length >= 2 ? (d[1] + ' ' + d[0]) : (t.navn || 'Ukjent bruker');
        navn.style.cssText = 'font-weight:700;font-size:13px;color:#f1f5f9;white-space:nowrap;'
            + 'overflow:hidden;text-overflow:ellipsis;';
        rad1.appendChild(navn);
        if (t.rolle && t.rolle !== 'ansatt') {
            const b = document.createElement('span');
            b.textContent = String(t.rolle).toUpperCase();
            b.style.cssText = 'background:#fbbf24;color:#451a03;font-size:8px;font-weight:700;'
                + 'padding:1px 5px;border-radius:3px;letter-spacing:0.5px;flex-shrink:0;';
            rad1.appendChild(b);
        }
        kol.appendChild(rad1);

        [
            t.kjorekontor ? '🏢 ' + t.kjorekontor : '',
            t.epost || '',
        ].filter(Boolean).forEach(tekst => {
            const r = document.createElement('div');
            r.textContent = tekst;
            r.style.cssText = 'font-size:11px;color:#94a3b8;white-space:nowrap;overflow:hidden;'
                + 'text-overflow:ellipsis;margin-top:1px;';
            r.title = tekst;
            kol.appendChild(r);
        });

        boks.appendChild(kol);
        return boks;
    }

    // Liten seksjonsoverskrift — brukes til å skille «våre» verktøy fra NISSYs egne innstillinger.
    function kpSeksjon(tekst) {
        const d = document.createElement('div');
        d.textContent = tekst;
        d.style.cssText = 'padding:6px 10px 3px;font-size:10px;color:#64748b;text-transform:uppercase;'
            + 'letter-spacing:0.06em;font-weight:700;';
        return d;
    }

    function kpAapne(anker) {
        kpLukk();
        // Skjold-menyen og panelet er begge fixed og like brede — åpne samtidig legger de seg
        // oppå hverandre (Thomas 25.08). De kjenner hverandre nå: den som åpnes, lukker den andre.
        try { if (window.__vkt_meny) window.__vkt_meny.skjul(); } catch (_) {}
        const r = anker.getBoundingClientRect();
        const p = document.createElement('div');
        p.id = 'vkt-kp-panel';
        // position:fixed mot body — IKKE inne i footer-<td>: position:relative på <td> er
        // upålitelig, og overflow i NISSYs nøstede tabeller klipper panelet.
        p.style.cssText = 'position:fixed;left:' + Math.round(r.left) + 'px;bottom:'
            + Math.round(window.innerHeight - r.top + 6) + 'px;z-index:2147483647;'
            + 'background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px;'
            + 'min-width:320px;max-width:340px;'
            + 'box-shadow:0 10px 30px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
            + 'font-size:13px;color:#e2e8f0;';

        p.appendChild(kpProfil());

        const vt = kpSeksjon('Verktøy');
        if (ER_DEV) {
            const d = document.createElement('span');
            d.textContent = ' · DEV';
            d.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
            vt.appendChild(d);
        }
        p.appendChild(vt);

        kpBrytere().forEach(b => {
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;';
            lbl.title = b.tip;
            lbl.onmouseenter = () => { lbl.style.background = '#334155'; };
            lbl.onmouseleave = () => { lbl.style.background = ''; };
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = kpPaa(b.ls, b.standardPaa);
            cb.onchange = () => {
                localStorage.setItem(b.ls, cb.checked ? '1' : '0');
                try { (cb.checked ? b.paa : b.av)(); }
                catch (e) { console.warn('[' + NAVN + '] bryter «' + b.tekst + '»:', e && e.message); }
            };
            lbl.appendChild(cb);
            lbl.appendChild(document.createTextNode(b.ikon + ' ' + b.tekst));
            if (b.beta) {
                const bd = document.createElement('span');
                bd.textContent = 'BETA';
                bd.style.cssText = 'background:#fbbf24;color:#451a03;font-size:9px;font-weight:700;'
                    + 'padding:1px 5px;border-radius:3px;margin-left:auto;letter-spacing:0.5px;';
                lbl.appendChild(bd);
            }
            p.appendChild(lbl);
        });

        // ── Ping, flyttet hit fra footeren ─────────────────────────────────────────
        const pingEl = document.getElementById('buttonPing');
        const loggEl = document.getElementById('logger');
        if (pingEl || loggEl || document.getElementById('dynamic_poster')
            || document.querySelector('select[name="themeid"]')) {
            const strek = document.createElement('div');
            strek.style.cssText = 'border-top:1px solid #334155;margin:6px 0 0;';
            p.appendChild(strek);
            p.appendChild(kpSeksjon('NISSY'));

            if (pingEl) {
                const rad = document.createElement('div');
                rad.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;';
                const knapp = document.createElement('button');
                knapp.type = 'button';
                knapp.textContent = '📡 Ping';
                knapp.title = 'Kaller NISSYs egen ping() — samme knapp som lå i footeren';
                knapp.style.cssText = 'cursor:pointer;font-size:12px;padding:3px 10px;border-radius:6px;'
                    + 'border:1px solid #334155;background:#0f172a;color:#e2e8f0;'
                    + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
                // ⚠️ Klikk på NISSYs EGEN knapp, ikke ping() direkte: da følger vi deres kodesti
                //    uansett hva onclick-attributtet måtte bli endret til.
                knapp.onclick = () => { try { pingEl.click(); } catch (e) { try { window.ping(); } catch (_) {} } };
                rad.appendChild(knapp);
                p.appendChild(rad);
            }

            // «Dynamiske plakater» — speilet avkrysning. Vi KLIKKER originalen i stedet for å
            // sette .checked: da fyrer NISSYs onclick="storeDynamic()" og valget lagres hos dem.
            const dynEl = document.getElementById('dynamic_poster');
            if (dynEl) {
                const lbl = document.createElement('label');
                lbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:6px;cursor:pointer;';
                lbl.title = 'NISSYs egen innstilling — lagres hos dem, ikke hos oss';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = !!dynEl.checked;
                cb.onchange = () => {
                    try { if (dynEl.checked !== cb.checked) dynEl.click(); } catch (_) {}
                    cb.checked = !!dynEl.checked;      // les tilbake — NISSY eier sannheten
                };
                lbl.appendChild(cb);
                lbl.appendChild(document.createTextNode('🖼️ Dynamiske plakater'));
                p.appendChild(lbl);
            }

            // ── Tema ────────────────────────────────────────────────────────────────────
            // ⚠️ IKKE en <select> (Thomas 25.08): den native nedtrekkslisten tegnes UTENFOR
            //    dokumentet, så museklikket på et valg registreres som «utenfor panelet» — og
            //    lukkeren vår rev panelet vekk før change rakk å fyre. Temaet lot seg aldri bytte.
            //    Knapper løser det helt, og de passer uansett bedre: applyTheme laster siden på
            //    nytt (function applyTheme(sel){sel.form.submit();}), så en nedtrekksliste ga
            //    ingen gevinst — det er fire valg, ikke førti.
            const temaEl = document.querySelector('select[name="themeid"]');
            if (temaEl) {
                const rad = document.createElement('div');
                rad.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding:4px 8px 6px;';
                const merk = document.createElement('span');
                merk.textContent = '🎨';
                merk.style.cssText = 'font-size:12px;margin-right:2px;';
                rad.appendChild(merk);
                [...temaEl.options].forEach(o => {
                    const valgt = o.value === temaEl.value;
                    const kn = document.createElement('button');
                    kn.type = 'button';
                    // «&nbsp;Dark theme&nbsp;&nbsp;» → «Dark». NISSYs egne etiketter er polstret
                    // med harde mellomrom og gjentar «theme» i hver eneste.
                    kn.textContent = (o.textContent || o.value)
                        .replace(/\u00a0/g, ' ').replace(/\btheme\b/i, '').replace(/\s+/g, ' ').trim()
                        || o.value;
                    kn.title = 'NISSY-tema — siden lastes på nytt';
                    kn.style.cssText = 'cursor:pointer;font-size:11px;font-weight:600;padding:3px 9px;'
                        + 'border-radius:999px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
                        + (valgt ? 'border:1px solid #d97706;background:#f59e0b;color:#1e293b;'
                                 : 'border:1px solid #334155;background:#0f172a;color:#94a3b8;');
                    kn.onclick = () => {
                        if (valgt) return;
                        try {
                            temaEl.value = o.value;
                            // NISSYs egen kodesti: inline onchange="applyTheme(this)" → form.submit().
                            temaEl.dispatchEvent(new Event('change', { bubbles: true }));
                        } catch (e) { console.warn('[' + NAVN + '] temabytte:', e && e.message); }
                    };
                    rad.appendChild(kn);
                });
                p.appendChild(rad);
            }

            if (loggEl) {
                const boks = document.createElement('div');
                boks.style.cssText = 'margin:2px 8px 6px;padding:5px 7px;background:#0f172a;'
                    + 'border:1px solid #334155;border-radius:6px;max-height:120px;min-height:34px;'
                    + 'overflow:auto;font-size:11px;line-height:1.4;color:#94a3b8;'
                    + 'font-family:ui-monospace,Menlo,monospace;';
                // Speiling, ikke flytting — se kpSkjulPing. Oppdateres mens panelet er åpent, og
                // intervallet ryddes når panelet fjernes (kpLukk).
                const tegn = () => {
                    const t = (loggEl.textContent || '').trim();
                    boks.textContent = t || '(tom)';
                };
                tegn();
                p._vktLoggTmr = setInterval(tegn, 1000);
                p.appendChild(boks);
            }
        }

        document.body.appendChild(p);
        setTimeout(() => {
            const utenfor = (e) => {
                if (p.contains(e.target) || e.target === anker) return;
                // Defensiv: en native popup (select/fil-velger) kan gi mousedown UTENFOR panelet
                // selv om brukeren er midt i å bruke et felt inne i det. Da skal vi ikke lukke.
                if (p.contains(document.activeElement)) return;
                kpLukk();
                document.removeEventListener('mousedown', utenfor, true);
            };
            document.addEventListener('mousedown', utenfor, true);
        }, 0);
    }

    function sikreKontrollpanelKnapp() {
        // Foreldreløst panel (NISSY re-rendret footeren mens det sto åpent) → lukk.
        if (document.getElementById('vkt-kp-panel') && !document.getElementById('vkt-kp-btn')) kpLukk();
        const td = vktFooterTd('vkt-kp-td', 'padding:0 6px;vertical-align:middle;');
        if (!td) return;
        const b = document.createElement('button');
        b.id = 'vkt-kp-btn';
        b.type = 'button';
        b.title = 'Innstillinger — profil, verktøy og NISSYs egne valg';
        b.textContent = '⚙️ Innstillinger';
        // Verktøykassens oransje, samme par som «Vis kart+» og BETA-merkene. Footeren er nå bare
        // våre egne knapper, og da skal de også se ut som én familie (Thomas 25.08).
        // Samme låste boks som verktøykassens footer-knapper (2.211-dev) — de står i
        // samme rekke og må måles likt, selv om de bygges i hver sin fil.
        b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;padding:0 11px;line-height:1;font-size:12px;font-weight:600;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f59e0b;color:#1e293b;border:1px solid #d97706;';
        b.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            document.getElementById('vkt-kp-panel') ? kpLukk() : kpAapne(b);
        };
        td.appendChild(b);
    }

    // ⚠️ AVVIK-DIALOGEN FANT VI IKKE ALLTID (Thomas 26.08: tid og signatur forsvant).
    //    Observeren leter etter teksten «Registrering avvik til ressurs» i en TILFØYD node, og
    //    treffer bare når NISSY bygger opp akkurat den delen på nytt. Åpnes dialogen ved at en
    //    eksisterende #showResourceDeviationPoster bare vises igjen, ser observeren ingenting.
    //    Nå har vi en stabil id å se etter i stedet — dumpen 26.08 ga oss #resourceDeviationText.
    //    Observeren beholdes (den treffer raskere), dette er sikkerhetsnettet.
    function sikreAvvikDialog() {
        const ta = document.getElementById('resourceDeviationText');
        if (ta && !ta.dataset.vktAvvikPynt && ta.offsetParent) {
            try { pyntAvvikDialog(ta); } catch (e) { console.warn('[' + NAVN + '] avvik-dialog:', e && e.message); }
        }
    }
    setInterval(() => { sikreKontrollpanelKnapp(); kpSkjulPing(); temaKontrastPass(); temaRadFarger(); sikreAvvikDialog(); }, 3000);
    setInterval(sikreAvvikDialog, 500);   // dialogen er kortlevd — 3 s er for tregt å vente på  // re-påfør ved NISSY re-render
    setInterval(utvOppdater, 20000);             // skann hvert 20. sek (grunnlinje)
    // Fremmestatus har verken intervall eller skanning: den dekorerer ressurs-popupen når den
    // åpnes, og trenger bare showRes-wrapperen på plass fra start.
    sikreKontrollpanelKnapp(); kpSkjulPing(); utvOppdater();
    if (temaPaa()) temaBruk();     // gjenopprett etter F5 (temaPaa er dev-gated)
    temaKontrastPass();            // alltid — den rører kun det som allerede er uleselig
    temaRadFarger();
    // NISSY re-rendrer tabellen aggressivt → nye rad-elementer mister vkt-haster-klassen, og blinkingen
    // kom ikke tilbake før neste 20s-tick. Observer DOM og kjør utvOppdater rett etter re-render
    // (debouncet). Lytter kun på childList (ikke attributter), så vår egen klasse-endring ikke trigger loop.
    let _utvObsTmr = null;
    const _utvObs = new MutationObserver(() => {
        // Denne observeren betjener KUN utsendelsesvarselet. Fremmestatus lå her før, og krevde
        // da en _frmSkriver-vakt: badgen var en CHILDLIST-mutasjon (appendChild), i motsetning til
        // klasse/tooltip som er ATTRIBUTT-mutasjoner, så observeren fyrte på sin egen badge →
        // 600 ms → ny badge → evig løkke. Med knappen borte er hele den faren ute av bildet.
        if (!utvPaa()) return;
        clearTimeout(_utvObsTmr);
        _utvObsTmr = setTimeout(() => { utvOppdater(); }, 600);
    });
    try { _utvObs.observe(document.body, { childList: true, subtree: true }); } catch (_) {}

    // ═══════════════════════════════════════════════════════════════════════
    //    FREMMESTATUS (v1.135-dev, Thomas 24.08)
    // ═══════════════════════════════════════════════════════════════════════
    // Viser klokkeslettet bilen kom fremme (SUTI 1709) som grønn merkelapp på pågående-rader.
    // Samme idé som Overvåker Lives røde «S»-badge for SPOT, men grønn og med tid.
    //
    // KOSTNAD: STATUS-kolonnen er GRATIS forfilter og er fasit for tilstand (jf. verktoykasse
    // L3599: «SUTI brukes nå kun til KLOKKESLETT, som Status-kolonnen ikke har»). SUTI slås
    // bare opp for rader som ALLEREDE sier «Framme» — typisk 3-10 av 40-120 rader.
    //
    // ⚠️ PARSER: portet fra omraade_assistent.js omrParseSuti (L804-830), IKKE verktøykassens
    //    (L1261-1304). Verktøykassen har `if (!/Bekreftet/.test(rad)) continue;` — men SUTI-radene
    //    er «SutiMsgReceived», og nettopp den porten gjorde parsen TOM i områdeassistenten
    //    (v0.9.23). Livssyklus-koden ligger i «Suti attributt» (<nobr>1709</nobr>), ikke
    //    «Suti kode» (4010 = posisjonsmelding).
    // ── FREMMESTATUS BOR I EGEN FIL ────────────────────────────────────────────────────
    // SUTI-oppslaget (sendt / på vei 3003 / fremme 1709) og seksjonen i NISSYs ressurs-popup
    // ble skilt ut til `fremmestatus_dev.js` 25.08.2026 — 468 linjer, ingen delt tilstand.
    // Samme begrunnelse som da basic_tools selv ble skilt fra verktoykasse: en ferdig, verifisert
    // funksjon skal ikke være låst til utviklingstakten i en fil som itererer. Den lastes av
    // verktøykassen ved siden av denne, og eksponerer parseren på window.__fremmestatus.
    //
    // Fremmestatus levde en periode som en knapp i celle 0 på pågående-rader. Den er fjernet:
    // den kostet 20 s-skanning av 350+ rader og en observer-vakt mot childList-løkke, men verst
    // var at den skrev tekst i en celle andre skript leser som STATUS («AkseptertFremme?» ble
    // matchet som /framme/ av omraade_assistent). Koden finnes i basic_tools_dev.js t.o.m. v1.174.

    // === Samkjørings-knapp i footeren (dev) ===
    // Tidligere kapret vi NISSYs #buttonShowMap (capture-fase + oransj farge). Det er FJERNET
    // (v1.78-dev) — NISSYs «Vis kart» er nå helt urørt/native igjen. I stedet legger vi en EGEN
    // knapp «🗺️ Samkjøring» i footer-raden (ved siden av Logg), som åpner vår samkjørings-popup.
    // Speiler søkelogg-knappens forankring: ny <td> sist i footer-tabellen (#dynamic_poster/#buttonPing).
    function sikreSamkjoringKnapp() {
        if (document.getElementById('vkt-samkjoring-btn')) return;
        // v1.135: gjennom vktFooterTd — denne manglet parent-walken og antok at #dynamic_poster
        // SELV er en <td>. Er den det ikke, havnet knappen ett nivå feil og forsvant stille.
        const td = vktFooterTd('vkt-samkjoring-td', 'padding:0 6px;vertical-align:middle;');
        if (!td) return;
        const b = document.createElement('button');
        b.id = 'vkt-samkjoring-btn';
        b.type = 'button';
        b.title = 'Sjekk samkjøring for markerte turer (kart + omvei + gevinst)';
        b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;padding:0 11px;line-height:1;font-size:12px;font-weight:600;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f59e0b;color:#1e293b;border:1px solid #d97706;';
        b.textContent = '🗺️ Vis kart+';
        b.onclick = () => aapneSamkjoring();
        td.appendChild(b);
    }
    sikreSamkjoringKnapp();
    setInterval(sikreSamkjoringKnapp, 3000);  // re-påfør hvis NISSY re-rendrer footer-raden (billig early-return)

    // === Avvik-dialog dekorator ===
    // NISSY åpner "Registrering avvik til ressurs ..." som en modal med textarea + Lagre.
    // Vi legger på readonly tid-input (live PC-tid) over og navn-input under, og wrapper
    // Lagre slik at textarea-verdien blir "{HH:MM} - {tekst}, {Navn}" rett før native save.
    function naaTid() {
        const d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function hentAvvikSignatur() {
        try {
            const m = document.body.innerHTML.match(/Pasientreisekontor[^<]*(?:\s|&nbsp;)-\s*(?:&nbsp;\s*)*([^<]+)/);
            if (m) {
                const fullNavn = m[1].trim().replace(/&nbsp;/g, '').trim();
                const deler = fullNavn.split(',').map(s => s.trim());
                if (deler.length === 2) return `${deler[1]} ${deler[0].charAt(0)}`;
                return fullNavn;
            }
        } catch (_) {}
        return '';
    }

    function pyntAvvikDialog(textarea) {
        if (textarea.dataset.vktAvvikPynt) return;
        textarea.dataset.vktAvvikPynt = '1';

        // Klatre opptil 6 nivåer for å finne Lagre-knappen i samme dialog
        let scope = textarea.parentElement;
        let lagreBtn = null;
        for (let i = 0; i < 6 && scope; i++) {
            const kandidater = scope.querySelectorAll('input[type="button"], input[type="submit"], button');
            for (const k of kandidater) {
                const tekst = (k.value || k.textContent || '').trim().toLowerCase();
                if (tekst === 'lagre') { lagreBtn = k; break; }
            }
            if (lagreBtn) break;
            scope = scope.parentElement;
        }
        if (!lagreBtn) {
            console.warn(`[${NAVN}] avvik-dialog: fant ikke Lagre-knapp — hopper over dekorasjon`);
            return;
        }

        // ── TIDLIGERE AVVIK OG MERKNADER (Thomas 26.08) ─────────────────────────────
        // ⚠️ Dialogen bærer resId selv: <input type="hidden" id="resourceDeviationId">.
        //    Ingen løyve-gjetting nødvendig — og det er viktig, for løyve→rad er upålitelig
        //    (samme bil kan ha flere rader; vi brente oss på det 25.08).
        //
        // Kilden er Overvåker Lives lettvekts-endepunkt (overvaaker_live.js:137):
        //    ajax-dispatch?update=false&action=showres&rid=<resId>
        // Kun ressursinfo + Merknad/Avvik, ingen admin-innlogging, samme origin.
        // ⚠️ Svaret er ISO-8859-1, ikke UTF-8 — dekodes manuelt, ellers blir æøå til �.
        //
        // Hvorfor det er verdt et kall: operatøren vet i dag IKKE om noen andre allerede har
        // ringt pasienten før hun skriver. Hun må lukke dialogen, åpne ressurskortet, lese,
        // og gå tilbake. Nå står historikken over feltet hun skriver i.
        function avvikHistorikkBoks(resId) {
            const boks = document.createElement('div');
            // ⚠️ LESBARHET FRAMFOR DISKRESJON (Thomas 26.08). Første utkast var 11 px i #4b4b3f
            //    på krem — dempet, som om historikken var en fotnote. Men dette er det operatøren
            //    skal lese FØRST, ofte med telefonen i den andre hånden. Hvit bunn, nær-svart
            //    tekst (#1c1917 ≈ 15:1 kontrast) og 12,5 px. Rammen bærer det visuelle skillet
            //    mot NISSYs krem, ikke en svakere farge.
            boks.style.cssText = 'margin:6px 0 6px;padding:7px 9px;background:#ffffff;'
                + 'border:1px solid #b8ae8a;border-radius:4px;max-height:150px;overflow:auto;'
                + 'font-size:12.5px;line-height:1.5;color:#1c1917;';
            boks.textContent = 'Henter tidligere avvik …';

            const vis = (poster) => {
                if (!document.body.contains(boks)) return;      // dialogen ble lukket
                boks.textContent = '';
                if (!poster.length) {
                    boks.style.color = '#57534e';
                    boks.textContent = 'Ingen tidligere avvik eller merknader på denne ressursen.';
                    return;
                }
                const tittel = document.createElement('div');
                tittel.textContent = 'Tidligere (' + poster.length + ')';
                tittel.style.cssText = 'font-size:10px;text-transform:uppercase;letter-spacing:0.06em;'
                    + 'color:#57534e;font-weight:700;margin-bottom:5px;'
                    + 'border-bottom:1px solid #e7e5e4;padding-bottom:3px;';
                boks.appendChild(tittel);
                poster.forEach(p => {
                    const r = document.createElement('div');
                    // Egen linje per post, med skille når det er flere — lange avvikstekster
                    // brytes over flere linjer, og da er det umulig å se hvor én slutter.
                    r.style.cssText = 'margin:0 0 4px;padding-bottom:4px;'
                        + (poster.length > 1 ? 'border-bottom:1px dotted #d6d3d1;' : '');
                    // ⚠️ MERK UNNTAKET, IKKE REGELEN (Thomas 26.08). Trekanten sto på hver
                    //    eneste linje og bar dermed null informasjon — den sa bare «dette er et
                    //    avvik» i en liste som utelukkende inneholder avvik. Merknader er
                    //    sjeldnere og betyr noe annet, så de beholder sitt merke.
                    if (p.seksjon === 'Merknad') {
                        const m = document.createElement('span');
                        m.textContent = '📝 ';
                        m.title = 'Merknad (ikke avvik)';
                        r.appendChild(m);
                    }
                    // Marker Lives egne markørord, så operatøren ser hva som allerede er
                    // registrert av kontakt — det er ofte hele grunnen til å lese historikken.
                    const del = String(p.tekst).split(/\b(KMP|KMB|EPT|IFS|IST)\b/);
                    del.forEach((d, i) => {
                        if (i % 2 === 1) {
                            const b = document.createElement('b');
                            b.textContent = d;
                            b.style.cssText = 'color:#92400e;background:#fef3c7;padding:0 3px;border-radius:2px;';
                            r.appendChild(b);
                        } else r.appendChild(document.createTextNode(d));
                    });
                    boks.appendChild(r);
                });
            };

            (async () => {
                try {
                    const r = await fetch(NISSY_ORIGIN + '/planlegging/ajax-dispatch?update=false&action=showres&rid='
                        + encodeURIComponent(resId) + '&_=' + Date.now(), { credentials: 'same-origin' });
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    const xml = new TextDecoder('iso-8859-1').decode(await r.arrayBuffer());
                    const poster = [];
                    const seksjon = /<td[^>]*class="reqvtitle"[^>]*>(Merknad|Avvik)<\/td>([\s\S]*?)(?=<td[^>]*class="reqvtitle"|<\/response>|$)/gi;
                    let m;
                    while ((m = seksjon.exec(xml)) !== null) {
                        const navn = m[1];
                        const verdi = /<td[^>]*class="reqv_value"[^>]*>([\s\S]*?)<\/td>/gi;
                        let v;
                        while ((v = verdi.exec(m[2])) !== null) {
                            v[1].split(/<br\s*\/?>/gi)
                                .map(d => d.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
                                .filter(Boolean)
                                .forEach(t => poster.push({ seksjon: navn, tekst: t }));
                        }
                    }
                    if (ER_DEV) console.log('[' + NAVN + '] avvik-historikk for ' + resId + ': ' + poster.length + ' post(er)');
                    vis(poster);
                } catch (e) {
                    if (!document.body.contains(boks)) return;
                    boks.style.color = '#a16207';
                    boks.textContent = 'Kunne ikke hente tidligere avvik (' + (e && e.message) + ')';
                }
            })();
            return boks;
        }

        const signatur = hentAvvikSignatur();
        const labelStil = 'display:block;margin:4px 0 2px;font-size:11px;color:#555;font-family:inherit;';
        const inputStil = 'background:#f3f4f6;border:1px solid #d1d5db;padding:1px 5px;font-family:inherit;color:#374151;font-size:12px;';

        const tidLabel = document.createElement('label');
        tidLabel.style.cssText = labelStil;
        tidLabel.textContent = 'Tid (auto): ';
        const tidInput = document.createElement('input');
        tidInput.type = 'text';
        tidInput.readOnly = true;
        tidInput.value = naaTid();
        tidInput.style.cssText = inputStil + 'width:55px;';
        tidInput.dataset.vktAvvikTid = '1';
        tidLabel.appendChild(tidInput);
        textarea.parentNode.insertBefore(tidLabel, textarea);

        // Historikken øverst — den skal leses FØR man skriver, ikke etterpå.
        const resIdEl = document.getElementById('resourceDeviationId');
        const avvikResId = resIdEl && resIdEl.value;
        if (avvikResId) textarea.parentNode.insertBefore(avvikHistorikkBoks(avvikResId), tidLabel);

        const navnLabel = document.createElement('label');
        navnLabel.style.cssText = labelStil;
        navnLabel.textContent = 'Navn (auto): ';
        const navnInput = document.createElement('input');
        navnInput.type = 'text';
        navnInput.readOnly = true;
        navnInput.value = signatur || '(ukjent)';
        navnInput.style.cssText = inputStil + 'width:140px;';
        navnInput.dataset.vktAvvikNavn = '1';
        navnLabel.appendChild(navnInput);
        textarea.parentNode.insertBefore(navnLabel, textarea.nextSibling);

        // ── RTP / RTB (leders svar 27.08) ───────────────────────────────────────────
        // «T.» foran navnet betyr «snakket med pasient» for et MENNESKE, men ingen maskin kan
        // lese den. Seksjonen har nå bestemt formen: TO markører i stedet for T.
        //      RTP = ringt til pasient
        //      RTB = ringt til behandler
        //
        // ⚠️ RTP ER IKKE KMP. Lives markører (EPT/IFS/KMP/KMB/IST) betyr «Kontakt MED pasient» —
        //    altså at noen faktisk fikk svar. «Ringt til» sier bare at forsøket ble gjort. Å
        //    oversette RTP → KMP for å blidgjøre Live ville registrert kontakt som kanskje aldri
        //    skjedde, og Live bruker KMP-tidspunktet til SMS-timing (overvaaker_live.js:6809).
        //    Vi skriver derfor markørene slik seksjonen har bestemt dem, og lar Live læres opp.
        //    Til det skjer, teller ikke RTP/RTB i sist-kontakt-logikken.
        //
        // Plasseringen er lik KMPs: rett etter «tid - », der Lives regex leter.
        const RTP_VALG = [
            { kode: 'RTP', tekst: 'RTP — ringt til pasient' },
            { kode: 'RTB', tekst: 'RTB — ringt til behandler' },
        ];
        const rtBokser = [];
        const rtRad = document.createElement('div');
        rtRad.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:2px 0;';
        const rtForh = document.createElement('span');
        rtForh.style.cssText = 'font-size:10px;color:#6b7280;';
        const rtMarkorer = () => rtBokser.filter(b => b.checked).map(b => b.dataset.vktKode);
        const tegnForh = () => {
            const m = rtMarkorer();
            rtForh.textContent = m.length ? '→ ' + naaTid() + ' - ' + m.join(' ') + ' …' : '';
        };
        RTP_VALG.forEach(v => {
            const lab = document.createElement('label');
            lab.style.cssText = labelStil + 'cursor:pointer;display:flex;align-items:center;gap:6px;';
            lab.title = 'Skriver «' + v.kode + '» rett etter tidspunktet.\n'
                + v.tekst.replace(' — ', ' = ') + '.\n\n'
                + 'Merk: dette betyr at du RINGTE — ikke at du fikk svar.';
            const boks = document.createElement('input');
            boks.type = 'checkbox';
            boks.dataset.vktKode = v.kode;
            boks.dataset.vktAvvikMarkor = '1';
            boks.style.cssText = 'margin:0;';
            boks.onchange = tegnForh;
            lab.appendChild(boks);
            lab.appendChild(document.createTextNode(v.tekst));
            rtRad.appendChild(lab);
            rtBokser.push(boks);
        });
        rtRad.appendChild(rtForh);
        textarea.parentNode.insertBefore(rtRad, textarea);

        // Live-oppdater tid-input mens dialogen er åpen
        const tidTimer = setInterval(() => {
            if (!document.body.contains(tidInput)) { clearInterval(tidTimer); return; }
            tidInput.value = naaTid();
        }, 1000);

        // Capture-fase: kjør før NISSYs egen click-handler
        lagreBtn.addEventListener('click', function vktAvvikLagre() {
            clearInterval(tidTimer);
            const tid = naaTid();
            const tekst = (textarea.value || '').trim();
            if (!tekst) return;
            const navnDel = signatur ? `, ${signatur}` : '';
            // Markørene MÅ stå rett etter «tid - ». Har operatøren skrevet dem selv, legger vi
            // dem ikke til på nytt — ellers står «RTP RTP» i loggen.
            const m = rtMarkorer().filter(k => !new RegExp('^' + k + '\\b', 'i').test(tekst));
            const pre = m.length ? m.join(' ') + ' ' : '';
            textarea.value = `${tid} - ${pre}${tekst}${navnDel}`;
        }, true);

        console.log(`[${NAVN}] avvik-dialog dekorert (signatur: ${signatur || '∅'})`);
    }

    const avvikObs = new MutationObserver(muts => {
        for (const m of muts) {
            for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (!/Registrering avvik til ressurs/.test(n.textContent || '')) continue;
                const ta = n.querySelector && n.querySelector('textarea');
                if (ta) pyntAvvikDialog(ta);
            }
        }
    });
    avvikObs.observe(document.body, { childList: true, subtree: true });

    console.log(`[${NAVN} v${VERSJON}] aktiv — høyreklikk-meny på V/P-rader + avvik-dialog dekorator`);
})();
