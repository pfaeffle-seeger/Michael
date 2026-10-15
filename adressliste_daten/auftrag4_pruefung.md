# Nachschärfen: Stadtfest-Veranstalter prüfen

Dateien: neu/r3_nord.txt, neu/r3_nrw.txt, neu/r3_ost.txt, neu/r3_sued.txt, neu/r3_west.txt (Format: Name;Straße;PLZ;Ort;Bundesland;Kategorie;Website;Begründung;Hinweis).

Aufgabe: Prüfe ALLE Zeilen, deren Hinweis/Begründung Unsicherheit ausdrückt (z. B. "prüfen", "nicht belegt", "nicht bestätigt", "unklar", "nur als Kontakt", "veraltet", "evtl", "ggf", "Veranstalterrolle ..."), sowie Zeilen aus der Mitgliederliste "Aktionskreis City- und Stadtmarketing Bayern" in r3_sued.txt.
Für jede solche Zeile mit WebSearch (ToolSearch "select:WebSearch"; WebFetch ist blockiert) klären:
1. Veranstaltet die Organisation selbst ein Stadt-/Volks-/Wein-/Altstadtfest, Weihnachtsmarkt o. ä.? Wenn ja: Begründung mit konkretem Fest aktualisieren, Hinweis auf "Quelle: … – Veranstalterrolle bestätigt" setzen. Wenn ein ANDERER Träger der Veranstalter ist: Zeile durch den echten Veranstalter ersetzen (mit Adresse), falls Adresse auffindbar, sonst Zeile löschen. Wenn gar kein Fest erkennbar: Zeile löschen.
2. Adresse aktuell? Bei Umzug korrigieren.
Budget: max. 35 WebSearch-Aufrufe. Effizient: eine Suche pro Organisation ("<Name> Stadtfest Veranstalter" o. ä.).
Dateien direkt mit Edit/Write ändern (Format beibehalten, 9 Felder, keine Semikolons in Feldern). Nicht geprüfte Zeilen unverändert lassen.
Antworte am Ende kurz: Anzahl bestätigt / korrigiert / ersetzt / gelöscht, je mit Namen (max. 10 Zeilen).
