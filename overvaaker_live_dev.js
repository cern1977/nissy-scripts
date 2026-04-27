// === OVERVÅKER LIVE (snippet) — versjon satt i VERSJON_FULL ===

// <option class="form" value="18105">Overvåker 1, OT, CT, OTB, TR, FT</option>
// <option class="form" value="18106">Overvåker 2, NT, OTB, Taxus</option>
// <option class="form" value="18103">Overvåkning Hele dagen</option>
// <option class="form" value="18160">Overvåkning kveld/helg</option>

function kjorOvrvaker() {
    if (window._ovrvakerAktiv) { console.log("Overv\u00e5ker Live kj\u00f8rer allerede"); return; }
    window._ovrvakerAktiv = true;

    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
    // \u2551  OVERV\u00c5KER LIVE                                                    \u2551
    // \u2551  Varsler pasienter ved forsinkelser:                               \u2551
    // \u2551  - TUR (til behandling): >15 min forsinkelse                       \u2551
    // \u2551  - RETUR (fra behandling): >45 min forsinkelse                     \u2551
    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
    
    const VERSJON_FULL = '6.2.21-dev';
    const TITTEL = `Overvåker Live v${VERSJON_FULL}`;
    console.log(`${TITTEL} startet`);
    const VERSJON = VERSJON_FULL;
    
    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
    // \u2551  KONFIGURASJON - ENDRE DISSE VED BEHOV                             \u2551
    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
    const CONFIG = {
        TEST_TELEFON: '+4741295495',      // Telefonnummer for testing

        // --- SMS til pasient ---
        FORSINKELSE_TUR_MIN: 15,          // Minutter forsinkelse f\u00f8r SMS p\u00e5 normal tur
        FORSINKELSE_TUR_SPOT_MIN: 25,     // Minutter forsinkelse f\u00f8r SMS p\u00e5 SPOT-tur
        FORSINKELSE_RETUR_MIN: 60,        // Minutter forsinkelse f\u00f8r SMS p\u00e5 retur
        REPETER_INTERVALL_MIN: 60,        // Send ny SMS hver X min etter f\u00f8rste

        // --- Etterlysning mot transportør ---
        ETTERLYSE_TUR_MIN: 15,            // Etterlyse TUR etter X min
        ETTERLYSE_TUR_SPOT_MIN: 25,       // Etterlyse TUR SPOT etter X min
        ETTERLYSE_RETUR_MIN: 60,          // Etterlyse RETUR etter X min
        ETTERLYSE_REPETER_MIN: 15,        // Ny etterlysning (snooze) hvert X min etter EPT

        // --- Geo ---
        GEO_BLACKLIST: ['norgestaxi', 'follo taxi', 'taxisentralen', '02000'],  // Transportører som aldri leverer geo-data

        // --- Delte avtaler (Oslo Vanlig etc): områdekode → faktisk transportør ---
        // Brukes for å overstyre generisk "Norgestaxi og CT Oslo Vanlig"-navn
        // Basert på avtaleområder under 5.Oslo Vanlig transport

        // --- Visning ---
        VIS_TUR_FRA_MIN: 0,               // Vis TUR i listen fra passert hentetidspunkt
        VIS_RETUR_FRA_MIN: 0,             // Vis RETUR i listen fra passert hentetidspunkt
        SPOT_GRENSE_MIN: 25,              // Hvis bestilt <25 min f\u00f8r avreise = SPOT
        REFRESH_INTERVAL_SEC: 60,         // Sekunder mellom hver oppdatering
        DEBUG: true,                      // Vis debug-info i konsollen (skjult panel)
        POPUP_WIDTH: 1500,
        POPUP_HEIGHT: 800,
        RFILTER_IDS: [18105, 18106, 18103, 18160]
    };

    // Mapping: avtale-områdekode → faktisk transportør (primær)
    // Gjør at "Norgestaxi og CT Oslo Vanlig" blir vist som konkret NT eller CT
    const OSLO_VANLIG_RUTING = {
        '5.01.SYD.3':      { kode: 'CT', navn: 'CT Beredskap' },
        '5.01.SYD.1':      { kode: 'NT', navn: 'Norgestaxi' },
        '5.01.SYD.1.KM':   { kode: 'NT', navn: 'Norgestaxi (km)' },
        '5.05.VEST.1':     { kode: 'CT', navn: 'Christiania Taxi' },
        '5.05.VEST.3':     { kode: 'NT', navn: 'Norgestaxi Beredskap' },
        '5.05.V.OUS.1':    { kode: 'CT', navn: 'Christiania Taxi' },
        '5.05.V.OUS.3':    { kode: 'NT', navn: 'Norgestaxi Beredskap' },
        '5.05.V.OUS.Au.1': { kode: 'CT', navn: 'Christiania Taxi' },
    };

    // Hent filternavn fra NISSY DOM
    const nissySelect = document.querySelector('select[name="filter-ventende-oppdrag"]');
    const RFILTER_VALG = CONFIG.RFILTER_IDS.map(id => {
        const opt = nissySelect ? Array.from(nissySelect.options).find(o => +o.value === id) : null;
        return { id, navn: opt ? opt.textContent.trim() : String(id) };
    });
    // Husk siste filter via localStorage
    const lagretFilter = localStorage.getItem('overvaker_rfilter');
    let aktivtRfilter = lagretFilter && RFILTER_VALG.find(f => f.id === +lagretFilter)
        ? +lagretFilter
        : 18103;

    // ═══════════════════════════════════════════════════════════════════
    //   ADMIN-CACHE — reduserer ajax_reqdetails og sutiXml-fetches
    // ═══════════════════════════════════════════════════════════════════
    const ADMIN_CACHE_TTL_MS = 3 * 60 * 1000;   // 3 min for pasient-detaljer
    const RESSURSKORT_CACHE_TTL_MS = 30 * 1000; // 30 sek for lettvektig avvik/merknad-oppdatering
    const _adminHtmlCache = new Map(); // key: `${reqId}_${resId}` → {html, t, status, startTidMs}
    const _ressurskortCache = new Map(); // key: resId → {html, t} (transformert til avvikslogg-parsbar HTML)
    const _sutiXmlCache   = new Map(); // key: xmlId → data (ingen TTL — xmlId er immutable)
    const _cacheStats = { adminHit: 0, adminMiss: 0, adminStale: 0, sutiHit: 0, sutiMiss: 0, ressurskortHit: 0, ressurskortMiss: 0 };

    async function hentAdminHtmlCached(reqId, resId, status, startTidMs, force) {
        const key = `${reqId}_${resId}`;
        const now = Date.now();
        if (!force) {
            const c = _adminHtmlCache.get(key);
            if (c && (now - c.t) < ADMIN_CACHE_TTL_MS && c.status === status && c.startTidMs === startTidMs) {
                _cacheStats.adminHit++;
                return c.html;
            }
            if (c) _cacheStats.adminStale++;
        }
        _cacheStats.adminMiss++;
        const url = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${reqId}&db=1&tripid=${resId}&showSutiXml=true&hideEvents=&full=true`;
        const res = await fetch(url);
        const html = await res.text();
        _adminHtmlCache.set(key, { html, t: now, status, startTidMs });
        return html;
    }

    // Hent ressurskort-XML (lettvektig endpoint — kun ressurs-info + avvik/merknad),
    // og transformer til parseAvvikslogg-kompatibel HTML-snutt.
    // Bruk for kort med aktiv EPT så vi raskt ser IFS-svar uten å vente på full admin-cache (3 min).
    async function hentRessurskortCached(resId) {
        const now = Date.now();
        const c = _ressurskortCache.get(resId);
        if (c && (now - c.t) < RESSURSKORT_CACHE_TTL_MS) {
            _cacheStats.ressurskortHit++;
            return c.html;
        }
        _cacheStats.ressurskortMiss++;
        try {
            const url = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?update=false&action=showres&rid=${resId}`;
            const res = await fetch(url);
            // NISSY leverer ISO-8859-1, ikke UTF-8. Dekoder manuelt for å unngå � på æøå.
            const buffer = await res.arrayBuffer();
            const xml = new TextDecoder('iso-8859-1').decode(buffer);
            // Konverter seksjoner til `<td align="right">NAME:</td><td>TEXT</td>`-format
            // slik at parseAvvikslogg kan kjøres direkte på resultatet.
            let out = '';
            const sectionRegex = /<td[^>]*class="reqvtitle"[^>]*>(Merknad|Avvik)<\/td>([\s\S]*?)(?=<td[^>]*class="reqvtitle"|<\/response>)/gi;
            let m;
            while ((m = sectionRegex.exec(xml)) !== null) {
                const sectionName = m[1];
                const section = m[2];
                const valueRegex = /<td[^>]*class="reqv_value"[^>]*>([\s\S]*?)<\/td>/gi;
                let vm;
                while ((vm = valueRegex.exec(section)) !== null) {
                    // Splitt på <br> — flere entries kan ligge i samme <td> separert med linjeskift
                    const deler = vm[1]
                        .split(/<br\s*\/?>/gi)
                        .map(d => d.replace(/<[^>]+>/g, '').trim())
                        .filter(d => d.length > 0);
                    deler.forEach(innhold => {
                        out += `<td align="right">${sectionName}:</td><td>${innhold}</td>`;
                    });
                }
            }
            _ressurskortCache.set(resId, { html: out, t: now });
            return out;
        } catch(e) {
            return '';
        }
    }

    async function hentSutiXmlGeoCached(xmlId) {
        if (!xmlId) return null;
        if (_sutiXmlCache.has(xmlId)) {
            _cacheStats.sutiHit++;
            return _sutiXmlCache.get(xmlId);
        }
        _cacheStats.sutiMiss++;
        try {
            const res = await fetch(`/administrasjon/admin/sutiXml?id=${xmlId}`);
            const xmlHtml = await res.text();
            const latM = xmlHtml.match(/lat="([\d.]+)"/);
            const longM = xmlHtml.match(/long="([\d.]+)"/);
            const data = (latM && longM) ? { lat: latM[1], long: longM[1] } : null;
            _sutiXmlCache.set(xmlId, data);
            return data;
        } catch (e) { return null; }
    }

    function ryddAdminCache(aktiveNokler) {
        // Fjern turer som ikke lenger er i NISSY-listen
        const aktive = new Set(aktiveNokler);
        for (const key of _adminHtmlCache.keys()) {
            if (!aktive.has(key)) _adminHtmlCache.delete(key);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //   LOKALE EPT — optimistic UI for nye etterlysninger
    // ═══════════════════════════════════════════════════════════════════
    // Key: resId → { tid, tekst, registrertMs, turid, transportor, pasientNavn, reqId, svarTekst, besvartMs }
    const _lokaleEPT = new Map();

    window._visAdminCacheStats = function() {
        const total = _cacheStats.adminHit + _cacheStats.adminMiss;
        const rate = total > 0 ? Math.round(_cacheStats.adminHit / total * 100) : 0;
        const rkTotal = _cacheStats.ressurskortHit + _cacheStats.ressurskortMiss;
        const rkRate = rkTotal > 0 ? Math.round(_cacheStats.ressurskortHit / rkTotal * 100) : 0;
        console.log(`[CACHE] Admin: ${_cacheStats.adminHit}/${total} treff (${rate}%) · stale=${_cacheStats.adminStale} · Ressurskort: ${_cacheStats.ressurskortHit}/${rkTotal} (${rkRate}%) · Suti: ${_cacheStats.sutiHit}/${_cacheStats.sutiHit+_cacheStats.sutiMiss} · størrelse admin=${_adminHtmlCache.size} ressurskort=${_ressurskortCache.size} suti=${_sutiXmlCache.size}`);
        return _cacheStats;
    };
    window._tommAdminCache = function() {
        _adminHtmlCache.clear();
        _ressurskortCache.clear();
        _sutiXmlCache.clear();
        console.log('[CACHE] Admin, ressurskort og SUTI cache tømt');
    };
    // Eksponer cache-referanser for debug-inspeksjon fra konsollen
    window._adminHtmlCache = _adminHtmlCache;
    window._ressurskortCache = _ressurskortCache;
    window._sutiXmlCache = _sutiXmlCache;

    // SMS-meldinger (offisielle maler fra NISSY)
    const SMS_MELDINGER = {
        TUR: () => `Vi ser at pasientreisen din til behandling er forsinket utover 15 min. Vi jobber med \u00e5 skaffe bil s\u00e5 fort som mulig. V\u00e6r tilgjengelig p\u00e5 telefon. Dersom du ikke lenger har behov for reisen m\u00e5 du gi beskjed p\u00e5 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser`,
        RETUR: () => `Vi ser at pasientreisen din fra behandling har lengre ventetid enn 60 min. Du blir hentet s\u00e5 fort som mulig. V\u00e6r tilgjengelig p\u00e5 telefon. Dersom du ikke lenger har behov for reisen m\u00e5 du gi beskjed p\u00e5 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser`,
        RUNDE2: () => `Pasientreisen din er fortsatt forsinket. Vi beklager ventetiden og jobber med \u00e5 skaffe bil. V\u00e6r tilgjengelig p\u00e5 telefon. Dersom du ikke lenger har behov for reisen m\u00e5 du gi beskjed p\u00e5 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser`,
        REPETER: () => `Tester repeterende SMS`
    };

    // === Signatur fra NISSY ===
    function hentSignatur() {
        try {
            const match = document.body.innerHTML.match(/Pasientreisekontor[^<]*-\s*(?:&nbsp;\s*)*([^<]+)/);
            if (match) {
                const fullNavn = match[1].trim().replace(/&nbsp;/g, '').trim(); // "Westby, Thomas"
                const deler = fullNavn.split(',').map(s => s.trim());
                if (deler.length === 2) {
                    return `${deler[1]} ${deler[0].charAt(0)}.`; // "Thomas W."
                }
                return fullNavn;
            }
        } catch(e) {}
        return localStorage.getItem('overvaker_signatur') || 'Ukjent';
    }
    const SIGNATUR = hentSignatur();
    const ER_ADMIN = /Thomas W\./i.test(SIGNATUR);

    // NISSY-brukernavn (login-kode som "thwe"/"gugu") — for JOIN mot dp_ansatte i sesjoner-panelet.
    // Auto-detekt fra cookie-prefix: NISSY lagrer preferanser som <brukernavn>efilter, <brukernavn>vopp osv.
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
    const NISSY_BRUKERNAVN = hentNissyBrukernavn();

    // === Sesjon-logging ===
    // Registrerer bruken av Overvåker Live i `ovr_sesjoner`-tabellen via live_sesjon.php.
    // Vises i OUS Dashboard → Sesjoner-panel.
    (async function startSesjon() {
        const nissy_id = NISSY_BRUKERNAVN || '';
        const sesjonUrl = 'https://thomaswestby.no/skript/live_sesjon.php';
        let sesjonId = 0;
        try {
            const res = await fetch(sesjonUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    handling: 'start',
                    nissy_id, signatur: SIGNATUR,
                    versjon: VERSJON_FULL, skript: 'Live'
                })
            });
            const j = await res.json();
            if (j && j.ok && j.id) {
                sesjonId = j.id;
                window._sesjonId = sesjonId;
            }
        } catch(e) { /* offline eller endpoint ned - la det gå */ }

        // Heartbeat hvert 60 sek (oppdaterer sist_sett, sjekker popup-close)
        if (sesjonId) {
            setInterval(async () => {
                if (window.smsWin && window.smsWin.closed) {
                    try {
                        navigator.sendBeacon(sesjonUrl, new Blob([JSON.stringify({
                            handling: 'slutt', id: sesjonId
                        })], {type: 'application/json'}));
                    } catch(e) {}
                    return;
                }
                try {
                    await fetch(sesjonUrl, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            handling: 'heartbeat', id: sesjonId,
                            versjon: VERSJON_FULL
                        })
                    });
                } catch(e) {}
            }, 60000);

            // sendBeacon ved fane-lukking (overlever bedre enn fetch)
            const avsluttSesjon = () => {
                try {
                    navigator.sendBeacon(sesjonUrl, new Blob([JSON.stringify({
                        handling: 'slutt', id: sesjonId
                    })], {type: 'application/json'}));
                } catch(e) {}
            };
            window.addEventListener('beforeunload', avsluttSesjon);
            window.addEventListener('pagehide', avsluttSesjon);
        }
    })();

    // Aktive brukere — registrer og vis (kun for admin)
    async function registrerBruker() {
        try {
            // Hent eksisterende
            const res = await fetch('https://thomaswestby.no/skript/lagre.php?fil=aktive_brukere.json');
            let brukere = {};
            if (res.ok) {
                try { brukere = await res.json(); } catch(e) { brukere = {}; }
            }
            // Registrer/oppdater denne brukeren
            brukere[SIGNATUR] = { sist: Date.now(), versjon: VERSJON };
            // Fjern inaktive (ikke sett p\u00e5 5 min)
            const naa = Date.now();
            Object.keys(brukere).forEach(k => {
                if (naa - brukere[k].sist > 5 * 60000) delete brukere[k];
            });
            // Lagre tilbake
            await fetch('https://thomaswestby.no/skript/lagre.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fil: 'aktive_brukere.json', innhold: JSON.stringify(brukere) })
            });
            return brukere;
        } catch(e) { return {}; }
    }

    async function oppdaterAktiveBrukere() {
        if (!ER_ADMIN) { registrerBruker(); return; }
        const brukere = await registrerBruker();
        const win = window.smsWin;
        if (!win || win.closed) return;
        const el = win.document.getElementById('aktive-brukere');
        if (!el) return;
        const navnListe = Object.keys(brukere);
        el.innerHTML = navnListe.length > 0 ? navnListe.map(n => `${n} <span style="opacity:0.6;">v${brukere[n].versjon}</span>`).join(', ') : '';
    }

    function debug(...args) {
        // Debug disabled
    }

    // === Fly-info hjelpefunksjon ===
    const IATA_MAP = {
        '\u00e5lesund': 'aes', 'alesund': 'aes', 'alta': 'alf',
        'andenes': 'anx', 'and\u00f8ya': 'anx', 'andoya': 'anx',
        'bardufoss': 'bdu', 'bergen': 'bgo',
        'berlev\u00e5g': 'bvg', 'berlevag': 'bvg',
        'bod\u00f8': 'boo', 'bodo': 'boo',
        'br\u00f8nn\u00f8ysund': 'bnn', 'bronnoysund': 'bnn',
        'b\u00e5tsfjord': 'bjf', 'batsfjord': 'bjf',
        'fagernes': 'vdb', 'flor\u00f8': 'fro', 'floro': 'fro',
        'f\u00f8rde': 'fde', 'forde': 'fde',
        'hammerfest': 'hft', 'harstad': 'eve', 'evenes': 'eve',
        'hasvik': 'haa', 'haugesund': 'hau',
        'honningsv\u00e5g': 'hvg', 'honningsvag': 'hvg',
        'kirkenes': 'kkn', 'kristiansand': 'krs', 'kristiansund': 'ksu',
        'lakselv': 'lkl', 'leknes': 'lkn',
        'longyearbyen': 'lyr', 'svalbard': 'lyr',
        'mehamn': 'meh', 'mo i rana': 'mqn', 'molde': 'mol',
        'mosj\u00f8en': 'mjf', 'mosjoen': 'mjf', 'namsos': 'osy',
        'narvik': 'eve',
        'r\u00f8ros': 'rrs', 'roros': 'rrs',
        'r\u00f8st': 'ret', 'rost': 'ret',
        'r\u00f8rvik': 'rvk', 'rorvik': 'rvk',
        'sandnessj\u00f8en': 'ssj', 'sandnessjoen': 'ssj',
        'sogndal': 'sog', 'stavanger': 'svg',
        'stokmarknes': 'skn', 'stord': 'srp',
        'svolv\u00e6r': 'svj', 'svolvaer': 'svj',
        's\u00f8rkjosen': 'soj', 'sorkjosen': 'soj',
        'troms\u00f8': 'tos', 'tromso': 'tos', 'trondheim': 'trd', 'v\u00e6rnes': 'trd',
        'vard\u00f8': 'vaw', 'vardo': 'vaw',
        'vads\u00f8': 'vds', 'vadso': 'vds',
        'v\u00e6r\u00f8y': 'vry', 'varoy': 'vry',
        // Utenlandske
        'stockholm': 'arn', 'arlanda': 'arn',
        'k\u00f8benhavn': 'cph', 'kobenhavn': 'cph', 'copenhagen': 'cph', 'kastrup': 'cph',
        'london': 'lhr', 'heathrow': 'lhr', 'gatwick': 'lgw',
        'amsterdam': 'ams', 'schiphol': 'ams',
        'frankfurt': 'fra', 'm\u00fcnchen': 'muc', 'munchen': 'muc',
        'helsinki': 'hel', 'gdansk': 'gdn', 'riga': 'rix', 'vilnius': 'vno',
        'warszawa': 'waw', 'warsaw': 'waw',
        'alicante': 'alc', 'malaga': 'agp', 'split': 'spu', 'nice': 'nce', 'paris': 'cdg',
        'barcelona': 'bcn', 'madrid': 'mad',
        'roma': 'fco', 'rome': 'fco', 'milano': 'mxp', 'milan': 'mxp',
        'istanbul': 'ist', 'bangkok': 'bkk', 'dubai': 'dxb',
        'reykjavik': 'kef', 'antalya': 'ayt',
        'kreta': 'her', 'heraklion': 'her', 'rhodos': 'rho',
        'palma': 'pmi', 'mallorca': 'pmi',
        'lisboa': 'lis', 'lisbon': 'lis', 'manchester': 'man', 'edinburgh': 'edi', 'dublin': 'dub',
        'z\u00fcrich': 'zrh', 'zurich': 'zrh', 'wien': 'vie', 'vienna': 'vie',
        'praha': 'prg', 'prague': 'prg', 'budapest': 'bud', 'krakow': 'krk',
        'berlin': 'ber', 'hamburg': 'ham', 'd\u00fcsseldorf': 'dus', 'dusseldorf': 'dus',
        'g\u00f6teborg': 'got', 'goteborg': 'got', 'malm\u00f6': 'mmx', 'malmo': 'mmx',
        'aalborg': 'aal', 'billund': 'bll'
    };
    
    // Fly-deteksjon med falsk-positiv-filter
    const FLY_REGEX = /\b([A-Za-z]{2,3})[\s\-]?(\d{2,5})\b/g;
    const IKKE_FLY = ['kl', 'ca', 'tl', 'nr', 'dl', 'el', 'gm', 'av', 'se', 'ob', 'pn'];
    const FRA_REGEX = /fr[a\u00e5]\s+([a-z\u00e6\u00f8\u00e5\u00e9\s]+?)(?:\s+kl|\s+ca|\s*\d|,|\.|\s+[A-Za-z]{2,3}[\s\-]?\d|$)/i;
    const ETA_REGEX1 = /(?:kl\.?|klokken|klokka|ca\.?|lander|ankommer|ankomst)\s*(\d{1,2})[:.]\s*(\d{2})/i;
    const ETA_REGEX2 = /(?:kl\.?|klokken|klokka|ca\.?|lander|ankommer|ankomst)\s*(\d{2})(\d{2})(?:\D|$)/i;
    const ETA_REGEX3 = /[A-Za-z]{2,3}[\s\-]?\d{2,5}\s+(\d{1,2})[:.]\s*(\d{2})/i;
    
    function byggFlyInfo(meldingTilTransportor) {
        if (!meldingTilTransportor) return null;
        
        // Finn flightnummer med falsk-positiv-filter
        const matches = [...meldingTilTransportor.matchAll(FLY_REGEX)];
        let flightnr = null;
        for (const m of matches) {
            const kode = m[1].toUpperCase();
            if (IKKE_FLY.includes(kode.toLowerCase())) continue;
            flightnr = kode + m[2];
            break;
        }
        if (!flightnr) return null;
        
        const meldingLower = meldingTilTransportor.toLowerCase();
        
        // Finn IATA fra bynavn i melding
        let fraIata = '';
        // Metode 1: "fra [bynavn]" m\u00f8nster
        const fraMatch = meldingLower.match(FRA_REGEX);
        if (fraMatch) {
            const by = fraMatch[1].trim();
            if (IATA_MAP[by]) fraIata = IATA_MAP[by];
        }
        // Metode 2: s\u00f8k etter bynavn hvor som helst i meldingen
        if (!fraIata) {
            for (const [by, iata] of Object.entries(IATA_MAP)) {
                if (meldingLower.includes(by)) { fraIata = iata; break; }
            }
        }
        
        // Finn ETA (estimert ankomsttid)
        let eta = '';
        const etaM = meldingTilTransportor.match(ETA_REGEX1) 
                   || meldingTilTransportor.match(ETA_REGEX2)
                   || meldingTilTransportor.match(ETA_REGEX3);
        if (etaM) {
            eta = `${String(etaM[1]).padStart(2,'0')}:${etaM[2]}`;
        }
        
        const dato = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const avinorUrl = fraIata
            ? `https://www.avinor.no/flyplass/oslo/flytider/flyinfo/?flightid=${flightnr.toLowerCase()}-${fraIata}-osl-${dato}&statusScope=arrival`
            : `https://www.avinor.no/flyplass/oslo/flytider/?search=${flightnr}&statusScope=arrival`;
        
        return { flightnr, fraIata, eta, avinorUrl };
    }

    // === UTM33 \u2192 WGS84 konvertering (norske koordinater fra plakat) ===
    function utm33ToLatLng(northing, easting) {
        const a = 6378137, f = 1/298.257223563;
        const e = Math.sqrt(2*f - f*f), e2 = e*e/(1-e*e);
        const k0 = 0.9996, E0 = 500000, lon0 = 15 * Math.PI / 180;
        const M = northing / k0;
        const mu = M / (a * (1 - e*e/4 - 3*Math.pow(e,4)/64 - 5*Math.pow(e,6)/256));
        const e1 = (1 - Math.sqrt(1 - e*e)) / (1 + Math.sqrt(1 - e*e));
        const phi1 = mu + (3*e1/2 - 27*Math.pow(e1,3)/32)*Math.sin(2*mu)
                        + (21*e1*e1/16 - 55*Math.pow(e1,4)/32)*Math.sin(4*mu)
                        + (151*Math.pow(e1,3)/96)*Math.sin(6*mu);
        const N1 = a / Math.sqrt(1 - e*e*Math.sin(phi1)*Math.sin(phi1));
        const T1 = Math.tan(phi1)*Math.tan(phi1), C1 = e2*Math.cos(phi1)*Math.cos(phi1);
        const R1 = a*(1-e*e) / Math.pow(1-e*e*Math.sin(phi1)*Math.sin(phi1), 1.5);
        const D = (easting - E0) / (N1 * k0);
        const lat = phi1 - (N1*Math.tan(phi1)/R1)*(D*D/2 - (5+3*T1+10*C1-4*C1*C1-9*e2)*Math.pow(D,4)/24
                    + (61+90*T1+298*C1+45*T1*T1-252*e2-3*C1*C1)*Math.pow(D,6)/720);
        const lon = lon0 + (D - (1+2*T1+C1)*Math.pow(D,3)/6
                    + (5-2*C1+28*T1-3*C1*C1+8*e2+24*T1*T1)*Math.pow(D,5)/120) / Math.cos(phi1);
        return { lat: lat * 180/Math.PI, lng: lon * 180/Math.PI };
    }

    // === Haversine luftlinje i km ===
    function haversine(lat1, lon1, lat2, lon2) {
        const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
        const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    // === Estimert kj\u00f8retid fra luftlinje ===
    // Kalibrert mot NISSY manualtrip + Google Maps (+30%)
    function estimerKjoretid(luftlinjeKm) {
        let faktor, kmtSnitt;
        if (luftlinjeKm < 3) {
            faktor = 1.4; kmtSnitt = 30;
        } else if (luftlinjeKm < 10) {
            faktor = 1.3; kmtSnitt = 35;
        } else if (luftlinjeKm < 25) {
            faktor = 1.4; kmtSnitt = 40;
        } else {
            faktor = 1.25; kmtSnitt = 55;
        }
        const veiKm = luftlinjeKm * faktor;
        const minutter = Math.max(3, Math.round(veiKm / kmtSnitt * 60));
        return { veiKm: Math.round(veiKm * 10) / 10, minutter };
    }

    // === IndexedDB for SMS-historikk ===
    const DB_NAME = 'SMSVarselDB_v55';
    const DB_VERSION = 1;
    const STORE_NAME = 'sendte_sms';
    
    let dbReady = null;
    
    function openDB() {
        if (dbReady) return dbReady;
        dbReady = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('dato', 'dato', { unique: false });
                }
            };
        });
        return dbReady;
    }
    
    async function dbGet(id) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async function dbSet(id, data) {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put({ id, ...data });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    async function dbGetAll() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async function dbClear() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    window.smsDB = { get: dbGet, set: dbSet, getAll: dbGetAll, clear: dbClear };

    // === IndexedDB for daglige overstyringer ===
    const OVR_DB_NAME = 'SMSOverstyringDB';
    const OVR_STORE = 'overstyringer';
    let ovrDbReady = null;
    
    function openOvrDB() {
        if (ovrDbReady) return ovrDbReady;
        ovrDbReady = new Promise((resolve, reject) => {
            const request = indexedDB.open(OVR_DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(OVR_STORE)) {
                    db.createObjectStore(OVR_STORE, { keyPath: 'id' });
                }
            };
        });
        return ovrDbReady;
    }
    
    async function ovrGet(id) {
        const db = await openOvrDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(OVR_STORE, 'readonly');
            const store = tx.objectStore(OVR_STORE);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function ovrSet(id, data) {
        const db = await openOvrDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(OVR_STORE, 'readwrite');
            const store = tx.objectStore(OVR_STORE);
            const req = store.put({ id, ...data });
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function ovrDelete(id) {
        const db = await openOvrDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(OVR_STORE, 'readwrite');
            const store = tx.objectStore(OVR_STORE);
            const req = store.delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function ovrGetAll() {
        const db = await openOvrDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(OVR_STORE, 'readonly');
            const store = tx.objectStore(OVR_STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function ovrClear() {
        const db = await openOvrDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(OVR_STORE, 'readwrite');
            const store = tx.objectStore(OVR_STORE);
            const req = store.clear();
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    window.ovrDB = { get: ovrGet, set: ovrSet, delete: ovrDelete, getAll: ovrGetAll, clear: ovrClear };

    // === Pinnede s\u00f8k DB ===
    const PIN_DB_NAME = 'SMSPinnedDB';
    const PIN_STORE = 'pinned';
    const AVVIK_MERK_STORE = 'avvikMerk';
    const AVVIK_MERK_MAX = 500;                 // maks antall merkinger
    const AVVIK_MERK_MAX_ALDER_MS = 7 * 86400000; // auto-slett etter 7 dager
    let pinDbReady = null;

    function openPinDB() {
        if (pinDbReady) return pinDbReady;
        pinDbReady = new Promise((resolve, reject) => {
            const request = indexedDB.open(PIN_DB_NAME, 2);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(PIN_STORE)) {
                    db.createObjectStore(PIN_STORE, { keyPath: 'turId' });
                }
                if (!db.objectStoreNames.contains(AVVIK_MERK_STORE)) {
                    const store = db.createObjectStore(AVVIK_MERK_STORE, { keyPath: 'id' });
                    store.createIndex('lagret', 'lagret', { unique: false });
                }
            };
        });
        return pinDbReady;
    }
    
    async function pinSet(turId, adminIds) {
        const db = await openPinDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PIN_STORE, 'readwrite');
            const req = tx.objectStore(PIN_STORE).put({ turId, ...adminIds, timestamp: Date.now() });
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function pinDelete(turId) {
        const db = await openPinDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PIN_STORE, 'readwrite');
            const req = tx.objectStore(PIN_STORE).delete(turId);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function pinGetAll() {
        const db = await openPinDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PIN_STORE, 'readonly');
            const req = tx.objectStore(PIN_STORE).getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function pinClear() {
        const db = await openPinDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(PIN_STORE, 'readwrite');
            const req = tx.objectStore(PIN_STORE).clear();
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    //   MANUELLE AVVIK-MERKINGER (EPT/IFS/KMP/KMB fallback-klassifisering)
    // ═══════════════════════════════════════════════════════════════════
    function avvikHash(txt) {
        const norm = (txt || '').replace(/\s+/g, ' ').trim().toLowerCase();
        try { return btoa(unescape(encodeURIComponent(norm))).replace(/[+/=]/g, '').slice(0, 16); }
        catch(e) { return norm.slice(0, 16); }
    }

    const _avvikMerkMap = new Map(); // "resId_hash" → 'EPT'|'IFS'|'KMP'|'KMB'
    const _avvikMerkTidMap = new Map(); // "resId_hash" → 'HH:MM' (valgfri, satt via merk-modal)

    async function avvikMerkLastAlle() {
        try {
            const db = await openPinDB();
            const alle = await new Promise((res, rej) => {
                const tx = db.transaction(AVVIK_MERK_STORE, 'readonly');
                const req = tx.objectStore(AVVIK_MERK_STORE).getAll();
                req.onsuccess = () => res(req.result || []);
                req.onerror = () => rej(req.error);
            });
            _avvikMerkMap.clear();
            _avvikMerkTidMap.clear();
            alle.forEach(r => {
                _avvikMerkMap.set(r.id, r.type);
                if (r.tid) _avvikMerkTidMap.set(r.id, r.tid);
            });
            return alle.length;
        } catch (e) { return 0; }
    }

    async function avvikMerkSet(resId, hash, type, tekst, tid) {
        const id = `${resId}_${hash}`;
        _avvikMerkMap.set(id, type);
        if (tid && /^\d{2}:\d{2}$/.test(tid)) _avvikMerkTidMap.set(id, tid);
        else _avvikMerkTidMap.delete(id);
        try {
            const db = await openPinDB();
            await new Promise((res, rej) => {
                const tx = db.transaction(AVVIK_MERK_STORE, 'readwrite');
                const req = tx.objectStore(AVVIK_MERK_STORE).put({
                    id, resId, hash, type,
                    tid: (tid && /^\d{2}:\d{2}$/.test(tid)) ? tid : null,
                    tekst: (tekst || '').slice(0, 200),
                    lagret: Date.now()
                });
                req.onsuccess = () => res();
                req.onerror = () => rej(req.error);
            });
            avvikMerkRydd(); // Non-blocking pruning
        } catch (e) { console.warn('[MERK] set feilet:', e); }
    }

    async function avvikMerkSlett(resId, hash) {
        const id = `${resId}_${hash}`;
        _avvikMerkMap.delete(id);
        _avvikMerkTidMap.delete(id);
        try {
            const db = await openPinDB();
            await new Promise((res, rej) => {
                const tx = db.transaction(AVVIK_MERK_STORE, 'readwrite');
                const req = tx.objectStore(AVVIK_MERK_STORE).delete(id);
                req.onsuccess = () => res();
                req.onerror = () => rej(req.error);
            });
        } catch (e) { console.warn('[MERK] slett feilet:', e); }
    }

    async function avvikMerkRydd() {
        try {
            const db = await openPinDB();
            const alle = await new Promise((res, rej) => {
                const tx = db.transaction(AVVIK_MERK_STORE, 'readonly');
                const req = tx.objectStore(AVVIK_MERK_STORE).getAll();
                req.onsuccess = () => res(req.result || []);
                req.onerror = () => rej(req.error);
            });
            const naa = Date.now();
            // Sorter nyest først
            alle.sort((a, b) => (b.lagret || 0) - (a.lagret || 0));
            // Marker for sletting: (1) eldre enn maks-alder, eller (2) utover maks-antall
            const sletteIds = [];
            alle.forEach((r, i) => {
                const forGammel = (naa - (r.lagret || 0)) > AVVIK_MERK_MAX_ALDER_MS;
                const overGrense = i >= AVVIK_MERK_MAX;
                if (forGammel || overGrense) sletteIds.push(r.id);
            });
            if (sletteIds.length === 0) return;
            const db2 = await openPinDB();
            const tx = db2.transaction(AVVIK_MERK_STORE, 'readwrite');
            const store = tx.objectStore(AVVIK_MERK_STORE);
            sletteIds.forEach(id => {
                store.delete(id);
                _avvikMerkMap.delete(id);
                _avvikMerkTidMap.delete(id);
            });
            await new Promise(res => { tx.oncomplete = () => res(); });
            if (sletteIds.length > 0) addDebugLog(`\ud83e\uddf9 Ryddet ${sletteIds.length} gamle avvik-merkinger`);
        } catch (e) { /* stille */ }
    }

    function avvikMerkGet(resId, hash) {
        return _avvikMerkMap.get(`${resId}_${hash}`) || null;
    }

    // Last inn merkinger én gang ved oppstart
    avvikMerkLastAlle();

    // Konfigurerbare filtre fra MySQL (ekskluder avtaler, transportører osv.)
    let _ovrFiltre = [];
    async function lastOvrFiltre() {
        try {
            const res = await fetch('https://thomaswestby.no/skript/ovr_filtre.php?action=aktive');
            if (res.ok) {
                const data = await res.json();
                if (data.ok && data.filtre) {
                    _ovrFiltre = data.filtre;
                    console.log(`[FILTER] Lastet ${_ovrFiltre.length} aktive filtre fra DB`);
                }
            }
        } catch (e) { console.warn('[FILTER] Kunne ikke laste filtre:', e.message); }
    }
    lastOvrFiltre();
    function skalEkskluderes(feltVerdier) {
        for (const f of _ovrFiltre) {
            if (f.type !== 'ekskluder') continue;
            const verdi = (feltVerdier[f.felt] || '').toUpperCase();
            if (verdi && verdi.includes(f.moenster.toUpperCase())) return f.moenster;
        }
        return null;
    }
    
    window.pinDB = { set: pinSet, delete: pinDelete, getAll: pinGetAll, clear: pinClear };

    // === IndexedDB for lagrede s\u00f8k ===
    const SOK_DB_NAME = 'SMSSokDB';
    const SOK_STORE = 'sok';
    let sokDbReady = null;
    
    function openSokDB() {
        if (sokDbReady) return sokDbReady;
        sokDbReady = new Promise((resolve, reject) => {
            const request = indexedDB.open(SOK_DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(SOK_STORE)) {
                    db.createObjectStore(SOK_STORE, { keyPath: 'id' });
                }
            };
        });
        return sokDbReady;
    }
    
    async function sokDbSet(id, data) {
        const db = await openSokDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(SOK_STORE, 'readwrite');
            const req = tx.objectStore(SOK_STORE).put({ id, ...data, timestamp: Date.now() });
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function sokDbDelete(id) {
        const db = await openSokDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(SOK_STORE, 'readwrite');
            const req = tx.objectStore(SOK_STORE).delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    
    async function sokDbGetAll() {
        const db = await openSokDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(SOK_STORE, 'readonly');
            const req = tx.objectStore(SOK_STORE).getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    
    window.sokDB = { set: sokDbSet, delete: sokDbDelete, getAll: sokDbGetAll };

    // === Stats og data ===
    window.smsKandidater = [];
    window.smsStats = { 
        totaleReiser: 0, 
        filtrerteReiser: 0,
        kandidater: 0, 
        sendtSms: 0, 
        kjoreringer: 0,
        sistOppdatert: null
    };
    window.smsVentende = [];
    window.smsSnooze = {}; // reqId -> utløpstid (Date.now() + ms) // Reiser som venter p\u00e5 SMS-terskel

    // Last snooze-state fra localStorage (overlever F5)
    try {
        const lagret = JSON.parse(localStorage.getItem('ovrLiveSnooze') || '{}');
        const naaMs = Date.now();
        window._snoozeEPT = {};
        window._snoozeSMS = {};
        Object.entries(lagret.ept || {}).forEach(([id, t]) => { if (t > naaMs) window._snoozeEPT[id] = t; });
        Object.entries(lagret.sms || {}).forEach(([id, t]) => { if (t > naaMs) window._snoozeSMS[id] = t; });
    } catch(_) { window._snoozeEPT = {}; window._snoozeSMS = {}; }
    function lagreSnooze() {
        try {
            localStorage.setItem('ovrLiveSnooze', JSON.stringify({
                ept: window._snoozeEPT || {},
                sms: window._snoozeSMS || {}
            }));
        } catch(_) {}
    }

    // === Styling - NISSY tema ===
    const STIL = `
    html, :root {
        --bg-side: #e0f2f2;
        --bg-kort: #f8fafc;
        --bg-kort-sok: #f5f3ff;
        --bg-kort-header: #e2e8f0;
        --bg-hvit: #ffffff;
        --bg-subtil: #f1f5f9;
        --bg-input: #1e293b;
        --bg-hover: #e8ecf0;
        --text-prim: #1e293b;
        --text-sek: #64748b;
        --text-kropp: #374151;
        --text-dempet: #9ca3af;
        --text-meny: #334155;
        --text-teal: #2d5a5a;
        --text-teal-sek: #5a8a8a;
        --border-kort: #cbd5e1;
        --border-meny: #d1d5db;
        --border-lys: #e5e7eb;
        --border-input: #475569;
        --header-bg: #4a9a9a;
        --header-radius: 8px;
        --shadow-kort: 0 2px 5px rgba(0,0,0,0.1);
        --bg-etterlyse: #fef2f2;
        --bg-ept: #fef3c7;
        --bg-besvart: #f0fdf4;
        --bg-avvik: #fee2e2;
        --bg-avvik-res: #fffbeb;
        --text-melding-transport: #1d4ed8;
        --text-melding-prk: #7c3aed;
    }
    body.dark, html.dark {
        --bg-side: #0f1419;
        --bg-kort: #1e2a3a;
        --bg-kort-sok: #2a2040;
        --bg-kort-header: #253447;
        --bg-hvit: #1a2332;
        --bg-subtil: #253447;
        --bg-input: #0d1520;
        --bg-hover: #2a3a4e;
        --text-prim: #e8edf2;
        --text-sek: #a0b0c0;
        --text-kropp: #e0e6ec;
        --text-dempet: #5a6a7a;
        --text-meny: #c0cad4;
        --text-teal: #e8edf2;
        --text-teal-sek: #8899aa;
        --border-kort: #4d7aaa;
        --border-meny: #2a3a4e;
        --border-lys: #2a3a4e;
        --border-input: #3d5a80;
        --header-bg: #1a2332;
        --header-radius: 0;
        --shadow-kort: 0 2px 5px rgba(0,0,0,0.3);
        --bg-etterlyse: rgba(252,129,129,0.12);
        --bg-ept: rgba(236,201,75,0.12);
        --bg-besvart: rgba(72,187,120,0.12);
        --bg-avvik: rgba(252,129,129,0.12);
        --bg-avvik-res: rgba(236,201,75,0.08);
        --bg-geo: rgba(99,179,237,0.15);
        --text-avvik: #fc8181;
        --text-advarsel: #f6ad55;
        --text-melding-transport: #60a5fa;
        --text-melding-prk: #a78bfa;
        --stat-green: #68d391;
        --stat-blue: #4fd1c5;
        --stat-orange: #f6ad55;
        --stat-red: #fc8181;
        --stat-red2: #fc8181;
        --stat-purple: #b794f6;
    }
    body.dark .retning-badge.tur { background: rgba(72,187,120,0.15) !important; color: #68d391 !important; border-color: rgba(72,187,120,0.3) !important; }
    body.dark .retning-badge.retur { background: rgba(236,201,75,0.15) !important; color: #ecc94b !important; border-color: rgba(236,201,75,0.3) !important; }
    body.dark .header { border-bottom: 1px solid #2a3a4e; }
    body.dark ::-webkit-scrollbar-track { background: transparent; }
    body.dark ::-webkit-scrollbar-thumb { background: #3d5a80; }
    body.dark * ::-webkit-scrollbar { width: 6px; }
    body.dark * ::-webkit-scrollbar-track { background: transparent; }
    body.dark * ::-webkit-scrollbar-thumb { background: #3d5a80; border-radius: 3px; }
    body.dark input, body.dark select, body.dark textarea { background: var(--bg-input); color: var(--text-prim); border-color: var(--border-input); }
    body.dark input::placeholder { color: var(--text-dempet); }
    body.dark option { background: var(--bg-hvit); color: var(--text-prim); }
        html, body { height: 100%; margin: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: var(--bg-side); padding: 15px; color: var(--text-prim); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; max-width: 1600px; margin: 0 auto; }
        .header { background: var(--header-bg); color: white; padding: 12px 16px; border-radius: var(--header-radius); display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0; }
        .dry-run-banner { background: var(--bg-ept); color: var(--text-kropp); padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; text-align: center; border: 2px dashed #ffc107; }
        .debug-panel { background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 6px; padding: 10px; margin-bottom: 15px; font-family: monospace; font-size: 11px; max-height: 150px; overflow-y: auto; color: var(--text-teal); }
        .stats { background: var(--bg-hvit); border-radius: 8px; padding: 15px; margin-bottom: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; box-shadow: var(--shadow-kort); flex-shrink: 0; }
        #container { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
        .stat-box { text-align: center; padding: 10px; border-radius: 6px; background: var(--bg-subtil); }
        .stat-label { font-size: 10px; color: var(--text-teal-sek); text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: var(--text-teal); }
        .stat-box.green .stat-value { color: var(--stat-green, #28a745); }
        .stat-box.blue .stat-value { color: var(--stat-blue, #4a9a9a); }
        .stat-box.orange .stat-value { color: var(--stat-orange, #e67e22); }
        .stat-box.red .stat-value { color: var(--stat-red, #dc2626); font-weight:700; }
        .stat-box.red .stat-value { color: var(--stat-red2, #dc3545); }
        .stat-box.purple .stat-value { color: var(--stat-purple, #6f42c1); }
        
        .btn { border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; }
        .btn-send { background: #4a9a9a; color: white; }
        .btn-send:hover { background: #3a8a8a; }
        .btn-simuler { background: #6f42c1; color: white; }
        .btn-simuler:hover { background: #5a32a1; }
        .btn-refresh { background: #17a2b8; color: white; }
        .btn-nullstill { background: #dc3545; color: white; margin-left: 10px; }
        
        .retning-badge { font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
        .retning-badge.tur { background: #d4edda; color: #155724; border: 1px solid #a3d9a5; }
        .retning-badge.retur { background: #fff3cd; color: #856404; border: 1px solid #ffc107; }
        
        .ingen-kandidater { text-align: center; padding: 50px; color: var(--text-teal-sek); background: var(--bg-hvit); border-radius: 8px; box-shadow: var(--shadow-kort); }
        .ingen-kandidater .ikon { font-size: 48px; margin-bottom: 10px; }
        
        .historikk-section { background: var(--bg-hvit); border-radius: 8px; padding: 15px; margin-top: 15px; box-shadow: var(--shadow-kort); }
        .historikk-item { padding: 8px 12px; margin: 4px 0; background: var(--bg-subtil); border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; border-left: 3px solid var(--header-bg); }
    `;

    // === Hjelpefunksjoner ===
    
    // Beregn etterlysnings-terskel basert på TUR/RETUR/SPOT
    function getEtterlysTerskel(erTur, erSpot) {
        if (!erTur) return CONFIG.ETTERLYSE_RETUR_MIN;
        if (erSpot) return CONFIG.ETTERLYSE_TUR_SPOT_MIN;
        return CONFIG.ETTERLYSE_TUR_MIN;
    }

    // OUS postnr-omr\u00e5der (fra filteret)
    const OUS_POSTNR = [[0, 1488], [1900, 2099], [2150, 2170]];

    function erOusPostnr(postnr) {
        const nr = parseInt(postnr);
        if (isNaN(nr)) return true; // Ukjent = anta innenfor
        return OUS_POSTNR.some(([fra, til]) => nr >= fra && nr <= til);
    }

    // Parse postnr fra "1234 Stedsnavn" streng
    function parsePostnr(postSted) {
        if (!postSted) return null;
        const m = postSted.match(/^(\d{4})/);
        return m ? m[1] : null;
    }

    // Beregn reisetid via OSRM, lagre i localStorage
    // N\u00f8kkel: osrm_<fra_lat>,<fra_lng>_<til_lat>,<til_lng>
    async function hentReisetid(fraLat, fraLng, tilLat, tilLng) {
        const key = `osrm_${fraLat.toFixed(3)},${fraLng.toFixed(3)}_${tilLat.toFixed(3)},${tilLng.toFixed(3)}`;
        // Sjekk localStorage
        try {
            const lagret = localStorage.getItem(key);
            if (lagret) {
                const data = JSON.parse(lagret);
                // Utl\u00f8per etter 30 dager
                if (Date.now() - data.ts < 30 * 86400000) return data.min;
            }
        } catch(e) {}
        // Hent fra OSRM
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${fraLng},${fraLat};${tilLng},${tilLat}?overview=false`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                if (json.routes && json.routes[0]) {
                    const min = Math.round(json.routes[0].duration / 60);
                    // Lagre i localStorage
                    try { localStorage.setItem(key, JSON.stringify({ min, ts: Date.now() })); } catch(e) {}
                    return min;
                }
            }
        } catch(e) {
            debug('OSRM-feil:', e.message);
        }
        return null;
    }

    // Formater telefonnummer: fjern +47, vis som 3 2 3
    function fmtTlf(nr) {
        if (!nr) return '';
        // Splitt på komma eller slash for flere numre, dedupe like
        if (nr.includes(',') || nr.includes('/')) {
            const formatert = nr.split(/[,\/]/).map(n => fmtTlf(n.trim())).filter(Boolean);
            const unike = [];
            formatert.forEach(f => { if (!unike.includes(f)) unike.push(f); });
            return unike.join(', ');
        }
        let n = nr.replace(/[\s+\-]/g, '');
        if (n.startsWith('0047')) n = n.slice(4);
        if (n.startsWith('47') && n.length === 10) n = n.slice(2);
        if (n.length === 8) {
            // Mobilnummer (4x, 9x) = 3-2-3, fastlinje = 2-2-2-2
            if (n[0] === '4' || n[0] === '9') return n.slice(0,3) + ' ' + n.slice(3,5) + ' ' + n.slice(5);
            return n.slice(0,2) + ' ' + n.slice(2,4) + ' ' + n.slice(4,6) + ' ' + n.slice(6);
        }
        return nr;
    }

    function parseTid(str) {
        if (!str) return 0;
        // Format: "DD.MM.YYYY HH:MM" eller "DD.MM.YY HH:MM"
        const match = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2})[.:](\d{2})/);
        if (!match) {
            debug('parseTid feilet for:', str);
            return 0;
        }
        const [, dag, mnd, aar, time, min] = match;
        const fullAar = aar.length === 2 ? 2000 + parseInt(aar) : parseInt(aar);
        return new Date(fullAar, parseInt(mnd)-1, parseInt(dag), parseInt(time), parseInt(min)).getTime();
    }
    
    function parseKortTid(str) {
        // Format: "DD.MM HH:MM" eller bare "HH:MM"
        if (!str) return null;
        const tidMatch = str.match(/(\d{1,2})[.:](\d{2})/);
        if (!tidMatch) return null;
        
        const now = new Date();
        const time = parseInt(tidMatch[1]);
        const min = parseInt(tidMatch[2]);
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), time, min).getTime();
    }
    
    function formaterTid(ms) {
        if (!ms) return '--:--';
        const d = new Date(ms);
        return d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
    }
    
    function normaliserTelefon(val) {
        if (!val) return null;
        const digits = val.replace(/\D/g, "");
        if (digits.length < 8) return null;
        return digits.slice(-8);
    }
    
    function erMobilnummer(nr) {
        // Norske mobilnumre begynner med 4 eller 9
        if (!nr) return false;
        const normalisert = normaliserTelefon(nr);
        if (!normalisert || normalisert.length !== 8) return false;
        return normalisert.startsWith('4') || normalisert.startsWith('9');
    }

    // === Utility-funksjoner ===
    function decodeHtmlEntities(str) {
        return str.replace(/&nbsp;/g, ' ').replace(/&aring;/g, '\u00e5').replace(/&aelig;/g, '\u00e6').replace(/&oslash;/g, '\u00f8')
            .replace(/&Aring;/g, '\u00c5').replace(/&AElig;/g, '\u00c6').replace(/&Oslash;/g, '\u00d8');
    }

    function tidTilMinutterSiden(tidStr, now) {
        const [h, m] = tidStr.split(':').map(Number);
        return Math.floor((now - new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)) / 60000);
    }

    function parseAvvikslogg(adminHtml, resId) {
        const avviksLogg = [];
        let sisteKontaktFraAvvik = null, sisteEPT = null, sisteIFS = null, eptAntall = 0;
        // Hjelper: klassifiser én enkelt linje. hashTekst brukes for avvikHash (full tekst slik den vises),
        // raw brukes for tid/type-parsing (uten [MERKNAD]-prefiks).
        function klassifiser(hashTekst, raw) {
            const km = raw.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
            const manueltType = resId ? avvikMerkGet(resId, avvikHash(hashTekst)) : null;
            if (manueltType) {
                const lagretTid = resId ? _avvikMerkTidMap.get(`${resId}_${avvikHash(hashTekst)}`) : null;
                let tid = lagretTid || (km ? km[1] : (klassifiserAvvikTekst(raw)?.tid || '?'));
                if (manueltType === 'EPT') { sisteEPT = { tid, tekst: hashTekst }; eptAntall++; }
                else if (manueltType === 'IFS') { sisteIFS = { tid, tekst: hashTekst }; }
                else if (manueltType === 'KMP' || manueltType === 'KMB') {
                    sisteKontaktFraAvvik = { tid, type: manueltType };
                }
            } else if (km) {
                const type = km[2].toUpperCase();
                const rest = raw.substring(km[0].length).trim();
                if (type !== 'EPT' && type !== 'IFS' && type !== 'IST') sisteKontaktFraAvvik = { tid: km[1], type };
                if (type === 'EPT') { sisteEPT = { tid: km[1], tekst: rest }; eptAntall++; }
                if (type === 'IFS') sisteIFS = { tid: km[1], tekst: rest };
            } else {
                const klassi = klassifiserAvvikTekst(raw);
                if (klassi) {
                    if (klassi.type === 'EPT') { sisteEPT = { tid: klassi.tid, tekst: hashTekst }; eptAntall++; }
                    else if (klassi.type === 'IFS') { sisteIFS = { tid: klassi.tid, tekst: hashTekst }; }
                }
            }
        }
        // Bygg kombinert liste: både Avvik- og Merknad-felt i NISSY admin behandles likt
        const regex = /<td[^>]*align="right"[^>]*>(Avvik|Merknad):<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
        let m;
        while ((m = regex.exec(adminHtml)) !== null) {
            const feltType = m[1];
            let txt = decodeHtmlEntities(m[2]).trim();
            if (txt.length > 0) {
                // Operatører dropper ofte kolon i tidspunkt (1330 i stedet for 13:30),
                // og kan ha flere EPT/IFS/KMP/KMB/IST-markører i samme felt (spesielt Merknad).
                // Finn hver markør (med valgfritt tidspunkt foran) og splitt på indeksene.
                const markerRegex = /(?:(\d{2}:?\d{2})\s*-?\s*)?(EPT|IFS|KMP|KMB|IST)\b/gi;
                const funn = [...txt.matchAll(markerRegex)];
                let segmenter;
                if (funn.length >= 2) {
                    segmenter = funn.map((f, i) => {
                        const start = f.index;
                        const slutt = i + 1 < funn.length ? funn[i + 1].index : txt.length;
                        return txt.substring(start, slutt).trim();
                    }).filter(s => s.length > 0);
                    // Eventuell innledende tekst før første markør (f.eks. "Pas etterlyser 1330 IFS")
                    if (funn[0].index > 0) {
                        const fortekst = txt.substring(0, funn[0].index).trim();
                        if (fortekst.length > 0) segmenter.unshift(fortekst);
                    }
                } else {
                    segmenter = [txt];
                }
                segmenter.forEach(seg => {
                    const visningsTekst = feltType === 'Merknad' ? `[MERKNAD] ${seg}` : seg;
                    avviksLogg.push(visningsTekst);
                    klassifiser(visningsTekst, seg);
                });
            }
        }
        return { avviksLogg, sisteKontaktFraAvvik, sisteEPT, sisteIFS, eptAntall };
    }

    // Heuristisk klassifisering av frihånd-avvik (når operatør ikke brukte type-dropdown)
    // Returnerer {type: 'EPT'|'IFS', tid: 'HH:MM'} eller null
    function klassifiserAvvikTekst(txt) {
        const lower = txt.toLowerCase();
        let type = null;
        if (/etterlys(t)?\s*(p[aå]\s*)?teams|etterlys(t)?\s*teams/i.test(txt)) type = 'EPT';
        else if (/melding\s+fra|(svar|info)\s+fra|fra\s+(tr|sentral|ks|transport(ø|o)r)\b/i.test(txt)) type = 'IFS';
        else if (/\bEPT\b/.test(txt)) type = 'EPT'; // Bare ord "EPT" (f.eks. i merknad)
        else if (/\bIFS\b/.test(txt)) type = 'IFS';
        if (!type) return null;
        // Trekk ut tid — prøv HH:MM først, deretter HHMM (4 sifre)
        let tidMatch = txt.match(/\b(\d{1,2}):(\d{2})\b/);
        if (!tidMatch) tidMatch = txt.match(/\b(\d{2})(\d{2})\b/);
        if (!tidMatch) return { type, tid: '?' };
        const hh = tidMatch[1].padStart(2, '0');
        const mm = tidMatch[2];
        return { type, tid: `${hh}:${mm}` };
    }

    // === Vindu-h\u00e5ndtering ===
    let debugLog = [];
    
    function addDebugLog(msg) {
        const tid = new Date().toLocaleTimeString('no-NO');
        debugLog.push(`[${tid}] ${msg}`);
        if (debugLog.length > 50) debugLog.shift();
        oppdaterDebugPanel();
    }
    
    function oppdaterDebugPanel() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        const panel = win.document.getElementById('debug-logg');
        if (panel && CONFIG.DEBUG) {
            panel.innerHTML = debugLog.join('<br>');
            panel.scrollTop = panel.scrollHeight;
        }
        const kolPanel = win.document.getElementById('debug-kolonne-logg');
        if (kolPanel) {
            kolPanel.innerHTML = debugLog.join('<br>');
            kolPanel.scrollTop = kolPanel.scrollHeight;
        }
    }

    // BroadcastChannel for kommunikasjon som overlever F5
    const ovrChannel = new BroadcastChannel('overvaker_live');

    // Etter F5: pr\u00f8v \u00e5 gjenbruke eksisterende popup via BroadcastChannel
    window._popupGjenfunnet = false;
    ovrChannel.onmessage = function(e) {
        if (e.data.type === 'POPUP_ALIVE') {
            // Popup lever! Hent referanse via navngitt vindu (uten \u00e5 overskrive)
            window._popupGjenfunnet = true;
            addDebugLog('\u2705 Popup gjenfunnet etter F5');
        }
    };
    // Sp\u00f8r om popup lever
    ovrChannel.postMessage({ type: 'RECONNECT' });

    function sjekkVindu() {
        // Sjekk om eksisterende popup er gyldig og tilgjengelig
        let popupOk = false;
        if (window.smsWin && !window.smsWin.closed) {
            try {
                popupOk = !!window.smsWin.document.getElementById('container');
            } catch(e) {
                popupOk = false;
            }
        }
        if (popupOk) return; // Alt OK

        // Etter F5: popup kan leve uten at vi har referanse
        // Hent referanse via navngitt vindu UTEN \u00e5 overskrive innhold
        if (!window.smsWin || window.smsWin.closed) {
            // Pr\u00f8v \u00e5 f\u00e5 referanse til eksisterende popup uten \u00e5 \u00e5pne ny
            if (window._popupGjenfunnet) {
                // Popup lever - \u00e5pne med tom URL for \u00e5 f\u00e5 referanse uten \u00e5 endre innhold
                window.smsWin = window.open('', 'Overvaker_Live');
                if (window.smsWin && !window.smsWin.closed) {
                    try {
                        if (window.smsWin.document.getElementById('container')) {
                            addDebugLog('\ud83d\udd04 Koblet til eksisterende popup');
                            return;
                        }
                    } catch(e) {}
                }
            }
        }

        // === Popup mangler eller er ugyldig \u2014 riv ned og bygg ny ===

        // 1) Be eventuell orphan-popup lukke seg via BroadcastChannel
        ovrChannel.postMessage({ type: 'LUKK_POPUP' });

        // 2) Lukk via referanse hvis mulig
        if (window.smsWin && !window.smsWin.closed) {
            try { window.smsWin.close(); } catch(e) {}
        }

        // 3) Opprett helt ny popup
        window.smsWin = window.open('about:blank', 'Overvaker_Live');
        window.smsWin.smsDB = window.smsDB;
        const _mork = (() => { try { return localStorage.getItem('ovr-theme') === 'dark'; } catch(e) { return false; } })();
        const _visAlle20 = (() => { try { return localStorage.getItem('ovr-vis-alle-20') === '1'; } catch(e) { return false; } })();
        window._visAlle20 = _visAlle20;
        if (window._dbgFiltre === undefined) window._dbgFiltre = {
            visAlle: false,  // Vis alle turer (inkl. venter uten EPT/SMS)
            sms: true,       // Respekter SMS-historikk (cooldown)
            ept: true,       // Respekter EPT-historikk (etterlyst/besvart)
            status: true,    // Filtrer framme/startet/ikke møtt
            terskel: true,   // Forsinkelse-terskel
            bomtur: true,    // Ekskluder bomturer
            avtale: true,    // Ekskluder helseekspress etc.
        };
        window.smsWin.document.open();
        window.smsWin.document.write(`<html><head><title>${TITTEL}</title><style>${STIL}
                #debug-panel { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999; background: var(--bg-hvit); border-top: 2px solid var(--border-kort); max-height: 40vh; overflow-y: auto; padding: 12px 16px; font-family: monospace; font-size: 12px; color: var(--text-prim); box-shadow: 0 -4px 20px rgba(0,0,0,0.4); }
                #debug-panel.visible { display: block !important; }
                #info-panel { display: none; background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 8px; padding: 15px; margin: 0 0 15px 0; font-size: 13px; }
                #info-panel.visible { display: block; }
                #ventende-panel { display: none; background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 8px; padding: 15px; margin: 0 0 15px 0; font-size: 13px; max-height: calc(100vh - 200px); overflow-y: auto; }
                #ventende-panel.visible { display: block; }
                .ventende-item { padding: 8px 12px; margin: 4px 0; background: var(--bg-hvit); border-radius: 4px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid #8b5cf6; }
                .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite; margin-left: 10px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner.hidden { display: none; }
                /* Avvik modal */
                .avvik-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); z-index: 500; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .2s; }
                .avvik-modal-overlay.open { opacity: 1; pointer-events: all; }
                .avvik-modal { background: var(--bg-hvit); border: 1px solid var(--border-kort); border-radius: 8px; width: 400px; max-width: 90vw; box-shadow: 0 24px 48px rgba(0,0,0,.4); transform: translateY(10px); transition: transform .2s; }
                .avvik-modal-overlay.open .avvik-modal { transform: translateY(0); }
                .avvik-modal-header { padding: 14px 16px 12px; border-bottom: 1px solid var(--border-lys); display: flex; align-items: center; justify-content: space-between; }
                .avvik-modal-header h3 { font-size: 14px; font-weight: 700; margin: 0; }
                .avvik-modal-close { background: none; border: none; color: var(--text-dempet); cursor: pointer; font-size: 18px; padding: 4px; line-height: 1; }
                .avvik-modal-close:hover { color: var(--text-prim); }
                .avvik-modal-body { padding: 16px; }
                .avvik-modal-field { margin-bottom: 10px; }
                .avvik-modal-field label { display: block; font-size: 10px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: var(--text-dempet); margin-bottom: 3px; }
                .avvik-modal-field .val { font-size: 13px; color: var(--text-prim); }
                .avvik-modal-field textarea { width: 100%; background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 5px; color: var(--text-prim); font-family: inherit; font-size: 12px; padding: 8px; resize: vertical; min-height: 60px; outline: none; box-sizing: border-box; }
                .avvik-modal-field select, .avvik-modal-field input[type=text] { background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 5px; color: var(--text-prim); font-family: inherit; font-size: 12px; padding: 7px 8px; outline: none; box-sizing: border-box; }
                .avvik-modal-field.full select, .avvik-modal-field.full input[type=text] { width: 100%; }
                .avvik-modal-field input[type=time] { background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 5px; color: var(--text-prim); font-size: 12px; padding: 7px 8px; outline: none; box-sizing: border-box; flex-shrink: 0; color-scheme: dark; }
                .avvik-modal-footer { padding: 12px 16px; border-top: 1px solid var(--border-lys); display: flex; justify-content: flex-end; gap: 8px; }
                .avvik-modal-footer .btn-registrer { background: #ef4444; color: #fff; border: none; padding: 6px 16px; border-radius: 5px; font-weight: 700; cursor: pointer; }
                .avvik-modal-footer .btn-registrer:hover { filter: brightness(1.1); }
                .btn-avvik-modal { border: 1px solid var(--border-kort); padding: 4px 10px; border-radius: 5px; background: var(--bg-subtil); color: var(--text-sek); font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s; }
                .btn-avvik-modal:hover { background: #64748b; color: #fff; border-color: #64748b; }
                .timeline{display:flex;align-items:center;gap:0;margin-bottom:6px;margin-top:9px;position:relative}
                .tl-step{display:flex;flex-direction:column;align-items:center;flex:1;position:relative;z-index:1}
                .tl-dot{width:6px;height:6px;border-radius:50%;background:var(--bg-subtil);border:2px solid var(--border-kort);margin-bottom:3px;transition:all .3s}
                .tl-step.done .tl-dot{background:#22c55e;border-color:#22c55e;box-shadow:0 0 6px rgba(34,197,94,.3)}
                .tl-step.active .tl-dot{background:#22c55e;border-color:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.85)}
                .tl-step.warn .tl-dot{background:#ef4444;border-color:#ef4444;box-shadow:0 0 14px rgba(239,68,68,.7);animation:dot-pulse-red 2s ease infinite}
                @keyframes dot-pulse-red{0%,100%{box-shadow:0 0 10px rgba(239,68,68,.5)}50%{box-shadow:0 0 20px rgba(239,68,68,.9)}}
                .tl-label{font-size:10px;font-weight:600;letter-spacing:.5px;color:var(--text-dempet);text-transform:uppercase}
                .tl-step.done .tl-label{color:#22c55e}
                .tl-step.active .tl-label{color:#22c55e}
                .tl-step.warn .tl-label{color:#ef4444}
                .tl-time{font-size:10.5px;color:var(--text-dempet);font-variant-numeric:tabular-nums;margin-top:1px}
                .tl-step.done .tl-time,.tl-step.active .tl-time,.tl-step.warn .tl-time{color:var(--text-sek)}
                .tl-track{position:absolute;top:3px;left:10%;right:10%;height:2px;background:var(--border-kort);z-index:0}
                .tl-track-fill{height:100%;background:#22c55e;border-radius:1px;transition:width .5s ease}
                .tl-step.geo{cursor:pointer}
                .tl-step.geo .tl-dot{background:#3b82f6;border-color:#3b82f6;box-shadow:0 0 14px rgba(59,130,246,.7);animation:dot-pulse-blue 2s ease infinite}
                @keyframes dot-pulse-blue{0%,100%{box-shadow:0 0 10px rgba(59,130,246,.5)}50%{box-shadow:0 0 20px rgba(59,130,246,.9)}}
                .tl-step.geo .tl-label{color:#3b82f6}
                .avvik-tid-btn { background: var(--bg-subtil); border: 1px solid var(--border-kort); border-radius: 3px; width: 18px; height: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-prim); font-size: 8px; flex-shrink: 0; }
                .avvik-tid-btn:hover { background: #64748b; color: #fff; }
            </style></head><body class="${_mork ? 'dark' : ''}">
                <script>if(document.body.classList.contains('dark'))document.documentElement.classList.add('dark');</script>
                <div class="header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <h2 style="margin:0;">${TITTEL}</h2>
                        <!-- Skjult verktøy-seksjon (filter + søk) — kan enkelt aktiveres senere -->
                        <div id="skjult-verktoy" style="display:none; align-items:center; gap:10px;">
                            <select id="rfilter-valg" onchange="window._popupChannel.postMessage({type:'BYTT_FILTER', filter:+this.value})" style="padding:4px 8px; border:1px solid var(--border-input); border-radius:5px; font-size:13px; background:var(--bg-input); color:white; cursor:pointer; outline:none;">
                                ${RFILTER_VALG.map(f => `<option value="${f.id}"${f.id === aktivtRfilter ? ' selected' : ''}>${f.navn}</option>`).join('')}
                            </select>
                            <input id="turid-sok" type="text" placeholder="TurID / REK / PNR..."
                                   style="width:140px; padding:5px 8px; border:1px solid var(--border-input); border-radius:5px; font-size:13px; background:var(--bg-input); color:white; outline:none;"
                                   onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='#475569'"
                                   onkeydown="if(event.key==='Enter') window._popupChannel.postMessage({type:'SOK_TURID', turId:this.value.trim()})">
                            <button onclick="var v=document.getElementById('turid-sok').value.trim(); if(v) window._popupChannel.postMessage({type:'SOK_TURID', turId:v})" class="btn" style="background:#8b5cf6;">\ud83d\udd0d</button>
                        </div>
                        <div id="spinner" class="spinner hidden"></div>
                        <canvas id="ekg-monitor" width="120" height="28" style="margin-left:4px;"></canvas>
                        <span style="font-size:11px; color:var(--text-dempet); font-weight:normal;">${SIGNATUR}</span>
                        ${ER_ADMIN ? `<span id="aktive-brukere" style="font-size:11px; color:var(--text-sek); font-weight:normal; cursor:default;"></span>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="window._popupChannel.postMessage({type:'SMS_REFRESH'})" class="btn btn-refresh">&#8635; Oppdater</button>
                        <div style="position:relative;">
                            <button onclick="event.stopPropagation(); var m=document.getElementById('meny-dropdown'); m.style.display=m.style.display==='block'?'none':'block';" class="btn" style="background:var(--border-input); padding:5px 10px; font-size:16px;" title="Meny">\u22ee</button>
                            <div id="meny-dropdown" style="display:none; position:absolute; right:0; top:calc(100% + 4px); background:#1e293b; border:1px solid #334155; border-radius:6px; box-shadow:0 10px 30px rgba(0,0,0,0.4); padding:4px; z-index:1500; min-width:180px;">
                                <button onclick="document.getElementById('meny-dropdown').style.display='none'; document.getElementById('info-panel').classList.toggle('visible');" style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:#e2e8f0; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">\u2139\ufe0f\uFE0F Info / konfig</button>
                                <button onclick="document.getElementById('meny-dropdown').style.display='none'; var p=document.getElementById('ventende-panel'); p.classList.toggle('visible'); if(p.classList.contains('visible')) window._popupChannel.postMessage({type:'OPPDATER_VENTENDE'});" style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:#e2e8f0; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">\u23f3 Alle forsinkede reiser</button>
                                <button onclick="document.getElementById('meny-dropdown').style.display='none'; document.getElementById('debug-panel').classList.toggle('visible');" style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:#e2e8f0; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">\ud83d\udd27 Debug</button>
                                <label style="display:flex; align-items:center; gap:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">
                                    <input type="checkbox" id="vis-alle-20" ${_visAlle20 ? 'checked' : ''} onchange="try{localStorage.setItem('ovr-vis-alle-20', this.checked?'1':'0')}catch(e){} window._popupChannel.postMessage({type:'TOGGLE_VIS_ALLE_20', visAlle:this.checked})" style="width:14px; height:14px; accent-color:#3b82f6;">
                                    \u23f1 Vis alle 20+ min forsinkede
                                </label>
                                <button id="tema-toggle" onclick="document.getElementById('meny-dropdown').style.display='none'; document.body.classList.toggle('dark'); document.documentElement.classList.toggle('dark'); var d=document.body.classList.contains('dark'); this.textContent=d?'\u2600\ufe0f Lyst tema':'\ud83c\udf19 M\u00f8rkt tema'; try{localStorage.setItem('ovr-theme',d?'dark':'light')}catch(e){}" style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:#e2e8f0; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">${_mork ? '\u2600\ufe0f Lyst tema' : '\ud83c\udf19 M\u00f8rkt tema'}</button>
                                <div style="height:1px; background:#334155; margin:4px 6px;"></div>
                                <button onclick="document.getElementById('meny-dropdown').style.display='none'; window._popupChannel.postMessage({type:'SMS_NULLSTILL'});" style="display:block; width:100%; text-align:left; padding:8px 12px; background:transparent; border:none; color:#ef4444; font-size:13px; cursor:pointer; border-radius:4px;" onmouseover="this.style.background='#334155'" onmouseout="this.style.background='transparent'">\ud83d\uddd1\ufe0f Nullstill</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Varsel-banner — lastes fra server, styres fra admin. Bruker kan kvittere med "Lest". -->
                <div id="live-varsel-banner" style="display:none; margin:8px 0; padding:10px 14px; background:#fef3c7; color:#78350f; border:1px solid #f59e0b; border-left:4px solid #f59e0b; border-radius:6px; font-size:13px; font-weight:600; align-items:center; gap:10px;">
                    <span style="margin-right:6px;">\u26a0\ufe0f</span>
                    <span id="live-varsel-tekst" style="flex:1;"></span>
                    <button id="live-varsel-lest-btn" style="background:#f59e0b; color:white; border:none; border-radius:4px; padding:4px 12px; font-size:12px; font-weight:700; cursor:pointer; flex-shrink:0;">Lest</button>
                </div>
                <script>document.addEventListener('click', function(e){ var m=document.getElementById('meny-dropdown'); if(m && m.style.display==='block' && !m.contains(e.target) && !(e.target.textContent||'').includes('\u22ee')) m.style.display='none'; });
                // Hent varsel-tekst fra server (admin-redigerbar via live_varsler.json).
                // Poller hvert 60 sek så nye meldinger slår inn uten reload.
                // Bruker kan kvittere ved å trykke "Lest" — da lagres oppdatert-timestamp i localStorage
                // og banneret skjules inntil admin oppdaterer meldingen (ny timestamp).
                (function(){
                    var LEST_KEY = 'ovrLiveVarselLest';
                    function hentLesteStempler(){
                        try { return JSON.parse(localStorage.getItem(LEST_KEY) || '[]'); } catch(_) { return []; }
                    }
                    function lagreLestStempel(ts){
                        var liste = hentLesteStempler();
                        if (liste.indexOf(ts) === -1) liste.push(ts);
                        // Behold kun siste 20 kvitteringer — hindrer utenkelig vekst
                        if (liste.length > 20) liste = liste.slice(-20);
                        try { localStorage.setItem(LEST_KEY, JSON.stringify(liste)); } catch(_) {}
                    }
                    var _sistVisteStempel = null;
                    function oppdaterVarsel(){
                        fetch('https://thomaswestby.no/skript/lagre.php?fil=live_varsler.json&t=' + Date.now())
                            .then(function(r){ return r.ok ? r.json() : null; })
                            .then(function(d){
                                var banner = document.getElementById('live-varsel-banner');
                                var tekst = document.getElementById('live-varsel-tekst');
                                var knapp = document.getElementById('live-varsel-lest-btn');
                                if (!banner || !tekst) return;
                                if (d && d.aktiv && d.tekst) {
                                    var stempel = d.oppdatert || d.tekst;
                                    var leste = hentLesteStempler();
                                    if (leste.indexOf(stempel) !== -1) {
                                        banner.style.display = 'none';
                                        return;
                                    }
                                    if (tekst.textContent !== d.tekst) tekst.textContent = d.tekst;
                                    _sistVisteStempel = stempel;
                                    banner.style.display = 'flex';
                                    if (knapp) {
                                        knapp.onclick = function(){
                                            lagreLestStempel(stempel);
                                            banner.style.display = 'none';
                                            // Valgfri server-logg — best-effort, ignorer feil
                                            try {
                                                fetch('https://thomaswestby.no/skript/live_sesjon.php', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                                    body: 'handling=varsel_lest&stempel=' + encodeURIComponent(stempel) + '&signatur=' + encodeURIComponent(${JSON.stringify(SIGNATUR)}) + '&nissy_id=' + encodeURIComponent(${JSON.stringify(NISSY_BRUKERNAVN || '')}) + '&versjon=' + encodeURIComponent(${JSON.stringify(VERSJON_FULL)})
                                                }).catch(function(){});
                                            } catch(_) {}
                                        };
                                    }
                                } else {
                                    banner.style.display = 'none';
                                }
                            }).catch(function(){});
                    }
                    oppdaterVarsel();
                    setInterval(oppdaterVarsel, 60000);
                })();
                </script>
                <div id="info-panel" class="info-panel">
                    <h3 style="margin:0 0 10px 0; color:var(--text-prim);">\u2699\ufe0f Konfigurasjon v6</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div>
                            <div style="font-weight:bold; color:#dc2626; margin-bottom:5px;">\ud83d\udce2 Etterlysning</div>
                            <div>TUR: <strong>${CONFIG.ETTERLYSE_TUR_MIN} min</strong></div>
                            <div>TUR SPOT: <strong>${CONFIG.ETTERLYSE_TUR_SPOT_MIN} min</strong></div>
                            <div>RETUR: <strong>${CONFIG.ETTERLYSE_RETUR_MIN} min</strong></div>
                            <div>Snooze (EPT): <strong>${CONFIG.ETTERLYSE_REPETER_MIN} min</strong></div>
                        </div>
                        <div>
                            <div style="font-weight:bold; color:#f59e0b; margin-bottom:5px;">\ud83d\udcac SMS til pasient</div>
                            <div>TUR: <strong>${CONFIG.FORSINKELSE_TUR_MIN} min</strong></div>
                            <div>TUR SPOT: <strong>${CONFIG.FORSINKELSE_TUR_SPOT_MIN} min</strong></div>
                            <div>RETUR: <strong>${CONFIG.FORSINKELSE_RETUR_MIN} min</strong></div>
                            <div>Repeter: <strong>${CONFIG.REPETER_INTERVALL_MIN} min</strong></div>
                        </div>
                        <div>
                            <div style="font-weight:bold; color:var(--text-kropp); margin-bottom:5px;">\u2699\ufe0f Visning</div>
                            <div>Vis TUR fra: <strong>${CONFIG.VIS_TUR_FRA_MIN} min</strong></div>
                            <div>Vis RETUR fra: <strong>${CONFIG.VIS_RETUR_FRA_MIN} min</strong></div>
                            <div>SPOT-grense: <strong>${CONFIG.SPOT_GRENSE_MIN} min</strong></div>
                            <div>Oppdatering: <strong>${CONFIG.REFRESH_INTERVAL_SEC} sek</strong></div>
                        </div>
                    </div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border-lys);">
                        <div style="font-weight:bold; color:var(--text-kropp); margin-bottom:5px;">Vises ikke i listen</div>
                        <div>\u2022 Reiser med status "Framme", "Ikke m\u00f8tt" eller "Startet"</div>
                    </div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border-lys);">
                        <div style="font-weight:bold; color:var(--text-kropp); margin-bottom:5px;">Vises som avvik (ingen SMS)</div>
                        <div>\u2022 Pasienter uten gyldig mobilnummer</div>
                    </div>
                </div>
                <div id="ventende-panel" class="ventende-panel"></div>
                <div id="container"></div>
                <div id="sok-varsel" style="display:none; background:#f59e0b; color:#1a1a1a; padding:6px 16px; text-align:center; font-weight:600; font-size:13px; cursor:pointer;" onclick="window._popupChannel.postMessage({type:'FJERN_SOK'});">
                </div>
                <div id="heartbeat-varsel" style="display:none; background:#dc2626; color:white; padding:10px 16px; text-align:center; font-weight:600; font-size:14px; cursor:pointer; animation:pulse 2s infinite;" onclick="window._popupChannel.postMessage({type:'SMS_REFRESH'});">
                    \u26a0 Overv\u00e5ker har mistet kontakt med NISSY \u2014 klikk for \u00e5 pr\u00f8ve igjen
                </div>
                <style>@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }</style>
                <div id="debug-panel">
                    <div id="stats"></div>
                    ${CONFIG.DEBUG ? '<div id="debug-logg" style="margin-top:10px;">Debug-logg...</div>' : ''}
                </div>
                <script>
                    // BroadcastChannel for kommunikasjon som overlever F5
                    window._popupChannel = new BroadcastChannel('overvaker_live');

                    // Heartbeat-overv\u00e5king + auto-reinject etter F5
                    window._sisteHeartbeat = Date.now();
                    window._reinjecting = false;
                    window._skriptUrl = 'https://thomaswestby.no/skript/skript.php?fil=overvaaker_live_dev.js';

                    function reinjectSkript() {
                        if (window._reinjecting) return;
                        window._reinjecting = true;
                        try {
                            var opener = window.opener;
                            if (opener && !opener.closed && opener.document) {
                                // Sjekk at NISSY er ferdig lastet
                                if (opener.document.readyState === 'complete') {
                                    // Sjekk at skriptet ikke allerede kj\u00f8rer
                                    if (!opener._ovrvakerAktiv) {
                                        var s = opener.document.createElement('script');
                                        s.src = window._skriptUrl + '&t=' + Date.now();
                                        opener.document.head.appendChild(s);
                                        var varsel = document.getElementById('heartbeat-varsel');
                                        if (varsel) { varsel.style.display = 'block'; varsel.innerHTML = '\u21bb Re-starter Overv\u00e5ker etter F5...'; }
                                    }
                                } else {
                                    // Vent p\u00e5 at NISSY er ferdig lastet
                                    setTimeout(reinjectSkript, 2000);
                                }
                            }
                        } catch(e) { /* cross-origin, gi opp */ }
                        setTimeout(function() { window._reinjecting = false; }, 10000);
                    }

                    // Animert EKG-monitor
                    window._ekgAlive = true;
                    window._ekgData = [];
                    window._ekgBeatPhase = 0;
                    (function startEkg() {
                        var canvas = document.getElementById('ekg-monitor');
                        if (!canvas) return;
                        var ctx = canvas.getContext('2d');
                        var W = canvas.width, H = canvas.height;
                        var mid = H / 2;
                        var data = [];
                        for (var i = 0; i < W; i++) data.push(mid);

                        // QRS-kompleks waveform (realistisk hjerteslag)
                        var beat = [0, 0, 0, 0, 0, -2, -1, 0, 1, -1, 0, 2, -10, 12, -3, 1, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0];
                        var beatIdx = 0;
                        var beatTimer = 0;
                        var beatInterval = 60; // frames mellom hjerteslag

                        function frame() {
                            // Skyv data til venstre
                            data.shift();

                            var val = mid;
                            if (window._ekgAlive) {
                                beatTimer++;
                                if (beatTimer >= beatInterval) {
                                    beatTimer = 0;
                                    beatIdx = 0;
                                }
                                if (beatIdx < beat.length) {
                                    val = mid + beat[beatIdx] * 0.8;
                                    beatIdx++;
                                }
                            }
                            data.push(val);

                            // Tegn
                            ctx.clearRect(0, 0, W, H);
                            ctx.beginPath();
                            ctx.strokeStyle = window._ekgAlive ? '#10b981' : '#dc3545';
                            ctx.lineWidth = 1.5;
                            ctx.moveTo(0, data[0]);
                            for (var i = 1; i < data.length; i++) {
                                ctx.lineTo(i, data[i]);
                            }
                            ctx.stroke();

                            requestAnimationFrame(frame);
                        }
                        requestAnimationFrame(frame);
                    })();

                    function oppdaterEkg(alive) {
                        window._ekgAlive = alive;
                    }

                    window._heartbeatSjekk = setInterval(function() {
                        var varsel = document.getElementById('heartbeat-varsel');
                        if (!varsel) return;
                        var sekSiden = (Date.now() - window._sisteHeartbeat) / 1000;
                        if (sekSiden > 30) {
                            reinjectSkript();
                            oppdaterEkg(false);
                        }
                        if (sekSiden > 180) {
                            varsel.style.display = 'block';
                            var min = Math.floor(sekSiden / 60);
                            varsel.innerHTML = '\u26a0 Ingen oppdatering p\u00e5 ' + min + ' min \u2014 klikk for \u00e5 pr\u00f8ve igjen';
                        } else {
                            varsel.style.display = 'none';
                        }
                    }, 5000);

                    // Meld fra til hovedvinduet at popup lever (for reconnect etter F5)
                    window._popupChannel.postMessage({ type: 'POPUP_ALIVE' });

                    // Lytt etter heartbeat, markering og lukk via BroadcastChannel
                    window._popupChannel.onmessage = function(e) {
                        if (e.data.type === 'LUKK_POPUP') {
                            // Ikke lukk - pr\u00f8v \u00e5 re-injisere i stedet
                            window._sisteHeartbeat = 0; // Trigger reinject
                            return;
                        }
                        if (e.data.type === 'HEARTBEAT') {
                            window._sisteHeartbeat = Date.now();
                            var varsel = document.getElementById('heartbeat-varsel');
                            if (varsel) varsel.style.display = 'none';
                            oppdaterEkg(true);
                        }
                        if (e.data.type === 'RECONNECT') {
                            window._sisteHeartbeat = Date.now();
                            oppdaterEkg(true);
                            var varsel = document.getElementById('heartbeat-varsel');
                            if (varsel) varsel.style.display = 'none';
                            window._popupChannel.postMessage({ type: 'POPUP_ALIVE' });
                        }
                    };

                    // Notifikasjoner ved nye turer
                    window._forrigeTurAntall = 0;
                    window._originalTittel = document.title;
                    window._tittelBlink = null;
                    if (Notification.permission === 'default') Notification.requestPermission();

                    document.addEventListener('visibilitychange', function() {
                        if (!document.hidden && window._tittelBlink) {
                            clearInterval(window._tittelBlink);
                            window._tittelBlink = null;
                            document.title = window._originalTittel;
                        }
                    });

                    window._sjekkNyeTurer = function(antall) {
                        if (antall > window._forrigeTurAntall && window._forrigeTurAntall > 0 && document.hidden) {
                            var nye = antall - window._forrigeTurAntall;
                            // Windows-notifikasjon
                            if (Notification.permission === 'granted') {
                                new Notification('Overv\u00e5ker Live', { body: nye + ' nye tur' + (nye > 1 ? 'er' : '') + ' oppdaget', icon: '\ud83d\ude97' });
                            }
                            // Tittel-blink
                            if (!window._tittelBlink) {
                                var vis = true;
                                window._tittelBlink = setInterval(function() {
                                    document.title = vis ? '\u26a0 ' + nye + ' nye turer!' : window._originalTittel;
                                    vis = !vis;
                                }, 1000);
                            }
                        }
                        window._forrigeTurAntall = antall;
                    };

                    // Lytt etter meldinger fra NISSY via postMessage (direkte referanse)
                    window.addEventListener('message', function(e) {
                        if (e.data.type === 'MARKER_I_POPUP') {
                            // Håndteres nå via applyHighlight() etter re-render
                        }
                    });
</script>
                <!-- Avvik modal -->
                <div class="avvik-modal-overlay" id="avvik-modal">
                    <div class="avvik-modal">
                        <div class="avvik-modal-header">
                            <h3>&#9888; Registrer avvik</h3>
                            <button class="avvik-modal-close" onclick="document.getElementById('avvik-modal').classList.remove('open')">&#215;</button>
                        </div>
                        <div class="avvik-modal-body">
                            <div class="avvik-modal-field">
                                <label>Transportør</label>
                                <div class="val" id="avvik-modal-transporter">&mdash;</div>
                            </div>
                            <div class="avvik-modal-field" id="avvik-modal-turid-rad" style="display:none;">
                                <label>Reisenr (turid)</label>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div class="val" id="avvik-modal-turid" style="font-family:monospace; font-weight:700;">&mdash;</div>
                                    <button type="button" id="avvik-modal-kopier-turid" title="Kopier turid til utklippstavlen"
                                        style="background:var(--bg-subtil); border:1px solid var(--border-kort); color:var(--text-prim); padding:3px 10px; border-radius:4px; font-size:11px; cursor:pointer;"
                                        onclick="event.stopPropagation(); var t=document.getElementById('avvik-modal-turid').textContent.trim(); if(!t||t==='—') return; if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){var b=document.getElementById('avvik-modal-kopier-turid'); var orig=b.textContent; b.textContent='\u2713 Kopiert'; setTimeout(function(){b.textContent=orig;},1500);}).catch(function(){});} else {var ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(_){} document.body.removeChild(ta); var b=document.getElementById('avvik-modal-kopier-turid'); var orig=b.textContent; b.textContent='\u2713 Kopiert'; setTimeout(function(){b.textContent=orig;},1500);}">
                                        \ud83d\udccb Kopier
                                    </button>
                                </div>
                            </div>
                            <div class="avvik-modal-field">
                                <label>Tid &amp; Type</label>
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <input type="time" id="avvik-modal-tid"
                                        onfocus="window._editing=true"
                                        onblur="setTimeout(function(){window._editing=false},500)">
                                    <div style="display:flex; flex-direction:column; gap:2px;">
                                        <button type="button" class="avvik-tid-btn" title="+1 min" onclick="event.stopPropagation(); window._editing=true; justerTid(1); setTimeout(function(){window._editing=false},1000);">&#9650;</button>
                                        <button type="button" class="avvik-tid-btn" title="-1 min" onclick="event.stopPropagation(); window._editing=true; justerTid(-1); setTimeout(function(){window._editing=false},1000);">&#9660;</button>
                                    </div>
                                    <select id="avvik-modal-type" style="flex:1; cursor:pointer;" onfocus="window._editing=true" onblur="setTimeout(function(){window._editing=false},500)">
                                        <option value="AVVIK">Avvik</option>
                                        <option value="KMP">Kontakt med pasient</option>
                                        <option value="KMB">Kontakt med behandler</option>
                                        <option value="EPT">Etterlyst på Teams</option>
                                        <option value="IFS">Informasjon fra sentral</option>
                                    </select>
                                </div>
                            </div>
                            <div class="avvik-modal-field full">
                                <label>Fritekst</label>
                                <textarea id="avvik-modal-tekst" placeholder="Fritekst..." onfocus="window._editing=true" onblur="setTimeout(function(){window._editing=false},500)"></textarea>
                            </div>
                        </div>
                        <div class="avvik-modal-footer">
                            <button class="btn" style="padding:6px 14px;border-radius:5px;cursor:pointer;" onclick="document.getElementById('avvik-modal').classList.remove('open')">Avbryt</button>
                            <button class="btn-registrer" onclick="var tid=document.getElementById('avvik-modal-tid').value; var type=document.getElementById('avvik-modal-type').value; var tekst=document.getElementById('avvik-modal-tekst').value; window._popupChannel.postMessage({type:'SETT_AVVIK', reqId:window._avvikModalReqId, resId:window._avvikModalResId, avvikType:type, avvikTekst:tekst, avvikTid:tid, turid:window._avvikModalTurId||'', pasientNavn:window._avvikModalPasientNavn||'', transportor:window._avvikModalTransportor||''}); window._avvikModalTurId=''; window._avvikModalPasientNavn=''; window._avvikModalTransportor=''; document.getElementById('avvik-modal').classList.remove('open');">Registrer avvik</button>
                        </div>
                    </div>
                </div>

                <!-- Merk-modal (manuell klassifisering av avviks-linje) -->
                <div class="avvik-modal-overlay" id="merk-modal">
                    <div class="avvik-modal">
                        <div class="avvik-modal-header">
                            <h3>&#9881;&#65039; Merk avvik manuelt</h3>
                            <button class="avvik-modal-close" onclick="document.getElementById('merk-modal').classList.remove('open')">&#215;</button>
                        </div>
                        <div class="avvik-modal-body">
                            <div class="avvik-modal-field">
                                <label>Avvikstekst</label>
                                <div class="val" id="merk-modal-tekst" style="font-size:11px; color:var(--text-sek); max-height:60px; overflow:auto;">&mdash;</div>
                            </div>
                            <div class="avvik-modal-field">
                                <label>Tid &amp; Type</label>
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <input type="time" id="merk-modal-tid"
                                        onfocus="window._editing=true"
                                        onblur="setTimeout(function(){window._editing=false},500)">
                                    <div style="display:flex; flex-direction:column; gap:2px;">
                                        <button type="button" class="avvik-tid-btn" title="+1 min" onclick="event.stopPropagation(); window._editing=true; justerMerkTid(1); setTimeout(function(){window._editing=false},1000);">&#9650;</button>
                                        <button type="button" class="avvik-tid-btn" title="-1 min" onclick="event.stopPropagation(); window._editing=true; justerMerkTid(-1); setTimeout(function(){window._editing=false},1000);">&#9660;</button>
                                    </div>
                                    <select id="merk-modal-type" style="flex:1; cursor:pointer;" onfocus="window._editing=true" onblur="setTimeout(function(){window._editing=false},500)">
                                        <option value="EPT">EPT — Etterlyst på Teams</option>
                                        <option value="IFS">IFS — Informasjon fra sentral</option>
                                        <option value="KMP">KMP — Kontakt med pasient</option>
                                        <option value="KMB">KMB — Kontakt med behandler</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="avvik-modal-footer">
                            <button class="btn" style="padding:6px 14px;border-radius:5px;cursor:pointer;" onclick="document.getElementById('merk-modal').classList.remove('open')">Avbryt</button>
                            <button class="btn-registrer" onclick="var tid=document.getElementById('merk-modal-tid').value; var type=document.getElementById('merk-modal-type').value; window._popupChannel.postMessage({type:'MERK_AVVIK', resId:window._merkModalResId, hash:window._merkModalHash, tekstB64:window._merkModalTekstB64, merkType:type, merkTid:tid}); document.getElementById('merk-modal').classList.remove('open');">Lagre merking</button>
                        </div>
                    </div>
                </div>

                <!-- v6 Kart-popup (Leaflet + OSRM) -->
                <div id="v6-map-popup" style="display:none; position:fixed; z-index:2000; background:#1e293b; border:1px solid #334155; border-radius:8px; box-shadow:0 20px 60px rgba(0,0,0,0.6); width:520px; height:360px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 10px; border-bottom:1px solid #334155;">
                        <span id="v6-map-tittel" style="font-size:12px; color:#94a3b8;">Kart</span>
                        <button onclick="document.getElementById('v6-map-popup').style.display='none'; document.getElementById('v6-map-iframe').srcdoc='';" style="background:transparent; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:0 6px;">\u00d7</button>
                    </div>
                    <iframe id="v6-map-iframe" style="width:100%; height:calc(100% - 28px); border:none; border-radius:0 0 8px 8px;"></iframe>
                </div>
            </body></html>`);
        window.smsWin.document.close();
        window.smsWin._editing = false;
        // Eksponer cache-referanser + debug-funksjoner på popup-vinduet så de er tilgjengelig fra popup-konsollen
        window.smsWin._adminHtmlCache = _adminHtmlCache;
        window.smsWin._ressurskortCache = _ressurskortCache;
        window.smsWin._sutiXmlCache = _sutiXmlCache;
        window.smsWin._tommAdminCache = window._tommAdminCache;
        window.smsWin._visAdminCacheStats = window._visAdminCacheStats;
        window.smsWin.justerTid = function(delta) {
            var el = window.smsWin.document.getElementById('avvik-modal-tid');
            if (!el) return;
            var p = el.value.match(/^(\d{2}):(\d{2})/);
            if (!p) return;
            var t = parseInt(p[1]) * 60 + parseInt(p[2]) + delta;
            t = ((t % 1440) + 1440) % 1440;
            el.value = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
        };
        window.smsWin.justerMerkTid = function(delta) {
            var el = window.smsWin.document.getElementById('merk-modal-tid');
            if (!el) return;
            var p = el.value.match(/^(\d{2}):(\d{2})/);
            if (!p) return;
            var t = parseInt(p[1]) * 60 + parseInt(p[2]) + delta;
            t = ((t % 1440) + 1440) % 1440;
            el.value = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
        };
        window.smsWin.apneMerkModal = function(resId, hash, tekstB64, forvalgtType, forvalgtTid) {
            var doc = window.smsWin.document;
            var overlay = doc.getElementById('merk-modal');
            if (!overlay) return;
            window.smsWin._merkModalResId = resId;
            window.smsWin._merkModalHash = hash;
            window.smsWin._merkModalTekstB64 = tekstB64;
            var tekst = '';
            try { tekst = decodeURIComponent(escape(atob(tekstB64 || ''))); } catch(e) {}
            doc.getElementById('merk-modal-tekst').textContent = tekst || '—';
            var typeSel = doc.getElementById('merk-modal-type');
            if (typeSel && forvalgtType) typeSel.value = forvalgtType;
            var tidEl = doc.getElementById('merk-modal-tid');
            if (tidEl) {
                if (forvalgtTid && /^\d{2}:\d{2}$/.test(forvalgtTid)) {
                    tidEl.value = forvalgtTid;
                } else {
                    var naa = new Date();
                    tidEl.value = String(naa.getHours()).padStart(2,'0') + ':' + String(naa.getMinutes()).padStart(2,'0');
                }
            }
            overlay.classList.add('open');
        };

        // Embedded kart-popup med Leaflet + OSRM-rute (ingen Google-kvote)
        window.smsWin._v6VisKart = function(lat, lng, destAdr, tittel, el) {
            var doc = window.smsWin.document;
            var popup = doc.getElementById('v6-map-popup');
            var iframe = doc.getElementById('v6-map-iframe');
            var tit = doc.getElementById('v6-map-tittel');
            if (!popup || !iframe) return;
            if (tit) tit.textContent = tittel || 'Bil \u2192 hentested';

            var destJson = JSON.stringify(destAdr || '');
            var html = '<!DOCTYPE html><html><head>' +
                '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />' +
                '<sc' + 'ript src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></sc' + 'ript>' +
                '<style>html,body,#m{height:100%;margin:0;padding:0;background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;}.leaflet-popup-content{color:#111;}</style>' +
                '</head><body><div id="m"></div><sc' + 'ript>' +
                'var bilLat=' + lat + ',bilLng=' + lng + ';' +
                'var map=L.map("m").setView([bilLat,bilLng],13);' +
                'L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"OSM",maxZoom:19}).addTo(map);' +
                'var bilIkon=L.divIcon({html:"\u{1F697}",iconSize:[24,24],className:"bil-ikon"});' +
                'L.marker([bilLat,bilLng],{icon:bilIkon}).addTo(map).bindPopup("Bil");' +
                'var destAdr=' + destJson + ';' +
                'if(destAdr){fetch("https://nominatim.openstreetmap.org/search?format=json&countrycodes=no&limit=1&q="+encodeURIComponent(destAdr))' +
                '.then(function(r){return r.json();}).then(function(d){' +
                'if(d&&d[0]){var dLat=+d[0].lat,dLng=+d[0].lon;' +
                'L.marker([dLat,dLng]).addTo(map).bindPopup("Hentested");' +
                'map.fitBounds(L.latLngBounds([[bilLat,bilLng],[dLat,dLng]]),{padding:[30,30]});' +
                'fetch("https://router.project-osrm.org/route/v1/driving/"+bilLng+","+bilLat+";"+dLng+","+dLat+"?overview=full&geometries=geojson")' +
                '.then(function(r){return r.json();}).then(function(rd){' +
                'if(rd&&rd.routes&&rd.routes[0]){L.geoJSON(rd.routes[0].geometry,{style:{color:"#3b82f6",weight:4,opacity:0.85}}).addTo(map);' +
                'var mins=Math.round(rd.routes[0].duration/60),km=Math.round(rd.routes[0].distance/100)/10;' +
                'var info=L.control({position:"topright"});info.onAdd=function(){var d=L.DomUtil.create("div","");d.innerHTML="<div style=\\"background:#1e293b;color:#e2e8f0;padding:4px 8px;border-radius:4px;font-size:12px;border:1px solid #334155;\\">"+km+" km \u00b7 "+mins+" min</div>";return d;};info.addTo(map);}' +
                '}).catch(function(){});}' +
                '}).catch(function(){});}' +
                '</sc' + 'ript></body></html>';

            iframe.srcdoc = html;
            // Plasser nær klikket element
            var rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
            if (rect) {
                popup.style.top = Math.min(rect.bottom + 8, window.smsWin.innerHeight - 380) + 'px';
                popup.style.left = Math.max(8, Math.min(rect.left - 200, window.smsWin.innerWidth - 540)) + 'px';
            } else {
                popup.style.top = '80px';
                popup.style.left = '40px';
            }
            popup.style.display = 'block';
        };
    }

    function oppdaterStats() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        const statsDiv = win.document.getElementById('stats');
        const sistOppdatert = window.smsStats.sistOppdatert 
            ? new Date(window.smsStats.sistOppdatert).toLocaleTimeString('no-NO')
            : '--:--';
        
        statsDiv.innerHTML = `
            <div class="stats">
                <div class="stat-box blue">
                    <div class="stat-label">Kj\u00f8ringer</div>
                    <div class="stat-value">${window.smsStats.kjoreringer}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">P\u00e5g\u00e5ende</div>
                    <div class="stat-value">${window.smsStats.totaleReiser}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Passert start</div>
                    <div class="stat-value">${window.smsStats.filtrerteReiser}</div>
                </div>
                <div class="stat-box red">
                    <div class="stat-label">Etterlyse</div>
                    <div class="stat-value">${(window.smsKandidater || []).filter(k => k.kanEtterlyse).length}</div>
                </div>
                <div class="stat-box orange">
                    <div class="stat-label">SMS klar</div>
                    <div class="stat-value">${window.smsStats.kandidater}</div>
                </div>
                <div class="stat-box green">
                    <div class="stat-label">SMS sendt</div>
                    <div class="stat-value">${window.smsStats.sendtSms}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Oppdatert</div>
                    <div class="stat-value" style="font-size:14px;">${sistOppdatert}</div>
                </div>
                ${(window.smsKandidater || []).filter(k => k.erSok).length > 0 ? `
                <div class="stat-box purple">
                    <div class="stat-label">Manuelt s\u00f8k</div>
                    <div class="stat-value">${(window.smsKandidater || []).filter(k => k.erSok).length}</div>
                </div>` : ''}
            </div>
        `;
    }

    // ╔══════════════════════════════════════════════════════════════════╗
    // ║  DELT ADMIN-HTML PARSER FOR SØK                                ║
    // ║  Brukes av både DB-gjenoppretting og SOK_TURID                 ║
    // ╚══════════════════════════════════════════════════════════════════╝
    async function parseAdminHtmlForSok(adminHtml, opts) {
        const { sokVerdi, sokType, tripId, adminId, turIdFallback } = opts;
        const nowMs = Date.now();
        const nowDato = new Date();

        // Navn
        const navnMatch = adminHtml.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        const navn = navnMatch ? navnMatch[1].trim().replace(/\s+/g, ' ') : '(ukjent)';

        // PNR
        const pnrMatch = adminHtml.match(/Personnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i);
        const pnr = pnrMatch ? pnrMatch[1] : '';

        // Telefoner (alle kilder)
        const mobilMatch = adminHtml.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        const mobilEpjMatch = adminHtml.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        const mobil2Match = adminHtml.match(/>Mobilnr \(2\):<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        const ringHenteMatch = adminHtml.match(/Ring ved ankomst hentested:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        const ringMatch = adminHtml.match(/Ring ved ankomst:<\/td>\s*<td[^>]*>\s*([^<]+)/i);

        let telefon = '', telefonKilde = '', alleTelefoner = [], alleNumreMedKilde = [], harIkkeSms = false;
        for (const kandidat of [
            { match: mobilMatch, kilde: 'MOB' },
            { match: mobilEpjMatch, kilde: 'EPJ' },
            { match: mobil2Match, kilde: 'MOB2' },
            { match: ringHenteMatch, kilde: 'RING-H' },
            { match: ringMatch, kilde: 'RING' }
        ]) {
            if (kandidat.match && kandidat.match[1].trim()) {
                const rawTekst = kandidat.match[1].trim();
                const erReservert = /reservert|ikke\s*sms/i.test(rawTekst);
                if (erReservert) harIkkeSms = true;
                const nr = normaliserTelefon(rawTekst);
                if (nr && nr !== '(mangler)') {
                    const nr8 = nr.replace(/[\s+\-]/g, '').slice(-8);
                    if (nr8.length === 8) {
                        if (!alleNumreMedKilde.find(n => n.nr8 === nr8))
                            alleNumreMedKilde.push({ nr, nr8, kilde: kandidat.kilde, erMobil: erMobilnummer(nr8), erReservert });
                        if (erMobilnummer(nr8) && !alleTelefoner.includes(nr8)) alleTelefoner.push(nr8);
                        if (!telefon && erMobilnummer(nr8)) { telefon = nr; telefonKilde = kandidat.kilde; }
                    }
                }
            }
        }

        // Rekvisisjon
        const rekMatch = adminHtml.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i)
            || adminHtml.match(/>(\d{12})<\/b>/);
        const rekNr = rekMatch ? rekMatch[1] : '';

        // Folkeregistrert adresse
        let folkregAdresse = '';
        const pasLegIdx = adminHtml.search(/<legend[^>]*>Pasient<\/legend>/i);
        const hetLegIdx = adminHtml.search(/<legend[^>]*>Hentested<\/legend>/i);
        if (pasLegIdx > -1 && hetLegIdx > pasLegIdx) {
            const pasSek = adminHtml.substring(pasLegIdx, hetLegIdx);
            const folkAddrM = pasSek.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const folkPostM = pasSek.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (folkAddrM && folkAddrM[1].trim()) {
                folkregAdresse = folkAddrM[1].trim();
                if (folkPostM && folkPostM[1].trim()) folkregAdresse += ', ' + folkPostM[1].trim();
            }
        }

        // Adresser (Hentested/Leveringssted)
        let henteAdresse = '', henteAdresseFull = '';
        const hentestedet = adminHtml.match(/Hentested<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
        if (hentestedet) {
            const hnavn = hentestedet[1].trim(), hadr = hentestedet[2].trim(), hpost = hentestedet[3].trim(), htlf = hentestedet[4].trim(), hkom = hentestedet[5].trim();
            henteAdresse = `${hadr}, ${hpost}`;
            let deler = []; if (hnavn) deler.push(hnavn); if (hadr) deler.push(hadr); if (hpost) deler.push(hpost); if (htlf) deler.push(fmtTlf(htlf)); if (hkom) deler.push(`(${hkom})`);
            henteAdresseFull = deler.join('\n');
        }
        let leveringsAdresse = '', leveringsAdresseFull = '';
        const leveringsstedet = adminHtml.match(/Leveringssted<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
        if (leveringsstedet) {
            const lnavn = leveringsstedet[1].trim(), ladr = leveringsstedet[2].trim(), lpost = leveringsstedet[3].trim(), ltlf = leveringsstedet[4].trim(), lkom = leveringsstedet[5].trim();
            leveringsAdresse = `${ladr}, ${lpost}`;
            let deler = []; if (lnavn) deler.push(lnavn); if (ladr) deler.push(ladr); if (lpost) deler.push(lpost); if (ltlf) deler.push(fmtTlf(ltlf)); if (lkom) deler.push(`(${lkom})`);
            leveringsAdresseFull = deler.join('\n');
        }

        // Retning
        const retningMatch = adminHtml.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
        let erTur = retningMatch ? retningMatch[1].trim().toLowerCase().includes('til behandling') : true;

        // Adresse-telefon retningsbevisst
        const adrTlf = erTur
            ? (hentestedet && hentestedet[4] ? hentestedet[4].trim() : '')
            : (leveringsstedet && leveringsstedet[4] ? leveringsstedet[4].trim() : '');
        if (adrTlf) {
            const adrNr = normaliserTelefon(adrTlf);
            if (adrNr && adrNr !== '(mangler)') {
                const adrNr8 = adrNr.replace(/[\s+\-]/g, '').slice(-8);
                if (adrNr8.length === 8) {
                    const erReservert = /reservert|ikke\s*sms/i.test(adrTlf);
                    if (erReservert) harIkkeSms = true;
                    if (!alleNumreMedKilde.find(n => n.nr8 === adrNr8))
                        alleNumreMedKilde.push({ nr: adrNr, nr8: adrNr8, kilde: 'ADR', erMobil: erMobilnummer(adrNr8), erReservert });
                    if (erMobilnummer(adrNr8) && !alleTelefoner.includes(adrNr8)) alleTelefoner.push(adrNr8);
                    if (!telefon && erMobilnummer(adrNr8)) { telefon = adrNr; telefonKilde = 'ADR'; }
                }
            }
        }

        // Tider
        let fraTid = '', tilTid = '';
        const klarFraMatch = adminHtml.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        if (klarFraMatch) fraTid = klarFraMatch[1].trim();
        const oppmoteMatch = adminHtml.match(/tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        if (oppmoteMatch) tilTid = oppmoteMatch[1].trim();

        // Spesielle behov
        let spesielleBehov = '';
        const behovMatch = adminHtml.match(/Spesielle behov:<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
        if (behovMatch) {
            spesielleBehov = behovMatch[1].trim()
                .replace(/<br\s*\/?>/gi, ', ').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                .replace(/&oslash;/g, '\u00f8').replace(/&aelig;/g, '\u00e6').replace(/&aring;/g, '\u00e5')
                .replace(/\s+/g, ' ').trim();
            if (spesielleBehov.endsWith(',')) spesielleBehov = spesielleBehov.slice(0, -1).trim();
        }

        // Transportør
        const transpMatch = adminHtml.match(/Transport..?r:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        let transportor = transpMatch ? transpMatch[1].trim() : '';

        // Avtale-kode (for å detektere faktisk transportør ved delte avtaler som "Oslo Vanlig")
        const avtaleMatch = adminHtml.match(/Avtale:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        let avtaleKode = '';
        let avtaleNavn = '';
        if (avtaleMatch) {
            avtaleNavn = avtaleMatch[1].trim();
            const slashIdx = avtaleNavn.lastIndexOf('/');
            if (slashIdx >= 0) {
                // Normaliser mellomrom til punktum: "5.05.V.OUS Au.1" → "5.05.V.OUS.Au.1"
                avtaleKode = avtaleNavn.substring(slashIdx + 1).trim().replace(/\s+/g, '.');
            }
        }
        // Lookup: områdekode → faktisk transportør (for delte Oslo Vanlig-avtaler)
        const faktiskTransportor = OSLO_VANLIG_RUTING[avtaleKode] || null;
        if (faktiskTransportor && /norgestaxi\s*og\s*ct|ct\s*og\s*norgestaxi|oslo\s+vanlig/i.test(transportor)) {
            // Override generisk paraply-navn med faktisk ruting
            transportor = faktiskTransportor.navn;
        }

        // Løyve/Tur nr
        let loyveTur = '';
        let turId = turIdFallback || tripId || '';
        const loyveTurMatch = adminHtml.match(/L&oslash;yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                              adminHtml.match(/L\u00f8yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                              adminHtml.match(/yve\/Tur\s*nr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                              adminHtml.match(/yve\/Tur\s*nr[^:]*:\s*<\/[^>]*>\s*<[^>]*>\s*([^<]+)/i);
        if (loyveTurMatch) {
            const raw = loyveTurMatch[1].trim();
            const slashIdx = raw.indexOf('/');
            if (slashIdx > -1) { loyveTur = raw.substring(0, slashIdx).trim(); turId = raw.substring(slashIdx + 1).trim(); }
            else loyveTur = raw;
        }

        // Rekvisisjonsstatus
        const rekStatusMatch = adminHtml.match(/Rekvisisjonsstatus:<\/td>\s*<td[^>]*>\s*<b>\s*([^<]+)/i) ||
                               adminHtml.match(/Rekvisisjonsstatus:\s*<b>\s*([^<]+)/i);
        const rekStatus = rekStatusMatch ? rekStatusMatch[1].trim() : '';

        // Opprettet-tidspunkt
        const opprettetMatch = adminHtml.match(/Opprettet:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        let opprettetTid = opprettetMatch ? opprettetMatch[1].trim() : '';

        // fraTidMs
        let fraTidMs = null;
        if (fraTid) {
            const fp = fraTid.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2}):(\d{2})/);
            if (fp) { let aar = parseInt(fp[3]); if (aar < 100) aar += 2000; fraTidMs = new Date(aar, parseInt(fp[2])-1, parseInt(fp[1]), parseInt(fp[4]), parseInt(fp[5])).getTime(); }
        }

        // Melding til pasientreisekontoret (manuell justering)
        let meldingJustering = null;
        let meldingTilPRK = '';
        const meldingPRKMatch = adminHtml.match(/Melding til pasientreisekontoret:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
        if (meldingPRKMatch) {
            meldingTilPRK = meldingPRKMatch[1].replace(/\s+/g, ' ').trim();
            const val = parseInt(meldingTilPRK);
            if (!isNaN(val) && val !== 0 && /^[+-]?\d+$/.test(meldingTilPRK.trim())) meldingJustering = val;
        }

        // Melding til transportøren
        let meldingTilTransportor = '';
        const meldingTranspMatch = adminHtml.match(/Melding til transport[^:]*:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
        if (meldingTranspMatch) meldingTilTransportor = meldingTranspMatch[1].replace(/\s+/g, ' ').trim();

        // Geo-koordinater (UTM33)
        let henteGeoLatLng = null, leverGeoLatLng = null;
        const geoKoordMatches = [...adminHtml.matchAll(/Geo-koordinater[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
        if (geoKoordMatches.length > 0) {
            const parseUTM = (str) => { const m = str.match(/(\d{6,7})\s*\/?\s*(\d{5,6})/); return m ? utm33ToLatLng(parseInt(m[1]), parseInt(m[2])) : null; };
            henteGeoLatLng = parseUTM(geoKoordMatches[0][1]);
            if (geoKoordMatches[1]) leverGeoLatLng = parseUTM(geoKoordMatches[1][1]);
        }

        // SUTI-status (full parsing)
        let sutiStatus = {
            bestiltTid: null, bestiltMs: null, bestiltDato: null,
            sendtTid: null, sendtMs: null,
            bilTildelt: false, bilTildeltTid: null, bilTildeltMs: null,
            loeyve: null, bilFremme: false, bilFremmeTid: null, bilFremmeMs: null,
            bilFremmeGeo: null, bilPaaVeiGeo: null,
            hentet: false, hentetTid: null, levert: false,
            bomtur: false, avvist: false, erIA: false
        };
        const rekvLoggIdx = adminHtml.indexOf('Rekvisisjonslogg');
        if (rekvLoggIdx > -1) {
            const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 20000);
            const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
            if (newReqMatch) {
                sutiStatus.bestiltTid = newReqMatch[2];
                sutiStatus.bestiltDato = newReqMatch[1];
                const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                if (bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]), parseInt(bp[2])-1, parseInt(bp[1]), parseInt(bp[4]), parseInt(bp[5])).getTime();
            }
            // Tildelt-tid fra siste AddToResource i rekvisisjonsloggen (søk i hele adminHtml)
            const addResMatches = [...adminHtml.matchAll(/AddToResource\s*<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/g)];
            if (addResMatches.length > 0) {
                const siste = addResMatches[addResMatches.length - 1];
                sutiStatus.sendtTid = siste[2];
                const tp = siste[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                if (tp) sutiStatus.sendtMs = new Date(parseInt(tp[3]), parseInt(tp[2])-1, parseInt(tp[1]), parseInt(tp[4]), parseInt(tp[5])).getTime();
            }
        }
        const sutiIdx = adminHtml.indexOf('Suti kode');
        let sutiArea = sutiIdx > -1 ? adminHtml.substring(sutiIdx) : '';
        // Klipp bort alt etter <hr> — det er gamle ressurser
        const hrIdx = sutiArea.indexOf('<hr');
        if (hrIdx > -1) sutiArea = sutiArea.substring(0, hrIdx);
        let fremmeXmlId = null, paaVeiXmlId = null;
        if (sutiArea) {
            const alleRader = [];
            const radRegex = /<tr[^>]*>\s*([\s\S]*?)<\/tr>/gi;
            let radMatch;
            while ((radMatch = radRegex.exec(sutiArea)) !== null) {
                const rad = radMatch[1];
                const tidMatch = rad.match(/<nobr>(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})<\/nobr>/);
                if (!tidMatch) continue;
                const tidMs = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2])-1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]), parseInt(tidMatch[6])).getTime();
                const klokkeslett = `${tidMatch[4]}:${tidMatch[5]}`;
                alleRader.push({ rad, tidMs, klokkeslett });
            }
            alleRader.sort((a, b) => a.tidMs - b.tidMs);
            const tildelteTurNr = new Set(), bomturTurNr = new Set();
            sutiStatus.bomtur = false;
            for (const { rad, tidMs, klokkeslett } of alleRader) {
                const turNrMatch = rad.match(/<nobr>(\d{7,8})<\/nobr>/);
                const turNrSuti = turNrMatch ? turNrMatch[1] : null;
                if ((/NewResource/.test(rad) || /AssignToNextCA/.test(rad)) && /Tildelt/.test(rad)) {
                    // sendtTid/sendtMs settes fra rekvisisjonsloggen (AddToResource) — mer pålitelig
                    if (!sutiStatus.sendtMs) { sutiStatus.sendtTid = klokkeslett; sutiStatus.sendtMs = tidMs; }
                    if (turNrSuti) tildelteTurNr.add(turNrSuti);
                }
                if (/>\s*1703\b/.test(rad) || /Bomtur/.test(rad)) {
                    if (turNrSuti) bomturTurNr.add(turNrSuti);
                    sutiStatus.bilTildelt = false; sutiStatus.bilTildeltTid = null; sutiStatus.bilTildeltMs = null;
                    sutiStatus.bilFremme = false; sutiStatus.bilFremmeTid = null; sutiStatus.bilFremmeMs = null;
                    sutiStatus.loeyve = null; sutiStatus.hentet = false; sutiStatus.hentetTid = null;
                    fremmeXmlId = null; paaVeiXmlId = null;
                }
                if (!/Bekreftet/.test(rad)) continue;
                const xmlIdMatch = rad.match(/sutiXml\?id=(\d+)/);
                if (/>\s*3003\b/.test(rad)) {
                    sutiStatus.bilTildelt = true; sutiStatus.bilTildeltTid = klokkeslett; sutiStatus.bilTildeltMs = tidMs;
                    // Ny bil = nullstill fremme-data fra forrige bil
                    sutiStatus.bilFremme = false; sutiStatus.bilFremmeTid = null; sutiStatus.bilFremmeMs = null;
                    fremmeXmlId = null;
                    const lm = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                    if (lm) sutiStatus.loeyve = lm[1];
                    if (xmlIdMatch) paaVeiXmlId = xmlIdMatch[1];
                }
                if (/UpdateResource/.test(rad) && /Bekreftet/.test(rad)) {
                    const lm = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                    if (lm) sutiStatus.loeyve = lm[1];
                }
                if (/>\s*1709\b/.test(rad)) { sutiStatus.bilFremme = true; sutiStatus.bilFremmeTid = klokkeslett; sutiStatus.bilFremmeMs = tidMs; if (xmlIdMatch) fremmeXmlId = xmlIdMatch[1]; }
                if (/>\s*1701\b/.test(rad)) { sutiStatus.hentet = true; sutiStatus.hentetTid = klokkeslett; }
                if (/>\s*1702\b/.test(rad)) { sutiStatus.levert = true; }
                if (/>\s*1750\b/.test(rad)) sutiStatus.avvist = true;
            }
            if (bomturTurNr.size > 0) {
                const harAktivBil = [...tildelteTurNr].some(t => !bomturTurNr.has(t));
                sutiStatus.bomtur = !harAktivBil;
            }
            if (/>\s*IA\s*</.test(sutiArea)) sutiStatus.erIA = true;
        }

        // Geo fra SUTI XML (skip blacklistede transportører) — cached per xmlId
        const transportorLower = (transportor || '').toLowerCase();
        const hopOverGeo = CONFIG.GEO_BLACKLIST.some(b => transportorLower.includes(b));
        if (!hopOverGeo) {
            if (paaVeiXmlId) sutiStatus.bilPaaVeiGeo = await hentSutiXmlGeoCached(paaVeiXmlId);
            if (fremmeXmlId) sutiStatus.bilFremmeGeo = await hentSutiXmlGeoCached(fremmeXmlId);
        }

        // GeoAvstand
        let geoAvstand = null;
        if (henteGeoLatLng) {
            const bilGeo = sutiStatus.bilPaaVeiGeo || null;
            if (bilGeo) {
                const luftKm = haversine(parseFloat(bilGeo.lat), parseFloat(bilGeo.long), henteGeoLatLng.lat, henteGeoLatLng.lng);
                const est = estimerKjoretid(luftKm);
                geoAvstand = { luftKm: Math.round(luftKm * 10) / 10, veiKm: est.veiKm, minutter: est.minutter, kilde: sutiStatus.bilPaaVeiGeo ? '3003' : '4010' };
            }
        }

        // Avvikslogg + KMP/KMB/EPT/IFS — resId for søk-kort bestemmes senere, men vi kan bruke tripId som proxy
        const __sokResId = (typeof turIdFallback !== 'undefined' ? turIdFallback : null) || tripId;
        const { avviksLogg, sisteKontaktFraAvvik, sisteEPT, sisteIFS, eptAntall } = parseAvvikslogg(adminHtml, __sokResId);

        // SMS-logg fra ressurs
        let smsLoggRes = [];
        const resSmsIdx = adminHtml.indexOf('Ressurs, SMS logg');
        if (resSmsIdx > -1) {
            const searchArea = adminHtml.substring(resSmsIdx, resSmsIdx + 3000);
            const rowRegex = /<td>(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})<\/td>\s*<td>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>/gi;
            let match;
            while ((match = rowRegex.exec(searchArea)) !== null) {
                smsLoggRes.push({
                    tidspunkt: match[1].trim(), mottaker: match[2].trim(),
                    melding: (match[3]?.trim() || '').replace(/&aring;/g, '\u00e5').replace(/&aelig;/g, '\u00e6').replace(/&oslash;/g, '\u00f8')
                        .replace(/&Aring;/g, '\u00c5').replace(/&AElig;/g, '\u00c6').replace(/&Oslash;/g, '\u00d8')
                });
            }
        }
        const smsLogg = smsLoggRes;

        // SPOT-deteksjon
        let erSpot = false;
        const bestiltTidStr = sutiStatus.bestiltTid || opprettetTid;
        if (bestiltTidStr && fraTid) {
            const bestiltDatoStr = (sutiStatus.bestiltDato || opprettetTid || '').match(/(\d{1,2})\.(\d{1,2})/);
            const klarDatoStr = fraTid.match(/(\d{1,2})\.(\d{1,2})/);
            let sammeDag = true;
            if (bestiltDatoStr) {
                const idagDato = new Date();
                const bestiltDag = parseInt(bestiltDatoStr[1]), bestiltMnd = parseInt(bestiltDatoStr[2]);
                if (klarDatoStr) sammeDag = bestiltDag === parseInt(klarDatoStr[1]) && bestiltMnd === parseInt(klarDatoStr[2]);
                else sammeDag = bestiltDag === idagDato.getDate() && bestiltMnd === (idagDato.getMonth()+1);
            }
            if (sammeDag) {
                const parseMinutter = (str) => { const m = str.match(/(\d{1,2})[:.]\s*(\d{2})\s*$/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null; };
                const bestiltMin = parseMinutter(bestiltTidStr), klarMin = parseMinutter(fraTid);
                if (bestiltMin !== null && klarMin !== null && klarMin - bestiltMin < 25) erSpot = true;
            }
        }

        // SMS-terskel og forsinkelse
        let smsTerskel = erTur ? CONFIG.FORSINKELSE_TUR_MIN : CONFIG.FORSINKELSE_RETUR_MIN;
        let smsForsinkelse = fraTidMs ? Math.floor((nowMs - fraTidMs) / 60000) : 0;
        if (erSpot && erTur && sutiStatus.bestiltMs) {
            smsTerskel = CONFIG.FORSINKELSE_TUR_SPOT_MIN;
            smsForsinkelse = Math.floor((nowMs - sutiStatus.bestiltMs) / 60000);
        }
        if (meldingJustering !== null && meldingJustering < 0 && meldingJustering >= -15) smsTerskel += Math.abs(meldingJustering);

        // SMS-ID og runde
        const sokTripId = tripId;
        const idag = new Date().toISOString().split('T')[0];
        const retningStr = erTur ? 'TUR' : 'RETUR';
        let smsRunde = 1;
        const minSidenTerskel = smsForsinkelse - smsTerskel;
        if (minSidenTerskel > 0) smsRunde = 1 + Math.floor(minSidenTerskel / CONFIG.REPETER_INTERVALL_MIN);
        const smsId = `SOK_${sokTripId}_${idag}_${retningStr}_${smsRunde}`;
        const sokSendtIds = window._sendtIds || new Set();
        const sendtFraDb = sokSendtIds.has(smsId);

        // SMS-logg matching
        const normaliserTlfSok = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
        const smsTilPasient = smsLoggRes.filter(s => { const mn = normaliserTlfSok(s.mottaker); return alleTelefoner.some(tlf => tlf === mn); });
        let sisteSmsMinutterSiden = null, smsKilde = null;
        if (smsTilPasient.length > 0) {
            smsKilde = 'pasient';
            const sisteSms = smsTilPasient[smsTilPasient.length - 1];
            const tidM = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
            if (tidM) { const smsTid = new Date(parseInt(tidM[3]), parseInt(tidM[2]) - 1, parseInt(tidM[1]), parseInt(tidM[4]), parseInt(tidM[5])); sisteSmsMinutterSiden = Math.floor((nowDato - smsTid) / 60000); }
        } else if (smsLoggRes.length > 0) {
            smsKilde = 'ressurs';
            const sisteSms = smsLoggRes[smsLoggRes.length - 1];
            const tidM = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
            if (tidM) { const smsTid = new Date(parseInt(tidM[3]), parseInt(tidM[2]) - 1, parseInt(tidM[1]), parseInt(tidM[4]), parseInt(tidM[5])); sisteSmsMinutterSiden = Math.floor((nowDato - smsTid) / 60000); }
        }
        const alleredeSendt = sendtFraDb || smsTilPasient.length > 0;

        // Kontakt-info
        const sokKontaktData = window._kontaktData || new Map();
        const kontaktInfo = sokKontaktData.get(`SOK_${sokTripId}`);
        let sistKontaktTid = null, sistKontaktMinSiden = null, sistKontaktType = null;
        if (sisteKontaktFraAvvik) {
            sistKontaktTid = sisteKontaktFraAvvik.tid; sistKontaktType = sisteKontaktFraAvvik.type;
            sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, nowDato);
        } else if (kontaktInfo && kontaktInfo.tidspunkt) {
            sistKontaktTid = kontaktInfo.tidspunkt;
            sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, nowDato);
        }

        // kanSendeSms
        let minTilSms, kanSendeSms = false;
        let tellerFraMinSiden = sisteSmsMinutterSiden;
        if (sistKontaktMinSiden !== null && (tellerFraMinSiden === null || sistKontaktMinSiden < tellerFraMinSiden)) tellerFraMinSiden = sistKontaktMinSiden;
        if (smsLoggRes.length === 0 && !sendtFraDb && !kontaktInfo && !sisteKontaktFraAvvik) {
            minTilSms = smsTerskel - smsForsinkelse; kanSendeSms = minTilSms <= 0 && !!telefon;
        } else if (tellerFraMinSiden !== null) {
            minTilSms = CONFIG.REPETER_INTERVALL_MIN - tellerFraMinSiden; kanSendeSms = minTilSms <= 0 && !!telefon;
        } else { minTilSms = CONFIG.REPETER_INTERVALL_MIN; kanSendeSms = false; }
        if (sutiStatus.erIA) kanSendeSms = false;

        const harUmatchetSms = smsLoggRes.length > 0 && smsTilPasient.length === 0;
        let avviksGrunner = [];
        if (sutiStatus.erIA) avviksGrunner.push('\ud83d\udfe3 IA - kontakt behandler');
        if (!telefon) avviksGrunner.push('\ud83d\udcf5 Mangler mobilnummer');

        // Etterlysning
        const effektivForsinkelse = fraTidMs ? Math.floor((nowMs - fraTidMs) / 60000) : smsForsinkelse;
        let etterlysTerskel = getEtterlysTerskel(erTur, erSpot);
        let etterlyseTidspunkt = 0;
        if (!erTur && fraTidMs) {
            const seneste = sutiStatus.sendtMs ? Math.max(fraTidMs, sutiStatus.sendtMs) : fraTidMs;
            etterlyseTidspunkt = seneste + etterlysTerskel * 60000;
        } else if (sutiStatus.sendtMs && fraTidMs) {
            const tildeltPluss = sutiStatus.sendtMs + etterlysTerskel * 60000;
            etterlyseTidspunkt = tildeltPluss >= fraTidMs ? tildeltPluss : fraTidMs + etterlysTerskel * 60000;
        } else {
            etterlyseTidspunkt = fraTidMs ? fraTidMs + etterlysTerskel * 60000 : 0;
        }
        const etterlyseForsinkelse = etterlyseTidspunkt ? Math.floor((nowMs - etterlyseTidspunkt) / 60000) : effektivForsinkelse;
        const harEPT = !!sisteEPT, harIFS = !!sisteIFS;
        let sistEPTMinSiden = null, sistIFSMinSiden = null;
        if (sisteEPT) sistEPTMinSiden = tidTilMinutterSiden(sisteEPT.tid, nowDato);
        if (sisteIFS) sistIFSMinSiden = tidTilMinutterSiden(sisteIFS.tid, nowDato);
        const ifsEtterEPT = harIFS && harEPT && sistIFSMinSiden !== null && sistEPTMinSiden !== null && sistIFSMinSiden <= sistEPTMinSiden;
        let etterlysStatus, minTilNesteEtterlysning;
        if (sutiStatus.bilFremme || sutiStatus.hentet) { etterlysStatus = 'besvart'; minTilNesteEtterlysning = 0; }
        else if (ifsEtterEPT) { etterlysStatus = 'besvart'; minTilNesteEtterlysning = 0; }
        else if (harEPT && sistEPTMinSiden !== null) { minTilNesteEtterlysning = CONFIG.ETTERLYSE_REPETER_MIN - sistEPTMinSiden; etterlysStatus = minTilNesteEtterlysning <= 0 ? 'etterlyse' : 'etterlyst'; }
        else if (etterlyseForsinkelse >= 0) { etterlysStatus = 'etterlyse'; minTilNesteEtterlysning = 0; }
        else { etterlysStatus = 'venter'; minTilNesteEtterlysning = -etterlyseForsinkelse; }
        const kanEtterlyse = etterlysStatus === 'etterlyse';

        // ResId
        let sokResId = turId || tripId;

        return {
            reqId: `SOK_${sokTripId}`, resId: sokResId,
            nissyReqId: adminId, nissyTripId: sokTripId,
            navn, telefon, telefonKilde, folkregAdresse, folkregPoststed: '',
            alleTelefoner, alleNumreMedKilde, harIkkeSms,
            rekNr, rekStatus, pnr, fraTid, fraTidMs, tilTid, erTur,
            henteAdresse, henteAdresseFull, leveringsAdresse, leveringsAdresseFull,
            henteGeoLatLng, leverGeoLatLng, geoAvstand,
            transportor, avtaleKode, avtaleNavn, loyveTur: loyveTur || sutiStatus.loeyve || '', turId,
            spesielleBehov, smsTerskel, smsId, smsRunde, alleredeSendt, minTilSms,
            kanSendeSms, manglerTelefon: !telefon, harUmatchetSms, avviksGrunner,
            smsLogg, smsLoggRes, avviksLogg, sutiStatus, opprettetTid,
            erSpot, erIA: sutiStatus.erIA, bestiltMs: sutiStatus.bestiltMs,
            smsForsinkelse, meldingJustering, meldingTilPRK, meldingTilTransportor,
            sistKontaktTid, sistKontaktType,
            etterlysTerskel, etterlyseForsinkelse, kanEtterlyse,
            harEPT, sisteEPT, eptAntall, harIFS, sisteIFS, sistEPTMinSiden, sistIFSMinSiden,
            minTilNesteEtterlysning, etterlysStatus,
            forsinkelse: smsForsinkelse,
            startTid: fraTid || '', startTidMs: fraTidMs || null,
            erSok: true, sokVerdi, sokType
        };
    }

    // === Hovedanalyse ===
    async function kjorAnalyse() {
        sjekkVindu();
        // Send heartbeat til popup via BroadcastChannel
        ovrChannel.postMessage({ type: 'HEARTBEAT' });
        window.smsStats.kjoreringer++;
        window.smsStats.sistOppdatert = Date.now();

        // Vis spinner
        const win = window.smsWin;
        if (win && !win.closed) {
            const spinner = win.document.getElementById('spinner');
            if (spinner) spinner.classList.remove('hidden');
        }
        
        addDebugLog('=== Starter analyse v5.15 ===');
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  SJEKK ADMIN-INNLOGGING                                        \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        try {
            const testUrl = 'https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=1&db=1&tripid=1';
            const testRes = await fetch(testUrl);
            const testHtml = await testRes.text();
            
            // Sjekk om vi f\u00e5r login-side eller feilmelding
            if (testHtml.includes('login') || testHtml.includes('Logg inn') || testHtml.includes('ikke tilgang') || testRes.status === 401 || testRes.status === 403) {
                addDebugLog('\u274c Ikke logget inn p\u00e5 admin!');
                const win = window.smsWin;
                if (win && !win.closed) {
                    const spinner = win.document.getElementById('spinner');
                    if (spinner) spinner.classList.add('hidden');
                    const container = win.document.getElementById('container');
                    if (container) {
                        container.innerHTML = `
                            <div style="background:var(--bg-avvik); border:2px solid #ef4444; border-radius:10px; padding:30px; text-align:center; margin:20px;">
                                <div style="font-size:48px; margin-bottom:15px;">\ud83d\udd10</div>
                                <h2 style="color:var(--text-avvik, #991b1b); margin:0 0 10px;">Ikke logget inn p\u00e5 Admin</h2>
                                <p style="color:var(--text-avvik, #7f1d1d); margin:0 0 20px;">Du m\u00e5 v\u00e6re logget inn p\u00e5 admin-siden for at skriptet skal fungere.</p>
                                <a href="https://pastrans-sorost.mq.nhn.no/administrasjon/" target="_blank" 
                                   style="display:inline-block; background:#3b82f6; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                   \u00c5pne Admin-siden
                                </a>
                                <p style="color:var(--text-sek); margin-top:15px; font-size:12px;">Logg inn og klikk "Oppdater n\u00e5" for \u00e5 pr\u00f8ve igjen.</p>
                            </div>
                        `;
                    }
                }
                return;
            }
        } catch (e) {
            addDebugLog(`\u274c Kunne ikke sjekke admin-tilgang: ${e.message}`);
        }
        
        const t = Date.now();
        const now = new Date();
        const nowMs = now.getTime();
        const kandidater = [];
        
        try {
            const dbg = window._dbgFiltre || { status: true, terskel: true, bomtur: true, avtale: true };

            // Hent tidligere sendte SMS fra IndexedDB
            const tidligereSendt = await window.smsDB.getAll();
            const sendtIds = new Set(tidligereSendt.filter(s => s.type === 'sms' || !s.type).map(s => s.id));
            window._sendtIds = sendtIds; // Tilgjengelig for s\u00f8k-handler

            // Hent overstyringer fra DB
            const alleOverstyringer = await window.ovrDB.getAll();
            const idag = new Date().toISOString().split('T')[0];
            // Rens gamle overstyringer (ikke fra i dag)
            for (const ovr of alleOverstyringer) {
                if (ovr.dato !== idag) await window.ovrDB.delete(ovr.id);
            }
            const overstyringer = new Map();
            alleOverstyringer.filter(o => o.dato === idag).forEach(o => overstyringer.set(o.id, o));

            // Hent sist kontakt-data fra DB (type='kontakt')
            const kontaktData = new Map();
            tidligereSendt.filter(s => s.type === 'kontakt').forEach(k => {
                kontaktData.set(k.reqId, k);
            });
            window._kontaktData = kontaktData; // Tilgjengelig for s\u00f8k-handler

            addDebugLog(`Lastet ${sendtIds.size} SMS, ${kontaktData.size} kontakt-registreringer`);
            
            // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
            // \u2551  STEG 1: Hent p\u00e5g\u00e5ende oppdrag og filtrer p\u00e5 starttid          \u2551
            // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
            // Les NISSY sin cookie og s\u00f8kefelt F\u00d8R v\u00e5r fetch (for \u00e5 restaurere etterpå)
            const nissyCookie = document.cookie.match(/thwerfilter=(\d+)/);
            const nissyFilterFra = nissyCookie ? nissyCookie[1] : null;
            const nissySearchInput = document.querySelector('#freeTextSearch')
                || document.querySelector('input[name="search"]')
                || document.querySelector('input[name="freeText"]');
            const nissySearch = nissySearchInput ? nissySearchInput.value.trim() : null;
            const searchParam = nissySearch !== null ? `&search=${encodeURIComponent(nissySearch)}` : '';
            addDebugLog(`S\u00f8kefelt: element=${nissySearchInput ? nissySearchInput.id || nissySearchInput.name || 'ukjent' : 'IKKE FUNNET'}, verdi="${nissySearch || ''}"`);

            // Varsel i popup hvis søkefelt har verdi
            if (window.smsWin && !window.smsWin.closed) {
                const sokVarsel = window.smsWin.document.getElementById('sok-varsel');
                if (sokVarsel) {
                    if (nissySearch) {
                        sokVarsel.style.display = 'block';
                        sokVarsel.innerHTML = '\u26a0\ufe0f Aktivt s\u00f8k: <strong>' + nissySearch + '</strong> \u2014 klikk for \u00e5 fjerne';
                    } else {
                        sokVarsel.style.display = 'none';
                    }
                }
            }

            // Hent data med Overv\u00e5ker-filteret
            const url = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?did=all&action=openres&rid=-1${searchParam}&rfilter=${aktivtRfilter}&t=${t}`;
            addDebugLog(`Filter ${aktivtRfilter} | NISSY cookie=${nissyFilterFra || '?'}`);

            const res = await fetch(url);
            const buffer = await res.arrayBuffer();
            const xmlText = new TextDecoder('iso-8859-1').decode(buffer);
            const xml = new DOMParser().parseFromString(xmlText, "text/xml");

            // Restaurer NISSY sin sesjon (både server og cookie)
            if (nissyFilterFra && nissyFilterFra !== String(aktivtRfilter)) {
                try {
                    await fetch(`https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?did=all&rfilter=${nissyFilterFra}&t=${Date.now()}`);
                } catch(e) {}
                document.cookie = `thwerfilter=${nissyFilterFra}; path=/`;
            }
            
            // Parse p\u00e5g\u00e5ende oppdrag
            const reiserFraTabell = [];
            let totaltPagaende = 0;
            const statusTelling = {}; // Debug: tell statuser
            
            const dbgAnyOff = dbg && (!dbg.status || !dbg.terskel || !dbg.bomtur || !dbg.avtale);
            xml.querySelectorAll('response').forEach(resp => {
                const fane = resp.getAttribute('id');
                if (fane !== "paagaaendeOppdrag") return;
                
                const d = document.createElement('div'); 
                d.innerHTML = resp.textContent;
                
                const headerRow = d.querySelector('tr.tbh');
                if (!headerRow) return;
                
                const h = Array.from(headerRow.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
                const idx = { 
                    navn: h.findIndex(s => s.includes("NAVN")), 
                    start: h.findIndex(s => s.includes("START")),
                    status: h.findIndex(s => s.includes("STATUS"))
                };

                d.querySelectorAll('tbody tr[name]').forEach(tr => {
                    totaltPagaende++;
                    
                    // Hent resId og ALLE reqId-er (for samkj\u00f8ringer)
                    const resId = tr.getAttribute('name');
                    const reqIdMatches = tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g);
                    const alleReqIds = [...reqIdMatches].map(m => m[1]);
                    if (alleReqIds.length === 0) return;
                    
                    // Hent starttid fra tabellen
                    const startCelle = idx.start >= 0 ? tr.cells[idx.start] : null;
                    const statusCelle = idx.status >= 0 ? tr.cells[idx.status] : null;
                    const navnCelle = idx.navn >= 0 ? tr.cells[idx.navn] : null;
                    
                    const navnFraTabell = navnCelle?.textContent.trim() || "Ukjent";
                    
                    // Hent statuser per pasient (samkj\u00f8ring har div-er per passasjer)
                    const statusDivs = statusCelle?.querySelectorAll('div') || [];
                    const statusPerPasient = statusDivs.length > 0 
                        ? [...statusDivs].map(d => d.textContent.trim())
                        : [statusCelle?.textContent.trim() || ""];
                    
                    // Hent starttider per pasient (samkj\u00f8ring har div-er med individuelle tider)
                    const startDivs = startCelle?.querySelectorAll('div') || [];
                    const startPerPasient = startDivs.length > 0
                        ? [...startDivs].map(d => d.textContent.trim())
                        : [startCelle?.textContent.trim() || ""];
                    
                    // Felles starttid som fallback
                    const startRaw = startCelle?.textContent.trim() || "";
                    const fellesStartTidMs = parseKortTid(startRaw);
                    
                    // Statusfiltrering skjer per pasient i loopen nedenfor
                    
                    // Parse starttid (felles fallback)
                    const startTidMs = fellesStartTidMs;
                    if (!startTidMs) return;
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  KRITISK FILTER: Kun reiser der starttid har PASSERT       \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    // For samkj\u00f8ring sjekkes individuelt per pasient nedenfor
                    if (startDivs.length === 0 && startTidMs > nowMs) {
                        return;
                    }
                    
                    // Beregn forsinkelse i minutter (felles fallback)
                    const forsinkelse = Math.floor((nowMs - startTidMs) / 60000);
                    
                    // For enkeltreiser: sjekk minimum forsinkelse
                    if (startDivs.length === 0 && forsinkelse < CONFIG.VIS_TUR_FRA_MIN) return;
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  SAMKJ\u00d8RING: Opprett \u00e9n kandidat per rekvisisjon           \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    const erSamkjoring = alleReqIds.length > 1;
                    
                    alleReqIds.forEach((reqId, idx) => {
                        // Hent status for denne pasienten (idx matcher div-rekkef\u00f8lgen)
                        const status = statusPerPasient[idx] || statusPerPasient[0] || "";
                        
                        // Filtrer ut helsebuss-statuser der pasienten ikke lenger venter
                        const statusLower = status.toLowerCase();
                        statusTelling[statusLower] = (statusTelling[statusLower] || 0) + 1;
                        if (dbg.status && ['framme', 'ikke m\u00f8tt', 'startet'].includes(statusLower)) return;
                        
                        // Hent individuell starttid for denne pasienten
                        const pasientStartRaw = startPerPasient[idx] || startPerPasient[0] || startRaw;
                        const pasientStartTidMs = parseKortTid(pasientStartRaw) || startTidMs;
                        
                        // Individuell filtrering
                        if (pasientStartTidMs > nowMs) return;
                        const pasientForsinkelse = Math.floor((nowMs - pasientStartTidMs) / 60000);
                        if (pasientForsinkelse < CONFIG.VIS_TUR_FRA_MIN) return;
                        
                        reiserFraTabell.push({
                            reqId,
                            resId,
                            navn: navnFraTabell,
                            startTid: formaterTid(pasientStartTidMs),
                            startTidMs: pasientStartTidMs,
                            forsinkelse: pasientForsinkelse,
                            status,
                            erSamkjoring,
                            samkjoringAntall: alleReqIds.length,
                            samkjoringNr: idx + 1
                        });
                    });
                });
            });
            
            window.smsStats.totaleReiser = totaltPagaende;
            window.smsStats.filtrerteReiser = reiserFraTabell.length;
            window.smsReiserFraTabell = reiserFraTabell; // Lagre for ventende-visning

            const statusStr = Object.entries(statusTelling).map(([s,n]) => `${s}:${n}`).join(', ');
            addDebugLog(`Filter ${aktivtRfilter} | Dispatch: ${totaltPagaende} → ${reiserFraTabell.length} reiser | ${statusStr}`);
            
            if (reiserFraTabell.length === 0) {
                addDebugLog('Ingen reiser \u00e5 sjekke');
                oppdaterStats();
                oppdaterVisning([]);
                return;
            }
            
            // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
            // \u2551  STEG 2: Hent detaljer fra admin AJAX for hver kandidat        \u2551
            // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
            // Rydd admin-cache: fjern turer som ikke lenger er i listen
            ryddAdminCache(reiserFraTabell.map(r => `${r.reqId}_${r.resId}`));
            const _cyclePre = { ..._cacheStats };
            addDebugLog(`Henter detaljer for ${reiserFraTabell.length} reiser...`);
            const adminFilterTelling = { rekStartet: 0, rekFramme: 0, rekIkkeMott: 0, overstyrt: 0, bomtur: 0, terskel: 0 };

            for (const reise of reiserFraTabell) {
                try {

                    // Hent admin-detaljer via cache (returnerer cached HTML hvis fersk + uendret)
                    const adminHtml = await hentAdminHtmlCached(reise.reqId, reise.resId, reise.status, reise.startTidMs);

                    const adminDoc = new DOMParser().parseFromString(adminHtml, 'text/html');
                    
                    // Parse ut data fra admin-responsen
                    let telefon = null;
                    let telefonKilde = "";
                    let alleTelefoner = []; // Alle telefonnumre for SMS-logg matching
                    let alleNumreMedKilde = []; // Alle numre med kilde og reservasjonsstatus for visning
                    let harIkkeSms = false; // Pasient reservert mot SMS
                    let fraTid = "";
                    let tilTid = "";
                    let rekNr = "";
                    let pnr = "";
                    let pasientNavn = reise.navn; // Fallback
                    
                    // Hent pasientnavn fra admin
                    const navnMatch = adminHtml.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    if (navnMatch && navnMatch[1].trim()) {
                        pasientNavn = navnMatch[1].trim().replace(/\s+/g, ' '); // Fjern ekstra whitespace
                    }
                    
                    // Hent telefon - pr\u00f8v flere kilder i prioritert rekkef\u00f8lge
                    // HTML-struktur: <td align="right">Mobilnr:</td>\n<td>+4790028006\n</td>
                    // Kan ogs\u00e5 inneholde "(Reservert mot SMS varsel)" etter nummeret
                    // NB: >Mobilnr: krever at "Mobilnr:" er starten av celleinnhold (unng\u00e5r treff p\u00e5 "Behandlers Mobilnr:")
                    const mobilMatch = adminHtml.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const mobilEpjMatch = adminHtml.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const mobil2Match = adminHtml.match(/>Mobilnr \(2\):<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const ringVedAnkomstMatch = adminHtml.match(/Ring ved ankomst:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const ringVedAnkomstHentestedMatch = adminHtml.match(/Ring ved ankomst hentested:<\/td>\s*<td[^>]*>\s*([^<]+)/i);

                    // Samle alle gyldige telefonnumre (uten generisk Telefon: - legges til retningsbevisst etter erTur)
                    const telefonKandidater = [
                        { match: mobilMatch, kilde: 'MOB' },
                        { match: mobilEpjMatch, kilde: 'EPJ' },
                        { match: mobil2Match, kilde: 'MOB2' },
                        { match: ringVedAnkomstHentestedMatch, kilde: 'RING-H' },
                        { match: ringVedAnkomstMatch, kilde: 'RING' }
                    ];
                    
                    for (const kandidat of telefonKandidater) {
                        if (kandidat.match && kandidat.match[1].trim()) {
                            const rawTekst = kandidat.match[1].trim();
                            const erReservert = /reservert|ikke\s*sms/i.test(rawTekst);
                            if (erReservert) harIkkeSms = true;
                            
                            const nr = normaliserTelefon(rawTekst);
                            if (nr && nr !== '(mangler)' && !/^sms$/i.test(rawTekst)) {
                                const normNr = nr.replace(/[\s+\-]/g, '').slice(-8);
                                if (normNr.length === 8) {
                                    // Legg til i alleNumreMedKilde for visning
                                    if (!alleNumreMedKilde.find(n => n.nr8 === normNr)) {
                                        alleNumreMedKilde.push({
                                            nr: nr,
                                            nr8: normNr,
                                            kilde: kandidat.kilde,
                                            erMobil: erMobilnummer(normNr),
                                            erReservert: erReservert
                                        });
                                    }
                                    
                                    // Kun mobilnumre (4xx/9xx) legges til for SMS
                                    if (erMobilnummer(normNr) && !alleTelefoner.includes(normNr)) {
                                        alleTelefoner.push(normNr);
                                    }
                                    // Sett prim\u00e6r telefon kun hvis det er mobilnummer
                                    if (!telefon && erMobilnummer(normNr)) {
                                        telefon = nr;
                                        telefonKilde = kandidat.kilde;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Hent personnummer
                    const pnrMatch = adminHtml.match(/Personnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i);
                    if (pnrMatch) pnr = pnrMatch[1];
                    
                    // Debug: logg hvis ingen telefon funnet
                    if (!telefon) {
                        // S\u00f8k etter alle telefon-lignende felt i admin-HTML
                        const tlfDebug = adminHtml.match(/(?:Tlf|Telefon|Mob|Ring)[^<]*<\/td>\s*<td[^>]*>[^<]*/gi);
                        addDebugLog(`\ud83d\udcf5 ${pasientNavn} mangler mob. Tlf-felt funnet: ${tlfDebug ? tlfDebug.map(m => m.replace(/<[^>]*>/g, '').trim()).join(' | ') : 'INGEN'}`);
                    }
                    
                    // Hent rekvisisjonsnummer
                    // Format: Rekvisisjon:</td><td><b>261030206281</b>
                    const rekMatch = adminHtml.match(/Rekvisisjon:<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i) ||
                                     adminHtml.match(/Rekvisisjon\s*(?:nr)?[:\s]*(\d{12})/i) ||
                                     adminHtml.match(/>(\d{12})<\/b>/);
                    if (rekMatch) rekNr = rekMatch[1];
                    
                    // Hent rekvisisjonsstatus (Framme, Akseptert, Startet, Ikke m\u00f8tt, etc.)
                    const rekStatusMatch = adminHtml.match(/Rekvisisjonsstatus:<\/td>\s*<td[^>]*>\s*<b>\s*([^<]+)/i) ||
                                           adminHtml.match(/Rekvisisjonsstatus:\s*<b>\s*([^<]+)/i);
                    const rekStatus = rekStatusMatch ? rekStatusMatch[1].trim() : '';
                    
                    // Filtrer ut basert p\u00e5 rekvisisjonsstatus fra admin
                    const rekStatusLower = rekStatus.toLowerCase();
                    if (dbg.status && ['framme', 'ikke m\u00f8tt', 'startet'].includes(rekStatusLower)) {
                        if (rekStatusLower === 'startet') adminFilterTelling.rekStartet++;
                        else if (rekStatusLower === 'framme') adminFilterTelling.rekFramme++;
                        else adminFilterTelling.rekIkkeMott++;
                        continue;
                    }
                    
                    // Hent Pasient klar fra og Oppm\u00f8tetidspunkt
                    const klarFraMatch = adminHtml.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const oppmoteMatch = adminHtml.match(/Oppm..teledetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                         adminHtml.match(/Oppm\u00f8tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                         adminHtml.match(/Oppm&oslash;tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    
                    // Hent Opprettet-tidspunkt (bestilt)
                    const opprettetMatch = adminHtml.match(/Opprettet:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    let opprettetTid = opprettetMatch ? opprettetMatch[1].trim() : '';
                    
                    if (klarFraMatch) fraTid = klarFraMatch[1].trim();
                    if (oppmoteMatch) tilTid = oppmoteMatch[1].trim();
                    
                    // Parse fraTid til full timestamp (format: DD.MM.YY HH:MM eller DD.MM.YYYY HH:MM)
                    let fraTidMs = null;
                    if (fraTid) {
                        const fp = fraTid.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2}):(\d{2})/);
                        if (fp) {
                            let aar = parseInt(fp[3]);
                            if (aar < 100) aar += 2000;
                            fraTidMs = new Date(aar, parseInt(fp[2])-1, parseInt(fp[1]), parseInt(fp[4]), parseInt(fp[5])).getTime();
                        }
                    }
                    
                    // Hent "Melding til pasientreisekontoret" (manuell justering, f.eks. -29 eller +35)
                    let meldingJustering = null;
                    let meldingTilPRK = '';
                    const meldingPRKMatch = adminHtml.match(/Melding til pasientreisekontoret:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
                    if (meldingPRKMatch) {
                        meldingTilPRK = meldingPRKMatch[1].replace(/\s+/g, ' ').trim();
                        const val = parseInt(meldingTilPRK);
                        if (!isNaN(val) && val !== 0 && /^[+-]?\d+$/.test(meldingTilPRK.trim())) meldingJustering = val;
                    }
                    
                    // Hent "Melding til transport\u00f8ren"
                    let meldingTilTransportor = '';
                    const meldingTranspMatch = adminHtml.match(/Melding til transport[^:]*:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
                    if (meldingTranspMatch) {
                        meldingTilTransportor = meldingTranspMatch[1].replace(/\s+/g, ' ').trim();
                    }
                    // Hent transport\u00f8r og l\u00f8yve/tur fra "Transport\u00f8r/ressurs" seksjonen
                    let transportor = '';
                    let loyveTur = '';
                    let turId = '';
                    
                    const transportorMatch = adminHtml.match(/Transport&oslash;r:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                            adminHtml.match(/Transport\u00f8r:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    if (transportorMatch) {
                        transportor = transportorMatch[1].trim()
                            .replace(/&oslash;/g, '\u00f8')
                            .replace(/&aelig;/g, '\u00e6')
                            .replace(/&aring;/g, '\u00e5');
                    }

                    // Avtale-kode for å detektere faktisk transportør ved delte avtaler
                    let avtaleKode = '';
                    let avtaleNavn = '';
                    const avtaleMatch = adminHtml.match(/Avtale:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    if (avtaleMatch) {
                        avtaleNavn = avtaleMatch[1].trim();
                        const slashIdx = avtaleNavn.lastIndexOf('/');
                        if (slashIdx >= 0) {
                            avtaleKode = avtaleNavn.substring(slashIdx + 1).trim().replace(/\s+/g, '.');
                        }
                    }
                    const faktiskTr = OSLO_VANLIG_RUTING[avtaleKode] || null;
                    if (faktiskTr && /norgestaxi\s*og\s*ct|ct\s*og\s*norgestaxi|oslo\s+vanlig/i.test(transportor)) {
                        transportor = faktiskTr.navn;
                    }

                    // Konfigurerbar ekskludering (MySQL-basert)
                    if (dbg.avtale) {
                        const ekskl = skalEkskluderes({ avtale: avtaleNavn, transportor, loeyve: '' });
                        if (ekskl) {
                            addDebugLog(`\u26d4 ${pasientNavn} ekskludert: avtale/transportør matcher "${ekskl}"`);
                            continue;
                        }
                    }
                    
                    const loyveTurMatch = adminHtml.match(/L&oslash;yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                          adminHtml.match(/L\u00f8yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    if (loyveTurMatch) {
                        const raw = loyveTurMatch[1].trim();
                        const slashIdx = raw.indexOf('/');
                        if (slashIdx > -1) {
                            loyveTur = raw.substring(0, slashIdx).trim();
                            turId = raw.substring(slashIdx + 1).trim();
                        } else {
                            loyveTur = raw;
                        }
                    }
                    
                    // Hent spesielle behov
                    let spesielleBehov = '';
                    const behovMatch = adminHtml.match(/Spesielle behov:<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
                    if (behovMatch) {
                        spesielleBehov = behovMatch[1].trim()
                            .replace(/<br\s*\/?>/gi, ', ')
                            .replace(/<[^>]*>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&oslash;/g, '\u00f8')
                            .replace(/&aelig;/g, '\u00e6')
                            .replace(/&aring;/g, '\u00e5')
                            .replace(/\s+/g, ' ')
                            .trim();
                        // Fjern trailing komma
                        if (spesielleBehov.endsWith(',')) {
                            spesielleBehov = spesielleBehov.slice(0, -1).trim();
                        }
                    }
                    
                    // Hent folkeregistrert adresse (fra <legend class="fieldname">Pasient</legend> seksjonen)
                    let folkregAdresse = '';
                    let folkregPoststed = '';
                    const pasientLegendIdx = adminHtml.search(/<legend[^>]*>Pasient<\/legend>/i);
                    const hentestedLegendIdx = adminHtml.search(/<legend[^>]*>Hentested<\/legend>/i);
                    if (pasientLegendIdx > -1 && hentestedLegendIdx > pasientLegendIdx) {
                        const pasientSeksjon = adminHtml.substring(pasientLegendIdx, hentestedLegendIdx);
                        const folkAddrMatch = pasientSeksjon.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                        const folkPostMatch = pasientSeksjon.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                        if (folkPostMatch && folkPostMatch[1].trim()) {
                            folkregPoststed = folkPostMatch[1].trim();
                        }
                        if (folkAddrMatch && folkAddrMatch[1].trim()) {
                            folkregAdresse = folkAddrMatch[1].trim();
                            if (folkPostMatch && folkPostMatch[1].trim()) {
                                folkregAdresse += ', ' + folkPostMatch[1].trim();
                            }
                        }
                    }

                    // Hent henteadresse for Google Maps-rute (full adresse med navn og kommentar)
                    let henteAdresse = "";
                    let henteAdresseFull = "";
                    const hentestedet = adminHtml.match(/Hentested<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                    if (hentestedet) {
                        const navn = hentestedet[1].trim();
                        const adresse = hentestedet[2].trim();
                        const postSted = hentestedet[3].trim();
                        const telefon = hentestedet[4].trim();
                        const kommentar = hentestedet[5].trim();
                        
                        henteAdresse = `${adresse}, ${postSted}`; // For Google Maps
                        
                        // Full adresse for visning
                        let deler = [];
                        deler.push(navn || '\u00a0'); // Alltid en navn-linje (nbsp hvis tom)
                        if (adresse) deler.push(adresse);
                        if (postSted) deler.push(postSted);
                        if (telefon) deler.push(fmtTlf(telefon));
                        if (kommentar) deler.push(`(${kommentar})`);
                        henteAdresseFull = deler.join('\n');
                    }
                    
                    // Hent leveringsadresse (full adresse med navn og kommentar)
                    let leveringsAdresse = "";
                    let leveringsAdresseFull = "";
                    const leveringsstedet = adminHtml.match(/Leveringssted<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                    if (leveringsstedet) {
                        const navn = leveringsstedet[1].trim();
                        const adresse = leveringsstedet[2].trim();
                        const postSted = leveringsstedet[3].trim();
                        const telefon = leveringsstedet[4].trim();
                        const kommentar = leveringsstedet[5].trim();
                        
                        leveringsAdresse = `${adresse}, ${postSted}`; // For Google Maps
                        
                        // Full adresse for visning
                        let deler = [];
                        deler.push(navn || '\u00a0'); // Alltid en navn-linje (nbsp hvis tom)
                        if (adresse) deler.push(adresse);
                        if (postSted) deler.push(postSted);
                        if (telefon) deler.push(fmtTlf(telefon));
                        if (kommentar) deler.push(`(${kommentar})`);
                        leveringsAdresseFull = deler.join('\n');
                    }
                    
                    // Hent geo-koordinater (UTM33) fra hente- og leveringssted i plakat
                    let henteGeoLatLng = null;
                    let leverGeoLatLng = null;
                    const geoKoordMatches = [...adminHtml.matchAll(/Geo-koordinater[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
                    if (geoKoordMatches.length > 0) {
                        const parseUTM = (str) => {
                            const m = str.match(/(\d{6,7})\s*\/?\s*(\d{5,6})/);
                            return m ? utm33ToLatLng(parseInt(m[1]), parseInt(m[2])) : null;
                        };
                        henteGeoLatLng = parseUTM(geoKoordMatches[0][1]);
                        if (geoKoordMatches[1]) leverGeoLatLng = parseUTM(geoKoordMatches[1][1]);
                    }
                    
                    // Bestem TUR/RETUR basert p\u00e5 "Til / Fra behandling"
                    const retningMatch = adminHtml.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
                    let erTur = retningMatch && retningMatch[1].trim().toLowerCase().includes('til behandling');
                    
                    // Appliser overstyringer fra DB
                    const ovr = overstyringer.get(reise.reqId);
                    if (ovr) {
                        if (dbg.status && ovr.type === 'ignorer') {
                            adminFilterTelling.overstyrt++;
                            continue;
                        }
                        if (ovr.type === 'retning') {
                            erTur = ovr.erTur;
                            addDebugLog(`\u2194 ${pasientNavn} - Overstyrt retning: ${erTur ? 'TUR' : 'RETUR'}`);
                        }
                    }

                    // Legg til adresse-telefon retningsbevisst: TUR=hentested (pasientens hjem), RETUR=leveringssted (pasientens hjem)
                    const adrTlf = erTur
                        ? (hentestedet && hentestedet[4] ? hentestedet[4].trim() : '')
                        : (leveringsstedet && leveringsstedet[4] ? leveringsstedet[4].trim() : '');
                    if (adrTlf) {
                        const adrNr = normaliserTelefon(adrTlf);
                        if (adrNr && adrNr !== '(mangler)') {
                            const adrNr8 = adrNr.replace(/[\s+\-]/g, '').slice(-8);
                            if (adrNr8.length === 8) {
                                const erReservert = /reservert|ikke\s*sms/i.test(adrTlf);
                                if (erReservert) harIkkeSms = true;
                                if (!alleNumreMedKilde.find(n => n.nr8 === adrNr8)) {
                                    alleNumreMedKilde.push({ nr: adrNr, nr8: adrNr8, kilde: 'ADR', erMobil: erMobilnummer(adrNr8), erReservert });
                                }
                                if (erMobilnummer(adrNr8) && !alleTelefoner.includes(adrNr8)) {
                                    alleTelefoner.push(adrNr8);
                                }
                                if (!telefon && erMobilnummer(adrNr8)) {
                                    telefon = adrNr;
                                    telefonKilde = 'ADR';
                                }
                            }
                        }
                    }

                    // Parse avvikslogg fra admin (3 min cache)
                    let { avviksLogg, sisteKontaktFraAvvik, sisteEPT, sisteIFS, eptAntall } = parseAvvikslogg(adminHtml, reise.resId);

                    // Hvis kortet har EPT, hent ferskere avvik/merknad fra ressurskort (30 sek cache)
                    // så vi raskt ser IFS-svar og merknad-endringer uten å vente på admin-cachen.
                    // Merge defensivt: bare overstyr felt hvor ressurskortet faktisk har ferskere data.
                    if (sisteEPT) {
                        const ressurskortHtml = await hentRessurskortCached(reise.resId);
                        if (ressurskortHtml && ressurskortHtml.length > 0) {
                            const fersk = parseAvvikslogg(ressurskortHtml, reise.resId);
                            // Bruk ferske verdier bare hvis ressurskortet har noe av verdi —
                            // unngå å slette gyldig sisteEPT fra admin når ressurskortet er tomt/tolkes feil.
                            if (fersk.sisteEPT) { sisteEPT = fersk.sisteEPT; eptAntall = fersk.eptAntall || eptAntall; }
                            if (fersk.sisteIFS) sisteIFS = fersk.sisteIFS;
                            if (fersk.sisteKontaktFraAvvik) sisteKontaktFraAvvik = fersk.sisteKontaktFraAvvik;
                            if (fersk.avviksLogg && fersk.avviksLogg.length > 0) avviksLogg = fersk.avviksLogg;
                        }
                    }
                    
                    // DEBUG: Vis avvikslogg-parsing for denne reisen
                    if (avviksLogg.length > 0) {
                        addDebugLog(`[AVVIK] ${reise.navn} (${reise.resId}): ${avviksLogg.length} avvik, KMP=${sisteKontaktFraAvvik ? sisteKontaktFraAvvik.tid : 'null'}, EPT=${sisteEPT ? sisteEPT.tid : 'null'}, IFS=${sisteIFS ? sisteIFS.tid : 'null'}`);
                        avviksLogg.forEach((a, i) => {
                            const m = a.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
                            if (m) addDebugLog(`  [AVVIK ${i}] MATCH: "${a.substring(0, 60)}" → type=${m[2]}`);
                        });
                    }

                    // Parse Ressurs SMS-logg fra admin (forsinkelsesmeldinger)
                    let smsLoggRes = [];
                    
                    const resSmsIdx = adminHtml.indexOf('Ressurs, SMS logg');
                    
                    if (resSmsIdx > -1) {
                        // Finn den nestede tabellen etter "Ressurs, SMS logg"
                        const searchArea = adminHtml.substring(resSmsIdx, resSmsIdx + 3000);
                        
                        // Match rader med dato-format - bruk [\s\S]*? for \u00e5 fange ALT mellom <td> og </td>
                        const rowRegex = /<td>(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})<\/td>\s*<td>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>/gi;
                        let match;
                        while ((match = rowRegex.exec(searchArea)) !== null) {
                            smsLoggRes.push({
                                tidspunkt: match[1].trim(),
                                mottaker: match[2].trim(),
                                melding: match[3]?.trim()
                                    .replace(/&aring;/g, '\u00e5')
                                    .replace(/&aelig;/g, '\u00e6')
                                    .replace(/&oslash;/g, '\u00f8')
                                    .replace(/&Aring;/g, '\u00c5')
                                    .replace(/&AElig;/g, '\u00c6')
                                    .replace(/&Oslash;/g, '\u00d8') || ''
                            });
                        }
                    }
                    
                    const smsLogg = smsLoggRes; // For bakoverkompatibilitet
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  SUTI-STATUS: Parse transportstatus fra SUTI-logg              \u2551
                    // \u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
                    // \u2551  3003       = Bil tildelt (l\u00f8yvenummer)                        \u2551
                    // \u2551  4010/1709  = Bil fremme, venter p\u00e5 pasient                    \u2551
                    // \u2551  4010/1701  = Passasjer hentet                                 \u2551
                    // \u2551  4010/1702  = Passasjer levert                                 \u2551
                    // \u2551  4010/1703  = Bomtur                                           \u2551
                    // \u2551  4010/1750  = Avvist av pasient                                \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    let sutiStatus = {
                        bestiltTid: null,      // AddRequisition = n\u00e5r reisen ble opprettet
                        bestiltMs: null,
                        sendtTid: null,        // NewResource + Tildelt = sendt til transport\u00f8r
                        sendtMs: null,
                        bilTildelt: false,
                        bilTildeltTid: null,
                        bilTildeltMs: null,
                        loeyve: null, // L\u00f8yvenummer fra 3003
                        bilFremme: false,
                        bilFremmeTid: null,
                        bilFremmeMs: null,
                        bilFremmeGeo: null, // {lat, long}
                        hentet: false,
                        hentetTid: null,
                        levert: false,
                        bomtur: false,
                        avvist: false,
                        erIA: false // Individuell Avtale - kontakt behandler, ikke SMS
                    };
                    
                    // Parse bestilt-tid fra Rekvisisjonsloggen
                    // HTML: <td >NewRequisition</td><td valign="top">DD.MM.YYYY HH:MM:SS</td>
                    const rekvLoggIdx = adminHtml.indexOf('Rekvisisjonslogg');
                    if (rekvLoggIdx > -1) {
                        const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 20000);
                        const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
                        if (newReqMatch) {
                            sutiStatus.bestiltTid = newReqMatch[2]; // HH:MM
                            sutiStatus.bestiltDato = newReqMatch[1]; // DD.MM.YYYY HH:MM:SS
                            // Parse full timestamp
                            const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                            if (bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]), parseInt(bp[2])-1, parseInt(bp[1]), parseInt(bp[4]), parseInt(bp[5])).getTime();
                        }
                        // Tildelt-tid fra siste AddToResource i rekvisisjonsloggen (søk i hele adminHtml)
                        const addResMatches = [...adminHtml.matchAll(/AddToResource\s*<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/g)];
                        if (addResMatches.length > 0) {
                            const siste = addResMatches[addResMatches.length - 1];
                            sutiStatus.sendtTid = siste[2];
                            const tp = siste[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                            if (tp) sutiStatus.sendtMs = new Date(parseInt(tp[3]), parseInt(tp[2])-1, parseInt(tp[1]), parseInt(tp[4]), parseInt(tp[5])).getTime();
                        }
                    }

                    // Parse SUTI-meldinger fra ressurslogg-tabellen
                    // Hver rad: Tid | Status | ... | Suti kode | Suti attributt
                    // Vi ser etter rader med spesifikke koder og attributter
                    
                    // Finn SUTI-logg-seksjonen for \u00e5 begrense regex-s\u00f8k (ytelsesoptimalisering)
                    let sutiIdx = adminHtml.indexOf('Suti kode');
                    let sutiArea = sutiIdx > -1 ? adminHtml.substring(sutiIdx) : '';
                    // Klipp bort alt etter <hr> — det er gamle ressurser
                    const hrIdx2 = sutiArea.indexOf('<hr');
                    if (hrIdx2 > -1) sutiArea = sutiArea.substring(0, hrIdx2);

                    /* FALLBACK: Hvis ingen SUTI-data, pr\u00f8v \u00e5 finne riktige admin-IDer via searchStatus
                    if (!sutiArea && reise.resId) {
                        try {
                            const searchRes = await fetch('https://pastrans-sorost.mq.nhn.no/administrasjon/admin/searchStatus', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                body: `submit_action=tripSearch&tripNr=${reise.resId}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`
                            });
                            const searchHtml = await searchRes.text();
                            
                            // Parse admin-IDer fra s\u00f8keresultatet: getRequisitionDetails(id, db, tripid, highlightTripnr)
                            const idMatch = searchHtml.match(/getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
                            if (idMatch) {
                                const adminId = idMatch[1];
                                const adminDb = idMatch[2];
                                const adminTripId = idMatch[3];
                                addDebugLog(`\ud83d\udd04 Fallback admin-IDer for ${reise.resId}: id=${adminId}, tripid=${adminTripId}`);
                                
                                const fallbackUrl = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${adminId}&db=${adminDb}&tripid=${adminTripId}&showSutiXml=true&hideEvents=&full=true`;
                                const fallbackRes = await fetch(fallbackUrl);
                                const fallbackHtml = await fallbackRes.text();
                                
                                sutiIdx = fallbackHtml.indexOf('Suti kode');
                                if (sutiIdx > -1) {
                                    sutiArea = fallbackHtml.substring(sutiIdx);
                                    addDebugLog(`\u2705 Fant SUTI-data via fallback for ${reise.resId}`);
                                }
                            }
                        } catch (e) {
                            // Stille feil - bruk original data uten SUTI
                        }
                    }
                    */
                    
                    let fremmeXmlId = null;
                    let paaVeiXmlId = null;
                    
                    if (sutiArea) {
                        // Samle ALLE rader med tidspunkt f\u00f8rst
                        const alleRader = [];
                        const radRegex = /<tr[^>]*>\s*([\s\S]*?)<\/tr>/gi;
                        let radMatch;
                        while ((radMatch = radRegex.exec(sutiArea)) !== null) {
                            const rad = radMatch[1];
                            const tidMatch = rad.match(/<nobr>(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})<\/nobr>/);
                            if (!tidMatch) continue;

                            const tidMs = new Date(
                                parseInt(tidMatch[3]), parseInt(tidMatch[2]) - 1, parseInt(tidMatch[1]),
                                parseInt(tidMatch[4]), parseInt(tidMatch[5]), parseInt(tidMatch[6])
                            ).getTime();
                            const klokkeslett = `${tidMatch[4]}:${tidMatch[5]}`;

                            alleRader.push({ rad, tidMs, klokkeslett });
                        }

                        // Sorter kronologisk (eldst f\u00f8rst \u2192 nyeste sist \u2192 siste vinner)
                        alleRader.sort((a, b) => a.tidMs - b.tidMs);
                        
                        // Bomtur gjelder kun hvis ALLE tildelte biler har bomtur
                        // Hvis noen bil er tildelt uten bomtur, er reisen aktiv
                        const tildelteTurNr = new Set();
                        const bomturTurNr = new Set();
                        
                        sutiStatus.bomtur = false;
                        
                        for (const { rad, tidMs, klokkeslett } of alleRader) {
                            // Hent TurNr fra raden
                            const turNrMatch = rad.match(/<nobr>(\d{7,8})<\/nobr>/);
                            const turNr = turNrMatch ? turNrMatch[1] : null;
                            
                            // NewResource/AssignToNextCA + Tildelt = sendt til transportør
                            if ((/NewResource/.test(rad) || /AssignToNextCA/.test(rad)) && /Tildelt/.test(rad)) {
                                // sendtTid/sendtMs settes fra rekvisisjonsloggen (AddToResource) — mer pålitelig
                                if (!sutiStatus.sendtMs) { sutiStatus.sendtTid = klokkeslett; sutiStatus.sendtMs = tidMs; }
                                if (turNr) tildelteTurNr.add(turNr);
                            }
                            
                            // Bomtur - registrer TurNr og nullstill bil-statusene
                            if (/>\s*1703\b/.test(rad) || /Bomtur/.test(rad)) {
                                if (turNr) bomturTurNr.add(turNr);
                                sutiStatus.bilTildelt = false;
                                sutiStatus.bilTildeltTid = null;
                                sutiStatus.bilTildeltMs = null;
                                sutiStatus.bilFremme = false;
                                sutiStatus.bilFremmeTid = null;
                                sutiStatus.bilFremmeMs = null;
                                sutiStatus.loeyve = null;
                                sutiStatus.hentet = false;
                                sutiStatus.hentetTid = null;
                                fremmeXmlId = null;
                                paaVeiXmlId = null;
                            }
                            
                            // Resten krever "Bekreftet" status
                            if (!/Bekreftet/.test(rad)) continue;
                            
                            const xmlIdMatch = rad.match(/sutiXml\?id=(\d+)/);
                            
                            if (/>\s*3003\b/.test(rad)) {
                                sutiStatus.bilTildelt = true;
                                sutiStatus.bilTildeltTid = klokkeslett;
                                sutiStatus.bilTildeltMs = tidMs;
                                // Ny bil = nullstill fremme-data fra forrige bil
                                sutiStatus.bilFremme = false;
                                sutiStatus.bilFremmeTid = null;
                                sutiStatus.bilFremmeMs = null;
                                fremmeXmlId = null;
                                // L\u00f8yve-formater: OA12345, 870-4301, VI-726
                                const loeyveMatch = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                                if (loeyveMatch) sutiStatus.loeyve = loeyveMatch[1];
                                if (xmlIdMatch) paaVeiXmlId = xmlIdMatch[1];
                            }
                            // UpdateResource med Bekreftet har ofte riktig l\u00f8yvenr
                            if (/UpdateResource/.test(rad) && /Bekreftet/.test(rad)) {
                                const loeyveMatch = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                                if (loeyveMatch) sutiStatus.loeyve = loeyveMatch[1];
                            }
                            if (/>\s*1709\b/.test(rad)) {
                                sutiStatus.bilFremme = true;
                                sutiStatus.bilFremmeTid = klokkeslett;
                                sutiStatus.bilFremmeMs = tidMs;
                                if (xmlIdMatch) fremmeXmlId = xmlIdMatch[1];
                            }
                            if (/>\s*1701\b/.test(rad)) {
                                sutiStatus.hentet = true;
                                sutiStatus.hentetTid = klokkeslett;
                            }
                            if (/>\s*1702\b/.test(rad)) {
                                sutiStatus.levert = true;
                            }
                            if (/>\s*1750\b/.test(rad)) {
                                sutiStatus.avvist = true;
                            }
                        }
                        
                        // Bomtur = alle tildelte biler har bomtur (ingen aktive igjen)
                        if (bomturTurNr.size > 0) {
                            const harAktivBil = [...tildelteTurNr].some(t => !bomturTurNr.has(t));
                            sutiStatus.bomtur = !harAktivBil;
                        }
                        
                        // IA (Individuell Avtale) - sjekk om "IA" finnes som SUTI-attributt
                        if (/>\s*IA\s*</.test(sutiArea)) {
                            sutiStatus.erIA = true;
                        }
                    }
                    
                    // Hent geoposisjon fra SUTI XML (skip blacklistede transport\u00f8rer)
                    const transportorLower2 = (transportor || '').toLowerCase();
                    const hopOverGeo2 = CONFIG.GEO_BLACKLIST.some(b => transportorLower2.includes(b));
                    if (!hopOverGeo2) {
                        if (paaVeiXmlId) sutiStatus.bilPaaVeiGeo = await hentSutiXmlGeoCached(paaVeiXmlId);
                        if (fremmeXmlId) sutiStatus.bilFremmeGeo = await hentSutiXmlGeoCached(fremmeXmlId);
                    }
                    
                    // Beregn estimert kj\u00f8retid bil \u2192 hentested fra geoposisjon
                    let geoAvstand = null;
                    if (henteGeoLatLng) {
                        const bilGeo = sutiStatus.bilPaaVeiGeo || null;
                        if (bilGeo) {
                            const luftKm = haversine(
                                parseFloat(bilGeo.lat), parseFloat(bilGeo.long),
                                henteGeoLatLng.lat, henteGeoLatLng.lng
                            );
                            const est = estimerKjoretid(luftKm);
                            geoAvstand = {
                                luftKm: Math.round(luftKm * 10) / 10,
                                veiKm: est.veiKm,
                                minutter: est.minutter,
                                kilde: sutiStatus.bilPaaVeiGeo ? '3003' : '4010'
                            };
                        }
                    }
                    
                    // Beregn om dette er en RETUR og sjekk terskel
                    const visTerskel = erTur ? CONFIG.VIS_TUR_FRA_MIN : CONFIG.VIS_RETUR_FRA_MIN;
                    let smsTerskel = erTur ? CONFIG.FORSINKELSE_TUR_MIN : CONFIG.FORSINKELSE_RETUR_MIN;

                    // RETUR utenfor OUS-omr\u00e5det: juster SMS-terskel til reisetid (60-180 min)
                    if (!erTur && leveringsstedet) {
                        const leverPostnr = parsePostnr(leveringsstedet[3].trim());
                        if (leverPostnr && !erOusPostnr(leverPostnr)) {
                            // Utenfor OUS - sjekk om vi har reisetid lagret
                            if (henteGeoLatLng && leverGeoLatLng) {
                                const reisetid = await hentReisetid(henteGeoLatLng.lat, henteGeoLatLng.lng, leverGeoLatLng.lat, leverGeoLatLng.lng);
                                if (reisetid) {
                                    smsTerskel = Math.max(60, Math.min(180, reisetid));
                                    addDebugLog(`\ud83d\udee3 Retur utenfor OUS (${leverPostnr}): reisetid ${reisetid}m, terskel ${smsTerskel}m`);
                                }
                            } else {
                                // Ingen koordinater - bruk maks
                                smsTerskel = 180;
                                addDebugLog(`\ud83d\udee3 Retur utenfor OUS (${leverPostnr}): ingen geo, terskel 180m`);
                            }
                        }
                    }

                    // Effektiv forsinkelse: minutter siden KLAR (fraTidMs)
                    // Brukes for filtrering og FORSINKET-visning
                    // NISSY startTid er kun fallback hvis KLAR ikke finnes
                    const effektivForsinkelse = fraTidMs 
                        ? Math.floor((nowMs - fraTidMs) / 60000)
                        : reise.forsinkelse;
                    
                    // Vis b\u00e5de TUR og RETUR fra passert hentetidspunkt (visTerskel=0)
                    // SMS-terskel styrer kun kanSendeSms, ikke synlighet
                    if (dbg.terskel && effektivForsinkelse < visTerskel) {
                        adminFilterTelling.terskel++;
                        continue;
                    }
                    
                    // Juster terskel ved manuell justering fra planlegger
                    // Negativ verdi (-1 til -15): klar-tid flyttet tidligere, pas. har IKKE f\u00e5tt SMS
                    // \u2192 legg til absoluttverdien p\u00e5 terskelen som buffer
                    if (meldingJustering !== null && meldingJustering < 0 && meldingJustering >= -15) {
                        smsTerskel += Math.abs(meldingJustering);
                    }
                    
                    // RETUR med lav forsinkelse: fortsatt vis som kandidat, men ikke klar for SMS
                    // (tidligere hoppet vi over disse, men n\u00e5 viser vi dem i ventende-panelet)
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  SPOT-DETEKSJON OG FORSINKELSE-BEREGNING                       \u2551
                    // \u2551  M\u00e5 skje F\u00d8R SMS-beregning slik at alle verdier er korrekte     \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    
                    // Hopp over bomturer - skal ikke ha SMS
                    if (dbg.bomtur && sutiStatus.bomtur) {
                        adminFilterTelling.bomtur++;
                        continue;
                    }
                    
                    // SPOT-deteksjon: bestilt < 25 min f\u00f8r start, eller bestilt ETTER start
                    // Kun relevant hvis bestilt SAMME DAG som reisen
                    let erSpot = false;
                    const bestiltTidStr = sutiStatus.bestiltTid || opprettetTid;
                    if (bestiltTidStr && fraTid) {
                        const bestiltDatoStr = (sutiStatus.bestiltDato || opprettetTid || '').match(/(\d{1,2})\.(\d{1,2})/);
                        const klarDatoStr = fraTid.match(/(\d{1,2})\.(\d{1,2})/);
                        
                        let sammeDag = true;
                        
                        if (bestiltDatoStr) {
                            const idagDato = new Date();
                            const bestiltDag = parseInt(bestiltDatoStr[1]);
                            const bestiltMnd = parseInt(bestiltDatoStr[2]);
                            
                            if (klarDatoStr) {
                                sammeDag = bestiltDag === parseInt(klarDatoStr[1]) && bestiltMnd === parseInt(klarDatoStr[2]);
                            } else {
                                sammeDag = bestiltDag === idagDato.getDate() && bestiltMnd === (idagDato.getMonth()+1);
                            }
                        } else if (reise.startTidMs) {
                            const startDato = new Date(reise.startTidMs);
                            const idagDato = new Date();
                            if (startDato.getDate() !== idagDato.getDate() || startDato.getMonth() !== idagDato.getMonth()) {
                                sammeDag = false;
                            }
                        }
                        
                        if (sammeDag) {
                            const parseMinutter = (str) => {
                                const m = str.match(/(\d{1,2})[:.]\s*(\d{2})\s*$/);
                                return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
                            };
                            const bestiltMin = parseMinutter(bestiltTidStr);
                            const klarMin = parseMinutter(fraTid);
                            if (bestiltMin !== null && klarMin !== null) {
                                if (klarMin - bestiltMin < 25) erSpot = true;
                            }
                        }
                    }
                    
                    // SMS-forsinkelse: minutter siden KLAR for alle typer
                    // SPOT TUR bruker bestiltMs i stedet
                    let smsForsinkelse = fraTidMs 
                        ? Math.floor((nowMs - fraTidMs) / 60000)
                        : reise.forsinkelse;
                    
                    // SPOT TUR: forsinkelse fra bestiltMs, terskel 25 min
                    if (erSpot && erTur && sutiStatus.bestiltMs) {
                        smsTerskel = CONFIG.FORSINKELSE_TUR_SPOT_MIN;
                        smsForsinkelse = Math.floor((nowMs - sutiStatus.bestiltMs) / 60000);
                    }
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  SMS-ID OG RUNDE-BEREGNING                                     \u2551
                    // \u2551  Bruker korrekt smsForsinkelse og smsTerskel                   \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    const idag = new Date().toISOString().split('T')[0];
                    const retningStr = erTur ? 'TUR' : 'RETUR';
                    
                    let smsRunde = 1;
                    const minSidenTerskel = smsForsinkelse - smsTerskel;
                    if (minSidenTerskel > 0) {
                        smsRunde = 1 + Math.floor(minSidenTerskel / CONFIG.REPETER_INTERVALL_MIN);
                    }
                    const smsId = `${reise.reqId}_${idag}_${retningStr}_${smsRunde}`;
                    const sendtFraDb = sendtIds.has(smsId);
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  SMS-LOGG MATCHING OG TIMING                                   \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    const normaliserTlf = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
                    
                    // Finn alle SMS sendt til denne pasienten (match mot alle telefonnumre)
                    const smsTilPasient = smsLoggRes.filter(s => {
                        const mottakerNorm = normaliserTlf(s.mottaker);
                        return alleTelefoner.some(tlf => tlf === mottakerNorm);
                    });
                    
                    // Finn tidspunkt for siste SMS sendt til denne pasienten
                    let sisteSmsMinutterSiden = null;
                    let smsKilde = null;
                    
                    if (smsTilPasient.length > 0) {
                        smsKilde = 'pasient';
                        const sisteSms = smsTilPasient[smsTilPasient.length - 1];
                        const tidMatch = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                        if (tidMatch) {
                            const smsTid = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2]) - 1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]));
                            sisteSmsMinutterSiden = Math.floor((now - smsTid) / 60000);
                        }
                    } else if (smsLoggRes.length > 0) {
                        smsKilde = 'ressurs';
                        const sisteSms = smsLoggRes[smsLoggRes.length - 1];
                        const tidMatch = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                        if (tidMatch) {
                            const smsTid = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2]) - 1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]));
                            sisteSmsMinutterSiden = Math.floor((now - smsTid) / 60000);
                        }
                    }
                    
                    // alleredeSendt: kun hvis SMS faktisk er sendt til DENNE pasientens nummer.
                    // Tidligere brukt smsLoggRes.length > 0 (hele ressursen) — feil ved samkjøring
                    // der én pasient fikk SMS mens andre fortsatt trenger det.
                    const alleredeSendt = sendtFraDb || smsTilPasient.length > 0;
                    
                    // Hent sist kontakt \u2014 prioriter avvikslogg (KMP/KMB) over DB
                    const kontaktInfo = kontaktData.get(reise.reqId);
                    let sistKontaktTid = null;
                    let sistKontaktMinSiden = null;
                    let sistKontaktType = null; // KMP eller KMB
                    
                    // F\u00f8rst: sjekk avvikslogg fra NISSY (mest p\u00e5litelig, synlig for alle)
                    if (sisteKontaktFraAvvik) {
                        sistKontaktTid = sisteKontaktFraAvvik.tid;
                        sistKontaktType = sisteKontaktFraAvvik.type;
                        sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, now);
                    }
                    // Fallback: DB-kontakt (for bakoverkompatibilitet)
                    else if (kontaktInfo && kontaktInfo.tidspunkt) {
                        sistKontaktTid = kontaktInfo.tidspunkt;
                        sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, now);
                    }
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  BEREGN MINUTTER TIL NESTE SMS                                 \u2551
                    // \u2551  Bruker smsForsinkelse (fra KLAR/Bestilt), ikke NISSY           \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    let minTilSms;
                    let kanSendeSms = false;

                    // Finn tidspunktet vi skal telle fra — kun SMS faktisk sendt til DENNE pasienten.
                    // Ved samkjøring kan ressursen ha SMS til en annen pasient; det skal ikke
                    // blokkere SMS til denne pasienten.
                    let tellerFraMinSiden = (smsKilde === 'pasient') ? sisteSmsMinutterSiden : null;
                    let tellerFraKilde = (smsKilde === 'pasient') ? smsKilde : null;

                    if (sistKontaktMinSiden !== null) {
                        if (tellerFraMinSiden === null || sistKontaktMinSiden < tellerFraMinSiden) {
                            tellerFraMinSiden = sistKontaktMinSiden;
                            tellerFraKilde = 'kontakt';
                        }
                    }

                    if (smsTilPasient.length === 0 && !sendtFraDb && !kontaktInfo && !sisteKontaktFraAvvik) {
                        // Pasienten har ikke fått SMS personlig og ingen kontakt registrert — bruk smsForsinkelse
                        minTilSms = smsTerskel - smsForsinkelse;
                        kanSendeSms = minTilSms <= 0 && !!telefon;
                    } else if (tellerFraMinSiden !== null) {
                        // SMS sendt til pasienten eller kontakt registrert - sjekk om 60 min har g\u00e5tt
                        minTilSms = CONFIG.REPETER_INTERVALL_MIN - tellerFraMinSiden;
                        kanSendeSms = minTilSms <= 0 && !!telefon;
                    } else {
                        minTilSms = CONFIG.REPETER_INTERVALL_MIN;
                        kanSendeSms = false;
                    }
                    
                    // IA (Individuell Avtale) - skal ikke ha SMS, kontakt behandler
                    if (sutiStatus.erIA) {
                        kanSendeSms = false;
                    }

                    // Sjekk om det finnes SMS som ikke matcher pasienten
                    const harUmatchetSms = smsLoggRes.length > 0 && smsTilPasient.length === 0;

                    // ╔══════════════════════════════════════════════════════════╗
                    // ║  ETTERLYSNING-BEREGNING (v6)                              ║
                    // ║  Basert p\u00e5 EPT/IFS fra avviksloggen                       ║
                    // ╚══════════════════════════════════════════════════════════╝
                    let etterlysTerskel = getEtterlysTerskel(erTur, erSpot);
                    // TUR: tildelt + terskel (men klar + terskel hvis tildelt utløpt)
                    // RETUR: max(klar, tildelt) + terskel
                    let etterlyseTidspunkt = 0;
                    if (!erTur && fraTidMs) {
                        const seneste = sutiStatus.sendtMs ? Math.max(fraTidMs, sutiStatus.sendtMs) : fraTidMs;
                        etterlyseTidspunkt = seneste + etterlysTerskel * 60000;
                    } else if (sutiStatus.sendtMs && fraTidMs) {
                        const tildeltPluss = sutiStatus.sendtMs + etterlysTerskel * 60000;
                        etterlyseTidspunkt = tildeltPluss >= fraTidMs ? tildeltPluss : fraTidMs + etterlysTerskel * 60000;
                    } else {
                        etterlyseTidspunkt = fraTidMs ? fraTidMs + etterlysTerskel * 60000 : 0;
                    }
                    const etterlyseForsinkelse = etterlyseTidspunkt ? Math.floor((now - etterlyseTidspunkt) / 60000) : effektivForsinkelse;
                    const _eptAktiv = (window._dbgFiltre || {}).ept !== false;
                    const harEPT = _eptAktiv && !!sisteEPT;
                    const harIFS = _eptAktiv && !!sisteIFS;

                    // Parse EPT/IFS-tidspunkt til minutter siden
                    let sistEPTMinSiden = null;
                    let sistIFSMinSiden = null;
                    if (harEPT && sisteEPT) sistEPTMinSiden = tidTilMinutterSiden(sisteEPT.tid, now);
                    if (harIFS && sisteIFS) sistIFSMinSiden = tidTilMinutterSiden(sisteIFS.tid, now);

                    // IFS etter siste EPT = besvart (transport\u00f8r har svart)
                    const ifsEtterEPT = harIFS && harEPT && sistIFSMinSiden !== null && sistEPTMinSiden !== null
                        && sistIFSMinSiden <= sistEPTMinSiden; // IFS er nyere

                    // Etterlys-status: venter | etterlyse | etterlyst | besvart
                    let etterlysStatus;
                    let minTilNesteEtterlysning;
                    if (ifsEtterEPT) {
                        // Har f\u00e5tt IFS etter EPT - besvart
                        etterlysStatus = 'besvart';
                        minTilNesteEtterlysning = 0;
                    } else if (harEPT && sistEPTMinSiden !== null) {
                        // EPT registrert uten IFS-svar - fortsatt i oppf\u00f8lging selv om bilen er fremme
                        minTilNesteEtterlysning = CONFIG.ETTERLYSE_REPETER_MIN - sistEPTMinSiden;
                        if (minTilNesteEtterlysning <= 0) {
                            // Snooze utl\u00f8pt - b\u00f8r etterlyses igjen
                            etterlysStatus = 'etterlyse';
                        } else {
                            // Snoozet - venter p\u00e5 neste runde
                            etterlysStatus = 'etterlyst';
                        }
                    } else if (sutiStatus.bilFremme || sutiStatus.hentet) {
                        // Bil er fremme eller hentet uten EPT - ingen etterlysning n\u00f8dvendig
                        etterlysStatus = 'besvart';
                        minTilNesteEtterlysning = 0;
                    } else if (etterlyseForsinkelse >= 0) {
                        // Passert terskel, ingen EPT - b\u00f8r etterlyses
                        etterlysStatus = 'etterlyse';
                        minTilNesteEtterlysning = 0;
                    } else {
                        // Under terskel
                        etterlysStatus = 'venter';
                        minTilNesteEtterlysning = -etterlyseForsinkelse;
                    }
                    const kanEtterlyse = etterlysStatus === 'etterlyse';

                    // Bygg avviksgrunn-liste
                    let avviksGrunner = [];
                    if (sutiStatus.erIA) avviksGrunner.push('\ud83d\udfe3 IA - kontakt behandler');
                    if (!telefon) avviksGrunner.push('\ud83d\udcf5 Mangler mobilnummer');

                    // Legg til kandidat
                    kandidater.push({
                        ...reise,
                        navn: pasientNavn, // Overskriv med navn fra admin
                        telefon,
                        telefonKilde,
                        folkregAdresse,
                        folkregPoststed,
                        alleTelefoner, // Alle telefonnumre for SMS-matching
                        alleNumreMedKilde, // Alle numre med kilde og reservasjonsstatus
                        harIkkeSms, // Pasient reservert mot SMS
                        rekNr,
                        rekStatus,
                        pnr,
                        fraTid,
                        fraTidMs,
                        tilTid,
                        erTur,
                        henteAdresse,
                        henteAdresseFull,
                        leveringsAdresse,
                        leveringsAdresseFull,
                        henteGeoLatLng,
                        leverGeoLatLng,
                        geoAvstand,
                        transportor,
                        loyveTur,
                        turId,
                        spesielleBehov,
                        smsTerskel,
                        smsId,
                        smsRunde,
                        alleredeSendt,
                        minTilSms,
                        kanSendeSms,
                        manglerTelefon: !telefon,
                        harUmatchetSms,
                        avviksGrunner, // Liste over avviksgrunner
                        smsLogg,
                        smsLoggRes, // Forsinkelsesmeldinger sendt
                        avviksLogg, // Avviksmeldinger fra admin
                        sutiStatus,
                        opprettetTid,
                        erSpot,
                        erIA: sutiStatus.erIA,
                        bestiltMs: sutiStatus.bestiltMs, // For SPOT TUR forsinkelse-beregning
                        smsForsinkelse, // Forsinkelse for SMS-beregning (fra KLAR for SPOT+RETUR)
                        meldingJustering, // Manuell justering fra planlegger (f.eks. -29 eller +35)
                        meldingTilPRK, // Melding til pasientreisekontoret (full tekst)
                        meldingTilTransportor, // Melding til transport\u00f8ren
                        sistKontaktTid, // Registrert kontakt med pasient
                        sistKontaktType, // KMP eller KMB (fra avvikslogg)
                        // Etterlysning (v6)
                        etterlysTerskel,
                        etterlyseForsinkelse,
                        kanEtterlyse,
                        harEPT,
                        sisteEPT,
                        eptAntall,
                        harIFS,
                        sisteIFS,
                        sistEPTMinSiden,
                        sistIFSMinSiden,
                        minTilNesteEtterlysning,
                        etterlysStatus // 'venter' | 'etterlyse' | 'etterlyst' | 'besvart'
                    });
                    

                    
                    // Samkj\u00f8ring-indikator i loggen
                    const samkjoringTekst = reise.erSamkjoring ? ` [${reise.samkjoringNr}/${reise.samkjoringAntall}]` : '';
                    const smsStatus = kanSendeSms ? '\ud83d\udd14 KAN SENDE' : alleredeSendt ? '\u2713 Sendt' : `\u23f3 ${Math.abs(minTilSms)} min`;
                    addDebugLog(`\u2713 ${pasientNavn}${samkjoringTekst} (${retningStr}) +${reise.forsinkelse}m ${smsStatus}`);
                    
                    // Liten pause mellom requests
                    await new Promise(r => setTimeout(r, 50));
                    
                } catch (e) {
                    console.error(`[SMS] FEIL for ${reise.reqId}:`, e.message, e.stack);
                    addDebugLog(`\u2717 Feil for ${reise.navn}: ${e.message}`);
                }
            }
            
            // Behold søk-kandidater og re-fetch admin-data for oppdatert status
            let sokKandidater = [];
            const tidligereSok = (window.smsKandidater || []).filter(k => k.erSok);

            // Re-fetch admin-data for eksisterende søk (full re-parse for oppdatert status)
            if (tidligereSok.length > 0) {
                addDebugLog(`\ud83d\udd0d Oppdaterer ${tidligereSok.length} s\u00f8k-kandidater...`);
                for (const sk of tidligereSok) {
                    try {
                        const sokData = await window.sokDB.get(sk.nissyTripId || sk.turId);
                        if (!sokData) { sokKandidater.push(sk); continue; }
                        const adminUrl = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${sokData.adminId}&db=${sokData.db}&tripid=${sokData.tripId}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${sokData.turId}`;
                        const adminRes = await fetch(adminUrl);
                        const adminHtml = await adminRes.text();
                        if (!adminHtml || adminHtml.length < 500) { sokKandidater.push(sk); continue; }

                        // Full re-parse via delt funksjon
                        const oppdatert = await parseAdminHtmlForSok(adminHtml, {
                            sokVerdi: sk.sokVerdi, sokType: sk.sokType,
                            tripId: sokData.tripId, adminId: sokData.adminId,
                            turIdFallback: sokData.turId
                        });
                        sokKandidater.push(oppdatert);
                        addDebugLog(`\ud83d\udd0d Oppdatert: ${oppdatert.navn} (${oppdatert.rekStatus || 'ukjent status'})`);
                    } catch(e3) {
                        sokKandidater.push(sk); // behold gammel data ved feil
                    }
                }
            }

            // Hvis ingen søk i minne, sjekk DB (etter F5)
            if (sokKandidater.length === 0) {
                try {
                    const lagredeSlk = await window.sokDB.getAll();
                    if (lagredeSlk.length > 0) {
                        addDebugLog(`\ud83d\udd0d Gjenoppretter ${lagredeSlk.length} s\u00f8k fra DB...`);
                        for (const lagret of lagredeSlk) {
                            try {
                                const adminUrl = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${lagret.adminId}&db=${lagret.db}&tripid=${lagret.tripId}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${lagret.turId}`;
                                const adminRes = await fetch(adminUrl);
                                const adminHtml = await adminRes.text();
                                if (!adminHtml || adminHtml.length < 500) continue;
                                
                                // Full parsing via delt funksjon (identisk med SOK_TURID)
                                const kandidat = await parseAdminHtmlForSok(adminHtml, {
                                    sokVerdi: lagret.sokVerdi, sokType: lagret.sokType,
                                    tripId: lagret.tripId, adminId: lagret.adminId,
                                    turIdFallback: lagret.turId
                                });
                                sokKandidater.push(kandidat);
                                addDebugLog(`\ud83d\udd0d Gjenopprettet: ${kandidat.navn} (TUR ${kandidat.turId})`);
                            } catch(e3) {
                                addDebugLog(`\u26a0\ufe0f Feil ved gjenoppretting: ${e3.message}`);
                            }
                        }
                    }
                } catch(e2) {}
            }
            
            if (sokKandidater.length > 0) {
                addDebugLog(`\ud83d\udd0d Bevarer ${sokKandidater.length} s\u00f8k-kandidater`);
                sokKandidater.forEach(sk => {
                    if (!kandidater.find(k => k.reqId === sk.reqId)) {
                        kandidater.unshift(sk);
                    }
                });
            }
            
            // Oppdater lagrede s\u00f8k for visning (gruppert per resId)
            try {
                const alleSok = await window.sokDB.getAll();
                const sokGrupper = {};
                alleSok.forEach(s => {
                    const key = s.sokResId || s.id;
                    if (!sokGrupper[key]) sokGrupper[key] = { sokVerdi: s.sokVerdi, sokType: s.sokType, sokResId: s.sokResId, treff: [] };
                    sokGrupper[key].treff.push(s);
                });
                window.sokLagrede = Object.values(sokGrupper);
            } catch(e2) { window.sokLagrede = []; }
            
            window.smsKandidater = kandidater;
            window.smsStats.kandidater = kandidater.filter(k => k.kanSendeSms).length;

            // Debug: vis filtreringsoppsummering
            const ft = adminFilterTelling;
            addDebugLog(`FILTRERT: rekStartet=${ft.rekStartet}, rekFramme=${ft.rekFramme}, rekIkkeMott=${ft.rekIkkeMott}, overstyrt=${ft.overstyrt}, bomtur=${ft.bomtur}, terskel=${ft.terskel} | GJENNOM: ${kandidater.length}`);
            
            // Lagre ventende reiser (passert visningstidspunkt, venter p\u00e5 SMS-terskel)
            // Inkluder alle som har minTilSms > 0 (ikke n\u00e5dd terskel) og har telefon
            window.smsVentende = kandidater.filter(k => {
                // M\u00e5 ha telefon
                if (k.manglerTelefon) return false;
                // M\u00e5 ikke allerede v\u00e6re klar for SMS
                if (k.kanSendeSms) return false;
                // M\u00e5 ha positiv ventetid til SMS
                if (k.minTilSms <= 0) return false;
                // Ikke vis de som allerede har sendt SMS (venter p\u00e5 ny runde)
                // Men vis de som aldri har f\u00e5tt SMS
                return true;
            });
            
            addDebugLog(`=== Ferdig: ${kandidater.length} kandidater, ${window.smsStats.kandidater} kan sende SMS, ${window.smsVentende.length} venter ===`);
            
            // Skjul spinner
            if (window.smsWin && !window.smsWin.closed) {
                const spinner = window.smsWin.document.getElementById('spinner');
                if (spinner) spinner.classList.add('hidden');
            }

            // Cache-stats for denne runden
            const adminCalls = (_cacheStats.adminHit - _cyclePre.adminHit) + (_cacheStats.adminMiss - _cyclePre.adminMiss);
            const adminHits = _cacheStats.adminHit - _cyclePre.adminHit;
            const sutiCalls = (_cacheStats.sutiHit - _cyclePre.sutiHit) + (_cacheStats.sutiMiss - _cyclePre.sutiMiss);
            const sutiHits = _cacheStats.sutiHit - _cyclePre.sutiHit;
            if (adminCalls > 0 || sutiCalls > 0) {
                addDebugLog(`💾 Cache: admin ${adminHits}/${adminCalls} treff, suti ${sutiHits}/${sutiCalls} treff`);
            }

            oppdaterStats();
            // oppdaterAktiveBrukere(); // MIDLERTIDIG deaktivert - feilsøkes
            oppdaterVisning(kandidater);
            markerSpotINissy(kandidater);
            // Heartbeat etter analyse — forhindrer EKG-flatline under lang analyse
            ovrChannel.postMessage({ type: 'HEARTBEAT' });
            // Varsle popup om nye turer
            if (window.smsWin && !window.smsWin.closed && window.smsWin._sjekkNyeTurer) {
                window.smsWin._sjekkNyeTurer(kandidater.length);
            }
            // oppdaterVentende() kj\u00f8res kun n\u00e5r brukeren \u00e5pner panelet (\u23f3-knappen)
            
        } catch (e) {
            console.error(`[SMS] YTRE FEIL:`, e.message, e.stack);
            addDebugLog(`FEIL: ${e.message}`);
            // Skjul spinner ved feil ogs\u00e5
            const win = window.smsWin;
            if (win && !win.closed) {
                const spinner = win.document.getElementById('spinner');
                if (spinner) spinner.classList.add('hidden');
            }
        }
    }

    // === Marker SPOT-turer direkte i NISSY-tabellen ===
    // Lagre siste SPOT-resIds så MutationObserver kan re-applye
    window._spotResIds = new Set();

    function markerSpotINissy(kandidater) {
        // Fjern gamle badges først (rydder ved hver oppdatering)
        document.querySelectorAll('.ovr-spot-badge,.ovr-spot-prefix').forEach(el => el.remove());

        // Finn unike resId-er med SPOT
        window._spotResIds = new Set();
        (kandidater || []).forEach(k => {
            if (k.erSpot) window._spotResIds.add(k.resId);
        });

        _applySpotBadges();
    }

    function _applySpotBadges() {
        if (!window._spotResIds || window._spotResIds.size === 0) return;
        window._spotResIds.forEach(resId => {
            const rad = document.getElementById('P-' + resId);
            if (!rad || !rad.cells || rad.cells.length === 0) return;
            const celle = rad.cells[0];
            if (!celle) return;
            if (celle.querySelector('.ovr-spot-prefix')) return;
            const badge = document.createElement('span');
            badge.className = 'ovr-spot-prefix';
            badge.textContent = 'S';
            badge.style.cssText = 'display:inline-block;background:#dc2626;color:#fff;padding:1px 4px;border-radius:3px;font-size:10px;font-weight:700;margin-right:4px;vertical-align:middle;';
            celle.insertBefore(badge, celle.firstChild);
        });
    }

    // MutationObserver: re-apply SPOT-badges når NISSY oppdaterer tabellen
    (function() {
        let spotDebounce = null;
        const tabellObs = new MutationObserver(() => {
            if (spotDebounce) clearTimeout(spotDebounce);
            spotDebounce = setTimeout(_applySpotBadges, 500);
        });
        tabellObs.observe(document.body, { childList: true, subtree: true });
    })();

    function oppdaterVisning(kandidater) {
        const win = window.smsWin;
        if (!win || win.closed) return;
        
        // Ikke erstatt DOM mens bruker redigerer avviksfelt
        if (win._editing) {
            addDebugLog('\u23f8 DOM-oppdatering utsatt (redigerer)');
            window._pendingKandidater = kandidater;
            return;
        }
        
        const cont = win.document.getElementById('container');

        // Fjern utløpte snoozes og filtrer bort snoozede
        const naaMs = Date.now();
        Object.keys(window.smsSnooze).forEach(id => { if (window.smsSnooze[id] < naaMs) delete window.smsSnooze[id]; });
        if (kandidater) kandidater = kandidater.filter(k => !window.smsSnooze[k.reqId]);

        // Rydd utløpte EPT/SMS-snooze + skjul kortet hvis snooze dekker eneste grunn til visning
        let snoozeEndret = false;
        if (window._snoozeEPT) {
            Object.keys(window._snoozeEPT).forEach(id => {
                if (window._snoozeEPT[id] < naaMs) { delete window._snoozeEPT[id]; snoozeEndret = true; }
            });
        }
        if (window._snoozeSMS) {
            Object.keys(window._snoozeSMS).forEach(id => {
                if (window._snoozeSMS[id] < naaMs) { delete window._snoozeSMS[id]; snoozeEndret = true; }
            });
        }
        if (snoozeEndret && typeof lagreSnooze === 'function') lagreSnooze();
        if (kandidater) {
            kandidater = kandidater.filter(k => {
                const eptS = window._snoozeEPT && window._snoozeEPT[k.reqId] && window._snoozeEPT[k.reqId] > naaMs;
                const smsS = window._snoozeSMS && window._snoozeSMS[k.reqId] && window._snoozeSMS[k.reqId] > naaMs;
                if (!eptS && !smsS) return true;
                // Behold alltid kort med aktiv EPT (harEPT=true uten IFS-svar) — viktig for Oppfølging
                if (k.harEPT && k.etterlysStatus !== 'besvart') return true;
                // Hvis EPT-snoozet og kortet ville vært i etterlyse kun pga kanEtterlyse → skjul
                if (eptS && k.etterlysStatus === 'etterlyse' && !k.kanSendeSms) return false;
                // Hvis SMS-snoozet og kortet ville vært i klarForSms kun pga kanSendeSms → skjul
                if (smsS && k.kanSendeSms && k.etterlysStatus !== 'etterlyse') return false;
                // Hvis begge er snoozet → skjul
                if (eptS && smsS) return false;
                return true;
            });
        }

        // Skjul pasienter som har fått SMS og venter på neste runde (cooldown)
        // Men behold de som skal etterlyses (kanEtterlyse) ELLER har aktiv EPT uten IFS-svar
        const _smsFilter = (window._dbgFiltre || {}).sms !== false;
        const harAktivEPT = k => k.harEPT && k.etterlysStatus !== 'besvart';
        const iCooldown = _smsFilter ? (kandidater ? kandidater.filter(k => k.alleredeSendt && !k.kanSendeSms && !k.erSok && !k.kanEtterlyse && !harAktivEPT(k)) : []) : [];
        if (_smsFilter) {
            kandidater = kandidater ? kandidater.filter(k => !(k.alleredeSendt && !k.kanSendeSms) || k.erSok || k.kanEtterlyse || harAktivEPT(k)) : [];
        }

        if (!kandidater || kandidater.length === 0) {
            const totPassert = window.smsStats?.filtrerteReiser || 0;
            cont.innerHTML = `
                <div class="ingen-kandidater">
                    <div class="ikon">&#10004;</div>
                    <div>${totPassert > 0 ? `${totPassert} turer har passert hentetidspunkt` : 'Ingen turer har passert hentetidspunkt'}</div>
                    <div style="margin-top:6px;font-size:13px;color:var(--text-sek);">Ingen SMS- eller etterlysningskandidater</div>
                    ${iCooldown.length > 0 ? `<div style="margin-top:14px;font-size:12px;color:var(--text-sek);">
                        <div style="margin-bottom:6px;">\u2709 ${iCooldown.length} pasient${iCooldown.length > 1 ? 'er' : ''} har f\u00e5tt SMS:</div>
                        ${iCooldown.map(k => `<div style="padding:3px 0;color:var(--text-dempet);font-size:11px;">\u2022 ${k.pasientNavn || k.navn || 'Ukjent'} <span style="color:#64748b;">${k.rekNr || ''} ${k.erTur ? 'TUR' : 'RETUR'} ${k.startTid || ''}</span></div>`).join('')}
                    </div>` : ''}
                </div>
            `;
            return;
        }
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  GRUPPER KANDIDATER P\u00c5 RESSURS (resId)                             \u2551
        // \u2551  - Enkeltreiser: \u00e9n pasient per ressurs                            \u2551
        // \u2551  - Samkj\u00f8ring: flere pasienter deler samme ressurs                 \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        const ressursGrupper = new Map();
        
        kandidater.forEach(k => {
            if (!ressursGrupper.has(k.resId)) {
                ressursGrupper.set(k.resId, {
                    resId: k.resId,
                    pasienter: [],
                    // Felles data fra f\u00f8rste pasient
                    sutiStatus: k.sutiStatus,
                    avviksLogg: k.avviksLogg || [],
                    startTid: k.startTid,
                    startTidMs: k.startTidMs,
                    forsinkelse: k.forsinkelse,
                    erTur: k.erTur,
                    status: k.status,
                    transportor: k.transportor,
                    loyveTur: k.loyveTur,
                    turId: k.turId,
                    // Rullestolbil-behov (sjekkes for hver pasient)
                    harRB: false,
                    harTK: false,
                    harERS: false,
                    harFly: false,
                    flyInfo: null, // {flightnr, avinorUrl} eller null
                    harIA: false,
                    erSok: k.erSok || false,
                    sokVerdi: k.sokVerdi || '',
                    sokType: k.sokType || '',
                    nissyReqId: k.nissyReqId || '',
                    nissyTripId: k.nissyTripId || ''
                });
            }
            ressursGrupper.get(k.resId).pasienter.push(k);
            
            // Oppdater h\u00f8yeste forsinkelse for ressursen
            const gruppe = ressursGrupper.get(k.resId);
            if (k.forsinkelse > gruppe.forsinkelse) {
                gruppe.forsinkelse = k.forsinkelse;
            }
            
            // Sjekk om noen pasient har rullestolbil-behov (RB, TK, ERS)
            if (k.spesielleBehov) {
                if (/\bRB\b/i.test(k.spesielleBehov)) gruppe.harRB = true;
                if (/\bTK\b/i.test(k.spesielleBehov)) gruppe.harTK = true;
                if (/\bERS\b/i.test(k.spesielleBehov)) gruppe.harERS = true;
            }
            
            // Sjekk om pasient kommer med fly (henteadresse = Gardermoen)
            if (k.henteAdresseFull && /gardermoen/i.test(k.henteAdresseFull)) {
                gruppe.harFly = true;
                if (!gruppe.flyInfo) {
                    gruppe.flyInfo = byggFlyInfo(k.meldingTilTransportor);
                }
            }
            
            // IA (Individuell Avtale) - kontakt behandler, ikke SMS
            if (k.erIA) {
                gruppe.harIA = true;
            }
            
            // Sl\u00e5 sammen avvik fra alle pasienter (de er like, men ta unike)
            if (k.avviksLogg && k.avviksLogg.length > 0) {
                k.avviksLogg.forEach(a => {
                    if (!gruppe.avviksLogg.includes(a)) {
                        gruppe.avviksLogg.push(a);
                    }
                });
            }
        });
        
        const ressurser = Array.from(ressursGrupper.values());
        
        // Sorter pasienter innen hver ressurs: TUR f\u00f8r RETUR
        ressurser.forEach(r => {
            r.pasienter.sort((a, b) => (b.erTur ? 1 : 0) - (a.erTur ? 1 : 0));
        });
        
        // Kategoriser ressurser basert p\u00e5 pasientenes status
        // For SMS-matching: sjekk om NOEN pasient i ressursen matcher SMS-loggen
        const harAvvik = (r) => {
            r.avviksGrunnRessurs = []; // Samle avviksgrunner p\u00e5 ressurs-niv\u00e5
            r.avvikPasienter = []; // Kun pasienter med avvik
            
            // Mangler mobilnummer - per pasient
            const utenMobil = r.pasienter.filter(p => p.manglerTelefon && !p.erIA && !/\bIA\b/i.test(p.spesielleBehov || ''));
            if (utenMobil.length > 0) {
                // Mangler mobilnummer vises i hvert pasient-kort, ikke på ressurs-nivå
                r.avvikPasienter.push(...utenMobil);
            }
            
            // Sjekk SMS-matching p\u00e5 ressurs-niv\u00e5 (kun informasjon, ikke avvik)
            const foerstePasient = r.pasienter[0];
            if (foerstePasient && foerstePasient.smsLoggRes && foerstePasient.smsLoggRes.length > 0) {
                const alleTlfIRessurs = [];
                r.pasienter.forEach(p => {
                    if (p.alleTelefoner) {
                        p.alleTelefoner.forEach(tlf => {
                            if (!alleTlfIRessurs.includes(tlf)) alleTlfIRessurs.push(tlf);
                        });
                    }
                });
                
                const normaliserTlf = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
                const noenSmsMatcherRessurs = foerstePasient.smsLoggRes.some(s => {
                    const mottakerNorm = normaliserTlf(s.mottaker);
                    return alleTlfIRessurs.includes(mottakerNorm);
                });
                const samkjoringHelt = (foerstePasient.samkjoringAntall || 1) <= r.pasienter.length;
                if (!noenSmsMatcherRessurs && samkjoringHelt) {
                    r.avviksGrunnRessurs.push('\ud83d\udce8 SMS sendt til ukjent mottaker');
                }
            }
            
            return r.avvikPasienter.length > 0;
        };
        
        // Kj\u00f8r harAvvik \u00e9n gang for alle ressurser
        ressurser.forEach(r => harAvvik(r));
        
        // For ressurser med avvik: splitt i avvik-pasienter og normale pasienter
        // Avvik-pasientene vises i avvikspanelet, resten i normal k\u00f8
        let avvik = [];
        const normalRessurser = [];
        
        ressurser.forEach(r => {
            if (r.avvikPasienter.length > 0) {
                // Lag avviksversjon med kun ber\u00f8rte pasienter
                avvik.push({ ...r, pasienter: r.avvikPasienter });
                
                // Lag normal versjon med de gjenv\u00e6rende pasientene
                const normalePasienter = r.pasienter.filter(p => !r.avvikPasienter.includes(p));
                if (normalePasienter.length > 0) {
                    normalRessurser.push({ ...r, pasienter: normalePasienter });
                }
            } else {
                normalRessurser.push(r);
            }
        });
        
        // v6: Ny ETTERLYSE-kategori — ressurser der noen pasient har kanEtterlyse=true
        let etterlyse = normalRessurser.filter(r =>
            r.pasienter.some(p => p.kanEtterlyse)
        );
        // Oppfølging: ressurser der EPT er satt men ikke enda besvart/ferdig.
        // Bygg fra ORIGINAL ressurser-listen (før avvik-splitt) så ingen faller ut.
        const oppfolgingSeen = new Set();
        let oppfolgingEPT = ressurser.filter(r => {
            if (oppfolgingSeen.has(r.resId)) return false;
            if (r.pasienter.some(p => p.harEPT && p.etterlysStatus !== 'besvart')) {
                oppfolgingSeen.add(r.resId);
                return true;
            }
            return false;
        });
        // Debug: eksponer for inspeksjon
        window._sistOppfolging = oppfolgingEPT;
        window._sistRessurser = ressurser;
        window._sistNormal = normalRessurser;
        window._sistAvvik = avvik;
        // Fjern etterlyse-ressurser fra normal-pool (de vises i egen seksjon)
        const etterlysResIds = new Set(etterlyse.map(r => r.resId));
        const ikkeEtterlys = normalRessurser.filter(r => !etterlysResIds.has(r.resId));

        let venter = ikkeEtterlys.filter(r =>
            !r.pasienter.some(p => p.kanSendeSms)
        );
        // klarForSms eksluderer etterlyse (som har høyere prioritet i stabelvisning)
        let klarForSms = ikkeEtterlys.filter(r =>
            r.pasienter.some(p => p.kanSendeSms)
        );

        // Sorter etter forsinkelse
        const forsinkelseSortering = (a, b) => b.forsinkelse - a.forsinkelse;
        etterlyse.sort(forsinkelseSortering);
        venter.sort(forsinkelseSortering);
        klarForSms.sort(forsinkelseSortering);
        avvik.sort(forsinkelseSortering);

        // Separer manuelt s\u00f8kte ressurser til egen seksjon
        const sokRessurser = [
            ...etterlyse.filter(r => r.erSok),
            ...venter.filter(r => r.erSok),
            ...klarForSms.filter(r => r.erSok),
            ...avvik.filter(r => r.erSok)
        ];
        etterlyse = etterlyse.filter(r => !r.erSok);
        venter = venter.filter(r => !r.erSok);
        klarForSms = klarForSms.filter(r => !r.erSok);
        avvik = avvik.filter(r => !r.erSok);
        oppfolgingEPT = oppfolgingEPT.filter(r => !r.erSok);
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  LAG PASIENT-KORT (inne i ressurs-kontainer)                       \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        function lagPasientKort(k, visSmsLogg = true, storTekst = false, skjulSms = false) {
            const retningClass = k.erTur ? 'tur' : 'retur';
            const retningTekst = k.erTur ? 'TUR' : 'RETUR';
            
            // Fontst\u00f8rrelser basert p\u00e5 storTekst
            const navnSize = storTekst ? '15px' : '13px';
            const infoSize = storTekst ? '13px' : '12px';
            const badgeSize = storTekst ? '12px' : '12px';
            const smallSize = storTekst ? '11px' : '11px';
            const knappSize = storTekst ? '13px' : '11px';
            
            // Tidteller (SMS-knapp og snooze flyttet til banner/meny)
            let knappHtml = '';
            if (!skjulSms && !k.alleredeSendt && k.minTilSms > 0) {
                knappHtml = `<div style="color:var(--text-sek); font-size:${infoSize};">\u23f3 ${Math.abs(k.minTilSms)}m</div>`;
            }

            // Avviksgrunner (vises \u00f8verst i kortet hvis det finnes)
            let avviksGrunnerHtml = '';
            if (k.avviksGrunner && k.avviksGrunner.length > 0) {
                const har1881 = k.manglerTelefon && k.navn;
                avviksGrunnerHtml = `
                    <div style="background:var(--bg-avvik); padding:4px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #dc3545; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        ${k.avviksGrunner.map(g => `<span style="color:var(--text-avvik, #991b1b); font-size:${badgeSize}; font-weight:600;">${g}</span>`).join(' \u00b7 ')}
                        ${har1881 ? `<a href="https://www.1881.no/?query=${encodeURIComponent(k.navn + ' ' + (k.folkregPoststed || ''))}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex; align-items:center; gap:2px; text-decoration:none;" title="S\u00f8k 1881"><img src="https://www.google.com/s2/favicons?domain=1881.no&sz=16" style="width:14px;height:14px;border-radius:2px;"></a>` : ''}
                        ${k.manglerTelefon ? `<button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Finner ikke tlf'});" style="background:none; border:1px solid var(--text-avvik, #991b1b); color:var(--text-avvik, #991b1b); padding:2px 8px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; font-weight:600;">Har ikke mobilnummer</button>` : ''}
                    </div>
                `;
            }

            // v6: Etterlysning-status-linje
            const _eptSnoozet = window._snoozeEPT && window._snoozeEPT[k.reqId] && window._snoozeEPT[k.reqId] > Date.now();
            const _smsSnoozet = window._snoozeSMS && window._snoozeSMS[k.reqId] && window._snoozeSMS[k.reqId] > Date.now();
            let etterlysHtml = '';
            if (_eptSnoozet && k.etterlysStatus === 'etterlyse') {
                const gjenstaar = Math.ceil((window._snoozeEPT[k.reqId] - Date.now()) / 60000);
                etterlysHtml = `
                    <div style="background:var(--bg-subtil); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #64748b; display:flex; align-items:center; gap:6px; opacity:0.6;">
                        <span style="font-size:14px;">\u23f8</span>
                        <span style="color:#94a3b8; font-size:${infoSize}; font-weight:600;">Etterlysning utsatt (${gjenstaar}m)</span>
                    </div>
                `;
            } else if (k.etterlysStatus === 'etterlyse') {
                const loeyveInfo = k.loyveTur || (k.sutiStatus && k.sutiStatus.loeyve) || '';
                const transpInfo = k.transportor ? k.transportor.split(',')[0].trim() : '';
                const detaljer = [loeyveInfo, transpInfo].filter(Boolean).join(', ');
                // k ER pasienten i dette kontekstet — bruk k's egne felt direkte
                const _bTurId = String(k.turId || k.turid || k.tripId || k.nissyTripId || '');
                const _bNavn = String(k.navn || '');
                const _bTransp = String(k.transportor || '');
                const _esc = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                etterlysHtml = `
                    <div style="background:var(--bg-etterlyse); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #dc2626; display:flex; align-items:center; gap:6px;">
                        <span onclick="event.stopPropagation(); window._avvikModalReqId='${k.reqId}'; window._avvikModalResId='${k.resId}'; window._avvikModalTurId='${_esc(_bTurId)}'; window._avvikModalPasientNavn='${_esc(_bNavn)}'; window._avvikModalTransportor='${_esc(_bTransp)}'; var m=document.getElementById('avvik-modal'); var t=document.getElementById('avvik-modal-type'); if(t) t.value='EPT'; var tid=document.getElementById('avvik-modal-tid'); if(tid){var n=new Date(); tid.value=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');} var tr=document.getElementById('avvik-modal-transporter'); if(tr) tr.textContent='${detaljer.replace(/'/g, "\\'")}'; var tu=document.getElementById('avvik-modal-turid'); var tuRad=document.getElementById('avvik-modal-turid-rad'); if(tu&&tuRad){var tv=window._avvikModalTurId||''; if(tv){tu.textContent=tv; tuRad.style.display='block';} else {tuRad.style.display='none';}} m.classList.add('open');" style="display:flex; align-items:center; gap:6px; cursor:pointer; flex:1;">
                            <span style="font-size:14px;">\ud83d\udce2</span>
                            <span style="color:#dc2626; font-size:${infoSize}; font-weight:700;">${k.eptAntall > 0 ? `Re-etterlyse (${k.eptAntall}. gang)!` : 'Etterlyse n\u00e5!'}</span>
                            ${detaljer ? `<span style="color:var(--text-avvik, #991b1b); font-size:${badgeSize};">(${detaljer})</span>` : ''}
                        </span>
                        <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SNOOZE_EPT', reqId:'${k.reqId}', minutter:15});" style="background:none; border:1px solid #dc2626; color:#dc2626; padding:2px 8px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; font-weight:600; flex-shrink:0;">Utsett 15 min</button>
                    </div>
                `;
            } else if (k.etterlysStatus === 'etterlyst' && k.sisteEPT) {
                const snoozeMin = k.minTilNesteEtterlysning > 0 ? k.minTilNesteEtterlysning : 0;
                etterlysHtml = `
                    <div style="background:var(--bg-ept); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #f59e0b; display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">\u23f3</span>
                        <span style="color:var(--text-advarsel, #92400e); font-size:${infoSize}; font-weight:600;">EPT ${k.sisteEPT.tid}${k.eptAntall > 1 ? ` (${k.eptAntall}x)` : ''}</span>
                        ${k.sisteEPT.tekst ? `<span style="color:var(--text-advarsel, #78350f); font-size:${badgeSize};">${k.sisteEPT.tekst}</span>` : ''}
                        <span style="color:var(--text-advarsel, #92400e); font-size:${badgeSize};">\u2192 neste om ${snoozeMin}m</span>
                    </div>
                `;
            } else if (k.etterlysStatus === 'besvart' && k.sisteIFS) {
                etterlysHtml = `
                    <div style="background:var(--bg-besvart); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #10b981; display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">\u2705</span>
                        ${k.sisteEPT ? `<span style="color:#166534; font-size:${badgeSize};">EPT ${k.sisteEPT.tid}</span><span style="color:var(--text-sek); font-size:${badgeSize};">\u2192</span>` : ''}
                        <span style="color:#166534; font-size:${infoSize}; font-weight:600;">IFS ${k.sisteIFS.tid}</span>
                        ${k.sisteIFS.tekst ? `<span style="color:#15803d; font-size:${badgeSize};">${k.sisteIFS.tekst}</span>` : ''}
                    </div>
                `;
            }

            // v6: SMS-status-banner (gult, samme stil som etterlyse-banner)
            let smsHtml = '';
            if (_smsSnoozet && k.kanSendeSms && !k.manglerTelefon) {
                const gjenstaar = Math.ceil((window._snoozeSMS[k.reqId] - Date.now()) / 60000);
                smsHtml = `
                    <div style="background:var(--bg-subtil); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #64748b; display:flex; align-items:center; gap:6px; opacity:0.6;">
                        <span style="font-size:14px;">\u23f8</span>
                        <span style="color:#94a3b8; font-size:${infoSize}; font-weight:600;">SMS utsatt (${gjenstaar}m)</span>
                    </div>
                `;
            } else if (k.kanSendeSms && !k.manglerTelefon) {
                smsHtml = `
                    <div style="background:var(--bg-ept); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #f59e0b; display:flex; align-items:center; gap:6px;">
                        <span onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SMS_PREVIEW', smsId:'${k.smsId}', reqId:'${k.reqId}', resId:'${k.resId}', telefon:'${k.telefon}', alleTelefoner:'${(k.alleTelefoner || []).join(',')}', navn:'${(k.navn || '').replace(/'/g, "\\'")}', forsinkelse:${k.forsinkelse}, erTur:${k.erTur}, smsRunde:${k.smsRunde}});" style="display:flex; align-items:center; gap:6px; cursor:pointer; flex:1;">
                            <span style="font-size:14px;">\ud83d\udd14</span>
                            <span style="color:#f59e0b; font-size:${infoSize}; font-weight:700;">Send SMS</span>
                            ${k.alleredeSendt ? `<span style="color:#f59e0b; font-size:${badgeSize};">(ny runde)</span>` : ''}
                        </span>
                        <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SNOOZE_SMS', reqId:'${k.reqId}', minutter:10});" style="background:none; border:1px solid #f59e0b; color:#f59e0b; padding:2px 8px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; font-weight:600; flex-shrink:0;">Utsett 10 min</button>
                    </div>
                `;
            } else if (!k.alleredeSendt && k.telefon && !k.manglerTelefon && k.minTilSms > 0 && k.minTilSms <= 15) {
                smsHtml = `
                    <div style="background:var(--bg-ept); padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #f59e0b; display:flex; align-items:center; gap:6px; opacity:0.75;">
                        <span style="font-size:14px;">\u23f3</span>
                        <span style="color:#f59e0b; font-size:${infoSize}; font-weight:600;">SMS om ${k.minTilSms} min</span>
                    </div>
                `;
            }

            // SUTI-status for denne pasienten - vis som steg-indikatorer
            let sutiHtml = '';
            if (k.sutiStatus) {
                const s = k.sutiStatus;
                
                // Bestemt h\u00f8yeste steg
                let steg = 0; // 0=bestilt, 1=tildelt, 2=p\u00e5 vei, 3=fremme
                if (s.bilFremme) steg = 3;
                else if (s.bilTildelt) steg = 2;
                else if (s.sendtTid) steg = 1;
                
                // Bestilt-tid fra Rekvisisjonslogg (brukes n\u00e5 via bestiltMs)
                
                // Tidslinje (dot/track)
                const idag = new Date();
                const idagDag = idag.getDate();
                const idagMnd = idag.getMonth();
                const idagAar = idag.getFullYear();
                const naaMs = idag.getTime();

                // Sjekk om noen av tidspunktene er fra en annen dag
                const alleMsTider = [s.bestiltMs, s.sendtMs, k.fraTidMs || k.startTidMs, s.bilTildeltMs, s.bilFremmeMs].filter(Boolean);
                const harAnnenDag = alleMsTider.some(ms => {
                    const d = new Date(ms);
                    return d.getDate() !== idagDag || d.getMonth() !== idagMnd || d.getFullYear() !== idagAar;
                });

                const visTid = (ms) => {
                    if (!ms) return '';
                    const d = new Date(ms);
                    const kl = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                    if (harAnnenDag && (d.getDate() !== idagDag || d.getMonth() !== idagMnd || d.getFullYear() !== idagAar)) return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')} ${kl}`;
                    return kl;
                };

                const klarMs = k.fraTidMs || k.startTidMs || null;

                // Geo-data
                const paaVeiHarGeo = !!(s.bilPaaVeiGeo && k.henteAdresse);
                const paaVeiMapsUrl = paaVeiHarGeo
                    ? `https://www.google.com/maps/dir/?api=1&origin=${s.bilPaaVeiGeo.lat},${s.bilPaaVeiGeo.long}&destination=${encodeURIComponent(k.henteAdresse)}&travelmode=driving`
                    : '';
                const fremmeHarGeo = !!(s.bilFremmeGeo && k.henteAdresse);
                const fremmeMapsUrl = fremmeHarGeo
                    ? `https://www.google.com/maps/dir/?api=1&origin=${s.bilFremmeGeo.lat},${s.bilFremmeGeo.long}&destination=${encodeURIComponent(k.henteAdresse)}&travelmode=driving`
                    : '';

                // PÅ VEI spesiallogikk
                const paaVeiMin = s.bilTildeltMs ? Math.floor((naaMs - s.bilTildeltMs) / 60000) : 0;
                const paaVeiLenge = !s.bilFremme && s.bilTildeltMs && (naaMs - s.bilTildeltMs) > 30 * 60000;

                // ETA
                let etaTekst = '';
                if (k.geoAvstand && !s.bilFremme && s.bilTildeltMs) {
                    const etaMs = s.bilTildeltMs + (k.geoAvstand.minutter * 60000);
                    etaTekst = `ETA ~${visTid(etaMs)}`;
                }

                // PÅ VEI tid-visning
                let paaVeiTid = s.bilTildeltTid ? (visTid(s.bilTildeltMs) || s.bilTildeltTid) : '';

                // 5 steg med ms for sortering
                const tlSteg = [
                    { label: 'BESTILT', tid: visTid(s.bestiltMs) || s.bestiltTid || '', ms: s.bestiltMs || 0, state: 'done', click: '', tip: '', id: 'bestilt' },
                    { label: 'TILDELT', tid: s.sendtTid ? (visTid(s.sendtMs) || s.sendtTid) : '', ms: s.sendtMs || 0, state: steg >= 1 ? 'done' : '', click: '', tip: '', id: 'tildelt' },
                    { label: 'KLAR', tid: visTid(klarMs) || k.startTid || '', ms: klarMs || 0, state: 'done', click: '', tip: '', id: 'klar' },
                    { label: 'PÅ VEI', tid: paaVeiTid, ms: s.bilTildeltMs || 0, state: '', click: '', tip: '', id: 'paavei' },
                    { label: s.bilFremme ? 'FREMME' : (etaTekst ? 'FORVENTET' : 'FREMME'), tid: s.bilFremmeTid ? (visTid(s.bilFremmeMs) || s.bilFremmeTid) : (etaTekst ? etaTekst.replace('ETA ~','') : ''), ms: s.bilFremmeMs || 0, state: '', click: '', tip: '', id: 'fremme' }
                ];

                // Sorter kronologisk — steg uten tid (ms=0) beholder relativ rekkefølge (stable sort)
                tlSteg.sort((a, b) => {
                    if (a.ms && b.ms) return a.ms - b.ms;
                    if (a.ms && !b.ms) return -1;
                    if (!a.ms && b.ms) return 1;
                    return 0;
                });

                // Finn steg-referanser etter sortering
                const paaVeiSteg = tlSteg.find(t => t.id === 'paavei');
                const fremmeSteg = tlSteg.find(t => t.id === 'fremme');

                // State-logikk
                // PÅ VEI
                if (steg >= 3) paaVeiSteg.state = 'done';
                else if (steg === 2) paaVeiSteg.state = paaVeiLenge ? 'warn' : 'active';
                // FREMME
                if (s.bilFremme) fremmeSteg.state = 'active';

                // Geo-klikk — åpner embedded Leaflet-kart med OSRM-rute
                if (paaVeiHarGeo && s.bilTildeltTid) {
                    const destEsc = (k.henteAdresse || '').replace(/'/g, "\\'").replace(/\s+/g, ' ');
                    paaVeiSteg.click = ` onclick="event.stopPropagation(); window._v6VisKart(${s.bilPaaVeiGeo.lat}, ${s.bilPaaVeiGeo.long}, '${destEsc}', 'Bil p\u00e5 vei \u2192 hentested', this)"`;
                    paaVeiSteg.state += ' geo';
                }
                if (fremmeHarGeo && s.bilFremmeTid) {
                    const destEsc2 = (k.henteAdresse || '').replace(/'/g, "\\'").replace(/\s+/g, ' ');
                    fremmeSteg.click = ` onclick="event.stopPropagation(); window._v6VisKart(${s.bilFremmeGeo.lat}, ${s.bilFremmeGeo.long}, '${destEsc2}', 'Bil fremme \u2192 hentested', this)"`;
                    fremmeSteg.state += ' geo';
                }

                // Tooltips
                if (s.bilTildeltTid) {
                    paaVeiSteg.tip = ` title="${paaVeiLenge ? `Bil på vei i ${paaVeiMin} min (over 30 min)` : `Bil på vei i ${paaVeiMin} min`}${etaTekst ? ' — ' + etaTekst : ''}"`;
                }

                // Track-fill: telle antall done + halvt for active/warn
                let doneCount = tlSteg.filter(t => t.state.includes('done')).length;
                let hasActive = tlSteg.some(t => t.state.includes('active') || t.state.includes('warn'));
                const fillPct = Math.min(100, ((doneCount + (hasActive ? 0.5 : 0)) / 4) * 100);

                sutiHtml = `<div class="timeline">
                    <div class="tl-track"><div class="tl-track-fill" style="width:${fillPct}%"></div></div>
                    ${tlSteg.map(t => {
                        const italic = t.id === 'fremme' && t.label === 'FORVENTET' ? ' style="font-style:italic"' : '';
                        return `<div class="tl-step ${t.state}"${t.click || ''}${t.tip || ''}>
                        <div class="tl-dot"></div>
                        <span class="tl-label"${italic}>${t.label}</span>
                        <span class="tl-time"${italic}>${t.tid || '\u2014'}</span>
                    </div>`;
                    }).join('')}
                </div>`;
                
                if (s.bomtur) {
                    sutiHtml = `<div style="text-align:center; background:var(--bg-avvik); padding:2px 6px; border-radius:4px;">
                        <div style="font-size:${smallSize}; color:var(--text-avvik, #991b1b);">BOMTUR</div>
                        <div style="font-weight:bold; font-size:${infoSize}; color:var(--text-avvik, #991b1b);">\u274c</div>
                    </div>`;
                }
                if (s.avvist) {
                    sutiHtml = `<div style="text-align:center; background:var(--bg-avvik); padding:2px 6px; border-radius:4px;">
                        <div style="font-size:${smallSize}; color:var(--text-avvik, #991b1b);">AVVIST</div>
                        <div style="font-weight:bold; font-size:${infoSize}; color:var(--text-avvik, #991b1b);">\u274c</div>
                    </div>`;
                }
            }
            
            // SMS-badges (kompakt visning)
            let smsLoggBadges = '';
            
            // Full SMS-logg for denne pasienten
            let smsLoggFullHtml = '';
            if (visSmsLogg && k.smsLoggRes && k.smsLoggRes.length > 0) {
                const normaliserTlf = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
                const smsTilPasient = k.smsLoggRes.filter(s => {
                    const mottakerNorm = normaliserTlf(s.mottaker);
                    return k.alleTelefoner && k.alleTelefoner.some(tlf => tlf === mottakerNorm);
                });
                
                if (smsTilPasient.length > 0) {
                    smsLoggFullHtml = `
                        <div style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border-meny);">
                            <div style="font-size:${badgeSize}; color:var(--text-sek); margin-bottom:3px; font-weight:600;">\ud83d\udce8 SMS TIL DENNE PASIENT</div>
                            ${smsTilPasient.map(s => {
                                const tidMatch = s.tidspunkt.match(/(\d{2}:\d{2})/);
                                const kl = tidMatch ? tidMatch[1] : s.tidspunkt;
                                return `
                                <div style="background:var(--bg-besvart); padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #10b981;">
                                    <div style="color:#166534; font-weight:600;">${kl} \u2192 ${s.mottaker}</div>
                                    <div style="color:var(--text-kropp); margin-top:2px; line-height:1.2;">${s.melding}</div>
                                </div>
                            `}).join('')}
                        </div>
                    `;
                }
            }
            
            // Spesielle behov
            let behovHtml = '';
            {
                let alleBadges = [];
                
                // Spesielle behov badges (uten SPOT - den vises ved retning)
                if (k.spesielleBehov && k.spesielleBehov.length > 0) {
                    const behovListe = k.spesielleBehov.split(/,\s*/).filter(b => b.length > 0);
                    behovListe.forEach(b => {
                        const parenMatch = b.match(/\(([^)]+)\)/);
                        const kort = parenMatch ? parenMatch[1] : b.trim().substring(0, 3).toUpperCase();
                        alleBadges.push(`<span title="${b.trim()}" style="display:inline-block; background:var(--bg-kort-sok); color:#7c3aed; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; border:1px solid var(--border-kort); cursor:default;">${kort}</span>`);
                    });
                }
                
                if (alleBadges.length > 0) {
                    behovHtml = `<div style="display:flex; flex-wrap:wrap; gap:3px; margin-top:4px;">${alleBadges.join(' ')}</div>`;
                }
            }
            
            // Adresser (full med navn, gate, postnr og kommentar)
            let adresseHtml = '';
            if (k.henteAdresseFull || k.leveringsAdresseFull) {
                const fraFull = k.henteAdresseFull || k.henteAdresse || '';
                const tilFull = k.leveringsAdresseFull || k.leveringsAdresse || '';
                
                if (fraFull || tilFull) {
                    // Formater hver adresse p\u00e5 flere linjer
                    const formatAdresse = (adr) => adr.replace(/\n/g, '<br>');
                    
                    adresseHtml = `
                        <div style="font-size:${badgeSize}; color:var(--text-sek); margin-top:6px; display:flex; gap:12px;">
                            <div style="flex:1;">
                                <div style="font-weight:600; color:var(--text-kropp); margin-bottom:2px;">Fra:</div>
                                <div style="line-height:1.3;">${formatAdresse(fraFull)}</div>
                            </div>
                            <div style="flex:1;">
                                <div style="font-weight:600; color:var(--text-kropp); margin-bottom:2px;">Til:</div>
                                <div style="line-height:1.3;">${formatAdresse(tilFull)}</div>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Forsinkelse: vis minutter OVER responstid
            // TUR: tildelt + terskel. RETUR: alltid klar + terskel
            const tildeltMsVis = k.sutiStatus ? k.sutiStatus.sendtMs : null;
            const responstidMin = getEtterlysTerskel(k.erTur, k.erSpot);
            let forsinkelseFraMs;
            if (!k.erTur && k.fraTidMs) {
                const senesteVis = tildeltMsVis ? Math.max(k.fraTidMs, tildeltMsVis) : k.fraTidMs;
                forsinkelseFraMs = senesteVis + responstidMin * 60000;
            } else if (tildeltMsVis && k.fraTidMs) {
                const tildeltPlussVis = tildeltMsVis + responstidMin * 60000;
                forsinkelseFraMs = tildeltPlussVis >= k.fraTidMs ? tildeltPlussVis : k.fraTidMs + responstidMin * 60000;
            } else {
                forsinkelseFraMs = k.fraTidMs ? k.fraTidMs + responstidMin * 60000 : 0;
            }
            let effektivForsinkelse = forsinkelseFraMs
                ? Math.floor((Date.now() - forsinkelseFraMs) / 60000)
                : k.forsinkelse;
            const visForsinkelse = Math.max(0, effektivForsinkelse);
            const forsinkelseFarge = visForsinkelse > 60 ? '#dc3545' : visForsinkelse > 30 ? '#f59e0b' : '#10b981';
            const forsinkelseBg = visForsinkelse > 60 ? 'rgba(220,53,69,0.12)' : visForsinkelse > 30 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
            const forsinkelseBorder = visForsinkelse > 60 ? 'rgba(220,53,69,0.3)' : visForsinkelse > 30 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)';
            const forsinkelseTekst = visForsinkelse >= 60 
                ? `+${Math.floor(visForsinkelse / 60)}t ${visForsinkelse % 60}m`
                : `+${visForsinkelse}m`;
            
            // Tooltip: vis utregning
            const fmtMs = (ms) => { if (!ms) return '?'; const d = new Date(ms); return d.toLocaleTimeString('no-NO',{hour:'2-digit',minute:'2-digit'}); };
            const tildeltTipMs = tildeltMsVis;
            const klarTipMs = k.fraTidMs;
            const tildeltPlussTip = tildeltTipMs ? tildeltTipMs + responstidMin * 60000 : null;
            let forsinkelseTip = `${k.erTur ? (k.erSpot ? 'TUR SPOT' : 'TUR') : 'RETUR'} — Terskel: ${responstidMin} min\n`;
            forsinkelseTip += `Tildelt: ${fmtMs(tildeltTipMs)}\n`;
            forsinkelseTip += `Klar: ${fmtMs(klarTipMs)}\n`;
            if (!k.erTur) {
                const senesteTip = tildeltTipMs ? Math.max(klarTipMs || 0, tildeltTipMs) : klarTipMs;
                forsinkelseTip += `RETUR: max(klar, tildelt) + ${responstidMin}min\n`;
                forsinkelseTip += `Seneste: ${fmtMs(senesteTip)}\n`;
                forsinkelseTip += `Etterlyse: ${fmtMs(senesteTip)}+${responstidMin}min = ${fmtMs(senesteTip + responstidMin * 60000)}`;
            } else {
                const tildeltPlussTip2 = tildeltTipMs ? tildeltTipMs + responstidMin * 60000 : null;
                const brukteKlar = tildeltPlussTip2 && klarTipMs && tildeltPlussTip2 < klarTipMs;
                if (brukteKlar) {
                    forsinkelseTip += `Tildelt+${responstidMin}=${fmtMs(tildeltPlussTip2)} < Klar\n`;
                    forsinkelseTip += `Etterlyse: ${fmtMs(klarTipMs)}+${responstidMin}min = ${fmtMs(klarTipMs + responstidMin * 60000)}`;
                } else {
                    forsinkelseTip += `Etterlyse: ${fmtMs(tildeltTipMs)}+${responstidMin}min = ${fmtMs(tildeltPlussTip2)}`;
                }
            }
            forsinkelseTip += `\nForsinkelse: +${visForsinkelse} min`;
            
                    // N\u00e5v\u00e6rende tid for kontakt-feltet
                    const naaTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
                    
                    return `
                <div data-turid="${k.turId || k.reqId}" style="background:${k.erSok ? 'var(--bg-kort-sok)' : 'var(--bg-kort)'}; padding:${storTekst ? '10px 12px' : '8px 10px'}; border-radius:6px; margin-bottom:${storTekst ? '8px' : '6px'}; border:1px solid ${k.erSok ? '#8b5cf6' : (k.erTur ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)')}; border-left:4px solid ${k.erSok ? '#8b5cf6' : (k.erTur ? '#10b981' : '#f59e0b')};">
                    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-kort-header); margin:${storTekst ? '-10px -12px 8px -12px' : '-8px -10px 6px -10px'}; padding:6px 12px; border-radius:6px 6px 0 0;">
                        <span style="font-size:${infoSize}; color:var(--text-prim);">${k.erSok ? '<span style="background:#8b5cf6; color:white; padding:1px 5px; border-radius:3px; font-size:' + badgeSize + '; margin-right:4px;">S\u00d8K</span>' : ''}<strong style="cursor:pointer;" onclick="event.stopPropagation(); var el=this.parentElement.querySelector('.folkreg-adr'); if(el) el.style.display=el.style.display==='none'?'block':'none';" title="Klikk for folkeregistrert adresse">${k.navn}</strong><div class="folkreg-adr" style="display:none; font-size:${badgeSize}; color:var(--text-sek); font-weight:normal; margin-top:2px;">${k.folkregAdresse || 'Ikke tilgjengelig'}</div>${k.pnr && k.pnr.length === 11 ? (() => {
                                const d = parseInt(k.pnr.substring(0,2));
                                const m = parseInt(k.pnr.substring(2,4));
                                const yy = parseInt(k.pnr.substring(4,6));
                                const ind = parseInt(k.pnr.substring(6,9));
                                let yyyy;
                                if (ind < 500) yyyy = 1900 + yy;
                                else if (ind < 750 && yy >= 54) yyyy = 1854 + yy;
                                else if (ind >= 500 && ind < 1000 && yy < 40) yyyy = 2000 + yy;
                                else yyyy = 1900 + yy;
                                const fodt = new Date(yyyy, m-1, d);
                                const idag = new Date();
                                let alder = idag.getFullYear() - fodt.getFullYear();
                                if (idag.getMonth() < fodt.getMonth() || (idag.getMonth() === fodt.getMonth() && idag.getDate() < fodt.getDate())) alder--;
                                return ` <span style="font-weight:normal; color:var(--text-sek);">(${alder} \u00e5r)</span> <span style="font-weight:normal; color:var(--text-dempet); font-size:${badgeSize};">${k.pnr}<span onclick="event.stopPropagation();navigator.clipboard.writeText('${k.pnr}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:2px;opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier personnummer">\ud83d\udccb</span></span>`;
                            })() : ''}</span>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${k.rekNr ? `<span style="display:flex;align-items:center;"><a href="https://pastrans-sorost.mq.nhn.no/administrasjon/admin/searchStatus?nr=${k.rekNr}" target="_blank" onclick="event.stopPropagation()" style="font-size:${infoSize}; color:var(--text-sek); text-decoration:none; font-weight:normal;" onmouseover="this.style.color='#3b82f6';this.style.textDecoration='underline'" onmouseout="this.style.color='#64748b';this.style.textDecoration='none'">${k.rekNr}</a><span onclick="event.stopPropagation();navigator.clipboard.writeText('${k.rekNr}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${infoSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${k.rekNr}">\ud83d\udccb</span></span>` : ''}
                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'VIS_REQ', reqId:'${k.reqId}', nissyReqId:'${k.nissyReqId || ''}', nissyTripId:'${k.nissyTripId || ''}', erSok:${!!k.erSok}})" style="background:#3b82f6; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; flex-shrink:0;">\ud83d\udccb Rekvisisjon</button>
                        </div>
                    </div>
                    ${avviksGrunnerHtml}
                    ${etterlysHtml}
                    ${smsHtml}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="retning-badge ${retningClass}" style="font-size:${badgeSize}; padding:2px 6px;">${retningTekst}</span>
                            ${k.erSpot ? `<span title="Bestilt under 25 min f\u00f8r klar" style="display:inline-block; background:var(--bg-avvik); color:#dc2626; padding:2px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:700; border:1px solid var(--border-lys);">SPOT</span>` : ''}
                            ${k.rekStatus ? `<span style="display:inline-block; background:var(--bg-subtil); color:var(--text-sek); padding:2px 6px; border-radius:4px; font-size:${badgeSize}; border:1px solid var(--border-kort);">${k.rekStatus}</span>` : ''}
                            ${k.meldingJustering != null ? `<span title="Manuell justering fra planlegger" style="display:inline-block; background:${k.meldingJustering < 0 ? 'var(--bg-geo, #dbeafe)' : 'var(--bg-ept)'}; color:${k.meldingJustering < 0 ? '#1d4ed8' : '#92400e'}; padding:2px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:700; border:1px solid ${k.meldingJustering < 0 ? '#93c5fd' : '#fcd34d'};">${k.meldingJustering > 0 ? '+' : ''}${k.meldingJustering}</span>` : ''}
                            <div style="position:relative; display:inline-block;" class="pas-meny">
                                <button onclick="event.stopPropagation(); const allMenus=this.closest('.pas-meny').closest('div').querySelectorAll('.pas-meny-dropdown'); allMenus.forEach(m=>{ if(m!==this.nextElementSibling) m.style.display='none'; }); const m=this.nextElementSibling; m.style.display=m.style.display==='block'?'none':'block';" style="background:none; border:1px solid var(--border-meny); border-radius:4px; padding:1px 6px; cursor:pointer; font-size:${badgeSize}; color:var(--text-sek); line-height:1;">\u2630</button>
                                <div class="pas-meny-dropdown" style="display:none; position:absolute; top:100%; left:0; background:var(--bg-hvit); border:1px solid var(--border-meny); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:100; min-width:180px; padding:4px 0; margin-top:2px;">
                                    <div style="position:relative;" onmouseenter="this.querySelector('.submenu').style.display='block'" onmouseleave="this.querySelector('.submenu').style.display='none'">
                                        <button style="display:flex; justify-content:space-between; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny);">
                                            <span>Endre retning</span><span style="color:var(--text-dempet);">\u25b8</span>
                                        </button>
                                        <div class="submenu" style="display:none; position:absolute; left:100%; top:-4px; background:var(--bg-hvit); border:1px solid var(--border-meny); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:130px; padding:4px 0;">
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_RETNING', reqId:'${k.reqId}', nyRetning:'TUR'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:${k.erTur ? '#dbeafe' : 'none'}; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny); font-weight:${k.erTur ? '700' : '400'};">TUR ${k.erTur ? '\u2713' : ''}</button>
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_RETNING', reqId:'${k.reqId}', nyRetning:'RETUR'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:${!k.erTur ? '#dbeafe' : 'none'}; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny); font-weight:${!k.erTur ? '700' : '400'};">RETUR ${!k.erTur ? '\u2713' : ''}</button>
                                        </div>
                                    </div>
                                    <div style="position:relative;" onmouseenter="this.querySelector('.submenu').style.display='block'" onmouseleave="this.querySelector('.submenu').style.display='none'">
                                        <button style="display:flex; justify-content:space-between; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny);">
                                            <span>Endre status</span><span style="color:var(--text-dempet);">\u25b8</span>
                                        </button>
                                        <div class="submenu" style="display:none; position:absolute; left:100%; top:-4px; background:var(--bg-hvit); border:1px solid var(--border-meny); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:130px; padding:4px 0;">
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Startet'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny);">Startet</button>
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Bomtur'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny);">Bomtur</button>
                                        </div>
                                    </div>
                                    <div style="border-top:1px solid var(--border-lys); margin:4px 0;"></div>
                                    ${k.telefon ? `<button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SMS_PREVIEW', smsId:'${k.smsId}', reqId:'${k.reqId}', resId:'${k.resId}', telefon:'${k.telefon}', alleTelefoner:'${(k.alleTelefoner || []).join(',')}', namn:'${(k.navn || '').replace(/'/g, "\\'")}', forsinkelse:${k.forsinkelse}, erTur:${k.erTur}, smsRunde:${k.smsRunde}}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#f59e0b; font-weight:600;">Send SMS</button>` : ''}
                                    <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Finner ikke tlf'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:var(--text-meny);">Finner ikke telefonnummer</button>

                                </div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="display:inline-flex; align-items:center; padding:3px 10px; border-radius:12px; font-weight:700; font-size:${infoSize}; color:${forsinkelseFarge}; background:${forsinkelseBg}; border:1px solid ${forsinkelseBorder};" title="${forsinkelseTip}">${forsinkelseTekst}</span>
                            ${knappHtml}
                        </div>
                    </div>
                    ${sutiHtml || ''}
                    <div style="display:flex; gap:8px; font-size:${infoSize}; color:var(--text-kropp); flex-wrap:wrap; align-items:center;">
                        ${(() => {
                            let html = '';
                            if (k.alleNumreMedKilde && k.alleNumreMedKilde.length > 0) {
                                html = k.alleNumreMedKilde.map(n => 
                                    `<span style="color:${n.erReservert ? '#dc2626' : 'var(--text-prim)'};">${n.erMobil ? '\ud83d\udcde' : '\ud83d\udce0'} ${fmtTlf(n.nr)} <span style="font-size:${badgeSize}; color:var(--text-dempet);">(${n.kilde})</span>${n.erReservert ? ' <span style="background:var(--bg-etterlyse); color:#dc2626; padding:1px 4px; border-radius:3px; font-size:${badgeSize}; font-weight:600; border:1px solid var(--border-lys);">\u26a0 IKKE SMS</span>' : ''}</span>`
                                ).join(', ');
                            } else if (k.telefon) {
                                html = `<span>\ud83d\udcde ${fmtTlf(k.telefon)}</span>`;
                            }
                            // Mangler mob vises i avviksGrunner-boksen med 1881-favicon
                            return html;
                        })()}
                        ${smsLoggBadges}
                    </div>
                    ${behovHtml}
                    ${adresseHtml}
                    ${k.meldingTilTransportor ? `<div style="font-size:${badgeSize}; color:var(--text-melding-transport, #60a5fa); margin-top:4px;"><span style="font-weight:600;">Melding til transport\u00f8r:</span><br>${k.meldingTilTransportor}</div>` : ''}
                    ${k.meldingTilPRK ? `<div style="font-size:${badgeSize}; color:var(--text-melding-prk, #a78bfa); margin-top:2px;"><span style="font-weight:600;">Melding til pasientreisekontoret:</span><br>${k.meldingTilPRK}</div>` : ''}
                    ${smsLoggFullHtml}
                </div>
            `;
        }
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  LAG RESSURS-KONTAINER (grupperer pasienter)                       \u2551
        // \u2551  storTekst = true \u2192 st\u00f8rre fonter for Skal ha SMS kolonnen        \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        function lagRessursKort(ressurs, storTekst = false, skjulSms = false) {
            const erSamkjoring = ressurs.pasienter.length > 1;
            
            // Fontst\u00f8rrelser basert p\u00e5 storTekst
            const navnSize = storTekst ? '15px' : '13px';
            const infoSize = storTekst ? '13px' : '12px';
            const badgeSize = storTekst ? '12px' : '10px';
            const headerSize = '14px';
            
            // Avvikslogg (felles for ressursen)
            let avviksLoggHtml = '';
            if (ressurs.avviksLogg && ressurs.avviksLogg.length > 0) {
                const avvikResId = ressurs.resId;
                function typeBadge(a) {
                    const hash = avvikHash(a);
                    const manuell = avvikMerkGet(avvikResId, hash);
                    const tekstB64 = btoa(unescape(encodeURIComponent(a)));
                    const merkCall = (type) => `event.stopPropagation(); window._popupChannel.postMessage({type:'MERK_AVVIK', resId:'${avvikResId}', hash:'${hash}', tekstB64:'${tekstB64}', merkType:'${type}'});`;
                    // 1) Manuell overstyring har alltid prioritet
                    if (manuell) {
                        const col = manuell === 'EPT' ? '#dc2626' : manuell === 'IFS' ? '#10b981' : '#64748b';
                        return `<span onclick="${merkCall('fjern')}" style="background:${col}; color:white; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; margin-right:4px; cursor:pointer;" title="Manuelt merket · klikk for å fjerne">✓ ${manuell}</span>`;
                    }
                    // 2) Standard HH:MM - TYPE format (uforanderlig)
                    const std = a.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
                    if (std) {
                        const t = std[2].toUpperCase();
                        const col = t === 'EPT' ? '#dc2626' : t === 'IFS' ? '#10b981' : '#64748b';
                        return `<span style="background:${col}; color:white; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; margin-right:4px;">${t}</span>`;
                    }
                    // 3) Heuristisk klassifisering — klikkbar for å åpne merk-modal med forvalgt
                    const klassi = klassifiserAvvikTekst(a);
                    if (klassi) {
                        const col = klassi.type === 'EPT' ? '#dc2626' : '#10b981';
                        const forvalgtTid = klassi.tid && klassi.tid !== '?' ? klassi.tid : '';
                        return `<span onclick="event.stopPropagation(); window.apneMerkModal('${avvikResId}','${hash}','${tekstB64}','${klassi.type}','${forvalgtTid}');" style="background:${col}; color:white; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; margin-right:4px; opacity:0.85; cursor:pointer;" title="Gjettet · klikk for å bekrefte/justere">${klassi.type}?</span>`;
                    }
                    // 4) Ingen klassifisering — åpne merk-modal med tid fra teksten om mulig
                    let forvalgtTid4 = '';
                    const tm4 = a.match(/\b(\d{1,2}):(\d{2})\b/) || a.match(/\b(\d{2})(\d{2})\b/);
                    if (tm4) forvalgtTid4 = `${tm4[1].padStart(2,'0')}:${tm4[2]}`;
                    return `<span onclick="event.stopPropagation(); window.apneMerkModal('${avvikResId}','${hash}','${tekstB64}','','${forvalgtTid4}');" style="background:#475569; color:white; padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; margin-right:4px; opacity:0.6; cursor:pointer;" title="Klikk for å merke manuelt${forvalgtTid4 ? ` (${forvalgtTid4})` : ''}">?</span>`;
                }
                                avviksLoggHtml = `
                    <div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border-lys); background:var(--bg-avvik-res); padding:8px; border-radius:6px;">
                        <div style="font-size:${badgeSize}; color:var(--text-advarsel, #92400e); margin-bottom:4px; font-weight:600;">\u26a0\ufe0f AVVIK (${ressurs.avviksLogg.length})</div>
                        ${[...ressurs.avviksLogg].reverse().map(a => `
                            <div style="background:var(--bg-ept); padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #f59e0b;">
                                ${typeBadge(a)}<span style="color:var(--text-advarsel, #92400e);">${a}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Header med samkj\u00f8ring-info og l\u00f8yve/turId
            const headerBg = ressurs.erSok ? 'var(--bg-kort-sok)' : erSamkjoring ? 'var(--bg-kort-header)' : 'var(--bg-subtil)';
            const samkjoringBadge = erSamkjoring ? 
                `<span style="background:#6366f1; color:white; padding:3px 8px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">\ud83d\udc65 ${ressurs.pasienter.length} pas</span>` : '';
            
            // Rullestolbil-badges (RB, TK, ERS)
            let rullestolBadges = '';
            if (ressurs.harRB) rullestolBadges += `<span style="background:#dc3545; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">\u267f RB</span>`;
            if (ressurs.harTK) rullestolBadges += `<span style="background:#dc3545; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">\u267f TK</span>`;
            if (ressurs.harERS) rullestolBadges += `<span style="background:#dc3545; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">\u267f ERS</span>`;
            
            // Fly-badge (henteadresse Gardermoen) med flightnummer-link
            if (ressurs.harFly) {
                if (ressurs.flyInfo) {
                    const etaText = ressurs.flyInfo.eta ? ` ${ressurs.flyInfo.eta}` : '';
                    const iataText = ressurs.flyInfo.fraIata ? ` ${ressurs.flyInfo.fraIata.toUpperCase()}` : '';
                    rullestolBadges += `<a href="${ressurs.flyInfo.avinorUrl}" target="_blank" style="background:#0369a1; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600; text-decoration:none; display:inline-block;">\u2708 ${ressurs.flyInfo.flightnr}${iataText}${etaText}</a>`;
                } else {
                    rullestolBadges += `<span style="background:#0369a1; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">\u2708 FLY</span>`;
                }
            }
            
            // IA-badge (Individuell Avtale - kontakt behandler, ikke SMS)
            if (ressurs.harIA) rullestolBadges += `<span style="background:#7c3aed; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:600;">IA</span>`;

            // SPOT-badge (bestilt under 25 min f\u00f8r klar)
            const harSpot = ressurs.pasienter.some(p => p.erSpot);
            if (harSpot) rullestolBadges += `<span style="background:#dc2626; color:white; padding:3px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:700;">SPOT</span>`;
            
            // Vis transport\u00f8r og l\u00f8yve/tur fra admin-data
            let headerTittel = '';
            
            // REK-numre fra alle pasienter (vises \u00f8verst)
            const rekNumre = ressurs.pasienter.map(p => p.reqId).filter(Boolean);
            const rekTekst = rekNumre.length > 0 ? rekNumre.join(', ') : '';
            
            {
                const transportorKort = ressurs.transportor ? ressurs.transportor.split(',')[0].trim() : '';
                const turIdVis = ressurs.turId || ressurs.resId;
                const turIdLink = `<span style="color:var(--text-dempet); font-size:${headerSize}; font-weight:400;">${turIdVis}</span>` +
                    `<span onclick="event.stopPropagation();navigator.clipboard.writeText('${turIdVis}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${headerSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${turIdVis}">\ud83d\udccb</span>`;
                if (ressurs.loyveTur && transportorKort) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:var(--text-kropp);">\ud83d\ude97 ${transportorKort} - ${ressurs.loyveTur}</span> ${turIdLink}`;
                } else if (ressurs.loyveTur) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:var(--text-kropp);">\ud83d\ude97 ${ressurs.loyveTur}</span> ${turIdLink}`;
                } else if (transportorKort) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:var(--text-kropp);">\ud83d\ude97 ${transportorKort}</span> ${turIdLink}`;
                } else {
                    headerTittel = `<span style="font-size:${headerSize}; color:var(--text-sek);">TUR: ${turIdVis}</span>` +
                        `<span onclick="event.stopPropagation();navigator.clipboard.writeText('${turIdVis}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${headerSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${turIdVis}">\ud83d\udccb</span>`;
                }
            }
            
            // Legg til S\u00d8K-badge i header for manuelt s\u00f8kte turer
            if (ressurs.erSok) {
                const sokLabel = ressurs.sokType === 'PNR' ? 'PNR' : ressurs.sokType === 'REK' ? 'REK' : 'TUR';
                headerTittel = `<span style="background:#8b5cf6; color:white; padding:2px 8px; border-radius:4px; font-size:${headerSize}; font-weight:700; margin-right:6px; cursor:default;" title="S\u00f8kt p\u00e5 ${sokLabel}: ${ressurs.sokVerdi}">\ud83d\udd0d MANUELT S\u00d8K <span onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'FJERN_SOK', resId:'${ressurs.resId}'})" style="cursor:pointer; margin-left:4px; opacity:0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">\u2715</span></span> ${headerTittel}`;
            }

            // Avvik-knapp etter TurId
            const _avvikTurVis = ressurs.pasienter && ressurs.pasienter[0] && ressurs.pasienter[0].turId ? String(ressurs.pasienter[0].turId) : '';
            const avvikKnappHtml = `<button class="btn-avvik-modal" onclick="event.stopPropagation(); window._avvikModalResId='${ressurs.resId}'; window._avvikModalReqId='${ressurs.pasienter[0] ? ressurs.pasienter[0].reqId : ressurs.resId}'; window._avvikModalTurId='${_avvikTurVis}'; document.getElementById('avvik-modal-transporter').textContent='${(ressurs.transportor || '').replace(/'/g, "\\'")}'; document.getElementById('avvik-modal-tid').value=new Date().toTimeString().slice(0,5); document.getElementById('avvik-modal-type').value='AVVIK'; document.getElementById('avvik-modal-tekst').value=''; var tu=document.getElementById('avvik-modal-turid'); var tuRad=document.getElementById('avvik-modal-turid-rad'); if(tu&&tuRad){if('${_avvikTurVis}'){tu.textContent='${_avvikTurVis}'; tuRad.style.display='block';} else {tuRad.style.display='none';}} document.getElementById('avvik-modal').classList.add('open');" style="margin-left:6px;">Avvik</button>`;
            headerTittel += avvikKnappHtml;

            // Finn SMS som ikke matcher noen pasient
            let umatchetSmsHtml = '';
            const foerstePasient = ressurs.pasienter[0];
            if (foerstePasient && foerstePasient.smsLoggRes && foerstePasient.smsLoggRes.length > 0) {
                const normaliserTlf = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
                
                // Samle alle telefonnumre fra alle pasienter i ressursen
                const allePasientTlf = [];
                ressurs.pasienter.forEach(p => {
                    if (p.alleTelefoner) {
                        p.alleTelefoner.forEach(tlf => {
                            if (!allePasientTlf.includes(tlf)) allePasientTlf.push(tlf);
                        });
                    }
                });
                
                // Samkjøring der ikke alle pasienter er synlige ennå → hopp over umatchet-flagg
                // (pasient 2+ kan være under VIS_TUR_FRA_MIN eller SMS-terskel)
                const samkjoringHelt = (foerstePasient.samkjoringAntall || 1) <= ressurs.pasienter.length;
                // Finn SMS som ikke matcher noen pasient
                const umatchetSms = samkjoringHelt ? foerstePasient.smsLoggRes.filter(s => {
                    const mottakerNorm = normaliserTlf(s.mottaker);
                    return !allePasientTlf.some(tlf => tlf === mottakerNorm);
                }) : [];
                
                if (umatchetSms.length > 0) {
                    umatchetSmsHtml = `
                        <div style="margin-top:10px; padding:8px; background:var(--bg-ept); border-radius:6px; border-top:1px solid #fdba74;">
                            <div style="font-size:${infoSize}; color:var(--text-advarsel, #c2410c); margin-bottom:4px; font-weight:600;">\ud83d\udce8 SMS SENDT (ukjent mottaker - ${umatchetSms.length})</div>
                            ${umatchetSms.map(s => {
                                const tidMatch = s.tidspunkt.match(/(\d{2}:\d{2})/);
                                const kl = tidMatch ? tidMatch[1] : s.tidspunkt;
                                return `
                                <div style="background:var(--bg-ept); padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #ea580c;">
                                    <div style="color:var(--text-advarsel, #c2410c); font-weight:600;">${kl} \u2192 ${s.mottaker}</div>
                                    <div style="color:var(--text-kropp); margin-top:2px; line-height:1.2;">${s.melding}</div>
                                </div>
                            `}).join('')}
                        </div>
                    `;
                }
            }
            
            return `
                <div id="ressurs-${ressurs.resId}" class="ressurs-kort" style="margin-bottom:16px; background:var(--bg-hvit); border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1); overflow:hidden; border:2px solid var(--border-kort);">
                    
                    <!-- Ressurs header - tittel + dedikert markeringsboks for NISSY -->
                    <div style="background:${headerBg}; padding:8px 12px; border-bottom:1px solid var(--border-lys); display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                            <span class="ovr-markbox" data-resid="${ressurs.resId}"
                                  onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'MARKER_RAD', resId:'${ressurs.resId}'})"
                                  style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:2px solid #64748b; border-radius:4px; cursor:pointer; font-size:14px; font-weight:700; color:transparent; background:transparent; transition:all 0.15s; flex-shrink:0;"
                                  title="Merk turen i NISSY">\u2713</span>
                            ${headerTittel}
                            ${samkjoringBadge}
                            ${rullestolBadges}
                        </div>
                        ${ressurs.erSok
                            ? `<button onclick="event.stopPropagation();" title="Finner ikke ressursplakat for s\u00f8keresultater" style="background:#6b7280; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:${badgeSize}; cursor:not-allowed; flex-shrink:0; opacity:0.7;">\ud83d\uded1 Ressurs</button>`
                            : `<button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'VIS_RES', resId:'${ressurs.resId}', nissyTripId:'${ressurs.nissyTripId || ''}', erSok:false})" style="background:#8b5cf6; color:white; border:none; padding:4px 10px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; flex-shrink:0;">\ud83d\ude97 Ressurs</button>`
                        }
                    </div>
                    
                    <!-- Pasienter -->
                    <div style="padding:10px;">
                        ${ressurs.avviksGrunnRessurs && ressurs.avviksGrunnRessurs.length > 0 ? `
                            <div style="background:var(--bg-avvik); padding:4px 8px; border-radius:4px; margin-bottom:8px; border-left:3px solid #dc3545;">
                                ${ressurs.avviksGrunnRessurs.map(g => `<span style="color:var(--text-avvik, #991b1b); font-size:${badgeSize}; font-weight:600;">${g}</span>`).join(' \u00b7 ')}
                            </div>
                        ` : ''}
                        ${ressurs.pasienter.map(p => lagPasientKort(p, true, storTekst, skjulSms)).join('')}
                    </div>
                    
                    <!-- Umatchet SMS-logg -->
                    ${umatchetSmsHtml}
                    
                    <!-- Avvik (felles for ressursen) -->
                    ${avviksLoggHtml}
                </div>
            `;
        }
        
        // Beregn tellinger med enkle l\u00f8kker
        var tellEtterlyse = 0;
        var tellVenter = 0;
        var tellKlar = 0;
        var tellAvvik = 0;

        for (var ei = 0; ei < etterlyse.length; ei++) {
            var resE = etterlyse[ei];
            if (resE.pasienter) {
                for (var ek = 0; ek < resE.pasienter.length; ek++) {
                    if (resE.pasienter[ek].kanEtterlyse) tellEtterlyse++;
                }
            }
        }
        
        // Lagre lagRessursKort som window-funksjon for gjenbruk i oppdaterVentende
        window._lagRessursKort = lagRessursKort;
        window._lagPasientKort = lagPasientKort;
        
        for (var i = 0; i < venter.length; i++) {
            var res = venter[i];
            if (res.pasienter && res.pasienter.length) {
                tellVenter = tellVenter + res.pasienter.length;
            }
        }
        for (var j = 0; j < klarForSms.length; j++) {
            var res2 = klarForSms[j];
            if (res2.pasienter) {
                for (var k = 0; k < res2.pasienter.length; k++) {
                    if (res2.pasienter[k].kanSendeSms) tellKlar++;
                }
            }
        }
        for (var m = 0; m < avvik.length; m++) {
            var res3 = avvik[m];
            if (res3.pasienter) {
                tellAvvik = tellAvvik + res3.pasienter.length;
            }
        }
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  DYNAMISK 3-KOLONNE LAYOUT                                          \u2551
        // \u2551  SMS / Avvik / Etterlysning \u2014 tomme kolonner forsvinner            \u2551
        // \u2551  Gjenst\u00e5ende kolonner f\u00e5r mer plass (1fr per aktiv)                \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d

        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  VENSTRE KOLONNE \u2014 stablede seksjoner i prioritetsrekkef\u00f8lge    \u2551
        // \u2551  Etterlysning \u2192 SMS \u2192 Avvik                                      \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        const seksjoner = [];

        if (etterlyse.length > 0) {
            // skjulSms=false: etterlysningskort viser også SMS-knapp om klar
            seksjoner.push(etterlyse.map(r => lagRessursKort(r, true, false)).join(''));
        }

        if (klarForSms.length > 0) {
            seksjoner.push(klarForSms.map(r => lagRessursKort(r, true)).join(''));
        }

        if (avvik.length > 0) {
            seksjoner.push(avvik.map(r => lagRessursKort(r, false)).join(''));
        }

        // Tilleggsseksjon: alle 20+ min forsinkede som ikke allerede er vist i en av seksjonene over
        if (window._visAlle20) {
            const alleredeVist = new Set([
                ...etterlyse.map(r => r.resId),
                ...klarForSms.map(r => r.resId),
                ...avvik.map(r => r.resId)
            ]);
            const ekstra = normalRessurser.filter(r =>
                !alleredeVist.has(r.resId) && r.forsinkelse >= 20 && !r.erSok
            ).sort(forsinkelseSortering);
            if (ekstra.length > 0) {
                const header = `<div style="font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin:16px 4px 6px; font-weight:600; opacity:0.8;">\u23f1 Forsinket 20+ min \u00b7 ${ekstra.length}</div>`;
                seksjoner.push(header + ekstra.map(r => lagRessursKort(r, false)).join(''));
            }
        }

        // Debug: vis ventende kort når Vis alle er på eller filtre er justert
        const _dbg = window._dbgFiltre || {};
        const visAlleAktiv = !!_dbg.visAlle;
        const noenFilterAv = !_dbg.status || !_dbg.terskel || !_dbg.bomtur || !_dbg.avtale;
        if ((visAlleAktiv || noenFilterAv) && venter.length > 0) {
            const info = visAlleAktiv ? 'Vis alle' : 'Filter av: ' + [!_dbg.status && 'Status', !_dbg.terskel && 'Terskel', !_dbg.bomtur && 'Bomtur', !_dbg.avtale && 'Avtale'].filter(Boolean).join(', ');
            const header = `<div style="font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:#f59e0b; margin:16px 4px 6px; font-weight:600;">&#9881; Venter (${info}) \u00b7 ${tellVenter}</div>`;
            seksjoner.push(header + venter.map(r => lagRessursKort(r, false)).join(''));
        }

        const venstreKolonne = seksjoner.length > 0
            ? `<div style="overflow-y:auto; min-height:0; padding-right:8px;">${seksjoner.join('')}</div>`
            : `<div style="color:var(--text-sek); text-align:center; padding:40px;">${(window.smsStats?.filtrerteReiser || 0) > 0 ? (window.smsStats.filtrerteReiser + ' turer har passert hentetidspunkt<br><span style="font-size:12px;">Ingen SMS- eller etterlysningskandidater</span>') : 'Ingen turer har passert hentetidspunkt'}</div>`;

        // H\u00f8yre kolonne \u2014 oppf\u00f8lging av etterlysninger
        // Union av: parsed fra admin (oppfolgingEPT) + lokale optimistiske (_lokaleEPT)
        // Gruppert per transportør (samme inndeling som Teams-kanalene), sortert på eldste EPT
        const parsedResIds = new Set(oppfolgingEPT.map(r => r.resId));
        // Map<transportør-streng, { eldsteMinSiden: number, kort: [{html, minSiden}] }>
        const oppfGrupper = new Map();
        function leggIGruppe(transportor, minSiden, html) {
            const navn = (transportor || '(Ukjent transportør)').split(',')[0].trim() || '(Ukjent transportør)';
            if (!oppfGrupper.has(navn)) oppfGrupper.set(navn, { eldsteMinSiden: -Infinity, kort: [] });
            const g = oppfGrupper.get(navn);
            if (minSiden > g.eldsteMinSiden) g.eldsteMinSiden = minSiden;
            g.kort.push({ html, minSiden });
        }

        // Rydd lokale entries som har f\u00e5tt besvart-status fra parsed data
        _lokaleEPT.forEach((lokalt, resId) => {
            const kandRessurs = (window.smsKandidater || []).find(k => k.resId === resId);
            if (kandRessurs && kandRessurs.pasienter) {
                const anyBesvart = kandRessurs.pasienter.some(p => p.harEPT && p.etterlysStatus === 'besvart');
                if (anyBesvart) _lokaleEPT.delete(resId);
            }
        });

        // Hjelper: kompakt avviks-liste i oppf\u00f8lgingskortet
        // Rekkefølge: eldst øverst, nyeste nederst (nærmest svar-input-feltet)
        // Badges er klikkbare — samme merk-flyt som i hovedkortene
        // Les bil-status live fra NISSY ressurs-tabellen. Ferskere enn admin-cache (3 min).
        // Returnerer { tekst, loyve, kilde } — kilde='dom' hvis DOM brukt, ellers 'admin'.
        // NISSY viser "avtale + turid" når bil ikke tildelt, "kun løyve" når bil på vei.
        // Løyve er 5-sifret, turid 7-8-sifret — bruker dette til å skille.
        function effektivBilStatus(pasientEllerRessurs, resId) {
            const suti = pasientEllerRessurs && pasientEllerRessurs.sutiStatus ? pasientEllerRessurs.sutiStatus : null;
            const loyveAdmin = (pasientEllerRessurs && pasientEllerRessurs.loyveTur) || (suti && suti.loeyve) || '';
            // Admin er autoritativ for fremme-status (basert på avvikslogg-parsing av 1709)
            if (suti && suti.bilFremme) {
                return { tekst: '\u2705 fremme', loyve: loyveAdmin, kilde: 'admin' };
            }
            // Les DOM for fersk tildelt-status
            try {
                const rad = document.getElementById('P-' + resId);
                if (rad) {
                    const txt = rad.textContent || '';
                    const loyveM = txt.match(/\b\d{5}\b/);
                    const turidM = txt.match(/\b\d{7,8}\b/);
                    if (loyveM) {
                        return { tekst: '\ud83d\ude97 p\u00e5 vei', loyve: loyveAdmin || loyveM[0], kilde: 'dom' };
                    }
                    if (turidM) {
                        return { tekst: '\u274c ingen bil', loyve: '', kilde: 'dom' };
                    }
                }
            } catch(_) {}
            // Fallback til admin-cache
            if (suti && suti.bilTildelt) {
                return { tekst: '\ud83d\ude97 p\u00e5 vei', loyve: loyveAdmin, kilde: 'admin' };
            }
            return { tekst: '\u274c ingen bil', loyve: '', kilde: 'admin' };
        }

        function kompaktAvvikListe(avviksLogg, resId) {
            if (!avviksLogg || avviksLogg.length === 0) return '';
            const rader = avviksLogg.map(a => {
                const hash = avvikHash(a);
                const manuell = avvikMerkGet(resId, hash);
                const std = a.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
                const klassi = klassifiserAvvikTekst(a);
                const tekstB64 = btoa(unescape(encodeURIComponent(a)));
                const merkCall = (type) => `event.stopPropagation(); window._popupChannel.postMessage({type:'MERK_AVVIK', resId:'${resId}', hash:'${hash}', tekstB64:'${tekstB64}', merkType:'${type}'});`;
                let badge;
                let lineCol;
                if (manuell) {
                    // Manuell overstyring — klikk fjerner
                    lineCol = manuell === 'EPT' ? '#dc2626' : manuell === 'IFS' ? '#10b981' : '#64748b';
                    badge = `<span onclick="${merkCall('fjern')}" style="background:${lineCol}; color:white; padding:1px 4px; border-radius:3px; font-size:8px; font-weight:700; margin-right:4px; cursor:pointer;" title="Manuelt merket · klikk for å fjerne">\u2713 ${manuell}</span>`;
                } else if (std) {
                    // Standard HH:MM - TYPE — ikke klikkbar
                    const t = std[2].toUpperCase();
                    lineCol = t === 'EPT' ? '#dc2626' : t === 'IFS' ? '#10b981' : '#64748b';
                    badge = `<span style="background:${lineCol}; color:white; padding:1px 4px; border-radius:3px; font-size:8px; font-weight:700; margin-right:4px;">${t}</span>`;
                } else if (klassi) {
                    // Heuristisk klassifisering — klikkbar for å bekrefte/justere i merk-modal
                    lineCol = klassi.type === 'EPT' ? '#dc2626' : '#10b981';
                    const forvalgtTid = klassi.tid && klassi.tid !== '?' ? klassi.tid : '';
                    badge = `<span onclick="event.stopPropagation(); window.apneMerkModal('${resId}','${hash}','${tekstB64}','${klassi.type}','${forvalgtTid}');" style="background:${lineCol}; color:white; padding:1px 4px; border-radius:3px; font-size:8px; font-weight:700; margin-right:4px; opacity:0.85; cursor:pointer;" title="Gjettet · klikk for å bekrefte/justere">${klassi.type}?</span>`;
                } else {
                    // Ingen klassifisering — klikkbar for å merke manuelt.
                    // Forsøk å trekke ut tid fra teksten (HH:MM eller HHMM) og send med til modalen.
                    let forvalgtTid = '';
                    const tm = a.match(/\b(\d{1,2}):(\d{2})\b/) || a.match(/\b(\d{2})(\d{2})\b/);
                    if (tm) forvalgtTid = `${tm[1].padStart(2,'0')}:${tm[2]}`;
                    lineCol = '#475569';
                    badge = `<span onclick="event.stopPropagation(); window.apneMerkModal('${resId}','${hash}','${tekstB64}','','${forvalgtTid}');" style="background:${lineCol}; color:white; padding:1px 4px; border-radius:3px; font-size:8px; font-weight:700; margin-right:4px; opacity:0.6; cursor:pointer;" title="Klikk for å merke manuelt${forvalgtTid ? ` (${forvalgtTid})` : ''}">?</span>`;
                }
                return `<div style="font-size:11px; color:var(--text-sek); padding:2px 0; border-left:2px solid ${lineCol}; padding-left:6px; margin-bottom:2px;">${badge}${a}</div>`;
            }).join('');
            return `<div style="margin-top:6px; padding-top:6px; border-top:1px solid var(--border-lys);">${rader}</div>`;
        }

        // Cleanup _lokaleIFS — fjern hvis admin har bekreftet (ikke lenger i oppfolgingEPT) eller > 5 min gammel
        if (window._lokaleIFS && window._lokaleIFS.size) {
            const adminEPTResIds = new Set(oppfolgingEPT.map(r => String(r.resId)));
            for (const [rid, info] of window._lokaleIFS) {
                if (!adminEPTResIds.has(String(rid)) || (Date.now() - info.registrertMs) > 5 * 60 * 1000) {
                    window._lokaleIFS.delete(rid);
                }
            }
        }

        // 1) Parsed fra admin
        oppfolgingEPT.forEach(r => {
            if (window._lokaleIFS && window._lokaleIFS.has(String(r.resId))) return; // Optimistisk skjult
            const p = r.pasienter.find(pp => pp.harEPT && pp.etterlysStatus !== 'besvart');
            if (!p) return;
            const retning = p.erTur ? 'TUR' : 'RETUR';
            const _bs = effektivBilStatus(p, r.resId);
            const bilStatus = _bs.tekst;
            const loyve = _bs.loyve;
            const turidKort = p.turId ? p.turId.toString().slice(-8) : '';
            const _minSiden = (typeof p.sistEPTMinSiden === 'number') ? p.sistEPTMinSiden : 0;

            const _html = `
                <div class="oppf-kort" data-resid="${r.resId}" style="background:var(--bg-kort); border:1px solid var(--border-kort); border-left:3px solid #dc2626; border-radius:6px; padding:10px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1;">
                            <span class="ovr-markbox" data-resid="${r.resId}"
                                  onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'MARKER_RAD', resId:'${r.resId}'})"
                                  style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:2px solid #64748b; border-radius:4px; cursor:pointer; font-size:14px; font-weight:700; color:transparent; background:transparent; transition:all 0.15s; flex-shrink:0;"
                                  title="Merk turen i NISSY">\u2713</span>
                            <div style="font-weight:700; font-size:16px;">${turidKort || '(ingen turid)'} <span style="font-size:13px; color:var(--text-sek); font-weight:500;">\u2014 ${r.transportor || '\u2014'}</span></div>
                        </div>
                    </div>
                    <div style="font-size:12px; color:var(--text-sek); margin-bottom:4px;">${p.navn || '(ukjent)'} \u00b7 ${retning} \u00b7 ${bilStatus}${loyve ? ' \u00b7 ' + loyve : ''}</div>
                    ${kompaktAvvikListe(r.avviksLogg || p.avviksLogg, r.resId)}
                    <div style="display:flex; gap:4px; margin-top:8px;">
                        <input type="time" id="svar-tid-${r.resId}" value="${new Date().toTimeString().slice(0,5)}" style="background:var(--bg-subtil); border:1px solid var(--border-kort); border-radius:4px; color:var(--text-prim); font-size:12px; padding:5px 6px; color-scheme:dark; flex-shrink:0; width:85px;" title="Tidspunkt for IFS-svar (overstyr ved behov)">
                        <input type="text" id="svar-${r.resId}" placeholder="Svar fra Teams..." style="flex:1; background:var(--bg-subtil); border:1px solid var(--border-kort); border-radius:4px; color:var(--text-prim); font-size:12px; padding:5px 8px;">
                        <button onclick="event.stopPropagation(); var i=document.getElementById('svar-${r.resId}'); var t=document.getElementById('svar-tid-${r.resId}'); if(i.value.trim()){ window._popupChannel.postMessage({type:'SETT_SVAR', resId:'${r.resId}', reqId:'${p.reqId}', svarTekst:i.value.trim(), svarTid:t ? t.value : ''}); i.value=''; }" style="background:#10b981; color:white; border:none; border-radius:4px; padding:5px 10px; font-size:11px; cursor:pointer;">Svar</button>
                    </div>
                </div>
            `;
            leggIGruppe(r.transportor, _minSiden, _html);
        });

        // 2) Lokale optimistiske (som ennå ikke er parsed fra admin)
        _lokaleEPT.forEach((lokalt, resId) => {
            if (parsedResIds.has(resId)) return; // Allerede vist fra admin
            if (window._lokaleIFS && window._lokaleIFS.has(String(resId))) return; // Optimistisk skjult IFS
            if (lokalt.besvartMs && (Date.now() - lokalt.besvartMs) > 5 * 60 * 1000) {
                _lokaleEPT.delete(resId);
                return;
            }
            const minSiden = Math.floor((Date.now() - lokalt.registrertMs) / 60000);
            const turidKort = lokalt.turid ? lokalt.turid.toString().slice(-8) : '';
            // Slå opp fersk sutiStatus fra kandidat hvis tilgjengelig — viser bil-status også for optimistiske kort
            const _lokRessurs = (window.smsKandidater || []).find(kk => String(kk.resId) === String(resId));
            const _lokPasient = _lokRessurs && _lokRessurs.pasienter
                ? (_lokRessurs.pasienter.find(pp => String(pp.reqId) === String(lokalt.reqId)) || _lokRessurs.pasienter[0])
                : null;
            const _lokSuti = _lokPasient && _lokPasient.sutiStatus ? _lokPasient.sutiStatus : null;
            const _lokBs = effektivBilStatus(_lokPasient, resId);
            const _lokBilStatus = _lokBs.tekst;
            const _lokLoyve = _lokBs.loyve;
            const _lokRetning = _lokPasient ? (_lokPasient.erTur ? 'TUR' : 'RETUR') : '';
            const _htmlLokal = `
                <div class="oppf-kort" data-resid="${resId}" style="background:var(--bg-kort); border:1px solid var(--border-kort); border-left:3px solid ${lokalt.besvartMs ? '#10b981' : '#f59e0b'}; border-radius:6px; padding:10px; margin-bottom:8px; opacity:0.95;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1;">
                            <span class="ovr-markbox" data-resid="${resId}"
                                  onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'MARKER_RAD', resId:'${resId}'})"
                                  style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border:2px solid #64748b; border-radius:4px; cursor:pointer; font-size:14px; font-weight:700; color:transparent; background:transparent; transition:all 0.15s; flex-shrink:0;"
                                  title="Merk turen i NISSY">\u2713</span>
                            <div style="font-weight:700; font-size:16px;">${turidKort || '(ingen turid)'} <span style="font-size:13px; color:var(--text-sek); font-weight:500;">\u2014 ${lokalt.transportor || '\u2014'}</span></div>
                        </div>
                        <div style="font-size:10px; color:var(--text-sek); font-style:italic;">lokal</div>
                    </div>
                    <div style="font-size:12px; color:var(--text-sek); margin-bottom:4px;">${lokalt.pasientNavn || '(ukjent)'}${_lokRetning ? ' \u00b7 ' + _lokRetning : ''} \u00b7 ${_lokBilStatus}${_lokLoyve ? ' \u00b7 ' + _lokLoyve : ''}</div>
                    <div style="font-size:12px; color:var(--text-prim); margin-bottom:4px;">
                        <span style="background:#dc2626; color:white; padding:1px 4px; border-radius:3px; font-size:8px; font-weight:700; margin-right:4px;">EPT</span>
                        Etterlyst ${lokalt.tid} \u00b7 ${minSiden} min siden
                    </div>
                    ${lokalt.besvartMs ? `<div style="font-size:11px; color:#10b981; margin-top:6px;">\u2713 Svart: ${lokalt.svarTekst}</div>` : `
                        <div style="display:flex; gap:4px; margin-top:6px;">
                            <input type="time" id="svar-tid-${resId}" value="${new Date().toTimeString().slice(0,5)}" style="background:var(--bg-subtil); border:1px solid var(--border-kort); border-radius:4px; color:var(--text-prim); font-size:12px; padding:5px 6px; color-scheme:dark; flex-shrink:0; width:85px;" title="Tidspunkt for IFS-svar (overstyr ved behov)">
                            <input type="text" id="svar-${resId}" placeholder="Svar fra Teams..." style="flex:1; background:var(--bg-subtil); border:1px solid var(--border-kort); border-radius:4px; color:var(--text-prim); font-size:12px; padding:5px 8px;">
                            <button onclick="event.stopPropagation(); var i=document.getElementById('svar-${resId}'); var t=document.getElementById('svar-tid-${resId}'); if(i.value.trim()){ window._popupChannel.postMessage({type:'SETT_SVAR', resId:'${resId}', reqId:'${lokalt.reqId}', svarTekst:i.value.trim(), svarTid:t ? t.value : ''}); i.value=''; }" style="background:#10b981; color:white; border:none; border-radius:4px; padding:5px 10px; font-size:11px; cursor:pointer;">Svar</button>
                        </div>
                    `}
                </div>
            `;
            leggIGruppe(lokalt.transportor, minSiden, _htmlLokal);
        });

        // Bygg HTML: sorter grupper etter eldste EPT (høyest minSiden først), og sorter kort innen gruppe likt
        const sorterteGrupper = Array.from(oppfGrupper.entries())
            .sort((a, b) => b[1].eldsteMinSiden - a[1].eldsteMinSiden);
        let tellOppfolging = 0;
        const gruppeHtml = sorterteGrupper.map(([navn, g]) => {
            tellOppfolging += g.kort.length;
            g.kort.sort((a, b) => b.minSiden - a.minSiden);
            const header = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin:${sorterteGrupper[0][0] === navn ? '0' : '14px'} 0 6px; padding:4px 6px; background:var(--bg-subtil); border-left:3px solid #dc2626; border-radius:3px;">
                    <span style="font-weight:700; color:var(--text-prim); font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">${navn}</span>
                    <span style="font-size:11px; color:var(--text-sek);">${g.kort.length} · eldste ${g.eldsteMinSiden}m</span>
                </div>
            `;
            return header + g.kort.map(k => k.html).join('');
        }).join('');

        const hoyreKolonne = `
            <div style="background:var(--bg-side); border:1px solid var(--border-lys); border-radius:8px; padding:12px; display:flex; flex-direction:column; overflow:hidden; min-height:0;">
                <h4 style="color:#dc2626; margin:0 0 10px; font-size:18px; flex-shrink:0;">\ud83d\udccb Oppf\u00f8lging av etterlysning (${tellOppfolging})</h4>
                <div style="overflow-y:auto; flex:1; min-height:0;">
                    ${tellOppfolging > 0 ? gruppeHtml : '<div style="color:var(--text-dempet); font-size:12px; text-align:center; padding:20px;">Ingen aktive etterlysninger</div>'}
                </div>
            </div>
        `;

        // Dummy for bakoverkompatibilitet med koden nedenfor
        const kolonner = seksjoner;
        const erDev = VERSJON_FULL.includes('dev');
        const gridCols = '2fr 1fr';

        // Manuell overv\u00e5king-seksjon
        let tellSok = 0;
        for (let si = 0; si < sokRessurser.length; si++) {
            tellSok += sokRessurser[si].pasienter ? sokRessurser[si].pasienter.length : 0;
        }

        const lagredeSok = window.sokLagrede || [];
        const harSokData = sokRessurser.length > 0 || lagredeSok.length > 0;

        // Bygg liste over aktive overv\u00e5kinger
        let sokListeHtml = '';
        if (lagredeSok.length > 0) {
            sokListeHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:${sokRessurser.length > 0 ? '10px' : '0'};">`;
            lagredeSok.forEach(sg => {
                const typeLabel = sg.sokType === 'PNR' ? 'PNR' : sg.sokType === 'REK' ? 'REK' : 'TUR';
                const antallTreff = sokRessurser.filter(r => r.resId === sg.sokResId).reduce(function(s,r){ return s + (r.pasienter ? r.pasienter.length : 0); }, 0);
                sokListeHtml += `<span style="display:inline-flex; align-items:center; gap:4px; background:var(--bg-kort-sok); border:1px solid var(--border-kort); border-radius:4px; padding:3px 8px; font-size:12px; color:#5b21b6;">
                    <strong>${typeLabel}:</strong> ${sg.sokVerdi} ${antallTreff > 0 ? '<span style="color:#7c3aed;">(' + antallTreff + ')</span>' : '<span style="color:var(--text-dempet);">(0)</span>'}
                    <span onclick="window._popupChannel.postMessage({type:'FJERN_SOK', resId:'${sg.sokResId}'})" style="cursor:pointer; color:#7c3aed; font-weight:bold; margin-left:2px; opacity:0.7;" onmouseover="this.style.opacity='1';this.style.color='#ef4444'" onmouseout="this.style.opacity='0.7';this.style.color='#7c3aed'">\u2715</span>
                </span>`;
            });
            sokListeHtml += '</div>';
        }

        const sokSeksjon = harSokData ? `
            <div style="background:var(--bg-kort-sok); border:1px solid var(--border-kort); border-radius:8px; padding:12px; margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px; cursor:pointer;" onclick="var c=document.getElementById('sok-innhold'); var a=this.querySelector('.sok-arrow'); if(c.style.display==='none'){c.style.display='block';a.textContent='\u25bc';}else{c.style.display='none';a.textContent='\u25b6';}">
                    <span class="sok-arrow" style="font-size:12px; color:#7c3aed;">\u25bc</span>
                    <h4 style="color:#7c3aed; margin:0; font-size:18px;">\ud83d\udd0d Manuell overv\u00e5king (${tellSok})</h4>
                </div>
                <div id="sok-innhold">
                    ${sokListeHtml}
                    ${sokRessurser.map(r => lagRessursKort(r, false)).join('')}
                </div>
            </div>
        ` : '';

        cont.innerHTML = `
            ${sokSeksjon}
            <div style="display:grid; grid-template-columns:${gridCols}; gap:16px; flex:1; overflow:hidden; min-height:0;">
                ${venstreKolonne}
                ${hoyreKolonne}
            </div>
            ${iCooldown.length > 0 ? `<div style="text-align:center;padding:6px;color:var(--text-sek);font-size:12px;flex-shrink:0;">\u2709 ${iCooldown.length} pasient${iCooldown.length > 1 ? 'er' : ''} har f\u00e5tt SMS \u2014 venter p\u00e5 neste runde</div>` : ''}
        `;

        // Re-apply highlight etter re-render
        applyHighlight();

        // Flytende debug-panel i dev
        try {
            const _w = window.smsWin;
            if (erDev && _w && !_w.closed) {
                let floatDbg = _w.document.getElementById('debug-float');
                if (!floatDbg) {
                    floatDbg = _w.document.createElement('div');
                    floatDbg.id = 'debug-float';
                    floatDbg.style.cssText = 'position:fixed; top:60px; right:8px; width:320px; max-height:calc(100vh - 80px); background:rgba(15,23,42,0.95); border:1px solid #334155; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.5); display:flex; flex-direction:column; z-index:9999; font-family:monospace; font-size:10px; backdrop-filter:blur(8px); resize:both; overflow:hidden;';
                    floatDbg.innerHTML = `<div style="padding:8px 12px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; cursor:move;" onmousedown="(function(e){var el=e.target.closest('#debug-float');var sx=e.clientX-el.offsetLeft,sy=e.clientY-el.offsetTop;function mv(e2){el.style.left=e2.clientX-sx+'px';el.style.right='auto';el.style.top=e2.clientY-sy+'px';}function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);}document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);})(event)"><span style="color:#94a3b8; font-weight:700; font-size:12px;">🔧 Debug</span><button onclick="this.closest('#debug-float').style.display='none'" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:14px; padding:0;">✕</button></div><div id="debug-float-filtre" style="padding:6px 10px; border-bottom:1px solid #334155; display:flex; flex-wrap:wrap; gap:6px; flex-shrink:0;"></div><div id="debug-kolonne-logg" style="overflow-y:auto; flex:1; padding:8px 10px; color:#94a3b8; line-height:1.6; min-height:0;"></div>`;
                    _w.document.body.appendChild(floatDbg);
                }
                const filtreDiv = _w.document.getElementById('debug-float-filtre');
                if (filtreDiv) {
                    const d = window._dbgFiltre || { status: true, terskel: true, bomtur: true, avtale: true };
                    const filtre = [
                        { id: 'visAlle', navn: 'Vis alle', aktiv: d.visAlle, invert: true },
                        { id: 'sms', navn: 'SMS', aktiv: d.sms },
                        { id: 'ept', navn: 'EPT', aktiv: d.ept },
                        { id: 'status', navn: 'Status', aktiv: d.status },
                        { id: 'terskel', navn: 'Terskel', aktiv: d.terskel },
                        { id: 'bomtur', navn: 'Bomtur', aktiv: d.bomtur },
                        { id: 'avtale', navn: 'Avtale', aktiv: d.avtale },
                    ];
                    filtreDiv.innerHTML = filtre.map(f => {
                        const on = f.invert ? f.aktiv : f.aktiv;
                        const col = f.invert ? (f.aktiv ? '#f59e0b' : '#64748b') : (f.aktiv ? '#10b981' : '#ef4444');
                        return `<label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:10px;font-weight:600;color:${col};"><input type="checkbox" data-dbg="${f.id}" ${f.aktiv ? 'checked' : ''} onchange="window._popupChannel.postMessage({type:'TOGGLE_DBG_FILTER',felt:'${f.id}',checked:this.checked})" style="width:11px;height:11px;accent-color:${f.invert ? '#f59e0b' : '#10b981'};">${f.navn}</label>`;
                    }).join('') + `<button onclick="window._popupChannel.postMessage({type:'TOMM_ADMIN_CACHE'})" style="margin-left:auto; background:#7c3aed; color:white; border:none; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:600; cursor:pointer;" title="Tvinger ny henting av admin-HTML ved neste skan">🗑 Cache</button>`;
                }
                const dbgCol = _w.document.getElementById('debug-kolonne-logg');
                if (dbgCol) { dbgCol.innerHTML = debugLog.join('<br>'); dbgCol.scrollTop = dbgCol.scrollHeight; }
            }
        } catch(_e) { /* debug-float feilet stille */ }
    }

    // === Oversikt over alle forsinkede reiser (passert hentetidspunkt) ===
    // Viser alle kandidater uavhengig av SMS/etterlysnings-status, slik at
    // operatøren kan se hele bildet og vurdere når det skal etterlyses/sendes SMS
    function oppdaterVentende() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        const ventDiv = win.document.getElementById('ventende-panel');
        if (!ventDiv) return;

        const kandidater = window.smsKandidater || [];
        // Alle forsinkede reiser (allerede filtrert p\u00e5 passert hentetidspunkt i kjorAnalyse)
        const ventendeKandidater = kandidater.slice();
        
        // Grupper ventende kandidater per ressurs (samme logikk som oppdaterVisning)
        const ressursMap = new Map();
        ventendeKandidater.forEach(k => {
            const resId = k.resId || k.reqId;
            if (!ressursMap.has(resId)) {
                ressursMap.set(resId, {
                    resId,
                    pasienter: [],
                    sutiStatus: k.sutiStatus,
                    avviksLogg: k.avviksLogg || [],
                    startTid: k.startTid,
                    startTidMs: k.startTidMs,
                    forsinkelse: k.forsinkelse,
                    erTur: k.erTur,
                    status: k.status,
                    transportor: k.transportor,
                    loyveTur: k.loyveTur,
                    turId: k.turId,
                    harRB: false,
                    harTK: false,
                    harERS: false,
                    harFly: false,
                    harIA: false,
                    flyInfo: null
                });
            }
            const gruppe = ressursMap.get(resId);
            gruppe.pasienter.push(k);
            if (k.forsinkelse > gruppe.forsinkelse) gruppe.forsinkelse = k.forsinkelse;
            if (k.spesielleBehov) {
                if (/\bRB\b/i.test(k.spesielleBehov)) gruppe.harRB = true;
                if (/\bTK\b/i.test(k.spesielleBehov)) gruppe.harTK = true;
                if (/\bERS\b/i.test(k.spesielleBehov)) gruppe.harERS = true;
            }
            if (k.henteAdresseFull && /gardermoen/i.test(k.henteAdresseFull)) {
                gruppe.harFly = true;
                if (!gruppe.flyInfo) {
                    gruppe.flyInfo = byggFlyInfo(k.meldingTilTransportor);
                }
            }
            if (k.erIA) gruppe.harIA = true;
            if (k.avviksLogg && k.avviksLogg.length > 0) {
                k.avviksLogg.forEach(a => {
                    if (!gruppe.avviksLogg.includes(a)) gruppe.avviksLogg.push(a);
                });
            }
        });
        
        const ventende = Array.from(ressursMap.values());
        ventende.sort((a, b) => b.forsinkelse - a.forsinkelse);
        
        if (ventende.length === 0) {
            ventDiv.innerHTML = `
                <h3 style="margin:0 0 10px 0; color:#7c3aed;">\u23f3 Alle forsinkede reiser</h3>
                <div style="color:var(--text-sek); text-align:center; padding:10px;">Ingen SMS- eller etterlysningskandidater</div>
            `;
            return;
        }

        // Gjenbruk lagRessursKort fra oppdaterVisning (lagret som window-funksjon)
        let html = `<h3 style="margin:0 0 10px 0; color:#7c3aed;">\u23f3 Alle forsinkede reiser (${ventende.length} ressurser, ${ventendeKandidater.length} pasienter)</h3>`;
        
        html += ventende.map(r => window._lagRessursKort(r, false)).join('');
        
        ventDiv.innerHTML = html;
    }

    // === Highlight ressurs-kort i popup ===
    function highlightRessursKort(resId) {
        const win = window.smsWin;
        if (!win || win.closed) return;

        // Toggle: klikk samme → avvelg, klikk annen → bytt
        if (window._valgtResId === resId) {
            window._valgtResId = null;
        } else {
            window._valgtResId = resId;
        }
        applyHighlight();
    }

    function applyHighlight() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        const valgt = window._valgtResId;

        // Fjern highlight fra alle kort
        win.document.querySelectorAll('.ressurs-kort').forEach(k => {
            k.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)';
            k.style.border = '1px solid #e5e7eb';
        });

        // Sett highlight på valgt kort
        if (valgt) {
            const kort = win.document.getElementById(`ressurs-${valgt}`);
            if (kort) {
                kort.style.boxShadow = '0 0 0 3px #8b5cf6, 0 2px 8px rgba(0,0,0,0.12)';
                kort.style.border = '1px solid #8b5cf6';
            }
        }

        // Oppdater alle markerings-checkboxer (både på ressurs-kort og oppfølgings-kort)
        win.document.querySelectorAll('.ovr-markbox').forEach(box => {
            const boxResId = box.getAttribute('data-resid');
            const erValgt = boxResId === valgt;
            box.style.background = erValgt ? '#8b5cf6' : 'transparent';
            box.style.borderColor = erValgt ? '#8b5cf6' : '#64748b';
            box.style.color = erValgt ? '#ffffff' : 'transparent';
        });
    }
    
    // Lytt på klikk i NISSY-tabellen og synkroniser highlight
    document.addEventListener('click', e => {
        const rad = e.target.closest('tr[id^="P-"]');
        if (rad) {
            const resId = rad.id.replace('P-', '');
            highlightRessursKort(resId);
            if (window._valgtResId) {
                addDebugLog(`\ud83d\uddb1\ufe0f Valgt ${resId} i NISSY`);
                const kort = window.smsWin && !window.smsWin.closed ? window.smsWin.document.getElementById(`ressurs-${resId}`) : null;
                if (kort) kort.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                addDebugLog(`\ud83d\uddb1\ufe0f Avvalgt i NISSY`);
            }
        } else {
            window._valgtResId = null;
            applyHighlight();
        }
    });
    
    function fjernHighlight() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        win.document.querySelectorAll('.ressurs-kort').forEach(kort => {
            kort.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)';
            kort.style.border = '1px solid #e5e7eb';
        });
    }

    // === SMS Send-funksjon (direkte kall, ikke via meldingskanal) ===
    async function utforSendSMS({ smsId, reqId, resId, telefon, navn, forsinkelse, erTur, smsRunde }) {
        const melding = smsRunde >= 2 ? SMS_MELDINGER.RUNDE2() : (erTur ? SMS_MELDINGER.TUR() : SMS_MELDINGER.RETUR());

        // Duplikatsjekk
        const tidligereSendt = await window.smsDB.get(smsId);
        if (tidligereSendt) {
            addDebugLog(`\u26a0\ufe0f SMS allerede sendt: ${smsId}`);
            return { ok: false, grunn: 'duplikat' };
        }

        // Bruk pasientens telefonnummer
        const mottaker = telefon.replace(/\+47/, '').replace(/\s+/g, '');

        addDebugLog(`Sender SMS til ${mottaker}...`);

        try {
            const smsLogId = resId ? `Rxxx${resId}` : `R${reqId}`;

            // Encode melding som ISO-8859-1 (MQ forventer dette)
            const encodeISO = (str) => {
                const iso = { '\u00e6':'%E6','\u00f8':'%F8','\u00e5':'%E5','\u00c6':'%C6','\u00d8':'%D8','\u00c5':'%C5' };
                return str.split('').map(c => iso[c] || encodeURIComponent(c)).join('');
            };
            const smsUrl = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?update=false&action=setSendSMS&to=${mottaker}&message=${encodeISO(melding)}&id=${smsLogId}&template=`;

            const response = await fetch(smsUrl);
            const responseText = await response.text();

            if (responseText.includes('SMS sendt')) {
                addDebugLog(`\u2713 SMS SENDT til ${mottaker}`);

                await window.smsDB.set(smsId, {
                    reqId,
                    pasientTelefon: telefon,
                    sendtTil: mottaker,
                    navn,
                    melding,
                    forsinkelse,
                    erTur,
                    timestamp: Date.now(),
                    dato: new Date().toISOString().split('T')[0]
                });

                window.smsStats.sendtSms++;

                const kandidat = window.smsKandidater.find(k => k.smsId === smsId);
                if (kandidat) { kandidat.alleredeSendt = true; kandidat.kanSendeSms = false; }

                oppdaterStats();
                oppdaterVisning(window.smsKandidater);
                // Trigg ny analyse så kanEtterlyse reflekterer fersk tilstand — hindrer at en tur
                // akkurat ved etterlys-terskel blir hengende i cooldown-lista i ~30 sek
                kjorAnalyse();
                return { ok: true, mottaker };
            } else {
                addDebugLog(`\u2717 SMS FEILET for ${mottaker}`);
                return { ok: false, grunn: 'feilet' };
            }
        } catch (error) {
            addDebugLog(`\u2717 FEIL: ${error.message}`);
            return { ok: false, grunn: error.message };
        }
    }

    // === Meldingsh\u00e5ndtering ===
    ovrChannel.onmessage = async (e) => {
        if (e.data.type === 'MARKER_RAD') {
            const { resId } = e.data;
            
            // Highlight ressurs-kort i popup
            highlightRessursKort(resId);
            
            // Fjern alltid skriptets outline f\u00f8rst
            document.querySelectorAll('tr[id^="P-"]').forEach(tr => {
                tr.style.outline = '';
            });
            
            if (resId && typeof selectRow === 'function' && document.getElementById(`P-${resId}`)) {
                // Bruk NISSY sin innebygde selectRow-funksjon (h\u00e5ndterer toggle selv)
                selectRow(`P-${resId}`, g_poppLS);
                addDebugLog(`\ud83c\udfaf Markerte rad P-${resId} i NISSY`);
                
                const rad = document.getElementById(`P-${resId}`);
                if (rad) {
                    rad.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // Fallback kun n\u00e5r NISSY sin selectRow ikke finnes
                const rad = document.getElementById(`P-${resId}`);
                if (rad) {
                    rad.style.outline = '3px solid #f59e0b';
                    rad.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    addDebugLog(`\ud83c\udfaf Markerte rad P-${resId} (fallback)`);
                } else {
                    addDebugLog(`\u26a0 Fant ikke rad P-${resId}`);
                }
            }
        }
        
        if (e.data.type === 'VIS_PLAKAT') {
            const { reqId, resId } = e.data;
            
            // Vis rekvisisjonsplakat
            if (reqId && typeof showReq === 'function') {
                // Finn et element \u00e5 bruke som referanse (eller bruk null)
                const rad = document.getElementById(`P-${resId}`);
                const plakatImg = rad?.querySelector('img[onmouseover*="showReq"]');
                showReq(plakatImg || document.body, reqId, 1320);
                addDebugLog(`\ud83d\udccb Viser rekvisisjonsplakat for ${reqId}`);
            }
            
            // Vis ressursplakat
            if (resId && typeof showRes === 'function') {
                const rad = document.getElementById(`P-${resId}`);
                const resImg = rad?.querySelector('img[onmouseover*="showRes"]');
                showRes(resImg || document.body, resId, 1320);
                addDebugLog(`\ud83d\udccb Viser ressursplakat for ${resId}`);
            }
            
            // Scroll til raden
            if (resId) {
                const rad = document.getElementById(`P-${resId}`);
                if (rad) {
                    rad.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
        
        if (e.data.type === 'VIS_REQ') {
            const { reqId, nissyReqId, nissyTripId, erSok } = e.data;
            console.log('VIS_REQ mottatt:', { reqId, nissyReqId, nissyTripId, erSok });
            const visReqId = erSok ? nissyReqId : reqId;
            if (visReqId && typeof showReq === 'function') {
                try {
                    showReq(document.body, visReqId, 1320);
                    addDebugLog(`\ud83d\udccb \u00c5pnet rekvisisjonsplakat ${visReqId}`);
                } catch(err) {
                    addDebugLog(`\u26a0\ufe0f showReq feilet: ${err.message}`);
                }
            }
        }

        if (e.data.type === 'VIS_RES') {
            const { resId, nissyTripId, erSok } = e.data;
            if (typeof showRes === 'function') {
                const rad = document.getElementById(`P-${erSok ? nissyTripId : resId}`);
                if (rad) {
                    const resImg = rad.querySelector('img[onmouseover*="showRes"]');
                    const tabellResId = rad.getAttribute('name') || rad.id.replace('P-', '');
                    showRes(resImg || document.body, tabellResId, 1320);
                    addDebugLog(`\ud83d\ude97 \u00c5pnet ressursplakat ${tabellResId}`);
                } else if (erSok) {
                    addDebugLog(`\ud83d\ude97 Ressursplakat ikke tilgjengelig for s\u00f8keresultat`);
                    const win = window.smsWin;
                    if (win && !win.closed) {
                        let varsel = win.document.getElementById('res-varsel');
                        if (!varsel) {
                            varsel = win.document.createElement('div');
                            varsel.id = 'res-varsel';
                            varsel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#dc2626; color:white; padding:20px 30px; border-radius:10px; font-size:16px; font-weight:600; z-index:99999; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.3); cursor:pointer;';
                            varsel.innerHTML = '\ud83d\uded1 Ressursplakat er ikke tilgjengelig for s\u00f8keresultater';
                            varsel.onclick = function() { varsel.remove(); };
                            win.document.body.appendChild(varsel);
                            setTimeout(function() { if (varsel.parentNode) varsel.remove(); }, 3000);
                        }
                    }
                }
            }
        }
        
        if (e.data.type === 'SMS_PREVIEW') {
            const { smsId, reqId, resId, telefon, alleTelefoner: alleTlfStr, navn, forsinkelse, erTur, smsRunde } = e.data;
            const alleTelefoner = alleTlfStr ? alleTlfStr.split(',').filter(n => n.length > 0) : [];
            
            const melding = smsRunde >= 2 ? SMS_MELDINGER.RUNDE2() : (erTur ? SMS_MELDINGER.TUR() : SMS_MELDINGER.RETUR());
            
            const win = window.smsWin;
            if (!win || win.closed) return;
            
            // Fjern evt. eksisterende modal
            const existing = win.document.getElementById('sms-modal');
            if (existing) existing.remove();
            
            const rundeBg = smsRunde >= 2 ? 'var(--bg-ept)' : 'var(--bg-geo, #dbeafe)';
            const rundeFarge = smsRunde >= 2 ? '#92400e' : '#1d4ed8';
            
            // Slå opp kilde-info fra kandidat-listen
            const kildeLabels = { MOB: 'Mobil', EPJ: 'EPJ', MOB2: 'Mobil 2', 'RING-H': 'Ring hentested', RING: 'Ring ankomst', ADR: 'Adresse' };
            const kandidat = window.smsKandidater ? window.smsKandidater.find(k => k.reqId === reqId) : null;
            const numreMedKilde = kandidat && kandidat.alleNumreMedKilde ? kandidat.alleNumreMedKilde : [];

            // Bygg telefon-valg: checkboxer for alle numre + tomt felt for manuelt
            const numre = alleTelefoner && alleTelefoner.length > 0 ? alleTelefoner : (telefon ? [telefon.replace(/[\s+\-]/g, '').slice(-8)] : []);
            const telefonHtml = `
                <div id="sms-telefoner" style="display:flex; flex-direction:column; gap:6px;">
                    ${numre.map((nr, i) => {
                        const info = numreMedKilde.find(n => n.nr8 === nr);
                        const kildeLabel = info ? (kildeLabels[info.kilde] || info.kilde) : '';
                        return `
                        <label style="display:flex; align-items:center; gap:8px; background:var(--bg-subtil); padding:8px 10px; border-radius:6px; cursor:pointer; border:2px solid #e2e8f0;">
                            <input type="checkbox" name="sms-nr" value="${nr}" ${i === 0 ? 'checked' : ''} style="width:18px; height:18px; accent-color:#8b5cf6; cursor:pointer;">
                            <span style="font-size:16px; font-weight:600; color:var(--text-prim);">+47 ${nr}</span>
                            ${kildeLabel ? `<span style="font-size:11px; color:var(--text-sek); margin-left:auto;">${kildeLabel}</span>` : ''}
                        </label>`;
                    }).join('')}
                    <div style="display:flex; align-items:center; gap:8px; background:var(--bg-kort); padding:8px 10px; border-radius:6px; border:2px dashed #cbd5e1;">
                        <input type="checkbox" name="sms-nr" value="" id="sms-manuelt-cb" style="width:18px; height:18px; accent-color:#8b5cf6; cursor:pointer;">
                        <input type="text" id="sms-manuelt-nr" placeholder="Annet nummer..." style="flex:1; border:none; background:transparent; font-size:14px; color:var(--text-prim); outline:none; padding:2px 0;"
                               onfocus="document.getElementById('sms-manuelt-cb').checked=true"
                               oninput="var v=this.value.replace(/[^0-9]/g,''); if(v.length>8) v=v.slice(-8); this.value=v; document.getElementById('sms-manuelt-cb').value=v;">
                    </div>
                </div>`;
            
            const modal = win.document.createElement('div');
            modal.id = 'sms-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;';
            modal.innerHTML = `
                <div style="background:var(--bg-hvit); border-radius:12px; padding:24px; max-width:460px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div style="font-size:16px; font-weight:700; color:var(--text-prim);">\ud83d\udcac SMS Preview</div>
                        <span style="display:inline-block; background:${rundeBg}; color:${rundeFarge}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">Runde ${smsRunde}</span>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:11px; color:var(--text-sek); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Pasient</div>
                        <div style="background:var(--bg-subtil); padding:10px; border-radius:6px; font-size:13px; color:var(--text-meny);">${navn}</div>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:11px; color:var(--text-sek); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Telefon \u2014 velg mottaker(e)</div>
                        ${telefonHtml}
                    </div>
                    <div style="margin-bottom:16px;">
                        <div style="font-size:11px; color:var(--text-sek); font-weight:600; text-transform:uppercase; margin-bottom:4px;">Melding</div>
                        <div style="background:var(--bg-subtil); padding:10px; border-radius:6px; font-size:13px; line-height:1.5; color:var(--text-meny);">${melding}</div>
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="sms-avbryt" style="border:none; padding:10px 20px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; background:var(--bg-kort-header); color:var(--text-sek);">Avbryt</button>
                        <button id="sms-send" style="border:none; padding:10px 20px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; background:#8b5cf6; color:white;">Send SMS</button>
                    </div>
                </div>
            `;
            win.document.body.appendChild(modal);
            
            // Klikk utenfor lukker
            modal.addEventListener('click', (ev) => {
                if (ev.target === modal) modal.remove();
            });
            
            // Avbryt
            win.document.getElementById('sms-avbryt').addEventListener('click', () => modal.remove());

            // Aktiver/deaktiver Send basert på valgte numre
            function oppdaterSendKnapp() {
                const sendBtn = win.document.getElementById('sms-send');
                if (!sendBtn) return;
                const checkboxer = win.document.querySelectorAll('#sms-telefoner input[name="sms-nr"]:checked');
                const harGyldig = Array.from(checkboxer).some(cb => cb.value.replace(/\s+/g, '').length >= 8);
                sendBtn.disabled = !harGyldig;
                sendBtn.style.opacity = harGyldig ? '1' : '0.4';
                sendBtn.style.cursor = harGyldig ? 'pointer' : 'not-allowed';
            }
            oppdaterSendKnapp();
            // Lytt på checkbox-endringer
            win.document.querySelectorAll('#sms-telefoner input[name="sms-nr"]').forEach(cb => {
                cb.addEventListener('change', oppdaterSendKnapp);
            });
            // Lytt på manuelt nummer-input
            const manueltNr = win.document.getElementById('sms-manuelt-nr');
            if (manueltNr) manueltNr.addEventListener('input', oppdaterSendKnapp);

            // Send
            win.document.getElementById('sms-send').addEventListener('click', async () => {
                const sendBtn = win.document.getElementById('sms-send');
                
                // Samle alle avkryssede numre
                const checkboxer = win.document.querySelectorAll('#sms-telefoner input[name="sms-nr"]:checked');
                const valgteTelefoner = Array.from(checkboxer)
                    .map(cb => cb.value.replace(/\s+/g, ''))
                    .filter(nr => nr.length >= 8);
                
                if (valgteTelefoner.length === 0) {
                    // Marker feil
                    win.document.getElementById('sms-telefoner').style.outline = '2px solid #ef4444';
                    setTimeout(() => { win.document.getElementById('sms-telefoner').style.outline = 'none'; }, 2000);
                    return;
                }
                
                sendBtn.disabled = true;
                sendBtn.textContent = `Sender til ${valgteTelefoner.length}...`;
                sendBtn.style.background = '#9ca3af';

                // Send til alle valgte numre direkte via utforSendSMS()
                const resultater = await Promise.all(
                    valgteTelefoner.map((nr, idx) => {
                        const thisSmsId = idx === 0 ? smsId : `${smsId}_${nr}`;
                        return utforSendSMS({ smsId: thisSmsId, reqId, resId, telefon: nr, navn, forsinkelse, erTur, smsRunde });
                    })
                );

                const vellykket = resultater.filter(r => r.ok).length;
                const feilet = resultater.filter(r => !r.ok).length;

                if (feilet === 0) {
                    sendBtn.textContent = `Sendt til ${vellykket}! \u2713`;
                    sendBtn.style.background = '#10b981';
                    // Skjul pasient-plakat etter sending (samkjøring-bevisst)
                    if (reqId) {
                        const pasDiv = win.document.querySelector(`[data-turid="${reqId}"]`);
                        if (pasDiv) {
                            pasDiv.style.transition = 'opacity 0.5s ease, max-height 0.5s ease, margin 0.5s ease';
                            pasDiv.style.opacity = '0.3';
                            setTimeout(() => {
                                pasDiv.style.maxHeight = '0';
                                pasDiv.style.overflow = 'hidden';
                                pasDiv.style.marginBottom = '0';
                                pasDiv.style.opacity = '0';
                                // Sjekk om alle pasienter i ressursen er skjult → kollaps hele kortet
                                const kort = win.document.getElementById(`ressurs-${resId}`);
                                if (kort) {
                                    const synlige = kort.querySelectorAll('[data-turid]');
                                    const alleSkjult = Array.from(synlige).every(d => d.style.opacity === '0');
                                    if (alleSkjult) {
                                        kort.style.transition = 'opacity 0.5s ease, max-height 0.5s ease, margin 0.5s ease';
                                        kort.style.opacity = '0';
                                        setTimeout(() => {
                                            kort.style.maxHeight = '0';
                                            kort.style.overflow = 'hidden';
                                            kort.style.marginBottom = '0';
                                        }, 500);
                                    }
                                }
                            }, 1500);
                        }
                    }
                } else if (vellykket > 0) {
                    sendBtn.textContent = `${vellykket} sendt, ${feilet} feilet`;
                    sendBtn.style.background = '#f59e0b';
                } else {
                    sendBtn.textContent = `Sending feilet \u2717`;
                    sendBtn.style.background = '#ef4444';
                }
                setTimeout(() => modal.remove(), 2000);
            });
        }
        
        if (e.data.type === 'SEND_SMS') {
            // Fallback: BroadcastChannel-rute (brukes hvis noen sender SEND_SMS via kanal)
            await utforSendSMS(e.data);
        }
        
        if (e.data.type === 'SNOOZE') {
            const utlop = Date.now() + (e.data.minutter || 10) * 60000;
            window.smsSnooze[e.data.reqId] = utlop;
            addDebugLog(`\u23f8 Snooze ${e.data.reqId} i ${e.data.minutter}m`);
            if (window.smsKandidater) oppdaterVisning(window.smsKandidater);
            return;
        }
        if (e.data.type === 'SNOOZE_EPT') {
            if (!window._snoozeEPT) window._snoozeEPT = {};
            window._snoozeEPT[e.data.reqId] = Date.now() + (e.data.minutter || 15) * 60000;
            if (typeof lagreSnooze === 'function') lagreSnooze();
            addDebugLog(`\u23f8 EPT utsatt ${e.data.reqId} i ${e.data.minutter}m`);
            if (window.smsKandidater) oppdaterVisning(window.smsKandidater);
            return;
        }
        if (e.data.type === 'SNOOZE_SMS') {
            if (!window._snoozeSMS) window._snoozeSMS = {};
            window._snoozeSMS[e.data.reqId] = Date.now() + (e.data.minutter || 10) * 60000;
            if (typeof lagreSnooze === 'function') lagreSnooze();
            addDebugLog(`\u23f8 SMS utsatt ${e.data.reqId} i ${e.data.minutter}m`);
            if (window.smsKandidater) oppdaterVisning(window.smsKandidater);
            return;
        }

        if (e.data.type === 'SMS_REFRESH') {
            kjorAnalyse();
        }

        if (e.data.type === 'FJERN_SOK') {
            const sokInput = document.querySelector('#freeTextSearch')
                || document.querySelector('input[name="search"]')
                || document.querySelector('input[name="freeText"]');
            if (sokInput) { sokInput.value = ''; addDebugLog('S\u00f8kefelt t\u00f8mt'); }
            kjorAnalyse();
        }

        if (e.data.type === 'BYTT_FILTER') {
            aktivtRfilter = e.data.filter;
            localStorage.setItem('overvaker_rfilter', aktivtRfilter);
            addDebugLog(`\ud83d\udd04 Byttet filter til ${aktivtRfilter}`);
            kjorAnalyse();
        }

        if (e.data.type === 'SOK_TURID') {
            const sokVerdi = e.data.turId;
            if (!sokVerdi) return;
            
            // Detekter s\u00f8ketype basert p\u00e5 lengde: 8=TUR, 11=PNR, 12=REK
            const kun_siffer = /^\d+$/.test(sokVerdi);
            const erPnr = kun_siffer && sokVerdi.length === 11;
            const erRek = kun_siffer && sokVerdi.length === 12;
            const erTur = kun_siffer && sokVerdi.length === 8;
            if (!erPnr && !erRek && !erTur) {
                addDebugLog(`\u274c Ugyldig s\u00f8k: "${sokVerdi}" (forventet 8, 11 eller 12 siffer)`);
                return;
            }
            const sokType = erPnr ? 'PNR' : erRek ? 'REK' : 'TUR';
            addDebugLog(`\ud83d\udd0d S\u00f8ker ${sokType}: ${sokVerdi}`);
            
            try {
                const t = new Date().getTime();
                
                // Bygg searchStatus body basert p\u00e5 type
                let searchBody;
                if (erPnr) {
                    searchBody = `submit_action=ssnSearch&ssn=${sokVerdi}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
                } else if (erRek) {
                    searchBody = `submit_action=reqSearch&requisitionNumber=${sokVerdi}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
                } else {
                    searchBody = `submit_action=tripSearch&tripNr=${sokVerdi}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
                }
                
                addDebugLog(`\ud83d\udd0d searchStatus: ${sokType}...`);
                const searchRes = await fetch('https://pastrans-sorost.mq.nhn.no/administrasjon/admin/searchStatus', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    body: searchBody
                });
                const searchHtml = await searchRes.text();
                
                // Finn alle treff (PNR kan gi flere)
                const alleIdMatches = [];
                const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
                let idM;
                while ((idM = idRegex.exec(searchHtml)) !== null) {
                    // Unng\u00e5 duplikater (samme tripid)
                    if (!alleIdMatches.find(m => m[3] === idM[3])) {
                        alleIdMatches.push([idM[0], idM[1], idM[2], idM[3]]);
                    }
                }
                
                if (alleIdMatches.length === 0) {
                    addDebugLog(`\u274c Ingen treff for ${sokType}: ${sokVerdi}`);
                    const win = window.smsWin;
                    if (win && !win.closed) {
                        const sokInput = win.document.getElementById('turid-sok');
                        if (sokInput) { sokInput.style.borderColor = '#ef4444'; setTimeout(() => sokInput.style.borderColor = '#475569', 2000); }
                    }
                    return;
                }
                
                // Felles resId for \u00e5 gruppere alle treff i ett kort
                // Bruker sokTripId (fra NISSY) som resId, ikke s\u00f8keverdien
                let sokResId = erPnr ? `SOK_${sokVerdi}` : '';
                
                addDebugLog(`\ud83d\udd0d Fant ${alleIdMatches.length} treff for ${sokType}`);
                
                // Hent data for hvert treff (REK = alltid 1 treff, PNR kan gi flere)
                const maxTreff = erRek ? 1 : erPnr ? 10 : 5;
                for (let treffIdx = 0; treffIdx < Math.min(alleIdMatches.length, maxTreff); treffIdx++) {
                    const idMatch = alleIdMatches[treffIdx];
                    const sokAdminId = idMatch[1];
                    const sokDb = idMatch[2];
                    const sokTripId = idMatch[3];
                    
                    // turId = sokTripId (tredje parameter i getRequisitionDetails)
                    let turId = sokTripId;

                    addDebugLog(`\ud83d\udd0d Henter detaljer: id=${sokAdminId}, tripid=${sokTripId}`);
                    
                    let adminHtml = '';
                    try {
                        const adminUrl = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${sokAdminId}&db=${sokDb}&tripid=${sokTripId}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${turId}`;
                        const adminRes = await fetch(adminUrl);
                        adminHtml = await adminRes.text();
                    } catch(e2) {
                        addDebugLog(`\u26a0\ufe0f Fetch feilet for treff ${treffIdx + 1}: ${e2.message}`);
                        continue;
                    }
                
                if (!adminHtml || adminHtml.length < 500) {
                    addDebugLog(`\u274c Ingen data for treff ${treffIdx + 1}`);
                    continue;
                }
                
                // full=true gir alt vi trenger — telefon, PNR, retning, adresser (Hentested/Leveringssted)
                console.log(`[SOK] adminHtml lengde: ${adminHtml.length}, treff ${treffIdx + 1}`);

                // === PARSING ===

                // Navn
                const navnMatch = adminHtml.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const pasientNavn = navnMatch ? navnMatch[1].trim().replace(/\s+/g, ' ') : '(ukjent)';
                console.log(`[SOK] Navn: ${pasientNavn}, PNR-match: ${!!adminHtml.match(/Personnummer/i)}`);
                
                // PNR
                const pnrMatch = adminHtml.match(/Personnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i);
                const pnr = pnrMatch ? pnrMatch[1] : '';
                
                // Telefoner
                const mobilMatchSok = adminHtml.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const mobilEpjMatchSok = adminHtml.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const mobil2MatchSok = adminHtml.match(/>Mobilnr \(2\):<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const ringHenteMatchSok = adminHtml.match(/Ring ved ankomst hentested:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const ringMatchSok = adminHtml.match(/Ring ved ankomst:<\/td>\s*<td[^>]*>\s*([^<]+)/i);

                let telefon = '';
                let telefonKilde = '';
                let alleTelefoner = [];
                let alleNumreMedKilde = [];
                let harIkkeSms = false;

                const sokTlfKandidater = [
                    { match: mobilMatchSok, kilde: 'MOB' },
                    { match: mobilEpjMatchSok, kilde: 'EPJ' },
                    { match: mobil2MatchSok, kilde: 'MOB2' },
                    { match: ringHenteMatchSok, kilde: 'RING-H' },
                    { match: ringMatchSok, kilde: 'RING' }
                ];
                for (const kandidat of sokTlfKandidater) {
                    if (kandidat.match && kandidat.match[1].trim()) {
                        const rawTekst = kandidat.match[1].trim();
                        const erReservert = /reservert|ikke\s*sms/i.test(rawTekst);
                        if (erReservert) harIkkeSms = true;
                        const nr = normaliserTelefon(rawTekst);
                        if (nr && nr !== '(mangler)') {
                            const nr8 = nr.replace(/[\s+\-]/g, '').slice(-8);
                            if (nr8.length === 8) {
                                if (!alleNumreMedKilde.find(n => n.nr8 === nr8)) {
                                    alleNumreMedKilde.push({ nr, nr8, kilde: kandidat.kilde, erMobil: erMobilnummer(nr8), erReservert });
                                }
                                if (erMobilnummer(nr8) && !alleTelefoner.includes(nr8)) alleTelefoner.push(nr8);
                                if (!telefon && erMobilnummer(nr8)) { telefon = nr; telefonKilde = kandidat.kilde; }
                            }
                        }
                    }
                }
                
                // Rekvisisjon
                const rekMatch = adminHtml.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i)
                    || adminHtml.match(/>(\d{12})<\/b>/);
                const rekNr = rekMatch ? rekMatch[1] : '';
                
                // Folkeregistrert adresse (fra <legend class="fieldname">Pasient</legend>)
                let folkregAdresse = '';
                const pasLegIdx = adminHtml.search(/<legend[^>]*>Pasient<\/legend>/i);
                const hetLegIdx = adminHtml.search(/<legend[^>]*>Hentested<\/legend>/i);
                if (pasLegIdx > -1 && hetLegIdx > pasLegIdx) {
                    const pasSek = adminHtml.substring(pasLegIdx, hetLegIdx);
                    const folkAddrM = pasSek.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const folkPostM = pasSek.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    if (folkAddrM && folkAddrM[1].trim()) {
                        folkregAdresse = folkAddrM[1].trim();
                        if (folkPostM && folkPostM[1].trim()) folkregAdresse += ', ' + folkPostM[1].trim();
                    }
                }

                // Adresser \u2014 samme regex som hovedanalysen (Hentested/Leveringssted <legend>)
                let henteAdresse = '';
                let henteAdresseFull = '';
                const hentestedet = adminHtml.match(/Hentested<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                if (hentestedet) {
                    const hnavn = hentestedet[1].trim(), hadr = hentestedet[2].trim(), hpost = hentestedet[3].trim(), htlf = hentestedet[4].trim(), hkom = hentestedet[5].trim();
                    henteAdresse = `${hadr}, ${hpost}`;
                    let deler = []; if (hnavn) deler.push(hnavn); if (hadr) deler.push(hadr); if (hpost) deler.push(hpost); if (htlf) deler.push(htlf); if (hkom) deler.push(`(${hkom})`);
                    henteAdresseFull = deler.join('\n');
                }
                
                let leveringsAdresse = '';
                let leveringsAdresseFull = '';
                const leveringsstedet = adminHtml.match(/Leveringssted<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                if (leveringsstedet) {
                    const lnavn = leveringsstedet[1].trim(), ladr = leveringsstedet[2].trim(), lpost = leveringsstedet[3].trim(), ltlf = leveringsstedet[4].trim(), lkom = leveringsstedet[5].trim();
                    leveringsAdresse = `${ladr}, ${lpost}`;
                    let deler = []; if (lnavn) deler.push(lnavn); if (ladr) deler.push(ladr); if (lpost) deler.push(lpost); if (ltlf) deler.push(ltlf); if (lkom) deler.push(`(${lkom})`);
                    leveringsAdresseFull = deler.join('\n');
                }
                
                // Retning (fra full=true)
                const retningMatch = adminHtml.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
                let erTur = true;
                if (retningMatch) {
                    erTur = retningMatch[1].trim().toLowerCase().includes('til behandling');
                }

                // Legg til adresse-telefon retningsbevisst: TUR=hentested, RETUR=leveringssted
                const adrTlf = erTur
                    ? (hentestedet && hentestedet[4] ? hentestedet[4].trim() : '')
                    : (leveringsstedet && leveringsstedet[4] ? leveringsstedet[4].trim() : '');
                if (adrTlf) {
                    const adrNr = normaliserTelefon(adrTlf);
                    if (adrNr && adrNr !== '(mangler)') {
                        const adrNr8 = adrNr.replace(/[\s+\-]/g, '').slice(-8);
                        if (adrNr8.length === 8) {
                            const erReservert = /reservert|ikke\s*sms/i.test(adrTlf);
                            if (erReservert) harIkkeSms = true;
                            if (!alleNumreMedKilde.find(n => n.nr8 === adrNr8)) {
                                alleNumreMedKilde.push({ nr: adrNr, nr8: adrNr8, kilde: 'ADR', erMobil: erMobilnummer(adrNr8), erReservert });
                            }
                            if (erMobilnummer(adrNr8) && !alleTelefoner.includes(adrNr8)) alleTelefoner.push(adrNr8);
                            if (!telefon && erMobilnummer(adrNr8)) { telefon = adrNr; telefonKilde = 'ADR'; }
                        }
                    }
                }

                // Tider
                let fraTid = '';
                let tilTid = '';
                const klarFraMatch = adminHtml.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (klarFraMatch) fraTid = klarFraMatch[1].trim();
                const oppmoteMatch = adminHtml.match(/tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (oppmoteMatch) tilTid = oppmoteMatch[1].trim();
                
                // Spesielle behov (identisk med auto)
                let spesielleBehov = '';
                const behovMatch = adminHtml.match(/Spesielle behov:<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
                if (behovMatch) {
                    spesielleBehov = behovMatch[1].trim()
                        .replace(/<br\s*\/?>/gi, ', ')
                        .replace(/<[^>]*>/g, '')
                        .replace(/&nbsp;/g, ' ')
                        .replace(/&oslash;/g, '\u00f8')
                        .replace(/&aelig;/g, '\u00e6')
                        .replace(/&aring;/g, '\u00e5')
                        .replace(/\s+/g, ' ')
                        .trim();
                    if (spesielleBehov.endsWith(',')) {
                        spesielleBehov = spesielleBehov.slice(0, -1).trim();
                    }
                }
                
                // Transport\u00f8r
                const transpMatch = adminHtml.match(/Transport..?r:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                let transportor = transpMatch ? transpMatch[1].trim() : '';
                // Avtale-kode for å detektere faktisk transportør ved delte avtaler
                let avtaleKode = '', avtaleNavn = '';
                const avtaleMatchSok = adminHtml.match(/Avtale:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (avtaleMatchSok) {
                    avtaleNavn = avtaleMatchSok[1].trim();
                    const slashIdxSok = avtaleNavn.lastIndexOf('/');
                    if (slashIdxSok >= 0) {
                        avtaleKode = avtaleNavn.substring(slashIdxSok + 1).trim().replace(/\s+/g, '.');
                    }
                }
                const faktiskSok = OSLO_VANLIG_RUTING[avtaleKode] || null;
                if (faktiskSok && /norgestaxi\s*og\s*ct|ct\s*og\s*norgestaxi|oslo\s+vanlig/i.test(transportor)) {
                    transportor = faktiskSok.navn;
                }

                // L\u00f8yve/Tur nr (identisk med auto-analyse + ekstra fallbacks)
                let loyveTur = '';
                const loyveTurMatch = adminHtml.match(/L&oslash;yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                      adminHtml.match(/L\u00f8yve\/Tur\s*nr:<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                      adminHtml.match(/yve\/Tur\s*nr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i) ||
                                      adminHtml.match(/yve\/Tur\s*nr[^:]*:\s*<\/[^>]*>\s*<[^>]*>\s*([^<]+)/i);
                if (loyveTurMatch) {
                    const raw = loyveTurMatch[1].trim();
                    const slashIdx = raw.indexOf('/');
                    if (slashIdx > -1) {
                        loyveTur = raw.substring(0, slashIdx).trim();
                        turId = raw.substring(slashIdx + 1).trim();
                    } else {
                        loyveTur = raw;
                    }
                    addDebugLog(`\ud83d\udd0d L\u00f8yve/Tur: l\u00f8yve="${loyveTur}" turId="${turId}"`);
                } else {
                    addDebugLog(`\u26a0\ufe0f L\u00f8yve/Tur nr ikke funnet i admin-HTML (${adminHtml.length} tegn)`);
                }

                // Sett resId fra parset turId eller NISSY tripId (aldri s\u00f8keverdien)
                if (!sokResId || sokResId === sokVerdi) {
                    sokResId = turId || sokTripId;
                }
                
                // Rekvisisjonsstatus (samme felt som auto-koden, IKKE Transportstatus)
                const rekStatusMatch = adminHtml.match(/Rekvisisjonsstatus:<\/td>\s*<td[^>]*>\s*<b>\s*([^<]+)/i) ||
                                       adminHtml.match(/Rekvisisjonsstatus:\s*<b>\s*([^<]+)/i);
                const rekStatus = rekStatusMatch ? rekStatusMatch[1].trim() : '';

                // Opprettet-tidspunkt (bestilt)
                const opprettetMatch = adminHtml.match(/Opprettet:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                let opprettetTid = opprettetMatch ? opprettetMatch[1].trim() : '';

                // Parse fraTidMs til full timestamp (samme som auto)
                let fraTidMs = null;
                if (fraTid) {
                    const fp = fraTid.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s+(\d{1,2}):(\d{2})/);
                    if (fp) {
                        let aar = parseInt(fp[3]);
                        if (aar < 100) aar += 2000;
                        fraTidMs = new Date(aar, parseInt(fp[2])-1, parseInt(fp[1]), parseInt(fp[4]), parseInt(fp[5])).getTime();
                    }
                }

                // Melding til pasientreisekontoret (manuell justering)
                let meldingJustering = null;
                let meldingTilPRK = '';
                const meldingPRKMatch = adminHtml.match(/Melding til pasientreisekontoret:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
                if (meldingPRKMatch) {
                    meldingTilPRK = meldingPRKMatch[1].replace(/\s+/g, ' ').trim();
                    const val = parseInt(meldingTilPRK);
                    if (!isNaN(val) && val !== 0 && /^[+-]?\d+$/.test(meldingTilPRK.trim())) meldingJustering = val;
                }

                // Melding til transport\u00f8ren
                let meldingTilTransportor = '';
                const meldingTranspMatch = adminHtml.match(/Melding til transport[^:]*:\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/i);
                if (meldingTranspMatch) {
                    meldingTilTransportor = meldingTranspMatch[1].replace(/\s+/g, ' ').trim();
                }

                // Hent geo-koordinater (UTM33) fra hente- og leveringssted
                let henteGeoLatLng = null;
                let leverGeoLatLng = null;
                const geoKoordMatches = [...adminHtml.matchAll(/Geo-koordinater[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
                if (geoKoordMatches.length > 0) {
                    const parseUTM = (str) => {
                        const m = str.match(/(\d{6,7})\s*\/?\s*(\d{5,6})/);
                        return m ? utm33ToLatLng(parseInt(m[1]), parseInt(m[2])) : null;
                    };
                    henteGeoLatLng = parseUTM(geoKoordMatches[0][1]);
                    if (geoKoordMatches[1]) leverGeoLatLng = parseUTM(geoKoordMatches[1][1]);
                }

                // Parse SUTI-status \u2014 identisk med hovedanalysens logikk
                let sutiStatus = {
                    bestiltTid: null, bestiltMs: null, bestiltDato: null,
                    sendtTid: null, sendtMs: null,
                    bilTildelt: false, bilTildeltTid: null, bilTildeltMs: null,
                    loeyve: null, bilFremme: false, bilFremmeTid: null, bilFremmeMs: null,
                    bilFremmeGeo: null, bilPaaVeiGeo: null,
                    hentet: false, hentetTid: null, levert: false,
                    bomtur: false, avvist: false, erIA: false
                };
                // Parse bestilt-tid fra Rekvisisjonsloggen (samme som hovedanalysen)
                const rekvLoggIdx = adminHtml.indexOf('Rekvisisjonslogg');
                if (rekvLoggIdx > -1) {
                    const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 20000);
                    const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
                    if (newReqMatch) {
                        sutiStatus.bestiltTid = newReqMatch[2];
                        sutiStatus.bestiltDato = newReqMatch[1];
                        const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                        if (bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]), parseInt(bp[2])-1, parseInt(bp[1]), parseInt(bp[4]), parseInt(bp[5])).getTime();
                    }
                    // Tildelt-tid fra siste AddToResource i rekvisisjonsloggen (søk i hele adminHtml)
                    const addResMatches = [...adminHtml.matchAll(/AddToResource\s*<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/g)];
                    if (addResMatches.length > 0) {
                        const siste = addResMatches[addResMatches.length - 1];
                        sutiStatus.sendtTid = siste[2];
                        const tp = siste[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                        if (tp) sutiStatus.sendtMs = new Date(parseInt(tp[3]), parseInt(tp[2])-1, parseInt(tp[1]), parseInt(tp[4]), parseInt(tp[5])).getTime();
                    }
                }
                const sutiIdx = adminHtml.indexOf('Suti kode');
                let sutiArea = sutiIdx > -1 ? adminHtml.substring(sutiIdx) : '';
                // Klipp bort alt etter <hr> — det er gamle ressurser
                const hrIdx3 = sutiArea.indexOf('<hr');
                if (hrIdx3 > -1) sutiArea = sutiArea.substring(0, hrIdx3);

                let fremmeXmlId = null;
                let paaVeiXmlId = null;

                if (sutiArea) {
                    const alleRader = [];
                    const radRegex = /<tr[^>]*>\s*([\s\S]*?)<\/tr>/gi;
                    let radMatch;
                    while ((radMatch = radRegex.exec(sutiArea)) !== null) {
                        const rad = radMatch[1];
                        const tidMatch = rad.match(/<nobr>(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})<\/nobr>/);
                        if (!tidMatch) continue;
                        const tidMs = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2])-1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]), parseInt(tidMatch[6])).getTime();
                        const klokkeslett = `${tidMatch[4]}:${tidMatch[5]}`;
                        alleRader.push({ rad, tidMs, klokkeslett });
                    }
                    alleRader.sort((a, b) => a.tidMs - b.tidMs);

                    // Bomtur-tracking per TurNr (identisk med auto)
                    const tildelteTurNr = new Set();
                    const bomturTurNr = new Set();
                    sutiStatus.bomtur = false;

                    for (const { rad, tidMs, klokkeslett } of alleRader) {
                        const turNrMatch = rad.match(/<nobr>(\d{7,8})<\/nobr>/);
                        const turNrSuti = turNrMatch ? turNrMatch[1] : null;

                        if ((/NewResource/.test(rad) || /AssignToNextCA/.test(rad)) && /Tildelt/.test(rad)) {
                            // sendtTid/sendtMs settes fra rekvisisjonsloggen (AddToResource) — mer pålitelig
                            if (!sutiStatus.sendtMs) { sutiStatus.sendtTid = klokkeslett; sutiStatus.sendtMs = tidMs; }
                            if (turNrSuti) tildelteTurNr.add(turNrSuti);
                        }
                        if (/>\s*1703\b/.test(rad) || /Bomtur/.test(rad)) {
                            if (turNrSuti) bomturTurNr.add(turNrSuti);
                            sutiStatus.bilTildelt = false; sutiStatus.bilTildeltTid = null; sutiStatus.bilTildeltMs = null;
                            sutiStatus.bilFremme = false; sutiStatus.bilFremmeTid = null; sutiStatus.bilFremmeMs = null;
                            sutiStatus.loeyve = null; sutiStatus.hentet = false; sutiStatus.hentetTid = null;
                            fremmeXmlId = null; paaVeiXmlId = null;
                        }
                        if (!/Bekreftet/.test(rad)) continue;

                        const xmlIdMatch = rad.match(/sutiXml\?id=(\d+)/);

                        if (/>\s*3003\b/.test(rad)) {
                            sutiStatus.bilTildelt = true; sutiStatus.bilTildeltTid = klokkeslett; sutiStatus.bilTildeltMs = tidMs;
                            // Ny bil = nullstill fremme-data fra forrige bil
                            sutiStatus.bilFremme = false; sutiStatus.bilFremmeTid = null; sutiStatus.bilFremmeMs = null;
                            fremmeXmlId = null;
                            const loeyveMatch = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                            if (loeyveMatch) sutiStatus.loeyve = loeyveMatch[1];
                            if (xmlIdMatch) paaVeiXmlId = xmlIdMatch[1];
                        }
                        if (/UpdateResource/.test(rad) && /Bekreftet/.test(rad)) {
                            const loeyveMatch = rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i) || rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/) || rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);
                            if (loeyveMatch) sutiStatus.loeyve = loeyveMatch[1];
                        }
                        if (/>\s*1709\b/.test(rad)) { sutiStatus.bilFremme = true; sutiStatus.bilFremmeTid = klokkeslett; sutiStatus.bilFremmeMs = tidMs; if (xmlIdMatch) fremmeXmlId = xmlIdMatch[1]; }
                        if (/>\s*1701\b/.test(rad)) { sutiStatus.hentet = true; sutiStatus.hentetTid = klokkeslett; }
                        if (/>\s*1702\b/.test(rad)) { sutiStatus.levert = true; }
                        if (/>\s*1750\b/.test(rad)) { sutiStatus.avvist = true; }
                    }

                    // Bomtur = alle tildelte biler har bomtur (identisk med auto)
                    if (bomturTurNr.size > 0) {
                        const harAktivBil = [...tildelteTurNr].some(t => !bomturTurNr.has(t));
                        sutiStatus.bomtur = !harAktivBil;
                    }

                    if (/>\s*IA\s*</.test(sutiArea)) sutiStatus.erIA = true;
                }

                // Hent geoposisjon fra SUTI XML (skip blacklistede transportører)
                const transportorLowerSok = (transportor || '').toLowerCase();
                const hopOverGeoSok = CONFIG.GEO_BLACKLIST.some(b => transportorLowerSok.includes(b));
                if (!hopOverGeoSok) {
                    if (paaVeiXmlId) sutiStatus.bilPaaVeiGeo = await hentSutiXmlGeoCached(paaVeiXmlId);
                    if (fremmeXmlId) sutiStatus.bilFremmeGeo = await hentSutiXmlGeoCached(fremmeXmlId);
                }

                // Beregn geoAvstand (identisk med auto)
                let geoAvstand = null;
                if (henteGeoLatLng) {
                    const bilGeo = sutiStatus.bilPaaVeiGeo || null;
                    if (bilGeo) {
                        const luftKm = haversine(
                            parseFloat(bilGeo.lat), parseFloat(bilGeo.long),
                            henteGeoLatLng.lat, henteGeoLatLng.lng
                        );
                        const est = estimerKjoretid(luftKm);
                        geoAvstand = {
                            luftKm: Math.round(luftKm * 10) / 10,
                            veiKm: est.veiKm,
                            minutter: est.minutter,
                            kilde: sutiStatus.bilPaaVeiGeo ? '3003' : '4010'
                        };
                    }
                }

                addDebugLog(`\ud83d\udd0d SUTI: tildelt=${sutiStatus.bilTildelt} fremme=${sutiStatus.bilFremme} hentet=${sutiStatus.hentet} l\u00f8yve=${sutiStatus.loeyve}`);

                // Parse avvikslogg og KMP/KMB/EPT/IFS
                const { avviksLogg, sisteKontaktFraAvvik, sisteEPT, sisteIFS, eptAntall } = parseAvvikslogg(adminHtml, sokTripId);

                // Parse SMS-logg fra ressurs (identisk med auto)
                let smsLoggRes = [];
                const resSmsIdx = adminHtml.indexOf('Ressurs, SMS logg');
                if (resSmsIdx > -1) {
                    const searchArea = adminHtml.substring(resSmsIdx, resSmsIdx + 3000);
                    const rowRegex = /<td>(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})<\/td>\s*<td>([^<]+)<\/td>\s*<td>([\s\S]*?)<\/td>/gi;
                    let match;
                    while ((match = rowRegex.exec(searchArea)) !== null) {
                        smsLoggRes.push({
                            tidspunkt: match[1].trim(),
                            mottaker: match[2].trim(),
                            melding: match[3]?.trim()
                                .replace(/&aring;/g, '\u00e5').replace(/&aelig;/g, '\u00e6').replace(/&oslash;/g, '\u00f8')
                                .replace(/&Aring;/g, '\u00c5').replace(/&AElig;/g, '\u00c6').replace(/&Oslash;/g, '\u00d8') || ''
                        });
                    }
                }
                const smsLogg = smsLoggRes;

                // SPOT-deteksjon (identisk med auto)
                let erSpot = false;
                const bestiltTidStr = sutiStatus.bestiltTid || opprettetTid;
                if (bestiltTidStr && fraTid) {
                    const bestiltDatoStr = (sutiStatus.bestiltDato || opprettetTid || '').match(/(\d{1,2})\.(\d{1,2})/);
                    const klarDatoStr = fraTid.match(/(\d{1,2})\.(\d{1,2})/);
                    let sammeDag = true;
                    if (bestiltDatoStr) {
                        const idagDato = new Date();
                        const bestiltDag = parseInt(bestiltDatoStr[1]);
                        const bestiltMnd = parseInt(bestiltDatoStr[2]);
                        if (klarDatoStr) {
                            sammeDag = bestiltDag === parseInt(klarDatoStr[1]) && bestiltMnd === parseInt(klarDatoStr[2]);
                        } else {
                            sammeDag = bestiltDag === idagDato.getDate() && bestiltMnd === (idagDato.getMonth()+1);
                        }
                    }
                    if (sammeDag) {
                        const parseMinutter = (str) => {
                            const m = str.match(/(\d{1,2})[:.]\s*(\d{2})\s*$/);
                            return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
                        };
                        const bestiltMin = parseMinutter(bestiltTidStr);
                        const klarMin = parseMinutter(fraTid);
                        if (bestiltMin !== null && klarMin !== null) {
                            if (klarMin - bestiltMin < 25) erSpot = true;
                        }
                    }
                }

                // SMS-terskel og forsinkelse (identisk med auto)
                const nowMsSok = new Date().getTime();
                const nowSok = new Date();
                let smsTerskel = erTur ? CONFIG.FORSINKELSE_TUR_MIN : CONFIG.FORSINKELSE_RETUR_MIN;

                let smsForsinkelse = fraTidMs
                    ? Math.floor((nowMsSok - fraTidMs) / 60000)
                    : 0;

                // SPOT TUR: forsinkelse fra bestiltMs, terskel 25 min
                if (erSpot && erTur && sutiStatus.bestiltMs) {
                    smsTerskel = CONFIG.FORSINKELSE_TUR_SPOT_MIN;
                    smsForsinkelse = Math.floor((nowMsSok - sutiStatus.bestiltMs) / 60000);
                }

                // Juster terskel ved manuell justering fra planlegger
                if (meldingJustering !== null && meldingJustering < 0 && meldingJustering >= -15) {
                    smsTerskel += Math.abs(meldingJustering);
                }

                // SMS-ID og runde (identisk med auto)
                const idag = new Date().toISOString().split('T')[0];
                const retningStr = erTur ? 'TUR' : 'RETUR';
                let smsRunde = 1;
                const minSidenTerskel = smsForsinkelse - smsTerskel;
                if (minSidenTerskel > 0) {
                    smsRunde = 1 + Math.floor(minSidenTerskel / CONFIG.REPETER_INTERVALL_MIN);
                }
                const smsId = `SOK_${sokTripId}_${idag}_${retningStr}_${smsRunde}`;
                const sokSendtIds = window._sendtIds || new Set();
                const sendtFraDb = sokSendtIds.has(smsId);

                // SMS-logg matching (identisk med auto)
                const normaliserTlfSok = (nr) => nr ? nr.replace(/[\s+\-]/g, '').slice(-8) : '';
                const smsTilPasient = smsLoggRes.filter(s => {
                    const mottakerNorm = normaliserTlfSok(s.mottaker);
                    return alleTelefoner.some(tlf => tlf === mottakerNorm);
                });

                let sisteSmsMinutterSiden = null;
                let smsKilde = null;
                if (smsTilPasient.length > 0) {
                    smsKilde = 'pasient';
                    const sisteSms = smsTilPasient[smsTilPasient.length - 1];
                    const tidMatch = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                    if (tidMatch) {
                        const smsTid = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2]) - 1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]));
                        sisteSmsMinutterSiden = Math.floor((nowSok - smsTid) / 60000);
                    }
                } else if (smsLoggRes.length > 0) {
                    smsKilde = 'ressurs';
                    const sisteSms = smsLoggRes[smsLoggRes.length - 1];
                    const tidMatch = sisteSms.tidspunkt.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                    if (tidMatch) {
                        const smsTid = new Date(parseInt(tidMatch[3]), parseInt(tidMatch[2]) - 1, parseInt(tidMatch[1]), parseInt(tidMatch[4]), parseInt(tidMatch[5]));
                        sisteSmsMinutterSiden = Math.floor((nowSok - smsTid) / 60000);
                    }
                }

                const alleredeSendt = sendtFraDb || smsTilPasient.length > 0;

                // Kontakt-info fra avvikslogg (identisk med auto)
                const sokKontaktData = window._kontaktData || new Map();
                const kontaktInfo = sokKontaktData.get(`SOK_${sokTripId}`);
                let sistKontaktTid = null;
                let sistKontaktMinSiden = null;
                let sistKontaktType = null;

                if (sisteKontaktFraAvvik) {
                    sistKontaktTid = sisteKontaktFraAvvik.tid;
                    sistKontaktType = sisteKontaktFraAvvik.type;
                    sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, nowSok);
                } else if (kontaktInfo && kontaktInfo.tidspunkt) {
                    sistKontaktTid = kontaktInfo.tidspunkt;
                    sistKontaktMinSiden = tidTilMinutterSiden(sistKontaktTid, nowSok);
                }

                // kanSendeSms-beregning (identisk med auto)
                let minTilSms;
                let kanSendeSms = false;
                let tellerFraMinSiden = sisteSmsMinutterSiden;

                if (sistKontaktMinSiden !== null) {
                    if (tellerFraMinSiden === null || sistKontaktMinSiden < tellerFraMinSiden) {
                        tellerFraMinSiden = sistKontaktMinSiden;
                    }
                }

                if (smsLoggRes.length === 0 && !sendtFraDb && !kontaktInfo && !sisteKontaktFraAvvik) {
                    minTilSms = smsTerskel - smsForsinkelse;
                    kanSendeSms = minTilSms <= 0 && !!telefon;
                } else if (tellerFraMinSiden !== null) {
                    minTilSms = CONFIG.REPETER_INTERVALL_MIN - tellerFraMinSiden;
                    kanSendeSms = minTilSms <= 0 && !!telefon;
                } else {
                    minTilSms = CONFIG.REPETER_INTERVALL_MIN;
                    kanSendeSms = false;
                }

                // IA (Individuell Avtale) - skal ikke ha SMS
                if (sutiStatus.erIA) {
                    kanSendeSms = false;
                }

                const harUmatchetSms = smsLoggRes.length > 0 && smsTilPasient.length === 0;

                let avviksGrunner = [];
                if (sutiStatus.erIA) avviksGrunner.push('\ud83d\udfe3 IA - kontakt behandler');
                if (!telefon) avviksGrunner.push('\ud83d\udcf5 Mangler mobilnummer');

                // Etterlysning-beregning (v6, identisk med auto)
                const effektivForsinkelsSok = fraTidMs ? Math.floor((nowMsSok - fraTidMs) / 60000) : smsForsinkelse;
                let etterlysTerskel = getEtterlysTerskel(erTur, erSpot);
                // TUR: tildelt + terskel. RETUR: max(klar, tildelt) + terskel
                let etterlyseTidspunkt = 0;
                if (!erTur && fraTidMs) {
                    const seneste = sutiStatus.sendtMs ? Math.max(fraTidMs, sutiStatus.sendtMs) : fraTidMs;
                    etterlyseTidspunkt = seneste + etterlysTerskel * 60000;
                } else if (sutiStatus.sendtMs && fraTidMs) {
                    const tildeltPluss = sutiStatus.sendtMs + etterlysTerskel * 60000;
                    etterlyseTidspunkt = tildeltPluss >= fraTidMs ? tildeltPluss : fraTidMs + etterlysTerskel * 60000;
                } else {
                    etterlyseTidspunkt = fraTidMs ? fraTidMs + etterlysTerskel * 60000 : 0;
                }
                const etterlyseForsinkelse = etterlyseTidspunkt ? Math.floor((nowMsSok - etterlyseTidspunkt) / 60000) : effektivForsinkelsSok;
                const harEPT = !!sisteEPT;
                const harIFS = !!sisteIFS;
                let sistEPTMinSiden = null;
                let sistIFSMinSiden = null;
                if (sisteEPT) sistEPTMinSiden = tidTilMinutterSiden(sisteEPT.tid, nowSok);
                if (sisteIFS) sistIFSMinSiden = tidTilMinutterSiden(sisteIFS.tid, nowSok);
                const ifsEtterEPT = harIFS && harEPT && sistIFSMinSiden !== null && sistEPTMinSiden !== null && sistIFSMinSiden <= sistEPTMinSiden;
                let etterlysStatus;
                let minTilNesteEtterlysning;
                if (sutiStatus.bilFremme || sutiStatus.hentet) {
                    etterlysStatus = 'besvart'; minTilNesteEtterlysning = 0;
                } else if (ifsEtterEPT) {
                    etterlysStatus = 'besvart'; minTilNesteEtterlysning = 0;
                } else if (harEPT && sistEPTMinSiden !== null) {
                    minTilNesteEtterlysning = CONFIG.ETTERLYSE_REPETER_MIN - sistEPTMinSiden;
                    etterlysStatus = minTilNesteEtterlysning <= 0 ? 'etterlyse' : 'etterlyst';
                } else if (etterlyseForsinkelse >= 0) {
                    etterlysStatus = 'etterlyse'; minTilNesteEtterlysning = 0;
                } else {
                    etterlysStatus = 'venter'; minTilNesteEtterlysning = -etterlyseForsinkelse;
                }
                const kanEtterlyse = etterlysStatus === 'etterlyse';

                addDebugLog(`\u2705 ${pasientNavn} - Mob: ${telefon || 'mangler'} - ${erTur ? 'TUR' : 'RETUR'}${erSpot ? ' SPOT' : ''}${sutiStatus.erIA ? ' IA' : ''} forsinkelse=${smsForsinkelse}m etterlys=${etterlysStatus}`);

                // Sjekk om allerede i listen
                const eksisterende = window.smsKandidater.findIndex(k => k.turId === turId && k.reqId === `SOK_${sokTripId}`);
                if (eksisterende >= 0) {
                    addDebugLog(`\u2139\ufe0f TurID ${turId} (trip ${sokTripId}) allerede i listen`);
                } else {
                    const sokKandidat = {
                        reqId: `SOK_${sokTripId}`,
                        resId: sokResId,
                        nissyReqId: sokAdminId,
                        nissyTripId: sokTripId,
                        navn: pasientNavn,
                        telefon,
                        telefonKilde,
                        folkregAdresse,
                        folkregPoststed: '',
                        alleTelefoner,
                        alleNumreMedKilde,
                        harIkkeSms,
                        rekNr,
                        rekStatus,
                        pnr,
                        fraTid,
                        fraTidMs,
                        tilTid,
                        erTur,
                        henteAdresse,
                        henteAdresseFull,
                        leveringsAdresse,
                        leveringsAdresseFull,
                        henteGeoLatLng,
                        leverGeoLatLng,
                        geoAvstand,
                        transportor,
                        loyveTur: loyveTur || sutiStatus.loeyve || '',
                        turId,
                        spesielleBehov,
                        smsTerskel,
                        smsId,
                        smsRunde,
                        alleredeSendt,
                        minTilSms,
                        kanSendeSms,
                        manglerTelefon: !telefon,
                        harUmatchetSms,
                        avviksGrunner,
                        smsLogg,
                        smsLoggRes,
                        avviksLogg,
                        sutiStatus,
                        opprettetTid,
                        erSpot,
                        erIA: sutiStatus.erIA,
                        bestiltMs: sutiStatus.bestiltMs,
                        smsForsinkelse,
                        meldingJustering,
                        meldingTilPRK,
                        meldingTilTransportor,
                        sistKontaktTid,
                        sistKontaktType,
                        // Etterlysning (v6)
                        etterlysTerskel,
                        etterlyseForsinkelse,
                        kanEtterlyse,
                        harEPT,
                        sisteEPT,
                        eptAntall,
                        harIFS,
                        sisteIFS,
                        sistEPTMinSiden,
                        sistIFSMinSiden,
                        minTilNesteEtterlysning,
                        etterlysStatus,
                        forsinkelse: smsForsinkelse,
                        startTid: fraTid || '',
                        startTidMs: fraTidMs || null,
                        erSok: true, sokVerdi, sokType // Flagg for s\u00f8keresultat
                    };
                    
                    console.log(`[SOK] Kandidat:`, JSON.stringify({navn: sokKandidat.navn, telefon: sokKandidat.telefon, erTur: sokKandidat.erTur, fraTid: sokKandidat.fraTid || sokKandidat.startTid, tilTid: sokKandidat.tilTid, rekNr: sokKandidat.rekNr, transportor: sokKandidat.transportor}));
                    window.smsKandidater.unshift(sokKandidat);
                    // Lagre i DB for å overleve F5
                    await window.sokDB.set(`SOK_${sokTripId}`, {
                        sokVerdi, sokType, sokResId,
                        adminId: sokAdminId, db: sokDb, tripId: sokTripId, turId
                    });
                    addDebugLog(`\u2705 ${pasientNavn} (TUR ${turId}) lagt til`);
                }
                } // for treffIdx
                
                oppdaterVisning(window.smsKandidater);
                
                // Nullstill s\u00f8kefelt
                const win = window.smsWin;
                if (win && !win.closed) {
                    const sokInput = win.document.getElementById('turid-sok');
                    if (sokInput) sokInput.value = '';
                }
                
            } catch(err) {
                addDebugLog(`\u274c S\u00f8kefeil: ${err.message}`);
            }
        }
        
        if (e.data.type === 'FJERN_SOK') {
            const resId = e.data.resId;
            // Fjern kandidater fra minne
            const sokKandidaterFjern = window.smsKandidater.filter(k => k.erSok && k.resId === resId);
            for (const sk of sokKandidaterFjern) {
                await window.sokDB.delete(sk.reqId);
            }
            // Fjern fra DB basert p\u00e5 sokResId (dekker ogs\u00e5 s\u00f8k uten resultater i minne)
            try {
                const alleSok = await window.sokDB.getAll();
                for (const s of alleSok) {
                    if (s.sokResId === resId) await window.sokDB.delete(s.id);
                }
            } catch(e2) {}
            window.smsKandidater = window.smsKandidater.filter(k => !(k.erSok && k.resId === resId));
            window.sokLagrede = (window.sokLagrede || []).filter(sg => sg.sokResId !== resId);
            oppdaterVisning(window.smsKandidater);
            oppdaterStats();
            addDebugLog(`\ud83d\uddd1\ufe0f Fjernet s\u00f8k: ${resId}`);
        }
        
        if (e.data.type === 'OPPDATER_VENTENDE') {
            oppdaterVentende();
        }
        
        if (e.data.type === 'SETT_AVVIK') {
            const { reqId, resId, avvikType, avvikTekst, avvikTid } = e.data;
            // Medsendt kontekst fra banner-klikk (kan være tomt når modalen åpnes fra menyen)
            const msgTurId = e.data.turid || '';
            const msgPasientNavn = e.data.pasientNavn || '';
            const msgTransportor = e.data.transportor || '';
            // Bruk tid fra input-feltet (kan v\u00e6re justert manuelt), fallback til n\u00e5
            const naa = new Date();
            const tid = avvikTid || `${String(naa.getHours()).padStart(2,'0')}:${String(naa.getMinutes()).padStart(2,'0')}`;
            
            const AVVIK_FORKLARING = {
                'KMP': 'Kontakt med pasient',
                'KMB': 'Kontakt med behandler',
                'EPT': 'Etterlyst p\u00e5 Teams',
                'IFS': 'Informasjon fra sentral'
            };
            
            let melding;
            if (avvikType === 'AVVIK') {
                // Generelt avvik: "12:17 - Fritekst. Thomas W."
                melding = `${tid} - ${avvikTekst}${avvikTekst ? '. ' : ''}${SIGNATUR}`;
            } else {
                const forklaring = AVVIK_FORKLARING[avvikType] || avvikType;
                melding = `${tid} - ${avvikType} (${forklaring}) ${avvikTekst}${avvikTekst ? ', ' : ''}${SIGNATUR}`;
            }

            // Optimistic UI for EPT: skriv til lokal store og re-render umiddelbart
            if (avvikType === 'EPT') {
                const ressurs = (window.smsKandidater || []).find(k => k.resId === resId);
                // Match pasient på reqId (ikke bare [0]) — en ressurs kan ha flere pasienter
                const pasient = ressurs && ressurs.pasienter ?
                    (ressurs.pasienter.find(p => String(p.reqId) === String(reqId)) || ressurs.pasienter[0])
                    : null;
                // Prioritér medsendte verdier fra banner-klikk, fall tilbake til oppslag
                const turid = msgTurId || (pasient ? (pasient.turId || '') : '');
                const pasientNavn = msgPasientNavn || (pasient ? (pasient.navn || '') : '');
                const transportor = msgTransportor || (ressurs ? (ressurs.transportor || '') : '');
                _lokaleEPT.set(resId, {
                    tid,
                    tekst: avvikTekst || '',
                    registrertMs: Date.now(),
                    turid,
                    transportor,
                    pasientNavn,
                    reqId,
                    svarTekst: null,
                    besvartMs: null
                });
                // Mutér kandidat-objektet så hovedvisningen reflekterer EPT umiddelbart:
                // kortet forlater etterlyse-bucket (kanEtterlyse=false) og havner i Oppfølging (harEPT=true)
                const mutPasient = ressurs && ressurs.pasienter
                    ? ressurs.pasienter.find(p => String(p.reqId) === String(reqId))
                    : null;
                if (mutPasient) {
                    mutPasient.harEPT = true;
                    mutPasient.kanEtterlyse = false;
                    mutPasient.etterlysStatus = 'etterlyst';
                    mutPasient.sisteEPT = { tid, tekst: avvikTekst || '' };
                    mutPasient.eptAntall = (mutPasient.eptAntall || 0) + 1;
                    mutPasient.minTilNesteEtterlysning = 15; // snooze fram til admin-scan overtar
                }
                // Også på ressurs-nivå (fallback hvis kandidat-oppslag bruker ressurs direkte)
                if (ressurs) {
                    ressurs.harEPT = true;
                    ressurs.kanEtterlyse = false;
                    ressurs.etterlysStatus = 'etterlyst';
                }
                // Invalider admin + ressurskort-cache så neste kjorAnalyse henter fersk HTML
                try {
                    const adminKey = `${reqId}_${resId}`;
                    _adminHtmlCache.delete(adminKey);
                    _ressurskortCache.delete(resId);
                } catch(_) {}
                oppdaterVisning(window.smsKandidater || []);
            }
            
            try {
                // NISSY bruker ISO-8859-1 encoding
                function encodeISO(str) {
                    const map = {'\u00e6':'%E6','\u00f8':'%F8','\u00e5':'%E5','\u00c6':'%C6','\u00d8':'%D8','\u00c5':'%C5'};
                    return encodeURIComponent(str).replace(/%C3%A6/g,'%E6').replace(/%C3%B8/g,'%F8').replace(/%C3%A5/g,'%E5').replace(/%C3%86/g,'%C6').replace(/%C3%98/g,'%D8').replace(/%C3%85/g,'%C5');
                }
                const avvikUrl = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?update=false&action=setResourceDeviation&rid=${resId}&deviation=${encodeISO(melding)}`;
                const res = await fetch(avvikUrl);
                if (res.ok) {
                    addDebugLog(`\ud83d\udcdd Avvik satt for ${resId}: ${melding}`);
                    // Lagre kontakt-tid i DB for SMS-timing (kun KMP/KMB, ikke EPT)
                    if (avvikType === 'KMP' || avvikType === 'KMB') {
                        await window.smsDB.set(`kontakt_${reqId}`, {
                            id: `kontakt_${reqId}`,
                            type: 'kontakt',
                            reqId: reqId,
                            tidspunkt: tid,
                            registrert: Date.now()
                        });
                    }
                    // Nullstill modal-felt og editing-flag i popup
                    const win = window.smsWin;
                    if (win && !win.closed) {
                        const tekst = win.document.getElementById('avvik-modal-tekst');
                        if (tekst) tekst.value = '';
                        const type = win.document.getElementById('avvik-modal-type');
                        if (type) type.value = 'AVVIK';
                        const tidEl = win.document.getElementById('avvik-modal-tid');
                        if (tidEl) tidEl.value = new Date().toTimeString().slice(0, 5);
                        win._editing = false;
                    }
                    // Kj\u00f8r utsatt oppdatering hvis den finnes
                    if (window._pendingKandidater) {
                        const pending = window._pendingKandidater;
                        window._pendingKandidater = null;
                        oppdaterVisning(pending);
                    }
                    kjorAnalyse();
                } else {
                    addDebugLog(`\u274c Feil ved setting av avvik for ${resId}: ${res.status}`);
                }
            } catch(err) {
                addDebugLog(`\u274c Avvik-feil: ${err.message}`);
            }
        }
        
        // TOGGLE_VIS_ALLE_20 — skru av/på visning av alle 20+ min forsinkede
        if (e.data.type === 'TOGGLE_VIS_ALLE_20') {
            window._visAlle20 = !!e.data.visAlle;
            oppdaterVisning(window.smsKandidater || []);
        }

        // TOMM_ADMIN_CACHE — tvinger ny henting av admin-HTML og kjører analyse på nytt
        if (e.data.type === 'TOMM_ADMIN_CACHE') {
            _adminHtmlCache.clear();
            _ressurskortCache.clear();
            _sutiXmlCache.clear();
            addDebugLog('🗑 Admin + ressurskort + SUTI cache tømt — neste skan henter alt på nytt');
            kjorAnalyse();
        }

        // TOGGLE_DBG_FILTER — individuelle debug-filtre
        if (e.data.type === 'TOGGLE_DBG_FILTER') {
            if (!window._dbgFiltre) window._dbgFiltre = { status: true, terskel: true, bomtur: true, avtale: true };
            window._dbgFiltre[e.data.felt] = !!e.data.checked;
            const d = window._dbgFiltre;
            addDebugLog(`Debug-filter: status=${d.status} terskel=${d.terskel} bomtur=${d.bomtur} avtale=${d.avtale}`);
            kjorAnalyse();
        }

        // MERK_AVVIK — manuelt merk en avvik-linje som EPT/IFS/KMP/KMB
        if (e.data.type === 'MERK_AVVIK') {
            const { resId, hash, tekstB64, merkType, merkTid } = e.data;
            let tekst = '';
            try { tekst = decodeURIComponent(escape(atob(tekstB64 || ''))); } catch (err) { tekst = ''; }
            const gyldige = ['EPT', 'IFS', 'KMP', 'KMB'];
            if (merkType === 'fjern') {
                await avvikMerkSlett(resId, hash);
                addDebugLog(`\ud83d\uddd1\ufe0f Fjernet manuell merking for ${resId}`);
            } else if (gyldige.includes(merkType)) {
                await avvikMerkSet(resId, hash, merkType, tekst, merkTid);
                addDebugLog(`\ud83c\udff7\ufe0f Merket avvik som ${merkType}${merkTid ? ' @ ' + merkTid : ''} for ${resId}`);
            } else {
                return;
            }
            // Re-render umiddelbart (og kjør ny analyse for å oppdatere sisteEPT/IFS)
            oppdaterVisning(window.smsKandidater || []);
            kjorAnalyse();
        }

        // SETT_SVAR — svar på en etterlysning (registreres som IFS)
        if (e.data.type === 'SETT_SVAR') {
            const { resId, reqId, svarTekst, svarTid } = e.data;
            const naa = new Date();
            // Prioritér overstyrt tid fra klokkefeltet, fallback til nå
            const tid = (svarTid && /^\d{2}:\d{2}$/.test(svarTid))
                ? svarTid
                : `${String(naa.getHours()).padStart(2,'0')}:${String(naa.getMinutes()).padStart(2,'0')}`;
            const melding = `${tid} - IFS (Informasjon fra sentral) ${svarTekst}${svarTekst ? ', ' : ''}${SIGNATUR}`;

            // Optimistisk skjul fra Oppfølging umiddelbart
            if (!window._lokaleIFS) window._lokaleIFS = new Map();
            window._lokaleIFS.set(resId, { registrertMs: Date.now(), reqId, svarTekst });

            // Fjern eventuell optimistisk EPT-entry så path 2 i Oppfølging-loopen ikke rendrer grønn-border-kort
            _lokaleEPT.delete(resId);

            oppdaterVisning(window.smsKandidater || []);

            try {
                function encodeISO(str) {
                    return encodeURIComponent(str).replace(/%C3%A6/g,'%E6').replace(/%C3%B8/g,'%F8').replace(/%C3%A5/g,'%E5').replace(/%C3%86/g,'%C6').replace(/%C3%98/g,'%D8').replace(/%C3%85/g,'%C5');
                }
                const url = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?update=false&action=setResourceDeviation&rid=${resId}&deviation=${encodeISO(melding)}`;
                const res = await fetch(url);
                if (res.ok) {
                    addDebugLog(`\ud83d\udce9 Svar registrert for ${resId}: ${svarTekst}`);
                    kjorAnalyse();
                } else {
                    addDebugLog(`\u274c Feil ved svar for ${resId}: ${res.status}`);
                }
            } catch(err) {
                addDebugLog(`\u274c Svar-feil: ${err.message}`);
            }
        }

        // FJERN_KONTAKT beholdes for bakoverkompatibilitet
        if (e.data.type === 'FJERN_KONTAKT') {
            const { reqId } = e.data;
            await window.smsDB.delete(`kontakt_${reqId}`);
            addDebugLog(`\ud83d\uddd1\ufe0f Kontakt fjernet for ${reqId}`);
            kjorAnalyse();
        }
        
        if (e.data.type === 'SMS_NULLSTILL') {
            if (confirm('Nullstille all SMS-historikk?')) {
                await window.smsDB.clear();
                window.smsStats = { totaleReiser: 0, filtrerteReiser: 0, kandidater: 0, sendtSms: 0, kjoreringer: 0, sistOppdatert: null };
                window.smsKandidater = [];
                debugLog = [];
                kjorAnalyse();
            }
        }
        
        if (e.data.type === 'ENDRE_RETNING') {
            const { reqId, nyRetning } = e.data;
            const idag = new Date().toISOString().split('T')[0];
            await ovrSet(reqId, {
                id: reqId,
                type: 'retning',
                erTur: nyRetning === 'TUR',
                dato: idag,
                timestamp: Date.now()
            });
            // Umiddelbar oppdatering av kandidat i minnet
            const k = window.smsKandidater.find(k => k.reqId === reqId);
            if (k) {
                k.erTur = nyRetning === 'TUR';
                addDebugLog(`\u2195 Retning endret for ${reqId}: ${nyRetning}`);
                oppdaterVisning(window.smsKandidater); // Re-render med \u00e9n gang
            }
            kjorAnalyse(); // Full oppdatering i bakgrunnen
        }
        
        if (e.data.type === 'ENDRE_STATUS') {
            const { reqId, nyStatus } = e.data;
            const idag = new Date().toISOString().split('T')[0];
            await ovrSet(reqId, {
                id: reqId,
                type: 'ignorer',
                status: nyStatus,
                dato: idag,
                timestamp: Date.now()
            });
            // Umiddelbar fjerning fra kandidatlisten
            window.smsKandidater = window.smsKandidater.filter(k => k.reqId !== reqId);
            addDebugLog(`\u26a1 ${nyStatus} for ${reqId} \u2014 fjernet`);
            oppdaterVisning(window.smsKandidater); // Re-render med \u00e9n gang
            kjorAnalyse(); // Full oppdatering i bakgrunnen
        }
    };

    // === NISSY klikk-lytter - marker rad i popup n\u00e5r klikket i NISSY ===
    // Én kilde til sannhet for valgt ressurs — brukes av klikk-lytter + re-render
    window._valgtResId = null;

    // === Auto-refresh ===
    window._ovrvakerInterval = setInterval(kjorAnalyse, CONFIG.REFRESH_INTERVAL_SEC * 1000);

    // === Popup-vakt: stopp alt hvis fane lukkes manuelt ===
    window._ovrvakerPopupVakt = setInterval(function() {
        if (window._ovrvakerAktiv && window.smsWin && window.smsWin.closed) {
            console.log("Overv\u00e5ker fane lukket manuelt - stopper");
            stoppOvrvaker();
        }
    }, 2000);

    // === Start ===
    setTimeout(kjorAnalyse, 500);
}

// === STOPP OVERV\u00c5KER LIVE ===
function stoppOvrvaker() {
    if (!window._ovrvakerAktiv) return;

    // Stopp auto-refresh
    if (window._ovrvakerInterval) {
        clearInterval(window._ovrvakerInterval);
        window._ovrvakerInterval = null;
    }

    // Stopp popup-vakt
    if (window._ovrvakerPopupVakt) {
        clearInterval(window._ovrvakerPopupVakt);
        window._ovrvakerPopupVakt = null;
    }

    // Lukk popup-vindu
    if (window.smsWin && !window.smsWin.closed) {
        window.smsWin.close();
    }
    window.smsWin = null;

    window._ovrvakerAktiv = false;
    console.log("Overv\u00e5ker Live stoppet");
}

// Auto-start
kjorOvrvaker();
