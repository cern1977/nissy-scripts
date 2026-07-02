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
    const VERSJON = '1.104-dev';
    const GMAPS_KEY = 'AIzaSyApih8RVgu4Wa4x2bEWga5eDqwTgVFRagQ';
    const ER_DEV = /\bbasic_tools_dev\b/.test((document.currentScript && document.currentScript.src) || '');
    const NAVN = ER_DEV ? 'BASIC TOOLS DEV' : 'BASIC TOOLS';

    if (window.__basicTools) {
        console.log(`[${NAVN}] allerede lastet — hopper over`);
        return;
    }
    window.__basicTools = { versjon: VERSJON, dev: ER_DEV };

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

    async function endreTidPaaResId(resId, nyTid, gammelTid) {
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

        // Auto-logg total tids-forskyvning i trip.comment.
        // Eksempel: opprinnelig 14:00 → 13:45 (-15), så 13:45 → 13:35 (-10) gir total -25.
        // Hvis comment starter med "+N" eller "-N", legges denne nye endringen til.
        // Hvis total blir 0, fjernes delta-markøren helt (men bevarer evt. resten av meldingen).
        const gMin = tidTilMin(gammelTid);
        const nMin = tidTilMin(nyTid);
        if (gMin !== null && nMin !== null) {
            const denneDelta = nMin - gMin;
            const eksisterende = (fd.get('trip.comment') || '').trim();
            // Plukk ut evt. eksisterende delta foran (f.eks. "-15" eller "+22")
            const m = eksisterende.match(/^([+-]\d+)(?:\s+(.*))?$/);
            const eksisterendeDelta = m ? parseInt(m[1], 10) : 0;
            const resten = m ? (m[2] || '') : eksisterende;
            const total = eksisterendeDelta + denneDelta;
            const merketTotal = total === 0 ? '' : (total > 0 ? '+' : '') + total;
            const deler = [];
            if (merketTotal) deler.push(merketTotal);
            if (resten) deler.push(resten);
            fd.set('trip.comment', deler.join(' ').slice(0, 255));
        }

        const body = [...fd].map(([k, v]) => latin1Form(k) + '=' + latin1Form(String(v))).join('&');
        const res = await fetch(confirmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1' },
            body,
            credentials: 'include'
        });
        return { ok: res.ok, status: res.status };
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
            // v1.103-dev DIAGNOSTIKK (steg 3): reberegner NISSY tider server-side ved adresseendring?
            // Logger tidsfeltene vi POSTet vs det responsen (neste wizard-side) inneholder.
            // Indekserte løkker — Prototype.js overstyrer Array.prototype.filter/map i hovedsiden.
            if (ER_DEV) {
                try {
                    const rhtml = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer());
                    const rdoc = new DOMParser().parseFromString(rhtml, 'text/html');
                    const postet = [];
                    for (const [k, v] of fd) { if (/time|travel|date/i.test(k)) postet.push(k + '=' + v); }
                    const svar = [];
                    const alle = rdoc.querySelectorAll('input, select');
                    for (let i = 0; i < alle.length; i++) {
                        const el = alle[i];
                        if (/time|travel|date/i.test(el.name || '')) svar.push(el.name + '=' + el.value);
                    }
                    console.log('[' + NAVN + '] altRequisition-diagnostikk — POSTet tidsfelter:', postet);
                    console.log('[' + NAVN + '] altRequisition-diagnostikk — responsens tidsfelter (title: «' + (rdoc.title || '') + '»):', svar);
                } catch (_) { /* kun diagnostikk */ }
            }
            return { ok: true, validert: (ende === 'fra' ? fromA : toA) };
        } catch (e) { return { ok: false, feil: e.message }; }
    }
    window.__basicTools.byttAdresse = byttRekvisisjonAdresse;  // popupen kaller dette via window.opener

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

        pop.innerHTML = `
            <div style="font-size:11px;color:#94a3b8;padding:0 2px 6px;border-bottom:1px solid #334155;margin-bottom:8px;">Endre hentetid · ${antall}${devTagHTML}</div>
            ${radHTML}
            <div style="display:flex;justify-content:flex-end;margin-top:6px;">
                <button id="vkt-ok" style="padding:6px 14px;background:#3b82f6;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">OK</button>
            </div>
            <div id="vkt-progress" style="margin-top:6px;font-size:11px;color:#94a3b8;display:none;"></div>
        `;
        document.body.appendChild(pop);

        const r = pop.getBoundingClientRect();
        if (r.right > window.innerWidth) pop.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) pop.style.top = (window.innerHeight - r.height - 8) + 'px';

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
                    const r = await endreTidPaaResId(o.resId, o.tid, o.gammelTid);
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

    function visTrekkTilbakeMeny(turer, x, y) {
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
        tittel.textContent = `${turer.length} tur${turer.length > 1 ? 'er' : ''} valgt`;
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #334155;margin-bottom:4px;';
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
            a.innerHTML = '🔙 Trekk tilbake <span style="font-size:10px;font-style:italic;">(kun fremtidig dato)</span>';
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
                                rekv.push({ reqId: rq, pasient_navn: rek.pasient_navn, fra_adresse: rek.fra_adresse, til_adresse: rek.til_adresse });
                            }
                        } catch (_) {}
                    }
                }
                if (rekv.length) {
                    rekv.forEach(rk => {
                        const harAdr = rk.fra_adresse && rk.til_adresse;
                        turer.push(Object.assign({}, base || {}, {
                            type: 'P', resId: resId, reqId: rk.reqId || null, ventende: false,
                            navn: rk.pasient_navn || (base && base.navn) || resId,
                            fra: harAdr ? rk.fra_adresse : ((base && base.fra) || ''),
                            til: harAdr ? rk.til_adresse : ((base && base.til) || ''),
                            adrKilde: harAdr ? 'admin' : 'tabell',
                            adrFeil: harAdr ? null : 'rekvisisjon uten adresser (er admin innlogget?)'
                        }));
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
            + '  const retur = (_h!=null && _o!=null) ? (_h >= _o) : null;'
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
            + '  const km = async (a,b) => { try { const j = await fetch("https://thomaswestby.no/skript/ruter.php?fra="+encodeURIComponent(renskAdr(a))+"&til="+encodeURIComponent(renskAdr(b))).then(r=>r.json()); return (j&&j.ok)?j:null; } catch(_){ return null; } };'
            + '  const [rOrig, rAlt] = await Promise.all([km(fast, orig), km(fast, altAdr)]);'
            + '  if (!rAlt){ resEl.innerHTML = "<div style=\\"color:#ef4444;font-size:11px;\\">Kunne ikke beregne alternativ rute.</div>"; return; }'
            + '  const kmOrig = rOrig ? rOrig.km : (t.direkteKm!=null?t.direkteKm:null);'
            + '  const kmAlt = rAlt.km;'
            + '  const diff = (kmOrig!=null) ? Math.round((kmAlt-kmOrig)*10)/10 : null;'
            + '  const kortere = (kmOrig==null) || (kmAlt <= kmOrig);'
            + '  resEl.innerHTML = "<div style=\\"padding:8px 10px;border-radius:6px;background:"+(kortere?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.12)")+";border:1px solid "+(kortere?"#22c55e":"#ef4444")+";\\">"'
            + '    + "<div style=\\"font-size:12px;color:#e2e8f0;\\">Opprinnelig: <b>"+(kmOrig!=null?kmOrig+" km":"?")+"</b> &nbsp;|&nbsp; Alternativ: <b>"+kmAlt+" km</b></div>"'
            + '    + "<div style=\\"font-size:13px;font-weight:700;margin-top:4px;color:"+(kortere?"#22c55e":"#ef4444")+";\\">"+(kortere?"✓ Kortere/lik — kan godkjennes":"⚠ Lengre"+(diff!=null?" (+"+diff+" km)":"")+" — pasienten har ikke krav; krever begrunnelse")+"</div></div>";'
            // Skrive-knapp for VENTENDE turer. v1.103: lengre reise blokkeres ikke lenger, men krever
            // OBLIGATORISK begrunnelse (kortere/lik: valgfri kommentar). Auto-notat + kommentar skrives
            // alltid i trip.comment. Pågående → fortsatt sperret (kan bytte transportør).
            + '  const bt = window.opener && window.opener.__basicTools;'
            + '  if (t.ventende && t.resId && bt && bt.byttAdresse) {'
            + '    const ta = document.createElement("textarea");'
            + '    ta.id = "aaKommentar"; ta.rows = 2;'
            + '    ta.placeholder = kortere ? "Kommentar (valgfritt — logges på rekvisisjonen)" : "Begrunnelse — kreves ved lengre reise (hvem godkjente / hvorfor)";'
            + '    ta.style.cssText = "margin-top:8px;width:100%;box-sizing:border-box;padding:7px 9px;background:#0f172a;color:#f8fafc;border:1px solid "+(kortere?"#334155":"#ef4444")+";border-radius:6px;font-size:12px;resize:vertical;";'
            + '    resEl.appendChild(ta);'
            + '    const wb = document.createElement("button");'
            + '    wb.textContent = "✏️ Bytt " + (bytt==="til"?"leveringssted":"hentested") + " i NISSY";'
            + '    wb.style.cssText = "margin-top:6px;width:100%;padding:8px;background:#dc2626;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;";'
            + '    const oppdaterKnapp = () => { const klar = kortere || !!ta.value.trim(); wb.disabled = !klar; wb.style.opacity = klar ? "1" : "0.45"; wb.style.cursor = klar ? "pointer" : "not-allowed"; wb.title = klar ? "" : "Skriv begrunnelse først — lengre reise krever godkjenning"; };'
            + '    ta.addEventListener("input", oppdaterKnapp); oppdaterKnapp();'
            + '    wb.onclick = async () => {'
            + '      if (!kortere && !ta.value.trim()) { ta.focus(); return; }'
            + '      if (!window.confirm("Dette SKRIVER den nye adressen til rekvisisjonen i NISSY:\\n\\n" + altAdr + "\\n\\n(" + (bytt==="til"?"leveringssted":"hentested") + ", ventende tur)\\n\\nKommentar logges på rekvisisjonen. Fortsette?")) return;'
            + '      wb.disabled = true; wb.textContent = "Lagrer…";'
            + '      try {'
            + '        const r = await bt.byttAdresse(t.resId, bytt, alt, { kommentar: ta.value.trim(), kmOrig: kmOrig, kmAlt: kmAlt, origAdr: orig });'
            + '        if (r && r.ok) { wb.textContent = "✓ Adresse byttet i NISSY — verifiser i tabellen"; wb.style.background = "#16a34a"; ta.disabled = true; }'
            + '        else { wb.disabled = false; wb.textContent = "✏️ Prøv igjen"; oppdaterKnapp(); alert("Kunne ikke bytte adresse: " + ((r&&r.feil)||"ukjent feil")); }'
            + '      } catch(e) { wb.disabled = false; wb.textContent = "✏️ Prøv igjen"; oppdaterKnapp(); alert("Feil: " + e.message); }'
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
                if (!args) return;
                turer = [{
                    resId: args.resId,
                    reqId: args.reqId,
                    navn: lesPasientnavnFraRadGeneric(rad) || args.resId,
                    dato: lesAvgangsdatoFraRad(rad)
                }];
            }
            e.preventDefault();
            visTrekkTilbakeMeny(turer, e.clientX, e.clientY);
        }
    }

    document.addEventListener('contextmenu', kontekstmenyHandler, true);

    // ===== UTSENDELSESVARSEL =====
    // Blinker ventende V-rader amber når «send ut»-fristen er passert (samme formel som Område-assistent):
    //   haster når  nå ≥ hentetid(Reisetid-kolonnen) + max(reisetid, 60 min) − 25 min (responstid).
    // reisetid = turens varighet (fra→til via ruter.php, cachet). Av/på via checkbox i footeren.
    const UTV_VARSEL_MIN = 25, UTV_VENTETID_MIN = 60, UTV_LS = 'vkt_utsendelsevarsel';
    const _utvReisetid = {};  // "fra|til" → minutter (cachet i økten)
    function utvRenskAdr(adr) {
        var s = String(adr || '').replace(/<br\s*\/?>/gi, ',').replace(/<[^>]+>/g, ' ');
        var deler = s.split(',').map(function (d) { return d.trim(); }).filter(function (d) { return d && !/^(kommune|kommentar)\s*:/i.test(d); });
        var pnrIdx = -1, i; for (i = 0; i < deler.length; i++) { if (/\b\d{4}\b/.test(deler[i])) { pnrIdx = i; break; } }
        if (pnrIdx > 0) { var gIdx = -1, j; for (j = pnrIdx - 1; j >= 0; j--) { if (/^(\d+\.?\s*etg|etasje|inngang|bygg|avd|hus|plan)\b/i.test(deler[j])) continue; gIdx = j; break; } var gate = gIdx >= 0 ? deler[gIdx].split('/')[0].trim() : ''; return ((gate ? gate + ' ' : '') + deler[pnrIdx]).replace(/\bH\d{3,4}\b/gi, '').replace(/\s+/g, ' ').trim(); }
        return deler.join(' ');
    }
    async function utvReisetidMin(fra, til) {
        const key = fra + '|' + til;
        if (_utvReisetid[key] !== undefined) return _utvReisetid[key];
        try {
            const j = await fetch('https://thomaswestby.no/skript/ruter.php?fra=' + encodeURIComponent(utvRenskAdr(fra)) + '&til=' + encodeURIComponent(utvRenskAdr(til))).then(r => r.json());
            _utvReisetid[key] = (j && j.ok && j.sek) ? Math.round(j.sek / 60) : null;
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
    function utvPaa() { return localStorage.getItem(UTV_LS) === '1'; }
    let _utvKjorer = false;
    async function utvOppdater() {
        if (_utvKjorer) return; _utvKjorer = true;
        try {
            const rader = [...document.querySelectorAll('tr[id^="V-"]')];
            if (!utvPaa()) { rader.forEach(r => r.classList.remove('vkt-haster')); return; }
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
                let rt = UTV_VENTETID_MIN;
                const ft = lesFraTilFraRad(rad);
                if (ft && ft.fra && ft.til) { const m = await utvReisetidMin(ft.fra, ft.til); if (m != null) rt = m; }
                const ventetid = Math.max(rt, UTV_VENTETID_MIN);
                const frist = T + ventetid;
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
    function utvSikreCheckbox() {
        if (document.getElementById('vkt-utv-td')) return;
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        if (!celle) return;
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;
        const td = document.createElement('td');
        td.id = 'vkt-utv-td';
        td.style.cssText = 'padding:0 8px;white-space:nowrap;';
        const lbl = document.createElement('label');
        lbl.style.cssText = 'font-size:11px;color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-family:-apple-system,sans-serif;';
        lbl.title = 'Blink ventende-rader når «send ut»-fristen er passert (reisetid-justert: hentetid + maks(reisetid,60min) − 25min)';
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = utvPaa();
        cb.onchange = () => { localStorage.setItem(UTV_LS, cb.checked ? '1' : '0'); utvOppdater(); };
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode('🔔 Utsendelsesvarsel (beta)'));
        td.appendChild(lbl);
        celle.parentNode.appendChild(td);
    }
    setInterval(utvSikreCheckbox, 3000);  // re-påfør ved NISSY re-render
    setInterval(utvOppdater, 20000);      // skann hvert 20. sek (grunnlinje)
    utvSikreCheckbox(); utvOppdater();
    // NISSY re-rendrer tabellen aggressivt → nye rad-elementer mister vkt-haster-klassen, og blinkingen
    // kom ikke tilbake før neste 20s-tick. Observer DOM og kjør utvOppdater rett etter re-render
    // (debouncet). Lytter kun på childList (ikke attributter), så vår egen klasse-endring ikke trigger loop.
    let _utvObsTmr = null;
    const _utvObs = new MutationObserver(() => {
        if (!utvPaa()) return;
        clearTimeout(_utvObsTmr);
        _utvObsTmr = setTimeout(utvOppdater, 600);  // debounce: re-blink straks etter NISSY re-render
    });
    try { _utvObs.observe(document.body, { childList: true, subtree: true }); } catch (_) {}

    // === Samkjørings-knapp i footeren (dev) ===
    // Tidligere kapret vi NISSYs #buttonShowMap (capture-fase + oransj farge). Det er FJERNET
    // (v1.78-dev) — NISSYs «Vis kart» er nå helt urørt/native igjen. I stedet legger vi en EGEN
    // knapp «🗺️ Samkjøring» i footer-raden (ved siden av Logg), som åpner vår samkjørings-popup.
    // Speiler søkelogg-knappens forankring: ny <td> sist i footer-tabellen (#dynamic_poster/#buttonPing).
    function sikreSamkjoringKnapp() {
        if (document.getElementById('vkt-samkjoring-btn')) return;
        const celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        if (!celle || !celle.parentNode) return;  // footer ikke klar ennå — intervallet prøver igjen
        const td = document.createElement('td');
        td.style.cssText = 'padding:0 6px;vertical-align:middle;';
        const b = document.createElement('button');
        b.id = 'vkt-samkjoring-btn';
        b.type = 'button';
        b.title = 'Sjekk samkjøring for markerte turer (kart + omvei + gevinst)';
        b.style.cssText = [
            'cursor:pointer', 'font-size:12px', 'font-weight:600', 'padding:3px 10px',
            'border-radius:6px', 'border:1px solid #d97706', 'background:#f59e0b', 'color:#1e293b',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'white-space:nowrap'
        ].join(';');
        b.textContent = '🗺️ Vis kart+';
        b.onclick = () => aapneSamkjoring();
        td.appendChild(b);
        celle.parentNode.appendChild(td);
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
            textarea.value = `${tid} - ${tekst}${navnDel}`;
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
