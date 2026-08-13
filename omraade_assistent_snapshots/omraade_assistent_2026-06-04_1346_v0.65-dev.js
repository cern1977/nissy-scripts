// === OMRÅDE ASSISTENT v0.65-dev ===
// v0.65-dev: localStorage-cache fikk TTL (lsLes/lsSkriv): geokoding 30 d, ruter + kjøretid 7 d. Self-healer
//            hvis «samme adresse-streng, men koordinat/tid er korrigert». Endret adresse bommer uansett på
//            nøkkelen → ny henting. Gammelt format uten tidsstempel forkastes automatisk. Gjelder også omr_rt_.
// v0.64-dev: hentKoord (geokoding) + hentRute (kart-ruter) caches nå i localStorage (omr_kd_/omr_ru_),
//            ikke bare i minnet — overlever F5, så vi slipper HTTP-runden på adresser/ruter vi har sett.
//            (Geokoding caches uansett server-side i 30 dager; dette sparer selve nettverksrunden.)
// v0.63-dev: kompakte 2–4-linjers kart-panelkort med ALLE opplysninger (tid+navn, sted→sted, behov
//            +passasjerer, status, send-ut-frist; returbil: ledig-plass + tur/retur) — så kartet
//            kan erstatte listene på sikt.
// v0.62-dev: kuratert fargepalett (rosa/lilla/mørkegrønn/lyseblå …) tildeles sekvensielt til synlige
//            turer — hver tur i vinduet får unik, navngivbar farge (fikser hash-kollisjoner).
// v0.61-dev: default bakgrunnskart = Lyst grå (klarere). Returbiler veksler punkt ⇄ kjørerute
//            (alltid synlige) i stedet for av/på.
// v0.60-dev: «skjul GD»-filteret fanger nå også ST-biler (samme interne Kongsvinger-type).
// v0.59-dev: startede returbiler EKSKLUDERES IKKE (kan ta pasienter underveis) — vis status
//            (Startet/Framme/Tildelt) høyrestilt på kartets returbil-kort; «startet» grønnmerket.
//            («Framme» = til stede, ikke reist; «Startet» = har reist men kan plukke på veien.)
// v0.58-dev: kart-vindu har kun øvre grense (hentetid ≤ nå + vinduMin), ingen nedre — forfalte
//            ventende forsvinner fra lista når de sendes ut, så de som står igjen skal vises.
// v0.57-dev: kart-vindu tar med forfalte-men-ventende turer (nedre grense nå−180 min) — overtid-
//            turer som fortsatt venter er ofte de mest haster, og forsvant fra kartet før.
// v0.56-dev: returbiler vises som opprinnelsespunkt (🚐-markør) i stedet for full rute — unngår
//            spagetti. Lett koordinat-henter (geokod.php). Klikk på returbil-kort panorerer til punkt.
// v0.55-dev: returbiler skjult på kart som standard — «🚐 returbiler»-avhuking styrer panel + ruter.
// v0.54-dev: rute-synlighet — bakgrunnskart-velger (Mørkt/Kartverket grå/topo/Lyst), halo (casing)
//            under hver rute + tykkere/lysere linjer. Default mørkt kart for maks kontrast.
// v0.53-dev: KARTMODUS (Leaflet + Kartverket-fliser). Tegner hele reiseruten per tur i enkelttur-
//            farge via ruter.php (Geonorge-geokoding + ORS). Liste-paneler som overlay, tidsvindu-
//            slider styrer synlige turer. Toggle 🗺️ Kart / 📋 Liste. Server: geokod.php + ruter.php.
// v0.52-dev: surface SV-varsel (krever bil med ekstra bagasjeplass) på returbil- og par-forslag —
//            bagasje-summen (RU=1, RS=1½; over normal 2.0) krever SV. Bagasje-behov gulfarget badge.
// v0.51-dev: ventende↔ventende-paring (ny «Samkjør to ventende»-seksjon) som fallback når ingen
//            returbil passer — to oppdrag samme retning på én bil. Bruker samme kapasitet/omvei.
// v0.50-dev: grovfiltrer ventende på tidsvindu FØR reisetid/omvei-matrise — av hundrevis ventende
//            er bare en håndfull aktuelle nå (fikser Google-timeout/500). matrise.php tåler/avviser
//            store matriser. Ventetid/send-ut vises på alle kort (default når reisetid ikke beregnes).
// v0.49-dev: område hentes LIVE fra NISSY-senteret (dispatch_center_id → editDispatchCenter
//            fromPostCodes1), med DB-tekst og hardkodet som fallback. Auto-synk med kontorets konfig.
// v0.48-dev: område-soner hentes fra kjørekontorets innstilling (ovr_kontor_tilgang.omraade_postnr
//            via window.__vkt_tilgang), med Oslo/Akershus-soner som fallback.
// v0.47-dev: område-sjekk ser på FØRSTE bens destinasjon (opprinnelig innkjøring), ikke et
//            hvilket som helst ben — så Jessheim↔Gjøvik (ender i Jessheim på retur) ekskluderes.
// v0.46-dev: «vårt område» = kjørekontorets postnr-soner (0000-2099,2150-2151,2160-2167,2170)
//            i stedet for hardkodet ≤1299. Returbil vises/matches kun hvis turen ender her.
// v0.45-dev: Returbiler-lista viser kun biler hvis tur ender i Oslo (kommerTilOslo); turer som
//            aldri når Oslo (Innlandet-interne, f.eks. Jessheim↔Gjøvik) skjules helt.
// v0.44-dev: tur/retur-deteksjon = start-postnr lik slutt-postnr (Oslo-agnostisk; fanger
//            intra-Nord som Jessheim↔Gjøvik). Returbil må komme til Oslo for å matches.
// v0.43-dev: to knapper — Autooppdater (grønn/rød) + Frys (blå m/nedtelling). Frys (re)starter
//            60 s ved hvert trykk; Autooppdater gjenopptar straks med frisk skann.
// v0.42-dev: «❄️ Frys»-knapp pauser auto-oppdatering i 60 s (nedtelling), frisk skann ved tining.
// v0.41-dev: tur/retur ekskluderes IKKE lenger — vi regner restkapasitet (egne returpassasjerer
//            opptar seter, f.eks. LF → 1 plass igjen). Alle biler viser «retur: N av 3 ledig»;
//            kun 0-plass-biler (alenebil/full) dempes og holdes ute av matching.
// v0.40-dev: ledsager-badge kun ved heltall ≥ 1 (skjuler «👥+0,0» fra desimal-L-kolonne).
// v0.39-dev: returbil viser «retur: N av 3 plasser ledig» (tom retur = full kapasitet);
//            innkommende behov/ledsager skjules unntatt for tur/retur (irrelevant for tom retur).
// v0.38-dev: fix fler-bens parse — ledsager = maks per ben (ikke «1»+«1»→«11»), behov-ben skilles.
// v0.37-dev: tooltips (fulle SUTI-navn) på behov-badges + ledsager + tur/retur.
// v0.36-dev: behov-badges også på returbil-kort; behov leses som tekst+ikon (robust);
//            tur/retur samme bil markeres 🔁, dempes og ekskluderes fra samkjør-forslag.
// v0.35-dev: full kapasitetsmodell gjenbrukt fra samkjorer.js — ALLTID_ALENE (RB/ERS/A/AL/TH/IA/
//            C19/TMS/TK), LAAST-setevekter (LB=1.5 bak, LF=0.5), HI/LI-konflikt, bagasje/SV,
//            ledsager (L-kolonne) som ekstra sete. Behov leses fra ikon-alt. Badges viser kodene.
// v0.34-dev: AL (allergibil) = alenebil som A (annen grunn — hundehår/parfyme).
// v0.33-dev: LB opptar hele baksetet (ingen vanlig ved siden av); LF+LB = gyldig 2-kombo.
// v0.32-dev: plass-behov (A/LB/LF/SF) som badge + seteberegning per returbil (maks 1 foran,
//            maks 1 ligge bak, A=alenebil); linjebrudd etter pil også på returbiler.
// v0.31-dev: skjul «TAX» reisemåte på ventende-kort (ikke relevant; HLSX har egen liste).
// v0.30-dev: linjebrudd etter pil på ventende-kort (fra og til på hver sin linje).
// v0.29-dev: checkbox «skjul GD» — interne GD-biler (Kongsvinger) skjules fra Returbiler + forslag.
// v0.14-dev: stoler på NISSYs filtre i stedet for postnr-omklassifisering (som feilklassifiserte og
//            skjulte ventende). Venstre = 18448 ventende, høyre = 17296 pågående. HLSX skjult.
// v0.13: 18448-pågående skjult. v0.8–0.12: per-leg retning via postnr-sett (fjernet, var skjør).
// v0.6: bil-kort. v0.5: merk-knapp. v0.4: HLSX. v0.3: 2x2. v0.2: egen fane. v0.1: forslag.
(function () {
    'use strict';

    const VERSJON = '0.65-dev';
    // Interne GD-/ST-biler (kjører i Kongsvinger) er ikke ekte returbiler — kan skjules via checkbox.
    let skjulGD = true;
    function erGD(r) { return /^\s*(GD|ST)\b/i.test(r.ressurs || ''); }
    function synligeTreff(r) { return (r._treff || []).filter(t => !(skjulGD && erGD(t.pRow))); }
    // Områder å velge mellom. Hvert område = et par dispatch-filtre (inn = Fra, ut = Til).
    // Fylles automatisk fra NISSYs filterliste (par «Fra X» ↔ «Til X»). Denne brukes som
    // fallback hvis auto-detektering ikke finner noe.
    // Hvert område: inn/ut = filtre for tur-listene (ut = ventende «på vei ut», inn = returbiler).
    // kilder = farge-soner (delområder) klassifisert etter destinasjons-postnr (sonens ut-filter).
    let OMRAADER = [
        { navn: 'Nord', inn: '17296', ut: '17295', kilder: [{ navn: 'Nord', ut: '17295', farge: '#3b82f6' }] },
    ];
    let aktivNavn = '', aktivInn = null, aktivUt = null, aktivKilder = [], pollIv = null, visIv = null, sisteData = null;
    let bilMatchMap = {};  // returbil-resId → [{v: ventende, t: treff}] (fylles i render)
    let frysTil = 0, frysIv = null;  // pause auto-oppdatering til dette tidspunktet (ms)
    let kartMode = false, kart = null, kartLag = null, casingLag = null, basisLag = null, vinduMin = 120, kartBasis = 'lyst';
    let returVis = 'punkt';  // hvordan returbiler vises på kart: 'punkt' | 'rute'
    const _ruteCache = {};
    // Bakgrunnskart-valg. casing = halo-farge under rutene (lys på mørkt kart, mørk på lyst).
    const BASISKART = {
        'mørkt':   { navn: 'Mørkt',           url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',                                  casing: 'rgba(255,255,255,.5)' },
        'gråtone': { navn: 'Kartverket grå',  url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png', casing: 'rgba(15,23,42,.6)' },
        'topo':    { navn: 'Kartverket topo', url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',          casing: 'rgba(255,255,255,.65)' },
        'lyst':    { navn: 'Lyst grå',        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',                                 casing: 'rgba(15,23,42,.6)' },
    };
    const OMRAADE_FARGER = { 'nord': '#3b82f6', 'østfold': '#f97316', 'sør': '#22c55e', 'vest': '#a855f7', 'glåmdalen': '#eab308' };
    function fargeFor(navn) { return OMRAADE_FARGER[String(navn || '').toLowerCase()] || '#64748b'; }
    const POLL_MS = 90000;
    const FRYS_MS = 60000;   // hvor lenge «❄️ Frys» pauser oppdatering
    const MATCH_TIDSVINDU_MIN = 45;
    const NAVN = 'OMRÅDE-ASSISTENT';
    const NISSY_BLAA = 'rgb(148, 169, 220)';
    const SERVER = 'https://thomaswestby.no/skript';
    const VENTETID_MIN = 60;  // ventetid = maks(reisetid, dette) minutter
    const MAKS_VENTETID_MIN = 180;  // øvre grense for ventetid i grovfilteret (før reisetid er kjent)
    const VARSEL_MIN = 25;    // «send ut»-varsel så mange minutter før hente-fristen
    const OMVEI_MAKS_MIN = 20; // godtatt ekstra omvei (min) for å ta en pasient på vei til returmål
    const PAR_OMVEI_MAKS_MIN = 30; // godtatt omvei (min) når to ventende samkjøres direkte (uten returbil)
    const PAR_VINDU_MIN = 120;     // se etter ventende-par med hentetid innen så mange min fram
    const PAR_MAKS = 30;           // maks ventende i par-poolen (ytelse; de soonere etter hentetid)

    /* ── XHR ───────────────────────────────────────── */
    function xhr(url) {
        return new Promise((res, rej) => {
            const r = new XMLHttpRequest();
            r.open('GET', url, true);
            r.timeout = 20000;
            r.onload = () => res(r.responseText);
            r.onerror = () => rej(new Error('xhr-feil: ' + url));
            r.ontimeout = () => rej(new Error('timeout: ' + url));
            r.send();
        });
    }

    function hentPostnr(t) { if (!t) return null; const m = String(t).match(/\b(\d{4})\b/); return m ? m[1] : null; }
    function parseTid(s) { if (!s) return null; const m = String(s).trim().match(/(\d{1,2})[:.](\d{2})\s*$/); return m ? (+m[1]) * 60 + (+m[2]) : null; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    function erHlsx(r) { return (r.legs || []).some(l => /HLSX/i.test(l.rmate || '')); }
    /* ── Plass/kapasitet — gjenbruk av samkjører-modellen (samkjorer.js) ── */
    // Behov som krever alenetransport (kan aldri samkjøres med andre).
    const ALLTID_ALENE = ['RB', 'ERS', 'A', 'AL', 'TH', 'IA', 'C19', 'TMS', 'TK'];
    // Behov uten plass-konsekvens — ignoreres i kapasitetsregnskapet.
    const IGNORER = ['LIFO', 'VA', '4X4', 'HJE', 'MH', 'TB', 'ØH', 'B'];
    const KONFLIKTER = [['HI', 'LI']];  // høy + lav innstigning kan ikke kombineres
    const MAKS = { forsete: 1.0, baksete: 2.0, bagasje: 2.0, bagasjeSV: 3.0, passasjerer: 3 };
    // «Låste» behov med fast seteforbruk (brøk = opptar mer enn ett sete).
    const LAAST = {
        SF:  { forsete: 1.0, baksete: 0,   bagasje: 0 },  // sitte foran
        LF:  { forsete: 1.0, baksete: 0.5, bagasje: 0 },  // god benplass/regulerbart sete (foran)
        LB:  { forsete: 0,   baksete: 1.5, bagasje: 0 },  // trenger hele baksetet
        BS:  { forsete: 0,   baksete: 1.0, bagasje: 0 },  // barnesete
        BSP: { forsete: 0,   baksete: 1.0, bagasje: 0 },  // sittepute
    };
    const BAGASJE = { RU: 1.0, RS: 1.5 };
    const ALLE_BEHOV = ALLTID_ALENE.concat(IGNORER, ['HI', 'LI', 'SF', 'LF', 'LB', 'BS', 'BSP', 'RU', 'RS', 'SV']);
    function parseBehov(tekst) {
        if (!tekst) return [];
        return tekst.toUpperCase().split(/[\s,/+]+/).filter(b => b.length > 0 && ALLE_BEHOV.includes(b));
    }
    // Kapasitetssjekk for et SETT passasjerer (1+ ledsager teller som fleksibelt sete).
    function kapasitetsSjekk(passasjerer) {
        if (passasjerer.length > MAKS.passasjerer) return { ok: false, grunn: 'Maks ' + MAKS.passasjerer + ' passasjerer' };
        for (const p of passasjerer) for (const b of p.behov) if (ALLTID_ALENE.includes(b)) return { ok: false, grunn: b + ' krever alenetransport' };
        const alle = [].concat(...passasjerer.map(p => p.behov));
        for (const kf of KONFLIKTER) if (alle.includes(kf[0]) && alle.includes(kf[1])) return { ok: false, grunn: kf[0] + '+' + kf[1] + ' går ikke' };
        const filtrert = passasjerer.map(p => ({ behov: p.behov.filter(b => !IGNORER.includes(b)), harLedsager: p.harLedsager }));
        let forsete = 0, baksete = 0, bagasje = 0; const fleksible = [];
        filtrert.forEach(pass => {
            let erLaast = false, laastType = null;
            for (const b of pass.behov) { if (LAAST[b]) { laastType = b; forsete += LAAST[b].forsete; baksete += LAAST[b].baksete; bagasje += LAAST[b].bagasje; erLaast = true; break; } }
            if (erLaast && (laastType === 'BS' || laastType === 'BSP')) baksete += 1.0;
            else if (erLaast && pass.harLedsager) fleksible.push(1);
            for (const b of pass.behov) if (BAGASJE[b]) bagasje += BAGASJE[b];
            if (!erLaast) { fleksible.push(1); if (pass.harLedsager) fleksible.push(1); }
        });
        for (let i = 0; i < fleksible.length; i++) {
            if (baksete + 1.0 <= MAKS.baksete) baksete += 1.0;
            else if (forsete + 1.0 <= MAKS.forsete) forsete += 1.0;
            else return { ok: false, grunn: 'Ikke nok seter' };
        }
        if (forsete > MAKS.forsete) return { ok: false, grunn: 'Forsete overfylt' };
        if (baksete > MAKS.baksete) return { ok: false, grunn: 'Baksete overfylt' };
        if (bagasje > MAKS.bagasjeSV) return { ok: false, grunn: 'For mye bagasje' };
        return { ok: true, svVarsel: bagasje > MAKS.bagasje };
    }
    const BEHOV_FARGE = code => ALLTID_ALENE.includes(code) ? '#ef4444' : (LAAST[code] ? '#f59e0b' : (BAGASJE[code] ? '#eab308' : '#0ea5e9'));
    // Fulle SUTI-navn for tooltip (kodene er små/kryptiske).
    const BEHOV_NAVN = {
        AL: 'Allergi', BS0: 'Babystol 0–13 kg', BS5: 'Barnesete spesial 15–36 kg',
        BS4: 'Barnestol 15–25 kg', BS1: 'Barnestol 9–18 kg', BS: 'Barnesete',
        LIFO: 'Direktebil', SV: 'Ekstra bagasjeplass', ERS: 'Elektrisk rullestol',
        '4X4': 'Firehjulstrekk', TH: 'Førerhund/servicehund', LF: 'God benplass og regulerbart sete',
        HJE: 'Hjelpes til/fra transportmiddel', HI: 'Høy innstigning', C19: 'Korona relatert',
        LI: 'Lav innstigning', TB: 'Manuell håndtering', MH: 'Manuell håndtering (NY)',
        B: 'Må bæres', IA: 'Må ikke overlates til seg selv', VA: 'Beskyttet/fullvaksinert',
        RU: 'Rullator', RB: 'Rullestolbil', RS: 'Sammenleggbar rullestol', SF: 'Sitte foran',
        BSP: 'Sittepute', TMS: 'Ta med rullestol/transportstol', TK: 'Trappeklatrer',
        LB: 'Trenger hele baksetet', 'ØH': 'Øyeblikkelig hjelp', A: 'Alenebil',
    };
    function behovBadges(r) {
        return (r._behov || []).filter(b => !IGNORER.includes(b))
            .map(b => '<span class="b" title="' + esc(BEHOV_NAVN[b] || b) + '" style="background:' + BEHOV_FARGE(b) + '33;color:' + BEHOV_FARGE(b) + '">' + b + '</span>').join('');
    }
    function ledsBadge(r) { const n = parseInt(r._ledsN, 10) || 0; return n >= 1 ? '<span class="b" title="Antall reiseledsagere" style="background:#33415566;color:#cbd5e1">👥+' + n + '</span>' : ''; }
    function passObj(r) { return { behov: r._behov || [], harLedsager: (parseInt(r._ledsN, 10) || 0) >= 1 }; }
    // Passasjerer som blir værende i bilen på returen. Tur/retur: pasienten kjører
    // tilbake → opptar seter. Tom retur (kun innkjøring): ingen → full kapasitet.
    function egneReturPassasjerer(r) { return erTurRetur(r) ? [passObj(r)] : []; }
    // Hvor mange ekstra vanlige passasjerer får plass i tillegg til base-lasten
    // (setevekter: LF tar foran + ½ bak → kun 1 igjen, alenebil → 0, osv.).
    function ledigePlasser(base) {
        let n = 0;
        while (n < MAKS.passasjerer) {
            const sett = base.concat(Array(n + 1).fill({ behov: [], harLedsager: false }));
            if (sett.length >= 2 && !kapasitetsSjekk(sett).ok) break;
            n++;
        }
        return n;
    }
    // Greedy-fyll av returbilens RESTkapasitet med matchede ventende. base = bilens egne
    // returpassasjerer (tur/retur) som allerede sitter; kandidatene legges oppå.
    function fyllBil(base, kandidater) {
        kandidater.sort((a, b) => (parseTid((a.v.legs[0] || {}).opp) ?? 9999) - (parseTid((b.v.legs[0] || {}).opp) ?? 9999) || a.t.omvei - b.t.omvei);
        const tatt = [], avvist = [];
        kandidater.forEach(k => {
            const sett = base.concat(tatt.concat(k).map(x => passObj(x.v)));
            if (sett.length <= 1 || kapasitetsSjekk(sett).ok) tatt.push(k);
            else avvist.push(k);
        });
        // Trenger settet bil med ekstra bagasjeplass (SV)? (bagasje over normal 2.0, men ≤ 3.0)
        const sluttSett = base.concat(tatt.map(k => passObj(k.v)));
        const sv = sluttSett.length ? !!kapasitetsSjekk(sluttSett).svVarsel : false;
        return { tatt, avvist, sv };
    }
    // Samme tur kan treffe flere kilde-filtre (overlapp). Behold første forekomst.
    function dedupResId(arr) {
        const seen = new Set();
        return arr.filter(r => { if (seen.has(r.resId)) return false; seen.add(r.resId); return true; });
    }
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
    function iSett(postnr, ranges) { const n = +postnr; return (ranges || []).some(r => n >= r[0] && n <= r[1]); }
    // Stedsnavn fra adresse = ordet/ordene etter postnr ("…, 2614 Lillehammer" → "Lillehammer").
    function stedFraAdr(adr) { const m = String(adr || '').match(/\b\d{4}\s+(.+?)\s*$/); return m ? m[1].trim() : ''; }
    // "postnr sted" fra adresse — for geokoding/kjøretid ("…, 2614 Lillehammer" → "2614 Lillehammer").
    function postnrSted(adr) { const m = String(adr || '').match(/\b\d{4}\s+.+?$/); return m ? m[0].trim() : String(adr || '').trim(); }
    function fmtMin(m) { m = Math.round(m); const h = Math.floor(m / 60), mm = m % 60; return h ? (h + ' t' + (mm ? ' ' + mm + ' min' : '')) : (mm + ' min'); }
    function tidStr(min) { min = Math.round(((min % 1440) + 1440) % 1440); const h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
    function naaMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
    // Returbil: returmål = FØRSTE hentested (tidligst hentetid) — dit bilen skal tilbake.
    // Ankomst Oslo = seneste oppmøtetid (når den er ferdig levert og ledig for retur).
    // Eks: henter Lillehammer (07:30) → Hamar (08:10) → leverer Oslo → returmål = Lillehammer.
    function returInfo(r) {
        let forsteFra = '', forsteT = Infinity, sentOpp = -Infinity;
        (r.legs || []).forEach(l => {
            const s = parseTid(l.start || l.opp);
            if (s !== null && s < forsteT) { forsteT = s; forsteFra = l.fra; }
            const o = parseTid(l.opp || l.start);
            if (o !== null && o > sentOpp) sentOpp = o;
        });
        if (!forsteFra) forsteFra = (r.legs[0] || {}).fra || '';
        return { fra: forsteFra, postnr: hentPostnr(forsteFra), ank: sentOpp > -Infinity ? sentOpp : null };
    }
    // Kjørekontorets område (postnr-soner). Kilderekkefølge (lastOmraade):
    //   1) LIVE fra NISSY-senteret (window.__vkt_tilgang.dispatch_center_id → editDispatchCenter
    //      → fromPostCodes1) — auto-synk med kontorets egen konfig.
    //   2) Lagret tekst (window.__vkt_tilgang.omraade_postnr) hvis live-henting feiler.
    //   3) Hardkodet fallback hvis verktøykassen ikke har eksponert tilgang.
    // En returbil er relevant kun hvis den OPPRINNELIGE turen (første ben = innkjøring til
    // behandling) ender i området — returbenet kan ende i området likevel (Jessheim↔Gjøvik).
    const OMRAADE_FALLBACK = '0000-2099,2150-2151,2160-2167,2170';
    let OMRAADE_POSTNR = parsePostnrSett(OMRAADE_FALLBACK);
    let omraadeLastet = false;
    async function lastOmraade() {
        if (omraadeLastet) return;
        omraadeLastet = true;
        const t = (function () { try { return window.__vkt_tilgang || {}; } catch (e) { return {}; } })();
        let kilde = 'fallback';
        const senterId = t.dispatch_center_id;
        if (senterId) {
            try {
                const html = await xhr('/administrasjon/admin/editDispatchCenter?id=' + encodeURIComponent(senterId) + '&t=' + Date.now());
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const e = doc.querySelector('[name="dispatchFilter.fromPostCodes1"]');
                const sett = parsePostnrSett(e ? (e.textContent || e.value || '') : '');
                if (sett.length) { OMRAADE_POSTNR = sett; kilde = 'NISSY-senter ' + senterId; }
            } catch (e) { console.warn('[' + NAVN + '] live område-henting feilet:', e.message); }
        }
        if (kilde === 'fallback' && t.omraade_postnr) {
            const sett = parsePostnrSett(t.omraade_postnr);
            if (sett.length) { OMRAADE_POSTNR = sett; kilde = 'DB-innstilling'; }
        }
        console.log('[' + NAVN + '] område lastet (' + kilde + '): ' + OMRAADE_POSTNR.length + ' soner');
    }
    function erVaartOmraade(adr) { const p = hentPostnr(adr); return p ? iSett(p, OMRAADE_POSTNR) : false; }
    function forsteBen(r) {
        return (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999))[0] || null;
    }
    function kommerTilOmraadet(r) { const f = forsteBen(r); return !!f && erVaartOmraade(f.til); }
    // Tur/retur samme bil: bilen ender der den startet (start-postnr = slutt-postnr) →
    // pasienten kjører tilbake og opptar seter på returen. Oslo-agnostisk (gjelder også
    // intra-Nord-turer som Jessheim→Gjøvik→Jessheim).
    function erTurRetur(r) {
        const legs = (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999));
        if (legs.length < 2) return false;
        const start = hentPostnr(legs[0].fra), slutt = hentPostnr(legs[legs.length - 1].til);
        return !!start && start === slutt;
    }
    // Bilens nåværende status: status på det utgående benet (returen) hvis det finnes, ellers
    // siste bens status. «Startet» = har reist (kan ta pasienter underveis), «Framme» = til stede,
    // «Tildelt»/«Akseptert» = planlagt men ikke kjørt.
    function returStatus(r) {
        const legs = (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999));
        const utg = legs.find(l => erVaartOmraade(l.fra) && hentPostnr(l.til) && !erVaartOmraade(l.til));
        return ((utg && utg.status) || (legs[legs.length - 1] || {}).status || '').trim();
    }

    // localStorage-cache med TTL — adresser/ruter/kjøretider kan endres, så cachen self-healer når
    // den blir for gammel. Nøkkelen er adresse-strengen, så en ENDRET adresse (pasient flytter) bommer
    // uansett og hentes på nytt; TTL fanger tilfellet «samme streng, men koordinat/tid er korrigert».
    const _LS_DAG = 864e5;
    function lsLes(fullKey, ttl) {
        try {
            const r = localStorage.getItem(fullKey);
            if (!r) return undefined;
            const o = JSON.parse(r);
            if (o && typeof o === 'object' && 't' in o) {
                if (Date.now() - o.t < ttl) return o.v;
                localStorage.removeItem(fullKey);          // utløpt
            } else { localStorage.removeItem(fullKey); }   // gammelt format uten tidsstempel
        } catch (e) {}
        return undefined;
    }
    function lsSkriv(fullKey, v) { try { localStorage.setItem(fullKey, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }

    // Kjøretid via reisetid.php-proxyen (Google Distance Matrix server-side, cachet). Cacher også klient-side.
    const _rtCache = {};
    async function hentReisetid(fra, til) {
        const o = postnrSted(fra);           // Oslo-postnr — rutbart + god cache-reuse
        const d = String(til || '').trim();  // full hjemadresse (postnr-sentroid kan være ikke-rutbart)
        if (!o || !d) return null;
        const key = o + '|' + d;
        if (_rtCache[key] !== undefined) return _rtCache[key];
        const ls = lsLes('omr_rt_' + key, 7 * _LS_DAG);
        if (ls !== undefined) { _rtCache[key] = ls; return ls; }
        try {
            const r = await fetch(SERVER + '/reisetid.php?origin=' + encodeURIComponent(o) + '&dest=' + encodeURIComponent(d), { cache: 'no-store' });
            const j = await r.json();
            if (j.ok) {
                const v = { sek: j.sek, tekst: j.tekst, km: j.km };
                _rtCache[key] = v;
                lsSkriv('omr_rt_' + key, v);
                return v;
            }
        } catch (e) {}
        _rtCache[key] = null;
        return null;
    }

    function celleVerdier(tr, i) {
        if (i < 0 || !tr.cells[i]) return [];
        const c = tr.cells[i];
        const divs = c.querySelectorAll('div');
        if (divs.length) return Array.from(divs).map(d => d.textContent.trim());
        const t = c.textContent.trim();
        return t ? [t] : [];
    }
    // Behov-cellen kan inneholde tekst-koder (f.eks. «IA,RU,RB») og/eller ikoner — vi
    // slår sammen tekst + img-alt/title så parseBehov fanger kodene uansett representasjon.
    // Fler-bens biler har ett div per ben; vi skiller dem med mellomrom (ellers limes
    // koder/ledsagertall sammen, f.eks. «1»+«1»→«11»).
    function behovTekst(tr, i) {
        if (i < 0 || !tr.cells[i]) return '';
        const c = tr.cells[i];
        const divs = c.querySelectorAll('div');
        const txt = divs.length ? Array.from(divs).map(d => d.textContent.trim()).join(' ') : c.textContent.trim();
        const imgs = Array.from(c.querySelectorAll('img')).map(im => im.alt || im.title || '').join(' ');
        return (txt + ' ' + imgs).trim();
    }
    // Ledsager-antall = maks over ben (fler-bens biler gjentar tallet per ben).
    function ledsAntall(tr, i) {
        return celleVerdier(tr, i).reduce((m, v) => Math.max(m, parseInt(v, 10) || 0), 0);
    }

    /* ── Auto-parering av områder fra NISSYs filterliste ─ */
    // Filtrene heter «Fra X» / «Til X». Vi parer dem på X og bygger områdene.
    function finnFilterSelect() {
        for (const n of ['filter-ventende-oppdrag', 'filter-resurser', 'filter-effektivitet']) {
            const s = document.querySelector('select[name="' + n + '"]');
            if (s && s.options.length > 50) return s;
        }
        let best = null;
        document.querySelectorAll('select').forEach(s => {
            if (s.options.length > 100 && (!best || s.options.length > best.options.length)) best = s;
        });
        return best;
    }
    function byggOmraaderFraSelect() {
        const sel = finnFilterSelect();
        if (!sel) return [];
        const fra = {}, til = {};
        Array.from(sel.options).forEach(o => {
            if (!o.value || !/^\d+$/.test(o.value)) return;
            const navn = o.textContent.trim();
            let m;
            // «Fra X» / «Til X» — X uten «til» i seg (ekskluderer «Fra X til Y»). Strip evt. « Langtransport».
            if ((m = navn.match(/^Fra\s+([^]+?)(?:\s+Langtransport)?$/i)) && !/\stil\s/i.test(m[1])) fra[m[1].toLowerCase()] = { id: o.value, navn: m[1].trim() };
            else if ((m = navn.match(/^Til\s+([^]+?)(?:\s+Langtransport)?$/i)) && !/\stil\s/i.test(m[1]) && !/^\//.test(m[1])) til[m[1].toLowerCase()] = { id: o.value, navn: m[1].trim() };
        });
        const par = [];
        Object.keys(fra).forEach(k => { if (til[k]) par.push({ navn: fra[k].navn, inn: fra[k].id, ut: til[k].id }); });
        par.sort((a, b) => a.navn.localeCompare(b.navn, 'no'));
        const omr = par.map(p => ({ navn: p.navn, inn: p.inn, ut: p.ut, kilder: [{ navn: p.navn, ut: p.ut, farge: fargeFor(p.navn) }] }));
        // Kombinert «Nord/Øst»: bruk det brede operative filteret (18448) for ventende-listen,
        // og fargelegg etter delområde-postnr (Nord = 17295-sett, Østfold = 17301-sett).
        const nord = par.find(p => /^nord$/i.test(p.navn));
        const ost = par.find(p => /østfold/i.test(p.navn));
        if (nord && ost) {
            omr.push({
                navn: 'Nord/Øst',
                inn: nord.inn,        // returbiler — justeres senere
                ut: '18448',          // bredt «Nord/Øst»-ventende
                kilder: [
                    { navn: nord.navn, ut: nord.ut, farge: fargeFor(nord.navn) },
                    { navn: ost.navn, ut: ost.ut, farge: fargeFor(ost.navn) },
                ],
            });
        }
        return omr;
    }

    // Henter destinasjons-postnr-settet (toPostCodes1) for en kildes ut-filter — for fargesetting.
    async function lastKildePostnr(k) {
        if (k._postnr) return;
        try {
            const html = await xhr('/administrasjon/admin/editDispatchFilter?id=' + k.ut);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const e = doc.querySelector('[name="toPostCodes1"]');
            k._postnr = parsePostnrSett(e ? (e.value || e.textContent || '') : '');
        } catch (e) { k._postnr = []; }
    }
    // Hvilket delområde (farge-sone) en tur tilhører avgjøres av destinasjonens postnr.
    function delomraade(r) {
        const def = aktivKilder[0] || { navn: aktivNavn, farge: '#64748b' };
        if (aktivKilder.length <= 1) return def;
        for (const l of (r.legs || [])) {
            const p = hentPostnr(l.til);
            if (!p) continue;
            for (const k of aktivKilder) { if (iSett(p, k._postnr)) return k; }
        }
        return def;
    }

    /* ── Merk rad blå i NISSY-planleggeren ─ */
    function finnRad(resId) { return document.getElementById('V-' + resId) || document.getElementById('P-' + resId); }
    function erMerket(resId) { const rad = finnRad(resId); return !!rad && rad.style.backgroundColor === NISSY_BLAA; }
    function toggleMerk(resId) {
        const rad = finnRad(resId);
        if (!rad) return 'mangler';
        if (rad.style.backgroundColor === NISSY_BLAA) { rad.style.backgroundColor = ''; return 'av'; }
        rad.style.backgroundColor = NISSY_BLAA;
        return 'paa';
    }

    // Ventende har Fra+Til slått sammen i én celle uten skilletegn. To adresser møtes der en
    // liten bokstav står rett foran en stor (f.eks. "…0450 OsloLigarda…") — vi deler der.
    function splittFraTil(tekst) {
        if (!tekst) return ['', ''];
        const m = tekst.match(/^(.*?[a-zæøå])([A-ZÆØÅ].*)$/);
        return m ? [m[1].trim(), m[2].trim()] : [tekst.trim(), ''];
    }

    /* ── Parse dispatch-XML → rader med ressurs + etapper ─ */
    // To ulike tabellstrukturer: pågående (Ressurs/Fra/Til/… per etappe-div) og
    // ventende (Pnavn/Reisetid/Opptid/Reisemåte/Behov/L/FraTil — én rad, FraTil sammenslått).
    function parseDispatch(responseText) {
        const xmlDoc = new DOMParser().parseFromString(responseText, 'text/xml');
        const rader = [];
        xmlDoc.querySelectorAll('response').forEach(resp => {
            const fane = resp.getAttribute('id');
            if (!['ventendeOppdrag', 'paagaaendeOppdrag'].includes(fane)) return;
            const d = document.createElement('div');
            d.innerHTML = resp.textContent;
            const hc = Array.from(d.querySelector('tr.tbh')?.cells || []).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
            if (!hc.length) return;
            const iFraTil = hc.findIndex(s => s === 'FRATIL');

            if (iFraTil >= 0) {
                // VENTENDE-struktur
                const idx = {
                    pnavn:    hc.findIndex(s => s === 'PNAVN'),
                    reisetid: hc.findIndex(s => s === 'REISETID'),
                    opptid:   hc.findIndex(s => s === 'OPPTID' || s === 'OPPMTID'),
                    rmate:    hc.findIndex(s => s === 'REISEMÅTE' || s === 'RMÅTE'),
                    behov:    hc.findIndex(s => s === 'BEHOV'),
                    leds:     hc.findIndex(s => s === 'L'),
                };
                d.querySelectorAll('tbody tr[name]').forEach(tr => {
                    const reqIds = Array.from(tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)).map(m => m[1]);
                    if (!reqIds.length) return;
                    const c = i => (i >= 0 && tr.cells[i]) ? tr.cells[i].textContent.trim() : '';
                    const ft = splittFraTil(c(iFraTil));
                    const behovRaa = behovTekst(tr, idx.behov);
                    const ledsRaa = c(idx.leds);
                    rader.push({
                        reqId: reqIds[0], resId: tr.getAttribute('name'), fane, ressurs: '',
                        _behov: parseBehov(behovRaa),
                        _ledsN: parseInt(ledsRaa, 10) || 0,
                        legs: [{
                            start: c(idx.reisetid), opp: c(idx.opptid),
                            fra: ft[0], til: ft[1], status: '',
                            pnavn: c(idx.pnavn), rmate: c(idx.rmate), behov: behovRaa,
                        }],
                    });
                });
                return;
            }

            // PÅGÅENDE-struktur
            const idx = {
                ressurs: hc.findIndex(s => s === 'RESSURS'),
                start:   hc.findIndex(s => s.includes('START')),
                oppmtid: hc.findIndex(s => s === 'OPPMTID' || s === 'OPPTID'),
                fra:     hc.findIndex(s => s === 'FRA'),
                til:     hc.findIndex(s => s === 'TIL'),
                padr:    hc.findIndex(s => s === 'PADR'),
                behadr:  hc.findIndex(s => s === 'BEHADR'),
                pnavn:   hc.findIndex(s => s === 'PNAVN'),
                rmate:   hc.findIndex(s => s === 'RMÅTE' || s === 'REISEMÅTE'),
                behov:   hc.findIndex(s => s === 'BEHOV'),
                leds:    hc.findIndex(s => s === 'L'),
                status:  hc.findIndex(s => s.includes('STATUS')),
            };
            d.querySelectorAll('tbody tr[name]').forEach(tr => {
                const reqIds = Array.from(tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)).map(m => m[1]);
                if (!reqIds.length) return;
                const ressurs = idx.ressurs >= 0 && tr.cells[idx.ressurs] ? tr.cells[idx.ressurs].textContent.trim() : '';
                const startA = celleVerdier(tr, idx.start);
                const oppA = celleVerdier(tr, idx.oppmtid);
                const fraA = celleVerdier(tr, idx.fra >= 0 ? idx.fra : idx.padr);
                const tilA = celleVerdier(tr, idx.til >= 0 ? idx.til : idx.behadr);
                const statusA = celleVerdier(tr, idx.status);
                const pnavnA = celleVerdier(tr, idx.pnavn);
                const rmateA = celleVerdier(tr, idx.rmate);
                const behovA = celleVerdier(tr, idx.behov);
                const n = Math.max(reqIds.length, fraA.length, oppA.length, 1);
                const v = (arr, j) => arr[j] != null ? arr[j] : (arr[0] || '');
                const legs = [];
                for (let j = 0; j < n; j++) {
                    legs.push({
                        start: v(startA, j), opp: v(oppA, j),
                        fra: v(fraA, j), til: v(tilA, j),
                        status: v(statusA, j), pnavn: v(pnavnA, j), rmate: v(rmateA, j), behov: v(behovA, j),
                    });
                }
                rader.push({
                    reqId: reqIds[0], resId: tr.getAttribute('name'), fane, ressurs,
                    _behov: parseBehov(behovTekst(tr, idx.behov)),
                    _ledsN: ledsAntall(tr, idx.leds),
                    legs,
                });
            });
        });
        return rader;
    }

    /* ── Skann: hent inn- og ut-filter, gjenopprett brukerens filter ─ */
    async function hentFilter(fid) {
        await xhr('ajax-dispatch?did=all&search=none&t=' + Date.now());
        const txt = await xhr('ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + fid + '&t=' + Date.now());
        return parseDispatch(txt);
    }

    async function scan() {
        const origM = document.cookie.match(/thwerfilter=(\d+)/);
        const orig = origM ? origM[1] : '0';
        const inn = await hentFilter(aktivInn);
        const ut = await hentFilter(aktivUt);
        try {
            await xhr('ajax-dispatch?did=all&search=none&t=' + Date.now());
            await xhr('ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + orig + '&t=' + Date.now());
            document.cookie = 'thwerfilter=' + orig + '; path=/';
        } catch (e) { console.warn('[' + NAVN + '] gjenoppretting feilet:', e.message); }
        return { inn, ut };
    }

    // Batch kjøretid-matrise via matrise.php.
    async function hentMatrise(origins, destinations) {
        try {
            const r = await fetch(SERVER + '/matrise.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origins, destinations }) });
            const j = await r.json();
            return j.ok ? j.sek : null;
        } catch (e) { return null; }
    }

    /* ── Forslag: ventende retur ⟷ returbil, via Google-omvei ─ */
    // R = returbil (kom inn fra nord, klar for retur til returmål E = første hentested).
    // V = ventende (pasient i Oslo → hjem D). Match hvis V er «på veien» til E (liten omvei)
    // OG R er i Oslo innenfor V sitt vindu. omvei = (Oslo→D + D→E) − Oslo→E.
    // ventende er allerede grovfiltrert i berik (kun de tidsmessig aktuelle), og har _rt satt.
    async function beregnForslag(ventende, biler) {
        ventende.forEach(r => r._treff = []);
        if (!ventende.length || !biler.length) return;
        biler.forEach(p => { if (!p._ri) p._ri = returInfo(p); });
        ventende.forEach(v => {
            const vl = v.legs[0] || {};
            const D = String(vl.til || '').trim();
            const vKlar = parseTid(vl.opp || vl.start);
            v._fi = (D && vKlar !== null) ? { D, vKlar, vFrist: vKlar + Math.max((v._rt ? v._rt.sek / 60 : 0), VENTETID_MIN) } : null;
        });
        // Presist tidsvindu med reisetid: behold kun ventende som har en returbil i vinduet.
        const relevante = ventende.filter(v => v._fi && biler.some(p =>
            p._ri.ank !== null && p._ri.fra && p._ri.ank >= v._fi.vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= v._fi.vFrist));
        if (!relevante.length) return;

        const Dset = [], Eset = [], Dmap = {}, Emap = {};
        relevante.forEach(v => { const d = v._fi.D; if (Dmap[d] === undefined) { Dmap[d] = Dset.length; Dset.push(d); } });
        biler.forEach(p => { const e = String(p._ri.fra || '').trim(); if (e && Emap[e] === undefined) { Emap[e] = Eset.length; Eset.push(e); } });
        if (!Dset.length || !Eset.length) return;
        console.log('[' + NAVN + '] forslag-matrise: ' + relevante.length + ' ventende × ' + Eset.length + ' returmål');
        const M = await hentMatrise(['Oslo'].concat(Dset), Eset.concat(Dset));
        if (!M) return;
        const osloRow = M[0] || [];
        const osloE = e => osloRow[Emap[e]];                       // Oslo→E (sek)
        const osloD = d => osloRow[Eset.length + Dmap[d]];         // Oslo→D (sek)
        const dToE = (d, e) => (M[1 + Dmap[d]] || [])[Emap[e]];    // D→E (sek)
        relevante.forEach(v => {
            const { D, vKlar, vFrist } = v._fi;
            const oD = osloD(D);
            if (oD == null) return;
            const treff = [];
            biler.forEach(p => {
                const E = String(p._ri.fra || '').trim();
                if (!E || p._ri.ank === null) return;
                if (!(p._ri.ank >= vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= vFrist)) return; // returbil i Oslo i tide
                const oE = osloE(E), dE = dToE(D, E);
                if (oE == null || dE == null) return;
                const omvei = (oD + dE - oE) / 60;
                if (omvei <= OMVEI_MAKS_MIN) treff.push({ pRow: p, ank: p._ri.ank, omvei: Math.max(0, Math.round(omvei)), sted: stedFraAdr(p._ri.fra) });
            });
            treff.sort((a, b) => a.omvei - b.omvei || a.ank - b.ank);
            v._treff = treff;
        });
    }

    /* ── Par to ventende direkte (når ingen returbil er mulig) ─ */
    // Begge hentes i Oslo og leveres med én bil. Gyldig par hvis seteplass holder, hentetidene
    // er nær hverandre, og omveien er liten: omvei = min(Oslo→Da + Da→Db, Oslo→Db + Db→Da) − lengste
    // enkeltur. Samme adresse → omvei 0.
    async function beregnPar(pool) {
        pool.forEach(v => v._par = []);
        if (pool.length < 2) return;
        const Dset = [], Dmap = {};
        pool.forEach(v => { const d = String((v.legs[0] || {}).til || '').trim(); if (d && Dmap[d] === undefined) { Dmap[d] = Dset.length; Dset.push(d); } });
        if (!Dset.length) return;
        const M = await hentMatrise(['Oslo'].concat(Dset), Dset);
        if (!M) return;
        const oslo = M[0] || [];
        const odD = d => oslo[Dmap[d]];                     // Oslo→D
        const dToD = (a, b) => (M[1 + Dmap[a]] || [])[Dmap[b]];  // Da→Db
        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                const a = pool[i], b = pool[j];
                const ta = parseTid((a.legs[0] || {}).opp || (a.legs[0] || {}).start);
                const tb = parseTid((b.legs[0] || {}).opp || (b.legs[0] || {}).start);
                if (ta === null || tb === null || Math.abs(ta - tb) > MATCH_TIDSVINDU_MIN) continue;
                const kap = kapasitetsSjekk([passObj(a), passObj(b)]);
                if (!kap.ok) continue;
                const Da = String((a.legs[0] || {}).til || '').trim();
                const Db = String((b.legs[0] || {}).til || '').trim();
                const oA = odD(Da), oB = odD(Db), ab = dToD(Da, Db), ba = dToD(Db, Da);
                if (oA == null || oB == null || ab == null || ba == null) continue;
                const omvei = (Math.min(oA + ab, oB + ba) - Math.max(oA, oB)) / 60;
                if (omvei <= PAR_OMVEI_MAKS_MIN) {
                    const m = Math.max(0, Math.round(omvei));
                    a._par.push({ medRow: b, omvei: m, sv: !!kap.svVarsel });
                    b._par.push({ medRow: a, omvei: m, sv: !!kap.svVarsel });
                }
            }
        }
        pool.forEach(v => v._par.sort((x, y) => x.omvei - y.omvei));
    }

    /* ── Fane ──────────────────────────────────────── */
    let win = null;

    function aapnePopup() {
        win = window.open('', 'OmraadeAssistent');
        if (!win) { alert('Tillat popup/faner for å bruke Område assistent.'); return; }
        win.document.open();
        win.document.write(
            '<!doctype html><html lang="no"><head><meta charset="utf-8">' +
            '<title>Område assistent</title><style>' +
            '*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif}' +
            'body{background:#0f172a;color:#e2e8f0;padding:22px;font-size:13px}' +
            '#rot{max-width:1100px;margin:0 auto}' +
            'h1{font-size:18px;margin-bottom:2px}.sub{color:#64748b;font-size:11px;margin-bottom:16px}' +
            '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
            '.kol{background:#1e293b;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column}' +
            '.kol h2{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:8px;display:flex;align-items:center;gap:8px}' +
            '.liste{overflow:auto;max-height:55vh}' +
            '.kort{background:#0f172a;border-radius:7px;padding:7px 9px;margin-bottom:6px;border-left:3px solid #334155}' +
            '.rad{display:flex;justify-content:space-between;gap:8px;align-items:center}' +
            '.tid{font-weight:700;color:#fbbf24}' +
            '.adr{color:#cbd5e1;font-size:12px;margin-top:2px}.navn{color:#94a3b8;font-size:11px;margin-top:2px}' +
            '.rt{color:#fbbf24;font-size:11px;margin-top:3px;font-weight:600}' +
            '.rt.urgent{color:#fecaca;background:#7f1d1d;border-radius:5px;padding:2px 6px;animation:puls 1.2s infinite}' +
            '@keyframes puls{0%,100%{opacity:1}50%{opacity:.55}}' +
            '.match{color:#86efac;font-size:11px;margin-top:3px;font-weight:600}' +
            '.ress{font-weight:700;color:#7dd3fc;font-size:13px}' +
            '.leg{font-size:12px;color:#cbd5e1;margin-top:3px;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}' +
            '.st{font-size:9px;color:#cbd5e1;background:#334155;border-radius:5px;padding:0 5px}' +
            '.b{font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;margin-left:4px}' +
            '.b.vent{background:#7c2d12;color:#fed7aa}.b.paga{background:#14532d;color:#bbf7d0}' +
            '.forslag{background:#052e16;border-left-color:#22c55e}.forslag .vei{color:#86efac;font-size:11px;margin-top:3px}' +
            '.gdtgl{font-size:10px;text-transform:none;letter-spacing:0;color:#94a3b8;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:3px}' +
            '.gdtgl input{cursor:pointer;margin:0}' +
            '.teller{background:#334155;border-radius:10px;padding:1px 8px;font-size:11px;color:#cbd5e1;margin-left:auto}' +
            '.tom{color:#475569;font-style:italic;padding:6px 0;font-size:12px}' +
            '.merk{cursor:pointer;border:none;border-radius:5px;width:18px;height:18px;font-size:10px;line-height:1;background:#334155;color:#1e293b;padding:0;margin-right:4px;vertical-align:middle}' +
            '.merk.paa{background:rgb(148,169,220);color:#0f172a}' +
            '.merk.mangler{background:#7f1d1d;color:#fecaca}' +
            '.velger{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}' +
            '.omr-btn{background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:10px;padding:14px 22px;font-size:15px;font-weight:600;cursor:pointer}' +
            '.omr-btn:hover{background:#334155;border-color:#0ea5e9}' +
            '.bytt{background:none;border:1px solid #334155;color:#94a3b8;border-radius:8px;padding:3px 10px;font-size:11px;cursor:pointer;margin-left:8px;vertical-align:middle}' +
            '.bytt:hover{color:#e2e8f0;border-color:#0ea5e9}' +
            '.bytt.frossen{color:#7dd3fc;border-color:#0ea5e9;background:#0c4a6e}' +
            '.bytt.autopaa{color:#bbf7d0;border-color:#16a34a;background:#14532d}' +
            '.bytt.autoav{color:#fecaca;border-color:#ef4444;background:#7f1d1d}' +
            '#kartwrap{position:fixed;inset:0;z-index:5}' +
            '#kartDiv{position:absolute;inset:0;background:#0b1220}' +
            '.kartpanel{position:absolute;top:64px;bottom:14px;width:300px;overflow:auto;background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:10px;padding:9px;z-index:1000}' +
            '.kartpanel.venstre{left:14px}.kartpanel.hoyre{right:14px}' +
            '.kartpanel h3{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:7px;display:flex;gap:6px;align-items:center}' +
            '.kk{background:#0f172a;border-radius:6px;padding:5px 8px;margin-bottom:5px;border-left:5px solid #334155;font-size:11px;cursor:pointer}' +
            '.kk:hover{background:#1e293b}.kk .t{font-weight:700;color:#fbbf24}.kk .n{color:#f1f5f9;font-weight:600}' +
            '.kk .kkr{display:flex;justify-content:space-between;align-items:center;gap:6px}' +
            '.kk .kksub{color:#cbd5e1;font-size:10px;margin-top:1px}' +
            '.kk .kkmeta{font-size:10px;margin-top:2px;display:flex;gap:5px;align-items:center;flex-wrap:wrap;color:#94a3b8}' +
            '.kk .kkmeta.urg{color:#fecaca;font-weight:600}' +
            '.kk .kst{font-size:9px;color:#94a3b8;white-space:nowrap;flex-shrink:0}.kk .kst.kjort{color:#6ee7b7}' +
            '.karttopp{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(15,23,42,.92);border:1px solid #334155;border-radius:10px;padding:7px 14px;display:flex;align-items:center;gap:12px;font-size:12px;color:#e2e8f0}' +
            '.karttopp input[type=range]{width:180px;accent-color:#0ea5e9}' +
            '.karttopp select{background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:5px;padding:2px 5px;font-size:11px}' +
            '.karttopp label{display:inline-flex;align-items:center;gap:4px;cursor:pointer}' +
            '.leaflet-container{background:#0b1220}' +
            '</style></head><body><div id="rot"><p class="tom">Henter…</p></div></body></html>'
        );
        win.document.close();
    }

    function merkKnapp(resId) {
        return '<button class="merk' + (erMerket(resId) ? ' paa' : '') + '" data-merk="' + esc(resId) + '" title="Merk i NISSY (blå)">●</button>';
    }
    function statusBadge(r) {
        return r.fane === 'ventendeOppdrag' ? '<span class="b vent">VENT</span>' : '<span class="b paga">PÅGÅ</span>';
    }
    function legLinje(l) {
        return '<div class="leg"><span class="tid">' + esc(l.opp || l.start || '–') + '</span>' +
            '<span>' + esc(l.fra || '?') + ' →<br>' + esc(l.til || '?') + '</span>' +
            (l.status ? '<span class="st">' + esc(l.status) + '</span>' : '') + '</div>';
    }
    function kildeTag(r) {
        if (aktivKilder.length <= 1) return '';
        const d = delomraade(r);
        if (!d.navn) return '';
        return '<span class="b" style="background:' + d.farge + '33;color:' + d.farge + '">' + esc(d.navn) + '</span>';
    }
    function radKort(r) {
        const farge = delomraade(r).farge || '#334155';
        if (r.ressurs) {
            const navnliste = Array.from(new Set(r.legs.map(l => l.pnavn).filter(Boolean))).join(', ');
            const sted = stedFraAdr(returInfo(r).fra);
            const turRetur = erTurRetur(r);
            const base = egneReturPassasjerer(r);
            const ledig = ledigePlasser(base);             // restkapasitet på returen
            const { tatt, avvist, sv } = fyllBil(base, (bilMatchMap[r.resId] || []).slice());
            const merk = k => merkKnapp(k.v.resId) + ' ' + esc(stedFraAdr((k.v.legs[0] || {}).til) || (k.v.legs[0] || {}).pnavn || '?') + ' ' + behovBadges(k.v) + ledsBadge(k.v);
            const plassKlasse = ledig === 0 ? 'rt' : 'match';
            const plassLinje = '<div class="' + plassKlasse + '">↩ retur: ' + ledig + ' av ' + MAKS.passasjerer + ' plasser ledig'
                + (tatt.length ? ' · tar ' + tatt.map(merk).join(' · ') : '')
                + (sv ? ' · ⚠ krever SV (ekstra bagasjeplass)' : '') + '</div>'
                + (avvist.length ? '<div class="rt">⚠ ikke plass: ' + avvist.map(merk).join(' · ') + '</div>' : '');
            // Tur/retur: pasienten blir i bilen på returen → vis behov/ledsager (opptar seter).
            const innInfo = turRetur ? behovBadges(r) + ledsBadge(r) : '';
            const trBadge = turRetur ? '<span class="b" title="Tur/retur samme bil — pasienten kjører tilbake; kun restkapasitet er ledig" style="background:#33415588;color:#fbbf24">🔁 tur/retur</span>' : '';
            return '<div class="kort" style="border-left-color:' + farge + (ledig === 0 ? ';opacity:.6' : '') + '">' +
                '<div class="rad"><span class="ress">🚐 ' + esc(r.ressurs) + (sted ? ' – ' + esc(sted) : '') + '</span>' +
                '<span>' + merkKnapp(r.resId) + innInfo + trBadge + kildeTag(r) + statusBadge(r) + '</span></div>' +
                r.legs.map(legLinje).join('') +
                (navnliste ? '<div class="navn">' + esc(navnliste) + '</div>' : '') +
                plassLinje +
                '</div>';
        }
        const l0 = r.legs[0] || {};
        const venteMin = Math.max((r._rt ? r._rt.sek / 60 : 0), VENTETID_MIN);
        const Tmin = parseTid(l0.opp || l0.start);
        const fristMin = Tmin !== null ? Tmin + venteMin : null;        // hentes innen
        const sendUtMin = fristMin !== null ? fristMin - VARSEL_MIN : null; // frist for utsendelse
        const urgent = sendUtMin !== null && naaMin() >= sendUtMin;
        const rtLinje = '<div class="rt' + (urgent ? ' urgent' : '') + '">' + (urgent ? '🔔 ' : '⏱ ')
            + (r._rt ? 'reisetid ' + esc(r._rt.tekst) : 'ventetid ' + fmtMin(venteMin))
            + (fristMin !== null ? ' · hentes innen ' + tidStr(fristMin) + ' · send ut ' + tidStr(sendUtMin) : '')
            + (urgent ? ' — SEND UT' : '') + '</div>';
        const _tr = synligeTreff(r);
        const matchLinje = _tr.length
            ? '<div class="match">🔗 ' + _tr.slice(0, 3).map(t => merkKnapp(t.pRow.resId) + ' '
                + (t.pRow.ressurs ? esc(t.pRow.ressurs) : 'bil') + (t.sted ? ' (' + esc(t.sted) + ')' : '')
                + ' ank ' + tidStr(t.ank) + (t.omvei ? ' · +' + t.omvei + ' min' : '')).join(' · ') + '</div>'
            : '';
        return '<div class="kort" style="border-left-color:' + farge + '">' +
            '<div class="rad"><span class="tid">' + esc(l0.opp || l0.start || '–') + '</span>' +
            '<span>' + merkKnapp(r.resId) + behovBadges(r) + ledsBadge(r) + kildeTag(r) + statusBadge(r) + '</span></div>' +
            '<div class="adr">' + esc(l0.fra || '?') + ' →<br>' + esc(l0.til || '?') + '</div>' +
            (l0.pnavn ? '<div class="navn">' + esc(l0.pnavn) + (l0.rmate && !/^TAX$/i.test(l0.rmate.trim()) ? ' · ' + esc(l0.rmate) : '') + '</div>' : '') +
            rtLinje + matchLinje +
            '</div>';
    }

    // Berik ved skann: reisetid per ventende + omvei-forslag (Google). Kun her, ikke ved 30s-re-rendring.
    async function berik(data) {
        const utVent = dedupResId(data.ut).filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r));
        const innPaga = dedupResId(data.inn).filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r));
        utVent.forEach(r => { r._treff = []; r._par = []; });
        // Match kun mot biler som kommer til vårt område (kan plukke opp der) OG har ledig plass
        // på returen (alenebil/full tur/retur = 0). Turer som aldri når området er irrelevante.
        const matchBiler = innPaga.filter(r => kommerTilOmraadet(r) && ledigePlasser(egneReturPassasjerer(r)) > 0);
        matchBiler.forEach(p => p._ri = returInfo(p));
        // GROVFILTER (uten reisetid): kun ventende som tidsmessig kan møte en returbil. Av
        // hundrevis ventende er som regel bare en håndfull aktuelle nå — vi slipper å regne
        // reisetid + omvei-matrise for alle (som ga Google-timeout/500).
        const kandidater = utVent.filter(v => {
            const vl = v.legs[0] || {};
            const vKlar = parseTid(vl.opp || vl.start);
            if (vKlar === null || !String(vl.til || '').trim()) return false;
            return matchBiler.some(p => p._ri.ank !== null && p._ri.fra &&
                p._ri.ank >= vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= vKlar + MAKS_VENTETID_MIN);
        });
        // Reisetid kun for kandidatene (presist tidsvindu + omvei avgjøres så i beregnForslag).
        await Promise.all(kandidater.map(async r => { const l = r.legs[0] || {}; r._rt = await hentReisetid(l.fra, l.til); }));
        await beregnForslag(kandidater, matchBiler);

        // FALLBACK — ventende↔ventende: finn par i samme retning for de som IKKE fikk returbil.
        // (Returbil er gratis retur og prioriteres; direkte paring sparer i det minste én bil.)
        const naa = naaMin();
        let parPool = utVent.filter(v => {
            if (synligeTreff(v).length) return false;  // har (synlig) returbil-forslag → håndtert
            const t = parseTid((v.legs[0] || {}).opp || (v.legs[0] || {}).start);
            return t !== null && String((v.legs[0] || {}).til || '').trim() && t >= naa - 30 && t <= naa + PAR_VINDU_MIN;
        });
        parPool.sort((a, b) => (parseTid((a.legs[0] || {}).opp || (a.legs[0] || {}).start)) - (parseTid((b.legs[0] || {}).opp || (b.legs[0] || {}).start)));
        if (parPool.length > PAR_MAKS) parPool = parPool.slice(0, PAR_MAKS);
        await beregnPar(parPool);
    }

    /* ── Frys / autooppdater ──────────────────────────── */
    function erFrosset() { return Date.now() < frysTil; }
    function oppdaterKnapper() {
        if (!win || win.closed) return;
        const frosset = erFrosset();
        const fb = win.document.getElementById('frysBtn');
        if (fb) {
            fb.textContent = frosset ? '❄️ Frys (' + Math.ceil((frysTil - Date.now()) / 1000) + 's)' : '❄️ Frys ' + (FRYS_MS / 1000) + 's';
            fb.classList.toggle('frossen', frosset);
        }
        const ab = win.document.getElementById('autoBtn');
        if (ab) {
            ab.classList.toggle('autoav', frosset);
            ab.classList.toggle('autopaa', !frosset);
        }
    }
    function frysNa() { frysTil = Date.now() + FRYS_MS; oppdaterKnapper(); }   // (re)start 60 s
    function startAuto() { frysTil = 0; oppdaterKnapper(); tikk(); }           // gjenoppta straks + frisk skann

    function render(data) {
        if (!win || win.closed) return;
        const utD = dedupResId(data.ut);
        const innD = dedupResId(data.inn);
        const utVent = utD.filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r));
        // Kun returbiler hvis tur ender i vårt område (kjørekontorets postnr-soner). Turer som
        // aldri når området (f.eks. Jessheim↔Gjøvik — Innlandet kjørekontor) hører ikke hjemme.
        const innPaga = innD.filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r) && !(skjulGD && erGD(r)) && kommerTilOmraadet(r));
        const helse = dedupResId([].concat(data.ut, data.inn)).filter(erHlsx);

        const forslag = utVent.filter(r => synligeTreff(r).length);

        // Reverse-kobling: hvilke ventende kan hver returbil ta — grunnlag for plass-beregning.
        bilMatchMap = {};
        utVent.forEach(v => synligeTreff(v).forEach(t => {
            const id = t.pRow.resId;
            (bilMatchMap[id] = bilMatchMap[id] || []).push({ v, t });
        }));

        // Ventende-par (samkjør to direkte) — dedup a↔b, kun par der begge fortsatt mangler returbil.
        const parSett = new Set(), parListe = [];
        utVent.forEach(v => (v._par || []).forEach(p => {
            if (synligeTreff(v).length || synligeTreff(p.medRow).length) return;  // én fikk returbil → dropp paret
            const key = [v.resId, p.medRow.resId].sort().join('|');
            if (parSett.has(key)) return; parSett.add(key);
            parListe.push({ a: v, b: p.medRow, omvei: p.omvei, sv: p.sv });
        }));
        parListe.sort((x, y) => x.omvei - y.omvei);

        const tidR = r => parseTid((r.legs[0] || {}).opp || (r.legs[0] || {}).start) ?? 9999;
        utVent.sort((a, b) => tidR(a) - tidR(b));
        innPaga.sort((a, b) => tidR(a) - tidR(b));
        const naa = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });

        const liste = arr => arr.length ? arr.map(radKort).join('') : '<div class="tom">Ingen.</div>';
        const forslagKort = v =>
            '<div class="kort forslag">' +
            '<div class="rad"><span class="tid">' + esc((v.legs[0] || {}).opp || (v.legs[0] || {}).start || '–') + ' ' + esc((v.legs[0] || {}).pnavn || 'Ventende') + ' → ' + esc((v.legs[0] || {}).til || '?') + '</span>' +
            '<span>' + merkKnapp(v.resId) + '</span></div>' +
            synligeTreff(v).slice(0, 4).map(t => '<div class="vei">' + merkKnapp(t.pRow.resId) + ' ' +
                (t.pRow.ressurs ? '🚐 ' + esc(t.pRow.ressurs) : 'bil') + (t.sted ? ' (' + esc(t.sted) + ')' : '') +
                ' ank ' + tidStr(t.ank) + (t.omvei ? ' · +' + t.omvei + ' min omvei' : '') + '</div>').join('') +
            '</div>';
        const parRad = v => '<div class="rad"><span class="tid">' + esc((v.legs[0] || {}).opp || (v.legs[0] || {}).start || '–') + ' '
            + esc((v.legs[0] || {}).pnavn || 'Ventende') + ' → ' + esc(stedFraAdr((v.legs[0] || {}).til) || (v.legs[0] || {}).til || '?')
            + ' ' + behovBadges(v) + ledsBadge(v) + '</span><span>' + merkKnapp(v.resId) + '</span></div>';
        const parKort = p => '<div class="kort forslag">' + parRad(p.a) + parRad(p.b)
            + '<div class="vei">🔗 samme retning · +' + p.omvei + ' min omvei' + (p.sv ? ' · ⚠ krever SV (ekstra bagasjeplass)' : '') + '</div></div>';

        const html =
            '<h1>🧭 Område assistent – ' + esc(aktivNavn) + ' <button class="bytt autopaa" id="autoBtn" title="Gjenoppta auto-oppdatering straks">🔄 Autooppdater</button> <button class="bytt" id="frysBtn" title="Pause auto-oppdatering (trykk igjen for nye 60 s)">❄️ Frys ' + (FRYS_MS / 1000) + 's</button> <button class="bytt" id="kartBtn" title="Vis turene på kart">🗺️ Kart</button> <button class="bytt" id="byttOmr">↩ Bytt område</button></h1>' +
            '<div class="sub">v' + VERSJON + ' · oppdatert ' + naa + ' · inn ' + esc(aktivInn) + ' / ut ' + esc(aktivUt) + (aktivKilder.length > 1 ? ' · soner: ' + esc(aktivKilder.map(k => k.navn).join('+')) : '') + '</div>' +
            '<div class="grid">' +
                '<div class="kol"><h2>⬆️ Turer på vei ut <span class="teller">' + utVent.length + '</span></h2>' +
                '<div class="liste">' + liste(utVent) + '</div></div>' +
                '<div class="kol"><h2>🚐 Returbiler <label class="gdtgl"><input type="checkbox" id="skjulGD"' + (skjulGD ? ' checked' : '') + '> skjul GD/ST</label> <span class="teller">' + innPaga.length + '</span></h2>' +
                '<div class="liste">' + liste(innPaga) + '</div></div>' +
            '</div>' +
            '<div class="kol" style="margin-top:16px"><h2>💡 Forslag – returbil <span class="teller">' + forslag.length + '</span></h2>' +
            '<div class="liste">' + (forslag.length ? forslag.map(forslagKort).join('') : '<div class="tom">Ingen match nå.</div>') + '</div></div>' +
            '<div class="kol" style="margin-top:16px"><h2>🔗 Samkjør to ventende <span class="teller">' + parListe.length + '</span></h2>' +
            '<div class="sub" style="margin:-4px 0 8px">Når ingen returbil passer — to ventende i samme retning på én bil.</div>' +
            '<div class="liste">' + (parListe.length ? parListe.map(parKort).join('') : '<div class="tom">Ingen par nå.</div>') + '</div></div>' +
            '<div id="helse-skjult" style="display:none">' + liste(helse) + '</div>';

        win.document.getElementById('rot').innerHTML = html;

        win.document.querySelectorAll('button.merk').forEach(btn => {
            btn.onclick = () => {
                const res = toggleMerk(btn.dataset.merk);
                if (res === 'mangler') {
                    btn.classList.add('mangler');
                    btn.title = 'Ikke synlig i planleggeren';
                    setTimeout(() => btn.classList.remove('mangler'), 1500);
                } else {
                    btn.classList.toggle('paa', res === 'paa');
                }
            };
        });
        const bo = win.document.getElementById('byttOmr');
        if (bo) bo.onclick = visVelger;
        const fb = win.document.getElementById('frysBtn');
        if (fb) fb.onclick = frysNa;
        const ab = win.document.getElementById('autoBtn');
        if (ab) ab.onclick = startAuto;
        oppdaterKnapper();
        const gd = win.document.getElementById('skjulGD');
        if (gd) gd.onchange = () => { skjulGD = gd.checked; if (sisteData) render(sisteData); };
        const kb = win.document.getElementById('kartBtn');
        if (kb) kb.onclick = () => setKartMode(true);
    }

    /* ── Kartmodus (Leaflet + Kartverket + ORS-ruter) ── */
    // Stabil farge per tur (hash av resId → hue), så fargen ikke hopper mellom oppdateringer.
    function fargeForTur(id) { let h = 0; const s = String(id || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return 'hsl(' + h + ',85%,60%)'; }
    // Kuratert palett av distinkte, lett-navngivbare farger (rosa, lilla, mørkegrønn, lyseblå osv.)
    // — tildeles sekvensielt til synlige turer i hver render, så hver får en unik farge. Leder med
    // de mest distinkte; rekkefølgen veksler mellom fargefamilier så naboer ser ulike ut.
    const KART_PALETT = [
        '#dc2626', // rød
        '#2563eb', // blå
        '#16a34a', // grønn
        '#ea580c', // oransje
        '#7c3aed', // lilla
        '#db2777', // rosa
        '#0d9488', // turkis
        '#854d0e', // brun
        '#0ea5e9', // lyseblå
        '#166534', // mørkegrønn
        '#be185d', // magenta
        '#ca8a04', // gul/amber
        '#1e3a8a', // mørkeblå
        '#9f1239', // vinrød
        '#65a30d', // oliven
        '#334155', // skifer
    ];
    function lastLeaflet() {
        return new Promise(res => {
            if (win.L) return res(true);
            const css = win.document.createElement('link');
            css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            win.document.head.appendChild(css);
            const js = win.document.createElement('script');
            js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            js.onload = () => res(true);
            js.onerror = () => res(false);
            win.document.head.appendChild(js);
        });
    }
    async function hentRute(fra, til) {
        const key = fra + '|' + til;
        if (_ruteCache[key] !== undefined) return _ruteCache[key];
        const ls = lsLes('omr_ru_' + key, 7 * _LS_DAG);
        if (ls !== undefined) { _ruteCache[key] = ls; return ls; }
        try {
            const r = await fetch(SERVER + '/ruter.php?fra=' + encodeURIComponent(fra) + '&til=' + encodeURIComponent(til));
            const j = await r.json();
            _ruteCache[key] = j.ok ? j : null;
            if (j.ok) lsSkriv('omr_ru_' + key, j);
        } catch (e) { _ruteCache[key] = null; }
        return _ruteCache[key];
    }
    const _koordCache = {};
    async function hentKoord(adr) {
        if (!adr) return null;
        if (_koordCache[adr] !== undefined) return _koordCache[adr];
        const ls = lsLes('omr_kd_' + adr, 30 * _LS_DAG);
        if (ls !== undefined) { _koordCache[adr] = ls; return ls; }
        try {
            const r = await fetch(SERVER + '/geokod.php?adr=' + encodeURIComponent(adr));
            const j = await r.json();
            _koordCache[adr] = j.ok ? [j.lat, j.lon] : null;
            if (j.ok) lsSkriv('omr_kd_' + adr, _koordCache[adr]);
        } catch (e) { _koordCache[adr] = null; }
        return _koordCache[adr];
    }
    function setKartMode(b) {
        kartMode = b;
        if (!b && kart) { try { kart.remove(); } catch (e) {} kart = null; kartLag = null; }
        if (sisteData) { if (b) visKart(sisteData); else render(sisteData); }
    }
    // Synlige ventende: kun øvre grense (hentetid ≤ nå + vinduMin). Ingen nedre grense —
    // forfalte ventende forsvinner fra lista når de sendes ut, så de som står igjen venter ennå.
    function synligeIVindu(utVent) {
        const naa = naaMin();
        return utVent.filter(v => {
            const t = parseTid((v.legs[0] || {}).opp || (v.legs[0] || {}).start);
            return t !== null && String((v.legs[0] || {}).til || '').trim() && t <= naa + vinduMin;
        }).sort((a, b) => (parseTid((a.legs[0] || {}).opp) ?? 9999) - (parseTid((b.legs[0] || {}).opp) ?? 9999)).slice(0, 60);
    }
    async function visKart(data) {
        if (!win || win.closed) return;
        const ok = await lastLeaflet();
        const L = win.L;
        if (!ok || !L) { win.document.getElementById('rot').innerHTML = '<p class="tom">Kunne ikke laste kart (Leaflet).</p>'; return; }
        if (!win.document.getElementById('kartDiv')) {
            win.document.getElementById('rot').innerHTML =
                '<div id="kartwrap"><div id="kartDiv"></div>' +
                '<div class="karttopp">🗺️ <b>' + esc(aktivNavn) + '</b>' +
                ' · vindu <input type="range" id="kartVindu" min="30" max="360" step="15" value="' + vinduMin + '">' +
                ' <span id="kartVinduTxt">' + vinduMin + ' min</span>' +
                ' · <select id="kartBasis">' + Object.keys(BASISKART).map(k => '<option value="' + k + '"' + (k === kartBasis ? ' selected' : '') + '>' + BASISKART[k].navn + '</option>').join('') + '</select>' +
                ' · 🚐 <select id="kartRet"><option value="punkt"' + (returVis === 'punkt' ? ' selected' : '') + '>punkt</option><option value="rute"' + (returVis === 'rute' ? ' selected' : '') + '>kjørerute</option></select>' +
                ' <button class="bytt" id="kartListe">📋 Liste</button></div>' +
                '<div class="kartpanel venstre"><h3>⬆️ På vei ut <span id="kartUtN" class="teller"></span></h3><div id="kartUt"></div></div>' +
                '<div class="kartpanel hoyre"><h3>🚐 Returbiler <span id="kartInnN" class="teller"></span></h3><div id="kartInn"></div></div>' +
                '</div>';
            kart = L.map('kartDiv', { zoomControl: true, attributionControl: false }).setView([60.4, 10.6], 8);
            basisLag = L.tileLayer(BASISKART[kartBasis].url, { maxZoom: 18, subdomains: 'abcd' }).addTo(kart);
            casingLag = L.layerGroup().addTo(kart);   // halo under rutene
            kartLag = L.layerGroup().addTo(kart);     // fargede ruter (over)
            const sl = win.document.getElementById('kartVindu');
            sl.oninput = () => { vinduMin = +sl.value; win.document.getElementById('kartVinduTxt').textContent = vinduMin + ' min'; if (sisteData) oppdaterKartLag(sisteData); };
            win.document.getElementById('kartListe').onclick = () => setKartMode(false);
            win.document.getElementById('kartRet').onchange = e => { returVis = e.target.value; if (sisteData) oppdaterKartLag(sisteData); };
            win.document.getElementById('kartBasis').onchange = e => {
                kartBasis = e.target.value;
                if (basisLag) kart.removeLayer(basisLag);
                basisLag = L.tileLayer(BASISKART[kartBasis].url, { maxZoom: 18, subdomains: 'abcd' }).addTo(kart);
                basisLag.bringToBack();
                if (sisteData) oppdaterKartLag(sisteData);
            };
        }
        oppdaterKartLag(data);
    }
    async function oppdaterKartLag(data) {
        if (!win || win.closed || !kart || !win.L) return;
        const L = win.L;
        kartLag.clearLayers();
        casingLag.clearLayers();
        const casing = (BASISKART[kartBasis] || {}).casing || 'rgba(0,0,0,.5)';
        const utVent = synligeIVindu(dedupResId(data.ut).filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r)));
        const innPaga = dedupResId(data.inn).filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r) && !(skjulGD && erGD(r)) && kommerTilOmraadet(r));
        win.document.getElementById('kartUtN').textContent = utVent.length;
        win.document.getElementById('kartInnN').textContent = innPaga.length;
        // Tildel distinkt palett-farge sekvensielt til de synlige turene (unik per tur i vinduet).
        const fargeMap = {}; let _fi = 0;
        utVent.concat(innPaga).forEach(r => { fargeMap[r.resId] = KART_PALETT[_fi++ % KART_PALETT.length]; });
        const turFarge = r => fargeMap[r.resId] || fargeForTur(r.resId);
        // Panel-kort (status høyrestilt — relevant for returbiler: Startet/Framme/Tildelt)
        const startet = s => /startet|avslut|ferdig|fullf|levert/i.test(s);
        const passAntall = r => 1 + (parseInt(r._ledsN, 10) || 0);
        // Kompakt 2–4-linjers kort med alle opplysninger (kartet kan erstatte listene).
        const kort = (r, farge, rolle) => {
            const l0 = r.legs[0] || {};
            const tid = esc(l0.opp || l0.start || '–');
            const beh = behovBadges(r);
            let navn, sub, status, meta, frist = '';
            if (rolle === 'ut') {
                navn = esc(l0.pnavn || '');
                sub = esc(stedFraAdr(l0.fra) || l0.fra || '?') + ' → ' + esc(stedFraAdr(l0.til) || l0.til || '?');
                status = 'Vent';
                meta = (beh ? beh + ' ' : '') + passAntall(r) + ' pass.';
                const Tmin = parseTid(l0.opp || l0.start);
                const venteMin = Math.max((r._rt ? r._rt.sek / 60 : 0), VENTETID_MIN);
                const fristMin = Tmin !== null ? Tmin + venteMin : null;
                const sendUtMin = fristMin !== null ? fristMin - VARSEL_MIN : null;
                const urgent = sendUtMin !== null && naaMin() >= sendUtMin;
                if (fristMin !== null) frist = '<div class="kkmeta' + (urgent ? ' urg' : '') + '">' + (urgent ? '🔔 ' : '⏱ ') + 'hentes ' + tidStr(fristMin) + ' · send ut ' + tidStr(sendUtMin) + '</div>';
            } else {
                const ri = returInfo(r);
                navn = esc(r.ressurs || '');
                sub = esc(stedFraAdr(ri.fra) || ri.fra || '?');
                status = returStatus(r);
                meta = '↩ ' + ledigePlasser(egneReturPassasjerer(r)) + '/' + MAKS.passasjerer + ' ledig' + (erTurRetur(r) ? ' 🔁' : '') + (beh ? ' ' + beh : '');
            }
            return '<div class="kk" data-res="' + esc(r.resId) + '" style="border-left-color:' + farge + '">' +
                '<div class="kkr"><span><span class="t">' + tid + '</span> <span class="n">' + navn + '</span></span>' +
                (status ? '<span class="kst' + (startet(status) ? ' kjort' : '') + '">' + esc(status) + '</span>' : '') + '</div>' +
                '<div class="kksub">' + sub + '</div>' +
                (meta ? '<div class="kkmeta">' + meta + '</div>' : '') + frist + '</div>';
        };
        win.document.getElementById('kartUt').innerHTML = utVent.map(r => kort(r, turFarge(r), 'ut')).join('') || '<div class="tom">Ingen i vinduet.</div>';
        win.document.getElementById('kartInn').innerHTML = innPaga.map(r => kort(r, turFarge(r), 'inn')).join('') || '<div class="tom">Ingen.</div>';
        const ruteLag = {};
        // Klikk på kort → zoom til ruta (polyline) eller punktet (returbil-markør)
        win.document.querySelectorAll('#kartwrap .kk').forEach(el => el.onclick = () => {
            const lag = ruteLag[el.dataset.res]; if (!lag) return;
            if (lag.getBounds) kart.fitBounds(lag.getBounds(), { padding: [40, 40] });
            else if (lag.getLatLng) kart.setView(lag.getLatLng(), 11);
        });
        // Tegn ventende-ruter (hel) og returbil-ruter (stiplet)
        const tegn = async (r, fra, til, stiplet) => {
            const rute = await hentRute(fra, til);
            if (!rute || !rute.geometri || !kart) return;
            const farge = turFarge(r);
            // Halo under (gjør ruta synlig på alle bakgrunner)
            L.polyline(rute.geometri, { color: casing, weight: stiplet ? 6 : 9, opacity: 0.9, lineCap: 'round' }).addTo(casingLag);
            const pl = L.polyline(rute.geometri, { color: farge, weight: stiplet ? 3.5 : 5.5, opacity: 1, lineCap: 'round', dashArray: stiplet ? '10,8' : null });
            pl.addTo(kartLag);
            L.circleMarker(rute.til, { radius: 6, color: '#fff', weight: 2, fillColor: farge, fillOpacity: 1 }).addTo(kartLag);
            ruteLag[r.resId] = pl;
        };
        utVent.forEach(r => tegn(r, (r.legs[0] || {}).fra, (r.legs[0] || {}).til, false));
        // Returbiler: punkt (markør der bilen kommer fra) eller kjørerute (stiplet) — velges i topplinja.
        innPaga.forEach(async r => {
            const ri = returInfo(r);
            if (returVis === 'rute') {
                const osloBen = (r.legs || []).find(l => erVaartOmraade(l.til));
                tegn(r, ri.fra, osloBen ? osloBen.til : 'Oslo', true);
                return;
            }
            const ll = await hentKoord(ri.fra);
            if (!ll || !kart) return;
            const farge = turFarge(r);
            const m = L.marker(ll, { icon: L.divIcon({ className: 'retmark', iconSize: [20, 20], iconAnchor: [10, 10],
                html: '<div style="position:relative;width:20px;height:20px"><div style="width:20px;height:20px;border-radius:50%;background:' + farge + ';opacity:.9;border:2px solid #fff;box-shadow:0 0 3px #000"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px">🚐</div></div>' }) });
            m.bindTooltip('🚐 ' + esc(r.ressurs || '') + ' – ' + esc(stedFraAdr(ri.fra) || ''), { direction: 'top' });
            m.addTo(kartLag);
            ruteLag[r.resId] = m;
        });
    }

    /* ── Område-velger ─────────────────────────────── */
    function visVelger() {
        if (!win || win.closed) return;
        if (pollIv) { clearInterval(pollIv); pollIv = null; }
        if (visIv) { clearInterval(visIv); visIv = null; }
        if (frysIv) { clearInterval(frysIv); frysIv = null; }
        frysTil = 0;
        sisteData = null;
        const knapper = OMRAADER.map((o, i) =>
            '<button class="omr-btn" data-idx="' + i + '">' + esc(o.navn) + '</button>'
        ).join('');
        win.document.getElementById('rot').innerHTML =
            '<h1>🧭 Område assistent</h1><div class="sub">Velg område</div>' +
            '<div class="velger">' + (knapper || '<div class="tom">Ingen områder konfigurert.</div>') + '</div>';
        win.document.querySelectorAll('.omr-btn').forEach(b => {
            b.onclick = () => velgOmraade(+b.dataset.idx);
        });
    }

    async function velgOmraade(idx) {
        const o = OMRAADER[idx];
        if (!o) return;
        aktivNavn = o.navn; aktivInn = o.inn; aktivUt = o.ut; aktivKilder = o.kilder || [];
        if (win && !win.closed) win.document.getElementById('rot').innerHTML = '<p class="tom">Henter ' + esc(o.navn) + '…</p>';
        await lastOmraade();  // sikre at kontorets område-soner er lastet (live fra NISSY-senter)
        // Hent destinasjons-postnr-sett per sone (for farge etter postnr i kombinert visning)
        if (aktivKilder.length > 1) { try { await Promise.all(aktivKilder.map(lastKildePostnr)); } catch (e) {} }
        tikk();
        if (pollIv) clearInterval(pollIv);
        pollIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(pollIv); pollIv = null; return; }
            tikk();
        }, POLL_MS);
        // Lett re-rendring (cachet data) for at hente-frist/«send ut»-varsel oppdateres ofte
        if (visIv) clearInterval(visIv);
        visIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(visIv); visIv = null; return; }
            if (sisteData && !erFrosset()) { if (kartMode) oppdaterKartLag(sisteData); else render(sisteData); }
        }, 30000);
        // Nedtelling for frys-knappen; frisk oppdatering når frysen akkurat tinte.
        if (frysIv) clearInterval(frysIv);
        let varFrosset = false;
        frysIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(frysIv); frysIv = null; return; }
            const nu = erFrosset();
            if (varFrosset && !nu) tikk();
            varFrosset = nu;
            oppdaterKnapper();
        }, 1000);
        console.log('[' + NAVN + '] område valgt: ' + o.navn + ' (' + aktivKilder.map(k => k.navn).join('+') + ')');
    }

    /* ── Poll-loop ─────────────────────────────────── */
    let kjorer = false;
    async function tikk() {
        if (kjorer || !win || win.closed || !aktivUt || erFrosset()) return;
        kjorer = true;
        try {
            const data = await scan();
            sisteData = data;
            console.log('[' + NAVN + '] skann: inn=' + data.inn.length + ', ut=' + data.ut.length);
            await berik(data);
            if (kartMode) await visKart(data); else render(data);
        } catch (e) {
            console.warn('[' + NAVN + '] skann-feil:', e.message);
        } finally { kjorer = false; }
    }

    function start() {
        aapnePopup();
        if (!win) return;
        const auto = byggOmraaderFraSelect();
        if (auto.length) { OMRAADER = auto; console.log('[' + NAVN + '] auto-paret ' + auto.length + ' områder: ' + auto.map(o => o.navn + '(ut ' + o.ut + (o.kilder.length > 1 ? ', soner ' + o.kilder.map(k => k.ut).join('+') : '') + ')').join(', ')); }
        else console.log('[' + NAVN + '] fant ingen filter-par — bruker fallback-liste');
        visVelger();
        console.log('[' + NAVN + ' v' + VERSJON + '] aktiv — velg område');
    }

    window.__omraadeAssistent = { versjon: VERSJON, scan, beregnForslag };
    start();
})();
