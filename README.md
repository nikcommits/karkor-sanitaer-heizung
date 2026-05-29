# Karkor Haustechnik Website

Finale statische Website-Version fuer Karkor Haustechnik.

## Struktur

- `index.html` - finale HTML-Version
- `karkor-tokens.css` - Design Tokens und Basis-Styling
- `content/content.json` - ausgelagerte Inhalte und Kontextdaten
- `scripts/ase-bridge.js` - laedt die JSON-Inhalte in die HTML
- `assets/` - Bilder und Logo

## Lokal starten

Da die Inhalte per `fetch()` aus `content/content.json` geladen werden, sollte die Seite ueber einen lokalen Server geoeffnet werden:

```bash
python -m http.server 4174
```

Danach:

```text
http://localhost:4174/
```

## Deployment

Der Inhalt dieses Ordners kann direkt als statische Website auf GitHub Pages, Netlify, Vercel oder einem klassischen Webhosting hochgeladen werden.
