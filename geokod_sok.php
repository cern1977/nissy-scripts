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
    // ⚠️ ETT TREFF ER IKKE STABILT. Geonorge returnerer ikke adressene i fast rekkefølge, så
    //    treffPerSide=1 ga ulikt punkt fra kall til kall — og dermed ulik avstand til flyplassen
    //    for samme postnummer (målt 8450: 15 km i ett kall, 5 km i det neste). Vi henter mange
    //    og bruker SNITTET: stabilt mellom kall, og nærmere tyngdepunktet i bygda enn en
    //    tilfeldig adresse i utkanten.
    $u = 'https://ws.geonorge.no/adresser/v1/sok?treffPerSide=200&utkoordsys=4258&postnummer=' . $postnr;
    $c = curl_init($u);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 6, CURLOPT_CONNECTTIMEOUT => 3]);
    $sv = curl_exec($c);
    curl_close($c);
    $a = ($sv === false) ? [] : (json_decode($sv, true)['adresser'] ?? []);
    if (!$a) { echo json_encode(['ok' => false, 'postnr' => $postnr, 'feil' => 'ukjent postnummer']); exit; }
    // arsort FØR array_key_first: flertallet skal vinne, ikke den første i svaret.
    // Kommunenummer per postnummer: et postnummer KAN krysse kommunegrensen, så vi teller
    // og lar flertallet avgjøre — og sier hvor entydig det var, så kalleren kan vurdere selv.
    $komm = [];
    $sumLat = 0.0; $sumLon = 0.0; $n = 0;
    foreach ($a as $rad) {
        $kn = (string)($rad['kommunenummer'] ?? '');
        if ($kn !== '') $komm[$kn] = ($komm[$kn] ?? 0) + 1;
        $pt = $rad['representasjonspunkt'] ?? null;
        if (!$pt || !isset($pt['lat'], $pt['lon'])) continue;
        $sumLat += (float)$pt['lat']; $sumLon += (float)$pt['lon']; $n++;
    }
    arsort($komm);
    if ($n === 0) { echo json_encode(['ok' => false, 'postnr' => $postnr, 'feil' => 'ingen koordinater']); exit; }
    echo json_encode([
        'ok'        => true,
        'postnr'    => $postnr,
        'poststed'  => $a[0]['poststed'] ?? '',
        'kommune'   => $a[0]['kommunenavn'] ?? '',
        'lat'       => round($sumLat / $n, 6),
        'lon'       => round($sumLon / $n, 6),
        'adresser'  => $n,          // hvor mange punkter snittet bygger på
        'kommunenr' => $komm ? (string)array_key_first($komm) : null,
        'kommune_andel' => $komm ? round(reset($komm) / max(1, array_sum($komm)), 3) : null,
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
