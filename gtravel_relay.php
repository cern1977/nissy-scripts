<?php
/* ============================================================================
 * gtravel_relay.php  —  kø-relé for g-travel flightnr-oppslag (Gardermoen)
 * ----------------------------------------------------------------------------
 * Bro mellom to cross-origin nettlesere:
 *   gardermoen.js (NISSY-fane)  ──be──►  RELÉ  ◄──jobber/svar──  g-travel-agent (gto-fane)
 *
 * Frakter KUN Ressurs-referanse + flightnr/landingstider — INGEN PNR/pasientdata
 * (de blir igjen i g-travel). Fil-basert JSON-kø med flock; kortlevd (TTL).
 *
 * Handlinger (handling=…, JSON eller form):
 *   ping    → {ok:true}                                  (helsesjekk)
 *   be      → {refs:[...]}  → marker ukjente 'venter', returner kjente svar + agentOnline
 *   jobber  → (agent) returner ventende refs + registrer heartbeat
 *   svar    → (agent) {ref, data:{...}} → lagre svar
 *
 * Deploy: ~/webroots/by-route/thomaswestby.no_/pasientreiser/gtravel_relay.php
 *         URL: https://thomaswestby.no/pasientreiser/gtravel_relay.php
 * ========================================================================== */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$FIL          = __DIR__ . '/gtravel_ko.json';
$TTL          = 900;   // forespørsler/svar eldre enn 15 min ryddes bort
$HEARTBEAT_OK = 40;    // agent regnes "online" hvis heartbeat < 40 s gammel
$NOKKEL       = 'grm-gtravel-2026';  // lett delt nøkkel (data er ikke sensitivt — kun hygiene)

// Normaliser en referanse til ren alfanumerisk (12-sifret reknr / 6-tegns bestillingsref).
// Robust mot at klienten sender array, komma-streng ELLER JSON-array-streng — uansett blir
// nøkkelen ren (uten [ ] " som ellers manglet kø-nøkkelen og ga agenten søppel-oppslag).
function normRef($r) { return preg_replace('/[^A-Z0-9]/', '', strtoupper((string)$r)); }
function normRefs($refs) {
    if (is_string($refs)) {
        $j = json_decode($refs, true);
        $refs = is_array($j) ? $j : explode(',', $refs);
    }
    if (!is_array($refs)) $refs = [$refs];
    $ut = [];
    foreach ($refs as $r) {
        if (is_array($r)) $r = reset($r);
        $r = normRef($r);
        if ($r !== '') $ut[$r] = true;   // dedup
    }
    return array_keys($ut);
}

function les($f) {
    if (!file_exists($f)) return ['refs' => [], 'agent' => 0];
    $j = json_decode(@file_get_contents($f), true);
    if (!is_array($j)) return ['refs' => [], 'agent' => 0];
    return $j + ['refs' => [], 'agent' => 0];
}
function skriv($f, $d) {
    $fp = fopen($f, 'c+');
    if (!$fp) return;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($d));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
}

// Input: rå JSON-body (text/plain unngår CORS-preflight) ELLER form/query.
$raw = file_get_contents('php://input');
$in  = json_decode($raw, true);
if (!is_array($in)) $in = $_REQUEST;
$handling = $in['handling'] ?? ($_GET['handling'] ?? '');
$nokkel   = $in['nokkel']   ?? ($_GET['nokkel']   ?? '');

if ($handling === 'ping') { echo json_encode(['ok' => true, 'tid' => time()]); exit; }
if ($nokkel !== $NOKKEL)  { http_response_code(403); echo json_encode(['ok' => false, 'feil' => 'nøkkel']); exit; }

$d  = les($FIL);
$na = time();
foreach ($d['refs'] as $r => $v) { if ($na - ($v['tid'] ?? 0) > $TTL) unset($d['refs'][$r]); }  // rydd gamle

if ($handling === 'be') {
    // gardermoen: be om oppslag for en liste Ressurs-referanser.
    // Returner ferdige svar; marker ukjente som 'venter' (agenten plukker dem opp).
    $ut = [];
    foreach (normRefs($in['refs'] ?? []) as $ref) {
        if (!isset($d['refs'][$ref])) $d['refs'][$ref] = ['status' => 'venter', 'tid' => $na];
        $ut[$ref] = $d['refs'][$ref];
    }
    skriv($FIL, $d);
    echo json_encode(['ok' => true, 'svar' => $ut, 'agentOnline' => ($na - ($d['agent'] ?? 0) <= $HEARTBEAT_OK)]);
    exit;
}

if ($handling === 'jobber') {
    // g-travel-agent: hent ventende referanser + registrer heartbeat (= "online").
    $d['agent'] = $na;
    $vent = [];
    foreach ($d['refs'] as $r => $v) { if (($v['status'] ?? '') === 'venter') $vent[] = $r; }
    skriv($FIL, $d);
    echo json_encode(['ok' => true, 'jobber' => $vent]);
    exit;
}

if ($handling === 'svar') {
    // g-travel-agent: lever svar for én referanse. data = resultatet fra gtravel.oppslag(ref).
    $ref = normRef($in['ref'] ?? '');
    if ($ref === '') { echo json_encode(['ok' => false, 'feil' => 'mangler ref']); exit; }
    $d['refs'][$ref] = ['status' => 'ferdig', 'data' => $in['data'] ?? null, 'tid' => $na];
    skriv($FIL, $d);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'feil' => 'ukjent handling']);
