// === BASIC TOOLS v1.16-dev ===
// v1.1: tid-input auto-formaterer "1300" → "13:00" når 4 sifre er skrevet
// v1.2: trip.comment-delta er nå TOTAL forskyvning fra opprinnelig tid, ikke akkumulert liste
// v1.3: høyreklikk på P-rader (pågående) → "Trekk tilbake" (batch, kun fremtidig dato).
//       Bruker NISSYs egen window.removePaagaaendeOppdrag(resId, reqId) som transport.
// v1.4: 400ms delay mellom hver trekk-tilbake — NISSY rate-limiter ved batch (max 3 ble prosessert)
// v1.5: 800ms delay (400 var fortsatt for fort på batch >5) + progress-toast under kjøring
// v1.6: vent til P-rad faktisk forsvinner fra DOM før neste kall (adaptivt vs fast delay)
// v1.7: kombinerer DOM-polling med minimum 2 sek mellom kall — DOM alene ga 5/10
// v1.8: dynamisk kø — re-detekter markerte P-rader fra DOM mellom hvert kall
// v1.9: klikk X-img direkte i DOM (mimicker manuell flyt) + "Trekk tilbake alle uten ERS/RB/A/TK"
// v1.10: finn X-img via onclick-attribute (img[src=...] feilet 13/13 i v1.9 — ukjent variasjon)
// v1.11: søk X-img globalt i document via onclick-attribute (rad-lookup feilet etter re-render)
// v1.12: ventTilBorte 5s → 10s + delay 500ms → 1000ms (7/13 i v1.11 — noen rakk ikke fjernes)
// v1.13: "Trekk tilbake alle" auto-retryer — re-scan + ny runde til ingen progress
// v1.14: auto-bekreft varslingsboks (window.confirm + custom dialog) under batch-trekk-tilbake +
//        finn Behov-kolonne via thead i stedet for hardkodet tds[5] (kolonner kan være skjult/fjernet)
// v1.15: søk th-tekst globalt i tabellen (NISSY har ikke ekte <thead>-wrapper, bruker tr.tbh).
//        Ingen caching siden bruker kan legge til/fjerne kolonner dynamisk under bruk.
// v1.16: auto-retry også på markerte-flyten (samme som "alle" hadde fra v1.13)
// Inline-handlinger på NISSY-rader (høyreklikk-meny, endre hentetid, etc).
// Lastes inn av verktoykasse.js som host. Forventer at verktoykasse har satt:
//   window.__vkt_brukernavn  — NISSY-brukernavn (f.eks. 'thwe')
// Dev-versjon: basic_tools_dev.js (samme API, brukt for testing).
(function() {
    const VERSJON = '1.16-dev';
    const ER_DEV = /\bbasic_tools_dev\b/.test((document.currentScript && document.currentScript.src) || '');
    const NAVN = ER_DEV ? 'BASIC TOOLS DEV' : 'BASIC TOOLS';

    if (window.__basicTools) {
        console.log(`[${NAVN}] allerede lastet — hopper over`);
        return;
    }
    window.__basicTools = { versjon: VERSJON, dev: ER_DEV };

    const REK_BASE = 'https://pastrans-sorost.mq.nhn.no/rekvisisjon';
    const NISSY_BLAA = 'rgb(148, 169, 220)';

    function trygtFjern(el) {
        if (el && el.parentNode) {
            try { el.parentNode.removeChild(el); } catch (_) {}
        }
    }

    function tidTilMin(t) {
        const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/);
        return m ? +m[1] * 60 + +m[2] : null;
    }

    function lesMarkerteResIds() {
        const ids = [];
        document.querySelectorAll('tr[id^="V-"]').forEach(r => {
            if (r.style.backgroundColor === NISSY_BLAA) {
                const id = r.id.replace(/^V-/, '');
                if (/^\d+$/.test(id)) ids.push(id);
            }
        });
        return ids;
    }

    function lesHentetidFraRad(resId) {
        const rad = document.getElementById('V-' + resId);
        if (!rad) return null;
        const blaa = rad.querySelector('font[color="#0000FF"]');
        if (!blaa) return null;
        const m = blaa.textContent.match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : null;
    }

    function lesPasientnavnFraRad(resId) {
        const rad = document.getElementById('V-' + resId);
        if (!rad) return null;
        const tds = rad.querySelectorAll('td');
        if (tds.length < 2) return null;
        const tekst = tds[1].textContent.trim();
        return tekst || null;
    }

    // Finn første gyldige DD.MM (eller DD-MM) i radens textContent.
    // Validerer at dag 1–31 og måned 1–12 så vi ikke matcher feil tall.
    function lesAvgangsdatoFraRad(rad) {
        if (!rad) return null;
        const tekst = rad.textContent || '';
        const idag = new Date();
        const idagMidn = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate());
        // Negativ lookahead (?!\d) — rejecter "3.51" der "3.5" ellers ville matchet
        const treff = tekst.matchAll(/(\d{1,2})[.\-](\d{1,2})(?!\d)/g);
        for (const m of treff) {
            const dag = +m[1], mnd = +m[2];
            if (dag < 1 || dag > 31 || mnd < 1 || mnd > 12) continue;
            const d = new Date(idag.getFullYear(), mnd - 1, dag);
            // Hvis dato er tidligere enn i dag, anta neste år
            if (d < idagMidn) d.setFullYear(idag.getFullYear() + 1);
            return d;
        }
        return null;
    }

    function erIDagEllerTidligere(dato) {
        if (!dato) return true;  // ukjent dato → vær konservativ, behandle som "i dag"
        const idag = new Date();
        const idagMidn = new Date(idag.getFullYear(), idag.getMonth(), idag.getDate());
        return dato.getTime() <= idagMidn.getTime();
    }

    // Finn X-img i P-rad via onclick-attribute (mer robust enn å matche src="remove.gif"
    // siden filnavnet kan variere på tvers av NISSY-versjoner).
    function finnXImg(rad) {
        if (!rad) return null;
        const imgs = rad.querySelectorAll('img');
        for (const img of imgs) {
            const oc = img.getAttribute('onclick') || '';
            if (oc.startsWith('removePaagaaendeOppdrag')) return img;
        }
        return null;
    }

    // Finn X-img for et spesifikt (resId, reqId) globalt i hele dokumentet
    // — robust mot at rader blir re-renderet mellom snapshot og prosessering.
    function finnXImgGlobalt(resId, reqId) {
        const alle = document.querySelectorAll('img[onclick^="removePaagaaendeOppdrag"]');
        const target = `'${resId}','${reqId}'`;
        for (const img of alle) {
            const oc = img.getAttribute('onclick') || '';
            if (oc.includes(target)) return img;
        }
        return null;
    }

    // Auto-bekrefter NISSY varslingsbokser. Returnerer et "stopp"-callback.
    // - Overstyrer window.confirm til å returnere true (native confirm)
    // - Setter opp MutationObserver som klikker "Ja"/"OK" i custom dialoger
    function aktiverAutoBekreft() {
        const origConfirm = window.confirm;
        window.confirm = () => true;

        // Custom NISSY-dialoger fra messagebox.min.js eller liknende —
        // søk etter knapper med tekst "Ja", "OK", "Bekreft"
        const observer = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    // Sjekk noden selv og dens etterkommere
                    const knapper = [n, ...(n.querySelectorAll ? n.querySelectorAll('button, input[type="button"], a') : [])];
                    for (const k of knapper) {
                        const tekst = (k.textContent || k.value || '').trim().toLowerCase();
                        if (tekst === 'ja' || tekst === 'ok') {
                            // Sjekk at det er synlig (ikke en skjult skabelon)
                            const r = k.getBoundingClientRect && k.getBoundingClientRect();
                            if (r && (r.width || r.height)) {
                                setTimeout(() => k.click(), 50);
                                return;
                            }
                        }
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.confirm = origConfirm;
            observer.disconnect();
        };
    }

    // Plukk ut (resId, reqId) fra remove-knappens onclick i en P-rad
    // Format: onclick="removePaagaaendeOppdrag('80400090','66961981')"
    function lesPaagaaendeArgs(rad) {
        const x = finnXImg(rad);
        const onclick = x?.getAttribute('onclick') || '';
        const m = onclick.match(/removePaagaaendeOppdrag\('(\d+)','(\d+)'\)/);
        return m ? { resId: m[1], reqId: m[2] } : null;
    }

    // Finn kolonne-index for "Behov" ved å søke gjennom alle th i tabellen
    // (NISSYs header-rad bruker tr.tbh, ikke ekte <thead>-wrapper).
    // Ingen caching — bruker kan endre kolonner dynamisk under bruk.
    function finnBehovKolonneIdx(rad) {
        const tabell = rad?.closest('table');
        if (!tabell) return -1;
        const allTh = tabell.querySelectorAll('th');
        for (const th of allTh) {
            const tekst = (th.textContent || '').trim().toLowerCase();
            if (tekst === 'behov') {
                const cells = th.parentElement?.children;
                if (cells) {
                    for (let i = 0; i < cells.length; i++) {
                        if (cells[i] === th) return i;
                    }
                }
                break;
            }
        }
        return -1;
    }

    function lesBehovFraRad(rad) {
        if (!rad) return '';
        const idx = finnBehovKolonneIdx(rad);
        if (idx < 0) return '';
        const tds = rad.querySelectorAll(':scope > td');
        if (idx >= tds.length) return '';
        return tds[idx].textContent.trim().toUpperCase();
    }

    // True hvis raden har "spesielt" Behov som vi IKKE skal trekke tilbake automatisk
    const SPESIELLE_BEHOV = ['ERS', 'RB', 'A', 'TK'];
    function harSpesieltBehov(rad) {
        const idx = finnBehovKolonneIdx(rad);
        if (idx < 0) return true;  // hvis vi ikke kan lese kolonnen, vær konservativ — IKKE trekk tilbake
        const behov = lesBehovFraRad(rad);
        if (!behov) return false;
        const koder = behov.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
        return koder.some(k => SPESIELLE_BEHOV.includes(k));
    }

    let _rekUserid = null;
    async function hentRekUserid() {
        if (_rekUserid) return _rekUserid;
        const navn = window.__vkt_brukernavn;
        if (navn) { _rekUserid = navn; return _rekUserid; }
        return null;
    }

    async function dwrEncryptResId(resId) {
        const body = [
            'callCount=1',
            'windowName=',
            'c0-scriptName=Requisition',
            'c0-methodName=encrypt',
            'c0-id=0',
            `c0-param0=string:${resId}`,
            'batchId=1',
            'instanceId=0',
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
        const m = text.match(/handleCallback\([^,]+,[^,]+,"([^"]+)"\)/);
        if (!m) throw new Error('encrypt-respons uforståelig: ' + text.slice(0, 200));
        return m[1];
    }

    async function endreTidPaaResId(resId, nyTid, gammelTid) {
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

        // Auto-logg total tids-forskyvning i trip.comment.
        // Eksempel: opprinnelig 14:00 → 13:45 (-15), så 13:45 → 13:35 (-10) gir total -25.
        // Hvis comment starter med "+N" eller "-N", legges denne nye endringen til.
        // Hvis total blir 0, fjernes delta-markøren helt (men bevarer evt. resten av meldingen).
        const gMin = tidTilMin(gammelTid);
        const nMin = tidTilMin(nyTid);
        if (gMin !== null && nMin !== null) {
            const denneDelta = nMin - gMin;
            const eksisterende = (fd.get('trip.comment') || '').trim();
            // Plukk ut evt. eksisterende delta foran (f.eks. "-15" eller "+22")
            const m = eksisterende.match(/^([+-]\d+)(?:\s+(.*))?$/);
            const eksisterendeDelta = m ? parseInt(m[1], 10) : 0;
            const resten = m ? (m[2] || '') : eksisterende;
            const total = eksisterendeDelta + denneDelta;
            const merketTotal = total === 0 ? '' : (total > 0 ? '+' : '') + total;
            const deler = [];
            if (merketTotal) deler.push(merketTotal);
            if (resten) deler.push(resten);
            fd.set('trip.comment', deler.join(' ').slice(0, 255));
        }

        const res = await fetch(confirmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams([...fd]).toString(),
            credentials: 'include'
        });
        return { ok: res.ok, status: res.status };
    }

    function visKontekstmeny(resIds, x, y) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
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
        if (ER_DEV) {
            const devTag = document.createElement('span');
            devTag.textContent = ' DEV';
            devTag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
            tittel.appendChild(devTag);
        }
        meny.appendChild(tittel);

        const valg = [
            { tekst: '⏰ Endre hentetid…', handler: () => visEndreTidModal(resIds, x, y) },
        ];
        valg.forEach(v => {
            const a = document.createElement('div');
            a.textContent = v.tekst;
            a.style.cssText = 'padding:8px 12px;color:#e2e8f0;cursor:pointer;border-radius:4px;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = () => { trygtFjern(meny); v.handler(); };
            meny.appendChild(a);
        });

        document.body.appendChild(meny);

        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';

        setTimeout(() => {
            const lukk = (e) => {
                if (!meny.contains(e.target)) {
                    trygtFjern(meny);
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    function visEndreTidModal(resIds, x = 100, y = 100) {
        trygtFjern(document.getElementById('vkt-modal'));

        const turer = resIds.map(id => ({
            resId: id,
            navn: lesPasientnavnFraRad(id) || id,
            tidNaa: lesHentetidFraRad(id) || 'tt:mm'
        }));
        const antall = `${turer.length} tur${turer.length > 1 ? 'er' : ''}`;
        const devTagHTML = ER_DEV ? ' <span style="color:#fbbf24;font-weight:700;letter-spacing:0.5px;">DEV</span>' : '';

        const pop = document.createElement('div');
        pop.id = 'vkt-modal';
        pop.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'color:#e2e8f0', 'border:1px solid #334155',
            'border-radius:8px', 'padding:8px', 'width:280px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const radHTML = turer.map((t, i) => `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <div title="${t.navn}" style="flex:1;min-width:0;font-size:12px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.navn}</div>
                <input data-idx="${i}" type="text" placeholder="${t.tidNaa}" maxlength="5" autocomplete="off"
                    style="width:64px;padding:5px 7px;background:#0f172a;border:1px solid #334155;border-radius:5px;color:#fff;font-size:13px;font-family:monospace;box-sizing:border-box;text-align:center;">
            </div>
        `).join('');

        pop.innerHTML = `
            <div style="font-size:11px;color:#94a3b8;padding:0 2px 6px;border-bottom:1px solid #334155;margin-bottom:8px;">Endre hentetid · ${antall}${devTagHTML}</div>
            ${radHTML}
            <div style="display:flex;justify-content:flex-end;margin-top:6px;">
                <button id="vkt-ok" style="padding:6px 14px;background:#3b82f6;color:white;border:none;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;">OK</button>
            </div>
            <div id="vkt-progress" style="margin-top:6px;font-size:11px;color:#94a3b8;display:none;"></div>
        `;
        document.body.appendChild(pop);

        const r = pop.getBoundingClientRect();
        if (r.right > window.innerWidth) pop.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) pop.style.top = (window.innerHeight - r.height - 8) + 'px';

        const inputs = pop.querySelectorAll('input[data-idx]');
        const progressEl = pop.querySelector('#vkt-progress');
        const okBtn = pop.querySelector('#vkt-ok');
        inputs[0]?.focus();

        const lukk = () => {
            trygtFjern(pop);
            document.removeEventListener('click', utenforKlikk, true);
        };
        const utenforKlikk = (e) => { if (!pop.contains(e.target)) lukk(); };
        setTimeout(() => document.addEventListener('click', utenforKlikk, true), 0);

        function parseTid(raa) {
            const t = raa.trim();
            // Aksepter "tt:mm", "ttmm" (1300), eller "tmm" (830 → 8:30)
            let hh, mm;
            let m = t.match(/^(\d{1,2}):(\d{2})$/);
            if (m) { hh = +m[1]; mm = +m[2]; }
            else if (m = t.match(/^(\d{2})(\d{2})$/)) { hh = +m[1]; mm = +m[2]; }
            else if (m = t.match(/^(\d{1})(\d{2})$/)) { hh = +m[1]; mm = +m[2]; }
            else return null;
            if (hh > 23 || mm > 59) return null;
            return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
        }

        okBtn.onclick = async () => {
            const oppgaver = [];
            let valideringFeil = false;
            inputs.forEach(inp => {
                inp.style.borderColor = '#334155';
                const raa = inp.value.trim();
                if (!raa) return;
                const norm = parseTid(raa);
                if (!norm) { inp.style.borderColor = '#ef4444'; valideringFeil = true; return; }
                const idx = +inp.dataset.idx;
                oppgaver.push({ resId: turer[idx].resId, tid: norm, gammelTid: turer[idx].tidNaa });
            });
            if (valideringFeil) return;
            if (!oppgaver.length) {
                progressEl.style.display = 'block';
                progressEl.style.color = '#94a3b8';
                progressEl.textContent = 'Ingen tider angitt — fyll inn de du vil endre';
                return;
            }
            okBtn.disabled = true;
            inputs.forEach(i => i.disabled = true);
            progressEl.style.display = 'block';
            progressEl.style.color = '#94a3b8';
            let ok = 0, fail = 0;
            for (let i = 0; i < oppgaver.length; i++) {
                const o = oppgaver[i];
                progressEl.textContent = `${i + 1}/${oppgaver.length} — endrer ${o.resId}…`;
                try {
                    const r = await endreTidPaaResId(o.resId, o.tid, o.gammelTid);
                    if (r.ok) ok++; else { fail++; console.warn(`[${NAVN}] feil for`, o.resId, r); }
                } catch (e) {
                    console.warn(`[${NAVN}] endreTid kastet for`, o.resId, e);
                    fail++;
                }
            }
            progressEl.textContent = `${ok} endret${fail ? ', ' + fail + ' feilet' : ''}`;
            progressEl.style.color = fail ? '#fbbf24' : '#10b981';
            setTimeout(lukk, fail ? 2500 : 1200);
        };

        inputs.forEach(inp => {
            inp.onkeydown = (e) => {
                if (e.key === 'Enter') okBtn.click();
                if (e.key === 'Escape') lukk();
            };
            // Auto-formatering: når 4 sifre er skrevet uten kolon, sett inn ":" mellom siffer 2 og 3
            inp.oninput = () => {
                const v = inp.value;
                if (/^\d{4}$/.test(v)) {
                    inp.value = v.slice(0, 2) + ':' + v.slice(2);
                }
            };
        });
    }

    function lesPasientnavnFraRadGeneric(rad) {
        if (!rad) return null;
        const tds = rad.querySelectorAll('td');
        if (tds.length < 2) return null;
        return tds[1].textContent.trim() || null;
    }

    // Samler alle blå-markerte P-rader → liste av {resId, reqId, navn, dato}
    function lesMarkertePaagaaende() {
        const liste = [];
        document.querySelectorAll('tr[id^="P-"]').forEach(r => {
            if (r.style.backgroundColor !== NISSY_BLAA) return;
            const args = lesPaagaaendeArgs(r);
            if (!args) return;
            liste.push({
                resId: args.resId,
                reqId: args.reqId,
                navn: lesPasientnavnFraRadGeneric(r) || args.resId,
                dato: lesAvgangsdatoFraRad(r)
            });
        });
        return liste;
    }

    function visTrekkTilbakeMeny(turer, x, y) {
        trygtFjern(document.getElementById('vkt-ctx-meny'));
        // Splitt etter om dato er fremtidig
        const fremtidige = turer.filter(t => !erIDagEllerTidligere(t.dato));
        const idagEllerFør = turer.filter(t => erIDagEllerTidligere(t.dato));

        const meny = document.createElement('div');
        meny.id = 'vkt-ctx-meny';
        meny.style.cssText = [
            'position:fixed', `left:${x}px`, `top:${y}px`, 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:8px',
            'padding:4px', 'min-width:260px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif', 'font-size:13px'
        ].join(';');

        const tittel = document.createElement('div');
        tittel.textContent = `${turer.length} tur${turer.length > 1 ? 'er' : ''} valgt`;
        tittel.style.cssText = 'padding:6px 12px;font-size:11px;color:#94a3b8;border-bottom:1px solid #334155;margin-bottom:4px;';
        if (ER_DEV) {
            const devTag = document.createElement('span');
            devTag.textContent = ' DEV';
            devTag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;';
            tittel.appendChild(devTag);
        }
        meny.appendChild(tittel);

        const a = document.createElement('div');
        a.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;' +
            (fremtidige.length ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (fremtidige.length) {
            const teller = fremtidige.length;
            const skipText = idagEllerFør.length
                ? ` <span style="font-size:10px;color:#fbbf24;">(${idagEllerFør.length} i dag/tidligere hoppes over)</span>`
                : '';
            a.innerHTML = `🔙 Trekk tilbake ${teller} tur${teller > 1 ? 'er' : ''}${skipText}`;
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '';
            a.onclick = async () => {
                trygtFjern(meny);
                const navnliste = fremtidige.slice(0, 5).map(t => t.navn).join(', ') +
                    (fremtidige.length > 5 ? ` … (+${fremtidige.length - 5} til)` : '');
                if (!confirm(`Trekke tilbake ${teller} tur${teller > 1 ? 'er' : ''} fra pågående?\n\n${navnliste}`)) return;
                if (typeof window.removePaagaaendeOppdrag !== 'function') {
                    alert('Fant ikke removePaagaaendeOppdrag — er du på Planlegger-siden?');
                    return;
                }

                // Progress-toast nede til høyre
                trygtFjern(document.getElementById('vkt-tt-progress'));
                const toast = document.createElement('div');
                toast.id = 'vkt-tt-progress';
                toast.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:200px;';
                document.body.appendChild(toast);

                async function ventTilBorte(resId, maks = 10000) {
                    const start = Date.now();
                    while (Date.now() - start < maks) {
                        if (!document.getElementById('P-' + resId)) return true;
                        await new Promise(r => setTimeout(r, 100));
                    }
                    return false;
                }

                // Klikk X-img i DOM i stedet for å kalle funksjonen direkte —
                // matcher manuell flyt (som alltid funker) og trigger evt. event listeners.
                const stoppAutoBekreft = aktiverAutoBekreft();
                const totaltStart = fremtidige.length;
                let totaltOk = 0;
                let runde = 0;
                // Spor hvilke turer som gjenstår — kun de som fortsatt har X-knapp i DOM
                let gjenstaaende = fremtidige.slice();
                try {
                    while (gjenstaaende.length > 0) {
                        runde++;
                        let progressDenneRunde = 0;
                        const denne = gjenstaaende.filter(t => finnXImgGlobalt(t.resId, t.reqId));
                        if (denne.length === 0) break;
                        for (let i = 0; i < denne.length; i++) {
                            const t = denne[i];
                            toast.textContent = `Runde ${runde}: ${i + 1}/${denne.length} (${totaltOk}/${totaltStart} totalt) — ${t.navn}`;
                            const xImg = finnXImgGlobalt(t.resId, t.reqId);
                            if (!xImg) continue;
                            try {
                                xImg.click();
                                const borte = await ventTilBorte(t.resId);
                                if (borte) { totaltOk++; progressDenneRunde++; }
                            } catch (e) {
                                console.warn(`[${NAVN}] klikk feilet for ${t.resId}`, e);
                            }
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        // Re-evaluer hva som gjenstår: alt som fortsatt har X-knapp
                        gjenstaaende = gjenstaaende.filter(t => finnXImgGlobalt(t.resId, t.reqId));
                        if (progressDenneRunde === 0) {
                            console.warn(`[${NAVN}] runde ${runde} ga 0 progress, gir opp med ${gjenstaaende.length} igjen`);
                            break;
                        }
                        console.log(`[${NAVN}] runde ${runde} ferdig: ${progressDenneRunde} prosessert, ${totaltOk}/${totaltStart} totalt`);
                        if (gjenstaaende.length > 0) await new Promise(r => setTimeout(r, 1500));
                    }
                } finally {
                    stoppAutoBekreft();
                }
                const fail = totaltStart - totaltOk;
                const ok = totaltOk;
                toast.textContent = `Ferdig: ${ok} trukket tilbake${fail ? ', ' + fail + ' feilet' : ''}`;
                toast.style.color = fail ? '#fbbf24' : '#10b981';
                console.log(`[${NAVN}] trekk tilbake: ${ok} ok, ${fail} feilet`);
                setTimeout(() => trygtFjern(toast), fail ? 4000 : 2000);
            };
        } else {
            a.innerHTML = '🔙 Trekk tilbake <span style="font-size:10px;font-style:italic;">(kun fremtidig dato)</span>';
        }
        meny.appendChild(a);

        // Ekstra valg: trekk tilbake ALLE pågående uten ERS/RB/A/TK (uavhengig av markering)
        // Tellingen gjøres på åpningstidspunkt — viser hvor mange som er i kandidat-listen
        const alle = Array.from(document.querySelectorAll('tr[id^="P-"]')).filter(r => {
            const args = lesPaagaaendeArgs(r);
            if (!args) return false;
            if (erIDagEllerTidligere(lesAvgangsdatoFraRad(r))) return false;
            if (harSpesieltBehov(r)) return false;
            return true;
        });
        const alleSep = document.createElement('div');
        alleSep.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(alleSep);

        const alleA = document.createElement('div');
        alleA.style.cssText = 'padding:8px 12px;border-radius:4px;font-size:13px;' +
            (alle.length ? 'color:#e2e8f0;cursor:pointer;' : 'color:#475569;cursor:not-allowed;');
        if (alle.length) {
            alleA.innerHTML = `🌐 Trekk tilbake alle ${alle.length} <span style="font-size:10px;color:#94a3b8;">(uten ERS/RB/A/TK)</span>`;
            alleA.onmouseover = () => alleA.style.background = '#334155';
            alleA.onmouseout = () => alleA.style.background = '';
            alleA.onclick = async () => {
                trygtFjern(meny);
                if (!confirm(`Trekke tilbake alle ${alle.length} fremtidige pågående-turer uten ERS/RB/A/TK?`)) return;
                trygtFjern(document.getElementById('vkt-tt-progress'));
                const t2 = document.createElement('div');
                t2.id = 'vkt-tt-progress';
                t2.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:10px 14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);min-width:200px;';
                document.body.appendChild(t2);

                async function ventTilBorte2(resId, maks = 10000) {
                    const start = Date.now();
                    while (Date.now() - start < maks) {
                        if (!document.getElementById('P-' + resId)) return true;
                        await new Promise(r => setTimeout(r, 100));
                    }
                    return false;
                }

                // Re-skanner kandidater fra DOM mellom hver "runde" og prøver igjen til
                // det ikke skjer mer progress. Håndterer NISSYs queue-fenomen ved store batches.
                function finnAlleKandidater() {
                    return Array.from(document.querySelectorAll('tr[id^="P-"]')).filter(r => {
                        if (!lesPaagaaendeArgs(r)) return false;
                        if (erIDagEllerTidligere(lesAvgangsdatoFraRad(r))) return false;
                        if (harSpesieltBehov(r)) return false;
                        return true;
                    });
                }

                const stoppAutoBekreft2 = aktiverAutoBekreft();
                const totaltStart = alle.length;
                let totaltOk = 0;
                let runde = 0;
                try {
                    while (true) {
                        runde++;
                        const kandidater = finnAlleKandidater();
                        if (kandidater.length === 0) break;
                        let progressDenneRunde = 0;
                        const oppgaver = kandidater.map(r => ({
                            args: lesPaagaaendeArgs(r),
                            navn: lesPasientnavnFraRadGeneric(r)
                        })).filter(o => o.args);
                        for (let i = 0; i < oppgaver.length; i++) {
                            const o = oppgaver[i];
                            t2.textContent = `Runde ${runde}: ${i + 1}/${oppgaver.length} (${totaltOk}/${totaltStart} totalt) — ${o.navn || o.args.resId}`;
                            const xImg = finnXImgGlobalt(o.args.resId, o.args.reqId);
                            if (!xImg) continue;
                            try {
                                xImg.click();
                                const borte = await ventTilBorte2(o.args.resId);
                                if (borte) { totaltOk++; progressDenneRunde++; }
                            } catch (e) {
                                console.warn(`[${NAVN}] klikk feilet for ${o.args.resId}`, e);
                            }
                            await new Promise(r => setTimeout(r, 1000));
                        }
                        if (progressDenneRunde === 0) {
                            console.warn(`[${NAVN}] runde ${runde} ga 0 progress, gir opp med ${kandidater.length} igjen`);
                            break;
                        }
                        console.log(`[${NAVN}] runde ${runde} ferdig: ${progressDenneRunde} prosessert, ${totaltOk} totalt`);
                        await new Promise(r => setTimeout(r, 1500));
                    }
                } finally {
                    stoppAutoBekreft2();
                }
                const igjen = finnAlleKandidater().length;
                t2.textContent = `Ferdig: ${totaltOk} trukket tilbake${igjen ? `, ${igjen} igjen (NISSY queue)` : ''}`;
                t2.style.color = igjen ? '#fbbf24' : '#10b981';
                setTimeout(() => trygtFjern(t2), igjen ? 5000 : 2500);
            };
        } else {
            alleA.innerHTML = '🌐 Trekk tilbake alle <span style="font-size:10px;font-style:italic;">(ingen kandidater)</span>';
        }
        meny.appendChild(alleA);

        document.body.appendChild(meny);
        const r = meny.getBoundingClientRect();
        if (r.right > window.innerWidth) meny.style.left = (window.innerWidth - r.width - 8) + 'px';
        if (r.bottom > window.innerHeight) meny.style.top = (window.innerHeight - r.height - 8) + 'px';

        setTimeout(() => {
            const lukk = (ev) => {
                if (!meny.contains(ev.target)) {
                    trygtFjern(meny);
                    document.removeEventListener('click', lukk, true);
                    document.removeEventListener('contextmenu', lukk, true);
                }
            };
            document.addEventListener('click', lukk, true);
            document.addEventListener('contextmenu', lukk, true);
        }, 0);
    }

    function kontekstmenyHandler(e) {
        const rad = e.target.closest && e.target.closest('tr[id^="V-"], tr[id^="P-"]');
        if (!rad) return;

        if (rad.id.startsWith('V-')) {
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
        } else if (rad.id.startsWith('P-')) {
            const erMarkert = rad.style.backgroundColor === NISSY_BLAA;
            const markerte = lesMarkertePaagaaende();
            let turer;
            if (erMarkert && markerte.length > 0) {
                turer = markerte;
            } else {
                const args = lesPaagaaendeArgs(rad);
                if (!args) return;
                turer = [{
                    resId: args.resId,
                    reqId: args.reqId,
                    navn: lesPasientnavnFraRadGeneric(rad) || args.resId,
                    dato: lesAvgangsdatoFraRad(rad)
                }];
            }
            e.preventDefault();
            visTrekkTilbakeMeny(turer, e.clientX, e.clientY);
        }
    }

    document.addEventListener('contextmenu', kontekstmenyHandler, true);
    console.log(`[${NAVN} v${VERSJON}] aktiv — høyreklikk-meny på V-rader (endre tid) og P-rader (trekk tilbake)`);
})();
