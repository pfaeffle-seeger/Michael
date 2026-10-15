# Recherche-Auftrag Runde 3: STADTFEST-VERANSTALTER (Zielkunden EcoFlow PowerRock / Delta Pro Ultra)

Produkt: mobile Akku-Großspeicher (leise, emissionsfrei) als Ersatz für Dieselaggregate – z. B. für Bühnen, Stände, Beleuchtung, Ausschank auf Plätzen ohne ausreichenden Netzanschluss.

## Gesucht: Organisationen, die Stadtfeste, Volksfeste, Weinfeste, Altstadtfeste, Weihnachtsmärkte, Straßenfeste selbst VERANSTALTEN
- Stadtmarketing-GmbHs / Stadtmarketing-Vereine, City-Management
- Kommunale Veranstaltungs-/Event-/Messe-/Tourismus-GmbHs (z. B. in.Stuttgart, Hannover Marketing & Tourismus)
- Werbegemeinschaften, Gewerbe-/Handelsvereine, Interessengemeinschaften Innenstadt, die Feste ausrichten
- Private Veranstalter von Stadt-/Volks-/Weinfesten und Weihnachtsmärkten (Festwirte, Marktveranstalter, Schaustellerverbände als Veranstalter)
- Nur wenn kein anderer Träger: städtisches Kulturamt/Veranstaltungsbüro der Stadtverwaltung (Adresse der Dienststelle)

Ein Eintrag pro Organisation (nicht pro Fest). In "Begründung" die konkreten Feste nennen (z. B. "Veranstaltet Weindorf und Weihnachtsmarkt").

## Nicht aufnehmen
Firmen/Organisationen aus bestehend.txt (gleicher Ordner – zuerst lesen!). Reine Ticket-/Eventportale. Schausteller-Einzelbetriebe.

## Quellen
- Tools: ToolSearch "select:WebSearch". WebFetch/curl sind blockiert – nicht versuchen.
- Adressen aus Impressum der Organisation, Stadtwebsite oder Branchenverzeichnis (alles erlaubt). Quelle im Hinweisfeld nennen.
- Effizient: Suchen wie "Stadtfest Veranstalter Stadtmarketing Impressum <Region>" oder "<Stadt> Stadtfest Veranstalter" liefern oft Name+Adresse direkt im Snippet. Mittelgroße Städte (20.000–300.000 EW) zuerst, Großstädte und Kreisstädte abdecken.
- Nur vollständige Adressen (Straße+Nr., 5-stellige PLZ, Ort), keine Postfächer. NICHTS erfinden.
- HARTES BUDGET: max. so viele WebSearch-Aufrufe wie im Auftrag genannt, dann Datei schreiben und beenden (Budget mit anderen Agenten geteilt).

## Ausgabe
Write-Tool, genannte Datei, ohne Kopfzeile, Semikolon-getrennt, keine Semikolons in Feldern:
Name;Straße Hausnr.;PLZ;Ort;Bundesland;Stadtfest-Veranstalter;Website (falls bekannt);Begründung (welche Feste, max. 12 Wörter);Hinweis (Quelle + Auffälligkeiten)
Kategorie-Spalte immer exakt "Stadtfest-Veranstalter". Bundesland ausgeschrieben.
Antworte am Ende nur: Anzahl Zeilen (1 Satz).
