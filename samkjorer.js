// === SAMKJØRER v4.7.7 ===
(function () {
    'use strict';

    const VERSION = '4.7.7';
    const TIDSVINDU_MIN = 60;
    const MAKS_HENTEAVSTAND_KM = 5;
    const DETOUR_MAKS_PROSENT = 0.20;
    const MAKS_OMVEI_PROSENT = 50;
    const VEIFAKTOR = 1.3;
    const BUFFER_PER_HENTING = 5;
    const BEHOV_BUFFER = { HJE: 5 };
    const GMAPS_KEY = 'AIzaSyApih8RVgu4Wa4x2bEWga5eDqwTgVFRagQ';

    // -------------------------------------------------------
    //  Behovsregler
    // -------------------------------------------------------
    const ALLTID_ALENE = ['RB', 'ERS', 'A', 'AL', 'TH', 'IA', 'C19', 'TMS', 'TK'];
    const IGNORER = ['LIFO', 'VA', '4X4', 'HJE', 'MH', 'TB', 'ØH', 'B'];
    const KONFLIKTER = [['HI', 'LI']];

    const MAKS = { forsete: 1.0, baksete: 2.0, bagasje: 2.0, bagasjeSV: 3.0, passasjerer: 3 };

    const LAAST = {
        SF:  { forsete: 1.0, baksete: 0,   bagasje: 0 },
        LF:  { forsete: 1.0, baksete: 0.5, bagasje: 0 },
        LB:  { forsete: 0,   baksete: 1.5, bagasje: 0 },
        BS:  { forsete: 0,   baksete: 1.0, bagasje: 0, ledsagerInkl: true },
        BSP: { forsete: 0,   baksete: 1.0, bagasje: 0, ledsagerInkl: true },
    };

    const BAGASJE = { RU: 1.0, RS: 1.5 };

    const ALLE_BEHOV = [].concat(
        ALLTID_ALENE, IGNORER,
        ['HI', 'LI', 'SF', 'LF', 'LB', 'BS', 'BSP', 'RU', 'RS', 'SV']
    );

    // -------------------------------------------------------
    //  XHR-helper
    // -------------------------------------------------------
    function xhrRequest(url, opts) {
        opts = opts || {};
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(opts.method || 'GET', url, true);
            xhr.responseType = opts.responseType || '';
            xhr.timeout = opts.timeout || 15000;
            xhr.onload = function () { resolve(xhr); };
            xhr.onerror = function () { reject(new Error('XHR feil: ' + url)); };
            xhr.ontimeout = function () { reject(new Error('XHR timeout: ' + url)); };
            xhr.send(opts.body || null);
        });
    }

    // -------------------------------------------------------
    //  Hjelpefunksjoner
    // -------------------------------------------------------
    function hentPostnr(tekst) {
        if (!tekst) return null;
        const m = tekst.match(/\b(\d{4})\b/);
        return m ? m[1] : null;
    }

    function parseTid(s) {
        if (!s) return null;
        // Prøv "HH:MM" først, deretter "DD.MM HH:MM" (START-kolonnen)
        var m = s.trim().match(/^(\d{1,2})[:\.](\d{2})$/);
        if (m) return parseInt(m[1]) * 60 + parseInt(m[2]);
        var m2 = s.trim().match(/(\d{2})[:\.](\d{2})$/);
        if (m2) return parseInt(m2[1]) * 60 + parseInt(m2[2]);
        return null;
    }

    function tidTilTekst(min) {
        if (min === null || min === undefined) return '\u2013';
        var h = Math.floor(min / 60);
        var m = min % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }

    function parseBehov(tekst) {
        if (!tekst) return [];
        return tekst.toUpperCase().split(/[\s,\/\+]+/).filter(function (b) {
            return b.length > 0 && ALLE_BEHOV.includes(b);
        });
    }

    function sleep(ms) {
        return new Promise(function (r) { setTimeout(r, ms); });
    }

    // -------------------------------------------------------
    //  Geocoding + avstandsberegning
    // -------------------------------------------------------
    var geoCache = {};

    async function geocode(adresse) {
        if (!adresse) return null;
        var key = adresse.trim().toLowerCase();
        if (geoCache[key] !== undefined) return geoCache[key];
        try {
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
                + encodeURIComponent(adresse + ', Norge') + '&key=' + GMAPS_KEY;
            var xhr = await xhrRequest(url, { timeout: 5000 });
            var data = JSON.parse(xhr.responseText);
            if (data.status === 'OK' && data.results.length > 0) {
                var loc = data.results[0].geometry.location;
                geoCache[key] = { lat: loc.lat, lng: loc.lng };
                return geoCache[key];
            }
        } catch (e) {
            console.warn('[SAMKJORER] Geocode feil:', adresse, e.message);
        }
        geoCache[key] = null;
        return null;
    }

    function hentGeo(adresse) {
        if (!adresse) return null;
        return geoCache[adresse.trim().toLowerCase()] || null;
    }

    function haversineKm(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
            * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // -------------------------------------------------------
    //  Kapasitetssjekk
    // -------------------------------------------------------
    function kapasitetsSjekk(passasjerer) {
        if (passasjerer.length < 2) return { ok: false, grunn: 'Trenger minst 2 passasjerer' };
        if (passasjerer.length > MAKS.passasjerer) return { ok: false, grunn: 'Maks ' + MAKS.passasjerer + ' passasjerer' };

        for (var i = 0; i < passasjerer.length; i++) {
            for (var j = 0; j < passasjerer[i].behov.length; j++) {
                if (ALLTID_ALENE.includes(passasjerer[i].behov[j])) {
                    return { ok: false, grunn: passasjerer[i].behov[j] + ' krever alenetransport' };
                }
            }
        }

        var alleBehov = [];
        passasjerer.forEach(function (p) { alleBehov = alleBehov.concat(p.behov); });
        for (var k = 0; k < KONFLIKTER.length; k++) {
            if (alleBehov.includes(KONFLIKTER[k][0]) && alleBehov.includes(KONFLIKTER[k][1])) {
                return { ok: false, grunn: KONFLIKTER[k][0] + ' og ' + KONFLIKTER[k][1] + ' kan ikke kombineres' };
            }
        }

        var filtrert = passasjerer.map(function (p) {
            return {
                behov: (Array.isArray(p.behov) ? p.behov : []).filter(function (b) { return !IGNORER.includes(b); }),
                harLedsager: p.harLedsager
            };
        });

        var forsete = 0, baksete = 0, bagasje = 0;
        var fleksible = [];

        for (var fi = 0; fi < filtrert.length; fi++) {
            var pass = filtrert[fi];
            var erLaast = false;
            var laastType = null;

            for (var bi = 0; bi < pass.behov.length; bi++) {
                if (LAAST[pass.behov[bi]]) {
                    laastType = pass.behov[bi];
                    forsete += LAAST[laastType].forsete;
                    baksete += LAAST[laastType].baksete;
                    bagasje += LAAST[laastType].bagasje;
                    erLaast = true;
                    break;
                }
            }

            if (erLaast && (laastType === 'BS' || laastType === 'BSP')) {
                baksete += 1.0;
            } else if (erLaast && pass.harLedsager) {
                fleksible.push({ erLedsager: true });
            }

            for (var bj = 0; bj < pass.behov.length; bj++) {
                if (BAGASJE[pass.behov[bj]]) {
                    bagasje += BAGASJE[pass.behov[bj]];
                }
            }

            if (!erLaast) {
                fleksible.push({ erLedsager: false });
                if (pass.harLedsager) {
                    fleksible.push({ erLedsager: true });
                }
            }
        }

        for (var fj = 0; fj < fleksible.length; fj++) {
            if (baksete + 1.0 <= MAKS.baksete) {
                baksete += 1.0;
            } else if (forsete + 1.0 <= MAKS.forsete) {
                forsete += 1.0;
            } else {
                return { ok: false, grunn: 'Ikke nok seter (forsete: ' + forsete + ', baksete: ' + baksete + ')' };
            }
        }

        if (forsete > MAKS.forsete) return { ok: false, grunn: 'Forsete overfylt: ' + forsete + '/' + MAKS.forsete };
        if (baksete > MAKS.baksete) return { ok: false, grunn: 'Baksete overfylt: ' + baksete + '/' + MAKS.baksete };

        var svVarsel = false;
        if (bagasje > MAKS.bagasjeSV) return { ok: false, grunn: 'Bagasje for h\u00f8y: ' + bagasje + ' (maks ' + MAKS.bagasjeSV + ' med SV)' };
        if (bagasje > MAKS.bagasje) svVarsel = true;

        return { ok: true, svVarsel: svVarsel, forsete: forsete, baksete: baksete, bagasje: bagasje };
    }

    // -------------------------------------------------------
    //  Parse dispatch XML -> rader
    // -------------------------------------------------------
    function parseDispatch(responseText) {
        const xml = new DOMParser().parseFromString(responseText, 'text/xml');
        const rader = [];

        const turidMap = {};
        const resResp = xml.querySelector('response[id="resurser"]');
        if (resResp) {
            const rd = document.createElement('div');
            rd.innerHTML = resResp.textContent;
            rd.querySelectorAll('tbody tr[name]').forEach(function (tr) {
                const tidM = tr.outerHTML.match(/searchStatus\?id=(\d+)/);
                const rid = tr.getAttribute('name');
                if (tidM && rid) turidMap[rid] = tidM[1];
            });
        }

        xml.querySelectorAll('response').forEach(function (resp) {
            const fane = resp.getAttribute('id');
            if (!['ventendeOppdrag', 'paagaaendeOppdrag'].includes(fane)) return;

            const d = document.createElement('div');
            d.innerHTML = resp.textContent;

            const headerCells = Array.from(d.querySelector('tr.tbh')?.cells || []);
            const h = headerCells.map(function (c) { return c.textContent.toUpperCase().replace(/\s+/g, ''); });
            if (h.length === 0) return;

            const idx = {
                start:   h.findIndex(function (s) { return s.includes('START'); }),
                fra:     h.findIndex(function (s) { return s === 'FRA'; }),
                til:     h.findIndex(function (s) { return s === 'TIL'; }),
                pnavn:   h.findIndex(function (s) { return s === 'PNAVN'; }),
                pnr:     h.findIndex(function (s) { return s === 'PNR'; }),
                oppmtid: h.findIndex(function (s) { return s === 'OPPMTID' || s === 'OPPTID'; }),
                rmate:   h.findIndex(function (s) { return s === 'RM\u00c5TE' || s === 'REISEM\u00c5TE'; }),
                ledsager:h.findIndex(function (s) { return s === 'L'; }),
                behov:   h.findIndex(function (s) { return s === 'BEHOV' || s === 'BEH'; }),
                status:  h.findIndex(function (s) { return s.includes('STATUS'); }),
                padr:    h.findIndex(function (s) { return s === 'PADR'; }),
                behadr:  h.findIndex(function (s) { return s === 'BEHADR'; }),
            };

            var totalRader = d.querySelectorAll('tbody tr[name]').length;
            var skipIngenReq = 0, skipSamkjort = 0;
            d.querySelectorAll('tbody tr[name]').forEach(function (tr) {
                const alleReqIds = [].concat(
                    Array.from(tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)).map(function (m) { return m[1]; })
                );
                if (alleReqIds.length === 0) { skipIngenReq++; return; }

                const trName = tr.getAttribute('name');
                const resId = trName || null;
                const turid = resId ? (turidMap[resId] || null) : null;

                const txt = function (i) { return i >= 0 && tr.cells[i] ? tr.cells[i].textContent.trim() : ''; };
                var behovTxt = function (i) {
                    if (i < 0 || !tr.cells[i]) return '';
                    var imgs = tr.cells[i].querySelectorAll('img');
                    if (imgs.length > 0) {
                        return Array.from(imgs).map(function (img) { return img.alt || img.title || ''; }).join(' ');
                    }
                    return tr.cells[i].textContent.trim();
                };
                const divTxt = function (i, n) {
                    if (i < 0 || !tr.cells[i]) return '';
                    const divs = tr.cells[i].querySelectorAll('div');
                    return n < divs.length ? divs[n].textContent.trim() : txt(i);
                };

                // Hopp over allerede samkjørte på pågående (flere reqIds)
                // Ventende har aldri samkjøring — flere reqIds er normalt
                if (alleReqIds.length > 1 && fane === 'paagaaendeOppdrag') { skipSamkjort++; return; }

                {
                    rader.push({
                        reqId: alleReqIds[0], resId: resId, turid: turid, fane: fane,
                        fra:     txt(idx.fra) || txt(idx.padr),
                        til:     txt(idx.til) || txt(idx.behadr),
                        pnavn:   txt(idx.pnavn),
                        pnr:     txt(idx.pnr).replace(/[^\d]/g, ''),
                        oppmtid: txt(idx.oppmtid) || txt(idx.start),
                        rmate:   txt(idx.rmate),
                        ledsager:txt(idx.ledsager),
                        behovRaa:behovTxt(idx.behov),
                        status:  txt(idx.status),
                    });
                }
            });
            console.log('[SAMKJ\u00d8RER] ' + fane + ': rader=' + totalRader + ', skipIngenReq=' + skipIngenReq + ', skipSamkjort=' + skipSamkjort);
        });

        var ventende = rader.filter(function(r) { return r.fane === 'ventendeOppdrag'; }).length;
        var pagaende = rader.filter(function(r) { return r.fane === 'paagaaendeOppdrag'; }).length;
        console.log('[SAMKJ\u00d8RER] Faner: ventende=' + ventende + ', p\u00e5g\u00e5ende=' + pagaende);
        return rader;
    }

    // -------------------------------------------------------
    //  Hent plakat for behov-koder
    // -------------------------------------------------------
    async function hentPlakat(reqId) {
        try {
            const t = Date.now();
            const xhr = await xhrRequest(
                'ajax-dispatch?update=false&action=showreq&rid=' + reqId + '&t=' + t,
                { timeout: 10000 }
            );
            var responseText = xhr.responseText;
            if (xhr.response instanceof ArrayBuffer) {
                responseText = new TextDecoder('iso-8859-1').decode(xhr.response);
            }

            const xml = new DOMParser().parseFromString(responseText, 'text/xml');
            const resp = xml.querySelector('response');
            if (!resp) return { behov: [], tid: null, rekNr: null, fra: null, til: null, fraNavn: null, tilNavn: null };

            const doc = new DOMParser().parseFromString(resp.innerHTML || resp.textContent, 'text/html');
            var body = doc.body || doc.documentElement;
            if (!body) return { behov: [], tid: null, rekNr: null, fra: null, til: null, fraNavn: null, tilNavn: null };

            // --- Parse HTML-struktur direkte ---
            var celler = body.querySelectorAll('td');
            var tekst = body.textContent || '';

            // Rek.nr: "Rekvisisjon NNNN"
            var rekNr = null;
            var rekM = tekst.match(/Rekvisisjon\s+(\d+)/);
            if (rekM) rekNr = rekM[1];

            // Behov: "Spesielle behov"-seksjonen
            var behovKoder = [];
            celler.forEach(function(td) {
                if (td.textContent.match(/Spesielle behov/i)) {
                    var neste = td.closest('tr');
                    if (neste) {
                        var behovTd = neste.nextElementSibling;
                        if (behovTd) {
                            var bTekst = behovTd.textContent.trim();
                            if (bTekst && bTekst !== '- Ingen -') behovKoder = parseBehov(bTekst);
                        }
                    }
                }
            });
            if (behovKoder.length === 0) {
                ALLE_BEHOV.forEach(function (kode) {
                    var re = new RegExp('\\b' + kode + '\\b', 'i');
                    if (re.test(tekst) && !behovKoder.includes(kode)) behovKoder.push(kode);
                });
            }

            // Reise fra / Reise til: finn rader med "Reise fra" / "Reise til"
            var fraAdr = null, tilAdr = null, fraNavn = null, tilNavn = null;
            var startTid = null, oppmTid = null;
            celler.forEach(function(td) {
                var t = td.textContent.trim();
                if (t === 'Reise fra:' || t === 'Reise fra') {
                    var tr = td.closest('tr');
                    if (!tr) return;
                    var tds = tr.querySelectorAll('td');
                    // tds[0]=label, tds[1]=dato/tid (hentetid), tds[2]=adresse
                    if (tds.length >= 2) {
                        var tidM = tds[1].textContent.match(/(\d{2}):(\d{2})/);
                        if (tidM) startTid = tidM[0];
                    }
                    if (tds.length >= 3) {
                        // Adresse-celle kan ha <br> som skiller stedsnavn fra gateadresse
                        var html = tds[2].innerHTML;
                        var deler = html.split(/<br\s*\/?>/i).map(function(d) {
                            var tmp = document.createElement('div'); tmp.innerHTML = d;
                            return tmp.textContent.trim();
                        }).filter(function(d) { return d.length > 0; });
                        if (deler.length >= 2) {
                            fraNavn = deler[0];
                            fraAdr = deler.slice(1).join(', ');
                        } else if (deler.length === 1) {
                            fraAdr = deler[0];
                        }
                    }
                }
                if (t === 'Reise til:' || t === 'Reise til') {
                    var tr2 = td.closest('tr');
                    if (!tr2) return;
                    var tds2 = tr2.querySelectorAll('td');
                    // tds2[0]=label, tds2[1]=dato/tid (oppmøtetid), tds2[2]=adresse
                    if (tds2.length >= 2) {
                        var tidM2 = tds2[1].textContent.match(/(\d{2}):(\d{2})/);
                        if (tidM2) oppmTid = tidM2[0];
                    }
                    if (tds2.length >= 3) {
                        var html2 = tds2[2].innerHTML;
                        var deler2 = html2.split(/<br\s*\/?>/i).map(function(d) {
                            var tmp = document.createElement('div'); tmp.innerHTML = d;
                            return tmp.textContent.trim();
                        }).filter(function(d) { return d.length > 0; });
                        if (deler2.length >= 2) {
                            tilNavn = deler2[0];
                            tilAdr = deler2.slice(1).join(', ');
                        } else if (deler2.length === 1) {
                            tilAdr = deler2[0];
                        }
                    }
                }
            });

            // Fallback for oppmøtetid
            if (!oppmTid) {
                var tidMatch = tekst.match(/Oppm[^\d]*(\d{1,2}[:.]\d{2})/i);
                if (tidMatch) oppmTid = tidMatch[1].replace('.', ':');
            }

            return {
                behov: behovKoder,
                startTid: startTid,
                oppmTid: oppmTid,
                rekNr: rekNr,
                fra: fraAdr, til: tilAdr,
                fraNavn: fraNavn, tilNavn: tilNavn,
            };
        } catch (e) {
            console.warn('[SAMKJ\u00d8RER] Plakat-feil reqId=' + reqId, e);
            return { behov: [], tid: null, rekNr: null, fra: null, til: null };
        }
    }

    // -------------------------------------------------------
    //  Plakat-cache (localStorage, TTL 24 timer)
    // -------------------------------------------------------
    var PLAKAT_CACHE_KEY = 'samkjorer_plakat_v4';
    var PLAKAT_TTL = 24 * 60 * 60 * 1000;
    // Rydd opp gamle cache-nøkler
    // Rydd opp gamle versjonerte cache-nøkler (migrering til fast nøkkel)
    try { Object.keys(localStorage).forEach(function(k) { if (k.startsWith('samkjorer_plakat_v4.') || k.startsWith('samkjorer_plakat_v5')) localStorage.removeItem(k); }); } catch(e) {}

    function hentPlakatCache() {
        try {
            var data = JSON.parse(localStorage.getItem(PLAKAT_CACHE_KEY) || '{}');
            var now = Date.now();
            // Fjern utløpte oppføringer
            Object.keys(data).forEach(function (k) {
                if (now - data[k].ts > PLAKAT_TTL) delete data[k];
            });
            return data;
        } catch (e) { return {}; }
    }

    function lagrePlakatCache(cache) {
        try { localStorage.setItem(PLAKAT_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
    }

    // -------------------------------------------------------
    //  Berik rader med plakat-data (med cache)
    // -------------------------------------------------------
    async function berikMedPlakat(rader, oppdaterStatus) {
        var antall = rader.length;
        var cache = hentPlakatCache();
        var hentet = 0, cached = 0;

        for (var i = 0; i < rader.length; i++) {
            var r = rader[i];
            var plakat;

            if (cache[r.reqId]) {
                plakat = cache[r.reqId];
                if (!Array.isArray(plakat.behov)) plakat.behov = [];
                cached++;
                if (oppdaterStatus) oppdaterStatus('Plakat ' + (i + 1) + '/' + antall + ' (cache)');
            } else {
                if (oppdaterStatus) oppdaterStatus('Henter plakat ' + (i + 1) + '/' + antall + '\u2026');
                plakat = await hentPlakat(r.reqId);
                cache[r.reqId] = Object.assign({ ts: Date.now() }, plakat);
                hentet++;
                if (i < rader.length - 1) await sleep(50);
            }

            if (plakat.behov && plakat.behov.length > 0) { r.behov = plakat.behov; }
            else if (r.behovRaa) { r.behov = parseBehov(r.behovRaa); }
            else { r.behov = []; }

            // startTid = hentetid, oppmtid = oppmøtetid (begge fra plakat)
            if (plakat.startTid) r.startTid = plakat.startTid;
            if (plakat.oppmTid) r.oppmtid = plakat.oppmTid;
            // Bruk plakat-adresse + stedsnavn
            if (plakat.fra && hentPostnr(plakat.fra)) r.fra = plakat.fra;
            if (plakat.til && hentPostnr(plakat.til)) r.til = plakat.til;
            r.fraNavn = plakat.fraNavn || null;
            r.tilNavn = plakat.tilNavn || null;
            if (plakat.rekNr) r.rekNr = plakat.rekNr;
            r.harLedsager = (r.ledsager || '').trim() !== '' && (r.ledsager || '').trim() !== '0';
        }

        lagrePlakatCache(cache);
        console.log('[SAMKJ\u00d8RER] Plakater: ' + cached + ' fra cache, ' + hentet + ' hentet');
        return rader;
    }

    // -------------------------------------------------------
    //  Geocode fra-adresser for grupper med 2+ turer
    // -------------------------------------------------------
    async function geocodeGrupper(rader, oppdaterStatus) {
        // Grupper midlertidig etter til-postnr for aa finne hvem som trenger geocoding
        var tilGrupper = {};
        rader.forEach(function (r) {
            var pnr = hentPostnr(r.til);
            if (!pnr) return;
            if (!tilGrupper[pnr]) tilGrupper[pnr] = [];
            tilGrupper[pnr].push(r);
        });

        // Samle unike fra-adresser som trenger geocoding
        var adresserAaGeocde = new Set();
        Object.values(tilGrupper).forEach(function (gruppe) {
            if (gruppe.length < 2) return;
            gruppe.forEach(function (r) {
                if (r.fra) adresserAaGeocde.add(r.fra);
            });
        });

        var adresser = Array.from(adresserAaGeocde);
        console.log('[SAMKJ\u00d8RER] Geocoder ' + adresser.length + ' fra-adresser');
        for (var i = 0; i < adresser.length; i++) {
            if (oppdaterStatus) oppdaterStatus('Geocoder adresse ' + (i + 1) + '/' + adresser.length + '\u2026');
            await geocode(adresser[i]);
            if (i < adresser.length - 1) await sleep(50);
        }
    }

    // -------------------------------------------------------
    //  Finn samkjoringer — grupper på samme behandlingssted
    // -------------------------------------------------------
    function normaliserDest(r) {
        // Bruk tilNavn (behandlingssted) hvis tilgjengelig, ellers til-adresse
        var dest = (r.tilNavn || r.til || '').trim().toLowerCase();
        // Fjern postnr og sted for bedre matching
        dest = dest.replace(/,?\s*\d{4}\s+\w+$/, '').trim();
        return dest;
    }

    function finnSamkjoringer(rader) {
        // Steg 1: Grupper etter behandlingssted (normalisert navn/adresse)
        var destGrupper = {};
        rader.forEach(function (r) {
            var dest = normaliserDest(r);
            if (!dest) return;
            if (!destGrupper[dest]) destGrupper[dest] = [];
            destGrupper[dest].push(Object.assign({}, r, {
                tidMin: parseTid(r.oppmtid),
                destNorm: dest,
            }));
        });

        var funn = [];

        Object.keys(destGrupper).forEach(function (destKey) {
            var gruppe = destGrupper[destKey];
            if (gruppe.length < 2) return;

            gruppe.sort(function (a, b) { return (a.tidMin || 0) - (b.tidMin || 0); });

            var brukt = new Set();
            for (var i = 0; i < gruppe.length; i++) {
                if (brukt.has(i)) continue;
                var anker = gruppe[i];
                var kandidatIdx = [i];

                for (var j = i + 1; j < gruppe.length; j++) {
                    if (brukt.has(j)) continue;
                    var kandidat = gruppe[j];

                    // Tidssjekk (oppmøtetid innenfor vindu)
                    var ingenTid = anker.tidMin === null || kandidat.tidMin === null;
                    var innenfor = !ingenTid && Math.abs(kandidat.tidMin - anker.tidMin) <= TIDSVINDU_MIN;
                    if (!ingenTid && !innenfor) continue;

                    kandidatIdx.push(j);
                }

                if (kandidatIdx.length < 2) continue;

                // Startid-sjekk: spenn + kjøretidsbuffer <= 60 min
                function startTidOk(kandidater) {
                    var st = kandidater.map(function (t) { return parseTid(t.startTid || t.oppmtid); }).filter(function (t) { return t !== null; });
                    if (st.length < 2) return true;
                    var spenn = Math.max.apply(null, st) - Math.min.apply(null, st);
                    // Buffer: 10 min per ekstra passasjer for estimert kjøretid mellom hentesteder
                    var buffer = (kandidater.length - 1) * 10;
                    return spenn + buffer <= TIDSVINDU_MIN;
                }

                // Kapasitetssjekk — prøv trioer, deretter par
                var besteGruppe = null, besteKap = null;
                for (var a = 0; a < kandidatIdx.length; a++) {
                    for (var b = a + 1; b < kandidatIdx.length; b++) {
                        for (var c = b + 1; c < kandidatIdx.length; c++) {
                            var trio = [gruppe[kandidatIdx[a]], gruppe[kandidatIdx[b]], gruppe[kandidatIdx[c]]];
                            if (!startTidOk(trio)) continue;
                            var kapT = kapasitetsSjekk(trio.map(function (t) { return { behov: t.behov || [], harLedsager: t.harLedsager || false }; }));
                            if (kapT.ok && (!besteGruppe || trio.length > besteGruppe.length)) { besteGruppe = trio; besteKap = kapT; }
                        }
                        if (!besteGruppe || besteGruppe.length < 3) {
                            var par = [gruppe[kandidatIdx[a]], gruppe[kandidatIdx[b]]];
                            if (!startTidOk(par)) continue;
                            var kapP = kapasitetsSjekk(par.map(function (t) { return { behov: t.behov || [], harLedsager: t.harLedsager || false }; }));
                            if (kapP.ok && !besteGruppe) { besteGruppe = par; besteKap = kapP; }
                        }
                    }
                }

                if (besteGruppe) {
                    besteGruppe.forEach(function (t) { var idx2 = gruppe.indexOf(t); if (idx2 >= 0) brukt.add(idx2); });
                    var tider = besteGruppe.map(function (t) { return t.tidMin; }).filter(function (t) { return t !== null; });

                    // Behandlingssted-navn for visning
                    var destVis = besteGruppe[0].tilNavn || besteGruppe[0].til || destKey;

                    funn.push({
                        destPostnr: hentPostnr(besteGruppe[0].til) || '',
                        destAdr: destVis,
                        destGateAdr: besteGruppe[0].til || destVis,
                        turer: besteGruppe,
                        kapasitet: besteKap,
                        tidSpenn: tider.length >= 2 ? Math.max.apply(null, tider) - Math.min.apply(null, tider) : 0,
                        snittAvstand: null,
                        fase: 1,
                    });
                }
            }
        });

        console.log('[SAMKJ\u00d8RER] Behandlingssteder med 2+ turer:', Object.keys(destGrupper).filter(function(k) { return destGrupper[k].length >= 2; }).length);
        return funn;
    }

    // -------------------------------------------------------
    //  Fase 2: Geografisk matching (grid-basert)
    // -------------------------------------------------------
    async function geografiskMatch(rader, oppdaterStatus) {
        if (rader.length < 2) return [];

        // Steg 1: Geocode alle fra/til-adresser
        var adresser = new Set();
        rader.forEach(function (r) {
            if (r.fra) adresser.add(r.fra);
            if (r.til) adresser.add(r.til);
        });
        var adrArr = Array.from(adresser);
        console.log('[SAMKJ\u00d8RER] Fase 2: Geocoder ' + adrArr.length + ' adresser for ' + rader.length + ' turer');
        for (var i = 0; i < adrArr.length; i++) {
            if (oppdaterStatus) oppdaterStatus('Geocoder ' + (i + 1) + '/' + adrArr.length + '\u2026');
            await geocode(adrArr[i]);
            if (i < adrArr.length - 1) await sleep(50);
        }

        // Steg 2: Filtrer turer med gyldig geo-data
        var geoRader = rader.filter(function (r) {
            return hentGeo(r.fra) && hentGeo(r.til);
        }).map(function (r) {
            return Object.assign({}, r, {
                tidMin: parseTid(r.oppmtid),
                fraGeo: hentGeo(r.fra),
                tilGeo: hentGeo(r.til),
            });
        });

        console.log('[SAMKJ\u00d8RER] Fase 2: ' + geoRader.length + '/' + rader.length + ' turer med geo-data');
        if (geoRader.length < 2) return [];

        // Steg 3: Grid-indeks for destinasjoner (~2 km celler)
        var LAT_STEP = 0.018;
        var LNG_STEP = 0.036;
        var grid = {};
        geoRader.forEach(function (r) {
            var cellX = Math.floor(r.tilGeo.lng / LNG_STEP);
            var cellY = Math.floor(r.tilGeo.lat / LAT_STEP);
            var key = cellX + ',' + cellY;
            if (!grid[key]) grid[key] = [];
            grid[key].push(r);
        });

        // Steg 4: Kandidat-matching i naboceller
        var funn = [];
        var brukt = new Set();
        var celler = Object.keys(grid);

        for (var ci = 0; ci < celler.length; ci++) {
            var parts = celler[ci].split(',');
            var cx = parseInt(parts[0]), cy = parseInt(parts[1]);

            // Samle turer fra denne cellen og 8 naboer
            var naboTurer = [];
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    var naboKey = (cx + dx) + ',' + (cy + dy);
                    if (grid[naboKey]) {
                        grid[naboKey].forEach(function (r) {
                            if (!brukt.has(r.reqId)) naboTurer.push(r);
                        });
                    }
                }
            }

            // Dedupliser
            var sett = {};
            naboTurer = naboTurer.filter(function (r) {
                if (sett[r.reqId]) return false;
                sett[r.reqId] = true;
                return true;
            });

            if (naboTurer.length < 2) continue;

            // Pr\u00f8v par
            for (var ai = 0; ai < naboTurer.length; ai++) {
                if (brukt.has(naboTurer[ai].reqId)) continue;
                var a = naboTurer[ai];
                var bestePar = null, besteDetour = Infinity;

                for (var bi = ai + 1; bi < naboTurer.length; bi++) {
                    if (brukt.has(naboTurer[bi].reqId)) continue;
                    var b = naboTurer[bi];

                    // Tidsvindu-sjekk
                    if (a.tidMin !== null && b.tidMin !== null) {
                        if (Math.abs(a.tidMin - b.tidMin) > TIDSVINDU_MIN) continue;
                    }

                    // Kapasitetssjekk
                    var kap = kapasitetsSjekk([
                        { behov: a.behov || [], harLedsager: a.harLedsager || false },
                        { behov: b.behov || [], harLedsager: b.harLedsager || false }
                    ]);
                    if (!kap.ok) continue;

                    // Hentested-avstand
                    var henteAvstand = haversineKm(a.fraGeo.lat, a.fraGeo.lng, b.fraGeo.lat, b.fraGeo.lng);
                    if (henteAvstand > MAKS_HENTEAVSTAND_KM) continue;

                    // Detour-beregning
                    var direkteA = haversineKm(a.fraGeo.lat, a.fraGeo.lng, a.tilGeo.lat, a.tilGeo.lng) * VEIFAKTOR;
                    var direkteB = haversineKm(b.fraGeo.lat, b.fraGeo.lng, b.tilGeo.lat, b.tilGeo.lng) * VEIFAKTOR;
                    var longest = Math.max(direkteA, direkteB);
                    if (longest < 0.5) continue;

                    // 4 rekkef\u00f8lger for samkj\u00f8rt rute
                    var d_ab = haversineKm(a.fraGeo.lat, a.fraGeo.lng, b.fraGeo.lat, b.fraGeo.lng);
                    var d_aTilA = haversineKm(b.fraGeo.lat, b.fraGeo.lng, a.tilGeo.lat, a.tilGeo.lng);
                    var d_aTilB = haversineKm(b.fraGeo.lat, b.fraGeo.lng, b.tilGeo.lat, b.tilGeo.lng);
                    var d_bTilA = haversineKm(a.fraGeo.lat, a.fraGeo.lng, a.tilGeo.lat, a.tilGeo.lng);
                    var d_bTilB = haversineKm(a.fraGeo.lat, a.fraGeo.lng, b.tilGeo.lat, b.tilGeo.lng);
                    var d_tilAB = haversineKm(a.tilGeo.lat, a.tilGeo.lng, b.tilGeo.lat, b.tilGeo.lng);

                    var ordninger = [
                        d_ab + d_aTilA + d_tilAB, // fraA\u2192fraB\u2192tilA\u2192tilB
                        d_ab + d_aTilB + d_tilAB, // fraA\u2192fraB\u2192tilB\u2192tilA
                        d_ab + d_bTilA + d_tilAB, // fraB\u2192fraA\u2192tilA\u2192tilB
                        d_ab + d_bTilB + d_tilAB, // fraB\u2192fraA\u2192tilB\u2192tilA
                    ];

                    var combined = Math.min.apply(null, ordninger) * VEIFAKTOR;
                    var detourPct = (combined - longest) / longest;

                    if (detourPct <= DETOUR_MAKS_PROSENT && detourPct < besteDetour) {
                        bestePar = { b: b, kap: kap, detour: detourPct };
                        besteDetour = detourPct;
                    }
                }

                if (bestePar) {
                    brukt.add(a.reqId);
                    brukt.add(bestePar.b.reqId);

                    var turer = [a, bestePar.b];
                    var tider = turer.map(function (t) { return t.tidMin; }).filter(function (t) { return t !== null; });

                    var destVisA = a.tilNavn || a.til || '';
                    var destVisB = bestePar.b.tilNavn || bestePar.b.til || '';
                    var destVis = destVisA === destVisB ? destVisA : destVisA + ' + ' + destVisB;

                    funn.push({
                        destPostnr: hentPostnr(a.til) || '',
                        destAdr: destVis,
                        destGateAdr: a.til || '',
                        destGateAdr2: bestePar.b.til || '',
                        turer: turer,
                        kapasitet: bestePar.kap,
                        tidSpenn: tider.length >= 2 ? Math.max.apply(null, tider) - Math.min.apply(null, tider) : 0,
                        snittAvstand: null,
                        fase: 2,
                        detourProsent: Math.round(bestePar.detour * 100),
                    });
                }
            }
        }

        funn.sort(function (a, b) { return (a.detourProsent || 0) - (b.detourProsent || 0); });
        console.log('[SAMKJ\u00d8RER] Fase 2: ' + funn.length + ' geo-grupper funnet');
        return funn;
    }

    // -------------------------------------------------------
    //  Popup med to-panel layout + Google Maps
    // -------------------------------------------------------
    function visPopup(funn, antallRader, rader, popup, rester) {
        if (!popup || popup.closed) { alert('Fane lukket.'); return; }

        // Sorter: flest turer forst, SV-varsel sist
        funn.sort(function (a, b) {
            if (a.kapasitet.svVarsel !== b.kapasitet.svVarsel) return a.kapasitet.svVarsel ? 1 : -1;
            return b.turer.length - a.turer.length;
        });

        // Serialiser funn-data for popup-scriptet
        // Rens adressestrenger
        function rensAdresse(s) {
            if (!s) return '';
            return s.replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim().substring(0, 100);
        }

        var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
            + '<title>Samkj\u00f8rer v' + VERSION + '</title>'
            + '<link rel="preconnect" href="https://fonts.googleapis.com">'
            + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">'
            + '<style>'
            + ':root{'
            + '  --bg:#0f1215;--bg-panel:#181b20;--bg-card:#1e2228;--bg-card-hover:#252a31;'
            + '  --border:#2a2f38;--border-active:#3b82f6;'
            + '  --text:#e2e8f0;--text-dim:#8892a4;--text-muted:#5a6577;'
            + '  --accent:#3b82f6;--accent-glow:rgba(59,130,246,.15);'
            + '  --warn:#f59e0b;--warn-bg:rgba(245,158,11,.08);'
            + '  --green:#22c55e;--red:#ef4444;'
            + '}'
            + '*{box-sizing:border-box;margin:0;}'
            + 'body{font-family:"DM Sans",system-ui,sans-serif;font-size:13px;color:var(--text);background:var(--bg);height:100vh;display:flex;flex-direction:column;overflow:hidden;}'
            + '.topbar{background:var(--bg-panel);border-bottom:1px solid var(--border);padding:8px 20px;display:flex;align-items:center;gap:16px;flex-shrink:0;}'
            + '.topbar h1{font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--text);}'
            + '.topbar h1 span{color:var(--text-muted);font-weight:400;font-size:12px;margin-left:6px;}'
            + '.topbar .pill{font-family:"JetBrains Mono",monospace;font-size:11px;padding:3px 10px;border-radius:20px;background:var(--accent-glow);color:var(--accent);border:1px solid rgba(59,130,246,.25);}'
            + '.topbar .pill.warn{background:var(--warn-bg);color:var(--warn);border-color:rgba(245,158,11,.25);}'
            + '.topbar .meta{margin-left:auto;font-size:11px;color:var(--text-muted);}'
            + '.layout{display:flex;flex:1;overflow:hidden;}'
            + '.panel-left{width:60%;min-width:500px;overflow-y:auto;padding:12px 16px;background:var(--bg);}'
            + '.panel-left::-webkit-scrollbar{width:6px;}'
            + '.panel-left::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}'
            + '.divider{width:3px;background:var(--border);cursor:col-resize;flex-shrink:0;transition:background .15s;}'
            + '.divider:hover,.divider.dragging{background:var(--accent);}'
            + '.panel-right{flex:1;display:flex;flex-direction:column;min-width:300px;}'
            + '#map{flex:0 0 40%;min-height:150px;}'
            + '#rute-info{flex:1;padding:14px 18px;background:var(--bg-panel);border-top:1px solid var(--border);font-size:12px;color:var(--text-dim);overflow-y:auto;}'
            + '.gruppe{background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-bottom:8px;cursor:pointer;transition:all .15s ease;}'
            + '.gruppe:hover{background:var(--bg-card-hover);border-color:#3a4150;}'
            + '.gruppe.aktiv{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 4px 20px var(--accent-glow);}'
            + '.gruppe-header{padding:8px 14px;font-weight:600;font-size:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}'
            + '.badge{font-family:"JetBrains Mono",monospace;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:500;background:var(--accent-glow);color:var(--accent);border:1px solid rgba(59,130,246,.2);}'
            + '.badge-geo{background:rgba(34,197,94,.1);color:var(--green);border-color:rgba(34,197,94,.25);}'
            + '.dest-label{color:var(--text);font-weight:500;}'
            + '.avstand-badge{font-family:"JetBrains Mono",monospace;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:500;background:rgba(34,197,94,.08);color:var(--green);border:1px solid rgba(34,197,94,.2);}'
            + '.sv-badge{font-family:"JetBrains Mono",monospace;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:var(--warn-bg);color:var(--warn);border:1px solid rgba(245,158,11,.2);}'
            + '.geo-badge{font-family:"JetBrains Mono",monospace;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:rgba(168,85,247,.1);color:#a855f7;border:1px solid rgba(168,85,247,.25);}'
            + '.detour-badge{font-family:"JetBrains Mono",monospace;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:500;background:rgba(34,197,94,.08);color:var(--green);border:1px solid rgba(34,197,94,.2);}'
            + '.geo-btn{font-family:"DM Sans",system-ui,sans-serif;font-size:11px;padding:4px 12px;border-radius:6px;border:1px solid rgba(168,85,247,.3);background:rgba(168,85,247,.1);color:#a855f7;cursor:pointer;transition:all .15s;}'
            + '.geo-btn:hover{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.5);}'
            + '.geo-btn:disabled{opacity:.5;cursor:not-allowed;}'
            + '.geo-status{font-size:11px;color:var(--text-muted);}'
            + '.kap-info{font-family:"JetBrains Mono",monospace;font-size:10px;margin-left:auto;color:var(--text-muted);}'
            + '.gruppe-body{padding:0;}'
            + '.gruppe-body table{width:100%;border-collapse:collapse;}'
            + '.gruppe-body th{text-align:left;padding:5px 10px;font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border);background:rgba(0,0,0,.15);}'
            + '.gruppe-body td{padding:6px 10px;border-bottom:1px solid rgba(255,255,255,.03);font-size:12px;color:var(--text-dim);}'
            + '.gruppe-body tr:last-child td{border-bottom:none;}'
            + '.gruppe-body td:first-child{font-family:"JetBrains Mono",monospace;font-weight:500;color:var(--text);white-space:nowrap;}'
            + '.gruppe-body td:nth-child(3),.gruppe-body td:nth-child(4){max-width:280px;line-height:1.4;}'
            + '.behov-tag{display:inline-block;padding:1px 5px;border-radius:3px;font-family:"JetBrains Mono",monospace;font-size:9px;font-weight:500;margin:0 1px;}'
            + '.behov-laast{background:rgba(99,102,241,.12);color:#818cf8;}'
            + '.behov-bagasje{background:var(--warn-bg);color:var(--warn);}'
            + '.behov-ok{background:rgba(255,255,255,.04);color:var(--text-muted);}'
            + '.tid-bar{background:var(--warn-bg);border-left:2px solid var(--warn);padding:6px 12px;font-size:11px;color:var(--warn);}'
            + '.tom{text-align:center;padding:60px;color:var(--text-muted);font-size:14px;}'
            + '.rute-detalj{margin-bottom:8px;}'
            + '.rute-detalj .stopp{display:flex;align-items:center;gap:8px;padding:4px 0;}'
            + '.stopp-nr{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono",monospace;font-weight:700;font-size:10px;color:#fff;flex-shrink:0;}'
            + '.stopp-nr.henting{background:var(--accent);}'
            + '.stopp-nr.levering{background:var(--red);}'
            + '.stopp-rad.draggable{cursor:grab;transition:background .1s;}'
            + '.stopp-rad.draggable:hover{background:rgba(255,255,255,.05);}'
            + '.stopp-rad.dragging{opacity:.4;}'
            + '.stopp-rad.drag-over{border-top:2px solid var(--accent);}'
            + '.rute-total{font-weight:600;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);color:var(--text);}'
            + '</style></head><body>'
            + '<div class="topbar">'
            + '<h1>SAMKJ\u00d8RER<span>v' + VERSION + '</span></h1>'
            + '<span class="pill">' + funn.length + ' grupper</span>'
            + '<span class="pill warn">' + antallRader + ' turer</span>'
            + '<button class="geo-btn" id="refreshBtn" onclick="refreshData()">\u21bb Oppdater</button>'
            + '<button class="geo-btn" id="geoBtn" onclick="startGeo()">S\u00f8k flere (geo)</button>'
            + '<span class="geo-status" id="geoStatus"></span>'
            + '<button class="geo-btn" onclick="document.getElementById(\'infoModal\').style.display=\'flex\'">Innstillinger</button>'
            + '<span class="meta">Postnr-matching \u2022 ' + TIDSVINDU_MIN + ' min vindu</span>'
            + '</div>'
            // Modal overlay
            + '<div id="infoModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display=\'none\'">'
            + '<div style="background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;padding:24px 28px;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.4);">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
            + '<h2 style="font-size:15px;font-weight:700;color:var(--text);margin:0;">Innstillinger & regler</h2>'
            + '<button onclick="document.getElementById(\'infoModal\').style.display=\'none\'" style="background:none;border:none;color:var(--text-muted);font-size:18px;cursor:pointer;">\u2715</button>'
            + '</div>'

            // Editerbare innstillinger
            + '<div style="font-size:12px;color:var(--text-dim);display:flex;flex-direction:column;gap:12px;">'
            + '<div style="font-weight:600;color:var(--text);font-size:13px;">Justerbare</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">'
            + '<span>Buffer per henting: <input id="bufferMin" type="number" value="' + BUFFER_PER_HENTING + '" step="1" min="0" style="width:40px;font-family:JetBrains Mono,monospace;font-size:12px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);border-radius:3px;padding:2px 4px;"> min</span>'
            + '<span>HJE-tillegg: <input id="bufferHJE" type="number" value="' + (BEHOV_BUFFER.HJE || 0) + '" step="1" min="0" style="width:40px;font-family:JetBrains Mono,monospace;font-size:12px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);border-radius:3px;padding:2px 4px;"> min</span>'
            + '<span>Kr/km: <input id="prisPerKm" type="number" value="30" step="0.5" min="0" style="width:55px;font-family:JetBrains Mono,monospace;font-size:12px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);border-radius:3px;padding:2px 4px;"></span>'
            + '</div>'

            // Faste parametere
            + '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">'
            + '<div style="font-weight:600;color:var(--text);font-size:13px;margin-bottom:8px;">Faste parametere</div>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;">'
            + '<span>Tidsvindu (oppm\u00f8te): <b style="color:var(--text)">' + TIDSVINDU_MIN + ' min</b></span>'
            + '<span>Maks henteavstand: <b style="color:var(--text)">' + MAKS_HENTEAVSTAND_KM + ' km</b></span>'
            + '<span>Maks omvei: <b style="color:var(--text)">' + MAKS_OMVEI_PROSENT + '%</b></span>'
            + '<span>Veifaktor (Haversine): <b style="color:var(--text)">' + VEIFAKTOR + 'x</b></span>'
            + '<span>Maks passasjerer: <b style="color:var(--text)">' + MAKS.passasjerer + '</b></span>'
            + '<span>Detour-grense (geo): <b style="color:var(--text)">' + (DETOUR_MAKS_PROSENT * 100) + '%</b></span>'
            + '</div>'
            + '</div>'

            // Regler
            + '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">'
            + '<div style="font-weight:600;color:var(--text);font-size:13px;margin-bottom:8px;">Regler</div>'
            + '<ul style="margin:0;padding-left:16px;display:flex;flex-direction:column;gap:4px;color:var(--text-dim);">'
            + '<li><b>TUR:</b> Passasjerer kan kun hentes <b>tidligere</b>, aldri senere enn opprinnelig tid</li>'
            + '<li><b>RETUR:</b> Passasjerer kan hentes opptil 60 min <b>senere</b></li>'
            + '<li><b>Startid-spenn:</b> Maks differanse mellom hentetider i gruppen + 10 min buffer per ekstra passasjer \u2264 60 min</li>'
            + '<li><b>Omvei-filter:</b> Passasjerer med >' + MAKS_OMVEI_PROSENT + '% estimert omvei fjernes f\u00f8r visning (Haversine)</li>'
            + '<li><b>Negativ sparing:</b> Grupper som koster mer enn enkeltturer filtreres bort</li>'
            + '<li><b>Buffer:</b> Legges til per henting p\u00e5 TUR for \u00e5 kompensere ventetid ved henting</li>'
            + '<li><b>Alenetransport:</b> ' + ALLTID_ALENE.join(', ') + ' kan ikke samkj\u00f8res</li>'
            + '<li><b>Konflikter:</b> ' + KONFLIKTER.map(function(k){return k.join(" + ");}).join(", ") + ' kan ikke kombineres</li>'
            + '</ul>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '<div class="layout">'
            + '<div class="panel-left" id="gruppeliste"></div>'
            + '<div class="divider" id="divider"></div>'
            + '<div class="panel-right">'
            + '<div id="map"></div>'
            + '<div id="rute-info">Velg en gruppe for \u00e5 se kj\u00f8rerute</div>'
            + '</div></div>';

        html += '<script>'
            + 'var funn = [];'
            + 'var map, directionsService, directionsRenderer, markers = [];'
            + 'var LAAST_BEHOV = ' + JSON.stringify(Object.keys(LAAST)) + ';'
            + 'var BAGASJE_BEHOV = ' + JSON.stringify(Object.keys(BAGASJE)) + ';'
            + 'function esc(s){if(!s)return"\\u2013";var d=document.createElement("div");d.textContent=s;return d.innerHTML;}'

            // Init map — last Google Maps async
            + 'function initMap() {'
            + '  map = new google.maps.Map(document.getElementById("map"), {'
            + '    center: {lat: 59.92, lng: 10.75}, zoom: 11,'
            + '    mapTypeControl: false, streetViewControl: false,'
            + '  });'
            + '  directionsService = new google.maps.DirectionsService();'
            + '  directionsRenderer = new google.maps.DirectionsRenderer({'
            + '    map: map, suppressMarkers: true,'
            + '    polylineOptions: {strokeColor: "#2563eb", strokeWeight: 4, strokeOpacity: 0.7}'
            + '  });'
            + '  if (funn.length > 0) velgGruppe(0);'
            + '}'

            // Bygg gruppeliste
            + 'function byggGruppeliste() {'
            + '  var el = document.getElementById("gruppeliste");'
            + '  if (funn.length === 0) { el.innerHTML = "<div class=\\"tom\\">Ingen samkj\\u00f8ringsforslag</div>"; return; }'
            + '  var html = "";'
            + '  funn.forEach(function(g, i) {'
            + '    html += "<div class=\\"gruppe\\" id=\\"g"+i+"\\" onclick=\\"velgGruppe("+i+")\\">"'
            + '      + "<div class=\\"gruppe-header\\">"'
            + '      + "<span class=\\"badge" + (g.fase === 2 ? " badge-geo" : "") + "\\">" + g.turer.length + " turer</span>"'
            + '      + (g.fase === 2 ? " <span class=\\"geo-badge\\">GEO</span>" : "")'
            + '      + " \\u2192 " + esc(g.destAdr || g.destPostnr);'
            + '    if (g.detourProsent !== undefined) html += " <span class=\\"detour-badge\\">+" + g.detourProsent + "% omvei</span>";'
            + '    if (g.snittAvstand !== null) html += " <span class=\\"avstand-badge\\">~" + g.snittAvstand + " km mellom</span>";'
            + '    if (g.kapasitet.svVarsel) html += " <span class=\\"sv-badge\\">SV</span>";'
            + '    html += "<span class=\\"kap-info\\">F:"+g.kapasitet.forsete+" B:"+g.kapasitet.baksete;'
            + '    if (g.kapasitet.bagasje > 0) html += " Bag:"+g.kapasitet.bagasje;'
            + '    html += "</span></div>";'
            + '    html += "<div class=\\"gruppe-body\\"><table><thead><tr><th>Hentes</th><th>Oppm\\u00f8te</th><th>Pasient</th><th>Rek.nr</th><th>Fra</th><th>Til</th><th>Reisem\\u00e5te</th><th>Behov</th><th>Leds.</th></tr></thead><tbody>";'
            + '    g.turer.forEach(function(t) {'
            + '      var bHtml = (t.behov||[]).map(function(b) {'
            + '        var c = "behov-ok";'
            + '        if (LAAST_BEHOV.indexOf(b) >= 0) c = "behov-laast";'
            + '        else if (BAGASJE_BEHOV.indexOf(b) >= 0) c = "behov-bagasje";'
            + '        return "<span class=\\"behov-tag "+c+"\\">"+b+"</span>";'
            + '      }).join("") || "\\u2013";'
            + '      var henteHtml = "<span id=\\"hente_"+i+"_"+g.turer.indexOf(t)+"\\">"'
            + '        + "<b>"+esc(t.startTid)+"</b></span>";'
            + '      var oppmHtml = "<b>"+esc(t.oppmtid)+"</b>";'
            + '      function adrHtml(navn, adr) {'
            + '        var h = "";'
            + '        if (navn) h += "<span style=\\"color:var(--text-muted);font-size:10px\\">"+esc(navn)+"</span><br>";'
            + '        h += esc(adr);'
            + '        return h || "\\u2013";'
            + '      }'
            + '      var pasHtml = "";'
            + '      if (t.pnr) pasHtml += "<span style=\\"color:var(--text-muted);font-size:10px;font-family:JetBrains Mono,monospace\\">"+esc(t.pnr)+"</span><br>";'
            + '      pasHtml += esc(t.pnavn);'
            + '      html += "<tr><td>"+henteHtml+"</td>"'
            + '        + "<td>"+oppmHtml+"</td>"'
            + '        + "<td>"+pasHtml+"</td>"'
            + '        + "<td style=\\"font-family:JetBrains Mono,monospace;font-size:11px\\">"+esc(t.rekNr)+"</td>"'
            + '        + "<td>"+adrHtml(t.fraNavn,t.fra)+"</td>"'
            + '        + "<td>"+adrHtml(t.tilNavn,t.til)+"</td>"'
            + '        + "<td>"+esc(t.rmate)+"</td>"'
            + '        + "<td>"+bHtml+"</td>"'
            + '        + "<td>"+(t.ledsager && t.ledsager!=="0" ? t.ledsager : "\\u2013")+"</td></tr>";'
            + '    });'
            + '    html += "</tbody></table></div>";'
            + '    if (g.tidSpenn > 0) {'
            + '      html += "<div class=\\"tid-bar\\">\\u0394 "+g.tidSpenn+" min mellom oppm\\u00f8tetider</div>";'
            + '    }'
            + '    html += "</div>";'
            + '  });'
            + '  el.innerHTML = html;'
            + '}'

            // Velg gruppe og vis rute
            + 'function velgGruppe(idx) {'
            + '  document.querySelectorAll(".gruppe").forEach(function(el) { el.classList.remove("aktiv"); });'
            + '  var el = document.getElementById("g"+idx);'
            + '  if (el) el.classList.add("aktiv");'
            + '  visRute(funn[idx]);'
            + '}'

            // Fjern markorer
            + 'function fjernMarkers() {'
            + '  markers.forEach(function(m) { m.setMap(null); });'
            + '  markers = [];'
            + '}'

            // Lag marker
            + 'function lagMarker(pos, nr, farge, tittel) {'
            + '  var m = new google.maps.Marker({'
            + '    position: pos, map: map, title: tittel,'
            + '    label: { text: String(nr), color: "#fff", fontWeight: "700", fontSize: "11px" },'
            + '    icon: {'
            + '      path: google.maps.SymbolPath.CIRCLE,'
            + '      scale: 14, fillColor: farge, fillOpacity: 1,'
            + '      strokeColor: "#fff", strokeWeight: 2,'
            + '    }'
            + '  });'
            + '  markers.push(m);'
            + '  return m;'
            + '}'

            // Vis kjorerute: hentesteder -> destinasjon
            + 'var aktivGruppe = null, renderGen = 0;'
            + 'var parseTid = function(s) { if (!s) return null; var m = s.match(/(\\d{1,2}):(\\d{2})/); return m ? +m[1]*60+ +m[2] : null; };'
            + 'var fmtTid = function(m) { if (m===null) return "\\u2013"; var hh=Math.floor(m/60),mm=m%60; return (hh<10?"0":"")+hh+":"+(mm<10?"0":"")+mm; };'
            + 'function beregn(henteAdr, dest, antallLev, manuell, depTime) {'
            + '  if (!antallLev) antallLev = 1;'
            + '  function ruteOpts(origin, dest2, waypoints) {'
            + '    var o = {origin:origin, destination:dest2, travelMode:google.maps.TravelMode.DRIVING, region:"no"};'
            + '    if (waypoints) { o.waypoints = waypoints; o.optimizeWaypoints = true; }'
            + '    if (depTime) o.drivingOptions = {departureTime: depTime};'
            + '    return o;'
            + '  }'
            + '  var info = document.getElementById("rute-info");'
            + '  info.innerHTML = "Beregner rute\\u2026";'
            + '  fjernMarkers();'
            + '  console.log("[SAMKJ] beregn: henteAdr="+henteAdr.length+", manuell="+manuell);'
            + '  if (!manuell && henteAdr.length >= 2) {'
            // Prøv alle hentesteder som origin, velg korteste rute
            + '    console.log("[SAMKJ] Pr\\u00f8ver "+henteAdr.length+" origins...");'
            + '    var beste = null, besteKm = Infinity, ventPaa = henteAdr.length;'
            + '    for (var oi=0; oi<henteAdr.length; oi++) {'
            + '      (function(origIdx) {'
            + '        var wp = [];'
            + '        for (var j=0; j<henteAdr.length; j++) { if (j !== origIdx) wp.push({location:henteAdr[j],stopover:true}); }'
            + '        directionsService.route(ruteOpts(henteAdr[origIdx], dest, wp), function(result, status) {'
            + '          if (status === "OK") {'
            + '            var km = 0;'
            + '            result.routes[0].legs.forEach(function(l) { km += l.distance.value; });'
            + '            console.log("[SAMKJ] Origin "+origIdx+" ("+henteAdr[origIdx].substring(0,30)+"): "+Math.round(km/100)/10+" km");'
            + '            if (km < besteKm) { beste = {result:result, origIdx:origIdx}; besteKm = km; }'
            + '          } else {'
            + '            console.warn("[SAMKJ] Origin "+origIdx+" feilet: "+status);'
            + '          }'
            + '          ventPaa--;'
            + '          if (ventPaa === 0) {'
            + '            if (!beste) { info.innerHTML = "Ruteberegning feilet"; return; }'
            + '            console.log("[SAMKJ] Vinner: origin "+beste.origIdx+" med "+Math.round(besteKm/100)/10+" km");'
            + '            visResultat(beste.result, dest, antallLev, beste.origIdx);'
            + '          }'
            + '        });'
            + '      })(oi);'
            + '    }'
            + '  } else {'
            // Enkelt kall (1 henting eller manuell rekkefølge)
            + '    directionsService.route(ruteOpts(henteAdr[0], dest, henteAdr.slice(1).map(function(a){return {location:a,stopover:true};})), function(result, status) {'
            + '      if (status !== "OK") { info.innerHTML = "Ruteberegning feilet: "+status; return; }'
            + '      visResultat(result, dest, antallLev, -1);'
            + '    });'
            + '  }'
            + '}'

            + 'function visResultat(result, dest, antallLev, origIdx) {'
            + '  var myGen = ++renderGen;'
            + '  var info = document.getElementById("rute-info");'
            + '  if (!result || !result.routes || !result.routes[0]) { info.innerHTML = "Ingen rute funnet"; return; }'
            + '  fjernMarkers();'
            + '  directionsRenderer.setDirections(result);'
            + '  var route = result.routes[0], totalMin=0, totalKm=0;'
            + '  var legMin = [];'
            + '  for (var i=0; i<route.legs.length; i++) {'
            + '    totalMin += Math.round(route.legs[i].duration.value/60);'
            + '    totalKm += Math.round(route.legs[i].distance.value/1000*10)/10;'
            + '    legMin.push(Math.round(route.legs[i].duration.value/60));'
            + '  }'

            // Tidsberegning — bygg passasjer-rekkefølge basert på valgt origin
            + '  var turer = aktivGruppe ? aktivGruppe.turer : [];'
            + '  var tidSortert = turer.slice().sort(function(a,b) {'
            + '    var tA = parseTid(a.startTid), tB = parseTid(b.startTid);'
            + '    return (tA||9999) - (tB||9999);'
            + '  });'
            + '  var sortTurer;'
            + '  if (origIdx >= 0 && origIdx < tidSortert.length) {'
            // Re-ordn: origIdx er første, resten sortert via waypoint_order
            + '    var forste = tidSortert[origIdx];'
            + '    var resten = tidSortert.filter(function(_,i){return i!==origIdx;});'
            + '    sortTurer = [forste];'
            + '    if (route.waypoint_order && route.waypoint_order.length > 0) {'
            + '      for (var wi=0; wi<route.waypoint_order.length; wi++) {'
            + '        if (resten[route.waypoint_order[wi]]) sortTurer.push(resten[route.waypoint_order[wi]]);'
            + '      }'
            + '    }'
            + '    if (sortTurer.length < tidSortert.length) sortTurer = sortTurer.concat(resten.filter(function(r){return sortTurer.indexOf(r)===-1;}));'
            + '  } else {'
            + '    sortTurer = tidSortert;'
            + '  }'

            // Buffer per henting (les fra UI-felt, fallback til konstant)
            + '  var bufBase = parseInt(document.getElementById("bufferMin") ? document.getElementById("bufferMin").value : "' + BUFFER_PER_HENTING + '") || 0;'
            + '  var bufHJE = parseInt(document.getElementById("bufferHJE") ? document.getElementById("bufferHJE").value : "' + (BEHOV_BUFFER.HJE || 0) + '") || 0;'
            + '  var stoppBuffer = [];'
            + '  for (var bi=0; bi<sortTurer.length; bi++) {'
            + '    var buf = bufBase;'
            + '    var beh = sortTurer[bi].behov || [];'
            + '    if (beh.indexOf("HJE") >= 0) buf += bufHJE;'
            + '    stoppBuffer.push(buf);'
            + '  }'

            // Bestem retning: startTid < oppmøtetid = TUR, ellers RETUR
            + '  var erTur = true;'
            + '  if (sortTurer.length > 0) {'
            + '    var fStart = parseTid(sortTurer[0].startTid);'
            + '    var fOppm = parseTid(sortTurer[0].oppmtid);'
            + '    if (fStart !== null && fOppm !== null) erTur = fStart < fOppm;'
            + '  }'

            // Beregn ny starttid: finn tidligste mulige avgang fra stopp 0
            // slik at ingen passasjer hentes senere enn sin originale tid
            + '  var startTid0 = null;'
            + '  if (erTur) {'
            // TUR: ingen hentes SENERE enn original. Finn seneste mulige start.
            // kumT = sum(buffer[0..pi-1] + legMin[0..pi-1])
            + '    var ovre = Infinity;'
            + '    for (var pi=0; pi<sortTurer.length; pi++) {'
            + '      var orgT = parseTid(sortTurer[pi].startTid);'
            + '      if (orgT === null) continue;'
            + '      var kumT = 0;'
            + '      for (var ki=0; ki<pi; ki++) kumT += stoppBuffer[ki] + legMin[ki];'
            + '      var maks = orgT - kumT;'
            + '      if (maks < ovre) ovre = maks;'
            + '    }'
            + '    if (ovre < Infinity) startTid0 = ovre;'
            + '  } else {'
            // RETUR: ingen hentes TIDLIGERE enn original, maks 60 min senere
            + '    var nedre2 = -Infinity, ovre2 = Infinity;'
            + '    for (var pi2=0; pi2<sortTurer.length; pi2++) {'
            + '      var orgT2 = parseTid(sortTurer[pi2].startTid);'
            + '      if (orgT2 === null) continue;'
            + '      var kumT2 = 0;'
            + '      for (var ki2=pi2; ki2<sortTurer.length-1; ki2++) kumT2 += legMin[ki2];'
            + '      var mins2 = orgT2 + kumT2;'
            + '      var maks2 = orgT2 + 60 + kumT2;'
            + '      if (mins2 > nedre2) nedre2 = mins2;'
            + '      if (maks2 < ovre2) ovre2 = maks2;'
            + '    }'
            + '    if (nedre2 > -Infinity) startTid0 = Math.min(nedre2, ovre2);'
            + '  }'

            // Tabell
            + '  var retningTxt = erTur ? "TUR" : "RETUR";'
            + '  var h = "<div style=\\"margin-bottom:6px;\\"><span style=\\"font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:" + (erTur ? "rgba(59,130,246,.15);color:var(--accent)" : "rgba(34,197,94,.15);color:var(--green)") + ";\\">" + retningTxt + "</span></div>";'
            + '  h += "<table id=\\"stopp-liste\\" style=\\"width:100%;border-collapse:collapse;font-size:12px;\\">";'
            + '  h += "<thead><tr style=\\"color:var(--text-muted);font-size:10px;text-transform:uppercase;\\">"'
            + '    + "<th style=\\"padding:4px 6px;text-align:left;\\">#</th>"'
            + '    + "<th style=\\"text-align:left;\\">Adresse</th>"'
            + '    + "<th style=\\"text-align:left;\\">Pasient</th>"'
            + '    + "<th>Hentetid</th>"'
            + '    + "<th>Oppm\\u00f8te</th>"'
            + '    + "<th>Tid i bil</th>"'
            + '    + "<th>Km</th>"'
            + '    + "</tr></thead><tbody>";'

            // Kumulative kjøretider og km
            + '  var legMinuter = [], legKm = [];'
            + '  for (var li2=0; li2<route.legs.length; li2++) {'
            + '    legMinuter.push(Math.round(route.legs[li2].duration.value/60));'
            + '    legKm.push(Math.round(route.legs[li2].distance.value/100)/10);'
            + '  }'

            + '  var antallStopp = route.legs.length + 1;'
            + '  for (var si=0; si<antallStopp; si++) {'
            + '    var erForste = si === 0;'
            + '    var erLevering = si >= antallStopp - antallLev;'
            + '    var erSiste = si === antallStopp - 1;'
            + '    var leg = erForste ? route.legs[0] : route.legs[si-1];'
            + '    var stoppAdr = erForste ? leg.start_address : leg.end_address;'
            + '    var stoppPos = erForste ? leg.start_location : leg.end_location;'
            // Tid i bil: sum av resterende legs fra dette stoppet
            + '    var kjTid = "";'
            + '    if (!erLevering) {'
            + '      var tidIBil = 0;'
            + '      for (var tb=si; tb<legMinuter.length; tb++) tidIBil += legMinuter[tb];'
            + '      kjTid = tidIBil + " min";'
            + '    }'

            // Pasient fra sortert liste
            + '    var pas = !erLevering && si < sortTurer.length ? sortTurer[si] : null;'
            + '    var orgHente = pas ? parseTid(pas.startTid) : null;'
            + '    var oppm = pas ? parseTid(pas.oppmtid) : null;'

            // Beregn ny hentetid
            + '    var nyHente = null;'
            + '    if (startTid0 !== null && !erLevering && si < sortTurer.length) {'
            + '      if (erTur) {'
            + '        var kumFrem = 0;'
            + '        for (var k1=0; k1<si; k1++) kumFrem += stoppBuffer[k1] + legMinuter[k1];'
            + '        nyHente = startTid0 + kumFrem;'
            + '      } else {'
            + '        var kumBak = 0;'
            + '        for (var k2=si; k2<sortTurer.length-1; k2++) kumBak += legMinuter[k2];'
            + '        nyHente = startTid0 - kumBak;'
            + '      }'
            + '    }'

            // Forventet ankomsttid: nyHente + resterende kjøretid til destinasjon
            + '    var forvAnkomst = null;'
            + '    if (nyHente !== null && !erLevering) {'
            + '      var restKjore = stoppBuffer[si] || 0;'
            + '      for (var rk=si; rk<legMinuter.length; rk++) {'
            + '        restKjore += legMinuter[rk];'
            + '        if (erTur && rk+1 < sortTurer.length) restKjore += (stoppBuffer[rk+1] || 0);'
            + '      }'
            + '      forvAnkomst = nyHente + restKjore;'
            + '    }'
            + '    var oppmDiff = oppm !== null && forvAnkomst !== null ? forvAnkomst - oppm : null;'
            + '    var oppmDiffFarge = "var(--text-dim)";'
            + '    if (oppmDiff !== null && oppmDiff !== 0) oppmDiffFarge = oppmDiff <= 0 ? "var(--green)" : "var(--red)";'
            + '    var oppmDiffTxt = oppmDiff !== null && oppmDiff !== 0 ? (oppmDiff > 0 ? "+" : "") + oppmDiff + " min" : "";'

            // Km i bil: fra denne hentingen til destinasjon
            + '    var kmIBil = null;'
            + '    if (!erLevering && si < sortTurer.length) {'
            + '      kmIBil = 0;'
            + '      for (var lb=si; lb<legKm.length; lb++) kmIBil += legKm[lb];'
            + '      kmIBil = Math.round(kmIBil * 10) / 10;'
            + '    }'

            // Markør
            + '    var nr = si + 1;'
            + '    lagMarker(stoppPos, nr, erLevering ? "#dc2626" : "#2563eb", stoppAdr);'

            // Diff + regelbrudd-sjekk
            + '    var diff = orgHente !== null && nyHente !== null ? nyHente - orgHente : null;'
            + '    var bruddTur = erTur && diff !== null && diff < -60;'
            + '    var bruddRetur = !erTur && diff !== null && diff > 60;'
            + '    var diffFarge = "var(--text-dim)";'
            + '    if (bruddTur || bruddRetur) diffFarge = "var(--red)";'
            + '    else if (diff !== null && diff !== 0) diffFarge = erTur ? (diff < 0 ? "var(--green)" : "var(--warn)") : (diff > 0 ? "var(--green)" : "var(--warn)");'
            + '    var diffTxt = diff !== null && diff !== 0 ? (diff > 0 ? "+" : "") + diff + " min" : "";'
            + '    if (bruddTur || bruddRetur) diffTxt += " \\u26a0";'

            // Rad
            + '    h += "<tr class=\\"" + (erLevering ? "stopp-rad" : "stopp-rad draggable") + "\\" " + (erLevering ? "" : "draggable=\\"true\\"") + " style=\\"border-bottom:1px solid var(--border);\\">"'
            + '      + "<td style=\\"padding:6px;\\"><span class=\\"stopp-nr " + (erLevering ? "levering" : "henting") + "\\">" + nr + "</span></td>"'
            + '      + "<td style=\\"color:var(--text);\\">" + stoppAdr + "</td>"'
            + '      + "<td>" + (erLevering ? "<span style=\\"color:var(--text-muted);font-style:italic;\\">destinasjon</span>" : (pas ? esc(pas.pnavn) : "\\u2013")) + "</td>"'
            // Hentetid: gammel (strek over) → diff → ny tid
            + '      + "<td style=\\"text-align:center;font-family:JetBrains Mono,monospace;line-height:1.6;\\">"'
            + '      + (erLevering ? "" : (diff !== null && diff !== 0'
            + '        ? "<span style=\\"text-decoration:line-through;color:var(--text-muted);font-size:11px;\\">" + fmtTid(orgHente) + "</span><br>"'
            + '          + "<span style=\\"font-size:10px;color:" + diffFarge + "\\">" + diffTxt + "</span><br>"'
            + '          + "<span style=\\"font-weight:600;color:var(--accent);\\">" + fmtTid(nyHente) + "</span>"'
            + '        : "<span style=\\"font-weight:600;\\">" + fmtTid(orgHente) + "</span>"))'
            + '      + "</td>"'
            // Oppmøte: original → diff → forventet ankomst
            + '      + "<td style=\\"text-align:center;font-family:JetBrains Mono,monospace;line-height:1.6;\\">"'
            + '      + (erLevering ? "" : (oppmDiff !== null && oppmDiff !== 0'
            + '        ? "<span style=\\"color:var(--text-muted);font-size:11px;\\">" + fmtTid(oppm) + "</span><br>"'
            + '          + "<span style=\\"font-size:10px;color:" + oppmDiffFarge + "\\">" + oppmDiffTxt + "</span><br>"'
            + '          + "<span style=\\"font-weight:600;color:var(--accent);\\">" + fmtTid(forvAnkomst) + "</span>"'
            + '        : "<span style=\\"font-weight:600;\\">" + fmtTid(oppm) + "</span>"))'
            + '      + "</td>"'
            + '      + "<td id=\\"tid_"+si+"\\" style=\\"text-align:center;font-family:JetBrains Mono,monospace;line-height:1.6;\\">" + (kjTid ? "<span style=\\"font-weight:600;\\">" + kjTid + "</span>" : "") + "</td>"'
            + '      + "<td id=\\"km_"+si+"\\" style=\\"text-align:center;font-family:JetBrains Mono,monospace;line-height:1.6;\\">" + (kmIBil !== null ? "<span style=\\"font-weight:600;\\">" + kmIBil + " km</span>" : "") + "</td>"'
            + '      + "</tr>";'
            + '  }'

            + '  h += "</tbody></table>";'
            + '  h += "<div class=\\"rute-total\\">Samkj\\u00f8rt: "+Math.round(totalKm*10)/10+" km, ca "+totalMin+" min</div>";'
            + '  h += "<div id=\\"sparing\\" style=\\"font-size:12px;color:var(--text-muted);margin-top:4px;\\">Beregner enkeltturer\\u2026</div>";'
            + '  h += "<div id=\\"spartKr\\" style=\\"font-size:12px;margin-top:2px;\\"></div>";'
            + '  var samkjortKm = totalKm;'
            + '  h += "<div style=\\"margin-top:6px;font-size:10px;color:var(--text-muted)\\">Dra rader for \\u00e5 endre henterekkef\\u00f8lge</div>";'
            + '  info.innerHTML = h;'
            + '  initDrag(dest);'

            // Beregn individuelle turer for å vise sparing
            + '  var indKm = [], ventIndiv = sortTurer.length;'
            + '  sortTurer.forEach(function(t, ti) {'
            + '    var fra2 = (t.fra || "") + ", Norge";'
            + '    var til2 = (t.til || "") + ", Norge";'
            + '    directionsService.route({'
            + '      origin: fra2, destination: til2,'
            + '      travelMode: google.maps.TravelMode.DRIVING, region: "no"'
            + '    }, function(res2, st2) {'
            + '      if (myGen !== renderGen) return;'
            + '      var indMin = 0;'
            + '      if (st2 === "OK") {'
            + '        var km2 = 0;'
            + '        res2.routes[0].legs.forEach(function(l2) { km2 += l2.distance.value; indMin += Math.round(l2.duration.value/60); });'
            + '        indKm[ti] = Math.round(km2/100)/10;'
            + '      } else { indKm[ti] = 0; }'
            // Oppdater km-celle med stablet: oppr. (strek over) → +omvei → total
            + '      var kmCell = document.getElementById("km_"+ti);'
            + '      if (kmCell && indKm[ti] > 0) {'
            + '        var kmTotal = 0;'
            + '        for (var kb2=ti; kb2<legKm.length; kb2++) kmTotal += legKm[kb2];'
            + '        kmTotal = Math.round(kmTotal * 10) / 10;'
            + '        var kmDiff = Math.round((kmTotal - indKm[ti]) * 10) / 10;'
            + '        if (kmDiff !== 0) {'
            + '          var kFarge = kmDiff > 0 ? "var(--warn)" : "var(--green)";'
            + '          var kmPst = indKm[ti] > 0 ? Math.round(Math.abs(kmDiff) / indKm[ti] * 100) : 0;'
            + '          kmCell.innerHTML = "<span style=\\"text-decoration:line-through;color:var(--text-muted);font-size:11px;\\">" + indKm[ti] + " km</span><br>"'
            + '            + "<span style=\\"font-size:10px;color:" + kFarge + "\\">" + (kmDiff > 0 ? "+" : "") + kmDiff + " km (" + kmPst + "%)</span><br>"'
            + '            + "<span style=\\"font-weight:600;\\">" + kmTotal + " km</span>";'
            + '        } else {'
            + '          kmCell.innerHTML = "<span style=\\"font-weight:600;\\">" + indKm[ti] + " km</span>";'
            + '        }'
            + '      }'
            // Oppdater tid-i-bil med stablet: oppr. (strek over) → +tillegg → samkjørt
            + '      var tidCell = document.getElementById("tid_"+ti);'
            + '      if (tidCell && indMin > 0) {'
            + '        var samkjMin = 0;'
            + '        for (var tb2=ti; tb2<legKm.length; tb2++) samkjMin += legMinuter[tb2];'
            + '        var tillegg = samkjMin - indMin;'
            + '        if (tillegg !== 0) {'
            + '          var tFarge = tillegg > 0 ? "var(--warn)" : "var(--green)";'
            + '          var tidPst = indMin > 0 ? Math.round(Math.abs(tillegg) / indMin * 100) : 0;'
            + '          tidCell.innerHTML = "<span style=\\"text-decoration:line-through;color:var(--text-muted);font-size:11px;\\">" + indMin + " min</span><br>"'
            + '            + "<span style=\\"font-size:10px;color:" + tFarge + "\\">" + (tillegg > 0 ? "+" : "") + tillegg + " min (" + tidPst + "%)</span><br>"'
            + '            + "<span style=\\"font-weight:600;\\">" + samkjMin + " min</span>";'
            + '        }'
            + '      }'
            + '      ventIndiv--;'
            + '      if (ventIndiv === 0) {'
            + '        var sumInd = 0;'
            + '        indKm.forEach(function(k) { sumInd += k; });'
            + '        var spart = Math.round((sumInd - samkjortKm) * 10) / 10;'
            + '        var pst = sumInd > 0 ? Math.round((spart / sumInd) * 100) : 0;'
            + '        var el2 = document.getElementById("sparing");'
            + '        if (spart < 0) {'
            // Negativ sparing — skjul gruppen og velg neste
            + '          var gruppeIdx = funn.indexOf(aktivGruppe);'
            + '          if (gruppeIdx >= 0) {'
            + '            var gEl = document.getElementById("g"+gruppeIdx);'
            + '            if (gEl) gEl.style.display = "none";'
            + '          }'
            + '          var nesteIdx = -1;'
            + '          for (var ni=0; ni<funn.length; ni++) {'
            + '            if (ni === gruppeIdx) continue;'
            + '            var nEl = document.getElementById("g"+ni);'
            + '            if (nEl && nEl.style.display !== "none") { nesteIdx = ni; break; }'
            + '          }'
            + '          if (nesteIdx >= 0) { velgGruppe(nesteIdx); }'
            + '          else { document.getElementById("rute-info").innerHTML = "<div class=\\"tom\\">Ingen samkj\\u00f8ringer med positiv sparing</div>"; }'
            + '        } else if (el2) {'
            + '          el2.innerHTML = "<span style=\\"color:var(--text-dim)\\">Enkeltturer totalt: " + Math.round(sumInd*10)/10 + " km</span>"'
            + '            + "<br><span style=\\"font-weight:600;color:var(--green)\\">Spart: " + spart + " km (" + pst + "%)</span>";'
            + '          function oppdaterKr() {'
            + '            var inp = document.getElementById("prisPerKm");'
            + '            var el3 = document.getElementById("spartKr");'
            + '            if (inp && el3) {'
            + '              var pris = parseFloat(inp.value) || 0;'
            + '              var kr = Math.round(spart * pris);'
            + '              el3.innerHTML = "<span style=\\"font-weight:600;color:var(--green)\\">Spart: " + kr + " kr</span>";'
            + '            }'
            + '          }'
            + '          oppdaterKr();'
            + '          var prisInp = document.getElementById("prisPerKm");'
            + '          if (prisInp) { prisInp.removeEventListener("input", oppdaterKr); prisInp.addEventListener("input", oppdaterKr); }'
            + '        }'
            + '      }'
            + '    });'
            + '  });'
            + '}'
            + 'function initDrag(dest) {'
            + '  var dragSrc = null;'
            + '  document.querySelectorAll(".stopp-rad.draggable").forEach(function(el) {'
            + '    el.addEventListener("dragstart", function(e) { dragSrc=el; el.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; });'
            + '    el.addEventListener("dragend", function() { el.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach(function(d){d.classList.remove("drag-over");}); });'
            + '    el.addEventListener("dragover", function(e) { e.preventDefault(); el.classList.add("drag-over"); });'
            + '    el.addEventListener("dragleave", function() { el.classList.remove("drag-over"); });'
            + '    el.addEventListener("drop", function(e) {'
            + '      e.preventDefault(); el.classList.remove("drag-over");'
            + '      if (!dragSrc || dragSrc===el) return;'
            + '      var tbody = el.parentNode;'
            + '      var items = Array.from(tbody.querySelectorAll(".stopp-rad.draggable"));'
            + '      if (items.indexOf(dragSrc) < items.indexOf(el)) tbody.insertBefore(dragSrc, el.nextSibling);'
            + '      else tbody.insertBefore(dragSrc, el);'
            + '      var nyeHente = [];'
            + '      tbody.querySelectorAll(".stopp-rad.draggable").forEach(function(tr) {'
            + '        var adrTd = tr.querySelectorAll("td")[1];'
            + '        if (adrTd) nyeHente.push(adrTd.textContent.trim());'
            + '      });'
            + '      if (nyeHente.length > 0) beregn(nyeHente, dest, 1, true);'
            + '    });'
            + '  });'
            + '}'
            + 'function visRute(gruppe) {'
            + '  aktivGruppe = gruppe;'
            + '  var turer = gruppe.turer;'
            + '  var sortert = turer.slice().sort(function(a,b) {'
            + '    var tA = a.startTid ? a.startTid.match(/(\\d{2}):(\\d{2})/) : null;'
            + '    var tB = b.startTid ? b.startTid.match(/(\\d{2}):(\\d{2})/) : null;'
            + '    var mA = tA ? +tA[1]*60+ +tA[2] : 9999;'
            + '    var mB = tB ? +tB[1]*60+ +tB[2] : 9999;'
            + '    return mA - mB;'
            + '  });'
            + '  var hentesteder = [];'
            + '  sortert.forEach(function(t) { if (t.fra && hentesteder.indexOf(t.fra) === -1) hentesteder.push(t.fra); });'
            // Bygg departureTime fra tidligste startTid
            + '  var depTime = null;'
            + '  if (sortert.length > 0 && sortert[0].startTid) {'
            + '    var tm = sortert[0].startTid.match(/(\\d{1,2}):(\\d{2})/);'
            + '    if (tm) {'
            + '      var d = new Date();'
            + '      d.setHours(+tm[1], +tm[2], 0, 0);'
            + '      if (d.getTime() > Date.now()) depTime = d;'
            + '    }'
            + '  }'
            + '  if (gruppe.fase === 2 && gruppe.destGateAdr2) {'
            + '    var dests = [];'
            + '    sortert.forEach(function(t) { if (t.til && dests.indexOf(t.til) === -1) dests.push(t.til); });'
            + '    var alleStopp = hentesteder.map(function(a) { return a + ", Norge"; });'
            + '    for (var di=0; di<dests.length-1; di++) alleStopp.push(dests[di] + ", Norge");'
            + '    var finalDest = dests[dests.length-1] + ", Norge";'
            + '    console.log("[SAMKJ] visRute GEO: stopp="+JSON.stringify(alleStopp)+", dest="+finalDest);'
            + '    beregn(alleStopp, finalDest, dests.length, false, depTime);'
            + '  } else {'
            + '    var destAdr = (gruppe.destGateAdr || gruppe.destAdr || turer[0].til) + ", Norge";'
            + '    var henteNorge = hentesteder.map(function(a) { return a + ", Norge"; });'
            + '    console.log("[SAMKJ] visRute: hente="+JSON.stringify(henteNorge)+", dest="+destAdr);'
            + '    beregn(henteNorge, destAdr, 1, false, depTime);'
            + '  }'
            + '}'

            // Draggbar divider
            + '(function(){'
            + '  var div=document.getElementById("divider"),left=document.querySelector(".panel-left"),dragging=false;'
            + '  div.addEventListener("mousedown",function(e){dragging=true;div.classList.add("dragging");e.preventDefault();});'
            + '  document.addEventListener("mousemove",function(e){if(!dragging)return;var x=e.clientX,min=400,max=window.innerWidth-300;'
            + '    x=Math.max(min,Math.min(max,x));left.style.width=x+"px";});'
            + '  document.addEventListener("mouseup",function(){if(dragging){dragging=false;div.classList.remove("dragging");}});'
            + '})();'

            + 'function leggTilGrupper(nyeGrupper) {'
            + '  funn = funn.concat(nyeGrupper);'
            + '  byggGruppeliste();'
            + '  var btn = document.getElementById("geoBtn");'
            + '  if (btn) btn.disabled = true;'
            + '  var st = document.getElementById("geoStatus");'
            + '  if (st) st.textContent = nyeGrupper.length + " geo-grupper lagt til";'
            + '}'
            + 'function geoStatus(txt) {'
            + '  var st = document.getElementById("geoStatus");'
            + '  if (st) st.textContent = txt;'
            + '}'
            + 'function startGeo() {'
            + '  var btn = document.getElementById("geoBtn");'
            + '  if (btn) { btn.disabled = true; btn.textContent = "S\\u00f8ker\\u2026"; }'
            + '  if (window._startGeoCallback) window._startGeoCallback();'
            + '}'
            + 'function refreshData() {'
            + '  var btn = document.getElementById("refreshBtn");'
            + '  if (btn) { btn.disabled = true; btn.textContent = "Oppdaterer\\u2026"; }'
            + '  var st = document.getElementById("geoStatus");'
            + '  if (st) st.textContent = "Henter nye data\\u2026";'
            + '  if (window._refreshCallback) window._refreshCallback();'
            + '}'
            + 'function oppdater(data, antallRader) {'
            + '  funn = data;'
            + '  byggGruppeliste();'
            + '  var btn = document.getElementById("refreshBtn");'
            + '  if (btn) { btn.disabled = false; btn.textContent = "\\u21bb Oppdater"; }'
            + '  var geoBtn = document.getElementById("geoBtn");'
            + '  if (geoBtn) { geoBtn.disabled = false; geoBtn.textContent = "S\u00f8k flere (geo)"; }'
            + '  var pills = document.querySelectorAll(".pill");'
            + '  if (pills[0]) pills[0].textContent = data.length + " grupper";'
            + '  if (pills[1]) pills[1].textContent = antallRader + " turer";'
            + '  var st = document.getElementById("geoStatus");'
            + '  if (st) st.textContent = "Oppdatert!";'
            + '  setTimeout(function(){ if (st) st.textContent = ""; }, 3000);'
            + '  if (data.length > 0 && map) velgGruppe(0);'
            + '}'
            + 'function start(data){'
            + '  funn=data;'
            + '  byggGruppeliste();'
            + '  var s=document.createElement("script");'
            + '  s.src="https://maps.googleapis.com/maps/api/js?key=' + GMAPS_KEY + '&callback=initMap&loading=async";'
            + '  s.async=true;s.defer=true;document.head.appendChild(s);'
            + '}'
            + '<\/script></body></html>';

        popup.document.open();
        popup.document.write(html);
        popup.document.close();

        // Vent til popup-scriptet er klart, deretter overfør data
        function serialiserFunn(funnArr) {
            return funnArr.map(function (g) {
                return {
                    destPostnr: g.destPostnr, destAdr: rensAdresse(g.destAdr), destGateAdr: rensAdresse(g.destGateAdr),
                    destGateAdr2: g.destGateAdr2 ? rensAdresse(g.destGateAdr2) : null,
                    kapasitet: g.kapasitet, tidSpenn: g.tidSpenn, snittAvstand: g.snittAvstand,
                    fase: g.fase || 1, detourProsent: g.detourProsent,
                    turer: g.turer.map(function (t) {
                        return {
                            pnavn: t.pnavn, pnr: t.pnr || '', rekNr: t.rekNr || '',
                            oppmtid: t.oppmtid || '', startTid: t.startTid || '',
                            fra: rensAdresse(t.fra), til: rensAdresse(t.til),
                            fraNavn: t.fraNavn || null, tilNavn: t.tilNavn || null,
                            rmate: t.rmate, ledsager: t.ledsager, status: t.status, behov: Array.isArray(t.behov) ? t.behov : [],
                            tidMin: t.tidMin,
                        };
                    }),
                };
            });
        }

        var funnData = serialiserFunn(funn);
        function ventOgStart() {
            if (popup.start) {
                popup.start(funnData);
                // Sett opp fase 2 callback
                popup._startGeoCallback = async function () {
                    try {
                        var nyeFunn = await geografiskMatch(rester, function (s) {
                            if (popup.geoStatus) popup.geoStatus(s);
                        });
                        var nyeData = serialiserFunn(nyeFunn);
                        if (popup.leggTilGrupper) popup.leggTilGrupper(nyeData);
                    } catch (e) {
                        console.error('[SAMKJ\u00d8RER] Fase 2 feil:', e);
                        if (popup.geoStatus) popup.geoStatus('Feil: ' + e.message);
                    }
                };
                // Sett opp refresh callback
                popup._refreshCallback = async function () {
                    try {
                        var t2 = Date.now();
                        var cookieM2 = document.cookie.match(/thwerfilter=(\d+)/);
                        var rfilter2 = cookieM2 ? cookieM2[1] : '0';
                        await xhrRequest('ajax-dispatch?did=all&search=none&t=' + t2, { timeout: 10000 });
                        var xhr2 = await xhrRequest(
                            'ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + rfilter2 + '&t=' + Date.now(),
                            { timeout: 20000 }
                        );
                        var nyeRader = parseDispatch(xhr2.responseText);
                        if (popup.geoStatus) popup.geoStatus('Henter plakater\u2026');
                        await berikMedPlakat(nyeRader, function (s) { if (popup.geoStatus) popup.geoStatus(s); });
                        var nyeFunn2 = finnSamkjoringer(nyeRader);
                        var bruktIds2 = new Set();
                        nyeFunn2.forEach(function (f) { f.turer.forEach(function (t) { bruktIds2.add(t.reqId); }); });
                        rester = nyeRader.filter(function (r) { return !bruktIds2.has(r.reqId); });
                        var nyData2 = serialiserFunn(nyeFunn2);
                        if (popup.oppdater) popup.oppdater(nyData2, nyeRader.length);
                        console.log('[SAMKJ\u00d8RER] Oppdatert:', nyeFunn2.length, 'grupper,', nyeRader.length, 'turer');
                    } catch (e) {
                        console.error('[SAMKJ\u00d8RER] Refresh feil:', e);
                        if (popup.geoStatus) popup.geoStatus('Feil: ' + e.message);
                    }
                };
            }
            else { setTimeout(ventOgStart, 50); }
        }
        ventOgStart();
    }

    // -------------------------------------------------------
    //  Kjor
    // -------------------------------------------------------
    async function kjor() {
        const popup = window.open('', '_blank');
        if (!popup) { alert('Popup blokkert.'); return; }

        function oppdaterPopup(tekst) {
            if (popup && !popup.closed) {
                try { popup.document.getElementById('status').textContent = tekst; } catch(e) {}
            }
        }

        popup.document.open();
        popup.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Samkj\u00f8rer</title>'
            + '<style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;'
            + 'justify-content:center;height:100vh;margin:0;background:#f1f5f9;color:#334155;font-size:15px;}'
            + '.spinner{width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#1e3a5f;border-radius:50%;'
            + 'animation:spin 1s linear infinite;margin-bottom:16px;}'
            + '@keyframes spin{to{transform:rotate(360deg)}}</style>'
            + '</head><body><div class="spinner"></div>'
            + '<div id="status">Henter turer fra NISSY\u2026</div></body></html>');
        popup.document.close();

        try {
            const t = Date.now();
            const cookieM = document.cookie.match(/thwerfilter=(\d+)/);
            const rfilter = cookieM ? cookieM[1] : '0';

            await xhrRequest('ajax-dispatch?did=all&search=none&t=' + t, { timeout: 10000 });
            oppdaterPopup('Henter filterliste\u2026');
            const xhr = await xhrRequest(
                'ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + rfilter + '&t=' + Date.now(),
                { timeout: 20000 }
            );
            document.cookie = 'thwerfilter=' + rfilter + '; path=/';

            var rader = parseDispatch(xhr.responseText);
            console.log('[SAMKJ\u00d8RER] Parsed rader:', rader.length);

            oppdaterPopup('Fant ' + rader.length + ' turer. Henter plakater\u2026');
            await berikMedPlakat(rader, oppdaterPopup);

            // Debug-logging
            var debugPostnr = {};
            rader.forEach(function (r) {
                var pFra = hentPostnr(r.fra), pTil = hentPostnr(r.til);
                if (pFra) debugPostnr[pFra] = (debugPostnr[pFra] || 0) + 1;
                if (pTil) debugPostnr[pTil] = (debugPostnr[pTil] || 0) + 1;
            });
            var topPostnr = Object.entries(debugPostnr).sort(function(a,b){return b[1]-a[1];}).slice(0,15)
                .map(function(e){return e[0]+'('+e[1]+')';}).join(', ');
            console.log('[SAMKJ\u00d8RER] Postnr (topp 15):', topPostnr);

            var tilGrupper = {};
            rader.forEach(function (r) {
                var pnr = hentPostnr(r.til);
                if (pnr) tilGrupper[pnr] = (tilGrupper[pnr] || 0) + 1;
            });
            var topDest = Object.entries(tilGrupper).sort(function(a,b){return b[1]-a[1];}).slice(0,10)
                .map(function(e){return e[0]+'('+e[1]+')';}).join(', ');
            console.log('[SAMKJ\u00d8RER] Destinasjoner (topp 10):', topDest);
            console.log('[SAMKJ\u00d8RER] Eks adresser (5 forste):', rader.slice(0,5).map(function(r){return (r.fra||'?')+' -> '+(r.til||'?');}).join(' | '));

            // Geocoding deaktivert for hastighet — bruker postnr-matching
            // await geocodeGrupper(rader, oppdaterPopup);

            oppdaterPopup('Analyserer samkj\u00f8ringsmuligheter\u2026');
            var funn = finnSamkjoringer(rader);
            console.log('[SAMKJ\u00d8RER] Fase 1:', funn.length, 'grupper');

            // Pre-filtrering: geocode gruppeadresser og sjekk omvei med Haversine
            oppdaterPopup('Validerer grupper\u2026');
            var gruppeAdresser = new Set();
            funn.forEach(function (g) {
                g.turer.forEach(function (t) {
                    if (t.fra) gruppeAdresser.add(t.fra);
                    if (t.til) gruppeAdresser.add(t.til);
                });
            });
            var geoAdr = Array.from(gruppeAdresser);
            for (var gi = 0; gi < geoAdr.length; gi++) {
                if (gi % 10 === 0) oppdaterPopup('Geocoder grupper ' + (gi + 1) + '/' + geoAdr.length + '\u2026');
                await geocode(geoAdr[gi]);
                if (gi < geoAdr.length - 1) await sleep(50);
            }

            // Fjern passasjerer med >50% Haversine-estimert omvei
            var MAKS_OMVEI = 0.50;
            funn.forEach(function (g) {
                if (g.turer.length < 3) return;
                var turer = g.turer;
                // Estimer kombinert rute (rekkefølge: sortert etter startTid)
                var sortert = turer.slice().sort(function (a, b) {
                    return (parseTid(a.startTid || a.oppmtid) || 9999) - (parseTid(b.startTid || b.oppmtid) || 9999);
                });
                var kombKm = 0;
                for (var si = 0; si < sortert.length; si++) {
                    var fraGeo = si === 0 ? hentGeo(sortert[si].fra) : hentGeo(sortert[si - 1].fra);
                    var tilGeo = hentGeo(sortert[si].fra);
                    if (si > 0 && fraGeo && tilGeo) kombKm += haversineKm(fraGeo.lat, fraGeo.lng, tilGeo.lat, tilGeo.lng);
                }
                var destGeo = hentGeo(sortert[0].til);
                var sisteGeo = hentGeo(sortert[sortert.length - 1].fra);
                if (destGeo && sisteGeo) kombKm += haversineKm(sisteGeo.lat, sisteGeo.lng, destGeo.lat, destGeo.lng);
                kombKm *= VEIFAKTOR;

                // For hver passasjer (unntatt første), estimer ruten uten dem
                var fjern = [];
                for (var pi = 1; pi < sortert.length; pi++) {
                    var uten = sortert.filter(function (_, i) { return i !== pi; });
                    var utenKm = 0;
                    for (var ui = 1; ui < uten.length; ui++) {
                        var f1 = hentGeo(uten[ui - 1].fra), f2 = hentGeo(uten[ui].fra);
                        if (f1 && f2) utenKm += haversineKm(f1.lat, f1.lng, f2.lat, f2.lng);
                    }
                    var uSiste = hentGeo(uten[uten.length - 1].fra);
                    if (destGeo && uSiste) utenKm += haversineKm(uSiste.lat, uSiste.lng, destGeo.lat, destGeo.lng);
                    utenKm *= VEIFAKTOR;
                    var omveiPst = utenKm > 0 ? (kombKm - utenKm) / utenKm : 0;
                    if (omveiPst > MAKS_OMVEI) fjern.push(pi);
                }
                if (fjern.length > 0 && sortert.length - fjern.length >= 2) {
                    g.turer = sortert.filter(function (_, i) { return fjern.indexOf(i) === -1; });
                    console.log('[SAMKJ\u00d8RER] Pre-filter: fjernet ' + fjern.length + ' passasjer(er) fra gruppe ' + (g.destAdr || ''));
                }
            });

            // Fjern grupper med estimert negativ sparing
            funn = funn.filter(function (g) {
                var indSum = 0;
                g.turer.forEach(function (t) {
                    var fg = hentGeo(t.fra), tg = hentGeo(t.til);
                    if (fg && tg) indSum += haversineKm(fg.lat, fg.lng, tg.lat, tg.lng) * VEIFAKTOR;
                });
                var kombEst = 0;
                var sortT = g.turer.slice().sort(function (a, b) {
                    return (parseTid(a.startTid || a.oppmtid) || 9999) - (parseTid(b.startTid || b.oppmtid) || 9999);
                });
                for (var ki = 1; ki < sortT.length; ki++) {
                    var kf1 = hentGeo(sortT[ki - 1].fra), kf2 = hentGeo(sortT[ki].fra);
                    if (kf1 && kf2) kombEst += haversineKm(kf1.lat, kf1.lng, kf2.lat, kf2.lng);
                }
                var kDest = hentGeo(sortT[0].til), kSiste = hentGeo(sortT[sortT.length - 1].fra);
                if (kDest && kSiste) kombEst += haversineKm(kSiste.lat, kSiste.lng, kDest.lat, kDest.lng);
                kombEst *= VEIFAKTOR;
                if (indSum > 0 && kombEst > indSum) {
                    console.log('[SAMKJ\u00d8RER] Pre-filter: fjernet gruppe ' + (g.destAdr || '') + ' (negativ sparing)');
                    return false;
                }
                return true;
            });

            console.log('[SAMKJ\u00d8RER] Etter pre-filter:', funn.length, 'grupper');

            // Beregn rester for fase 2
            var bruktIds = new Set();
            funn.forEach(function (f) { f.turer.forEach(function (t) { bruktIds.add(t.reqId); }); });
            var rester = rader.filter(function (r) { return !bruktIds.has(r.reqId); });
            console.log('[SAMKJ\u00d8RER] Rester for fase 2:', rester.length, 'turer');

            visPopup(funn, rader.length, rader, popup, rester);
        } catch (e) {
            console.error('[SAMKJ\u00d8RER] Feil:', e);
            if (popup && !popup.closed) {
                popup.document.body.innerHTML = '<div style="color:#dc2626;padding:20px;"><strong>Feil:</strong> ' + e.message + '</div>';
            }
        }
    }

    kjor();
})();
