<?php
// === vkt_meld.php — kø for manglende behandlingssteder + tilbakemeldinger fra operatørene ===
//
// TO FORMÅL, ETT ENDEPUNKT (Thomas 31.08):
//
//   1. KØ. Når rekvisisjonsmodulen møter et behandlingssted som ikke finnes i det høstede
//      registeret, meldes id-en hit. Bommene forteller nøyaktig hvilke steder som er i BRUK
//      men utdatert hos oss — langt mer verdt enn å høste 74 000 rader på nytt. Telleren
//      gjør at de mest brukte kommer først.
//
//   2. FEILMELDING. Operatøren kan si fra at et varsel er feil, uten å måtte finne noen å
//      ringe. Det er den eneste måten vi får vite at en regel bommer i praksis.
//
// ⚠️ INGEN PASIENTOPPLYSNINGER. Vi lagrer behandlingssted-id, navn, kommunenumre og en
//    fritekst operatøren selv skriver. Fritekst KAN inneholde noe den ikke burde, så feltet
//    er kort, merket i klienten, og logges aldri sammen med fødselsnummer eller adresse.
//
//   ?meld=mangler&nokkel=45274&navn=Elin+Giæver&detaljer=...&av=thwe
//   ?meld=feil&nokkel=45274&navn=...&detaljer=...&av=thwe
//   Lista vises i /pasientreiser/vkt_meldinger.php (bak innlogging), ikke her.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

$pdo->exec("CREATE TABLE IF NOT EXISTS ovr_vkt_meld (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    nokkel VARCHAR(40) NOT NULL,
    navn VARCHAR(200) DEFAULT NULL,
    detaljer VARCHAR(500) DEFAULT NULL,
    av VARCHAR(60) DEFAULT NULL,
    antall INT NOT NULL DEFAULT 1,
    opprettet DATETIME NOT NULL,
    sist DATETIME NOT NULL,
    handtert TINYINT(1) NOT NULL DEFAULT 0,
    INDEX (type), INDEX (nokkel), INDEX (handtert)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$kutt = function ($v, $n) { return mb_substr(trim((string)$v), 0, $n); };

// ⚠️ LESING ER STENGT. Skrivingen må være åpen — den kommer fra NISSY-siden, der vi ikke har
//    noen sesjon mot oss. Men lista inneholder fritekst fra operatører og skal bak innlogging:
//    den vises i /pasientreiser/vkt_meldinger.php, som leser databasen direkte.
if (isset($_GET['liste'])) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'feil' => 'lista vises i /pasientreiser/vkt_meldinger.php']);
    exit;
}

$meld = preg_replace('/[^a-z]/', '', $_GET['meld'] ?? '');
if ($meld === 'mangler' || $meld === 'feil') {
    $nokkel = $kutt($_GET['nokkel'] ?? '', 40);
    if ($nokkel === '') { echo json_encode(['ok' => false, 'feil' => 'mangler nokkel']); exit; }
    $navn     = $kutt($_GET['navn'] ?? '', 200);
    $detaljer = $kutt($_GET['detaljer'] ?? '', 500);
    $av       = $kutt($_GET['av'] ?? '', 60);

    if ($meld === 'mangler') {
        // Samme sted meldt på nytt skal TELLE, ikke fylle opp lista. En feilmelding er
        // derimot en egen hendelse hver gang — to operatører kan mene ulike ting.
        $st = $pdo->prepare("SELECT id FROM ovr_vkt_meld WHERE type = ? AND nokkel = ? LIMIT 1");
        $st->execute([$meld, $nokkel]);
        $rad = $st->fetch(PDO::FETCH_ASSOC);
        if ($rad) {
            $pdo->prepare("UPDATE ovr_vkt_meld SET antall = antall + 1, sist = NOW(),
                           navn = COALESCE(NULLIF(?, ''), navn) WHERE id = ?")
                ->execute([$navn, $rad['id']]);
            echo json_encode(['ok' => true, 'oppdatert' => (int)$rad['id']]);
            exit;
        }
    }
    $pdo->prepare("INSERT INTO ovr_vkt_meld (type, nokkel, navn, detaljer, av, opprettet, sist)
                   VALUES (?,?,?,?,?,NOW(),NOW())")
        ->execute([$meld, $nokkel, $navn ?: null, $detaljer ?: null, $av ?: null]);
    echo json_encode(['ok' => true, 'ny' => (int)$pdo->lastInsertId()]);
    exit;
}

echo json_encode(['ok' => false, 'feil' => 'oppgi ?meld=mangler|feil']);
