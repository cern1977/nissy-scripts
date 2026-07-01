// === WESTBYS VERKTØYKASSE v2.124-dev ===
// v2.124-dev: toast spør nå ATTEST-REGISTERET via attest-agenten (når tilkoblet) og viser reell aktiv-attest —
//             rekv-søket alene bommet på stående attester (RAZIJA: 5 rekv men aktiv attest). Faller tilbake på
//             rekv-basert deteksjon uten agent. Oppgraderer kun (viser attest når aktive>0), nedgraderer aldri.
// === WESTBYS VERKTØYKASSE v2.123-dev ===
// v2.123-dev: toast-adressen bruker nå samme lyse farge (#f8fafc) som pasientnavnet (var svak grå #64748b).
// v2.122-dev: toast «ingen kort funnet» → dempet 🪪-symbol m/ tooltip (ikke skremmende tekst som forvirrer operatøren).
// === WESTBYS VERKTØYKASSE v2.106-dev ===
// v2.106-dev: DRIFTSMELDING-felt i footeren (per kjørekontor). Til høyre for «🕘 Logg» + «🗗 Vis kart+»
//             vises en amber melding-pill (📣) når kontoret har en aktiv melding. Styres i admin.php
//             («🧰 Verktøykasse»-tab) → ovr_kontor_tilgang.vkt_melding_* → verktoykasse_tilgang.php
//             (t.melding). pollMelding() frisker live ~90s (erAktivEier-guard). À la Overvåker Live.
// === WESTBYS VERKTØYKASSE v2.103-dev ===
// v2.103-dev: ATTEST skilles fra ekte rekvisisjon i pasientlista. searchStatus (ssnSearch)
//             surfacer en stående attest som en «rekvisisjon», men den har INGEN reise —
//             4. arg til getRequisitionDetails(reqId,db,tripid,tripNr) er da `null` (ekte tur
//             har Reisenr). Badge: kun attest → «📄 N attest» (gul) m/ tooltip; miks → «📋 N
//             rekv + 📄 M attest»; ellers «📋 N rekv». (Bekreftet: rekvisisjon-modulen viser
//             «Ingen rekvisisjoner ble funnet» for ren-attest-pasient.) Debug fra v2.102 fjernet.
// === WESTBYS VERKTØYKASSE v2.101-dev ===
// v2.101-dev: ADRESSEVARSEL også for pasienter UTEN rekvisisjon. Når rekv-oppslaget ikke gir
//             pasient_adresse (pasient ringer for å bestille, ingen aktiv rekv) henter vi nå
//             FOLKEREGISTER-adressen fra admin editPatient (pas.rediger_url). Parser adresse-
//             raden (<tr> m/ radio name="default": td[1]=adresse, td[2]=«(Folkeregister)»),
//             prioriterer Folkeregister/ssn-radio, tittel-caser VERSALENE, og kjører samme
//             erVaartOmraade-sjekk → «⚠ IKKE VÅRT OMRÅDE». Cache pr. rediger_url. Merket «(folkereg.)».
// === WESTBYS VERKTØYKASSE v2.99-dev ===
// v2.99-dev: ÉN-INSTANS-EIERSKAP — fikser spøkelses-prod-instans (Jan-Tore: toast hang/dobbeltbesvart,
//            «prod dukket opp»). Rotårsak: dev-takeover satte prod-flagg=false → prod-keeperen re-
//            injiserte prod i evig løkke → to verktøykasser dobbeltkjørte pollerne. Fiks: (1) ikke null
//            prod-flagget; (2) global window.__vkt_eier (dev>prod, ellers nyeste) — alle pollere har
//            `if(!erAktivEier())return`; (3) prod-keeperens inj() viker når dev eier.
// === WESTBYS VERKTØYKASSE v2.98-dev ===
// v2.98-dev: hentTurDetaljerViaRekvnr(rekvnr) — adresseoppslag via searchStatus?nr=<rekvisisjonsnummer>
//            (eksponert på __verktoykasseDev). Lar basic_tools-samkjøring hente admin-adresser uten
//            Reisenr-kolonne; hver rekvisisjon merkes .tripid for ben-valg (tur/retur).
// === WESTBYS VERKTØYKASSE v2.97-dev ===
// v2.97-dev: TLF-TOAST «nummer henger igjen» (Jan-Tore) — × sender nå tlf_svar kategori='lukket'
//            (før: bare DOM-fjerning → jobb pending 10 min → re-pop etter F5). Speiler prod v2.91.
// === WESTBYS VERKTØYKASSE v2.96-dev ===
// v2.96-dev: SØKELOGG-rotårsak FUNNET: Prototype.js (rico) definerer Array.prototype.toJSON →
//            JSON.stringify dobbel-encoder poster-arrayen til STRENG → Array.isArray feiler ved
//            hydrering → logg 0 etter ny fane. Fiks: jsonStringifyTrygt (nøytraliserer toJSON under
//            serialisering) + selvhelbredende lesing (re-parser dobbel-encodede data fra før fiksen).
// === WESTBYS VERKTØYKASSE v2.95-dev ===
// v2.95-dev: TLF-TOAST viser pasientens ADRESSE + varsler «⚠ IKKE VÅRT OMRÅDE» når hjemmeadressens
//            postnr faller utenfor kjørekontorets område-soner (window.__vkt_tilgang.omraade_postnr,
//            samme predikat som Område-assistenten). Adresse hentes fra det eksisterende rekv-oppslaget
//            (pasient_adresse) — ingen ekstra kall. Hjelp operatøren å se om anropet gjelder vår pasient.
// === WESTBYS VERKTØYKASSE v2.94-dev ===
// v2.94-dev: SØKELOGG-fiks — panelet var tomt selv om telleren viste «1». Årsak: Web Storage skrives
//            stille feilet i NISSY (try/catch), og lesningen leste KUN storage. Nå holdes en minne-cache
//            som sann kilde i økten (panelet virker uansett), med localStorage/sessionStorage som
//            best-effort F5-speil. Søkene forlater fortsatt aldri maskinen.
// === WESTBYS VERKTØYKASSE v2.93-dev ===
// v2.93-dev: SØKELOGG overlever F5 — skriver til BÅDE localStorage og sessionStorage og leser den
//            ferskeste. Telleren viste «1» fra minnet, men forsvant ved reload fordi localStorage ikke
//            persisterte i NISSY-konteksten; sessionStorage overlever sidelasting i samme fane.
// === WESTBYS VERKTØYKASSE v2.92-dev ===
// v2.92-dev: SØKELOGG flyttet ned — 🕘-knappen ligger nå inline i NISSYs footer-rad (ved Ping/tema/
//            Dynamiske plakater, masse ledig plass), forankret via #dynamic_poster/#buttonPing-cellen.
//            Frigjør plassen ved Søk/Nullstill; footeren re-rendres ikke av ajax. Panel åpner oppover.
// === WESTBYS VERKTØYKASSE v2.91-dev ===
// v2.91-dev: sjåfør-toast lærer løyvet AV TUREN. Ukjent nummer → operatøren søker opp Reisenr sjåføren
//            spør om → «🔗 Koble til turen jeg fant» leser ressursen RETT fra tur-raden (autoritativt
//            format, ikke operatørens tasting) → «Ja, lagre som C-1048». Løyve-matching normaliseres
//            («C 1048»/«C1048»/«C-1048» = likt). RESSURS-kolonnen leses presist via tr.tbh-header.
//            Manuelt løyve-felt beholdt som fallback.
// === WESTBYS VERKTØYKASSE v2.90-dev ===
// v2.90-dev: SJÅFØRLINJE-toast — anrop på sjåfør-/transportør-kø: slår opp tlf→løyve i selvlærende register
//            (nissy_jobs sjafor_tlf_oppslag/lagre). Treff → finner radene med løyvet i planlegger-tabellene,
//            BLINKER + scroller dit (blå puls 30s) og viser turinfo (tid · fra→til · pasient · status) i
//            toasten. Ukjent nummer → operatøren taster løyvet (lagres → neste gang automatisk).
//            Pasient/Behandler-knappene byttes med «📍 Vis i tabellen»; Avvis beholdes.
// === WESTBYS VERKTØYKASSE v2.89-dev ===
// v2.89-dev: SØKELOGG — alt operatøren søker på i planleggeren (pnr/reisenr/navn, det som står i
//            søkefeltet) huskes LOKALT i localStorage ut dagen (tømmes ved dagsskifte, forlater aldri
//            maskinen). 🕘-knapp ved søkefeltet viser dagens søk m/ klokkeslett+type; klikk på en rad
//            kjører søket på nytt. Capture-fase på #buttonSearch/Enter; dedupe gjentatt likt søk; maks 300.
//            DEV-ONLY til Thomas har testet → promoteres til prod 2.89 (holder versjonene i lås).
// === WESTBYS VERKTØYKASSE v2.88-dev ===
// v2.88-dev: tlf-toast viser NYESTE uviste anrop (server DESC + klient velger høyeste id) → fikser «ny
//            innringer vises ikke». + poll-logg for diagnose.
// v2.87-dev: host-agnostisk — admin/rekvisisjon/planlegging-URLer bruker NISSY_ORIGIN (operatørens
//            faktiske origin) i stedet for hardkodet pastrans-sorost. Fikser CORS-blokk for operatører
//            på nissy6.pasientreiser.nhn.no (annet NISSY-domene). Fallback til pastrans hvis ikke *.nhn.no.
// v2.86-dev: pasientliste — ikke-anropere på samme nummer merkes nøytralt '👥 TILKNYTTET'
//            (familie/husstand) i stedet for 'SANNSYNLIG PASIENT'. Operatøren vet hvem
//            pasienten er; badgen skal ikke påstå pasient-tilhørighet. TILKNYTTET vises
//            kun når anroperen faktisk ble funnet i lista (navn-match med Zisson).
// v2.85-dev: tlf-toast auto-søker pasient når køen er en pasientlinje (ko_navn matcher
//            pasient|innringer|privat) — også uten kort. Operatøren på Oslo Pasientlinjene
//            slipper å klikke Pasient. Krever at zisson.php sender ko_navn i tlf_ny-jobben.
// v2.84-dev: eksponer tilgang på window.__vkt_tilgang (Område assistent leser omraade_postnr).
// v2.83-dev: keeper-popup åpnes automatisk ved oppstart (hopper over hvis en keeper allerede
//            lever via __vkt_keeper_alive-hjerteslag, så F5 ikke stjeler fokus).
// v2.82-dev: utlogget-toast fjernet — admin/rek-tilgang finnes i menyen (statusprikker + snarveier).
// v2.80-dev: Tlf-toast auto-klikker Pasient-knappen også når kortet har gyldig 11-sifret pnr.
// v2.78-dev: send skript-navn på heartbeat (ikke bare start) så sesjon-loggen
//            korrigerer skript='Live'-default for økter som allerede kjører.
//            (Backend live_sesjon.php droppet skript i INSERT → alt etter v2.57
//            ble lagret som default 'Live'. Backend fikset samtidig.)
// v2.77-dev: auto-trigger NISSY-søk når anrop-kort har rolle "Pasient (selv)" —
//            operatør slipper å klikke Pasient-knappen manuelt for kjente pasient-numre.
// v2.76-dev: strip "Pasientreiser "-prefiks fra legacy localStorage-override
//            (vkt_kjorekontor_override) — backend kjenner kun korte kontornavn.
// v2.75-dev: cache-bust på verktoykasse_tilgang.php-fetch. Varnish hadde
//            dobbelt-encoded gammel respons selv med Cache-Control: no-store.
// v2.74-dev: kontornavn uten "Pasientreiser "-prefiks — "Oslo og Akershus" / "Innlandet"
//            (regex strpper det fra NISSY-tittelen, all DB-data er migrert)
// v2.73-dev: send kontor_kode igjen til sesjon-loggen (egen kolonne i sesjoner.php)
//            så vi ser hvilken bookmarklet som ble brukt — kommentar lagres på koden
// v2.72-dev: les vkt_*_pr-nøkler (pasientreiser-bookmarklets) først, fall
//            tilbake til vkt_* for bakoverkompat med /OUS/-bookmarkleter
// v2.71-dev: sesjon-logging bruker EGENTLIG kjorekontor (fra NISSY-tittel),
//            ikke localStorage-override. Override gjelder kun for tilgang/UI —
//            din identitet i sesjoner forblir ditt faktiske kontor.
// v2.70-dev: send kontor til verktoykasse_tilgang.php så superadmin kan bruke
//            Innlandet-bookmarkleten til å teste Innlandet-tilgang fra Oslo-login
// v2.69-dev: "Åpne admin/rek →"-knappene i utlogget-toasten injiserer nå agenten
//            i den åpnede taben (samme flyt som menyens snarveier)
// v2.68-dev: utvid OUS-only-filter til å fange både 'overvaker_*' (1 a) og
//            'overvaaker_*' (2 a) — filnavnene er inkonsistent skrevet i tilgang
// v2.67-dev: SIKKERHETS-FIX 3 — hentTilgang-fallback ga ut Overvåker Live + Avvik
//            som standard ved fetch-feil. Nå returneres TOM verktoy-liste; bruker
//            må ha gyldig tilgangsrad. (Eileen så Live/Avvik uten tildelt tilgang.)
// v2.66-dev: SIKKERHETS-FIX 2 — send nissy=<brukernavn> til tlf_pending så backend
//            kun returnerer den innloggede brukerens egne anrop (ikke broadcast).
//            Backend filtrerer mot dp_ansatte-aliaser, samme mønster som nissy_naviger.
// v2.65-dev: SIKKERHETS-FIX — pollTlfVentende skipper polling når kjorekontor er
//            et annet kontor enn Oslo og Akershus (Zisson-tlf-jobber er per i dag
//            OUS-spesifikke; backend-filter må bygges som ekte fiks).
// v2.64-dev: kompakt pill (6/10 padding, 12px font) + filter ut OUS-only skript
//            (Overvåker Live/Avvik) når kjorekontor ≠ Oslo og Akershus
// v2.63-dev: nøytral pill-knapp "🔧 Verktøykasse" når kjorekontor ≠ Oslo og Akershus
// v2.62-dev: bytt OUS-skjold til 🔧 (skrunøkkel) når kjorekontor ≠ "Oslo og Akershus"
//            (skjoldet er OUS prehospital sin merkevare; ikke for andre kontor)
// v2.61-dev: send vkt_kontor_kode (6-tegns bookmarklet-id) til sesjon-loggen så vi
//            kan spore hvilken test-bookmarklet som ble brukt
// v2.60-dev: localStorage.vkt_kjorekontor_override har forrang for kjorekontor-deteksjon
//            (test-bookmarklet kan tvinge f.eks. "Innlandet" fra Oslo-login)
// v2.59-dev: trim "for " fra kjørekontor-match ("Pasientreisekontor for X" → "X")
// v2.58-dev: hent kjørekontor-navn fra document.title (fallback til body) og
//            send det med på start/heartbeat så sesjon-tabellen kan filtrere per kontor
// v2.57-dev: tlf-toast — vis anroper-navn fra Zisson, beregn alder fra pnr,
//            marker pasientliste-treff som '📞 ANROPER' (navn-match) og resten
//            som 'sannsynlig pasient' (yngst først)
// v2.56-dev: tlf-toast — vis pasient-navn + pasient-tlf når kortet har det,
//            og søk NISSY på BÅDE anrops-tlf og pasient-tlf når Pasient klikkes
// v2.55-dev: tlf-toast — fjern forrige toast automatisk når ny kommer (ikke stable)
// HARDKODET DEV: filen brukes kun via dev-keeper-popup (bookmarklet), ikke via Pinger.
// Launcher-meny som lastes inn i NISSY via Pinger.js-override.
// v2.11: dev/prod-split via filnavn-detektering (verktoykasse_dev.js har eget flagg så
//        prod og dev kan kjøre i parallell — egen bookmarklet aktiverer dev manuelt)
// v2.12-dev: planlegging søke-input — fjern form.submit() (forårsaket page-reload-blink)
// v2.0: ekstrahert "Endre hentetid" + høyreklikk-meny til basic_tools.js (egen prod/dev-fil).
//       Verktoykasse er nå ren shell — status-glow, drag, dropdown, polling, tilgang-loading.
//       Basic Tools auto-lastes etter tilgang er hentet. Toggle for dev-versjon i menyen (superadmin).
// v2.1: kompakt meny + Admin/Rekvisisjon-snarveier i header med statusprikker
// v2.2: vis Basic Tools-versjon i bunn av menyen (med DEV-tag hvis dev-modus)
// v2.3: tlf-oppslag (findPatient) — speiler pnr-flyten, lagres i nissy_oppslag med type='tlf'
// v2.4: nissy_naviger — generisk modul-navigering (rekvisisjon først, designet for å plugge inn flere)
// v2.5: window.__verktoykasse = { utforNissyNaviger, sjekkNavigerEtterLoad, pollNissyNaviger } for debug
// v2.6: nissy_naviger åpner i navngitt vindu (window.open) i stedet for å overstyre admin-tab
// v2.7: auto-submit form i den nye taben — verktøykasse kjører ikke på rekvisisjons-sider
// v2.8: same-origin DOM-tilgang i ny tab — fyll ssn og klikk søk-knapp i den faktiske form-siden
// v2.9: filtrer naviger-kø på operatørens nissy-brukernavn så hver bruker kun får sine jobber
// v2.10: nissy_naviger støtter modul='planlegging' (åpner /planlegging/ og fyller søk=ssn:<pnr>)
// v1.2: turid-polling + badge på 🧰
// v1.3: admin-session-sjekk + keep-alive ping
// v1.4: faktisk henting av turdetaljer fra admin (ajax_reqdetails)
// v1.5: turid → (reqId, resId) via searchStatus (tur/retur støttes)
// v1.6: rekvisisjons-modul keep-alive (separat indikator)
// v1.7: pnr-oppslag (ssnSearch) — henter kommende turer for et fnr
// v1.8: høyreklikk-meny på markerte turer i Planlegger — Endre hentetid
// v1.9: høyreklikk kun på ventende-rader (V-), ikke pågående — pågående krever tilstandssjekk
// v1.10: vis versjon i meny-header + tooltip
// v1.11: vis nåværende hentetid(er) i Endre-tid-modal (lest fra blå Reise tid-kolonne)
// v1.12: nåværende tid blir placeholder i input — ingen egen "Tid nå"-linje
// v1.13: defensiv DOM-fjerning (Rico kræsjer på .remove() når elementet er borte)
// v1.14: les markerte fra DOM (blå rader), ikke g_voppLS.selected — sistnevnte ga "0"
// v1.15: debug-logging i høyreklikk-handler for å spore resId="0"-bug
// v1.16: fiks hardkodet "v1.8"-streng i log + vis array-innhold direkte
// v1.17: bruk index-løkke i stedet for entries()-destructuring (NISSY/Rico ga resId=0)
// v1.18: userid = NISSY-brukernavn (thwe), ikke tall — confirm-API godtar brukernavn
// v1.19: legg til windowName/instanceId i DWR-encrypt — påkrevd av server
// v1.20: behold httpSessionId — server krever den også
// v1.21: oppdater DWR-regex til å matche ny syntaks (dwr.engine.remote.handleCallback)
// v1.22: fjern debug-log fra kontekstmenyHandler — Endre hentetid bekreftet fungerende
// v1.23: Endre-tid blir popover ved cursor (ikke fullscreen modal) + slankere layout
// v1.24: ett input-felt per tur med pasientnavn — kan endre ulike tider samtidig
// v1.25: status-glow følger skjold-formen (drop-shadow), ikke firkant (box-shadow)
// v1.26: større skjold-knapp (72×82 → 110×130)
// v1.27: enda 1.5x større skjold (110×130 → 165×195)
// v1.28: mindre status-glow (4+10px → 2+5px) — passer bedre med større skjold
// v1.29: clip-path skjold-silhuett — bare skjoldet er klikkbart, ikke firkanten
// v1.30: separer klikk-flate fra glow — bilde+glow under, klikk-flate (skjold-form) over
// v1.31: stram klikk-polygon mer — glow-området skal ikke være klikkbart
// v1.32: fjern filter-endring på hover (kun skalering nå) — glow konstant
// v1.33: fiks toggle — mousedown lukket meny før hver klikk, så klikk alltid åpnet
// v1.34: fjern dobbeltklikk-reset (kolliderte med rask toggle)
// v1.35: auto-logger tidsendring til trip.comment ("gammel→ny av brukernavn")
(function() {
    // v2.109-dev: VASK område-soner mot NISSY. Leser kontorets Område-felt (dispatchFilter.fromPostCodes1)
    //             fra editDispatchCenter?id=<dispatch_center_id> live (maks 1×/døgn) og oppdaterer
    //             ovr_kontor_tilgang.omraade_postnr via kjorekontor_vask.php → «IKKE VÅRT OMRÅDE» holder
    //             seg riktig uten manuelt vedlikehold. OoA=560, Innlandet=14802 (alt konfigurert).
    // v2.110-dev: NASJONAL kjørekontor-liste. hoestAlleKjorekontor() leser ALLE dispatch-sentre
    //             (getDispatchCenter + hvert editDispatchCenter→fromPostCodes1, maks 1×/uke) → nasjonal
    //             ovr_kjorekontor via kjorekontor_lagre.php. Toasten viser «→ <kontor>» ved «IKKE VÅRT
    //             OMRÅDE» (kjorekontor.php?postnr=…). Egen tabell, ikke ovr_kontor_tilgang.
    // v2.120-dev: Attest-statusprikk i skjoldet blir GRØNN når attest-agenten er tilkoblet
    //             (vkt_attest_klar + fana lever), grå ellers. Planleggeren svarer attest-agenten med sin
    //             origin (vkt_planlegger_origin) så agenten kan rewrite nissy6-lenker til riktig host.
    // v2.119-dev: UNIVERSAL DISPATCHER — samme bookmarklet velger agent ut fra HVOR den klikkes
    //             (attest-ui→attest-agent, /rekvisisjon/→rekv-agent, /administrasjon/→admin-agent,
    //             ellers planlegging→skjold). Kjører in-page → virker på pastrans, nissy6 OG attest-ui.
    //             Generaliserer v2.116. Én bookmarklet overalt.
    // v2.118-dev: tre launch-knapper nederst i keeper-popupen (⚙️ Admin · 📝 Rekvisisjon · 📋 Attest).
    //             Kaller window.opener.__vkt_launch(modul) → åpner siden via patchet window.open →
    //             auto-injiserer agenten (same-origin). Attest via startAttest; nissy6-slutt = bookmarklet.
    // v2.117-dev: Attest-snarvei åpner nå NISSYs startAttest på SAMME origin (pastrans) i stedet for å
    //             hoppe rett til attest-ui (cross-origin). Da beholder keeperen handamtaket og re-injiserer
    //             rekvisisjons-agenten når attest-flyten KOMMER TILBAKE til en /rekvisisjon/-side (selv
    //             etter cross-origin-omvei via attest-ui). Thomas' «lille hack som faktisk virker».
    // v2.116-dev: bookmarklet klikket på en /rekvisisjon/-side (f.eks. nissy6-altRequisition via attest,
    //             ANNEN vert enn planleggeren → cross-origin, kan ikke auto-injiseres) injiserer nå
    //             rekvisisjons-agenten i SELVE vinduet i stedet for skjoldet. Samme bookmarklet, ett klikk.
    // v2.115-dev: AUTO-FANG NISSY-åpnede popups — patcher window.open (transparent) så et /rekvisisjon/-
    //             eller /administrasjon/-vindu NISSY åpner SELV registreres + får rask 300ms-innskyting
    //             med en gang (var ~20s før, fordi bare verktøykasse-åpnede vinduer ble fanget).
    // v2.114-dev: RASKERE agent-gjenoppretting etter F5 i agent-fane (rekvisisjon/admin). Keeperen
    //             pollet hvert 5s og prøvde injisering kun ÉN gang per runde → opptil ~20s før agenten
    //             kom tilbake. Nå: 2s-runder + bytt til rask 300ms-poll (injiserAgentNårKlar) straks
    //             flagget mangler, med per-tab guard mot stabling.
    // v2.108-dev: FIX «nummer låser seg» (Jan-Tore) — sokTlfINissy/findPatient manglet timeout;
    //             hengende kall låste «Søker...»-knappen permanent (kun F5 frigjorde). AbortController
    //             15 s → feiler tydelig → knapp re-aktiveres, retry uten F5.
    const VERSJON = '2.124';
    // Hardkodet ER_DEV — fila brukes kun for dev-keeper-popup, ikke som prod
    const ER_DEV = false;
    const FLAG = ER_DEV ? '__westbyVerktoykasse_dev' : '__westbyVerktoykasse';
    function trygtFjern(el) {
        if (el && el.parentNode) {
            try { el.parentNode.removeChild(el); } catch (_) {}
        }
    }
    if (window[FLAG]) {
        console.log('[VERKTØYKASSE' + (ER_DEV ? ' DEV' : '') + '] allerede lastet, hopper over');
        return;
    }
    // Prod-cleanup: hvis Pinger har auto-lastet prod først, fjern prod-skjoldet
    // før vi tar over. Vi vil ikke ha to skjold på skjermen samtidig.
    // NB: vi setter IKKE prod-flagget til false lenger — det fikk prod-keeperen til å
    // tro at prod ikke var lastet og RE-INJISERE prod i evig løkke (spøkelses-instans
    // som dobbeltkjørte pollerne → tlf-toast hang/dobbeltbesvart). Flagget holdes truthy
    // så prod-keeperens inj() står ned; eierskapet under sørger for at prod-pollerne viker.
    if (ER_DEV && window.__westbyVerktoykasse) {
        try {
            trygtFjern(document.getElementById('vkt-skjold'));
            trygtFjern(document.getElementById('vkt-skjold-meny'));
            console.log('[VERKTØYKASSE DEV] tok over fra prod (Pinger auto-load)');
        } catch (e) {
            console.warn('[VERKTØYKASSE DEV] prod-cleanup feilet:', e.message);
        }
    }
    // === UNIVERSAL DISPATCHER ===
    // Samme bookmarklet lastes OVERALT; vi velger agent ut fra HVOR vi er. Bookmarkleten kjører IN-PAGE
    // (same-origin med siden), så den virker på pastrans, nissy6 OG attest-ui — det er nettopp dette som
    // kommer forbi cross-origin-veggen. Planlegging (eller ukjent side) → ingen treff → fortsett ned til
    // skjold-flyten. Rekvisisjon/admin gjenkjennes på path; attest på host (pathen der er bare «/»).
    {
        let aFil = null, aFlag = null;
        if (/attest-ui\.pasientreiser\.nhn\.no/i.test(location.hostname || '')) {
            aFil = ER_DEV ? 'verktoykasse_attest_dev.js' : 'verktoykasse_attest.js';
            aFlag = ER_DEV ? '__vkt_attest_dev_agent' : '__vkt_attest_agent';
        } else if (/^\/rekvisisjon\//.test(location.pathname || '')) {
            aFil = ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js';
            aFlag = ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent';
        } else if (/^\/administrasjon\//.test(location.pathname || '')) {
            aFil = ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js';
            aFlag = ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent';
        }
        if (aFil) {
            if (!window[aFlag]) {
                const s = document.createElement('script');
                s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + aFil + '&_=' + Date.now();
                document.head.appendChild(s);
                console.log('[VERKTØYKASSE] dispatcher → ' + aFil + ' (' + location.hostname + location.pathname + ')');
            }
            return;  // ikke tegn planlegger-skjoldet — vi er på en agent-side
        }
    }
    window[FLAG] = VERSJON;
    if (!ER_DEV) window.__VERKTOYKASSE_VERSION = VERSJON;
    // Sticky aktiv-variant — admin/rekvisisjon-agentene re-injiserer DENNE varianten (ikke sin egen
    // hardkodede). Slik injiserer en gammel prod-agent dev når operatøren kjører dev → ingen spøkelses-prod.
    try { localStorage.setItem('vkt_variant', ER_DEV ? 'dev' : 'prod'); } catch (_) {}

    // === ÉN-INSTANS-EIERSKAP ===
    // Flere verktøykasser (prod + dev) kan havne i samme planleggervindu (keeper re-injiserer).
    // Da dobbeltkjørte pollerne. Løsning: én global eier (window.__vkt_eier); DEV vinner alltid
    // over prod, ellers nyeste instans. Pollere og keeper-inj respekterer eierskapet.
    const INSTANS_ID = (ER_DEV ? 'dev' : 'prod') + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    function kanEie() {
        const e = window.__vkt_eier;
        if (!e || e.id === INSTANS_ID) return true;
        if (ER_DEV && !e.dev) return true;       // dev tar alltid over prod
        if (e.dev && !ER_DEV) return false;      // prod viker for dev
        return true;                              // samme type → nyeste (re-injisert) tar over
    }
    if (kanEie()) window.__vkt_eier = { id: INSTANS_ID, dev: ER_DEV, t: Date.now() };
    function erAktivEier() { return !!(window.__vkt_eier && window.__vkt_eier.id === INSTANS_ID); }

    const SERVER = 'https://thomaswestby.no/skript/skript.php?fil=';
    const TILGANG_URL = 'https://thomaswestby.no/skript/verktoykasse_tilgang.php';
    const JOBS_URL    = 'https://thomaswestby.no/skript/nissy_jobs.php';
    // NISSY nås via flere domener (pastrans-sorost.mq.nhn.no, nissy6.pasientreiser.nhn.no, …).
    // Bruk operatørens FAKTISKE origin så admin-/rekvisisjon-kall blir same-origin (ellers CORS-blokk).
    const NISSY_ORIGIN = (typeof location !== 'undefined' && /\.nhn\.no$/i.test(location.hostname || '')) ? location.origin : 'https://pastrans-sorost.mq.nhn.no';
    const ADMIN_BASE  = NISSY_ORIGIN + '/administrasjon/admin';
    const ADMIN_URL   = NISSY_ORIGIN + '/administrasjon/';
    const REK_URL     = NISSY_ORIGIN + '/rekvisisjon/requisition';

    const ADMIN_PING_MS = 180000;   // 3 min keep-alive (admin + rekvisisjon)
    const TURID_POLL_MS = 15000;    // 15 sek ventende-sjekk

    let knappRef = null;             // referanse til 🧰-knappen
    let adminStatus = 'ukjent';      // 'ok' | 'utlogget' | 'feil' | 'ukjent'
    let rekStatus   = 'ukjent';      // samme verdier — rekvisisjons-modul

    // === ADMIN-SESJON — samme pattern som overvaaker_avvik.js ===
    async function sjekkAdminLogin() {
        try {
            const res = await fetch(`${ADMIN_BASE}/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (res.status === 401 || res.status === 403) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (HTTP ' + res.status + ')');
                return false;
            }
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (login-side detektert)');
                return false;
            }
            return true;
        } catch (e) {
            console.warn('[VERKTØYKASSE] Admin-sjekk feilet:', e.message);
            return null;  // nettverksfeil, ikke samme som utlogget
        }
    }

    async function oppdaterAdminStatus() {
        const result = await sjekkAdminLogin();
        if (result === true) adminStatus = 'ok';
        else if (result === false) adminStatus = 'utlogget';
        else adminStatus = 'feil';
        tegnAdminStatus();
        console.log('[VERKTØYKASSE] Admin-status:', adminStatus);
        return adminStatus;
    }

    // === REKVISISJONS-MODUL — keep-alive (separat sesjon enn admin) ===
    async function sjekkRekvisisjonLogin() {
        try {
            const res = await fetch(REK_URL, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) return false;
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                return false;
            }
            return true;
        } catch(e) {
            console.warn('[VERKTØYKASSE] Rekvisisjon-sjekk feilet:', e.message);
            return null;
        }
    }

    async function oppdaterRekvisisjonStatus() {
        const result = await sjekkRekvisisjonLogin();
        if (result === true) rekStatus = 'ok';
        else if (result === false) rekStatus = 'utlogget';
        else rekStatus = 'feil';
        tegnAdminStatus();  // samme tegne-funksjon oppdaterer begge visningene
        console.log('[VERKTØYKASSE] Rekvisisjon-status:', rekStatus);
        return rekStatus;
    }

    // NISSY-brukernavn fra cookie-prefix (samme logikk som Avvik/Live-skriptene)
    function hentNissyBrukernavn() {
        try {
            const lagret = localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret.trim().toLowerCase();
            const cookies = document.cookie.split(';').map(c => c.trim());
            const suffikser = ['efilter', 'vfilter', 'rfilter', 'popp', 'vopp'];
            for (const c of cookies) {
                const navn = c.split('=')[0];
                for (const s of suffikser) {
                    if (navn.endsWith(s) && navn.length > s.length) {
                        return navn.slice(0, -s.length).toLowerCase();
                    }
                }
            }
        } catch(e) {}
        return '';
    }

    async function hentTilgang(nissy) {
        try {
            const kontor = hentKjorekontor() || '';
            // Cache-bust: Varnish-cachen kan ha gamle (feil-encoded) responser selv
            // når PHP setter Cache-Control: no-store. Unik _ssikrer fersk svar.
            const url = `${TILGANG_URL}?nissy=${encodeURIComponent(nissy || '')}`
                + (kontor ? `&kontor=${encodeURIComponent(kontor)}` : '')
                + `&_=${Date.now()}`;
            const r = await fetch(url, { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return await r.json();
        } catch(e) {
            // SIKKERHET: aldri gi ut verktøy som standard ved feil — bruker må ha gyldig
            // tilgangsrad. Tidligere fallback ga Live + Avvik til alle, inkl. Eileen.
            console.warn('[VERKTØYKASSE] Feil ved henting av tilgang — viser ingen verktøy:', e.message);
            return { funnet: false, navn: null, verktoy: [] };
        }
    }

    // Alle kandidat-brukernavn fra cookiene (det kan henge igjen cookies fra en annen
    // NISSY-økt, f.eks. «twestby» fra Innlandet + «thwe» fra Oslo). Returnerer unik liste.
    function hentNissyKandidater() {
        const kand = [];
        try {
            const cookies = document.cookie.split(';').map(c => c.trim());
            const suffikser = ['efilter', 'vfilter', 'rfilter', 'popp', 'vopp'];
            for (const c of cookies) {
                const navn = c.split('=')[0];
                for (const s of suffikser) {
                    if (navn.endsWith(s) && navn.length > s.length) {
                        const b = navn.slice(0, -s.length).toLowerCase();
                        if (b && !kand.includes(b)) kand.push(b);
                    }
                }
            }
        } catch (e) {}
        return kand;
    }

    // Prøver kandidatene mot tilgang og bruker den som faktisk er registrert (funnet:true).
    // Cacher den løste brukeren i localStorage så tlf/sesjon/userid blir riktige overalt.
    async function loesNissyOgTilgang() {
        const kandidater = hentNissyKandidater();
        // Forkast stale cache som ikke lenger er blant cookiene (annen bruker / økt)
        const cache = (localStorage.getItem('ovr_nissy_brukernavn') || '').trim().toLowerCase();
        if (cache && !kandidater.includes(cache)) { try { localStorage.removeItem('ovr_nissy_brukernavn'); } catch (e) {} }
        const prov = (cache && kandidater.includes(cache)) ? [cache].concat(kandidater.filter(k => k !== cache)) : kandidater;
        console.log(`[VERKTØYKASSE v${VERSJON}] nissy-kandidater: ${prov.join(', ') || '(ingen)'}`);
        let t = null, nissy = '';
        for (const k of prov) { const r = await hentTilgang(k); if (r && r.funnet) { t = r; nissy = k; break; } }
        if (!t) { nissy = prov[0] || ''; t = await hentTilgang(nissy); }
        if (t.funnet && nissy) { try { localStorage.setItem('ovr_nissy_brukernavn', nissy); } catch (e) {} }
        console.log(`[VERKTØYKASSE v${VERSJON}] valgt nissy_id=${nissy || '(tom)'} (funnet=${t.funnet})`);
        return { nissy, t };
    }

    function tegnMeny(tilgang) {
        const knapp = document.createElement('div');
        knapp.id = ER_DEV ? 'vkt-skjold-dev' : 'vkt-skjold';
        knapp.setAttribute('role', 'button');
        knapp.setAttribute('tabindex', '0');
        knapp.title = (ER_DEV ? '[DEV] ' : '') + (tilgang.navn ? `Verktøykasse v${VERSJON} — ${tilgang.navn}` : `Westbys verktøykasse v${VERSJON}`);
        // Dev-versjon plasseres litt ned/venstre så prod og dev ikke overlapper, og får gul label-tag
        const startTop = ER_DEV ? '210px' : '6px';
        knapp.style.cssText = [
            'position:fixed', `top:${startTop}`, 'right:8px', 'z-index:2147483647',
            'width:165px', 'height:195px', 'border:none', 'background:transparent',
            'cursor:default', 'transition:transform 0.15s',
            'padding:0', 'overflow:visible',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-size:36px', 'line-height:1'
        ].join(';');
        if (ER_DEV) {
            const devLabel = document.createElement('div');
            devLabel.textContent = 'DEV';
            devLabel.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);background:#fbbf24;color:#451a03;font-weight:700;font-size:11px;letter-spacing:1px;padding:2px 8px;border-radius:0 0 6px 6px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;z-index:1;';
            knapp.appendChild(devLabel);
        }

        // Skjoldet tilhører OUS prehospital — kun for Oslo og Akershus.
        // Andre kontor får 🔧 (skrunøkkel) som nøytralt verktøy-symbol.
        const erOslo = /oslo og akershus/i.test(hentKjorekontor() || '');
        let klikkFlateStil;
        if (erOslo) {
            const logoImg = document.createElement('img');
            logoImg.src = 'https://thomaswestby.no/img/pre_logo.png';
            logoImg.alt = '';
            logoImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));transition:filter 0.15s;pointer-events:none;';
            logoImg.onerror = () => {
                knapp.removeChild(logoImg);
                knapp.textContent = '🏥';
            };
            knapp.appendChild(logoImg);
            klikkFlateStil = 'clip-path:polygon(50% 10%, 78% 18%, 78% 50%, 68% 78%, 50% 86%, 32% 78%, 22% 50%, 22% 18%)';
        } else {
            // Kompakt nøytral pill-knapp — overstyrer shield-dimensjonene
            knapp.style.cssText = [
                'position:fixed', `top:${startTop}`, 'right:8px', 'z-index:2147483647',
                'padding:5px 10px',
                'background:#1e293b', 'border:1px solid #334155', 'border-radius:6px',
                'font-size:12px', 'font-weight:600', 'color:#e2e8f0',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
                'box-shadow:0 2px 6px rgba(0,0,0,0.4)',
                'cursor:pointer', 'user-select:none',
                'transition:transform 0.15s, background 0.15s',
                'display:flex', 'align-items:center', 'gap:4px',
                'line-height:1.2'
            ].join(';');

            const tekst = document.createElement('span');
            tekst.textContent = '🔧 Verktøykasse';
            tekst.style.pointerEvents = 'none';
            knapp.appendChild(tekst);

            klikkFlateStil = '';  // hele pillen er klikkbar — ingen clip-path nødvendig
        }

        // Klikk-flate over ikonet — fanger bare klikk på selve formen
        const klikkFlate = document.createElement('div');
        klikkFlate.style.cssText = [
            'position:absolute', 'inset:0', 'z-index:1',
            'cursor:pointer',
            klikkFlateStil
        ].join(';');
        knapp.appendChild(klikkFlate);

        klikkFlate.onmouseover = () => {
            knapp.style.transform = 'scale(1.1)';
        };
        klikkFlate.onmouseout = () => {
            knapp.style.transform = '';
        };

        // Meny
        const meny = document.createElement('div');
        meny.id = ER_DEV ? 'vkt-skjold-dev-meny' : 'vkt-skjold-meny';
        meny.style.cssText = [
            'position:fixed', 'top:60px', 'right:10px', 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:10px',
            'padding:4px', 'display:none', 'min-width:220px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif'
        ].join(';');

        // Header
        const h = document.createElement('div');
        h.textContent = tilgang.navn ? tilgang.navn.split(',')[0] : 'Westbys verktøykasse';
        h.style.cssText = 'padding:6px 10px 4px;font-size:11px;color:#f8fafc;font-weight:700;display:flex;align-items:center;gap:6px;';
        const ver = document.createElement('span');
        ver.textContent = `v${VERSJON}`;
        ver.style.cssText = 'font-size:9px;color:#64748b;font-weight:500;';
        h.appendChild(ver);
        if (tilgang.rolle && tilgang.rolle !== 'ansatt') {
            const badge = document.createElement('span');
            badge.textContent = tilgang.rolle.toUpperCase();
            badge.style.cssText = 'font-size:8px;padding:1px 4px;background:#1d4ed8;color:#bfdbfe;border-radius:3px;font-weight:700;';
            h.appendChild(badge);
        }
        meny.appendChild(h);

        // Admin / Rekvisisjon-snarveier med statusprikker
        // For Rekvisisjon: åpne i navngitt tab + injiser agent (mutual keeper-mønster)
        const lagSnarvei = (tekst, url, statusKey, agent) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 8px;color:#e2e8f0;text-decoration:none;font-size:11px;border-radius:5px;background:#0f172a;border:1px solid #334155;transition:background 0.1s;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '#0f172a';
            const prikk = document.createElement('span');
            prikk.dataset.statusFor = statusKey;
            prikk.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#64748b;flex-shrink:0;';
            const t = document.createElement('span');
            t.textContent = tekst;
            a.appendChild(prikk);
            a.appendChild(t);
            // Hvis agent er gitt: åpne i navngitt tab + injiser agent + holdTabLevende
            if (agent) {
                a.onclick = (e) => {
                    e.preventDefault();
                    const w = window.open(url, agent.tabName);
                    if (!w) { alert('Popup blokkert'); return; }
                    try { w.focus(); } catch (_) {}
                    injiserAgentNårKlar(w, agent.fil, agent.flag, agent.pathPrefix);
                    holdTabLevende(w, agent.tabName, url, agent.fil, agent.flag, agent.pathPrefix);
                };
            }
            return a;
        };
        const snarveier = document.createElement('div');
        snarveier.style.cssText = 'display:flex;gap:4px;padding:0 4px 4px;';
        snarveier.appendChild(lagSnarvei('Admin', ADMIN_URL, 'admin', {
            tabName: ER_DEV ? 'nissy-admin-dev' : 'nissy-admin',
            fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js',
            flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent',
            pathPrefix: '/administrasjon/'
        }));
        snarveier.appendChild(lagSnarvei('Rekvisisjon', REK_URL, 'rek', {
            tabName: ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon',
            fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
            flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
            pathPrefix: '/rekvisisjon/'
        }));
        // Attest-snarvei: åpne via NISSYs egen startAttest på SAMME origin (pastrans) i stedet for
        // å hoppe rett til attest-ui (cross-origin). Da beholder vi handamtaket til vinduet — og keeperen
        // re-injiserer rekvisisjons-agenten når flyten KOMMER TILBAKE til en /rekvisisjon/-side, selv
        // etter en cross-origin-omvei via attest-ui. (Var: window.open mot attest-ui → vinduet mistet.)
        const attestSnarvei = lagSnarvei('Attest', NISSY_ORIGIN + '/rekvisisjon/requisition/startAttest', 'attest', {
            tabName: ER_DEV ? 'nissy-attest-dev' : 'nissy-attest',
            fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
            flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
            pathPrefix: '/rekvisisjon/'
        });
        attestSnarvei.title = 'Åpne Attest via startAttest (samme origin) — agenten injiseres når flyten lander på rekvisisjon';
        snarveier.appendChild(attestSnarvei);
        meny.appendChild(snarveier);

        // "Hold aktiv etter F5" — åpner keeper-popup som re-injiserer verktøykassen
        // automatisk ved F5. Holder også basic_tools levende fordi lastBasicTools
        // kalles ved hver init.
        const keeperRad = document.createElement('div');
        keeperRad.style.cssText = 'padding:0 4px 4px;';
        const keeperKnapp = document.createElement('a');
        keeperKnapp.href = '#';
        keeperKnapp.textContent = '🛡 Hold aktiv etter F5';
        keeperKnapp.title = 'Åpner liten popup som re-injiserer verktøykassen automatisk etter F5 i NISSY';
        keeperKnapp.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;color:#fbbf24;text-decoration:none;font-size:11px;font-weight:600;border-radius:5px;background:#0f172a;border:1px solid #334155;transition:background 0.1s;';
        keeperKnapp.onmouseover = () => keeperKnapp.style.background = '#334155';
        keeperKnapp.onmouseout = () => keeperKnapp.style.background = '#0f172a';
        keeperKnapp.onclick = (e) => {
            e.preventDefault();
            apneKeeperPopup();
        };
        keeperRad.appendChild(keeperKnapp);
        meny.appendChild(keeperRad);

        const skille = document.createElement('div');
        skille.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(skille);

        if (!tilgang.verktoy || tilgang.verktoy.length === 0) {
            const tom = document.createElement('div');
            tom.textContent = 'Ingen tilgjengelige verktøy';
            tom.style.cssText = 'padding:8px 10px;font-size:11px;color:#64748b;text-align:center;font-style:italic;';
            meny.appendChild(tom);
        }

        // OUS-only verktøy som ikke vises for andre kontor (skjult når !erOslo).
        // Filnavnene er inkonsistent skrevet (overvaker_* / overvaaker_*), så
        // regexen tar én eller flere a-er. Vi matcher også på visningsnavn for sikkerhets skyld.
        const erOusOnly = (v) => {
            const fil = v.fil || '';
            const navn = v.navn || '';
            return /overva+ker_(live|avvik)/i.test(fil)
                || /overv[aå]ker\s+(live|avvik)/i.test(navn);
        };
        tilgang.verktoy.forEach(v => {
            if (v.separator) {
                const sep = document.createElement('div');
                sep.textContent = v.tekst;
                sep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
                meny.appendChild(sep);
                return;
            }
            if (!erOslo && erOusOnly(v)) {
                console.log(`[VERKTØYKASSE] skjuler ${v.navn} (OUS-only, kjørekontor=${hentKjorekontor() || '?'})`);
                return;
            }
            const lenke = document.createElement('a');
            lenke.href = '#';
            lenke.style.cssText = 'display:flex;align-items:center;gap:7px;padding:5px 10px;color:#e2e8f0;text-decoration:none;font-size:12px;border-radius:5px;transition:background 0.1s;';
            lenke.onmouseover = () => lenke.style.background = '#334155';
            lenke.onmouseout = () => lenke.style.background = '';

            const prikk = document.createElement('span');
            prikk.style.cssText = `width:6px;height:6px;border-radius:50%;background:${v.farge};flex-shrink:0;`;
            lenke.appendChild(prikk);

            const navn = document.createElement('span');
            navn.textContent = v.navn;
            lenke.appendChild(navn);

            lenke.onclick = (e) => {
                e.preventDefault();
                const s = document.createElement('script');
                s.src = SERVER + v.fil + '&_=' + Date.now();
                s.onload = () => console.log('[VERKTØYKASSE] lastet:', v.fil);
                s.onerror = () => alert('Feil ved lasting av ' + v.fil);
                document.head.appendChild(s);
                meny.style.display = 'none';
            };
            meny.appendChild(lenke);
        });

        // Footer
        if (!tilgang.funnet) {
            const f = document.createElement('div');
            f.textContent = 'Ukjent bruker — viser standardsett';
            f.style.cssText = 'padding:5px 10px;font-size:9px;color:#64748b;border-top:1px solid #334155;margin-top:2px;font-style:italic;';
            meny.appendChild(f);
        }

        // Basic Tools-versjon — oppdateres når basic_tools.js har lastet
        const btFooter = document.createElement('div');
        btFooter.id = 'vkt-bt-versjon';
        btFooter.style.cssText = 'padding:4px 10px;font-size:9px;color:#475569;border-top:1px solid #334155;margin-top:2px;display:flex;align-items:center;gap:4px;';
        btFooter.innerHTML = 'Basic Tools <span data-bt-ver>laster…</span>';
        meny.appendChild(btFooter);

        // AVANSERT-seksjon — kun synlig for superadmin
        if (tilgang.rolle === 'superadmin') {
            const devSep = document.createElement('div');
            devSep.textContent = 'AVANSERT';
            devSep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
            meny.appendChild(devSep);

            // Fake anrop — for å teste tlf-toast uten reell innkommende
            const fakeLenke = document.createElement('div');
            fakeLenke.textContent = '🎲 Fake anrop';
            fakeLenke.style.cssText = 'padding:5px 10px;color:#fbbf24;cursor:pointer;border-radius:4px;font-size:11px;';
            fakeLenke.onmouseover = () => fakeLenke.style.background = '#334155';
            fakeLenke.onmouseout = () => fakeLenke.style.background = '';
            fakeLenke.onclick = async () => {
                const tlf = prompt('Telefonnummer (8 siffer):', '12345678');
                if (!tlf) return;
                try {
                    const api = window.__verktoykasseDev || window.__verktoykasse;
                    await api.testTlf(tlf, { kort_id: 1, ko_navn: 'Test-kø' });
                } catch (e) { console.warn('[VERKTØYKASSE] fake anrop feilet:', e); }
            };
            meny.appendChild(fakeLenke);
        }

        // === Drag + posisjon-persistens ===
        // Lagrer posisjon i localStorage så operatør beholder den mellom F5.
        const LS_KEY = ER_DEV ? 'vkt_widget_pos_dev' : 'vkt_widget_pos';
        let drar = false;
        let harFlyttet = false;
        let offsetX = 0, offsetY = 0;
        let startX = 0, startY = 0;

        // Plasser menyen relativt til knappen (så den følger med når knappen flyttes)
        function plassérMeny() {
            const r = knapp.getBoundingClientRect();
            const menyBredde = 240;
            // Hvis knappen er på venstre halvdel: meny til høyre for knappen.
            // Ellers: meny til venstre av knappen.
            const plassLeft = (r.left < window.innerWidth / 2) ? r.left : Math.max(10, r.right - menyBredde);
            // Hvis knappen er øverst: meny under. Hvis nederst: meny over.
            const plassTop = (r.top < window.innerHeight / 2) ? r.bottom + 8 : r.top - 10;
            meny.style.left = plassLeft + 'px';
            meny.style.top = plassTop + 'px';
            meny.style.right = 'auto';
            if (r.top >= window.innerHeight / 2) {
                meny.style.transform = 'translateY(-100%)';
            } else {
                meny.style.transform = '';
            }
        }

        // Hent lagret posisjon
        try {
            const lagret = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
            if (lagret && typeof lagret.left === 'string' && typeof lagret.top === 'string') {
                knapp.style.left = lagret.left;
                knapp.style.top = lagret.top;
                knapp.style.right = 'auto';
            }
        } catch (_) { /* ignore */ }

        knapp.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;  // kun venstre-klikk
            drar = true;
            harFlyttet = false;
            const r = knapp.getBoundingClientRect();
            offsetX = e.clientX - r.left;
            offsetY = e.clientY - r.top;
            startX = e.clientX;
            startY = e.clientY;
            // Ikke skjul menyen her — vi vet ikke ennå om dette blir en drag eller en klikk.
            // Lukke-på-drag skjer i mousemove når terskelen passeres.
        });

        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (!harFlyttet && dx < 4 && dy < 4) return;  // terskel før vi kaller det drag
            if (!harFlyttet) meny.style.display = 'none';  // skjul meny når drag faktisk starter
            harFlyttet = true;
            // Klamp mot vindu
            const maksX = window.innerWidth - knapp.offsetWidth - 2;
            const maksY = window.innerHeight - knapp.offsetHeight - 2;
            const nyX = Math.max(2, Math.min(maksX, e.clientX - offsetX));
            const nyY = Math.max(2, Math.min(maksY, e.clientY - offsetY));
            knapp.style.left = nyX + 'px';
            knapp.style.top = nyY + 'px';
            knapp.style.right = 'auto';
            knapp.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            if (!drar) return;
            drar = false;
            knapp.style.cursor = '';
            if (harFlyttet) {
                try {
                    localStorage.setItem(LS_KEY, JSON.stringify({
                        left: knapp.style.left,
                        top: knapp.style.top
                    }));
                } catch (_) { /* ignore (quota full, privacy mode, osv.) */ }
            }
        });

        // Dobbel-klikk for å resette posisjon (tilbake til øverst høyre)
        // Oppdater meny-posisjon ved vindu-resize (så den ikke blir liggende utenfor)
        window.addEventListener('resize', () => {
            if (meny.style.display === 'block') plassérMeny();
            const r = knapp.getBoundingClientRect();
            if (r.right > window.innerWidth || r.bottom > window.innerHeight) {
                const nyX = Math.max(2, Math.min(window.innerWidth - knapp.offsetWidth - 2, r.left));
                const nyY = Math.max(2, Math.min(window.innerHeight - knapp.offsetHeight - 2, r.top));
                knapp.style.left = nyX + 'px';
                knapp.style.top = nyY + 'px';
                knapp.style.right = 'auto';
            }
        });

        // Toggle meny — bare når klikk landet på klikkFlate (skjold-silhuett)
        klikkFlate.onclick = (e) => {
            e.stopPropagation();
            if (harFlyttet) {
                harFlyttet = false;
                return;
            }
            if (meny.style.display === 'none' || !meny.style.display) {
                plassérMeny();
                meny.style.display = 'block';
            } else {
                meny.style.display = 'none';
            }
        };
        document.addEventListener('click', (e) => {
            if (!meny.contains(e.target) && !knapp.contains(e.target)) meny.style.display = 'none';
        });

        (document.documentElement || document.body).appendChild(knapp);
        (document.documentElement || document.body).appendChild(meny);
        knappRef = knapp;
    }

    // === Admin-status-visning: ring + bakgrunn + puls ved utlogging ===
    function tegnAdminStatus() {
        if (!knappRef) return;
        // Puls-animasjon — bruker drop-shadow på selve skjold-formen, ikke box-shadow på firkant
        if (!document.getElementById('vkt-style')) {
            const st = document.createElement('style');
            st.id = 'vkt-style';
            st.textContent = `
                @keyframes vkt-pulse {
                    0%, 100% { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 2px #ef4444); }
                    50%      { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 5px #ef4444) drop-shadow(0 0 9px rgba(239,68,68,0.6)); }
                }
            `;
            document.head.appendChild(st);
        }

        // Fjern evt. gammel rekDot
        trygtFjern(knappRef.querySelector('.vkt-rekdot'));

        const logoImg = knappRef.querySelector('img');
        // Optimistisk: anta grønt frem til vi har bekreftet feil. 'ukjent' (før første sjekk)
        // teller som ok så skjoldet ikke flasher rødt under oppstart.
        const harFeil = ['utlogget', 'feil'].includes(adminStatus) || ['utlogget', 'feil'].includes(rekStatus);
        const noeUtlogget = adminStatus === 'utlogget' || rekStatus === 'utlogget';

        // Status-glow som følger formen (drop-shadow stacker — base mørk skygge + farget glow)
        knappRef.style.boxShadow = '';
        knappRef.style.animation = '';
        if (logoImg) {
            const glowColor = harFeil ? '#ef4444' : '#10b981';
            const baseShadow = 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))';
            const hoverShadow = 'drop-shadow(0 6px 18px rgba(0,0,0,0.65))';
            const glow = `drop-shadow(0 0 2px ${glowColor}) drop-shadow(0 0 5px ${glowColor})`;
            logoImg.dataset.normalFilter = `${baseShadow} ${glow}`;
            logoImg.dataset.hoverFilter = `${hoverShadow} ${glow}`;
            // Hvis puls aktiv, la animasjonen styre filter — ellers sett statisk
            if (noeUtlogget) {
                logoImg.style.animation = 'vkt-pulse 1.8s ease-in-out infinite';
                logoImg.style.filter = '';
            } else {
                logoImg.style.animation = '';
                logoImg.style.filter = logoImg.dataset.normalFilter;
            }
        }

        // Tooltip — kort beskrivelse av hva som er feil
        const grunnTittel = knappRef.dataset.tittel || knappRef.title.split('\n')[0];
        knappRef.dataset.tittel = grunnTittel;
        const feilLinjer = [];
        if (adminStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Admin: UTLOGGET','feil':'⚠ Admin: ukjent feil','ukjent':'⏳ Admin: sjekkes…'}[adminStatus] || adminStatus
        );
        if (rekStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Rekvisisjon: UTLOGGET','feil':'⚠ Rekvisisjon: ukjent feil','ukjent':'⏳ Rekvisisjon: sjekkes…'}[rekStatus] || rekStatus
        );
        knappRef.title = feilLinjer.length
            ? `${grunnTittel}\n${feilLinjer.join('\n')}`
            : grunnTittel;

        // Oppdater statusprikker i meny-snarveiene (admin / rekvisisjon)
        const farge = (s) => s === 'ok' ? '#10b981' : (s === 'utlogget' ? '#ef4444' : '#fbbf24');
        document.querySelectorAll('[data-status-for="admin"]').forEach(el => el.style.background = farge(adminStatus));
        document.querySelectorAll('[data-status-for="rek"]').forEach(el => el.style.background = farge(rekStatus));
        // Attest: grønn når attest-agenten er tilkoblet (vkt_attest_klar mottatt + fana lever), ellers grå.
        let attestFarge = '#64748b';
        try {
            if (attestTabRef && attestTabRef.closed) attestTabReady = false;
            if (attestTabReady && attestTabRef && !attestTabRef.closed) attestFarge = '#10b981';
        } catch (_) {}
        document.querySelectorAll('[data-status-for="attest"]').forEach(el => el.style.background = attestFarge);

        // Utlogget-toast fjernet — tilgang/status finnes i menyen (statusprikker + snarveier).
        const eksisterende = document.getElementById('vkt-toast');
        if (eksisterende) trygtFjern(eksisterende);
    }

    // === Turid-polling: sjekker ventende turids hvert 15. sek ===
    function oppdaterBadge(antall) {
        if (!knappRef) return;
        let badge = knappRef.querySelector('.vkt-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'vkt-badge';
            badge.style.cssText = [
                'position:absolute','top:-4px','right:-4px',
                'min-width:18px','height:18px','border-radius:9px',
                'background:#ef4444','color:white','font-size:11px','font-weight:700',
                'display:none','align-items:center','justify-content:center',
                'padding:0 5px','box-shadow:0 2px 6px rgba(0,0,0,0.3)',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
                'line-height:1','pointer-events:none'
            ].join(';');
            knappRef.appendChild(badge);
        }
        if (antall > 0) {
            badge.textContent = antall;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // === Hent turdetaljer fra NISSY admin ===
    // Steg 1: POST searchStatus for å oversette turid → (reqId, db, resId)
    // Steg 2: For hver rekvisisjon, kall ajax_reqdetails og parse
    // Pattern: overvaker_live.js "Søk på turid"-flyten
    async function hentTurDetaljer(turid) {
        try {
            // STEG 1: Søk etter turid
            const searchBody = `submit_action=tripSearch&tripNr=${turid}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            console.log(`[VERKTØYKASSE] searchStatus: tripNr=${turid}`);
            const searchRes = await fetch(
                `${ADMIN_BASE}/searchStatus`,
                { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: searchBody }
            );
            if (!searchRes.ok) return { feil: `searchStatus HTTP ${searchRes.status}`, turid };
            const searchHtml = await searchRes.text();

            // Parse getRequisitionDetails(reqId, db, resId) — alle rekvisisjoner for denne turen
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(searchHtml)) !== null) {
                if (!matches.find(x => x.tripid === m[3])) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
                }
            }

            if (matches.length === 0) {
                console.warn(`[VERKTØYKASSE] ✗ Turid ${turid}: ingen rekvisisjoner funnet`);
                return { feil: 'ingen treff i searchStatus', turid, rekvisisjoner: [] };
            }
            console.log(`[VERKTØYKASSE] Turid ${turid}: ${matches.length} rekvisisjon(er) funnet`);

            // STEG 2: Hent detaljer for hver rekvisisjon
            const rekvisisjoner = [];
            for (const { reqId, db, tripid } of matches) {
                const d = await hentRekvisisjon(reqId, db, tripid, turid);
                if (d) rekvisisjoner.push(d);
            }

            return { turid, hentet: new Date().toISOString(), antall_rekvisisjoner: rekvisisjoner.length, rekvisisjoner };
        } catch (e) {
            console.warn(`[VERKTØYKASSE] hentTurDetaljer ${turid}:`, e.message);
            return { feil: e.message, turid };
        }
    }

    // Variant: hent via REKVISISJONSNUMMER (searchStatus?nr=) i stedet for turid. Fungerer
    // UTEN Reisenr-kolonne — rekvnr ligger i hver rads «searchStatus?nr=…»-onclick. Hver
    // returnert rekvisisjon merkes med .tripid (= resurs-id) så konsumenten kan plukke riktig
    // ben (tur/retur) ut fra rad-id-en (V-<resId>). Samme detalj-parsing som turid-flyten.
    async function hentTurDetaljerViaRekvnr(rekvnr) {
        try {
            console.log(`[VERKTØYKASSE] searchStatus: nr=${rekvnr}`);
            const searchRes = await fetch(`${ADMIN_BASE}/searchStatus?nr=${encodeURIComponent(rekvnr)}`, { credentials: 'same-origin' });
            if (!searchRes.ok) return { feil: `searchStatus HTTP ${searchRes.status}`, rekvnr };
            const searchHtml = await searchRes.text();
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(searchHtml)) !== null) {
                if (!matches.find(x => x.tripid === m[3])) matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
            }
            if (matches.length === 0) return { feil: 'ingen treff i searchStatus', rekvnr, rekvisisjoner: [] };
            const rekvisisjoner = [];
            for (const { reqId, db, tripid } of matches) {
                const d = await hentRekvisisjon(reqId, db, tripid, '');
                if (d) { d.tripid = tripid; rekvisisjoner.push(d); }
            }
            return { rekvnr, hentet: new Date().toISOString(), antall_rekvisisjoner: rekvisisjoner.length, rekvisisjoner };
        } catch (e) {
            console.warn(`[VERKTØYKASSE] hentTurDetaljerViaRekvnr ${rekvnr}:`, e.message);
            return { feil: e.message, rekvnr };
        }
    }

    async function hentRekvisisjon(reqId, db, tripid, turid) {
        const url = `${ADMIN_BASE}/ajax_reqdetails?id=${reqId}&db=${db}&tripid=${tripid}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${turid}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const html = await res.text();
        if (html.length < 500) return null;

        const data = { reqId: +reqId, db: +db, tripid: +tripid };

        const henteIdx = html.indexOf('Hentested');
        const leverIdx = html.indexOf('Leveringssted');

        // Pasient (før Hentested)
        if (henteIdx > -1) {
            const pas = html.substring(0, henteIdx);
            const navnM = pas.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const addrMatches = [...pas.matchAll(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const postMatches = [...pas.matchAll(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const sisteAddr = addrMatches.length ? addrMatches[addrMatches.length-1][1].trim().replace(/[HU]\d{4}/g,'').replace(/\s+/g,' ').trim() : '';
            const sistePost = postMatches.length ? postMatches[postMatches.length-1][1].trim() : '';
            data.pasient_navn = navnM ? navnM[1].replace(/\s+/g, ' ').trim() : '';
            data.pasient_adresse = (sisteAddr + (sistePost ? ', ' + sistePost : '')).replace(/\s+/g, ' ').trim();
            const pnrM = pas.match(/Personnr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i) || pas.match(/F[\.\s]*dato[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.pasient_pnr = pnrM ? pnrM[1].replace(/\s+/g, ' ').trim() : '';
        }

        // Hentested
        if (henteIdx > -1) {
            const slutt = leverIdx > henteIdx ? leverIdx : html.indexOf('</fieldset>', henteIdx);
            const hb = html.substring(henteIdx, slutt > henteIdx ? slutt : undefined);
            const navnM = hb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = hb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = hb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.fra_navn = navnM ? navnM[1].trim() : '';
            data.fra_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Leveringssted
        if (leverIdx > -1) {
            const slutt = html.indexOf('</fieldset>', leverIdx);
            const lb = html.substring(leverIdx, slutt > leverIdx ? slutt : undefined);
            const navnM = lb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = lb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = lb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.til_navn = navnM ? navnM[1].trim() : '';
            data.til_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Rekvisisjonsnummer (12 sifre)
        const rekM = html.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i) || html.match(/>(\d{12})<\/b>/);
        data.rek_nr = rekM ? rekM[1] : null;

        // Retning
        const retnM = html.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
        data.retning = retnM ? retnM[1].trim() : null;

        // Rekvirent
        const rekvM = html.match(/Rekvirent[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        data.rekvirent = rekvM ? rekvM[1].trim() : '';

        // ATTEST-deteksjon (autoritativ, server-side): NISSY skriver «Har gyldig attest» ved
        // pasientnavnet på detaljsiden, og en ren attest har INGEN tur (ingen Hentested/
        // Leveringssted → «Ingen rekvisisjoner funnet»). En ekte tur har alltid hente-/leveringssted.
        data.har_gyldig_attest = /gyldig\s+attest/i.test(html);
        data.har_tur = (henteIdx > -1) || (leverIdx > -1);

        // Geo: sutiXml-IDer i HTML gir lat/long når de slåes opp separat
        const xmlIds = [...new Set([...html.matchAll(/sutiXml\?id=(\d+)/g)].map(m => m[1]))];
        data.geo_punkter = [];
        for (const xmlId of xmlIds.slice(0, 6)) {  // cap for å unngå mange kall
            try {
                const r = await fetch(`${ADMIN_BASE}/sutiXml?id=${xmlId}`);
                const xt = await r.text();
                const latM  = xt.match(/lat="([\d.]+)"/);
                const longM = xt.match(/long="([\d.]+)"/);
                if (latM && longM) {
                    data.geo_punkter.push({ xmlId, lat: +latM[1], long: +longM[1] });
                }
            } catch(e) {}
        }

        return data;
    }

    // === PNR-OPPSLAG — ssnSearch i admin, returnerer alle kommende/aktive rekvisisjoner ===
    async function sokPnrINissy(pnr) {
        try {
            const body = `submit_action=ssnSearch&ssn=${pnr}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            const r = await fetch(`${ADMIN_BASE}/searchStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (!r.ok) return { feil: `searchStatus HTTP ${r.status}` };
            const html = await r.text();

            // Parse unike (reqId, db, tripid)-kombinasjoner.
            // 4. argument til getRequisitionDetails = Reisenr (tripNr). ATTEST har INGEN
            // reise → 4. arg er `null` (ekte tur har et tall). Det er attest-signaturen.
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(null|\d+))?/gi;
            const matches = [];
            let m;
            while ((m = idRegex.exec(html)) !== null) {
                const nokkel = m[1] + '_' + m[3];
                if (!matches.find(x => (x.reqId + '_' + x.tripid) === nokkel)) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3], erAttest: /^null$/i.test(m[4] || '') });
                }
            }
            console.log(`[VERKTØYKASSE] pnr ${pnr}: ${matches.length} rekvisisjon(er) funnet`);

            // Hent detaljer for hver (cap på 20 for å unngå lange serier)
            const turer = [];
            for (const { reqId, db, tripid, erAttest } of matches.slice(0, 20)) {
                const d = await hentRekvisisjon(reqId, db, tripid, tripid);
                if (d) {
                    // ATTEST = ingen Reisenr tildelt (4.arg null i raden) OG NISSY skriver «Har
                    // gyldig attest» på detaljsiden. Begge kreves → ingen falsk attest-merking
                    // av en vanlig uplanlagt rekvisisjon (den har null-Reisenr, men ikke attest-tekst).
                    d.uten_reisenr = !!erAttest;
                    d.er_attest = !!erAttest && !!d.har_gyldig_attest;
                    console.log(`[VERKTØYKASSE] attest-sjekk req=${reqId}: reisenr=${erAttest ? 'NULL' : 'tall'} gyldig_attest=${d.har_gyldig_attest} tur=${d.har_tur} → er_attest=${d.er_attest}`);
                    turer.push(d);
                }
            }
            return { pnr, hentet: new Date().toISOString(), antall: turer.length, turer };
        } catch(e) {
            console.warn('[VERKTØYKASSE] sokPnrINissy:', e.message);
            return { feil: e.message };
        }
    }

    async function pollPnrVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        if (adminStatus !== 'ok') return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=pnr_pending`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            console.log(`[VERKTØYKASSE] ${d.oppslag.length} ventende pnr-oppslag`);
            for (const o of d.oppslag) {
                const res = await sokPnrINissy(o.pnr);
                const fd = new FormData();
                fd.append('id', o.id);
                if (res && !res.feil) fd.append('resultat', JSON.stringify(res));
                if (res && res.feil) fd.append('feil', res.feil);
                await fetch(`${JOBS_URL}?handling=pnr_svar`, { method: 'POST', body: fd });
                console.log(`[VERKTØYKASSE] ✓ pnr-oppslag ${o.id}: ${res.antall || 0} turer`);
            }
        } catch(e) {
            console.warn('[VERKTØYKASSE] pnr-poll feil:', e.message);
        }
    }

    // === TLF-OPPSLAG — findPatient i admin, returnerer pasienter med matchende telefon ===
    async function sokTlfINissy(tlf) {
        // AbortController-timeout: uten den henger et tregt/stallet findPatient-kall
        // for alltid → «Søker...»-knappen blir disabled permanent → nummeret «låser seg»
        // (Jan-Tore: bare F5 frigjorde det). Nå feiler det etter 15 s med tydelig melding
        // → knappen re-aktiveres → operatøren kan prøve på nytt UTEN F5.
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15000);
        try {
            const fd = new FormData();
            fd.append('Phone', tlf);
            fd.append('submitButton', 'Søk pasient');
            const r = await fetch(`${ADMIN_BASE}/findPatient`, {
                method: 'POST', body: fd, credentials: 'same-origin', signal: ctrl.signal
            });
            if (!r.ok) return { feil: `findPatient HTTP ${r.status}` };
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const pasienter = [];
            for (const row of doc.querySelectorAll('table.wizard_list tbody tr')) {
                const tds = row.querySelectorAll('td');
                const pnr = tds[0]?.textContent.trim();
                if (!/^\d{11}$/.test(pnr)) continue;
                pasienter.push({
                    pnr,
                    navn: tds[1]?.textContent.trim() || '',
                    rediger_url: tds[2]?.querySelector('a')?.href || ''
                });
            }
            console.log(`[VERKTØYKASSE] tlf ${tlf}: ${pasienter.length} pasient(er) funnet`);
            return { tlf, hentet: new Date().toISOString(), pasienter };
        } catch(e) {
            const melding = (e.name === 'AbortError') ? 'tidsavbrudd – NISSY svarte ikke (prøv igjen)' : e.message;
            console.warn('[VERKTØYKASSE] sokTlfINissy:', melding);
            return { feil: melding };
        } finally {
            clearTimeout(timer);
        }
    }

    // === ATTEST-SJEKK via postMessage til attest-tab ===
    // Direkte fetch fra planlegger blir blokkert av CORS preflight (attest-API
    // svarer ikke med Access-Control-Allow-Origin på OPTIONS). Vi går derfor
    // gjennom en attest-agent som kjører på attest-ui.pasientreiser.nhn.no
    // (samme origin som API'et) og kommuniserer via postMessage.
    let attestTabReady = false;
    let attestTabRef = null;
    const attestVentende = new Map();  // requestId → {resolve, reject, timer}

    window.addEventListener('message', (e) => {
        const data = e.data || {};
        if (!data.type) return;
        if (data.type === 'vkt_attest_klar') {
            attestTabReady = true;
            attestTabRef = e.source;
            console.log('[VERKTØYKASSE] attest-agent klar, versjon=' + (data.versjon || '?'));
            // Fortell agenten hvilken NISSY-host operatøren jobber på, så den kan rewrite
            // nissy6-rekvisisjonslenker til samme origin som planleggeren (→ auto-injisering).
            try { e.source.postMessage({ type: 'vkt_planlegger_origin', origin: NISSY_ORIGIN }, '*'); } catch (_) {}
            return;
        }
        if (data.type === 'vkt_attest_result' || data.type === 'vkt_attest_person_result') {
            const venting = attestVentende.get(data.requestId);
            if (!venting) return;
            attestVentende.delete(data.requestId);
            clearTimeout(venting.timer);
            if (data.error) venting.reject(new Error(data.error));
            else venting.resolve(data);
        }
    });

    function sjekkAttest(pnr, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            // Vi må ha en levende referanse — ikke prøv å gjenfinne via window.open
            // (det åpner uønsket popup hvis tab ikke finnes). Operatør må åpne attest
            // via Attest-snarvei + bookmarklet for at agenten kan signalisere via opener.
            if (!attestTabRef || attestTabRef.closed) {
                return resolve({ feil: 'attest-tab ikke åpen' });
            }
            const requestId = 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const timer = setTimeout(() => {
                attestVentende.delete(requestId);
                resolve({ feil: 'agent ikke aktiv (klikk bookmarklet)' });
            }, timeoutMs);
            attestVentende.set(requestId, { resolve: r => resolve(r), reject: e => resolve({ feil: e.message }), timer });
            try {
                attestTabRef.postMessage({ type: 'vkt_attest_query', pnr, requestId }, 'https://attest-ui.pasientreiser.nhn.no');
            } catch (e) {
                clearTimeout(timer);
                attestVentende.delete(requestId);
                resolve({ feil: 'postMessage feilet: ' + e.message });
            }
        });
    }

    // === TLF-FLYT (DEV) ===
    // Erstatter den gamle "send pnr tilbake til zisson.php"-flyten.
    // Når en tlf-jobb dukker opp, vis toast i planlegger med kø/kort-info.
    // Operatør velger Pasient/Behandler/Avvis. Pnr forlater aldri verktøykassen.
    const visteToasterIds = new Set();  // hindrer duplikat-toast for samme jobb
    const ZISSON_OPPSLAG_URL = 'https://thomaswestby.no/skript/zisson_oppslag.php';

    async function pollTlfVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller (hindrer spøkelses-dobbeltkjøring)
        // SIKKERHETS-FILTER 1 (frontend, defensiv): Zisson-tlf-jobber er per i dag
        // OUS-spesifikke. Hvis kjorekontor er eksplisitt et annet kontor, skipp helt.
        const k = (hentKjorekontor() || '').trim();
        if (k && !/oslo og akershus/i.test(k)) return;
        // SIKKERHETS-FILTER 2 (backend): send nissy så backend filtrerer på etterspurt_av.
        // Hvis brukernavn mangler — skip (backend ville returnert tomt uansett).
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=tlf_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            // Vis KUN nyeste uviste anrop (ett toast av gangen). Tidligere viste loopen "siste itererte",
            // og en ny innringer kunne falle bak gamle pending-jobber → "ny innringer vises ikke".
            const uviste = d.oppslag.filter(o => !visteToasterIds.has(o.id));
            console.log(`[VERKTØYKASSE] tlf-poll: ${d.oppslag.length} pending (ids ${d.oppslag.map(o => o.id).join(',')}), ${uviste.length} uviste`);
            if (uviste.length === 0) return;
            let nyeste = uviste[0];
            for (let i = 1; i < uviste.length; i++) if (Number(uviste[i].id) > Number(nyeste.id)) nyeste = uviste[i];
            uviste.forEach(o => visteToasterIds.add(o.id));  // marker alle uviste som vist (unngå at eldre pop-er senere)
            console.log(`[VERKTØYKASSE] viser nyeste tlf-jobb ${nyeste.id}`, nyeste);
            visTlfToast(nyeste);
        } catch(e) {
            console.warn('[VERKTØYKASSE] tlf-poll feil:', e.message);
        }
    }

    async function svarTlfJobb(id, kategori, ekstraData = null) {
        try {
            const fd = new FormData();
            fd.append('id', id);
            fd.append('resultat', JSON.stringify({ kategori, ...(ekstraData || {}) }));
            await fetch(`${JOBS_URL}?handling=tlf_svar`, { method: 'POST', body: fd });
            console.log(`[VERKTØYKASSE] ✓ tlf-svar ${id}: kategori=${kategori}`);
        } catch (e) {
            console.warn('[VERKTØYKASSE] tlf-svar feil:', e.message);
        }
    }

    function formaterTlf(tlf) {
        const ren = String(tlf || '').replace(/\D/g, '');
        if (ren.length === 8) return `${ren.slice(0,3)} ${ren.slice(3,5)} ${ren.slice(5)}`;
        return tlf;
    }

    // Norsk fødselsnr-regler for år-bestemmelse (forenklet — fanger 99% av tilfeller)
    function alderFraPnr(pnr) {
        const ren = String(pnr || '').replace(/\D/g, '');
        if (ren.length !== 11) return null;
        const dd = parseInt(ren.slice(0,2), 10);
        const mm = parseInt(ren.slice(2,4), 10);
        const yy = parseInt(ren.slice(4,6), 10);
        const ind = parseInt(ren.slice(6,9), 10);
        let aar;
        if (ind <= 499)                              aar = 1900 + yy;
        else if (ind >= 500 && ind <= 749 && yy>=55) aar = 1800 + yy;
        else if (ind >= 500 && ind <= 999 && yy<=39) aar = 2000 + yy;
        else if (ind >= 900 && ind <= 999 && yy>=40) aar = 1900 + yy;
        else                                          aar = 1900 + yy;
        const fodt = new Date(aar, mm - 1, dd);
        if (isNaN(fodt.getTime())) return null;
        const naa = new Date();
        let alder = naa.getFullYear() - fodt.getFullYear();
        const mDiff = naa.getMonth() - fodt.getMonth();
        if (mDiff < 0 || (mDiff === 0 && naa.getDate() < fodt.getDate())) alder--;
        return alder;
    }

    // Tokeniser navn for "Robin Nicholas" vs "NICHOLAS, ROBIN" — sammenlign som sett
    function navnTokens(s) {
        return String(s || '').toLowerCase()
            .replace(/[^a-zæøå\s]/gi, ' ')
            .split(/\s+/)
            .filter(t => t.length >= 2);
    }
    function navnMatcher(a, b) {
        const at = navnTokens(a), bt = navnTokens(b);
        if (at.length === 0 || bt.length === 0) return false;
        const treff = at.filter(x => bt.includes(x)).length;
        return at.length >= 2 ? treff >= 2 : treff === at.length;
    }

    function visTlfToast(jobb) {
        // Fjern eventuell forrige tlf-toast — kun nyeste anrop vises av gangen
        document.querySelectorAll('[id^="vkt-tlf-toast-"]').forEach(el => trygtFjern(el));

        const id = jobb.id;
        const tlf = jobb.tlf || '';
        const p = jobb.parametre || {};
        const koNavn = p.ko_navn || '';
        const kortId = p.kort_id || 0;
        const anroperNavn = (p.anroper_navn || '').trim();
        // Flere numre i én jobb: zisson sender [{tlf,navn,label}] (anroper + pasientens
        // oppgitte nr). Verktøykassen søker ALLE og slår sammen til én toast.
        const numre = Array.isArray(p.numre) ? p.numre : [];

        // Hent lagret posisjon (fra forrige toast som ble flyttet)
        let lagretPos = null;
        try {
            const r = localStorage.getItem('vkt_tlf_toast_pos');
            if (r) lagretPos = JSON.parse(r);
        } catch (_) {}

        const t = document.createElement('div');
        t.id = `vkt-tlf-toast-${id}`;
        const startTop  = lagretPos?.top  || '20px';
        const startLeft = lagretPos?.left || '20px';
        t.style.cssText = [
            'position:fixed', `top:${startTop}`, `left:${startLeft}`, 'z-index:2147483646',
            'background:rgba(15,23,42,0.9)','backdrop-filter:blur(4px)',
            'color:#f8fafc','padding:14px 16px','border-radius:10px',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif','font-size:13px',
            'box-shadow:0 12px 36px rgba(0,0,0,0.55)','min-width:340px','max-width:440px',
            'border:2px solid #3b82f6','border-left-width:6px',
            'user-select:none'
        ].join(';');

        const tittel = koNavn ? `📞 ${koNavn}` : '📞 Innkommende anrop';
        const lukkX = `<span data-vkt-lukk style="cursor:pointer;color:#94a3b8;font-size:18px;line-height:1;padding:0 4px;">×</span>`;
        t.innerHTML = `
            <div data-vkt-drag style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:move;">
                <div style="font-weight:700;font-size:14px;">${tittel}</div>
                ${lukkX}
            </div>
            <div style="margin-bottom:8px;">
                <div style="font-size:13px;color:#cbd5e1;font-family:monospace;letter-spacing:0.5px;">${formaterTlf(tlf)}</div>
                ${anroperNavn ? `<div style="font-size:12px;color:#f8fafc;font-weight:600;margin-top:2px;">${anroperNavn}<span style="color:#94a3b8;font-weight:400;font-size:11px;"> · fra Zisson</span></div>` : ''}
            </div>
            <div data-vkt-kort style="font-size:12px;color:#94a3b8;margin-bottom:10px;font-style:italic;">Slår opp kort-info...</div>
            <div data-vkt-knapper style="display:flex;gap:6px;flex-wrap:wrap;">
                <button data-vkt-handling="pasient" style="flex:1;min-width:90px;padding:8px 12px;background:#10b981;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">👤 Pasient</button>
                <button data-vkt-handling="behandler" style="flex:1;min-width:90px;padding:8px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">🏥 Behandler</button>
                <button data-vkt-handling="avvis" style="flex:1;min-width:70px;padding:8px 12px;background:#475569;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">Avvis</button>
            </div>
            <div data-vkt-resultat style="margin-top:10px;display:none;"></div>
        `;
        document.body.appendChild(t);

        const kortEl     = t.querySelector('[data-vkt-kort]');
        const knapperEl  = t.querySelector('[data-vkt-knapper]');
        const resultatEl = t.querySelector('[data-vkt-resultat]');

        // × må også LUKKE JOBBEN server-side (ferdig=1) — før fjernet den bare DOM-en,
        // så jobben lå pending i 10 min og samme nummer poppet igjen etter F5
        // (visteToasterIds er in-memory). Kategori 'lukket' skiller ×-lukk fra Avvis.
        const lukk = () => { try { svarTlfJobb(id, 'lukket'); } catch (_) {} trygtFjern(t); };
        t.querySelector('[data-vkt-lukk]').onclick = lukk;

        // Drag-and-drop på header-baren
        const dragEl = t.querySelector('[data-vkt-drag]');
        let dragX = 0, dragY = 0, startX = 0, startY = 0, drar = false;
        dragEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('[data-vkt-lukk]')) return;
            drar = true;
            const r = t.getBoundingClientRect();
            startX = r.left; startY = r.top;
            dragX = e.clientX; dragY = e.clientY;
            t.style.transition = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const nyLeft = Math.max(2, Math.min(window.innerWidth  - t.offsetWidth  - 2, startX + (e.clientX - dragX)));
            const nyTop  = Math.max(2, Math.min(window.innerHeight - t.offsetHeight - 2, startY + (e.clientY - dragY)));
            t.style.left = nyLeft + 'px';
            t.style.top  = nyTop  + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!drar) return;
            drar = false;
            try {
                localStorage.setItem('vkt_tlf_toast_pos', JSON.stringify({
                    left: t.style.left, top: t.style.top
                }));
            } catch (_) {}
        });

        // Pasient-info-rad mellom kort og knapper — fylles inn etter oppslag hvis kortet har pasient
        const pasientRad = document.createElement('div');
        pasientRad.style.cssText = 'display:none;font-size:12px;color:#cbd5e1;margin-bottom:10px;padding:6px 8px;background:rgba(59,130,246,0.10);border-left:3px solid #3b82f6;border-radius:4px;';
        knapperEl.parentNode.insertBefore(pasientRad, knapperEl);

        // Kort-info brukes også av Pasient-knappen for dual NISSY-søk
        let kortInfo = null;

        // Auto-søk: klikk Pasient-knappen programmatisk (guard mot dobbel-trigger).
        let autoSokStartet = false;
        const autoKlikkPasient = (grunn) => {
            if (autoSokStartet) return;
            const pasientBtn = knapperEl.querySelector('button[data-vkt-handling="pasient"]');
            if (pasientBtn && !pasientBtn.disabled) {
                autoSokStartet = true;
                console.log(`[VERKTØYKASSE] auto-søk pasient (${grunn})`);
                setTimeout(() => pasientBtn.click(), 500);
            }
        };
        // På pasient-/innringer-køer er den som ringer per definisjon pasienten, så
        // vi søker opp automatisk — også når vi ikke har kort. Speiler zisson.php sin
        // egen kø-klassifisering (pasient|innringer|privat).
        const erPasientlinje = /pasient|innringer|privat/i.test(koNavn);
        // Sjåførlinje: anroperen er en SJÅFØR — finn løyvet (tlf→løyve-register, selvlærende)
        // og turen(e) hans i pågående-tabellen. Marker + scroll + vis turinfo i toasten.
        const erSjaforlinje = /sjåfør|sjafør|sjafor|transportør|transportor|drosje|taxi|løyve|loyve/i.test(koNavn);

        // Løyve-normalisering: «C 1048» / «C1048» / «C-1048» → «C1048». Format spiller aldri rolle.
        const normLoyve = (s) => String(s || '').toUpperCase().replace(/[^A-ZÆØÅ0-9]/g, '');
        // Les RESSURS-kolonnen (via tr.tbh-header) per tabell — presist, ikke skann alle celler.
        const forRessursRad = (fn) => {
            document.querySelectorAll('table').forEach(tbl => {
                const hode = tbl.querySelector('tr.tbh');
                if (!hode) return;
                const hc = Array.from(hode.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
                const ri = hc.findIndex(s => s.includes('RESSURS'));
                if (ri < 0) return;
                tbl.querySelectorAll('tbody tr[name]').forEach(tr => {
                    const raw = ((tr.cells[ri] && tr.cells[ri].textContent) || '').trim();
                    if (raw) fn(tr, raw.split(/\s+/)[0]);  // ressurs-id = første token («C-1048»)
                });
            });
        };
        // Finn rader der RESSURS matcher løyvet (normalisert, så format ikke spiller rolle).
        const finnRessursRader = (loyve) => {
            const maal = normLoyve(loyve);
            if (!maal) return [];
            const treff = [];
            forRessursRad((tr, ress) => { if (normLoyve(ress) === maal) treff.push(tr); });
            return treff;
        };
        // Distinkte ressurser som er synlige i tabellen nå (etter at operatøren har søkt opp en tur).
        const lesRessurserFraTabell = () => {
            const sett = {};
            forRessursRad((tr, ress) => { if (/[A-ZÆØÅ]/i.test(ress) && /\d/.test(ress)) sett[ress] = (sett[ress] || 0) + 1; });
            return Object.keys(sett);
        };
        // Kompakt turinfo fra en tabellrad: les kolonner via header-raden (tr.tbh) i samme tabell.
        const radTurinfo = (tr) => {
            try {
                const tbl = tr.closest('table');
                const hode = tbl && tbl.querySelector('tr.tbh');
                if (!hode) return (tr.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
                const hc = Array.from(hode.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
                const idx = n => hc.findIndex(s => s.includes(n));
                const c = i => (i >= 0 && tr.cells[i]) ? (tr.cells[i].textContent || '').trim().replace(/\s+/g, ' ') : '';
                const tid = c(idx('OPPMTID')) || c(idx('START'));
                const fra = c(idx('FRA')) || c(idx('PADR'));
                const til = c(idx('TIL')) || c(idx('BEHADR'));
                const status = c(idx('STATUS'));
                const pnavn = c(idx('PNAVN'));
                return [tid, fra && til ? `${fra} → ${til}` : (fra || til), pnavn, status ? `(${status})` : ''].filter(Boolean).join(' · ');
            } catch (_) { return ''; }
        };
        const markerRessursRader = (rader) => {
            if (!document.getElementById('vkt-sjafor-stil')) {
                const st = document.createElement('style');
                st.id = 'vkt-sjafor-stil';
                st.textContent = '@keyframes vktSjaforPuls{0%,100%{background-color:rgba(59,130,246,.12)}50%{background-color:rgba(59,130,246,.5)}}tr.vkt-sjafor-blink,tr.vkt-sjafor-blink>td{animation:vktSjaforPuls 1.2s ease-in-out infinite!important}';
                document.head.appendChild(st);
            }
            rader.forEach(tr => tr.classList.add('vkt-sjafor-blink'));
            if (rader[0]) rader[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
            setTimeout(() => rader.forEach(tr => tr.classList.remove('vkt-sjafor-blink')), 30000);
        };
        const visSjaforTreff = (loyve, fraRegister) => {
            const rader = finnRessursRader(loyve);
            const linjer = rader.slice(0, 4).map(tr => `<div style="font-size:11px;color:#cbd5e1;margin-top:3px;">🚐 ${radTurinfo(tr).replace(/[<>&]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch]))}</div>`).join('');
            kortEl.style.fontStyle = '';
            kortEl.style.color = '#cbd5e1';
            kortEl.innerHTML = `<span style="color:#f8fafc;font-weight:600;">🚐 Løyve ${loyve}</span>`
                + `<span style="color:#94a3b8;font-size:11px;"> · ${fraRegister ? 'fra register' : 'nytt — lagret'}</span>`
                + (rader.length ? `<div style="font-size:11px;color:#86efac;margin-top:3px;">${rader.length} rad${rader.length > 1 ? 'er' : ''} i tabellen — markert</div>${linjer}`
                                : `<div style="font-size:11px;color:#fbbf24;margin-top:3px;">Ingen rader med løyvet i gjeldende visning (sjekk filter/fane)</div>`);
            if (rader.length) markerRessursRader(rader);
            // Knapper: behold Avvis, bytt Pasient/Behandler med «Vis i tabellen»
            knapperEl.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.vktHandling === 'pasient') { btn.textContent = '📍 Vis i tabellen'; btn.onclick = () => { const r2 = finnRessursRader(loyve); if (r2.length) markerRessursRader(r2); }; }
                else if (btn.dataset.vktHandling === 'behandler') trygtFjern(btn);
            });
            svarTlfJobb(id, 'sjafor', { loyve, rader: rader.length });
        };
        // Lagre tlf→løyve i registeret (selvlærende), så vis treffet.
        const lagreLoyve = async (loyve) => {
            const rent = String(loyve || '').trim();
            if (!rent) return;
            try {
                const fd = new FormData();
                fd.append('tlf', tlf);
                fd.append('loyve', rent);  // lagres slik NISSY skriver det; matching er normalisert
                fd.append('av', hentNissyBrukernavn() || '');
                await fetch(`${JOBS_URL}?handling=sjafor_tlf_lagre`, { method: 'POST', body: fd });
            } catch (_) {}
            visSjaforTreff(rent, false);
        };
        // Manuelt løyve-felt (fallback) — render inn i gitt container.
        const visLoyveInputManuell = (container) => {
            container.innerHTML = '';
            const rad = document.createElement('div');
            rad.style.cssText = 'display:flex;gap:6px;margin-top:4px;';
            rad.innerHTML = `<input data-vkt-loyve placeholder="f.eks. C-1048" style="flex:1;padding:5px 8px;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:6px;font-size:12px;font-family:monospace;">
                <button data-vkt-loyve-ok style="padding:5px 12px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">Lagre + finn</button>`;
            container.appendChild(rad);
            const inp = rad.querySelector('[data-vkt-loyve]');
            const ok = () => { const v = (inp.value || '').trim(); if (v) lagreLoyve(v); };
            rad.querySelector('[data-vkt-loyve-ok]').onclick = ok;
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ok(); } });
            setTimeout(() => inp.focus(), 100);
        };
        // Ukjent sjåfør: operatøren søker opp Reisenr → vi leser løyvet RETT fra turen (autoritativt
        // format) og tilbyr å lagre nummeret. Manuelt felt som fallback.
        const visSjaforUkjent = () => {
            kortEl.style.fontStyle = '';
            kortEl.innerHTML = `<div style="color:#fbbf24;font-size:11px;margin-bottom:6px;">🚐 Ukjent sjåfør. Spør om <b>Reisenr</b>, søk det opp i planleggeren — så kobler vi nummeret til løyvet på turen.</div>`;
            const knappRad = document.createElement('div');
            knappRad.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
            knappRad.innerHTML = `<button data-vkt-koble style="flex:1;min-width:160px;padding:6px 10px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">🔗 Koble til turen jeg fant</button>
                <button data-vkt-manuell style="padding:6px 10px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;font-size:12px;cursor:pointer;">✏️ Tast løyve</button>`;
            kortEl.appendChild(knappRad);
            const valg = document.createElement('div');
            valg.style.cssText = 'margin-top:6px;';
            kortEl.appendChild(valg);
            knappRad.querySelector('[data-vkt-koble]').onclick = () => {
                const ress = lesRessurserFraTabell();
                if (ress.length === 0) { valg.innerHTML = `<div style="color:#fbbf24;font-size:11px;">Fant ingen tur i visningen — søk opp Reisenr i planleggeren først.</div>`; return; }
                valg.innerHTML = `<div style="font-size:11px;color:#cbd5e1;margin-bottom:4px;">Er dette sjåførens nummer? Velg løyvet på turen:</div>`;
                ress.slice(0, 8).forEach(r => {
                    const b = document.createElement('button');
                    b.textContent = `📞 Ja — lagre som ${r}`;
                    b.style.cssText = 'display:block;width:100%;margin-bottom:4px;padding:6px 10px;background:#10b981;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;text-align:left;';
                    b.onclick = () => lagreLoyve(r);
                    valg.appendChild(b);
                });
            };
            knappRad.querySelector('[data-vkt-manuell]').onclick = () => visLoyveInputManuell(valg);
        };
        const sjaforOppslag = async () => {
            kortEl.textContent = 'Slår opp løyve…';
            let loyve = null;
            try {
                const r = await fetch(`${JOBS_URL}?handling=sjafor_tlf_oppslag&tlf=${encodeURIComponent(tlf)}`);
                const d = await r.json();
                if (d.ok && d.loyve) loyve = d.loyve;
            } catch (_) {}
            if (loyve) visSjaforTreff(loyve, true);
            else visSjaforUkjent();
        };

        // Steg 2: hent kort-info fra zisson_oppslag.php (kort_id eller tlf-fallback)
        // — men på SJÅFØRLINJEN hopper vi rett til løyve-oppslaget (kortregisteret er pasient/behandler-rettet).
        // (sjaforOppslag er async → kjører ETTER at knappe-handlerne under er koblet; Avvis virker.)
        if (erSjaforlinje) sjaforOppslag();
        else {
        const oppslagUrl = kortId
            ? `${ZISSON_OPPSLAG_URL}?kort_id=${kortId}`
            : `${ZISSON_OPPSLAG_URL}?tlf=${encodeURIComponent(tlf)}`;
        fetch(oppslagUrl).then(r => r.json()).then(d => {
            if (!d.ok || !d.kort) {
                if (d.kort === null) {
                    // Ingen kort lagret på innringeren → IKKE skremmende «ingen kort funnet»-tekst (forvirrer operatøren).
                    // Bare et lite dempet symbol med tooltip (Thomas 2026-07-01).
                    kortEl.innerHTML = '<span title="Ingen kontaktkort lagret på dette nummeret" style="cursor:help;color:#64748b;font-size:13px;">🪪</span>';
                    kortEl.style.color = '';
                } else {
                    kortEl.textContent = '(oppslag feilet)';
                    kortEl.style.color = '#fbbf24';
                }
                if (erPasientlinje) autoKlikkPasient('pasientlinje (uten kort)');
                return;
            }
            const k = d.kort;
            kortInfo = k;
            const bc = (d.breadcrumb || []).map(b => b.navn).join(' › ');
            const inst = d.institusjon ? ` · 🏢 ${d.institusjon.navn}` : '';
            const linje1 = `<span style="color:#f8fafc;font-weight:600;">${k.navn}</span>`
                         + (k.rolle ? ` <span style="color:#94a3b8;">(${k.rolle})</span>` : '');
            const linje2 = (bc ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${bc}${inst}</div>` : '');
            kortEl.style.fontStyle = '';
            kortEl.style.color = '#cbd5e1';
            kortEl.innerHTML = linje1 + linje2;

            // Pasient-rad: vises hvis kortet har lagret pasient og pasient-tlf er annet enn anrops-tlf
            const tlfRen = (tlf || '').replace(/\D/g, '');
            const pasientTlfRen = (k.pasient_telefon || '').replace(/\D/g, '');
            const sammeTlf = pasientTlfRen && pasientTlfRen === tlfRen;
            if (k.pasient_navn || (pasientTlfRen && !sammeTlf)) {
                const navnDel = k.pasient_navn
                    ? `<span style="color:#f8fafc;font-weight:600;">${k.pasient_navn}</span>`
                    : `<span style="color:#94a3b8;">(uten navn)</span>`;
                const tlfDel = (pasientTlfRen && !sammeTlf)
                    ? ` · <span style="font-family:monospace;color:#cbd5e1;">${formaterTlf(k.pasient_telefon)}</span>`
                    : '';
                pasientRad.innerHTML = `<div style="font-size:10px;color:#94a3b8;font-weight:700;letter-spacing:0.5px;margin-bottom:3px;">PASIENT (registrert på kortet)</div>${navnDel}${tlfDel}`;
                pasientRad.style.display = 'block';
            }

            // Auto-trigger NISSY-søk når enten rolle = "Pasient (selv)" ELLER kortet har
            // gyldig 11-sifret personnummer — i begge tilfeller vet vi hvem som ringer,
            // så operatøren slipper å klikke Pasient-knappen manuelt.
            const harPasientPnr = /^\d{11}$/.test((k.pasient_pnr || '').replace(/\D/g, ''));
            const pasientTlfK   = (k.pasient_telefon || '').replace(/\D/g, '');
            const harPasientTlf = pasientTlfK && pasientTlfK !== (tlf || '').replace(/\D/g, '');
            const erSelv = (k.rolle || '').toLowerCase() === 'pasient (selv)';
            // Auto-søk også når en pårørende har oppgitt pasientens eget nr — da vet vi
            // hvem pasienten er, og søket dekker både anroper og pasient.
            if (erSelv || harPasientPnr || harPasientTlf) autoKlikkPasient('kort: pasient kjent');
            else if (erPasientlinje)     autoKlikkPasient('pasientlinje');
        }).catch(e => {
            kortEl.textContent = `(oppslag-feil: ${e.message})`;
            kortEl.style.color = '#fbbf24';
            if (erPasientlinje) autoKlikkPasient('pasientlinje (oppslag-feil)');
        });
        }  // slutt else (ikke sjåførlinje)

        // Knappe-handlere
        knapperEl.querySelectorAll('button').forEach(btn => {
            btn.onclick = async () => {
                const handling = btn.dataset.vktHandling;
                if (handling === 'behandler' || handling === 'avvis') {
                    await svarTlfJobb(id, handling);
                    lukk();
                    return;
                }
                if (handling === 'pasient') {
                    btn.disabled = true; btn.textContent = '⏳ Søker...';

                    // Søk ALLE relevante numre parallelt: anroper + numre fra zisson-
                    // jobben (pasientens oppgitte nr) + pasient-tlf fra kortet. Deduped
                    // på rene sifre, så samme nummer ikke søkes to ganger.
                    const kandidater = new Map();
                    const leggTilNr = (raw) => { const ren = (raw || '').replace(/\D/g, ''); if (ren && !kandidater.has(ren)) kandidater.set(ren, raw); };
                    leggTilNr(tlf);
                    (numre || []).forEach(n => leggTilNr(n && n.tlf));
                    leggTilNr(kortInfo?.pasient_telefon);
                    const oppgaver = [...kandidater.values()].map(raw => sokTlfINissy(raw));
                    const resultater = await Promise.all(oppgaver);
                    const feilet = resultater.find(r => r.feil);
                    if (feilet) {
                        resultatEl.style.display = 'block';
                        resultatEl.innerHTML = `<div style="color:#ef4444;font-size:12px;">Søk feilet: ${feilet.feil}</div>`;
                        btn.disabled = false; btn.textContent = '👤 Pasient';
                        return;
                    }

                    // Merge unike pasienter etter pnr (fall tilbake til navn hvis pnr mangler)
                    const unike = new Map();
                    for (const r of resultater) {
                        for (const p of (r.pasienter || [])) {
                            const nokkel = p.pnr || p.navn || JSON.stringify(p);
                            if (!unike.has(nokkel)) unike.set(nokkel, p);
                        }
                    }
                    const pasienter = Array.from(unike.values());

                    visPasientliste(resultatEl, pasienter, id, anroperNavn);
                    knapperEl.style.display = 'none';
                    await svarTlfJobb(id, 'pasient', { antall: pasienter.length, kilder: oppgaver.length });
                }
            };
        });
    }

    // === «Er dette vår pasient?» — postnr-sone-sjekk (speiler Område-assistentens predikat) ===
    // Kjørekontorets område-soner ligger i window.__vkt_tilgang.omraade_postnr (tekst, f.eks.
    // «0000-2099,2150-2151,…»). Pasientens hjemmeadresse (m/ postnr) kommer fra rekv-oppslaget.
    const OMRAADE_FALLBACK_PR = '0000-2099,2150-2151,2160-2167,2170';
    function parsePostnrSett(str) {
        const ranges = [];
        String(str || '').split(',').forEach(del => {
            const t = del.trim(); if (!t) return;
            const m = t.match(/^(\d{4})\s*-\s*(\d{4})$/);
            if (m) ranges.push([+m[1], +m[2]]);
            else if (/^\d{4}$/.test(t)) ranges.push([+t, +t]);
        });
        return ranges;
    }
    function hentPostnr(t) { if (!t) return null; const m = String(t).match(/\b(\d{4})\b/); return m ? m[1] : null; }
    function omraadeSett() {
        const t = (function () { try { return window.__vkt_tilgang || {}; } catch (_) { return {}; } })();
        const sett = parsePostnrSett(t.omraade_postnr || '');
        return sett.length ? sett : parsePostnrSett(OMRAADE_FALLBACK_PR);
    }
    function erVaartOmraade(adr) {
        const p = hentPostnr(adr); if (!p) return null;  // ukjent postnr → kan ikke avgjøre
        const n = +p; return omraadeSett().some(r => n >= r[0] && n <= r[1]);
    }
    // VASK område-soner mot NISSY: leser kontorets Område-felt (dispatchFilter.fromPostCodes1) fra
    // editDispatchCenter LIVE (admin innlogget i NISSY-konteksten) og oppdaterer omraade_postnr i DB.
    // Server-koordinert via omraade_oppdatert (last-check): vasker kun hvis > 30 dager. Da holder
    // «⚠ IKKE VÅRT OMRÅDE» seg riktig uten manuelt vedlikehold; «Sist vasket» synlig i admin-taben.
    // dispatch_center_id + kjorekontor kommer fra window.__vkt_tilgang (ovr_kontor_tilgang-raden).
    async function vaskOmraadeMotNissy(t) {
        try {
            if (!erAktivEier()) return;  // én-instans: kun aktiv eier vasker
            const dc = parseInt(t && t.dispatch_center_id, 10);
            const kontor = (t && t.kjorekontor) || '';
            if (!dc || !kontor) return;  // ikke konfigurert med senter-id
            const idag = new Date().toISOString().slice(0, 10);
            const nokkel = 'vkt_omr_vask_' + dc;
            if (localStorage.getItem(nokkel) === idag) return;  // per-browser backstop: maks 1×/dag
            localStorage.setItem(nokkel, idag);
            // Last-check: vask kun hvis omraade_oppdatert mangler eller er > 30 dager gammel (server-koordinert).
            const sist = t && t.omraade_oppdatert ? Date.parse(String(t.omraade_oppdatert).replace(' ', 'T')) : 0;
            if (sist && (Date.now() - sist < 30 * 86400 * 1000)) return;  // fersk nok
            // Les Område-feltet fra NISSY (krever admin innlogget der; ellers får vi login-side → skip)
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 12000);
            let omr = '';
            try {
                const r = await fetch(ADMIN_BASE + '/editDispatchCenter?id=' + dc, { credentials: 'same-origin', signal: ctrl.signal });
                const html = await r.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const ta = doc.querySelector('textarea[name="dispatchFilter.fromPostCodes1"]');
                omr = ta ? (ta.textContent || ta.value || '').trim() : '';
            } finally { clearTimeout(timer); }
            // Validér: kun postnr-rekker. Ikke admin / felt ikke funnet → prøv igjen neste økt (sett ikke dato).
            if (!/^\s*\d{1,4}(-\d{1,4})?([,\s]+\d{1,4}(-\d{1,4})?)*\s*$/.test(omr)) return;
            const res = await fetch('https://thomaswestby.no/skript/kjorekontor_vask.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kontor: kontor, dispatch_center_id: dc, omraade: omr })
            }).then(r => r.json()).catch(() => null);
            if (res && res.ok) {
                try { window.__vkt_tilgang.omraade_postnr = res.omraade || omr; window.__vkt_tilgang.omraade_oppdatert = new Date().toISOString().slice(0, 19).replace('T', ' '); } catch (_) {}  // fersk verdi i denne økten
                console.log('[VERKTØYKASSE] Område vasket mot NISSY (senter ' + dc + '): ' + (res.omraade || omr));
            }
        } catch (e) { console.warn('[VERKTØYKASSE] område-vask feilet:', e.message); }
    }
    // HØST ALLE kjørekontor: les hele dispatch-senter-lista (getDispatchCenter) + hvert senters
    // Område-felt → bygg nasjonal postnr→kontor-tabell (ovr_kjorekontor) så toasten kan si HVILKET
    // kontor en utenbys pasient tilhører. Sjelden endring → maks 1×/uke per browser. Krever admin.
    async function hoestAlleKjorekontor(t) {
        try {
            if (!erAktivEier()) return;
            // Per-browser backstop: sjekk maks 1×/dag (unngå gjentatte status-kall).
            const idag = new Date().toISOString().slice(0, 10);
            if (localStorage.getItem('vkt_kk_sjekk') === idag) return;
            localStorage.setItem('vkt_kk_sjekk', idag);
            // Server-koordinert last-check: høst KUN hvis lista mangler eller er > 30 dager gammel.
            // Da høster bare første admin-browser i måneden — ikke alle operatører.
            try {
                const st = await fetch('https://thomaswestby.no/skript/kjorekontor.php?status').then(r => r.json()).catch(() => null);
                if (st && st.ok && st.antall > 0 && st.alder_dager !== null && st.alder_dager < 30) return;  // fersk nok
            } catch (_) {}
            // 1. Hent senter-lista
            // NB: NISSY-admin-sidene serveres som latin1 (windows-1252). text() dekoder som UTF-8 →
            // mojibake i navn (Ålesund→«�lesund») → ugyldig UTF-8 i POST-body → PHP json_decode forkaster
            // HELE body-en («tom sentre-liste»). Derfor: arrayBuffer + TextDecoder('windows-1252').
            const dekode = buf => new TextDecoder('windows-1252').decode(buf);
            let sentre = [];
            const c1 = new AbortController(); const t1 = setTimeout(() => c1.abort(), 12000);
            try {
                const r = await fetch(ADMIN_BASE + '/getDispatchCenter', { credentials: 'same-origin', signal: c1.signal });
                const doc = new DOMParser().parseFromString(dekode(await r.arrayBuffer()), 'text/html');
                sentre = [...doc.querySelectorAll('select#id option')]
                    .map(o => ({ id: parseInt(o.value, 10), navn: (o.textContent || '').trim() }))
                    .filter(o => o.id && o.navn && !/locus|zabbix/i.test(o.navn));
            } finally { clearTimeout(t1); }
            if (!sentre.length) return;  // ikke admin / tom liste → prøv igjen senere
            // 2. Les Område-feltet for hvert senter (skånsomt, sekvensielt m/ liten pause)
            const res = [];
            for (const s of sentre) {
                try {
                    const c2 = new AbortController(); const t2 = setTimeout(() => c2.abort(), 10000);
                    let omr = '';
                    try {
                        const h = await fetch(ADMIN_BASE + '/editDispatchCenter?id=' + s.id, { credentials: 'same-origin', signal: c2.signal });
                        const d = new DOMParser().parseFromString(dekode(await h.arrayBuffer()), 'text/html');
                        const ta = d.querySelector('textarea[name="dispatchFilter.fromPostCodes1"]');
                        omr = ta ? (ta.textContent || '').trim() : '';
                    } finally { clearTimeout(t2); }
                    if (omr) res.push({ id: s.id, navn: s.navn, omraade: omr });
                    await new Promise(r => setTimeout(r, 250));  // skån NISSY
                } catch (_) {}
            }
            if (!res.length) return;
            const svar = await fetch('https://thomaswestby.no/skript/kjorekontor_lagre.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                // jsonStringifyTrygt: NISSY (Prototype/rico) har Array.prototype.toJSON som dobbel-encoder
                // arrays → server fikk sentre som STRENG («tom sentre-liste»). Nøytraliser toJSON.
                body: jsonStringifyTrygt({ sentre: res, av: hentNissyBrukernavn() || '' })
            }).then(r => r.json()).catch(() => null);
            if (svar && svar.ok) {
                console.log('[VERKTØYKASSE] Høstet ' + svar.lagret + ' kjørekontor til nasjonal liste (' + res.length + ' lest, ' + (svar.hoppet || 0) + ' uten område)');
            }
        } catch (e) { console.warn('[VERKTØYKASSE] kjørekontor-høst feilet:', e.message); }
    }
    // Oppslag: hvilket kjørekontor dekker et postnr (nasjonal liste). Cachet pr. postnr i økten.
    const _kkCache = {};
    async function hentKjorekontorForPostnr(p) {
        if (!p) return null;
        if (_kkCache[p] !== undefined) return _kkCache[p];
        try {
            const r = await fetch('https://thomaswestby.no/skript/kjorekontor.php?postnr=' + encodeURIComponent(p));
            const j = await r.json();
            _kkCache[p] = (j && j.ok) ? j.kontor : null;
        } catch (_) { _kkCache[p] = null; }
        return _kkCache[p];
    }
    function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

    // === FOLKEREGISTER-ADRESSE fra admin editPatient ===
    // For pasienter UTEN rekvisisjon (ingen pasient_adresse) henter vi hjemmeadressen
    // fra admin-siden operatøren uansett lander på ved tlf-oppslag:
    //   /administrasjon/admin/editPatient?ssn=<11-sifret>  (= pas.rediger_url)
    // Adresseradene ligger som <tr> med radio name="default": td[1]=adresse,
    // td[2]=kilde «(Folkeregister)». Folkeregister-raden har radio value="ssn"
    // (id=ssnradio) og er standardvalget. Prioritet: Folkeregister → ssn-radio → første.
    const _folkeregCache = new Map();  // rediger_url → adresse|null (per session)
    async function hentFolkeregisterAdresse(redigerUrl) {
        try {
            if (!redigerUrl) return null;
            if (_folkeregCache.has(redigerUrl)) return _folkeregCache.get(redigerUrl);
            const r = await fetch(redigerUrl, { credentials: 'same-origin' });
            if (!r.ok) { _folkeregCache.set(redigerUrl, null); return null; }
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const rader = [];
            for (const tr of doc.querySelectorAll('tr')) {
                const radio = tr.querySelector('input[name="default"]');
                if (!radio) continue;
                const tds = tr.querySelectorAll('td');
                if (tds.length < 2) continue;
                const adr = (tds[1].textContent || '').replace(/\s+/g, ' ').trim();
                if (!adr || !/\d{4}/.test(adr)) continue;
                const kilde = (tds[2] ? tds[2].textContent : '').replace(/\s+/g, ' ').trim();
                rader.push({ adr, kilde, val: radio.value });
            }
            const valgt = rader.find(x => /folkeregister/i.test(x.kilde))
                || rader.find(x => x.val === 'ssn')
                || rader[0];
            const ut = valgt ? pentAdresse(valgt.adr) : null;
            _folkeregCache.set(redigerUrl, ut);
            return ut;
        } catch (e) {
            console.warn('[VERKTØYKASSE] folkereg-adresse:', e.message);
            return null;
        }
    }
    // Folkeregister-adressen er VERSALER («SVINNDALVEIEN 340 H0101, 1593 SVINNDAL»).
    // Gjør den lesbar: tittel-case på gate/sted, behold postnr + leilighetsnr (H0101).
    function pentAdresse(adr) {
        return String(adr).split(/(\s+)/).map(ord => {
            if (/^\d/.test(ord)) return ord;                 // tall (340, 1593, H0101 håndteres under)
            if (/^H\d{3,4}$/i.test(ord)) return ord.toUpperCase();
            if (/[a-zæøå]/i.test(ord)) return ord.charAt(0).toUpperCase() + ord.slice(1).toLowerCase();
            return ord;
        }).join('');
    }

    function visPasientliste(resultatEl, pasienter, jobbId, anroperNavn = '') {
        resultatEl.style.display = 'block';
        if (pasienter.length === 0) {
            resultatEl.innerHTML = `<div style="color:#fbbf24;font-size:12px;">Ingen pasienter funnet på dette nummeret.</div>`;
            return;
        }

        // Pynt på pasient-listen med alder + anroper-merking, sorter slik at:
        // - ANROPER (navn-match med Zisson) sist
        // - Resten yngst først. De andre på nummeret er som regel familie på samme
        //   husstand, så de merkes nøytralt 'TILKNYTTET' (ikke en påstand om pasient).
        const flerePasienter = pasienter.length > 1;
        const beriket = pasienter.map(pas => {
            const alder = alderFraPnr(pas.pnr);
            const erAnroper = anroperNavn && navnMatcher(anroperNavn, pas.navn);
            return { ...pas, _alder: alder, _erAnroper: erAnroper };
        });
        // 'TILKNYTTET' gir bare mening når vi FAKTISK fant anroperen i lista (f.eks.
        // navn-match med Naz fra Zisson) — da vet vi at resten henger på hennes nummer.
        // Fant vi ikke anroperen, vet vi ingenting om relasjonen → ingen badge.
        const harAnroperTreff = beriket.some(p => p._erAnroper);
        beriket.sort((a, b) => {
            if (a._erAnroper !== b._erAnroper) return a._erAnroper ? 1 : -1;
            const aa = a._alder ?? 999, bb = b._alder ?? 999;
            return aa - bb;
        });

        const rader = beriket.map((pas, i) => {
            const pnr = pas.pnr || '';
            const navn = pas.navn || '(uten navn)';
            const alderTxt = pas._alder != null ? `${pas._alder} år` : '';
            let merke = '';
            if (pas._erAnroper) {
                merke = `<span style="background:#f59e0b;color:#1e293b;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;margin-left:6px;">📞 ANROPER</span>`;
            } else if (flerePasienter && harAnroperTreff) {
                merke = `<span style="background:#475569;color:#e2e8f0;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;margin-left:6px;">👥 TILKNYTTET</span>`;
            }
            return `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid #1e293b;${pas._erAnroper ? 'opacity:0.7;' : ''}">
                    <div style="flex:1;font-size:12px;">
                        <div style="color:#f8fafc;font-weight:600;">${navn}${merke}</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                            <span style="color:#cbd5e1;font-family:monospace;font-size:12px;font-weight:600;">${pnr}</span>
                            ${alderTxt ? `<span style="color:#94a3b8;font-size:11px;">${alderTxt}</span>` : ''}
                            <span data-vkt-kopier="${pnr}" title="Kopier personnummer" style="cursor:pointer;color:#64748b;font-size:13px;line-height:1;padding:1px 4px;border-radius:3px;user-select:none;">📋</span>
                            <span data-vkt-rekv="${i}" style="font-size:11px;color:#64748b;font-style:italic;">⏳ rekv...</span>
                        </div>
                        <div data-vkt-adr="${i}" style="font-size:11px;color:#f8fafc;margin-top:3px;"></div>
                    </div>
                    <button data-vkt-pas="${i}" data-vkt-modul="rekvisisjon" style="padding:5px 10px;background:#0ea5e9;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Rek</button>
                    <button data-vkt-pas="${i}" data-vkt-modul="planlegging" style="padding:5px 10px;background:#7c3aed;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Plan</button>
                    <button data-vkt-attest="${pnr}" title="Åpne attest-UI + kopier pnr" style="padding:5px 10px;background:#f59e0b;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Attest</button>
                </div>
            `;
        }).join('');
        // Resten av oppslag-koden under bruker `pasienter` — pek den til den sorterte/berikede lista
        pasienter = beriket;
        resultatEl.innerHTML = `
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:600;">${pasienter.length} pasient${pasienter.length === 1 ? '' : 'er'} funnet:</div>
            ${rader}
        `;

        // Parallelt rekvisisjons-oppslag for hver pasient (bruker eksisterende sokPnrINissy)
        pasienter.forEach((pas, i) => {
            if (!pas.pnr) return;
            const el = resultatEl.querySelector(`[data-vkt-rekv="${i}"]`);
            sokPnrINissy(pas.pnr).then(async res => {
                if (!el) return;
                if (res.feil) {
                    el.textContent = '⚠ rekv-feil';
                    el.style.color = '#fbbf24';
                    el.title = res.feil;
                    return;
                }
                const antall = typeof res.antall === 'number' ? res.antall
                    : (Array.isArray(res.turer) ? res.turer.length : 0);
                // En ATTEST (stående rettighet uten reise) dukker opp i admin-søket, men
                // er IKKE en planlagt tur — rekvisisjon-modulen viser «ingen rekvisisjoner».
                // Skill den fra ekte rekvisisjoner så operatøren ikke tror det finnes en tur.
                const nAttest = (res.turer || []).filter(t => t && t.er_attest).length;
                const nRekv = antall - nAttest;
                if (antall === 0) {
                    el.textContent = '· ingen rekv';
                    el.style.color = '#64748b';
                    el.style.fontStyle = '';
                } else if (nRekv === 0) {
                    // Kun attest(er) — ingen reell tur.
                    el.textContent = `📄 ${nAttest} attest`;
                    el.style.color = '#fbbf24';
                    el.style.fontStyle = '';
                    el.style.fontWeight = '600';
                    el.title = 'Stående attest — ingen planlagt tur (rekvisisjon-modulen viser «ingen rekvisisjoner»)';
                } else {
                    el.textContent = nAttest > 0
                        ? `📋 ${nRekv} rekv + 📄 ${nAttest} attest`
                        : `📋 ${nRekv} rekv`;
                    el.style.color = '#10b981';
                    el.style.fontStyle = '';
                    el.style.fontWeight = '600';
                    if (nAttest > 0) el.title = `${nRekv} rekvisisjon(er) + ${nAttest} stående attest`;
                }
                // ATTEST-REGISTER (autoritativt): rekv-søket fanger IKKE alltid stående attester (eks RAZIJA
                // MESANOVIC: 5 rekv, men aktiv attest i registeret). Når attest-agenten er tilkoblet (grønn prikk),
                // spør vi det EKTE registeret og oppdaterer badgen med reell aktiv-attest-telling. Uten agent:
                // behold rekv-basert deteksjon. Oppgraderer kun (viser attest når aktive>0) — nedgraderer aldri.
                if (attestTabReady) {
                    try {
                        const att = await sjekkAttest(pas.pnr);
                        if (att && !att.feil && !att.error && typeof att.aktive === 'number' && el.isConnected && att.aktive > 0) {
                            el.innerHTML = nRekv > 0
                                ? `📋 ${nRekv} rekv <span style="color:#fbbf24;">+ 📄 ${att.aktive} attest</span>`
                                : `<span style="color:#fbbf24;">📄 ${att.aktive} attest</span>`;
                            el.style.color = nRekv > 0 ? '#10b981' : '#fbbf24';
                            el.style.fontWeight = '600';
                            el.title = `${nRekv} rekvisisjon(er) + ${att.aktive} aktiv attest (fra attest-registeret)`;
                        }
                    } catch (_) {}
                }
                // Adresse + «vår pasient?»-varsel.
                // Primært fra rekvisisjonen (pasient_adresse m/ postnr). Mangler den
                // (pasient uten rekv, f.eks. ringer for å bestille) → fall tilbake til
                // FOLKEREGISTER-adressen fra admin editPatient (pas.rediger_url).
                const adrEl = resultatEl.querySelector(`[data-vkt-adr="${i}"]`);
                if (adrEl) {
                    let adr = (res.turer || []).map(t => t && t.pasient_adresse).find(a => a && hentPostnr(a)) || '';
                    let folkereg = false;
                    if (!adr) {
                        const fr = await hentFolkeregisterAdresse(pas.rediger_url);
                        if (fr) { adr = fr; folkereg = true; }
                    }
                    if (adr) {
                        const kildeMerke = folkereg
                            ? ` <span style="color:#64748b;font-size:10px;">(folkereg.)</span>`
                            : '';
                        const vaart = erVaartOmraade(adr);  // true/false/null(ukjent postnr)
                        if (vaart === false) {
                            adrEl.innerHTML = `📍 ${escHtml(adr)}${kildeMerke} <span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;margin-left:4px;">⚠ IKKE VÅRT OMRÅDE</span>`;
                            adrEl.style.color = '#fca5a5';
                            // Hvilket kontor tilhører postnummeret? (nasjonal liste, høstet fra NISSY)
                            hentKjorekontorForPostnr(hentPostnr(adr)).then(kontor => {
                                if (kontor && adrEl.isConnected) adrEl.insertAdjacentHTML('beforeend', ` <span style="color:#fbbf24;font-size:10px;font-weight:600;">→ ${escHtml(kontor)}</span>`);
                            });
                        } else {
                            adrEl.innerHTML = `📍 ${escHtml(adr)}${kildeMerke}`;
                            adrEl.style.color = '#f8fafc';   // samme lyse farge som pasientnavnet (Thomas 2026-07-01)
                        }
                    }
                }
            }).catch(e => {
                if (el) { el.textContent = '⚠'; el.title = e.message; }
            });
            // Auto-attest fjernet — cross-origin Same-Origin Policy gjør auto-injection
            // umulig uten bookmarklet-aktivering på attest-tab. Operatør bruker
            // [Attest]-knappen for manuell oppslag (kopierer pnr + åpner attest-UI).
            // Power-users kan fortsatt aktivere attest-keeper-bookmarklet og kalle
            // sjekkAttest() fra konsollen.
        });
        resultatEl.querySelectorAll('button[data-vkt-pas]').forEach(btn => {
            btn.onclick = () => {
                const i = parseInt(btn.dataset.vktPas, 10);
                const modul = btn.dataset.vktModul;
                const pas = pasienter[i];
                if (!pas || !pas.pnr) return;
                utforNissyNaviger({ modul, ssn: pas.pnr });
            };
        });
        resultatEl.querySelectorAll('[data-vkt-kopier]').forEach(el => {
            el.onclick = async () => {
                const pnr = el.dataset.vktKopier;
                try {
                    await navigator.clipboard.writeText(pnr);
                    const orig = el.textContent;
                    el.textContent = '✓';
                    el.style.color = '#10b981';
                    setTimeout(() => { el.textContent = orig; el.style.color = '#64748b'; }, 1200);
                } catch (e) {
                    console.warn('[VERKTØYKASSE] kopiering feilet:', e);
                }
            };
        });
        // Attest-knapp: åpner attest-UI med pnr som URL-parameter (test om den støtter det)
        // + kopierer pnr til utklippstavle som fallback hvis URL-param ikke virker
        resultatEl.querySelectorAll('[data-vkt-attest]').forEach(btn => {
            btn.onclick = async () => {
                const pnr = btn.dataset.vktAttest;
                try { await navigator.clipboard.writeText(pnr); } catch (_) {}
                window.open(`https://attest-ui.pasientreiser.nhn.no/?foedselsnummer=${encodeURIComponent(pnr)}`, 'nissy-attest');
                const orig = btn.textContent;
                btn.textContent = '✓';
                setTimeout(() => { btn.textContent = orig; }, 1500);
            };
        });
    }

    // === NISSY_NAVIGER — generisk modul-navigering ===
    // Flyt: poll → marker ferdig på server FØR navigering (script dør på nav) →
    // legg autofyll-instruks i sessionStorage → location.href = ny URL →
    // ny side laster verktøykasse via Pinger.js → init plukker opp sessionStorage
    // og fyller ut + submitter skjema.
    const NAVIGER_PENDING_KEY = 'vkt_naviger_pending';

    function ventPaaElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const tick = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return reject(new Error('timeout: ' + selector));
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    // === KEEPER-POPUP ===
    // Åpner en liten popup som re-injiserer verktøykassen i sin opener (NISSY-fanen)
    // hver 0.5 sek hvis flagget mangler. Holder verktøykasse + basic_tools aktive
    // etter F5 — `lastBasicTools` kalles ved hver init av verktøykassen.
    // Samme mønster som dev-keeper-bookmarklet i clipboard.md, men fra menyknapp.
    function apneKeeperPopup(opts) {
        opts = opts || {};
        const popupName = ER_DEV ? 'verktoykasse_dev_keeper' : 'verktoykasse_keeper';
        const filNavn   = ER_DEV ? 'verktoykasse_dev.js' : 'verktoykasse.js';
        const flagNavn  = ER_DEV ? '__westbyVerktoykasse_dev' : '__westbyVerktoykasse';
        const tittel    = ER_DEV ? 'Verktøykasse DEV keeper' : 'Verktøykasse keeper';
        const w = window.open('about:blank', popupName, 'width=340,height=270');
        if (!w) {
            // Auto-åpning: ikke forstyrr med alert hvis nettleseren blokkerer.
            if (opts.auto) console.warn('[VERKTØYKASSE] keeper-popup blokkert (auto) — bruk menyknappen.');
            else alert('Popup blokkert — tillat popups for dette domenet og prøv igjen');
            return;
        }
        // Auto-åpning skal ikke stjele fokus fra NISSY.
        if (!opts.auto) { try { w.focus(); } catch (_) {} }
        // Hvis popup er allerede åpen og initialisert: bare gi den fokus
        try {
            if (w.__vkt_keeper_initialized) return;
        } catch (_) {}
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${tittel}</title>
<style>html,body{height:100%;margin:0}body{display:flex;flex-direction:column;font-family:-apple-system,sans-serif;background:#1e293b;color:#e2e8f0}#top{flex:1;display:flex;align-items:center;justify-content:center;gap:14px}#i{width:42px;height:42px;display:flex;align-items:center;justify-content:center}#i svg{width:100%;height:100%;fill:currentColor}#s{font-size:32px;font-weight:700;letter-spacing:1px}${ER_DEV ? '#dev{margin-left:8px;background:#fbbf24;color:#451a03;font-weight:700;font-size:11px;letter-spacing:1px;padding:2px 8px;border-radius:4px}' : ''}#bar{display:flex;gap:6px;padding:8px;border-top:1px solid #334155}#bar button{flex:1;padding:8px 4px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit;transition:background .1s}#bar button:hover{background:#334155}</style>
</head><body>
<div id="top"><div id="i"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
<div id="s">…</div>${ER_DEV ? '<div id="dev">DEV</div>' : ''}</div>
<div id="bar"><button data-m="admin">⚙️ Admin</button><button data-m="rekvisisjon">📝 Rekvisisjon</button><button data-m="attest">📋 Attest</button></div>
<script>
Array.prototype.forEach.call(document.querySelectorAll('#bar button'),function(b){b.onclick=function(){try{if(window.opener&&!window.opener.closed&&window.opener.__vkt_launch)window.opener.__vkt_launch(b.getAttribute('data-m'));}catch(e){}};});
window.__vkt_keeper_initialized = true;
var FIL = ${JSON.stringify(filNavn)};
var FLAG = ${JSON.stringify(flagNavn)};
var ER_DEV_KEEPER = ${ER_DEV ? 'true' : 'false'};
try {
  var Ctx = window.AudioContext || window.webkitAudioContext;
  if (Ctx) {
    var ctx = new Ctx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  }
} catch (e) {}
var s = document.getElementById('s');
var i = document.getElementById('i');
function status(){
  if(!window.opener||window.opener.closed){s.textContent='Ikke aktiv';s.style.color='#ef4444';i.style.color='#ef4444';return false;}
  s.textContent='Aktiv';s.style.color='#10b981';i.style.color='#10b981';return true;
}
function inj(){try{if(!status())return;if(window.opener[FLAG])return;var e=window.opener.__vkt_eier;if(!ER_DEV_KEEPER&&e&&e.dev)return;/* prod-keeper viker for dev-eier — hindrer spøkelses-re-injeksjon */var sc=window.opener.document.createElement("script");sc.src="https://thomaswestby.no/skript/skript.php?fil="+FIL+"&_="+Date.now();window.opener.document.head.appendChild(sc);}catch(e){}}
var hooked=false;
function hookOpener(){if(hooked)return;try{if(!window.opener||window.opener.closed)return;window.opener.addEventListener("pageshow",inj);window.opener.addEventListener("focus",inj);hooked=true;}catch(e){}}
function hjerteslag(){try{if(window.opener&&!window.opener.closed)window.opener.__vkt_keeper_alive=Date.now();}catch(e){}}
setInterval(function(){hookOpener();inj();status();hjerteslag();},500);
hjerteslag();
inj();
hookOpener();
status();
window.addEventListener("focus",inj);
document.addEventListener("visibilitychange",inj);
</script>
</body></html>`;
        w.document.write(html);
        w.document.close();
    }

    // Auto-åpne keeper-popupen ved oppstart — men kun hvis ingen allerede er i live.
    // Keeperen overlever F5 og setter __vkt_keeper_alive på opener hvert 0.5 sek. Etter
    // F5 re-injiseres verktøykassen og init kjører på nytt; da skal vi IKKE åpne en ny
    // popup (eller stjele fokus). Vi venter litt så en levende keeper rekker å pulse inn.
    function autoApneKeeper() {
        setTimeout(() => {
            const alive = window.__vkt_keeper_alive;
            if (alive && (Date.now() - alive) < 3000) {
                console.log('[VERKTØYKASSE] keeper allerede aktiv — auto-åpner ikke ny popup');
                return;
            }
            apneKeeperPopup({ auto: true });
        }, 1500);
    }

    // Injiser et agent-skript i et åpent (same-origin) vindu.
    // KRITISK: vent til pathname matcher pathPrefix — ellers injiserer vi i about:blank
    // før navigeringen er ferdig, og agenten kjører med null-origin → CORS-feil.
    function injiserAgent(w, filnavn, flagName, pathPrefix) {
        if (!w || w.closed) return false;
        try {
            if (w[flagName]) return true;  // allerede lastet
            if (!w.document || !w.document.head) return false;  // ikke klar ennå
            const path = (w.location && w.location.pathname) || '';
            if (pathPrefix && !path.startsWith(pathPrefix)) return false;  // about:blank eller feil path
            const s = w.document.createElement('script');
            s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + filnavn + '&_=' + Date.now();
            w.document.head.appendChild(s);
            console.log(`[VERKTØYKASSE] injiserte ${filnavn} i ${path}`);
            return true;
        } catch (e) {
            console.warn(`[VERKTØYKASSE] kunne ikke injisere ${filnavn}:`, e.message);
            return false;
        }
    }

    // Vent til tab er klar (pathPrefix matcher), så injiser. Polling hver 300ms.
    async function injiserAgentNårKlar(w, filnavn, flagName, pathPrefix, maks = 20000) {
        const start = Date.now();
        while (Date.now() - start < maks) {
            if (!w || w.closed) return false;
            if (injiserAgent(w, filnavn, flagName, pathPrefix)) return true;
            await new Promise(r => setTimeout(r, 300));
        }
        console.warn(`[VERKTØYKASSE] injiserAgent timeout for ${filnavn}`);
        return false;
    }

    // Periodisk keeper — re-injiser agent hvis tab F5'er og mister flag.
    // Bruker LAGRET window-referanse (overlever F5 i target-tab).
    const overvåkedeTaber = new Map();  // name → {w, url, filnavn, flagName, pathPrefix}
    function holdTabLevende(w, name, url, filnavn, flagName, pathPrefix) {
        overvåkedeTaber.set(name, { w, url, filnavn, flagName, pathPrefix });
    }
    // Eksponert callback: agenter i barn-faner kaller denne ved oppstart for å
    // re-registrere seg i Map. Slik overlever keeper-tilstand F5 i planlegger:
    // når dev re-lastes, vil agenten i rek-fanen ringe inn og fylle Map igjen.
    window.__vkt_registerAgentTab = function(w, filnavn, flagName, pathPrefix) {
        if (!w || w.closed) return;
        let name = '';
        try { name = w.name || ''; } catch (_) {}
        if (!name) return;
        const fersk = !overvåkedeTaber.has(name);
        let url = '';
        try { url = w.location.href || ''; } catch (_) {}
        overvåkedeTaber.set(name, { w, url, filnavn, flagName, pathPrefix });
        if (fersk) console.log(`[VERKTØYKASSE] agent registrerte seg: ${name} (${filnavn})`);
    };
    // Per-tab guard så vi ikke starter en ny rask-poller mens en allerede pågår (unngår stabling).
    const reinjiserPågår = new Set();
    setInterval(() => {
        for (const [name, info] of overvåkedeTaber) {
            try {
                if (!info.w || info.w.closed) {
                    console.log(`[VERKTØYKASSE keeper] ${name}: lukket, fjerner`);
                    overvåkedeTaber.delete(name);
                    reinjiserPågår.delete(name);
                    continue;
                }
                let flagSet = false;
                try { flagSet = !!info.w[info.flagName]; } catch (_) {}
                if (!flagSet && !reinjiserPågår.has(name)) {
                    // F5 → tap av flag. Bytt til RASK 300ms-polling straks: skyter inn så snart
                    // siden er klar (head + path matcher), i stedet for å vente til neste 2s-runde.
                    let pathname = '?';
                    try { pathname = info.w.location.pathname; } catch (_) {}
                    console.log(`[VERKTØYKASSE keeper] ${name}: flag mangler, re-injiserer raskt (${pathname})`);
                    reinjiserPågår.add(name);
                    injiserAgentNårKlar(info.w, info.filnavn, info.flagName, info.pathPrefix)
                        .finally(() => reinjiserPågår.delete(name));
                }
            } catch (e) {
                console.warn(`[VERKTØYKASSE keeper] ${name}: feil`, e);
            }
        }
    }, 2000);  // 5s → 2s: oppdager F5-tap raskere

    // Auto-fang popups som NISSY åpner SELV: verktøykassen injiserer raskt kun i vinduer den selv
    // åpner (Rekvisisjon-snarvei / auto-naviger). Et /rekvisisjon/- eller /administrasjon/-popup NISSY
    // åpner på egenhånd falt utenfor → fikk agenten først ved neste trege keeper-runde (~20s). Vi
    // patcher window.open (transparent wrapper) så ALLE slike vinduer registreres + får rask innskyting.
    (function patchWindowOpen() {
        if (window.__vkt_openPatched) return;
        const origOpen = window.open.bind(window);
        window.open = function (url, name, features) {
            const w = origOpen(url, name, features);
            try {
                const u = String(url || '');
                let agent = null;
                if (/\/rekvisisjon\//.test(u)) agent = {
                    fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
                    flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
                    prefix: '/rekvisisjon/'
                };
                else if (/\/administrasjon\//.test(u)) agent = {
                    fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js',
                    flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent',
                    prefix: '/administrasjon/'
                };
                if (w && agent) {
                    let tabName = name || u;
                    try { tabName = w.name || name || u; } catch (_) {}
                    injiserAgentNårKlar(w, agent.fil, agent.flag, agent.prefix);
                    holdTabLevende(w, tabName, u, agent.fil, agent.flag, agent.prefix);
                    console.log(`[VERKTØYKASSE] fanget NISSY-popup (${agent.prefix}) → rask innskyting`);
                }
            } catch (_) {}
            return w;
        };
        window.__vkt_openPatched = true;
    })();

    // Launcher brukt av keeper-popupens knapper (kalt som window.opener.__vkt_launch(modul)).
    // Åpner NISSY-siden via vår patchede window.open (→ auto-injisering) + registrerer i keeperen.
    // Samme mekanikk som skjold-snarveiene. attest går via startAttest (samme origin); selve
    // nissy6-sluttsiden av attest-flyten må fortsatt få agenten via bookmarklet-klikk (cross-origin).
    window.__vkt_launch = function (modul) {
        let url, agent;
        if (modul === 'admin') {
            url = ADMIN_URL;
            agent = { tabName: ER_DEV ? 'nissy-admin-dev' : 'nissy-admin', fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js', flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent', prefix: '/administrasjon/' };
        } else if (modul === 'attest') {
            url = NISSY_ORIGIN + '/rekvisisjon/requisition/startAttest';
            agent = { tabName: ER_DEV ? 'nissy-attest-dev' : 'nissy-attest', fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js', flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent', prefix: '/rekvisisjon/' };
        } else {  // rekvisisjon
            url = REK_URL;
            agent = { tabName: ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon', fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js', flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent', prefix: '/rekvisisjon/' };
        }
        const w = window.open(url, agent.tabName);
        if (!w) return null;
        try { w.focus(); } catch (_) {}
        injiserAgentNårKlar(w, agent.fil, agent.flag, agent.prefix);
        holdTabLevende(w, agent.tabName, url, agent.fil, agent.flag, agent.prefix);
        return w;
    };

    function utforNissyNaviger(parametre) {
        switch (parametre.modul) {
            case 'rekvisisjon': {
                // Åpne tab + injiser headless agent som tar seg av autofyll og fungerer
                // som mutual keeper for planlegger-verktøykassen.
                const url = NISSY_ORIGIN + '/rekvisisjon/requisition/confirmGetRequisition';
                const tabName = ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon';
                const fil = ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js';
                const flag = ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent';
                const w = window.open(url, tabName);
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                injiserAgentNårKlar(w, fil, flag, '/rekvisisjon/');
                holdTabLevende(w, tabName, url, fil, flag, '/rekvisisjon/');
                if (!parametre.ssn) return;
                // Fyll #ssn + klikk #query_by_ssn (det er fire søkeskjemaer på siden,
                // vi må treffe det for "Pasient, fødselsnummer")
                const start = Date.now();
                const iv = setInterval(() => {
                    if (Date.now() - start > 15000) { clearInterval(iv); console.warn('[VERKTØYKASSE] timeout: ssn-felt aldri klart'); return; }
                    try {
                        if (w.closed) { clearInterval(iv); return; }
                        const doc = w.document;
                        if (!doc) return;
                        const el = doc.getElementById('ssn');
                        if (!el) return;
                        clearInterval(iv);
                        el.value = parametre.ssn;
                        el.dispatchEvent(new w.Event('input',  { bubbles: true }));
                        el.dispatchEvent(new w.Event('change', { bubbles: true }));
                        const btn = doc.getElementById('query_by_ssn');
                        if (btn) btn.click();
                        else {
                            const form = el.closest('form');
                            if (form) form.submit();
                        }
                        console.log(`[VERKTØYKASSE] rekvisisjon fylt: ssn=${parametre.ssn}`);
                    } catch (_) { /* ikke ferdig lastet — prøv igjen */ }
                }, 200);
                return;
            }
            case 'admin': {
                // Triangel-keeper: åpne admin-tab + injiser headless agent.
                // Ingen admin-jobber er definert ennå, men keeperen holder mesh-en levende.
                const url = ADMIN_URL;
                const tabName = ER_DEV ? 'nissy-admin-dev' : 'nissy-admin';
                const fil = ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js';
                const flag = ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent';
                const w = window.open(url, tabName);
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                injiserAgentNårKlar(w, fil, flag, '/administrasjon/');
                holdTabLevende(w, tabName, url, fil, flag, '/administrasjon/');
                return;
            }
            case 'planlegging': {
                if (!parametre.ssn) return;
                // Planlegger-søket tar pnr direkte (uten "ssn:"-prefix)
                const sokeStreng = parametre.ssn;
                // Hvis vi ER på planlegging, fyll i nåværende vindu i stedet for å åpne ny tab.
                const fyllSokeFelt = (vindu) => {
                    const doc = vindu.document;
                    if (!doc) return false;
                    const el = doc.getElementById('searchPhrase');
                    if (!el) return false;
                    // Sett søketype til "Personnummer" (ssn) — uten dette søker den på "Navn"
                    const typeEl = doc.getElementById('searchType');
                    if (typeEl) {
                        typeEl.value = 'ssn';
                        typeEl.dispatchEvent(new vindu.Event('change', { bubbles: true }));
                    }
                    el.focus();
                    el.value = sokeStreng;
                    el.dispatchEvent(new vindu.Event('input', { bubbles: true }));
                    el.dispatchEvent(new vindu.Event('change', { bubbles: true }));
                    const btn = doc.getElementById('buttonSearch');
                    if (btn) btn.click();
                    else {
                        ['keydown', 'keypress', 'keyup'].forEach(type => {
                            try {
                                el.dispatchEvent(new vindu.KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                            } catch (_) {}
                        });
                    }
                    console.log(`[VERKTØYKASSE] planlegging søk: type=ssn phrase="${sokeStreng}"`);
                    return true;
                };
                if (/\/planlegging\//.test(location.pathname)) {
                    // Vi er allerede på planlegging — søk inline uten ny tab
                    if (fyllSokeFelt(window)) return;
                }
                // Ellers (eller hvis inline-fylling feilet): åpne ny tab
                const url = NISSY_ORIGIN + '/planlegging/';
                const w = window.open(url, 'nissy-planlegging');
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                const start = Date.now();
                const iv = setInterval(() => {
                    if (Date.now() - start > 15000) { clearInterval(iv); console.warn('[VERKTØYKASSE] timeout: planlegging søke-input ikke funnet'); return; }
                    try {
                        if (w.closed) { clearInterval(iv); return; }
                        if (fyllSokeFelt(w)) clearInterval(iv);
                    } catch (_) { /* ikke ferdig lastet */ }
                }, 200);
                return;
            }
            case 'attestasjon':
                throw new Error('attestasjon-modul ikke implementert ennå');
            default:
                throw new Error('Ukjent modul: ' + parametre.modul);
        }
    }

    // Fortsetter navigerings-flyten på den nye siden — fyller felt og submitter skjema.
    // Leser fra localStorage (cross-tab), bare hvis vi er på rekvisisjons-domenet.
    async function sjekkNavigerEtterLoad() {
        // Bare relevant hvis vi er på en rekvisisjons-side
        if (!/\/rekvisisjon\//.test(location.pathname)) return;
        let raa;
        try { raa = localStorage.getItem(NAVIGER_PENDING_KEY); } catch (_) { return; }
        if (!raa) return;
        let parametre;
        try { parametre = JSON.parse(raa); } catch (_) { return; }
        try { localStorage.removeItem(NAVIGER_PENDING_KEY); } catch (_) {}
        try {
            if (parametre.modul === 'rekvisisjon' && parametre.ssn) {
                const el = await ventPaaElement('#ssn', 5000);
                el.value = parametre.ssn;
                const form = el.closest('form') || document.querySelector('form');
                if (form) form.submit();
                console.log(`[VERKTØYKASSE] navigering ferdig: ssn=${parametre.ssn} fylt inn og submittet`);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] post-navigering feil:', e.message);
        }
    }

    async function pollNissyNavigerVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        if (adminStatus !== 'ok') return;
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            // Bare prosesser ÉN navigering om gangen — den endrer URL og dreper scriptet
            const o = d.oppslag[0];
            const parametre = o.parametre || {};
            console.log(`[VERKTØYKASSE] nissy_naviger ${o.id}:`, parametre);
            try {
                // Marker ferdig FØR navigering så jobben ikke plukkes opp på nytt
                const fd = new FormData();
                fd.append('id', o.id);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                // utforNissyNaviger setter localStorage og åpner navngitt vindu
                utforNissyNaviger(parametre);
            } catch (e) {
                const fd = new FormData();
                fd.append('id', o.id);
                fd.append('feil', e.message);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                console.warn('[VERKTØYKASSE] nissy_naviger feilet:', e.message);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] nissy_naviger-poll feil:', e.message);
        }
    }

    async function sendSvarTilServer(anropId, data) {
        try {
            const fd = new FormData();
            fd.append('id', anropId);
            fd.append('data', JSON.stringify(data));
            const r = await fetch(`${JOBS_URL}?handling=svar`, { method: 'POST', body: fd });
            return await r.json();
        } catch(e) {
            console.warn('[VERKTØYKASSE] sendSvar feilet:', e.message);
            return { ok: false, feil: e.message };
        }
    }

    async function pollVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        // Hopper over hvis admin ikke er innlogget
        if (adminStatus !== 'ok') return;
        try {
            const nissy = hentNissyBrukernavn();
            if (!nissy) return;
            const r = await fetch(`${JOBS_URL}?handling=pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.anrop)) return;

            oppdaterBadge(d.anrop.length);
            if (d.anrop.length === 0) return;

            console.log(`[VERKTØYKASSE] ${d.anrop.length} ventende turid(er) — henter fra admin ...`);

            // Behandle hver pending én etter én (sekvensielt for å unngå rate-limit)
            for (const a of d.anrop) {
                const data = await hentTurDetaljer(a.turid);
                if (!data || data.feil) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}:`, data && data.feil);
                    continue;
                }
                // Parsing må ha gitt minst ÉN rekvisisjon med fornuftig innhold
                const harData = Array.isArray(data.rekvisisjoner) && data.rekvisisjoner.some(r =>
                    r.fra_adresse || r.til_adresse || r.rek_nr || r.pasient_navn
                );
                if (!harData) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}: ingen data funnet i respons (hopper over — blir værende pending)`);
                    continue;
                }
                const sammendrag = data.rekvisisjoner.map(r => `${r.fra_navn || '?'} → ${r.til_navn || '?'}`).join(' | ');
                console.log(`[VERKTØYKASSE] ✓ Tur ${a.turid} (${data.rekvisisjoner.length} rekv): ${sammendrag}`);
                await sendSvarTilServer(a.id, data);
            }

        } catch(e) {
            console.warn('[VERKTØYKASSE] Poll-feil:', e.message);
        }
    }


    // Eksponert API for konsoll-debug og manuell testing
    window[ER_DEV ? '__verktoykasseDev' : '__verktoykasse'] = {
        versjon: VERSJON,
        utforNissyNaviger,
        sjekkNavigerEtterLoad,
        pollNissyNaviger: pollNissyNavigerVentende,
        sokTlfINissy,
        sokPnrINissy,
        hentTurDetaljer,
        hentTurDetaljerViaRekvnr,
        hentRekvisisjon,
        // Test-helper: oppretter en falsk tlf-jobb i nissy_oppslag og lar pollTlfVentende
        // plukke den opp + vise toast. Bruk fra konsoll: __verktoykasseDev.testTlf('12345678', {kort_id:1, ko_navn:'Test'})
        testTlf: async (tlf, parametre) => {
            const fd = new FormData();
            fd.append('tlf', String(tlf || '').replace(/\D/g, ''));
            fd.append('av', 'console-test');
            if (parametre) fd.append('parametre', JSON.stringify(parametre));
            const r = await fetch(`${JOBS_URL}?handling=tlf_ny`, { method: 'POST', body: fd });
            const d = await r.json();
            console.log('[testTlf] opprettet jobb:', d);
            // Fjern fra "viste" så toast kommer opp ved neste poll
            if (d && d.id) visteToasterIds.delete(d.id);
            pollTlfVentende();
            return d;
        }
    };

    function lastBasicTools(tilgang) {
        // Eksponerer brukernavn så basic_tools.js kan bruke det som userid mot rekvisisjons-API
        window.__vkt_brukernavn = hentNissyBrukernavn() || '';
        // Dev-verktøykasse → dev basic_tools, prod → prod basic_tools.
        // Tidligere localStorage-flagg fjernet — dev/prod-splittet styrer alt nå.
        const fil = ER_DEV ? 'basic_tools_dev.js' : 'basic_tools.js';
        const s = document.createElement('script');
        s.src = `https://thomaswestby.no/skript/skript.php?fil=${fil}&_=${Date.now()}`;
        s.onload = () => {
            const bt = window.__basicTools;
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl && bt) {
                verEl.textContent = `v${bt.versjon}`;
                if (bt.dev) {
                    const tag = document.createElement('span');
                    tag.textContent = ' DEV';
                    tag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;margin-left:2px;';
                    verEl.appendChild(tag);
                }
            }
        };
        s.onerror = () => {
            console.warn(`[VERKTØYKASSE] kunne ikke laste ${fil}`);
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl) verEl.textContent = '⚠ feilet';
        };
        document.head.appendChild(s);
        console.log(`[VERKTØYKASSE] laster ${fil}`);
    }

    // === SESJON-LOGGING ===
    // Registrerer bruken av Verktøykassen i `ovr_sesjoner`-tabellen via live_sesjon.php.
    // Vises i OUS Dashboard → Sesjoner-panel sammen med Avvik og Live.
    function _ekstraktKjorekontor(s) {
        // Strip "Pasientreisekontor for ", samt evt. ekstra "Pasientreiser "-prefiks,
        // så vi får "Oslo og Akershus" / "Innlandet" (uten "Pasientreiser "-prefiks).
        const m = String(s || '').match(/Pasientreisekontor\s+(?:for\s+)?(?:Pasientreiser\s+)?([^\-—|<\n\r]+?)(?:\s*[-—|<\n\r]|\s*$)/i);
        return m ? m[1].trim() : '';
    }

    // hentRealKjorekontor: KUN fra NISSY-tittel/body — ignorerer localStorage-override.
    // Brukes for sesjon-logging så thwe-sesjoner alltid vises som Oslo,
    // uavhengig av om Innlandet-bookmarkleten er aktiv.
    function hentRealKjorekontor() {
        return _ekstraktKjorekontor(document.title)
            || (document.body ? _ekstraktKjorekontor(document.body.innerText) : '')
            || (document.body ? _ekstraktKjorekontor(document.body.innerHTML) : '')
            || '';
    }

    // hentKjorekontor: override har forrang — brukes for tilgang/UI (verktøy-filter).
    // Nye pasientreiser-bookmarklets bruker _pr-suffix; gamle /OUS/-bookmarklets
    // bruker det opprinnelige nøkkel-settet (fallback for bakoverkompat).
    function hentKjorekontor() {
        // Strip "Pasientreiser "-prefiks fra evt. legacy-verdier i localStorage —
        // backend kjenner kun "Oslo og Akershus" / "Innlandet" (uten prefiks).
        const norm = s => (s || '').trim().replace(/^Pasientreiser\s+/i, '');
        try {
            const overridePr = norm(localStorage.getItem('vkt_kjorekontor_override_pr'));
            if (overridePr) return overridePr;
            const override = norm(localStorage.getItem('vkt_kjorekontor_override'));
            if (override) return override;
        } catch (_) {}
        return hentRealKjorekontor();
    }

    function hentKontorKode() {
        try {
            return (localStorage.getItem('vkt_kontor_kode_pr')
                 || localStorage.getItem('vkt_kontor_kode')
                 || '').trim();
        } catch (_) { return ''; }
    }

    async function startSesjon(nissy_id) {
        const sesjonUrl = 'https://thomaswestby.no/skript/live_sesjon.php';
        const skriptNavn = ER_DEV ? 'Verktoykasse-DEV' : 'Verktoykasse';
        // Sesjon-logging bruker EGENTLIG kontor (fra NISSY-tittel) — IKKE override.
        // Det sikrer at thwe alltid vises som Oslo i sesjoner, selv når override er aktiv.
        const realKontor = hentRealKjorekontor();
        const overrideKontor = hentKjorekontor();
        if (realKontor) {
            console.log(`[VERKTØYKASSE] sesjon-kontor: ${realKontor}`
                + (overrideKontor !== realKontor ? ` (tilgang-override: ${overrideKontor})` : ''));
        }
        let sesjonId = 0;
        try {
            const res = await fetch(sesjonUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    handling: 'start',
                    nissy_id: nissy_id || '',
                    signatur: nissy_id || '',
                    kjorekontor: realKontor || '',
                    kontor_kode: hentKontorKode() || '',
                    versjon: VERSJON, skript: skriptNavn
                })
            });
            const j = await res.json();
            if (j && j.ok && j.id) sesjonId = j.id;
        } catch (e) { /* offline eller endpoint nede — la det gå */ }
        if (!sesjonId) return;

        setInterval(() => {
            try {
                fetch(sesjonUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        handling: 'heartbeat',
                        id: sesjonId,
                        versjon: VERSJON,
                        skript: skriptNavn,
                        kjorekontor: hentRealKjorekontor() || '',
                        kontor_kode: hentKontorKode() || ''
                    })
                });
            } catch (_) {}
        }, 60000);

        const avsluttSesjon = () => {
            try {
                navigator.sendBeacon(sesjonUrl, new Blob([JSON.stringify({
                    handling: 'slutt', id: sesjonId
                })], {type: 'application/json'}));
            } catch (_) {}
        };
        window.addEventListener('beforeunload', avsluttSesjon);
        window.addEventListener('pagehide', avsluttSesjon);
    }

    /* ── Søkelogg: husk dagens søk i planleggeren ──────────────────────────────
       Alt operatøren søker på (pnr/reisenr/rekvnr/navn — det som står i søkefeltet)
       logges LOKALT i localStorage og tømmes automatisk ved dagsskifte. Forlater
       ALDRI maskinen (samme prinsipp som «pnr forlater aldri verktøykassen»).
       🕘-knapp ved søkefeltet åpner loggen; klikk på en rad kjører søket på nytt. */
    const SOKELOGG_KEY = 'vkt_sokelogg';
    const SOKELOGG_MAKS = 300;
    function sokeloggDato() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    let sokeloggMinne = null;  // { dato, poster } — sann kilde i denne økten, uavhengig av om Web Storage virker
    // Prototype.js (rico, NISSY) definerer Array.prototype.toJSON → JSON.stringify DOBBEL-ENCODER
    // arrays til strenger ("poster":"[…]"). Nøytraliser midlertidig under serialisering.
    function jsonStringifyTrygt(obj) {
        const arrToJSON = Array.prototype.toJSON;
        if (arrToJSON) { try { delete Array.prototype.toJSON; } catch (_) {} }
        try { return JSON.stringify(obj); }
        finally { if (arrToJSON) { try { Array.prototype.toJSON = arrToJSON; } catch (_) {} } }
    }
    function lesEnKilde(store) {
        try {
            const r = JSON.parse(store.getItem(SOKELOGG_KEY) || 'null');
            // Selvhelbredende: data skrevet FØR toJSON-fiksen har poster som dobbel-encodet streng
            if (r && typeof r.poster === 'string') { try { r.poster = JSON.parse(r.poster); } catch (_) {} }
            if (r && r.dato === sokeloggDato() && Array.isArray(r.poster)) return r.poster;
        } catch (_) {}
        return [];  // annen dag / tom / utilgjengelig → fersk logg
    }
    function lesSokelogg() {
        // Minne-cachen er sann kilde i økten — virker selv om Web Storage er blokkert i NISSY.
        if (sokeloggMinne && sokeloggMinne.dato === sokeloggDato()) return sokeloggMinne.poster;
        // Ny sidelast (F5) / ny dag: hydrer fra storage (ferskeste av de to) hvis tilgjengelig.
        const fraLocal = lesEnKilde(localStorage);
        const fraSession = lesEnKilde(sessionStorage);
        sokeloggMinne = { dato: sokeloggDato(), poster: fraLocal.length >= fraSession.length ? fraLocal : fraSession };
        return sokeloggMinne.poster;
    }
    function skrivSokelogg(poster) {
        const trimmet = poster.slice(-SOKELOGG_MAKS);
        sokeloggMinne = { dato: sokeloggDato(), poster: trimmet };  // minne først — alltid pålitelig
        const data = jsonStringifyTrygt({ dato: sokeloggDato(), poster: trimmet });
        try { localStorage.setItem(SOKELOGG_KEY, data); } catch (_) {}    // best-effort F5-speil
        try { sessionStorage.setItem(SOKELOGG_KEY, data); } catch (_) {}
    }
    function loggSok() {
        const felt = document.getElementById('searchPhrase');
        const typeEl = document.getElementById('searchType');
        const verdi = ((felt && felt.value) || '').trim();
        if (!verdi) return;
        const typeVal = typeEl ? typeEl.value : '';
        const typeNavn = (typeEl && typeEl.selectedIndex >= 0 && typeEl.options[typeEl.selectedIndex].text) || typeVal || '';
        const poster = lesSokelogg();
        const siste = poster[poster.length - 1];
        if (siste && siste.verdi === verdi && siste.type === typeVal) return;  // gjentatt likt søk → ikke dupliser
        const naa = new Date();
        poster.push({ kl: String(naa.getHours()).padStart(2, '0') + ':' + String(naa.getMinutes()).padStart(2, '0'), type: typeVal, navn: typeNavn, verdi });
        skrivSokelogg(poster);
        const teller = document.getElementById('vkt-sokelogg-teller');
        if (teller) teller.textContent = String(poster.length);
    }
    function kjorSokFraLogg(post) {
        const felt = document.getElementById('searchPhrase');
        if (!felt) return;
        const typeEl = document.getElementById('searchType');
        if (typeEl && post.type) { typeEl.value = post.type; typeEl.dispatchEvent(new Event('change', { bubbles: true })); }
        felt.focus();
        felt.value = post.verdi;
        felt.dispatchEvent(new Event('input', { bubbles: true }));
        felt.dispatchEvent(new Event('change', { bubbles: true }));
        const btn = document.getElementById('buttonSearch');
        if (btn) btn.click();
    }
    function visSokeloggPanel(anker) {
        trygtFjern(document.getElementById('vkt-sokelogg-panel'));
        const poster = lesSokelogg().slice().reverse();  // nyeste øverst
        const r = anker.getBoundingClientRect();
        // Åpne oppover når ankeret står i nedre halvdel (flytende bunn-knapp), ellers nedover.
        const apneOpp = r.top > window.innerHeight / 2;
        const venstre = Math.max(8, Math.round(r.right - 360));
        const vertikal = apneOpp
            ? `bottom:${Math.round(window.innerHeight - r.top + 6)}px;`
            : `top:${Math.round(r.bottom + 6)}px;`;
        const p = document.createElement('div');
        p.id = 'vkt-sokelogg-panel';
        p.style.cssText = `position:fixed;${vertikal}left:${venstre}px;z-index:2147483646;width:360px;max-height:55vh;overflow:auto;background:rgba(15,23,42,0.97);color:#f8fafc;border:1px solid #334155;border-radius:10px;box-shadow:0 12px 36px rgba(0,0,0,0.55);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;padding:10px 12px;`;
        const rader = poster.length ? poster.map((post, i) => `
            <div data-vkt-sok="${i}" style="display:flex;gap:8px;align-items:baseline;padding:5px 6px;border-top:1px solid #1e293b;cursor:pointer;border-radius:5px;" onmouseover="this.style.background='rgba(59,130,246,0.15)'" onmouseout="this.style.background=''">
                <span style="color:#64748b;font-size:11px;flex-shrink:0;">${post.kl}</span>
                <span style="color:#94a3b8;font-size:11px;flex-shrink:0;min-width:86px;">${post.navn || ''}</span>
                <span style="font-family:monospace;font-weight:600;color:#f8fafc;word-break:break-all;">${String(post.verdi).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</span>
            </div>`).join('') : '<div style="color:#64748b;font-style:italic;padding:8px 0;">Ingen søk i dag ennå.</div>';
        p.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-weight:700;">🕘 Dagens søk <span style="color:#64748b;font-weight:400;">(${poster.length})</span></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <span data-vkt-sok-tom style="cursor:pointer;color:#94a3b8;font-size:11px;">Tøm</span>
                    <span data-vkt-sok-lukk style="cursor:pointer;color:#94a3b8;font-size:16px;line-height:1;">×</span>
                </div>
            </div>
            <div style="color:#64748b;font-size:10px;margin-bottom:4px;">Lagres kun i denne nettleseren · slettes automatisk ved midnatt · klikk for å søke igjen</div>
            ${rader}`;
        document.body.appendChild(p);
        p.querySelector('[data-vkt-sok-lukk]').onclick = () => trygtFjern(p);
        p.querySelector('[data-vkt-sok-tom]').onclick = () => { skrivSokelogg([]); trygtFjern(p); const tl = document.getElementById('vkt-sokelogg-teller'); if (tl) tl.textContent = '0'; };
        p.querySelectorAll('[data-vkt-sok]').forEach(el => {
            el.onclick = () => { const post = poster[+el.dataset.vktSok]; trygtFjern(p); if (post) kjorSokFraLogg(post); };
        });
        // Klikk utenfor lukker panelet
        setTimeout(() => {
            const lukkUtenfor = (e) => { if (!p.contains(e.target) && e.target !== anker) { trygtFjern(p); document.removeEventListener('mousedown', lukkUtenfor, true); } };
            document.addEventListener('mousedown', lukkUtenfor, true);
        }, 0);
    }
    function sikreSokeloggKnapp() {
        if (document.getElementById('vkt-sokelogg-btn')) return;
        // Anker i NISSYs footer-rad (Ping / tema / Dynamiske plakater) — masse ledig plass.
        // #dynamic_poster sitter i en <td> i footer-tabellen; vi legger en ny <td> sist i raden.
        // Manuell parent-walk (ikke .closest) for å være trygg i rico/prototype-miljøet.
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;  // footer ikke klar ennå — intervallet prøver igjen
        const td = document.createElement('td');
        td.setAttribute('valign', 'top');
        td.style.paddingLeft = '12px';
        const b = document.createElement('button');
        b.id = 'vkt-sokelogg-btn';
        b.type = 'button';
        b.title = 'Dagens søk — klikk for å se hva du har søkt på i dag';
        b.innerHTML = `🕘 Logg<span id="vkt-sokelogg-teller" style="font-size:9px;vertical-align:super;margin-left:2px;">${lesSokelogg().length}</span>`;
        b.style.cssText = 'padding:3px 12px;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;cursor:pointer;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
        b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); visSokeloggPanel(b); };
        td.appendChild(b);
        celle.parentNode.appendChild(td);  // ny celle sist i footer-raden, etter «Dynamiske plakater»
    }
    function initSokelogg() {
        // Fang søk uansett hvordan de trigges (knapp eller Enter) — capture-fase, før NISSY håndterer.
        document.addEventListener('click', (e) => { if (e.target && e.target.id === 'buttonSearch') loggSok(); }, true);
        document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'searchPhrase') loggSok(); }, true);
        sikreSokeloggKnapp();
        setInterval(sikreSokeloggKnapp, 3000);  // re-påfør hvis NISSY re-rendrer søkelinja (billig early-return)
    }

    // === DRIFTSMELDING (per kjørekontor) ===
    // Felt til HØYRE for «🕘 Logg» + «🗗 Vis kart+» i NISSYs footer-rad. Teksten styres i
    // admin.php («🧰 Verktøykasse»-tab) per kjørekontor og leveres via verktoykasse_tilgang.php
    // (t.melding = {aktiv, tekst, oppdatert}). Speiler søkelogg-knappens forankring + tlf-pollerens
    // erAktivEier-guard. Skjult når ingen aktiv melding. À la Overvåker Live sine meldinger.
    function sikreMeldingsFelt() {
        if (document.getElementById('vkt-melding-td')) return;
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;  // footer ikke klar — intervallet prøver igjen
        const td = document.createElement('td');
        td.id = 'vkt-melding-td';
        td.setAttribute('valign', 'top');
        td.style.paddingLeft = '12px';
        td.style.display = 'none';  // vises først når en aktiv melding finnes
        td.innerHTML = '<span style="display:inline-flex;align-items:flex-start;gap:6px;max-width:680px;'
            + 'padding:4px 12px;background:#fef3c7;color:#78350f;border:1px solid #f59e0b;border-left:4px solid #f59e0b;'
            + 'border-radius:8px;font-size:13px;font-weight:600;line-height:1.35;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">'
            + '<span style="flex-shrink:0;">📣</span> <span data-vkt-melding-tekst style="display:-webkit-box;'
            + '-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;"></span></span>';
        celle.parentNode.appendChild(td);  // ny celle sist i footer-raden → til høyre for knappene
        try { oppdaterMeldingsFelt((window.__vkt_tilgang || {}).melding); } catch (_) {}
    }
    function oppdaterMeldingsFelt(melding) {
        const td = document.getElementById('vkt-melding-td');
        if (!td) return;
        const aktiv = melding && melding.aktiv && melding.tekst;
        if (!aktiv) { td.style.display = 'none'; td.dataset.vktTekst = ''; return; }
        td.style.display = '';
        if (td.dataset.vktTekst !== melding.tekst) {
            td.dataset.vktTekst = melding.tekst;
            const span = td.querySelector('[data-vkt-melding-tekst]');
            if (span) { span.textContent = melding.tekst; span.title = melding.tekst; }
        }
    }
    async function pollMelding() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller (som de andre pollerne)
        try {
            const t = await hentTilgang(hentNissyBrukernavn());
            if (t) oppdaterMeldingsFelt(t.melding);
        } catch (_) {}
    }
    function initMeldingsfelt() {
        sikreMeldingsFelt();
        setInterval(sikreMeldingsFelt, 3000);  // re-påfør ved NISSY re-render (billig early-return)
        setInterval(pollMelding, 90000);        // frisk melding live (~1,5 min), uten reload
    }

    // Tegn placeholder-skjold med en gang så det er synlig før tilgang-fetch er ferdig
    tegnMeny({ navn: 'Laster…', rolle: '', verktoy: [] });
    // Løs riktig nissy_id blant cookie-kandidatene (håndterer stale cookies fra annen økt)
    loesNissyOgTilgang().then(async ({ nissy, t }) => {
        console.log('[VERKTØYKASSE] Tilgang:', t);
        window.__vkt_tilgang = t;  // eksponer for verktøy (Område assistent leser omraade_postnr/kjorekontor)
        console.log(`[VERKTØYKASSE] Kontor-kode: ${hentKontorKode() || '(ingen)'} | override: ${(localStorage.getItem('vkt_kjorekontor_override_pr') || localStorage.getItem('vkt_kjorekontor_override') || '(ingen)')} | aktivt kontor: ${hentKjorekontor()}`);
        // Bytt ut placeholder med ekte skjold/meny (posisjon huskes via localStorage)
        const skjoldId = ER_DEV ? 'vkt-skjold-dev' : 'vkt-skjold';
        const menyId   = ER_DEV ? 'vkt-skjold-dev-meny' : 'vkt-skjold-meny';
        trygtFjern(document.getElementById(skjoldId));
        trygtFjern(document.getElementById(menyId));
        tegnMeny(t);
        autoApneKeeper();                  // Åpne keeper-popup automatisk (hopper over hvis alt aktiv)
        tegnAdminStatus();                 // Vis "sjekker"-status umiddelbart
        await oppdaterAdminStatus();       // Første admin-sjekk
        await oppdaterRekvisisjonStatus(); // Første rekvisisjon-sjekk
        lastBasicTools(t);                 // Last inline-handlinger (endre tid, etc)
        startSesjon(nissy);                // Meld inn til ovr_sesjoner
        initSokelogg();                    // Søkelogg: 🕘-knapp + fang søk (lokal, tømmes ved dagsskifte)
        initMeldingsfelt();                // Driftsmelding-felt (per kontor, fra admin.php)
        pollVentende();                    // Første turid-poll
        pollPnrVentende();                 // Første pnr-poll
        pollTlfVentende();                 // Første tlf-poll
        sjekkNavigerEtterLoad();           // Fortsett evt. navigering fra forrige side
        pollNissyNavigerVentende();        // Første nissy_naviger-poll
        vaskOmraadeMotNissy(t);            // Vask VÅRT område-soner mot NISSY (maks 1×/døgn, krever admin)
        hoestAlleKjorekontor(t);           // Høst ALLE kjørekontor → nasjonal postnr→kontor (maks 1×/uke)
        setInterval(oppdaterAdminStatus, ADMIN_PING_MS);
        setInterval(oppdaterRekvisisjonStatus, ADMIN_PING_MS);
        setInterval(pollVentende, TURID_POLL_MS);
        setInterval(pollPnrVentende, TURID_POLL_MS);
        setInterval(pollTlfVentende, TURID_POLL_MS);
        setInterval(pollNissyNavigerVentende, TURID_POLL_MS);
    });
})();
