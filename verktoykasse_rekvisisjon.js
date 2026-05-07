// === WESTBYS VERKTØYKASSE — REKVISISJONS-AGENT v1.2 ===
// Headless agent som lastes inn på /rekvisisjon/-modulen.
// Injiseres automatisk av planlegger-verktøykassen når en rekvisisjon-tab åpnes,
// eller manuelt via bookmarklet.
//
// Funksjoner:
//  • Poller nissy_jobs.php etter naviger-jobber for modul='rekvisisjon'
//  • Auto-fyller ssn + klikker søk-knapp i den gjeldende fanen
//  • Mutual keeper: re-injiserer verktoykasse.js i window.opener (planlegger) hvis
//    planlegger F5'er og mister hovedverktøykassen
(function () {
    const VERSJON = '1.2';
    const NAVN = 'VKT-REKVISISJON';
    const MODUL = 'rekvisisjon';
    const JOBS_URL = 'https://thomaswestby.no/skript/nissy_jobs.php';
    const POLL_MS = 3000;

    if (window.__vkt_rekvisisjon_agent) {
        console.log(`[${NAVN}] allerede lastet`);
        return;
    }
    window.__vkt_rekvisisjon_agent = VERSJON;

    if (!/\/rekvisisjon\//.test(location.pathname) && !/^\/rekvisisjon\b/.test(location.pathname)) {
        console.warn(`[${NAVN}] kjøres utenfor /rekvisisjon/ — er du i riktig fane?`);
    }

    // NISSY-brukernavn fra cookie-prefix (samme logikk som hovedverktøykasse)
    function hentNissyBrukernavn() {
        try {
            const lagret = localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret;
        } catch (_) {}
        const m = document.cookie.match(/(?:^|;\s*)JSESSIONID[^=]*=([^;]+)/);
        return m ? m[1].split('.')[0].toLowerCase() : '';
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
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending&nissy=${encodeURIComponent(nissy)}`, {
                credentials: 'include'
            });
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
    // verktøykassen, re-injiserer vi den derfra
    function holdOpenerLevende() {
        try {
            const opener = window.opener;
            if (!opener || opener.closed) return;
            if (!/\/planlegging\//.test(opener.location.pathname)) return;
            if (opener.__westbyVerktoykasse) return;  // allerede lastet
            const s = opener.document.createElement('script');
            s.src = 'https://thomaswestby.no/skript/skript.php?fil=verktoykasse.js&_=' + Date.now();
            opener.document.head.appendChild(s);
            console.log(`[${NAVN}] re-injiserte verktoykasse.js i opener (planlegger)`);
        } catch (e) {
            // Cross-origin eller annet — ignorer
        }
    }

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
