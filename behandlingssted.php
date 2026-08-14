<?php
// Oppslag i det høstede behandlingssted-registeret (ovr_behandlingssted, se
// behandlingssted_lagre.php). Dataene er OUS' egne, høstet fra NISSY — ingen
// personopplysninger, så de kan ligge server-side og vises i zisson.php.
//
//   ?tlf=67911470  → hvilke(t) behandlingssted eier nummeret (hovedbruken: innkommende anrop)
//   ?id=37665      → ett sted + underenheter
//   ?sok=skårer    → navnesøk (fallback når nummeret ikke gir treff)
//   ?status        → antall rader + når registeret sist ble oppdatert
//   ?adresse=…&postnr=…[&navn=…]  → hva ligger på adressen, og hvilken SEKTOR har det
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../pasientreiser/ai_config.secret.php';
$pdo = getDb();

$FELT = "id, navn, type, sektor, adresse, postnr, poststed, telefon, orgnr, her_id, parent_id, utm_n, utm_o, oppdatert";

try {
    // === ADRESSEOPPSLAG MED SEKTOR (14.08) ===
    // For kommuneavvik-skanningen: reiser over kommunegrensen godkjennes for
    // AVTALESPESIALIST og HELSEFORETAK (Thomas 14.08). Sektoren står i registeret, så
    // regelen kan avgjøre i stedet for at 44 adresser vedlikeholdes for hånd.
    //
    // MEN: et helsehus har mange behandlingssteder på samme adresse, og de kan ha ulik
    // sektor. Derfor svarer vi «entydig» bare når adressen gir ETT sted — eller når
    // navnet peker ut ett av dem. Ellers må operatøren/søkeordene avgjøre, som i dag.
    if (isset($_GET['adresse'])) {
        $normA = function ($s) {
            $s = mb_strtolower(trim((string)$s));
            $s = str_replace(['veien','vegen','gaten','gata'], ['vei','veg','gate','gate'], $s);
            return preg_replace('/[^a-zà-ÿ0-9]+/u', '', $s);
        };
        $gate   = (string)$_GET['adresse'];
        $postnr = preg_replace('/\D/', '', (string)($_GET['postnr'] ?? ''));
        $navnQ  = trim((string)($_GET['navn'] ?? ''));
        // Er hele «gate, postnr poststed» sendt i ett felt, plukk delene ut.
        if ($postnr === '' && preg_match('/(\d{4})/', $gate, $m)) {
            $postnr = $m[1];
            $gate = preg_replace('/,?\s*\d{4}.*$/', '', $gate);
        }
        if ($normA($gate) === '') { echo json_encode(['ok' => false, 'feil' => 'mangler adresse']); exit; }

        $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted
                            WHERE postnr = ? AND adresse IS NOT NULL AND adresse <> ''");
        $s->execute([$postnr]);
        $paaAdressen = [];
        foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $b) {
            if ($normA($b['adresse']) === $normA($gate)) $paaAdressen[] = $b;
        }

        // Navnet kan peke ut ett av flere. Samme «deler et særpreget ord»-regel som
        // koblingen av de 54 kommune-adressene brukte.
        $navnTreff = [];
        if ($navnQ !== '' && count($paaAdressen) > 1) {
            $ord = array_values(array_filter(preg_split('/\s+/', mb_strtolower($navnQ)),
                fn($w) => mb_strlen(preg_replace('/[^a-zà-ÿ0-9]/u', '', $w)) >= 5));
            foreach ($paaAdressen as $b) {
                $bn = mb_strtolower($b['navn']);
                foreach ($ord as $w) {
                    $w = preg_replace('/[^a-zà-ÿ0-9]/u', '', $w);
                    if ($w !== '' && str_contains($normA($bn), $w)) { $navnTreff[] = $b; break; }
                }
            }
        }

        $valgt = count($paaAdressen) === 1 ? $paaAdressen[0]
               : (count($navnTreff) === 1 ? $navnTreff[0] : null);
        $GODKJENTE_SEKTORER = ['Avtalespesialist', 'Helseforetak'];

        // Et sykehus har mange behandlingssteder på én adresse — Ullevål har 174 — men
        // alle er samme sektor. Da kan regelen avgjøre selv om vi ikke vet HVILKET av
        // dem reisen gjelder. Er sektorene BLANDET (et helsehus med både fastleger og
        // en DPS), kan vi ikke avgjøre, og søkeordene tar over som i dag.
        $sektorer = [];
        foreach ($paaAdressen as $b) $sektorer[(string)($b['sektor'] ?: 'ukjent')] = true;
        $sektorer = array_keys($sektorer);
        $alleGodkjent = $paaAdressen && !array_diff($sektorer, $GODKJENTE_SEKTORER);
        $valgtGodkjent = $valgt !== null && in_array((string)$valgt['sektor'], $GODKJENTE_SEKTORER, true);

        if (!$paaAdressen)          $grunn = 'ikke i registeret';
        elseif ($alleGodkjent)      $grunn = count($paaAdressen) . ' sted' . (count($paaAdressen) === 1 ? '' : 'er')
                                             . ' på adressen, alle ' . implode('/', $sektorer);
        elseif ($valgtGodkjent)     $grunn = 'navnet peker på ' . $valgt['navn'] . ' (' . $valgt['sektor'] . ')';
        else                        $grunn = 'blandet: ' . implode(', ', $sektorer) . ' — kan ikke avgjøres på adressen alene';

        echo json_encode([
            'ok' => true,
            'antall' => count($paaAdressen),
            'sektorer' => $sektorer,
            'entydig' => $valgt !== null,
            'sted' => $valgt,
            'godkjenn_kommunegrense' => $alleGodkjent || $valgtGodkjent,
            'grunn' => $grunn,
            'steder' => array_slice($paaAdressen, 0, 25),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // === STRUKTUR (14.08) ===
    // Gir høsteren vår egen forelder→barn-struktur, så den kan sammenligne med NISSY
    // og bare hente det som mangler. Bakgrunn: bredde-først-vandringen er IKKE komplett
    // for foreldre med mange barn — NISSY bygger ikke barnelista når childrenCount >= 500,
    // og underenheter-tabellen ser ut til å være kappet på samme vis. Under «privat»
    // (#11574) har vi 1851 barn, men nesten ingen med id under 20000: Martina Hansens
    // Hospital (#11580) mangler, og 25 av 31 id-er rundt den likeså.
    if (isset($_GET['struktur'])) {
        $rader = $pdo->query("SELECT id, parent_id FROM ovr_behandlingssted")->fetchAll(PDO::FETCH_ASSOC);
        $barn = []; $alle = [];
        foreach ($rader as $r) {
            $alle[] = (int)$r['id'];
            if ($r['parent_id'] !== null) $barn[(int)$r['parent_id']][] = (int)$r['id'];
        }
        echo json_encode(['ok' => true, 'antall' => count($alle), 'ider' => $alle, 'barn' => $barn]);
        exit;
    }

    if (isset($_GET['status'])) {
        $n = (int)$pdo->query("SELECT COUNT(*) FROM ovr_behandlingssted")->fetchColumn();
        $sist = $pdo->query("SELECT MAX(oppdatert) FROM ovr_behandlingssted")->fetchColumn();
        $numre = (int)$pdo->query("SELECT COUNT(*) FROM ovr_behandlingssted_tlf")->fetchColumn();
        echo json_encode(['ok' => true, 'antall' => $n, 'numre' => $numre, 'sist_oppdatert' => $sist]);
        exit;
    }

    if (isset($_GET['id'])) {
        $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted WHERE id = ?");
        $s->execute([(int)$_GET['id']]);
        $sted = $s->fetch(PDO::FETCH_ASSOC);
        if (!$sted) { echo json_encode(['ok' => true, 'sted' => null]); exit; }
        $b = $pdo->prepare("SELECT id, navn, type, adresse, postnr, poststed FROM ovr_behandlingssted WHERE parent_id = ? ORDER BY navn");
        $b->execute([(int)$sted['id']]);
        echo json_encode(['ok' => true, 'sted' => $sted, 'underenheter' => $b->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if (isset($_GET['tlf'])) {
        // Samme normalisering som ved lagring: rene sifre uten landkode. Zisson
        // leverer «+4767911470», registeret har «67911470» — begge blir like her.
        $d = preg_replace('/\D/', '', (string)$_GET['tlf']);
        if (strlen($d) === 12 && str_starts_with($d, '0047')) $d = substr($d, 4);
        elseif (strlen($d) === 10 && str_starts_with($d, '47')) $d = substr($d, 2);
        if (strlen($d) < 8) { echo json_encode(['ok' => false, 'feil' => 'for kort nummer']); exit; }
        $s = $pdo->prepare("SELECT b.$FELT FROM ovr_behandlingssted_tlf t
                            JOIN ovr_behandlingssted b ON b.id = t.bhs_id
                            WHERE t.tlf_norm = ? ORDER BY b.navn LIMIT 20");
        $s->execute([$d]);
        $steder = $s->fetchAll(PDO::FETCH_ASSOC);
        // OPPHAVSREGELEN (Kurbadet-saken 07.08): flere treff betyr ikke nødvendigvis et
        // uklart fellesnummer. 23 35 30 50 ga fem treff — men det var Kurbadet Legesenter
        // med sine fire fastleger, altså ETT sted. Ligger alle kandidatene i samme gren,
        // returnerer vi den øverste som svaret; bare urelaterte steder er ekte tvetydighet.
        $topp = null;
        if (count($steder) === 1) {
            $topp = $steder[0];
        } elseif (count($steder) > 1) {
            $forel = [];
            $qf = $pdo->prepare("SELECT parent_id FROM ovr_behandlingssted WHERE id = ?");
            $hentForel = function ($id) use (&$forel, $qf) {
                if (!array_key_exists($id, $forel)) { $qf->execute([$id]); $v = $qf->fetchColumn(); $forel[$id] = ($v !== false && $v !== null) ? (int)$v : null; }
                return $forel[$id];
            };
            $erForfader = function ($a, $b) use ($hentForel) {
                $c = $b; $n = 0;
                while ($c !== null && $n++ < 12) { $c = $hentForel($c); if ($c === $a) return true; }
                return false;
            };
            foreach ($steder as $kand) {
                $alle = true;
                foreach ($steder as $annen) {
                    if ((int)$annen['id'] !== (int)$kand['id'] && !$erForfader((int)$kand['id'], (int)$annen['id'])) { $alle = false; break; }
                }
                if ($alle) { $topp = $kand; break; }
            }
        }
        echo json_encode(['ok' => true, 'tlf' => $d, 'steder' => $steder, 'topp' => $topp,
                          'under' => $topp ? count($steder) - 1 : 0]);
        exit;
    }

    if (isset($_GET['sok'])) {
        $q = trim((string)$_GET['sok']);
        if (mb_strlen($q) < 3) { echo json_encode(['ok' => false, 'feil' => 'minst 3 tegn']); exit; }
        // ?under=<id> begrenser til enheter UNDER en node — brukes når operatøren
        // oppretter en avdeling under et bestemt sted og nasjonale treff bare er støy.
        $under = isset($_GET['under']) ? (int)$_GET['under'] : 0;
        // SØKEORD: forkortelser operatørene bruker muntlig, som ikke står i navnet.
        // «DNR» → Radiumhospital, «SØK» → Kalnes (Thomas 12.08). Slår til på HELE
        // søket, ikke delstrenger — ellers ville «sok» inni et navn utvidet seg.
        try {
            $so = $pdo->prepare("SELECT betyr FROM ovr_sokeord WHERE slettet IS NULL AND LOWER(ord) = LOWER(?) LIMIT 1");
            $so->execute([$q]);
            $betyr = $so->fetchColumn();
            if ($betyr) $q = $betyr;
        } catch (Throwable $e) { /* tabellen finnes ikke ennå — søk på ordet som skrevet */ }
        if ($under) {
            $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted
                                WHERE parent_id = ? AND (navn LIKE ? OR kortnavn LIKE ? OR alias LIKE ?)
                                ORDER BY navn LIMIT 25");
            $s->execute([$under, '%' . $q . '%', $q, '%' . $q . '%']);
        } else {
            // kortnavn matches EKSAKT: «sab» skal ikke treffe midt inne i et annet kortnavn.
            $s = $pdo->prepare("SELECT $FELT FROM ovr_behandlingssted
                                WHERE navn LIKE ? OR kortnavn LIKE ? OR alias LIKE ?
                                ORDER BY (kortnavn LIKE ?) DESC, navn LIMIT 25");
            $s->execute(['%' . $q . '%', $q, '%' . $q . '%', $q]);
        }
        echo json_encode(['ok' => true, 'steder' => $s->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    echo json_encode(['ok' => false, 'feil' => 'oppgi ?tlf=, ?id=, ?sok= eller ?status']);
} catch (Throwable $e) {
    // Tabellen finnes ikke før første høsting — svar pent i stedet for 500.
    echo json_encode(['ok' => false, 'feil' => 'registeret er ikke høstet ennå']);
}
