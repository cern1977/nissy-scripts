// === WESTBYS VERKTØYKASSE — REKVISISJONS-AGENT (DEV) v1.39-dev ===
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
    const VERSJON = '1.39-dev';
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
    function planleggDekorasjon() {
        if (rafPlanlagt !== null) return;
        rafPlanlagt = requestAnimationFrame(() => {
            rafPlanlagt = null;
            dekorerHeader();
            dekorerRekvisisjonsListen();
            dekorerSpesielleBehov();
            fargeLaasteBehov();
            lagKalender();
        });
    }
    const datoObs = new MutationObserver(planleggDekorasjon);
    datoObs.observe(document.body, { childList: true, subtree: true });
    dekorerHeader();
    dekorerRekvisisjonsListen();
    dekorerSpesielleBehov();
    fargeLaasteBehov();
    lagKalender();

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
