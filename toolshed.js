/**
 * OUS Verktøykasse — popup-controller for NISSY-bakgrunnsverktøy.
 *
 * Arkitektur:
 *   - Popupen er *launcher* og "keeper" — den starter verktøy, men verktøyet selv
 *     kjører i NISSY-hovedfanen (window.opener), der den har tilgang til NISSY-DOM + cookies.
 *   - Popupen poller opener hvert sek og re-injiserer ethvert verktøy som er
 *     flagget som ønsket-kjørende, men ikke er lastet. Det løser F5-problemet:
 *     etter F5 er NISSY-vinduet fortsatt samme handle, men innholdet fresh →
 *     ingen registry → popup re-injiserer.
 *
 *   - Verktøy kan ha `inject_target: "popup"` i toolshed.json hvis de skal kjøre
 *     i popupen i stedet (for frittstående UI som ikke trenger NISSY-DOM).
 *   - Bare verktøy med `autostart: true` rendres i popupen — de øvrige (Overvåker
 *     Live/Avvik, Samkjører osv.) lastes via egne bookmarks.
 */
(function () {
    'use strict';

    if (window.__westby_toolshed_init) return;
    window.__westby_toolshed_init = true;

    var VERSJON = '1.6';

    try { window.resizeTo(310, 200); } catch (e) {}

    var BASE = 'https://thomaswestby.no/skript/loader.php';
    var doc = document;
    var parentWindow = window.opener;
    var harOpener = !!parentWindow && !parentWindow.closed;

    // === Dokument-oppsett ===
    doc.title = '🧰 Verktøykasse';
    var head = doc.head || doc.getElementsByTagName('head')[0];
    if (!head) { head = doc.createElement('head'); doc.documentElement.insertBefore(head, doc.documentElement.firstChild); }
    var body = doc.body || doc.getElementsByTagName('body')[0];
    if (!body) { body = doc.createElement('body'); doc.documentElement.appendChild(body); }

    if (!doc.querySelector('meta[charset]')) {
        var meta = doc.createElement('meta'); meta.setAttribute('charset', 'utf-8');
        head.appendChild(meta);
    }
    var style = doc.createElement('style');
    style.textContent = [
        '* { box-sizing: border-box; }',
        'html, body { height:100%; }',
        'body { margin:0; padding:0; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; font-size:13px; line-height:1.3; display:flex; flex-direction:column; }',
        '.advarsel { background:rgba(16,185,129,0.12); border-bottom:1px solid rgba(16,185,129,0.45); padding:10px 12px; font-size:12px; color:#a7f3d0; text-align:center; line-height:1.4; flex-shrink:0; }',
        '.advarsel b { color:#10b981; font-size:13px; }',
        '.content { padding:10px 12px; flex:1; display:flex; flex-direction:column; gap:8px; }',
        '.status-line { font-size:11px; color:#94a3b8; text-align:center; flex-shrink:0; }',
        '.tool-btn { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#1e293b; border:1px solid #334155; border-radius:7px; color:#f8fafc; cursor:pointer; font-size:14px; width:100%; text-align:left; font-family:inherit; transition:background 0.12s,border-color 0.12s; }',
        '.tool-btn:hover:not(:disabled) { background:#1e40af; border-color:#3b82f6; }',
        '.tool-btn:disabled { cursor:default; }',
        '.emoji { font-size:20px; flex-shrink:0; }',
        '.tool-txt { flex:1; min-width:0; display:flex; align-items:baseline; gap:6px; }',
        '.tool-navn { font-weight:600; font-size:14px; }',
        '.tool-ver { font-size:10px; color:#64748b; font-weight:500; }',
        '.badge { padding:3px 7px; border-radius:4px; font-size:10px; font-weight:700; letter-spacing:0.4px; color:white; flex-shrink:0; min-width:48px; text-align:center; }',
        '.feil { background:#7f1d1d; color:white; padding:8px 10px; border-radius:6px; font-size:11px; }',
        '.banner-advarsel { background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.4); border-radius:6px; padding:8px 10px; font-size:11px; color:#fbbf24; }'
    ].join('\n');
    head.appendChild(style);

    body.innerHTML = [
        '<div class="advarsel"><b>Aktiv</b> — ikke lukk. Lukkes denne, forsvinner verktøyene ved F5 i NISSY.</div>',
        '<div class="content">',
        '  <div id="__banner"></div>',
        '  <div class="status-line" id="__status">Henter verktøyliste…</div>',
        '  <div id="__tools"></div>',
        '</div>'
    ].join('');

    // === State ===
    // Hva operatør ønsker skal kjøre i NISSY (persistent for popup-sesjon)
    var ønsket = {};
    // Hvilket verktøy-id peker til hvilken tool-definisjon
    var toolsById = {};
    // UI-referanser for å oppdatere badge
    var btnBadgeById = {};
    // Hvilke verktøy vi har sett kjøre i NISSY (brukes til F5-deteksjon)
    var harSettLastet = {};
    // setInterval-ID for keeper-loopen (må kunne kanselleres ved selvReload)
    var keeperIntervalId = null;

    function setBadge(toolId, tekst, farge) {
        var badge = btnBadgeById[toolId];
        if (!badge) return;
        badge.textContent = tekst;
        badge.style.background = farge;
    }

    function openerAlive() {
        return parentWindow && !parentWindow.closed;
    }

    function openerHar(toolId) {
        if (!openerAlive()) return false;
        try {
            var reg = parentWindow.__westby_loaded_tools || {};
            return !!reg[toolId];
        } catch (e) {
            return false;
        }
    }

    function injiserIOpener(tool) {
        if (!openerAlive()) throw new Error('NISSY-fanen er lukket');
        var s = parentWindow.document.createElement('script');
        s.src = BASE + '?v=' + encodeURIComponent(tool.id) + '&_=' + Date.now();
        s.async = true;
        s.onload = function () {
            try {
                parentWindow.__westby_loaded_tools = parentWindow.__westby_loaded_tools || {};
                parentWindow.__westby_loaded_tools[tool.id] = true;
            } catch (e) { /* cross-origin eller lignende */ }
        };
        parentWindow.document.head.appendChild(s);
    }

    function injiserIPopup(tool) {
        var s = doc.createElement('script');
        s.src = BASE + '?v=' + encodeURIComponent(tool.id) + '&_=' + Date.now();
        s.async = true;
        s.onload = function () {
            window.__westby_popup_tools = window.__westby_popup_tools || {};
            window.__westby_popup_tools[tool.id] = true;
        };
        head.appendChild(s);
    }

    function erLastet(toolId) {
        var t = toolsById[toolId];
        if (!t) return false;
        if (t.inject_target === 'popup') {
            return !!(window.__westby_popup_tools && window.__westby_popup_tools[toolId]);
        }
        return openerHar(toolId);
    }

    function startVerktoy(tool) {
        if (tool.inject_target === 'popup') {
            try { injiserIPopup(tool); return true; }
            catch (e) { console.error('inject popup feilet:', e); return false; }
        }
        // Standard: inject i NISSY-fanen
        try { injiserIOpener(tool); return true; }
        catch (e) {
            console.error('inject opener feilet:', e);
            setBadge(tool.id, 'FEIL', '#ef4444');
            visBanner('NISSY-fanen er lukket eller ikke nåbar — åpne NISSY og klikk bookmarken på nytt.', 'warn');
            return false;
        }
    }

    function keeperTick() {
        // Sjekk at alle ønskede verktøy er lastet i riktig target
        if (!openerAlive()) {
            visBanner('NISSY-fanen er lukket. Åpne NISSY og klikk bookmarken for å koble på igjen.', 'warn');
            return;
        } else {
            skjulBanner();
        }
        var f5Oppdaget = false;
        Object.keys(ønsket).forEach(function (toolId) {
            if (!ønsket[toolId]) return;
            var lastet = erLastet(toolId);
            if (lastet) {
                harSettLastet[toolId] = true;
                setBadge(toolId, 'AKTIV', '#10b981');
            } else {
                if (harSettLastet[toolId]) {
                    // Verktøyet var lastet, er borte nå → NISSY ble F5-et
                    f5Oppdaget = true;
                    harSettLastet[toolId] = false;
                }
                var tool = toolsById[toolId];
                if (tool) {
                    setBadge(toolId, 'RE-INJ…', '#f59e0b');
                    startVerktoy(tool);
                    setTimeout(function () {
                        if (erLastet(toolId)) setBadge(toolId, 'AKTIV', '#10b981');
                    }, 300);
                }
            }
        });
        if (f5Oppdaget) selvReload();
    }

    // Hent toolshed.js på nytt og overta popupen — gir brukeren siste versjon
    // ved hver F5 i NISSY uten at popupen må lukkes/åpnes manuelt.
    function selvReload() {
        if (keeperIntervalId) { clearInterval(keeperIntervalId); keeperIntervalId = null; }
        try { avsluttSesjon(); } catch (e) {}
        try { delete window.__westby_toolshed_init; } catch (e) { window.__westby_toolshed_init = false; }
        body.innerHTML = '';
        var s = doc.createElement('script');
        s.src = 'https://thomaswestby.no/skript/skript.php?fil=toolshed.js&_=' + Date.now();
        head.appendChild(s);
    }

    // Bannerfunksjoner
    function visBanner(tekst, type) {
        var b = doc.getElementById('__banner');
        if (!b) return;
        b.className = type === 'warn' ? 'banner-advarsel' : 'feil';
        b.textContent = tekst;
        b.style.display = '';
    }
    function skjulBanner() {
        var b = doc.getElementById('__banner');
        if (b) b.style.display = 'none';
    }
    skjulBanner();

    function renderTool(t) {
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'tool-btn';
        btn.innerHTML =
            '<span class="emoji">' + (t.emoji || '🔧') + '</span>' +
            '<div class="tool-txt">' +
            '<span class="tool-navn"></span>' +
            '<span class="tool-ver">v' + VERSJON + '</span>' +
            '</div>' +
            '<span class="badge"></span>';

        btn.querySelector('.tool-navn').textContent = t.navn || t.id;
        if (t.beskrivelse) btn.title = t.beskrivelse;
        var badge = btn.querySelector('.badge');
        btnBadgeById[t.id] = badge;

        // Hvis allerede ønsket/lastet
        if (ønsket[t.id] && erLastet(t.id)) {
            setBadge(t.id, 'AKTIV', '#10b981');
        }

        btn.onclick = function () {
            if (ønsket[t.id] && erLastet(t.id)) {
                setBadge(t.id, 'KJØRER', '#10b981');
                return;
            }
            ønsket[t.id] = true;
            setBadge(t.id, 'STARTER…', '#f59e0b');
            if (startVerktoy(t)) {
                setTimeout(function () {
                    if (erLastet(t.id)) setBadge(t.id, 'AKTIV', '#10b981');
                }, 400);
            }
        };

        // Autostart
        if (t.autostart && !ønsket[t.id]) {
            ønsket[t.id] = true;
            setBadge(t.id, 'STARTER…', '#f59e0b');
            if (startVerktoy(t)) {
                setTimeout(function () {
                    if (erLastet(t.id)) setBadge(t.id, 'AKTIV', '#10b981');
                }, 400);
            }
        }

        return btn;
    }

    // === Hent toolshed.json og bygg UI ===
    fetch(BASE + '?type=toolshed-json&_=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
            doc.getElementById('__status').style.display = 'none';
            var container = doc.getElementById('__tools');
            container.innerHTML = '';
            (data.tools || []).forEach(function (t) {
                toolsById[t.id] = t;
                if (!t.autostart) return;
                container.appendChild(renderTool(t));
            });
            // Start keeper-loop — sjekker hvert sekund at ønskede verktøy kjører
            keeperIntervalId = setInterval(keeperTick, 1000);
        })
        .catch(function (e) {
            doc.getElementById('__status').style.display = 'none';
            visBanner('✗ Kunne ikke laste verktøyliste: ' + e.message + ' — er du på OUS-nettverket?', 'feil');
        });

    // === Sjekk om NISSY-fanen er åpen + vis advarsel hvis ikke ===
    if (!harOpener) {
        visBanner('Denne popupen ble åpnet uten en tilknyttet NISSY-fane. Lukk og åpne på nytt fra bookmarken i NISSY.', 'warn');
    }

    // === Sesjon-tracking ===
    // Synker mot ovr_sesjoner via live_sesjon.php — samme endpoint som Live/Avvik.
    // Vises i OUS Dashboard → Sesjoner-panel.
    var SESJON_URL = 'https://thomaswestby.no/skript/live_sesjon.php';
    var sesjonId = null;

    function hentSignaturFraOpener() {
        if (!openerAlive()) return 'Ukjent';
        try {
            var match = parentWindow.document.body.innerHTML.match(/Pasientreisekontor[^<]*-\s*(?:&nbsp;\s*)*([^<]+)/);
            if (match) {
                var fullNavn = match[1].trim().replace(/&nbsp;/g, '').trim();
                var deler = fullNavn.split(',').map(function (s) { return s.trim(); });
                if (deler.length === 2) return deler[1] + ' ' + deler[0].charAt(0) + '.';
                return fullNavn;
            }
        } catch (e) {}
        try { return parentWindow.localStorage.getItem('overvaker_signatur') || 'Ukjent'; } catch (e) {}
        return 'Ukjent';
    }

    function hentNissyBrukernavnFraOpener() {
        if (!openerAlive()) return '';
        try {
            var lagret = parentWindow.localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret.trim().toLowerCase();
            var cookies = parentWindow.document.cookie.split(';').map(function (c) { return c.trim(); });
            var suffikser = ['efilter', 'vfilter', 'rfilter', 'popp', 'vopp'];
            for (var i = 0; i < cookies.length; i++) {
                var navn = cookies[i].split('=')[0];
                for (var j = 0; j < suffikser.length; j++) {
                    var s = suffikser[j];
                    if (navn.endsWith(s) && navn.length > s.length) {
                        return navn.slice(0, -s.length).toLowerCase();
                    }
                }
            }
        } catch (e) {}
        return '';
    }

    function startSesjon() {
        var params = new URLSearchParams({
            handling: 'start',
            nissy_id: hentNissyBrukernavnFraOpener(),
            signatur: hentSignaturFraOpener(),
            versjon: VERSJON,
            skript: 'Verktøykasse'
        });
        fetch(SESJON_URL + '?' + params)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (j) { if (j && j.ok && j.id) sesjonId = j.id; })
            .catch(function () {});
    }

    function heartbeatSesjon() {
        if (sesjonId === null) { startSesjon(); return; }
        var params = new URLSearchParams({
            handling: 'heartbeat', id: sesjonId, versjon: VERSJON
        });
        fetch(SESJON_URL + '?' + params).catch(function () {});
    }

    function avsluttSesjon() {
        if (sesjonId === null) return;
        try {
            var data = new Blob([JSON.stringify({ handling: 'slutt', id: sesjonId })], { type: 'application/json' });
            navigator.sendBeacon(SESJON_URL, data);
        } catch (e) {}
        sesjonId = null;
    }

    window.addEventListener('beforeunload', avsluttSesjon);
    window.addEventListener('pagehide', avsluttSesjon);

    startSesjon();
    setInterval(heartbeatSesjon, 60000);

    // Esc → lukk popupen
    doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') window.close();
    });
})();
