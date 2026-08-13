// === WESTBYS VERKTØYKASSE — ATTEST-AGENT v1.4 ===
// v1.4-dev: «med superkrefter»-merke ved Pasientreiser-logoen (in-page bekreftelse på at agenten er
//           aktiv — uavhengig av cross-origin-kobling til planleggeren). Via samme MutationObserver.
// v1.3-dev: HEARTBEAT — re-melder vkt_attest_klar til opener hvert 3. sek (som rekvisisjon/admin),
//           så koblingen + grønn statusprikk overlever planlegger-F5. Konsoll-heartbeat hvert 30. sek.
// v1.2-dev: LINK-REWRITE — skriver om attest-ui sine rekvisisjons-lenker fra nissy6 → operatørens egen
//           NISSY-host (samme som planleggeren), så de åpnes same-origin og agenten auto-injiseres uten
//           ekstra klikk. Mål-host fra planlegger (vkt_planlegger_origin) / referrer. SPA → MutationObserver.
// v1.1-dev: lastes nå av den universelle bookmarkleten (dispatcher i verktoykasse.js gjenkjenner
//           attest-ui-host). Liten «Attest-agent aktiv»-toast nede til høyre (window.__vktAttestToast).
// Headless agent som kjører på attest-ui.pasientreiser.nhn.no.
// Bygger ovenpå postMessage-protokoll mellom planlegger (cross-origin) og attest-tab,
// fordi CORS preflight blir blokkert ved direkte fetch fra planlegger til attest-API.
//
// Protokoll (alle meldinger har {type, requestId}):
//   Planlegger → attest:  {type:'vkt_attest_query', pnr, requestId}
//   Attest → planlegger:  {type:'vkt_attest_result', requestId, antall, aktive, error?}
//   Attest → planlegger:  {type:'vkt_attest_klar'}  (sendes ved oppstart)
(function () {
    const VERSJON = '1.4';
    const NAVN = 'VKT-ATTEST';
    const FLAG = '__vkt_attest_agent';
    const API_BASE = 'https://attest-ui.pasientreiser.nhn.no/api/v1';

    if (window[FLAG]) {
        console.log(`[${NAVN}] allerede lastet`);
        return;
    }
    window[FLAG] = VERSJON;

    if (!/attest-ui\.pasientreiser\.nhn\.no/.test(location.hostname)) {
        console.warn(`[${NAVN}] kjøres utenfor attest-domenet — er du i riktig fane?`);
    }

    async function hentAttester(pnr) {
        const r = await fetch(`${API_BASE}/attester/list`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identitetsnummer: pnr })
        });
        if (r.status === 404) return { antall: 0, aktive: 0 };
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const attester = Array.isArray(d.attester) ? d.attester : [];
        const aktive = attester.filter(a => a.aktiv && !a.utlopt).length;
        return { antall: attester.length, aktive };
    }

    async function hentPerson(pnr) {
        const r = await fetch(`${API_BASE}/personer`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identitetsnummer: pnr })
        });
        if (r.status === 404) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
    }

    // === LINK-REWRITE: attest → rekvisisjon ===
    // Attest-ui lister rekvisisjons-lenker mot nissy6 (target=_blank). Vi skriver host om til operatørens
    // EGEN NISSY-host (samme som planleggeren) → samme origin → den universelle bookmarkletens dispatcher /
    // window.open-patch auto-injiserer rekvisisjons-agenten der. pastrans & nissy6 deler backend, så samme
    // attestId/destination åpner samme rekvisisjon. Mål-host: fra planleggeren (vkt_planlegger_origin),
    // fallback til referrer-host (forward fra startAttest på operatørens host).
    let MAALHOST = '';
    function rewriteLenker() {
        if (!MAALHOST) return;
        let n = 0;
        document.querySelectorAll('a[href*="/rekvisisjon/"]:not([data-vkt-omskrevet])').forEach(a => {
            let u;
            try { u = new URL(a.href, location.href); } catch (_) { return; }
            if (!/\.nhn\.no$/i.test(u.hostname) || /attest-ui/i.test(u.hostname)) return;
            a.dataset.vktOmskrevet = '1';
            if (u.hostname === MAALHOST) return;
            u.hostname = MAALHOST;
            a.href = u.href;
            n++;
        });
        if (n) {
            console.log(`[${NAVN}] skrev om ${n} rekvisisjons-lenke(r) → ${MAALHOST}`);
            if (window.__vktAttestToast) window.__vktAttestToast('🔗 ' + n + ' rekvisisjon-lenke(r) → din NISSY', 3000);
        }
    }
    function settMaalHost(h) {
        if (!h || !/\.nhn\.no$/i.test(h) || /attest-ui/i.test(h) || h === MAALHOST) return;
        MAALHOST = h;
        rewriteLenker();
    }
    try { if (document.referrer) settMaalHost(new URL(document.referrer).hostname); } catch (_) {}
    window.addEventListener('message', (e) => {
        const d = e.data || {};
        if (d && d.type === 'vkt_planlegger_origin' && d.origin) {
            try { settMaalHost(new URL(d.origin).hostname); } catch (_) {}
        }
    });
    // «med superkrefter»-merke ved Pasientreiser-logoen — synlig bekreftelse på at attest-agenten er
    // aktiv, in-page (trenger ikke cross-origin-kobling til planleggeren). Samme stil som de andre.
    function settSuperkrefter() {
        if (document.querySelector('[data-vkt-superkrefter]')) return;
        const logo = document.querySelector('img[alt="Pasientreiser logo"]');
        const anker = logo ? (logo.closest('a') || logo.parentElement) : null;
        if (!anker) return;
        const merke = document.createElement('span');
        merke.dataset.vktSuperkrefter = '1';
        merke.textContent = 'med superkrefter';
        merke.style.cssText = 'margin-left:10px;font-style:italic;font-weight:600;color:#f97316;font-size:15px;'
            + 'white-space:nowrap;align-self:center;pointer-events:none;';
        anker.appendChild(merke);
        console.log(`[${NAVN}] "med superkrefter"-merke lagt til`);
    }
    settSuperkrefter();
    try {
        const obs = new MutationObserver(() => { rewriteLenker(); settSuperkrefter(); });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (_) {}

    window.addEventListener('message', async (e) => {
        const data = e.data || {};
        if (!data.type || !data.requestId) return;
        if (data.type === 'vkt_attest_query') {
            const pnr = String(data.pnr || '').replace(/\D/g, '');
            if (pnr.length !== 11) {
                e.source.postMessage({ type: 'vkt_attest_result', requestId: data.requestId, error: 'ugyldig pnr' }, '*');
                return;
            }
            try {
                const attester = await hentAttester(pnr);
                e.source.postMessage({ type: 'vkt_attest_result', requestId: data.requestId, ...attester }, '*');
            } catch (err) {
                e.source.postMessage({ type: 'vkt_attest_result', requestId: data.requestId, error: err.message }, '*');
            }
            return;
        }
        if (data.type === 'vkt_attest_person_query') {
            const pnr = String(data.pnr || '').replace(/\D/g, '');
            try {
                const person = await hentPerson(pnr);
                e.source.postMessage({ type: 'vkt_attest_person_result', requestId: data.requestId, person }, '*');
            } catch (err) {
                e.source.postMessage({ type: 'vkt_attest_person_result', requestId: data.requestId, error: err.message }, '*');
            }
        }
    });

    // Liten toast nede til høyre — så operatøren ser at agenten faktisk lastet på attest-siden.
    function toast(tekst, ms) {
        try {
            let t = document.getElementById('vkt-attest-toast');
            if (!t) {
                t = document.createElement('div');
                t.id = 'vkt-attest-toast';
                t.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:2147483647;max-width:320px;'
                    + 'padding:10px 14px;background:#1e293b;color:#e2e8f0;border-left:4px solid #f59e0b;'
                    + 'border-radius:8px;box-shadow:0 6px 22px rgba(0,0,0,0.3);font:600 13px -apple-system,'
                    + 'BlinkMacSystemFont,sans-serif;line-height:1.4;';
                document.body.appendChild(t);
            }
            t.textContent = tekst;
            t.style.display = '';
            clearTimeout(t._tmr);
            if (ms) t._tmr = setTimeout(() => { try { t.style.display = 'none'; } catch (_) {} }, ms);
        } catch (_) {}
    }
    window.__vktAttestToast = toast;  // eksponert så query-handlerne kan melde fra via toast
    toast('📋 Attest-agent aktiv' + (/-dev/.test(VERSJON) ? ' (DEV)' : ''), 4000);

    // HEARTBEAT — re-meld «klar» til opener hvert 3. sek (som rekvisisjon/admin-agentenes
    // holdOpenerLevende). Slik overlever koblingen at planleggeren F5-er: planleggeren re-registrerer
    // attest-referansen + holder statusprikken grønn, og agenten får ny origin til link-rewrite.
    let hbTeller = 0;
    function attestHeartbeat() {
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'vkt_attest_klar', versjon: VERSJON }, '*');
            }
        } catch (_) {}
        // Synlig heartbeat i konsollen hvert 30. sek (10 × 3s), som de andre agentene.
        if (++hbTeller % 10 === 0) {
            console.log(`%c[${NAVN}]%c heartbeat #${hbTeller / 10} — opener=${window.opener && !window.opener.closed ? 'levende' : 'borte'}`,
                'color:#fbbf24;font-weight:600;', 'color:#94a3b8;');
        }
    }
    attestHeartbeat();                 // første «klar» med en gang
    setInterval(attestHeartbeat, 3000);

    console.log(
        `%c[${NAVN} v${VERSJON}]%c aktiv på ${location.hostname}\n` +
        `Lytter på postMessage-queries fra planlegger.\n` +
        `Protokoll: vkt_attest_query → vkt_attest_result.`,
        'background:#f59e0b;color:#451a03;font-weight:700;padding:2px 6px;border-radius:3px;',
        'color:inherit;'
    );
})();
