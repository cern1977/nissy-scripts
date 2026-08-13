<?php
// Søk i den høstede Tiltaksboka.
//   ?sok=bomtur          → kort som matcher tittel eller søkeord
//   ?id=6652             → ett kort
//   ?kapitler=1          → kapitteloversikt med antall
//
// Søkeordene er operatørenes eget vokabular, kuratert i Bliksund («Bomtur» har
// koder, helsebiler, dobbeltbestilling, løyve …). Derfor veier de like tungt som
// tittelen i søket — det er de som gjør at «dobbeltbestilling» finner Bomtur-kortet.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

function svar($x) { echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }

try {
    if (isset($_GET['kapitler'])) {
        $r = $pdo->query("SELECT kapittel_id, kapittel_navn, er_sak, COUNT(*) AS antall,
                                 MAX(hostet) AS hostet
                          FROM ovr_tiltaksbok
                          GROUP BY kapittel_id, kapittel_navn, er_sak
                          ORDER BY er_sak, kapittel_navn")->fetchAll(PDO::FETCH_ASSOC);
        svar(['ok' => true, 'kapitler' => $r]);
    }

    if (isset($_GET['id'])) {
        $s = $pdo->prepare("SELECT * FROM ovr_tiltaksbok WHERE id = ?");
        $s->execute([(int)$_GET['id']]);
        svar(['ok' => true, 'kort' => $s->fetch(PDO::FETCH_ASSOC) ?: null]);
    }

    $q = trim($_GET['sok'] ?? '');
    if (mb_strlen($q) < 2) svar(['ok' => false, 'feil' => 'søkeordet må ha minst 2 tegn']);

    // Sakskort er enkeltvedtak om navngitte personer og skal ikke dukke opp i et
    // vanlig prosedyresøk. De hentes bevisst med ?saker=1 — f.eks. når operatøren
    // leter etter en godkjent reise over kommunegrensen.
    $medSaker = !empty($_GET['saker']);
    $like = '%' . $q . '%';
    $s = $pdo->prepare("SELECT id, kortnummer, tittel, sokeord, kapittel_id, kapittel_navn,
                               er_sak, sist_oppdatert, url,
                               (LOWER(tittel) LIKE LOWER(?)) AS treff_tittel
                        FROM ovr_tiltaksbok
                        WHERE (LOWER(tittel) LIKE LOWER(?) OR LOWER(sokeord) LIKE LOWER(?))
                          " . ($medSaker ? "" : "AND er_sak = 0") . "
                        ORDER BY treff_tittel DESC, sist_oppdatert DESC
                        LIMIT 25");
    $s->execute([$like, $like, $like]);
    $rader = $s->fetchAll(PDO::FETCH_ASSOC);

    // Sakskortene leveres ALLTID uten innhold, uansett hva som måtte ligge i basen.
    foreach ($rader as &$r) { unset($r['innhold']); $r['er_sak'] = (int)$r['er_sak']; }
    svar(['ok' => true, 'treff' => $rader]);

} catch (Throwable $e) {
    // Tabellen lages av tiltaksbok_lagre.php ved første høsting. Før den har kjørt
    // skal søket si det tydelig i stedet for å lekke en SQL-feil til klienten.
    if (str_contains($e->getMessage(), 'ovr_tiltaksbok')) {
        svar(['ok' => true, 'treff' => [], 'kapitler' => [],
              'melding' => 'Tiltaksboka er ikke høstet ennå']);
    }
    http_response_code(500);
    svar(['ok' => false, 'feil' => 'DB-feil: ' . $e->getMessage()]);
}
