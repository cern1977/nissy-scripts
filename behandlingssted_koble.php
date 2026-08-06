<?php
// Kobler zisson-kort mot NISSY-behandlingssteder AUTOMATISK på telefonnummer.
// Kortet har numrene fra før (kort_telefon), registeret har NISSYs numre
// (ovr_behandlingssted_tlf) — møtepunktet er nummeret, så ingen skal taste koder
// på tusenvis av kort (Thomas 06.08).
//
//   ?forslag        → tørrkjøring: hva VILLE blitt koblet (ingen skriving)
//   ?utfor (POST)   → utfører koblingen for de entydige treffene
//   ?status         → hvor mange kort er koblet / gjenstår
//
// Kun ENTYDIGE treff kobles automatisk. Peker kortets numre på flere ulike
// behandlingssteder, listes det som tvetydig og må avgjøres manuelt — et felles
// sentralbord skal ikke gjøre alle avdelinger til «samme sted».
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

try {
    if (isset($_GET['status'])) {
        $koblet = (int)$pdo->query("SELECT COUNT(*) FROM kort WHERE slettet IS NULL AND nissy_tc_id IS NOT NULL")->fetchColumn();
        $igjen  = (int)$pdo->query("SELECT COUNT(*) FROM kort WHERE slettet IS NULL AND nissy_tc_id IS NULL AND type = 'behandler'")->fetchColumn();
        echo json_encode(['ok' => true, 'koblet' => $koblet, 'ukoblet_behandlerkort' => $igjen]);
        exit;
    }

    // Alle ukoblede behandler-kort med numrene sine.
    $rader = $pdo->query("
        SELECT k.id, k.navn, kt.monster
        FROM kort k
        JOIN kort_telefon kt ON kt.kort_id = k.id AND kt.slettet IS NULL AND kt.er_prefix = 0
        WHERE k.slettet IS NULL AND k.nissy_tc_id IS NULL AND k.type = 'behandler'
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Samme normalisering som ved lagring — ellers møtes aldri «+4767911470» og «67911470».
    $norm = function ($raa) {
        $d = preg_replace('/\D/', '', (string)$raa);
        if (strlen($d) === 12 && str_starts_with($d, '0047')) $d = substr($d, 4);
        elseif (strlen($d) === 10 && str_starts_with($d, '47')) $d = substr($d, 2);
        return strlen($d) >= 8 ? $d : null;
    };

    $perKort = [];   // kort_id => ['navn'=>…, 'numre'=>[…]]
    foreach ($rader as $r) {
        $t = $norm($r['monster']);
        if (!$t) continue;
        $id = (int)$r['id'];
        if (!isset($perKort[$id])) $perKort[$id] = ['navn' => $r['navn'], 'numre' => []];
        $perKort[$id]['numre'][$t] = true;
    }

    $slaOpp = $pdo->prepare("SELECT t.bhs_id, b.navn FROM ovr_behandlingssted_tlf t
                             JOIN ovr_behandlingssted b ON b.id = t.bhs_id
                             WHERE t.tlf_norm = ?");
    $entydige = []; $tvetydige = []; $utenTreff = 0;
    foreach ($perKort as $kortId => $info) {
        $treff = [];
        foreach (array_keys($info['numre']) as $t) {
            $slaOpp->execute([$t]);
            foreach ($slaOpp->fetchAll(PDO::FETCH_ASSOC) as $tr) $treff[(int)$tr['bhs_id']] = $tr['navn'];
        }
        if (count($treff) === 1) {
            $bhsId = array_key_first($treff);
            $entydige[] = ['kort_id' => $kortId, 'kort_navn' => $info['navn'], 'bhs_id' => $bhsId, 'bhs_navn' => $treff[$bhsId]];
        } elseif (count($treff) > 1) {
            $tvetydige[] = ['kort_id' => $kortId, 'kort_navn' => $info['navn'], 'kandidater' => $treff];
        } else {
            $utenTreff++;
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['utfor'])) {
        $st = $pdo->prepare("UPDATE kort SET nissy_tc_id = ? WHERE id = ? AND slettet IS NULL AND nissy_tc_id IS NULL");
        $n = 0;
        foreach ($entydige as $e) { $st->execute([$e['bhs_id'], $e['kort_id']]); $n += $st->rowCount(); }
        echo json_encode(['ok' => true, 'koblet' => $n, 'tvetydige' => count($tvetydige), 'uten_treff' => $utenTreff]);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'modus' => 'forslag (ingenting er skrevet)',
        'entydige' => $entydige,
        'tvetydige' => $tvetydige,
        'uten_treff' => $utenTreff,
    ]);
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'feil' => 'registeret er ikke høstet ennå — kjør høstingen først']);
}
