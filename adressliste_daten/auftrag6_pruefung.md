# Nachprüfung bestehender Adressen

Datenformat aller Dateien: Name;Straße;PLZ;Ort;Bundesland;Kategorie;Website;Begründung;Hinweis (9 Felder; ältere Dateien sued/lokal1/lokal2/west/nord/ost.txt haben nur 8 Felder ohne Hinweis – dort Format beibehalten).
Tools: ToolSearch "select:WebSearch". WebFetch/curl blockiert. Verzeichnisse (11880, Gelbe Seiten, Das Örtliche, cylex, northdata) und eigene Websites sind als Quelle erlaubt.

Für jede zu prüfende Zeile mit einer Suche klären:
1. Existiert die Firma/Organisation noch unter dieser Adresse? Falls neue Adresse gefunden: korrigieren. Falls erkennbar aufgelöst/erloschen/insolvent: Zeile löschen.
2. Passt sie zur Zielgruppe (ENDNUTZER mobiler Stromspeicher bei Events: Veranstaltungstechnik, Eventagentur mit eigener Produktion, Zeltverleih, Bühnen, Festival-/Stadtfest-Veranstalter, Catering/Foodtruck)? Händler, Hersteller, reine Konferenz-/Installationsfirmen ohne Eventeinsatz, reine DJs ohne Technikverleih → löschen.
3. Bei Stadtfest-Veranstaltern: veranstaltet die Organisation selbst ein konkretes Fest? Wenn ein anderer Träger: durch diesen ersetzen (mit Adresse) oder löschen.
4. Hinweis aktualisieren: "Geprüft 10/2026: <Ergebnis> (Quelle: …)".
Änderungen direkt per Edit in den Dateien. Kandidaten aus einer Kandidatenliste nur NEU anlegen (in die angegebene Datei), wenn vollständige Adresse gefunden.
HARTES BUDGET laut Auftrag. Am Ende kurz berichten: bestätigt/korrigiert/gelöscht/neu – mit Namen (max. 12 Zeilen).
