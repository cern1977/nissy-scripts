// === OMRÅDE ASSISTENT v0.9.90-dev ===
// v0.9.90-dev: taxi-boksen viser nå LØYVE (tildelt bil) for autentisk preg (Thomas). Parses fra «Løyve/Tur nr:
//              C-4303 / 71613072» i Transportør/ressurs-seksjonen → C-4303. + transportør (Follo Taxi) i tooltip.
// === OMRÅDE ASSISTENT v0.9.89-dev ===
// v0.9.89-dev: ANTI-FLIMMER ved autorefresh (Thomas «mye forsvinner»). fyllHlsx bygger radene om KUN ved struktur-
//              endring (passasjer inn/ut); kun-verdi-endring (status «om bord») → in-place oppdatering av .hstwrap/
//              .fratil; uendret → rør ikke DOM. fyllHlsxRader nå IDEMPOTENT (skriver kun ved endret innhold). Radene
//              + taxi-/melding-/frabringer-feltene blir nå stående og «endrer seg» i stedet for å forsvinne.
// === OMRÅDE ASSISTENT v0.9.88-dev ===
// v0.9.88-dev: tilbringer sjekkes nå UANSETT påstigningssted (fjernet feil «kun utenfor Oslo»-regel — pas kan ta
//              taxi hjemmefra til Ullevål/RH, eks LISE TVETE Bjørnemyr→Ullevål). Vis kun ved FUNNET (ikke «mangler»
//              på sykehus-pasienter som er på terminalen). LIE bekreftet OK.
// === OMRÅDE ASSISTENT v0.9.87-dev ===
// v0.9.87-dev: TEST — taxi-kortet skjules IKKE lenger ved levert (Thomas vil verifisere at tilbringer-matchingen
//              treffer). Viser også ✓-levert. TODO: re-aktiver skjul-ved-suti.levert etter testing.
// === OMRÅDE ASSISTENT v0.9.86-dev ===
// v0.9.86-dev: HLSX-søyla TRANSPARENT (Thomas' skisse) — hver passasjer = eget «pasientkort» (.paskort) m/ luft
//              mellom, header/retn-rad får egen lesbar bakgrunn. TILBRINGER vises nå som eget TAXI-KORT til venstre
//              (.hlsxtaxi-gutter, 🚕+status), synlig til taxien har levert pas på stoppet (suti.levert → skjules).
// === OMRÅDE ASSISTENT v0.9.85-dev ===
// v0.9.85-dev: sjekker nå også TILBRINGER (🚕 taxi TIL påstigningsstoppet, eks Ahus→Skedsmokorset), ikke bare
//              frabringer. omrTilbringerStatus matcher rekvisisjon som LEVERER på bussens hentested-postnr. Vises
//              pr rad når påstigning er utenfor Oslo (ikke 0xxx) og pas ikke kommer seg selv. (LIE JONNY RENÉ.)
// === OMRÅDE ASSISTENT v0.9.84-dev ===
// v0.9.84-dev: skjult tidsvindu-slideren i kart-toppbaren (Thomas — unngå å forvirre operatørene). vinduMin=120
//              beholdes i bakgrunnen (filtrering uendret), lett å hente slideren tilbake senere.
// === OMRÅDE ASSISTENT v0.9.83-dev ===
// v0.9.83-dev: ryddet kart-toppbar (Thomas): fjernet bakgrunnskart-dropdown (fast «Lyst grå»), punkt/kjørerute-
//              dropdown (rute vises på kort-klikk-toggle), 🔎 Retur-sjekk-knapp og 📋 Liste-knapp. Kun vindu-slider igjen.
// === OMRÅDE ASSISTENT v0.9.82-dev ===
// v0.9.82-dev: auto-oppdatering PÅ som standard (autoRefresh=true) + full skann-intervall 90→120 sek (Thomas).
//              Lett re-render (frist/varsel + bussrute-synk) fortsatt hvert 30. sek.
// === OMRÅDE ASSISTENT v0.9.81-dev ===
// v0.9.81-dev: HLSX-kontroller som CHECKBOXER (overlever autorefresh): «🗺️ Tegn kart» (bussKartPaa, localStorage) →
//              ruta tegnes + holdes i synk hvert tikk, re-tegnes kun ved endret passasjer-sett (signatur, ingen
//              zoom-hopp). «Skjul tekstbokser» (hlsxSkjulMeld) → CSS skjuler meldingslinjene. tegnHlsxBussrute→oppdaterBussrute(fit).
// === OMRÅDE ASSISTENT v0.9.80-dev ===
// v0.9.80-dev: antall PÅ VENT vises nå som amber-teller i hver tab («Nord/Øst N» / «HLSX Lillehammer M») —
//              oppdateres hvert tikk uansett aktiv tab, så man ser ventende på den andre fanen uten å bytte.
// === OMRÅDE ASSISTENT v0.9.79-dev ===
// v0.9.79-dev: FIX «[object Object]» i bussrute-statuslinja — Prototype/rico overstyrer Array.prototype.reduce (+
//              some) i hovedsiden → returnerte selve arrayet. Erstattet med indekserte løkker (sum av/på, harOslo).
// === OMRÅDE ASSISTENT v0.9.78-dev ===
// v0.9.78-dev: ruta tegnes nå i bussens FASTE stopprekkefølge (seq: RH→Ullevål→Olavsgaard→…→Lillehammer), ikke
//              etter breddegrad — fikser at RH/Ullevål byttet plass (bussen starter RH, så Ullevål). Ukjente stopp
//              interpoleres på seq-skalaen etter lat. Oslo-anker prepend (sør) i stedet for append.
// === OMRÅDE ASSISTENT v0.9.77-dev ===
// v0.9.77-dev: (1) kanonMoteplass snapper nå hentested på POSTNR via hlsxTerminalNavn (Radium 0379→RH-internbuss,
//              RH 0372, Ullevål 0450) — fikser GERD RINGEN (hentested «Sengepost 4 Sør, 0379 Oslo» tegnet utenfor
//              ruta). (2) Fjernet ↑-pilen i grønne påstigning-markører (så ut som 1-tall) — bare tallet, grønt=på.
// === OMRÅDE ASSISTENT v0.9.76-dev ===
// v0.9.76-dev: bussruta viser nå PÅSTIGNING i tillegg til avstigning — leser HENTESTED pr passasjer (parses som
//              leveringssted). Olavsgaard/Skedsmo dukker opp som påstigning (Ahus-pas m/ tilbringer). Markør: lilla
//              tall=av, grønt ↑N=kun påstigning, grønt hjørne-merke ved både av+på. Tooltip lister navn pr rolle.
// === OMRÅDE ASSISTENT v0.9.75-dev ===
// v0.9.75-dev: bussrute-møteplassene er nå «HED/OPP NN»-serien (= bussens offisielle rute i NISSYs møteplass-
//              registry), og koordinatene hentes LIVE fra NISSY (adminTCDetails «Posisjon X/Y» UTM33, cachet 60d).
//              La til Gjøvik-grenen. Hardkodet ll = fallback. Verifisert: Tangenkrysset 6726613/295548→60.623,11.263.
// === OMRÅDE ASSISTENT v0.9.74-dev ===
// v0.9.74-dev: SELVTRANSPORT — pasient som kommer seg selv til møteplassen (melding «kommer seg …») får «🚶 Kommer
//              selv til møteplassen — ingen frabringer» i stedet for «❌ mangler». (NYBORG-caset.)
// === OMRÅDE ASSISTENT v0.9.73-dev ===
// v0.9.73-dev: bussrute snapper nå møteplass til KANONISK POI-liste (offisiell stoppliste) via NAVN-match — fikser
//              NISSY-feildata (NYBORG: «Brumunddal Vegkroa E6» hadde koord for 2283 Åsnes Finnskog). UTM-koord kun
//              fallback for ukjente steder; slike markeres RØDT m/ ⚠ i tooltip.
// === OMRÅDE ASSISTENT v0.9.72-dev ===
// v0.9.72-dev: NY «🗺️ Tegn bussrute» på HLSX-tab — tegner helsebussens rute i kartet med MØTEPLASSER og ANTALL
//              som skal av pr stopp. Møteplass = NISSYs Leveringssted (navn + UTM33-koordinater → utm33ToLatLon),
//              gruppert pr passasjer. Egen kart-lag (bussLag) som overlever poll. Toggle; ankret i Rikshospitalet.
// v0.9.71-dev: HLSX-passasjerer viser STATUS pr pasient (⏳ venter / 📍 buss framme / 🚌 om bord / ⛔ ikke møtt) fra
//              STATUS-kolonnen — «Startet» = pasient om bord. Oppdateres live ved hver poll (lista re-renderes).
// v0.9.70-dev: terminal-overskrift invertert til GUL boks med mørk blå/grå skrift + blå venstrekant (var blass).
// v0.9.69-dev: terminal-gjenkjenning på POSTNR (adressen mangler ofte navnet): Ullevål 0450, Rikshospitalet 0372,
//              Radiumhospitalet 0379. Fikser ELTON 0450 Oslo→Moelv som havnet i «Annet».
// v0.9.68-dev: Radiumhospitalet (0379) grupperes under RIKSHOSPITALET — pasienten tar internbuss Radium→RH og
//              helsebussen derfra (turen splittes ikke, ingen egen frabringer-taxi på Oslo-enden).
// v0.9.67-dev: HLSX-passasjerer GRUPPERES nå under TERMINAL-overskrift (🏥 Rikshospitalet / Ullevål) i stedet for
//              avreisetid pr passasjer — bussen drar kun fra de 2 stedene. Sortering pr tid beholdt internt.
// v0.9.66-dev: buss-TOTALEN (belegg/ledig) teller nå med AUTORITATIV ledsager pr passasjer — data-leds pr rad,
//              oppdaterHlsxBelegg() re-summerer når rekvisisjon-detaljen er hentet (var låst til L-kolonne-estimat).
// v0.9.65-dev: HLSX-passasjerer viser nå LEDSAGER pr pasient AUTORITATIVT fra rekvisisjonen (👥 +N ledsager /
//              🧍 alene / 👥 ? ved parse-miss). L-kolonna er pr samkjørt bil, ikke pr pasient → upålitelig. _ledsDbg
//              logges til konsoll ved miss så label kan justeres mot ekte data.
// v0.9.64-dev: erHelsebuss krever nå INNLANDET-ENDEPUNKT — ett ben starter/ender innenfor Pasientreiser
//              Innlandets FAKTISKE postnr-område (auto-høstet fra NISSY via kjorekontor.php?alle, fallback
//              2266-2999,3522,3528). Ekskluderer Oppaker→Ahus/RH-frabringere (Akershus); beholder Rendalen 2485.
// v0.9.51-dev: FRABRINGER-sjekk pr buss-RETUR-passasjer (linje nederst i boksen): siste bil fra busstoppet
//              hjem. = pasientens (pnr) rekvisisjon samme dag, ≠ bussbenet, som avgår fra busstoppet (hentested-
//              postnr == bussens til-postnr). Viser ❌ mangler / 🕓 bestilt / 📍 framme / 🚗 på vei / ✓ levert. Cachet.
// v0.9.50-dev: erHelsebuss to-trinns: callsign «HLSB …» (tildelt buss, sikrest) + terminal RH/Ullevål (ventende).
//              Domene: bussen eies av Innlandet (avtale 901, starter Lillehammer); OoA legger på returene i Oslo.
// v0.9.49-dev: HLSX_SETER 22 → 30 (korrigert antall). TODO: flytt til server-config (mange helseekspresser).
// v0.9.48-dev: ekte helsebuss via TERMINAL-MATCH (RH/Ullevål) i stedet for krysser-grensa — bussen har stopp
//              INNENFOR OoA (Gardermoen/Olavsgaard/Skedsmo, kilde helsenorge), så grense-logikken bommet.
//              erBussTerminal = Rikshospitalet/RH/Ullevål. Frabringere (Kongsvinger-korr. → Ahus) ekskluderes.
// v0.9.47-dev: HLSX-tab viser nå KUN ekte helsebuss (erHelsebuss = HLSX som KRYSSER områdegrensa: Oslo↔
//              nord for OoA). Frabringere (HLSX-merket men helt innenfor området, f.eks. Oppaker→Ahus-
//              Lørenskog) ekskluderes. RØSTE (RH Oslo→Hamar 2319) = ekte; Oppaker(2166)→Lørenskog(1474) = ikke.
// v0.9.46-dev: HLSX retnings-radioknapper FLYTTET til toppen av høyre søyle (Helsebussen). Default = UT
//              (returer til Lillehammer); inn/begge som alternativ.
// v0.9.45-dev: HLSX-tab = helsebussen Lillehammer–Oslo (ÉN buss, 22 seter inkl. ledsagere). To søyler:
//              venstre ventende HLSX, høyre pasienter på bussen. 3 retnings-radioknapper (inn til Oslo / ut
//              til Lillehammer / begge). Belegg = pasienter+ledsagere, ledig = 22−belegg. Retning pr legg.
// v0.9.44-dev: TAB-RAD under topbaren: «Nord/Øst» (returbiler/ventende) ⇄ «HLSX Lillehammer» (helseekspress-
//              oversikt — startversjon: antall ventende + ekspressbiler + lister; bygges ut på feedback).
// v0.9.43-dev: REVERTERT v0.9.42-kompakt (Thomas: «bra som det var») → tekst tilbake på status-chippene
//              (✓ Levert HH:MM osv.). ← + retur ER slått sammen til ÉN ⇄-pil m/ ÉN kombinert tooltip
//              («Tur inn til behandling · Retur: …») — «disse to i samme».
// v0.9.42-dev: KOMPAKTE BOKSER — per-passasjer-status er nå KUN symbol (✓/🚐/📍/↗/⇄), all tid/tekst i tooltip.
// v0.9.41-dev: ÉN to-pils-symbol (Thomas' ⇄). Inn-passasjer: ← (kun inn) som standard → byttes async av retur-
//              sjekken til ⇄ grønn (retur bestilt) / ⇄ gul (åpen retur), ← grønn (ingen retur). Formen sier
//              om det fins retur; fargen sier status. Slo sammen rolle-symbol + retur-chip til ett.
// v0.9.40-dev: Rolle-symbol = RETNINGS-PIL: ← grønn = tur (inn til behandling) · → gul = retur (ut/hjem) ·
//              🔁 = begge. Erstatter ⬇/➜. Ordlyd «til behandling»/«ut/hjem» (ikke hardkodet «Oslo»).
// v0.9.39-dev: RETUR-SJEKK PÅ KORTET — rene inn-passasjerer (⬇, uten retur-ben på bilen) får en chip:
//              ✅ retur BESTILT (m/ tid, trenger returbil) · 🕓 åpen (ligger i rekvisisjonsmodulen) · ❌ ingen.
//              Async pr pnr (ssnSearch→fra-behandling samme dato), cachet 120 s (`omrReturStatusCached`). 🔁 = retur på bilen (ingen oppslag).
// v0.9.38-dev: (1) TOGGLE fikset — tegnReise la reisen rett på `kart`, så clearLayers() fjernet den ikke
//              (rutene hopet seg opp). Nå addTo(kartLag) → klikk/re-render renser den. (2) Jaren/Hurdal-
//              LUFTLINJE: ruter.php sin egen geokoding feilet; sender nå KOORDINATER (lat,lon fra geokod.php)
//              til ruter.php → ekte veggeometri.
// v0.9.37-dev: FIKS — reisen ble LUFTLINJE: gyldigKoord krevde Array.isArray, men rute-punktene er array-
//              lignende (rico) → alle forkastet. Mild punkt-sjekk (isFinite p[0]/p[1]) + konverter til rene
//              [lat,lon] → faktisk veggeometri tegnes.
// v0.9.36-dev: FIKS forts. — «geom.filter is not a function»: rute.geometri er array-LIGNENDE (rico/Prototype
//              i hovedsiden). Bytta .filter mot indeksert for-løkke + gyldigKoord pr punkt. Rico-trygt.
// v0.9.35-dev: FIKS — kort-klikk krasjet (Leaflet «_projectLatlngs reading 0 of null») fordi et rute-
//              segment hadde et ugyldig (null/NaN) punkt i geometrien → grp.addTo(kart) feilet, ingen
//              tegning. Validerer nå hvert punkt med gyldigKoord (filtrer rute.geometri + sjekk a.ll/b.ll/s.ll).
// === OMRÅDE ASSISTENT v0.9.34-dev ===
// v0.9.34-dev: KLIKK KORT = tegn HELE reisen i kartet (tidsordnede stopp: henting@start/levering@opp →
//              rutede segmenter + nummererte markører, faktisk kjørerekkefølge). TOGGLE: samme kort igjen
//              fjerner reisen; nytt kort bytter (alltid kun én om gangen). Valgt kort highlightes; reisen
//              gjenopprettes etter auto-oppdatering uten å zoome.
// === OMRÅDE ASSISTENT v0.9.33-dev ===
// v0.9.33-dev: «skjul uønskede»-checkbox (default PÅ) øverst i Returbiler-kolonna → skjuler LOKALE turer
//              (erLokalTur: ingen ben krysser områdegrensa) + AVREISTE (>1,5t). GD/ST/LCTMS-GD alltid skjult
//              (uavhengig). Av → vis alt (lokale merkes «🏡 Lokal», avreiste i kortet). erLokal nå standalone.
// === OMRÅDE ASSISTENT v0.9.32-dev ===
// v0.9.32-dev: (1) LOKAL-merking: returbil der INGEN passasjer krysser områdegrensa (behandling i området,
//              f.eks. Kongsvinger — ikke Oslo) får «🏡 Lokal» og ingen Oslo-ETA (skjules i fremtiden).
//              (2) erGD fanger nå også «LCTMS-GD/CTMS-GD» (GD-avtale uten tildelt bil) → skjules som GD/ST.
// === OMRÅDE ASSISTENT v0.9.31-dev ===
// v0.9.31-dev: (1) Rolle-symbol FØR HVER pasient: ⬇ tur (inn til Oslo, blå) · ➜ retur (grønn) · 🔁 begge,
//              så man ser per pasient hva det gjelder. (2) DIAGNOSE: passasjer som hverken er tur/retur
//              (begge endepunkt utenfor Oslo el. postnr som ikke leses) dumper benene til konsollen én gang
//              pr bil — for å skjønne IN-547/A-8120 (ingen status/ETA).
// === OMRÅDE ASSISTENT v0.9.30-dev ===
// v0.9.30-dev: ETA-STATUS RIKTIG + sparer oppslag. PRIORITET pr returbil (fra passasjerenes bijektive grupper):
//              (1) retur om bord (dro) → «↗ Dro Oslo HH:MM», bilen har reist → INGEN ETA/rute-oppslag.
//              (2) alle inn levert → «🏁 I Oslo (levert HH:MM)». (3) i gang (hentet) → faktisk hentet +
//              kjøretid (ruter.php, verifisert ~riktig). (4) ikke startet → NISSYs planlagte oppmøte (legg-
//              tiden) DIREKTE, ingen drive (fikser dobbelttellingen 14:30+drive=15:54). Retur-levering hjemme
//              (13:11) lekker ikke lenger inn som «I Oslo». «(plan)» markerer estimat før start.
// === OMRÅDE ASSISTENT v0.9.29-dev ===
// v0.9.29-dev: ETA FRA KLAR-FRA også for «Akseptert»-biler (uten SUTI). ETA-grunnlaget kobles nå til SISTE
//              innkjørings-ben (til i Oslo) i kort-renderingen (data-tid=planlagt klar-fra, data-fra/til),
//              uavhengig av passasjer-klassifisering. ETA-passet kjøres for ALLE returbil-kort. SUTI (når
//              tilgjengelig) oppgraderer klar→faktisk hentet og viser «🏁 I Oslo (levert HH:MM)».
// === OMRÅDE ASSISTENT v0.9.28-dev ===
// v0.9.28-dev: ETA I OSLO pr returbil («🏁 I Oslo ca. HH:MM»). Tar SISTE inn-passasjer (seneste hentetid =
//              sist om bord før Oslo): trigger = faktisk hentet (SUTI 1701) ellers planlagt «klar fra»,
//              + kjøretid hentested→Oslo-mål (ruter.php, haversine×VEIFAKTOR/60kmt-fallback). Alle inn
//              levert → «🏁 I Oslo (siste levert HH:MM)». Gul før ETA passert, grønn etter. Tooltip: regnestykket.
// === OMRÅDE ASSISTENT v0.9.27-dev ===
// v0.9.27-dev: RETUR «DRO FRA OSLO» — ren retur-passasjer (➜) får eget statusfelt: «↗ Dro HH:MM» =
//              retur-leggets 1701 (hentet i Oslo = avgang). «📍 Henter HH:MM» = bil framme ved Oslo-
//              hentestedet · «⏳ venter» = bil ikke kommet. Fanger retur-leggets reqId+Oslo-hentetid;
//              bijektiv match inkluderer nå tur+retur (tur tar tidlige grupper, retur de sene).
// === OMRÅDE ASSISTENT v0.9.26-dev ===
// v0.9.26-dev: BIJEKTIV gruppe-tildeling — SVENDSEN arvet IQBALs levert-tid (11:04) fordi to passasjerer
//              kunne ta SAMME gruppe. Nå: sorter passasjerene på hentetid, tidligst først får nærmeste
//              LEDIGE gruppe (markert brukt), så hver gruppe brukes kun én gang → SVENDSEN får sin 11:27.
// === OMRÅDE ASSISTENT v0.9.25-dev ===
// v0.9.25-dev: PER-BIL LEVERT (diagnostikk avslørte: SUTI-loggen vises kun når man spør ajax_reqdetails
//              med reqID-en som «eier» den aktive ressursen — samme bil/resId, men bare ÉN reqId ga 5
//              grupper). Behandler nå per bil: prøver passasjerenes reqIds til én gir grupper, utleder
//              bilens felles logg, og kobler hver passasjer på sin «Klar fra» (07:50≈1701). Dropper
//              ssnSearch-tripid (hjalp ikke). Rekkefølge-uavhengig → JAFFERY/IQBAL får nå også sin tid.
// === OMRÅDE ASSISTENT v0.9.24-dev ===
// v0.9.24-dev: TRIPID-OMVEI TILBAKE — «0 passasjer-grupper» avslørte at SUTI-loggen IKKE vises med
//              returbilens resId som tripid; den låses opp av turens EGEN tripid (ssnSearch). Henter den
//              på nytt når resId gir 0 grupper. Cacher pr BIL (resId) når grupper finnes; matcher hver
//              passasjer på data-hent (tur-leggets tid). Konsoll-diagnostikk: seksjon/rader/grupper/tripid.
// === OMRÅDE ASSISTENT v0.9.23-dev ===
// v0.9.23-dev: LEVERT RIKTIG PARSET (Thomas' rå SUTI-logg avslørte det). (1) Livssyklus-koden ligger i «Suti
//              ATTRIBUTT»-kolonnen (<nobr>1709/1701/1702</nobr>), ikke «Suti kode» (4010). (2) Radene er
//              «SutiMsgReceived», IKKE «Bekreftet» → fjernet Bekreftet-kravet (det var derfor alt var tomt).
//              (3) SAMKJØRING: hver passasjer har EGEN RekvisisjonsNr (12-siffer) m/ sin egen framme/hentet/
//              levert — grupperer pr RekvisisjonsNr og kobler passasjer→gruppe via hentetid (klar fra ≈ 1701),
//              ellers «smitter» én passasjers 1702 til alle. Dropper ssnSearch-tripid-dansen (full logg kommer
//              uansett). Cacher pr BIL (resId), ett oppslag pr bil. ✓ Levert HH:MM pr passasjer fra hennes gruppe.
// === OMRÅDE ASSISTENT v0.9.22-dev ===
// v0.9.22-dev: EKSAKT LEVERT — løser tripid-fella. Når 1. admin-oppslag (tripid=returbilens resId) gir tom
//              SUTI, hentes turens EGEN tripid via ssnSearch (pnr→getRequisitionDetails(reqId,db,tripid)) og
//              admin slås opp på nytt → «Suti kode» for riktig tur → «✓ Levert HH:MM» (1702) når den finnes.
//              Cachet pr reqId m/ resolved SUTI + tripid-kilde i tooltip. Tabell-status forblir inline-fasit.
// === OMRÅDE ASSISTENT v0.9.21-dev ===
// v0.9.21-dev: STATUS PER PASIENT som Overvåker Live gjør det — rett fra STATUS-kolonnen i pågående-
//              tabellen (én <div> per passasjer, idx ↔ showReq-reqId). Det fanges allerede som leg.status,
//              så inn-passasjerenes statusfelt vises nå UMIDDELBART (🚐 På vei inn/📍 Framme/⛔ Ikke møtt)
//              uten admin-kall. En synlig tur-status = IKKE levert ennå (levert tur faller ut av pågående).
//              Admin/SUTI beriker kun tooltipen + oppgraderer til «✓ Levert HH:MM» NÅR 1702 finnes. (SUTI
//              var tom i v0.9.20 fordi tripid=returbilens resId ≠ turens egen tripid — dokumentert i tip.)
// === OMRÅDE ASSISTENT v0.9.20-dev ===
// v0.9.20-dev: LEVERT-STATUS pr inn-passasjer på returbil-kortene (utvikling). Hver passasjer med tur-ben
//              får et statusfelt som async slår opp tur-rekvisisjonen i admin (ajax_reqdetails) og leser
//              SUTI-livssyklusen (FASIT fra Overvåker Live): 1709=📍framme · 1701=🚐i bil · 1702=✓LEVERT ·
//              1703=⚠bomtur. Svar på «er pasienten på vei inn levert i første omgang?» = finnes 1702.
//              Tooltip dumper rå admin-felt (status/retning/klar fra/framme/hentet/levert) så vi ser hva
//              som finnes. Cachet pr reqId (TTL 90 s), sekvensielt oppslag (struping). leg.reqId pr passasjer.
// === OMRÅDE ASSISTENT v0.9.6-dev ===
// v0.9.6-dev: KART er default åpningsbilde (Thomas: kart er hovedflaten fremover). Område-valg setter
//             kartMode=true; og siden det nå kun er ÉTT område (Nord/Øst) hoppes velgeren over → man
//             går rett inn i kartet. «📋 Liste» finnes fortsatt for den gamle listevisningen.
// === OMRÅDE ASSISTENT v0.9.5-dev ===
// v0.9.5-dev: «🔎 Retur-sjekk»-knapp også i KART-verktøylinja (ikke bare liste-headeren), så den er
//             tilgjengelig der man faktisk står. + TOOLTIPS: 🔁 (tur/retur samme bil) og «N/M ledig» på
//             returbil-kortene i kartet har nå forklarende title-hover. (behov-badges hadde alt.)
// === OMRÅDE ASSISTENT v0.9.4-dev ===
// v0.9.4-dev: RETUR-SJEKK baby step 1 — «🔎 Retur-sjekk»-knapp i headeren. Per pågående bil: reqId → pnr
//             (ajax_reqdetails) → alle pasientens rekvisisjoner (searchStatus ssnSearch) → finnes en med
//             retning «Fra behandling» (= retur bestilt)? Logger i konsollen for verifisering (ingen
//             UI på kortet ennå). pnr forlater aldri verktøyet — kun til NISSY-oppslaget.
// === OMRÅDE ASSISTENT v0.9.3-dev ===
// v0.9.3-dev: VELGER viser KUN «Nord/Øst» igjen (ikke separate Nord/Østfold). Gjeninnført etter at
//             v0.9.2-deploy ved uhell reverterte en server-kun endring (23.06) som lå utenfor repo.
// v0.9.2-dev: SPAGETTI-DEFAULT FJERNET — kartet tegner IKKE lenger alle ventende-ruter + returbiler ved
//             åpning (rotete «spaghetti»). Kartet er nå RENT; klikk et kort → tegn KUN den ene (on-demand)
//             + zoom. Side-panelene (ventende/pågående-lister) uendret. (Tabber kommer senere.)
// v0.9.1-dev: KAPASITETSFEIL — bil med eget RETUR-BEN (annen pasient hjem, f.eks. NYKVIST Oslo→Elverum) viste
//             «3 av 3 ledig». egneReturPassasjerer fanget kun enkel tur/retur. Nå telles ALLE retur-ben
//             (erVaartOmraade(fra) && !erVaartOmraade(til) — samme predikat som returStatus), hver med sitt
//             per-ben behov → riktig restkapasitet + «tar»-liste capper korrekt.
// === OMRÅDE ASSISTENT v0.9.0-dev ===
// v0.9.0-dev: SEMVER (MAJOR.MINOR.PATCH). 0 = før produksjon; 1.0.0 reserveres til prod-promotert, test-grenser
//             (KANDIDAT_MAKS) av og kollega-verifisert. Patch (0.9.1) ved fiks, minor (0.10.0) ved nye features.
//             Tidligere «v0.XX-dev» var bare et løpenummer (var feilaktig «v1.0-dev»). + «🔔 Test blink»-knapp:
//             tvinger noen ventende-rader til å blinke i NISSY ~8 s for å teste blinket når ingenting haster.
// v1.0-dev: BLINK I NISSY. Ventende-rader som HASTER («send ut»-frist passert) pulserer nå med amber
//           bakgrunn direkte i NISSY-planleggertabellen (ikke bare i verktøyet) via tr.oa-haster-klasse +
//           keyframes injisert i NISSY-head. Re-påføres hvert 3. sek (overlever NISSYs aggressive re-render)
//           + ved hver skann; uavhengig av autoRefresh (live operatør-hjelp). Fjernes ved områdebytte.
// === OMRÅDE ASSISTENT v0.99-dev ===
// v0.99-dev: returbil-rydding + anker-fiks. (1) Over-matching: omvei var ankret globalt på OSLO_KOORD, så
//            en Kongsvinger-bil fikk ~0 omvei mot ALLE Oslo-pasienter. Nå ankres per BIL på dens faktiske
//            posisjon (returInfo.hub = der den slipper av sin egen pasient = siste innkjørings til); omvei =
//            hub→D + D→E − hub→E. En Kongsvinger-bil matcher ikke lenger Oslo-pasienter. (2) Støy: «⚠ ikke
//            plass»-lista fjernet helt; «tar» viser kun de som faktisk får plass (kapasitet), med +omvei,
//            sortert beste først.
// === OMRÅDE ASSISTENT v0.98-dev ===
// v0.98-dev: info-stolpen viser nå OMKJØRING FOR SISTE PASIENT (den som sitter i bilen hele veien): bilens
//            rute fra hens henting til hens hjem MINUS direkte tur — i +min, +km og +%. Fanger distanse/tid
//            per rute-segment (rute.meter/sek, haversine-estimat ved luftlinje-fallback).
// === OMRÅDE ASSISTENT v0.97-dev ===
// v0.97-dev: (1) INFO-STOLPE venstre i samkjør-kartet: pasientene (tid/navn/behov/fra→til) + kjørerekkefølge
//            (nummererte unike stopp m/adresse) + omvei. (2) Luftlinje-diagnose: logger ruter.php-feilen per
//            segment som faller tilbake (mistanke: ORS-ratelimit). (3) hentRute cacher ikke lenger FEIL (kun
//            gyldige ruter) → prøver på nytt når ORS-kvoten er tilbake, i stedet for å henge på luftlinje.
// === OMRÅDE ASSISTENT v0.96-dev ===
// v0.96-dev: samkjør-kart slår nå sammen punkter på ~samme sted (<300 m) til ÉN unik stopp. Begge hentes på
//            Ahus → felles hente-stopp (3 adresser, ikke 4) i stedet for to overlappende markører. Markører
//            nummereres per UNIK stopp i kjørerekkefølge; felles stopp (begge pasienter) vises lilla med begge
//            navn i tooltip. Ruter mellom de unike stoppene.
// === OMRÅDE ASSISTENT v0.95-dev ===
// v0.95-dev: manglende rute mellom hente-stopp (Oslo→Ski). Årsak: ruter.php geokodet klinikk-navnet på nytt
//            («Nevrolog …, 0364 Oslo» → Geonorge-miss → fallback) og kunne ta >12s → fetchTO-timeout → ingen
//            rute. Fiks: (1) ruter.php tar nå KOORDINAT-input «lat,lon» direkte (hopper geokoding); kartet ruter
//            på de allerede-geokodede punktene. (2) Stiplet rett linje som fallback hvis ruting likevel feiler,
//            så koblingen 1→2→3→4 alltid er synlig.
// === OMRÅDE ASSISTENT v0.94-dev ===
// v0.94-dev: kart tegnet ingenting — ÉN null-punkt i rute-geometrien kræsjet Leaflet (_projectLatlngs:
//            «Cannot read null[0]») og avbrøt hele tegningen. Fiks: filtrer geometrien til gyldige [lat,lon]
//            (for-løkke) før L.polyline, tegn kun ved ≥2 punkter. Hele tegne-blokka i try/catch + for-løkker
//            (Prototype.js-trygt). Markører/rute tegnes nå robust.
// === OMRÅDE ASSISTENT v0.93-dev ===
// v0.93-dev: kart-overlay viste hver tur for seg (2 separate ruter), ikke som samkjøring. Nå tegnes ÉN
//            kombinert rute = bilens faktiske kjøring: hent begge → lever begge i optimal rekkefølge (samme
//            4 rekkefølger som beregnPar, minst total avstand). Markørene er NUMMERERT 1→4 i besøksrekkefølge,
//            farget per pasient (blå=A, oransje=B). Felles hentested → segmentet hoppes over.
// === OMRÅDE ASSISTENT v0.92-dev ===
// v0.92-dev: berik() hang («Stopper opp» etter skann) — v0.90 doblet geokodingen (par geokoder nå fra+til),
//            så ~160 fetch ble fyrt samtidig mot one.com → PHP-FPM tom for arbeidere → noen kall hang →
//            Promise.all fullførte aldri. Fiks: (1) fetchTO = timeout (abort 9–12s) på alle geokod/reisetid/
//            ruter-kall; (2) mapLimit = maks 6 samtidige kall (kø) for geokoding + reisetid. Berik fullfører
//            nå alltid (verre fall: noen adresser uten koord denne runden, hentes fra cache neste).
// === OMRÅDE ASSISTENT v0.91-dev ===
// v0.91-dev: «auto av» betyr nå HELT statisk. Poll-skannet var gated på autoRefresh, men to andre triggere
//            kjørte uansett: 30s-re-rendringen (visIv) og visibilitychange-hooken (skann ved fokus). Begge
//            gates nå på autoRefresh. Auto av = kun første lasting + manuell 🔄 Oppdater rører visningen.
// === OMRÅDE ASSISTENT v0.90-dev ===
// v0.90-dev: HANDLING = fokusert kartvisning. Hvert samkjør-par har nå «🗺️ Vis i kart» → åpner et overlay
//            som viser KUN den ene samkjøringen: begge pasientenes hentested (H) + hjem (🏠) + kjøreruter
//            (blå=A, oransje=B), auto-zoomet. Statisk (tegnes én gang, ingen auto-refresh + invalidateSize)
//            → unngår zoom-wipe-bugen fra full-kartet. Bekrefter «samme retning» visuelt før manuell handling.
// === OMRÅDE ASSISTENT v0.89-dev ===
// v0.89-dev: «hvilket par er best?» — før listet vi ALLE mulige par, så samme pasient (f.eks. JOHANSEN)
//            dukket opp i 5–6 overlappende forslag. Nå: grådig maks-matching → «anbefalt plan» der hver
//            pasient er i ÉN bil (beste/minste omvei først, bruk opp begge, gjenta). Overlappende
//            alternativer flyttet til en kollapset «Andre mulige par»-seksjon (<details>).
// === OMRÅDE ASSISTENT v0.88-dev ===
// v0.88-dev: KORREKTHET — feil tid-kolonne. Ventende-tabellen har REISETID (faktisk hente-/transporttid)
//            OG OPPTID (oppmøte-/behandlingstid, kan være morgentimen for en retur). Koden brukte OPPTID
//            («opp || start» = OPPTID først) → falske tider: BUCH viste 08:50 «SEND UT» selv om henting var
//            11:30; KHILJI viste 10:30 selv om REISETID var 12:45. Nå brukes REISETID som primær tid
//            (lagt i leggets «opp»-felt) overalt: matching-tidsvindu, samkjør-par, hente-frist, «send ut».
// v0.87-dev: (midlertidig) engangs-dump av ventende-kolonner for å kartlegge tid-mappingen — fjernet i 0.88.
// v0.86-dev: KVALITET på samkjør-par. (1) Kortene viser nå full FRA → TIL per pasient (før kun
//            destinasjons-sted — umulig å kvalitetssjekke). (2) beregnPar regner nå ÆRLIG omvei: geokoder
//            BÅDE hentested (fra) og hjem (til), krever hentestedene < 8 km fra hverandre (Oslo sentrum +
//            Ahus = avvist), og bruker korteste kombinerte rute (4 rekkefølger: hent begge → lever begge)
//            − lengste enkelttur — samkjorer.js geografiskMatch. Slutt på falske «+0 min»-par. Par-trakta
//            viser nå «→ hent<8km N». NESTE: trioer (opptil 6 adresser). Også gjelder forslag-kort fra→til.
// === OMRÅDE ASSISTENT v0.85-dev ===
// v0.85-dev: «📡 N nye oppslag»-teller i trakta — viser FAKTISKE nettverkskall (geokod+reisetid) per runde;
//            cache-treff teller 0. Bekrefter at gjentatte tester ikke slår opp på nytt (localStorage 30 d).
//            Grønn=0, gul=>0. Ingen logikkendring.
// === OMRÅDE ASSISTENT v0.84-dev ===
// v0.84-dev: ROTÅRSAK funnet via par-trakta (geokodet 0/0 selv med pool 25 → tid 160 → kap 133): rico.js
//            saboterer Set/Array.from/forEach-innsamling på NISSY-arrays, så adresse-lista ble TOM → haversine
//            hadde ingen koordinater → 0 treff/par. Bygd om adresse-innsamlingen i beregnForslag + beregnPar
//            til rene for-løkker + vanlig objekt (immun mot rico). Nå skal åpenbare par (Ahus→nordover) matche.
// === OMRÅDE ASSISTENT v0.83-dev ===
// v0.83-dev: DIAGNOSE-utvidelse for å finne hvorfor åpenbare par (f.eks. to Ahus→nordover) ikke matches.
//            beregnForslag: besteOmvei + antall tids-OK kombo. beregnPar: egen trakt (pool→tid→kap→geo,
//            beste omvei, geokodet N/M). Vises i 🔎-linja. Logikk uendret — kun innsyn.
// === OMRÅDE ASSISTENT v0.82-dev ===
// v0.82-dev: MATCHING VIRKER IGJEN. Rotårsak til 0 treff: ORS/Google-matrisen ble ~100×120 (12k ruter)
//            og sprengte API-grensa → «matrise-kall feilet». Lagt om til HAVERSINE×VEIFAKTOR (samkjorer.js-
//            stil, gratis/lokalt) i beregnForslag + beregnPar: geokoder D+E (cachet), omvei = (Oslo→D + D→E
//            − Oslo→E) i km → min. Ingen matrise-grense lenger. (2) TEST-grense KANDIDAT_MAKS=40 nærmeste
//            i tid (diag.kappet/brukt vises i trakt). (3) Auto-oppdatering nå CHECKBOX, default AV under test
//            — poll skanner kun når påskrudd; «🔄 Oppdater» = manuell skann. (4) Fiks: rico.js ødela reduce
//            (diag.par viste [object Object]) → forEach. Trakt viser nå også geokodet N/M.
// v0.81-dev: FOKUS PÅ MATCHING (kart nedprioritert). (1) Match-trakt-diagnose: berik()+beregnForslag()
// v0.81-dev: FOKUS PÅ MATCHING (kart nedprioritert). (1) Match-trakt-diagnose: berik()+beregnForslag()
//            logger nå hvor mange som faller bort i hvert ledd (ventende→når området→ledig plass→
//            tidsvindu→treff→par) + «stopp»-grunn, vist som kompakt 🔎-linje i toppen + console
//            (window.__omr_diag). Så vi SER hvorfor matching gir få/ingen treff. (2) «Marker forslag»:
//            kort som inngår i en match får grønn highlight (.harmatch) — ventende m/returbil-treff og
//            returbiler som tar noen. Ingen handling/trioer ennå (Thomas: «først få til matching»).
// v0.80-dev: kart-motor TILBAKE til Leaflet. MapLibre-eksperimentet (v0.67–0.69) tegnet basiskart +
//            markører, men IKKE runtime-tillagte GeoJSON-rute-/punkt-lag i about:blank-popupen (window.open('')
//            + document.write). Hosting av kartet utelukket (ville sendt pasient-/adressedata ut av sikker sone).
//            Leaflet tegner rutene fint i samme popup. Beholdt fra MapLibre-runden: cache-poison-guards i
//            hentKoord/hentRute (forkast [n, NaN]/tomme ruter) + gyldigKoord-validering. Diagnose-instrumentering
//            (_dbg/kartDbgBox/ISOLASJONSTEST-farger) fjernet. Skalering (v0.66) uendret.
// v0.66-dev: skalering for mange operatører — (1) signatur-sjekk hopper over hele den tunge
//            reberegningen (reisetid/matrise/geokod/ruter) når tavla er uendret siden forrige skann;
//            (2) Page Visibility pauser skann + re-rendring når popupen er skjult, og henter friskt
//            straks den blir synlig igjen. Ekstern-API-last var allerede uavhengig av operatørantall
//            (delt server-disk-cache); dette kutter den redundante per-klient-lasten.
// v0.65-dev: localStorage-cache fikk TTL (lsLes/lsSkriv): geokoding 30 d, ruter + kjøretid 7 d. Self-healer
//            hvis «samme adresse-streng, men koordinat/tid er korrigert». Endret adresse bommer uansett på
//            nøkkelen → ny henting. Gammelt format uten tidsstempel forkastes automatisk. Gjelder også omr_rt_.
// v0.64-dev: hentKoord (geokoding) + hentRute (kart-ruter) caches nå i localStorage (omr_kd_/omr_ru_),
//            ikke bare i minnet — overlever F5, så vi slipper HTTP-runden på adresser/ruter vi har sett.
//            (Geokoding caches uansett server-side i 30 dager; dette sparer selve nettverksrunden.)
// v0.63-dev: kompakte 2–4-linjers kart-panelkort med ALLE opplysninger (tid+navn, sted→sted, behov
//            +passasjerer, status, send-ut-frist; returbil: ledig-plass + tur/retur) — så kartet
//            kan erstatte listene på sikt.
// v0.62-dev: kuratert fargepalett (rosa/lilla/mørkegrønn/lyseblå …) tildeles sekvensielt til synlige
//            turer — hver tur i vinduet får unik, navngivbar farge (fikser hash-kollisjoner).
// v0.61-dev: default bakgrunnskart = Lyst grå (klarere). Returbiler veksler punkt ⇄ kjørerute
//            (alltid synlige) i stedet for av/på.
// v0.60-dev: «skjul GD»-filteret fanger nå også ST-biler (samme interne Kongsvinger-type).
// v0.59-dev: startede returbiler EKSKLUDERES IKKE (kan ta pasienter underveis) — vis status
//            (Startet/Framme/Tildelt) høyrestilt på kartets returbil-kort; «startet» grønnmerket.
//            («Framme» = til stede, ikke reist; «Startet» = har reist men kan plukke på veien.)
// v0.58-dev: kart-vindu har kun øvre grense (hentetid ≤ nå + vinduMin), ingen nedre — forfalte
//            ventende forsvinner fra lista når de sendes ut, så de som står igjen skal vises.
// v0.57-dev: kart-vindu tar med forfalte-men-ventende turer (nedre grense nå−180 min) — overtid-
//            turer som fortsatt venter er ofte de mest haster, og forsvant fra kartet før.
// v0.56-dev: returbiler vises som opprinnelsespunkt (🚐-markør) i stedet for full rute — unngår
//            spagetti. Lett koordinat-henter (geokod.php). Klikk på returbil-kort panorerer til punkt.
// v0.55-dev: returbiler skjult på kart som standard — «🚐 returbiler»-avhuking styrer panel + ruter.
// v0.54-dev: rute-synlighet — bakgrunnskart-velger (Mørkt/Kartverket grå/topo/Lyst), halo (casing)
//            under hver rute + tykkere/lysere linjer. Default mørkt kart for maks kontrast.
// v0.53-dev: KARTMODUS (Leaflet + Kartverket-fliser). Tegner hele reiseruten per tur i enkelttur-
//            farge via ruter.php (Geonorge-geokoding + ORS). Liste-paneler som overlay, tidsvindu-
//            slider styrer synlige turer. Toggle 🗺️ Kart / 📋 Liste. Server: geokod.php + ruter.php.
// v0.52-dev: surface SV-varsel (krever bil med ekstra bagasjeplass) på returbil- og par-forslag —
//            bagasje-summen (RU=1, RS=1½; over normal 2.0) krever SV. Bagasje-behov gulfarget badge.
// v0.51-dev: ventende↔ventende-paring (ny «Samkjør to ventende»-seksjon) som fallback når ingen
//            returbil passer — to oppdrag samme retning på én bil. Bruker samme kapasitet/omvei.
// v0.50-dev: grovfiltrer ventende på tidsvindu FØR reisetid/omvei-matrise — av hundrevis ventende
//            er bare en håndfull aktuelle nå (fikser Google-timeout/500). matrise.php tåler/avviser
//            store matriser. Ventetid/send-ut vises på alle kort (default når reisetid ikke beregnes).
// v0.49-dev: område hentes LIVE fra NISSY-senteret (dispatch_center_id → editDispatchCenter
//            fromPostCodes1), med DB-tekst og hardkodet som fallback. Auto-synk med kontorets konfig.
// v0.48-dev: område-soner hentes fra kjørekontorets innstilling (ovr_kontor_tilgang.omraade_postnr
//            via window.__vkt_tilgang), med Oslo/Akershus-soner som fallback.
// v0.47-dev: område-sjekk ser på FØRSTE bens destinasjon (opprinnelig innkjøring), ikke et
//            hvilket som helst ben — så Jessheim↔Gjøvik (ender i Jessheim på retur) ekskluderes.
// v0.46-dev: «vårt område» = kjørekontorets postnr-soner (0000-2099,2150-2151,2160-2167,2170)
//            i stedet for hardkodet ≤1299. Returbil vises/matches kun hvis turen ender her.
// v0.45-dev: Returbiler-lista viser kun biler hvis tur ender i Oslo (kommerTilOslo); turer som
//            aldri når Oslo (Innlandet-interne, f.eks. Jessheim↔Gjøvik) skjules helt.
// v0.44-dev: tur/retur-deteksjon = start-postnr lik slutt-postnr (Oslo-agnostisk; fanger
//            intra-Nord som Jessheim↔Gjøvik). Returbil må komme til Oslo for å matches.
// v0.43-dev: to knapper — Autooppdater (grønn/rød) + Frys (blå m/nedtelling). Frys (re)starter
//            60 s ved hvert trykk; Autooppdater gjenopptar straks med frisk skann.
// v0.42-dev: «❄️ Frys»-knapp pauser auto-oppdatering i 60 s (nedtelling), frisk skann ved tining.
// v0.41-dev: tur/retur ekskluderes IKKE lenger — vi regner restkapasitet (egne returpassasjerer
//            opptar seter, f.eks. LF → 1 plass igjen). Alle biler viser «retur: N av 3 ledig»;
//            kun 0-plass-biler (alenebil/full) dempes og holdes ute av matching.
// v0.40-dev: ledsager-badge kun ved heltall ≥ 1 (skjuler «👥+0,0» fra desimal-L-kolonne).
// v0.39-dev: returbil viser «retur: N av 3 plasser ledig» (tom retur = full kapasitet);
//            innkommende behov/ledsager skjules unntatt for tur/retur (irrelevant for tom retur).
// v0.38-dev: fix fler-bens parse — ledsager = maks per ben (ikke «1»+«1»→«11»), behov-ben skilles.
// v0.37-dev: tooltips (fulle SUTI-navn) på behov-badges + ledsager + tur/retur.
// v0.36-dev: behov-badges også på returbil-kort; behov leses som tekst+ikon (robust);
//            tur/retur samme bil markeres 🔁, dempes og ekskluderes fra samkjør-forslag.
// v0.35-dev: full kapasitetsmodell gjenbrukt fra samkjorer.js — ALLTID_ALENE (RB/ERS/A/AL/TH/IA/
//            C19/TMS/TK), LAAST-setevekter (LB=1.5 bak, LF=0.5), HI/LI-konflikt, bagasje/SV,
//            ledsager (L-kolonne) som ekstra sete. Behov leses fra ikon-alt. Badges viser kodene.
// v0.34-dev: AL (allergibil) = alenebil som A (annen grunn — hundehår/parfyme).
// v0.33-dev: LB opptar hele baksetet (ingen vanlig ved siden av); LF+LB = gyldig 2-kombo.
// v0.32-dev: plass-behov (A/LB/LF/SF) som badge + seteberegning per returbil (maks 1 foran,
//            maks 1 ligge bak, A=alenebil); linjebrudd etter pil også på returbiler.
// v0.31-dev: skjul «TAX» reisemåte på ventende-kort (ikke relevant; HLSX har egen liste).
// v0.30-dev: linjebrudd etter pil på ventende-kort (fra og til på hver sin linje).
// v0.29-dev: checkbox «skjul GD» — interne GD-biler (Kongsvinger) skjules fra Returbiler + forslag.
// v0.14-dev: stoler på NISSYs filtre i stedet for postnr-omklassifisering (som feilklassifiserte og
//            skjulte ventende). Venstre = 18448 ventende, høyre = 17296 pågående. HLSX skjult.
// v0.13: 18448-pågående skjult. v0.8–0.12: per-leg retning via postnr-sett (fjernet, var skjør).
// v0.6: bil-kort. v0.5: merk-knapp. v0.4: HLSX. v0.3: 2x2. v0.2: egen fane. v0.1: forslag.
(function () {
    'use strict';

    const VERSJON = '0.9.90-dev';
    // Interne GD-/ST-biler (kjører i Kongsvinger) er ikke ekte returbiler — kan skjules via checkbox.
    let skjulGD = true;
    let skjulUonsket = true;   // «skjul uønskede» (default på): skjuler lokale + avreiste returbiler.
    let _valgtReise = null;    // resId for turen hvis reise er tegnet i kartet (toggle på kort-klikk).
    let aktivTab = 'nordost';  // 'nordost' (returbiler/ventende) | 'hlsx' (helseekspress Lillehammer).
    let hlsxRetn = 'ut';       // HLSX-retningsfilter (default UT = returer til Lillehammer): 'inn' | 'ut' | 'begge'.
    let HLSX_SETER = 30;       // Helsebussen Lillehammer–Oslo: 30 seter (inkl. ledsagere). TODO: hent fra server-config.
    // Lokal tur = INGEN ben krysser områdegrensa (behandling skjer i området, f.eks. Kongsvinger — ikke Oslo).
    function erLokalTur(r) {
        const legs = r.legs || []; if (!legs.length) return false;
        for (let i = 0; i < legs.length; i++) { if (erVaartOmraade(legs[i].fra) !== erVaartOmraade(legs[i].til)) return false; }
        return true;
    }
    // GD/ST = interne Kongsvinger-biler. LCTMS-GD/CTMS-GD = GD-AVTALE uten tildelt bil ennå (ressursnavn
    // med GD-suffiks, f.eks. «LCTMS-GD .-71608574») — skjules på lik linje med GD-bilene.
    function erGD(r) { const x = r.ressurs || ''; return /^\s*(GD|ST)\b/i.test(x) || /CTMS-GD/i.test(x); }
    function synligeTreff(r) { return (r._treff || []).filter(t => !(skjulGD && erGD(t.pRow))); }
    // Områder å velge mellom. Hvert område = et par dispatch-filtre (inn = Fra, ut = Til).
    // Fylles automatisk fra NISSYs filterliste (par «Fra X» ↔ «Til X»). Denne brukes som
    // fallback hvis auto-detektering ikke finner noe.
    // Hvert område: inn/ut = filtre for tur-listene (ut = ventende «på vei ut», inn = returbiler).
    // kilder = farge-soner (delområder) klassifisert etter destinasjons-postnr (sonens ut-filter).
    let OMRAADER = [
        { navn: 'Nord', inn: '17296', ut: '17295', kilder: [{ navn: 'Nord', ut: '17295', farge: '#3b82f6' }] },
    ];
    let aktivNavn = '', aktivInn = null, aktivUt = null, aktivKilder = [], pollIv = null, visIv = null, sisteData = null;
    let sisteSkannSig = null;  // signatur av forrige skann — hopp over tung reberegning når tavla er uendret
    let bilMatchMap = {};  // returbil-resId → [{v: ventende, t: treff}] (fylles i render)
    let sisteDiag = null;  // match-trakt fra siste berik() (diagnose: hvor faller matchen til null)
    let autoRefresh = true;   // auto-oppdatering PÅ som standard (Thomas) — poll skanner hvert POLL_MS
    let _nettOppslag = 0;     // teller faktiske nettverks-oppslag (geokod/reisetid/ruter) — cache-treff teller IKKE
    let sistePar = [];        // par vist i siste render (anbefalt+andre) — slås opp ved kart-klikk
    let _hasterPaa = {};      // resId → true: ventende-rader som blinker i NISSY (haster) akkurat nå
    let hasterIv = null;      // interval som re-påfører blink i NISSY (overlever NISSYs re-render)
    let _hasterTestTil = 0;   // ms-tidspunkt: tving blink på et par ventende-rader til da (test-knapp)
    let frysTil = 0, frysIv = null;  // pause auto-oppdatering til dette tidspunktet (ms)
    let kartMode = false, kart = null, kartLag = null, casingLag = null, basisLag = null, vinduMin = 120, kartBasis = 'lyst';
    let _hlsxSiste = [];                  // siste HLSX-passasjerer (gjeldende retning) for bussrute-tegning
    let _hlsxFullSig = '', _hlsxKeySig = '';   // anti-flimmer: bygg radene om KUN ved reell endring (ellers oppdater in-place)
    let bussLag = null, _bussruteAktiv = false;  // egen kart-lag for helsebuss-ruta (overlever poll/clearLayers)
    let _bussruteSig = '';                // signatur (reqId-sett) → re-tegn kun ved endring (unngå flimmer ved autorefresh)
    // Checkbox-tilstander (vedvarer i localStorage + overlever autorefresh — derfor checkbox, ikke knapp).
    let bussKartPaa = (function () { try { return localStorage.getItem('oa_hlsx_kart') === '1'; } catch (_) { return false; } })();
    let hlsxSkjulMeld = (function () { try { return localStorage.getItem('oa_hlsx_skjulmeld') === '1'; } catch (_) { return false; } })();
    let returVis = 'punkt';  // hvordan returbiler vises på kart: 'punkt' | 'rute'
    const _ruteCache = {};
    // Bakgrunnskart-valg. casing = halo-farge under rutene (lys på mørkt kart, mørk på lyst).
    const BASISKART = {
        'mørkt':   { navn: 'Mørkt',           url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',                                  casing: 'rgba(255,255,255,.5)' },
        'gråtone': { navn: 'Kartverket grå',  url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png', casing: 'rgba(15,23,42,.6)' },
        'topo':    { navn: 'Kartverket topo', url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',          casing: 'rgba(255,255,255,.65)' },
        'lyst':    { navn: 'Lyst grå',        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',                                 casing: 'rgba(15,23,42,.6)' },
    };
    const OMRAADE_FARGER = { 'nord': '#3b82f6', 'østfold': '#f97316', 'sør': '#22c55e', 'vest': '#a855f7', 'glåmdalen': '#eab308' };
    function fargeFor(navn) { return OMRAADE_FARGER[String(navn || '').toLowerCase()] || '#64748b'; }
    const POLL_MS = 120000;   // full NISSY-skann hvert 120. sek (Thomas)
    const FRYS_MS = 60000;   // hvor lenge «❄️ Frys» pauser oppdatering
    const MATCH_TIDSVINDU_MIN = 45;
    const NAVN = 'OMRÅDE-ASSISTENT';
    const NISSY_BLAA = 'rgb(148, 169, 220)';
    const SERVER = 'https://thomaswestby.no/skript';
    const VENTETID_MIN = 60;  // ventetid = maks(reisetid, dette) minutter
    const MAKS_VENTETID_MIN = 180;  // øvre grense for ventetid i grovfilteret (før reisetid er kjent)
    const VARSEL_MIN = 25;    // «send ut»-varsel så mange minutter før hente-fristen
    const OMVEI_MAKS_MIN = 20; // godtatt ekstra omvei (min) for å ta en pasient på vei til returmål
    const PAR_OMVEI_MAKS_MIN = 30; // godtatt omvei (min) når to ventende samkjøres direkte (uten returbil)
    const VEIFAKTOR = 1.3;     // luftlinje × dette ≈ kjøreavstand (samkjorer.js-stil)
    const OMVEI_KMH = 50;      // antatt snittfart for å gjøre omvei-km → minutter
    const MAKS_HENTEAVSTAND_KM = 8; // to ventende kan kun samkjøres hvis hentestedene er nærmere enn dette
    const KANDIDAT_MAKS = 40;  // TEST-grense: maks ventende vi geokoder/matcher per runde (hold lasten nede)
    const OSLO_KOORD = [59.9139, 10.7522]; // Oslo sentrum — felles anker for omvei-beregning
    const PAR_VINDU_MIN = 120;     // se etter ventende-par med hentetid innen så mange min fram
    const PAR_MAKS = 30;           // maks ventende i par-poolen (ytelse; de soonere etter hentetid)

    /* ── XHR ───────────────────────────────────────── */
    function xhr(url) {
        return new Promise((res, rej) => {
            const r = new XMLHttpRequest();
            r.open('GET', url, true);
            r.timeout = 20000;
            r.onload = () => res(r.responseText);
            r.onerror = () => rej(new Error('xhr-feil: ' + url));
            r.ontimeout = () => rej(new Error('timeout: ' + url));
            r.send();
        });
    }

    function hentPostnr(t) { if (!t) return null; const m = String(t).match(/\b(\d{4})\b/); return m ? m[1] : null; }
    function parseTid(s) { if (!s) return null; const m = String(s).trim().match(/(\d{1,2})[:.](\d{2})\s*$/); return m ? (+m[1]) * 60 + (+m[2]) : null; }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    function erHlsx(r) { return (r.legs || []).some(l => /HLSX/i.test(l.rmate || '')); }
    // EKTE helsebuss (Lillehammer–Oslo): bussen har KUN TO Oslo-terminaler — Rikshospitalet (RH) og Ullevål
    // (kilde: helsenorge stoppestedsliste). En ekte buss-tur har derfor ALLTID RH/Ullevål som ett endepunkt
    // (det andre = pasientens hjem/stopp i korridoren). FRABRINGERE i Kongsvinger-korridoren («Esso Express
    // Oppaker» → Ahus-Lørenskog) er HLSX-merket men går til AHUS, ikke RH/Ullevål → ekskluderes. (Buss-stopp
    // Gardermoen/Olavsgaard/Skedsmo ligger INNENFOR OoA, så «krysser-grensa» bommer — derfor terminal-match.)
    function erBussTerminal(adr) { const a = adr || ''; return /rikshospital|ullev[åa]l/i.test(a) || /(^|[\s,\/])RH(?=[\s,\/]|$)/i.test(a); }
    // Helsebussen drar fra/ankommer KUN to Oslo-terminaler → navn for gruppe-overskrift (i stedet for avreisetid).
    // Radiumhospitalet (0379): pasienten bringes med INTERNBUSS til Rikshospitalet og tar helsebussen DER — turen
    // splittes IKKE (ingen egen frabringer-taxi på Oslo-enden). Grupperes derfor under Rikshospitalet.
    // Match på sykehusenes POSTNR (adressen mangler ofte selve navnet — bare «… 0450 Oslo»):
    // Rikshospitalet 0372 · Radiumhospitalet 0379 (→ internbuss til RH) · Ullevål 0450.
    function hlsxTerminalNavn(adr) {
        const a = adr || ''; const p = hentPostnr(a);
        if (/radiumhospital/i.test(a) || p === '0379') return 'Rikshospitalet';
        if (/rikshospital/i.test(a) || /(^|[\s,\/])RH(?=[\s,\/]|$)/i.test(a) || p === '0372') return 'Rikshospitalet';
        if (/ullev[åa]l/i.test(a) || p === '0450') return 'Ullevål';
        return null;
    }
    // INNLANDET-endepunkt (helsebuss-korridoren nord): postnr innenfor Pasientreiser Innlandets FAKTISKE område
    // (auto-høstet fra NISSY, lastInnlandet → kjorekontor.php?alle; fallback INNLANDET_FALLBACK). Rendalen 2485 =
    // Innlandet; Oppaker 2166 / Ahus-Lørenskog 1474 = IKKE Innlandet → frabringere ekskluderes. («Leveringssted må
    // være innenfor Innlandet sine postnummer» — Thomas.)
    function erInnlandet(adr) { const p = hentPostnr(adr); return p ? iSett(p, INNLANDET_POSTNR) : false; }
    // To-trinns ID: (1) CALLSIGN — tildelt buss har ressurs «HLSB …» (HelseBuss; her HLSB L-O), sikreste
    // signal for pågående. (2) INNLANDET-ENDEPUNKT — ventende (uten ressurs) der ett ben starter/ender i
    // Innlandet (2200–2999, utenfor OoA). Bussen EIES av Innlandet (avtaleområde 901 HLSB LHMR-OSLO, starter
    // Lillehammer); OoA legger på RETURENE i Oslo (derfor default 'ut'). Dette ekskluderer Oppaker→Ahus/RH-
    // frabringerne (intra-Akershus, ingen Innlandet-ende) men beholder Lovisenberg→Rendalen (Innlandet-ende).
    // TODO: callsign-prefiks + avtaleområde + terminaler + seter + Innlandet-postnr fra server-config pr buss.
    function erHelsebuss(r) {
        if (!erHlsx(r)) return false;
        if (/^\s*HLSB\b/i.test(r.ressurs || '')) return true;                                          // callsign = på bussen
        return (r.legs || []).some(l => erInnlandet(l.fra) || erInnlandet(l.til));                      // Innlandet-endepunkt
    }
    /* ── Plass/kapasitet — gjenbruk av samkjører-modellen (samkjorer.js) ── */
    // Behov som krever alenetransport (kan aldri samkjøres med andre).
    const ALLTID_ALENE = ['RB', 'ERS', 'A', 'AL', 'TH', 'IA', 'C19', 'TMS', 'TK'];
    // Behov uten plass-konsekvens — ignoreres i kapasitetsregnskapet.
    const IGNORER = ['LIFO', 'VA', '4X4', 'HJE', 'MH', 'TB', 'ØH', 'B'];
    const KONFLIKTER = [['HI', 'LI']];  // høy + lav innstigning kan ikke kombineres
    const MAKS = { forsete: 1.0, baksete: 2.0, bagasje: 2.0, bagasjeSV: 3.0, passasjerer: 3 };
    // «Låste» behov med fast seteforbruk (brøk = opptar mer enn ett sete).
    const LAAST = {
        SF:  { forsete: 1.0, baksete: 0,   bagasje: 0 },  // sitte foran
        LF:  { forsete: 1.0, baksete: 0.5, bagasje: 0 },  // god benplass/regulerbart sete (foran)
        LB:  { forsete: 0,   baksete: 1.5, bagasje: 0 },  // trenger hele baksetet
        BS:  { forsete: 0,   baksete: 1.0, bagasje: 0 },  // barnesete
        BSP: { forsete: 0,   baksete: 1.0, bagasje: 0 },  // sittepute
    };
    const BAGASJE = { RU: 1.0, RS: 1.5 };
    const ALLE_BEHOV = ALLTID_ALENE.concat(IGNORER, ['HI', 'LI', 'SF', 'LF', 'LB', 'BS', 'BSP', 'RU', 'RS', 'SV']);
    function parseBehov(tekst) {
        if (!tekst) return [];
        return tekst.toUpperCase().split(/[\s,/+]+/).filter(b => b.length > 0 && ALLE_BEHOV.includes(b));
    }
    // Kapasitetssjekk for et SETT passasjerer (1+ ledsager teller som fleksibelt sete).
    function kapasitetsSjekk(passasjerer) {
        if (passasjerer.length > MAKS.passasjerer) return { ok: false, grunn: 'Maks ' + MAKS.passasjerer + ' passasjerer' };
        for (const p of passasjerer) for (const b of p.behov) if (ALLTID_ALENE.includes(b)) return { ok: false, grunn: b + ' krever alenetransport' };
        const alle = [].concat(...passasjerer.map(p => p.behov));
        for (const kf of KONFLIKTER) if (alle.includes(kf[0]) && alle.includes(kf[1])) return { ok: false, grunn: kf[0] + '+' + kf[1] + ' går ikke' };
        const filtrert = passasjerer.map(p => ({ behov: p.behov.filter(b => !IGNORER.includes(b)), harLedsager: p.harLedsager }));
        let forsete = 0, baksete = 0, bagasje = 0; const fleksible = [];
        filtrert.forEach(pass => {
            let erLaast = false, laastType = null;
            for (const b of pass.behov) { if (LAAST[b]) { laastType = b; forsete += LAAST[b].forsete; baksete += LAAST[b].baksete; bagasje += LAAST[b].bagasje; erLaast = true; break; } }
            if (erLaast && (laastType === 'BS' || laastType === 'BSP')) baksete += 1.0;
            else if (erLaast && pass.harLedsager) fleksible.push(1);
            for (const b of pass.behov) if (BAGASJE[b]) bagasje += BAGASJE[b];
            if (!erLaast) { fleksible.push(1); if (pass.harLedsager) fleksible.push(1); }
        });
        for (let i = 0; i < fleksible.length; i++) {
            if (baksete + 1.0 <= MAKS.baksete) baksete += 1.0;
            else if (forsete + 1.0 <= MAKS.forsete) forsete += 1.0;
            else return { ok: false, grunn: 'Ikke nok seter' };
        }
        if (forsete > MAKS.forsete) return { ok: false, grunn: 'Forsete overfylt' };
        if (baksete > MAKS.baksete) return { ok: false, grunn: 'Baksete overfylt' };
        if (bagasje > MAKS.bagasjeSV) return { ok: false, grunn: 'For mye bagasje' };
        return { ok: true, svVarsel: bagasje > MAKS.bagasje };
    }
    const BEHOV_FARGE = code => ALLTID_ALENE.includes(code) ? '#ef4444' : (LAAST[code] ? '#f59e0b' : (BAGASJE[code] ? '#eab308' : '#0ea5e9'));
    // Fulle SUTI-navn for tooltip (kodene er små/kryptiske).
    const BEHOV_NAVN = {
        AL: 'Allergi', BS0: 'Babystol 0–13 kg', BS5: 'Barnesete spesial 15–36 kg',
        BS4: 'Barnestol 15–25 kg', BS1: 'Barnestol 9–18 kg', BS: 'Barnesete',
        LIFO: 'Direktebil', SV: 'Ekstra bagasjeplass', ERS: 'Elektrisk rullestol',
        '4X4': 'Firehjulstrekk', TH: 'Førerhund/servicehund', LF: 'God benplass og regulerbart sete',
        HJE: 'Hjelpes til/fra transportmiddel', HI: 'Høy innstigning', C19: 'Korona relatert',
        LI: 'Lav innstigning', TB: 'Manuell håndtering', MH: 'Manuell håndtering (NY)',
        B: 'Må bæres', IA: 'Må ikke overlates til seg selv', VA: 'Beskyttet/fullvaksinert',
        RU: 'Rullator', RB: 'Rullestolbil', RS: 'Sammenleggbar rullestol', SF: 'Sitte foran',
        BSP: 'Sittepute', TMS: 'Ta med rullestol/transportstol', TK: 'Trappeklatrer',
        LB: 'Trenger hele baksetet', 'ØH': 'Øyeblikkelig hjelp', A: 'Alenebil',
    };
    function behovBadges(r) {
        return (r._behov || []).filter(b => !IGNORER.includes(b))
            .map(b => '<span class="b" title="' + esc(BEHOV_NAVN[b] || b) + '" style="background:' + BEHOV_FARGE(b) + '33;color:' + BEHOV_FARGE(b) + '">' + b + '</span>').join('');
    }
    function ledsBadge(r) { const n = parseInt(r._ledsN, 10) || 0; return n >= 1 ? '<span class="b" title="Antall reiseledsagere" style="background:#33415566;color:#cbd5e1">👥+' + n + '</span>' : ''; }
    function passObj(r) { return { behov: r._behov || [], harLedsager: (parseInt(r._ledsN, 10) || 0) >= 1 }; }
    // Passasjerer som ALLEREDE sitter på returen (opptar seter). Et retur-ben = en pasient som kjøres FRA
    // området UT av området (samme predikat som returStatus): erVaartOmraade(fra) && !erVaartOmraade(til).
    // Hvert slikt ben = én pasient (med sitt behov). Fallback: enkel tur/retur (samme pasient som kjøres hjem).
    function egneReturPassasjerer(r) {
        const ut = [];
        const legs = r.legs || [];
        for (let i = 0; i < legs.length; i++) {
            const l = legs[i];
            if (erVaartOmraade(l.fra) && hentPostnr(l.til) && !erVaartOmraade(l.til)) ut.push({ behov: parseBehov(l.behov || ''), harLedsager: false });
        }
        if (ut.length) return ut;
        return erTurRetur(r) ? [passObj(r)] : [];
    }
    // Hvor mange ekstra vanlige passasjerer får plass i tillegg til base-lasten
    // (setevekter: LF tar foran + ½ bak → kun 1 igjen, alenebil → 0, osv.).
    function ledigePlasser(base) {
        let n = 0;
        while (n < MAKS.passasjerer) {
            const sett = base.concat(Array(n + 1).fill({ behov: [], harLedsager: false }));
            if (sett.length >= 2 && !kapasitetsSjekk(sett).ok) break;
            n++;
        }
        return n;
    }
    // Greedy-fyll av returbilens RESTkapasitet med matchede ventende. base = bilens egne
    // returpassasjerer (tur/retur) som allerede sitter; kandidatene legges oppå.
    function fyllBil(base, kandidater) {
        kandidater.sort((a, b) => (parseTid((a.v.legs[0] || {}).opp) ?? 9999) - (parseTid((b.v.legs[0] || {}).opp) ?? 9999) || a.t.omvei - b.t.omvei);
        const tatt = [], avvist = [];
        kandidater.forEach(k => {
            const sett = base.concat(tatt.concat(k).map(x => passObj(x.v)));
            if (sett.length <= 1 || kapasitetsSjekk(sett).ok) tatt.push(k);
            else avvist.push(k);
        });
        // Trenger settet bil med ekstra bagasjeplass (SV)? (bagasje over normal 2.0, men ≤ 3.0)
        const sluttSett = base.concat(tatt.map(k => passObj(k.v)));
        const sv = sluttSett.length ? !!kapasitetsSjekk(sluttSett).svVarsel : false;
        return { tatt, avvist, sv };
    }
    // Samme tur kan treffe flere kilde-filtre (overlapp). Behold første forekomst.
    function dedupResId(arr) {
        const seen = new Set();
        return arr.filter(r => { if (seen.has(r.resId)) return false; seen.add(r.resId); return true; });
    }
    function parsePostnrSett(str) {
        const ranges = [];
        String(str || '').split(',').forEach(del => {
            const t = del.trim(); if (!t) return;
            const m = t.match(/^(\d{4})\s*-\s*(\d{4})$/);
            if (m) ranges.push([+m[1], +m[2]]);
            else if (/^\d{4}$/.test(t)) ranges.push([+t, +t]);
        });
        return ranges;
    }
    function iSett(postnr, ranges) { const n = +postnr; return (ranges || []).some(r => n >= r[0] && n <= r[1]); }
    // Stedsnavn fra adresse = ordet/ordene etter postnr ("…, 2614 Lillehammer" → "Lillehammer").
    function stedFraAdr(adr) { const m = String(adr || '').match(/\b\d{4}\s+(.+?)\s*$/); return m ? m[1].trim() : ''; }
    // "postnr sted" fra adresse — for geokoding/kjøretid ("…, 2614 Lillehammer" → "2614 Lillehammer").
    function postnrSted(adr) { const m = String(adr || '').match(/\b\d{4}\s+.+?$/); return m ? m[0].trim() : String(adr || '').trim(); }
    function fmtMin(m) { m = Math.round(m); const h = Math.floor(m / 60), mm = m % 60; return h ? (h + ' t' + (mm ? ' ' + mm + ' min' : '')) : (mm + ' min'); }
    function tidStr(min) { min = Math.round(((min % 1440) + 1440) % 1440); const h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
    function naaMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
    // Returbil: returmål = FØRSTE hentested (tidligst hentetid) — dit bilen skal tilbake.
    // Ankomst Oslo = seneste oppmøtetid (når den er ferdig levert og ledig for retur).
    // Eks: henter Lillehammer (07:30) → Hamar (08:10) → leverer Oslo → returmål = Lillehammer.
    function returInfo(r) {
        let forsteFra = '', forsteT = Infinity, sentOpp = -Infinity, sentTil = '';
        (r.legs || []).forEach(l => {
            const s = parseTid(l.start || l.opp);
            if (s !== null && s < forsteT) { forsteT = s; forsteFra = l.fra; }
            const o = parseTid(l.opp || l.start);
            if (o !== null && o > sentOpp) { sentOpp = o; sentTil = l.til; }  // hub = der bilen er nå (siste innkjørings til)
        });
        if (!forsteFra) forsteFra = (r.legs[0] || {}).fra || '';
        if (!sentTil) sentTil = (r.legs[(r.legs || []).length - 1] || {}).til || '';
        return { fra: forsteFra, hub: sentTil, postnr: hentPostnr(forsteFra), ank: sentOpp > -Infinity ? sentOpp : null };
    }
    // Kjørekontorets område (postnr-soner). Kilderekkefølge (lastOmraade):
    //   1) LIVE fra NISSY-senteret (window.__vkt_tilgang.dispatch_center_id → editDispatchCenter
    //      → fromPostCodes1) — auto-synk med kontorets egen konfig.
    //   2) Lagret tekst (window.__vkt_tilgang.omraade_postnr) hvis live-henting feiler.
    //   3) Hardkodet fallback hvis verktøykassen ikke har eksponert tilgang.
    // En returbil er relevant kun hvis den OPPRINNELIGE turen (første ben = innkjøring til
    // behandling) ender i området — returbenet kan ende i området likevel (Jessheim↔Gjøvik).
    const OMRAADE_FALLBACK = '0000-2099,2150-2151,2160-2167,2170';
    let OMRAADE_POSTNR = parsePostnrSett(OMRAADE_FALLBACK);
    let omraadeLastet = false;
    async function lastOmraade() {
        if (omraadeLastet) return;
        omraadeLastet = true;
        const t = (function () { try { return window.__vkt_tilgang || {}; } catch (e) { return {}; } })();
        let kilde = 'fallback';
        const senterId = t.dispatch_center_id;
        if (senterId) {
            try {
                const html = await xhr('/administrasjon/admin/editDispatchCenter?id=' + encodeURIComponent(senterId) + '&t=' + Date.now());
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const e = doc.querySelector('[name="dispatchFilter.fromPostCodes1"]');
                const sett = parsePostnrSett(e ? (e.textContent || e.value || '') : '');
                if (sett.length) { OMRAADE_POSTNR = sett; kilde = 'NISSY-senter ' + senterId; }
            } catch (e) { console.warn('[' + NAVN + '] live område-henting feilet:', e.message); }
        }
        if (kilde === 'fallback' && t.omraade_postnr) {
            const sett = parsePostnrSett(t.omraade_postnr);
            if (sett.length) { OMRAADE_POSTNR = sett; kilde = 'DB-innstilling'; }
        }
        console.log('[' + NAVN + '] område lastet (' + kilde + '): ' + OMRAADE_POSTNR.length + ' soner');
    }
    function erVaartOmraade(adr) { const p = hentPostnr(adr); return p ? iSett(p, OMRAADE_POSTNR) : false; }
    // Pasientreiser Innlandet sitt FAKTISKE område (id 14802), auto-høstet fra NISSY. Brukes til å avgjøre om en
    // HLSX-tur har et Innlandet-endepunkt (= ekte helsebuss, ikke en Akershus-frabringer). Fallback fra høstet
    // verdi 2026-06-26: starter 2266 (OoA slutter 2265) + to Buskerud-grense-outliers.
    const INNLANDET_FALLBACK = '2266-2999,3522,3528';
    let INNLANDET_POSTNR = parsePostnrSett(INNLANDET_FALLBACK);
    let innlandetLastet = false;
    async function lastInnlandet() {
        if (innlandetLastet) return;
        innlandetLastet = true;
        try {
            const d = await (await fetch(SERVER + '/kjorekontor.php?alle')).json();
            const k = (d && d.kontorer || []).find(x => /innlandet/i.test(x.navn || '') || String(x.id) === '14802');
            const sett = parsePostnrSett(k ? (k.omraade || '') : '');
            if (sett.length) { INNLANDET_POSTNR = sett; console.log('[' + NAVN + '] Innlandet-område lastet (' + (k.navn || k.id) + '): ' + sett.length + ' soner'); }
        } catch (e) { console.warn('[' + NAVN + '] Innlandet-område-henting feilet (bruker fallback):', e.message); }
    }
    function forsteBen(r) {
        return (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999))[0] || null;
    }
    function kommerTilOmraadet(r) { const f = forsteBen(r); return !!f && erVaartOmraade(f.til); }
    // Tur/retur samme bil: bilen ender der den startet (start-postnr = slutt-postnr) →
    // pasienten kjører tilbake og opptar seter på returen. Oslo-agnostisk (gjelder også
    // intra-Nord-turer som Jessheim→Gjøvik→Jessheim).
    function erTurRetur(r) {
        const legs = (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999));
        if (legs.length < 2) return false;
        const start = hentPostnr(legs[0].fra), slutt = hentPostnr(legs[legs.length - 1].til);
        return !!start && start === slutt;
    }
    // Bilens nåværende status: status på det utgående benet (returen) hvis det finnes, ellers
    // siste bens status. «Startet» = har reist (kan ta pasienter underveis), «Framme» = til stede,
    // «Tildelt»/«Akseptert» = planlagt men ikke kjørt.
    function returStatus(r) {
        const legs = (r.legs || []).slice().sort((a, b) => (parseTid(a.start || a.opp) ?? 9999) - (parseTid(b.start || b.opp) ?? 9999));
        const utg = legs.find(l => erVaartOmraade(l.fra) && hentPostnr(l.til) && !erVaartOmraade(l.til));
        return ((utg && utg.status) || (legs[legs.length - 1] || {}).status || '').trim();
    }

    /* ── RETUR-SJEKK (baby step 1) ──────────────────────
       En rekvisisjon går ÉN vei. Retur = en EGEN rekvisisjon på samme pnr. Så for pasientene som
       sitter på en pågående bil sjekker vi: reqId → pnr → alle pasientens rekvisisjoner → finnes en
       med retning «Fra behandling» (= retur)? Speiler verktøykassens hentRekvisisjon + sokPnrINissy.
       Baby step: logger kun i konsollen for å verifisere datastien (ingen UI på kortet ennå). */
    // SUTI-livssyklus fra «Suti kode»-tabellen i ajax_reqdetails. Livssyklus-koden ligger i «Suti
    // attributt»-kolonnen (<nobr>1709/1701/1702</nobr>), IKKE «Suti kode» (4010=posisjonsmelding). Radene
    // er «SutiMsgReceived» (ikke «Bekreftet» — derav tidligere tom parse). Koder FASIT fra Overvåker Live:
    //   1709 = bil framme · 1701 = hentet (pasient i bil) · 1702 = LEVERT (avlevert) · 1703 = bomtur.
    // SAMKJØRING: hver passasjer har EGEN RekvisisjonsNr (12-sifret, kol 7) med sin egen framme/hentet/
    // levert-sekvens. Vi grupperer derfor pr RekvisisjonsNr — ellers «smitter» én passasjers 1702 til alle.
    // Klipper alt etter første <hr> (eldre/slettede ressurser). Returnerer bil-nivå (siste) + grupper.
    function omrParseSuti(html) {
        const out = { fremme: false, fremmeTid: '', hentet: false, hentetTid: '', levert: false, levertTid: '', bomtur: false, noenRader: false, grupper: [], seksjon: false };
        const sutiIdx = html.indexOf('Suti kode');
        if (sutiIdx < 0) return out;
        out.seksjon = true;
        let area = html.substring(sutiIdx);
        const hr = area.indexOf('<hr'); if (hr > -1) area = area.substring(0, hr);
        const rader = []; const rx = /<tr[^>]*>([\s\S]*?)<\/tr>/gi; let m;
        while ((m = rx.exec(area)) !== null) {
            const rad = m[1];
            const tm = rad.match(/(\d{2})[\/.](\d{2})[\/.](\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);   // tolerant for / og .
            if (!tm) continue;
            const attrM = rad.match(/<nobr>\s*(1701|1702|1703|1709)\s*<\/nobr>/);                 // livssyklus-kode (Suti attributt)
            if (!attrM) continue;                                                                 // kun livssyklus-rader
            const rekvM = rad.match(/<nobr>\s*(\d{12})\s*<\/nobr>/);                              // RekvisisjonsNr = 12 siffer
            rader.push({ ms: new Date(+tm[3], +tm[2] - 1, +tm[1], +tm[4], +tm[5], +tm[6]).getTime(), kl: tm[4] + ':' + tm[5], attr: attrM[1], rekv: rekvM ? rekvM[1] : '' });
        }
        out.noenRader = rader.length > 0;
        rader.sort((a, b) => a.ms - b.ms);
        const g = {};
        for (let i = 0; i < rader.length; i++) {
            const r = rader[i];
            if (!g[r.rekv]) g[r.rekv] = { rekv: r.rekv, frammeTid: '', hentetTid: '', levertTid: '', bomtur: false };
            if (r.attr === '1709') { g[r.rekv].frammeTid = r.kl; out.fremme = true; out.fremmeTid = r.kl; }
            if (r.attr === '1701') { g[r.rekv].hentetTid = r.kl; out.hentet = true; out.hentetTid = r.kl; }
            if (r.attr === '1702') { g[r.rekv].levertTid = r.kl; g[r.rekv].bomtur = false; out.levert = true; out.levertTid = r.kl; }
            if (r.attr === '1703') { g[r.rekv].bomtur = true; out.bomtur = true; }
        }
        out.grupper = Object.keys(g).map(k => g[k]);
        return out;
    }
    // Koble ÉN passasjer til sin SUTI-gruppe via hentetid: gruppen hvis hentet (1701, ev. framme) ligger
    // nærmest pasientens planlagte hentetid (fra «Pasient klar fra» / tur-leggets tid). Krever ≤90 min
    // nærhet for å unngå feilkobling. Løser samkjøring der admin-loggen er FELLES for hele bilen.
    function omrMatchGruppe(suti, hentetidMin) {
        if (!suti || !suti.grupper || !suti.grupper.length || hentetidMin == null) return null;
        let best = null, bestDiff = Infinity;
        for (let i = 0; i < suti.grupper.length; i++) {
            const grp = suti.grupper[i];
            const ref = grp.hentetTid || grp.frammeTid;
            const tMin = ref ? parseTid(ref) : null;
            if (tMin == null) continue;
            const d = Math.abs(tMin - hentetidMin);
            if (d < bestDiff) { bestDiff = d; best = grp; }
        }
        return (best && bestDiff <= 90) ? best : null;
    }
    // Tabell-status (STATUS-kolonnen, per passasjer — SAMME kilde som Overvåker Live) → symbol/farge.
    // Gratis (ingen admin-kall). En SYNLIG tur-status på en pågående rad betyr at turen IKKE er levert
    // ennå (levert tur faller ut av pågående). «Startet» = bil har reist med pasienten (på vei inn).
    function omrTabellStatusSym(s) {
        const x = (s || '').toLowerCase();
        if (/startet/.test(x))            return { sym: '🚐', kort: 'På vei inn',  tip: 'Startet — bil har reist med pasienten (på vei inn, ikke levert ennå)', farge: '#f59e0b' };
        if (/framme/.test(x))             return { sym: '📍', kort: 'Framme',      tip: 'Framme — bil ved hentested (pasient ikke hentet ennå)', farge: '#38bdf8' };
        if (/ikke\s*m/.test(x))           return { sym: '⛔', kort: 'Ikke møtt',   tip: 'Ikke møtt', farge: '#f87171' };
        if (/tildelt|akseptert/.test(x))  return { sym: '·',  kort: (s || ''),     tip: s || 'tildelt', farge: '#94a3b8' };
        if (!x)                           return { sym: '',   kort: '',            tip: '', farge: '' };
        return { sym: '·', kort: s, tip: s, farge: '#cbd5e1' };
    }
    // BUSS-spesifikk status (HLSX-lista): «Startet» = pasienten har gått PÅ bussen og den ruller → grønn «om bord».
    // «Framme» = buss ved terminalen (pasient ikke om bord ennå). «Akseptert/Tildelt» = venter på å gå på.
    function hlsxStatusVis(s) {
        const x = (s || '').toLowerCase();
        if (/startet/.test(x))           return { sym: '🚌', txt: 'om bord', f: '#22c55e', tip: 'Startet — pasienten er om bord, bussen ruller' };
        if (/framme/.test(x))            return { sym: '📍', txt: 'buss framme', f: '#38bdf8', tip: 'Framme — buss ved terminalen, pasient ikke om bord ennå' };
        if (/ikke\s*m/.test(x))          return { sym: '⛔', txt: 'ikke møtt', f: '#f87171', tip: 'Ikke møtt' };
        if (/tildelt|akseptert/.test(x)) return { sym: '⏳', txt: 'venter', f: '#94a3b8', tip: (s || 'tildelt') + ' — ikke om bord ennå' };
        return { sym: '', txt: '', f: '', tip: '' };
    }
    // Kort, lesbar status-streng + symbol av SUTI-stadiet (til pasient-tooltip på returbil-kortene).
    function omrLevertStatus(suti, fallbackStatus) {
        if (!suti) return { sym: '', kort: '', tip: fallbackStatus || '' };
        if (suti.levert)  return { sym: '✓', kort: 'Levert ' + suti.levertTid, tip: 'LEVERT ' + suti.levertTid + ' — bilen er fri', farge: '#22c55e' };
        if (suti.hentet)  return { sym: '🚐', kort: 'I bil ' + suti.hentetTid, tip: 'Hentet ' + suti.hentetTid + ' — i bil, IKKE levert ennå', farge: '#f59e0b' };
        if (suti.fremme)  return { sym: '📍', kort: 'Framme ' + suti.fremmeTid, tip: 'Bil framme ' + suti.fremmeTid + ' — ikke hentet ennå', farge: '#38bdf8' };
        if (suti.bomtur)  return { sym: '⚠', kort: 'Bomtur', tip: 'Bomtur', farge: '#f87171' };
        return { sym: '·', kort: (fallbackStatus || 'planlagt'), tip: fallbackStatus || 'ikke startet', farge: '#94a3b8' };
    }
    // reqId → { pnr, retning, dato } via admin ajax_reqdetails. SPEILER OVERVÅKER LIVE: tripid=resId
    // (ikke reqId!) + label «Personnummer:» (NISSY skriver IKKE «Personnr»). pnr forlater aldri verktøyet.
    async function omrHentRekvDetalj(reqId, resId) {
        try {
            const tripid = resId || reqId;
            const html = await xhr('/administrasjon/admin/ajax_reqdetails?id=' + reqId + '&db=1&tripid=' + tripid + '&showSutiXml=true&hideEvents=&full=true&t=' + Date.now());
            if (!html || html.length < 500) return null;
            const pnrM = html.match(/Personnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i) || html.match(/F[øo]dselsnummer:<\/td>\s*<td[^>]*>\s*(\d{11})/i);
            const pnr = pnrM ? pnrM[1] : '';
            // Pasientnavn = første «Navn:» (før «Hentested») — hver passasjer fra sin egen rekvisisjon.
            const pasDel = html.indexOf('Hentested') > -1 ? html.substring(0, html.indexOf('Hentested')) : html;
            const navnM = pasDel.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const navn = navnM ? navnM[1].replace(/\s+/g, ' ').trim() : '';
            const retnM = html.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
            const retning = retnM ? retnM[1].replace(/\s+/g, ' ').trim() : '';
            // Status + reisetidspunkt — for å skille BESTILT (har klar-fra) fra ÅPEN (ingen klar-fra).
            const statM = html.match(/Rekvisisjonsstatus:<\/td>\s*<td[^>]*>\s*(?:<b>\s*)?([^<]+)/i);
            const status = statM ? statM[1].replace(/\s+/g, ' ').trim() : '';
            const klarM = html.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]*)/i);
            const klarFra = klarM ? klarM[1].replace(/\s+/g, ' ').trim() : '';
            // Reisedato = dato-delen av «Pasient klar fra» (FAKTISK reisetidspunkt). IKKE første DD.MM i
            // HTML-en — den kan være en annen dato (= «feil dato»-buggen). Fallback til første DD.MM.ÅÅ.
            let dato = '';
            const kd = klarFra.match(/\b(\d{2})\.(\d{2})\.(\d{2,4})\b/);
            if (kd) dato = kd[1] + '.' + kd[2] + '.' + kd[3].slice(-2);
            else { const dm = html.match(/\b(\d{2}\.\d{2}\.\d{2})\b/); dato = dm ? dm[1] : ''; }
            // Hentested-postnr (for frabringer-match: frabringerens FRA = bussens TIL = samme stopp/postnr).
            // Strip HTML-tagger først, så hent postnr (4 siffer foran et stedsnavn) etter «Hentested»-labelen.
            let fraPostnr = '', _hentDbg = '';
            const hi = html.indexOf('Hentested');
            if (hi > -1) { const seg = html.substring(hi, hi + 500).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); _hentDbg = seg.slice(0, 150); const pm = seg.match(/(\d{4})\s+[A-Za-zÆØÅ]/); fraPostnr = pm ? pm[1] : ''; }
            else { _hentDbg = '(ingen Hentested-label i HTML)'; }
            // Meldingsfelt — viktig kontekst for helsebuss (hvilket stopp/avgang, interbuss, frabringer osv.).
            const rens = s => s ? s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '';
            const m1 = html.match(/Melding til pasientreisekontoret:?\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
            const meldingPRK = m1 ? rens(m1[1]) : '';
            const m2 = html.match(/Melding til transport[øo]ren:?\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
            const meldingTR = m2 ? rens(m2[1]) : '';
            // Ledsager — AUTORITATIVT pr passasjer (planleggings-L-kolonnen er pr RESSURS/samkjørt bil, ikke pr
            // pasient). Prøv label-varianter i admin-detaljen + noOfCompanions-feltet. _ledsDbg = HTML-utdrag
            // rundt «ledsag/companion» for å verifisere/justere label mot ekte data.
            let ledsager = -1, _ledsDbg = '';
            const lm = html.match(/(?:Antall\s+)?(?:reise)?ledsager(?:e)?\s*:?\s*<\/td>\s*<td[^>]*>\s*<?[^>]*>?\s*(\d+)/i)
                    || html.match(/noOfCompanions[^>]*value\s*=\s*["']?(\d+)/i);
            if (lm) ledsager = parseInt(lm[1], 10);
            const li = html.search(/ledsag|companion/i);
            if (li > -1) _ledsDbg = html.substring(Math.max(0, li - 60), li + 120).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
            else _ledsDbg = '(ingen ledsag/companion i HTML)';
            // LEVERINGSSTED = møteplass (for retur: der bussen slipper av). NISSY har navn + UTM33-koordinater.
            // Brukes til bussrute-tegning (eksakt POI, ikke gjetting). Parser tekst (tag-strippet) etter labelen.
            let levSted = null;
            const lvi = html.indexOf('Leveringssted');
            if (lvi > -1) {
                const segTxt = html.substring(lvi, lvi + 1000).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
                const nv = segTxt.match(/Navn:\s*(.+?)\s+Adresse:/i);
                const ps = segTxt.match(/Postnr\s*\/\s*Sted:\s*(.+?)\s+(?:G[åa]rds|Geo-|Telefon|Kommentar)/i);
                const gk = segTxt.match(/Geo-koordinater:?\s*(\d{5,})\s*\/\s*(\d{5,})/i);
                const ll = gk ? utm33ToLatLon(+gk[2], +gk[1]) : null;   // NISSY: northing/easting → (easting,northing)
                levSted = { navn: nv ? nv[1].trim() : '', sted: ps ? ps[1].trim() : '', ll: ll };
            }
            // HENTESTED = der pasienten stiger PÅ (påstigning). For Ahus-pasienter = Olavsgaard/Skedsmo (tilbringer-
            // taxi fra Ahus). Speiler levSted-parsingen; avgrenset til før «Leveringssted» så Navn ikke blandes.
            let hentSted = null;
            if (hi > -1) {
                const slutt = (lvi > hi) ? lvi : hi + 1000;
                const segH = html.substring(hi, slutt).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
                const nv = segH.match(/Navn:\s*(.+?)\s+Adresse:/i);
                const ps = segH.match(/Postnr\s*\/\s*Sted:\s*(.+?)\s+(?:G[åa]rds|Geo-|Telefon|Kommentar)/i);
                const gk = segH.match(/Geo-koordinater:?\s*(\d{5,})\s*\/\s*(\d{5,})/i);
                const ll = gk ? utm33ToLatLon(+gk[2], +gk[1]) : null;
                hentSted = { navn: nv ? nv[1].trim() : '', sted: ps ? ps[1].trim() : '', ll: ll };
            }
            // LØYVE + transportør (Transportør/ressurs-seksjonen). Label: «Løyve/Tur nr: C-4303 / 71613072» →
            // løyvet = delen FØR skråstreken (C-4303). For autentisk preg i taxi-boksen.
            let loyve = '', transportor = '';
            const loyM = html.match(/L[øo]yve\s*\/\s*Tur\s*nr\.?\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i)
                || html.match(/L[øo]yve(?:nr|nummer)?\.?\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (loyM) { const raw = loyM[1].replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); loyve = raw.split('/')[0].trim(); }
            const trM = html.match(/Transport[øo]r\.?\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            if (trM) transportor = trM[1].replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
            const suti = omrParseSuti(html);
            return { pnr, navn, retning, dato, status, klarFra, suti, fraPostnr, _hentDbg, meldingPRK, meldingTR, ledsager, _ledsDbg, levSted, hentSted, loyve, transportor, reqId: String(reqId) };
        } catch (e) { return null; }
    }
    // pnr → liste av {reqId, db, tripid} (alle pasientens rekvisisjoner) via searchStatus ssnSearch.
    async function omrPnrRekvisisjoner(pnr) {
        const senter = (function () { try { return (window.__vkt_tilgang || {}).dispatch_center_id || '560'; } catch (_) { return '560'; } })();
        const body = 'submit_action=ssnSearch&ssn=' + pnr + '&council=-999999&chosenDispatchCenter.id=' + senter + '&dbSelect=1';
        const r = await fetch('/administrasjon/admin/searchStatus', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        if (!r.ok) return [];
        const html = await r.text();
        const re = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
        const out = []; let m;
        while ((m = re.exec(html)) !== null) {
            const key = m[1] + '_' + m[3];
            if (!out.find(x => (x.reqId + '_' + x.tripid) === key)) out.push({ reqId: m[1], db: m[2], tripid: m[3] });
        }
        return out;
    }
    // Retur-status for ÉN inn-passasjer (på tur, og UTEN retur-ben på samme bil): finn samme-dag retur
    // via pnr → klassifiser. ✅ bestilt (m/ reisetidspunkt) · 🕓 åpen (uten tidspunkt) · ❌ ingen.
    async function omrPassasjerReturStatus(det) {
        if (!det.pnr || det.pnr.length !== 11) return { symbol: '❓', tekst: 'pnr utilgjengelig' };
        const turDato = det.dato || '';
        const reqs = await omrPnrRekvisisjoner(det.pnr);
        let funnet = null;
        for (const q of reqs.slice(0, 20)) {
            const d = await omrHentRekvDetalj(q.reqId, q.tripid);
            if (!d) continue;
            if (turDato && d.dato && d.dato !== turDato) continue;       // kun samme dato som turen
            if (/fra\s+behandling/i.test(d.retning || '')) { funnet = d; break; }
        }
        if (!funnet) return { symbol: '❌', tekst: 'Ingen retur funnet', farge: '#94a3b8' };
        if (funnet.klarFra) return { symbol: '✅', tekst: 'Retur BESTILT ' + funnet.klarFra + ' — trenger returbil', farge: '#22c55e' };
        return { symbol: '🕓', tekst: 'Åpen retur — ligger i rekvisisjonsmodulen (uten reisetidspunkt)', farge: '#f59e0b' };
    }
    // Cache for retur-sjekk pr pnr (oppslaget er dyrt: ssnSearch + flere ajax_reqdetails). TTL 120 s.
    const _returCache = {};
    async function omrReturStatusCached(pnr, dato) {
        if (!pnr || pnr.length !== 11) return null;
        const c = _returCache[pnr];
        if (c && (Date.now() - c.t) < 120000) return c.res;
        const res = await omrPassasjerReturStatus({ pnr: pnr, dato: dato });
        _returCache[pnr] = { t: Date.now(), res: res };
        return res;
    }
    // FRABRINGER for en buss-RETUR-passasjer: siste bil fra busstoppet hjem. = pasientens (pnr) rekvisisjon,
    // samme dag, ≠ bussbenet, som AVGÅR fra busstoppet (hentested-postnr == bussens TIL-postnr). Returnerer
    // bilens status (bestilt/på vei) + SUTI. Cachet pr (pnr|stopp). Speiler retur-sjekk-datastien.
    const _frabrCache = {};
    async function omrFrabringerStatus(busDet, stoppPostnr) {
        if (!stoppPostnr || !busDet || !busDet.pnr || busDet.pnr.length !== 11) return null;
        const key = busDet.pnr + '|' + stoppPostnr;
        const c = _frabrCache[key];
        if (c && (Date.now() - c.t) < 120000) return c.res;
        let res = { funnet: false };
        const reqs = await omrPnrRekvisisjoner(busDet.pnr);
        for (const q of reqs.slice(0, 25)) {
            if (String(q.reqId) === String(busDet.reqId)) continue;
            const d = await omrHentRekvDetalj(q.reqId, q.tripid);
            if (!d) continue;
            if (busDet.dato && d.dato && d.dato !== busDet.dato) continue;   // samme dag som bussen
            if (String(d.fraPostnr) !== String(stoppPostnr)) continue;       // avgår fra busstoppet
            res = { funnet: true, status: d.status, klarFra: d.klarFra, suti: d.suti, meldingPRK: d.meldingPRK, meldingTR: d.meldingTR };
            break;
        }
        _frabrCache[key] = { t: Date.now(), res: res };
        return res;
    }
    // SELVTRANSPORT til møteplassen: pasienten kommer seg selv til bussen (eks NYBORG: «kommer seg fra hjemme-
    // adresse til Brumunddal») → skal IKKE ha frabringer. Leses fra rekvisisjonens melding. Negasjons-guard.
    function erSelvtransport(txt) {
        const t = (txt || '').toLowerCase();
        if (/ikke selv|kommer seg ikke|f[åa]r ikke|trenger (taxi|frabringer|transport|drosje)/.test(t)) return false;
        return /kommer seg (selv|fra|til)|kommer selv|kj[øo]rer selv|egen (transport|bil|regi)|m[øo]ter (opp )?selv|ordner selv|tar seg selv|p[åa] egen h[åa]nd/.test(t);
    }
    // Frabringer → kompakt visning (er bil bestilt? er den på vei?). Dato droppes (alltid samme dag) — kun tid.
    function frabringerVis(d) {
        if (!d || !d.funnet) return { sym: '❌', txt: 'mangler', f: '#f87171' };
        const s = d.suti || {};
        if (s.levert) return { sym: '✓', txt: 'levert hjem ' + s.levertTid, f: '#22c55e' };
        if (s.hentet) return { sym: '🚗', txt: 'på vei hjem (hentet ' + s.hentetTid + ')', f: '#22c55e' };
        if (s.fremme) return { sym: '📍', txt: 'bil framme ' + s.frammeTid, f: '#38bdf8' };
        const km = (d.klarFra || '').match(/(\d{1,2}:\d{2})/);   // kun klokkeslett, ikke dato
        return { sym: '🕓', txt: 'bestilt' + (km ? ' ' + km[1] : '') + (d.status ? ' (' + d.status + ')' : ''), f: '#f59e0b' };
    }
    // TILBRINGER = taxi som bringer pasienten TIL påstigningsstoppet (eks Ahus → Skedsmokorset). Speiler frabringer,
    // men matcher på at den andre rekvisisjonen LEVERER på bussens hentested (leveringssted-postnr === bussens fra-postnr).
    const _tilbrCache = {};
    async function omrTilbringerStatus(busDet) {
        const board = busDet && busDet.fraPostnr;   // bussens hentested = påstigningsstoppet
        if (!board || !busDet.pnr || busDet.pnr.length !== 11) return null;
        const key = busDet.pnr + '|t|' + board;
        const c = _tilbrCache[key];
        if (c && (Date.now() - c.t) < 120000) return c.res;
        let res = { funnet: false };
        const reqs = await omrPnrRekvisisjoner(busDet.pnr);
        for (const q of reqs.slice(0, 25)) {
            if (String(q.reqId) === String(busDet.reqId)) continue;
            const d = await omrHentRekvDetalj(q.reqId, q.tripid);
            if (!d) continue;
            if (busDet.dato && d.dato && d.dato !== busDet.dato) continue;            // samme dag som bussen
            const lp = ((d.levSted && d.levSted.sted) || '').match(/\b(\d{4})\b/);     // tilbringeren LEVERER på påstigningsstoppet
            if (!lp || lp[1] !== String(board)) continue;
            res = { funnet: true, status: d.status, klarFra: d.klarFra, suti: d.suti, meldingPRK: d.meldingPRK, meldingTR: d.meldingTR, loyve: d.loyve || '', transportor: d.transportor || '' };
            break;
        }
        _tilbrCache[key] = { t: Date.now(), res: res };
        return res;
    }
    // Tilbringer → kompakt visning (analogt med frabringerVis, men «til stoppet» i stedet for «hjem»).
    function tilbringerVis(d) {
        if (!d || !d.funnet) return { sym: '❌', txt: 'mangler', f: '#f87171' };
        const s = d.suti || {};
        if (s.levert) return { sym: '✓', txt: 'på stoppet ' + s.levertTid, f: '#22c55e' };
        if (s.hentet) return { sym: '🚗', txt: 'på vei til stopp (hentet ' + s.hentetTid + ')', f: '#22c55e' };
        if (s.fremme) return { sym: '📍', txt: 'bil framme ' + s.frammeTid, f: '#38bdf8' };
        const km = (d.klarFra || '').match(/(\d{1,2}:\d{2})/);
        return { sym: '🕓', txt: 'bestilt' + (km ? ' ' + km[1] : '') + (d.status ? ' (' + d.status + ')' : ''), f: '#f59e0b' };
    }
    // Cache for levert-status pr. tur-rekvisisjon (reqId) — admin-oppslag er dyrt og kortene re-rendres
    // ofte. TTL 90 s (status endrer seg sakte). Holder også «pågår»-flagg så vi ikke fyrer dobbelt.
    const _levertCache = {};   // reqId → { t, klarFra, suti } — bilens logg utledes av den reqId som ga grupper
    let _levertKjorer = false;
    // Fyll inn levert-status på inn-passasjerene i kart-kortene (de med .plst[data-reqid]). Behandles
    // PER BIL: SUTI-loggen er felles for bilen MEN vises kun når man spør ajax_reqdetails med reqId-en som
    // «eier» den aktive ressursen — så vi prøver passasjerenes reqIds til én gir grupper. Hver passasjer
    // kobles så til SIN RekvisisjonsNr-gruppe via «Klar fra» (planlagt hentetid ≈ gruppens 1701-hentet).
    async function fyllLevertStatus(win) {
        if (_levertKjorer) return; _levertKjorer = true;
        try {
            const felt = Array.from(win.document.querySelectorAll('.kkpas .plst[data-reqid]'));
            const perBil = {};   // resId → [el]
            const bilSutiMap = {};   // resId → bilSuti (gjenbrukes i ETA-passet)
            for (let i = 0; i < felt.length; i++) {
                const el = felt[i];
                if (el.getAttribute('data-fylt') === '1') continue;
                const resId = el.getAttribute('data-resid') || el.getAttribute('data-reqid');
                (perBil[resId] = perBil[resId] || []).push(el);
            }
            for (const resId in perBil) {
                const els = perBil[resId];
                let bilSuti = null, viaReqId = '';
                const rad = [];   // {el, klarFra}
                // Hent hver passasjers detalj (klarFra + evt. SUTI-logg). Cache pr reqId (90 s).
                for (let i = 0; i < els.length; i++) {
                    const el = els[i]; const rq = el.getAttribute('data-reqid');
                    let pc = _levertCache[rq];
                    if (!pc || (Date.now() - pc.t) > 90000) {
                        const det = await omrHentRekvDetalj(rq, resId);
                        pc = { t: Date.now(), klarFra: det && det.klarFra, suti: det && det.suti, pnr: det && det.pnr, dato: det && det.dato }; _levertCache[rq] = pc;
                    }
                    rad.push({ el: el, klarFra: pc.klarFra });
                    if (pc.suti && pc.suti.grupper && pc.suti.grupper.length && !bilSuti) { bilSuti = pc.suti; viaReqId = rq; }
                    // REN inn-passasjer (data-pur) → retur-sjekk farger ROLLE-PILA (.prole): ← (kun inn, ingen
                    // retur) → ⇄ grønn (retur bestilt) / ⇄ gul (åpen retur). Selve formen sier om det fins retur.
                    if (el.getAttribute('data-pur') === '1' && pc.pnr) {
                        const rr = el.parentElement && el.parentElement.querySelector('.prole');
                        if (rr && rr.getAttribute('data-rfylt') !== '1') {
                            rr.setAttribute('data-rfylt', '1');
                            omrReturStatusCached(pc.pnr, pc.dato).then(s => {
                                if (!s) return;
                                if (s.symbol === '✅') { rr.textContent = '⇄'; rr.style.color = '#22c55e'; }
                                else if (s.symbol === '🕓') { rr.textContent = '⇄'; rr.style.color = '#f59e0b'; }
                                else { rr.textContent = '←'; rr.style.color = '#22c55e'; }   // ingen retur = bare inn
                                rr.setAttribute('title', 'Tur inn til behandling · Retur: ' + s.tekst);
                            }).catch(() => { });
                        }
                    }
                }
                try { console.log('[' + NAVN + '] SUTI bil ' + resId + ': grupper=' + (bilSuti ? bilSuti.grupper.length : 0) + (viaReqId ? ' via reqId ' + viaReqId : ' (ingen reqId ga logg)')); } catch (_) { }
                // Hentetid pr passasjer (Klar fra mest presist, ellers tur-leggets tid).
                const medTid = [];
                for (let i = 0; i < rad.length; i++) {
                    const el = rad[i].el, hentRaw = el.getAttribute('data-hent') || '';
                    let hentMin = null;
                    const kfM = (rad[i].klarFra || '').match(/(\d{1,2}):(\d{2})/);
                    if (kfM) hentMin = +kfM[1] * 60 + +kfM[2];
                    if (hentMin == null && hentRaw) hentMin = parseTid(hentRaw);
                    medTid.push({ el: el, klarFra: rad[i].klarFra, hentRaw: hentRaw, hentMin: hentMin, grp: null });
                }
                // BIJEKTIV tildeling: tidligst hentet først får nærmeste LEDIGE gruppe. Hindrer at to
                // passasjerer tar samme gruppe (= feil levert-tid, som da SVENDSEN arvet IQBALs 11:04).
                if (bilSuti) {
                    const sortert = medTid.slice().sort((a, b) => (a.hentMin == null ? 99999 : a.hentMin) - (b.hentMin == null ? 99999 : b.hentMin));
                    const brukt = {};
                    for (let i = 0; i < sortert.length; i++) {
                        const m = sortert[i];
                        if (m.hentMin == null) continue;
                        let best = null, bestDiff = Infinity;
                        for (let j = 0; j < bilSuti.grupper.length; j++) {
                            const g = bilSuti.grupper[j];
                            if (brukt[g.rekv]) continue;
                            const ref = g.hentetTid || g.frammeTid; const t = ref ? parseTid(ref) : null;
                            if (t == null) continue;
                            const d = Math.abs(t - m.hentMin);
                            if (d < bestDiff) { bestDiff = d; best = g; }
                        }
                        if (best && bestDiff <= 90) { m.grp = best; brukt[best.rekv] = true; }
                    }
                }
                for (let i = 0; i < medTid.length; i++) {
                    const m = medTid[i], el = m.el, grp = m.grp;
                    const rolle = el.getAttribute('data-rolle') || 'tur';
                    el.setAttribute('data-fylt', '1');
                    // IKKE-STARTET (verken tur el. retur) → vis NÅR pasienten er klar («Pasient klar fra»), ikke
                    // tabell-status «Akseptert»/«venter». Oppdateres til 📍/🚐/✓/↗ når SUTI rykker frem.
                    const klarVis = () => { const km = (m.klarFra || '').match(/(\d{1,2}:\d{2})/); el.textContent = km ? '🕓 Klar ' + km[1] : '⏳ venter'; el.style.color = '#f59e0b'; };
                    if (!bilSuti) { klarVis(); el.setAttribute('title', (el.getAttribute('title') || '') + '\n(0 SUTI-grupper for bilen)'); continue; }
                    if (rolle === 'retur') {
                        // Retur (➜): «dro fra Oslo» = retur-leggets 1701 (hentet i Oslo). Framme = bil ankommet
                        // Oslo-hentestedet (henter snart). Ikke startet → vis «Klar HH:MM» (Pasient klar fra).
                        if (grp && grp.hentetTid) { el.textContent = '↗ Dro ' + grp.hentetTid; el.style.color = '#a78bfa'; }
                        else if (grp && grp.frammeTid) { el.textContent = '📍 Henter ' + grp.frammeTid; el.style.color = '#38bdf8'; }
                        else klarVis();
                    } else {
                        if (grp && grp.levertTid) { el.textContent = '✓ Levert ' + grp.levertTid; el.style.color = '#22c55e'; }
                        else if (grp && grp.hentetTid) { el.textContent = '🚐 I bil ' + grp.hentetTid; el.style.color = '#f59e0b'; }
                        else if (grp && grp.frammeTid) { el.textContent = '📍 Framme ' + grp.frammeTid; el.style.color = '#38bdf8'; }
                        else klarVis();   // ikke startet → Klar HH:MM (ikke «Akseptert»)
                    }
                    el.setAttribute('title',
                        (rolle === 'retur' ? 'Retur · Oslo-hentetid: ' : 'Klar fra: ') + (m.klarFra || m.hentRaw || '–') +
                        (grp ? ('\nMin SUTI-gruppe (rekv ' + grp.rekv + '):'
                            + '\n  framme: ' + (grp.frammeTid || '–')
                            + '\n  hentet/dro: ' + (grp.hentetTid || '–')
                            + (rolle === 'retur' ? '' : '\n  LEVERT: ' + (grp.levertTid || 'nei')))
                            : ('\n(ingen ledig gruppe matchet hentetid ' + (m.hentMin != null ? Math.floor(m.hentMin / 60) + ':' + ('0' + m.hentMin % 60).slice(-2) : '?') + ')'))
                        + '\nBilen: ' + bilSuti.grupper.length + ' passasjer-grupper');
                }
                bilSutiMap[resId] = bilSuti;
                // BIL-STATUS til ETA-feltet — fra passasjerenes (bijektivt korrekte) grupper. PRIORITET:
                //   1) Bilen har FORLATT Oslo (en retur er om bord/dro) → «↗ Dro Oslo HH:MM». Da er ETA
                //      meningsløst (bilen er på vei UT), og «I Oslo (levert …)» ville vært retur-leveringen hjemme.
                //   2) Alle inn-passasjerer levert, ingen retur ennå → «🏁 I Oslo» (ankommet, ledig for retur).
                //   3) Ellers → ETA inn = siste inn-passasjers hentet/klar + kjøretid hentested→Oslo.
                const etaEl = win.document.querySelector('.kketa[data-resid="' + resId + '"]');
                if (etaEl) {
                    etaEl.setAttribute('data-eta-fylt', '1'); etaEl.style.display = '';
                    const turP = medTid.filter(m => (m.el.getAttribute('data-rolle') || 'tur') === 'tur');
                    const returP = medTid.filter(m => m.el.getAttribute('data-rolle') === 'retur');
                    let dro = '';
                    for (let i = 0; i < returP.length; i++) { const g = returP[i].grp; if (g && g.hentetTid && g.hentetTid > dro) dro = g.hentetTid; }
                    let innLevert = '', alleInn = turP.length > 0;
                    for (let i = 0; i < turP.length; i++) { const g = turP[i].grp; if (g && g.levertTid) { if (g.levertTid > innLevert) innLevert = g.levertTid; } else alleInn = false; }
                    if (dro) {
                        etaEl.textContent = '↗ Dro Oslo ' + dro; etaEl.style.color = '#a78bfa';
                        etaEl.setAttribute('title', 'Bilen forlot Oslo ' + dro + ' (retur om bord) — ikke lenger ledig herfra.');
                    } else if (alleInn && innLevert) {
                        etaEl.textContent = '🏁 I Oslo (levert ' + innLevert + ')'; etaEl.style.color = '#22c55e';
                        etaEl.setAttribute('title', 'Alle inn-passasjerer levert i Oslo — bilen er i Oslo og ledig for retur.');
                    } else {
                        // Siste inn-passasjer. HENTET (i gang) → faktisk hentet + kjøretid (rute-oppslag verdt
                        // det). IKKE startet → NISSYs planlagte oppmøte i Oslo (data-tid) direkte, INGEN drive
                        // (legg-tiden ER allerede planlagt ankomst — å legge drive på toppen dobbeltteller).
                        let siste = null;
                        for (let i = 0; i < turP.length; i++) { const m = turP[i]; if (m.hentMin != null && (!siste || m.hentMin > siste.hentMin)) siste = m; }
                        const g = siste && siste.grp;
                        const fra = siste ? (siste.el.getAttribute('data-fra') || '') : '', til = siste ? (siste.el.getAttribute('data-til') || '') : '';
                        if (g && g.hentetTid && fra && til) await visEtaBeregn(etaEl, parseTid(g.hentetTid), true, fra, til);
                        else visEtaPlanlagt(etaEl, etaEl.getAttribute('data-tid') || '');
                    }
                }
            }
            // Fallback-pass: returbil-kort UTEN passasjer-oppslag (typisk «Akseptert» der vi ikke fikk SUTI/
            // klar-fra) → legg-basert planlagt ETA fra data-attributtene.
            const etaFelt = Array.from(win.document.querySelectorAll('.kketa[data-resid]'));
            for (let i = 0; i < etaFelt.length; i++) {
                const ee = etaFelt[i];
                if (ee.getAttribute('data-eta-fylt') === '1') continue;
                await fyllEta(ee);
            }
        } catch (e) { console.warn('[' + NAVN + '] fyllLevertStatus:', e && e.message); }
        finally { _levertKjorer = false; }
    }
    // 🔁-passasjerenes RETUR-avreisetid: returens «Pasient klar fra» (= når pasienten er klar til å reise
    // tilbake). Bilen står og venter på dette. Async fra returens egen rekvisisjon (returReqId), cachet pr reqId.
    let _returTidKjorer = false;
    async function fyllReturTid(win) {
        if (_returTidKjorer) return; _returTidKjorer = true;
        try {
            const felt = Array.from(win.document.querySelectorAll('.plretur[data-reqid]'));
            for (let i = 0; i < felt.length; i++) {
                const el = felt[i];
                if (el.getAttribute('data-fylt') === '1') continue;
                el.setAttribute('data-fylt', '1');
                const reqId = el.getAttribute('data-reqid'), resId = el.getAttribute('data-resid');
                try {
                    let c = _levertCache[reqId];
                    if (!c || (Date.now() - c.t) > 90000 || c.klarFra === undefined) { const d = await omrHentRekvDetalj(reqId, resId); c = { t: Date.now(), klarFra: d && d.klarFra, status: d && d.status }; _levertCache[reqId] = c; }
                    const km = (c.klarFra || '').match(/(\d{1,2}:\d{2})/);
                    el.textContent = km ? '↩ tilbake ' + km[1] : '↩ retur';
                    el.setAttribute('title', 'Klar til retur: ' + (c.klarFra || 'ukjent') + (c.status ? ' (' + c.status + ')' : '') + ' — bilen kan reise tilbake da.');
                    // Oppdater bilens «Klar fra Oslo»-linje til seneste FAKTISKE retur-klar-fra.
                    if (km) {
                        const kl = win.document.querySelector('.kkklar[data-resid="' + resId + '"]');
                        if (kl) { const naa = parseTid(kl.getAttribute('data-maxklar') || ''); const ny = parseTid(km[1]); if (ny != null && (naa == null || ny > naa)) { kl.setAttribute('data-maxklar', km[1]); kl.textContent = '🏁 Klar fra Oslo ' + km[1]; } }
                    }
                } catch (_) { el.textContent = '↩ ?'; }
            }
        } catch (e) { console.warn('[' + NAVN + '] fyllReturTid:', e && e.message); }
        finally { _returTidKjorer = false; }
    }
    // Felles ETA-render: trigger-tid (min) + kjøretid(fra→til) via ruter.php (haversine×VEIFAKTOR/60kmt-fallback).
    async function visEtaBeregn(etaEl, trig, erHentet, fra, til) {
        let driveSek = null;
        try { const rute = await hentRute(fra, til); if (rute && rute.ok && isFinite(rute.sek)) driveSek = rute.sek; } catch (_) { }
        if (driveSek == null) { const a = await hentKoord(fra), b = await hentKoord(til); if (a && b) driveSek = haversineKm(a[0], a[1], b[0], b[1]) * VEIFAKTOR / 60 * 3600; }
        if (driveSek == null) { etaEl.textContent = '🏁 I Oslo: ukjent kjøretid'; etaEl.style.color = '#94a3b8'; return; }
        const driveMin = Math.round(driveSek / 60), etaMin = trig + driveMin;
        etaEl.textContent = '🏁 I Oslo ca. ' + tidStr(etaMin);
        etaEl.style.color = naaMin() >= etaMin ? '#22c55e' : '#fbbf24';
        etaEl.setAttribute('title', 'ETA ' + tidStr(etaMin) + ' = ' + (erHentet ? 'hentet ' : 'klar ') + tidStr(trig) + ' + ' + driveMin + ' min kjøring\nFra: ' + fra + '\nTil: ' + til);
    }
    // NISSYs planlagte oppmøte i Oslo (data-tid på innkjørings-benet) — brukt før bilen har startet. Ingen
    // rute-oppslag (sparer kall): NISSY har allerede planlagt ankomsttiden. «(plan)» markerer at det er estimat.
    function visEtaPlanlagt(etaEl, planTid) {
        const m = parseTid(planTid);
        if (m == null) { etaEl.style.display = 'none'; return; }
        etaEl.style.display = '';
        etaEl.textContent = '🏁 I Oslo ca. ' + tidStr(m) + ' (plan)';
        etaEl.style.color = naaMin() >= m ? '#22c55e' : '#fbbf24';
        etaEl.setAttribute('title', 'Planlagt oppmøte i Oslo (NISSY): ' + tidStr(m) + '\nOppdateres til faktisk hentet + kjøretid når bilen starter.');
    }
    // Legg-basert ETA for biler uten passasjer-oppslag (typisk «Akseptert») = NISSYs planlagte oppmøte.
    function fyllEta(etaEl) {
        etaEl.setAttribute('data-eta-fylt', '1');
        visEtaPlanlagt(etaEl, etaEl.getAttribute('data-tid') || '');
    }
    // Reiste bilen for >1,5 t siden? (proxy = tidligste legg-tid). UNDER TESTING merkes den «avreist»;
    // i fremtiden skjules den helt (og vi sparer NISSY-oppslag på den).
    function omrAvreist(r, naa) {
        const t = (r.legs || []).map(l => parseTid(l.opp || l.start)).filter(x => x != null);
        return t.length > 0 && (naa - Math.min.apply(null, t)) > 90;
    }
    // Retur-sjekk per PASSASJER. Avreiste biler (>1,5t) MERKES (skjules i fremtiden), utgående
    // passasjerer (på vei hjem = returen selv) får ikke symbol. Logger i konsollen (kort-UI kommer).
    async function omrSjekkRetur() {
        if (!sisteData) { console.warn('[' + NAVN + '] Retur-sjekk: ingen data — skann først.'); return; }
        const naa = naaMin();
        // HLSX/helseekspress (f.eks. HLSB L-O = ekspressen til Lillehammer) hører IKKE hjemme her — den
        // får sin egen oversikt (ledige plasser + antall ventende HLSX). Samme filter som kart-visningen.
        const biler = dedupResId(sisteData.inn).filter(r => r.fane === 'paagaaendeOppdrag' && r.reqId && !erHlsx(r)).slice(0, 15);
        console.log('%c[' + NAVN + '] Retur-sjekk — ' + biler.length + ' bil(er)', 'background:#0d9488;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700');
        for (const r of biler) {
            if (omrAvreist(r, naa)) {  // TESTING: merk avreist + ikke sløs oppslag (skjules i fremtiden)
                console.log('  • (' + (r.ressurs || '') + '): 🚗💨 AVREIST (>1,5t siden) — skjules i fremtiden');
                continue;
            }
            // Hent alle passasjerers detaljer, grupper PER PASIENT (pnr) — en pasient kan ha både et
            // til-behandling-ben OG et fra-behandling-ben på samme bil (= retur ligger på bilen, 🔁).
            const reqIds = (r.reqIds && r.reqIds.length) ? r.reqIds : [r.reqId];
            const perPas = {};
            for (const rq of reqIds) {
                const d = await omrHentRekvDetalj(rq, r.resId);
                if (!d) continue;
                const key = d.pnr || d.navn || rq;
                if (!perPas[key]) perPas[key] = { navn: d.navn || '?', harTil: false, harFra: false, tilDet: null };
                if (/til\s+behandling/i.test(d.retning || '')) { perPas[key].harTil = true; perPas[key].tilDet = d; }
                if (/fra\s+behandling/i.test(d.retning || '')) perPas[key].harFra = true;
            }
            for (const key in perPas) {
                const p = perPas[key];
                let symbol, tekst;
                if (!p.harTil) { symbol = '↩'; tekst = 'retur-ben (på vei hjem) — ikke symbol'; }   // kun retur-ben (LINE LUND-type)
                else if (p.harFra) { symbol = '🔁'; tekst = 'retur på bilen'; }                      // tur + retur på SAMME bil
                else { const s = await omrPassasjerReturStatus(p.tilDet); symbol = s.symbol; tekst = s.tekst; }  // kun tur → slå opp
                console.log('  • ' + p.navn + ' (' + (r.ressurs || '') + '): ' + symbol + ' ' + tekst);
            }
        }
        console.log('[' + NAVN + '] Retur-sjekk ferdig.');
    }

    // localStorage-cache med TTL — adresser/ruter/kjøretider kan endres, så cachen self-healer når
    // den blir for gammel. Nøkkelen er adresse-strengen, så en ENDRET adresse (pasient flytter) bommer
    // uansett og hentes på nytt; TTL fanger tilfellet «samme streng, men koordinat/tid er korrigert».
    const _LS_DAG = 864e5;
    function lsLes(fullKey, ttl) {
        try {
            const r = localStorage.getItem(fullKey);
            if (!r) return undefined;
            const o = JSON.parse(r);
            if (o && typeof o === 'object' && 't' in o) {
                if (Date.now() - o.t < ttl) return o.v;
                localStorage.removeItem(fullKey);          // utløpt
            } else { localStorage.removeItem(fullKey); }   // gammelt format uten tidsstempel
        } catch (e) {}
        return undefined;
    }
    function lsSkriv(fullKey, v) { try { localStorage.setItem(fullKey, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {} }
    // fetch med timeout (abort etter ms) — hindrer at ÉN hengende request fryser hele berik()/Promise.all.
    function fetchTO(url, opts, ms) {
        let ctrl, t;
        try { ctrl = new AbortController(); t = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, ms || 9000); } catch (e) {}
        const o = Object.assign({}, opts || {}); if (ctrl) o.signal = ctrl.signal;
        return fetch(url, o).then(r => { if (t) clearTimeout(t); return r; }, e => { if (t) clearTimeout(t); throw e; });
    }
    // Kjør fn over arr med maks `limit` samtidige (kø). Unngår å oversvømme one.com med ~160 parallelle
    // fetch (PHP-FPM-arbeidere gikk tomme → noen kall hang → Promise.all fullførte aldri).
    async function mapLimit(arr, limit, fn) {
        const res = new Array(arr.length); let i = 0;
        const arbeider = async () => { while (i < arr.length) { const idx = i++; try { res[idx] = await fn(arr[idx], idx); } catch (e) { res[idx] = null; } } };
        const n = Math.min(limit, arr.length), jobber = [];
        for (let w = 0; w < n; w++) jobber.push(arbeider());
        await Promise.all(jobber);
        return res;
    }

    // Kjøretid via reisetid.php-proxyen (Google Distance Matrix server-side, cachet). Cacher også klient-side.
    const _rtCache = {};
    async function hentReisetid(fra, til) {
        const o = postnrSted(fra);           // Oslo-postnr — rutbart + god cache-reuse
        const d = String(til || '').trim();  // full hjemadresse (postnr-sentroid kan være ikke-rutbart)
        if (!o || !d) return null;
        const key = o + '|' + d;
        if (_rtCache[key] !== undefined) return _rtCache[key];
        const ls = lsLes('omr_rt_' + key, 7 * _LS_DAG);
        if (ls !== undefined) { _rtCache[key] = ls; return ls; }
        try {
            _nettOppslag++;
            const r = await fetchTO(SERVER + '/reisetid.php?origin=' + encodeURIComponent(o) + '&dest=' + encodeURIComponent(d), { cache: 'no-store' }, 9000);
            const j = await r.json();
            if (j.ok) {
                const v = { sek: j.sek, tekst: j.tekst, km: j.km };
                _rtCache[key] = v;
                lsSkriv('omr_rt_' + key, v);
                return v;
            }
        } catch (e) {}
        _rtCache[key] = null;
        return null;
    }

    function celleVerdier(tr, i) {
        if (i < 0 || !tr.cells[i]) return [];
        const c = tr.cells[i];
        const divs = c.querySelectorAll('div');
        if (divs.length) return Array.from(divs).map(d => d.textContent.trim());
        const t = c.textContent.trim();
        return t ? [t] : [];
    }
    // Behov-cellen kan inneholde tekst-koder (f.eks. «IA,RU,RB») og/eller ikoner — vi
    // slår sammen tekst + img-alt/title så parseBehov fanger kodene uansett representasjon.
    // Fler-bens biler har ett div per ben; vi skiller dem med mellomrom (ellers limes
    // koder/ledsagertall sammen, f.eks. «1»+«1»→«11»).
    function behovTekst(tr, i) {
        if (i < 0 || !tr.cells[i]) return '';
        const c = tr.cells[i];
        const divs = c.querySelectorAll('div');
        const txt = divs.length ? Array.from(divs).map(d => d.textContent.trim()).join(' ') : c.textContent.trim();
        const imgs = Array.from(c.querySelectorAll('img')).map(im => im.alt || im.title || '').join(' ');
        return (txt + ' ' + imgs).trim();
    }
    // Ledsager-antall = maks over ben (fler-bens biler gjentar tallet per ben).
    function ledsAntall(tr, i) {
        return celleVerdier(tr, i).reduce((m, v) => Math.max(m, parseInt(v, 10) || 0), 0);
    }

    /* ── Auto-parering av områder fra NISSYs filterliste ─ */
    // Filtrene heter «Fra X» / «Til X». Vi parer dem på X og bygger områdene.
    function finnFilterSelect() {
        for (const n of ['filter-ventende-oppdrag', 'filter-resurser', 'filter-effektivitet']) {
            const s = document.querySelector('select[name="' + n + '"]');
            if (s && s.options.length > 50) return s;
        }
        let best = null;
        document.querySelectorAll('select').forEach(s => {
            if (s.options.length > 100 && (!best || s.options.length > best.options.length)) best = s;
        });
        return best;
    }
    function byggOmraaderFraSelect() {
        const sel = finnFilterSelect();
        if (!sel) return [];
        const fra = {}, til = {};
        Array.from(sel.options).forEach(o => {
            if (!o.value || !/^\d+$/.test(o.value)) return;
            const navn = o.textContent.trim();
            let m;
            // «Fra X» / «Til X» — X uten «til» i seg (ekskluderer «Fra X til Y»). Strip evt. « Langtransport».
            if ((m = navn.match(/^Fra\s+([^]+?)(?:\s+Langtransport)?$/i)) && !/\stil\s/i.test(m[1])) fra[m[1].toLowerCase()] = { id: o.value, navn: m[1].trim() };
            else if ((m = navn.match(/^Til\s+([^]+?)(?:\s+Langtransport)?$/i)) && !/\stil\s/i.test(m[1]) && !/^\//.test(m[1])) til[m[1].toLowerCase()] = { id: o.value, navn: m[1].trim() };
        });
        const par = [];
        Object.keys(fra).forEach(k => { if (til[k]) par.push({ navn: fra[k].navn, inn: fra[k].id, ut: til[k].id }); });
        par.sort((a, b) => a.navn.localeCompare(b.navn, 'no'));
        // KUN «Nord/Øst» i velgeren (Thomas' krav — ikke separate Nord/Østfold-knapper). Det kombinerte
        // området bruker det brede operative 18448-filteret for ventende, og fargelegger delområdene
        // (kilder: Nord = 17295-sett, Østfold = 17301-sett). Gjeninnført etter at en feil-deploy
        // reverterte den (23.06-«omradevelger»-endringen lå kun på server, ikke i repo).
        const nord = par.find(p => /^nord$/i.test(p.navn));
        const ost = par.find(p => /østfold/i.test(p.navn));
        if (nord && ost) {
            return [{
                navn: 'Nord/Øst',
                inn: nord.inn,        // returbiler/pågående — justeres senere
                ut: '18448',          // bredt «Nord/Øst»-ventende
                kilder: [
                    { navn: nord.navn, ut: nord.ut, farge: fargeFor(nord.navn) },
                    { navn: ost.navn, ut: ost.ut, farge: fargeFor(ost.navn) },
                ],
            }];
        }
        // Fallback (kan ikke bygge kombinert): vis de enkelte parene så velgeren ikke blir tom.
        return par.map(p => ({ navn: p.navn, inn: p.inn, ut: p.ut, kilder: [{ navn: p.navn, ut: p.ut, farge: fargeFor(p.navn) }] }));
    }

    // Henter destinasjons-postnr-settet (toPostCodes1) for en kildes ut-filter — for fargesetting.
    async function lastKildePostnr(k) {
        if (k._postnr) return;
        try {
            const html = await xhr('/administrasjon/admin/editDispatchFilter?id=' + k.ut);
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const e = doc.querySelector('[name="toPostCodes1"]');
            k._postnr = parsePostnrSett(e ? (e.value || e.textContent || '') : '');
        } catch (e) { k._postnr = []; }
    }
    // Hvilket delområde (farge-sone) en tur tilhører avgjøres av destinasjonens postnr.
    function delomraade(r) {
        const def = aktivKilder[0] || { navn: aktivNavn, farge: '#64748b' };
        if (aktivKilder.length <= 1) return def;
        for (const l of (r.legs || [])) {
            const p = hentPostnr(l.til);
            if (!p) continue;
            for (const k of aktivKilder) { if (iSett(p, k._postnr)) return k; }
        }
        return def;
    }

    /* ── Merk rad blå i NISSY-planleggeren ─ */
    function finnRad(resId) { return document.getElementById('V-' + resId) || document.getElementById('P-' + resId); }
    function erMerket(resId) { const rad = finnRad(resId); return !!rad && rad.style.backgroundColor === NISSY_BLAA; }
    function toggleMerk(resId) {
        const rad = finnRad(resId);
        if (!rad) return 'mangler';
        if (rad.style.backgroundColor === NISSY_BLAA) { rad.style.backgroundColor = ''; return 'av'; }
        rad.style.backgroundColor = NISSY_BLAA;
        return 'paa';
    }
    // Pulserende bakgrunn DIREKTE i NISSY-tabellen på ventende-rader som HASTER («send ut»-frist passert),
    // så operatøren ser dem uten å se i verktøyet. Re-påføres jevnlig (NISSY re-rendrer rader aggressivt).
    function sikreHasterStil() {
        if (document.getElementById('oa-haster-stil')) return;
        const st = document.createElement('style');
        st.id = 'oa-haster-stil';
        st.textContent = '@keyframes oaHasterPuls{0%,100%{background-color:rgba(251,191,36,.12)}50%{background-color:rgba(251,191,36,.5)}}'
            + 'tr.oa-haster,tr.oa-haster>td{animation:oaHasterPuls 1.3s ease-in-out infinite!important}';
        document.head.appendChild(st);
    }
    function oppdaterHaster() {
        if (!sisteData) return;
        sikreHasterStil();
        const naa = naaMin();
        const utVent = dedupResId(sisteData.ut).filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r));
        const nye = {};
        for (let i = 0; i < utVent.length; i++) {
            const r = utVent[i], l0 = r.legs[0] || {};
            const Tmin = parseTid(l0.opp || l0.start);
            if (Tmin === null) continue;
            const venteMin = Math.max((r._rt ? r._rt.sek / 60 : 0), VENTETID_MIN);
            if (naa >= Tmin + venteMin - VARSEL_MIN) {  // «send ut»-frist passert → haster
                nye[r.resId] = true;
                const rad = finnRad(r.resId);
                if (rad) rad.classList.add('oa-haster');
            }
        }
        if (Date.now() < _hasterTestTil) {  // TEST: tving blink på de første ventende så blinket kan ses uten ekte haster
            for (let i = 0; i < utVent.length && i < 5; i++) { nye[utVent[i].resId] = true; const rad = finnRad(utVent[i].resId); if (rad) rad.classList.add('oa-haster'); }
        }
        const gamle = Object.keys(_hasterPaa);  // fjern blink fra rader som ikke lenger haster
        for (let i = 0; i < gamle.length; i++) if (!nye[gamle[i]]) { const rad = finnRad(gamle[i]); if (rad) rad.classList.remove('oa-haster'); }
        _hasterPaa = nye;
    }

    // Ventende har Fra+Til slått sammen i én celle uten skilletegn. To adresser møtes der en
    // liten bokstav står rett foran en stor (f.eks. "…0450 OsloLigarda…") — vi deler der.
    function splittFraTil(tekst) {
        if (!tekst) return ['', ''];
        const m = tekst.match(/^(.*?[a-zæøå])([A-ZÆØÅ].*)$/);
        return m ? [m[1].trim(), m[2].trim()] : [tekst.trim(), ''];
    }

    /* ── Parse dispatch-XML → rader med ressurs + etapper ─ */
    // To ulike tabellstrukturer: pågående (Ressurs/Fra/Til/… per etappe-div) og
    // ventende (Pnavn/Reisetid/Opptid/Reisemåte/Behov/L/FraTil — én rad, FraTil sammenslått).
    function parseDispatch(responseText) {
        const xmlDoc = new DOMParser().parseFromString(responseText, 'text/xml');
        const rader = [];
        xmlDoc.querySelectorAll('response').forEach(resp => {
            const fane = resp.getAttribute('id');
            if (!['ventendeOppdrag', 'paagaaendeOppdrag'].includes(fane)) return;
            const d = document.createElement('div');
            d.innerHTML = resp.textContent;
            const hc = Array.from(d.querySelector('tr.tbh')?.cells || []).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
            if (!hc.length) return;
            const iFraTil = hc.findIndex(s => s === 'FRATIL');

            if (iFraTil >= 0) {
                // VENTENDE-struktur
                const idx = {
                    pnavn:    hc.findIndex(s => s === 'PNAVN'),
                    reisetid: hc.findIndex(s => s === 'REISETID'),
                    opptid:   hc.findIndex(s => s === 'OPPTID' || s === 'OPPMTID'),
                    rmate:    hc.findIndex(s => s === 'REISEMÅTE' || s === 'RMÅTE'),
                    behov:    hc.findIndex(s => s === 'BEHOV'),
                    leds:     hc.findIndex(s => s === 'L'),
                };
                d.querySelectorAll('tbody tr[name]').forEach(tr => {
                    const reqIds = Array.from(tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)).map(m => m[1]);
                    if (!reqIds.length) return;
                    const c = i => (i >= 0 && tr.cells[i]) ? tr.cells[i].textContent.trim() : '';
                    const ft = splittFraTil(c(iFraTil));
                    const behovRaa = behovTekst(tr, idx.behov);
                    const ledsRaa = c(idx.leds);
                    rader.push({
                        reqId: reqIds[0], resId: tr.getAttribute('name'), fane, ressurs: '',
                        _behov: parseBehov(behovRaa),
                        _ledsN: parseInt(ledsRaa, 10) || 0,
                        legs: [{
                            // NISSY ventende: REISETID = faktisk hente-/transporttidspunkt (det vi matcher + viser
                            // på); OPPTID = oppmøte-/behandlingstid (kan være MORGENENS time for en retur, f.eks.
                            // BUCH reisetid 11:30 / opptid 08:50). Legg REISETID i «opp» (primærtiden alle
                            // forbrukere leser via `opp || start`), OPPTID som «start» (sekundær/fallback).
                            opp: c(idx.reisetid), start: c(idx.opptid),
                            fra: ft[0], til: ft[1], status: '',
                            pnavn: c(idx.pnavn), rmate: c(idx.rmate), behov: behovRaa,
                        }],
                    });
                });
                return;
            }

            // PÅGÅENDE-struktur
            const idx = {
                ressurs: hc.findIndex(s => s === 'RESSURS'),
                start:   hc.findIndex(s => s.includes('START')),
                oppmtid: hc.findIndex(s => s === 'OPPMTID' || s === 'OPPTID'),
                fra:     hc.findIndex(s => s === 'FRA'),
                til:     hc.findIndex(s => s === 'TIL'),
                padr:    hc.findIndex(s => s === 'PADR'),
                behadr:  hc.findIndex(s => s === 'BEHADR'),
                pnavn:   hc.findIndex(s => s === 'PNAVN'),
                rmate:   hc.findIndex(s => s === 'RMÅTE' || s === 'REISEMÅTE'),
                behov:   hc.findIndex(s => s === 'BEHOV'),
                leds:    hc.findIndex(s => s === 'L'),
                status:  hc.findIndex(s => s.includes('STATUS')),
            };
            d.querySelectorAll('tbody tr[name]').forEach(tr => {
                const reqIds = Array.from(tr.innerHTML.matchAll(/showReq\(this,\s*(\d+)/g)).map(m => m[1]);
                if (!reqIds.length) return;
                const ressurs = idx.ressurs >= 0 && tr.cells[idx.ressurs] ? tr.cells[idx.ressurs].textContent.trim() : '';
                const startA = celleVerdier(tr, idx.start);
                const oppA = celleVerdier(tr, idx.oppmtid);
                const fraA = celleVerdier(tr, idx.fra >= 0 ? idx.fra : idx.padr);
                const tilA = celleVerdier(tr, idx.til >= 0 ? idx.til : idx.behadr);
                const statusA = celleVerdier(tr, idx.status);
                const pnavnA = celleVerdier(tr, idx.pnavn);
                const rmateA = celleVerdier(tr, idx.rmate);
                const behovA = celleVerdier(tr, idx.behov);
                const n = Math.max(reqIds.length, fraA.length, oppA.length, 1);
                const v = (arr, j) => arr[j] != null ? arr[j] : (arr[0] || '');
                const legs = [];
                for (let j = 0; j < n; j++) {
                    legs.push({
                        start: v(startA, j), opp: v(oppA, j),
                        fra: v(fraA, j), til: v(tilA, j),
                        status: v(statusA, j), pnavn: v(pnavnA, j), rmate: v(rmateA, j), behov: v(behovA, j),
                        reqId: reqIds[j] != null ? reqIds[j] : (reqIds[0] || ''),  // pr-passasjer rekvisisjon (admin-oppslag)
                    });
                }
                rader.push({
                    reqId: reqIds[0], reqIds: reqIds.slice(), resId: tr.getAttribute('name'), fane, ressurs,
                    _behov: parseBehov(behovTekst(tr, idx.behov)),
                    _ledsN: ledsAntall(tr, idx.leds),
                    legs,
                });
            });
        });
        return rader;
    }

    /* ── Skann: hent inn- og ut-filter, gjenopprett brukerens filter ─ */
    async function hentFilter(fid) {
        await xhr('ajax-dispatch?did=all&search=none&t=' + Date.now());
        const txt = await xhr('ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + fid + '&t=' + Date.now());
        return parseDispatch(txt);
    }

    async function scan() {
        const origM = document.cookie.match(/thwerfilter=(\d+)/);
        const orig = origM ? origM[1] : '0';
        const inn = await hentFilter(aktivInn);
        const ut = await hentFilter(aktivUt);
        try {
            await xhr('ajax-dispatch?did=all&search=none&t=' + Date.now());
            await xhr('ajax-dispatch?did=all&action=openres&rid=-1&rfilter=' + orig + '&t=' + Date.now());
            document.cookie = 'thwerfilter=' + orig + '; path=/';
        } catch (e) { console.warn('[' + NAVN + '] gjenoppretting feilet:', e.message); }
        return { inn, ut };
    }

    // Batch kjøretid-matrise via matrise.php.
    async function hentMatrise(origins, destinations) {
        try {
            const r = await fetch(SERVER + '/matrise.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ origins, destinations }) });
            const j = await r.json();
            return j.ok ? j.sek : null;
        } catch (e) { return null; }
    }

    /* ── Forslag: ventende retur ⟷ returbil, via Google-omvei ─ */
    // R = returbil (kom inn fra nord, klar for retur til returmål E = første hentested).
    // V = ventende (pasient i Oslo → hjem D). Match hvis V er «på veien» til E (liten omvei)
    // OG R er i Oslo innenfor V sitt vindu. omvei = (Oslo→D + D→E) − Oslo→E.
    // ventende er allerede grovfiltrert i berik (kun de tidsmessig aktuelle), og har _rt satt.
    // Haversine — luftlinje i km mellom to [lat, lon]-punkt. Gratis omvei-forfilter (× VEIFAKTOR).
    function haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371, rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    // NISSY lagrer leveringssted/møteplass-koordinater som UTM sone 33N (EPSG:32633), «northing/easting».
    // Invers UTM → WGS84 [lat,lon]. Verifisert mot Moelv (267108E/6761279N → 60.918,10.703).
    function utm33ToLatLon(easting, northing) {
        const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996;
        const e2 = f * (2 - f), ep2 = e2 / (1 - e2);
        const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
        const x = easting - 500000, M = northing / k0;
        const mu = M / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256));
        const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
            + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
            + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
        const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2), T1 = Math.tan(phi1) ** 2;
        const C1 = ep2 * Math.cos(phi1) ** 2, R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(phi1) ** 2, 1.5);
        const D = x / (N1 * k0);
        const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D * D / 2
            - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4 / 24
            + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6 / 720);
        const lon0 = 15 * Math.PI / 180;
        const lon = lon0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6
            + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5 / 120) / Math.cos(phi1);
        const ll = [lat * 180 / Math.PI, lon * 180 / Math.PI];
        return (isFinite(ll[0]) && isFinite(ll[1])) ? ll : null;
    }
    async function beregnForslag(ventende, biler, diag) {
        diag = diag || {};
        ventende.forEach(r => r._treff = []);
        diag.fVentende = ventende.length; diag.fBiler = biler.length;
        if (!ventende.length || !biler.length) { diag.stopp = 'ingen kandidat-ventende eller returbiler'; return; }
        biler.forEach(p => { if (!p._ri) p._ri = returInfo(p); });
        ventende.forEach(v => {
            const vl = v.legs[0] || {};
            const D = String(vl.til || '').trim();
            const vKlar = parseTid(vl.opp || vl.start);
            v._fi = (D && vKlar !== null) ? { D, vKlar, vFrist: vKlar + Math.max((v._rt ? v._rt.sek / 60 : 0), VENTETID_MIN) } : null;
        });
        // Presist tidsvindu med reisetid: behold kun ventende som har en returbil i vinduet.
        const relevante = ventende.filter(v => v._fi && biler.some(p =>
            p._ri.ank !== null && p._ri.fra && p._ri.ank >= v._fi.vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= v._fi.vFrist));
        diag.relevante = relevante.length;
        if (!relevante.length) { diag.stopp = 'ingen ventende har returbil i tidsvindu (±' + MATCH_TIDSVINDU_MIN + ' min)'; return; }

        // Geokod hjem (D), returmål (E = der returbilen skal videre) OG bilens HUB (der den er nå = innkjøringens
        // til). Omvei = (hub→D + D→E − hub→E) via haversine×VEIFAKTOR — ankret per BIL på dens faktiske posisjon,
        // IKKE globalt Oslo (en Kongsvinger-bil skal ikke matche Oslo-pasienter med ~0 omvei).
        // rico.js saboterer Set/forEach/Array.from → bygg adresse-lista med rene for-løkker.
        const koord = {};
        const adrListe = [];
        const leggTilAdr = s => { s = String(s || '').trim(); if (s && !Object.prototype.hasOwnProperty.call(koord, s)) { koord[s] = null; adrListe.push(s); } };
        for (let i = 0; i < relevante.length; i++) leggTilAdr(relevante[i]._fi.D);
        for (let i = 0; i < biler.length; i++) { leggTilAdr(biler[i]._ri.fra); leggTilAdr(biler[i]._ri.hub); }
        diag.geokoder = adrListe.length;
        const _res = await mapLimit(adrListe, 6, a => hentKoord(a));  // maks 6 samtidige geokod-kall
        let nKoord = 0;
        for (let i = 0; i < adrListe.length; i++) { koord[adrListe[i]] = _res[i]; if (gyldigKoord(_res[i])) nKoord++; }
        diag.geokodeOk = nKoord;
        const hav = (k1, k2) => haversineKm(k1[0], k1[1], k2[0], k2[1]);
        let parKombo = 0, besteOmvei = Infinity;  // diagnose: hvor mange tids-OK par vurdert + minste omvei
        relevante.forEach(v => {
            const { D, vKlar, vFrist } = v._fi;
            const dK = koord[D];
            if (!gyldigKoord(dK)) return;
            const treff = [];
            biler.forEach(p => {
                const E = String(p._ri.fra || '').trim();
                if (!E || p._ri.ank === null) return;
                if (!(p._ri.ank >= vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= vFrist)) return; // returbil i tide
                const eK = koord[E], hK = koord[String(p._ri.hub || '').trim()] || OSLO_KOORD;  // anker = bilens posisjon
                if (!gyldigKoord(eK) || !gyldigKoord(hK)) return;
                const oD = hav(hK, dK), oE = hav(hK, eK), dE = hav(dK, eK);  // hub→D, hub→E, D→E
                const omveiKm = Math.max(0, (oD + dE - oE) * VEIFAKTOR);
                const omvei = Math.round(omveiKm / OMVEI_KMH * 60);  // km → min
                parKombo++; if (omvei < besteOmvei) besteOmvei = omvei;
                if (omvei <= OMVEI_MAKS_MIN) treff.push({ pRow: p, ank: p._ri.ank, omvei: omvei, sted: stedFraAdr(p._ri.fra) });
            });
            treff.sort((a, b) => a.omvei - b.omvei || a.ank - b.ank);
            v._treff = treff;
        });
        diag.tidsOkKombo = parKombo; diag.besteOmvei = isFinite(besteOmvei) ? besteOmvei : null;
        let nTreff = 0, nMed = 0; relevante.forEach(v => { nTreff += v._treff.length; if (v._treff.length) nMed++; });
        diag.treff = nTreff; diag.medTreff = nMed;
        if (!nTreff) diag.stopp = (nKoord < adrListe.length ? 'geokoding bommet på ' + (adrListe.length - nKoord) + ' adresser; ' : '') + 'ingen innen omvei-grense (' + OMVEI_MAKS_MIN + ' min)';
    }

    /* ── Par to ventende direkte (når ingen returbil er mulig) ─ */
    // Samkjøring av to ventende = én bil henter BEGGE (på hvert sitt hentested) og leverer begge hjem
    // — inntil 4 adresser (2 hente + 2 levere). Gyldig hvis: hentetidene er nær, kapasitet holder,
    // hentestedene er nær hverandre (én naturlig bil), og omveien er liten. omvei = korteste kombinerte
    // rute (4 rekkefølger: hent begge → lever begge) − lengste enkelttur. (samkjorer.js geografiskMatch.)
    async function beregnPar(pool, diag) {
        diag = diag || {};
        pool.forEach(v => v._par = []);
        if (pool.length < 2) return;
        // Geokod BÅDE fra (hentested) og til (hjem). Ren for-løkke (rico saboterer Set/forEach/Array.from).
        const koord = {};
        const adrListe = [];
        const leggTilAdr = s => { s = String(s || '').trim(); if (s && !Object.prototype.hasOwnProperty.call(koord, s)) { koord[s] = null; adrListe.push(s); } };
        for (let i = 0; i < pool.length; i++) { const l = pool[i].legs[0] || {}; leggTilAdr(l.fra); leggTilAdr(l.til); }
        const _res = await mapLimit(adrListe, 6, a => hentKoord(a));  // maks 6 samtidige geokod-kall
        let nKoord = 0;
        for (let i = 0; i < adrListe.length; i++) { koord[adrListe[i]] = _res[i]; if (gyldigKoord(_res[i])) nKoord++; }
        diag.parGeoOk = nKoord; diag.parGeo = adrListe.length;
        const hav = (k1, k2) => haversineKm(k1[0], k1[1], k2[0], k2[1]);
        const K = s => koord[String(s || '').trim()];
        let pTid = 0, pKap = 0, pGeo = 0, pHent = 0, pBeste = Infinity;
        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                const a = pool[i], b = pool[j];
                const la = a.legs[0] || {}, lb = b.legs[0] || {};
                const ta = parseTid(la.opp || la.start), tb = parseTid(lb.opp || lb.start);
                if (ta === null || tb === null || Math.abs(ta - tb) > MATCH_TIDSVINDU_MIN) continue;
                pTid++;
                const kap = kapasitetsSjekk([passObj(a), passObj(b)]);
                if (!kap.ok) continue;
                pKap++;
                const fA = K(la.fra), tA = K(la.til), fB = K(lb.fra), tB = K(lb.til);
                if (!gyldigKoord(fA) || !gyldigKoord(tA) || !gyldigKoord(fB) || !gyldigKoord(tB)) continue;
                pGeo++;
                // Hentestedene må være nær hverandre — ellers er det ikke én naturlig bil (Oslo sentrum + Ahus = nei).
                if (hav(fA, fB) > MAKS_HENTEAVSTAND_KM) continue;
                pHent++;
                // Korteste kombinerte rute (hent begge → lever begge, 4 rekkefølger) − lengste enkelttur.
                const dA = hav(fA, tA), dB = hav(fB, tB), lengst = Math.max(dA, dB);
                const fab = hav(fA, fB), tab = hav(tA, tB);
                const kombinert = Math.min(
                    fab + hav(fB, tA) + tab,   // fA→fB→tA→tB
                    fab + hav(fB, tB) + tab,   // fA→fB→tB→tA
                    fab + hav(fA, tA) + tab,   // fB→fA→tA→tB
                    fab + hav(fA, tB) + tab    // fB→fA→tB→tA
                );
                const omveiKm = Math.max(0, (kombinert - lengst) * VEIFAKTOR);
                const omvei = Math.round(omveiKm / OMVEI_KMH * 60);
                if (omvei < pBeste) pBeste = omvei;
                if (omvei <= PAR_OMVEI_MAKS_MIN) {
                    a._par.push({ medRow: b, omvei: omvei, sv: !!kap.svVarsel });
                    b._par.push({ medRow: a, omvei: omvei, sv: !!kap.svVarsel });
                }
            }
        }
        diag.parTidOk = pTid; diag.parKapOk = pKap; diag.parGeoParOk = pGeo; diag.parHentOk = pHent; diag.parBesteOmvei = isFinite(pBeste) ? pBeste : null;
        pool.forEach(v => v._par.sort((x, y) => x.omvei - y.omvei));
    }

    /* ── Fane ──────────────────────────────────────── */
    let win = null;

    function aapnePopup() {
        win = window.open('', 'OmraadeAssistent');
        if (!win) { alert('Tillat popup/faner for å bruke Område assistent.'); return; }
        win.document.open();
        win.document.write(
            '<!doctype html><html lang="no"><head><meta charset="utf-8">' +
            '<title>Område assistent</title><style>' +
            '*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif}' +
            'body{background:#0f172a;color:#e2e8f0;padding:22px;font-size:13px}' +
            '#rot{max-width:1100px;margin:0 auto}' +
            'h1{font-size:18px;margin-bottom:2px}.sub{color:#64748b;font-size:11px;margin-bottom:16px}' +
            '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
            '.kol{background:#1e293b;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column}' +
            '.kol h2{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:8px;display:flex;align-items:center;gap:8px}' +
            '.liste{overflow:auto;max-height:55vh}' +
            '.kort{background:#0f172a;border-radius:7px;padding:7px 9px;margin-bottom:6px;border-left:3px solid #334155}' +
            '.rad{display:flex;justify-content:space-between;gap:8px;align-items:center}' +
            '.tid{font-weight:700;color:#fbbf24}' +
            '.adr{color:#cbd5e1;font-size:12px;margin-top:2px}.navn{color:#94a3b8;font-size:11px;margin-top:2px}' +
            '.rt{color:#fbbf24;font-size:11px;margin-top:3px;font-weight:600}' +
            '.rt.urgent{color:#fecaca;background:#7f1d1d;border-radius:5px;padding:2px 6px;animation:puls 1.2s infinite}' +
            '@keyframes puls{0%,100%{opacity:1}50%{opacity:.55}}' +
            '.match{color:#86efac;font-size:11px;margin-top:3px;font-weight:600}' +
            '.ress{font-weight:700;color:#7dd3fc;font-size:13px}' +
            '.leg{font-size:12px;color:#cbd5e1;margin-top:3px;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}' +
            '.st{font-size:9px;color:#cbd5e1;background:#334155;border-radius:5px;padding:0 5px}' +
            '.b{font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;margin-left:4px}' +
            '.b.vent{background:#7c2d12;color:#fed7aa}.b.paga{background:#14532d;color:#bbf7d0}' +
            '.forslag{background:#052e16;border-left-color:#22c55e}.forslag .vei{color:#86efac;font-size:11px;margin-top:3px}' +
            '.parp{padding:2px 0}.parp+.parp{border-top:1px solid #14532d;margin-top:5px;padding-top:5px}' +
            '.kartbtn{background:#0c4a6e;border:1px solid #0ea5e9;color:#bae6fd;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;cursor:pointer;margin-top:5px}' +
            '.kartbtn:hover{background:#0ea5e9;color:#0f172a}' +
            '#skjOverlay{position:fixed;inset:24px;z-index:3000;background:#0b1220;border:1px solid #334155;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.6)}' +
            '.skjtopp{padding:9px 14px;background:#1e293b;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px}' +
            '.skjtopp b{color:#e2e8f0}.skjtopp .legg{font-size:11px;color:#94a3b8;display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
            '.skjtopp .pa{color:#7dd3fc}.skjtopp .pb{color:#fdba74}' +
            '.skjkropp{flex:1;display:flex;min-height:0}' +
            '.skjpanel{width:290px;flex-shrink:0;overflow:auto;background:#0f172a;border-right:1px solid #334155;padding:10px 12px;font-size:12px}' +
            '.skjpanel h4{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;margin:12px 0 6px}.skjpanel h4:first-child{margin-top:0}' +
            '.skjpk{background:#1e293b;border-radius:7px;padding:7px 9px;margin-bottom:7px;border-left:3px solid #334155}' +
            '.skjpk .t{font-weight:700;color:#fbbf24}.skjpk .n{color:#e2e8f0;font-weight:600}.skjpk .a{color:#cbd5e1;font-size:11px;margin-top:3px}' +
            '.skjstopp{display:flex;gap:8px;align-items:flex-start;margin-bottom:7px}' +
            '.skjnr{flex-shrink:0;width:20px;height:20px;border-radius:50%;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1px solid #fff}' +
            '#skjKartDiv{flex:1;background:#0b1220;min-width:0}' +
            '#skjLukk{background:#334155;border:none;color:#e2e8f0;border-radius:7px;padding:5px 12px;cursor:pointer;font-size:12px;font-weight:600}' +
            '#skjLukk:hover{background:#475569}' +
            '.skjmrk{display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px #000;font-size:13px}' +
            '.kort.harmatch{border-left-color:#22c55e!important;box-shadow:inset 3px 0 0 #22c55e,0 0 0 1px #22c55e44;background:#0c1f14}' +
            '.kort.harmatch .ress,.kort.harmatch .tid{color:#86efac}' +
            '.trakt{color:#64748b;font-size:11px;margin:-6px 0 12px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}' +
            '.trakt b{color:#86efac;font-weight:700}.trakt .stopp{color:#fca5a5}' +
            '.gdtgl{font-size:10px;text-transform:none;letter-spacing:0;color:#94a3b8;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:3px}' +
            '.gdtgl input{cursor:pointer;margin:0}' +
            '.uonsktgl{font-size:10px;text-transform:none;letter-spacing:0;color:#94a3b8;font-weight:400;cursor:pointer;display:inline-flex;align-items:center;gap:3px;margin-left:6px}' +
            '.uonsktgl input{cursor:pointer;margin:0}' +
            '.teller{background:#334155;border-radius:10px;padding:1px 8px;font-size:11px;color:#cbd5e1;margin-left:auto}' +
            '.tom{color:#475569;font-style:italic;padding:6px 0;font-size:12px}' +
            '.merk{cursor:pointer;border:none;border-radius:5px;width:18px;height:18px;font-size:10px;line-height:1;background:#334155;color:#1e293b;padding:0;margin-right:4px;vertical-align:middle}' +
            '.merk.paa{background:rgb(148,169,220);color:#0f172a}' +
            '.merk.mangler{background:#7f1d1d;color:#fecaca}' +
            '.velger{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}' +
            '.omr-btn{background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:10px;padding:14px 22px;font-size:15px;font-weight:600;cursor:pointer}' +
            '.omr-btn:hover{background:#334155;border-color:#0ea5e9}' +
            '.bytt{background:none;border:1px solid #334155;color:#94a3b8;border-radius:8px;padding:3px 10px;font-size:11px;cursor:pointer;margin-left:8px;vertical-align:middle}' +
            '.bytt:hover{color:#e2e8f0;border-color:#0ea5e9}' +
            '.bytt.frossen{color:#7dd3fc;border-color:#0ea5e9;background:#0c4a6e}' +
            '.bytt.autopaa{color:#bbf7d0;border-color:#16a34a;background:#14532d}' +
            '.bytt.autoav{color:#fecaca;border-color:#ef4444;background:#7f1d1d}' +
            '#kartwrap{position:fixed;inset:0;z-index:5}' +
            '#kartDiv{position:absolute;inset:0;background:#0b1220}' +
            '.kartpanel{position:absolute;top:64px;bottom:14px;width:300px;overflow:auto;background:rgba(15,23,42,.85);border:1px solid #334155;border-radius:10px;padding:9px;z-index:1000}' +
            '.kartpanel.venstre{left:14px}.kartpanel.hoyre{right:14px}' +
            '.kartpanel h3{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:7px;display:flex;gap:6px;align-items:center}' +
            '.kk{background:#0f172a;border-radius:6px;padding:5px 8px;margin-bottom:5px;border-left:5px solid #334155;font-size:11px;cursor:pointer}' +
            '.kk:hover{background:#1e293b}.kk .t{font-weight:700;color:#fbbf24}.kk .n{color:#f1f5f9;font-weight:600}' +
            '.kk .kkr{display:flex;justify-content:space-between;align-items:center;gap:6px}' +
            '.kk .kksub{color:#cbd5e1;font-size:10px;margin-top:1px}' +
            '.kk .kkmeta{font-size:10px;margin-top:2px;display:flex;gap:5px;align-items:center;flex-wrap:wrap;color:#94a3b8}' +
            '.kk .kkmeta.urg{color:#fecaca;font-weight:600}' +
            '.kk .kkpas{margin-top:3px;font-size:10px;color:#e2e8f0;display:flex;flex-direction:column;gap:1px}' +
            '.kk .kkpas .psym{display:inline-block;width:15px;text-align:center;margin-right:2px}' +
            '.kk .kkpas .plr{display:flex;align-items:center;gap:4px}' +
            '.kk .kkpas .pln{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '.kk .kkpas .plst{flex-shrink:0;font-size:9px;font-weight:700;white-space:nowrap;cursor:help}' +
            '.kk .kkpas .plretur{flex-shrink:0;font-size:9px;font-weight:700;white-space:nowrap;cursor:help;margin-left:auto}' +
            '.kk .kkpas .kksek{font-size:8px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:#a78bfa;margin:5px 0 2px;padding-top:4px;border-top:1px solid #334155}' +
            '.kk .kkpas .kksek.inn{color:#86efac;margin-top:1px;padding-top:0;border-top:none}' +
            '.kk .kkpas .kkklar{margin-top:4px;font-size:10px;font-weight:700;color:#a78bfa}' +
            '.kk .kkpas .plrr{flex-shrink:0;font-size:10px;font-weight:700;white-space:nowrap;cursor:help;margin-left:2px}' +
            '.kk .kketa{margin-top:3px;font-size:10px;font-weight:700;cursor:help}' +
            '.kk .kklokal{margin-top:3px;font-size:10px;font-weight:700;color:#f59e0b;cursor:help}' +
            '.kk.valgt{outline:2px solid #38bdf8;outline-offset:-1px;box-shadow:0 0 8px rgba(56,189,248,.6)}' +
            '.kk .kst{font-size:9px;color:#94a3b8;white-space:nowrap;flex-shrink:0}.kk .kst.kjort{color:#6ee7b7}' +
            '.karttopp{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(15,23,42,.92);border:1px solid #334155;border-radius:10px;padding:7px 14px;display:flex;align-items:center;gap:12px;font-size:12px;color:#e2e8f0}' +
            '.karttopp input[type=range]{width:180px;accent-color:#0ea5e9}' +
            '.karttopp select{background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:5px;padding:2px 5px;font-size:11px}' +
            '.karttopp label{display:inline-flex;align-items:center;gap:4px;cursor:pointer}' +
            '.tabbar{position:absolute;top:58px;left:50%;transform:translateX(-50%);z-index:1000;display:flex;gap:4px;background:rgba(15,23,42,.92);border:1px solid #334155;border-radius:8px;padding:4px}' +
            '.tabbar .tab{background:transparent;color:#94a3b8;border:none;border-radius:6px;padding:5px 14px;font-size:12px;font-weight:600;cursor:pointer}' +
            '.tabbar .tab:hover{color:#e2e8f0}' +
            '.tabbar .tab.aktiv{background:#0ea5e9;color:#fff}' +
            '.tabbar .tabn{background:#f59e0b;color:#0f172a;border-radius:9px;padding:0 6px;font-size:10px;font-weight:700;margin-left:2px}' +
            '.tabbar .tabn:empty{display:none}' +
            '.hlsxretn{color:#cbd5e1;font-size:11px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 7px;padding:5px 9px;background:rgba(15,23,42,.9);border-radius:8px}' +
            '.hlsxretn label{display:inline-flex;align-items:center;gap:3px;cursor:pointer}' +
            '.hlsxretn input{cursor:pointer;margin:0}' +
            '.hlsxcb{display:inline-flex;align-items:center;gap:3px;cursor:pointer;color:#cbd5e1;font-size:11px}' +
            '.hlsxcb:first-of-type{margin-left:auto}' +
            '.hlsxrutestat{font-size:10px;color:#94a3b8}' +
            '.hlsx-skjul-meld .hmsgline{display:none}' +
            '.bussmrk{width:28px;height:28px;border-radius:50%;background:#7c3aed;border:2px solid #fff;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 4px #000}' +
            '.bussmrk.start{background:#0ea5e9;font-size:13px}' +
            '.bussmrk.ukjent{background:#ef4444}' +
            '.bussmrk.pastig{background:#16a34a}' +
            '.bussmrk-pa{position:absolute;top:-6px;right:-8px;background:#16a34a;color:#fff;border:1.5px solid #fff;border-radius:8px;font-size:9px;font-weight:700;padding:0 3px;line-height:13px;box-shadow:0 0 2px #000}' +
            '.hlsxgrp{margin-bottom:10px}' +
            '.hlsxgh{font-size:12px;font-weight:700;color:#1e293b;padding:5px 9px;margin:4px 0 2px;background:#fbbf24;border-left:4px solid #1d4ed8;border-radius:4px;display:flex;justify-content:space-between;align-items:center}' +
            '.hlsxgh .ant{font-size:10px;font-weight:700;color:#1e293b;background:#fde68a;border-radius:8px;padding:1px 7px}' +
            // HLSX-søyla er TRANSPARENT (Thomas) — hver passasjer er et eget «pasientkort» med luft mellom, og
            // tilbringer-taxien et eget kort til VENSTRE. Header/retn-rad får egen lesbar bakgrunn.
            '.hlsxrad{display:flex;gap:6px;align-items:stretch;margin-bottom:6px}' +
            '.paskort{flex:1;font-size:11px;color:#cbd5e1;background:rgba(15,23,42,.9);border:1px solid #334155;border-radius:8px;padding:6px 9px}' +
            '.hlsxtaxi{flex:0 0 56px;display:flex;align-items:stretch}' +   // fast venstre-gutter → pasientkortene flukter; taxi vises kun for de som har tilbringer
            '.taxibox{width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;background:rgba(15,23,42,.9);border:1px solid #334155;border-radius:8px;padding:4px 2px;font-size:10px;font-weight:700}' +
            '.taxibox .loyve{color:#e2e8f0;font-size:10px;font-weight:700;letter-spacing:.02em;word-break:break-all;line-height:1.05;text-align:center}' +
            '.hlsxrad .t{color:#fbbf24;font-weight:700;flex-shrink:0}' +
            '.hlsxrad .hst{font-size:10px;font-weight:700;white-space:nowrap}' +
            '.hlsxrad .frab{display:inline-block;margin-top:3px;font-size:10px;font-weight:600}' +
            '#hlsxV,#hlsxH{width:440px;background:transparent;border:none}' +   // transparent søyle (bredere for meldinger)
            '#hlsxV h3,#hlsxH h3{background:rgba(15,23,42,.9);border-radius:8px;padding:5px 9px;margin-bottom:7px}' +
            '.hlsxrad .hmline{font-size:10px;line-height:1.35;margin-top:3px;padding:3px 7px;border-radius:5px;background:#0f172a;white-space:normal}' +
            '.hlsxrad .hmline.prk{color:#fde68a;border-left:2px solid #f59e0b}' +
            '.hlsxrad .hmline.tr{color:#bae6fd;border-left:2px solid #38bdf8}' +
            '.leaflet-container{background:#0b1220}' +
            '</style></head><body><div id="rot"><p class="tom">Henter…</p></div></body></html>'
        );
        win.document.close();
    }

    function merkKnapp(resId) {
        return '<button class="merk' + (erMerket(resId) ? ' paa' : '') + '" data-merk="' + esc(resId) + '" title="Merk i NISSY (blå)">●</button>';
    }
    function statusBadge(r) {
        return r.fane === 'ventendeOppdrag' ? '<span class="b vent">VENT</span>' : '<span class="b paga">PÅGÅ</span>';
    }
    function legLinje(l) {
        return '<div class="leg"><span class="tid">' + esc(l.opp || l.start || '–') + '</span>' +
            '<span>' + esc(l.fra || '?') + ' →<br>' + esc(l.til || '?') + '</span>' +
            (l.status ? '<span class="st">' + esc(l.status) + '</span>' : '') + '</div>';
    }
    function kildeTag(r) {
        if (aktivKilder.length <= 1) return '';
        const d = delomraade(r);
        if (!d.navn) return '';
        return '<span class="b" style="background:' + d.farge + '33;color:' + d.farge + '">' + esc(d.navn) + '</span>';
    }
    function radKort(r) {
        const farge = delomraade(r).farge || '#334155';
        if (r.ressurs) {
            const navnliste = Array.from(new Set(r.legs.map(l => l.pnavn).filter(Boolean))).join(', ');
            const sted = stedFraAdr(returInfo(r).fra);
            const turRetur = erTurRetur(r);
            const base = egneReturPassasjerer(r);
            const ledig = ledigePlasser(base);             // restkapasitet på returen
            const { tatt, sv } = fyllBil(base, (bilMatchMap[r.resId] || []).slice());
            // «tar» = kun de som faktisk får plass (fyllBil capper til kapasitet), sortert beste omvei først.
            // «ikke plass»-lista er fjernet (ren støy for operatøren).
            const tattSort = tatt.slice().sort((a, b) => (a.t && a.t.omvei || 0) - (b.t && b.t.omvei || 0));
            const merk = k => merkKnapp(k.v.resId) + ' ' + esc(stedFraAdr((k.v.legs[0] || {}).til) || (k.v.legs[0] || {}).pnavn || '?') + (k.t && k.t.omvei ? ' <span style="color:#86efac">+' + k.t.omvei + ' min</span>' : '') + ' ' + behovBadges(k.v) + ledsBadge(k.v);
            const plassKlasse = ledig === 0 ? 'rt' : 'match';
            const plassLinje = '<div class="' + plassKlasse + '">↩ retur: ' + ledig + ' av ' + MAKS.passasjerer + ' plasser ledig'
                + (tattSort.length ? ' · tar ' + tattSort.map(merk).join(' · ') : '')
                + (sv ? ' · ⚠ krever SV (ekstra bagasjeplass)' : '') + '</div>';
            // Tur/retur: pasienten blir i bilen på returen → vis behov/ledsager (opptar seter).
            const innInfo = turRetur ? behovBadges(r) + ledsBadge(r) : '';
            const trBadge = turRetur ? '<span class="b" title="Tur/retur samme bil — pasienten kjører tilbake; kun restkapasitet er ledig" style="background:#33415588;color:#fbbf24">🔁 tur/retur</span>' : '';
            return '<div class="kort' + (tatt.length ? ' harmatch' : '') + '" style="border-left-color:' + farge + (ledig === 0 ? ';opacity:.6' : '') + '">' +
                '<div class="rad"><span class="ress">🚐 ' + esc(r.ressurs) + (sted ? ' – ' + esc(sted) : '') + '</span>' +
                '<span>' + merkKnapp(r.resId) + innInfo + trBadge + kildeTag(r) + statusBadge(r) + '</span></div>' +
                r.legs.map(legLinje).join('') +
                (navnliste ? '<div class="navn">' + esc(navnliste) + '</div>' : '') +
                plassLinje +
                '</div>';
        }
        const l0 = r.legs[0] || {};
        const venteMin = Math.max((r._rt ? r._rt.sek / 60 : 0), VENTETID_MIN);
        const Tmin = parseTid(l0.opp || l0.start);
        const fristMin = Tmin !== null ? Tmin + venteMin : null;        // hentes innen
        const sendUtMin = fristMin !== null ? fristMin - VARSEL_MIN : null; // frist for utsendelse
        const urgent = sendUtMin !== null && naaMin() >= sendUtMin;
        const rtLinje = '<div class="rt' + (urgent ? ' urgent' : '') + '">' + (urgent ? '🔔 ' : '⏱ ')
            + (r._rt ? 'reisetid ' + esc(r._rt.tekst) : 'ventetid ' + fmtMin(venteMin))
            + (fristMin !== null ? ' · hentes innen ' + tidStr(fristMin) + ' · send ut ' + tidStr(sendUtMin) : '')
            + (urgent ? ' — SEND UT' : '') + '</div>';
        const _tr = synligeTreff(r);
        const matchLinje = _tr.length
            ? '<div class="match">🔗 ' + _tr.slice(0, 3).map(t => merkKnapp(t.pRow.resId) + ' '
                + (t.pRow.ressurs ? esc(t.pRow.ressurs) : 'bil') + (t.sted ? ' (' + esc(t.sted) + ')' : '')
                + ' ank ' + tidStr(t.ank) + (t.omvei ? ' · +' + t.omvei + ' min' : '')).join(' · ') + '</div>'
            : '';
        return '<div class="kort' + (_tr.length ? ' harmatch' : '') + '" style="border-left-color:' + farge + '">' +
            '<div class="rad"><span class="tid">' + esc(l0.opp || l0.start || '–') + '</span>' +
            '<span>' + merkKnapp(r.resId) + behovBadges(r) + ledsBadge(r) + kildeTag(r) + statusBadge(r) + '</span></div>' +
            '<div class="adr">' + esc(l0.fra || '?') + ' →<br>' + esc(l0.til || '?') + '</div>' +
            (l0.pnavn ? '<div class="navn">' + esc(l0.pnavn) + (l0.rmate && !/^TAX$/i.test(l0.rmate.trim()) ? ' · ' + esc(l0.rmate) : '') + '</div>' : '') +
            rtLinje + matchLinje +
            '</div>';
    }

    // Berik ved skann: reisetid per ventende + omvei-forslag (Google). Kun her, ikke ved 30s-re-rendring.
    async function berik(data) {
        const utVent = dedupResId(data.ut).filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r));
        const innPaga = dedupResId(data.inn).filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r));
        utVent.forEach(r => { r._treff = []; r._par = []; });
        const _nettStart = _nettOppslag;
        const diag = { utVent: utVent.length, innPaga: innPaga.length };
        // Match kun mot biler som kommer til vårt område (kan plukke opp der) OG har ledig plass
        // på returen (alenebil/full tur/retur = 0). Turer som aldri når området er irrelevante.
        const naarOmr = innPaga.filter(r => kommerTilOmraadet(r));
        const matchBiler = naarOmr.filter(r => ledigePlasser(egneReturPassasjerer(r)) > 0);
        diag.naarOmraadet = naarOmr.length; diag.medLedigPlass = matchBiler.length;
        matchBiler.forEach(p => p._ri = returInfo(p));
        // GROVFILTER (uten reisetid): kun ventende som tidsmessig kan møte en returbil. Av
        // hundrevis ventende er som regel bare en håndfull aktuelle nå — vi slipper å regne
        // reisetid + omvei-matrise for alle (som ga Google-timeout/500).
        const kandidater = utVent.filter(v => {
            const vl = v.legs[0] || {};
            const vKlar = parseTid(vl.opp || vl.start);
            if (vKlar === null || !String(vl.til || '').trim()) return false;
            return matchBiler.some(p => p._ri.ank !== null && p._ri.fra &&
                p._ri.ank >= vKlar - MATCH_TIDSVINDU_MIN && p._ri.ank <= vKlar + MAKS_VENTETID_MIN);
        });
        diag.kandidater = kandidater.length;
        // TEST-GRENSE: geokod/match kun de KANDIDAT_MAKS nærmeste i tid — holder API-/CPU-lasten nede
        // mens vi tester. Sortert på hentetid (snarest først = mest aktuelle nå).
        kandidater.sort((a, b) => (parseTid((a.legs[0] || {}).opp || (a.legs[0] || {}).start) ?? 9999) - (parseTid((b.legs[0] || {}).opp || (b.legs[0] || {}).start) ?? 9999));
        let kand = kandidater;
        if (kand.length > KANDIDAT_MAKS) { diag.kappet = kand.length - KANDIDAT_MAKS; kand = kand.slice(0, KANDIDAT_MAKS); }
        diag.brukt = kand.length;
        // Reisetid kun for kandidatene (presist tidsvindu + omvei avgjøres så i beregnForslag).
        await mapLimit(kand, 6, async r => { const l = r.legs[0] || {}; r._rt = await hentReisetid(l.fra, l.til); });  // maks 6 samtidige reisetid-kall
        await beregnForslag(kand, matchBiler, diag);

        // FALLBACK — ventende↔ventende: finn par i samme retning for de som IKKE fikk returbil.
        // (Returbil er gratis retur og prioriteres; direkte paring sparer i det minste én bil.)
        const naa = naaMin();
        let parPool = utVent.filter(v => {
            if (synligeTreff(v).length) return false;  // har (synlig) returbil-forslag → håndtert
            const t = parseTid((v.legs[0] || {}).opp || (v.legs[0] || {}).start);
            return t !== null && String((v.legs[0] || {}).til || '').trim() && t >= naa - 30 && t <= naa + PAR_VINDU_MIN;
        });
        parPool.sort((a, b) => (parseTid((a.legs[0] || {}).opp || (a.legs[0] || {}).start)) - (parseTid((b.legs[0] || {}).opp || (b.legs[0] || {}).start)));
        if (parPool.length > PAR_MAKS) parPool = parPool.slice(0, PAR_MAKS);
        await beregnPar(parPool, diag);
        diag.parPool = parPool.length;
        let nPar = 0; utVent.forEach(v => { if ((v._par || []).length) nPar++; });  // rico.js ødelegger reduce → tell med forEach
        diag.par = nPar;
        diag.nyeOppslag = _nettOppslag - _nettStart;  // faktiske nettverkskall denne runden (cache-treff = 0)
        sisteDiag = diag;
        try { window.__omr_diag = diag; } catch (e) {}
        console.log('[' + NAVN + '] match-trakt:', JSON.stringify(diag));
    }

    /* ── Frys / autooppdater ──────────────────────────── */
    function erFrosset() { return Date.now() < frysTil; }
    function oppdaterKnapper() {
        if (!win || win.closed) return;
        const frosset = erFrosset();
        const fb = win.document.getElementById('frysBtn');
        if (fb) {
            fb.textContent = frosset ? '❄️ Frys (' + Math.ceil((frysTil - Date.now()) / 1000) + 's)' : '❄️ Frys ' + (FRYS_MS / 1000) + 's';
            fb.classList.toggle('frossen', frosset);
        }
        const ab = win.document.getElementById('autoBtn');
        if (ab) {
            ab.classList.toggle('autoav', frosset);
            ab.classList.toggle('autopaa', !frosset);
        }
    }
    function frysNa() { frysTil = Date.now() + FRYS_MS; oppdaterKnapper(); }   // (re)start 60 s
    function startAuto() { frysTil = 0; oppdaterKnapper(); tikk(); }           // gjenoppta straks + frisk skann

    function render(data) {
        if (!win || win.closed) return;
        const utD = dedupResId(data.ut);
        const innD = dedupResId(data.inn);
        const utVent = utD.filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r));
        // Kun returbiler hvis tur ender i vårt område (kjørekontorets postnr-soner). Turer som
        // aldri når området (f.eks. Jessheim↔Gjøvik — Innlandet kjørekontor) hører ikke hjemme.
        const innPaga = innD.filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r) && !(skjulGD && erGD(r)) && kommerTilOmraadet(r));
        const helse = dedupResId([].concat(data.ut, data.inn)).filter(erHlsx);

        const forslag = utVent.filter(r => synligeTreff(r).length);

        // Reverse-kobling: hvilke ventende kan hver returbil ta — grunnlag for plass-beregning.
        bilMatchMap = {};
        utVent.forEach(v => synligeTreff(v).forEach(t => {
            const id = t.pRow.resId;
            (bilMatchMap[id] = bilMatchMap[id] || []).push({ v, t });
        }));

        // Ventende-par (samkjør to direkte) — dedup a↔b, kun par der begge fortsatt mangler returbil.
        const parSett = new Set(), parListe = [];
        utVent.forEach(v => (v._par || []).forEach(p => {
            if (synligeTreff(v).length || synligeTreff(p.medRow).length) return;  // én fikk returbil → dropp paret
            const key = [v.resId, p.medRow.resId].sort().join('|');
            if (parSett.has(key)) return; parSett.add(key);
            parListe.push({ a: v, b: p.medRow, omvei: p.omvei, sv: p.sv });
        }));
        parListe.sort((x, y) => x.omvei - y.omvei);
        // Grådig maks-matching: hver ventende kan kun sitte i ÉN bil. Velg beste (minste omvei) par først,
        // «bruk opp» begge pasientene, ta så det nest beste blant de gjenværende → konfliktfri ANBEFALT plan
        // (den beste samkjøringen for hver pasient). Resten = ANDRE muligheter (overlappende alternativer).
        const parBrukt = {};
        const parAnbefalt = [], parAndre = [];
        for (let i = 0; i < parListe.length; i++) {
            const p = parListe[i];
            if (!parBrukt[p.a.resId] && !parBrukt[p.b.resId]) { parBrukt[p.a.resId] = true; parBrukt[p.b.resId] = true; parAnbefalt.push(p); }
            else parAndre.push(p);
        }
        sistePar = parAnbefalt.concat(parAndre);  // indeksene parKort bruker som data-par for kart-klikk

        const tidR = r => parseTid((r.legs[0] || {}).opp || (r.legs[0] || {}).start) ?? 9999;
        utVent.sort((a, b) => tidR(a) - tidR(b));
        innPaga.sort((a, b) => tidR(a) - tidR(b));
        const naa = new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });

        const liste = arr => arr.length ? arr.map(radKort).join('') : '<div class="tom">Ingen.</div>';
        const forslagKort = v => {
            const l0 = v.legs[0] || {};
            return '<div class="kort forslag">' +
                '<div class="rad"><span class="tid">' + esc(l0.opp || l0.start || '–') + ' <span style="color:#e2e8f0">' + esc(l0.pnavn || 'Ventende') + '</span> ' + behovBadges(v) + ledsBadge(v) + '</span>' +
                '<span>' + merkKnapp(v.resId) + '</span></div>' +
                '<div class="adr">' + esc(l0.fra || '?') + ' →<br>' + esc(l0.til || '?') + '</div>' +
                synligeTreff(v).slice(0, 4).map(t => '<div class="vei">' + merkKnapp(t.pRow.resId) + ' ' +
                    (t.pRow.ressurs ? '🚐 ' + esc(t.pRow.ressurs) : 'bil') + (t.sted ? ' (' + esc(t.sted) + ')' : '') +
                    ' ank ' + tidStr(t.ank) + (t.omvei ? ' · +' + t.omvei + ' min omvei' : '') + '</div>').join('') +
                '</div>';
        };
        const parRad = v => {
            const l0 = v.legs[0] || {};
            return '<div class="parp">'
                + '<div class="rad"><span class="tid">' + esc(l0.opp || l0.start || '–') + ' <span style="color:#e2e8f0">' + esc(l0.pnavn || 'Ventende') + '</span> ' + behovBadges(v) + ledsBadge(v) + '</span><span>' + merkKnapp(v.resId) + '</span></div>'
                + '<div class="adr">' + esc(l0.fra || '?') + ' →<br>' + esc(l0.til || '?') + '</div>'
                + '</div>';
        };
        const parKort = (p, idx) => '<div class="kort forslag">' + parRad(p.a) + parRad(p.b)
            + '<div class="vei">🔗 samme retning · +' + p.omvei + ' min omvei' + (p.sv ? ' · ⚠ krever SV (ekstra bagasjeplass)' : '') + '</div>'
            + '<button class="kartbtn" data-par="' + idx + '">🗺️ Vis i kart</button></div>';

        const html =
            '<h1>🧭 Område assistent – ' + esc(aktivNavn) + ' <button class="bytt" id="refreshBtn" title="Skann og oppdater nå">🔄 Oppdater</button> <label class="bytt' + (autoRefresh ? ' autopaa' : '') + '" id="autoWrap" title="Auto-oppdater hvert ' + (POLL_MS / 1000) + '. sekund"><input type="checkbox" id="autoChk"' + (autoRefresh ? ' checked' : '') + '> auto</label> <button class="bytt" id="kartBtn" title="Vis turene på kart">🗺️ Kart</button> <button class="bytt" id="testBlink" title="Tving blink på et par ventende-rader i NISSY (~8 s) for å teste">🔔 Test blink</button> <button class="bytt" id="omrRetur" title="Sjekk om pasientene på pågående biler har en retur bestilt (logger i konsollen — baby step)">🔎 Retur-sjekk</button> <button class="bytt" id="byttOmr">↩ Bytt område</button></h1>' +
            '<div class="sub">v' + VERSJON + ' · oppdatert ' + naa + ' · inn ' + esc(aktivInn) + ' / ut ' + esc(aktivUt) + (aktivKilder.length > 1 ? ' · soner: ' + esc(aktivKilder.map(k => k.navn).join('+')) : '') + '</div>' +
            (sisteDiag ? '<div class="trakt">🔎 ' + sisteDiag.utVent + ' ventende · ' + sisteDiag.innPaga + ' returbiler → '
                + (sisteDiag.naarOmraadet || 0) + ' når området → ' + (sisteDiag.medLedigPlass || 0) + ' m/ledig plass · '
                + (sisteDiag.kandidater || 0) + ' i tidsvindu' + (sisteDiag.kappet ? ' (test-grense: bruker ' + sisteDiag.brukt + ')' : '')
                + (sisteDiag.geokoder ? ' · geokodet ' + (sisteDiag.geokodeOk || 0) + '/' + sisteDiag.geokoder : '')
                + ' → <b>' + (sisteDiag.medTreff || 0) + ' får returbil</b> (' + (sisteDiag.treff || 0) + ' treff'
                + (sisteDiag.besteOmvei != null ? ', beste ' + sisteDiag.besteOmvei + ' min av ' + (sisteDiag.tidsOkKombo || 0) : '') + ') · <b>'
                + (sisteDiag.par || 0) + ' direkte-par</b>'
                + ' <span style="color:#475569">[par: pool ' + (sisteDiag.parPool || 0) + ' → tid ' + (sisteDiag.parTidOk || 0) + ' → kap ' + (sisteDiag.parKapOk || 0) + ' → geo ' + (sisteDiag.parGeoParOk || 0) + ' → hent<' + MAKS_HENTEAVSTAND_KM + 'km ' + (sisteDiag.parHentOk || 0) + (sisteDiag.parBesteOmvei != null ? ' · beste ' + sisteDiag.parBesteOmvei + ' min' : '') + ' · geokodet ' + (sisteDiag.parGeoOk || 0) + '/' + (sisteDiag.parGeo || 0) + ']</span>'
                + ' · <span style="color:' + (sisteDiag.nyeOppslag ? '#fbbf24' : '#34d399') + '">📡 ' + (sisteDiag.nyeOppslag || 0) + ' nye oppslag</span>'
                + (sisteDiag.stopp ? ' · <span class="stopp">⛔ ' + esc(sisteDiag.stopp) + '</span>' : '') + '</div>' : '') +
            '<div class="grid">' +
                '<div class="kol"><h2>⬆️ Turer på vei ut <span class="teller">' + utVent.length + '</span></h2>' +
                '<div class="liste">' + liste(utVent) + '</div></div>' +
                '<div class="kol"><h2>🚐 Returbiler <label class="gdtgl"><input type="checkbox" id="skjulGD"' + (skjulGD ? ' checked' : '') + '> skjul GD/ST</label> <span class="teller">' + innPaga.length + '</span></h2>' +
                '<div class="liste">' + liste(innPaga) + '</div></div>' +
            '</div>' +
            '<div class="kol" style="margin-top:16px"><h2>💡 Forslag – returbil <span class="teller">' + forslag.length + '</span></h2>' +
            '<div class="liste">' + (forslag.length ? forslag.map(forslagKort).join('') : '<div class="tom">Ingen match nå.</div>') + '</div></div>' +
            '<div class="kol" style="margin-top:16px"><h2>🔗 Samkjør to ventende – anbefalt plan <span class="teller">' + parAnbefalt.length + '</span></h2>' +
            '<div class="sub" style="margin:-4px 0 8px">Konfliktfri plan: hver pasient i én bil, beste samkjøring først. To ventende i samme retning når ingen returbil passer.</div>' +
            '<div class="liste">' + (parAnbefalt.length ? parAnbefalt.map((p, i) => parKort(p, i)).join('') : '<div class="tom">Ingen par nå.</div>') + '</div>' +
            (parAndre.length ? '<details style="margin-top:8px"><summary style="cursor:pointer;color:#94a3b8;font-size:11px">Andre mulige par (' + parAndre.length + ') – overlapper med planen over</summary><div class="liste" style="margin-top:6px;opacity:.75">' + parAndre.map((p, i) => parKort(p, parAnbefalt.length + i)).join('') + '</div></details>' : '') +
            '</div>' +
            '<div id="helse-skjult" style="display:none">' + liste(helse) + '</div>';

        win.document.getElementById('rot').innerHTML = html;

        win.document.querySelectorAll('button.merk').forEach(btn => {
            btn.onclick = () => {
                const res = toggleMerk(btn.dataset.merk);
                if (res === 'mangler') {
                    btn.classList.add('mangler');
                    btn.title = 'Ikke synlig i planleggeren';
                    setTimeout(() => btn.classList.remove('mangler'), 1500);
                } else {
                    btn.classList.toggle('paa', res === 'paa');
                }
            };
        });
        const bo = win.document.getElementById('byttOmr');
        if (bo) bo.onclick = visVelger;
        const rb = win.document.getElementById('refreshBtn');
        if (rb) rb.onclick = () => tikk();
        const tb = win.document.getElementById('testBlink');
        if (tb) tb.onclick = () => { _hasterTestTil = Date.now() + 8000; oppdaterHaster(); };
        const orr = win.document.getElementById('omrRetur');
        if (orr) orr.onclick = () => omrSjekkRetur();
        const ac = win.document.getElementById('autoChk');
        if (ac) ac.onchange = () => {
            autoRefresh = ac.checked;
            const w = win.document.getElementById('autoWrap');
            if (w) w.classList.toggle('autopaa', autoRefresh);
            if (autoRefresh) tikk();  // skru på → frisk skann straks
        };
        const gd = win.document.getElementById('skjulGD');
        if (gd) gd.onchange = () => { skjulGD = gd.checked; if (sisteData) render(sisteData); };
        const kb = win.document.getElementById('kartBtn');
        if (kb) kb.onclick = () => setKartMode(true);
        win.document.querySelectorAll('button.kartbtn[data-par]').forEach(btn => {
            btn.onclick = () => visSamkjorKart(sistePar[+btn.dataset.par]);
        });
    }

    /* ── Kartmodus (Leaflet + Kartverket + ORS-ruter) ── */
    // Stabil farge per tur (hash av resId → hue), så fargen ikke hopper mellom oppdateringer.
    function fargeForTur(id) { let h = 0; const s = String(id || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return 'hsl(' + h + ',85%,60%)'; }
    // Kuratert palett av distinkte, lett-navngivbare farger (rosa, lilla, mørkegrønn, lyseblå osv.)
    // — tildeles sekvensielt til synlige turer i hver render, så hver får en unik farge. Leder med
    // de mest distinkte; rekkefølgen veksler mellom fargefamilier så naboer ser ulike ut.
    const KART_PALETT = [
        '#dc2626', // rød
        '#2563eb', // blå
        '#16a34a', // grønn
        '#ea580c', // oransje
        '#7c3aed', // lilla
        '#db2777', // rosa
        '#0d9488', // turkis
        '#854d0e', // brun
        '#0ea5e9', // lyseblå
        '#166534', // mørkegrønn
        '#be185d', // magenta
        '#ca8a04', // gul/amber
        '#1e3a8a', // mørkeblå
        '#9f1239', // vinrød
        '#65a30d', // oliven
        '#334155', // skifer
    ];
    function lastLeaflet() {
        return new Promise(res => {
            if (win.L) return res(true);
            const css = win.document.createElement('link');
            css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            win.document.head.appendChild(css);
            const js = win.document.createElement('script');
            js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            js.onload = () => res(true);
            js.onerror = () => res(false);
            win.document.head.appendChild(js);
        });
    }
    async function hentRute(fra, til) {
        const key = fra + '|' + til;
        if (_ruteCache[key]) return _ruteCache[key];  // cache KUN gyldige ruter (ikke feil → retry når ORS-kvote er tilbake)
        const ls = lsLes('omr_ru_' + key, 7 * _LS_DAG);
        if (ls && ls.geometri && ls.geometri.length) { _ruteCache[key] = ls; return ls; }
        try {
            const r = await fetchTO(SERVER + '/ruter.php?fra=' + encodeURIComponent(fra) + '&til=' + encodeURIComponent(til), {}, 12000);
            const j = await r.json();
            if (j && j.ok && j.geometri && j.geometri.length) { _ruteCache[key] = j; lsSkriv('omr_ru_' + key, j); return j; }
            return j || null;  // returnér feil-json (m/ .feil) for diagnostikk, men IKKE cache den
        } catch (e) { return { ok: false, feil: 'fetch: ' + (e && e.message || e) }; }
    }
    const _koordCache = {};
    const gyldigKoord = a => Array.isArray(a) && typeof a[0] === 'number' && typeof a[1] === 'number' && isFinite(a[0]) && isFinite(a[1]);
    async function hentKoord(adr) {
        if (!adr) return null;
        if (_koordCache[adr] !== undefined) return _koordCache[adr];
        const ls = lsLes('omr_kd_' + adr, 30 * _LS_DAG);
        if (gyldigKoord(ls)) { _koordCache[adr] = ls; return ls; }  // bruk cache KUN hvis gyldig; forgiftet/manglende → hent på nytt (overskriver)
        try {
            _nettOppslag++;
            const r = await fetchTO(SERVER + '/geokod.php?adr=' + encodeURIComponent(adr), {}, 9000);
            const j = await r.json();
            _koordCache[adr] = (j.ok && isFinite(j.lat) && isFinite(j.lon)) ? [j.lat, j.lon] : null;
            if (_koordCache[adr]) lsSkriv('omr_kd_' + adr, _koordCache[adr]);
        } catch (e) { _koordCache[adr] = null; }
        return _koordCache[adr];
    }
    function setKartMode(b) {
        kartMode = b;
        if (!b && kart) { try { kart.remove(); } catch (e) {} kart = null; kartLag = null; }
        if (sisteData) { if (b) visKart(sisteData); else render(sisteData); }
    }
    // FOKUSERT KART for ÉN samkjøring: begge pasientenes hentested + hjem + ruter. Statisk (tegnes én gang,
    // ingen auto-refresh) → ingen zoom-wipe. Overlay i popupen, lukkes med ✕.
    async function visSamkjorKart(par) {
        if (!par || !win || win.closed) return;
        const ok = await lastLeaflet();
        const L = win.L;
        if (!ok || !L) { alert('Kunne ikke laste kart.'); return; }
        const a = par.a.legs[0] || {}, b = par.b.legs[0] || {};
        const navnA = a.pnavn || 'Pasient A', navnB = b.pnavn || 'Pasient B';
        const FARGE_A = '#0ea5e9', FARGE_B = '#f97316';
        const gammel = win.document.getElementById('skjOverlay');
        if (gammel) gammel.remove();
        const ov = win.document.createElement('div');
        ov.id = 'skjOverlay';
        ov.innerHTML =
            '<div class="skjtopp"><span><b>🔗 Samkjøring</b> · +' + par.omvei + ' min omvei' + (par.sv ? ' · ⚠ SV' : '') + '</span>' +
            '<span class="legg"><span class="pa">● ' + esc(navnA) + '</span><span class="pb">● ' + esc(navnB) + '</span>' +
            '<span style="color:#94a3b8">nr = kjørerekkefølge · <span style="color:#c4b5fd">lilla=felles stopp</span></span><button id="skjLukk">✕ Lukk</button></span></div>' +
            '<div class="skjkropp"><div class="skjpanel" id="skjPanel"></div><div id="skjKartDiv"></div></div>';
        win.document.body.appendChild(ov);
        win.document.getElementById('skjLukk').onclick = () => ov.remove();
        const k = L.map('skjKartDiv', { zoomControl: true, attributionControl: false }).setView([59.92, 10.75], 9);
        L.tileLayer(BASISKART[kartBasis].url, { maxZoom: 18, subdomains: 'abcd' }).addTo(k);
        setTimeout(() => { try { k.invalidateSize(); } catch (e) {} }, 60);
        const bounds = [];
        // De 4 punktene i samkjøringen. (Bruk eksplisitt nøkkel-liste, IKKE for-in — Prototype.js forurenser
        // Object.prototype så for-in ville fått med søppel-nøkler.)
        const P = {
            fA: { adr: a.fra, navn: navnA, farge: FARGE_A, rolle: 'hentes' },
            tA: { adr: a.til, navn: navnA, farge: FARGE_A, rolle: 'hjem' },
            fB: { adr: b.fra, navn: navnB, farge: FARGE_B, rolle: 'hentes' },
            tB: { adr: b.til, navn: navnB, farge: FARGE_B, rolle: 'hjem' },
        };
        const PKEYS = ['fA', 'tA', 'fB', 'tB'];
        for (let i = 0; i < PKEYS.length; i++) P[PKEYS[i]].ll = await hentKoord(P[PKEYS[i]].adr);
        try {
            // Beste besøksrekkefølge (samme 4 som beregnPar: hent begge → lever begge), minst total avstand.
            // Rene for-løkker — Prototype.js saboterer .forEach/.every/.map på enkelte arrays.
            const hav = (x, y) => haversineKm(x[0], x[1], y[0], y[1]);
            const kandidater = [['fA', 'fB', 'tA', 'tB'], ['fA', 'fB', 'tB', 'tA'], ['fB', 'fA', 'tA', 'tB'], ['fB', 'fA', 'tB', 'tA']];
            let beste = null, besteLen = Infinity;
            for (let c = 0; c < kandidater.length; c++) {
                const seq = kandidater[c];
                let gyldig = true;
                for (let i = 0; i < 4; i++) if (!gyldigKoord(P[seq[i]].ll)) { gyldig = false; break; }
                if (!gyldig) continue;
                let d = 0; for (let i = 0; i < 3; i++) d += hav(P[seq[i]].ll, P[seq[i + 1]].ll);
                if (d < besteLen) { besteLen = d; beste = seq; }
            }
            if (!beste) beste = kandidater[0];
            // Slå sammen punkter på ~samme sted (<300 m) til ÉN unik stopp: begge hentes på Ahus →
            // felles hente-stopp (3 adresser, ikke 4) i stedet for to overlappende markører.
            const stopp = [];
            for (let i = 0; i < beste.length; i++) {
                const p = P[beste[i]];
                if (!gyldigKoord(p.ll)) continue;
                let f = -1;
                for (let s = 0; s < stopp.length; s++) if (hav(stopp[s].ll, p.ll) < 0.3) { f = s; break; }
                if (f >= 0) stopp[f].deler.push(p);
                else stopp.push({ ll: p.ll, adr: p.adr, deler: [p] });
            }
            // Rute mellom de unike stoppene (på koordinater = rask, ingen klinikk-geokoding).
            const RUTEFARGE = '#22c55e';
            const segMeter = [], segSek = [];  // distanse/tid per segment (til omkjørings-beregning)
            for (let i = 0; i < stopp.length - 1; i++) {
                const llA = stopp[i].ll, llB = stopp[i + 1].ll;
                let geo = null;
                const rute = await hentRute(llA[0] + ',' + llA[1], llB[0] + ',' + llB[1]);
                if (rute && rute.geometri) {
                    const g2 = [];  // filtrer bort null-punkter (kræsjet Leaflet _projectLatlngs)
                    for (let g = 0; g < rute.geometri.length; g++) { const pt = rute.geometri[g]; if (Array.isArray(pt) && isFinite(pt[0]) && isFinite(pt[1])) g2.push(pt); }
                    if (g2.length >= 2) geo = g2;
                }
                const fallback = !geo;
                if (!fallback && rute && isFinite(rute.meter)) { segMeter[i] = rute.meter; segSek[i] = rute.sek || 0; }
                else { const dKm = hav(llA, llB) * VEIFAKTOR; segMeter[i] = Math.round(dKm * 1000); segSek[i] = Math.round(dKm / OMVEI_KMH * 3600); }
                if (fallback) { geo = [llA, llB]; console.warn('[' + NAVN + '] rute-segment ' + (i + 1) + ' falt tilbake til luftlinje:', rute && rute.feil ? rute.feil : '(ingen respons/timeout)'); }
                for (let g = 0; g < geo.length; g++) bounds.push(geo[g]);
                L.polyline(geo, { color: '#0b1220', weight: 8, opacity: .6, lineCap: 'round' }).addTo(k);  // halo
                L.polyline(geo, { color: RUTEFARGE, weight: 4, opacity: 1, lineCap: 'round', dashArray: fallback ? '8,8' : null }).addTo(k);
            }
            // Markør per unik stopp, nummerert i kjørerekkefølge. Felles stopp (begge pasienter) = lilla.
            for (let i = 0; i < stopp.length; i++) {
                const st = stopp[i];
                bounds.push(st.ll);
                const delt = st.deler.length > 1;
                const farge = delt ? '#a855f7' : st.deler[0].farge;
                let label = '';
                for (let d = 0; d < st.deler.length; d++) label += (d ? ', ' : '') + esc(st.deler[d].navn) + ' (' + st.deler[d].rolle + ')';
                L.marker(st.ll, { icon: L.divIcon({ className: '', iconSize: [26, 26], iconAnchor: [13, 13], html: '<div class="skjmrk" style="background:' + farge + '">' + (i + 1) + '</div>' }) })
                    .addTo(k).bindTooltip((i + 1) + '. ' + label + (st.adr ? ' — ' + esc(st.adr) : ''), { direction: 'top' });
            }
            // Info-stolpe (venstre): pasientene + kjørerekkefølge.
            const pasKort = (p, farge) => {
                const l0 = p.legs[0] || {};
                return '<div class="skjpk" style="border-left-color:' + farge + '">'
                    + '<div><span class="t">' + esc(l0.opp || l0.start || '–') + '</span> <span class="n">' + esc(l0.pnavn || '') + '</span> ' + behovBadges(p) + ledsBadge(p) + '</div>'
                    + '<div class="a">' + esc(l0.fra || '?') + ' →<br>' + esc(l0.til || '?') + '</div></div>';
            };
            // Omkjøring for pasienten som leveres SIST (sitter i bilen hele veien): bilens rute fra hens
            // henting til hens hjem MINUS den direkte turen. I tid, km og %.
            let omkjorHtml = '';
            try {
                const sisteStopp = stopp[stopp.length - 1];
                const sisteNavn = (sisteStopp.deler[0] || {}).navn || '';
                let pickIdx = 0;
                for (let s = 0; s < stopp.length; s++) for (let d = 0; d < stopp[s].deler.length; d++) if (stopp[s].deler[d].navn === sisteNavn && stopp[s].deler[d].rolle === 'hentes') pickIdx = s;
                let inM = 0, inS = 0;
                for (let s = pickIdx; s < segMeter.length; s++) { inM += segMeter[s] || 0; inS += segSek[s] || 0; }
                const pLL = stopp[pickIdx].ll, sLL = sisteStopp.ll;
                const dir = await hentRute(pLL[0] + ',' + pLL[1], sLL[0] + ',' + sLL[1]);
                let dirM, dirS;
                if (dir && dir.ok && isFinite(dir.meter)) { dirM = dir.meter; dirS = dir.sek || 0; }
                else { const dKm = hav(pLL, sLL) * VEIFAKTOR; dirM = Math.round(dKm * 1000); dirS = Math.round(dKm / OMVEI_KMH * 3600); }
                const dM = Math.max(0, inM - dirM), dS = Math.max(0, inS - dirS);
                const pct = dirM > 0 ? Math.round(dM / dirM * 100) : 0;
                omkjorHtml = '<h4>Omkjøring for siste pasient</h4>'
                    + '<div class="skjpk" style="border-left-color:#f59e0b"><div class="n">' + esc(sisteNavn) + '</div>'
                    + '<div style="margin-top:4px;display:flex;gap:12px;flex-wrap:wrap;font-weight:700">'
                    + '<span style="color:#fbbf24">+' + Math.round(dS / 60) + ' min</span>'
                    + '<span style="color:#fbbf24">+' + (dM / 1000).toFixed(1) + ' km</span>'
                    + '<span style="color:#fbbf24">+' + pct + ' %</span></div>'
                    + '<div class="a">direkte ' + (dirM / 1000).toFixed(1) + ' km / ' + Math.round(dirS / 60) + ' min → samkjørt ' + (inM / 1000).toFixed(1) + ' km / ' + Math.round(inS / 60) + ' min</div></div>';
            } catch (e) { console.warn('[' + NAVN + '] omkjøring-beregning feilet:', e); }
            let panelHtml = '<h4>Pasienter</h4>' + pasKort(par.a, FARGE_A) + pasKort(par.b, FARGE_B)
                + omkjorHtml
                + '<h4>Kjørerekkefølge · +' + par.omvei + ' min omvei' + (par.sv ? ' · ⚠ SV' : '') + '</h4>';
            for (let i = 0; i < stopp.length; i++) {
                const st = stopp[i];
                const delt = st.deler.length > 1, fNr = delt ? '#a855f7' : st.deler[0].farge;
                let lab = '';
                for (let d = 0; d < st.deler.length; d++) lab += (d ? ', ' : '') + esc(st.deler[d].navn) + ' <span style="color:#94a3b8">(' + st.deler[d].rolle + ')</span>';
                panelHtml += '<div class="skjstopp"><div class="skjnr" style="background:' + fNr + '">' + (i + 1) + '</div>'
                    + '<div><div>' + lab + '</div><div style="color:#64748b;font-size:10px;margin-top:1px">' + esc(st.adr || '') + '</div></div></div>';
            }
            const panelEl = win.document.getElementById('skjPanel');
            if (panelEl) panelEl.innerHTML = panelHtml;
        } catch (e) { console.error('[' + NAVN + '] samkjør-kart feil:', e); }
        if (bounds.length) { try { k.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 }); } catch (e) {} }
        setTimeout(() => { try { k.invalidateSize(); } catch (e) {} }, 220);
    }
    // Synlige ventende: kun øvre grense (hentetid ≤ nå + vinduMin). Ingen nedre grense —
    // forfalte ventende forsvinner fra lista når de sendes ut, så de som står igjen venter ennå.
    function synligeIVindu(utVent) {
        const naa = naaMin();
        return utVent.filter(v => {
            const t = parseTid((v.legs[0] || {}).opp || (v.legs[0] || {}).start);
            return t !== null && String((v.legs[0] || {}).til || '').trim() && t <= naa + vinduMin;
        }).sort((a, b) => (parseTid((a.legs[0] || {}).opp) ?? 9999) - (parseTid((b.legs[0] || {}).opp) ?? 9999)).slice(0, 60);
    }
    async function visKart(data) {
        if (!win || win.closed) return;
        const ok = await lastLeaflet();
        const L = win.L;
        if (!ok || !L) { win.document.getElementById('rot').innerHTML = '<p class="tom">Kunne ikke laste kart (Leaflet).</p>'; return; }
        if (!win.document.getElementById('kartDiv')) {
            win.document.getElementById('rot').innerHTML =
                '<div id="kartwrap"><div id="kartDiv"></div>' +
                '<div class="karttopp">🗺️ <b>' + esc(aktivNavn) + '</b></div>' +   // tidsvindu-slider skjult (Thomas) — vinduMin=120 i bakgrunnen
                '<div class="tabbar"><button class="tab aktiv" data-tab="nordost">Nord/Øst <span class="tabn" id="tabnNo"></span></button><button class="tab" data-tab="hlsx">HLSX Lillehammer <span class="tabn" id="tabnHlsx"></span></button></div>' +
                '<div class="kartpanel venstre" id="noV"><h3>⬆️ På vei ut <span id="kartUtN" class="teller"></span></h3><div id="kartUt"></div></div>' +
                '<div class="kartpanel hoyre" id="noH"><h3>🚐 Returbiler <span id="kartInnN" class="teller"></span> <label class="uonsktgl" title="Skjuler lokale turer (behandling i området) og biler som dro for over 1,5 t siden. GD/ST/LCTMS-GD er alltid skjult."><input type="checkbox" id="skjulUonsket"' + (skjulUonsket ? ' checked' : '') + '> skjul uønskede</label></h3><div id="kartInn"></div></div>' +
                '<div class="kartpanel venstre" id="hlsxV" style="display:none"><h3>🧍 Ventende HLSX <span id="hlsxVN" class="teller"></span></h3><div id="hlsxVInn"></div></div>' +
                '<div class="kartpanel hoyre" id="hlsxH" style="display:none"><h3>🚌 Helsebussen <span id="hlsxHN" class="teller"></span></h3>' +
                '<div class="hlsxretn"><label><input type="radio" name="hlsxretn" value="inn"' + (hlsxRetn === 'inn' ? ' checked' : '') + '> Inn</label><label><input type="radio" name="hlsxretn" value="ut"' + (hlsxRetn === 'ut' ? ' checked' : '') + '> Ut</label><label><input type="radio" name="hlsxretn" value="begge"' + (hlsxRetn === 'begge' ? ' checked' : '') + '> Begge</label>'
                + '<label class="hlsxcb" title="Tegn helsebussens rute i kartet med møteplasser og antall av/på"><input type="checkbox" id="hlsxKartCb"' + (bussKartPaa ? ' checked' : '') + '> 🗺️ Tegn kart</label>'
                + '<label class="hlsxcb" title="Skjul meldingsboksene (📋/🚍) på passasjerradene"><input type="checkbox" id="hlsxMeldCb"' + (hlsxSkjulMeld ? ' checked' : '') + '> Skjul tekstbokser</label>'
                + ' <span id="hlsxRuteStat" class="hlsxrutestat"></span></div>' +
                '<div id="hlsxHInn"></div></div>' +
                '</div>';
            kart = L.map('kartDiv', { zoomControl: true, attributionControl: false }).setView([60.4, 10.6], 8);
            basisLag = L.tileLayer(BASISKART[kartBasis].url, { maxZoom: 18, subdomains: 'abcd' }).addTo(kart);
            casingLag = L.layerGroup().addTo(kart);   // halo under rutene
            kartLag = L.layerGroup().addTo(kart);     // fargede ruter (over)
            // Ryddet toppbar (Thomas): fast bakgrunn «Lyst grå» (kartBasis='lyst'), ingen punkt/rute-velger (rute
            // vises på kort-klikk-toggle), ingen Retur-sjekk-/Liste-knapp. Kun vindu-slider + «skjul uønskede».
            { const su = win.document.getElementById('skjulUonsket'); if (su) su.onchange = () => { skjulUonsket = su.checked; if (sisteData) oppdaterKartLag(sisteData); }; }
            win.document.querySelectorAll('.tabbar .tab').forEach(b => b.onclick = () => settTab(b.dataset.tab));
            win.document.querySelectorAll('input[name=hlsxretn]').forEach(b => b.onchange = () => {
                hlsxRetn = b.value;
                if (sisteData) fyllHlsx(sisteData);   // ny retning → nytt passasjer-sett
                oppdaterBussrute(true);               // re-tegn ruta for ny retning (m/ fit)
            });
            const kcb = win.document.getElementById('hlsxKartCb');
            if (kcb) kcb.onchange = () => { bussKartPaa = kcb.checked; try { localStorage.setItem('oa_hlsx_kart', bussKartPaa ? '1' : '0'); } catch (_) {} oppdaterBussrute(true); };
            const mcb = win.document.getElementById('hlsxMeldCb');
            if (mcb) mcb.onchange = () => { hlsxSkjulMeld = mcb.checked; try { localStorage.setItem('oa_hlsx_skjulmeld', hlsxSkjulMeld ? '1' : '0'); } catch (_) {} settSkjulMeld(); };
            settSkjulMeld();   // bruk lagret «skjul tekstbokser»-tilstand ved oppstart
        }
        settTab(aktivTab);
        oppdaterKartLag(data);
    }
    // Tab-bytte: Nord/Øst (returbiler/ventende) ⇄ HLSX Lillehammer (helsebussen — egne to søyler + retningsfilter).
    function settTab(t) {
        if (!win || win.closed) return;
        aktivTab = t; const erH = t === 'hlsx';
        win.document.querySelectorAll('.tabbar .tab').forEach(b => b.classList.toggle('aktiv', b.dataset.tab === t));
        ['noV', 'noH'].forEach(id => { const el = win.document.getElementById(id); if (el) el.style.display = erH ? 'none' : ''; });
        ['hlsxV', 'hlsxH'].forEach(id => { const el = win.document.getElementById(id); if (el) el.style.display = erH ? '' : 'none'; });
        if (erH && sisteData) fyllHlsx(sisteData);   // bygger _hlsxSiste + kaller oppdaterBussrute(false)
        oppdaterBussrute(erH);   // inn på HLSX → tegn ruta m/ fit; ut → rydd ruta
    }
    // Helsebussen Lillehammer–Oslo–Lillehammer (HLSX, ÉN buss, 22 seter inkl. ledsagere). To søyler: venstre
    // = ventende HLSX-pasienter, høyre = pasienter på bussen. Retningsfilter (inn til Oslo / ut til Lillehammer /
    // begge). Belegg = pasienter + ledsagere; ledig = 22 − belegg. Retning pr legg via område-predikatet.
    function fyllHlsx(data) {
        if (!win || win.closed) return;
        const dirAv = l => (erVaartOmraade(l.til) && !erVaartOmraade(l.fra)) ? 'inn' : ((erVaartOmraade(l.fra) && !erVaartOmraade(l.til)) ? 'ut' : 'ukjent');
        // Passasjer-oppføringer (én pr legg med pnavn) fra HLSX-rader i gitt fane, filtrert på retning.
        const oppf = (rows, fane) => {
            const out = [];
            dedupResId(rows).forEach(r => {
                if (r.fane !== fane || !erHelsebuss(r)) return;   // kun ekte buss, ikke frabringere (intra-område HLSX)
                (r.legs || []).forEach(l => {
                    const n = (l.pnavn || '').trim(); if (!n) return;     // kun reelle passasjerer (ikke bilens tom-legg)
                    const d = dirAv(l);
                    if (hlsxRetn !== 'begge' && d !== hlsxRetn) return;
                    // Terminal = der bussen drar fra/ankommer: 'ut'/retur → fra-enden; 'inn' → til-enden.
                    const terminal = hlsxTerminalNavn(d === 'inn' ? l.til : l.fra);
                    out.push({ tid: l.opp || l.start || '', navn: n, fra: stedFraAdr(l.fra) || l.fra || '?', til: stedFraAdr(l.til) || l.til || '?', terminal: terminal, status: l.status || '', leds: parseInt(r._ledsN, 10) || 0, dir: d, reqId: l.reqId || r.reqId || '', resId: r.resId || '', stoppPostnr: hentPostnr(l.til) || '' });
                });
            });
            out.sort((a, b) => (parseTid(a.tid) ?? 9999) - (parseTid(b.tid) ?? 9999));
            return out;
        };
        const vent = oppf(data.ut, 'ventendeOppdrag');
        const buss = oppf(data.inn, 'paagaaendeOppdrag');
        _hlsxSiste = vent.concat(buss);   // for bussrute-tegning (reqId/navn/dir pr passasjer i gjeldende retning)
        let belegg = 0; for (let i = 0; i < buss.length; i++) belegg += 1 + (buss[i].leds || 0);   // pasient + ledsagere
        const ledig = Math.max(0, HLSX_SETER - belegg);
        const pil = d => d === 'inn' ? '<span style="color:#22c55e" title="Inn til Oslo/behandling">←</span> ' : (d === 'ut' ? '<span style="color:#f59e0b" title="Ut/retur til Lillehammer">→</span> ' : '');
        // Hver passasjer-rad har data-reqid → async fylles MELDINGSFELT (💬, tooltip) for alle, og FRABRINGER
        // (siste bil fra busstoppet hjem) for ut/retur. INN-passasjerer (Innlandet sin ende) får ikke frabringer.
        const stBadge = o => { const s = hlsxStatusVis(o.status); return s.sym ? ' <span class="hst" title="' + esc(s.tip) + '" style="color:' + s.f + '">' + s.sym + ' ' + esc(s.txt) + '</span>' : ''; };
        const rad = (o, medFrab) => '<div class="hlsxrad" data-leds="' + (o.leds || 0) + '"' + (o.reqId ? ' data-reqid="' + esc(o.reqId) + '" data-resid="' + esc(o.resId) + '"' : '') + '><div class="hlsxtaxi"></div><div class="paskort"><span>' + pil(o.dir) + esc(o.navn) + ' <span class="hleds">' + (o.leds ? '<span style="color:#fbbf24">👥 +' + o.leds + '</span>' : '') + '</span><span class="hstwrap">' + stBadge(o) + '</span></span><br><span class="fratil" style="color:#94a3b8">' + esc(o.fra) + ' → ' + esc(o.til) + '</span>'
            + '<span class="hmsgline"></span>'
            + (medFrab && o.dir === 'ut' && o.reqId && o.stoppPostnr ? '<br><span class="frab" data-stopp="' + esc(o.stoppPostnr) + '" style="color:#64748b">🚗 frabringer: ⏳</span>' : '')
            + '</div></div>';
        // Grupper pr TERMINAL (Rikshospitalet/Ullevål) med overskrift i stedet for avreisetid pr passasjer.
        const TERM_REKKEF = ['Rikshospitalet', 'Ullevål', 'Annet'];
        const grupper = (items, medFrab) => {
            if (!items.length) return '';
            const g = {}; items.forEach(o => { const k = o.terminal || 'Annet'; (g[k] = g[k] || []).push(o); });
            return Object.keys(g).sort((a, b) => ((TERM_REKKEF.indexOf(a) + 1 || 9) - (TERM_REKKEF.indexOf(b) + 1 || 9)))
                .map(k => '<div class="hlsxgrp"><div class="hlsxgh">🏥 ' + esc(k) + ' <span class="ant">' + g[k].length + '</span></div>' + g[k].map(o => rad(o, medFrab)).join('') + '</div>').join('');
        };
        // ANTI-FLIMMER: bygg radene om KUN når strukturen (passasjerer/rekkefølge/gruppe) endres. Endres bare
        // verdier (status «om bord» osv.) → oppdater IN-PLACE. Uendret → ikke rør DOM (async-fylt innhold blir stående).
        const keyOf = o => (o.dir || '') + '#' + (o.reqId || '') + '#' + (o.resId || '') + '#' + (o.terminal || '');
        const kParts = [hlsxRetn], fParts = [hlsxRetn];
        const samle = (items, pre) => { for (let i = 0; i < items.length; i++) { const o = items[i]; const k = pre + keyOf(o); kParts.push(k); fParts.push(k + '|' + (o.status || '') + '|' + (o.fra || '') + '|' + (o.til || '') + '|' + (o.leds || 0)); } };
        samle(vent, 'V'); samle(buss, 'B');
        const keySig = kParts.join(';'), fullSig = fParts.join(';');
        const vEl = win.document.getElementById('hlsxVInn');
        const hEl = win.document.getElementById('hlsxHInn');
        const harRader = !!((hEl && hEl.children.length) || (vEl && vEl.children.length));
        if (fullSig === _hlsxFullSig && harRader) {
            // helt uendret → ikke rør skjelettet (async-felt blir stående; oppdateres av fyllHlsxRader under)
        } else if (keySig === _hlsxKeySig && harRader) {
            // samme passasjerer/rekkefølge, kun verdier endret → oppdater status + fra→til IN-PLACE (ingen ombygging)
            const oppdater = (items, cont) => { if (!cont) return; for (let i = 0; i < items.length; i++) { const o = items[i]; if (!o.reqId) continue; const row = cont.querySelector('.hlsxrad[data-reqid="' + o.reqId + '"][data-resid="' + (o.resId || '') + '"]'); if (!row) continue; const hw = row.querySelector('.hstwrap'); const nb = stBadge(o); if (hw && hw.innerHTML !== nb) hw.innerHTML = nb; const ft = row.querySelector('.fratil'); const nt = o.fra + ' → ' + o.til; if (ft && ft.textContent !== nt) ft.textContent = nt; } };
            oppdater(vent, vEl); oppdater(buss, hEl);
        } else {
            if (vEl) vEl.innerHTML = grupper(vent, false) || '<div class="tom">Ingen ventende.</div>';
            if (hEl) hEl.innerHTML = grupper(buss, true) || '<div class="tom">Ingen på bussen.</div>';
        }
        _hlsxFullSig = fullSig; _hlsxKeySig = keySig;
        const vN = win.document.getElementById('hlsxVN'); if (vN) vN.textContent = vent.length;
        oppdaterHlsxBelegg(win);   // bruker data-leds pr rad (oppdateres når autoritativ ledsager lastes)
        fyllHlsxRader(win);
        oppdaterBussrute(false);   // hold ruta i synk ved autorefresh (re-tegner kun ved endret passasjer-sett)
    }
    // «Skjul tekstbokser»-checkbox → CSS-klasse på #kartwrap skjuler meldingslinjene (.hmsgline) på radene.
    function settSkjulMeld() { const w = win && !win.closed && win.document.getElementById('kartwrap'); if (w) w.classList.toggle('hlsx-skjul-meld', hlsxSkjulMeld); }
    // Belegg = sum over buss-radene av (1 pasient + dens ledsagere). Leser data-leds pr rad → kan kalles på nytt
    // når fyllHlsxRader har hentet AUTORITATIV ledsager pr passasjer (L-kolonne-estimatet var pr samkjørt bil).
    function oppdaterHlsxBelegg(win) {
        const hEl = win.document.getElementById('hlsxHInn'); if (!hEl) return;
        const rows = Array.from(hEl.querySelectorAll('.hlsxrad'));
        let belegg = 0; for (let i = 0; i < rows.length; i++) belegg += 1 + (parseInt(rows[i].getAttribute('data-leds'), 10) || 0);
        const ledig = Math.max(0, HLSX_SETER - belegg);
        const hN = win.document.getElementById('hlsxHN');
        if (hN) hN.innerHTML = belegg + '/' + HLSX_SETER + ' · <span style="color:' + (ledig > 0 ? '#22c55e' : '#f87171') + '">' + ledig + ' ledig</span>';
    }
    // Async pr HLSX-rad (ett admin-oppslag pr passasjer, cachet 120 s): (1) MELDINGSFELT → 💬 + tooltip
    // (PRK + transportør, viktig buss-kontekst); (2) FRABRINGER-status for ut/retur-rader (.frab).
    const _hlsxDetCache = {};
    let _frabKjorer = false;
    async function fyllHlsxRader(win) {
        if (_frabKjorer) return; _frabKjorer = true;
        try {
            const rader = Array.from(win.document.querySelectorAll('.hlsxrad[data-reqid]'));
            for (let i = 0; i < rader.length; i++) {
                const rad = rader[i];
                const reqId = rad.getAttribute('data-reqid'), resId = rad.getAttribute('data-resid');
                let c = _hlsxDetCache[reqId];
                if (!c || (Date.now() - c.t) > 120000) { c = { t: Date.now(), d: await omrHentRekvDetalj(reqId, resId) }; _hlsxDetCache[reqId] = c; }
                const d = c.d; if (!d) continue;
                const setH = (el, h) => { if (el && el.innerHTML !== h) el.innerHTML = h; };   // idempotent skriv → ingen flimmer
                const meld = (d.meldingPRK || '') + ' ' + (d.meldingTR || '');
                // Ledsager AUTORITATIVT pr passasjer (overstyrer L-kolonne-estimatet). ≥1 = 👥 +N ledsager (amber),
                // 0 = 🧍 alene (dempet). -1 = parse feilet → behold L-kolonne-fallback. _ledsDbg logges ved feil.
                const le = rad.querySelector('.hleds');
                if (le) {
                    if (d.ledsager >= 0 && rad.getAttribute('data-leds') !== String(d.ledsager)) { rad.setAttribute('data-leds', d.ledsager); oppdaterHlsxBelegg(win); }   // autoritativ → korriger totalen (kun ved endring)
                    let lh = null;
                    if (d.ledsager >= 1) lh = '<span style="color:#fbbf24" title="Reiser med ledsager (tar ekstra sete)">👥 +' + d.ledsager + ' ledsager</span>';
                    else if (d.ledsager === 0) lh = '<span style="color:#64748b" title="Reiser alene">🧍 alene</span>';
                    else if (le.textContent.trim() === '') lh = '<span style="color:#475569" title="Ledsager ukjent — kunne ikke leses fra rekvisisjonen">👥 ?</span>';
                    if (lh != null) setH(le, lh);
                }
                // Meldingsfelt SYNLIG inline (PRK + transportør) — viktig buss-kontekst.
                const hm = rad.querySelector('.hmsgline');
                if (hm) {
                    let h = '';
                    if (d.meldingPRK) h += '<div class="hmline prk" title="Melding til pasientreisekontoret">📋 ' + esc(d.meldingPRK) + '</div>';
                    if (d.meldingTR) h += '<div class="hmline tr" title="Melding til transportøren">🚍 ' + esc(d.meldingTR) + '</div>';
                    setH(hm, h);
                }
                // Frabringer (ut/retur) — idempotent (skriver kun ved endret tekst → ingen flimmer ved autorefresh).
                const fr = rad.querySelector('.frab');
                if (fr) {
                    try {
                        let txt, color, title = '';
                        if (erSelvtransport(meld)) { txt = '🚶 Kommer selv til møteplassen — ingen frabringer'; color = '#22c55e'; title = [d.meldingPRK, d.meldingTR].filter(Boolean).join('\n\n'); }
                        else { const f = await omrFrabringerStatus(d, fr.getAttribute('data-stopp')); const v = frabringerVis(f); txt = '🚗 Frabringer: ' + v.sym + ' ' + v.txt; color = v.f; if (f && f.funnet && (f.meldingPRK || f.meldingTR)) title = [f.meldingPRK, f.meldingTR].filter(Boolean).join('\n\n'); }
                        if (fr.textContent !== txt) { fr.textContent = txt; fr.style.color = color; }
                        if (title && fr.getAttribute('title') !== title) fr.setAttribute('title', title);
                    } catch (_) { if (fr.textContent !== '🚗 Frabringer: ?') fr.textContent = '🚗 Frabringer: ?'; }
                }
                // Tilbringer (🚕) → eget TAXI-KORT til VENSTRE for pasientkortet (Thomas' skisse). Vises kun når
                // påstigning er utenfor Oslo (møteplass; ikke 0xxx) og pas ikke kommer seg selv — og SKJULES når
                // taxien har levert pas på stoppet (suti.levert). Re-evalueres hvert tikk (radene bygges på nytt).
                const tx = rad.querySelector('.hlsxtaxi');
                if (tx) {
                    let h = '';
                    const board = d.fraPostnr;
                    // Sjekk tilbringer UANSETT påstigningssted (også Oslo-terminal — pas kan komme hjemmefra m/ taxi
                    // til Ullevål/RH, eks LISE TVETE Bjørnemyr→Ullevål). Vis KUN når funnet (ikke «mangler» på alle
                    // sykehus-pasienter som faktisk ER på terminalen). TEST: viser også levert (Thomas vil se treff).
                    if (board && !erSelvtransport(meld)) {
                        try {
                            const t = await omrTilbringerStatus(d);
                            if (t && t.funnet) {
                                const v = tilbringerVis(t);
                                const km = (t.klarFra || '').match(/(\d{1,2}:\d{2})/);
                                const loyve = (t.loyve || '').slice(0, 10);   // løyve (C-4303) = autentisk preg
                                const tip = 'Tilbringer' + (t.loyve ? ' løyve ' + t.loyve : '') + (t.transportor ? ' (' + t.transportor + ')' : '') + ' til påstigning: ' + v.txt + (t.meldingTR ? ' — ' + t.meldingTR : '');
                                h = '<div class="taxibox" title="' + esc(tip) + '" style="border-color:' + v.f + '"><div style="font-size:14px">🚕</div>'
                                    + (loyve ? '<div class="loyve">' + esc(loyve) + '</div>' : '')
                                    + '<div style="color:' + v.f + '">' + v.sym + (km ? ' ' + km[1] : '') + '</div></div>';
                            }
                        } catch (_) {}
                    }
                    setH(tx, h);   // idempotent → taxi-kortet blir stående, endrer seg kun ved ny status
                }
            }
        } catch (e) { console.warn('[' + NAVN + '] fyllHlsxRader:', e && e.message); }
        finally { _frabKjorer = false; }
    }
    // Oslo-terminalene (rute-anker for retur — bussen starter her). Kjente koordinater.
    const HLSX_TERMINAL_LL = { 'Rikshospitalet': [59.9485, 10.7177], 'Ullevål': [59.9460, 10.7290] };
    // KANONISKE møteplasser (offisiell helsebuss-stoppliste, helsenorge) m/ geoposisjon. NISSYs leveringssted-
    // navn matches mot disse → riktig plassering selv når NISSYs egne koordinater er feil (eks: møteplassen
    // «Brumunddal, Vegkroa E6» hadde postnr/koord for 2283 Åsnes Finnskog → NYBORG bommet). UTM-koord brukes
    // kun som fallback for steder UTENFOR denne lista. TODO: flytt POI-lista til server-config.
    // HELSEBUSSENS RUTE = «HED/OPP NN»-serien i NISSYs MØTEPLASS-REGISTRY (Behandlingssteder → Sektor=Møteplass).
    // Hvert stopp er en POI med egen geoposisjon (Posisjon X/Y = UTM33 northing/easting). `id` = NISSY-møteplass-id
    // → koordinatene hentes LIVE fra adminTCDetails (lastMoteplassPOI), cachet. `ll` = fallback hvis henting feiler.
    // navn-regex matcher leveringssted-navnet (for gruppering/snap). Oslo-endene: OUS-møteplassene (Ullevål/RH).
    // `seq` = bussens FASTE stopprekkefølge Oslo→Lillehammer (RH starter, så Ullevål, så nordover). Ruta tegnes i
    // denne rekkefølgen — IKKE etter breddegrad (RH ligger så vidt nord for Ullevål → ren lat-sort bytter dem om).
    const HLSX_MOTEPLASS_POI = [
        { navn: 'Rikshospitalet', seq: 1, id: 4349, re: /rikshospital|riksen/i, ll: [59.9485, 10.7177] },
        { navn: 'Ullevål', seq: 2, id: 4041, re: /ullev[åa]l/i, ll: [59.9460, 10.7290] },
        { navn: 'Olavsgaard/Skedsmo', seq: 3, id: 4422, re: /olavsgaard|skedsmo|skjetten/i, ll: [59.9950, 11.0560] },
        { navn: 'Gardermoen', seq: 4, id: 4960, re: /gardermoen|jessheim|\blhl\b/i, ll: [60.1900, 11.0900] },
        { navn: 'Tangenkrysset', seq: 5, id: 4456, re: /tangen/i, ll: [60.6230, 11.2627] },
        { navn: 'SI Gjøvik', seq: 6, id: 4458, re: /gj[øo]vik/i, ll: [60.7950, 10.6940] },
        { navn: 'SI Hamar', seq: 7, id: 4118, re: /hamar/i, ll: [60.7955, 11.0770] },
        { navn: 'Brumunddal', seq: 8, id: 4242, re: /brumunddal|vegkroa|nydal/i, ll: [60.8730, 10.9400] },
        { navn: 'Moelv', seq: 9, id: 4421, re: /moelv|mj[øo]ssenter/i, ll: [60.9179, 10.7030] },
        { navn: 'SI Lillehammer', seq: 10, id: 4170, re: /lillehammer/i, ll: [61.1186, 10.4564] }
    ];
    // Hent møteplassens EKSAKTE koordinat fra NISSY (adminTCDetails → «Posisjon X/Y: northing / easting», UTM33).
    // Cachet 60 dager i localStorage (møteplassene flytter seg ~aldri).
    async function hentMoteplassKoord(id) {
        const ls = lsLes('omr_mp_' + id, 60 * _LS_DAG);
        if (gyldigKoord(ls)) return ls;
        try {
            const html = await xhr('/administrasjon/admin/adminTCDetails?id=' + id + '&action=edit&meetingPlace=true&poi=false&t=' + Date.now());
            const txt = (html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
            const m = txt.match(/Posisjon\s*X\/Y:?\s*(\d{5,})\s*\/\s*(\d{5,})/i);
            if (m) { const ll = utm33ToLatLon(+m[2], +m[1]); if (gyldigKoord(ll)) { lsSkriv('omr_mp_' + id, ll); return ll; } }
        } catch (e) {}
        return null;
    }
    // Overstyr POI-fallback-koordinatene med NISSYs eksakte (én gang pr økt; cachet på tvers av økter).
    let _moteplassLastet = false;
    async function lastMoteplassPOI() {
        if (_moteplassLastet) return; _moteplassLastet = true;
        try { await mapLimit(HLSX_MOTEPLASS_POI, 4, async p => { if (!p.id) return; const ll = await hentMoteplassKoord(p.id); if (gyldigKoord(ll)) p.ll = ll; }); }
        catch (e) { console.warn('[' + NAVN + '] møteplass-POI-henting:', e && e.message); }
    }
    // Match leveringssted/hentested (navn + sted) mot kanonisk møteplass → {navn, ll, kanonisk}. Fallback: UTM-koord.
    function kanonMoteplass(lev) {
        const tekst = (lev.navn || '') + ' ' + (lev.sted || '');
        // Oslo-terminal via navn/POSTNR (Radium 0379→internbuss til RH, RH 0372, Ullevål 0450). Hentestedet er ofte
        // en sengepost-adresse UTEN sykehusnavnet («Sengepost 4 Sør, 0379 Oslo») → må matche på postnr.
        const term = hlsxTerminalNavn(tekst);
        if (term) { for (let i = 0; i < HLSX_MOTEPLASS_POI.length; i++) if (HLSX_MOTEPLASS_POI[i].navn === term) return { navn: term, ll: HLSX_MOTEPLASS_POI[i].ll, seq: HLSX_MOTEPLASS_POI[i].seq, kanonisk: true }; }
        for (let i = 0; i < HLSX_MOTEPLASS_POI.length; i++) if (HLSX_MOTEPLASS_POI[i].re.test(tekst)) return { navn: HLSX_MOTEPLASS_POI[i].navn, ll: HLSX_MOTEPLASS_POI[i].ll, seq: HLSX_MOTEPLASS_POI[i].seq, kanonisk: true };
        return gyldigKoord(lev.ll) ? { navn: lev.navn || lev.sted || 'Møteplass', ll: lev.ll, seq: null, kanonisk: false } : null;
    }
    // Tegn/oppdater helsebussens RUTE i kartet (møteplasser m/ UTM33-koord + antall av/på). Styres av «Tegn kart»-
    // checkboxen (bussKartPaa) → OVERLEVER autorefresh. Re-tegnes kun når passasjer-settet (signatur) endres, så
    // autorefresh ikke gir flimmer/zoom-hopp. `fit` = zoom til ruta (kun ved på-slag/tab-bytte/retningsendring).
    let _bussruteKjorer = false;
    async function oppdaterBussrute(fit) {
        if (!win || win.closed || !kart || !win.L) return;
        const L = win.L;
        const stat = win.document.getElementById('hlsxRuteStat');
        const paa = bussKartPaa && aktivTab === 'hlsx';
        if (!paa) {   // checkbox av eller ikke på HLSX-tab → rydd ruta
            if (bussLag) { try { kart.removeLayer(bussLag); } catch (_) {} bussLag = null; }
            _bussruteAktiv = false; _bussruteSig = ''; if (stat) stat.textContent = '';
            return;
        }
        if (_bussruteKjorer) return; _bussruteKjorer = true;
        try {
            await lastMoteplassPOI();   // eksakte møteplass-koordinater fra NISSY (cachet)
            const pas = (_hlsxSiste || []).slice();
            // Signatur = sortert reqId-sett. Uendret + allerede tegnet → behold (kun re-fit ved behov, ingen redraw).
            const ids = []; for (let i = 0; i < pas.length; i++) ids.push(pas[i].reqId); ids.sort();
            const sig = ids.join(',');
            if (sig === _bussruteSig && bussLag) { if (fit) { try { kart.fitBounds(L.featureGroup(bussLag.getLayers()).getBounds(), { padding: [40, 40] }); } catch (_) {} } return; }
            _bussruteSig = sig;
            if (stat) stat.textContent = '⏳ tegner…';
            // Pr passasjer: leveringssted = der de går AV, hentested = der de stiger PÅ (Olavsgaard/Skedsmo for
            // Ahus-pas m/ tilbringer). Aggreger av/på pr møteplass. Gjenbruk detalj-cache (samme som rad-fyllingen).
            const moteMap = {};   // navn → { navn, ll, kanonisk, antAv, navnAv[], antPa, navnPa[] }
            const regStopp = (sted, nm, rolle) => {   // rolle: 'av' (leveringssted) | 'pa' (hentested)
                if (!sted) return;
                const kan = kanonMoteplass(sted);
                if (!kan || !gyldigKoord(kan.ll)) return;
                const m = moteMap[kan.navn] || (moteMap[kan.navn] = { navn: kan.navn, ll: kan.ll, seq: kan.seq, kanonisk: kan.kanonisk, antAv: 0, navnAv: [], antPa: 0, navnPa: [] });
                if (rolle === 'av') { m.antAv++; m.navnAv.push(nm); } else { m.antPa++; m.navnPa.push(nm); }
            };
            await mapLimit(pas, 6, async p => {
                if (!p.reqId) return;
                let c = _hlsxDetCache[p.reqId];
                if (!c || (Date.now() - c.t) > 120000) { c = { t: Date.now(), d: await omrHentRekvDetalj(p.reqId, p.resId) }; _hlsxDetCache[p.reqId] = c; }
                if (!c.d) return;
                const nm = c.d.navn || p.navn || '?';
                regStopp(c.d.levSted, nm, 'av');    // går AV
                regStopp(c.d.hentSted, nm, 'pa');   // stiger PÅ
            });
            let moter = Object.keys(moteMap).map(k => moteMap[k]);
            if (!moter.length) { if (stat) stat.textContent = 'ingen møteplasser m/koordinater funnet'; _bussruteAktiv = false; return; }
            // Rekkefølge = bussens FASTE stopprekkefølge (seq), Oslo→Lillehammer (RH→Ullevål→nord). Stopp uten seq
            // (ukjente/fallback) plasseres etter breddegrad på samme 1–10-skala så de føyer seg inn i korridoren.
            const ordAv = m => (m.seq != null) ? m.seq : (1 + (m.ll[0] - 59.948) / 0.1465);
            moter.sort((a, b) => ordAv(a) - ordAv(b));   // lavest seq (RH/Oslo) først → nordover
            const ankerLL = HLSX_TERMINAL_LL['Rikshospitalet'];
            let harOslo = false; const nodeLL = [];   // indeksert (unngå Prototype-overstyrt some/map)
            for (let i = 0; i < moter.length; i++) { if (moter[i].ll[0] < 60.0) harOslo = true; nodeLL.push(moter[i].ll); }
            const noder = (harOslo ? [] : [ankerLL]).concat(nodeLL);   // Oslo først → nordover
            // Tegn vegsegmenter (ruter.php på koordinater) mellom påfølgende noder.
            if (bussLag) { try { kart.removeLayer(bussLag); } catch (_) {} }
            bussLag = L.layerGroup().addTo(kart);
            const casing = (BASISKART[kartBasis] || {}).casing || 'rgba(0,0,0,.5)';
            const BUSSFARGE = '#7c3aed';
            for (let i = 0; i < noder.length - 1; i++) {
                const a = noder[i], b = noder[i + 1];
                let geom = [a, b];
                const rute = await hentRute(a[0] + ',' + a[1], b[0] + ',' + b[1]);
                const g0 = rute && rute.geometri;
                if (g0 && typeof g0.length === 'number' && g0.length >= 2) {
                    const ren = []; for (let k = 0; k < g0.length; k++) { const pp = g0[k]; if (pp && isFinite(pp[0]) && isFinite(pp[1])) ren.push([+pp[0], +pp[1]]); }
                    if (ren.length >= 2) geom = ren;
                }
                try {
                    L.polyline(geom, { color: casing, weight: 8, opacity: .85, lineCap: 'round' }).addTo(bussLag);
                    L.polyline(geom, { color: BUSSFARGE, weight: 4, opacity: 1, lineCap: 'round' }).addTo(bussLag);
                } catch (_) {}
            }
            // Møteplass-markører: lilla tall = antall AV (skal av). Grønt ↑N = PÅSTIGNING (f.eks. Olavsgaard for
            // Ahus-pas). Stopp med både av og på får et lite grønt ↑-merke i hjørnet. Tooltip lister navn pr rolle.
            for (let i = 0; i < moter.length; i++) {
                const m = moter[i];
                let cls = 'bussmrk', label;
                if (m.antAv > 0) { label = String(m.antAv); if (!m.kanonisk) cls += ' ukjent'; }
                else { cls += ' pastig'; label = String(m.antPa); }   // kun påstigning (grønn = på)
                const paBadge = (m.antAv > 0 && m.antPa > 0) ? '<span class="bussmrk-pa">' + m.antPa + '</span>' : '';
                const tip = '<b>' + esc(m.navn || 'Møteplass') + '</b>'
                    + (m.antAv > 0 ? '<br>↓ <b>' + m.antAv + '</b> skal av: ' + esc(m.navnAv.join(', ')) : '')
                    + (m.antPa > 0 ? '<br>↑ <b>' + m.antPa + '</b> stiger på: ' + esc(m.navnPa.join(', ')) : '')
                    + (m.kanonisk ? '' : '<br><i>⚠ ukjent møteplass — plassert på NISSYs koordinat</i>');
                L.marker(m.ll, { icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: '<div style="position:relative;width:30px;height:30px"><div class="' + cls + '">' + label + '</div>' + paBadge + '</div>' }) })
                    .bindTooltip(tip, { direction: 'top' }).addTo(bussLag);
            }
            if (!harOslo) L.marker(ankerLL, { icon: L.divIcon({ className: '', iconSize: [24, 24], iconAnchor: [12, 12], html: '<div class="bussmrk start">🏥</div>' }) })
                .bindTooltip('Rikshospitalet (start)', { direction: 'top' }).addTo(bussLag);
            _bussruteAktiv = true;
            if (fit) { try { kart.fitBounds(L.featureGroup(bussLag.getLayers()).getBounds(), { padding: [40, 40] }); } catch (_) {} }
            // INDEKSERT sum — Prototype/rico overstyrer Array.prototype.reduce (returnerer selve arrayet) → [object Object].
            let sumAv = 0, sumPa = 0;
            for (let i = 0; i < moter.length; i++) { sumAv += moter[i].antAv; sumPa += moter[i].antPa; }
            if (stat) stat.textContent = moter.length + ' stopp · ' + sumAv + ' av · ' + sumPa + ' på';
        } catch (e) { console.warn('[' + NAVN + '] bussrute:', e && e.message); if (stat) stat.textContent = 'feil: ' + (e && e.message); }
        finally { _bussruteKjorer = false; }
    }
    async function oppdaterKartLag(data) {
        if (!win || win.closed || !kart || !win.L) return;
        if (aktivTab === 'hlsx') fyllHlsx(data);
        const L = win.L;
        kartLag.clearLayers();
        casingLag.clearLayers();
        const casing = (BASISKART[kartBasis] || {}).casing || 'rgba(0,0,0,.5)';
        const utVent = synligeIVindu(dedupResId(data.ut).filter(r => r.fane === 'ventendeOppdrag' && !erHlsx(r)));
        const naaU = naaMin();
        const innPaga = dedupResId(data.inn).filter(r => r.fane === 'paagaaendeOppdrag' && !erHlsx(r) && !(skjulGD && erGD(r)) && kommerTilOmraadet(r)
            && !(skjulUonsket && (erLokalTur(r) || omrAvreist(r, naaU))));   // skjul uønskede = lokale + avreiste (>1,5t)
        win.document.getElementById('kartUtN').textContent = utVent.length;
        win.document.getElementById('kartInnN').textContent = innPaga.length;
        // Tab-tellere «på vent» — synlig uansett aktiv tab. Nord/Øst = utVent; HLSX = ventende helsebuss (retningsfiltr.).
        const tnNo = win.document.getElementById('tabnNo'); if (tnNo) tnNo.textContent = utVent.length || '';
        let hlsxVentN = 0;
        const dirHl = l => (erVaartOmraade(l.til) && !erVaartOmraade(l.fra)) ? 'inn' : ((erVaartOmraade(l.fra) && !erVaartOmraade(l.til)) ? 'ut' : 'ukjent');
        dedupResId(data.ut).forEach(r => { if (r.fane !== 'ventendeOppdrag' || !erHelsebuss(r)) return; (r.legs || []).forEach(l => { if (!(l.pnavn || '').trim()) return; if (hlsxRetn !== 'begge' && dirHl(l) !== hlsxRetn) return; hlsxVentN++; }); });
        const tnHl = win.document.getElementById('tabnHlsx'); if (tnHl) tnHl.textContent = hlsxVentN || '';
        // Tildel distinkt palett-farge sekvensielt til de synlige turene (unik per tur i vinduet).
        const fargeMap = {}; let _fi = 0;
        utVent.concat(innPaga).forEach(r => { fargeMap[r.resId] = KART_PALETT[_fi++ % KART_PALETT.length]; });
        const turFarge = r => fargeMap[r.resId] || fargeForTur(r.resId);
        // Panel-kort (status høyrestilt — relevant for returbiler: Startet/Framme/Tildelt)
        const startet = s => /startet|avslut|ferdig|fullf|levert/i.test(s);
        const passAntall = r => 1 + (parseInt(r._ledsN, 10) || 0);
        // Kompakt 2–4-linjers kort med alle opplysninger (kartet kan erstatte listene).
        const kort = (r, farge, rolle) => {
            const l0 = r.legs[0] || {};
            const tid = esc(l0.opp || l0.start || '–');
            const beh = behovBadges(r);
            let navn, sub, status, meta, frist = '', pasHtml = '', etaHtml = '';
            if (rolle === 'ut') {
                navn = esc(l0.pnavn || '');
                sub = esc(stedFraAdr(l0.fra) || l0.fra || '?') + ' → ' + esc(stedFraAdr(l0.til) || l0.til || '?');
                status = 'Vent';
                meta = (beh ? beh + ' ' : '') + passAntall(r) + ' pass.';
                const Tmin = parseTid(l0.opp || l0.start);
                const venteMin = Math.max((r._rt ? r._rt.sek / 60 : 0), VENTETID_MIN);
                const fristMin = Tmin !== null ? Tmin + venteMin : null;
                const sendUtMin = fristMin !== null ? fristMin - VARSEL_MIN : null;
                const urgent = sendUtMin !== null && naaMin() >= sendUtMin;
                if (fristMin !== null) frist = '<div class="kkmeta' + (urgent ? ' urg' : '') + '">' + (urgent ? '🔔 ' : '⏱ ') + 'hentes ' + tidStr(fristMin) + ' · send ut ' + tidStr(sendUtMin) + '</div>';
            } else {
                const ri = returInfo(r);
                navn = esc(r.ressurs || '');
                sub = esc(stedFraAdr(ri.fra) || ri.fra || '?');
                status = returStatus(r);
                meta = '↩ <span title="Ledige seter på returen (restkapasitet etter egne retur-passasjerer)">' + ledigePlasser(egneReturPassasjerer(r)) + '/' + MAKS.passasjerer + ' ledig</span>' + (erTurRetur(r) ? ' <span title="Tur/retur samme bil — pasienten kjører tilbake med denne bilen (start-postnr = slutt-postnr). Kun restkapasitet er ledig.">🔁</span>' : '') + (beh ? ' ' + beh : '');
                // Passasjerer på bilen, med symbol utledet fra LEGGENE (ingen NISSY-oppslag):
                //   🔁 = har både tur-ben (inn til Oslo) OG retur-ben (ut) → kom inn og kjører tilbake på samme bil
                //   ↩ = kun retur-ben → ny pasient fra Oslo (på vei hjem)
                // (Inn-passasjerer uten retur-ben får ✅/🕓/❌ senere via retur-sjekk-oppslaget.)
                // Rico-trygt: objekt-dedup pr. navn (ikke Set). Destinasjon = retur-leggets «til».
                const _pasMap = {}; const _pasRekkef = [];
                (r.legs || []).forEach(l => {
                    const n = (l.pnavn || '').trim(); if (!n) return;
                    const erReturBen = erVaartOmraade(l.fra) && hentPostnr(l.til) && !erVaartOmraade(l.til);  // ut av Oslo
                    const erTurBen = erVaartOmraade(l.til) && hentPostnr(l.fra) && !erVaartOmraade(l.fra);    // inn til Oslo
                    if (!_pasMap[n]) { _pasMap[n] = { navn: n, sted: '', harTur: false, harRetur: false, turReqId: '', turStatus: '', turTid: '', returReqId: '', returTid: '', turFra: '', turTil: '' }; _pasRekkef.push(n); }
                    const sted = stedFraAdr(l.til) || l.til || '';
                    if (erReturBen || !_pasMap[n].sted) _pasMap[n].sted = sted;   // foretrekk retur-leggets destinasjon
                    if (erReturBen) { _pasMap[n].harRetur = true; _pasMap[n].returReqId = l.reqId || _pasMap[n].returReqId; _pasMap[n].returTid = l.opp || l.start || _pasMap[n].returTid; }  // retur-leggets rekvisisjon + Oslo-hentetid (når dro fra Oslo)
                    if (erTurBen) { _pasMap[n].harTur = true; _pasMap[n].turReqId = l.reqId || _pasMap[n].turReqId; _pasMap[n].turStatus = l.status || _pasMap[n].turStatus; _pasMap[n].turTid = l.opp || l.start || _pasMap[n].turTid; _pasMap[n].turFra = l.fra || _pasMap[n].turFra; _pasMap[n].turTil = l.til || _pasMap[n].turTil; }  // + hentested→Oslo-mål (ETA-rute)
                });
                // LOKAL tur: ingen passasjer krysser områdegrensa (behandling skjer i området, f.eks.
                // Kongsvinger — ikke Oslo). Da gir «levert/ETA/dro i Oslo» ikke mening. Markeres «🏡 Lokal»
                // nå (skjules i fremtiden, jf. avreist-mønsteret). Tom liste teller ikke som lokal.
                const erLokal = erLokalTur(r);
                // ETA-element (🏁 I Oslo / 🏡 Lokal) — vises i INN-seksjonen, OVER retur-streken.
                let etaEl = '';
                if (erLokal) etaEl = '<div class="kklokal" title="Lokal tur i området (behandling ikke i Oslo) — skjules i fremtiden">🏡 Lokal</div>';
                else {
                    let etaLeg = null;
                    (r.legs || []).forEach(l => {
                        if (erVaartOmraade(l.til) && hentPostnr(l.fra) && !erVaartOmraade(l.fra)) {
                            const o = parseTid(l.opp || l.start);
                            if (o != null && (!etaLeg || o > etaLeg._o)) etaLeg = { fra: l.fra, til: l.til, tid: l.opp || l.start, _o: o };
                        }
                    });
                    if (etaLeg) etaEl = '<div class="kketa" data-resid="' + esc(r.resId) + '" data-tid="' + esc(etaLeg.tid) + '" data-fra="' + esc(etaLeg.fra) + '" data-til="' + esc(etaLeg.til) + '" style="display:none">⏳ ETA…</div>';
                }
                if (_pasRekkef.length) {
                    const navnSpan = p => '<span class="pln">' + esc(p.navn) + (p.sted ? ' – ' + esc(p.sted) : '') + '</span>';
                    // INN-rad (kom inn til Oslo): pure-tur (← + retur-sjekk-pil ⇄) eller 🔁, med levert-status.
                    const radInn = k => {
                        const p = _pasMap[k];
                        const sym = p.harRetur
                            ? '<span title="Tur/retur samme bil — kom inn og kjører tilbake med denne bilen">🔁</span> '
                            : '<span class="prole" title="Tur — inn til behandling (sjekker retur…)" style="color:#22c55e;font-weight:700;font-size:13px">←</span> ';
                        const ts = omrTabellStatusSym(p.turStatus);
                        const stFelt = '<span class="plst" data-rolle="tur"' + (!p.harRetur ? ' data-pur="1"' : '') + (p.turReqId ? ' data-reqid="' + esc(p.turReqId) + '" data-resid="' + esc(r.resId) + '" data-hent="' + esc(p.turTid || '') + '" data-fra="' + esc(p.turFra || '') + '" data-til="' + esc(p.turTil || '') + '"' : '') +
                            (ts.farge ? ' style="color:' + ts.farge + '"' : '') +
                            ' title="' + esc(ts.tip || p.turStatus || '') + '">' + esc(ts.sym + (ts.kort ? ' ' + ts.kort : '')) + '</span>';
                        return '<div class="plr">' + sym + navnSpan(p) + stFelt + '</div>';
                    };
                    // RETUR-rad (skal UT fra Oslo): 🔁 (returtid = «klar fra») eller ➜ ny retur (dro-status async).
                    const radRetur = k => {
                        const p = _pasMap[k];
                        if (p.harTur) {  // 🔁 — returens avreisetid (når bilen kan reise tilbake)
                            const rf = p.returReqId ? '<span class="plretur" data-reqid="' + esc(p.returReqId) + '" data-resid="' + esc(r.resId) + '" title="Returens avreisetid (Pasient klar fra)" style="color:#a78bfa;font-weight:700">↩ ⏳</span>' : '';
                            return '<div class="plr"><span title="Tur/retur samme bil">🔁</span> ' + navnSpan(p) + rf + '</div>';
                        }
                        const stFelt = p.returReqId ? '<span class="plst" data-rolle="retur" data-reqid="' + esc(p.returReqId) + '" data-resid="' + esc(r.resId) + '" data-hent="' + esc(p.returTid || '') + '" title="Henter avgangstid fra Oslo…">⏳</span>' : '';
                        return '<div class="plr"><span title="Retur — ny pasient fra Oslo (på vei hjem)" style="color:#f59e0b;font-weight:700;font-size:12px">→</span> ' + navnSpan(p) + stFelt + '</div>';
                    };
                    const innPas = _pasRekkef.filter(k => _pasMap[k].harTur);
                    const returPas = _pasRekkef.filter(k => _pasMap[k].harRetur);
                    let h = '<div class="kkpas">';
                    if (returPas.length && innPas.length) h += '<div class="kksek inn">⬇ Inn til Oslo</div>';
                    h += innPas.map(radInn).join('');
                    h += etaEl;   // 🏁 I Oslo / 🏡 Lokal — OVER retur-streken
                    if (returPas.length) {
                        h += '<div class="kksek">↩ Retur fra Oslo</div>' + returPas.map(radRetur).join('');
                        // «Klar fra Oslo» = når bilen kan reise tilbake (seneste retur-klar-fra). Sync estimat
                        // fra retur-leggets tid; oppdateres til faktisk «Pasient klar fra» av fyllReturTid.
                        let klarMax = -1; returPas.forEach(k => { const t = parseTid(_pasMap[k].returTid); if (t != null && t > klarMax) klarMax = t; });
                        h += '<div class="kkklar" data-resid="' + esc(r.resId) + '">🏁 Klar fra Oslo ' + (klarMax >= 0 ? tidStr(klarMax) : '…') + '</div>';
                    }
                    pasHtml = h + '</div>';
                } else if (etaEl) {
                    pasHtml = '<div class="kkpas">' + etaEl + '</div>';
                }
            }
            return '<div class="kk" data-res="' + esc(r.resId) + '" style="border-left-color:' + farge + '">' +
                '<div class="kkr"><span><span class="t">' + tid + '</span> <span class="n">' + navn + '</span></span>' +
                (status ? '<span class="kst' + (startet(status) ? ' kjort' : '') + '">' + esc(status) + '</span>' : '') + '</div>' +
                '<div class="kksub">' + sub + '</div>' +
                (meta ? '<div class="kkmeta">' + meta + '</div>' : '') + pasHtml + frist + '</div>';
        };
        win.document.getElementById('kartUt').innerHTML = utVent.map(r => kort(r, turFarge(r), 'ut')).join('') || '<div class="tom">Ingen i vinduet.</div>';
        win.document.getElementById('kartInn').innerHTML = innPaga.map(r => kort(r, turFarge(r), 'inn')).join('') || '<div class="tom">Ingen.</div>';
        fyllLevertStatus(win);   // async: fyll inn-passasjerenes levert-status fra admin (SUTI 1702)
        fyllReturTid(win);       // async: 🔁-passasjerenes retur-avreisetid (når bilen kan reise tilbake)
        const ruteLag = {};
        // Tegn ÉN ventende-rute (hel) eller returbil-rute (stiplet). Returnerer Leaflet-laget.
        const tegn = async (r, fra, til, stiplet) => {
            if (ruteLag[r.resId]) return ruteLag[r.resId];
            const rute = await hentRute(fra, til);
            if (!rute || !rute.geometri || !kart) return null;
            const farge = turFarge(r);
            // Halo under (gjør ruta synlig på alle bakgrunner)
            L.polyline(rute.geometri, { color: casing, weight: stiplet ? 6 : 9, opacity: 0.9, lineCap: 'round' }).addTo(casingLag);
            const pl = L.polyline(rute.geometri, { color: farge, weight: stiplet ? 3.5 : 5.5, opacity: 1, lineCap: 'round', dashArray: stiplet ? '10,8' : null });
            pl.addTo(kartLag);
            L.circleMarker(rute.til, { radius: 6, color: '#fff', weight: 2, fillColor: farge, fillOpacity: 1 }).addTo(kartLag);
            ruteLag[r.resId] = pl;
            return pl;
        };
        // Tegn ÉN returbil (punkt-markør eller stiplet rute). Returnerer laget.
        const tegnRetur = async (r) => {
            if (ruteLag[r.resId]) return ruteLag[r.resId];
            const ri = returInfo(r);
            if (returVis === 'rute') {
                const osloBen = (r.legs || []).find(l => erVaartOmraade(l.til));
                return tegn(r, ri.fra, osloBen ? osloBen.til : 'Oslo', true);
            }
            const ll = await hentKoord(ri.fra);
            if (!ll || !kart) return null;
            const farge = turFarge(r);
            const m = L.marker(ll, { icon: L.divIcon({ className: 'retmark', iconSize: [20, 20], iconAnchor: [10, 10],
                html: '<div style="position:relative;width:20px;height:20px"><div style="width:20px;height:20px;border-radius:50%;background:' + farge + ';opacity:.9;border:2px solid #fff;box-shadow:0 0 3px #000"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px">🚐</div></div>' }) });
            m.bindTooltip('🚐 ' + esc(r.ressurs || '') + ' – ' + esc(stedFraAdr(ri.fra) || ''), { direction: 'top' });
            m.addTo(kartLag);
            ruteLag[r.resId] = m;
            return m;
        };
        // Tegn HELE reisen for én tur/bil: tidsordnede stopp (henting @start, levering @opp) → rutede
        // segmenter (ruter.php, rett-strek-fallback) + nummererte stopp-markører. Viser den faktiske
        // kjørerekkefølgen (samkjøring: hentinger i tidsorden → Oslo → leveringer), ikke bare opphav→Oslo.
        const tegnReise = async (r) => {
            const legs = r.legs || [];
            if (!legs.length) return null;
            const farge = turFarge(r);
            const hend = [];
            legs.forEach(l => {
                const tH = parseTid(l.start || l.opp), tL = parseTid(l.opp || l.start);
                if (l.fra) hend.push({ adr: l.fra, t: tH != null ? tH : 9999, pnavn: l.pnavn, type: 'h' });
                if (l.til) hend.push({ adr: l.til, t: tL != null ? tL : 9999, pnavn: l.pnavn, type: 'l' });
            });
            hend.sort((a, b) => a.t - b.t);
            const stopp = [];
            hend.forEach(h => { if (!stopp.length || stopp[stopp.length - 1].adr !== h.adr) stopp.push(h); });
            for (let i = 0; i < stopp.length; i++) stopp[i].ll = await hentKoord(stopp[i].adr);
            const grp = L.featureGroup();
            for (let i = 0; i < stopp.length - 1; i++) {
                const a = stopp[i], b = stopp[i + 1];
                if (!gyldigKoord(a.ll) || !gyldigKoord(b.ll)) continue;
                let geom = [a.ll, b.ll];
                // Send KOORDINATER (ikke adresse) til ruter.php — den tar «lat,lon» direkte og slipper sin
                // egen geokoding, som feiler for noen steder (f.eks. Jaren/Hurdal) selv om geokod.php traff.
                const rute = await hentRute(a.ll[0] + ',' + a.ll[1], b.ll[0] + ',' + b.ll[1]);
                // rute.geometri + punktene er array-LIGNENDE (rico/Prototype i hovedsiden). MILD punkt-sjekk
                // (p[0]/p[1] endelige tall, hopp over null/NaN) + konverter til RENE [lat,lon] — ellers
                // forkastes alle veg-punkt (→ luftlinje) eller Leaflet krasjer på null ved addTo.
                const g0 = rute && rute.geometri;
                if (g0 && typeof g0.length === 'number' && g0.length >= 2) {
                    const ren = [];
                    for (let k = 0; k < g0.length; k++) { const p = g0[k]; if (p && isFinite(p[0]) && isFinite(p[1])) ren.push([+p[0], +p[1]]); }
                    if (ren.length >= 2) geom = ren;
                }
                try {
                    L.polyline(geom, { color: casing, weight: 7, opacity: 0.9, lineCap: 'round' }).addTo(grp);
                    L.polyline(geom, { color: farge, weight: 4, opacity: 1, lineCap: 'round' }).addTo(grp);
                } catch (_) { }
            }
            let nr = 0;
            for (let i = 0; i < stopp.length; i++) {
                const s = stopp[i]; if (!gyldigKoord(s.ll)) continue; nr++;
                L.marker(s.ll, { icon: L.divIcon({ className: 'stoppmark', iconSize: [18, 18], iconAnchor: [9, 9], html: '<div style="width:18px;height:18px;border-radius:50%;background:' + farge + ';border:2px solid #fff;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 0 3px #000">' + nr + '</div>' }) })
                    .bindTooltip((s.type === 'h' ? '⬆ ' : '⬇ ') + esc(stedFraAdr(s.adr) || s.adr) + (s.pnavn ? ' · ' + esc(s.pnavn) : ''), { direction: 'top' }).addTo(grp);
            }
            if (!grp.getLayers().length) return null;
            grp.addTo(kartLag);   // i kartLag (IKKE kart) → clearLayers() i klikk/re-render fjerner reisen (toggle).
            return grp;
        };
        // Klikk et kort = TOGGLE: samme kort igjen → fjern reisen. Nytt kort → rens og tegn det. Alltid
        // kun ÉN reise om gangen (rent kart).
        win.document.querySelectorAll('#kartwrap .kk').forEach(el => el.onclick = async () => {
            const res = el.dataset.res;
            kartLag.clearLayers(); casingLag.clearLayers();
            win.document.querySelectorAll('#kartwrap .kk.valgt').forEach(k => k.classList.remove('valgt'));
            if (_valgtReise === res) { _valgtReise = null; return; }   // toggle AV
            _valgtReise = res;
            el.classList.add('valgt');
            const r = utVent.find(x => x.resId === res) || innPaga.find(x => x.resId === res);
            if (!r) return;
            const grp = await tegnReise(r);
            if (!grp || !kart) return;
            try { kart.fitBounds(grp.getBounds(), { padding: [40, 40], maxZoom: 13 }); } catch (_) { }
        });
        // Gjenopprett valgt reise etter auto-oppdatering (kartLag ble renset ved re-render) — uten å zoome.
        if (_valgtReise) {
            const sel = win.document.querySelector('#kartwrap .kk[data-res="' + _valgtReise + '"]');
            if (sel) { sel.classList.add('valgt'); const rr = utVent.find(x => x.resId === _valgtReise) || innPaga.find(x => x.resId === _valgtReise); if (rr) tegnReise(rr); }
            else _valgtReise = null;
        }
    }

    /* ── Område-velger ─────────────────────────────── */
    function visVelger() {
        if (!win || win.closed) return;
        if (pollIv) { clearInterval(pollIv); pollIv = null; }
        if (visIv) { clearInterval(visIv); visIv = null; }
        if (frysIv) { clearInterval(frysIv); frysIv = null; }
        if (hasterIv) { clearInterval(hasterIv); hasterIv = null; }
        Object.keys(_hasterPaa).forEach(resId => { const rad = finnRad(resId); if (rad) rad.classList.remove('oa-haster'); });  // fjern blink ved områdebytte
        _hasterPaa = {};
        frysTil = 0;
        sisteData = null;
        const knapper = OMRAADER.map((o, i) =>
            '<button class="omr-btn" data-idx="' + i + '">' + esc(o.navn) + '</button>'
        ).join('');
        win.document.getElementById('rot').innerHTML =
            '<h1>🧭 Område assistent</h1><div class="sub">Velg område</div>' +
            '<div class="velger">' + (knapper || '<div class="tom">Ingen områder konfigurert.</div>') + '</div>';
        win.document.querySelectorAll('.omr-btn').forEach(b => {
            b.onclick = () => velgOmraade(+b.dataset.idx);
        });
    }

    async function velgOmraade(idx) {
        const o = OMRAADER[idx];
        if (!o) return;
        aktivNavn = o.navn; aktivInn = o.inn; aktivUt = o.ut; aktivKilder = o.kilder || [];
        kartMode = true;  // KART er hovedflaten → åpne rett i kart som default (Thomas' valg)
        sisteSkannSig = null;  // nytt område → tving frisk beregning
        if (win && !win.closed) win.document.getElementById('rot').innerHTML = '<p class="tom">Henter ' + esc(o.navn) + '…</p>';
        await lastOmraade();  // sikre at kontorets område-soner er lastet (live fra NISSY-senter)
        lastInnlandet();      // Innlandets postnr-område (for helsebuss-ID); fire-and-forget, har fallback
        // Hent destinasjons-postnr-sett per sone (for farge etter postnr i kombinert visning)
        if (aktivKilder.length > 1) { try { await Promise.all(aktivKilder.map(lastKildePostnr)); } catch (e) {} }
        tikk();
        // Når popupen blir synlig igjen etter å ha vært skjult: hent friskt med en gang.
        if (win && win.document && !win.__oaVisHook) {
            win.__oaVisHook = true;
            win.document.addEventListener('visibilitychange', () => { if (autoRefresh && win && !win.closed && !win.document.hidden) tikk(); });
        }
        if (pollIv) clearInterval(pollIv);
        pollIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(pollIv); pollIv = null; return; }
            if (!autoRefresh) return;  // TEST: auto av → ingen automatisk skann (bruk 🔄 Oppdater)
            tikk();
        }, POLL_MS);
        // Lett re-rendring (cachet data) for at hente-frist/«send ut»-varsel oppdateres ofte
        if (visIv) clearInterval(visIv);
        visIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(visIv); visIv = null; return; }
            if (!autoRefresh) return;  // TEST: auto av → helt statisk visning (ingen periodisk re-rendring)
            if (win.document && win.document.hidden) return;  // ingen ser på → ikke bruk CPU på re-rendring
            if (sisteData && !erFrosset()) { if (kartMode) oppdaterKartLag(sisteData); else render(sisteData); }
        }, 30000);
        // Blink i NISSY på hastende ventende — re-påføres hvert 3. sek (overlever NISSYs re-render) og
        // oppdaterer hva som haster etterhvert som tiden går. Uavhengig av autoRefresh (live operatør-hjelp).
        if (hasterIv) clearInterval(hasterIv);
        hasterIv = setInterval(oppdaterHaster, 3000);
        oppdaterHaster();
        // Nedtelling for frys-knappen; frisk oppdatering når frysen akkurat tinte.
        if (frysIv) clearInterval(frysIv);
        let varFrosset = false;
        frysIv = setInterval(() => {
            if (!win || win.closed) { clearInterval(frysIv); frysIv = null; return; }
            const nu = erFrosset();
            if (varFrosset && !nu) tikk();
            varFrosset = nu;
            oppdaterKnapper();
        }, 1000);
        console.log('[' + NAVN + '] område valgt: ' + o.navn + ' (' + aktivKilder.map(k => k.navn).join('+') + ')');
    }

    /* ── Poll-loop ─────────────────────────────────── */
    // Kompakt signatur av et skann — fanger alt som påvirker forslag (ressurs, tider, fra/til,
    // status, behov, ledsager). Lik signatur to ganger på rad = ingenting har endret seg → vi
    // hopper over hele den tunge reberegningen (reisetid/matrise/geokod/ruter). Sentralt for å
    // tåle mange operatører: en stabil tavle koster da ~null etter første beregning.
    function skannSignatur(data) {
        const proj = arr => (arr || []).map(r =>
            (r.resId || '') + '#' + (r.reqId || '') + '#' + (r.ressurs || '') + '#' + (r._ledsN || '') + '#'
            + (r._behov || []).join(',') + '#'
            + (r.legs || []).map(l => [l.start, l.opp, l.fra, l.til, l.status, l.behov].join('~')).join(';')
        ).sort().join('\n');
        return proj(data.ut) + '\n=INN=\n' + proj(data.inn);
    }

    let kjorer = false;
    async function tikk() {
        // Skjult popup = ingen ser på → ikke skann/regn (sparer NISSY, server og eksterne API).
        if (kjorer || !win || win.closed || !aktivUt || erFrosset() || (win.document && win.document.hidden)) return;
        kjorer = true;
        try {
            const data = await scan();
            const sig = skannSignatur(data);
            if (sig === sisteSkannSig && sisteData) {
                console.log('[' + NAVN + '] skann uendret — hopper over reberegning');
                return;  // tavla er lik forrige gang; behold beriket sisteData
            }
            sisteSkannSig = sig;
            sisteData = data;
            console.log('[' + NAVN + '] skann: inn=' + data.inn.length + ', ut=' + data.ut.length);
            await berik(data);
            if (kartMode) await visKart(data); else render(data);
            oppdaterHaster();  // oppdater NISSY-blink med ferske data
        } catch (e) {
            console.warn('[' + NAVN + '] skann-feil:', e.message);
        } finally { kjorer = false; }
    }

    function start() {
        aapnePopup();
        if (!win) return;
        const auto = byggOmraaderFraSelect();
        if (auto.length) { OMRAADER = auto; console.log('[' + NAVN + '] auto-paret ' + auto.length + ' områder: ' + auto.map(o => o.navn + '(ut ' + o.ut + (o.kilder.length > 1 ? ', soner ' + o.kilder.map(k => k.ut).join('+') : '') + ')').join(', ')); }
        else console.log('[' + NAVN + '] fant ingen filter-par — bruker fallback-liste');
        // Bare ETT område (Nord/Øst) → hopp over velgeren og gå rett inn i kart.
        if (OMRAADER.length === 1) { console.log('[' + NAVN + '] ett område → åpner rett i kart'); velgOmraade(0); }
        else visVelger();
        console.log('[' + NAVN + ' v' + VERSJON + '] aktiv');
    }

    window.__omraadeAssistent = { versjon: VERSJON, scan, beregnForslag };
    start();
})();
