// === SAMKJØRINGS-KJERNE v0.7 ===
// v0.7: analyserSamkjoring(turer, opts) — opts.distFn([latA,lonA],[latB,lonB])→{meter,sek} lar host
//       injisere PRESIS distanse/tid (Google DistanceMatrix). Overstyrer ruter.php-meter/sek for
//       segmenter + per-pasient direkte (avgjørende for «nekt pasient lengre adresse»). Geometri =
//       ruter.php (visuell). Bakoverkompatibelt (uten distFn → som før).
// === SAMKJØRINGS-KJERNE v0.6 ===
// v0.6: N=1 støttet — analyserSamkjoring takler én tur (bare ruta hent→lever, rutet, 0 omvei/gevinst).
//       Lar «Vis kart+» tegne en enkelt markert tur. kapasitet for N=1 = {ok:true, enkelt:true}.
// === SAMKJØRINGS-KJERNE v0.5 ===
// v0.5: omkjoringPerPasient[] (direkte baseline vs reise i samkjøringen, per pasient) + gevinst (N
//       enkeltturer vs samkjørt, km/min spart). omkjoringSiste deriveres nå fra per-pasient (siste
//       leverte) — bakoverkompatibelt (prod 1.75 leser kun omkjoringSiste). Avslører den dårlige passasjeren.
// === SAMKJØRINGS-KJERNE v0.4 ===
// v0.4: N-PASIENT-STØTTE — analyserSamkjoring takler nå 2+ turer. Rekkefølge = DARP (én bil) med
//       presedens (hent_i før lever_i): branch-and-bound brute-force ≤ 4 pasienter, nearest-neighbor
//       ≥ 5. For felles-henting gir det samme som «hent alle → lever alle». Kapasitet/omkjøring/rute
//       var allerede generelle. omvei generalisert (kombinert − lengste enkelt-tur over alle N).
// === SAMKJØRINGS-KJERNE v0.3 ===
// v0.3: tur-kontrakten utvidet med valgfri fraLL/tilLL ([lat,lon]) — verten kan sende ferdig-
//       geokodede koordinater (Google treffer institusjonsnavn bedre enn Geonorge; «Ahus-Lørenskog/
//       Ortopedisk sengepost» havnet sør for Ahus med geokod.php). Kjernen geokoder kun der LL mangler.
// === SAMKJØRINGS-KJERNE v0.2 ===
// v0.2: stopp-sammenslåing også på ADRESSENØKKEL (institusjon før «/»/komma + postnr) i tillegg til
//       <300 m koordinat-nærhet — geokoderen spriker på sykehus-avdelinger (Ahus B102 vs B403 ble
//       to hentestopp). + ASCII-konsollnavn (iso-8859-1-vertssider mojibaket Ø).
// Felles motor for ALL samkjørings-analyse. Konsumenter (omraade_assistent, basic_tools,
// samkjorer.js, og hva som måtte komme) gir en liste NORMALISERTE turer; kjernen returnerer
// rene DATA (kapasitet, kjørerekkefølge, omkjøring for siste pasient, rute-segmenter).
// Hver vert tegner sitt eget kart fra dataene — kjernen rører ikke DOM/kart.
//
// Normalisert tur: { id?, pnavn, fra, til, hentetid?, behov:[...]|"streng", harLedsager?, fraLL?, tilLL? }
//   fra/til = adresse «…, 1481 Hagan» ELLER koordinat «lat,lon» (ruter.php tar begge).
//   fraLL/tilLL = valgfri [lat,lon] fra vertens egen geokoder (overstyrer kjernens geokoding).
//
// Logikk hentet 1:1: KAPASITET fra samkjorer.js; GEO/OMVEI/OMKJØRING fra omraade_assistent.js.
// Ett sted å vedlikeholde — slutt på 3 (snart flere) parallelle motorer.
(function () {
    'use strict';
    if (window.__samkjoringKjerne) return;
    const VERSJON = '0.7';

    // ── Konstanter ───────────────────────────────────────────────────────────
    const SERVER = 'https://thomaswestby.no/skript';
    const VEIFAKTOR = 1.3;     // luftlinje × dette ≈ kjøreavstand (samkjorer.js-stil)
    const OMVEI_KMH = 50;      // antatt snittfart for omvei-km → minutter
    const _LS_DAG = 864e5;

    // Behovsregler — 1:1 fra samkjorer.js
    const ALLTID_ALENE = ['RB', 'ERS', 'A', 'AL', 'TH', 'IA', 'C19', 'TMS', 'TK'];
    const IGNORER = ['LIFO', 'VA', '4X4', 'HJE', 'MH', 'TB', 'ØH', 'B'];
    const KONFLIKTER = [['HI', 'LI']];
    const MAKS = { forsete: 1.0, baksete: 2.0, bagasje: 2.0, bagasjeSV: 3.0, passasjerer: 3 };
    const LAAST = {
        SF:  { forsete: 1.0, baksete: 0,   bagasje: 0 },
        LF:  { forsete: 1.0, baksete: 0.5, bagasje: 0 },
        LB:  { forsete: 0,   baksete: 1.5, bagasje: 0 },
        BS:  { forsete: 0,   baksete: 1.0, bagasje: 0, ledsagerInkl: true },
        BSP: { forsete: 0,   baksete: 1.0, bagasje: 0, ledsagerInkl: true },
    };
    const BAGASJE = { RU: 1.0, RS: 1.5 };
    const ALLE_BEHOV = [].concat(ALLTID_ALENE, IGNORER, ['HI', 'LI', 'SF', 'LF', 'LB', 'BS', 'BSP', 'RU', 'RS', 'SV']);

    // ── Rene helpers ─────────────────────────────────────────────────────────
    function parseTid(s) { if (!s) return null; const m = String(s).trim().match(/(\d{1,2})[:.](\d{2})\s*$/); return m ? (+m[1]) * 60 + (+m[2]) : null; }
    function parseBehov(tekst) { if (!tekst) return []; return String(tekst).toUpperCase().split(/[\s,/+]+/).filter(b => b.length > 0 && ALLE_BEHOV.includes(b)); }
    function hentPostnr(t) { if (!t) return null; const m = String(t).match(/\b(\d{4})\b/); return m ? m[1] : null; }
    function postnrSted(adr) { const m = String(adr || '').match(/\b\d{4}\s+.+?$/); return m ? m[0].trim() : String(adr || '').trim(); }
    function haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371, rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    const gyldigKoord = a => Array.isArray(a) && typeof a[0] === 'number' && typeof a[1] === 'number' && isFinite(a[0]) && isFinite(a[1]);
    function normBehov(t) { return Array.isArray(t.behov) ? t.behov : parseBehov(t.behov || ''); }
    // Adressenøkkel for stopp-sammenslåing: institusjonsdelen (før første «/» eller komma) + postnr.
    // «Ahus-Lørenskog/Gastro…, 1474 Lørenskog» og «Ahus-Lørenskog/Kardiologisk…, 1474 Lørenskog»
    // → begge «ahus-lørenskog|1474» = SAMME hentested, selv om geokoderen spriker på avdelingene.
    function adresseNokkel(adr) {
        const s = String(adr || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (!s) return null;
        const pn = hentPostnr(s);
        if (!pn) return null;
        const hode = s.split('/')[0].split(',')[0].trim();
        return hode ? hode + '|' + pn : null;
    }

    // ── Kapasitet — 1:1 fra samkjorer.js (sete-/bagasje-/ledsager-modellen) ───
    function kapasitetsSjekk(passasjerer) {
        if (passasjerer.length < 2) return { ok: false, grunn: 'Trenger minst 2 passasjerer' };
        if (passasjerer.length > MAKS.passasjerer) return { ok: false, grunn: 'Maks ' + MAKS.passasjerer + ' passasjerer' };
        for (let i = 0; i < passasjerer.length; i++) {
            const behov = passasjerer[i].behov || [];
            for (let j = 0; j < behov.length; j++) {
                if (ALLTID_ALENE.includes(behov[j])) return { ok: false, grunn: behov[j] + ' krever alenetransport' };
            }
        }
        let alleBehov = [];
        passasjerer.forEach(p => { alleBehov = alleBehov.concat(p.behov || []); });
        for (let k = 0; k < KONFLIKTER.length; k++) {
            if (alleBehov.includes(KONFLIKTER[k][0]) && alleBehov.includes(KONFLIKTER[k][1])) {
                return { ok: false, grunn: KONFLIKTER[k][0] + ' og ' + KONFLIKTER[k][1] + ' kan ikke kombineres' };
            }
        }
        const filtrert = passasjerer.map(p => ({
            behov: (Array.isArray(p.behov) ? p.behov : []).filter(b => !IGNORER.includes(b)),
            harLedsager: p.harLedsager
        }));
        let forsete = 0, baksete = 0, bagasje = 0;
        const fleksible = [];
        for (let fi = 0; fi < filtrert.length; fi++) {
            const pass = filtrert[fi];
            let erLaast = false, laastType = null;
            for (let bi = 0; bi < pass.behov.length; bi++) {
                if (LAAST[pass.behov[bi]]) {
                    laastType = pass.behov[bi];
                    forsete += LAAST[laastType].forsete; baksete += LAAST[laastType].baksete; bagasje += LAAST[laastType].bagasje;
                    erLaast = true; break;
                }
            }
            if (erLaast && (laastType === 'BS' || laastType === 'BSP')) baksete += 1.0;
            else if (erLaast && pass.harLedsager) fleksible.push({ erLedsager: true });
            for (let bj = 0; bj < pass.behov.length; bj++) if (BAGASJE[pass.behov[bj]]) bagasje += BAGASJE[pass.behov[bj]];
            if (!erLaast) { fleksible.push({ erLedsager: false }); if (pass.harLedsager) fleksible.push({ erLedsager: true }); }
        }
        for (let fj = 0; fj < fleksible.length; fj++) {
            if (baksete + 1.0 <= MAKS.baksete) baksete += 1.0;
            else if (forsete + 1.0 <= MAKS.forsete) forsete += 1.0;
            else return { ok: false, grunn: 'Ikke nok seter (forsete: ' + forsete + ', baksete: ' + baksete + ')' };
        }
        if (forsete > MAKS.forsete) return { ok: false, grunn: 'Forsete overfylt: ' + forsete + '/' + MAKS.forsete };
        if (baksete > MAKS.baksete) return { ok: false, grunn: 'Baksete overfylt: ' + baksete + '/' + MAKS.baksete };
        let svVarsel = false;
        if (bagasje > MAKS.bagasjeSV) return { ok: false, grunn: 'Bagasje for høy: ' + bagasje + ' (maks ' + MAKS.bagasjeSV + ' med SV)' };
        if (bagasje > MAKS.bagasje) svVarsel = true;
        return { ok: true, svVarsel, forsete, baksete, bagasje };
    }

    // ── Cache + fetch (med timeout/kø) — 1:1 fra omraade_assistent.js ─────────
    function lsLes(fullKey, ttl) {
        try {
            const r = localStorage.getItem(fullKey);
            if (!r) return undefined;
            const o = JSON.parse(r);
            if (o && typeof o === 'object' && 't' in o) {
                if (Date.now() - o.t < ttl) return o.v;
                localStorage.removeItem(fullKey);
            } else { localStorage.removeItem(fullKey); }
        } catch (e) {}
        return undefined;
    }
    function lsSkriv(fullKey, v) { try { localStorage.setItem(fullKey, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }
    function fetchTO(url, opts, ms) {
        let ctrl, t;
        try { ctrl = new AbortController(); t = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, ms || 9000); } catch (e) {}
        const o = Object.assign({}, opts || {}); if (ctrl) o.signal = ctrl.signal;
        return fetch(url, o).then(r => { if (t) clearTimeout(t); return r; }, e => { if (t) clearTimeout(t); throw e; });
    }
    async function mapLimit(arr, limit, fn) {
        const res = new Array(arr.length); let i = 0;
        const arbeider = async () => { while (i < arr.length) { const idx = i++; try { res[idx] = await fn(arr[idx], idx); } catch (e) { res[idx] = null; } } };
        const n = Math.min(limit, arr.length), jobber = [];
        for (let w = 0; w < n; w++) jobber.push(arbeider());
        await Promise.all(jobber);
        return res;
    }

    // ── Geo: koordinat (geokod.php) + rute (ruter.php), localStorage-cachet ───
    const _koordCache = {}, _ruteCache = {};
    async function hentKoord(adr) {
        if (!adr) return null;
        if (_koordCache[adr] !== undefined) return _koordCache[adr];
        const ls = lsLes('omr_kd_' + adr, 30 * _LS_DAG);
        if (gyldigKoord(ls)) { _koordCache[adr] = ls; return ls; }
        try {
            const r = await fetchTO(SERVER + '/geokod.php?adr=' + encodeURIComponent(adr), {}, 9000);
            const j = await r.json();
            _koordCache[adr] = (j.ok && isFinite(j.lat) && isFinite(j.lon)) ? [j.lat, j.lon] : null;
            if (_koordCache[adr]) lsSkriv('omr_kd_' + adr, _koordCache[adr]);
        } catch (e) { _koordCache[adr] = null; }
        return _koordCache[adr];
    }
    async function hentRute(fra, til) {
        const key = fra + '|' + til;
        if (_ruteCache[key]) return _ruteCache[key];
        const ls = lsLes('omr_ru_' + key, 7 * _LS_DAG);
        if (ls && ls.geometri && ls.geometri.length) { _ruteCache[key] = ls; return ls; }
        try {
            const r = await fetchTO(SERVER + '/ruter.php?fra=' + encodeURIComponent(fra) + '&til=' + encodeURIComponent(til), {}, 12000);
            const j = await r.json();
            if (j && j.ok && j.geometri && j.geometri.length) { _ruteCache[key] = j; lsSkriv('omr_ru_' + key, j); return j; }
            return j || null;
        } catch (e) { return { ok: false, feil: 'fetch: ' + (e && e.message || e) }; }
    }

    // ── ANALYSE: gitt turer → rene data (rekkefølge, omkjøring, ruter, kapasitet) ──
    // v1 dekker 2 turer (2 pasienter = 4 punkt, som i skjermbildene). N-pasienter er en
    // naturlig utvidelse (TSP over flere stopp) — kontrakten endres ikke.
    async function analyserSamkjoring(turer, opts) {
        // N=1 er gyldig: da er det «samkjøring» av én tur = bare ruta hent→lever (rutet, ingen omvei).
        // Resten av funksjonen er N-generisk og gir 0 omvei/gevinst for én tur.
        if (!Array.isArray(turer) || turer.length < 1) return { feil: 'Trenger minst 1 tur' };
        // Host kan injisere en PRESIS distanse/tid-funksjon (f.eks. Google DistanceMatrix):
        //   distFn([latA,lonA],[latB,lonB]) → Promise<{meter, sek}|null>
        // Da overstyres meter/sek (avgjørende for «nekt hvis lenger»); geometrien (grønn linje)
        // beholdes fra ruter.php (kun visuell). Mangler distFn → ruter.php-tall som før.
        opts = opts || {};
        const distFn = typeof opts.distFn === 'function' ? opts.distFn : null;
        const hav = (x, y) => haversineKm(x[0], x[1], y[0], y[1]);
        // Verten kan sende ferdig-geokodede koordinater (tur.fraLL/tilLL = [lat,lon]) — f.eks.
        // Google-geokoder som treffer institusjonsnavn bedre enn Geonorge. Kjernen geokoder selv
        // (geokod.php) kun der koordinat mangler.
        // 2N punkt: hentested + leveringssted per tur. Indeks: hent_i = 2i, lever_i = 2i+1.
        const pts = [];
        for (let i = 0; i < turer.length; i++) {
            const t = turer[i];
            const navn = t.pnavn || ('Pasient ' + (i + 1));
            pts.push({ adr: t.fra, ll: gyldigKoord(t.fraLL) ? t.fraLL : null, navn, rolle: 'hentes', tur: i });
            pts.push({ adr: t.til, ll: gyldigKoord(t.tilLL) ? t.tilLL : null, navn, rolle: 'hjem',   tur: i });
        }
        for (let i = 0; i < pts.length; i++) if (!pts[i].ll) pts[i].ll = await hentKoord(pts[i].adr);

        // Beste besøksrekkefølge (min total luftlinje) med presedens: lever_i krever hent_i besøkt.
        // (DARP, én bil.) For felles-henting gir dette samme som «hent alle → lever alle».
        const N2 = pts.length;
        const alleGyldig = pts.every(p => gyldigKoord(p.ll));
        const tilgj = (brukt, i) => pts[i].rolle === 'hentes' ? true : brukt[i - 1];
        let beste = null;
        if (alleGyldig && N2 <= 8) {
            // Branch-and-bound brute-force (≤ 4 pasienter = ≤ 8 punkt) med avstands-pruning.
            let bestLen = Infinity; const path = []; const brukt = new Array(N2).fill(false);
            const rec = (len, count, lastIdx) => {
                if (len >= bestLen) return;
                if (count === N2) { bestLen = len; beste = path.slice(); return; }
                for (let i = 0; i < N2; i++) {
                    if (brukt[i] || !tilgj(brukt, i)) continue;
                    const d = lastIdx < 0 ? 0 : hav(pts[lastIdx].ll, pts[i].ll);
                    brukt[i] = true; path.push(i);
                    rec(len + d, count + 1, i);
                    path.pop(); brukt[i] = false;
                }
            };
            rec(0, 0, -1);
        }
        if (!beste) {
            // Fallback / ≥ 5 pasienter: nearest-neighbor med presedens (unngår eksponentiell brute-force).
            const brukt = new Array(N2).fill(false); beste = []; let last = -1;
            for (let step = 0; step < N2; step++) {
                let valg = -1, bd = Infinity;
                for (let i = 0; i < N2; i++) {
                    if (brukt[i] || !tilgj(brukt, i)) continue;
                    const d = (last < 0) ? 0 : ((gyldigKoord(pts[last].ll) && gyldigKoord(pts[i].ll)) ? hav(pts[last].ll, pts[i].ll) : 0);
                    if (d < bd) { bd = d; valg = i; }
                }
                if (valg < 0) for (let i = 0; i < N2; i++) if (!brukt[i]) { valg = i; break; }
                brukt[valg] = true; beste.push(valg); last = valg;
            }
        }

        // Slå sammen punkter til ett felles stopp: <300 m i koordinater ELLER samme
        // adressenøkkel (institusjon + postnr) — geokoderen kan sprike >300 m på
        // avdelinger innen samme sykehus (Ahus B102 vs B403).
        const stopp = [];
        for (let i = 0; i < beste.length; i++) {
            const p = pts[beste[i]];
            if (!gyldigKoord(p.ll)) continue;
            const pNokkel = adresseNokkel(p.adr);
            let f = -1;
            for (let s = 0; s < stopp.length; s++) {
                if (hav(stopp[s].ll, p.ll) < 0.3) { f = s; break; }
                if (pNokkel && adresseNokkel(stopp[s].adr) === pNokkel) { f = s; break; }
            }
            if (f >= 0) stopp[f].deler.push(p);
            else stopp.push({ ll: p.ll, adr: p.adr, deler: [p] });
        }

        // Rute mellom unike stopp (på koordinater = rask, ingen klinikk-geokoding).
        const ruteSegmenter = [], bounds = [], segMeter = [], segSek = [];
        for (let i = 0; i < stopp.length - 1; i++) {
            const llA = stopp[i].ll, llB = stopp[i + 1].ll;
            let geo = null;
            const rute = await hentRute(llA[0] + ',' + llA[1], llB[0] + ',' + llB[1]);
            if (rute && rute.geometri) {
                const g2 = [];
                for (let g = 0; g < rute.geometri.length; g++) { const pt = rute.geometri[g]; if (Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])) g2.push(pt); }
                if (g2.length >= 2) geo = g2;
            }
            const fallback = !geo;
            if (!fallback && rute && isFinite(rute.meter)) { segMeter[i] = rute.meter; segSek[i] = rute.sek || 0; }
            else { const dKm = hav(llA, llB) * VEIFAKTOR; segMeter[i] = Math.round(dKm * 1000); segSek[i] = Math.round(dKm / OMVEI_KMH * 3600); }
            if (fallback) geo = [llA, llB];
            // Presis distanse/tid fra host (Google) overstyrer ruter.php-tallet for dette segmentet.
            if (distFn) {
                try { const d = await distFn(llA, llB); if (d && isFinite(d.meter)) { segMeter[i] = d.meter; if (isFinite(d.sek)) segSek[i] = d.sek; } } catch (_) {}
            }
            for (let g = 0; g < geo.length; g++) bounds.push(geo[g]);
            ruteSegmenter.push({ geometri: geo, fallback, meter: segMeter[i], sek: segSek[i] });
        }
        for (let i = 0; i < stopp.length; i++) bounds.push(stopp[i].ll);

        // Omkjøring + BASELINE per pasient: direkte enkelt-tur (det Google Maps ville vist for turen
        // alene) vs reisen i samkjøringen (fra pasientens hente-stopp til leverings-stopp).
        const omkjoringPerPasient = [];
        for (let ti = 0; ti < turer.length; ti++) {
            try {
                const navn = pts[2 * ti].navn;
                let pickIdx = -1, delIdx = -1;
                for (let s = 0; s < stopp.length; s++) for (let d = 0; d < stopp[s].deler.length; d++) {
                    if (stopp[s].deler[d].tur === ti && stopp[s].deler[d].rolle === 'hentes') pickIdx = s;
                    if (stopp[s].deler[d].tur === ti && stopp[s].deler[d].rolle === 'hjem') delIdx = s;
                }
                if (pickIdx < 0 || delIdx < 0 || delIdx <= pickIdx) continue;
                let inM = 0, inS = 0;
                for (let s = pickIdx; s < delIdx; s++) { inM += segMeter[s] || 0; inS += segSek[s] || 0; }
                const pLL = stopp[pickIdx].ll, dLL = stopp[delIdx].ll;
                // BASELINE (direkte enkelt-tur) — bruk Google (distFn) når injisert, så «direkte km»
                // matcher det operatøren ser i Google Maps. Ellers ruter.php.
                let dir = null;
                if (distFn) { try { dir = await distFn(pLL, dLL); } catch (_) {} }
                if (!dir || !isFinite(dir.meter)) dir = await hentRute(pLL[0] + ',' + pLL[1], dLL[0] + ',' + dLL[1]);
                let dirM, dirS;
                if (dir && isFinite(dir.meter)) { dirM = dir.meter; dirS = isFinite(dir.sek) ? dir.sek : 0; }
                else { const dKm = hav(pLL, dLL) * VEIFAKTOR; dirM = Math.round(dKm * 1000); dirS = Math.round(dKm / OMVEI_KMH * 3600); }
                const dM = Math.max(0, inM - dirM), dS = Math.max(0, inS - dirS);
                const pct = dirM > 0 ? Math.round(dM / dirM * 100) : 0;
                omkjoringPerPasient.push({
                    navn, tur: ti, delIdx,
                    direkteKm: +(dirM / 1000).toFixed(1), direkteMin: Math.round(dirS / 60),
                    samkjortKm: +(inM / 1000).toFixed(1), samkjortMin: Math.round(inS / 60),
                    min: Math.round(dS / 60), km: +(dM / 1000).toFixed(1), pct
                });
            } catch (e) {}
        }
        // omkjoringSiste = pasienten med høyest leverings-stopp (leveres sist) — bakoverkompatibelt for prod.
        let omkjoringSiste = null;
        for (let i = 0; i < omkjoringPerPasient.length; i++) if (!omkjoringSiste || omkjoringPerPasient[i].delIdx > omkjoringSiste.delIdx) omkjoringSiste = omkjoringPerPasient[i];

        // Gevinst: N enkeltturer (sum direkte) vs samkjørt (hele ruta). Positiv spar = samkjøring lønner seg.
        let gevinst = null;
        try {
            let sumKm = 0, sumMin = 0;
            for (const o of omkjoringPerPasient) { sumKm += o.direkteKm; sumMin += o.direkteMin; }
            let rKm = 0, rS = 0;
            for (let i = 0; i < segMeter.length; i++) { rKm += segMeter[i] || 0; rS += segSek[i] || 0; }
            rKm = +(rKm / 1000).toFixed(1); const rMin = Math.round(rS / 60);
            gevinst = { sumDirekteKm: +sumKm.toFixed(1), sumDirekteMin: sumMin, samkjortKm: rKm, samkjortMin: rMin, sparKm: +(sumKm - rKm).toFixed(1), sparMin: sumMin - rMin };
        } catch (e) {}

        // Header-omvei (à la beregnPar): kombinert path − lengste enkelt-tur (generalisert til N).
        let omvei = null;
        try {
            let kombinert = 0;
            for (let i = 0; i < stopp.length - 1; i++) kombinert += hav(stopp[i].ll, stopp[i + 1].ll);
            let lengst = 0;
            for (let i = 0; i < turer.length; i++) {
                const f = pts[2 * i].ll, t = pts[2 * i + 1].ll;
                if (gyldigKoord(f) && gyldigKoord(t)) lengst = Math.max(lengst, hav(f, t));
            }
            omvei = Math.round(Math.max(0, (kombinert - lengst) * VEIFAKTOR) / OMVEI_KMH * 60);
        } catch (e) {}

        const kapasitet = turer.length >= 2
            ? kapasitetsSjekk(turer.map(t => ({ behov: normBehov(t), harLedsager: !!t.harLedsager })))
            : { ok: true, enkelt: true };  // N=1: ingen samkjørings-kapasitet å vurdere
        const rekkefolge = stopp.map((st, i) => ({
            nr: i + 1, ll: st.ll, adr: st.adr, delt: st.deler.length > 1,
            deler: st.deler.map(d => ({ pnavn: d.navn, rolle: d.rolle, tur: d.tur }))
        }));
        return { kapasitet, rekkefolge, omvei, omkjoringSiste, omkjoringPerPasient, gevinst, ruteSegmenter, bounds };
    }

    window.__samkjoringKjerne = {
        versjon: VERSJON,
        kapasitetsSjekk, hentKoord, hentRute, haversineKm,
        parseBehov, parseTid, hentPostnr, postnrSted,
        analyserSamkjoring,
        // konstanter eksponert for konsumenter som vil gjenbruke (read-only-bruk forventet)
        VEIFAKTOR, OMVEI_KMH, ALLTID_ALENE
    };
    console.log('[SAMKJORINGS-KJERNE] lastet v' + VERSJON);  // ASCII — vertssider kan være iso-8859-1
})();
