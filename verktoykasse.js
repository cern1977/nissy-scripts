// === WESTBYS VERKTØYKASSE v1.12 ===
// Launcher-meny som lastes inn i NISSY via Pinger.js-override.
// v1.2: turid-polling + badge på 🧰
// v1.3: admin-session-sjekk + keep-alive ping
// v1.4: faktisk henting av turdetaljer fra admin (ajax_reqdetails)
// v1.5: turid → (reqId, resId) via searchStatus (tur/retur støttes)
// v1.6: rekvisisjons-modul keep-alive (separat indikator)
// v1.7: pnr-oppslag (ssnSearch) — henter kommende turer for et fnr
// v1.8: høyreklikk-meny på markerte turer i Planlegger — Endre hentetid
// v1.9: høyreklikk kun på ventende-rader (V-), ikke pågående — pågående krever tilstandssjekk
// v1.10: vis versjon i meny-header + tooltip
// v1.11: vis nåværende hentetid(er) i Endre-tid-modal (lest fra blå Reise tid-kolonne)
// v1.12: nåværende tid blir placeholder i input — ingen egen "Tid nå"-linje
(function() {
    const VERSJON = '1.12';
    if (window.__westbyVerktoykasse) {
        console.log('[VERKTØYKASSE] allerede lastet, hopper over');
        return;
    }
    window.__westbyVerktoykasse = VERSJON;
    window.__VERKTOYKASSE_VERSION = VERSJON;

    const SERVER = 'https://thomaswestby.no/skript/skript.php?fil=';
    const TILGANG_URL = 'https://thomaswestby.no/skript/verktoykasse_tilgang.php';
    const JOBS_URL    = 'https://thomaswestby.no/skript/nissy_jobs.php';
    const ADMIN_BASE  = 'https://pastrans-sorost.mq.nhn.no/administrasjon/admin';
    const ADMIN_URL   = 'https://pastrans-sorost.mq.nhn.no/administrasjon/';
    const REK_URL     = 'https://pastrans-sorost.mq.nhn.no/rekvisisjon/requisition';

    const ADMIN_PING_MS = 180000;   // 3 min keep-alive (admin + rekvisisjon)
    const TURID_POLL_MS = 15000;    // 15 sek ventende-sjekk

    let knappRef = null;             // referanse til 🧰-knappen
    let adminStatus = 'ukjent';      // 'ok' | 'utlogget' | 'feil' | 'ukjent'
    let rekStatus   = 'ukjent';      // samme verdier — rekvisisjons-modul

    // === ADMIN-SESJON — samme pattern som overvaaker_avvik.js ===
    async function sjekkAdminLogin() {
        try {
            const res = await fetch(`${ADMIN_BASE}/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (res.status === 401 || res.status === 403) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (HTTP ' + res.status + ')');
                return false;
            }
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (login-side detektert)');
                return false;
            }
            return true;
        } catch (e) {
            console.warn('[VERKTØYKASSE] Admin-sjekk feilet:', e.message);
            return null;  // nettverksfeil, ikke samme som utlogget
        }
    }

    async function oppdaterAdminStatus() {
        const result = await sjekkAdminLogin();
        if (result === true) adminStatus = 'ok';
        else if (result === false) adminStatus = 'utlogget';
        else adminStatus = 'feil';
        tegnAdminStatus();
        console.log('[VERKTØYKASSE] Admin-status:', adminStatus);
        return adminStatus;
    }

    // === REKVISISJONS-MODUL — keep-alive (separat sesjon enn admin) ===
    async function sjekkRekvisisjonLogin() {
        try {
            const res = await fetch(REK_URL, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) return false;
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                return false;
            }
            return true;
        } catch(e) {
            console.warn('[VERKTØYKASSE] Rekvisisjon-sjekk feilet:', e.message);
            return null;
        }
    }

    async function oppdaterRekvisisjonStatus() {
        const result = await sjekkRekvisisjonLogin();
        if (result === true) rekStatus = 'ok';
        else if (result === false) rekStatus = 'utlogget';
        else rekStatus = 'feil';
        tegnAdminStatus();  // samme tegne-funksjon oppdaterer begge visningene
        console.log('[VERKTØYKASSE] Rekvisisjon-status:', rekStatus);
        return rekStatus;
    }

    // NISSY-brukernavn fra cookie-prefix (samme logikk som Avvik/Live-skriptene)
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

    async function hentTilgang(nissy) {
        try {
            const r = await fetch(`${TILGANG_URL}?nissy=${encodeURIComponent(nissy || '')}`);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return await r.json();
        } catch(e) {
            console.warn('[VERKTØYKASSE] Feil ved henting av tilgang, bruker standard:', e.message);
            return {
                funnet: false,
                navn: null,
                verktoy: [
                    { id:'overvaker_live',  navn:'🟢 Overvåker Live',  fil:'overvaaker_live.js',  farge:'#047857' },
                    { id:'overvaker_avvik', navn:'🔍 Overvåker Avvik', fil:'overvaaker_avvik.js', farge:'#c2410c' },
                ]
            };
        }
    }

    function tegnMeny(tilgang) {
        const knapp = document.createElement('div');
        knapp.setAttribute('role', 'button');
        knapp.setAttribute('tabindex', '0');
        knapp.title = tilgang.navn ? `Verktøykasse v${VERSJON} — ${tilgang.navn}` : `Westbys verktøykasse v${VERSJON}`;
        knapp.style.cssText = [
            'position:fixed', 'top:6px', 'right:8px', 'z-index:2147483647',
            'width:72px', 'height:82px', 'border:none', 'background:transparent',
            'cursor:pointer', 'transition:transform 0.15s',
            'padding:0', 'overflow:visible',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-size:36px', 'line-height:1'
        ].join(';');

        const logoImg = document.createElement('img');
        logoImg.src = 'https://thomaswestby.no/img/pre_logo.png';
        logoImg.alt = '';
        logoImg.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));transition:filter 0.15s;';
        logoImg.onerror = () => {
            knapp.removeChild(logoImg);
            knapp.textContent = '🏥';
        };
        knapp.appendChild(logoImg);

        knapp.onmouseover = () => {
            knapp.style.transform = 'scale(1.1)';
            logoImg.style.filter = 'drop-shadow(0 6px 18px rgba(0,0,0,0.65))';
        };
        knapp.onmouseout = () => {
            knapp.style.transform = '';
            logoImg.style.filter = 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))';
        };

        // Meny
        const meny = document.createElement('div');
        meny.style.cssText = [
            'position:fixed', 'top:60px', 'right:10px', 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:12px',
            'padding:8px', 'display:none', 'min-width:240px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif'
        ].join(';');

        // Header
        const h = document.createElement('div');
        h.textContent = tilgang.navn ? tilgang.navn.split(',')[0] : 'Westbys verktøykasse';
        h.style.cssText = 'padding:8px 12px;font-size:12px;color:#f8fafc;font-weight:700;display:flex;align-items:center;gap:6px;';
        const ver = document.createElement('span');
        ver.textContent = `v${VERSJON}`;
        ver.style.cssText = 'font-size:10px;color:#64748b;font-weight:500;';
        h.appendChild(ver);
        if (tilgang.rolle && tilgang.rolle !== 'ansatt') {
            const badge = document.createElement('span');
            badge.textContent = tilgang.rolle.toUpperCase();
            badge.style.cssText = 'font-size:9px;padding:1px 5px;background:#1d4ed8;color:#bfdbfe;border-radius:3px;font-weight:700;';
            h.appendChild(badge);
        }
        meny.appendChild(h);

        if (!tilgang.verktoy || tilgang.verktoy.length === 0) {
            const tom = document.createElement('div');
            tom.textContent = 'Ingen tilgjengelige verktøy';
            tom.style.cssText = 'padding:12px;font-size:12px;color:#64748b;text-align:center;font-style:italic;';
            meny.appendChild(tom);
        }

        tilgang.verktoy.forEach(v => {
            if (v.separator) {
                const sep = document.createElement('div');
                sep.textContent = v.tekst;
                sep.style.cssText = 'padding:10px 12px 4px;font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:4px;';
                meny.appendChild(sep);
                return;
            }
            const lenke = document.createElement('a');
            lenke.href = '#';
            lenke.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;color:#e2e8f0;text-decoration:none;font-size:13px;border-radius:6px;transition:background 0.1s;';
            lenke.onmouseover = () => lenke.style.background = '#334155';
            lenke.onmouseout = () => lenke.style.background = '';

            const prikk = document.createElement('span');
            prikk.style.cssText = `width:6px;height:6px;border-radius:50%;background:${v.farge};flex-shrink:0;`;
            lenke.appendChild(prikk);

            const navn = document.createElement('span');
            navn.textContent = v.navn;
            lenke.appendChild(navn);

            lenke.onclick = (e) => {
                e.preventDefault();
                const s = document.createElement('script');
                s.src = SERVER + v.fil + '&_=' + Date.now();
                s.onload = () => console.log('[VERKTØYKASSE] lastet:', v.fil);
                s.onerror = () => alert('Feil ved lasting av ' + v.fil);
                document.head.appendChild(s);
                meny.style.display = 'none';
            };
            meny.appendChild(lenke);
        });

        // Footer
        if (!tilgang.funnet) {
            const f = document.createElement('div');
            f.textContent = 'Ukjent bruker — viser standardsett';
            f.style.cssText = 'padding:6px 12px;font-size:10px;color:#64748b;border-top:1px solid #334155;margin-top:4px;font-style:italic;';
            meny.appendChild(f);
        }

        // === Drag + posisjon-persistens ===
        // Lagrer posisjon i localStorage så operatør beholder den mellom F5.
        const LS_KEY = 'vkt_widget_pos';
        let drar = false;
        let harFlyttet = false;
        let offsetX = 0, offsetY = 0;
        let startX = 0, startY = 0;

        // Plasser menyen relativt til knappen (så den følger med når knappen flyttes)
        function plassérMeny() {
            const r = knapp.getBoundingClientRect();
            const menyBredde = 240;
            // Hvis knappen er på venstre halvdel: meny til høyre for knappen.
            // Ellers: meny til venstre av knappen.
            const plassLeft = (r.left < window.innerWidth / 2) ? r.left : Math.max(10, r.right - menyBredde);
            // Hvis knappen er øverst: meny under. Hvis nederst: meny over.
            const plassTop = (r.top < window.innerHeight / 2) ? r.bottom + 8 : r.top - 10;
            meny.style.left = plassLeft + 'px';
            meny.style.top = plassTop + 'px';
            meny.style.right = 'auto';
            if (r.top >= window.innerHeight / 2) {
                meny.style.transform = 'translateY(-100%)';
            } else {
                meny.style.transform = '';
            }
        }

        // Hent lagret posisjon
        try {
            const lagret = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
            if (lagret && typeof lagret.left === 'string' && typeof lagret.top === 'string') {
                knapp.style.left = lagret.left;
                knapp.style.top = lagret.top;
                knapp.style.right = 'auto';
            }
        } catch (_) { /* ignore */ }

        knapp.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;  // kun venstre-klikk
            drar = true;
            harFlyttet = false;
            const r = knapp.getBoundingClientRect();
            offsetX = e.clientX - r.left;
            offsetY = e.clientY - r.top;
            startX = e.clientX;
            startY = e.clientY;
            // Skjul menyen mens vi drar
            meny.style.display = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (!harFlyttet && dx < 4 && dy < 4) return;  // terskel før vi kaller det drag
            harFlyttet = true;
            // Klamp mot vindu
            const maksX = window.innerWidth - knapp.offsetWidth - 2;
            const maksY = window.innerHeight - knapp.offsetHeight - 2;
            const nyX = Math.max(2, Math.min(maksX, e.clientX - offsetX));
            const nyY = Math.max(2, Math.min(maksY, e.clientY - offsetY));
            knapp.style.left = nyX + 'px';
            knapp.style.top = nyY + 'px';
            knapp.style.right = 'auto';
            knapp.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            if (!drar) return;
            drar = false;
            knapp.style.cursor = '';
            if (harFlyttet) {
                try {
                    localStorage.setItem(LS_KEY, JSON.stringify({
                        left: knapp.style.left,
                        top: knapp.style.top
                    }));
                } catch (_) { /* ignore (quota full, privacy mode, osv.) */ }
            }
        });

        // Dobbel-klikk for å resette posisjon (tilbake til øverst høyre)
        knapp.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            knapp.style.left = '';
            knapp.style.top = '10px';
            knapp.style.right = '10px';
            try { localStorage.removeItem(LS_KEY); } catch (_) { /* ignore */ }
        });

        // Oppdater meny-posisjon ved vindu-resize (så den ikke blir liggende utenfor)
        window.addEventListener('resize', () => {
            if (meny.style.display === 'block') plassérMeny();
            const r = knapp.getBoundingClientRect();
            if (r.right > window.innerWidth || r.bottom > window.innerHeight) {
                const nyX = Math.max(2, Math.min(window.innerWidth - knapp.offsetWidth - 2, r.left));
                const nyY = Math.max(2, Math.min(window.innerHeight - knapp.offsetHeight - 2, r.top));
                knapp.style.left = nyX + 'px';
                knapp.style.top = nyY + 'px';
                knapp.style.right = 'auto';
            }
        });

        // Toggle meny — hopp over hvis vi nettopp dro
        knapp.onclick = (e) => {
            e.stopPropagation();
            if (harFlyttet) {
                harFlyttet = false;  // nullstill for neste klikk
                return;
            }
            if (meny.style.display === 'none' || !meny.style.display) {
                plassérMeny();
                meny.style.display = 'block';
            } else {
                meny.style.display = 'none';
            }
        };
        document.addEventListener('click', (e) => {
            if (!meny.contains(e.target) && e.target !== knapp && !knapp.contains(e.target)) meny.style.display = 'none';
        });

        knapp.style.cursor = 'grab';

        (document.documentElement || document.body).appendChild(knapp);
        (document.documentElement || document.body).appendChild(meny);
        knappRef = knapp;
    }

    // === Admin-status-visning: ring + bakgrunn + puls ved utlogging ===
    function tegnAdminStatus() {
        if (!knappRef) return;
        // Sørg for at puls-animasjonen finnes
        if (!document.getElementById('vkt-style')) {
            const st = document.createElement('style');
            st.id = 'vkt-style';
            st.textContent = `
                @keyframes vkt-pulse {
                    0%, 100% { box-shadow: 0 0 0 2px #ef4444; }
                    50%      { box-shadow: 0 0 0 2px #ef4444, 0 0 10px #ef4444, 0 0 20px rgba(239,68,68,0.35); }
                }
            `;
            document.head.appendChild(st);
        }

        // Fjern evt. gammel rekDot
        const gammelDot = knappRef.querySelector('.vkt-rekdot');
        if (gammelDot) gammelDot.remove();

        const allOk = adminStatus === 'ok' && rekStatus === 'ok';
        const noeUtlogget = adminStatus === 'utlogget' || rekStatus === 'utlogget';

        knappRef.style.animation = noeUtlogget ? 'vkt-pulse 1.8s ease-in-out infinite' : '';
        knappRef.style.boxShadow = allOk
            ? '0 0 0 2px #10b981'
            : '0 0 0 2px #ef4444';

        // Tooltip — kort beskrivelse av hva som er feil
        const grunnTittel = knappRef.dataset.tittel || knappRef.title.split('\n')[0];
        knappRef.dataset.tittel = grunnTittel;
        const feilLinjer = [];
        if (adminStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Admin: UTLOGGET','feil':'⚠ Admin: ukjent feil','ukjent':'⏳ Admin: sjekkes…'}[adminStatus] || adminStatus
        );
        if (rekStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Rekvisisjon: UTLOGGET','feil':'⚠ Rekvisisjon: ukjent feil','ukjent':'⏳ Rekvisisjon: sjekkes…'}[rekStatus] || rekStatus
        );
        knappRef.title = feilLinjer.length
            ? `${grunnTittel}\n${feilLinjer.join('\n')}`
            : grunnTittel;

        // Toast ved utlogget (admin eller rekvisisjon)
        const eksisterende = document.getElementById('vkt-toast');
        if ((adminStatus === 'utlogget' || rekStatus === 'utlogget') && !eksisterende) {
            visAdminToast();
        } else if (adminStatus === 'ok' && rekStatus !== 'utlogget' && eksisterende) {
            eksisterende.remove();
        }
    }

    function visAdminToast() {
        const t = document.createElement('div');
        t.id = 'vkt-toast';
        t.style.cssText = [
            'position:fixed','bottom:20px','right:20px','z-index:2147483646',
            'background:#7f1d1d','color:white','padding:14px 18px','border-radius:10px',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif','font-size:13px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)','max-width:300px',
            'border:1px solid #ef4444'
        ].join(';');
        const admOk = adminStatus === 'ok';
        const rekOk = rekStatus === 'ok';
        let linjer = [];
        if (!admOk) linjer.push(`<a href="${ADMIN_URL}" target="_blank" style="display:inline-block;margin-top:6px;padding:6px 12px;background:#ef4444;color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">Åpne admin →</a>`);
        if (!rekOk) linjer.push(`<a href="${REK_URL}" target="_blank" style="display:inline-block;margin-top:6px;margin-left:${!admOk ? '6px' : '0'};padding:6px 12px;background:#ef4444;color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">Åpne rekvisisjon →</a>`);
        const tittel = (!admOk && !rekOk) ? '⚠️ NISSY admin OG rekvisisjon er utlogget'
                     : !admOk ? '⚠️ NISSY admin er utlogget'
                     : '⚠️ NISSY rekvisisjon er utlogget';
        t.innerHTML = `
            <div style="font-weight:700;margin-bottom:6px;">${tittel}</div>
            <div style="font-size:12px;color:#fecaca;margin-bottom:4px;">Verktøykasse-funksjoner trenger tilgang. Logg inn for å aktivere.</div>
            ${linjer.join('')}
        `;
        document.body.appendChild(t);
    }

    // === Turid-polling: sjekker ventende turids hvert 15. sek ===
    function oppdaterBadge(antall) {
        if (!knappRef) return;
        let badge = knappRef.querySelector('.vkt-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'vkt-badge';
            badge.style.cssText = [
                'position:absolute','top:-4px','right:-4px',
                'min-width:18px','height:18px','border-radius:9px',
                'background:#ef4444','color:white','font-size:11px','font-weight:700',
                'display:none','align-items:center','justify-content:center',
                'padding:0 5px','box-shadow:0 2px 6px rgba(0,0,0,0.3)',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
                'line-height:1','pointer-events:none'
            ].join(';');
            knappRef.appendChild(badge);
        }
        if (antall > 0) {
            badge.textContent = antall;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // === Hent turdetaljer fra NISSY admin ===
    // Steg 1: POST searchStatus for å oversette turid → (reqId, db, resId)
    // Steg 2: For hver rekvisisjon, kall ajax_reqdetails og parse
    // Pattern: overvaker_live.js "Søk på turid"-flyten
    async function hentTurDetaljer(turid) {
        try {
            // STEG 1: Søk etter turid
            const searchBody = `submit_action=tripSearch&tripNr=${turid}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            console.log(`[VERKTØYKASSE] searchStatus: tripNr=${turid}`);
            const searchRes = await fetch(
                `${ADMIN_BASE}/searchStatus`,
                { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: searchBody }
            );
            if (!searchRes.ok) return { feil: `searchStatus HTTP ${searchRes.status}`, turid };
            const searchHtml = await searchRes.text();

            // Parse getRequisitionDetails(reqId, db, resId) — alle rekvisisjoner for denne turen
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(searchHtml)) !== null) {
                if (!matches.find(x => x.tripid === m[3])) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
                }
            }

            if (matches.length === 0) {
                console.warn(`[VERKTØYKASSE] ✗ Turid ${turid}: ingen rekvisisjoner funnet`);
                return { feil: 'ingen treff i searchStatus', turid, rekvisisjoner: [] };
            }
            console.log(`[VERKTØYKASSE] Turid ${turid}: ${matches.length} rekvisisjon(er) funnet`);

            // STEG 2: Hent detaljer for hver rekvisisjon
            const rekvisisjoner = [];
            for (const { reqId, db, tripid } of matches) {
                const d = await hentRekvisisjon(reqId, db, tripid, turid);
                if (d) rekvisisjoner.push(d);
            }

            return { turid, hentet: new Date().toISOString(), antall_rekvisisjoner: rekvisisjoner.length, rekvisisjoner };
        } catch (e) {
            console.warn(`[VERKTØYKASSE] hentTurDetaljer ${turid}:`, e.message);
            return { feil: e.message, turid };
        }
    }

    async function hentRekvisisjon(reqId, db, tripid, turid) {
        const url = `${ADMIN_BASE}/ajax_reqdetails?id=${reqId}&db=${db}&tripid=${tripid}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${turid}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const html = await res.text();
        if (html.length < 500) return null;

        const data = { reqId: +reqId, db: +db, tripid: +tripid };

        const henteIdx = html.indexOf('Hentested');
        const leverIdx = html.indexOf('Leveringssted');

        // Pasient (før Hentested)
        if (henteIdx > -1) {
            const pas = html.substring(0, henteIdx);
            const navnM = pas.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const addrMatches = [...pas.matchAll(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const postMatches = [...pas.matchAll(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const sisteAddr = addrMatches.length ? addrMatches[addrMatches.length-1][1].trim().replace(/[HU]\d{4}/g,'').replace(/\s+/g,' ').trim() : '';
            const sistePost = postMatches.length ? postMatches[postMatches.length-1][1].trim() : '';
            data.pasient_navn = navnM ? navnM[1].replace(/\s+/g, ' ').trim() : '';
            data.pasient_adresse = (sisteAddr + (sistePost ? ', ' + sistePost : '')).replace(/\s+/g, ' ').trim();
            const pnrM = pas.match(/Personnr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i) || pas.match(/F[\.\s]*dato[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.pasient_pnr = pnrM ? pnrM[1].replace(/\s+/g, ' ').trim() : '';
        }

        // Hentested
        if (henteIdx > -1) {
            const slutt = leverIdx > henteIdx ? leverIdx : html.indexOf('</fieldset>', henteIdx);
            const hb = html.substring(henteIdx, slutt > henteIdx ? slutt : undefined);
            const navnM = hb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = hb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = hb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.fra_navn = navnM ? navnM[1].trim() : '';
            data.fra_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Leveringssted
        if (leverIdx > -1) {
            const slutt = html.indexOf('</fieldset>', leverIdx);
            const lb = html.substring(leverIdx, slutt > leverIdx ? slutt : undefined);
            const navnM = lb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = lb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = lb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.til_navn = navnM ? navnM[1].trim() : '';
            data.til_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Rekvisisjonsnummer (12 sifre)
        const rekM = html.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i) || html.match(/>(\d{12})<\/b>/);
        data.rek_nr = rekM ? rekM[1] : null;

        // Retning
        const retnM = html.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
        data.retning = retnM ? retnM[1].trim() : null;

        // Rekvirent
        const rekvM = html.match(/Rekvirent[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        data.rekvirent = rekvM ? rekvM[1].trim() : '';

        // Geo: sutiXml-IDer i HTML gir lat/long når de slåes opp separat
        const xmlIds = [...new Set([...html.matchAll(/sutiXml\?id=(\d+)/g)].map(m => m[1]))];
        data.geo_punkter = [];
        for (const xmlId of xmlIds.slice(0, 6)) {  // cap for å unngå mange kall
            try {
                const r = await fetch(`${ADMIN_BASE}/sutiXml?id=${xmlId}`);
                const xt = await r.text();
                const latM  = xt.match(/lat="([\d.]+)"/);
                const longM = xt.match(/long="([\d.]+)"/);
                if (latM && longM) {
                    data.geo_punkter.push({ xmlId, lat: +latM[1], long: +longM[1] });
                }
            } catch(e) {}
        }

        return data;
    }

    // === PNR-OPPSLAG — ssnSearch i admin, returnerer alle kommende/aktive rekvisisjoner ===
    async function sokPnrINissy(pnr) {
        try {
            const body = `submit_action=ssnSearch&ssn=${pnr}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            const r = await fetch(`${ADMIN_BASE}/searchStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (!r.ok) return { feil: `searchStatus HTTP ${r.status}` };
            const html = await r.text();

            // Parse unike (reqId, db, tripid)-kombinasjoner
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(html)) !== null) {
                const nokkel = m[1] + '_' + m[3];
                if (!matches.find(x => (x.reqId + '_' + x.tripid) === nokkel)) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
                }
            }
            console.log(`[VERKTØYKASSE] pnr ${pnr}: ${matches.length} rekvisisjon(er) funnet`);

            // Hent detaljer for hver (cap på 20 for å unngå lange serier)
            const turer = [];
            for (const { reqId, db, tripid } of matches.slice(0, 20)) {
                const d = await hentRekvisisjon(reqId, db, tripid, tripid);
                if (d) turer.push(d);
            }
            return { pnr, hentet: new Date().toISOString(), antall: turer.length, turer };
        } catch(e) {
            console.warn('[VERKTØYKASSE] sokPnrINissy:', e.message);
            return { feil: e.message };
        }
    }

    async function pollPnrVentende() {
        if (adminStatus !== 'ok') return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=pnr_pending`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            console.log(`[VERKTØYKASSE] ${d.oppslag.length} ventende pnr-oppslag`);
            for (const o of d.oppslag) {
                const res = await sokPnrINissy(o.pnr);
                const fd = new FormData();
                fd.append('id', o.id);
                if (res && !res.feil) fd.append('resultat', JSON.stringify(res));
                if (res && res.feil) fd.append('feil', res.feil);
                await fetch(`${JOBS_URL}?handling=pnr_svar`, { method: 'POST', body: fd });
                console.log(`[VERKTØYKASSE] ✓ pnr-oppslag ${o.id}: ${res.antall || 0} turer`);
            }
        } catch(e) {
            console.warn('[VERKTØYKASSE] pnr-poll feil:', e.message);
        }
    }

    async function sendSvarTilServer(anropId, data) {
        try {
            const fd = new FormData();
            fd.append('id', anropId);
            fd.append('data', JSON.stringify(data));
            const r = await fetch(`${JOBS_URL}?handling=svar`, { method: 'POST', body: fd });
            return await r.json();
        } catch(e) {
            console.warn('[VERKTØYKASSE] sendSvar feilet:', e.message);
            return { ok: false, feil: e.message };
        }
    }

    async function pollVentende() {
        // Hopper over hvis admin ikke er innlogget
        if (adminStatus !== 'ok') return;
        try {
            const nissy = hentNissyBrukernavn();
            if (!nissy) return;
            const r = await fetch(`${JOBS_URL}?handling=pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.anrop)) return;

            oppdaterBadge(d.anrop.length);
            if (d.anrop.length === 0) return;

            console.log(`[VERKTØYKASSE] ${d.anrop.length} ventende turid(er) — henter fra admin ...`);

            // Behandle hver pending én etter én (sekvensielt for å unngå rate-limit)
            for (const a of d.anrop) {
                const data = await hentTurDetaljer(a.turid);
                if (!data || data.feil) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}:`, data && data.feil);
                    continue;
                }
                // Parsing må ha gitt minst ÉN rekvisisjon med fornuftig innhold
                const harData = Array.isArray(data.rekvisisjoner) && data.rekvisisjoner.some(r =>
                    r.fra_adresse || r.til_adresse || r.rek_nr || r.pasient_navn
                );
                if (!harData) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}: ingen data funnet i respons (hopper over — blir værende pending)`);
                    continue;
                }
                const sammendrag = data.rekvisisjoner.map(r => `${r.fra_navn || '?'} → ${r.til_navn || '?'}`).join(' | ');
                console.log(`[VERKTØYKASSE] ✓ Tur ${a.turid} (${data.rekvisisjoner.length} rekv): ${sammendrag}`);
                await sendSvarTilServer(a.id, data);
            }

        } catch(e) {
            console.warn('[VERKTØYKASSE] Poll-feil:', e.message);
        }
    }

    // === HØYREKLIKK-MENY PÅ MARKERTE TURER (Planlegger) ===
    // Aktiveres på sider hvor NISSY tegner rader som tr#V-<resId> (Planlegger / vopp-lista — ventende).
    // Høyreklikk på markert rad → opererer på alle markerte. Høyreklikk på umarkert → kun den raden.

    const REK_BASE = 'https://pastrans-sorost.mq.nhn.no/rekvisisjon';
    const NISSY_BLAA = 'rgb(148, 169, 220)';
    let _rekUserid = null;

    function lesMarkerteResIds() {
        try {
            if (window.g_voppLS?.selected?.length) {
                return g_voppLS.selected
                    .map(id => String(id).replace(/^V-/, ''))
                    .filter(s => /^\d+$/.test(s));
            }
        } catch (_) {}
        return [];
    }

    async function hentRekUserid() {
        if (_rekUserid) return _rekUserid;
        try {
            const r = await fetch(`${REK_BASE}/requisition/`, { credentials: 'include' });
            const html = await r.text();
            const m = html.match(/userid=(\d+)/);
            if (m) { _rekUserid = m[1]; return _rekUserid; }
        } catch (_) {}
        return null;
    }

    async function dwrEncryptResId(resId) {
        const body = [
            'callCount=1',
            'c0-scriptName=Requisition',
            'c0-methodName=encrypt',
            'c0-id=0',
            `c0-param0=string:${resId}`,
            'batchId=1',
            'page=/rekvisisjon/',
            'httpSessionId=',
            'scriptSessionId='
        ].join('\n');
        const res = await fetch(`${REK_BASE}/dwr/call/plaincall/Requisition.encrypt.dwr`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body,
            credentials: 'include'
        });
        const text = await res.text();
        const m = text.match(/_remoteHandleCallback\([^,]+,[^,]+,"([^"]+)"\)/);
        if (!m) throw new Error('encrypt-respons uforståelig');
        return m[1];
    }

    async function endreTidPaaResId(resId, nyTid) {
        const userid = await hentRekUserid();
        if (!userid) return { ok: false, feil: 'fant ikke userid' };
        const token = await dwrEncryptResId(resId);
        const confirmUrl = `${REK_BASE}/requisition/confirm?loggedin=true&id_enc=${token}&userid=${userid}&ns=true`;
        const html = await fetch(confirmUrl, { credentials: 'include' }).then(r => r.text());
        const form = new DOMParser().parseFromString(html, 'text/html').querySelector('form');
        if (!form) return { ok: false, feil: 'skjema ikke funnet' };
        const fd = new FormData(form);
        fd.set('departureTime', nyTid);
        fd.set('trip.startDateManuallySet', 'true');
        const res = await fetch(confirmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams([...fd]).toString(),
            credentials: 'include'
        });
        return { ok: res.ok, status: res.status };
    }

    function visKontekstmeny(resIds, x, y) {
        document.getElementById('vkt-ctx-meny')?.remove();
        const meny = document.createElement('div');
        meny.id = 'vkt-ctx-meny';
        meny.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
            'padding:4px', 'min-width:220px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const tittel = document.createElement('div');
        tittel.textContent = `${resIds.length} tur${resIds.length > 1 ? 'er' : ''} valgt`;
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #334155;margin-bottom:4px;';
        meny.appendChild(tittel);

        const valg = [
            { tekst: '⏰ Endre hentetid…', handler: () => visEndreTidModal(resIds) },
        ];
        valg.forEach(v => {
            const a = document.createElement('div');
            a.textContent = v.tekst;
            a.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = () => { meny.remove(); v.handler(); };
            meny.appendChild(a);
        });

        document.body.appendChild(meny);

        // Sørg for at menyen ikke går utenfor vinduet
        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';

        setTimeout(() => {
            const lukk = (e) => {
                if (!meny.contains(e.target)) {
                    meny.remove();
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    function lesHentetidFraRad(resId) {
        const rad = document.getElementById('V-' + resId);
        if (!rad) return null;
        const blaa = rad.querySelector('font[color="#0000FF"]');
        if (!blaa) return null;
        // Reise tid-cellen kan inneholde "DD-MM HH:MM" eller bare "HH:MM" — plukk ut HH:MM
        const m = blaa.textContent.match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : null;
    }

    function visEndreTidModal(resIds) {
        document.getElementById('vkt-modal')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'vkt-modal';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';

        const tiderNaa = resIds.map(lesHentetidFraRad).filter(Boolean);
        const placeholderTid = tiderNaa[0] || 'tt:mm';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#1e293b;color:#e2e8f0;padding:20px;border-radius:12px;min-width:340px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,0.5);';
        dialog.innerHTML = `
            <h3 style="margin:0 0 6px;font-size:15px;">Endre hentetid</h3>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:14px;">${resIds.length} tur${resIds.length > 1 ? 'er' : ''} valgt</div>
            <label style="display:block;font-size:12px;margin-bottom:6px;color:#cbd5e1;">Ny hentetid (tt:mm)</label>
            <input id="vkt-tid" type="text" placeholder="${placeholderTid}" maxlength="5" autocomplete="off" style="width:100%;padding:8px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#fff;font-size:14px;font-family:monospace;box-sizing:border-box;">
            <div id="vkt-progress" style="margin-top:12px;font-size:12px;color:#94a3b8;display:none;"></div>
            <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px;">
                <button id="vkt-avbryt" style="padding:8px 16px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Avbryt</button>
                <button id="vkt-ok" style="padding:8px 16px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">OK</button>
            </div>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = dialog.querySelector('#vkt-tid');
        const progressEl = dialog.querySelector('#vkt-progress');
        const okBtn = dialog.querySelector('#vkt-ok');
        const avbrytBtn = dialog.querySelector('#vkt-avbryt');
        input.focus();

        const lukk = () => overlay.remove();
        avbrytBtn.onclick = lukk;
        overlay.onclick = (e) => { if (e.target === overlay) lukk(); };

        okBtn.onclick = async () => {
            const raa = input.value.trim();
            if (!/^\d{1,2}:\d{2}$/.test(raa)) {
                input.style.borderColor = '#ef4444';
                return;
            }
            const [h, m] = raa.split(':');
            const norm = h.padStart(2, '0') + ':' + m.padStart(2, '0');
            const hh = +h, mm = +m;
            if (hh > 23 || mm > 59) {
                input.style.borderColor = '#ef4444';
                return;
            }
            okBtn.disabled = true;
            avbrytBtn.disabled = true;
            input.disabled = true;
            progressEl.style.display = 'block';
            let ok = 0, fail = 0;
            for (const [i, resId] of resIds.entries()) {
                progressEl.textContent = `${i + 1}/${resIds.length} — endrer ${resId}…`;
                try {
                    const r = await endreTidPaaResId(resId, norm);
                    if (r.ok) ok++; else { fail++; console.warn('[VERKTØYKASSE] feil for', resId, r); }
                } catch (e) {
                    console.warn('[VERKTØYKASSE] endreTid kastet for', resId, e);
                    fail++;
                }
            }
            progressEl.textContent = `Ferdig: ${ok} endret${fail ? ', ' + fail + ' feilet' : ''}`;
            progressEl.style.color = fail ? '#fbbf24' : '#10b981';
            avbrytBtn.disabled = false;
            avbrytBtn.textContent = 'Lukk';
        };
        input.onkeydown = (e) => {
            if (e.key === 'Enter') okBtn.click();
            if (e.key === 'Escape') lukk();
        };
    }

    function kontekstmenyHandler(e) {
        const rad = e.target.closest && e.target.closest('tr[id^="V-"]');
        if (!rad) return;
        const erMarkert = rad.style.backgroundColor === NISSY_BLAA;
        const markerte = lesMarkerteResIds();
        let resIds;
        if (erMarkert && markerte.length > 0) {
            resIds = markerte;
        } else {
            const id = rad.id.replace(/^V-/, '');
            if (!/^\d+$/.test(id)) return;
            resIds = [id];
        }
        e.preventDefault();
        visKontekstmeny(resIds, e.clientX, e.clientY);
    }

    function aktiverKontekstmeny() {
        document.addEventListener('contextmenu', kontekstmenyHandler, true);
        console.log('[VERKTØYKASSE] Høyreklikk-meny på V-rader (ventende) aktiv');
    }

    const nissy = hentNissyBrukernavn();
    console.log('[VERKTØYKASSE v1.8] Henter tilgang for nissy_id=' + (nissy || '(tom)'));
    hentTilgang(nissy).then(async t => {
        console.log('[VERKTØYKASSE] Tilgang:', t);
        tegnMeny(t);
        tegnAdminStatus();                 // Vis "sjekker"-status umiddelbart
        await oppdaterAdminStatus();       // Første admin-sjekk
        await oppdaterRekvisisjonStatus(); // Første rekvisisjon-sjekk
        aktiverKontekstmeny();             // Høyreklikk-meny på markerte turer
        pollVentende();                    // Første turid-poll
        pollPnrVentende();                 // Første pnr-poll
        setInterval(oppdaterAdminStatus, ADMIN_PING_MS);
        setInterval(oppdaterRekvisisjonStatus, ADMIN_PING_MS);
        setInterval(pollVentende, TURID_POLL_MS);
        setInterval(pollPnrVentende, TURID_POLL_MS);  // samme intervall
    });
})();
