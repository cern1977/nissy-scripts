# NISSY Clipboard

## Bookmarklets (GitHub API - alltid siste versjon)

Kopier hele linjen og legg til som bokmerke i Edge (URL-feltet).

### Overvaker Avvik
```
javascript:(function(){fetch('https://api.github.com/repos/cern1977/nissy-scripts/contents/overvaaker_avvik.js',{headers:{'Accept':'application/vnd.github.raw'}}).then(r=>r.text()).then(t=>eval(t));})();
```

### Overvaker Live
```
javascript:(function(){fetch('https://api.github.com/repos/cern1977/nissy-scripts/contents/overvaaker_live.js',{headers:{'Accept':'application/vnd.github.raw'}}).then(r=>r.text()).then(t=>eval(t));})();
```

### Verktøykasse DEV (keeper-popup)
Åpner en liten popup som holder dev-skjoldet aktivt i NISSY admin — re-injiserer automatisk etter F5 (samme keeper-mønster som Verktøyhylle bruker for prod). Lukk popup-en for å avslutte dev-modus. Plasseres som ekstra knapp (gul "DEV"-tag) under prod-skjoldet.
```
javascript:(function(){var w=window.open('about:blank','verktoykasse_dev_keeper','width=320,height=200');if(!w){alert('Popup blokkert');return;}w.document.write('<!doctype html><html><head><meta charset=utf-8><title>Verktøykasse DEV keeper</title><style>body{font-family:sans-serif;padding:18px;background:%231e293b;color:%23fbbf24}h2{margin:0 0 10px;font-size:16px}p{font-size:12px;line-height:1.5;color:%23bfdbfe}b{color:%23fbbf24}</style></head><body><h2>%F0%9F%9B%A1%EF%B8%8F Verktøykasse DEV</h2><p>Re-injiserer <b>verktoykasse_dev.js</b> i NISSY admin hvert 2. sek. <br>F5 i admin %3D dev-skjold dukker opp igjen.<br><br>Lukk denne popup-en for %C3%A5 avslutte dev-modus.</p><script>function inj(){if(!window.opener||window.opener.closed)return;if(window.opener.__westbyVerktoykasse_dev)return;var s=window.opener.document.createElement(\"script\");s.src=\"https://thomaswestby.no/skript/skript.php?fil=verktoykasse_dev.js&_=\"+Date.now();window.opener.document.head.appendChild(s);}setInterval(inj,2000);inj();window.addEventListener(\"focus\",inj);<\\/script></body></html>');w.document.close();})();
```

---

## Rollback - Overvaker Avvik (v38.0.68 - fast versjon, jsDelivr)
```
javascript:(function(){fetch('https://cdn.jsdelivr.net/gh/cern1977/nissy-scripts@avvik-v38.0.68/overvaaker_avvik.js').then(r=>r.text()).then(t=>eval(t));})();
```

---

## Scratchpad

Uncaught (in promise) TypeError: Cannot set properties of null (setting 'textContent')
    at window._gkSetPending (<anonymous>:125:46)
    at avvikChannel.onmessage (eval at <anonymous> (planlegging/:1:179), <anonymous>:2728:40)
