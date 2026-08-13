#!/bin/bash
# Lagrer et snapshot av omraade_assistent.js. Beholder den ALLER ELDSTE (baseline) permanent
# + de 9 nyeste = inntil 10 filer. Slik mister vi ikke utgangspunktet ved rotasjon.
# Bruk: bash omraade_assistent_snapshots/snapshot.sh
set -e
cd "$(dirname "$0")/.."
D=omraade_assistent_snapshots
ver=$(grep -m1 "const VERSJON" omraade_assistent.js | sed -E "s/.*'([^']+)'.*/\1/")
dest="$D/omraade_assistent_$(date +%Y-%m-%d_%H%M)_v${ver}.js"
cp omraade_assistent.js "$dest"
echo "Lagret: $dest"

# Verne-sett: de 9 nyeste + den eldste (baseline). Slett alt utenfor.
keep=$( { ls -1t "$D"/omraade_assistent_*.js | head -9; ls -1t "$D"/omraade_assistent_*.js | tail -1; } | sort -u)
for f in "$D"/omraade_assistent_*.js; do
    grep -qxF "$f" <<< "$keep" || rm -v "$f"
done
echo "--- snapshots (nyeste først, eldste = baseline) ---"
ls -1t "$D"/omraade_assistent_*.js
