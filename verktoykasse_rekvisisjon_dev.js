// === WESTBYS VERKTØYKASSE — REKVISISJONS-AGENT (DEV) v1.39-dev ===
// v1.58-dev: BETA-merke i kommunevarselet (Thomas 28.08). Sjekken er ny og hviler på et register
//            vi høster selv — operatøren skal vite at den kan ta feil, og at hun skal si fra.
// v1.57-dev: STÅENDE VARSEL OM FEIL STED (Thomas 28.08: byttet leveringssted til Ahus —
//            Helseforetak — men varselet om fastlegen hang igjen til han trykket OK). Den nye
//            adressen er ikke GAB-validert ennå (councilNr = 0), så sjekken hoppet ut uten å røre
//            det lagrede svaret. «Ikke slett når data mangler» fra 1.50 beskytter listevisningen,
//            men skal ikke beskytte en påstand om FEIL sted. Id-en er påstandens identitet: er
//            skjemaet der og toOrganizationId en annen enn den varselet gjelder, forkastes svaret
//            straks — uavhengig av om vi klarer å regne ut et nytt.
// v1.56-dev: «reiser TIL/FRA» følger reiseretningen (Thomas 28.08). Til behandling reiser
//            pasienten FRA sin egen kommune, hjem igjen reiser hun TIL den. Retningen kjenner vi
//            bare på skjemaet — sammendraget sier den ikke — så den bæres med det lagrede svaret.
// v1.55-dev: ordlyd (Thomas 28.08: «dette kommer til å forvirre operatørene»). «Kommunen utledet
//            av postnummeret — NISSY hadde den ikke» forklarte VÅRT oppslag, ikke pasientens
//            reise. Nå: «Pasienten reiser fra Oslo kommune, basert på postnummeret» — samme
//            forbehold, på hennes språk. + kommunenavn fra NISSY/Geonorge er STORE BOKSTAVER og
//            leses som roping i en setning; pentNavn() gjør «OSLO» til «Oslo» og beholder stor
//            forbokstav i begge ledd av bindestreksnavn (Nord-Aurdal).
// v1.54-dev: kjørekontor og kommunesjekk SKILT (Thomas 28.08: «har ikke noe med dette å gjøre,
//            det ser ut som de henger sammen»). Varselet har nå sin egen røde boks under den gule.
//            + Kjørekontoret skjules når det er VÅRT eget — normaltilfellet er støy, operatøren
//            trenger bare beskjed når turen hører hjemme et annet sted. Sammenligningen går på
//            dispatch_center_id, ikke navn: kjorekontor.php svarer med NISSY-høstede navn
//            («Pasientreiser Oslo og Akershus») mens backend kjenner korte kontornavn — de ville
//            aldri matchet som tekst. Tilgangen leses fra opener (samme origin); er den
//            utilgjengelig VISES kontoret, heller en linje for mye enn å skjule noe som haster.
//            Er den gule boksen tom, skjules den helt.
// v1.53-dev: to feil loggen avslørte da sjekken endelig virket:
//            (1) «fant ikke sted 37668 i registeret» var USANT. Cachen la inn null som
//            plassholder mens oppslaget pågikk, og et parallelt kall leste plassholderen som et
//            svar. Nå caches LØFTET — alle deler samme forespørsel — og en feil sletter
//            oppføringen, så neste forsøk prøver på nytt i stedet for å arve nullen for alltid.
//            (2) Sjekken kjørte fire ganger i sekundet, hver gang med nytt kall til Geonorge og
//            registeret, fordi observeren fyrer og jeg ikke hadde sperre mot å regne det samme
//            om igjen. Nøkkel på postnr|pasientNr|stedNr|stedId, og postnummeroppslaget caches.
// v1.52-dev: NISSY FYLLER IKKE ALLTID councilNr. Målt på editTrip: pasientens councilNr står
//            som «0» fordi adressen ikke er GAB-validert i den skjermbildetilstanden, mens
//            behandlingsstedets er komplett (3222/37668). Da utledes pasientens kommune fra
//            POSTNUMMERET via geokod_sok.php, som nå også svarer med kommunenummer (flertallet
//            av inntil 200 adresser, med andel — et postnummer kan krysse kommunegrensen).
//            ⚠️ Kun når NISSY selv mangler tallet, aldri i stedet for. Sammenligningen er på
//            NUMMER, ikke navn: Geonorge skriver «0301», NISSY «301». Varselet sier fra når
//            kommunen er utledet, så operatøren vet hvor tallet kom fra.
// v1.51-dev: kommunesjekken sier nå HVORFOR den eventuelt gir opp (hvilke av pasientNr/stedNr/
//            stedId som mangler, retning, og om skjemaet i det hele tatt er der). «Ingenting
//            skjedde» er den dyreste feilmeldingen som finnes — vi brukte flere runder på å lete
//            etter en tegnefeil som i virkeligheten var manglende data.
// v1.50-dev: FIX varselet uteble når man kom tilbake til steg 3 (Thomas 28.08: «to forskjellige
//            state»). To feil i 1.49:
//            (1) Steg 3 har TO visninger — redigeringsskjemaet med de skjulte feltene, og
//            listevisningen som bare er en tabellrad. Jeg slettet det lagrede svaret hver gang
//            feltene manglet, altså også i lista. Fravær av skjema er ikke bevis for fravær av
//            varsel; nå slettes det kun når skjemaet ER der og selv sier grunnlaget er borte.
//            (2) Sektoroppslaget er asynkront, så boksen ble tegnet før svaret forelå — og uten
//            en ny DOM-endring aldri på nytt. Tegningen bes om eksplisitt når svaret endrer seg.
// v1.49-dev: KOMMUNEVARSELET INN I SAMMENDRAGET (Thomas 28.08: «varslingen forsvinner på steg 4,
//            den burde ligge i oppsummeringen slik som flyplass»). Det var ankret til
//            Leveringssted-feltet, som bare finnes på redigeringsskjemaet. councilNr og
//            toOrganizationId finnes BARE der, så svaret regnes ut på steg 3 og BÆRES VIDERE i
//            sessionStorage nøklet på pasientens postnummer — samme mønster som fly-flagget.
//            Feiler forutsetningene (ikke GAB-validert, ingen id), slettes svaret i stedet for
//            å bli stående som fasit for en reise det ikke lenger gjelder.
// v1.48-dev: behandlingsstedet i varselet lenkes til NISSY-admin
//            (/administrasjon/admin/treatmentCenter?id=<toOrganizationId>&action=edit — Thomas
//            28.08). Samme id som skjemaet bærer. ⚠️ Krever admin-tilgang, så det er en lenke
//            operatøren VELGER å følge — ikke et oppslag vi gjør i bakgrunnen og lar feile.
// v1.47-dev: KOMMUNESJEKK på steg 3 — «primærhelsetjenesten er et kommunalt tilbud, så det
//            skal være innenfor kommunen» (Thomas 27.08). ALT ligger i NISSYs eget skjema:
//            fromAddress.councilNr / toAddress.councilNr gir kommunenummer for begge endepunkter,
//            og toOrganizationId gir behandlingsstedets id → sektor fra registeret. Ingen
//            utledning fra postnummer, ingen koordinatoppslag.
//            ⚠️ Retningen snur hvem som er hvem — leses fra radioknappen, ikke antatt.
//            ⚠️ Tier når councilNr er 0/tomt (adressen ikke validert mot GAB ennå) eller id-en
//            mangler: en gjetning her ville vært en påstand om regelverk.
// v1.46-dev: VARSEL NÅR REISEN BRUKER EN ANNEN FLYPLASS enn pasientens nærmeste (Thomas 27.08,
//            testet med Gardermoen→Værnes for en pasient i Hadsel). Leser Reise-seksjonen i
//            sammendraget og kjenner igjen flyplassene der. ⚠️ Sier fra, påstår ikke feil — en
//            reise kan lovlig gå mellom to fjerne flyplasser (mellomlanding, eller et ben andre
//            kjører). Utløses kun når reisen faktisk nevner en flyplass.
//            ⚠️ Matcher på HELE navnet med slakke skilletegn, eller IATA — aldri på stedsnavnet
//            alene: «Bodø» og «Alta» er like gjerne pasientens hjemsted som en lufthavn.
// v1.45-dev: FEIL POSTNUMMER var én dump unna. Da jeg åpnet for summary_middle i 1.44, ble
//            REKVIRENTTILHØRIGHETEN med i søket — «1337 Sandvika» står rett over pasientens
//            «8450 STOKMARKNES» og ser identisk ut for et mønstersøk, men kommer først i
//            dokumentet. Boksen ville vist Bærum som kjørekontor for en pasient i Hadsel.
//            Avgrenser nå til pasient-SEKSJONEN («2. Pasient» → «Egenandel»/«3. Reise») før
//            postnummeret leses.
// v1.44-dev: FIX boksen forsvant ved stegbytte (Thomas 27.08: «skriptet blir borte»). Agenten
//            levde hele tiden — loggen viste v1.43-dev aktiv på editRequisitionTrip — men
//            postnummer-cellen ble ikke funnet. td.summary_current markerer STEGET DU STÅR PÅ,
//            ikke pasienten: på Reise-steget faller pasientblokken tilbake til summary_middle.
//            Leser nå begge klassene.
// v1.43-dev: boksen NEDERST i sammendraget — mellom Pasient og Egenandel brøt den NISSYs egen
//            steg-rekkefølge (2, boks, Egenandel, 3, 4). Nederst er den en fotnote til hele
//            bestillingen, og flytter ikke på noe av NISSYs innhold.
//            + geokod_sok.php: postnummerets punkt er nå SNITTET av inntil 200 adresser. Ett
//            treff var ikke stabilt — Geonorge svarer i vilkårlig rekkefølge, så samme
//            postnummer ga 15 km i ett kall og 5 km i det neste (målt på 8450).
// v1.42-dev: BOKSEN INN I SAMMENDRAGET til høyre (Thomas 27.08) — det panelet følger
//            bestillingen gjennom alle stegene, mens pasienttabellen bare finnes på ett av dem.
//            Postnummeret leses derfra (td.summary_current «8450 STOKMARKNES»).
//            SPLITTET: kjørekontor vises på postnummer ALENE, lufthavnene kun ved «fly» i
//            Begrunnelse. Begrunnelsen finnes bare på pasient-steget, så fly-flagget huskes i
//            sessionStorage nøklet på POSTNUMMER — et postnummer er ikke en pasient.
// v1.41-dev: FIX flyreise-boksen reagerte ikke. Jeg lette etter etiketten blant ALLE <td>, men
//            textContent er REKURSIV — en ytre celle «inneholder» teksten i alt under seg, så
//            wizard-wrapperen matcher før etiketten gjør det. NISSY merker feltene selv
//            (td.fieldname / td.fieldvalue); vi leser kun dem nå. Boksen forankres til
//            PASIENT-tabellen der Postnr/Sted står, ikke til begrunnelsen. Dev-konsollen lister
//            alle etikettene på siden når et felt ikke blir funnet.
// v1.40-dev: FLYREISE → RIKTIG LUFTHAVN (Thomas 27.08). Står «flyreise» i Begrunnelse, slås
//            postnummeret opp: kjørekontor (kjorekontor.php — samme kilde som telefon-toasten)
//            og de tre nærmeste lufthavnene i luftlinje. En operatør i Oslo har Gardermoen i
//            fingrene, men pasienten i Hadsel reiser fra Stokmarknes.
//            ⚠️ Forslag, ikke fasit — rutenettet avgjør, så ingenting fylles inn automatisk.
//            ⚠️ Kun POSTNUMMERET forlater NISSY. Et punkt i riktig bygd holder for å rangere
//            lufthavner; pasientens gateadresse har ingenting hos en ekstern tjeneste å gjøre.
//            geokod_sok.php fikk ?postnr=NNNN for dette (Geonorge, ett representasjonspunkt).
// v1.39-dev: tegnforklaring nederst i feltet: «Attributtene i oransje kan kun endres i samråd med
//            behandler» (oransje swatch). Forklarer hva oransje-markeringen betyr.
// v1.38-dev: FIX «Antall reiseledsagere» på énsides «locus»-skjema (altRequisition): teksten ligger i
//            <div class=col-md-4> (ikke <td>) og input heter trip.noOfCompanions. Matcher nå <td> ELLER
//            <div> m/ teksten som direkte tekstnode + input[id/name$=noOfCompanions]. Regex case-insensitiv
//            (4x4 m/ liten x) så ingen låst kode med små bokstaver slipper unna.
// v1.37-dev: FIX «Antall reiseledsagere» traff ikke — teksten ligger i EGEN <td> (skilt fra
//            input#noOfCompanions), så feil celle ble farget. Matcher nå cellen m/ teksten som
//            direkte tekstnode. (Gjelder også énsides altRequisition-skjemaet med flere koder.)
// v1.36-dev: ordlyd → «Disse behovene kan du som pasientreiseoperatør endre:».
// v1.35-dev: popup-boks + «i»-badge GRØNN (det operatøren HAR lov til); låste behov forblir oransje
//            tekst i feltet. Grønn = lov, oransje = ikke lov.
// v1.34-dev: ordlyd → «…pasienten selv legge til på Helsenorge, og du som pasientreiseoperatør kan
//            også endre dem:». «Antall reiseledsagere» (input#noOfCompanions) farges oransje —
//            operatøren kan ikke endre den (ikke en <label>, så fargelegges eksplisitt).
// v1.33-dev: internt verktøy — ordlyd «Disse behovene kan du endre som pasientreiseoperatør:».
//            BS0 (babystol) + MH (manuell håndtering) er IKKE oransje (lagt i TILLATT). Babystol +
//            «Manuell håndtering av kjøreoppdrag» lagt i lista.
// v1.32-dev: FORSLAG til ledelsen — markér behov operatøren ikke kan endre i oransje. Definerer de
//            TILLATTE kodene (pasient-selvvalg) og farger alt annet automatisk = komplementet, så
//            det aldri kommer i utakt med Helsenorge-lista. Avventer godkjenning før prod.
// v1.31-dev: DEMO — markér behov operatøren IKKE kan endre i oransje (label-tekst). Kun AL (Allergi)
//            inntil ledelsen gir full liste over låste koder. fargeLaasteBehov() matcher «(KODE)» i
//            label-tekst, idempotent pr. label. IKKE promotert (avventer full liste).
// v1.30-dev: info-plakat — la til Trappeklatrer (TK) (synket med prod v1.20).
// v1.29-dev: info-plakat fylt med innhold (fra ledelsen) — behov pasienten selv kan legge til
//            på Helsenorge (synket med prod v1.19).
// v1.28-dev: info-plakat — oransje «i»-badge (superkrefter-tema) + panelet som OVERLAY
//            (position:absolute ift. fieldset) så det legger seg over feltet, skyver ikke ned. Oransje tema.
//            Panelet forankret øverst til HØYRE i fieldset (top:8px;right:10px).
// v1.27-dev: INFO-PLAKAT ved «Spesielle behov» (addTrip) — liten ℹ️-knapp i feltets <legend> som
//            toggler en skjult veiledningsdiv: hva en pasientreiseoperatør har lov til å endre / ikke.
//            Statisk/hardkodet (SPES_BEHOV_INFO_HTML — placeholder inntil teksten er klar).
//            Anker: <fieldset> m/ <table id="transportRequirements">; kjøres via dekoratør-loopen.
// v1.25-dev: kalender kan dras (oransje header) + minimeres (–/+); posisjon + tilstand huskes i localStorage.
// v1.24-dev: kompakt månedskalender med ukenummer i ledig høyrefelt (fixed, oransje tema).
//            ‹ › måned-nav + «I dag», i dag uthevet, helg i rødt. Gjenbruker isoUkenummer().
// v1.23-dev: superkrefter finjustert 4px ned + 4px venstre (top:36, left:376).
// v1.22-dev: superkrefter nærmere PASIENTREISER (left:380) og litt lavere (top:32).
// v1.21-dev: superkrefter top:14 → top:24 (havnet 10px for høyt i v1.20-dev).
// v1.20-dev: superkrefter på samme baseline som PASIENTREISER (top:14, 22px).
// v1.19-dev: superkrefter flyttet til høyre (left:420px) for å ikke overlappe logo.
// v1.18-dev: Fix superkrefter — targeter logo-TD (PASIENTREISER er bilde), absolute overlay.
// v1.17-dev: "PASIENTREISER med superkrefter" — header-merket signaliserer at agenten er aktiv.
// v1.16-dev: Raskere dekorering — sort+ramme hopper over når intet nytt + rAF-batching.
// v1.15-dev: synket med prod v1.7.
// v1.14-dev: sorter rekvisisjons-listen synkende etter Pasient klar fra + klokkeslett
// v1.13-dev: ukes-skille — kun ÉN orange topp-linje på rad der uka skifter
//            (ingen topp på første gruppe, ingen bunn på siste, ikke rør tabell-styling)
// v1.12-dev: ukes-gruppering — kun horisontale skiller mellom uker (drop venstre/høyre)
//            + border-collapse på tabellen så adjacente gruppe-borders ikke dobles
// v1.11-dev: ramme rundt sammenhengende rader i samme ISO-uke (2px orange)
// v1.10-dev: legg til ISO-ukenummer ved siden av dagnavn ("fredag · uke 20")
// v1.9-dev: dagnavn-farge til orange (#f97316) + weight 600 — grå druknet i blå rader
// v1.8-dev: dato-dekoratør — scan alle <td> direkte i stedet for header-lookup
//   (header-strukturen varierer); dekorer celler som eksakt matcher dato-regex.
// Dev-versjon av rekvisisjons-agenten. Injiseres kun av DEV-planlegger-
// verktøykassen, ikke av prod. Isolert fra produksjonsflyt så vi kan
// eksperimentere uten å påvirke kollegene.
//
// v1.7-dev: dato-dekoratør — legger dagnavn (mandag/tirsdag/...) under
//   "Oppm. dato" og "Pasient klar fra" i rekvisisjons-listen.
// v1.6-dev: registrer-til-opener-mønster — agenten ringer inn til
//   window.opener.__vkt_registerAgentTab() hvert poll-tick så Map i planlegger
//   alltid har fersk window-referanse, uavhengig av F5 i planlegger.
(function () {
    const VERSJON = '1.58-dev';
    // Hardkodet — dette er dev-fila, så den re-injiserer alltid dev-versjoner
    const KILDE = 'dev';
    const NAVN = 'VKT-REKVISISJON-DEV';
    const MODUL = 'rekvisisjon';
    const FIL = 'verktoykasse_rekvisisjon_dev.js';
    const FLAG = '__vkt_rekvisisjon_dev_agent';
    const PATH_PREFIX = '/rekvisisjon/';
    const JOBS_URL = 'https://thomaswestby.no/skript/nissy_jobs.php';
    const POLL_MS = 3000;

    if (window[FLAG]) {
        console.log(`[${NAVN}] allerede lastet`);
        return;
    }
    window[FLAG] = VERSJON;

    if (!/\/rekvisisjon\//.test(location.pathname) && !/^\/rekvisisjon\b/.test(location.pathname)) {
        console.warn(`[${NAVN}] kjøres utenfor /rekvisisjon/ — er du i riktig fane?`);
    }

    // NISSY-brukernavn — først fra opener (planlegger har det riktige), så lokal fallback
    function hentNissyBrukernavn() {
        try {
            if (window.opener && !window.opener.closed && window.opener.__vkt_brukernavn) {
                return window.opener.__vkt_brukernavn;
            }
        } catch (_) {}
        try {
            const lagret = localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret;
        } catch (_) {}
        return '';  // ingen fallback til JSESSIONID-hash, det er ikke et brukernavn
    }

    function ventPaaElement(selector, timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const tick = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return resolve(null);
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    async function utforJobb(parametre) {
        if (!parametre || !parametre.ssn) throw new Error('mangler ssn');
        const ssn = parametre.ssn;
        // Naviger til søkesiden hvis vi ikke er der
        if (!/confirmGetRequisition/.test(location.pathname)) {
            location.href = '/rekvisisjon/requisition/confirmGetRequisition';
            // Etter navigering dør agenten — ny instans må re-aktiveres via bookmarklet
            // ELLER: vi venter på reload + sjekker localStorage-flagg (videreutvikling)
            return;
        }
        const ssnEl = await ventPaaElement('#ssn', 5000);
        if (!ssnEl) throw new Error('#ssn-felt ikke funnet');
        ssnEl.focus();
        ssnEl.value = ssn;
        ssnEl.dispatchEvent(new Event('input', { bubbles: true }));
        ssnEl.dispatchEvent(new Event('change', { bubbles: true }));
        const btn = document.getElementById('query_by_ssn');
        if (btn) btn.click();
        else {
            const form = ssnEl.closest('form');
            if (form) form.submit();
        }
        console.log(`[${NAVN}] søkte på ssn=${ssn}`);
    }

    async function poll() {
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            // Ikke bruk credentials:'include' — server returnerer Access-Control-Allow-Origin:*
            // som ikke er kompatibelt med credentials. Cookies trengs ikke for nissy_jobs.php.
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag)) return;
            // Filtrer på modul (server returnerer alle nissy_naviger-jobber for brukeren)
            const mine = d.oppslag.filter(o => o.parametre && o.parametre.modul === MODUL);
            for (const o of mine) {
                console.log(`[${NAVN}] plukker opp jobb ${o.id}:`, o.parametre);
                let feil = null;
                try { await utforJobb(o.parametre); } catch (e) { feil = e.message; console.warn(`[${NAVN}] feilet:`, e); }
                const fd = new FormData();
                fd.append('id', o.id);
                if (feil) fd.append('feil', feil);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
            }
        } catch (e) {
            console.warn(`[${NAVN}] poll-feil:`, e.message);
        }
    }

    // Mutual keeper: hvis planlegger (window.opener) har F5'et og mister
    // dev-verktøykassen, re-injiserer vi DEV derfra. Vi er dev-agenten, så vi
    // re-injiserer kun dev — aldri prod (Pinger plukker opp prod automatisk).
    // I tillegg: ALLTID ringe inn til opener.__vkt_registerAgentTab() så dev's
    // overvåkedeTaber Map er fersk uavhengig av F5 i planlegger.
    function holdOpenerLevende() {
        try {
            const opener = window.opener;
            if (!opener || opener.closed) return;
            if (!/\/planlegging\//.test(opener.location.pathname)) return;
            // Hvis dev IKKE kjører — re-injiser
            if (!opener.__westbyVerktoykasse && !opener.__westbyVerktoykasse_dev) {
                // Injiser AKTIV variant (sticky i localStorage) — alle agenter injiserer samme variant.
                let variant = 'prod';
                try { variant = opener.localStorage.getItem('vkt_variant') || 'prod'; } catch (_) {}
                const fil = variant === 'dev' ? 'verktoykasse_dev.js' : 'verktoykasse.js';
                const s = opener.document.createElement('script');
                s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + fil + '&_=' + Date.now();
                opener.document.head.appendChild(s);
                console.log(`[${NAVN}] re-injiserte ${fil} (aktiv variant=${variant}) i opener (planlegger)`);
                return; // ikke klar enda — registrer på neste tick
            }
            // Re-registrer oss selv hos opener så Map alltid er fersk
            if (typeof opener.__vkt_registerAgentTab === 'function') {
                opener.__vkt_registerAgentTab(window, FIL, FLAG, PATH_PREFIX);
            }
        } catch (e) {
            // Cross-origin eller annet — ignorer
        }
    }

    // === Dato-dekoratør ===
    // Legger dagnavn (mandag/tirsdag/...) på linje under "DD.MM.ÅÅ HH:MM"-celler
    // i rekvisisjons-listens dato-kolonner. Bruker tr.tbh som header siden
    // NISSY ikke har ekte <thead>-wrapper.
    const UKEDAGER = ['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
    const DATO_REGEX = /^(\d{2})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})\s*$/;

    function parseNissyDato(tekst) {
        const m = String(tekst || '').trim().match(DATO_REGEX);
        if (!m) return null;
        const dd = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const yy = parseInt(m[3], 10);
        const hh = parseInt(m[4], 10);
        const min = parseInt(m[5], 10);
        const d = new Date(2000 + yy, mm - 1, dd, hh, min);
        return isNaN(d.getTime()) ? null : d;
    }

    // ISO 8601 ukenummer — torsdag i uka avgjør hvilket år uka tilhører
    function isoUkenummer(d) {
        const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dagNum = t.getDay() || 7;
        t.setDate(t.getDate() + 4 - dagNum);
        const aarStart = new Date(t.getFullYear(), 0, 1);
        return Math.ceil((((t - aarStart) / 86400000) + 1) / 7);
    }

    function dekorerHeader() {
        if (document.querySelector('[data-vkt-superkrefter]')) return;
        const td = Array.from(document.querySelectorAll('td')).find(el =>
            /NISSYlogo/i.test(el.getAttribute('style') || '')
        );
        if (!td) return;
        if (getComputedStyle(td).position === 'static') td.style.position = 'relative';
        const tilbygg = document.createElement('span');
        tilbygg.dataset.vktSuperkrefter = '1';
        tilbygg.textContent = 'med superkrefter';
        tilbygg.style.cssText = 'position:absolute;top:36px;left:376px;font-size:22px;font-style:italic;font-weight:600;color:#f97316;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(255,255,255,0.8);pointer-events:none;z-index:1000;white-space:nowrap;';
        td.appendChild(tilbygg);
        console.log(`[${NAVN}] aktiverte "med superkrefter"-merket på logo-TD`);
    }

    function dekorerRekvisisjonsListen() {
        let dekorert = 0;
        document.querySelectorAll('td:not([data-vkt-dag-dekorert])').forEach(td => {
            const tekst = (td.firstChild && td.firstChild.nodeType === 3)
                ? td.firstChild.textContent
                : td.textContent;
            const d = parseNissyDato(tekst);
            if (!d) return;
            td.dataset.vktDagDekorert = '1';
            const dagEl = document.createElement('div');
            dagEl.dataset.vktDag = '1';
            dagEl.style.cssText = 'font-size:11px;color:#f97316;margin-top:1px;text-transform:lowercase;font-weight:600;letter-spacing:0.2px;';
            dagEl.textContent = `${UKEDAGER[d.getDay()]} · uke ${isoUkenummer(d)}`;
            td.appendChild(dagEl);
            dekorert++;
        });
        if (dekorert === 0) return;
        console.log(`[${NAVN}] dato-dekoratør: la til dagnavn på ${dekorert} celle(r)`);
        sorterEtterDato();
        rammeUkesGrupper();
    }

    function sorterEtterDato() {
        document.querySelectorAll('table').forEach(tabell => {
            const tbody = tabell.querySelector('tbody');
            if (!tbody) return;
            const radInfo = [];
            tbody.querySelectorAll(':scope > tr').forEach(r => {
                if (r.classList.contains('tbh')) return;
                const datoCeller = r.querySelectorAll('[data-vkt-dag-dekorert]');
                if (!datoCeller.length) return;
                // Sorter på "Pasient klar fra" (2. dato-celle); fall tilbake til 1. ellers
                const datoCelle = datoCeller[1] || datoCeller[0];
                const tekst = datoCelle.firstChild && datoCelle.firstChild.nodeType === 3
                    ? datoCelle.firstChild.textContent : '';
                const d = parseNissyDato(tekst);
                if (!d) return;
                radInfo.push({ rad: r, dato: d });
            });
            if (radInfo.length < 2) return;

            // Allerede sortert synkende? Hopp over (hindrer MutationObserver-loop)
            let alleredeSortert = true;
            for (let i = 1; i < radInfo.length; i++) {
                if (radInfo[i].dato > radInfo[i - 1].dato) { alleredeSortert = false; break; }
            }
            if (alleredeSortert) return;

            const sortert = [...radInfo].sort((a, b) => b.dato - a.dato);
            const ankerEtter = radInfo[radInfo.length - 1].rad.nextSibling;
            for (const { rad } of sortert) {
                tbody.insertBefore(rad, ankerEtter);
            }
            console.log(`[${NAVN}] sorterte ${radInfo.length} rader synkende etter Pasient klar fra`);
        });
    }

    function rammeUkesGrupper() {
        const SKILLE = '2px solid #f97316';

        // Reset gamle skiller — kun borderTop, vi rører ikke andre styles
        document.querySelectorAll('td[data-vkt-ramme]').forEach(td => {
            td.style.borderTop = '';
            delete td.dataset.vktRamme;
        });

        document.querySelectorAll('table').forEach(tabell => {
            // Nullstill eventuell border-collapse vi satte i v1.12 så NISSY-styling kommer tilbake
            if (tabell.style.borderCollapse) tabell.style.borderCollapse = '';

            const radInfo = [];
            tabell.querySelectorAll('tbody tr').forEach(r => {
                if (r.classList.contains('tbh')) return;
                const datoCelle = r.querySelector('[data-vkt-dag-dekorert]');
                if (!datoCelle) return;
                const tekst = datoCelle.firstChild && datoCelle.firstChild.nodeType === 3
                    ? datoCelle.firstChild.textContent : '';
                const d = parseNissyDato(tekst);
                if (!d) return;
                radInfo.push({ rad: r, uke: isoUkenummer(d) });
            });
            if (radInfo.length < 2) return;

            // Bare separator MELLOM uker — aldri topp på første eller bunn på siste
            for (let i = 1; i < radInfo.length; i++) {
                if (radInfo[i].uke === radInfo[i - 1].uke) continue;
                radInfo[i].rad.querySelectorAll(':scope > td').forEach(td => {
                    td.style.borderTop = SKILLE;
                    td.dataset.vktRamme = '1';
                });
            }
        });
    }

    // Kompakt månedskalender med ukenummer i det ledige høyrefeltet (oransje «superkrefter»-tema).
    // Operatørene jobber i ukenummer («mandag · uke 25»), så uke-kolonnen er hovedpoenget.
    // Drabar (oransje header) + minimerbar; posisjon + tilstand huskes i localStorage.
    const KAL_LS = 'vkt_kalender_pos';
    function lagKalender() {
        if (document.getElementById('vkt-kalender')) return;
        let lagret = {};
        try { lagret = JSON.parse(localStorage.getItem(KAL_LS) || '{}'); } catch (_) {}
        const boks = document.createElement('div');
        boks.id = 'vkt-kalender';
        boks.style.cssText = 'position:fixed;z-index:9998;width:222px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,0.12);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#1e293b;overflow:hidden;user-select:none;'
            + 'top:' + (lagret.top != null ? lagret.top + 'px' : '188px') + ';'
            + (lagret.left != null ? 'left:' + lagret.left + 'px;' : 'right:16px;');
        boks.innerHTML =
            '<div id="vkt-kal-topp" style="display:flex;align-items:center;padding:7px 6px;background:#f97316;color:#fff;font-weight:700;font-size:13px;cursor:move;gap:2px;">'
            + '<span data-kal="prev" style="cursor:pointer;padding:0 6px;">‹</span>'
            + '<span data-kal="tittel" style="flex:1;text-align:center;white-space:nowrap;">—</span>'
            + '<span data-kal="next" style="cursor:pointer;padding:0 6px;">›</span>'
            + '<span data-kal="min" title="Minimer" style="cursor:pointer;padding:0 7px;margin-left:2px;border-left:1px solid rgba(255,255,255,.35);font-size:15px;line-height:1;">–</span>'
            + '</div><div id="vkt-kal-body"></div>';
        document.body.appendChild(boks);
        const topp = boks.querySelector('#vkt-kal-topp');
        const body = boks.querySelector('#vkt-kal-body');
        const tittelEl = boks.querySelector('[data-kal="tittel"]');
        const minEl = boks.querySelector('[data-kal="min"]');
        const idag = new Date();
        let visAar = idag.getFullYear(), visMnd = idag.getMonth(), minimert = !!lagret.minimert;
        const MND = ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];

        function lagrePos() {
            try {
                const r = boks.getBoundingClientRect();
                localStorage.setItem(KAL_LS, JSON.stringify({ left: Math.round(r.left), top: Math.round(r.top), minimert }));
            } catch (_) {}
        }
        function tegn() {
            tittelEl.textContent = MND[visMnd] + ' ' + visAar;
            minEl.textContent = minimert ? '+' : '–';
            minEl.title = minimert ? 'Vis kalender' : 'Minimer';
            if (minimert) { body.style.display = 'none'; return; }
            body.style.display = '';
            const forste = new Date(visAar, visMnd, 1);
            const startDag = forste.getDay() || 7;
            const d = new Date(visAar, visMnd, 1 - (startDag - 1));
            const sisteDato = new Date(visAar, visMnd + 1, 0);
            let html = '<table style="border-collapse:collapse;width:100%;table-layout:fixed;margin:2px 0;"><tr style="color:#94a3b8;font-size:9px;font-weight:700;text-transform:uppercase;">'
                + '<th style="padding:3px 0;width:24px;">Uke</th>'
                + ['Ma','Ti','On','To','Fr','Lø','Sø'].map(x => '<th style="padding:3px 0;">' + x + '</th>').join('') + '</tr>';
            let uke = 0;
            while (uke < 6) {
                if (uke > 0 && d > sisteDato) break;
                html += '<tr><td style="text-align:center;color:#f97316;font-weight:700;font-size:11px;background:#fff7ed;">' + isoUkenummer(d) + '</td>';
                for (let i = 0; i < 7; i++) {
                    const iMnd = d.getMonth() === visMnd;
                    const erIdag = d.getFullYear() === idag.getFullYear() && d.getMonth() === idag.getMonth() && d.getDate() === idag.getDate();
                    let st = 'text-align:center;padding:4px 0;';
                    if (erIdag) st += 'background:#f97316;color:#fff;font-weight:700;border-radius:5px;';
                    else if (!iMnd) st += 'color:#cbd5e1;';
                    else if (i >= 5) st += 'color:#ef4444;';
                    html += '<td style="' + st + '">' + d.getDate() + '</td>';
                    d.setDate(d.getDate() + 1);
                }
                html += '</tr>';
                uke++;
            }
            html += '</table><div data-kal="idag" style="text-align:center;padding:6px;color:#f97316;font-weight:600;cursor:pointer;border-top:1px solid #f1f5f9;font-size:11px;">I dag · uke ' + isoUkenummer(idag) + '</div>';
            body.innerHTML = html;
            body.querySelector('[data-kal="idag"]').onclick = () => { visAar = idag.getFullYear(); visMnd = idag.getMonth(); tegn(); };
        }

        boks.querySelector('[data-kal="prev"]').onclick = (e) => { e.stopPropagation(); if (--visMnd < 0) { visMnd = 11; visAar--; } tegn(); };
        boks.querySelector('[data-kal="next"]').onclick = (e) => { e.stopPropagation(); if (++visMnd > 11) { visMnd = 0; visAar++; } tegn(); };
        minEl.onclick = (e) => { e.stopPropagation(); minimert = !minimert; tegn(); lagrePos(); };

        // Drag på header (ikke på nav/minimer-knappene)
        let drar = false, sx = 0, sy = 0, sl = 0, st = 0;
        topp.addEventListener('mousedown', (e) => {
            if (e.target.closest('[data-kal="prev"],[data-kal="next"],[data-kal="min"]')) return;
            drar = true; const r = boks.getBoundingClientRect(); sl = r.left; st = r.top; sx = e.clientX; sy = e.clientY;
            boks.style.right = 'auto'; e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            boks.style.left = Math.max(2, Math.min(window.innerWidth - boks.offsetWidth - 2, sl + (e.clientX - sx))) + 'px';
            boks.style.top = Math.max(2, Math.min(window.innerHeight - 34, st + (e.clientY - sy))) + 'px';
        });
        document.addEventListener('mouseup', () => { if (drar) { drar = false; lagrePos(); } });

        tegn();
        console.log(`[${NAVN}] kalender lagt til (drabar/minimerbar)`);
    }

    // === SPESIELLE BEHOV — info-plakat ===
    // Liten ℹ️-knapp i «Spesielle behov»-feltets <legend> (rekvisisjon/requisition/addTrip).
    // Klikk → toggler en veiledningsdiv: hva en pasientreiseoperatør HAR LOV til å endre / ikke.
    // Statisk og hardkodet (Thomas' valg) — fyll inn SPES_BEHOV_INFO_HTML når teksten er klar.
    // Anker: <fieldset> som inneholder <table id="transportRequirements"> + dens <legend>.
    const SPES_BEHOV_INFO_HTML =
        '<p style="margin:0 0 7px;">Disse behovene kan <b>du som pasientreiseoperatør</b> endre:</p>'
        + '<ul style="margin:0;padding-left:18px;">'
        + '<li>Babystol / barnestol / sittepute (alle typer)</li>'
        + '<li>Rullator</li>'
        + '<li>Rullestol — også sammenleggbar og elektrisk</li>'
        + '<li>Trappeklatrer</li>'
        + '<li>Førerhund / servicehund</li>'
        + '<li>Ekstra bagasje</li>'
        + '<li>Assistanse til og fra transportmiddel</li>'
        + '<li>Firehjulstrekk</li>'
        + '<li>Manuell håndtering av kjøreoppdrag</li>'
        + '</ul>';
    // Behov operatøren IKKE kan endre = komplementet av det pasienten HAR LOV til å legge til selv
    // på Helsenorge. Vi definerer derfor de TILLATTE kodene; alt annet farges oransje automatisk
    // (selvvedlikeholdende — kan ikke komme i utakt med Helsenorge-lista). Bommer vi → juster lista.
    // Labels har ingen for-attr, men teksten slutter alltid på «(KODE)». Idempotent pr. label
    // (markeres data-vkt-behov-sjekket) så den overlever NISSY re-render uten å fargelegge på nytt.
    const SPES_BEHOV_TILLATT = ['BS0', 'BS1', 'BS4', 'BS5', 'BSP', 'RU', 'RB', 'RS', 'ERS', 'TH', 'SV', 'HJE', '4X4', 'TK', 'MH'];
    function fargeLaasteBehov() {
        const tbl = document.getElementById('transportRequirements');
        if (!tbl) return;
        tbl.querySelectorAll('label:not([data-vkt-behov-sjekket])').forEach(lab => {
            const m = (lab.textContent || '').match(/\(([A-Za-z0-9]+)\)\s*$/);
            if (!m) return;
            lab.dataset.vktBehovSjekket = '1';
            if (SPES_BEHOV_TILLATT.indexOf(m[1].toUpperCase()) !== -1) return;  // pasient-selvvalg → la stå
            lab.style.color = '#d2480c';   // operatøren kan ikke endre → oransje
            lab.style.fontWeight = '700';
        });
        // «Antall reiseledsagere» — teksten kan ligge i <td> (Wizard-skjema) ELLER <div class=col-md-4>
        // (énsides «locus»-skjema). Finn elementet som har teksten som DIREKTE tekstnode og farg det.
        tbl.querySelectorAll('td:not([data-vkt-ledsager]), div:not([data-vkt-ledsager])').forEach(el => {
            let direkte = '';
            el.childNodes.forEach(n => { if (n.nodeType === 3) direkte += n.textContent; });
            if (!/Antall reiseledsagere/.test(direkte)) return;
            el.dataset.vktLedsager = '1';
            el.style.color = '#d2480c';   // operatøren kan ikke endre → oransje
            el.style.fontWeight = '700';
        });
        // hold selve tall-feltet lesbart (id varierer: noOfCompanions / trip.noOfCompanions)
        const comp = tbl.querySelector('input[id$="noOfCompanions"], input[name$="noOfCompanions"]');
        if (comp) { comp.style.color = '#1e293b'; comp.style.fontWeight = 'normal'; }
    }
    function dekorerSpesielleBehov() {
        if (document.getElementById('vkt-spesbehov-knapp')) return;
        const tbl = document.getElementById('transportRequirements');
        if (!tbl) return;  // ikke et skjema med Spesielle behov-feltet → no-op
        // Manuell parent-walk til <fieldset>, så <legend> inni (trygt i rico/prototype-miljøet).
        let fs = tbl;
        while (fs && fs.tagName !== 'FIELDSET') fs = fs.parentNode;
        const legend = fs ? fs.querySelector('legend') : null;
        // Oransje «i»-badge à la «superkrefter»-temaet.
        const knapp = document.createElement('span');
        knapp.id = 'vkt-spesbehov-knapp';
        knapp.textContent = 'i';
        knapp.title = 'Hva kan jeg endre?';
        knapp.style.cssText = 'display:inline-block;width:17px;height:17px;line-height:17px;text-align:center;'
            + 'margin-left:8px;border-radius:50%;background:#16a34a;color:#fff;font-weight:700;font-size:12px;'
            + 'font-style:italic;font-family:Georgia,serif;cursor:pointer;vertical-align:middle;user-select:none;'
            + 'box-shadow:0 1px 2px rgba(0,0,0,0.25);';
        // Overlay-panel — legger seg OVER innholdet (position:absolute), skyver ikke ned. GRØNT tema
        // (det operatøren HAR lov til); det vi ikke har lov til vises som oransje tekst i selve feltet.
        const panel = document.createElement('div');
        panel.id = 'vkt-spesbehov-panel';
        panel.style.cssText = 'display:none;position:absolute;top:8px;right:10px;z-index:9999;width:360px;'
            + 'padding:12px 14px;background:#f0fdf4;border:1px solid #16a34a;border-left:4px solid #16a34a;'
            + 'border-radius:8px;box-shadow:0 6px 22px rgba(0,0,0,0.22);font-size:13px;line-height:1.5;'
            + 'color:#14532d;font-family:-apple-system,BlinkMacSystemFont,sans-serif;';
        panel.innerHTML = '<div style="font-weight:700;color:#15803d;margin-bottom:6px;">📋 Hva kan jeg endre?</div>'
            + SPES_BEHOV_INFO_HTML;
        knapp.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            panel.style.display = (panel.style.display === 'none') ? '' : 'none';
        };
        // Tegnforklaring nederst: hva oransje betyr.
        const forklaring = document.createElement('div');
        forklaring.id = 'vkt-spesbehov-forklaring';
        forklaring.style.cssText = 'margin-top:10px;font-size:12px;color:#9a3412;font-style:italic;';
        forklaring.innerHTML = '<span style="display:inline-block;width:11px;height:11px;border-radius:2px;'
            + 'background:#d2480c;vertical-align:middle;margin-right:6px;"></span>'
            + 'Attributtene i oransje kan kun endres i samråd med behandler';
        if (legend && fs) {
            // <fieldset> blir posisjoneringskontekst → panelet legger seg over feltet, ikke i flyten.
            if (getComputedStyle(fs).position === 'static') fs.style.position = 'relative';
            legend.appendChild(knapp);
            fs.appendChild(panel);        // absolutt-posisjonert ift. fieldset (overlay)
            fs.appendChild(forklaring);   // tegnforklaring nederst i fieldset
        } else if (tbl.parentNode) {  // fallback: ankre på tabellen om <legend> mangler
            const wrap = tbl.parentNode;
            if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
            wrap.insertBefore(knapp, tbl);
            wrap.appendChild(panel);
            wrap.appendChild(forklaring);
        }
        console.log(`[${NAVN}] info-plakat lagt til ved «Spesielle behov»`);
    }

    let rafPlanlagt = null;
    // ══ FLYREISE → RIKTIG FLYPLASS ═══════════════════════════════════════════════════════
    // Thomas 27.08: «hvis jeg skriver flyreise og postnummeret ikke tilhører Oslo, da må vi finne
    // riktig flyplass». En operatør i Oslo har Gardermoen i fingrene — men en pasient i Hadsel
    // reiser fra Stokmarknes, og det er ikke opplagt hvilken lufthavn som hører til et postnummer
    // man ikke kjenner.
    //
    // ⚠️ VI FORESLÅR, VI VELGER IKKE. Nærmeste lufthavn i luftlinje er et godt utgangspunkt, men
    //    ikke en fasit: rutenettet, fjorder og været avgjør hvor pasienten faktisk flyr fra. Derfor
    //    vises de tre nærmeste med avstand, og ingenting fylles inn automatisk.
    //
    // ⚠️ POSTNUMMERET, IKKE ADRESSEN, sendes ut av NISSY. Vi trenger bare et punkt i riktig bygd
    //    for å rangere lufthavner, og da er det ingen grunn til å sende pasientens gateadresse
    //    til en ekstern tjeneste.
    //
    // Listen er VÅR — den er ikke hentet fra Avinor, så feil rettes her. Rutetilbudet endrer seg;
    // koordinatene gjør det ikke.
    const FLYPLASSER = [
        ['Oslo lufthavn, Gardermoen', 'OSL', 60.1939, 11.1004],
        ['Sandefjord lufthavn, Torp', 'TRF', 59.1867, 10.2586],
        ['Kristiansand lufthavn, Kjevik', 'KRS', 58.2042, 8.0853],
        ['Stavanger lufthavn, Sola', 'SVG', 58.8767, 5.6378],
        ['Haugesund lufthavn, Karmøy', 'HAU', 59.3453, 5.2084],
        ['Stord lufthamn, Sørstokken', 'SRP', 59.7919, 5.3409],
        ['Bergen lufthavn, Flesland', 'BGO', 60.2934, 5.2181],
        ['Florø lufthamn', 'FRO', 61.5836, 5.0247],
        ['Førde lufthamn, Bringeland', 'FDE', 61.3911, 5.7569],
        ['Sogndal lufthamn, Haukåsen', 'SOG', 61.1561, 7.1378],
        ['Fagernes lufthavn, Leirin', 'VDB', 61.0156, 9.2881],
        ['Ørsta-Volda lufthamn, Hovden', 'HOV', 62.1800, 6.0741],
        ['Ålesund lufthavn, Vigra', 'AES', 62.5625, 6.1197],
        ['Molde lufthavn, Årø', 'MOL', 62.7447, 7.2625],
        ['Kristiansund lufthavn, Kvernberget', 'KSU', 63.1118, 7.8245],
        ['Trondheim lufthavn, Værnes', 'TRD', 63.4578, 10.9240],
        ['Røros lufthavn', 'RRS', 62.5783, 11.3423],
        ['Ørland lufthavn', 'OLA', 63.6989, 9.6040],
        ['Namsos lufthavn, Høknesøra', 'OSY', 64.4722, 11.5786],
        ['Rørvik lufthavn, Ryum', 'RVK', 64.8383, 11.1461],
        ['Brønnøysund lufthavn, Brønnøy', 'BNN', 65.4611, 12.2175],
        ['Sandnessjøen lufthavn, Stokka', 'SSJ', 65.9568, 12.4689],
        ['Mosjøen lufthavn, Kjærstad', 'MJF', 65.7840, 13.2149],
        ['Mo i Rana lufthavn, Røssvoll', 'MQN', 66.3639, 14.3014],
        ['Bodø lufthavn', 'BOO', 67.2692, 14.3653],
        ['Røst lufthavn', 'RET', 67.5278, 12.1033],
        ['Leknes lufthavn', 'LKN', 68.1525, 13.6094],
        ['Svolvær lufthavn, Helle', 'SVJ', 68.2433, 14.6692],
        ['Stokmarknes lufthavn, Skagen', 'SKN', 68.5789, 15.0336],
        ['Harstad/Narvik lufthavn, Evenes', 'EVE', 68.4913, 16.6781],
        ['Andøya lufthavn, Andenes', 'ANX', 69.2925, 16.1442],
        ['Bardufoss lufthavn', 'BDU', 69.0558, 18.5404],
        ['Tromsø lufthavn, Langnes', 'TOS', 69.6833, 18.9189],
        ['Sørkjosen lufthavn', 'SOJ', 69.7868, 20.9594],
        ['Hasvik lufthavn', 'HAA', 70.4867, 22.1397],
        ['Hammerfest lufthavn', 'HFT', 70.6797, 23.6686],
        ['Alta lufthavn', 'ALF', 69.9761, 23.3717],
        ['Lakselv lufthavn, Banak', 'LKL', 70.0688, 24.9735],
        ['Honningsvåg lufthavn, Valan', 'HVG', 71.0097, 25.9836],
        ['Mehamn lufthavn', 'MEH', 71.0297, 27.8267],
        ['Berlevåg lufthavn', 'BVG', 70.8714, 29.0342],
        ['Båtsfjord lufthavn', 'BJF', 70.6005, 29.6914],
        ['Vadsø lufthavn', 'VDS', 70.0653, 29.8447],
        ['Vardø lufthavn, Svartnes', 'VAW', 70.3554, 31.0449],
        ['Kirkenes lufthavn, Høybuktmoen', 'KKN', 69.7258, 29.8913],
        ['Svalbard lufthavn, Longyear', 'LYR', 78.2461, 15.4656],
    ];

    function flyAvstandKm(a1, o1, a2, o2) {
        const R = 6371, r = Math.PI / 180;
        const dA = (a2 - a1) * r, dO = (o2 - o1) * r;
        const x = Math.sin(dA / 2) ** 2
                + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dO / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(x));
    }

    const SERVER = 'https://thomaswestby.no/skript';
    const _flyCache = {};

    async function flySlaaOpp(postnr) {
        if (_flyCache[postnr] !== undefined) return _flyCache[postnr];
        _flyCache[postnr] = null;                       // hindrer parallelle oppslag på samme nr
        try {
            // Kjørekontoret er allerede løst server-side (samme kilde som telefon-toasten bruker).
            const [pt, kk] = await Promise.all([
                fetch(`${SERVER}/geokod_sok.php?postnr=${encodeURIComponent(postnr)}`).then(r => r.json()).catch(() => null),
                fetch(`${SERVER}/kjorekontor.php?postnr=${encodeURIComponent(postnr)}`).then(r => r.json()).catch(() => null),
            ]);
            if (!pt || !pt.ok || pt.lat == null) { _flyCache[postnr] = null; return null; }
            const naer = FLYPLASSER
                .map(f => ({ navn: f[0], iata: f[1], km: flyAvstandKm(pt.lat, pt.lon, f[2], f[3]) }))
                .sort((a, b) => a.km - b.km)
                .slice(0, 3);
            _flyCache[postnr] = {
                poststed: pt.poststed || '', kommune: pt.kommune || '',
                kontor: (kk && kk.ok) ? kk.kontor : null,
                kontorId: (kk && kk.ok) ? kk.id : null,
                flyplasser: naer,
            };
        } catch (_) { _flyCache[postnr] = null; }
        return _flyCache[postnr];
    }

    // ⚠️ IKKE SØK I ALLE <td>. textContent er REKURSIV, så en ytre celle «inneholder» teksten i
    //    alt under seg — et generisk søk treffer wizard-wrapperen, ikke etiketten. NISSY merker
    //    feltene selv: <td class="fieldname">Postnr/Sted:</td><td class="fieldvalue">8450 …</td>.
    //    Vi leter derfor kun blant fieldname-cellene, og tar verdien fra fieldvalue i samme rad.
    function flyFinnFelt(mnster) {
        const etiketter = document.querySelectorAll('td.fieldname, th.fieldname');
        for (const c of etiketter) {
            if (!mnster.test((c.textContent || '').replace(/ /g, ' ').trim())) continue;
            const rad = c.closest('tr');
            let v = rad && rad.querySelector('td.fieldvalue');
            if (!v) v = c.nextElementSibling;
            let verdi = v ? (v.textContent || '').replace(/ /g, ' ').trim() : '';
            // Er verdicellen tom, står verdien gjerne på linja under (som i egenandel-panelet).
            if (!verdi && rad && rad.nextElementSibling) {
                verdi = (rad.nextElementSibling.textContent || '').replace(/ /g, ' ').trim();
            }
            return { celle: c, rad: rad, verdi: verdi };
        }
        return null;
    }

    // Postnummeret står i SAMMENDRAGET til høyre, som følger bestillingen gjennom alle stegene
    // (Thomas 27.08). Begrunnelsen finnes derimot bare på pasient-steget — derfor huskes
    // fly-flagget i sessionStorage, nøklet på postnummer. Et postnummer er ikke en pasient.
    // ⚠️ TO FELLER I SAMME SELEKTOR, begge påvist på ekte markup:
    //
    //  1) td.summary_current markerer STEGET DU STÅR PÅ, ikke pasienten. På pasient-steget er
    //     pasientblokken «current»; på Reise-steget er den «summary_middle». Å låse seg til
    //     current gjorde at boksen forsvant på alle steg unntatt ett.
    //
    //  2) Men «alle summary_middle» er for vidt: REKVIRENTTILHØRIGHETEN står rett over pasienten
    //     og ser helt lik ut — «1337 Sandvika» mot «8450 STOKMARKNES». Den kommer FØRST i
    //     dokumentet, så et rent mønstersøk plukker rekvirentens postnummer og viser feil
    //     kjørekontor for pasienten. Det er verre enn at boksen uteblir.
    //
    // Derfor: avgrens til SEKSJONEN først («2. Pasient» → «Egenandel»/«3. Reise»), let så etter
    // postnummeret der. Overskriftene finnes i begge former — <strong>2. Pasient</strong> når
    // steget er aktivt, <a>-lenke ellers — og begge gir samme tekst.
    function flySummaryPostnrCelle() {
        const rot = document.querySelector('.summary_container');
        if (!rot) return null;
        const celler = [...rot.querySelectorAll('td')];
        const tekst = c => (c.textContent || '').replace(/\s+/g, ' ').trim();
        let start = -1, slutt = celler.length;
        for (let i = 0; i < celler.length; i++) {
            const t = tekst(celler[i]);
            if (start < 0) { if (/^2\.\s*Pasient$/i.test(t)) start = i; continue; }
            if (/^(Egenandel|3\.\s*Reise|4\.\s*Ferdigstill)$/i.test(t)) { slutt = i; break; }
        }
        if (start < 0) return null;
        for (let i = start + 1; i < slutt; i++) {
            if (/^\d{4}\s+[A-ZÆØÅ]/.test(tekst(celler[i]))) return celler[i];   // «8450 STOKMARKNES»
        }
        return null;
    }

    // Reise-seksjonen i sammendraget, avgrenset på samme måte som pasientblokken.
    function flyReiseTekst() {
        const rot = document.querySelector('.summary_container');
        if (!rot) return '';
        const celler = [...rot.querySelectorAll('td')];
        const tekst = c => (c.textContent || '').replace(/\s+/g, ' ').trim();
        let start = -1, slutt = celler.length;
        for (let i = 0; i < celler.length; i++) {
            const t = tekst(celler[i]);
            if (start < 0) { if (/^3\.\s*Reise$/i.test(t)) start = i; continue; }
            if (/^4\.\s*Ferdigstill$/i.test(t)) { slutt = i; break; }
        }
        if (start < 0) return '';
        return celler.slice(start + 1, slutt).map(tekst).join(' ');
    }

    // ⚠️ NISSY SKRIVER FLYPLASSNAVN FRITT: «Oslo Lufthavn Gardermoen/Avgang» og
    //    «Trondheim lufthavn,Værnes,TRD» i samme rekvisisjon. Vi matcher derfor på HELE navnet
    //    med slakke skilletegn, og godtar IATA-koden som alternativ — aldri på stedsnavnet alene
    //    («Bodø», «Alta») som like gjerne er pasientens hjemsted.
    function flyGjenkjennIReise(reisetekst) {
        if (!reisetekst) return [];
        const funn = [];
        for (const f of FLYPLASSER) {
            const deler = f[0].split(',').map(d => d.trim()).filter(Boolean);
            const navnRe = new RegExp(deler.map(d =>
                d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*,?\\s*'), 'i');
            const iataRe = new RegExp('\\b' + f[1] + '\\b');
            if (navnRe.test(reisetekst) || iataRe.test(reisetekst)) funn.push({ navn: f[0], iata: f[1] });
        }
        return funn;
    }

    function flyFlagg(postnr, verdi) {
        const n = 'vkt_fly_' + postnr;
        try {
            if (verdi === undefined) return sessionStorage.getItem(n) === '1';
            if (verdi) sessionStorage.setItem(n, '1'); else sessionStorage.removeItem(n);
        } catch (_) {}
        return !!verdi;
    }

    let _flyLoggetMangel = false;
    function dekorerFlyreise() {
        const celle = flySummaryPostnrCelle();
        if (!celle) {
            if (!_flyLoggetMangel && document.querySelector('.summary_container')) {
                _flyLoggetMangel = true;
                console.log(`[${NAVN}] flyreise: fant ingen postnummer-celle i sammendraget`);
            }
            return;
        }
        const postnr = ((celle.textContent || '').match(/\b(\d{4})\b/) || [])[1];
        if (!postnr) return;

        // Begrunnelsen finnes kun på pasient-steget. Ser vi den, oppdaterer vi flagget —
        // ellers stoler vi på det som allerede er satt for dette postnummeret.
        const beg = flyFinnFelt(/^Begrunnelse\b/i);
        if (beg) flyFlagg(postnr, /\bfly\w*/i.test(beg.verdi));
        const fly = flyFlagg(postnr);

        let boks = document.getElementById('vkt-fly-boks');
        // Reisen kan endres uten at postnummeret gjør det, og varselet henger på reisen.
        const reiseNoekkel = flyReiseTekst().slice(0, 300)
                           + '|' + JSON.stringify(kommVarsel(postnr) || 0);
        if (boks && boks.dataset.postnr === postnr && boks.dataset.fly === String(fly)
            && boks.dataset.reise === reiseNoekkel) return;
        if (!boks) {
            boks = document.createElement('div');
            boks.id = 'vkt-fly-boks';
            // Smal kolonne: liten skrift, ordbryting, ingen fast bredde.
            boks.style.cssText = 'margin:10px 0 4px 18px;padding:6px 8px;border:1px solid #d97706;'
                + 'border-left:3px solid #d97706;background:#fffbeb;border-radius:0 4px 4px 0;'
                + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;'
                + 'color:#1c1917;line-height:1.45;overflow-wrap:anywhere;';
        }
        // Nederst i sammendraget (Thomas 27.08). Mellom Pasient og Egenandel brøt boksen NISSYs
        // egen steg-rekkefølge — 2, boks, Egenandel, 3, 4. Nederst står den som en fotnote til
        // hele bestillingen, som er det den er, og den flytter ikke på noe av NISSYs innhold.
        const vert = document.querySelector('.summary_container td.summary_middle');
        if (vert && boks.parentNode !== vert) vert.appendChild(boks);
        else if (vert && vert.lastElementChild !== boks) vert.appendChild(boks);
        boks.dataset.postnr = postnr;
        boks.dataset.fly = String(fly);
        boks.dataset.reise = reiseNoekkel;
        boks.innerHTML = '<div style="color:#78716c;">slår opp ' + postnr + '…</div>';

        flySlaaOpp(postnr).then(d => {
            if (boks.dataset.postnr !== postnr) return;              // rekvisisjonen byttet under oss
            if (!d) { boks.innerHTML = 'Fant ikke postnummer ' + postnr + '.'; return; }
            // Er det VÅRT eget kontor, er linjen støy: det er normaltilfellet, og operatøren
            // trenger bare beskjed når turen hører hjemme et annet sted (Thomas 28.08).
            const mitt = mittKontorId();
            const vaart = mitt !== null && d.kontorId !== null && parseInt(d.kontorId, 10) === mitt;
            let h = vaart ? '' :
                    '<div style="font-size:9px;color:#78716c;text-transform:uppercase;'
                  + 'letter-spacing:.4px;">Kjørekontor</div>'
                  + '<div style="font-weight:700;">' + (d.kontor || 'ukjent for ' + postnr) + '</div>';
            if (fly) {
                h += '<div style="font-size:9px;color:#78716c;text-transform:uppercase;'
                   + 'letter-spacing:.4px;margin-top:5px;">✈️ Nærmeste lufthavn</div>'
                   + d.flyplasser.map((f, i) =>
                        '<div style="' + (i === 0 ? 'font-weight:700;' : 'color:#57534e;') + '">'
                        + f.navn + ' (' + f.iata + ') · ' + Math.round(f.km) + ' km</div>').join('')
                   + '<div style="margin-top:3px;color:#78716c;">Forslag — rutetilbudet avgjør.</div>';

                // ⚠️ SIER FRA, PÅSTÅR IKKE FEIL. En reise kan lovlig gå mellom to fjerne
                //    flyplasser — mellomlanding, eller et ben andre kjører. Men står pasienten i
                //    Hadsel mens reisen går Gardermoen–Værnes, er det verdt et blikk. Varselet
                //    utløses kun når reisen faktisk nevner en flyplass, og pasientens nærmeste
                //    ikke er blant dem: da har vi noe å sammenligne med.
                const iReisen = flyGjenkjennIReise(flyReiseTekst());
                const naermest = d.flyplasser[0];
                if (iReisen.length && naermest
                    && !iReisen.some(x => x.iata === naermest.iata)) {
                    h += '<div style="margin-top:6px;padding:5px 7px;background:#fef2f2;'
                       + 'border:1px solid #fca5a5;border-radius:4px;color:#991b1b;">'
                       + '<b>⚠ Sjekk flyplassen.</b> Reisen bruker '
                       + iReisen.map(x => x.navn + ' (' + x.iata + ')').join(' og ')
                       + '. Pasientens nærmeste er ' + naermest.navn + ' (' + naermest.iata + '), '
                       + Math.round(naermest.km) + ' km.</div>';
                }
            }

            // Gul boks tom = ingenting å si. Da skal den heller ikke stå der og se ut som noe.
            boks.style.display = h ? '' : 'none';
            boks.innerHTML = h;

            // ⚠️ EGEN BOKS. Kjørekontor og kommunesjekk har ingenting med hverandre å gjøre, men
            //    delte ramme og så dermed ut som én sak (Thomas 28.08). Varselet er rødt og står
            //    for seg selv, under.
            const kv = kommVarsel(postnr);
            let kboks = document.getElementById('vkt-komm-boks');
            if (!kv) { if (kboks) trygtFjern(kboks); return; }
            if (!kboks) {
                kboks = document.createElement('div');
                kboks.id = 'vkt-komm-boks';
                kboks.style.cssText = 'margin:6px 0 4px 18px;padding:6px 8px;border:1px solid #dc2626;'
                    + 'border-left:3px solid #dc2626;background:#fef2f2;border-radius:0 4px 4px 0;'
                    + 'font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;'
                    + 'color:#991b1b;line-height:1.45;overflow-wrap:anywhere;';
            }
            if (boks.parentNode && kboks.previousElementSibling !== boks) {
                boks.parentNode.insertBefore(kboks, boks.nextSibling);
            }
            // Lenken krever admin-tilgang — derfor noe operatøren VELGER å følge.
            const kurl = location.origin + '/administrasjon/admin/treatmentCenter?id='
                       + encodeURIComponent(kv.id) + '&action=edit';
            // ⚠️ SKRIV FOR OPERATØREN, IKKE OM MEKANIKKEN (Thomas 28.08: «dette kommer til å
            //    forvirre operatørene»). Første forsøk sa «kommunen utledet av postnummeret —
            //    NISSY hadde den ikke», som forklarer VÅRT oppslag og ikke pasientens reise.
            //    «basert på postnummeret» sier det samme forbeholdet på hennes språk: hun vet at
            //    et postnummer er grovere enn en adresse, og kan vurdere det selv.
            // BETA-merke: sjekken er ny og bygget på et register vi selv høster. Operatøren skal
            // vite at den kan ta feil — og at hun skal si fra når den gjør det.
            const beta = '<span style="background:#fbbf24;color:#451a03;font-size:9px;'
                       + 'font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px;'
                       + 'letter-spacing:.5px;vertical-align:middle;">BETA</span>';
            kboks.innerHTML = '<b>⚠ Ut av kommunen til primærhelsetjeneste.</b>' + beta + '<br>'
                + '<a href="' + kurl + '" target="_blank" rel="noopener" style="color:#991b1b;">'
                + statusEsc(kv.navn) + '</a> er ' + statusEsc(kv.sektor) + ' i '
                + statusEsc(pentNavn(kv.stedKomm)) + ' kommune.<br>'
                + 'Pasienten reiser ' + (kv.fraBehandling ? 'til' : 'fra') + ' <b>'
                + statusEsc(pentNavn(kv.pasientKomm)) + ' kommune</b>'
                + (kv.utledet ? ' basert på postnummeret' : '') + '.';
        });
    }

    // ══ KOMMUNESJEKK: PRIMÆRHELSETJENESTE SKAL VÆRE I EGEN KOMMUNE ══════════════════════
    // Thomas 27.08: «primærhelsetjenesten er et kommunalt tilbud, så det skal være innenfor
    // kommunen». Registeret har nøyaktig tre sektorer — Primærhelsetjeneste (57k),
    // Helseforetak (13k) og Avtalespesialist (4k) — og kommuneavvik-skanningen godkjenner
    // allerede de to siste over kommunegrensen. Det som blir igjen er regelen her.
    //
    // ⚠️ ALT VI TRENGER LIGGER I NISSYS EGET SKJEMA (dumpen 28.08). Steg 3 har skjulte felt:
    //      fromAddress.councilNr = 301   (OSLO)
    //      toAddress.councilNr   = 3222  (LØRENSKOG)
    //      toOrganizationId      = 37668 (behandlingsstedets id)
    //    Vi skal altså verken utlede kommune fra postnummer eller slå opp koordinater — NISSY
    //    har kommunenummeret for begge endepunkter, og id-en gir sektoren rett fra registeret.
    //
    // ⚠️ RETNINGEN SNUR HVEM SOM ER HVEM. «Til behandling» → pasienten er FRA, behandlingsstedet
    //    er TIL. «Fra behandling» → omvendt. Leses fra radioknappen, ikke antatt.
    const statusEsc = (t) => String(t == null ? '' : t)
        .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    // ⚠️ SVARET MÅ BÆRES VIDERE. councilNr og toOrganizationId finnes BARE på
    //    redigeringsskjemaet (steg 3). På steg 4 står det bare tekst i sammendraget, så et varsel
    //    ankret til Leveringssted-feltet forsvinner der (Thomas 28.08). Vi regner det ut der
    //    tallene finnes og husker resultatet, nøklet på pasientens POSTNUMMER — samme mønster som
    //    fly-flagget, og et postnummer er ikke en pasient. Nøkkelen hindrer også at et gammelt
    //    varsel henger igjen på neste rekvisisjon.
    function kommVarsel(postnr, verdi) {
        const n = 'vkt_komm_' + postnr;
        try {
            if (verdi === undefined) { const r = sessionStorage.getItem(n); return r ? JSON.parse(r) : null; }
            if (verdi) sessionStorage.setItem(n, JSON.stringify(verdi)); else sessionStorage.removeItem(n);
        } catch (_) {}
        return verdi || null;
    }

    let _sisteKommSjekk = '';
    const _kommSjekkCache = {};
    // ⚠️ CACHE LØFTET, IKKE RESULTATET. Med en null-plassholder mens oppslaget er underveis
    //    leser et parallelt kall plassholderen som et SVAR — og logger «fant ikke sted X i
    //    registeret» om et sted som finnes. Første kall vinner, de andre får en løgn.
    //    Med løftet i cachen deler alle samme forespørsel, og en feil sletter oppføringen så
    //    neste forsøk faktisk prøver på nytt i stedet for å arve nullen for alltid.
    function bhsSektor(id) {
        if (_kommSjekkCache[id]) return _kommSjekkCache[id];
        _kommSjekkCache[id] = fetch(`${SERVER}/behandlingssted.php?id=${encodeURIComponent(id)}`)
            .then(r => r.json())
            .then(j => (j && j.ok && j.sted) ? j.sted : null)
            .catch(() => { delete _kommSjekkCache[id]; return null; });
        return _kommSjekkCache[id];
    }

    // Samme for postnummer-oppslaget: uten cache traff vi Geonorge på hver observer-runde.
    // ⚠️ SAMMENLIGN ID, IKKE NAVN. kjorekontor.php svarer med NISSY-høstede navn
    //    («Pasientreiser Oslo og Akershus»), mens backend kjenner korte kontornavn — de ville
    //    aldri matchet som tekst. Begge sider har derimot dispatch_center_id.
    //    Tilgangen bor i planleggeren; rekvisisjonsvinduet er samme origin, så vi kan lese den
    //    fra opener. Er den utilgjengelig, VISER vi kjørekontoret — heller en linje for mye enn
    //    å skjule at turen hører hjemme et annet sted.
    // NISSY og Geonorge skriver kommunenavn med STORE BOKSTAVER; i en setning leses det som
    // roping. Bindestreksnavn må beholde stor forbokstav i begge ledd (Nord-Aurdal).
    function pentNavn(n) {
        const t = String(n || '').trim();
        if (!t || t !== t.toUpperCase()) return t;          // allerede blandet — la stå
        return t.toLowerCase().replace(/(^|[\s\-\/])([a-zà-ÿ])/g, (_, f, c) => f + c.toUpperCase());
    }

    function mittKontorId() {
        try {
            const t = window.opener && window.opener.__vkt_tilgang;
            const id = t && parseInt(t.dispatch_center_id, 10);
            return Number.isFinite(id) ? id : null;
        } catch (_) { return null; }
    }

    const _kommPostCache = {};
    function kommPostnrKommune(postnr) {
        if (_kommPostCache[postnr]) return _kommPostCache[postnr];
        _kommPostCache[postnr] = fetch(`${SERVER}/geokod_sok.php?postnr=${encodeURIComponent(postnr)}`)
            .then(r => r.json())
            .then(j => (j && j.ok && j.kommunenr) ? j : null)
            .catch(() => { delete _kommPostCache[postnr]; return null; });
        return _kommPostCache[postnr];
    }

    function dekorerKommunesjekk() {
        const v = id => { const e = document.getElementById(id); return e ? (e.value || '').trim() : ''; };
        const valgt = document.querySelector('input[name="direction"]:checked');
        if (!valgt) return;                                   // ikke redigeringsskjemaet (lista)
        const fraBehandling = valgt.value === '1';

        const pasientNr   = fraBehandling ? v('toAddress.councilNr')   : v('fromAddress.councilNr');
        const pasientNavn = fraBehandling ? v('toAddress.council')     : v('fromAddress.council');
        const pasientPost = fraBehandling ? v('toAddress.postCode')    : v('fromAddress.postCode');
        const stedNr      = fraBehandling ? v('fromAddress.councilNr') : v('toAddress.councilNr');
        const stedNavn    = fraBehandling ? v('fromAddress.council')   : v('toAddress.council');
        const stedId      = fraBehandling ? v('fromOrganizationId')    : v('toOrganizationId');
        if (!pasientPost) return;

        // councilNr er 0/tomt før NISSY har validert adressen mot GAB, og uten behandlingssted-id
        // kjenner vi ikke sektoren. Da sletter vi et eventuelt tidligere svar i stedet for å la
        // det bli stående som fasit for en reise det ikke lenger gjelder.
        // ⚠️ FRAVÆR AV SKJEMA ER IKKE BEVIS FOR FRAVÆR AV VARSEL (Thomas 28.08: «to forskjellige
        //    state»). Steg 3 har TO visninger: redigeringsskjemaet med feltene, og listevisningen
        //    som bare er en tabellrad uten et eneste skjult felt. Slettet vi svaret hver gang
        //    feltene manglet, ville varselet forsvinne i det operatøren gikk tilbake til lista.
        //    Vi sletter derfor KUN når skjemaet er der og selv sier at grunnlaget er borte —
        //    altså at adressefeltene finnes, men uten gyldig kommunenummer.
        const skjemaFinnes = !!document.getElementById('toAddress.postCode');
        // ⚠️ NISSY FYLLER IKKE ALLTID councilNr. På editTrip står pasientens `councilNr` som «0»
        //    fordi adressen ikke er GAB-validert i den skjermbildetilstanden, mens behandlings-
        //    stedets er komplett. Postnummeret er derimot alltid der — og Geonorge gir kommune-
        //    nummeret for det. Vi utleder BARE når NISSY selv mangler tallet, aldri i stedet for.
        //    Sammenligningen gjøres på nummer, ikke navn: Geonorge skriver «0301», NISSY «301».
        const kommTall = t => String(t || '').replace(/^0+/, '');
        // ⚠️ Observeren fyrer flere ganger i sekundet. Uten denne sperren regnet vi det samme om
        //    igjen hver gang — med et nytt kall til Geonorge og til registeret for hver runde.
        const sjekkNoekkel = [pasientPost, pasientNr, stedNr, stedId].join('|');
        if (_sisteKommSjekk === sjekkNoekkel) return;
        _sisteKommSjekk = sjekkNoekkel;

        // ⚠️ ET LAGRET SVAR GJELDER ETT BESTEMT STED. Bytter operatøren leveringssted, er den nye
        //    adressen ikke GAB-validert ennå (councilNr = 0), og sjekken hoppet ut uten å røre
        //    det gamle svaret — så varselet ble stående og navnga et sted som ikke lenger var
        //    valgt (Thomas 28.08: byttet til Ahus, som er Helseforetak, men varselet om fastlegen
        //    hang igjen til han trykket OK). Regelen «ikke slett når data mangler» fra 1.50
        //    beskytter listevisningen — den skal ikke beskytte en påstand om FEIL sted.
        //    ID-EN ER PÅSTANDENS IDENTITET: er skjemaet der og id-en en annen, forkastes svaret
        //    straks, uavhengig av om vi klarer å regne ut et nytt.
        const lagretKv = kommVarsel(pasientPost);
        if (skjemaFinnes && lagretKv && String(lagretKv.id) !== String(stedId || '')) {
            console.log(`[${NAVN}] kommunesjekk: behandlingsstedet er byttet `
                + `(${lagretKv.id} → ${stedId || '∅'}) — forkaster gammelt varsel`);
            kommVarsel(pasientPost, null);
            dekorerFlyreise();
        }
        if ((!pasientNr || pasientNr === '0') && pasientPost && stedId && stedNr && stedNr !== '0') {
            kommPostnrKommune(pasientPost)
                .then(j => {
                    if (!j) return;
                    console.log(`[${NAVN}] kommunesjekk: NISSY manglet pasientens kommune — `
                        + `utledet ${j.kommune} (${j.kommunenr}) fra postnr ${pasientPost}`);
                    kommSammenlign(kommTall(j.kommunenr), j.kommune, stedNr, stedNavn, stedId,
                                   pasientPost, true, fraBehandling);
                })
                .catch(() => {});
            return;
        }
        if (!stedId || !pasientNr || !stedNr || pasientNr === '0' || stedNr === '0') {
            // Si HVORFOR. «Ingenting skjedde» er den dyreste feilmeldingen som finnes — vi har
            // brukt flere runder på å lete etter en tegnefeil som egentlig var manglende data.
            console.log(`[${NAVN}] kommunesjekk: gir opp — `
                + `pasientNr=${pasientNr || '∅'} stedNr=${stedNr || '∅'} stedId=${stedId || '∅'}`
                + ` (retning=${fraBehandling ? 'fra' : 'til'} behandling, skjema=${skjemaFinnes})`);
            if (skjemaFinnes && (pasientNr === '0' || stedNr === '0')) kommVarsel(pasientPost, null);
            return;
        }

        const foer = JSON.stringify(kommVarsel(pasientPost) || 0);
        kommSammenlign(kommTall(pasientNr), pasientNavn, stedNr, stedNavn, stedId,
                       pasientPost, false, fraBehandling);
    }

    // Én regel, uansett om pasientens kommune kom fra NISSY eller ble utledet av postnummeret.
    function kommSammenlign(pasientNr, pasientNavn, stedNr, stedNavn, stedId, pasientPost, utledet, fraBehandling) {
        const foer = JSON.stringify(kommVarsel(pasientPost) || 0);
        console.log(`[${NAVN}] kommunesjekk: sted ${stedId} (${stedNavn} ${stedNr}) `
            + `mot pasient i ${pasientNavn} ${pasientNr}${utledet ? ' (utledet)' : ''}`);
        bhsSektor(stedId).then(sted => {
            if (!sted) {
                console.log(`[${NAVN}] kommunesjekk: fant ikke sted ${stedId} i registeret`);
                return;
            }
            const varsle = /prim/i.test(sted.sektor || '')
                && String(pasientNr) !== String(stedNr).replace(/^0+/, '');
            kommVarsel(pasientPost, varsle ? {
                id: sted.id, navn: sted.navn, sektor: sted.sektor,
                stedKomm: stedNavn || stedNr, pasientKomm: pasientNavn || pasientNr,
                utledet: !!utledet,
                // Retningen avgjør preposisjonen i varselet: «reiser FRA Oslo kommune» til
                // behandling, «reiser TIL Oslo kommune» hjem igjen. Den vet vi bare her, på
                // skjemaet — sammendraget sier det ikke — så den må bæres med svaret.
                fraBehandling: !!fraBehandling
            } : null);
            if (varsle) console.log(`[${NAVN}] kommunesjekk: ${sted.navn} (${sted.sektor}) i `
                + `${stedNavn} vs pasient i ${pasientNavn} → VARSEL`);
            if (foer !== JSON.stringify(kommVarsel(pasientPost) || 0)) dekorerFlyreise();
        });
    }

    function planleggDekorasjon() {
        if (rafPlanlagt !== null) return;
        rafPlanlagt = requestAnimationFrame(() => {
            rafPlanlagt = null;
            dekorerHeader();
            dekorerRekvisisjonsListen();
            dekorerSpesielleBehov();
            fargeLaasteBehov();
            lagKalender();
            dekorerFlyreise();
            dekorerKommunesjekk();
        });
    }
    const datoObs = new MutationObserver(planleggDekorasjon);
    datoObs.observe(document.body, { childList: true, subtree: true });
    dekorerHeader();
    dekorerRekvisisjonsListen();
    dekorerSpesielleBehov();
    fargeLaasteBehov();
    lagKalender();
    dekorerFlyreise();
    dekorerKommunesjekk();

    poll();
    holdOpenerLevende();
    setInterval(poll, POLL_MS);
    setInterval(holdOpenerLevende, POLL_MS);

    // Tydelig oppstarts-banner så det er åpenbart at agenten er lastet
    console.log(
        `%c[${NAVN} v${VERSJON}]%c aktiv på ${location.pathname}\n` +
        `Poller nissy_jobs.php hvert ${POLL_MS / 1000}. sek for modul=${MODUL}\n` +
        `Holder opener (planlegger) levende. Klar for jobber.`,
        'background:#fbbf24;color:#451a03;font-weight:700;padding:2px 6px;border-radius:3px;',
        'color:inherit;'
    );

    // Heartbeat hvert 30. sek så det er lett å se at agenten fortsatt lever
    let heartbeatTeller = 0;
    setInterval(() => {
        heartbeatTeller++;
        console.log(`%c[${NAVN}]%c heartbeat #${heartbeatTeller} — opener=${window.opener && !window.opener.closed ? 'levende' : 'borte'}`,
            'color:#fbbf24;font-weight:600;', 'color:#94a3b8;');
    }, 30000);
})();
