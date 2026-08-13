/* ============================================================================
 * gtravel_agent.js  —  g-travel (Softinventor) oppslags-agent
 * ----------------------------------------------------------------------------
 * KJØRER PÅ:  gto.softinventor.com  (innlogget g-travel-portal)
 * FORMÅL:     read-only oppslag — gi en Bestillingsreferanse (= NISSY Ressurs-
 *             kode, f.eks. "H1WHDB") og få flightnr + landingstid tilbake.
 *
 * Auth-kjede (verifisert 2026-06-04, ingen sniffing/monkey-patch):
 *   1) GET /login/refresh_token        (cookies, same-origin) → ferskt Bearer-token i body
 *   2) GET gtravel-api .../BookingLists?pnr=<ref>   (Bearer)  → bookingId
 *   3) GET gtravel-api .../Bookings?bookingId=<id>  (Bearer)  → Flight-arrays
 *
 * Flightdata ligger som PARALLELLE arrays per leg i Elements[i].Flight:
 *   FlightNumbers ["SK281","SK4196"]  Departures/Arrivals (ISO)  Destinations ["OSL-BGO",…]
 *
 * MERK: denne fila er bare oppslags-kjernen (steg "agent først"). Heartbeat +
 *       relé-polling kobles på når relé-et (gtravel_relay.php) er klart.
 * ========================================================================== */
(function () {
  'use strict';

  const VERSJON = '0.4';   // 0.4: keep-alive — fornyer token hvert 10. min så g-travel-sesjonen holdes varm når idle
  const PORTAL  = 'https://gto.softinventor.com';
  const API     = 'https://gtravel-api.softinventor.com/api/v1';
  const TOKEN_TTL_MS = 12 * 60 * 1000;   // fornyer token hvert ~12 min (sliding session er 20 min)

  // ---- token-cache --------------------------------------------------------
  let _token = null;
  let _tokenTid = 0;

  async function friskToken(tving) {
    const naa = Date.now();
    if (!tving && _token && (naa - _tokenTid) < TOKEN_TTL_MS) return _token;
    const res = await fetch(PORTAL + '/login/refresh_token', { credentials: 'include' });
    if (!res.ok) throw new Error('refresh_token ' + res.status + ' (utlogget?)');
    let t = (await res.text()).trim().replace(/^"|"$/g, '');
    if (!t) throw new Error('refresh_token ga tom body');
    _token = /^Bearer /i.test(t) ? t : 'Bearer ' + t;
    _tokenTid = naa;
    return _token;
  }

  // ---- API-helper med auto-retry ved 401 ----------------------------------
  async function apiGet(path) {
    let auth = await friskToken(false);
    let res = await fetch(API + path, { headers: { Authorization: auth } });
    if (res.status === 401) {                       // token utløpt → frisk + prøv én gang til
      auth = await friskToken(true);
      res = await fetch(API + path, { headers: { Authorization: auth } });
    }
    if (!res.ok) throw new Error('API ' + res.status + ' for ' + path);
    return res.json();
  }

  // ---- parse Flight-arrays til legg ---------------------------------------
  function parseLegg(flight) {
    if (!flight) return [];
    const nr   = flight.FlightNumbers || [];
    const dep  = flight.Departures    || [];
    const arr  = flight.Arrivals      || [];
    const dest = flight.Destinations  || [];
    const n = Math.max(nr.length, dest.length);
    const legg = [];
    for (let i = 0; i < n; i++) {
      const rute = (dest[i] || '').split('-');         // "OSL-BGO" → ["OSL","BGO"]
      legg.push({
        flightNr:  nr[i]  || '',
        fra:       (rute[0] || '').trim(),
        til:       (rute[1] || '').trim(),
        avgang:    dep[i]  || '',                       // ISO "2026-06-04T18:20:00"
        landing:   arr[i]  || ''                        // ISO
      });
    }
    return legg;
  }

  // ---- hovedoppslag: ref → strukturert resultat ---------------------------
  async function oppslag(ref) {
    ref = String(ref || '').trim().toUpperCase();
    if (!ref) throw new Error('mangler nøkkel');

    // steg 2: finn bookingId. Nøkkel auto-velges: 8+ siffer = Rekvisisjonsnr (VÅR ref mot g-travel),
    // ellers 6-tegns Bestillingsreferanse (g-travels ref mot oss).
    const erReknr = /^\d{8,}$/.test(ref);
    const param = erReknr ? 'requisitionNo=' : 'pnr=';
    const liste = await apiGet('/BookingLists?bookingType=1&order=1&page=0&pageSize=20&' + param + encodeURIComponent(ref));
    const rad = Array.isArray(liste) ? liste.find(x => x && (x.BookingId || x.Id)) : null;
    const bookingId = rad && (rad.BookingId || rad.Id);
    if (!bookingId) return { ref, nokkeltype: erReknr ? 'reknr' : 'pnr', funnet: false, grunn: 'ingen bestilling på nøkkelen' };

    // steg 3: detalj
    const det = await apiGet('/Bookings?pageSize=1&page=0&showCancelled=true&showPassed=true&showOnHoldLTDPassed=true&bookingId=' + bookingId);
    const b = Array.isArray(det) ? det[0] : det;
    if (!b) return { ref, funnet: false, bookingId, grunn: 'tom detalj-respons' };

    // alle legg på tvers av alle flyseksjoner
    const legg = [];
    (b.Elements || []).forEach(el => { if (el && el.Flight) legg.push(...parseLegg(el.Flight)); });

    // Gardermoen: leg som lander OSL = det taxi venter på; leg som starter OSL = avreise
    const landerOSL = legg.filter(l => l.til === 'OSL');
    const reiserFraOSL = legg.filter(l => l.fra === 'OSL');

    return {
      ref,
      funnet: true,
      bookingId,
      legg,
      landerOSL,                                        // [{flightNr, fra, landing, ...}]
      reiserFraOSL,
      // snarvei: viktigste OSL-landing (siste = endelig ankomst Gardermoen)
      oslLanding: landerOSL.length ? landerOSL[landerOSL.length - 1] : null
    };
  }

  // batch: flere referanser samtidig (sekvensielt for å være snill mot API-et)
  async function oppslagFlere(refs) {
    const ut = {};
    for (const r of refs) {
      try { ut[r] = await oppslag(r); }
      catch (e) { ut[r] = { ref: r, funnet: false, feil: e.message }; }
    }
    return ut;
  }

  // ---- relé-polling: bro mot Gardermoen-verktøyet på NISSY-fanen ----------
  // Agenten poller relé-et: henter ventende Ressurs-referanser, slår dem opp same-origin,
  // og leverer flightnr/landing tilbake. `jobber`-kallet registrerer også heartbeat (= online).
  const RELAY = 'https://thomaswestby.no/pasientreiser/gtravel_relay.php';
  const NOKKEL = 'grm-gtravel-2026';
  async function relay(handling, ekstra) {
    const r = await fetch(RELAY, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },   // text/plain → ingen CORS-preflight
      body: JSON.stringify(Object.assign({ handling, nokkel: NOKKEL }, ekstra || {}))
    });
    return r.json();
  }
  async function tikk() {
    try {
      const j = await relay('jobber');                 // ventende refs + heartbeat
      for (const ref of (j.jobber || [])) {
        try { const res = await oppslag(ref); await relay('svar', { ref, data: res }); }
        catch (e) { await relay('svar', { ref, data: { ref, funnet: false, feil: e.message } }); }
      }
    } catch (e) { /* nettverksfeil — prøv igjen neste tikk */ }
  }
  function start(intervallMs) {
    const ms = intervallMs || 5000;
    if (window.__gtLoop) clearInterval(window.__gtLoop);
    tikk();
    window.__gtLoop = setInterval(tikk, ms);
    // Hold g-travel-sesjonen VARM: relé-pollingen treffer thomaswestby.no, ikke g-travel, så uten
    // dette ville gto-sesjonen timet ut (~20 min). Forny token hvert 10. min også når idle.
    if (window.__gtAlive) clearInterval(window.__gtAlive);
    window.__gtAlive = setInterval(() => friskToken(true).catch(() => {}), 10 * 60 * 1000);
    console.log('%c gtravel-agent: poller relé hvert ' + (ms / 1000) + 's + holder sesjon varm (online)', 'color:#0a0');
  }
  function stopp() {
    if (window.__gtLoop) { clearInterval(window.__gtLoop); window.__gtLoop = null; }
    if (window.__gtAlive) { clearInterval(window.__gtAlive); window.__gtAlive = null; }
    console.log('gtravel-agent: stoppet');
  }

  window.gtravel = {
    VERSJON,
    token: friskToken,
    oppslag,
    oppslagFlere,
    start,
    stopp,
    relay,
    _debug: { apiGet, parseLegg, tikk }
  };
  console.log('%c gtravel-agent v' + VERSJON + ' klar', 'color:#0a0;font-weight:bold');
  start();   // auto-start polling så agenten er «online» med en gang den lastes
})();
