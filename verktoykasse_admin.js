// === WESTBYS VERKTØYKASSE — ADMIN-AGENT v1.2 ===
// v1.2: fiks — admin-headeren har EKTE pasienttransport_admin.gif <img> (ikke NISSYlogo-background); merket
//       legges nå inline etter logoen (v1.1-selektoren fant ingen TD → ingen overskrift).
// v1.1: "med superkrefter"-merke på PASIENTREISER-headeren (speiler rekvisisjonsmodulen) — signaliserer at
//       admin-agenten er aktiv. dekorerHeader() ved init + hvert 3. sek (re-påfør ved NISSY re-render).
// Headless agent for /administrasjon/-modulen. Triangel-keeper:
// planlegger ↔ rekvisisjon ↔ admin holder hverandre levende via mutual-keeper.
//
// Skjelett — ingen admin-jobber implementert ennå. Når vi senere flytter
// PNR-/telefon-oppslag fra planlegger-verktøykassen til admin-agent, fylles
// utforJobb inn.
(function () {
    const VERSJON = '1.6';
    const KILDE = 'prod';
    const NAVN = 'VKT-ADMIN';
    const MODUL = 'admin';
    const FIL = 'verktoykasse_admin.js';
    const FLAG = '__vkt_admin_agent';
    const PATH_PREFIX = '/administrasjon/';
    const JOBS_URL = 'https://thomaswestby.no/skript/nissy_jobs.php';
    const POLL_MS = 3000;

    if (window[FLAG]) {
        console.log(`[${NAVN}] allerede lastet`);
        return;
    }
    window[FLAG] = VERSJON;

    if (!/\/administrasjon\//.test(location.pathname)) {
        console.warn(`[${NAVN}] kjøres utenfor /administrasjon/ — er du i riktig fane?`);
    }

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
        return '';
    }

    async function utforJobb(parametre) {
        throw new Error(`admin: ingen handler implementert (action=${parametre && parametre.action || '?'})`);
    }

    async function poll() {
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag)) return;
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

    // Merker admin-headeren med "med superkrefter" så det er åpenbart at admin-agenten er aktiv.
    // Admin-siden (/administrasjon/) har et EKTE <img> pasienttransport_admin.gif (ikke NISSYlogo-background
    // som planlegger/rekvisisjon) → legg merket inline rett etter logoen, ingen absolutt-posisjonering.
    function dekorerHeader() {
        if (document.querySelector('[data-vkt-superkrefter]')) return;
        const logo = document.querySelector('#header img[src*="pasienttransport_admin"]') || document.querySelector('#header img[src*="pasienttransport"]');
        const header = document.getElementById('header');
        if (!logo || !header) return;
        if (getComputedStyle(header).position === 'static') header.style.position = 'relative';
        const tilbygg = document.createElement('span');
        tilbygg.dataset.vktSuperkrefter = '1';
        tilbygg.textContent = 'med superkrefter';
        // Absolutt ved siden av logoen (2-linjers, ~330px bred) — juster top/left ved behov.
        tilbygg.style.cssText = 'position:absolute;top:59px;left:345px;font-size:20px;font-style:italic;font-weight:600;color:#f97316;letter-spacing:0.5px;text-shadow:0 1px 2px rgba(255,255,255,0.8);pointer-events:none;z-index:1000;white-space:nowrap;';
        header.appendChild(tilbygg);
        console.log(`[${NAVN}] aktiverte "med superkrefter"-merket i admin-header`);
    }

    function holdOpenerLevende() {
        try {
            const opener = window.opener;
            if (!opener || opener.closed) return;
            if (!/\/planlegging\//.test(opener.location.pathname)) return;
            if (opener.__westbyVerktoykasse || opener.__westbyVerktoykasse_dev) {
                if (typeof opener.__vkt_registerAgentTab === 'function') {
                    opener.__vkt_registerAgentTab(window, FIL, FLAG, PATH_PREFIX);
                }
                return;
            }
            // Injiser AKTIV variant (sticky i localStorage) — gammel prod-agent injiserer dev når du kjører dev.
            let variant = 'prod';
            try { variant = opener.localStorage.getItem('vkt_variant') || 'prod'; } catch (_) {}
            const fil = variant === 'dev' ? 'verktoykasse_dev.js' : 'verktoykasse.js';
            const s = opener.document.createElement('script');
            s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + fil + '&_=' + Date.now();
            opener.document.head.appendChild(s);
            console.log(`[${NAVN}] re-injiserte ${fil} (aktiv variant=${variant}) i opener (planlegger)`);
        } catch (e) {
            // Cross-origin eller annet — ignorer
        }
    }

    poll();
    holdOpenerLevende();
    dekorerHeader();
    setInterval(poll, POLL_MS);
    setInterval(holdOpenerLevende, POLL_MS);
    setInterval(dekorerHeader, 3000);  // re-påfør hvis NISSY re-rendrer headeren (cheap: early-return når merket finnes)

    console.log(
        `%c[${NAVN} v${VERSJON}]%c aktiv på ${location.pathname}\n` +
        `Poller nissy_jobs.php hvert ${POLL_MS / 1000}. sek for modul=${MODUL}\n` +
        `Holder opener (planlegger) levende. Klar for jobber.`,
        'background:#10b981;color:#022c22;font-weight:700;padding:2px 6px;border-radius:3px;',
        'color:inherit;'
    );

    let heartbeatTeller = 0;
    setInterval(() => {
        heartbeatTeller++;
        console.log(`%c[${NAVN}]%c heartbeat #${heartbeatTeller} — opener=${window.opener && !window.opener.closed ? 'levende' : 'borte'}`,
            'color:#10b981;font-weight:600;', 'color:#94a3b8;');
    }, 30000);
})();
