<?php
// Autocomplete-proxy mot Geonorge adresse-sok (Kartverket). Geonorge sender ikke CORS-headere,
// så NISSY-klienten kan ikke kalle det direkte. GET ?q=<delsøk> → { ok, treff:[{adresse,postnr,poststed,lat,lon}] }.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ?postnr=NNNN → ett representasjonspunkt for postnummeret. Brukes til å finne nærmeste
// flyplass når en rekvisisjon gjelder flyreise: vi trenger bare et punkt i riktig bygd, ikke
// pasientens eksakte adresse — og da slipper vi å sende adressen ut av NISSY.
$postnr = preg_replace('/\D/', '', $_GET['postnr'] ?? '');
if (strlen($postnr) === 4) {
    $u = 'https://ws.geonorge.no/adresser/v1/sok?treffPerSide=1&utkoordsys=4258&postnummer=' . $postnr;
    $c = curl_init($u);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 3]);
    $sv = curl_exec($c);
    curl_close($c);
    $a = ($sv === false) ? [] : (json_decode($sv, true)['adresser'] ?? []);
    if (!$a) { echo json_encode(['ok' => false, 'postnr' => $postnr, 'feil' => 'ukjent postnummer']); exit; }
    $pt = $a[0]['representasjonspunkt'] ?? null;
    echo json_encode([
        'ok'       => true,
        'postnr'   => $postnr,
        'poststed' => $a[0]['poststed'] ?? '',
        'kommune'  => $a[0]['kommunenavn'] ?? '',
        'lat'      => $pt['lat'] ?? null,
        'lon'      => $pt['lon'] ?? null,
    ]);
    exit;
}

$q = trim($_GET['q'] ?? '');
if (mb_strlen($q) < 3) { echo json_encode(['ok' => true, 'treff' => []]); exit; }

$url = 'https://ws.geonorge.no/adresser/v1/sok?treffPerSide=8&fuzzy=true&utkoordsys=4258&sok=' . rawurlencode($q);
$ch = curl_init($url);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 3]);
$resp = curl_exec($ch);
curl_close($ch);
if ($resp === false) { echo json_encode(['ok' => false, 'feil' => 'geonorge utilgjengelig', 'treff' => []]); exit; }

$adr = json_decode($resp, true)['adresser'] ?? [];
$treff = [];
foreach ($adr as $a) {
    $p = $a['representasjonspunkt'] ?? null;
    $treff[] = [
        'adresse'    => $a['adressetekst'] ?? '',
        'postnr'     => (string)($a['postnummer'] ?? ''),
        'poststed'   => $a['poststed'] ?? '',
        'lat'        => $p['lat'] ?? null,
        'lon'        => $p['lon'] ?? null,
        // Strukturerte deler for NISSY validateAddress (skrive-flyten):
        'gatenavn'   => $a['adressenavn'] ?? '',           // streetName
        'husnr'      => (string)($a['nummer'] ?? ''),       // houseNr
        'husbokstav' => $a['bokstav'] ?? '',                // houseSubNr
        'kommunenr'  => (string)($a['kommunenummer'] ?? ''),
    ];
}
echo json_encode(['ok' => true, 'treff' => $treff]);
