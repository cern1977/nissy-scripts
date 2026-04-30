(function() {
    // ==================================================================
    //    Overvåker Avvik v38.4.14-dev
    //    Standalone avviksmonitor for NISSY
    //    Arkitektur: Dispatch-first -- leser data fra dispatch-XML
    //    Sjekker: Barn, PNR, Dublett, Adresse, Kommunegrense
    //    Ingen IndexedDB -- hver skanning er uavhengig
    // ==================================================================
    //
    // TODO:
    //   [ ] Adresse:  Krev årsak ved manuell godkjenning ("Godkjenn denne runden")
    //                 — årsak skal lagres i avvik_handlinger.grunn i DB
    //   [ ] Adresse:  Logg kommunenavn i grunn ved manuell godkjenning av kommuneavvik
    //   [ ] Kommune:  Auto-godkjenn ved alternativ adresse match (venter på reelle eksempler)
    //
    const VERSION = '38.4.30-dev';
    const TITTEL = 'Overvåker Avvik v' + VERSION;

    const CONFIG = {
        RFILTER_IDS: [19249, 19250, 19251, 19259, 19260, 19261, 19262, 19263, 19275, 19276, 19277, 19278],
        BARN_ALDER_GRENSE: 12,
        BLIKSUND_URL: 'https://zone1.bliksundhub.com/65113/grid/v2/prk_incident/131/incidents/create',
        RAPPORT_EPOST: 'thomas.westby@ous-hf.no'
    };

    // Hent brukernavn fra NISSY
    function hentNissyNavn() {
        try {
            const match = document.body.innerHTML.match(/Pasientreisekontor[^<]*-\s*(?:&nbsp;\s*)*([^<]+)/);
            if (match) {
                return match[1].trim().replace(/&nbsp;/g, '').trim(); // "Westby, Thomas"
            }
        } catch(e) {}
        return '';
    }
    function hentSignatur() {
        const fullNavn = hentNissyNavn();
        if (!fullNavn) return 'Ukjent';
        const deler = fullNavn.split(',').map(s => s.trim());
        if (deler.length === 2) return `${deler[1]} ${deler[0].charAt(0)}.`;
        return fullNavn;
    }
    const NISSY_NAVN = hentNissyNavn();
    const SIGNATUR = hentSignatur();
    // NISSY-brukernavn (login-koden som "thwe"/"gugu") — til stats-JOIN
    // Auto-detekt fra cookie-prefix: NISSY lagrer preferanser som <brukernavn>efilter, <brukernavn>vopp osv.
    function hentNissyBrukernavn() {
        try {
            // Manuell override (for edge cases)
            const lagret = localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret.trim().toLowerCase();
            // Auto-detekt fra cookie-prefix
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
    const NISSY_BRUKERNAVN = hentNissyBrukernavn();

    // === SESJONSRAPPORTERING (v38.4.15-dev) — synker til ovr_sesjoner via live_sesjon.php ===
    const SESJON_URL = 'https://thomaswestby.no/skript/live_sesjon.php';
    let _sesjonId = null;
    async function _startSesjon() {
        try {
            const params = new URLSearchParams({
                handling: 'start',
                nissy_id: NISSY_BRUKERNAVN || '',
                signatur: SIGNATUR || '',
                versjon: VERSION,
                skript: 'Avvik'
            });
            const res = await fetch(`${SESJON_URL}?${params}`);
            if (res.ok) {
                const j = await res.json();
                if (j && j.ok && j.id) _sesjonId = j.id;
            }
        } catch(e) { console.warn('[SESJON] start feilet:', e.message); }
    }
    function _sluttSesjon() {
        if (!_sesjonId) return;
        try {
            const data = new Blob([JSON.stringify({ handling: 'slutt', id: _sesjonId })], { type: 'application/json' });
            navigator.sendBeacon(SESJON_URL, data);
        } catch(e) {}
    }
    window.addEventListener('beforeunload', _sluttSesjon);
    window.addEventListener('pagehide', _sluttSesjon);
    // Start umiddelbart + heartbeat hvert 60. sek
    _startSesjon();
    setInterval(() => {
        // Avslutt sesjon hvis popup er lukket (bruker har stoppet å bruke skriptet)
        if (_sesjonId !== null && window.mqWin && window.mqWin.closed) {
            try {
                const p = new URLSearchParams({ handling: 'slutt', id: _sesjonId });
                fetch(`${SESJON_URL}?${p}`);
            } catch(e) {}
            _sesjonId = null;
            return;
        }
        if (_sesjonId === null) { _startSesjon(); return; }
        try {
            const seksjon = (typeof aktivtSkann !== 'undefined' && aktivtSkann) ? aktivtSkann : '';
            const params = new URLSearchParams({ handling: 'heartbeat', id: _sesjonId, versjon: VERSION, seksjon });
            fetch(`${SESJON_URL}?${params}`);
        } catch(e) {}
    }, 60000);


    // === CLAIM-SYSTEM state og helpers (v38.4.15-dev) ===
    const _mineKrav = new Set();
    async function _synkroniserKrav() {
        try {
            const res = await fetch(`${SERVER_BASE}/ovr_krav.php?action=aktive`);
            const j = await res.json();
            if (!j.ok) return;
            const andres = j.krav.filter(k => k.nissy_id !== NISSY_BRUKERNAVN).map(k => ({ rek_nr: k.rek_nr, signatur: k.signatur }));
            // Heartbeat for mine aktive krav
            for (const rek of _mineKrav) {
                fetch(`${SERVER_BASE}/ovr_krav.php?action=heartbeat&rek_nr=${encodeURIComponent(rek)}&nissy_id=${encodeURIComponent(NISSY_BRUKERNAVN || '')}`);
            }
            avvikChannel.postMessage({ type: 'KRAV_LISTE', mine: [..._mineKrav], andres });
        } catch(e) {}
    }
    // Poll hvert 3. sek
    setInterval(_synkroniserKrav, 3000);
    // === GODKJENN-POLLING (v38.4.15-dev) ===
    let _sistGodkjentTid = new Date().toISOString().slice(0, 19).replace('T', ' ');
    async function _pollGodkjenninger() {
        try {
            const url = `${SERVER_BASE}/godkjente_turer_liste.php?etter=${encodeURIComponent(_sistGodkjentTid)}&eksluder=${encodeURIComponent(NISSY_BRUKERNAVN || '')}`;
            const res = await fetch(url);
            const j = await res.json();
            if (!j.ok) return;
            if (j.tid) _sistGodkjentTid = j.tid;
            for (const rad of (j.nye || [])) {
                if (rad.nissy_id === NISSY_BRUKERNAVN) continue; // skip egne
                // Synk med lokalt minne så neste skann filtrerer bort
                if (rad.rek_nr) godkjentIMinne.add(rad.rek_nr);
                // Varsle popup — fade kort + toast
                avvikChannel.postMessage({
                    type: 'GODKJENT_AV_ANNEN',
                    rek_nr: rad.rek_nr,
                    signatur: (rad.bruker || rad.nissy_id || 'annen bruker')
                });
            }
        } catch(e) { /* stille feil */ }
    }
    setInterval(_pollGodkjenninger, 30000);

    // Frigi mine krav ved tab-close
    window.addEventListener('beforeunload', () => {
        for (const rek of _mineKrav) {
            try {
                navigator.sendBeacon(`${SERVER_BASE}/ovr_krav.php?action=frigi&rek_nr=${encodeURIComponent(rek)}&nissy_id=${encodeURIComponent(NISSY_BRUKERNAVN || '')}`);
            } catch(e) {}
        }
    });


    // Send handling til sentral logg (godkjenning, avvik-registrering osv.)
    function loggHandling(handling, data) {
        try {
            const params = new URLSearchParams({
                handling,
                bruker: NISSY_NAVN || '',
                nissy_id: NISSY_BRUKERNAVN || '',
                seksjon: data.seksjon || '',
                rek_nr: data.rek_nr || '',
                tur_id: data.tur_id || '',
                res_id: data.res_id || '',
                grunn: data.grunn || '',
                rekvirent: data.rekvirent || '',
                bestiller: data.bestiller || '',
                detaljer: data.detaljer ? (typeof data.detaljer === 'string' ? data.detaljer : JSON.stringify(data.detaljer)) : ''
            });
            fetch(`${SERVER_BASE}/handling_logg.php?${params}`, { mode: 'no-cors' });
        } catch (e) {}
    }

    const SERVER_BASE = 'https://thomaswestby.no/skript';

    // Slå opp vedtak i DB — returnerer første gyldige treff, eller null.
    // Sender hele meldingsteksten; serveren matcher saksnummer/kort_id som substring.
    async function sjekkVedtakIDb(tekst, turdato) {
        if (!tekst || !tekst.trim()) return null;
        try {
            const url = `${SERVER_BASE}/vedtak.php?handling=soek` +
                `&tekst=${encodeURIComponent(tekst)}` +
                `&turdato=${encodeURIComponent(turdato || '')}`;
            const res = await fetch(url, { cache: 'no-store' });
            const j = await res.json();
            if (!j.ok || !Array.isArray(j.treff) || !j.treff.length) return null;
            return j.treff.find(v => v.gyldig) || null;
        } catch (e) {
            console.warn('[VEDTAK] Feil ved oppslag:', e);
            return null;
        }
    }

    const FIL_ADR = 'godkjente_adresser.json';
    const FIL_KOM = 'godkjente_kommune.json';

    let godkjenteAdresserGH = [];
    let godkjenteOrdGH = [];
    let godkjenteKanskjePostnrGH = [];
    let godkjenteKommuneOrdGH = [];
    let godkjenteKommuneAdresserGH = [];
    let godkjenteSykehusPostnrGH = ['0450', '1474', '0379', '0372'];
    let godkjenteSpesialistKombiGH = [{ ord: 'øyesenteret', postnr: '0164' }, { ord: 'post', postnr: '1453' }];
    let godkjenteRuteKombiGH = [{ a: 'legevakt', b: 'sykehus' }];
    let godkjenteGrunnerGH = ['Kortere reise'];
    let godkjenteAdresseGrunnerGH = ['Kortere reise'];
    const GH_LS_ADR = 'overvaker_avvik_godkjente_adr';
    const GH_LS_KOM = 'overvaker_avvik_godkjente_kom';

    function parseArr(v) { if (Array.isArray(v)) return v; if (typeof v === 'string') { try { const p = JSON.parse(v); if (Array.isArray(p)) return p; } catch(e){} } return []; }

    // Adresse-objekt: {navn, adresse, godkjent} — bakoverkompatibel med strenger
    function normaliserAdr(item) {
        if (typeof item === 'string') return { adresse: item.toLowerCase().trim(), navn: '', godkjent: true };
        if (item && typeof item === 'object' && item.adresse) return { adresse: item.adresse.toLowerCase().trim(), navn: item.navn || '', godkjent: item.godkjent !== false };
        return { adresse: '', navn: '', godkjent: false };
    }
    function hentAdrStreng(item) { return typeof item === 'string' ? item.toLowerCase().trim() : (item && item.adresse ? item.adresse.toLowerCase().trim() : ''); }
    function finnAdrNavn(adresseStreng) {
        const s = adresseStreng.toLowerCase().trim();
        for (let i = 0; i < godkjenteAdresserGH.length; i++) {
            const n = normaliserAdr(godkjenteAdresserGH[i]);
            if (n.adresse === s || s.includes(n.adresse) || n.adresse.includes(s)) return n.navn;
        }
        return '';
    }
    function visAdr(item) { const n = normaliserAdr(item); return n.navn ? n.navn + ' \u2014 ' + n.adresse : n.adresse; }

    function lastGodkjenteFraLS() {
        try {
            const a = localStorage.getItem(GH_LS_ADR);
            if (a) { const j = JSON.parse(a); godkjenteAdresserGH = parseArr(j.adresser); godkjenteOrdGH = parseArr(j.ord).map(x=>x.toLowerCase().trim()); godkjenteKanskjePostnrGH = parseArr(j.kanskje_postnr); if (j.grunner) godkjenteAdresseGrunnerGH = parseArr(j.grunner); }
            const k = localStorage.getItem(GH_LS_KOM);
            if (k) { const j = JSON.parse(k); godkjenteKommuneOrdGH = parseArr(j.ord).map(x=>x.toLowerCase().trim()); godkjenteKommuneAdresserGH = parseArr(j.adresser); if (j.sykehus_postnr) godkjenteSykehusPostnrGH = parseArr(j.sykehus_postnr); if (j.spesialist_kombi) godkjenteSpesialistKombiGH = parseArr(j.spesialist_kombi); if (j.rute_kombi) godkjenteRuteKombiGH = parseArr(j.rute_kombi); if (j.grunner) godkjenteGrunnerGH = parseArr(j.grunner); }
        } catch (e) {}
    }

    function lagreAdrILS() { try { localStorage.setItem(GH_LS_ADR, JSON.stringify({adresser:godkjenteAdresserGH, ord:godkjenteOrdGH, kanskje_postnr:godkjenteKanskjePostnrGH, grunner:godkjenteAdresseGrunnerGH, oppdatert:new Date().toISOString().slice(0,10)})); } catch(e){} }
    function lagreKomILS() { try { localStorage.setItem(GH_LS_KOM, JSON.stringify({ord:godkjenteKommuneOrdGH, adresser:godkjenteKommuneAdresserGH, sykehus_postnr:godkjenteSykehusPostnrGH, spesialist_kombi:godkjenteSpesialistKombiGH, rute_kombi:godkjenteRuteKombiGH, grunner:godkjenteGrunnerGH, oppdatert:new Date().toISOString().slice(0,10)})); } catch(e){} }

    async function lastGodkjenteAdresser() {
        try {
            const [resA, resK] = await Promise.all([
                fetch(`${SERVER_BASE}/ovr_godkjente.php?action=hent_adresser`),
                fetch(`${SERVER_BASE}/ovr_godkjente.php?action=hent_kommune`)
            ]);
            if (resA.ok) {
                const j = await resA.json();
                godkjenteAdresserGH = parseArr(j.adresser);
                godkjenteOrdGH = parseArr(j.ord).map(o=>o.toLowerCase().trim());
                godkjenteKanskjePostnrGH = parseArr(j.kanskje_postnr);
                if (j.grunner) godkjenteAdresseGrunnerGH = parseArr(j.grunner);
                lagreAdrILS();
            }
            if (resK.ok) {
                const j = await resK.json();
                godkjenteKommuneOrdGH = parseArr(j.ord).map(o=>o.toLowerCase().trim());
                godkjenteKommuneAdresserGH = parseArr(j.adresser);
                if (j.sykehus_postnr) godkjenteSykehusPostnrGH = parseArr(j.sykehus_postnr);
                if (j.spesialist_kombi) godkjenteSpesialistKombiGH = parseArr(j.spesialist_kombi);
                if (j.rute_kombi) godkjenteRuteKombiGH = parseArr(j.rute_kombi);
                if (j.grunner) godkjenteGrunnerGH = parseArr(j.grunner);
                lagreKomILS();
            }
            console.log(`[SERVER] Lastet: ${godkjenteAdresserGH.length} adr, ${godkjenteOrdGH.length} ord, ${godkjenteKommuneOrdGH.length} k-ord, ${godkjenteKommuneAdresserGH.length} k-adr, ${godkjenteSykehusPostnrGH.length} s-postnr, ${godkjenteSpesialistKombiGH.length} s-kombi, ${godkjenteRuteKombiGH.length} rute, ${godkjenteGrunnerGH.length} grunner`);
            // Last godkjente turer og km-cache fra server
            await Promise.all([lastGodkjenteFraServer(), lastKmCacheFraServer()]);
        } catch (e) {
            console.warn('[SERVER] Feil -- bruker localStorage-fallback:', e.message);
            lastGodkjenteFraLS();
            // Prøv godkjente turer separat
            await lastGodkjenteFraServer();
        }
    }

    async function lagreServerFil(fil, innhold) {
        // Rut godkjente-lister til DB-endepunkt (ovr_godkjente.php), andre til lagre.php
        let url, body;
        if (fil === FIL_ADR) { url = `${SERVER_BASE}/ovr_godkjente.php?action=skriv_adresser`; body = JSON.stringify(innhold); }
        else if (fil === FIL_KOM) { url = `${SERVER_BASE}/ovr_godkjente.php?action=skriv_kommune`; body = JSON.stringify(innhold); }
        else { url = `${SERVER_BASE}/lagre.php`; body = JSON.stringify({ fil: fil, innhold: innhold }); }
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data.ok) throw new Error(data.melding || data.feil || 'Ukjent feil');
    }

    async function lagreGHAdr(beskrivelse) {
        await lagreServerFil(FIL_ADR, { adresser: godkjenteAdresserGH, ord: godkjenteOrdGH, kanskje_postnr: godkjenteKanskjePostnrGH, grunner: godkjenteAdresseGrunnerGH, oppdatert: new Date().toISOString().slice(0,10) });
        lagreAdrILS();
        if (beskrivelse) {
            const handling = beskrivelse.startsWith('Fjern') ? 'FJERN_FRA_LISTE' : 'LEGG_TIL_LISTE';
            try { loggHandling(handling, { seksjon: 'adresse', grunn: beskrivelse }); } catch(e) {}
        }
    }

    async function lagreGHKom(beskrivelse) {
        await lagreServerFil(FIL_KOM, { ord: godkjenteKommuneOrdGH, adresser: godkjenteKommuneAdresserGH, sykehus_postnr: godkjenteSykehusPostnrGH, spesialist_kombi: godkjenteSpesialistKombiGH, rute_kombi: godkjenteRuteKombiGH, grunner: godkjenteGrunnerGH, oppdatert: new Date().toISOString().slice(0,10) });
        lagreKomILS();
        if (beskrivelse) {
            const handling = beskrivelse.startsWith('Fjern') ? 'FJERN_FRA_LISTE' : 'LEGG_TIL_LISTE';
            try { loggHandling(handling, { seksjon: 'kommune', grunn: beskrivelse }); } catch(e) {}
        }
    }

    async function lagreGodkjentAdresse(adresse, kortType, navn) {
        const ny = adresse.toLowerCase().trim();
        if (kortType === 'kommune') {
            if (godkjenteKommuneAdresserGH.some(a => hentAdrStreng(a) === ny)) return { ok: false, melding: 'Allerede i listen' };
            const pnrM = ny.match(/(\d{4})\s+(.+)$/);
            const gateM = ny.match(/^(.+?),?\s*\d{4}/);
            const obj = { adresse: ny, gate: gateM ? gateM[1].trim() : ny, postnr: pnrM ? pnrM[1] : '', poststed: pnrM ? pnrM[2].trim() : '', navn: (navn || '').trim() };
            godkjenteKommuneAdresserGH = [...godkjenteKommuneAdresserGH, obj];
            try { await lagreGHKom(`K-Adresse: ${navn ? navn + ' — ' : ''}${ny}`); return { ok: true, melding: 'Lagret!' }; }
            catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
        } else {
            if (godkjenteAdresserGH.some(a => hentAdrStreng(a) === ny)) return { ok: false, melding: 'Allerede i listen' };
            const obj = { adresse: ny, navn: (navn || '').trim(), godkjent: true };
            godkjenteAdresserGH = [...godkjenteAdresserGH, obj];
            try { await lagreGHAdr(`Adresse: ${navn ? navn + ' — ' : ''}${ny}`); return { ok: true, melding: 'Lagret!' }; }
            catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
        }
    }

    async function lagreGodkjentOrd(ord, kortType) {
        const ny = ord.toLowerCase().trim();
        if (kortType === 'kommune') {
            if (godkjenteKommuneOrdGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
            godkjenteKommuneOrdGH = [...godkjenteKommuneOrdGH, ny];
            try { await lagreGHKom(`K-Ord: ${ny}`); return { ok: true, melding: 'Lagret!' }; }
            catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
        } else {
            if (godkjenteOrdGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
            godkjenteOrdGH = [...godkjenteOrdGH, ny];
            try { await lagreGHAdr(`Ord: ${ny}`); return { ok: true, melding: 'Lagret!' }; }
            catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
        }
    }

    async function slettGodkjentAdresse(adresse, kortType) {
        try {
            if (kortType === 'kommune') { godkjenteKommuneAdresserGH = godkjenteKommuneAdresserGH.filter(a => a !== adresse); await lagreGHKom(`Fjern k-adresse: ${adresse}`); }
            else { godkjenteAdresserGH = godkjenteAdresserGH.filter(a => hentAdrStreng(a) !== adresse); await lagreGHAdr(`Fjern adresse: ${adresse}`); }
            return { ok: true };
        } catch (e) { return { ok: false, melding: e.message }; }
    }

    async function slettGodkjentOrd(ord, kortType) {
        try {
            if (kortType === 'kommune') { godkjenteKommuneOrdGH = godkjenteKommuneOrdGH.filter(o => o !== ord); await lagreGHKom(`Fjern k-ord: ${ord}`); }
            else { godkjenteOrdGH = godkjenteOrdGH.filter(o => o !== ord); await lagreGHAdr(`Fjern ord: ${ord}`); }
            return { ok: true };
        } catch (e) { return { ok: false, melding: e.message }; }
    }

    async function lagreGodkjentPostnr(postnr) {
        const ny = String(postnr).replace(/\s/g, '').padStart(4, '0');
        if (!/^\d{4}$/.test(ny)) return { ok: false, melding: 'Ugyldig postnummer (må være 4 siffer)' };
        if (godkjenteKanskjePostnrGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
        godkjenteKanskjePostnrGH = [...godkjenteKanskjePostnrGH, ny];
        try { await lagreGHAdr(`Postnr: ${ny}`); return { ok: true, melding: 'Lagret!' }; }
        catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
    }

    async function slettGodkjentPostnr(postnr) {
        try {
            godkjenteKanskjePostnrGH = godkjenteKanskjePostnrGH.filter(p => p !== postnr);
            await lagreGHAdr(`Fjern postnr: ${postnr}`);
            return { ok: true };
        } catch (e) { return { ok: false, melding: e.message }; }
    }

    // ── Sykehus-postnr (kommune kanskje) ──
    async function lagreSykehusPostnr(postnr) {
        const ny = String(postnr).replace(/\s/g, '').padStart(4, '0');
        if (!/^\d{4}$/.test(ny)) return { ok: false, melding: 'Ugyldig postnummer (4 siffer)' };
        if (godkjenteSykehusPostnrGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
        godkjenteSykehusPostnrGH = [...godkjenteSykehusPostnrGH, ny];
        try { await lagreGHKom(); return { ok: true, melding: 'Lagret!' }; }
        catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
    }
    async function slettSykehusPostnr(postnr) {
        try { godkjenteSykehusPostnrGH = godkjenteSykehusPostnrGH.filter(p => p !== postnr); await lagreGHKom(); return { ok: true }; }
        catch (e) { return { ok: false, melding: e.message }; }
    }

    // ── Spesialist-kombi (kommune avvik) ──
    async function lagreSpesialistKombi(ord, postnr) {
        const o = (ord || '').toLowerCase().trim();
        const p = String(postnr || '').replace(/\s/g, '').padStart(4, '0');
        if (!o) return { ok: false, melding: 'Mangler ord' };
        if (!/^\d{4}$/.test(p)) return { ok: false, melding: 'Ugyldig postnummer (4 siffer)' };
        if (godkjenteSpesialistKombiGH.some(k => k.ord === o && k.postnr === p)) return { ok: false, melding: 'Allerede i listen' };
        godkjenteSpesialistKombiGH = [...godkjenteSpesialistKombiGH, { ord: o, postnr: p }];
        try { await lagreGHKom(); return { ok: true, melding: 'Lagret!' }; }
        catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
    }
    async function slettSpesialistKombi(ord, postnr) {
        try { godkjenteSpesialistKombiGH = godkjenteSpesialistKombiGH.filter(k => !(k.ord === ord && k.postnr === postnr)); await lagreGHKom(); return { ok: true }; }
        catch (e) { return { ok: false, melding: e.message }; }
    }

    // ── Rute-kombi (kommune avvik) ──
    async function lagreRuteKombi(a, b) {
        const na = (a || '').toLowerCase().trim();
        const nb = (b || '').toLowerCase().trim();
        if (!na || !nb) return { ok: false, melding: 'Mangler sted A eller B' };
        if (godkjenteRuteKombiGH.some(k => (k.a === na && k.b === nb) || (k.a === nb && k.b === na))) return { ok: false, melding: 'Allerede i listen' };
        godkjenteRuteKombiGH = [...godkjenteRuteKombiGH, { a: na, b: nb }];
        try { await lagreGHKom(); return { ok: true, melding: 'Lagret!' }; }
        catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
    }
    async function slettRuteKombi(a, b) {
        try { godkjenteRuteKombiGH = godkjenteRuteKombiGH.filter(k => !(k.a === a && k.b === b)); await lagreGHKom(); return { ok: true }; }
        catch (e) { return { ok: false, melding: e.message }; }
    }

    // Gruppering av rfiltre for filterPanel
    const FILTER_GRUPPER = {
        dagens: [19249, 19250, 19261, 19251],
        morgen: [19259, 19260, 19262, 19263],
        tredager: [19275, 19276, 19277, 19278]
    };

    // godkjenteKanskjePostnrGH — nå i godkjente_adresser.json (godkjenteKanskjePostnrGH)

    const ADMIN_BASE = 'https://pastrans-sorost.mq.nhn.no/administrasjon/admin';
    let adminTilgjengelig = false;

    async function sjekkAdminLogin() {
        try {
            const res = await fetch(`${ADMIN_BASE}/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (res.status === 401 || res.status === 403) {
                console.warn('[ADMIN] Ikke logget inn (HTTP ' + res.status + ')');
                return false;
            }
            const html = await res.text();
            // Sjekk om responsen er en login-side (redirect til innlogging)
            // Unngå false positive på "logout"-lenker o.l.
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                console.warn('[ADMIN] Ikke logget inn (login-side detektert)');
                return false;
            }
            console.log('[ADMIN] Innlogget OK');
            return true;
        } catch (e) {
            console.warn('[ADMIN] Kunne ikke sjekke:', e.message);
            return false;
        }
    }

    // Retry-wrapper: prøver sjekkAdminLogin opptil maxForsok ganger med pause
    async function sjekkAdminLoginMedRetry(maxForsok = 3, pauseMs = 2000) {
        for (let i = 1; i <= maxForsok; i++) {
            const ok = await sjekkAdminLogin();
            if (ok) return true;
            if (i < maxForsok) {
                console.log(`[ADMIN] Forsøk ${i}/${maxForsok} feilet, prøver igjen om ${pauseMs/1000}s...`);
                await new Promise(r => setTimeout(r, pauseMs));
            } else {
                console.warn(`[ADMIN] Alle ${maxForsok} forsøk feilet`);
            }
        }
        return false;
    }

    // Re-sjekk admin før skanning dersom den var false ved oppstart
    async function sikreAdminTilgang() {
        if (adminTilgjengelig) return true;
        console.log('[ADMIN] Re-sjekker admin-tilgang...');
        adminTilgjengelig = await sjekkAdminLogin();
        if (adminTilgjengelig) {
            console.log('[ADMIN] Admin ble tilgjengelig ved re-sjekk!');
            // Fjern evt. advarsel i heartbeatBar
            const win = window.mqWin;
            if (win && !win.closed) {
                const hb = win.document.getElementById('heartbeatBar');
                if (hb && hb.textContent.includes('admin')) {
                    hb.classList.remove('show');
                }
            }
        }
        return adminTilgjengelig;
    }

    // ==================================================================
    //    FILTERVALG (checkboxes -- skann alle valgte i loop)
    // ==================================================================
    const nissySelect = document.querySelector('select[name="filter-ventende-oppdrag"]');
    const RFILTER_VALG = CONFIG.RFILTER_IDS.map(id => {
        const opt = nissySelect ? Array.from(nissySelect.options).find(o => +o.value === id) : null;
        return { id, navn: opt ? opt.textContent.trim() : String(id) };
    });
    // Ukedag-baserte filter-defaults: fredag=3dager på + morgen av, ellers morgen på + 3dager av
    function hentDagFiltre() {
        const dag = new Date().getDay(); // 0=søn, 5=fre
        const erFredag = dag === 5;
        const base = [...FILTER_GRUPPER.dagens];
        if (erFredag) {
            // Fredag: dagens + 3 dager, ikke morgen
            return new Set([...base, ...FILTER_GRUPPER.tredager]);
        } else {
            // Man-tor: dagens + morgen, ikke 3 dager
            return new Set([...base, ...FILTER_GRUPPER.morgen]);
        }
    }

    // Sjekk om vi er på en ny dag — reset filtre automatisk
    const iDag = new Date().toISOString().slice(0, 10);
    const lagretFilterDag = localStorage.getItem('overvaker_avvik_filtre_dag');
    const lagretFiltre = localStorage.getItem('overvaker_avvik_filtre');
    let aktiveFiltre;
    if (lagretFilterDag !== iDag) {
        // Ny dag — sett ukedag-defaults
        aktiveFiltre = hentDagFiltre();
        localStorage.setItem('overvaker_avvik_filtre', JSON.stringify([...aktiveFiltre]));
        localStorage.setItem('overvaker_avvik_filtre_dag', iDag);
    } else if (lagretFiltre) {
        try {
            const parsed = JSON.parse(lagretFiltre);
            if (Array.isArray(parsed) && parsed.length > 0) aktiveFiltre = new Set(parsed);
            else aktiveFiltre = hentDagFiltre();
        } catch (e) { aktiveFiltre = hentDagFiltre(); }
    } else {
        aktiveFiltre = hentDagFiltre();
    }

    // ==================================================================
    //    GODKJENTE ADRESSEORD                                          
    // ==================================================================
    // godkjenteOrdGH — nå i godkjente_adresser.json (godkjenteOrdGH)

    // ==================================================================
    //    GODKJENTE ADRESSER                                            
    // ==================================================================
    // GODKJENTE_ADRESSER — nå i godkjente_adresser.json (godkjenteAdresserGH)

    // ==================================================================
    //    POSTNUMMER -> KOMMUNE (fra Bring postnummerregister)
    //    962 postnumre, 24 kommuner -- dekker filter 0000-1499, 1900-2265
    // ==================================================================
    const POSTNR_TIL_KOMMUNE = {
        '0001':'Oslo','0010':'Oslo','0015':'Oslo','0018':'Oslo','0021':'Oslo','0024':'Oslo','0026':'Oslo','0028':'Oslo','0030':'Oslo','0032':'Oslo','0033':'Oslo','0034':'Oslo','0037':'Oslo','0040':'Oslo','0045':'Oslo','0046':'Oslo','0047':'Oslo','0048':'Oslo','0050':'Oslo','0055':'Oslo','0101':'Oslo','0102':'Oslo','0103':'Oslo','0104':'Oslo','0105':'Oslo','0106':'Oslo','0107':'Oslo','0109':'Oslo','0110':'Oslo','0111':'Oslo','0112':'Oslo','0113':'Oslo','0114':'Oslo','0115':'Oslo','0116':'Oslo','0117':'Oslo','0118':'Oslo','0119':'Oslo','0120':'Oslo','0121':'Oslo','0122':'Oslo','0123':'Oslo','0124':'Oslo','0125':'Oslo','0129':'Oslo','0130':'Oslo','0131':'Oslo','0132':'Oslo','0133':'Oslo','0134':'Oslo','0135':'Oslo','0136':'Oslo','0138':'Oslo','0139':'Oslo','0140':'Oslo','0150':'Oslo','0151':'Oslo','0152':'Oslo','0153':'Oslo','0154':'Oslo','0155':'Oslo','0157':'Oslo','0158':'Oslo','0159':'Oslo','0160':'Oslo','0161':'Oslo','0162':'Oslo','0164':'Oslo','0165':'Oslo','0166':'Oslo','0167':'Oslo','0168':'Oslo','0169':'Oslo','0170':'Oslo','0171':'Oslo','0172':'Oslo','0173':'Oslo','0174':'Oslo','0175':'Oslo','0176':'Oslo','0177':'Oslo','0178':'Oslo','0179':'Oslo','0180':'Oslo','0181':'Oslo','0182':'Oslo','0183':'Oslo','0184':'Oslo','0185':'Oslo','0186':'Oslo','0187':'Oslo','0188':'Oslo','0190':'Oslo','0191':'Oslo','0192':'Oslo','0193':'Oslo','0194':'Oslo','0195':'Oslo','0196':'Oslo','0198':'Oslo','0201':'Oslo','0202':'Oslo','0203':'Oslo','0204':'Oslo','0207':'Oslo','0208':'Oslo','0211':'Oslo','0212':'Oslo','0213':'Oslo','0214':'Oslo','0215':'Oslo','0216':'Oslo','0217':'Oslo','0218':'Oslo','0230':'Oslo','0240':'Oslo','0244':'Oslo','0247':'Oslo','0250':'Oslo','0251':'Oslo','0252':'Oslo','0253':'Oslo','0254':'Oslo','0255':'Oslo','0256':'Oslo','0257':'Oslo','0258':'Oslo','0259':'Oslo','0260':'Oslo','0262':'Oslo','0263':'Oslo','0264':'Oslo','0265':'Oslo','0266':'Oslo','0267':'Oslo','0268':'Oslo','0270':'Oslo','0271':'Oslo','0272':'Oslo','0273':'Oslo','0274':'Oslo','0275':'Oslo','0276':'Oslo','0277':'Oslo','0278':'Oslo','0279':'Oslo','0280':'Oslo','0281':'Oslo','0282':'Oslo','0283':'Oslo','0284':'Oslo','0286':'Oslo','0287':'Oslo','0301':'Oslo','0302':'Oslo','0303':'Oslo','0304':'Oslo','0305':'Oslo','0306':'Oslo','0307':'Oslo','0308':'Oslo','0309':'Oslo','0311':'Oslo','0313':'Oslo','0314':'Oslo','0315':'Oslo','0316':'Oslo','0317':'Oslo','0318':'Oslo','0319':'Oslo','0323':'Oslo','0330':'Oslo','0340':'Oslo','0349':'Oslo','0350':'Oslo','0351':'Oslo','0352':'Oslo','0353':'Oslo','0354':'Oslo','0355':'Oslo','0356':'Oslo','0357':'Oslo','0358':'Oslo','0359':'Oslo','0360':'Oslo','0361':'Oslo','0362':'Oslo','0363':'Oslo','0364':'Oslo','0365':'Oslo','0366':'Oslo','0367':'Oslo','0368':'Oslo','0369':'Oslo','0370':'Oslo','0371':'Oslo','0372':'Oslo','0373':'Oslo','0374':'Oslo','0375':'Oslo','0376':'Oslo','0377':'Oslo','0378':'Oslo','0379':'Oslo','0380':'Oslo','0381':'Oslo','0382':'Oslo','0383':'Oslo','0401':'Oslo','0402':'Oslo','0403':'Oslo','0404':'Oslo','0405':'Oslo','0406':'Oslo','0409':'Oslo','0410':'Oslo','0411':'Oslo','0412':'Oslo','0413':'Oslo','0415':'Oslo','0421':'Oslo','0422':'Oslo','0423':'Oslo','0424':'Oslo','0440':'Oslo','0441':'Oslo','0442':'Oslo','0445':'Oslo','0450':'Oslo','0451':'Oslo','0452':'Oslo','0454':'Oslo','0455':'Oslo','0456':'Oslo','0457':'Oslo','0458':'Oslo','0459':'Oslo','0460':'Oslo','0461':'Oslo','0462':'Oslo','0463':'Oslo','0464':'Oslo','0465':'Oslo','0467':'Oslo','0468':'Oslo','0469':'Oslo','0470':'Oslo','0472':'Oslo','0473':'Oslo','0474':'Oslo','0475':'Oslo','0476':'Oslo','0477':'Oslo','0478':'Oslo','0479':'Oslo','0480':'Oslo','0481':'Oslo','0482':'Oslo','0483':'Oslo','0484':'Oslo','0485':'Oslo','0486':'Oslo','0487':'Oslo','0488':'Oslo','0489':'Oslo','0490':'Oslo','0491':'Oslo','0492':'Oslo','0493':'Oslo','0494':'Oslo','0495':'Oslo','0496':'Oslo','0501':'Oslo','0502':'Oslo','0503':'Oslo','0504':'Oslo','0505':'Oslo','0506':'Oslo','0507':'Oslo','0508':'Oslo','0509':'Oslo','0510':'Oslo','0511':'Oslo','0512':'Oslo','0513':'Oslo','0515':'Oslo','0516':'Oslo','0517':'Oslo','0518':'Oslo','0520':'Oslo','0540':'Oslo','0550':'Oslo','0551':'Oslo','0552':'Oslo','0553':'Oslo','0554':'Oslo','0555':'Oslo','0556':'Oslo','0557':'Oslo','0558':'Oslo','0559':'Oslo','0560':'Oslo','0561':'Oslo','0562':'Oslo','0563':'Oslo','0564':'Oslo','0565':'Oslo','0566':'Oslo','0567':'Oslo','0568':'Oslo','0569':'Oslo','0570':'Oslo','0571':'Oslo','0572':'Oslo','0573':'Oslo','0574':'Oslo','0575':'Oslo','0576':'Oslo','0577':'Oslo','0578':'Oslo','0579':'Oslo','0580':'Oslo','0581':'Oslo','0582':'Oslo','0583':'Oslo','0584':'Oslo','0585':'Oslo','0586':'Oslo','0587':'Oslo','0588':'Oslo','0589':'Oslo','0590':'Oslo','0591':'Oslo','0592':'Oslo','0593':'Oslo','0594':'Oslo','0595':'Oslo','0596':'Oslo','0597':'Oslo','0598':'Oslo','0601':'Oslo','0602':'Oslo','0603':'Oslo','0604':'Oslo','0605':'Oslo','0606':'Oslo','0607':'Oslo','0608':'Oslo','0609':'Oslo','0611':'Oslo','0612':'Oslo','0613':'Oslo','0614':'Oslo','0615':'Oslo','0616':'Oslo','0617':'Oslo','0618':'Oslo','0619':'Oslo','0620':'Oslo','0621':'Oslo','0622':'Oslo','0623':'Oslo','0624':'Oslo','0626':'Oslo','0650':'Oslo','0651':'Oslo','0652':'Oslo','0653':'Oslo','0654':'Oslo','0655':'Oslo','0656':'Oslo','0657':'Oslo','0658':'Oslo','0659':'Oslo','0660':'Oslo','0661':'Oslo','0662':'Oslo','0663':'Oslo','0664':'Oslo','0665':'Oslo','0666':'Oslo','0667':'Oslo','0668':'Oslo','0669':'Oslo','0670':'Oslo','0671':'Oslo','0672':'Oslo','0673':'Oslo','0674':'Oslo','0675':'Oslo','0676':'Oslo','0677':'Oslo','0678':'Oslo','0679':'Oslo','0680':'Oslo','0681':'Oslo','0682':'Oslo','0683':'Oslo','0684':'Oslo','0685':'Oslo','0686':'Oslo','0687':'Oslo','0688':'Oslo','0689':'Oslo','0690':'Oslo','0691':'Oslo','0692':'Oslo','0693':'Oslo','0694':'Oslo','0701':'Oslo','0702':'Oslo','0705':'Oslo','0710':'Oslo','0712':'Oslo','0750':'Oslo','0751':'Oslo','0752':'Oslo','0753':'Oslo','0754':'Oslo','0755':'Oslo','0756':'Oslo','0757':'Oslo','0758':'Oslo','0760':'Oslo','0763':'Oslo','0764':'Oslo','0765':'Oslo','0766':'Oslo','0767':'Oslo','0768':'Oslo','0770':'Oslo','0771':'Oslo','0772':'Oslo','0773':'Oslo','0774':'Oslo','0775':'Oslo','0776':'Oslo','0777':'Oslo','0778':'Oslo','0779':'Oslo','0781':'Oslo','0782':'Oslo','0783':'Oslo','0784':'Oslo','0785':'Oslo','0786':'Oslo','0787':'Oslo','0788':'Oslo','0789':'Oslo','0790':'Oslo','0791':'Oslo','0801':'Oslo','0805':'Oslo','0806':'Oslo','0807':'Oslo','0840':'Oslo','0850':'Oslo','0851':'Oslo','0852':'Oslo','0853':'Oslo','0854':'Oslo','0855':'Oslo','0856':'Oslo','0857':'Oslo','0858':'Oslo','0860':'Oslo','0861':'Oslo','0862':'Oslo','0863':'Oslo','0864':'Oslo','0870':'Oslo','0871':'Oslo','0872':'Oslo','0873':'Oslo','0874':'Oslo','0875':'Oslo','0876':'Oslo','0877':'Oslo','0880':'Oslo','0881':'Oslo','0882':'Oslo','0883':'Oslo','0884':'Oslo','0890':'Oslo','0891':'Oslo','0901':'Oslo','0902':'Oslo','0903':'Oslo','0904':'Oslo','0905':'Oslo','0907':'Oslo','0908':'Oslo','0913':'Oslo','0914':'Oslo','0915':'Oslo','0950':'Oslo','0951':'Oslo','0952':'Oslo','0953':'Oslo','0954':'Oslo','0955':'Oslo','0956':'Oslo','0957':'Oslo','0958':'Oslo','0959':'Oslo','0960':'Oslo','0962':'Oslo','0963':'Oslo','0964':'Oslo','0968':'Oslo','0969':'Oslo','0970':'Oslo','0971':'Oslo','0972':'Oslo','0973':'Oslo','0975':'Oslo','0976':'Oslo','0977':'Oslo','0978':'Oslo','0979':'Oslo','0980':'Oslo','0981':'Oslo','0982':'Oslo','0983':'Oslo','0984':'Oslo','0985':'Oslo','0986':'Oslo','0987':'Oslo','0988':'Oslo','1001':'Oslo','1003':'Oslo','1005':'Oslo','1006':'Oslo','1007':'Oslo','1008':'Oslo','1009':'Oslo','1011':'Oslo','1051':'Oslo','1052':'Oslo','1053':'Oslo','1054':'Oslo','1055':'Oslo','1056':'Oslo','1061':'Oslo','1062':'Oslo','1063':'Oslo','1064':'Oslo','1065':'Oslo','1067':'Oslo','1068':'Oslo','1069':'Oslo','1071':'Oslo','1081':'Oslo','1083':'Oslo','1084':'Oslo','1086':'Oslo','1087':'Oslo','1088':'Oslo','1089':'Oslo','1101':'Oslo','1102':'Oslo','1108':'Oslo','1109':'Oslo','1112':'Oslo','1150':'Oslo','1151':'Oslo','1152':'Oslo','1153':'Oslo','1154':'Oslo','1155':'Oslo','1156':'Oslo','1157':'Oslo','1158':'Oslo','1160':'Oslo','1161':'Oslo','1162':'Oslo','1163':'Oslo','1164':'Oslo','1165':'Oslo','1166':'Oslo','1167':'Oslo','1168':'Oslo','1169':'Oslo','1170':'Oslo','1172':'Oslo','1176':'Oslo','1177':'Oslo','1178':'Oslo','1179':'Oslo','1181':'Oslo','1182':'Oslo','1184':'Oslo','1185':'Oslo','1187':'Oslo','1188':'Oslo','1189':'Oslo','1201':'Oslo','1203':'Oslo','1204':'Oslo','1205':'Oslo','1207':'Oslo','1214':'Oslo','1215':'Oslo','1250':'Oslo','1251':'Oslo','1252':'Oslo','1253':'Oslo','1254':'Oslo','1255':'Oslo','1256':'Oslo','1257':'Oslo','1258':'Oslo','1259':'Oslo','1262':'Oslo','1263':'Oslo','1266':'Oslo','1270':'Oslo','1271':'Oslo','1272':'Oslo','1273':'Oslo','1274':'Oslo','1275':'Oslo','1278':'Oslo','1279':'Oslo','1281':'Oslo','1283':'Oslo','1284':'Oslo','1285':'Oslo','1286':'Oslo','1290':'Oslo','1291':'Oslo','1294':'Oslo','1295':'Oslo',
        '1300':'Bærum','1301':'Bærum','1302':'Bærum','1303':'Bærum','1304':'Bærum','1305':'Bærum','1306':'Bærum','1307':'Bærum','1308':'Bærum','1309':'Bærum','1311':'Bærum','1312':'Bærum','1313':'Bærum','1314':'Bærum','1316':'Bærum','1317':'Bærum','1318':'Bærum','1319':'Bærum','1321':'Bærum','1322':'Bærum','1323':'Bærum','1324':'Bærum','1325':'Bærum','1326':'Bærum','1327':'Bærum','1328':'Bærum','1329':'Bærum','1330':'Bærum','1331':'Bærum','1332':'Bærum','1333':'Bærum','1334':'Bærum','1335':'Bærum','1336':'Bærum','1337':'Bærum','1338':'Bærum','1339':'Bærum','1340':'Bærum','1341':'Bærum','1342':'Bærum','1344':'Bærum','1346':'Bærum','1348':'Bærum','1349':'Bærum','1350':'Bærum','1351':'Bærum','1352':'Bærum','1353':'Bærum','1354':'Bærum','1356':'Bærum','1357':'Bærum','1358':'Bærum','1359':'Bærum','1360':'Bærum','1361':'Bærum','1362':'Bærum','1363':'Bærum','1364':'Bærum','1365':'Bærum','1366':'Bærum','1367':'Bærum','1368':'Bærum','1369':'Bærum',
        '1371':'Asker','1372':'Asker','1373':'Asker','1375':'Asker','1376':'Asker','1377':'Asker','1378':'Asker','1379':'Asker','1380':'Asker','1381':'Asker','1383':'Asker','1384':'Asker','1385':'Asker','1386':'Asker','1387':'Asker','1388':'Asker','1389':'Asker','1390':'Asker','1391':'Asker','1392':'Asker','1393':'Asker','1394':'Asker','1395':'Asker','1396':'Asker','1397':'Asker','1399':'Asker',
        '1400':'Nordre Follo','1401':'Nordre Follo','1402':'Nordre Follo','1403':'Nordre Follo','1404':'Nordre Follo','1405':'Nordre Follo','1406':'Nordre Follo',
        '1407':'Ås',
        '1408':'Nordre Follo','1409':'Nordre Follo','1410':'Nordre Follo','1411':'Nordre Follo','1412':'Nordre Follo','1413':'Nordre Follo','1414':'Nordre Follo','1415':'Nordre Follo','1416':'Nordre Follo','1417':'Nordre Follo','1418':'Nordre Follo','1419':'Nordre Follo','1420':'Nordre Follo','1421':'Nordre Follo','1422':'Nordre Follo','1423':'Nordre Follo','1424':'Nordre Follo','1425':'Nordre Follo',
        '1429':'Ås','1430':'Ås','1431':'Ås','1432':'Ås','1433':'Ås','1434':'Ås','1435':'Ås',
        '1440':'Frogn','1441':'Frogn','1442':'Frogn','1443':'Frogn','1444':'Frogn','1445':'Frogn','1446':'Frogn','1447':'Frogn','1448':'Frogn','1449':'Frogn',
        '1450':'Nesodden','1451':'Nesodden','1452':'Nesodden','1453':'Nesodden','1454':'Nesodden',
        '1455':'Frogn',
        '1456':'Nesodden','1457':'Nesodden','1458':'Nesodden','1459':'Nesodden',
        '1461':'Lørenskog','1462':'Lørenskog','1463':'Lørenskog','1464':'Lørenskog',
        '1465':'Lillestrøm','1466':'Lillestrøm','1467':'Lillestrøm',
        '1468':'Lørenskog','1469':'Lørenskog','1470':'Lørenskog','1471':'Lørenskog','1472':'Lørenskog','1473':'Lørenskog','1474':'Lørenskog','1475':'Lørenskog','1476':'Lørenskog','1477':'Lørenskog','1478':'Lørenskog','1479':'Lørenskog',
        '1480':'Nittedal','1481':'Nittedal','1482':'Nittedal','1483':'Nittedal','1484':'Nittedal','1485':'Nittedal','1486':'Nittedal','1487':'Nittedal','1488':'Nittedal',
        '1900':'Lillestrøm','1901':'Lillestrøm','1903':'Lillestrøm','1910':'Lillestrøm',
        '1911':'Enebakk','1912':'Enebakk','1914':'Enebakk','1916':'Enebakk','1917':'Enebakk',
        '1920':'Lillestrøm','1921':'Lillestrøm','1923':'Lillestrøm','1924':'Lillestrøm','1925':'Lillestrøm','1926':'Lillestrøm',
        '1927':'Nes','1928':'Nes','1929':'Nes',
        '1930':'Aurskog-Høland','1931':'Aurskog-Høland','1940':'Aurskog-Høland','1941':'Aurskog-Høland','1950':'Aurskog-Høland','1951':'Aurskog-Høland','1954':'Aurskog-Høland','1960':'Aurskog-Høland','1961':'Aurskog-Høland','1963':'Aurskog-Høland','1970':'Aurskog-Høland','1971':'Aurskog-Høland',
        '2000':'Lillestrøm','2001':'Lillestrøm','2003':'Lillestrøm','2004':'Lillestrøm',
        '2005':'Rælingen','2006':'Rælingen',
        '2007':'Lillestrøm',
        '2008':'Rælingen','2009':'Rælingen',
        '2010':'Lillestrøm','2011':'Lillestrøm','2012':'Lillestrøm','2013':'Lillestrøm',
        '2014':'Rælingen',
        '2015':'Lillestrøm','2016':'Lillestrøm','2017':'Lillestrøm',
        '2018':'Rælingen',
        '2019':'Lillestrøm','2020':'Lillestrøm','2021':'Lillestrøm',
        '2022':'Gjerdrum',
        '2023':'Lillestrøm',
        '2024':'Gjerdrum',
        '2025':'Rælingen',
        '2026':'Lillestrøm','2027':'Lillestrøm','2028':'Lillestrøm',
        '2029':'Rælingen',
        '2030':'Nannestad','2031':'Nannestad','2032':'Nannestad','2033':'Nannestad','2034':'Nannestad','2035':'Nannestad','2036':'Nannestad',
        '2040':'Ullensaker','2041':'Ullensaker','2050':'Ullensaker','2051':'Ullensaker','2052':'Ullensaker','2053':'Ullensaker','2054':'Ullensaker','2055':'Ullensaker','2056':'Ullensaker','2057':'Ullensaker','2058':'Ullensaker','2060':'Ullensaker','2061':'Ullensaker','2062':'Ullensaker','2063':'Ullensaker','2066':'Ullensaker','2067':'Ullensaker','2068':'Ullensaker','2069':'Ullensaker',
        '2070':'Eidsvoll','2071':'Eidsvoll','2072':'Eidsvoll','2073':'Eidsvoll','2074':'Eidsvoll','2076':'Eidsvoll','2080':'Eidsvoll','2081':'Eidsvoll',
        '2090':'Hurdal','2091':'Hurdal',
        '2092':'Eidsvoll','2093':'Eidsvoll','2094':'Eidsvoll',
        '2100':'Sør-Odal','2101':'Sør-Odal','2110':'Sør-Odal','2114':'Sør-Odal','2116':'Sør-Odal',
        '2120':'Nord-Odal','2121':'Nord-Odal','2123':'Nord-Odal','2130':'Nord-Odal','2132':'Nord-Odal','2133':'Nord-Odal','2134':'Nord-Odal',
        '2150':'Nes','2151':'Nes','2160':'Nes','2161':'Nes','2162':'Nes','2163':'Nes','2164':'Nes','2165':'Nes','2166':'Nes','2167':'Nes','2170':'Nes',
        '2201':'Kongsvinger','2202':'Kongsvinger','2203':'Kongsvinger','2204':'Kongsvinger','2205':'Kongsvinger','2206':'Kongsvinger','2207':'Kongsvinger','2208':'Kongsvinger','2209':'Kongsvinger','2210':'Kongsvinger','2211':'Kongsvinger','2212':'Kongsvinger','2213':'Kongsvinger','2214':'Kongsvinger','2215':'Kongsvinger','2216':'Kongsvinger','2217':'Kongsvinger','2218':'Kongsvinger','2219':'Kongsvinger',
        '2220':'Eidskog',
        '2223':'Sør-Odal',
        '2224':'Kongsvinger','2225':'Kongsvinger','2226':'Kongsvinger','2227':'Kongsvinger',
        '2230':'Eidskog','2231':'Eidskog','2232':'Eidskog','2233':'Eidskog','2235':'Eidskog','2240':'Eidskog','2241':'Eidskog',
        '2251':'Grue','2256':'Grue','2260':'Grue','2261':'Grue','2264':'Grue','2265':'Grue'
    };

    function hentKommune(postnr) {
        if (!postnr) return null;
        const n = String(postnr).replace(/\s/g, '').padStart(4, '0');
        return POSTNR_TIL_KOMMUNE[n] || null;
    }

    // Kommune-API: oppslag for automatisk verifisering (med localStorage-cache)
    const LS_KOMMUNE_CACHE = 'mq_kommuneApiCache';
    const KOMMUNE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    let _kommuneCacheObj = {};
    try { const r = localStorage.getItem(LS_KOMMUNE_CACHE); if (r) { const p = JSON.parse(r); const n = Date.now(); for (const k in p) { if (p[k].ts && (n - p[k].ts) < KOMMUNE_CACHE_TTL) _kommuneCacheObj[k] = p[k]; } } } catch(e) {}

    function _lagreKommuneCache() { try { localStorage.setItem(LS_KOMMUNE_CACHE, JSON.stringify(_kommuneCacheObj)); } catch(e) {} }

    async function hentKommuneFraApi(adresseTekst) {
        if (!adresseTekst) return null;
        // Rens adresse: fjern bolignummer (H0101, L0201, U0101), komma, HTML-tags, ekstra whitespace
        const renset = adresseTekst.replace(/<[^>]*>/g, ' ').replace(/,/g, ' ').replace(/\b[HLU]\d{4}\b/gi, '').replace(/\s+/g, ' ').trim();
        if (!renset) return null;
        const key = renset.toLowerCase();
        if (_kommuneCacheObj[key]) return _kommuneCacheObj[key].data;
        try {
            const res = await fetch(`${SERVER_BASE}/kommune.php?adr=${encodeURIComponent(renset)}`);
            const data = await res.json();
            const resultat = data.ok ? { kommune: data.kommune, postnr: data.postnr, adresse: data.adresse } : null;
            _kommuneCacheObj[key] = { data: resultat, ts: Date.now() };
            _lagreKommuneCache();
            return resultat;
        } catch (e) {
            return null;
        }
    }

    // ==================================================================
    //    HJELPEFUNKSJONER
    // ==================================================================

    function beregnAlder(pnr) {
        if (!pnr || pnr.length < 11) return null;
        const d = parseInt(pnr.substring(0, 2));
        const m = parseInt(pnr.substring(2, 4));
        const yy = parseInt(pnr.substring(4, 6));
        const ind = parseInt(pnr.substring(6, 9));
        let yyyy;
        if (ind < 500) yyyy = 1900 + yy;
        else if (ind < 750 && yy >= 54) yyyy = 1800 + yy;
        else if (ind >= 500 && ind < 1000 && yy < 40) yyyy = 2000 + yy;
        else if (yy <= 24) yyyy = 2000 + yy;
        else yyyy = 1900 + yy;
        const dag = d > 40 ? d - 40 : d;
        const fodt = new Date(yyyy, m - 1, dag);
        const idag = new Date();
        let alder = idag.getFullYear() - fodt.getFullYear();
        if (idag.getMonth() < fodt.getMonth() ||
            (idag.getMonth() === fodt.getMonth() && idag.getDate() < fodt.getDate())) alder--;
        return alder;
    }

    function parseTidMinutter(str) {
        if (!str) return null;
        const m = str.match(/(\d{1,2}):(\d{2})/);
        return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
    }

    // Parse dato+tid til timestamp (ms). Håndterer "26.03 08:30", "26.03.2026 08:30" og "08:30"
    function parseTidMs(str) {
        if (!str) return null;
        const datoTid = str.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?\s+(\d{1,2}):(\d{2})/);
        if (datoTid) {
            const dag = parseInt(datoTid[1]), mnd = parseInt(datoTid[2]) - 1;
            let aar = datoTid[3] ? parseInt(datoTid[3]) : new Date().getFullYear();
            if (aar < 100) aar += 2000;
            return new Date(aar, mnd, dag, parseInt(datoTid[4]), parseInt(datoTid[5])).getTime();
        }
        // Fallback: bare tid → bruk dagens dato
        const tid = str.match(/(\d{1,2}):(\d{2})/);
        if (tid) {
            const n = new Date();
            return new Date(n.getFullYear(), n.getMonth(), n.getDate(), parseInt(tid[1]), parseInt(tid[2])).getTime();
        }
        return null;
    }

    function hentGateForSjekk(html) {
        if (!html) return '';
        let clean = html.replace(/<\/div>/gi, '<br>').split(/<br\s*\/?>/i)
            .flatMap(s => s.split(','))
            .map(s => s.replace(/<[^>]*>/g, '').trim())
            .filter(s => s.length > 0);
        if (clean.length === 0) return '';
        let gate = clean.find(s => /\d+[a-zA-ZæøåÆØÅ]|gate|vei|plass|alle|veien|veg|sgate|svei/i.test(s));
        if (!gate) gate = clean[0];
        return (gate || '').toUpperCase().replace(/[HU]\d{4}/g, '').trim();
    }

    function hentGateFraTekst(tekst) {
        if (!tekst) return '';
        let clean = tekst.split(/[,\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        if (clean.length === 0) return '';
        let gate = clean.find(s => /\d+[a-zA-ZæøåÆØÅ]|gate|vei|plass|alle|veien|veg|sgate|svei/i.test(s));
        if (!gate) gate = clean[0];
        return (gate || '').toUpperCase().replace(/[HU]\d{4}/g, '').replace(/\b\d{4}\s+[A-ZÆØÅ].*/g, '').trim();
    }

    function formaterForVisning(html) {
        if (!html) return '---';
        return html.replace(/<\/div>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/[HU]\d{4}/g, '').trim();
    }

    function hentPostnr(tekst) {
        if (!tekst) return null;
        const m = tekst.match(/\b(\d{4})\s+[A-Za-zÆØÅæøå]/);
        return m ? m[1] : null;
    }

    // Hent rekvisisjonsplakat (lett, samme NISSY-sesjon, ingen admin-innlogging)
    // Brukes for å sjekke meldingsfelt uten å laste full admin-side
    async function hentRekvisisjonsPlakat(reqId) {
        try {
            const url = `ajax-dispatch?update=false&action=showreq&rid=${reqId}`;
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) return null;
            // Plakaten er Latin-1/Windows-1252 — bruk TextDecoder for korrekt Å/Ø/Æ
            const buffer = await res.arrayBuffer();
            const html = new TextDecoder('windows-1252').decode(buffer);

            // Melding til pasientreisekontoret
            const meldMatch = html.match(/[Mm]elding[^<]*[Pp]asient[Rr]eise[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i)
                || html.match(/[Pp]asientreise[^<]*<\/th>\s*<td[^>]*>\s*([^<]*)/i)
                || html.match(/til pasientreise[^<]*<\/[^>]+>\s*([^<]+)/i);
            const meldPasReise = meldMatch ? meldMatch[1].trim() : '';

            // Melding til transport
            const transMatch = html.match(/[Mm]elding[^<]*[Tt]ransport[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const meldTransport = transMatch ? transMatch[1].trim() : '';

            console.log(`[PLAKAT] reqId=${reqId} meldPasReise="${meldPasReise.substring(0,60)}"`);
            return { meldPasReise, meldTransport, html };
        } catch (e) {
            console.warn(`[PLAKAT] Feil for reqId=${reqId}:`, e.message);
            return null;
        }
    }

    // PNR-cache for editPatient-oppslag — in-memory (sesjon) + localStorage (på tvers av lasting)
    // localStorage-format: { [pnr]: { turDato: "YYYY-MM-DD", data: { altAdresser, godkjentAvvik } } }
    // Oppføringer med turDato < i dag ryddes automatisk ved oppstart.
    const LS_ALT_ADR_CACHE = 'ovr_alt_adr_cache';
    const _altAdrCache = {};       // in-memory (PNR → resultat)
    let _altAdrLsData = {};        // speil av localStorage (PNR → { turDato, data })
    try {
        const raw = localStorage.getItem(LS_ALT_ADR_CACHE);
        if (raw) {
            const lagret = JSON.parse(raw);
            let ryddet = false;
            for (const [pnr, entry] of Object.entries(lagret)) {
                if (entry.turDato && entry.turDato >= _iDagStr) {
                    _altAdrCache[pnr] = entry.data;
                    _altAdrLsData[pnr] = entry;
                } else {
                    ryddet = true;
                }
            }
            if (ryddet) {
                localStorage.setItem(LS_ALT_ADR_CACHE, JSON.stringify(_altAdrLsData));
                console.log('[ALT_ADR-CACHE] Ryddet oppføringer eldre enn ' + _iDagStr);
            }
            const antall = Object.keys(_altAdrLsData).length;
            if (antall > 0) console.log(`[ALT_ADR-CACHE] Lastet ${antall} PNR fra localStorage`);
        }
    } catch(e) {}
    function lagreAltAdrCache(pnr, resultat, turDatoISO) {
        if (!pnr || !resultat) return;
        const dato = turDatoISO || _iDagStr;
        _altAdrCache[pnr] = resultat;
        _altAdrLsData[pnr] = { turDato: dato, data: resultat };
        try { localStorage.setItem(LS_ALT_ADR_CACHE, JSON.stringify(_altAdrLsData)); } catch(e) {}
    }

    // Hent alternative adresser for pasient fra /administrasjon/admin/editPatient
    // turDatoISO brukes som cache-nøkkel — oppføringer med turDato < i dag slettes
    async function hentPasientAdresser(pnr, turDatoISO) {
        if (!pnr) return null;
        if (_altAdrCache[pnr]) return _altAdrCache[pnr];
        try {
            const url = `/administrasjon/admin/editPatient?hasPaperRequisitionCheckboxChanged=false&isPostcodeToChangedFromGab=false&isNewPatient=false&isPostcodeFromChangedFromGab=false&ssn=${pnr}`;
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) return null;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const iDag = new Date();
            const altAdresser = [];
            doc.querySelectorAll('input[name="default"]').forEach(radio => {
                if (radio.value === 'ssn') return;
                const td = radio.closest('tr')?.querySelectorAll('td')[1];
                if (!td) return;
                let tekst = td.textContent.replace(/\s+/g, ' ').trim();
                // Strip merknad (fritekst før komma, men bare hvis kommaet er før f.o.m)
                if (/,/.test(tekst) && !/f\.o\.m/i.test(tekst.split(',')[0])) {
                    tekst = tekst.split(',').slice(1).join(',').trim();
                }
                const fomSplit = tekst.split(/f\.o\.m\s*/i);
                const adresse = fomSplit[0].trim();
                const datoer = fomSplit[1] || '';
                const datoReg = /(\d{2})\.(\d{2})\.(\d{2,4})/g;
                const [fomMatch, tomMatch] = [...datoer.matchAll(datoReg)];
                const parseD = m => m ? new Date(`${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2]}-${m[1]}`) : null;
                const fom = parseD(fomMatch);
                const tom = parseD(tomMatch);
                altAdresser.push({
                    id: radio.value,
                    aktiv: radio.hasAttribute('checked'),
                    adresse,
                    fom: fom?.toISOString().slice(0, 10),
                    tom: tom?.toISOString().slice(0, 10),
                    gyldig: (!fom || fom <= iDag) && (!tom || tom >= iDag)
                });
            });
            // Godkjent adresseavvik (p_2502) aktiv?
            const kategori = doc.querySelector('select[name="attentionRequired_category"]')?.value;
            const oppfolgingAktiv = doc.querySelector('input[name="attentionRequired_activated"]')?.hasAttribute('checked');
            const godkjentAvvik = !!(oppfolgingAktiv && kategori === 'p_2502');
            const resultat = { altAdresser, godkjentAvvik };
            lagreAltAdrCache(pnr, resultat, turDatoISO);
            console.log(`[ALT_ADR] PNR=${pnr}: ${altAdresser.length} adresse(r), godkjentAvvik=${godkjentAvvik}`);
            return resultat;
        } catch (e) {
            console.warn('[ALT_ADR] Feil:', e.message);
            return null;
        }
    }

    // Hent fulle adresser + retning fra admin (ajax_reqdetails)
    async function hentAdminData(reqId, resId) {
        try {
            const url = `${ADMIN_BASE}/ajax_reqdetails?id=${reqId}&db=1&tripid=${resId || reqId}&showSutiXml=true&hideEvents=&full=true`;
            const res = await fetch(url);
            const html = await res.text();

            // Folkeregistrert adresse, pasientnavn og PNR (før "Hentested")
            let folkAdr = '', pasientNavn = '', pnr = '';
            const hentestedIdx = html.indexOf('Hentested');
            if (hentestedIdx > -1) {
                const pasientSeksjon = html.substring(0, hentestedIdx);
                const addrMatches = [...pasientSeksjon.matchAll(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
                const postMatches = [...pasientSeksjon.matchAll(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
                const sisteAddr = addrMatches.length > 0 ? addrMatches[addrMatches.length - 1] : null;
                const sistePost = postMatches.length > 0 ? postMatches[postMatches.length - 1] : null;
                if (sisteAddr && sisteAddr[1].trim()) folkAdr = sisteAddr[1].trim().replace(/[HU]\d{4}/g, '').replace(/\s+/g, ' ').trim();
                if (sistePost && sistePost[1].trim()) folkAdr += ', ' + sistePost[1].trim();
                // Pasientnavn
                const navnM = pasientSeksjon.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (navnM) pasientNavn = navnM[1].trim();
                // Personnummer
                const pnrM = pasientSeksjon.match(/Personnr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i)
                    || pasientSeksjon.match(/F[\.\s]*dato[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (pnrM) pnr = pnrM[1].trim();
                console.log(`[ADMIN] Pasient: navn="${pasientNavn}" pnr="${pnr}" folk="${folkAdr.substring(0,50)}"`);
            }

            // Meldinger
            const meldTransM = html.match(/Melding[^<]*transport[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i)
                || html.match(/transport[^<]*melding[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const meldTransport = meldTransM ? meldTransM[1].trim() : '';
            const meldPasReiseM = html.match(/Melding[^<]*[Pp]asient[Rr]eise[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i)
                || html.match(/[Pp]asient[Rr]eise[^<]*[Mm]elding[^<]*<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const meldPasReise = meldPasReiseM ? meldPasReiseM[1].trim() : '';

            // Klipp ut Hentested- og Leveringssted-blokker basert på posisjon
            let fraNavn = '', fraAdr = '', tilNavn = '', tilAdr = '';
            const henteIdx = html.indexOf('Hentested');
            const leverIdx = html.indexOf('Leveringssted');

            // Hentested (navn + fra-adresse + kommentar) — mellom Hentested og Leveringssted
            let fraKommentar = '';
            if (henteIdx > -1) {
                const henteEnd = leverIdx > henteIdx ? leverIdx : html.indexOf('</fieldset>', henteIdx);
                const hb = html.substring(henteIdx, henteEnd > henteIdx ? henteEnd : undefined);
                const navnM = hb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (navnM) fraNavn = navnM[1].trim();
                const adrM = hb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const postM = hb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (adrM) fraAdr = adrM[1].trim();
                if (postM) fraAdr += ', ' + postM[1].trim();
                const komM = hb.match(/Kommentar:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (komM && komM[1].trim()) fraKommentar = komM[1].trim();
            }

            // Leveringssted (navn + til-adresse + kommentar) — fra Leveringssted og utover
            let tilKommentar = '';
            if (leverIdx > -1) {
                const leverEnd = html.indexOf('</fieldset>', leverIdx);
                const lb = html.substring(leverIdx, leverEnd > leverIdx ? leverEnd : undefined);
                const navnM = lb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (navnM) tilNavn = navnM[1].trim();
                const adrM = lb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                const postM = lb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (adrM) tilAdr = adrM[1].trim();
                if (postM) tilAdr += ', ' + postM[1].trim();
                const komM = lb.match(/Kommentar:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
                if (komM && komM[1].trim()) tilKommentar = komM[1].trim();
            }

            // Retning (Til / Fra behandling)
            const retningMatch = html.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
            const erTur = retningMatch ? retningMatch[1].trim().toLowerCase().includes('til behandling') : null;

            // Rekvisisjonsnummer
            const rekMatch = html.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i)
                || html.match(/>(\d{12})<\/b>/);
            const rekNr = rekMatch ? rekMatch[1] : null;

            // Rekvirent-info
            const rekvM = html.match(/Rekvirent[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const rekvirent = rekvM ? rekvM[1].trim() : '';
            const bestillerM = html.match(/Bestiller[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const bestiller = bestillerM ? bestillerM[1].trim() : '';
            const ansvarligM = html.match(/Ansvarlig rekvirent[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const ansvarligRekvirent = ansvarligM ? ansvarligM[1].trim() : '';
            const sistEndretM = html.match(/Sist endret bruker[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const sistEndretBruker = sistEndretM ? sistEndretM[1].trim() : '';

            // Telefonnumre (samme mønster som Overvåker Live)
            const telefonKilder = [];
            const mobilM = html.match(/>Mobilnr:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (mobilM && mobilM[1].trim()) telefonKilder.push({ nr: mobilM[1].trim().replace(/\s+/g, ' '), kilde: 'Mobil' });
            const mobil2M = html.match(/>Mobilnr \(2\):<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (mobil2M && mobil2M[1].trim()) telefonKilder.push({ nr: mobil2M[1].trim().replace(/\s+/g, ' '), kilde: 'Mobil 2' });
            const epjM = html.match(/Telefon\/mobilnr fra EPJ:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (epjM && epjM[1].trim()) telefonKilder.push({ nr: epjM[1].trim().replace(/\s+/g, ' '), kilde: 'EPJ' });
            const ringHenteM = html.match(/Ring ved ankomst hentested:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (ringHenteM && ringHenteM[1].trim()) telefonKilder.push({ nr: ringHenteM[1].trim().replace(/\s+/g, ' '), kilde: 'Ring hentested' });
            const ringAnkM = html.match(/Ring ved ankomst:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (ringAnkM && ringAnkM[1].trim()) telefonKilder.push({ nr: ringAnkM[1].trim().replace(/\s+/g, ' '), kilde: 'Ring ankomst' });

            console.log(`[ADMIN] RID=${reqId}: rek=${rekNr} rekv="${rekvirent}" folk="${folkAdr.substring(0,50)}" fraNavn="${fraNavn}" fra="${fraAdr.substring(0,50)}" tilNavn="${tilNavn}" til="${tilAdr.substring(0,50)}" erTur=${erTur} tlf=${telefonKilder.length}`);
            return { fra: fraAdr, til: tilAdr, folk: folkAdr, fraNavn, tilNavn, fraKommentar, tilKommentar, erTur, rekNr, rekvirent, bestiller, ansvarligRekvirent, sistEndretBruker, pasientNavn, pnr, meldTransport, meldPasReise, telefoner: telefonKilder };
        } catch (e) {
            console.warn(`[ADMIN] Feil ved henting av RID=${reqId}:`, e.message);
            return null;
        }
    }

    // KM-cache på server (deles mellom kollegaer, ryddes etter turDato)
    const FIL_KM_CACHE = 'km_cache.json';
    let _kmServerCache = {}; // { rekNr: { folkKm, bestiltKm, turDato, beregnet } }

    async function lastKmCacheFraServer() {
        try {
            const res = await fetch(`${SERVER_BASE}/lagre.php?fil=${FIL_KM_CACHE}`);
            if (res.ok) {
                const data = await res.json();
                _kmServerCache = (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
                // Rydd ut oppføringer der turDato er passert
                const iDag = new Date().toISOString().slice(0, 10);
                let ryddet = false;
                for (const id in _kmServerCache) {
                    if (_kmServerCache[id].turDato && _kmServerCache[id].turDato < iDag) {
                        delete _kmServerCache[id];
                        ryddet = true;
                    }
                }
                if (ryddet) lagreKmCacheTilServer();
                console.log(`[KM] Lastet ${Object.keys(_kmServerCache).length} km-resultater fra server`);
            }
        } catch (e) {
            console.warn('[KM] Kunne ikke laste km-cache fra server:', e.message);
        }
    }

    async function lagreKmCacheTilServer() {
        try {
            await lagreServerFil(FIL_KM_CACHE, _kmServerCache);
        } catch (e) {
            console.warn('[KM] Lagring av km-cache feilet:', e.message);
        }
    }

    // Lagre km-resultat for en rekvisisjon
    function lagreKmResultat(rekNr, folkKm, bestiltKm, turDato) {
        if (!rekNr) return;
        _kmServerCache[rekNr] = {
            folkKm: folkKm !== null && folkKm !== undefined ? folkKm : null,
            bestiltKm: bestiltKm !== null && bestiltKm !== undefined ? bestiltKm : null,
            turDato: turDato || new Date().toISOString().slice(0, 10),
            beregnet: new Date().toISOString().slice(0, 10)
        };
        lagreKmCacheTilServer();
    }

    // Synkron cache-lookup per rekNr (brukes i rendering)
    function hentKmFraCache(rekNr) {
        if (!rekNr || !_kmServerCache[rekNr]) return null;
        return _kmServerCache[rekNr];
    }

    // === HAVERSINE PRE-CHECK ===
    // Kutter Google-kall ved å sjekke luftlinje-avstand via postnr → Geonorge-koordinater
    const HAVERSINE_TERSKEL = 0.5; // bestilt-haversine / folkereg-haversine må være under dette for å filtreres
    const _postnrKoordCache = {}; // session memoization

    async function postnrKoordinat(postnr) {
        if (!postnr) return null;
        if (_postnrKoordCache[postnr]) return _postnrKoordCache[postnr];
        try {
            const res = await fetch(`${SERVER_BASE}/postnr.php?postnr=${encodeURIComponent(postnr)}`);
            const data = await res.json();
            if (data.ok) {
                _postnrKoordCache[postnr] = { lat: data.lat, lng: data.lng };
                return _postnrKoordCache[postnr];
            }
        } catch (e) {}
        _postnrKoordCache[postnr] = null;
        return null;
    }

    function haversine(a, b) {
        if (!a || !b) return null;
        const R = 6371;
        const toRad = d => d * Math.PI / 180;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const s = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2;
        return R * 2 * Math.asin(Math.sqrt(s));
    }

    // Returnerer {folkHav, bestHav, ratio} eller null hvis postnr mangler
    async function sjekkHaversine(folkAdr, bestiltFraAdr, behandlingsAdr) {
        const folkPnr = hentPostnr(folkAdr);
        const bestPnr = hentPostnr(bestiltFraAdr);
        const behPnr  = hentPostnr(behandlingsAdr);
        if (!folkPnr || !bestPnr || !behPnr) return null;
        const [folkKo, bestKo, behKo] = await Promise.all([
            postnrKoordinat(folkPnr),
            postnrKoordinat(bestPnr),
            postnrKoordinat(behPnr)
        ]);
        if (!folkKo || !bestKo || !behKo) return null;
        const folkHav = haversine(folkKo, behKo);
        const bestHav = haversine(bestKo, behKo);
        if (folkHav === null || bestHav === null || folkHav <= 0) return null;
        return { folkHav, bestHav, ratio: bestHav / folkHav };
    }

    function loggHaversineSkip(fraAdr, tilAdr, ratio, handling) {
        try {
            const nissyIdParam = NISSY_BRUKERNAVN ? `&nissy_id=${encodeURIComponent(NISSY_BRUKERNAVN)}` : '';
            fetch(`${SERVER_BASE}/googlemaps.php?log=1&backend=haversine&kilde=avvik&handling=${encodeURIComponent(handling||'')}&seksjon=adresse&bruker=${encodeURIComponent(NISSY_NAVN)}${nissyIdParam}&fra=${encodeURIComponent(fraAdr.substring(0,200))}&til=${encodeURIComponent(tilAdr.substring(0,200))}`, {mode:'no-cors'});
        } catch (e) {}
    }

    // Passivt oppslag: returnerer km hvis ruten er cachet, ellers null (kaller aldri Google)
    async function sjekkKmCache(fraAdresse, tilAdresse) {
        try {
            const fraRen = fraAdresse ? fraAdresse.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim() : '';
            const tilRen = tilAdresse ? tilAdresse.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim() : '';
            if (!fraRen || !tilRen) return null;
            const res = await fetch(`${SERVER_BASE}/googlemaps.php?only_cache=1&fra=${encodeURIComponent(fraRen)}&til=${encodeURIComponent(tilRen)}`);
            const data = await res.json();
            if (data.ok) return { km: data.km, tid: data.tid || null };
            return null;
        } catch (e) { return null; }
    }

    async function beregnKm(fraAdresse, tilAdresse, handling, seksjon) {
        try {
            const fraRen = fraAdresse ? fraAdresse.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim() : '';
            const tilRen = tilAdresse ? tilAdresse.replace(/<br>/g, ', ').replace(/<[^>]+>/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim() : '';
            if (!fraRen || !tilRen) {
                console.warn(`[KM] Mangler adresse: fra="${fraRen}" til="${tilRen}"`);
                return null;
            }

            // Google Maps via googlemaps.php
            const handlParam = handling ? `&handling=${encodeURIComponent(handling)}` : '';
            const seksjonParam = seksjon ? `&seksjon=${encodeURIComponent(seksjon)}` : '';
            const nissyIdParam = NISSY_BRUKERNAVN ? `&nissy_id=${encodeURIComponent(NISSY_BRUKERNAVN)}` : '';
            const gRes = await fetch(`${SERVER_BASE}/googlemaps.php?kilde=avvik&bruker=${encodeURIComponent(NISSY_NAVN)}${nissyIdParam}${handlParam}${seksjonParam}&fra=${encodeURIComponent(fraRen)}&til=${encodeURIComponent(tilRen)}`);
            const gData = await gRes.json();
            if (gData.ok) {
                const resultat = { km: gData.km, tid: gData.tid || null };
                console.log(`[KM] Google Maps: ${fraRen.substring(0,30)} → ${tilRen.substring(0,30)} = ${resultat.km} km`);
                return resultat;
            }
            console.warn(`[KM] Google Maps fant ikke rute: ${fraRen.substring(0,40)} → ${tilRen.substring(0,40)}`);
            return null;
        } catch (e) {
            console.error('[KM] Feil i beregnKm:', e.message);
            return null;
        }
    }

    // Alle kommune-kriterier hentes fra JSON (godkjente_kommune.json)
    // SPESIALIST_ORD, SPESIALIST_KOMBI, RUTE_KOMBI → avvik-siden (bekrefter kryss-kommune)
    // SYKEHUS_POSTNR → kanskje-siden (usikker, manuell vurdering)
    const SPESIALIST_ORD = godkjenteKommuneOrdGH;
    const SYKEHUS_POSTNR = godkjenteSykehusPostnrGH;
    const SPESIALIST_KOMBI = godkjenteSpesialistKombiGH;
    const RUTE_KOMBI = godkjenteRuteKombiGH;

    // Møteplasser -- turer til/fra møteplass er godkjent, skipper kommunegrense
    const MOTEPLASS_ORD = [
        'esso express oppaker',
        'vøyenenga'
    ];

    // Godkjente adresser for kommunekryssing (runde 2: sjekkes mot admin-data)
    // godkjenteKommuneAdresserGH — nå i godkjente_adresser.json (godkjenteKommuneAdresserGH)

    function erBehandlingssted(tekst) {
        if (!tekst) return false;
        const lower = tekst.toLowerCase();
        return SPESIALIST_ORD.some(ord => lower.includes(ord));
    }

    async function hentRekNr(reqId) {
        try {
            const t = Date.now();
            const xhr = await xhrRequest(`ajax-dispatch?update=false&action=showreq&rid=${reqId}&t=${t}`, { timeout: 10000 });
            const xml = new DOMParser().parseFromString(xhr.responseText, 'text/xml');
            const pDoc = new DOMParser().parseFromString(xml.querySelector('response').innerHTML, 'text/html');
            const rekLink = pDoc.querySelector('a[href*="requisition/redit"]');
            if (rekLink) {
                const m = rekLink.textContent.trim().match(/rekvisisjon\s*(\d+)/i);
                if (m) return m[1];
                return rekLink.textContent.replace(/rekvisisjon/i, '').trim();
            }
            const rekMatch = pDoc.body.textContent.match(/\b(2[567]\d{10})\b/);
            return rekMatch ? rekMatch[1] : reqId;
        } catch (e) { return reqId; }
    }

    // ==================================================================
    //    STATE                                                         
    // ==================================================================
    // Godkjente turer — MySQL via avvik_handlinger (tidligere godkjente_turer.json)
    const godkjentIMinne = new Set();

    // SÅRBAR-cache — reqIds som er bekreftet SÅRBAR via plakat, lagres i localStorage
    // Admin-verifiserte falske positiver — delt server-cache (v38.4.15-dev)
    // Flere brukere deler verifikasjoner for å unngå duplikat reqdetails-oppslag
    // File-basert (ingen DB-spam), ryddes automatisk ved dato < i dag
    const LS_ADMIN_FALSK = 'ovr_admin_falsk_positiv';
    const OVR_CACHE_URL = `${SERVER_BASE}/ovr_cache.php`;
    const adminFalskPositivCache = new Set();
    const _iDagStr = new Date().toISOString().slice(0, 10);
    let _adminFalskData = {}; // { rekNr: turDatoISO }

    // Last fra server først, fall tilbake til localStorage ved feil
    (async function _lastAdminFalskCache() {
        try {
            const res = await fetch(`${OVR_CACHE_URL}?action=hent`);
            if (res.ok) {
                const j = await res.json();
                if (j && j.ok && j.data) {
                    for (const [rek, meta] of Object.entries(j.data)) {
                        const dato = meta && meta.d ? meta.d : _iDagStr;
                        if (dato >= _iDagStr) {
                            adminFalskPositivCache.add(rek);
                            _adminFalskData[rek] = dato;
                        }
                    }
                    // Speil til localStorage som offline-fallback
                    try { localStorage.setItem(LS_ADMIN_FALSK, JSON.stringify(_adminFalskData)); } catch(e) {}
                    console.log(`[ADMIN-CACHE] Lastet ${adminFalskPositivCache.size} delte verifikasjoner fra server`);
                    return;
                }
            }
            throw new Error('server-fallback');
        } catch(e) {
            // Fallback: localStorage
            try {
                const raw = localStorage.getItem(LS_ADMIN_FALSK);
                if (raw) {
                    const lagret = JSON.parse(raw);
                    for (const [rekNr, dato] of Object.entries(lagret)) {
                        if (dato >= _iDagStr) {
                            adminFalskPositivCache.add(rekNr);
                            _adminFalskData[rekNr] = dato;
                        }
                    }
                    console.log(`[ADMIN-CACHE] Server ikke tilgjengelig — brukte ${adminFalskPositivCache.size} lokale verifikasjoner`);
                }
            } catch(e2) {}
        }
    })();

    function lagreAdminFalskPositiv(rekNr, turDatoISO) {
        if (!rekNr) return;
        const dato = turDatoISO || _iDagStr;
        adminFalskPositivCache.add(String(rekNr));
        _adminFalskData[String(rekNr)] = dato;
        // Speil lokalt
        try { localStorage.setItem(LS_ADMIN_FALSK, JSON.stringify(_adminFalskData)); } catch(e) {}
        // Push til delt server-cache (fire-and-forget)
        try {
            const fd = new FormData();
            fd.set('rek_nr', String(rekNr));
            fd.set('tur_dato', dato);
            fetch(`${OVR_CACHE_URL}?action=sett`, { method: 'POST', body: fd });
        } catch(e) {}
    }

    // Unngår gjentatte plakat-oppslag for samme reiser ved hver skann
    const LS_SAARBAR_CACHE = 'overvaker_barn_saarbar_cache';
    const saarbarCache = new Set();
    try {
        const raw = localStorage.getItem(LS_SAARBAR_CACHE);
        if (raw) JSON.parse(raw).forEach(id => saarbarCache.add(String(id)));
    } catch(e) {}
    function lagreSaarbarCache() {
        try { localStorage.setItem(LS_SAARBAR_CACHE, JSON.stringify([...saarbarCache])); } catch(e) {}
    }

    async function lastGodkjenteFraServer() {
        try {
            const res = await fetch(`${SERVER_BASE}/godkjente_turer_liste.php`);
            if (res.ok) {
                const data = await res.json();
                if (data.ok && data.godkjent) {
                    godkjentIMinne.clear();
                    for (const rek in data.godkjent) godkjentIMinne.add(rek);
                    console.log(`[GODKJENT] Lastet ${godkjentIMinne.size} godkjente turer fra DB`);
                    return;
                }
            }
            throw new Error('DB-svar ikke OK');
        } catch (e) {
            console.warn('[GODKJENT] DB-feil, prøver localStorage:', e.message);
            // Fallback til localStorage
            try {
                const raw = localStorage.getItem('overvaker_avvik_godkjent');
                if (raw) {
                    let p = JSON.parse(raw);
                    if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e2) {} }
                    if (Array.isArray(p)) p.filter(id => typeof id === 'string' && /^\d{5,}$/.test(id)).forEach(id => godkjentIMinne.add(id));
                }
            } catch (e2) {}
        }
    }

    function godkjennTur(id, grunn, rekNr) {
        if (!id && !rekNr) return;
        // DB-lagring skjer via loggHandling('GODKJENN', ...) som allerede kalles i SETT_AVVIK-handleren.
        // Her oppdaterer vi bare minne-settet for umiddelbar filtrering ved neste skann.
        const nokkel = rekNr || id;
        godkjentIMinne.add(nokkel);
        if (id && id !== nokkel) godkjentIMinne.add(id);
        // localStorage-fallback for robusthet
        localStorage.setItem('overvaker_avvik_godkjent', JSON.stringify([...godkjentIMinne]));
    }

    const lagreGodkjent = () => {
        localStorage.setItem('overvaker_avvik_godkjent', JSON.stringify([...godkjentIMinne]));
    };


    // Fade-out og fjern kort fra popup
    function fadeOgFjern(reqId) {
        const win = window.mqWin;
        if (!win || win.closed) return;
        const card = win.document.querySelector(`[data-rid="${reqId}"]`);
        if (!card) return;
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 650);
    }
    function fadeAlleMatchende(adresse) {
        const win = window.mqWin;
        if (!win || win.closed || !adresse) return;
        const adrLower = adresse.toLowerCase().trim();
        const kort = win.document.querySelectorAll('.card');
        kort.forEach(card => {
            if (card.style.opacity === '0') return;
            const tekst = card.textContent.toLowerCase();
            if (tekst.includes(adrLower)) {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.remove(), 650);
            }
        });
    }
    window.mqBrukGodkjenteAdresser = window.mqBrukGodkjenteAdresser !== undefined ? window.mqBrukGodkjenteAdresser : true;
    window.mqBrukGodkjenteOrd = window.mqBrukGodkjenteOrd !== undefined ? window.mqBrukGodkjenteOrd : true;
    window.mqAutoKm = window.mqAutoKm !== undefined ? window.mqAutoKm : false;

    // ==================================================================
    //    BroadcastChannel
    // ==================================================================
    // Unikt kanalnavn per kjøring -- isolerer gamle lyttere
    window._avvikGen = (window._avvikGen || 0) + 1;
    const CHANNEL_NAME = 'overvaker_avvik_' + window._avvikGen;
    // Lukk forrige kanal og timere
    if (window._avvikChannelMain) {
        try { window._avvikChannelMain.close(); } catch (e) {}
    }
    if (window._avvikHeartbeatTimer) {
        clearInterval(window._avvikHeartbeatTimer);
    }
    if (window._avvikAutoRefreshTimer) {
        clearInterval(window._avvikAutoRefreshTimer);
    }
    const avvikChannel = new BroadcastChannel(CHANNEL_NAME);
    window._avvikChannelMain = avvikChannel;

    // ==================================================================
    //    CSS                                                           
    // ==================================================================
    const godkjenteOrdListe = godkjenteOrdGH.map(o => `<li>${o}</li>`).join('');
    const godkjenteAdresserListe = godkjenteAdresserGH.map(a => `<li>${visAdr(a)}</li>`).join('');

    const STIL = `
        html, body { height: 100%; margin: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; padding: 16px; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
        .header { background: #002b5c; color: white; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; position: relative; }
        .stats-bar { background: white; border-radius: 8px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0; font-size: 13px; color: #64748b; }
        .stats-bar .count { font-weight: bold; color: #1e293b; font-size: 18px; margin-right: 4px; }
        .stats-bar .count.red { color: #ef4444; }
        .stats-bar .count.green { color: #10b981; }
        #container { flex: 1; overflow-y: auto; min-height: 0; padding-bottom: 16px; }

        .card { background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 12px; border-left: 6px solid #d32f2f; max-width: 900px; position: relative; }
        .card.dublett { border-left-color: #f59e0b; }
        .card.kommunegrense { border-left-color: #d32f2f; }
        .card.kommunegrense-kanskje { border-left-color: #f59e0b; }
        .card.adresse-kanskje { border-left-color: #f59e0b; }
        .card.barn-alene { border-left-color: #8b5cf6; }
        .card.barn-saarbar { border-left-color: #16a34a; }
        .card.pnr { border-left-color: #f59e0b; }
        .card[data-krav="mitt"] { outline: 3px solid #3b82f6; outline-offset: 2px; transition: outline 0.2s; position: relative; border-left-color: #3b82f6 !important; border-right: 1px solid #3b82f6; }
        .card[data-krav="mitt"]::after { content: "🔒 Du jobber med denne"; position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 4px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; z-index: 10; pointer-events: none; box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap; }
        .card.fader-ut { transition: opacity 0.8s, transform 0.8s; opacity: 0; transform: translateX(40px); pointer-events: none; }
        #ovr-toaster { position: fixed; bottom: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .ovr-toast { background: #1e293b; color: white; padding: 10px 14px; border-radius: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-left: 4px solid #10b981; opacity: 0; transform: translateX(40px); transition: opacity 0.3s, transform 0.3s; max-width: 360px; }
        .ovr-toast.vis { opacity: 1; transform: translateX(0); }
        .ovr-toast.avvik { border-left-color: #ef4444; }

        .card[data-krav="annen"] { opacity: 0.45; position: relative; pointer-events: none; }
        .card[data-krav="annen"]::before { content: "🔒 " attr(data-krav-sig) " jobber med denne"; position: absolute; top: 8px; right: 8px; background: #1e293b; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; z-index: 10; pointer-events: none; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .card { cursor: pointer; }
        .card .card-actions, .card .card-header, .card button, .card a, .card input { cursor: auto; }

        .card-header { padding: 10px 15px; background: #fff1f2; border-bottom: 1px solid #fee2e2; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .card.dublett .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.kommunegrense .card-header { background: #fff1f2; border-bottom-color: #fee2e2; }
        .card.kommunegrense-kanskje .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.adresse-kanskje .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.barn-alene .card-header { background: #ede9fe; border-bottom-color: #ddd6fe; }
        .card.barn-saarbar .card-header { background: #dcfce7; border-bottom-color: #bbf7d0; }
        .card.pnr .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card-body { padding: 15px; }
        .card-body .row { display: flex; gap: 20px; margin-bottom: 8px; }
        .card-body .col { flex: 1; }
        .label { font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; }
        .value { font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px; line-height: 1.4; }
        .highlight { color: #d32f2f; background: #fff1f2; padding: 2px 4px; border-radius: 2px; }
        .warning-text { color: #92400e; font-weight: bold; background: #fef3c7; padding: 4px 8px; border-radius: 4px; border: 1px solid #f59e0b; margin-bottom: 10px; display: inline-block; font-size: 12px; }
        .card-actions { padding: 10px 15px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 8px; }
        .btn-check { background: #10b981; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px; }
        .btn-check:hover { background: #059669; }
        .btn-avvik { background: #ef4444; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px; }
        .btn-avvik:hover { background: #dc2626; }
        .btn-nissy { background: #3b82f6; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px; }
        .btn-nissy:hover { background: #2563eb; }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px; vertical-align: middle; }
        .progress-ring { display: inline-block; vertical-align: middle; margin-right: 8px; }
        .progress-ring circle.bg { fill: none; stroke: rgba(255,255,255,0.2); }
        .progress-ring circle.fg { fill: none; stroke: #fff; stroke-linecap: round; transition: stroke-dashoffset 0.2s ease; transform: rotate(-90deg); transform-origin: 50% 50%; }
        .status-text { font-size: 14px; font-weight: normal; color: rgba(255,255,255,0.8); }

        .info-btn { background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .info-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 9999; }
        .info-modal.show { display: flex; }
        .gk-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: none; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 40px 16px; z-index: 10000; opacity: 0; transition: opacity 0.2s ease; }
        .gk-backdrop.show { display: flex; opacity: 1; }
        .gk-backdrop.entering { opacity: 0; }
        .gk-dialog { background: #fff; border-radius: 12px; width: 440px; max-width: 95vw; box-shadow: 0 25px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06); transform: translateY(12px) scale(0.98); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1); overflow: hidden; }
        .gk-backdrop.show .gk-dialog { transform: translateY(0) scale(1); }
        .gk-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid #f1f5f9; }
        .gk-header-left { display: flex; align-items: center; gap: 10px; }
        .gk-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
        .gk-icon--adr { background: #eff6ff; }
        .gk-icon--kom { background: #fffbeb; }
        .gk-title { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.2; }
        .gk-subtitle { font-size: 11px; font-weight: 500; color: #94a3b8; margin-top: 1px; }
        .gk-close { width: 28px; height: 28px; border: none; background: transparent; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.15s; flex-shrink: 0; }
        .gk-close:hover { background: #f1f5f9; color: #334155; }
        .gk-close svg { width: 16px; height: 16px; }
        .gk-context { margin: 12px 16px 0; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #475569; line-height: 1.5; }
        .gk-context-row { display: flex; align-items: baseline; gap: 6px; }
        .gk-context-row + .gk-context-row { margin-top: 4px; }
        .gk-context-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; width: 52px; flex-shrink: 0; }
        .gk-context-val { color: #334155; font-weight: 500; }
        .gk-context-val strong { color: #0f172a; font-weight: 700; }
        .gk-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
        .gk-badge--tur { background: #dbeafe; color: #1e40af; }
        .gk-badge--retur { background: #ede9fe; color: #5b21b6; }
        .gk-badge--kommune { background: #fef3c7; color: #92400e; }
        .gk-badge--api { background: #ecfdf5; color: #065f46; font-size: 9px; padding: 1px 6px; margin-left: 4px; }
        .gk-folkreg { margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e2e8f0; font-size: 11px; color: #94a3b8; font-style: italic; }
        .gk-tabs { display: flex; margin: 14px 16px 0; background: #f1f5f9; border-radius: 6px; padding: 3px; gap: 2px; }
        .gk-tab { flex: 1; padding: 8px 12px; border: none; background: transparent; border-radius: 5px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; text-align: center; }
        .gk-tab:hover:not(.active) { color: #334155; }
        .gk-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .gk-panel { display: none; padding: 14px 16px 16px; }
        .gk-panel.active { display: block; }
        .gk-primary-btn { width: 100%; padding: 12px 16px; border: none; border-radius: 8px; background: #2563eb; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
        .gk-primary-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        .gk-primary-btn:active { transform: translateY(0); }
        .gk-quick-section { margin-top: 12px; }
        .gk-quick-label { font-size: 11px; font-weight: 500; color: #94a3b8; margin-bottom: 6px; }
        .gk-quick-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .gk-chip { padding: 6px 14px; border: 1px solid #e2e8f0; border-radius: 20px; background: #fff; font-size: 12px; font-weight: 500; color: #334155; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .gk-chip:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .gk-reason-row { margin-top: 10px; display: flex; gap: 6px; }
        .gk-input { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; color: #334155; outline: none; transition: border-color 0.15s; background: #fff; }
        .gk-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .gk-input::placeholder { color: #cbd5e1; }
        .gk-btn-sm { padding: 8px 14px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
        .gk-btn-sm--blue { background: #2563eb; color: #fff; }
        .gk-btn-sm--blue:hover { background: #1d4ed8; }
        .gk-btn-sm--green { background: #10b981; color: #fff; }
        .gk-btn-sm--green:hover { background: #059669; }
        .gk-btn-sm--amber { background: #f59e0b; color: #fff; }
        .gk-btn-sm--amber:hover { background: #d97706; }
        .gk-perm-section { padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
        .gk-perm-section + .gk-perm-section { margin-top: 10px; }
        .gk-perm-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .gk-perm-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
        .gk-perm-icon--green { background: #d1fae5; }
        .gk-perm-icon--blue { background: #dbeafe; }
        .gk-perm-icon--amber { background: #fef3c7; }
        .gk-perm-title { font-size: 12px; font-weight: 700; color: #1e293b; }
        .gk-perm-desc { font-size: 11px; color: #94a3b8; margin-bottom: 8px; line-height: 1.4; }
        .gk-perm-input-row { display: flex; gap: 6px; }
        .gk-perm-chips { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px; }
        .gk-perm-chip { padding: 4px 10px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; font-size: 11px; color: #475569; cursor: pointer; transition: all 0.15s; }
        .gk-perm-chip:hover { border-color: #10b981; background: #ecfdf5; color: #059669; }
        .gk-perm-chip.saved { border-color: #10b981; background: #d1fae5; color: #059669; pointer-events: none; }
        .gk-perm-chip.partial { border-color: #f59e0b; background: #fffbeb; color: #d97706; }
        .gk-footer { padding: 0 16px 14px; display: flex; justify-content: flex-end; }
        .gk-cancel { padding: 8px 18px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.15s; }
        .gk-cancel:hover { border-color: #cbd5e1; color: #334155; background: #f8fafc; }
        .gk-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #fff; opacity: 0; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); z-index: 10001; pointer-events: none; white-space: nowrap; }
        .gk-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .gk-toast--success { background: #10b981; box-shadow: 0 4px 14px rgba(16,185,129,0.4); }
        .gk-toast--info { background: #2563eb; box-shadow: 0 4px 14px rgba(37,99,235,0.4); }
        .gk-toast--amber { background: #f59e0b; box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
        .gk-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.3); transform: scale(0); animation: gk-ripple-anim 0.5s ease-out; pointer-events: none; }
        @keyframes gk-ripple-anim { to { transform: scale(4); opacity: 0; } }
        @keyframes gk-check-pop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .gk-check-anim { display: inline-block; animation: gk-check-pop 0.3s cubic-bezier(0.16,1,0.3,1); }
        .adr-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 9999; }
        .adr-modal.show { display: flex; }
        .adr-modal-inner { background: white; border-radius: 10px; padding: 24px; width: 480px; max-width: 95vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3); transition: width 0.2s ease; }
        .adr-modal-inner.adresse-layout { width: 750px; }
        .adr-modal-inner.kommune-layout { width: 1100px; }
        .adr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .adr-grid-col { min-width: 0; }
        .adr-modal-inner h3 { margin: 0 0 16px 0; color: #002b5c; font-size: 16px; }
        .adr-liste { list-style: none; padding: 0; margin: 0 0 16px 0; }
        .adr-liste li { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
        .adr-liste li .adr-slett { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 0 4px; }
        .adr-input-rad { display: flex; gap: 8px; }
        .adr-input-rad input { flex: 1; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
        .adr-legg-til { background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 14px; font-weight: 600; }
        .adr-legg-til:hover { background: #2563eb; }
        .adr-status { font-size: 12px; margin-top: 8px; min-height: 18px; }
        .info-content { background: white; padding: 25px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .info-content h3 { margin-top: 0; color: #002b5c; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .info-content h4 { color: #374151; margin: 15px 0 10px 0; }
        .info-content ul { margin: 0; padding-left: 20px; }
        .info-content li { margin: 4px 0; font-size: 13px; }
        .info-content .section { background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 15px; }
        .info-content .close-btn { background: #6b7280; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; margin-top: 15px; }

        .filter-checkbox { display: flex; align-items: center; background: #1e3a5f; padding: 6px 10px; border-radius: 4px; margin-right: 8px; }
        .filter-checkbox input { margin-right: 5px; cursor: pointer; }
        .filter-checkbox label { color: white; font-size: 12px; cursor: pointer; user-select: none; }

        .heartbeat-bar { background: #ef4444; color: white; padding: 8px 16px; text-align: center; font-weight: bold; font-size: 13px; border-radius: 6px; margin-bottom: 8px; display: none; flex-shrink: 0; }
        .heartbeat-bar.show { display: block; }

        .valg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; padding: 20px 0; }
        .valg-boks { background: white; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 2px solid transparent; transition: all 0.2s; }
        .valg-boks:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .valg-boks .valg-ikon { font-size: 36px; margin-bottom: 10px; }
        .valg-boks .valg-tittel { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px; }
        .valg-boks .valg-beskrivelse { font-size: 12px; color: #64748b; }
        .valg-boks.barn { border-color: #8b5cf6; } .valg-boks.barn:hover { background: #f5f3ff; }
        .valg-boks.adresse { border-color: #ef4444; } .valg-boks.adresse:hover { background: #fef2f2; }
        .valg-boks.dublett { border-color: #f59e0b; } .valg-boks.dublett:hover { background: #fffbeb; }
        .valg-boks.pnr { border-color: #f59e0b; } .valg-boks.pnr:hover { background: #fffbeb; }
        .valg-boks.kommune { border-color: #3b82f6; } .valg-boks.kommune:hover { background: #eff6ff; }
        .tilbake-btn { background: #64748b; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; margin-bottom: 12px; }
        .tilbake-btn:hover { background: #475569; }
        .warn-banner { padding: 10px 16px; border-radius: 6px; margin-bottom: 8px; font-weight: bold; font-size: 13px; text-align: center; }
        .warn-banner.yellow { background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; }
        .warn-banner.red { background: #fef2f2; color: #991b1b; border: 1px solid #ef4444; }

        .dublett-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .dublett-grid .side { border-radius: 6px; }
        .dublett-grid .side-header { font-weight: bold; color: #92400e; margin-bottom: 10px; background: #fef3c7; padding: 5px 10px; border-radius: 4px; font-size: 12px; }

        .oppdater-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; position: sticky; top: 0; z-index: 20; background: #f0f2f5; padding: 8px 0; }
        .btn-oppdater { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-oppdater:hover { background: #2563eb; }
        .autorefresh-label { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; cursor: pointer; user-select: none; }
        .autorefresh-label input { cursor: pointer; }
        .autorefresh-countdown { font-size: 11px; color: #94a3b8; }

        .kommune-kolonner { display: flex; gap: 16px; align-items: flex-start; }
        .kommune-kol { min-width: 0; overflow-y: auto; }
        .kommune-kol-avvik { flex: 2; }
        .kommune-kol-kanskje { flex: 2; }
        .kommune-kol-stats { flex: 1; }
        .stats-sidebar-inner { position: sticky; top: 50px; max-height: calc(100vh - 60px); overflow-y: auto; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 12px; }
        .stats-sidebar-inner h3 { margin: 0; padding: 10px 12px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; font-size: 13px; color: #1e40af; border-radius: 8px 8px 0 0; }
        .dest-item { padding: 5px 12px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .dest-item:hover { background: #f8fafc; }
        .dest-navn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #334155; }
        .dest-count { font-weight: 600; color: #3b82f6; white-space: nowrap; }

        .kommune-kol .card { max-width: none; }

        .btn-filter { background:#f1f5f9; border:1px solid #94a3b8; border-radius:6px; padding:4px 12px; cursor:pointer; font-size:13px; font-weight:600; color:#334155; }
        .btn-filter:hover { background:#e2e8f0; }
        .filter-panel { position:absolute; top:100%; left:0; right:0; z-index:100; background:white; border:1px solid #cbd5e1; border-radius:0 0 8px 8px; box-shadow:0 8px 24px rgba(0,0,0,0.2); padding:16px; }
        .filter-section { margin-bottom:12px; }
        .filter-section:last-child { margin-bottom:0; }
        .filter-section-title { font-weight:600; font-size:12px; color:#64748b; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
        .filter-tags { display:flex; flex-wrap:wrap; gap:4px; }
        .filter-tag { background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:11px; color:#334155; border:1px solid #e2e8f0; }
        .filter-tag-max { background:#fef2f2 !important; border-color:#ef4444 !important; color:#991b1b; font-weight:600; }
        .rfilter-max { border-color:#ef4444 !important; background:#fef2f2 !important; }
    `;

    // ==================================================================
    //    KOLONNER -- cid for showcol-aktivering
    // ==================================================================
    const KOLONNE_CID = {
        'PNR': 'patientSsn',
        'Padr': 'patientAddress',
        'Oppmtid': 'tripTreatmentDate',
        'Behadr': 'tcAddress',
        'RMÅTE': 'tripTransportType'
    };

    // ==================================================================
    //    XHR HJELPEFUNKSJON (bruker XMLHttpRequest som NISSY)
    // ==================================================================
    function xhrRequest(url, opts) {
        opts = opts || {};
        return new Promise(function(resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(opts.method || 'GET', url, true);
            xhr.timeout = opts.timeout || 15000;
            if (opts.contentType) xhr.setRequestHeader('Content-Type', opts.contentType);
            xhr.onload = function() {
                console.log('[XHR] OK', xhr.status, (opts.method || 'GET'), url.substring(0, 80));
                resolve(xhr);
            };
            xhr.onerror = function() {
                console.error('[XHR] Nettverksfeil:', url.substring(0, 80));
                reject(new Error('XHR nettverksfeil: ' + url.substring(0, 80)));
            };
            xhr.ontimeout = function() {
                console.error('[XHR] Timeout:', url.substring(0, 80));
                reject(new Error('XHR timeout: ' + url.substring(0, 80)));
            };
            xhr.send(opts.body || null);
        });
    }

    // ==================================================================
    //    PARSE DISPATCH XML (gjenbrukbar for baade openres og showcol)
    // ==================================================================
    function parseDispatchXml(responseText) {
        const xml = new DOMParser().parseFromString(responseText, 'text/xml');
        console.log('[DISPATCH] XML parset, response-elementer:', xml.querySelectorAll('response').length);

        const rader = [];
        const manglendeKolonner = new Set();

        // Bygg ressursID→turID map fra resurser-tabellen (name-attributt = ressursID)
        const turidMap = {};
        const resResp = xml.querySelector('response[id="resurser"]');
        if (resResp) {
            const rd = document.createElement('div');
            rd.innerHTML = resResp.textContent;
            rd.querySelectorAll('tbody tr[name]').forEach(tr => {
                const tidM = tr.outerHTML.match(/searchStatus\?id=(\d+)/);
                const ressursId = tr.getAttribute('name');
                if (tidM && ressursId) turidMap[ressursId] = tidM[1];
            });
            console.log(`[DISPATCH] resurser: ${Object.keys(turidMap).length} ressursID→turID oppslag`);
        }

        xml.querySelectorAll('response').forEach(resp => {
            const fane = resp.getAttribute('id');
            if (!['ventendeOppdrag', 'paagaaendeOppdrag'].includes(fane)) return;
            const d = document.createElement('div');
            d.innerHTML = resp.textContent;

            const headerCells = Array.from(d.querySelector('tr.tbh')?.cells || []);
            const h = headerCells.map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));

            // Logg kolonne-CID-er for å oppdage nye kolonner
            const cidMap = {};
            headerCells.forEach(c => {
                const txt = c.textContent.toUpperCase().replace(/\s+/g, '');
                const onclick = c.getAttribute('onclick') || c.innerHTML;
                const cidMatch = onclick.match(/cid=([a-zA-Z_]+)/);
                if (cidMatch) cidMap[txt] = cidMatch[1];
            });
            if (Object.keys(cidMap).length > 0) console.log(`[DISPATCH] Kolonne-CID-er (${fane}):`, JSON.stringify(cidMap));

            console.log(`[DISPATCH] Fane: ${fane}, headers (${h.length}):`, h.join(' | '));

            // Hopp over tomme faner uten headers
            if (h.length === 0) return;

            const idx = {
                start: h.findIndex(s => s.includes('START')),
                fra: h.findIndex(s => s === 'FRA'),
                til: h.findIndex(s => s === 'TIL'),
                status: h.findIndex(s => s.includes('STATUS')),
                rekv: h.findIndex(s => s.includes('REKV')),
                pnr: h.findIndex(s => s === 'PNR'),
                pnavn: h.findIndex(s => s === 'PNAVN'),
                ledsager: h.findIndex(s => s === 'L'),
                padr: h.findIndex(s => s === 'PADR'),
                oppmtid: h.findIndex(s => s === 'OPPMTID' || s === 'OPPTID'),
                rmate: h.findIndex(s => s === 'RMÅTE' || s === 'REISEMÅTE'),
                behadr: h.findIndex(s => s === 'BEHADR'),
            };

            console.log(`[DISPATCH] Kolonneindekser:`, JSON.stringify(idx));

            const harFullInfo = idx.fra >= 0 && idx.til >= 0;

            if (idx.pnr < 0) manglendeKolonner.add('PNR');
            if (harFullInfo && idx.padr < 0) manglendeKolonner.add('Padr');
            if (harFullInfo && idx.oppmtid < 0) manglendeKolonner.add('Oppmtid');
            if (harFullInfo && idx.behadr < 0) manglendeKolonner.add('Behadr');
            if (idx.rmate < 0) manglendeKolonner.add('RMÅTE');

            d.querySelectorAll('tbody tr[name]').forEach(tr => {
                const alleReqIdMatches = [...tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)];
                if (alleReqIdMatches.length === 0) return;
                const alleReqIds = alleReqIdMatches.map(m => m[1]);
                const trName = tr.getAttribute('name');
                const resId = (trName && trName !== alleReqIds[0]) ? trName : null;
                const turid = resId ? (turidMap[resId] || null) : null;
                const erSamkjoring = alleReqIds.length > 1;

                // Hjelpefunksjoner for å lese celledata
                const divs = (i) => i >= 0 && tr.cells[i] ? tr.cells[i].querySelectorAll('div') : [];
                const txt = (i) => i >= 0 && tr.cells[i] ? tr.cells[i].textContent.trim() : '';
                const htm = (i) => i >= 0 && tr.cells[i] ? tr.cells[i].innerHTML : '';

                // For samkjøring på pågående: splitt til individuelle reiser
                if (erSamkjoring && fane === 'paagaaendeOppdrag') {
                    const divTxt = (i, n) => { const d = divs(i); return n < d.length ? d[n].textContent.trim() : txt(i); };
                    const divHtm = (i, n) => { const d = divs(i); return n < d.length ? d[n].innerHTML : htm(i); };

                    const alleRekNrTreff = [...tr.outerHTML.matchAll(/searchStatus\?nr=(\d+)/g)];
                    alleReqIds.forEach((reqId, n) => {
                        const rekNr = n < alleRekNrTreff.length ? alleRekNrTreff[n][1] : null;

                        rader.push({
                            reqId, resId, turid, rekNr, fane, erSamkjoring, samkjoringNr: n + 1, samkjoringAntall: alleReqIds.length, harFullInfo,
                            start: divTxt(idx.start, n),
                            fra: divTxt(idx.fra, n), fraHtml: divHtm(idx.fra, n),
                            til: divTxt(idx.til, n), tilHtml: divHtm(idx.til, n),
                            status: divTxt(idx.status, n),
                            rekvirent: divTxt(idx.rekv, n),
                            pnr: divTxt(idx.pnr, n).replace(/[^\d]/g, ''),
                            pnavn: divTxt(idx.pnavn, n),
                            ledsager: divTxt(idx.ledsager, n),
                            padr: divTxt(idx.padr, n), padrHtml: divHtm(idx.padr, n),
                            oppmtid: divTxt(idx.oppmtid, n),
                            rmate: divTxt(idx.rmate, n),
                            behadr: divTxt(idx.behadr, n),
                        });
                    });
                    return; // Ikke push hoved-raden
                }

                // Enkeltreise (inkl. ventende)
                const reqId = alleReqIds[0];
                const rekNrMatch = tr.outerHTML.match(/searchStatus\?nr=(\d+)/);
                const rekNr = rekNrMatch ? rekNrMatch[1] : null;

                rader.push({
                    reqId, resId, turid, rekNr, fane, erSamkjoring: false, harFullInfo,
                    start: txt(idx.start),
                    fra: txt(idx.fra), fraHtml: htm(idx.fra),
                    til: txt(idx.til), tilHtml: htm(idx.til),
                    status: txt(idx.status),
                    rekvirent: txt(idx.rekv),
                    pnr: txt(idx.pnr).replace(/[^\d]/g, ''),
                    pnavn: txt(idx.pnavn),
                    ledsager: txt(idx.ledsager),
                    padr: txt(idx.padr), padrHtml: htm(idx.padr),
                    oppmtid: txt(idx.oppmtid),
                    rmate: txt(idx.rmate),
                    behadr: txt(idx.behadr),
                });
            });
        });

        const medTurid = rader.filter(r => r.turid);
        const medRekNr = rader.filter(r => r.rekNr);
        console.log(`[DISPATCH] ${rader.length} rader, ${medTurid.length} med turid, ${medRekNr.length} med rekNr fra searchStatus`);
        if (rader.length > 0) {
            const ventEx = rader.find(r => !r.harFullInfo);
            const paagEx = rader.find(r => r.harFullInfo);
            if (ventEx) console.log(`[DISPATCH] Ventende eks: reqId=${ventEx.reqId}, turid=${ventEx.turid}, rekNr=${ventEx.rekNr}, padr="${(ventEx.padr||'').substring(0,30)}", harFullInfo=${ventEx.harFullInfo}`);
            if (paagEx) console.log(`[DISPATCH] Paagaaende eks: reqId=${paagEx.reqId}, turid=${paagEx.turid}, rekNr=${paagEx.rekNr}, fra="${(paagEx.fra||'').substring(0,30)}", til="${(paagEx.til||'').substring(0,30)}", harFullInfo=${paagEx.harFullInfo}`);
        }
        return { rader, manglendeKolonner };
    }

    // ==================================================================
    //    HENT DISPATCH DATA (looper gjennom alle aktive filtre)
    // ==================================================================
    async function hentDispatchData() {
        const filtreArr = [...aktiveFiltre];
        console.log(`[DISPATCH] hentDispatchData() -- ${filtreArr.length} filtre: [${filtreArr.join(', ')}]`);
        const t = Date.now();
        const nissyCookie = document.cookie.match(/thwerfilter=(\d+)/);
        const nissyFilterFra = nissyCookie ? nissyCookie[1] : null;

        // Hent NISSY sin nåværende søkestreng (fra input-feltet) for å gjenopprette etterpå
        const nissySokFelt = document.querySelector('input[name="search"], input.dispatch-search, #searchInput');
        const nissySokFra = nissySokFelt ? nissySokFelt.value : '';

        const alleRader = [];
        const alleManglendeKolonner = new Set();
        const seneReqIds = new Set(); // dedupliser på tvers av filtre
        const avkortedeFiltre = []; // filtre som nådde maks
        const filterTelling = {}; // antall rader per filter

        // Nullstill evt. aktivt søk i sesjonen FØR vi henter data
        try {
            await xhrRequest(`ajax-dispatch?did=all&search=none&t=${t}`, { timeout: 10000 });
            console.log('[DISPATCH] Søk nullstilt i sesjon');
        } catch (e) {
            console.warn('[DISPATCH] Kunne ikke nullstille søk:', e.message);
        }

        for (const filterId of filtreArr) {
            const url = `ajax-dispatch?did=all&action=openres&rid=-1&rfilter=${filterId}&t=${t}`;
            console.log(`[DISPATCH] Henter filter ${filterId}:`, url.substring(0, 140));
            const xhr = await xhrRequest(url, { timeout: 15000 });
            console.log(`[DISPATCH] Filter ${filterId}: status=${xhr.status}, lengde=${xhr.responseText.length}`);

            const result = parseDispatchXml(xhr.responseText);
            filterTelling[filterId] = result.rader.length;
            if (result.rader.length >= 999) {
                avkortedeFiltre.push(filterId);
                console.warn(`[DISPATCH] Filter ${filterId}: ${result.rader.length} rader — avkortet!`);
            }
            for (const r of result.rader) {
                if (!seneReqIds.has(r.reqId)) {
                    seneReqIds.add(r.reqId);
                    alleRader.push(r);
                }
            }
            result.manglendeKolonner.forEach(k => alleManglendeKolonner.add(k));
        }

        // Gjenopprett NISSY sin sesjonstilstand (filter + evt. søk)
        if (nissyFilterFra) {
            try {
                // Sett serveren tilbake til NISSY sitt opprinnelige filter
                const restoreSok = nissySokFra ? encodeURIComponent(nissySokFra) : 'none';
                const restoreUrl = `ajax-dispatch?did=all&rfilter=${nissyFilterFra}&search=${restoreSok}&t=${Date.now()}`;
                console.log(`[DISPATCH] Gjenoppretter NISSY-sesjon: filter=${nissyFilterFra}, søk="${nissySokFra}"`);
                await xhrRequest(restoreUrl, { timeout: 10000 });
            } catch (e) {
                console.warn('[DISPATCH] Kunne ikke gjenopprette NISSY-sesjon:', e.message);
            }
            document.cookie = `thwerfilter=${nissyFilterFra}; path=/`;
        }

        console.log(`[DISPATCH] Totalt: ${alleRader.length} unike rader fra ${filtreArr.length} filtre`);
        return { rader: alleRader, manglendeKolonner: alleManglendeKolonner, avkortedeFiltre, filterTelling };
    }

    // ==================================================================
    //    SJEKK: BARN REISER ALENE
    // ==================================================================
    async function sjekkBarn(rader, statusFn) {
        const funn = [];
        for (const r of rader) {
            if (godkjentIMinne.has(r.rekNr) || godkjentIMinne.has(r.turid)) continue;
            if (!r.pnr || r.pnr.length !== 11) continue;
            const alder = beregnAlder(r.pnr);
            if (alder === null || alder >= CONFIG.BARN_ALDER_GRENSE) continue;
            const led = r.ledsager !== '' ? parseInt(r.ledsager) : null;
            if (led !== 0) continue;
            funn.push({ ...r, type: 'barn', alder, antallLedsagere: 0 });
        }

        // Runde 2: Sjekk rekvisisjonsplakat for SÅRBAR
        // Cache-treff på rekNr (fra forrige skann) → ingen HTTP. Ny rek → hent plakat og lagre.
        if (funn.length > 0) {
            let nyeFraPlakat = 0;
            for (let i = 0; i < funn.length; i++) {
                const f = funn[i];
                const cacheNokkel = f.rekNr || String(f.reqId);

                // Cache-treff: allerede bekreftet SÅRBAR på dette rek.nr.
                if (saarbarCache.has(cacheNokkel)) {
                    f.saarbar = true;
                    console.log(`[BARN] SÅRBAR (cache): rek=${cacheNokkel}`);
                    continue;
                }

                if (statusFn) statusFn(`Sjekker plakat barn ${i + 1} av ${funn.length}...`);
                const plakat = await hentRekvisisjonsPlakat(String(f.reqId));
                if (!plakat) continue;
                const melding = plakat.meldPasReise || '';
                if (melding) f.meldPasReise = melding;
                if (/s[åa]rbar/i.test(melding)) {
                    const vedtakMatch = melding.match(/vedtaksnr(?:ummer)?[^\d]*(\d[\d\/\-]+\d)/i)
                        || melding.match(/\b(\d{2,4}\/\d{3,6}-\d+)\b/);
                    f.saarbar = true;
                    f.vedtakNr = vedtakMatch ? vedtakMatch[1] : '';
                    saarbarCache.add(cacheNokkel);
                    nyeFraPlakat++;
                    console.log(`[BARN] SÅRBAR (ny, lagret): rek=${cacheNokkel} vedtak=${f.vedtakNr || '(ingen)'}`);
                }
            }
            if (nyeFraPlakat > 0) lagreSaarbarCache();
        }

        // SÅRBAR er alltid godkjent — filtrer bort automatisk
        const antallSaarbar = funn.filter(f => f.saarbar).length;
        if (antallSaarbar > 0) console.log(`[BARN] Auto-godkjent ${antallSaarbar} SÅRBAR-sak(er) (cache: ${saarbarCache.size} totalt)`);
        return funn.filter(f => !f.saarbar);
    }

    // ==================================================================
    //    SJEKK: MANGLER PERSONNUMMER                                   
    // ==================================================================
    function sjekkPnr(rader) {
        const funn = [];
        for (const r of rader) {
            if (godkjentIMinne.has(r.rekNr) || godkjentIMinne.has(r.turid)) continue;
            if (/^\d{11}$/.test(r.pnr)) continue;
            // Hvis alder kan beregnes fra PNR, er det gyldig nok
            if (beregnAlder(r.pnr) !== null) continue;
            funn.push({ ...r, type: 'pnr' });
        }
        return funn;
    }

    // ==================================================================
    //    SJEKK: DOBBELTBESTILLING                                      
    // ==================================================================
    async function sjekkDublett(rader, statusFn) {
        const KANSELLERT = ['ikke møtt', 'bomtur', 'kansellert', 'avbestilt'];
        const grupper = {};
        for (const r of rader) {
            if (!r.harFullInfo) continue;
            if (godkjentIMinne.has(r.rekNr) || godkjentIMinne.has(r.turid)) continue;
            if (!r.pnr || r.pnr.length !== 11) continue;
            if (KANSELLERT.some(s => r.status.toLowerCase().includes(s))) continue;
            if (r.rmate && ['RFLY', 'HLSX', 'RP'].includes(r.rmate.toUpperCase())) continue;
            if (!grupper[r.pnr]) grupper[r.pnr] = [];

            // Bestem retning
            const startMin = parseTidMinutter(r.start);
            const oppmMin = parseTidMinutter(r.oppmtid);
            r.erTur = (startMin !== null && oppmMin !== null) ? startMin < oppmMin : null;

            grupper[r.pnr].push(r);
        }

        const funn = [];
        const flagget = new Set();

        for (const pnr in grupper) {
            const reiser = grupper[pnr];
            if (reiser.length < 2) continue;

            for (let i = 0; i < reiser.length; i++) {
                if (flagget.has(reiser[i].reqId)) continue;
                for (let j = i + 1; j < reiser.length; j++) {
                    if (flagget.has(reiser[j].reqId)) continue;
                    const a = reiser[i], b = reiser[j];

                    // Datosjekk: kun samme dag er dublett (uten dato = dagens dato)
                    const iDag = new Date();
                    const iDagStr = String(iDag.getDate()).padStart(2,'0') + '.' + String(iDag.getMonth()+1).padStart(2,'0');
                    const datoDel = (s) => { const m = (s || '').match(/(\d{1,2}\.\d{1,2})/); return m ? m[1] : iDagStr; };
                    const aDato = datoDel(a.start), bDato = datoDel(b.start);
                    if (aDato !== bDato) continue;

                    // Retningssjekk: kun same-direction er dublett (tur+tur eller retur+retur)
                    if (a.erTur !== null && b.erTur !== null && a.erTur !== b.erTur) continue;

                    // Oppmøtetid-sjekk: midlertidig deaktivert (0 min terskel)
                    // Operatørene observerer hvilke falske positiver som dukker opp
                    // og melder tilbake ønsket grense — da aktiveres sjekken igjen
                    // const aOppm = parseTidMinutter(a.oppmtid);
                    // const bOppm = parseTidMinutter(b.oppmtid);
                    // if (aOppm !== null && bOppm !== null && Math.abs(aOppm - bOppm) > 60) continue;

                    // Møteplass-filter: A.til = B.fra -> overgang, ikke dublett
                    const aFra = hentGateForSjekk(a.fraHtml);
                    const aTil = hentGateForSjekk(a.tilHtml);
                    const bFra = hentGateForSjekk(b.fraHtml);
                    const bTil = hentGateForSjekk(b.tilHtml);
                    if ((aTil.length > 3 && aTil === bFra) || (aFra.length > 3 && aFra === bTil)) continue;

                    flagget.add(a.reqId);
                    flagget.add(b.reqId);
                    funn.push({
                        type: 'dublett', reqId: a.reqId,
                        reise1: a, reise2: b,
                        erTur: a.erTur,
                    });
                }
            }
        }
        // Sorter etter tidligste starttid (haster mest først)
        funn.sort((x, y) => {
            const tidFra = (s) => {
                if (!s) return 9999;
                const m = s.match(/(\d{1,2})\.(\d{1,2})\s+(\d{1,2}):(\d{2})/);
                if (m) return parseInt(m[2]) * 100000 + parseInt(m[1]) * 1440 + parseInt(m[3]) * 60 + parseInt(m[4]);
                const t = s.match(/(\d{1,2}):(\d{2})/);
                if (t) return parseInt(t[1]) * 60 + parseInt(t[2]);
                return 9999;
            };
            const xTid = Math.min(tidFra(x.reise1.start), tidFra(x.reise2.start));
            const yTid = Math.min(tidFra(y.reise1.start), tidFra(y.reise2.start));
            return xTid - yTid;
        });

        // Hent admin-data (meldinger) for begge reiser i hver dublett
        if (adminTilgjengelig && funn.length > 0) {
            for (let i = 0; i < funn.length; i++) {
                const f = funn[i];
                if (statusFn) statusFn(`Henter admin dublett ${i + 1} av ${funn.length}...`);
                const a1 = await hentAdminData(f.reise1.reqId, f.reise1.resId);
                const a2 = await hentAdminData(f.reise2.reqId, f.reise2.resId);
                if (a1) f.admin1 = a1;
                if (a2) f.admin2 = a2;
            }
        }

        return funn;
    }

    // ==================================================================
    //    SJEKK: ADRESSEAVVIK                                           
    // ==================================================================
    async function sjekkAdresse(rader, statusFn) {
        let hoppetGodkjent = 0, hoppetKortPadr = 0, hoppetGateMatch = 0, hoppetGodkjentOrd = 0;
        let hoppetAdminCache = 0;
        const kandidater = [];
        const _t0 = performance.now();
        console.log(`[ADR] Start adressesjekk: ${rader.length} rader, brukOrd=${window.mqBrukGodkjenteOrd}, brukAdr=${window.mqBrukGodkjenteAdresser}, godkjent=${godkjentIMinne.size} stk:`, [...godkjentIMinne]);

        let hoppetVentende = 0;
        for (const r of rader) {
            if (!r.harFullInfo) { hoppetVentende++; continue; }
            if (r.rmate && ['RFLY', 'HLSX', 'RP'].includes(r.rmate.toUpperCase())) continue;
            if (godkjentIMinne.has(r.rekNr) || godkjentIMinne.has(r.turid)) { hoppetGodkjent++; console.log(`[ADR] HOPPET godkjent turid=${r.turid}`); continue; }
            if (adminFalskPositivCache.has(String(r.rekNr))) { hoppetGodkjent++; hoppetAdminCache++; continue; }

            const folkGate = hentGateForSjekk(r.padrHtml);
            const fraGate = hentGateForSjekk(r.fraHtml);
            const tilGate = hentGateForSjekk(r.tilHtml);

            if (folkGate.length < 4) { hoppetKortPadr++; continue; }

            // Grunnsjekk: matcher folkereg gate med fra eller til?
            const fraMatch = fraGate.includes(folkGate) || folkGate.includes(fraGate);
            const tilMatch = tilGate.includes(folkGate) || folkGate.includes(tilGate);
            if (fraMatch || tilMatch) { hoppetGateMatch++; continue; }

            // Retning
            const startMin = parseTidMinutter(r.start);
            const oppmMin = parseTidMinutter(r.oppmtid);
            const erTur = (startMin !== null && oppmMin !== null) ? startMin < oppmMin : null;

            // Runde 1: Godkjente søkeord fjerner fra dispatch
            const fraLower = r.fra.toLowerCase(), tilLower = r.til.toLowerCase();
            if (window.mqBrukGodkjenteOrd && (godkjenteOrdGH.some(o => fraLower.includes(o)) || godkjenteOrdGH.some(o => tilLower.includes(o)))) { hoppetGodkjentOrd++; continue; }

            // Kanskje-postnummer: TUR=sjekk fra, RETUR=sjekk til
            const kanskjeAdr = erTur === true ? r.fra : r.til;
            const kanskjePostnr = godkjenteKanskjePostnrGH.some(pnr => kanskjeAdr.includes(pnr));

            console.log(`[ADR] Kandidat RID=${r.reqId}: folk="${folkGate}" fra="${fraGate}" til="${tilGate}" retning=${erTur === true ? 'TUR' : erTur === false ? 'RETUR' : '?'} kanskje=${kanskjePostnr}`);
            kandidater.push({ ...r, type: 'adresse', erTur, folkGate, kanskjePostnr });
        }

        const _t1 = performance.now();
        console.log(`[ADR] Stage 1 (${Math.round(_t1-_t0)}ms): ${rader.length} rader -> ${kandidater.length} kandidater (hoppet: ventende=${hoppetVentende}, godkj=${hoppetGodkjent} [adminCache=${hoppetAdminCache}], kortPadr=${hoppetKortPadr}, gateMatch=${hoppetGateMatch}, godkjOrd=${hoppetGodkjentOrd})`);

        // ── Stage 2: Admin-verifisering ──────────────────────────────────
        // Kanskje-kandidater hopper over admin (sparer belastning)
        const kanskjeKandidater = kandidater.filter(k => k.kanskjePostnr);
        const adminKandidater = kandidater.filter(k => !k.kanskjePostnr);

        // Hent ekte adresser fra admin for å fjerne falske positiver
        let bekreftedeKandidater = adminKandidater;
        if (adminTilgjengelig && adminKandidater.length > 0) {
            bekreftedeKandidater = [];
            let fjernetAvAdmin = 0;
            for (let i = 0; i < adminKandidater.length; i++) {
                const k = adminKandidater[i];
                if (statusFn) statusFn(`Sjekker adresser... (${i + 1}/${adminKandidater.length} admin)`);

                const admin = await hentAdminData(k.reqId, k.resId);
                if (!admin) {
                    // Admin feilet — behold kandidaten (som før)
                    console.log(`[ADR] Stage 2: RID=${k.reqId} — admin feilet, beholder`);
                    bekreftedeKandidater.push(k);
                    continue;
                }

                // Lagre admin-data på kandidaten for gjenbruk i Stage 3
                k.adminData = admin;

                // Parse gater fra admin-tekst (ren tekst, ikke HTML)
                const adminFolkGate = hentGateFraTekst(admin.folk);
                const adminFraGate = hentGateFraTekst(admin.fra);
                const adminTilGate = hentGateFraTekst(admin.til);
                const erTur = admin.erTur !== null ? admin.erTur : k.erTur;

                // Sammenlign: normaliser punktum/mellomrom før includes-sjekk
                // "Dr.Dedickes" og "Dr. Dedichens" → "DR DEDICKES" vs "DR DEDICHENS"
                const norm = (s) => s.replace(/\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
                const gateMatch = (a, b) => {
                    if (!a || !b || a.length < 4 || b.length < 4) return false;
                    const na = norm(a), nb = norm(b);
                    return na.includes(nb) || nb.includes(na);
                };
                let adminFraMatch = false, adminTilMatch = false;
                if (adminFolkGate.length >= 4) {
                    adminFraMatch = gateMatch(adminFolkGate, adminFraGate);
                    adminTilMatch = gateMatch(adminFolkGate, adminTilGate);
                }
                const adminMatch = adminFraMatch || adminTilMatch;

                console.log(`[ADR] Stage 2: RID=${k.reqId} adminFolk="${adminFolkGate}" adminFra="${adminFraGate}" adminTil="${adminTilGate}" fraMatch=${adminFraMatch} tilMatch=${adminTilMatch} → ${adminMatch ? 'FALSK POSITIV (fjernet)' : 'BEKREFTET'}`);

                if (adminMatch) {
                    fjernetAvAdmin++;
                    const datoM = (k.start || '').match(/(\d{1,2})\.(\d{1,2})/);
                    const turDatoISO = datoM
                        ? `${new Date().getFullYear()}-${datoM[2].padStart(2,'0')}-${datoM[1].padStart(2,'0')}`
                        : _iDagStr;
                    lagreAdminFalskPositiv(k.rekNr, turDatoISO);
                    continue;
                }

                // Godkjente adresser (fra server) — sjekk admin-adresser
                if (window.mqBrukGodkjenteAdresser) {
                    const aFra = (admin.fra || '').toLowerCase();
                    const aTil = (admin.til || '').toLowerCase();
                    if (godkjenteAdresserGH.some(item => { const n = normaliserAdr(item); return n.godkjent && (aFra.includes(n.adresse) || aTil.includes(n.adresse)); })) {
                        fjernetAvAdmin++;
                        continue;
                    }
                }

                k.erTur = erTur;
                bekreftedeKandidater.push(k);
            }
            const _t2 = performance.now();
            console.log(`[ADR] Stage 2 (${Math.round(_t2-_t1)}ms): ${adminKandidater.length} admin-kandidater → ${bekreftedeKandidater.length} bekreftet (${fjernetAvAdmin} fjernet av admin), ${kanskjeKandidater.length} kanskje (hoppet admin)`);
        } else if (adminKandidater.length > 0) {
            console.log(`[ADR] Stage 2: Hoppet over (admin ${adminTilgjengelig ? 'tilgjengelig' : 'utilgjengelig'}), ${kanskjeKandidater.length} kanskje`);
        }

        // ── Stage 2b: Alternativ adresse-sjekk (editPatient) ────────────
        // Gate-match mot registrerte alternative adresser i NISSY.
        // Match → auto-godkjent (fjernes). Ingen match → vises med gult infopanel.
        const _t2b = performance.now();
        const altAdrGodkjente = new Set();
        const altAdrKandidater = [...bekreftedeKandidater, ...kanskjeKandidater].filter(k => k.pnr);
        if (altAdrKandidater.length > 0) {
            const normGate = s => s.replace(/\.\s*/g, ' ').replace(/\s+/g, ' ').trim();
            const altGateMatch = (a, b) => {
                if (!a || !b || a.length < 4 || b.length < 4) return false;
                const na = normGate(a), nb = normGate(b);
                return na.includes(nb) || nb.includes(na);
            };
            for (let i = 0; i < altAdrKandidater.length; i++) {
                const k = altAdrKandidater[i];
                if (statusFn) statusFn(`Alt. adresse ${i + 1} av ${altAdrKandidater.length}...`);
                // Parse turdato fra k.start ("16.04 12:30") for cache-expiry
                const startM = (k.start || '').match(/(\d{1,2})\.(\d{1,2})/);
                const kTurDato = startM
                    ? `${new Date().getFullYear()}-${startM[2].padStart(2,'0')}-${startM[1].padStart(2,'0')}`
                    : _iDagStr;
                const altAdr = await hentPasientAdresser(k.pnr, kTurDato);
                if (!altAdr) continue;
                const gyldige = altAdr.altAdresser.filter(a => a.gyldig);
                if (gyldige.length === 0 && !altAdr.godkjentAvvik) continue;

                // Gate-matching: TUR=fra (hentested=hjemme), RETUR=til (leveringssted=hjemme)
                const transportHtml = k.erTur === false ? k.tilHtml : k.fraHtml;
                const transportGate = hentGateForSjekk(transportHtml || '');
                let matchetAdr = null;
                for (const a of gyldige) {
                    const altGate = hentGateFraTekst(a.adresse);
                    if (altGateMatch(transportGate, altGate)) { matchetAdr = a; break; }
                }

                const match = !!(matchetAdr || altAdr.godkjentAvvik);
                console.log(`[ADR] Stage 2b: RID=${k.reqId} transportGate="${transportGate}" match=${match} → ${matchetAdr ? matchetAdr.adresse : 'ingen match'}`);

                if (match) {
                    altAdrGodkjente.add(k.reqId);
                    // Logg til server + legg i godkjentIMinne → filtreres bort ved neste skann
                    godkjennTur(k.turid, 'Alternativ adresse match', k.rekNr || '');
                    loggHandling('GODKJENN', {
                        seksjon: 'adresse',
                        rek_nr: k.rekNr || '',
                        tur_id: k.turid || '',
                        grunn: 'Alternativ adresse match' + (matchetAdr ? ': ' + matchetAdr.adresse : '')
                    });
                } else {
                    // Ingen match — berik kortet med gul info
                    k.altAdresser = gyldige;
                    k.godkjentAdresseavvik = altAdr.godkjentAvvik;
                    k.altAdrMatch = false;
                }
            }
            if (altAdrGodkjente.size > 0) {
                bekreftedeKandidater = bekreftedeKandidater.filter(k => !altAdrGodkjente.has(k.reqId));
            }
            const _t2bend = performance.now();
            console.log(`[ADR] Stage 2b (${Math.round(_t2bend-_t2b)}ms): ${altAdrKandidater.length} sjekket, ${altAdrGodkjente.size} auto-godkjent (alt. adresse match)`);
        }

        // ── Stage 3: Km-beregning eller manuell visning ─────────────────
        const funn = [];
        if (window.mqAutoKm && adminTilgjengelig) {
            for (let i = 0; i < bekreftedeKandidater.length; i++) {
                const k = bekreftedeKandidater[i];
                if (statusFn) statusFn(`Filtrerer/beregner ${i + 1} av ${bekreftedeKandidater.length}...`);

                // Gjenbruk admin-data fra Stage 2 (ingen dobbel-henting)
                const admin = k.adminData || await hentAdminData(k.reqId, k.resId);
                const folkAdr = admin && admin.folk ? admin.folk : formaterForVisning(k.padrHtml);
                const fraAdr = admin && admin.fra ? admin.fra : formaterForVisning(k.fraHtml);
                const tilAdr = admin && admin.til ? admin.til : formaterForVisning(k.tilHtml);
                const erTur = admin && admin.erTur !== null ? admin.erTur : k.erTur;
                const behandlingsAdr = erTur ? tilAdr : (erTur === false ? fraAdr : tilAdr);

                const bestiltFraAdr = erTur ? fraAdr : tilAdr;

                // Haversine pre-check: hvis bestilt er soleklart kortere, hopp over Google-kall
                const hav = await sjekkHaversine(folkAdr, bestiltFraAdr, behandlingsAdr);
                if (hav && hav.ratio < HAVERSINE_TERSKEL) {
                    console.log(`[ADR] Haversine-skip RID=${k.reqId}: bestilt=${hav.bestHav.toFixed(1)} folk=${hav.folkHav.toFixed(1)} ratio=${(hav.ratio*100).toFixed(0)}% — filtrert (terskel ${HAVERSINE_TERSKEL*100}%)`);
                    loggHaversineSkip(bestiltFraAdr, behandlingsAdr, hav.ratio, 'auto');
                    continue;
                }

                const folkKm = await beregnKm(folkAdr, behandlingsAdr, 'auto', 'adresse');
                const bestiltKm = await beregnKm(bestiltFraAdr, behandlingsAdr, 'auto', 'adresse');

                console.log(`[ADR] Auto-km ${i+1}/${bekreftedeKandidater.length} RID=${k.reqId}: folkKm=${folkKm?.km ?? 'null'}, bestiltKm=${bestiltKm?.km ?? 'null'}`);

                // Lagre i server-cache
                const autoRekNr = admin && admin.rekNr ? admin.rekNr : (k.rekNr || '');
                if (autoRekNr) {
                    let turDatoISO = new Date().toISOString().slice(0, 10);
                    const datoM = (k.start || '').match(/(\d{1,2})\.(\d{1,2})/);
                    if (datoM) { turDatoISO = `${new Date().getFullYear()}-${datoM[2].padStart(2,'0')}-${datoM[1].padStart(2,'0')}`; }
                    lagreKmResultat(autoRekNr, folkKm ? folkKm.km : null, bestiltKm ? bestiltKm.km : null, turDatoISO);
                }

                if (folkKm && bestiltKm && bestiltKm.km <= folkKm.km) continue; // OK

                k.erTur = erTur;
                k.kmInfo = { folkKm: folkKm?.km || null, bestiltKm: bestiltKm?.km || null, kilde: 'live' };
                k.folkAdrTekst = folkAdr;
                k.fraAdrTekst = fraAdr;
                k.tilAdrTekst = tilAdr;
                funn.push(k);
            }
        } else {
            // Manuell modus: haversine-filtrer + passivt cache-oppslag før visning.
            // Reiser som er soleklart OK (via luftlinje eller cache) filtreres bort uten Google-kall.
            for (let i = 0; i < bekreftedeKandidater.length; i++) {
                const k = bekreftedeKandidater[i];
                if (statusFn) statusFn(`Filtrerer ${i + 1} av ${bekreftedeKandidater.length}...`);
                const admin = k.adminData || await hentAdminData(k.reqId, k.resId);
                const folkAdr = admin && admin.folk ? admin.folk : formaterForVisning(k.padrHtml);
                const fraAdr = admin && admin.fra ? admin.fra : formaterForVisning(k.fraHtml);
                const tilAdr = admin && admin.til ? admin.til : formaterForVisning(k.tilHtml);
                const erTur = admin && admin.erTur !== null ? admin.erTur : k.erTur;
                const behandlingsAdr = erTur ? tilAdr : (erTur === false ? fraAdr : tilAdr);

                const bestiltFraAdr = erTur ? fraAdr : tilAdr;

                // Haversine pre-check: hvis bestilt er soleklart kortere, fjern fra avvik-listen
                const hav = await sjekkHaversine(folkAdr, bestiltFraAdr, behandlingsAdr);
                if (hav && hav.ratio < HAVERSINE_TERSKEL) {
                    console.log(`[ADR] Haversine-skip RID=${k.reqId}: ratio=${(hav.ratio*100).toFixed(0)}% — filtrert`);
                    loggHaversineSkip(bestiltFraAdr, behandlingsAdr, hav.ratio, 'manual');
                    continue;
                }

                const folkKm = await sjekkKmCache(folkAdr, behandlingsAdr);
                const bestiltKm = await sjekkKmCache(bestiltFraAdr, behandlingsAdr);

                // Kun vis km-info når BEGGE er cachet — partial hit ser ut som en bug
                if (folkKm && bestiltKm) {
                    if (bestiltKm.km <= folkKm.km) {
                        console.log(`[ADR] Passiv cache: RID=${k.reqId} OK (${bestiltKm.km}≤${folkKm.km}) — filtrert`);
                        continue;
                    }
                    k.erTur = erTur;
                    k.kmInfo = { folkKm: folkKm.km, bestiltKm: bestiltKm.km, kilde: 'global' };
                    k.folkAdrTekst = folkAdr;
                    k.fraAdrTekst = fraAdr;
                    k.tilAdrTekst = tilAdr;
                }
                funn.push(k);
            }
        }
        // Legg til kanskje-kandidater — hopp over de som matchet alt. adresse
        for (const k of kanskjeKandidater) {
            if (!altAdrGodkjente.has(k.reqId)) funn.push(k);
        }

        if (statusFn) statusFn('');
        const _tEnd = performance.now();
        console.log(`[ADR] Ferdig (totalt ${Math.round(_tEnd-_t0)}ms): ${funn.length} funn (${funn.filter(f=>!f.kanskjePostnr).length} avvik + ${kanskjeKandidater.length} kanskje) av ${kandidater.length} kandidater`);
        return funn;
    }

    // ==================================================================
    //    SJEKK: KOMMUNEGRENSE                                          
    // ==================================================================
    async function sjekkKommune(rader, statusFn) {
        const funn = [];
        const kandidater = rader.filter(r => r.harFullInfo && !godkjentIMinne.has(r.rekNr) || godkjentIMinne.has(r.turid) && !(r.rmate && ['RFLY', 'HLSX', 'RP'].includes(r.rmate.toUpperCase())));

        for (let i = 0; i < kandidater.length; i++) {
            const r = kandidater[i];
            if (statusFn) statusFn(`Sjekker kommune ${i + 1} av ${kandidater.length}...`);

            // Kommune-sjekk: sammenlign FRA (hentested) med TIL (leveringssted)
            const fraPostnr = hentPostnr(r.fra);
            const tilPostnr = hentPostnr(r.til);
            const fraKommune = hentKommune(fraPostnr);
            const tilKommune = hentKommune(tilPostnr);
            if (!fraKommune || !tilKommune) continue;

            // Samme kommune -- OK
            if (fraKommune === tilKommune) continue;

            // Retning: Start < Oppmtid = TUR, ellers RETUR
            const startMin = parseTidMinutter(r.start);
            const oppmMin = parseTidMinutter(r.oppmtid);
            const erTur = (startMin !== null && oppmMin !== null) ? startMin < oppmMin : null;

            // For visning: pasient = fra-kommune, behandler = til-kommune
            const pasientKommune = fraKommune;
            const destKommune = tilKommune;
            const destTekst = r.til;
            const destPostnr = tilPostnr;

            // Møteplass -- turer til/fra møteplass er manuelt godkjent, skip helt
            const destLower = destTekst.toLowerCase();
            const fraLower = r.fra.toLowerCase();
            if (MOTEPLASS_ORD.some(ord => destLower.includes(ord) || fraLower.includes(ord))) continue;

            // Godkjente kommune-ord fra JSON — skip helt
            const tilLowerK = r.til.toLowerCase();
            if (window.mqBrukGodkjenteOrd && godkjenteKommuneOrdGH.some(o => fraLower.includes(o) || tilLowerK.includes(o))) continue;

            // Rute-kombo: fra inneholder A og til inneholder B (eller omvendt)
            const tilLower = r.til.toLowerCase();
            const treffRute = RUTE_KOMBI.find(k =>
                (fraLower.includes(k.a) && tilLower.includes(k.b)) ||
                (fraLower.includes(k.b) && tilLower.includes(k.a))
            );

            // Sjekk kriterier
            const rekLower = r.rekvirent.toLowerCase();
            const treffOrd = SPESIALIST_ORD.find(ord => destLower.includes(ord) || rekLower.includes(ord));
            const erSykehusPostnr = destPostnr && SYKEHUS_POSTNR.includes(destPostnr);
            const treffKombi = SPESIALIST_KOMBI.find(k => destLower.includes(k.ord) && destPostnr === k.postnr);

            // Kombi og rute = godkjent (kjent spesialist/rute, skip helt)
            if (treffKombi || treffRute) continue;

            // Kun SYKEHUS_POSTNR eller ord gir kanskje
            const erKanskjeSykehus = erSykehusPostnr && !treffOrd;

            // Bygg grunn-tekst — vises på kortet uansett side
            const treffGrunn = [];
            if (treffOrd) treffGrunn.push('ord: ' + treffOrd);
            if (erSykehusPostnr) treffGrunn.push('postnr: ' + destPostnr);

            funn.push({
                ...r, type: 'kommune',
                erTur,  // bruk lokalt beregnet erTur, ikke r.erTur som kan være undefined
                pasientKommune,
                behandlingsstedKommune: destKommune,
                destNavn: destTekst,
                destPostnr: destPostnr || '',
                kanskjeSykehus: erKanskjeSykehus,
                kanskjeGrunn: erKanskjeSykehus ? treffGrunn.join(' + ') : '',
                avvikGrunn: !erKanskjeSykehus && treffGrunn.length > 0 ? treffGrunn.join(' + ') : '',
            });
        }

        // ── Hent admin-data for alle funn (avvik + kanskje) ──────────────
        // Beriker kort med behandlingssted-adresse, rek.nr. osv.
        if (adminTilgjengelig && funn.length > 0) {
            for (let i = 0; i < funn.length; i++) {
                const f = funn[i];
                if (statusFn) statusFn(`Henter admin ${i + 1} av ${funn.length}...`);

                const admin = await hentAdminData(f.reqId, f.resId);
                if (!admin) continue;

                f.adminData = admin;
                console.log(`[KOMMUNE] Admin: RID=${f.reqId} rek=${admin.rekNr || '?'} fra="${(admin.fra || '').substring(0,40)}" til="${(admin.til || '').substring(0,40)}"`);
            }
            console.log(`[KOMMUNE] Admin-data hentet for ${funn.length} funn`);

            const avvik = funn.filter(f => !f.kanskjeSykehus);

            // Runde 2: Sjekk admin-adresse mot godkjente kommuneadresser
            for (const f of avvik) {
                if (!f.adminData) continue;
                const fraLow = (f.adminData.fra || '').toLowerCase();
                const tilLow = (f.adminData.til || '').toLowerCase();
                const treff = godkjenteKommuneAdresserGH.find(g => {
                    if (typeof g === 'string') {
                        const s = g.toLowerCase();
                        return fraLow.includes(s) || tilLow.includes(s);
                    }
                    if (g && g.adresse) {
                        const a = g.adresse.toLowerCase();
                        const p = (g.postnr || '');
                        return (fraLow.includes(a) && (!p || fraLow.includes(p))) ||
                               (tilLow.includes(a) && (!p || tilLow.includes(p)));
                    }
                    return false;
                });
                if (treff) {
                    f.kanskjeSykehus = true;
                    const treffVis = typeof treff === 'string' ? treff : (treff.adresse + (treff.postnr ? ', ' + treff.postnr : ''));
                    f.kanskjeGrunn = 'admin-adresse: ' + treffVis;
                    console.log(`[KOMMUNE] Runde 2 kanskje: RID=${f.reqId} treff=${treffVis}`);
                }
            }
        }

        // ── Runde 2b: Vedtak-oppslag i DB ───────────────────────────
        // Stoler ikke på datoer/tekst i meldingsfeltet — DB er kilden til sannhet.
        // meldPasReise + meldTransport sendes som fritekst til vedtak.php?handling=soek;
        // serveren matcher saksnummer/kort_id som substring mot gyldige vedtak.
        // Hvis ingenting funnet men meldingen antyder godkjenning → merkes for visning.
        const _antyder = (t) => /godkjent|gyldig til|ref\.?\s*nr|vedtak/i.test(t);
        const _turdatoFraStart = (start) => {
            const m = (start || '').match(/(\d{1,2})\.(\d{1,2})/);
            if (!m) return '';
            return `${new Date().getFullYear()}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
        };

        const vedtakJobs = funn
            .filter(f => !f.kanskjeSykehus && f.adminData)
            .map(async f => {
                const meldPas   = f.adminData.meldPasReise  || '';
                const meldTrans = f.adminData.meldTransport  || '';
                const kombinert = [meldPas, meldTrans].filter(Boolean).join(' ');
                if (!kombinert) return;
                const turdato = _turdatoFraStart(f.start);
                const vedtak = await sjekkVedtakIDb(kombinert, turdato);
                if (vedtak) {
                    f.vedtakGodkjent = true;
                    f.vedtakData = vedtak;
                    console.log(`[KOMMUNE] Runde 2b vedtak funnet: RID=${f.reqId} saksnr=${vedtak.saksnummer || vedtak.kort_id} gyldig_tom=${vedtak.gyldig_tom}`);
                } else if (_antyder(kombinert)) {
                    f.meldingAntyder = kombinert;
                    console.log(`[KOMMUNE] Runde 2b antyder men ikke i DB: RID=${f.reqId} melding="${kombinert.substring(0, 80)}"`);
                }
            });
        await Promise.all(vedtakJobs);

        // ── Runde 3: API-verifisering av gjenstående avvik ──────────
        // Bruker Geonorge API for nøyaktig kommune (postnr kan gi feil ved grenseadresser)
        // Fra+til parallelt per avvik, maks 4 avvik samtidig for å unngå rate-limiting
        const gjenstaende = funn.filter(f => !f.kanskjeSykehus);
        if (gjenstaende.length > 0) {
            console.log(`[KOMMUNE] API-verifisering: ${gjenstaende.length} avvik`);
            const BATCH_SIZE = 4;
            for (let b = 0; b < gjenstaende.length; b += BATCH_SIZE) {
                const batch = gjenstaende.slice(b, b + BATCH_SIZE);
                if (statusFn) statusFn(`API-sjekk ${b + 1}-${Math.min(b + BATCH_SIZE, gjenstaende.length)} av ${gjenstaende.length}...`);

                const batchJobs = batch.map(f => {
                    const fraAdr = f.adminData ? (f.adminData.fra || f.fra) : f.fra;
                    const tilAdr = f.adminData ? (f.adminData.til || f.destNavn) : f.destNavn;
                    return Promise.all([hentKommuneFraApi(fraAdr), hentKommuneFraApi(tilAdr)])
                        .then(([apiFra, apiTil]) => ({ f, fraAdr, tilAdr, apiFra, apiTil }));
                });
                const resultater = await Promise.all(batchJobs);

                for (const { f, fraAdr, tilAdr, apiFra, apiTil } of resultater) {
                    let fraKom = null, fraKilde = 'geo-feilet';
                    if (apiFra) { fraKom = apiFra.kommune; fraKilde = 'geonorge'; }
                    if (!fraKom) fraKom = hentKommune(hentPostnr(fraAdr));
                    if (fraKom) f.pasientKommune = fraKom;
                    f.fraKilde = fraKilde;

                    let tilKom = null, tilKilde = 'geo-feilet';
                    if (apiTil) { tilKom = apiTil.kommune; tilKilde = 'geonorge'; f.apiVerifisert = true; }
                    if (!tilKom) tilKom = hentKommune(hentPostnr(tilAdr));
                    if (tilKom) f.behandlingsstedKommune = tilKom;
                    f.tilKilde = tilKilde;

                    console.log(`[KOMMUNE] Runde 3: fra="${fraAdr?.substring(0,40)}" → ${fraKom} (${fraKilde}), til="${tilAdr?.substring(0,40)}" → ${tilKom} (${tilKilde})`);

                    if (fraKom && tilKom && fraKom.toUpperCase() === tilKom.toUpperCase()) {
                        f.kanskjeSykehus = true;
                        f.kanskjeGrunn = (f.kanskjeGrunn ? f.kanskjeGrunn + ' + ' : '') + 'runde 3: samme kommune (' + fraKom + ')';
                        console.log(`[KOMMUNE] Runde 3 korrigert: ${f.reqId} ${fraKom} = ${tilKom}, flyttet til kanskje`);
                    }
                }
            }
        }

        return funn;
    }

    // ==================================================================
    //    KJØR SKANN                                                    
    // ==================================================================
    async function kjorSkann(sjekkType) {
        console.log(`[SKANN] Start: ${sjekkType}`);
        visLasteStatus('Henter reiser...');

        // Re-sjekk admin hvis den var utilgjengelig ved oppstart
        await sikreAdminTilgang();

        let dispatchData;
        try {
            dispatchData = await hentDispatchData();
        } catch (e) {
            console.error('[SKANN] Feil ved henting av dispatch:', e);
            visLasteStatus('');
            visResultater([], sjekkType, 0, 'Feil ved henting av dispatch-data.');
            return;
        }

        console.log(`[SKANN] Dispatch hentet: ${dispatchData.rader.length} rader, manglende kolonner: [${[...dispatchData.manglendeKolonner].join(', ')}]`);

        // Aktiver manglende kolonner -- kall showcol, poll til de dukker opp
        const krevde = {
            barn: ['PNR'], pnr: ['PNR'], dublett: ['PNR', 'Oppmtid', 'RMÅTE', 'Status'],
            adresse: ['Padr', 'Oppmtid', 'RMÅTE'], kommune: ['Padr', 'Oppmtid', 'RMÅTE'],
        };
        let mangler = (krevde[sjekkType] || []).filter(k => dispatchData.manglendeKolonner.has(k));

        if (mangler.length > 0) {
            console.log(`[SKANN] Mangler kolonner for ${sjekkType}: [${mangler.join(', ')}] -- aktiverer via showcol`);

            // Kall showcol for å aktivere kolonner for ALLE aktive filtre
            try {
                for (const filterId of [...aktiveFiltre]) {
                    const base = `ajax-dispatch?did=all&rfilter=${filterId}`;
                    const showcolUrls = mangler.flatMap(kol => {
                        const cid = KOLONNE_CID[kol];
                        return cid ? [
                            base + '&action=pshowcol&cid=' + cid,
                            base + '&action=vshowcol&cid=' + cid
                        ] : [];
                    });
                    console.log(`[SKANN] Kaller showcol (filter ${filterId}):`, showcolUrls);
                    for (const u of showcolUrls) {
                        await xhrRequest(u, { timeout: 10000 });
                    }
                }
                // Re-hent alle filtre med kolonner aktivert
                dispatchData = await hentDispatchData();
                mangler = (krevde[sjekkType] || []).filter(k => dispatchData.manglendeKolonner.has(k));
                console.log(`[SKANN] Etter showcol: mangler=[${mangler.join(', ')}], rader=${dispatchData.rader.length}`);

            } catch (e) {
                console.warn('[SKANN] showcol-kall feilet:', e);
            }
        } else {
            console.log(`[SKANN] Alle krevde kolonner OK for ${sjekkType}`);
        }

        const { rader, manglendeKolonner } = dispatchData;
        const totalt = rader.length;
        const advarsler = [];

        // Advar om maks rader (per filter, ikke kombinert total)
        if (dispatchData.avkortedeFiltre && dispatchData.avkortedeFiltre.length > 0) {
            const fNavn = dispatchData.avkortedeFiltre.map(fid => {
                const f = RFILTER_VALG.find(v => v.id === fid);
                return f ? f.navn : String(fid);
            }).join(', ');
            advarsler.push({ type: 'red', tekst: `&#9888; Maks antall rader nådd i filter: ${fNavn}. Ikke alle turer vises.` });
        }

        // Advar om manglende kolonner (men fortsett skannet)
        if (mangler.length > 0) {
            advarsler.push({ type: 'red', tekst: `&#9888; Klarte ikke aktivere kolonne ${mangler.join(' og ')}. Retningsdeteksjon kan mangle.` });
        }

        // Ledsager-advarsel for barn
        if (sjekkType === 'barn' && manglendeKolonner.has('L')) {
            advarsler.push({ type: 'red', tekst: '&#9888; Ledsager-kolonnen (L) mangler. Kan ikke sjekke barn uten ledsager.' });
        }

        let funn;
        const statusFn = (txt) => visLasteStatus(txt);

        console.log(`[SKANN] Kjører sjekk: ${sjekkType} med ${rader.length} rader`);

        switch (sjekkType) {
            case 'barn':
                visLasteStatus('Sjekker barn...');
                funn = await sjekkBarn(rader, statusFn);
                break;
            case 'pnr':
                visLasteStatus('Sjekker PNR...');
                funn = sjekkPnr(rader);
                break;
            case 'dublett':
                visLasteStatus('Sjekker dubletter...');
                funn = await sjekkDublett(rader, statusFn);
                break;
            case 'adresse':
                visLasteStatus('Sjekker adresser...');
                funn = await sjekkAdresse(rader, statusFn);
                break;
            case 'kommune':
                visLasteStatus('Sjekker kommunegrense...');
                funn = await sjekkKommune(rader, statusFn);
                break;
            default:
                funn = [];
        }

        console.log(`[SKANN] Ferdig: ${sjekkType} -- ${funn.length} funn av ${totalt} rader`);
        // Logg skann-snapshot til sentral logg
        const antallAvvik = funn.filter(f => !f.kanskjePostnr).length;
        const antallKanskje = funn.filter(f => f.kanskjePostnr).length;
        loggHandling('SKANN_FERDIG', {
            seksjon: sjekkType,
            detaljer: JSON.stringify({ skannet: totalt, funn: funn.length, avvik: antallAvvik, kanskje: antallKanskje })
        });
        visLasteStatus('');
        visResultater(funn, sjekkType, totalt, null, advarsler, dispatchData.avkortedeFiltre, dispatchData.filterTelling);
    }

    // ==================================================================
    //    VIS RESULTATER                                                
    // ==================================================================
    function visResultater(funn, type, totalt, feilmelding, advarsler, avkortedeFiltre, filterTelling) {
        const win = window.mqWin;
        if (!win || win.closed) return;
        const cont = win.document.getElementById('container');
        const statsBar = win.document.getElementById('statsBar');
        if (!cont) return;

        // Sortering: fremtidige turer først (tidligst først), deretter passerte (tidligst først)
        const naaMs = Date.now();
        const hentStartMs = (f) => {
            // Dublett: bruk tidligste av de to reisene
            if (f.reise1 && f.reise2) return Math.min(parseTidMs(f.reise1.start) || 9e12, parseTidMs(f.reise2.start) || 9e12);
            return parseTidMs(f.start) || 9e12;
        };
        funn.sort((a, b) => {
            const aMs = hentStartMs(a), bMs = hentStartMs(b);
            const aPassert = aMs <= naaMs ? 1 : 0;
            const bPassert = bMs <= naaMs ? 1 : 0;
            if (aPassert !== bPassert) return aPassert - bPassert; // fremtidige først
            return aMs - bMs; // innenfor gruppe: tidligst først (dato+tid)
        });

        // Stats — samlet visning
        if (statsBar) {
            const typeNavn = { barn: 'Barn', pnr: 'PNR', dublett: 'Dublett', adresse: 'Adresse', kommune: 'Kommune' };
            let deler = [];
            if (type === 'kommune') {
                const antVedtak  = funn.filter(f => f.vedtakGodkjent).length;
                const antKanskje = funn.filter(f => f.kanskjeSykehus).length;
                const antVanlige = funn.length - antKanskje - antVedtak;
                deler.push(`<strong style="color:#dc2626;">&#9888;&#65039; ${antVanlige} avvik</strong>`);
                if (antKanskje > 0) deler.push(`<strong style="color:#d97706;">&#127973; ${antKanskje} kanskje</strong>`);
                if (antVedtak  > 0) deler.push(`<strong style="color:#16a34a;">&#9989; ${antVedtak} vedtak</strong>`);
            } else if (type === 'adresse') {
                const antKanskje = funn.filter(f => f.kanskjePostnr).length;
                const antVanlige = funn.length - antKanskje;
                deler.push(`<strong style="color:#dc2626;">&#9888;&#65039; ${antVanlige} avvik</strong>`);
                if (antKanskje > 0) deler.push(`<strong style="color:#d97706;">&#127973; ${antKanskje} kanskje</strong>`);
            } else {
                deler.push(`<strong style="color:${funn.length > 0 ? '#dc2626' : '#16a34a'};">&#9888;&#65039; ${funn.length} funn</strong>`);
            }
            deler.push(`<span>${funn.length} funn</span>`);
            deler.push(`<span>Skannet: ${totalt} reiser</span>`);
            const statsHtml = `<span>${typeNavn[type] || type}: ${deler.join(' <span style="color:#cbd5e1;">/</span> ')}</span>`;
            statsBar.innerHTML = statsHtml;
            statsBar.style.display = '';
        }

        let html = '<div class="oppdater-bar">';
        html += '<button class="tilbake-btn" style="margin-bottom:0;" onclick="window._avvikCh.postMessage({type:\'TILBAKE\'})">&larr; Tilbake</button>';
        html += '<button class="btn-oppdater" onclick="window._avvikCh.postMessage({type:\'OPPDATER\'})">&#8635; Oppdater</button>';
        html += '<label class="autorefresh-label"><input type="checkbox" id="autoRefreshCheck" onchange="window._avvikCh.postMessage({type:\'TOGGLE_AUTOREFRESH\', checked:this.checked})">Auto-oppdater</label>';
        html += '<span id="autoRefreshCountdown" class="autorefresh-countdown"></span>';
        if (type === 'adresse' || type === 'kommune') {
            html += '<button class="info-btn" style="background:#10b981; margin-left:auto;" onclick="window._avvikCh.postMessage({type:\'VIS_ADR_MODAL\', kortType:\'' + type + '\'})">&#128205; ' + (type === 'adresse' ? 'Adresser' : 'Kommune-adresser') + '</button>';
        }
        html += '</div>';

        // Advarsler
        if (advarsler && advarsler.length > 0) {
            advarsler.forEach(a => {
                html += `<div class="warn-banner ${a.type}">${a.tekst}</div>`;
            });
        }

        if (feilmelding) {
            html += `<div class="warn-banner red">${feilmelding}</div>`;
        }

        if (funn.length === 0) {
            html += '<div style="text-align:center; padding:50px; color:#10b981; font-size:18px; font-weight:bold;">&#10004; Ingen funn</div>';
        } else if (type === 'kommune' && funn.length > 0) {
            // Split: avvik / kanskje-sykehus / vedtak-godkjente
            const vedtakGodkjente = funn.filter(f => f.vedtakGodkjent);
            const vanlige = funn.filter(f => !f.kanskjeSykehus && !f.vedtakGodkjent);
            const kanskje = funn.filter(f => f.kanskjeSykehus);

            // Kolonne 1: Avvik (røde)
            let avvikHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef2f2; border:1px solid #ef4444; border-radius:8px; font-weight:600; font-size:14px; color:#991b1b; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#9888;&#65039;</span> Avvik: ${vanlige.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #ef4444; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 1 — Tabell (dispatch):</strong><br>
                        Postnr fra pasientadresse og destinasjon sammenlignes. Ulik kommune = flagget.<br>
                        M\u00f8teplasser filtreres helt bort. Spesialord, spesialist-kombi og rute-kombi <strong>bekrefter</strong> avvik.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Full adresse hentes fra admin. Sjekkes mot godkjente behandlingssted-adresser.<br>
                        Treff = flyttet til kanskje-kolonnen.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Pasient reiser til annen kommune — bekreftet av kriterier eller uten kjent behandlingssted.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">M\u00f8teplasser (filtrert bort):</strong><br>${MOTEPLASS_ORD.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Spesialord (bekrefter avvik):</strong><br>${SPESIALIST_ORD.join(', ') || '(ingen)'}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Spesialist-kombi (bekrefter avvik):</strong><br>${SPESIALIST_KOMBI.map(k => k.ord + ' @ ' + k.postnr).join(', ') || '(ingen)'}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Rute-kombo (bekrefter avvik):</strong><br>${RUTE_KOMBI.map(k => k.a + ' \u2194 ' + k.b).join(', ') || '(ingen)'}</div>
                    <div><strong style="color:#991b1b;">Godkjente adresser (runde 2):</strong><br>${godkjenteKommuneAdresserGH.map(g => typeof g === 'string' ? g : (g.adresse + (g.postnr ? ', ' + g.postnr : ''))).join(', ') || '(ingen)'}</div>
                </div>
            </div>`;
            for (const f of vanlige) {
                avvikHtml += renderKort(f);
            }

            // Kolonne 2: Kanskje (kun postnummer) med hover-info
            let kanskjeHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; font-weight:600; font-size:14px; color:#92400e; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#127973;</span> Kanskje (postnummer): ${kanskje.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #f59e0b; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Reiser som krysser kommunegrense, men destinasjons-postnr matcher et kjent sykehusomr\u00e5de. Sortert hit for manuell vurdering.</div>
                    <div><strong style="color:#92400e;">Sykehus-postnummer:</strong><br>${SYKEHUS_POSTNR.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ') || '(ingen)'}</div>
                </div>
            </div>`;
            for (const f of kanskje) {
                kanskjeHtml += renderKort(f);
            }

            // Kolonne 3: Statistikk
            const destTelling = {};
            for (const f of vanlige) {
                const navn = f.destNavn || '(ukjent)';
                destTelling[navn] = (destTelling[navn] || 0) + 1;
            }
            const sortert = Object.entries(destTelling).sort((a, b) => b[1] - a[1]);

            let statsHtml = '<div class="stats-sidebar-inner">';
            statsHtml += '<h3>&#128202; Destinasjoner (' + sortert.length + ')</h3>';
            for (const [navn, ant] of sortert) {
                statsHtml += `<div class="dest-item"><span class="dest-navn" title="${navn}">${navn}</span><span class="dest-count">${ant}</span></div>`;
            }
            statsHtml += '</div>';

            // Kolonne 3b: Godkjent via vedtak (testvisning)
            let vedtakHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#dcfce7; border:1px solid #16a34a; border-radius:8px; font-weight:600; font-size:14px; color:#14532d;">
                &#9989; Godkjent via vedtak: ${vedtakGodkjente.length}
                <span style="font-weight:normal; font-size:11px; margin-left:8px; color:#166534;">Testvisning \u2014 disse filtreres bort n\u00e5r vedtak er verifisert</span>
            </div>`;
            for (const f of vedtakGodkjente) vedtakHtml += renderKort(f);

            html += '<div class="kommune-kolonner">';
            html += '<div class="kommune-kol kommune-kol-avvik">' + avvikHtml + '</div>';
            html += '<div class="kommune-kol kommune-kol-kanskje">' + kanskjeHtml + '</div>';
            if (vedtakGodkjente.length > 0) {
                html += '<div class="kommune-kol" style="min-width:320px;">' + vedtakHtml + '</div>';
            }
            html += '<div class="kommune-kol kommune-kol-stats">' + statsHtml + '</div>';
            html += '</div>';
        } else if (type === 'adresse' && funn.some(f => f.kanskjePostnr)) {
            // Split i avvik og kanskje-postnummer
            const vanlige = funn.filter(f => !f.kanskjePostnr);
            const kanskje = funn.filter(f => f.kanskjePostnr);

            // Kolonne 1: Avvik med hover-info for godkjente ord
            let avvikHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef2f2; border:1px solid #ef4444; border-radius:8px; font-weight:600; font-size:14px; color:#991b1b; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#9888;&#65039;</span> Avvik: ${vanlige.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #ef4444; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 1 — Tabell (dispatch):</strong><br>
                        Reiser filtreres bort hvis fra- eller til-adresse inneholder godkjente søkeord.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Folkeregistrert adresse sammenlignes med fra/til. Godkjente adresser sjekkes mot admin-data. Hvis match = fjernet.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 3 — Km-beregning:</strong><br>
                        Avstand fra folkereg til behandlingssted vs. bestilt reise. Hvis bestilt &lt;= folkereg = OK.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Reiser der bestilt adresse avviker fra folkeregistrert adresse.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente ord (eliminert i runde 1):</strong><br>${godkjenteOrdGH.join(', ')}</div>
                    <div><strong style="color:#991b1b;">Godkjente adresser (eliminert i runde 1):</strong><br>${godkjenteAdresserGH.map(a => visAdr(a)).join(', ')}</div>
                </div>
            </div>`;
            for (const f of vanlige) {
                avvikHtml += renderKort(f);
            }

            // Kolonne 2: Kanskje (postnummer)
            let kanskjeHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; font-weight:600; font-size:14px; color:#92400e; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#127973;</span> Postnummer: ${kanskje.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #f59e0b; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155;">
                    <div style="margin-bottom:8px; font-style:italic; color:#64748b;">Disse reisene har behandlingssted i et postnr-omr\u00e5de som kan v\u00e6re OK. Sortert hit for manuell vurdering.</div>
                    <div><strong style="color:#92400e;">Postnummer:</strong><br>${godkjenteKanskjePostnrGH.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ')}</div>
                </div>
            </div>`;
            for (const f of kanskje) {
                kanskjeHtml += renderKort(f);
            }

            // Kolonne 3: Statistikk — behandlingssted (admin-navn hvis tilgjengelig, ellers dispatch)
            const adrTelling = {};
            for (const f of funn) {
                // Prøv admin-navn først (fraNavn/tilNavn), deretter dispatch-HTML
                const harAdmin = f.adminData && (f.adminData.fraNavn || f.adminData.tilNavn);
                let navn = '';
                if (harAdmin) {
                    navn = f.erTur ? (f.adminData.tilNavn || '') : f.erTur === false ? (f.adminData.fraNavn || '') : (f.adminData.tilNavn || '');
                }
                if (!navn) {
                    const adrHtml = f.erTur ? f.tilHtml : f.erTur === false ? f.fraHtml : f.tilHtml;
                    const vis = formaterForVisning(adrHtml || '');
                    const linjer = vis.split('\n').filter(l => l.trim());
                    if (linjer.length < 2) continue;
                    navn = linjer[0].replace(/,\s*$/, '').trim();
                }
                if (!navn) continue;
                adrTelling[navn] = (adrTelling[navn] || 0) + 1;
            }
            const sortert = Object.entries(adrTelling).sort((a, b) => b[1] - a[1]);

            let statsHtml = '<div class="stats-sidebar-inner">';
            statsHtml += '<h3>&#128202; Steder (' + sortert.length + ')</h3>';
            for (const [navn, ant] of sortert) {
                statsHtml += `<div class="dest-item"><span class="dest-navn" title="${navn}">${navn}</span><span class="dest-count">${ant}</span></div>`;
            }
            statsHtml += '</div>';

            html += '<div class="kommune-kolonner">';
            html += '<div class="kommune-kol kommune-kol-avvik">' + avvikHtml + '</div>';
            html += '<div class="kommune-kol kommune-kol-kanskje">' + kanskjeHtml + '</div>';
            html += '<div class="kommune-kol kommune-kol-stats">' + statsHtml + '</div>';
            html += '</div>';
        } else if (type === 'adresse' && funn.length > 0) {
            // Adresse uten kanskje — kort + statistikk i 2 kolonner
            let kortHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef2f2; border:1px solid #ef4444; border-radius:8px; font-weight:600; font-size:14px; color:#991b1b; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#9888;&#65039;</span> Avvik: ${funn.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #ef4444; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 1 — Tabell (dispatch):</strong><br>
                        Reiser filtreres bort hvis fra- eller til-adresse inneholder godkjente søkeord.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Folkeregistrert adresse sammenlignes med fra/til. Godkjente adresser sjekkes mot admin-data. Hvis match = fjernet.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 3 — Km-beregning:</strong><br>
                        Avstand fra folkereg til behandlingssted vs. bestilt reise. Hvis bestilt &lt;= folkereg = OK.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Reiser der bestilt adresse avviker fra folkeregistrert adresse.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente ord (eliminert i runde 1):</strong><br>${godkjenteOrdGH.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente adresser (eliminert i runde 1):</strong><br>${godkjenteAdresserGH.map(a => visAdr(a)).join(', ')}</div>
                    <div><strong style="color:#991b1b;">Kanskje-postnr (kolonne 2):</strong><br>${godkjenteKanskjePostnrGH.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ')}</div>
                </div>
            </div>`;
            for (const f of funn) {
                kortHtml += renderKort(f);
            }

            const adrTelling = {};
            for (const f of funn) {
                const harAdmin = f.adminData && (f.adminData.fraNavn || f.adminData.tilNavn);
                let navn = '';
                if (harAdmin) {
                    navn = f.erTur ? (f.adminData.tilNavn || '') : f.erTur === false ? (f.adminData.fraNavn || '') : (f.adminData.tilNavn || '');
                }
                if (!navn) {
                    const adrHtml = f.erTur ? f.tilHtml : f.erTur === false ? f.fraHtml : f.tilHtml;
                    const vis = formaterForVisning(adrHtml || '');
                    const linjer = vis.split('\n').filter(l => l.trim());
                    if (linjer.length < 2) continue;
                    navn = linjer[0].replace(/,\s*$/, '').trim();
                }
                if (!navn) continue;
                adrTelling[navn] = (adrTelling[navn] || 0) + 1;
            }
            const sortert = Object.entries(adrTelling).sort((a, b) => b[1] - a[1]);

            let statsHtml = '<div class="stats-sidebar-inner">';
            statsHtml += '<h3>&#128202; Steder (' + sortert.length + ')</h3>';
            for (const [navn, ant] of sortert) {
                statsHtml += `<div class="dest-item"><span class="dest-navn" title="${navn}">${navn}</span><span class="dest-count">${ant}</span></div>`;
            }
            statsHtml += '</div>';

            html += '<div class="kommune-kolonner">';
            html += '<div class="kommune-kol kommune-kol-avvik">' + kortHtml + '</div>';
            html += '<div class="kommune-kol kommune-kol-stats">' + statsHtml + '</div>';
            html += '</div>';
        } else if (type === 'dublett') {
            html += `<div style="padding:8px 12px; margin-bottom:12px; background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; font-weight:600; font-size:14px; color:#92400e; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#9888;</span> Dobbeltbestillinger: ${funn.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #f59e0b; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155;">
                    <div style="margin-bottom:8px;"><strong style="color:#92400e;">Fase 1 — Tabell (filtrert bort):</strong><br>
                        Statuser: ikke møtt, bomtur, kansellert, avbestilt<br>
                        Reisemåte: RFLY<br>
                        Ulik dato: ikke dublett<br>
                        Ulik retning (tur+retur): ikke dublett<br>
                        Overgang (A.til = B.fra): ikke dublett
                    </div>
                    <div><strong style="color:#92400e;">Fase 2 — Admin (beriket):</strong><br>
                        Pasientnavn, meldinger til transportør og pasientreisekontoret
                    </div>
                </div>
            </div>`;
            for (const f of funn) {
                html += renderKort(f);
            }
        } else {
            for (const f of funn) {
                html += renderKort(f);
            }
        }

        cont.innerHTML = html;
        // Sett BroadcastChannel-referanse
        try { win._avvikCh = new BroadcastChannel(CHANNEL_NAME); } catch (e) {}
        // Bevar auto-refresh checkbox-tilstand
        const arCheck = win.document.getElementById('autoRefreshCheck');
        if (arCheck) arCheck.checked = autoRefreshAktiv;

        // Oppdater filterPanel -- tellere + maks-markering (checkboxer er statiske i HTML)
        const fp = win.document.getElementById('filterPanel');
        if (fp) {
            // Oppdater tellere
            if (filterTelling) {
                for (const fv of RFILTER_VALG) {
                    const countEl = fp.querySelector(`.rfilter-count[data-fid="${fv.id}"]`);
                    if (countEl) countEl.textContent = '(' + (filterTelling[fv.id] || 0) + ')';
                }
            }
            // Maks-markering
            fp.querySelectorAll('.filter-checkbox').forEach(el => {
                el.classList.remove('rfilter-max');
                el.style.borderColor = '#475569';
            });
            if (avkortedeFiltre && avkortedeFiltre.length > 0) {
                for (const fid of avkortedeFiltre) {
                    const cb = fp.querySelector(`.rfilter-cb[data-fid="${fid}"]`);
                    if (cb) {
                        cb.closest('.filter-checkbox').classList.add('rfilter-max');
                        cb.closest('.filter-checkbox').style.borderColor = '#ef4444';
                    }
                }
            }
        }
    }

    function renderKort(f) {
        const esc = (s) => (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const fraVis = formaterForVisning(f.fraHtml || '').replace(/\n/g, '<br>');
        const tilVis = formaterForVisning(f.tilHtml || '').replace(/\n/g, '<br>');

        if (f.type === 'barn') {
            const bRekNr = f.rekvirent || f.rekNr || '';
            const bCopyBtn = (val, label) => val ? `<span style="cursor:pointer; user-select:none;" title="Kopier ${label}" onclick="navigator.clipboard.writeText('${val}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : '';
            const bKlasse = f.saarbar ? 'barn-saarbar' : 'barn-alene';
            return `<div class="card ${bKlasse}" data-rid="${f.reqId}" data-rek="${bRekNr || f.rekNr || ""}">
                <div class="card-header">
                    <span>&#128118; BARN REISER ALENE -- ${f.pnavn || 'Ukjent'}, ${f.alder} år, 0 ledsagere</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${bRekNr ? 'Rek: ' + bRekNr + ' ' + bCopyBtn(bRekNr, 'rek.nr.') : ''}
                    </span>
                </div>
                <div class="card-body">
                    ${f.saarbar ? '<div style="margin-bottom:8px; padding:6px 10px; background:#dcfce7; border:1px solid #16a34a; border-radius:6px; font-size:12px; color:#14532d; display:flex; align-items:center; gap:8px;">&#9989; <strong>S\u00C5RBAR</strong>' + (f.vedtakNr ? ' &nbsp;|&nbsp; Vedtak: <code style="background:#bbf7d0; padding:1px 5px; border-radius:3px;">' + f.vedtakNr + '</code>' : '') + '<button onclick="window._avvikCh.postMessage({type:\'SKJUL_BARN_SAARBAR\', id:\'' + f.reqId + '\', turid:\'' + (f.turid || '') + '\', rekNr:\'' + (f.rekNr || '') + '\'})" style="margin-left:auto; padding:2px 10px; background:#16a34a; color:#fff; border:none; border-radius:4px; font-size:11px; cursor:pointer;" title="Skjul kortet — lagres som godkjent">Skjul</button></div>' : ''}
                    ${f.meldPasReise ? '<div style="margin-bottom:8px; padding:4px 8px; background:#f0fdf4; border-radius:4px; font-size:11px; color:#166534;"><strong>Melding pasientreise:</strong> ' + esc(f.meldPasReise) + '</div>' : ''}
                    <div class="row">
                    <div class="col">
                        <span class="label">Fra</span><span class="value">${f.start || ''}<br>${fraVis}</span>
                        <span class="label">Til</span><span class="value">${tilVis}</span>
                    </div>
                    <div class="col">
                        <span class="label">Status</span><span class="value">${f.status || '---'}</span>
                    </div>
                </div>
                </div>
                <div class="card-actions">
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'GODKJENN', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${f.rekNr || ''}'})">GODKJENN</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(bRekNr)}', rekvirent:''})">AVVIK</button>
                </div>
            </div>`;
        }

        if (f.type === 'pnr') {
            const pnrTurid = f.turid || '';
            const pnrCopy = (val, label) => val ? `<span style="cursor:pointer; user-select:none;" title="Kopier ${label}" onclick="navigator.clipboard.writeText('${val}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : '';
            return `<div class="card pnr" data-rid="${f.reqId}" data-rek="${f.rekNr || ""}">
                <div class="card-header">
                    <span>&#9888; MANGLER GYLDIG PERSONNUMMER${f.rmate ? ' — ' + f.rmate : ''}</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${pnrTurid ? 'Turid: ' + pnrTurid + ' ' + pnrCopy(pnrTurid, 'turid') : ''}
                    </span>
                </div>
                <div class="card-body">
                    <div style="display:flex; gap:16px; margin-bottom:8px; font-size:13px; color:#334155; flex-wrap:wrap;">
                        ${f.pnavn ? '<div><span class="label">Pasient</span><span class="value" style="font-weight:600;">' + f.pnavn + '</span></div>' : ''}
                        <div><span class="label">PNR i dispatch</span><span class="value" style="color:#dc2626; font-weight:600;">${f.pnr || '(tomt)'}</span></div>
                        ${f.start ? '<div><span class="label">Start</span><span class="value" style="font-weight:600;">' + f.start + '</span></div>' : ''}
                        ${f.oppmtid ? '<div><span class="label">Oppmøte</span><span class="value">' + f.oppmtid + '</span></div>' : ''}
                        ${f.status ? '<div><span class="label">Status</span><span class="value">' + f.status + '</span></div>' : ''}
                    </div>
                    <div class="row" style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">
                        <div class="col">
                            <span class="label">Fra</span>
                            <div class="value">${fraVis}</div>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:center; min-width:40px; max-width:40px; padding:0 4px;">
                            <span style="font-size:20px;">&#10145;&#65039;</span>
                        </div>
                        <div class="col">
                            <span class="label">Til</span>
                            <div class="value">${tilVis}</div>
                        </div>
                    </div>
                    ${f.rekvirent ? '<div style="margin-top:8px; font-size:12px; color:#64748b;">Rekvirent: <strong>' + f.rekvirent + '</strong></div>' : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'GODKJENN', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${f.rekNr || ''}'})">GODKJENN</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(f.rekNr || '')}', rekvirent:'${esc(f.rekvirent)}'})">AVVIK</button>
                </div>
            </div>`;
        }

        if (f.type === 'dublett') {
            const a = f.reise1, b = f.reise2;
            const aFra = formaterForVisning(a.fraHtml || '').replace(/\n/g, '<br>');
            const aTil = formaterForVisning(a.tilHtml || '').replace(/\n/g, '<br>');
            const bFra = formaterForVisning(b.fraHtml || '').replace(/\n/g, '<br>');
            const bTil = formaterForVisning(b.tilHtml || '').replace(/\n/g, '<br>');
            const retning = f.erTur === true ? 'TUR' : (f.erTur === false ? 'RETUR' : '?');
            const pasNavn = a.pnavn || (f.admin1 && f.admin1.pasientNavn) || '';
            const aMeld = f.admin1 ? [f.admin1.meldTransport, f.admin1.meldPasReise].filter(Boolean) : [];
            const bMeld = f.admin2 ? [f.admin2.meldTransport, f.admin2.meldPasReise].filter(Boolean) : [];

            return `<div class="card dublett" data-rid="${a.reqId}" data-rek="${a.rekNr || ""}">
                <div class="card-header">
                    <span>&#9888; DOBBELTBESTILLING (${retning})</span>
                    <span style="color:#94a3b8; font-weight:normal;">${pasNavn ? pasNavn + ' &mdash; ' : ''}PNR: ${a.pnr || '(mangler)'} ${a.pnr ? '<span style="cursor:pointer; user-select:none;" title="Kopier PNR" onclick="navigator.clipboard.writeText(\'' + a.pnr + '\'); this.textContent=\'\\u2705\'; setTimeout(() => this.textContent=\'\\ud83d\\udccb\', 1500)">&#128203;</span>' : ''}</span>
                </div>
                <div class="card-body"><div class="dublett-grid">
                    <div class="side">
                        <div class="side-header">REISE 1 -- Turid: ${a.turid || a.reqId}</div>
                        <span class="label">Start</span><span class="value" style="font-weight:600; font-size:14px;">${a.start || '---'}</span>
                        ${a.oppmtid ? '<span class="label">Oppmøte</span><span class="value">' + a.oppmtid + '</span>' : ''}
                        <span class="label">Status</span><span class="value">${a.status || '---'}</span>
                        <span class="label">Reisemåte</span><span class="value">${a.rmate || '---'}</span>
                        <span class="label">Fra</span><span class="value">${aFra}</span>
                        <span class="label">Til</span><span class="value">${aTil}</span>
                        ${aMeld.length > 0 ? '<div style="margin-top:4px; padding:4px 8px; background:#eff6ff; border-radius:4px; font-size:11px; color:#1e40af;">' + aMeld.map(m => '<div>' + m + '</div>').join('') + '</div>' : ''}
                    </div>
                    <div class="side">
                        <div class="side-header">REISE 2 -- Turid: ${b.turid || b.reqId}</div>
                        <span class="label">Start</span><span class="value" style="font-weight:600; font-size:14px;">${b.start || '---'}</span>
                        ${b.oppmtid ? '<span class="label">Oppmøte</span><span class="value">' + b.oppmtid + '</span>' : ''}
                        <span class="label">Status</span><span class="value">${b.status || '---'}</span>
                        <span class="label">Reisemåte</span><span class="value">${b.rmate || '---'}</span>
                        <span class="label">Fra</span><span class="value">${bFra}</span>
                        <span class="label">Til</span><span class="value">${bTil}</span>
                        ${bMeld.length > 0 ? '<div style="margin-top:4px; padding:4px 8px; background:#eff6ff; border-radius:4px; font-size:11px; color:#1e40af;">' + bMeld.map(m => '<div>' + m + '</div>').join('') + '</div>' : ''}
                    </div>
                </div></div>
                <div class="card-actions">
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'GODKJENN_DUBLETT', id1:'${a.reqId}', id2:'${b.reqId}', resId1:'${a.resId||''}', resId2:'${b.resId||''}', turid1:'${a.turid||''}', turid2:'${b.turid||''}'})">Ikke dobbeltbestilling</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK_DUBLETT', id:'${a.reqId}', resId:'${a.resId || ''}', turid1:'${a.turid || ''}', turid2:'${b.turid || ''}', start1:'${esc(a.start || '')}', start2:'${esc(b.start || '')}', rmate1:'${esc(a.rmate || '')}', rmate2:'${esc(b.rmate || '')}', rekNr:'${esc(a.rekNr || (f.admin1 && f.admin1.rekNr ? f.admin1.rekNr : ''))}', rekvirent:'${esc(a.rekvirent || (f.admin1 && f.admin1.rekvirent ? f.admin1.rekvirent : ''))}', bestiller:'${esc(f.admin1 && f.admin1.bestiller ? f.admin1.bestiller : '')}', ansvarligRekvirent:'${esc(f.admin1 && f.admin1.ansvarligRekvirent ? f.admin1.ansvarligRekvirent : '')}', sistEndretBruker:'${esc(f.admin1 && f.admin1.sistEndretBruker ? f.admin1.sistEndretBruker : '')}'})">AVVIK</button>
                </div>
            </div>`;
        }

        if (f.type === 'adresse') {
            // Bruk admin-adresser hvis tilgjengelig, ellers dispatch
            const harAdmin = f.adminData && (f.adminData.folk || f.adminData.fra || f.adminData.til);
            const folkVis = harAdmin && f.adminData.folk ? f.adminData.folk : formaterForVisning(f.padrHtml || '').replace(/\n/g, '<br>');
            const fraVisAdr = harAdmin && f.adminData.fra ? f.adminData.fra : fraVis;
            const tilVisAdr = harAdmin && f.adminData.til ? f.adminData.til : tilVis;
            const adminTag = harAdmin ? ' <span style="color:#22c55e; font-size:10px;" title="Verifisert mot admin">&#9989;</span>' : '';

            const fraNavn = harAdmin && f.adminData.fraNavn ? f.adminData.fraNavn : '';
            const tilNavn = harAdmin && f.adminData.tilNavn ? f.adminData.tilNavn : '';
            const retning = f.erTur === true ? 'TUR' : (f.erTur === false ? 'RETUR' : '?');

            // Alltid: Hentested → Leveringssted (fra → til i admin)
            const henteNavn = fraNavn;
            const henteAdr = fraVisAdr;
            const leverNavn = tilNavn;
            const leverAdr = tilVisAdr;

            const rekNr = harAdmin && f.adminData.rekNr ? f.adminData.rekNr : '';

            // Km-resultat: sjekk cache først, deretter kmInfo fra auto-km
            const folkTekst = f.folkAdrTekst || (harAdmin && f.adminData.folk ? f.adminData.folk : formaterForVisning(f.padrHtml));
            const behandlingsAdr = f.erTur ? (f.tilAdrTekst || (harAdmin && f.adminData.til ? f.adminData.til : formaterForVisning(f.tilHtml))) : (f.fraAdrTekst || (harAdmin && f.adminData.fra ? f.adminData.fra : formaterForVisning(f.fraHtml)));
            const bestiltFraAdr = f.erTur ? (harAdmin && f.adminData.fra ? f.adminData.fra : fraVis) : (harAdmin && f.adminData.til ? f.adminData.til : tilVis);

            // Gjenopprett kmInfo fra klient-cache hvis den mangler
            if (!f.kmInfo && rekNr) {
                const cached = hentKmFraCache(rekNr);
                if (cached) {
                    f.kmInfo = { folkKm: cached.folkKm, bestiltKm: cached.bestiltKm, kilde: 'local' };
                }
            }

            // Kilde-ikon: 🏠 = lokal (per rekvisisjon), 🌐 = server (delt), ⚡ = ferskt kall
            const kmKildeIkon = f.kmInfo && f.kmInfo.kilde === 'local'  ? '<span title="Lokal cache (samme rekvisisjon)" style="opacity:0.7;">&#127968;</span> '
                              : f.kmInfo && f.kmInfo.kilde === 'global' ? '<span title="Server-cache (delt mellom brukere)" style="opacity:0.7;">&#127760;</span> '
                              : f.kmInfo && f.kmInfo.kilde === 'live'   ? '<span title="Ferskt Google-kall" style="opacity:0.7;">&#9889;</span> '
                              : '';

            let kmHtml = '';
            if (f.kmInfo && f.kmInfo.folkKm !== null && f.kmInfo.bestiltKm !== null) {
                const kmAvvik = f.kmInfo.bestiltKm > f.kmInfo.folkKm;
                const kmStil = kmAvvik
                    ? 'background:#fef2f2; border-color:#ef4444; color:#991b1b;'
                    : 'background:#f0fdf4; border-color:#10b981; color:#065f46;';
                kmHtml = `<div class="warning-text" style="${kmStil}">
                    ${kmKildeIkon}Bestilt: ${f.kmInfo.bestiltKm.toFixed(1)} km &nbsp;|&nbsp; Folkereg: ${f.kmInfo.folkKm.toFixed(1)} km
                    ${!kmAvvik ? ' &#10004; OK' : ''}
                </div>`;
            } else if (f.kmInfo) {
                const bKm = f.kmInfo.bestiltKm !== null ? f.kmInfo.bestiltKm.toFixed(1) + ' km' : '?';
                const fKm = f.kmInfo.folkKm !== null ? f.kmInfo.folkKm.toFixed(1) + ' km' : '?';
                kmHtml = `<div class="warning-text">Bestilt: ${bKm} &nbsp;|&nbsp; Folkereg: ${fKm}</div>`;
            }

            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(folkTekst)}&destination=${encodeURIComponent(behandlingsAdr)}`;
            const kmFeilet = f.kmInfo && (f.kmInfo.folkKm === null || f.kmInfo.bestiltKm === null);
            const mapsHtml = kmFeilet ? ` <a href="${mapsUrl}" target="_blank" style="text-decoration:none;" title="Km-beregning feilet — sjekk i Google Maps">&#128205;</a>` : '';

            const reisemate = f.rmate || '';
            const turid = f.turid || '';
            const copyBtn = (val, label) => val ? `<span style="cursor:pointer; user-select:none;" title="Kopier ${label}" onclick="navigator.clipboard.writeText('${val}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : '';

            // Kommune fra postnummer
            const folkKommune = hentKommune(hentPostnr(folkVis.replace(/<br>/g, ' ')));
            const henteKommune = hentKommune(hentPostnr(henteAdr.replace(/<br>/g, ' ')));
            const leverKommune = hentKommune(hentPostnr(leverAdr.replace(/<br>/g, ' ')));

            const adrKanskje = f.kanskjePostnr;
            const adrKlasse = adrKanskje ? 'adresse-kanskje' : '';
            const adrPrikk = adrKanskje ? '&#128992;' : '&#128308;';

            return `<div class="card ${adrKlasse}" data-rid="${f.reqId}" data-resid="${f.resId || ''}" data-rek="${rekNr || f.rekNr || ''}">
                <div class="card-header">
                    <span>${adrPrikk} ${adrKanskje ? 'ADRESSEAVVIK (' + retning + ') — Postnr' : 'ADRESSEAVVIK (' + retning + ')'}${reisemate ? ' — ' + reisemate : ''}${adminTag}</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${turid ? 'Turid: ' + turid + ' ' + copyBtn(turid, 'turid') : ''}
                        ${rekNr ? (turid ? '&nbsp;| ' : '') + 'Rek: ' + rekNr + ' ' + copyBtn(rekNr, 'rek.nr.') : '<span id="rekNr-' + f.reqId + '"></span>'}
                    </span>
                </div>
                <div class="card-body">
                    <div id="km-${f.reqId}">${kmHtml}</div>
                    <div style="display:flex; gap:16px; margin-bottom:8px; font-size:13px; color:#334155; flex-wrap:wrap;">
                        ${f.pnavn || (harAdmin && f.adminData.pasientNavn) ? '<div><span class="label">Pasient</span><span class="value" style="font-weight:600;">' + (f.pnavn || f.adminData.pasientNavn) + '</span></div>' : ''}
                        ${f.pnr ? '<div><span class="label">PNR</span><span class="value">' + f.pnr + '</span></div>' : ''}
                        ${f.start ? '<div><span class="label">Start</span><span class="value" style="font-weight:600;">' + f.start + '</span></div>' : ''}
                        ${f.oppmtid ? '<div><span class="label">Oppmøte</span><span class="value">' + f.oppmtid + '</span></div>' : ''}
                        ${f.status ? '<div><span class="label">Status</span><span class="value">' + f.status + '</span></div>' : ''}
                    </div>
                    ${harAdmin && f.adminData.telefoner && f.adminData.telefoner.length ? '<div style="margin-bottom:8px; padding:6px 10px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; font-size:13px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-right:8px;">Telefon</span>' + f.adminData.telefoner.map(t => '<a href="tel:' + t.nr.replace(/[^+0-9]/g,'') + '" style="color:#2563eb;text-decoration:none;font-weight:600;">' + t.nr + '</a> <span style="color:#94a3b8;font-size:11px;font-weight:normal;">(' + t.kilde + ')</span>').join(' &nbsp;|&nbsp; ') + '</div>' : ''}
                    <div style="margin-bottom:8px;">
                        <span class="label">Folkeregistrert adresse</span>
                        <div class="value">${folkVis}${mapsHtml}${folkKommune ? '<br><span style="font-size:11px; color:#6b7280;">Kommune: ' + folkKommune + '</span>' : ''}</div>
                    </div>
                    <div class="row" style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">
                        <div class="col">
                            <span class="label">Hentested</span>
                            ${henteNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + henteNavn + '</div>' : ''}
                            <div class="value">${henteAdr}${henteKommune ? '<br><span style="font-size:11px; color:#6b7280;">Kommune: ' + henteKommune + '</span>' : ''}</div>
                            ${harAdmin && f.adminData.fraKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.fraKommentar + '</div>' : ''}
                        </div>
                        <div style="display:flex; align-items:center; justify-content:center; min-width:40px; max-width:40px; padding:0 4px;">
                            <span style="font-size:20px;">&#10145;&#65039;</span>
                        </div>
                        <div class="col">
                            <span class="label">Leveringssted</span>
                            ${leverNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + leverNavn + '</div>' : ''}
                            <div class="value">${leverAdr}${leverKommune ? '<br><span style="font-size:11px; color:#6b7280;">Kommune: ' + leverKommune + '</span>' : ''}</div>
                            ${harAdmin && f.adminData.tilKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.tilKommentar + '</div>' : ''}
                        </div>
                    </div>
                    ${harAdmin && f.adminData.meldTransport ? '<div style="margin-top:8px; padding:4px 8px; background:#eff6ff; border-radius:4px; font-size:11px; color:#1e40af;"><strong>Melding transport:</strong> ' + f.adminData.meldTransport + '</div>' : ''}
                    ${harAdmin && f.adminData.meldPasReise ? '<div style="margin-top:4px; padding:4px 8px; background:#f0fdf4; border-radius:4px; font-size:11px; color:#166534;"><strong>Melding pasientreise:</strong> ' + f.adminData.meldPasReise + '</div>' : ''}
                    ${f.altAdresser && f.altAdresser.length > 0 ? '<div style="margin-top:6px; padding:6px 10px; background:#fefce8; border:1px solid #ca8a04; border-radius:6px; font-size:11px; color:#713f12;">&#127968; <strong>Alt. adresse registrert, ingen match:</strong> ' + f.altAdresser.map(a => esc(a.adresse) + (a.aktiv ? ' <strong>(aktiv)</strong>' : '')).join(' | ') + '</div>' : ''}
                    ${f.godkjentAdresseavvik ? '<div style="margin-top:4px; padding:4px 8px; background:#f0fdf4; border-radius:4px; font-size:11px; color:#166534;">&#9989; <strong>Godkjent adresseavvik</strong> registrert på pasienten</div>' : ''}
                </div>
                <div class="card-actions">
                    ${!f.kmInfo ? `<button class="btn-nissy" id="btnKm-${f.reqId}" onclick="window._avvikCh.postMessage({type:'BEREGN_KM', reqId:'${f.reqId}', resId:'${f.resId || ''}', rekNr:'${esc(rekNr)}', turDato:'${(f.start || '').match(/\\d{1,2}\\.\\d{1,2}/) ? f.start.match(/(\\d{1,2}\\.\\d{1,2})/)[1] : ''}'})">&#128207; Beregn km</button>` : ''}
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'VIS_GODKJENN_MODAL', reqId:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(rekNr)}', kortType:'adresse', kanskje:${!!adrKanskje}, erTur:${f.erTur === true ? 'true' : f.erTur === false ? 'false' : 'null'}, henteAdr:'${esc(henteAdr)}', leverAdr:'${esc(leverAdr)}', henteNavn:'${esc(henteNavn)}', leverNavn:'${esc(leverNavn)}', folkAdr:'${esc(folkVis.replace(/<br>/g, ", "))}' })">GODKJENN</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(rekNr || f.rekNr || '')}', rekvirent:'${esc(f.rekvirent || (harAdmin && f.adminData.rekvirent ? f.adminData.rekvirent : ''))}', bestiller:'${esc(harAdmin && f.adminData.bestiller ? f.adminData.bestiller : '')}', ansvarligRekvirent:'${esc(harAdmin && f.adminData.ansvarligRekvirent ? f.adminData.ansvarligRekvirent : '')}', sistEndretBruker:'${esc(harAdmin && f.adminData.sistEndretBruker ? f.adminData.sistEndretBruker : '')}'})">AVVIK</button>
                </div>
            </div>`;
        }

        if (f.type === 'kommune') {
            const kTurid = f.turid || '';
            const kCopyBtn = (val, label) => val ? `<span style="cursor:pointer; user-select:none;" title="Kopier ${label}" onclick="navigator.clipboard.writeText('${val}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : '';
            const kRekNr = f.rekNr || (f.adminData && f.adminData.rekNr ? f.adminData.rekNr : '');
            const kHarAdmin = f.adminData && (f.adminData.fra || f.adminData.til);
            const kAdminTag = kHarAdmin ? ' <span style="color:#22c55e; font-size:10px;" title="Verifisert mot admin">&#9989;</span>' : '';
            const kKanskje = f.kanskjeSykehus;
            const kKlasse = kKanskje ? 'kommunegrense-kanskje' : 'kommunegrense';
            const kLabel = kKanskje ? '&#127973; POSTNUMMER/SPESIALORD' : '&#9888;&#65039; KOMMUNEGRENSE';
            const kWarnBg = kKanskje ? 'background:#fef3c7; border-color:#f59e0b; color:#92400e;' : 'background:#fef2f2; border-color:#ef4444; color:#991b1b;';

            // Admin-adresser for behandlingssted
            const kFraNavn = kHarAdmin && f.adminData.fraNavn ? f.adminData.fraNavn : '';
            const kFraAdr = kHarAdmin && f.adminData.fra ? f.adminData.fra : '';
            const kTilNavn = kHarAdmin && f.adminData.tilNavn ? f.adminData.tilNavn : '';
            const kTilAdr = kHarAdmin && f.adminData.til ? f.adminData.til : '';
            const kFolkAdr = kHarAdmin && f.adminData.folk ? f.adminData.folk : '';
            const kPasNavn = kHarAdmin && f.adminData.pasientNavn ? f.adminData.pasientNavn : '';
            const kPnr = kHarAdmin && f.adminData.pnr ? f.adminData.pnr : '';
            const kMeldTrans = kHarAdmin && f.adminData.meldTransport ? f.adminData.meldTransport : '';
            const kMeldPasReise = kHarAdmin && f.adminData.meldPasReise ? f.adminData.meldPasReise : '';

            // Kommune — bruk API-verifiserte verdier fra runde 3 hvis tilgjengelig
            const kFolkKommune = hentKommune(hentPostnr((kFolkAdr || '').replace(/<br>/g, ' ')));
            const kHenteKommune = f.pasientKommune || hentKommune(hentPostnr((kFraAdr || fraVis).replace(/<br>/g, ' ')));
            const kLeverKommune = f.behandlingsstedKommune || hentKommune(hentPostnr((kTilAdr || tilVis).replace(/<br>/g, ' ')));
            const geoBadge = (kilde) => {
                if (kilde === 'geonorge') return ' <span title="Verifisert via Geonorge API" style="font-size:9px; background:#dcfce7; color:#16a34a; padding:1px 4px; border-radius:3px; font-weight:600;">GEO</span>';
                if (kilde === 'geo-feilet') return ' <span title="Geonorge fant ikke adressen — bruker postnr" style="font-size:9px; background:#fee2e2; color:#dc2626; padding:1px 4px; border-radius:3px; font-weight:600;">GEO</span>';
                return '';
            };
            const kKommuneSpan = (k, kilde) => k ? '<br><span style="font-size:11px; color:#6b7280;">Kommune: ' + k + geoBadge(kilde) + '</span>' : '';

            return `<div class="card ${kKlasse}" data-rid="${f.reqId}" data-rek="${kRekNr || f.rekNr || ""}">
                <div class="card-header">
                    <span>${kLabel}${kAdminTag}</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${kTurid ? 'Turid: ' + kTurid + ' ' + kCopyBtn(kTurid, 'turid') : ''}
                        ${kRekNr ? (kTurid ? '&nbsp;| ' : '') + 'Rek: ' + kRekNr + ' ' + kCopyBtn(kRekNr, 'rek.nr.') : '<span id="rekNr-' + f.reqId + '"></span>'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="warning-text" style="${kWarnBg}">
                        Fra: ${f.pasientKommune} &rarr; Til: ${f.behandlingsstedKommune}
                    </div>
                    ${f.kanskjeGrunn ? '<div style="margin:2px 0 4px; padding:3px 8px; background:#fef9e7; border-radius:4px; font-size:11px; color:#92400e;">Treff: <strong>' + f.kanskjeGrunn + '</strong></div>' : (f.avvikGrunn ? '<div style="margin:2px 0 4px; padding:3px 8px; background:#fef2f2; border-radius:4px; font-size:11px; color:#991b1b;">Bekreftet: <strong>' + f.avvikGrunn + '</strong></div>' : '')}
                    <div style="display:flex; gap:16px; margin-bottom:8px; font-size:13px; color:#334155; flex-wrap:wrap;">
                        ${kPasNavn ? '<div><span class="label">Pasient</span><span class="value" style="font-weight:600;">' + kPasNavn + '</span></div>' : ''}
                        ${kPnr ? '<div><span class="label">PNR</span><span class="value">' + kPnr + '</span></div>' : ''}
                        ${f.start ? '<div><span class="label">Start</span><span class="value" style="font-weight:600;">' + f.start + '</span></div>' : ''}
                        ${f.oppmtid ? '<div><span class="label">Oppmøte</span><span class="value">' + f.oppmtid + '</span></div>' : ''}
                        ${f.status ? '<div><span class="label">Status</span><span class="value">' + f.status + '</span></div>' : ''}
                    </div>
                    ${kHarAdmin && f.adminData.telefoner && f.adminData.telefoner.length ? '<div style="margin-bottom:8px; padding:6px 10px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; font-size:13px;"><span style="color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-right:8px;">Telefon</span>' + f.adminData.telefoner.map(t => '<a href="tel:' + t.nr.replace(/[^+0-9]/g,'') + '" style="color:#2563eb;text-decoration:none;font-weight:600;">' + t.nr + '</a> <span style="color:#94a3b8;font-size:11px;font-weight:normal;">(' + t.kilde + ')</span>').join(' &nbsp;|&nbsp; ') + '</div>' : ''}
                    ${kFolkAdr ? '<div style="margin-bottom:8px;"><span class="label">Folkeregistrert adresse</span><div class="value">' + kFolkAdr + kKommuneSpan(kFolkKommune) + '</div></div>' : ''}
                    ${kHarAdmin ? '<div class="row" style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;"><div class="col"><span class="label">Hentested</span>' + (kFraNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + kFraNavn + '</div>' : '') + '<div class="value">' + (kFraAdr || fraVis) + kKommuneSpan(kHenteKommune, f.fraKilde) + '</div>' + (f.adminData.fraKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.fraKommentar + '</div>' : '') + '</div><div style="display:flex; align-items:center; justify-content:center; min-width:40px; max-width:40px; padding:0 4px;"><span style="font-size:20px;">&#10145;&#65039;</span></div><div class="col"><span class="label">Leveringssted</span>' + (kTilNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + kTilNavn + '</div>' : '') + '<div class="value">' + (kTilAdr || tilVis) + kKommuneSpan(kLeverKommune, f.tilKilde) + '</div>' + (f.adminData.tilKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.tilKommentar + '</div>' : '') + '</div></div>' : (!kKanskje ? '<div style="margin-bottom:8px; padding:6px 10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; font-size:11px; color:#92400e;">&#9888; Admin ikke tilgjengelig — viser kun data fra tabell. <a href="https://pastrans-sorost.mq.nhn.no/administrasjon/" target="_blank" style="color:#1d4ed8; text-decoration:underline;">Logg inn i admin</a> og skann p\u00e5 nytt for full info.</div>' : '') + '<div class="row"><div class="col"><span class="label">Fra</span><span class="value">' + (f.start || '') + '<br>' + fraVis + kKommuneSpan(kHenteKommune, f.fraKilde) + '</span><span class="label">Til</span><span class="value">' + tilVis + kKommuneSpan(kLeverKommune, f.tilKilde) + '</span></div><div class="col"><span class="label">Rekvirent</span><span class="value">' + (f.rekvirent || '---') + '</span><span class="label">Status</span><span class="value">' + (f.status || '---') + '</span></div></div>'}
                    ${f.vedtakData ? '<div style="margin-top:6px; padding:6px 10px; background:#dcfce7; border:1px solid #16a34a; border-radius:6px; font-size:12px; color:#14532d; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">&#9989; <strong>Vedtak funnet:</strong>&nbsp;' + esc(f.vedtakData.saksnummer || f.vedtakData.kort_id || '') + (f.vedtakData.formaal ? ' &mdash; ' + esc(f.vedtakData.formaal) : '') + ' &nbsp;|&nbsp; Gyldig til <strong>' + esc(f.vedtakData.gyldig_tom || '') + '</strong>' + (f.vedtakData.kategori ? ' &nbsp;<span style="background:#bbf7d0; padding:1px 5px; border-radius:3px; font-size:11px;">' + esc(f.vedtakData.kategori) + '</span>' : '') + '</div>' : ''}
                    ${f.meldingAntyder ? '<div style="margin-top:6px; padding:6px 10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; font-size:12px; color:#92400e; display:flex; align-items:flex-start; gap:8px;">&#9888;&#65039; <span><strong>Melding antyder godkjenning \u2014 ikke funnet i vedtak-DB</strong><br><span style="font-size:11px; color:#78350f;">' + esc(f.meldingAntyder.substring(0, 120)) + (f.meldingAntyder.length > 120 ? '\u2026' : '') + '</span></span></div>' : ''}
                    ${kMeldTrans ? '<div style="margin-top:6px; padding:4px 8px; background:#eff6ff; border-radius:4px; font-size:11px; color:#1e40af;"><strong>Melding transport:</strong> ' + kMeldTrans + '</div>' : ''}
                    ${kMeldPasReise ? '<div style="margin-top:4px; padding:4px 8px; background:#f0fdf4; border-radius:4px; font-size:11px; color:#166534;"><strong>Melding pasientreise:</strong> ' + kMeldPasReise + '</div>' : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'VIS_GODKJENN_MODAL', reqId:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(kRekNr)}', kortType:'kommune', kanskje:${!!kKanskje}, erTur:${f.erTur === true ? 'true' : f.erTur === false ? 'false' : 'null'}, destNavn:'${esc(f.destNavn || '')}', pasientKommune:'${esc(f.pasientKommune || '')}', destKommune:'${esc(f.behandlingsstedKommune || '')}', henteAdr:'${esc(kFraAdr || fraVis)}', leverAdr:'${esc(kTilAdr || tilVis)}', henteNavn:'${esc(kFraNavn || '')}', leverNavn:'${esc(kTilNavn || '')}', destPostnr:'${esc(f.destPostnr || '')}', apiVerifisert:${!!f.apiVerifisert} })">GODKJENN</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(kRekNr || f.rekNr || '')}', rekvirent:'${esc(f.rekvirent || (kHarAdmin && f.adminData.rekvirent ? f.adminData.rekvirent : ''))}', bestiller:'${esc(kHarAdmin && f.adminData.bestiller ? f.adminData.bestiller : '')}', ansvarligRekvirent:'${esc(kHarAdmin && f.adminData.ansvarligRekvirent ? f.adminData.ansvarligRekvirent : '')}', sistEndretBruker:'${esc(kHarAdmin && f.adminData.sistEndretBruker ? f.adminData.sistEndretBruker : '')}'})">AVVIK</button>
                </div>
            </div>`;
        }

        return '';
    }

    // ==================================================================
    //    FANE-HÅNDTERING                                               
    // ==================================================================
    function visLasteStatus(tekst) {
        const win = window.mqWin;
        if (!win || win.closed) return;
        const el = win.document.getElementById('loadingStatus');
        if (!el) return;
        if (!tekst) { el.innerHTML = ''; return; }

        // Parse "X av Y" eller "X/Y" fra tekst
        const m = tekst.match(/(\d+)\s*(?:av|\/)\s*(\d+)/);
        if (m) {
            const current = parseInt(m[1]);
            const total = parseInt(m[2]);
            const pct = total > 0 ? current / total : 0;
            const r = 8, c = 2 * Math.PI * r;
            const offset = c * (1 - pct);
            el.innerHTML = `<svg class="progress-ring" width="22" height="22" viewBox="0 0 22 22"><circle class="bg" cx="11" cy="11" r="${r}" stroke-width="3"/><circle class="fg" cx="11" cy="11" r="${r}" stroke-width="3" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/></svg><span class="status-text">${tekst}</span>`;
        } else {
            el.innerHTML = `<span class="spinner"></span><span class="status-text">${tekst}</span>`;
        }
    }

    function sjekkVindu() {
        let tabOk = false;
        if (window.mqWin && !window.mqWin.closed) {
            try {
                tabOk = !!window.mqWin.document.getElementById('container');
                // Tving gjenskapning hvis versjon ikke matcher
                if (tabOk && window.mqWin.document.title !== TITTEL) {
                    window.mqWin.document.body.innerHTML = '';
                    tabOk = false;
                }
            }
            catch (e) { tabOk = false; }
        }
        if (tabOk) return;

        avvikChannel.postMessage({ type: 'LUKK_TAB' });
        if (window.mqWin && !window.mqWin.closed) {
            try { window.mqWin.close(); } catch (e) {}
        }

        window.mqWin = window.open('about:blank', 'Overvaker_Avvik_v38');
        window.mqWin.document.open();
        window.mqWin.document.write(`<html><head><title>${TITTEL}</title><style>${STIL}</style></head><body>
            <div id="heartbeatBar" class="heartbeat-bar">&#9888; Mistet kontakt med NISSY -- klikk for å prøve på nytt</div>
            <div class="header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <h2 style="margin:0; font-size:18px;">${TITTEL}</h2>
                    <button class="btn-filter" id="btnFilter">&#9881; Filter</button>
                    <span id="loadingStatus"></span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <div class="filter-checkbox">
                        <input type="checkbox" id="brukGodkjenteOrd" ${window.mqBrukGodkjenteOrd ? 'checked' : ''}>
                        <label for="brukGodkjenteOrd">Godkjente ord</label>
                    </div>
                    <div class="filter-checkbox">
                        <input type="checkbox" id="brukGodkjenteAdresser" ${window.mqBrukGodkjenteAdresser ? 'checked' : ''}>
                        <label for="brukGodkjenteAdresser">Godkjente adresser</label>
                    </div>
                    <div class="filter-checkbox" style="border:1px solid #3b82f6;">
                        <input type="checkbox" id="autoKm" ${window.mqAutoKm ? 'checked' : ''}>
                        <label for="autoKm">Auto-km</label>
                    </div>
                    <button class="info-btn" id="btnInfo">&#8505; Info</button>
                </div>
                <div id="filterPanel" class="filter-panel" style="display:none;">
                    <div style="display:flex; gap:24px;">
                        <div style="flex:1;">
                            <div class="filter-section-title" style="color:#002b5c; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="filter-gruppe-cb" data-gruppe="dagens" ${FILTER_GRUPPER.dagens.every(id => aktiveFiltre.has(id)) ? 'checked' : ''} onchange="window._toggleGruppe('dagens', this.checked)"> Dagens</div>
                            ${FILTER_GRUPPER.dagens.map(id => {
                                const fv = RFILTER_VALG.find(f => f.id === id);
                                if (!fv) return '';
                                return `<div class="filter-checkbox" style="border:1px solid #475569;">
                                    <input type="checkbox" class="rfilter-cb" data-fid="${fv.id}" ${aktiveFiltre.has(fv.id) ? 'checked' : ''}>
                                    <label style="cursor:pointer;" onclick="this.previousElementSibling.click()">${fv.navn} <span class="rfilter-count" data-fid="${fv.id}" style="color:#94a3b8; font-size:11px;"></span></label>
                                </div>`;
                            }).join('')}
                        </div>
                        <div style="flex:1;">
                            <div class="filter-section-title" style="color:#002b5c; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="filter-gruppe-cb" data-gruppe="morgen" ${FILTER_GRUPPER.morgen.every(id => aktiveFiltre.has(id)) ? 'checked' : ''} onchange="window._toggleGruppe('morgen', this.checked)"> Morgen / Neste dag</div>
                            ${FILTER_GRUPPER.morgen.map(id => {
                                const fv = RFILTER_VALG.find(f => f.id === id);
                                if (!fv) return '';
                                return `<div class="filter-checkbox" style="border:1px solid #475569;">
                                    <input type="checkbox" class="rfilter-cb" data-fid="${fv.id}" ${aktiveFiltre.has(fv.id) ? 'checked' : ''}>
                                    <label style="cursor:pointer;" onclick="this.previousElementSibling.click()">${fv.navn} <span class="rfilter-count" data-fid="${fv.id}" style="color:#94a3b8; font-size:11px;"></span></label>
                                </div>`;
                            }).join('')}
                        </div>
                        <div style="flex:1;">
                            <div class="filter-section-title" style="color:#002b5c; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="filter-gruppe-cb" data-gruppe="tredager" ${FILTER_GRUPPER.tredager.every(id => aktiveFiltre.has(id)) ? 'checked' : ''} onchange="window._toggleGruppe('tredager', this.checked)"> 3 dager</div>
                            ${FILTER_GRUPPER.tredager.map(id => {
                                const fv = RFILTER_VALG.find(f => f.id === id);
                                if (!fv) return '';
                                return `<div class="filter-checkbox" style="border:1px solid #475569;">
                                    <input type="checkbox" class="rfilter-cb" data-fid="${fv.id}" ${aktiveFiltre.has(fv.id) ? 'checked' : ''}>
                                    <label style="cursor:pointer;" onclick="this.previousElementSibling.click()">${fv.navn} <span class="rfilter-count" data-fid="${fv.id}" style="color:#94a3b8; font-size:11px;"></span></label>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    <div style="margin-top:12px; text-align:center;">
                        <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'REFRESH'})" style="padding:6px 20px;">Oppdater</button>
                    </div>
                </div>
            </div>
            <div id="infoModal" class="info-modal">
                <div class="info-content">
                    <h3>&#128203; Sjekker og kriterier</h3>
                    <div class="section">
                        <h4>&#128118; Barn reiser alene</h4>
                        <ul>
                            <li>Pasientens alder under <strong>${CONFIG.BARN_ALDER_GRENSE} år</strong> (fra PNR)</li>
                            <li>Antall ledsagere er <strong>0</strong> (fra dispatch)</li>
                            <li>Krever PNR-kolonne aktiv i NISSY</li>
                        </ul>
                    </div>
                    <div class="section">
                        <h4>&#9888; Mangler PNR</h4>
                        <ul><li>Dispatch mangler gyldig 11-sifret personnummer</li></ul>
                    </div>
                    <div class="section">
                        <h4>&#128993; Dobbeltbestilling</h4>
                        <ul>
                            <li>Samme PNR, to reiser, samme retning</li>
                            <li>Møteplassreiser (adresser henger sammen) filtreres ut</li>
                            <li>Kansellerte/bomturer ignoreres</li>
                        </ul>
                    </div>
                    <div class="section">
                        <h4>&#128308; Adresseavvik</h4>
                        <ul>
                            <li>Folkeregistrert adresse (Padr) matcher verken fra eller til</li>
                            <li>Bestilt reise er lengre enn fra folkereg</li>
                            <li>Krever Padr-kolonne aktiv i NISSY</li>
                        </ul>
                    </div>
                    <div class="section">
                        <h4>&#128506;&#65039; Kommunegrense</h4>
                        <ul>
                            <li>Pasient og destinasjon i <strong>ulike kommuner</strong> (fra postnr)</li>
                            <li>Sykehus/spesialist filtreres ut (forventet kryssing)</li>
                            <li>Flagger ikke-spesialist destinasjoner i annen kommune</li>
                        </ul>
                    </div>
                    <div class="section">
                        <h4>&#10004; Godkjente adresseord</h4>
                        <ul style="column-count:2; column-gap:20px;">${godkjenteOrdListe}</ul>
                    </div>
                    <div class="section">
                        <h4>&#10004; Godkjente adresser</h4>
                        <ul style="column-count:2; column-gap:20px;">${godkjenteAdresserListe}</ul>
                    </div>
                    <button class="close-btn" id="btnInfoLukk">Lukk</button>
                </div>
            </div>
            <div id="gkModal" class="gk-backdrop">
                <div class="gk-dialog">
                    <div class="gk-header">
                        <div class="gk-header-left">
                            <div class="gk-icon" id="gkIcon"></div>
                            <div>
                                <div class="gk-title" id="gkTitle">Godkjenn avvik</div>
                                <div class="gk-subtitle" id="gkSubtitle"></div>
                            </div>
                        </div>
                        <button class="gk-close" id="gkModalLukk" title="Lukk">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="gk-context" id="gkContext"></div>
                    <div class="gk-tabs">
                        <button class="gk-tab active" data-gktab="session" id="gkTabSession">Denne runden</button>
                        <button class="gk-tab" data-gktab="permanent" id="gkTabPermanent">Lagre permanent</button>
                    </div>
                    <div class="gk-panel active" id="gkPanelSession">
                        <button class="gk-primary-btn" id="gkBtnSession">Godkjenn denne runden</button>
                        <div class="gk-quick-section">
                            <div class="gk-quick-label">Hurtiggodkjenn med grunn:</div>
                            <div class="gk-quick-chips" id="gkGrunnKnapper"></div>
                        </div>
                        <div class="gk-reason-row">
                            <input type="text" class="gk-input" id="gkGrunnInput" placeholder="Annen grunn (valgfritt)..." />
                            <button class="gk-btn-sm gk-btn-sm--blue" id="gkGrunnOkBtn">OK</button>
                        </div>
                    </div>
                    <div class="gk-panel" id="gkPanelPermanent">
                        <div style="padding:8px 12px; background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; font-size:11px; color:#92400e; margin-bottom:10px; line-height:1.4;">&#9888; Ikke lagre personopplysninger (navn, fodselsnummer, privatadresser). Kun behandlingssteder, institusjoner og generelle sokeord.</div>
                        <div class="gk-perm-section" id="gkSekAdr">
                            <div class="gk-perm-header">
                                <div class="gk-perm-icon gk-perm-icon--green">&#128205;</div>
                                <div class="gk-perm-title">Lagre adresse</div>
                            </div>
                            <div class="gk-perm-desc">Gi adressen et navn og lagre permanent.</div>
                            <div id="gkAdrVisning" style="font-size:12px; color:#334155; padding:8px 10px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:8px; word-break:break-all;"></div>
                            <div class="gk-perm-input-row">
                                <input type="text" class="gk-input" id="gkAdrNavnInput" placeholder="Gi et navn, f.eks. Radiumhospitalet" style="flex:1;" />
                                <button class="gk-btn-sm gk-btn-sm--green" id="gkAdrLagreBtn">Lagre</button>
                            </div>
                            <div class="gk-perm-chips" id="gkAdrForslag"></div>
                            <input type="hidden" id="gkAdrInput" />
                        </div>
                        <div class="gk-perm-section">
                            <div class="gk-perm-header">
                                <div class="gk-perm-icon gk-perm-icon--blue">&#128269;</div>
                                <div class="gk-perm-title">Lagre s\u00f8keord</div>
                            </div>
                            <div class="gk-perm-desc">S\u00f8keord fjerner avvik n\u00e5r de finnes i navnefeltet i adresse.</div>
                            <div class="gk-perm-input-row">
                                <input type="text" class="gk-input" id="gkOrdInput" placeholder="f.eks. \u00f8yelege" />
                                <button class="gk-btn-sm gk-btn-sm--blue" id="gkOrdLagreBtn">Lagre</button>
                            </div>
                            <div class="gk-perm-chips" id="gkOrdForslag"></div>
                        </div>
                        <div class="gk-perm-section" id="gkSekPostnr">
                            <div class="gk-perm-header">
                                <div class="gk-perm-icon gk-perm-icon--amber">&#128204;</div>
                                <div class="gk-perm-title">Lagre postnummer</div>
                            </div>
                            <div class="gk-perm-desc">Legg til postnummer i kanskje-listen.</div>
                            <div class="gk-perm-input-row">
                                <input type="text" class="gk-input" id="gkPostnrInput" maxlength="4" placeholder="f.eks. 0372" style="width:90px; letter-spacing:0.1em;" />
                                <button class="gk-btn-sm gk-btn-sm--amber" id="gkPostnrLagreBtn">Lagre</button>
                            </div>
                        </div>
                    </div>
                    <div class="gk-footer">
                        <button class="gk-cancel" id="gkBtnAvbryt">Lukk</button>
                    </div>
                </div>
            </div>
            <div class="gk-toast" id="gkToast"></div>
            <div id="adrModal" class="adr-modal">
                <div class="adr-modal-inner">
                    <h3 id="adrModalTittel">&#128205; Godkjente adresser og s\u00f8keord</h3>
                    <p id="adrModalBeskrivelse" style="font-size:12px; color:#64748b; margin:0 0 12px 0;">Lagres sentralt \u2014 gjelder alle PCer. Adresser filtreres i adresse-skanningen, s\u00f8keord filtreres i b\u00e5de adresse- og kommune-skanningen.</p>
                    <div id="adrStatiskInnhold">
                        <h4 style="margin:0 0 6px; font-size:13px; color:#334155;">Adresser</h4>
                        <ul class="adr-liste" id="adrListe"></ul>
                        <div class="adr-input-rad">
                            <input type="text" id="adrNyInput" placeholder="f.eks. morteveien 19" />
                            <button class="btn-nissy" id="adrLeggTilBtn">Legg til</button>
                        </div>
                        <div class="adr-status" id="adrStatus"></div>
                        <hr style="margin:12px 0; border:none; border-top:1px solid #e2e8f0;">
                        <h4 style="margin:0 0 6px; font-size:13px; color:#334155;">S\u00f8keord</h4>
                        <ul class="adr-liste" id="ordListe"></ul>
                        <div class="adr-input-rad">
                            <input type="text" id="ordNyInput" placeholder="f.eks. \u00f8yelege" />
                            <button class="btn-nissy" id="ordLeggTilBtn">Legg til</button>
                        </div>
                        <div class="adr-status" id="ordStatus"></div>
                    </div>
                    <div id="adrKommuneLayout" style="display:none;"></div>
                    <button class="close-btn" id="adrModalLukk" style="margin-top:16px;">Lukk</button>
                </div>
            </div>
            <div id="landingsside">
                <div class="valg-grid">
                    <div class="valg-boks barn" onclick="window._avvikCh.postMessage({type:'SKANN', sjekk:'barn'})">
                        <div class="valg-ikon">&#128118;</div>
                        <div class="valg-tittel">Barn under 12 år</div>
                        <div class="valg-beskrivelse">Barn uten ledsager fra dispatch.<br>Krever: PNR-kolonne</div>
                    </div>
                    <div class="valg-boks adresse" onclick="window._avvikCh.postMessage({type:'SKANN', sjekk:'adresse'})">
                        <div class="valg-ikon">&#128308;</div>
                        <div class="valg-tittel">Adresseavvik</div>
                        <div class="valg-beskrivelse">Folkereg vs bestilt adresse.<br>Krever: Padr-kolonne</div>
                    </div>
                    <div class="valg-boks dublett" onclick="window._avvikCh.postMessage({type:'SKANN', sjekk:'dublett'})">
                        <div class="valg-ikon">&#128993;</div>
                        <div class="valg-tittel">Dobbeltbestilling</div>
                        <div class="valg-beskrivelse">Samme PNR, samme retning.<br>Krever: PNR-kolonne</div>
                    </div>
                    <div class="valg-boks pnr" onclick="window._avvikCh.postMessage({type:'SKANN', sjekk:'pnr'})">
                        <div class="valg-ikon">&#9888;&#65039;</div>
                        <div class="valg-tittel">Mangler PNR</div>
                        <div class="valg-beskrivelse">Reiser uten personnummer.<br>Krever: PNR-kolonne</div>
                    </div>
                    <div class="valg-boks kommune" onclick="window._avvikCh.postMessage({type:'SKANN', sjekk:'kommune'})">
                        <div class="valg-ikon">&#128506;&#65039;</div>
                        <div class="valg-tittel">Kommunegrense</div>
                        <div class="valg-beskrivelse">Ikke-spesialist i annen kommune.<br>Sammenligner postnummer</div>
                    </div>
                </div>
            </div>
            <div id="statsBar" class="stats-bar" style="display:none;"></div>
            <div id="container"></div>
            <script>
                const _ch = new BroadcastChannel('${CHANNEL_NAME}');
                window._avvikCh = _ch;
                let _sisteHeartbeat = Date.now();

                // Bind rfilter-checkbox events i filterPanel
                var _fgDagens = [${FILTER_GRUPPER.dagens.join(',')}];
                var _fgMorgen = [${FILTER_GRUPPER.morgen.join(',')}];
                var _fgTredager = [${FILTER_GRUPPER.tredager.join(',')}];
                var _filterGrupper = { dagens: _fgDagens, morgen: _fgMorgen, tredager: _fgTredager };
                function _sendFiltre() {
                    var aktive = [];
                    document.querySelectorAll('#filterPanel .rfilter-cb:checked').forEach(function(c) { aktive.push(+c.dataset.fid); });
                    _ch.postMessage({ type: 'BYTT_FILTRE', filtre: aktive });
                }
                document.querySelectorAll('#filterPanel .rfilter-cb').forEach(function(cb) {
                    cb.addEventListener('change', function() { _sendFiltre(); _oppdaterGruppeCbs(); });
                });
                // Gruppe-toggle via inline onchange
                window._toggleGruppe = function(gruppe, checked) {
                    var ider = _filterGrupper[gruppe] || [];
                    for (var i = 0; i < ider.length; i++) {
                        var cb = document.querySelector('.rfilter-cb[data-fid="' + ider[i] + '"]');
                        if (cb) cb.checked = checked;
                    }
                    _sendFiltre();
                };
                // Oppdater gruppe-checkbox når individuelle endres
                function _oppdaterGruppeCbs() {
                    var grupper = ['dagens', 'morgen', 'tredager'];
                    for (var g = 0; g < grupper.length; g++) {
                        var gruppe = grupper[g];
                        var ider = _filterGrupper[gruppe];
                        var gcb = document.querySelector('.filter-gruppe-cb[data-gruppe="' + gruppe + '"]');
                        if (!gcb) continue;
                        var alleOn = true, noenOn = false;
                        for (var i = 0; i < ider.length; i++) {
                            var cb = document.querySelector('.rfilter-cb[data-fid="' + ider[i] + '"]');
                            if (cb && cb.checked) noenOn = true; else alleOn = false;
                        }
                        gcb.checked = alleOn && noenOn;
                        gcb.indeterminate = noenOn && !alleOn;
                    }
                }

                _ch.onmessage = function(e) {
                    if (e.data.type === 'LUKK_TAB') { window.close(); return; }
                    if (e.data.type === 'HEARTBEAT') {
                        _sisteHeartbeat = Date.now();
                        const bar = document.getElementById('heartbeatBar');
                        if (bar) { bar.classList.remove('show'); bar.textContent = '\\u26A0 Mistet kontakt med NISSY -- klikk for \\u00E5 pr\\u00F8ve p\\u00E5 nytt'; }
                        return;
                    }
                    if (e.data.type === 'SESJON_UTLOPT') {
                        var bar = document.getElementById('heartbeatBar');
                        if (bar) { bar.textContent = '\\u26A0 NISSY-sesjonen er utl\\u00F8pt -- logg inn p\\u00E5 nytt i NISSY og kj\\u00F8r skriptet igjen'; bar.classList.add('show'); }
                        return;
                    }
                    if (e.data.type === 'ADMIN_SESJON_UTLOPT') {
                        var bar = document.getElementById('heartbeatBar');
                        if (bar) { bar.textContent = '\\u26A0 Admin-sesjonen er utl\\u00F8pt -- logg inn p\\u00E5 nytt i Administrasjon'; bar.classList.add('show'); }
                        return;
                    }
                };

                setInterval(function() {
                    const bar = document.getElementById('heartbeatBar');
                    if (bar && Date.now() - _sisteHeartbeat > 180000) bar.classList.add('show');
                    else if (bar) bar.classList.remove('show');
                }, 15000);

                document.getElementById('heartbeatBar').addEventListener('click', function() {
                    _ch.postMessage({ type: 'REFRESH' });
                });
                document.getElementById('brukGodkjenteOrd').addEventListener('change', function() {
                    _ch.postMessage({ type: 'TOGGLE_ORD', checked: this.checked });
                });
                document.getElementById('brukGodkjenteAdresser').addEventListener('change', function() {
                    _ch.postMessage({ type: 'TOGGLE_ADRESSER', checked: this.checked });
                });
                document.getElementById('autoKm').addEventListener('change', function() {
                    _ch.postMessage({ type: 'TOGGLE_AUTO_KM', checked: this.checked });
                });
                document.getElementById('btnFilter').addEventListener('click', function() {
                    var fp = document.getElementById('filterPanel');
                    fp.style.display = fp.style.display === 'none' ? 'block' : 'none';
                });
                document.getElementById('btnInfo').addEventListener('click', function() {
                    document.getElementById('infoModal').classList.add('show');
                });
                document.getElementById('infoModal').addEventListener('click', function(e) {
                    if (e.target === this) this.classList.remove('show');
                });
                document.getElementById('btnInfoLukk').addEventListener('click', function() {
                    document.getElementById('infoModal').classList.remove('show');
                });
                // GODKJENN-modal (v124 revamp — tab-basert)
                var gkModal = document.getElementById('gkModal');
                var gkPendingData = null;
                var gkSavedWords = [];
                var LS_GRUNN = 'mq_godkjentGrunn';
                var GK_GRUNNER = window._gkGrunner || ['Kortere reise'];
                var gkToastTimer = null;
                function hentGrunn() { try { return (document.getElementById('gkGrunnInput').value || '').trim(); } catch(e) { return ''; } }
                function lagreGrunn(nokkel, grunn) {
                    if (!nokkel || !grunn) return;
                    try { var obj = JSON.parse(localStorage.getItem(LS_GRUNN) || '{}'); obj[nokkel] = grunn; localStorage.setItem(LS_GRUNN, JSON.stringify(obj)); } catch(e) {}
                }
                function gkToast(msg, type) {
                    var t = document.getElementById('gkToast');
                    if (!t) return;
                    t.className = 'gk-toast gk-toast--' + (type || 'info');
                    t.textContent = msg;
                    clearTimeout(gkToastTimer);
                    requestAnimationFrame(function() { t.classList.add('show'); });
                    gkToastTimer = setTimeout(function() { t.classList.remove('show'); }, 2200);
                }
                function gkSwitchTab(tab) {
                    var tabs = document.querySelectorAll('.gk-tab');
                    for (var i = 0; i < tabs.length; i++) {
                        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-gktab') === tab);
                    }
                    document.getElementById('gkPanelSession').classList.toggle('active', tab === 'session');
                    document.getElementById('gkPanelPermanent').classList.toggle('active', tab === 'permanent');
                }
                function gkSessionGodkjenn(grunn) {
                    if (!gkPendingData) return;
                    if (grunn) lagreGrunn(gkPendingData.turid || gkPendingData.reqId, grunn);
                    window._avvikCh.postMessage({type:'GODKJENN', id:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, rekNr:gkPendingData.rekNr || '', grunn:grunn || '', kortType:gkPendingData.kortType || ''});
                    gkToast(grunn ? 'Godkjent: ' + grunn : 'Godkjent denne runden', 'success');
                    setTimeout(function() { gkModal.classList.remove('show'); }, 400);
                }
                function gkBuildContext(data) {
                    var ctx = document.getElementById('gkContext');
                    var html = '';
                    if (data.kortType === 'adresse') {
                        var erTurAdr = data.erTur === true || data.erTur === 'true';
                        var badge = erTurAdr ? '<span class="gk-badge gk-badge--tur">TUR</span>' : '<span class="gk-badge gk-badge--retur">RETUR</span>';
                        var godkjennNavn = erTurAdr ? (data.henteNavn || '') : (data.leverNavn || '');
                        var godkjennAdr = erTurAdr ? (data.henteAdr || '') : (data.leverAdr || '');
                        if (godkjennNavn) html += '<div class="gk-context-row"><span class="gk-context-label">Sted</span><span class="gk-context-val"><strong>' + godkjennNavn + '</strong></span></div>';
                        if (data.erTur !== null && data.erTur !== 'null') html += '<div class="gk-context-row"><span class="gk-context-label">Retning</span><span class="gk-context-val">' + badge + '</span></div>';
                        html += '<div class="gk-context-row"><span class="gk-context-label">Adresse</span><span class="gk-context-val">' + (godkjennAdr || '?') + '</span></div>';
                        if (data.folkAdr) html += '<div class="gk-folkreg">Folkereg: ' + data.folkAdr + '</div>';
                    } else {
                        html += '<div class="gk-context-row"><span class="gk-context-label">Type</span><span class="gk-context-val"><span class="gk-badge gk-badge--kommune">Kommune</span>';
                        if (data.apiVerifisert) html += '<span class="gk-badge gk-badge--api">API-verifisert</span>';
                        html += '</span></div>';
                        html += '<div class="gk-context-row"><span class="gk-context-label">Fra</span><span class="gk-context-val"><strong>' + (data.pasientKommune || '?') + '</strong></span></div>';
                        html += '<div class="gk-context-row"><span class="gk-context-label">Til</span><span class="gk-context-val"><strong>' + (data.destKommune || '?') + '</strong></span></div>';
                        var komErReturCtx = data.erTur === false || data.erTur === 'false';
                        var komBehandlNavn = komErReturCtx ? (data.henteNavn || data.leverNavn || '') : (data.leverNavn || data.henteNavn || '');
                        if (komBehandlNavn) html += '<div class="gk-context-row"><span class="gk-context-label">Beh.</span><span class="gk-context-val">' + komBehandlNavn + '</span></div>';
                        html += '<div class="gk-context-row"><span class="gk-context-label">Hente</span><span class="gk-context-val">' + (data.henteAdr || '?') + '</span></div>';
                        html += '<div class="gk-context-row"><span class="gk-context-label">Lever</span><span class="gk-context-val">' + (data.leverAdr || '?') + '</span></div>';
                        if (data.destPostnr) html += '<div class="gk-context-row"><span class="gk-context-label">Postnr</span><span class="gk-context-val" style="letter-spacing:0.1em;">' + data.destPostnr + '</span></div>';
                    }
                    ctx.innerHTML = html;
                }
                function gkBuildSuggestions(data) {
                    var adrContainer = document.getElementById('gkAdrForslag');
                    var ordContainer = document.getElementById('gkOrdForslag');
                    adrContainer.innerHTML = '';
                    ordContainer.innerHTML = '';
                    gkSavedWords = [];
                    // Navneforslag fra stedsnavn
                    if (data.kortType === 'adresse') {
                        var erTurF = data.erTur === true || data.erTur === 'true';
                        var navnKilde = erTurF ? (data.henteNavn || '') : (data.leverNavn || '');
                        if (navnKilde) {
                            var navnRenF = navnKilde.replace(/<[^>]+>/g, '').trim();
                            var generiskF = ['hovedinngang', 'inngang', 'utgang', 'resepsjon', 'pasientens hjem'];
                            var navnDelerF = navnRenF.split(/[,\/]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2 && generiskF.indexOf(s.toLowerCase()) === -1; });
                            navnDelerF.forEach(function(f) {
                                var chip = document.createElement('button');
                                chip.className = 'gk-perm-chip';
                                chip.textContent = f;
                                chip.addEventListener('click', function() {
                                    document.getElementById('gkAdrNavnInput').value = f;
                                });
                                adrContainer.appendChild(chip);
                            });
                        }
                    } else {
                        // Kommune: behandlingssted = RETUR:hente, TUR:lever
                        var komErReturSug = data.erTur === false || data.erTur === 'false';
                        var komBehandlNavnSug = komErReturSug ? (data.henteNavn || data.leverNavn || '') : (data.leverNavn || data.henteNavn || '');
                        if (komBehandlNavnSug) {
                            var komNavnF = komBehandlNavnSug.replace(/<[^>]+>/g, '').trim();
                            var komDelerF = komNavnF.split(/[,\/]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2; });
                            komDelerF.forEach(function(f) {
                                var chip = document.createElement('button');
                                chip.className = 'gk-perm-chip';
                                chip.textContent = f;
                                chip.addEventListener('click', function() {
                                    document.getElementById('gkAdrNavnInput').value = f;
                                });
                                adrContainer.appendChild(chip);
                            });
                        }
                    }
                    // Sokeord-forslag fra stedsnavn
                    var navn = '';
                    if (data.kortType === 'adresse') {
                        var erTurAdr = data.erTur === true || data.erTur === 'true';
                        navn = erTurAdr ? (data.henteNavn || '') : (data.leverNavn || '');
                    } else {
                        // Kommune: behandlingssted = RETUR:hente, TUR:lever
                        var komErReturOrd = data.erTur === false || data.erTur === 'false';
                        navn = komErReturOrd ? (data.henteNavn || data.destNavn || '') : (data.leverNavn || data.destNavn || '');
                    }
                    // Fallback: bruk behandlingsstedet sin adresse
                    if (!navn) {
                        var komErReturFb = data.erTur === false || data.erTur === 'false';
                        navn = komErReturFb ? (data.henteAdr || data.leverAdr || '') : (data.leverAdr || data.henteAdr || '');
                    }
                    if (navn) {
                        var navnC = navn.replace(/<[^>]+>/g, '').trim().toLowerCase();
                        // Fjern alt etter komma (postnr, sted, etc.)
                        navnC = navnC.split(',')[0].replace(/\s+as$/i, '').trim();
                        var ordForslag = [];
                        function leggTilOrd(v) { v = v.trim(); if (v && v.length > 2 && ordForslag.indexOf(v) === -1 && !/^\d+$/.test(v) && !/^\d{4}\s/.test(v)) ordForslag.push(v); }
                        // Del før / = overordnet (sykehus/behandlingssted)
                        var skraaIdx = navnC.indexOf('/');
                        if (skraaIdx > 2) leggTilOrd(navnC.substring(0, skraaIdx).trim());
                        // Del etter / = underordnet (avdeling/behandler)
                        if (skraaIdx > 0 && skraaIdx < navnC.length - 2) leggTilOrd(navnC.substring(skraaIdx + 1).trim());
                        // Enkeltord — split på mellomrom
                        var alleOrd = navnC.split(' ').filter(function(o) { return o.length > 2 && !/^\d+$/.test(o); });
                        alleOrd.forEach(function(o) { leggTilOrd(o); });
                        // Hele navnet
                        leggTilOrd(navnC);
                        ordForslag.forEach(function(w) {
                            var chip = document.createElement('button');
                            chip.className = 'gk-perm-chip';
                            chip.textContent = w;
                            chip.setAttribute('data-forslag', w);
                            chip.addEventListener('click', function() {
                                if (this.classList.contains('saved')) return;
                                document.getElementById('gkOrdInput').value = w;
                                lagreGrunn(w, hentGrunn());
                                window._avvikCh.postMessage({type:'GODKJENN_LAGRE_ORD', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, rekNr:gkPendingData.rekNr, kortType:gkPendingData.kortType, ord:w, fraForslag:true});
                                this.classList.add('saved');
                                this.innerHTML = '<span class="gk-check-anim">&#10003;</span> ' + w;
                            });
                            ordContainer.appendChild(chip);
                        });
                        if (data.kortType === 'kommune') {
                            var ordI = document.getElementById('gkOrdInput');
                            if (ordI) ordI.value = navnC;
                        }
                    }
                }
                // Tab-klikk
                document.getElementById('gkTabSession').addEventListener('click', function() { gkSwitchTab('session'); });
                document.getElementById('gkTabPermanent').addEventListener('click', function() { gkSwitchTab('permanent'); });
                // Init grunn-knapper
                try {
                    var gkGrunnKnapper = document.getElementById('gkGrunnKnapper');
                    if (gkGrunnKnapper) {
                        GK_GRUNNER.forEach(function(g) {
                            var btn = document.createElement('button');
                            btn.className = 'gk-chip';
                            btn.textContent = g;
                            btn.addEventListener('click', function() { gkSessionGodkjenn(g); });
                            gkGrunnKnapper.appendChild(btn);
                        });
                    }
                } catch(e) {}
                // Lukk-knapper
                document.getElementById('gkModalLukk').addEventListener('click', function() { gkModal.classList.remove('show'); });
                document.getElementById('gkBtnAvbryt').addEventListener('click', function() { gkModal.classList.remove('show'); });
                var gkMouseDownTarget = null;
                gkModal.addEventListener('mousedown', function(e) { gkMouseDownTarget = e.target; });
                gkModal.addEventListener('click', function(e) { if (e.target === this && gkMouseDownTarget === this) this.classList.remove('show'); });
                // Sesjon-godkjenn
                document.getElementById('gkBtnSession').addEventListener('click', function() {
                    // Ripple-effekt
                    var btn = this;
                    var ripple = document.createElement('span');
                    ripple.className = 'gk-ripple';
                    var rect = btn.getBoundingClientRect();
                    var size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
                    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
                    btn.appendChild(ripple);
                    setTimeout(function() { ripple.remove(); }, 500);
                    gkSessionGodkjenn('');
                });
                document.getElementById('gkGrunnOkBtn').addEventListener('click', function() {
                    gkSessionGodkjenn(hentGrunn());
                });
                // Lagre adresse
                document.getElementById('gkAdrLagreBtn').addEventListener('click', function() {
                    var adr = document.getElementById('gkAdrInput').value.trim();
                    var navn = (document.getElementById('gkAdrNavnInput').value || '').trim();
                    if (!adr) { gkToast('Ingen adresse tilgjengelig', 'info'); return; }
                    lagreGrunn(adr, hentGrunn());
                    window._avvikCh.postMessage({type:'GODKJENN_LAGRE_ADR', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, rekNr:gkPendingData.rekNr, kortType:gkPendingData.kortType, adresse:adr, navn:navn});
                    gkToast('Lagrer: ' + (navn ? navn + ' \u2014 ' : '') + adr, 'success');
                });
                // Lagre sokeord
                document.getElementById('gkOrdLagreBtn').addEventListener('click', function() {
                    var ord = document.getElementById('gkOrdInput').value.trim();
                    if (!ord || !gkPendingData) return;
                    lagreGrunn(ord, hentGrunn());
                    window._avvikCh.postMessage({type:'GODKJENN_LAGRE_ORD', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, rekNr:gkPendingData.rekNr, kortType:gkPendingData.kortType, ord:ord});
                    gkToast('Lagrer sokeord: "' + ord + '"...', 'success');
                });
                // Lagre postnr
                document.getElementById('gkPostnrLagreBtn').addEventListener('click', function() {
                    var pnr = document.getElementById('gkPostnrInput').value.trim();
                    if (!pnr || !gkPendingData) return;
                    window._avvikCh.postMessage({type:'GODKJENN_LAGRE_POSTNR', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, rekNr:gkPendingData.rekNr, postnr:pnr});
                    gkToast('Lagrer postnr: ' + pnr, 'amber');
                });
                // _gkSetPending — kalles fra hovedskriptet via VIS_GODKJENN_MODAL
                window._gkSetPending = function(data) {
                    gkPendingData = data;
                    // Header
                    var icon = document.getElementById('gkIcon');
                    var title = document.getElementById('gkTitle');
                    var sub = document.getElementById('gkSubtitle');
                    if (data.kortType === 'adresse') {
                        icon.className = 'gk-icon gk-icon--adr';
                        icon.innerHTML = '&#128205;';
                        title.textContent = 'Godkjenn adresseavvik';
                        var erTurAdr = data.erTur === true || data.erTur === 'true';
                        sub.textContent = data.erTur === null || data.erTur === 'null' ? '' : (erTurAdr ? 'TUR \u2014 hentested' : 'RETUR \u2014 leveringssted');
                    } else {
                        icon.className = 'gk-icon gk-icon--kom';
                        icon.innerHTML = '&#127463;';
                        title.textContent = 'Godkjenn kommunegrense';
                        sub.textContent = 'Reise over kommunegrense';
                    }
                    // Beregn ren adresse + stedsnavn
                    if (data.kortType === 'adresse') {
                        var erTur = data.erTur === true || data.erTur === 'true';
                        var godkjennAdr = erTur ? (data.henteAdr || '') : (data.leverAdr || '');
                        var godkjennNavn = erTur ? (data.henteNavn || '') : (data.leverNavn || '');
                        data.gateadresse = godkjennAdr.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim();
                        var navnRen = godkjennNavn.replace(/<[^>]+>/g, '').trim();
                        // Fjern generiske stedsnavn som ikke er nyttige som adresse
                        var generisk = ['hovedinngang', 'inngang', 'utgang', 'resepsjon', 'pasientens hjem'];
                        var navnDeler = navnRen.split(/[,\/]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2 && generisk.indexOf(s.toLowerCase()) === -1; });
                        data.stedsnavn = navnDeler.length > 0 ? navnDeler[0] : '';
                        data.adresse = data.stedsnavn || data.gateadresse;
                    } else {
                        // Kommune: behandlingssted = TUR:lever, RETUR:hente
                        var komErTur = data.erTur === true || data.erTur === 'true';
                        var komErRetur = data.erTur === false || data.erTur === 'false';
                        var komAdr = (komErRetur ? (data.henteAdr || data.destNavn || '') : (data.leverAdr || data.destNavn || '')).replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim();
                        var komNavn = (komErRetur ? (data.henteNavn || '') : (data.leverNavn || '')).replace(/<[^>]+>/g, '').trim();
                        var komNavnDeler = komNavn.split(/[,\/]+/).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 2; });
                        data.gateadresse = komAdr;
                        data.stedsnavn = komNavnDeler.length > 0 ? komNavnDeler[0] : '';
                        data.adresse = data.stedsnavn || data.gateadresse;
                    }
                    // Bygg kontekst + forslag
                    gkBuildContext(data);
                    gkBuildSuggestions(data);
                    // Pre-fill inputs
                    var adrI = document.getElementById('gkAdrInput');
                    if (adrI) adrI.value = data.gateadresse || data.adresse || '';
                    var adrVis = document.getElementById('gkAdrVisning');
                    if (adrVis) adrVis.textContent = data.gateadresse || data.adresse || '(ingen adresse)';
                    var navnI = document.getElementById('gkAdrNavnInput');
                    if (navnI) navnI.value = data.stedsnavn || '';
                    document.getElementById('gkGrunnInput').value = '';
                    document.getElementById('gkOrdInput').value = '';
                    document.getElementById('gkPostnrInput').value = '';
                    // Kanskje: skjul adresse og postnr, vis kun søkeord
                    var sekAdr = document.getElementById('gkSekAdr');
                    var sekPostnr = document.getElementById('gkSekPostnr');
                    if (sekAdr) sekAdr.style.display = data.kanskje ? 'none' : '';
                    if (sekPostnr) sekPostnr.style.display = data.kanskje ? 'none' : '';
                    // Reset til sesjon-tab
                    gkSwitchTab('session');
                    // Vis modal med animasjon
                    gkModal.classList.add('show', 'entering');
                    requestAnimationFrame(function() { requestAnimationFrame(function() { gkModal.classList.remove('entering'); }); });
                };
                // _forslagLagret — kalles etter vellykket ord-lagring fra hovedskriptet
                window._forslagLagret = function(ord) {
                    if (gkSavedWords.indexOf(ord) === -1) gkSavedWords.push(ord);
                    var chips = document.querySelectorAll('#gkOrdForslag [data-forslag]');
                    for (var i = 0; i < chips.length; i++) {
                        var v = chips[i].getAttribute('data-forslag');
                        if (v === ord || gkSavedWords.indexOf(v) !== -1) {
                            chips[i].classList.add('saved');
                            if (chips[i].innerHTML.indexOf('gk-check-anim') === -1) chips[i].innerHTML = '<span class="gk-check-anim">&#10003;</span> ' + v;
                        } else {
                            // Sjekk delvis-treff
                            var erDekket = false;
                            var erDelvis = false;
                            for (var si = 0; si < gkSavedWords.length; si++) {
                                if (gkSavedWords[si].indexOf(v) !== -1) { erDekket = true; break; }
                            }
                            if (!erDekket) {
                                var ordDeler = v.split(/ +/);
                                for (var oi = 0; oi < ordDeler.length; oi++) {
                                    if (gkSavedWords.indexOf(ordDeler[oi]) !== -1) { erDelvis = true; break; }
                                    for (var li = 0; li < gkSavedWords.length; li++) {
                                        if (gkSavedWords[li].indexOf(ordDeler[oi]) !== -1) { erDelvis = true; break; }
                                    }
                                    if (erDelvis) break;
                                }
                            }
                            if (erDekket) { chips[i].classList.add('saved'); chips[i].innerHTML = '<span class="gk-check-anim">&#10003;</span> ' + v; }
                            else if (erDelvis) { chips[i].classList.add('partial'); chips[i].classList.remove('saved'); }
                        }
                    }
                    gkToast('Sokeord lagret: "' + ord + '"', 'success');
                };
                window.gkToast = gkToast;
                document.getElementById('adrModal').addEventListener('click', function(e) {
                    if (e.target === this) this.classList.remove('show');
                });
                document.getElementById('adrModalLukk').addEventListener('click', function() {
                    document.getElementById('adrModal').classList.remove('show');
                });
                document.getElementById('adrLeggTilBtn').addEventListener('click', function() {
                    var input = document.getElementById('adrNyInput');
                    var adr = input.value.trim();
                    if (!adr) return;
                    var kt = document.getElementById('adrModal').getAttribute('data-korttype') || 'adresse';
                    document.getElementById('adrStatus').textContent = 'Lagrer...';
                    window._avvikCh.postMessage({ type: 'LEGG_TIL_ADR', adresse: adr, kortType: kt });
                    input.value = '';
                });
                document.getElementById('ordLeggTilBtn').addEventListener('click', function() {
                    var input = document.getElementById('ordNyInput');
                    var ord = input.value.trim();
                    if (!ord) return;
                    var kt = document.getElementById('adrModal').getAttribute('data-korttype') || 'adresse';
                    document.getElementById('ordStatus').textContent = 'Lagrer...';
                    window._avvikCh.postMessage({ type: 'LEGG_TIL_ORD', ord: ord, kortType: kt });
                    input.value = '';
                });
            
                // === CLAIM-SYSTEM (v38.4.15-dev) ===
                window._avvikMittKrav = new Set();
                window._avvikAnnesKrav = new Map();

                function _avvikAnvendKrav() {
                    document.querySelectorAll('.card[data-rek]').forEach(function(el) {
                        var rek = el.getAttribute('data-rek');
                        if (!rek) return;
                        // Sett data-krav attributt
                        if (window._avvikMittKrav.has(rek)) {
                            el.setAttribute('data-krav', 'mitt');
                            el.removeAttribute('data-krav-sig');
                        } else if (window._avvikAnnesKrav.has(rek)) {
                            el.setAttribute('data-krav', 'annen');
                            el.setAttribute('data-krav-sig', window._avvikAnnesKrav.get(rek) || 'annen bruker');
                        } else {
                            el.removeAttribute('data-krav');
                            el.removeAttribute('data-krav-sig');
                        }
                        // Sørg for at lås-ikon finnes absolutt posisjonert nederst til venstre
                        var knapp = el.querySelector(':scope > .ovr-las-knapp');
                        if (!knapp) {
                            knapp = document.createElement('button');
                            knapp.className = 'ovr-las-knapp';
                            knapp.setAttribute('data-rek', rek);
                            knapp.style.cssText = 'position:absolute; bottom:8px; left:8px; width:32px; height:32px; padding:0; border:none; border-radius:50%; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; box-shadow:0 1px 3px rgba(0,0,0,0.15); z-index:5;';
                            el.appendChild(knapp);
                        }
                        if (window._avvikMittKrav.has(rek)) {
                            knapp.innerHTML = '🔒';
                            knapp.style.background = '#3b82f6';
                            knapp.disabled = false;
                            knapp.style.cursor = 'pointer';
                            knapp.style.opacity = '1';
                            knapp.title = 'Låst av deg — klikk for å frigi';
                        } else if (window._avvikAnnesKrav.has(rek)) {
                            var sig = window._avvikAnnesKrav.get(rek) || 'annen bruker';
                            knapp.innerHTML = '🔒';
                            knapp.style.background = '#64748b';
                            knapp.disabled = true;
                            knapp.style.cursor = 'not-allowed';
                            knapp.style.opacity = '0.8';
                            knapp.title = 'Låst av ' + sig;
                        } else {
                            knapp.innerHTML = '🔓';
                            knapp.style.background = '#e2e8f0';
                            knapp.disabled = false;
                            knapp.style.opacity = '1';
                            knapp.style.cursor = 'pointer';
                            knapp.title = 'Klikk for å låse — andre ser at du jobber med den';
                        }
                    });
                }

                // Observer som reanvender krav når nye kort rendres
                // Debounced anvendkrav for å unngå feedback-loop (observer trigger når vi selv muterer DOM)
                var _avvikDebounceTimer = null;
                var _avvikMutererSelv = false;
                function _avvikAnvendKravDebounced() {
                    if (_avvikMutererSelv) return; // hopper over når vi selv muterer
                    if (_avvikDebounceTimer) return; // allerede planlagt
                    _avvikDebounceTimer = setTimeout(function() {
                        _avvikDebounceTimer = null;
                        _avvikMutererSelv = true;
                        try { _avvikAnvendKrav(); } finally {
                            setTimeout(function() { _avvikMutererSelv = false; }, 0);
                        }
                    }, 150);
                }
                var _avvikObs = new MutationObserver(_avvikAnvendKravDebounced);
                var _cont = document.getElementById('container');
                if (_cont) _avvikObs.observe(_cont, { childList: true, subtree: true });

                // Lytt på KRAV_LISTE fra parent
                var _origOnmsg = _ch.onmessage;
                _ch.onmessage = function(e) {
                    if (e.data && e.data.type === 'KRAV_LISTE') {
                        window._avvikMittKrav = new Set(e.data.mine || []);
                        window._avvikAnnesKrav = new Map((e.data.andres || []).map(function(x) { return [x.rek_nr, x.signatur]; }));
                        _avvikAnvendKrav();
                        return;
                    }

                // === TOASTER (v38.4.15-dev) ===
                function _ovrToast(melding, type) {
                    var wrap = document.getElementById('ovr-toaster');
                    if (!wrap) {
                        wrap = document.createElement('div');
                        wrap.id = 'ovr-toaster';
                        document.body.appendChild(wrap);
                    }
                    var t = document.createElement('div');
                    t.className = 'ovr-toast' + (type === 'avvik' ? ' avvik' : '');
                    t.textContent = melding;
                    wrap.appendChild(t);
                    requestAnimationFrame(function() { t.classList.add('vis'); });
                    setTimeout(function() {
                        t.classList.remove('vis');
                        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
                    }, 3500);
                }
                    if (e.data && e.data.type === 'KRAV_AVVIST') {
                        // Vis toast — turen ble låst av noen annen mens du klikket
                        _ovrToast('Allerede låst av ' + (e.data.signatur || 'annen bruker'), 'avvik');
                        // Fjern optimistisk krav
                        window._avvikMittKrav.delete(e.data.rek_nr);
                        _avvikAnvendKrav();
                        return;
                    }
                    if (e.data && e.data.type === 'GODKJENT_AV_ANNEN') {
                        var kortEl = document.querySelector('.card[data-rek="' + e.data.rek_nr + '"]');
                        if (kortEl) {
                            kortEl.classList.add('fader-ut');
                            setTimeout(function() { if (kortEl.parentNode) kortEl.parentNode.removeChild(kortEl); }, 900);
                        }
                        _ovrToast('Behandlet av ' + (e.data.signatur || 'annen bruker'), 'ok');
                        return;
                    }
                    if (typeof _origOnmsg === 'function') _origOnmsg(e);
                };



                // Idle-timeout for modal — 10 min uten mus/tastatur = auto-frigi


                // Klikk kun på lås-knapp = toggle claim. Resten av kortet er fritt for tekst-markering.
                document.addEventListener('click', function(ev) {
                    var knapp = ev.target.closest('.ovr-las-knapp');
                    if (!knapp) return;
                    ev.preventDefault();
                    ev.stopPropagation();
                    var rek = knapp.getAttribute('data-rek');
                    if (!rek) return;
                    if (window._avvikAnnesKrav.has(rek)) return;
                    if (window._avvikMittKrav.has(rek)) {
                        window._avvikMittKrav.delete(rek);
                        _avvikAnvendKrav();
                        window._avvikCh.postMessage({ type: 'FRIGI_KRAV', rek_nr: rek });
                        return;
                    }
                    var tidl = Array.from(window._avvikMittKrav)[0];
                    if (tidl && tidl !== rek) {
                        window._avvikMittKrav.delete(tidl);
                        window._avvikCh.postMessage({ type: 'FRIGI_KRAV', rek_nr: tidl });
                    }
                    window._avvikMittKrav.add(rek);
                    _avvikAnvendKrav();
                    window._avvikCh.postMessage({ type: 'KREV_KRAV', rek_nr: rek });
                });
            
            <\/script>
        </body></html>`);
        window.mqWin.document.close();
        window.mqWin._gkGrunner = godkjenteGrunnerGH;
    }

    // ==================================================================
    //    HEARTBEAT (BroadcastChannel -- sjekker popup-kontakt)
    // ==================================================================
    window._avvikHeartbeatTimer = setInterval(() => {
        avvikChannel.postMessage({ type: 'HEARTBEAT' });
    }, 15000);

    // ==================================================================
    //    SERVER KEEPALIVE -- holder NISSY-sesjonen i live
    //    Pinger serveren hvert 3. minutt med en lett forespørsel
    // ==================================================================
    async function sjekkDispatchSesjon() {
        try {
            const res = await fetch(`ajax-dispatch?update=false&t=${Date.now()}`, { credentials: 'same-origin' });
            if (res.status === 401 || res.status === 403) {
                console.warn('[KEEPALIVE] Sesjonen utløpt (HTTP ' + res.status + ')');
                avvikChannel.postMessage({ type: 'SESJON_UTLOPT' });
                return false;
            }
            if (res.ok) {
                const tekst = await res.text();
                const erLoginSide = tekst.includes('Logg inn') || tekst.includes('logg inn') ||
                    (!tekst.includes('<?xml') && !tekst.includes('<dispatch') && tekst.length < 3000);
                if (erLoginSide) {
                    console.warn('[KEEPALIVE] Sesjonen utløpt (login-side detektert i respons)');
                    avvikChannel.postMessage({ type: 'SESJON_UTLOPT' });
                    return false;
                }
                console.log(`[KEEPALIVE] OK (${res.status})`);
                return true;
            }
        } catch (e) {
            console.warn('[KEEPALIVE] Ping feilet:', e.message);
        }
        return false;
    }

    // Sjekk umiddelbart ved oppstart
    sjekkDispatchSesjon();

    if (window._avvikKeepaliveTimer) clearInterval(window._avvikKeepaliveTimer);
    window._avvikKeepaliveTimer = setInterval(sjekkDispatchSesjon, 180000); // 3 minutter

    // ==================================================================
    //    ADMIN KEEPALIVE -- holder Admin-sesjonen i live
    //    Pinger admin hvert 5. minutt når man er innlogget
    // ==================================================================
    if (window._avvikAdminKeepaliveTimer) clearInterval(window._avvikAdminKeepaliveTimer);
    window._avvikAdminKeepaliveTimer = setInterval(async () => {
        if (!adminTilgjengelig) return;
        try {
            const res = await fetch(`${ADMIN_BASE}/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (res.status === 401 || res.status === 403) {
                console.warn('[ADMIN-KEEPALIVE] Sesjonen utløpt (HTTP ' + res.status + ')');
                adminTilgjengelig = false;
                avvikChannel.postMessage({ type: 'ADMIN_SESJON_UTLOPT' });
                return;
            }
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                console.warn('[ADMIN-KEEPALIVE] Sesjonen utløpt (login-side detektert)');
                adminTilgjengelig = false;
                avvikChannel.postMessage({ type: 'ADMIN_SESJON_UTLOPT' });
                return;
            }
            console.log('[ADMIN-KEEPALIVE] OK');
        } catch (e) {
            console.warn('[ADMIN-KEEPALIVE] Ping feilet:', e.message);
        }
    }, 300000); // 5 minutter

    // ==================================================================
    //    BroadcastChannel HANDLERS                                     
    // ==================================================================
    let aktivtSkann = null;
    let autoRefreshAktiv = false;
    let autoRefreshTimer = null;
    const AUTO_REFRESH_INTERVALL = 60000; // 60 sekunder

    function startAutoRefresh() {
        stoppAutoRefresh();
        autoRefreshAktiv = true;
        let gjenstaar = AUTO_REFRESH_INTERVALL / 1000;
        function oppdaterNedtelling() {
            const win = window.mqWin;
            if (!win || win.closed) return;
            const el = win.document.getElementById('autoRefreshCountdown');
            if (el) el.textContent = gjenstaar > 0 ? `(${gjenstaar}s)` : '';
        }
        oppdaterNedtelling();
        window._avvikAutoRefreshTimer = autoRefreshTimer = setInterval(() => {
            gjenstaar--;
            if (gjenstaar <= 0) {
                stoppAutoRefresh();
                if (aktivtSkann) {
                    autoRefreshAktiv = true;
                    avvikChannel.postMessage({ type: 'OPPDATER' });
                }
            } else {
                const win = window.mqWin;
                if (!win || win.closed) return;
                const el = win.document.getElementById('autoRefreshCountdown');
                if (el) el.textContent = `(${gjenstaar}s)`;
            }
        }, 1000);
    }

    function stoppAutoRefresh() {
        if (autoRefreshTimer) { clearInterval(autoRefreshTimer); autoRefreshTimer = null; }
        const win = window.mqWin;
        if (win && !win.closed) {
            const el = win.document.getElementById('autoRefreshCountdown');
            if (el) el.textContent = '';
        }
    }

    avvikChannel.onmessage = async (e) => {
        const data = e.data;

        // === CLAIM-SYSTEM (v38.4.15-dev) ===
        if (data.type === 'KREV_KRAV') {
            try {
                const params = new URLSearchParams({ action: 'krev', rek_nr: data.rek_nr, nissy_id: NISSY_BRUKERNAVN || 'ukjent', signatur: SIGNATUR || '' });
                const res = await fetch(`${SERVER_BASE}/ovr_krav.php?${params}`);
                const r = await res.json();
                if (r.ok && r.mitt) {
                    _mineKrav.add(data.rek_nr);
                } else if (r.ok && !r.mitt) {
                    avvikChannel.postMessage({ type: 'KRAV_AVVIST', rek_nr: data.rek_nr, signatur: r.signatur });
                }
                await _synkroniserKrav();
            } catch(err) { console.warn('[KRAV] feil:', err.message); }
            return;
        }
        if (data.type === 'FRIGI_KRAV') {
            try {
                const params = new URLSearchParams({ action: 'frigi', rek_nr: data.rek_nr, nissy_id: NISSY_BRUKERNAVN || '' });
                await fetch(`${SERVER_BASE}/ovr_krav.php?${params}`);
                _mineKrav.delete(data.rek_nr);
                await _synkroniserKrav();
            } catch(err) {}
            return;
        }

        if (data.type === 'SKANN') {
            aktivtSkann = data.sjekk;
            const win = window.mqWin;
            if (win && !win.closed) {
                const landing = win.document.getElementById('landingsside');
                const cont = win.document.getElementById('container');
                if (landing) landing.style.display = 'none';
                if (cont) cont.style.display = '';
                cont.innerHTML = '<div style="text-align:center; padding:20px;"><button class="tilbake-btn" onclick="window._avvikCh.postMessage({type:\'TILBAKE\'})">&larr; Tilbake</button></div>';
            }
            await kjorSkann(data.sjekk);
        }

        if (data.type === 'TILBAKE') {
            aktivtSkann = null;
            autoRefreshAktiv = false;
            stoppAutoRefresh();
            const win = window.mqWin;
            if (win && !win.closed) {
                const landing = win.document.getElementById('landingsside');
                const statsBar = win.document.getElementById('statsBar');
                const cont = win.document.getElementById('container');
                if (landing) landing.style.display = '';
                if (statsBar) statsBar.style.display = 'none';
                if (cont) { cont.style.display = 'none'; cont.innerHTML = ''; }
            }
        }

        if (data.type === 'GODKJENN') {
            godkjennTur(data.turid, data.grunn || '', data.rekNr || '');
            loggHandling('GODKJENN', {
                seksjon: data.seksjon || data.kortType || '',
                rek_nr: data.rekNr || '',
                tur_id: data.turid || '',
                res_id: data.resId || '',
                grunn: data.grunn || ''
            });
            fadeOgFjern(data.id);
        }

        if (data.type === 'SKJUL_BARN_SAARBAR') {
            // Lagrer i godkjentIMinne + localStorage — filtreres bort ved neste skann
            godkjennTur(data.turid, 'SÅRBAR godkjent', data.rekNr || '');
            fadeOgFjern(data.id);
        }


        if (data.type === 'GODKJENN_DUBLETT') {
            godkjennTur(data.turid1, 'Godkjent dublett', data.rekNr1 || '');
            godkjennTur(data.turid2, 'Godkjent dublett', data.rekNr2 || '');
            loggHandling('GODKJENN_DUBLETT', {
                seksjon: 'dublett',
                rek_nr: data.rekNr1 || '',
                tur_id: data.turid1 || '',
                grunn: 'Godkjent dublett',
                detaljer: { turid1: data.turid1, turid2: data.turid2, rekNr2: data.rekNr2 }
            });
            fadeOgFjern(data.id1);
        }

        if (data.type === 'AVVIK') {
            console.log(`[AVVIK] Mottatt: id=${data.id}, rekNr=${data.rekNr}, rekvirent=${data.rekvirent}`);
            loggHandling('AVVIK_REG', {
                seksjon: data.seksjon || data.kortType || '',
                rek_nr: data.rekNr || '',
                tur_id: data.turid || '',
                res_id: data.resId || '',
                rekvirent: data.rekvirent || '',
                bestiller: data.bestiller || ''
            });
            const win = window.mqWin;
            if (!win || win.closed) { console.warn('[AVVIK] Popup-vindu mangler eller lukket'); return; }
            const card = win.document.querySelector(`[data-rid="${data.id}"]`);
            if (!card) { console.warn(`[AVVIK] Fant ikke kort med data-rid="${data.id}"`); return; }

            const rekNr = data.rekNr || data.id;

            let avvikDiv = card.querySelector('.avvik-info');
            if (!avvikDiv) {
                avvikDiv = win.document.createElement('div');
                avvikDiv.className = 'avvik-info';
                card.appendChild(avvikDiv);
            }
            avvikDiv.innerHTML = `
                <div style="padding:12px 15px; background:#fef2f2; border-top:2px solid #ef4444;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <span style="font-weight:bold; color:#991b1b;">Rek.nr:</span>
                        <span style="font-size:15px; font-weight:bold;">${rekNr || 'Ikke funnet'}</span>
                        ${rekNr ? `<span style="cursor:pointer; user-select:none;" title="Kopier rek.nr." onclick="navigator.clipboard.writeText('${rekNr}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                        <span style="font-weight:bold; color:#991b1b;">Rekvirent:</span>
                        <span>${data.rekvirent || 'Ikke funnet'}</span>
                    </div>
                    ${data.bestiller ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;"><span style="font-weight:bold; color:#991b1b;">Bestiller:</span><span>' + data.bestiller + '</span></div>' : ''}
                    ${data.ansvarligRekvirent ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;"><span style="font-weight:bold; color:#991b1b;">Ansvarlig rekvirent:</span><span>' + data.ansvarligRekvirent + '</span></div>' : ''}
                    ${data.sistEndretBruker ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="font-weight:bold; color:#991b1b;">Sist endret:</span><span>' + data.sistEndretBruker + '</span></div>' : '<div style="margin-bottom:6px;"></div>'}
                    <div style="display:flex; gap:8px;">
                        <button onclick="window._avvikCh.postMessage({type:'AVVIK_AVBRYT', id:'${data.id}', resId:'${data.resId || ''}', turid:'${data.turid || ''}'})" class="btn-nissy" style="background:#ef4444; color:white;">&#10060; Avbryt</button>
                        <button onclick="window._avvikCh.postMessage({type:'AVVIK_FERDIG', id:'${data.id}', resId:'${data.resId || ''}', turid:'${data.turid || ''}'})" class="btn-nissy" style="background:#10b981; color:white;">&#10004; Ferdig</button>
                    </div>
                </div>`;
        }

        if (data.type === 'AVVIK_DUBLETT') {
            loggHandling('AVVIK_REG', {
                seksjon: 'dublett',
                rek_nr: data.rekNr || '',
                tur_id: data.turid1 || '',
                res_id: data.resId || '',
                rekvirent: data.rekvirent || '',
                bestiller: data.bestiller || '',
                detaljer: { turid1: data.turid1, turid2: data.turid2, start1: data.start1, start2: data.start2, rmate1: data.rmate1, rmate2: data.rmate2 }
            });
            const win = window.mqWin;
            if (!win || win.closed) return;
            const card = win.document.querySelector(`[data-rid="${data.id}"]`);
            if (!card) return;
            const rekNr = data.rekNr || data.id;
            let avvikDiv = card.querySelector('.avvik-info');
            if (!avvikDiv) { avvikDiv = win.document.createElement('div'); avvikDiv.className = 'avvik-info'; card.appendChild(avvikDiv); }
            avvikDiv.innerHTML = `
                <div style="padding:12px 15px; background:#fef2f2; border-top:2px solid #ef4444;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <span style="font-weight:bold; color:#991b1b;">Rek.nr:</span>
                        <span style="font-size:15px; font-weight:bold;">${rekNr || 'Ikke funnet'}</span>
                        ${rekNr ? `<span style="cursor:pointer; user-select:none;" title="Kopier rek.nr." onclick="navigator.clipboard.writeText('${rekNr}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>` : ''}
                    </div>
                    <div style="margin-bottom:8px; padding:8px; background:#fff5f5; border:1px solid #fecaca; border-radius:6px;">
                        <div style="font-weight:bold; color:#991b1b; margin-bottom:4px;">Reise 1</div>
                        <div>Turid: <strong>${data.turid1 || '?'}</strong> | Start: <strong>${data.start1 || '?'}</strong> | Reisemåte: <strong>${data.rmate1 || '?'}</strong></div>
                    </div>
                    <div style="margin-bottom:8px; padding:8px; background:#fff5f5; border:1px solid #fecaca; border-radius:6px;">
                        <div style="font-weight:bold; color:#991b1b; margin-bottom:4px;">Reise 2</div>
                        <div>Turid: <strong>${data.turid2 || '?'}</strong> | Start: <strong>${data.start2 || '?'}</strong> | Reisemåte: <strong>${data.rmate2 || '?'}</strong></div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                        <span style="font-weight:bold; color:#991b1b;">Rekvirent:</span>
                        <span>${data.rekvirent || 'Ikke funnet'}</span>
                    </div>
                    ${data.bestiller ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;"><span style="font-weight:bold; color:#991b1b;">Bestiller:</span><span>' + data.bestiller + '</span></div>' : ''}
                    ${data.ansvarligRekvirent ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;"><span style="font-weight:bold; color:#991b1b;">Ansvarlig rekvirent:</span><span>' + data.ansvarligRekvirent + '</span></div>' : ''}
                    ${data.sistEndretBruker ? '<div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"><span style="font-weight:bold; color:#991b1b;">Sist endret:</span><span>' + data.sistEndretBruker + '</span></div>' : '<div style="margin-bottom:6px;"></div>'}
                    <div style="display:flex; gap:8px;">
                        <button onclick="window._avvikCh.postMessage({type:'AVVIK_AVBRYT', id:'${data.id}', resId:'${data.resId || ''}', turid:'${data.turid1 || ''}'})" class="btn-nissy" style="background:#ef4444; color:white;">&#10060; Avbryt</button>
                        <button onclick="window._avvikCh.postMessage({type:'AVVIK_FERDIG', id:'${data.id}', resId:'${data.resId || ''}', turid:'${data.turid1 || ''}'})" class="btn-nissy" style="background:#10b981; color:white;">&#10004; Ferdig</button>
                    </div>
                </div>`;
        }

        if (data.type === 'HENT_ADMIN_INFO') {
            const win = window.mqWin;
            if (!win || win.closed) return;
            const infoDiv = win.document.getElementById(`adminInfo-${data.reqId}`);
            const adminBtn = win.document.getElementById(`btnAdmin-${data.reqId}`);
            try {
                const admin = adminTilgjengelig ? await hentAdminData(data.reqId, data.resId || null) : null;
                const rekNr = admin && admin.rekNr ? admin.rekNr : await hentRekNr(data.reqId);
                const turid = data.resId || data.reqId;
                if (infoDiv) {
                    infoDiv.innerHTML = `<div style="margin-top:8px; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; font-size:13px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="color:#64748b;">Rek.nr:</span>
                            <strong>${rekNr || 'Ikke funnet'}</strong>
                            ${rekNr ? `<button class="btn-nissy" style="padding:2px 8px; font-size:11px;" onclick="navigator.clipboard.writeText('${rekNr}'); this.textContent='\u2713'; setTimeout(() => this.textContent='Kopier', 2000)">Kopier</button>` : ''}
                        </div>
                    </div>`;
                }
                if (adminBtn) adminBtn.style.display = 'none';
                // Fyll inn rek.nr i header og data-attributt
                if (rekNr) {
                    const card = win.document.querySelector(`[data-rid="${data.reqId}"]`);
                    if (card) card.setAttribute('data-reknr', rekNr);
                    const rekSpan = win.document.getElementById(`rekNr-${data.reqId}`);
                    if (rekSpan && !rekSpan.textContent.trim()) {
                        rekSpan.innerHTML = `&nbsp;| Rek: ${rekNr} <span style="cursor:pointer; user-select:none;" title="Kopier rek.nr." onclick="navigator.clipboard.writeText('${rekNr}'); this.textContent='\\u2705'; setTimeout(() => this.textContent='\\ud83d\\udccb', 1500)">&#128203;</span>`;
                    }
                }
                console.log(`[ADMIN-INFO] Turid=${turid}, Rek=${rekNr}`);
            } catch (e) {
                if (infoDiv) infoDiv.innerHTML = `<div style="color:#ef4444; font-size:12px; margin-top:4px;">Feil: ${e.message}</div>`;
                if (adminBtn) { adminBtn.disabled = false; adminBtn.textContent = 'Prøv igjen'; }
                console.warn('[ADMIN-INFO] Feil:', e.message);
            }
        }

        if (data.type === 'AVVIK_AVBRYT') {
            loggHandling('AVVIK_AVBRYT', {
                rek_nr: data.rekNr || '',
                tur_id: data.turid || '',
                res_id: data.resId || ''
            });
            const card = window.mqWin?.document.querySelector(`[data-rid="${data.id}"]`);
            const avvikDiv = card?.querySelector('.avvik-info');
            if (avvikDiv) avvikDiv.remove();
        }

        if (data.type === 'AVVIK_FERDIG') {
            if (data.turid || data.rekNr) { godkjennTur(data.turid, '', data.rekNr || ''); }
            loggHandling('AVVIK_FERDIG', {
                rek_nr: data.rekNr || '',
                tur_id: data.turid || '',
                res_id: data.resId || ''
            });
            fadeOgFjern(data.id);
        }

        if (data.type === 'VIS_NISSY') {
            if (typeof showReq === 'function') {
                showReq(null, data.reqId);
            }
        }

        if (data.type === 'SOK_PNR') {
            try {
                // Steg 1: Nullstill eksisterende søk
                console.log(`[SOK] Nullstiller søk først...`);
                await xhrRequest(`ajax-dispatch?did=all&search=none&t=${Date.now()}`, { timeout: 10000 });
                // Steg 2: Sett nytt PNR-søk
                const url = `ajax-dispatch?did=all&search=ssn%3A${data.pnr}`;
                console.log(`[SOK] Setter PNR-søk: ${data.pnr}`);
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = () => {
                    console.log(`[SOK] Dispatch-søk satt`);
                    if (typeof refreshDispatch === 'function') { refreshDispatch(); console.log('[SOK] refreshDispatch OK'); }
                    else if (typeof doSearch === 'function') { doSearch(); console.log('[SOK] doSearch OK'); }
                    else { console.log('[SOK] Ingen refresh-funksjon funnet — søket er satt i sesjonen'); }
                };
                xhr.send();
            } catch (e) {
                console.warn('[SOK] Feil:', e);
            }
        }

        if (data.type === 'TOGGLE_ORD') {
            window.mqBrukGodkjenteOrd = data.checked;
            if (aktivtSkann === 'adresse') await kjorSkann('adresse');
        }

        if (data.type === 'TOGGLE_ADRESSER') {
            window.mqBrukGodkjenteAdresser = data.checked;
            if (aktivtSkann === 'adresse') await kjorSkann('adresse');
        }

        if (data.type === 'TOGGLE_AUTO_KM') {
            window.mqAutoKm = data.checked;
            console.log(`[*] Auto-km: ${data.checked}`);
            if (aktivtSkann === 'adresse') await kjorSkann('adresse');
        }

        if (data.type === 'VIS_GODKJENN_MODAL') {
            const win = window.mqWin;
            if (!win || win.closed) return;
            // Sett riktig grunner basert på kortType
            win._gkGrunner = (data.kortType === 'adresse') ? godkjenteAdresseGrunnerGH : godkjenteGrunnerGH;
            if (win._gkSetPending) win._gkSetPending(data);
        }

        if (data.type === 'GODKJENN_LAGRE_ADR') {
            const win = window.mqWin;
            const resultat = await lagreGodkjentAdresse(data.adresse, data.kortType || 'adresse', data.navn || '');
            if (win && !win.closed && win.gkToast) {
                win.gkToast(resultat.melding, resultat.ok ? 'success' : 'info');
            }
            if (resultat.ok) {
                if (data.turid || data.rekNr) { godkjennTur(data.turid, '', data.rekNr || ''); }
                loggHandling('GODKJENN', {
                    seksjon: data.kortType || 'adresse',
                    rek_nr: data.rekNr || '',
                    tur_id: data.turid || '',
                    grunn: 'Lagret adresse: ' + (data.adresse || '')
                });
                fadeAlleMatchende(data.adresse);
                setTimeout(() => { if (win && !win.closed) win.document.getElementById('gkModal').classList.remove('show'); }, 800);
            }
        }

        if (data.type === 'GODKJENN_LAGRE_ORD') {
            const win = window.mqWin;
            const resultat = await lagreGodkjentOrd(data.ord, data.kortType || 'adresse');
            if (resultat.ok) {
                // Alltid fjern alle matchende kort
                fadeAlleMatchende(data.ord);
                if (data.fraForslag && win && !win.closed && win._forslagLagret) {
                    win._forslagLagret(data.ord);
                } else {
                    if (data.turid || data.rekNr) { godkjennTur(data.turid, '', data.rekNr || ''); }
                    loggHandling('GODKJENN', {
                        seksjon: data.kortType || 'adresse',
                        rek_nr: data.rekNr || '',
                        tur_id: data.turid || '',
                        grunn: 'Lagret ord: ' + (data.ord || '')
                    });
                    if (win && !win.closed && win.gkToast) win.gkToast(resultat.melding, 'success');
                    setTimeout(() => { if (win && !win.closed) win.document.getElementById('gkModal').classList.remove('show'); }, 800);
                }
            } else {
                if (win && !win.closed && win.gkToast) win.gkToast(resultat.melding, 'info');
            }
        }

        if (data.type === 'GODKJENN_LAGRE_POSTNR') {
            const win = window.mqWin;
            const resultat = await lagreGodkjentPostnr(data.postnr);
            if (win && !win.closed && win.gkToast) {
                win.gkToast(resultat.melding, resultat.ok ? 'amber' : 'info');
            }
            if (resultat.ok) {
                if (data.turid || data.rekNr) { godkjennTur(data.turid, '', data.rekNr || ''); }
                loggHandling('GODKJENN', {
                    seksjon: 'postnr',
                    rek_nr: data.rekNr || '',
                    tur_id: data.turid || '',
                    grunn: 'Lagret postnr: ' + (data.postnr || '')
                });
                fadeOgFjern(data.reqId);
                setTimeout(() => { if (win && !win.closed) win.document.getElementById('gkModal').classList.remove('show'); }, 800);
            }
        }

        if (data.type === 'VIS_ADR_MODAL') {
            const win = window.mqWin;
            if (!win || win.closed) return;
            const modal = win.document.getElementById('adrModal');
            const liste = win.document.getElementById('adrListe');
            const ordListeEl = win.document.getElementById('ordListe');
            const status = win.document.getElementById('adrStatus');
            const ordSt = win.document.getElementById('ordStatus');
            const tittelEl = win.document.getElementById('adrModalTittel');
            if (!modal) return;
            const erKommune = data.kortType === 'kommune';
            // Sett tittel
            if (tittelEl) tittelEl.textContent = erKommune ? '\ud83c\udfe5 Kommune-adresser og s\u00f8keord' : '\ud83d\udccd Godkjente adresser og s\u00f8keord';
            // Velg riktig datasett
            const adrData = erKommune ? godkjenteKommuneAdresserGH : godkjenteAdresserGH;
            const ordData = erKommune ? godkjenteKommuneOrdGH : godkjenteOrdGH;
            const slettAdrType = erKommune ? 'SLETT_KOM_ADR' : 'SLETT_ADR';
            const slettOrdType = erKommune ? 'SLETT_KOM_ORD' : 'SLETT_ORD';
            // Lagre aktiv kortType på modal for LEGG_TIL
            modal.setAttribute('data-korttype', data.kortType || 'adresse');
            // Bygg adresse-liste (kort-format med navn, gate, postnr)
            function byggAdrKort(a, slettType) {
                const isObj = typeof a === 'object';
                const adrStr = isObj ? (a.adresse || '') : a;
                const navn = isObj ? (a.navn || '') : '';
                const gate = isObj && a.gate ? a.gate : (adrStr.match(/^(.+?),?\s*\d{4}/) || [, adrStr])[1];
                const postnr = isObj && a.postnr ? a.postnr : (adrStr.match(/(\d{4})/) || [''])[0];
                const poststed = isObj && a.poststed ? a.poststed : (adrStr.match(/\d{4}\s+(.+)$/) || ['', ''])[1];
                const adrKey = String(adrStr).replace(/'/g, "\\'");
                const kt = slettType === 'SLETT_KOM_ADR' ? 'kommune' : 'adresse';
                return '<li style="border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; align-items:flex-start; gap:8px;">'
                    + '<div style="flex:1; line-height:1.5;">'
                    + (navn ? '<div style="font-weight:600; color:#334155;">' + navn + '</div>' : '<div style="font-size:11px; color:#94a3b8; cursor:pointer;" onclick="var n=prompt(\'Gi et navn:\'); if(n) window._avvikCh.postMessage({type:\'OPPDATER_ADR_NAVN\', adresse:\'' + adrKey + '\', navn:n, kortType:\'' + kt + '\'});">[+ legg til navn]</div>')
                    + '<div style="color:#475569;">' + gate + '</div>'
                    + (postnr ? '<div style="color:#64748b; font-size:12px;">' + postnr + ' ' + poststed.toUpperCase() + '</div>' : '')
                    + '</div>'
                    + '<button class="adr-slett" onclick="window._avvikCh.postMessage({type:\'' + slettType + '\', adresse:\'' + adrKey + '\'})" title="Fjern" style="flex-shrink:0;">&#10005;</button>'
                    + '</li>';
            }
            if (adrData.length === 0) {
                liste.innerHTML = '<li style="color:#94a3b8; font-style:italic;">Ingen adresser enn\u00e5</li>';
            } else {
                liste.innerHTML = adrData.map(a => byggAdrKort(a, slettAdrType)).join('');
            }
            // Bygg ord-liste
            if (ordListeEl) ordListeEl.innerHTML = ordData.length === 0
                ? '<li style="color:#94a3b8; font-style:italic;">Ingen s\u00f8keord enn\u00e5</li>'
                : ordData.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'${slettOrdType}', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            status.textContent = '';
            if (ordSt) ordSt.textContent = '';

            // Layout: kommune = 2-kolonne, adresse = standard
            const innerEl = modal.querySelector('.adr-modal-inner');
            const statiskEl = win.document.getElementById('adrStatiskInnhold');
            const komLayoutEl = win.document.getElementById('adrKommuneLayout');

            if (erKommune) {
                if (innerEl) innerEl.classList.add('kommune-layout');
                if (statiskEl) statiskEl.style.display = 'none';

                // Bygg 2-kolonne layout
                const adrListeHtml = adrData.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen adresser enn\u00e5</li>'
                    : adrData.map(a => byggAdrKort(a, slettAdrType)).join('');
                const ordListeHtml = ordData.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen s\u00f8keord enn\u00e5</li>'
                    : ordData.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'${slettOrdType}', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');

                let h = '<div style="display:flex; gap:16px; align-items:flex-start;">';
                // Kolonne 1: Adresser
                h += '<div style="flex:1; min-width:0; border-right:1px solid #e2e8f0; padding-right:16px;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#334155;">Adresser</h4>';
                h += '<ul class="adr-liste" style="max-height:55vh; overflow-y:auto;">' + adrListeHtml + '</ul>';
                h += '<div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">';
                h += '<input type="text" id="komAdrNavn" placeholder="Navn (f.eks. Ullev\u00e5l sykehus)" style="padding:5px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;" />';
                h += '<input type="text" id="komAdrGate" placeholder="Gate (f.eks. kirkeveien 64a)" style="padding:5px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;" />';
                h += '<div style="display:flex; gap:4px;">';
                h += '<input type="text" id="komAdrPostnr" placeholder="Postnr" maxlength="4" style="width:70px; padding:5px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; letter-spacing:0.1em;" />';
                h += '<input type="text" id="komAdrPoststed" placeholder="Poststed" style="flex:1; padding:5px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;" />';
                h += '<button class="btn-nissy" style="padding:5px 12px; font-size:12px;" onclick="var n=document.getElementById(\'komAdrNavn\').value.trim(), g=document.getElementById(\'komAdrGate\').value.trim(), p=document.getElementById(\'komAdrPostnr\').value.trim(), s=document.getElementById(\'komAdrPoststed\').value.trim(); if(n&&g&&p) { window._avvikCh.postMessage({type:\'LEGG_TIL_KOM_ADR_FULL\', navn:n, gate:g, postnr:p, poststed:s}); document.getElementById(\'komAdrNavn\').value=\'\'; document.getElementById(\'komAdrGate\').value=\'\'; document.getElementById(\'komAdrPostnr\').value=\'\'; document.getElementById(\'komAdrPoststed\').value=\'\'; } else { alert(\'Fyll ut navn, gate og postnr\'); }">+</button>';
                h += '</div></div>';
                h += '</div>';
                // Kolonne 2: Søkeord
                h += '<div style="flex:1; min-width:0; border-right:1px solid #e2e8f0; padding-right:16px;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#334155;">S\u00f8keord</h4>';
                h += '<ul class="adr-liste" style="max-height:55vh; overflow-y:auto;">' + ordListeHtml + '</ul>';
                h += '<div class="adr-input-rad"><input type="text" id="komOrdInput" placeholder="f.eks. \u00f8yelege" /><button class="btn-nissy" onclick="var v=document.getElementById(\'komOrdInput\').value.trim(); if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_ORD\', ord:v, kortType:\'kommune\'}); document.getElementById(\'komOrdInput\').value=\'\';">+</button></div>';
                h += '</div>';
                // Kolonne 3: Sykehus-postnr + Spesialist-kombi + Rute-kombo
                h += '<div style="flex:1; min-width:0;">';
                // Sykehus-postnr
                h += '<div style="border:1px solid #f59e0b; border-radius:8px; padding:10px; margin-bottom:12px; background:#fffbeb;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#92400e;">Sykehus-postnr (kanskje)</h4>';
                h += '<ul class="adr-liste">' + (godkjenteSykehusPostnrGH.length === 0 ? '<li style="color:#94a3b8; font-style:italic;">Ingen</li>' : godkjenteSykehusPostnrGH.map(p => `<li><span>${p}${hentKommune(p) ? ' (' + hentKommune(p) + ')' : ''}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_SYKEHUS_POSTNR', postnr:'${p}'})" title="Fjern">&#10005;</button></li>`).join('')) + '</ul>';
                h += '<input id="sykPostnrInput" placeholder="Postnr (4 siffer)" style="width:100%; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; box-sizing:border-box; margin-bottom:6px;">';
                h += '<button class="adr-legg-til" style="width:100%; padding:5px 0;" onclick="var v=document.getElementById(\'sykPostnrInput\').value; if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_SYKEHUS_POSTNR\', postnr:v}); document.getElementById(\'sykPostnrInput\').value=\'\';">Legg til</button>';
                h += '</div>';
                // Spesialist-kombi
                h += '<div style="border:1px solid #ef4444; border-radius:8px; padding:10px; margin-bottom:12px; background:#fef2f2;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#166534;">Spesialist-kombi (godkjent)</h4>';
                h += '<ul class="adr-liste">' + (godkjenteSpesialistKombiGH.length === 0 ? '<li style="color:#94a3b8; font-style:italic;">Ingen</li>' : godkjenteSpesialistKombiGH.map(k => `<li><span>${k.ord} @ ${k.postnr}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_SPESIALIST_KOMBI', ord:'${k.ord.replace(/'/g,"\\'")}', postnr:'${k.postnr}'})" title="Fjern">&#10005;</button></li>`).join('')) + '</ul>';
                h += '<div style="display:flex; gap:4px; margin-bottom:6px;"><input id="spKombiOrd" placeholder="Ord" style="flex:2; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;"><input id="spKombiPostnr" placeholder="Postnr" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;"></div>';
                h += '<button class="adr-legg-til" style="width:100%; padding:5px 0;" onclick="var o=document.getElementById(\'spKombiOrd\').value,p=document.getElementById(\'spKombiPostnr\').value; if(o&&p) window._avvikCh.postMessage({type:\'LEGG_TIL_SPESIALIST_KOMBI\', ord:o, postnr:p}); document.getElementById(\'spKombiOrd\').value=\'\'; document.getElementById(\'spKombiPostnr\').value=\'\';">Legg til</button>';
                h += '</div>';
                // Rute-kombo
                h += '<div style="border:1px solid #ef4444; border-radius:8px; padding:10px; background:#fef2f2;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#166534;">Rute-kombo (godkjent)</h4>';
                h += '<ul class="adr-liste">' + (godkjenteRuteKombiGH.length === 0 ? '<li style="color:#94a3b8; font-style:italic;">Ingen</li>' : godkjenteRuteKombiGH.map(k => `<li><span>${k.a} \u2194 ${k.b}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_RUTE_KOMBI', a:'${k.a.replace(/'/g,"\\'")}', b:'${k.b.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('')) + '</ul>';
                h += '<div style="display:flex; gap:4px; margin-bottom:6px;"><input id="ruteA" placeholder="Sted A" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;"><input id="ruteB" placeholder="Sted B" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;"></div>';
                h += '<button class="adr-legg-til" style="width:100%; padding:5px 0;" onclick="var a=document.getElementById(\'ruteA\').value,b=document.getElementById(\'ruteB\').value; if(a&&b) window._avvikCh.postMessage({type:\'LEGG_TIL_RUTE_KOMBI\', a:a, b:b}); document.getElementById(\'ruteA\').value=\'\'; document.getElementById(\'ruteB\').value=\'\';">Legg til</button>';
                h += '</div>';
                // Godkjenningsgrunner
                h += '<div style="border:1px solid #10b981; border-radius:8px; padding:10px; margin-top:12px; background:#f0fdf4;">';
                h += '<h4 style="margin:0 0 6px; font-size:13px; color:#166534;">Godkjenningsgrunner</h4>';
                h += '<ul class="adr-liste">' + (godkjenteGrunnerGH.length === 0 ? '<li style="color:#94a3b8; font-style:italic;">Ingen</li>' : godkjenteGrunnerGH.map(g => `<li><span>${g}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_GRUNN', grunn:'${g.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('')) + '</ul>';
                h += '<div class="adr-input-rad"><input type="text" id="grunnInput" placeholder="f.eks. Kortere reise" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;" /><button class="btn-nissy" onclick="var v=document.getElementById(\'grunnInput\').value.trim(); if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_GRUNN\', grunn:v}); document.getElementById(\'grunnInput\').value=\'\';">+</button></div>';
                h += '</div>';
                h += '</div>';
                h += '</div>';

                if (komLayoutEl) { komLayoutEl.innerHTML = h; komLayoutEl.style.display = ''; }
            } else {
                if (innerEl) { innerEl.classList.remove('kommune-layout'); innerEl.classList.add('adresse-layout'); }
                if (statiskEl) statiskEl.style.display = 'none';

                const adrListeHtmlA = adrData.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen adresser enn\u00e5</li>'
                    : adrData.map(a => byggAdrKort(a, slettAdrType)).join('');
                const ordListeHtmlA = ordData.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen s\u00f8keord enn\u00e5</li>'
                    : ordData.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'${slettOrdType}', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');

                let ha = '<div style="display:flex; gap:16px; align-items:flex-start;">';
                // Venstre: Adresser
                ha += '<div style="flex:1; min-width:0; border-right:1px solid #e2e8f0; padding-right:16px;">';
                ha += '<h4 style="margin:0 0 6px; font-size:13px; color:#334155;">Adresser</h4>';
                ha += '<ul class="adr-liste" style="max-height:55vh; overflow-y:auto;">' + adrListeHtmlA + '</ul>';
                ha += '<div class="adr-input-rad"><input type="text" id="adrNyInputDyn" placeholder="f.eks. morteveien 19" /><button class="btn-nissy" onclick="var v=document.getElementById(\'adrNyInputDyn\').value.trim(); if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_ADR\', adresse:v, kortType:\'adresse\'}); document.getElementById(\'adrNyInputDyn\').value=\'\';">Legg til</button></div>';
                ha += '</div>';
                // Høyre: Søkeord
                ha += '<div style="flex:1; min-width:0;">';
                ha += '<h4 style="margin:0 0 6px; font-size:13px; color:#334155;">S\u00f8keord</h4>';
                ha += '<ul class="adr-liste" style="max-height:55vh; overflow-y:auto;">' + ordListeHtmlA + '</ul>';
                ha += '<div class="adr-input-rad"><input type="text" id="ordNyInputDyn" placeholder="f.eks. \u00f8yelege" /><button class="btn-nissy" onclick="var v=document.getElementById(\'ordNyInputDyn\').value.trim(); if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_ORD\', ord:v, kortType:\'adresse\'}); document.getElementById(\'ordNyInputDyn\').value=\'\';">Legg til</button></div>';
                // Godkjenningsgrunner for adresse
                ha += '<div style="border:1px solid #10b981; border-radius:8px; padding:10px; margin-top:12px; background:#f0fdf4;">';
                ha += '<h4 style="margin:0 0 6px; font-size:13px; color:#166534;">Godkjenningsgrunner</h4>';
                ha += '<ul class="adr-liste">' + (godkjenteAdresseGrunnerGH.length === 0 ? '<li style="color:#94a3b8; font-style:italic;">Ingen</li>' : godkjenteAdresseGrunnerGH.map(g => `<li><span>${g}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ADR_GRUNN', grunn:'${g.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('')) + '</ul>';
                ha += '<div class="adr-input-rad"><input type="text" id="adrGrunnInput" placeholder="f.eks. Kortere reise" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px;" /><button class="btn-nissy" onclick="var v=document.getElementById(\'adrGrunnInput\').value.trim(); if(v) window._avvikCh.postMessage({type:\'LEGG_TIL_ADR_GRUNN\', grunn:v}); document.getElementById(\'adrGrunnInput\').value=\'\';">+</button></div>';
                ha += '</div>';
                ha += '</div>';
                ha += '</div>';

                if (komLayoutEl) { komLayoutEl.innerHTML = ha; komLayoutEl.style.display = ''; }
            }

            modal.classList.add('show');
        }

        if (data.type === 'LEGG_TIL_ADR') {
            const win = window.mqWin;
            const kt = data.kortType || 'adresse';
            const status = win && !win.closed ? win.document.getElementById('adrStatus') : null;
            const resultat = await lagreGodkjentAdresse(data.adresse, kt);
            if (status) status.textContent = resultat.melding;
            if (resultat.ok) {
                fadeAlleMatchende(data.adresse);
                if (win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: kt });
            }
        }

        if (data.type === 'LEGG_TIL_KOM_ADR_FULL') {
            const win = window.mqWin;
            const gate = (data.gate || '').toLowerCase().trim();
            const postnr = (data.postnr || '').trim();
            const poststed = (data.poststed || '').trim();
            const navn = (data.navn || '').trim();
            const adresse = gate + ', ' + postnr + ' ' + poststed;
            if (godkjenteKommuneAdresserGH.some(a => hentAdrStreng(a) === adresse.toLowerCase())) {
                if (win && !win.closed && win.gkToast) win.gkToast('Allerede i listen', 'info');
                return;
            }
            const obj = { adresse: adresse.toLowerCase(), gate, postnr, poststed: poststed.toLowerCase(), navn };
            godkjenteKommuneAdresserGH = [...godkjenteKommuneAdresserGH, obj];
            try {
                await lagreGHKom();
                fadeAlleMatchende(gate);
                if (navn) fadeAlleMatchende(navn);
                if (win && !win.closed && win.gkToast) win.gkToast('Lagret!', 'success');
                if (win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
            } catch (e) {
                if (win && !win.closed && win.gkToast) win.gkToast('Feil: ' + e.message, 'info');
            }
        }

        if (data.type === 'SLETT_ADR' || data.type === 'SLETT_KOM_ADR') {
            const kt = data.type === 'SLETT_KOM_ADR' ? 'kommune' : 'adresse';
            const win = window.mqWin;
            const resultat = await slettGodkjentAdresse(data.adresse, kt);
            if (resultat.ok && win && !win.closed) {
                win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: kt });
            }
        }

        if (data.type === 'OPPDATER_ADR_NAVN') {
            const kt = data.kortType || 'adresse';
            const adrListe = kt === 'kommune' ? godkjenteKommuneAdresserGH : godkjenteAdresserGH;
            const idx = adrListe.findIndex(a => hentAdrStreng(a) === data.adresse.toLowerCase().trim());
            if (idx >= 0) {
                const gammel = adrListe[idx];
                if (typeof gammel === 'object') {
                    gammel.navn = data.navn;
                } else {
                    adrListe[idx] = { adresse: gammel, navn: data.navn, postnr: (gammel.match(/\d{4}/) || [''])[0] };
                }
                if (kt === 'kommune') await lagreGHKom('Oppdatert navn: ' + data.navn);
                else await lagreGHAdr('Oppdatert navn: ' + data.navn);
            }
            const win = window.mqWin;
            if (win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: kt });
        }

        if (data.type === 'LEGG_TIL_ORD') {
            const win = window.mqWin;
            const kt = data.kortType || 'adresse';
            const status = win && !win.closed ? win.document.getElementById('ordStatus') : null;
            const resultat = await lagreGodkjentOrd(data.ord, kt);
            if (status) status.textContent = resultat.melding;
            if (resultat.ok) {
                fadeAlleMatchende(data.ord);
                if (win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: kt });
            }
        }

        if (data.type === 'SLETT_ORD' || data.type === 'SLETT_KOM_ORD') {
            const kt = data.type === 'SLETT_KOM_ORD' ? 'kommune' : 'adresse';
            const win = window.mqWin;
            const resultat = await slettGodkjentOrd(data.ord, kt);
            if (resultat.ok && win && !win.closed) {
                win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: kt });
            }
        }

        // ── Sykehus-postnr (kommune kanskje) ──
        if (data.type === 'LEGG_TIL_SYKEHUS_POSTNR') {
            const win = window.mqWin;
            const resultat = await lagreSykehusPostnr(data.postnr);
            if (win && !win.closed && win.gkToast) win.gkToast(resultat.melding, resultat.ok ? 'success' : 'info');
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }
        if (data.type === 'SLETT_SYKEHUS_POSTNR') {
            const win = window.mqWin;
            const resultat = await slettSykehusPostnr(data.postnr);
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }

        // ── Spesialist-kombi (kommune avvik) ──
        if (data.type === 'LEGG_TIL_SPESIALIST_KOMBI') {
            const win = window.mqWin;
            const resultat = await lagreSpesialistKombi(data.ord, data.postnr);
            if (win && !win.closed && win.gkToast) win.gkToast(resultat.melding, resultat.ok ? 'success' : 'info');
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }
        if (data.type === 'SLETT_SPESIALIST_KOMBI') {
            const win = window.mqWin;
            const resultat = await slettSpesialistKombi(data.ord, data.postnr);
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }

        // ── Godkjenningsgrunner (adresse) ──
        if (data.type === 'LEGG_TIL_ADR_GRUNN') {
            const ny = data.grunn.trim();
            if (!ny || godkjenteAdresseGrunnerGH.includes(ny)) return;
            godkjenteAdresseGrunnerGH = [...godkjenteAdresseGrunnerGH, ny];
            await lagreGHAdr(`Ny adresse-grunn: ${ny}`);
            const win = window.mqWin;
            if (win && !win.closed) { win._gkGrunner = godkjenteAdresseGrunnerGH; win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'adresse' }); }
        }
        if (data.type === 'SLETT_ADR_GRUNN') {
            godkjenteAdresseGrunnerGH = godkjenteAdresseGrunnerGH.filter(g => g !== data.grunn);
            await lagreGHAdr(`Fjern adresse-grunn: ${data.grunn}`);
            const win = window.mqWin;
            if (win && !win.closed) { win._gkGrunner = godkjenteAdresseGrunnerGH; win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'adresse' }); }
        }

        // ── Godkjenningsgrunner (kommune) ──
        if (data.type === 'LEGG_TIL_GRUNN') {
            const ny = data.grunn.trim();
            if (!ny || godkjenteGrunnerGH.includes(ny)) return;
            godkjenteGrunnerGH = [...godkjenteGrunnerGH, ny];
            await lagreGHKom(`Ny grunn: ${ny}`);
            const win = window.mqWin;
            if (win && !win.closed) { win._gkGrunner = godkjenteGrunnerGH; win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' }); }
        }
        if (data.type === 'SLETT_GRUNN') {
            godkjenteGrunnerGH = godkjenteGrunnerGH.filter(g => g !== data.grunn);
            await lagreGHKom(`Fjern grunn: ${data.grunn}`);
            const win = window.mqWin;
            if (win && !win.closed) { win._gkGrunner = godkjenteGrunnerGH; win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' }); }
        }

        // ── Rute-kombi (kommune avvik) ──
        if (data.type === 'LEGG_TIL_RUTE_KOMBI') {
            const win = window.mqWin;
            const resultat = await lagreRuteKombi(data.a, data.b);
            if (win && !win.closed && win.gkToast) win.gkToast(resultat.melding, resultat.ok ? 'success' : 'info');
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }
        if (data.type === 'SLETT_RUTE_KOMBI') {
            const win = window.mqWin;
            const resultat = await slettRuteKombi(data.a, data.b);
            if (resultat.ok && win && !win.closed) win._avvikCh.postMessage({ type: 'VIS_ADR_MODAL', kortType: 'kommune' });
        }

        if (data.type === 'BEREGN_KM') {
            const win = window.mqWin;
            if (!win || win.closed) return;

            const kmDiv = win.document.getElementById(`km-${data.reqId}`);
            const kmBtn = win.document.getElementById(`btnKm-${data.reqId}`);
            if (kmDiv) kmDiv.innerHTML = '<span style="color:#3b82f6; font-size:12px;">Beregner km...</span>';
            if (kmBtn) { kmBtn.disabled = true; kmBtn.textContent = '...'; }

            try {
                const admin = adminTilgjengelig ? await hentAdminData(data.reqId, data.resId || null) : null;
                const folkAdr = admin && admin.folk ? admin.folk : '';
                const fraAdr = admin && admin.fra ? admin.fra : '';
                const tilAdr = admin && admin.til ? admin.til : '';
                const erTur = admin && admin.erTur !== null ? admin.erTur : true;
                const behandlingsAdr = erTur ? tilAdr : fraAdr;

                // Vis rek.nr. i kortheaderen
                if (admin && admin.rekNr) {
                    const rekSpan = win.document.getElementById(`rekNr-${data.reqId}`);
                    if (rekSpan) rekSpan.textContent = `| Rek: ${admin.rekNr}`;
                }

                const folkKm = await beregnKm(folkAdr, behandlingsAdr, 'manual', 'adresse');
                const bestiltFraAdr = erTur ? fraAdr : tilAdr;
                const bestiltKm = await beregnKm(bestiltFraAdr, behandlingsAdr, 'manual', 'adresse');

                console.log(`[KM-MANUELL] RID=${data.reqId}: folkKm=${folkKm?.km ?? 'null'}, bestiltKm=${bestiltKm?.km ?? 'null'}, erTur=${erTur}`);
                console.log(`[KM-MANUELL]   folk="${folkAdr.substring(0,60)}" fra="${fraAdr.substring(0,60)}" til="${tilAdr.substring(0,60)}"`);

                // Lagre i server-cache (rekNr som nøkkel)
                const kmRekNr = data.rekNr || (admin && admin.rekNr ? admin.rekNr : '');
                if (kmRekNr) {
                    // Parse turDato til ISO-format
                    let turDatoISO = new Date().toISOString().slice(0, 10);
                    const datoM = (data.turDato || '').match(/(\d{1,2})\.(\d{1,2})/);
                    if (datoM) {
                        const aar = new Date().getFullYear();
                        turDatoISO = `${aar}-${datoM[2].padStart(2,'0')}-${datoM[1].padStart(2,'0')}`;
                    }
                    lagreKmResultat(kmRekNr, folkKm ? folkKm.km : null, bestiltKm ? bestiltKm.km : null, turDatoISO);
                }

                if (kmDiv) {
                    const fmtKm = (res, adr, dest) => {
                        if (!res) {
                            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(adr)}&destination=${encodeURIComponent(dest)}`;
                            return `<a href="${mapsUrl}" target="_blank" style="text-decoration:none;" title="Sjekk i Google Maps">? &#128205;</a>`;
                        }
                        return res.km.toFixed(1) + ' km';
                    };

                    if (folkKm || bestiltKm) {
                        const avvik = folkKm && bestiltKm && bestiltKm.km > folkKm.km;
                        const stil = avvik
                            ? 'background:#fef2f2; border-color:#ef4444; color:#991b1b;'
                            : 'background:#f0fdf4; border-color:#10b981; color:#065f46;';
                        const bTxt = fmtKm(bestiltKm, bestiltFraAdr, behandlingsAdr);
                        const fTxt = fmtKm(folkKm, folkAdr, behandlingsAdr);
                        kmDiv.innerHTML = `<div class="warning-text" style="${stil}">
                            Bestilt: ${bTxt} &nbsp;|&nbsp; Folkereg: ${fTxt}
                            ${(folkKm && bestiltKm && !avvik) ? ' &#10004; OK' : ''}
                        </div>`;
                    }
                }
                if (kmBtn) { kmBtn.disabled = false; kmBtn.innerHTML = '&#128260; Beregn på nytt'; }
            } catch (err) {
                console.error('[KM-MANUELL] Feil:', err);
                if (kmDiv) kmDiv.innerHTML = `<div class="warning-text" style="background:#fef2f2; border-color:#ef4444; color:#991b1b;">Feil: ${err.message}</div>`;
                if (kmBtn) { kmBtn.disabled = false; kmBtn.textContent = 'Prøv igjen'; }
            }
        }

        if (data.type === 'BYTT_FILTRE') {
            aktiveFiltre = new Set(data.filtre);
            localStorage.setItem('overvaker_avvik_filtre', JSON.stringify(data.filtre));
            console.log(`[*] Aktive filtre: [${data.filtre.join(', ')}]`);
        }

        if (data.type === 'REFRESH') {
            if (aktivtSkann) await kjorSkann(aktivtSkann);
        }

        if (data.type === 'OPPDATER') {
            if (aktivtSkann) {
                await kjorSkann(aktivtSkann);
                // Restart auto-refresh nedtelling etter skann
                if (autoRefreshAktiv) startAutoRefresh();
            }
        }

        if (data.type === 'TOGGLE_AUTOREFRESH') {
            autoRefreshAktiv = data.checked;
            if (autoRefreshAktiv) {
                startAutoRefresh();
            } else {
                stoppAutoRefresh();
            }
        }
    };

    // ==================================================================
    //    START
    // ==================================================================
    (async function start() {
        sjekkVindu();

        // Last godkjente adresser fra GitHub
        await lastGodkjenteAdresser();

        // Sjekk admin-innlogging med retry (3 forsøk, 2 sek pause)
        adminTilgjengelig = await sjekkAdminLoginMedRetry(3, 2000);
        if (!adminTilgjengelig) {
            console.warn('[ADMIN] Oppstart: admin utilgjengelig etter 3 forsøk — re-sjekkes ved hver skanning');
            const win = window.mqWin;
            if (win && !win.closed) {
                const hb = win.document.getElementById('heartbeatBar');
                if (hb) {
                    hb.innerHTML = '&#9888; Admin ikke tilgjengelig enda — re-sjekkes automatisk ved skanning. <a href="https://pastrans-sorost.mq.nhn.no/administrasjon/" target="_blank" style="color:white; text-decoration:underline;">Logg inn her</a> om det ikke løser seg.';
                    hb.classList.add('show');
                }
            }
        }

        console.log(`[OK] ${TITTEL} startet (${Object.keys(POSTNR_TIL_KOMMUNE).length} postnr, admin=${adminTilgjengelig})`);
    })();

})();
