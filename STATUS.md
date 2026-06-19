# Status: Karkor SHK Webseite

**Zuletzt aktualisiert:** 2026-05-25

## Was ist fertig

- Komplette Website (index, planer, projekte, impressum, datenschutz)
- ASE-Architektur (content.json + ase-bridge.js + content.js Fallback)
- Copywriting nach Schwartz-Prinzipien (VOC, Festpreis, 24h-Rückmeldung)
- Klara-Chat-Animation (Scroll-gestaffelt)
- Interaktive Projektgalerie mit Lightbox (16 Bilder, Filter)
- Budgetrechner (`planer.html`) mit KfW-Förderrechner
- SEO: JSON-LD LocalBusiness, Open Graph, robots.txt, llms.txt
- DSGVO: impressum.html, datenschutz.html
- GitHub Pages deployed: https://nikcommits.github.io/karkor-sanitaer-heizung/
- Cache-Busting via `?v=3` in Script-Imports

## Wichtige Hinweise

- **Zwei Umgebungen:** GitHub Pages (Test) ≠ karkorshk.de (Produktion/WordPress)
- Live-Update auf karkorshk.de = manueller FTP-Upload
- Sync zwischen Kundenordner und Git-Ordner: `robocopy C:\Users\nikfr\Dev\02_Kundenprojekte\karkor-shk\final C:\Users\nikfr\Dev\03_Websites\karkor-sanitaer-heizung /E`
- Bei Textänderungen: Versionsnummer erhöhen (`content.js?v=X`)

## Offen

Keine offenen Entwicklungsaufgaben. Projekt abgeschlossen.
