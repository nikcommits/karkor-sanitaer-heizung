# Status: Karkor SHK Webseite

- **Status:** 🟢 Live & Wartung (Abgeschlossen & bezahlt Juni 2026)
- **Live-Domain:** https://www.karkor-shk.de
- **Deployment-Quelle:** GitHub-Repository, mit Cloudflare verbunden (laut Nik)
- **Öffentliche Prüfung:** 2026-10-07: Cloudflare-Nameserver; HTTPS-Antwort HTTP 200 über Cloudflare. Der öffentliche Check zeigt den vorgeschalteten Dienst, aber nicht sicher den Ursprungshoster oder ob Cloudflare Pages verwendet wird.
- **Zuletzt aktualisiert:** 2026-10-07

## Implementierung

- Komplette Website (index, planer, projekte, impressum, datenschutz)
- ASE-Architektur (content.json + ase-bridge.js + content.js Fallback)
- Copywriting nach Schwartz-Prinzipien (VOC, Festpreis, 24h-Rückmeldung)
- Klara-Chat-Animation (Scroll-gestaffelt)
- Interaktive Projektgalerie mit Lightbox (16 Bilder, Filter)
- Budgetrechner (`planer.html`) mit KfW-Förderrechner
- SEO: JSON-LD LocalBusiness, Open Graph, robots.txt, llms.txt
- DSGVO: impressum.html, datenschutz.html
- Stylesheet cache-busting: `styles/layout.css?v=3` (matches the current local `index.html`)

## Historischer Stand (Mai–Juni 2026)

- Frühere Projektakte beschrieb GitHub Pages als Test und Strato/WordPress mit manuellem Upload als Produktion. Diese Hosting-Angabe ist überholt und kein aktueller Deploy-Schritt.
- GitHub-Pages-Vorschau: `https://nikcommits.github.io/karkor-sanitaer-heizung/` (historische Testumgebung, nicht die bestätigte Produktionsadresse).
- Bei Textänderungen im bestehenden ASE-Aufbau Versionsnummer erhöhen (`content.js?v=X`), sofern die betreffende Datei weiterhin so eingebunden ist.

## Offen

Keine offenen Entwicklungsaufgaben. Projekt abgeschlossen.
