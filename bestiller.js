// ############################################################
// # Snippets: NissyBestillNåAuto v5.4                       #
// # Skrevet av Jan R. Jørgensen, Pasientreiser Østfold       #
// # Skrevet av Thomas Westby, Pasientreiser Oslo og Akershus #
// # v5.4: Floating draggable panel, kun fetch-modus          #
// ############################################################

const VERSION = '5.4';

(() => {
  // Rydd localStorage så panelet alltid vises ved kjøring
  try { localStorage.removeItem('nbna.v5'); } catch(e) {}

  const ROW_ID_PREFIX = "Rxxx";
  const MAX_DISPATCH = 20;
  const MAX_ONGOING = null;
  const PAUSE_ETTER_DISPATCH_SEK = 5;
  const PAUSE_NAR_TOM_SEK = 5;

  // === Fetch-oppsett ===
  const FETCH_BASE = 'https://pastrans-sorost.mq.nhn.no/planlegging/ajax-dispatch';
  const DEFAULT_RFILTER = 19138;
  function datoNavn(dagerFrem) {
    var d = new Date(); d.setDate(d.getDate() + dagerFrem);
    return String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0');
  }
  const FILTRE = [
    { id: 19142, navn: datoNavn(6) + '-' + datoNavn(4) },
    { id: 19284, navn: datoNavn(6) },
    { id: 19138, navn: datoNavn(3) },
    { id: 19176, navn: datoNavn(2) },
    { id: 19274, navn: datoNavn(1) },
  ];

  // === IndexedDB Oppsett ===
  const DB_NAME = 'NissyBestillStats';
  const DB_VERSION = 2;
  const STORE_NAME = 'dailyStats';

  let db = null;
  const today = () => new Date().toISOString().slice(0, 10);

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'date' });
        }
      };
    });
  }

  function getStats() {
    return new Promise((resolve) => {
      if (!db) return resolve(null);
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(today());
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  function saveStats(s) {
    return new Promise((resolve) => {
      if (!db) return resolve();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ date: today(), ...s });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  function cleanOldStats() {
    if (!db) return;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.date !== today()) cursor.delete();
        cursor.continue();
      }
    };
  }

  // === Parse starttid fra "DD.MM HH:MM" ===
  function parseStartTid(tekst) {
    const m = (tekst || '').trim().match(/(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
    if (!m) return 99999999;
    const now = new Date();
    const year = now.getFullYear();
    return new Date(year, +m[2] - 1, +m[1], +m[3], +m[4]).getTime();
  }

  // === Fetch-basert ressurshenting (sortert etter starttid) ===
  async function hentRessurser(rfilter) {
    const url = `${FETCH_BASE}?did=all&action=openres&rid=-1&search=&rfilter=${rfilter}&t=${Date.now()}`;
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const xmlText = new TextDecoder('iso-8859-1').decode(buffer);
    const xml = new DOMParser().parseFromString(xmlText, 'text/xml');

    const bestillListe = [];
    const bestillSet = new Set();
    const pagaende = new Set();

    xml.querySelectorAll('response').forEach(resp => {
      const d = document.createElement('div');
      d.innerHTML = resp.textContent;

      d.querySelectorAll('a[title="Bestill nå"]').forEach(a => {
        const href = a.getAttribute('href') || '';
        const m = href.match(/immediateDispatch\s*\(\s*'Rxxx'\s*,\s*(\d+)\s*\)/);
        if (m) {
          const id = m[1];
          bestillSet.add(id);
          const tr = a.closest('tr');
          const tds = tr ? tr.querySelectorAll('td') : [];
          const startTekst = tds.length >= 3 ? tds[2].textContent : '';
          bestillListe.push({ id, startMs: parseStartTid(startTekst) });
        }
      });

      d.querySelectorAll('td[id^="Rxxxlinkxxx"]').forEach(td => {
        if (/pågår/i.test(td.textContent)) {
          pagaende.add(td.id.replace('Rxxxlinkxxx', ''));
        }
      });
    });

    console.log('[Bestiller] Sorterer ' + bestillListe.length + ' bestillbare etter starttid');
    bestillListe.sort((a, b) => a.startMs - b.startMs);
    if (bestillListe.length > 0) {
      const f = bestillListe[0];
      const s = bestillListe[bestillListe.length - 1];
      console.log('[Bestiller] Tidligste: id=' + f.id + ' ' + new Date(f.startMs).toLocaleTimeString('no-NO',{hour:'2-digit',minute:'2-digit'}) + ' | Seneste: id=' + s.id + ' ' + new Date(s.startMs).toLocaleTimeString('no-NO',{hour:'2-digit',minute:'2-digit'}));
    }

    return { bestillListe, bestillSet, pagaende };
  }

  // === State ===
  let stats = { firstDispatch: null, sent: 0 };
  let trackedOngoing = new Set();
  let eligibleSorted = [];
  const eligibleIds = new Set();
  const dispatchedIds = new Set();

  // === UI ===
  const P = 'nbna54';
  let oldPanel = document.getElementById(P);
  if (oldPanel) oldPanel.remove();
  let oldFab = document.getElementById(P + 'Fab');
  if (oldFab) oldFab.remove();
  let oldStyle = document.getElementById(P + 'Style');
  if (oldStyle) oldStyle.remove();

  // Position fra localStorage
  const POS_KEY = 'nbna.pos';
  const savedPos = (() => { try { return JSON.parse(localStorage.getItem(POS_KEY) || '{}'); } catch { return {}; } })();

  const panel = document.createElement('div');
  panel.id = P;
  panel.setAttribute('data-state', 'stopped');
  panel.innerHTML = `
    <div class="${P}-drag" id="${P}Drag">
      <div class="${P}-drag-dots">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
      <div class="${P}-title">BESTILLER</div>
      <div class="${P}-ver">v${VERSION}</div>
      <div class="${P}-drag-spacer"></div>
      <button class="${P}-btn ${P}-btn-min" id="${P}Min" title="Minimer">&#x2013;</button>
      <button class="${P}-btn ${P}-btn-close" id="${P}Close" title="Lukk">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
    </div>
    <div class="${P}-body">
      <div class="${P}-stats-row">
        <div class="${P}-stat-group">
          <label class="${P}-stat-label">FILTER</label>
          <select id="${P}Filter" class="${P}-select"></select>
        </div>
        <div class="${P}-stat-group">
          <label class="${P}-stat-label">BESTILTE</label>
          <div class="${P}-stat-val ${P}-val-sent" id="${P}Sendt">0</div>
        </div>
        <div class="${P}-stat-group">
          <label class="${P}-stat-label">PÅGÅR</label>
          <div class="${P}-stat-val ${P}-val-ongoing" id="${P}Pagar">0</div>
        </div>
        <div class="${P}-stat-group">
          <label class="${P}-stat-label">VENTER</label>
          <div class="${P}-stat-val ${P}-val-waiting" id="${P}Teller">0</div>
        </div>
        <div class="${P}-stat-group">
          <label class="${P}-stat-label">STATUS</label>
          <div class="${P}-stat-val ${P}-val-status" id="${P}Status">STOPPET</div>
        </div>
      </div>
      <div class="${P}-controls">
        <div class="${P}-action-btns">
          <button class="${P}-btn ${P}-btn-play" id="${P}Toggle" title="Start">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
          </button>
          <button class="${P}-btn ${P}-btn-reset" id="${P}Reset" title="Nullstill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 12a9 9 0 1 1 3 6.7"/><polyline points="3 20 3 14 9 14"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div class="${P}-warning-bar" id="${P}Warn">
      <span class="${P}-warn-icon">&#x26A0;</span>
      <span>Ingen aktivitet på 5 min</span>
    </div>`;

  // FAB (minimert knapp)
  const fab = document.createElement('div');
  fab.id = P + 'Fab';
  fab.className = P + '-fab';
  fab.innerHTML = `<span class="${P}-fab-icon">B</span><span class="${P}-fab-count" id="${P}FabCount">0</span>`;
  fab.style.display = 'none';

  // === CSS ===
  const css = document.createElement('style');
  css.id = P + 'Style';
  css.textContent = `
    #${P} {
      position: fixed;
      top: ${savedPos.top || 16}px;
      left: ${savedPos.left || 16}px;
      z-index: 2147483647;
      min-width: 380px;
      border-radius: 10px;
      border: 1.5px solid rgba(255,255,255,.12);
      background: rgba(18,20,28,.88);
      backdrop-filter: blur(18px) saturate(1.4);
      -webkit-backdrop-filter: blur(18px) saturate(1.4);
      box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.06) inset;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,.88);
      user-select: none;
      transition: border-color .4s, box-shadow .4s;
      overflow: hidden;
    }

    /* === State borders === */
    #${P}[data-state="active"] {
      border-color: rgba(52,211,153,.5);
      box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 0 20px rgba(52,211,153,.15), 0 1px 0 rgba(255,255,255,.06) inset;
    }
    #${P}[data-state="stopped"] {
      border-color: rgba(248,113,113,.4);
      box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 0 12px rgba(248,113,113,.1), 0 1px 0 rgba(255,255,255,.06) inset;
    }
    #${P}[data-state="warning"] {
      border-color: rgba(251,191,36,.6);
      animation: ${P}-pulse 1.8s ease-in-out infinite;
    }
    @keyframes ${P}-pulse {
      0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 0 12px rgba(251,191,36,.15); }
      50% { box-shadow: 0 8px 32px rgba(0,0,0,.45), 0 0 28px rgba(251,191,36,.35); }
    }

    /* === Drag header === */
    .${P}-drag {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px 6px;
      cursor: grab;
      border-bottom: 1px solid rgba(255,255,255,.07);
      background: rgba(255,255,255,.03);
    }
    .${P}-drag:active { cursor: grabbing; }

    .${P}-drag-dots {
      display: grid;
      grid-template-columns: repeat(3, 4px);
      gap: 3px;
      opacity: .3;
    }
    .${P}-drag-dots span {
      width: 4px; height: 4px;
      border-radius: 50%;
      background: rgba(255,255,255,.6);
    }

    .${P}-title {
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,.7);
    }
    .${P}-ver {
      font-size: 10px;
      color: rgba(255,255,255,.3);
      font-weight: 500;
    }
    .${P}-drag-spacer { flex: 1; }

    /* === Body === */
    .${P}-body { padding: 10px 12px 10px; }

    .${P}-stats-row {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .${P}-stat-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .${P}-stat-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,.35);
      text-transform: uppercase;
    }

    .${P}-stat-val {
      font-size: 16px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .${P}-val-sent { color: #60a5fa; }
    .${P}-val-ongoing { color: #fb923c; }
    .${P}-val-waiting { color: rgba(255,255,255,.7); }
    .${P}-val-status {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .5px;
    }
    #${P}[data-state="active"] .${P}-val-status { color: #34d399; }
    #${P}[data-state="stopped"] .${P}-val-status { color: #f87171; }
    #${P}[data-state="warning"] .${P}-val-status { color: #fbbf24; }

    /* === Select === */
    .${P}-select {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 2px 6px;
      cursor: pointer;
      outline: none;
      font-family: inherit;
    }
    .${P}-select:hover { border-color: rgba(255,255,255,.25); }
    .${P}-select:focus { border-color: rgba(96,165,250,.5); }
    .${P}-select option { background: #1e2030; color: #fff; }

    /* === Controls row === */
    .${P}-controls {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,.06);
    }

    /* === Buttons === */
    .${P}-action-btns {
      display: flex;
      gap: 5px;
    }

    .${P}-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 6px;
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.6);
      cursor: pointer;
      transition: all .2s;
      padding: 0;
      font-family: inherit;
    }
    .${P}-btn:hover {
      background: rgba(255,255,255,.12);
      color: rgba(255,255,255,.9);
      border-color: rgba(255,255,255,.2);
    }

    .${P}-btn-play {
      width: 36px; height: 28px;
      color: #34d399;
      border-color: rgba(52,211,153,.25);
    }
    .${P}-btn-play:hover {
      background: rgba(52,211,153,.15);
      color: #34d399;
      border-color: rgba(52,211,153,.4);
    }
    #${P}[data-state="active"] .${P}-btn-play {
      color: #f87171;
      border-color: rgba(248,113,113,.25);
    }
    #${P}[data-state="active"] .${P}-btn-play:hover {
      background: rgba(248,113,113,.15);
      border-color: rgba(248,113,113,.4);
    }

    .${P}-btn-reset {
      width: 28px; height: 28px;
    }
    .${P}-btn-close {
      width: 28px; height: 28px;
    }
    .${P}-btn-close:hover {
      color: #f87171;
      border-color: rgba(248,113,113,.3);
    }

    .${P}-btn-min {
      width: 22px; height: 18px;
      font-size: 14px;
      font-weight: 700;
      line-height: 1;
    }

    /* === Warning bar === */
    .${P}-warning-bar {
      display: none;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background: rgba(251,191,36,.12);
      border-top: 1px solid rgba(251,191,36,.2);
      font-size: 11px;
      font-weight: 600;
      color: #fbbf24;
    }
    #${P}[data-state="warning"] .${P}-warning-bar { display: flex; }
    .${P}-warn-icon { font-size: 13px; }

    /* === FAB (minimized) === */
    .${P}-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(18,20,28,.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1.5px solid rgba(255,255,255,.15);
      box-shadow: 0 4px 16px rgba(0,0,0,.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: all .25s;
      user-select: none;
    }
    .${P}-fab:hover {
      transform: scale(1.1);
      border-color: rgba(96,165,250,.4);
      box-shadow: 0 4px 20px rgba(0,0,0,.5), 0 0 12px rgba(96,165,250,.2);
    }
    .${P}-fab-icon {
      font-weight: 800;
      font-size: 15px;
      color: rgba(255,255,255,.8);
      font-family: 'Segoe UI', sans-serif;
      line-height: 1;
    }
    .${P}-fab-count {
      font-size: 8px;
      font-weight: 700;
      color: #60a5fa;
      font-family: 'Segoe UI', sans-serif;
      line-height: 1;
    }
    .${P}-fab[data-active="true"] {
      border-color: rgba(52,211,153,.5);
      box-shadow: 0 4px 16px rgba(0,0,0,.4), 0 0 10px rgba(52,211,153,.2);
    }
    .${P}-fab[data-active="true"] .${P}-fab-icon { color: #34d399; }
  `;

  document.head.appendChild(css);
  document.body.appendChild(panel);
  document.body.appendChild(fab);

  // === Drag logic ===
  const dragHandle = panel.querySelector('#' + P + 'Drag');
  let isDragging = false;
  let dragOffX = 0, dragOffY = 0;

  dragHandle.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    isDragging = true;
    dragOffX = e.clientX - panel.offsetLeft;
    dragOffY = e.clientY - panel.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let nx = e.clientX - dragOffX;
    let ny = e.clientY - dragOffY;
    // Clamp to viewport
    nx = Math.max(0, Math.min(nx, window.innerWidth - panel.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - panel.offsetHeight));
    panel.style.left = nx + 'px';
    panel.style.top = ny + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      try {
        localStorage.setItem(POS_KEY, JSON.stringify({
          top: parseInt(panel.style.top),
          left: parseInt(panel.style.left)
        }));
      } catch {}
    }
  });

  // === Persistens ===
  const LS_KEY = 'nbna.v5';
  const localState = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } })();
  function saveLocalState(patch) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(Object.assign(localState, patch))); } catch{}
  }

  const el = {
    sendt: panel.querySelector('#' + P + 'Sendt'),
    pagar: panel.querySelector('#' + P + 'Pagar'),
    teller: panel.querySelector('#' + P + 'Teller'),
    status: panel.querySelector('#' + P + 'Status'),
    filter: panel.querySelector('#' + P + 'Filter'),
    btnToggle: panel.querySelector('#' + P + 'Toggle'),
    btnReset: panel.querySelector('#' + P + 'Reset'),
    btnClose: panel.querySelector('#' + P + 'Close'),
    btnMin: panel.querySelector('#' + P + 'Min'),
    fabCount: fab.querySelector('#' + P + 'FabCount')
  };

  // Populer filter-dropdown
  FILTRE.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.navn;
    el.filter.appendChild(opt);
  });
  const lagretFilter = localState.rfilter || DEFAULT_RFILTER;
  el.filter.value = lagretFilter;
  let aktivtFilter = +el.filter.value || DEFAULT_RFILTER;

  el.filter.addEventListener('change', () => {
    aktivtFilter = +el.filter.value || DEFAULT_RFILTER;
    saveLocalState({ rfilter: aktivtFilter });
    eligibleSorted = [];
    eligibleIds.clear();
    dispatchedIds.clear();
    setText(el.teller, 0);
  });

  let sStatus = 'Stoppet';
  let loopTimeout = null;

  const setText = (node, val) => { if (node) node.textContent = val; };

  function updateStatsUI() {
    setText(el.sendt, stats.sent);
    setText(el.pagar, trackedOngoing.size);
    setText(el.teller, eligibleIds.size);
    setText(el.fabCount, stats.sent);
  }

  // === Minimize / Restore ===
  let minimized = false;

  el.btnMin.addEventListener('click', () => {
    minimized = true;
    panel.style.display = 'none';
    fab.style.display = 'flex';
    fab.setAttribute('data-active', sStatus === 'Startet' ? 'true' : 'false');
  });

  fab.addEventListener('click', () => {
    minimized = false;
    panel.style.display = '';
    fab.style.display = 'none';
  });

  // === Aktivitetssjekk ===
  let warningActive = false;
  let lastActivityTime = Date.now();
  const INACTIVITY_THRESHOLD_MS = 5 * 60 * 1000;

  function registerActivity() {
    lastActivityTime = Date.now();
    if (warningActive) {
      warningActive = false;
      setStatusUI(sStatus);
    }
  }

  function checkForInactivity() {
    if (sStatus !== 'Startet' || stats.sent === 0) return;
    if (Date.now() - lastActivityTime > INACTIVITY_THRESHOLD_MS && !warningActive) {
      warningActive = true;
      panel.setAttribute('data-state', 'warning');
      setText(el.status, 'INAKTIV');
      if (Notification.permission === 'granted') {
        new Notification('Bestiller', { body: 'Ingen aktivitet på 5 min!', requireInteraction: true });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }

  // === Rebuild ===
  async function rebuildEligible() {
    const { bestillListe, bestillSet, pagaende } = await hentRessurser(aktivtFilter);

    eligibleSorted = bestillListe;
    eligibleIds.clear();
    bestillSet.forEach(id => eligibleIds.add(id));

    const nyPagaende = new Set(trackedOngoing);
    dispatchedIds.forEach(id => {
      if (!bestillSet.has(id)) {
        nyPagaende.add(id);
        dispatchedIds.delete(id);
        registerActivity();
      }
    });
    trackedOngoing = nyPagaende;
    updateStatsUI();
    saveStats(stats);
  }

  // === Dispatch ===
  function safeDispatch(id) {
    console.log('[Bestiller] Dispatch: rid=' + id);
    registerActivity();
    if (!stats.firstDispatch) stats.firstDispatch = new Date().toISOString();
    stats.sent++;
    updateStatsUI();
    saveStats(stats);

    const linkTd = document.getElementById('Rxxxlinkxxx' + id);
    if (linkTd) linkTd.innerHTML = 'pågår';

    const dispUrl = `${FETCH_BASE}?update=false&action=updateres&rid=${+id}&status=13&t=${Date.now()}`;
    fetch(dispUrl).then(r => {
      console.log('[Bestiller] Fetch OK:', id, 'HTTP', r.status);
    }).catch(e => {
      console.error('[Bestiller] Fetch feilet:', id, e.message);
    });
  }

  function triggerRun() {
    const nye = eligibleSorted.filter(e => !dispatchedIds.has(e.id));
    if (nye.length === 0) return;
    let slotsLeft = MAX_DISPATCH;
    if (MAX_ONGOING != null) {
      slotsLeft = Math.max(0, Math.min(MAX_DISPATCH, MAX_ONGOING - trackedOngoing.size));
    }
    nye.slice(0, slotsLeft).forEach(e => {
      safeDispatch(e.id);
      dispatchedIds.add(e.id);
    });
  }

  // === Hovedloop ===
  let lastDate = today();

  async function bestLoop() {
    if (sStatus !== 'Startet') return;

    const currentDate = today();
    if (currentDate !== lastDate) {
      lastDate = currentDate;
      stats = { firstDispatch: null, sent: 0 };
      trackedOngoing.clear();
      dispatchedIds.clear();
      cleanOldStats();
      updateStatsUI();
    }

    checkForInactivity();

    try {
      await rebuildEligible();
      const nyeIds = eligibleSorted.filter(e => !dispatchedIds.has(e.id));
      console.log('[Bestiller] Runde: eligible=' + eligibleIds.size + ' dispatched=' + dispatchedIds.size + ' nye=' + nyeIds.length);

      if (nyeIds.length > 0) {
        triggerRun();
        loopTimeout = setTimeout(bestLoop, PAUSE_ETTER_DISPATCH_SEK * 1000);
      } else {
        loopTimeout = setTimeout(bestLoop, PAUSE_NAR_TOM_SEK * 1000);
      }
    } catch (err) {
      console.error('[Bestiller] Loop feilet:', err.message);
      loopTimeout = setTimeout(bestLoop, PAUSE_NAR_TOM_SEK * 1000);
    }
  }

  // === UI-kontroll ===
  const playSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>';
  const stopSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';

  function setStatusUI(s) {
    sStatus = s;
    if (s === 'Startet') {
      setText(el.status, 'AKTIV');
      panel.setAttribute('data-state', 'active');
      el.btnToggle.innerHTML = stopSvg;
      el.btnToggle.title = 'Stopp';
      fab.setAttribute('data-active', 'true');
    } else {
      setText(el.status, 'STOPPET');
      panel.setAttribute('data-state', 'stopped');
      el.btnToggle.innerHTML = playSvg;
      el.btnToggle.title = 'Start';
      fab.setAttribute('data-active', 'false');
    }
    saveLocalState({ status: s });
  }

  // Toggle
  el.btnToggle.addEventListener('click', () => {
    if (sStatus === 'Startet') {
      if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
      setStatusUI('Stoppet');
    } else {
      setStatusUI('Startet');
      bestLoop();
    }
  });

  el.btnReset.addEventListener('click', () => {
    if (confirm('Nullstille dagens statistikk?')) {
      stats = { firstDispatch: null, sent: 0 };
      trackedOngoing.clear();
      dispatchedIds.clear();
      saveStats(stats);
      updateStatsUI();
    }
  });

  el.btnClose.addEventListener('click', () => {
    if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
    saveLocalState({ enabled: false });
    panel.remove();
    fab.remove();
    css.remove();
  });

  // === Init ===
  async function init() {
    await openDB();
    cleanOldStats();
    const savedStats = await getStats();
    if (savedStats) {
      stats.firstDispatch = savedStats.firstDispatch || null;
      stats.sent = savedStats.sent || 0;
    }
    updateStatsUI();
    setStatusUI('Stoppet');
    console.log(`[Bestiller v${VERSION}] Klar (filter: ${aktivtFilter}) — floating panel`);
  }

  init();
})();
