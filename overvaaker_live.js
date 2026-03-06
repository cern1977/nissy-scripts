// === OVERV\u00c5KER LIVE v6.0.9 (snippet) ===

// <option class="form" value="18105">Overvåker 1, OT, CT, OTB, TR, FT</option>
// <option class="form" value="18106">Overvåker 2, NT, OTB, Taxus</option>
// <option class="form" value="18103">Overvåkning Hele dagen</option>
// <option class="form" value="18160">Overvåkning kveld/helg</option>

function kjorOvrvaker() {
    if (window._ovrvakerAktiv) { console.log("Overv\u00e5ker Live kj\u00f8rer allerede"); return; }
    window._ovrvakerAktiv = true;
    console.log("Overv\u00e5ker Live v6.0.9 startet");

    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
    // \u2551  OVERV\u00c5KER LIVE                                                    \u2551
    // \u2551  Varsler pasienter ved forsinkelser:                               \u2551
    // \u2551  - TUR (til behandling): >15 min forsinkelse                       \u2551
    // \u2551  - RETUR (fra behandling): >45 min forsinkelse                     \u2551
    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
    
    const VERSJON_FULL = '6.0.9';
    const TITTEL = `Overv\u00e5ker Live v${VERSJON_FULL}`;
    const VERSJON = VERSJON_FULL;
    
    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
    // \u2551  KONFIGURASJON - ENDRE DISSE VED BEHOV                             \u2551
    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
    const CONFIG = {
        TEST_TELEFON: '+4741295495',      // Telefonnummer for testing

        // --- SMS til pasient ---
        FORSINKELSE_TUR_MIN: 15,          // Minutter forsinkelse f\u00f8r SMS p\u00e5 normal tur
        FORSINKELSE_TUR_SPOT_MIN: 25,     // Minutter forsinkelse f\u00f8r SMS p\u00e5 SPOT-tur
        FORSINKELSE_RETUR_MIN: 45,        // Minutter forsinkelse f\u00f8r SMS p\u00e5 retur
        REPETER_INTERVALL_MIN: 60,        // Send ny SMS hver X min etter f\u00f8rste

        // --- Etterlysning mot transport\u00f8r (fiktive verdier - juster etter behov) ---
        ETTERLYSE_TUR_MIN: 10,            // Etterlyse etter X min forsinkelse p\u00e5 TUR
        ETTERLYSE_TUR_SPOT_MIN: 15,       // Etterlyse etter X min forsinkelse p\u00e5 SPOT-TUR
        ETTERLYSE_RETUR_MIN: 20,          // Etterlyse etter X min forsinkelse p\u00e5 RETUR
        ETTERLYSE_REPETER_MIN: 15,        // Ny etterlysning (snooze) hvert X min etter EPT

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
        : RFILTER_VALG[0].id;
    
    // SMS-meldinger (offisielle maler fra NISSY)
    const SMS_MELDINGER = {
        TUR: () => `Vi ser at pasientreisen din til behandling er forsinket utover 15 min. Vi jobber med \u00e5 skaffe bil s\u00e5 fort som mulig. V\u00e6r tilgjengelig p\u00e5 telefon. Dersom du ikke lenger har behov for reisen m\u00e5 du gi beskjed p\u00e5 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser`,
        RETUR: () => `Vi ser at pasientreisen din fra behandling har lengre ventetid enn 45 min. Du blir hentet s\u00e5 fort som mulig. V\u00e6r tilgjengelig p\u00e5 telefon. Dersom du ikke lenger har behov for reisen m\u00e5 du gi beskjed p\u00e5 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser`,
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
    let pinDbReady = null;
    
    function openPinDB() {
        if (pinDbReady) return pinDbReady;
        pinDbReady = new Promise((resolve, reject) => {
            const request = indexedDB.open(PIN_DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(PIN_STORE)) {
                    db.createObjectStore(PIN_STORE, { keyPath: 'turId' });
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
    window.smsVentende = []; // Reiser som venter p\u00e5 SMS-terskel

    // === Styling - NISSY tema ===
    const STIL = `
        html, body { height: 100%; margin: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #e0f2f2; padding: 15px; color: #1a3a3a; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
        .header { background: #4a9a9a; color: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0; }
        .dry-run-banner { background: #fff3cd; color: #856404; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; text-align: center; border: 2px dashed #ffc107; }
        .debug-panel { background: #f5fafa; border: 1px solid #4a9a9a; border-radius: 6px; padding: 10px; margin-bottom: 15px; font-family: monospace; font-size: 11px; max-height: 150px; overflow-y: auto; color: #2d5a5a; }
        .stats { background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0; }
        #container { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
        .stat-box { text-align: center; padding: 10px; border-radius: 6px; background: #f0f8f8; }
        .stat-label { font-size: 10px; color: #5a8a8a; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #2d5a5a; }
        .stat-box.green .stat-value { color: #28a745; }
        .stat-box.blue .stat-value { color: #4a9a9a; }
        .stat-box.orange .stat-value { color: #e67e22; }
        .stat-box.red .stat-value { color: #dc2626; font-weight:700; }
        .stat-box.red .stat-value { color: #dc3545; }
        .stat-box.purple .stat-value { color: #6f42c1; }
        
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
        
        .ingen-kandidater { text-align: center; padding: 50px; color: #5a8a8a; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .ingen-kandidater .ikon { font-size: 48px; margin-bottom: 10px; }
        
        .historikk-section { background: white; border-radius: 8px; padding: 15px; margin-top: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .historikk-item { padding: 8px 12px; margin: 4px 0; background: #f0f8f8; border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; border-left: 3px solid #4a9a9a; }
    `;

    // === Hjelpefunksjoner ===
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
        const panel = win.document.getElementById('debug-panel');
        if (panel && CONFIG.DEBUG) {
            panel.innerHTML = debugLog.join('<br>');
            panel.scrollTop = panel.scrollHeight;
        }
    }

    // BroadcastChannel for kommunikasjon som overlever F5
    const ovrChannel = new BroadcastChannel('overvaker_live');

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

        // === Popup mangler eller er ugyldig \u2014 riv ned og bygg ny ===

        // 1) Be eventuell orphan-popup lukke seg via BroadcastChannel
        //    (Viktig etter F5 i NISSY: vi har ingen referanse, men gammel popup lever)
        ovrChannel.postMessage({ type: 'LUKK_POPUP' });

        // 2) Lukk via referanse hvis mulig
        if (window.smsWin && !window.smsWin.closed) {
            try { window.smsWin.close(); } catch(e) {}
        }

        // 3) Opprett helt ny popup
        window.smsWin = window.open('about:blank', 'Overvaker_Live');
        window.smsWin.smsDB = window.smsDB;
        window.smsWin.document.open();
        window.smsWin.document.write(`<html><head><title>${TITTEL}</title><style>${STIL}
                #debug-panel { display: none; }
                #debug-panel.visible { display: block; }
                #info-panel { display: none; background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 0 0 15px 0; font-size: 13px; }
                #info-panel.visible { display: block; }
                #ventende-panel { display: none; background: #faf5ff; border: 1px solid #8b5cf6; border-radius: 8px; padding: 15px; margin: 0 0 15px 0; font-size: 13px; max-height: calc(100vh - 200px); overflow-y: auto; }
                #ventende-panel.visible { display: block; }
                .ventende-item { padding: 8px 12px; margin: 4px 0; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid #8b5cf6; }
                .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite; margin-left: 10px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinner.hidden { display: none; }
            </style></head><body>
                <div class="header">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <h2 style="margin:0;">${TITTEL}</h2>
                        <select id="rfilter-valg" onchange="window._popupChannel.postMessage({type:'BYTT_FILTER', filter:+this.value})" style="padding:4px 8px; border:1px solid #475569; border-radius:5px; font-size:13px; background:#1e293b; color:white; cursor:pointer; outline:none;">
                            ${RFILTER_VALG.map(f => `<option value="${f.id}"${f.id === aktivtRfilter ? ' selected' : ''}>${f.navn}</option>`).join('')}
                        </select>
                        <div id="spinner" class="spinner hidden"></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input id="turid-sok" type="text" placeholder="TurID / REK / PNR..." 
                               style="width:140px; padding:5px 8px; border:1px solid #475569; border-radius:5px; font-size:13px; background:#1e293b; color:white; outline:none;"
                               onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='#475569'"
                               onkeydown="if(event.key==='Enter') window._popupChannel.postMessage({type:'SOK_TURID', turId:this.value.trim()})">
                        <button onclick="var v=document.getElementById('turid-sok').value.trim(); if(v) window._popupChannel.postMessage({type:'SOK_TURID', turId:v})" class="btn" style="background:#8b5cf6;">\ud83d\udd0d</button>
                        <button onclick="document.getElementById('info-panel').classList.toggle('visible')" class="btn" style="background:#3b82f6;">\u2139\ufe0f</button>
                        <button onclick="var p=document.getElementById('ventende-panel'); p.classList.toggle('visible'); if(p.classList.contains('visible')) window._popupChannel.postMessage({type:'OPPDATER_VENTENDE'})" class="btn" style="background:#8b5cf6;">\u23f3</button>
                        <button onclick="document.getElementById('debug-panel').classList.toggle('visible')" class="btn" style="background:#6b7280;">\ud83d\udd27</button>
                        <button onclick="window._popupChannel.postMessage({type:'SMS_REFRESH'})" class="btn btn-refresh">&#8635; Oppdater</button>
                        <button onclick="window._popupChannel.postMessage({type:'SMS_NULLSTILL'})" class="btn btn-nullstill">Nullstill</button>
                    </div>
                </div>
                <div id="info-panel" class="info-panel">
                    <h3 style="margin:0 0 10px 0; color:#1e40af;">\u2699\ufe0f Konfigurasjon v6</h3>
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
                            <div style="font-weight:bold; color:#374151; margin-bottom:5px;">\u2699\ufe0f Visning</div>
                            <div>Vis TUR fra: <strong>${CONFIG.VIS_TUR_FRA_MIN} min</strong></div>
                            <div>Vis RETUR fra: <strong>${CONFIG.VIS_RETUR_FRA_MIN} min</strong></div>
                            <div>SPOT-grense: <strong>${CONFIG.SPOT_GRENSE_MIN} min</strong></div>
                            <div>Oppdatering: <strong>${CONFIG.REFRESH_INTERVAL_SEC} sek</strong></div>
                        </div>
                    </div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid #e5e7eb;">
                        <div style="font-weight:bold; color:#374151; margin-bottom:5px;">Vises ikke i listen</div>
                        <div>\u2022 Reiser med status "Framme", "Ikke m\u00f8tt" eller "Startet"</div>
                    </div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid #e5e7eb;">
                        <div style="font-weight:bold; color:#374151; margin-bottom:5px;">Vises som avvik (ingen SMS)</div>
                        <div>\u2022 Pasienter uten gyldig mobilnummer</div>
                    </div>
                </div>
                ${CONFIG.DEBUG ? '<div id="debug-panel" class="debug-panel">Debug-logg...</div>' : ''}
                <div id="ventende-panel" class="ventende-panel"></div>
                <div id="stats"></div>
                <div id="container"></div>
                <div id="heartbeat-varsel" style="display:none; background:#dc2626; color:white; padding:10px 16px; text-align:center; font-weight:600; font-size:14px; cursor:pointer; animation:pulse 2s infinite;" onclick="window._popupChannel.postMessage({type:'SMS_REFRESH'});">
                    \u26a0 Overv\u00e5ker har mistet kontakt med NISSY \u2014 klikk for \u00e5 pr\u00f8ve igjen
                </div>
                <style>@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }</style>
                <script>
                    // BroadcastChannel for kommunikasjon som overlever F5
                    window._popupChannel = new BroadcastChannel('overvaker_live');

                    // Heartbeat-overv\u00e5king
                    window._sisteHeartbeat = Date.now();
                    window._heartbeatSjekk = setInterval(function() {
                        var varsel = document.getElementById('heartbeat-varsel');
                        if (!varsel) return;
                        var sekSiden = (Date.now() - window._sisteHeartbeat) / 1000;
                        if (sekSiden > 180) {
                            varsel.style.display = 'block';
                            var min = Math.floor(sekSiden / 60);
                            varsel.innerHTML = '\u26a0 Ingen oppdatering p\u00e5 ' + min + ' min \u2014 klikk for \u00e5 pr\u00f8ve igjen';
                        } else {
                            varsel.style.display = 'none';
                        }
                    }, 15000);

                    // Meld fra til hovedvinduet at popup lever (for reconnect etter F5)
                    window._popupChannel.postMessage({ type: 'POPUP_ALIVE' });

                    // Lytt etter heartbeat, markering og lukk via BroadcastChannel
                    window._popupChannel.onmessage = function(e) {
                        if (e.data.type === 'LUKK_POPUP') {
                            // NISSY ber oss lukke (F5 eller restart)
                            window.close();
                            return;
                        }
                        if (e.data.type === 'HEARTBEAT') {
                            window._sisteHeartbeat = Date.now();
                            var varsel = document.getElementById('heartbeat-varsel');
                            if (varsel) varsel.style.display = 'none';
                        }
                        if (e.data.type === 'RECONNECT') {
                            window._sisteHeartbeat = Date.now();
                            var varsel = document.getElementById('heartbeat-varsel');
                            if (varsel) varsel.style.display = 'none';
                            window._popupChannel.postMessage({ type: 'POPUP_ALIVE' });
                        }
                    };

                    // Lytt etter meldinger fra NISSY via postMessage (direkte referanse)
                    window.addEventListener('message', function(e) {
                        if (e.data.type === 'MARKER_I_POPUP') {
                            var resId = e.data.resId;
                            document.querySelectorAll('.ressurs-kort').forEach(function(el) {
                                el.style.outline = '';
                                el.style.outlineOffset = '';
                            });
                            var kort = document.getElementById('ressurs-' + resId);
                            if (kort) {
                                kort.style.outline = '3px solid #3b82f6';
                                kort.style.outlineOffset = '2px';
                                kort.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    });
                </script>
            </body></html>`);
        window.smsWin.document.close();
        window.smsWin._editing = false;
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
                            <div style="background:#fee2e2; border:2px solid #ef4444; border-radius:10px; padding:30px; text-align:center; margin:20px;">
                                <div style="font-size:48px; margin-bottom:15px;">\ud83d\udd10</div>
                                <h2 style="color:#991b1b; margin:0 0 10px;">Ikke logget inn p\u00e5 Admin</h2>
                                <p style="color:#7f1d1d; margin:0 0 20px;">Du m\u00e5 v\u00e6re logget inn p\u00e5 admin-siden for at skriptet skal fungere.</p>
                                <a href="https://pastrans-sorost.mq.nhn.no/administrasjon/" target="_blank" 
                                   style="display:inline-block; background:#3b82f6; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
                                   \u00c5pne Admin-siden
                                </a>
                                <p style="color:#6b7280; margin-top:15px; font-size:12px;">Logg inn og klikk "Oppdater n\u00e5" for \u00e5 pr\u00f8ve igjen.</p>
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

            // Hent data med Overv\u00e5ker-filteret
            const url = `https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch?did=all&action=openres&rid=-1${searchParam}&rfilter=${aktivtRfilter}&t=${t}`;
            addDebugLog(`Filter ${aktivtRfilter} | NISSY cookie=${nissyFilterFra || '?'}`);

            const res = await fetch(url);
            const buffer = await res.arrayBuffer();
            const xmlText = new TextDecoder('iso-8859-1').decode(buffer);
            const xml = new DOMParser().parseFromString(xmlText, "text/xml");

            // Restaurer NISSY sin thwerfilter-cookie s\u00e5 vi ikke overkj\u00f8rer brukerens valg
            if (nissyFilterFra && nissyFilterFra !== String(aktivtRfilter)) {
                document.cookie = `thwerfilter=${nissyFilterFra}; path=/`;
            }
            
            // Parse p\u00e5g\u00e5ende oppdrag
            const reiserFraTabell = [];
            let totaltPagaende = 0;
            const statusTelling = {}; // Debug: tell statuser
            
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
                        if (['framme', 'ikke m\u00f8tt', 'startet'].includes(statusLower)) return;
                        
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
            addDebugLog(`Filter ${aktivtRfilter} | Totalt: ${totaltPagaende} | Statuser: ${statusStr} | Passert start: ${reiserFraTabell.length}`);
            
            if (reiserFraTabell.length === 0) {
                addDebugLog('Ingen reiser \u00e5 sjekke');
                oppdaterStats();
                oppdaterVisning([]);
                return;
            }
            
            // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
            // \u2551  STEG 2: Hent detaljer fra admin AJAX for hver kandidat        \u2551
            // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
            addDebugLog(`Henter detaljer for ${reiserFraTabell.length} reiser...`);
            const adminFilterTelling = { rekStartet: 0, rekFramme: 0, rekIkkeMott: 0, overstyrt: 0, bomtur: 0, terskel: 0 };

            for (const reise of reiserFraTabell) {
                try {

                    // Hent admin-detaljer (bruk resId som tripid)
                    const adminUrl = `https://pastrans-sorost.mq.nhn.no/administrasjon/admin/ajax_reqdetails?id=${reise.reqId}&db=1&tripid=${reise.resId}&showSutiXml=true&hideEvents=&full=true`;
                    
                    const adminRes = await fetch(adminUrl);

                    const adminHtml = await adminRes.text();

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
                    if (['framme', 'ikke m\u00f8tt', 'startet'].includes(rekStatusLower)) {
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
                    
                    // Hent folkeregistrert adresse (fra pasient-seksjonen, f\u00f8r Hentested)
                    let folkregAdresse = '';
                    let folkregPoststed = '';
                    const hentestedIdx = adminHtml.indexOf('Hentested');
                    if (hentestedIdx > -1) {
                        const pasientSeksjon = adminHtml.substring(0, hentestedIdx);
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
                        if (navn) deler.push(navn);
                        if (adresse) deler.push(adresse);
                        if (postSted) deler.push(postSted);
                        if (telefon) deler.push(`\ud83d\udcde ${telefon}`);
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
                        if (navn) deler.push(navn);
                        if (adresse) deler.push(adresse);
                        if (postSted) deler.push(postSted);
                        if (telefon) deler.push(`\ud83d\udcde ${telefon}`);
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
                        if (ovr.type === 'ignorer') {
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

                    // Parse avvikslogg fra admin
                    let avviksLogg = [];
                    let sisteKontaktFraAvvik = null; // Parse KMP/KMB-tidspunkt fra avvik
                    let sisteEPT = null; // Siste EPT (Etterlyst p\u00e5 Teams) tidspunkt + signatur
                    let sisteIFS = null; // Siste IFS (Informasjon fra sentral) tidspunkt + tekst
                    const avvikRegex = /<td[^>]*align="right"[^>]*>Avvik:<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
                    let avvikMatch;
                    while ((avvikMatch = avvikRegex.exec(adminHtml)) !== null) {
                        const avvikTekst = avvikMatch[1].trim()
                            .replace(/&nbsp;/g, '') // Fjern non-breaking space
                            .replace(/&aring;/g, '\u00e5')
                            .replace(/&aelig;/g, '\u00e6')
                            .replace(/&oslash;/g, '\u00f8')
                            .replace(/&Aring;/g, '\u00c5')
                            .replace(/&AElig;/g, '\u00c6')
                            .replace(/&Oslash;/g, '\u00d8');
                        // Kun legg til hvis det faktisk er tekst (ikke tom streng)
                        if (avvikTekst && avvikTekst.length > 0) {
                            avviksLogg.push(avvikTekst);

                            // Parse KMP/KMB/EPT/IFS-tidspunkt: "HH:MM - KMP/KMB/EPT/IFS (forklaring) ..."
                            const kontaktMatch = avvikTekst.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
                            if (kontaktMatch) {
                                const kontaktTid = kontaktMatch[1];
                                const kontaktType = kontaktMatch[2].toUpperCase();
                                // KMP/KMB p\u00e5virker SMS-terskel
                                if (kontaktType !== 'EPT' && kontaktType !== 'IFS' && kontaktType !== 'IST') {
                                    sisteKontaktFraAvvik = { tid: kontaktTid, type: kontaktType };
                                }
                                // EPT: Etterlyst p\u00e5 Teams (snooze etterlysning)
                                if (kontaktType === 'EPT') {
                                    const restTekst = avvikTekst.substring(kontaktMatch[0].length).trim();
                                    sisteEPT = { tid: kontaktTid, tekst: restTekst };
                                }
                                // IFS: Informasjon fra sentral (svar p\u00e5 etterlysning)
                                if (kontaktType === 'IFS') {
                                    const restTekst = avvikTekst.substring(kontaktMatch[0].length).trim();
                                    sisteIFS = { tid: kontaktTid, tekst: restTekst };
                                }
                            }
                        }
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
                        const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 5000);
                        const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
                        if (newReqMatch) {
                            sutiStatus.bestiltTid = newReqMatch[2]; // HH:MM
                            sutiStatus.bestiltDato = newReqMatch[1]; // DD.MM.YYYY HH:MM:SS
                            // Parse full timestamp
                            const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                            if (bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]), parseInt(bp[2])-1, parseInt(bp[1]), parseInt(bp[4]), parseInt(bp[5])).getTime();
                        }
                    }
                    
                    // Parse SUTI-meldinger fra ressurslogg-tabellen
                    // Hver rad: Tid | Status | ... | Suti kode | Suti attributt
                    // Vi ser etter rader med spesifikke koder og attributter
                    
                    // Finn SUTI-logg-seksjonen for \u00e5 begrense regex-s\u00f8k (ytelsesoptimalisering)
                    let sutiIdx = adminHtml.indexOf('Suti kode');
                    let sutiArea = sutiIdx > -1 ? adminHtml.substring(sutiIdx) : '';
                    
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
                            
                            // NewResource/AssignToNextCA + Tildelt = sendt til transport\u00f8r
                            if ((/NewResource/.test(rad) || /AssignToNextCA/.test(rad)) && /Tildelt/.test(rad)) {
                                sutiStatus.sendtTid = klokkeslett;
                                sutiStatus.sendtMs = tidMs;
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
                    
                    // Hent geoposisjon fra SUTI XML - separat for P\u00c5 VEI og FREMME
                    const hentGeo = async (xmlId) => {
                        try {
                            const xmlRes = await fetch(`/administrasjon/admin/sutiXml?id=${xmlId}`);
                            const xmlHtml = await xmlRes.text();
                            const latMatch = xmlHtml.match(/lat="([\d.]+)"/);
                            const longMatch = xmlHtml.match(/long="([\d.]+)"/);
                            if (latMatch && longMatch) return { lat: latMatch[1], long: longMatch[1] };
                        } catch (e) {}
                        return null;
                    };
                    
                    if (paaVeiXmlId) {
                        sutiStatus.bilPaaVeiGeo = await hentGeo(paaVeiXmlId);
                    }
                    if (fremmeXmlId) {
                        sutiStatus.bilFremmeGeo = await hentGeo(fremmeXmlId);
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
                    
                    // Effektiv forsinkelse: minutter siden KLAR (fraTidMs)
                    // Brukes for filtrering og FORSINKET-visning
                    // NISSY startTid er kun fallback hvis KLAR ikke finnes
                    const effektivForsinkelse = fraTidMs 
                        ? Math.floor((nowMs - fraTidMs) / 60000)
                        : reise.forsinkelse;
                    
                    // Vis b\u00e5de TUR og RETUR fra passert hentetidspunkt (visTerskel=0)
                    // SMS-terskel styrer kun kanSendeSms, ikke synlighet
                    if (effektivForsinkelse < visTerskel) {
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
                    if (sutiStatus.bomtur) {
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
                    
                    // alleredeSendt: bruker n\u00e5 korrekt sendtFraDb (beregnet med riktig smsId)
                    const alleredeSendt = sendtFraDb || smsLoggRes.length > 0;
                    
                    // Hent sist kontakt \u2014 prioriter avvikslogg (KMP/KMB) over DB
                    const kontaktInfo = kontaktData.get(reise.reqId);
                    let sistKontaktTid = null;
                    let sistKontaktMinSiden = null;
                    let sistKontaktType = null; // KMP eller KMB
                    
                    // F\u00f8rst: sjekk avvikslogg fra NISSY (mest p\u00e5litelig, synlig for alle)
                    if (sisteKontaktFraAvvik) {
                        sistKontaktTid = sisteKontaktFraAvvik.tid;
                        sistKontaktType = sisteKontaktFraAvvik.type;
                        const [kontaktTime, kontaktMin] = sistKontaktTid.split(':').map(Number);
                        const kontaktDato = new Date(now.getFullYear(), now.getMonth(), now.getDate(), kontaktTime, kontaktMin);
                        sistKontaktMinSiden = Math.floor((now - kontaktDato) / 60000);
                    }
                    // Fallback: DB-kontakt (for bakoverkompatibilitet)
                    else if (kontaktInfo && kontaktInfo.tidspunkt) {
                        sistKontaktTid = kontaktInfo.tidspunkt;
                        const [kontaktTime, kontaktMin] = sistKontaktTid.split(':').map(Number);
                        const kontaktDato = new Date(now.getFullYear(), now.getMonth(), now.getDate(), kontaktTime, kontaktMin);
                        sistKontaktMinSiden = Math.floor((now - kontaktDato) / 60000);
                    }
                    
                    // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
                    // \u2551  BEREGN MINUTTER TIL NESTE SMS                                 \u2551
                    // \u2551  Bruker smsForsinkelse (fra KLAR/Bestilt), ikke NISSY           \u2551
                    // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
                    let minTilSms;
                    let kanSendeSms = false;
                    
                    // Finn tidspunktet vi skal telle fra (siste av SMS eller kontakt)
                    let tellerFraMinSiden = sisteSmsMinutterSiden;
                    let tellerFraKilde = smsKilde;
                    
                    if (sistKontaktMinSiden !== null) {
                        if (tellerFraMinSiden === null || sistKontaktMinSiden < tellerFraMinSiden) {
                            tellerFraMinSiden = sistKontaktMinSiden;
                            tellerFraKilde = 'kontakt';
                        }
                    }
                    
                    if (smsLoggRes.length === 0 && !sendtFraDb && !kontaktInfo) {
                        // Ingen SMS sendt og ingen kontakt - bruk smsForsinkelse (korrekt for alle typer)
                        minTilSms = smsTerskel - smsForsinkelse;
                        kanSendeSms = minTilSms <= 0 && !!telefon;
                    } else if (tellerFraMinSiden !== null) {
                        // SMS sendt eller kontakt registrert - sjekk om 60 min har g\u00e5tt
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
                    let etterlysTerskel = erTur
                        ? (erSpot ? CONFIG.ETTERLYSE_TUR_SPOT_MIN : CONFIG.ETTERLYSE_TUR_MIN)
                        : CONFIG.ETTERLYSE_RETUR_MIN;
                    const etterlyseForsinkelse = effektivForsinkelse;
                    const harEPT = !!sisteEPT;
                    const harIFS = !!sisteIFS;

                    // Parse EPT/IFS-tidspunkt til minutter siden
                    let sistEPTMinSiden = null;
                    let sistIFSMinSiden = null;
                    if (sisteEPT) {
                        const [eptH, eptM] = sisteEPT.tid.split(':').map(Number);
                        const eptDato = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eptH, eptM);
                        sistEPTMinSiden = Math.floor((now - eptDato) / 60000);
                    }
                    if (sisteIFS) {
                        const [ifsH, ifsM] = sisteIFS.tid.split(':').map(Number);
                        const ifsDato = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ifsH, ifsM);
                        sistIFSMinSiden = Math.floor((now - ifsDato) / 60000);
                    }

                    // IFS etter siste EPT = besvart (transport\u00f8r har svart)
                    const ifsEtterEPT = harIFS && harEPT && sistIFSMinSiden !== null && sistEPTMinSiden !== null
                        && sistIFSMinSiden <= sistEPTMinSiden; // IFS er nyere

                    // Etterlys-status: venter | etterlyse | etterlyst | besvart
                    let etterlysStatus;
                    let minTilNesteEtterlysning;
                    if (sutiStatus.bilFremme || sutiStatus.hentet) {
                        // Bil er fremme eller hentet - ingen etterlysning n\u00f8dvendig
                        etterlysStatus = 'besvart';
                        minTilNesteEtterlysning = 0;
                    } else if (ifsEtterEPT) {
                        // Har f\u00e5tt IFS etter EPT - besvart
                        etterlysStatus = 'besvart';
                        minTilNesteEtterlysning = 0;
                    } else if (harEPT && sistEPTMinSiden !== null) {
                        // EPT registrert - sjekk om snooze er utl\u00f8pt
                        minTilNesteEtterlysning = CONFIG.ETTERLYSE_REPETER_MIN - sistEPTMinSiden;
                        if (minTilNesteEtterlysning <= 0) {
                            // Snooze utl\u00f8pt - b\u00f8r etterlyses igjen
                            etterlysStatus = 'etterlyse';
                        } else {
                            // Snoozet - venter p\u00e5 neste runde
                            etterlysStatus = 'etterlyst';
                        }
                    } else if (etterlyseForsinkelse >= etterlysTerskel) {
                        // Passert terskel, ingen EPT - b\u00f8r etterlyses
                        etterlysStatus = 'etterlyse';
                        minTilNesteEtterlysning = 0;
                    } else {
                        // Under terskel
                        etterlysStatus = 'venter';
                        minTilNesteEtterlysning = etterlysTerskel - etterlyseForsinkelse;
                    }
                    const kanEtterlyse = etterlysStatus === 'etterlyse';

                    // Bygg avviksgrunn-liste
                    let avviksGrunner = [];
                    if (sutiStatus.erIA) avviksGrunner.push('\ud83d\udfe3 IA - kontakt behandler');
                    if (!telefon) avviksGrunner.push('\ud83d\udcf5 Mangler mobilnr');

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
            
            // Behold s\u00f8k-kandidater: f\u00f8rst fra minne, deretter fra DB (for F5)
            let sokKandidater = (window.smsKandidater || []).filter(k => k.erSok);
            
            // Hvis ingen s\u00f8k i minne, sjekk DB (etter F5)
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
                                
                                // Gjenbruk SOK_TURID parsingen via postMessage
                                // Men enklere: parse direkte her med minimal info
                                const navnMatch = adminHtml.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                const pasientNavn = navnMatch ? navnMatch[1].trim().replace(/\s+/g, ' ') : '(ukjent)';
                                const pnrMatch = adminHtml.match(/Personnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i);
                                const pnr = pnrMatch ? pnrMatch[1] : '';
                                
                                // Telefoner (uten generisk Telefon: - legges til retningsbevisst etter erTur)
                                const mobilMatch = adminHtml.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                const mobilEpjMatch = adminHtml.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                let telefon = '', telefonKilde = '', alleTelefoner = [], alleNumreMedKilde = [], harIkkeSms = false;
                                for (const k of [
                                    { match: mobilMatch, kilde: 'MOB' }, { match: mobilEpjMatch, kilde: 'EPJ' }
                                ]) {
                                    if (k.match && k.match[1].trim()) {
                                        const raw = k.match[1].trim();
                                        if (/reservert|ikke\s*sms/i.test(raw)) harIkkeSms = true;
                                        const nr = normaliserTelefon(raw);
                                        if (nr && nr !== '(mangler)') {
                                            const nr8 = nr.replace(/[\s+\-]/g, '').slice(-8);
                                            if (nr8.length === 8) {
                                                if (!alleNumreMedKilde.find(n => n.nr8 === nr8))
                                                    alleNumreMedKilde.push({ nr, nr8, kilde: k.kilde, erMobil: erMobilnummer(nr8) });
                                                if (erMobilnummer(nr8) && !alleTelefoner.includes(nr8)) alleTelefoner.push(nr8);
                                                if (!telefon && erMobilnummer(nr8)) { telefon = nr; telefonKilde = k.kilde; }
                                            }
                                        }
                                    }
                                }
                                
                                // Adresser
                                let henteAdresse = '', henteAdresseFull = '', leveringsAdresse = '', leveringsAdresseFull = '';
                                const hentestedet = adminHtml.match(/Hentested<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                                if (hentestedet) {
                                    henteAdresse = `${hentestedet[2].trim()}, ${hentestedet[3].trim()}`;
                                    let d = []; [1,2,3].forEach(i => { if(hentestedet[i].trim()) d.push(hentestedet[i].trim()); }); if(hentestedet[4].trim()) d.push(`\ud83d\udcde ${hentestedet[4].trim()}`); if(hentestedet[5].trim()) d.push(`(${hentestedet[5].trim()})`);
                                    henteAdresseFull = d.join('\n');
                                }
                                const leveringsstedet = adminHtml.match(/Leveringssted<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                                if (leveringsstedet) {
                                    leveringsAdresse = `${leveringsstedet[2].trim()}, ${leveringsstedet[3].trim()}`;
                                    let d = []; [1,2,3].forEach(i => { if(leveringsstedet[i].trim()) d.push(leveringsstedet[i].trim()); }); if(leveringsstedet[4].trim()) d.push(`\ud83d\udcde ${leveringsstedet[4].trim()}`); if(leveringsstedet[5].trim()) d.push(`(${leveringsstedet[5].trim()})`);
                                    leveringsAdresseFull = d.join('\n');
                                }
                                
                                // Retning + tider
                                const retningMatch = adminHtml.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
                                const erTur = retningMatch ? retningMatch[1].trim().toLowerCase().includes('til behandling') : true;

                                // Legg til adresse-telefon retningsbevisst: TUR=hentested, RETUR=leveringssted
                                const adrTlf = erTur
                                    ? (hentestedet && hentestedet[4] ? hentestedet[4].trim() : '')
                                    : (leveringsstedet && leveringsstedet[4] ? leveringsstedet[4].trim() : '');
                                if (adrTlf) {
                                    const adrNr = normaliserTelefon(adrTlf);
                                    if (adrNr && adrNr !== '(mangler)') {
                                        const adrNr8 = adrNr.replace(/[\s+\-]/g, '').slice(-8);
                                        if (adrNr8.length === 8) {
                                            if (!alleNumreMedKilde.find(n => n.nr8 === adrNr8))
                                                alleNumreMedKilde.push({ nr: adrNr, nr8: adrNr8, kilde: 'ADR', erMobil: erMobilnummer(adrNr8) });
                                            if (erMobilnummer(adrNr8) && !alleTelefoner.includes(adrNr8)) alleTelefoner.push(adrNr8);
                                            if (!telefon && erMobilnummer(adrNr8)) { telefon = adrNr; telefonKilde = 'ADR'; }
                                        }
                                    }
                                }

                                let fraTid = '', tilTid = '';
                                const klarM = adminHtml.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                if (klarM) fraTid = klarM[1].trim();
                                const oppM = adminHtml.match(/tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                if (oppM) tilTid = oppM[1].trim();
                                
                                // SUTI
                                let sutiStatus = { bestiltTid:null,bestiltMs:null,sendtTid:null,sendtMs:null,bilTildelt:false,bilTildeltTid:null,bilTildeltMs:null,loeyve:null,bilFremme:false,bilFremmeTid:null,bilFremmeMs:null,bilFremmeGeo:null,hentet:false,hentetTid:null,levert:false,bomtur:false,avvist:false,erIA:false };
                                const rekvLoggIdx = adminHtml.indexOf('Rekvisisjonslogg');
                                if (rekvLoggIdx > -1) {
                                    const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 5000);
                                    const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
                                    if (newReqMatch) { sutiStatus.bestiltTid = newReqMatch[2]; const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/); if(bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]),parseInt(bp[2])-1,parseInt(bp[1]),parseInt(bp[4]),parseInt(bp[5])).getTime(); }
                                }
                                const sutiIdx = adminHtml.indexOf('Suti kode');
                                if (sutiIdx > -1) {
                                    const sutiArea = adminHtml.substring(sutiIdx);
                                    const rr = /<tr[^>]*>\s*([\s\S]*?)<\/tr>/gi; let rm;
                                    const ar = []; while((rm=rr.exec(sutiArea))!==null){const r=rm[1];const tm=r.match(/<nobr>(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})<\/nobr>/);if(!tm)continue;ar.push({rad:r,tidMs:new Date(+tm[3],+tm[2]-1,+tm[1],+tm[4],+tm[5],+tm[6]).getTime(),klokkeslett:`${tm[4]}:${tm[5]}`});}
                                    ar.sort((a,b)=>a.tidMs-b.tidMs);
                                    for(const{rad,tidMs,klokkeslett}of ar){if((/NewResource/.test(rad)||/AssignToNextCA/.test(rad))&&/Tildelt/.test(rad)){sutiStatus.sendtTid=klokkeslett;sutiStatus.sendtMs=tidMs;}if(/>\s*1703\b/.test(rad)||/Bomtur/.test(rad)){sutiStatus.bilTildelt=false;sutiStatus.bilTildeltTid=null;sutiStatus.bilTildeltMs=null;sutiStatus.bilFremme=false;sutiStatus.bilFremmeTid=null;sutiStatus.bilFremmeMs=null;sutiStatus.loeyve=null;sutiStatus.hentet=false;sutiStatus.hentetTid=null;}if(!/Bekreftet/.test(rad))continue;if(/>\s*3003\b/.test(rad)){sutiStatus.bilTildelt=true;sutiStatus.bilTildeltTid=klokkeslett;sutiStatus.bilTildeltMs=tidMs;const lm=rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i)||rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/)||rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);if(lm)sutiStatus.loeyve=lm[1];}if(/UpdateResource/.test(rad)&&/Bekreftet/.test(rad)){const lm=rad.match(/<nobr>([A-Z]{2}\d{4,5})<\/nobr>/i)||rad.match(/<nobr>(\d{1,4}-\d{3,5})<\/nobr>/)||rad.match(/<nobr>([A-Z]{1,3}-\d{2,5})<\/nobr>/);if(lm)sutiStatus.loeyve=lm[1];}if(/>\s*1709\b/.test(rad)){sutiStatus.bilFremme=true;sutiStatus.bilFremmeTid=klokkeslett;sutiStatus.bilFremmeMs=tidMs;}if(/>\s*1701\b/.test(rad)){sutiStatus.hentet=true;sutiStatus.hentetTid=klokkeslett;}if(/>\s*1750\b/.test(rad))sutiStatus.avvist=true;}
                                }
                                
                                const rekMatch = adminHtml.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i) || adminHtml.match(/>(\d{12})<\/b>/);
                                const behovMatch = adminHtml.match(/Spesielle behov:<\/td>\s*<td[^>]*>\s*([\s\S]*?)<\/td>/i);
                                const transpMatch = adminHtml.match(/Transport..?r:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                const transpStatusMatch = adminHtml.match(/Transportstatus:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                                
                                sokKandidater.push({
                                    reqId: `SOK_${lagret.tripId}`, resId: lagret.tripId,
                                    nissyReqId: lagret.adminId || '',
                                    nissyTripId: lagret.tripId || '',
                                    navn: pasientNavn, telefon, telefonKilde, alleTelefoner, alleNumreMedKilde, harIkkeSms,
                                    rekNr: rekMatch ? rekMatch[1] : '', rekStatus: transpStatusMatch ? transpStatusMatch[1].trim() : '',
                                    pnr, fraTid, fraTidMs: 0, tilTid, erTur, folkregAdresse, folkregPoststed: '',
                                    henteAdresse, henteAdresseFull, leveringsAdresse, leveringsAdresseFull,
                                    transportor: transpMatch ? transpMatch[1].trim() : '',
                                    loyveTur: sutiStatus.loeyve || '', turId: lagret.turId || lagret.tripId || '',
                                    spesielleBehov: behovMatch ? behovMatch[1].replace(/<[^>]*>/g,'').trim() : '',
                                    smsTerskel: 0, kanSendeSms: false, manglerTelefon: !telefon, smsId: null,
                                    status: '', avviksLogg: [], smsLogg: [], smsLoggRes: [],
                                    sutiStatus, bestiltMs: sutiStatus.bestiltMs || 0,
                                    // Etterlysning (v6) - standardverdier for gjenopprettet s\u00f8k
                                    etterlysTerskel: 0, etterlyseForsinkelse: 0, kanEtterlyse: false,
                                    harEPT: false, sisteEPT: null, harIFS: false, sisteIFS: null,
                                    sistEPTMinSiden: null, sistIFSMinSiden: null,
                                    minTilNesteEtterlysning: 0, etterlysStatus: 'venter',
                                    forsinkelse: 0, erSok: true, sokVerdi: lagret.sokVerdi, sokType: lagret.sokType
                                });
                                addDebugLog(`\ud83d\udd0d Gjenopprettet: ${pasientNavn} (TUR ${lagret.turId})`);
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
            const win = window.smsWin;
            if (win && !win.closed) {
                const spinner = win.document.getElementById('spinner');
                if (spinner) spinner.classList.add('hidden');
            }
            
            oppdaterStats();
            oppdaterVisning(kandidater);
            markerSpotINissy(kandidater);
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
    function markerSpotINissy(kandidater) {
        // Fjern gamle badges f\u00f8rst (rydder ved hver oppdatering)
        document.querySelectorAll('.ovr-spot-badge').forEach(el => el.remove());

        // Finn unike resId-er med SPOT
        const spotResIds = new Set();
        (kandidater || []).forEach(k => {
            if (k.erSpot) spotResIds.add(k.resId);
        });

        spotResIds.forEach(resId => {
            const rad = document.getElementById('P-' + resId);
            if (!rad || !rad.cells || rad.cells.length === 0) return;
            // Legg SPOT-badge bak teksten i f\u00f8rste celle
            const celle = rad.cells[0];
            if (celle) {
                const badge = document.createElement('span');
                badge.className = 'ovr-spot-badge';
                badge.textContent = 'SPOT';
                badge.style.cssText = 'display:inline-block;background:#dc2626;color:#fff;padding:1px 5px;border-radius:3px;font-size:10px;font-weight:700;margin-left:4px;vertical-align:middle;';
                celle.appendChild(badge);
            }
        });
    }

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

        // Skjul pasienter som har f\u00e5tt SMS og venter p\u00e5 neste runde (cooldown)
        const iCooldown = kandidater ? kandidater.filter(k => k.alleredeSendt && !k.kanSendeSms && !k.erSok) : [];
        kandidater = kandidater ? kandidater.filter(k => !(k.alleredeSendt && !k.kanSendeSms) || k.erSok) : [];

        if (!kandidater || kandidater.length === 0) {
            cont.innerHTML = `
                <div class="ingen-kandidater">
                    <div class="ikon">&#10004;</div>
                    <div>Ingen forsinkede reiser</div>
                    ${iCooldown.length > 0 ? `<div style="margin-top:10px;font-size:12px;color:#6b7280;">\u2709 ${iCooldown.length} pasient${iCooldown.length > 1 ? 'er' : ''} har f\u00e5tt SMS</div>` : ''}
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
            const utenMobil = r.pasienter.filter(p => p.manglerTelefon);
            if (utenMobil.length > 0) {
                r.avviksGrunnRessurs.push(`\ud83d\udcf5 ${utenMobil.length} pas. mangler mobilnr`);
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
                
                if (!noenSmsMatcherRessurs) {
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
        // Fjern etterlyse-ressurser fra normal-pool (de vises i egen seksjon)
        const etterlysResIds = new Set(etterlyse.map(r => r.resId));
        const ikkeEtterlys = normalRessurser.filter(r => !etterlysResIds.has(r.resId));

        let venter = ikkeEtterlys.filter(r =>
            !r.pasienter.some(p => p.kanSendeSms)
        );
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
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  LAG PASIENT-KORT (inne i ressurs-kontainer)                       \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        function lagPasientKort(k, visSmsLogg = true, storTekst = false) {
            const retningClass = k.erTur ? 'tur' : 'retur';
            const retningTekst = k.erTur ? 'TUR' : 'RETUR';
            
            // Fontst\u00f8rrelser basert p\u00e5 storTekst
            const navnSize = storTekst ? '15px' : '13px';
            const infoSize = storTekst ? '13px' : '12px';
            const badgeSize = storTekst ? '12px' : '12px';
            const smallSize = storTekst ? '11px' : '11px';
            const knappSize = storTekst ? '13px' : '11px';
            
            let knappHtml = '';
            if (k.manglerTelefon) {
                knappHtml = `<span style="font-size:${infoSize}; color:#dc3545; font-weight:600;">\ud83d\udcf5 Mangler tlf</span>`;
            } else if (k.kanSendeSms) {
                const knappTekst = k.alleredeSendt ? 'NY SMS' : 'SMS';
                knappHtml = `<button class="btn btn-simuler" style="font-size:${knappSize}; padding:6px 12px;" onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SMS_PREVIEW', smsId:'${k.smsId}', reqId:'${k.reqId}', resId:'${k.resId}', telefon:'${k.telefon}', alleTelefoner:'${(k.alleTelefoner || []).join(',')}', navn:'${k.navn.replace(/'/g, "\\'")}', forsinkelse:${k.forsinkelse}, erTur:${k.erTur}, smsRunde:${k.smsRunde}})">${knappTekst}</button>`;
            } else if (!k.alleredeSendt && k.telefon) {
                knappHtml = `<div style="display:flex; align-items:center; gap:4px;">` +
                    `<div style="color:#6b7280; font-size:${infoSize};">\u23f3 ${Math.abs(k.minTilSms)}m</div>` +
                    `<button class="btn btn-simuler" style="font-size:${knappSize}; padding:3px 8px; opacity:0.6; background:#fef3c7; border:1px solid #d97706; color:#92400e;" onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'SMS_PREVIEW', smsId:'${k.smsId}', reqId:'${k.reqId}', resId:'${k.resId}', telefon:'${k.telefon}', alleTelefoner:'${(k.alleTelefoner || []).join(',')}', navn:'${k.navn.replace(/'/g, "\\'")}', forsinkelse:${k.forsinkelse}, erTur:${k.erTur}, smsRunde:${k.smsRunde}})">SMS</button>` +
                    `</div>`;
            } else if (!k.alleredeSendt) {
                knappHtml = `<div style="color:#6b7280; font-size:${infoSize};">\u23f3 ${Math.abs(k.minTilSms)}m</div>`;
            }
            
            // Avviksgrunner (vises \u00f8verst i kortet hvis det finnes)
            let avviksGrunnerHtml = '';
            if (k.avviksGrunner && k.avviksGrunner.length > 0) {
                avviksGrunnerHtml = `
                    <div style="background:#fee2e2; padding:4px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #dc3545;">
                        ${k.avviksGrunner.map(g => `<span style="color:#991b1b; font-size:${badgeSize}; font-weight:600;">${g}</span>`).join(' \u00b7 ')}
                    </div>
                `;
            }

            // v6: Etterlysning-status-linje
            let etterlysHtml = '';
            if (k.etterlysStatus === 'etterlyse') {
                const loeyveInfo = k.sutiStatus && k.sutiStatus.loeyve ? k.sutiStatus.loeyve : '';
                const transpInfo = k.transportor ? k.transportor.split(',')[0].trim() : '';
                const detaljer = [loeyveInfo, transpInfo].filter(Boolean).join(', ');
                etterlysHtml = `
                    <div style="background:#fef2f2; padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #dc2626; display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">\ud83d\udce2</span>
                        <span style="color:#dc2626; font-size:${infoSize}; font-weight:700;">Etterlyse n\u00e5!</span>
                        ${detaljer ? `<span style="color:#991b1b; font-size:${badgeSize};">(${detaljer})</span>` : ''}
                    </div>
                `;
            } else if (k.etterlysStatus === 'etterlyst' && k.sisteEPT) {
                const snoozeMin = k.minTilNesteEtterlysning > 0 ? k.minTilNesteEtterlysning : 0;
                etterlysHtml = `
                    <div style="background:#fef3c7; padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #f59e0b; display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">\u23f3</span>
                        <span style="color:#92400e; font-size:${infoSize}; font-weight:600;">EPT ${k.sisteEPT.tid}</span>
                        ${k.sisteEPT.tekst ? `<span style="color:#78350f; font-size:${badgeSize};">${k.sisteEPT.tekst}</span>` : ''}
                        <span style="color:#92400e; font-size:${badgeSize};">\u2192 neste om ${snoozeMin}m</span>
                    </div>
                `;
            } else if (k.etterlysStatus === 'besvart' && k.sisteIFS) {
                etterlysHtml = `
                    <div style="background:#f0fdf4; padding:5px 8px; border-radius:4px; margin-bottom:6px; border-left:3px solid #10b981; display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px;">\u2705</span>
                        ${k.sisteEPT ? `<span style="color:#166534; font-size:${badgeSize};">EPT ${k.sisteEPT.tid}</span><span style="color:#64748b; font-size:${badgeSize};">\u2192</span>` : ''}
                        <span style="color:#166534; font-size:${infoSize}; font-weight:600;">IFS ${k.sisteIFS.tid}</span>
                        ${k.sisteIFS.tekst ? `<span style="color:#15803d; font-size:${badgeSize};">${k.sisteIFS.tekst}</span>` : ''}
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
                
                // Enhetlig tidsboks-funksjon
                // Standard: hvit bg, m\u00f8rk tekst (#1e293b), gr\u00e5 label (#64748b)
                // Passert steg: normal vekt | N\u00e5v\u00e6rende steg: fet | Fremtidig steg: dempet (#d1d5db)
                // Spesial: geo \u2192 bl\u00e5 bg (#dbeafe) + klikkbar | P\u00c5 VEI > 30min \u2192 r\u00f8d
                const lagBoks = (label, tid, opts = {}) => {
                    const { aktiv = true, bg = '#fff', color, klikkUrl, minWidth } = opts;
                    const bgCol = bg;
                    const txtCol = color || (aktiv ? '#1e293b' : '#d1d5db');
                    const lblCol = aktiv ? '#64748b' : '#d1d5db';
                    const click = klikkUrl ? `onclick="event.stopPropagation(); window.open('${klikkUrl}','_blank')"` : '';
                    const cursor = klikkUrl ? ' cursor:pointer;' : '';
                    const mw = minWidth ? ` min-width:${minWidth};` : ' min-width:0;';
                    return `<div ${click} style="text-align:center; background:${bgCol}; padding:3px 10px; border-radius:4px; flex:1;${mw}${cursor}">
                        <div style="font-size:${smallSize}; color:${lblCol};">${label}</div>
                        ${tid ? `<div style="font-size:${infoSize}; color:${txtCol}; white-space:nowrap;">${tid}</div>` : ''}
                    </div>`;
                };
                
                // Bygg alle bokser med full timestamp for sortering
                const idag = new Date();
                const idagDag = idag.getDate();
                const idagMnd = idag.getMonth();
                const idagAar = idag.getFullYear();
                
                // Vis DD.MM HH:MM hvis annen dag, bare HH:MM hvis i dag
                const visTid = (ms) => {
                    if (!ms) return '';
                    const d = new Date(ms);
                    const kl = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                    if (d.getDate() === idagDag && d.getMonth() === idagMnd && d.getFullYear() === idagAar) return kl;
                    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')} ${kl}`;
                };
                const erAnnenDag = (ms) => {
                    if (!ms) return false;
                    const d = new Date(ms);
                    return !(d.getDate() === idagDag && d.getMonth() === idagMnd && d.getFullYear() === idagAar);
                };
                
                const bokser = [];
                
                // BESTILT
                bokser.push({ ms: s.bestiltMs || 0, html: lagBoks('BESTILT', visTid(s.bestiltMs) || s.bestiltTid || '', { minWidth: erAnnenDag(s.bestiltMs) ? '90px' : undefined }) });
                
                // TILDELT (sendt til transport\u00f8r)
                bokser.push({ ms: s.sendtMs || Infinity, html: s.sendtTid 
                    ? lagBoks('TILDELT', visTid(s.sendtMs) || s.sendtTid, { aktiv: steg >= 1, minWidth: erAnnenDag(s.sendtMs) ? '90px' : undefined })
                    : lagBoks('TILDELT', '', { aktiv: false }) });
                
                // KLAR (pasient klar fra) - bruk fraTidMs fra admin (per pasient), fallback til startTidMs fra NISSY
                const klarMs = k.fraTidMs || k.startTidMs || null;
                bokser.push({ ms: klarMs || Infinity, html: lagBoks('KLAR', visTid(klarMs) || k.startTid, { minWidth: erAnnenDag(klarMs) ? '90px' : undefined }) });
                
                // P\u00c5 VEI
                const paaVeiHarGeo = !!(s.bilPaaVeiGeo && k.henteAdresse);
                const paaVeiMapsUrl = paaVeiHarGeo 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${s.bilPaaVeiGeo.lat},${s.bilPaaVeiGeo.long}&destination=${encodeURIComponent(k.henteAdresse)}&travelmode=driving` 
                    : '';
                if (s.bilTildeltTid) {
                    const naaMs = idag.getTime();
                    const paaVeiLenge = !s.bilFremme && s.bilTildeltMs && (naaMs - s.bilTildeltMs) > 30 * 60000;
                    bokser.push({ ms: s.bilTildeltMs || Infinity, html: lagBoks('P\u00c5 VEI', visTid(s.bilTildeltMs) || s.bilTildeltTid, { 
                        aktiv: steg >= 2, 
                        bg: paaVeiHarGeo ? '#dbeafe' : '#fff',
                        color: paaVeiLenge ? '#ef4444' : undefined,
                        klikkUrl: paaVeiHarGeo ? paaVeiMapsUrl : undefined
                    }) });
                    
                    // ETA-boks: estimert ankomsttid basert p\u00e5 geoavstand
                    if (k.geoAvstand && !s.bilFremme && s.bilTildeltMs) {
                        const etaMs = s.bilTildeltMs + (k.geoAvstand.minutter * 60000);
                        bokser.push({ ms: etaMs, html: lagBoks('ETA', `~${visTid(etaMs)}`, {
                            aktiv: true,
                            bg: '#f0fdf4',
                            color: '#16a34a'
                        }) });
                    }
                } else {
                    bokser.push({ ms: Infinity, html: lagBoks('P\u00c5 VEI', '', { aktiv: false }) });
                }
                
                // FREMME
                const fremmeHarGeo = !!(s.bilFremmeGeo && k.henteAdresse);
                const fremmeMapsUrl = fremmeHarGeo 
                    ? `https://www.google.com/maps/dir/?api=1&origin=${s.bilFremmeGeo.lat},${s.bilFremmeGeo.long}&destination=${encodeURIComponent(k.henteAdresse)}&travelmode=driving` 
                    : '';
                if (s.bilFremmeTid) {
                    bokser.push({ ms: s.bilFremmeMs || Infinity, html: lagBoks('FREMME', visTid(s.bilFremmeMs) || s.bilFremmeTid, {
                        aktiv: steg >= 3,
                        bg: fremmeHarGeo ? '#dbeafe' : '#fff',
                        klikkUrl: fremmeHarGeo ? fremmeMapsUrl : undefined
                    }) });
                } else {
                    bokser.push({ ms: Infinity, html: lagBoks('FREMME', '', { aktiv: false }) });
                }
                
                // Sorter p\u00e5 full timestamp (tomme/Infinity sist)
                bokser.sort((a, b) => a.ms - b.ms);
                
                sutiHtml = `<div style="display:flex; gap:3px; margin-top:4px;">
                    ${bokser.map(b => b.html).join('')}
                </div>`;
                
                if (s.bomtur) {
                    sutiHtml = `<div style="text-align:center; background:#fee2e2; padding:2px 6px; border-radius:4px;">
                        <div style="font-size:${smallSize}; color:#991b1b;">BOMTUR</div>
                        <div style="font-weight:bold; font-size:${infoSize}; color:#991b1b;">\u274c</div>
                    </div>`;
                }
                if (s.avvist) {
                    sutiHtml = `<div style="text-align:center; background:#fee2e2; padding:2px 6px; border-radius:4px;">
                        <div style="font-size:${smallSize}; color:#991b1b;">AVVIST</div>
                        <div style="font-weight:bold; font-size:${infoSize}; color:#991b1b;">\u274c</div>
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
                        <div style="margin-top:8px; padding-top:6px; border-top:1px dashed #d1d5db;">
                            <div style="font-size:${badgeSize}; color:#64748b; margin-bottom:3px; font-weight:600;">\ud83d\udce8 SMS TIL DENNE PASIENT</div>
                            ${smsTilPasient.map(s => {
                                const tidMatch = s.tidspunkt.match(/(\d{2}:\d{2})/);
                                const kl = tidMatch ? tidMatch[1] : s.tidspunkt;
                                return `
                                <div style="background:#f0fdf4; padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #10b981;">
                                    <div style="color:#166534; font-weight:600;">${kl} \u2192 ${s.mottaker}</div>
                                    <div style="color:#374151; margin-top:2px; line-height:1.2;">${s.melding}</div>
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
                        alleBadges.push(`<span title="${b.trim()}" style="display:inline-block; background:#ede9fe; color:#7c3aed; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; border:1px solid #c4b5fd; cursor:default;">${kort}</span>`);
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
                        <div style="font-size:${badgeSize}; color:#64748b; margin-top:6px; display:flex; gap:12px;">
                            <div style="flex:1;">
                                <div style="font-weight:600; color:#374151; margin-bottom:2px;">\ud83d\udccd Fra:</div>
                                <div style="line-height:1.3;">${formatAdresse(fraFull)}</div>
                            </div>
                            <div style="flex:1;">
                                <div style="font-weight:600; color:#374151; margin-bottom:2px;">\ud83d\udccd Til:</div>
                                <div style="line-height:1.3;">${formatAdresse(tilFull)}</div>
                            </div>
                        </div>
                    `;
                }
            }
            
            // Forsinkelse: vis total ventetid siden referansetidspunkt
            // SPOT TUR: siden Bestilt
            // Alle andre: siden KLAR
            let effektivForsinkelse;
            if (k.erSpot && k.erTur && k.bestiltMs) {
                effektivForsinkelse = Math.floor((Date.now() - k.bestiltMs) / 60000);
            } else if (k.fraTidMs) {
                effektivForsinkelse = Math.floor((Date.now() - k.fraTidMs) / 60000);
            } else {
                effektivForsinkelse = k.forsinkelse;
            }
            // Vis total ventetid (minutter siden KLAR/Bestilt)
            // Men kun etter at terskel er passert - f\u00f8r det vis +0m
            const overTerskel = effektivForsinkelse >= k.smsTerskel;
            const visForsinkelse = overTerskel ? effektivForsinkelse : 0;
            const forsinkelseFarge = visForsinkelse > 60 ? '#dc3545' : visForsinkelse > 30 ? '#f59e0b' : '#10b981';
            const forsinkelseTekst = visForsinkelse >= 60 
                ? `+${Math.floor(visForsinkelse / 60)}t ${visForsinkelse % 60}m`
                : `+${visForsinkelse}m`;
            
            // Tooltip: vis KLAR-tid info
            const klarMinSiden = k.fraTidMs ? Math.floor((Date.now() - k.fraTidMs) / 60000) : null;
            const forsinkelseTip = klarMinSiden !== null 
                ? `Klar for ${klarMinSiden >= 60 ? Math.floor(klarMinSiden/60) + 't ' + klarMinSiden%60 : klarMinSiden} min siden`
                : '';
            
                    // N\u00e5v\u00e6rende tid for kontakt-feltet
                    const naaTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
                    
                    return `
                <div data-turid="${k.turId || k.reqId}" style="background:${k.erSok ? '#f5f3ff' : '#f8fafc'}; padding:${storTekst ? '10px 12px' : '8px 10px'}; border-radius:6px; margin-bottom:${storTekst ? '8px' : '6px'}; border-left:4px solid ${k.erSok ? '#8b5cf6' : (k.erTur ? '#10b981' : '#f59e0b')};${k.erSok ? ' border:1px solid #c4b5fd; border-left:4px solid #8b5cf6;' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#e2e8f0; margin:${storTekst ? '-10px -12px 8px -12px' : '-8px -10px 6px -10px'}; padding:6px 12px; border-radius:6px 6px 0 0;">
                        <span style="font-size:${infoSize}; color:#1e293b;">${k.erSok ? '<span style="background:#8b5cf6; color:white; padding:1px 5px; border-radius:3px; font-size:' + badgeSize + '; margin-right:4px;">S\u00d8K</span>' : ''}<strong>${k.navn}</strong>${k.pnr && k.pnr.length === 11 ? (() => {
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
                                return ` <span style="font-weight:normal; color:#64748b;">(${alder} \u00e5r)</span>`;
                            })() : ''}</span>
                        ${k.rekNr ? `<span style="display:flex;align-items:center;"><a href="https://pastrans-sorost.mq.nhn.no/administrasjon/admin/searchStatus?nr=${k.rekNr}" target="_blank" onclick="event.stopPropagation()" style="font-size:${infoSize}; color:#64748b; text-decoration:none; font-weight:normal;" onmouseover="this.style.color='#3b82f6';this.style.textDecoration='underline'" onmouseout="this.style.color='#64748b';this.style.textDecoration='none'">${k.rekNr}</a><span onclick="event.stopPropagation();navigator.clipboard.writeText('${k.rekNr}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${infoSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${k.rekNr}">\ud83d\udccb</span></span>` : ''}
                    </div>
                    ${avviksGrunnerHtml}
                    ${etterlysHtml}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="retning-badge ${retningClass}" style="font-size:${badgeSize}; padding:2px 6px;">${retningTekst}</span>
                            ${k.erSpot ? `<span title="Bestilt under 25 min f\u00f8r klar" style="display:inline-block; background:#fee2e2; color:#dc2626; padding:2px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:700; border:1px solid #fca5a5;">SPOT</span>` : ''}
                            ${k.rekStatus ? `<span style="display:inline-block; background:#f1f5f9; color:#475569; padding:2px 6px; border-radius:4px; font-size:${badgeSize}; border:1px solid #cbd5e1;">${k.rekStatus}</span>` : ''}
                            ${k.meldingJustering != null ? `<span title="Manuell justering fra planlegger" style="display:inline-block; background:${k.meldingJustering < 0 ? '#dbeafe' : '#fef3c7'}; color:${k.meldingJustering < 0 ? '#1d4ed8' : '#92400e'}; padding:2px 6px; border-radius:4px; font-size:${badgeSize}; font-weight:700; border:1px solid ${k.meldingJustering < 0 ? '#93c5fd' : '#fcd34d'};">${k.meldingJustering > 0 ? '+' : ''}${k.meldingJustering}</span>` : ''}
                            <div style="position:relative; display:inline-block;" class="pas-meny">
                                <button onclick="event.stopPropagation(); const allMenus=this.closest('.pas-meny').closest('div').querySelectorAll('.pas-meny-dropdown'); allMenus.forEach(m=>{ if(m!==this.nextElementSibling) m.style.display='none'; }); const m=this.nextElementSibling; m.style.display=m.style.display==='block'?'none':'block';" style="background:none; border:1px solid #d1d5db; border-radius:4px; padding:1px 6px; cursor:pointer; font-size:${badgeSize}; color:#64748b; line-height:1;">\u2630</button>
                                <div class="pas-meny-dropdown" style="display:none; position:absolute; top:100%; left:0; background:white; border:1px solid #d1d5db; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:100; min-width:180px; padding:4px 0; margin-top:2px;">
                                    <div style="position:relative;" onmouseenter="this.querySelector('.submenu').style.display='block'" onmouseleave="this.querySelector('.submenu').style.display='none'">
                                        <button style="display:flex; justify-content:space-between; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155;">
                                            <span>Endre retning</span><span style="color:#9ca3af;">\u25b8</span>
                                        </button>
                                        <div class="submenu" style="display:none; position:absolute; left:100%; top:-4px; background:white; border:1px solid #d1d5db; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:130px; padding:4px 0;">
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_RETNING', reqId:'${k.reqId}', nyRetning:'TUR'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:${k.erTur ? '#dbeafe' : 'none'}; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155; font-weight:${k.erTur ? '700' : '400'};">TUR ${k.erTur ? '\u2713' : ''}</button>
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_RETNING', reqId:'${k.reqId}', nyRetning:'RETUR'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:${!k.erTur ? '#dbeafe' : 'none'}; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155; font-weight:${!k.erTur ? '700' : '400'};">RETUR ${!k.erTur ? '\u2713' : ''}</button>
                                        </div>
                                    </div>
                                    <div style="position:relative;" onmouseenter="this.querySelector('.submenu').style.display='block'" onmouseleave="this.querySelector('.submenu').style.display='none'">
                                        <button style="display:flex; justify-content:space-between; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155;">
                                            <span>Endre status</span><span style="color:#9ca3af;">\u25b8</span>
                                        </button>
                                        <div class="submenu" style="display:none; position:absolute; left:100%; top:-4px; background:white; border:1px solid #d1d5db; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.15); min-width:130px; padding:4px 0;">
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Startet'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155;">Startet</button>
                                            <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Bomtur'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155;">Bomtur</button>
                                        </div>
                                    </div>
                                    <div style="border-top:1px solid #e5e7eb; margin:4px 0;"></div>
                                    <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'ENDRE_STATUS', reqId:'${k.reqId}', nyStatus:'Finner ikke tlf'}); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; width:100%; text-align:left; background:none; border:none; padding:7px 12px; cursor:pointer; font-size:${infoSize}; color:#334155;">Finner ikke telefonnummer</button>
                                    ${k.manglerTelefon ? `
                                    <div style="border-top:1px solid #e5e7eb; margin:4px 0;"></div>
                                    <a href="https://www.1881.no/?query=${encodeURIComponent(k.navn + ' ' + (k.folkregPoststed || ''))}" target="_blank" onclick="event.stopPropagation(); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; padding:7px 12px; font-size:${infoSize}; color:#dc3545; text-decoration:none; cursor:pointer;">1881 \u2014 navn + adresse</a>
                                    <a href="https://www.1881.no/?query=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation(); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; padding:7px 12px; font-size:${infoSize}; color:#dc3545; text-decoration:none; cursor:pointer;">1881 \u2014 bare navn</a>
                                    <a href="https://www.google.com/search?q=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation(); this.closest('.pas-meny-dropdown').style.display='none';" style="display:block; padding:7px 12px; font-size:${infoSize}; color:#4285f4; text-decoration:none; cursor:pointer;">Google \u2014 s\u00f8k navn</a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            ${sutiHtml ? `<div style="text-align:center;">${sutiHtml}</div>` : ''}
                            <div style="text-align:center; background:#fff; padding:2px 6px; border-radius:4px;" title="${forsinkelseTip}">
                                <div style="font-size:${smallSize}; color:#64748b;">FORSINKET</div>
                                <div style="font-weight:bold; font-size:${infoSize}; color:${forsinkelseFarge};">${forsinkelseTekst}</div>
                            </div>
                            ${knappHtml}
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; font-size:${infoSize}; color:#374151; flex-wrap:wrap; align-items:center;">
                        ${(() => {
                            if (!k.telefon && (!k.alleNumreMedKilde || k.alleNumreMedKilde.length === 0)) {
                                return `<span style="display:flex; gap:6px; align-items:center;">` +
                                    `<span style="color:#dc3545;">\ud83d\udcf5 Mangler mob \u2014</span>` +
                                    `<a href="https://www.1881.no/?query=${encodeURIComponent(k.navn + ' ' + (k.folkregPoststed || ''))}" target="_blank" onclick="event.stopPropagation()" style="color:#dc3545; text-decoration:none;" title="1881 med navn og adresse"><u>1881</u></a>` +
                                    `<a href="https://www.1881.no/?query=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation()" style="color:#dc3545; text-decoration:none;" title="1881 med bare navn"><u>1881\u270b</u></a>` +
                                    `<a href="https://www.google.com/search?q=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation()" style="color:#4285f4; text-decoration:none;" title="Google med navn"><u>Google</u></a>` +
                                    `</span>`;
                            }
                            let html = '';
                            if (k.alleNumreMedKilde && k.alleNumreMedKilde.length > 0) {
                                html = k.alleNumreMedKilde.map(n => 
                                    `<span style="color:${n.erReservert ? '#dc2626' : '#374151'};">${n.erMobil ? '\ud83d\udcde' : '\ud83d\udce0'} ${n.nr} <span style="font-size:${badgeSize}; color:#9ca3af;">(${n.kilde})</span>${n.erReservert ? ' <span style="background:#fef2f2; color:#dc2626; padding:1px 4px; border-radius:3px; font-size:${badgeSize}; font-weight:600; border:1px solid #fca5a5;">\u26a0 IKKE SMS</span>' : ''}</span>`
                                ).join(' ');
                            } else {
                                html = `<span>\ud83d\udcde ${k.telefon}</span>`;
                            }
                            return html;
                        })()}
                        ${smsLoggBadges}
                        <a href="https://www.1881.no/?query=${encodeURIComponent(k.navn + ' ' + (k.folkregPoststed || ''))}" target="_blank" onclick="event.stopPropagation()" style="color:#6b7280; text-decoration:none; font-size:${badgeSize};" title="1881 med navn og adresse"><u>1881</u></a>
                        <a href="https://www.1881.no/?query=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation()" style="color:#6b7280; text-decoration:none; font-size:${badgeSize};" title="1881 med bare navn"><u>1881\u270b</u></a>
                        <a href="https://www.google.com/search?q=${encodeURIComponent(k.navn)}" target="_blank" onclick="event.stopPropagation()" style="color:#4285f4; text-decoration:none; font-size:${badgeSize};" title="Google med navn"><u>Google</u></a>
                        <button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'VIS_REQ', reqId:'${k.reqId}', nissyReqId:'${k.nissyReqId || ''}', nissyTripId:'${k.nissyTripId || ''}', erSok:${!!k.erSok}})"
                                style="background:#3b82f6; color:white; border:none; padding:2px 6px; border-radius:3px; font-size:${badgeSize}; cursor:pointer;">\ud83d\udccb</button>
                    </div>
                    ${behovHtml}
                    ${adresseHtml}
                    ${k.meldingTilTransportor ? `<div style="font-size:${badgeSize}; color:#1d4ed8; margin-top:4px;"><span style="font-weight:600;">Melding til transport\u00f8r:</span><br>${k.meldingTilTransportor}</div>` : ''}
                    ${k.meldingTilPRK ? `<div style="font-size:${badgeSize}; color:#7c3aed; margin-top:2px;"><span style="font-weight:600;">Melding til pasientreisekontoret:</span><br>${k.meldingTilPRK}</div>` : ''}
                    ${smsLoggFullHtml}
                </div>
            `;
        }
        
        // \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
        // \u2551  LAG RESSURS-KONTAINER (grupperer pasienter)                       \u2551
        // \u2551  storTekst = true \u2192 st\u00f8rre fonter for Skal ha SMS kolonnen        \u2551
        // \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
        function lagRessursKort(ressurs, storTekst = false) {
            const erSamkjoring = ressurs.pasienter.length > 1;
            
            // Fontst\u00f8rrelser basert p\u00e5 storTekst
            const navnSize = storTekst ? '15px' : '13px';
            const infoSize = storTekst ? '13px' : '12px';
            const badgeSize = storTekst ? '12px' : '10px';
            const headerSize = '14px';
            
            // Avvikslogg (felles for ressursen)
            let avviksLoggHtml = '';
            if (ressurs.avviksLogg && ressurs.avviksLogg.length > 0) {
                avviksLoggHtml = `
                    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #fde68a; background:#fffbeb; padding:8px; border-radius:6px;">
                        <div style="font-size:${badgeSize}; color:#92400e; margin-bottom:4px; font-weight:600;">\u26a0\ufe0f AVVIK (${ressurs.avviksLogg.length})</div>
                        ${[...ressurs.avviksLogg].reverse().map(a => `
                            <div style="background:#fef3c7; padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #f59e0b;">
                                <span style="color:#92400e;">${a}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // Header med samkj\u00f8ring-info og l\u00f8yve/turId
            const headerBg = ressurs.erSok ? '#ede9fe' : erSamkjoring ? '#e0e7ff' : '#f1f5f9';
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
                const turIdLink = `<a href="https://pastrans-sorost.mq.nhn.no/administrasjon/admin/searchStatus?id=${turIdVis}" target="_blank" onclick="event.stopPropagation()" style="color:#9ca3af; text-decoration:none; font-size:${headerSize}; font-weight:400;" onmouseover="this.style.color='#3b82f6';this.style.textDecoration='underline'" onmouseout="this.style.color='#9ca3af';this.style.textDecoration='none'">${turIdVis}</a>` +
                    `<span onclick="event.stopPropagation();navigator.clipboard.writeText('${turIdVis}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${headerSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${turIdVis}">\ud83d\udccb</span>`;
                if (ressurs.loyveTur && transportorKort) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:#374151;">\ud83d\ude97 ${transportorKort} - ${ressurs.loyveTur}</span> ${turIdLink}`;
                } else if (ressurs.loyveTur) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:#374151;">\ud83d\ude97 ${ressurs.loyveTur}</span> ${turIdLink}`;
                } else if (transportorKort) {
                    headerTittel = `<span style="font-weight:600; font-size:${headerSize}; color:#374151;">\ud83d\ude97 ${transportorKort}</span> ${turIdLink}`;
                } else {
                    headerTittel = `<span style="font-size:${headerSize}; color:#64748b;">TUR: ${turIdVis}</span>` +
                        `<span onclick="event.stopPropagation();navigator.clipboard.writeText('${turIdVis}');this.textContent='\u2705';setTimeout(function(){this.textContent='\ud83d\udccb'}.bind(this),1000);" style="cursor:pointer;margin-left:3px;font-size:${headerSize};opacity:0.5;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" title="Kopier ${turIdVis}">\ud83d\udccb</span>`;
                }
            }
            
            // Legg til S\u00d8K-badge i header for manuelt s\u00f8kte turer
            if (ressurs.erSok) {
                const sokLabel = ressurs.sokType === 'PNR' ? 'PNR' : ressurs.sokType === 'REK' ? 'REK' : 'TUR';
                headerTittel = `<span style="background:#8b5cf6; color:white; padding:2px 8px; border-radius:4px; font-size:${headerSize}; font-weight:700; margin-right:6px; cursor:default;" title="S\u00f8kt p\u00e5 ${sokLabel}: ${ressurs.sokVerdi}">\ud83d\udd0d MANUELT S\u00d8K <span onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'FJERN_SOK', resId:'${ressurs.resId}'})" style="cursor:pointer; margin-left:4px; opacity:0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">\u2715</span></span> ${headerTittel}`;
            }
            
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
                
                // Finn SMS som ikke matcher noen pasient
                const umatchetSms = foerstePasient.smsLoggRes.filter(s => {
                    const mottakerNorm = normaliserTlf(s.mottaker);
                    return !allePasientTlf.some(tlf => tlf === mottakerNorm);
                });
                
                if (umatchetSms.length > 0) {
                    umatchetSmsHtml = `
                        <div style="margin-top:10px; padding:8px; background:#fff7ed; border-radius:6px; border-top:1px solid #fdba74;">
                            <div style="font-size:${infoSize}; color:#c2410c; margin-bottom:4px; font-weight:600;">\ud83d\udce8 SMS SENDT (ukjent mottaker - ${umatchetSms.length})</div>
                            ${umatchetSms.map(s => {
                                const tidMatch = s.tidspunkt.match(/(\d{2}:\d{2})/);
                                const kl = tidMatch ? tidMatch[1] : s.tidspunkt;
                                return `
                                <div style="background:#ffedd5; padding:4px 6px; border-radius:4px; font-size:${infoSize}; margin-bottom:3px; border-left:2px solid #ea580c;">
                                    <div style="color:#c2410c; font-weight:600;">${kl} \u2192 ${s.mottaker}</div>
                                    <div style="color:#374151; margin-top:2px; line-height:1.2;">${s.melding}</div>
                                </div>
                            `}).join('')}
                        </div>
                    `;
                }
            }
            
            return `
                <div id="ressurs-${ressurs.resId}" class="ressurs-kort" style="margin-bottom:16px; background:white; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08); overflow:hidden; border:1px solid #e5e7eb;">
                    
                    <!-- Ressurs header - klikkbar for \u00e5 markere i NISSY -->
                    <div style="background:${headerBg}; padding:8px 12px; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px; cursor:pointer; flex-shrink:0;"
                             onclick="window._popupChannel.postMessage({type:'MARKER_RAD', resId:'${ressurs.resId}'})"
                             title="Klikk for \u00e5 markere i NISSY">
                            ${headerTittel}
                            ${samkjoringBadge}
                            ${rullestolBadges}
                        </div>
                        <div style="display:flex; align-items:center; gap:4px; background:#f3f4f6; padding:3px 6px; border-radius:4px; border:1px solid #d1d5db; flex:1; min-width:0;" onclick="event.stopPropagation()">
                            <input type="text" id="avviktid_${ressurs.resId}" value="${new Date().toTimeString().slice(0,5)}"
                                   style="font-size:${infoSize}; padding:2px 4px; border:1px solid #d1d5db; border-radius:3px; width:44px; text-align:center;"
                                   onclick="event.stopPropagation(); this.select()"
                                   onfocus="window._editing=true"
                                   onblur="setTimeout(function(){window._editing=false},500); var v=this.value.replace(/[^0-9]/g,''); if(v.length===3) v='0'+v; if(v.length===4){this.value=v.slice(0,2)+':'+v.slice(2);} var p=this.value.match(/^(\\d{2}):(\\d{2})$/); if(p){var n=new Date(),nm=n.getHours()*60+n.getMinutes(),im=parseInt(p[1])*60+parseInt(p[2]); if(im>nm){this.value=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');}}"
                                   maxlength="5">
                            <select id="avviktype_${ressurs.resId}" onclick="event.stopPropagation()" style="font-size:${infoSize}; padding:2px 4px; border:1px solid #d1d5db; border-radius:3px;"
                                    onfocus="window._editing=true"
                                    onblur="setTimeout(function(){window._editing=false},500)">
                                <option value="AVVIK">Avvik</option>
                                <option value="KMP">Kontakt med pasient</option>
                                <option value="KMB">Kontakt med behandler</option>
                                <option value="EPT">Etterlyst p\u00e5 Teams</option>
                                <option value="IFS">Informasjon fra sentral</option>
                            </select>
                            <input type="text" id="avviktekst_${ressurs.resId}" placeholder="Fritekst..."
                                   style="font-size:${infoSize}; padding:2px 6px; border:1px solid #d1d5db; border-radius:3px; flex:1; min-width:60px;"
                                   onclick="event.stopPropagation()"
                                   onfocus="window._editing=true"
                                   onblur="setTimeout(function(){window._editing=false},500)"
                                   onkeydown="if(event.key==='Enter'){event.stopPropagation(); this.nextElementSibling.click();}">
                            <button onclick="event.stopPropagation(); var tid=document.getElementById('avviktid_${ressurs.resId}').value; var type=document.getElementById('avviktype_${ressurs.resId}').value; var tekst=document.getElementById('avviktekst_${ressurs.resId}').value; var reqId='${ressurs.pasienter[0] ? ressurs.pasienter[0].reqId : ressurs.resId}'; window._popupChannel.postMessage({type:'SETT_AVVIK', reqId:reqId, resId:'${ressurs.resId}', avvikType:type, avvikTekst:tekst, avvikTid:tid})"
                                    style="background:#10b981; color:white; border:none; padding:3px 10px; border-radius:3px; font-size:${infoSize}; cursor:pointer; font-weight:600;">OK</button>
                        </div>
                        ${ressurs.erSok
                            ? `<button onclick="event.stopPropagation();" title="Finner ikke ressursplakat for s\u00f8keresultater" style="background:#6b7280; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:${badgeSize}; cursor:not-allowed; flex-shrink:0; opacity:0.7;">\ud83d\uded1 RES</button>`
                            : `<button onclick="event.stopPropagation(); window._popupChannel.postMessage({type:'VIS_RES', resId:'${ressurs.resId}', nissyTripId:'${ressurs.nissyTripId || ''}', erSok:false})" style="background:#8b5cf6; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:${badgeSize}; cursor:pointer; flex-shrink:0;">\ud83d\ude97 RES</button>`
                        }
                    </div>
                    
                    <!-- Pasienter -->
                    <div style="padding:10px;">
                        ${ressurs.avviksGrunnRessurs && ressurs.avviksGrunnRessurs.length > 0 ? `
                            <div style="background:#fee2e2; padding:4px 8px; border-radius:4px; margin-bottom:8px; border-left:3px solid #dc3545;">
                                ${ressurs.avviksGrunnRessurs.map(g => `<span style="color:#991b1b; font-size:${badgeSize}; font-weight:600;">${g}</span>`).join(' \u00b7 ')}
                            </div>
                        ` : ''}
                        ${ressurs.pasienter.map(p => lagPasientKort(p, true, storTekst)).join('')}
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

        // Bygg kolonner dynamisk \u2014 bare de med innhold rendres
        const kolonner = [];

        // ETTERLYSNING-kolonne (r\u00f8d)
        if (etterlyse.length > 0) {
            kolonner.push(`
                <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; padding:12px; display:flex; flex-direction:column; overflow:hidden; min-height:0;">
                    <h4 style="color:#dc2626; margin:0 0 10px; font-size:18px; flex-shrink:0;">\ud83d\udce2 Etterlysning (${tellEtterlyse})</h4>
                    <div style="overflow-y:auto; flex:1; min-height:0;">
                        ${etterlyse.map(r => lagRessursKort(r, true)).join('')}
                    </div>
                </div>
            `);
        }

        // SMS-kolonne (gul/amber)
        if (klarForSms.length > 0) {
            kolonner.push(`
                <div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; padding:12px; display:flex; flex-direction:column; overflow:hidden; min-height:0;">
                    <h4 style="color:#f59e0b; margin:0 0 10px; font-size:18px; flex-shrink:0;">\ud83d\udd14 SMS (${tellKlar})</h4>
                    <div style="overflow-y:auto; flex:1; min-height:0;">
                        ${klarForSms.map(r => lagRessursKort(r, true)).join('')}
                    </div>
                </div>
            `);
        }

        // AVVIK-kolonne (gr\u00e5)
        if (avvik.length > 0) {
            kolonner.push(`
                <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px; padding:12px; display:flex; flex-direction:column; overflow:hidden; min-height:0;">
                    <h4 style="color:#dc3545; margin:0 0 10px; font-size:18px; flex-shrink:0;">\ud83d\udd14 Avvik (${tellAvvik})</h4>
                    <div style="overflow-y:auto; flex:1; min-height:0;">
                        ${avvik.map(r => lagRessursKort(r, false)).join('')}
                    </div>
                </div>
            `);
        }

        // Grid: s\u00e5 mange 1fr som det er aktive kolonner
        const gridCols = kolonner.length > 0 ? kolonner.map(() => '1fr').join(' ') : '1fr';

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
                sokListeHtml += `<span style="display:inline-flex; align-items:center; gap:4px; background:#ede9fe; border:1px solid #c4b5fd; border-radius:4px; padding:3px 8px; font-size:12px; color:#5b21b6;">
                    <strong>${typeLabel}:</strong> ${sg.sokVerdi} ${antallTreff > 0 ? '<span style="color:#7c3aed;">(' + antallTreff + ')</span>' : '<span style="color:#9ca3af;">(0)</span>'}
                    <span onclick="window._popupChannel.postMessage({type:'FJERN_SOK', resId:'${sg.sokResId}'})" style="cursor:pointer; color:#7c3aed; font-weight:bold; margin-left:2px; opacity:0.7;" onmouseover="this.style.opacity='1';this.style.color='#ef4444'" onmouseout="this.style.opacity='0.7';this.style.color='#7c3aed'">\u2715</span>
                </span>`;
            });
            sokListeHtml += '</div>';
        }

        const sokSeksjon = harSokData ? `
            <div style="background:#faf5ff; border:1px solid #c4b5fd; border-radius:8px; padding:12px; margin-bottom:16px;">
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
            ${kolonner.length > 0 ? `
                <div style="display:grid; grid-template-columns:${gridCols}; gap:16px; flex:1; overflow:hidden; min-height:0;">
                    ${kolonner.join('')}
                </div>
            ` : '<div style="color:#64748b; text-align:center; padding:40px;">Ingen forsinkede reiser</div>'}
            ${iCooldown.length > 0 ? `<div style="text-align:center;padding:6px;color:#6b7280;font-size:12px;flex-shrink:0;">\u2709 ${iCooldown.length} pasient${iCooldown.length > 1 ? 'er' : ''} har f\u00e5tt SMS \u2014 venter p\u00e5 neste runde</div>` : ''}
        `;
    }

    // === Ventende-visning (passert visningstidspunkt, venter p\u00e5 SMS-terskel) ===
    // Gjenbruker lagRessursKort() og lagPasientKort() fra hovedvisningen
    function oppdaterVentende() {
        const win = window.smsWin;
        if (!win || win.closed) return;
        const ventDiv = win.document.getElementById('ventende-panel');
        if (!ventDiv) return;
        
        const reiserFraTabell = window.smsReiserFraTabell || [];
        const kandidater = window.smsKandidater || [];
        
        // Finn ventende: reiser som ikke er klare for SMS enn\u00e5 (men har full info)
        const ventendeKandidater = kandidater.filter(k => {
            if (k.alleredeSendt) return false; // Allerede sendt SMS - skjul helt
            if (k.kanSendeSms) return false;
            if (k.manglerTelefon) return false;
            if (k.minTilSms <= 0) return false;
            return true;
        });
        
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
                <h3 style="margin:0 0 10px 0; color:#7c3aed;">\u23f3 Venter p\u00e5 SMS-terskel</h3>
                <div style="color:#64748b; text-align:center; padding:10px;">Ingen ventende reiser</div>
            `;
            return;
        }
        
        // Gjenbruk lagRessursKort fra oppdaterVisning (lagret som window-funksjon)
        let html = `<h3 style="margin:0 0 10px 0; color:#7c3aed;">\u23f3 Venter p\u00e5 SMS-terskel (${ventende.length} ressurser, ${ventendeKandidater.length} pasienter)</h3>`;
        
        html += ventende.map(r => window._lagRessursKort(r, false)).join('');
        
        ventDiv.innerHTML = html;
    }

    // === Highlight ressurs-kort i popup ===
    function highlightRessursKort(resId) {
        const win = window.smsWin;
        if (!win || win.closed) return;
        
        const kort = win.document.getElementById(`ressurs-${resId}`);
        const erAlleredeMarkert = kort && kort.style.border === '1px solid rgb(139, 92, 246)';
        
        // Fjern highlight fra alle kort
        win.document.querySelectorAll('.ressurs-kort').forEach(k => {
            k.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)';
            k.style.border = '1px solid #e5e7eb';
        });
        
        // Toggle: hvis allerede markert, bare fjern. Ellers highlight.
        if (!erAlleredeMarkert && kort) {
            kort.style.boxShadow = '0 0 0 3px #8b5cf6, 0 2px 8px rgba(0,0,0,0.12)';
            kort.style.border = '1px solid #8b5cf6';
            kort.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Lytt p\u00e5 klikk i NISSY-tabellen og highlight tilsvarende kort i popup
    document.addEventListener('click', e => {
        const rad = e.target.closest('tr[id^="P-"]');
        if (rad) {
            const resId = rad.id.replace('P-', '');
            highlightRessursKort(resId);
            // Fjern skriptets outline-highlight (NISSY h\u00e5ndterer sin egen)
            document.querySelectorAll('tr[id^="P-"]').forEach(tr => {
                tr.style.outline = '';
            });
        } else {
            // Klikk utenfor rad - fjern all highlight
            fjernHighlight();
            document.querySelectorAll('tr[id^="P-"]').forEach(tr => {
                tr.style.outline = '';
            });
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
            
            const rundeBg = smsRunde >= 2 ? '#fef3c7' : '#dbeafe';
            const rundeFarge = smsRunde >= 2 ? '#92400e' : '#1d4ed8';
            
            // Bygg telefon-valg: checkboxer for alle numre + tomt felt for manuelt
            const numre = alleTelefoner && alleTelefoner.length > 0 ? alleTelefoner : (telefon ? [telefon.replace(/[\s+\-]/g, '').slice(-8)] : []);
            const telefonHtml = `
                <div id="sms-telefoner" style="display:flex; flex-direction:column; gap:6px;">
                    ${numre.map((nr, i) => `
                        <label style="display:flex; align-items:center; gap:8px; background:#f1f5f9; padding:8px 10px; border-radius:6px; cursor:pointer; border:2px solid #e2e8f0;">
                            <input type="checkbox" name="sms-nr" value="${nr}" ${i === 0 ? 'checked' : ''} style="width:18px; height:18px; accent-color:#8b5cf6; cursor:pointer;">
                            <span style="font-size:16px; font-weight:600; color:#1e293b;">+47 ${nr}</span>
                        </label>
                    `).join('')}
                    <div style="display:flex; align-items:center; gap:8px; background:#f8fafc; padding:8px 10px; border-radius:6px; border:2px dashed #cbd5e1;">
                        <input type="checkbox" name="sms-nr" value="" id="sms-manuelt-cb" style="width:18px; height:18px; accent-color:#8b5cf6; cursor:pointer;">
                        <input type="text" id="sms-manuelt-nr" placeholder="Annet nummer..." style="flex:1; border:none; background:transparent; font-size:14px; color:#1e293b; outline:none; padding:2px 0;"
                               onfocus="document.getElementById('sms-manuelt-cb').checked=true"
                               oninput="var v=this.value.replace(/[^0-9]/g,''); if(v.length>8) v=v.slice(-8); this.value=v; document.getElementById('sms-manuelt-cb').value=v;">
                    </div>
                </div>`;
            
            const modal = win.document.createElement('div');
            modal.id = 'sms-modal';
            modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:9999;';
            modal.innerHTML = `
                <div style="background:white; border-radius:12px; padding:24px; max-width:460px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div style="font-size:16px; font-weight:700; color:#1e293b;">\ud83d\udcac SMS Preview</div>
                        <span style="display:inline-block; background:${rundeBg}; color:${rundeFarge}; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600;">Runde ${smsRunde}</span>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Pasient</div>
                        <div style="background:#f1f5f9; padding:10px; border-radius:6px; font-size:13px; color:#334155;">${navn}</div>
                    </div>
                    <div style="margin-bottom:12px;">
                        <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Telefon \u2014 velg mottaker(e)</div>
                        ${telefonHtml}
                    </div>
                    <div style="margin-bottom:16px;">
                        <div style="font-size:11px; color:#64748b; font-weight:600; text-transform:uppercase; margin-bottom:4px;">Melding</div>
                        <div style="background:#f1f5f9; padding:10px; border-radius:6px; font-size:13px; line-height:1.5; color:#334155;">${melding}</div>
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="sms-avbryt" style="border:none; padding:10px 20px; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; background:#e2e8f0; color:#475569;">Avbryt</button>
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
        
        if (e.data.type === 'SMS_REFRESH') {
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
                
                // full=true gir alt vi trenger \u2014 telefon, PNR, retning, adresser (Hentested/Leveringssted)
                
                // === PARSING ===
                
                // Navn
                const navnMatch = adminHtml.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const pasientNavn = navnMatch ? navnMatch[1].trim().replace(/\s+/g, ' ') : '(ukjent)';
                
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
                
                // Folkeregistrert adresse (pasient-seksjonen, f\u00f8r Hentested)
                let folkregAdresse = '';
                const hentestedIdxSok = adminHtml.indexOf('Hentested');
                if (hentestedIdxSok > -1) {
                    const pasSeksjon = adminHtml.substring(0, hentestedIdxSok);
                    const folkAddrM = pasSeksjon.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                    const folkPostM = pasSeksjon.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
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
                    let deler = []; if (hnavn) deler.push(hnavn); if (hadr) deler.push(hadr); if (hpost) deler.push(hpost); if (htlf) deler.push(`\ud83d\udcde ${htlf}`); if (hkom) deler.push(`(${hkom})`);
                    henteAdresseFull = deler.join('\n');
                }
                
                let leveringsAdresse = '';
                let leveringsAdresseFull = '';
                const leveringsstedet = adminHtml.match(/Leveringssted<\/legend>[\s\S]*?Navn:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Adresse:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Postnr \/ Sted:<\/td>\s*<td>([^<]+)<\/td>[\s\S]*?Telefon:<\/td>\s*<td>([^<]*)<\/td>[\s\S]*?Kommentar:<\/td>\s*<td>([^<]*)<\/td>/i);
                if (leveringsstedet) {
                    const lnavn = leveringsstedet[1].trim(), ladr = leveringsstedet[2].trim(), lpost = leveringsstedet[3].trim(), ltlf = leveringsstedet[4].trim(), lkom = leveringsstedet[5].trim();
                    leveringsAdresse = `${ladr}, ${lpost}`;
                    let deler = []; if (lnavn) deler.push(lnavn); if (ladr) deler.push(ladr); if (lpost) deler.push(lpost); if (ltlf) deler.push(`\ud83d\udcde ${ltlf}`); if (lkom) deler.push(`(${lkom})`);
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
                const transportor = transpMatch ? transpMatch[1].trim() : '';

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
                    const rekvArea = adminHtml.substring(rekvLoggIdx, rekvLoggIdx + 5000);
                    const newReqMatch = rekvArea.match(/NewRequisition<\/td>\s*<td[^>]*>\s*(\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2}):\d{2})/);
                    if (newReqMatch) {
                        sutiStatus.bestiltTid = newReqMatch[2];
                        sutiStatus.bestiltDato = newReqMatch[1];
                        const bp = newReqMatch[1].match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})/);
                        if (bp) sutiStatus.bestiltMs = new Date(parseInt(bp[3]), parseInt(bp[2])-1, parseInt(bp[1]), parseInt(bp[4]), parseInt(bp[5])).getTime();
                    }
                }
                const sutiIdx = adminHtml.indexOf('Suti kode');
                const sutiArea = sutiIdx > -1 ? adminHtml.substring(sutiIdx) : '';

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
                            sutiStatus.sendtTid = klokkeslett; sutiStatus.sendtMs = tidMs;
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
                        if (/>\s*1750\b/.test(rad)) { sutiStatus.avvist = true; }
                    }

                    // Bomtur = alle tildelte biler har bomtur (identisk med auto)
                    if (bomturTurNr.size > 0) {
                        const harAktivBil = [...tildelteTurNr].some(t => !bomturTurNr.has(t));
                        sutiStatus.bomtur = !harAktivBil;
                    }

                    if (/>\s*IA\s*</.test(sutiArea)) sutiStatus.erIA = true;
                }

                // Hent geoposisjon fra SUTI XML (identisk med auto)
                const hentGeoSok = async (xmlId) => {
                    try {
                        const xmlRes = await fetch(`/administrasjon/admin/sutiXml?id=${xmlId}`);
                        const xmlHtml = await xmlRes.text();
                        const latMatch = xmlHtml.match(/lat="([\d.]+)"/);
                        const longMatch = xmlHtml.match(/long="([\d.]+)"/);
                        if (latMatch && longMatch) return { lat: latMatch[1], long: longMatch[1] };
                    } catch (e) {}
                    return null;
                };

                if (paaVeiXmlId) {
                    sutiStatus.bilPaaVeiGeo = await hentGeoSok(paaVeiXmlId);
                }
                if (fremmeXmlId) {
                    sutiStatus.bilFremmeGeo = await hentGeoSok(fremmeXmlId);
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

                // Parse avvikslogg og KMP/KMB/EPT/IFS (identisk med auto)
                let avviksLogg = [];
                let sisteKontaktFraAvvik = null;
                let sisteEPT = null;
                let sisteIFS = null;
                const avvikRegexSok = /<td[^>]*align="right"[^>]*>Avvik:<\/td>\s*<td[^>]*>([^<]*)<\/td>/gi;
                let avvikMatchSok;
                while ((avvikMatchSok = avvikRegexSok.exec(adminHtml)) !== null) {
                    const txt = avvikMatchSok[1].trim()
                        .replace(/&nbsp;/g, '')
                        .replace(/&aring;/g, '\u00e5').replace(/&aelig;/g, '\u00e6').replace(/&oslash;/g, '\u00f8')
                        .replace(/&Aring;/g, '\u00c5').replace(/&AElig;/g, '\u00c6').replace(/&Oslash;/g, '\u00d8');
                    if (txt.length > 0) {
                        avviksLogg.push(txt);
                        // Parse KMP/KMB/EPT/IFS-tidspunkt (identisk med auto)
                        const kontaktMatch = txt.match(/^(\d{2}:\d{2})\s*-\s*(KMP|KMB|EPT|IFS|IST)\b/i);
                        if (kontaktMatch) {
                            const kontaktType = kontaktMatch[2].toUpperCase();
                            if (kontaktType !== 'EPT' && kontaktType !== 'IFS' && kontaktType !== 'IST') {
                                sisteKontaktFraAvvik = { tid: kontaktMatch[1], type: kontaktType };
                            }
                            if (kontaktType === 'EPT') {
                                sisteEPT = { tid: kontaktMatch[1], tekst: txt.substring(kontaktMatch[0].length).trim() };
                            }
                            if (kontaktType === 'IFS') {
                                sisteIFS = { tid: kontaktMatch[1], tekst: txt.substring(kontaktMatch[0].length).trim() };
                            }
                        }
                    }
                }

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

                const alleredeSendt = sendtFraDb || smsLoggRes.length > 0;

                // Kontakt-info fra avvikslogg (identisk med auto)
                const sokKontaktData = window._kontaktData || new Map();
                const kontaktInfo = sokKontaktData.get(`SOK_${sokTripId}`);
                let sistKontaktTid = null;
                let sistKontaktMinSiden = null;
                let sistKontaktType = null;

                if (sisteKontaktFraAvvik) {
                    sistKontaktTid = sisteKontaktFraAvvik.tid;
                    sistKontaktType = sisteKontaktFraAvvik.type;
                    const [kontaktTime, kontaktMin] = sistKontaktTid.split(':').map(Number);
                    const kontaktDato = new Date(nowSok.getFullYear(), nowSok.getMonth(), nowSok.getDate(), kontaktTime, kontaktMin);
                    sistKontaktMinSiden = Math.floor((nowSok - kontaktDato) / 60000);
                } else if (kontaktInfo && kontaktInfo.tidspunkt) {
                    sistKontaktTid = kontaktInfo.tidspunkt;
                    const [kontaktTime, kontaktMin] = sistKontaktTid.split(':').map(Number);
                    const kontaktDato = new Date(nowSok.getFullYear(), nowSok.getMonth(), nowSok.getDate(), kontaktTime, kontaktMin);
                    sistKontaktMinSiden = Math.floor((nowSok - kontaktDato) / 60000);
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

                if (smsLoggRes.length === 0 && !sendtFraDb && !kontaktInfo) {
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
                if (!telefon) avviksGrunner.push('\ud83d\udcf5 Mangler mobilnr');

                // Etterlysning-beregning (v6, identisk med auto)
                const effektivForsinkelsSok = fraTidMs ? Math.floor((nowMsSok - fraTidMs) / 60000) : smsForsinkelse;
                let etterlysTerskel = erTur
                    ? (erSpot ? CONFIG.ETTERLYSE_TUR_SPOT_MIN : CONFIG.ETTERLYSE_TUR_MIN)
                    : CONFIG.ETTERLYSE_RETUR_MIN;
                const etterlyseForsinkelse = effektivForsinkelsSok;
                const harEPT = !!sisteEPT;
                const harIFS = !!sisteIFS;
                let sistEPTMinSiden = null;
                let sistIFSMinSiden = null;
                if (sisteEPT) {
                    const [eptH, eptM] = sisteEPT.tid.split(':').map(Number);
                    const eptDato = new Date(nowSok.getFullYear(), nowSok.getMonth(), nowSok.getDate(), eptH, eptM);
                    sistEPTMinSiden = Math.floor((nowSok - eptDato) / 60000);
                }
                if (sisteIFS) {
                    const [ifsH, ifsM] = sisteIFS.tid.split(':').map(Number);
                    const ifsDato = new Date(nowSok.getFullYear(), nowSok.getMonth(), nowSok.getDate(), ifsH, ifsM);
                    sistIFSMinSiden = Math.floor((nowSok - ifsDato) / 60000);
                }
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
                } else if (etterlyseForsinkelse >= etterlysTerskel) {
                    etterlysStatus = 'etterlyse'; minTilNesteEtterlysning = 0;
                } else {
                    etterlysStatus = 'venter'; minTilNesteEtterlysning = etterlysTerskel - etterlyseForsinkelse;
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
                    
                    window.smsKandidater.unshift(sokKandidat);
                    // Lagre i DB for \u00e5 overleve F5
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
                    // Nullstill input-felt og editing-flag i popup
                    const win = window.smsWin;
                    if (win && !win.closed) {
                        // Pr\u00f8v resId f\u00f8rst (avvikverkt\u00f8y i ressurs-header), deretter reqId (fallback)
                        const inputId = resId || reqId;
                        const input = win.document.getElementById(`avviktekst_${inputId}`);
                        if (input) input.value = '';
                        const dropdown = win.document.getElementById(`avviktype_${inputId}`);
                        if (dropdown) dropdown.value = 'AVVIK';
                        const tidInput = win.document.getElementById(`avviktid_${inputId}`);
                        if (tidInput) tidInput.value = new Date().toTimeString().slice(0, 5);
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
    document.addEventListener('click', (e) => {
        // Finn n\u00e6rmeste tr med id som starter med "P-"
        const rad = e.target.closest('tr[id^="P-"]');
        if (rad) {
            const resId = rad.id.replace('P-', '');
            // Send melding til popup-vinduet
            if (window.smsWin && !window.smsWin.closed) {
                window.smsWin.postMessage({ type: 'MARKER_I_POPUP', resId: resId }, '*');
                addDebugLog(`\ud83d\uddb1\ufe0f Klikket p\u00e5 rad ${resId} i NISSY`);
            }
        }
    });

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
