<?php
// Tar imot Tiltaksboka høstet fra Bliksund (procedure_manual) og lagrer den i
// ovr_tiltaksbok. Samme mønster som behandlingssted_lagre.php: nettleseren har
// Bliksund-sesjonen, serveren har basen — så høstingen skjer i en agent på
// Bliksund-fanen og resultatet POSTes hit.
//
// TO SORTER KORT, og skillet er hele poenget (Thomas 13.08):
//   PROSEDYRER  — Bomtur, Ledsager, Egenandeler, Beredskap. Organisatorisk kunnskap
//                 uten personopplysninger. Innholdet kan ligge hos oss.
//   SAKER       — kapitlene «Søknader» og «Fullmakter». Enkeltvedtak om navngitte
//                 personer, arkivert i P360 («26/02108-1 Fullmakt»). Fullmaktene er
//                 «veldig lik vedtakene» (Thomas), så de behandles likt: vi lagrer
//                 KUN tittel, saksnummer og lenke — aldri innholdet. Operatøren ser
//                 at saken finnes og klikker seg inn i Bliksund for å lese den.
//
// POST JSON {bok, kort:[{id, kortnummer, tittel, sokeord, kapittel_id, kapittel_navn,
//                        sist_oppdatert, url, innhold?}], av}
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'feil' => 'krever POST']); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

// Kapitler som inneholder enkeltsaker om navngitte personer. Lagres som pekere.
// Utvides ved behov — nye kapitler er som standard prosedyrer.
const SAK_KAPITLER = [42, 115];   // 42 = Søknader, 115 = Fullmakter

$pdo->exec("CREATE TABLE IF NOT EXISTS ovr_tiltaksbok (
    id INT PRIMARY KEY,
    bok INT NOT NULL,
    kortnummer VARCHAR(20) DEFAULT NULL,
    tittel VARCHAR(300) NOT NULL,
    sokeord TEXT DEFAULT NULL,
    kapittel_id INT DEFAULT NULL,
    kapittel_navn VARCHAR(150) DEFAULT NULL,
    er_sak TINYINT(1) NOT NULL DEFAULT 0,
    innhold MEDIUMTEXT DEFAULT NULL,
    sist_oppdatert DATETIME DEFAULT NULL,
    url VARCHAR(300) DEFAULT NULL,
    hostet DATETIME NOT NULL,
    av VARCHAR(80) DEFAULT NULL,
    INDEX (bok), INDEX (kapittel_id), INDEX (kortnummer), INDEX (er_sak),
    FULLTEXT KEY ft_sok (tittel, sokeord)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$body = json_decode(file_get_contents('php://input'), true);
$kort = is_array($body['kort'] ?? null) ? $body['kort'] : [];
$bok  = (int)($body['bok'] ?? 0);
$av   = substr((string)($body['av'] ?? ''), 0, 80);
if (!$bok)  { echo json_encode(['ok' => false, 'feil' => 'mangler bok-id']); exit; }
if (!$kort) { echo json_encode(['ok' => false, 'feil' => 'tom kort-liste']); exit; }

// «2026-04-13 07:55:26» → DATETIME. Alt annet blir NULL framfor å feile.
$dato = function ($raa) {
    $s = trim((string)$raa);
    return preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $s) ? $s : null;
};

$st = $pdo->prepare("REPLACE INTO ovr_tiltaksbok
    (id, bok, kortnummer, tittel, sokeord, kapittel_id, kapittel_navn, er_sak, innhold, sist_oppdatert, url, hostet, av)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW(),?)");

$n = 0; $hoppet = 0; $saker = 0; $medInnhold = 0;
foreach ($kort as $k) {
    if (!isset($k['id']) || !is_numeric($k['id']) || trim((string)($k['tittel'] ?? '')) === '') { $hoppet++; continue; }
    $kapId = isset($k['kapittel_id']) && is_numeric($k['kapittel_id']) ? (int)$k['kapittel_id'] : null;
    $erSak = $kapId !== null && in_array($kapId, SAK_KAPITLER, true) ? 1 : 0;

    // Vernet ligger HER, ikke bare i agenten: sender noen innhold for et sakskort —
    // ved en feil eller en framtidig endring i agenten — kastes det uansett.
    $innhold = $erSak ? null : (trim((string)($k['innhold'] ?? '')) ?: null);
    if ($erSak) $saker++;
    if ($innhold !== null) $medInnhold++;

    $st->execute([
        (int)$k['id'],
        $bok,
        substr(trim((string)($k['kortnummer'] ?? '')), 0, 20) ?: null,
        substr(trim((string)$k['tittel']), 0, 300),
        substr(trim((string)($k['sokeord'] ?? '')), 0, 4000) ?: null,
        $kapId,
        substr(trim((string)($k['kapittel_navn'] ?? '')), 0, 150) ?: null,
        $erSak,
        $innhold,
        $dato($k['sist_oppdatert'] ?? null),
        substr(trim((string)($k['url'] ?? '')), 0, 300) ?: null,
        $av,
    ]);
    $n++;
}

echo json_encode(['ok' => true, 'lagret' => $n, 'hoppet' => $hoppet,
                  'saker' => $saker, 'med_innhold' => $medInnhold]);
