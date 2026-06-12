<?php
// ovr_sms_maler.php — server-lagrede SMS-maler for Overvåker Live.
// Redigeres i admin.php?tab=overvaker, hentes av overvaaker_live.js ved oppstart.
// Speiler arkitekturen til ovr_filtre.php (per kjørekontor, getDb fra secret).
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
    $db = getDb();
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'feil' => 'db: ' . $e->getMessage()]);
    exit;
}

// Standardtekster — én kilde for fallback. Brukes både når et kontor ikke har
// egen rad (admin-list fyller inn defaults) og som «tilbakestill»-mål.
// Holdes i synk med de hardkodede malene i overvaaker_live.js.
$STANDARD = [
    'TUR'    => 'Vi ser at pasientreisen din til behandling er forsinket utover 15 min. Vi jobber med å skaffe bil så fort som mulig. Vær tilgjengelig på telefon. Dersom du ikke lenger har behov for reisen må du gi beskjed på 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser',
    'RETUR'  => 'Vi ser at pasientreisen din fra behandling har lengre ventetid enn 60 min. Du blir hentet så fort som mulig. Vær tilgjengelig på telefon. Dersom du ikke lenger har behov for reisen må du gi beskjed på 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser',
    'RUNDE2' => 'Pasientreisen din er fortsatt forsinket. Vi beklager ventetiden og jobber med å skaffe bil. Vær tilgjengelig på telefon. Dersom du ikke lenger har behov for reisen må du gi beskjed på 05515. Denne SMS kan ikke besvares. Mvh Pasientreiser',
];
// Menneskelige etiketter for admin-UI
$ETIKETTER = [
    'TUR'    => 'Forsinket tur til behandling (>15 min)',
    'RETUR'  => 'Lang ventetid fra behandling (>60 min)',
    'RUNDE2' => 'Purring — fortsatt forsinket (runde 2+)',
];

// Idempotent migrering
try {
    $db->exec("CREATE TABLE IF NOT EXISTS ovr_sms_maler (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mal_nokkel VARCHAR(20) NOT NULL,
        tekst TEXT NOT NULL,
        kjorekontor VARCHAR(80) NOT NULL DEFAULT 'Oslo og Akershus',
        oppdatert TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        oppdatert_av VARCHAR(80) NULL,
        UNIQUE KEY uniq_nokkel_kontor (mal_nokkel, kjorekontor)
    ) DEFAULT CHARSET=utf8mb4");
} catch (Throwable $e) { /* ignorer */ }

$kontor = trim($_GET['kontor'] ?? $_POST['kontor'] ?? '');
if (!$kontor) $kontor = 'Oslo og Akershus';

$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

// Hjelper: hent kontorets lagrede maler som [nokkel => rad]
function hentLagrede($db, $kontor) {
    $s = $db->prepare("SELECT mal_nokkel, tekst, oppdatert, oppdatert_av FROM ovr_sms_maler WHERE kjorekontor = ?");
    $s->execute([$kontor]);
    $ut = [];
    foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $r) { $ut[$r['mal_nokkel']] = $r; }
    return $ut;
}

try {
    if ($action === 'list') {
        // Admin-visning: alltid alle nøkler, merge lagret over standard
        $lagrede = hentLagrede($db, $kontor);
        $maler = [];
        foreach ($STANDARD as $nokkel => $std) {
            $rad = $lagrede[$nokkel] ?? null;
            $maler[] = [
                'nokkel'       => $nokkel,
                'etikett'      => $ETIKETTER[$nokkel] ?? $nokkel,
                'tekst'        => $rad['tekst'] ?? $std,
                'standard'     => $std,
                'er_endret'    => $rad !== null && trim($rad['tekst']) !== trim($std),
                'er_egen'      => $rad !== null,
                'oppdatert'    => $rad['oppdatert'] ?? null,
                'oppdatert_av' => $rad['oppdatert_av'] ?? null,
            ];
        }
        echo json_encode(['ok' => true, 'maler' => $maler, 'kontor' => $kontor]);

    } elseif ($action === 'aktive') {
        // Live-visning: flat map nokkel => tekst, standard der kontor mangler rad
        $lagrede = hentLagrede($db, $kontor);
        $ut = [];
        foreach ($STANDARD as $nokkel => $std) {
            $ut[$nokkel] = isset($lagrede[$nokkel]) ? $lagrede[$nokkel]['tekst'] : $std;
        }
        echo json_encode(['ok' => true, 'maler' => $ut, 'kontor' => $kontor]);

    } elseif ($action === 'lagre') {
        $nokkel = strtoupper(trim($_GET['nokkel'] ?? $_POST['nokkel'] ?? ''));
        $tekst  = trim($_POST['tekst'] ?? $_GET['tekst'] ?? '');
        $av     = trim($_GET['av'] ?? $_POST['av'] ?? '');
        if (!isset($STANDARD[$nokkel])) { echo json_encode(['ok' => false, 'feil' => 'Ukjent mal-nøkkel']); exit; }
        if ($tekst === '') { echo json_encode(['ok' => false, 'feil' => 'Tom tekst']); exit; }
        $db->prepare("INSERT INTO ovr_sms_maler (mal_nokkel, tekst, kjorekontor, oppdatert_av)
                      VALUES (?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE tekst = VALUES(tekst), oppdatert_av = VALUES(oppdatert_av)")
            ->execute([$nokkel, $tekst, $kontor, $av ?: null]);
        echo json_encode(['ok' => true]);

    } elseif ($action === 'tilbakestill') {
        // Slett kontorets rad → faller tilbake til standardtekst
        $nokkel = strtoupper(trim($_GET['nokkel'] ?? $_POST['nokkel'] ?? ''));
        if (!isset($STANDARD[$nokkel])) { echo json_encode(['ok' => false, 'feil' => 'Ukjent mal-nøkkel']); exit; }
        $db->prepare("DELETE FROM ovr_sms_maler WHERE mal_nokkel = ? AND kjorekontor = ?")->execute([$nokkel, $kontor]);
        echo json_encode(['ok' => true, 'standard' => $STANDARD[$nokkel]]);

    } else {
        echo json_encode(['ok' => false, 'feil' => 'Ukjent action']);
    }
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'feil' => $e->getMessage()]);
}
