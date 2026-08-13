<?php
// Autocomplete-proxy mot Geonorge adresse-sok (Kartverket). Geonorge sender ikke CORS-headere,
// så NISSY-klienten kan ikke kalle det direkte. GET ?q=<delsøk> → { ok, treff:[{adresse,postnr,poststed,lat,lon}] }.
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

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
