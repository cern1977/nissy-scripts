// === GARDERMOEN — flightnummer-sjekk for Gardermoen-turer (v0.1) ===
// Henter Gardermoen-filteret (rfilter=14047) via ajax-dispatch og bruker
// Overvåker Live sin fly-deteksjon for å flagge turer MED vs UTEN flightnummer.
// Formål: taxisentralen trenger flightnr for å følge flyforsinkelser. Mangler
// det, gir vi en admin-lenke for å sjekke/finne info.
// Injiseres i NISSY-siden via Verktøykasse-launcher (samme origin → kan fetche).
(function () {
    'use strict';
    const FLAG = '__gardermoenTool';
    // Ingen early-return: hver injeksjon (re-klikk av launcher) skal kjøre FERSK kode
    // og oppføre seg som en refresh. Tidligere guard låste oss til gammel open().

    const BASE = location.origin;          // https://pastrans-sorost.mq.nhn.no
    const RFILTER = '14047';               // Gardermoen-filteret
    const AVINOR_URL = 'https://thomaswestby.no/skript/avinor.php?airport=OSL';  // proxy (CORS+cache)
    const BUFFER_MIN = 20;                 // fly må lande ≥20 min før taxitid, ellers «for lite tid»
    const VERSJON = '0.64';  // 0.64: g-travel-bekreftet fly er fasit → buffer mot landing, demper feil DY-chip; «✏ Korriger»-knapp retter flightnr (melding) + hentetid i NISSY (bekreftelse)
    const NISSY_BLAA = 'rgb(148, 169, 220)';  // NISSYs egen rad-markeringsfarge (basic_tools leser samme verdi)
    const DEBUG = true;      // logg til konsollen (prefiks [GRM])
    const logg = (...a) => { if (DEBUG) { try { console.log('[GRM]', ...a); } catch (_) {} } };
    const loggFeil = (...a) => { try { console.warn('[GRM] ⚠', ...a); } catch (_) {} };

    // ===================== Fly-deteksjon (portet fra Overvåker Live / ovr_fly.js) =====================
    const IATA_MAP = {
        'ålesund':'aes','alesund':'aes','alta':'alf','andenes':'anx','andøya':'anx','andoya':'anx',
        'bardufoss':'bdu','bergen':'bgo','berlevåg':'bvg','berlevag':'bvg','bodø':'boo','bodo':'boo',
        'brønnøysund':'bnn','bronnoysund':'bnn','båtsfjord':'bjf','batsfjord':'bjf','fagernes':'vdb',
        'florø':'fro','floro':'fro','førde':'fde','forde':'fde','hammerfest':'hft','harstad':'eve',
        'evenes':'eve','hasvik':'haa','haugesund':'hau','honningsvåg':'hvg','honningsvag':'hvg',
        'kirkenes':'kkn','kristiansand':'krs','kristiansund':'ksu','lakselv':'lkl','leknes':'lkn',
        'longyearbyen':'lyr','svalbard':'lyr','mehamn':'meh','mo i rana':'mqn','molde':'mol',
        'mosjøen':'mjf','mosjoen':'mjf','namsos':'osy','narvik':'eve','røros':'rrs','roros':'rrs',
        'røst':'ret','rost':'ret','rørvik':'rvk','rorvik':'rvk','sandnessjøen':'ssj','sandnessjoen':'ssj',
        'sogndal':'sog','stavanger':'svg','stokmarknes':'skn','stord':'srp','svolvær':'svj','svolvaer':'svj',
        'sørkjosen':'soj','sorkjosen':'soj','tromsø':'tos','tromso':'tos','trondheim':'trd','værnes':'trd',
        'vardø':'vaw','vardo':'vaw','vadsø':'vds','vadso':'vds','værøy':'vry','varoy':'vry',
        'stockholm':'arn','arlanda':'arn','københavn':'cph','kobenhavn':'cph','copenhagen':'cph','kastrup':'cph',
        'london':'lhr','heathrow':'lhr','gatwick':'lgw','amsterdam':'ams','schiphol':'ams','frankfurt':'fra',
        'münchen':'muc','munchen':'muc','helsinki':'hel','gdansk':'gdn','riga':'rix','vilnius':'vno',
        'warszawa':'waw','warsaw':'waw','alicante':'alc','malaga':'agp','split':'spu','nice':'nce','paris':'cdg',
        'barcelona':'bcn','madrid':'mad','roma':'fco','rome':'fco','milano':'mxp','milan':'mxp','istanbul':'ist',
        'bangkok':'bkk','dubai':'dxb','reykjavik':'kef','antalya':'ayt','kreta':'her','heraklion':'her','rhodos':'rho',
        'palma':'pmi','mallorca':'pmi','lisboa':'lis','lisbon':'lis','manchester':'man','edinburgh':'edi','dublin':'dub',
        'zürich':'zrh','zurich':'zrh','wien':'vie','vienna':'vie','praha':'prg','prague':'prg','budapest':'bud',
        'krakow':'krk','berlin':'ber','hamburg':'ham','düsseldorf':'dus','dusseldorf':'dus','göteborg':'got',
        'goteborg':'got','malmö':'mmx','malmo':'mmx','aalborg':'aal','billund':'bll'
    };
    const FLY_REGEX = /\b([A-Za-z]{2,3})[\s.\-]{0,3}(\d{2,5})\b/g;  // tillater «SK4079», «SK 4079», «sk. 4079», «SK-4079»
    const IKKE_FLY = ['kl','ca','tl','nr','dl','el','gm','av','se','ob','pn'];
    const FRA_REGEX = /fr[aå]\s+([a-zæøåé\s]+?)(?:\s+kl|\s+ca|\s*\d|,|\.|\s+[A-Za-z]{2,3}[\s\-]?\d|$)/i;
    const ETA_REGEX1 = /(?:kl\.?|klokken|klokka|ca\.?|lander|ankommer|ankomst)\s*(\d{1,2})[:.]\s*(\d{2})/i;
    const ETA_REGEX2 = /(?:kl\.?|klokken|klokka|ca\.?|lander|ankommer|ankomst)\s*(\d{2})(\d{2})(?:\D|$)/i;
    const ETA_REGEX3 = /[A-Za-z]{2,3}[\s\-]?\d{2,5}\s+(\d{1,2})[:.]\s*(\d{2})/i;

    // Fly-kontekstord foran et rent tall — operatører skriver ofte «Ankomst 4014» uten selskap.
    const FLY_KONTEKST = /(?:ankomst|ank\.?|fly(?:nr)?\.?|flight|rute|lander|ankommer|kommer\s+med)\s*:?\s*(\d{3,4})\b/i;

    // Tog, ikke fly: «Kommer med Tog RX 11 fra Sandefjord. Ankomst Gardermoen kl 07.07».
    // Da skal vi IKKE tolke «RX 11» som flightnr eller jage Avinor — pasienten kommer med tog.
    const TOG_REGEX = /\btog(?:et)?\b/i;
    function byggTogInfo(melding) {
        if (!melding || !TOG_REGEX.test(melding)) return null;
        const lm = melding.match(/\b((?:RX|RE|R|L|F)\s?\d{1,3})\b/i);   // regiontog/lokaltog: RX11, R11, L12 …
        const linje = lm ? lm[1].toUpperCase().replace(/\s+/g, ' ').trim() : '';
        const em = melding.match(ETA_REGEX1) || melding.match(ETA_REGEX2);
        const eta = em ? String(em[1]).padStart(2, '0') + ':' + em[2] : '';
        return { linje, eta };
    }

    function byggFlyInfo(melding) {
        if (!melding) return null;
        let flightnr = null, nummer = null, gjettet = false;
        // 1) Flyselskap + nr (f.eks. SK4014)
        for (const m of melding.matchAll(FLY_REGEX)) {
            const kode = m[1].toUpperCase();
            if (IKKE_FLY.includes(kode.toLowerCase())) continue;
            flightnr = kode + m[2]; nummer = m[2]; break;
        }
        // 2) Rent tall med fly-kontekst → antatt selskap: 4 siffer = SK (SAS), 3 = DY (Norwegian)
        if (!flightnr) {
            const bm = melding.match(FLY_KONTEKST);
            if (bm) { nummer = bm[1]; flightnr = (nummer.length === 4 ? 'SK' : 'DY') + nummer; gjettet = true; }
        }
        if (!flightnr) return null;
        const low = melding.toLowerCase();
        let fraIata = '';
        const fm = low.match(FRA_REGEX);
        if (fm && IATA_MAP[fm[1].trim()]) fraIata = IATA_MAP[fm[1].trim()];
        if (!fraIata) for (const [by, iata] of Object.entries(IATA_MAP)) { if (low.includes(by)) { fraIata = iata; break; } }
        let eta = '';
        const em = melding.match(ETA_REGEX1) || melding.match(ETA_REGEX2) || melding.match(ETA_REGEX3);
        if (em) eta = String(em[1]).padStart(2, '0') + ':' + em[2];
        const dato = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const avinorUrl = fraIata
            ? `https://www.avinor.no/flyplass/oslo/flytider/flyinfo/?flightid=${flightnr.toLowerCase()}-${fraIata}-osl-${dato}&statusScope=arrival`
            : `https://www.avinor.no/flyplass/oslo/flytider/?search=${flightnr}&statusScope=arrival`;
        return { flightnr, nummer, gjettet, fraIata, eta, avinorUrl };
    }

    // ===================== Datahenting =====================
    // NISSY leverer ISO-8859-1 (ikke UTF-8). Dekoder manuelt for å unngå � på æøå.
    async function hentISO(url, charset) {
        const res = await fetch(url, { credentials: 'same-origin' });
        const buf = await res.arrayBuffer();
        return new TextDecoder(charset || 'iso-8859-1').decode(buf);
    }

    // Sjekk om admin-modulen er innlogget. Utlogget → admin svarer med login-siden
    // (login.vm / «Pasienttransport - innlogging») og ALLE turer ser feilaktig ut til å
    // mangle flightnr. Returnerer false=utlogget, true=ok, null=nettverksfeil.
    async function adminInnlogget() {
        try {
            const html = await hentISO(`${BASE}/administrasjon/admin/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (/login\.vm|administrasjon\/auth|Pasienttransport\s*-\s*innlogging/i.test(html)) { logg('admin: utlogget (login-side detektert)'); return false; }
            return true;
        } catch (e) { loggFeil('admin-sjekk feilet:', e.message); return null; }
    }

    async function hentTurer() {
        const url = `${BASE}/planlegging/ajax-dispatch?did=all&action=openres&rid=-1&rfilter=${RFILTER}&t=${Date.now()}`;
        const xml = new DOMParser().parseFromString(await hentISO(url), 'text/xml');
        const turer = [];
        xml.querySelectorAll('response').forEach(resp => {
            if (resp.getAttribute('id') !== 'paagaaendeOppdrag') return;
            const d = document.createElement('div');
            d.innerHTML = resp.textContent;
            const headerRow = d.querySelector('tr.tbh');
            const h = headerRow ? Array.from(headerRow.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, '')) : [];
            const iNavn = h.findIndex(s => s.includes('NAVN'));
            const iStart = h.findIndex(s => s.includes('START'));
            d.querySelectorAll('tbody tr[name]').forEach(tr => {
                const resId = tr.getAttribute('name');
                const reqIds = [...tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)].map(m => m[1]);
                if (!reqIds.length) return;
                const navn = (iNavn >= 0 && tr.cells[iNavn]) ? tr.cells[iNavn].textContent.trim() : '';
                const start = (iStart >= 0 && tr.cells[iStart]) ? tr.cells[iStart].textContent.trim() : '';
                // Manuell status (grønn hake = «gått gjennom»). NISSY-ikonet images/manualStatusN.gif:
                // 1=blank, 2=grønn hake, 3=rød hake, 4=grønn firkant, 5=rød firkant (syklus via toggle).
                const msm = tr.innerHTML.match(/manualStatus(\d+)\.gif/i);
                const manualStatus = msm ? parseInt(msm[1], 10) : 1;
                // Tildelt vognløp: cellene viser «X.Y.Z-N» (eks 1.90.1-71228065) + status «Tildelt».
                // Vår POST til /rekvisisjon/confirm endrer kun rekvisisjonen — vognløpets pickup-tid
                // beholder gammel verdi, og NISSY rødmerker raden. Blokker «Flytt hentetid» for disse.
                const cellTxt = [...tr.cells].map(c => c.textContent).join(' | ');
                const vmm = cellTxt.match(/\b(\d+\.\d+\.\d+-\d+)\b/);
                const vognlop = vmm ? vmm[1] : '';
                const tildelt = !!vognlop || /\btildelt\b|\bp[åa]g[åa]ende\b/i.test(cellTxt);
                // Egen g-travel-avtale «Gtravel17 - Flybestilling Gtravel»: dette er selve flybestillingen,
                // ikke en taxihenting vi overvåker → flagges og holdes utenfor avvik.
                const flybestilling = /gtravel|flybestilling/i.test(cellTxt);
                turer.push({ resId, reqId: reqIds[0], navn, start, taxiDate: parseStart(start), manualStatus, tildelt, vognlop, flybestilling });
            });
        });
        // Kun i morgen og framover — dagens turer er passert/uaktuelle for forhåndssjekk.
        const imorgen = new Date(); imorgen.setHours(0, 0, 0, 0); imorgen.setDate(imorgen.getDate() + 1);
        return turer.filter(t => t.taxiDate && t.taxiDate >= imorgen);
    }

    async function hentMelding(reqId, resId) {
        const url = `${BASE}/administrasjon/admin/ajax_reqdetails?id=${reqId}&db=1&tripid=${resId}&showSutiXml=false&hideEvents=true&full=true`;
        const html = await hentISO(url, 'utf-8');   // admin-modulen er UTF-8 — ellers ÆØÅ-mojibake i melding/navn/adresse
        const mm = html.match(/Melding til transport[^:]*:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
        const melding = mm ? mm[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : '';
        let turId = '', gref = '';   // gref = g-travel Bestillingsreferanse (Løyve, FØR «/»), f.eks. H0VFG3
        const lt = html.match(/L&oslash;yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i)
                || html.match(/Løyve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        if (lt) {
            const raw = lt[1].trim(); const si = raw.indexOf('/');
            turId = si > -1 ? raw.substring(si + 1).trim() : raw;
            const loyve = (si > -1 ? raw.substring(0, si) : raw).trim();
            // Kun hvis det ligner en g-travel-referanse (6 tegn, bokstaver+tall) — taxi-løyver har annet format.
            if (/^[A-Z0-9]{5,7}$/i.test(loyve) && /[A-Z]/i.test(loyve) && /\d/.test(loyve)) gref = loyve.toUpperCase();
        }
        // Pasientens hjem-postnr (svakt flyplass-hint). Rens tags + &nbsp; først, anker til
        // Pasient-seksjonen (før Rekvirent), finn «NNNN STED». Robust mot markup-variasjon.
        let postnr = '';
        const ren = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
        const pasDel = ren.match(/Pasient(.*?)Rekvirent/i);
        const pm = (pasDel ? pasDel[1] : ren).match(/\b(\d{4})\s+[A-ZÆØÅ]/);
        if (pm) postnr = pm[1];
        // Rekvisisjonsnummeret (12-sifret, VÅR ref mot g-travel) ligger i skjult input name="reqNr".
        let reknr = '';
        const rm = html.match(/name="reqNr"\s+value="(\d{6,})"/i) || ren.match(/Rekvisisjon\s*(\d{6,})/i);
        if (rm) reknr = rm[1];
        // Turens HENTESTED (egen <fieldset>, ikke pasientens hjem) — avgjør flyplass-henting vs lokal
        // adresse (avtale-avvik: lokal 2060-adresse på OSL-avtale skal egentlig på 1.31.1/1.41.2).
        let hentNavn = '', hentAdr = '', hentPost = '', reisemaate = '';
        // Fieldset-grensen er upålitelig (ingen ren </fieldset>). Slice fra «Hentested</legend>» og ta
        // FØRSTE Adresse/Postnr/Navn etter det — det er hentestedet (pasient-adressen ligger FØR).
        const hi = html.search(/Hentested\s*<\/legend>/i);
        if (hi >= 0) {
            const etter = html.slice(hi, hi + 1200);   // hentested-seksjonen (før Leveringssted)
            const nm = etter.match(/Navn:\s*<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const am = etter.match(/Adresse:\s*<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const hp = etter.match(/Postnr[^<]*:\s*<\/td>\s*<td[^>]*>\s*(\d{4})/i);
            if (nm) hentNavn = nm[1].replace(/&nbsp;/gi, ' ').trim();
            if (am) hentAdr = am[1].replace(/&nbsp;/gi, ' ').trim();
            if (hp) hentPost = hp[1];
        }
        const rmaa = html.match(/Reisem\S{1,3}te:\s*<\/td>\s*<td[^>]*>\s*([A-Za-z]+)/i);
        if (rmaa) reisemaate = rmaa[1].toUpperCase();
        // Pasientens fødselsnummer (11 siffer) — nøkkel for å slå opp andre rekvisisjoner.
        let pnr = '';
        const pnm = ren.match(/F[øo]dselsnummer\D{0,10}(\d{11})/i) || ren.match(/\b(\d{11})\b/);
        if (pnm) pnr = pnm[1];
        // Pasientnavn — fallback når Navn-kolonnen er skjult i NISSY-tabellen.
        // Strukturen i Pasient-seksjonen: «… Navn: ETTERNAVN, FORNAVN  Fødselsnummer: 12345678901 …».
        // Stopp på Fødselsnummer (alltid like etter Navn) for å unngå at vi snapper opp resten av seksjonen.
        let navn = '';
        const nmm = (pasDel ? pasDel[1] : ren).match(/Navn:\s*([^]+?)\s+F[øo]dselsnummer/i);
        if (nmm) navn = nmm[1].replace(/\s+/g, ' ').trim();
        // Pasientens mobilnummer — taxisentralen MÅ kunne nå pasienten ved flyforsinkelse.
        // Samme kilder/prioritet som Overvåker Live; tar første GYLDIGE mobil (8 siffer, starter 4/9).
        let mobil = '';
        for (const mm2 of [
            html.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i),
            html.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i),
            html.match(/>Mobilnr \(2\):<\/td>\s*<td[^>]*>\s*([^<]+)/i),
            html.match(/Ring ved ankomst hentested:<\/td>\s*<td[^>]*>\s*([^<]+)/i),
            html.match(/Ring ved ankomst:<\/td>\s*<td[^>]*>\s*([^<]+)/i)
        ]) {
            if (!mm2) continue;
            const n8 = normaliserTlf(mm2[1]);
            if (erMobil(n8)) { mobil = n8; break; }
        }
        logg(`admin req=${reqId} res=${resId} | mobil=${mobil || '✗'} | navn=${navn || '?'} | reknr=${reknr || '?'} | hentested="${hentAdr || hentNavn || '?'} ${hentPost || ''}" | reisemåte=${reisemaate || '?'} | melding="${(melding || '').slice(0, 40)}"`);
        return { melding, turId, postnr, reknr, pnr, mobil, navn, gref, hentNavn, hentAdr, hentPost, reisemaate };
    }

    // Slå opp pasientens andre rekvisisjoner via pnr (ssnSearch — samme som Overvåker Live).
    // Søkeresultatet er en tabell med Fra/Til-kolonner. Flyreisen er den raden som ankommer
    // OSL/Gardermoen — dens Fra-celle gir AVREISE-flyplassen (f.eks. «BGO 5258 Blomsterdalen»).
    // Vi trenger ikke flightnr herfra; avreise + taxitid → kandidatfly via Avinor.
    async function finnFlyViaPnr(pnr) {
        if (!pnr || pnr.length !== 11) return null;
        try {
            const body = `submit_action=ssnSearch&ssn=${pnr}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            const res = await fetch(`${BASE}/administrasjon/admin/searchStatus`, {
                method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
            });
            const html = new TextDecoder('iso-8859-1').decode(await res.arrayBuffer());
            const doc = new DOMParser().parseFromString(html, 'text/html');
            // Finn tabellen med Fra/Til-kolonner
            let iFra = -1, iTil = -1, headerRow = null;
            for (const tr of doc.querySelectorAll('tr')) {
                const heads = Array.from(tr.cells || []).map(c => c.textContent.trim().toLowerCase());
                const f = heads.indexOf('fra'), t = heads.indexOf('til');
                if (f >= 0 && t >= 0) { iFra = f; iTil = t; headerRow = tr; break; }
            }
            if (!headerRow) { logg('pnr-søk: fant ikke Fra/Til-tabell i søkeresultatet'); return null; }
            // Header ligger ofte i <thead>, data i <tbody> → hent rader fra hele <table>, ikke bare forelderen.
            const tabell = headerRow.closest('table') || headerRow.parentElement;
            const rows = Array.from(tabell.querySelectorAll('tr'))
                .filter(tr => tr !== headerRow && tr.cells && tr.cells.length > Math.max(iFra, iTil));
            logg(`pnr-søk: ${rows.length} rekvisisjoner for pasienten (kol Fra=${iFra} Til=${iTil})`);
            for (const tr of rows) {
                const fra = (tr.cells[iFra].textContent || '').replace(/\s+/g, ' ').trim();
                const til = (tr.cells[iTil].textContent || '').replace(/\s+/g, ' ').trim();
                // Flyankomst til Oslo: Til = OSL/Gardermoen. Fra-cella gir avreise-flyplassen.
                if (!/\bOSL\b|gardermoen|\b206[01]\b/i.test(til)) continue;
                // Dette er FLY-rekvisisjonen (Til=Gardermoen). Dens reknr matcher g-travel-bookingen
                // (taxi-turens reknr gjør ikke det når flyet er egen rekvisisjon).
                const flyReknr = (tr.innerHTML.match(/\b\d{12}\b/) || [])[0] || '';
                let origin = null;
                const im = fra.match(/\b([A-ZÆØÅ]{3})\b/);
                if (im && im[1].toUpperCase() !== 'OSL') origin = im[1].toUpperCase();
                if (!origin) { const low = fra.toLowerCase(); for (const by in IATA_MAP) if (low.includes(by)) { origin = IATA_MAP[by].toUpperCase(); break; } }
                logg(`pnr-rad: Fra="${fra.slice(0, 32)}" Til="${til.slice(0, 22)}" → avreise=${origin || '-'} flyReknr=${flyReknr || '-'}`);
                if (origin || flyReknr) return { kunOrigin: !!origin, fraIata: origin || '', flyReknr };
            }
            return null;
        } catch (e) { loggFeil('pnr-søk feilet:', e.message); return null; }
    }

    // Kjent avreise + taxitid → finn sannsynlig fly i Avinor: ankomster fra <origin> på turdatoen
    // som lander FØR taxien. Nærmest taxitid først = mest sannsynlig. Gir ikke sikker buffer.
    function finnKandidatfly(flights, origin, taxiDate) {
        if (!origin || !taxiDate) return [];
        const ut = [];
        for (const fnr in flights) {
            for (const o of flights[fnr]) {
                if ((o.origin || '').toUpperCase() !== origin) continue;
                const sched = new Date(o.schedule);
                if (!sammeDato(sched, taxiDate)) continue;
                const land = o.time ? new Date(o.time) : sched;   // faktisk/estimert, ellers rutetid
                const buffer = Math.round((taxiDate - land) / 60000);
                if (buffer < 0 || buffer > 240) continue;          // må lande før taxi, innen 4t
                ut.push({ flightnr: fnr, land, buffer, code: o.code });
            }
        }
        return ut.sort((a, b) => a.buffer - b.buffer);
    }

    // Avinor-landingstider via proxy (CORS + cache). Map: flight_id → {schedule,code,time,origin}.
    async function hentAvinor() {
        try {
            const res = await fetch(AVINOR_URL + '&_=' + Date.now());
            const j = await res.json();
            return (j && j.ok && j.flights) ? j.flights : {};
        } catch (e) { return {}; }
    }

    // Parse start-cellen: "DD.MM[.YYYY] HH:MM" (framtidige turer) eller "HH:MM" (i dag) → full Date.
    // OBS: «21.05 10:40» — dato må ikke forveksles med klokkeslett (gammel bug tok 21.05 → 21:05).
    function parseStart(start) {
        const s = String(start || '').trim();
        let m = s.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?\s+(\d{1,2})[.:](\d{2})/);
        if (m) {
            const yr = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : new Date().getFullYear();
            return new Date(yr, +m[2] - 1, +m[1], +m[4], +m[5], 0, 0);
        }
        m = s.match(/(\d{1,2})[.:](\d{2})/);   // bare klokkeslett → i dag
        if (!m) return null;
        const d = new Date(); d.setHours(+m[1], +m[2], 0, 0); return d;
    }
    function sammeDato(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function hhmm(d) { return d ? d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }) : ''; }
    // Telefon: behold siste 8 siffer. Norsk mobil = 8 siffer som starter på 4 eller 9.
    function normaliserTlf(val) { if (!val) return ''; const d = String(val).replace(/\D/g, ''); return d.length >= 8 ? d.slice(-8) : ''; }
    function erMobil(n8) { return /^[49]\d{7}$/.test(n8 || ''); }
    function fmtMobil(n8) { return n8 && n8.length === 8 ? n8.slice(0, 3) + ' ' + n8.slice(3, 5) + ' ' + n8.slice(5) : (n8 || ''); }

    // Grov sone-mapping: pasientens hjem-postnr → sannsynlig hjem-flyplass (SVAKT hint → gul).
    const POSTNR_FLYPLASS = [
        [4000, 4399, 'SVG', 'Stavanger'], [5000, 5999, 'BGO', 'Bergen'],
        [6000, 6399, 'AES', 'Ålesund'], [6400, 6699, 'MOL', 'Molde'],
        [7000, 7499, 'TRD', 'Trondheim'], [8000, 8499, 'BOO', 'Bodø'],
        [9000, 9299, 'TOS', 'Tromsø']
    ];
    function postnrTilFlyplass(postnr) {
        const n = parseInt(postnr, 10);
        if (!n) return null;
        for (const [lo, hi, iata, navn] of POSTNR_FLYPLASS) if (n >= lo && n <= hi) return { iata, navn };
        return null;
    }

    // Vurder landing mot taxitid → t.avinor = {funnet,cancelled,landet,landingDate,taxiDate,buffer,forLite}.
    // Landing = faktisk (A) eller estimert (E) tid, ellers rutetid. Buffer = taxitid − landing.
    function vurderLanding(t, flights) {
        const fnr = ((t.fly && t.fly.flightnr) || '').toUpperCase();
        const num = (t.fly && t.fly.nummer) || '';
        let arr = flights[fnr];
        // Antatt selskap (SK/DY) kan være feil → fallback: match på tall-endelse + turdato,
        // uansett selskap. Avinor-flyets origin bekrefter ruta (f.eks. SVG = Sola).
        if ((!arr || !arr.length) && num) {
            for (const [id, occs] of Object.entries(flights)) {
                if (id.replace(/^[A-Za-z]+/, '') === num && occs.some(o => o.schedule && sammeDato(new Date(o.schedule), t.taxiDate))) { arr = occs; break; }
            }
        }
        if (!arr || !arr.length) { t.avinor = { funnet: false }; return; }
        // KRITISK: bruk kun forekomst med rutetid på SAMME dato som turen. Aldri falle tilbake
        // til feil dato (ga «7220 min»-bug). Finnes ikke turdatoen → Avinor mangler data ennå.
        const info = arr.find(o => o.schedule && sammeDato(new Date(o.schedule), t.taxiDate));
        if (!info) { t.avinor = { funnet: true, ingenDato: true }; return; }
        const cancelled = info.code === 'C';
        const landet = info.code === 'A';
        const landingISO = ((info.code === 'A' || info.code === 'E') && info.time) ? info.time : info.schedule;
        const landingDate = landingISO ? new Date(landingISO) : null;
        const taxiDate = t.taxiDate;
        const buffer = (landingDate && taxiDate) ? Math.round((taxiDate - landingDate) / 60000) : null;
        t.avinor = {
            funnet: true, cancelled, landet, code: info.code, origin: info.origin || '', landingDate, taxiDate, buffer,
            forLite: !cancelled && buffer !== null && buffer < BUFFER_MIN
        };
    }

    // ===================== UI (OSL departures-board look, v0.29) =====================
    const css = `
    #grm-panel{
      --navy-900:#0a1426;--navy-800:#0e1c33;--board-700:#0d3d8a;--board-600:#1450b0;--board-500:#1a5fcc;
      --yellow:#ffcc00;--yellow-2:#f5b700;--orange:#ff8a1f;--ink:#0a1426;--white:#fff;
      --dim:rgba(255,255,255,.62);--dim-2:rgba(255,255,255,.4);--line:rgba(255,255,255,.10);--line-2:rgba(255,255,255,.18);
      --green-bg:#06402b;--red:#ef4444;--red-bg:#2a1414;
      --font-sans:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      --font-mono:"JetBrains Mono",ui-monospace,monospace;
      position:fixed;top:20px;right:20px;width:560px;max-width:96vw;max-height:90vh;z-index:2147483646;
      display:flex;flex-direction:column;overflow:hidden;border-radius:14px;color:var(--white);
      background:linear-gradient(180deg,var(--board-700) 0%,#0a2d6e 100%);border:1px solid rgba(0,0,0,.6);
      font-family:var(--font-sans);box-shadow:0 30px 80px -20px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.06);}
    #grm-panel *{box-sizing:border-box;}
    /* Header */
    #grm-head{background:linear-gradient(180deg,var(--navy-900),var(--navy-800));padding:14px 16px 16px;border-bottom:2px solid #000;cursor:move;user-select:none;flex:0 0 auto;}
    .grm-titlerow{display:flex;align-items:baseline;gap:14px;}
    .grm-title{display:flex;align-items:baseline;gap:10px;flex:1;min-width:0;}
    .grm-title .ic{align-self:center;}
    .grm-title .nm{font-weight:800;font-size:23px;letter-spacing:-.01em;line-height:1;}
    .grm-title .nm.w{color:var(--white);} .grm-title .nm.y{color:var(--yellow);}
    .grm-ver{font-family:var(--font-mono);font-size:11px;color:var(--dim);border:1px solid var(--line-2);padding:2px 6px;border-radius:4px;margin-left:2px;align-self:center;}
    .grm-actions{display:flex;gap:8px;}
    .grm-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid var(--line-2);color:var(--white);font-family:var(--font-sans);font-weight:600;font-size:13px;padding:6px 11px;border-radius:6px;cursor:pointer;}
    .grm-btn:hover{background:rgba(255,255,255,.12);}
    .grm-x{width:32px;height:32px;display:inline-grid;place-items:center;background:rgba(255,255,255,.04);border:1px solid var(--line-2);border-radius:6px;cursor:pointer;color:#fff;}
    .grm-x:hover{background:rgba(255,255,255,.1);}
    /* Clock strip */
    .grm-strip{margin-top:14px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;background:linear-gradient(180deg,#070d1a,#0a1426);border:1px solid var(--line);border-radius:8px;padding:8px 12px;}
    .grm-count{display:flex;align-items:center;gap:10px;}
    .grm-count .lab{font-size:10px;color:var(--dim-2);letter-spacing:.14em;text-transform:uppercase;font-weight:700;}
    .grm-count .num{font-family:var(--font-mono);font-weight:700;font-size:18px;color:var(--white);}
    .grm-clock{font-family:var(--font-mono);font-weight:700;font-size:22px;color:var(--yellow);letter-spacing:.02em;text-shadow:0 0 12px rgba(255,204,0,.35);text-align:center;}
    .grm-circle{width:28px;height:28px;border-radius:50%;background:var(--yellow);display:inline-grid;place-items:center;flex:0 0 auto;}
    /* shimmer on refresh */
    .grm-shim{height:2px;background:rgba(0,0,0,.4);position:relative;overflow:hidden;flex:0 0 auto;}
    .grm-shim.on::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,var(--yellow),transparent);animation:grmShim .9s linear infinite;}
    @keyframes grmShim{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
    /* Body */
    #grm-body{overflow-y:auto;flex:1 1 auto;padding-bottom:8px;}
    /* Section header */
    .grm-sec{display:flex;align-items:center;gap:12px;padding:16px 14px 10px;}
    .grm-badge{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto;}
    .grm-badge.y{background:var(--yellow);} .grm-badge.o{background:var(--orange);}
    .grm-sec .t{flex:1;min-width:0;}
    .grm-sec .t .no{font-weight:800;letter-spacing:.06em;font-size:13px;text-transform:uppercase;color:#fff;}
    .grm-sec .t .en{font-size:11px;color:var(--dim);letter-spacing:.06em;font-weight:500;}
    .grm-sec .cnt{font-family:var(--font-mono);font-weight:700;font-size:18px;color:#fff;background:rgba(0,0,0,.35);border:1px solid var(--line-2);border-radius:6px;padding:3px 10px;min-width:44px;text-align:center;}
    /* Card */
    .grm-kort{margin:0 12px 10px;background:rgba(255,255,255,.035);border:1px solid var(--line);border-left:4px solid var(--board-500);border-radius:10px;padding:11px 13px;}
    .grm-kort.fly{border-left-color:var(--yellow);}
    .grm-kort.gul{border-left-color:#eab308;}
    .grm-kort.mangler{border-left-color:var(--orange);}
    .grm-kort.problem{border-left-color:var(--red);background:linear-gradient(180deg,rgba(239,68,68,.10),rgba(255,255,255,.02));}
    .grm-kort.gjennomgaatt{opacity:.55;}
    .grm-rad1{display:flex;align-items:flex-start;gap:12px;}
    .grm-tidcol{font-family:var(--font-mono);font-weight:700;color:#fff;font-size:15px;line-height:1.1;flex:0 0 auto;min-width:52px;}
    .grm-tidcol .d{color:var(--dim);font-size:11px;font-weight:500;}
    .grm-navnwrap{flex:1;min-width:0;}
    .grm-navn{font-weight:800;color:#fff;font-size:14px;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .grm-meta{font-family:var(--font-mono);font-size:11px;color:var(--dim-2);margin-top:1px;}
    .grm-fly{display:inline-flex;align-items:center;gap:5px;background:var(--yellow);color:var(--ink);padding:3px 9px;border-radius:5px;font-size:12px;font-weight:800;text-decoration:none;margin-top:8px;font-family:var(--font-mono);letter-spacing:.02em;}
    .grm-fly.antatt{background:var(--yellow-2);}
    .grm-buffer{font-size:12px;margin-top:8px;padding:4px 9px;border-radius:5px;display:inline-block;font-weight:600;}
    .grm-buffer.ok{background:var(--green-bg);color:#6ee7b7;}
    .grm-buffer.darlig{background:#7f1d1d;color:#fecaca;font-weight:800;}
    .grm-buffer.cancel{background:#7f1d1d;color:#fecaca;}
    .grm-buffer.ukjent{background:rgba(255,255,255,.07);color:var(--dim);}
    .grm-gul{font-size:12px;margin-top:8px;padding:6px 10px;border-radius:6px;background:rgba(255,204,0,.12);border:1px solid rgba(255,204,0,.3);color:#ffe89a;line-height:1.5;}
    .grm-gul strong{color:var(--yellow);}
    .grm-melding{font-size:12px;color:var(--dim);margin-top:7px;line-height:1.45;white-space:pre-wrap;}
    .grm-gt{font-size:12px;margin-top:8px;padding:6px 10px;border-radius:6px;background:rgba(59,130,246,.14);border:1px solid rgba(59,130,246,.4);color:#bfdbfe;line-height:1.5;}
    .grm-gt strong{color:#93c5fd;}
    .grm-gt .h{opacity:.7;font-style:italic;}
    .grm-avtale{font-size:12px;margin-top:8px;padding:6px 10px;border-radius:6px;background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.45);color:#fecaca;line-height:1.5;}
    .grm-avtale strong{color:#fca5a5;}
    .grm-kort.lokal{border-left-color:var(--dim);opacity:.7;}
    .grm-lokal{font-size:12px;color:var(--dim);margin-top:7px;font-style:italic;}
    .grm-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
    .grm-mobil{font-size:12px;padding:3px 9px;border-radius:5px;display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-weight:600;}
    .grm-mobil.ok{background:var(--green-bg);color:#6ee7b7;}
    .grm-mobil.mangler{background:#7f1d1d;color:#fecaca;font-weight:700;}
    .grm-rad2{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap;}
    .grm-gatt{background:rgba(255,255,255,.08);border:1px solid var(--line-2);color:#dbe4f0;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;}
    .grm-gatt:hover{background:rgba(255,255,255,.14);}
    .grm-gatt.pa{background:var(--green-bg);border-color:rgba(52,211,153,.4);color:#6ee7b7;}
    .grm-gatt.feil{background:#7f1d1d;border-color:rgba(239,68,68,.4);color:#fecaca;}
    .grm-gatt:disabled{cursor:default;opacity:.95;}
    .grm-tid{background:var(--yellow);border:none;color:var(--ink);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;}
    .grm-tid:hover{background:#ffd633;}
    .grm-tid.ok{background:var(--green-bg);color:#6ee7b7;}
    .grm-tid.feil{background:#7f1d1d;color:#fecaca;}
    .grm-tid:disabled{opacity:.8;cursor:default;}
    .grm-korr{background:var(--board-500);border:none;color:#fff;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer;}
    .grm-korr:hover{background:#2a73e0;}
    .grm-korr.ok{background:var(--green-bg);color:#6ee7b7;}
    .grm-korr.feil{background:#7f1d1d;color:#fecaca;}
    .grm-korr:disabled{opacity:.8;cursor:default;}
    .grm-feilfly{font-size:11px;color:#fecaca;margin:2px 0 0 2px;}
    .grm-feilfly s{opacity:.85;}
    .grm-admin{margin-left:auto;width:34px;height:34px;border-radius:50%;background:var(--yellow);display:inline-grid;place-items:center;text-decoration:none;flex:0 0 auto;cursor:pointer;}
    .grm-admin:hover{background:#ffd633;}
    .grm-admin.feil{background:#ef4444;}
    .grm-admin.aktiv{background:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.45);}
    @keyframes grm-rad-blink{0%,100%{box-shadow:inset 0 0 0 9999px transparent;}50%{box-shadow:inset 0 0 0 9999px rgba(59,130,246,.35);}}
    tr.grm-blink{animation:grm-rad-blink .5s ease-in-out 2;}
    /* Admin banner / empty / status */
    .grm-adminbanner{margin:14px;background:var(--red-bg);border:1px solid rgba(239,68,68,.5);border-left:4px solid var(--red);border-radius:10px;padding:14px;}
    .grm-adminbanner .h{font-weight:800;color:#fca5a5;font-size:14px;margin-bottom:6px;}
    .grm-adminbanner .b{font-size:12px;color:#fecaca;line-height:1.55;}
    .grm-adminbanner a{display:inline-block;background:#b91c1c;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-weight:700;margin-top:8px;}
    .grm-tom{color:var(--dim);font-size:13px;text-align:center;padding:18px;font-family:var(--font-mono);letter-spacing:.04em;}
    .grm-status{font-size:12px;color:var(--dim);padding:14px;text-align:center;}
    /* Footer */
    #grm-footer{flex:0 0 auto;}
    .grm-callout-wrap{padding:14px;background:rgba(0,0,0,.25);border-top:1px solid var(--line-2);}
    .grm-callout{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:linear-gradient(180deg,var(--board-600),var(--board-700));border:1px solid rgba(255,204,0,.35);border-radius:10px;padding:12px 14px;cursor:pointer;color:#fff;font-family:inherit;}
    .grm-callout .cc{width:42px;height:42px;border-radius:50%;background:var(--yellow);display:grid;place-items:center;flex:0 0 auto;}
    .grm-callout .lab{font-size:10px;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;font-weight:700;}
    .grm-callout .big{font-weight:800;font-size:16px;color:#fff;}
    .grm-callout .lt{font-family:var(--font-mono);font-weight:700;font-size:13px;color:var(--yellow);margin-left:auto;}
    .grm-departures{display:flex;align-items:center;justify-content:space-between;background:var(--yellow);color:var(--ink);padding:10px 16px;font-weight:800;letter-spacing:.22em;font-size:12px;text-transform:uppercase;}
    .grm-departures .mono{font-family:var(--font-mono);letter-spacing:.05em;}
    #grm-panel svg{display:block;}
    `;

    function settInn() {
        if (document.getElementById('grm-style')) return;
        // Google Fonts (Hanken Grotesk + JetBrains Mono). Fallbacks gjør at det ser greit ut om NISSY-CSP blokkerer.
        if (!document.getElementById('grm-fonts')) {
            const f = document.createElement('link'); f.id = 'grm-fonts'; f.rel = 'stylesheet';
            f.href = 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap';
            document.head.appendChild(f);
        }
        const st = document.createElement('style'); st.id = 'grm-style'; st.textContent = css; document.head.appendChild(st);
    }
    // SVG-ikoner (OSL-stil). c = farge.
    const ICON = {
        plane: (c, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M2.5 13.5l8-2.2L14.7 3l2.1.6-2.5 8.2 5.2-1.4 1.4-2.3 1.5.4-1.3 4.2 1 4.4-1.5.4-2-1.9-5.1 1.4-2 8.4-2.1.6-.5-8.7-7.5 2.4-.4-1.6z"/></svg>`,
        warn: (c, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M12 2 1 21h22L12 2zm0 6 7.5 13H4.5L12 8zm-1 4v4h2v-4h-2zm0 5v2h2v-2h-2z"/></svg>`,
        arrowR: (c = '#0a1426', s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="${c}" stroke-width="3" stroke-linecap="square"/></svg>`,
        arrowL: (c = '#0a1426', s = 12) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M19 12H6M11 6l-6 6 6 6" stroke="${c}" stroke-width="3" stroke-linecap="square"/></svg>`,
        arrowU: (c = '#0a1426', s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M12 19V6M6 11l6-6 6 6" stroke="${c}" stroke-width="3" stroke-linecap="square"/></svg>`,
        refresh: (c = '#fff', s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8M21 3v5h-5" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        close: (c = '#fff', s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M5 5l14 14M19 5 5 19" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    };
    function ddmm(d) { return d ? String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') : ''; }
    function lukk() {
        const p = document.getElementById('grm-panel'); if (p) p.remove();
        if (window._grmClock) { clearInterval(window._grmClock); window._grmClock = null; }
    }

    // Gjør panelet flyttbart ved å dra i headeren. Posisjon huskes i localStorage.
    function gjorFlyttbar(p, handle) {
        let dragger = false, sx = 0, sy = 0, startL = 0, startT = 0;
        handle.addEventListener('mousedown', e => {
            if (e.target.closest('button')) return;   // ikke dra når man klikker en knapp
            const r = p.getBoundingClientRect();
            p.style.left = r.left + 'px'; p.style.top = r.top + 'px'; p.style.right = 'auto';
            dragger = true; sx = e.clientX; sy = e.clientY; startL = r.left; startT = r.top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!dragger) return;
            const nx = Math.max(0, Math.min(window.innerWidth - p.offsetWidth, startL + (e.clientX - sx)));
            const ny = Math.max(0, Math.min(window.innerHeight - 40, startT + (e.clientY - sy)));
            p.style.left = nx + 'px'; p.style.top = ny + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!dragger) return;
            dragger = false;
            try { localStorage.setItem('grm_pos', JSON.stringify({ left: parseInt(p.style.left), top: parseInt(p.style.top) })); } catch (_) {}
        });
    }

    function panel() {
        lukk();
        const p = document.createElement('div'); p.id = 'grm-panel';
        p.innerHTML = `
            <div id="grm-head">
                <div class="grm-titlerow">
                    <div class="grm-title">
                        <span class="ic">${ICON.plane('#ffcc00', 22)}</span>
                        <span class="nm w">Gardermoen</span>
                        <span class="nm y">flightsjekk</span>
                        <span class="grm-ver">v${VERSJON}</span>
                    </div>
                    <div class="grm-actions">
                        <button id="grm-refresh" class="grm-btn">${ICON.refresh()} Oppdater</button>
                        <button id="grm-close" class="grm-x" aria-label="Lukk">${ICON.close()}</button>
                    </div>
                </div>
                <div class="grm-strip">
                    <div class="grm-count">
                        <span class="grm-circle">${ICON.arrowL()}</span>
                        <div><div class="lab">OK</div><div class="num" id="grm-cnt-fly">–</div></div>
                    </div>
                    <div class="grm-clock" id="grm-clock">--:--</div>
                    <div class="grm-count" style="justify-content:flex-end;">
                        <div style="text-align:right;"><div class="lab">Avvik</div><div class="num" id="grm-cnt-mangler">–</div></div>
                        <span class="grm-circle">${ICON.arrowR()}</span>
                    </div>
                </div>
            </div>
            <div class="grm-shim" id="grm-shim"></div>
            <div id="grm-body"><div class="grm-status">Laster Gardermoen-turer …</div></div>
            <div id="grm-footer"></div>`;
        document.body.appendChild(p);
        // Gjenopprett lagret posisjon
        try {
            const pos = JSON.parse(localStorage.getItem('grm_pos') || 'null');
            if (pos && Number.isFinite(pos.left) && Number.isFinite(pos.top)) {
                const l = Math.max(0, Math.min(window.innerWidth - p.offsetWidth, pos.left));
                const t = Math.max(0, Math.min(window.innerHeight - 40, pos.top));
                p.style.left = l + 'px'; p.style.top = t + 'px'; p.style.right = 'auto';
            }
        } catch (_) {}
        document.getElementById('grm-close').onclick = lukk;
        document.getElementById('grm-refresh').onclick = kjor;
        gjorFlyttbar(p, document.getElementById('grm-head'));
        // Levende tavleklokke
        const oppdaterKlokke = () => { const c = document.getElementById('grm-clock'); if (c) c.textContent = hhmm24(new Date()); };
        oppdaterKlokke();
        if (window._grmClock) clearInterval(window._grmClock);
        window._grmClock = setInterval(oppdaterKlokke, 1000);
        const grmBody = document.getElementById('grm-body');
        // Blåmerk turen i planleggingsbildet: finn radens id=V-/P-<resId> (samme resId som Gardermoen har),
        // scroll til den og sett NISSYs egen markeringsfarge — slik at den blir «valgt» i NISSY sin forstand
        // (basic_tools m.fl. plukker opp rader med backgroundColor === NISSY_BLAA).
        // Toggle: returnerer 'pa' (markert), 'av' (avmarkert) eller null (fant ikke rad).
        function blaamerkTur(resId) {
            if (!resId) return null;
            const rad = document.getElementById('P-' + resId)
                     || document.getElementById('V-' + resId)
                     || document.querySelector(`tr[name="${resId}"]`);
            if (!rad) return null;
            if (rad.style.backgroundColor === NISSY_BLAA) {
                // av — gjenopprett radens opprinnelige farge
                rad.style.backgroundColor = rad.dataset.grmOrigBg || '';
                delete rad.dataset.grmOrigBg;
                return 'av';
            }
            // på — husk opprinnelig farge, scroll og blåmerk
            if (rad.dataset.grmOrigBg === undefined) rad.dataset.grmOrigBg = rad.style.backgroundColor || '';
            try { rad.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
            rad.style.backgroundColor = NISSY_BLAA;
            rad.classList.remove('grm-blink'); void rad.offsetWidth; rad.classList.add('grm-blink');  // restart blink
            setTimeout(() => rad.classList.remove('grm-blink'), 1200);
            return 'pa';
        }

        // Delegert: «Flytt hentetid»-knapp → sett departureTime = landing + 20 min i NISSY (rek-modul).
        grmBody.addEventListener('click', async (e) => {
            // Gul pil → blåmerk turen i planleggingsbildet (erstatter tidligere admin-lenke).
            const adm = e.target.closest('.grm-admin');
            if (adm) {
                const r = blaamerkTur(adm.dataset.resid);
                if (r === null) {
                    logg(`blåmerk: fant ikke rad for resId=${adm.dataset.resid} i planleggingsbildet`);
                    adm.classList.add('feil');
                    adm.title = 'Fant ikke turen i planleggingsbildet — er du på riktig visning?';
                    setTimeout(() => adm.classList.remove('feil'), 1500);
                } else {
                    adm.classList.toggle('aktiv', r === 'pa');
                    adm.title = r === 'pa' ? 'Turen er blåmerket — klikk for å fjerne' : 'Vis turen i planleggingen (blåmerk raden)';
                }
                return;
            }
            const tid = e.target.closest('.grm-tid');
            if (tid && !tid.disabled) {
                const orig = tid.textContent;
                tid.disabled = true; tid.textContent = '⏳ flytter …';
                try {
                    const r = await endreHentetidR(tid.dataset.req, tid.dataset.ny);
                    logg(`flytt tid: ok=${r.ok} status=${r.status || ''} | lagret=${r.lagret} forventet=${r.forventet} utlogget=${!!r.utlogget}`);
                    const lagretOk = r.lagret != null && String(r.lagret).replace('.', ':') === String(r.forventet).replace('.', ':');
                    if (r.ok && !lagretOk) {
                        // POST svarte 200, men skjemaet viser fortsatt feil tid → ble IKKE lagret.
                        tid.classList.add('feil');
                        tid.textContent = `⚠ Ikke lagret (står ${r.lagret || '?'}, ville ${r.forventet})`;
                        tid.disabled = false;
                        loggFeil(`flytt tid: POST 200 men tid IKKE lagret — lagret=${r.lagret} forventet=${r.forventet}`);
                        return;
                    }
                    if (r.ok) {
                        tid.classList.add('ok'); tid.textContent = `✓ Flyttet til ${tid.dataset.ny}`;
                        logg(`flytt tid OK — lagret ${r.lagret}`);
                        // (v0.49) Buffer-avviket er nå løst (klar-fra = landing+20). Marker i minnet + re-render:
                        // turen havner i «Uten avvik» HVIS buffer var eneste avvik — ellers blir den stående
                        // (men flytt-knappen forsvinner siden buffer nå er OK). Tømmer lista etter hvert.
                        const t = (window._grmTurer || []).find(x => String(x.reqId) === String(tid.dataset.req));
                        if (t && t.avinor) { t.avinor.forLite = false; t.avinor.buffer = Math.max(BUFFER_MIN, t.avinor.buffer || BUFFER_MIN); }
                        setTimeout(() => { if (window._grmReRender) window._grmReRender(); }, 700);  // la «✓ Flyttet» vises et øyeblikk
                    } else if (r.utlogget) {
                        tid.classList.add('feil');
                        tid.textContent = '⚠ Logg inn i rekvisisjon-modulen';
                        tid.onclick = () => window.open(`${REK_BASE}/`, '_blank', 'noopener');
                        tid.disabled = false;
                    } else {
                        tid.classList.add('feil'); tid.textContent = `⚠ ${r.feil || ('HTTP ' + r.status)}`; tid.disabled = false;
                    }
                } catch (err) {
                    loggFeil('flytt tid feilet:', err.message);
                    tid.classList.add('feil'); tid.textContent = '⚠ feil — prøv igjen'; tid.disabled = false;
                }
                return;
            }
            // Korriger (g-travel-fasit) → retter flightnr i melding + hentetid i NISSY, med bekreftelse.
            const korr = e.target.closest('.grm-korr');
            if (korr && !korr.disabled) {
                const nyTid = korr.dataset.ny || '';
                const nyFly = korr.dataset.fly || '';
                const land = korr.dataset.land || '';
                const gmlFly = korr.dataset.gmlfly || '';
                const deler = [];
                if (nyFly) deler.push(`Flightnr: ${gmlFly || '?'} → ${nyFly}${land ? ' (lander ' + land + ')' : ''}`);
                if (nyTid) deler.push(`Hentetid → ${nyTid}`);
                if (!confirm(`Korriger denne turen i NISSY (g-travel-fasit)?\n\n• ${deler.join('\n• ')}\n\nDette skriver til rekvisisjonen.`)) return;
                korr.disabled = true; korr.textContent = '⏳ korrigerer …';
                try {
                    const r = await endreHentetidR(korr.dataset.req, nyTid, { nyFly, land, gmlFly });
                    logg(`korriger: ok=${r.ok} status=${r.status || ''} | tid lagret=${r.lagret} forventet=${r.forventet} | flyFelt=${r.flyFeltFunnet} flyOk=${r.flyOk}`);
                    if (r.utlogget) {
                        korr.classList.add('feil'); korr.textContent = '⚠ Logg inn i rekvisisjon-modulen';
                        korr.onclick = () => window.open(`${REK_BASE}/`, '_blank', 'noopener'); korr.disabled = false; return;
                    }
                    const tidOk = !nyTid || (r.lagret != null && String(r.lagret).replace('.', ':') === String(nyTid).replace('.', ':'));
                    const flyOk = !nyFly || r.flyOk;
                    if (r.ok && tidOk && flyOk) {
                        korr.classList.add('ok');
                        korr.textContent = `✓ Korrigert${nyFly ? ' ' + nyFly : ''}${nyTid ? ' · ' + nyTid : ''}`;
                        const t = (window._grmTurer || []).find(x => String(x.reqId) === String(korr.dataset.req));
                        if (t) {
                            if (nyFly && t.gtravel) t.gtravel.buffer = Math.max(BUFFER_MIN, t.gtravel.buffer || BUFFER_MIN);
                            if (t.fly && nyFly) t.fly.flightnr = nyFly;       // meldingens flightnr nå rettet → ikke lenger avvik
                            if (t.avinor) { t.avinor.forLite = false; }
                        }
                        setTimeout(() => { if (window._grmReRender) window._grmReRender(); }, 800);
                    } else {
                        korr.classList.add('feil'); korr.disabled = false;
                        const feilDeler = [];
                        if (!tidOk) feilDeler.push(`tid står ${r.lagret || '?'}`);
                        if (!flyOk) feilDeler.push(r.flyFeltFunnet ? 'flightnr ikke skrevet' : 'fant ikke meldingsfelt');
                        korr.textContent = `⚠ Ikke fullført (${feilDeler.join(', ') || ('HTTP ' + r.status)})`;
                        loggFeil(`korriger ufullstendig: ${feilDeler.join(', ')}`);
                    }
                } catch (err) {
                    loggFeil('korriger feilet:', err.message);
                    korr.classList.add('feil'); korr.textContent = '⚠ feil — prøv igjen'; korr.disabled = false;
                }
                return;
            }
            // «Marker gått gjennom» — kun BLANKE turer er klikkbare (grønn/farget er disabled).
            const btn = e.target.closest('.grm-gatt');
            if (!btn || btn.disabled) return;
            const reqId = btn.dataset.req;
            const kort = btn.closest('.grm-kort');
            btn.disabled = true; const orig = btn.textContent; btn.textContent = '…';
            try {
                const g = await gronnhakHvisBlank(reqId);
                if (g.ok) {
                    btn.classList.remove('feil'); btn.classList.add('pa'); btn.textContent = '✓ Gått gjennom'; btn.dataset.st = String(GRONN_HAKE);
                    if (kort) kort.classList.add('gjennomgaatt');   // forblir disabled = ferdig
                } else if (g.grunn === 'annen status') {
                    btn.classList.add('feil'); btn.textContent = `⚠ ${STATUS_NAVN[g.naa] || g.naa} (NISSY) — rør ikke`; btn.dataset.st = String(g.naa);
                    loggFeil(`hopper over hake rid=${reqId}: annen status ${g.naa}`);
                } else {
                    btn.classList.add('feil'); btn.textContent = '⚠ ikke haket — ↻ og prøv igjen'; btn.disabled = false;
                    loggFeil(`hake mislyktes rid=${reqId}: ${g.grunn || ''} naa=${g.naa}`);
                }
            } catch (err) {
                loggFeil('gått gjennom feilet:', err.message); btn.textContent = orig; btn.disabled = false;
            }
        });
        return grmBody;
    }

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

    // Vises i stedet for tur-lista når admin-sesjonen er utløpt. Uten admin får vi login-siden
    // i retur, og alle turer ser ut til å mangle flightnr — derfor et tydelig, handlingsrettet varsel.
    function visAdminBanner(body) {
        body.innerHTML = `
            <div class="grm-adminbanner">
                <div class="h">⚠ Ikke innlogget i admin-modulen</div>
                <div class="b">
                    Gardermoen henter flightinfo fra admin (<code>/administrasjon/admin/</code>), men sesjonen er utløpt.
                    Uten den ser <strong>alle</strong> turer feilaktig ut til å mangle flightnummer.<br>
                    <a href="${BASE}/administrasjon/admin/" target="_blank" rel="noopener">🔑 Logg inn i admin ↗</a>
                    <span style="margin-left:8px;">deretter ↻ Oppdater.</span>
                </div>
            </div>`;
    }

    function bufferLinje(t) {
        const a = t.avinor || {};
        if (a.cancelled) return `<div class="grm-buffer cancel">🚫 Innstilt (Avinor)</div>`;
        if (!a.funnet) return `<div class="grm-buffer ukjent">Ikke funnet i Avinor — sjekk flightnr</div>`;
        if (a.ingenDato) return `<div class="grm-buffer ukjent">Avinor mangler rutetid for turdatoen ennå</div>`;
        const stat = a.landet ? 'Landet' : (a.code === 'E' ? 'Est. landing' : 'Rutetid');
        const buf = a.buffer !== null ? `buffer ${a.buffer} min` : 'taxitid ukjent';
        const kl = a.forLite ? 'darlig' : (a.buffer !== null ? 'ok' : 'ukjent');
        const ikon = a.forLite ? ' ⚠ FOR LITE TID' : (a.buffer !== null ? ' ✓' : '');
        return `<div class="grm-buffer ${kl}">${stat} ${esc(hhmm(a.landingDate))}${a.origin ? ' fra ' + esc(a.origin) : ''} · taxi ${esc(hhmm(a.taxiDate) || t.start || '?')} · ${buf}${ikon}</div>`;
    }
    // Vises på med-fly-kort når flightnr fra meldingen IKKE finnes hos Avinor (typisk tastefeil),
    // men pnr-oppslaget ga pasientens avreise → foreslå sannsynlig fly (lander før taxitid).
    function forslagLinje(t) {
        if (!t.antattFlyplass) return '';
        const navn = esc(t.fly && t.fly.flightnr);
        const taxi = esc(hhmm(t.taxiDate) || t.start || '?');
        const k = t.kandidater || [];
        if (!k.length)
            return `<div class="grm-gul">🟡 Fant ikke <strong>${navn}</strong> hos Avinor. Pasienten flyr fra <strong>${esc(t.antattFlyplass)}</strong> (flyrekv.), men ingen ankomst derfra før taxi ${taxi} — verifiser manuelt.</div>`;
        const liste = k.slice(0, 3).map((c, i) =>
            `${i === 0 ? '➡ ' : '&nbsp;&nbsp;&nbsp;'}<strong>${esc(c.flightnr)}</strong> fra ${esc(t.antattFlyplass)} lander ${esc(hhmm(c.land))} (buffer ${c.buffer} min)${c.buffer < BUFFER_MIN ? ' ⚠' : ''}`).join('<br>');
        return `<div class="grm-gul">🟡 Fant ikke <strong>${navn}</strong> hos Avinor — mulig tastefeil. Sannsynlig fly (avreise <strong>${esc(t.antattFlyplass)}</strong> fra flyrekv.):<br>${liste}<br><strong>Verifiser.</strong></div>`;
    }

    // Mobil-status på hvert kort. Mangler gyldig mobil → rødt varsel (taxisentralen når ikke pasienten).
    function mobilLinje(t) {
        return t.mobil
            ? `<div class="grm-mobil ok">📱 ${esc(fmtMobil(t.mobil))}</div>`
            : `<div class="grm-mobil mangler">📵 Mangler mobilnummer</div>`;
    }

    // === «Gått gjennom» = NISSY manuell status 2 (grønn hake), delt mellom operatører ===
    // Bekreftet syklus: 1 blank → 2 grønn hake → 3 rød hake → 4 grønn firkant → 0 rød firkant → 1.
    // VIKTIG REGEL: grønnhak KUN blanke turer. Fargede (3/4/0) er satt bevisst av noen og røres ALDRI.
    const GRONN_HAKE = 2, BLANK = 1;
    const STATUS_NAVN = { 0: 'rød firkant', 2: 'grønn hake', 3: 'rød hake', 4: 'grønn firkant' };
    // Sett manuell status til ønsket verdi STEGVIS: toggle ett hakk, les på nytt, gjenta til mål.
    // Toggle er relativ og enkelt-kall kan slippes/forsinkes server-side — stegvis re-lesing er
    // selvkorrigerende, så vi kan ALDRI lande på feil farge (tidligere blind telling ga rød hake).
    async function settManualStatusTil(reqId, mål) {
        let naa = await lesManualStatus(reqId);
        if (naa === null) { loggFeil('hake: fant ikke tur', reqId); return { ok: false, fra: null }; }
        const fra = naa; let guard = 0;
        while (naa !== mål && guard++ < 7) {
            const før = naa;
            await fetch(`${BASE}/planlegging/ajax-dispatch?update=false&action=toggleManualStatusRequisition&rid=${reqId}&t=${Date.now()}`, { credentials: 'same-origin' });
            // Vent til status FAKTISK endrer seg før neste toggle (unngå overshoot ved treg oppdatering)
            for (let p = 0; p < 4 && naa === før; p++) {
                await new Promise(r => setTimeout(r, 300));
                naa = await lesManualStatus(reqId);
            }
            logg(`hake-steg rid=${reqId}: ${før} → ${naa} (mål ${mål})`);
            if (naa === før) { loggFeil('hake: status endret seg ikke etter toggle, avbryter', reqId); break; }
        }
        return { ok: naa === mål, fra, naa };
    }
    // Les turens NÅVÆRENDE manuelle status fra dispatch. Kritisk: toggle er relativ, så feil
    // antatt startstatus → feil farge (f.eks. rød hake i stedet for grønn). Aldri stol på stale data-st.
    async function lesManualStatus(reqId) {
        try {
            const xml = new DOMParser().parseFromString(await hentISO(`${BASE}/planlegging/ajax-dispatch?did=all&action=openres&rid=-1&rfilter=${RFILTER}&t=${Date.now()}`), 'text/xml');
            let st = null;
            xml.querySelectorAll('response').forEach(resp => {
                if (resp.getAttribute('id') !== 'paagaaendeOppdrag' || st !== null) return;
                const d = document.createElement('div'); d.innerHTML = resp.textContent;
                d.querySelectorAll('tbody tr[name]').forEach(tr => {
                    if (st !== null) return;
                    const m = tr.innerHTML.match(/showReq\(this,\s*(\d+)/);
                    if (m && m[1] === String(reqId)) { const g = tr.innerHTML.match(/manualStatus(\d+)\.gif/); st = g ? parseInt(g[1], 10) : 1; }
                });
            });
            return st;
        } catch (e) { loggFeil('les status feilet:', e.message); return null; }
    }
    // Grønnhak KUN hvis turen er blank. Allerede grønn = ok (ingen endring). Farget (3/4/0) = rør ikke.
    async function gronnhakHvisBlank(reqId) {
        const naa = await lesManualStatus(reqId);
        if (naa === null) return { ok: false, grunn: 'fant ikke turen', naa: null };
        if (naa === GRONN_HAKE) return { ok: true, alleredeGroenn: true, naa };
        if (naa !== BLANK) return { ok: false, grunn: 'annen status', naa };   // rød/firkant → overskriv ikke
        return settManualStatusTil(reqId, GRONN_HAKE);   // blank → grønn (ett toggle)
    }
    // === Flytt hentetid (portet fra basic_tools.js) — DWR encrypt + departureTime POST til /confirm ===
    // Krever at rekvisisjon-modulen er innlogget (egen sesjon). Skriver til EKTE NISSY-hentetid.
    const REK_BASE = `${BASE}/rekvisisjon`;
    // NISSY er ISO-8859-1. Skjema-felter må prosent-kodes som Latin-1-bytes (ikke UTF-8 via
    // URLSearchParams), ellers korrumperes ÆØÅ i navn/adresse/kommentar ved re-POST. (Kopiert fra basic_tools.)
    function latin1Form(s) {
        let out = '';
        for (let i = 0; i < s.length; i++) {
            const c = s[i];
            if (/[A-Za-z0-9*\-._]/.test(c)) { out += c; continue; }
            if (c === ' ') { out += '+'; continue; }
            const cp = s.charCodeAt(i);
            if (cp <= 0xFF) out += '%' + cp.toString(16).toUpperCase().padStart(2, '0');
            else out += encodeURIComponent(c);
        }
        return out;
    }
    function hhmm24(d) { return d ? String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') : ''; }
    async function dwrEncrypt(reqId) {
        const body = ['callCount=1', 'windowName=', 'c0-scriptName=Requisition', 'c0-methodName=encrypt', 'c0-id=0',
            `c0-param0=string:${reqId}`, 'batchId=1', 'instanceId=0', 'page=/rekvisisjon/', 'httpSessionId=', 'scriptSessionId='].join('\n');
        const res = await fetch(`${REK_BASE}/dwr/call/plaincall/Requisition.encrypt.dwr`, {
            method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, credentials: 'include' });
        const text = await res.text();
        const m = text.match(/handleCallback\([^,]+,[^,]+,"([^"]+)"\)/);
        if (!m) throw new Error('encrypt-respons uforståelig');
        return m[1];
    }
    // (v0.44) Gammel confirm/M-flyt (endreHentetid) fjernet — erstattet av endreHentetidR (altRequisition).
    //         Confirm redigerte kun klar-fra og ble avvist av NISSY-validering (klar≤oppmøte). Se memory.

    // === Flytt hentetid via altRequisition (R-flyten) — endrer BÅDE oppmøte + klar-fra ===
    // /confirm (M) redigerer kun klar-fra, og NISSY avviser klar-fra > oppmøte («Tidspunktet er
    // senere enn oppmøtetidspunktet») → tiden lagres ikke. R/altRequisition har begge feltene; vi
    // setter begge til ny tid (like → validering passerer). Fasit-POST fanget 2026-06-05.
    //   1) last turen: GET /requisition/edit?id=<enc reqId>&noSerial=true&ns=true → altReq-editor m/ data_id
    //   2) FormData(mainForm) → overstyr KUN treatmentTimePart + pickupTime (alt annet ekkes uendret)
    //   3) POST /requisition/altRequisition?clear=false
    async function endreHentetidR(reqId, nyTid, korr) {
        // korr (valgfri): { nyFly, land, gmlFly } → rett også flightnr i «Melding til transportør».
        const userid = window.__vkt_brukernavn || grmNissy();
        if (!userid) return { ok: false, feil: 'fant ikke brukernavn' };
        const enc = await dwrEncrypt(reqId);
        const editUrl = `${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc)}&userid=${encodeURIComponent(userid)}&ns=true`;
        const buf = await fetch(editUrl, { credentials: 'include' }).then(r => r.arrayBuffer());
        const doc = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf), 'text/html');
        if (doc.querySelector('[name="j_username"], [name="j_password"], input[type="password"]')) return { ok: false, utlogget: true };
        const form = doc.querySelector('#mainForm') || doc.querySelector('form[name="mainForm"]');
        const opp = form && form.querySelector('[name="treatmentTimePart"]');
        const klar = form && form.querySelector('[name="pickupTime"]');
        if (!form || !opp || !klar) return { ok: false, feil: 'fant ikke altRequisition-skjema (uventet side)' };

        const fd = new FormData(form);

        // (v0.47) KRITISK: altRequisition laster UTM-posisjon som 0 — den fylles først av GUI-ets
        // validateAddress-ajax. POSTer vi med 0, NULLSTILLES hentested/leveringssted-posisjon og
        // helseforetak avledes feil (bekreftet korrupsjon i v0.44). Derfor henter vi UTM for fra+til
        // via /ajax/validateAddress (samme kall GUI gjør), setter dem i skjemaet, FØR lagring.
        const lesAdr = pfx => ({
            streetName: fd.get(pfx + '.streetName') || '', houseNr: fd.get(pfx + '.houseNr') || '',
            houseSubNr: fd.get(pfx + '.houseSubNr') || '', apartmentNr: fd.get(pfx + '.apartmentNr') || '',
            postCode: fd.get(pfx + '.postCode') || '', city: fd.get(pfx + '.city') || '',
            cadastralUnitNumber: fd.get(pfx + '.cadastralUnitNumber') || '', propertyUnitNumber: fd.get(pfx + '.propertyUnitNumber') || ''
        });
        const validerAdr = async adr => {
            try {
                const r = await fetch(`${REK_BASE}/ajax/validateAddress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' },
                    body: new URLSearchParams(adr).toString(), credentials: 'include'
                });
                const j = await r.json();
                return (j && String(j.valid) === 'true' && j.address) ? j.address : null;
            } catch (e) { return null; }
        };
        const fromA = await validerAdr(lesAdr('trip.fromAddress'));
        const toA = await validerAdr(lesAdr('trip.toAddress'));
        if (!fromA || !toA || !(parseFloat(fromA.utmCoordinateX) > 0) || !(parseFloat(toA.utmCoordinateX) > 0)) {
            return { ok: false, feil: 'avbrutt: fikk ikke gyldig posisjon fra validateAddress — lagrer ikke (ville nullstilt hentested/leveringssted)' };
        }
        const settUtm = (pfx, a) => {
            fd.set(pfx + '.utmCoordinate.x', a.utmCoordinateX);
            fd.set(pfx + '.utmCoordinate.y', a.utmCoordinateY);
            fd.set(pfx + '.utmCoordinate.z', a.utmCoordinateZ);
            fd.set(pfx + '.utmCoordinate.zone', a.utmCoordinateZone);
        };
        settUtm('trip.fromAddress', fromA);
        settUtm('trip.toAddress', toA);

        // Klar-fra = landing+20 (alltid). Oppmøte løftes KUN hvis ny klar-fra ville bli senere enn
        // oppmøte (NISSY krever klar ≤ oppmøte). Ellers står oppmøte urørt — bevarer avtale + reisetid.
        const sortbar = (dato, tid) => {
            const d = String(dato || '').match(/(\d{1,2})[.\-](\d{1,2})[.\-](\d{2,4})/);
            const t = String(tid || '').match(/(\d{1,2})[:.](\d{2})/);
            if (!d || !t) return null;
            const yy = d[3].length === 4 ? d[3].slice(-2) : d[3];
            return yy.padStart(2, '0') + d[2].padStart(2, '0') + d[1].padStart(2, '0') + t[1].padStart(2, '0') + t[2];
        };
        fd.set('submit_action', '');                  // tom = «Lagre» (generate)
        fd.set('submitflag', 'true');
        const endringer = [];
        if (nyTid) {
            const nyKlar = sortbar(fd.get('pickupDate'), nyTid);
            const naaOpp = sortbar(fd.get('treatmentDatePart'), fd.get('treatmentTimePart'));
            fd.set('pickupTime', nyTid);
            if (nyKlar && naaOpp && nyKlar > naaOpp) {   // ny klar-fra ville passere oppmøte → løft oppmøte til samme
                fd.set('treatmentTimePart', nyTid);
                fd.set('treatmentDatePart', fd.get('pickupDate'));
            }
            fd.set('manuallyEditedRows', 'pickupTime');   // hindrer server-rekalkulering av klar-fra
            endringer.push(`tid → ${nyTid}`);
        }

        // (valgfri) Rett flightnr i «Melding til transportør». Defensivt: setter KUN feltet som faktisk
        // finnes i skjemaet (ellers ekkes det uendret = ingen korrupsjon). Erstatter den feil-tolkede
        // flight-strengen (tål mellomrom/punktum: «dy 1305»), ellers legger til en rettelse til slutt.
        let msgFelt = null;
        if (korr && korr.nyFly) {
            msgFelt = form.querySelector('[name="transporterMessage"]') ? 'transporterMessage'
                    : form.querySelector('[name="trip.transporterMessage"]') ? 'trip.transporterMessage' : null;
            if (msgFelt) {
                let msg = (fd.get(msgFelt) || '').toString();
                const rettTekst = `${korr.nyFly}${korr.land ? ' kl ' + korr.land : ''}`;
                let erstattet = false;
                if (korr.gmlFly) {
                    const kode = korr.gmlFly.replace(/\d+$/, '');
                    const nr = (korr.gmlFly.match(/\d+$/) || [''])[0];
                    if (kode && nr) {
                        const re = new RegExp(kode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s.\\-]{0,3}' + nr, 'i');
                        if (re.test(msg)) { msg = msg.replace(re, korr.nyFly); erstattet = true; }
                    }
                }
                if (!erstattet) msg = (msg ? msg.trim() + ' ' : '') + `(Rettet flightnr: ${rettTekst})`;
                fd.set(msgFelt, msg.slice(0, 500));
                endringer.push(`flightnr → ${korr.nyFly}`);
            }
        }

        // Notat i «Annen merknad til pasientreiser» (trip.comment — intern, ikke til transportør).
        // Dedup: fjern et evt. tidligere gardermoen-notat så gjentatte endringer oppdaterer i stedet for å hope seg opp.
        const sig = grmSignatur();
        const notat = `Gardermoen: ${endringer.join(', ') || 'ingen endring'}.${sig && sig !== 'Ukjent' ? ' ' + sig : ''}`;
        let eksMerk = (fd.get('trip.comment') || '').trim()
            .replace(/Endret tid til \d{1,2}[:.]\d{2} pga\. \d+ min buffer\.[^|]*/gi, '')
            .replace(/Gardermoen: [^|]*/gi, '')
            .replace(/(^\s*\|\s*)|(\s*\|\s*$)/g, '').trim();
        fd.set('trip.comment', (eksMerk ? eksMerk + ' | ' + notat : notat).slice(0, 255));

        const postUrl = `${REK_BASE}/requisition/altRequisition?clear=false`;
        const body = [...fd].map(([k, v]) => latin1Form(k) + '=' + latin1Form(String(v))).join('&');
        const res = await fetch(postUrl, { method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1' },
            body, credentials: 'include' });

        // Verifiser: last turen på nytt og les pickupTime (klar-fra) + ev. meldingsfeltet.
        let lagret = null, msgLagret = null;
        try {
            const enc2 = await dwrEncrypt(reqId);
            const buf2 = await fetch(`${REK_BASE}/requisition/edit?loggedin=true&noSerial=true&id=${encodeURIComponent(enc2)}&userid=${encodeURIComponent(userid)}&ns=true`, { credentials: 'include' }).then(r => r.arrayBuffer());
            const doc2 = new DOMParser().parseFromString(new TextDecoder('iso-8859-1').decode(buf2), 'text/html');
            const p2 = doc2.querySelector('[name="pickupTime"]');
            if (p2) lagret = p2.getAttribute('value') || p2.value || '';
            if (msgFelt) { const m2 = doc2.querySelector(`[name="${msgFelt}"]`); if (m2) msgLagret = (m2.value || m2.textContent || ''); }
        } catch (e) { /* verifisering feilet */ }
        // flightnr regnes lagret hvis det nye flightnummeret nå finnes i meldingen
        const flyOk = !(korr && korr.nyFly && msgFelt) || (msgLagret != null && msgLagret.toUpperCase().includes(korr.nyFly.toUpperCase()));
        return { ok: res.ok, status: res.status, lagret, forventet: nyTid, flyForventet: korr && korr.nyFly || '', flyFeltFunnet: !!msgFelt, flyOk };
    }

    // Knapp: flytt hentetid til faktisk/estimert landing + 20 min. Kun når vi har en landingstid.
    function flyttTidKnapp(t) {
        const a = t.avinor || {};
        if (!a.landingDate) return '';                          // ingen landingstid å justere mot
        // ALDRI forkorte: kun tilby flytting når bufferen er UNDER minimum (taxi for tidlig / fly forsinket).
        // Har turen allerede ≥20 min — eller bevisst lengre ventetid — lar vi tiden stå urørt.
        if (a.buffer == null || a.buffer >= BUFFER_MIN) return '';
        const mål = hhmm24(new Date(a.landingDate.getTime() + BUFFER_MIN * 60000));   // landing + 20 = senere enn nå
        const naa = hhmm24(a.taxiDate) || ((t.start || '').match(/(\d{1,2}[:.]\d{2})/) || [])[1] || '';
        // (v0.37) Tildelt-blokken fjernet: basic_tools endrer tid på samme /confirm-endepunkt og funker
        // også på tildelte — den tidligere feilen var korrupt Latin-1-koding, nå fikset. Verifiser at
        // taxien følger med på en tildelt tur før vi stoler fullt på det.
        return `<button class="grm-tid" data-req="${esc(t.reqId)}" data-st="${t.manualStatus || 1}" data-ny="${esc(mål)}" data-gml="${esc(naa)}">🕐 Flytt hentetid → ${esc(mål)} (buffer 20 min)</button>`;
    }
    // Knapp på hvert kort. KUN blanke turer kan grønnhakes. Allerede grønn = vist som ferdig.
    // Farget (rød hake / firkanter) = deaktivert + viser NISSY-statusen; røres ikke (kan bety noe).
    // «Marker gått gjennom» (blank → grønn) er gated til superadmin i testfase — andre ser ingen knapp.
    // Status-badger (grønn/rød/firkant) vises for alle siden de er informative, ikke handlingsknapper.
    function gattGjennomLinje(t) {
        const s = t.manualStatus || BLANK;
        const erSuper = window.__vkt_rolle === 'superadmin';
        let knapp = '';
        if (s === GRONN_HAKE) {
            knapp = `<button class="grm-gatt pa" data-req="${esc(t.reqId)}" data-st="2" disabled>✓ Gått gjennom</button>`;
        } else if (s === BLANK) {
            if (erSuper) {
                knapp = `<button class="grm-gatt" data-req="${esc(t.reqId)}" data-st="1">✓ Marker gått gjennom</button>`;
            }
            // ikke-superadmin: ingen knapp på blank tur (testfase)
        } else {
            knapp = `<button class="grm-gatt feil" data-req="${esc(t.reqId)}" data-st="${s}" disabled title="Manuell status satt i NISSY — endre der, ikke her">⚠ ${esc(STATUS_NAVN[s] || ('status ' + s))} (NISSY)</button>`;
        }
        // g-travel bekreftet → korriger-knappen overstyrer den vanlige flytt-tid-knappen (samme tid, men retter også flightnr).
        const korr = korrigerKnapp(t);
        const flytt = korr ? '' : flyttTidKnapp(t);
        if (!knapp && !flytt && !korr) return '';
        return `<div class="grm-rad2">${knapp}${flytt}${korr}</div>`;
    }

    // === g-travel-redning: hent flightnr fra g-travel via relé når NISSY-meldingen mangler/feiler ==
    // gardermoen sender Rekvisisjonsnr (vår ref) eller Bestillingsref til relé-et; g-travel-agenten
    // (egen gto-fane) svarer med OSL-landingen. Frakter kun ref + flightnr/tid — ingen pasientdata.
    const GT_RELAY = 'https://thomaswestby.no/pasientreiser/gtravel_relay.php';
    const GT_NOKKEL = 'grm-gtravel-2026';
    async function gtRele(handling, ekstra) {
        try {
            const r = await fetch(GT_RELAY, { method: 'POST', headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(Object.assign({ handling, nokkel: GT_NOKKEL }, ekstra || {})) });
            return await r.json();
        } catch (e) { return null; }
    }
    const gtNokkel = t => t.flyReknr || t.reknr || t.gref || '';   // fly-rekvisisjonens reknr foretrekkes (matcher g-travel-bookingen); ellers taxi-reknr/gref
    function gtLinje(t) {
        const g = t.gtravel;
        if (!g) return '';
        if (g.ingenAgent) return `<div class="grm-gt"><span class="h">🔵 g-travel: åpne g-travel-fanen + kjør agent-bookmarkleten for å hente flightnr.</span></div>`;
        if (!g.funnet) return '';
        const land = g.landing ? ((String(g.landing).match(/T(\d{2}:\d{2})/) || [])[1] || '') : '';
        return `<div class="grm-gt">🔵 <strong>g-travel:</strong> ${esc(g.flightnr)}${g.fra ? ' fra ' + esc(g.fra) : ''}${land ? ' — lander ' + esc(land) : ''} <span class="h">(planlagt — bekreft i NISSY)</span></div>`;
    }

    // g-travel har gitt et BEKREFTET fly med landingstid → da er g-travel fasiten på kortet.
    const gtBekreftet = t => !!(t.gtravel && t.gtravel.funnet && t.gtravel.landingDate);
    const avinorSok = nr => `https://www.avinor.no/flyplass/oslo/flytider/?search=${encodeURIComponent(nr)}&statusScope=arrival`;
    // Meldingens flightnr avviker fra g-travels (typisk operatør-tastefeil, f.eks. DY1305 vs DY311).
    const gtFlyAvviker = t => gtBekreftet(t) && t.fly && t.fly.flightnr && t.fly.flightnr.toUpperCase() !== t.gtravel.flightnr.toUpperCase();

    // Buffer-linje basert på g-travels landingstid (overstyrer Avinor-buffer når g-travel har svart).
    function gtBufferLinje(t) {
        const g = t.gtravel;
        if (!gtBekreftet(t)) return '';
        const buf = g.buffer;
        const forLite = buf != null && buf < BUFFER_MIN;
        const bufTxt = buf == null ? 'taxitid ukjent'
            : buf < 0 ? `taxi ${Math.abs(buf)} min FØR landing` : `buffer ${buf} min`;
        const ikon = buf == null ? '' : (forLite ? ' ⚠ FEIL HENTETID' : ' ✓');
        return `<div class="grm-buffer ${forLite ? 'darlig' : 'ok'}">🔵 g-travel <strong>${esc(g.flightnr)}</strong> lander ${esc(hhmm(g.landingDate))}${g.fra ? ' fra ' + esc(g.fra) : ''} · taxi ${esc(hhmm(t.taxiDate) || t.start || '?')} · ${bufTxt}${ikon} <span class="h">(planlagt)</span></div>`;
    }

    // Korriger-knapp: retter flightnr (i melding til transportør) OG/ELLER hentetid (→ landing+20) i NISSY,
    // basert på g-travels fasit. Vises kun når noe FAKTISK er feil. Ett trykk → bekreftelse → altReq-POST.
    function korrigerKnapp(t) {
        if (!gtBekreftet(t)) return '';
        const g = t.gtravel;
        const mål = hhmm24(new Date(g.landingDate.getTime() + BUFFER_MIN * 60000));
        const trengerTid = g.buffer == null || g.buffer < BUFFER_MIN;       // hentetid for tidlig?
        const trengerFly = gtFlyAvviker(t);                                 // feil flightnr i melding?
        if (!trengerTid && !trengerFly) return '';
        const deler = [];
        if (trengerFly) deler.push(`flightnr → ${g.flightnr}`);
        if (trengerTid) deler.push(`hentetid → ${mål}`);
        const gml = (t.fly && t.fly.flightnr) || '';
        return `<button class="grm-korr" data-req="${esc(t.reqId)}" data-st="${t.manualStatus || 1}" data-ny="${esc(trengerTid ? mål : '')}" data-fly="${esc(trengerFly ? g.flightnr : '')}" data-land="${esc(hhmm(g.landingDate))}" data-gmlfly="${esc(gml)}">✏ Korriger ${deler.join(' + ')}</button>`;
    }
    // Slå opp flightnr for turer som mangler det (eller ikke finnes hos Avinor) via g-travel-relé.
    async function gtSjekk(turer) {
        // Kandidat = ingen BEKREFTET Avinor-landing: mangler flightnr, feil-parset (funnet=false),
        // eller Avinor har ingen rutetid for datoen (ingenDato). Da kan g-travel gi riktig fly.
        const harLanding = t => t.avinor && t.avinor.funnet && t.avinor.landingDate && !t.avinor.ingenDato;
        const kand = turer.filter(t => !harLanding(t) && !t.tog && !t.flybestilling && gtNokkel(t) && !t.gtravel);
        if (!kand.length) return;
        const refs = [...new Set(kand.map(gtNokkel))];
        let r = await gtRele('be', { refs });
        if (!r || !r.ok) return;
        if (!r.agentOnline) { kand.forEach(t => { if (!t.gtravel) t.gtravel = { ingenAgent: true }; }); if (window._grmReRender) window._grmReRender(); logg('g-travel: ingen agent online'); return; }
        for (let i = 0; i < 30; i++) {   // ~90s: gto-fanen er ofte strupet i bakgrunn → agenten kan bruke ~50s
            let endret = false, alleFerdig = true;
            for (const t of kand) {
                const sv = r.svar && r.svar[gtNokkel(t)];
                if (!sv || sv.status !== 'ferdig') { alleFerdig = false; continue; }
                if (!t.gtravel || t.gtravel.ingenAgent) {
                    const d = sv.data || {};
                    const o = d.oslLanding;
                    if (o) {
                        const ld = o.landing ? new Date(o.landing) : null;
                        const buf = (ld && t.taxiDate) ? Math.round((t.taxiDate - ld) / 60000) : null;
                        t.gtravel = { funnet: true, flightnr: o.flightNr, landing: o.landing, fra: o.fra, landingDate: ld, buffer: buf };
                    } else { t.gtravel = { funnet: false }; }
                    endret = true;
                }
            }
            if (endret && window._grmReRender) window._grmReRender();
            if (alleFerdig) break;
            await new Promise(res => setTimeout(res, 3000));
            r = await gtRele('be', { refs });
            if (!r || !r.ok) break;
        }
    }

    // === Avvik: feil avtale (postnr-styrt) ===
    // OSL-avtalen (1.90.1) tildeles etter postnr 2060. Flyplassen = Edvard Munchs veg 1, 2060.
    // En LOKAL 2060-adresse (f.eks. Paradevegen 2) som havner her skal egentlig på lokal avtale
    // (1.31.1 vanlig / 1.41.2 rullestolbil). Flagg det — operatøren sjekker/flytter avtale.
    function erFlyplass(t) {
        const s = ((t.hentNavn || '') + ' ' + (t.hentAdr || '')).toLowerCase();
        return /lufthavn|ankomst|edvard\s*munchs/.test(s);
    }
    const harHentested = t => !!(t.hentAdr || t.hentNavn);
    const paaLokalAvtale = t => /^1\.(31|41)\./.test(t.vognlop || '');   // 1.31.1 lokal / 1.41.2 rullestol
    // Ikke flyplass-henting + IKKE lokal/rullestol-avtale → trolig feil avtale (ligger på OSL, skal lokal).
    const feilAvtale = t => harHentested(t) && !erFlyplass(t) && !paaLokalAvtale(t);
    // På lokal/rullestol-avtale (vognløp 1.31.x eks OSL / 1.41.x RB) = korrekt plassert lokal tur,
    // ikke en flyhenting → forventer ikke flightnr. Baseres på vognløp alene (pålitelig fanget).
    const lokalKorrekt = t => paaLokalAvtale(t);
    function avtaleAvvikLinje(t) {
        if (!feilAvtale(t)) return '';
        return `<div class="grm-avtale">⚠ <strong>Feil avtale?</strong> Hentested «${esc(t.hentAdr || t.hentNavn)}${t.hentPost ? ', ' + esc(t.hentPost) : ''}» er ikke flyplassen — skal trolig på lokal avtale (1.31.1 / 1.41.2 rullestolbil), ikke OSL.</div>`;
    }
    // Tavle-tidskolonne: HH:MM over DD.MM (mono), som på Avinor-tavla.
    function tidCol(t) {
        const tid = hhmm(t.taxiDate) || ((t.start || '').match(/(\d{1,2}[:.]\d{2})/) || [])[1] || '?';
        return `<div class="grm-tidcol">${esc(tid)}<div class="d">${esc(ddmm(t.taxiDate))}</div></div>`;
    }
    function navnCol(t) {
        return `<div class="grm-navnwrap"><div class="grm-navn">${esc(t.navn || '(ukjent)')}</div><div class="grm-meta">${esc(t.turId ? 'Reisenr ' + t.turId : '')}</div></div>`;
    }
    function render(body, medFly, utenFly) {
        // Render-funksjoner for hver tur-type. Kort-farge følger Pri-nivå:
        // Pri 1 rød («problem»): innstilt fly, mangler mobil. Pri 2 gul («gul»): for lite tid, ikke funnet hos Avinor.
        // (uten flightnr håndteres i renderUten — alltid rødt).
        const renderMed = (t) => {
            const a = t.avinor || {};
            const gtOk = gtBekreftet(t);
            const niv = gtOk
                ? ((t.gtravel.buffer != null && t.gtravel.buffer < BUFFER_MIN) || !t.mobil ? 'problem' : 'fly')
                : (a.cancelled || !t.mobil) ? 'problem'
                : (a.forLite || !a.funnet || a.ingenDato || a.buffer == null) ? 'gul' : 'fly';
            const antatt = (t.fly.gjettet || t.flyFraPnr || t.antattFlyplass) ? ' antatt' : '';
            // Når g-travel har bekreftet flyet er DET fasiten: vis g-travel-flightnr som hovedchip,
            // og marker meldingens (feil) flightnr som rettet. Ellers vanlig meldings-/Avinor-chip.
            const flyChip = gtOk
                ? `<a class="grm-fly" href="${avinorSok(t.gtravel.flightnr)}" target="_blank" rel="noopener">✈ ${esc(t.gtravel.flightnr)} (g-travel) — Avinor ↗</a>${gtFlyAvviker(t) ? `<div class="grm-feilfly">Meldingen sa <s>${esc(t.fly.flightnr)}</s> — feil flightnr</div>` : ''}`
                : `<a class="grm-fly${antatt}" href="${esc(t.fly.avinorUrl)}" target="_blank" rel="noopener">✈ ${esc(t.fly.flightnr)}${t.fly.gjettet ? ' (antatt)' : ''}${t.flyFraPnr ? ' (fra flyrekv.)' : ''} — Avinor ↗</a>`;
            return `
            <div class="grm-kort ${niv}${t.manualStatus === GRONN_HAKE ? ' gjennomgaatt' : ''}">
                <div class="grm-rad1">${tidCol(t)}${navnCol(t)}<span class="grm-admin" role="button" tabindex="0" data-resid="${esc(t.resId)}" data-reqid="${esc(t.reqId)}" title="Vis turen i planleggingen (blåmerk raden)">${ICON.arrowR('#0a1426', 15)}</span></div>
                ${flyChip}
                ${gtOk ? gtBufferLinje(t) : (t.antattFlyplass ? '' : bufferLinje(t))}
                ${avtaleAvvikLinje(t)}
                ${gtOk ? '' : `${forslagLinje(t)}${gtLinje(t)}`}
                ${t.melding ? `<div class="grm-melding">${esc(t.melding)}</div>` : ''}
                <div class="grm-tags">${mobilLinje(t)}</div>
                ${gattGjennomLinje(t)}
            </div>`;
        };
        const renderUten = (t) => {
            const fg = postnrTilFlyplass(t.postnr);
            console.log('[GRM utenFly]', t.navn, '| RFLY-avreise=', t.antattFlyplass || '(ingen)', '| postnr=', t.postnr || '(ingen)', '| kandidater=', (t.kandidater || []).length);
            let gjett = '', harGjett = false;
            if (t.antattFlyplass) {
                harGjett = true;
                const k = t.kandidater || [];
                const kandHtml = k.length
                    ? `<br>Sannsynlig fly (lander før taxi ${esc(hhmm(t.taxiDate) || t.start || '?')}):<br>` +
                      k.slice(0, 3).map((c, i) => `${i === 0 ? '➡ ' : '&nbsp;&nbsp;&nbsp;'}<strong>${esc(c.flightnr)}</strong> lander ${esc(hhmm(c.land))} (buffer ${c.buffer} min)${c.buffer < BUFFER_MIN ? ' ⚠' : ''}`).join('<br>')
                    : `<br><em>Ingen Avinor-ankomst fra ${esc(t.antattFlyplass)} før taxitid — verifiser manuelt.</em>`;
                gjett = `<div class="grm-gul">🟡 Avreise <strong>${esc(t.antattFlyplass)}</strong> (fra pasientens flyrekvisisjon). Ikke bekreftet flightnr.${kandHtml} <strong>Verifiser.</strong></div>`;
            } else if (fg) {
                harGjett = true;
                gjett = `<div class="grm-gul">🟡 Antatt fra <strong>${esc(fg.navn)} (${fg.iata})</strong> — basert på pasientens postnr ${esc(t.postnr)}. <strong>Verifiser.</strong></div>`;
            }
            const erLokal = lokalKorrekt(t);
            const erNoytral = erLokal || t.tog || t.flybestilling;
            const noytralTekst = t.tog
                ? `🚆 Tog${t.tog.linje ? ' <strong>' + esc(t.tog.linje) + '</strong>' : ''}${t.tog.eta ? ' — ankommer ' + esc(t.tog.eta) : ''} — ikke fly, ikke et avvik.`
                : t.flybestilling
                    ? '✈ Flybestilling (g-travel-avtale) — ikke en taxihenting.'
                    : '🚕 Lokal tur (ikke flyplass-henting) — ikke et flyavvik.';
            return `
            <div class="grm-kort ${erNoytral ? 'lokal' : 'problem'}${t.manualStatus === GRONN_HAKE ? ' gjennomgaatt' : ''}">
                <div class="grm-rad1">${tidCol(t)}${navnCol(t)}<span class="grm-admin" role="button" tabindex="0" data-resid="${esc(t.resId)}" data-reqid="${esc(t.reqId)}" title="Vis turen i planleggingen (blåmerk raden)">${ICON.arrowR('#0a1426', 15)}</span></div>
                ${erNoytral
                    ? `<div class="grm-lokal">${noytralTekst}</div>${t.melding ? `<div class="grm-melding" style="opacity:.8;margin-top:6px;">${esc(t.melding)}</div>` : ''}`
                    : `${t.melding ? `<div class="grm-melding">${esc(t.melding)}</div>` : '<div class="grm-melding" style="opacity:.7;">(ingen melding til transportør)</div>'}
                ${gtBekreftet(t) ? '' : gjett}
                ${avtaleAvvikLinje(t)}
                ${gtBekreftet(t) ? gtBufferLinje(t) : gtLinje(t)}`}
                <div class="grm-tags">${mobilLinje(t)}</div>
                ${gattGjennomLinje(t)}
            </div>`;
        };
        // 2-nivå avvik. Pri 1 (rødt): uten flightnr, mangler mobil, innstilt — kritisk, krever umiddelbar handling.
        // Pri 2 (gult): for lite tid, ikke funnet hos Avinor — trenger verifisering.
        // Innen samme pri-nivå brukes finsorteringen sub (lavere=først): uten flightnr → innstilt → mangler mobil; for lite tid → ikke funnet.
        const klassifiser = (t, harFly) => {
            const a = t.avinor || {};
            if (t.tog) return { erAvvik: false, pri: 9, sub: 0, tog: true };               // tog, ikke fly
            if (t.flybestilling) return { erAvvik: false, pri: 9, sub: 0, flybestilling: true }; // g-travel flybestilling, ikke taxi
            // Ikke en flyplass-henting? (hentested finnes og er ikke flyplassen)
            if (lokalKorrekt(t)) return { erAvvik: false, pri: 9, sub: 0, lokal: true };   // lokal tur, korrekt avtale → ikke flyavvik
            if (feilAvtale(t)) return { erAvvik: true, pri: 1, sub: 0, feilAvtale: true };  // ligger på OSL, skal lokal
            // g-travel har bekreftet flyet → fasit. For lite buffer (feil hentetid) = rødt avvik; ellers OK.
            if (gtBekreftet(t)) {
                if (t.gtravel.buffer != null && t.gtravel.buffer < BUFFER_MIN) return { erAvvik: true, pri: 1, sub: 0, gtFeilTid: true };
                if (!t.mobil) return { erAvvik: true, pri: 1, sub: 2 };
                return { erAvvik: false, pri: 9, sub: 0, gtOk: true };
            }
            if (!harFly) return { erAvvik: true, pri: 1, sub: 0 };          // uten flightnr fra melding
            if (a.cancelled) return { erAvvik: true, pri: 1, sub: 1 };      // fly innstilt
            if (!t.mobil) return { erAvvik: true, pri: 1, sub: 2 };         // taxisentralen når ikke pasienten
            if (a.forLite) return { erAvvik: true, pri: 2, sub: 0 };        // taxi rekker ikke landing+20
            if (!a.funnet || a.ingenDato) return { erAvvik: true, pri: 2, sub: 1 }; // Avinor mangler turen
            return { erAvvik: false, pri: 9, sub: 0 };
        };
        const alle = [
            ...medFly.map(t => ({ t, render: renderMed, klass: klassifiser(t, true) })),
            ...utenFly.map(t => ({ t, render: renderUten, klass: klassifiser(t, false) }))
        ];
        // Sortering: rød pri 1 først, så gul pri 2; innen pri-nivå etter sub-kategori, deretter taxitid.
        const cmpTid = (a, b) => (a.t.taxiDate || 0) - (b.t.taxiDate || 0);
        const avvik = alle.filter(x => x.klass.erAvvik).sort((a, b) =>
            a.klass.pri - b.klass.pri || a.klass.sub - b.klass.sub || cmpTid(a, b));
        const ok = alle.filter(x => !x.klass.erAvvik).sort(cmpTid);
        const avvikKort = avvik.map(x => x.render(x.t)).join('') || `<div class="grm-tom">— Ingen avvik 🎉 —</div>`;
        const okKort = ok.map(x => x.render(x.t)).join('') || `<div class="grm-tom">— Ingen turer uten avvik —</div>`;

        body.innerHTML = `
            <div class="grm-sec">
                <div class="grm-badge o">${ICON.warn('#0a1426', 16)}</div>
                <div class="t"><div class="no">Med avvik</div><div class="en">With issues</div></div>
                <div class="cnt">${String(avvik.length).padStart(2, '0')}</div>
            </div>
            ${avvikKort}
            <div class="grm-sec">
                <div class="grm-badge y">${ICON.plane('#0a1426', 16)}</div>
                <div class="t"><div class="no">Uten avvik</div><div class="en">No issues</div></div>
                <div class="cnt">${String(ok.length).padStart(2, '0')}</div>
            </div>
            ${okKort}`;

        // Teller i klokke-stripa + footer-callout. Labler «OK» / «Avvik» er satt i statisk HTML.
        const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setTxt('grm-cnt-fly', ok.length);
        setTxt('grm-cnt-mangler', avvik.length);
        const footer = document.getElementById('grm-footer');
        if (footer) {
            const n = avvik.length;
            footer.innerHTML =
                (n > 0 ? `<div class="grm-callout-wrap"><div class="grm-callout">
                    <div class="cc">${ICON.arrowU('#0a1426', 18)}</div>
                    <div><div class="lab">Estimert behandlingstid</div><div class="big">${n} ${n === 1 ? 'tur trenger' : 'turer trenger'} oppfølging</div></div>
                    <div class="lt">&lt; 10 min →</div>
                </div></div>` : '')
                + `<div class="grm-departures"><span>Avgang</span><span class="mono">OSL · ENGM</span><span>Departures</span></div>`;
        }
    }

    async function kjor() {
        const body = document.getElementById('grm-body') || panel();
        body.innerHTML = `<div class="grm-status">Laster Gardermoen-turer …</div>`;
        const shim = document.getElementById('grm-shim'); if (shim) shim.classList.add('on');
        const ftr = document.getElementById('grm-footer'); if (ftr) ftr.innerHTML = '';
        ['grm-cnt-fly', 'grm-cnt-mangler'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '–'; });
        try {
            // Pre-flight: er admin-sesjonen utløpt får vi login-siden i retur for hver tur, og
            // alt ser feilaktig ut til å mangle flightnr. Vis banner i stedet for 26 falske kort.
            if (await adminInnlogget() === false) { visAdminBanner(body); return; }
            const turer = await hentTurer();
            if (!turer.length) { body.innerHTML = `<div class="grm-tom">Ingen Gardermoen-turer i morgen eller framover i filteret.</div>`; return; }
            const medFly = [], utenFly = [];
            for (let i = 0; i < turer.length; i++) {
                body.querySelector('.grm-status') && (body.querySelector('.grm-status').textContent = `Sjekker tur ${i + 1} av ${turer.length} …`);
                const t = turer[i];
                try {
                    const { melding, turId, postnr, pnr, mobil, navn: navnAdmin, gref, reknr, hentNavn, hentAdr, hentPost, reisemaate } = await hentMelding(t.reqId, t.resId);
                    t.melding = melding; t.turId = turId; t.postnr = postnr; t.pnr = pnr; t.mobil = mobil; t.gref = gref; t.reknr = reknr;
                    t.hentNavn = hentNavn; t.hentAdr = hentAdr; t.hentPost = hentPost; t.reisemaate = reisemaate;
                    // Navn fra Navn-kolonnen i NISSY-tabellen kan være tomt hvis operatøren har skjult kolonnen
                    // — bruk da admin-pasientnavnet som fallback.
                    if (!t.navn && navnAdmin) t.navn = navnAdmin;
                    const tog = byggTogInfo(melding);
                    if (tog) { t.tog = tog; utenFly.push(t); continue; }    // tog → ikke fly, ikke avvik
                    const fly = byggFlyInfo(melding);
                    if (fly) { t.fly = fly; medFly.push(t); } else { utenFly.push(t); }
                } catch (e) { t.melding = '(feil ved henting av admin)'; utenFly.push(t); }
            }
            // Tom/uten flightnr i egen melding → slå opp pasientens andre rekvisisjoner (pnr).
            // Flyreisen ligger ofte i en separat RFLY-rekvisisjon (samme pnr).
            for (let k = utenFly.length - 1; k >= 0; k--) {
                const t = utenFly[k];
                if (!t.pnr || t.tog || t.flybestilling) continue;
                const sEl = body.querySelector('.grm-status'); if (sEl) sEl.textContent = `Slår opp avreise for ${t.navn} …`;
                const r = await finnFlyViaPnr(t.pnr);
                if (!r) continue;
                if (r.flyReknr) t.flyReknr = r.flyReknr;                 // fly-rekvisisjonens reknr → g-travel-nøkkel
                if (r.kunOrigin) { t.antattFlyplass = r.fraIata; }      // kjenner avreise, ikke flynr → kandidat-match mot Avinor
                else if (r.flightnr) { t.fly = r; t.flyFraPnr = true; utenFly.splice(k, 1); medFly.push(t); }
            }
            // Avinor: brukes både til buffer (med flynr) OG til å matche kandidatfly (kjent avreise + taxitid)
            if (medFly.length || utenFly.some(t => t.antattFlyplass)) {
                const stEl = body.querySelector('.grm-status');
                if (stEl) stEl.textContent = 'Henter Avinor-landingstider …';
                const flights = await hentAvinor();
                medFly.forEach(t => vurderLanding(t, flights));
                utenFly.forEach(t => { if (t.antattFlyplass) t.kandidater = finnKandidatfly(flights, t.antattFlyplass, t.taxiDate); });
                // Flightnr fra meldingen finnes ikke hos Avinor (typisk tastefeil) → slå opp
                // pasientens avreise via pnr og foreslå sannsynlig fly (lander før taxitid).
                for (const t of medFly) {
                    if (!(t.avinor && (t.avinor.funnet === false || t.avinor.ingenDato)) || !t.pnr || t.antattFlyplass) continue;
                    const sEl = body.querySelector('.grm-status'); if (sEl) sEl.textContent = `Finner riktig fly for ${t.navn} …`;
                    const r = await finnFlyViaPnr(t.pnr);
                    if (r && r.flyReknr) t.flyReknr = r.flyReknr;        // fly-rekvisisjonens reknr → g-travel-nøkkel
                    if (r && r.kunOrigin) { t.antattFlyplass = r.fraIata; t.kandidater = finnKandidatfly(flights, t.antattFlyplass, t.taxiDate); }
                }
                const grmPrio = t => (t.avinor.forLite || t.avinor.cancelled ? 2 : 0) + (t.avinor.funnet === false ? 1 : 0);
                medFly.sort((a, b) => grmPrio(b) - grmPrio(a));
                utenFly.sort((a, b) => ((b.kandidater && b.kandidater.length ? 1 : 0) - (a.kandidater && a.kandidater.length ? 1 : 0)));
            }
            // Stash for re-render fra minnet (uten ny henting) — brukes etter flytt-tid for å flytte
            // en løst tur til «Uten avvik». klassifiser kjøres på nytt, så andre avvik holder turen igjen.
            window._grmTurer = medFly.concat(utenFly);
            window._grmReRender = () => render(body, medFly, utenFly);
            render(body, medFly, utenFly);
            gtSjekk(window._grmTurer);   // g-travel-redning (async, oppdaterer kort etter hvert)
        } catch (e) {
            body.innerHTML = `<div class="grm-tom" style="color:#fca5a5;">Feil ved henting: ${esc(e.message)}</div>`;
        } finally {
            if (shim) shim.classList.remove('on');
        }
    }

    // === Sesjon-logging → OUS Dashboard (Sesjoner/Statistikk, skript='Gardermoen') ===
    const SESJON_URL = 'https://thomaswestby.no/skript/live_sesjon.php';
    function grmNissy() {
        // Aktiv bruker fra verktøykassen er FASIT. Cookie-metoden under er upålitelig fordi gamle
        // *filter/*opp-cookies fra en annen konto blir liggende i nettleseren (slettes ikke ved
        // utlogging) — f.eks. en gammel Innlandet-bruker (twestby) som plukkes foran den aktive
        // Oslo-brukeren (thwe). Derfor: bruk __vkt_brukernavn først, cookie kun som reserve.
        if (window.__vkt_brukernavn) return String(window.__vkt_brukernavn).toLowerCase();
        try {
            for (const c of document.cookie.split(';').map(x => x.trim())) {
                const navn = c.split('=')[0];
                for (const s of ['efilter', 'vfilter', 'rfilter', 'popp', 'vopp'])
                    if (navn.endsWith(s) && navn.length > s.length) return navn.slice(0, -s.length).toLowerCase();
            }
        } catch (_) {}
        return '';
    }
    function grmSignatur() {
        try {
            const m = document.body.innerHTML.match(/Pasientreisekontor[^<]*(?:\s|&nbsp;)-\s*(?:&nbsp;\s*)*([^<]+)/);
            if (m) { const f = m[1].trim().replace(/&nbsp;/g, '').trim(); const d = f.split(',').map(s => s.trim()); return d.length === 2 ? `${d[1]} ${d[0].charAt(0)}.` : f; }
        } catch (_) {}
        return 'Ukjent';
    }
    function grmKontor() {
        const m = String(document.title || '').match(/Pasientreisekontor\s+(?:for\s+)?(?:Pasientreiser\s+)?([^\-—|<\n\r]+?)(?:\s*[-—|<\n\r]|\s*$)/i);
        return m ? m[1].trim() : '';
    }
    (async function grmSesjon() {
        let sid = 0;
        const sig = () => { const s = grmSignatur(); return s !== 'Ukjent' ? s : ''; };
        try {
            const r = await fetch(SESJON_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handling: 'start', nissy_id: grmNissy(), signatur: grmSignatur(), versjon: VERSJON, skript: 'Gardermoen', kjorekontor: grmKontor() })
            });
            const j = await r.json(); if (j && j.ok && j.id) sid = j.id;
        } catch (_) {}
        if (!sid) return;
        setInterval(() => {
            fetch(SESJON_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handling: 'heartbeat', id: sid, versjon: VERSJON, nissy_id: grmNissy(), signatur: sig(), kjorekontor: grmKontor() }) }).catch(() => {});
        }, 60000);
        const slutt = () => { try { navigator.sendBeacon(SESJON_URL, new Blob([JSON.stringify({ handling: 'slutt', id: sid })], { type: 'application/json' })); } catch (_) {} };
        window.addEventListener('beforeunload', slutt);
        window.addEventListener('pagehide', slutt);
    })();

    window[FLAG] = { open: kjor, panel, VERSJON };
    settInn();
    kjor();
})();
