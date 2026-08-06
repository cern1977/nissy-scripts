<?php
// Oppslag i det høstede behandlingssted-registeret (ovr_behandlingssted, se
// behandlingssted_lagre.php). Dataene er OUS' egne, høstet fra NISSY — ingen
// personopplysninger, så de kan ligge server-side og vises i zisson.php.
//
//   ?tlf=67911470  → hvilke(t) behandlingssted eier nummeret (hovedbruken: innkommende anrop)
//   ?id=37665      → ett sted + underenheter
//   ?sok=skårer    → navnesøk (fallback når nummeret ikke gir treff)
//   ?status        → antall rader + når registeret sist ble oppdatert
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

$FELT = "id, navn, type, sektor, adresse, postnr, poststed, telefon, orgnr, her_id, parent_id, utm_n, utm_o, oppdatert";

try {
    if (isset($_GET['status'])) {
        $n = (int)$pdo->query("SELECT COUNT(*) FROM ovr_behandlingssted")->fetchColumn();
        $sist = $pdo->query("SELECT MAX(oppdatert) FROM ovr_behandlingssted")->fetchColumn();
        $numre = (int)$pdo->query("SELECT COUNT(*) FROM ovr_behandlingssted_tlf")->fetchColumn();
        echo json_encode(['ok' => true, 'antall' => $n, 'numre' => $numre, 'sist_oppdatert' => $sist]);
        exit;
    }

    if (isset($_GET['id'])) {
        $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted WHERE id = ?");
        $s->execute([(int)$_GET['id']]);
        $sted = $s->fetch(PDO::FETCH_ASSOC);
        if (!$sted) { echo json_encode(['ok' => true, 'sted' => null]); exit; }
        $b = $pdo->prepare("SELECT id, navn, type, adresse, postnr, poststed FROM ovr_behandlingssted WHERE parent_id = ? ORDER BY navn");
        $b->execute([(int)$sted['id']]);
        echo json_encode(['ok' => true, 'sted' => $sted, 'underenheter' => $b->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if (isset($_GET['tlf'])) {
        // Samme normalisering som ved lagring: rene sifre uten landkode. Zisson
        // leverer «+4767911470», registeret har «67911470» — begge blir like her.
        $d = preg_replace('/\D/', '', (string)$_GET['tlf']);
        if (strlen($d) === 12 && str_starts_with($d, '0047')) $d = substr($d, 4);
        elseif (strlen($d) === 10 && str_starts_with($d, '47')) $d = substr($d, 2);
        if (strlen($d) < 8) { echo json_encode(['ok' => false, 'feil' => 'for kort nummer']); exit; }
        $s = $pdo->prepare("SELECT b.$FELT FROM ovr_behandlingssted_tlf t
                            JOIN ovr_behandlingssted b ON b.id = t.bhs_id
                            WHERE t.tlf_norm = ? ORDER BY b.navn LIMIT 20");
        $s->execute([$d]);
        echo json_encode(['ok' => true, 'tlf' => $d, 'steder' => $s->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if (isset($_GET['sok'])) {
        $q = trim((string)$_GET['sok']);
        if (mb_strlen($q) < 3) { echo json_encode(['ok' => false, 'feil' => 'minst 3 tegn']); exit; }
        $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted WHERE navn LIKE ? ORDER BY navn LIMIT 25");
        $s->execute(['%' . $q . '%']);
        echo json_encode(['ok' => true, 'steder' => $s->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    echo json_encode(['ok' => false, 'feil' => 'oppgi ?tlf=, ?id=, ?sok= eller ?status']);
} catch (Throwable $e) {
    // Tabellen finnes ikke før første høsting — svar pent i stedet for 500.
    echo json_encode(['ok' => false, 'feil' => 'registeret er ikke høstet ennå']);
}
