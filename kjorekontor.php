<?php
// Oppslag: hvilket kjørekontor dekker et postnummer? Leser nasjonal ovr_kjorekontor (høstet fra NISSY).
// GET ?postnr=NNNN → { ok, postnr, kontor, id, oppdatert } eller { ok:false }.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

// ?alle → hele nasjonale lista (read-only oversikt i admin).
if (isset($_GET['alle'])) {
    try {
        $rows = $pdo->query("SELECT id, navn, omraade, oppdatert FROM ovr_kjorekontor ORDER BY navn")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['ok' => true, 'kontorer' => $rows]);
    } catch (Exception $e) { echo json_encode(['ok' => true, 'kontorer' => []]); }
    exit;
}

// ?status → ferskhet/last-check (brukt av høsteren for å avgjøre om månedlig vask trengs).
if (isset($_GET['status'])) {
    try {
        $r = $pdo->query("SELECT COUNT(*) antall, MAX(oppdatert) sist FROM ovr_kjorekontor")->fetch(PDO::FETCH_ASSOC);
        $alder = $r['sist'] ? floor((time() - strtotime($r['sist'])) / 86400) : null;
        echo json_encode(['ok' => true, 'antall' => (int)$r['antall'], 'sist' => $r['sist'], 'alder_dager' => $alder]);
    } catch (Exception $e) { echo json_encode(['ok' => true, 'antall' => 0, 'sist' => null, 'alder_dager' => null]); }
    exit;
}

$pnr = preg_match('/\d{4}/', $_GET['postnr'] ?? '', $m) ? (int)$m[0] : null;
if ($pnr === null) { echo json_encode(['ok' => false, 'feil' => 'mangler/ugyldig postnr']); exit; }
try {
    $rows = $pdo->query("SELECT id, navn, omraade, oppdatert FROM ovr_kjorekontor")->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { echo json_encode(['ok' => false, 'feil' => 'ingen data ennå']); exit; }

function dekker($omr, $p) {
    foreach (preg_split('/[,\s]+/', trim((string)$omr)) as $t) {
        if ($t === '') continue;
        if (preg_match('/^(\d{1,4})-(\d{1,4})$/', $t, $mm)) { if ($p >= (int)$mm[1] && $p <= (int)$mm[2]) return true; }
        elseif (preg_match('/^(\d{1,4})$/', $t)) { if ($p === (int)$t) return true; }
    }
    return false;
}

foreach ($rows as $r) {
    if (dekker($r['omraade'], $pnr)) {
        echo json_encode(['ok' => true, 'postnr' => $pnr, 'kontor' => $r['navn'], 'id' => (int)$r['id'], 'oppdatert' => $r['oppdatert']]);
        exit;
    }
}
echo json_encode(['ok' => false, 'postnr' => $pnr, 'feil' => 'ingen kontor dekker']);
