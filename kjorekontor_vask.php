<?php
// VASK: oppdaterer ovr_kontor_tilgang.omraade_postnr for ETT kjørekontor med Område-feltet
// (fromPostCodes1) lest LIVE fra NISSY editDispatchCenter av verktøykassen. Kalles cross-origin
// fra NISSY-konteksten (operatørens browser, admin innlogget der — ikke her).
// POST JSON {kontor, dispatch_center_id, omraade}. Kun postnr-rekker, ingen pasientdata.
// Guard: senter-id må matche det som er konfigurert for kontoret (lett misbruksvern).
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo json_encode(['ok' => false, 'feil' => 'krever POST']); exit; }

$body = json_decode(file_get_contents('php://input'), true);
$kontor = trim((string)($body['kontor'] ?? ''));
$dc = (int)($body['dispatch_center_id'] ?? 0);
$omrRaa = (string)($body['omraade'] ?? '');

// Normaliser: NISSY-feltet kan ha linjeskift/mellomrom — gjør om til komma-separerte rekker.
$omr = preg_replace('/[\s,;]+/', ',', trim($omrRaa));
$omr = trim($omr, ',');

if ($kontor === '' || $dc <= 0) { echo json_encode(['ok' => false, 'feil' => 'mangler kontor/senter']); exit; }
// Aksepter KUN postnr-rekker (siffer, bindestrek, komma) — avvis alt annet.
if ($omr === '' || !preg_match('/^(\d{1,4}(-\d{1,4})?)(,\d{1,4}(-\d{1,4})?)*$/', $omr)) {
    echo json_encode(['ok' => false, 'feil' => 'ugyldig område-format', 'fikk' => substr($omrRaa, 0, 80)]); exit;
}

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();
// Last-check-dato: når området sist ble vasket mot NISSY (idempotent kolonne).
if (!$pdo->query("SHOW COLUMNS FROM ovr_kontor_tilgang LIKE 'omraade_oppdatert'")->fetchAll()) {
    try { $pdo->exec("ALTER TABLE ovr_kontor_tilgang ADD COLUMN omraade_oppdatert DATETIME NULL AFTER omraade_postnr"); } catch (Exception $e) {}
}
// Guard: oppdater kun hvis kontoret faktisk er konfigurert med dette senteret.
$st = $pdo->prepare("UPDATE ovr_kontor_tilgang SET omraade_postnr = ?, omraade_oppdatert = NOW() WHERE kjorekontor = ? AND dispatch_center_id = ?");
$st->execute([$omr, $kontor, $dc]);
if ($st->rowCount() === 0) {
    // rowCount 0 kan bety «ingen endring» ELLER «matchet ikke» — sjekk om raden finnes
    $finnes = $pdo->prepare("SELECT 1 FROM ovr_kontor_tilgang WHERE kjorekontor = ? AND dispatch_center_id = ?");
    $finnes->execute([$kontor, $dc]);
    if (!$finnes->fetchColumn()) { echo json_encode(['ok' => false, 'feil' => 'kontor/senter matchet ikke konfigurasjon']); exit; }
}
echo json_encode(['ok' => true, 'kontor' => $kontor, 'omraade' => $omr]);
