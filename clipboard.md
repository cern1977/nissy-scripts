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

---

## Rollback - Overvaker Avvik (v38.0.68 - fast versjon, jsDelivr)
```
javascript:(function(){fetch('https://cdn.jsdelivr.net/gh/cern1977/nissy-scripts@avvik-v38.0.68/overvaaker_avvik.js').then(r=>r.text()).then(t=>eval(t));})();
```

---

## Scratchpad

(Lim inn innhold fra jobb-PC her)
