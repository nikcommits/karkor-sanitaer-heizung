# 📔 PersonalOS & G-Brain: Das Master-Handbuch für Einsteiger

Dieses Dokument ist dein Kompass für dein digitales Gehirn. Es erklärt, wie die verschiedenen Teile deines Systems (PersonalOS, G-Brain und die Gemini CLI) zusammenarbeiten, ohne dass du technisches Expertenwissen benötigst.

---

## 1. Die drei Säulen deines Systems

Stell dir dein System wie eine moderne Bibliothek vor:

1.  **PersonalOS (`C:\Users\nikfr\PersonalOS`):** Das sind die **Regale und Bücher**. Hier liegen alle Informationen (Projekte, Personen, Notizen) in einer Form, die du einfach lesen und bearbeiten kannst (Markdown).
2.  **G-Brain:** Das ist der **bibliothekarische Index**. Er liest deine Bücher im Hintergrund und weiß sofort, in welchem Regal welche Information steht. Er hilft der KI, deine Daten blitzschnell zu finden. G-Brain läuft als **Auto-Start-Service** auf deinem Computer (siehe Abschnitt 7).
3.  **Gemini CLI (Dein Assistent):** Das ist der **Mitarbeiter**, dem du Befehle gibst. Durch den neuen Befehl `gmi` weiß er immer sofort, dass er in deiner "Bibliothek" arbeiten soll.
4.  **Claude Code:** Dein KI-Editor, der direkt auf G-Brain zugreift und dein PersonalOS durchsuchen kann.

---

## 2. Das Navigationssystem: Wikilinks `[[...]]`

Das wichtigste Werkzeug in deinem System sind die doppelten eckigen Klammern. Sie funktionieren wie Internet-Links, aber innerhalb deiner eigenen Dateien.

*   **Beispiel:** Wenn du in einer Projektdatei `[[Abdel Karim Karkor]]` schreibst, weiß das System automatisch: "Dieses Projekt gehört zu dieser Person".
*   **Warum wir das machen:** Es entsteht ein Netz aus Informationen. Die KI kann so von einem Projekt zu einer Person und von dort zur zugehörigen Firma springen, genau wie ein Mensch denken würde.

---

## 3. Die ASE-Methodik (Atomic Static Engineering)

Das ist deine "Bauvorschrift" für Webseiten und Projekte. Die wichtigste Regel hier ist die **Daten-Entkopplung**:

*   **Früher:** Texte wurden direkt in den Code der Webseite geschrieben. Wollte man einen Satz ändern, musste man im Code suchen.
*   **ASE-Weg:** Texte stehen NUR in einer Datei namens `content.json`. Der Code der Webseite ist nur ein leerer Rahmen, der sich die Infos aus dieser JSON-Datei holt.
*   **Vorteil für dich:** Du (oder die KI) kannst Texte ändern, ohne Angst haben zu müssen, das Design der Webseite kaputt zu machen.

---

## 4. Wie du mit dem System arbeitest (Tipps für den Alltag)

### Den Assistenten starten
Tippe einfach **`gmi`** in dein Terminal. 
*   *Was passiert:* Der Assistent springt in dein PersonalOS, liest die "Anti-Amnesie-Regeln" und ist sofort einsatzbereit.

### Neue Informationen anlegen
Wenn du ein neues Projekt oder eine neue Person anlegst, achte auf diese zwei Sektionen in der Datei:
1.  **Aktueller Stand:** Hier kommt alles rein, was HEUTE wichtig ist (Telefonnummern, Links, aktueller Status).
2.  **Verlauf:** Hier schreibst du (oder die KI) chronologisch auf, was passiert ist (z.B. "20.05.2026: Projekt gestartet").

### Wenn die KI "nichts findet"
Erinnere sie einfach daran: *"Suche rekursiv im PersonalOS nach [[Name]]"*. Durch unsere neuen Regeln in der `GEMINI.md` sollte sie das aber jetzt von selbst tun.

---

## 5. Struktur-Übersicht (Wo liegt was?)

*   `/personen`: Deine Kontakte und Ansprechpartner.
*   `/organisationen`: Firmen und Partner.
*   `/projekte`: Deine aktiven und geplanten Vorhaben.
*   `/regeln`: Die "Gesetze", nach denen die KI arbeiten muss (z.B. ASE-Methodik).
*   `/steuerung`: Deine Aufgabenlisten (`aufgaben.md`).

---

## 6. G-Brain Auto-Start (Das brauchst du jetzt wissen!)

### Wie läuft G-Brain auf meinem Computer?

G-Brain ist als **Windows Scheduled Task** konfiguriert und startet automatisch, wenn du dich anmeldest:

- **Task-Name:** `GBrain Server`
- **Startpunkt:** `C:\Users\nikfr\.bun\bin\gbrain.exe serve`
- **Ausführung:** Automatisch beim Anmelden (jeden Tag)
- **Token-Kosten:** ❌ Keine! G-Brain läuft lokal offline.

### Was bedeutet das für dich?

✅ **Du brauchst NICHTS zu tun.** G-Brain startet automatisch im Hintergrund, wenn du dich anmeldest.

✅ **Claude Code kann sofort dein PersonalOS durchsuchen** – keine Verzögerung, keine manuellen Schritte.

✅ **Der `gmi`-Befehl funktioniert sofort** (Gemini CLI hat Zugriff auf den Index).

### Was passiert im Hintergrund?

1. G-Brain startet als **MCP-Server** (Model Context Protocol)
2. Es liest deine PersonalOS-Struktur aus `C:\Users\nikfr\PersonalOS`
3. Es indexiert alle deine Dateien in: `C:\Users\nikfr\.gbrain\brain.pglite`
4. Jede Suche oder Abfrage von Claude Code wird **lokal und sofort** beantwortet

### Falls G-Brain aus irgendeinem Grund abstürzt

Keine Sorge – die Task startet es beim nächsten Anmelden neu. Falls du es sofort brauchst:

```powershell
# Task sofort starten
Start-ScheduledTask -TaskName "GBrain Server"
```

### Token-Kosten: Wann zahle ich?

| Aktion | Token-Kosten? |
|--------|---------------|
| G-Brain läuft im Hintergrund | ❌ Nein |
| Claude Code nutzt G-Brain (Suche) | ✅ Ja, aber minimal |
| Neue Inhalte werden eingebettet | ✅ Ja (z.B. `gbrain embed --stale`) |
| Sync durchgeführt | ✅ Ja, aber nur wenn manuell aufgerufen |

**Fazit:** G-Brain im Hintergrund zu haben kostet dich **0 Token**. Du zahlst nur für echte Nutzung.

---

## 7. Praktische Workflows mit G-Brain & Claude Code

### Workflow A: Neue Person erfassen + sofort auffindbar machen

1. Erstelle eine neue Datei in `/personen/[Name].md`
2. Schreibe die Grundinformationen (Name, Rolle, Kontakt)
3. Verwende Wikilinks: `[[Firma Name]]`, `[[Projekt XY]]`
4. **Fertig!** G-Brain indexiert das automatisch beim nächsten Sync

### Workflow B: Projekt starten + mit Kontexten verlinken

1. Neue Datei in `/projekte/[Projektname].md`
2. Strukturiere wie immer: "Aktueller Stand" + "Verlauf"
3. Verlinke Personen und Organisationen: `[[Person]]`, `[[Firma]]`
4. Claude Code kann sofort auf alle verknüpften Infos zugreifen

### Workflow C: Claude Code durchsucht dein PersonalOS

Du schreibst in Claude Code einfach:
- `@memory` → Claude kann dein PersonalOS durchsuchen
- `[[Name]]` → Explizite Wikilinks in deinem Chat
- Frage: *"Wer sind alle Personen im Projekt XY?"* → Claude sucht rekursiv

---

## 8. Wichtige Befehle für die Zukunft
(Diese kannst du der KI einfach so schreiben)

### Setup & Wartung
*   *"Initialisiere ein neues ASE-Projekt namens [Name]"*
*   *"Führe ein G-Brain Sync durch"* (Damit der Index aktualisiert wird)
*   *"Erstelle eine _meta.json für das Projekt [Name]"* (Für die G-Brain Standardisierung)

### Troubleshooting
*   *"Starte G-Brain neu"* (Falls der Service hängt)
*   *"Zeige G-Brain Status"* (Überprüfe, ob alles läuft)
*   *"Führe eine G-Brain Neu-Indexierung durch"* (Falls eine Datei nicht gefunden wird)

---

## 9. Checkliste: Ist alles richtig eingerichtet?

- ✅ PersonalOS existiert: `C:\Users\nikfr\PersonalOS`
- ✅ G-Brain ist installiert: `C:\Users\nikfr\.bun\bin\gbrain.exe`
- ✅ Scheduled Task existiert: `GBrain Server` (Status: Ready)
- ✅ Datenbank existiert: `C:\Users\nikfr\.gbrain\brain.pglite`
- ✅ G-Brain läuft als Hintergrund-Service (kein Terminal nötig)
- ✅ Claude Code hat Zugriff auf G-Brain MCP

Falls eines dieser Punkte "❌" ist, kontaktiere die Support-Anweisung in `regeln/gbrain-integration.md`.

---

## 10. Häufig gestellte Fragen

### F: Wie viel RAM/CPU verbraucht G-Brain?
**A:** Sehr wenig. Im Idle etwa 100-200 MB RAM und praktisch 0% CPU.

### F: Was passiert, wenn ich mich abmelde?
**A:** G-Brain stoppt. Beim nächsten Anmelden startet es automatisch wieder.

### F: Kann ich G-Brain manuell starten/stoppen?
**A:** Ja! Mit diesen Befehlen (in PowerShell):
```powershell
# Starten
Start-ScheduledTask -TaskName "GBrain Server"

# Stoppen (wenn laufend)
Stop-Process -Name gbrain -Force

# Status prüfen
Get-ScheduledTask -TaskName "GBrain Server"
```

### F: Wird mein PersonalOS in die Cloud hochgeladen?
**A:** Nein! G-Brain läuft komplett lokal. Deine Daten verlassen nie deinen Computer.

### F: Warum sollte ich G-Brain als Auto-Start einrichten?
**A:** Weil Claude Code sofort auf deine Daten zugreifen kann, ohne Verzögerung. Es ist wie die "Bibliothek immer offen" haben.

---

## 11. Kontextwechsel: Neuer Chat, neues Projekt

### Wenn du einen neuen Chat in Claude Code startest:
1. G-Brain läuft bereits ✅
2. Claude Code kann sofort dein PersonalOS durchsuchen ✅
3. Alle bisherigen [[Wikilinks]] sind verfügbar ✅
4. Du brauchst nichts zu konfigurieren ✅

### Wenn du ein neues Projekt anfängst:
1. Erstelle eine Datei in `/projekte/[Name].md`
2. Claude Code indexiert es automatisch
3. Nach dem nächsten G-Brain Sync ist es überall suchbar
4. Fertg!

---

*Dieses Dokument wurde zuletzt aktualisiert am 20. Mai 2026. Es beschreibt die aktuelle Systemkonfiguration mit G-Brain Auto-Start und Claude Code Integration.*
