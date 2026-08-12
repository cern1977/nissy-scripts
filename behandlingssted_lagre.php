<?php
// Tar imot behandlingssteder høstet fra NISSY (adminTCDetails) og lagrer dem i
// ovr_behandlingssted. Speiler kjorekontor_lagre.php-mønsteret: nettleseren har
// NISSY-sesjonen, serveren har basen — så høstingen skjer i verktøykassen og
// resultatet POSTes hit.
//
// Behandlingssted er IKKE personopplysninger (Thomas 06.08), så disse dataene kan
// trygt ligge server-side og vises i zisson.php — i motsetning til pasientdata, som
// aldri forlater verktøykassen.
//
// Telefonnumre ligger i EGEN tabell fordi ett sted kan ha flere numre, og fordi
// oppslaget vårt går motsatt vei: fra innringerens nummer til stedet.
//
// POST JSON {steder:[{id,navn,type,sektor,adresse,postnr,poststed,telefon,orgnr,her_id,parent_id,posisjon}], av}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'feil' => 'krever POST']); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

$pdo->exec("CREATE TABLE IF NOT EXISTS ovr_behandlingssted (
    id INT PRIMARY KEY,
    navn VARCHAR(200) NOT NULL,
    type VARCHAR(60) DEFAULT NULL,
    sektor VARCHAR(80) DEFAULT NULL,
    adresse VARCHAR(200) DEFAULT NULL,
    postnr VARCHAR(10) DEFAULT NULL,
    poststed VARCHAR(100) DEFAULT NULL,
    telefon VARCHAR(80) DEFAULT NULL,
    orgnr VARCHAR(12) DEFAULT NULL,
    her_id VARCHAR(20) DEFAULT NULL,
    kortnavn VARCHAR(60) DEFAULT NULL,
    alias VARCHAR(120) DEFAULT NULL,
    parent_id INT DEFAULT NULL,
    utm_n INT DEFAULT NULL,
    utm_o INT DEFAULT NULL,
    oppdatert DATETIME NOT NULL,
    av VARCHAR(80) DEFAULT NULL,
    INDEX (postnr), INDEX (parent_id), INDEX (navn), INDEX (orgnr)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// Ett sted kan ha flere numre (sentralbord, akutt, direkte). Nøkkelen er
// (tlf_norm, bhs_id) så samme nummer kan peke på flere steder — det finnes,
// f.eks. et felles sentralbord for flere avdelinger.
$pdo->exec("CREATE TABLE IF NOT EXISTS ovr_behandlingssted_tlf (
    tlf_norm VARCHAR(16) NOT NULL,
    bhs_id INT NOT NULL,
    PRIMARY KEY (tlf_norm, bhs_id),
    INDEX (bhs_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$body = json_decode(file_get_contents('php://input'), true);
$steder = is_array($body['steder'] ?? null) ? $body['steder'] : [];
$av = substr((string)($body['av'] ?? ''), 0, 80);
if (!$steder) { echo json_encode(['ok' => false, 'feil' => 'tom steder-liste']); exit; }

// «67 91 14 70» → «67911470». Landkode strippes så oppslaget matcher uansett
// hvilken form Zisson leverer innringerens nummer i (+47…, 0047…, rått).
$normTlf = function ($raa) {
    $d = preg_replace('/\D/', '', (string)$raa);
    if ($d === '') return null;
    if (strlen($d) === 12 && str_starts_with($d, '0047')) $d = substr($d, 4);
    elseif (strlen($d) === 10 && str_starts_with($d, '47')) $d = substr($d, 2);
    return strlen($d) >= 8 ? substr($d, 0, 15) : null;
};

// Idempotent for baser som ble laget før kortnavn/alias kom til
foreach (['kortnavn' => 'VARCHAR(60)', 'alias' => 'VARCHAR(120)'] as $kol => $type) {
    try {
        if (!$pdo->query("SHOW COLUMNS FROM ovr_behandlingssted LIKE '$kol'")->fetchAll())
            $pdo->exec("ALTER TABLE ovr_behandlingssted ADD COLUMN $kol $type DEFAULT NULL");
    } catch (Throwable $e) {}
}
$st = $pdo->prepare("REPLACE INTO ovr_behandlingssted
    (id, navn, type, sektor, adresse, postnr, poststed, telefon, orgnr, her_id, kortnavn, alias, parent_id, utm_n, utm_o, oppdatert, av)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?)");
$slettTlf = $pdo->prepare("DELETE FROM ovr_behandlingssted_tlf WHERE bhs_id = ?");
$settTlf  = $pdo->prepare("INSERT IGNORE INTO ovr_behandlingssted_tlf (tlf_norm, bhs_id) VALUES (?,?)");

$n = 0; $hoppet = 0; $nummer = 0;
foreach ($steder as $s) {
    if (!isset($s['id']) || !is_numeric($s['id']) || trim((string)($s['navn'] ?? '')) === '') { $hoppet++; continue; }
    $id = (int)$s['id'];

    // «Postnr/Sted: 1473 Lørenskog» kommer som én streng fra plakaten.
    $postnr = ''; $poststed = '';
    if (preg_match('/(\d{4})\s+(.+)/', (string)($s['postnr_sted'] ?? ''), $m)) {
        $postnr = $m[1]; $poststed = trim($m[2]);
    }
    // «Posisjon X/Y: 6650081 / 273930» — UTM nord/øst, NISSYs egen posisjon.
    $utmN = null; $utmO = null;
    if (preg_match('/(\d{5,})\s*\/\s*(\d{5,})/', (string)($s['posisjon'] ?? ''), $mp)) {
        $utmN = (int)$mp[1]; $utmO = (int)$mp[2];
    }

    $st->execute([
        $id,
        substr(trim((string)$s['navn']), 0, 200),
        substr(trim((string)($s['type'] ?? '')), 0, 60) ?: null,
        substr(trim((string)($s['sektor'] ?? '')), 0, 80) ?: null,
        substr(trim((string)($s['adresse'] ?? '')), 0, 200) ?: null,
        $postnr ?: null,
        substr($poststed, 0, 100) ?: null,
        substr(trim((string)($s['telefon'] ?? '')), 0, 80) ?: null,
        preg_replace('/\D/', '', (string)($s['orgnr'] ?? '')) ?: null,
        substr(preg_replace('/\D/', '', (string)($s['her_id'] ?? '')), 0, 20) ?: null,
        substr(trim((string)($s['kortnavn'] ?? '')), 0, 60) ?: null,
        substr(trim((string)($s['alias'] ?? '')), 0, 120) ?: null,
        isset($s['parent_id']) && is_numeric($s['parent_id']) ? (int)$s['parent_id'] : null,
        $utmN, $utmO,
        $av,
    ]);

    // Telefonfeltet kan inneholde flere numre («67 91 14 70 / 67 91 14 71»).
    // Vi splitter på skilletegn og lagrer hvert nummer for seg.
    $slettTlf->execute([$id]);
    foreach (preg_split('#[/,;]+#', (string)($s['telefon'] ?? '')) as $bit) {
        $t = $normTlf($bit);
        if ($t) { $settTlf->execute([$t, $id]); $nummer++; }
    }
    $n++;
}

echo json_encode(['ok' => true, 'lagret' => $n, 'hoppet' => $hoppet, 'numre' => $nummer]);
