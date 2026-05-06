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

### Verktøykasse DEV
Aktiveres manuelt på NISSY admin-fane når du vil teste utviklingsversjonen ved siden av prod. Plasseres som ekstra knapp (gul "DEV"-tag) under prod-skjoldet. F5 fjerner den.
```
javascript:(function(){var s=document.createElement('script');s.src='https://thomaswestby.no/skript/skript.php?fil=verktoykasse_dev.js&_='+Date.now();document.head.appendChild(s);})();
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
