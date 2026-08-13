// === TILTAKSBOK-HØSTER v1.0 ===
// Kjøres i BLIKSUND-fanen, ikke i NISSY. Bliksund er et tredje origin, så verken
// nettsiden vår eller verktøykassen i NISSY kan spørre den — agenten må stå der
// dataene er (Thomas 13.08: «Det kan være eget skript»).
//
// Hele innholdsfortegnelsen ligger i ÉN forespørsel, og radene bærer alt vi trenger
// som data-attributter (data-id, data-card-number, data-chapter-id, data-title,
// data-keywords). Vi leser aldri synlig tekst — attributtene er det Bliksunds eget
// søk bruker, så de er det stødigste vi kan feste oss i. Det finnes ikke noe
// JSON-endepunkt; jeg lette (konsollen 13.08) og siden er ren server-rendret HTML.
//
// SAKSKORT hentes ALDRI med innhold. Kapitlene «Søknader» og «Fullmakter» er
// enkeltvedtak om navngitte personer; vi lagrer tittel, saksnummer og lenke, og
// operatøren klikker seg inn i Bliksund for å lese selve saken.
//
// Bruk:  __tiltaksbok.host()            → innholdsfortegnelsen
//        __tiltaksbok.host(true)        → + innholdet i prosedyrekortene (tar tid)
(function () {
    'use strict';
    const LAGRE_URL = 'https://thomaswestby.no/skript/tiltaksbok_lagre.php';
    const SAK_KAPITLER = [42, 115];      // Søknader, Fullmakter — speiler serveren

    // Boka leses ut av URL-en: /65113/grid/v2/procedure_manual/221
    function finnBok() {
        const m = /\/procedure_manual\/(\d+)/.exec(location.pathname);
        return m ? +m[1] : 0;
    }

    function lesInnholdsfortegnelse(doc) {
        const ut = [];
        doc.querySelectorAll('tr.item-card').forEach(rad => {
            const id = +(rad.dataset.id || 0);
            if (!id) return;
            // Kapittelnavnet står på panelet rundt tabellen, ikke på raden.
            const panel = rad.closest('.item-chapter');
            const kapId = +(rad.dataset.chapterId || (panel && panel.dataset.id) || 0) || null;
            const celler = rad.cells || [];
            ut.push({
                id: id,
                kortnummer: rad.dataset.cardNumber || '',
                tittel: (rad.dataset.title || '').trim(),
                sokeord: (rad.dataset.keywords || '').trim(),
                kapittel_id: kapId,
                kapittel_navn: panel ? (panel.dataset.name || '').trim() : '',
                // Datokolonnen er den eneste vi må lese som tekst — den finnes ikke
                // som attributt. «2026-04-13 07:55:26».
                sist_oppdatert: (() => {
                    const c = rad.querySelector('td.date');
                    const t = c ? (c.textContent || '').trim() : '';
                    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(t) ? t : '';
                })(),
                url: (rad.querySelector('a.card-title') || {}).href || ''
            });
        });
        return ut;
    }

    async function hentKortInnhold(url) {
        try {
            const r = await fetch(url, { credentials: 'same-origin' });
            if (!r.ok) return null;
            const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
            // Er vi kastet ut, kommer innloggingssiden i stedet for kortet.
            if (!doc.querySelector('a[href*="/logout"]')) return { utlogget: true };
            const el = doc.querySelector('#page_content') || doc.querySelector('.grid-page-center');
            if (!el) return null;
            // Verktøylinjer, PDF-knapper og skjemaer er støy — bare brødteksten skal med.
            el.querySelectorAll('script, style, .btn-pdf-dropdown, .headline, form, nav').forEach(n => n.remove());
            return { tekst: (el.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() };
        } catch (e) { return null; }
    }

    async function send(bok, kort) {
        const r = await fetch(LAGRE_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bok: bok, kort: kort, av: (window.authenticatedUser || {}).full_name || '' })
        }).then(x => x.json());
        return r;
    }

    async function host(medInnhold) {
        const bok = finnBok();
        if (!bok) { console.warn('[TILTAKSBOK] kjør dette på en procedure_manual-side'); return; }

        // Kapitlene er kollapset i DOM-en, men radene ligger der — vi trenger ikke
        // åpne dem. Henter likevel siden på nytt, så en gammel fane ikke gir gamle tall.
        const doc = new DOMParser().parseFromString(
            await fetch(location.href, { credentials: 'same-origin' }).then(r => r.text()), 'text/html');
        const kort = lesInnholdsfortegnelse(doc);
        if (!kort.length) { console.warn('[TILTAKSBOK] fant ingen kort — er du logget inn?'); return; }

        const saker = kort.filter(k => SAK_KAPITLER.includes(k.kapittel_id));
        console.log('[TILTAKSBOK] bok ' + bok + ': ' + kort.length + ' kort · '
                    + saker.length + ' sakskort (hentes uten innhold)');

        if (medInnhold) {
            const prosedyrer = kort.filter(k => !SAK_KAPITLER.includes(k.kapittel_id) && k.url);
            console.log('[TILTAKSBOK] henter innhold for ' + prosedyrer.length + ' prosedyrekort …');
            for (let i = 0; i < prosedyrer.length; i += 3) {
                const bunt = prosedyrer.slice(i, i + 3);
                const svar = await Promise.all(bunt.map(k => hentKortInnhold(k.url)));
                for (let j = 0; j < bunt.length; j++) {
                    if (svar[j] && svar[j].utlogget) {
                        console.warn('[TILTAKSBOK] STOPPET: sesjonen har falt. Logg inn og kjør på nytt — '
                                     + 'det som alt er sendt beholdes.');
                        i = prosedyrer.length;
                        break;
                    }
                    if (svar[j] && svar[j].tekst) bunt[j].innhold = svar[j].tekst;
                }
                if (i % 30 === 0) console.log('[TILTAKSBOK] ' + Math.min(i + 3, prosedyrer.length)
                                              + '/' + prosedyrer.length);
            }
        }

        // Batcher på 50 — hele boka i én POST blir en stor body når innholdet er med.
        let lagret = 0, medTekst = 0;
        for (let i = 0; i < kort.length; i += 50) {
            const r = await send(bok, kort.slice(i, i + 50));
            if (!r || typeof r.lagret !== 'number') {
                console.warn('[TILTAKSBOK] serveren avviste bunten —', JSON.stringify(r));
                continue;
            }
            lagret += r.lagret; medTekst += r.med_innhold || 0;
        }
        console.log('[TILTAKSBOK] FERDIG: ' + lagret + ' kort lagret · ' + medTekst + ' med innhold');
        return { lagret: lagret, med_innhold: medTekst };
    }

    window.__tiltaksbok = { host: host, les: () => lesInnholdsfortegnelse(document) };
    console.log('[TILTAKSBOK] klar. Kjør __tiltaksbok.host() — eller __tiltaksbok.host(true) for innhold også.');
})();
