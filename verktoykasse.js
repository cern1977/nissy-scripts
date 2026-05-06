// === WESTBYS VERKTØYKASSE v2.8 ===
// Launcher-meny som lastes inn i NISSY via Pinger.js-override.
// v2.0: ekstrahert "Endre hentetid" + høyreklikk-meny til basic_tools.js (egen prod/dev-fil).
//       Verktoykasse er nå ren shell — status-glow, drag, dropdown, polling, tilgang-loading.
//       Basic Tools auto-lastes etter tilgang er hentet. Toggle for dev-versjon i menyen (superadmin).
// v2.1: kompakt meny + Admin/Rekvisisjon-snarveier i header med statusprikker
// v2.2: vis Basic Tools-versjon i bunn av menyen (med DEV-tag hvis dev-modus)
// v2.3: tlf-oppslag (findPatient) — speiler pnr-flyten, lagres i nissy_oppslag med type='tlf'
// v2.4: nissy_naviger — generisk modul-navigering (rekvisisjon først, designet for å plugge inn flere)
// v2.5: window.__verktoykasse = { utforNissyNaviger, sjekkNavigerEtterLoad, pollNissyNaviger } for debug
// v2.6: nissy_naviger åpner i navngitt vindu (window.open) i stedet for å overstyre admin-tab
// v2.7: auto-submit form i den nye taben — verktøykasse kjører ikke på rekvisisjons-sider
// v2.8: same-origin DOM-tilgang i ny tab — fyll ssn og klikk søk-knapp i den faktiske form-siden
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
// v1.13: defensiv DOM-fjerning (Rico kræsjer på .remove() når elementet er borte)
// v1.14: les markerte fra DOM (blå rader), ikke g_voppLS.selected — sistnevnte ga "0"
// v1.15: debug-logging i høyreklikk-handler for å spore resId="0"-bug
// v1.16: fiks hardkodet "v1.8"-streng i log + vis array-innhold direkte
// v1.17: bruk index-løkke i stedet for entries()-destructuring (NISSY/Rico ga resId=0)
// v1.18: userid = NISSY-brukernavn (thwe), ikke tall — confirm-API godtar brukernavn
// v1.19: legg til windowName/instanceId i DWR-encrypt — påkrevd av server
// v1.20: behold httpSessionId — server krever den også
// v1.21: oppdater DWR-regex til å matche ny syntaks (dwr.engine.remote.handleCallback)
// v1.22: fjern debug-log fra kontekstmenyHandler — Endre hentetid bekreftet fungerende
// v1.23: Endre-tid blir popover ved cursor (ikke fullscreen modal) + slankere layout
// v1.24: ett input-felt per tur med pasientnavn — kan endre ulike tider samtidig
// v1.25: status-glow følger skjold-formen (drop-shadow), ikke firkant (box-shadow)
// v1.26: større skjold-knapp (72×82 → 110×130)
// v1.27: enda 1.5x større skjold (110×130 → 165×195)
// v1.28: mindre status-glow (4+10px → 2+5px) — passer bedre med større skjold
// v1.29: clip-path skjold-silhuett — bare skjoldet er klikkbart, ikke firkanten
// v1.30: separer klikk-flate fra glow — bilde+glow under, klikk-flate (skjold-form) over
// v1.31: stram klikk-polygon mer — glow-området skal ikke være klikkbart
// v1.32: fjern filter-endring på hover (kun skalering nå) — glow konstant
// v1.33: fiks toggle — mousedown lukket meny før hver klikk, så klikk alltid åpnet
// v1.34: fjern dobbeltklikk-reset (kolliderte med rask toggle)
// v1.35: auto-logger tidsendring til trip.comment ("gammel→ny av brukernavn")
(function() {
    const VERSJON = '2.8';
    function trygtFjern(el) {
        if (el && el.parentNode) {
            try { el.parentNode.removeChild(el); } catch (_) {}
        }
    }
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
            'width:165px', 'height:195px', 'border:none', 'background:transparent',
            'cursor:default', 'transition:transform 0.15s',
            'padding:0', 'overflow:visible',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-size:36px', 'line-height:1'
        ].join(';');

        const logoImg = document.createElement('img');
        logoImg.src = 'https://thomaswestby.no/img/pre_logo.png';
        logoImg.alt = '';
        logoImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));transition:filter 0.15s;pointer-events:none;';
        logoImg.onerror = () => {
            knapp.removeChild(logoImg);
            knapp.textContent = '🏥';
        };
        knapp.appendChild(logoImg);

        // Klikk-flate over bildet med skjold-silhuett — fanger bare klikk på selve skjoldet
        const klikkFlate = document.createElement('div');
        klikkFlate.style.cssText = [
            'position:absolute', 'inset:0', 'z-index:1',
            'cursor:pointer',
            'clip-path:polygon(50% 10%, 78% 18%, 78% 50%, 68% 78%, 50% 86%, 32% 78%, 22% 50%, 22% 18%)'
        ].join(';');
        knapp.appendChild(klikkFlate);

        klikkFlate.onmouseover = () => {
            knapp.style.transform = 'scale(1.1)';
        };
        klikkFlate.onmouseout = () => {
            knapp.style.transform = '';
        };

        // Meny
        const meny = document.createElement('div');
        meny.style.cssText = [
            'position:fixed', 'top:60px', 'right:10px', 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:10px',
            'padding:4px', 'display:none', 'min-width:220px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif'
        ].join(';');

        // Header
        const h = document.createElement('div');
        h.textContent = tilgang.navn ? tilgang.navn.split(',')[0] : 'Westbys verktøykasse';
        h.style.cssText = 'padding:6px 10px 4px;font-size:11px;color:#f8fafc;font-weight:700;display:flex;align-items:center;gap:6px;';
        const ver = document.createElement('span');
        ver.textContent = `v${VERSJON}`;
        ver.style.cssText = 'font-size:9px;color:#64748b;font-weight:500;';
        h.appendChild(ver);
        if (tilgang.rolle && tilgang.rolle !== 'ansatt') {
            const badge = document.createElement('span');
            badge.textContent = tilgang.rolle.toUpperCase();
            badge.style.cssText = 'font-size:8px;padding:1px 4px;background:#1d4ed8;color:#bfdbfe;border-radius:3px;font-weight:700;';
            h.appendChild(badge);
        }
        meny.appendChild(h);

        // Admin / Rekvisisjon-snarveier med statusprikker
        const lagSnarvei = (tekst, url, statusKey) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 8px;color:#e2e8f0;text-decoration:none;font-size:11px;border-radius:5px;background:#0f172a;border:1px solid #334155;transition:background 0.1s;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '#0f172a';
            const prikk = document.createElement('span');
            prikk.dataset.statusFor = statusKey;
            prikk.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#64748b;flex-shrink:0;';
            const t = document.createElement('span');
            t.textContent = tekst;
            a.appendChild(prikk);
            a.appendChild(t);
            return a;
        };
        const snarveier = document.createElement('div');
        snarveier.style.cssText = 'display:flex;gap:4px;padding:0 4px 4px;';
        snarveier.appendChild(lagSnarvei('Admin', ADMIN_URL, 'admin'));
        snarveier.appendChild(lagSnarvei('Rekvisisjon', REK_URL, 'rek'));
        meny.appendChild(snarveier);

        const skille = document.createElement('div');
        skille.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(skille);

        if (!tilgang.verktoy || tilgang.verktoy.length === 0) {
            const tom = document.createElement('div');
            tom.textContent = 'Ingen tilgjengelige verktøy';
            tom.style.cssText = 'padding:8px 10px;font-size:11px;color:#64748b;text-align:center;font-style:italic;';
            meny.appendChild(tom);
        }

        tilgang.verktoy.forEach(v => {
            if (v.separator) {
                const sep = document.createElement('div');
                sep.textContent = v.tekst;
                sep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
                meny.appendChild(sep);
                return;
            }
            const lenke = document.createElement('a');
            lenke.href = '#';
            lenke.style.cssText = 'display:flex;align-items:center;gap:7px;padding:5px 10px;color:#e2e8f0;text-decoration:none;font-size:12px;border-radius:5px;transition:background 0.1s;';
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
            f.style.cssText = 'padding:5px 10px;font-size:9px;color:#64748b;border-top:1px solid #334155;margin-top:2px;font-style:italic;';
            meny.appendChild(f);
        }

        // Basic Tools-versjon — oppdateres når basic_tools.js har lastet
        const btFooter = document.createElement('div');
        btFooter.id = 'vkt-bt-versjon';
        btFooter.style.cssText = 'padding:4px 10px;font-size:9px;color:#475569;border-top:1px solid #334155;margin-top:2px;display:flex;align-items:center;gap:4px;';
        btFooter.innerHTML = 'Basic Tools <span data-bt-ver>laster…</span>';
        meny.appendChild(btFooter);

        // Dev-toggle for Basic Tools — kun synlig for superadmin
        if (tilgang.rolle === 'superadmin') {
            const devSep = document.createElement('div');
            devSep.textContent = 'AVANSERT';
            devSep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
            meny.appendChild(devSep);

            let devAktiv = false;
            try { devAktiv = localStorage.getItem('vkt_basic_tools_dev') === '1'; } catch (_) {}
            const devLenke = document.createElement('div');
            const oppdaterDevTekst = () => {
                devLenke.innerHTML = (devAktiv ? '☑' : '☐') + ' Bruk dev Basic Tools' +
                    (devAktiv ? ' <span style="color:#fbbf24;font-weight:700;font-size:9px;letter-spacing:0.5px;">DEV</span>' : '');
            };
            oppdaterDevTekst();
            devLenke.style.cssText = 'padding:5px 10px;color:#e2e8f0;cursor:pointer;border-radius:4px;font-size:11px;';
            devLenke.onmouseover = () => devLenke.style.background = '#334155';
            devLenke.onmouseout = () => devLenke.style.background = '';
            devLenke.onclick = () => {
                devAktiv = !devAktiv;
                try {
                    if (devAktiv) localStorage.setItem('vkt_basic_tools_dev', '1');
                    else localStorage.removeItem('vkt_basic_tools_dev');
                } catch (_) {}
                oppdaterDevTekst();
                // Krev F5 — last ikke basic_tools på nytt automatisk (handlere bør ikke registreres dobbelt)
                const hint = document.createElement('div');
                hint.textContent = 'F5 i NISSY for å bytte versjon';
                hint.style.cssText = 'padding:4px 12px;font-size:10px;color:#fbbf24;font-style:italic;';
                meny.appendChild(hint);
                setTimeout(() => trygtFjern(hint), 3000);
            };
            meny.appendChild(devLenke);
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
            // Ikke skjul menyen her — vi vet ikke ennå om dette blir en drag eller en klikk.
            // Lukke-på-drag skjer i mousemove når terskelen passeres.
        });

        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (!harFlyttet && dx < 4 && dy < 4) return;  // terskel før vi kaller det drag
            if (!harFlyttet) meny.style.display = 'none';  // skjul meny når drag faktisk starter
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

        // Toggle meny — bare når klikk landet på klikkFlate (skjold-silhuett)
        klikkFlate.onclick = (e) => {
            e.stopPropagation();
            if (harFlyttet) {
                harFlyttet = false;
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
            if (!meny.contains(e.target) && !knapp.contains(e.target)) meny.style.display = 'none';
        });

        (document.documentElement || document.body).appendChild(knapp);
        (document.documentElement || document.body).appendChild(meny);
        knappRef = knapp;
    }

    // === Admin-status-visning: ring + bakgrunn + puls ved utlogging ===
    function tegnAdminStatus() {
        if (!knappRef) return;
        // Puls-animasjon — bruker drop-shadow på selve skjold-formen, ikke box-shadow på firkant
        if (!document.getElementById('vkt-style')) {
            const st = document.createElement('style');
            st.id = 'vkt-style';
            st.textContent = `
                @keyframes vkt-pulse {
                    0%, 100% { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 2px #ef4444); }
                    50%      { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 5px #ef4444) drop-shadow(0 0 9px rgba(239,68,68,0.6)); }
                }
            `;
            document.head.appendChild(st);
        }

        // Fjern evt. gammel rekDot
        trygtFjern(knappRef.querySelector('.vkt-rekdot'));

        const logoImg = knappRef.querySelector('img');
        const allOk = adminStatus === 'ok' && rekStatus === 'ok';
        const noeUtlogget = adminStatus === 'utlogget' || rekStatus === 'utlogget';

        // Status-glow som følger formen (drop-shadow stacker — base mørk skygge + farget glow)
        knappRef.style.boxShadow = '';
        knappRef.style.animation = '';
        if (logoImg) {
            const glowColor = allOk ? '#10b981' : '#ef4444';
            const baseShadow = 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))';
            const hoverShadow = 'drop-shadow(0 6px 18px rgba(0,0,0,0.65))';
            const glow = `drop-shadow(0 0 2px ${glowColor}) drop-shadow(0 0 5px ${glowColor})`;
            logoImg.dataset.normalFilter = `${baseShadow} ${glow}`;
            logoImg.dataset.hoverFilter = `${hoverShadow} ${glow}`;
            // Hvis puls aktiv, la animasjonen styre filter — ellers sett statisk
            if (noeUtlogget) {
                logoImg.style.animation = 'vkt-pulse 1.8s ease-in-out infinite';
                logoImg.style.filter = '';
            } else {
                logoImg.style.animation = '';
                logoImg.style.filter = logoImg.dataset.normalFilter;
            }
        }

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

        // Oppdater statusprikker i meny-snarveiene (admin / rekvisisjon)
        const farge = (s) => s === 'ok' ? '#10b981' : (s === 'utlogget' ? '#ef4444' : '#fbbf24');
        document.querySelectorAll('[data-status-for="admin"]').forEach(el => el.style.background = farge(adminStatus));
        document.querySelectorAll('[data-status-for="rek"]').forEach(el => el.style.background = farge(rekStatus));

        // Toast ved utlogget (admin eller rekvisisjon)
        const eksisterende = document.getElementById('vkt-toast');
        if ((adminStatus === 'utlogget' || rekStatus === 'utlogget') && !eksisterende) {
            visAdminToast();
        } else if (adminStatus === 'ok' && rekStatus !== 'utlogget' && eksisterende) {
            trygtFjern(eksisterende);
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

    // === TLF-OPPSLAG — findPatient i admin, returnerer pasienter med matchende telefon ===
    async function sokTlfINissy(tlf) {
        try {
            const fd = new FormData();
            fd.append('Phone', tlf);
            fd.append('submitButton', 'Søk pasient');
            const r = await fetch(`${ADMIN_BASE}/findPatient`, {
                method: 'POST', body: fd, credentials: 'same-origin'
            });
            if (!r.ok) return { feil: `findPatient HTTP ${r.status}` };
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const pasienter = [];
            for (const row of doc.querySelectorAll('table.wizard_list tbody tr')) {
                const tds = row.querySelectorAll('td');
                const pnr = tds[0]?.textContent.trim();
                if (!/^\d{11}$/.test(pnr)) continue;
                pasienter.push({
                    pnr,
                    navn: tds[1]?.textContent.trim() || '',
                    rediger_url: tds[2]?.querySelector('a')?.href || ''
                });
            }
            console.log(`[VERKTØYKASSE] tlf ${tlf}: ${pasienter.length} pasient(er) funnet`);
            return { tlf, hentet: new Date().toISOString(), pasienter };
        } catch(e) {
            console.warn('[VERKTØYKASSE] sokTlfINissy:', e.message);
            return { feil: e.message };
        }
    }

    async function pollTlfVentende() {
        if (adminStatus !== 'ok') return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=tlf_pending`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            console.log(`[VERKTØYKASSE] ${d.oppslag.length} ventende tlf-oppslag`);
            for (const o of d.oppslag) {
                const res = await sokTlfINissy(o.tlf);
                const fd = new FormData();
                fd.append('id', o.id);
                if (res && !res.feil) fd.append('resultat', JSON.stringify(res));
                if (res && res.feil) fd.append('feil', res.feil);
                await fetch(`${JOBS_URL}?handling=tlf_svar`, { method: 'POST', body: fd });
                console.log(`[VERKTØYKASSE] ✓ tlf-oppslag ${o.id}: ${res.pasienter?.length || 0} pasienter`);
            }
        } catch(e) {
            console.warn('[VERKTØYKASSE] tlf-poll feil:', e.message);
        }
    }

    // === NISSY_NAVIGER — generisk modul-navigering ===
    // Flyt: poll → marker ferdig på server FØR navigering (script dør på nav) →
    // legg autofyll-instruks i sessionStorage → location.href = ny URL →
    // ny side laster verktøykasse via Pinger.js → init plukker opp sessionStorage
    // og fyller ut + submitter skjema.
    const NAVIGER_PENDING_KEY = 'vkt_naviger_pending';

    function ventPaaElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const tick = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return reject(new Error('timeout: ' + selector));
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    function utforNissyNaviger(parametre) {
        switch (parametre.modul) {
            case 'rekvisisjon': {
                // Same-origin: vi kan gripe DOM-en i den nye taben og fylle/klikke direkte
                const url = 'https://pastrans-sorost.mq.nhn.no/rekvisisjon/requisition/confirmGetRequisition';
                const w = window.open(url, 'nissy-rekvisisjon');
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                if (!parametre.ssn) return;

                // Poll til #ssn-feltet finnes i den nye taben, fyll inn, klikk søk-knapp
                const start = Date.now();
                const iv = setInterval(() => {
                    if (Date.now() - start > 15000) { clearInterval(iv); console.warn('[VERKTØYKASSE] timeout: ssn-felt aldri klart'); return; }
                    try {
                        if (w.closed) { clearInterval(iv); return; }
                        const doc = w.document;
                        if (!doc) return;
                        const el = doc.getElementById('ssn');
                        if (!el) return;
                        clearInterval(iv);
                        el.value = parametre.ssn;
                        // Trigger input/change events for evt. validering
                        el.dispatchEvent(new w.Event('input', { bubbles: true }));
                        el.dispatchEvent(new w.Event('change', { bubbles: true }));
                        // Søk-skjemaet har 4 seksjoner. Vi vil ha knappen for fødselsnummer-søk
                        // som har id="query_by_ssn" (bekreftet i NISSY-DOM).
                        const form = el.closest('form');
                        let btn = doc.getElementById('query_by_ssn');
                        if (!btn) {
                            // Fall back: søk i samme fieldset
                            const fieldset = el.closest('fieldset');
                            const finnSøk = (rot) => {
                                if (!rot) return null;
                                const alle = rot.querySelectorAll('button, input[type="submit"]');
                                for (const k of alle) {
                                    const tekst = (k.textContent || k.value || '').trim().toLowerCase();
                                    if (/^søk\b/.test(tekst)) return k;
                                }
                                return null;
                            };
                            btn = finnSøk(fieldset) || finnSøk(form);
                        }
                        if (btn) btn.click();
                        else if (form) form.submit();
                        console.log(`[VERKTØYKASSE] rekvisisjon fylt: ssn=${parametre.ssn} søkknapp="${btn ? (btn.textContent || btn.value || btn.name).trim() : 'ingen — brukte form.submit()'}"`);
                    } catch (e) {
                        // Same-origin men kanskje ikke ferdig lastet; prøv igjen
                    }
                }, 200);
                return;
            }
            case 'planlegging':
                throw new Error('planlegging-modul ikke implementert ennå');
            case 'attestasjon':
                throw new Error('attestasjon-modul ikke implementert ennå');
            default:
                throw new Error('Ukjent modul: ' + parametre.modul);
        }
    }

    // Fortsetter navigerings-flyten på den nye siden — fyller felt og submitter skjema.
    // Leser fra localStorage (cross-tab), bare hvis vi er på rekvisisjons-domenet.
    async function sjekkNavigerEtterLoad() {
        // Bare relevant hvis vi er på en rekvisisjons-side
        if (!/\/rekvisisjon\//.test(location.pathname)) return;
        let raa;
        try { raa = localStorage.getItem(NAVIGER_PENDING_KEY); } catch (_) { return; }
        if (!raa) return;
        let parametre;
        try { parametre = JSON.parse(raa); } catch (_) { return; }
        try { localStorage.removeItem(NAVIGER_PENDING_KEY); } catch (_) {}
        try {
            if (parametre.modul === 'rekvisisjon' && parametre.ssn) {
                const el = await ventPaaElement('#ssn', 5000);
                el.value = parametre.ssn;
                const form = el.closest('form') || document.querySelector('form');
                if (form) form.submit();
                console.log(`[VERKTØYKASSE] navigering ferdig: ssn=${parametre.ssn} fylt inn og submittet`);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] post-navigering feil:', e.message);
        }
    }

    async function pollNissyNavigerVentende() {
        if (adminStatus !== 'ok') return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            // Bare prosesser ÉN navigering om gangen — den endrer URL og dreper scriptet
            const o = d.oppslag[0];
            const parametre = o.parametre || {};
            console.log(`[VERKTØYKASSE] nissy_naviger ${o.id}:`, parametre);
            try {
                // Marker ferdig FØR navigering så jobben ikke plukkes opp på nytt
                const fd = new FormData();
                fd.append('id', o.id);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                // utforNissyNaviger setter localStorage og åpner navngitt vindu
                utforNissyNaviger(parametre);
            } catch (e) {
                const fd = new FormData();
                fd.append('id', o.id);
                fd.append('feil', e.message);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                console.warn('[VERKTØYKASSE] nissy_naviger feilet:', e.message);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] nissy_naviger-poll feil:', e.message);
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


    // Eksponert API for konsoll-debug og manuell testing
    window.__verktoykasse = {
        versjon: VERSJON,
        utforNissyNaviger,
        sjekkNavigerEtterLoad,
        pollNissyNaviger: pollNissyNavigerVentende,
        sokTlfINissy,
        sokPnrINissy
    };

    function lastBasicTools(tilgang) {
        // Eksponerer brukernavn så basic_tools.js kan bruke det som userid mot rekvisisjons-API
        window.__vkt_brukernavn = hentNissyBrukernavn() || '';
        // Velg dev hvis (a) bruker er superadmin og (b) localStorage-flag er satt
        const erSuperadmin = tilgang && tilgang.rolle === 'superadmin';
        const devFlag = (() => { try { return localStorage.getItem('vkt_basic_tools_dev') === '1'; } catch (_) { return false; } })();
        const fil = (erSuperadmin && devFlag) ? 'basic_tools_dev.js' : 'basic_tools.js';
        const s = document.createElement('script');
        s.src = `https://thomaswestby.no/skript/skript.php?fil=${fil}&_=${Date.now()}`;
        s.onload = () => {
            const bt = window.__basicTools;
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl && bt) {
                verEl.textContent = `v${bt.versjon}`;
                if (bt.dev) {
                    const tag = document.createElement('span');
                    tag.textContent = ' DEV';
                    tag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;margin-left:2px;';
                    verEl.appendChild(tag);
                }
            }
        };
        s.onerror = () => {
            console.warn(`[VERKTØYKASSE] kunne ikke laste ${fil}`);
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl) verEl.textContent = '⚠ feilet';
        };
        document.head.appendChild(s);
        console.log(`[VERKTØYKASSE] laster ${fil}`);
    }

    const nissy = hentNissyBrukernavn();
    console.log(`[VERKTØYKASSE v${VERSJON}] Henter tilgang for nissy_id=` + (nissy || '(tom)'));
    hentTilgang(nissy).then(async t => {
        console.log('[VERKTØYKASSE] Tilgang:', t);
        tegnMeny(t);
        tegnAdminStatus();                 // Vis "sjekker"-status umiddelbart
        await oppdaterAdminStatus();       // Første admin-sjekk
        await oppdaterRekvisisjonStatus(); // Første rekvisisjon-sjekk
        lastBasicTools(t);                 // Last inline-handlinger (endre tid, etc)
        pollVentende();                    // Første turid-poll
        pollPnrVentende();                 // Første pnr-poll
        pollTlfVentende();                 // Første tlf-poll
        sjekkNavigerEtterLoad();           // Fortsett evt. navigering fra forrige side
        pollNissyNavigerVentende();        // Første nissy_naviger-poll
        setInterval(oppdaterAdminStatus, ADMIN_PING_MS);
        setInterval(oppdaterRekvisisjonStatus, ADMIN_PING_MS);
        setInterval(pollVentende, TURID_POLL_MS);
        setInterval(pollPnrVentende, TURID_POLL_MS);
        setInterval(pollTlfVentende, TURID_POLL_MS);
        setInterval(pollNissyNavigerVentende, TURID_POLL_MS);
    });
})();
