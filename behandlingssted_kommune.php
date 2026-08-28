<?php
// === behandlingssted_kommune.php — kommune fra KOORDINAT ===
//
// Fyller kommune_geo/kommunenr_geo i ovr_behandlingssted ved å slå opp NISSYs egen
// posisjon (utm_n/utm_o, UTM33/EPSG:25833) mot Kartverkets kommuneinfo-API.
//
// HVORFOR KOORDINAT OG IKKE POSTNUMMER (Thomas 27.–28.08):
//   Regelen «primærhelsetjenesten skal være innenfor kommunen» avgjøres nettopp i
//   grensetilfellene, og der er postnummeret upålitelig: poststedet kan hete noe annet
//   enn kommunen (1463 Fjellhamar ligger i Lørenskog), og et postnummer kan krysse
//   kommunegrensen. Et punkt gjør ikke det.
//
// HVORFOR EGNE KOLONNER (_geo) OG IKKE `kommune`:
//   behandlingssted_lagre.php bruker REPLACE INTO — raden slettes og settes inn på nytt.
//   Skrev vi hit, ville neste høsting nullet verdien hver gang NISSY-feltet er tomt.
//   `kommune` er NISSYs egen påstand, `kommune_geo` er utledet av koordinaten. Regelen
//   kan bruke COALESCE(kommune, kommune_geo) og vet fortsatt hvor tallet kom fra.
//
//   ?antall=100   → slå opp inntil N UNIKE koordinater (13 045 finnes, mot 61 916 rader)
//   ?status       → hvor langt vi er kommet
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

if (isset($_GET['status'])) {
    $r = $pdo->query("SELECT
        COUNT(*) AS rader,
        SUM(utm_n IS NOT NULL AND utm_o IS NOT NULL) AS med_utm,
        SUM(kommunenr_geo IS NOT NULL) AS med_kommune
        FROM ovr_behandlingssted")->fetch(PDO::FETCH_ASSOC);
    $u = $pdo->query("SELECT COUNT(*) FROM (SELECT 1 FROM ovr_behandlingssted
        WHERE utm_n IS NOT NULL AND utm_o IS NOT NULL AND kommunenr_geo IS NULL
        GROUP BY utm_n, utm_o) t")->fetchColumn();
    echo json_encode(['ok' => true] + $r + ['unike_igjen' => (int)$u]);
    exit;
}

$antall = max(1, min(500, (int)($_GET['antall'] ?? 100)));

// Unike koordinater først: 61 916 rader deler 13 045 punkter, så oppslag per rad ville
// vært nesten fem ganger så mange kall mot Kartverket til ingen nytte.
$punkter = $pdo->query("SELECT utm_n, utm_o FROM ovr_behandlingssted
    WHERE utm_n IS NOT NULL AND utm_o IS NOT NULL AND kommunenr_geo IS NULL
    GROUP BY utm_n, utm_o LIMIT $antall")->fetchAll(PDO::FETCH_ASSOC);

$oppd = $pdo->prepare("UPDATE ovr_behandlingssted SET kommune_geo = ?, kommunenr_geo = ?
    WHERE utm_n = ? AND utm_o = ?");

$gjort = 0; $rader = 0; $feil = 0; $utenfor = 0;
foreach ($punkter as $p) {
    $url = 'https://api.kartverket.no/kommuneinfo/v1/punkt?koordsys=25833'
         . '&nord=' . (int)$p['utm_n'] . '&ost=' . (int)$p['utm_o'];
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4]);
    $sv = curl_exec($ch);
    $kode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($sv === false || $kode >= 500) { $feil++; continue; }   // prøv igjen ved neste kjøring
    $j = json_decode($sv, true);
    if (!is_array($j) || empty($j['kommunenummer'])) {
        // Punkt i sjøen eller utenfor Norge finnes (feilregistrerte posisjoner). Merkes så vi
        // ikke spør om det samme punktet i evig tid — men navnet står tomt, så det er synlig.
        $oppd->execute([null, '0000', (int)$p['utm_n'], (int)$p['utm_o']]);
        $utenfor++;
        continue;
    }
    $oppd->execute([$j['kommunenavn'] ?? null, $j['kommunenummer'], (int)$p['utm_n'], (int)$p['utm_o']]);
    $rader += $oppd->rowCount();
    $gjort++;
    usleep(120000);   // ~8 kall/sek — vi er gjest hos Kartverket, ikke kunde
}

$igjen = (int)$pdo->query("SELECT COUNT(*) FROM (SELECT 1 FROM ovr_behandlingssted
    WHERE utm_n IS NOT NULL AND utm_o IS NOT NULL AND kommunenr_geo IS NULL
    GROUP BY utm_n, utm_o) t")->fetchColumn();

echo json_encode(['ok' => true, 'punkter' => $gjort, 'rader' => $rader,
                  'utenfor_norge' => $utenfor, 'feil' => $feil, 'unike_igjen' => $igjen]);
