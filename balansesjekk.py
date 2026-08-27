#!/usr/bin/env python3
"""
Balansesjekk dev/prod for NISSY-skriptene.

Bakgrunn (19.08.2026): Overvåker Live lå på prod 6.2.29 mens dev sto på 6.2.28-dev
— altså var PROD nyest, og en vanlig dev→prod-promote ville slettet 39 linjer
prod-arbeid (heartbeat m/ signatur + _skriptUrl). Denne sjekken finner den
situasjonen før den gjør skade.

  python3 balansesjekk.py          # oversikt
  python3 balansesjekk.py -v       # vis linjene som skiller

Kategorier:
  KODE      ekte logikkforskjell — det som betyr noe
  MARKØR    bevisst dev/prod-skille (VERSJON, ER_DEV, NAVN, FLAG, KILDE, filnavn, farge)
  KOMMENTAR ulik ordlyd — støy som skjuler ekte drift i framtidige differ
"""
import io, os, re, sys, difflib

VERBOSE = '-v' in sys.argv

MARKOR = [
    re.compile(r"VERSJON(_FULL)?\s*=\s*'"), re.compile(r"VERSION\s*=\s*'"),
    re.compile(r"const ER_DEV\s*=\s*(true|false)"),
    re.compile(r"const (NAVN|FLAG|KILDE|FIL)\s*=\s*'"),
    re.compile(r"_dev\.js|skript\.php\?fil="),
    re.compile(r"#10b981|#fbbf24|#022c22|#451a03"),   # dev/prod-fargekoder
]

def kategori(linje):
    t = linje.strip()
    if not t: return None
    if t.startswith('//') or t.startswith('*') or t.startswith('/*'): return 'KOMMENTAR'
    for m in MARKOR:
        if m.search(t): return 'MARKØR'
    return 'KODE'

def sjekk(prodfil):
    base = prodfil[:-3]
    devfil = base + '_dev.js'
    if not os.path.exists(devfil): return None
    p = io.open(prodfil, encoding='utf-8').read().splitlines()
    d = io.open(devfil,  encoding='utf-8').read().splitlines()
    funn = {'KODE': [], 'MARKØR': [], 'KOMMENTAR': []}
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, p, d, autojunk=False).get_opcodes():
        if tag == 'equal': continue
        for k in range(i1, i2):
            k2 = kategori(p[k])
            if k2: funn[k2].append(('prod', k + 1, p[k].strip()))
        for k in range(j1, j2):
            k2 = kategori(d[k])
            if k2: funn[k2].append(('dev ', k + 1, d[k].strip()))
    return os.path.basename(prodfil), funn

rader = []
for rot, _, filer in os.walk('.'):
    if '/.git' in rot: continue
    for f in sorted(filer):
        if f.endswith('.js') and not f.endswith('_dev.js'):
            r = sjekk(os.path.join(rot, f))
            if r: rader.append(r)

print("%-32s %6s %8s %10s   %s" % ("FIL", "KODE", "MARKØR", "KOMMENTAR", "VURDERING"))
print("-" * 96)
for navn, f in sorted(rader):
    kode = f['KODE']
    kp = sum(1 for s, _, _ in kode if s == 'prod')
    kd = sum(1 for s, _, _ in kode if s == 'dev ')
    if   kp == 0 and kd == 0: vurd = "i balanse"
    elif kp >  0 and kd == 0: vurd = "!! PROD HAR KODE DEV MANGLER — port tilbake før promote"
    elif kd >  0 and kp == 0: vurd = "dev-arbeid venter på promote (normalt)"
    else:                     vurd = "!! DIVERGENT BEGGE VEIER — les nøye før promote"
    print("%-32s %6d %8d %10d   %s" % (navn, len(kode), len(f['MARKØR']), len(f['KOMMENTAR']), vurd))
    if VERBOSE and kode:
        for side, n, l in kode:
            print("        %s %-6d %s" % (side, n, l[:88]))
