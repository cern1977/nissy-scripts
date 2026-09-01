<?php
// === ovr_avvik_sokeord.php — søkeord Overvåker Avvik skal lete etter ===
//
// ⚠️ IKKE ovr_sokeord. Den tabellen finnes fra før og er en FORKORTELSES-ORDBOK
//    (DNR → Radiumhospital, SØK → Kalnes), lest av behandlingssted.php i drift.
//    Navnet er nesten det samme og formålet helt ulikt — og `CREATE TABLE IF NOT EXISTS`
//    gjør ingenting når tabellen finnes, uansett hvor forskjellig skjemaet er. Første
//    forsøk skrev derfor mot feil tabell og feilet på en manglende kolonne.
//
// Speiler arkitekturen til ovr_sms_maler.php: server-lagret per kjørekontor, redigeres i
// admin, hentes av skriptet ved oppstart. Ett sted å vedlikeholde i stedet for en liste
// hardkodet i en JS-fil ingen uten utviklertilgang kan endre.
//
// ⚠️ ORDENE ER ET SIGNAL, IKKE EN DIAGNOSE. «smitte» i en merknad betyr at noen har skrevet
//    ordet — ikke at reisen er smitteførende. Skriptet skal LØFTE FREM treffet for et
//    menneske, aldri avgjøre noe på det alene.
//
// ⚠️ Vi lagrer bare selve ORDET og hva det betyr. Aldri teksten det ble funnet i: den kommer
//    fra en merknad og kan inneholde helseopplysninger.
//
//   ?action=list[&kontor=]      → alle ord (admin)
//   ?action=aktive[&kontor=]    → kun aktive, flat liste (skriptet)
//   ?action=lagre&ord=&merknad=&aktiv=1&av=
//   ?action=slett&id=
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

try {
    require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
    $db = getDb();
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'feil' => 'db: ' . $e->getMessage()]);
    exit;
}

try {
    $db->exec("CREATE TABLE IF NOT EXISTS ovr_avvik_sokeord (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ord VARCHAR(60) NOT NULL,
        merknad VARCHAR(200) NULL,
        aktiv TINYINT(1) NOT NULL DEFAULT 1,
        kjorekontor VARCHAR(80) NOT NULL DEFAULT 'Oslo og Akershus',
        oppdatert TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        oppdatert_av VARCHAR(80) NULL,
        UNIQUE KEY uniq_ord_kontor (ord, kjorekontor)
    ) DEFAULT CHARSET=utf8mb4");
} catch (Throwable $e) { /* ignorer */ }

$kontor = trim($_GET['kontor'] ?? $_POST['kontor'] ?? '') ?: 'Oslo og Akershus';
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

try {
    if ($action === 'list') {
        $s = $db->prepare("SELECT id, ord, merknad, aktiv, oppdatert, oppdatert_av
                           FROM ovr_avvik_sokeord WHERE kjorekontor = ? ORDER BY ord");
        $s->execute([$kontor]);
        echo json_encode(['ok' => true, 'kontor' => $kontor, 'ord' => $s->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'aktive') {
        // Skript-visning: bare det de trenger — ordet og hva det betyr.
        $s = $db->prepare("SELECT ord, merknad FROM ovr_avvik_sokeord
                           WHERE kjorekontor = ? AND aktiv = 1 ORDER BY ord");
        $s->execute([$kontor]);
        echo json_encode(['ok' => true, 'kontor' => $kontor, 'ord' => $s->fetchAll(PDO::FETCH_ASSOC)]);

    } elseif ($action === 'lagre') {
        // Små bokstaver: søket skal være ufølsomt for skrivemåte, og da er det ryddigere å
        // normalisere ÉN gang her enn i hvert skript som leser lista.
        $ord = mb_strtolower(trim($_GET['ord'] ?? $_POST['ord'] ?? ''));
        if (mb_strlen($ord) < 2) { echo json_encode(['ok' => false, 'feil' => 'for kort ord']); exit; }
        $merknad = mb_substr(trim($_GET['merknad'] ?? $_POST['merknad'] ?? ''), 0, 200);
        $aktiv   = (($_GET['aktiv'] ?? $_POST['aktiv'] ?? '1') === '0') ? 0 : 1;
        $av      = mb_substr(trim($_GET['av'] ?? $_POST['av'] ?? ''), 0, 80);
        $db->prepare("INSERT INTO ovr_avvik_sokeord (ord, merknad, aktiv, kjorekontor, oppdatert_av)
                      VALUES (?,?,?,?,?)
                      ON DUPLICATE KEY UPDATE merknad = VALUES(merknad), aktiv = VALUES(aktiv),
                                              oppdatert_av = VALUES(oppdatert_av)")
           ->execute([mb_substr($ord, 0, 60), $merknad ?: null, $aktiv, $kontor, $av ?: null]);
        echo json_encode(['ok' => true, 'ord' => $ord]);

    } elseif ($action === 'slett') {
        $db->prepare("DELETE FROM ovr_avvik_sokeord WHERE id = ? AND kjorekontor = ?")
           ->execute([(int)($_GET['id'] ?? $_POST['id'] ?? 0), $kontor]);
        echo json_encode(['ok' => true]);

    } else {
        echo json_encode(['ok' => false, 'feil' => 'ukjent action']);
    }
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'feil' => $e->getMessage()]);
}
