<?php
// Endepunkt for verktoykasse.js — henter ventende turids fra zisson_anrop,
// der geo_hentet=0. Senere vil Pinger.js kalle NISSY for å hente geo og
// POSTe tilbake via handling=svar.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

function svar($x) { echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }

$handling = $_GET['handling'] ?? 'pending';

// === PENDING: returner liste med ventende turid-oppdrag for brukeren ===
if ($handling === 'pending') {
    $nissy = strtolower(trim($_GET['nissy'] ?? ''));

    // Finn brukerens aliaser fra dp_ansatte (samme logikk som zisson.php)
    $aliaser = [];
    if ($nissy) {
        $s = $pdo->prepare("SELECT brukernavn, nissy_brukernavn, navn, epost FROM dp_ansatte WHERE nissy_brukernavn = ? OR ((nissy_brukernavn IS NULL OR nissy_brukernavn = '') AND (brukernavn = ? OR SUBSTRING_INDEX(epost, '@', 1) = ?)) ORDER BY (nissy_brukernavn = ?) DESC LIMIT 1");
        $s->execute([$nissy, $nissy, $nissy, $nissy]);
        if ($r = $s->fetch(PDO::FETCH_ASSOC)) {
            foreach (['brukernavn','nissy_brukernavn','navn','epost'] as $k) {
                if ($r[$k]) $aliaser[] = $r[$k];
            }
            if ($r['epost']) {
                $prefix = explode('@', $r['epost'])[0];
                if ($prefix) $aliaser[] = $prefix;
            }
            // Match også mot brukere-tabell (portal-navn)
            if ($r['brukernavn']) {
                $s2 = $pdo->prepare("SELECT navn FROM brukere WHERE epost LIKE ?");
                $s2->execute([$r['brukernavn'] . '@%']);
                if ($portalNavn = $s2->fetchColumn()) $aliaser[] = $portalNavn;
            }
        }
    }
    $aliaser = array_values(array_unique(array_filter($aliaser)));

    if (empty($aliaser)) {
        svar(['ok' => true, 'anrop' => [], 'nissy' => $nissy, 'grunn' => 'ingen aliaser funnet for nissy-brukernavn', 'aliaser' => []]);
    }

    $ph = implode(',', array_fill(0, count($aliaser), '?'));
    $stmt = $pdo->prepare("
        SELECT a.id, a.telefon, a.agent, a.tid, a.turid, a.geo_hentet,
               k.navn AS k_navn, k.avdeling AS k_avdeling, k.type AS k_type, k.undertype AS k_undertype
        FROM zisson_anrop a
        LEFT JOIN zisson_kontakter k ON k.id = a.kontakt_id
        WHERE a.turid IS NOT NULL AND a.turid != ''
          AND a.geo_hentet = 0
          AND a.agent IN ($ph)
          AND a.tid >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY a.tid DESC LIMIT 50
    ");
    $stmt->execute($aliaser);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    svar(['ok' => true, 'anrop' => $rows, 'nissy' => $nissy, 'aliaser' => $aliaser]);
}

// === SVAR: verktøykasse rapporterer data fra NISSY ===
if ($handling === 'svar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $dataJson = $_POST['data'] ?? null;
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);

    // Valider at dataJson er gyldig JSON (hvis gitt)
    if ($dataJson !== null) {
        $parsed = json_decode($dataJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            svar(['ok' => false, 'feil' => 'ugyldig JSON: ' . json_last_error_msg()]);
        }
        $pdo->prepare("UPDATE zisson_anrop SET geo_hentet = 1, nissy_data = ? WHERE id = ?")
            ->execute([$dataJson, $id]);
    } else {
        $pdo->prepare("UPDATE zisson_anrop SET geo_hentet = 1 WHERE id = ?")->execute([$id]);
    }
    svar(['ok' => true, 'id' => $id]);
}

// ================= PNR-OPPSLAG (ssnSearch i NISSY admin) =================

// PNR_NY: Zisson/klient ber om oppslag — dedupliserer med nylig identisk oppslag
if ($handling === 'pnr_ny' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $pnr = preg_replace('/\D/', '', $_POST['pnr'] ?? '');
    $av  = trim($_POST['av'] ?? 'ukjent');
    if (strlen($pnr) !== 11) svar(['ok' => false, 'feil' => 'pnr må være 11 siffer']);
    // Hvis det finnes et ferdig oppslag < 10 min gammelt: gjenbruk
    $s = $pdo->prepare("SELECT id, ferdig, resultat, feil, svart_tid FROM zisson_pnr_oppslag WHERE pnr = ? AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) ORDER BY id DESC LIMIT 1");
    $s->execute([$pnr]);
    if ($eks = $s->fetch(PDO::FETCH_ASSOC)) {
        svar(['ok' => true, 'id' => (int)$eks['id'], 'cached' => true, 'ferdig' => (int)$eks['ferdig'], 'resultat' => $eks['resultat'] ? json_decode($eks['resultat'], true) : null]);
    }
    $pdo->prepare("INSERT INTO zisson_pnr_oppslag (pnr, etterspurt_av) VALUES (?,?)")->execute([$pnr, $av]);
    svar(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'cached' => false]);
}

// PNR_PENDING: verktøykasse henter ventende oppslag
if ($handling === 'pnr_pending') {
    $rows = $pdo->query("SELECT id, pnr FROM zisson_pnr_oppslag WHERE ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) ORDER BY etterspurt_tid ASC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    svar(['ok' => true, 'oppslag' => $rows]);
}

// PNR_SVAR: verktøykasse rapporterer resultat
if ($handling === 'pnr_svar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id  = (int)($_POST['id'] ?? 0);
    $res = $_POST['resultat'] ?? null;
    $feil = $_POST['feil'] ?? null;
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    if ($res !== null) {
        $parsed = json_decode($res, true);
        if (json_last_error() !== JSON_ERROR_NONE) svar(['ok' => false, 'feil' => 'ugyldig JSON']);
    }
    $pdo->prepare("UPDATE zisson_pnr_oppslag SET ferdig = 1, svart_tid = NOW(), resultat = ?, feil = ? WHERE id = ?")
        ->execute([$res, $feil, $id]);
    svar(['ok' => true, 'id' => $id]);
}

// PNR_STATUS: klient poller om et spesifikt oppslag er ferdig
if ($handling === 'pnr_status') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    $s = $pdo->prepare("SELECT id, ferdig, resultat, feil, etterspurt_tid, svart_tid FROM zisson_pnr_oppslag WHERE id = ?");
    $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if ($r && $r['resultat']) $r['resultat'] = json_decode($r['resultat'], true);
    svar(['ok' => true, 'oppslag' => $r ?: null]);
}

// ================= TLF-OPPSLAG (findPatient i NISSY admin) =================
// Lagres i unified nissy_oppslag-tabell med type='tlf'.

// TLF_NY: Zisson/klient ber om telefon-oppslag — dedupliserer med nylig identisk oppslag
// parametre (valgfri JSON): {kort_id, kort_kandidater, ko_navn} — for berikende toast
if ($handling === 'tlf_ny' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $tlf = preg_replace('/\D/', '', $_POST['tlf'] ?? '');
    $av  = trim($_POST['av'] ?? 'ukjent');
    $parametreRaw = $_POST['parametre'] ?? null;
    if (strlen($tlf) !== 8) svar(['ok' => false, 'feil' => 'tlf må være 8 siffer']);
    // Dedup: kun gjenbruk hvis det finnes en pending jobb (ferdig=0) for samme nummer
    // HOS SAMME MOTTAKER. Behandlede jobber (ferdig=1) representerer tidligere anrop —
    // nytt anrop = ny jobb.
    //
    // etterspurt_av MÅ være med: pollingen leverer bare til den jobben er stilet til, så
    // en jobb som ligger og venter hos én operatør blokkerte alle andre fra å få sin egen.
    // Ringer samme nummer til to operatører innen 10 min — eller tester Thomas et anrop
    // som allerede ligger ubesvart hos en kollega (40403120 hos thokos 12.08) — fikk den
    // andre bare «cached» og aldri noen toast.
    $s = $pdo->prepare("SELECT id FROM nissy_oppslag WHERE type = 'tlf' AND nokkel = ? AND etterspurt_av = ? AND ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) ORDER BY id DESC LIMIT 1");
    $s->execute([$tlf, $av]);
    if ($eks = $s->fetch(PDO::FETCH_ASSOC)) {
        svar(['ok' => true, 'id' => (int)$eks['id'], 'cached' => true, 'ferdig' => 0, 'av' => $av]);
    }
    // Valider parametre er gyldig JSON (eller null) — server-side beskyttelse
    $parametre = null;
    if ($parametreRaw !== null && $parametreRaw !== '') {
        $decoded = json_decode($parametreRaw, true);
        if (is_array($decoded)) $parametre = json_encode($decoded, JSON_UNESCAPED_UNICODE);
    }
    $pdo->prepare("INSERT INTO nissy_oppslag (type, nokkel, parametre, etterspurt_av) VALUES ('tlf', ?, ?, ?)")
        ->execute([$tlf, $parametre, $av]);
    svar(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'cached' => false]);
}

// TLF_PENDING: verktøykasse henter ventende tlf-oppslag (m/parametre for toast-berikning)
// SIKKERHET: filter på etterspurt_av matchet mot brukerens aliaser i dp_ansatte, slik at
// hver operatør kun ser sine egne anrop — ikke broadcasted til alle innloggede.
// Hvis ingen nissy oppgis: returner tom liste (defensiv — hindrer leakage).
if ($handling === 'tlf_pending') {
    $nissy = strtolower(trim($_GET['nissy'] ?? ''));
    if (!$nissy) svar(['ok' => true, 'oppslag' => []]);
    $aliaser = [];
    $s = $pdo->prepare("SELECT brukernavn, nissy_brukernavn, navn, epost FROM dp_ansatte WHERE nissy_brukernavn = ? OR ((nissy_brukernavn IS NULL OR nissy_brukernavn = '') AND (brukernavn = ? OR SUBSTRING_INDEX(epost, '@', 1) = ?)) ORDER BY (nissy_brukernavn = ?) DESC LIMIT 1");
    $s->execute([$nissy, $nissy, $nissy, $nissy]);
    if ($r = $s->fetch(PDO::FETCH_ASSOC)) {
        foreach (['brukernavn','nissy_brukernavn','navn','epost'] as $k) {
            if ($r[$k]) $aliaser[] = $r[$k];
        }
        if ($r['epost']) {
            $prefix = explode('@', $r['epost'])[0];
            if ($prefix) $aliaser[] = $prefix;
        }
    }
    $aliaser = array_values(array_unique(array_filter($aliaser)));
    if (empty($aliaser)) svar(['ok' => true, 'oppslag' => []]);
    $ph = implode(',', array_fill(0, count($aliaser), '?'));
    $stmt = $pdo->prepare("SELECT id, nokkel AS tlf, parametre FROM nissy_oppslag WHERE type = 'tlf' AND ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND etterspurt_av IN ($ph) ORDER BY etterspurt_tid DESC LIMIT 10");
    $stmt->execute($aliaser);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) {
        $r['parametre'] = $r['parametre'] ? json_decode($r['parametre'], true) : null;
    }
    svar(['ok' => true, 'oppslag' => $rows]);
}

// TLF_SVAR: verktøykasse rapporterer resultat
if ($handling === 'tlf_svar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id  = (int)($_POST['id'] ?? 0);
    $res = $_POST['resultat'] ?? null;
    $feil = $_POST['feil'] ?? null;
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    if ($res !== null) {
        $parsed = json_decode($res, true);
        if (json_last_error() !== JSON_ERROR_NONE) svar(['ok' => false, 'feil' => 'ugyldig JSON']);
    }
    $pdo->prepare("UPDATE nissy_oppslag SET ferdig = 1, svart_tid = NOW(), resultat = ?, feil = ? WHERE id = ? AND type = 'tlf'")
        ->execute([$res, $feil, $id]);
    svar(['ok' => true, 'id' => $id]);
}

// SJÅFØR: tlf → løyve-register (SELVLÆRENDE). Sjåførlinje-anrop: toasten slår opp løyvet automatisk;
// ukjent nummer → operatøren taster løyvet én gang (lagres her) → neste gang automatisk.
// Tabellen opprettes ved første bruk (CREATE IF NOT EXISTS — idempotent, billig).
if ($handling === 'sjafor_tlf_oppslag') {
    $tlf = preg_replace('/\D/', '', $_GET['tlf'] ?? '');
    if (strlen($tlf) !== 8) svar(['ok' => false, 'feil' => 'tlf må være 8 siffer']);
    $pdo->exec("CREATE TABLE IF NOT EXISTS sjafor_tlf (tlf VARCHAR(8) PRIMARY KEY, loyve VARCHAR(32) NOT NULL, av VARCHAR(64), oppdatert TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) DEFAULT CHARSET=utf8mb4");
    $s = $pdo->prepare("SELECT loyve FROM sjafor_tlf WHERE tlf = ?");
    $s->execute([$tlf]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    svar(['ok' => true, 'loyve' => $r ? $r['loyve'] : null]);
}

// SJÅFØR: lagre/oppdater tlf → løyve (fra toast-input når operatøren taster løyvet)
if ($handling === 'sjafor_tlf_lagre' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $tlf = preg_replace('/\D/', '', $_POST['tlf'] ?? '');
    $loyve = trim($_POST['loyve'] ?? '');
    $av = trim($_POST['av'] ?? '');
    if (strlen($tlf) !== 8 || $loyve === '' || mb_strlen($loyve) > 32) svar(['ok' => false, 'feil' => 'krever tlf (8 siffer) + loyve (maks 32 tegn)']);
    $pdo->exec("CREATE TABLE IF NOT EXISTS sjafor_tlf (tlf VARCHAR(8) PRIMARY KEY, loyve VARCHAR(32) NOT NULL, av VARCHAR(64), oppdatert TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) DEFAULT CHARSET=utf8mb4");
    $pdo->prepare("INSERT INTO sjafor_tlf (tlf, loyve, av) VALUES (?,?,?) ON DUPLICATE KEY UPDATE loyve = VALUES(loyve), av = VALUES(av)")->execute([$tlf, $loyve, $av]);
    svar(['ok' => true]);
}

// TLF_STATUS: klient poller om et spesifikt oppslag er ferdig
if ($handling === 'tlf_status') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    $s = $pdo->prepare("SELECT id, ferdig, resultat, feil, etterspurt_tid, svart_tid FROM nissy_oppslag WHERE id = ? AND type = 'tlf'");
    $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if ($r && $r['resultat']) $r['resultat'] = json_decode($r['resultat'], true);
    svar(['ok' => true, 'oppslag' => $r ?: null]);
}

// ================= NISSY_NAVIGER (generisk modul-navigering) =================
// Verktøykassen plukker opp jobben, åpner riktig URL i NISSY og fyller inn søk.
// Type='nissy_naviger', parametre=JSON({modul, ssn, ...}). Ingen cache.

// NISSY_NAVIGER_NY: opprett navigerings-jobb
if ($handling === 'nissy_naviger_ny' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $modul = trim($_POST['modul'] ?? '');
    $ssn   = preg_replace('/\D/', '', $_POST['ssn'] ?? '');
    $av    = trim($_POST['av'] ?? 'ukjent');
    if (!in_array($modul, ['rekvisisjon', 'planlegging', 'attestasjon'], true)) {
        svar(['ok' => false, 'feil' => 'ugyldig modul: ' . $modul]);
    }
    $parametre = ['modul' => $modul];
    if ($ssn !== '') $parametre['ssn'] = $ssn;
    // Bruker modul som nokkel for enkel identifikasjon i kø
    $pdo->prepare("INSERT INTO nissy_oppslag (type, nokkel, parametre, etterspurt_av) VALUES ('nissy_naviger', ?, ?, ?)")
        ->execute([$modul, json_encode($parametre, JSON_UNESCAPED_UNICODE), $av]);
    svar(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
}

// NISSY_NAVIGER_PENDING: verktøykasse henter ventende navigerings-jobber for SIN bruker
// Filter på etterspurt_av matchet mot brukerens aliaser (dp_ansatte) — slik at hver
// operatør kun plukker opp sine egne jobber, ikke andres.
if ($handling === 'nissy_naviger_pending') {
    $nissy = strtolower(trim($_GET['nissy'] ?? ''));
    if (!$nissy) svar(['ok' => true, 'oppslag' => []]);
    $aliaser = [];
    $s = $pdo->prepare("SELECT brukernavn, nissy_brukernavn, navn, epost FROM dp_ansatte WHERE nissy_brukernavn = ? OR ((nissy_brukernavn IS NULL OR nissy_brukernavn = '') AND (brukernavn = ? OR SUBSTRING_INDEX(epost, '@', 1) = ?)) ORDER BY (nissy_brukernavn = ?) DESC LIMIT 1");
    $s->execute([$nissy, $nissy, $nissy, $nissy]);
    if ($r = $s->fetch(PDO::FETCH_ASSOC)) {
        foreach (['brukernavn','nissy_brukernavn','navn','epost'] as $k) {
            if ($r[$k]) $aliaser[] = $r[$k];
        }
        if ($r['epost']) {
            $prefix = explode('@', $r['epost'])[0];
            if ($prefix) $aliaser[] = $prefix;
        }
    }
    $aliaser = array_values(array_unique(array_filter($aliaser)));
    if (empty($aliaser)) svar(['ok' => true, 'oppslag' => []]);
    $ph = implode(',', array_fill(0, count($aliaser), '?'));
    $stmt = $pdo->prepare("SELECT id, parametre FROM nissy_oppslag WHERE type = 'nissy_naviger' AND ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND etterspurt_av IN ($ph) ORDER BY etterspurt_tid ASC LIMIT 5");
    $stmt->execute($aliaser);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) {
        $r['parametre'] = $r['parametre'] ? json_decode($r['parametre'], true) : null;
    }
    svar(['ok' => true, 'oppslag' => $rows]);
}

// NISSY_NAVIGER_SVAR: verktøykasse rapporterer at navigering er igangsatt eller feilet
if ($handling === 'nissy_naviger_svar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id   = (int)($_POST['id'] ?? 0);
    $feil = $_POST['feil'] ?? null;
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    $pdo->prepare("UPDATE nissy_oppslag SET ferdig = 1, svart_tid = NOW(), feil = ? WHERE id = ? AND type = 'nissy_naviger'")
        ->execute([$feil, $id]);
    svar(['ok' => true, 'id' => $id]);
}

// NISSY_NAVIGER_STATUS: klient poller om navigering er ferdig
if ($handling === 'nissy_naviger_status') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    $s = $pdo->prepare("SELECT id, ferdig, feil, etterspurt_tid, svart_tid FROM nissy_oppslag WHERE id = ? AND type = 'nissy_naviger'");
    $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    svar(['ok' => true, 'oppslag' => $r ?: null]);
}

// ================= BHS_SOK (søk behandlingssted i NISSY på forespørsel) =================
// Registeret vårt er et øyeblikksbilde, og en full høsting tar seks minutter — den tiden
// har man ikke midt i et anrop (Thomas 13.08). Mangler stedet, skal operatøren kunne be om
// ETT søk der og da: zisson.php legger jobben, verktøykassen i NISSY-fanen kjører NISSYs
// egen søkeside og leverer treffene tilbake. Nettsiden kan ikke spørre NISSY selv — annet
// origin, samme sperre som på attest.
//
// Treffene skrives inn i ovr_behandlingssted når operatøren velger ett, så hullet tettes
// av den som faktisk trengte stedet.

// BHS_SOK_NY: opprett søkejobb
if ($handling === 'bhs_sok_ny' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $q  = trim($_POST['q'] ?? '');
    $av = trim($_POST['av'] ?? 'ukjent');
    // Kjent NISSY-id: hopp over søket og hent stedet direkte. Brukes av «🔄 høst nå» på
    // kortet — registeret er en cache, og da må man kunne friske opp ETT sted uten å
    // vente på en full høsting (Thomas 13.08).
    $nissyId = (int)($_POST['nissy_id'] ?? 0);
    if ($nissyId > 0) {
        $s = $pdo->prepare("SELECT id FROM nissy_oppslag WHERE type = 'bhs_sok' AND nokkel = ? AND etterspurt_av = ?
                            AND ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 2 MINUTE) ORDER BY id DESC LIMIT 1");
        $s->execute(['#' . $nissyId, $av]);
        if ($eks = $s->fetchColumn()) svar(['ok' => true, 'id' => (int)$eks, 'cached' => true]);
        $pdo->prepare("INSERT INTO nissy_oppslag (type, nokkel, parametre, etterspurt_av) VALUES ('bhs_sok', ?, ?, ?)")
            ->execute(['#' . $nissyId, json_encode(['nissy_id' => $nissyId], JSON_UNESCAPED_UNICODE), $av]);
        svar(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'cached' => false]);
    }
    if (mb_strlen($q) < 3) svar(['ok' => false, 'feil' => 'søkeordet må ha minst 3 tegn']);
    // Dedup per mottaker (samme regel som tlf_ny): trykker operatøren to ganger, skal det
    // ikke bli to jobber — men en annen operatørs jobb skal aldri blokkere din.
    $s = $pdo->prepare("SELECT id FROM nissy_oppslag WHERE type = 'bhs_sok' AND nokkel = ? AND etterspurt_av = ?
                        AND ferdig = 0 AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 2 MINUTE) ORDER BY id DESC LIMIT 1");
    $s->execute([mb_substr($q, 0, 100), $av]);
    if ($eks = $s->fetchColumn()) svar(['ok' => true, 'id' => (int)$eks, 'cached' => true]);

    $pdo->prepare("INSERT INTO nissy_oppslag (type, nokkel, parametre, etterspurt_av) VALUES ('bhs_sok', ?, ?, ?)")
        ->execute([mb_substr($q, 0, 100), json_encode(['q' => $q], JSON_UNESCAPED_UNICODE), $av]);
    svar(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'cached' => false]);
}

// BHS_SOK_PENDING: verktøykassen henter sine egne ventende søk
if ($handling === 'bhs_sok_pending') {
    $nissy = strtolower(trim($_GET['nissy'] ?? ''));
    if (!$nissy) svar(['ok' => true, 'oppslag' => []]);
    $aliaser = [];
    $s = $pdo->prepare("SELECT brukernavn, nissy_brukernavn, navn, epost FROM dp_ansatte WHERE nissy_brukernavn = ? OR ((nissy_brukernavn IS NULL OR nissy_brukernavn = '') AND (brukernavn = ? OR SUBSTRING_INDEX(epost, '@', 1) = ?)) ORDER BY (nissy_brukernavn = ?) DESC LIMIT 1");
    $s->execute([$nissy, $nissy, $nissy, $nissy]);
    if ($r = $s->fetch(PDO::FETCH_ASSOC)) {
        foreach (['brukernavn','nissy_brukernavn','navn','epost'] as $k) if ($r[$k]) $aliaser[] = $r[$k];
        if ($r['epost']) { $p = explode('@', $r['epost'])[0]; if ($p) $aliaser[] = $p; }
    }
    $aliaser = array_values(array_unique(array_filter($aliaser)));
    if (empty($aliaser)) svar(['ok' => true, 'oppslag' => []]);
    $ph = implode(',', array_fill(0, count($aliaser), '?'));
    $stmt = $pdo->prepare("SELECT id, nokkel, parametre FROM nissy_oppslag WHERE type = 'bhs_sok' AND ferdig = 0
                           AND etterspurt_tid >= DATE_SUB(NOW(), INTERVAL 3 MINUTE) AND etterspurt_av IN ($ph)
                           ORDER BY etterspurt_tid ASC LIMIT 3");
    $stmt->execute($aliaser);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) $r['parametre'] = $r['parametre'] ? json_decode($r['parametre'], true) : null;
    svar(['ok' => true, 'oppslag' => $rows]);
}

// BHS_SOK_SVAR: verktøykassen leverer treffene [{id, navn, type, adresse, postnr_sted, telefon}]
if ($handling === 'bhs_sok_svar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id   = (int)($_POST['id'] ?? 0);
    $res  = $_POST['resultat'] ?? null;
    $feil = $_POST['feil'] ?? null;
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    if ($res !== null && json_decode($res, true) === null && json_last_error() !== JSON_ERROR_NONE) {
        svar(['ok' => false, 'feil' => 'ugyldig JSON']);
    }
    $pdo->prepare("UPDATE nissy_oppslag SET ferdig = 1, svart_tid = NOW(), resultat = ?, feil = ? WHERE id = ? AND type = 'bhs_sok'")
        ->execute([$res, $feil, $id]);
    svar(['ok' => true, 'id' => $id]);
}

// BHS_SOK_STATUS: zisson.php poller på svaret
if ($handling === 'bhs_sok_status') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) svar(['ok' => false, 'feil' => 'mangler id']);
    $s = $pdo->prepare("SELECT id, ferdig, resultat, feil, etterspurt_tid, svart_tid FROM nissy_oppslag WHERE id = ? AND type = 'bhs_sok'");
    $s->execute([$id]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    if ($r && $r['resultat']) $r['resultat'] = json_decode($r['resultat'], true);
    svar(['ok' => true, 'oppslag' => $r ?: null]);
}

svar(['ok' => false, 'feil' => 'ugyldig handling: ' . $handling]);
