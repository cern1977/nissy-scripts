# Dokumentasjon

Den tekniske referansen for NISSY ligger **ikke i dette repoet**, men i OneDrive:

```
~/Library/CloudStorage/OneDrive-Personlig/AI/OUS/docs/
```

| Dokument | Innhold |
|---|---|
| `NISSY-Planlegging.md` | **Sjekk denne FØRST** før du graver i DOM eller API. Tabellstruktur, rico-feller, admin-API, ruteberegning, endre hentetid, telefon-toast. |
| `NISSY-datakilder.md` | Hvor data kommer fra. |
| `<dato>.md` | Arbeidslogg per dag. |

## Hvorfor OneDrive og ikke her

Repoet er koblet til GitHub (`cern1977/nissy-scripts`). Selv i et privat repo havner NISSY-interne detaljer da hos en ekstern leverandør. OneDrive gir versjonshistorikk og søk uten at noe forlater huset.

## Ikke gjenoppfinn hjulet

Før du bygger noe mot planleggeren eller admin — turdetaljer, adresser, oppslag — gå til kildene i denne rekkefølgen:

1. `NISSY-Planlegging.md` i OneDrive (og **oppdater den** når du lærer noe nytt)
2. `overvaker-live/overvaaker_live.js` og `overvaker-avvik/overvaaker_avvik.js` — har ferdig, utprøvd kode i drift
3. `verktoykasse.js` — `hentTurDetaljer`, `hentRekvisisjon`, `sokTlfINissy`, `sokPnrINissy`

Vi har brent flere runder på å «oppfinne» oppslag som allerede fantes i overvåkerne. **Det som kjører i drift er fasit** — sjekk der før du gjetter på parametere.
