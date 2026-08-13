<?php
// === avinor.php — proxy for Avinor flydata (OSL ankomster) ===
// Avinor-API-et (asrv.avinor.no) har ikke CORS og ber om caching + User-Agent.
// Denne henter server-side, cacher kort, og leverer JSON med CORS til nettleseren.
// Brukes av gardermoen.js for å sjekke faktisk/estimert landingstid.
// Endepunkt: https://thomaswestby.no/skript/avinor.php?airport=OSL

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') { http_response_code(204); exit; }

$airport = preg_replace('/[^A-Z]/', '', strtoupper($_GET['airport'] ?? 'OSL')) ?: 'OSL';
$cacheFil = sys_get_temp_dir() . "/avinor_{$airport}_A.json";
$TTL = 60; // sekunder — Avinor oppdaterer ofte, men vi skal ikke hamre API-et

// Server cachet svar hvis ferskt nok
if (is_file($cacheFil) && (time() - filemtime($cacheFil)) < $TTL) {
    echo file_get_contents($cacheFil);
    exit;
}

// TimeFrom = antall timer TILBAKE (positivt), TimeTo = timer fram. Negativt → HTTP 400.
// Bredt vindu fram (168t = 7 dager) så framtidige turer dekkes — Avinor har rutetider
// ~6–7 dager fram. Litt tilbake (2t) for nylig landede.
$url = "https://asrv.avinor.no/XmlFeed/v1.0?TimeFrom=2&TimeTo=168&airport={$airport}&direction=A";
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_USERAGENT      => 'thomaswestby.no pasientreiser flightsjekk (thomas.westby@gmail.com)',
]);
$xmlStr = curl_exec($ch);
$httpKode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($xmlStr === false || $httpKode >= 400 || $xmlStr === '') {
    // Fall tilbake til gammel cache hvis vi har den, ellers feil
    if (is_file($cacheFil)) { echo file_get_contents($cacheFil); exit; }
    http_response_code(502);
    echo json_encode(['ok' => false, 'melding' => "Avinor utilgjengelig (HTTP $httpKode)"]);
    exit;
}

$xml = @simplexml_load_string($xmlStr);
$flights = [];
$lastUpdate = '';
if ($xml && isset($xml->flights)) {
    $lastUpdate = (string)($xml->flights['lastUpdate'] ?? '');
    foreach ($xml->flights->flight as $f) {
        $id = strtoupper(trim((string)$f->flight_id));
        if ($id === '') continue;
        $st = $f->status;
        // Array per flight_id — samme rutenr kan finnes på flere datoer i vinduet.
        $flights[$id][] = [
            'schedule' => (string)$f->schedule_time,        // rutetid (UTC, ...Z)
            'origin'   => (string)$f->airport,              // avreise-flyplass (IATA)
            'code'     => $st ? (string)$st['code'] : '',   // A=landet, E=estimert, C=innstilt, ''=i rute
            'time'     => $st ? (string)$st['time'] : '',   // faktisk/estimert tid (UTC)
        ];
    }
}

$ut = json_encode(['ok' => true, 'airport' => $airport, 'lastUpdate' => $lastUpdate, 'flights' => $flights], JSON_UNESCAPED_UNICODE);
@file_put_contents($cacheFil, $ut);
echo $ut;
