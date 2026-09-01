// === WESTBYS VERKTØYKASSE v2.158-dev ===
// v2.158-dev: REPARASJON av behandlingssted-registeret. Bredde-først-vandringen er ikke
//             komplett: NISSY bygger ikke barnelista når en forelder har >= 500 barn, og
//             underenheter-tabellen er kappet likeså. Under «privat» (#11574) har vi 1851
//             barn, men nesten ingen med id under 20000 — Martina Hansens Hospital (#11580)
//             mangler, og 25 av 31 id-er rundt den (målt 14.08). NISSYs egen diggDown()
//             viser veien: søkesiden tar «parent:<id>» og er ikke underlagt grensen.
//             testParentSok() først (svarer på om region betyr noe), så reparer().

// === WESTBYS VERKTØYKASSE v2.157-dev ===
// v2.157-dev: behandlingsstedsregisteret i NISSY krever ADMIN-tilgang, og den har de færreste
//             operatørene (Thomas 13.08). Toasten fyrte likevel et live-oppslag ved hvert anrop
//             mot et NISSY-koblet kort — dømt til å feile, med et blaff av «Slår opp
//             behandlingsstedet…» som forsvant igjen. Nå skjer det ingenting uten tilgang.
//             Alt annet i toasten går via vår egen server og virker som før. Bakgrunnshøstingen
//             var allerede stille: pollingen krever adminStatus === ok.

// === WESTBYS VERKTØYKASSE v2.156-dev ===
// v2.156-dev: «høst nå» for ETT sted. Jobben kan nå bære en kjent NISSY-id i stedet for et
//             søkeord — da hoppes søket over og stedet + avdelingene hentes direkte. Cachen
//             tømmes først, ellers ville en manuell oppfriskning levert det vi alt hadde.

// === WESTBYS VERKTØYKASSE v2.155-dev ===
// v2.155-dev: søket tar med UNDERAVDELINGENE (to nivåer, tak 120). Det er de som bærer
//             direktenumrene — Grue Sykehjem har seks, og uten dem satt vi igjen med
//             sentralbordet alene. Nummeret operatøren trenger er som regel avdelingens.

// === WESTBYS VERKTØYKASSE v2.154-dev ===
// v2.154-dev: SØK BEHANDLINGSSTED I NISSY PÅ FORESPØRSEL. Registeret manglet Grue Sykehjem og
//             Grue Helsestasjon — årsaken står i NISSYs egen kode: barnelista bygges ikke når
//             en forelder har 500 barn eller mer («childrenCount < 500»), så bredde-først-
//             vandringen ser en forelder uten barn og går videre uten å merke noe. Ingen brutte
//             grener, bare usynlige steder. Søkesiden har ikke den grensen. Nettsiden legger en
//             jobb (bhs_sok), verktøykassen kjører søket over alle fem regioner — regionId er en
//             radio med Helse Øst som standard — henter detaljene og skriver dem inn i registeret.
//             Hullet tettes av den som trengte stedet, ikke ved neste seks-minutters høsting.

// === WESTBYS VERKTØYKASSE v2.153-dev ===
// v2.153-dev: NISSY-søket tar med forbindelsenes numre. Toasten fant faren, men ikke turen hans:
//             søket gikk på datterens nummer, og pasientens eget nummer stod bare i forbindelsen.
//             Nå søkes begge veier (den hun ringer for, og de som ringer for henne), og søket
//             starter av seg selv når en forbindelse har nummer — vi vet jo hvem pasienten er.
//             Treff-linja viser hvilket nummer som traff, så operatøren ser at turen er farens.
// === WESTBYS VERKTØYKASSE v2.152-dev ===
// v2.152-dev: FORBINDELSER i toasten. Line sto som «Line Brager-Larsen (Datter)» — datter av HVEM?
//             Rollen hører til forbindelsen, ikke til personen, så den alene sier ingenting. Toasten
//             viser nå «Datter til Tor Johansen · 922 52 196», og motsatt vei «Ringer på vegne av
//             denne» når det er pasienten som er på tråden. Kortets egen `rolle` skjules når en
//             forbindelse sier det samme bedre — den er en rest fra den gamle modellen.
// === WESTBYS VERKTØYKASSE v2.151-dev ===
// v2.151-dev: høsteren tar med NISSYs KORTNAVN og ALIAS («sab» = Bærum Sykehus). Det er de
//             formene operatørene bruker muntlig, og de gjør navnesøket langt bedre. Krever
//             ny host()-kjøring for å fylles inn.
// === WESTBYS VERKTØYKASSE v2.150-dev ===
// v2.150-dev: registeroppslaget slås KUN opp for behandlere. Registeret er behandlingssteder, så
//             oppslag på en privatperson gir enten ingenting eller et misvisende treff — og på
//             zisson-siden fylte navnesøket forslagslista med navngitte fastleger mens operatøren
//             registrerte en pasient (Thomas 12.08). Hopper også over på pasientlinjene.
// === WESTBYS VERKTØYKASSE v2.149-dev ===
// v2.149-dev: «Fake anrop» merket som det den er — den sender kort_id=1 hardkodet, slår derfor opp
//             kort #1 og ikke nummeret du taster. Den tester ikke ekte flyt. Nytt testanrop i
//             zisson-sidens DEV-boks fyrer samme jobb som et reelt anrop (ko_navn + numre[], uten
//             kort_id) og går gjennom dedup og poller som i drift.
// === WESTBYS VERKTØYKASSE v2.148-dev ===
// v2.148-dev: FIX operatørvarselet var usynlig for KJENTE innringere. Når zisson kjenner kortet
//             sender jobben kort_id, og toasten slo da opp uten telefonnummer — men varselet
//             henger på nummeret. Nå sendes tlf alltid med. (zisson_oppslag.php matcher i tillegg
//             på kortets egne numre, så begge nøkler virker.) Avdekket via Fake anrop, som sender
//             kort_id=1 hardkodet — testveien traff samme hull som ekte anrop.
// === WESTBYS VERKTØYKASSE v2.147-dev ===
// v2.147-dev: OPERATØRVARSEL i toasten — rød trekant (samme konvensjon som AMIS/NISSY). Én operatør
//             kan varsle de andre om en innringer fra zisson; varselet festes på NUMMERET, så det
//             vises også når innringeren ikke har kort. Thomas' tilfelle 11.08: en attest han ikke
//             fikk slettet, og han visste hun kom til å ringe igjen. Alltid utløpsdato — en advarsel
//             som blir hengende i årevis er både unyttig og urimelig. Toasten får rød ramme.
// === WESTBYS VERKTØYKASSE v2.146-dev ===
// v2.146-dev: badgen i pasientlista sier «📞 INNRINGER» i stedet for «ANROPER» (Thomas 10.08) —
//             innringer er ordet som faktisk brukes. Kun visningstekst; interne variabelnavn
//             (_erAnroper o.l.) er urørt.
// === WESTBYS VERKTØYKASSE v2.145-dev ===
// v2.145-dev: OPPHAVSREGELEN i registeroppslaget (Kurbadet-saken 07.08). 23 35 30 50 ga fem treff
//             og ble merket «sentralbord» — men det var Kurbadet Legesenter med sine fire fastleger,
//             altså ETT sted. Serveren avgjør nå: ligger alle treffene i samme gren, er den øverste
//             svaret (behandlingssted.php returnerer `topp` + `under`). Bare urelaterte steder
//             merkes som fellesnummer. Antall treff sier ingenting alene — strukturen gjør det.
// === WESTBYS VERKTØYKASSE v2.144-dev ===
// v2.144-dev: TOASTEN IDENTIFISERER UKJENTE NUMRE fra det høstede NISSY-registeret. Målt 07.08:
//             14 % av anropene kjennes via kort, men ytterligere 16 % ligger i registeret uten at
//             noen har registrert noe — «Bruddkontroll Aker» hadde ringt 37 ganger som ukjent.
//             Slår opp behandlingssted.php?tlf= når kortet mangler ELLER mangler NISSY-kobling.
//             Skiller presist treff fra sentralbord: 19 293 steder deler nummer, så mange treff
//             merkes «SENTRALBORD — N enheter» framfor å se ut som et presist svar.
// === WESTBYS VERKTØYKASSE v2.143-dev ===
// v2.143-dev: høsteren starter nå på ROTEN (id 1, «Rotnivå» — hele det nasjonale treet henger under
//             den, med de fem RHF-ene rett under). Første kjøring sådde midt i treet og lot
//             vandringen finne roten selv. + UTLOGGET-VERN: alle innloggede admin-sider har
//             «Logg ut»-lenken; mangler den, stopper høstingen med tydelig melding i stedet for å
//             male seg gjennom tusenvis av tomme svar (som da kjøringen stanset på 5753 uforklart).
// === WESTBYS VERKTØYKASSE v2.142-dev ===
// v2.142-dev: FIX høstingen lagret ingenting («0 lagret» i det uendelige). Rå JSON.stringify på
//             {steder:[…]} traff Prototype/ricos Array.prototype.toJSON → arrayet ble en STRENG →
//             PHP så ingen liste → «tom steder-liste». Bruker nå jsonStringifyTrygt, som allerede
//             finnes og brukes av kjørekontor-høsteren. Serverens avvisning logges nå eksplisitt i
//             stedet for å se ut som «0 lagret», og __vkt_hostStopp = true avbryter uten reload.
// === WESTBYS VERKTØYKASSE v2.141-dev ===
// v2.141-dev: FIX høsteren krasjet umiddelbart — «NAVN is not defined». Logg-prefikset NAVN finnes
//             i basic_tools, ikke i verktøykassen, som bruker literalen [VERKTØYKASSE].
// === WESTBYS VERKTØYKASSE v2.140-dev ===
// v2.140-dev: HØSTER behandlingssted-registeret fra NISSY — __verktoykasseDev.host() i konsollen.
//             Søkesiden trengs ikke: hver adminTCDetails-side peker både oppover («Overordnet nivå»)
//             og nedover («Underenheter»), så bredde-først-vandring fra ett frø dekker hele treet.
//             Frø: 6184 (Vestre Viken HF) + 11574 («privat»). Tre samtidige kall, batcher på 100 til
//             behandlingssted_lagre.php. OUS' egne data, ingen personopplysninger → server-side OK.
// === WESTBYS VERKTØYKASSE v2.139-dev ===
// v2.139-dev: BEHANDLINGSSTED I TOASTEN (Thomas' idé 06.08). Kort kan nå bære NISSYs
//             behandlingssted-id (oid fra adminTCDetails?id=…, felt i zisson-kortet). Ringer en
//             bedrift, slår toasten opp stedet i NISSY og viser fasit: navn, adresse, telefon,
//             sektor, HER-id/org.nr og utvidbar liste over underenheter (fastleger/avdelinger).
//             Oid er stabil nøkkel — navnematching mot stedsnavn ville vært skjør. Rent tillegg:
//             feiler oppslaget forsvinner blokka, resten av toasten er urørt. Cachet per økt.
// === WESTBYS VERKTØYKASSE v2.138-dev ===
// v2.138-dev: «IKKE BESTILT»-merke i behandlingslista (Thomas 04.08). searchStatus-tabellen har en
//             Status-kolonne — «Bekreftet» = bestilt hos transportør, «Ny» = rekvirert men IKKE
//             bestilt (raden har «Bestill»-lenke). Den kastet vi før, så en ubestilt retur var
//             usynlig fordi grupperingen slår tur+retur sammen til én linje (KOSAR: 2 rekv, retur
//             «Ny»). Nå kobles status til hvert ben via radens egen getRequisitionDetails(...), og
//             linja får gult «⚠ retur ikke bestilt»/«tur ikke bestilt»/«ikke bestilt».
// === WESTBYS VERKTØYKASSE v2.137-dev ===
// v2.137-dev: kopier-pnr-knappen har fått et EKTE kopi-ikon (to overlappende firkanter, SVG) —
//             før brukte den 📋, samme emoji som rekv-badgen ved siden av, bare i annen størrelse
//             (Thomas 04.08). Klikk-kvitteringen lagrer/gjenoppretter innerHTML, ikke textContent,
//             ellers ville SVG-en forsvunnet etter «✓».
// === WESTBYS VERKTØYKASSE v2.136-dev ===
// v2.136-dev: behandlingslista viser OPPMØTE + HENTETID (Thomas 04.08). Retur-tiden er fjernet:
//             detaljsiden gir samme «Pasient klar fra» for begge ben, så «↩ 14:10» var bare
//             hentetiden om igjen — ikke en reell returtid (raden viste «14:40 … 🚕 14:10 · ↩ 14:10»).
//             Ordet «hent» er tilbake (kuttet i v2.134 for å spare plass → to nakne klokkeslett
//             uten forklaring), og tooltip sier «Oppmøte HH:MM · Hentes HH:MM».
// === WESTBYS VERKTØYKASSE v2.135-dev ===
// v2.135-dev: behandlingslista viser KUN dagens og kommende (Thomas 04.08: «turer som har vært
//             tidligere datoer trenger ikke være med»). Dagens allerede passerte turer beholdes
//             dempet — det er ofte dem pasienten ringer om. Har pasienten bare gamle turer vises
//             «Ingen kommende behandlinger (N tidligere)» i stedet for tomt felt.
// === WESTBYS VERKTØYKASSE v2.134-dev ===
// v2.134-dev: SKALERING i tlf-toasten (Thomas 04.08: behandlingslista ble sammenpresset + vannrett
//             scrollbar). Rotårsak: lista lå i den SMALE flex-kolonnen ved siden av Rek/Plan/Attest,
//             og flex-barnet manglet min-width:0 → innholdet dyttet toasten bredere enn containeren.
//             Nå: navn/pnr/adresse + knapper i egen topprad, behandlingene i FULL bredde under, og
//             radene i ÉN grid (max-content | minmax(0,1fr) | max-content) så kolonnene står i flukt
//             og lange stedsnavn får ellipsis. Toast max-width 440px → min(560px, 92vw).
// === WESTBYS VERKTØYKASSE v2.133-dev ===
// v2.133-dev: TLF-TOASTEN VISER DE 5 NÆRMESTE BEHANDLINGENE (Thomas 04.08) — før så operatøren bare
//             ANTALL rekvisisjoner («📋 3 rekv»), ikke hva de gjaldt. Nå listes dag/tid, behandlings-
//             sted, hentetid og returtid per behandling. INGEN nye NISSY-kall: dataene lå allerede i
//             turene sokPnrINissy henter (oppmote_tid m/ dato, klar_fra, fra_/til_navn, retning).
//             Tur- og retur-benet samme dag+sted slås sammen til ÉN behandling (ellers spiser ett
//             tur/retur-par to plasser). Kommende først; færre enn fem framover → fylles med siste
//             passerte, dempet. Resultatfeltet fikk max-height + scroll.
// === WESTBYS VERKTØYKASSE v2.132-dev ===
// v2.132-dev: TLF-SØKET fikk fortsatt feil pasient (Thomas 31.07: pnr fra forrige søk lå igjen i
//             Ssn-feltet og trumfet telefonnummeret). v2.128-blankingen traff ALDRI: NISSY legger
//             <form> direkte i <table> rundt <tr>-ene — ugyldig HTML som parseren foster-parenter,
//             så form-elementet blir tomt og feltene havner UTENFOR det (bekreftet med HTML-dump +
//             konsolltest: alle tre feltene «UTENFOR FORM»). Etterkommer-selektoren `form input`
//             ga derfor 0 treff. Nå: form.elements (respekterer form-eierskap) med fallback til
//             alle input i dokumentet, og Ssn blankes ALLTID eksplisitt som sikkerhetsnett.
// === WESTBYS VERKTØYKASSE v2.131-dev ===
// v2.131-dev: hentRekvisisjon parser nå også tidene fra admin-plakatens Reise-blokk:
//             klar_fra («Pasient klar fra») + oppmote_tid («Oppmøtetidspunkt») — fasit for
//             basic_tools' retning/hentetid når radkolonnene mangler tid (P-rader).
// === WESTBYS VERKTØYKASSE v2.130-dev ===
// v2.130-dev: kort-oppslaget i tlf-toasten tåler nå forbigående nettverksglipp — «Failed to fetch»
//             ga skremmende feiltekst selv om NISSY-søket funket. Nå: automatisk retry (2 forsøk,
//             0,7s pause) + dempet «(kort-info utilgjengelig)» m/ tooltip i stedet for rå feil.
// === WESTBYS VERKTØYKASSE v2.129-dev ===
// v2.129-dev: Treff-verifisering forkastet EKTE treff (Stensland 92263998): pasientsiden lagrer
//             «+4792263998» og (?<!\d)-grensen avviste nummeret rett etter «47». Verifiseringen
//             tester nå også 47-/0047-prefiksede varianter av søkenummeret.
// === WESTBYS VERKTØYKASSE v2.128-dev ===
// v2.128-dev: SIVANESAN-lekkasjen løst (Thomas fant rotårsaken): Finn pasient-skjemaet er
//             sesjonslagret og et gammelt personnummer «lå igjen» i øverste feltet — pnr trumfer
//             telefon → alle tlf-søk returnerte samme pasient. To forsvarslinjer:
//             (1) skjemaet hentes og ALLE tekstfelt blankes eksplisitt før hvert søk;
//             (2) hvert treff VERIFISERES mot editPatient-siden (søkenummeret må stå der) —
//                 forkastede treff logges + rødt varsel i toasten ved 0 gjenværende.
// === WESTBYS VERKTØYKASSE v2.127-dev ===
// v2.127-dev: pasient-treff i toasten viser nå HVILKET nummer som ga treffet (☎ kilde-badge) —
//             to ulike innringere ga samme pasient (SIVANESAN) og vi trengte selvdiagnose for å
//             skille «pasienten har mange numre registrert i NISSY» fra en ekte sammenblanding.
// === WESTBYS VERKTØYKASSE v2.126-dev ===
// v2.126-dev: tlf-søket sender nå RENSEDE sifre til findPatient — Zisson-nummer med mellomrom/+47
//             ga 0 treff selv om pasienten lå i NISSY (PAULSEN: «481 57 872» bommet, «48157872» traff —
//             Thomas verifiserte begge manuelt i Finn pasient). Landkode-variant (47xxxxxxxx) søkes
//             i tillegg som 8-sifret.
// === WESTBYS VERKTØYKASSE v2.125-dev ===
// v2.125-dev: tlf-toast sier «⚠ Du er ikke logget inn i admin» i stedet for «Ingen pasienter funnet» når
//             admin-sesjonen mangler — findPatient svarer 200 OK med login-siden → 0 rader så det SÅ ut som
//             ikke-treff. Detekteres ved 0 treff: mangler søkeskjema (input Phone) eller login-heuristikk.
//             Setter samtidig admin-statusprikken til utlogget (rød).
// === WESTBYS VERKTØYKASSE v2.124-dev ===
// v2.124-dev: toast spør nå ATTEST-REGISTERET via attest-agenten (når tilkoblet) og viser reell aktiv-attest —
//             rekv-søket alene bommet på stående attester (RAZIJA: 5 rekv men aktiv attest). Faller tilbake på
//             rekv-basert deteksjon uten agent. Oppgraderer kun (viser attest når aktive>0), nedgraderer aldri.
// === WESTBYS VERKTØYKASSE v2.123-dev ===
// v2.123-dev: toast-adressen bruker nå samme lyse farge (#f8fafc) som pasientnavnet (var svak grå #64748b).
// v2.122-dev: toast «ingen kort funnet» → dempet 🪪-symbol m/ tooltip (ikke skremmende tekst som forvirrer operatøren).
// === WESTBYS VERKTØYKASSE v2.106-dev ===
// v2.106-dev: DRIFTSMELDING-felt i footeren (per kjørekontor). Til høyre for «🕘 Logg» + «🗗 Vis kart+»
//             vises en amber melding-pill (📣) når kontoret har en aktiv melding. Styres i admin.php
//             («🧰 Verktøykasse»-tab) → ovr_kontor_tilgang.vkt_melding_* → verktoykasse_tilgang.php
//             (t.melding). pollMelding() frisker live ~90s (erAktivEier-guard). À la Overvåker Live.
// === WESTBYS VERKTØYKASSE v2.103-dev ===
// v2.103-dev: ATTEST skilles fra ekte rekvisisjon i pasientlista. searchStatus (ssnSearch)
//             surfacer en stående attest som en «rekvisisjon», men den har INGEN reise —
//             4. arg til getRequisitionDetails(reqId,db,tripid,tripNr) er da `null` (ekte tur
//             har Reisenr). Badge: kun attest → «📄 N attest» (gul) m/ tooltip; miks → «📋 N
//             rekv + 📄 M attest»; ellers «📋 N rekv». (Bekreftet: rekvisisjon-modulen viser
//             «Ingen rekvisisjoner ble funnet» for ren-attest-pasient.) Debug fra v2.102 fjernet.
// === WESTBYS VERKTØYKASSE v2.101-dev ===
// v2.101-dev: ADRESSEVARSEL også for pasienter UTEN rekvisisjon. Når rekv-oppslaget ikke gir
//             pasient_adresse (pasient ringer for å bestille, ingen aktiv rekv) henter vi nå
//             FOLKEREGISTER-adressen fra admin editPatient (pas.rediger_url). Parser adresse-
//             raden (<tr> m/ radio name="default": td[1]=adresse, td[2]=«(Folkeregister)»),
//             prioriterer Folkeregister/ssn-radio, tittel-caser VERSALENE, og kjører samme
//             erVaartOmraade-sjekk → «⚠ IKKE VÅRT OMRÅDE». Cache pr. rediger_url. Merket «(folkereg.)».
// === WESTBYS VERKTØYKASSE v2.99-dev ===
// v2.99-dev: ÉN-INSTANS-EIERSKAP — fikser spøkelses-prod-instans (Jan-Tore: toast hang/dobbeltbesvart,
//            «prod dukket opp»). Rotårsak: dev-takeover satte prod-flagg=false → prod-keeperen re-
//            injiserte prod i evig løkke → to verktøykasser dobbeltkjørte pollerne. Fiks: (1) ikke null
//            prod-flagget; (2) global window.__vkt_eier (dev>prod, ellers nyeste) — alle pollere har
//            `if(!erAktivEier())return`; (3) prod-keeperens inj() viker når dev eier.
// === WESTBYS VERKTØYKASSE v2.98-dev ===
// v2.98-dev: hentTurDetaljerViaRekvnr(rekvnr) — adresseoppslag via searchStatus?nr=<rekvisisjonsnummer>
//            (eksponert på __verktoykasseDev). Lar basic_tools-samkjøring hente admin-adresser uten
//            Reisenr-kolonne; hver rekvisisjon merkes .tripid for ben-valg (tur/retur).
// === WESTBYS VERKTØYKASSE v2.97-dev ===
// v2.97-dev: TLF-TOAST «nummer henger igjen» (Jan-Tore) — × sender nå tlf_svar kategori='lukket'
//            (før: bare DOM-fjerning → jobb pending 10 min → re-pop etter F5). Speiler prod v2.91.
// === WESTBYS VERKTØYKASSE v2.96-dev ===
// v2.96-dev: SØKELOGG-rotårsak FUNNET: Prototype.js (rico) definerer Array.prototype.toJSON →
//            JSON.stringify dobbel-encoder poster-arrayen til STRENG → Array.isArray feiler ved
//            hydrering → logg 0 etter ny fane. Fiks: jsonStringifyTrygt (nøytraliserer toJSON under
//            serialisering) + selvhelbredende lesing (re-parser dobbel-encodede data fra før fiksen).
// === WESTBYS VERKTØYKASSE v2.95-dev ===
// v2.95-dev: TLF-TOAST viser pasientens ADRESSE + varsler «⚠ IKKE VÅRT OMRÅDE» når hjemmeadressens
//            postnr faller utenfor kjørekontorets område-soner (window.__vkt_tilgang.omraade_postnr,
//            samme predikat som Område-assistenten). Adresse hentes fra det eksisterende rekv-oppslaget
//            (pasient_adresse) — ingen ekstra kall. Hjelp operatøren å se om anropet gjelder vår pasient.
// === WESTBYS VERKTØYKASSE v2.94-dev ===
// v2.94-dev: SØKELOGG-fiks — panelet var tomt selv om telleren viste «1». Årsak: Web Storage skrives
//            stille feilet i NISSY (try/catch), og lesningen leste KUN storage. Nå holdes en minne-cache
//            som sann kilde i økten (panelet virker uansett), med localStorage/sessionStorage som
//            best-effort F5-speil. Søkene forlater fortsatt aldri maskinen.
// === WESTBYS VERKTØYKASSE v2.93-dev ===
// v2.93-dev: SØKELOGG overlever F5 — skriver til BÅDE localStorage og sessionStorage og leser den
//            ferskeste. Telleren viste «1» fra minnet, men forsvant ved reload fordi localStorage ikke
//            persisterte i NISSY-konteksten; sessionStorage overlever sidelasting i samme fane.
// === WESTBYS VERKTØYKASSE v2.92-dev ===
// v2.92-dev: SØKELOGG flyttet ned — 🕘-knappen ligger nå inline i NISSYs footer-rad (ved Ping/tema/
//            Dynamiske plakater, masse ledig plass), forankret via #dynamic_poster/#buttonPing-cellen.
//            Frigjør plassen ved Søk/Nullstill; footeren re-rendres ikke av ajax. Panel åpner oppover.
// === WESTBYS VERKTØYKASSE v2.91-dev ===
// v2.91-dev: sjåfør-toast lærer løyvet AV TUREN. Ukjent nummer → operatøren søker opp Reisenr sjåføren
//            spør om → «🔗 Koble til turen jeg fant» leser ressursen RETT fra tur-raden (autoritativt
//            format, ikke operatørens tasting) → «Ja, lagre som C-1048». Løyve-matching normaliseres
//            («C 1048»/«C1048»/«C-1048» = likt). RESSURS-kolonnen leses presist via tr.tbh-header.
//            Manuelt løyve-felt beholdt som fallback.
// === WESTBYS VERKTØYKASSE v2.90-dev ===
// v2.90-dev: SJÅFØRLINJE-toast — anrop på sjåfør-/transportør-kø: slår opp tlf→løyve i selvlærende register
//            (nissy_jobs sjafor_tlf_oppslag/lagre). Treff → finner radene med løyvet i planlegger-tabellene,
//            BLINKER + scroller dit (blå puls 30s) og viser turinfo (tid · fra→til · pasient · status) i
//            toasten. Ukjent nummer → operatøren taster løyvet (lagres → neste gang automatisk).
//            Pasient/Behandler-knappene byttes med «📍 Vis i tabellen»; Avvis beholdes.
// === WESTBYS VERKTØYKASSE v2.89-dev ===
// v2.89-dev: SØKELOGG — alt operatøren søker på i planleggeren (pnr/reisenr/navn, det som står i
//            søkefeltet) huskes LOKALT i localStorage ut dagen (tømmes ved dagsskifte, forlater aldri
//            maskinen). 🕘-knapp ved søkefeltet viser dagens søk m/ klokkeslett+type; klikk på en rad
//            kjører søket på nytt. Capture-fase på #buttonSearch/Enter; dedupe gjentatt likt søk; maks 300.
//            DEV-ONLY til Thomas har testet → promoteres til prod 2.89 (holder versjonene i lås).
// === WESTBYS VERKTØYKASSE v2.88-dev ===
// v2.88-dev: tlf-toast viser NYESTE uviste anrop (server DESC + klient velger høyeste id) → fikser «ny
//            innringer vises ikke». + poll-logg for diagnose.
// v2.87-dev: host-agnostisk — admin/rekvisisjon/planlegging-URLer bruker NISSY_ORIGIN (operatørens
//            faktiske origin) i stedet for hardkodet pastrans-sorost. Fikser CORS-blokk for operatører
//            på nissy6.pasientreiser.nhn.no (annet NISSY-domene). Fallback til pastrans hvis ikke *.nhn.no.
// v2.86-dev: pasientliste — ikke-anropere på samme nummer merkes nøytralt '👥 TILKNYTTET'
//            (familie/husstand) i stedet for 'SANNSYNLIG PASIENT'. Operatøren vet hvem
//            pasienten er; badgen skal ikke påstå pasient-tilhørighet. TILKNYTTET vises
//            kun når anroperen faktisk ble funnet i lista (navn-match med Zisson).
// v2.85-dev: tlf-toast auto-søker pasient når køen er en pasientlinje (ko_navn matcher
//            pasient|innringer|privat) — også uten kort. Operatøren på Oslo Pasientlinjene
//            slipper å klikke Pasient. Krever at zisson.php sender ko_navn i tlf_ny-jobben.
// v2.84-dev: eksponer tilgang på window.__vkt_tilgang (Område assistent leser omraade_postnr).
// v2.83-dev: keeper-popup åpnes automatisk ved oppstart (hopper over hvis en keeper allerede
//            lever via __vkt_keeper_alive-hjerteslag, så F5 ikke stjeler fokus).
// v2.82-dev: utlogget-toast fjernet — admin/rek-tilgang finnes i menyen (statusprikker + snarveier).
// v2.80-dev: Tlf-toast auto-klikker Pasient-knappen også når kortet har gyldig 11-sifret pnr.
// v2.78-dev: send skript-navn på heartbeat (ikke bare start) så sesjon-loggen
//            korrigerer skript='Live'-default for økter som allerede kjører.
//            (Backend live_sesjon.php droppet skript i INSERT → alt etter v2.57
//            ble lagret som default 'Live'. Backend fikset samtidig.)
// v2.77-dev: auto-trigger NISSY-søk når anrop-kort har rolle "Pasient (selv)" —
//            operatør slipper å klikke Pasient-knappen manuelt for kjente pasient-numre.
// v2.76-dev: strip "Pasientreiser "-prefiks fra legacy localStorage-override
//            (vkt_kjorekontor_override) — backend kjenner kun korte kontornavn.
// v2.75-dev: cache-bust på verktoykasse_tilgang.php-fetch. Varnish hadde
//            dobbelt-encoded gammel respons selv med Cache-Control: no-store.
// v2.74-dev: kontornavn uten "Pasientreiser "-prefiks — "Oslo og Akershus" / "Innlandet"
//            (regex strpper det fra NISSY-tittelen, all DB-data er migrert)
// v2.73-dev: send kontor_kode igjen til sesjon-loggen (egen kolonne i sesjoner.php)
//            så vi ser hvilken bookmarklet som ble brukt — kommentar lagres på koden
// v2.72-dev: les vkt_*_pr-nøkler (pasientreiser-bookmarklets) først, fall
//            tilbake til vkt_* for bakoverkompat med /OUS/-bookmarkleter
// v2.71-dev: sesjon-logging bruker EGENTLIG kjorekontor (fra NISSY-tittel),
//            ikke localStorage-override. Override gjelder kun for tilgang/UI —
//            din identitet i sesjoner forblir ditt faktiske kontor.
// v2.70-dev: send kontor til verktoykasse_tilgang.php så superadmin kan bruke
//            Innlandet-bookmarkleten til å teste Innlandet-tilgang fra Oslo-login
// v2.69-dev: "Åpne admin/rek →"-knappene i utlogget-toasten injiserer nå agenten
//            i den åpnede taben (samme flyt som menyens snarveier)
// v2.68-dev: utvid OUS-only-filter til å fange både 'overvaker_*' (1 a) og
//            'overvaaker_*' (2 a) — filnavnene er inkonsistent skrevet i tilgang
// v2.67-dev: SIKKERHETS-FIX 3 — hentTilgang-fallback ga ut Overvåker Live + Avvik
//            som standard ved fetch-feil. Nå returneres TOM verktoy-liste; bruker
//            må ha gyldig tilgangsrad. (Eileen så Live/Avvik uten tildelt tilgang.)
// v2.66-dev: SIKKERHETS-FIX 2 — send nissy=<brukernavn> til tlf_pending så backend
//            kun returnerer den innloggede brukerens egne anrop (ikke broadcast).
//            Backend filtrerer mot dp_ansatte-aliaser, samme mønster som nissy_naviger.
// v2.65-dev: SIKKERHETS-FIX — pollTlfVentende skipper polling når kjorekontor er
//            et annet kontor enn Oslo og Akershus (Zisson-tlf-jobber er per i dag
//            OUS-spesifikke; backend-filter må bygges som ekte fiks).
// v2.64-dev: kompakt pill (6/10 padding, 12px font) + filter ut OUS-only skript
//            (Overvåker Live/Avvik) når kjorekontor ≠ Oslo og Akershus
// v2.63-dev: nøytral pill-knapp "🔧 Verktøykasse" når kjorekontor ≠ Oslo og Akershus
// v2.62-dev: bytt OUS-skjold til 🔧 (skrunøkkel) når kjorekontor ≠ "Oslo og Akershus"
//            (skjoldet er OUS prehospital sin merkevare; ikke for andre kontor)
// v2.61-dev: send vkt_kontor_kode (6-tegns bookmarklet-id) til sesjon-loggen så vi
//            kan spore hvilken test-bookmarklet som ble brukt
// v2.60-dev: localStorage.vkt_kjorekontor_override har forrang for kjorekontor-deteksjon
//            (test-bookmarklet kan tvinge f.eks. "Innlandet" fra Oslo-login)
// v2.59-dev: trim "for " fra kjørekontor-match ("Pasientreisekontor for X" → "X")
// v2.58-dev: hent kjørekontor-navn fra document.title (fallback til body) og
//            send det med på start/heartbeat så sesjon-tabellen kan filtrere per kontor
// v2.57-dev: tlf-toast — vis anroper-navn fra Zisson, beregn alder fra pnr,
//            marker pasientliste-treff som '📞 ANROPER' (navn-match) og resten
//            som 'sannsynlig pasient' (yngst først)
// v2.56-dev: tlf-toast — vis pasient-navn + pasient-tlf når kortet har det,
//            og søk NISSY på BÅDE anrops-tlf og pasient-tlf når Pasient klikkes
// v2.55-dev: tlf-toast — fjern forrige toast automatisk når ny kommer (ikke stable)
// HARDKODET DEV: filen brukes kun via dev-keeper-popup (bookmarklet), ikke via Pinger.
// Launcher-meny som lastes inn i NISSY via Pinger.js-override.
// v2.11: dev/prod-split via filnavn-detektering (verktoykasse_dev.js har eget flagg så
//        prod og dev kan kjøre i parallell — egen bookmarklet aktiverer dev manuelt)
// v2.12-dev: planlegging søke-input — fjern form.submit() (forårsaket page-reload-blink)
// v2.0: ekstrahert "Endre hentetid" + høyreklikk-meny til basic_tools.js (egen prod/dev-fil).
//       Verktoykasse er nå ren shell — status-glow, drag, dropdown, polling, tilgang-loading.
//       Basic Tools auto-lastes etter tilgang er hentet. Toggle for dev-versjon i menyen (superadmin).
// v2.1: kompakt meny + Admin/Rekvisisjon-snarveier i header med statusprikker
// v2.2: vis Basic Tools-versjon i bunn av menyen (med DEV-tag hvis dev-modus)
// v2.3: tlf-oppslag (findPatient) — speiler pnr-flyten, lagres i nissy_oppslag med type='tlf'
// v2.4: nissy_naviger — generisk modul-navigering (rekvisisjon først, designet for å plugge inn flere)
// v2.5: window.__verktoykasse = { utforNissyNaviger, sjekkNavigerEtterLoad, pollNissyNaviger } for debug
// v2.6: nissy_naviger åpner i navngitt vindu (window.open) i stedet for å overstyre admin-tab
// v2.7: auto-submit form i den nye taben — verktøykasse kjører ikke på rekvisisjons-sider
// v2.8: same-origin DOM-tilgang i ny tab — fyll ssn og klikk søk-knapp i den faktiske form-siden
// v2.9: filtrer naviger-kø på operatørens nissy-brukernavn så hver bruker kun får sine jobber
// v2.10: nissy_naviger støtter modul='planlegging' (åpner /planlegging/ og fyller søk=ssn:<pnr>)
// v1.2: turid-polling + badge på 🧰
// v1.3: admin-session-sjekk + keep-alive ping
// v1.4: faktisk henting av turdetaljer fra admin (ajax_reqdetails)
// v1.5: turid → (reqId, resId) via searchStatus (tur/retur støttes)
// v1.6: rekvisisjons-modul keep-alive (separat indikator)
// v1.7: pnr-oppslag (ssnSearch) — henter kommende turer for et fnr
// v1.8: høyreklikk-meny på markerte turer i Planlegger — Endre hentetid
// v1.9: høyreklikk kun på ventende-rader (V-), ikke pågående — pågående krever tilstandssjekk
// v1.10: vis versjon i meny-header + tooltip
// v1.11: vis nåværende hentetid(er) i Endre-tid-modal (lest fra blå Reise tid-kolonne)
// v1.12: nåværende tid blir placeholder i input — ingen egen "Tid nå"-linje
// v1.13: defensiv DOM-fjerning (Rico kræsjer på .remove() når elementet er borte)
// v1.14: les markerte fra DOM (blå rader), ikke g_voppLS.selected — sistnevnte ga "0"
// v1.15: debug-logging i høyreklikk-handler for å spore resId="0"-bug
// v1.16: fiks hardkodet "v1.8"-streng i log + vis array-innhold direkte
// v1.17: bruk index-løkke i stedet for entries()-destructuring (NISSY/Rico ga resId=0)
// v1.18: userid = NISSY-brukernavn (thwe), ikke tall — confirm-API godtar brukernavn
// v1.19: legg til windowName/instanceId i DWR-encrypt — påkrevd av server
// v1.20: behold httpSessionId — server krever den også
// v1.21: oppdater DWR-regex til å matche ny syntaks (dwr.engine.remote.handleCallback)
// v1.22: fjern debug-log fra kontekstmenyHandler — Endre hentetid bekreftet fungerende
// v1.23: Endre-tid blir popover ved cursor (ikke fullscreen modal) + slankere layout
// v1.24: ett input-felt per tur med pasientnavn — kan endre ulike tider samtidig
// v1.25: status-glow følger skjold-formen (drop-shadow), ikke firkant (box-shadow)
// v1.26: større skjold-knapp (72×82 → 110×130)
// v1.27: enda 1.5x større skjold (110×130 → 165×195)
// v1.28: mindre status-glow (4+10px → 2+5px) — passer bedre med større skjold
// v1.29: clip-path skjold-silhuett — bare skjoldet er klikkbart, ikke firkanten
// v1.30: separer klikk-flate fra glow — bilde+glow under, klikk-flate (skjold-form) over
// v1.31: stram klikk-polygon mer — glow-området skal ikke være klikkbart
// v1.32: fjern filter-endring på hover (kun skalering nå) — glow konstant
// v1.33: fiks toggle — mousedown lukket meny før hver klikk, så klikk alltid åpnet
// v1.34: fjern dobbeltklikk-reset (kolliderte med rask toggle)
// v1.35: auto-logger tidsendring til trip.comment ("gammel→ny av brukernavn")
(function() {
    // v2.109-dev: VASK område-soner mot NISSY. Leser kontorets Område-felt (dispatchFilter.fromPostCodes1)
    //             fra editDispatchCenter?id=<dispatch_center_id> live (maks 1×/døgn) og oppdaterer
    //             ovr_kontor_tilgang.omraade_postnr via kjorekontor_vask.php → «IKKE VÅRT OMRÅDE» holder
    //             seg riktig uten manuelt vedlikehold. OoA=560, Innlandet=14802 (alt konfigurert).
    // v2.110-dev: NASJONAL kjørekontor-liste. hoestAlleKjorekontor() leser ALLE dispatch-sentre
    //             (getDispatchCenter + hvert editDispatchCenter→fromPostCodes1, maks 1×/uke) → nasjonal
    //             ovr_kjorekontor via kjorekontor_lagre.php. Toasten viser «→ <kontor>» ved «IKKE VÅRT
    //             OMRÅDE» (kjorekontor.php?postnr=…). Egen tabell, ikke ovr_kontor_tilgang.
    // v2.120-dev: Attest-statusprikk i skjoldet blir GRØNN når attest-agenten er tilkoblet
    //             (vkt_attest_klar + fana lever), grå ellers. Planleggeren svarer attest-agenten med sin
    //             origin (vkt_planlegger_origin) så agenten kan rewrite nissy6-lenker til riktig host.
    // v2.119-dev: UNIVERSAL DISPATCHER — samme bookmarklet velger agent ut fra HVOR den klikkes
    //             (attest-ui→attest-agent, /rekvisisjon/→rekv-agent, /administrasjon/→admin-agent,
    //             ellers planlegging→skjold). Kjører in-page → virker på pastrans, nissy6 OG attest-ui.
    //             Generaliserer v2.116. Én bookmarklet overalt.
    // v2.118-dev: tre launch-knapper nederst i keeper-popupen (⚙️ Admin · 📝 Rekvisisjon · 📋 Attest).
    //             Kaller window.opener.__vkt_launch(modul) → åpner siden via patchet window.open →
    //             auto-injiserer agenten (same-origin). Attest via startAttest; nissy6-slutt = bookmarklet.
    // v2.117-dev: Attest-snarvei åpner nå NISSYs startAttest på SAMME origin (pastrans) i stedet for å
    //             hoppe rett til attest-ui (cross-origin). Da beholder keeperen handamtaket og re-injiserer
    //             rekvisisjons-agenten når attest-flyten KOMMER TILBAKE til en /rekvisisjon/-side (selv
    //             etter cross-origin-omvei via attest-ui). Thomas' «lille hack som faktisk virker».
    // v2.116-dev: bookmarklet klikket på en /rekvisisjon/-side (f.eks. nissy6-altRequisition via attest,
    //             ANNEN vert enn planleggeren → cross-origin, kan ikke auto-injiseres) injiserer nå
    //             rekvisisjons-agenten i SELVE vinduet i stedet for skjoldet. Samme bookmarklet, ett klikk.
    // v2.115-dev: AUTO-FANG NISSY-åpnede popups — patcher window.open (transparent) så et /rekvisisjon/-
    //             eller /administrasjon/-vindu NISSY åpner SELV registreres + får rask 300ms-innskyting
    //             med en gang (var ~20s før, fordi bare verktøykasse-åpnede vinduer ble fanget).
    // v2.114-dev: RASKERE agent-gjenoppretting etter F5 i agent-fane (rekvisisjon/admin). Keeperen
    //             pollet hvert 5s og prøvde injisering kun ÉN gang per runde → opptil ~20s før agenten
    //             kom tilbake. Nå: 2s-runder + bytt til rask 300ms-poll (injiserAgentNårKlar) straks
    //             flagget mangler, med per-tab guard mot stabling.
    // v2.108-dev: FIX «nummer låser seg» (Jan-Tore) — sokTlfINissy/findPatient manglet timeout;
    //             hengende kall låste «Søker...»-knappen permanent (kun F5 frigjorde). AbortController
    //             15 s → feiler tydelig → knapp re-aktiveres, retry uten F5.
    const VERSJON = '2.218';   // HØSTINGEN NÅDDE BARE 22 309 AV 74 720 og meldte likevel FERDIG (Thomas 01.09). Ni foreldre har 500+ barn — de fem RHF-ene og de tre «privat»-bøttene — og NISSY bygger ikke barnelista når childrenCount >= 500. Vandringen kommer til noden, ser tom liste og går videre; 52 411 noder ligger bak den veggen og var bare i registeret fordi tidligere sveip fant dem via andre innganger. host('alle') henter nå id-lista fra vårt EGET register og går gjennom hver node direkte — vi har jo id-ene. Vandringen beholdes for å oppdage nye. host('mangler') tar bare de som ikke er oppdatert i dag   // HØSTINGEN SENDTE ALDRI e_rekvirering/kommune/profesjon: parseren leste dem, men samlet.push() i tre-vandringen utelot dem, så en full sveip lot kolonnene stå tomme for alle 74 720 (Thomas 01.09). e_rekvirering er NISSYs eget synlighetsfilter — testet 01.09: oppføringer uten den vises ikke i NISSY-søket, uansett hvor i treet de henger   // PRIKKENE BLE ALDRI GRØNNE (Thomas 01.09: «etter at rek og admin er logget inn blir de ikke automatisk grønne, men det blir attest»). Attest er PUSH — agenten melder seg hvert 3. sekund — mens admin og rekvisisjon er PULL, og pullen skjedde BARE ved oppstart. Logget operatøren inn etterpå, fikk verktøykassen aldri vite det: prikken sto grå til hele verktøykassen ble lastet på nytt. Sjekken kjører nå ved FOKUS på planleggervinduet, som er det naturlige signalet — flyten er «logg inn der borte, kom tilbake hit» — pluss et 60 s-intervall som sikkerhetsnett. 8 s demping så to signaler i samme øyeblikk ikke gir to oppslag  // TLF-FALLBACKEN VAR ALDRI FESTET (Thomas 31.08: 973 00 204 ga «ingen pasienter», mens nummeret sto i «Tlf/mobilnr fra EPJ: 97300204»). Retrykallet satte `_raa`, men koden som bygger søkenummeret leser `raaFormat` — flagget ble aldri lest, så gjenforsøket bygde +47 på nytt og sendte NØYAKTIG samme søk. Nettet har sett ut som et sikkerhetsnett siden det ble skrevet og alltid gitt de samme null treffene. NISSY matcher EPJ-feltet litterært, så +47-formen finner aldri et nummer som er lagret uten landkode. Retryen sender nå RENSEDE sifre — Zisson leverer «973 00 204» med mellomrom, som ville bommet av en helt annen grunn. +47 er fortsatt førstevalget: det er eneste som virker for 47-serien (v2.176)  // KOMMUNE OG PROFESJON HØSTES NÅ (28.08). Begge står i NISSYs søketreff og har vært parset i klienten hele tiden, men registeret hadde ingen kolonner for dem og lagre-skriptet kastet dem. Kommunen trengs til primærhelse-regelen — den skal IKKE utledes av postnummeret: poststedet kan hete noe annet enn kommunen (1463 Fjellhamar ligger i Lørenskog), og et postnummer kan krysse kommunegrensen, som er nettopp grensetilfellene regelen handler om. Detaljparseren fanger feltene hvis de finnes der; dev-konsollen dumper etikettene på detaljsiden én gang, så vi vet om de faktisk står der eller bare i søketreffet  // KEEPEREN BRUKTE ~30 SEKUNDER (Thomas 27.08). Klokka var problemet, ikke sveipen: keeperen bodde i en setInterval i PLANLEGGERVINDUET, som ligger bak mens operatøren jobber i rekvisisjons-popupen, og Chrome budsjett-struper timere i vinduer den regner som skjulte. Symptomet stemte — agenten kom tilbake i det man byttet til planleggeren. Taktgiveren er nå en Worker (1s): den lever i egen tråd og meldingene kjører i siden selv om vinduet er skjult. Sveipen er uendret, og setInterval-et beholdes som reserve. Innskytingen gjøres DIREKTE per tikk i stedet for via en intern 300 ms-løkke — den løkka var også en timer i det samme skjulte vinduet og arvet samme struping; å fikse klokka uten løkka hadde vært halve jobben  // DIAGNOSE __vkt_keeperStatus() (Thomas 27.08: «bytter jeg steg i rekvisisjonsmodulen blir skriptet borte, og kommer ikke tilbake før jeg bytter til planlegging og tilbake»). Keeperens Map er en lukket variabel, så spørsmålet var ikke mulig å svare på fra konsollen. Skiller de tre kandidatene: fanen står ikke i Map (ble aldri fanget), timeren strupes fordi planleggervinduet er skjult, eller innskytingen kjører men slår feil. Viser også document.visibilityState  // ULIK KNAPPEHØYDE I FOOTEREN (Thomas 27.08: «størrelsesforskjell på høyden enda»). Knappene bygges i TO filer og hadde drevet fra hverandre — 3px/12px uten line-height i verktoykasse, 3px/10px med line-height:1 i basic_tools. Uten line-height er det skriften og EMOJIENE som bestemmer linjeboksen, og de er ikke like høye: 🔧 og 🕘 og ⚙️ gir hver sin. Alle seks har nå samme låste boks (inline-flex, height:22px, line-height:1), så innholdet ikke kan dytte høyden  // FOOTER-PYNT (Thomas 27.08): verktøy-ikonet 🧰 → 🔧, og søkelogg-telleren fra opphøyd tall til «(3)». vertical-align:super løfter tallet over grunnlinja og linjeboksen vokser med det, så Logg-knappen sto et par piksler høyere enn naboene i rekka. Parentesene ligger utenfor tallspennet, slik at begge stedene som oppdaterer telleren fortsatt kan skrive ren textContent  // PASSERTE REKVISISJONER TELLES IKKE (Thomas 26.08: «den har vært»). Badgen sa «3 rekv» mens lista viste 2 — differansen var en retur fra 14.08 som fortsatt sto «Ny». Tallet var riktig, men svarte på et annet spørsmål enn operatøren stiller. Samme målestokk som pnr-vakten; passerte flyttes til tooltipen, ikke bort   // attest-prikken sto grå selv om agenten meldte seg: fargen hvilte på `.closed` mot et KRYSS-ORIGIN vindu, inne i en try med tom catch — feilet det, ble prikken grå uten et pip. Måler nå tid siden siste heartbeat (10 s vindu), som også fanger en fane som henger uten å være lukket   // «attest-agent klar» ble logget hvert 3. sekund — meldingen er en HEARTBEAT, ikke en hendelse. Logger nå kun tilstandsendring (grå → grønn) og ny versjon   // attest-prikken ble grønn først ved neste status-poll: vkt_attest_klar satte flaggene, men fargen settes i tegnAdminStatus. Males nå med én gang agenten melder seg   // kryss-opprinnelse er en FORVENTET tilstand i attest-flyten (pastrans → attest-ui), ikke en feil. Ga SecurityError hvert 300. ms og fylte konsollen med «feil» mens alt virket. Logges nå én gang per fane, og timeout-varselet er stille når årsaken er kjent   // Rekvisisjon/Admin/Attest som EGNE footer-knapper med hver sin statusprikk (Thomas 26.08) — slipper å åpne menyen for et nytt rekvisisjonsbilde. Delt konfig VKT_SNARVEIER brukes av både menyen og footeren, så de kan ikke divergere. Fast rekkefølge via insertBefore søkelogg-cellen   // footer-prikkene sto grå: tegnAdminStatus() maler alle [data-status-for], men hadde kjørt før knappen fantes og kjører først igjen ved statusENDRING. Kaller den nå når knappen bygges   // påloggingsstatus (admin/rekvisisjon/attest) som prikker på «🧰 Verktøy»-knappen, med skille foran. Kobler seg gratis på eksisterende oppdatering — den treffer [data-status-for] hvor som helst, så prikkene kan aldri komme i utakt med menyens   // tlf-toasten vokser nedover etter at den er plassert (innholdet fylles asynkront), så treff falt ut av vinduet når operatøren hadde dratt den ned. ResizeObserver holder den innenfor viewporten — når nedre kant treffer bunnen, flyttes top opp, altså bygger den oppover. Rører den ikke så lenge den får plass   // NISSY admin-KAPABILITETER (Thomas 26.08: «ikke alle har like mye tilgang»). «admin=true» var bare en sesjonssjekk og sa ingenting om hvilke menypunkter brukeren når — et oppslag mot noe man mangler gir innloggingsside, tom parse og «fant ingen data» i stedet for «du mangler tilgang». Leser nå admin-menyen én gang → window.__vkt_nissyAdmin.har()/mangler()   // «🧰 Verktøy»-knapp i footeren åpner samme meny som skjoldet, og skjoldet kan skjules (vkt_vis_skjold, default PÅ) fra Innstillinger. Menyen forankres nedenfra mot knappen; stopPropagation er påkrevd, ellers lukker skjoldets egen document-lytter menyen i samme klikk
    // Hardkodet ER_DEV — fila brukes kun for dev-keeper-popup, ikke som prod
    const ER_DEV = false;
    const FLAG = ER_DEV ? '__westbyVerktoykasse_dev' : '__westbyVerktoykasse';
    function trygtFjern(el) {
        if (el && el.parentNode) {
            try { el.parentNode.removeChild(el); } catch (_) {}
        }
    }
    if (window[FLAG]) {
        console.log('[VERKTØYKASSE' + (ER_DEV ? ' DEV' : '') + '] allerede lastet, hopper over');
        return;
    }
    // Prod-cleanup: hvis Pinger har auto-lastet prod først, fjern prod-skjoldet
    // før vi tar over. Vi vil ikke ha to skjold på skjermen samtidig.
    // NB: vi setter IKKE prod-flagget til false lenger — det fikk prod-keeperen til å
    // tro at prod ikke var lastet og RE-INJISERE prod i evig løkke (spøkelses-instans
    // som dobbeltkjørte pollerne → tlf-toast hang/dobbeltbesvart). Flagget holdes truthy
    // så prod-keeperens inj() står ned; eierskapet under sørger for at prod-pollerne viker.
    if (ER_DEV && window.__westbyVerktoykasse) {
        try {
            trygtFjern(document.getElementById('vkt-skjold'));
            trygtFjern(document.getElementById('vkt-skjold-meny'));
            console.log('[VERKTØYKASSE DEV] tok over fra prod (Pinger auto-load)');
        } catch (e) {
            console.warn('[VERKTØYKASSE DEV] prod-cleanup feilet:', e.message);
        }
    }
    // === UNIVERSAL DISPATCHER ===
    // Samme bookmarklet lastes OVERALT; vi velger agent ut fra HVOR vi er. Bookmarkleten kjører IN-PAGE
    // (same-origin med siden), så den virker på pastrans, nissy6 OG attest-ui — det er nettopp dette som
    // kommer forbi cross-origin-veggen. Planlegging (eller ukjent side) → ingen treff → fortsett ned til
    // skjold-flyten. Rekvisisjon/admin gjenkjennes på path; attest på host (pathen der er bare «/»).
    {
        let aFil = null, aFlag = null;
        if (/attest-ui\.pasientreiser\.nhn\.no/i.test(location.hostname || '')) {
            aFil = ER_DEV ? 'verktoykasse_attest_dev.js' : 'verktoykasse_attest.js';
            aFlag = ER_DEV ? '__vkt_attest_dev_agent' : '__vkt_attest_agent';
        } else if (/^\/rekvisisjon\//.test(location.pathname || '')) {
            aFil = ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js';
            aFlag = ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent';
        } else if (/^\/administrasjon\//.test(location.pathname || '')) {
            aFil = ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js';
            aFlag = ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent';
        }
        if (aFil) {
            if (!window[aFlag]) {
                const s = document.createElement('script');
                s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + aFil + '&_=' + Date.now();
                document.head.appendChild(s);
                console.log('[VERKTØYKASSE] dispatcher → ' + aFil + ' (' + location.hostname + location.pathname + ')');
            }
            return;  // ikke tegn planlegger-skjoldet — vi er på en agent-side
        }
    }
    window[FLAG] = VERSJON;
    if (!ER_DEV) window.__VERKTOYKASSE_VERSION = VERSJON;
    // Sticky aktiv-variant — admin/rekvisisjon-agentene re-injiserer DENNE varianten (ikke sin egen
    // hardkodede). Slik injiserer en gammel prod-agent dev når operatøren kjører dev → ingen spøkelses-prod.
    try { localStorage.setItem('vkt_variant', ER_DEV ? 'dev' : 'prod'); } catch (_) {}

    // === ÉN-INSTANS-EIERSKAP ===
    // Flere verktøykasser (prod + dev) kan havne i samme planleggervindu (keeper re-injiserer).
    // Da dobbeltkjørte pollerne. Løsning: én global eier (window.__vkt_eier); DEV vinner alltid
    // over prod, ellers nyeste instans. Pollere og keeper-inj respekterer eierskapet.
    const INSTANS_ID = (ER_DEV ? 'dev' : 'prod') + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    function kanEie() {
        const e = window.__vkt_eier;
        if (!e || e.id === INSTANS_ID) return true;
        if (ER_DEV && !e.dev) return true;       // dev tar alltid over prod
        if (e.dev && !ER_DEV) return false;      // prod viker for dev
        return true;                              // samme type → nyeste (re-injisert) tar over
    }
    if (kanEie()) window.__vkt_eier = { id: INSTANS_ID, dev: ER_DEV, t: Date.now() };
    function erAktivEier() { return !!(window.__vkt_eier && window.__vkt_eier.id === INSTANS_ID); }

    const SERVER = 'https://thomaswestby.no/skript/skript.php?fil=';
    const TILGANG_URL = 'https://thomaswestby.no/skript/verktoykasse_tilgang.php';
    const JOBS_URL    = 'https://thomaswestby.no/skript/nissy_jobs.php';
    // NISSY nås via flere domener (pastrans-sorost.mq.nhn.no, nissy6.pasientreiser.nhn.no, …).
    // Bruk operatørens FAKTISKE origin så admin-/rekvisisjon-kall blir same-origin (ellers CORS-blokk).
    const NISSY_ORIGIN = (typeof location !== 'undefined' && /\.nhn\.no$/i.test(location.hostname || '')) ? location.origin : 'https://pastrans-sorost.mq.nhn.no';
    const ADMIN_BASE  = NISSY_ORIGIN + '/administrasjon/admin';
    const ADMIN_URL   = NISSY_ORIGIN + '/administrasjon/';
    const REK_URL     = NISSY_ORIGIN + '/rekvisisjon/requisition';

    // ── SNARVEIER: ADMIN / REKVISISJON / ATTEST ────────────────────────────────────────
    // Én kilde, to visninger: menyen i skjoldet OG knappene i footeren (Thomas 26.08 —
    // «da slipper vi å gå inn på menyen for å åpne nytt rekvisisjonsbilde»).
    // Hver snarvei åpner en NAVNGITT fane og injiserer sin agent (mutual keeper-mønster), så
    // gjenbruk av fanen og re-injisering etter navigasjon virker likt uansett hvor man klikket.
    const VKT_SNARVEIER = {
        rek: {
            tekst: 'Rekvisisjon', url: REK_URL, statusKey: 'rek',
            tittel: 'Åpne rekvisisjonsbildet i egen fane',
            agent: {
                tabName: ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon',
                fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
                flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
                pathPrefix: '/rekvisisjon/',
            },
        },
        admin: {
            tekst: 'Admin', url: ADMIN_URL, statusKey: 'admin',
            tittel: 'Åpne NISSY administrasjon i egen fane',
            agent: {
                tabName: ER_DEV ? 'nissy-admin-dev' : 'nissy-admin',
                fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js',
                flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent',
                pathPrefix: '/administrasjon/',
            },
        },
        attest: {
            // ⚠️ Går via NISSYs egen startAttest på SAMME origin, ikke rett til attest-ui
            //    (cross-origin). Da beholder vi håndtaket til vinduet, og keeperen re-injiserer
            //    rekvisisjons-agenten når flyten KOMMER TILBAKE til en /rekvisisjon/-side.
            tekst: 'Attest', url: NISSY_ORIGIN + '/rekvisisjon/requisition/startAttest', statusKey: 'attest',
            tittel: 'Åpne Attest via startAttest (samme origin) — agenten injiseres når flyten lander på rekvisisjon',
            agent: {
                tabName: ER_DEV ? 'nissy-attest-dev' : 'nissy-attest',
                fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
                flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
                pathPrefix: '/rekvisisjon/',
            },
        },
    };

    function apneSnarvei(key) {
        const sn = VKT_SNARVEIER[key];
        if (!sn) return;
        const w = window.open(sn.url, sn.agent.tabName);
        if (!w) { alert('Popup blokkert'); return; }
        try { w.focus(); } catch (_) {}
        injiserAgentNårKlar(w, sn.agent.fil, sn.agent.flag, sn.agent.pathPrefix);
        holdTabLevende(w, sn.agent.tabName, sn.url, sn.agent.fil, sn.agent.flag, sn.agent.pathPrefix);
    }

    const ADMIN_PING_MS = 180000;   // 3 min keep-alive (admin + rekvisisjon)
    const TURID_POLL_MS = 15000;    // 15 sek ventende-sjekk

    let knappRef = null;             // referanse til 🔧-knappen
    let adminStatus = 'ukjent';      // 'ok' | 'utlogget' | 'feil' | 'ukjent'
    let rekStatus   = 'ukjent';      // samme verdier — rekvisisjons-modul

    // === ADMIN-SESJON — samme pattern som overvaaker_avvik.js ===
    async function sjekkAdminLogin() {
        try {
            const res = await fetch(`${ADMIN_BASE}/ajax_reqdetails?id=1&db=1&tripid=1`);
            if (res.status === 401 || res.status === 403) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (HTTP ' + res.status + ')');
                return false;
            }
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                console.warn('[VERKTØYKASSE] Admin ikke innlogget (login-side detektert)');
                return false;
            }
            return true;
        } catch (e) {
            console.warn('[VERKTØYKASSE] Admin-sjekk feilet:', e.message);
            return null;  // nettverksfeil, ikke samme som utlogget
        }
    }

    async function oppdaterAdminStatus() {
        const result = await sjekkAdminLogin();
        if (result === true) adminStatus = 'ok';
        else if (result === false) adminStatus = 'utlogget';
        else adminStatus = 'feil';
        tegnAdminStatus();
        console.log('[VERKTØYKASSE] Admin-status:', adminStatus);
        return adminStatus;
    }

    // === REKVISISJONS-MODUL — keep-alive (separat sesjon enn admin) ===
    async function sjekkRekvisisjonLogin() {
        try {
            const res = await fetch(REK_URL, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) return false;
            const html = await res.text();
            if (html.includes('Logg inn') || html.includes('ikke tilgang') ||
                (html.includes('login') && !html.includes('logout') && html.length < 2000)) {
                return false;
            }
            return true;
        } catch(e) {
            console.warn('[VERKTØYKASSE] Rekvisisjon-sjekk feilet:', e.message);
            return null;
        }
    }

    async function oppdaterRekvisisjonStatus() {
        const result = await sjekkRekvisisjonLogin();
        if (result === true) rekStatus = 'ok';
        else if (result === false) rekStatus = 'utlogget';
        else rekStatus = 'feil';
        tegnAdminStatus();  // samme tegne-funksjon oppdaterer begge visningene
        console.log('[VERKTØYKASSE] Rekvisisjon-status:', rekStatus);
        return rekStatus;
    }

    // NISSY-brukernavn fra cookie-prefix (samme logikk som Avvik/Live-skriptene)
    function hentNissyBrukernavn() {
        try {
            const lagret = localStorage.getItem('ovr_nissy_brukernavn');
            if (lagret) return lagret.trim().toLowerCase();
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

    async function hentTilgang(nissy) {
        try {
            const kontor = hentKjorekontor() || '';
            // Cache-bust: Varnish-cachen kan ha gamle (feil-encoded) responser selv
            // når PHP setter Cache-Control: no-store. Unik _ssikrer fersk svar.
            const url = `${TILGANG_URL}?nissy=${encodeURIComponent(nissy || '')}`
                + (kontor ? `&kontor=${encodeURIComponent(kontor)}` : '')
                + `&_=${Date.now()}`;
            const r = await fetch(url, { cache: 'no-store' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return await r.json();
        } catch(e) {
            // SIKKERHET: aldri gi ut verktøy som standard ved feil — bruker må ha gyldig
            // tilgangsrad. Tidligere fallback ga Live + Avvik til alle, inkl. Eileen.
            console.warn('[VERKTØYKASSE] Feil ved henting av tilgang — viser ingen verktøy:', e.message);
            return { funnet: false, navn: null, verktoy: [] };
        }
    }

    // Alle kandidat-brukernavn fra cookiene (det kan henge igjen cookies fra en annen
    // NISSY-økt, f.eks. «twestby» fra Innlandet + «thwe» fra Oslo). Returnerer unik liste.
    function hentNissyKandidater() {
        const kand = [];
        try {
            const cookies = document.cookie.split(';').map(c => c.trim());
            const suffikser = ['efilter', 'vfilter', 'rfilter', 'popp', 'vopp'];
            for (const c of cookies) {
                const navn = c.split('=')[0];
                for (const s of suffikser) {
                    if (navn.endsWith(s) && navn.length > s.length) {
                        const b = navn.slice(0, -s.length).toLowerCase();
                        if (b && !kand.includes(b)) kand.push(b);
                    }
                }
            }
        } catch (e) {}
        return kand;
    }

    // Prøver kandidatene mot tilgang og bruker den som faktisk er registrert (funnet:true).
    // Cacher den løste brukeren i localStorage så tlf/sesjon/userid blir riktige overalt.
    async function loesNissyOgTilgang() {
        const kandidater = hentNissyKandidater();
        // Forkast stale cache som ikke lenger er blant cookiene (annen bruker / økt)
        const cache = (localStorage.getItem('ovr_nissy_brukernavn') || '').trim().toLowerCase();
        if (cache && !kandidater.includes(cache)) { try { localStorage.removeItem('ovr_nissy_brukernavn'); } catch (e) {} }
        const prov = (cache && kandidater.includes(cache)) ? [cache].concat(kandidater.filter(k => k !== cache)) : kandidater;
        console.log(`[VERKTØYKASSE v${VERSJON}] nissy-kandidater: ${prov.join(', ') || '(ingen)'}`);
        let t = null, nissy = '';
        for (const k of prov) { const r = await hentTilgang(k); if (r && r.funnet) { t = r; nissy = k; break; } }
        if (!t) { nissy = prov[0] || ''; t = await hentTilgang(nissy); }
        if (t.funnet && nissy) { try { localStorage.setItem('ovr_nissy_brukernavn', nissy); } catch (e) {} }
        console.log(`[VERKTØYKASSE v${VERSJON}] valgt nissy_id=${nissy || '(tom)'} (funnet=${t.funnet})`);
        return { nissy, t };
    }

    function tegnMeny(tilgang) {
        const knapp = document.createElement('div');
        knapp.id = ER_DEV ? 'vkt-skjold-dev' : 'vkt-skjold';
        knapp.setAttribute('role', 'button');
        knapp.setAttribute('tabindex', '0');
        knapp.title = (ER_DEV ? '[DEV] ' : '') + (tilgang.navn ? `Verktøykasse v${VERSJON} — ${tilgang.navn}` : `Westbys verktøykasse v${VERSJON}`);
        // Dev-versjon plasseres litt ned/venstre så prod og dev ikke overlapper, og får gul label-tag
        const startTop = ER_DEV ? '210px' : '6px';
        knapp.style.cssText = [
            'position:fixed', `top:${startTop}`, 'right:8px', 'z-index:2147483647',
            'width:165px', 'height:195px', 'border:none', 'background:transparent',
            'cursor:default', 'transition:transform 0.15s',
            'padding:0', 'overflow:visible',
            'display:flex', 'align-items:center', 'justify-content:center',
            'font-size:36px', 'line-height:1'
        ].join(';');
        if (ER_DEV) {
            const devLabel = document.createElement('div');
            devLabel.textContent = 'DEV';
            devLabel.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);background:#fbbf24;color:#451a03;font-weight:700;font-size:11px;letter-spacing:1px;padding:2px 8px;border-radius:0 0 6px 6px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;z-index:1;';
            knapp.appendChild(devLabel);
        }

        // Skjoldet tilhører OUS prehospital — kun for Oslo og Akershus.
        // Andre kontor får 🔧 (skrunøkkel) som nøytralt verktøy-symbol.
        const erOslo = /oslo og akershus/i.test(hentKjorekontor() || '');
        let klikkFlateStil;
        if (erOslo) {
            const logoImg = document.createElement('img');
            logoImg.src = 'https://thomaswestby.no/img/pre_logo.png';
            logoImg.alt = '';
            logoImg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));transition:filter 0.15s;pointer-events:none;';
            logoImg.onerror = () => {
                knapp.removeChild(logoImg);
                knapp.textContent = '🏥';
            };
            knapp.appendChild(logoImg);
            klikkFlateStil = 'clip-path:polygon(50% 10%, 78% 18%, 78% 50%, 68% 78%, 50% 86%, 32% 78%, 22% 50%, 22% 18%)';
        } else {
            // Kompakt nøytral pill-knapp — overstyrer shield-dimensjonene
            knapp.style.cssText = [
                'position:fixed', `top:${startTop}`, 'right:8px', 'z-index:2147483647',
                'padding:5px 10px',
                'background:#1e293b', 'border:1px solid #334155', 'border-radius:6px',
                'font-size:12px', 'font-weight:600', 'color:#e2e8f0',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
                'box-shadow:0 2px 6px rgba(0,0,0,0.4)',
                'cursor:pointer', 'user-select:none',
                'transition:transform 0.15s, background 0.15s',
                'display:flex', 'align-items:center', 'gap:4px',
                'line-height:1.2'
            ].join(';');

            const tekst = document.createElement('span');
            tekst.textContent = '🔧 Verktøykasse';
            tekst.style.pointerEvents = 'none';
            knapp.appendChild(tekst);

            klikkFlateStil = '';  // hele pillen er klikkbar — ingen clip-path nødvendig
        }

        // Klikk-flate over ikonet — fanger bare klikk på selve formen
        const klikkFlate = document.createElement('div');
        klikkFlate.style.cssText = [
            'position:absolute', 'inset:0', 'z-index:1',
            'cursor:pointer',
            klikkFlateStil
        ].join(';');
        knapp.appendChild(klikkFlate);

        klikkFlate.onmouseover = () => {
            knapp.style.transform = 'scale(1.1)';
        };
        klikkFlate.onmouseout = () => {
            knapp.style.transform = '';
        };

        // Meny
        const meny = document.createElement('div');
        meny.id = ER_DEV ? 'vkt-skjold-dev-meny' : 'vkt-skjold-meny';
        meny.style.cssText = [
            'position:fixed', 'top:60px', 'right:10px', 'z-index:2147483647',
            'background:#1e293b', 'border:1px solid #334155', 'border-radius:10px',
            'padding:4px', 'display:none', 'min-width:220px',
            'box-shadow:0 10px 30px rgba(0,0,0,0.5)',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif'
        ].join(';');

        // Header
        const h = document.createElement('div');
        h.textContent = tilgang.navn ? tilgang.navn.split(',')[0] : 'Westbys verktøykasse';
        h.style.cssText = 'padding:6px 10px 4px;font-size:11px;color:#f8fafc;font-weight:700;display:flex;align-items:center;gap:6px;';
        const ver = document.createElement('span');
        ver.textContent = `v${VERSJON}`;
        ver.style.cssText = 'font-size:9px;color:#64748b;font-weight:500;';
        h.appendChild(ver);
        if (tilgang.rolle && tilgang.rolle !== 'ansatt') {
            const badge = document.createElement('span');
            badge.textContent = tilgang.rolle.toUpperCase();
            badge.style.cssText = 'font-size:8px;padding:1px 4px;background:#1d4ed8;color:#bfdbfe;border-radius:3px;font-weight:700;';
            h.appendChild(badge);
        }
        meny.appendChild(h);

        // Admin / Rekvisisjon-snarveier med statusprikker
        // For Rekvisisjon: åpne i navngitt tab + injiser agent (mutual keeper-mønster)
        const lagSnarvei = (tekst, url, statusKey, agent) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 8px;color:#e2e8f0;text-decoration:none;font-size:11px;border-radius:5px;background:#0f172a;border:1px solid #334155;transition:background 0.1s;';
            a.onmouseover = () => a.style.background = '#334155';
            a.onmouseout = () => a.style.background = '#0f172a';
            const prikk = document.createElement('span');
            prikk.dataset.statusFor = statusKey;
            prikk.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#64748b;flex-shrink:0;';
            const t = document.createElement('span');
            t.textContent = tekst;
            a.appendChild(prikk);
            a.appendChild(t);
            // Hvis agent er gitt: åpne i navngitt tab + injiser agent + holdTabLevende
            if (agent) {
                a.onclick = (e) => {
                    e.preventDefault();
                    const w = window.open(url, agent.tabName);
                    if (!w) { alert('Popup blokkert'); return; }
                    try { w.focus(); } catch (_) {}
                    injiserAgentNårKlar(w, agent.fil, agent.flag, agent.pathPrefix);
                    holdTabLevende(w, agent.tabName, url, agent.fil, agent.flag, agent.pathPrefix);
                };
            }
            return a;
        };
        const snarveier = document.createElement('div');
        snarveier.style.cssText = 'display:flex;gap:4px;padding:0 4px 4px;';
        ['rek', 'admin', 'attest'].forEach(k => {
            const sn = VKT_SNARVEIER[k];
            const el = lagSnarvei(sn.tekst, sn.url, sn.statusKey, sn.agent);
            el.title = sn.tittel;
            snarveier.appendChild(el);
        });
        meny.appendChild(snarveier);

        // "Hold aktiv etter F5" — åpner keeper-popup som re-injiserer verktøykassen
        // automatisk ved F5. Holder også basic_tools levende fordi lastBasicTools
        // kalles ved hver init.
        const keeperRad = document.createElement('div');
        keeperRad.style.cssText = 'padding:0 4px 4px;';
        const keeperKnapp = document.createElement('a');
        keeperKnapp.href = '#';
        keeperKnapp.textContent = '🛡 Hold aktiv etter F5';
        keeperKnapp.title = 'Åpner liten popup som re-injiserer verktøykassen automatisk etter F5 i NISSY';
        keeperKnapp.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 8px;color:#fbbf24;text-decoration:none;font-size:11px;font-weight:600;border-radius:5px;background:#0f172a;border:1px solid #334155;transition:background 0.1s;';
        keeperKnapp.onmouseover = () => keeperKnapp.style.background = '#334155';
        keeperKnapp.onmouseout = () => keeperKnapp.style.background = '#0f172a';
        keeperKnapp.onclick = (e) => {
            e.preventDefault();
            apneKeeperPopup();
        };
        keeperRad.appendChild(keeperKnapp);
        meny.appendChild(keeperRad);

        const skille = document.createElement('div');
        skille.style.cssText = 'border-top:1px solid #334155;margin:2px 0;';
        meny.appendChild(skille);

        if (!tilgang.verktoy || tilgang.verktoy.length === 0) {
            const tom = document.createElement('div');
            tom.textContent = 'Ingen tilgjengelige verktøy';
            tom.style.cssText = 'padding:8px 10px;font-size:11px;color:#64748b;text-align:center;font-style:italic;';
            meny.appendChild(tom);
        }

        // OUS-only verktøy som ikke vises for andre kontor (skjult når !erOslo).
        // Filnavnene er inkonsistent skrevet (overvaker_* / overvaaker_*), så
        // regexen tar én eller flere a-er. Vi matcher også på visningsnavn for sikkerhets skyld.
        const erOusOnly = (v) => {
            const fil = v.fil || '';
            const navn = v.navn || '';
            return /overva+ker_(live|avvik)/i.test(fil)
                || /overv[aå]ker\s+(live|avvik)/i.test(navn);
        };
        tilgang.verktoy.forEach(v => {
            if (v.separator) {
                const sep = document.createElement('div');
                sep.textContent = v.tekst;
                sep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
                meny.appendChild(sep);
                return;
            }
            if (!erOslo && erOusOnly(v)) {
                console.log(`[VERKTØYKASSE] skjuler ${v.navn} (OUS-only, kjørekontor=${hentKjorekontor() || '?'})`);
                return;
            }
            const lenke = document.createElement('a');
            lenke.href = '#';
            lenke.style.cssText = 'display:flex;align-items:center;gap:7px;padding:5px 10px;color:#e2e8f0;text-decoration:none;font-size:12px;border-radius:5px;transition:background 0.1s;';
            lenke.onmouseover = () => lenke.style.background = '#334155';
            lenke.onmouseout = () => lenke.style.background = '';

            const prikk = document.createElement('span');
            prikk.style.cssText = `width:6px;height:6px;border-radius:50%;background:${v.farge};flex-shrink:0;`;
            lenke.appendChild(prikk);

            const navn = document.createElement('span');
            navn.textContent = v.navn;
            lenke.appendChild(navn);

            lenke.onclick = (e) => {
                e.preventDefault();
                const s = document.createElement('script');
                s.src = SERVER + v.fil + '&_=' + Date.now();
                s.onload = () => console.log('[VERKTØYKASSE] lastet:', v.fil);
                s.onerror = () => alert('Feil ved lasting av ' + v.fil);
                document.head.appendChild(s);
                meny.style.display = 'none';
            };
            meny.appendChild(lenke);
        });

        // Footer
        if (!tilgang.funnet) {
            const f = document.createElement('div');
            f.textContent = 'Ukjent bruker — viser standardsett';
            f.style.cssText = 'padding:5px 10px;font-size:9px;color:#64748b;border-top:1px solid #334155;margin-top:2px;font-style:italic;';
            meny.appendChild(f);
        }

        // Basic Tools-versjon — oppdateres når basic_tools.js har lastet
        const btFooter = document.createElement('div');
        btFooter.id = 'vkt-bt-versjon';
        btFooter.style.cssText = 'padding:4px 10px;font-size:9px;color:#475569;border-top:1px solid #334155;margin-top:2px;display:flex;align-items:center;gap:4px;';
        btFooter.innerHTML = 'Basic Tools <span data-bt-ver>laster…</span>';
        meny.appendChild(btFooter);

        // AVANSERT-seksjon — kun synlig for superadmin
        if (tilgang.rolle === 'superadmin') {
            const devSep = document.createElement('div');
            devSep.textContent = 'AVANSERT';
            devSep.style.cssText = 'padding:6px 10px 2px;font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #334155;margin-top:2px;';
            meny.appendChild(devSep);

            // Fake anrop — snarvei uten zisson. NB: sender kort_id=1 hardkodet, så toasten
            // slår opp KORT #1 og ikke nummeret du taster — den viser altså feil kort og
            // tester ikke den ekte veien (avdekket 12.08 da et operatørvarsel «ikke virket»).
            // Bruk «🎲 Fyr til toasten» i zisson-siden når du skal teste på ordentlig.
            const fakeLenke = document.createElement('div');
            fakeLenke.textContent = '🎲 Fake anrop (rå — ser bort fra nummeret)';
            fakeLenke.title = 'Rask røyktest av selve toasten. Slår opp kort #1, ikke nummeret — bruk testanrop i zisson for ekte flyt.';
            fakeLenke.style.cssText = 'padding:5px 10px;color:#fbbf24;cursor:pointer;border-radius:4px;font-size:11px;';
            fakeLenke.onmouseover = () => fakeLenke.style.background = '#334155';
            fakeLenke.onmouseout = () => fakeLenke.style.background = '';
            fakeLenke.onclick = async () => {
                const tlf = prompt('Telefonnummer (8 siffer):', '12345678');
                if (!tlf) return;
                try {
                    const api = window.__verktoykasseDev || window.__verktoykasse;
                    await api.testTlf(tlf, { kort_id: 1, ko_navn: 'Test-kø' });
                } catch (e) { console.warn('[VERKTØYKASSE] fake anrop feilet:', e); }
            };
            meny.appendChild(fakeLenke);
        }

        // === Drag + posisjon-persistens ===
        // Lagrer posisjon i localStorage så operatør beholder den mellom F5.
        const LS_KEY = ER_DEV ? 'vkt_widget_pos_dev' : 'vkt_widget_pos';
        let drar = false;
        let harFlyttet = false;
        let offsetX = 0, offsetY = 0;
        let startX = 0, startY = 0;

        // Plasser menyen relativt til knappen (så den følger med når knappen flyttes)
        function plassérMeny() {
            const r = knapp.getBoundingClientRect();
            const menyBredde = 240;
            // Hvis knappen er på venstre halvdel: meny til høyre for knappen.
            // Ellers: meny til venstre av knappen.
            const plassLeft = (r.left < window.innerWidth / 2) ? r.left : Math.max(10, r.right - menyBredde);
            // Hvis knappen er øverst: meny under. Hvis nederst: meny over.
            const plassTop = (r.top < window.innerHeight / 2) ? r.bottom + 8 : r.top - 10;
            meny.style.left = plassLeft + 'px';
            meny.style.top = plassTop + 'px';
            meny.style.right = 'auto';
            if (r.top >= window.innerHeight / 2) {
                meny.style.transform = 'translateY(-100%)';
            } else {
                meny.style.transform = '';
            }
        }

        // Hent lagret posisjon
        try {
            const lagret = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
            if (lagret && typeof lagret.left === 'string' && typeof lagret.top === 'string') {
                knapp.style.left = lagret.left;
                knapp.style.top = lagret.top;
                knapp.style.right = 'auto';
            }
        } catch (_) { /* ignore */ }

        knapp.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;  // kun venstre-klikk
            drar = true;
            harFlyttet = false;
            const r = knapp.getBoundingClientRect();
            offsetX = e.clientX - r.left;
            offsetY = e.clientY - r.top;
            startX = e.clientX;
            startY = e.clientY;
            // Ikke skjul menyen her — vi vet ikke ennå om dette blir en drag eller en klikk.
            // Lukke-på-drag skjer i mousemove når terskelen passeres.
        });

        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (!harFlyttet && dx < 4 && dy < 4) return;  // terskel før vi kaller det drag
            if (!harFlyttet) meny.style.display = 'none';  // skjul meny når drag faktisk starter
            harFlyttet = true;
            // Klamp mot vindu
            const maksX = window.innerWidth - knapp.offsetWidth - 2;
            const maksY = window.innerHeight - knapp.offsetHeight - 2;
            const nyX = Math.max(2, Math.min(maksX, e.clientX - offsetX));
            const nyY = Math.max(2, Math.min(maksY, e.clientY - offsetY));
            knapp.style.left = nyX + 'px';
            knapp.style.top = nyY + 'px';
            knapp.style.right = 'auto';
            knapp.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', () => {
            if (!drar) return;
            drar = false;
            knapp.style.cursor = '';
            if (harFlyttet) {
                try {
                    localStorage.setItem(LS_KEY, JSON.stringify({
                        left: knapp.style.left,
                        top: knapp.style.top
                    }));
                } catch (_) { /* ignore (quota full, privacy mode, osv.) */ }
            }
        });

        // Dobbel-klikk for å resette posisjon (tilbake til øverst høyre)
        // Oppdater meny-posisjon ved vindu-resize (så den ikke blir liggende utenfor)
        window.addEventListener('resize', () => {
            if (meny.style.display === 'block') plassérMeny();
            const r = knapp.getBoundingClientRect();
            if (r.right > window.innerWidth || r.bottom > window.innerHeight) {
                const nyX = Math.max(2, Math.min(window.innerWidth - knapp.offsetWidth - 2, r.left));
                const nyY = Math.max(2, Math.min(window.innerHeight - knapp.offsetHeight - 2, r.top));
                knapp.style.left = nyX + 'px';
                knapp.style.top = nyY + 'px';
                knapp.style.right = 'auto';
            }
        });

        // Toggle meny — bare når klikk landet på klikkFlate (skjold-silhuett)
        klikkFlate.onclick = (e) => {
            e.stopPropagation();
            if (harFlyttet) {
                harFlyttet = false;
                return;
            }
            if (meny.style.display === 'none' || !meny.style.display) {
                plassérMeny();
                meny.style.display = 'block';
            } else {
                meny.style.display = 'none';
            }
        };
        document.addEventListener('click', (e) => {
            if (!meny.contains(e.target) && !knapp.contains(e.target)) meny.style.display = 'none';
        });

        // ── SKJOLDET KAN SKJULES, MENYEN NÅS UANSETT (Thomas 25.08) ────────────────────
        // Skjoldet er verktøykassens ansikt, men det ligger og flyter over NISSY hele dagen.
        // Den som vil ha skjermen ren skal kunne skru det av — uten å miste menyen, som nå
        // også har en knapp i footeren. Default PÅ: ingen mister noe ved en oppgradering.
        const SKJOLD_LS = 'vkt_vis_skjold';
        const skjoldSynlig = () => localStorage.getItem(SKJOLD_LS) !== '0';
        function skjoldVis(paa) {
            localStorage.setItem(SKJOLD_LS, paa ? '1' : '0');
            knapp.style.display = paa ? '' : 'none';
            if (!paa) meny.style.display = 'none';
        }
        if (!skjoldSynlig()) knapp.style.display = 'none';

        // Menyen kan åpnes fra footer-knappen også. Den forankres da NEDENFRA, mot knappen,
        // i stedet for øverst til høyre der skjoldet ligger.
        window.__vkt_meny = {
            toggle(anker) {
                if (meny.style.display === 'block') { meny.style.display = 'none'; return; }
                // Innstillinger-panelet ligger samme sted og er like bredt — lukk det først.
                try { if (window.__basicTools && window.__basicTools.kpLukk) window.__basicTools.kpLukk(); } catch (_) {}
                const r = anker.getBoundingClientRect();
                meny.style.top = 'auto';
                meny.style.right = 'auto';
                meny.style.left = Math.round(r.left) + 'px';
                meny.style.bottom = Math.round(window.innerHeight - r.top + 6) + 'px';
                meny.style.display = 'block';
            },
            skjul() { meny.style.display = 'none'; },
            skjoldVis, skjoldSynlig,
        };

        (document.documentElement || document.body).appendChild(knapp);
        (document.documentElement || document.body).appendChild(meny);
        knappRef = knapp;
    }

    // === Admin-status-visning: ring + bakgrunn + puls ved utlogging ===
    function tegnAdminStatus() {
        if (!knappRef) return;
        // Puls-animasjon — bruker drop-shadow på selve skjold-formen, ikke box-shadow på firkant
        if (!document.getElementById('vkt-style')) {
            const st = document.createElement('style');
            st.id = 'vkt-style';
            st.textContent = `
                @keyframes vkt-pulse {
                    0%, 100% { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 2px #ef4444); }
                    50%      { filter: drop-shadow(0 3px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 5px #ef4444) drop-shadow(0 0 9px rgba(239,68,68,0.6)); }
                }
            `;
            document.head.appendChild(st);
        }

        // Fjern evt. gammel rekDot
        trygtFjern(knappRef.querySelector('.vkt-rekdot'));

        const logoImg = knappRef.querySelector('img');
        // Optimistisk: anta grønt frem til vi har bekreftet feil. 'ukjent' (før første sjekk)
        // teller som ok så skjoldet ikke flasher rødt under oppstart.
        const harFeil = ['utlogget', 'feil'].includes(adminStatus) || ['utlogget', 'feil'].includes(rekStatus);
        const noeUtlogget = adminStatus === 'utlogget' || rekStatus === 'utlogget';

        // Status-glow som følger formen (drop-shadow stacker — base mørk skygge + farget glow)
        knappRef.style.boxShadow = '';
        knappRef.style.animation = '';
        if (logoImg) {
            const glowColor = harFeil ? '#ef4444' : '#10b981';
            const baseShadow = 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))';
            const hoverShadow = 'drop-shadow(0 6px 18px rgba(0,0,0,0.65))';
            const glow = `drop-shadow(0 0 2px ${glowColor}) drop-shadow(0 0 5px ${glowColor})`;
            logoImg.dataset.normalFilter = `${baseShadow} ${glow}`;
            logoImg.dataset.hoverFilter = `${hoverShadow} ${glow}`;
            // Hvis puls aktiv, la animasjonen styre filter — ellers sett statisk
            if (noeUtlogget) {
                logoImg.style.animation = 'vkt-pulse 1.8s ease-in-out infinite';
                logoImg.style.filter = '';
            } else {
                logoImg.style.animation = '';
                logoImg.style.filter = logoImg.dataset.normalFilter;
            }
        }

        // Tooltip — kort beskrivelse av hva som er feil
        const grunnTittel = knappRef.dataset.tittel || knappRef.title.split('\n')[0];
        knappRef.dataset.tittel = grunnTittel;
        const feilLinjer = [];
        if (adminStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Admin: UTLOGGET','feil':'⚠ Admin: ukjent feil','ukjent':'⏳ Admin: sjekkes…'}[adminStatus] || adminStatus
        );
        if (rekStatus !== 'ok') feilLinjer.push(
            {'utlogget':'⚠ Rekvisisjon: UTLOGGET','feil':'⚠ Rekvisisjon: ukjent feil','ukjent':'⏳ Rekvisisjon: sjekkes…'}[rekStatus] || rekStatus
        );
        knappRef.title = feilLinjer.length
            ? `${grunnTittel}\n${feilLinjer.join('\n')}`
            : grunnTittel;

        // Oppdater statusprikker i meny-snarveiene (admin / rekvisisjon)
        const farge = (s) => s === 'ok' ? '#10b981' : (s === 'utlogget' ? '#ef4444' : '#fbbf24');
        document.querySelectorAll('[data-status-for="admin"]').forEach(el => el.style.background = farge(adminStatus));
        document.querySelectorAll('[data-status-for="rek"]').forEach(el => el.style.background = farge(rekStatus));
        // Attest: grønn når attest-agenten er tilkoblet (vkt_attest_klar mottatt + fana lever), ellers grå.
        // ⚠️ IKKE SPØR ET KRYSS-ORIGIN VINDU OM `.closed` (Thomas 26.08: prikken sto grå selv om
        //    agenten meldte seg hvert 3. sekund). Oppslaget lå i en try med tom catch — slo det
        //    feil, ble prikken grå UTEN et pip, og det er umulig å skille fra «ikke tilkoblet».
        //    Vi har et ærligere mål: agenten BANKER hvert 3. sekund. Da måler vi hvor lenge siden
        //    vi hørte fra den, i stedet for å spørre om en egenskap vi kanskje ikke får lese.
        //    Bonus: dette fanger også en fane som henger uten å være lukket — `.closed` ville sagt
        //    at alt er i orden.
        const ATTEST_FERSK_MS = 10000;      // 3 s-heartbeat → 10 s gir rom for et tapt slag
        let attestFarge = '#64748b';
        if (attestSistSett && (Date.now() - attestSistSett) < ATTEST_FERSK_MS) attestFarge = '#10b981';
        else attestTabReady = false;
        document.querySelectorAll('[data-status-for="attest"]').forEach(el => el.style.background = attestFarge);

        // Utlogget-toast fjernet — tilgang/status finnes i menyen (statusprikker + snarveier).
        const eksisterende = document.getElementById('vkt-toast');
        if (eksisterende) trygtFjern(eksisterende);
    }

    // === Turid-polling: sjekker ventende turids hvert 15. sek ===
    function oppdaterBadge(antall) {
        if (!knappRef) return;
        let badge = knappRef.querySelector('.vkt-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'vkt-badge';
            badge.style.cssText = [
                'position:absolute','top:-4px','right:-4px',
                'min-width:18px','height:18px','border-radius:9px',
                'background:#ef4444','color:white','font-size:11px','font-weight:700',
                'display:none','align-items:center','justify-content:center',
                'padding:0 5px','box-shadow:0 2px 6px rgba(0,0,0,0.3)',
                'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
                'line-height:1','pointer-events:none'
            ].join(';');
            knappRef.appendChild(badge);
        }
        if (antall > 0) {
            badge.textContent = antall;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // === Hent turdetaljer fra NISSY admin ===
    // Steg 1: POST searchStatus for å oversette turid → (reqId, db, resId)
    // Steg 2: For hver rekvisisjon, kall ajax_reqdetails og parse
    // Pattern: overvaker_live.js "Søk på turid"-flyten
    async function hentTurDetaljer(turid) {
        try {
            // STEG 1: Søk etter turid
            const searchBody = `submit_action=tripSearch&tripNr=${turid}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            console.log(`[VERKTØYKASSE] searchStatus: tripNr=${turid}`);
            const searchRes = await fetch(
                `${ADMIN_BASE}/searchStatus`,
                { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: searchBody }
            );
            if (!searchRes.ok) return { feil: `searchStatus HTTP ${searchRes.status}`, turid };
            const searchHtml = await searchRes.text();

            // Parse getRequisitionDetails(reqId, db, resId) — alle rekvisisjoner for denne turen
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(searchHtml)) !== null) {
                if (!matches.find(x => x.tripid === m[3])) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
                }
            }

            if (matches.length === 0) {
                console.warn(`[VERKTØYKASSE] ✗ Turid ${turid}: ingen rekvisisjoner funnet`);
                return { feil: 'ingen treff i searchStatus', turid, rekvisisjoner: [] };
            }
            console.log(`[VERKTØYKASSE] Turid ${turid}: ${matches.length} rekvisisjon(er) funnet`);

            // STEG 2: Hent detaljer for hver rekvisisjon
            const rekvisisjoner = [];
            for (const { reqId, db, tripid } of matches) {
                const d = await hentRekvisisjon(reqId, db, tripid, turid);
                if (d) rekvisisjoner.push(d);
            }

            return { turid, hentet: new Date().toISOString(), antall_rekvisisjoner: rekvisisjoner.length, rekvisisjoner };
        } catch (e) {
            console.warn(`[VERKTØYKASSE] hentTurDetaljer ${turid}:`, e.message);
            return { feil: e.message, turid };
        }
    }

    // Variant: hent via REKVISISJONSNUMMER (searchStatus?nr=) i stedet for turid. Fungerer
    // UTEN Reisenr-kolonne — rekvnr ligger i hver rads «searchStatus?nr=…»-onclick. Hver
    // returnert rekvisisjon merkes med .tripid (= resurs-id) så konsumenten kan plukke riktig
    // ben (tur/retur) ut fra rad-id-en (V-<resId>). Samme detalj-parsing som turid-flyten.
    async function hentTurDetaljerViaRekvnr(rekvnr) {
        try {
            // v2.187 (Thomas 21.08): dette var en naken `GET ?nr=` som ALDRI ga treff —
            // den manglet både submit_action og alle feltene NISSY krever. Overvåker Live
            // har hatt riktig form hele tiden (overvaaker_live.js ~L5947), så vi speiler
            // den: submit_action=reqSearch med feltet `requisitionNumber`.
            // (Feltnavnet er fella: `requisitionNr` gir 0 treff, `requisitionNumber` virker.)
            const searchBody = `submit_action=reqSearch&requisitionNumber=${encodeURIComponent(rekvnr)}`
                + `&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            console.log(`[VERKTØYKASSE] searchStatus: reqSearch=${rekvnr}`);
            const searchRes = await fetch(`${ADMIN_BASE}/searchStatus`, {
                method: 'POST', credentials: 'same-origin',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: searchBody
            });
            if (!searchRes.ok) return { feil: `searchStatus HTTP ${searchRes.status}`, rekvnr };
            const searchHtml = await searchRes.text();
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
            const matches = [];
            let m;
            while ((m = idRegex.exec(searchHtml)) !== null) {
                if (!matches.find(x => x.tripid === m[3])) matches.push({ reqId: m[1], db: m[2], tripid: m[3] });
            }
            if (matches.length === 0) return { feil: 'ingen treff i searchStatus', rekvnr, rekvisisjoner: [] };
            const rekvisisjoner = [];
            for (const { reqId, db, tripid } of matches) {
                const d = await hentRekvisisjon(reqId, db, tripid, '');
                if (d) { d.tripid = tripid; rekvisisjoner.push(d); }
            }
            return { rekvnr, hentet: new Date().toISOString(), antall_rekvisisjoner: rekvisisjoner.length, rekvisisjoner };
        } catch (e) {
            console.warn(`[VERKTØYKASSE] hentTurDetaljerViaRekvnr ${rekvnr}:`, e.message);
            return { feil: e.message, rekvnr };
        }
    }

    async function hentRekvisisjon(reqId, db, tripid, turid) {
        const url = `${ADMIN_BASE}/ajax_reqdetails?id=${reqId}&db=${db}&tripid=${tripid}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=${turid}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const html = await res.text();
        if (html.length < 500) return null;

        const data = { reqId: +reqId, db: +db, tripid: +tripid };

        // === SUTI-hendelser (v2.167, Thomas 21.08) ===
        // searchStatus' Status-kolonne er grov. De EKTE hendelsene med klokkeslett ligger
        // i SUTI-tabellen — og vi henter den allerede, siden kallet over har
        // showSutiXml=true&full=true. Ingen ekstra runde til admin; vi kastet den bare før.
        // Kodene er Overvåker Lives fasit (overvaaker_live.js ~L3238):
        //   1709 = bil fremme, venter på pasient   1701 = passasjer hentet
        //   1702 = passasjer levert                1703 = bomtur (nullstiller alt)
        try {
            const sutiIdx = html.indexOf('Suti kode');
            if (sutiIdx > -1) {
                let omr = html.substring(sutiIdx);
                // Alt etter <hr> er GAMLE ressurser — hører til en tidligere bil.
                const hr = omr.indexOf('<hr');
                if (hr > -1) omr = omr.substring(0, hr);
                const rader = [];
                const radRe = /<tr[^>]*>\s*([\s\S]*?)<\/tr>/gi;
                let m;
                while ((m = radRe.exec(omr)) !== null) {
                    const rad = m[1];
                    const t = rad.match(/<nobr>(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})<\/nobr>/);
                    if (!t) continue;
                    rader.push({
                        rad,
                        ms: new Date(+t[3], +t[2] - 1, +t[1], +t[4], +t[5], +t[6]).getTime(),
                        kl: `${t[4]}:${t[5]}`
                    });
                }
                rader.sort((a, b) => a.ms - b.ms);
                const suti = { bilFremme: '', hentet: '', levert: '', bomtur: false };
                for (const { rad, kl } of rader) {
                    // Bomtur nullstiller: bilen kom aldri, og en ny bil starter på nytt.
                    if (/>\s*1703\b/.test(rad) || /Bomtur/.test(rad)) {
                        suti.bomtur = true; suti.bilFremme = ''; suti.hentet = ''; suti.levert = '';
                        continue;
                    }
                    // Kun BEKREFTEDE hendelser teller — samme vakt som Live har.
                    if (!/Bekreftet/.test(rad)) continue;
                    if (/>\s*1709\b/.test(rad)) { suti.bilFremme = kl; suti.bomtur = false; }
                    if (/>\s*1701\b/.test(rad)) { suti.hentet = kl; suti.bomtur = false; }
                    if (/>\s*1702\b/.test(rad)) { suti.levert = kl; }
                }
                if (suti.bilFremme || suti.hentet || suti.levert || suti.bomtur) data.suti = suti;
            }
        } catch (_) { /* SUTI er tilleggsinfo — oppslaget skal virke uten */ }

        const henteIdx = html.indexOf('Hentested');
        const leverIdx = html.indexOf('Leveringssted');

        // Pasient (før Hentested)
        if (henteIdx > -1) {
            const pas = html.substring(0, henteIdx);
            const navnM = pas.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const addrMatches = [...pas.matchAll(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const postMatches = [...pas.matchAll(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/gi)];
            const sisteAddr = addrMatches.length ? addrMatches[addrMatches.length-1][1].trim().replace(/[HU]\d{4}/g,'').replace(/\s+/g,' ').trim() : '';
            const sistePost = postMatches.length ? postMatches[postMatches.length-1][1].trim() : '';
            data.pasient_navn = navnM ? navnM[1].replace(/\s+/g, ' ').trim() : '';
            data.pasient_adresse = (sisteAddr + (sistePost ? ', ' + sistePost : '')).replace(/\s+/g, ' ').trim();
            const pnrM = pas.match(/Personnr[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i) || pas.match(/F[\.\s]*dato[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.pasient_pnr = pnrM ? pnrM[1].replace(/\s+/g, ' ').trim() : '';
        }

        // Hentested
        if (henteIdx > -1) {
            const slutt = leverIdx > henteIdx ? leverIdx : html.indexOf('</fieldset>', henteIdx);
            const hb = html.substring(henteIdx, slutt > henteIdx ? slutt : undefined);
            const navnM = hb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = hb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = hb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.fra_navn = navnM ? navnM[1].trim() : '';
            data.fra_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Leveringssted
        if (leverIdx > -1) {
            const slutt = html.indexOf('</fieldset>', leverIdx);
            const lb = html.substring(leverIdx, slutt > leverIdx ? slutt : undefined);
            const navnM = lb.match(/Navn:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const adrM  = lb.match(/Adresse:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            const postM = lb.match(/Postnr\s*\/?\s*Sted:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
            data.til_navn = navnM ? navnM[1].trim() : '';
            data.til_adresse = (adrM ? adrM[1].trim() : '') + (postM ? ', ' + postM[1].trim() : '');
        }

        // Rekvisisjonsnummer (12 sifre)
        const rekM = html.match(/Rekvisisjon[^<]*<\/td>\s*<td[^>]*>\s*<b>\s*(\d{12})/i) || html.match(/>(\d{12})<\/b>/);
        data.rek_nr = rekM ? rekM[1] : null;

        // Retning
        const retnM = html.match(/Til \/ Fra behandling:<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is);
        data.retning = retnM ? retnM[1].trim() : null;

        // v2.131: Tider fra Reise-blokka — «Pasient klar fra» = hentetid-fasit, «Oppmøtetidspunkt»
        // = oppmøte. Radkolonnene i planleggeren varierer (P-rader manglet tid → «retning ukjent»
        // i basic_tools, Thomas 03.07) — admin-plakaten er fasit.
        const klarM = html.match(/Pasient klar fra:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        data.klar_fra = klarM ? klarM[1].trim() : null;
        const oppmM = html.match(/Oppm[^<:]{0,4}tetidspunkt:<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        data.oppmote_tid = oppmM ? oppmM[1].trim() : null;

        // Rekvirent
        const rekvM = html.match(/Rekvirent[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
        data.rekvirent = rekvM ? rekvM[1].trim() : '';

        // ATTEST-deteksjon (autoritativ, server-side): NISSY skriver «Har gyldig attest» ved
        // pasientnavnet på detaljsiden, og en ren attest har INGEN tur (ingen Hentested/
        // Leveringssted → «Ingen rekvisisjoner funnet»). En ekte tur har alltid hente-/leveringssted.
        data.har_gyldig_attest = /gyldig\s+attest/i.test(html);
        data.har_tur = (henteIdx > -1) || (leverIdx > -1);

        // Geo: sutiXml-IDer i HTML gir lat/long når de slåes opp separat
        const xmlIds = [...new Set([...html.matchAll(/sutiXml\?id=(\d+)/g)].map(m => m[1]))];
        data.geo_punkter = [];
        for (const xmlId of xmlIds.slice(0, 6)) {  // cap for å unngå mange kall
            try {
                const r = await fetch(`${ADMIN_BASE}/sutiXml?id=${xmlId}`);
                const xt = await r.text();
                const latM  = xt.match(/lat="([\d.]+)"/);
                const longM = xt.match(/long="([\d.]+)"/);
                if (latM && longM) {
                    data.geo_punkter.push({ xmlId, lat: +latM[1], long: +longM[1] });
                }
            } catch(e) {}
        }

        return data;
    }

    // === BEHANDLINGSSTED — adminTCDetails (v2.139, Thomas' idé 06.08) ===
    // Kortet kan bære NISSYs behandlingssted-id (oid fra adminTCDetails?id=…). Da slår
    // toasten opp stedet direkte i NISSY og viser fasit-adresse, telefon, sektor og
    // underenheter (fastleger/avdelinger) — i stedet for det operatøren måtte huske selv.
    // Oid er en stabil nøkkel; navnematching mot «Skårer Legesenter» ville vært skjørt.
    // Siden er UTF-8 (ikke iso-8859-1 som dispatch.jsp) → r.text() holder.
    const _bhsCache = new Map();
    // v2.143: settes når admin-sesjonen har falt. Uten dette maler høsteren seg
    // gjennom tusenvis av id-er med tomme svar og «lagrer» ingenting — akkurat det
    // som skjedde 06.08 da kjøringen stanset på 5753 uten forklaring.
    let _bhsUtlogget = false;
    async function hentBehandlingssted(oid) {
        const id = String(oid || '').replace(/\D/g, '');
        if (!id) return null;
        if (_bhsCache.has(id)) return _bhsCache.get(id);
        let ut = null;
        try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 10000);
            let html;
            try {
                const r = await fetch(`${ADMIN_BASE}/adminTCDetails?id=${id}`, { credentials: 'same-origin', signal: ctrl.signal });
                html = r.ok ? await r.text() : null;
            } finally { clearTimeout(timer); }
            if (html) {
                // Alle innloggede admin-sider har «Logg ut»-lenken i headeren. Mangler den,
                // er vi kastet ut — da nytter det ikke å fortsette.
                if (html.indexOf('/admin/logout') === -1) _bhsUtlogget = true;
                const doc = new DOMParser().parseFromString(html, 'text/html');
                // Fieldsettene identifiseres på legend-teksten, ikke rekkefølge — NISSY
                // utelater «Overordnet nivå» på rot-noder, så indeksering ville forskjøvet seg.
                let hoved = null, over = null, under = null;
                const alle = doc.querySelectorAll('fieldset');
                for (let i = 0; i < alle.length; i++) {
                    const lg = ((alle[i].querySelector('legend') || {}).textContent || '').trim().toLowerCase();
                    if (lg.indexOf('behandlingssted') === 0) hoved = alle[i];
                    else if (lg.indexOf('overordnet') === 0) over = alle[i];
                    else if (lg.indexOf('underenhet') === 0) under = alle[i];
                }
                // «Navn:» → «navn». Feltnavn-cellen bærer kolon og vilkårlig whitespace.
                const lesFelt = rot => {
                    const ut2 = {};
                    if (!rot) return ut2;
                    const rader = rot.querySelectorAll('tr');
                    for (let i = 0; i < rader.length; i++) {
                        const c = rader[i].cells;
                        if (!c || c.length < 2) continue;
                        const n = (c[0].textContent || '').replace(/\s+/g, ' ').replace(/:\s*$/, '').trim().toLowerCase();
                        const v = (c[1].textContent || '').replace(/\s+/g, ' ').trim();
                        if (n && !(n in ut2)) ut2[n] = v;
                    }
                    return ut2;
                };
                const f = lesFelt(hoved);
                const underenheter = [];
                if (under) {
                    const rader = under.querySelectorAll('tr');
                    for (let i = 0; i < rader.length; i++) {
                        const lenke = rader[i].querySelector('a[href*="adminTCDetails"]');
                        if (!lenke) continue;  // hopper over headerraden
                        const c = rader[i].cells || [];
                        const idM = (lenke.getAttribute('href') || '').match(/id=(\d+)/);
                        underenheter.push({
                            id: idM ? idM[1] : null,
                            navn: (lenke.textContent || '').replace(/\s+/g, ' ').trim(),
                            type: c[2] ? (c[2].textContent || '').replace(/\s+/g, ' ').trim() : '',
                            adresse: c[4] ? (c[4].textContent || '').replace(/\s+/g, ' ').trim() : ''
                        });
                    }
                }
                let foreldre = null;
                if (over) {
                    const l = over.querySelector('a[href*="adminTCDetails"]');
                    if (l) {
                        const idM = (l.getAttribute('href') || '').match(/id=(\d+)/);
                        foreldre = { id: idM ? idM[1] : null, navn: (l.textContent || '').replace(/\s+/g, ' ').trim() };
                    }
                }
                if (ER_DEV && !window.__vkt_bhsEtiketterLogget) {
                    window.__vkt_bhsEtiketterLogget = true;
                    console.log('[VERKTØYKASSE] behandlingssted-detalj, etiketter:',
                        Object.keys(f).join(' | '));
                }
                if (f['navn']) {
                    ut = {
                        id: id,
                        navn: f['navn'],
                        type: f['type'] || '',
                        sektor: f['sektor'] || '',
                        e_rekvirering: f['e.rekvirering'] || '',
                        her_id: f['her id'] || '',
                        // NISSY har egne kortformer operatørene bruker muntlig
                        // («sab» = Bærum Sykehus). De gjør navnesøket langt bedre.
                        kortnavn: f['kortnavn'] || '',
                        alias: f['alias'] || '',
                        orgnr: f['organisasjonsnummer'] || '',
                        adresse: f['adresse'] || '',
                        postnr_sted: f['postnr/sted'] || '',
                        telefon: f['telefon'] || '',
                        kommentar: f['kommentar'] || '',
                        posisjon: f['posisjon x/y'] || '',   // UTM nord/øst — NISSYs egen fasit
                        // ⚠️ KOMMUNE ER NISSYs EGEN, ikke utledet av postnummeret. Poststedet kan
                        //    hete noe annet enn kommunen (1463 Fjellhamar ligger i Lørenskog), og
                        //    et postnummer kan krysse kommunegrensen — som er nettopp
                        //    grensetilfellene primærhelse-regelen handler om.
                        //    Feltene er sett i SØKETREFFET; står de ikke på detaljsiden, blir de
                        //    tomme her og loggen under sier hvilke etiketter som faktisk finnes.
                        kommune: f['kommune'] || '',
                        profesjon: f['profesjon'] || '',
                        foreldre: foreldre,
                        underenheter: underenheter
                    };
                }
            }
        } catch (e) {
            if (ER_DEV) console.warn('[VERKTØYKASSE] hentBehandlingssted(' + id + '):', e.message);
        }
        _bhsCache.set(id, ut);
        return ut;
    }

    // === HØSTING AV BEHANDLINGSSTED-REGISTERET (v2.140, dev-verktøy) ===
    // Kjøres manuelt fra konsollen:  __verktoykasseDev.host()
    // Vi trenger IKKE søkesiden: hver adminTCDetails-side peker både oppover
    // («Overordnet nivå») og nedover («Underenheter»), så en bredde-først-vandring
    // fra et vilkårlig utgangspunkt dekker hele treet det tilhører. Frøene under er
    // de to store greinene. Resultatet POSTes til behandlingssted_lagre.php — OUS'
    // egne data uten personopplysninger, derfor greit å lagre server-side.
    // v2.143: hele det nasjonale treet henger under ÉN rot (id 1, «Rotnivå», med de fem
    // RHF-ene under). Første kjøring sådde vi midt i treet og lot vandringen finne roten
    // selv; nå starter vi der den er. Raskere og garantert komplett.
    const HOST_FROE = [1];
    // host()            — vandrer treet fra roten. Oppdager NYE noder, men når bare
    //                     22 309 av 74 720: ni foreldre har 500+ barn, og NISSY bygger
    //                     ikke barnelista da. Alt bak den veggen er usynlig fra roten.
    // host('alle')      — henter id-lista fra vårt eget register og går gjennom HVER
    //                     node direkte. Komplett, men tar ~20–25 min. Vandringen er
    //                     fortsatt med, så nye noder oppdages underveis.
    // host('mangler')   — bare de som ikke er oppdatert i dag. Til å ta resten etter
    //                     en vanlig sveip.
    async function hostBehandlingssteder(froe) {
        let startKo = null;
        if (froe === 'alle' || froe === 'mangler') {
            const url = 'https://thomaswestby.no/skript/behandlingssted.php?ider=1'
                      + (froe === 'mangler' ? '&eldre_enn=' + new Date().toISOString().slice(0, 10) : '');
            console.log('[VERKTØYKASSE] høsting: henter id-liste fra registeret …');
            try {
                const d = await fetch(url).then(x => x.json());
                if (!d || !d.ok || !Array.isArray(d.ider) || !d.ider.length) {
                    console.warn('[VERKTØYKASSE] høsting: fikk ingen id-liste — avbryter'); return null;
                }
                startKo = d.ider;
                console.log('[VERKTØYKASSE] høsting: ' + d.antall + ' id-er i kø (' + froe + ')');
            } catch (e) {
                console.warn('[VERKTØYKASSE] høsting: klarte ikke hente id-liste —', e.message); return null;
            }
        }
        const ko = (startKo || (froe && froe.length ? froe : HOST_FROE)).map(n => String(n));
        const sett = new Set(ko);
        const samlet = [];
        let sendt = 0, feilet = 0;
        const send = async (ferdig) => {
            if (!samlet.length || (samlet.length < 100 && !ferdig)) return;
            const bunt = samlet.splice(0, samlet.length);
            try {
                const r = await fetch('https://thomaswestby.no/skript/behandlingssted_lagre.php', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    // v2.142: MÅ være jsonStringifyTrygt. Prototype/rico definerer
                    // Array.prototype.toJSON, og rå JSON.stringify gjør da arrayet om til en
                    // STRENG → PHP ser ingen liste → «tom steder-liste» → 0 lagret, stille.
                    // Samme felle som søkeloggen og beregnReisetid.
                    body: jsonStringifyTrygt({ steder: bunt, av: window.__vkt_brukernavn || '' })
                }).then(x => x.json());
                if (!r || typeof r.lagret !== 'number') {
                    // Ikke la en avvisning fra serveren se ut som «0 lagret».
                    console.warn('[VERKTØYKASSE] høsting: serveren avviste bunten —', JSON.stringify(r));
                    return;
                }
                sendt += r.lagret;
                console.log('[VERKTØYKASSE] høsting: ' + sendt + ' lagret · ' + ko.length + ' i kø · ' + sett.size + ' funnet');
            } catch (e) { console.warn('[VERKTØYKASSE] høsting: sending feilet —', e.message); }
        };
        console.log('[VERKTØYKASSE] høsting startet fra ' + ko.join(', ') + ' — sett __vkt_hostStopp = true for å avbryte');
        window.__vkt_hostStopp = false;
        _bhsUtlogget = false;
        while (ko.length) {
            if (window.__vkt_hostStopp) { console.log('[VERKTØYKASSE] høsting avbrutt av bruker'); break; }
            if (_bhsUtlogget) {
                console.warn('[VERKTØYKASSE] høsting STOPPET: admin-sesjonen har falt. Logg inn i admin og kjør host() på nytt — det som alt er lagret beholdes.');
                break;
            }
            // Tre om gangen: raskt nok, uten å hamre NISSY-admin.
            const gruppe = ko.splice(0, 3);
            const svar = await Promise.all(gruppe.map(id => hentBehandlingssted(id)));
            for (let i = 0; i < svar.length; i++) {
                const b = svar[i];
                if (!b) { feilet++; continue; }
                samlet.push({
                    id: b.id, navn: b.navn, type: b.type, sektor: b.sektor,
                    adresse: b.adresse, postnr_sted: b.postnr_sted, telefon: b.telefon,
                    orgnr: b.orgnr, her_id: b.her_id, posisjon: b.posisjon,
                    kortnavn: b.kortnavn, alias: b.alias,
                    // Parseren har lest disse hele tiden, men tre-vandringen sendte dem
                    // aldri videre — så kolonnene sto tomme etter en full sveip
                    // (Thomas 01.09). e_rekvirering er NISSYs eget synlighetsfilter.
                    e_rekvirering: b.e_rekvirering, kommune: b.kommune, profesjon: b.profesjon,
                    parent_id: b.foreldre ? b.foreldre.id : null
                });
                // Både opp og ned — slik finner vi roten selv om vi starter midt i treet.
                if (b.foreldre && b.foreldre.id && !sett.has(b.foreldre.id)) { sett.add(b.foreldre.id); ko.push(b.foreldre.id); }
                for (let j = 0; j < (b.underenheter || []).length; j++) {
                    const u = b.underenheter[j];
                    if (u.id && !sett.has(u.id)) { sett.add(u.id); ko.push(u.id); }
                }
            }
            await send(false);
        }
        await send(true);
        console.log('[VERKTØYKASSE] høsting FERDIG: ' + sendt + ' steder lagret · ' + feilet + ' feilet · ' + sett.size + ' id-er besøkt');
        return { lagret: sendt, feilet: feilet, besokt: sett.size };
    }

    // === SØK BEHANDLINGSSTED I NISSY PÅ FORESPØRSEL (v2.154) ===
    // Bredde-først-vandringen bommer på steder hvis forelderen har mange nok barn:
    // NISSYs egen kode bygger ikke barnelista når childrenCount >= 500
    // (`organization.childrenCount < 500` i adminTCForm). Da står forelderen der uten
    // synlige barn, vandringen ser ingenting galt, og stedet blir usynlig for oss —
    // uten et eneste brudd i treet. Grue Sykehjem (15463) og Grue Helsestasjon (23383)
    // er to slike (Thomas 13.08).
    //
    // Søkesiden har ikke den begrensningen. Den POSTer til seg selv; regionId er en
    // RADIO med Helse Øst som standard, så et nasjonalt søk må gå gjennom alle fem.
    const TC_SOK_URL = ADMIN_BASE + '/adminTCForm?searchType=admin';
    async function sokBehandlingsstedINissy(q) {
        const treff = new Map();
        for (let region = 1; region <= 5; region++) {
            const felt = new URLSearchParams({
                previousSearch: '', onlySelectable: 'false', advancedSearch: 'false',
                altReq: 'false', reqTemp: 'false', idx: '',
                regionId: String(region), name: q,
                sector: '-1', profession: '-1', dispatchCenter: '-1',
                councilNr: '', councilName: '', address: '', postalPlace: '',
                eRek: '0', submit_action: '', submit: 'Søk'
            });
            let html;
            try {
                const r = await fetch(TC_SOK_URL, {
                    method: 'POST', credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: felt.toString()
                });
                if (!r.ok) continue;
                html = await r.text();
            } catch (e) { continue; }
            if (html.indexOf('/admin/logout') === -1) return { utlogget: true, steder: [] };

            const doc = new DOMParser().parseFromString(html, 'text/html');
            const lenker = doc.querySelectorAll('a[href*="adminTCDetails"][name="tcdata"]');
            for (let i = 0; i < lenker.length; i++) {
                const m = /[?&]id=(\d+)/.exec(lenker[i].getAttribute('href') || '');
                if (!m) continue;
                const rad = lenker[i].closest('tr');
                const c = rad ? rad.cells : null;
                // Kolonner: Navn, E.rek., Type, Sektor, Profesjon, Adresse, Poststed, Kommune
                const tekst = j => (c && c[j] ? (c[j].textContent || '').replace(/\s+/g, ' ').trim() : '');
                if (!treff.has(m[1])) treff.set(m[1], {
                    id: m[1],
                    navn: (lenker[i].parentNode.textContent || '').replace(/\s+/g, ' ').trim(),
                    type: tekst(2), sektor: tekst(3), profesjon: tekst(4),
                    adresse: tekst(5), postnr_sted: tekst(6), kommune: tekst(7)
                });
            }
        }
        return { utlogget: false, steder: [...treff.values()] };
    }

    // === REPARASJON AV REGISTERET (v2.158) ===
    // Bredde-først-vandringen er ikke komplett. NISSY bygger ikke barnelista når en
    // forelder har >= 500 barn, og underenheter-tabellen er kappet på samme vis: under
    // «privat» (#11574) har vi 1851 barn, men nesten ingen med id under 20000. Martina
    // Hansens Hospital (#11580) mangler, og 25 av 31 id-er rundt den likeså (målt 14.08).
    //
    // NISSYs egen kode viser veien ut — `diggDown()` på søkesiden gjør:
    //     $('#name').val('parent:' + id); $('#submit').click();
    // Søket er ikke underlagt 500-grensen, så det kan enumerere de store greinene.
    //
    // REGION er den store usikkerheten: feltet er en radio med Helse Øst som standard.
    // Om `parent:`-søket bryr seg om den, vet vi ikke — derfor testParentSok() først.
    async function sokParentINissy(parentId, regioner) {
        const treff = new Map();
        for (const region of (regioner && regioner.length ? regioner : [1, 2, 3, 4, 5])) {
            const felt = new URLSearchParams({
                previousSearch: '', onlySelectable: 'false', advancedSearch: 'false',
                altReq: 'false', reqTemp: 'false', idx: '',
                regionId: String(region), name: 'parent:' + parentId,
                sector: '-1', profession: '-1', dispatchCenter: '-1',
                councilNr: '', councilName: '', address: '', postalPlace: '',
                eRek: '0', submit_action: '', submit: 'Søk'
            });
            let html;
            try {
                const r = await fetch(TC_SOK_URL, {
                    method: 'POST', credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: felt.toString()
                });
                if (!r.ok) {
                    // Vi er same-origin, så feilkroppen kan leses. NISSY legger ofte
                    // stacktrace eller en melding i 500-siden — den forteller om
                    // «parent:» er ukjent syntaks eller om noe annet er galt.
                    let utdrag = '';
                    try {
                        const t = await r.text();
                        const doc = new DOMParser().parseFromString(t, 'text/html');
                        utdrag = (doc.body ? doc.body.textContent : t).replace(/\s+/g, ' ').trim().slice(0, 400);
                    } catch (e) {}
                    console.warn('[REPARASJON] region ' + region + ' ga HTTP ' + r.status + ': ' + (utdrag || '(tom kropp)'));
                    continue;
                }
                html = await r.text();
            } catch (e) { continue; }
            if (html.indexOf('/admin/logout') === -1) return { utlogget: true, ider: [] };
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('a[href*="adminTCDetails"][name="tcdata"]').forEach(a => {
                const m = /[?&]id=(\d+)/.exec(a.getAttribute('href') || '');
                if (m) treff.set(m[1], true);
            });
        }
        return { utlogget: false, ider: [...treff.keys()] };
    }

    // Kjør denne FØRST. Svarer på om region spiller noen rolle, og om `parent:`-søket
    // finner mer enn vi har. __verktoykasseDev.testParentSok(11574)
    async function testParentSok(parentId) {
        const id = parentId || 11574;
        // Kontroll: virker et VANLIG navnesøk med nøyaktig samme feltsett? Gjør det det,
        // er ikke skjemaet feil — da er det «parent:»-syntaksen NISSY ikke tåler.
        const kontroll = await sokBehandlingsstedINissy('martina hansens');
        console.log('[REPARASJON] kontroll — vanlig navnesøk «martina hansens»: '
                    + (kontroll.utlogget ? 'UTLOGGET' : kontroll.steder.length + ' treff')
                    + (kontroll.steder && kontroll.steder.length
                        ? ' (' + kontroll.steder.map(s => '#' + s.id + ' ' + s.navn).slice(0, 3).join(', ') + ')' : ''));
        console.log('[REPARASJON] tester parent:' + id + ' region for region …');
        const perRegion = {};
        for (const r of [1, 2, 3, 4, 5]) {
            const s = await sokParentINissy(id, [r]);
            if (s.utlogget) { console.warn('[REPARASJON] ikke logget inn i admin'); return; }
            perRegion[r] = s.ider.length;
            console.log('   region ' + r + ': ' + s.ider.length + ' barn');
        }
        const alle = await sokParentINissy(id, [1, 2, 3, 4, 5]);
        const vaart = await fetch(STRUKTUR_URL).then(r => r.json());
        const mine = new Set((vaart.barn && vaart.barn[String(id)]) || []);
        const mangler = alle.ider.filter(x => !mine.has(+x));
        console.log('[REPARASJON] alle regioner samlet: ' + alle.ider.length + ' barn');
        console.log('[REPARASJON] vi har: ' + mine.size + ' · MANGLER: ' + mangler.length);
        if (mangler.length) console.log('[REPARASJON] første som mangler:', mangler.slice(0, 15).join(', '));
        return { per_region: perRegion, nissy: alle.ider.length, vaart: mine.size, mangler: mangler.length };
    }

    const STRUKTUR_URL = 'https://thomaswestby.no/skript/behandlingssted.php?struktur=1';

    // === ID-FEIING (v2.160) ===
    // `parent:`-søket er dødt — NISSY svarer 500 i alle regioner (testet 14.08), så
    // diggDown() er en levning. Navnesøket virker og ser #11580, men det finnes ingen
    // spørring som lister ALT, så det kan ikke brukes til å enumerere.
    //
    // Da gjenstår den veien som ikke er avhengig av at noen søkefunksjon oppfører seg:
    // gå gjennom id-rommet og hent det vi ikke har. adminTCDetails?id=N svarer enten med
    // et sted eller med ingenting, og det er hele kontrakten. Registeret har 30 150 av
    // id-ene opp til ~84 700, så det er rundt 54 500 å prøve.
    //
    // Kan avbrytes (__vkt_feieStopp = true) og gjenopptas — den henter strukturen på nytt
    // hver gang og hopper over det som alt er lagret.
    //   __verktoykasseDev.fyllHull()                    — hele id-rommet
    //   __verktoykasseDev.fyllHull({fra:1, til:20000})  — i biter
    async function fyllHull(opts) {
        opts = opts || {};
        const struktur = await fetch(STRUKTUR_URL).then(r => r.json()).catch(() => null);
        if (!struktur || !struktur.ok) { console.warn('[FEIING] fikk ikke strukturen'); return; }
        const kjent = new Set(struktur.ider);
        const maks = Math.max(...struktur.ider);
        const fra = opts.fra || 1;
        const til = opts.til || (maks + 2000);   // litt over toppen, for nye steder

        const koe = [];
        for (let i = fra; i <= til; i++) if (!kjent.has(i)) koe.push(i);
        console.log('[FEIING] ' + koe.length + ' id-er å prøve (' + fra + '–' + til + ') · '
                    + kjent.size + ' kjent fra før · sett __vkt_feieStopp = true for å avbryte');
        window.__vkt_feieStopp = false;
        _bhsUtlogget = false;

        const t0 = Date.now();
        let funnet = 0, lagret = 0, proevd = 0;
        let bunt = [];
        const send = async (ferdig) => {
            if (!bunt.length || (bunt.length < 100 && !ferdig)) return;
            const pakke = bunt.splice(0, bunt.length);
            try {
                const r = await fetch('https://thomaswestby.no/skript/behandlingssted_lagre.php', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: jsonStringifyTrygt({ steder: pakke, av: window.__vkt_brukernavn || '' })
                }).then(x => x.json());
                if (r && typeof r.lagret === 'number') lagret += r.lagret;
                else console.warn('[FEIING] serveren avviste bunten —', JSON.stringify(r));
            } catch (e) { console.warn('[FEIING] sending feilet —', e.message); }
        };

        for (let i = 0; i < koe.length; i += 3) {
            if (window.__vkt_feieStopp) { console.log('[FEIING] avbrutt av bruker'); break; }
            if (_bhsUtlogget) {
                console.warn('[FEIING] STOPPET: admin-sesjonen har falt. Logg inn og kjør igjen — '
                             + 'det som er lagret beholdes, og feiingen hopper over det.');
                break;
            }
            const svar = await Promise.all(koe.slice(i, i + 3).map(id => hentBehandlingssted(id)));
            proevd += svar.length;
            for (const b of svar) {
                if (!b || !b.navn) continue;            // id-en finnes ikke — helt normalt
                funnet++;
                bunt.push({
                    id: b.id, navn: b.navn, type: b.type, sektor: b.sektor,
                    adresse: b.adresse, postnr_sted: b.postnr_sted, telefon: b.telefon,
                    orgnr: b.orgnr, her_id: b.her_id, posisjon: b.posisjon,
                    kortnavn: b.kortnavn, alias: b.alias,
                    parent_id: b.foreldre ? b.foreldre.id : null
                });
            }
            await send(false);
            if (proevd % 900 === 0) {
                const gaatt = (Date.now() - t0) / 1000;
                const igjen = Math.round((koe.length - proevd) * (gaatt / proevd) / 60);
                console.log('[FEIING] ' + proevd + '/' + koe.length + ' prøvd · ' + funnet
                            + ' funnet · ' + lagret + ' lagret · ~' + igjen + ' min igjen');
            }
        }
        await send(true);
        console.log('[FEIING] FERDIG: ' + proevd + ' id-er prøvd · ' + funnet + ' steder funnet · '
                    + lagret + ' lagret · ' + Math.round((Date.now() - t0) / 60000) + ' min');
        return { proevd: proevd, funnet: funnet, lagret: lagret };
    }

    // Full reparasjon: gå gjennom alle foreldre vi kjenner, spør NISSY hva som EGENTLIG
    // ligger under dem, og hent det vi mangler. Nye foreldre som dukker opp legges i køen,
    // så grener vi aldri har sett kommer med.
    //   __verktoykasseDev.reparer()               — alle regioner (tryggest, tregest)
    //   __verktoykasseDev.reparer({regioner:[1]}) — bare Helse Øst, hvis testen viser at det holder
    async function reparerRegisteret(opts) {
        opts = opts || {};
        const regioner = opts.regioner || [1, 2, 3, 4, 5];
        const struktur = await fetch(STRUKTUR_URL).then(r => r.json());
        if (!struktur || !struktur.ok) { console.warn('[REPARASJON] fikk ikke strukturen'); return; }
        const kjent = new Set(struktur.ider);
        const foreldre = Object.keys(struktur.barn).map(Number);
        // Rota er ikke barn av noen, men må også sjekkes.
        if (!foreldre.includes(1)) foreldre.unshift(1);

        console.log('[REPARASJON] ' + foreldre.length + ' foreldre å sjekke · ' + kjent.size + ' steder kjent'
                    + ' · regioner ' + regioner.join(','));
        window.__vkt_reparerStopp = false;
        _bhsUtlogget = false;

        const nye = [];
        let sjekket = 0, funnet = 0;
        for (const p of foreldre) {
            if (window.__vkt_reparerStopp) { console.log('[REPARASJON] avbrutt'); break; }
            if (_bhsUtlogget) { console.warn('[REPARASJON] STOPPET: admin-sesjonen har falt'); break; }
            const s = await sokParentINissy(p, regioner);
            if (s.utlogget) { console.warn('[REPARASJON] STOPPET: ikke logget inn'); break; }
            sjekket++;
            for (const id of s.ider) if (!kjent.has(+id)) { kjent.add(+id); nye.push(id); funnet++; }
            if (sjekket % 100 === 0) console.log('[REPARASJON] ' + sjekket + '/' + foreldre.length
                                                 + ' foreldre · ' + funnet + ' nye funnet');
        }
        console.log('[REPARASJON] søk ferdig: ' + funnet + ' steder NISSY har som vi ikke hadde');
        if (!nye.length) return { nye: 0 };

        // Hent detaljene og lagre, i samme bunter som den vanlige høstingen.
        let lagret = 0;
        for (let i = 0; i < nye.length; i += 3) {
            if (window.__vkt_reparerStopp || _bhsUtlogget) break;
            const bunt = await Promise.all(nye.slice(i, i + 3).map(id => hentBehandlingssted(id)));
            const rader = [];
            for (const b of bunt) {
                if (!b) continue;
                rader.push({
                    id: b.id, navn: b.navn, type: b.type, sektor: b.sektor,
                    adresse: b.adresse, postnr_sted: b.postnr_sted, telefon: b.telefon,
                    orgnr: b.orgnr, her_id: b.her_id, posisjon: b.posisjon,
                    kortnavn: b.kortnavn, alias: b.alias,
                    parent_id: b.foreldre ? b.foreldre.id : null
                });
            }
            if (rader.length) {
                const r = await fetch('https://thomaswestby.no/skript/behandlingssted_lagre.php', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: jsonStringifyTrygt({ steder: rader, av: window.__vkt_brukernavn || '' })
                }).then(x => x.json()).catch(() => null);
                if (r && typeof r.lagret === 'number') lagret += r.lagret;
            }
            if (i % 60 === 0) console.log('[REPARASJON] hentet ' + Math.min(i + 3, nye.length) + '/' + nye.length);
        }
        console.log('[REPARASJON] FERDIG: ' + lagret + ' nye steder lagret');
        return { nye: nye.length, lagret: lagret };
    }

    // Treffene hentes i full detalj og skrives inn i registeret vårt. Poenget er at
    // hullet tettes av den som faktisk trengte stedet — ikke ved neste fulle høsting,
    // som tar seks minutter man ikke har midt i et anrop.
    // nissyId satt = «høst nå» på ett kjent sted: da hopper vi over søket. Cachen tømmes
    // først, ellers ville en manuell oppfriskning levert nøyaktig det vi hadde fra før.
    async function sokOgLagreBehandlingssteder(q, nissyId) {
        let ider;
        if (nissyId) {
            _bhsCache.delete(String(nissyId));
            ider = [String(nissyId)];
        } else {
            const funn = await sokBehandlingsstedINissy(q);
            if (funn.utlogget) return { feil: 'utlogget' };
            ider = funn.steder.slice(0, 20).map(s => s.id);
        }
        if (!ider.length) return { antall: 0, steder: [] };

        // Underavdelingene MÅ med: det er de som bærer direktenumrene. Grue Sykehjem har
        // seks («1 etg - Demens avd», «Kortidsavdeling 2 etg» …), og uten dem satt vi igjen
        // med sentralbordet alene — nummeret operatøren trenger er ofte avdelingens
        // (Thomas 13.08). To nivåer ned, med tak, så ett søk ikke drar med et helt
        // helseforetak.
        const MAKS_HENT = 120;
        const detaljer = [];
        const besokt = new Set();
        let ko = ider.slice();
        let dybde = 0;
        while (ko.length && detaljer.length < MAKS_HENT && dybde <= 2) {
            const neste = [];
            for (let i = 0; i < ko.length && detaljer.length < MAKS_HENT; i += 3) {
                const bunt = await Promise.all(ko.slice(i, i + 3).map(id => hentBehandlingssted(id)));
                for (const b of bunt) {
                    if (!b || besokt.has(String(b.id))) continue;
                    besokt.add(String(b.id));
                    detaljer.push({
                        id: b.id, navn: b.navn, type: b.type, sektor: b.sektor,
                        adresse: b.adresse, postnr_sted: b.postnr_sted, telefon: b.telefon,
                        orgnr: b.orgnr, her_id: b.her_id, posisjon: b.posisjon,
                        kortnavn: b.kortnavn, alias: b.alias,
                        kommune: b.kommune, profesjon: b.profesjon,
                        parent_id: b.foreldre ? b.foreldre.id : null
                    });
                    for (const u of (b.underenheter || [])) {
                        if (u.id && !besokt.has(String(u.id))) neste.push(u.id);
                    }
                }
            }
            ko = neste;
            dybde++;
        }
        if (!detaljer.length) return { antall: 0, steder: [] };
        const r = await fetch('https://thomaswestby.no/skript/behandlingssted_lagre.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: jsonStringifyTrygt({ steder: detaljer, av: window.__vkt_brukernavn || '' })
        }).then(x => x.json());
        return {
            antall: (r && typeof r.lagret === 'number') ? r.lagret : 0,
            steder: detaljer.map(d => ({ id: d.id, navn: d.navn }))
        };
    }

    async function pollBhsSokVentende() {
        if (!erAktivEier()) return;
        if (adminStatus !== 'ok') return;
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=bhs_sok_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || !d.oppslag.length) return;
            const o = d.oppslag[0];
            const p = o.parametre || {};
            const nissyId = p.nissy_id || 0;
            const q = p.q || (nissyId ? '' : (o.nokkel || ''));
            if (!q && !nissyId) return;
            console.log('[VERKTØYKASSE] ' + (nissyId ? 'høster behandlingssted #' + nissyId : 'søker behandlingssted i NISSY: ' + q));
            let res = null, feil = null;
            try {
                res = await sokOgLagreBehandlingssteder(q, nissyId);
                if (res.feil === 'utlogget') { feil = 'Ikke logget inn i NISSY admin'; res = null; }
            } catch (e) { feil = e.message; }
            const fd = new FormData();
            fd.append('id', o.id);
            if (res) fd.append('resultat', jsonStringifyTrygt(res));
            if (feil) fd.append('feil', feil);
            await fetch(`${JOBS_URL}?handling=bhs_sok_svar`, { method: 'POST', body: fd });
            if (res) console.log('[VERKTØYKASSE] behandlingssted-søk «' + q + '»: ' + res.antall + ' lagret');
        } catch (e) {
            console.warn('[VERKTØYKASSE] bhs_sok-poll feil:', e.message);
        }
    }

    // === PNR-OPPSLAG — ssnSearch i admin, returnerer alle kommende/aktive rekvisisjoner ===
    async function sokPnrINissy(pnr) {
        try {
            const body = `submit_action=ssnSearch&ssn=${pnr}&council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1`;
            const r = await fetch(`${ADMIN_BASE}/searchStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (!r.ok) return { feil: `searchStatus HTTP ${r.status}` };
            const html = await r.text();

            // Parse unike (reqId, db, tripid)-kombinasjoner.
            // 4. argument til getRequisitionDetails = Reisenr (tripNr). ATTEST har INGEN
            // reise → 4. arg er `null` (ekte tur har et tall). Det er attest-signaturen.
            const idRegex = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(null|\d+))?/gi;
            const matches = [];
            let m;
            while ((m = idRegex.exec(html)) !== null) {
                const nokkel = m[1] + '_' + m[3];
                if (!matches.find(x => (x.reqId + '_' + x.tripid) === nokkel)) {
                    matches.push({ reqId: m[1], db: m[2], tripid: m[3], erAttest: /^null$/i.test(m[4] || '') });
                }
            }

            // v2.138: STATUS per rekvisisjon (Thomas 04.08). Søketabellen har en Status-kolonne
            // — «Bekreftet» = bestilt hos transportør, «Ny» = rekvirert men IKKE bestilt (raden
            // har «Bestill»-lenke). Vi kastet den før, så en ubestilt retur var usynlig i toasten.
            // Radene bærer sin egen getRequisitionDetails(...) i onclick → kobler status til benet.
            const statusPerBen = {};
            try {
                const sdoc = new DOMParser().parseFromString(html, 'text/html');
                const alleRader = sdoc.querySelectorAll('tr');
                let statusIdx = -1;
                for (let i = 0; i < alleRader.length && statusIdx < 0; i++) {
                    const c = alleRader[i].cells || [];
                    for (let j = 0; j < c.length; j++) {
                        if ((c[j].textContent || '').trim().toLowerCase() === 'status') { statusIdx = j; break; }
                    }
                }
                if (statusIdx > -1) {
                    for (let i = 0; i < alleRader.length; i++) {
                        const rad = alleRader[i];
                        const kilde = (rad.getAttribute('onclick') || '') + ' ' + (rad.innerHTML || '');
                        const km = kilde.match(/getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
                        if (!km || !rad.cells || !rad.cells[statusIdx]) continue;
                        const st = (rad.cells[statusIdx].textContent || '').replace(/\s+/g, ' ').trim();
                        if (st) statusPerBen[km[1] + '_' + km[3]] = st;
                    }
                }
            } catch (_) { /* status er tilleggsinfo — oppslaget skal virke uten */ }
            console.log(`[VERKTØYKASSE] pnr ${pnr}: ${matches.length} rekvisisjon(er) funnet`);

            // Hent detaljer for hver (cap på 20 for å unngå lange serier)
            const turer = [];
            for (const { reqId, db, tripid, erAttest } of matches.slice(0, 20)) {
                const d = await hentRekvisisjon(reqId, db, tripid, tripid);
                if (d) {
                    // ATTEST = ingen Reisenr tildelt (4.arg null i raden) OG NISSY skriver «Har
                    // gyldig attest» på detaljsiden. Begge kreves → ingen falsk attest-merking
                    // av en vanlig uplanlagt rekvisisjon (den har null-Reisenr, men ikke attest-tekst).
                    d.uten_reisenr = !!erAttest;
                    d.er_attest = !!erAttest && !!d.har_gyldig_attest;
                    // v2.138: «Ny» = rekvirert, men ikke bestilt hos transportør ennå.
                    d.status = statusPerBen[reqId + '_' + tripid] || '';
                    d.ikke_bestilt = /^ny\b/i.test(d.status);
                    console.log(`[VERKTØYKASSE] attest-sjekk req=${reqId}: reisenr=${erAttest ? 'NULL' : 'tall'} gyldig_attest=${d.har_gyldig_attest} tur=${d.har_tur} → er_attest=${d.er_attest}`);
                    turer.push(d);
                }
            }
            return { pnr, hentet: new Date().toISOString(), antall: turer.length, turer };
        } catch(e) {
            console.warn('[VERKTØYKASSE] sokPnrINissy:', e.message);
            return { feil: e.message };
        }
    }

    async function pollPnrVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        if (adminStatus !== 'ok') return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=pnr_pending`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            console.log(`[VERKTØYKASSE] ${d.oppslag.length} ventende pnr-oppslag`);
            for (const o of d.oppslag) {
                const res = await sokPnrINissy(o.pnr);
                const fd = new FormData();
                fd.append('id', o.id);
                if (res && !res.feil) fd.append('resultat', JSON.stringify(res));
                if (res && res.feil) fd.append('feil', res.feil);
                await fetch(`${JOBS_URL}?handling=pnr_svar`, { method: 'POST', body: fd });
                console.log(`[VERKTØYKASSE] ✓ pnr-oppslag ${o.id}: ${res.antall || 0} turer`);
            }
        } catch(e) {
            console.warn('[VERKTØYKASSE] pnr-poll feil:', e.message);
        }
    }

    // === TREFF-VERIFISERING (v2.128) — mot «åpen pasient smitter søket» ===
    // NISSY-admin er sesjonsbasert server-side: står en pasient åpen (editPatient) i samme
    // sesjon, kan findPatient returnere DEN pasienten uansett søkenummer (SIVANESAN-lekkasjen:
    // tre ulike innringere ga samme pasient). Verktøykassen henter dessuten selv editPatient
    // i bakgrunnen (folkereg-adresse) → selvforsterkende. Derfor: hvert treff verifiseres ved
    // at søkenummeret (evt. uten landkode) faktisk finnes på pasientens editPatient-side.
    const _pasSideCache = new Map();  // rediger_url → html|null (per session)
    async function pasientHarNummer(redigerUrl, tlf) {
        try {
            if (!redigerUrl) return null;  // kan ikke sjekke → behold treffet
            let html = _pasSideCache.get(redigerUrl);
            if (html === undefined) {
                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 10000);
                try {
                    const r = await fetch(redigerUrl, { credentials: 'same-origin', signal: ctrl.signal });
                    html = r.ok ? await r.text() : null;
                } finally { clearTimeout(timer); }
                _pasSideCache.set(redigerUrl, html);
            }
            if (html === null) return null;
            const ren = String(tlf || '').replace(/\D/g, '');
            if (!ren) return null;
            const kort = (ren.length === 10 && ren.startsWith('47')) ? ren.slice(2) : ren;
            // Tillat mellomrom/nbsp mellom sifrene («21 68 57 95») men krev sifergrense
            // rundt (ellers matcher 8-sifret nummer inni pnr/lange tallstrenger).
            // v2.129: sjekk OGSÅ landkode-variantene — pasientsiden lagrer ofte
            // «+4792263998», og der står 8-sifret nummer RETT ETTER «47» → (?<!\d)
            // avviste et EKTE treff (Stensland-saken 2026-07-02). «47…»/«0047…»-
            // variantene matcher fordi tegnet foran («+» eller start) ikke er siffer.
            const varianter = [kort, '47' + kort, '0047' + kort];
            for (let i = 0; i < varianter.length; i++) {
                const m = '(?<!\\d)' + varianter[i].split('').join('[\\s\\u00a0]?') + '(?!\\d)';
                if (new RegExp(m).test(html)) return true;
            }
            return false;
        } catch (_) { return null; }
    }

    // === VAKTLISTE (v2.178, Thomas 21.08) ===
    // Keeper-popupen sto og viste «Aktiv» og ingenting annet. Nå kan den holde øye med
    // konkrete saker: lim inn et nummer, så følger den statusen og sier fra når den
    // ENDRER seg — slik at operatøren kan love en pasient å følge opp, og gå videre
    // til neste samtale.
    //
    // Arbeidsdelingen: planleggeren eier NISSY-sesjonen og gjør alle oppslag, popupen
    // er ren visning som leser window.opener.__vkt_vakt. Popupen har ingen egen tilgang.
    // Lagres på MASKINEN (localStorage), ikke på server — vaktlista er operatørens egen
    // arbeidsliste, og den skal overleve F5 i planleggeren (Thomas 21.08).
    //
    // ⚠ jsonStringifyTrygt, ALDRI rå JSON.stringify: rico definerer Array.prototype.toJSON,
    // som dobbel-encoder arrays til strenger. Det tømte søkeloggen i juni og ville rammet
    // denne lista på nøyaktig samme måte. Lesingen er selvhelbredende av samme grunn.
    const VAKT_KEY = 'vkt_vaktliste';
    const vaktDato = () => new Date().toISOString().slice(0, 10);
    function vaktLes() {
        try {
            const r = JSON.parse(localStorage.getItem(VAKT_KEY) || 'null');
            if (r && typeof r.saker === 'string') { try { r.saker = JSON.parse(r.saker); } catch (_) {} }
            // Ny dag = ny arbeidsliste. En vakt på gårsdagens tur hjelper ingen.
            if (r && r.dato === vaktDato() && Array.isArray(r.saker)) return r.saker;
        } catch (_) {}
        return [];
    }
    function vaktLagre() {
        try { localStorage.setItem(VAKT_KEY, jsonStringifyTrygt({ dato: vaktDato(), saker: window.__vkt_vakt || [] })); }
        catch (_) { /* full disk / privat modus — lista lever videre i minnet */ }
    }
    window.__vkt_vakt = window.__vkt_vakt || vaktLes();

    // Lengden avgjør hva nummeret ER — samme regel som smart-søk i planleggeren:
    // 12 = rekvisisjon, 8 = turnummer, 11/6 = personnummer.
    function vaktType(raa) {
        const n = String(raa || '').replace(/\D/g, '');
        if (n.length === 12) return { type: 'rek', nokkel: n };
        if (n.length === 8)  return { type: 'tur', nokkel: n };
        if (n.length === 11 || n.length === 6) return { type: 'pnr', nokkel: n };
        return null;
    }

    // Én linje som beskriver tilstanden. Samme kilder som toasten: Status-kolonnen er
    // fasit, SUTI gir klokkeslettet.
    function vaktTilstand(r) {
        if (!r) return { tekst: 'ukjent', farge: '#64748b' };
        const st = String(r.status || '').toLowerCase();
        const su = r.suti || null;
        if (su && su.bomtur)        return { tekst: '⚠ bomtur',  farge: '#f87171' };
        if (/^ferdig/.test(st))     return { tekst: 'ferdig' + (su && su.levert ? ' ' + su.levert : ''), farge: '#64748b' };
        if (/^startet/.test(st))    return { tekst: 'i bilen' + (su && su.hentet ? ' fra ' + su.hentet : ''), farge: '#4ade80' };
        if (su && su.bilFremme)     return { tekst: 'bil fremme ' + su.bilFremme, farge: '#fbbf24' };
        if (/^ny\b/.test(st))       return { tekst: '⚠ ikke bestilt', farge: '#f59e0b' };
        return { tekst: r.status || 'venter', farge: '#94a3b8' };
    }

    // Tidspunkt for en tur, i ms. NISSY skriver «19.08.2026 11:35».
    function vaktTidMs(t) {
        const m = String((t && (t.oppmote_tid || t.klar_fra)) || '')
            .match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
        if (!m) return 0;
        const aar = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
        return new Date(aar, +m[2] - 1, +m[1], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0).getTime();
    }
    function vaktKlokke(t) {
        const ms = vaktTidMs(t);
        if (!ms) return '';
        const d = new Date(ms), idag = new Date(); idag.setHours(0, 0, 0, 0);
        const diff = Math.round((new Date(ms).setHours(0, 0, 0, 0) - idag) / 864e5);
        const kl = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        return (diff === 0 ? 'i dag' : diff === 1 ? 'i morgen' : diff === -1 ? 'i går'
                : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0')) + ' ' + kl;
    }

    async function vaktHent(v) {
        try {
            if (v.type === 'pnr') {
                const res = await sokPnrINissy(v.nokkel);
                if (res && res.feil) return { feil: res.feil };
                const turer = (res && res.turer || []).filter(t => t && t.har_tur && !t.er_attest);
                // v2.184 (Thomas 21.08): en pnr-vakt følger PASIENTEN, ikke én tur.
                // Vis alt som er AKTIVT: ikke ferdig, og ikke fra en tidligere dato.
                // (Regelen er Thomas' foreløpige — han har ikke kartlagt den helt ennå.)
                const idag = new Date(); idag.setHours(0, 0, 0, 0);
                const aktive = turer
                    .filter(t => !/^ferdig/i.test(t.status || ''))
                    .filter(t => { const ms = vaktTidMs(t); return !ms || ms >= idag.getTime(); })
                    .map(t => ({ t, ms: vaktTidMs(t) }))
                    .sort((a, b) => a.ms - b.ms);
                if (aktive.length) {
                    return {
                        navn: aktive[0].t.pasient_navn || '',
                        turer: aktive.map(x => {
                            const ti = vaktTilstand(x.t);
                            return {
                                id: (x.t.reqId || '') + '_' + (x.t.tripid || ''),
                                naar: vaktKlokke(x.t),
                                rute: [x.t.fra_navn || (x.t.fra_adresse || '').split(',')[0],
                                       x.t.til_navn || (x.t.til_adresse || '').split(',')[0]].filter(Boolean).join(' → '),
                                tilstand: ti.tekst, farge: ti.farge,
                                hent: (String(x.t.klar_fra || '').match(/(\d{1,2}:\d{2})/) || [])[1] || ''
                            };
                        })
                    };
                }
                // Ingen aktive: si det rett ut i stedet for å vise en gammel, ferdig tur.
                return { tom: true, navn: (turer[0] || {}).pasient_navn || '',
                         tomTekst: turer.length ? 'ingen aktive turer' : 'ingen turer' };
                // v2.182 (Thomas 21.08): pnr-vakt ga vilkårlig resultat fordi vi tok
                // «første ikke-ferdige» i den rekkefølgen NISSY tilfeldigvis returnerte.
                // En pasient kan ha mange turer. Nå velges den TIDSMESSIG nærmeste som
                // ikke er ferdig — det er den hen venter på. Er alt ferdig, vises den
                // siste fullførte, så lista ikke ser tom ut.
            }
            const d = v.type === 'rek' ? await hentTurDetaljerViaRekvnr(v.nokkel)
                                       : await hentTurDetaljer(v.nokkel);
            if (d && d.feil) return { feil: d.feil };
            const rekv = (d && d.rekvisisjoner || []).filter(Boolean);
            if (!rekv.length) return { tom: true, tomTekst: 'ingen treff' };
            // v2.188 (Thomas 21.08): REKVISISJONSNUMMER ER PER RETNING — tur og retur har
            // hvert sitt (…711 og …721, retur merket «R»), de deler bare grunntallet.
            // reqSearch returnerer begge fordi de hører til samme sak, men operatøren
            // spurte om ÉN retning, og det er den som er relevant. Turnummer-søk viser
            // fortsatt alle ben, for der ER turen én enhet.
            let treff = rekv;
            if (v.type === 'rek') {
                const sokt = String(v.nokkel).replace(/\D/g, '');
                const eksakt = rekv.filter(t => String(t.rek_nr || '').replace(/\D/g, '') === sokt);
                // Faller tilbake til alle hvis rek_nr ikke lot seg lese — bedre å vise
                // for mye enn å vise ingenting.
                if (eksakt.length) treff = eksakt;
            }
            if (!treff.length) return { tom: true, tomTekst: 'ingen treff' };
            // v2.185 (Thomas 21.08): også tur-/rekvisisjonsvakt viser ALLE ben. Et
            // turnummer med tur og retur viste bare det ene — da så halve saken usynlig ut.
            const sortert = treff.map(t => ({ t, ms: vaktTidMs(t) })).sort((a, b) => a.ms - b.ms);
            return {
                navn: (sortert[0].t.pasient_navn || ''),
                turer: sortert.map(x => {
                    const ti = vaktTilstand(x.t);
                    return {
                        id: (x.t.reqId || '') + '_' + (x.t.tripid || ''),
                        naar: vaktKlokke(x.t),
                        rute: [x.t.fra_navn || (x.t.fra_adresse || '').split(',')[0],
                               x.t.til_navn || (x.t.til_adresse || '').split(',')[0]].filter(Boolean).join(' → '),
                        tilstand: ti.tekst, farge: ti.farge,
                        hent: (String(x.t.klar_fra || '').match(/(\d{1,2}:\d{2})/) || [])[1] || ''
                    };
                })
            };
        } catch (e) { return { feil: e.message }; }
    }

    function vaktVarsle(v, fra, til) {
        try {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;
            const n = new Notification('👁 ' + (v.navn || v.nokkel), {
                body: (fra ? fra + '  →  ' : '') + til,
                tag: 'vakt-' + v.nokkel,
                requireInteraction: true
            });
            n.onclick = () => { try { window.focus(); n.close(); } catch (_) {} };
        } catch (_) {}
    }

    async function oppdaterVaktliste() {
        if (!erAktivEier()) return;                 // én instans poller, som de andre
        const liste = window.__vkt_vakt;
        if (!liste || !liste.length) return;
        for (const v of liste) {
            const r = await vaktHent(v);
            if (r.feil) { v.tilstand = 'feil: ' + r.feil; v.farge = '#f87171'; continue; }
            if (r.navn) v.navn = r.navn;
            if (r.tom)  { v.turer = []; v.tilstand = r.tomTekst || 'ingen tur funnet'; v.farge = '#64748b'; continue; }
            // pnr-vakt: en LISTE av aktive turer. Varsle per tur, ellers ville et skifte
            // på tur 2 sett ut som om tur 1 endret seg.
            if (r.turer) {
                const forrige = {};
                (v.turer || []).forEach(t => { forrige[t.id] = t.tilstand; });
                r.turer.forEach(t => {
                    if (forrige[t.id] && forrige[t.id] !== t.tilstand) {
                        vaktVarsle({ navn: (v.navn || v.nokkel) + ' · ' + t.naar, nokkel: v.nokkel + t.id },
                                   forrige[t.id], t.tilstand);
                    }
                });
                v.turer = r.turer;
                v.tilstand = ''; v.rute = ''; v.hent = ''; v.naar = '';
                v.sett = new Date().toTimeString().slice(0, 5);
                continue;
            }
            v.naar = r.naar || '';
            v.flere = r.flere || 0;
            const t = vaktTilstand(r.rad);
            const forrige = v.tilstand;
            v.tilstand = t.tekst;
            v.farge = t.farge;
            v.rute = [r.rad.fra_navn || (r.rad.fra_adresse || '').split(',')[0],
                      r.rad.til_navn || (r.rad.til_adresse || '').split(',')[0]]
                     .filter(Boolean).join(' → ');
            v.hent = (String(r.rad.klar_fra || '').match(/(\d{1,2}:\d{2})/) || [])[1] || '';
            // Varsle KUN ved endring — ellers ville hver runde gitt et nytt varsel.
            if (forrige && forrige !== v.tilstand) vaktVarsle(v, forrige, v.tilstand);
            v.sett = new Date().toTimeString().slice(0, 5);
        }
        vaktLagre();
    }

    // Legg en sak på vaktlista. Eksponert som __vkt_overvaak(nummer) — popupen kaller den.
    window.__vkt_overvaak = function (raa) {
        const t = vaktType(raa);
        if (!t) { console.warn('[VAKT] forstår ikke «' + raa + '» — venter 8 (turnr), 11/6 (pnr) eller 12 siffer (rekvisisjon)'); return false; }
        if (window.__vkt_vakt.some(v => v.nokkel === t.nokkel)) return true;   // alt på lista
        window.__vkt_vakt.push({ ...t, navn: '', tilstand: 'henter …', farge: '#94a3b8', lagt: Date.now() });
        try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (_) {}
        vaktLagre();
        oppdaterVaktliste();
        return true;
    };
    window.__vkt_avslutt_vakt = function (nokkel) {
        window.__vkt_vakt = window.__vkt_vakt.filter(v => v.nokkel !== String(nokkel));
        vaktLagre();
    };
    setInterval(oppdaterVaktliste, 60000);

    // === TLF-OPPSLAG — findPatient i admin, returnerer pasienter med matchende telefon ===
    async function sokTlfINissy(tlf, opts) {
        opts = opts || {};
        // AbortController-timeout: uten den henger et tregt/stallet findPatient-kall
        // for alltid → «Søker...»-knappen blir disabled permanent → nummeret «låser seg»
        // (Jan-Tore: bare F5 frigjorde det). Nå feiler det etter 15 s med tydelig melding
        // → knappen re-aktiveres → operatøren kan prøve på nytt UTEN F5.
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15000);
        try {
            const fd = new FormData();
            // v2.128 ROTÅRSAK (Thomas): Finn pasient-skjemaet er sesjonslagret — et
            // personnummer fra et TIDLIGERE søk «ligger igjen» i Ssn-feltet, og pnr
            // trumfer telefon → alle søk returnerte den gamle pasienten (SIVANESAN).
            // Fiks: hent skjemaet først og blank ALLE tekstfelt eksplisitt (uansett
            // feltnavn), behold hidden-felter, sett kun Phone.
            //
            // v2.132 (Thomas 31.07, HTML-dump av findPatient): blankingen traff ALDRI.
            // NISSY legger <form> DIREKTE i <table> rundt <tr>-ene — ugyldig HTML som
            // parseren foster-parenter: form-elementet blir TOMT og feltene havner som
            // søsken i tabellen. `form input` (etterkommer-selektor) ga derfor 0 treff.
            // NISSYs egen side virker fordi parserens form-pointer gjør feltene til
            // form-EIDE elementer — form.elements ser dem, CSS-selektoren gjør ikke.
            // Nå: form.elements først, ellers alle input i dokumentet. Ssn blankes
            // ALLTID eksplisitt, også om skjema-hentingen feiler helt.
            let blanket = [];
            try {
                const fr = await fetch(`${ADMIN_BASE}/findPatient`, { credentials: 'same-origin', signal: ctrl.signal });
                if (fr.ok) {
                    const fdoc = new DOMParser().parseFromString(await fr.text(), 'text/html');
                    const skjema = fdoc.querySelector('#mainForm, form');
                    const eide = skjema && skjema.elements && skjema.elements.length ? skjema.elements : null;
                    const felter = eide || fdoc.querySelectorAll('input');
                    for (let i = 0; i < felter.length; i++) {
                        const inp = felter[i];
                        if (!inp.name || inp.name === 'Phone' || inp.tagName !== 'INPUT') continue;
                        const type = (inp.type || 'text').toLowerCase();
                        if (type === 'hidden') fd.append(inp.name, inp.value || '');
                        else if (type === 'text' || type === 'tel' || type === 'number') { fd.append(inp.name, ''); blanket.push(inp.name); }
                    }
                }
            } catch (_) { /* skjema-reset best effort — Ssn/Phone sendes uansett */ }
            // Sikkerhetsnett: Ssn er feltet som lekker, og det MÅ tømmes selv om
            // parsingen skulle svikte igjen. (fd.has → ingen dublett når løkka traff.)
            if (!fd.has('Ssn')) { fd.append('Ssn', ''); blanket.push('Ssn (sikkerhetsnett)'); }
            if (ER_DEV) console.log('[VERKTØYKASSE] sokTlfINissy: blanket felt →', blanket.join(', ') || 'INGEN (!)');
            // v2.176 (Thomas 21.08): SEND ALLTID +47 PÅ 8-SIFREDE NUMRE.
            // NISSY leser de to første sifrene i et rått nummer som landskode. For
            // 47-serien betyr det at «47954440» blir søkt som «954440» — seks siffer,
            // som treffer bredt (8 falske treff). Med «+4747954440» blir det ETT treff.
            //
            // Målt på tre numre: +47 gir identisk resultat som rått for 95783334 (1) og
            // 45470646 (2), og RETTER 47954440 (8 falske → 1 ekte). Altså aldri dårligere,
            // og eneste som virker for 47-serien.
            //
            // (Min tidligere test konkluderte motsatt — den kjørte på 47905352, et nummer
            // som IKKE finnes, der alle skrivemåter gir 0 og forskjellen er usynlig.)
            const rentNr = String(tlf || '').replace(/\D/g, '');
            // opts.raaFormat: send NØYAKTIG det som ble oppgitt. Kun for formattesten —
            // uten dette ville alle variantene dens blitt normalisert til +47, og testen
            // målte sin egen fiks i stedet for NISSYs oppførsel (Thomas 21.08).
            const sokeNr = (!opts.raaFormat && rentNr.length === 8) ? '+47' + rentNr : tlf;
            fd.append('Phone', sokeNr);
            fd.append('submitButton', 'Søk pasient');
            const r = await fetch(`${ADMIN_BASE}/findPatient`, {
                method: 'POST', body: fd, credentials: 'same-origin', signal: ctrl.signal
            });
            if (!r.ok) return { feil: `findPatient HTTP ${r.status}` };
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const pasienter = [];
            for (const row of doc.querySelectorAll('table.wizard_list tbody tr')) {
                const tds = row.querySelectorAll('td');
                const pnr = tds[0]?.textContent.trim();
                if (!/^\d{11}$/.test(pnr)) continue;
                pasienter.push({
                    pnr,
                    navn: tds[1]?.textContent.trim() || '',
                    rediger_url: tds[2]?.querySelector('a')?.href || ''
                });
            }
            // UTLOGGET-DETEKSJON (v2.125): uten admin-sesjon svarer NISSY 200 OK med
            // LOGIN-SIDEN i stedet for søkeresultat → 0 rader → toasten sa misvisende
            // «Ingen pasienter funnet». Sjekkes kun ved 0 treff: ekte 0-treff-side har
            // fortsatt søkeskjemaet (input Phone); login-siden har det ikke. I tillegg
            // samme login-heuristikk som sjekkAdminLogin().
            // Belte og seler: gir +47-formen 0 treff, prøv rått én gang. Koster kun et
            // ekstra kall i de tilfellene der vi uansett ikke fant noe.
            // ⚠️ DETTE NETTET VAR ALDRI FESTET. Retrykallet satte `_raa`, mens koden som bygger
            //    søkenummeret leser `raaFormat` — flagget ble aldri lest, så gjenforsøket bygde
            //    «+47» på nytt og sendte NØYAKTIG samme søk. Det har sett ut som et sikkerhetsnett
            //    i koden og gitt de samme null treffene siden det ble skrevet.
            //    Funnet 31.08: 97300204 ligger bare i «Tlf/mobilnr fra EPJ», uten landkode, og
            //    NISSY matcher det feltet LITTERALT. +47-formen finner det aldri.
            //    Vi sender også RENSEDE sifre — Zisson leverer «973 00 204» med mellomrom, og
            //    et rått søk på den strengen ville bommet av en helt annen grunn.
            if (!pasienter.length && sokeNr !== rentNr && rentNr.length === 8 && !opts.utenFallback) {
                const raatt = await sokTlfINissy(rentNr, { ...opts, utenFallback: true, raaFormat: true });
                if (raatt && !raatt.feil && raatt.pasienter && raatt.pasienter.length) {
                    console.log(`[VERKTØYKASSE] tlf ${tlf}: +47-søk ga 0, rått søk «${rentNr}» ga `
                        + `${raatt.pasienter.length} — nummeret ligger trolig i EPJ-feltet uten landkode`);
                    clearTimeout(timer);
                    return raatt;
                }
            }
            if (!pasienter.length) {
                const harSokeskjema = !!doc.querySelector('input[name="Phone"], form[action*="findPatient"]');
                const serUtSomLogin = html.includes('Logg inn') || html.includes('ikke tilgang') ||
                    (html.includes('login') && !html.includes('logout') && html.length < 2000);
                if (!harSokeskjema || serUtSomLogin) {
                    console.warn('[VERKTØYKASSE] sokTlfINissy: admin ikke innlogget (login-side i findPatient-svar)');
                    adminStatus = 'utlogget';
                    try { tegnAdminStatus(); } catch (_) {}
                    return { feil: 'ikke innlogget i admin', utlogget: true };
                }
            }
            // Formattesten vil bare vite HVOR MANGE rader NISSY gir per skrivemåte.
            // Verifiseringen under koster ett sideoppslag per treff — med 31 treff er
            // det nettopp kostnaden vi undersøker, så den hoppes over her.
            if (opts.utenVerifisering) {
                return { tlf, hentet: new Date().toISOString(), pasienter, forkastet: 0, uverifisert: true };
            }
            // Verifiser treffene mot pasientsiden (se pasientHarNummer) — forkast
            // treff der søkenummeret ikke står på pasienten.
            //
            // v2.163 (Thomas 18.08): kjøres PARALLELT, 6 om gangen. Før ventet hver
            // sjekk på den forrige. findPatient gjør PREFIKS-søk — målt 18.08: «905352»
            // (6 siffer) ga 36 treff, og «47905352» ga 31-32 fordi NISSY leser de to
            // første sifrene som landskode og søker på resten. 31 treff ble da 31
            // rundturer på rad, fort 6-8 sekunder. Telefonen er hos operatøren i bare
            // 20-40 sekunder, så det spiste en vesentlig del av
            // vinduet — og svaret var som regel at ALLE skulle forkastes.
            //
            // Rekkefølgen må bevares (pasientlista vises i den), så svarene skrives på
            // sin egen indeks i stedet for å pushes når de tilfeldigvis lander.
            const SAMTIDIG = 6;
            const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const utfall = new Array(pasienter.length);
            let neste = 0;
            const arbeider = async () => {
                while (true) {
                    const i = neste++;
                    if (i >= pasienter.length) return;
                    utfall[i] = await pasientHarNummer(pasienter[i].rediger_url, tlf);
                }
            };
            await Promise.all(Array.from(
                { length: Math.min(SAMTIDIG, pasienter.length) }, arbeider
            ));
            const verifiserte = [];
            let forkastet = 0;
            for (let i = 0; i < pasienter.length; i++) {
                const p = pasienter[i];
                if (utfall[i] === false) {
                    forkastet++;
                    console.warn(`[VERKTØYKASSE] tlf ${tlf}: forkastet «${p.navn}» — nummeret står ikke på pasientsiden (åpen pasient i admin-sesjonen?)`);
                    continue;
                }
                verifiserte.push(p);  // true eller null (kunne ikke sjekke) → behold
            }
            const brukt = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
            console.log(`[VERKTØYKASSE] tlf ${tlf}: ${verifiserte.length} pasient(er) funnet` + (forkastet ? ` (${forkastet} forkastet)` : '')
                + ` · verifisering ${brukt} ms for ${pasienter.length} treff (${SAMTIDIG} samtidig)`);
            return { tlf, hentet: new Date().toISOString(), pasienter: verifiserte, forkastet };
        } catch(e) {
            const melding = (e.name === 'AbortError') ? 'tidsavbrudd – NISSY svarte ikke (prøv igjen)' : e.message;
            console.warn('[VERKTØYKASSE] sokTlfINissy:', melding);
            return { feil: melding };
        } finally {
            clearTimeout(timer);
        }
    }

    // === ATTEST-SJEKK via postMessage til attest-tab ===
    // Direkte fetch fra planlegger blir blokkert av CORS preflight (attest-API
    // svarer ikke med Access-Control-Allow-Origin på OPTIONS). Vi går derfor
    // gjennom en attest-agent som kjører på attest-ui.pasientreiser.nhn.no
    // (samme origin som API'et) og kommuniserer via postMessage.
    let attestTabReady = false;
    let attestTabRef = null;
    let attestSistVersjon = null;   // så heartbeaten ikke logges som en ny hendelse hvert 3. sek
    let attestSistSett = 0;         // tidspunkt for siste heartbeat — fasit for om koblingen lever
    const attestVentende = new Map();  // requestId → {resolve, reject, timer}

    window.addEventListener('message', (e) => {
        const data = e.data || {};
        if (!data.type) return;
        if (data.type === 'vkt_attest_klar') {
            // ⚠️ DETTE ER EN HEARTBEAT, IKKE EN HENDELSE. Attest-agenten re-melder «klar» hvert
            //    3. sekund så koblingen overlever F5 i planleggeren — men da må vi ikke logge
            //    hver eneste gang. Vi logger TILSTANDSENDRING: grå → grønn, og ny versjon.
            const var_klar = attestTabReady && attestTabRef === e.source;
            const nyVersjon = attestSistVersjon !== (data.versjon || '?');
            attestTabReady = true;
            attestTabRef = e.source;
            attestSistSett = Date.now();
            if (!var_klar || nyVersjon) {
                attestSistVersjon = data.versjon || '?';
                console.log('[VERKTØYKASSE] attest-agent tilkoblet, versjon=' + attestSistVersjon);
            }
            // Fortell agenten hvilken NISSY-host operatøren jobber på, så den kan rewrite
            // nissy6-rekvisisjonslenker til samme origin som planleggeren (→ auto-injisering).
            try { e.source.postMessage({ type: 'vkt_planlegger_origin', origin: NISSY_ORIGIN }, '*'); } catch (_) {}
            // ⚠️ Mal prikkene MED ÉN GANG. Flaggene settes her, men fargen settes i
            //    tegnAdminStatus() — som kjører på status-pollen. Uten dette kallet sto
            //    attest-prikken grå helt til neste runde, selv om agenten var klar i samme
            //    sekund. Samme feilmodus som footer-prikkene hadde i morges: tilstanden var
            //    riktig, visningen hang etter.
            try { tegnAdminStatus(); } catch (_) {}
            return;
        }
        if (data.type === 'vkt_attest_result' || data.type === 'vkt_attest_person_result') {
            const venting = attestVentende.get(data.requestId);
            if (!venting) return;
            attestVentende.delete(data.requestId);
            clearTimeout(venting.timer);
            if (data.error) venting.reject(new Error(data.error));
            else venting.resolve(data);
        }
    });

    function sjekkAttest(pnr, timeoutMs = 5000) {
        return new Promise((resolve, reject) => {
            // Vi må ha en levende referanse — ikke prøv å gjenfinne via window.open
            // (det åpner uønsket popup hvis tab ikke finnes). Operatør må åpne attest
            // via Attest-snarvei + bookmarklet for at agenten kan signalisere via opener.
            if (!attestTabRef || attestTabRef.closed) {
                return resolve({ feil: 'attest-tab ikke åpen' });
            }
            const requestId = 'att_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const timer = setTimeout(() => {
                attestVentende.delete(requestId);
                resolve({ feil: 'agent ikke aktiv (klikk bookmarklet)' });
            }, timeoutMs);
            attestVentende.set(requestId, { resolve: r => resolve(r), reject: e => resolve({ feil: e.message }), timer });
            try {
                attestTabRef.postMessage({ type: 'vkt_attest_query', pnr, requestId }, 'https://attest-ui.pasientreiser.nhn.no');
            } catch (e) {
                clearTimeout(timer);
                attestVentende.delete(requestId);
                resolve({ feil: 'postMessage feilet: ' + e.message });
            }
        });
    }

    // === TLF-FLYT (DEV) ===
    // Erstatter den gamle "send pnr tilbake til zisson.php"-flyten.
    // Når en tlf-jobb dukker opp, vis toast i planlegger med kø/kort-info.
    // Operatør velger Pasient/Behandler/Avvis. Pnr forlater aldri verktøykassen.
    const visteToasterIds = new Set();  // hindrer duplikat-toast for samme jobb
    const ZISSON_OPPSLAG_URL = 'https://thomaswestby.no/skript/zisson_oppslag.php';
    const BHS_OPPSLAG_URL = 'https://thomaswestby.no/skript/behandlingssted.php';

    // === HVEM RINGER? — oppslag i det høstede NISSY-registeret (v2.144) ===
    // Brukes når innringeren ikke har kort. 19 293 av stedene deler nummer med andre,
    // så ett treff og tjue treff betyr helt forskjellige ting: det første peker ut ett
    // sted, det andre er et sentralbord for et helt hus. Skillet MÅ vises, ellers
    // behandler operatøren et upresist svar som presist.
    async function visRegisterTreff(el, tlf) {
        try {
            const d = await fetch(BHS_OPPSLAG_URL + '?tlf=' + encodeURIComponent(tlf)).then(r => r.json());
            if (!d || !d.ok || !d.steder || !d.steder.length || !el.isConnected) return;
            const s = d.steder, n = s.length, topp = d.topp, under = d.under || 0;
            const boks = document.createElement('div');
            boks.style.cssText = 'margin-top:5px;padding-left:7px;border-left:2px solid #334155;font-size:11px;';
            const adr = st => [st.adresse, [st.postnr, st.poststed].filter(Boolean).join(' ')].filter(Boolean).join(', ');
            if (topp) {
                // Serveren har brukt opphavsregelen: ligger alle treffene i samme gren, er
                // den øverste svaret. Fem treff på Kurbadet var legesenteret + fire fastleger,
                // ikke fem ulike steder (07.08).
                boks.innerHTML = '<div style="font-size:9.5px;color:#64748b;font-weight:700;letter-spacing:.3px;">FRA NISSY-REGISTERET</div>'
                    + '<div style="color:#f8fafc;font-weight:600;">' + escHtml(topp.navn) + '</div>'
                    + (adr(topp) ? '<div style="color:#cbd5e1;">📍 ' + escHtml(adr(topp)) + '</div>' : '')
                    + (under ? '<div style="color:#64748b;font-size:10px;">Nummeret deles med ' + under + ' enhet' + (under === 1 ? '' : 'er') + ' under stedet.</div>' : '');
            } else {
                // Ingen felles opphav = ekte fellesnummer på tvers av urelaterte steder.
                boks.innerHTML = '<div style="font-size:9.5px;color:#f59e0b;font-weight:700;letter-spacing:.3px;">FELLESNUMMER — ' + n + ' URELATERTE STEDER</div>'
                    + s.slice(0, 3).map(x => '<div style="color:#cbd5e1;">· ' + escHtml(x.navn) + '</div>').join('')
                    + (n > 3 ? '<div style="color:#64748b;">…og ' + (n - 3) + ' til</div>' : '')
                    + '<div style="color:#64748b;font-size:10px;">Nummeret peker ikke ut ett sted — spør hvem som ringer.</div>';
            }
            el.appendChild(boks);
        } catch (_) { /* rent tillegg — 🪪-symbolet står igjen som før */ }
    }

    async function pollTlfVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller (hindrer spøkelses-dobbeltkjøring)
        // SIKKERHETS-FILTER 1 (frontend, defensiv): Zisson-tlf-jobber er per i dag
        // OUS-spesifikke. Hvis kjorekontor er eksplisitt et annet kontor, skipp helt.
        const k = (hentKjorekontor() || '').trim();
        if (k && !/oslo og akershus/i.test(k)) return;
        // SIKKERHETS-FILTER 2 (backend): send nissy så backend filtrerer på etterspurt_av.
        // Hvis brukernavn mangler — skip (backend ville returnert tomt uansett).
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=tlf_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            // Vis KUN nyeste uviste anrop (ett toast av gangen). Tidligere viste loopen "siste itererte",
            // og en ny innringer kunne falle bak gamle pending-jobber → "ny innringer vises ikke".
            const uviste = d.oppslag.filter(o => !visteToasterIds.has(o.id));
            console.log(`[VERKTØYKASSE] tlf-poll: ${d.oppslag.length} pending (ids ${d.oppslag.map(o => o.id).join(',')}), ${uviste.length} uviste`);
            if (uviste.length === 0) return;
            let nyeste = uviste[0];
            for (let i = 1; i < uviste.length; i++) if (Number(uviste[i].id) > Number(nyeste.id)) nyeste = uviste[i];
            uviste.forEach(o => visteToasterIds.add(o.id));  // marker alle uviste som vist (unngå at eldre pop-er senere)
            console.log(`[VERKTØYKASSE] viser nyeste tlf-jobb ${nyeste.id}`, nyeste);
            visTlfToast(nyeste);
        } catch(e) {
            console.warn('[VERKTØYKASSE] tlf-poll feil:', e.message);
        }
    }

    async function svarTlfJobb(id, kategori, ekstraData = null) {
        try {
            const fd = new FormData();
            fd.append('id', id);
            fd.append('resultat', JSON.stringify({ kategori, ...(ekstraData || {}) }));
            await fetch(`${JOBS_URL}?handling=tlf_svar`, { method: 'POST', body: fd });
            console.log(`[VERKTØYKASSE] ✓ tlf-svar ${id}: kategori=${kategori}`);
        } catch (e) {
            console.warn('[VERKTØYKASSE] tlf-svar feil:', e.message);
        }
    }

    function formaterTlf(tlf) {
        const ren = String(tlf || '').replace(/\D/g, '');
        if (ren.length === 8) return `${ren.slice(0,3)} ${ren.slice(3,5)} ${ren.slice(5)}`;
        return tlf;
    }

    // Norsk fødselsnr-regler for år-bestemmelse (forenklet — fanger 99% av tilfeller)
    function alderFraPnr(pnr) {
        const ren = String(pnr || '').replace(/\D/g, '');
        if (ren.length !== 11) return null;
        const dd = parseInt(ren.slice(0,2), 10);
        const mm = parseInt(ren.slice(2,4), 10);
        const yy = parseInt(ren.slice(4,6), 10);
        const ind = parseInt(ren.slice(6,9), 10);
        let aar;
        if (ind <= 499)                              aar = 1900 + yy;
        else if (ind >= 500 && ind <= 749 && yy>=55) aar = 1800 + yy;
        else if (ind >= 500 && ind <= 999 && yy<=39) aar = 2000 + yy;
        else if (ind >= 900 && ind <= 999 && yy>=40) aar = 1900 + yy;
        else                                          aar = 1900 + yy;
        const fodt = new Date(aar, mm - 1, dd);
        if (isNaN(fodt.getTime())) return null;
        const naa = new Date();
        let alder = naa.getFullYear() - fodt.getFullYear();
        const mDiff = naa.getMonth() - fodt.getMonth();
        if (mDiff < 0 || (mDiff === 0 && naa.getDate() < fodt.getDate())) alder--;
        return alder;
    }

    // Tokeniser navn for "Robin Nicholas" vs "NICHOLAS, ROBIN" — sammenlign som sett
    function navnTokens(s) {
        return String(s || '').toLowerCase()
            .replace(/[^a-zæøå\s]/gi, ' ')
            .split(/\s+/)
            .filter(t => t.length >= 2);
    }
    function navnMatcher(a, b) {
        const at = navnTokens(a), bt = navnTokens(b);
        if (at.length === 0 || bt.length === 0) return false;
        const treff = at.filter(x => bt.includes(x)).length;
        return at.length >= 2 ? treff >= 2 : treff === at.length;
    }

    function visTlfToast(jobb) {
        // Fjern eventuell forrige tlf-toast — kun nyeste anrop vises av gangen
        document.querySelectorAll('[id^="vkt-tlf-toast-"]').forEach(el => trygtFjern(el));

        const id = jobb.id;
        const tlf = jobb.tlf || '';
        const p = jobb.parametre || {};
        const koNavn = p.ko_navn || '';
        const kortId = p.kort_id || 0;
        const anroperNavn = (p.anroper_navn || '').trim();
        // Flere numre i én jobb: zisson sender [{tlf,navn,label}] (anroper + pasientens
        // oppgitte nr). Verktøykassen søker ALLE og slår sammen til én toast.
        const numre = Array.isArray(p.numre) ? p.numre : [];

        // Hent lagret posisjon (fra forrige toast som ble flyttet)
        let lagretPos = null;
        try {
            const r = localStorage.getItem('vkt_tlf_toast_pos');
            if (r) lagretPos = JSON.parse(r);
        } catch (_) {}

        const t = document.createElement('div');
        t.id = `vkt-tlf-toast-${id}`;
        const startTop  = lagretPos?.top  || '20px';
        const startLeft = lagretPos?.left || '20px';
        t.style.cssText = [
            'position:fixed', `top:${startTop}`, `left:${startLeft}`, 'z-index:2147483646',
            'background:rgba(15,23,42,0.9)','backdrop-filter:blur(4px)',
            'color:#f8fafc','padding:14px 16px','border-radius:10px',
            'font-family:-apple-system,BlinkMacSystemFont,sans-serif','font-size:13px',
            // v2.134: behandlingslista trenger mer bredde enn 440px; min() holder den
            // innenfor skjermen på små oppløsninger. overflow-x:hidden er sikkerhetsnett
            // mot vannrett scrollbar hvis et enkelt felt skulle bli uventet langt.
            'box-shadow:0 12px 36px rgba(0,0,0,0.55)','min-width:340px','max-width:min(560px, 92vw)','overflow-x:hidden',
            'border:2px solid #3b82f6','border-left-width:6px',
            'user-select:none'
        ].join(';');

        const tittel = koNavn ? `📞 ${koNavn}` : '📞 Innkommende anrop';
        const lukkX = `<span data-vkt-lukk style="cursor:pointer;color:#94a3b8;font-size:18px;line-height:1;padding:0 4px;">×</span>`;
        t.innerHTML = `
            <div data-vkt-drag style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:move;">
                <div style="font-weight:700;font-size:14px;">${tittel}</div>
                ${lukkX}
            </div>
            <div style="margin-bottom:8px;">
                <div style="font-size:13px;color:#cbd5e1;font-family:monospace;letter-spacing:0.5px;">${formaterTlf(tlf)}</div>
                ${anroperNavn ? `<div style="font-size:12px;color:#f8fafc;font-weight:600;margin-top:2px;">${anroperNavn}<span style="color:#94a3b8;font-weight:400;font-size:11px;"> · fra Zisson</span></div>` : ''}
            </div>
            <div data-vkt-kort style="font-size:12px;color:#94a3b8;margin-bottom:10px;font-style:italic;">Slår opp kort-info...</div>
            <div data-vkt-knapper style="display:flex;gap:6px;flex-wrap:wrap;">
                <button data-vkt-handling="pasient" style="flex:1;min-width:90px;padding:8px 12px;background:#10b981;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">👤 Pasient</button>
                <button data-vkt-handling="behandler" style="flex:1;min-width:90px;padding:8px 12px;background:#3b82f6;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">🏥 Behandler</button>
                <button data-vkt-handling="avvis" style="flex:1;min-width:70px;padding:8px 12px;background:#475569;color:white;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">Avvis</button>
            </div>
            <div data-vkt-resultat style="margin-top:10px;display:none;max-height:60vh;overflow-y:auto;"></div>
        `;
        document.body.appendChild(t);

        // ⚠️ TOASTEN VOKSER NEDOVER ETTER AT DEN ER PLASSERT (Thomas 26.08). Den er forankret med
        //    `top`, og innholdet fylles ETTERPÅ — først tittel, så treff, så behandlinger. Står
        //    den nede på skjermen (der operatøren gjerne har dratt den), skyves de nederste
        //    treffene rett ut av vinduet, og det finnes ingen scrollbar å redde dem med.
        //    Vi holder den derfor innenfor viewporten hver gang høyden endrer seg: når nedre kant
        //    treffer bunnen, flyttes `top` opp tilsvarende — altså BYGGER DEN OPPOVER.
        //    Vi rører den ikke ellers; operatørens dragne posisjon er fasit så lenge den får plass.
        function tlfHoldInnenfor() {
            try {
                const r = t.getBoundingClientRect();
                const M = 8;
                let topp = r.top;
                if (r.height + 2 * M >= window.innerHeight) topp = M;      // høyere enn skjermen
                else if (r.bottom > window.innerHeight - M) topp = window.innerHeight - M - r.height;
                if (topp < M) topp = M;
                if (Math.abs(topp - r.top) > 1) t.style.top = Math.round(topp) + 'px';

                let venstre = r.left;
                if (r.right > window.innerWidth - M) venstre = window.innerWidth - M - r.width;
                if (venstre < M) venstre = M;
                if (Math.abs(venstre - r.left) > 1) t.style.left = Math.round(venstre) + 'px';
            } catch (_) {}
        }
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(tlfHoldInnenfor);
            ro.observe(t);
        }
        window.addEventListener('resize', tlfHoldInnenfor);
        tlfHoldInnenfor();

        const kortEl     = t.querySelector('[data-vkt-kort]');
        const knapperEl  = t.querySelector('[data-vkt-knapper]');
        const resultatEl = t.querySelector('[data-vkt-resultat]');

        // × må også LUKKE JOBBEN server-side (ferdig=1) — før fjernet den bare DOM-en,
        // så jobben lå pending i 10 min og samme nummer poppet igjen etter F5
        // (visteToasterIds er in-memory). Kategori 'lukket' skiller ×-lukk fra Avvis.
        const lukk = () => { try { svarTlfJobb(id, 'lukket'); } catch (_) {} trygtFjern(t); };
        t.querySelector('[data-vkt-lukk]').onclick = lukk;

        // Drag-and-drop på header-baren
        const dragEl = t.querySelector('[data-vkt-drag]');
        let dragX = 0, dragY = 0, startX = 0, startY = 0, drar = false;
        dragEl.addEventListener('mousedown', (e) => {
            if (e.target.closest('[data-vkt-lukk]')) return;
            drar = true;
            const r = t.getBoundingClientRect();
            startX = r.left; startY = r.top;
            dragX = e.clientX; dragY = e.clientY;
            t.style.transition = 'none';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!drar) return;
            const nyLeft = Math.max(2, Math.min(window.innerWidth  - t.offsetWidth  - 2, startX + (e.clientX - dragX)));
            const nyTop  = Math.max(2, Math.min(window.innerHeight - t.offsetHeight - 2, startY + (e.clientY - dragY)));
            t.style.left = nyLeft + 'px';
            t.style.top  = nyTop  + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (!drar) return;
            drar = false;
            try {
                localStorage.setItem('vkt_tlf_toast_pos', JSON.stringify({
                    left: t.style.left, top: t.style.top
                }));
            } catch (_) {}
        });

        // Pasient-info-rad mellom kort og knapper — fylles inn etter oppslag hvis kortet har pasient
        const pasientRad = document.createElement('div');
        pasientRad.style.cssText = 'display:none;font-size:12px;color:#cbd5e1;margin-bottom:10px;padding:6px 8px;background:rgba(59,130,246,0.10);border-left:3px solid #3b82f6;border-radius:4px;';
        knapperEl.parentNode.insertBefore(pasientRad, knapperEl);

        // Kort-info brukes også av Pasient-knappen for dual NISSY-søk
        let kortInfo = null;
        // v2.152: forbindelsene bærer pasientens eget nummer. Ringer en datter for faren
        // sin, er det HANS tur operatøren skal finne — og det nummeret står ingen andre
        // steder i jobben. Uten dette fant toasten faren, men ikke turen hans.
        let forbInfo = null;

        // Auto-søk: klikk Pasient-knappen programmatisk (guard mot dobbel-trigger).
        let autoSokStartet = false;
        const autoKlikkPasient = (grunn) => {
            if (autoSokStartet) return;
            const pasientBtn = knapperEl.querySelector('button[data-vkt-handling="pasient"]');
            if (pasientBtn && !pasientBtn.disabled) {
                autoSokStartet = true;
                console.log(`[VERKTØYKASSE] auto-søk pasient (${grunn})`);
                setTimeout(() => pasientBtn.click(), 500);
            }
        };
        // På pasient-/innringer-køer er den som ringer per definisjon pasienten, så
        // vi søker opp automatisk — også når vi ikke har kort. Speiler zisson.php sin
        // egen kø-klassifisering (pasient|innringer|privat).
        const erPasientlinje = /pasient|innringer|privat/i.test(koNavn);
        // v2.161 (Thomas 17.08): telefonregisteret er blitt godt nok til at skillet
        // Pasient/Behandler ikke lenger er verdt et klikk. Telefonen er hos operatøren
        // i 20–40 sekunder — hvert klikk spiser av det budsjettet, og på køer som
        // «Oslo Fly» sto toasten og ventet på et klikk vi nesten alltid ville gjort.
        // Så vi søker på ALLE køer, ikke bare pasientlinjene.
        //
        // Knappene blir stående: de klassifiserer anropet (statistikk via tlf_svar) og
        // Behandler/Avvis lukker toasten som før. Auto-søket erstatter altså klikket,
        // ikke valget. Er nummeret ikke en pasient, gir søket null treff og toasten
        // ser ut som i dag.
        //
        // Sjåførlinja er unntatt uten egen sjekk — den grenen når aldri hit (egen
        // løyve-flyt). Sett til false for å falle tilbake til kun pasientlinjer.
        const AUTO_SOK_ALLE_KOER = true;
        const autoSok = (grunn) => {
            if (AUTO_SOK_ALLE_KOER || erPasientlinje) autoKlikkPasient(grunn);
        };
        // Sjåførlinje: anroperen er en SJÅFØR — finn løyvet (tlf→løyve-register, selvlærende)
        // og turen(e) hans i pågående-tabellen. Marker + scroll + vis turinfo i toasten.
        const erSjaforlinje = /sjåfør|sjafør|sjafor|transportør|transportor|drosje|taxi|løyve|loyve/i.test(koNavn);

        // Løyve-normalisering: «C 1048» / «C1048» / «C-1048» → «C1048». Format spiller aldri rolle.
        const normLoyve = (s) => String(s || '').toUpperCase().replace(/[^A-ZÆØÅ0-9]/g, '');
        // Les RESSURS-kolonnen (via tr.tbh-header) per tabell — presist, ikke skann alle celler.
        const forRessursRad = (fn) => {
            document.querySelectorAll('table').forEach(tbl => {
                const hode = tbl.querySelector('tr.tbh');
                if (!hode) return;
                const hc = Array.from(hode.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
                const ri = hc.findIndex(s => s.includes('RESSURS'));
                if (ri < 0) return;
                tbl.querySelectorAll('tbody tr[name]').forEach(tr => {
                    const raw = ((tr.cells[ri] && tr.cells[ri].textContent) || '').trim();
                    if (raw) fn(tr, raw.split(/\s+/)[0]);  // ressurs-id = første token («C-1048»)
                });
            });
        };
        // Finn rader der RESSURS matcher løyvet (normalisert, så format ikke spiller rolle).
        const finnRessursRader = (loyve) => {
            const maal = normLoyve(loyve);
            if (!maal) return [];
            const treff = [];
            forRessursRad((tr, ress) => { if (normLoyve(ress) === maal) treff.push(tr); });
            return treff;
        };
        // Distinkte ressurser som er synlige i tabellen nå (etter at operatøren har søkt opp en tur).
        const lesRessurserFraTabell = () => {
            const sett = {};
            forRessursRad((tr, ress) => { if (/[A-ZÆØÅ]/i.test(ress) && /\d/.test(ress)) sett[ress] = (sett[ress] || 0) + 1; });
            return Object.keys(sett);
        };
        // Kompakt turinfo fra en tabellrad: les kolonner via header-raden (tr.tbh) i samme tabell.
        const radTurinfo = (tr) => {
            try {
                const tbl = tr.closest('table');
                const hode = tbl && tbl.querySelector('tr.tbh');
                if (!hode) return (tr.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
                const hc = Array.from(hode.cells).map(c => c.textContent.toUpperCase().replace(/\s+/g, ''));
                const idx = n => hc.findIndex(s => s.includes(n));
                const c = i => (i >= 0 && tr.cells[i]) ? (tr.cells[i].textContent || '').trim().replace(/\s+/g, ' ') : '';
                const tid = c(idx('OPPMTID')) || c(idx('START'));
                const fra = c(idx('FRA')) || c(idx('PADR'));
                const til = c(idx('TIL')) || c(idx('BEHADR'));
                const status = c(idx('STATUS'));
                const pnavn = c(idx('PNAVN'));
                return [tid, fra && til ? `${fra} → ${til}` : (fra || til), pnavn, status ? `(${status})` : ''].filter(Boolean).join(' · ');
            } catch (_) { return ''; }
        };
        const markerRessursRader = (rader) => {
            if (!document.getElementById('vkt-sjafor-stil')) {
                const st = document.createElement('style');
                st.id = 'vkt-sjafor-stil';
                st.textContent = '@keyframes vktSjaforPuls{0%,100%{background-color:rgba(59,130,246,.12)}50%{background-color:rgba(59,130,246,.5)}}tr.vkt-sjafor-blink,tr.vkt-sjafor-blink>td{animation:vktSjaforPuls 1.2s ease-in-out infinite!important}';
                document.head.appendChild(st);
            }
            rader.forEach(tr => tr.classList.add('vkt-sjafor-blink'));
            if (rader[0]) rader[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
            setTimeout(() => rader.forEach(tr => tr.classList.remove('vkt-sjafor-blink')), 30000);
        };
        const visSjaforTreff = (loyve, fraRegister) => {
            const rader = finnRessursRader(loyve);
            const linjer = rader.slice(0, 4).map(tr => `<div style="font-size:11px;color:#cbd5e1;margin-top:3px;">🚐 ${radTurinfo(tr).replace(/[<>&]/g, ch => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[ch]))}</div>`).join('');
            kortEl.style.fontStyle = '';
            kortEl.style.color = '#cbd5e1';
            kortEl.innerHTML = `<span style="color:#f8fafc;font-weight:600;">🚐 Løyve ${loyve}</span>`
                + `<span style="color:#94a3b8;font-size:11px;"> · ${fraRegister ? 'fra register' : 'nytt — lagret'}</span>`
                + (rader.length ? `<div style="font-size:11px;color:#86efac;margin-top:3px;">${rader.length} rad${rader.length > 1 ? 'er' : ''} i tabellen — markert</div>${linjer}`
                                : `<div style="font-size:11px;color:#fbbf24;margin-top:3px;">Ingen rader med løyvet i gjeldende visning (sjekk filter/fane)</div>`);
            if (rader.length) markerRessursRader(rader);
            // Knapper: behold Avvis, bytt Pasient/Behandler med «Vis i tabellen»
            knapperEl.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.vktHandling === 'pasient') { btn.textContent = '📍 Vis i tabellen'; btn.onclick = () => { const r2 = finnRessursRader(loyve); if (r2.length) markerRessursRader(r2); }; }
                else if (btn.dataset.vktHandling === 'behandler') trygtFjern(btn);
            });
            svarTlfJobb(id, 'sjafor', { loyve, rader: rader.length });
        };
        // Lagre tlf→løyve i registeret (selvlærende), så vis treffet.
        const lagreLoyve = async (loyve) => {
            const rent = String(loyve || '').trim();
            if (!rent) return;
            try {
                const fd = new FormData();
                fd.append('tlf', tlf);
                fd.append('loyve', rent);  // lagres slik NISSY skriver det; matching er normalisert
                fd.append('av', hentNissyBrukernavn() || '');
                await fetch(`${JOBS_URL}?handling=sjafor_tlf_lagre`, { method: 'POST', body: fd });
            } catch (_) {}
            visSjaforTreff(rent, false);
        };
        // Manuelt løyve-felt (fallback) — render inn i gitt container.
        const visLoyveInputManuell = (container) => {
            container.innerHTML = '';
            const rad = document.createElement('div');
            rad.style.cssText = 'display:flex;gap:6px;margin-top:4px;';
            rad.innerHTML = `<input data-vkt-loyve placeholder="f.eks. C-1048" style="flex:1;padding:5px 8px;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:6px;font-size:12px;font-family:monospace;">
                <button data-vkt-loyve-ok style="padding:5px 12px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">Lagre + finn</button>`;
            container.appendChild(rad);
            const inp = rad.querySelector('[data-vkt-loyve]');
            const ok = () => { const v = (inp.value || '').trim(); if (v) lagreLoyve(v); };
            rad.querySelector('[data-vkt-loyve-ok]').onclick = ok;
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ok(); } });
            setTimeout(() => inp.focus(), 100);
        };
        // Ukjent sjåfør: operatøren søker opp Reisenr → vi leser løyvet RETT fra turen (autoritativt
        // format) og tilbyr å lagre nummeret. Manuelt felt som fallback.
        const visSjaforUkjent = () => {
            kortEl.style.fontStyle = '';
            kortEl.innerHTML = `<div style="color:#fbbf24;font-size:11px;margin-bottom:6px;">🚐 Ukjent sjåfør. Spør om <b>Reisenr</b>, søk det opp i planleggeren — så kobler vi nummeret til løyvet på turen.</div>`;
            const knappRad = document.createElement('div');
            knappRad.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
            knappRad.innerHTML = `<button data-vkt-koble style="flex:1;min-width:160px;padding:6px 10px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;">🔗 Koble til turen jeg fant</button>
                <button data-vkt-manuell style="padding:6px 10px;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;font-size:12px;cursor:pointer;">✏️ Tast løyve</button>`;
            kortEl.appendChild(knappRad);
            const valg = document.createElement('div');
            valg.style.cssText = 'margin-top:6px;';
            kortEl.appendChild(valg);
            knappRad.querySelector('[data-vkt-koble]').onclick = () => {
                const ress = lesRessurserFraTabell();
                if (ress.length === 0) { valg.innerHTML = `<div style="color:#fbbf24;font-size:11px;">Fant ingen tur i visningen — søk opp Reisenr i planleggeren først.</div>`; return; }
                valg.innerHTML = `<div style="font-size:11px;color:#cbd5e1;margin-bottom:4px;">Er dette sjåførens nummer? Velg løyvet på turen:</div>`;
                ress.slice(0, 8).forEach(r => {
                    const b = document.createElement('button');
                    b.textContent = `📞 Ja — lagre som ${r}`;
                    b.style.cssText = 'display:block;width:100%;margin-bottom:4px;padding:6px 10px;background:#10b981;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;text-align:left;';
                    b.onclick = () => lagreLoyve(r);
                    valg.appendChild(b);
                });
            };
            knappRad.querySelector('[data-vkt-manuell]').onclick = () => visLoyveInputManuell(valg);
        };
        const sjaforOppslag = async () => {
            kortEl.textContent = 'Slår opp løyve…';
            let loyve = null;
            try {
                const r = await fetch(`${JOBS_URL}?handling=sjafor_tlf_oppslag&tlf=${encodeURIComponent(tlf)}`);
                const d = await r.json();
                if (d.ok && d.loyve) loyve = d.loyve;
            } catch (_) {}
            if (loyve) visSjaforTreff(loyve, true);
            else visSjaforUkjent();
        };

        // Steg 2: hent kort-info fra zisson_oppslag.php (kort_id eller tlf-fallback)
        // — men på SJÅFØRLINJEN hopper vi rett til løyve-oppslaget (kortregisteret er pasient/behandler-rettet).
        // (sjaforOppslag er async → kjører ETTER at knappe-handlerne under er koblet; Avvis virker.)
        if (erSjaforlinje) sjaforOppslag();
        else {
        // v2.148: send ALLTID nummeret med, også når kortet er kjent. Kortet slås fortsatt
        // opp på kort_id, men operatørvarselet henger på NUMMERET — uten tlf her ble varselet
        // usynlig for nettopp de innringerne vi kjenner (funnet 12.08).
        const oppslagUrl = kortId
            ? `${ZISSON_OPPSLAG_URL}?kort_id=${kortId}${tlf ? '&tlf=' + encodeURIComponent(tlf) : ''}`
            : `${ZISSON_OPPSLAG_URL}?tlf=${encodeURIComponent(tlf)}`;
        // v2.130: retry ved forbigående nettverksglipp («Failed to fetch» i toasten 03.07 mens
        // NISSY-søket funket fint) — ett nytt forsøk etter kort pause før vi gir oss.
        const hentOppslag = async () => {
            for (let fs = 0; fs < 2; fs++) {
                try { return await fetch(oppslagUrl).then(r => r.json()); }
                catch (e) { if (fs) throw e; await new Promise(r => setTimeout(r, 700)); }
            }
        };
        hentOppslag().then(d => {
            // === OPERATØRVARSEL (v2.147) — rød trekant, samme konvensjon som AMIS/NISSY ===
            // Én operatør varsler de andre om en innringer. Vises ØVERST og uavhengig av
            // om innringeren har kort: varselet gjelder nummeret, ikke kortet.
            if (d && d.varsler && d.varsler.length) {
                const v = document.createElement('div');
                v.style.cssText = 'margin:-4px 0 10px;display:flex;flex-direction:column;gap:6px;';
                v.innerHTML = d.varsler.map(x =>
                    '<div style="display:flex;gap:8px;align-items:flex-start;padding:9px 11px;'
                    + 'background:rgba(220,38,38,.16);border:1px solid rgba(220,38,38,.6);'
                    + 'border-left:4px solid #dc2626;border-radius:8px;">'
                    + '<span style="font-size:16px;line-height:1.1;">🔺</span>'
                    + '<div style="flex:1;min-width:0;">'
                    + '<div style="font-size:12.5px;font-weight:600;color:#fecaca;">' + escHtml(x.tekst) + '</div>'
                    + '<div style="font-size:10px;color:#94a3b8;margin-top:2px;">' + escHtml(x.opprettet_av || 'ukjent')
                    + ' · ' + escHtml(String(x.opprettet || '').slice(0, 16)) + '</div></div></div>').join('');
                // Rett under tittelen, over nummeret — dette skal leses først.
                const tlfBlokk = t.querySelector('[data-vkt-drag]');
                if (tlfBlokk && tlfBlokk.nextSibling) t.insertBefore(v, tlfBlokk.nextSibling);
                else kortEl.parentNode.insertBefore(v, kortEl);
                // Rød ramme på hele toasten så den skiller seg fra et vanlig anrop.
                t.style.borderColor = '#dc2626';
            }
            if (!d.ok || !d.kort) {
                if (d.kort === null) {
                    // Ingen kort lagret på innringeren → IKKE skremmende «ingen kort funnet»-tekst (forvirrer operatøren).
                    // Bare et lite dempet symbol med tooltip (Thomas 2026-07-01).
                    kortEl.innerHTML = '<span title="Ingen kontaktkort lagret på dette nummeret" style="cursor:help;color:#64748b;font-size:13px;">🪪</span>';
                    kortEl.style.color = '';
                    // v2.144: uten kort vet vi likevel ofte hvem som ringer — det høstede
                    // NISSY-registeret kjenner 16 % av anropene våre uten at noen har
                    // registrert noe (målt 07.08). Rent tillegg: feiler oppslaget står
                    // 🪪-symbolet igjen som før.
                    // v2.150: ikke på pasientlinjene — der er innringeren per definisjon en
                    // privatperson, og et treff i behandlingsstedsregisteret er misvisende.
                    if (!erPasientlinje) visRegisterTreff(kortEl, tlf);
                } else {
                    kortEl.textContent = '(oppslag feilet)';
                    kortEl.style.color = '#fbbf24';
                }
                autoSok(erPasientlinje ? 'pasientlinje (uten kort)' : `alle køer: ${koNavn} (uten kort)`);
                return;
            }
            const k = d.kort;
            kortInfo = k;
            const bc = (d.breadcrumb || []).map(b => b.navn).join(' › ');
            const inst = d.institusjon ? ` · 🏢 ${d.institusjon.navn}` : '';
            // v2.152: rollen hører til FORBINDELSEN, ikke til personen. «(Datter)» alene sier
            // ikke datter av hvem — og samme person kan være datter av én og mor til en annen.
            // Har vi en forbindelse, sier den det ordentlig, og kortets egen rolle (rest fra
            // den gamle modellen) utelates så det ikke står to halve svar over hverandre.
            const forb = d.forbindelser || {};
            forbInfo = forb;
            const ringerFor = forb.ringer_for || [];
            const ringesAv  = forb.ringes_av  || [];
            const linje1 = `<span style="color:#f8fafc;font-weight:600;">${escHtml(k.navn)}</span>`
                         + (k.rolle && !ringerFor.length ? ` <span style="color:#94a3b8;">(${escHtml(k.rolle)})</span>` : '');
            const linje2 = (bc ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;">${bc}${inst}</div>` : '');
            const dempet = s => `<span style="color:#94a3b8;">${escHtml(s)}</span>`;
            const forbLinje = (r, foran, bak) => {
                const tlfDel = r.tlf ? ` <span style="font-family:monospace;color:#94a3b8;">${escHtml(r.tlf)}</span>` : '';
                return `<div style="padding:1px 0;">${foran}<span style="color:#f8fafc;font-weight:600;">${escHtml(r.navn)}</span>${tlfDel}${bak}</div>`;
            };
            let linje3 = '';
            if (ringerFor.length || ringesAv.length) {
                linje3 = '<div style="margin-top:5px;padding-left:7px;border-left:2px solid #334155;font-size:11.5px;color:#cbd5e1;">'
                    + ringerFor.map(r => forbLinje(r, dempet((r.rolle || 'pårørende') + ' til') + ' ', '')).join('')
                    + (ringesAv.length
                        ? '<div style="font-size:9.5px;color:#64748b;font-weight:700;letter-spacing:0.3px;margin-top:3px;">RINGER PÅ VEGNE AV DENNE</div>'
                          + ringesAv.map(r => forbLinje(r, '', ' ' + dempet('— ' + (r.rolle || 'pårørende')))).join('')
                        : '')
                    + '</div>';
            }
            kortEl.style.fontStyle = '';
            kortEl.style.color = '#cbd5e1';
            kortEl.innerHTML = linje1 + linje2 + linje3;

            // v2.144: kortet finnes, men er ikke koblet til NISSY (82 avdelingskort var i
            // den situasjonen 07.08). Da kan registeret likevel si hvor nummeret hører hjemme.
            // v2.150: KUN for behandler-kort. Registeret er behandlingssteder, så oppslag på
            // en privatperson gir enten ingenting eller et misvisende treff (Thomas 12.08).
            if (!k.nissy_tc_id && (k.type === 'behandler' || !k.type)) visRegisterTreff(kortEl, tlf);
            // v2.139: bærer kortet en NISSY behandlingssted-id, hent fasit fra NISSY og
            // vis den under kortlinja. Rent tillegg — feiler oppslaget, skjer ingenting.
            // v2.157: behandlingsstedsregisteret i NISSY krever ADMIN-tilgang, og den har
            // de færreste operatørene (Thomas 13.08). Uten denne sjekken fyrte toasten et
            // oppslag som var dømt til å feile ved hvert eneste anrop, og operatøren fikk
            // et blaff av «Slår opp behandlingsstedet…» som forsvant igjen. Har man ikke
            // tilgang, skal det ikke skje noe i det hele tatt — alt annet i toasten
            // (kortet, forbindelser, registertreff) går via vår egen server og virker som før.
            if (k.nissy_tc_id && adminStatus === 'ok') {
                const bhsEl = document.createElement('div');
                bhsEl.style.cssText = 'margin-top:6px;padding-left:7px;border-left:2px solid #334155;font-size:11px;color:#94a3b8;';
                bhsEl.textContent = 'Slår opp behandlingsstedet…';
                kortEl.appendChild(bhsEl);
                hentBehandlingssted(k.nissy_tc_id).then(b => {
                    if (!bhsEl.isConnected) return;
                    if (!b) { trygtFjern(bhsEl); return; }
                    const adr = [b.adresse, b.postnr_sted].filter(Boolean).join(', ');
                    const nokler = [];
                    if (b.her_id) nokler.push('HER ' + b.her_id);
                    if (b.orgnr) nokler.push('org.nr ' + b.orgnr);
                    const antUnder = (b.underenheter || []).length;
                    bhsEl.innerHTML =
                        '<div style="font-size:9.5px;color:#64748b;font-weight:700;letter-spacing:0.3px;">NISSY-BEHANDLINGSSTED</div>'
                        + '<div style="color:#f8fafc;font-weight:600;">' + escHtml(b.navn) + '</div>'
                        + (adr ? '<div style="color:#cbd5e1;">📍 ' + escHtml(adr) + '</div>' : '')
                        + (b.telefon ? '<div style="color:#cbd5e1;font-family:monospace;">☎ ' + escHtml(b.telefon) + '</div>' : '')
                        + (b.sektor ? '<div>' + escHtml(b.sektor) + (b.type ? ' · ' + escHtml(b.type) : '') + '</div>' : '')
                        + (nokler.length ? '<div style="color:#64748b;font-size:10px;">' + escHtml(nokler.join(' · ')) + '</div>' : '')
                        + (antUnder ? '<div style="margin-top:2px;"><span data-vkt-bhs-under style="cursor:pointer;color:#38bdf8;">▸ ' + antUnder + ' underenhet' + (antUnder === 1 ? '' : 'er') + '</span><div data-vkt-bhs-liste style="display:none;margin-top:2px;"></div></div>' : '');
                    const bryter = bhsEl.querySelector('[data-vkt-bhs-under]');
                    if (bryter) bryter.onclick = () => {
                        const liste = bhsEl.querySelector('[data-vkt-bhs-liste]');
                        const apen = liste.style.display !== 'none';
                        if (!apen && !liste.innerHTML) {
                            liste.innerHTML = b.underenheter.map(u =>
                                '<div style="color:#cbd5e1;padding:1px 0;">· ' + escHtml(u.navn)
                                + (u.type ? ' <span style="color:#64748b;">' + escHtml(u.type) + '</span>' : '') + '</div>').join('');
                        }
                        liste.style.display = apen ? 'none' : 'block';
                        bryter.textContent = (apen ? '▸ ' : '▾ ') + antUnder + ' underenhet' + (antUnder === 1 ? '' : 'er');
                    };
                });
            }

            // Pasient-rad: vises hvis kortet har lagret pasient og pasient-tlf er annet enn anrops-tlf
            const tlfRen = (tlf || '').replace(/\D/g, '');
            const pasientTlfRen = (k.pasient_telefon || '').replace(/\D/g, '');
            const sammeTlf = pasientTlfRen && pasientTlfRen === tlfRen;
            if (k.pasient_navn || (pasientTlfRen && !sammeTlf)) {
                const navnDel = k.pasient_navn
                    ? `<span style="color:#f8fafc;font-weight:600;">${k.pasient_navn}</span>`
                    : `<span style="color:#94a3b8;">(uten navn)</span>`;
                const tlfDel = (pasientTlfRen && !sammeTlf)
                    ? ` · <span style="font-family:monospace;color:#cbd5e1;">${formaterTlf(k.pasient_telefon)}</span>`
                    : '';
                pasientRad.innerHTML = `<div style="font-size:10px;color:#94a3b8;font-weight:700;letter-spacing:0.5px;margin-bottom:3px;">PASIENT (registrert på kortet)</div>${navnDel}${tlfDel}`;
                pasientRad.style.display = 'block';
            }

            // Auto-trigger NISSY-søk når enten rolle = "Pasient (selv)" ELLER kortet har
            // gyldig 11-sifret personnummer — i begge tilfeller vet vi hvem som ringer,
            // så operatøren slipper å klikke Pasient-knappen manuelt.
            const harPasientPnr = /^\d{11}$/.test((k.pasient_pnr || '').replace(/\D/g, ''));
            const pasientTlfK   = (k.pasient_telefon || '').replace(/\D/g, '');
            const harPasientTlf = pasientTlfK && pasientTlfK !== (tlf || '').replace(/\D/g, '');
            const erSelv = (k.rolle || '').toLowerCase() === 'pasient (selv)';
            // v2.152: en forbindelse med eget nummer er samme situasjon — vi vet hvem
            // pasienten er, så søket skal gå av seg selv.
            const harForbTlf = [...ringerFor, ...ringesAv].some(r => (r.tlf || '').replace(/\D/g, ''));
            // Auto-søk også når en pårørende har oppgitt pasientens eget nr — da vet vi
            // hvem pasienten er, og søket dekker både anroper og pasient.
            if (erSelv || harPasientPnr || harPasientTlf || harForbTlf) autoKlikkPasient('kort: pasient kjent');
            else if (erPasientlinje)     autoKlikkPasient('pasientlinje');
            else                         autoSok(`alle køer: ${koNavn}${k.navn ? ` (kort: ${k.navn})` : ''}`);
        }).catch(e => {
            // Dempet melding — kortoppslaget er tilleggsinfo; NISSY-søket går sin gang uansett.
            kortEl.innerHTML = `<span title="Kort-oppslaget nådde ikke serveren (${e.message}) — prøvd 2 ganger" style="cursor:help;">(kort-info utilgjengelig)</span>`;
            kortEl.style.color = '#94a3b8';
            autoSok(erPasientlinje ? 'pasientlinje (oppslag-feil)' : `alle køer: ${koNavn} (oppslag-feil)`);
        });
        }  // slutt else (ikke sjåførlinje)

        // Knappe-handlere
        knapperEl.querySelectorAll('button').forEach(btn => {
            btn.onclick = async () => {
                const handling = btn.dataset.vktHandling;
                if (handling === 'behandler' || handling === 'avvis') {
                    await svarTlfJobb(id, handling);
                    lukk();
                    return;
                }
                if (handling === 'pasient') {
                    btn.disabled = true; btn.textContent = '⏳ Søker...';

                    // Søk ALLE relevante numre parallelt: anroper + numre fra zisson-
                    // jobben (pasientens oppgitte nr) + pasient-tlf fra kortet. Deduped
                    // på rene sifre, så samme nummer ikke søkes to ganger.
                    // v2.126: søk med RENSEDE sifre (før: råstreng m/ +47/mellomrom fra
                    // Zisson → 0 treff i findPatient selv om nummeret lå i NISSY —
                    // PAULSEN-saken: manuelt søk «48157872» traff, toasten bommet).
                    // Har nummeret landkode (47/0047), søkes OGSÅ 8-sifret variant.
                    const kandidater = new Map();
                    const leggTilNr = (raw) => {
                        let ren = (raw || '').replace(/\D/g, '');
                        if (!ren) return;
                        if (ren.startsWith('0047') && ren.length === 12) ren = ren.slice(4);
                        if (!kandidater.has(ren)) kandidater.set(ren, ren);
                        if (ren.length === 10 && ren.startsWith('47')) {
                            const kort = ren.slice(2);
                            if (!kandidater.has(kort)) kandidater.set(kort, kort);
                        }
                    };
                    leggTilNr(tlf);
                    (numre || []).forEach(n => leggTilNr(n && n.tlf));
                    leggTilNr(kortInfo?.pasient_telefon);
                    // Forbindelsene: pasienten datteren ringer for, og — ringer pasienten
                    // selv — de pårørende som kan stå oppført på turen i stedet for henne.
                    (forbInfo?.ringer_for || []).forEach(r => leggTilNr(r && r.tlf));
                    (forbInfo?.ringes_av  || []).forEach(r => leggTilNr(r && r.tlf));
                    const oppgaver = [...kandidater.values()].map(raw => sokTlfINissy(raw));
                    const resultater = await Promise.all(oppgaver);
                    const feilet = resultater.find(r => r.feil);
                    if (feilet) {
                        resultatEl.style.display = 'block';
                        // Utlogget ≠ søkefeil: si tydelig at operatøren må logge inn i admin
                        // (før v2.125 endte dette som misvisende «Ingen pasienter funnet»).
                        resultatEl.innerHTML = feilet.utlogget
                            ? `<div style="color:#fbbf24;font-size:12px;">⚠ Du er ikke logget inn i admin.<br>Åpne <b>Admin</b> fra 🔧-menyen, logg inn og prøv igjen.</div>`
                            : `<div style="color:#ef4444;font-size:12px;">Søk feilet: ${feilet.feil}</div>`;
                        btn.disabled = false; btn.textContent = '👤 Pasient';
                        return;
                    }

                    // Merge unike pasienter etter pnr (fall tilbake til navn hvis pnr mangler)
                    // + husk HVILKET nummer som ga treffet (selvdiagnose: to anrop på rad
                    // viste samme pasient — nå ser operatøren kilden direkte i toasten).
                    const unike = new Map();
                    for (const r of resultater) {
                        for (const p of (r.pasienter || [])) {
                            const nokkel = p.pnr || p.navn || JSON.stringify(p);
                            if (!unike.has(nokkel)) unike.set(nokkel, { ...p, _kildeTlf: r.tlf || '' });
                        }
                    }
                    const pasienter = Array.from(unike.values());

                    visPasientliste(resultatEl, pasienter, id, anroperNavn);
                    // Sesjons-smitte-varsel: treff ble forkastet fordi søkenummeret ikke
                    // står på pasienten (typisk: en pasient står åpen i admin-sesjonen).
                    let nForkastet = 0;
                    for (let i = 0; i < resultater.length; i++) nForkastet += (resultater[i].forkastet || 0);
                    if (!pasienter.length && nForkastet) {
                        // v2.175 (Thomas 21.08): meldingen ga FEIL forklaring for numre i
                        // 47-serien. NISSY leser de to første sifrene som landskode og søker
                        // på resten — «47954440» blir til «954440», seks siffer, som treffer
                        // bredt (målt: 8-36 treff). Det er ikke sesjons-smitte, og operatøren
                        // skulle ikke lete etter en åpen pasient i admin.
                        // Se reference_nissy_findpatient_tlfformat: INGEN skrivemåte løser
                        // dette — verifiseringen er forsvaret, og den gjorde jobben sin.
                        // `resultater` bærer nummeret som ble søkt på (sokTlfINissy returnerer
                        // {tlf, ...}); `oppgaver` er promisene og har det ikke.
                        const numre47 = [...new Set((resultater || []).map(r => String(r && r.tlf || '').replace(/\D/g, '')))]
                            .filter(t => t.length === 8 && t.startsWith('47'));
                        resultatEl.innerHTML += numre47.length
                            ? `<div style="color:#94a3b8;font-size:11px;margin-top:4px;">⚠ ${nForkastet} treff forkastet — <strong style="color:#cbd5e1;">${escHtml(numre47[0])}</strong> begynner på 47, som NISSY leser som landskode. Den søkte derfor på <strong style="color:#cbd5e1;">${escHtml(numre47[0].slice(2))}</strong> og traff bredt. Ingen av dem har nummeret — det er trolig ikke registrert.</div>`
                            : `<div style="color:#f87171;font-size:11px;margin-top:4px;">⚠ ${nForkastet} NISSY-treff forkastet — nummeret står ikke på pasienten. En åpen pasient i admin kan «smitte» søket.</div>`;
                    }
                    knapperEl.style.display = 'none';
                    await svarTlfJobb(id, 'pasient', { antall: pasienter.length, kilder: oppgaver.length, forkastet: nForkastet });
                }
            };
        });
    }

    // === «Er dette vår pasient?» — postnr-sone-sjekk (speiler Område-assistentens predikat) ===
    // Kjørekontorets område-soner ligger i window.__vkt_tilgang.omraade_postnr (tekst, f.eks.
    // «0000-2099,2150-2151,…»). Pasientens hjemmeadresse (m/ postnr) kommer fra rekv-oppslaget.
    const OMRAADE_FALLBACK_PR = '0000-2099,2150-2151,2160-2167,2170';
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
    function hentPostnr(t) { if (!t) return null; const m = String(t).match(/\b(\d{4})\b/); return m ? m[1] : null; }
    function omraadeSett() {
        const t = (function () { try { return window.__vkt_tilgang || {}; } catch (_) { return {}; } })();
        const sett = parsePostnrSett(t.omraade_postnr || '');
        return sett.length ? sett : parsePostnrSett(OMRAADE_FALLBACK_PR);
    }
    function erVaartOmraade(adr) {
        const p = hentPostnr(adr); if (!p) return null;  // ukjent postnr → kan ikke avgjøre
        const n = +p; return omraadeSett().some(r => n >= r[0] && n <= r[1]);
    }
    // VASK område-soner mot NISSY: leser kontorets Område-felt (dispatchFilter.fromPostCodes1) fra
    // editDispatchCenter LIVE (admin innlogget i NISSY-konteksten) og oppdaterer omraade_postnr i DB.
    // Server-koordinert via omraade_oppdatert (last-check): vasker kun hvis > 30 dager. Da holder
    // «⚠ IKKE VÅRT OMRÅDE» seg riktig uten manuelt vedlikehold; «Sist vasket» synlig i admin-taben.
    // dispatch_center_id + kjorekontor kommer fra window.__vkt_tilgang (ovr_kontor_tilgang-raden).
    async function vaskOmraadeMotNissy(t) {
        try {
            if (!erAktivEier()) return;  // én-instans: kun aktiv eier vasker
            const dc = parseInt(t && t.dispatch_center_id, 10);
            const kontor = (t && t.kjorekontor) || '';
            if (!dc || !kontor) return;  // ikke konfigurert med senter-id
            const idag = new Date().toISOString().slice(0, 10);
            const nokkel = 'vkt_omr_vask_' + dc;
            if (localStorage.getItem(nokkel) === idag) return;  // per-browser backstop: maks 1×/dag
            localStorage.setItem(nokkel, idag);
            // Last-check: vask kun hvis omraade_oppdatert mangler eller er > 30 dager gammel (server-koordinert).
            const sist = t && t.omraade_oppdatert ? Date.parse(String(t.omraade_oppdatert).replace(' ', 'T')) : 0;
            if (sist && (Date.now() - sist < 30 * 86400 * 1000)) return;  // fersk nok
            // Les Område-feltet fra NISSY (krever admin innlogget der; ellers får vi login-side → skip)
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 12000);
            let omr = '';
            try {
                const r = await fetch(ADMIN_BASE + '/editDispatchCenter?id=' + dc, { credentials: 'same-origin', signal: ctrl.signal });
                const html = await r.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const ta = doc.querySelector('textarea[name="dispatchFilter.fromPostCodes1"]');
                omr = ta ? (ta.textContent || ta.value || '').trim() : '';
            } finally { clearTimeout(timer); }
            // Validér: kun postnr-rekker. Ikke admin / felt ikke funnet → prøv igjen neste økt (sett ikke dato).
            if (!/^\s*\d{1,4}(-\d{1,4})?([,\s]+\d{1,4}(-\d{1,4})?)*\s*$/.test(omr)) return;
            const res = await fetch('https://thomaswestby.no/skript/kjorekontor_vask.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kontor: kontor, dispatch_center_id: dc, omraade: omr })
            }).then(r => r.json()).catch(() => null);
            if (res && res.ok) {
                try { window.__vkt_tilgang.omraade_postnr = res.omraade || omr; window.__vkt_tilgang.omraade_oppdatert = new Date().toISOString().slice(0, 19).replace('T', ' '); } catch (_) {}  // fersk verdi i denne økten
                console.log('[VERKTØYKASSE] Område vasket mot NISSY (senter ' + dc + '): ' + (res.omraade || omr));
            }
        } catch (e) { console.warn('[VERKTØYKASSE] område-vask feilet:', e.message); }
    }
    // HØST ALLE kjørekontor: les hele dispatch-senter-lista (getDispatchCenter) + hvert senters
    // Område-felt → bygg nasjonal postnr→kontor-tabell (ovr_kjorekontor) så toasten kan si HVILKET
    // kontor en utenbys pasient tilhører. Sjelden endring → maks 1×/uke per browser. Krever admin.
    async function hoestAlleKjorekontor(t) {
        try {
            if (!erAktivEier()) return;
            // Per-browser backstop: sjekk maks 1×/dag (unngå gjentatte status-kall).
            const idag = new Date().toISOString().slice(0, 10);
            if (localStorage.getItem('vkt_kk_sjekk') === idag) return;
            localStorage.setItem('vkt_kk_sjekk', idag);
            // Server-koordinert last-check: høst KUN hvis lista mangler eller er > 30 dager gammel.
            // Da høster bare første admin-browser i måneden — ikke alle operatører.
            try {
                const st = await fetch('https://thomaswestby.no/skript/kjorekontor.php?status').then(r => r.json()).catch(() => null);
                if (st && st.ok && st.antall > 0 && st.alder_dager !== null && st.alder_dager < 30) return;  // fersk nok
            } catch (_) {}
            // 1. Hent senter-lista
            // NB: NISSY-admin-sidene serveres som latin1 (windows-1252). text() dekoder som UTF-8 →
            // mojibake i navn (Ålesund→«�lesund») → ugyldig UTF-8 i POST-body → PHP json_decode forkaster
            // HELE body-en («tom sentre-liste»). Derfor: arrayBuffer + TextDecoder('windows-1252').
            const dekode = buf => new TextDecoder('windows-1252').decode(buf);
            let sentre = [];
            const c1 = new AbortController(); const t1 = setTimeout(() => c1.abort(), 12000);
            try {
                const r = await fetch(ADMIN_BASE + '/getDispatchCenter', { credentials: 'same-origin', signal: c1.signal });
                const doc = new DOMParser().parseFromString(dekode(await r.arrayBuffer()), 'text/html');
                sentre = [...doc.querySelectorAll('select#id option')]
                    .map(o => ({ id: parseInt(o.value, 10), navn: (o.textContent || '').trim() }))
                    .filter(o => o.id && o.navn && !/locus|zabbix/i.test(o.navn));
            } finally { clearTimeout(t1); }
            if (!sentre.length) return;  // ikke admin / tom liste → prøv igjen senere
            // 2. Les Område-feltet for hvert senter (skånsomt, sekvensielt m/ liten pause)
            const res = [];
            for (const s of sentre) {
                try {
                    const c2 = new AbortController(); const t2 = setTimeout(() => c2.abort(), 10000);
                    let omr = '';
                    try {
                        const h = await fetch(ADMIN_BASE + '/editDispatchCenter?id=' + s.id, { credentials: 'same-origin', signal: c2.signal });
                        const d = new DOMParser().parseFromString(dekode(await h.arrayBuffer()), 'text/html');
                        const ta = d.querySelector('textarea[name="dispatchFilter.fromPostCodes1"]');
                        omr = ta ? (ta.textContent || '').trim() : '';
                    } finally { clearTimeout(t2); }
                    if (omr) res.push({ id: s.id, navn: s.navn, omraade: omr });
                    await new Promise(r => setTimeout(r, 250));  // skån NISSY
                } catch (_) {}
            }
            if (!res.length) return;
            const svar = await fetch('https://thomaswestby.no/skript/kjorekontor_lagre.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                // jsonStringifyTrygt: NISSY (Prototype/rico) har Array.prototype.toJSON som dobbel-encoder
                // arrays → server fikk sentre som STRENG («tom sentre-liste»). Nøytraliser toJSON.
                body: jsonStringifyTrygt({ sentre: res, av: hentNissyBrukernavn() || '' })
            }).then(r => r.json()).catch(() => null);
            if (svar && svar.ok) {
                console.log('[VERKTØYKASSE] Høstet ' + svar.lagret + ' kjørekontor til nasjonal liste (' + res.length + ' lest, ' + (svar.hoppet || 0) + ' uten område)');
            }
        } catch (e) { console.warn('[VERKTØYKASSE] kjørekontor-høst feilet:', e.message); }
    }
    // Oppslag: hvilket kjørekontor dekker et postnr (nasjonal liste). Cachet pr. postnr i økten.
    const _kkCache = {};
    async function hentKjorekontorForPostnr(p) {
        if (!p) return null;
        if (_kkCache[p] !== undefined) return _kkCache[p];
        try {
            const r = await fetch('https://thomaswestby.no/skript/kjorekontor.php?postnr=' + encodeURIComponent(p));
            const j = await r.json();
            _kkCache[p] = (j && j.ok) ? j.kontor : null;
        } catch (_) { _kkCache[p] = null; }
        return _kkCache[p];
    }
    function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

    // === FOLKEREGISTER-ADRESSE fra admin editPatient ===
    // For pasienter UTEN rekvisisjon (ingen pasient_adresse) henter vi hjemmeadressen
    // fra admin-siden operatøren uansett lander på ved tlf-oppslag:
    //   /administrasjon/admin/editPatient?ssn=<11-sifret>  (= pas.rediger_url)
    // Adresseradene ligger som <tr> med radio name="default": td[1]=adresse,
    // td[2]=kilde «(Folkeregister)». Folkeregister-raden har radio value="ssn"
    // (id=ssnradio) og er standardvalget. Prioritet: Folkeregister → ssn-radio → første.
    const _folkeregCache = new Map();  // rediger_url → adresse|null (per session)
    async function hentFolkeregisterAdresse(redigerUrl) {
        try {
            if (!redigerUrl) return null;
            if (_folkeregCache.has(redigerUrl)) return _folkeregCache.get(redigerUrl);
            const r = await fetch(redigerUrl, { credentials: 'same-origin' });
            if (!r.ok) { _folkeregCache.set(redigerUrl, null); return null; }
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const rader = [];
            for (const tr of doc.querySelectorAll('tr')) {
                const radio = tr.querySelector('input[name="default"]');
                if (!radio) continue;
                // NISSY bygger sidene med NESTEDE tabeller. En YTRE rad inneholder da
                // både radioen og resten av siden, og `tds[1].textContent` ble hele
                // pasientsiden — inkludert JavaScript-koden — presentert som adresse
                // (Thomas 18.08, Haraldsson). Bare den innerste raden er en adresserad.
                if (tr.querySelector('tr')) continue;
                // Og bare cellene som er DIREKTE barn, ellers drar vi med oss tekst
                // fra tabeller nestet inni cellen.
                const tds = tr.querySelectorAll(':scope > td');
                if (tds.length < 2) continue;
                const adr = (tds[1].textContent || '').replace(/\s+/g, ' ').trim();
                if (!adr || !/\d{4}/.test(adr)) continue;
                // Sikkerhetsnett: en adresse er kort og inneholder ikke kode. Skulle
                // markupen endre seg igjen, vil vi heller vise ingen adresse enn rot.
                if (adr.length > 120 || /[{}]|\$\(|function\s|=>/i.test(adr)) continue;
                const kilde = (tds[2] ? tds[2].textContent : '').replace(/\s+/g, ' ').trim();
                rader.push({ adr, kilde, val: radio.value });
            }
            const valgt = rader.find(x => /folkeregister/i.test(x.kilde))
                || rader.find(x => x.val === 'ssn')
                || rader[0];
            const ut = valgt ? pentAdresse(valgt.adr) : null;
            _folkeregCache.set(redigerUrl, ut);
            return ut;
        } catch (e) {
            console.warn('[VERKTØYKASSE] folkereg-adresse:', e.message);
            return null;
        }
    }
    // Folkeregister-adressen er VERSALER («SVINNDALVEIEN 340 H0101, 1593 SVINNDAL»).
    // Gjør den lesbar: tittel-case på gate/sted, behold postnr + leilighetsnr (H0101).
    function pentAdresse(adr) {
        return String(adr).split(/(\s+)/).map(ord => {
            if (/^\d/.test(ord)) return ord;                 // tall (340, 1593, H0101 håndteres under)
            if (/^H\d{3,4}$/i.test(ord)) return ord.toUpperCase();
            if (/[a-zæøå]/i.test(ord)) return ord.charAt(0).toUpperCase() + ord.slice(1).toLowerCase();
            return ord;
        }).join('');
    }

    function visPasientliste(resultatEl, pasienter, jobbId, anroperNavn = '') {
        resultatEl.style.display = 'block';
        if (pasienter.length === 0) {
            resultatEl.innerHTML = `<div style="color:#fbbf24;font-size:12px;">Ingen pasienter funnet på dette nummeret.</div>`;
            return;
        }

        // Pynt på pasient-listen med alder + anroper-merking, sorter slik at:
        // - ANROPER (navn-match med Zisson) sist
        // - Resten yngst først. De andre på nummeret er som regel familie på samme
        //   husstand, så de merkes nøytralt 'TILKNYTTET' (ikke en påstand om pasient).
        const flerePasienter = pasienter.length > 1;
        const beriket = pasienter.map(pas => {
            const alder = alderFraPnr(pas.pnr);
            const erAnroper = anroperNavn && navnMatcher(anroperNavn, pas.navn);
            return { ...pas, _alder: alder, _erAnroper: erAnroper };
        });
        // 'TILKNYTTET' gir bare mening når vi FAKTISK fant anroperen i lista (f.eks.
        // navn-match med Naz fra Zisson) — da vet vi at resten henger på hennes nummer.
        // Fant vi ikke anroperen, vet vi ingenting om relasjonen → ingen badge.
        const harAnroperTreff = beriket.some(p => p._erAnroper);
        beriket.sort((a, b) => {
            if (a._erAnroper !== b._erAnroper) return a._erAnroper ? 1 : -1;
            const aa = a._alder ?? 999, bb = b._alder ?? 999;
            return aa - bb;
        });

        // v2.137: kopier-knappen brukte 📋 — SAMME emoji som rekv-badgen, bare i annen
        // størrelse (Thomas 04.08). Nå et ekte kopi-ikon: to overlappende firkanter, der
        // den fremste er fylt med toast-bakgrunnen så den skygger for den bakerste.
        const KOPI_IKON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" style="display:block;">'
            + '<rect x="7.5" y="2.5" width="14" height="14" rx="2.5"/>'
            + '<rect x="2.5" y="7.5" width="14" height="14" rx="2.5" fill="#0f172a"/></svg>';

        // === NÆRMESTE BEHANDLINGER (v2.133, Thomas 04.08) ===
        // Toasten telte bare rekvisisjoner («📋 3 rekv»). Operatøren trenger å SE hva de
        // gjelder når pasienten ringer. Alt ligger allerede i turene sokPnrINissy henter
        // (oppmote_tid m/ dato, klar_fra, fra_/til_navn, retning) — ingen nye kall.
        const nissyTidTilDate = s => {
            const m = String(s || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
            if (!m) return null;
            const aar = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
            const d = new Date(aar, +m[2] - 1, +m[1], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
            return isNaN(d) ? null : d;
        };
        const kl = s => { const m = String(s || '').match(/(\d{1,2}:\d{2})/); return m ? m[1] : ''; };
        const UKEDAG = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
        const fmtDag = d => {
            const idag = new Date(); idag.setHours(0, 0, 0, 0);
            const dd = new Date(d); dd.setHours(0, 0, 0, 0);
            const diff = Math.round((dd - idag) / 864e5);
            if (diff === 0) return 'i dag';
            if (diff === 1) return 'i morgen';
            if (diff === -1) return 'i går';
            return UKEDAG[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0');
        };
        // Slår tur- og retur-benet på samme dag+behandlingssted sammen til ÉN behandling —
        // ellers spiser et tur/retur-par to av de fem plassene.
        function grupperBehandlinger(turer) {
            const grupper = new Map();
            for (let i = 0; i < (turer || []).length; i++) {
                const t = turer[i];
                if (!t || !t.har_tur || t.er_attest) continue;
                const erRetur = /fra\s+behandling/i.test(t.retning || '');
                const sted = (erRetur ? t.fra_navn : t.til_navn) || '';
                const naar = nissyTidTilDate(t.oppmote_tid) || nissyTidTilDate(t.klar_fra);
                if (!naar) continue;
                const nokkel = naar.getFullYear() + '-' + naar.getMonth() + '-' + naar.getDate() + '|' + sted.toLowerCase();
                let g = grupper.get(nokkel);
                if (!g) { g = { sted, dato: naar, tid: null, hent: '', rekNr: t.rek_nr || null, harRetur: false, uTur: false, uRetur: false }; grupper.set(nokkel, g); }
                // v2.138: hold styr på hvilke ben som er REKVIRERT MEN IKKE BESTILT (status «Ny»).
                // Grupperingen slår tur+retur sammen til én linje, så uten dette blir en ubestilt
                // retur usynlig — nettopp det Thomas fanget 04.08 (KOSAR: retur «Ny» m/ Bestill-lenke).
                if (erRetur) {
                    g.harRetur = true;
                    if (!g.returFra) g.returFra = t.fra_navn || '';
                    if (!g.returTil) g.returTil = t.til_navn || '';
                    if (!g.returFraAdr) g.returFraAdr = t.fra_adresse || '';
                    if (!g.returTilAdr) g.returTilAdr = t.til_adresse || '';
                    if (t.ikke_bestilt) g.uRetur = true;
                    if (!g.returStatus && t.status) g.returStatus = t.status;
                    if (t.suti) g.returSuti = t.suti;
                    // v2.165: ta vare på retur-benets EGEN klar-tid. Den vises bare hvis den
                    // skiller seg fra turens — se kommentaren under om v2.136.
                    const rh = kl(t.klar_fra);
                    if (rh && !g.returHent) g.returHent = rh;
                }
                else {
                    if (!g.turFra) g.turFra = t.fra_navn || '';
                    if (!g.turTil) g.turTil = t.til_navn || '';
                    if (!g.turFraAdr) g.turFraAdr = t.fra_adresse || '';
                    if (!g.turTilAdr) g.turTilAdr = t.til_adresse || '';
                    if (t.ikke_bestilt) g.uTur = true;
                    if (!g.turStatus && t.status) g.turStatus = t.status;
                    if (t.suti) g.turSuti = t.suti;
                }
                // v2.136: RETUR-tiden er fjernet (Thomas 04.08). Detaljsiden gir samme
                // «Pasient klar fra» for begge ben, så «↩ 14:10» var bare hentetiden om
                // igjen — ikke en reell returtid. Vi viser hentetid + oppmøte, som er det
                // operatøren trenger. Tur-benet har forrang; finnes bare retur-benet
                // brukes dets tider så raden ikke blir tom.
                if (!erRetur || !g.hent) { const h = kl(t.klar_fra); if (h) g.hent = h; }
                if ((!erRetur || !g.tid) && (naar.getHours() || naar.getMinutes())) {
                    const o = kl(t.oppmote_tid);
                    if (o) { g.tid = o; g.dato = naar; }
                }
                if (!g.sted && sted) g.sted = sted;
            }
            return [...grupper.values()];
        }
        // Nærmeste FØRST — kun dagens og kommende (v2.135, Thomas: tidligere DATOER trenger
        // ikke være med). Dagens allerede passerte turer beholdes, dempet: de er ofte nettopp
        // det pasienten ringer om («jeg ble ikke hentet i morges»).
        function velgNaermeste(beh, maks) {
            const naa = new Date();
            const idag = new Date(); idag.setHours(0, 0, 0, 0);
            return beh.filter(b => b.dato >= idag)
                      .sort((a, b) => a.dato - b.dato)
                      .slice(0, maks)
                      .map(b => ({ ...b, passert: b.dato < naa }));
        }
        function tegnBehandlinger(el, turer) {
            const alle = grupperBehandlinger(turer);
            const valgt = velgNaermeste(alle, 5);
            if (!valgt.length) {
                // Skille «pasienten har ingenting» fra «alt ligger bakover i tid» — uten dette
                // ser en pasient med 7 gamle rekvisisjoner helt tom ut i toasten.
                el.innerHTML = alle.length
                    ? `<div style="margin-top:5px;padding-left:7px;border-left:2px solid #334155;font-size:11px;color:#64748b;">Ingen kommende behandlinger <span style="color:#475569;">(${alle.length} tidligere)</span></div>`
                    : '';
                return;
            }
            // v2.134: ÉN grid for alle radene (ikke flex per rad) → dag/tid, sted og hentetider
            // står i flukt nedover. minmax(0,1fr) på sted-kolonnen gir ellipsis i stedet for
            // at lange navn presser toasten bred (som ga vannrett scrollbar).
            // v2.136: kolonne 1 = dag + OPPMØTE, kolonne 3 = HENTETID (ordet «hent» er tilbake —
            // det ble kuttet i v2.134 for å spare plass, og da sto to nakne klokkeslett igjen
            // uten at det gikk fram hva de var). Tooltip forklarer begge.
            // v2.171 (Thomas 21.08): vis FRA → TIL, ikke bare behandlingsstedet. «↩ retur»
            // sa retningen, men ikke hvor pasienten skulle hentes — og det er nettopp det
            // operatøren trenger når noen ringer om en tur som ikke er kommet.
            // Navnene bærer retningen selv, så retur-etiketten er overflødig.
            // v2.173 (Thomas 21.08): «?» sto der pasientens PRIVATADRESSE skulle vært —
            // et hjem har ingen stedsnavn, bare adresse. Og et stedsnavn alene («Poliklinikk
            // 2 Nord/Bygg L») sier lite uten sykehuset, så gateadressen tas med dempet.
            // Postnr/poststed kuttes: de gjør linja bred uten å hjelpe operatøren.
            const kortAdr = (a) => String(a || '').split(',')[0].trim();
            const stedTekst = (navn, adr) => navn || kortAdr(adr) || '';
            const stedHtml = (navn, adr) => {
                const n = (navn || '').trim(), a = kortAdr(adr);
                if (!n) return escHtml(a || '(ukjent sted)');
                return escHtml(n) + (a ? ` <span style="color:#64748b;font-size:10px;">${escHtml(a)}</span>` : '');
            };
            const ruteHtml = (fra, til, fraAdr, tilAdr, fallback) => {
                if (!fra && !til && !fraAdr && !tilAdr) return escHtml(fallback || '(ukjent sted)');
                return stedHtml(fra, fraAdr) + '<span style="color:#64748b;"> → </span>' + stedHtml(til, tilAdr);
            };
            // Lange navn kuttes med ellipsis — hele ruta med adresser ligger i tooltipen.
            const ruteTip = (fra, til, fraAdr, tilAdr) => {
                const a = [fra, fraAdr].filter(Boolean).join(', ');
                const b = [til, tilAdr].filter(Boolean).join(', ');
                return (a || b) ? ` title="${escHtml((a || '?') + '  →  ' + (b || '?'))}"` : '';
            };
            const celler = valgt.map(b => {
                const dempet = b.passert;
                const tipTekst = (b.tid ? 'Oppmøte ' + b.tid : '') + (b.hent ? (b.tid ? ' · ' : '') + 'Hentes ' + b.hent : '')
                    + (b.rekNr ? ' · Rekvisisjon ' + b.rekNr : '');
                const tip = tipTekst ? ` title="${escHtml(tipTekst)}"` : '';
                const dim = dempet ? 'opacity:0.5;' : '';
                // v2.138: gult merke når et ben er rekvirert, men ikke bestilt hos transportør.
                // v2.165 (Thomas 21.08): RETUREN FÅR EGEN LINJE. Grupperingen slo tur og retur
                // sammen til én rad, så en pasient som ringte fordi hen ventet på RETUREN så
                // bare turen sin i toasten — og operatøren hadde ingenting å etterlyse ut fra.
                // Returen legges som en tynn underlinje i SAMME grid, så den står i flukt og
                // ikke spiser en av de fem plassene.
                // v2.166 (Thomas 21.08): NISSY-statusen lå allerede i dataene (searchStatus'
                // Status-kolonne, fanget i sokPnrINissy) — vi brukte den bare til å utlede
                // «ikke bestilt» og kastet resten. Nå vises den, så operatøren ser om returen
                // bare er BESTILT eller om en bil faktisk har AKSEPTERT den. «Ny» utelates:
                // den har allerede sitt eget gule merke, og skal ikke stå to ganger.
                const erIDag = fmtDag(b.dato) === 'i dag';
                // v2.168 (Thomas 21.08): når pasienten SITTER I BILEN på returen, er turen
                // dit historie. Begge sto like sterkt før, og operatøren måtte lese seg fram
                // til hvilket ben som var aktuelt. Nå dempes det som er unnagjort, så det
                // pågående benet er det øyet lander på.
                //   aktivt = hentet, men ikke levert  →  pasienten er underveis nå
                // v2.170 (Thomas 21.08): STATUS-kolonnen er fasit for tilstand. Den sier
                // «Ferdig» for turen og «Startet» for returen — rett ut. Jeg utledet det først
                // fra SUTI og bommet, fordi tur-benet sjelden får 1702 (levert) fra
                // transportøren, så turen sto som «i bilen» lenge etter levering.
                // SUTI brukes nå kun til KLOKKESLETT, som Status-kolonnen ikke har.
                const erFerdig  = (st) => /^ferdig/i.test(st || '');
                const erStartet = (st) => /^startet/i.test(st || '');
                const returAktiv = erStartet(b.returStatus);
                // Turen dempes når den er ferdig, ELLER når returen har tatt over.
                const demTur   = dempet || erFerdig(b.turStatus) || returAktiv;
                const demRetur = dempet || erFerdig(b.returStatus);
                const dimTur   = demTur   ? 'opacity:0.45;' : '';
                const dimRetur = demRetur ? 'opacity:0.45;' : '';
                // v2.167: SUTI-hendelsene er mye mer presise enn Status-kolonnen — de sier
                // NÅR bilen var fremme og NÅR pasienten ble hentet. De vises kun for DAGENS
                // turer (Thomas 21.08); for framtidige finnes de ikke, og for gamle er de
                // uinteressante. Faller tilbake til Status-kolonnen når SUTI mangler.
                // `avsluttet` = vi VET at benet er over, selv om SUTI mangler «levert».
                // Tur-benet får sjelden 1702 fra transportøren, så uten dette sto turen som
                // «i bilen fra 08:48» lenge etter at pasienten var levert — mens hun i
                // virkeligheten satt i returbilen (Thomas 21.08). Har returen startet, kan
                // turen per definisjon ikke være pågående.
                const statusHtml = (st, uBestilt, suti) => {
                    const dmp = (t) => ` <span style="color:#64748b;">· ${t}</span>`;
                    if (suti && suti.bomtur) return ` <span style="color:#f87171;font-weight:600;">· ⚠ bomtur</span>`;
                    // v2.174 (Thomas 21.08): «ikke bestilt» lå i rute-kolonnen, men den har
                    // ellipsis for å holde toasten smal — merket ble klippet til en gul flekk
                    // uten tekst. Statuskolonnen har max-content og nowrap, så her får den stå.
                    if (uBestilt || /^ny\b/i.test(st || ''))
                        return ` <span title="Status «Ny» i NISSY — rekvirert, men ikke bestilt hos transportør" style="background:#f59e0b;color:#1e293b;padding:0 5px;border-radius:3px;font-size:9px;font-weight:700;white-space:nowrap;">⚠ ikke bestilt</span>`;
                    if (erFerdig(st))  return dmp('ferdig' + (suti && suti.levert ? ' ' + escHtml(suti.levert) : ''));
                    if (erStartet(st)) return ` <span style="color:#4ade80;font-weight:600;">· i bilen${suti && suti.hentet ? ' fra ' + escHtml(suti.hentet) : ''}</span>`;
                    // Ikke startet ennå, men bilen står og venter — det haster for operatøren.
                    if (erIDag && suti && suti.bilFremme && !suti.hentet)
                        return ` <span style="color:#fbbf24;font-weight:600;">· bil fremme ${escHtml(suti.bilFremme)}</span>`;
                    return st ? dmp(escHtml(st)) : '';
                };
                const turRad =
                       `<span${tip} style="${dimTur}color:${demTur ? '#94a3b8' : '#38bdf8'};font-weight:600;white-space:nowrap;">${escHtml(fmtDag(b.dato))}${b.tid ? ' ' + escHtml(b.tid) : ''}</span>`
                     + `<span${ruteTip(b.turFra, b.turTil, b.turFraAdr, b.turTilAdr)} style="${dimTur}color:#e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ruteHtml(b.turFra, b.turTil, b.turFraAdr, b.turTilAdr, b.sted)}</span>`
                     + `<span${tip} style="${dimTur}color:#94a3b8;white-space:nowrap;">${b.hent ? '🚕 hent ' + escHtml(b.hent) : ''}${statusHtml(b.turStatus, b.uTur, b.turSuti)}</span>`;
                if (!b.harRetur) return turRad;
                // v2.136-lærdommen står: detaljsiden gir ofte SAMME «Pasient klar fra» for
                // begge ben. Er tiden lik turens, er den ikke en returtid — da viser vi at
                // returen finnes, uten å pynte på en tid vi ikke har.
                const returTid = (b.returHent && b.returHent !== b.hent) ? b.returHent : '';
                return turRad
                     + `<span></span>`
                     + `<span${ruteTip(b.returFra, b.returTil, b.returFraAdr, b.returTilAdr)} style="${dimRetur}color:${returAktiv ? '#f8fafc' : '#cbd5e1'};font-weight:${returAktiv ? '600' : '400'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ruteHtml(b.returFra, b.returTil, b.returFraAdr, b.returTilAdr, '')}</span>`
                     + `<span style="${dimRetur}color:#94a3b8;white-space:nowrap;">${returTid ? '🚕 hent ' + escHtml(returTid) : '<span style=\"color:#64748b;\">tid ikke oppgitt</span>'}${statusHtml(b.returStatus, b.uRetur, b.returSuti)}</span>`;
            }).join('');
            el.innerHTML = `<div style="margin-top:5px;padding-left:7px;border-left:2px solid #334155;">
                <div style="font-size:10px;color:#64748b;font-weight:600;letter-spacing:0.3px;margin-bottom:2px;">NÆRMESTE BEHANDLINGER</div>
                <div style="display:grid;grid-template-columns:max-content minmax(0,1fr) max-content;column-gap:10px;row-gap:3px;align-items:baseline;font-size:11px;">${celler}</div></div>`;
        }

        const rader = beriket.map((pas, i) => {
            const pnr = pas.pnr || '';
            const navn = pas.navn || '(uten navn)';
            const alderTxt = pas._alder != null ? `${pas._alder} år` : '';
            let merke = '';
            if (pas._erAnroper) {
                merke = `<span style="background:#f59e0b;color:#1e293b;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;margin-left:6px;">📞 INNRINGER</span>`;
            } else if (flerePasienter && harAnroperTreff) {
                merke = `<span style="background:#475569;color:#e2e8f0;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;margin-left:6px;">👥 TILKNYTTET</span>`;
            }
            // v2.134: behandlingslista lå inne i den SMALE kolonnen ved siden av knappene →
            // sammenpresset tekst + vannrett scrollbar (Thomas 04.08). Nå ligger navn/pnr/adresse
            // + knapper i en egen topprad, og behandlingene får HELE toast-bredden under.
            // min-width:0 på flex-barnet er det som faktisk stopper overflowen.
            return `
                <div style="padding:6px 0;border-top:1px solid #1e293b;${pas._erAnroper ? 'opacity:0.7;' : ''}">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;min-width:0;font-size:12px;">
                            <div style="color:#f8fafc;font-weight:600;">${navn}${merke}</div>
                            <div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap;">
                                <span style="color:#cbd5e1;font-family:monospace;font-size:12px;font-weight:600;">${pnr}</span>
                                ${alderTxt ? `<span style="color:#94a3b8;font-size:11px;">${alderTxt}</span>` : ''}
                                ${pas._kildeTlf ? `<span title="Nummeret som ga treff i NISSY" style="color:#64748b;font-size:10px;">☎ ${formaterTlf(pas._kildeTlf)}</span>` : ''}
                                <span data-vkt-kopier="${pnr}" title="Kopier personnummer" style="cursor:pointer;color:#64748b;line-height:1;padding:1px 4px;border-radius:3px;user-select:none;display:inline-flex;align-items:center;">${KOPI_IKON}</span>
                                <span data-vkt-rekv="${i}" style="font-size:11px;color:#64748b;font-style:italic;">⏳ rekv...</span>
                                <button type="button" data-vkt-frisk="${i}" title="Hent status og behandlinger på nytt fra NISSY"
                                    style="background:none;border:none;color:#64748b;cursor:pointer;font-size:12px;padding:0 2px;line-height:1;">↻</button>
                            </div>
                            <div data-vkt-adr="${i}" style="font-size:11px;color:#f8fafc;margin-top:3px;"></div>
                        </div>
                        <button data-vkt-pas="${i}" data-vkt-modul="rekvisisjon" style="padding:5px 10px;background:#0ea5e9;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Rek</button>
                        <button data-vkt-pas="${i}" data-vkt-modul="planlegging" style="padding:5px 10px;background:#7c3aed;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Plan</button>
                        <button data-vkt-attest="${pnr}" title="Åpne attest-UI + kopier pnr" style="padding:5px 10px;background:#f59e0b;color:white;border:none;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;">Attest</button>
                    </div>
                    <div data-vkt-beh="${i}"></div>
                </div>
            `;
        }).join('');
        // Resten av oppslag-koden under bruker `pasienter` — pek den til den sorterte/berikede lista
        pasienter = beriket;
        resultatEl.innerHTML = `
            <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;font-weight:600;">${pasienter.length} pasient${pasienter.length === 1 ? '' : 'er'} funnet:</div>
            ${rader}
        `;

        // Parallelt rekvisisjons-oppslag for hver pasient (bruker eksisterende sokPnrINissy).
        // v2.172 (Thomas 21.08): trukket ut som egen funksjon så ↻-knappen kan kjøre den
        // om igjen. Statusene er ferskvare — «bil fremme» blir «i bilen» mens samtalen
        // pågår — og før måtte operatøren tilbake til zisson-siden og laste den på nytt.
        const oppdaterPasient = (pas, i) => {
            if (!pas.pnr) return;
            const el = resultatEl.querySelector(`[data-vkt-rekv="${i}"]`);
            return sokPnrINissy(pas.pnr).then(async res => {
                if (!el) return;
                if (res.feil) {
                    el.textContent = '⚠ rekv-feil';
                    el.style.color = '#fbbf24';
                    el.title = res.feil;
                    return;
                }
                // En ATTEST (stående rettighet uten reise) dukker opp i admin-søket, men
                // er IKKE en planlagt tur — rekvisisjon-modulen viser «ingen rekvisisjoner».
                // Skill den fra ekte rekvisisjoner så operatøren ikke tror det finnes en tur.
                //
                // ⚠️ PASSERTE REKVISISJONER TELLES IKKE (Thomas 26.08: «den har vært»).
                //    Badgen sa «3 rekv» mens lista under viste 2 — forskjellen var en retur fra
                //    14.08 som fortsatt sto som «Ny», tolv dager etter. Tallet var teknisk riktig
                //    (admin kjenner den), men svarte på et annet spørsmål enn det operatøren
                //    stiller når telefonen ringer: hva har denne personen FRAMOVER?
                //    Vi bruker samme målestokk som pnr-vakten: alt fra og med i dag teller.
                //    Ukjent dato teller også — da skal vi ikke skjule noe vi ikke forstår.
                //    De passerte forsvinner ikke; de flyttes til tooltipen.
                const alleTurer = Array.isArray(res.turer) ? res.turer : [];
                const _idag = new Date(); _idag.setHours(0, 0, 0, 0);
                const erPassert = (t) => { const ms = vaktTidMs(t); return ms > 0 && ms < _idag.getTime(); };
                const nAttest = alleTurer.filter(t => t && t.er_attest).length;
                const nRekv = alleTurer.filter(t => t && !t.er_attest && !erPassert(t)).length;
                const passerte = alleTurer.filter(t => t && !t.er_attest && erPassert(t));
                const antall = alleTurer.length
                    || (typeof res.antall === 'number' ? res.antall : 0);
                // Tooltip-hale som forklarer hva som er holdt utenfor — ellers ville et tall som
                // ikke stemmer med admin vært umulig å ettergå.
                const passertTekst = passerte.length
                    ? '\n' + passerte.length + ' passert' + (passerte.length > 1 ? 'e' : '')
                      + ' rekvisisjon' + (passerte.length > 1 ? 'er' : '') + ' holdt utenfor: '
                      + passerte.map(t => (vaktKlokke(t) || 'ukjent dato')
                          + (t.status ? ' (' + t.status + ')' : '')).join(', ')
                    : '';
                if (antall === 0) {
                    el.textContent = '· ingen rekv';
                    el.style.color = '#64748b';
                    el.style.fontStyle = '';
                } else if (nRekv === 0 && nAttest === 0) {
                    // Alt som finnes er passert — si det, ikke «ingen rekv».
                    el.textContent = '· ingen kommende';
                    el.style.color = '#64748b';
                    el.style.fontStyle = '';
                    el.title = 'Ingen kommende rekvisisjoner.' + passertTekst;
                } else if (nRekv === 0) {
                    // Kun attest(er) — ingen reell tur.
                    el.textContent = `📄 ${nAttest} attest`;
                    el.style.color = '#fbbf24';
                    el.style.fontStyle = '';
                    el.style.fontWeight = '600';
                    el.title = 'Stående attest — ingen planlagt tur (rekvisisjon-modulen viser «ingen rekvisisjoner»)';
                } else {
                    el.textContent = nAttest > 0
                        ? `📋 ${nRekv} rekv + 📄 ${nAttest} attest`
                        : `📋 ${nRekv} rekv`;
                    el.style.color = '#10b981';
                    el.style.fontStyle = '';
                    el.style.fontWeight = '600';
                    el.title = (nAttest > 0
                        ? `${nRekv} kommende rekvisisjon(er) + ${nAttest} stående attest`
                        : `${nRekv} kommende rekvisisjon(er)`) + passertTekst;
                }
                // ATTEST-REGISTER (autoritativt): rekv-søket fanger IKKE alltid stående attester (eks RAZIJA
                // MESANOVIC: 5 rekv, men aktiv attest i registeret). Når attest-agenten er tilkoblet (grønn prikk),
                // spør vi det EKTE registeret og oppdaterer badgen med reell aktiv-attest-telling. Uten agent:
                // behold rekv-basert deteksjon. Oppgraderer kun (viser attest når aktive>0) — nedgraderer aldri.
                if (attestTabReady) {
                    try {
                        const att = await sjekkAttest(pas.pnr);
                        if (att && !att.feil && !att.error && typeof att.aktive === 'number' && el.isConnected && att.aktive > 0) {
                            el.innerHTML = nRekv > 0
                                ? `📋 ${nRekv} rekv <span style="color:#fbbf24;">+ 📄 ${att.aktive} attest</span>`
                                : `<span style="color:#fbbf24;">📄 ${att.aktive} attest</span>`;
                            el.style.color = nRekv > 0 ? '#10b981' : '#fbbf24';
                            el.style.fontWeight = '600';
                            el.title = `${nRekv} kommende rekvisisjon(er) + ${att.aktive} aktiv attest (fra attest-registeret)` + passertTekst;
                        }
                    } catch (_) {}
                }
                // v2.133: list de fem nærmeste behandlingene (samme data som telleren over).
                const behEl = resultatEl.querySelector(`[data-vkt-beh="${i}"]`);
                if (behEl) { try { tegnBehandlinger(behEl, res.turer); } catch (e) { console.warn('[VERKTØYKASSE] behandlingsliste:', e.message); } }
                // Adresse + «vår pasient?»-varsel.
                // Primært fra rekvisisjonen (pasient_adresse m/ postnr). Mangler den
                // (pasient uten rekv, f.eks. ringer for å bestille) → fall tilbake til
                // FOLKEREGISTER-adressen fra admin editPatient (pas.rediger_url).
                const adrEl = resultatEl.querySelector(`[data-vkt-adr="${i}"]`);
                if (adrEl) {
                    let adr = (res.turer || []).map(t => t && t.pasient_adresse).find(a => a && hentPostnr(a)) || '';
                    let folkereg = false;
                    if (!adr) {
                        const fr = await hentFolkeregisterAdresse(pas.rediger_url);
                        if (fr) { adr = fr; folkereg = true; }
                    }
                    if (adr) {
                        const kildeMerke = folkereg
                            ? ` <span style="color:#64748b;font-size:10px;">(folkereg.)</span>`
                            : '';
                        const vaart = erVaartOmraade(adr);  // true/false/null(ukjent postnr)
                        if (vaart === false) {
                            adrEl.innerHTML = `📍 ${escHtml(adr)}${kildeMerke} <span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;margin-left:4px;">⚠ IKKE VÅRT OMRÅDE</span>`;
                            adrEl.style.color = '#fca5a5';
                            // Hvilket kontor tilhører postnummeret? (nasjonal liste, høstet fra NISSY)
                            hentKjorekontorForPostnr(hentPostnr(adr)).then(kontor => {
                                if (kontor && adrEl.isConnected) adrEl.insertAdjacentHTML('beforeend', ` <span style="color:#fbbf24;font-size:10px;font-weight:600;">→ ${escHtml(kontor)}</span>`);
                            });
                        } else {
                            adrEl.innerHTML = `📍 ${escHtml(adr)}${kildeMerke}`;
                            adrEl.style.color = '#f8fafc';   // samme lyse farge som pasientnavnet (Thomas 2026-07-01)
                        }
                    }
                }
            }).catch(e => {
                if (el) { el.textContent = '⚠'; el.title = e.message; }
            });
            // Auto-attest fjernet — cross-origin Same-Origin Policy gjør auto-injection
            // umulig uten bookmarklet-aktivering på attest-tab. Operatør bruker
            // [Attest]-knappen for manuell oppslag (kopierer pnr + åpner attest-UI).
            // Power-users kan fortsatt aktivere attest-keeper-bookmarklet og kalle
            // sjekkAttest() fra konsollen.
        };
        pasienter.forEach((pas, i) => oppdaterPasient(pas, i));

        // ↻ Oppdater — henter alt på nytt uten å gå veien om zisson-siden.
        resultatEl.querySelectorAll('button[data-vkt-frisk]').forEach(btn => {
            btn.onclick = async () => {
                const i = parseInt(btn.dataset.vktFrisk, 10);
                const pas = pasienter[i];
                if (!pas || !pas.pnr || btn.disabled) return;
                const gammel = btn.innerHTML;
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.innerHTML = '⏳';
                // Pasientside-cachen ville servert gamle SUTI-tider — tøm den for dette
                // nummeret, ellers ser «oppdater» ut til å virke uten å hente noe nytt.
                try { _pasSideCache.clear(); } catch (_) {}
                try { await oppdaterPasient(pas, i); }
                catch (e) { console.warn('[VERKTØYKASSE] oppdater feilet:', e.message); }
                btn.innerHTML = gammel;
                btn.disabled = false;
                btn.style.opacity = '';
            };
        });
        resultatEl.querySelectorAll('button[data-vkt-pas]').forEach(btn => {
            btn.onclick = () => {
                const i = parseInt(btn.dataset.vktPas, 10);
                const modul = btn.dataset.vktModul;
                const pas = pasienter[i];
                if (!pas || !pas.pnr) return;
                utforNissyNaviger({ modul, ssn: pas.pnr });
            };
        });
        resultatEl.querySelectorAll('[data-vkt-kopier]').forEach(el => {
            el.onclick = async () => {
                const pnr = el.dataset.vktKopier;
                try {
                    await navigator.clipboard.writeText(pnr);
                    // v2.137: ikonet er nå SVG — lagre/gjenopprett innerHTML (textContent
                    // ville tømt markupen og etterlatt en blank knapp etter kvitteringen).
                    const orig = el.innerHTML;
                    el.textContent = '✓';
                    el.style.color = '#10b981';
                    setTimeout(() => { el.innerHTML = orig; el.style.color = '#64748b'; }, 1200);
                } catch (e) {
                    console.warn('[VERKTØYKASSE] kopiering feilet:', e);
                }
            };
        });
        // Attest-knapp: åpner attest-UI med pnr som URL-parameter (test om den støtter det)
        // + kopierer pnr til utklippstavle som fallback hvis URL-param ikke virker
        resultatEl.querySelectorAll('[data-vkt-attest]').forEach(btn => {
            btn.onclick = async () => {
                const pnr = btn.dataset.vktAttest;
                try { await navigator.clipboard.writeText(pnr); } catch (_) {}
                window.open(`https://attest-ui.pasientreiser.nhn.no/?foedselsnummer=${encodeURIComponent(pnr)}`, 'nissy-attest');
                const orig = btn.textContent;
                btn.textContent = '✓';
                setTimeout(() => { btn.textContent = orig; }, 1500);
            };
        });
    }

    // === NISSY_NAVIGER — generisk modul-navigering ===
    // Flyt: poll → marker ferdig på server FØR navigering (script dør på nav) →
    // legg autofyll-instruks i sessionStorage → location.href = ny URL →
    // ny side laster verktøykasse via Pinger.js → init plukker opp sessionStorage
    // og fyller ut + submitter skjema.
    const NAVIGER_PENDING_KEY = 'vkt_naviger_pending';

    function ventPaaElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const tick = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return reject(new Error('timeout: ' + selector));
                setTimeout(tick, 100);
            };
            tick();
        });
    }

    // === KEEPER-POPUP ===
    // Åpner en liten popup som re-injiserer verktøykassen i sin opener (NISSY-fanen)
    // hver 0.5 sek hvis flagget mangler. Holder verktøykasse + basic_tools aktive
    // etter F5 — `lastBasicTools` kalles ved hver init av verktøykassen.
    // Samme mønster som dev-keeper-bookmarklet i clipboard.md, men fra menyknapp.
    function apneKeeperPopup(opts) {
        opts = opts || {};
        const popupName = ER_DEV ? 'verktoykasse_dev_keeper' : 'verktoykasse_keeper';
        const filNavn   = ER_DEV ? 'verktoykasse_dev.js' : 'verktoykasse.js';
        const flagNavn  = ER_DEV ? '__westbyVerktoykasse_dev' : '__westbyVerktoykasse';
        const tittel    = ER_DEV ? 'Verktøykasse DEV keeper' : 'Verktøykasse keeper';
        // v2.190 (Thomas 21.08): tilbake til opprinnelig størrelse. Kolonneformatet ble
        // prøvd og forkastet — nettleseren husker uansett den størrelsen operatøren selv
        // drar den til, så vi skal ikke overstyre den ved hver åpning.
        const w = window.open('about:blank', popupName, 'width=340,height=270');
        window.__vkt_keeperWin = w;
        if (!w) {
            // Auto-åpning: ikke forstyrr med alert hvis nettleseren blokkerer.
            if (opts.auto) console.warn('[VERKTØYKASSE] keeper-popup blokkert (auto) — bruk menyknappen.');
            else alert('Popup blokkert — tillat popups for dette domenet og prøv igjen');
            return;
        }
        // Auto-åpning skal ikke stjele fokus fra NISSY.
        if (!opts.auto) { try { w.focus(); } catch (_) {} }
        // Hvis popup er allerede åpen og initialisert: bare gi den fokus
        try {
            if (w.__vkt_keeper_initialized) return;
        } catch (_) {}
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>${tittel}</title>
<style>html,body{height:100%;margin:0}body{display:flex;flex-direction:column;font-family:-apple-system,sans-serif;background:#1e293b;color:#e2e8f0}#top{flex:1;display:flex;align-items:center;justify-content:center;gap:14px;transition:all .15s}#i{width:42px;height:42px;display:flex;align-items:center;justify-content:center;transition:all .15s}#i svg{width:100%;height:100%;fill:currentColor}#s{font-size:32px;font-weight:700;letter-spacing:1px;transition:font-size .15s}body.vakt #top{flex:0 0 auto;justify-content:flex-start;gap:7px;padding:7px 10px 5px;border-bottom:1px solid #334155}body.vakt #i{width:16px;height:16px}body.vakt #s{font-size:13px;letter-spacing:.5px}body.vakt #dev{font-size:9px;padding:1px 5px}#vakt{display:none;flex:1;overflow-y:auto;padding:6px 8px}body.vakt #vakt{display:block}.v{padding:6px 7px;margin-bottom:5px;background:#0f172a;border:1px solid #334155;border-radius:6px;position:relative}.v .n{font-size:12px;font-weight:600;color:#f8fafc;padding-right:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v .nr{font-size:10px;color:#64748b;font-family:ui-monospace,Menlo,Consolas,monospace;margin-top:1px;cursor:pointer;display:inline-block}.v .nr:hover{color:#93c5fd}.v .r{font-size:10px;color:#94a3b8;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v .t{font-size:11px;font-weight:600;margin-top:3px}.v .tur{margin-top:5px;padding-left:6px;border-left:2px solid #334155}.v .tur .k{font-size:10px;color:#38bdf8;font-weight:600}.v .tur .rr{font-size:10px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v .tur .s{font-size:11px;font-weight:600;margin-top:1px}.v .x{position:absolute;top:4px;right:5px;color:#475569;cursor:pointer;font-size:13px;line-height:1;background:none;border:none;padding:0}.v .x:hover{color:#f87171}#add{width:100%;padding:5px;margin-top:2px;background:#0f172a;color:#94a3b8;border:1px dashed #334155;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit}#add:hover{color:#e2e8f0;border-color:#475569}${ER_DEV ? '#dev{margin-left:8px;background:#fbbf24;color:#451a03;font-weight:700;font-size:11px;letter-spacing:1px;padding:2px 8px;border-radius:4px}' : ''}#inn{display:flex;padding:7px 8px 0}#inn input{width:100%;box-sizing:border-box;padding:6px 8px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:6px;font-size:11px;font-family:inherit;outline:none;transition:border-color .12s}#inn input:focus{border-color:#3b82f6}#inn input.feil{border-color:#f87171}#inn input::placeholder{color:#64748b}#bar{display:flex;gap:6px;padding:8px;border-top:1px solid #334155}#bar button{flex:1;padding:8px 4px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit;transition:background .1s}#bar button:hover{background:#334155}</style>
</head><body>
<div id="top"><div id="i"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
<div id="s">…</div>${ER_DEV ? '<div id="dev">DEV</div>' : ''}</div>
<div id="vakt"></div>
<div id="inn"><input id="nytt" type="text" autocomplete="off" placeholder="👁 Overvåk — rekvisisjonsnr, turnr eller personnr"></div>
<div id="bar"><button data-m="admin">⚙️ Admin</button><button data-m="rekvisisjon">📝 Rekvisisjon</button><button data-m="attest">📋 Attest</button></div>
<script>
Array.prototype.forEach.call(document.querySelectorAll('#bar button'),function(b){b.onclick=function(){try{if(window.opener&&!window.opener.closed&&window.opener.__vkt_launch)window.opener.__vkt_launch(b.getAttribute('data-m'));}catch(e){}};});
window.__vkt_keeper_initialized = true;
var FIL = ${JSON.stringify(filNavn)};
var FLAG = ${JSON.stringify(flagNavn)};
var ER_DEV_KEEPER = ${ER_DEV ? 'true' : 'false'};
try {
  var Ctx = window.AudioContext || window.webkitAudioContext;
  if (Ctx) {
    var ctx = new Ctx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
  }
} catch (e) {}
var s = document.getElementById('s');
var i = document.getElementById('i');
function status(){
  if(!window.opener||window.opener.closed){s.textContent='Ikke aktiv';s.style.color='#ef4444';i.style.color='#ef4444';return false;}
  s.textContent='Aktiv';s.style.color='#10b981';i.style.color='#10b981';return true;
}
function inj(){try{if(!status())return;if(window.opener[FLAG])return;var e=window.opener.__vkt_eier;if(!ER_DEV_KEEPER&&e&&e.dev)return;/* prod-keeper viker for dev-eier — hindrer spøkelses-re-injeksjon */var sc=window.opener.document.createElement("script");sc.src="https://thomaswestby.no/skript/skript.php?fil="+FIL+"&_="+Date.now();window.opener.document.head.appendChild(sc);}catch(e){}}
var hooked=false;
function hookOpener(){if(hooked)return;try{if(!window.opener||window.opener.closed)return;window.opener.addEventListener("pageshow",inj);window.opener.addEventListener("focus",inj);hooked=true;}catch(e){}}
function hjerteslag(){try{if(window.opener&&!window.opener.closed)window.opener.__vkt_keeper_alive=Date.now();}catch(e){}}
// v2.178: popupen viser vaktlista. Den gjør INGEN oppslag selv — planleggeren eier
// NISSY-sesjonen og fyller window.opener.__vkt_vakt; her tegnes den bare.
var vaktEl = document.getElementById('vakt');
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
// pnr-vakt viser ALLE aktive turer (ikke ferdig, ikke fra en tidligere dato).
function turerHtml(v){
  if(!v.turer || !v.turer.length) return '';
  var ut = '';
  for(var q=0;q<v.turer.length;q++){
    var t = v.turer[q];
    ut += '<div class="tur">'
        + '<div class="k">'+esc(t.naar||'')+'</div>'
        + (t.rute ? '<div class="rr">'+esc(t.rute)+'</div>' : '')
        + '<div class="s" style="color:'+esc(t.farge||'#94a3b8')+'">'+esc(t.tilstand||'…')
        + (t.hent ? ' <span style="color:#64748b;font-weight:400;">· hent '+esc(t.hent)+'</span>' : '')
        + '</div></div>';
  }
  return ut;
}
function tegnVakt(){
  if(!vaktEl){ vaktEl = document.getElementById('vakt'); if(!vaktEl) return; }
  var liste = [];
  try { liste = (window.opener && !window.opener.closed && window.opener.__vkt_vakt) || []; } catch(e){ liste = []; }
  if(document.body) document.body.classList.toggle('vakt', liste.length > 0);
  if(!liste.length){ vaktEl.innerHTML=''; return; }
  var h = '';
  for(var k=0;k<liste.length;k++){
    var v = liste[k];
    var merke = v.type==='rek' ? 'Rekv' : (v.type==='tur' ? 'Tur' : 'Pnr');
    h += '<div class="v"><button class="x" data-x="'+esc(v.nokkel)+'" title="Slutt å overvåke">×</button>'
       + '<div class="n">'+esc(v.navn || (merke+' '+v.nokkel))
       + (v.turer && v.turer.length ? ' <span style="color:#64748b;font-weight:400;font-size:10px;">'+v.turer.length+' aktive</span>' : '')
       + '</div>'
       + '<div class="nr" data-kopi="'+esc(v.nokkel)+'" title="Klikk for å kopiere — bruk den i admin">'+esc(merke)+' '+esc(v.nokkel)+'</div>'
       + ((v.naar || v.rute) ? '<div class="r">'+(v.naar ? '<span style="color:#38bdf8;">'+esc(v.naar)+'</span>' : '')
           + (v.naar && v.rute ? ' · ' : '') + esc(v.rute||'')+'</div>' : '')
       + turerHtml(v)
       + (v.tilstand ? '<div class="t" style="color:'+esc(v.farge||'#94a3b8')+'">'+esc(v.tilstand)
          + (v.hent ? ' <span style="color:#64748b;font-weight:400;">· hent '+esc(v.hent)+'</span>' : '')
          + '</div>' : '')
       + '</div>';
  }
  vaktEl.innerHTML = h;
}
function knyttVaktKnapper(e){
  var x = e.target.getAttribute && e.target.getAttribute('data-x');
  if(x){ try{ window.opener.__vkt_avslutt_vakt(x); }catch(err){} tegnVakt(); return; }
  var kop = e.target.getAttribute && e.target.getAttribute('data-kopi');
  if(kop){
    var vis = e.target;
    var org = vis.textContent;
    try {
      navigator.clipboard.writeText(kop).then(function(){
        vis.textContent = '✓ kopiert'; setTimeout(function(){ vis.textContent = org; }, 1200);
      });
    } catch(err){}
    return;
  }

}
// Inline felt i stedet for prompt(): en modal dialog fryser ALT JS i popupen mens
// den står åpen — inkludert keeper-pulsen hvert 0,5 sek (Thomas 21.08).
var nyttEl = document.getElementById('nytt');
function blink(ok, tekst){
  if(!nyttEl) return;
  nyttEl.classList.toggle('feil', !ok);
  if(tekst){ nyttEl.placeholder = tekst; setTimeout(function(){ nyttEl.placeholder='👁 Overvåk — rekvisisjonsnr, turnr eller personnr'; nyttEl.classList.remove('feil'); }, 2500); }
}
function leggTilVakt(){
  if(!nyttEl) return;
  var n = (nyttEl.value||'').trim();
  if(!n) return;
  try {
    if(!window.opener || window.opener.closed || !window.opener.__vkt_overvaak){ blink(false,'Planleggeren er ikke tilgjengelig'); return; }
    if(window.opener.__vkt_overvaak(n) === false){ blink(false,'Forstår ikke «'+n+'» — 8, 11 eller 12 siffer'); return; }
    nyttEl.value=''; blink(true);
  } catch(err){ blink(false,'Nådde ikke planleggeren'); }
  tegnVakt();
}
if(nyttEl){ nyttEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); leggTilVakt(); } }); }
// Keeperen er kritisk (holder verktøykassen i live). Vaktlista er et TILLEGG og må
// aldri kunne ta den ned — derfor status/inj først, og alt vakt-relatert i try/catch.
hjerteslag();
inj();
hookOpener();
status();
setInterval(function(){hookOpener();inj();status();hjerteslag();},500);
try {
  document.addEventListener('click', knyttVaktKnapper);
  setInterval(function(){ try{ tegnVakt(); }catch(e){} }, 2000);
  tegnVakt();
} catch(e) { try{ console.warn('[keeper] vaktliste feilet:', e && e.message); }catch(_){} }
window.addEventListener("focus",inj);
document.addEventListener("visibilitychange",inj);
</script>
</body></html>`;
        w.document.write(html);
        w.document.close();
    }

    // Auto-åpne keeper-popupen ved oppstart — men kun hvis ingen allerede er i live.
    // Keeperen overlever F5 og setter __vkt_keeper_alive på opener hvert 0.5 sek. Etter
    // F5 re-injiseres verktøykassen og init kjører på nytt; da skal vi IKKE åpne en ny
    // popup (eller stjele fokus). Vi venter litt så en levende keeper rekker å pulse inn.
    function autoApneKeeper() {
        setTimeout(() => {
            const alive = window.__vkt_keeper_alive;
            if (alive && (Date.now() - alive) < 3000) {
                console.log('[VERKTØYKASSE] keeper allerede aktiv — auto-åpner ikke ny popup');
                return;
            }
            apneKeeperPopup({ auto: true });
        }, 1500);
    }

    // Injiser et agent-skript i et åpent (same-origin) vindu.
    // KRITISK: vent til pathname matcher pathPrefix — ellers injiserer vi i about:blank
    // før navigeringen er ferdig, og agenten kjører med null-origin → CORS-feil.
    // Husker hvilke agenter vi allerede har meldt «annen origin» for, så meldingen kommer én
    // gang og ikke ved hvert 300 ms-forsøk. Nullstilles når injiseringen faktisk lykkes.
    const _kryssMeldt = new Set();
    function injiserAgent(w, filnavn, flagName, pathPrefix) {
        if (!w || w.closed) return false;
        try {
            if (w[flagName]) return true;  // allerede lastet
            if (!w.document || !w.document.head) return false;  // ikke klar ennå
            const path = (w.location && w.location.pathname) || '';
            if (pathPrefix && !path.startsWith(pathPrefix)) return false;  // about:blank eller feil path
            const s = w.document.createElement('script');
            s.src = 'https://thomaswestby.no/skript/skript.php?fil=' + filnavn + '&_=' + Date.now();
            w.document.head.appendChild(s);
            console.log(`[VERKTØYKASSE] injiserte ${filnavn} i ${path}`);
            _kryssMeldt.delete(filnavn);      // fanen er tilbake hos oss — meld på nytt neste gang
            return true;
        } catch (e) {
            // ⚠️ KRYSS-OPPRINNELSE ER EN FORVENTET TILSTAND, IKKE EN FEIL (Thomas 26.08).
            //    Attest-flyten starter på pastrans og navigerer videre til attest-ui, som er en
            //    annen origin. Da kaster ethvert oppslag mot w[flag] en SecurityError — hver
            //    eneste runde, hvert 300. ms, i alle overvåkede faner. Konsollen fylles med
            //    «feil» mens alt virker som det skal (attest-agenten meldte seg klar i samme logg).
            //    Vi venter bare til fanen kommer TILBAKE til vår origin; det er hele poenget med
            //    å gå via startAttest. Logges én gang per fane, ikke per forsøk.
            const kryss = (e && (e.name === 'SecurityError' || /cross-origin/i.test(e.message || '')));
            if (kryss) {
                if (!_kryssMeldt.has(filnavn)) {
                    _kryssMeldt.add(filnavn);
                    console.log(`[VERKTØYKASSE] ${filnavn}: fanen er på en annen origin — venter på retur`);
                }
                return false;
            }
            console.warn(`[VERKTØYKASSE] kunne ikke injisere ${filnavn}:`, e.message);
            return false;
        }
    }

    // Vent til tab er klar (pathPrefix matcher), så injiser. Polling hver 300ms.
    async function injiserAgentNårKlar(w, filnavn, flagName, pathPrefix, maks = 20000) {
        const start = Date.now();
        while (Date.now() - start < maks) {
            if (!w || w.closed) return false;
            if (injiserAgent(w, filnavn, flagName, pathPrefix)) return true;
            await new Promise(r => setTimeout(r, 300));
        }
        // Står fanen på en annen origin, er «timeout» forventet — attest-flyten kan bli der
        // lenge. Da er det ikke noe å varsle om; keeperen fortsetter å følge med.
        if (_kryssMeldt.has(filnavn)) return false;
        console.warn(`[VERKTØYKASSE] injiserAgent timeout for ${filnavn}`);
        return false;
    }

    // Periodisk keeper — re-injiser agent hvis tab F5'er og mister flag.
    // Bruker LAGRET window-referanse (overlever F5 i target-tab).
    const overvåkedeTaber = new Map();  // name → {w, url, filnavn, flagName, pathPrefix}
    function holdTabLevende(w, name, url, filnavn, flagName, pathPrefix) {
        overvåkedeTaber.set(name, { w, url, filnavn, flagName, pathPrefix });
    }
    // Eksponert callback: agenter i barn-faner kaller denne ved oppstart for å
    // re-registrere seg i Map. Slik overlever keeper-tilstand F5 i planlegger:
    // når dev re-lastes, vil agenten i rek-fanen ringe inn og fylle Map igjen.
    window.__vkt_registerAgentTab = function(w, filnavn, flagName, pathPrefix) {
        if (!w || w.closed) return;
        let name = '';
        try { name = w.name || ''; } catch (_) {}
        if (!name) return;
        const fersk = !overvåkedeTaber.has(name);
        let url = '';
        try { url = w.location.href || ''; } catch (_) {}
        overvåkedeTaber.set(name, { w, url, filnavn, flagName, pathPrefix });
        if (fersk) console.log(`[VERKTØYKASSE] agent registrerte seg: ${name} (${filnavn})`);
    };
    // Diagnose: keeperens tilstand er en lukket variabel, så uten dette er «hvorfor kom ikke
    // agenten tilbake» umulig å svare på fra konsollen. Skiller de tre kandidatene fra hverandre:
    // fanen står ikke i Map (ble aldri fanget), timeren strupes (skjult vindu), eller
    // innskytingen kjører men slår feil.
    const reinjiserPågår = new Set();
    window.__vkt_keeperStatus = function () {
        const ut = [];
        for (const [name, i] of overvåkedeTaber) {
            let lukket = null, path = '?', flagg = null;
            try { lukket = !!(i.w && i.w.closed); } catch (_) {}
            try { path = i.w.location.pathname; } catch (_) {}
            try { flagg = !!i.w[i.flagName]; } catch (e) { flagg = 'utilgjengelig'; }
            ut.push({ navn: name, fil: i.filnavn, flagg: i.flagName, flaggSatt: flagg,
                      path: path, lukket: lukket, reinjiserPågår: reinjiserPågår.has(name) });
        }
        console.log('[KEEPER] planlegger visibilityState =', document.visibilityState,
                    '| overvåkede faner:', ut.length);
        console.table(ut);
        return ut;
    };

    // ⚠️ KLOKKA ER PROBLEMET, IKKE SVEIPEN (Thomas 27.08: «keeper bruker fryktelig lang tid på å
    //    loade skript i rekvisisjonsmodulen — sikkert 30 sekunder»). Keeperen bodde i en
    //    setInterval i PLANLEGGERVINDUET, og mens operatøren jobber i rekvisisjons-popupen ligger
    //    planleggeren bak. Chrome budsjett-struper timere i vinduer den regner som skjulte, så et
    //    2-sekunders intervall kan bli titalls sekunder. Symptomet stemte: agenten kom tilbake
    //    med én gang man byttet til planleggeren — vinduet ble synlig og timeren løp normalt igjen.
    //
    //    En Worker strupes ikke likt: den lever i sin egen tråd, og meldingene den sender kjører
    //    i siden selv om vinduet er skjult. Vi bytter altså BARE taktgiveren; sveipen er den samme.
    //
    // ⚠️ Innskytingen gjøres nå DIREKTE, ett forsøk per tikk, i stedet for å starte en intern
    //    300 ms-løkke. Den løkka var også en timer i det samme skjulte vinduet, så den arvet
    //    nøyaktig samme struping — å fikse klokka uten å fikse løkka hadde vært halve jobben.
    //    injiserAgent er idempotent (sjekker flagget først), så gjentatte forsøk er gratis.
    function keeperSveip() {
        for (const [name, info] of overvåkedeTaber) {
            try {
                if (!info.w || info.w.closed) {
                    console.log(`[VERKTØYKASSE keeper] ${name}: lukket, fjerner`);
                    overvåkedeTaber.delete(name);
                    reinjiserPågår.delete(name);
                    continue;
                }
                let flagSet = false;
                try { flagSet = !!info.w[info.flagName]; } catch (_) {}
                if (flagSet) continue;
                if (injiserAgent(info.w, info.filnavn, info.flagName, info.pathPrefix)) {
                    console.log(`[VERKTØYKASSE keeper] ${name}: agent gjeninnsatt`);
                }
            } catch (e) {
                console.warn(`[VERKTØYKASSE keeper] ${name}: feil`, e);
            }
        }
    }

    setInterval(keeperSveip, 2000);          // beholdes: virker når vinduet er synlig

    // Worker-taktgiver. Faller stille tilbake til intervallet over hvis blob-workere er sperret
    // av CSP — da er vi ikke dårligere stilt enn før.
    (function keeperWorkerTakt() {
        try {
            const kode = 'setInterval(function(){ postMessage(1); }, 1000);';
            const url = URL.createObjectURL(new Blob([kode], { type: 'application/javascript' }));
            const w = new Worker(url);
            w.onmessage = keeperSveip;
            console.log('[VERKTØYKASSE keeper] taktgiver: Worker (1s, strupes ikke i skjult vindu)');
        } catch (e) {
            console.log('[VERKTØYKASSE keeper] taktgiver: setInterval — Worker utilgjengelig ('
                + ((e && e.message) || e) + ')');
        }
    })();

    // Auto-fang popups som NISSY åpner SELV: verktøykassen injiserer raskt kun i vinduer den selv
    // åpner (Rekvisisjon-snarvei / auto-naviger). Et /rekvisisjon/- eller /administrasjon/-popup NISSY
    // åpner på egenhånd falt utenfor → fikk agenten først ved neste trege keeper-runde (~20s). Vi
    // patcher window.open (transparent wrapper) så ALLE slike vinduer registreres + får rask innskyting.
    (function patchWindowOpen() {
        if (window.__vkt_openPatched) return;
        const origOpen = window.open.bind(window);
        window.open = function (url, name, features) {
            const w = origOpen(url, name, features);
            try {
                const u = String(url || '');
                let agent = null;
                if (/\/rekvisisjon\//.test(u)) agent = {
                    fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js',
                    flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent',
                    prefix: '/rekvisisjon/'
                };
                else if (/\/administrasjon\//.test(u)) agent = {
                    fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js',
                    flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent',
                    prefix: '/administrasjon/'
                };
                if (w && agent) {
                    let tabName = name || u;
                    try { tabName = w.name || name || u; } catch (_) {}
                    injiserAgentNårKlar(w, agent.fil, agent.flag, agent.prefix);
                    holdTabLevende(w, tabName, u, agent.fil, agent.flag, agent.prefix);
                    console.log(`[VERKTØYKASSE] fanget NISSY-popup (${agent.prefix}) → rask innskyting`);
                }
            } catch (_) {}
            return w;
        };
        window.__vkt_openPatched = true;
    })();

    // Launcher brukt av keeper-popupens knapper (kalt som window.opener.__vkt_launch(modul)).
    // Åpner NISSY-siden via vår patchede window.open (→ auto-injisering) + registrerer i keeperen.
    // Samme mekanikk som skjold-snarveiene. attest går via startAttest (samme origin); selve
    // nissy6-sluttsiden av attest-flyten må fortsatt få agenten via bookmarklet-klikk (cross-origin).
    window.__vkt_launch = function (modul) {
        let url, agent;
        if (modul === 'admin') {
            url = ADMIN_URL;
            agent = { tabName: ER_DEV ? 'nissy-admin-dev' : 'nissy-admin', fil: ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js', flag: ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent', prefix: '/administrasjon/' };
        } else if (modul === 'attest') {
            url = NISSY_ORIGIN + '/rekvisisjon/requisition/startAttest';
            agent = { tabName: ER_DEV ? 'nissy-attest-dev' : 'nissy-attest', fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js', flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent', prefix: '/rekvisisjon/' };
        } else {  // rekvisisjon
            url = REK_URL;
            agent = { tabName: ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon', fil: ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js', flag: ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent', prefix: '/rekvisisjon/' };
        }
        const w = window.open(url, agent.tabName);
        if (!w) return null;
        try { w.focus(); } catch (_) {}
        injiserAgentNårKlar(w, agent.fil, agent.flag, agent.prefix);
        holdTabLevende(w, agent.tabName, url, agent.fil, agent.flag, agent.prefix);
        return w;
    };

    function utforNissyNaviger(parametre) {
        switch (parametre.modul) {
            case 'rekvisisjon': {
                // Åpne tab + injiser headless agent som tar seg av autofyll og fungerer
                // som mutual keeper for planlegger-verktøykassen.
                const url = NISSY_ORIGIN + '/rekvisisjon/requisition/confirmGetRequisition';
                const tabName = ER_DEV ? 'nissy-rekvisisjon-dev' : 'nissy-rekvisisjon';
                const fil = ER_DEV ? 'verktoykasse_rekvisisjon_dev.js' : 'verktoykasse_rekvisisjon.js';
                const flag = ER_DEV ? '__vkt_rekvisisjon_dev_agent' : '__vkt_rekvisisjon_agent';
                const w = window.open(url, tabName);
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                injiserAgentNårKlar(w, fil, flag, '/rekvisisjon/');
                holdTabLevende(w, tabName, url, fil, flag, '/rekvisisjon/');
                if (!parametre.ssn) return;
                // Fyll #ssn + klikk #query_by_ssn (det er fire søkeskjemaer på siden,
                // vi må treffe det for "Pasient, fødselsnummer")
                const start = Date.now();
                const iv = setInterval(() => {
                    if (Date.now() - start > 15000) { clearInterval(iv); console.warn('[VERKTØYKASSE] timeout: ssn-felt aldri klart'); return; }
                    try {
                        if (w.closed) { clearInterval(iv); return; }
                        const doc = w.document;
                        if (!doc) return;
                        const el = doc.getElementById('ssn');
                        if (!el) return;
                        clearInterval(iv);
                        el.value = parametre.ssn;
                        el.dispatchEvent(new w.Event('input',  { bubbles: true }));
                        el.dispatchEvent(new w.Event('change', { bubbles: true }));
                        const btn = doc.getElementById('query_by_ssn');
                        if (btn) btn.click();
                        else {
                            const form = el.closest('form');
                            if (form) form.submit();
                        }
                        console.log(`[VERKTØYKASSE] rekvisisjon fylt: ssn=${parametre.ssn}`);
                    } catch (_) { /* ikke ferdig lastet — prøv igjen */ }
                }, 200);
                return;
            }
            case 'admin': {
                // Triangel-keeper: åpne admin-tab + injiser headless agent.
                // Ingen admin-jobber er definert ennå, men keeperen holder mesh-en levende.
                const url = ADMIN_URL;
                const tabName = ER_DEV ? 'nissy-admin-dev' : 'nissy-admin';
                const fil = ER_DEV ? 'verktoykasse_admin_dev.js' : 'verktoykasse_admin.js';
                const flag = ER_DEV ? '__vkt_admin_dev_agent' : '__vkt_admin_agent';
                const w = window.open(url, tabName);
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                injiserAgentNårKlar(w, fil, flag, '/administrasjon/');
                holdTabLevende(w, tabName, url, fil, flag, '/administrasjon/');
                return;
            }
            case 'planlegging': {
                if (!parametre.ssn) return;
                // Planlegger-søket tar pnr direkte (uten "ssn:"-prefix)
                const sokeStreng = parametre.ssn;
                // Hvis vi ER på planlegging, fyll i nåværende vindu i stedet for å åpne ny tab.
                const fyllSokeFelt = (vindu) => {
                    const doc = vindu.document;
                    if (!doc) return false;
                    const el = doc.getElementById('searchPhrase');
                    if (!el) return false;
                    // Sett søketype til "Personnummer" (ssn) — uten dette søker den på "Navn"
                    const typeEl = doc.getElementById('searchType');
                    if (typeEl) {
                        typeEl.value = 'ssn';
                        typeEl.dispatchEvent(new vindu.Event('change', { bubbles: true }));
                    }
                    el.focus();
                    el.value = sokeStreng;
                    el.dispatchEvent(new vindu.Event('input', { bubbles: true }));
                    el.dispatchEvent(new vindu.Event('change', { bubbles: true }));
                    const btn = doc.getElementById('buttonSearch');
                    if (btn) btn.click();
                    else {
                        ['keydown', 'keypress', 'keyup'].forEach(type => {
                            try {
                                el.dispatchEvent(new vindu.KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                            } catch (_) {}
                        });
                    }
                    console.log(`[VERKTØYKASSE] planlegging søk: type=ssn phrase="${sokeStreng}"`);
                    return true;
                };
                if (/\/planlegging\//.test(location.pathname)) {
                    // Vi er allerede på planlegging — søk inline uten ny tab
                    if (fyllSokeFelt(window)) return;
                }
                // Ellers (eller hvis inline-fylling feilet): åpne ny tab
                const url = NISSY_ORIGIN + '/planlegging/';
                const w = window.open(url, 'nissy-planlegging');
                if (!w) throw new Error('popup blokkert');
                try { w.focus(); } catch (_) {}
                const start = Date.now();
                const iv = setInterval(() => {
                    if (Date.now() - start > 15000) { clearInterval(iv); console.warn('[VERKTØYKASSE] timeout: planlegging søke-input ikke funnet'); return; }
                    try {
                        if (w.closed) { clearInterval(iv); return; }
                        if (fyllSokeFelt(w)) clearInterval(iv);
                    } catch (_) { /* ikke ferdig lastet */ }
                }, 200);
                return;
            }
            case 'attestasjon':
                throw new Error('attestasjon-modul ikke implementert ennå');
            default:
                throw new Error('Ukjent modul: ' + parametre.modul);
        }
    }

    // Fortsetter navigerings-flyten på den nye siden — fyller felt og submitter skjema.
    // Leser fra localStorage (cross-tab), bare hvis vi er på rekvisisjons-domenet.
    async function sjekkNavigerEtterLoad() {
        // Bare relevant hvis vi er på en rekvisisjons-side
        if (!/\/rekvisisjon\//.test(location.pathname)) return;
        let raa;
        try { raa = localStorage.getItem(NAVIGER_PENDING_KEY); } catch (_) { return; }
        if (!raa) return;
        let parametre;
        try { parametre = JSON.parse(raa); } catch (_) { return; }
        try { localStorage.removeItem(NAVIGER_PENDING_KEY); } catch (_) {}
        try {
            if (parametre.modul === 'rekvisisjon' && parametre.ssn) {
                const el = await ventPaaElement('#ssn', 5000);
                el.value = parametre.ssn;
                const form = el.closest('form') || document.querySelector('form');
                if (form) form.submit();
                console.log(`[VERKTØYKASSE] navigering ferdig: ssn=${parametre.ssn} fylt inn og submittet`);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] post-navigering feil:', e.message);
        }
    }

    async function pollNissyNavigerVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        if (adminStatus !== 'ok') return;
        const nissy = hentNissyBrukernavn();
        if (!nissy) return;
        try {
            const r = await fetch(`${JOBS_URL}?handling=nissy_naviger_pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.oppslag) || d.oppslag.length === 0) return;
            // Bare prosesser ÉN navigering om gangen — den endrer URL og dreper scriptet
            const o = d.oppslag[0];
            const parametre = o.parametre || {};
            console.log(`[VERKTØYKASSE] nissy_naviger ${o.id}:`, parametre);
            try {
                // Marker ferdig FØR navigering så jobben ikke plukkes opp på nytt
                const fd = new FormData();
                fd.append('id', o.id);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                // utforNissyNaviger setter localStorage og åpner navngitt vindu
                utforNissyNaviger(parametre);
            } catch (e) {
                const fd = new FormData();
                fd.append('id', o.id);
                fd.append('feil', e.message);
                await fetch(`${JOBS_URL}?handling=nissy_naviger_svar`, { method: 'POST', body: fd });
                console.warn('[VERKTØYKASSE] nissy_naviger feilet:', e.message);
            }
        } catch (e) {
            console.warn('[VERKTØYKASSE] nissy_naviger-poll feil:', e.message);
        }
    }

    async function sendSvarTilServer(anropId, data) {
        try {
            const fd = new FormData();
            fd.append('id', anropId);
            fd.append('data', JSON.stringify(data));
            const r = await fetch(`${JOBS_URL}?handling=svar`, { method: 'POST', body: fd });
            return await r.json();
        } catch(e) {
            console.warn('[VERKTØYKASSE] sendSvar feilet:', e.message);
            return { ok: false, feil: e.message };
        }
    }

    async function pollVentende() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller
        // Hopper over hvis admin ikke er innlogget
        if (adminStatus !== 'ok') return;
        try {
            const nissy = hentNissyBrukernavn();
            if (!nissy) return;
            const r = await fetch(`${JOBS_URL}?handling=pending&nissy=${encodeURIComponent(nissy)}`);
            const d = await r.json();
            if (!d.ok || !Array.isArray(d.anrop)) return;

            oppdaterBadge(d.anrop.length);
            if (d.anrop.length === 0) return;

            console.log(`[VERKTØYKASSE] ${d.anrop.length} ventende turid(er) — henter fra admin ...`);

            // Behandle hver pending én etter én (sekvensielt for å unngå rate-limit)
            for (const a of d.anrop) {
                const data = await hentTurDetaljer(a.turid);
                if (!data || data.feil) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}:`, data && data.feil);
                    continue;
                }
                // Parsing må ha gitt minst ÉN rekvisisjon med fornuftig innhold
                const harData = Array.isArray(data.rekvisisjoner) && data.rekvisisjoner.some(r =>
                    r.fra_adresse || r.til_adresse || r.rek_nr || r.pasient_navn
                );
                if (!harData) {
                    console.warn(`[VERKTØYKASSE] ✗ Tur ${a.turid}: ingen data funnet i respons (hopper over — blir værende pending)`);
                    continue;
                }
                const sammendrag = data.rekvisisjoner.map(r => `${r.fra_navn || '?'} → ${r.til_navn || '?'}`).join(' | ');
                console.log(`[VERKTØYKASSE] ✓ Tur ${a.turid} (${data.rekvisisjoner.length} rekv): ${sammendrag}`);
                await sendSvarTilServer(a.id, data);
            }

        } catch(e) {
            console.warn('[VERKTØYKASSE] Poll-feil:', e.message);
        }
    }


    // Eksponert API for konsoll-debug og manuell testing
    window[ER_DEV ? '__verktoykasseDev' : '__verktoykasse'] = {
        versjon: VERSJON,
        utforNissyNaviger,
        sjekkNavigerEtterLoad,
        pollNissyNaviger: pollNissyNavigerVentende,
        sokTlfINissy,
        sokPnrINissy,
        hentBehandlingssted,
        // Manuell høsting av behandlingssted-registeret: __verktoykasseDev.host()
        host: hostBehandlingssteder,
        // Reparasjon av hull etter 500-barns-grensen. KJØR testParentSok FØRST — den
        // svarer på om region spiller noen rolle, og hvor mye vi faktisk mangler.
        //   __verktoykasseDev.testParentSok(11574)
        //   __verktoykasseDev.reparer()   ·   __vkt_reparerStopp = true for å avbryte
        testParentSok,
        reparer: reparerRegisteret,
        // ID-feiing — den veien som ikke er avhengig av søkefunksjonene:
        //   __verktoykasseDev.fyllHull()  ·  __vkt_feieStopp = true for å avbryte
        fyllHull,
        hentTurDetaljer,
        hentTurDetaljerViaRekvnr,
        hentRekvisisjon,
        // Dumper søkeskjemaene i admin searchStatus: hvilke felt finnes, og hvilke
        // submit_action-verdier tilbyr NISSY? Gjetting på feltnavn ga 0 treff på alle
        // seks former (Thomas 21.08) — da må vi lese fasit i stedet.
        //   __verktoykasseDev.visSokeskjema()
        visSokeskjema: async () => {
            const r = await fetch(`${ADMIN_BASE}/searchStatus`, { credentials: 'same-origin' });
            const html = await r.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            console.log(`[skjema] searchStatus HTTP ${r.status}, ${html.length} tegn`);
            const skjemaer = doc.querySelectorAll('form');
            console.log(`[skjema] ${skjemaer.length} form-element(er)`);
            skjemaer.forEach((f, i) => {
                console.log(`  FORM ${i}: action=${f.getAttribute('action') || '(ingen)'} method=${f.getAttribute('method') || 'GET'}`);
            });
            // NISSY legger ofte felt UTENFOR form-elementet (ugyldig markup, se v2.132)
            const felt = [];
            doc.querySelectorAll('input, select, textarea').forEach(el => {
                const navn = el.getAttribute('name');
                if (!navn) return;
                felt.push({ navn, type: (el.getAttribute('type') || el.tagName).toLowerCase(), verdi: (el.getAttribute('value') || '').slice(0, 30) });
            });
            console.log('[skjema] felt med name:');
            console.table(felt);
            // submit_action-verdier avslører hvilke søk siden faktisk støtter
            const akt = [...new Set([...html.matchAll(/submit_action['"]?\s*[=:]\s*['"]?([A-Za-z_]+)/g)].map(m => m[1]))];
            console.log('[skjema] submit_action-verdier i sidekilden:', akt.join(', ') || '(ingen)');
            const knapper = [...new Set([...html.matchAll(/name=["']submit_action["'][^>]*value=["']([^"']+)["']/gi)].map(m => m[1]))];
            if (knapper.length) console.log('[skjema] submit_action fra knapper:', knapper.join(', '));
            return { felt, akt, knapper };
        },
        // Hvilken searchStatus-form finner en REKVISISJON? Turnummer bruker POST med
        // submit_action=tripSearch; rekvisisjonsvarianten vår bruker GET ?nr= og fant
        // ingenting (Thomas 21.08). Måler i stedet for å gjette på feltnavnet.
        //   __verktoykasseDev.testRekvSok('261035249391')
        testRekvSok: async (rekvnr) => {
            const nr = String(rekvnr || '').replace(/\D/g, '');
            const tell = (html) => {
                const re = /getRequisitionDetails\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
                const sett = new Set(); let m;
                while ((m = re.exec(html)) !== null) sett.add(m[1] + '_' + m[3]);
                return sett.size;
            };
            const felles = 'council=-999999&chosenDispatchCenter.id=560&_attentionUnresolvedOnly=on&dbSelect=1';
            const varianter = [
                // Fasit fra Overvåker Live (overvaaker_live.js ~L5947) — feltet heter
                // requisitionNumber, ikke requisitionNr. Det var hele forskjellen.
                ['POST reqSearch (Live)',    'POST', `${ADMIN_BASE}/searchStatus`, `submit_action=reqSearch&requisitionNumber=${nr}&${felles}`],
                ['GET ?nr= (gammel)',        'GET',  `${ADMIN_BASE}/searchStatus?nr=${encodeURIComponent(nr)}`, null],
                ['POST reqSearch m/ Nr',     'POST', `${ADMIN_BASE}/searchStatus`, `submit_action=reqSearch&requisitionNr=${nr}&${felles}`],
            ];
            console.log(`[rekvtest] ${nr} — teller treff per søkeform …`);
            const rader = [];
            for (const [navn, metode, url, body] of varianter) {
                try {
                    const r = metode === 'GET'
                        ? await fetch(url, { credentials: 'same-origin' })
                        : await fetch(url, { method: 'POST', credentials: 'same-origin',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
                    const html = r.ok ? await r.text() : '';
                    const n = r.ok ? tell(html) : null;
                    rader.push({ form: navn, http: r.status, treff: n });
                    console.log(`  ${navn.padEnd(26)} HTTP ${r.status} → ${n === null ? '—' : n + ' treff'}`);
                } catch (e) {
                    rader.push({ form: navn, http: 'feil', treff: e.message });
                    console.log(`  ${navn.padEnd(26)} FEIL: ${e.message}`);
                }
            }
            console.table(rader);
            console.log('[rekvtest] Den formen som gir treff er den vi skal bruke.');
            return rader;
        },
        // NISSYs EGEN DISTANSE (Thomas fanget kallet 21.08): planleggerens ajax-dispatch
        // med action=showcostshort og rid=<resId>. Det er popupen «Rekvisisjon … (korteste
        // vei) — Forventet distanse: 96.25 km». Ikke i ajax_reqdetails, ikke i beregnReisetid.
        // Samme endepunkt som setResourceDeviation bruker.
        //   __verktoykasseDev.nissyDistanse('81632305')
        nissyDistanse: async (resId) => {
            const url = `${NISSY_ORIGIN}/planlegging/ajax-dispatch?update=false&action=showcostshort&rid=${encodeURIComponent(resId)}`;
            const r = await fetch(url, { credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'text/javascript, text/html, application/xml, text/xml, */*' } });
            if (!r.ok) { console.warn('[NISSY-KM] HTTP ' + r.status); return null; }
            const txt = await r.text();
            console.log('[NISSY-KM] svar (%d tegn):', txt.length);
            console.log(txt.slice(0, 900));
            const km  = txt.match(/([\d]+[.,][\d]+|\d+)\s*km/i);
            const tid = txt.match(/(\d+\s*time[rn]?\s*\d*\s*min|\d+\s*min)/i);
            if (km)  console.log('[NISSY-KM] ✓ DISTANSE: %s km', km[1]);
            if (tid) console.log('[NISSY-KM] ✓ KJØRETID: %s', tid[1]);
            if (!km) console.log('[NISSY-KM] fant ikke km-tall — se rå-svaret over');
            return { km: km ? parseFloat(km[1].replace(',', '.')) : null, tid: tid ? tid[1] : null, rå: txt };
        },
        // NISSYs egen distanse ligger i ajax_reqdetails — samme svar vi allerede henter
        // (Thomas fanget kallet i Network 21.08). «Forventet distanse: 96.25 km» vises i
        // rekvisisjons-popupen, men vi parser den ikke. Denne viser markupen rundt.
        //   __verktoykasseDev.visDistanse(81633291)
        visDistanse: async (reqId, db, tripid) => {
            // Tar imot BÅDE intern reqId (8 siffer) og rekvisisjonsnummer (12 siffer).
            // Rekvisisjonsnummeret er det operatøren ser i popupen, så det er det man
            // naturlig taster — slå det opp først.
            const rent = String(reqId).replace(/\D/g, '');
            if (rent.length >= 11) {
                console.log('[DISTANSE] %s ser ut som et rekvisisjonsnummer — slår opp …', rent);
                const d = await hentTurDetaljerViaRekvnr(rent);
                const f = (d && d.rekvisisjoner || [])[0];
                if (!f) { console.warn('[DISTANSE] fant ingen rekvisisjon med nr ' + rent); return null; }
                reqId = f.reqId; db = f.db || 1; tripid = f.tripid || f.reqId;
                console.log('[DISTANSE] → reqId=%s db=%s tripid=%s', reqId, db, tripid);
            }
            db = db || 1; tripid = tripid || reqId;
            const url = `${ADMIN_BASE}/ajax_reqdetails?id=${reqId}&db=${db}&tripid=${tripid}&showSutiXml=true&hideEvents=&full=true&highlightTripNr=`;
            const r = await fetch(url, { credentials: 'same-origin' });
            if (!r.ok) { console.warn('[DISTANSE] HTTP ' + r.status); return null; }
            const html = await r.text();
            console.log('[DISTANSE] svar: %d tegn', html.length);
            // NISSY-sider er ofte iso-8859-1, så «kjøretid» kan komme mojibake. Søk bredt:
            // km-tall, «avstand», engelske varianter — og vis hvilke rader tabellen har.
            const treff = [];
            const re = /[\s\S]{0,120}(distan|kj[\wø]{1,3}retid|korteste|avstand|\d[\d.,]*\s*km\b|length|meter)[\s\S]{0,160}/gi;
            let m, n = 0;
            while ((m = re.exec(html)) !== null && n++ < 12) treff.push(m[0].replace(/\s+/g, ' ').trim());
            if (!treff.length) {
                console.log('[DISTANSE] ingen treff. Radetiketter i svaret:');
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const et = [...doc.querySelectorAll('td,th')].map(e => (e.textContent||'').trim())
                    .filter(t => t && t.length < 40 && /[:：]$|^[A-ZÆØÅ]/.test(t));
                console.log('   ', [...new Set(et)].slice(0, 40).join(' | '));
                return html;
            }
            treff.forEach((t, i) => console.log('  [%d] %s', i, t.slice(0, 280)));
            // Prøv å plukke tallet med noen vanlige mønstre
            for (const p of [/Forventet\s+distanse[^0-9]{0,60}([\d.,]+)\s*km/i,
                             /distanse[^0-9]{0,60}([\d.,]+)\s*km/i,
                             /([\d.,]+)\s*km[^<]{0,20}<\/td>/i]) {
                const t = html.match(p);
                if (t) { console.log('[DISTANSE] ✓ TALL FUNNET: %s km  (mønster: %s)', t[1], p); break; }
            }
            return html;
        },
        // Formattest (Thomas 18.08): 47905352 ga 31 treff fordi de to første sifrene
        // leses som landskode 47. Prøver samme nummer i ulike skrivemåter og teller RÅ
        // treff — da ser vi hvilken form NISSY faktisk vil ha, i stedet for å gjette.
        //   __verktoykasseDev.testTlfFormater('47905352')
        testTlfFormater: async (tlf) => {
            const rent = String(tlf || '').replace(/\D/g, '');
            if (!rent) { console.warn('[formattest] tomt nummer'); return []; }
            const varianter = [
                ['rått (som i dag)', rent],
                ['+47 foran',        '+47' + rent],
                ['0047 foran',       '0047' + rent],
                ['47 foran',         '47' + rent],
                ['med mellomrom',    rent.replace(/^(\d{3})(\d{2})(\d{3})$/, '$1 $2 $3')],
            ];
            console.log('[formattest] ' + rent + ' — teller rå treff per skrivemåte (ingen verifisering) …');
            const rader = [];
            for (let i = 0; i < varianter.length; i++) {
                const navn = varianter[i][0], verdi = varianter[i][1];
                const r = await sokTlfINissy(verdi, { utenVerifisering: true, raaFormat: true, utenFallback: true });
                const treff = r && r.feil ? ('FEIL: ' + r.feil) : (r && r.pasienter ? r.pasienter.length : null);
                rader.push({ skrivemate: navn, sendt: verdi, treff });
                console.log('  ' + navn.padEnd(18) + ' «' + verdi + '» → ' + treff + (typeof treff === 'number' ? ' treff' : ''));
            }
            console.table(rader);
            console.log('[formattest] Færrest treff = den skrivemåten NISSY forstår. 1 treff er fasit.');
            return rader;
        },
        // Test-helper: oppretter en falsk tlf-jobb i nissy_oppslag og lar pollTlfVentende
        // plukke den opp + vise toast. Bruk fra konsoll: __verktoykasseDev.testTlf('12345678', {kort_id:1, ko_navn:'Test'})
        testTlf: async (tlf, parametre) => {
            const fd = new FormData();
            fd.append('tlf', String(tlf || '').replace(/\D/g, ''));
            fd.append('av', 'console-test');
            if (parametre) fd.append('parametre', JSON.stringify(parametre));
            const r = await fetch(`${JOBS_URL}?handling=tlf_ny`, { method: 'POST', body: fd });
            const d = await r.json();
            console.log('[testTlf] opprettet jobb:', d);
            // Fjern fra "viste" så toast kommer opp ved neste poll
            if (d && d.id) visteToasterIds.delete(d.id);
            pollTlfVentende();
            return d;
        }
    };

    // Fremmestatus: SUTI-seksjonen i NISSYs ressurs-popup (sendt / på vei 3003 / fremme 1709).
    // Splittet ut av basic_tools 25.08.2026 — se fremmestatus_dev.js. Passiv dekorator uten UI av
    // eget, så den har ingen meny-oppføring: en launcher åpner et vindu, og denne har ingenting å
    // åpne. Skal den styres per kjørekontor senere, er det en gate her, ikke i tilgangsmenyen.
    // ══ NISSY ADMIN-KAPABILITETER ══════════════════════════════════════════════════════
    // ⚠️ «admin=true» i skriptene våre er bare en SESJONSSJEKK: kom det en side, og var den ikke
    //    innloggingssiden? Den sier ingenting om hvilke av admin-menyens punkter brukeren faktisk
    //    når (Thomas 26.08: «ikke alle har like mye tilgang»).
    //    Konsekvensen er den verste feilmodusen vi har: et oppslag mot noe brukeren ikke har
    //    tilgang til gir en innloggingsside, parseren finner ingenting, og verktøyet melder
    //    «fant ingen data» i stedet for «du mangler tilgang». Brukeren tror systemet er tomt.
    //
    // Vi leser derfor admin-forsidens meny ÉN gang og eksponerer hva som faktisk finnes.
    // href-ene er stabile endepunkter; menyteksten er det ikke (den kan lokaliseres/endres).
    const NISSY_ADMIN_SEKSJONER = {
        brukere:              'getUser',
        person:               'findPatient',
        pasientreisekontorer: 'getDispatchCenter',
        behandlingssteder:    'adminTCForm',
        avtaler:              'findContract',
        avtalefiltere:        'getContractAreaFilter',
        transportorer:        'getTransporter',
        rekvisisjoner:        'searchStatus',
        infoskjerm:           'findInfoScreen',
        helligdager:          'holidays',
        filtere:              'getDispatchFilter',
        filtergrupper:        'filtergroups',
    };

    function initNissyAdmin() {
        const api = {
            klar: null,
            seksjoner: null,        // null = ikke undersøkt ennå
            nissyVersjon: null,     // fra admin-headeren, f.eks. «6.10.4»
            nissyBruker: null,
            har(navn) { return !api.seksjoner ? null : api.seksjoner.indexOf(navn) >= 0; },
            // Menneskelig melding et verktøy kan vise i stedet for et tomt resultat.
            mangler(navn) {
                if (api.seksjoner === null) return null;          // vet ikke — ikke påstå noe
                if (api.har(navn)) return null;
                return 'Du har ikke tilgang til «' + navn + '» i NISSY admin. '
                     + 'Denne funksjonen kan derfor ikke hente data — det er ikke en feil i verktøyet.';
            },
        };
        api.klar = (async () => {
            try {
                const r = await fetch('/administrasjon/admin/', { credentials: 'same-origin' });
                if (!r.ok) return api.seksjoner;
                const h = await r.text();
                // Innloggingsside → ikke admin i det hele tatt. La seksjoner være null, ikke [],
                // så «vet ikke» ikke forveksles med «har ingenting».
                if (/name=["']?(j_)?password/i.test(h)) return api.seksjoner;
                const d = new DOMParser().parseFromString(h, 'text/html');
                const href = [...d.querySelectorAll('a')].map(a => a.getAttribute('href') || '');
                api.seksjoner = Object.keys(NISSY_ADMIN_SEKSJONER)
                    .filter(k => href.some(u => u.indexOf(NISSY_ADMIN_SEKSJONER[k]) >= 0));
                console.log('[VERKTØYKASSE] NISSY admin-tilgang: '
                    + (api.seksjoner.length ? api.seksjoner.join(', ') : '(ingen seksjoner)'));

                // ⚠️ NISSY OPPGIR SIN EGEN VERSJON i admin-headeren: «Versjon: 6.10.4».
                //    Det er verdifullt for verktøy som leser andres HTML: en oppgradering hos NHN
                //    er nøyaktig når parserne våre brekker — og i dag ville vi merket det ved at
                //    noe ble STILLE TOMT, uten å ane hvorfor. Nå får vi varsel samme dag.
                const vm = h.match(/Versjon:\s*([\d.]+)/);
                if (vm) {
                    api.nissyVersjon = vm[1];
                    const sist = localStorage.getItem('vkt_nissy_versjon');
                    if (sist && sist !== vm[1]) {
                        console.warn('[VERKTØYKASSE] ⚠ NISSY er oppgradert: ' + sist + ' → ' + vm[1]
                            + '. Verktøyene leser NISSYs HTML direkte — kontroller at oppslag,'
                            + ' parsere og kolonner fortsatt treffer.');
                    }
                    try { localStorage.setItem('vkt_nissy_versjon', vm[1]); } catch (_) {}
                    console.log('[VERKTØYKASSE] NISSY-versjon ' + vm[1]);
                }
                const bm = h.match(/Innlogget bruker:<\/span>[\s\S]{0,200}?fieldvalue["'][^>]*>\s*([^<\s]+)/);
                if (bm) api.nissyBruker = bm[1];
            } catch (e) {
                console.warn('[VERKTØYKASSE] kunne ikke lese admin-meny:', e && e.message);
            }
            return api.seksjoner;
        })();
        window.__vkt_nissyAdmin = api;
    }

    function lastFremmestatus() {
        const fil = ER_DEV ? 'fremmestatus_dev.js' : 'fremmestatus.js';
        const s = document.createElement('script');
        s.src = `https://thomaswestby.no/skript/skript.php?fil=${fil}&_=${Date.now()}`;
        s.onerror = () => console.warn(`[VERKTØYKASSE] kunne ikke laste ${fil}`);
        document.head.appendChild(s);
        console.log(`[VERKTØYKASSE] laster ${fil}`);
    }

    function lastBasicTools(tilgang) {
        // Eksponerer brukernavn så basic_tools.js kan bruke det som userid mot rekvisisjons-API
        window.__vkt_brukernavn = hentNissyBrukernavn() || '';
        // Dev-verktøykasse → dev basic_tools, prod → prod basic_tools.
        // Tidligere localStorage-flagg fjernet — dev/prod-splittet styrer alt nå.
        const fil = ER_DEV ? 'basic_tools_dev.js' : 'basic_tools.js';
        const s = document.createElement('script');
        s.src = `https://thomaswestby.no/skript/skript.php?fil=${fil}&_=${Date.now()}`;
        s.onload = () => {
            const bt = window.__basicTools;
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl && bt) {
                verEl.textContent = `v${bt.versjon}`;
                if (bt.dev) {
                    const tag = document.createElement('span');
                    tag.textContent = ' DEV';
                    tag.style.cssText = 'color:#fbbf24;font-weight:700;letter-spacing:0.5px;margin-left:2px;';
                    verEl.appendChild(tag);
                }
            }
        };
        s.onerror = () => {
            console.warn(`[VERKTØYKASSE] kunne ikke laste ${fil}`);
            const verEl = document.querySelector('#vkt-bt-versjon [data-bt-ver]');
            if (verEl) verEl.textContent = '⚠ feilet';
        };
        document.head.appendChild(s);
        console.log(`[VERKTØYKASSE] laster ${fil}`);
    }

    // === SESJON-LOGGING ===
    // Registrerer bruken av Verktøykassen i `ovr_sesjoner`-tabellen via live_sesjon.php.
    // Vises i OUS Dashboard → Sesjoner-panel sammen med Avvik og Live.
    function _ekstraktKjorekontor(s) {
        // Strip "Pasientreisekontor for ", samt evt. ekstra "Pasientreiser "-prefiks,
        // så vi får "Oslo og Akershus" / "Innlandet" (uten "Pasientreiser "-prefiks).
        const m = String(s || '').match(/Pasientreisekontor\s+(?:for\s+)?(?:Pasientreiser\s+)?([^\-—|<\n\r]+?)(?:\s*[-—|<\n\r]|\s*$)/i);
        return m ? m[1].trim() : '';
    }

    // hentRealKjorekontor: KUN fra NISSY-tittel/body — ignorerer localStorage-override.
    // Brukes for sesjon-logging så thwe-sesjoner alltid vises som Oslo,
    // uavhengig av om Innlandet-bookmarkleten er aktiv.
    function hentRealKjorekontor() {
        return _ekstraktKjorekontor(document.title)
            || (document.body ? _ekstraktKjorekontor(document.body.innerText) : '')
            || (document.body ? _ekstraktKjorekontor(document.body.innerHTML) : '')
            || '';
    }

    // hentKjorekontor: override har forrang — brukes for tilgang/UI (verktøy-filter).
    // Nye pasientreiser-bookmarklets bruker _pr-suffix; gamle /OUS/-bookmarklets
    // bruker det opprinnelige nøkkel-settet (fallback for bakoverkompat).
    function hentKjorekontor() {
        // Strip "Pasientreiser "-prefiks fra evt. legacy-verdier i localStorage —
        // backend kjenner kun "Oslo og Akershus" / "Innlandet" (uten prefiks).
        const norm = s => (s || '').trim().replace(/^Pasientreiser\s+/i, '');
        try {
            const overridePr = norm(localStorage.getItem('vkt_kjorekontor_override_pr'));
            if (overridePr) return overridePr;
            const override = norm(localStorage.getItem('vkt_kjorekontor_override'));
            if (override) return override;
        } catch (_) {}
        return hentRealKjorekontor();
    }

    function hentKontorKode() {
        try {
            return (localStorage.getItem('vkt_kontor_kode_pr')
                 || localStorage.getItem('vkt_kontor_kode')
                 || '').trim();
        } catch (_) { return ''; }
    }

    async function startSesjon(nissy_id) {
        const sesjonUrl = 'https://thomaswestby.no/skript/live_sesjon.php';
        const skriptNavn = ER_DEV ? 'Verktoykasse-DEV' : 'Verktoykasse';
        // Sesjon-logging bruker EGENTLIG kontor (fra NISSY-tittel) — IKKE override.
        // Det sikrer at thwe alltid vises som Oslo i sesjoner, selv når override er aktiv.
        const realKontor = hentRealKjorekontor();
        const overrideKontor = hentKjorekontor();
        if (realKontor) {
            console.log(`[VERKTØYKASSE] sesjon-kontor: ${realKontor}`
                + (overrideKontor !== realKontor ? ` (tilgang-override: ${overrideKontor})` : ''));
        }
        let sesjonId = 0;
        try {
            const res = await fetch(sesjonUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    handling: 'start',
                    nissy_id: nissy_id || '',
                    signatur: nissy_id || '',
                    kjorekontor: realKontor || '',
                    kontor_kode: hentKontorKode() || '',
                    versjon: VERSJON, skript: skriptNavn
                })
            });
            const j = await res.json();
            if (j && j.ok && j.id) sesjonId = j.id;
        } catch (e) { /* offline eller endpoint nede — la det gå */ }
        if (!sesjonId) return;

        setInterval(() => {
            try {
                fetch(sesjonUrl, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        handling: 'heartbeat',
                        id: sesjonId,
                        versjon: VERSJON,
                        skript: skriptNavn,
                        kjorekontor: hentRealKjorekontor() || '',
                        kontor_kode: hentKontorKode() || ''
                    })
                });
            } catch (_) {}
        }, 60000);

        const avsluttSesjon = () => {
            try {
                navigator.sendBeacon(sesjonUrl, new Blob([JSON.stringify({
                    handling: 'slutt', id: sesjonId
                })], {type: 'application/json'}));
            } catch (_) {}
        };
        window.addEventListener('beforeunload', avsluttSesjon);
        window.addEventListener('pagehide', avsluttSesjon);
    }

    /* ── Søkelogg: husk dagens søk i planleggeren ──────────────────────────────
       Alt operatøren søker på (pnr/reisenr/rekvnr/navn — det som står i søkefeltet)
       logges LOKALT i localStorage og tømmes automatisk ved dagsskifte. Forlater
       ALDRI maskinen (samme prinsipp som «pnr forlater aldri verktøykassen»).
       🕘-knapp ved søkefeltet åpner loggen; klikk på en rad kjører søket på nytt. */
    const SOKELOGG_KEY = 'vkt_sokelogg';
    const SOKELOGG_MAKS = 300;
    function sokeloggDato() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    let sokeloggMinne = null;  // { dato, poster } — sann kilde i denne økten, uavhengig av om Web Storage virker
    // Prototype.js (rico, NISSY) definerer Array.prototype.toJSON → JSON.stringify DOBBEL-ENCODER
    // arrays til strenger ("poster":"[…]"). Nøytraliser midlertidig under serialisering.
    function jsonStringifyTrygt(obj) {
        const arrToJSON = Array.prototype.toJSON;
        if (arrToJSON) { try { delete Array.prototype.toJSON; } catch (_) {} }
        try { return JSON.stringify(obj); }
        finally { if (arrToJSON) { try { Array.prototype.toJSON = arrToJSON; } catch (_) {} } }
    }
    function lesEnKilde(store) {
        try {
            const r = JSON.parse(store.getItem(SOKELOGG_KEY) || 'null');
            // Selvhelbredende: data skrevet FØR toJSON-fiksen har poster som dobbel-encodet streng
            if (r && typeof r.poster === 'string') { try { r.poster = JSON.parse(r.poster); } catch (_) {} }
            if (r && r.dato === sokeloggDato() && Array.isArray(r.poster)) return r.poster;
        } catch (_) {}
        return [];  // annen dag / tom / utilgjengelig → fersk logg
    }
    function lesSokelogg() {
        // Minne-cachen er sann kilde i økten — virker selv om Web Storage er blokkert i NISSY.
        if (sokeloggMinne && sokeloggMinne.dato === sokeloggDato()) return sokeloggMinne.poster;
        // Ny sidelast (F5) / ny dag: hydrer fra storage (ferskeste av de to) hvis tilgjengelig.
        const fraLocal = lesEnKilde(localStorage);
        const fraSession = lesEnKilde(sessionStorage);
        sokeloggMinne = { dato: sokeloggDato(), poster: fraLocal.length >= fraSession.length ? fraLocal : fraSession };
        return sokeloggMinne.poster;
    }
    function skrivSokelogg(poster) {
        const trimmet = poster.slice(-SOKELOGG_MAKS);
        sokeloggMinne = { dato: sokeloggDato(), poster: trimmet };  // minne først — alltid pålitelig
        const data = jsonStringifyTrygt({ dato: sokeloggDato(), poster: trimmet });
        try { localStorage.setItem(SOKELOGG_KEY, data); } catch (_) {}    // best-effort F5-speil
        try { sessionStorage.setItem(SOKELOGG_KEY, data); } catch (_) {}
    }
    function loggSok() {
        const felt = document.getElementById('searchPhrase');
        const typeEl = document.getElementById('searchType');
        const verdi = ((felt && felt.value) || '').trim();
        if (!verdi) return;
        const typeVal = typeEl ? typeEl.value : '';
        const typeNavn = (typeEl && typeEl.selectedIndex >= 0 && typeEl.options[typeEl.selectedIndex].text) || typeVal || '';
        const poster = lesSokelogg();
        const siste = poster[poster.length - 1];
        if (siste && siste.verdi === verdi && siste.type === typeVal) return;  // gjentatt likt søk → ikke dupliser
        const naa = new Date();
        poster.push({ kl: String(naa.getHours()).padStart(2, '0') + ':' + String(naa.getMinutes()).padStart(2, '0'), type: typeVal, navn: typeNavn, verdi });
        skrivSokelogg(poster);
        const teller = document.getElementById('vkt-sokelogg-teller');
        if (teller) teller.textContent = String(poster.length);
    }
    function kjorSokFraLogg(post) {
        const felt = document.getElementById('searchPhrase');
        if (!felt) return;
        const typeEl = document.getElementById('searchType');
        if (typeEl && post.type) { typeEl.value = post.type; typeEl.dispatchEvent(new Event('change', { bubbles: true })); }
        felt.focus();
        felt.value = post.verdi;
        felt.dispatchEvent(new Event('input', { bubbles: true }));
        felt.dispatchEvent(new Event('change', { bubbles: true }));
        const btn = document.getElementById('buttonSearch');
        if (btn) btn.click();
    }
    function visSokeloggPanel(anker) {
        trygtFjern(document.getElementById('vkt-sokelogg-panel'));
        const poster = lesSokelogg().slice().reverse();  // nyeste øverst
        const r = anker.getBoundingClientRect();
        // Åpne oppover når ankeret står i nedre halvdel (flytende bunn-knapp), ellers nedover.
        const apneOpp = r.top > window.innerHeight / 2;
        const venstre = Math.max(8, Math.round(r.right - 360));
        const vertikal = apneOpp
            ? `bottom:${Math.round(window.innerHeight - r.top + 6)}px;`
            : `top:${Math.round(r.bottom + 6)}px;`;
        const p = document.createElement('div');
        p.id = 'vkt-sokelogg-panel';
        p.style.cssText = `position:fixed;${vertikal}left:${venstre}px;z-index:2147483646;width:360px;max-height:55vh;overflow:auto;background:rgba(15,23,42,0.97);color:#f8fafc;border:1px solid #334155;border-radius:10px;box-shadow:0 12px 36px rgba(0,0,0,0.55);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;padding:10px 12px;`;
        const rader = poster.length ? poster.map((post, i) => `
            <div data-vkt-sok="${i}" style="display:flex;gap:8px;align-items:baseline;padding:5px 6px;border-top:1px solid #1e293b;cursor:pointer;border-radius:5px;" onmouseover="this.style.background='rgba(59,130,246,0.15)'" onmouseout="this.style.background=''">
                <span style="color:#64748b;font-size:11px;flex-shrink:0;">${post.kl}</span>
                <span style="color:#94a3b8;font-size:11px;flex-shrink:0;min-width:86px;">${post.navn || ''}</span>
                <span style="font-family:monospace;font-weight:600;color:#f8fafc;word-break:break-all;">${String(post.verdi).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</span>
            </div>`).join('') : '<div style="color:#64748b;font-style:italic;padding:8px 0;">Ingen søk i dag ennå.</div>';
        p.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-weight:700;">🕘 Dagens søk <span style="color:#64748b;font-weight:400;">(${poster.length})</span></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <span data-vkt-sok-tom style="cursor:pointer;color:#94a3b8;font-size:11px;">Tøm</span>
                    <span data-vkt-sok-lukk style="cursor:pointer;color:#94a3b8;font-size:16px;line-height:1;">×</span>
                </div>
            </div>
            <div style="color:#64748b;font-size:10px;margin-bottom:4px;">Lagres kun i denne nettleseren · slettes automatisk ved midnatt · klikk for å søke igjen</div>
            ${rader}`;
        document.body.appendChild(p);
        p.querySelector('[data-vkt-sok-lukk]').onclick = () => trygtFjern(p);
        p.querySelector('[data-vkt-sok-tom]').onclick = () => { skrivSokelogg([]); trygtFjern(p); const tl = document.getElementById('vkt-sokelogg-teller'); if (tl) tl.textContent = '0'; };
        p.querySelectorAll('[data-vkt-sok]').forEach(el => {
            el.onclick = () => { const post = poster[+el.dataset.vktSok]; trygtFjern(p); if (post) kjorSokFraLogg(post); };
        });
        // Klikk utenfor lukker panelet
        setTimeout(() => {
            const lukkUtenfor = (e) => { if (!p.contains(e.target) && e.target !== anker) { trygtFjern(p); document.removeEventListener('mousedown', lukkUtenfor, true); } };
            document.addEventListener('mousedown', lukkUtenfor, true);
        }, 0);
    }
    function sikreSokeloggKnapp() {
        if (document.getElementById('vkt-sokelogg-btn')) return;
        // Anker i NISSYs footer-rad (Ping / tema / Dynamiske plakater) — masse ledig plass.
        // #dynamic_poster sitter i en <td> i footer-tabellen; vi legger en ny <td> sist i raden.
        // Manuell parent-walk (ikke .closest) for å være trygg i rico/prototype-miljøet.
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;  // footer ikke klar ennå — intervallet prøver igjen
        const td = document.createElement('td');
        // ⚠️ IKKE valign="top". basic_tools' celler står med vertical-align:middle, og med
        //    ulik justering satt knappene på ulik høyde i samme rekke — det ser ut som
        //    størrelsesforskjell selv når boksene er like store.
        td.style.verticalAlign = 'middle';
        td.style.paddingLeft = '12px';
        const b = document.createElement('button');
        b.id = 'vkt-sokelogg-btn';
        b.type = 'button';
        b.title = 'Dagens søk — klikk for å se hva du har søkt på i dag';
        // ⚠️ TELLEREN GJORDE KNAPPEN HØYERE ENN NABOENE (Thomas 27.08). vertical-align:super
        //    løfter tallet over grunnlinja, og linjeboksen vokser med det — så én knapp i
        //    footer-rekka sto et par piksler høyere enn resten. Parentesene ligger UTENFOR
        //    spennet, så de to stedene som skriver telleren (nytt søk, og «tøm») kan fortsatt
        //    sette ren textContent uten å miste dem.
        b.innerHTML = `🕘 Logg <span style="opacity:.75;">(<span id="vkt-sokelogg-teller">${lesSokelogg().length}</span>)</span>`;
        // Oransje som resten av footer-familien (Thomas 25.08) — se basic_tools 1.187-dev.
        // ⚠️ ÉN FELLES BOKS FOR ALLE FOOTER-KNAPPENE (Thomas 27.08: «størrelsesforskjell på
        //    høyden enda»). Knappene bygges i TO filer og hadde drevet fra hverandre:
        //    3px/12px uten line-height her, 3px/10px med line-height:1 i basic_tools. Uten
        //    line-height bestemmer skriften og EMOJIENE linjeboksen, og de er ikke like høye
        //    — derfor varierte høyden per knapp. Nå er høyden LÅST (inline-flex + height +
        //    line-height:1), så innholdet ikke lenger kan dytte boksen.
        b.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;padding:0 11px;line-height:1;font-size:12px;font-weight:600;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f59e0b;color:#1e293b;border:1px solid #d97706;';
        b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); visSokeloggPanel(b); };
        td.appendChild(b);
        celle.parentNode.appendChild(td);  // ny celle sist i footer-raden, etter «Dynamiske plakater»
    }
    // ── FOOTER: Verktøy + snarveier ────────────────────────────────────────────────────
    // Rekkefølge (Thomas 26.08): Verktøy | Rekvisisjon | Admin | Attest | … resten.
    // ⚠️ Alle fire i ÉN <td>, satt inn FØR søkelogg-cellen. Cellene våre føyes ellers på i den
    //    rekkefølgen skriptene tilfeldigvis rekker å kjøre, og da ville rekkefølgen variert
    //    mellom innlastinger. insertBefore gir et fast anker.
    function sikreMenyKnapp() {
        if (document.getElementById('vkt-meny-td')) return;
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;

        const td = document.createElement('td');
        td.id = 'vkt-meny-td';
        // ⚠️ IKKE valign="top". basic_tools' celler står med vertical-align:middle, og med
        //    ulik justering satt knappene på ulik høyde i samme rekke — det ser ut som
        //    størrelsesforskjell selv når boksene er like store.
        td.style.verticalAlign = 'middle';
        td.style.paddingLeft = '12px';
        td.style.whiteSpace = 'nowrap';

        // Samme boks som Logg-knappen — se kommentaren der.
        const stil = 'display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;height:22px;padding:0 11px;line-height:1;font-size:12px;font-weight:600;border-radius:6px;cursor:pointer;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#f59e0b;color:#1e293b;border:1px solid #d97706;';

        const b = document.createElement('button');
        b.id = 'vkt-meny-btn';
        b.type = 'button';
        b.title = 'Verktøykassens meny — samme som skjoldet';
        b.textContent = '🔧 Verktøy';
        b.style.cssText = stil;
        // ⚠️ stopPropagation er PÅKREVD: skjoldets egen document-lytter lukker menyen når et
        //    klikk lander utenfor meny+skjold. Uten dette ville vårt eget klikk åpnet menyen og
        //    umiddelbart lukket den igjen når eventet boblet videre.
        b.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (window.__vkt_meny) window.__vkt_meny.toggle(b);
        };
        td.appendChild(b);

        // Snarveiene som egne knapper — slipper å åpne menyen for å få et nytt rekvisisjonsbilde.
        // Statusprikken sitter på sin egen knapp; tegnAdminStatus maler alle [data-status-for].
        ['rek', 'admin', 'attest'].forEach(k => {
            const sn = VKT_SNARVEIER[k];
            const kn = document.createElement('button');
            kn.type = 'button';
            kn.title = sn.tittel;
            kn.style.cssText = stil + 'margin-left:6px;';
            const prikk = document.createElement('span');
            prikk.dataset.statusFor = sn.statusKey;
            prikk.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;'
                + 'background:#64748b;margin-right:6px;vertical-align:1px;'
                + 'box-shadow:0 0 0 1px rgba(30,41,59,0.35);';
            kn.appendChild(prikk);
            kn.appendChild(document.createTextNode(sn.tekst));
            kn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); apneSnarvei(k); };
            td.appendChild(kn);
        });

        const logg = document.getElementById('vkt-sokelogg-btn');
        const loggTd = logg ? logg.closest('td') : null;
        if (loggTd && loggTd.parentNode === celle.parentNode) celle.parentNode.insertBefore(td, loggTd);
        else celle.parentNode.appendChild(td);

        // ⚠️ Prikkene fødes GRÅ. tegnAdminStatus() maler alle [data-status-for] i dokumentet, men
        //    den kjørte lenge før denne knappen fantes — og kjører først igjen når statusen
        //    ENDRER seg. Uten dette kallet ville footer-prikkene stått grå til neste
        //    inn-/utlogging, mens menyens sto grønne. To visninger, samme sannhet, ulik farge.
        try { tegnAdminStatus(); } catch (_) {}
    }

    function initSokelogg() {
        // Fang søk uansett hvordan de trigges (knapp eller Enter) — capture-fase, før NISSY håndterer.
        document.addEventListener('click', (e) => { if (e.target && e.target.id === 'buttonSearch') loggSok(); }, true);
        document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'searchPhrase') loggSok(); }, true);
        sikreSokeloggKnapp();
        sikreMenyKnapp();
        setInterval(() => { sikreSokeloggKnapp(); sikreMenyKnapp(); }, 3000);  // re-påfør hvis NISSY re-rendrer søkelinja (billig early-return)
    }

    // === DRIFTSMELDING (per kjørekontor) ===
    // Felt til HØYRE for «🕘 Logg» + «🗗 Vis kart+» i NISSYs footer-rad. Teksten styres i
    // admin.php («🧰 Verktøykasse»-tab) per kjørekontor og leveres via verktoykasse_tilgang.php
    // (t.melding = {aktiv, tekst, oppdatert}). Speiler søkelogg-knappens forankring + tlf-pollerens
    // erAktivEier-guard. Skjult når ingen aktiv melding. À la Overvåker Live sine meldinger.
    function sikreMeldingsFelt() {
        if (document.getElementById('vkt-melding-td')) return;
        let celle = document.getElementById('dynamic_poster') || document.getElementById('buttonPing');
        while (celle && celle.tagName !== 'TD') celle = celle.parentNode;
        if (!celle || !celle.parentNode) return;  // footer ikke klar — intervallet prøver igjen
        const td = document.createElement('td');
        td.id = 'vkt-melding-td';
        // ⚠️ IKKE valign="top". basic_tools' celler står med vertical-align:middle, og med
        //    ulik justering satt knappene på ulik høyde i samme rekke — det ser ut som
        //    størrelsesforskjell selv når boksene er like store.
        td.style.verticalAlign = 'middle';
        td.style.paddingLeft = '12px';
        td.style.display = 'none';  // vises først når en aktiv melding finnes
        td.innerHTML = '<span style="display:inline-flex;align-items:flex-start;gap:6px;max-width:680px;'
            + 'padding:4px 12px;background:#fef3c7;color:#78350f;border:1px solid #f59e0b;border-left:4px solid #f59e0b;'
            + 'border-radius:8px;font-size:13px;font-weight:600;line-height:1.35;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">'
            + '<span style="flex-shrink:0;">📣</span> <span data-vkt-melding-tekst style="display:-webkit-box;'
            + '-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;"></span></span>';
        celle.parentNode.appendChild(td);  // ny celle sist i footer-raden → til høyre for knappene
        try { oppdaterMeldingsFelt((window.__vkt_tilgang || {}).melding); } catch (_) {}
    }
    function oppdaterMeldingsFelt(melding) {
        const td = document.getElementById('vkt-melding-td');
        if (!td) return;
        const aktiv = melding && melding.aktiv && melding.tekst;
        if (!aktiv) { td.style.display = 'none'; td.dataset.vktTekst = ''; return; }
        td.style.display = '';
        if (td.dataset.vktTekst !== melding.tekst) {
            td.dataset.vktTekst = melding.tekst;
            const span = td.querySelector('[data-vkt-melding-tekst]');
            if (span) { span.textContent = melding.tekst; span.title = melding.tekst; }
        }
    }
    async function pollMelding() {
        if (!erAktivEier()) return;  // én-instans: kun aktiv eier poller (som de andre pollerne)
        try {
            const t = await hentTilgang(hentNissyBrukernavn());
            if (t) oppdaterMeldingsFelt(t.melding);
        } catch (_) {}
    }
    function initMeldingsfelt() {
        sikreMeldingsFelt();
        setInterval(sikreMeldingsFelt, 3000);  // re-påfør ved NISSY re-render (billig early-return)
        setInterval(pollMelding, 90000);        // frisk melding live (~1,5 min), uten reload
    }

    // Tegn placeholder-skjold med en gang så det er synlig før tilgang-fetch er ferdig
    tegnMeny({ navn: 'Laster…', rolle: '', verktoy: [] });
    // Løs riktig nissy_id blant cookie-kandidatene (håndterer stale cookies fra annen økt)
    loesNissyOgTilgang().then(async ({ nissy, t }) => {
        console.log('[VERKTØYKASSE] Tilgang:', t);
        window.__vkt_tilgang = t;  // eksponer for verktøy (Område assistent leser omraade_postnr/kjorekontor)
        console.log(`[VERKTØYKASSE] Kontor-kode: ${hentKontorKode() || '(ingen)'} | override: ${(localStorage.getItem('vkt_kjorekontor_override_pr') || localStorage.getItem('vkt_kjorekontor_override') || '(ingen)')} | aktivt kontor: ${hentKjorekontor()}`);
        // Bytt ut placeholder med ekte skjold/meny (posisjon huskes via localStorage)
        const skjoldId = ER_DEV ? 'vkt-skjold-dev' : 'vkt-skjold';
        const menyId   = ER_DEV ? 'vkt-skjold-dev-meny' : 'vkt-skjold-meny';
        trygtFjern(document.getElementById(skjoldId));
        trygtFjern(document.getElementById(menyId));
        tegnMeny(t);
        autoApneKeeper();                  // Åpne keeper-popup automatisk (hopper over hvis alt aktiv)
        tegnAdminStatus();                 // Vis "sjekker"-status umiddelbart
        await oppdaterAdminStatus();       // Første admin-sjekk
        await oppdaterRekvisisjonStatus(); // Første rekvisisjon-sjekk

        // ⚠️ SPØRSMÅLET BLE STILT ÉN GANG (Thomas 01.09: «etter at rek og admin er logget inn
        //    blir de ikke automatisk grønne, men det blir attest»). Attest er PUSH — agenten
        //    melder seg hvert 3. sekund — mens disse to er PULL, og pullen skjedde bare ved
        //    oppstart. Logget operatøren inn etterpå, fikk verktøykassen aldri vite det, og
        //    prikken ble stående grå til hele verktøykassen ble lastet på nytt.
        //
        //    Den typiske flyten er «logg inn der borte, kom tilbake hit», så FOKUS er det beste
        //    signalet: da spør vi i det øyeblikket svaret kan ha endret seg. Intervallet er bare
        //    et sikkerhetsnett for den som lar planleggeren ligge fremme.
        let _statusSjekkTs = 0;
        async function oppdaterInnloggingsstatus(grunn) {
            if (Date.now() - _statusSjekkTs < 8000) return;   // to kall i samme øyeblikk = ett
            _statusSjekkTs = Date.now();
            const foer = adminStatus + '|' + rekStatus;
            await oppdaterAdminStatus();
            await oppdaterRekvisisjonStatus();
            if (foer !== adminStatus + '|' + rekStatus) {
                console.log(`[VERKTØYKASSE] innloggingsstatus endret (${grunn}): `
                    + `admin=${adminStatus} rek=${rekStatus}`);
            }
        }
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) oppdaterInnloggingsstatus('vindu i fokus');
        });
        window.addEventListener('focus', () => oppdaterInnloggingsstatus('fokus'));
        setInterval(() => oppdaterInnloggingsstatus('intervall'), 60000);
        initNissyAdmin();                  // hvilke admin-seksjoner har DENNE brukeren?
        lastBasicTools(t);                 // Last inline-handlinger (endre tid, etc)
        lastFremmestatus();                // SUTI-seksjon i ressurs-popupen (egen fil, passiv)
        startSesjon(nissy);                // Meld inn til ovr_sesjoner
        initSokelogg();                    // Søkelogg: 🕘-knapp + fang søk (lokal, tømmes ved dagsskifte)
        initMeldingsfelt();                // Driftsmelding-felt (per kontor, fra admin.php)
        pollVentende();                    // Første turid-poll
        pollPnrVentende();                 // Første pnr-poll
        pollTlfVentende();                 // Første tlf-poll
        sjekkNavigerEtterLoad();           // Fortsett evt. navigering fra forrige side
        pollNissyNavigerVentende();        // Første nissy_naviger-poll
        vaskOmraadeMotNissy(t);            // Vask VÅRT område-soner mot NISSY (maks 1×/døgn, krever admin)
        hoestAlleKjorekontor(t);           // Høst ALLE kjørekontor → nasjonal postnr→kontor (maks 1×/uke)
        setInterval(oppdaterAdminStatus, ADMIN_PING_MS);
        setInterval(oppdaterRekvisisjonStatus, ADMIN_PING_MS);
        setInterval(pollVentende, TURID_POLL_MS);
        setInterval(pollPnrVentende, TURID_POLL_MS);
        setInterval(pollTlfVentende, TURID_POLL_MS);
        setInterval(pollNissyNavigerVentende, TURID_POLL_MS);
        setInterval(pollBhsSokVentende, TURID_POLL_MS);
    });
})();
