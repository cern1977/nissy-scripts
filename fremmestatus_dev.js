// === FREMMESTATUS (SUTI) ===
// Viser når bilen ble sendt til transportør, når den meldte seg på vei (SUTI 3003) og når den
// er meldt fremme på HENTESTEDET (SUTI 1709) — som en egen seksjon i NISSYs ressurs-popup.
//
// SPLITTET UT AV basic_tools 25.08.2026 (Thomas: «ligger ikke mange av skriptene i egne filer
// for å holde størrelsen nede?»). Samme begrunnelse som da basic_tools selv ble skilt fra
// verktoykasse: en ferdig, verifisert funksjon skal ikke være låst til utviklingstakten i en fil
// som itererer. Konkret kostnad før splitten: basic_tools dev 1.182 mot prod 1.128 — Fremmestatus
// kunne ikke til prod uten å dra 54 versjoner annet arbeid med seg.
//
// Fila er samtidig husets SUTI-KJERNE. Live, områdeassistenten og verktøykassen har hver sin
// egen SUTI-parser, og ingen av dem kjenner fellene under. De kan gjenbruke denne via
// window.__fremmestatus uten at noe migreres — se docs/NISSY-Planlegging.md §7b og §7c.
//
// ⚠️ FIRE FELLER, alle verifisert i drift 25.08.2026:
//   1. `id` i ajax_reqdetails MÅ være en REKVISISJONS-id. Med resId får du et svar uten logg.
//   2. Loggen kan gjelde en ANNEN tur — en slettet ressurs på samme rekvisisjon kan ligge
//      øverst i svaret. <hr>-kuttet redder deg ikke; filtrer på TurNr.
//   3. Ved samkjøring låser KUN ÉN av rekvisisjonene opp loggen. Prøv alle.
//   4. Løyvet er FRITEKST per sentral (A9118, OS-15169, 171-61953). Les posisjonelt, ikke med
//      mønster.
//
// Verifisert på tre turformer: 72126324 (vanlig), 72110740 (slettet tur øverst i svaret),
// 72127538 (ingen AddRequisition — kom via AssignToNextCA etter avvisning).

(function () {
    'use strict';
    if (window.__fremmestatus) {
        console.log('[FREMMESTATUS] allerede lastet (v' + window.__fremmestatus.versjon + ')');
        return;
    }

    const VERSJON = '1.15-dev';   // MER ENN «MELDT» PÅ BOMTUR (Thomas 27.08). SUTI 1703 sier bare AT det ble meldt bomtur; koden sjåføren tastet og årsaken som ble registrert ligger på rekvisisjonen — og 1703-raden bærer rekvisisjonsnummeret, så det er ett oppslag unna. Viser nå «T1 Forsinkelse · kode 0910 · meldt 09:10». Klokkeslettet var gratis hele tiden: 1703-grenen nullstilte objektet og kastet r.kl. Oppslaget er en MYK avhengighet til basic_tools (som eier admin-flyten) — uten verktøykassen står det «meldt» som før, og fremmestatus fungerer fortsatt alene   // NAVN FRA ADMIN, ikke fra tabellen (Thomas 25.08: «hvor henter du navn fra?»). Tabellen parret navn og rekvnr PÅ POSISJON — en arvet, aldri etterprøvd gjetning som bommet stille. ajax_reqdetails har begge i samme dokument. Første navn er gratis (stigen leser svaret uansett), kun hull koster et kall   // diagnostikk: skiller «koblingen ble aldri bygget» fra «bygget med ANDRE rekvisisjonsnr enn SUTI-loggen bruker» — begge ga «rekv NNN» i visningen og så identiske ut utenfra   // FIKS: frmReqIdsFraTurid forsvant i forrige omskriving — lasttesten fanget den, men jeg deployet før jeg leste utskriften. searchStatus-fallbacken var altså brutt i 1.11. + adressen fjernet, navnet holder (Thomas)   // GRUPPERT PER PASSASJER med skillelinje (Thomas 25.08): hendelsesstyrt rekkefølge gikk an med numre, men ble uleselig med navn — leseren måtte holde to tidslinjer i hodet. + adressen brytes på «/», etiketten brytes aldri   // navnekoblingen ga ingen treff: (1) rekv-mønsteret arvet fra basic_tools var 2[567] og MISSER 264016124161, (2) headeren ble kun søkt som tr.tbh. Begge utvidet, og dev-loggen sier nå nøyaktig hvor koblingen stopper (header, kolonneindeks, navn og numre)   // + HENTEADRESSE på egen, dempet linje under fremme-tiden (Thomas 25.08) — den sier hvor bilen fysisk står. Leses fra «Fra»-kolonnen med samme beviskrav som navnet: like mange linjer som rekvisisjonsnr, ellers droppes den   // PASIENTNAVN i stedet for rekvisisjonsnr (Thomas 25.08). Koblingen tas gratis fra pågående-raden, som har navn og rekvnr i samme rekkefølge (én div per passasjer i hver celle). Kobler KUN når antallet stemmer — å vise feil pasient på en fremme-tid er verre enn å vise et nummer. Nummeret beholdes i tooltipen   // seksjonsoverskriften i verktøykassens oransje (#fbbf24 på #451a03), samme par som BETA-merker og toasts — leses umiddelbart som vår, ikke som en av NISSYs egne blå   // UTFALLSTELLER: fremme (1709) / på vei (3003) / kun sendt / ingenting, med andel. Dette er tallet som avgjør om funksjonen fortjener plass hos alle — melder transportørene faktisk fremme? Telles kun ved ekte oppslag, ikke cache-treff   // telleverket overlever F5 (sessionStorage): keeper-popupen re-injiserer ved hver reload, så i minnet ble en testøkt nullstilt hele tiden. Diagnostikk skal dø med FANEN, ikke med siden. + nullstill()   // «raden bærer ingen reqId» nedgradert fra warn til log: searchStatus håndterer den på neste linje, og en advarsel med stack-trace for noe som VIRKER lærer folk å overse advarsler. Warn er nå forbeholdt det som faktisk trenger oppmerksomhet   // EGENKONTROLL: advarsler logges uansett dev/prod (ingen-logg, logg-uten-tur, mange-kall, kall-feilet) + __fremmestatus.stat() for oppgjør etter en testøkt. Skriptet skal aldri feile stille   // stigen stoppet aldri når turen bare hadde 3003: suksesskriteriet var «fant grupper», men 3003 danner ingen gruppe. HLSX-buss m/ 10 rekvisisjoner ga 21 oppslag der nr. 2 holdt. Nå: stopp ved riktig logg + tak på 6 rekvisisjoner   // hover-vern: popupen fylles på onmouseover, så et musesveip nedover ressurskolonnen ville utløst ett fullt oppslag per rad. 450 ms hvile + foreldelsessjekk før hvert nettverkskall
    const ER_DEV  = /_dev\.js/.test((document.currentScript && document.currentScript.src) || '')
                 || /fil=fremmestatus_dev/.test((document.currentScript && document.currentScript.src) || '');
    const NAVN    = 'FREMMESTATUS' + (ER_DEV ? ' DEV' : '');
    // ⚠️ ALDRI hardkod pastrans: NISSY kjører på flere domener, og CORS blokkerer kryssoppslag.
    const NISSY_ORIGIN = location.origin;

    window.__fremmestatus = { versjon: VERSJON, dev: ER_DEV };

    // ══ EGENKONTROLL ══════════════════════════════════════════════════════════════════
    // ⚠️ Skriptet skal ALDRI feile stille. Den farlige feilmodusen her er ikke at seksjonen
    //    uteblir — det ser man — men at den viser noe rolig og galt, eller at oppslaget bommer
    //    uten at noen merker det. Advarsler logges derfor UANSETT dev/prod, og telleverket
    //    ligger på window.__fremmestatus.stat() så en testøkt kan gjøres opp i ettertid.
    // ⚠️ TELLERNE MÅ OVERLEVE F5, ellers måler de ingenting. Keeper-popupen re-injiserer
    //    verktøykassen etter hver reload, og NISSY reloades ofte — i minnet ville en testøkt
    //    på en time blitt nullstilt et dusin ganger (Thomas 25.08: stat() ga bare nuller).
    //    sessionStorage, IKKE localStorage: dette er ren diagnostikk som skal dø med fanen.
    //    Merk forskjellen fra SUTI-cachen vi fjernet — den påvirket HVA operatøren fikk se, og
    //    kunne bli feil. Et telleverk kan ikke bli feil; det kan bare bli borte.
    const FRM_STAT_SS = 'vkt_frm_stat';
    const _stat = (function () {
        const tom = { oppslag: 0, kall: 0, treff: 0, tomme: 0, advarsler: [], start: new Date().toTimeString().slice(0, 8) };
        try {
            const r = JSON.parse(sessionStorage.getItem(FRM_STAT_SS) || 'null');
            if (r && typeof r.oppslag === 'number' && Array.isArray(r.advarsler)) return r;
        } catch (_) {}
        return tom;
    })();
    // ⚠️ Felt lagt til ETTER at en økt kan ha startet må ha standardverdi — et objekt lest fra
    //    sessionStorage kjenner dem ikke, og `undefined++` gir NaN som aldri retter seg opp igjen.
    _stat.utfall = _stat.utfall || { fremme: 0, paavei: 0, sendt: 0, ingenting: 0 };

    // Hva ENDTE turen på? Dette er tallet som avgjør om funksjonen fortjener plass hos alle:
    // melder transportørene 1709, eller er «sendt»/«på vei» det vi realistisk kan tilby?
    // Telles kun ved EKTE oppslag, ikke ved cache-treff eller re-render — ellers måler vi
    // hvor mye operatøren beveger musa.
    function frmTellUtfall(sv) {
        const g = (sv && Array.isArray(sv.g)) ? sv.g : [];
        const k = g.some(x => x && x.frammeTid) ? 'fremme'
                : (sv && sv.v) ? 'paavei'
                : (sv && sv.sd) ? 'sendt'
                : 'ingenting';
        _stat.utfall[k] = (_stat.utfall[k] || 0) + 1;
        frmLagreStat();
    }

    function frmLagreStat() {
        try { sessionStorage.setItem(FRM_STAT_SS, JSON.stringify(_stat)); } catch (_) {}
    }
    function frmAdvar(kode, tekst) {
        _stat.advarsler.push({ t: new Date().toTimeString().slice(0, 8), kode: kode, tekst: tekst });
        if (_stat.advarsler.length > 50) _stat.advarsler.shift();
        frmLagreStat();
        try { console.warn('[' + NAVN + '] ⚠ ' + kode + ': ' + tekst); } catch (_) {}
    }

    // Ressurs-popupens tilstand deklareres her: wrapperen rundt showRes settes ved oppstart,
    // lenge før popup-blokka lenger ned er evaluert (temporal dead zone).
    let _frmSisteRid = '', _frmPopupTmr = null;

    // ── CACHE: KUN I MINNET, KORT LEVETID ───────────────────────────────────────────────
    // Cachen ble bygget for tabellknappen, der 350 rader × 20 s-tick gjorde hver spart
    // forespørsel viktig, og der localStorage lot svarene overleve NISSYs re-render.
    // Med oppslaget flyttet til ressurs-popupen er begge grunnene borte: det skjer bare når en
    // operatør bevisst åpner et kort, og popupen bygges på nytt hver gang uansett.
    //
    // ⚠️ OG DEN HADDE EN LATENT FEIL. «Endelige» svar (en fremme-tid funnet) ble holdt i 12 timer.
    //    Ved samkjøring kommer det én 1709 PER rekvisisjon, til ulik tid — så første passasjers
    //    fremme-tid frøs svaret, og de neste ville aldri dukket opp. Tur 72127538 illustrerer
    //    risikoen: 1709 kom 13:15, tjue minutter etter at 3003 lå der (Thomas 25.08).
    //    Derfor: én kort levetid for alle svar, og ingen «dette er endelig»-vurdering.
    const FRM_TTL = 60 * 1000;             // ett minutt — nok til å hindre dobbelthenting, ikke nok til å bli feil
    const _frmSuti = {};                   // resId|turid → svar (lever kun i denne fanen)

    function frmLagreCache(nokkel, svar) {
        svar.t = Date.now();
        _frmSuti[nokkel] = svar;
    }

    function frmParseSuti(html, turid) {
        const ut = { seksjon: false, rader: 0, grupper: [], paaVeiTid: '', loyve: '', sendtTid: '', sendtDato: '', turnr: '', raderTotalt: 0, raderTur: 0 };
        const i = html.indexOf('Suti kode');
        if (i < 0) return ut;
        ut.seksjon = true;
        let omr = html.substring(i);
        // <hr> = bytte av TRANSPORTØR (selskap). Ferskeste blokk ligger ØVER streken.
        // ⚠️ Har bilen avvist og turen gått til en annen bil INNEN samme selskap, kommer det
        // INGEN <hr> — da er 3003 nedenfor eneste markør på at bilen er byttet (Thomas 24.08).
        // ⚠️ KUTT KUN NÅR VI IKKE VET TUREN (rettet 25.08, tur 72110740 ga «logg ikke funnet»):
        //    <hr>-kuttet er en GROV tilnærming til «nyeste blokk». Kombinert med et krav om riktig
        //    TurNr ble den for streng — ligger turen i en blokk lenger ned, forkastet vi hele svaret.
        //    Kjenner vi turid, er TurNr-filteret både skarpere og mer presist enn kuttet, og vi
        //    leser hele seksjonen. Uten turid faller vi tilbake på kuttet som før.
        if (!turid) { const hr = omr.indexOf('<hr'); if (hr > -1) omr = omr.substring(0, hr); }
        const rader = []; const rx = /<tr[^>]*>([\s\S]*?)<\/tr>/gi; let m;
        while ((m = rx.exec(omr)) !== null) {
            const rad = m[1];
            const tm = rad.match(/(\d{2})[\/.](\d{2})[\/.](\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
            if (!tm) continue;   // rader uten tidsstempel er overskrifter/skillelinjer
            // TurNr er 4. kolonne. Tidsstempelet ligger også i <nobr>, men inneholder skråstrek
            // og kolon — et rent 8-sifret <nobr> er derfor TurNr (eller BookingNr, samme tall).
            const turM = rad.match(/<nobr>\s*(\d{8})\s*<\/nobr>/);
            const radTur = turM ? turM[1] : '';
            ut.raderTotalt++;
            if (!ut.turnr && radTur) ut.turnr = radTur;         // ferskeste rad definerer loggens tur
            if (turid && radTur && radTur !== String(turid)) continue;   // annen tur — hører ikke hjemme
            ut.raderTur++;
            const r0kl = tm[4] + ':' + tm[5], r0dato = tm[1] + '.' + tm[2];
            // ⚠️ KODEMØNSTER FRA OVERVÅKER LIVE (overvaaker_live.js:2361-2364), som har kjørt i
            // drift lenge. Jeg kopierte først omraade_assistent sitt <nobr>1709</nobr>-mønster —
            // det ga NULL treff mot ekte HTML (verifisert 24.08: «Suti kode»-seksjon på 28 923
            // tegn, ingen <nobr>-innpakkede koder). Live matcher koden rett etter en '>'.
            // Løyvenummeret til bilen som FAKTISK kommer står på UpdateResource-raden rett
            // ETTER 3003-meldingen — 3003-raden selv bærer forrige bils løyve (Thomas 24.08,
            // tur 72116259: 3003 m/ TE-60, linjen under UpdateResource m/ RO-3215).
            // Mønstrene er kopiert fra overvaaker_live.js:3358.
            // Sendt til transportør. Mange turer får aldri 3003/1709 — da er DETTE tidspunktet
            // det operatøren trenger: hvor lenge har turen ligget uten respons? (Thomas 25.08,
            // tur 72103301: NewResource 09:54 i går, SMS 08:13 i dag, ingen 3003.)
            // Mønster fra overvaaker_live.js:2334.
            if ((/NewResource/.test(rad) || /AssignToNextCA/.test(rad)) && /Tildelt/.test(rad)) {
                if (!ut.sendtTid) { ut.sendtTid = r0kl; ut.sendtDato = r0dato; }   // FØRSTE gang turen ble sendt
            }
            if (/UpdateResource/.test(rad)) {
                // ⚠️ IKKE mønstergjenkjenning på løyvet (Thomas 25.08): «det kommer an på hvem som
                //    la inn navnet på sentralen — mange fallgruver der». A9118, OS-15169, RO-3215,
                //    rene tall … formatet er fritekst og lar seg ikke enumerere.
                //    Vi leser derfor POSISJONELT: Løyvenr er 5. kolonne (Hendelse, Tid, Status,
                //    TurNr, Løyvenr). Det eneste vi trenger å kjenne igjen er NISSYs EGEN
                //    avtaleområde-nøkkel («5.05.V.OUS.1-72126324»), som står i samme kolonne til
                //    bilen faktisk har meldt seg. Den utelukker vi — alt annet er transportørens løyve.
                const celler = [...rad.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
                    .map(c => c[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
                const kol = celler.length > 4 ? celler[4] : '';
                const erOmradeNokkel = /^\d+\.\d+\.[^-]*-\d{6,}$/.test(kol);
                if (kol && !erOmradeNokkel) ut.loyve = kol;      // siste vinner — radene er tidssortert
            }
            const attrM = rad.match(/>\s*(1701|1702|1703|1709|3003)\b/);
            if (!attrM) continue;
            // Rekvnr til gruppering ved samkjøring. Finnes det ikke, havner alt i én gruppe —
            // riktig for enkeltturer, og bedre enn å droppe raden.
            const rekvM = rad.match(/<nobr>\s*(\d{12})\s*<\/nobr>/) || rad.match(/\b(2[567]\d{10})\b/);
            rader.push({ ms: new Date(+tm[3], +tm[2] - 1, +tm[1], +tm[4], +tm[5], +tm[6]).getTime(),
                         kl: tm[4] + ':' + tm[5], attr: attrM[1], rekv: rekvM ? rekvM[1] : '' });
        }
        ut.rader = rader.length;
        rader.sort((a, b) => a.ms - b.ms);
        const g = {};
        // Radene er sortert STIGENDE på tid, så en senere hendelse overskriver en tidligere.
        // Det er med vilje (Thomas 24.08): «hvis det er flere 1709, kan sjåføren ha avvist turer
        // — det er den med SISTE tidspunkt og riktig rekvisisjonsnr som gjelder».
        for (const r of rader) {
            // 3003 = ny bil tildelt. Da er forrige bils fremme-tid ugyldig, og siden 3003-raden
            // ofte står UTEN rekvisisjonsnr (gjelder hele bilen), nullstiller vi alle gruppene —
            // samme logikk som overvaaker_live.js:3347. Uten dette ville en avvist bils 1709
            // blitt hengende igjen og vist som om den nye bilen var fremme.
            if (r.attr === '3003') {
                // 3003 = bil tildelt / PÅ VEI (Thomas 24.08). Normalflyten er 3003 → 1709 → 1701,
                // så når 3003 kommer FØR 1709 nullstiller vi ingenting. Kommer den ETTER, er det
                // en ny bil, og forrige bils fremme-tid skal forkastes. Tidssorteringen gjør at
                // begge tilfellene håndteres av samme linje.
                ut.paaVeiTid = r.kl;
                if (r.rekv && g[r.rekv]) { g[r.rekv].frammeTid = ''; g[r.rekv].hentetTid = ''; }
                else Object.keys(g).forEach(k => { g[k].frammeTid = ''; g[k].hentetTid = ''; });
                continue;
            }
            if (!g[r.rekv]) g[r.rekv] = { rekv: r.rekv, frammeTid: '', hentetTid: '', levertTid: '', bomtur: false };
            if (r.attr === '1709') { g[r.rekv].frammeTid = r.kl; g[r.rekv].bomtur = false; }
            if (r.attr === '1701') { g[r.rekv].hentetTid = r.kl; g[r.rekv].bomtur = false; }
            if (r.attr === '1702') { g[r.rekv].levertTid = r.kl; }
            // ⚠️ 1703 NULLSTILLER de andre tidene (bomtur avslutter turen for denne pasienten),
            //    men KLOKKESLETTET skal med — «meldt» alene sier ikke når sjåføren sto der.
            if (r.attr === '1703') { g[r.rekv] = { rekv: r.rekv, frammeTid: '', hentetTid: '', levertTid: '', bomtur: true, bomturTid: r.kl }; }
        }
        ut.grupper = Object.keys(g).map(k => g[k]);
        return ut;
    }

    // Ett oppslag PER BIL (resId) — SUTI-loggen er felles for turen, så én henting dekker alle
    // passasjerene på en samkjørt rad. Kombo-stigen: loggen låses ikke alltid opp av bilens
    // resId som tripid (omraade_assistent v0.9.22-fella).
    // ══ NAVN FRA ADMIN, IKKE FRA TABELLEN ═════════════════════════════════════════════
    // ⚠️ Tabellparringen var en GJETNING. Navnene ble lest fra Pnavn-kolonnen, rekvisisjons-
    //    numrene fra searchStatus-lenkene i samme rad, og så parret PÅ POSISJON — en antakelse
    //    arvet fra omraade_assistent.js:1651, aldri etterprøvd. Den bommet gjentatte ganger, og
    //    verre: når den bommer, bommer den STILLE. Feil pasient på en fremme-tid ser helt normalt
    //    ut for operatøren.
    //    ajax_reqdetails har «Navn:» og «Rekvisisjon … <b>261035412561</b>» i SAMME dokument.
    //    Paret er gitt, ikke gjettet. Mønstre fra verktoykasse.js:1311 og :1345.
    //
    // Kostnaden er lav: hvert svar vi HENTER I STIGEN leses uansett, så første navn er gratis.
    // Kun manglende navn utløser et ekstra kall, med tak.
    const FRM_ADMIN = NISSY_ORIGIN + '/administrasjon/admin/ajax_reqdetails';
    const _frmNavn = {};   // rekvisisjonsnr → pasientnavn (admin er fasit, lever hele fanen)

    function frmLesNavn(html) {
        try {
            const rekM = html.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i)
                      || html.match(/>(\d{12})<\/b>/);
            if (!rekM) return '';
            // Pasientblokka ligger FØR «Hentested» — etter den kommer stedets eget «Navn:».
            const hi = html.indexOf('Hentested');
            const pas = hi > -1 ? html.substring(0, hi) : html;
            const navnM = pas.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (!navnM) return '';
            _frmNavn[rekM[1]] = navnM[1].replace(/\s+/g, ' ').trim();
            return rekM[1];
        } catch (_) { return ''; }
    }

    // Fyll hullene: ett oppslag per rekvisisjon vi mangler navn på, med tak.
    async function frmSikreNavn(resId, reqListe, rekvTrengs) {
        const mangler = () => rekvTrengs.filter(r => r && !_frmNavn[r]);
        if (!mangler().length) return;
        for (const rq of reqListe.slice(0, 6)) {
            if (!mangler().length) break;
            try {
                _stat.kall++;
                const r = await fetch(FRM_ADMIN + '?id=' + rq + '&db=1&tripid=' + resId
                    + '&showSutiXml=false&hideEvents=true&full=true', { credentials: 'same-origin' });
                if (!r.ok) continue;
                frmLesNavn(await r.text());
            } catch (e) {
                frmAdvar('navneoppslag-feilet', 'reqId ' + rq + ': ' + ((e && e.message) || e));
            }
        }
        if (ER_DEV) {
            const m = mangler();
            console.log('[' + NAVN + '] navn: ' + rekvTrengs.filter(r => _frmNavn[r]).length + '/'
                + rekvTrengs.length + ' fra admin' + (m.length ? ' — mangler ' + m.join(', ') : ''));
        }
    }

    // ⚠️ SAMKJØRING: KUN ÉN reqId LÅSER OPP LOGGEN (omraade_assistent v0.9.25-dev, verifisert der:
    //    «SUTI-loggen vises kun når man spør ajax_reqdetails med reqID-en som EIER den aktive
    //    ressursen — samme bil/resId, men bare ÉN reqId ga 5 grupper»). Med tre passasjerer på
    //    bilen traff vi derfor bare hvis vi tilfeldigvis tok den riktige først. Nå prøves alle
    //    radens reqIds til én gir grupper — samme strategi som områdeassistenten.
    //    reqId kan være en streng, en kommaseparert streng eller et array.
    async function frmHentSuti(resId, reqId, turid) {
        // ⚠️ Nøkkelen MÅ inneholde turid: med tur-sjekken gir samme resId et annet (og riktigere)
        // svar enn uten, og popupen spør med turid mens tabellknappen spør uten.
        const nokkel = resId + '|' + (turid || '');
        const reqListe = [...new Set((Array.isArray(reqId) ? reqId : String(reqId || '').split(','))
            .map(x => String(x || '').trim()).filter(Boolean))];
        const c = _frmSuti[nokkel];
        // ⚠️ MINNE-cachen hadde ingen TTL og levde hele økten. Et svar hentet før bilen meldte
        // 3003 ble derfor liggende som «nei» resten av vakten (Thomas 24.08, tur m/ C-7044).
        // Nå gjelder samme utløp som i localStorage.
        if (c !== undefined && (Date.now() - (c.t || 0)) < FRM_TTL) return c;
        // Ta vare på det beste delsvaret på tvers av kombo-forsøkene: en tur kan ha 3003
        // («på vei») uten en eneste 1709/1701, og da er grupper tom — men paaVeiTid er
        // fortsatt verdifull. Uten dette falt den på gulvet i den negative grenen.
        _stat.oppslag++;
        frmLagreStat();
        const _kallFor = _stat.kall;
        let sisteSeksjon = false, sistePaaVei = '', sisteRader = 0, sisteLoyve = '', sisteSendt = '', sisteSendtDato = '';
        const base = NISSY_ORIGIN + '/administrasjon/admin/ajax_reqdetails';
        // Tak som sikkerhetsnett: en samkjørt buss kan ha ti rekvisisjoner eller flere, og selv med
        // riktig stoppkriterium skal et enkelt kortoppslag aldri kunne bli en byge av forespørsler.
        // Kun ÉN reqId låser opp loggen, så rekkefølgen er uansett et lotteri — men i praksis treffer
        // vi på de første.
        const FRM_MAKS_REQ = 6;
        const reqProv = reqListe.slice(0, FRM_MAKS_REQ);
        if (ER_DEV && reqListe.length > FRM_MAKS_REQ) {
            console.log('[' + NAVN + '] ' + reqListe.length + ' rekvisisjoner — prøver de '
                + FRM_MAKS_REQ + ' første');
        }
        const kombos = [];
        if (resId) kombos.push([resId, resId]);
        // [reqId, resId] er den dokumenterte vinneren — alle passasjerenes reqIds prøves her.
        if (resId) reqProv.forEach(r => kombos.push([r, resId]));
        reqProv.forEach(r => kombos.push([r, r]));
        for (const par of kombos) {
            try {
                _stat.kall++;
                const r = await fetch(base + '?id=' + par[0] + '&db=1&tripid=' + par[1]
                    + '&showSutiXml=true&hideEvents=&full=true', { credentials: 'same-origin' });
                if (!r.ok) continue;
                const html = await r.text();
                if (html.length < 500) {
                    if (ER_DEV) console.log('[' + NAVN + '] frm SUTI ' + par[0] + '/' + par[1]
                        + ' → svar for kort (' + html.length + ' tegn) — hoppet over');
                    continue;
                }
                frmLesNavn(html);          // gratis: svaret er allerede lest
                const pr = frmParseSuti(html, turid);
                // ⚠️ Er dette i det hele tatt RIKTIG tur? Et svar som bare inneholder en annen
                // TurNr er ikke et negativt svar — det er et feiltreff, og stigen må gå videre.
                // Uten dette ble en slettet ressurs' logg presentert som turens egen (72126324).
                if (turid && pr.raderTotalt > 0 && pr.raderTur === 0) {
                    if (ER_DEV) console.log('[' + NAVN + '] frm SUTI ' + par[0] + '/' + par[1]
                        + ' → ' + pr.raderTotalt + ' rader, men INGEN for tur ' + turid
                        + ' (loggen starter på ' + (pr.turnr || '?') + ') — feiltreff, prøver neste');
                    continue;
                }
                // Skiller feilmodusene: seksjon=true rader=0 → rad-regex feil.
                //                       rader>0 grupper=0 → RekvisisjonsNr-regex feil.
                if (ER_DEV) console.log('[' + NAVN + '] frm SUTI ' + par[0] + '/' + par[1]
                    + ' → seksjon=' + pr.seksjon + ' rader=' + pr.rader + ' grupper=' + pr.grupper.length
                    + ' | tidsrader=' + pr.raderTotalt + ' derav tur ' + (turid || '(alle)') + '=' + pr.raderTur
                    + ' | loggens første TurNr=' + (pr.turnr || '?')
                    + ' | sendt=' + (pr.sendtTid || '∅') + ' påvei=' + (pr.paaVeiTid || '∅'));
                // ⚠️ SUKSESS = VI HAR RIKTIG LOGG, ikke «vi fant grupper» (rettet 25.08 på en HLSX-buss
                //    med 10 rekvisisjoner). Kriteriet var `grupper.length`, men en tur som bare har
                //    meldt 3003 gir NULL grupper — 3003 gjelder bilen, ikke en rekvisisjon, og danner
                //    ingen gruppe. Stigen lette derfor videre etter noe som ikke fantes: 1 + 10 + 10 =
                //    21 oppslag, der nummer to allerede hadde loggen (`derav tur 72117257=35`).
                //    Nå stopper vi så snart et svar inneholder rader for RIKTIG tur.
                const traff = turid ? (pr.raderTur > 0) : (pr.grupper.length > 0 || pr.rader > 0);
                if (traff) {
                    _stat.treff++;
                    frmLagreStat();
                    if (_stat.kall - _kallFor > 8) frmAdvar('mange-kall',
                        (_stat.kall - _kallFor) + ' oppslag for ett kort (tur ' + (turid || '?')
                        + ') — stoppkriteriet virker ikke som det skal');
                    frmLagreCache(nokkel, { g: pr.grupper, s: pr.seksjon, r: pr.rader, v: pr.paaVeiTid, l: pr.loyve, sd: pr.sendtTid, sdd: pr.sendtDato });
                    frmTellUtfall(_frmSuti[nokkel]);
                    return _frmSuti[nokkel];
                }
                if (pr.seksjon) sisteSeksjon = true;   // loggen fantes, men uten livssyklusrader
                if (pr.paaVeiTid) sistePaaVei = pr.paaVeiTid;
                if (pr.loyve) sisteLoyve = pr.loyve;
                if (pr.sendtTid && !sisteSendt) { sisteSendt = pr.sendtTid; sisteSendtDato = pr.sendtDato; }
                if (pr.rader > sisteRader) sisteRader = pr.rader;
            } catch (e) {
                frmAdvar('kall-feilet', 'ajax_reqdetails ' + par[0] + '/' + par[1] + ': '
                    + ((e && e.message) || e));
            }
        }
        // Hele stigen gikk uten å finne loggen. Det er ALLTID verdt en advarsel: enten er
        // id-kjeden brutt, eller så har NISSY endret noe. Skiller de to feilmodusene.
        _stat.tomme++;
        frmAdvar(sisteSeksjon ? 'logg-uten-tur' : 'ingen-logg',
            sisteSeksjon
                ? 'fant SUTI-logg, men ingen rader for tur ' + (turid || '?')
                  + ' — id-kjeden peker trolig på feil ressurs (resId ' + resId + ', '
                  + reqListe.length + ' rekvisisjon(er) prøvd)'
                : 'ingen SUTI-seksjon i noen av ' + kombos.length + ' oppslag'
                  + ' (resId ' + resId + ', turid ' + (turid || '?') + ')'
                  + (reqListe.length ? '' : ' — INGEN reqId var tilgjengelig, det er nesten alltid årsaken'));
        frmLagreCache(nokkel, { g: [], s: sisteSeksjon, r: sisteRader, v: sistePaaVei, l: sisteLoyve, sd: sisteSendt, sdd: sisteSendtDato });
        frmTellUtfall(_frmSuti[nokkel]);   // negativt svar caches også (kort TTL)
        return _frmSuti[nokkel];
    }


    // ══ FREMMESTATUS I RESSURS-POPUPEN (Thomas 25.08) ═══════════════════════════════════
    // Bedre sted enn tabellcellen, av tre grunner:
    //   1. Popupen er ALLEREDE om bilen — og SUTI-loggen er per bil. Ingen filtrering mot
    //      rekvisisjonsnr for å unngå å blande passasjerer; alle hentetidene hører hjemme her.
    //   2. Den har seksjoner, plass og egen layout. Ingen 12-px linjeraster å komme i takt med,
    //      ingen ledende &nbsp;, ingen sameie med Overvåker Lives S-badge i celle 0.
    //   3. Den åpnes bevisst av operatøren → ett oppslag per åpning, null skanning.
    // Popupen fylles av NISSYs showRes() → ajax-dispatch?action=showres&rid=<resId>
    // (samme endepunkt Overvåker Live bruker, overvaaker_live.js:137). Seksjonsoverskriftene
    // er td.reqvtitle, verdiene td.reqv_value — vi KLONER radene, så vi arver NISSYs stil
    // uten å gjette på markup.
    // showRes(el, rid, ...) er global (Live kaller den direkte, overvaaker_live.js:5644).
    // Vi wrapper for å fange rid — popupen selv viser Reisenr (turid), ikke resId.
    function frmKapreShowRes() {
        try {
            const f = window.showRes;
            if (typeof f !== 'function' || f.__vktFrm) return;
            const wrap = function (el, rid) { if (rid) _frmSisteRid = String(rid); return f.apply(this, arguments); };
            wrap.__vktFrm = true; wrap.__vktOrig = f;
            window.showRes = wrap;
        } catch (_) {}
    }

    // Fallback når wrappingen ikke rakk å bli satt (eller popupen ble åpnet på annen måte):
    // let etter rid i popupens egen markup, deretter etter løyvet i pågående-tabellen.
    // Finn ressurs-id for det ÅPNE kortet. Tre kilder, med kildenavn tilbake så feil oppslag
    // kan skilles fra taus bil.
    //
    // ⚠️ REKKEFØLGE (rettet 25.08): showRes-wrapperen først. Det er nettopp DET kallet som
    //    fylte popupen vi står og dekorerer — også når NISSY kaller den fra onmouseover
    //    (overvaaker_live.js:5643). Løyve-oppslaget er svakere enn det ser ut: samme bil kan ha
    //    FLERE rader i pågående (én per tur), og da tar «første treff» feil tur.
    function frmFinnRid(rot) {
        const kand = { showres: _frmSisteRid || '', markup: '', loyve: '', loyveAnt: 0 };
        try {
            const h = rot.innerHTML || '';
            const m = h.match(/[?&]rid=(\d+)/) || h.match(/showRes\s*\([^,]+,\s*(\d+)/);
            if (m) kand.markup = m[1];
            // ⚠️ Løyvet er FRITEKST — formatet varierer med hvem som la det inn på sentralen
            // (Thomas 25.08). Vi gjetter derfor ikke på mønster, men tar popupens egen
            // løyvelinje som den står: raden rett under «Ressurs»-overskriften, f.eks.
            // «A9118 (Bekreftet)» eller «OS-15169 (Bekreftet)» → tokenet før parentesen.
            let loyveTekst = '';
            const forste = rot.querySelector('td.reqv_value');
            if (forste) loyveTekst = (forste.textContent || '').replace(/\(.*$/, '').trim();
            const loyve = loyveTekst ? [loyveTekst, loyveTekst] : null;
            if (loyve) {
                const tab = document.getElementById('pagaendeoppdrag');
                if (tab) {
                    const traff = [...tab.querySelectorAll('tr[id^="P-"]')]
                        .filter(r => (r.textContent || '').indexOf(loyve[1]) >= 0);
                    kand.loyveAnt = traff.length;
                    if (traff.length) kand.loyve = traff[0].id.replace(/^P-/, '');
                }
            }
        } catch (_) {}
        const valgt = kand.showres || kand.markup || kand.loyve || '';
        const kilde = kand.showres ? 'showRes' : (kand.markup ? 'markup' : (kand.loyve ? 'løyve' : '∅'));
        if (ER_DEV) console.log('[' + NAVN + '] fremmestatus-popup: valgt ' + valgt + ' (' + kilde + ')'
            + ' — showRes=' + (kand.showres || '∅') + ' markup=' + (kand.markup || '∅')
            + ' løyve=' + (kand.loyve || '∅') + (kand.loyveAnt > 1 ? ' ⚠ ' + kand.loyveAnt + ' rader med samme løyve' : ''));
        return { id: valgt, kilde: kilde, kand: kand };
    }

    // ⚠️ NÅR RADEN IKKE BÆRER reqId (25.08, tur 72127538). Den ferskeste blokka hadde ingen
    //    AddRequisition-rader: turen kom dit via AssignToNextCA etter at en transportør avviste
    //    den, og rekvisisjonsnumrene lå kun i den gamle blokka under en ANNEN tur. Da finnes det
    //    ingen reqId i planleggerens rad å hente. Turid har vi derimot alltid fra popupen, og
    //    verktøykassen har lenge oversatt turid → (reqId, db, resId) med searchStatus/tripSearch
    //    (verktoykasse.js:1169 hentTurDetaljer). Ett ekstra POST, kun når raden kom tom.
    async function frmReqIdsFraTurid(turid) {
        const tomt = { reqIds: [], resIds: [] };
        if (!turid) return tomt;
        try {
            const body = 'submit_action=tripSearch&tripNr=' + encodeURIComponent(turid)
                + '&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1';
            const r = await fetch(NISSY_ORIGIN + '/administrasjon/admin/searchStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body, credentials: 'same-origin',
            });
            if (!r.ok) return tomt;
            const h = await r.text();
            const reqIds = [], resIds = [];
            for (const m of h.matchAll(/getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
                reqIds.push(m[1]); resIds.push(m[3]);
            }
            const ut = { reqIds: [...new Set(reqIds)], resIds: [...new Set(resIds)] };
            if (ER_DEV) console.log('[' + NAVN + '] fremmestatus-popup: searchStatus(tur ' + turid + ') → '
                + ut.reqIds.length + ' reqId(' + ut.reqIds.join(',') + ') resId(' + ut.resIds.join(',') + ')');
            return ut;
        } catch (e) {
            frmAdvar('searchStatus-feilet', 'tur ' + turid + ': ' + ((e && e.message) || e));
            return tomt;
        }
    }

    // ── Bomtur-detaljer (Thomas 27.08: «klarer vi mer enn meldt?») ─────────────────────────
    // SUTI 1703 sier BARE at det ble meldt bomtur. Koden sjåføren tastet og årsaken som ble
    // registrert ligger på rekvisisjonen, og 1703-raden bærer rekvisisjonsnummeret — så det er
    // ett oppslag unna.
    // ⚠️ MYK AVHENGIGHET: oppslaget bor i basic_tools (som eier admin-flyten). Er verktøykassen
    //    ikke lastet, viser vi «meldt» som før. Fremmestatus skal fortsatt kunne stå alene —
    //    det var hele poenget med å skille filene.
    const _frmBomtur = {};
    async function frmSikreBomtur(rekvListe) {
        const fn = window.__basicTools && window.__basicTools.bomturDetaljer;
        if (typeof fn !== 'function') return;
        for (const rekv of rekvListe) {
            if (!rekv || _frmBomtur[rekv] !== undefined) continue;
            try {
                _frmBomtur[rekv] = await fn(rekv);
            } catch (e) {
                _frmBomtur[rekv] = null;
                if (ER_DEV) console.log('[' + NAVN + '] bomtur-detaljer feilet for ' + rekv + ':', e);
            }
        }
    }

    // Bygger seksjonens innhold. Returnerer rader: { e: etikett, v: verdi, tip, farge, skille, fet }.
    //
    // ⚠️ GRUPPERT PER PASSASJER (Thomas 25.08). Først var rekkefølgen hendelsesstyrt — alle
    //    fremme-tider, så alle hentet-tider. Med rekvisisjonsnumre gikk det an; med NAVN ble det
    //    uleselig: «FURU 12:52 · DALEN 13:00 · FURU 12:59 · DALEN 13:03» tvinger leseren til å
    //    holde to tidslinjer i hodet samtidig. Nå hører tidene sammen med PERSONEN, og en tynn
    //    strek skiller passasjerene.
    function frmPopupRader(svar, funn, radInfo) {
        const rid = (funn && (funn.brukt || funn.id)) || '';
        const nk = radInfo || {};
        const ut = [];
        const g = (svar && Array.isArray(svar.g)) ? svar.g : [];

        // ── Bil-nivå: gjelder hele turen, uavhengig av passasjer ────────────────────────
        if (svar && svar.sd) ut.push({ e: 'Sendt transportør:', v: (svar.sdd ? svar.sdd + ' ' : '') + svar.sd,
            tip: 'Turen ble sendt ut til transportør — SUTI-loggens første hendelse' });
        if (svar && svar.v) ut.push({ e: 'Bil på vei:', v: svar.v + (svar.l ? '  —  løyve ' + svar.l : ''),
            tip: 'SUTI 3003 — bil tildelt/på vei. Gjelder HELE bilen, ikke per passasjer', farge: '#0891b2' });

        // ── Per passasjer, sortert på fremme-tid ────────────────────────────────────────
        const medHendelse = g.filter(x => x && (x.frammeTid || x.hentetTid || x.bomtur))
            .sort((a, b) => (a.frammeTid || a.hentetTid || '').localeCompare(b.frammeTid || b.hentetTid || ''));

        // ⚠️ To ulike feil ser IDENTISKE ut utenfra: (a) koblingen ble aldri bygget, (b) den ble
        //    bygget med andre rekvisisjonsnumre enn SUTI-loggen bruker. Begge gir «rekv NNN» i
        //    visningen. Loggen under skiller dem.
        if (ER_DEV && medHendelse.length) {
            const mangler = medHendelse.filter(x => x.rekv && !nk[x.rekv]).map(x => x.rekv);
            if (mangler.length) console.log('[' + NAVN + '] navn mangler for ' + mangler.join(', ')
                + ' — radkoblingen kjenner: ' + (Object.keys(nk).join(', ') || '(ingen)'));
        }
        medHendelse.forEach((x, i) => {
            const info = (x.rekv && nk[x.rekv]) || {};
            // Admin er fasit; tabellparringen beholdes kun som reserve.
            const navn = (x.rekv && _frmNavn[x.rekv]) || info.navn
                       || (x.rekv ? 'rekv ' + x.rekv : 'ukjent passasjer');
            // Skillelinje foran hver passasjer etter den første — og foran den første når det er
            // flere, så bil-nivået over er tydelig atskilt fra det som gjelder enkeltpersoner.
            ut.push({ e: navn, v: '', fet: true, skille: medHendelse.length > 1 || i > 0,
                      tip: x.rekv ? 'Rekvisisjon ' + x.rekv : '' });
            if (x.bomtur) {
                const d = x.rekv ? _frmBomtur[x.rekv] : null;
                // Rekkefølgen er den operatøren trenger den: HVA slags bomtur, så koden sjåføren
                // tastet, så når den ble meldt. Mangler noe, faller vi tilbake til «meldt».
                const biter = [];
                if (d && d.aarsak) biter.push(d.aarsak);
                if (d && d.kode) biter.push('kode ' + d.kode);
                biter.push(x.bomturTid ? 'meldt ' + x.bomturTid : 'meldt');
                ut.push({ e: 'Bomtur:', v: biter.join('  ·  '), farge: '#dc2626',
                    tip: 'SUTI 1703 — bomtur' + (x.rekv ? ' (rekv ' + x.rekv + ')' : '')
                        + (d && d.aarsak ? '' : '\nÅrsak ikke registrert i NISSY ennå.') });
            }
            if (x.frammeTid) ut.push({ e: 'Fremme hentested:', v: x.frammeTid, farge: '#16a34a',
                tip: 'SUTI 1709 — bilen meldt fremme på hentestedet' + (x.rekv ? ' (rekv ' + x.rekv + ')' : '') });
            if (x.hentetTid) ut.push({ e: 'Pasient hentet:', v: x.hentetTid, farge: '#16a34a',
                tip: 'SUTI 1701 — pasient om bord' + (x.rekv ? ' (rekv ' + x.rekv + ')' : '') });
        });

        if (!ut.length) {
            ut.push({ e: 'Fremmestatus:', v: (svar && svar.s) ? 'ingen melding fra bil ennå' : 'ingen SUTI-logg funnet',
                tip: ((svar && svar.s)
                        ? 'SUTI-loggen finnes, men verken 3003, 1709 eller 1701 er registrert'
                        : 'Bilen har ikke kommunisert med NISSY for denne turen')
                    + ' — slo opp ressurs-id ' + (rid || '?') + ' (kilde: ' + ((funn && funn.kilde) || '?') + ')'
                    + (funn && funn.reqId ? ', rekvisisjons-id ' + funn.reqId : ', UTEN rekvisisjons-id — kun 1 av 3 oppslag ble kjørt') });
        }
        return ut;
    }

    // ⚠️ NISSYs egen struktur: ytre tabell har ÉN kolonne — overskrift i td.reqvtitle, innhold i
    // td.reqv_value med en NØSTET tabell av td.travel-par. En to-cellers rad rett i den ytre
    // tabellen vises, men bryter kolonnebredden.
    function frmLagVerdiRad(rader) {
        const tr = document.createElement('tr');
        tr.className = 'vkt-frm-seksjon';
        const td = document.createElement('td');
        td.className = 'reqv_value';
        const tab = document.createElement('table');
        tab.style.cssText = 'border-collapse:collapse;';
        const tb = document.createElement('tbody');
        rader.forEach(rad => {
            const r = document.createElement('tr');
            const a = document.createElement('td'); a.className = 'travel';
            const b = document.createElement('td'); b.className = 'travel';
            a.textContent = rad.e || '';
            // Etiketten skal aldri brytes over to linjer — den ble smal og hakkete da verdikolonnen
            // vokste med navn og adresser.
            a.style.whiteSpace = 'nowrap';
            a.style.verticalAlign = 'top';
            b.style.verticalAlign = 'top';
            if (rad.fet) {
                // Passasjernavnet er en overskrift for blokka under, ikke en verdi.
                a.colSpan = 2;
                a.style.fontWeight = '700';
                a.style.paddingTop = '4px';
                r.appendChild(a);
            } else {
                // ⚠️ Behandlingssteder er lange og skilt med «/»: «Smertespesialistene Colosseum
                //    AS/Anestesiolog Kjell Aage Moe Torp-Joakimsen/Inngang D, 3.etg, 0369 Oslo».
                //    Vi bryter PÅ skråstreken (Thomas 25.08) i stedet for å la nettleseren brekke
                //    midt i et navn — hvert ledd er en meningsbærende enhet.
                b.textContent = String(rad.v == null ? '' : rad.v).replace(/\s*\/\s*/g, '\n');
                b.style.whiteSpace = 'pre-line';
                if (rad.farge) { b.style.color = rad.farge; b.style.fontWeight = '700'; }
                r.appendChild(a); r.appendChild(b);
            }
            if (rad.skille) {
                // Tynn strek som skiller passasjerene. På cellene, ikke raden — <tr> tar ikke
                // border i alle nettlesere når tabellen ikke er collapse.
                [a, b].forEach(c => { c.style.borderTop = '1px solid #cbd5e1'; c.style.paddingTop = '5px'; });
            }
            if (rad.tip) r.title = rad.tip;
            tb.appendChild(r);
        });
        tab.appendChild(tb); td.appendChild(tab); tr.appendChild(td);
        return tr;
    }

    // ── REKVISISJONSNR → PASIENTNAVN ────────────────────────────────────────────────────
    // Tolv siffer sier operatøren ingenting; navnet gjør det (Thomas 25.08). Koblingen tas fra
    // pågående-raden, som har begge deler GRATIS og i samme rekkefølge: NISSY stiller opp
    // passasjerene med én <div class="even/odd row-image"> per passasjer i HVER celle.
    //
    // ⚠️ BEVISBYRDEN LIGGER HOS OSS. Å vise feil pasient på en fremme-tid er verre enn å vise et
    //    nummer — operatøren ville handlet på det. Derfor kobler vi KUN når antall navn og antall
    //    rekvisisjonsnumre er like; ellers beholdes nummeret. Ingen gjetting.
    function frmRadInfoPerRekv(pRad) {
        const kart = {};
        if (!pRad) return kart;
        try {
            const tab = pRad.closest('table');
            // NISSYs header ligger i tbody som tr.tbh — men ikke stol på det alene. Finner vi den
            // ikke, let etter en hvilken som helst rad som inneholder kolonnenavnet.
            let hdr = tab && tab.querySelector('tr.tbh');
            if (!hdr && tab) {
                hdr = [...tab.rows].find(r => /\bPNAVN\b|PASIENTNAVN/i.test(r.textContent || ''));
            }
            if (!hdr) {
                if (ER_DEV) console.log('[' + NAVN + '] radkobling: fant ingen headerrad (verken tr.tbh eller PNAVN-rad)');
                return kart;
            }
            const kolonner = [...hdr.cells].map(c => (c.textContent || '').trim().toUpperCase());
            const iNavn = kolonner.findIndex(t => t.indexOf('PNAVN') >= 0 || t.indexOf('PASIENTNAVN') >= 0 || t === 'NAVN');
            if (iNavn < 0 || !pRad.cells[iNavn]) {
                if (ER_DEV) console.log('[' + NAVN + '] radkobling: ingen navnekolonne. Header: '
                    + kolonner.join(' | '));
                return kart;
            }
            // Henteadressen ble prøvd og forkastet (Thomas 25.08: «tror egentlig vi klarer oss med
            // navn»). Behandlingsstedene er lange nok til å dominere hele seksjonen, og operatøren
            // har adressen i raden ved siden av. Kolonneoppslaget beholdes — kartet bærer feltet,
            // så det er én linje å slå på igjen om det skulle vise seg å mangle.
            const iFra = kolonner.findIndex(t => t === 'FRA' || t.indexOf('FRATIL') >= 0);

            const lesLinjer = (c) => {
                if (!c) return [];
                const d = c.querySelectorAll('div');
                return d.length ? [...d].map(x => (x.textContent || '').trim())
                                : [(c.textContent || '').trim()];
            };
            const navn = lesLinjer(pRad.cells[iNavn]);
            const fra  = iFra >= 0 ? lesLinjer(pRad.cells[iFra]) : [];
            // Rekvisisjonsnumrene i radens egen rekkefølge — samme antakelse som
            // omraade_assistent.js:1651 gjør om at NISSY legger dem parvis.
            // ⚠️ Mønsteret arvet fra basic_tools var `2[567]\d{10}` — det MISSER 264016124161
            //    (Thomas 25.08). Rekvisisjonsnumrene er ikke så snevre som antatt. Vi tar derfor
            //    searchStatus-lenkene først, og faller tilbake på et bredt 12-sifret mønster.
            const rh = pRad.innerHTML || '';
            let rekv = [...new Set([...rh.matchAll(/searchStatus\?nr=(\d{12})/g)].map(x => x[1]))];
            if (!rekv.length) {
                rekv = [...new Set([...rh.matchAll(/\b(2\d{11})\b/g)].map(x => x[1]))];
            }

            if (!navn.length || navn.length !== rekv.length) {
                if (ER_DEV) console.log('[' + NAVN + '] radkobling hoppet over: ' + navn.length
                    + ' navn [' + navn.join(' § ') + '] mot ' + rekv.length + ' rekvnr ['
                    + rekv.join(', ') + '] — beholder numrene. Navnekolonne=' + iNavn
                    + ' fra=' + iFra + ' header: ' + kolonner.join(' | '));
                return kart;
            }
            // Adressen kobles på SAMME beviskrav som navnet: like mange linjer, ellers dropper vi den.
            const fraOk = fra.length === rekv.length;
            rekv.forEach((r, i) => {
                kart[r] = { navn: navn[i] || '', fra: fraOk ? (fra[i] || '') : '' };
            });
            if (ER_DEV) console.log('[' + NAVN + '] radkobling OK: '
                + rekv.map((r, i) => r + '=' + (navn[i] || '?')).join(' | '));
        } catch (_) {}
        return kart;
    }

    function frmPyntRessursPopup() {
        let titler;
        try { titler = [...document.querySelectorAll('td.reqvtitle')]; } catch (_) { return; }
        if (!titler.length) return;
        const info = titler.find(t => /Ressurs\s*info/i.test(t.textContent || ''));
        if (!info || !info.closest) return;
        const hdrRad = info.closest('tr');
        if (!hdrRad || !hdrRad.parentNode) return;
        const rot = hdrRad.closest('table') || hdrRad.parentNode;
        if (rot.querySelector('.vkt-frm-seksjon')) return;      // idempotent

        // Sett inn RETT ETTER «Ressurs info»-blokka, altså foran neste seksjonsoverskrift.
        let foran = hdrRad.nextElementSibling;
        while (foran && !foran.querySelector('td.reqvtitle')) foran = foran.nextElementSibling;

        const hdr = document.createElement('tr');
        hdr.className = 'vkt-frm-seksjon';
        const hdrTd = document.createElement('td');
        hdrTd.className = 'reqvtitle';
        // Verktøykassens signaturfarge (Thomas 25.08). #fbbf24 på #451a03 er samme par som BETA-
        // merkene, toast-rammene og samkjørings-popupen bruker — seksjonen leses da umiddelbart
        // som VÅR, ikke som en av NISSYs egne blå. Viktig når vi skriver inn i andres grensesnitt:
        // operatøren skal aldri være i tvil om hvem som står bak et tall.
        hdrTd.style.background = '#fbbf24';
        hdrTd.style.color = '#451a03';
        hdrTd.textContent = '📍 Fremmestatus (SUTI)';
        hdr.appendChild(hdrTd);
        let verdiRad = frmLagVerdiRad([{ e: 'Fremmestatus:', v: 'henter …' }]);
        hdrRad.parentNode.insertBefore(hdr, foran || null);
        hdrRad.parentNode.insertBefore(verdiRad, foran || null);

        const funn = frmFinnRid(rot);
        const rid = funn.id;
        if (!rid) {
            verdiRad.replaceWith(verdiRad = frmLagVerdiRad([{ e: 'Fremmestatus:', v: 'fant ikke ressurs-id',
                tip: 'Verken showRes-wrapperen, markupen eller løyve-oppslaget ga en resId' }]));
            return;
        }
        // ⚠️ reqId ER NØDVENDIG. ajax_reqdetails sin «id» er en REKVISISJONS-id (jf.
        // verktoykasse.js:1253 `id=${reqId}&tripid=${tripid}`). Uten reqId kjørte
        // frmHentSuti bare kombo [resId, resId] — 1 av 3 — og den ga «seksjon=false rader=0»
        // på OS-15169 (Thomas 25.08). Den ekte kombinasjonen er [reqId, resId].
        // Popupen har den ikke, men pågående-raden har: P-<resId> inneholder showReq(this, <reqId>).
        // ⚠️ rid FRA showRes ER IKKE NØDVENDIGVIS resId (Live, overvaaker_live.js:5677):
        //       const tabellResId = rad.getAttribute('name') || rad.id.replace('P-', '');
        //    Raden har et NAME-attributt som kan avvike fra id-en, og showRes kalles med name.
        //    Derfor slo `getElementById('P-' + rid)` bom, reqId ble tom, og bare kombo
        //    [resId, resId] ble kjørt — som ga «seksjon=false rader=0» på både OS-15169 og
        //    tur 72124579 (Thomas 25.08). Vi leter derfor på BEGGE, og lar RADEN definere resId.
        const tab = document.getElementById('pagaendeoppdrag');
        let pRad = document.getElementById('P-' + rid);
        if (!pRad && tab) { try { pRad = tab.querySelector('tr[name="' + rid + '"]'); } catch (_) {} }
        const resId = pRad ? pRad.id.replace(/^P-/, '') : rid;
        // ⚠️ BREDERE ENN «showReq(this,» (25.08, tur 72127538: rad funnet, men reqIds=∅).
        //    Kolonneoppsettet varierer per operatør (§3 i NISSY-Planlegging), så plakat-ikonet som
        //    bærer showReq er ikke garantert å stå i raden. Vi godtar derfor et hvilket som helst
        //    førsteargument, valgfrie anførselstegn, og faller tilbake på reqId i lenker.
        let reqIds = [];
        if (pRad) {
            const rh = pRad.innerHTML || '';
            reqIds = [...new Set([
                ...[...rh.matchAll(/showReq\s*\(\s*[^,]+,\s*['"]?(\d+)/gi)].map(x => x[1]),
                ...[...rh.matchAll(/[?&]reqid=(\d+)/gi)].map(x => x[1]),
            ])];
            // ⚠️ IKKE console.warn her. Dette er en HÅNDTERT tilstand — searchStatus tar over på
            //    neste linje, og turen løses like godt. En advarsel med stack-trace for noe som
            //    virker, lærer bare folk å overse advarsler. Warn er reservert de tilfellene der
            //    noe faktisk trenger oppmerksomhet (se frmAdvar).
            if (!reqIds.length && ER_DEV) {
                console.log('[' + NAVN + '] raden ' + pRad.id + ' bærer ingen reqId — går via searchStatus');
            }
        }
        const reqId = reqIds.join(',');
        if (ER_DEV) console.log('[' + NAVN + '] fremmestatus-popup: rid=' + rid + ' → resId=' + resId
            + ' reqIds=' + (reqId || '∅') + ' (' + reqIds.length + ' rekvisisjon' + (reqIds.length === 1 ? '' : 'er') + ')'
            + (pRad ? ' (rad ' + pRad.id + ', name=' + (pRad.getAttribute('name') || '∅') + ')'
                    : ' ⚠ fant ingen rad i pågående — verken P-' + rid + ' eller tr[name="' + rid + '"]'));
        // Reisenr (turid) står i «Ressurs info» og er den eneste sikre identiteten popupen har.
        // Den brukes som korrekthetssjekk mot loggen — se frmHentSuti.
        let turid = '';
        try {
            const merker = [...rot.querySelectorAll('td.travel')];
            const rm = merker.find(t => /^Reisenr/i.test((t.textContent || '').trim()));
            if (rm && rm.nextElementSibling) turid = (rm.nextElementSibling.textContent || '').trim();
            if (!/^\d{8}$/.test(turid)) turid = '';
        } catch (_) {}
        if (ER_DEV) console.log('[' + NAVN + '] fremmestatus-popup: turid=' + (turid || '∅'));
        (async () => {
            // Andre vakt mot hover-sveip: rakk popupen å bli fylt på nytt med en ANNEN ressurs
            // mens vi ventet, er dette oppslaget foreldet før det er begynt.
            const ridVedStart = _frmSisteRid;
            const foreldet = () => !verdiRad.parentNode || (_frmSisteRid && _frmSisteRid !== ridVedStart);
            let brukResId = resId, brukReqIds = reqIds;
            // Kom raden tom for reqId, oversett turid → reqIds. Uten reqId er det bare
            // [resId, resId] igjen, og den kombinasjonen gir aldri noen logg.
            if (!brukReqIds.length && turid) {
                if (foreldet()) return;                         // kortet viser noe annet nå
                const fra = await frmReqIdsFraTurid(turid);
                brukReqIds = fra.reqIds;
                // searchStatus gir også turens egne resId-er. Fant vi ingen rad i pågående,
                // er de bedre enn rid-en vi gjettet oss til.
                if (!pRad && fra.resIds.length) brukResId = fra.resIds[0];
            }
            funn.brukt = brukResId; funn.reqId = brukReqIds.join(',');
            if (foreldet()) return;
            const svar = await frmHentSuti(brukResId, brukReqIds, turid);
            if (foreldet()) return;                             // lukket, eller byttet ressurs
            // Navn på passasjerene med hendelser — admin, ikke tabellgjetting.
            const trengs = (svar && Array.isArray(svar.g) ? svar.g : [])
                .filter(x => x && (x.frammeTid || x.hentetTid || x.bomtur)).map(x => x.rekv);
            if (trengs.length) await frmSikreNavn(brukResId, brukReqIds, trengs);
            if (foreldet()) return;
            // Kun for de som FAKTISK har bomtur — vanligvis null rader, aldri hele kortet.
            const bomturRekv = (svar && Array.isArray(svar.g) ? svar.g : [])
                .filter(x => x && x.bomtur && x.rekv).map(x => x.rekv);
            if (bomturRekv.length) await frmSikreBomtur(bomturRekv);
            if (foreldet()) return;
            verdiRad.replaceWith(frmLagVerdiRad(frmPopupRader(svar, funn, frmRadInfoPerRekv(pRad))));
        })().catch(e => {
            if (verdiRad.parentNode) verdiRad.replaceWith(frmLagVerdiRad(
                [{ e: 'Fremmestatus:', v: 'oppslag feilet', tip: String(e && e.message), farge: '#dc2626' }]));
        });
    }

    // ⚠️ POPUPEN FYLLES PÅ onmouseover (stack 25.08: onmouseover → showRes →
    //    ResourceShowUpdater._showResource → rico ajax → vår observer). En operatør som drar musa
    //    nedover ressurskolonnen, streifer dusinvis av rader — og med 60 ms debounce ville hver av
    //    dem utløst et fullt oppslag, inkludert searchStatus-POST. Det er ikke greit mot admin.
    //    450 ms er lenger enn et sveip, kortere enn et blikk: står musa i ro fordi operatøren
    //    faktisk LESER kortet, rekker vi å dekorere før hun er ferdig med «Ressurs info».
    const FRM_HVILE_MS = 450;
    function frmPopupSnart() {
        if (_frmPopupTmr) clearTimeout(_frmPopupTmr);
        _frmPopupTmr = setTimeout(frmPyntRessursPopup, FRM_HVILE_MS);
    }

    // ══ OPPSTART ═══════════════════════════════════════════════════════════════════════
    // Ingen intervall, ingen skanning, ingen tilstand. Vi trenger bare showRes-wrapperen på
    // plass, og en observer som ser når popupen fylles.
    frmKapreShowRes();

    const frmObs = new MutationObserver(muts => {
        for (const m of muts) {
            for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                // Seksjonsoverskriftene i ressurs-popupen er td.reqvtitle. En klasse-query er langt
                // billigere enn å serialisere textContent, og planleggerens vanlige rader har ingen.
                if (n.querySelector && n.querySelector('td.reqvtitle')) { frmPopupSnart(); break; }
            }
        }
    });
    frmObs.observe(document.body, { childList: true, subtree: true });

    // Konsolltest uten UI. frmDiag tømmer cachen først — ellers måler man cachen, ikke hentingen.
    window.__fremmestatus.suti = frmHentSuti;
    window.__fremmestatus.reqIdsFraTurid = frmReqIdsFraTurid;
    window.__fremmestatus.parse = frmParseSuti;
    window.__fremmestatus.diag = async function (resId, reqIds, turid) {
        delete _frmSuti[resId + '|' + (turid || '')];
        console.log('[' + NAVN + '] diag: cache tømt — kjører hele kombo-stigen');
        return frmHentSuti(resId, reqIds, turid);
    };

    // Testøkt-oppgjør: __fremmestatus.stat() etter en time gir fasit på om noe har glippet.
    window.__fremmestatus.stat = function () {
        console.table([{ 'økt startet': _stat.start || '?', oppslag: _stat.oppslag, http_kall: _stat.kall,
                         traff: _stat.treff, uten_logg: _stat.tomme, advarsler: _stat.advarsler.length,
                         kall_pr_oppslag: _stat.oppslag ? (_stat.kall / _stat.oppslag).toFixed(1) : '-' }]);
        const u = _stat.utfall, sum = u.fremme + u.paavei + u.sendt + u.ingenting;
        const pst = n => sum ? Math.round(100 * n / sum) + ' %' : '-';
        console.table([
            { utfall: '📍 fremme meldt (1709)', antall: u.fremme,     andel: pst(u.fremme) },
            { utfall: '🚗 på vei (3003)',        antall: u.paavei,     andel: pst(u.paavei) },
            { utfall: '📤 kun sendt',            antall: u.sendt,      andel: pst(u.sendt) },
            { utfall: '— ingen melding',         antall: u.ingenting,  andel: pst(u.ingenting) },
        ]);
        if (_stat.advarsler.length) console.table(_stat.advarsler);
        else console.log('[' + NAVN + '] ingen advarsler i denne økten');
        return _stat;
    };
    window.__fremmestatus.nullstill = function () {
        _stat.oppslag = _stat.kall = _stat.treff = _stat.tomme = 0;
        _stat.advarsler.length = 0;
        _stat.utfall = { fremme: 0, paavei: 0, sendt: 0, ingenting: 0 };
        _stat.start = new Date().toTimeString().slice(0, 8);
        frmLagreStat();
        console.log('[' + NAVN + '] telleverk nullstilt');
    };

    console.log('[' + NAVN + ' v' + VERSJON + '] aktiv — SUTI-seksjon i ressurs-popupen.'
        + ' Egenkontroll: __fremmestatus.stat()');
})();
