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

### Verktøykasse Rekvisisjons-agent
Aktiveres på `/rekvisisjon/`-fanen. Headless agent (ingen UI) som lytter på navigerings-jobber fra Zisson og auto-fyller ssn + klikker søk i samme fane. Re-aktivering nødvendig etter F5 (ingen keeper).
```
javascript:(function(){var s=document.createElement('script');s.src='https://thomaswestby.no/skript/skript.php?fil=verktoykasse_rekvisisjon.js&_='+Date.now();document.head.appendChild(s);})();
```

### Verktøykasse Attest-keeper (DEV)
Klikk én gang når attest-tab er åpen. Åpner en liten popup som re-injiserer attest-agenten ved F5. Lukk popup-en for å avslutte. Når aktiv, vises attest-status (antall aktive attester) automatisk i pasient-toasten i planlegger. Bokmerke-klikk på `attest-ui.pasientreiser.nhn.no`.
```
javascript:(function(){var w=window.open('about:blank','verktoykasse_attest_keeper','width=320,height=200');if(!w){alert('Popup blokkert');return;}w.document.write('<!doctype html><html><head><meta charset=utf-8><title>Attest keeper</title><style>body{font-family:sans-serif;padding:18px;background:%231e293b;color:%23f59e0b}h2{margin:0 0 10px;font-size:16px}p{font-size:12px;line-height:1.5;color:%23bfdbfe}b{color:%23f59e0b}</style></head><body><h2>%F0%9F%93%9C Attest-agent</h2><p>Re-injiserer <b>verktoykasse_attest_dev.js</b> i attest-fanen hvert 0,5 sek. <br>F5 i attest %3D agent dukker opp igjen.<br><br>Lukk denne popup-en for %C3%A5 avslutte.</p><script>function inj(){try{if(!window.opener||window.opener.closed)return;if(window.opener.__vkt_attest_dev_agent)return;var s=window.opener.document.createElement(\"script\");s.src=\"https://thomaswestby.no/skript/skript.php?fil=verktoykasse_attest_dev.js&_=\"+Date.now();window.opener.document.head.appendChild(s);}catch(e){}}setInterval(inj,500);inj();window.addEventListener(\"focus\",inj);document.addEventListener(\"visibilitychange\",inj);<\\/script></body></html>');w.document.close();})();
```

### Verktøykasse Attest-agent (DEV) — engangs-bookmarklet
Engangs-aktivering uten keeper. Bruk hvis du ikke vil ha popup. F5 = må klikke igjen.
```
javascript:(function(){var s=document.createElement('script');s.src='https://thomaswestby.no/skript/skript.php?fil=verktoykasse_attest_dev.js&_='+Date.now();document.head.appendChild(s);})();
```

### Verktøykasse DEV (keeper-popup)
Åpner en liten popup som holder dev-skjoldet aktivt i NISSY admin — re-injiserer automatisk etter F5. Sjekker hvert 500ms + lytter på opener-pageshow så skjoldet er tilbake nesten momentant etter F5. Lukk popup-en for å avslutte dev-modus.
```
javascript:(function(){var w=window.open('about:blank','verktoykasse_dev_keeper','width=320,height=200');if(!w){alert('Popup blokkert');return;}w.document.write('<!doctype html><html><head><meta charset=utf-8><title>Verktøykasse DEV keeper</title><style>body{font-family:sans-serif;padding:18px;background:%231e293b;color:%23fbbf24}h2{margin:0 0 10px;font-size:16px}p{font-size:12px;line-height:1.5;color:%23bfdbfe}b{color:%23fbbf24}</style></head><body><h2>%F0%9F%9B%A1%EF%B8%8F Verktøykasse DEV</h2><p>Re-injiserer <b>verktoykasse_dev.js</b> i NISSY admin hvert 0,5 sek + lytter på pageshow. <br>F5 i admin %3D dev-skjold dukker opp nesten momentant.<br><br>Lukk denne popup-en for %C3%A5 avslutte dev-modus.</p><script>function inj(){try{if(!window.opener||window.opener.closed)return;if(window.opener.__westbyVerktoykasse_dev)return;var s=window.opener.document.createElement(\"script\");s.src=\"https://thomaswestby.no/skript/skript.php?fil=verktoykasse_dev.js&_=\"+Date.now();window.opener.document.head.appendChild(s);}catch(e){}}var hooked=false;function hookOpener(){if(hooked)return;try{if(!window.opener||window.opener.closed)return;window.opener.addEventListener(\"pageshow\",inj);window.opener.addEventListener(\"focus\",inj);hooked=true;}catch(e){}}setInterval(function(){hookOpener();inj();},500);inj();hookOpener();window.addEventListener(\"focus\",inj);document.addEventListener(\"visibilitychange\",inj);<\\/script></body></html>');w.document.close();})();
```

### Verktøykasse PROD (keeper-popup)
Samme keeper-mønster for prod-skjoldet. Re-injiserer `verktoykasse.js` hver 0,5 sek hvis flagg mangler. Operatører kan også bruke "🛡 Hold aktiv etter F5"-knappen i selve menyen i stedet for bookmarklet — men power-users som vil starte uten å åpne planleggeren først kan bruke denne.
```
javascript:(function(){var w=window.open('about:blank','verktoykasse_keeper','width=320,height=200');if(!w){alert('Popup blokkert');return;}w.document.write('<!doctype html><html><head><meta charset=utf-8><title>Verktøykasse keeper</title><style>body{font-family:sans-serif;padding:18px;background:%231e293b;color:%23fbbf24}h2{margin:0 0 10px;font-size:16px}p{font-size:12px;line-height:1.5;color:%23bfdbfe}b{color:%23fbbf24}</style></head><body><h2>%F0%9F%9B%A1%EF%B8%8F Verktøykasse</h2><p>Re-injiserer <b>verktoykasse.js</b> i NISSY hvert 0,5 sek + lytter på pageshow. <br>F5 i NISSY %3D skjold dukker opp nesten momentant.<br><br>Lukk denne popup-en for %C3%A5 avslutte.</p><script>function inj(){try{if(!window.opener||window.opener.closed)return;if(window.opener.__westbyVerktoykasse)return;var s=window.opener.document.createElement(\"script\");s.src=\"https://thomaswestby.no/skript/skript.php?fil=verktoykasse.js&_=\"+Date.now();window.opener.document.head.appendChild(s);}catch(e){}}var hooked=false;function hookOpener(){if(hooked)return;try{if(!window.opener||window.opener.closed)return;window.opener.addEventListener(\"pageshow\",inj);window.opener.addEventListener(\"focus\",inj);hooked=true;}catch(e){}}setInterval(function(){hookOpener();inj();},500);inj();hookOpener();window.addEventListener(\"focus\",inj);document.addEventListener(\"visibilitychange\",inj);<\\/script></body></html>');w.document.close();})();
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
