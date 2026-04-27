/**
 * OUS Verktøyhylle — popup-controller for NISSY-verktøy.
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
 */
(function () {
    'use strict';

    if (window.__westby_toolshed_init) return;
    window.__westby_toolshed_init = true;

    var BASE = 'https://thomaswestby.no/skript/loader.php';
    var doc = document;
    var parentWindow = window.opener;
    var harOpener = !!parentWindow && !parentWindow.closed;

    // === Dokument-oppsett ===
    doc.title = '🧰 Verktøyhylle';
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
        'body { margin:0; padding:0; background:#0f172a; color:#f8fafc; font-family:system-ui,-apple-system,sans-serif; font-size:14px; line-height:1.4; }',
        '.hdr { background:#1e293b; padding:10px 16px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center; }',
        '.hdr h1 { margin:0; font-size:15px; font-weight:700; }',
        '.hdr-ver { font-size:10px; color:#64748b; }',
        '.body { padding:14px 16px; }',
        '.status-line { font-size:12px; color:#94a3b8; margin-bottom:12px; text-align:center; }',
        '.tool-btn { display:flex; align-items:center; gap:10px; padding:10px 12px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#f8fafc; cursor:pointer; font-size:13px; width:100%; text-align:left; font-family:inherit; margin-bottom:6px; transition:background 0.12s,border-color 0.12s; }',
        '.tool-btn:hover:not(:disabled) { background:#1e40af; border-color:#3b82f6; }',
        '.tool-btn:disabled { cursor:default; }',
        '.emoji { font-size:20px; flex-shrink:0; }',
        '.tool-txt { flex:1; min-width:0; }',
        '.tool-navn { font-weight:600; }',
        '.tool-beskr { font-size:11px; color:#94a3b8; margin-top:2px; }',
        '.badge { padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; letter-spacing:0.3px; color:white; flex-shrink:0; min-width:52px; text-align:center; }',
        '.ftr { padding:8px 16px; border-top:1px solid #334155; font-size:10px; color:#64748b; text-align:center; }',
        '.feil { background:#7f1d1d; color:white; padding:8px 12px; border-radius:6px; font-size:12px; margin-bottom:10px; }',
        '.banner-advarsel { background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.4); border-radius:6px; padding:8px 12px; font-size:11px; color:#fbbf24; margin-bottom:10px; }'
    ].join('\n');
    head.appendChild(style);

    body.innerHTML = [
        '<div class="hdr"><h1>🧰 Verktøyhylle</h1><span class="hdr-ver" id="__version">laster…</span></div>',
        '<div class="body">',
        '  <div id="__banner"></div>',
        '  <div class="status-line" id="__status">Henter verktøyliste…</div>',
        '  <div id="__tools"></div>',
        '</div>',
        '<div class="ftr" id="__footer">Popupen kan minimeres. Den holder verktøy i gang i NISSY — også etter F5.</div>'
    ].join('');

    // === State ===
    // Hva operatør ønsker skal kjøre i NISSY (persistent for popup-sesjon)
    var ønsket = {};
    // Hvilket verktøy-id peker til hvilken tool-definisjon
    var toolsById = {};
    // UI-referanser for å oppdatere badge
    var btnBadgeById = {};

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
        Object.keys(ønsket).forEach(function (toolId) {
            if (!ønsket[toolId]) return;
            if (!erLastet(toolId)) {
                var tool = toolsById[toolId];
                if (tool) {
                    setBadge(toolId, 'RE-INJ…', '#f59e0b');
                    startVerktoy(tool);
                    setTimeout(function () {
                        if (erLastet(toolId)) setBadge(toolId, 'AKTIV', '#10b981');
                    }, 300);
                }
            } else {
                setBadge(toolId, 'AKTIV', '#10b981');
            }
        });
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
            '<div class="tool-navn"></div>' +
            (t.beskrivelse ? '<div class="tool-beskr"></div>' : '') +
            '</div>' +
            '<span class="badge"></span>';

        btn.querySelector('.tool-navn').textContent = t.navn || t.id;
        if (t.beskrivelse) btn.querySelector('.tool-beskr').textContent = t.beskrivelse;
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
                container.appendChild(renderTool(t));
            });
            doc.getElementById('__version').textContent = 'v' + (data.versjon || '1.0');
            // Start keeper-loop — sjekker hvert sekund at ønskede verktøy kjører
            setInterval(keeperTick, 1000);
        })
        .catch(function (e) {
            doc.getElementById('__status').style.display = 'none';
            visBanner('✗ Kunne ikke laste verktøyliste: ' + e.message + ' — er du på OUS-nettverket?', 'feil');
        });

    // === Sjekk om NISSY-fanen er åpen + vis advarsel hvis ikke ===
    if (!harOpener) {
        visBanner('Denne popupen ble åpnet uten en tilknyttet NISSY-fane. Lukk og åpne på nytt fra bookmarken i NISSY.', 'warn');
    }

    // Esc → lukk popupen
    doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') window.close();
    });
})();
