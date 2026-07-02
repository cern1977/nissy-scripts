<?php
// Endepunkt for verktøykasse-toast — slår opp kort-info, breadcrumb og institusjon
// for innkommende anrop. Tar enten ?kort_id=<int> (raskt) eller ?tlf=<nr> (fallback).
//
// Returnerer JSON med:
//   kort: {id, navn, type, undertype, rolle, sist_ringt}
//   breadcrumb: [{id, navn, type}, ...] (foreldre-kjede opp til rot)
//   institusjon: {id, navn, tlf_prefix} eller null
//   tlf_display: visningsformat (hvis kort funnet)

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

function svar($ok, $data = []) {
    echo json_encode(array_merge(['ok' => $ok], $data), JSON_UNESCAPED_UNICODE);
    exit;
}

$kortId = isset($_GET['kort_id']) ? (int)$_GET['kort_id'] : 0;
$tlf    = isset($_GET['tlf']) ? preg_replace('/\D/', '', $_GET['tlf']) : '';

// Landkode-normalisering (SIVANESAN-saken 2026-07-02): Zisson leverer «+4721685795»
// → siffer «4721685795», men kort_telefon.monster lagres uten landkode («21685795»)
// → eksakt match bommet og toasten sa «ingen kort». Vi matcher derfor alle varianter.
$tlfKort = $tlf;
if (str_starts_with($tlfKort, '0047') && strlen($tlfKort) === 12) $tlfKort = substr($tlfKort, 4);
elseif (str_starts_with($tlfKort, '47') && strlen($tlfKort) === 10) $tlfKort = substr($tlfKort, 2);
$tlfVarianter = $tlf !== '' ? array_values(array_unique([$tlf, $tlfKort, '47' . $tlfKort])) : [];

try {
    // Finn kort — primært via kort_id, fallback til tlf-matching
    $kort = null;
    if ($kortId > 0) {
        $s = $pdo->prepare("SELECT * FROM kort WHERE id = ? AND slettet IS NULL");
        $s->execute([$kortId]);
        $kort = $s->fetch(PDO::FETCH_ASSOC) ?: null;
    } elseif ($tlf !== '') {
        // Eksakt match på alle landkode-varianter (med/uten 47). monster lagres
        // rått fra kilden («+4721685795», evt. med mellomrom/bindestrek) → normaliser
        // DB-siden til rene sifre i spørringen før sammenligning.
        $ph = implode(',', array_fill(0, count($tlfVarianter), '?'));
        $s = $pdo->prepare("
            SELECT k.* FROM kort k
            JOIN kort_telefon kt ON kt.kort_id = k.id AND kt.slettet IS NULL
            WHERE k.slettet IS NULL AND kt.er_prefix = 0
              AND REPLACE(REPLACE(REPLACE(REPLACE(kt.monster, '+', ''), ' ', ''), '-', ''), '.', '') IN ($ph)
            ORDER BY (kt.rolle = 'eier') DESC, k.id DESC LIMIT 1
        ");
        $s->execute($tlfVarianter);
        $kort = $s->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    if (!$kort) svar(true, ['kort' => null, 'breadcrumb' => [], 'institusjon' => null]);

    // Tlf-display for det matchede kortet
    $s = $pdo->prepare("
        SELECT monster_display FROM kort_telefon
        WHERE kort_id = ? AND slettet IS NULL AND rolle = 'eier'
        ORDER BY er_prefix ASC, LENGTH(monster) DESC LIMIT 1
    ");
    $s->execute([$kort['id']]);
    $tlfDisplay = $s->fetchColumn() ?: null;

    // Breadcrumb — foreldre-kjede opp til rot (maks 10 nivåer)
    $breadcrumb = [];
    $current = $kort;
    $dybde = 0;
    $pq = $pdo->prepare("SELECT id, navn, type, undertype FROM kort WHERE id = ? AND slettet IS NULL");
    while ($current && !empty($current['overordnet_id']) && $dybde < 10) {
        $pq->execute([$current['overordnet_id']]);
        $p = $pq->fetch(PDO::FETCH_ASSOC);
        if (!$p) break;
        array_unshift($breadcrumb, $p);
        $current = $p;
        $dybde++;
    }

    // Institusjon — match telefon-prefix mot zisson_institusjoner
    $institusjon = null;
    if ($tlf !== '') {
        $allInst = $pdo->query("
            SELECT id, navn, tlf_prefix FROM zisson_institusjoner
            WHERE tlf_prefix IS NOT NULL AND tlf_prefix != ''
            ORDER BY LENGTH(tlf_prefix) DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($allInst as $i) {
            foreach ($tlfVarianter as $v) {
                if (str_starts_with($v, (string)$i['tlf_prefix'])) {
                    $institusjon = $i;
                    break 2;
                }
            }
        }
    }

    // Normaliser pasient_telefon til kun siffer (gjør NISSY-oppslag enklere i frontend)
    $pasientTlf = $kort['pasient_telefon'] ?? '';
    if ($pasientTlf) $pasientTlf = preg_replace('/\D/', '', (string)$pasientTlf);

    svar(true, [
        'kort' => [
            'id'              => (int)$kort['id'],
            'navn'            => $kort['navn'],
            'type'            => $kort['type'] ?? null,
            'undertype'       => $kort['undertype'] ?? null,
            'rolle'           => $kort['rolle'] ?? null,
            'sist_ringt'      => $kort['sist_ringt'] ?? null,
            'tlf_display'     => $tlfDisplay,
            'pasient_navn'    => $kort['pasient_navn'] ?? null,
            'pasient_telefon' => $pasientTlf ?: null,
        ],
        'breadcrumb'  => $breadcrumb,
        'institusjon' => $institusjon,
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    svar(false, ['melding' => 'DB-feil: ' . $e->getMessage()]);
}
