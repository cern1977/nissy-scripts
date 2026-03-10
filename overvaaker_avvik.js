(function() {
    // ==================================================================
    //    Overvåker Avvik v38.0.85
    //    Standalone avviksmonitor for NISSY
    //    Arkitektur: Dispatch-first -- leser data fra dispatch-XML
    //    Sjekker: Barn, PNR, Dublett, Adresse, Kommunegrense
    //    Ingen IndexedDB -- hver skanning er uavhengig
    // ==================================================================
    const VERSION = '38.0.85';
    const TITTEL = 'Overvåker Avvik v' + VERSION;

    const CONFIG = {
        RFILTER_IDS: [19249, 19250, 19251, 19259, 19260, 19261, 19262, 19263],
        BARN_ALDER_GRENSE: 12,
        BLIKSUND_URL: 'https://zone1.bliksundhub.com/65113/grid/v2/prk_incident/131/incidents/create',
        RAPPORT_EPOST: 'thomas.westby@ous-hf.no'
    };

    const GH_CONFIG = {
        TOKEN: (()=>{const p=['Z2l0aHViX3BhdF8xMUJWSzYyTkEw','bWxuTVFrNlA2TGdLX2RIcXdya0NP','RzQxQ2Zxbm1yS2dCUXhxczdFVzBh','T0s2ZzF4R2g4TGRxc1dZR1NSTkRC','RUhWeUtJRUFm'];return atob(p.join(''));})(),
        REPO: 'cern1977/nissy-scripts',
        FIL_ADR: 'godkjente_adresser.json',
        FIL_KOM: 'godkjente_kommune.json'
    };

    let godkjenteAdresserGH = [];
    let godkjenteOrdGH = [];
    let godkjenteKommuneOrdGH = [];
    let godkjenteKommuneAdresserGH = [];
    let ghAdrSHA = null;
    let ghKomSHA = null;
    const GH_LS_ADR = 'overvaker_avvik_godkjente_adr';
    const GH_LS_KOM = 'overvaker_avvik_godkjente_kom';

    function lastGodkjenteFraLS() {
        try {
            const a = localStorage.getItem(GH_LS_ADR);
            if (a) { const j = JSON.parse(a); godkjenteAdresserGH = (j.adresser||[]).map(x=>x.toLowerCase().trim()); godkjenteOrdGH = (j.ord||[]).map(x=>x.toLowerCase().trim()); }
            const k = localStorage.getItem(GH_LS_KOM);
            if (k) { const j = JSON.parse(k); godkjenteKommuneOrdGH = (j.ord||[]).map(x=>x.toLowerCase().trim()); godkjenteKommuneAdresserGH = j.adresser||[]; }
            console.log(`[GH] LS-fallback: ${godkjenteAdresserGH.length} adr, ${godkjenteOrdGH.length} ord, ${godkjenteKommuneOrdGH.length} k-ord, ${godkjenteKommuneAdresserGH.length} k-adr`);
        } catch (e) {}
    }

    function lagreAdrILS() { try { localStorage.setItem(GH_LS_ADR, JSON.stringify({adresser:godkjenteAdresserGH, ord:godkjenteOrdGH, oppdatert:new Date().toISOString().slice(0,10)})); } catch(e){} }
    function lagreKomILS() { try { localStorage.setItem(GH_LS_KOM, JSON.stringify({ord:godkjenteKommuneOrdGH, adresser:godkjenteKommuneAdresserGH, oppdatert:new Date().toISOString().slice(0,10)})); } catch(e){} }

    async function lastGodkjenteAdresser() {
        try {
            const [resA, resK] = await Promise.all([
                fetch(`https://api.github.com/repos/${GH_CONFIG.REPO}/contents/${GH_CONFIG.FIL_ADR}`, { headers: { 'Authorization': `Bearer ${GH_CONFIG.TOKEN}` } }),
                fetch(`https://api.github.com/repos/${GH_CONFIG.REPO}/contents/${GH_CONFIG.FIL_KOM}`, { headers: { 'Authorization': `Bearer ${GH_CONFIG.TOKEN}` } })
            ]);
            if (resA.ok) {
                const d = await resA.json(); ghAdrSHA = d.sha;
                const j = JSON.parse(atob(d.content.replace(/\n/g, '')));
                godkjenteAdresserGH = (j.adresser||[]).map(a=>a.toLowerCase().trim());
                godkjenteOrdGH = (j.ord||[]).map(o=>o.toLowerCase().trim());
                lagreAdrILS();
            }
            if (resK.ok) {
                const d = await resK.json(); ghKomSHA = d.sha;
                const j = JSON.parse(atob(d.content.replace(/\n/g, '')));
                godkjenteKommuneOrdGH = (j.ord||[]).map(o=>o.toLowerCase().trim());
                godkjenteKommuneAdresserGH = j.adresser||[];
                lagreKomILS();
            }
            console.log(`[GH] Lastet: ${godkjenteAdresserGH.length} adr, ${godkjenteOrdGH.length} ord, ${godkjenteKommuneOrdGH.length} k-ord, ${godkjenteKommuneAdresserGH.length} k-adr`);
        } catch (e) {
            console.warn('[GH] Brannmur/feil — bruker localStorage-fallback:', e.message);
            lastGodkjenteFraLS();
        }
    }

    async function lagreGHFil(fil, sha, innhold, melding) {
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(innhold))));
        const res = await fetch(`https://api.github.com/repos/${GH_CONFIG.REPO}/contents/${fil}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${GH_CONFIG.TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: melding, content: encoded, sha: sha })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        return data.content.sha;
    }

    async function lagreGHAdr(melding) {
        ghAdrSHA = await lagreGHFil(GH_CONFIG.FIL_ADR, ghAdrSHA, { adresser: godkjenteAdresserGH, ord: godkjenteOrdGH, oppdatert: new Date().toISOString().slice(0,10) }, melding);
        lagreAdrILS();
    }

    async function lagreGHKom(melding) {
        ghKomSHA = await lagreGHFil(GH_CONFIG.FIL_KOM, ghKomSHA, { ord: godkjenteKommuneOrdGH, adresser: godkjenteKommuneAdresserGH, oppdatert: new Date().toISOString().slice(0,10) }, melding);
        lagreKomILS();
    }

    async function lagreGodkjentAdresse(adresse, kortType) {
        const ny = adresse.toLowerCase().trim();
        if (kortType === 'kommune') {
            if (godkjenteKommuneAdresserGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
            godkjenteKommuneAdresserGH = [...godkjenteKommuneAdresserGH, ny];
            try { await lagreGHKom(`K-Adresse: ${ny}`); return { ok: true, melding: 'Lagret!' }; }
            catch (e) { return { ok: false, melding: 'Feil: ' + e.message }; }
        } else {
            if (godkjenteAdresserGH.includes(ny)) return { ok: false, melding: 'Allerede i listen' };
            godkjenteAdresserGH = [...godkjenteAdresserGH, ny];
            try { await lagreGHAdr(`Adresse: ${ny}`); return { ok: true, melding: 'Lagret!' }; }
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
            else { godkjenteAdresserGH = godkjenteAdresserGH.filter(a => a !== adresse); await lagreGHAdr(`Fjern adresse: ${adresse}`); }
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

    // Gruppering av rfiltre for filterPanel
    const FILTER_GRUPPER = {
        dagens: [19249, 19250, 19261, 19251],
        morgen: [19259, 19260, 19262, 19263]
    };

    // Postnummer for adressesjekk "kanskje" (behandlingssted) — flyttes til kolonne 2
    const ADRESSE_KANSKJE_POSTNR = ['0372', '0450', '0379', '1474', '0586', '1346'];

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

    // Retry-wrapper: prøver sjekkAdminLogin opptil maxForsøk ganger med pause
    async function sjekkAdminLoginMedRetry(maxForsøk = 3, pauseMs = 2000) {
        for (let i = 1; i <= maxForsøk; i++) {
            const ok = await sjekkAdminLogin();
            if (ok) return true;
            if (i < maxForsøk) {
                console.log(`[ADMIN] Forsøk ${i}/${maxForsøk} feilet, prøver igjen om ${pauseMs/1000}s...`);
                await new Promise(r => setTimeout(r, pauseMs));
            } else {
                console.warn(`[ADMIN] Alle ${maxForsøk} forsøk feilet`);
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
    // Hent lagrede aktive filtre fra localStorage (default: alle aktive)
    const lagretFiltre = localStorage.getItem('overvaker_avvik_filtre');
    let aktiveFiltre = new Set(CONFIG.RFILTER_IDS); // default: alle på
    if (lagretFiltre) {
        try {
            const parsed = JSON.parse(lagretFiltre);
            if (Array.isArray(parsed) && parsed.length > 0) aktiveFiltre = new Set(parsed);
        } catch (e) {}
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

            console.log(`[ADMIN] RID=${reqId}: rek=${rekNr} rekv="${rekvirent}" folk="${folkAdr.substring(0,50)}" fraNavn="${fraNavn}" fra="${fraAdr.substring(0,50)}" tilNavn="${tilNavn}" til="${tilAdr.substring(0,50)}" erTur=${erTur}`);
            return { fra: fraAdr, til: tilAdr, folk: folkAdr, fraNavn, tilNavn, fraKommentar, tilKommentar, erTur, rekNr, rekvirent, bestiller, ansvarligRekvirent, sistEndretBruker, pasientNavn, pnr, meldTransport, meldPasReise };
        } catch (e) {
            console.warn(`[ADMIN] Feil ved henting av RID=${reqId}:`, e.message);
            return null;
        }
    }

    async function beregnKm(fraAdresse, tilAdresse) {
        try {
            const parseAdresse = (adr) => {
                if (!adr) return { gate: '', husnr: '', husnr_sub: '', postnr: '' };
                const linjer = adr.split(/[\n,]/).map(l => l.trim()).filter(l => l.length > 0);
                let gate = '', husnr = '', husnr_sub = '', postnr = '';
                for (const linje of linjer) {
                    const postnrMatch = linje.match(/^(\d{4})\s+([A-Za-zÆØÅæøå])/);
                    if (postnrMatch) { postnr = postnrMatch[1]; break; }
                }
                for (const linje of linjer) {
                    if (/^\d{4}\s+[A-Za-zÆØÅæøå]/.test(linje)) continue;
                    const gateMatch = linje.match(/^(.+)\s+(\d+)\s*([A-Za-z])?$/);
                    if (gateMatch) { gate = gateMatch[1].trim(); husnr = gateMatch[2].trim(); husnr_sub = gateMatch[3] || ''; break; }
                }
                // Fallback: bruk første ikke-postnr linje som gate (sykehus, klinikker uten husnr)
                if (!gate) {
                    for (const linje of linjer) {
                        if (/^\d{4}\s+[A-Za-zÆØÅæøå]/.test(linje)) continue;
                        if (/^\d+\s+(etg|etasje)/i.test(linje)) continue; // hopp over "1 etg"
                        gate = linje.trim();
                        break;
                    }
                }
                return { gate, husnr, husnr_sub, postnr };
            };
            const fra = parseAdresse(fraAdresse);
            const til = parseAdresse(tilAdresse);
            console.log(`[KM] parseAdresse fra: ${JSON.stringify(fra)} ← "${fraAdresse?.substring(0,60)}"`);
            console.log(`[KM] parseAdresse til: ${JSON.stringify(til)} ← "${tilAdresse?.substring(0,60)}"`);
            if (!fra.gate || !fra.postnr || !til.gate || !til.postnr) {
                console.warn(`[KM] Mangler data: fra.gate="${fra.gate}" fra.postnr="${fra.postnr}" til.gate="${til.gate}" til.postnr="${til.postnr}" → returnerer null`);
                return null;
            }
            const body = new URLSearchParams({
                fra_gate: fra.gate, fra_husnr: fra.husnr, fra_husnr_sub: fra.husnr_sub, fra_postnr: fra.postnr,
                til_gate: til.gate, til_husnr: til.husnr, til_husnr_sub: til.husnr_sub, til_postnr: til.postnr
            });
            console.log(`[KM] POST manualtrip: ${body.toString().substring(0,120)}`);
            const xhr = await xhrRequest('manualtrip', { method: 'POST', contentType: 'application/x-www-form-urlencoded', body: body.toString(), timeout: 10000 });
            const html = xhr.responseText;
            console.log(`[KM] manualtrip respons: ${html.length} tegn, inneholder "distanse": ${html.includes('distanse')}`);
            const kmMatch = html.match(/Forventet distanse:<\/td><td[^>]*>([\d.]+)\s*km/i);
            const tidMatch = html.match(/Forventet kj[^:]+tid:<\/td><td[^>]*>(\d+)\s*min/i);
            if (kmMatch) {
                console.log(`[KM] → ${kmMatch[1]} km, ${tidMatch ? tidMatch[1] + ' min' : 'ingen tid'}`);
                return { km: parseFloat(kmMatch[1]), tid: tidMatch ? parseInt(tidMatch[1]) : null };
            }
            console.warn(`[KM] Ingen km-match i respons. Første 300 tegn:`, html.substring(0, 300));
            return null;
        } catch (e) {
            console.error('[KM] Feil i beregnKm:', e.message);
            return null;
        }
    }

    // Sykehus/spesialist-ord -- brukes for kommunegrense + behandlingssted-deteksjon
    const SPESIALIST_ORD = [
        'sykehus', 'hospital', 'diakonhjemmet', 'rikshospitalet',
        'radiumhospitalet', 'avtalespesialist', 'dps', 'ous', 'ahus',
        'sunnaas', 'lovisenberg', 'lufthavn', 'gardermoen', 'hospice',
        'rehabilitering', 'sengepost', 'kad', 'poliklinikk', 'klinikk',
        'sab', 'unilabs',
        'logoped', 'hudlege', 'nevrolog', 'psykomotorisk', 'ønh',
        'signo conrad svendsen', 'odontologisk', 'godthaab',
        'øyelegesenter', 'radiologisk',
        'røntgen', 'sse', 'kardiolog', 'klosteret', 'diploma'
    ];

    // Postnumre som typisk er sykehus -- gul "kanskje"-tab i kommunegrense
    const SYKEHUS_POSTNR = ['0450', '1474', '0379', '0372'];

    // Kombinasjon: ord + postnr må begge matche
    const SPESIALIST_KOMBI = [
        { ord: 'øyesenteret', postnr: '0164' },
        { ord: 'post', postnr: '1453' }
    ];

    // Rute-kombo: hvis fra inneholder A og til inneholder B (eller omvendt) → OK
    const RUTE_KOMBI = [
        { a: 'legevakt', b: 'sykehus' }
    ];

    // Møteplasser -- turer til/fra møteplass er godkjent, skipper kommunegrense
    const MØTEPLASS_ORD = [
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
    let _godkjentParsed = [];
    try {
        const raw = localStorage.getItem('overvaker_avvik_godkjent');
        console.log('[GODKJENT] Raw fra localStorage:', raw);
        if (raw) {
            let p = JSON.parse(raw);
            // Håndter dobbelt-stringified data
            if (typeof p === 'string') { try { p = JSON.parse(p); } catch (e2) {} }
            if (Array.isArray(p)) {
                _godkjentParsed = p.filter(id => typeof id === 'string' && /^\d{5,}$/.test(id));
            }
        }
    } catch (e) { _godkjentParsed = []; }
    const godkjentIMinne = new Set(_godkjentParsed);
    const lagreGodkjent = () => {
        const arr = [...godkjentIMinne];
        const json = JSON.stringify(arr);
        localStorage.setItem('overvaker_avvik_godkjent', json);
        console.log(`[GODKJENT] Lagret ${arr.length} stk:`, arr);
    };
    // Rens korrupt data ved oppstart
    lagreGodkjent();
    console.log(`[*] Godkjent fra localStorage: ${godkjentIMinne.size} stk`, [...godkjentIMinne]);

    // Skriv merknad på reise i NISSY (synlig for alle brukere)
    // Leser eksisterende kommentar først, appender ny tekst med ' | ' separator
    async function settMerknad(resId, tekst) {
        if (!resId) return;
        try {
            // 1. Les eksisterende kommentar
            const showUrl = `ajax-dispatch?action=showreq&rid=${resId}`;
            const showXhr = await xhrRequest(showUrl, { timeout: 10000 });
            let eksisterende = '';
            const m = showXhr.responseText.match(/<textarea[^>]*name="comment"[^>]*>([\s\S]*?)<\/textarea>/i);
            if (m) eksisterende = m[1].trim();

            // 2. Sjekk duplikat
            if (eksisterende.includes(tekst)) {
                console.log(`[MERKNAD] "${tekst}" finnes allerede på resId=${resId}`);
                return;
            }

            // 3. Bygg ny kommentar (append)
            const nyKommentar = eksisterende ? eksisterende + ' | ' + tekst : tekst;

            // 4. Skriv
            const url = `ajax-dispatch?action=setResourceComment&rid=${resId}&comment=${encodeURIComponent(nyKommentar)}`;
            console.log(`[MERKNAD] Skriver "${nyKommentar}" på resId=${resId}`);
            const xhr = await xhrRequest(url, { timeout: 10000 });
            console.log(`[MERKNAD] OK: resId=${resId}, status=${xhr.status}`);
        } catch (e) {
            console.warn(`[MERKNAD] Feil på resId=${resId}:`, e.message);
        }
    }

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
    const godkjenteAdresserListe = godkjenteAdresserGH.map(a => `<li>${a}</li>`).join('');

    const STIL = `
        html, body { height: 100%; margin: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; padding: 16px; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
        .header { background: #002b5c; color: white; padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; position: relative; }
        .stats-bar { background: white; border-radius: 8px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0; font-size: 13px; color: #64748b; }
        .stats-bar .count { font-weight: bold; color: #1e293b; font-size: 18px; margin-right: 4px; }
        .stats-bar .count.red { color: #ef4444; }
        .stats-bar .count.green { color: #10b981; }
        #container { flex: 1; overflow-y: auto; min-height: 0; padding-bottom: 16px; }

        .card { background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 12px; border-left: 6px solid #d32f2f; max-width: 900px; }
        .card.dublett { border-left-color: #f59e0b; }
        .card.kommunegrense { border-left-color: #d32f2f; }
        .card.kommunegrense-kanskje { border-left-color: #f59e0b; }
        .card.adresse-kanskje { border-left-color: #f59e0b; }
        .card.barn-alene { border-left-color: #8b5cf6; }
        .card.pnr { border-left-color: #f59e0b; }
        .card-header { padding: 10px 15px; background: #fff1f2; border-bottom: 1px solid #fee2e2; font-weight: bold; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .card.dublett .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.kommunegrense .card-header { background: #fff1f2; border-bottom-color: #fee2e2; }
        .card.kommunegrense-kanskje .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.adresse-kanskje .card-header { background: #fef3c7; border-bottom-color: #fde68a; }
        .card.barn-alene .card-header { background: #ede9fe; border-bottom-color: #ddd6fe; }
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
        .status-text { font-size: 14px; font-weight: normal; color: rgba(255,255,255,0.8); }

        .info-btn { background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; }
        .info-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 9999; }
        .info-modal.show { display: flex; }
        .gk-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 10000; }
        .gk-modal.show { display: flex; }
        .gk-modal-inner { background: white; border-radius: 10px; padding: 24px; width: 420px; max-width: 95vw; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .gk-modal-inner h3 { margin: 0 0 8px 0; color: #002b5c; font-size: 16px; }
        .gk-modal-inner .gk-adr { font-size: 12px; color: #64748b; margin-bottom: 16px; padding: 6px 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; word-break: break-all; }
        .gk-valg { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .gk-valg button { padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; text-align: left; }
        .gk-btn-session { background: #f1f5f9; color: #334155; }
        .gk-btn-session:hover { background: #e2e8f0; }
        .gk-btn-adresse { background: #dcfce7; color: #166534; }
        .gk-btn-adresse:hover { background: #bbf7d0; }
        .gk-btn-ord { background: #eff6ff; color: #1e40af; }
        .gk-btn-ord:hover { background: #dbeafe; }
        .gk-ord-rad { display: flex; gap: 8px; }
        .gk-ord-rad input { flex: 1; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
        .gk-status { font-size: 12px; margin-top: 8px; min-height: 18px; color: #16a34a; }
        .adr-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 9999; }
        .adr-modal.show { display: flex; }
        .adr-modal-inner { background: white; border-radius: 10px; padding: 24px; width: 480px; max-width: 95vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .adr-modal-inner h3 { margin: 0 0 16px 0; color: #002b5c; font-size: 16px; }
        .adr-liste { list-style: none; padding: 0; margin: 0 0 16px 0; }
        .adr-liste li { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
        .adr-liste li .adr-slett { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 16px; padding: 0 4px; }
        .adr-input-rad { display: flex; gap: 8px; }
        .adr-input-rad input { flex: 1; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
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

                    alleReqIds.forEach((reqId, n) => {
                        const rekNrMatch = tr.outerHTML.match(new RegExp(`showReq\\(this,\\s*${reqId}[^>]*searchStatus\\?nr=(\\d+)`))
                            || tr.outerHTML.match(/searchStatus\?nr=(\d+)/);
                        const rekNr = rekNrMatch ? rekNrMatch[1] : null;

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
    function sjekkBarn(rader) {
        const funn = [];
        for (const r of rader) {
            if (godkjentIMinne.has(r.turid)) continue;
            if (!r.pnr || r.pnr.length !== 11) continue;
            const alder = beregnAlder(r.pnr);
            if (alder === null || alder >= CONFIG.BARN_ALDER_GRENSE) continue;
            const led = r.ledsager !== '' ? parseInt(r.ledsager) : null;
            if (led !== 0) continue;
            funn.push({ ...r, type: 'barn', alder, antallLedsagere: 0 });
        }
        return funn;
    }

    // ==================================================================
    //    SJEKK: MANGLER PERSONNUMMER                                   
    // ==================================================================
    function sjekkPnr(rader) {
        const funn = [];
        for (const r of rader) {
            if (godkjentIMinne.has(r.turid)) continue;
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
            if (godkjentIMinne.has(r.turid)) continue;
            if (!r.pnr || r.pnr.length !== 11) continue;
            if (KANSELLERT.some(s => r.status.toLowerCase().includes(s))) continue;
            if (r.rmate && ['RFLY', 'HLSX'].includes(r.rmate.toUpperCase())) continue;
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
        const kandidater = [];
        console.log(`[ADR] Start adressesjekk: ${rader.length} rader, brukOrd=${window.mqBrukGodkjenteOrd}, brukAdr=${window.mqBrukGodkjenteAdresser}, godkjent=${godkjentIMinne.size} stk:`, [...godkjentIMinne]);

        let hoppetVentende = 0;
        for (const r of rader) {
            if (!r.harFullInfo) { hoppetVentende++; continue; }
            if (r.rmate && ['RFLY', 'HLSX'].includes(r.rmate.toUpperCase())) continue;
            if (godkjentIMinne.has(r.turid)) { hoppetGodkjent++; console.log(`[ADR] HOPPET godkjent turid=${r.turid}`); continue; }

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

            // Godkjente ord/adresser — sjekk begge adresser (fra og til)
            let erGodkjent = false;
            const fraLower = r.fra.toLowerCase(), tilLower = r.til.toLowerCase();
            if (window.mqBrukGodkjenteOrd && (godkjenteOrdGH.some(o => fraLower.includes(o)) || godkjenteOrdGH.some(o => tilLower.includes(o)))) erGodkjent = true;
            if (window.mqBrukGodkjenteAdresser && (godkjenteAdresserGH.some(a => fraLower.includes(a)) || godkjenteAdresserGH.some(a => tilLower.includes(a)))) erGodkjent = true;
            if (erGodkjent) { hoppetGodkjentOrd++; continue; }

            // Kanskje-postnummer: sjekk begge adresser (fra og til)
            const kanskjePostnr = ADRESSE_KANSKJE_POSTNR.some(pnr => r.fra.includes(pnr) || r.til.includes(pnr));

            console.log(`[ADR] Kandidat RID=${r.reqId}: folk="${folkGate}" fra="${fraGate}" til="${tilGate}" retning=${erTur === true ? 'TUR' : erTur === false ? 'RETUR' : '?'} kanskje=${kanskjePostnr}`);
            kandidater.push({ ...r, type: 'adresse', erTur, folkGate, kanskjePostnr });
        }

        console.log(`[ADR] Filtrering: ${rader.length} rader -> ${kandidater.length} kandidater (hoppet: ventende=${hoppetVentende}, godkj=${hoppetGodkjent}, kortPadr=${hoppetKortPadr}, gateMatch=${hoppetGateMatch}, godkjOrd=${hoppetGodkjentOrd})`);

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
                } else {
                    k.erTur = erTur;
                    bekreftedeKandidater.push(k);
                }
            }
            console.log(`[ADR] Stage 2: ${adminKandidater.length} admin-kandidater → ${bekreftedeKandidater.length} bekreftet (${fjernetAvAdmin} fjernet av admin), ${kanskjeKandidater.length} kanskje (hoppet admin)`);
        } else if (adminKandidater.length > 0) {
            console.log(`[ADR] Stage 2: Hoppet over (admin ${adminTilgjengelig ? 'tilgjengelig' : 'utilgjengelig'}), ${kanskjeKandidater.length} kanskje`);
        }

        // ── Stage 3: Km-beregning eller manuell visning ─────────────────
        const funn = [];
        if (window.mqAutoKm && adminTilgjengelig) {
            for (let i = 0; i < bekreftedeKandidater.length; i++) {
                const k = bekreftedeKandidater[i];
                if (statusFn) statusFn(`Beregner km ${i + 1} av ${bekreftedeKandidater.length}...`);

                // Gjenbruk admin-data fra Stage 2 (ingen dobbel-henting)
                const admin = k.adminData || await hentAdminData(k.reqId, k.resId);
                const folkAdr = admin && admin.folk ? admin.folk : formaterForVisning(k.padrHtml);
                const fraAdr = admin && admin.fra ? admin.fra : formaterForVisning(k.fraHtml);
                const tilAdr = admin && admin.til ? admin.til : formaterForVisning(k.tilHtml);
                const erTur = admin && admin.erTur !== null ? admin.erTur : k.erTur;
                const behandlingsAdr = erTur ? tilAdr : (erTur === false ? fraAdr : tilAdr);

                const folkKm = await beregnKm(folkAdr, behandlingsAdr);
                const bestiltFraAdr = erTur ? fraAdr : tilAdr;
                const bestiltKm = await beregnKm(bestiltFraAdr, behandlingsAdr);

                console.log(`[ADR] Auto-km ${i+1}/${bekreftedeKandidater.length} RID=${k.reqId}: folkKm=${folkKm?.km ?? 'null'}, bestiltKm=${bestiltKm?.km ?? 'null'}`);

                if (folkKm && bestiltKm && bestiltKm.km <= folkKm.km) continue; // OK

                k.erTur = erTur;
                k.kmInfo = { folkKm: folkKm?.km || null, bestiltKm: bestiltKm?.km || null };
                k.folkAdrTekst = folkAdr;
                k.fraAdrTekst = fraAdr;
                k.tilAdrTekst = tilAdr;
                funn.push(k);
            }
        } else {
            // Manuell modus: vis alle bekreftede kandidater
            for (const k of bekreftedeKandidater) funn.push(k);
        }
        // Legg til kanskje-kandidater i funn (markert med kanskjePostnr=true)
        for (const k of kanskjeKandidater) funn.push(k);

        console.log(`[ADR] Ferdig: ${funn.length} funn (${funn.filter(f=>!f.kanskjePostnr).length} avvik + ${kanskjeKandidater.length} kanskje) av ${kandidater.length} kandidater`);
        return funn;
    }

    // ==================================================================
    //    SJEKK: KOMMUNEGRENSE                                          
    // ==================================================================
    async function sjekkKommune(rader, statusFn) {
        const funn = [];
        const kandidater = rader.filter(r => r.harFullInfo && !godkjentIMinne.has(r.turid));

        for (let i = 0; i < kandidater.length; i++) {
            const r = kandidater[i];
            if (statusFn) statusFn(`Sjekker kommune ${i + 1} av ${kandidater.length}...`);

            // Pasient-kommune fra Padr eller fra-adresse
            const folkPostnr = hentPostnr(r.padr) || hentPostnr(r.fra);
            const pasientKommune = hentKommune(folkPostnr);
            if (!pasientKommune) continue;

            // Retning: Start < Oppmtid = TUR, ellers RETUR
            const startMin = parseTidMinutter(r.start);
            const oppmMin = parseTidMinutter(r.oppmtid);
            const erTur = (startMin !== null && oppmMin !== null) ? startMin < oppmMin : null;

            // Destinasjons-adresse: Til for tur, Fra for retur
            const destTekst = erTur ? r.til : (erTur === false ? r.fra : r.til);
            const destHtml = erTur ? r.tilHtml : (erTur === false ? r.fraHtml : r.tilHtml);
            const destPostnr = hentPostnr(destTekst) || hentPostnr(formaterForVisning(destHtml));
            const destKommune = hentKommune(destPostnr);
            if (!destKommune) continue;

            // Samme kommune -- OK
            if (pasientKommune === destKommune) continue;

            // Møteplass -- turer til/fra møteplass er manuelt godkjent, skip helt
            const destLower = destTekst.toLowerCase();
            const fraLower = r.fra.toLowerCase();
            if (MØTEPLASS_ORD.some(ord => destLower.includes(ord) || fraLower.includes(ord))) continue;

            // Godkjente kommune-ord fra JSON — skip helt
            const tilLowerK = r.til.toLowerCase();
            if (window.mqBrukGodkjenteOrd && godkjenteKommuneOrdGH.some(o => fraLower.includes(o) || tilLowerK.includes(o))) continue;

            // Rute-kombo: fra inneholder A og til inneholder B (eller omvendt) → kanskje
            const tilLower = r.til.toLowerCase();
            const treffRute = RUTE_KOMBI.find(k =>
                (fraLower.includes(k.a) && tilLower.includes(k.b)) ||
                (fraLower.includes(k.b) && tilLower.includes(k.a))
            );

            // Kanskje sykehus: SPESIALIST_ORD, SYKEHUS_POSTNR, SPESIALIST_KOMBI eller RUTE_KOMBI
            const rekLower = r.rekvirent.toLowerCase();
            const treffOrd = SPESIALIST_ORD.find(ord => destLower.includes(ord) || rekLower.includes(ord));
            const erSykehusPostnr = destPostnr && SYKEHUS_POSTNR.includes(destPostnr);
            const treffKombi = SPESIALIST_KOMBI.find(k => destLower.includes(k.ord) && destPostnr === k.postnr);
            const erKanskjeSykehus = !!treffOrd || erSykehusPostnr || !!treffKombi || !!treffRute;

            // Bygg grunn-tekst for kanskje
            const kanskjeGrunn = [];
            if (treffOrd) kanskjeGrunn.push('ord: ' + treffOrd);
            if (erSykehusPostnr) kanskjeGrunn.push('postnr: ' + destPostnr);
            if (treffKombi) kanskjeGrunn.push('kombi: ' + treffKombi.ord + ' + ' + treffKombi.postnr);
            if (treffRute) kanskjeGrunn.push('rute: ' + treffRute.a + ' ↔ ' + treffRute.b);

            funn.push({
                ...r, type: 'kommune',
                pasientKommune,
                behandlingsstedKommune: destKommune,
                destNavn: destTekst,
                destPostnr: destPostnr || '',
                kanskjeSykehus: erKanskjeSykehus,
                kanskjeGrunn: kanskjeGrunn.join(' + '),
            });
        }

        // ── Hent admin-data for avvik (ikke kanskje) ──────────────
        // Beriker kort med behandlingssted-adresse, rek.nr. osv.
        const avvik = funn.filter(f => !f.kanskjeSykehus);

        if (adminTilgjengelig && avvik.length > 0) {
            for (let i = 0; i < avvik.length; i++) {
                const f = avvik[i];
                if (statusFn) statusFn(`Henter admin ${i + 1} av ${avvik.length}...`);

                const admin = await hentAdminData(f.reqId, f.resId);
                if (!admin) continue;

                f.adminData = admin;
                console.log(`[KOMMUNE] Admin: RID=${f.reqId} rek=${admin.rekNr || '?'} fra="${(admin.fra || '').substring(0,40)}" til="${(admin.til || '').substring(0,40)}"`);
            }
            console.log(`[KOMMUNE] Admin-data hentet for ${avvik.length} avvik`);

            // Runde 2: Sjekk admin-adresse mot godkjente kommuneadresser
            for (const f of avvik) {
                if (!f.adminData) continue;
                const fraLow = (f.adminData.fra || '').toLowerCase();
                const tilLow = (f.adminData.til || '').toLowerCase();
                const treff = godkjenteKommuneAdresserGH.find(g =>
                    (fraLow.includes(g.adresse) && fraLow.includes(g.postnr)) ||
                    (tilLow.includes(g.adresse) && tilLow.includes(g.postnr))
                );
                if (treff) {
                    f.kanskjeSykehus = true;
                    f.kanskjeGrunn = 'admin-adresse: ' + treff.adresse + ', ' + treff.postnr;
                    console.log(`[KOMMUNE] Runde 2 kanskje: RID=${f.reqId} treff=${treff.adresse} + ${treff.postnr}`);
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
            adresse: ['Padr', 'Oppmtid'], kommune: ['Padr', 'Oppmtid'],
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
                funn = sjekkBarn(rader);
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

        // Stats
        if (statsBar) {
            const typeNavn = { barn: 'Barn', pnr: 'PNR', dublett: 'Dublett', adresse: 'Adresse', kommune: 'Kommune' };
            let statsHtml = `
                <span>Sjekk: <strong>${typeNavn[type] || type}</strong></span>
                <span>Totale reiser: <span class="count">${totalt}</span></span>
                <span>Funn: <span class="count ${funn.length > 0 ? 'red' : 'green'}">${funn.length}</span></span>
            `;
            if (type === 'kommune') {
                const antKanskje = funn.filter(f => f.kanskjeSykehus).length;
                const antVanlige = funn.length - antKanskje;
                if (antKanskje > 0) {
                    statsHtml += `<span>| &#9888;&#65039; Avvik: ${antVanlige} <span style="color:#94a3b8;">+</span> &#127973; Postnr/ord: ${antKanskje}</span>`;
                }
            }
            if (type === 'adresse') {
                const antKanskje = funn.filter(f => f.kanskjePostnr).length;
                const antVanlige = funn.length - antKanskje;
                if (antKanskje > 0) {
                    statsHtml += `<span>| &#9888;&#65039; Avvik: ${antVanlige} <span style="color:#94a3b8;">+</span> &#127973; Postnr: ${antKanskje}</span>`;
                }
            }
            statsBar.innerHTML = statsHtml;
            statsBar.style.display = '';
        }

        let html = '<div class="oppdater-bar">';
        html += '<button class="tilbake-btn" style="margin-bottom:0;" onclick="window._avvikCh.postMessage({type:\'TILBAKE\'})">&larr; Tilbake</button>';
        html += '<button class="btn-oppdater" onclick="window._avvikCh.postMessage({type:\'OPPDATER\'})">&#8635; Oppdater</button>';
        html += '<label class="autorefresh-label"><input type="checkbox" id="autoRefreshCheck" onchange="window._avvikCh.postMessage({type:\'TOGGLE_AUTOREFRESH\', checked:this.checked})">Auto-oppdater</label>';
        html += '<span id="autoRefreshCountdown" class="autorefresh-countdown"></span>';
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
            // Split i vanlige funn og kanskje-sykehus
            const vanlige = funn.filter(f => !f.kanskjeSykehus);
            const kanskje = funn.filter(f => f.kanskjeSykehus);

            // Kolonne 1: Avvik (røde)
            let avvikHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef2f2; border:1px solid #ef4444; border-radius:8px; font-weight:600; font-size:14px; color:#991b1b; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#9888;&#65039;</span> Avvik: ${vanlige.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #ef4444; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 1 — Tabell (dispatch):</strong><br>
                        Postnr fra pasientadresse og destinasjon sammenlignes. Ulik kommune = flagget.<br>
                        M\u00f8teplasser og kjente ruter filtreres helt bort.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Full adresse hentes fra admin. Sjekkes mot godkjente behandlingssted-adresser.<br>
                        Treff = flyttet til kanskje-kolonnen.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Pasient reiser til annen kommune, uten kjent behandlingssted.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">M\u00f8teplasser (filtrert helt bort i runde 1):</strong><br>${MØTEPLASS_ORD.join(', ')}</div>
                    <div><strong style="color:#991b1b;">Godkjente adresser (runde 2, admin):</strong><br>${godkjenteKommuneAdresserGH.map(g => g.adresse + ', ' + g.postnr).join(', ')}</div>
                </div>
            </div>`;
            for (const f of vanlige) {
                avvikHtml += renderKort(f);
            }

            // Kolonne 2: Postnummer og spesialord (gule) med hover-info
            let kanskjeHtml = `<div style="padding:8px 12px; margin-bottom:12px; background:#fef3c7; border:1px solid #f59e0b; border-radius:8px; font-weight:600; font-size:14px; color:#92400e; position:relative;">
                <span style="cursor:help;" onmouseenter="this.parentElement.querySelector('.filter-info').style.display=''" onmouseleave="this.parentElement.querySelector('.filter-info').style.display='none'">&#127973;</span> Postnummer og spesialord: ${kanskje.length}
                <div class="filter-info" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:10; margin-top:4px; padding:12px; background:white; border:1px solid #f59e0b; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-weight:normal; font-size:13px; color:#334155; max-height:400px; overflow-y:auto;">
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Disse reisene krysser kommunegrense, men har treff p\u00e5 spesialist-indikatorer. Sortert hit for manuell vurdering.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#92400e;">Spesialord</strong> — ord i adresse/rekvirent som tyder p\u00e5 spesialist:<br>${SPESIALIST_ORD.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#92400e;">Postnummer</strong> — postnr tilh\u00f8rende sykehus:<br>${SYKEHUS_POSTNR.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#92400e;">Kombinasjon</strong> — ord + postnr som sammen bekrefter spesialist:<br>${SPESIALIST_KOMBI.map(k => k.ord + ' @ ' + k.postnr).join(', ')}</div>
                    <div><strong style="color:#92400e;">Rute-kombo</strong> — kjente ruter mellom to steder:<br>${RUTE_KOMBI.map(k => k.a + ' \u2194 ' + k.b).join(', ')}</div>
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

            html += '<div class="kommune-kolonner">';
            html += '<div class="kommune-kol kommune-kol-avvik">' + avvikHtml + '</div>';
            html += '<div class="kommune-kol kommune-kol-kanskje">' + kanskjeHtml + '</div>';
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
                        Reiser filtreres bort hvis fra- eller til-adresse inneholder godkjente ord.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Folkeregistrert adresse sammenlignes med fra/til. Hvis gaten matcher = falsk positiv, fjernet.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 3 — Km-beregning:</strong><br>
                        Avstand fra folkereg til behandlingssted vs. bestilt reise. Hvis bestilt &lt;= folkereg = OK.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Reiser der bestilt adresse avviker fra folkeregistrert adresse.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente ord (eliminert i runde 1):</strong><br>${godkjenteOrdGH.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente adresser (eliminert i runde 1):</strong><br>${godkjenteAdresserGH.join(', ')}</div>
                    <div><strong style="color:#991b1b;">Kanskje-postnr (kolonne 2):</strong><br>${ADRESSE_KANSKJE_POSTNR.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ')}</div>
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
                    <div><strong style="color:#92400e;">Postnummer:</strong><br>${ADRESSE_KANSKJE_POSTNR.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ')}</div>
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
                        Reiser filtreres bort hvis fra- eller til-adresse inneholder godkjente ord.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 2 — Admin (administrasjonsmodulen):</strong><br>
                        Folkeregistrert adresse sammenlignes med fra/til. Hvis gaten matcher = falsk positiv, fjernet.
                    </div>
                    <div style="margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #fecaca;">
                        <strong style="color:#991b1b;">Runde 3 — Km-beregning:</strong><br>
                        Avstand fra folkereg til behandlingssted vs. bestilt reise. Hvis bestilt &lt;= folkereg = OK.
                    </div>
                    <div style="margin-bottom:10px; font-style:italic; color:#64748b;">Sluttresultat: Reiser der bestilt adresse avviker fra folkeregistrert adresse.</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente ord (eliminert i runde 1):</strong><br>${godkjenteOrdGH.join(', ')}</div>
                    <div style="margin-bottom:8px;"><strong style="color:#991b1b;">Godkjente adresser (eliminert i runde 1):</strong><br>${godkjenteAdresserGH.join(', ')}</div>
                    <div><strong style="color:#991b1b;">Kanskje-postnr (kolonne 2):</strong><br>${ADRESSE_KANSKJE_POSTNR.map(p => p + (hentKommune(p) ? ' (' + hentKommune(p) + ')' : '')).join(', ')}</div>
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
            return `<div class="card barn-alene" data-rid="${f.reqId}">
                <div class="card-header">
                    <span>&#128118; BARN REISER ALENE -- ${f.pnavn || 'Ukjent'}, ${f.alder} år, 0 ledsagere</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${bRekNr ? 'Rek: ' + bRekNr + ' ' + bCopyBtn(bRekNr, 'rek.nr.') : ''}
                    </span>
                </div>
                <div class="card-body"><div class="row">
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
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'GODKJENN', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}'})">GODKJENN</button>
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', rekNr:'${esc(bRekNr)}', rekvirent:''})">AVVIK</button>
                </div>
            </div>`;
        }

        if (f.type === 'pnr') {
            return `<div class="card pnr" data-rid="${f.reqId}">
                <div class="card-header">
                    <span>&#9888; MANGLER GYLDIG PERSONNUMMER</span>
                    <span style="color:#94a3b8; font-weight:normal;">Turid: ${f.resId || f.reqId}</span>
                </div>
                <div class="card-body"><div class="row">
                    <div class="col">
                        <span class="label">PNR i dispatch</span><span class="value">${f.pnr || '(tomt)'}</span>
                        <span class="label">Fra</span><span class="value">${f.start || ''}<br>${fraVis}</span>
                    </div>
                    <div class="col">
                        <span class="label">Til</span><span class="value">${tilVis}</span>
                        <span class="label">Rekvirent</span><span class="value">${f.rekvirent || '---'}</span>
                    </div>
                </div></div>
                <div class="card-actions">
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'GODKJENN', id:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}'})">GODKJENN</button>
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

            return `<div class="card dublett" data-rid="${a.reqId}">
                <div class="card-header">
                    <span>&#9888; DOBBELTBESTILLING (${retning})</span>
                    <span style="color:#94a3b8; font-weight:normal;">${pasNavn ? pasNavn + ' &mdash; ' : ''}PNR: ${a.pnr ? '<span class="pnr-sok-link" data-pnr="' + a.pnr + '" style="cursor:pointer; text-decoration:underline; color:#64748b;" title="Søk opp alle turer i NISSY" onclick="window._avvikCh.postMessage({type:\'SOK_PNR\', pnr:\'' + a.pnr + '\'})">' + a.pnr + '</span>' : '(mangler)'}</span>
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
                    <button class="btn-avvik" onclick="window._avvikCh.postMessage({type:'AVVIK', id:'${a.reqId}', resId:'${a.resId || ''}', turid:'${a.turid || ''}', rekNr:'${esc(a.rekNr || '')}', rekvirent:'${esc(a.rekvirent)}'})">AVVIK</button>
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

            // Km-resultat (vises bare hvis auto-km har kjørt)
            let kmHtml = '';
            if (f.kmInfo && f.kmInfo.folkKm !== null && f.kmInfo.bestiltKm !== null) {
                kmHtml = `<div class="warning-text" style="background:#fef2f2; border-color:#ef4444; color:#991b1b;">
                    Bestilt: ${f.kmInfo.bestiltKm.toFixed(1)} km -- Folkereg: ${f.kmInfo.folkKm.toFixed(1)} km
                </div>`;
            } else if (f.kmInfo) {
                const bKm = f.kmInfo.bestiltKm !== null ? f.kmInfo.bestiltKm.toFixed(1) + ' km' : '?';
                const fKm = f.kmInfo.folkKm !== null ? f.kmInfo.folkKm.toFixed(1) + ' km' : '?';
                kmHtml = `<div class="warning-text">Bestilt: ${bKm} -- Folkereg: ${fKm}</div>`;
            }

            // Maps-lenke: bare som fallback når km-beregning feilet (har kmInfo men mangler verdier)
            const folkTekst = f.folkAdrTekst || (harAdmin && f.adminData.folk ? f.adminData.folk : formaterForVisning(f.padrHtml));
            const behandlingsAdr = f.erTur ? (f.tilAdrTekst || (harAdmin && f.adminData.til ? f.adminData.til : formaterForVisning(f.tilHtml))) : (f.fraAdrTekst || (harAdmin && f.adminData.fra ? f.adminData.fra : formaterForVisning(f.fraHtml)));
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(folkTekst)}&destination=${encodeURIComponent(behandlingsAdr)}`;
            const kmFeilet = f.kmInfo && (f.kmInfo.folkKm === null || f.kmInfo.bestiltKm === null);
            const mapsHtml = kmFeilet ? ` <a href="${mapsUrl}" target="_blank" style="text-decoration:none;" title="Km-beregning feilet — sjekk i Google Maps">&#128205;</a>` : '';

            const rekNr = harAdmin && f.adminData.rekNr ? f.adminData.rekNr : '';
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

            return `<div class="card ${adrKlasse}" data-rid="${f.reqId}" data-resid="${f.resId || ''}">
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
                </div>
                <div class="card-actions">
                    ${!f.kmInfo ? `<button class="btn-nissy" id="btnKm-${f.reqId}" onclick="window._avvikCh.postMessage({type:'BEREGN_KM', reqId:'${f.reqId}', resId:'${f.resId || ''}'})">&#128207; Beregn km</button>` : ''}
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'VIS_GODKJENN_MODAL', reqId:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', kortType:'adresse', henteAdr:'${esc(henteAdr)}', leverAdr:'${esc(leverAdr)}', henteNavn:'${esc(henteNavn)}', leverNavn:'${esc(leverNavn)}', folkAdr:'${esc(folkVis.replace(/<br>/g, ", "))}' })">GODKJENN</button>
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

            // Kommune fra postnummer
            const kFolkKommune = hentKommune(hentPostnr((kFolkAdr || '').replace(/<br>/g, ' ')));
            const kHenteKommune = hentKommune(hentPostnr((kFraAdr || fraVis).replace(/<br>/g, ' ')));
            const kLeverKommune = hentKommune(hentPostnr((kTilAdr || tilVis).replace(/<br>/g, ' ')));
            const kKommuneSpan = (k) => k ? '<br><span style="font-size:11px; color:#6b7280;">Kommune: ' + k + '</span>' : '';

            return `<div class="card ${kKlasse}" data-rid="${f.reqId}">
                <div class="card-header">
                    <span>${kLabel}${kAdminTag}</span>
                    <span style="color:#94a3b8; font-weight:normal;">
                        ${kTurid ? 'Turid: ' + kTurid + ' ' + kCopyBtn(kTurid, 'turid') : ''}
                        ${kRekNr ? (kTurid ? '&nbsp;| ' : '') + 'Rek: ' + kRekNr + ' ' + kCopyBtn(kRekNr, 'rek.nr.') : '<span id="rekNr-' + f.reqId + '"></span>'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="warning-text" style="${kWarnBg}">
                        Pasient: ${f.pasientKommune} &rarr; Behandler: ${f.behandlingsstedKommune}
                    </div>
                    ${f.kanskjeGrunn ? '<div style="margin:2px 0 4px; padding:3px 8px; background:#fef9e7; border-radius:4px; font-size:11px; color:#92400e;">Treff: <strong>' + f.kanskjeGrunn + '</strong></div>' : ''}
                    ${kPasNavn || kPnr ? '<div style="margin-bottom:6px; font-size:12px; color:#475569;"><strong>' + (kPasNavn || '') + '</strong>' + (kPnr ? ' &mdash; PNR: ' + kPnr : '') + '</div>' : ''}
                    ${kFolkAdr ? '<div style="margin-bottom:8px;"><span class="label">Folkeregistrert adresse</span><div class="value">' + kFolkAdr + kKommuneSpan(kFolkKommune) + '</div></div>' : ''}
                    ${kHarAdmin ? '<div class="row" style="border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;"><div class="col"><span class="label">Hentested</span>' + (kFraNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + kFraNavn + '</div>' : '') + '<div class="value">' + (kFraAdr || fraVis) + kKommuneSpan(kHenteKommune) + '</div>' + (f.adminData.fraKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.fraKommentar + '</div>' : '') + '</div><div style="display:flex; align-items:center; justify-content:center; min-width:40px; max-width:40px; padding:0 4px;"><span style="font-size:20px;">&#10145;&#65039;</span></div><div class="col"><span class="label">Leveringssted</span>' + (kTilNavn ? '<div class="value" style="font-weight:600; margin-bottom:0;">' + kTilNavn + '</div>' : '') + '<div class="value">' + (kTilAdr || tilVis) + kKommuneSpan(kLeverKommune) + '</div>' + (f.adminData.tilKommentar ? '<div style="margin-top:4px; font-size:11px; font-style:italic; color:#6b7280;">Kommentar: ' + f.adminData.tilKommentar + '</div>' : '') + '</div></div>' : (!kKanskje ? '<div style="margin-bottom:8px; padding:6px 10px; background:#fef3c7; border:1px solid #f59e0b; border-radius:6px; font-size:11px; color:#92400e;">&#9888; Admin ikke tilgjengelig — viser kun data fra tabell. <a href="https://pastrans-sorost.mq.nhn.no/administrasjon/" target="_blank" style="color:#1d4ed8; text-decoration:underline;">Logg inn i admin</a> og skann p\u00e5 nytt for full info.</div>' : '') + '<div class="row"><div class="col"><span class="label">Fra</span><span class="value">' + (f.start || '') + '<br>' + fraVis + kKommuneSpan(kHenteKommune) + '</span><span class="label">Til</span><span class="value">' + tilVis + kKommuneSpan(kLeverKommune) + '</span></div><div class="col"><span class="label">Rekvirent</span><span class="value">' + (f.rekvirent || '---') + '</span><span class="label">Status</span><span class="value">' + (f.status || '---') + '</span></div></div>'}
                    ${kMeldTrans ? '<div style="margin-top:6px; padding:4px 8px; background:#eff6ff; border-radius:4px; font-size:11px; color:#1e40af;"><strong>Melding transport:</strong> ' + kMeldTrans + '</div>' : ''}
                    ${kMeldPasReise ? '<div style="margin-top:4px; padding:4px 8px; background:#f0fdf4; border-radius:4px; font-size:11px; color:#166534;"><strong>Melding pasientreise:</strong> ' + kMeldPasReise + '</div>' : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-nissy" onclick="window._avvikCh.postMessage({type:'VIS_NISSY', reqId:'${f.reqId}'})">Vis i NISSY</button>
                    <button class="btn-check" onclick="window._avvikCh.postMessage({type:'VIS_GODKJENN_MODAL', reqId:'${f.reqId}', resId:'${f.resId || ''}', turid:'${f.turid || ''}', kortType:'kommune', destNavn:'${esc(f.destNavn || '')}', pasientKommune:'${esc(f.pasientKommune || '')}', destKommune:'${esc(f.behandlingsstedKommune || '')}', henteAdr:'${esc(kFraAdr || fraVis)}', leverAdr:'${esc(kTilAdr || tilVis)}' })">GODKJENN</button>
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
        if (el) el.innerHTML = tekst ? `<span class="spinner"></span><span class="status-text">${tekst}</span>` : '';
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
                    <button class="info-btn" id="btnAdr" style="background:#10b981;">&#128205; Adresser</button>
                    <button class="info-btn" id="btnInfo">&#8505; Info</button>
                </div>
                <div id="filterPanel" class="filter-panel" style="display:none;">
                    <div style="display:flex; gap:24px;">
                        <div style="flex:1;">
                            <div class="filter-section-title" style="color:#002b5c;">Dagens</div>
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
                            <div class="filter-section-title" style="color:#002b5c;">Morgen / Neste dag</div>
                            ${FILTER_GRUPPER.morgen.map(id => {
                                const fv = RFILTER_VALG.find(f => f.id === id);
                                if (!fv) return '';
                                return `<div class="filter-checkbox" style="border:1px solid #475569;">
                                    <input type="checkbox" class="rfilter-cb" data-fid="${fv.id}" ${aktiveFiltre.has(fv.id) ? 'checked' : ''}>
                                    <label style="cursor:pointer;" onclick="this.previousElementSibling.click()">${fv.navn} <span class="rfilter-count" data-fid="${fv.id}" style="color:#94a3b8; font-size:11px;"></span></label>
                                </div>`;
                            }).join('')}
                        </div>
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
            <div id="gkModal" class="gk-modal">
                <div class="gk-modal-inner">
                    <h3>&#9989; Hva vil du godkjenne?</h3>
                    <div id="gkInfoBoks" style="font-size:12px; color:#334155; margin-bottom:16px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px;"></div>
                    <div class="gk-valg">
                        <button class="gk-btn-session" id="gkBtnSession">&#128336; Kun denne runden (ikke lagret)</button>
                        <div>
                            <button class="gk-btn-adresse" id="gkBtnAdresse">&#128205; Lagre adresse permanent</button>
                            <div class="gk-ord-rad" id="gkAdrRad" style="display:none; margin-top:8px;">
                                <input type="text" id="gkAdrInput" placeholder="f.eks. morteveien 19" />
                                <button class="btn-nissy" id="gkAdrLagreBtn" style="background:#10b981;">Lagre</button>
                            </div>
                        </div>
                        <div>
                            <button class="gk-btn-ord" id="gkBtnOrd">&#128269; Lagre søkeord permanent</button>
                            <div class="gk-ord-rad" id="gkOrdRad" style="display:none; margin-top:8px;">
                                <input type="text" id="gkOrdInput" placeholder="f.eks. øyelege" />
                                <button class="btn-nissy" id="gkOrdLagreBtn">Lagre</button>
                            </div>
                        </div>
                    </div>
                    <div class="gk-status" id="gkStatus"></div>
                    <button class="close-btn" id="gkModalLukk" style="margin-top:8px;">Avbryt</button>
                </div>
            </div>
            <div id="adrModal" class="adr-modal">
                <div class="adr-modal-inner">
                    <h3>&#128205; Godkjente adresser og s\u00f8keord</h3>
                    <p style="font-size:12px; color:#64748b; margin:0 0 12px 0;">Lagres sentralt \u2014 gjelder alle PCer. Adresser filtreres i adresse-skanningen, s\u00f8keord filtreres i b\u00e5de adresse- og kommune-skanningen.</p>
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
                document.querySelectorAll('#filterPanel .rfilter-cb').forEach(function(cb) {
                    cb.addEventListener('change', function() {
                        var aktive = [];
                        document.querySelectorAll('#filterPanel .rfilter-cb:checked').forEach(function(c) { aktive.push(+c.dataset.fid); });
                        _ch.postMessage({ type: 'BYTT_FILTRE', filtre: aktive });
                    });
                });

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
                document.getElementById('btnAdr').addEventListener('click', function() {
                    window._avvikCh.postMessage({ type: 'VIS_ADR_MODAL' });
                });
                // GODKJENN-modal
                var gkModal = document.getElementById('gkModal');
                var gkPendingData = null;
                document.getElementById('gkModalLukk').addEventListener('click', function() { gkModal.classList.remove('show'); });
                gkModal.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('show'); });
                document.getElementById('gkBtnSession').addEventListener('click', function() {
                    if (gkPendingData) window._avvikCh.postMessage({type:'GODKJENN', id:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid});
                    gkModal.classList.remove('show');
                });
                document.getElementById('gkBtnAdresse').addEventListener('click', function() {
                    if (!gkPendingData) return;
                    var rad = document.getElementById('gkAdrRad');
                    rad.style.display = rad.style.display === 'none' ? 'flex' : 'none';
                    if (rad.style.display === 'flex') {
                        document.getElementById('gkAdrInput').value = '';
                        document.getElementById('gkAdrInput').focus();
                    }
                });
                document.getElementById('gkAdrLagreBtn').addEventListener('click', function() {
                    var adr = document.getElementById('gkAdrInput').value.trim();
                    if (!adr) { document.getElementById('gkStatus').textContent = 'Skriv inn en adresse'; return; }
                    document.getElementById('gkStatus').textContent = 'Lagrer "' + adr + '"...';
                    window._avvikCh.postMessage({type:'GODKJENN_LAGRE_ADR', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, kortType:gkPendingData.kortType, adresse:adr});
                });
                document.getElementById('gkBtnOrd').addEventListener('click', function() {
                    var rad = document.getElementById('gkOrdRad');
                    rad.style.display = rad.style.display === 'none' ? 'flex' : 'none';
                    if (rad.style.display === 'flex') {
                        document.getElementById('gkOrdInput').value = '';
                        document.getElementById('gkOrdInput').focus();
                    }
                });
                document.getElementById('gkOrdLagreBtn').addEventListener('click', function() {
                    var ord = document.getElementById('gkOrdInput').value.trim();
                    if (!ord || !gkPendingData) return;
                    document.getElementById('gkStatus').textContent = 'Lagrer...';
                    window._avvikCh.postMessage({type:'GODKJENN_LAGRE_ORD', reqId:gkPendingData.reqId, resId:gkPendingData.resId, turid:gkPendingData.turid, kortType:gkPendingData.kortType, ord:ord});
                });
                window._gkSetPending = function(data) {
                    gkPendingData = data;
                    var info = document.getElementById('gkInfoBoks');
                    if (data.kortType === 'adresse') {
                        info.innerHTML = '<div style="margin-bottom:4px;"><strong>Adresseavvik</strong></div>' +
                            '<div>Hentested: <strong>' + (data.henteAdr || '?') + '</strong></div>' +
                            '<div>Leveringssted: <strong>' + (data.leverAdr || '?') + '</strong></div>' +
                            (data.folkAdr ? '<div style="margin-top:4px;">Folkereg: ' + data.folkAdr + '</div>' : '');
                        data.adresse = data.leverAdr || data.henteAdr || '';
                    } else if (data.kortType === 'kommune') {
                        info.innerHTML = '<div style="margin-bottom:4px;"><strong>Kommunegrense</strong></div>' +
                            '<div>' + (data.pasientKommune || '?') + ' &rarr; ' + (data.destKommune || '?') + '</div>' +
                            '<div style="margin-top:4px;">Destinasjon: <strong>' + (data.destNavn || '?') + '</strong></div>' +
                            '<div>Hentested: ' + (data.henteAdr || '?') + '</div>' +
                            '<div>Leveringssted: ' + (data.leverAdr || '?') + '</div>';
                        data.adresse = data.destNavn || data.leverAdr || '';
                    }
                    document.getElementById('gkStatus').textContent = '';
                    document.getElementById('gkAdrRad').style.display = 'none';
                    document.getElementById('gkOrdRad').style.display = 'none';
                    gkModal.classList.add('show');
                };
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
                    document.getElementById('adrStatus').textContent = 'Lagrer...';
                    window._avvikCh.postMessage({ type: 'LEGG_TIL_ADR', adresse: adr });
                    input.value = '';
                });
                document.getElementById('ordLeggTilBtn').addEventListener('click', function() {
                    var input = document.getElementById('ordNyInput');
                    var ord = input.value.trim();
                    if (!ord) return;
                    document.getElementById('ordStatus').textContent = 'Lagrer...';
                    window._avvikCh.postMessage({ type: 'LEGG_TIL_ORD', ord: ord });
                    input.value = '';
                });
            <\/script>
        </body></html>`);
        window.mqWin.document.close();
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
    if (window._avvikKeepaliveTimer) clearInterval(window._avvikKeepaliveTimer);
    window._avvikKeepaliveTimer = setInterval(async () => {
        try {
            const res = await fetch(`ajax-dispatch?update=false&t=${Date.now()}`, { credentials: 'same-origin' });
            if (res.ok) {
                console.log(`[KEEPALIVE] OK (${res.status})`);
            } else if (res.status === 401 || res.status === 403) {
                console.warn('[KEEPALIVE] Sesjonen er utløpt — logg inn på nytt');
                avvikChannel.postMessage({ type: 'SESJON_UTLOPT' });
            }
        } catch (e) {
            console.warn('[KEEPALIVE] Ping feilet:', e.message);
        }
    }, 180000); // 3 minutter

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
            if (data.turid) { godkjentIMinne.add(data.turid); lagreGodkjent(); }
            if (data.resId) settMerknad(data.resId, 'Godkjent avvik');
            fadeOgFjern(data.id);
        }

        if (data.type === 'GODKJENN_DUBLETT') {
            if (data.turid1) godkjentIMinne.add(data.turid1);
            if (data.turid2) godkjentIMinne.add(data.turid2);
            lagreGodkjent();
            if (data.resId1) settMerknad(data.resId1, 'Godkjent dublett');
            if (data.resId2) settMerknad(data.resId2, 'Godkjent dublett');
            fadeOgFjern(data.id1);
        }

        if (data.type === 'AVVIK') {
            console.log(`[AVVIK] Mottatt: id=${data.id}, rekNr=${data.rekNr}, rekvirent=${data.rekvirent}`);
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
            const card = window.mqWin?.document.querySelector(`[data-rid="${data.id}"]`);
            const avvikDiv = card?.querySelector('.avvik-info');
            if (avvikDiv) avvikDiv.remove();
        }

        if (data.type === 'AVVIK_FERDIG') {
            if (data.turid) { godkjentIMinne.add(data.turid); lagreGodkjent(); }
            if (data.resId) settMerknad(data.resId, 'Avvik meldt');
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
            if (win._gkSetPending) win._gkSetPending(data);
        }

        if (data.type === 'GODKJENN_LAGRE_ADR') {
            const win = window.mqWin;
            const resultat = await lagreGodkjentAdresse(data.adresse, data.kortType || 'adresse');
            if (win && !win.closed) {
                const status = win.document.getElementById('gkStatus');
                if (status) status.textContent = resultat.melding;
            }
            if (resultat.ok) {
                if (data.turid) { godkjentIMinne.add(data.turid); lagreGodkjent(); }
                if (data.resId) settMerknad(data.resId, 'Godkjent adresse');
                fadeOgFjern(data.reqId);
                setTimeout(() => { if (win && !win.closed) win.document.getElementById('gkModal').classList.remove('show'); }, 800);
            }
        }

        if (data.type === 'GODKJENN_LAGRE_ORD') {
            const win = window.mqWin;
            const resultat = await lagreGodkjentOrd(data.ord, data.kortType || 'adresse');
            if (win && !win.closed) {
                const status = win.document.getElementById('gkStatus');
                if (status) status.textContent = resultat.melding;
            }
            if (resultat.ok) {
                if (data.turid) { godkjentIMinne.add(data.turid); lagreGodkjent(); }
                if (data.resId) settMerknad(data.resId, 'Godkjent søkeord');
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
            if (!modal) return;
            // Bygg adresse-liste
            liste.innerHTML = godkjenteAdresserGH.length === 0
                ? '<li style="color:#94a3b8; font-style:italic;">Ingen adresser ennå</li>'
                : godkjenteAdresserGH.map(a => `<li><span>${a}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ADR', adresse:'${a.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            // Bygg ord-liste
            if (ordListeEl) ordListeEl.innerHTML = godkjenteOrdGH.length === 0
                ? '<li style="color:#94a3b8; font-style:italic;">Ingen s\u00f8keord enn\u00e5</li>'
                : godkjenteOrdGH.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ORD', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            status.textContent = '';
            if (ordSt) ordSt.textContent = '';
            modal.classList.add('show');
        }

        if (data.type === 'LEGG_TIL_ADR') {
            const win = window.mqWin;
            const status = win && !win.closed ? win.document.getElementById('adrStatus') : null;
            const resultat = await lagreGodkjentAdresse(data.adresse, 'adresse');
            if (status) status.textContent = resultat.melding;
            if (resultat.ok) {
                // Oppdater liste i modal
                const liste = win.document.getElementById('adrListe');
                if (liste) liste.innerHTML = godkjenteAdresserGH.map(a => `<li><span>${a}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ADR', adresse:'${a.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            }
        }

        if (data.type === 'SLETT_ADR') {
            const win = window.mqWin;
            const resultat = await slettGodkjentAdresse(data.adresse, 'adresse');
            if (resultat.ok && win && !win.closed) {
                const liste = win.document.getElementById('adrListe');
                if (liste) liste.innerHTML = godkjenteAdresserGH.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen adresser enn\u00e5</li>'
                    : godkjenteAdresserGH.map(a => `<li><span>${a}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ADR', adresse:'${a.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            }
        }

        if (data.type === 'LEGG_TIL_ORD') {
            const win = window.mqWin;
            const status = win && !win.closed ? win.document.getElementById('ordStatus') : null;
            const resultat = await lagreGodkjentOrd(data.ord, 'adresse');
            if (status) status.textContent = resultat.melding;
            if (resultat.ok && win && !win.closed) {
                const ordListeEl = win.document.getElementById('ordListe');
                if (ordListeEl) ordListeEl.innerHTML = godkjenteOrdGH.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ORD', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            }
        }

        if (data.type === 'SLETT_ORD') {
            const win = window.mqWin;
            const resultat = await slettGodkjentOrd(data.ord, 'adresse');
            if (resultat.ok && win && !win.closed) {
                const ordListeEl = win.document.getElementById('ordListe');
                if (ordListeEl) ordListeEl.innerHTML = godkjenteOrdGH.length === 0
                    ? '<li style="color:#94a3b8; font-style:italic;">Ingen s\u00f8keord enn\u00e5</li>'
                    : godkjenteOrdGH.map(o => `<li><span>${o}</span><button class="adr-slett" onclick="window._avvikCh.postMessage({type:'SLETT_ORD', ord:'${o.replace(/'/g,"\\'")}'})" title="Fjern">&#10005;</button></li>`).join('');
            }
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

                const folkKm = await beregnKm(folkAdr, behandlingsAdr);
                const bestiltFraAdr = erTur ? fraAdr : tilAdr;
                const bestiltKm = await beregnKm(bestiltFraAdr, behandlingsAdr);

                console.log(`[KM-MANUELL] RID=${data.reqId}: folkKm=${folkKm?.km ?? 'null'}, bestiltKm=${bestiltKm?.km ?? 'null'}, erTur=${erTur}`);
                console.log(`[KM-MANUELL]   folk="${folkAdr.substring(0,60)}" fra="${fraAdr.substring(0,60)}" til="${tilAdr.substring(0,60)}"`);

                if (kmDiv) {
                    if (folkKm && bestiltKm) {
                        const avvik = bestiltKm.km > folkKm.km;
                        const stil = avvik
                            ? 'background:#fef2f2; border-color:#ef4444; color:#991b1b;'
                            : 'background:#f0fdf4; border-color:#10b981; color:#065f46;';
                        kmDiv.innerHTML = `<div class="warning-text" style="${stil}">
                            Bestilt: ${bestiltKm.km.toFixed(1)} km -- Folkereg: ${folkKm.km.toFixed(1)} km
                            ${avvik ? '' : ' &#10004; OK'}
                        </div>`;
                    } else {
                        const bestiltFraMaps = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(bestiltFraAdr)}&destination=${encodeURIComponent(behandlingsAdr)}`;
                        const folkMaps = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(folkAdr)}&destination=${encodeURIComponent(behandlingsAdr)}`;
                        const bKm = bestiltKm ? bestiltKm.km.toFixed(1) + ' km' : `<a href="${bestiltFraMaps}" target="_blank" style="text-decoration:none;" title="Sjekk bestilt reise i Google Maps">? &#128205;</a>`;
                        const fKm = folkKm ? folkKm.km.toFixed(1) + ' km' : `<a href="${folkMaps}" target="_blank" style="text-decoration:none;" title="Sjekk folkereg reise i Google Maps">? &#128205;</a>`;
                        kmDiv.innerHTML = `<div class="warning-text">Bestilt: ${bKm} -- Folkereg: ${fKm}</div>`;
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
