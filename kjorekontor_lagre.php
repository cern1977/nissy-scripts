<?php
// NASJONAL kjørekontor-liste: tar imot ALLE dispatch-sentre høstet fra NISSY (getDispatchCenter +
// editDispatchCenter → dispatchFilter.fromPostCodes1) og lagrer i ovr_kjorekontor. Brukt til å svare
// «hvilket kjørekontor tilhører dette postnummeret» (kjorekontor.php). Kun kontornavn + postnr-rekker.
// Egen tabell — IKKE ovr_kontor_tilgang (som kun er VÅRE 2 driftskontor / tilgang).
// POST JSON {sentre:[{id,navn,omraade}], av}.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'feil' => 'krever POST']); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();
$pdo->exec("CREATE TABLE IF NOT EXISTS ovr_kjorekontor (
    id INT PRIMARY KEY,
    navn VARCHAR(120) NOT NULL,
    omraade TEXT,
    oppdatert DATETIME NOT NULL,
    av VARCHAR(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$body = json_decode(file_get_contents('php://input'), true);
$sentre = is_array($body['sentre'] ?? null) ? $body['sentre'] : [];
$av = substr((string)($body['av'] ?? ''), 0, 80);
if (!$sentre) { echo json_encode(['ok' => false, 'feil' => 'tom sentre-liste']); exit; }

$st = $pdo->prepare("REPLACE INTO ovr_kjorekontor (id, navn, omraade, oppdatert, av) VALUES (?,?,?,NOW(),?)");
$n = 0; $hoppet = 0;
foreach ($sentre as $s) {
    if (!isset($s['id']) || !is_numeric($s['id'])) { $hoppet++; continue; }
    $omr = preg_replace('/[\s,;]+/', ',', trim((string)($s['omraade'] ?? '')));
    $omr = trim($omr, ',');
    // Aksepter kun postnr-rekker; hopp over sentre med tomt/ugyldig område.
    if ($omr === '' || !preg_match('/^(\d{1,4}(-\d{1,4})?)(,\d{1,4}(-\d{1,4})?)*$/', $omr)) { $hoppet++; continue; }
    $st->execute([(int)$s['id'], substr((string)($s['navn'] ?? ''), 0, 120), $omr, $av]);
    $n++;
}
echo json_encode(['ok' => true, 'lagret' => $n, 'hoppet' => $hoppet]);
